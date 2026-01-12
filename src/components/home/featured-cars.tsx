import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Car } from "@shared/schema";
import CarCard from "@/components/cars/car-card";

export default function FeaturedCars() {
  const { data: featuredCars, isLoading, error } = useQuery<Car[]>({
    queryKey: ["/api/cars/featured"],
  });

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold font-montserrat mb-2">Featured Vehicles</h2>
          <p className="text-neutral-medium">Explore our handpicked selection of premium vehicles</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-error">Failed to load featured cars. Please try again later.</p>
          </div>
        ) : featuredCars && featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} featured={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-neutral-medium">No featured cars available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/cars">
            <Button className="inline-block bg-primary hover:bg-primary-light text-white font-medium py-3 px-8 rounded-lg transition">
              Browse All Vehicles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
