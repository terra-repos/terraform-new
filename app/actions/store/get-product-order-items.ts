"use server";

import { createClient } from "@/lib/supabase/server";

type OrderItemWithRelations = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit: number | null;
  created_at: string | null;
  orders: {
    id: string;
    order_number: string;
    order_date: string;
    contact_email: string;
    total_cost: number;
    status: string;
  };
  product_variants: {
    id: string;
    title: string;
    sku: string;
  };
};

export async function getProductOrderItems({
  productId,
  organizationId,
  page = 1,
  limit = 50,
  searchQuery = "",
  startDate,
  endDate,
}: {
  productId: string;
  organizationId: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  orderItems: OrderItemWithRelations[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const supabase = await createClient();

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the query
  let query = supabase
    .from("order_items")
    .select(
      `
      id,
      quantity,
      unit_price,
      total_price,
      profit,
      created_at,
      orders!inner (
        id,
        order_number,
        order_date,
        contact_email,
        total_cost,
        status,
        organization_id,
        order_source
      ),
      product_variants!inner (
        id,
        title,
        sku,
        products!inner (
          id
        )
      )
    `,
      { count: "exact" }
    )
    .eq("product_variants.products.id", productId)
    .eq("orders.organization_id", organizationId)
    .eq("orders.order_source", "drop")
    .not("orders.status", "in", "(cancelled,on_hold,draft)");

  // Apply search filter if provided
  if (searchQuery) {
    query = query.or(
      `orders.order_number.ilike.%${searchQuery}%,orders.contact_email.ilike.%${searchQuery}%`
    );
  }

  // Apply date range filters if provided
  if (startDate) {
    query = query.gte("orders.order_date", startDate.toISOString());
  }
  if (endDate) {
    query = query.lte("orders.order_date", endDate.toISOString());
  }

  // Apply ordering and pagination
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: orderItems, error, count } = await query;

  if (error) {
    console.error("Error fetching product order items:", error);
    return {
      orderItems: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }

  // Transform the data to match our expected type
  const transformedOrderItems: OrderItemWithRelations[] = (orderItems || []).map(
    (item) => ({
      id: item.id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      profit: item.profit,
      created_at: item.created_at,
      orders: Array.isArray(item.orders) ? item.orders[0] : item.orders,
      product_variants: Array.isArray(item.product_variants)
        ? item.product_variants[0]
        : item.product_variants,
    })
  );

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    orderItems: transformedOrderItems,
    totalCount,
    totalPages,
    currentPage: page,
  };
}
