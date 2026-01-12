import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Car } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp, Loader2, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface PricePredictionProps {
  car: Car;
}

export default function PricePrediction({ car }: PricePredictionProps) {
  const [years, setYears] = useState(5);
  const [predictionTab, setPredictionTab] = useState("current");
  
  // Query for comparable cars
  const { data: comparableCars, isLoading: isComparableLoading } = useQuery<Car[]>({
    queryKey: [`/api/comparable-cars/${car.id}`],
    enabled: !!car.id,
  });

  // Current price prediction mutation
  const currentPriceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/predict-price", {
        car: {
          brand: car.brand,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          fuel: car.fuel,
          bodyType: car.bodyType,
          transmission: car.transmission
        }
      });
      return response.json();
    }
  });

  // Future price prediction mutation
  const futurePriceMutation = useMutation({
    mutationFn: async (years: number) => {
      const response = await apiRequest("POST", "/api/predict-future-price", {
        car: {
          brand: car.brand,
          model: car.model,
          year: car.year,
          mileage: car.mileage,
          fuel: car.fuel,
          bodyType: car.bodyType,
          transmission: car.transmission,
          price: car.price
        },
        years
      });
      return response.json();
    }
  });

  // Handle current price prediction
  const handlePredictCurrentPrice = () => {
    if (!currentPriceMutation.isPending) {
      currentPriceMutation.mutate();
    }
  };

  // Handle future price prediction
  const handlePredictFuturePrice = () => {
    if (!futurePriceMutation.isPending) {
      futurePriceMutation.mutate(years);
    }
  };

  // Calculate price difference between listed and predicted price
  const getPriceDifference = () => {
    if (!currentPriceMutation.data) return null;
    
    const listedPrice = Number(car.price);
    const predictedPrice = currentPriceMutation.data.predictedPrice;
    const difference = listedPrice - predictedPrice;
    const percentDiff = (difference / predictedPrice) * 100;
    
    return {
      difference,
      percentDiff,
      isOverpriced: difference > 0
    };
  };

  // Average price of comparable cars
  const getAverageComparablePrice = () => {
    if (!comparableCars || comparableCars.length === 0) return null;
    
    const sum = comparableCars.reduce((total, car) => total + Number(car.price), 0);
    return sum / comparableCars.length;
  };

  const priceDiff = getPriceDifference();
  const avgComparablePrice = getAverageComparablePrice();

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={predictionTab} onValueChange={setPredictionTab}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-montserrat">AI Price Analysis</h3>
            <TabsList>
              <TabsTrigger value="current">Current Value</TabsTrigger>
              <TabsTrigger value="future">Future Value</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="current">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-neutral-medium">Listed Price:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-neutral-medium" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-56 text-xs">This is the price set by the dealer for this vehicle.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-xl font-bold">₹{Number(car.price).toLocaleString()}</div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-sm text-neutral-medium">Market Value:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-neutral-medium" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-56 text-xs">AI predicted market value based on vehicle attributes, market trends, and comparable vehicles.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-xl font-bold">
                    {currentPriceMutation.isPending ? (
                      <div className="flex justify-end">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    ) : currentPriceMutation.data ? (
                      `₹${Number(currentPriceMutation.data.predictedPrice).toLocaleString()}`
                    ) : (
                      "Not calculated"
                    )}
                  </div>
                </div>
              </div>

              {priceDiff && (
                <div className={`p-3 rounded-lg ${priceDiff.isOverpriced ? 'bg-error-light' : 'bg-success-light'}`}>
                  <div className={`text-sm font-medium ${priceDiff.isOverpriced ? 'text-error' : 'text-success'}`}>
                    This vehicle is {priceDiff.isOverpriced ? 'overpriced' : 'a good deal'} by approximately ₹{Math.abs(priceDiff.difference).toLocaleString()} ({Math.abs(priceDiff.percentDiff).toFixed(1)}%)
                  </div>
                </div>
              )}

              <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-semibold mb-2">Similar Vehicles in Market</h4>
                
                {isComparableLoading ? (
                  <div className="h-20 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : comparableCars && comparableCars.length > 0 ? (
                  <>
                    <div className="text-xs text-neutral-medium mb-2">
                      Average price: <span className="font-medium">₹{avgComparablePrice ? Math.round(avgComparablePrice).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {comparableCars.map((comparable) => (
                        <div key={comparable.id} className="flex justify-between text-xs border-b pb-1">
                          <span className="text-neutral-medium">{comparable.year} {comparable.brand} {comparable.model}</span>
                          <span className="font-medium">₹{Number(comparable.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-neutral-medium">No comparable vehicles found.</div>
                )}
              </div>

              {!currentPriceMutation.data && (
                <Button
                  onClick={handlePredictCurrentPrice}
                  className="w-full"
                  disabled={currentPriceMutation.isPending}
                >
                  {currentPriceMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="mr-2 h-4 w-4" />
                  )}
                  Calculate Market Value
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="future">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-neutral-medium">Predict value after</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={years}
                      onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                      className="w-20 h-8"
                    />
                    <span className="text-sm">years</span>
                  </div>
                </div>

                <Button
                  onClick={handlePredictFuturePrice}
                  className="w-full mb-4"
                  disabled={futurePriceMutation.isPending}
                >
                  {futurePriceMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2 h-4 w-4" />
                  )}
                  Predict Future Value
                </Button>

                {futurePriceMutation.data && (
                  <div className="bg-neutral-lightest p-4 rounded-lg">
                    <div className="text-sm text-neutral-medium mb-1">
                      Estimated value in {years} {years === 1 ? 'year' : 'years'}:
                    </div>
                    <div className="text-2xl font-bold">
                      ₹{Number(futurePriceMutation.data.futurePrice).toLocaleString()}
                    </div>
                    
                    <div className="mt-2 text-xs text-neutral-medium">
                      Depreciation rate: {futurePriceMutation.data.depreciationRate ? `${(futurePriceMutation.data.depreciationRate * 100).toFixed(1)}%` : 'N/A'} per year
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-grow h-1 bg-neutral-light rounded-full">
                        <div
                          className="h-1 bg-primary rounded-full"
                          style={{
                            width: `${100 - ((Number(futurePriceMutation.data.futurePrice) / Number(car.price)) * 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-neutral-medium whitespace-nowrap">
                        {((1 - (Number(futurePriceMutation.data.futurePrice) / Number(car.price))) * 100).toFixed(1)}% 
                        {' '}loss in value
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Factors Affecting Future Value</div>
                <ul className="text-xs space-y-1 text-neutral-medium">
                  <li>• Brand depreciation rates (luxury vs. economy)</li>
                  <li>• Vehicle age and mileage projection</li>
                  <li>• Fuel type (electric vehicles typically depreciate differently)</li>
                  <li>• Market trends and inflation</li>
                  <li>• Vehicle condition (assumed average)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}