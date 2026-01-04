"use client";

import { Trophy } from "lucide-react";

type VariantData = {
  variant_id: string;
  variant_title: string;
  total_units_sold: number;
  order_count: number;
  total_profit: number;
  total_revenue: number;
  option_values: Array<{ optionType: string; value: string }>;
};

type MostPopularVariantsProps = {
  variants: VariantData[];
};

export default function MostPopularVariants({
  variants,
}: MostPopularVariantsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-orange-500 text-white";
      case 2:
        return "bg-orange-400 text-white";
      case 3:
        return "bg-orange-300 text-white";
      default:
        return "bg-neutral-200 text-neutral-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-neutral-900">
          Most Popular Variants
        </h2>
      </div>

      <div className="p-6">
        {variants.length > 0 ? (
          <div className="space-y-4">
            {variants.map((variant, index) => {
              const rank = index + 1;
              return (
                <div
                  key={variant.variant_id}
                  className="border border-neutral-200 rounded-lg p-4 hover:border-orange-200 transition-colors"
                >
                  {/* Header: Rank + Variant Title + Options */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full ${getRankBadgeColor(
                        rank
                      )} flex items-center justify-center font-bold text-sm`}
                    >
                      #{rank}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2">
                        {variant.variant_title}
                      </h3>
                      {variant.option_values.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {variant.option_values.map((ov, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                            >
                              {ov.optionType}: {ov.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Units Sold */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">
                        Units Sold
                      </div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {variant.total_units_sold}
                      </div>
                    </div>

                    {/* Orders */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">
                        Orders
                      </div>
                      <div className="text-lg font-semibold text-neutral-900">
                        {variant.order_count}
                      </div>
                    </div>

                    {/* Revenue */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">
                        Revenue
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(variant.total_revenue)}
                      </div>
                    </div>

                    {/* Profit */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">
                        Profit
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(variant.total_profit)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
            <p className="font-medium">No variant data available</p>
            <p className="text-sm mt-1">
              Variant sales will appear here once you have orders
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
