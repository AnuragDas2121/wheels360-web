import { Car } from "@shared/schema";
import { Link } from "wouter";

interface CarComparisonTableProps {
  cars?: Car[];
}

export default function CarComparisonTable({ cars }: CarComparisonTableProps) {
  // If no cars are provided, use default data for display purposes
  const displayCars = cars || [];

  // Define comparison categories
  const categories = [
    { name: "Performance", field: (car: Car) => `${car.fuel === "electric" ? "Electric" : "N/A"}` },
    { name: "Fuel Type", field: (car: Car) => car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1) },
    { name: "Mileage", field: (car: Car) => `${Number(car.mileage).toLocaleString()} miles` },
    { name: "Year", field: (car: Car) => car.year },
    { name: "Transmission", field: (car: Car) => car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) },
    { name: "Body Type", field: (car: Car) => car.bodyType.charAt(0).toUpperCase() + car.bodyType.slice(1) },
    { name: "Color", field: (car: Car) => car.color },
  ];

  return (
    <section className={cars ? "" : "py-16 bg-white"}>
      <div className={cars ? "" : "container mx-auto px-4"}>
        {!cars && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold font-montserrat mb-2">Compare Vehicles</h2>
            <p className="text-neutral-medium">Find the perfect match by comparing features side-by-side</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left border-b-2 border-neutral-light"></th>
                {displayCars.length > 0 ? (
                  displayCars.map((car) => (
                    <th key={car.id} className="p-4 text-center border-b-2 border-neutral-light">
                      <div className="flex flex-col items-center">
                        <img
                          src={car.images[0]}
                          alt={car.title}
                          className="w-32 h-24 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-montserrat font-bold">{car.title}</h4>
                        <span className="text-secondary font-bold">
                          ₹{Number(car.price).toLocaleString()}
                        </span>
                      </div>
                    </th>
                  ))
                ) : (
                  // Sample data for when no cars are provided
                  <>
                    <th className="p-4 text-center border-b-2 border-neutral-light">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-24 bg-neutral-lightest rounded-lg mb-3 flex items-center justify-center text-neutral-medium">
                          Car 1
                        </div>
                        <h4 className="font-montserrat font-bold">Tata Nexon EV</h4>
                        <span className="text-secondary font-bold">₹14,49,900</span>
                      </div>
                    </th>
                    <th className="p-4 text-center border-b-2 border-neutral-light">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-24 bg-neutral-lightest rounded-lg mb-3 flex items-center justify-center text-neutral-medium">
                          Car 2
                        </div>
                        <h4 className="font-montserrat font-bold">Mahindra XUV700</h4>
                        <span className="text-secondary font-bold">₹13,45,900</span>
                      </div>
                    </th>
                    <th className="p-4 text-center border-b-2 border-neutral-light">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-24 bg-neutral-lightest rounded-lg mb-3 flex items-center justify-center text-neutral-medium">
                          Car 3
                        </div>
                        <h4 className="font-montserrat font-bold">Hyundai Creta</h4>
                        <span className="text-secondary font-bold">₹10,87,000</span>
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={index}>
                  <td className="p-4 border-b border-neutral-light font-medium">
                    {category.name}
                  </td>
                  {displayCars.length > 0 ? (
                    displayCars.map((car) => (
                      <td key={car.id} className="p-4 text-center border-b border-neutral-light">
                        {category.field(car)}
                      </td>
                    ))
                  ) : (
                    // Sample data for when no cars are provided
                    <>
                      <td className="p-4 text-center border-b border-neutral-light">
                        {category.name === "Performance" ? "129 PS / 9.9s 0-100 km/h" :
                         category.name === "Fuel Type" ? "Electric" :
                         category.name === "Mileage" ? "312 km" :
                         category.name === "Year" ? "2023" :
                         category.name === "Transmission" ? "Automatic" :
                         category.name === "Body Type" ? "SUV" :
                         category.name === "Color" ? "Pristine Blue" :
                         "Sample data"}
                      </td>
                      <td className="p-4 text-center border-b border-neutral-light">
                        {category.name === "Performance" ? "185 PS / 10.8s 0-100 km/h" :
                         category.name === "Fuel Type" ? "Diesel" :
                         category.name === "Mileage" ? "16.8 km/l" :
                         category.name === "Year" ? "2022" :
                         category.name === "Transmission" ? "Automatic" :
                         category.name === "Body Type" ? "SUV" :
                         category.name === "Color" ? "Midnight Black" :
                         "Sample data"}
                      </td>
                      <td className="p-4 text-center border-b border-neutral-light">
                        {category.name === "Performance" ? "138 PS / 9.7s 0-100 km/h" :
                         category.name === "Fuel Type" ? "Petrol" :
                         category.name === "Mileage" ? "17.0 km/l" :
                         category.name === "Year" ? "2023" :
                         category.name === "Transmission" ? "Manual" :
                         category.name === "Body Type" ? "SUV" :
                         category.name === "Color" ? "Typhoon Silver" :
                         "Sample data"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!cars && (
          <div className="text-center mt-10">
            <Link to="/compare">
              <span className="inline-block bg-secondary hover:bg-secondary-light text-white font-medium py-3 px-8 rounded-lg transition">
                Create Custom Comparison
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
