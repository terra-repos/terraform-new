"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export type VariantDeleteCheckResult = {
  success: boolean;
  error?: string;
  cartsCount?: number;
  ordersCount?: number;
  canDelete?: boolean;
};

export type DeleteVariantResult = {
  success: boolean;
  error?: string;
};

// Check what would be affected by variant deletion
export async function checkVariantDeletion(
  variantId: string
): Promise<VariantDeleteCheckResult> {
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

  // Get variant and verify it belongs to user's store
  const { data: variant } = await service
    .from("product_variants")
    .select("id, product_id, products!inner(store_id)")
    .eq("id", variantId)
    .single();

  if (!variant) {
    return { success: false, error: "Variant not found" };
  }

  const productStoreId = (variant.products as { store_id: string | null })?.store_id;
  if (productStoreId !== store.id) {
    return { success: false, error: "Variant not found" };
  }

  // Check user_carts for any items with this variant
  const { count: cartsCount } = await service
    .from("user_carts")
    .select("*", { count: "exact", head: true })
    .eq("variant_id", variantId);

  // Check order_items for any orders with this variant
  const { data: orderItems } = await service
    .from("order_items")
    .select("id, order_id")
    .eq("variant_id", variantId);

  let ordersCount = 0;
  if (orderItems && orderItems.length > 0) {
    const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];

    // Check how many of these orders are drop orders (from the store)
    const { count } = await service
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("id", orderIds)
      .eq("order_source", "drop");

    ordersCount = count || 0;
  }

  return {
    success: true,
    cartsCount: cartsCount || 0,
    ordersCount,
    canDelete: ordersCount === 0,
  };
}

// Delete variant (soft delete)
export async function deleteVariant(
  variantId: string,
  clearCarts: boolean = false
): Promise<DeleteVariantResult> {
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

  // Get variant and verify it belongs to user's store
  const { data: variant } = await service
    .from("product_variants")
    .select("id, product_id, products!inner(store_id)")
    .eq("id", variantId)
    .single();

  if (!variant) {
    return { success: false, error: "Variant not found" };
  }

  const productStoreId = (variant.products as { store_id: string | null })?.store_id;
  if (productStoreId !== store.id) {
    return { success: false, error: "Variant not found" };
  }

  // Check for orders - block deletion if any exist
  const { data: orderItems } = await service
    .from("order_items")
    .select("id, order_id")
    .eq("variant_id", variantId);

  if (orderItems && orderItems.length > 0) {
    const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];

    const { count: ordersCount } = await service
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("id", orderIds)
      .eq("order_source", "drop");

    if (ordersCount && ordersCount > 0) {
      return {
        success: false,
        error: `Cannot delete variant: it has ${ordersCount} order(s)`,
      };
    }
  }

  // If clearing carts, remove cart items with this variant
  if (clearCarts) {
    await service.from("user_carts").delete().eq("variant_id", variantId);
  }

  // Soft delete the variant
  const { error: deleteError } = await service
    .from("product_variants")
    .update({
      deleted_at: new Date().toISOString(),
      drop_public: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", variantId);

  if (deleteError) {
    console.error("Failed to delete variant:", deleteError);
    return { success: false, error: "Failed to delete variant" };
  }

  // Also delete associated option_values
  await service.from("option_values").delete().eq("variant_id", variantId);

  revalidatePath("/store");

  return { success: true };
}
