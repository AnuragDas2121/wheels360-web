import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Loader2, X, Plus, Save, Check, Search } from "lucide-react";
import { Car, InsertComparison } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CarComparisonTable from "@/components/cars/car-comparison-table";
import MarketAnalysis from "@/components/cars/market-analysis";

export default function ComparePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number[]>([0, 1, 2]);
  const [isSavedComparison, setIsSavedComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  
  // Check URL for car IDs to pre-populate comparison
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idsParam = params.get('ids');
    
    if (idsParam) {
      try {
        const ids = idsParam.split(',').map(id => parseInt(id));
        if (ids.length > 0 && ids.every(id => !isNaN(id))) {
          setSelectedCarIds(ids.slice(0, 3)); // Limit to 3 cars max
        }
      } catch (e) {
        console.error("Error parsing car IDs from URL:", e);
      }
    }
  }, []);
  
  // Fetch all cars for selection
  const { data: allCars, isLoading } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
  });
  
  // Fetch details for selected cars
  const { data: selectedCars, isLoading: isLoadingSelected } = useQuery<Car[]>({
    queryKey: ['/api/cars', ...selectedCarIds],
    queryFn: async () => {
      if (selectedCarIds.length === 0) return [];
      
      const promises = selectedCarIds.map(id => 
        fetch(`/api/cars/${id}`).then(res => res.json())
      );
      
      return Promise.all(promises);
    },
    enabled: selectedCarIds.length > 0,
  });
  
  // Handle car selection
  const handleSelectCar = (carId: string, slotIndex: number) => {
    if (!carId) {
      const newIds = [...selectedCarIds];
      const indexToRemove = availableSlots.indexOf(slotIndex);
      if (indexToRemove !== -1) {
        newIds.splice(indexToRemove, 1);
      }
      setSelectedCarIds(newIds);
      return;
    }
    
    const id = parseInt(carId);
    const newIds = [...selectedCarIds];
    
    // If slot already has a car, replace it
    if (availableSlots[slotIndex] !== undefined) {
      newIds[slotIndex] = id;
    } else {
      newIds.push(id);
    }
    
    setSelectedCarIds(newIds);
  };
  
  // Handle removing a car from comparison
  const handleRemoveCar = (slotIndex: number) => {
    const newIds = [...selectedCarIds];
    newIds.splice(slotIndex, 1);
    setSelectedCarIds(newIds);
  };
  
  // Handle adding another car to compare
  const handleAddCar = () => {
    if (selectedCarIds.length < 3) {
      setAvailableSlots([...availableSlots, selectedCarIds.length]);
    }
  };
  
  // Save comparison mutation
  const saveComparisonMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to save comparisons");
      if (selectedCarIds.length < 2) throw new Error("Please select at least two cars to compare");
      
      const comparisonData: InsertComparison = {
        userId: user.id,
        carIds: selectedCarIds
      };
      
      return apiRequest("POST", "/api/comparisons", comparisonData);
    },
    onSuccess: () => {
      toast({
        title: "Comparison Saved",
        description: "You can access your saved comparisons from your dashboard.",
      });
      setIsSavedComparison(true);
      queryClient.invalidateQueries({ queryKey: ['/api/comparisons'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save comparison.",
        variant: "destructive",
      });
    },
  });

  // Handle save comparison
  const handleSaveComparison = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save comparisons.",
        variant: "destructive",
      });
      return;
    }
    
    saveComparisonMutation.mutate();
  };
  
  // Filter cars based on search query
  useEffect(() => {
    if (allCars) {
      if (!searchQuery.trim()) {
        setFilteredCars(allCars);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = allCars.filter(car => (
          car.title.toLowerCase().includes(query) ||
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.bodyType.toLowerCase().includes(query) ||
          car.fuel.toLowerCase().includes(query)
        ));
        setFilteredCars(filtered);
      }
    }
  }, [searchQuery, allCars]);

  // Update available slots when cars change
  useEffect(() => {
    setAvailableSlots(Array.from({ length: Math.min(3, selectedCarIds.length + 1) }, (_, i) => i));
    // Reset saved status when selection changes
    setIsSavedComparison(false);
  }, [selectedCarIds]);
  
  return (
    <>
      <Helmet>
        <title>Compare Vehicles | Wheels360</title>
        <meta name="description" content="Compare multiple vehicles side by side to help you make the right decision." />
      </Helmet>
      
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-4">
            Compare Vehicles
          </h1>
          <p className="text-white opacity-90 max-w-3xl">
            Compare multiple vehicles side by side to help you make an informed decision.
            Select up to 3 vehicles to compare their specifications and features.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold font-montserrat mb-6">Select Vehicles to Compare</h2>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-medium" />
                <Input 
                  type="text" 
                  placeholder="Search by brand, model, fuel type..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-neutral-medium">
                  Showing {filteredCars.length} of {allCars?.length || 0} cars
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableSlots.map((slotIndex) => (
                <div key={slotIndex} className="relative">
                  {isLoading ? (
                    <div className="h-12 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Select
                      value={selectedCarIds[slotIndex]?.toString() || ""}
                      onValueChange={(value) => handleSelectCar(value, slotIndex)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {searchQuery ? (
                          filteredCars.length > 0 ? (
                            (() => {
                              // Group filtered cars by brand
                              const brandGroups: Record<string, Car[]> = {};
                              filteredCars.forEach(car => {
                                if (!brandGroups[car.brand]) {
                                  brandGroups[car.brand] = [];
                                }
                                brandGroups[car.brand].push(car);
                              });
                              
                              // Sort brands alphabetically
                              return Object.keys(brandGroups).sort().map(brand => (
                                <SelectGroup key={brand}>
                                  <SelectLabel>{brand}</SelectLabel>
                                  {brandGroups[brand].map(car => (
                                    <SelectItem key={car.id} value={car.id.toString()}>
                                      {car.model} (₹{Number(car.price).toLocaleString()})
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ));
                            })()
                          ) : (
                            <div className="p-2 text-center text-neutral-medium">No cars match your search</div>
                          )
                        ) : (
                          allCars ? (
                            (() => {
                              // Group cars by brand for better organization
                              const brandGroups: Record<string, Car[]> = {};
                              allCars.forEach(car => {
                                if (!brandGroups[car.brand]) {
                                  brandGroups[car.brand] = [];
                                }
                                brandGroups[car.brand].push(car);
                              });
                              
                              // Sort brands alphabetically
                              return Object.keys(brandGroups).sort().map(brand => (
                                <SelectGroup key={brand}>
                                  <SelectLabel>{brand}</SelectLabel>
                                  {brandGroups[brand].map(car => (
                                    <SelectItem key={car.id} value={car.id.toString()}>
                                      {car.model} (₹{Number(car.price).toLocaleString()})
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ));
                            })()
                          ) : (
                            <div className="p-2 text-center text-neutral-medium">Loading cars...</div>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedCarIds[slotIndex] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => handleRemoveCar(slotIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCarIds.length > 0 && selectedCarIds.length < 3 && (
                <Button
                  variant="outline"
                  onClick={handleAddCar}
                  disabled={selectedCarIds.length >= 3}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Another Vehicle
                </Button>
              )}
              
              {selectedCarIds.length >= 2 && (
                <Button 
                  variant={isSavedComparison ? "outline" : "default"}
                  className={isSavedComparison ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : ""}
                  onClick={handleSaveComparison}
                  disabled={saveComparisonMutation.isPending || isSavedComparison}
                >
                  {saveComparisonMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isSavedComparison ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSavedComparison ? "Saved!" : "Save Comparison"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {isLoadingSelected ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedCars && selectedCars.length > 0 ? (
          <>
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold font-montserrat mb-6">Comparison</h2>
                <div className="overflow-x-auto">
                  <CarComparisonTable cars={selectedCars} />
                </div>
              </CardContent>
            </Card>
            
            {/* Market Analysis */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-montserrat mb-4">Market Insights</h2>
              <p className="text-neutral-medium mb-6">
                Understanding market trends can help you make a more informed purchase decision.
                Explore price variations across different brands, fuel types, and body styles.
              </p>
              <MarketAnalysis className="bg-white" />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-xl font-bold font-montserrat mb-2">No Vehicles Selected</h2>
            <p className="text-neutral-medium mb-6">
              Select at least one vehicle above to start comparing.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
