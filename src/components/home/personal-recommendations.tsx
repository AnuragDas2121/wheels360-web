import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Car } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import CarCard from "@/components/cars/car-card";

export default function PersonalRecommendations() {
  const { user } = useAuth();

  // Fetch personalized recommendations if user is logged in
  const { data: recommendations, isLoading, error } = useQuery<Car[]>({
    queryKey: [`/api/recommendations/user/${user?.id}`],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-neutral-lightest rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
            <div className="mb-4">
              <ThumbsUp className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h2 className="text-2xl font-bold font-montserrat mb-2">Personalized Recommendations</h2>
            <p className="text-neutral-medium mb-6">
              Log in to see vehicle recommendations based on your preferences and browsing history.
            </p>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary-light">
                Sign In to Get Recommendations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-montserrat mb-2">Recommended for You</h2>
            <p className="text-neutral-medium">Based on your preferences and browsing history</p>
          </div>
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !recommendations || recommendations.length === 0) {
    return null; // Don't show section if there are no recommendations
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold font-montserrat mb-2">Recommended for You</h2>
          <p className="text-neutral-medium">Based on your preferences and browsing history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.slice(0, 6).map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/cars">
            <Button variant="outline">
              View All Recommended Vehicles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}