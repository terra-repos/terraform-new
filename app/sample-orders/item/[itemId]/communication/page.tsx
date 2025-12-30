import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommunicationThread from "./communication-thread";
import type { Database } from "@/types/database";

type CommThread = Database["public"]["Tables"]["comm_threads"]["Row"];
type CommMessage = Database["public"]["Tables"]["comm_messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type MessageWithSender = CommMessage & {
  sender: Pick<Profile, "user_id" | "first_name" | "last_name" | "email" | "pfp_src"> | null;
};

export type ThreadWithMessages = CommThread & {
  messages: MessageWithSender[];
};

export type OrderItemInfo = {
  id: string;
  product_title: string;
  product_thumbnail: string | null;
  order_number: string;
};

async function getCommunicationData(itemId: string): Promise<{
  thread: ThreadWithMessages | null;
  orderItem: OrderItemInfo | null;
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
    return { thread: null, orderItem: null };
  }

  // Fetch order item with basic info
  const { data: orderItem } = await supabase
    .from("order_items")
    .select(
      `
      id,
      orders!inner (
        id,
        order_number,
        organization_id
      ),
      product_variants!inner (
        products!inner (
          title,
          thumbnail_image
        )
      )
    `
    )
    .eq("id", itemId)
    .eq("orders.organization_id", orgMember.organization_id)
    .single();

  if (!orderItem) {
    return { thread: null, orderItem: null };
  }

  // With !inner joins, these are guaranteed to exist and be single objects
  const order = Array.isArray(orderItem.orders)
    ? orderItem.orders[0]
    : orderItem.orders;
  const variant = Array.isArray(orderItem.product_variants)
    ? orderItem.product_variants[0]
    : orderItem.product_variants;
  const product = Array.isArray(variant.products)
    ? variant.products[0]
    : variant.products;

  const orderItemInfo: OrderItemInfo = {
    id: itemId,
    product_title: product.title || "Untitled Product",
    product_thumbnail: product.thumbnail_image,
    order_number: order.order_number || "Unknown",
  };

  // Fetch existing thread for this order item
  const { data: existingThread } = await supabase
    .from("comm_threads")
    .select("*")
    .eq("order_item_id", itemId)
    .single();

  if (!existingThread) {
    // No thread yet - return null, component will handle creating one
    return { thread: null, orderItem: orderItemInfo };
  }

  // Fetch messages for the thread with sender info
  const { data: messages } = await supabase
    .from("comm_messages")
    .select(
      `
      *,
      sender:profiles!comm_messages_sender_id_fkey (
        user_id,
        first_name,
        last_name,
        email,
        pfp_src
      )
    `
    )
    .eq("thread_id", existingThread.id)
    .order("created_at", { ascending: true });

  const threadWithMessages: ThreadWithMessages = {
    ...existingThread,
    messages: (messages || []) as MessageWithSender[],
  };

  return { thread: threadWithMessages, orderItem: orderItemInfo };
}

export default async function CommunicationPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const { thread, orderItem } = await getCommunicationData(itemId);

  if (!orderItem) {
    redirect("/sample-orders");
  }

  return (
    <CommunicationThread
      thread={thread}
      orderItem={orderItem}
      itemId={itemId}
    />
  );
}
