import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Dealer, Car } from "@shared/schema";
import { Loader2, Search, Check, X, Edit, Trash, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch all dealers
  const { data: dealers, isLoading: dealersLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  // Fetch all cars
  const { data: cars, isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  // Toggle car active status mutation
  const toggleCarStatusMutation = useMutation({
    mutationFn: async ({ carId, isActive }: { carId: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/cars/${carId}`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Car status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car status.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
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
        title: "Success",
        description: "Car listing deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete car listing.",
        variant: "destructive",
      });
    },
  });

  // Toggle car featured status mutation
  const toggleCarFeaturedMutation = useMutation({
    mutationFn: async ({ carId, isFeatured }: { carId: number; isFeatured: boolean }) => {
      return apiRequest("PUT", `/api/cars/${carId}`, { isFeatured });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Car featured status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car featured status.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCarStatus = (car: Car) => {
    toggleCarStatusMutation.mutate({
      carId: car.id,
      isActive: !car.isActive,
    });
  };

  const handleToggleCarFeatured = (car: Car) => {
    toggleCarFeaturedMutation.mutate({
      carId: car.id,
      isFeatured: !car.isFeatured,
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleDeleteCar = (carId: number) => {
    if (confirm("Are you sure you want to delete this car listing? This action cannot be undone.")) {
      deleteCarMutation.mutate(carId);
    }
  };

  // Filter users by search query
  const filteredUsers = users?.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter cars by search query
  const filteredCars = cars?.filter(
    (car) =>
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter dealers by search query
  const filteredDealers = dealers?.filter(
    (dealer) =>
      dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Wheels360</title>
        <meta name="description" content="Admin dashboard for managing users, cars, and dealers." />
      </Helmet>

      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-4">
            Admin Dashboard
          </h1>
          <p className="text-white opacity-90">
            Manage users, car listings, and dealer profiles.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Search className="h-5 w-5 text-neutral-medium mr-2" />
              <Input
                placeholder="Search users, cars, or dealers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cars">Car Listings</TabsTrigger>
            <TabsTrigger value="dealers">Dealers</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.firstName} {user.lastName}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.role === "admin"
                                      ? "bg-primary/10 text-primary"
                                      : user.role === "dealer"
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-accent/10 text-accent"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={user.role === "admin"}
                                  >
                                    <Trash className="h-4 w-4 text-error" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              {searchQuery
                                ? "No users found matching your search."
                                : "No users available."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle>Car Listings Management</CardTitle>
                <CardDescription>
                  View and manage all car listings in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {carsLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Dealer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCars && filteredCars.length > 0 ? (
                          filteredCars.map((car) => (
                            <TableRow key={car.id}>
                              <TableCell>{car.id}</TableCell>
                              <TableCell className="font-medium">{car.title}</TableCell>
                              <TableCell>{car.brand}</TableCell>
                              <TableCell>₹{Number(car.price).toLocaleString()}</TableCell>
                              <TableCell>{car.dealerId}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleCarStatus(car)}
                                  className={`px-2 py-1 h-auto ${
                                    car.isActive
                                      ? "bg-success/10 text-success hover:bg-success/20"
                                      : "bg-error/10 text-error hover:bg-error/20"
                                  }`}
                                >
                                  {car.isActive ? (
                                    <>
                                      <Check className="h-3 w-3 mr-1" /> Active
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-3 w-3 mr-1" /> Inactive
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleCarFeatured(car)}
                                  className={`px-2 py-1 h-auto ${
                                    car.isFeatured
                                      ? "bg-warning/10 text-warning hover:bg-warning/20"
                                      : "bg-neutral-light/10 text-neutral-medium hover:bg-neutral-light/20"
                                  }`}
                                >
                                  {car.isFeatured ? "Featured" : "Regular"}
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteCar(car.id)}
                                  >
                                    <Trash className="h-4 w-4 text-error" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-4">
                              {searchQuery
                                ? "No car listings found matching your search."
                                : "No car listings available."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dealers">
            <Card>
              <CardHeader>
                <CardTitle>Dealer Management</CardTitle>
                <CardDescription>
                  View and manage all dealers in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dealersLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDealers && filteredDealers.length > 0 ? (
                          filteredDealers.map((dealer) => (
                            <TableRow key={dealer.id}>
                              <TableCell>{dealer.id}</TableCell>
                              <TableCell className="font-medium">{dealer.name}</TableCell>
                              <TableCell>
                                {dealer.city}, {dealer.state}
                              </TableCell>
                              <TableCell>{dealer.email}</TableCell>
                              <TableCell>{dealer.phone}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="text-warning mr-1">★</span>
                                  <span>
                                    {dealer.averageRating.toFixed(1)} ({dealer.reviewCount})
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              {searchQuery
                                ? "No dealers found matching your search."
                                : "No dealers available."}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
