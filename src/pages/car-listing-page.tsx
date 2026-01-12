import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import CarCard from "@/components/cars/car-card";
import CarFilter from "@/components/cars/car-filter";
import { Separator } from "@/components/ui/separator";
import { Car } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function CarListingPage() {
  const [location, setLocation] = useLocation();
  
  // Parse URL query parameters
  const getInitialFilters = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      brand: params.get("brand") || "",
      model: params.get("model") || "",
      fuel: params.get("fuel") || "",
      bodyType: params.get("bodyType") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      minYear: params.get("minYear") || "",
      maxYear: params.get("maxYear") || "",
      transmission: params.get("transmission") || "",
      color: params.get("color") || "",
      searchQuery: params.get("q") || ""
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  
  // Update filters when URL changes
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [location]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === "searchQuery") {
          params.append("q", value);
        } else {
          params.append(key, value);
        }
      }
    });
    
    const queryString = params.toString();
    const newPath = queryString ? `/cars?${queryString}` : '/cars';
    
    // Only update location if it's different to avoid infinite loops
    if (location !== newPath) {
      // Use history.replaceState to update the URL without causing a navigation
      window.history.replaceState(null, '', newPath);
    }
  }, [filters, location]);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.brand) queryParams.append("brand", filters.brand);
  if (filters.model) queryParams.append("model", filters.model);
  if (filters.fuel) queryParams.append("fuel", filters.fuel);
  if (filters.bodyType) queryParams.append("bodyType", filters.bodyType);
  if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
  if (filters.minYear) queryParams.append("minYear", filters.minYear);
  if (filters.maxYear) queryParams.append("maxYear", filters.maxYear);
  if (filters.transmission) queryParams.append("transmission", filters.transmission);
  if (filters.color) queryParams.append("color", filters.color);
  if (filters.searchQuery) queryParams.append("q", filters.searchQuery);

  // Fetch cars with filters
  const { data: cars, isLoading, error } = useQuery<Car[]>({
    queryKey: [`/api/cars?${queryParams.toString()}`],
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <>
      <Helmet>
        <title>Browse Cars | Wheels360</title>
        <meta name="description" content="Browse our extensive collection of premium vehicles. Filter by brand, fuel type, price range, and more." />
      </Helmet>

      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-4">
            Browse Cars
          </h1>
          <p className="text-white opacity-90 max-w-3xl">
            Explore our extensive collection of premium vehicles. Use the filters below to find your perfect match.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-20">
              <h2 className="text-xl font-bold font-montserrat mb-6">Filters</h2>
              <CarFilter 
                onFilterChange={handleFilterChange}
                initialFilters={filters}
              />
            </div>
          </div>

          {/* Car Listings */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                {!isLoading && cars && (
                  <p className="text-neutral-medium">{cars.length} vehicles found</p>
                )}
              </div>
              {/* Add sorting options here if needed */}
            </div>

            <Separator className="mb-6" />

            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-error text-center">Error loading cars. Please try again later.</p>
              </div>
            ) : cars && cars.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No cars found</h3>
                  <p className="text-neutral-medium">Try adjusting your filters to see more results.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars?.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
