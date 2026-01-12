import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="relative bg-primary h-96 md:h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-bottom"
        style={{ 
          backgroundImage: `url(/audi-r8.jpg)` // Audi R8 hero image from carbuzzimages
        }}
      ></div>
      
      <div className="container mx-auto px-4 h-full flex items-center relative z-20">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-montserrat mb-4">
            Find Your Perfect Car in India
          </h1>
          <p className="text-lg text-white mb-8">
            Browse thousands of premium vehicles and connect with trusted dealers across Mumbai, Delhi, Bangalore and other major Indian cities.
          </p>
          <form 
            onSubmit={handleSearch}
            className="relative search-bar bg-white rounded-lg shadow-lg transition duration-300 overflow-hidden"
          >
            <Input
              type="text"
              placeholder="Search Maruti Suzuki, Tata, Mahindra, or other Indian models..."
              className="w-full px-5 py-6 text-neutral-dark outline-none rounded-l-lg border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              className="absolute right-0 top-0 bottom-0 bg-secondary hover:bg-secondary-light text-white px-6 rounded-r-lg font-medium transition h-full"
            >
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
