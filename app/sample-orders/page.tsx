import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SampleOrdersList from "./sample-orders-list";

export type SampleOrderItem = {
  id: string;
  status: string;
  quantity: number;
  created_at: string;
  product_title: string;
  product_image: string | null;
  order_id: string;
  order_number: string;
  order_created_at: string;
};

export type SampleOrder = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  items: SampleOrderItem[];
};

async function getSampleOrderData(): Promise<{
  items: SampleOrderItem[];
  orders: SampleOrder[];
}> {
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
    return { items: [], orders: [] };
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
        order_number,
        order_source,
        organization_id,
        status,
        created_at
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
    return { items: [], orders: [] };
  }

  // Transform to item structure
  const items: SampleOrderItem[] = (orderItems || []).map((item) => {
    const order = item.orders as unknown as {
      id: string;
      order_number: string;
      status: string;
      created_at: string;
    };

    const variant = item.product_variants as unknown as {
      id: string;
      title: string;
      images: { src: string }[] | null;
      products: { id: string; title: string; thumbnail_image: string | null };
    };

    const product = variant.products;
    const productImage =
      variant.images?.[0]?.src || product.thumbnail_image || null;

    return {
      id: item.id,
      status: item.status as string,
      quantity: item.quantity,
      created_at: item.created_at || new Date().toISOString(),
      product_title: product.title || variant.title || "Untitled",
      product_image: productImage,
      order_id: order.id,
      order_number: order.order_number || "Unknown",
      order_created_at: order.created_at || new Date().toISOString(),
    };
  });

  // Group items by order for order view
  const orderMap = new Map<string, SampleOrder>();

  for (const item of items) {
    if (!orderMap.has(item.order_id)) {
      orderMap.set(item.order_id, {
        id: item.order_id,
        order_number: item.order_number,
        status: item.status, // Will be overwritten to reflect overall order status
        created_at: item.order_created_at,
        items: [],
      });
    }
    orderMap.get(item.order_id)!.items.push(item);
  }

  // Convert map to array and sort by order_number descending
  const orders = Array.from(orderMap.values()).sort((a, b) =>
    b.order_number.localeCompare(a.order_number)
  );

  return { items, orders };
}

export default async function SampleOrdersPage() {
  const { items, orders } = await getSampleOrderData();

  return <SampleOrdersList items={items} orders={orders} />;
}
