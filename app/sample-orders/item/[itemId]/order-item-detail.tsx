"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrderItemDetail as OrderItemDetailType } from "./page";
import ImageGallery from "./_components/image-gallery";
import StatusSummary from "./_components/status-summary";
import ActionItems from "./_components/action-items";
import ProductionDetailsModal from "./_components/production-details-modal";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  draft: {
    bg: "bg-neutral-100",
    text: "text-neutral-600",
    border: "border-neutral-300",
  },
  sourcing: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-400",
  },
  review: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-400",
  },
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-400",
  },
  approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-400",
  },
  invoiced: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-400",
  },
  paid: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-400",
  },
  submitted: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-400",
  },
  confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-400",
  },
  in_production: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-400",
  },
  ready_to_ship: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-400",
  },
  partial_shipped: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-400",
  },
  shipped: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-400",
  },
  partial_delivery: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-400",
  },
  delivered: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-400",
  },
  completed: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-400",
  },
  issue: { bg: "bg-red-50", text: "text-red-700", border: "border-red-400" },
  cancelled: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
  },
  on_hold: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
  },
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status] || {
      bg: "bg-neutral-100",
      text: "text-neutral-600",
      border: "border-neutral-300",
    }
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type OrderItemDetailProps = {
  item: OrderItemDetailType;
};

export default function OrderItemDetail({ item }: OrderItemDetailProps) {
  const router = useRouter();
  const [showProductionDetails, setShowProductionDetails] = useState(false);

  // Use display_status (computed from sample_manufacturers) for the status badge
  const statusStyle = getStatusStyle(item.display_status);

  // Collect all images: variant images + product thumbnail
  const allImages: string[] = [];
  if (item.variant_images && item.variant_images.length > 0) {
    item.variant_images.forEach((img) => {
      if (img.src) allImages.push(img.src);
    });
  }
  if (item.product_thumbnail && !allImages.includes(item.product_thumbnail)) {
    allImages.unshift(item.product_thumbnail);
  }

  return (
    <>
      <div className="w-full min-h-full bg-neutral-50">
        <div className="w-full max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-neutral-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {item.product_title}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-neutral-500">
                    {item.order_number}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                  >
                    {formatStatus(item.display_status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Track button - shown when shipped */}
            {item.display_status === "shipped" && (
              <a
                href={
                  process.env.NODE_ENV === "development"
                    ? `https://tracking-superstar.useterra.com/track/order/${item.order_id}`
                    : `https://tracking.useterra.com/track/order/${item.order_id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Track
              </a>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-orange-500 rounded-full mb-8" />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Left column - Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Details
                  </h2>
                  <button
                    onClick={() => setShowProductionDetails(true)}
                    className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    View Production Details
                  </button>
                </div>

                <p className="text-neutral-600 mb-6">{item.product_title}</p>

                {/* Image Gallery */}
                <ImageGallery images={allImages} title={item.product_title} />

                {/* Specifications */}
                {item.important_details &&
                  item.important_details.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-neutral-100">
                      <h3 className="text-sm font-medium text-neutral-900 mb-3">
                        Specifications
                      </h3>
                      <ul className="space-y-2">
                        {item.important_details.map((detail, index) => {
                          // Handle both string and {note: string} formats
                          const detailText =
                            typeof detail === "object" && detail !== null
                              ? (detail as { note?: string }).note ||
                                JSON.stringify(detail)
                              : detail;
                          return (
                            <li
                              key={index}
                              className="text-sm text-neutral-600 flex items-start gap-2"
                            >
                              <span className="text-neutral-400">•</span>
                              {detailText}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                {/* Notes */}
                {item.notes && (
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <h3 className="text-sm font-medium text-neutral-900 mb-2">
                      Notes
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {typeof item.notes === "object" && item.notes !== null
                        ? (item.notes as { note?: string }).note ||
                          JSON.stringify(item.notes)
                        : item.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Status & Actions */}
            <div className="space-y-6">
              {/* Action Items - show if there are pending actions or comm thread actions */}
              {(item.pending_actions.length > 0 || item.comm_thread_action) && (
                <ActionItems
                  pendingActions={item.pending_actions}
                  commThreadAction={item.comm_thread_action}
                  itemId={item.id}
                />
              )}

              {/* Status Update */}
              <StatusSummary
                timelineEvents={item.timeline_events}
                factoryUpdates={item.factory_updates}
                itemId={item.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductionDetailsModal
        open={showProductionDetails}
        onClose={() => setShowProductionDetails(false)}
        item={item}
      />
    </>
  );
}
