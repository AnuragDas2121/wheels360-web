import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Loader2, ChevronLeft, Calendar, TrafficCone, Fuel, Check, Bookmark, BookmarkCheck, Share2, MessageCircle, Edit, Car as CarIcon, Paintbrush, Settings } from "lucide-react";
import { Car, Dealer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ImageGallery from "@/components/cars/image-gallery";
import SimilarCars from "@/components/cars/similar-cars";
import PricePrediction from "@/components/cars/price-prediction";
import CarImageEditor from "@/components/cars/car-image-editor";
import LoanCalculator from "@/components/financial/loan-calculator";
import TcoCalculator from "@/components/financial/tco-calculator";
import TradeInCalculator from "@/components/financial/trade-in-calculator";

export default function CarDetailPage() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showImageEditorDialog, setShowImageEditorDialog] = useState(false);
  
  // Fetch car data
  const { data: car, isLoading: isCarLoading } = useQuery<Car>({
    queryKey: [`/api/cars/${id}`],
  });

  // Fetch dealer data
  const { data: dealer, isLoading: isDealerLoading } = useQuery<Dealer>({
    queryKey: [`/api/dealers/${car?.dealerId}`],
    enabled: !!car?.dealerId,
  });
  
  // Check if the car is saved by the current user
  const { data: savedCar, isLoading: isSavedCarLoading } = useQuery({
    queryKey: ['/api/saved-car', id],
    queryFn: async () => {
      if (!user || !id) return null;
      try {
        const res = await fetch(`/api/users/${user.id}/saved-cars/${id}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to check saved status');
        return await res.json();
      } catch (error) {
        return null;
      }
    },
    enabled: !!user && !!id,
  });
  
  // Save/unsave car mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (savedCar) {
        // Unsave the car if it's already saved
        await apiRequest('DELETE', `/api/users/${user.id}/saved-cars/${id}`);
        return { saved: false };
      } else {
        // Save the car if it's not saved
        await apiRequest('POST', `/api/users/${user.id}/saved-cars/${id}`);
        return { saved: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-car', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-cars'] });
      
      toast({
        title: data.saved ? 'Car Saved' : 'Car Removed',
        description: data.saved 
          ? 'This car has been added to your saved vehicles.' 
          : 'This car has been removed from your saved vehicles.',
        variant: 'default',
      });
    },
    onError: (error) => {
      if ((error as Error).message === 'User not authenticated') {
        toast({
          title: 'Login Required',
          description: 'Please login or register to save cars',
          variant: 'default',
        });
        navigate('/auth');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save car. Please try again.',
          variant: 'destructive',
        });
      }
    }
  });

  const isLoading = isCarLoading || isDealerLoading;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Car Not Found</h1>
          <p className="mb-6">The car you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="default" 
            onClick={() => navigate("/cars")} 
            className="bg-primary hover:bg-primary-light"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Cars
          </Button>
        </div>
      </div>
    );
  }

  // No longer need handleImageChange as we're using ImageGallery component

  const handleContact = () => {
    if (!user) {
      // Redirect to auth page if not logged in
      toast({
        title: "Login Required",
        description: "Please login or register to contact the dealer",
        variant: "default",
      });
      navigate("/auth");
      return;
    }
    
    setShowContactDialog(true);
  };

  // Check if current user can edit this car (dealer who owns the car or admin)
  const canEditCar = () => {
    if (!user) return false;
    
    // Admin can edit all cars
    if (user.role === "admin") return true;
    
    // Dealer can only edit their own cars
    if (user.role === "dealer" && dealer) {
      return dealer.userId === user.id;
    }
    
    return false;
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const content = formData.get("message") as string;
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/messages", {
        content: `About ${car.title}: ${content}`,
        receiverId: dealer?.userId,
      });

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the dealer",
        variant: "default",
      });
      
      setShowContactDialog(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{car.title} | Wheels360</title>
        <meta name="description" content={`${car.year} ${car.brand} ${car.model} - ${car.description.substring(0, 150)}...`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/cars")} 
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Listings
            </Button>
            
            {canEditCar() && (
              <Button 
                variant="outline" 
                onClick={() => setShowImageEditorDialog(true)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Images
              </Button>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-montserrat">{car.title}</h1>
              <p className="text-neutral-medium">{car.location}</p>
            </div>
            <div className="text-2xl font-bold text-secondary">
              {Number(car.price) >= 100000 
                ? `₹${(Number(car.price) / 100000).toFixed(2)} Lakh` 
                : `₹${Number(car.price).toLocaleString()}`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Images and Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <ImageGallery 
                images={car.images} 
                alt={`${car.brand} ${car.model}`} 
              />
            </div>

            <Tabs defaultValue="details">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="details">Vehicle Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold font-montserrat mb-4">Specifications</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="text-sm text-neutral-medium">Year</div>
                        <div className="font-medium">{car.year}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <TrafficCone className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="text-sm text-neutral-medium">Mileage</div>
                        <div className="font-medium">{Number(car.mileage).toLocaleString()} km</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Fuel className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="text-sm text-neutral-medium">Fuel Type</div>
                        <div className="font-medium capitalize">{car.fuel}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <CarIcon className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="text-sm text-neutral-medium">Body Type</div>
                        <div className="font-medium capitalize">{car.bodyType}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Paintbrush className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="text-sm text-neutral-medium">Color</div>
                        <div className="font-medium">{car.color}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Settings className="h-5 w-5 text-secondary" />
                      <div>
                        <div className="text-sm text-neutral-medium">Transmission</div>
                        <div className="font-medium capitalize">{car.transmission}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold font-montserrat mb-4">Vehicle Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {car.features && typeof car.features === 'object' ? (
                    Object.entries(car.features as Record<string, string[]>).map(([category, features], idx) => {
                      return (
                        <div key={idx} className="space-y-2">
                          <h4 className="font-semibold text-primary">{category}</h4>
                          <ul className="space-y-1">
                            {Array.isArray(features) && features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-secondary" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-neutral-medium">No features information available</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="description" className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold font-montserrat mb-4">Description</h3>
                <p className="text-neutral-medium whitespace-pre-line">{car.description}</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Dealer Info and Contact */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {dealer?.logo ? (
                    <img 
                      src={dealer.logo}
                      alt={dealer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                      {dealer?.name.charAt(0)}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold font-montserrat">{dealer?.name}</h3>
                    <div className="flex items-center gap-1 text-warning">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(Number(dealer?.averageRating || 0)) ? 'text-warning' : 'text-neutral-light'}`}>
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-neutral-medium ml-1">
                        {dealer?.averageRating ? Number(dealer.averageRating).toFixed(1) : '0.0'} ({dealer?.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-medium">Location:</span>
                    <span>{dealer?.city}, {dealer?.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-medium">Phone:</span>
                    <span>{dealer?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-medium">Email:</span>
                    <span className="truncate">{dealer?.email}</span>
                  </div>
                  {dealer?.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-medium">Website:</span>
                      <a 
                        href={dealer.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-accent hover:underline truncate"
                      >
                        {dealer.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-primary hover:bg-primary-light"
                    onClick={handleContact}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Contact Dealer
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant={savedCar ? "secondary" : "outline"} 
                      className="w-full" 
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : savedCar ? (
                        <BookmarkCheck className="mr-2 h-4 w-4" />
                      ) : (
                        <Bookmark className="mr-2 h-4 w-4" />
                      )}
                      {savedCar ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold font-montserrat mb-4">Price History</h3>
                
                {car.priceHistory && Array.isArray(car.priceHistory) && car.priceHistory.length > 0 ? (
                  <div className="space-y-2">
                    {car.priceHistory.map((history: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="text-sm text-neutral-medium">
                          {new Date(history.date).toLocaleDateString()}
                        </div>
                        <div className={`font-medium ${history.change < 0 ? 'text-error' : history.change > 0 ? 'text-success' : ''}`}>
                          {Number(history.price) >= 100000 
                            ? `₹${(Number(history.price) / 100000).toFixed(2)} Lakh` 
                            : `₹${Number(history.price).toLocaleString()}`}
                          {history.change !== 0 && (
                            <span className="ml-1 text-xs">
                              ({history.change > 0 ? '+' : ''}{history.change}%)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-medium">No price history available</p>
                )}
              </CardContent>
            </Card>

            {/* Financial Tools */}
            <Tabs defaultValue="loan" className="mt-6">
              <TabsList className="w-full grid grid-cols-3 mb-4">
                <TabsTrigger value="loan">Loan Calculator</TabsTrigger>
                <TabsTrigger value="tco">Cost of Ownership</TabsTrigger>
                <TabsTrigger value="tradein">Trade-In Value</TabsTrigger>
              </TabsList>
              
              <TabsContent value="loan" className="pt-0">
                <LoanCalculator car={car} />
              </TabsContent>
              
              <TabsContent value="tco" className="pt-0">
                <TcoCalculator car={car} />
              </TabsContent>
              
              <TabsContent value="tradein" className="pt-0">
                <TradeInCalculator />
              </TabsContent>
            </Tabs>
            
            {/* Similar Vehicles based on AI Recommendations */}
            <SimilarCars carId={car.id} className="mt-6" />
            
            {/* AI Price Prediction */}
            <PricePrediction car={car} />
          </div>
        </div>
      </div>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {dealer?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">About: {car.title}</h4>
              <p className="text-sm text-neutral-medium mb-4">Your message will be sent directly to the dealer.</p>
              
              <textarea 
                name="message"
                rows={5}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="I'm interested in this vehicle and would like more information..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowContactDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary-light">
                Send Message
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Car Image Editor Dialog */}
      <Dialog open={showImageEditorDialog} onOpenChange={setShowImageEditorDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Car Images</DialogTitle>
          </DialogHeader>
          <CarImageEditor 
            car={car} 
            onComplete={() => setShowImageEditorDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
