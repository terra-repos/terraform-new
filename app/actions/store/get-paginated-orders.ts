"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPaginatedOrders({
  organizationId,
  page = 1,
  limit = 50,
  searchQuery = "",
  statusFilter = "all",
}: {
  organizationId: string;
  page: number;
  limit: number;
  searchQuery?: string;
  statusFilter?: string;
}) {
  const supabase = await createClient();

  // Calculate offset
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("organization_id", organizationId)
    .eq("order_source", "drop");

  // Apply status filter
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Apply search filter (search in order_number, contact_email)
  if (searchQuery.trim()) {
    query = query.or(
      `order_number.ilike.%${searchQuery}%,contact_email.ilike.%${searchQuery}%`
    );
  }

  // Order and paginate
  query = query
    .order("order_date", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: orders, error, count } = await query;

  if (error) {
    console.error("Error fetching paginated orders:", error);
    return {
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return {
    orders: orders || [],
    totalCount: count || 0,
    totalPages,
    currentPage: page,
  };
}
