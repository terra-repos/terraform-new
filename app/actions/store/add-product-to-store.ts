"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyProductCreated } from "./notify-product-created";

type VariantImage = { src: string };

type AddProductToStoreInput = {
  productId: string;
  variantId: string;
  productTitle: string;
  thumbnailImage: string | null;
  variantTitle: string | null;
  variantImages: VariantImage[];
  customPrice: number;
};

type AddProductToStoreResult = {
  success: boolean;
  error?: string;
};

export async function addProductToStore(
  input: AddProductToStoreInput
): Promise<AddProductToStoreResult> {
  console.log("=== addProductToStore called ===");
  console.log("Input:", JSON.stringify(input, null, 2));

  const supabase = await createClient();
  const service = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("User:", user?.id || "NOT AUTHENTICATED");

  if (!user) {
    console.log("ERROR: Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  // Get user's organization
  const { data: orgMember, error: orgError } = await service
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  console.log("Org member lookup:", { orgMember, orgError });

  if (!orgMember) {
    console.log("ERROR: No organization found");
    return { success: false, error: "No organization found" };
  }

  // Get user's drop store
  const { data: store, error: storeError } = await service
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  console.log("Store lookup:", { store, storeError });

  if (!store) {
    console.log("ERROR: No store found");
    return {
      success: false,
      error: "No store found. Please create a store first.",
    };
  }

  console.log("Updating product:", input.productId, "with store_id:", store.id);

  // Update the product with store info and title/thumbnail
  // Also clear deleted_at to make product visible in store
  const { data: productData, error: productError } = await service
    .from("products")
    .update({
      store_id: store.id,
      title: input.productTitle,
      thumbnail_image: input.thumbnailImage,
      drop_approved: false,
      drop_public: false,
      deleted_at: null,
    })
    .eq("id", input.productId)
    .select();

  console.log("Product update result:", { productData, productError });

  if (productError) {
    console.error("Failed to update product:", productError);
    return { success: false, error: "Failed to add product to store" };
  }

  console.log(
    "Updating variant:",
    input.variantId,
    "with drop_custom_price:",
    input.customPrice
  );

  // Update the variant with pricing, images, and visibility
  const { data: variantData, error: variantError } = await service
    .from("product_variants")
    .update({
      title: input.variantTitle,
      images: input.variantImages,
      drop_custom_price: input.customPrice,
      drop_public: false,
      drop_approved: false,
      is_default: true,
    })
    .eq("id", input.variantId)
    .select();

  console.log("Variant update result:", { variantData, variantError });

  if (variantError) {
    console.error("Failed to update variant:", variantError);
    return { success: false, error: "Failed to update variant" };
  }

  // Notify Terra team about new product
  const { data: storeWithName } = await service
    .from("drop_stores")
    .select("store_name")
    .eq("id", store.id)
    .single();

  await notifyProductCreated(
    input.productId,
    storeWithName?.store_name || "Unknown Store",
    user.id
  );

  console.log("=== addProductToStore SUCCESS ===");
  return { success: true };
}
