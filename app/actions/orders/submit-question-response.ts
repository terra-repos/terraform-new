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

type SubmitResponseResult =
  | { success: true }
  | { success: false; error: string };

// Placeholder for email notification - to be replaced with actual API later
async function sendAdminNotification(
  communicationId: string,
  message: Message,
  orderItemId?: string
): Promise<void> {
  // TODO: Replace with actual email API call
  console.log("Email notification placeholder:", {
    communicationId,
    message,
    orderItemId,
    notificationType: "user_response",
  });
}

export async function submitQuestionResponse(
  communicationId: string,
  message: Message
): Promise<SubmitResponseResult> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch existing communication record
  const { data: communication, error: fetchError } = await supabase
    .from("order_timeline_communication")
    .select("*, order_timeline!inner(order_item_id)")
    .eq("id", communicationId)
    .single();

  if (fetchError || !communication) {
    console.error("Failed to fetch communication:", fetchError);
    return { success: false, error: "Communication not found" };
  }

  // Parse existing messages and append new message
  const existingMessages = (communication.messages as Message[]) || [];
  const updatedMessages = [...existingMessages, message];

  // Update the communication record
  const { error: updateError } = await supabase
    .from("order_timeline_communication")
    .update({
      messages: updatedMessages,
      message_count: updatedMessages.length,
      last_responder: "user",
      updated_at: new Date().toISOString(),
    })
    .eq("id", communicationId);

  if (updateError) {
    console.error("Failed to update communication:", updateError);
    return { success: false, error: "Failed to submit response" };
  }

  // Send notification (placeholder for now)
  const orderItemId = (communication.order_timeline as { order_item_id: string })
    ?.order_item_id;
  await sendAdminNotification(communicationId, message, orderItemId);

  return { success: true };
}

// Update MCQ message with selected option
export async function submitMcqResponse(
  communicationId: string,
  mcqMessageId: string,
  selectedOptionId: string,
  responseMessage: Message
): Promise<SubmitResponseResult> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch existing communication record
  const { data: communication, error: fetchError } = await supabase
    .from("order_timeline_communication")
    .select("*, order_timeline!inner(order_item_id)")
    .eq("id", communicationId)
    .single();

  if (fetchError || !communication) {
    console.error("Failed to fetch communication:", fetchError);
    return { success: false, error: "Communication not found" };
  }

  // Parse existing messages
  const existingMessages = (communication.messages as Message[]) || [];

  // Update the MCQ message with selected option and add response
  const updatedMessages = existingMessages.map((msg) =>
    msg.id === mcqMessageId ? { ...msg, selectedOption: selectedOptionId } : msg
  );
  updatedMessages.push(responseMessage);

  // Update the communication record
  const { error: updateError } = await supabase
    .from("order_timeline_communication")
    .update({
      messages: updatedMessages,
      message_count: updatedMessages.length,
      last_responder: "user",
      updated_at: new Date().toISOString(),
    })
    .eq("id", communicationId);

  if (updateError) {
    console.error("Failed to update communication:", updateError);
    return { success: false, error: "Failed to submit response" };
  }

  // Send notification
  const orderItemId = (communication.order_timeline as { order_item_id: string })
    ?.order_item_id;
  await sendAdminNotification(communicationId, responseMessage, orderItemId);

  return { success: true };
}
