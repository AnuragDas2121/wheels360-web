import { useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
  role: z.enum(["user", "dealer"], {
    required_error: "Please select a role.",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Dealer info schema (conditionally required)
const dealerInfoSchema = z.object({
  name: z.string().min(3, {
    message: "Dealership name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zip: z.string().min(5, {
    message: "ZIP code must be at least 5 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
});

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const extendedRegisterSchema = registerSchema.and(
    z.object({
      dealerInfo: z.lazy(() => dealerInfoSchema.optional()),
    })
  ).refine(
    (data) => {
      if (data.role === "dealer") {
        return !!data.dealerInfo;
      }
      return true;
    },
    {
      message: "Dealer information is required for dealer accounts",
      path: ["dealerInfo"],
    }
  );

  const registerForm = useForm<z.infer<typeof registerSchema> & { dealerInfo?: z.infer<typeof dealerInfoSchema> }>({
    resolver: zodResolver(extendedRegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      firstName: "",
      lastName: "",
      phone: "",
      dealerInfo: undefined,
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema> & { dealerInfo?: z.infer<typeof dealerInfoSchema> }) => {
    // Remove confirmPassword as it's not needed for the API
    const { confirmPassword, ...registerData } = values;
    
    // Only include dealerInfo if role is dealer
    if (registerData.role !== 'dealer' && registerData.dealerInfo) {
      delete registerData.dealerInfo;
    }
    
    registerMutation.mutate(registerData as any);
  };

  const showDealerFields = registerForm.watch("role") === "dealer";

  return (
    <>
      <Helmet>
        <title>Login or Register | Wheels360</title>
        <meta name="description" content="Join Wheels360 to connect with dealers and find your perfect car." />
      </Helmet>
    
      <div className="flex min-h-screen bg-neutral-lightest">
        <div className="flex flex-col md:flex-row w-full">
          {/* Form Section */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold text-primary font-montserrat mb-2">
                Auto<span className="text-secondary">Connect</span>
              </h1>
              <p className="text-neutral-medium mb-8">Your premium car marketplace</p>
              
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Login</CardTitle>
                      <CardDescription>
                        Enter your credentials to access your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-light"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </>
                            ) : (
                              'Sign In'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Account</CardTitle>
                      <CardDescription>
                        Join Wheels360 to find your perfect car
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="(123) 456-7890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="user">Car Buyer</SelectItem>
                                    <SelectItem value="dealer">Car Dealer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Select whether you're looking to buy or sell vehicles
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {showDealerFields && (
                            <div className="space-y-4 mt-6 p-4 border border-neutral-light rounded-md">
                              <h3 className="text-lg font-medium">Dealership Information</h3>
                              
                              <FormField
                                control={registerForm.control}
                                name="dealerInfo.name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Dealership Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Elite Motors" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={registerForm.control}
                                name="dealerInfo.description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Dealership Description</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Specializing in luxury vehicles..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={registerForm.control}
                                  name="dealerInfo.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>City</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Los Angeles" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="dealerInfo.state"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>State</FormLabel>
                                      <FormControl>
                                        <Input placeholder="CA" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={registerForm.control}
                                  name="dealerInfo.address"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Address</FormLabel>
                                      <FormControl>
                                        <Input placeholder="123 Auto Lane" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="dealerInfo.zip"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>ZIP Code</FormLabel>
                                      <FormControl>
                                        <Input placeholder="90210" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={registerForm.control}
                                  name="dealerInfo.phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Business Phone</FormLabel>
                                      <FormControl>
                                        <Input placeholder="(123) 456-7890" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={registerForm.control}
                                  name="dealerInfo.email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Business Email</FormLabel>
                                      <FormControl>
                                        <Input type="email" placeholder="info@elitemotors.com" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={registerForm.control}
                                name="dealerInfo.website"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Website (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://www.elitemotors.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary-light mt-6"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                              </>
                            ) : (
                              'Create Account'
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="hidden md:block md:w-1/2 bg-primary relative">
            <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
            <div className="w-full h-full object-cover" style={{ 
              backgroundImage: `url(https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div className="absolute inset-0 flex flex-col justify-center p-12 z-20">
              <h2 className="text-4xl font-bold text-white font-montserrat mb-6">
                Connect With The Best Dealers
              </h2>
              <p className="text-white text-lg mb-8">
                Join thousands of satisfied customers who found their perfect vehicle with Wheels360.
                Our platform connects you with top-rated dealers, provides detailed car information,
                and offers tools to make informed buying decisions.
              </p>
              <div className="flex space-x-6">
                <div className="text-white">
                  <div className="text-3xl font-bold mb-2">15,000+</div>
                  <div className="text-sm">Vehicles Listed</div>
                </div>
                <div className="text-white">
                  <div className="text-3xl font-bold mb-2">1,200+</div>
                  <div className="text-sm">Trusted Dealers</div>
                </div>
                <div className="text-white">
                  <div className="text-3xl font-bold mb-2">9,500+</div>
                  <div className="text-sm">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
