"use client";

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
} from "lucide-react";

interface Metrics {
  totalRevenue: number;
  netRevenue: number;
  totalDiscounts: number;
  totalProfit: number;
  aov: number;
  orderCount: number;
  unitsSold: number;
  profitMargin: number;
  shippingRevenue: number;
  discountRate: number;
}

interface SalesMetricsProps {
  metrics: Metrics;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Icon className="h-5 w-5 text-orange-600" />
        </div>
        {trend && (
          <span className="text-sm font-medium text-green-600">{trend}</span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-neutral-500">{title}</p>
        <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-neutral-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function SalesMetrics({ metrics }: SalesMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1: Core Revenue Metrics */}
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle={`${formatNumber(metrics.orderCount)} orders`}
          icon={DollarSign}
        />
        <MetricCard
          title="Net Revenue"
          value={formatCurrency(metrics.netRevenue)}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics.orderCount)}
          subtitle={`${(metrics.orderCount / 30).toFixed(1)} per day avg`}
          icon={ShoppingCart}
        />

        {/* Row 2: Profitability & Efficiency */}
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(metrics.aov)}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Profit"
          value={formatCurrency(metrics.totalProfit)}
          subtitle={`${metrics.profitMargin.toFixed(1)}% margin`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Items Sold"
          value={formatNumber(metrics.unitsSold)}
          subtitle={`${(metrics.unitsSold / metrics.orderCount || 0).toFixed(1)} per order`}
          icon={Package}
        />
      </div>
    </div>
  );
}
