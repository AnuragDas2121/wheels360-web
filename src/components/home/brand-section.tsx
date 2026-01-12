import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Car } from "lucide-react";
import { 
  SiBmw, 
  SiMercedes, 
  SiAudi, 
  SiTesla, 
  SiPorsche, 
  SiToyota, 
  SiHonda, 
  SiFord, 
  SiChevrolet
} from "react-icons/si";

// SVG Icons for Indian car brands
const TataMotorsIcon = () => (
  <svg viewBox="0 0 24 24" className="text-5xl text-neutral-dark" width="1em" height="1em">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-9h8v2H8v-2zm0-3h8v2H8V8z"
    />
  </svg>
);

const MarutiSuzukiIcon = () => (
  <svg viewBox="0 0 24 24" className="text-5xl text-neutral-dark" width="1em" height="1em">
    <path
      fill="currentColor"
      d="M21 3H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h14v2H5v-2zm0-8h14v2H5V7zm0 4h14v2H5v-2z"
    />
  </svg>
);

const HyundaiIcon = () => (
  <svg viewBox="0 0 24 24" className="text-5xl text-neutral-dark" width="1em" height="1em">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9l5-5 5 5H7zm5 1l5 5H7l5-5z"
    />
  </svg>
);

const MahindraIcon = () => (
  <svg viewBox="0 0 24 24" className="text-5xl text-neutral-dark" width="1em" height="1em">
    <path
      fill="currentColor"
      d="M12 2L4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-8-3zm0 2.8L17 7v4c0 3.9-2.55 7.5-6 8.74-3.45-1.24-6-4.85-6-8.74V7l5-2.2z"
    />
  </svg>
);

const brandIcons: { [key: string]: React.ReactNode } = {
  "Mercedes-Benz": <SiMercedes className="text-5xl text-neutral-dark" />,
  "BMW": <SiBmw className="text-5xl text-neutral-dark" />,
  "Audi": <SiAudi className="text-5xl text-neutral-dark" />,
  "Tesla": <SiTesla className="text-5xl text-neutral-dark" />,
  "Lexus": <Car className="text-5xl text-neutral-dark" />,
  "Porsche": <SiPorsche className="text-5xl text-neutral-dark" />,
  "Toyota": <SiToyota className="text-5xl text-neutral-dark" />,
  "Honda": <SiHonda className="text-5xl text-neutral-dark" />,
  "Ford": <SiFord className="text-5xl text-neutral-dark" />,
  "Chevrolet": <SiChevrolet className="text-5xl text-neutral-dark" />,
  "Tata Motors": <TataMotorsIcon />,
  "Maruti Suzuki": <MarutiSuzukiIcon />,
  "Hyundai": <HyundaiIcon />,
  "Mahindra": <MahindraIcon />,
};

export default function BrandSection() {
  // Fetch brands from API
  const { data: brands, isLoading, error } = useQuery<string[]>({
    queryKey: ["/api/brands"],
  });

  // Default brands to display if the API fails or is loading, prioritizing Indian brands
  const defaultBrands = [
    "Tata Motors",
    "Maruti Suzuki",
    "Hyundai",
    "Mahindra",
    "Honda",
    "Toyota",
    "Mercedes-Benz", 
    "BMW", 
    "Audi"
  ];

  // Use API brands or fallback to defaults
  const brandsToDisplay = brands || defaultBrands;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold font-montserrat mb-2">Browse by Brand</h2>
          <p className="text-neutral-medium">Discover vehicles from top manufacturers</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-error">Failed to load brands. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {brandsToDisplay.map((brand) => (
              <Link key={brand} to={`/cars?brand=${encodeURIComponent(brand)}`} className="flex flex-col items-center p-5 rounded-lg bg-neutral-lightest hover:bg-neutral-light/20 transition">
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  {brandIcons[brand] || <div className="text-5xl text-neutral-dark">🚗</div>}
                </div>
                <span className="font-medium">{brand}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
