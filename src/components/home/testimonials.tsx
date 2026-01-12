import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Review } from "@shared/schema";

// Mock data for testimonials
const testimonials = [
  {
    id: 1,
    rating: 5,
    comment: "Wheels360 made finding my dream car so easy. The comparison feature helped me make the right choice, and I got a great deal through their dealer network.",
    user: {
      name: "Rajesh Sharma",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      purchasedCar: "BMW X3",
      location: "Mumbai, Maharashtra"
    }
  },
  {
    id: 2,
    rating: 4.5,
    comment: "As a first-time buyer, I was nervous about the process. The market trends section helped me negotiate a fair price, and the dealer ratings gave me confidence.",
    user: {
      name: "Priya Patel",
      image: "https://randomuser.me/api/portraits/women/47.jpg",
      purchasedCar: "Hyundai Creta",
      location: "Bangalore, Karnataka"
    }
  },
  {
    id: 3,
    rating: 5,
    comment: "I was looking for a specific luxury vehicle, and Wheels360 connected me with a dealer who had exactly what I wanted. The chat feature made communication seamless.",
    user: {
      name: "Vikram Singh",
      image: "https://randomuser.me/api/portraits/men/33.jpg",
      purchasedCar: "Mercedes-Benz E-Class",
      location: "Delhi, NCR"
    }
  }
];

export default function Testimonials() {
  // In a real application, this would fetch testimonials from the API
  const { data, isLoading, error } = useQuery<Review[]>({
    queryKey: ["/api/testimonials"],
    queryFn: async () => {
      // This would be implemented in a real application
      return [];
    },
  });

  // We're using the mock data since this is a demo
  const displayTestimonials = testimonials;

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold font-montserrat mb-2">What Our Customers Say</h2>
          <p className="text-neutral-lightest opacity-80">
            Read reviews from car buyers who found their perfect vehicle
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-white opacity-80">
              Failed to load testimonials. Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-primary-light p-6 rounded-xl relative">
                <div className="absolute -top-5 left-6 text-secondary text-5xl opacity-50">
                  <i className="fas fa-quote-left"></i>
                </div>
                <div className="flex text-warning mb-4 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.floor(testimonial.rating) ? "text-warning" : "text-neutral-light"}
                    >
                      ★
                    </span>
                  ))}
                  {testimonial.rating % 1 !== 0 && <span className="text-warning">½</span>}
                </div>
                <p className="mb-6 text-neutral-lightest">{testimonial.comment}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-light overflow-hidden mr-4">
                    <img
                      src={testimonial.user.image}
                      alt={testimonial.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold font-montserrat">{testimonial.user.name}</h4>
                    <p className="text-neutral-lightest opacity-80 text-sm">
                      {testimonial.user.location}
                    </p>
                    <p className="text-neutral-lightest opacity-80 text-sm">
                      Purchased a {testimonial.user.purchasedCar}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
