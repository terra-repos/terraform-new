"use server";

import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

type FinalizeDesignInput = {
  productTitle: string;
  referenceImages: string[];
  customizations: string[];
  dimensions: { length: string; width: string; height: string };
  customDimensions: { name: string; value: string }[];
  notes: string;
  imageUrl: string;
  messages: unknown[];
  tempCatalogItemId?: string | null;
};

type FinalizeDesignResult =
  | { success: true; designId: string; cartId: string }
  | { success: false; error: string };

type NormalizedDimension = {
  key: string;
  name: string;
  value: string;
};

type ClaudeProcessingResult = {
  normalizedDimensions: NormalizedDimension[];
  estimatedSamplePrice: number;
};

async function processWithClaude(data: {
  productTitle: string;
  customizations: string[];
  dimensions: { length: string; width: string; height: string };
  customDimensions: { name: string; value: string }[];
  notes: string;
}): Promise<ClaudeProcessingResult> {
  const prompt = `You are a product data processor. Given the following product details, you need to:

1. Normalize the custom dimension names to snake_case keys
2. Estimate a sample price based on the product complexity

Product Title: ${data.productTitle}

Customizations:
${data.customizations.map((c) => `- ${c}`).join("\n") || "None"}

Standard Dimensions:
- Length: ${data.dimensions.length || "Not specified"}
- Width: ${data.dimensions.width || "Not specified"}
- Height: ${data.dimensions.height || "Not specified"}

Custom Dimensions:
${data.customDimensions.map((d) => `- ${d.name}: ${d.value}`).join("\n") || "None"}

Notes: ${data.notes || "None"}

Return a JSON object with exactly this structure:
{
  "normalizedDimensions": [
    { "key": "snake_case_key", "name": "Original Name", "value": "the value" }
  ],
  "estimatedSamplePrice": 150
}

For normalizedDimensions:
- Convert names like "Seat Height" to "seat_height"
- Convert names like "Arm Rest Width" to "arm_rest_width"
- Keep the original name and value intact

For estimatedSamplePrice:
- Base price is $100 for simple items
- Add $25-50 for each complex customization
- Add $50-100 for premium materials mentioned
- Add $25 for each custom dimension beyond standard L/W/H
- Range should typically be $100-500 for most items

Return ONLY the JSON object, no markdown or explanation.`;

  try {
    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt,
    });

    const parsed = JSON.parse(result.text);
    return {
      normalizedDimensions: parsed.normalizedDimensions || [],
      estimatedSamplePrice: parsed.estimatedSamplePrice || 100,
    };
  } catch (error) {
    console.error("Claude processing error:", error);
    // Fallback: manually normalize and use default price
    const normalizedDimensions = data.customDimensions.map((d) => ({
      key: d.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, ""),
      name: d.name,
      value: d.value,
    }));

    return {
      normalizedDimensions,
      estimatedSamplePrice: 100,
    };
  }
}

export async function finalizeDesign(
  data: FinalizeDesignInput
): Promise<FinalizeDesignResult> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch catalog item if tempCatalogItemId is provided
  let taobaoUrl: string | null = null;
  if (data.tempCatalogItemId) {
    const { data: catalogItem } = await supabase
      .from("temp_catalog_items")
      .select("taobao_url")
      .eq("id", data.tempCatalogItemId)
      .single();

    if (catalogItem?.taobao_url) {
      taobaoUrl = catalogItem.taobao_url;
    }
  }

  // Process with Claude to normalize dimensions and estimate price
  const { normalizedDimensions, estimatedSamplePrice } = await processWithClaude(
    {
      productTitle: data.productTitle,
      customizations: data.customizations,
      dimensions: data.dimensions,
      customDimensions: data.customDimensions,
      notes: data.notes,
    }
  );

  // Build product_data JSON with normalized dimensions and price
  const productData = {
    customizations: data.customizations,
    dimensions: data.dimensions,
    customDimensions: normalizedDimensions,
    notes: data.notes,
    referenceImages: data.referenceImages,
    estimatedSamplePrice,
    ...(taobaoUrl && { taobaoUrl }), // Only include if it exists
  };

  // Insert into user_generated_products
  const { data: designRecord, error: designError } = await supabase
    .from("user_generated_products")
    .insert({
      user_id: user.id,
      product_name: data.productTitle,
      image_url: data.imageUrl || data.referenceImages[0] || null,
      messages: data.messages,
      product_data: [productData],
    })
    .select("id")
    .single();

  if (designError || !designRecord) {
    console.error("Failed to insert design:", designError);
    return { success: false, error: "Failed to save design" };
  }

  // Insert into user_carts
  const { data: cartRecord, error: cartError } = await supabase
    .from("user_carts")
    .insert({
      user_id: user.id,
      design_id: designRecord.id,
      quantity: 1,
      source: "design_chat",
    })
    .select("id")
    .single();

  if (cartError || !cartRecord) {
    console.error("Failed to insert cart item:", cartError);
    return { success: false, error: "Failed to add to cart" };
  }

  return {
    success: true,
    designId: designRecord.id,
    cartId: cartRecord.id,
  };
}
