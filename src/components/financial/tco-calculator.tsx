import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, BarChart3, Download, TrendingUp } from "lucide-react";
import { Car } from "@shared/schema";

interface TcoCalculatorProps {
  car?: Car;
  defaultPrice?: number;
}

export default function TcoCalculator({ car, defaultPrice = 25000 }: TcoCalculatorProps) {
  const initialPrice = car?.price ? Number(car.price) : defaultPrice;
  
  // Base car information
  const [carPrice, setCarPrice] = useState<number>(initialPrice);
  const [ownershipYears, setOwnershipYears] = useState<number>(5);
  const [annualMileage, setAnnualMileage] = useState<number>(15000);
  
  // Fuel costs for Indian market
  const [fuelType, setFuelType] = useState<string>(car?.fuel || "gasoline");
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(car?.fuel === "electric" ? 4 : 14); // km/L or km/kWh
  const [fuelPrice, setFuelPrice] = useState<number>(
    fuelType === "electric" ? 8 : // Price per kWh in India (₹8/kWh)
    fuelType === "diesel" ? 90 :  // Diesel price per L in India (₹90/L)
    fuelType === "gasoline" ? 105 : // Petrol price per L in India (₹105/L)
    100 // Default
  ); // Price per L or kWh
  
  // Maintenance and repairs (adjusted for Indian market)
  const [annualMaintenanceCost, setAnnualMaintenanceCost] = useState<number>(
    car?.year 
      ? Math.max(8000, 
          // Indian maintenance costs are typically lower for domestic brands
          car?.brand?.includes("Tata") || car?.brand?.includes("Mahindra") || car?.brand?.includes("Maruti") 
            ? 15000 - (car.year - new Date().getFullYear() + 5) * 800
            : 20000 - (car.year - new Date().getFullYear() + 5) * 1000) 
      : 12000
  );
  
  // Insurance (adjusted for Indian market)
  const [annualInsuranceCost, setAnnualInsuranceCost] = useState<number>(
    // In India, insurance is typically 2-3% for new cars but can be higher for luxury vehicles
    car?.brand?.includes("BMW") || car?.brand?.includes("Mercedes") || car?.brand?.includes("Audi") 
      ? Math.round(initialPrice * 0.04) // 4% for luxury brands  
      : Math.round(initialPrice * 0.025) // 2.5% for regular brands
  );
  
  // Taxes and registration fees (adjusted for Indian market)
  const [registrationFee, setRegistrationFee] = useState<number>(
    // In India, registration fees are based on vehicle cost and vary by state
    // Using a simplified calculation based on national averages
    initialPrice < 500000 
      ? 5000 // Base fee for cars under 5 lakhs
      : initialPrice < 1000000 
        ? 10000 // Fee for cars between 5-10 lakhs
        : initialPrice < 2000000 
          ? 20000 // Fee for cars between 10-20 lakhs
          : Math.round(initialPrice * 0.02) // 2% for luxury cars above 20 lakhs
  );
  
  // Depreciation (adjusted for Indian market)
  const [depreciationRate, setDepreciationRate] = useState<number>(
    // Indian market has different depreciation patterns based on brand prestige and fuel type
    car?.fuel === "electric" ? 18 : // EVs depreciate faster in India due to limited infrastructure
    car?.brand?.includes("Maruti") || car?.brand?.includes("Tata") || car?.brand?.includes("Mahindra") ? 10 : // Indian brands hold value better in India
    car?.brand?.includes("Toyota") || car?.brand?.includes("Honda") ? 11 : // Japanese brands hold value well in India
    car?.brand?.includes("Hyundai") || car?.brand?.includes("Kia") ? 12 : // Korean brands
    car?.brand?.includes("BMW") || car?.brand?.includes("Mercedes") || car?.brand?.includes("Audi") ? 15 : // Luxury brands depreciate faster
    13 // Default for other brands
  ); // Annual depreciation rate (%)
  
  // Financing (loan calculator result)
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [includeFinancing, setIncludeFinancing] = useState<boolean>(false);
  
  // TCO calculations
  const [totalCost, setTotalCost] = useState<number>(0);
  const [monthlyCost, setMonthlyCost] = useState<number>(0);
  const [costBreakdown, setCostBreakdown] = useState<any>({});
  
  // Calculate TCO
  useEffect(() => {
    // Calculate depreciation
    let totalDepreciation = 0;
    let currentValue = carPrice;
    
    for (let i = 0; i < ownershipYears; i++) {
      const yearlyDepreciation = currentValue * (depreciationRate / 100);
      totalDepreciation += yearlyDepreciation;
      currentValue -= yearlyDepreciation;
    }
    
    // Calculate fuel costs
    const totalMileage = annualMileage * ownershipYears;
    let fuelCost = 0;
    
    if (fuelType === "electric") {
      // For electric: km/kWh * price per kWh
      fuelCost = (totalMileage / fuelEfficiency) * fuelPrice;
    } else {
      // For gas/diesel: km/L * price per L
      fuelCost = (totalMileage / fuelEfficiency) * fuelPrice;
    }
    
    // Calculate maintenance and repairs
    const maintenanceCost = annualMaintenanceCost * ownershipYears;
    
    // Calculate insurance
    const insuranceCost = annualInsuranceCost * ownershipYears;
    
    // Calculate taxes and fees (one-time payment)
    const taxesAndFees = registrationFee;
    
    // Calculate financing cost (if included)
    const financingCost = includeFinancing ? (monthlyPayment * 12 * ownershipYears) : 0;
    
    // Calculate total costs
    const totalFinancingCost = includeFinancing ? financingCost : carPrice;
    const total = totalDepreciation + fuelCost + maintenanceCost + insuranceCost + taxesAndFees;
    
    // Monthly cost
    const monthly = total / (ownershipYears * 12);
    
    // Update state
    setTotalCost(total);
    setMonthlyCost(monthly);
    
    // Set cost breakdown
    setCostBreakdown({
      depreciation: totalDepreciation,
      fuel: fuelCost,
      maintenance: maintenanceCost,
      insurance: insuranceCost,
      taxes: taxesAndFees,
      financing: includeFinancing ? financingCost - carPrice : 0,
    });
  }, [
    carPrice, 
    ownershipYears, 
    annualMileage, 
    fuelType, 
    fuelEfficiency, 
    fuelPrice,
    annualMaintenanceCost,
    annualInsuranceCost,
    registrationFee,
    depreciationRate,
    monthlyPayment,
    includeFinancing
  ]);
  
  // Handle ownership years change
  const handleOwnershipYearsChange = (value: number[]) => {
    setOwnershipYears(value[0]);
  };
  
  // Handle annual mileage change
  const handleAnnualMileageChange = (value: number[]) => {
    setAnnualMileage(value[0]);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Total Cost of Ownership Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="car-price">Car Price (₹)</Label>
              <Input
                id="car-price"
                type="number"
                value={carPrice}
                onChange={(e) => setCarPrice(Number(e.target.value))}
                min={0}
              />
            </div>
            
            <div>
              <div className="flex justify-between">
                <Label htmlFor="ownership-years">Ownership Period ({ownershipYears} years)</Label>
              </div>
              <div className="pt-2 px-1">
                <Slider
                  id="ownership-years"
                  min={1}
                  max={10}
                  step={1}
                  value={[ownershipYears]}
                  onValueChange={handleOwnershipYearsChange}
                  className="my-2"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between">
                <Label htmlFor="annual-mileage">Annual Mileage ({annualMileage.toLocaleString()} km)</Label>
              </div>
              <div className="pt-2 px-1">
                <Slider
                  id="annual-mileage"
                  min={5000}
                  max={50000}
                  step={1000}
                  value={[annualMileage]}
                  onValueChange={handleAnnualMileageChange}
                  className="my-2"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="fuel-type">Fuel Type</Label>
              <select
                id="fuel-type"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={fuelType}
                onChange={(e) => {
                  setFuelType(e.target.value);
                  // Adjust fuel efficiency based on fuel type with Indian prices and efficiencies
                  if (e.target.value === "electric") {
                    setFuelEfficiency(4); // km/kWh
                    setFuelPrice(8); // ₹8/kWh in India
                  } else if (e.target.value === "hybrid") {
                    setFuelEfficiency(20); // km/L
                    setFuelPrice(105); // Petrol price in India
                  } else if (e.target.value === "diesel") {
                    setFuelEfficiency(18); // km/L for diesel
                    setFuelPrice(90); // Diesel price in India
                  } else {
                    setFuelEfficiency(14); // km/L for petrol
                    setFuelPrice(105); // Petrol price in India
                  }
                }}
              >
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuel-efficiency">
                  {fuelType === "electric" ? "Efficiency (km/kWh)" : "Fuel Efficiency (km/L)"}
                </Label>
                <Input
                  id="fuel-efficiency"
                  type="number"
                  value={fuelEfficiency}
                  onChange={(e) => setFuelEfficiency(Number(e.target.value))}
                  min={0}
                  step={0.1}
                />
              </div>
              
              <div>
                <Label htmlFor="fuel-price">
                  {fuelType === "electric" ? "Electricity Price (₹/kWh)" : "Fuel Price (₹/L)"}
                </Label>
                <Input
                  id="fuel-price"
                  type="number"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenance-cost">Annual Maintenance (₹)</Label>
                <Input
                  id="maintenance-cost"
                  type="number"
                  value={annualMaintenanceCost}
                  onChange={(e) => setAnnualMaintenanceCost(Number(e.target.value))}
                  min={0}
                />
              </div>
              
              <div>
                <Label htmlFor="insurance-cost">Annual Insurance (₹)</Label>
                <Input
                  id="insurance-cost"
                  type="number"
                  value={annualInsuranceCost}
                  onChange={(e) => setAnnualInsuranceCost(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="registration-fee">Registration Fee (₹)</Label>
                <Input
                  id="registration-fee"
                  type="number"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(Number(e.target.value))}
                  min={0}
                />
              </div>
              
              <div>
                <Label htmlFor="depreciation-rate">Annual Depreciation (%)</Label>
                <Input
                  id="depreciation-rate"
                  type="number"
                  value={depreciationRate}
                  onChange={(e) => setDepreciationRate(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="include-financing"
                  checked={includeFinancing}
                  onChange={(e) => setIncludeFinancing(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="include-financing">Include Financing Costs</Label>
              </div>
              
              {includeFinancing && (
                <div>
                  <Label htmlFor="monthly-payment">Monthly Payment (₹)</Label>
                  <Input
                    id="monthly-payment"
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                    min={0}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="pt-4">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-sm text-neutral-medium">5-Year Total Cost of Ownership</div>
                <div className="text-3xl font-bold text-primary mt-1">
                  ₹{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-neutral-medium mt-2">
                  ₹{monthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} per month
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="text-lg font-semibold">Cost Breakdown</div>
                
                {Object.entries(costBreakdown).map(([category, cost]: [string, any]) => (
                  <div key={category} className="flex justify-between items-center">
                    <div className="capitalize text-neutral-medium">
                      {category === "taxes" ? "Taxes & Fees" : category}
                    </div>
                    <div className="flex items-center gap-2">
                      <div>₹{cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-xs text-neutral-light">
                        ({Math.round((cost / totalCost) * 100)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex flex-col space-y-2">
                <div className="text-sm text-neutral-medium">Resale Value (after {ownershipYears} years)</div>
                <div className="text-lg font-medium">
                  ₹{(carPrice * Math.pow(1 - depreciationRate / 100, ownershipYears)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-neutral-light">
                  ({Math.round((1 - Math.pow(1 - depreciationRate / 100, ownershipYears)) * 100)}% depreciation)
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Chart
                </Button>
                <Button className="flex-1" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Save Results
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}