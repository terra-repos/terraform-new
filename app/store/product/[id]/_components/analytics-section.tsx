"use client";

import { BarChart3, Eye, ShoppingCart, DollarSign } from "lucide-react";

type AnalyticsSectionProps = {
  productId: string;
};

export default function AnalyticsSection({ productId }: AnalyticsSectionProps) {
  // Placeholder analytics data - will be replaced with real data later
  const metrics = [
    {
      label: "Views",
      value: "—",
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Add to Cart",
      value: "—",
      icon: ShoppingCart,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Revenue",
      value: "—",
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-neutral-500" />
          <h2 className="text-lg font-medium text-neutral-900">Analytics</h2>
        </div>
        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full">
          Coming Soon
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => (
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

        <p className="text-center text-sm text-neutral-500 mt-4">
          Product analytics will be available soon. Track views, conversions,
          and revenue for this product.
        </p>
      </div>
    </div>
  );
}
