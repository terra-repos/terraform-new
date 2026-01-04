"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import { getProductData } from "@/types/extras";
import type { UserDesign } from "../page";
import { deleteDesign } from "@/app/actions/designs/delete-design";
import { addDesignToCart } from "@/app/actions/designs/add-to-cart";

type DesignCardProps = {
  design: UserDesign;
};

export default function DesignCard({ design }: DesignCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const productData = getProductData(design);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this design?")) return;

    setIsDeleting(true);
    const result = await deleteDesign(design.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete design");
      setIsDeleting(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    const result = await addDesignToCart(design.id);

    if (result.success) {
      router.push("/samples");
    } else {
      alert(result.error || "Failed to add to cart");
      setIsAddingToCart(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="group border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-all hover:shadow-md"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image */}
      <div className="aspect-square bg-neutral-100 relative">
        {design.image_url ? (
          <Image
            src={design.image_url}
            alt={design.product_name || "Design"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-neutral-300" />
          </div>
        )}

        {/* Published Badge */}
        {design.store_id && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
            Published
          </div>
        )}

        {/* Quick Actions Overlay */}
        {showActions && !isDeleting && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              title="Delete Design"
            >
              <Trash2 className="h-5 w-5 text-white" />
            </button>
          </div>
        )}

        {/* Deleting Overlay */}
        {isDeleting && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-neutral-900 truncate">
          {design.product_name || "Untitled Design"}
        </h3>

        <p className="text-xs text-neutral-500 mt-1">
          Created {formatDate(design.created_at)}
        </p>

        {/* Metadata */}
        {productData && (
          <div className="mt-3 space-y-1">
            {productData.dimensions && (
              <p className="text-xs text-neutral-600">
                {productData.dimensions.length} × {productData.dimensions.width} × {productData.dimensions.height}
              </p>
            )}
            {productData.customizations && productData.customizations.length > 0 && (
              <p className="text-xs text-neutral-600">
                {productData.customizations.length} customization{productData.customizations.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {design.store_id ? (
            <button
              onClick={() => router.push(`/store/product/${design.terra_product_id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View in Store
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
