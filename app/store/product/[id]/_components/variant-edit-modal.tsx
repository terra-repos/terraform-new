"use client";

import { useState, useRef, useCallback } from "react";
import { X, Loader2, Plus, Trash2, GripVertical, AlertCircle, AlertTriangle } from "lucide-react";
import { Database } from "@/types/database";
import { type ProductWithRelations } from "../page";
import { updateVariant } from "@/app/actions/store/update-variant";
import { createVariant } from "@/app/actions/store/create-variant";
import { setVariantOptionValues } from "@/app/actions/store/manage-option-values";
import { uploadImage } from "@/app/actions/uploads/uploadImage";
import DeleteVariantModal from "./delete-variant-modal";

type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];
type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];

type VariantImage = { src: string };

type VariantEditModalProps = {
  variant: ProductVariant;
  product: ProductWithRelations;
  onClose: () => void;
  onSave: (variant: ProductVariant, optionValues?: OptionValue[]) => void;
  onDeleted?: () => void;
  isCreatingNew?: boolean;
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function getShippingMethodLabel(method: string | null): string {
  switch (method) {
    case "ocean":
      return "Ocean Shipping";
    case "air":
      return "Air Shipping";
    case "both":
      return "Ocean & Air Shipping";
    default:
      return "Standard";
  }
}

// Get current option values for this variant from the product
function getInitialOptionValues(
  product: ProductWithRelations,
  variantId: string
): Record<string, string> {
  const values: Record<string, string> = {};

  for (const option of product.options || []) {
    for (const optionValue of option.option_values || []) {
      if (optionValue.variant_id === variantId && optionValue.value) {
        values[option.id] = optionValue.value;
      }
    }
  }

  return values;
}

export default function VariantEditModal({
  variant,
  product,
  onClose,
  onSave,
  onDeleted,
  isCreatingNew = false,
}: VariantEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(variant.title || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dropCustomPrice, setDropCustomPrice] = useState(
    variant.drop_custom_price?.toString() || ""
  );
  const [dropDescription, setDropDescription] = useState(
    variant.drop_description || ""
  );
  const [dropPublic, setDropPublic] = useState(variant.drop_public);
  const [images, setImages] = useState<VariantImage[]>(
    (variant.images as VariantImage[]) || []
  );

  // Option values state: { optionId: value }
  const [optionValues, setOptionValues] = useState<Record<string, string>>(
    getInitialOptionValues(product, variant.id)
  );

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Pricing calculations
  const basePrice =
    (variant.ocean_shipping_cost || 0) + (variant.price || 0);
  const customPrice = parseFloat(dropCustomPrice) || 0;
  const isValidPrice = customPrice > basePrice || customPrice === 0;
  const margin =
    customPrice > 0 ? ((customPrice - basePrice) / customPrice) * 100 : 0;
  const profitPerUnit = customPrice - basePrice;

  const showPricing =
    product.drop_shipping_method === "ocean" ||
    product.drop_shipping_method === "air" ||
    product.drop_shipping_method === "both";

  const options = product.options || [];

  // Validation checks
  const hasImages = images.length > 0;
  const missingOptionValues = options.filter(
    (opt) => !optionValues[opt.id]?.trim()
  );
  const hasPriceError = showPricing && customPrice > 0 && !isValidPrice;

  // Build validation errors list
  const validationErrors: string[] = [];
  if (!hasImages) {
    validationErrors.push("At least one image is required");
  }
  if (missingOptionValues.length > 0) {
    const missingNames = missingOptionValues
      .map((opt) => opt.option_type)
      .join(", ");
    validationErrors.push(`Missing option values: ${missingNames}`);
  }
  if (hasPriceError) {
    validationErrors.push(
      `Price must be higher than base price (${formatPrice(basePrice)})`
    );
  }
  if (error) {
    validationErrors.push(error);
  }

  const canSave = validationErrors.length === 0;

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const url = await uploadImage(file, "variant-images");
      setImages((prev) => [...prev, { src: url }]);
    } catch {
      setError("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleOptionValueChange = (optionId: string, value: string) => {
    setOptionValues((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleSave = async () => {
    if (showPricing && customPrice > 0 && !isValidPrice) {
      setError("Your price must be higher than the base price");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isCreatingNew) {
        // Create new variant
        const createResult = await createVariant({
          product_id: product.id,
          title: title || null,
          drop_custom_price: customPrice || null,
          drop_description: dropDescription || null,
          drop_public: dropPublic,
          images: images.length > 0 ? images : null,
          price: variant.price,
          ocean_shipping_cost: variant.ocean_shipping_cost,
          air_shipping_cost: variant.air_shipping_cost,
        });

        if (!createResult.success || !createResult.variantId) {
          setError(createResult.error || "Failed to create variant");
          setIsSaving(false);
          return;
        }

        // Set option values for the new variant
        const optionValuesToSave = Object.entries(optionValues)
          .filter(([, value]) => value.trim() !== "")
          .map(([optionId, value]) => ({ optionId, value }));

        const optionValuesResult = await setVariantOptionValues(
          createResult.variantId,
          product.id,
          optionValuesToSave
        );

        if (!optionValuesResult.success) {
          setError(optionValuesResult.error || "Failed to save option values");
          setIsSaving(false);
          return;
        }

        // Call onSave to trigger refresh
        onSave(
          {
            ...variant,
            id: createResult.variantId,
            title: title || null,
            drop_custom_price: customPrice || null,
            drop_description: dropDescription || null,
            drop_public: dropPublic,
            images: images.length > 0 ? images : null,
          },
          optionValuesResult.optionValues
        );
      } else {
        // Update existing variant
        const variantResult = await updateVariant(variant.id, {
          title: title || null,
          drop_custom_price: customPrice || null,
          drop_description: dropDescription || null,
          drop_public: dropPublic,
          images: images.length > 0 ? images : null,
        });

        if (!variantResult.success) {
          setError(variantResult.error || "Failed to save variant");
          setIsSaving(false);
          return;
        }

        // Update option values
        const optionValuesToSave = Object.entries(optionValues)
          .filter(([, value]) => value.trim() !== "")
          .map(([optionId, value]) => ({ optionId, value }));

        const optionValuesResult = await setVariantOptionValues(
          variant.id,
          product.id,
          optionValuesToSave
        );

        if (!optionValuesResult.success) {
          setError(optionValuesResult.error || "Failed to save option values");
          setIsSaving(false);
          return;
        }

        onSave(
          {
            ...variant,
            title: title || null,
            drop_custom_price: customPrice || null,
            drop_description: dropDescription || null,
            drop_public: dropPublic,
            images: images.length > 0 ? images : null,
          },
          optionValuesResult.optionValues
        );
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-3 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-neutral-700">
              {isCreatingNew ? "Create New Variant" : "Edit Variant"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{validationErrors.join(" • ")}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="variantTitle"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Variant Title
            </label>
            <input
              id="variantTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter variant title"
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Images with drag and drop */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Variant Images
            </label>
            <p className="text-xs text-neutral-500 mb-3">
              Drag to reorder. First image will be the thumbnail.
            </p>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div
                  key={`${img.src}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative w-24 h-24 rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing border-2 ${
                    draggedIndex === index
                      ? "border-orange-500 opacity-50"
                      : "border-transparent"
                  } ${index === 0 ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
                >
                  <img
                    src={img.src}
                    alt={`Variant image ${index + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span className="p-1.5 bg-white/90 rounded text-neutral-600">
                        <GripVertical className="h-4 w-4" />
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">
                      Main
                    </span>
                  )}
                </div>
              ))}

              {/* Add image button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="w-24 h-24 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              value={dropDescription}
              onChange={(e) => setDropDescription(e.target.value)}
              placeholder="Enter variant description for your store"
              rows={3}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Option Values */}
          {options.length > 0 && (
            <div className="bg-purple-50 rounded-xl p-4 space-y-4">
              <h3 className="font-medium text-neutral-900">Option Values</h3>
              <p className="text-xs text-neutral-500">
                Assign values for each option type (e.g., Size: Large, Color:
                Blue)
              </p>
              <div className="grid grid-cols-2 gap-4">
                {options.map((option) => (
                  <div key={option.id}>
                    <label
                      htmlFor={`option-${option.id}`}
                      className="block text-sm font-medium text-neutral-700 mb-1.5"
                    >
                      {option.option_type}
                    </label>
                    <input
                      id={`option-${option.id}`}
                      type="text"
                      value={optionValues[option.id] || ""}
                      onChange={(e) =>
                        handleOptionValueChange(option.id, e.target.value)
                      }
                      placeholder={`Enter ${option.option_type.toLowerCase()}`}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {showPricing && (
            <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-neutral-900">Pricing</h3>
                <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded-full">
                  {getShippingMethodLabel(product.drop_shipping_method)}
                </span>
              </div>

              {/* Read-only pricing info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Factory Price</p>
                  <p className="font-medium text-neutral-900">
                    {formatPrice(variant.price)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Ocean Shipping</p>
                  <p className="font-medium text-neutral-900">
                    {formatPrice(variant.ocean_shipping_cost)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Air Shipping</p>
                  <p className="font-medium text-neutral-900">
                    {formatPrice(variant.air_shipping_cost)}
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-neutral-700 font-medium">
                    Base Price (Ocean)
                  </span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {formatPrice(basePrice)}
                  </span>
                </div>

                {/* Your Price Input */}
                <div>
                  <label
                    htmlFor="customPrice"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Your Price (must be higher than base)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                      $
                    </span>
                    <input
                      id="customPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={dropCustomPrice}
                      onChange={(e) => setDropCustomPrice(e.target.value)}
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                        customPrice > 0 && !isValidPrice
                          ? "border-red-300 focus:ring-red-500"
                          : "border-neutral-300 focus:ring-orange-500"
                      }`}
                    />
                  </div>
                  {customPrice > 0 && !isValidPrice && (
                    <p className="text-xs text-red-600 mt-1">
                      Price must be higher than {formatPrice(basePrice)}
                    </p>
                  )}
                </div>

                {/* Calculated values */}
                {customPrice > 0 && isValidPrice && (
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Margin</p>
                      <p className="font-medium text-green-600">
                        {margin.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Profit per Unit</p>
                      <p className="font-medium text-green-600">
                        {formatPrice(profitPerUnit)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* In Store Toggle */}
          {variant.drop_approved && (
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-900">Show in Store</p>
                <p className="text-sm text-neutral-500">
                  Make this variant visible on your storefront
                </p>
              </div>
              <button
                onClick={() => setDropPublic(!dropPublic)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  dropPublic ? "bg-orange-500" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    dropPublic ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          )}

          {!variant.drop_approved && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                This variant needs to be approved before it can be shown in your
                store.
              </p>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border border-red-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-red-50 border-b border-red-200">
              <h3 className="font-medium text-red-900 text-sm">Danger Zone</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">
                      Delete Variant
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Permanently delete this variant. This cannot be undone.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || isSaving || isUploadingImage}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Delete Variant Modal */}
      {showDeleteModal && (
        <DeleteVariantModal
          variantId={variant.id}
          variantTitle={variant.title || "Untitled Variant"}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            onClose();
            onDeleted?.();
          }}
        />
      )}
    </div>
  );
}
