import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { subDays } from "date-fns";
import { getProductAnalytics } from "@/app/actions/store/get-product-analytics";
import { getProductOrderItems } from "@/app/actions/store/get-product-order-items";
import { getProductVariantAnalytics } from "@/app/actions/store/get-product-variant-analytics";
import ProductAnalyticsDetail from "./_components/product-analytics-detail";

export default async function ProductAnalyticsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Auth check
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

  // 3. Fetch analytics data from 3 server actions in parallel
  const startDate = subDays(new Date(), 30);
  const endDate = new Date();

  const [productData, orderItemsData, variantData] = await Promise.all([
    getProductAnalytics(id, orgMember.organization_id),
    getProductOrderItems({
      productId: id,
      organizationId: orgMember.organization_id,
      page: 1,
      limit: 50,
      startDate,
      endDate,
    }),
    getProductVariantAnalytics({
      productId: id,
      organizationId: orgMember.organization_id,
      startDate,
      endDate,
      topN: 3,
    }),
  ]);

  if (!productData || !productData.product) {
    notFound();
  }

  return (
    <ProductAnalyticsDetail
      product={productData.product}
      chartData={productData.chartData}
      initialOrderItems={orderItemsData.orderItems}
      initialPagination={{
        totalCount: orderItemsData.totalCount,
        totalPages: orderItemsData.totalPages,
        currentPage: orderItemsData.currentPage,
      }}
      initialVariants={variantData.topVariants}
      productId={id}
      organizationId={orgMember.organization_id}
    />
  );
}
