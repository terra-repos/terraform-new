"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Package,
  BarChart3,
  Globe,
  ImageIcon,
} from "lucide-react";
import { Database } from "@/types/database";

type StoreData = Database["public"]["Tables"]["drop_stores"]["Row"];

export type StoreProduct = {
  id: string;
  title: string | null;
  thumbnail_image: string | null;
  drop_custom_price: number | null;
  profit_per_unit: number | null;
};

type Tab = "products" | "sales" | "traffic";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "products", label: "Manage Products", icon: Package },
  { id: "sales", label: "Sales Metrics", icon: BarChart3 },
  { id: "traffic", label: "Web Traffic", icon: Globe },
];

type StoreDashboardProps = {
  store: StoreData;
  products: StoreProduct[];
};

export default function StoreDashboard({
  store,
  products,
}: StoreDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const storeUrl = store.custom_domain || `https://useterra.com/${store.slug}`;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                {store.store_name}
              </h1>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 text-sm hover:text-orange-600 transition-colors"
              >
                useterra.com/{store.slug}
              </a>
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              View Store
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "products" && <ProductsTab products={products} />}
        {activeTab === "sales" && <SalesTab />}
        {activeTab === "traffic" && <TrafficTab />}
      </div>
    </div>
  );
}

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function ProductsTab({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
        <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          No Products Yet
        </h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          Once your samples are approved, you can add them to your store and set
          your retail prices.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-900 mb-4">
        Your Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/store/product/${product.id}`}
            className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all"
          >
            {/* Image */}
            <div className="aspect-square bg-neutral-100 relative">
              {product.thumbnail_image ? (
                <img
                  src={product.thumbnail_image}
                  alt={product.title || "Product"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-neutral-300" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                {product.title || "Untitled Product"}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-orange-600 font-medium">
                  {formatPrice(product.drop_custom_price)}
                </p>
                {product.profit_per_unit !== null && (
                  <p
                    className={`text-sm font-medium ${
                      product.profit_per_unit > 0
                        ? "text-green-600"
                        : product.profit_per_unit < 0
                        ? "text-red-600"
                        : "text-neutral-400"
                    }`}
                  >
                    {product.profit_per_unit > 0 ? "+" : ""}
                    {formatPrice(product.profit_per_unit)}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SalesTab() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
      <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        Sales Metrics
      </h3>
      <p className="text-neutral-500 mb-6 max-w-md mx-auto">
        Track your revenue, orders, and conversion rates. Connect your Stripe
        account to access real-time analytics.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-500 text-sm rounded-lg">
        Coming Soon
      </div>
    </div>
  );
}

function TrafficTab() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
      <Globe className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        Web Traffic Analytics
      </h3>
      <p className="text-neutral-500 mb-6 max-w-md mx-auto">
        See how visitors find your store, which products they view, and where
        they come from.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-500 text-sm rounded-lg">
        Coming Soon
      </div>
    </div>
  );
}
