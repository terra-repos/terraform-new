"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, startOfDay } from "date-fns";

type Order = any;

interface RevenueChartsProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#22c55e",
  shipped: "#3b82f6",
  in_production: "#f59e0b",
  pending: "#a855f7",
  cancelled: "#ef4444",
  other: "#6b7280",
};

export default function RevenueCharts({ orders }: RevenueChartsProps) {
  // Revenue Over Time Data
  const revenueOverTime = useMemo(() => {
    const dailyData: Record<
      string,
      { date: string; revenue: number; profit: number; discounts: number }
    > = {};

    orders.forEach((order) => {
      const dateKey = format(
        startOfDay(parseISO(order.order_date || order.created_at)),
        "MMM dd"
      );

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, revenue: 0, profit: 0, discounts: 0 };
      }

      dailyData[dateKey].revenue += order.total_cost || 0;

      // Calculate profit
      const orderProfit =
        order.order_items?.reduce(
          (sum: number, item: any) => sum + (item.profit || 0),
          0
        ) || 0;
      dailyData[dateKey].profit += orderProfit;

      // Calculate discounts
      const orderDiscounts =
        order.drop_session_coupon_usage?.reduce(
          (sum: number, d: any) => sum + (d.discount_applied || 0),
          0
        ) || 0;
      dailyData[dateKey].discounts += orderDiscounts;
    });

    return Object.values(dailyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [orders]);

  // Order Status Breakdown
  const statusBreakdown = useMemo(() => {
    const statusData: Record<string, { count: number; revenue: number }> = {};

    orders.forEach((order) => {
      const status = order.status || "other";
      const normalizedStatus =
        status === "completed" ||
        status === "shipped" ||
        status === "in_production" ||
        status === "pending" ||
        status === "cancelled"
          ? status
          : "other";

      if (!statusData[normalizedStatus]) {
        statusData[normalizedStatus] = { count: 0, revenue: 0 };
      }

      statusData[normalizedStatus].count += 1;
      statusData[normalizedStatus].revenue += order.total_cost || 0;
    });

    return Object.entries(statusData).map(([status, data]) => ({
      name: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: data.revenue,
      count: data.count,
      status,
    }));
  }, [orders]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Revenue Over Time */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Revenue Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Gross Revenue"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#f97316"
              strokeWidth={2}
              name="Profit"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Order Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || STATUS_COLORS.other}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
