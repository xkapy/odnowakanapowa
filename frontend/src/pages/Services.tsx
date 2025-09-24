import { useState, useEffect } from "react";
import { furniture, mattress, vehicle, other } from "../data/data";
import { HiOutlineX } from "react-icons/hi";
import { Link } from "react-router-dom";

interface Service {
  id: number;
  name: string;
  duration: number;
  durationDesc: string;
  price: string;
  imageSrc: string;
  desc: string;
}

export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
    setIsImageLoaded(false);
  };

  useEffect(() => {
    if (selectedService) {
      setIsImageLoaded(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedService]);

  return (
    <div className="min-h-screen bg-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-8">
          <p className="text-sm text-gray-500 max-w-md text-left">
            Ceny mogą różnić się w zależności od stopnia zabrudzenia, rodzaju materiału oraz wielkości powierzchni. Ostateczna wycena następuje po wstępnej diagnostyce.
          </p>
        </div>

        {[
          { title: "Meble tapicerowane", data: furniture },
          { title: "Materace", data: mattress },
          { title: "Samochody", data: vehicle },
          { title: "Inne usługi", data: other },
        ].map((section) => (
          <div key={section.title} className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.data.map((service: Service) => (
                <div
                  key={service.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{service.desc}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{service.price}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Szczegóły →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-16">
          <Link
            to="/booking"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Umów wizytę
          </Link>
        </div>
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="relative w-full max-w-[22rem] sm:max-w-3xl lg:max-w-fit">
            {/* Fixed header z X tylko na małych ekranach */}
            <div className="z-60 flex justify-end mx-auto sm:hidden">
              <button onClick={handleCloseModal} className="bg-white rounded-md p-2 mb-2 text-gray-500 hover:text-black text-xl cursor-pointer sm:hidden" aria-label="Zamknij modal">
                <HiOutlineX />
              </button>
            </div>

            {/* Scrollowalna zawartość modala */}
            <div className="bg-white rounded-md shadow-xl p-9 pt-6 overflow-y-auto max-h-[60vh] sm:pt-10">
              {/* Przycisk X na większych ekranach - w modalu */}
              <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer hidden sm:block" aria-label="Zamknij modal">
                <HiOutlineX />
              </button>

              <div className="flex flex-col sm:flex-row gap-10 items-stretch">
                <div className="flex flex-col justify-between flex-1 not-sm:py-2 sm:order-2">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedService.name}</h3>
                    <p className="text-lg text-gray-500 font-semibold">{selectedService.price}</p>
                    <div className="py-6">
                      <Link
                        to="/booking"
                        className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition duration-100 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Umów usługę
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-md max-w-md">{selectedService.desc}</p>
                    <p className="text-sm text-gray-500 mt-2" title="Czas trwania usługi">
                      Czas trwania: {selectedService.durationDesc}
                    </p>
                  </div>
                </div>
                <div className="relative w-full sm:w-60 min-h-[200px]">
                  {!isImageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md animate-pulse">
                      <span className="text-gray-400">Ładowanie...</span>
                    </div>
                  )}
                  <img
                    src={selectedService.imageSrc}
                    alt={selectedService.name}
                    className={`w-full h-full rounded-md object-cover transition-opacity duration-300 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
