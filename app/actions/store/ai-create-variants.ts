"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { type CreateVariantsInput } from "@/app/api/store/ai-variants/route";

type VariantImage = { src: string };

type CreatedVariant = {
  id: string;
  title: string | null;
  images: VariantImage[];
  option_values: Record<string, string>;
};

type ExecuteAIVariantOperationsResult = {
  success: boolean;
  error?: string;
  createdVariants?: CreatedVariant[];
};

export async function executeAIVariantOperations(
  productId: string,
  operations: CreateVariantsInput,
  variantImages?: Record<string, string> // Map of variant title to image URL
): Promise<ExecuteAIVariantOperationsResult> {
  console.log("=== executeAIVariantOperations called ===");
  console.log("Product ID:", productId);
  console.log("Operations:", JSON.stringify(operations, null, 2));

  const supabase = await createClient();
  const service = createServiceClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify user owns the product (through store ownership)
  const { data: store } = await service
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return { success: false, error: "No store found" };
  }

  const { data: product } = await service
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .eq("store_id", store.id)
    .single();

  if (!product) {
    return { success: false, error: "Product not found or access denied" };
  }

  try {
    // Step 1: Process options (create new ones, get IDs for existing)
    const optionIdMap: Record<string, string> = {};

    // Get existing options for this product
    const { data: existingOptions } = await service
      .from("options")
      .select("id, option_type, position")
      .eq("product_id", productId);

    const existingOptionsMap = new Map(
      (existingOptions || []).map((o) => [o.option_type.toLowerCase(), o])
    );

    let maxPosition = Math.max(0, ...(existingOptions || []).map((o) => o.position || 0));

    for (const optionOp of operations.options) {
      const optionTypeLower = optionOp.option_type.toLowerCase();
      const existing = existingOptionsMap.get(optionTypeLower);

      if (optionOp.action === "update" && optionOp.id) {
        // Use existing option
        optionIdMap[optionOp.option_type] = optionOp.id;
      } else if (existing) {
        // Option already exists, use it
        optionIdMap[optionOp.option_type] = existing.id;
      } else {
        // Create new option
        maxPosition++;
        const { data: newOption, error: optionError } = await service
          .from("options")
          .insert({
            product_id: productId,
            option_type: optionOp.option_type,
            position: maxPosition,
          })
          .select()
          .single();

        if (optionError || !newOption) {
          console.error("Failed to create option:", optionError);
          return { success: false, error: `Failed to create option: ${optionOp.option_type}` };
        }

        optionIdMap[optionOp.option_type] = newOption.id;
        console.log(`Created option: ${optionOp.option_type} with ID: ${newOption.id}`);
      }
    }

    // Step 2: Create variants
    const variantsToInsert = operations.variants.map((v) => {
      const imageUrl = variantImages?.[v.title];
      const images: VariantImage[] = imageUrl ? [{ src: imageUrl }] : [];

      return {
        product_id: productId,
        title: v.title,
        images,
        drop_approved: false,
        drop_public: false,
        drop_custom_price: null,
        is_default: false,
        price: null,
        ocean_shipping_cost: null,
        air_shipping_cost: null,
      };
    });

    const { data: createdVariants, error: variantsError } = await service
      .from("product_variants")
      .insert(variantsToInsert)
      .select();

    if (variantsError || !createdVariants) {
      console.error("Failed to create variants:", variantsError);
      return { success: false, error: "Failed to create variants" };
    }

    console.log(`Created ${createdVariants.length} variants`);

    // Step 3: Create option values for each variant
    const optionValuesToInsert: {
      option_id: string;
      variant_id: string;
      product_id: string;
      value: string;
      position: number;
    }[] = [];

    // Get existing option values to determine positions
    const { data: existingOptionValues } = await service
      .from("option_values")
      .select("option_id, value, position")
      .eq("product_id", productId);

    // Track max position per option
    const optionPositions: Record<string, number> = {};
    for (const ov of existingOptionValues || []) {
      if (!ov.option_id) continue;
      const current = optionPositions[ov.option_id] ?? 0;
      optionPositions[ov.option_id] = Math.max(current, ov.position || 0);
    }

    // Track which values already exist per option
    const existingValuesMap: Record<string, Set<string>> = {};
    for (const ov of existingOptionValues || []) {
      if (!ov.option_id) continue;
      if (!existingValuesMap[ov.option_id]) {
        existingValuesMap[ov.option_id] = new Set();
      }
      existingValuesMap[ov.option_id].add(ov.value?.toLowerCase() || "");
    }

    for (let i = 0; i < createdVariants.length; i++) {
      const variant = createdVariants[i];
      const variantSpec = operations.variants[i];

      for (const [optionType, value] of Object.entries(variantSpec.option_values)) {
        const optionId = optionIdMap[optionType];
        if (!optionId) {
          console.error(`No option ID found for type: ${optionType}`);
          continue;
        }

        // Check if this value already exists for this option
        const existingValues = existingValuesMap[optionId];
        const valueExists = existingValues?.has(value.toLowerCase());

        if (!valueExists) {
          // Increment position for this option
          optionPositions[optionId] = (optionPositions[optionId] ?? 0) + 1;

          // Track that we've now added this value
          if (!existingValuesMap[optionId]) {
            existingValuesMap[optionId] = new Set();
          }
          existingValuesMap[optionId].add(value.toLowerCase());
        }

        optionValuesToInsert.push({
          option_id: optionId,
          variant_id: variant.id,
          product_id: productId,
          value,
          position: optionPositions[optionId],
        });
      }
    }

    if (optionValuesToInsert.length > 0) {
      const { error: optionValuesError } = await service
        .from("option_values")
        .insert(optionValuesToInsert);

      if (optionValuesError) {
        console.error("Failed to create option values:", optionValuesError);
        return { success: false, error: "Failed to create option values" };
      }

      console.log(`Created ${optionValuesToInsert.length} option values`);
    }

    // Prepare response with created variants info
    const result: CreatedVariant[] = createdVariants.map((v, i) => ({
      id: v.id,
      title: v.title,
      images: v.images as VariantImage[],
      option_values: operations.variants[i].option_values,
    }));

    console.log("=== executeAIVariantOperations SUCCESS ===");
    return { success: true, createdVariants: result };
  } catch (error) {
    console.error("Unexpected error in executeAIVariantOperations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
