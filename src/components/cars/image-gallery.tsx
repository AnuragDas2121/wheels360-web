import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageGallery({ images, alt, className = "" }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [errorImages, setErrorImages] = useState<number[]>([]);

  const handleNavigation = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleImageError = (index: number) => {
    if (!errorImages.includes(index)) {
      setErrorImages((prev) => [...prev, index]);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-neutral-50 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <ImageOff className="h-12 w-12 mx-auto text-neutral-light mb-3" />
          <p className="text-neutral-medium">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      {/* Main image display */}
      <div className="relative h-96 bg-neutral-50">
        {/* Navigation arrows for larger screens */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white z-10"
              onClick={() => handleNavigation("prev")}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white z-10"
              onClick={() => handleNavigation("next")}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Main image */}
        {errorImages.includes(activeIndex) ? (
          <div className="h-full flex flex-col items-center justify-center">
            <ImageOff className="h-12 w-12 text-neutral-light mb-3" />
            <p className="text-neutral-medium">Image failed to load</p>
          </div>
        ) : (
          <img
            src={images[activeIndex]}
            alt={`${alt} - Image ${activeIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(activeIndex)}
          />
        )}

        {/* Image counter for mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer transition border-2 flex-shrink-0 ${
                  index === activeIndex ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                {errorImages.includes(index) ? (
                  <div className="h-full flex items-center justify-center bg-neutral-50">
                    <ImageOff className="h-6 w-6 text-neutral-light" />
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}