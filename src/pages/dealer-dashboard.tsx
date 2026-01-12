import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Car, Dealer, Message, Review, InsertCar } from "@shared/schema";
import { Loader2, Plus, CarFront, MessageSquare, Star, Edit, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CarCard from "@/components/cars/car-card";
import ImageUpload from "@/components/cars/image-upload";
import ImageGallery from "@/components/cars/image-gallery";

export default function DealerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const [isEditCarDialogOpen, setIsEditCarDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Fetch dealer profile
  const { data: dealer, isLoading: dealerLoading } = useQuery<Dealer>({
    queryKey: ["/api/dealers/profile"],
    queryFn: async () => {
      const res = await fetch(`/api/dealers/byUserId/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch dealer profile");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch dealer's car listings
  const { data: cars, isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ["/api/dealers/cars"],
    queryFn: async () => {
      if (!dealer) return [];
      const res = await fetch(`/api/dealers/${dealer.id}/cars`);
      if (!res.ok) throw new Error("Failed to fetch car listings");
      return res.json();
    },
    enabled: !!dealer?.id,
  });

  // Fetch dealer's messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Fetch dealer's reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/dealers/${dealer?.id}/reviews`],
    enabled: !!dealer?.id,
  });

  // Car form schema
  const carFormSchema = z.object({
    title: z.string().min(5, { message: "Title must be at least 5 characters" }),
    brand: z.string().min(1, { message: "Brand is required" }),
    model: z.string().min(1, { message: "Model is required" }),
    year: z.coerce.number().min(1900, { message: "Year must be at least 1900" }).max(new Date().getFullYear() + 1),
    price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
    mileage: z.coerce.number().min(0, { message: "Mileage must be greater than or equal to 0" }),
    fuel: z.string().min(1, { message: "Fuel type is required" }),
    transmission: z.string().min(1, { message: "Transmission is required" }),
    bodyType: z.string().min(1, { message: "Body type is required" }),
    color: z.string().min(1, { message: "Color is required" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
    location: z.string().min(1, { message: "Location is required" }),
    images: z.string().array().min(1, { message: "At least one image URL is required" }),
    features: z.record(z.string().array()),
    isFeatured: z.boolean().default(false),
  });

  // Add car form
  const carForm = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      title: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      fuel: "gasoline",
      transmission: "automatic",
      bodyType: "sedan",
      color: "",
      description: "",
      location: dealer?.city ? `${dealer.city}, ${dealer.state}` : "",
      images: ["https://placehold.co/600x400?text=Car+Image"],
      features: {
        "Safety": ["ABS", "Airbags"],
        "Comfort": ["Air Conditioning", "Power Windows"],
        "Technology": ["Bluetooth", "Navigation System"]
      },
      isFeatured: false,
    },
  });
  
  // Edit car form
  const editCarForm = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      title: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      fuel: "gasoline",
      transmission: "automatic",
      bodyType: "sedan",
      color: "",
      description: "",
      location: "",
      images: [""],
      features: {
        "Safety": ["ABS", "Airbags"],
        "Comfort": ["Air Conditioning", "Power Windows"],
        "Technology": ["Bluetooth", "Navigation System"]
      },
      isFeatured: false,
    },
  });
  
  // Update the edit form when a car is selected
  useEffect(() => {
    if (selectedCar) {
      editCarForm.reset({
        title: selectedCar.title,
        brand: selectedCar.brand,
        model: selectedCar.model,
        year: selectedCar.year,
        price: Number(selectedCar.price),
        mileage: Number(selectedCar.mileage),
        fuel: selectedCar.fuel,
        transmission: selectedCar.transmission,
        bodyType: selectedCar.bodyType,
        color: selectedCar.color,
        description: selectedCar.description,
        location: selectedCar.location,
        images: selectedCar.images,
        features: selectedCar.features as Record<string, string[]>,
        isFeatured: selectedCar.isFeatured,
      });
      setIsEditCarDialogOpen(true);
    }
  }, [selectedCar, editCarForm]);

  // Reset form when dealer data loads
  useEffect(() => {
    if (dealer) {
      carForm.setValue("location", `${dealer.city}, ${dealer.state}`);
    }
  }, [dealer, carForm]);

  // Add car mutation
  const addCarMutation = useMutation({
    mutationFn: async (data: z.infer<typeof carFormSchema>) => {
      if (!dealer) throw new Error("Dealer profile not found");
      
      const carData: InsertCar = {
        ...data,
        price: String(data.price),
        mileage: String(data.mileage),
        dealerId: dealer.id,
        isActive: true,
        priceHistory: []
      };
      
      return apiRequest("POST", "/api/cars", carData);
    },
    onSuccess: () => {
      toast({
        title: "Car Added",
        description: "Your car listing has been added successfully.",
      });
      setIsAddCarDialogOpen(false);
      carForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dealers/cars"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add car listing.",
        variant: "destructive",
      });
    },
  });

  // Delete car mutation
  const deleteCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      return apiRequest("DELETE", `/api/cars/${carId}`);
    },
    onSuccess: () => {
      toast({
        title: "Car Deleted",
        description: "Your car listing has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dealers/cars"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car listing.",
        variant: "destructive",
      });
    },
  });
  
  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: async (data: z.infer<typeof carFormSchema> & { id: number }) => {
      if (!dealer) throw new Error("Dealer profile not found");
      
      const { id, ...rest } = data;
      const carData = {
        ...rest,
        price: String(rest.price),
        mileage: String(rest.mileage),
      };
      
      return apiRequest("PATCH", `/api/cars/${id}`, carData);
    },
    onSuccess: () => {
      toast({
        title: "Car Updated",
        description: "Your car listing has been updated successfully.",
      });
      setIsEditCarDialogOpen(false);
      setSelectedCar(null);
      queryClient.invalidateQueries({ queryKey: ["/api/dealers/cars"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car listing.",
        variant: "destructive",
      });
    },
  });

  const handleAddCar = (data: z.infer<typeof carFormSchema>) => {
    addCarMutation.mutate(data);
  };
  
  const handleUpdateCar = (data: z.infer<typeof carFormSchema>) => {
    if (!selectedCar) return;
    updateCarMutation.mutate({ ...data, id: selectedCar.id });
  };

  const handleDeleteCar = (carId: number) => {
    if (confirm("Are you sure you want to delete this car listing?")) {
      deleteCarMutation.mutate(carId);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dealer Dashboard | Wheels360</title>
        <meta name="description" content="Manage your car listings, messages, and reviews as a dealer." />
      </Helmet>

      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-4">
            Dealer Dashboard
          </h1>
          <p className="text-white opacity-90">
            Manage your car listings, messages, and dealer profile.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Dealer profile sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                {dealerLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : dealer ? (
                  <>
                    <div className="flex flex-col items-center text-center mb-6">
                      {dealer.logo ? (
                        <img 
                          src={dealer.logo}
                          alt={dealer.name}
                          className="w-24 h-24 rounded-full object-cover mb-4"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                          {dealer.name.charAt(0)}
                        </div>
                      )}
                      <h2 className="text-xl font-bold font-montserrat">{dealer.name}</h2>
                      <div className="flex items-center gap-1 text-warning">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`${
                              i < Math.floor(Number(dealer.averageRating))
                                ? "text-warning"
                                : "text-neutral-light"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-neutral-medium ml-1">
                          ({dealer.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-medium">Location:</span>
                        <span className="font-medium">
                          {dealer.city}, {dealer.state}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-medium">Listings:</span>
                        <span className="font-medium">{cars?.length || 0} vehicles</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-medium">Member since:</span>
                        <span className="font-medium">
                          {dealer.createdAt
                            ? new Date(dealer.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <Button variant="outline" className="w-full">
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-neutral-medium">Dealer profile not found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="listings">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
                <TabsTrigger value="listings">My Listings</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="showroom">Virtual Showroom</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="listings">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold font-montserrat">My Car Listings</h2>
                  <Button onClick={() => setIsAddCarDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add New Listing
                  </Button>
                </div>

                {carsLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : cars && cars.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cars.map((car) => (
                      <div key={car.id} className="relative">
                        <div className="absolute top-2 right-2 z-10 flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white shadow-md"
                            onClick={() => setSelectedCar(car)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-white shadow-md"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            <Trash className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                        <CarCard car={car} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white rounded-lg shadow-md">
                    <CarFront className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Car Listings</h3>
                    <p className="text-neutral-medium mb-6">
                      You haven't added any car listings yet.
                    </p>
                    <Button onClick={() => setIsAddCarDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Listing
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages from Potential Buyers</CardTitle>
                    <CardDescription>
                      Communicate with interested buyers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {messagesLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className="p-4 border rounded-lg hover:bg-neutral-lightest transition"
                          >
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">
                                {message.senderId === user?.id ? "You" : "User"}
                              </div>
                              <div className="text-sm text-neutral-medium">
                                {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Unknown date'}
                              </div>
                            </div>
                            <p className="text-neutral-medium">{message.content}</p>
                            {message.senderId !== user?.id && (
                              <div className="mt-3 flex justify-end">
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="mr-2 h-4 w-4" /> Reply
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Messages</h3>
                        <p className="text-neutral-medium">
                          You haven't received any messages from potential buyers yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      Feedback from your customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviewsLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-4 border rounded-lg hover:bg-neutral-lightest transition"
                          >
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">User</div>
                              <div className="flex text-warning">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`${
                                      i < review.rating
                                        ? "text-warning"
                                        : "text-neutral-light"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-neutral-medium">{review.comment}</p>
                            <div className="text-sm text-neutral-medium mt-2">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Star className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Reviews</h3>
                        <p className="text-neutral-medium">
                          You haven't received any customer reviews yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="showroom">
                <Card>
                  <CardHeader>
                    <CardTitle>Virtual Showroom</CardTitle>
                    <CardDescription>
                      Showcase your dealership with 360° views and interactive experiences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1 md:col-span-2 border rounded-lg overflow-hidden">
                        <div className="aspect-video bg-neutral-lightest flex flex-col items-center justify-center p-8 text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-medium mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-semibold mb-2">360° Showroom Tour</h3>
                          <p className="text-neutral-medium mb-4">
                            Upload a 360° panoramic view of your showroom to allow customers to virtually experience your dealership.
                          </p>
                          <Button>Upload 360° Tour</Button>
                        </div>
                      </div>

                      <div className="p-6 border rounded-lg bg-white">
                        <div className="flex items-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <h3 className="font-semibold">Welcome Video</h3>
                        </div>
                        <div className="aspect-video bg-neutral-lightest rounded-md flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">Replace</Button>
                          <Button variant="outline" size="sm">Preview</Button>
                        </div>
                      </div>

                      <div className="p-6 border rounded-lg bg-white">
                        <div className="flex items-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="font-semibold">Verification Badge</h3>
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md mb-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Address Verified</div>
                                <div className="text-xs text-neutral-medium">05 Jan 2023</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md mb-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Business Documents</div>
                                <div className="text-xs text-neutral-medium">12 Feb 2023</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">Service History</div>
                                <div className="text-xs text-neutral-medium">Pending verification</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            Gold Verified Dealer
                          </div>
                          <p className="text-xs text-neutral-medium mb-3">2 of 3 verifications complete</p>
                          <Button size="sm" variant="outline">Complete Verification</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Dealer Performance Analytics</CardTitle>
                    <CardDescription>
                      Track your dealership's performance and customer engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-neutral-medium">Listing Views</p>
                            <h3 className="text-2xl font-bold">2,452</h3>
                          </div>
                          <div className="bg-primary/10 p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            12.5%
                          </span>
                          <span className="text-neutral-medium ml-2">vs. last month</span>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-neutral-medium">Inquiries</p>
                            <h3 className="text-2xl font-bold">87</h3>
                          </div>
                          <div className="bg-primary/10 p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            8.3%
                          </span>
                          <span className="text-neutral-medium ml-2">vs. last month</span>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/5 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm text-neutral-medium">Response Rate</p>
                            <h3 className="text-2xl font-bold">92%</h3>
                          </div>
                          <div className="bg-primary/10 p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-600 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            3.1%
                          </span>
                          <span className="text-neutral-medium ml-2">vs. last month</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Popular Listings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-neutral-lightest rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-bold text-primary">1</span>
                          </div>
                          <div className="mr-auto">
                            <div className="font-medium">2022 Tata Nexon EV Prime</div>
                            <div className="text-sm text-neutral-medium">345 views • 28 inquiries</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">₹14.99L</div>
                            <div className="text-xs text-green-600">↑ 15% Interest</div>
                          </div>
                        </div>

                        <div className="flex items-center p-3 bg-neutral-lightest rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-bold text-primary">2</span>
                          </div>
                          <div className="mr-auto">
                            <div className="font-medium">2021 Hyundai Creta SX</div>
                            <div className="text-sm text-neutral-medium">279 views • 19 inquiries</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">₹12.5L</div>
                            <div className="text-xs text-green-600">↑ 8% Interest</div>
                          </div>
                        </div>

                        <div className="flex items-center p-3 bg-neutral-lightest rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-bold text-primary">3</span>
                          </div>
                          <div className="mr-auto">
                            <div className="font-medium">2022 Mahindra XUV700 AX7</div>
                            <div className="text-sm text-neutral-medium">215 views • 15 inquiries</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">₹19.8L</div>
                            <div className="text-xs text-green-600">↑ 5% Interest</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Customer Engagement by Location</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 border rounded-lg text-center">
                          <div className="font-medium">Mumbai</div>
                          <div className="text-xl font-bold text-primary">38%</div>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <div className="font-medium">Delhi</div>
                          <div className="text-xl font-bold text-primary">24%</div>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <div className="font-medium">Bangalore</div>
                          <div className="text-xl font-bold text-primary">18%</div>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <div className="font-medium">Other</div>
                          <div className="text-xl font-bold text-primary">20%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add Car Dialog */}
      <Dialog open={isAddCarDialogOpen} onOpenChange={setIsAddCarDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Car Listing</DialogTitle>
            <DialogDescription>Fill out the form to create a new car listing.</DialogDescription>
          </DialogHeader>
          <Form {...carForm}>
            <form onSubmit={carForm.handleSubmit(handleAddCar)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={carForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="2023 Mercedes-Benz AMG GT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                          <SelectItem value="BMW">BMW</SelectItem>
                          <SelectItem value="Audi">Audi</SelectItem>
                          <SelectItem value="Tesla">Tesla</SelectItem>
                          <SelectItem value="Porsche">Porsche</SelectItem>
                          <SelectItem value="Lexus">Lexus</SelectItem>
                          <SelectItem value="Toyota">Toyota</SelectItem>
                          <SelectItem value="Honda">Honda</SelectItem>
                          <SelectItem value="Ford">Ford</SelectItem>
                          <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="AMG GT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="fuel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gasoline">Gasoline</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={carForm.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Listing</FormLabel>
                        <FormDescription>
                          This listing will be displayed on the homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={carForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Images</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        images={field.value} 
                        onChange={field.onChange}
                        maxImages={8}
                      />
                    </FormControl>
                    <FormDescription>
                      Add up to 8 images of your vehicle to attract more buyers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={carForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the vehicle..."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCarDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-light"
                  disabled={addCarMutation.isPending}
                >
                  {addCarMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Car Listing"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Car Dialog */}
      <Dialog open={isEditCarDialogOpen} onOpenChange={(open) => {
        setIsEditCarDialogOpen(open);
        if (!open) setSelectedCar(null);
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Car Listing</DialogTitle>
            <DialogDescription>Update the details of your car listing.</DialogDescription>
          </DialogHeader>
          <Form {...editCarForm}>
            <form onSubmit={editCarForm.handleSubmit(handleUpdateCar)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editCarForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="2023 Mercedes-Benz AMG GT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                          <SelectItem value="BMW">BMW</SelectItem>
                          <SelectItem value="Audi">Audi</SelectItem>
                          <SelectItem value="Tesla">Tesla</SelectItem>
                          <SelectItem value="Porsche">Porsche</SelectItem>
                          <SelectItem value="Lexus">Lexus</SelectItem>
                          <SelectItem value="Toyota">Toyota</SelectItem>
                          <SelectItem value="Honda">Honda</SelectItem>
                          <SelectItem value="Ford">Ford</SelectItem>
                          <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="AMG GT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="fuel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gasoline">Gasoline</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCarForm.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Listing</FormLabel>
                        <FormDescription>
                          This listing will be displayed on the homepage.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editCarForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Images</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        images={field.value} 
                        onChange={field.onChange}
                        maxImages={8}
                      />
                    </FormControl>
                    <FormDescription>
                      Add up to 8 images of your vehicle to attract more buyers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editCarForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the vehicle..."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditCarDialogOpen(false);
                    setSelectedCar(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-light"
                  disabled={updateCarMutation.isPending}
                >
                  {updateCarMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Car Listing"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
