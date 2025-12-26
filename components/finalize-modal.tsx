"use client";

import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { Loader2, Plus, X } from "lucide-react";

type Dimensions = {
  length: string;
  width: string;
  height: string;
};

type CustomDimension = { name: string; value: string };

type FinalizeModalProps = {
  open: boolean;
  onClose: () => void;
  productTitle: string;
  setProductTitle: Dispatch<SetStateAction<string>>;
  isGeneratingTitle: boolean;
  referenceImages: string[];
  setReferenceImages: Dispatch<SetStateAction<string[]>>;
  customizations: string[];
  setCustomizations: Dispatch<SetStateAction<string[]>>;
  isGeneratingCustomizations: boolean;
  dimensions: Dimensions;
  setDimensions: Dispatch<SetStateAction<Dimensions>>;
  customDimensions: CustomDimension[];
  setCustomDimensions: Dispatch<SetStateAction<CustomDimension[]>>;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  onSaveForLater?: () => void;
  onRequestSample?: () => void;
};

export default function FinalizeModal({
  open,
  onClose,
  productTitle,
  setProductTitle,
  isGeneratingTitle,
  referenceImages,
  setReferenceImages,
  customizations,
  setCustomizations,
  isGeneratingCustomizations,
  dimensions,
  setDimensions,
  customDimensions,
  setCustomDimensions,
  notes,
  setNotes,
  onSaveForLater,
  onRequestSample,
}: FinalizeModalProps) {
  if (!open) return null;

  const isGenerating = isGeneratingTitle || isGeneratingCustomizations;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-200 px-8 py-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            Finalize Production Details
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Product Title
            </label>
            {isGeneratingTitle ? (
              <div className="flex items-center gap-2 text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating title...</span>
              </div>
            ) : (
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="w-full px-4 py-3 text-lg font-semibold border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Enter product title"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-3">
              Reference Images
            </label>
            <div className="flex gap-3 flex-wrap">
              {referenceImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <Image
                    src={imageUrl}
                    alt={`Reference ${index + 1}`}
                    width={150}
                    height={150}
                    className="rounded-lg object-cover h-32 w-32 border border-neutral-200"
                  />
                  <button
                    onClick={() =>
                      setReferenceImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button className="h-32 w-32 border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center text-neutral-400 hover:border-neutral-400 hover:text-neutral-500 transition-colors">
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-3">
              Specifications
            </label>
            {isGeneratingCustomizations ? (
              <div className="flex items-center gap-2 text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Summarizing your design...</span>
              </div>
            ) : customizations.length > 0 ? (
              <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                {customizations.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 bg-white rounded-lg border border-neutral-200 px-4 py-3 shadow-sm hover:border-neutral-300 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        setCustomizations((prev) => {
                          const next = [...prev];
                          next[index] = e.target.value;
                          return next;
                        })
                      }
                      className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
                      placeholder="Add detail"
                    />
                    <button
                      onClick={() =>
                        setCustomizations((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                No specifications yet. Add your own below.
              </p>
            )}
            <button
              onClick={() => setCustomizations((prev) => [...prev, ""])}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add specification
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-3">
              Dimensions (in)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Length:
                </label>
                <input
                  type="text"
                  value={dimensions.length}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      length: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Width:
                </label>
                <input
                  type="text"
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      width: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Height:
                </label>
                <input
                  type="text"
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      height: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {customDimensions.map((dim, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 mt-3">
                <input
                  type="text"
                  value={dim.name}
                  onChange={(e) => {
                    const updated = [...customDimensions];
                    updated[index].name = e.target.value;
                    setCustomDimensions(updated);
                  }}
                  placeholder="Dimension name (eg: Seat Height)"
                  className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dim.value}
                    onChange={(e) => {
                      const updated = [...customDimensions];
                      updated[index].value = e.target.value;
                      setCustomDimensions(updated);
                    }}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    onClick={() =>
                      setCustomDimensions((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                setCustomDimensions((prev) => [
                  ...prev,
                  { name: "", value: "" },
                ])
              }
              className="mt-3 px-4 py-2 bg-neutral-600 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Add Custom Dimension
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Note
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any additional notes or special instructions here..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-neutral-200 px-8 py-6 flex justify-end gap-3">
          <button
            onClick={onSaveForLater ?? onClose}
            className="px-6 py-3 text-sm font-medium text-neutral-700 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Save for Later
          </button>
          <button
            onClick={() => {
              onRequestSample?.();
              onClose();
            }}
            disabled={isGenerating}
            className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
              isGenerating
                ? "bg-orange-300 text-white cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </span>
            ) : (
              "Request Sample"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
