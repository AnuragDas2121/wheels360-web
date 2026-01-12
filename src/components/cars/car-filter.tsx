import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface CarFilterProps {
  onFilterChange?: (filters: any) => void;
  simplified?: boolean;
  initialFilters?: {
    brand?: string;
    model?: string;
    bodyType?: string;
    fuel?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    minYear?: string | number;
    maxYear?: string | number;
    transmission?: string;
    color?: string;
    searchQuery?: string;
  };
}

export default function CarFilter({ 
  onFilterChange, 
  simplified = false, 
  initialFilters = {}
}: CarFilterProps) {
  // Set filter states with initial values from props or defaults
  const [brand, setBrand] = useState(
    initialFilters.brand || "all-makes"
  );
  const [model, setModel] = useState(
    initialFilters.model || "all-models"
  );
  const [bodyType, setBodyType] = useState(
    initialFilters.bodyType || "all-body-types"
  );
  const [fuelType, setFuelType] = useState(
    initialFilters.fuel || "all-fuel-types"
  );
  
  // Price range in Indian Rupees: Default 5 lakh to 15 lakh
  const minPrice = initialFilters.minPrice ? Number(initialFilters.minPrice) : 500000;
  const maxPrice = initialFilters.maxPrice ? Number(initialFilters.maxPrice) : 1500000;
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  
  const minYear = initialFilters.minYear ? Number(initialFilters.minYear) : 2000;
  const maxYear = initialFilters.maxYear ? Number(initialFilters.maxYear) : new Date().getFullYear();
  const [yearRange, setYearRange] = useState([minYear, maxYear]);

  // Fetch brands from API
  const { data: brands } = useQuery<string[]>({
    queryKey: ["/api/brands"],
  });

  // Fetch fuel types from API
  const { data: fuelTypes } = useQuery<string[]>({
    queryKey: ["/api/fuel-types"],
  });

  // Fetch body types from API
  const { data: bodyTypes } = useQuery<string[]>({
    queryKey: ["/api/body-types"],
  });

  // Initialize transmission, color, and searchQuery from initialFilters or defaults
  const [transmission, setTransmission] = useState(
    initialFilters.transmission || "any-transmission"
  );
  const [color, setColor] = useState(
    initialFilters.color || "any-color"
  );
  const [searchQuery, setSearchQuery] = useState(
    initialFilters.searchQuery || ""
  );

  // We'll use a ref to track initial render
  const isInitialRender = React.useRef(true);
  
  // Call onFilterChange when filters change, but not on the initial render
  useEffect(() => {
    // Skip the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Don't trigger filter changes automatically for every change
    // Let the user explicitly click the Filter button or press Enter
    // This prevents unwanted filter changes when just interacting with dropdowns
  }, [
    brand, 
    model, 
    bodyType, 
    fuelType, 
    priceRange, 
    yearRange, 
    transmission, 
    color, 
    searchQuery,
    onFilterChange
  ]);

  const handleApplyFilters = () => {
    if (onFilterChange) {
      // Handle "all-*" values as empty strings but maintain original values in filter state
      const processedFilters = {
        brand: brand === "all-makes" ? "" : brand,
        model: model === "all-models" ? "" : model,
        bodyType: bodyType === "all-body-types" ? "" : bodyType,
        fuel: fuelType === "all-fuel-types" ? "" : fuelType,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minYear: yearRange[0],
        maxYear: yearRange[1],
        transmission: transmission === "any-transmission" ? "" : transmission,
        color: color === "any-color" ? "" : color,
        // Keep searchQuery as is - don't convert empty strings
        searchQuery: searchQuery
      };
      
      // Force the filter change with processed values
      onFilterChange(processedFilters);
    }
  };

  const handleReset = () => {
    setBrand("all-makes");
    setModel("all-models");
    setBodyType("all-body-types");
    setFuelType("all-fuel-types");
    setTransmission("any-transmission");
    setColor("any-color");
    setSearchQuery("");
    setPriceRange([500000, 1500000]); // 5-15 lakh rupees
    setYearRange([2000, new Date().getFullYear()]);
    
    // Make sure to apply the reset filters
    handleApplyFilters();
  };

  return (
    <div className={simplified ? "space-y-4" : "space-y-6"}>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {/* Search input removed from simplified view */}
      
        <div className="w-full sm:w-auto">
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-makes">All Makes</SelectItem>
              {brands?.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-models">All Models</SelectItem>
              {/* Popular Indian car models */}
              <SelectItem value="Swift">Swift</SelectItem>
              <SelectItem value="Nexon">Nexon</SelectItem>
              <SelectItem value="Creta">Creta</SelectItem>
              <SelectItem value="XUV700">XUV700</SelectItem>
              <SelectItem value="Thar">Thar</SelectItem>
              <SelectItem value="Baleno">Baleno</SelectItem>
              <SelectItem value="i20">i20</SelectItem>
              {/* International models */}
              <SelectItem value="Model S">Model S</SelectItem>
              <SelectItem value="Model 3">Model 3</SelectItem>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="3-series">3 Series</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select value={bodyType} onValueChange={setBodyType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Body Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-body-types">All Body Types</SelectItem>
              {bodyTypes?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Fuel Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-fuel-types">All Fuel Types</SelectItem>
              {fuelTypes?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full sm:w-auto bg-accent hover:bg-accent-light" 
          onClick={handleApplyFilters}
        >
          <Filter className="mr-2 h-4 w-4" /> Filter Results
        </Button>
      </div>

      {!simplified && (
        <>
          {/* Search Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {/* Price Range */}
            <div>
              <div className="flex justify-between mb-2">
                <Label>Price Range</Label>
                <div className="text-sm text-neutral-medium">
                  ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </div>
              </div>
              {/* Using range up to 30 lakh rupees (common for Indian car market) */}
              <Slider
                value={priceRange}
                min={0}
                max={3000000}
                step={100000}
                onValueChange={setPriceRange}
                className="range-slider"
              />
            </div>

            {/* Year Range */}
            <div>
              <div className="flex justify-between mb-2">
                <Label>Year</Label>
                <div className="text-sm text-neutral-medium">
                  {yearRange[0]} - {yearRange[1]}
                </div>
              </div>
              <Slider
                value={yearRange}
                min={1990}
                max={new Date().getFullYear()}
                step={1}
                onValueChange={setYearRange}
                className="range-slider"
              />
            </div>
            
            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transmission */}
              <div>
                <Label className="mb-2 block">Transmission</Label>
                <Select value={transmission} onValueChange={setTransmission}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any Transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-transmission">Any Transmission</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Color */}
              <div>
                <Label className="mb-2 block">Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any Color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any-color">Any Color</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
