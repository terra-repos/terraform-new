"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check } from "lucide-react";

type OrderDetailProps = {
  order: {
    id: string;
    order_number: string;
    order_date: string;
    contact_email: string;
    status: string;
    subtotal: number;
    tax: number;
    shipping_cost: number;
    total_cost: number;
    shipping_address: any;
    billing_address: any;
    order_items: OrderItem[];
    drop_session_coupon_usage: CouponUsage[];
  };
  trackingBaseUrl: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit: number;
  product_variants: {
    id: string;
    title: string;
    products: {
      id: string;
      title: string;
      thumbnail_image: string | null;
    };
    option_values: OptionValue[];
  };
};

type OptionValue = {
  id: string;
  value: string;
  options: {
    id: string;
    option_type: string;
  };
};

type CouponUsage = {
  id: string;
  discount_applied: number;
  drop_store_coupons: {
    coupon_code: string;
    discount_type: string;
    discount_value: number;
  };
};

export default function OrderDetail({ order, trackingBaseUrl }: OrderDetailProps) {
  const [copied, setCopied] = useState(false);

  // Helper functions
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (addressJson: any) => {
    if (!addressJson) return "No address provided";

    try {
      const addr = typeof addressJson === "string" ? JSON.parse(addressJson) : addressJson;
      const parts = [
        addr.name || addr.full_name,
        addr.address1 || addr.street,
        addr.address2,
        [addr.city, addr.state || addr.province, addr.zip || addr.postal_code].filter(Boolean).join(", "),
        addr.country,
      ].filter(Boolean);

      return parts.join("\n");
    } catch {
      return "Invalid address format";
    }
  };

  const calculateTotalProfit = (orderItems: OrderItem[]) => {
    return orderItems.reduce((sum, item) => sum + (item.profit || 0), 0);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "completed" || statusLower === "delivered") {
      return "bg-green-100 text-green-800";
    }
    if (statusLower === "shipped" || statusLower === "partial_shipped") {
      return "bg-blue-100 text-blue-800";
    }
    if (statusLower === "in_production") {
      return "bg-orange-100 text-orange-800";
    }
    if (statusLower === "pending" || statusLower === "approved") {
      return "bg-purple-100 text-purple-800";
    }
    if (statusLower === "cancelled") {
      return "bg-red-100 text-red-800";
    }
    return "bg-neutral-100 text-neutral-800";
  };

  const addressesMatch = () => {
    const shipping = JSON.stringify(order.shipping_address);
    const billing = JSON.stringify(order.billing_address);
    return shipping === billing;
  };

  const totalProfit = calculateTotalProfit(order.order_items);
  const profitMargin = order.total_cost > 0 ? (totalProfit / order.total_cost) * 100 : 0;
  const discount = order.drop_session_coupon_usage?.[0]?.discount_applied || 0;
  const coupon = order.drop_session_coupon_usage?.[0]?.drop_store_coupons;
  const trackingUrl = `${trackingBaseUrl}/order/${order.id}`;

  const copyTrackingUrl = async () => {
    await navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/store?tab=orders"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Order #{order.order_number}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                {formatDate(order.order_date)}
              </p>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {order.status?.replace(/_/g, " ") || "Unknown"}
            </span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(order.shipping_cost)}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="font-semibold text-neutral-900 text-lg">
                  {formatCurrency(order.total_cost)}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-neutral-900">Total Profit</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {formatCurrency(totalProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Profit Margin</span>
                  <span className="text-neutral-600">{profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">
                  Contact Email
                </h3>
                <p className="text-sm text-neutral-900">{order.contact_email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">
                  Shipping Address
                </h3>
                <p className="text-sm text-neutral-900 whitespace-pre-line">
                  {formatAddress(order.shipping_address)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">
                  Billing Address
                </h3>
                {addressesMatch() ? (
                  <p className="text-sm text-neutral-500 italic">
                    Same as shipping address
                  </p>
                ) : (
                  <p className="text-sm text-neutral-900 whitespace-pre-line">
                    {formatAddress(order.billing_address)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Discount Section */}
        {discount > 0 && coupon && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-green-900 mb-1">
                  Discount Applied
                </h2>
                <p className="text-sm text-green-700">
                  Coupon: <span className="font-mono font-bold">{coupon.coupon_code}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(discount)}
                </p>
                <p className="text-xs text-green-700">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}% off`
                    : `$${coupon.discount_value} off`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.order_items.map((item) => {
              const product = item.product_variants?.products;
              const variant = item.product_variants;
              const productTitle = product?.title || "Unknown Product";
              const variantTitle = variant?.title || "";
              const productName = variantTitle
                ? `${productTitle} - ${variantTitle}`
                : productTitle;

              const optionValues: { name: string; value: string }[] = [];
              const variantOptionValues = variant?.option_values || [];

              variantOptionValues.forEach((optionValue: any) => {
                if (optionValue && optionValue.value) {
                  optionValues.push({
                    name: optionValue.options?.option_type || "Option",
                    value: optionValue.value,
                  });
                }
              });

              const profitPerUnit = item.quantity > 0 ? item.profit / item.quantity : 0;

              return (
                <div
                  key={item.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-4">
                    {product?.thumbnail_image && (
                      <img
                        src={product.thumbnail_image}
                        alt={productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 mb-1">
                        {productName}
                      </h3>

                      {optionValues.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {optionValues.map((opt, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700"
                            >
                              {opt.name}: {opt.value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-neutral-600">Quantity:</span>
                          <span className="ml-1 font-medium text-neutral-900">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-600">Unit Price:</span>
                          <span className="ml-1 font-medium text-neutral-900">
                            {formatCurrency(item.unit_price)}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-600">Profit/Unit:</span>
                          <span className="ml-1 font-medium text-green-600">
                            {formatCurrency(profitPerUnit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-600">Total Profit:</span>
                          <span className="ml-1 font-semibold text-green-600">
                            {formatCurrency(item.profit)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-neutral-100">
                        <span className="text-sm text-neutral-600">Item Total:</span>
                        <span className="ml-1 font-semibold text-neutral-900">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Order Tracking
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-neutral-600 mb-2">
                Share this tracking link with your customer:
              </p>
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium break-all"
              >
                {trackingUrl}
              </a>
            </div>
            <button
              onClick={copyTrackingUrl}
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
