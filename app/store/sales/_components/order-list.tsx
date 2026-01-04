"use client";

import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

type Order = any;

interface OrderListProps {
  orders: Order[];
}

const ITEMS_PER_PAGE = 20;

export default function OrderList({ orders }: OrderListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [discountFilter, setDiscountFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Discount filter
      if (discountFilter === "yes") {
        if (!order.drop_session_coupon_usage || order.drop_session_coupon_usage.length === 0) {
          return false;
        }
      } else if (discountFilter === "no") {
        if (order.drop_session_coupon_usage && order.drop_session_coupon_usage.length > 0) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const orderNumber = (order.order_number || "").toLowerCase();
        const email = (order.contact_email || "").toLowerCase();
        const productNames =
          order.order_items
            ?.map((item: any) => item.product_variants?.products?.name || "")
            .join(" ")
            .toLowerCase() || "";

        if (
          !orderNumber.includes(query) &&
          !email.includes(query) &&
          !productNames.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, discountFilter, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter, discountFilter, searchQuery]);

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
    if (statusLower === "completed" || statusLower === "delivered") {
      return "bg-green-100 text-green-800";
    }
    if (statusLower === "shipped" || statusLower === "partial_shipped") {
      return "bg-blue-100 text-blue-800";
    }
    if (statusLower === "in_production") {
      return "bg-orange-100 text-orange-800";
    }
    if (statusLower === "pending" || statusLower === "approved") {
      return "bg-purple-100 text-purple-800";
    }
    if (statusLower === "cancelled") {
      return "bg-red-100 text-red-800";
    }
    return "bg-neutral-100 text-neutral-800";
  };

  const calculateOrderProfit = (order: Order) => {
    return (
      order.order_items?.reduce(
        (sum: number, item: any) => sum + (item.profit || 0),
        0
      ) || 0
    );
  };

  const calculateOrderDiscount = (order: Order) => {
    return (
      order.drop_session_coupon_usage?.reduce(
        (sum: number, usage: any) => sum + (usage.discount_applied || 0),
        0
      ) || 0
    );
  };

  const getOrderCouponCodes = (order: Order) => {
    if (!order.drop_session_coupon_usage || order.drop_session_coupon_usage.length === 0) {
      return null;
    }
    return order.drop_session_coupon_usage
      .map((usage: any) => usage.drop_store_coupons?.coupon_code)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          All Orders
        </h3>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by order #, email, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="shipped">Shipped</option>
            <option value="in_production">In Production</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Discount Filter */}
          <select
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Orders</option>
            <option value="yes">With Discount</option>
            <option value="no">No Discount</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Subtotal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Shipping
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Tax
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Profit
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
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="px-6 py-8 text-center text-sm text-neutral-500"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const discount = calculateOrderDiscount(order);
                const couponCodes = getOrderCouponCodes(order);
                const profit = calculateOrderProfit(order);

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
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-neutral-900">
                          {order.order_items?.length || 0}
                        </span>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="group relative">
                            <button className="text-neutral-400 hover:text-neutral-600">
                              <span className="text-xs">ⓘ</span>
                            </button>
                            <div className="hidden group-hover:block absolute z-10 w-64 p-2 bg-neutral-900 text-white text-xs rounded shadow-lg left-0 top-6">
                              {order.order_items.map((item: any, idx: number) => (
                                <div key={idx} className="py-1">
                                  {item.product_variants?.products?.name || "Unknown"} x{item.quantity || 1}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-900">
                        {formatCurrency(order.subtotal || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {discount > 0 ? (
                        <div>
                          <span className="text-sm font-medium text-green-600">
                            -{formatCurrency(discount)}
                          </span>
                          {couponCodes && (
                            <div className="text-xs text-neutral-500 mt-0.5 font-mono">
                              {couponCodes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-900">
                        {formatCurrency(order.shipping_cost || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-900">
                        {formatCurrency(order.tax || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(order.total_cost || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
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
                      <Link
                        href={`/store/sales/order/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
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
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-neutral-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
