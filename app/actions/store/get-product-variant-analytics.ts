"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProductVariantAnalytics({
  productId,
  organizationId,
  startDate,
  endDate,
  topN = 3,
}: {
  productId: string;
  organizationId: string;
  startDate?: Date;
  endDate?: Date;
  topN?: number;
}) {
  const supabase = await createClient();

  // Step 1: Fetch lightweight order items data filtered by product and date range
  let query = supabase
    .from("order_items")
    .select(
      `
      id,
      variant_id,
      quantity,
      profit,
      total_price,
      orders!inner (
        id,
        order_date,
        organization_id,
        order_source,
        status
      )
    `
    )
    .eq("orders.organization_id", organizationId)
    .eq("orders.order_source", "drop")
    .not("orders.status", "in", "(cancelled,on_hold,draft)");

  // Filter by product through variant relationship
  // We'll need to join through variants to filter by product_id
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select(
      `
      id,
      variant_id,
      quantity,
      profit,
      total_price,
      orders!inner (
        id,
        order_date,
        organization_id,
        order_source,
        status
      ),
      product_variants!inner (
        id,
        product_id
      )
    `
    )
    .eq("product_variants.product_id", productId)
    .eq("orders.organization_id", organizationId)
    .eq("orders.order_source", "drop")
    .not("orders.status", "in", "(cancelled,on_hold,draft)");

  if (orderItemsError) {
    console.error("Error fetching order items:", orderItemsError);
    return { topVariants: [] };
  }

  if (!orderItems || orderItems.length === 0) {
    return { topVariants: [] };
  }

  // Filter by date range if provided
  let filteredItems = orderItems;
  if (startDate || endDate) {
    filteredItems = orderItems.filter((item) => {
      const orderDate = new Date(item.orders.order_date);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });
  }

  // Step 2: Group by variant_id using reduce()
  const variantStats = filteredItems.reduce(
    (acc, item) => {
      const vid = item.variant_id;
      if (!acc[vid]) {
        acc[vid] = {
          variant_id: vid,
          total_units_sold: 0,
          order_ids: new Set<string>(),
          total_profit: 0,
          total_revenue: 0,
        };
      }
      acc[vid].total_units_sold += item.quantity;
      acc[vid].order_ids.add(item.orders.id);
      acc[vid].total_profit += item.profit || 0;
      acc[vid].total_revenue += item.total_price || 0;
      return acc;
    },
    {} as Record<
      string,
      {
        variant_id: string;
        total_units_sold: number;
        order_ids: Set<string>;
        total_profit: number;
        total_revenue: number;
      }
    >
  );

  // Convert to array and calculate order_count
  const variantArray = Object.values(variantStats).map((v) => ({
    variant_id: v.variant_id,
    total_units_sold: v.total_units_sold,
    order_count: v.order_ids.size,
    total_profit: v.total_profit,
    total_revenue: v.total_revenue,
  }));

  // Sort by total_units_sold DESC
  variantArray.sort((a, b) => b.total_units_sold - a.total_units_sold);

  // Get top N variants
  const topVariantIds = variantArray.slice(0, topN).map((v) => v.variant_id);

  if (topVariantIds.length === 0) {
    return { topVariants: [] };
  }

  // Step 3: Fetch variant details and option values
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      title,
      option_values (
        id,
        value,
        options (
          id,
          option_type
        )
      )
    `
    )
    .in("id", topVariantIds);

  if (variantsError) {
    console.error("Error fetching variants:", variantsError);
    return { topVariants: [] };
  }

  // Step 4: Combine stats with variant details
  const topVariants = topVariantIds
    .map((vid) => {
      const stats = variantArray.find((v) => v.variant_id === vid);
      const variant = variants?.find((v) => v.id === vid);

      if (!stats || !variant) return null;

      return {
        variant_id: variant.id,
        variant_title: variant.title,
        total_units_sold: stats.total_units_sold,
        order_count: stats.order_count,
        total_profit: stats.total_profit,
        total_revenue: stats.total_revenue,
        option_values: (variant.option_values || []).map((ov: {
          id: string;
          value: string;
          options: { id: string; option_type: string };
        }) => ({
          optionType: ov.options.option_type,
          value: ov.value,
        })),
      };
    })
    .filter((v) => v !== null);

  return { topVariants };
}
