"use client";

import { useMemo, useState } from "react";
import { subDays } from "date-fns";
import SalesMetrics from "../sales/_components/sales-metrics";
import RevenueCharts from "../sales/_components/revenue-charts";
import CustomerInsights from "../sales/_components/customer-insights";
import DateRangePicker from "../sales/_components/date-range-picker";

type Order = any;

interface SalesAnalyticsProps {
  orders: Order[];
}

export default function SalesAnalytics({ orders }: SalesAnalyticsProps) {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.order_date || order.created_at);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }, [orders, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    // Total Revenue
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.total_cost || 0),
      0
    );

    // Net Revenue (same as total revenue)
    const netRevenue = totalRevenue;

    // Total Profit
    const totalProfit = filteredOrders.reduce((sum, o) => {
      const orderProfit =
        o.order_items?.reduce(
          (s: number, item: any) => s + (item.profit || 0),
          0
        ) || 0;
      return sum + orderProfit;
    }, 0);

    // AOV
    const aov =
      filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    // Units Sold
    const unitsSold = filteredOrders.reduce((sum, o) => {
      const orderUnits =
        o.order_items?.reduce(
          (s: number, item: any) => s + (item.quantity || 0),
          0
        ) || 0;
      return sum + orderUnits;
    }, 0);

    // Profit Margin
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      netRevenue,
      totalProfit,
      aov,
      orderCount: filteredOrders.length,
      unitsSold,
      profitMargin,
    };
  }, [filteredOrders]);

  return (
    <div className="space-y-8">
      {/* Date Range Filter */}
      <div className="flex items-center justify-end">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      {/* Metrics Cards */}
      <SalesMetrics metrics={metrics} />

      {/* Revenue Charts */}
      <RevenueCharts orders={filteredOrders} />

      {/* Customer Insights */}
      <CustomerInsights orders={filteredOrders} />
    </div>
  );
}
