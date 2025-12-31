"use client";

import { useState } from "react";
import { ImageIcon, Edit2, Check, AlertCircle } from "lucide-react";
import { type ProductWithRelations } from "../page";
import { Database } from "@/types/database";
import VariantEditModal from "./variant-edit-modal";

type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];

type VariantsEditorProps = {
  product: ProductWithRelations;
  onUpdate: (product: ProductWithRelations) => void;
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function calculatePricing(variant: ProductVariant) {
  const basePrice =
    (variant.ocean_shipping_cost || 0) + (variant.price || 0);
  const dropCustomPrice = variant.drop_custom_price || 0;

  const isValidPrice = dropCustomPrice > basePrice;
  const margin =
    dropCustomPrice > 0
      ? ((dropCustomPrice - basePrice) / dropCustomPrice) * 100
      : 0;
  const profitPerUnit = dropCustomPrice - basePrice;

  return {
    basePrice,
    dropCustomPrice,
    isValidPrice,
    margin,
    profitPerUnit,
  };
}

// Get option values for a specific variant
function getVariantOptionValues(
  product: ProductWithRelations,
  variantId: string
): { optionType: string; value: string }[] {
  const result: { optionType: string; value: string }[] = [];

  for (const option of product.options || []) {
    for (const optionValue of option.option_values || []) {
      if (optionValue.variant_id === variantId && optionValue.value) {
        result.push({
          optionType: option.option_type,
          value: optionValue.value,
        });
      }
    }
  }

  return result;
}

export default function VariantsEditor({
  product,
  onUpdate,
}: VariantsEditorProps) {
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );

  const variants = product.product_variants || [];

  const handleVariantUpdate = (
    updatedVariant: ProductVariant,
    updatedOptionValues?: OptionValue[]
  ) => {
    // Update the variant
    const updatedProduct = {
      ...product,
      product_variants: variants.map((v) =>
        v.id === updatedVariant.id ? updatedVariant : v
      ),
    };

    // If option values were updated, update them in the options array
    if (updatedOptionValues) {
      updatedProduct.options = product.options.map((option) => ({
        ...option,
        option_values: [
          // Keep option values for other variants
          ...option.option_values.filter(
            (ov) => ov.variant_id !== updatedVariant.id
          ),
          // Add updated values for this variant
          ...updatedOptionValues.filter((ov) => ov.option_id === option.id),
        ],
      }));
    }

    onUpdate(updatedProduct);
    setEditingVariant(null);
  };

  // Check if ocean or both shipping method
  const showOceanPricing =
    product.drop_shipping_method === "ocean" ||
    product.drop_shipping_method === "both";

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-medium text-neutral-900">Variants</h2>
        </div>

        <div className="p-6">
          {variants.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">No variants for this product.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant) => {
                const pricing = calculatePricing(variant);
                const images = variant.images as { src: string }[] | null;
                const thumbnailSrc =
                  images?.[0]?.src || product.thumbnail_image || null;
                const optionValues = getVariantOptionValues(product, variant.id);

                return (
                  <div
                    key={variant.id}
                    className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt={variant.title || "Variant"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-neutral-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium text-neutral-900">
                              {variant.title || "Untitled Variant"}
                            </h3>

                            {/* Option Value Badges */}
                            {optionValues.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {optionValues.map((ov, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                                  >
                                    {ov.optionType}: {ov.value}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Status Badges */}
                            <div className="flex items-center gap-2 mt-1.5">
                              {variant.drop_approved ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <Check className="h-3 w-3" />
                                  Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-500 text-xs font-medium rounded-full">
                                  Not Approved
                                </span>
                              )}

                              {variant.drop_approved && variant.drop_public && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  In Store
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Edit button */}
                          <button
                            onClick={() => setEditingVariant(variant)}
                            className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Pricing info */}
                        {showOceanPricing && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-neutral-500 text-xs">
                                Base Price
                              </p>
                              <p className="font-medium text-neutral-900">
                                {formatPrice(pricing.basePrice)}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-xs">
                                Your Price
                              </p>
                              <p
                                className={`font-medium ${
                                  pricing.dropCustomPrice > 0 &&
                                  !pricing.isValidPrice
                                    ? "text-red-600"
                                    : "text-neutral-900"
                                }`}
                              >
                                {pricing.dropCustomPrice > 0
                                  ? formatPrice(pricing.dropCustomPrice)
                                  : "Not set"}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-xs">Margin</p>
                              <p
                                className={`font-medium ${
                                  pricing.margin > 0
                                    ? "text-green-600"
                                    : "text-neutral-400"
                                }`}
                              >
                                {pricing.dropCustomPrice > 0
                                  ? formatPercent(pricing.margin)
                                  : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-500 text-xs">
                                Profit/Unit
                              </p>
                              <p
                                className={`font-medium ${
                                  pricing.profitPerUnit > 0
                                    ? "text-green-600"
                                    : pricing.profitPerUnit < 0
                                    ? "text-red-600"
                                    : "text-neutral-400"
                                }`}
                              >
                                {pricing.dropCustomPrice > 0
                                  ? formatPrice(pricing.profitPerUnit)
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Price validation warning */}
                        {showOceanPricing &&
                          pricing.dropCustomPrice > 0 &&
                          !pricing.isValidPrice && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>
                                Your price must be higher than the base price
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingVariant && (
        <VariantEditModal
          variant={editingVariant}
          product={product}
          onClose={() => setEditingVariant(null)}
          onSave={handleVariantUpdate}
        />
      )}
    </>
  );
}
