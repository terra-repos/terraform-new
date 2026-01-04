"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrders(organizationId: string) {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
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
    .eq("organization_id", organizationId)
    .eq("order_source", "drop")
    .not("status", "in", "(cancelled,on_hold,draft)")
    .order("order_date", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return orders || [];
}
