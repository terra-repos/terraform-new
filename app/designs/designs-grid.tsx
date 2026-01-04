"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import DesignCard from "./_components/design-card";
import EmptyState from "./_components/empty-state";
import { getProductData } from "@/types/extras";
import type { UserDesign } from "./page";

const ITEMS_PER_PAGE = 12;

type DesignsGridProps = {
  designs: UserDesign[];
};

export default function DesignsGrid({ designs }: DesignsGridProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter and sort designs
  const filteredAndSortedDesigns = useMemo(() => {
    let result = designs;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((design) => {
        const productData = getProductData(design);
        const searchableText = [
          design.product_name || "",
          productData?.notes || "",
          ...(productData?.customizations || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((design) => {
        if (statusFilter === "published") {
          return design.store_id !== null;
        } else {
          return design.store_id === null;
        }
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      } else {
        // Sort by name
        const nameA = (a.product_name || "").toLowerCase();
        const nameB = (b.product_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
    });

    return result;
  }, [designs, searchQuery, statusFilter, sortBy]);

  // Visible designs (for infinite scroll)
  const visibleDesigns = filteredAndSortedDesigns.slice(0, displayedCount);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchQuery, statusFilter, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedDesigns.length)
          );
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredAndSortedDesigns.length]);

  // Show empty state if no designs at all
  if (designs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Filter className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">
              {statusFilter === "all" ? "All Designs" : statusFilter === "published" ? "Published" : "Draft"}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
              {[
                { value: "all", label: "All Designs" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value as any);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 transition-colors ${
                    statusFilter === option.value ? "text-orange-600 font-medium" : "text-neutral-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 border border-neutral-200 rounded-lg bg-white text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      {/* Results Count */}
      {(searchQuery || statusFilter !== "all") && (
        <p className="text-sm text-neutral-600">
          Showing {filteredAndSortedDesigns.length} of {designs.length} designs
        </p>
      )}

      {/* Empty State (after filters) */}
      {filteredAndSortedDesigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No designs match your filters</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="mt-2 text-sm text-orange-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grid */}
      {visibleDesigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visibleDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      {visibleDesigns.length < filteredAndSortedDesigns.length && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      )}
    </div>
  );
}
