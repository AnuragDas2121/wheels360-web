import { Link } from "wouter";
import { Dealer } from "@shared/schema";
import { MapPin } from "lucide-react";

interface DealerCardProps {
  dealer: Dealer;
}

export default function DealerCard({ dealer }: DealerCardProps) {
  return (
    <Link href={`/dealers/${dealer.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition duration-300 hover:shadow-lg cursor-pointer">
        <div className="h-40 overflow-hidden">
          {dealer.coverImage ? (
            <img 
              src={dealer.coverImage}
              alt={dealer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary opacity-50 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{dealer.name}</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold font-montserrat">{dealer.name}</h3>
            <div className="flex items-center">
              <div className="flex text-warning">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`${i < Math.floor(Number(dealer.averageRating)) ? 'text-warning' : 'text-neutral-light'}`}
                  >
                    ★
                  </span>
                ))}
                {Number(dealer.averageRating) % 1 >= 0.5 && (
                  <span className="text-warning">½</span>
                )}
              </div>
              <span className="ml-2 text-sm text-neutral-medium">
                {Number(dealer.averageRating).toFixed(1)} ({dealer.reviewCount} reviews)
              </span>
            </div>
          </div>
          <p className="text-neutral-medium mb-4">
            {dealer.description.length > 100 
              ? dealer.description.substring(0, 100) + "..." 
              : dealer.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-medium flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-secondary" /> {dealer.city}, {dealer.state}
            </span>
            <span className="text-accent hover:text-accent-light font-medium transition">
              View Inventory
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
