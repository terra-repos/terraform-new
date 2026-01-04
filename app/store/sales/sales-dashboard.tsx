"use client";

import { useMemo, useState } from "react";
import { subDays } from "date-fns";
import SalesMetrics from "./_components/sales-metrics";
import RevenueCharts from "./_components/revenue-charts";
import OrderList from "./_components/order-list";
import CustomerInsights from "./_components/customer-insights";
import DateRangePicker from "./_components/date-range-picker";

type Order = any; // Type will be inferred from Supabase

interface SalesDashboardProps {
  orders: Order[];
}

export default function SalesDashboard({ orders }: SalesDashboardProps) {
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

    // Total Discounts
    const totalDiscounts = filteredOrders.reduce((sum, o) => {
      const orderDiscounts = o.drop_session_coupon_usage || [];
      return (
        sum +
        orderDiscounts.reduce((s: number, d: any) => s + (d.discount_applied || 0), 0)
      );
    }, 0);

    // Gross Revenue (before discounts)
    const grossRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.subtotal || 0),
      0
    );

    // Net Revenue (same as total revenue since discounts already applied)
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

    // Shipping Revenue
    const shippingRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.shipping_cost || 0),
      0
    );

    // Profit Margin
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Discount Rate
    const ordersWithDiscounts = filteredOrders.filter(
      (o) => o.drop_session_coupon_usage && o.drop_session_coupon_usage.length > 0
    ).length;
    const discountRate =
      filteredOrders.length > 0
        ? (ordersWithDiscounts / filteredOrders.length) * 100
        : 0;

    return {
      totalRevenue,
      netRevenue,
      grossRevenue,
      totalDiscounts,
      totalProfit,
      aov,
      orderCount: filteredOrders.length,
      unitsSold,
      profitMargin,
      shippingRevenue,
      discountRate,
      ordersWithDiscounts,
    };
  }, [filteredOrders]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with Date Range Filter */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Sales Analytics
            </h1>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
        {/* Metrics Cards */}
        <SalesMetrics metrics={metrics} />

        {/* Revenue Charts */}
        <RevenueCharts orders={filteredOrders} />

        {/* Customer Insights */}
        <CustomerInsights orders={filteredOrders} />

        {/* Order List */}
        <OrderList orders={filteredOrders} />
      </div>
    </div>
  );
}
