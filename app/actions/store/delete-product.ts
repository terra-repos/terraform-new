"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export type DeleteCheckResult = {
  success: boolean;
  error?: string;
  cartsCount?: number;
  dropOrdersCount?: number;
  canDelete?: boolean;
};

export type DeleteProductResult = {
  success: boolean;
  error?: string;
};

// Check what would be affected by deletion
export async function checkProductDeletion(
  productId: string,
  mode: "from_store" | "completely"
): Promise<DeleteCheckResult> {
  const supabase = await createClient();
  const service = createServiceClient();

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
  const { data: product } = await service
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return { success: false, error: "Product not found" };
  }

  // Get all variant IDs for this product
  const { data: variants } = await service
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  const variantIds = variants?.map((v) => v.id) || [];

  // Check user_carts for any items with these variants
  let cartsCount = 0;
  if (variantIds.length > 0) {
    const { count } = await service
      .from("user_carts")
      .select("*", { count: "exact", head: true })
      .in("variant_id", variantIds);
    cartsCount = count || 0;
  }

  // For complete deletion, also check drop orders
  let dropOrdersCount = 0;
  if (mode === "completely" && variantIds.length > 0) {
    // Get order items with these variants that belong to drop orders
    const { data: orderItems } = await service
      .from("order_items")
      .select("id, order_id")
      .in("variant_id", variantIds);

    if (orderItems && orderItems.length > 0) {
      const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];

      // Check how many of these orders are drop orders
      const { count } = await service
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("id", orderIds)
        .eq("order_source", "drop");

      dropOrdersCount = count || 0;
    }
  }

  return {
    success: true,
    cartsCount,
    dropOrdersCount,
    canDelete: mode === "from_store" || dropOrdersCount === 0,
  };
}

// Remove product from store (just sets store_id to null)
export async function removeProductFromStore(
  productId: string,
  clearCarts: boolean = false
): Promise<DeleteProductResult> {
  const supabase = await createClient();
  const service = createServiceClient();

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
  const { data: product } = await service
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return { success: false, error: "Product not found" };
  }

  // If clearing carts, remove all cart items with this product's variants
  if (clearCarts) {
    const { data: variants } = await service
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    const variantIds = variants?.map((v) => v.id) || [];

    if (variantIds.length > 0) {
      await service.from("user_carts").delete().in("variant_id", variantIds);
    }
  }

  // Set store_id to null (removes from store but keeps product)
  const { error: updateError } = await service
    .from("products")
    .update({
      store_id: null,
      drop_public: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (updateError) {
    console.error("Failed to remove product from store:", updateError);
    return { success: false, error: "Failed to remove product from store" };
  }

  revalidatePath("/store");

  return { success: true };
}

// Delete product completely (also deletes the design)
export async function deleteProductCompletely(
  productId: string,
  clearCarts: boolean = false
): Promise<DeleteProductResult> {
  const supabase = await createClient();
  const service = createServiceClient();

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
  const { data: product } = await service
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return { success: false, error: "Product not found" };
  }

  // Get all variant IDs for this product
  const { data: variants } = await service
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);

  const variantIds = variants?.map((v) => v.id) || [];

  // Check for drop orders - block deletion if any exist
  if (variantIds.length > 0) {
    const { data: orderItems } = await service
      .from("order_items")
      .select("id, order_id")
      .in("variant_id", variantIds);

    if (orderItems && orderItems.length > 0) {
      const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];

      const { count: dropOrdersCount } = await service
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("id", orderIds)
        .eq("order_source", "drop");

      if (dropOrdersCount && dropOrdersCount > 0) {
        return {
          success: false,
          error: `Cannot delete product: it has ${dropOrdersCount} drop order(s)`,
        };
      }
    }
  }

  // If clearing carts, remove all cart items with this product's variants
  if (clearCarts && variantIds.length > 0) {
    await service.from("user_carts").delete().in("variant_id", variantIds);
  }

  // Delete associated design (user_generated_products)
  await service
    .from("user_generated_products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("terra_product_id", productId);

  // Soft delete the product
  const { error: deleteError } = await service
    .from("products")
    .update({
      deleted_at: new Date().toISOString(),
      store_id: null,
      drop_public: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (deleteError) {
    console.error("Failed to delete product:", deleteError);
    return { success: false, error: "Failed to delete product" };
  }

  revalidatePath("/store");

  return { success: true };
}
