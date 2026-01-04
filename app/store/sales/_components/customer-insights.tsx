"use client";

import { useMemo } from "react";
import { Users, Repeat, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";

type Order = any;

interface CustomerInsightsProps {
  orders: Order[];
}

export default function CustomerInsights({ orders }: CustomerInsightsProps) {
  const { metrics, topCustomers } = useMemo(() => {
    const customerMap: Record<
      string,
      {
        email: string;
        orderCount: number;
        totalSpent: number;
        firstOrder: Date | null;
        lastOrder: Date | null;
        shippingAddress: any;
      }
    > = {};

    orders.forEach((order) => {
      const email = order.contact_email || "Unknown";
      const orderDate = order.order_date || order.created_at;

      if (!customerMap[email]) {
        customerMap[email] = {
          email,
          orderCount: 0,
          totalSpent: 0,
          firstOrder: null,
          lastOrder: null,
          shippingAddress: order.shipping_address || null,
        };
      }

      customerMap[email].orderCount++;
      customerMap[email].totalSpent += order.total_cost || 0;

      const date = orderDate ? parseISO(orderDate) : new Date();
      if (!customerMap[email].firstOrder || date < customerMap[email].firstOrder!) {
        customerMap[email].firstOrder = date;
      }
      if (!customerMap[email].lastOrder || date > customerMap[email].lastOrder!) {
        customerMap[email].lastOrder = date;
      }

      // Update shipping address to most recent
      if (order.shipping_address) {
        customerMap[email].shippingAddress = order.shipping_address;
      }
    });

    const customers = Object.values(customerMap);

    // Calculate metrics
    const totalCustomers = customers.length;
    const returningCustomers = customers.filter((c) => c.orderCount > 1).length;
    const repeatRate =
      totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
    const avgOrdersPerCustomer =
      totalCustomers > 0 ? orders.length / totalCustomers : 0;

    // Top customers by total spent
    const topCustomersList = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      metrics: {
        totalCustomers,
        newCustomers: totalCustomers - returningCustomers,
        returningCustomers,
        repeatRate,
        avgOrdersPerCustomer,
      },
      topCustomers: topCustomersList,
    };
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return format(date, "MMM dd, yyyy");
  };

  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    try {
      const addr = typeof address === "string" ? JSON.parse(address) : address;
      return `${addr.firstName || ""} ${addr.lastName || ""}, ${addr.street || ""} ${addr.apartment ? `#${addr.apartment}` : ""}, ${addr.city || ""}, ${addr.state || ""} ${addr.zip || ""}, ${addr.country || ""}`.trim();
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Customer Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 mb-1">Total Customers</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {metrics.totalCustomers}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {metrics.newCustomers} new, {metrics.returningCustomers} returning
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Repeat className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 mb-1">Repeat Customer Rate</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {metrics.repeatRate.toFixed(1)}%
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {metrics.returningCustomers} of {metrics.totalCustomers} customers
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-500 mb-1">Avg Orders per Customer</p>
            <p className="text-2xl font-semibold text-neutral-900">
              {metrics.avgOrdersPerCustomer.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Top Customers
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  First Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Shipping Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {topCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-neutral-500"
                  >
                    No customer data available
                  </td>
                </tr>
              ) : (
                topCustomers.map((customer, index) => {
                  const avgOrderValue = customer.totalSpent / customer.orderCount;

                  return (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-900">
                          {customer.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-neutral-900">
                          {customer.orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600">
                          {formatCurrency(avgOrderValue)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600">
                          {formatDate(customer.firstOrder)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-600">
                          {formatDate(customer.lastOrder)}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="text-sm text-neutral-600 truncate block">
                          {formatAddress(customer.shippingAddress)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
