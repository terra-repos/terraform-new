"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Sparkles, Package, Truck, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { TimelineEvent, FactoryUpdate } from "../page";

type GalleryState = {
  images: { src: string }[];
  currentIndex: number;
} | null;

type StatusSummaryProps = {
  timelineEvents: TimelineEvent[];
  factoryUpdates: FactoryUpdate[];
  itemId: string;
};

type TimelineEntry = {
  id: string;
  type: "timeline" | "factory";
  title: string;
  description: string | null;
  created_at: string;
  actor_name?: string | null;
  images?: { src: string }[] | null;
  tracking?: { carrier?: string; tracking_number?: string } | null;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFactoryStatus(status: string | null): string {
  if (!status) return "Factory Update";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function StatusSummary({
  timelineEvents,
  factoryUpdates,
  itemId,
}: StatusSummaryProps) {
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<GalleryState>(null);

  const openGallery = (images: { src: string }[], startIndex: number) => {
    setGallery({ images, currentIndex: startIndex });
  };

  const closeGallery = () => setGallery(null);

  const goToPrevious = useCallback(() => {
    if (!gallery) return;
    setGallery({
      ...gallery,
      currentIndex: gallery.currentIndex === 0 ? gallery.images.length - 1 : gallery.currentIndex - 1,
    });
  }, [gallery]);

  const goToNext = useCallback(() => {
    if (!gallery) return;
    setGallery({
      ...gallery,
      currentIndex: gallery.currentIndex === gallery.images.length - 1 ? 0 : gallery.currentIndex + 1,
    });
  }, [gallery]);

  // Keyboard navigation
  useEffect(() => {
    if (!gallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gallery, goToPrevious, goToNext]);

  const visibleTimelineEvents = timelineEvents.filter(
    (event) => event.visibility === "customer_visible"
  );

  const visibleFactoryUpdates = factoryUpdates.filter(
    (update) => update.viewable_by_customer
  );

  const combinedEntries: TimelineEntry[] = [
    ...visibleTimelineEvents.map((event) => ({
      id: event.id,
      type: "timeline" as const,
      title: event.event_title,
      description: event.event_description,
      created_at: event.created_at,
      actor_name: event.actor_name,
      // Convert attachments array of URLs to images array of {src: string}
      images: event.attachments && event.attachments.length > 0
        ? event.attachments.map((url) => ({ src: url }))
        : null,
      tracking: null,
    })),
    ...visibleFactoryUpdates.map((update) => ({
      id: update.id,
      type: "factory" as const,
      title: formatFactoryStatus(update.status),
      description: update.customer_note || update.notes,
      created_at: update.created_at,
      actor_name: null,
      images: update.images,
      tracking: update.domestic_tracking,
    })),
  ];

  combinedEntries.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const generateAiSummary = async () => {
    if (aiSummary) {
      setShowAiSummary(true);
      return;
    }

    setIsGenerating(true);
    setShowAiSummary(true);

    try {
      const response = await fetch("/api/orders/generate-status-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, timelineEvents: combinedEntries }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary);
      } else {
        setAiSummary("Unable to generate summary at this time.");
      }
    } catch {
      setAiSummary("Unable to generate summary at this time.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (combinedEntries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Timeline
        </h2>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
            <Package className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">
            No updates yet. We&apos;ll notify you as your sample progresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Timeline</h2>
        <button
          onClick={() => {
            if (showAiSummary) {
              setShowAiSummary(false);
            } else {
              generateAiSummary();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {showAiSummary ? "View timeline" : "Summarize"}
        </button>
      </div>

      {showAiSummary ? (
        <div className="prose prose-sm max-w-none">
          {isGenerating ? (
            <div className="flex items-center gap-2 text-neutral-500 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating summary...</span>
            </div>
          ) : (
            <div className="text-neutral-600 whitespace-pre-wrap text-sm leading-relaxed">
              {aiSummary}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-neutral-200" />

          <div className="space-y-6">
            {combinedEntries.map((entry, index) => {
              const isFirst = index === 0;

              return (
                <div key={entry.id} className="relative pl-7">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-0 top-1 w-[15px] h-[15px] rounded-full border-2 ${
                      isFirst
                        ? "bg-neutral-900 border-neutral-900"
                        : "bg-white border-neutral-300"
                    }`}
                  >
                    {isFirst && (
                      <CheckCircle2 className="w-full h-full text-white p-px" />
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm font-medium ${
                              isFirst ? "text-neutral-900" : "text-neutral-700"
                            }`}
                          >
                            {entry.title}
                          </h3>
                          {entry.type === "factory" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded">
                              Factory
                            </span>
                          )}
                        </div>

                        {entry.description && (
                          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
                            {entry.description}
                          </p>
                        )}

                        {/* Tracking info */}
                        {entry.tracking && entry.tracking.tracking_number && (
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
                              <Truck className="h-3.5 w-3.5 text-neutral-400" />
                              <span className="text-neutral-600">
                                {entry.tracking.carrier && (
                                  <span className="font-medium text-neutral-700">
                                    {entry.tracking.carrier}
                                  </span>
                                )}
                                {entry.tracking.carrier && " · "}
                                <span className="font-mono text-neutral-500">
                                  {entry.tracking.tracking_number}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Images */}
                        {entry.images && entry.images.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
                            {entry.images.map((img, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() => openGallery(entry.images!, imgIndex)}
                                className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-50 group cursor-pointer"
                              >
                                <Image
                                  src={img.src}
                                  alt={`Update ${imgIndex + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Actor name */}
                        {entry.actor_name && (
                          <p className="text-xs text-neutral-400 mt-2">
                            by {entry.actor_name}
                          </p>
                        )}
                      </div>

                      <span className="text-xs text-neutral-400 shrink-0 pt-0.5">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Image Gallery Modal */}
      {gallery && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {gallery.currentIndex + 1} / {gallery.images.length}
          </div>

          {/* Previous button */}
          {gallery.images.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Main image */}
          <div className="relative w-full h-full max-w-5xl max-h-[85vh] mx-16">
            <Image
              src={gallery.images[gallery.currentIndex].src}
              alt={`Image ${gallery.currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Next button */}
          {gallery.images.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Thumbnail strip */}
          {gallery.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-3 bg-black/50 rounded-xl">
              {gallery.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setGallery({ ...gallery, currentIndex: idx })}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all ${
                    idx === gallery.currentIndex
                      ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeGallery}
          />
        </div>
      )}
    </div>
  );
}
