"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type ProductWithRelations } from "../page";
import ProductInfoSection from "./product-info-section";
import OptionsEditor from "./options-editor";
import VariantsEditor from "./variants-editor";
import AnalyticsSection from "./analytics-section";
import DangerZoneSection from "./danger-zone-section";

type ProductEditorProps = {
  product: ProductWithRelations;
};

export default function ProductEditor({ product }: ProductEditorProps) {
  const [currentProduct, setCurrentProduct] =
    useState<ProductWithRelations>(product);

  return (
    <div className="min-h-full bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/store"
              className="p-2 -ml-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                {currentProduct.title || "Untitled Product"}
              </h1>
              <p className="text-sm text-neutral-500">Edit product details</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Product Info */}
        <ProductInfoSection
          product={currentProduct}
          onUpdate={setCurrentProduct}
        />

        {/* Options */}
        <OptionsEditor
          product={currentProduct}
          onUpdate={setCurrentProduct}
        />

        {/* Variants */}
        <VariantsEditor
          product={currentProduct}
          onUpdate={setCurrentProduct}
        />

        {/* Analytics */}
        <AnalyticsSection productId={currentProduct.id} />

        {/* Danger Zone */}
        <DangerZoneSection
          productId={currentProduct.id}
          productTitle={currentProduct.title || "Untitled Product"}
        />
      </div>
    </div>
  );
}
