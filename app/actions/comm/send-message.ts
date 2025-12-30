"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/service";

type CommMessageType = Database["public"]["Enums"]["comm_message_type"];
type CommSenderType = Database["public"]["Enums"]["comm_sender_type"];

type SendMessageInput = {
  orderItemId: string;
  threadId?: string;
  content: string;
  messageType: CommMessageType;
  parentId?: string;
  metadata?: Record<string, unknown>;
};

export async function sendMessage(input: SendMessageInput) {
  const supabase = await createClient();
  const service = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  let threadId = input.threadId;

  // If no thread exists, create one
  if (!threadId) {
    const { data: newThread, error: createError } = await service
      .from("comm_threads")
      .insert({
        order_item_id: input.orderItemId,
        status: "awaiting_admin",
      })
      .select()
      .single();

    if (createError) {
      return { success: false, error: createError.message };
    }

    threadId = newThread.id;
  }

  // Insert the message
  const { data: message, error: messageError } = await service
    .from("comm_messages")
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      sender_type: "client" as CommSenderType,
      message_type: input.messageType,
      content: input.content,
      parent_id: input.parentId || null,
      metadata: input.metadata || null,
    })
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
    .single();

  if (messageError) {
    return { success: false, error: messageError.message };
  }

  // Update thread status to awaiting_admin since client sent a message
  await service
    .from("comm_threads")
    .update({ status: "awaiting_admin", updated_at: new Date().toISOString() })
    .eq("id", threadId);

  // Send notifications to sourcing agent and supervisor
  try {
    const { data: orderItem } = await service
      .from("order_items")
      .select("sourcing_agent_id, supervisor_id")
      .eq("id", input.orderItemId)
      .single();

    if (orderItem) {
      const recipientIds: string[] = [];

      if (orderItem.sourcing_agent_id) {
        recipientIds.push(orderItem.sourcing_agent_id);
      }
      if (
        orderItem.supervisor_id &&
        orderItem.supervisor_id !== orderItem.sourcing_agent_id
      ) {
        recipientIds.push(orderItem.supervisor_id);
      }

      if (recipientIds.length > 0) {
        const messagePreview =
          input.content.slice(0, 100) +
          (input.content.length > 100 ? "..." : "");
        const notifications = recipientIds.map((recipientId) => ({
          user_id: recipientId,
          sender_user_id: user.id,
          type: "client_message",
          message: `New message from customer: "${messagePreview}"`,
          redirect_url: `/sample-orders/${input.orderItemId}`,
          is_read: false,
        }));

        console.log(notifications);

        await service.from("notifications").insert(notifications);
      }
    }
  } catch (notificationError) {
    console.error("Failed to send notifications:", notificationError);
    // Don't throw - message was sent successfully
  }

  return { success: true, message, threadId };
}
