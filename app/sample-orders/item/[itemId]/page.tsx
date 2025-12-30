import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderItemDetail from "./order-item-detail";

export type Message = {
  id: string;
  type: "text" | "mcq" | "image" | "file";
  sender: "admin" | "user";
  content: string;
  options?: { id: string; type: string; value: string }[];
  selectedOption?: string;
  timestamp: string;
};

export type TimelineCommunication = {
  id: string;
  order_timeline_id: string;
  messages: Message[];
  message_count: number;
  last_responder: string | null;
  influencer_email: string | null;
  created_at: string;
  updated_at: string;
};

export type TimelineEvent = {
  id: string;
  event_type: string;
  event_title: string;
  event_description: string | null;
  created_at: string;
  attachments: string[] | null;
  metadata: Record<string, unknown> | null;
  actor_name: string | null;
  visibility: string | null;
  communication?: TimelineCommunication;
};

export type FactoryUpdate = {
  id: string;
  status: string | null;
  notes: string | null;
  customer_note: string | null;
  images: { src: string }[] | null;
  domestic_tracking: { carrier?: string; tracking_number?: string } | null;
  created_at: string;
  viewable_by_customer: boolean;
};

export type SampleManufacturer = {
  id: string;
  status: string | null;
  factory_id: string | null;
  sample_price: number | null;
  eta: string | null;
  arrived_at_forwarder: boolean | null;
};

export type CommThreadAction = {
  thread_id: string;
  status: string;
  latest_message: {
    id: string;
    content: string;
    message_type: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
  } | null;
};

export function getFurthestStatus(
  manufacturers: SampleManufacturer[],
  orderItemStatus: string
): string {
  // shipped and delivered come from order_items.status only
  if (orderItemStatus === "shipped") {
    return "shipped";
  }
  if (orderItemStatus === "delivered") {
    return "delivered";
  }

  // No sample_manufacturers = draft
  if (manufacturers.length === 0) {
    return "draft";
  }

  // Check for arrived_at_forwarder flag or shipped status in sample_manufacturers
  let hasArrivedAtForwarder = false;
  let hasShippedManufacturer = false;
  let hasInProduction = false;
  let hasApproved = false;

  for (const m of manufacturers) {
    const status = m.status || "draft";
    // Skip cancelled and on_hold statuses
    if (status === "cancelled" || status === "on_hold") continue;

    if (m.arrived_at_forwarder === true) {
      hasArrivedAtForwarder = true;
    }
    if (status === "shipped") {
      hasShippedManufacturer = true;
    }
    if (status === "in_production") {
      hasInProduction = true;
    }
    if (status === "approved") {
      hasApproved = true;
    }
  }

  // If sample_manufacturer status is "shipped" but arrived_at_forwarder is not set, show as completed
  if (hasShippedManufacturer && !hasArrivedAtForwarder) {
    return "completed";
  }

  // If any manufacturer has arrived_at_forwarder flag, show as ready_to_ship
  if (hasArrivedAtForwarder) {
    return "ready_to_ship";
  }

  // If any manufacturer is in_production
  if (hasInProduction) {
    return "in_production";
  }

  // If any manufacturer is approved
  if (hasApproved) {
    return "approved";
  }

  // Default to draft if we have manufacturers but none match the above
  return "draft";
}

export type OrderItemDetail = {
  id: string;
  status: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
  created_at: string;
  notes: string | null;
  // From product
  product_id: string;
  product_title: string;
  product_thumbnail: string | null;
  important_details: string[] | null;
  // From variant
  variant_id: string;
  variant_title: string | null;
  variant_images: { src: string }[] | null;
  dimensions: Record<string, string> | null;
  price: number | null;
  factory_price: number | null;
  air_shipping_cost: number | null;
  ocean_shipping_cost: number | null;
  specifications: Record<string, unknown> | null;
  // From order
  order_id: string;
  order_number: string;
  order_status: string;
  // Timeline
  timeline_events: TimelineEvent[];
  // Factory updates
  factory_updates: FactoryUpdate[];
  // Sample manufacturers (for status tracking)
  sample_manufacturers: SampleManufacturer[];
  // Computed display status (furthest along from sample_manufacturers)
  display_status: string;
  // Pending action items (communications where last_responder is admin)
  pending_actions: TimelineCommunication[];
  // Comm thread action (when thread status is awaiting_client)
  comm_thread_action: CommThreadAction | null;
};

async function getOrderItemDetail(
  itemId: string
): Promise<OrderItemDetail | null> {
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
    return null;
  }

  // Fetch order item with all joins
  const { data: orderItem, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      status,
      quantity,
      unit_price,
      total_price,
      created_at,
      notes,
      orders!inner (
        id,
        order_number,
        status,
        organization_id
      ),
      product_variants!inner (
        id,
        title,
        images,
        dimensions,
        price,
        factory_price,
        air_shipping_cost,
        ocean_shipping_cost,
        specifications,
        products!inner (
          id,
          title,
          thumbnail_image,
          important_details
        )
      )
    `
    )
    .eq("id", itemId)
    .eq("orders.organization_id", orgMember.organization_id)
    .single();

  if (error || !orderItem) {
    console.error("Failed to fetch order item:", error);
    return null;
  }

  // Type assertions for nested data
  const order = orderItem.orders as unknown as {
    id: string;
    order_number: string;
    status: string;
  };

  const variant = orderItem.product_variants as unknown as {
    id: string;
    title: string | null;
    images: { src: string }[] | null;
    dimensions: Record<string, string> | null;
    price: number | null;
    factory_price: number | null;
    air_shipping_cost: number | null;
    ocean_shipping_cost: number | null;
    specifications: Record<string, unknown> | null;
    products: {
      id: string;
      title: string | null;
      thumbnail_image: string | null;
      important_details: unknown[] | null;
    };
  };

  const product = variant.products;

  // Fetch timeline events for this order item
  const { data: timelineEvents } = await supabase
    .from("order_timeline")
    .select(
      `
      id,
      event_type,
      event_title,
      event_description,
      created_at,
      attachments,
      metadata,
      actor_name,
      visibility
    `
    )
    .eq("order_item_id", itemId)
    .order("created_at", { ascending: false });

  // Fetch communications for timeline events
  const timelineIds = (timelineEvents || []).map((e) => e.id);
  let communications: Record<string, TimelineCommunication> = {};

  if (timelineIds.length > 0) {
    const { data: comms } = await supabase
      .from("order_timeline_communication")
      .select("*")
      .in("order_timeline_id", timelineIds);

    if (comms) {
      comms.forEach((comm) => {
        // Parse messages JSON if it's a string
        const messages =
          typeof comm.messages === "string"
            ? JSON.parse(comm.messages)
            : comm.messages;

        communications[comm.order_timeline_id] = {
          id: comm.id,
          order_timeline_id: comm.order_timeline_id,
          messages: messages || [],
          message_count: comm.message_count || 0,
          last_responder: comm.last_responder,
          influencer_email: comm.influencer_email,
          created_at: comm.created_at || "",
          updated_at: comm.updated_at || "",
        };
      });
    }
  }

  // Build timeline events with communications
  const eventsWithComms: TimelineEvent[] = (timelineEvents || []).map(
    (event) => ({
      id: event.id,
      event_type: event.event_type,
      event_title: event.event_title,
      event_description: event.event_description,
      created_at: event.created_at || "",
      attachments: event.attachments,
      metadata: event.metadata as Record<string, unknown> | null,
      actor_name: event.actor_name,
      visibility: event.visibility,
      communication: communications[event.id],
    })
  );

  // Fetch factory order updates for this order item
  const { data: factoryUpdates } = await supabase
    .from("factory_order_updates")
    .select(
      `
      id,
      status,
      notes,
      customer_note,
      images,
      domestic_tracking,
      created_at,
      viewable_by_customer
    `
    )
    .eq("order_item_id", itemId)
    .order("created_at", { ascending: false });

  // Transform factory updates
  const transformedFactoryUpdates: FactoryUpdate[] = (factoryUpdates || []).map(
    (update) => ({
      id: update.id,
      status: update.status,
      notes: update.notes,
      customer_note: update.customer_note,
      images: update.images as { src: string }[] | null,
      domestic_tracking: update.domestic_tracking as {
        carrier?: string;
        tracking_number?: string;
      } | null,
      created_at: update.created_at || new Date().toISOString(),
      viewable_by_customer: update.viewable_by_customer || false,
    })
  );

  // Fetch sample manufacturers for this order item
  const { data: sampleManufacturers } = await supabase
    .from("sample_manufacturers")
    .select("id, status, factory_id, sample_price, eta, arrived_at_forwarder")
    .eq("order_item_id", itemId);

  // Transform sample manufacturers
  const transformedSampleManufacturers: SampleManufacturer[] = (
    sampleManufacturers || []
  ).map((sm) => ({
    id: sm.id,
    status: sm.status,
    arrived_at_forwarder: sm.arrived_at_forwarder,
    factory_id: sm.factory_id,
    sample_price: sm.sample_price,
    eta: sm.eta,
  }));

  // Compute display status from sample manufacturers
  const displayStatus = getFurthestStatus(
    transformedSampleManufacturers,
    orderItem.status || "draft"
  );

  // Fetch comm_thread for this order item
  const { data: commThread } = await supabase
    .from("comm_threads")
    .select("id, status")
    .eq("order_item_id", itemId)
    .single();

  let commThreadAction: CommThreadAction | null = null;

  if (commThread && commThread.status === "awaiting_client") {
    // Fetch latest message from admin
    const { data: latestMessage } = await supabase
      .from("comm_messages")
      .select("id, content, message_type, metadata, created_at")
      .eq("thread_id", commThread.id)
      .eq("sender_type", "admin")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    commThreadAction = {
      thread_id: commThread.id,
      status: commThread.status,
      latest_message: latestMessage
        ? {
            id: latestMessage.id,
            content: latestMessage.content || "",
            message_type: latestMessage.message_type || "text",
            metadata: latestMessage.metadata as Record<string, unknown> | null,
            created_at: latestMessage.created_at || "",
          }
        : null,
    };
  }

  // Get pending actions (communications where admin sent last message)
  const pendingActions = Object.values(communications).filter(
    (comm) => comm.last_responder === "admin"
  );

  return {
    id: orderItem.id,
    status: orderItem.status || "draft",
    quantity: orderItem.quantity,
    unit_price: orderItem.unit_price,
    total_price: orderItem.total_price,
    created_at: orderItem.created_at || new Date().toISOString(),
    notes: orderItem.notes,
    product_id: product.id,
    product_title: product.title || "Untitled Product",
    product_thumbnail: product.thumbnail_image,
    important_details: (product.important_details as string[]) || null,
    variant_id: variant.id,
    variant_title: variant.title,
    variant_images: variant.images,
    dimensions: variant.dimensions,
    price: variant.price,
    factory_price: variant.factory_price,
    air_shipping_cost: variant.air_shipping_cost,
    ocean_shipping_cost: variant.ocean_shipping_cost,
    specifications: variant.specifications,
    order_id: order.id,
    order_number: order.order_number || "Unknown",
    order_status: order.status,
    timeline_events: eventsWithComms,
    factory_updates: transformedFactoryUpdates,
    sample_manufacturers: transformedSampleManufacturers,
    display_status: displayStatus,
    pending_actions: pendingActions,
    comm_thread_action: commThreadAction,
  };
}

export default async function OrderItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const orderItem = await getOrderItemDetail(itemId);

  if (!orderItem) {
    redirect("/sample-orders");
  }

  return <OrderItemDetail item={orderItem} />;
}
