"use client";

import { X } from "lucide-react";
import Image from "next/image";
import type { OrderItemDetail } from "../page";

type ProductionDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  item: OrderItemDetail;
};

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) {
    return "—";
  }
  return `$${value.toFixed(2)}`;
}

export default function ProductionDetailsModal({
  open,
  onClose,
  item,
}: ProductionDetailsModalProps) {
  if (!open) return null;

  // Find the selected sample manufacturer (is_selected_for_customer = true)
  const selectedManufacturer = item.sample_manufacturers.find(
    (sm) => sm.is_selected_for_customer === true
  );

  // Sample Cost: sample_price from the selected sample_manufacturer
  const sampleCost = selectedManufacturer?.sample_price ?? null;

  // Production Quote: variant.price
  const productionQuote = item.price;

  // Shipping Estimate: variant.ocean_shipping_cost
  const shippingEstimate = item.ocean_shipping_cost;

  // Our Margin: fixed 20%
  const marginPercent = 20;

  // Base Price: variant.price + variant.ocean_shipping_cost
  const basePrice =
    productionQuote && productionQuote > 0 && shippingEstimate && shippingEstimate > 0
      ? productionQuote + shippingEstimate
      : null;

  // Suggested Retail: base price * 1.3
  const suggestedRetail = basePrice ? basePrice * 1.3 : null;

  // Profit per Sale: Retail - Base
  const profitPerSale = suggestedRetail && basePrice ? suggestedRetail - basePrice : null;

  const hasPricing = productionQuote && productionQuote > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            Production Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Pricing Section */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Pricing
            </h3>

            {!hasPricing ? (
              <p className="text-neutral-500 text-sm">
                Price not set yet. Pricing will be available once your sample is quoted.
              </p>
            ) : (
              <div className="space-y-3">
                {sampleCost !== null && (
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-600">Sample Cost:</span>
                    <span className="font-medium text-neutral-900">
                      {item.quantity} x {formatPrice(sampleCost)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-neutral-600">Production Quote:</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(productionQuote)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-600">Our Margin:</span>
                  <span className="font-medium text-neutral-900">
                    {marginPercent}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Shipping Estimate:</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(shippingEstimate)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-600">Base Price:</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(basePrice)}
                  </span>
                </div>
                <div className="flex justify-between py-2 pt-4 border-t border-neutral-200">
                  <span className="text-neutral-600">Suggested Retail:</span>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(suggestedRetail)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-neutral-600">Profit per Sale:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(profitPerSale)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dimensions Section */}
          {item.dimensions && Object.keys(item.dimensions).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Dimensions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(item.dimensions).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <span className="text-sm text-neutral-500 capitalize">
                      {key}:
                    </span>
                    <span className="ml-1 font-medium text-neutral-900">
                      {typeof value === "object" ? JSON.stringify(value) : value}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reference Materials */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Reference Materials
            </h3>

            {/* Images */}
            {item.variant_images && item.variant_images.length > 0 ? (
              <div className="mb-4">
                <p className="text-sm text-neutral-500 mb-2">(Images)</p>
                <div className="flex flex-wrap gap-2">
                  {item.variant_images.map((img, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200"
                    >
                      <Image
                        src={img.src}
                        alt={`Reference ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 mb-2">(Images) None</p>
            )}

            {/* Notes */}
            <div>
              <p className="text-sm text-neutral-500 mb-2">(Note)</p>
              <p className="text-sm text-neutral-700">
                {item.notes
                  ? typeof item.notes === "object" && item.notes !== null
                    ? (item.notes as { note?: string }).note || JSON.stringify(item.notes)
                    : item.notes
                  : "No notes provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
