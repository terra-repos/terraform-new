"use client";

import { useState, useRef, useCallback } from "react";
import { X, Loader2, Store, Plus, Trash2, GripVertical, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { addProductToStore } from "@/app/actions/store/add-product-to-store";
import { uploadImage } from "@/app/actions/uploads/uploadImage";

type VariantImage = { src: string };

type AddToStoreModalProps = {
  productId: string;
  variantId: string;
  productTitle: string;
  productThumbnail: string | null;
  variantTitle: string | null;
  variantImages: VariantImage[] | null;
  price: number | null;
  oceanShippingCost: number | null;
  onClose: () => void;
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function AddToStoreModal({
  productId,
  variantId,
  productTitle: initialProductTitle,
  productThumbnail: initialProductThumbnail,
  variantTitle: initialVariantTitle,
  variantImages: initialVariantImages,
  price,
  oceanShippingCost,
  onClose,
}: AddToStoreModalProps) {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const variantImagesInputRef = useRef<HTMLInputElement>(null);

  // Product fields
  const [productTitleValue, setProductTitleValue] = useState(initialProductTitle || "");
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(initialProductThumbnail);

  // Variant fields
  const [variantTitleValue, setVariantTitleValue] = useState(initialVariantTitle || "");
  const [images, setImages] = useState<VariantImage[]>(initialVariantImages || []);

  // Pricing fields
  const [customPrice, setCustomPrice] = useState("");

  // UI state
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingVariantImage, setIsUploadingVariantImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Calculate base price (using ocean shipping as the base)
  const factoryPrice = price || 0;
  const shippingCost = oceanShippingCost || 0;
  const basePrice = factoryPrice + shippingCost;
  const suggestedRetail = basePrice * 1.3;
  const suggestedProfit = suggestedRetail - basePrice;
  const enteredPrice = parseFloat(customPrice) || 0;
  const isValidPrice = enteredPrice > basePrice;
  const margin =
    enteredPrice > 0 ? ((enteredPrice - basePrice) / enteredPrice) * 100 : 0;
  const profitPerUnit = enteredPrice - basePrice;

  const canSubmit =
    isValidPrice &&
    productTitleValue.trim() &&
    images.length > 0 &&
    !isSaving;

  // Thumbnail upload
  const handleThumbnailUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setIsUploadingThumbnail(true);
    setError(null);

    try {
      const url = await uploadImage(file, "product-thumbnails");
      setThumbnailImage(url);
    } catch {
      setError("Failed to upload thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
    }
  }, []);

  // Variant image upload
  const handleVariantImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setIsUploadingVariantImage(true);
    setError(null);

    try {
      const url = await uploadImage(file, "variant-images");
      setImages((prev) => [...prev, { src: url }]);
    } catch {
      setError("Failed to upload image");
    } finally {
      setIsUploadingVariantImage(false);
    }
  }, []);

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

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = await addProductToStore({
        productId,
        variantId,
        productTitle: productTitleValue,
        thumbnailImage,
        variantTitle: variantTitleValue || null,
        variantImages: images,
        customPrice: enteredPrice,
      });

      if (!result.success) {
        setError(result.error || "Failed to add product to store");
        setIsSaving(false);
        return;
      }

      router.push(`/store/product/${productId}`);
    } catch {
      setError("An unexpected error occurred");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Store className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                Add to Store
              </h2>
              <p className="text-sm text-neutral-500">Set up your product listing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              You&apos;re setting up the default variant. You can add more variants later in the product editor.
            </p>
          </div>

          {/* Product Info Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-neutral-900">Product Info</h3>

            {/* Product Title */}
            <div>
              <label
                htmlFor="productTitle"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Product Title
              </label>
              <input
                id="productTitle"
                type="text"
                value={productTitleValue}
                onChange={(e) => setProductTitleValue(e.target.value)}
                placeholder="Enter product title"
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Thumbnail Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Thumbnail Image
              </label>
              <div className="flex items-center gap-4">
                {thumbnailImage ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-200">
                    <img
                      src={thumbnailImage}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setThumbnailImage(null)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={isUploadingThumbnail}
                    className="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
                  >
                    {isUploadingThumbnail ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailUpload(file);
                  }}
                  className="hidden"
                />
                <p className="text-xs text-neutral-500">
                  This appears on your store&apos;s product list
                </p>
              </div>
            </div>
          </div>

          {/* Variant Section */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <h3 className="font-medium text-neutral-900">Default Variant</h3>

            {/* Variant Title */}
            <div>
              <label
                htmlFor="variantTitle"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Variant Title <span className="text-neutral-400">(optional)</span>
              </label>
              <input
                id="variantTitle"
                type="text"
                value={variantTitleValue}
                onChange={(e) => setVariantTitleValue(e.target.value)}
                placeholder="e.g., Default, Standard, etc."
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Variant Images */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Variant Images
              </label>
              <p className="text-xs text-neutral-500 mb-3">
                Drag to reorder. First image will be the main image.
              </p>
              <div className="flex flex-wrap gap-3">
                {images.map((img, index) => (
                  <div
                    key={`${img.src}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing border-2 ${
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
                        <span className="p-1 bg-white/90 rounded text-neutral-600">
                          <GripVertical className="h-3 w-3" />
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="p-1 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-orange-500 text-white px-1 py-0.5 rounded font-medium">
                        Main
                      </span>
                    )}
                  </div>
                ))}

                {/* Add image button */}
                <button
                  onClick={() => variantImagesInputRef.current?.click()}
                  disabled={isUploadingVariantImage}
                  className="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  {isUploadingVariantImage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </button>
                <input
                  ref={variantImagesInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVariantImageUpload(file);
                  }}
                  className="hidden"
                />
              </div>
              {images.length === 0 && (
                <p className="text-xs text-red-600 mt-2">
                  At least one image is required
                </p>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
            <h3 className="font-medium text-neutral-900">Pricing</h3>

            {/* Read-only pricing info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-500">Factory Price</p>
                <p className="font-medium text-neutral-900">
                  {formatPrice(factoryPrice)}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Shipping</p>
                <p className="font-medium text-neutral-900">
                  {formatPrice(shippingCost)}
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-4 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-700 font-medium">Base Price</span>
                <span className="text-lg font-semibold text-neutral-900">
                  {formatPrice(basePrice)}
                </span>
              </div>

              {/* Suggested Retail & Profit */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Suggested Retail</p>
                  <p className="font-medium text-neutral-900">
                    {formatPrice(suggestedRetail)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">Suggested Profit</p>
                  <p className="font-medium text-green-600">
                    {formatPrice(suggestedProfit)}
                  </p>
                </div>
              </div>

              {/* Your Price Input */}
              <div className="pt-2">
                <label
                  htmlFor="customPrice"
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  Your Retail Price
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
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder={suggestedRetail.toFixed(2)}
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                      enteredPrice > 0 && !isValidPrice
                        ? "border-red-300 focus:ring-red-500"
                        : "border-neutral-300 focus:ring-orange-500"
                    }`}
                  />
                </div>
                {enteredPrice > 0 && !isValidPrice && (
                  <p className="text-xs text-red-600 mt-1">
                    Price must be higher than {formatPrice(basePrice)}
                  </p>
                )}
              </div>

              {/* Calculated values - show when user enters a valid price */}
              {enteredPrice > 0 && isValidPrice && (
                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-neutral-200">
                  <div>
                    <p className="text-neutral-500">Your Margin</p>
                    <p className="font-medium text-green-600">
                      {margin.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Your Profit per Unit</p>
                    <p className="font-medium text-green-600">
                      {formatPrice(profitPerUnit)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Store className="h-4 w-4" />
                Add to Store
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
