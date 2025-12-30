"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUp,
  Loader2,
  MessageCircle,
  Plus,
  X,
  User,
} from "lucide-react";
import type { ThreadWithMessages, MessageWithSender, OrderItemInfo } from "./page";
import { sendMessage } from "@/app/actions/comm/send-message";
import { uploadMultipleImages } from "@/app/actions/uploads/uploadImage";
import { createClient } from "@/lib/supabase/client";

type MessageOption = {
  id: string;
  image?: string;
  label: string;
};

type CommunicationThreadProps = {
  thread: ThreadWithMessages | null;
  orderItem: OrderItemInfo;
  itemId: string;
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSenderName(message: MessageWithSender): string {
  if (message.sender) {
    const { first_name, last_name, email } = message.sender;
    if (first_name || last_name) {
      return [first_name, last_name].filter(Boolean).join(" ");
    }
    return email || "Unknown";
  }
  return message.sender_type === "admin" ? "Terra Team" : "You";
}

export default function CommunicationThread({
  thread,
  orderItem,
  itemId,
}: CommunicationThreadProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>(thread?.messages || []);
  const [textInput, setTextInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Supabase client for realtime subscriptions
  const supabase = useMemo(() => createClient(), []);

  // Fetch sender profile for a message
  const fetchSenderProfile = useCallback(
    async (senderId: string | null) => {
      if (!senderId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, pfp_src")
        .eq("user_id", senderId)
        .single();
      return data;
    },
    [supabase]
  );

  // Subscribe to realtime messages for this thread
  useEffect(() => {
    if (!thread?.id) return;

    const channel = supabase
      .channel(`comm-messages-${thread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comm_messages",
          filter: `thread_id=eq.${thread.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as MessageWithSender;

          // Fetch sender profile
          const sender = await fetchSenderProfile(newMessage.sender_id);

          // Add message with sender info to state (dedupe inside setState)
          setMessages((prev) => {
            // Skip if we already have this message
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, { ...newMessage, sender } as MessageWithSender];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, thread?.id, fetchSenderProfile]);

  // Find pending options message (last unanswered options from admin)
  const pendingOptionsMessage = messages.find(
    (msg, index) =>
      msg.message_type === "options" &&
      msg.sender_type === "admin" &&
      index === messages.length - 1 &&
      // Check if there's no selection response after this
      !messages.some(
        (m, i) => i > index && m.message_type === "selection" && m.parent_id === msg.id
      )
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const urls = await uploadMultipleImages(
        Array.from(files),
        "comm-attachments"
      );
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitText = async () => {
    if ((!textInput.trim() && uploadedImages.length === 0) || isSubmitting) return;

    setIsSubmitting(true);
    const currentText = textInput.trim();
    const currentImages = [...uploadedImages];

    // Clear inputs immediately for better UX
    setTextInput("");
    setUploadedImages([]);

    try {
      const result = await sendMessage({
        orderItemId: itemId,
        threadId: thread?.id,
        content: currentText,
        messageType: "text",
        metadata: currentImages.length > 0 ? { image_attachments: currentImages } : undefined,
      });

      if (!result.success) {
        // Restore inputs on failure
        setTextInput(currentText);
        setUploadedImages(currentImages);
      }
      // Don't add message locally - let realtime subscription handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSelection = async (optionsMessage: MessageWithSender) => {
    if (selectedOptions.length === 0 || isSubmitting) return;

    // Get the options from the message to find labels for selected IDs
    const messageOptions: MessageOption[] = optionsMessage.metadata
      ? (optionsMessage.metadata as { options?: MessageOption[] }).options || []
      : [];

    // Get labels for selected option IDs
    const selectedLabels = messageOptions
      .filter((opt) => selectedOptions.includes(opt.id))
      .map((opt) => opt.label);

    setIsSubmitting(true);
    const currentSelection = [...selectedOptions];

    // Clear selection immediately
    setSelectedOptions([]);

    try {
      const result = await sendMessage({
        orderItemId: itemId,
        threadId: thread?.id,
        content: selectedLabels.join(", "),
        messageType: "selection",
        parentId: optionsMessage.id,
        metadata: { selectedOptions: currentSelection },
      });

      if (!result.success) {
        // Restore selection on failure
        setSelectedOptions(currentSelection);
      }
      // Don't add message locally - let realtime subscription handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = (message: MessageWithSender) => {
    const isClient = message.sender_type === "client";
    const senderName = getSenderName(message);

    // Parse options from metadata if this is an options message
    const options: MessageOption[] = message.message_type === "options" && message.metadata
      ? (message.metadata as { options?: MessageOption[] }).options || []
      : [];

    // Check if this options message has been answered
    const isAnswered = message.message_type === "options" && messages.some(
      (m) => m.message_type === "selection" && m.parent_id === message.id
    );

    return (
      <div key={message.id} className={`flex gap-3 ${isClient ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 rounded-full overflow-hidden ${
          isClient ? "bg-neutral-200" : "bg-neutral-100"
        } flex items-center justify-center`}>
          {message.sender?.pfp_src ? (
            <Image
              src={message.sender.pfp_src}
              alt={senderName}
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <User className={`h-4 w-4 ${isClient ? "text-neutral-600" : "text-neutral-500"}`} />
          )}
        </div>

        {/* Message content */}
        <div className={`flex-1 max-w-[80%] ${isClient ? "text-right" : ""}`}>
          <div className={`text-xs text-neutral-500 mb-1 ${isClient ? "text-right" : ""}`}>
            {senderName}
          </div>

          {message.message_type === "options" ? (
            <div className="bg-neutral-100 rounded-2xl px-4 py-3">
              {message.content && (
                <p className="text-neutral-900 mb-3">{message.content}</p>
              )}

              {isAnswered ? (
                // Show answered state
                <div className="space-y-2">
                  {options.map((option) => {
                    const selectionMsg = messages.find(
                      (m) => m.message_type === "selection" && m.parent_id === message.id
                    );
                    const selectedOptIds = selectionMsg?.metadata
                      ? (selectionMsg.metadata as { selectedOptions?: string[] }).selectedOptions || []
                      : [];
                    const isSelected = selectedOptIds.includes(option.id);

                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border ${
                          isSelected
                            ? "bg-orange-50 border-orange-300"
                            : "bg-neutral-50 border-neutral-200 opacity-50"
                        }`}
                      >
                        {option.image && (
                          <Image
                            src={option.image}
                            alt={option.label}
                            width={48}
                            height={48}
                            className="rounded mb-2 object-cover"
                          />
                        )}
                        <span className={isSelected ? "text-orange-700 font-medium" : "text-neutral-500"}>
                          {option.label}
                          {isSelected && " ✓"}
                        </span>
                        <span className="text-xs text-neutral-400 ml-2">
                          ({option.id.slice(0, 8)}...)
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Show selectable options
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOptions.includes(option.id)
                          ? "bg-orange-50 border-orange-300"
                          : "bg-white border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOptions((prev) => [...prev, option.id]);
                          } else {
                            setSelectedOptions((prev) => prev.filter((o) => o !== option.id));
                          }
                        }}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded"
                      />
                      {option.image && (
                        <Image
                          src={option.image}
                          alt={option.label}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <span className="text-neutral-900">{option.label}</span>
                        <span className="text-xs text-neutral-400 ml-2">
                          ({option.id.slice(0, 8)}...)
                        </span>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => handleSubmitSelection(message)}
                    disabled={selectedOptions.length === 0 || isSubmitting}
                    className="mt-3 w-full px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Selection"
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : message.message_type === "image" ? (
            <div className={`rounded-2xl overflow-hidden ${isClient ? "bg-neutral-900" : "bg-neutral-100"}`}>
              {message.content && (
                <div className="relative w-64 h-48 m-2 rounded-lg overflow-hidden">
                  <Image
                    src={message.content}
                    alt="Attached image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Image Attachments from metadata */}
              {message.metadata &&
                (message.metadata as { image_attachments?: string[] }).image_attachments &&
                (message.metadata as { image_attachments?: string[] }).image_attachments!.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${isClient ? "justify-end" : "justify-start"}`}>
                    {(message.metadata as { image_attachments: string[] }).image_attachments.map(
                      (imageUrl, index) => (
                        <div
                          key={index}
                          className="relative w-48 h-36 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Attachment ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* Text content */}
              {message.content && (
                <div
                  className={`inline-block rounded-2xl px-4 py-2 ${
                    isClient
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              )}
            </div>
          )}

          <div className={`text-xs text-neutral-400 mt-1 ${isClient ? "text-right" : ""}`}>
            {formatTimestamp(message.created_at)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col w-full overflow-hidden bg-neutral-50">
      {/* Messages Area - scrolls past header */}
      <div className="flex-1 overflow-y-auto">
        {/* Header - Pill Style */}
        <div className="sticky top-0 z-10 px-6 py-4 bg-neutral-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-neutral-200 px-4 py-3 shadow-sm">
              <button
                onClick={() => router.push(`/sample-orders/item/${orderItem.id}`)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-neutral-600" />
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {orderItem.product_thumbnail && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                    <Image
                      src={orderItem.product_thumbnail}
                      alt={orderItem.product_title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-neutral-900 truncate">
                    Messages
                  </h1>
                  <p className="text-sm text-neutral-500 truncate">
                    {orderItem.product_title} · {orderItem.order_number}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-neutral-400" />
              </div>
              <h2 className="text-lg font-medium text-neutral-900 mb-2">
                No messages yet
              </h2>
              <p className="text-neutral-500 max-w-sm">
                Start a conversation with our team by asking a question below.
              </p>
            </div>
          ) : (
            messages.map((message) => renderMessage(message))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Floating at bottom */}
      <div className="pb-12 w-full">
        <div className="max-w-3xl mx-auto px-6">
          {pendingOptionsMessage ? (
            // Show message when options selection is pending
            <div className="text-center py-2 bg-white rounded-3xl border border-neutral-200 shadow-sm px-6">
              <p className="text-sm text-neutral-500">
                Please make a selection above to continue
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white px-6 py-4 shadow-sm focus-within:border-neutral-300 focus-within:ring-1 focus-within:ring-neutral-300">
              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative inline-block">
                      <Image
                        src={imageUrl}
                        alt={`Upload preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover h-20 w-20"
                      />
                      <button
                        onClick={() => removeUploadedImage(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-neutral-900 p-1 text-white hover:bg-neutral-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-center gap-4">
                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-base text-neutral-900 placeholder-neutral-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitText();
                    }
                  }}
                />

                {/* Send Button */}
                <button
                  onClick={handleSubmitText}
                  disabled={(!textInput.trim() && uploadedImages.length === 0) || isSubmitting}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    textInput.trim() || uploadedImages.length > 0
                      ? "bg-neutral-900 text-white hover:bg-neutral-700"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
