import sofa from "../../public/products/sofa.jpg";
import chaiseLongue from "../../public/products/chaise-longue.jpg";
import cornerL from "../../public/products/corner-l.jpg";
import cornerU from "../../public/products/corner-u.jpg";
import armchairSmall from "../../public/products/small-armchair.jpg";
import armchairBig from "../../public/products/big-armchair.jpg";
import chair from "../../public/products/chair.jpg";
import pouf from "../../public/products/pouf.jpg";
import pillow from "../../public/products/pillow.jpg";

import mattressSingle from "../../public/products/single-mattress.jpg";
import mattressDouble from "../../public/products/double-mattress.jpg";

import carInterior from "../../public/products/car-interior.jpg";
import carCarpet from "../../public/products/car-carpet.jpg";
import carFloor from "../../public/products/car-vacum.jpg";
import carHeadliner from "../../public/products/car-headliner.jpg";

import spray from "../../public/products/spray.jpg";
import smell from "../../public/products/smell.jpg";

const furniture = [
  {
    id: 1,
    name: "Kanapa",
    href: "#",
    price: "od 200 zł",
    imageSrc: sofa,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Narożnik mały szezlong",
    href: "#",
    price: "od 300 zł",
    imageSrc: chaiseLongue,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 3,
    name: "Narożnik duży L",
    href: "#",
    price: "od 350 zł",
    imageSrc: cornerL,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 4,
    name: "Narożnik duży U",
    href: "#",
    price: "od 450 zł",
    imageSrc: cornerU,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 5,
    name: "Fotel mały",
    href: "#",
    price: "od 100 zł",
    imageSrc: armchairSmall,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 6,
    name: "Fotel duży",
    href: "#",
    price: "od 150 zł",
    imageSrc: armchairBig,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 7,
    name: "Krzesło tapicerowane",
    href: "#",
    price: "od 30 zł",
    imageSrc: chair,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 8,
    name: "Puf podnóżek",
    href: "#",
    price: "od 40 zł",
    imageSrc: pouf,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 9,
    name: "Poduszka tepicerowana",
    href: "#",
    price: "od 40 zł",
    imageSrc: pillow,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

const mattress = [
  {
    id: 1,
    name: "Materac pojedynczy",
    href: "#",
    price: "od 150 zł",
    imageSrc: mattressSingle,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Materac podwójny",
    href: "#",
    price: "od 250 zł",
    imageSrc: mattressDouble,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

const vehicle = [
  {
    id: 1,
    name: "fotele samochodowe",
    href: "#",
    price: "od 300 zł",
    imageSrc: carInterior,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Dywanik tekstylny",
    href: "#",
    price: "od 20 zł",
    imageSrc: carCarpet,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 3,
    name: "Podłoga samochodu",
    href: "#",
    price: "od 200 zł",
    imageSrc: carFloor,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 4,
    name: "bonetowanie podsufitki",
    href: "#",
    price: "od 150 zł",
    imageSrc: carHeadliner,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

const other = [
  {
    id: 1,
    name: "Usuwanie plam",
    href: "#",
    price: "od 50 zł",
    imageSrc: spray,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Usuwnie nieprzyjemnych zapachów",
    href: "#",
    price: "od 100 zł",
    imageSrc: smell,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

export default function Store() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="pt-20 pb-5 text-5xl font-bold">Meble tapicerowane</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {furniture.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <img alt={product.imageAlt} src={product.imageSrc} className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>

        <h2 className="pt-20 pb-5 text-5xl font-bold">Materace</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {mattress.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <img alt={product.imageAlt} src={product.imageSrc} className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>

        <h2 className="pt-20 pb-5 text-5xl font-bold">Tapicerka samochodowa</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {vehicle.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <img alt={product.imageAlt} src={product.imageSrc} className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>

        <h2 className="pt-20 pb-5 text-5xl font-bold">Inne</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {other.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <img alt={product.imageAlt} src={product.imageSrc} className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
