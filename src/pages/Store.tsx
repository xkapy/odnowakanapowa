import corner from "../../public/images/corner.jpeg";
import cornerBig from "../../public/images/cornerBig.jpg";
import couch from "../../public/images/couch.jpeg";
import fotel from "../../public/images/fotel.jpeg";
import pouf from "../../public/images/pouf.jpeg";
import cornerU from "../../public/images/corner-u.png";
import chaiM from "../../public/images/chair-m.png";
import car from "../../public/images/car.jpg";

const products = [
  {
    id: 1,
    name: "Kanapa",
    href: "#",
    price: "od 200 zł",
    imageSrc: couch,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Narożnik mały szezlong",
    href: "#",
    price: "od 300 zł",
    imageSrc: corner,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 3,
    name: "Narożnik duży L",
    href: "#",
    price: "od 350 zł",
    imageSrc: cornerBig,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 4,
    name: "Narożnik duży U",
    href: "#",
    price: "od 400 zł",
    imageSrc: cornerU,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 5,
    name: "Fotel mały",
    href: "#",
    price: "od 100 zł",
    imageSrc: fotel,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 6,
    name: "Fotel duży",
    href: "#",
    price: "od 150 zł",
    imageSrc: fotel,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 7,
    name: "Krzesło tapicerowane",
    href: "#",
    price: "od 30 zł",
    imageSrc: chaiM,
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
    price: "od 50 zł",
    imageSrc: pouf,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

const products2 = [
  {
    id: 1,
    name: "Materac pojedynczy",
    href: "#",
    price: "od 150 zł",
    imageSrc: pouf,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Materac podwójny",
    href: "#",
    price: "od 250 zł",
    imageSrc: pouf,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

const products3 = [
  {
    id: 1,
    name: "Samochód mały",
    href: "#",
    price: "od 300 zł",
    imageSrc: car,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Samochód duży",
    href: "#",
    price: "od 350 zł",
    imageSrc: car,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

const products4 = [
  {
    id: 1,
    name: "Usuwanie plam",
    href: "#",
    price: "od 50 zł",
    imageSrc: car,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Usuwnie nieprzyjemnych zapachów",
    href: "#",
    price: "od 100 zł",
    imageSrc: car,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

export default function Store() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="pt-20 pb-5 text-5xl font-bold">Meble tapicerowane</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <img alt={product.imageAlt} src={product.imageSrc} className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>

        <h2 className="pt-20 pb-5 text-5xl font-bold">Materace</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products2.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <img alt={product.imageAlt} src={product.imageSrc} className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8" />
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>

        <h2 className="pt-20 pb-5 text-5xl font-bold">Tapicerka samochodowa</h2>
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products3.map((product) => (
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
