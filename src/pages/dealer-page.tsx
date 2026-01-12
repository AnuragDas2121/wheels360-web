import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Loader2, ChevronLeft, Star, MessageCircle, Globe } from "lucide-react";
import { Dealer, Car, Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CarCard from "@/components/cars/car-card";
import ReviewList from "@/components/reviews/review-list";

export default function DealerPage() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(5);
  
  // Fetch dealer data
  const { data: dealer, isLoading: isDealerLoading } = useQuery<Dealer>({
    queryKey: [`/api/dealers/${id}`],
  });

  // Fetch dealer cars
  const { data: cars, isLoading: isCarsLoading } = useQuery<Car[]>({
    queryKey: [`/api/dealers/${id}/cars`],
    enabled: !!dealer,
  });

  const isLoading = isDealerLoading || isCarsLoading;

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      return apiRequest("POST", `/api/dealers/${id}/reviews`, reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
      setShowReviewDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/dealers/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dealers/${id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Dealer Not Found</h1>
          <p className="mb-6">The dealer you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="default" 
            onClick={() => navigate("/")} 
            className="bg-primary hover:bg-primary-light"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

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
        content,
        receiverId: dealer.userId,
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

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const comment = formData.get("comment") as string;
    
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a review comment",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      rating,
      comment,
    });
  };

  const handleOpenReviewDialog = () => {
    if (!user) {
      // Redirect to auth page if not logged in
      toast({
        title: "Login Required",
        description: "Please login or register to leave a review",
        variant: "default",
      });
      navigate("/auth");
      return;
    }
    
    setShowReviewDialog(true);
  };

  return (
    <>
      <Helmet>
        <title>{dealer.name} | Wheels360</title>
        <meta name="description" content={dealer.description} />
      </Helmet>

      <div className="bg-white">
        <div className="relative h-56 md:h-80 overflow-hidden">
          {dealer.coverImage ? (
            <img 
              src={dealer.coverImage}
              alt={dealer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary opacity-80"></div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-20 md:-mt-16 mb-6 relative z-10">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white bg-white shadow-md">
                {dealer.logo ? (
                  <img 
                    src={dealer.logo}
                    alt={dealer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                    {dealer.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold font-montserrat text-white md:text-primary">{dealer.name}</h1>
                <div className="flex items-center gap-1 text-warning">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(Number(dealer.averageRating || 0)) ? 'text-warning' : 'text-neutral-light'}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-white md:text-neutral-medium ml-1">
                    {dealer.averageRating ? Number(dealer.averageRating).toFixed(1) : '0.0'} ({dealer.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="text-white md:text-neutral-medium mt-1">
                  {dealer.city}, {dealer.state}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary-light" onClick={handleContact}>
                <MessageCircle className="mr-2 h-4 w-4" /> Contact
              </Button>
              <Button variant="outline" onClick={handleOpenReviewDialog}>
                <Star className="mr-2 h-4 w-4" /> Write a Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="inventory">
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-montserrat mb-4">Available Vehicles</h2>
              
              {cars && cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map(car => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No Vehicles Available</h3>
                  <p className="text-neutral-medium">
                    This dealer currently has no vehicles listed.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="about">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold font-montserrat mb-4">About {dealer.name}</h2>
                    <p className="text-neutral-medium whitespace-pre-line mb-6">{dealer.description}</p>
                    
                    {dealer.website && (
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5 text-secondary" />
                        <a 
                          href={dealer.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-accent hover:underline"
                        >
                          {dealer.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-montserrat mb-4">Contact Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-neutral-medium">Address</div>
                        <div className="font-medium">
                          {dealer.address}<br />
                          {dealer.city}, {dealer.state} {dealer.zip}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-neutral-medium">Phone</div>
                        <div className="font-medium">{dealer.phone}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-neutral-medium">Email</div>
                        <div className="font-medium">{dealer.email}</div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="h-48 bg-neutral-lightest rounded-md"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="mb-6">
              <ReviewList dealerId={Number(id)} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {dealer.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <p className="text-sm text-neutral-medium mb-4">Your message will be sent directly to the dealer.</p>
              
              <textarea 
                name="message"
                rows={5}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="I'm interested in your inventory and would like more information..."
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

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {dealer.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      <span className={star <= rating ? "text-warning" : "text-neutral-light"}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-neutral-medium">
                    {rating} {rating === 1 ? "star" : "stars"}
                  </span>
                </div>
              </div>
              
              <label className="block text-sm font-medium mb-1">Review</label>
              <textarea 
                name="comment"
                rows={5}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Share your experience with this dealer..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-light"
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
