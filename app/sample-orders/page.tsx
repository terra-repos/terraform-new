import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SampleOrdersList from "./sample-orders-list";

type SampleOrderItem = {
  id: string;
  status: string;
  quantity: number;
  created_at: string;
  product_title: string;
  product_image: string | null;
};

async function getSampleOrderItems(): Promise<SampleOrderItem[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's organization
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!orgMember) {
    return [];
  }

  // Fetch order items for terraform orders in user's org
  // Join through orders -> order_items -> product_variants -> products
  const { data: orderItems, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      status,
      quantity,
      created_at,
      orders!inner (
        id,
        order_source,
        organization_id
      ),
      product_variants!inner (
        id,
        title,
        images,
        products!inner (
          id,
          title,
          thumbnail_image
        )
      )
    `
    )
    .eq("orders.organization_id", orgMember.organization_id)
    .eq("orders.order_source", "terraform")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch sample order items:", error);
    return [];
  }

  // Transform to simpler structure for the UI
  return (orderItems || []).map((item) => {
    const variant = item.product_variants as unknown as {
      id: string;
      title: string;
      images: { src: string }[] | null;
      products: { id: string; title: string; thumbnail_image: string | null };
    };

    const product = variant.products;

    // Get image from variant images or product thumbnail
    const productImage =
      variant.images?.[0]?.src || product.thumbnail_image || null;

    return {
      id: item.id,
      status: item.status as string,
      quantity: item.quantity,
      created_at: item.created_at || new Date().toISOString(),
      product_title: product.title || variant.title || "Untitled",
      product_image: productImage,
    };
  });
}

export default async function SampleOrdersPage() {
  const items = await getSampleOrderItems();

  return <SampleOrdersList items={items} />;
}
