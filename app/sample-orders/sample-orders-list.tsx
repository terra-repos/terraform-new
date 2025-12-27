"use client";

import Image from "next/image";
import Link from "next/link";
import { Package, Search, ChevronDown, Check } from "lucide-react";
import { useState, useMemo } from "react";

type SampleOrderItem = {
  id: string;
  status: string;
  quantity: number;
  created_at: string;
  product_title: string;
  product_image: string | null;
};

type SampleOrdersListProps = {
  items: SampleOrderItem[];
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sourcing", label: "Sourcing" },
  { value: "in_production", label: "In Production" },
  { value: "completed", label: "Completed" },
  { value: "issue", label: "Issue" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, { border: string; text: string }> = {
  draft: { border: "border-neutral-300", text: "text-neutral-500" },
  sourcing: { border: "border-yellow-400", text: "text-yellow-600" },
  quoted: { border: "border-yellow-400", text: "text-yellow-600" },
  in_production: { border: "border-orange-400", text: "text-orange-600" },
  completed: { border: "border-green-400", text: "text-green-600" },
  issue: { border: "border-red-400", text: "text-red-600" },
  cancelled: { border: "border-slate-300", text: "text-slate-500" },
  on_hold: { border: "border-slate-300", text: "text-slate-500" },
};

function getStatusStyle(status: string) {
  return (
    STATUS_STYLES[status] || {
      border: "border-neutral-300",
      text: "text-neutral-500",
    }
  );
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SampleOrdersList({ items }: SampleOrdersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hideCompleted, setHideCompleted] = useState(true);
  const [hideCancelled, setHideCancelled] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (
        searchQuery &&
        !item.product_title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Hide completed
      if (hideCompleted && item.status === "completed") {
        return false;
      }

      // Hide cancelled
      if (hideCancelled && item.status === "cancelled") {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, statusFilter, hideCompleted, hideCancelled]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <Package className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          No sample orders yet
        </h2>
        <p className="text-neutral-500 text-center max-w-md mb-8">
          When you submit a sample request, your orders will appear here.
        </p>
        <Link
          href="/samples"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          View My Samples
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-neutral-50">
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Samples</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search samples"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>
            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-50 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors ${
                        statusFilter === option.value
                          ? "text-orange-600 font-medium"
                          : "text-neutral-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Checkboxes */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                hideCompleted
                  ? "bg-orange-500 border-orange-500"
                  : "border-neutral-300 bg-white"
              }`}
              onClick={() => setHideCompleted(!hideCompleted)}
            >
              {hideCompleted && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-neutral-600">Hide completed</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                hideCancelled
                  ? "bg-orange-500 border-orange-500"
                  : "border-neutral-300 bg-white"
              }`}
              onClick={() => setHideCancelled(!hideCancelled)}
            >
              {hideCancelled && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-sm text-neutral-600">Hide cancelled</span>
          </label>
        </div>

        {/* Results count */}
        {filteredItems.length !== items.length && (
          <p className="text-sm text-neutral-500 mb-4">
            Showing {filteredItems.length} of {items.length} samples
          </p>
        )}

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-neutral-500">
              No samples match your current filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setHideCompleted(false);
                setHideCancelled(false);
              }}
              className="mt-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const statusStyle = getStatusStyle(item.status);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-square bg-neutral-100 relative">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                      {item.product_title}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${statusStyle.border} ${statusStyle.text}`}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
