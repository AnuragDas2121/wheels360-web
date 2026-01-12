import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MarketAnalysisProps {
  className?: string;
}

interface PriceTrends {
  brands: Record<string, { avgPrice: number; change: number }>;
  fuelTypes: Record<string, { avgPrice: number }>;
  bodyTypes: Record<string, { avgPrice: number }>;
  yearlyTrends: Array<{ year: number; avgPrice: number; change: number }>;
}

export default function MarketAnalysis({ className }: MarketAnalysisProps) {
  // Fetch market price analysis data
  const { data: priceTrends, isLoading, error } = useQuery<PriceTrends>({
    queryKey: ['/api/market-price-analysis'],
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold font-montserrat mb-6">Market Price Analysis</h3>
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !priceTrends) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold font-montserrat mb-4">Market Price Analysis</h3>
          <p className="text-neutral-medium">Failed to load market analysis data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for brand chart
  const brandData = Object.entries(priceTrends.brands).map(([brand, data]) => ({
    name: brand,
    value: data.avgPrice,
    change: data.change
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Format data for fuel type chart
  const fuelData = Object.entries(priceTrends.fuelTypes).map(([type, data]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: data.avgPrice
  }));

  // Format data for body type chart
  const bodyData = Object.entries(priceTrends.bodyTypes).map(([type, data]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: data.avgPrice
  }));

  // Format data for yearly trends
  const yearlyData = priceTrends.yearlyTrends.map(data => ({
    name: data.year.toString(),
    value: data.avgPrice,
    change: data.change
  }));

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-md text-xs">
          <p className="font-medium">{`${payload[0].payload.name}`}</p>
          <p className="text-primary">{`Average Price: ₹${payload[0].value.toLocaleString()}`}</p>
          {payload[0].payload.change !== undefined && (
            <p className={payload[0].payload.change >= 0 ? "text-success" : "text-error"}>
              Change: {payload[0].payload.change >= 0 ? '+' : ''}{payload[0].payload.change}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold font-montserrat mb-4">Market Price Analysis</h3>
        
        <Tabs defaultValue="brands">
          <TabsList className="mb-4">
            <TabsTrigger value="brands">By Brand</TabsTrigger>
            <TabsTrigger value="fuel">By Fuel Type</TabsTrigger>
            <TabsTrigger value="body">By Body Type</TabsTrigger>
            <TabsTrigger value="yearly">Yearly Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brands">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `₹${(value/1000)}k`} />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip content={renderTooltip} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-neutral-medium text-center mt-2">
              Average prices by brand with year-over-year change percentage
            </div>
          </TabsContent>
          
          <TabsContent value="fuel">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `₹${(value/1000)}k`} />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip content={renderTooltip} />
                  <Bar dataKey="value" fill="hsl(var(--secondary))" barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-neutral-medium text-center mt-2">
              Average prices by fuel type across all vehicles
            </div>
          </TabsContent>
          
          <TabsContent value="body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bodyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `₹${(value/1000)}k`} />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip content={renderTooltip} />
                  <Bar dataKey="value" fill="hsl(var(--accent))" barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-neutral-medium text-center mt-2">
              Average prices by body type across all vehicles
            </div>
          </TabsContent>
          
          <TabsContent value="yearly">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value/1000)}k`} />
                  <Tooltip content={renderTooltip} />
                  <Bar dataKey="value" fill="hsl(var(--warning))" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-neutral-medium text-center mt-2">
              Average car prices by model year with year-over-year change
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}