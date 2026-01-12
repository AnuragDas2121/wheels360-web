import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-accent rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-4">
                Ready to Find Your Perfect Car in India?
              </h2>
              <p className="text-white opacity-90 text-lg mb-8">
                Create an account to save favorites, get alerts on price drops, and connect with top-rated dealers across Mumbai, Delhi, Bangalore and more cities.
              </p>
              <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                <Link to="/auth?tab=register">
                  <Button className="inline-block bg-white text-accent font-bold py-3 px-8 rounded-lg transition hover:bg-opacity-90">
                    Create Account
                  </Button>
                </Link>
                <Link to="/cars">
                  <Button variant="outline" className="inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg transition hover:bg-white hover:bg-opacity-10">
                    Browse Inventory
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: "url(https://images.unsplash.com/photo-1619682817481-e994891cd1f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)" // Popular Tata Nexon SUV from India
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
