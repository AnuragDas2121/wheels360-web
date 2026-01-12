import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, MapPin } from "lucide-react";
import { Dealer } from "@shared/schema";
import DealerCard from "@/components/dealers/dealer-card";

export default function FeaturedDealers() {
  const { data: topDealers, isLoading, error } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers/top"],
  });

  return (
    <section className="py-16 bg-neutral-lightest">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl font-bold font-montserrat mb-2">Top-Rated Dealers</h2>
          <p className="text-neutral-medium">Connect with our most trusted automotive partners</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-error">Failed to load top dealers. Please try again later.</p>
          </div>
        ) : topDealers && topDealers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topDealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-neutral-medium">No dealers available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
