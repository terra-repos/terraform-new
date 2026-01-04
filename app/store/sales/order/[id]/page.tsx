import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getOrderDetails } from "@/app/actions/store/get-order-details";
import OrderDetail from "./order-detail";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    redirect("/store");
  }

  // 3. Fetch order details
  const order = await getOrderDetails(id, orgMember.organization_id);

  if (!order) {
    notFound();
  }

  // 4. Calculate tracking URL based on environment
  const trackingBaseUrl =
    process.env.NODE_ENV === "development"
      ? "https://tracking-superstar.useterra.com"
      : "https://tracking.useterra.com";

  return <OrderDetail order={order} trackingBaseUrl={trackingBaseUrl} />;
}
