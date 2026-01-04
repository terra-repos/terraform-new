"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

type ChartDataItem = {
  id: string;
  total_price: number;
  profit: number | null;
  order_date: string;
};

type ProductRevenueChartsProps = {
  chartData: ChartDataItem[];
};

export default function ProductRevenueCharts({
  chartData: rawChartData,
}: ProductRevenueChartsProps) {
  const chartData = useMemo(() => {
    // Group by date
    const grouped = rawChartData.reduce(
      (acc, item) => {
        const date = format(parseISO(item.order_date), "MMM dd");
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, profit: 0 };
        }
        acc[date].revenue += item.total_price || 0;
        acc[date].profit += item.profit || 0;
        return acc;
      },
      {} as Record<string, { date: string; revenue: number; profit: number }>
    );

    // Convert to array and sort by date
    const dataArray = Object.values(grouped);

    // Sort chronologically
    dataArray.sort((a, b) => {
      const dateA = new Date(a.date + ", 2024"); // Add year for parsing
      const dateB = new Date(b.date + ", 2024");
      return dateA.getTime() - dateB.getTime();
    });

    return dataArray;
  }, [rawChartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-neutral-900 mb-2">
            {payload[0].payload.date}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Revenue:{" "}
              <span className="font-semibold">
                {formatCurrency(payload[0].value)}
              </span>
            </p>
            <p className="text-sm text-orange-600">
              Profit:{" "}
              <span className="font-semibold">
                {formatCurrency(payload[1].value)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-neutral-500" />
        <h2 className="text-lg font-semibold text-neutral-900">
          Revenue Over Time
        </h2>
      </div>

      <div className="p-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#737373", fontSize: 12 }}
                tickLine={{ stroke: "#e5e5e5" }}
              />
              <YAxis
                tick={{ fill: "#737373", fontSize: 12 }}
                tickLine={{ stroke: "#e5e5e5" }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Revenue"
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#f97316"
                strokeWidth={2}
                name="Profit"
                dot={{ fill: "#f97316", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-neutral-500">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}
