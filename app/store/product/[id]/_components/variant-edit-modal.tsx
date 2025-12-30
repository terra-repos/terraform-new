"use client";

import { useState, useRef, useCallback } from "react";
import { X, Loader2, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Database } from "@/types/database";
import { type ProductWithRelations } from "../page";
import { updateVariant } from "@/app/actions/store/update-variant";
import { uploadImage } from "@/app/actions/uploads/uploadImage";

type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"];

type VariantImage = { src: string };

type VariantEditModalProps = {
  variant: ProductVariant;
  product: ProductWithRelations;
  onClose: () => void;
  onSave: (variant: ProductVariant) => void;
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function VariantEditModal({
  variant,
  product,
  onClose,
  onSave,
}: VariantEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(variant.title || "");
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

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pricing calculations
  const basePrice =
    (variant.ocean_shipping_cost || 0) + (variant.price || 0);
  const customPrice = parseFloat(dropCustomPrice) || 0;
  const isValidPrice = customPrice > basePrice || customPrice === 0;
  const margin =
    customPrice > 0 ? ((customPrice - basePrice) / customPrice) * 100 : 0;
  const profitPerUnit = customPrice - basePrice;

  const showOceanPricing =
    product.drop_shipping_method === "ocean" ||
    product.drop_shipping_method === "both";

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

  const handleSave = async () => {
    if (showOceanPricing && customPrice > 0 && !isValidPrice) {
      setError("Your price must be higher than the base price");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateVariant(variant.id, {
        title: title || null,
        drop_custom_price: customPrice || null,
        drop_description: dropDescription || null,
        drop_public: dropPublic,
        images: images.length > 0 ? images : null,
      });

      if (result.success) {
        onSave({
          ...variant,
          title: title || null,
          drop_custom_price: customPrice || null,
          drop_description: dropDescription || null,
          drop_public: dropPublic,
          images: images.length > 0 ? images : null,
        });
      } else {
        setError(result.error || "Failed to save variant");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Edit Variant: {variant.title || "Untitled"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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

          {/* Pricing Section (only for ocean/both shipping) */}
          {showOceanPricing && (
            <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
              <h3 className="font-medium text-neutral-900">Pricing</h3>

              {/* Read-only pricing info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
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
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-neutral-700 font-medium">
                    Base Price
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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Variant Images
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden group"
                >
                  <img
                    src={img.src}
                    alt={`Variant image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}

              {/* Add image button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
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

          {/* In Store Toggle */}
          {variant.drop_approved && (
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div>
                <p className="font-medium text-neutral-900">
                  Show in Store
                </p>
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

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
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
            disabled={isSaving || isUploadingImage}
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
    </div>
  );
}
