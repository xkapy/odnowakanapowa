import { useState } from "react";
import { furniture, mattress, vehicle, other } from "../data/data";
import { HiOutlineX } from "react-icons/hi";
interface Product {
  id: number;
  name: string;
  price: string;
  imageSrc: string;
}

export default function Store() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="bg-white pb-30 w-full">
      <div className="mr-auto px-4 sm:px-8 lg:px-16 xl:px-24 max-w-screen-xl xl:max-w-screen-2xl">
        {[
          { title: "Pranie tapicerki meblowej", data: furniture },
          { title: "Pranie materacy", data: mattress },
          { title: "Pranie tapicerki samochodowej", data: vehicle },
          { title: "Inne", data: other },
        ].map((section, index) => (
          <section key={section.title} className={index === 0 ? "mt-40" : "mt-20"}>
            <h2 className={`pb-5 text-3xl sm:text-4xl lg:text-5xl font-bold`}>{section.title}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left table-fixed">
                <thead className="text-xs border-b border-gray-200">
                  <tr>
                    <th className="w-2/5 px-6 py-3 text-base sm:text-lg font-black">Usługa</th>
                    <th className="w-1/4 px-6 py-3 text-base sm:text-lg font-black">Cena</th>
                    <th className="w-1/3 px-6 py-3 text-base sm:text-lg font-black text-right">
                      <span className="sr-only">akcja</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((product) => (
                    <tr key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer bg-white border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold break-words">{product.name}</td>
                      <td className="px-6 py-4 font-semibold">{product.price}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          className="font-semibold text-[var(--color-blue-dark)] hover:underline cursor-pointer"
                        >
                          Czytaj dalej <span aria-hidden="true">&rarr;</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <p className="text-sm text-gray-500">Info ...</p>
          </div>
        </div>
      )}
    </div>
  );
}
