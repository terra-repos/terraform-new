"use client";

import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import { Search, ImageIcon, Loader2, ChevronDown, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { type CatalogItem } from "./page";
import FinalizeModal from "@/components/finalize-modal";
import { finalizeDesign } from "@/app/actions/designs/finalize-design";
import { parseDimensionString } from "@/lib/utils/parse-dimensions";

type CatalogGridProps = {
  items: CatalogItem[];
};

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

type CustomDimension = {
  name: string;
  value: string;
};

type Dimensions = {
  length: string;
  width: string;
  height: string;
};

// Memoized catalog card component
const CatalogCard = memo(
  ({ item, onAdd }: { item: CatalogItem; onAdd: () => void }) => {
    return (
      <button
        onClick={onAdd}
        className="border border-neutral-200 rounded-lg overflow-hidden hover:border-orange-400 hover:shadow-md transition-all cursor-pointer group w-full"
      >
        {/* Image */}
        <div className="aspect-square bg-neutral-100 relative">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt="Catalog item"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-neutral-300" />
            </div>
          )}
        </div>
      </button>
    );
  }
);

CatalogCard.displayName = "CatalogCard";

export default function CatalogGrid({ items }: CatalogGridProps) {
  const router = useRouter();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [materialsFilter, setMaterialsFilter] = useState("all");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [sortOption, setSortOption] = useState<"price_asc" | "price_desc">(
    "price_asc"
  );

  // Infinite scroll state
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMaterialsDropdown, setShowMaterialsDropdown] = useState(false);

  // Modal state
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  // FinalizeModal state
  const [productTitle, setProductTitle] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempCatalogItemId, setTempCatalogItemId] = useState<string | null>(null);

  // Extract unique filter options
  const categoryOptions = useMemo(() => {
    const unique = new Set(
      items.map((i) => i.category).filter((c): c is string => !!c)
    );
    return [
      { value: "all", label: "All Categories" },
      ...Array.from(unique)
        .sort()
        .map((cat) => ({ value: cat, label: cat })),
    ];
  }, [items]);

  const materialsOptions = useMemo(() => {
    const unique = new Set(
      items.map((i) => i.materials).filter((m): m is string => !!m)
    );
    return [
      { value: "all", label: "All Materials" },
      ...Array.from(unique)
        .sort()
        .map((mat) => ({ value: mat, label: mat })),
    ];
  }, [items]);

  // Filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          item.category,
          item.materials,
          item.dimension,
          item.extra_details,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      // Materials filter
      if (materialsFilter !== "all" && item.materials !== materialsFilter) {
        return false;
      }

      // Price range filter
      const itemPrice = item.price_usd || 0;
      if (priceMin && itemPrice < parseFloat(priceMin)) {
        return false;
      }
      if (priceMax && itemPrice > parseFloat(priceMax)) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      const priceA = a.price_usd || 0;
      const priceB = b.price_usd || 0;

      if (sortOption === "price_asc") {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });

    return result;
  }, [
    items,
    searchQuery,
    categoryFilter,
    materialsFilter,
    priceMin,
    priceMax,
    sortOption,
  ]);

  // Visible items (with infinite scroll)
  const visibleItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, displayedCount);
  }, [filteredAndSortedItems, displayedCount]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [
    searchQuery,
    categoryFilter,
    materialsFilter,
    priceMin,
    priceMax,
    sortOption,
  ]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedItems.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredAndSortedItems.length]);

  // Pre-fill finalize modal
  const openFinalizeModalForItem = useCallback(async (item: CatalogItem) => {
    setSelectedItem(item);
    setShowFinalizeModal(true);
    setIsGeneratingTitle(true);

    // Store catalog item ID for finalize action
    setTempCatalogItemId(item.id);

    // Reference images
    setReferenceImages(item.image_url ? [item.image_url] : []);

    // Parse dimensions
    const parsed = parseDimensionString(item.dimension);
    setDimensions(parsed.dimensions);
    setCustomDimensions(parsed.customDimensions);

    // Set customizations from parsed dimensions (DO NOT add Taobao URL here)
    setCustomizations(parsed.customizationBullets);

    // Notes: Only include extra details if available
    setNotes(item.extra_details || "");

    // Generate product title with Claude
    try {
      // Create a simple message describing the catalog item
      const messages = [
        {
          role: "user",
          parts: [
            {
              type: "text",
              text: `Generate a product title for this catalog item: ${item.materials || ""} ${item.category || "product"}. Dimensions: ${item.dimension || "N/A"}. Details: ${item.extra_details || "N/A"}`,
            },
          ],
        },
      ];

      const response = await fetch("/api/design/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      setProductTitle(data.title || "Catalog Item");
    } catch (error) {
      console.error("Failed to generate title:", error);
      // Fallback to simple title
      const fallbackTitle = [item.materials, item.category]
        .filter(Boolean)
        .join(" ")
        .trim() || "Catalog Item";
      setProductTitle(fallbackTitle);
    } finally {
      setIsGeneratingTitle(false);
    }
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setMaterialsFilter("all");
    setPriceMin("");
    setPriceMax("");
    setSortOption("price_asc");
  }, []);

  // Handle finalize modal submission
  const handleRequestSample = useCallback(
    async (data: unknown) => {
      setIsSubmitting(true);
      try {
        const result = await finalizeDesign(data);
        if (result.success) {
          setShowFinalizeModal(false);
          router.push("/samples");
          router.refresh();
        } else {
          alert("Failed to add catalog item. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting catalog item:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  return (
    <>
      <div className="w-full min-h-screen bg-neutral-50">
        <div className="w-full max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-neutral-900">
              Browse Catalog
            </h1>
            <p className="text-neutral-600 mt-2">
              Discover products and add them to your samples
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by category, materials, dimensions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <ArrowUpDown className="h-4 w-4 text-neutral-400" />
                {SORT_OPTIONS.find((o) => o.value === sortOption)?.label}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
              {showSortDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 z-50 w-52 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOption(option.value as "price_asc" | "price_desc");
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors ${
                          sortOption === option.value
                            ? "text-orange-600 font-medium"
                            : "text-neutral-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                {categoryOptions.find((o) => o.value === categoryFilter)?.label}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 z-50 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 max-h-60 overflow-y-auto">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setCategoryFilter(option.value);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors ${
                          categoryFilter === option.value
                            ? "text-orange-600 font-medium"
                            : "text-neutral-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Materials Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMaterialsDropdown(!showMaterialsDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                {materialsOptions.find((o) => o.value === materialsFilter)?.label}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </button>
              {showMaterialsDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMaterialsDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 z-50 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 max-h-60 overflow-y-auto">
                    {materialsOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setMaterialsFilter(option.value);
                          setShowMaterialsDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors ${
                          materialsFilter === option.value
                            ? "text-orange-600 font-medium"
                            : "text-neutral-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Results count */}
          {filteredAndSortedItems.length !== items.length && (
            <p className="text-sm text-neutral-500 mb-4">
              Showing {visibleItems.length} of {filteredAndSortedItems.length} items
            </p>
          )}

          {/* Grid */}
          {filteredAndSortedItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <ImageIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {items.length === 0
                  ? "No items in catalog"
                  : "No items match your filters"}
              </h3>
              <p className="text-neutral-500">
                {items.length === 0
                  ? "Check back later for new items"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleItems.map((item) => (
                <CatalogCard
                  key={item.id}
                  item={item}
                  onAdd={() => openFinalizeModalForItem(item)}
                />
              ))}

              {/* Sentinel for infinite scroll */}
              {visibleItems.length < filteredAndSortedItems.length && (
                <div
                  ref={observerTarget}
                  className="col-span-full h-20 flex items-center justify-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Finalize Modal */}
      {showFinalizeModal && selectedItem && (
        <FinalizeModal
          open={showFinalizeModal}
          onClose={() => {
            setShowFinalizeModal(false);
            setSelectedItem(null);
          }}
          productTitle={productTitle}
          setProductTitle={setProductTitle}
          isGeneratingTitle={isGeneratingTitle}
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
          imageUrl={selectedItem.image_url || ""}
          tempCatalogItemId={tempCatalogItemId}
          isSubmitting={isSubmitting}
          onCustomizeWithAI={() => router.push(`/design/scratch?fromCatalog=${tempCatalogItemId}`)}
          onRequestSample={handleRequestSample}
        />
      )}
    </>
  );
}
