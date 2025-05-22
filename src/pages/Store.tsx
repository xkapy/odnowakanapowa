import { useState, useEffect } from "react";
import { furniture, mattress, vehicle, other } from "../data/data";
import { HiOutlineX } from "react-icons/hi";
import { LuClock } from "react-icons/lu";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  duration: number;
  durationDesc: string;
  price: string;
  imageSrc: string;
  desc: string;
}

// Funkcja pomocnicza do określania koloru na podstawie duration
const getDurationColor = (duration: number): string => {
  const colors: Record<number, string> = {
    1: "#42d981", // przyciemniony zielony
    2: "#2ed573", // oliwkowy żółty
    3: "#24aa5c", // musztardowy
    4: "#1b7f45", // terakota
    5: "#12552e", // czerwony ochra
  };
  return colors[duration] || "bg-[#0984e3]"; // fallback
};

export default function Store() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedProduct]);

  return (
    <div className="bg-white pb-40 w-full overflow-x-hidden">
      <div className="flex flex-col lg:items-center px-4 sm:px-8 lg:px-16 xl:px-24 max-w-screen-xl xl:max-w-screen-2xl mx-auto">
        {[
          { title: "Pranie tapicerki meblowej", data: furniture },
          { title: "Pranie materacy", data: mattress },
          { title: "Pranie tapicerki samochodowej", data: vehicle },
          { title: "Inne", data: other },
        ].map((section, index) => (
          <section key={section.title} className={index === 0 ? "mt-40" : "mt-20"}>
            <p className={`sm:w-xl lg:w-xl text-gray-500 text-wrap text-sm ${index !== 0 ? "hidden" : "visible"}`}>
              Ceny mogą różnić się w zależności od stopnia zabrudzenia, rodzaju materiału oraz wielkości powierzchni. Ostateczna wycena następuje po wstępnej diagnostyce.
            </p>
            <h2 className="py-10 text-[40px] lg:text-5xl font-bold">{section.title}</h2>

            <div className="relative w-full">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="">
                  <table className="text-sm text-left">
                    <thead className="text-xs border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-base sm:text-lg font-bold min-w-64">Usługa</th>
                        <th className="px-4 py-3 text-base sm:text-lg font-bold min-w-64">Czas</th>
                        <th className="px-4 py-3 text-base sm:text-lg font-bold min-w-64">Cena</th>
                        <th className="px-4 py-3 text-base sm:text-lg font-bold">
                          <span className="sr-only">akcja</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.data.map((product: Product) => (
                        <tr key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-50 gap-7">
                          <td className="px-4 py-4 font-semibold break-words">{product.name}</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1 group" title={product.durationDesc}>
                              {Array.from({ length: product.duration }).map((_, i) => (
                                <div key={i} className="w-4 h-2 rounded-full" style={{ backgroundColor: getDurationColor(product.duration) }} />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold">{product.price}</td>
                          <td className="">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(product);
                              }}
                              className="px-4 py-4 font-semibold text-[var(--color-blue-dark)] hover:underline gap-1 text-nowrap cursor-pointer"
                            >
                              Czytaj dalej <span aria-hidden="true">&rarr;</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="relative w-full max-w-[22rem] sm:max-w-3xl lg:max-w-fit max-h-[90vh]">
            {/* Fixed header z X tylko na małych ekranach */}
            <div className="fixed top-0 left-0 right-0 bg-white z-60 p-3 flex justify-end rounded-t-md max-w-[22rem] mx-auto sm:hidden">
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-black text-xl cursor-pointer" aria-label="Zamknij modal">
                <HiOutlineX />
              </button>
            </div>

            {/* Scrollowalna zawartość modala */}
            <div className="bg-white rounded-md shadow-xl p-10 overflow-y-auto max-h-[90vh] pt-2 sm:pt-10">
              {/* Przycisk X na większych ekranach - w modalu */}
              <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer hidden sm:block" aria-label="Zamknij modal">
                <HiOutlineX />
              </button>

              <div className="flex flex-col sm:flex-row gap-10 items-stretch">
                <img src={selectedProduct.imageSrc} alt={selectedProduct.name} className="w-full sm:w-60 rounded-md object-cover" />
                <div className="flex flex-col justify-between flex-1 py-6 not-sm:py-2">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
                    <p className="text-lg text-gray-500 font-semibold">{selectedProduct.price}</p>
                    <div className="py-6">
                      <Link
                        to="/contact"
                        className="rounded-md bg-[var(--color-blue-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--color-blue-dark-hover)] transition duration-100 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Umów usługę
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-md max-w-md">{selectedProduct.desc}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-2" title="Czas trwania usługi">
                      <LuClock />
                      {selectedProduct.durationDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
