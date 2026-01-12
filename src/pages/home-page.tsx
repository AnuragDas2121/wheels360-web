import HeroSection from "@/components/home/hero-section";
import BrandSection from "@/components/home/brand-section";
import FeaturedCars from "@/components/home/featured-cars";
import FeaturedDealers from "@/components/home/featured-dealers";
import PriceTrends from "@/components/home/price-trends";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";
import PersonalRecommendations from "@/components/home/personal-recommendations";
import CarComparisonTable from "@/components/cars/car-comparison-table";
import CarFilter from "@/components/cars/car-filter";
import LocalResources from "@/components/resources/local-resources";
import { Helmet } from "react-helmet";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Car } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CarCard from "@/components/cars/car-card";

export default function HomePage() {
  // Set initial filter values that correspond to the "all" values
  const [filters, setFilters] = useState<any>({
    brand: "all-makes",
    model: "all-models",
    bodyType: "all-body-types",
    fuel: "all-fuel-types",
    transmission: "any-transmission",
    color: "any-color",
    searchQuery: ""
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Build query parameters for filtered cars
  const queryParams = new URLSearchParams();
  
  // Always include filter fields but check if we should apply filter based on value
  if (filters.brand && filters.brand !== "all-makes") 
    queryParams.append("brand", filters.brand);
  
  if (filters.model && filters.model !== "all-models") 
    queryParams.append("model", filters.model);
  
  if (filters.fuel && filters.fuel !== "all-fuel-types") 
    queryParams.append("fuel", filters.fuel);
  
  if (filters.bodyType && filters.bodyType !== "all-body-types") 
    queryParams.append("bodyType", filters.bodyType);
  
  if (filters.minPrice) 
    queryParams.append("minPrice", String(filters.minPrice));
  
  if (filters.maxPrice) 
    queryParams.append("maxPrice", String(filters.maxPrice));
  
  if (filters.minYear) 
    queryParams.append("minYear", String(filters.minYear));
  
  if (filters.maxYear) 
    queryParams.append("maxYear", String(filters.maxYear));
  
  if (filters.transmission && filters.transmission !== "any-transmission") 
    queryParams.append("transmission", filters.transmission);
  
  if (filters.color && filters.color !== "any-color") 
    queryParams.append("color", filters.color);
  
  // For search query, ensure it's using the expected parameter name 'q'
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    // Make sure we don't send 'all-makes' as a search query
    const searchQuery = filters.searchQuery.trim();
    if (
      searchQuery !== "all-makes" && 
      searchQuery !== "all-models" && 
      searchQuery !== "all-body-types" && 
      searchQuery !== "all-fuel-types" && 
      searchQuery !== "any-transmission" && 
      searchQuery !== "any-color"
    ) {
      queryParams.append("q", searchQuery);
      console.log("Added search query to request:", searchQuery);
    }
  }

  // Fetch filtered cars only when user explicitly applies filters
  const { 
    data: filteredCars, 
    isLoading, 
    error 
  } = useQuery<Car[]>({
    queryKey: [`/api/cars${showSearchResults ? `?${queryParams.toString()}` : ''}`],
    enabled: showSearchResults && queryParams.toString() !== "", // Only fetch when user applies valid filters
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Check if any real filter is applied (not just the "all-*" values)
    const hasRealFilters = Object.entries(newFilters).some(([key, val]) => {
      // Search query is a special case - even an empty string is still valid for resetting
      if (key === 'searchQuery') {
        return val !== undefined && val !== "";
      }
      
      // For other filters, we need to check against the "all-*" values
      return val !== "" && 
        val !== "all-makes" && 
        val !== "all-models" && 
        val !== "all-body-types" && 
        val !== "all-fuel-types" && 
        val !== "any-transmission" && 
        val !== "any-color";
    });
    
    // Show results if there are real filters
    setShowSearchResults(hasRealFilters);
  };
  
  // Handle search from hero section
  const handleHeroSearch = (query: string) => {
    // Update filters with the search query while keeping other filters as is
    const newFilters = {
      ...filters,
      searchQuery: query
    };
    
    setFilters(newFilters);
    setShowSearchResults(true); // Always show results when searching from hero
  };

  return (
    <>
      <Helmet>
        <title>Wheels360 | India's Premium Car Marketplace</title>
        <meta name="description" content="Find your perfect car in India with Wheels360 - connecting car buyers with trusted dealers across Mumbai, Delhi, Bangalore and more cities, with comprehensive tools for Indian automotive consumers." />
      </Helmet>

      <HeroSection onSearch={handleHeroSearch} />
      
      <section className="bg-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <CarFilter simplified onFilterChange={handleFilterChange} />
        </div>
      </section>
      
      {/* Show search results if filters are applied */}
      {showSearchResults && (
        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Search Results</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-error">Failed to load cars. Please try again later.</p>
              </div>
            ) : filteredCars && filteredCars.length > 0 ? (
              <>
                <p className="text-neutral-medium mb-6">{filteredCars.length} vehicles found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link to="/cars">
                    <Button variant="outline">View All Results</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <p className="text-neutral-medium">No cars match your search criteria. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {!showSearchResults && (
        <>
          <FeaturedCars />
          <PersonalRecommendations />
          <BrandSection />
          <FeaturedDealers />
          <CarComparisonTable />
          <PriceTrends />
        </>
      )}
      
      <LocalResources />
      <Testimonials />
      <CTASection />
    </>
  );
}
