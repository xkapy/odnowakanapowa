import { useState } from "react";
import { furniture, mattress, vehicle, other } from "../data/data";
import { HiOutlineX } from "react-icons/hi";

interface Product {
  id: number;
  name: string;
  duration: number;
  durationDesc: string;
  price: string;
  imageSrc: string;
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
              Ceny mogą różnić się w zależności od stopnia zabrudzenia, rodzaju materiału oraz powierzchni. Ostateczna wycena następuje po wstępnej diagnostyce.
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
                              className="px-4 py-4 font-semibold text-[var(--color-blue-dark)] hover:underline gap-1 text-nowrap"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer">
              <HiOutlineX />
            </button>
            <h3 className="text-2xl font-bold mb-4">{selectedProduct.name}</h3>
            <p className="text-lg mb-2">Cena: {selectedProduct.price}</p>
            <img src={selectedProduct.imageSrc} alt={selectedProduct.name} />
            <p className="text-sm text-gray-500">Czas trwania: {selectedProduct.durationDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
