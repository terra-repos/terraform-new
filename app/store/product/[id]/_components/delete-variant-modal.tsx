"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, ShoppingCart, Package } from "lucide-react";
import {
  checkVariantDeletion,
  deleteVariant,
} from "@/app/actions/store/delete-variant";

type DeleteVariantModalProps = {
  variantId: string;
  variantTitle: string;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteVariantModal({
  variantId,
  variantTitle,
  onClose,
  onDeleted,
}: DeleteVariantModalProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartsCount, setCartsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function check() {
      setIsChecking(true);
      setError(null);

      const result = await checkVariantDeletion(variantId);

      if (result.success) {
        setCartsCount(result.cartsCount || 0);
        setOrdersCount(result.ordersCount || 0);
        setCanDelete(result.canDelete || false);
      } else {
        setError(result.error || "Failed to check variant");
      }

      setIsChecking(false);
    }

    check();
  }, [variantId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteVariant(variantId, cartsCount > 0);

      if (result.success) {
        onDeleted();
      } else {
        setError(result.error || "Failed to delete variant");
        setIsDeleting(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">Delete Variant</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isChecking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              <span className="ml-2 text-neutral-500">
                Checking dependencies...
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Variant info */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <Package className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">
                    {variantTitle || "Untitled Variant"}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    This will permanently delete this variant.
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {cartsCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Variant is in {cartsCount} cart
                      {cartsCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Proceeding will remove this variant from all customer
                      carts.
                    </p>
                  </div>
                </div>
              )}

              {ordersCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Cannot delete: {ordersCount} active order
                      {ordersCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-red-700 mt-0.5">
                      This variant has been ordered and cannot be deleted.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isChecking || isDeleting || !canDelete}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Variant"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
