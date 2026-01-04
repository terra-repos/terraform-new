"use client";

import { useMemo } from "react";
import { Users, Repeat } from "lucide-react";

type OrderItemWithRelations = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit: number | null;
  created_at: string | null;
  orders: {
    id: string;
    order_number: string;
    order_date: string;
    contact_email: string;
    total_cost: number;
    status: string;
  };
};

type ProductCustomerInsightsProps = {
  orderItems: OrderItemWithRelations[];
};

export default function ProductCustomerInsights({
  orderItems,
}: ProductCustomerInsightsProps) {
  const customerData = useMemo(() => {
    // Group by customer email
    const grouped = orderItems.reduce(
      (acc, item) => {
        const email = item.orders.contact_email;
        if (!acc[email]) {
          acc[email] = {
            email,
            orderIds: new Set<string>(),
            totalSpent: 0,
            totalProfit: 0,
          };
        }
        acc[email].orderIds.add(item.orders.id);
        acc[email].totalSpent += item.total_price || 0;
        acc[email].totalProfit += item.profit || 0;
        return acc;
      },
      {} as Record<
        string,
        {
          email: string;
          orderIds: Set<string>;
          totalSpent: number;
          totalProfit: number;
        }
      >
    );

    // Convert to array and calculate metrics
    const customers = Object.values(grouped).map((c) => ({
      email: c.email,
      orderCount: c.orderIds.size,
      totalSpent: c.totalSpent,
      totalProfit: c.totalProfit,
    }));

    // Sort by total spent
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    // Calculate repeat rate
    const repeatCustomers = customers.filter((c) => c.orderCount > 1).length;
    const repeatRate =
      customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0;

    return {
      topCustomers: customers.slice(0, 10),
      repeatRate,
      totalCustomers: customers.length,
      repeatCustomers,
    };
  }, [orderItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-neutral-500">
              Total Customers
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900">
            {customerData.totalCustomers}
          </div>
          <div className="text-sm text-neutral-500 mt-1">
            Unique customers who purchased this product
          </div>
        </div>

        {/* Repeat Customer Rate */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Repeat className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-neutral-500">
              Repeat Customer Rate
            </span>
          </div>
          <div className="text-2xl font-semibold text-neutral-900">
            {customerData.repeatRate.toFixed(1)}%
          </div>
          <div className="text-sm text-neutral-500 mt-1">
            {customerData.repeatCustomers} of {customerData.totalCustomers}{" "}
            customers ordered multiple times
          </div>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            Top Customers
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Top 10 customers by total spent on this product
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Customer Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total Profit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {customerData.topCustomers.length > 0 ? (
                customerData.topCustomers.map((customer, index) => (
                  <tr key={customer.email} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {customer.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(customer.totalProfit)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-neutral-500"
                  >
                    No customer data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
