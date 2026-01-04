"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ImageIcon, Edit2, Check, AlertCircle, Sparkles, Plus, ChevronDown } from "lucide-react";
import { type ProductWithRelations } from "../page";
import { Database } from "@/types/database";
import VariantEditModal from "./variant-edit-modal";
import AIVariantsModal from "./ai-variants-modal";

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

// Build map of option types to their unique values for filtering
function buildFilterOptions(product: ProductWithRelations) {
  const filterMap: Record<string, { optionType: string; values: Set<string> }> = {};

  for (const option of product.options || []) {
    const uniqueValues = new Set<string>();
    for (const optionValue of option.option_values || []) {
      if (optionValue.value) {
        uniqueValues.add(optionValue.value);
      }
    }

    if (uniqueValues.size > 0) {
      filterMap[option.id] = {
        optionType: option.option_type,
        values: uniqueValues,
      };
    }
  }

  return filterMap;
}

// Filter variants based on active filters (AND logic)
function filterVariants(
  variants: ProductVariant[],
  activeFilters: Record<string, string>,
  product: ProductWithRelations
): ProductVariant[] {
  if (Object.keys(activeFilters).length === 0) {
    return variants; // No filters active
  }

  return variants.filter((variant) => {
    // Check if variant matches ALL active filters (AND logic)
    return Object.entries(activeFilters).every(([optionId, selectedValue]) => {
      if (!selectedValue) return true; // Empty filter = show all

      // Find the option value for this variant and option
      const option = product.options?.find((o) => o.id === optionId);
      if (!option) return true;

      const variantOptionValue = option.option_values?.find(
        (ov) => ov.variant_id === variant.id
      );

      return variantOptionValue?.value === selectedValue;
    });
  });
}

// FilterDropdown component for option filtering
type FilterDropdownProps = {
  optionType: string;
  values: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

function FilterDropdown({
  optionType,
  values,
  selectedValue,
  onSelect,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
          selectedValue
            ? "bg-orange-50 text-orange-600 border-orange-200"
            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
        }`}
      >
        <span>{optionType}</span>
        {selectedValue && (
          <>
            <span className="text-neutral-400">:</span>
            <span>{selectedValue}</span>
          </>
        )}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-[160px]">
          <button
            onClick={() => {
              onSelect("");
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors ${
              !selectedValue ? "text-orange-600 font-medium" : "text-neutral-700"
            }`}
          >
            All {optionType}s
          </button>
          <div className="border-t border-neutral-100" />
          {Array.from(values).sort().map((value) => (
            <button
              key={value}
              onClick={() => {
                onSelect(value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                selectedValue === value
                  ? "text-orange-600 font-medium"
                  : "text-neutral-700"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VariantsEditor({
  product,
  onUpdate,
}: VariantsEditorProps) {
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );
  const [showAIModal, setShowAIModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const variants = product.product_variants || [];

  // Build available filter options
  const filterOptions = useMemo(() => buildFilterOptions(product), [product]);

  // Apply filters to variants
  const filteredVariants = useMemo(
    () => filterVariants(variants, activeFilters, product),
    [variants, activeFilters, product]
  );

  const handleCreateNewVariant = () => {
    // Get the most recent variant (last in the array)
    const mostRecentVariant = variants[variants.length - 1];

    if (mostRecentVariant) {
      // Create a template variant based on the most recent one
      // but with a temporary ID and cleared personal data
      const templateVariant: ProductVariant = {
        ...mostRecentVariant,
        id: 'new-variant-' + Date.now(), // Temporary ID
        title: null,
        images: null,
        drop_description: null,
        drop_public: false,
      };

      setEditingVariant(templateVariant);
      setIsCreatingNew(true);
    }
  };

  const handleVariantUpdate = (
    updatedVariant: ProductVariant,
    updatedOptionValues?: OptionValue[]
  ) => {
    if (isCreatingNew) {
      // For new variants, just refresh the page to get updated data
      window.location.reload();
    } else {
      // Update existing variant
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
      setIsCreatingNew(false);
    }
  };

  const handleModalClose = () => {
    setEditingVariant(null);
    setIsCreatingNew(false);
  };

  // Check if ocean or both shipping method
  const showOceanPricing =
    product.drop_shipping_method === "ocean" ||
    product.drop_shipping_method === "both";

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-neutral-900">Variants</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNewVariant}
                disabled={variants.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Make New Variant
              </button>
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Edit with AI
              </button>
            </div>
          </div>

          {/* Filter Row */}
          {Object.keys(filterOptions).length > 0 && variants.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Filter by:
              </span>
              {Object.entries(filterOptions).map(([optionId, { optionType, values }]) => (
                <FilterDropdown
                  key={optionId}
                  optionType={optionType}
                  values={Array.from(values)}
                  selectedValue={activeFilters[optionId] || ""}
                  onSelect={(value) => {
                    setActiveFilters((prev) => ({
                      ...prev,
                      [optionId]: value,
                    }));
                  }}
                />
              ))}
              {Object.values(activeFilters).some((v) => v) && (
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-xs text-neutral-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6">
          {variants.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">No variants for this product.</p>
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">
                No variants match the selected filters
              </p>
              {Object.values(activeFilters).some((v) => v) && (
                <button
                  onClick={() => setActiveFilters({})}
                  className="mt-2 text-sm text-orange-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVariants.map((variant) => {
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

          {/* Filter count */}
          {Object.values(activeFilters).some((v) => v) && filteredVariants.length > 0 && (
            <p className="text-xs text-neutral-500 mt-4">
              Showing {filteredVariants.length} of {variants.length} variants
            </p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingVariant && (
        <VariantEditModal
          variant={editingVariant}
          product={product}
          onClose={handleModalClose}
          onSave={handleVariantUpdate}
          onDeleted={() => {
            // Trigger a page refresh to get updated product data
            window.location.reload();
          }}
          isCreatingNew={isCreatingNew}
        />
      )}

      {/* AI Variants Modal */}
      {showAIModal && (
        <AIVariantsModal
          product={product}
          onClose={() => setShowAIModal(false)}
          onSuccess={() => {
            // Trigger a page refresh to get updated product data
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
