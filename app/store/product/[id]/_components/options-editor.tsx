"use client";

import { useState } from "react";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { type ProductWithRelations } from "../page";
import { createOption, deleteOption } from "@/app/actions/store/manage-options";
import {
  createOptionValue,
  deleteOptionValue,
} from "@/app/actions/store/manage-option-values";

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

  const [addingValueToOptionId, setAddingValueToOptionId] = useState<
    string | null
  >(null);
  const [newValueText, setNewValueText] = useState("");
  const [isCreatingValue, setIsCreatingValue] = useState(false);
  const [deletingValueId, setDeletingValueId] = useState<string | null>(null);

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
          options: [
            ...options,
            { ...result.option, option_values: [] },
          ],
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

  const handleAddValue = async (optionId: string) => {
    if (!newValueText.trim()) return;

    setIsCreatingValue(true);
    setError(null);

    try {
      const result = await createOptionValue(
        optionId,
        product.id,
        newValueText.trim()
      );

      if (result.success && result.optionValue) {
        onUpdate({
          ...product,
          options: options.map((opt) =>
            opt.id === optionId
              ? {
                  ...opt,
                  option_values: [...opt.option_values, result.optionValue!],
                }
              : opt
          ),
        });
        setNewValueText("");
        setAddingValueToOptionId(null);
      } else {
        setError(result.error || "Failed to add value");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsCreatingValue(false);
    }
  };

  const handleDeleteValue = async (optionId: string, valueId: string) => {
    setDeletingValueId(valueId);
    setError(null);

    try {
      const result = await deleteOptionValue(valueId);

      if (result.success) {
        onUpdate({
          ...product,
          options: options.map((opt) =>
            opt.id === optionId
              ? {
                  ...opt,
                  option_values: opt.option_values.filter(
                    (v) => v.id !== valueId
                  ),
                }
              : opt
          ),
        });
      } else {
        setError(result.error || "Failed to delete value");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setDeletingValueId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-900">Options</h2>
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
              Options let customers choose variations like size or color.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option) => (
              <div
                key={option.id}
                className="border border-neutral-200 rounded-lg overflow-hidden"
              >
                {/* Option header */}
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="font-medium text-neutral-900">
                    {option.option_type}
                  </h3>
                  <button
                    onClick={() => handleDeleteOption(option.id)}
                    disabled={deletingOptionId === option.id}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    {deletingOptionId === option.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Option values */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {option.option_values.map((value) => (
                      <div
                        key={value.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-sm"
                      >
                        <span>{value.value}</span>
                        <button
                          onClick={() => handleDeleteValue(option.id, value.id)}
                          disabled={deletingValueId === value.id}
                          className="p-0.5 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          {deletingValueId === value.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ))}

                    {/* Add value button/input */}
                    {addingValueToOptionId === option.id ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newValueText}
                          onChange={(e) => setNewValueText(e.target.value)}
                          placeholder="Value"
                          className="w-24 px-2 py-1 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddValue(option.id);
                            if (e.key === "Escape") {
                              setAddingValueToOptionId(null);
                              setNewValueText("");
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddValue(option.id)}
                          disabled={!newValueText.trim() || isCreatingValue}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                        >
                          {isCreatingValue ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setAddingValueToOptionId(null);
                            setNewValueText("");
                          }}
                          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingValueToOptionId(option.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Add Value
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
