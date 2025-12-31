"use client";

import { useState } from "react";
import { Trash2, Store } from "lucide-react";
import DeleteProductModal from "./delete-product-modal";

type DangerZoneSectionProps = {
  productId: string;
  productTitle: string;
};

export default function DangerZoneSection({
  productId,
  productTitle,
}: DangerZoneSectionProps) {
  const [deleteMode, setDeleteMode] = useState<
    "from_store" | "completely" | null
  >(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>
          <p className="text-sm text-red-700 mt-0.5">
            Irreversible and destructive actions
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Remove from store */}
          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900">
                  Remove from Store
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Remove this product from your store. It will still be
                  available in your designs.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeleteMode("from_store")}
              className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Delete permanently */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900">
                  Delete Permanently
                </p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Permanently delete this product and its associated design.
                  This cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDeleteMode("completely")}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteMode && (
        <DeleteProductModal
          productId={productId}
          productTitle={productTitle}
          mode={deleteMode}
          onClose={() => setDeleteMode(null)}
        />
      )}
    </>
  );
}
