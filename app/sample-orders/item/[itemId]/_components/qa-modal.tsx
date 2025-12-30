"use client";

import { useState } from "react";
import { X, Send, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import type { TimelineCommunication, Message } from "../page";

type QAModalProps = {
  open: boolean;
  onClose: () => void;
  communication: TimelineCommunication;
  onSubmitResponse: (
    communicationId: string,
    message: Message
  ) => Promise<{ success: boolean }>;
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function QAModal({
  open,
  onClose,
  communication,
  onSubmitResponse,
}: QAModalProps) {
  const [messages, setMessages] = useState<Message[]>(communication.messages);
  const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  // Find the last MCQ message that hasn't been answered yet
  const pendingMcq = messages.find(
    (msg) =>
      msg.type === "mcq" &&
      msg.sender === "admin" &&
      !msg.selectedOption &&
      // Check if there's no user response after this message
      messages.indexOf(msg) === messages.length - 1
  );

  const handleSubmitText = async () => {
    if (!textInput.trim() || isSubmitting) return;

    const newMessage: Message = {
      id: generateMessageId(),
      type: "text",
      sender: "user",
      content: textInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      const result = await onSubmitResponse(communication.id, newMessage);
      if (result.success) {
        setMessages((prev) => [...prev, newMessage]);
        setTextInput("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMcq = async (mcqMessage: Message) => {
    if (!selectedOption || isSubmitting) return;

    const selectedOptionObj = mcqMessage.options?.find(
      (opt) => opt.id === selectedOption
    );
    if (!selectedOptionObj) return;

    // Create a response message with the selected option
    const responseMessage: Message = {
      id: generateMessageId(),
      type: "text",
      sender: "user",
      content: selectedOptionObj.value,
      timestamp: new Date().toISOString(),
    };

    // Also update the original MCQ message with the selection
    const updatedMcqMessage: Message = {
      ...mcqMessage,
      selectedOption: selectedOption,
    };

    setIsSubmitting(true);
    try {
      // Submit both the MCQ selection and the response
      const result = await onSubmitResponse(communication.id, responseMessage);
      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === mcqMessage.id ? updatedMcqMessage : msg
          ).concat(responseMessage)
        );
        setSelectedOption(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isAdmin = message.sender === "admin";

    switch (message.type) {
      case "mcq":
        return (
          <div
            key={message.id || index}
            className={`max-w-[85%] ${isAdmin ? "" : "ml-auto"}`}
          >
            <div className="bg-neutral-100 rounded-2xl px-4 py-3">
              <p className="text-neutral-900 mb-3">{message.content}</p>

              {message.selectedOption ? (
                // Already answered
                <div className="space-y-2">
                  {message.options?.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-lg border ${
                        option.id === message.selectedOption
                          ? "bg-orange-50 border-orange-300"
                          : "bg-neutral-50 border-neutral-200 opacity-50"
                      }`}
                    >
                      <span
                        className={
                          option.id === message.selectedOption
                            ? "text-orange-700 font-medium"
                            : "text-neutral-500"
                        }
                      >
                        {option.value}
                        {option.id === message.selectedOption && " ✓"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                // Not yet answered - show selectable options
                <div className="space-y-2">
                  {message.options?.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOption === option.id
                          ? "bg-orange-50 border-orange-300"
                          : "bg-white border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`mcq-${message.id}`}
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={() => setSelectedOption(option.id)}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-neutral-900">{option.value}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleSubmitMcq(message)}
                    disabled={!selectedOption || isSubmitting}
                    className="mt-3 w-full px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Answer"
                    )}
                  </button>
                </div>
              )}

              <span className="text-xs text-neutral-400 mt-2 block">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );

      case "image":
        return (
          <div
            key={message.id || index}
            className={`max-w-[85%] ${isAdmin ? "" : "ml-auto"}`}
          >
            <div
              className={`rounded-2xl overflow-hidden ${
                isAdmin ? "bg-neutral-100" : "bg-orange-500"
              }`}
            >
              {message.content && (
                <p
                  className={`px-4 pt-3 ${
                    isAdmin ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {message.content}
                </p>
              )}
              <div className="relative w-64 h-48 m-2 rounded-lg overflow-hidden">
                <Image
                  src={message.content}
                  alt="Attached image"
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className={`text-xs px-4 pb-3 block ${
                  isAdmin ? "text-neutral-400" : "text-orange-100"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );

      case "file":
        return (
          <div
            key={message.id || index}
            className={`max-w-[85%] ${isAdmin ? "" : "ml-auto"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 ${
                isAdmin ? "bg-neutral-100" : "bg-orange-500"
              }`}
            >
              {message.content && (
                <p
                  className={`mb-2 ${
                    isAdmin ? "text-neutral-900" : "text-white"
                  }`}
                >
                  {message.content}
                </p>
              )}
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  isAdmin
                    ? "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    : "bg-orange-400 text-white hover:bg-orange-300"
                } transition-colors`}
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">View Attachment</span>
              </a>
              <span
                className={`text-xs mt-2 block ${
                  isAdmin ? "text-neutral-400" : "text-orange-100"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );

      case "text":
      default:
        return (
          <div
            key={message.id || index}
            className={`max-w-[85%] ${isAdmin ? "" : "ml-auto"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 ${
                isAdmin ? "bg-neutral-100 text-neutral-900" : "bg-orange-500 text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span
                className={`text-xs mt-1 block ${
                  isAdmin ? "text-neutral-400" : "text-orange-100"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Question from Team
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => renderMessage(message, index))}
        </div>

        {/* Input area - only show if last message doesn't require MCQ selection */}
        {!pendingMcq && (
          <div className="shrink-0 border-t border-neutral-100 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitText();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSubmitText}
                disabled={!textInput.trim() || isSubmitting}
                className="p-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
