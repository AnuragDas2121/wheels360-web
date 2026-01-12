import { Car } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Fuel, Car as CarIcon, Gauge, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CarCardProps {
  car: Car;
  className?: string;
  featured?: boolean;
}

export default function CarCard({ car, className, featured = false }: CarCardProps) {
  // Calculate how new the car is based on listing date
  const isNew = () => {
    if (!car.createdAt) return false;
    
    const listingDate = new Date(car.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - listingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Consider cars listed in the last 7 days as new
  };

  // Format price for display
  const formattedPrice = Number(car.price).toLocaleString();

  // Get first image or use placeholder SVG
  const getImageUrl = () => {
    // If images array exists and has items
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      const firstImage = car.images[0];
      // If it's a string and looks like a valid URL
      if (typeof firstImage === 'string' && firstImage.length > 0) {
        return firstImage;
      }
    }
    // Fallback to placeholder SVG - use modulo to cycle between placeholder images
    return `/placeholder-car-${(car.id % 5) + 1}.svg`;
  };
  
  const coverImage = getImageUrl();

  return (
    <Card className={cn("overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg", className)}>
      <div className="relative">
        <Link to={`/cars/${car.id}`}>
          <div className="relative aspect-video overflow-hidden bg-neutral-light">
            <img
              src={coverImage}
              alt={car.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                // If the image fails to load, replace with a placeholder
                e.currentTarget.src = `/placeholder-car-${(car.id % 5) + 1}.svg`;
              }}
            />
            {isNew() && (
              <Badge className="absolute top-2 left-2 bg-success text-white font-medium">
                New
              </Badge>
            )}
            {featured && (
              <Badge className="absolute top-2 right-2 bg-secondary text-white font-medium">
                Featured
              </Badge>
            )}
          </div>
        </Link>
      </div>

      <CardContent className="p-4">
        <Link to={`/cars/${car.id}`}>
          <h3 className="font-bold text-lg mb-1 hover:text-primary transition-colors">
            {car.title}
          </h3>
        </Link>

        <div className="text-xl font-bold text-secondary mb-3">
          {Number(car.price) >= 100000 
            ? `₹${(Number(car.price) / 100000).toFixed(2)} Lakh` 
            : `₹${formattedPrice}`}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-neutral-medium">
            <CarIcon className="h-4 w-4 text-primary" />
            <span className="capitalize">{car.bodyType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-medium">
            <Fuel className="h-4 w-4 text-primary" />
            <span className="capitalize">{car.fuel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-medium">
            <Gauge className="h-4 w-4 text-primary" />
            <span>{Number(car.mileage).toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-medium">
            <Settings className="h-4 w-4 text-primary" />
            <span className="capitalize">{car.transmission}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="text-neutral-medium">{car.location}</div>
          <div className="text-neutral-medium">Year: {car.year}</div>
        </div>
      </CardContent>
    </Card>
  );
}