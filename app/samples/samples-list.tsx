"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Pencil,
  Info,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import FinalizeModal from "@/components/finalize-modal";
import { updateDesign } from "@/app/actions/designs/update-design";
import { submitSampleRequests } from "@/app/actions/samples/submit-sample-requests";
import { Loader2 } from "lucide-react";
import {
  type UserGeneratedProduct,
  type SupabaseDesignResult,
  type ProductData,
  getDesign,
} from "@/types/extras";

type CartItem = {
  id: string;
  quantity: number;
  source: string | null;
  created_at: string;
  design_id: string | null;
  user_generated_products: SupabaseDesignResult;
};

type SamplesListProps = {
  items: CartItem[];
};

type Dimensions = {
  length: string;
  width: string;
  height: string;
};

type CustomDimension = { name: string; value: string };

export default function SamplesList({ items }: SamplesListProps) {
  const [localItems, setLocalItems] = useState(items);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  // Edit modal state
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit sample requests state
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Form state for the modal
  const [productTitle, setProductTitle] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<Dimensions>({
    length: "",
    width: "",
    height: "",
  });
  const [customDimensions, setCustomDimensions] = useState<CustomDimension[]>(
    []
  );
  const [notes, setNotes] = useState("");
  const [showPricingInfo, setShowPricingInfo] = useState(false);

  const handleSubmitSampleRequests = async () => {
    if (localItems.length === 0) return;

    console.log("🎯 [Client] Starting sample request submission");
    setIsSubmittingOrder(true);
    try {
      console.log("🎯 [Client] Calling submitSampleRequests()");
      const result = await submitSampleRequests();
      console.log("🎯 [Client] Received result:", result);
      console.log("🎯 [Client] Result type:", typeof result);
      console.log("🎯 [Client] Result is null?", result === null);
      console.log("🎯 [Client] Result is undefined?", result === undefined);

      if (!result) {
        console.error("❌ [Client] Result is null or undefined!");
        alert("Server returned an invalid response. Please try again.");
        setIsSubmittingOrder(false);
        return;
      }

      if (result.success) {
        console.log("✅ [Client] Success! Navigating to sample orders");
        // Navigate to sample orders page on success
        // Don't set isSubmittingOrder to false - keep the loading state during navigation
        router.push("/sample-orders");
        console.log("✅ [Client] Navigation initiated");
      } else {
        console.error("❌ [Client] Request failed:", result.error);
        alert(
          result.error || "Failed to submit sample requests. Please try again."
        );
        setIsSubmittingOrder(false);
      }
    } catch (error) {
      console.error("❌ [Client] Exception caught:", error);
      alert("An error occurred. Please try again.");
      setIsSubmittingOrder(false);
    }
  };

  const openEditModal = (item: CartItem) => {
    const design = getDesign(item.user_generated_products);
    const productData = design?.product_data?.[0];

    setEditingItem(item);
    setProductTitle(design?.product_name || "");
    setReferenceImages(productData?.referenceImages || []);
    setCustomizations(productData?.customizations || []);
    setDimensions(
      productData?.dimensions || { length: "", width: "", height: "" }
    );
    setCustomDimensions(productData?.customDimensions || []);
    setNotes(productData?.notes || "");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSaveEdit = async (data: {
    productTitle: string;
    referenceImages: string[];
    customizations: string[];
    dimensions: Dimensions;
    customDimensions: CustomDimension[];
    notes: string;
  }) => {
    if (!editingItem) return;

    const design = getDesign(editingItem.user_generated_products);
    if (!design) return;

    setIsSubmitting(true);
    try {
      const result = await updateDesign({
        designId: design.id,
        productTitle: data.productTitle,
        referenceImages: data.referenceImages,
        customizations: data.customizations,
        dimensions: data.dimensions,
        customDimensions: data.customDimensions,
        notes: data.notes,
        imageUrl: design.image_url || data.referenceImages[0] || "",
      });

      if (result.success) {
        // Update local state
        setLocalItems((prev) =>
          prev.map((item) => {
            if (item.id !== editingItem.id) return item;

            const existingDesign = getDesign(item.user_generated_products);
            if (!existingDesign) return item;

            const updatedDesign: UserGeneratedProduct = {
              ...existingDesign,
              product_name: data.productTitle,
              product_data: [
                {
                  customizations: data.customizations,
                  dimensions: data.dimensions,
                  customDimensions: data.customDimensions,
                  notes: data.notes,
                  referenceImages: data.referenceImages,
                } as ProductData,
              ],
            };

            return {
              ...item,
              user_generated_products: updatedDesign,
            };
          })
        );
        closeEditModal();
      } else {
        alert("Failed to update design. Please try again.");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingId(cartId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_carts")
        .update({ quantity: newQuantity })
        .eq("id", cartId);

      if (!error) {
        setLocalItems((prev) =>
          prev.map((item) =>
            item.id === cartId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartId: string) => {
    setUpdatingId(cartId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_carts")
        .delete()
        .eq("id", cartId);

      if (!error) {
        setLocalItems((prev) => prev.filter((item) => item.id !== cartId));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const totalItems = localItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = localItems.reduce((sum, item) => {
    const design = getDesign(item.user_generated_products);
    const productData = design?.product_data?.[0];
    const price = productData?.estimatedSamplePrice || 100;
    return sum + price * item.quantity;
  }, 0);

  if (localItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-6">
          <ShoppingBag className="h-10 w-10 text-neutral-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          No samples yet
        </h2>
        <p className="text-neutral-500 text-center max-w-md mb-8">
          When you finalize a design and request a sample, it will appear here.
        </p>
        <Link
          href="/design"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          Start Designing
        </Link>
      </div>
    );
  }

  const editingDesign = editingItem
    ? getDesign(editingItem.user_generated_products)
    : null;

  return (
    <>
      <div className="w-full min-h-full bg-neutral-50">
        <div className="w-full max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-end mb-8">
            <button
              onClick={handleSubmitSampleRequests}
              disabled={isSubmittingOrder || localItems.length === 0}
              className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmittingOrder && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isSubmittingOrder ? "Submitting..." : "Submit Sample requests"}
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_auto] px-6 py-4 border-b border-neutral-100">
              <span className="text-sm text-neutral-500">Sample Requests</span>
              <span className="text-sm text-neutral-500 flex items-center gap-1.5">
                Estimated Sample Price
                <div className="relative flex items-center">
                  <button
                    onClick={() => setShowPricingInfo(!showPricingInfo)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors flex items-center justify-center"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  {showPricingInfo && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setShowPricingInfo(false)}
                      />
                      <div className="fixed right-16 top-32 z-[101] w-80 bg-white rounded-xl shadow-xl border border-neutral-200 p-4">
                        <h4 className="font-semibold text-neutral-900 mb-3">
                          Estimated Sample Pricing Details
                        </h4>
                        <div className="space-y-3 text-sm text-neutral-600">
                          <p>
                            <span className="font-medium text-neutral-800">
                              Cost Guarantee:
                            </span>{" "}
                            We cover the first $500 of your sample costs.
                          </p>
                          <p>
                            <span className="font-medium text-neutral-800">
                              Production Cost:
                            </span>{" "}
                            Final production costs (when launching a storefront)
                            will be less than or equal to the finalized sample
                            cost (not this estimate).
                          </p>
                          <p>
                            <span className="font-medium text-neutral-800">
                              Next Steps:
                            </span>{" "}
                            We will confirm exact sample and production quotes
                            with our manufacturers. We will then invoice you for
                            any sample cost exceeding the $500 credit.
                          </p>
                          <p>
                            <span className="font-medium text-neutral-800">
                              Exclusions:
                            </span>{" "}
                            This estimate does not include shipping, which we
                            will cover on your first sample order.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-neutral-100">
              {localItems.map((item) => {
                const design = getDesign(item.user_generated_products);
                const productData = design?.product_data?.[0];
                const imageUrl =
                  design?.image_url || productData?.referenceImages?.[0];
                const itemDimensions = productData?.dimensions;
                const itemNotes = productData?.notes;
                const itemPrice = productData?.estimatedSamplePrice || 100;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] items-center px-6 py-6"
                  >
                    {/* Left side - Product info */}
                    <div className="flex gap-5">
                      {/* Image */}
                      <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={design?.product_name || "Design"}
                            width={112}
                            height={112}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-neutral-300" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-neutral-900 text-lg">
                            {design?.product_name || "Untitled Design"}
                          </h3>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Edit details"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>

                        {itemDimensions && (
                          <p className="text-sm text-neutral-500 mt-1">
                            Dimensions
                            {itemDimensions.length &&
                              itemDimensions.width &&
                              itemDimensions.height && (
                                <span className="text-neutral-400 ml-1">
                                  {itemDimensions.length}" ×{" "}
                                  {itemDimensions.width}" ×{" "}
                                  {itemDimensions.height}"
                                </span>
                              )}
                          </p>
                        )}

                        {itemNotes && (
                          <p className="text-sm text-neutral-500 mt-0.5">
                            Note
                          </p>
                        )}

                        {/* Quantity control */}
                        <div className="flex items-center mt-3">
                          <div className="inline-flex items-center border-2 border-amber-400 rounded-full">
                            <button
                              onClick={() => {
                                if (item.quantity === 1) {
                                  handleRemove(item.id);
                                } else {
                                  updateQuantity(item.id, item.quantity - 1);
                                }
                              }}
                              disabled={updatingId === item.id}
                              className="p-1.5 hover:bg-amber-50 rounded-l-full transition-colors disabled:opacity-50"
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="h-4 w-4 text-neutral-600" />
                              ) : (
                                <Minus className="h-4 w-4 text-neutral-600" />
                              )}
                            </button>
                            <span className="px-3 text-sm font-medium text-neutral-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={updatingId === item.id}
                              className="p-1.5 hover:bg-amber-50 rounded-r-full transition-colors disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4 text-neutral-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Price */}
                    <div className="text-right">
                      <span className="text-xl font-semibold text-neutral-900">
                        ${itemPrice}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer - Subtotal */}
            <div className="border-t border-neutral-200 px-6 py-5">
              <div className="flex justify-end">
                <span className="text-lg font-semibold text-neutral-900">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):
                  ${subtotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <FinalizeModal
        open={showEditModal}
        onClose={closeEditModal}
        productTitle={productTitle}
        setProductTitle={setProductTitle}
        isGeneratingTitle={false}
        referenceImages={referenceImages}
        setReferenceImages={setReferenceImages}
        customizations={customizations}
        setCustomizations={setCustomizations}
        isGeneratingCustomizations={false}
        dimensions={dimensions}
        setDimensions={setDimensions}
        customDimensions={customDimensions}
        setCustomDimensions={setCustomDimensions}
        notes={notes}
        setNotes={setNotes}
        messages={[]}
        imageUrl={editingDesign?.image_url || referenceImages[0] || ""}
        isSubmitting={isSubmitting}
        onSaveForLater={closeEditModal}
        onRequestSample={async (data) => {
          await handleSaveEdit(data);
        }}
      />
    </>
  );
}
