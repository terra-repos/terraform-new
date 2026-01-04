"use client";

import { useState, useMemo, useEffect } from "react";
import { subDays } from "date-fns";
import Link from "next/link";
import DateRangePicker from "@/app/store/sales/_components/date-range-picker";
import ProductRevenueCharts from "./product-revenue-charts";
import OrdersTable from "./orders-table";
import ProductCustomerInsights from "./product-customer-insights";
import MostPopularVariants from "./most-popular-variants";
import { getProductOrderItems } from "@/app/actions/store/get-product-order-items";
import { getProductVariantAnalytics } from "@/app/actions/store/get-product-variant-analytics";

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
  product_variants: {
    id: string;
    title: string;
    sku: string;
  };
};

type ChartDataItem = {
  id: string;
  total_price: number;
  profit: number | null;
  order_date: string;
};

type VariantData = {
  variant_id: string;
  variant_title: string;
  total_units_sold: number;
  order_count: number;
  total_profit: number;
  total_revenue: number;
  option_values: Array<{ optionType: string; value: string }>;
};

type ProductAnalyticsDetailProps = {
  product: {
    id: string;
    title: string;
    thumbnail_image: string | null;
  };
  chartData: ChartDataItem[];
  initialOrderItems: OrderItemWithRelations[];
  initialPagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  initialVariants: VariantData[];
  productId: string;
  organizationId: string;
};

export default function ProductAnalyticsDetail({
  product,
  chartData,
  initialOrderItems,
  initialPagination,
  initialVariants,
  productId,
  organizationId,
}: ProductAnalyticsDetailProps) {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Data state
  const [orderItems, setOrderItems] = useState(initialOrderItems);
  const [pagination, setPagination] = useState(initialPagination);
  const [variants, setVariants] = useState(initialVariants);

  // Filter chart data by date
  const filteredChartData = useMemo(() => {
    return chartData.filter((item) => {
      const orderDate = new Date(item.order_date);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }, [chartData, dateRange]);

  // Fetch order items when page, search, or date range changes
  useEffect(() => {
    const fetchOrderItems = async () => {
      setIsLoading(true);
      try {
        const result = await getProductOrderItems({
          productId,
          organizationId,
          page: currentPage,
          limit: 50,
          searchQuery,
          startDate: dateRange.start,
          endDate: dateRange.end,
        });
        setOrderItems(result.orderItems);
        setPagination({
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        });
      } catch (error) {
        console.error("Error fetching order items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderItems();
  }, [currentPage, searchQuery, dateRange, productId, organizationId]);

  // Fetch variant analytics when date range changes
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const result = await getProductVariantAnalytics({
          productId,
          organizationId,
          startDate: dateRange.start,
          endDate: dateRange.end,
          topN: 3,
        });
        setVariants(result.topVariants);
      } catch (error) {
        console.error("Error fetching variant analytics:", error);
      }
    };

    fetchVariants();
  }, [dateRange, productId, organizationId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
          <Link href="/store" className="hover:text-neutral-900">
            Store
          </Link>
          <span>/</span>
          <Link
            href={`/store/product/${productId}`}
            className="hover:text-neutral-900"
          >
            {product.title}
          </Link>
          <span>/</span>
          <span className="text-neutral-900">Analytics</span>
        </div>

        {/* Date Picker */}
        <div className="flex justify-end mb-6">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Most Popular Variants */}
        <div className="mb-8">
          <MostPopularVariants variants={variants} />
        </div>

        {/* Charts */}
        <div className="mb-8">
          <ProductRevenueCharts chartData={filteredChartData} />
        </div>

        {/* Orders Table */}
        <div className="mb-8">
          <OrdersTable
            orderItems={orderItems}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Customer Insights */}
        <div>
          <ProductCustomerInsights orderItems={orderItems} />
        </div>
      </div>
    </div>
  );
}
