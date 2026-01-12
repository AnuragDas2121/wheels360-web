import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Message, Comparison, Review, Car as CarType } from "@shared/schema";
import { Loader2, MessageSquare, Car, Star, ArrowRight } from "lucide-react";
import CarCard from "@/components/cars/car-card";

// Comparison card component
interface ComparisonCardProps {
  comparison: Comparison;
}

function ComparisonCard({ comparison }: ComparisonCardProps) {
  // Fetch cars in this comparison
  const { data: comparisonCars, isLoading } = useQuery<CarType[]>({
    queryKey: ['/api/cars/comparison', comparison.id],
    queryFn: async () => {
      if (!comparison.carIds.length) return [];
      
      const promises = comparison.carIds.map(id => 
        fetch(`/api/cars/${id}`).then(res => res.json())
      );
      
      return Promise.all(promises);
    },
  });

  return (
    <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
      <div className="flex justify-between mb-4">
        <div className="font-medium">
          Comparison #{comparison.id}
        </div>
        <div className="text-sm text-neutral-medium">
          {comparison.createdAt ? new Date(comparison.createdAt).toLocaleDateString() : 'Unknown date'}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : comparisonCars && comparisonCars.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            {comparisonCars.map(car => (
              <div key={car.id} className="text-sm border rounded p-2">
                <div className="font-medium truncate">{car.title}</div>
                <div className="text-primary font-medium">₹{Number(car.price).toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          <Link href={`/compare?ids=${comparison.carIds.join(',')}`}>
            <Button variant="outline" size="sm" className="w-full">
              View Comparison <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </>
      ) : (
        <p className="text-neutral-medium">
          {comparison.carIds.length} vehicles in this comparison
        </p>
      )}
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();

  // Fetch user's messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch user's comparisons
  const { data: comparisons, isLoading: comparisonsLoading } = useQuery<Comparison[]>({
    queryKey: ["/api/comparisons"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/comparisons`);
      if (!res.ok) throw new Error('Failed to fetch comparisons');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch saved cars
  const { data: savedCars, isLoading: savedCarsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/saved-cars"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/saved-cars`);
      if (!res.ok) throw new Error('Failed to fetch saved cars');
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Fetch user's reviews
  const { data: dealerReviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/user/reviews"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    },
    enabled: !!user?.id,
  });

  return (
    <>
      <Helmet>
        <title>My Dashboard | Wheels360</title>
        <meta name="description" content="Manage your car searches, saved vehicles, and messages with dealers." />
      </Helmet>

      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-4">
            My Dashboard
          </h1>
          <p className="text-white opacity-90">
            Manage your car searches, saved vehicles, and messages with dealers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User profile sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold font-montserrat">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-neutral-medium">{user?.email}</p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-medium">Status:</span>
                    <span className="font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-medium">Member since:</span>
                    <span className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-medium">Role:</span>
                    <span className="font-medium capitalize">{user?.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="saved">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
                <TabsTrigger value="saved">Saved Cars</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
                <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                <TabsTrigger value="searches">Saved Searches</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Vehicles</CardTitle>
                    <CardDescription>
                      View and manage your saved vehicles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedCarsLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : savedCars && savedCars.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedCars.map((car) => (
                          <div key={car.id} className="relative">
                            <CarCard car={car} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Car className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Saved Vehicles</h3>
                        <p className="text-neutral-medium">
                          You haven't saved any vehicles yet. Browse our listings and click the save
                          button to add them here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      Your conversations with dealers
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
                                {message.senderId === user?.id ? "You" : "Dealer"}
                              </div>
                              <div className="text-sm text-neutral-medium">
                                {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Unknown date'}
                              </div>
                            </div>
                            <p className="text-neutral-medium">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <MessageSquare className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Messages</h3>
                        <p className="text-neutral-medium">
                          You haven't exchanged any messages with dealers yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comparisons">
                <Card>
                  <CardHeader>
                    <CardTitle>My Comparisons</CardTitle>
                    <CardDescription>
                      View your vehicle comparisons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {comparisonsLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : comparisons && comparisons.length > 0 ? (
                      <div className="space-y-4">
                        {comparisons.map((comparison) => (
                          <ComparisonCard key={comparison.id} comparison={comparison} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Car className="h-12 w-12 mx-auto text-neutral-light mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Comparisons</h3>
                        <p className="text-neutral-medium">
                          You haven't created any vehicle comparisons yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>My Reviews</CardTitle>
                    <CardDescription>
                      Reviews you've left for dealers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviewsLoading ? (
                      <div className="h-40 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : dealerReviews && dealerReviews.length > 0 ? (
                      <div className="space-y-4">
                        {dealerReviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-4 border rounded-lg hover:bg-neutral-lightest transition"
                          >
                            <div className="flex justify-between mb-2">
                              <div className="font-medium">Dealer Name</div>
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
                          You haven't left any reviews for dealers yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="searches">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Searches</CardTitle>
                    <CardDescription>
                      Your saved search criteria for easier car hunting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">SUVs in Mumbai</div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-neutral-medium">
                          <div>
                            <span className="font-medium">Body Type:</span> SUV
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> Mumbai
                          </div>
                          <div>
                            <span className="font-medium">Price Range:</span> ₹5L - ₹10L
                          </div>
                          <div>
                            <span className="font-medium">Brand:</span> Any
                          </div>
                          <div>
                            <span className="font-medium">Fuel Type:</span> Any
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-primary font-medium">5 new matches</div>
                          <Link to="/cars?bodyType=suv&location=Mumbai&minPrice=500000&maxPrice=1000000">
                            <Button size="sm">
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">Tata Electric Vehicles</div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-neutral-medium">
                          <div>
                            <span className="font-medium">Brand:</span> Tata Motors
                          </div>
                          <div>
                            <span className="font-medium">Fuel Type:</span> Electric
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> Any
                          </div>
                          <div>
                            <span className="font-medium">Price Range:</span> ₹10L - ₹15L
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> 2021+
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-primary font-medium">2 new matches</div>
                          <Link to="/cars?brand=Tata%20Motors&fuel=electric&minPrice=1000000&maxPrice=1500000&minYear=2021">
                            <Button size="sm">
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">Budget Hatchbacks</div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-neutral-medium">
                          <div>
                            <span className="font-medium">Body Type:</span> Hatchback
                          </div>
                          <div>
                            <span className="font-medium">Price Range:</span> ₹3L - ₹6L
                          </div>
                          <div>
                            <span className="font-medium">Brand:</span> Maruti Suzuki, Hyundai
                          </div>
                          <div>
                            <span className="font-medium">Fuel Type:</span> Petrol
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> Delhi
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-sm text-neutral-medium">No new matches</div>
                          <Link to="/cars?bodyType=hatchback&minPrice=300000&maxPrice=600000&brand=Maruti%20Suzuki,Hyundai&fuel=petrol&location=Delhi">
                            <Button size="sm">
                              View Results
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Repository</CardTitle>
                    <CardDescription>
                      Safely store and manage your vehicle-related documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">RC Book</h3>
                              <p className="text-sm text-neutral-medium">Registration Certificate</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-medium">Uploaded on: 15 Apr 2023</span>
                            <span className="text-primary font-medium">Valid until: 14 Apr 2028</span>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">Insurance Policy</h3>
                              <p className="text-sm text-neutral-medium">Comprehensive Coverage</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-medium">Uploaded on: 10 Mar 2023</span>
                            <span className="text-error font-medium">Expiring: 09 Mar 2024</span>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">PUC Certificate</h3>
                              <p className="text-sm text-neutral-medium">Pollution Under Control</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-medium">Uploaded on: 05 Jun 2023</span>
                            <span className="text-warning font-medium">Expiring: 04 Dec 2023</span>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-neutral-lightest transition">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">FASTag Details</h3>
                              <p className="text-sm text-neutral-medium">Electronic Toll Collection</p>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-medium">Uploaded on: 20 May 2023</span>
                            <span className="text-primary font-medium">No expiry</span>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Replace</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button className="w-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Upload New Document
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
