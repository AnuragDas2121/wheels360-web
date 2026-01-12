import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceTrend {
  brands: {
    [key: string]: {
      change: number;
      percentage: number;
    };
  };
  history: {
    [category: string]: {
      [brand: string]: number[];
    };
  };
}

export default function PriceTrends() {
  const { data: priceTrends, isLoading, error } = useQuery<PriceTrend>({
    queryKey: ["/api/price-trends"],
  });

  // Create chart data from the API response
  const chartData = [];
  if (priceTrends?.history?.luxury) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 12; i++) {
      const dataPoint: { name: string; [key: string]: string | number } = { name: months[i] };
      
      Object.entries(priceTrends.history.luxury).forEach(([brand, prices]) => {
        dataPoint[brand] = prices[i];
      });
      
      chartData.push(dataPoint);
    }
  }

  return (
    <section className="py-16 bg-neutral-lightest">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold font-montserrat mb-2">Market Trends & Price History</h2>
          <p className="text-neutral-medium">Make informed decisions with our market data</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-error">Failed to load price trends. Please try again later.</p>
          </div>
        ) : priceTrends ? (
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3">
                <h3 className="text-xl font-bold font-montserrat mb-4">Price Trends by Brand</h3>
                <p className="text-neutral-medium mb-6">
                  Average prices over the past 12 months for popular brands.
                </p>

                <div className="space-y-4">
                  {priceTrends.brands && Object.entries(priceTrends.brands).map(([brand, data]) => (
                    <div key={brand}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{brand}</span>
                        <span className={data.change >= 0 ? "text-success" : "text-error"}>
                          {data.change >= 0 ? "+" : ""}
                          {data.change}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-light rounded-full h-2">
                        <div
                          className={`${
                            data.change >= 0 ? "bg-success" : "bg-error"
                          } h-2 rounded-full`}
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="flex flex-wrap justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-montserrat">Price History: Luxury Sedans</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-accent rounded-full inline-block mr-2"></span>
                      <span className="text-sm text-neutral-medium">Mercedes-Benz</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-secondary rounded-full inline-block mr-2"></span>
                      <span className="text-sm text-neutral-medium">BMW</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-primary rounded-full inline-block mr-2"></span>
                      <span className="text-sm text-neutral-medium">Audi</span>
                    </div>
                  </div>
                </div>

                <div className="h-64">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Mercedes-Benz"
                          stroke="hsl(var(--accent))"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="BMW"
                          stroke="hsl(var(--secondary))"
                        />
                        <Line
                          type="monotone"
                          dataKey="Audi"
                          stroke="hsl(var(--primary))"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-neutral-medium">No price history data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-neutral-medium">No price trend data available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/price-trends">
            <Button className="inline-block bg-accent hover:bg-accent-light text-white font-medium py-3 px-8 rounded-lg transition">
              Explore Market Data
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
