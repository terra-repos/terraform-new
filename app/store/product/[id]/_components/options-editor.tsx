"use client";

import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { type ProductWithRelations } from "../page";
import { createOption, deleteOption } from "@/app/actions/store/manage-options";

type OptionsEditorProps = {
  product: ProductWithRelations;
  onUpdate: (product: ProductWithRelations) => void;
};

export default function OptionsEditor({
  product,
  onUpdate,
}: OptionsEditorProps) {
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionType, setNewOptionType] = useState("");
  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = product.options || [];

  const handleAddOption = async () => {
    if (!newOptionType.trim()) return;

    setIsCreatingOption(true);
    setError(null);

    try {
      const result = await createOption(product.id, newOptionType.trim());

      if (result.success && result.option) {
        onUpdate({
          ...product,
          options: [...options, { ...result.option, option_values: [] }],
        });
        setNewOptionType("");
        setIsAddingOption(false);
      } else {
        setError(result.error || "Failed to create option");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsCreatingOption(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    setDeletingOptionId(optionId);
    setError(null);

    try {
      const result = await deleteOption(optionId);

      if (result.success) {
        onUpdate({
          ...product,
          options: options.filter((o) => o.id !== optionId),
        });
      } else {
        setError(result.error || "Failed to delete option");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setDeletingOptionId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-neutral-900">Options</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Define option types for this product (e.g., Size, Color)
          </p>
        </div>
        {!isAddingOption && (
          <button
            onClick={() => setIsAddingOption(true)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Option
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Add new option form */}
        {isAddingOption && (
          <div className="mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newOptionType}
                onChange={(e) => setNewOptionType(e.target.value)}
                placeholder="Option name (e.g., Size, Color)"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddOption();
                  if (e.key === "Escape") {
                    setIsAddingOption(false);
                    setNewOptionType("");
                  }
                }}
              />
              <button
                onClick={handleAddOption}
                disabled={!newOptionType.trim() || isCreatingOption}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isCreatingOption ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </button>
              <button
                onClick={() => {
                  setIsAddingOption(false);
                  setNewOptionType("");
                }}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Options list */}
        {options.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p className="text-sm">No options defined for this product.</p>
            <p className="text-xs mt-1">
              Add options like Size or Color, then assign values to each variant.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <div
                key={option.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg"
              >
                <span className="font-medium text-neutral-900">
                  {option.option_type}
                </span>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={deletingOptionId === option.id}
                  className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  {deletingOptionId === option.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
