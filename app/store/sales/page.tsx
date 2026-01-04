import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SalesDashboard from "./sales-dashboard";

export default async function SalesPage() {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Get organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!orgMember) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">No organization found</p>
      </div>
    );
  }

  const organizationId = orgMember.organization_id;

  // 3. Fetch orders with all related data
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
    .order("order_date", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load orders</p>
      </div>
    );
  }

  return <SalesDashboard orders={orders || []} />;
}
