"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ImageIcon, Loader2, Check, X, Camera } from "lucide-react";
import { type ProductWithRelations } from "../page";
import { updateProduct } from "@/app/actions/store/update-product";
import { uploadImage } from "@/app/actions/uploads/uploadImage";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type ProductInfoSectionProps = {
  product: ProductWithRelations;
  onUpdate: (product: ProductWithRelations) => void;
};

export default function ProductInfoSection({
  product,
  onUpdate,
}: ProductInfoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(product.title || "");
  const [slug, setSlug] = useState(product.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!product.slug);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    product.thumbnail_image
  );
  const [bodyHtml, setBodyHtml] = useState(product.body_html || "");

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  // Track if there are unsaved changes
  const hasChanges =
    title !== (product.title || "") ||
    slug !== (product.slug || "") ||
    thumbnailPreview !== product.thumbnail_image ||
    bodyHtml !== (product.body_html || "");

  // Auto-slugify title if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  };

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to GCS
      setIsUploadingImage(true);
      setError(null);
      try {
        const url = await uploadImage(file, "product-thumbnails");
        setThumbnailPreview(url);
      } catch {
        setError("Failed to upload image. Please try again.");
        setThumbnailPreview(product.thumbnail_image);
      } finally {
        setIsUploadingImage(false);
      }
    },
    [product.thumbnail_image]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    setError(null);
    setSaveStatus("idle");

    try {
      const result = await updateProduct(product.id, {
        title: title || null,
        slug: slug || null,
        thumbnail_image: thumbnailPreview,
        body_html: bodyHtml || null,
      });

      if (result.success) {
        setSaveStatus("success");
        onUpdate({
          ...product,
          title: title || null,
          slug: slug || null,
          thumbnail_image: thumbnailPreview,
          body_html: bodyHtml || null,
        });
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setError(result.error || "Failed to save");
        setSaveStatus("error");
      }
    } catch {
      setError("An unexpected error occurred");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-medium text-neutral-900">
          Product Information
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Top row: Thumbnail and basic fields */}
        <div className="flex gap-6">
          {/* Thumbnail */}
          <div
            className="relative w-40 h-40 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {thumbnailPreview ? (
              <>
                <img
                  src={thumbnailPreview}
                  alt="Product thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  {isUploadingImage ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center text-white">
                      <Camera className="h-6 w-6 mb-1" />
                      <span className="text-xs font-medium">Change</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-colors">
                {isUploadingImage ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-xs font-medium">Add Image</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-4">
            {/* Title */}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title"
                maxLength={200}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="productSlug"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-sm">/product/</span>
                <input
                  id="productSlug"
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="product-slug"
                  maxLength={100}
                  className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="productDescription"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Product Description
          </label>
          <textarea
            id="productDescription"
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="Enter product description for your store..."
            rows={5}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow resize-none"
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            This description will be displayed on your storefront product page.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveStatus === "success" && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <X className="h-4 w-4" />
              Failed to save
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isUploadingImage}
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
