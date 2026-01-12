import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Dealer } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, Star, MapPin, Phone, Mail, User, Users } from "lucide-react";

export default function DealersPage() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all dealers
  const { data: dealers, isLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  // Filter dealers based on search query
  const filteredDealers = dealers?.filter(dealer => 
    dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Find Dealers | Wheels360</title>
        <meta name="description" content="Find and connect with trusted car dealers in your area." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4">Find Dealers</h1>
          <p className="text-neutral mb-6">Connect with trusted car dealers in your area</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-light h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by dealer name or location..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {filteredDealers?.length === 0 ? (
          <div className="bg-neutral-50 rounded-lg p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-neutral-light mb-4" />
            <h3 className="text-xl font-medium text-neutral-dark mb-2">No dealers found</h3>
            <p className="text-neutral">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDealers?.map((dealer) => (
              <Card key={dealer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {dealer.coverImage && (
                  <div className="h-32 w-full overflow-hidden">
                    <img
                      src={dealer.coverImage}
                      alt={dealer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="relative">
                  {dealer.logo && (
                    <div className="absolute -top-8 left-4 h-16 w-16 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={dealer.logo}
                        alt={`${dealer.name} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className={dealer.logo ? "ml-20" : ""}>
                    <CardTitle>{dealer.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-neutral-light" />
                      {dealer.city}, {dealer.state}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <span className="font-medium">
                      {dealer.averageRating ? Number(dealer.averageRating).toFixed(1) : "New"}
                    </span>
                    <span className="text-neutral-light text-sm ml-2">
                      ({dealer.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <p className="text-neutral line-clamp-2">{dealer.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => window.open(`tel:${dealer.phone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => window.open(`mailto:${dealer.email}`, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="flex items-center bg-primary hover:bg-primary-light"
                    onClick={() => navigate(`/dealers/${dealer.id}`)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}