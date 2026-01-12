import { useQuery } from "@tanstack/react-query";
import { Car } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import CarCard from "./car-card";

interface SimilarCarsProps {
  carId: number;
  limit?: number;
  className?: string;
}

export default function SimilarCars({ carId, limit = 3, className = '' }: SimilarCarsProps) {
  // Fetch similar cars based on the current car
  const { data: similarCars, isLoading, error } = useQuery<Car[]>({
    queryKey: [`/api/recommendations/similar/${carId}`],
    enabled: !!carId,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold font-montserrat mb-4">Similar Vehicles</h3>
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !similarCars || similarCars.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold font-montserrat mb-4">Similar Vehicles</h3>
          <p className="text-sm text-neutral-medium">
            {error ? "Error loading similar cars." : "No similar vehicles found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold font-montserrat mb-4">Similar Vehicles</h3>
        <div className="space-y-4">
          {similarCars.slice(0, limit).map((car) => (
            <div key={car.id} className="bg-neutral-lightest p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-20 h-16 bg-neutral-light rounded overflow-hidden flex-shrink-0">
                  {car.images && car.images.length > 0 ? (
                    <img 
                      src={car.images[0]} 
                      alt={car.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-light text-neutral-medium">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <a 
                    href={`/cars/${car.id}`} 
                    className="font-medium hover:text-primary transition text-sm"
                  >
                    {car.title}
                  </a>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-medium">{car.year} · {car.mileage} miles</span>
                    <span className="text-sm font-semibold">₹{Number(car.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}