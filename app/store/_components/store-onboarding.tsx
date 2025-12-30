"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, ImageIcon, CreditCard } from "lucide-react";
import { checkSlugAvailability } from "@/app/actions/store/check-slug";
import { createStore } from "@/app/actions/store/create-store";
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

export default function StoreOnboarding() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounced slug check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      setSlugSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const result = await checkSlugAvailability(slug);
        setSlugAvailable(result.available);
        setSlugSuggestion(result.suggestion || null);
      } catch {
        setSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  // Auto-slugify store name if not manually edited
  useEffect(() => {
    if (!slugManuallyEdited && storeName) {
      setSlug(slugify(storeName));
    }
  }, [storeName, slugManuallyEdited]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setHeroPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to GCS
    setIsUploadingImage(true);
    setError(null);
    try {
      const url = await uploadImage(file, "store-heroes");
      setHeroImage(url);
    } catch {
      setError("Failed to upload image. Please try again.");
      setHeroPreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

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

  const handleSubmit = async () => {
    setError(null);

    if (!storeName || storeName.length < 2) {
      setError("Store name must be at least 2 characters");
      return;
    }

    if (!slug || slug.length < 3) {
      setError("Store URL must be at least 3 characters");
      return;
    }

    if (slugAvailable === false) {
      setError("Please choose a different store URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createStore({
        storeName,
        slug,
        heroImage,
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Failed to create store");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    storeName.length >= 2 &&
    slug.length >= 3 &&
    slugAvailable === true &&
    !isUploadingImage &&
    !isCheckingSlug &&
    !isSubmitting;

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-3">
            Create Your Store
          </h1>
          <p className="text-neutral-600 mb-4">
            Launch your storefront and start selling in minutes
          </p>
          <p className="text-sm text-neutral-500 leading-relaxed">
            We quote manufacturing and shipping costs for each piece you design.
            You set your own retail price above these costs and keep everything
            above our quote as profit.
          </p>
        </div>

        {/* Stripe Info */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <CreditCard className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-600 leading-relaxed">
            All payments are processed through Stripe. Your Stripe Connect
            account gives you real-time analytics, revenue reporting, and direct
            deposit when transactions settle.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {/* Hero Image Upload */}
          <div
            className={`relative h-48 bg-neutral-50 border-b border-neutral-200 cursor-pointer transition-colors ${
              !heroPreview && !isUploadingImage ? "hover:bg-neutral-100" : ""
            }`}
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

            {heroPreview ? (
              <div className="relative h-full">
                <img
                  src={heroPreview}
                  alt="Store hero"
                  className="w-full h-full object-cover"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                {isUploadingImage ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm font-medium">Add Hero Image</p>
                    <p className="text-xs mt-1">Drag and drop or click to upload</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5">
            {/* Store Name */}
            <div>
              <label
                htmlFor="storeName"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Store Name
              </label>
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="My Awesome Store"
                maxLength={50}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Store URL */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-neutral-700 mb-1.5"
              >
                Store URL
              </label>
              <div className="flex items-center">
                <span className="text-neutral-500 text-sm mr-1">useterra.com/</span>
                <div className="relative flex-1">
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="my-store"
                    maxLength={30}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow pr-10"
                  />
                  {/* Status indicator */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCheckingSlug ? (
                      <Loader2 className="h-4 w-4 text-neutral-400 animate-spin" />
                    ) : slugAvailable === true ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : slugAvailable === false ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Slug feedback */}
              {slug.length >= 3 && !isCheckingSlug && (
                <p
                  className={`text-xs mt-1.5 ${
                    slugAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {slugAvailable
                    ? "This URL is available!"
                    : slugSuggestion
                    ? `This URL is taken. Try "${slugSuggestion}"?`
                    : "This URL is already taken"}
                </p>
              )}

              {/* Use suggestion button */}
              {slugSuggestion && !slugAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    setSlug(slugSuggestion);
                    setSlugManuallyEdited(true);
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-1"
                >
                  Use suggested URL
                </button>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Store...
                </>
              ) : (
                "Create My Store"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
