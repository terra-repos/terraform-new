"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle, Check } from "lucide-react";
import { type ProductWithRelations } from "../page";
import {
  type AIVariantsResponse,
  type CreateVariantsInput,
} from "@/app/api/store/ai-variants/route";
import { executeAIVariantOperations } from "@/app/actions/store/ai-create-variants";

type AIVariantsModalProps = {
  product: ProductWithRelations;
  onClose: () => void;
  onSuccess: () => void;
};

type ModalState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: CreateVariantsInput }
  | { status: "needInfo"; message: string; missingFields: string[] }
  | { status: "error"; message: string }
  | { status: "confirming"; data: CreateVariantsInput }
  | { status: "done"; variantCount: number };

const EXAMPLE_PROMPTS = [
  "Add size variants: Small, Medium, Large",
  "Create color variants: Red, Blue, Green",
  "Add 3 size options (S, M, L) with generated images",
  "Create material variants: Cotton, Polyester, Silk",
];

export default function AIVariantsModal({
  product,
  onClose,
  onSuccess,
}: AIVariantsModalProps) {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<ModalState>({ status: "idle" });
  const [showExamples, setShowExamples] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Use portal to render outside the main stacking context
  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Build product context for the API
  const buildProductContext = useCallback(() => {
    const options = product.options.map((o) => ({
      id: o.id,
      option_type: o.option_type,
      values: [...new Set(o.option_values.map((ov) => ov.value).filter(Boolean))] as string[],
    }));

    const variants = product.product_variants.map((v) => {
      const optionsMap: Record<string, string> = {};
      for (const option of product.options) {
        const optionValue = option.option_values.find((ov) => ov.variant_id === v.id);
        if (optionValue?.value) {
          optionsMap[option.option_type] = optionValue.value;
        }
      }
      const images = (v.images as { src: string }[] | null) || [];
      return {
        id: v.id,
        title: v.title,
        options: optionsMap,
        images: images.map((img) => img.src),
      };
    });

    return {
      title: product.title,
      body_html: product.body_html,
      thumbnail_image: product.thumbnail_image,
      options,
      variants,
    };
  }, [product]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState({ status: "loading" });

    // Add current prompt to history for follow-up context
    const fullPrompt =
      conversationHistory.length > 0
        ? `Previous context:\n${conversationHistory.join("\n")}\n\nCurrent request: ${prompt}`
        : prompt;

    try {
      const response = await fetch("/api/store/ai-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          prompt: fullPrompt,
          product: buildProductContext(),
        }),
      });

      const result: AIVariantsResponse = await response.json();

      if (result.type === "createVariants" && result.data?.variants) {
        setState({ status: "success", data: result.data });
      } else if (result.type === "requestInfo" && result.data?.message) {
        setState({
          status: "needInfo",
          message: result.data.message,
          missingFields: result.data.missing_fields || [],
        });
        // Add to conversation history for context
        setConversationHistory((prev) => [...prev, `User: ${prompt}`, `AI: ${result.data.message}`]);
        setPrompt(""); // Clear for follow-up
      } else if (result.type === "reportError") {
        setState({ status: "error", message: result.data?.message || "Unknown error" });
      } else {
        // Fallback for unexpected response format
        setState({ status: "error", message: "Unexpected response from AI" });
      }
    } catch (error) {
      console.error("AI variants error:", error);
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  const handleConfirm = async () => {
    if (state.status !== "success" || !state.data) return;

    const operationsData = state.data;
    setState({ status: "confirming", data: operationsData });

    try {
      // Generate images for variants that need them
      const variantImages: Record<string, string> = {};
      const variantsNeedingImages = operationsData.variants?.filter((v) => v.generate_image) || [];

      if (variantsNeedingImages.length > 0 && product.thumbnail_image) {
        console.log(`Generating ${variantsNeedingImages.length} variant images...`);

        // Generate images in parallel
        const imagePromises = variantsNeedingImages.map(async (variant) => {
          try {
            const response = await fetch("/api/store/generate-variant-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sourceImageUrl: product.thumbnail_image,
                variantTitle: variant.title,
                imagePrompt: variant.image_prompt || `Product in ${variant.title} variant`,
              }),
            });

            const result = await response.json();
            if (result.success && result.imageUrl) {
              return { title: variant.title, imageUrl: result.imageUrl };
            }
            console.warn(`Failed to generate image for ${variant.title}:`, result.error);
            return null;
          } catch (error) {
            console.error(`Error generating image for ${variant.title}:`, error);
            return null;
          }
        });

        const results = await Promise.all(imagePromises);
        for (const result of results) {
          if (result) {
            variantImages[result.title] = result.imageUrl;
          }
        }

        console.log(`Generated ${Object.keys(variantImages).length} images`);
      }

      // Create variants with generated images
      const result = await executeAIVariantOperations(product.id, operationsData, variantImages);

      if (result.success) {
        setState({ status: "done", variantCount: result.createdVariants?.length || 0 });
        // Wait a moment to show success, then close and refresh
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setState({ status: "error", message: result.error || "Failed to create variants" });
      }
    } catch (error) {
      console.error("Error creating variants:", error);
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to create variants",
      });
    }
  };

  const handleReset = () => {
    setState({ status: "idle" });
    setPrompt("");
    setConversationHistory([]);
  };

  // Count variants and options in current context
  const variantCount = product.product_variants.length;
  const optionTypes = product.options.map((o) => o.option_type).join(", ") || "None";

  // Don't render until mounted (for SSR compatibility with portal)
  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-medium text-neutral-900">Create Variants with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Context info */}
          <div className="text-sm text-neutral-500">
            <span className="font-medium text-neutral-700">{variantCount}</span> existing variant
            {variantCount !== 1 ? "s" : ""} • Options: {optionTypes}
          </div>

          {/* Main prompt input - shown in idle, loading, needInfo states */}
          {(state.status === "idle" ||
            state.status === "loading" ||
            state.status === "needInfo") && (
            <>
              {/* Follow-up context */}
              {state.status === "needInfo" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">{state.message}</p>
                  {state.missingFields.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Missing: {state.missingFields.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="aiPrompt"
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  {state.status === "needInfo" ? "Your response" : "Describe the variants you want"}
                </label>
                <textarea
                  id="aiPrompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    state.status === "needInfo"
                      ? "Provide the missing information..."
                      : "e.g., Add color variants: red, blue, green..."
                  }
                  rows={4}
                  disabled={state.status === "loading"}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow resize-none disabled:bg-neutral-50 disabled:cursor-not-allowed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleGenerate();
                    }
                  }}
                />
              </div>

              {/* Examples accordion - only show in initial state */}
              {state.status === "idle" && (
                <div>
                  <button
                    onClick={() => setShowExamples(!showExamples)}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    {showExamples ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    Example prompts
                  </button>
                  {showExamples && (
                    <div className="mt-2 space-y-1.5">
                      {EXAMPLE_PROMPTS.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setPrompt(example)}
                          className="block w-full text-left px-3 py-2 text-sm text-neutral-600 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Success preview */}
          {state.status === "success" && state.data && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Ready to create {state.data.variants?.length ?? 0} variant
                  {(state.data.variants?.length ?? 0) !== 1 ? "s" : ""}
                </p>

                {/* Options to create */}
                {(state.data.options?.filter((o) => o.action === "create").length ?? 0) > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-green-700 mb-1">New options:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {state.data.options
                        ?.filter((o) => o.action === "create")
                        .map((o, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                          >
                            {o.option_type}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Variants list */}
                <div className="space-y-2">
                  {state.data.variants?.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-green-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{v.title}</p>
                        <p className="text-xs text-neutral-500">
                          {Object.entries(v.option_values)
                            .map(([k, val]) => `${k}: ${val}`)
                            .join(" • ")}
                        </p>
                      </div>
                      {v.generate_image && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          + image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-neutral-500">
                New variants will be created with approval status: Not Approved
              </p>
            </div>
          )}

          {/* Error state */}
          {state.status === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Something went wrong</p>
                <p className="text-sm text-red-600 mt-1">{state.message}</p>
              </div>
            </div>
          )}

          {/* Confirming state */}
          {state.status === "confirming" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
              <p className="text-sm text-neutral-600">Creating variants...</p>
              {state.data.variants?.some((v) => v.generate_image) && (
                <p className="text-xs text-neutral-400 mt-1">
                  Generating images may take a moment
                </p>
              )}
            </div>
          )}

          {/* Done state */}
          {state.status === "done" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900">
                Created {state.variantCount} variant{state.variantCount !== 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-neutral-500 mt-1">Refreshing product data...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
          {state.status === "error" && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}

          {(state.status === "idle" ||
            state.status === "loading" ||
            state.status === "needInfo") && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || state.status === "loading"}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {state.status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </>
          )}

          {state.status === "success" && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Confirm & Create
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render via portal to escape stacking context
  return createPortal(modalContent, document.body);
}
