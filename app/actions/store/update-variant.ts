"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UpdateVariantInput = {
  title?: string | null;
  drop_custom_price?: number | null;
  drop_description?: string | null;
  drop_public?: boolean;
  images?: { src: string }[] | null;
};

export type UpdateVariantResult = {
  success: boolean;
  error?: string;
};

export async function updateVariant(
  variantId: string,
  input: UpdateVariantInput
): Promise<UpdateVariantResult> {
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

  // Get variant with product info to verify ownership
  const { data: variant } = await supabase
    .from("product_variants")
    .select("id, product_id, ocean_shipping_cost, price, products!inner(store_id)")
    .eq("id", variantId)
    .single();

  if (!variant) {
    return { success: false, error: "Variant not found" };
  }

  const productStoreId = (variant.products as { store_id: string | null })?.store_id;
  if (productStoreId !== store.id) {
    return { success: false, error: "Variant not found" };
  }

  // Validate pricing if being set
  if (input.drop_custom_price !== undefined && input.drop_custom_price !== null) {
    const basePrice = (variant.ocean_shipping_cost || 0) + (variant.price || 0);
    if (input.drop_custom_price <= basePrice) {
      return {
        success: false,
        error: `Your price must be higher than the base price ($${basePrice.toFixed(2)})`,
      };
    }
  }

  // Update the variant
  const { error: updateError } = await supabase
    .from("product_variants")
    .update({
      title: input.title,
      drop_custom_price: input.drop_custom_price,
      drop_description: input.drop_description,
      drop_public: input.drop_public,
      images: input.images,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variantId);

  if (updateError) {
    console.error("Failed to update variant:", updateError);
    return { success: false, error: "Failed to update variant" };
  }

  revalidatePath(`/store/product/${variant.product_id}`);
  revalidatePath("/store");

  return { success: true };
}
