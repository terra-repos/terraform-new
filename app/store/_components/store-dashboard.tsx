"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Package,
  BarChart3,
  Globe,
  ImageIcon,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Database } from "@/types/database";
import SalesAnalytics from "./sales-analytics";
import { getOrders } from "@/app/actions/store/get-orders";

type StoreData = Database["public"]["Tables"]["drop_stores"]["Row"];

export type StoreProduct = {
  id: string;
  title: string | null;
  thumbnail_image: string | null;
  drop_custom_price: number | null;
  profit_per_unit: number | null;
};

type Tab = "products" | "sales" | "orders" | "traffic";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "products", label: "Manage Products", icon: Package },
  { id: "sales", label: "Sales Metrics", icon: BarChart3 },
  { id: "orders", label: "Order Breakdown", icon: ShoppingBag },
  { id: "traffic", label: "Web Traffic", icon: Globe },
];

type StoreDashboardProps = {
  store: StoreData;
  products: StoreProduct[];
  organizationId: string;
  storeUrl: string;
};

export default function StoreDashboard({
  store,
  products,
  organizationId,
  storeUrl,
}: StoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                {store.store_name}
              </h1>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 text-sm hover:text-orange-600 transition-colors"
              >
                {storeUrl}
              </a>
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              View Store
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div
        className={`mx-auto px-6 py-8 ${
          activeTab === "orders" ? "max-w-[1400px]" : "max-w-5xl"
        }`}
      >
        {activeTab === "products" && <ProductsTab products={products} />}
        {activeTab === "sales" && <SalesTab organizationId={organizationId} />}
        {activeTab === "orders" && (
          <OrdersTab organizationId={organizationId} />
        )}
        {activeTab === "traffic" && <TrafficTab />}
      </div>
    </div>
  );
}

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function ProductsTab({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          No Products Yet
        </h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Once your samples are approved, you can add them to your store and set
          your retail prices.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-900 mb-4">
        Your Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all flex flex-col"
          >
            <Link href={`/store/product/${product.id}`} className="flex-1">
              {/* Image */}
              <div className="aspect-square bg-neutral-100 relative">
                {product.thumbnail_image ? (
                  <img
                    src={product.thumbnail_image}
                    alt={product.title || "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-neutral-300" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                  {product.title || "Untitled Product"}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-orange-600 font-medium">
                    {formatPrice(product.drop_custom_price)}
                  </p>
                  {product.profit_per_unit !== null && (
                    <p
                      className={`text-sm font-medium ${
                        product.profit_per_unit > 0
                          ? "text-green-600"
                          : product.profit_per_unit < 0
                          ? "text-red-600"
                          : "text-neutral-400"
                      }`}
                    >
                      {product.profit_per_unit > 0 ? "+" : ""}
                      {formatPrice(product.profit_per_unit)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesTab({ organizationId }: { organizationId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const data = await getOrders(organizationId);
      setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <div className="animate-pulse">
          <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          No Sales Yet
        </h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Once you start receiving orders through your drop store, you'll see
          detailed analytics here.
        </p>
      </div>
    );
  }

  return <SalesAnalytics orders={orders} />;
}

function OrdersTab({ organizationId }: { organizationId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);

  const STATUS_OPTIONS = [
    { value: "all", label: "All Statuses" },
    { value: "paid", label: "Paid" },
    { value: "in_production", label: "In Production" },
    { value: "partial_shipped", label: "Partially Shipped" },
    { value: "shipped", label: "Shipped" },
    { value: "partial_delivery", label: "Partially Delivered" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Fetch orders when filters change
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { getPaginatedOrders } = await import(
        "@/app/actions/store/get-paginated-orders"
      );
      const result = await getPaginatedOrders({
        organizationId,
        page: currentPage,
        limit: 50,
        searchQuery,
        statusFilter,
      });
      setOrders(result.orders);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
      setLoading(false);

      // Scroll to top of table when page changes
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
    fetchOrders();
  }, [organizationId, currentPage, searchQuery, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return format(parseISO(dateStr), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "delivered" || statusLower === "partial_delivery") {
      return "bg-green-100 text-green-800";
    }
    if (statusLower === "shipped" || statusLower === "partial_shipped") {
      return "bg-blue-100 text-blue-800";
    }
    if (statusLower === "in_production") {
      return "bg-orange-100 text-orange-800";
    }
    if (statusLower === "paid") {
      return "bg-purple-100 text-purple-800";
    }
    if (statusLower === "cancelled") {
      return "bg-red-100 text-red-800";
    }
    return "bg-neutral-100 text-neutral-800";
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <div className="animate-pulse">
          <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (
    !loading &&
    orders.length === 0 &&
    searchQuery === "" &&
    statusFilter === "all"
  ) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <ShoppingBag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          No Orders Yet
        </h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Once you start receiving orders through your drop store, they'll
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
    >
      {/* Header with Filters */}
      <div className="p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Order Breakdown
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by order # or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative z-50">
            <button
              ref={statusButtonRef}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>
            {showStatusDropdown && statusButtonRef.current && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div
                  className="fixed z-50 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
                  style={{
                    top: `${
                      statusButtonRef.current.getBoundingClientRect().bottom + 4
                    }px`,
                    left: `${
                      statusButtonRef.current.getBoundingClientRect().left
                    }px`,
                  }}
                >
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
        </div>

        <p className="text-neutral-500 text-sm mt-4">
          Showing {orders.length} of {totalCount} orders
        </p>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm text-neutral-500"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                return (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-neutral-900">
                        {order.order_number || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">
                        {formatDate(order.order_date || order.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-900">
                        {order.contact_email || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(order.total_cost || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status?.replace(/_/g, " ") || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        onClick={() => {
                          window.open(`/store/sales/order/${order.id}`);
                        }}
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>←</span> Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-orange-600 text-white"
                        : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TrafficTab() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
      <Globe className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        Web Traffic Analytics
      </h3>
      <p className="text-neutral-500 mb-6 max-w-md mx-auto">
        See how visitors find your store, which products they view, and where
        they come from.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-500 text-sm rounded-lg">
        Coming Soon
      </div>
    </div>
  );
}
