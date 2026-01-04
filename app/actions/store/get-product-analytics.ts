"use server";

import { createClient } from "@/lib/supabase/server";

type ChartDataItem = {
  id: string;
  total_price: number;
  profit: number | null;
  order_date: string;
};

export async function getProductAnalytics(
  productId: string,
  organizationId: string
): Promise<{
  product: {
    id: string;
    title: string;
    thumbnail_image: string | null;
  };
  chartData: ChartDataItem[];
} | null> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return null;
  }

  // Get user's store
  const { data: store } = await supabase
    .from("drop_stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!store) {
    console.error("No store found for user");
    return null;
  }

  // Get the product info directly
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, title, thumbnail_image, store_id")
    .eq("id", productId)
    .eq("store_id", store.id)
    .is("deleted_at", null)
    .single();

  if (productError || !product) {
    console.error("Error fetching product:", productError);
    return null;
  }

  // Fetch lightweight order items data for chart aggregation only
  // Individual order items will be fetched with pagination via get-product-order-items.ts
  const { data: chartData, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      total_price,
      profit,
      created_at,
      orders!inner (
        id,
        order_date,
        organization_id,
        order_source,
        status
      ),
      product_variants!inner (
        id,
        products!inner (
          id
        )
      )
    `
    )
    .eq("product_variants.products.id", productId)
    .eq("orders.organization_id", organizationId)
    .eq("orders.order_source", "drop")
    .not("orders.status", "in", "(cancelled,on_hold,draft)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching product chart data:", error);
  }

  return {
    product: {
      id: product.id,
      title: product.title,
      thumbnail_image: product.thumbnail_image,
    },
    chartData: (chartData || []).map((item) => ({
      id: item.id,
      total_price: item.total_price,
      profit: item.profit,
      order_date: Array.isArray(item.orders)
        ? item.orders[0].order_date
        : item.orders.order_date,
    })),
  };
}
