"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrderDetails(orderId: string, organizationId: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        product_variants (
          *,
          products (
            *
          ),
          option_values (
            id,
            value,
            option_id,
            options (
              id,
              option_type
            )
          )
        )
      ),
      drop_session_coupon_usage (
        *,
        drop_store_coupons (
          *
        )
      )
    `
    )
    .eq("id", orderId)
    .eq("organization_id", organizationId)
    .eq("order_source", "drop")
    .single();

  if (error) {
    console.error("Error fetching order details:", error);
    return null;
  }

  return order;
}
