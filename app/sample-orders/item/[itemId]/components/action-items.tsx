"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import type { TimelineCommunication, Message, CommThreadAction } from "../page";

type ActionItemsProps = {
  pendingActions: TimelineCommunication[];
  commThreadAction: CommThreadAction | null;
  itemId: string;
};

function getLastAdminMessage(messages: Message[]): Message | null {
  // Find the last message from admin
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === "admin") {
      return messages[i];
    }
  }
  return null;
}

export default function ActionItems({
  pendingActions,
  commThreadAction,
  itemId,
}: ActionItemsProps) {
  const router = useRouter();

  // Get message preview for comm_thread action
  const getCommActionPreview = () => {
    if (!commThreadAction?.latest_message) return "New message from team";

    const msg = commThreadAction.latest_message;
    if (msg.message_type === "options") {
      const options =
        (msg.metadata as { options?: { label: string }[] })?.options || [];
      return `Please select: ${options.map((o) => o.label).join(", ")}`;
    }
    return msg.content || "New message from team";
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Action Items
      </h2>

      <div className="space-y-3">
        {/* Comm Thread Action (new) */}
        {commThreadAction && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm text-neutral-900 line-clamp-2">
                  {getCommActionPreview()}
                </p>
                {commThreadAction.latest_message?.message_type === "options" && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Please select an option
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() =>
                router.push(`/sample-orders/item/${itemId}/communication`)
              }
              className="px-3 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shrink-0 ml-3"
            >
              Respond
            </button>
          </div>
        )}

        {/* Legacy pending_actions */}
        {pendingActions.map((action) => {
          const lastAdminMessage = getLastAdminMessage(action.messages);
          const preview = lastAdminMessage?.content || "New message from team";

          return (
            <div
              key={action.id}
              className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-neutral-900 line-clamp-2">
                    {preview}
                  </p>
                  {lastAdminMessage?.type === "mcq" && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Please select an option
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() =>
                  router.push(`/sample-orders/item/${itemId}/communication`)
                }
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors shrink-0 ml-3"
              >
                View More
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
