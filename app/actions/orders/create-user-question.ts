"use server";

import { createClient } from "@/lib/supabase/server";

type Message = {
  id: string;
  type: "text" | "mcq" | "image" | "file";
  sender: "admin" | "user";
  content: string;
  options?: { id: string; type: string; value: string }[];
  selectedOption?: string;
  timestamp: string;
};

type CreateQuestionResult =
  | { success: true; communicationId: string }
  | { success: false; error: string };

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Placeholder for email notification - to be replaced with actual API later
async function sendAdminNotification(
  orderItemId: string,
  question: string,
  userId: string
): Promise<void> {
  // TODO: Replace with actual email API call
  console.log("Email notification placeholder - New question from user:", {
    orderItemId,
    question,
    userId,
    notificationType: "new_user_question",
  });
}

export async function createUserQuestion(
  orderItemId: string,
  question: string,
  attachments?: string[]
): Promise<CreateQuestionResult> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the user has access to this order item
  const { data: orderItem, error: orderItemError } = await supabase
    .from("order_items")
    .select(
      `
      id,
      orders!inner (
        organization_id
      )
    `
    )
    .eq("id", orderItemId)
    .single();

  if (orderItemError || !orderItem) {
    return { success: false, error: "Order item not found" };
  }

  // Check user's organization membership
  const ordersData = orderItem.orders as unknown as { organization_id: string };
  const orgId = ordersData.organization_id;
  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .single();

  if (membershipError || !membership) {
    return { success: false, error: "Unauthorized access to this order" };
  }

  // Create a new timeline event for this question
  const { data: timelineEvent, error: timelineError } = await supabase
    .from("order_timeline")
    .insert({
      order_item_id: orderItemId,
      event_type: "user_question",
      event_description: `User asked: "${question.substring(0, 100)}${question.length > 100 ? "..." : ""}"`,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (timelineError || !timelineEvent) {
    console.error("Failed to create timeline event:", timelineError);
    return { success: false, error: "Failed to create question" };
  }

  // Build messages array
  const messages: Message[] = [];

  // Add the text question
  messages.push({
    id: generateMessageId(),
    type: "text",
    sender: "user",
    content: question,
    timestamp: new Date().toISOString(),
  });

  // Add image attachments if any
  if (attachments && attachments.length > 0) {
    for (const url of attachments) {
      messages.push({
        id: generateMessageId(),
        type: "image",
        sender: "user",
        content: url,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Create the communication record
  const { data: communication, error: commError } = await supabase
    .from("order_timeline_communication")
    .insert({
      timeline_id: timelineEvent.id,
      communication_type: "question",
      messages: messages,
      message_count: messages.length,
      last_responder: "user",
    })
    .select("id")
    .single();

  if (commError || !communication) {
    console.error("Failed to create communication:", commError);
    return { success: false, error: "Failed to create question" };
  }

  // Send notification to admin
  await sendAdminNotification(orderItemId, question, user.id);

  return { success: true, communicationId: communication.id };
}
