import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Calendar, 
  Fuel, 
  HelpCircle,
  Info,
  MapPin,
  FileText, 
  ExternalLink
} from "lucide-react";

export function LocalResources() {
  // Use state to track the selected state for the fuel price section
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  
  // State-specific fuel prices
  const fuelPrices: Record<string, { petrol: number; diesel: number; cng: number }> = {
    "Maharashtra": { petrol: 107.45, diesel: 94.38, cng: 76.00 },
    "Delhi": { petrol: 96.72, diesel: 89.62, cng: 74.50 },
    "Karnataka": { petrol: 101.94, diesel: 87.89, cng: 83.00 },
    "Tamil Nadu": { petrol: 102.63, diesel: 94.24, cng: 78.50 },
    "Gujarat": { petrol: 96.42, diesel: 92.17, cng: 72.50 },
  };
  
  // Latest automotive news
  const automotiveNews = [
    {
      title: "Tata Reveals New Curvv EV for Indian Market",
      date: "April 26, 2023",
      snippet: "Tata Motors has confirmed launch plans for its upcoming Curvv EV, promising 500km range and advanced features.",
      link: "#"
    },
    {
      title: "Maruti Suzuki to Launch 6 EVs by 2030",
      date: "April 22, 2023",
      snippet: "Maruti Suzuki plans to expand its electric vehicle lineup with six new models set to launch before 2030.",
      link: "#"
    },
    {
      title: "Mahindra Releases New Scorpio-N Variant",
      date: "April 18, 2023",
      snippet: "Mahindra has introduced a new mid-range variant of the popular Scorpio-N with additional features at competitive pricing.",
      link: "#"
    },
    {
      title: "Hyundai Announces Price Hike Starting May",
      date: "April 15, 2023",
      snippet: "Hyundai Motor India has announced a price increase across models starting May 1st due to rising input costs.",
      link: "#"
    },
  ];
  
  // RTO guidelines by state
  const rtoGuidelines: Record<string, { renewal: string; transfer: string; registration: string; }> = {
    "Maharashtra": {
      renewal: "₹1,000 for bikes, ₹5,000 for cars valid for 5 years",
      transfer: "₹300 basic fee + 2% of vehicle value",
      registration: "8% - 20% of vehicle cost depending on value and type"
    },
    "Delhi": {
      renewal: "₹1,000 for bikes, ₹3,000 for cars valid for 5 years",
      transfer: "₹500 basic fee + 1% of vehicle value",
      registration: "7% - 12.5% of vehicle cost depending on value and type"
    },
    "Karnataka": {
      renewal: "₹1,200 for bikes, ₹5,500 for cars valid for 5 years",
      transfer: "₹400 basic fee + 2% of vehicle value",
      registration: "10% - 18% of vehicle cost depending on value and type"
    },
    "Tamil Nadu": {
      renewal: "₹1,100 for bikes, ₹6,000 for cars valid for 5 years",
      transfer: "₹400 basic fee + 3% of vehicle value",
      registration: "8% - 15% of vehicle cost depending on value and type"
    },
    "Gujarat": {
      renewal: "₹900 for bikes, ₹4,500 for cars valid for 5 years",
      transfer: "₹300 basic fee + 2% of vehicle value",
      registration: "6% - 15% of vehicle cost depending on value and type"
    },
  };
  
  // Upcoming automotive events
  const automotiveEvents = [
    {
      title: "Auto Expo 2023 - Bengaluru",
      date: "May 15-19, 2023",
      location: "Bengaluru Exhibition Centre",
      description: "India's largest automotive showcase featuring new launches and concept vehicles."
    },
    {
      title: "EV Expo India - Delhi",
      date: "June 5-7, 2023",
      location: "Pragati Maidan, New Delhi",
      description: "Dedicated electric vehicle exhibition with latest EV models and charging solutions."
    },
    {
      title: "Mumbai International Motor Show",
      date: "July 23-30, 2023",
      location: "MMRDA Grounds, Mumbai",
      description: "Premium automotive showcase with luxury and performance vehicles."
    },
  ];
  
  return (
    <div className="bg-neutral-lightest py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-montserrat mb-2">Indian Automotive Resources</h2>
          <p className="text-neutral-medium max-w-2xl mx-auto">
            Essential information and resources for Indian car owners and buyers
          </p>
        </div>
        
        <Tabs defaultValue="fuel-prices">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto mb-8">
            <TabsTrigger value="fuel-prices">Fuel Prices</TabsTrigger>
            <TabsTrigger value="news">Automotive News</TabsTrigger>
            <TabsTrigger value="rto">RTO Guidelines</TabsTrigger>
            <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fuel-prices">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Fuel className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Current Fuel Prices</CardTitle>
                </div>
                <CardDescription>
                  Latest fuel prices across major Indian states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Select State</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.keys(fuelPrices).map((state) => (
                      <Button
                        key={state}
                        variant={selectedState === state ? "default" : "outline"}
                        onClick={() => setSelectedState(state)}
                        className="justify-start"
                      >
                        <MapPin className="h-4 w-4 mr-2" /> {state}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-neutral-lightest p-4 rounded-lg">
                  <div className="text-xl font-bold mb-2">
                    <span className="text-primary">{selectedState}</span> Fuel Prices
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-neutral-medium mb-1">Petrol</div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{fuelPrices[selectedState].petrol}/L
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-neutral-medium mb-1">Diesel</div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{fuelPrices[selectedState].diesel}/L
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-neutral-medium mb-1">CNG</div>
                      <div className="text-2xl font-bold text-primary">
                        ₹{fuelPrices[selectedState].cng}/Kg
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-neutral-medium">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Prices updated as of April 30, 2023. May vary slightly by city and fuel pump.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Latest Automotive News</CardTitle>
                </div>
                <CardDescription>
                  Stay updated with recent developments in the Indian automotive industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automotiveNews.map((news, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-bold">{news.title}</h3>
                          <span className="text-sm text-neutral-medium">{news.date}</span>
                        </div>
                        <p className="text-neutral-medium mb-3">{news.snippet}</p>
                        <a 
                          href={news.link} 
                          className="text-primary font-medium inline-flex items-center"
                        >
                          Read more <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rto">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>RTO Guidelines and Information</CardTitle>
                </div>
                <CardDescription>
                  Important information about registration, renewal, and transfer procedures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Select State</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.keys(rtoGuidelines).map((state) => (
                      <Button
                        key={state}
                        variant={selectedState === state ? "default" : "outline"}
                        onClick={() => setSelectedState(state)}
                        className="justify-start"
                      >
                        <MapPin className="h-4 w-4 mr-2" /> {state}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-neutral-lightest p-4 rounded-lg">
                  <div className="text-xl font-bold mb-4">
                    <span className="text-primary">{selectedState}</span> RTO Guidelines
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold mb-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
                        Registration Fees
                      </div>
                      <div className="text-neutral-medium">
                        {rtoGuidelines[selectedState].registration}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold mb-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
                        Renewal Process
                      </div>
                      <div className="text-neutral-medium">
                        {rtoGuidelines[selectedState].renewal}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="font-semibold mb-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
                        Transfer of Ownership
                      </div>
                      <div className="text-neutral-medium">
                        {rtoGuidelines[selectedState].transfer}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-neutral-medium">
                    <Info className="h-4 w-4 mr-2" />
                    <span>Please confirm the exact fees with your local RTO office as they may change periodically.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <CardTitle>Upcoming Automotive Events</CardTitle>
                </div>
                <CardDescription>
                  Car shows, exhibitions and automotive events across India
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automotiveEvents.map((event, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <div className="flex items-center text-primary font-medium">
                          <Calendar className="h-4 w-4 mr-2" />
                          {event.date}
                        </div>
                      </div>
                      <div className="flex items-center text-neutral-medium mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <p className="text-neutral-medium">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default LocalResources;