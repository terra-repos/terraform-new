"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notifyVariantCreated } from "./notify-variant-created";

export type CreateVariantInput = {
  product_id: string;
  title?: string | null;
  drop_custom_price?: number | null;
  drop_description?: string | null;
  drop_public?: boolean;
  images?: { src: string }[] | null;
  // Copy pricing from template variant
  price: number | null;
  ocean_shipping_cost: number | null;
  air_shipping_cost: number | null;
};

export type CreateVariantResult = {
  success: boolean;
  error?: string;
  variantId?: string;
};

export async function createVariant(
  input: CreateVariantInput
): Promise<CreateVariantResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's store
  const { data: store } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return { success: false, error: "No store found" };
  }

  // Verify product ownership
  const { data: product } = await supabase
    .from("products")
    .select("id, store_id")
    .eq("id", input.product_id)
    .eq("store_id", store.id)
    .is("deleted_at", null)
    .single();

  if (!product) {
    return { success: false, error: "Product not found" };
  }

  // Validate pricing if being set
  if (input.drop_custom_price !== undefined && input.drop_custom_price !== null) {
    const basePrice = (input.ocean_shipping_cost || 0) + (input.price || 0);
    if (input.drop_custom_price <= basePrice) {
      return {
        success: false,
        error: `Your price must be higher than the base price ($${basePrice.toFixed(2)})`,
      };
    }
  }

  // Create the variant
  const { data: newVariant, error: createError } = await supabase
    .from("product_variants")
    .insert({
      product_id: input.product_id,
      title: input.title,
      price: input.price,
      ocean_shipping_cost: input.ocean_shipping_cost,
      air_shipping_cost: input.air_shipping_cost,
      drop_custom_price: input.drop_custom_price,
      drop_description: input.drop_description,
      drop_public: input.drop_public || false,
      drop_approved: false, // New variants need approval
      images: input.images,
    })
    .select("id")
    .single();

  if (createError || !newVariant) {
    console.error("Failed to create variant:", createError);
    return { success: false, error: "Failed to create variant" };
  }

  revalidatePath(`/store/product/${input.product_id}`);
  revalidatePath("/store");

  // Get product title for notification
  const { data: productData } = await supabase
    .from("products")
    .select("title")
    .eq("id", input.product_id)
    .single();

  // Notify Terra team about new variant
  await notifyVariantCreated(
    input.product_id,
    input.title,
    productData?.title || "Unknown Product",
    user.id
  );

  return { success: true, variantId: newVariant.id };
}
