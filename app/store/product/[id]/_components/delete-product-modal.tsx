"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertTriangle, ShoppingCart, Package } from "lucide-react";
import {
  checkProductDeletion,
  removeProductFromStore,
  deleteProductCompletely,
} from "@/app/actions/store/delete-product";
import { useRouter } from "next/navigation";

type DeleteMode = "from_store" | "completely";

type DeleteProductModalProps = {
  productId: string;
  productTitle: string;
  mode: DeleteMode;
  onClose: () => void;
};

export default function DeleteProductModal({
  productId,
  productTitle,
  mode,
  onClose,
}: DeleteProductModalProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartsCount, setCartsCount] = useState(0);
  const [dropOrdersCount, setDropOrdersCount] = useState(0);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function check() {
      setIsChecking(true);
      setError(null);

      const result = await checkProductDeletion(productId, mode);

      if (result.success) {
        setCartsCount(result.cartsCount || 0);
        setDropOrdersCount(result.dropOrdersCount || 0);
        setCanDelete(result.canDelete || false);
      } else {
        setError(result.error || "Failed to check product");
      }

      setIsChecking(false);
    }

    check();
  }, [productId, mode]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result =
        mode === "from_store"
          ? await removeProductFromStore(productId, cartsCount > 0)
          : await deleteProductCompletely(productId, cartsCount > 0);

      if (result.success) {
        router.push("/store");
      } else {
        setError(result.error || "Failed to delete product");
        setIsDeleting(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  const modeLabel =
    mode === "from_store" ? "Remove from Store" : "Delete Permanently";
  const modeDescription =
    mode === "from_store"
      ? "This will remove the product from your store but keep it in your designs."
      : "This will permanently delete the product and its associated design.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">{modeLabel}</h2>
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
              {/* Product info */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <Package className="h-5 w-5 text-neutral-400 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">
                    {productTitle || "Untitled Product"}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {modeDescription}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {cartsCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Product is in {cartsCount} cart
                      {cartsCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Proceeding will remove this product from all customer
                      carts.
                    </p>
                  </div>
                </div>
              )}

              {mode === "completely" && dropOrdersCount > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Cannot delete: {dropOrdersCount} active order
                      {dropOrdersCount > 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-red-700 mt-0.5">
                      This product has been ordered and cannot be permanently
                      deleted. You can still remove it from your store.
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
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === "completely"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "from_store" ? "Removing..." : "Deleting..."}
              </>
            ) : mode === "from_store" ? (
              "Remove from Store"
            ) : (
              "Delete Permanently"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
