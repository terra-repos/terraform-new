"use client";

import Image from "next/image";
import { useState } from "react";
import { Package } from "lucide-react";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-neutral-100 rounded-xl">
        <Package className="h-16 w-16 text-neutral-300" />
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className="flex gap-4">
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 w-20 shrink-0">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? "border-orange-500"
                  : "border-transparent hover:border-neutral-300"
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative aspect-square bg-neutral-100 rounded-xl overflow-hidden">
        <Image
          src={currentImage}
          alt={title}
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
