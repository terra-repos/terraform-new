"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UpdateProductInput = {
  title?: string | null;
  slug?: string | null;
  thumbnail_image?: string | null;
  body_html?: string | null;
};

export type UpdateProductResult = {
  success: boolean;
  error?: string;
};

export async function updateProduct(
  productId: string,
  input: UpdateProductInput
): Promise<UpdateProductResult> {
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

  // Verify product belongs to user's store
  const { data: product } = await supabase
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return { success: false, error: "Product not found" };
  }

  // Check slug uniqueness if being updated
  if (input.slug) {
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", input.slug)
      .eq("store_id", store.id)
      .neq("id", productId)
      .single();

    if (existingProduct) {
      return { success: false, error: "A product with this slug already exists" };
    }
  }

  // Update the product
  const { error: updateError } = await supabase
    .from("products")
    .update({
      title: input.title,
      slug: input.slug,
      thumbnail_image: input.thumbnail_image,
      body_html: input.body_html,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (updateError) {
    console.error("Failed to update product:", updateError);
    return { success: false, error: "Failed to update product" };
  }

  revalidatePath(`/store/product/${productId}`);
  revalidatePath("/store");

  return { success: true };
}
