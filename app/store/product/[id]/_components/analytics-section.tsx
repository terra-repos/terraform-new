"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, DollarSign, TrendingUp, ExternalLink } from "lucide-react";
import { getProductAnalytics } from "@/app/actions/store/get-product-analytics";

type AnalyticsSectionProps = {
  productId: string;
  organizationId: string;
};

export default function AnalyticsSection({
  productId,
  organizationId,
}: AnalyticsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const data = await getProductAnalytics(productId, organizationId);

      if (data && data.chartData) {
        const totalRevenue = data.chartData.reduce(
          (sum, item) => sum + (item.total_price || 0),
          0
        );
        const totalProfit = data.chartData.reduce(
          (sum, item) => sum + (item.profit || 0),
          0
        );

        setMetrics({
          totalRevenue,
          totalProfit,
        });
      }
      setLoading(false);
    }

    fetchAnalytics();
  }, [productId, organizationId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const metricsData = [
    {
      label: "Total Revenue",
      value: loading ? "—" : formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Total Profit",
      value: loading ? "—" : formatCurrency(metrics.totalProfit),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-neutral-500" />
          <h2 className="text-lg font-medium text-neutral-900">Analytics</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4 mb-4">
          {metricsData.map((metric) => (
            <div
              key={metric.label}
              className="p-4 bg-neutral-50 rounded-lg text-center"
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 ${metric.bgColor} rounded-full mb-2`}
              >
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <p className="text-2xl font-semibold text-neutral-900">
                {metric.value}
              </p>
              <p className="text-sm text-neutral-500">{metric.label}</p>
            </div>
          ))}
        </div>

        <Link
          href={`/store/product/${productId}/analytics`}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium w-full"
        >
          View Detailed Analytics
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
