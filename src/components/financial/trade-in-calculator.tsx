import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { IndianRupee, Car as CarIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TradeInCalculatorProps {
  onValueCalculated?: (value: number) => void;
}

export default function TradeInCalculator({ onValueCalculated }: TradeInCalculatorProps) {
  const { toast } = useToast();
  
  // Car details
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear() - 3); // Default to 3 years old
  const [mileage, setMileage] = useState<number>(45000);
  const [condition, setCondition] = useState<string>("good");
  
  // Features
  const [fuel, setFuel] = useState<string>("gasoline");
  const [transmission, setTransmission] = useState<string>("automatic");
  
  // Trade-in value calculation
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [marketValue, setMarketValue] = useState<number | null>(null);
  
  // Available brands for dropdown
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  
  // Load available brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiRequest("GET", "/api/brands");
        const data = await response.json();
        setAvailableBrands(data);
        if (data.length > 0) {
          setBrand(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };
    
    fetchBrands();
  }, []);
  
  // Handle mileage change slider
  const handleMileageChange = (value: number[]) => {
    setMileage(value[0]);
  };
  
  // Calculate the trade-in value
  const calculateTradeInValue = async () => {
    // Validation
    if (!brand || !model || !year) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Construct car object for prediction
      const carData = {
        brand,
        model,
        year,
        mileage,
        fuel,
        transmission,
        condition,
      };
      
      // Call API to get trade-in value estimation
      const response = await apiRequest("POST", "/api/estimate-trade-in", carData);
      const data = await response.json();
      
      // Set trade-in value
      setTradeInValue(data.tradeInValue);
      setMarketValue(data.marketValue);
      
      // Notify parent component (if callback provided)
      if (onValueCalculated) {
        onValueCalculated(data.tradeInValue);
      }
      
      toast({
        title: "Trade-In Value Calculated",
        description: "Your estimated trade-in value has been calculated.",
      });
    } catch (error) {
      console.error("Failed to calculate trade-in value:", error);
      toast({
        title: "Calculation Failed",
        description: "Failed to calculate trade-in value. Please try again.",
        variant: "destructive",
      });
      
      // Fallback calculation method if API fails
      const baseValue = 500000; // Base value for calculation
      const yearFactor = Math.max(0, 1 - (new Date().getFullYear() - year) * 0.08); // Depreciation by year
      const mileageFactor = Math.max(0, 1 - mileage / 200000); // Depreciation by mileage
      
      // Condition factors
      const conditionFactors: Record<string, number> = {
        excellent: 1.1,
        good: 1.0,
        fair: 0.85,
        poor: 0.7
      };
      
      // Brand factors (premium brands have higher retention value)
      const premiumBrands = ["Mercedes-Benz", "BMW", "Audi", "Lexus", "Porsche", "Tesla"];
      const brandFactor = premiumBrands.includes(brand) ? 1.2 : 1.0;
      
      // Calculate estimated value
      const estimatedValue = baseValue * yearFactor * mileageFactor * conditionFactors[condition] * brandFactor;
      
      // Set fallback trade-in value (typically 70-80% of market value)
      const fallbackTradeInValue = estimatedValue * 0.75;
      
      setTradeInValue(fallbackTradeInValue);
      setMarketValue(estimatedValue);
      
      // Notify parent component (if callback provided)
      if (onValueCalculated) {
        onValueCalculated(fallbackTradeInValue);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CarIcon className="h-5 w-5" />
          Trade-In Value Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="car-brand">Car Brand</Label>
              <select
                id="car-brand"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Select Brand</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="car-model">Car Model</Label>
              <Input
                id="car-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Accord, Civic"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="car-year">Year</Label>
              <Input
                id="car-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1990}
                max={new Date().getFullYear()}
              />
            </div>
            
            <div>
              <div className="flex justify-between">
                <Label htmlFor="car-mileage">Mileage ({mileage.toLocaleString()} km)</Label>
              </div>
              <div className="pt-2 px-1">
                <Slider
                  id="car-mileage"
                  min={0}
                  max={200000}
                  step={1000}
                  value={[mileage]}
                  onValueChange={handleMileageChange}
                  className="my-2"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="car-condition">Condition</Label>
              <select
                id="car-condition"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="car-fuel">Fuel Type</Label>
              <select
                id="car-fuel"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
              >
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="car-transmission">Transmission</Label>
              <select
                id="car-transmission"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="cvt">CVT</option>
              </select>
            </div>
          </div>
          
          <Button
            className="w-full"
            onClick={calculateTradeInValue}
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate Trade-In Value"}
          </Button>
          
          {tradeInValue > 0 && (
            <>
              <Separator className="my-2" />
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-neutral-medium">Estimated Trade-In Value</div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    ₹{tradeInValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
                
                {marketValue && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-neutral-medium">Estimated Market Value:</div>
                    <div>₹{marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                )}
                
                <div className="flex items-start gap-2 p-3 bg-neutral-50 rounded-md text-sm">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="text-neutral-medium">
                    This is an estimated value based on current market conditions. Actual trade-in value may vary based on dealer inspection, local market, and vehicle history.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}