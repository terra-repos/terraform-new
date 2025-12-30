"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  ChevronDown,
  Check,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import type { SampleOrderItem, SampleOrder } from "./page";

type SampleOrdersListProps = {
  items: SampleOrderItem[];
  orders: SampleOrder[];
};

type ViewMode = "items" | "orders";
type SortOption = "newest" | "oldest" | "order_number_asc" | "order_number_desc";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sourcing", label: "Sourcing" },
  { value: "in_production", label: "In Production" },
  { value: "completed", label: "Completed" },
  { value: "issue", label: "Issue" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "order_number_desc", label: "Order # (High to Low)" },
  { value: "order_number_asc", label: "Order # (Low to High)" },
];

const STATUS_STYLES: Record<string, { border: string; text: string }> = {
  draft: { border: "border-neutral-300", text: "text-neutral-500" },
  sourcing: { border: "border-yellow-400", text: "text-yellow-600" },
  quoted: { border: "border-yellow-400", text: "text-yellow-600" },
  review: { border: "border-yellow-400", text: "text-yellow-600" },
  pending: { border: "border-yellow-400", text: "text-yellow-600" },
  approved: { border: "border-emerald-400", text: "text-emerald-600" },
  invoiced: { border: "border-purple-400", text: "text-purple-600" },
  paid: { border: "border-purple-400", text: "text-purple-600" },
  submitted: { border: "border-blue-400", text: "text-blue-600" },
  confirmed: { border: "border-blue-400", text: "text-blue-600" },
  in_production: { border: "border-orange-400", text: "text-orange-600" },
  ready_to_ship: { border: "border-indigo-400", text: "text-indigo-600" },
  shipped: { border: "border-cyan-400", text: "text-cyan-600" },
  delivered: { border: "border-teal-400", text: "text-teal-600" },
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SampleOrdersList({
  items,
  orders,
}: SampleOrdersListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hideCompleted, setHideCompleted] = useState(true);
  const [hideCancelled, setHideCancelled] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("items");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      if (
        searchQuery &&
        !item.product_title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.order_number.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "all" && item.display_status !== statusFilter) {
        return false;
      }
      if (hideCompleted && item.display_status === "completed") {
        return false;
      }
      if (hideCancelled && item.display_status === "cancelled") {
        return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "order_number_desc":
          return b.order_number.localeCompare(a.order_number);
        case "order_number_asc":
          return a.order_number.localeCompare(b.order_number);
        default:
          return 0;
      }
    });

    return result;
  }, [
    items,
    searchQuery,
    statusFilter,
    hideCompleted,
    hideCancelled,
    sortOption,
  ]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // Check if any item in the order matches the search
      const matchesSearch =
        !searchQuery ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.product_title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (!matchesSearch) return false;

      // Check if any item matches status filter
      if (statusFilter !== "all") {
        const hasMatchingStatus = order.items.some(
          (item) => item.display_status === statusFilter
        );
        if (!hasMatchingStatus) return false;
      }

      // Hide completed/cancelled orders (if all items are completed/cancelled)
      if (hideCompleted) {
        const allCompleted = order.items.every(
          (item) => item.display_status === "completed"
        );
        if (allCompleted) return false;
      }

      if (hideCancelled) {
        const allCancelled = order.items.every(
          (item) => item.display_status === "cancelled"
        );
        if (allCancelled) return false;
      }

      return true;
    });

    // Sort orders
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "order_number_desc":
          return b.order_number.localeCompare(a.order_number);
        case "order_number_asc":
          return a.order_number.localeCompare(b.order_number);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, searchQuery, statusFilter, hideCompleted, hideCancelled, sortOption]);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">Samples</h1>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setViewMode("items")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "items"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Items
            </button>
            <button
              onClick={() => setViewMode("orders")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "orders"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <List className="h-4 w-4" />
              Orders
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search samples or order numbers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <ArrowUpDown className="h-4 w-4 text-neutral-400" />
              {SORT_OPTIONS.find((o) => o.value === sortOption)?.label}
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>
            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-50 w-52 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortOption(option.value as SortOption);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors ${
                        sortOption === option.value
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
        {viewMode === "items" && filteredItems.length !== items.length && (
          <p className="text-sm text-neutral-500 mb-4">
            Showing {filteredItems.length} of {items.length} samples
          </p>
        )}
        {viewMode === "orders" && filteredOrders.length !== orders.length && (
          <p className="text-sm text-neutral-500 mb-4">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        )}

        {/* Items View */}
        {viewMode === "items" && (
          <>
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
                  const statusStyle = getStatusStyle(item.display_status);

                  return (
                    <Link
                      key={item.id}
                      href={`/sample-orders/item/${item.id}`}
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
                        <p className="text-xs text-neutral-400 mb-1">
                          {item.order_number}
                        </p>
                        <h3 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                          {item.product_title}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${statusStyle.border} ${statusStyle.text}`}
                        >
                          {formatStatus(item.display_status)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Orders View */}
        {viewMode === "orders" && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-neutral-500">
                  No orders match your current filters.
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
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {order.order_number}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {formatDate(order.created_at)} •{" "}
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-neutral-100">
                      {order.items.map((item) => {
                        const statusStyle = getStatusStyle(item.display_status);

                        return (
                          <Link
                            key={item.id}
                            href={`/sample-orders/item/${item.id}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                          >
                            {/* Image */}
                            <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                              {item.product_image ? (
                                <Image
                                  src={item.product_image}
                                  alt={item.product_title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-neutral-300" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-neutral-900 truncate">
                                {item.product_title}
                              </h4>
                              <p className="text-sm text-neutral-500">
                                Qty: {item.quantity}
                              </p>
                            </div>

                            {/* Status */}
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full border ${statusStyle.border} ${statusStyle.text}`}
                            >
                              {formatStatus(item.display_status)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
