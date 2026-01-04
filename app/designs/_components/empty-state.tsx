"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Package } from "lucide-react";

export default function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
        <Package className="h-10 w-10 text-neutral-400" />
      </div>

      <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
        No designs yet
      </h2>

      <p className="text-neutral-600 text-center max-w-md mb-8">
        Start creating your first product design using our AI-powered design tools or browse our catalog.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/design/scratch")}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          <Sparkles className="h-5 w-5" />
          Design from Scratch
        </button>

        <button
          onClick={() => router.push("/design/catalog")}
          className="px-6 py-3 border border-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
        >
          Browse Catalog
        </button>
      </div>
    </div>
  );
}
