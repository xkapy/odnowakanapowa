import sofa from "../assets/images/sofa.jpg";
import chaiseLongue from "../assets/images/chaise-longue.jpg";
import cornerL from "../assets/images/corner-l.jpg";
import cornerU from "../assets/images/corner-u.jpg";
import armchairSmall from "../assets/images/small-armchair.jpg";
import armchairBig from "../assets/images/big-armchair.jpg";
import chair from "../assets/images/chair.jpg";
import pouf from "../assets/images/pouf.jpg";
import pillow from "../assets/images/pillow.jpg";

import mattressSingle from "../assets/images/single-mattress.jpg";
import mattressDouble from "../assets/images/double-mattress.jpg";

import carInterior from "../assets/images/car-interior.jpg";
import carCarpet from "../assets/images/car-carpet.jpg";
import carFloor from "../assets/images/car-vacum.jpg";
import carHeadliner from "../assets/images/car-headliner.jpg";

import spray from "../assets/images/spray.jpg";
import smell from "../assets/images/smell.jpg";

// const lvl = {
//   1: "0-30min",
//   2: "30min-1h",
//   3: "1h-1.5h",
//   4: "1.5h-2h",
//   5: "2h-3h",
// };

export const furniture = [
  {
    id: 1,
    name: "Kanapa",
    href: "#",
    duration: 2,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 200 zł",
    imageSrc: sofa,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Narożnik mały szezlong",
    href: "#",
    duration: 3,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 300 zł",
    imageSrc: chaiseLongue,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 3,
    name: 'Narożnik duży "L"',
    href: "#",
    duration: 4,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 350 zł",
    imageSrc: cornerL,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 4,
    name: 'Narożnik duży "U"',
    href: "#",
    duration: 5,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 450 zł",
    imageSrc: cornerU,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 5,
    name: "Fotel mały",
    href: "#",
    duration: 2,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 100 zł",
    imageSrc: armchairSmall,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 6,
    name: "Fotel duży",
    href: "#",
    duration: 3,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 150 zł",
    imageSrc: armchairBig,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 7,
    name: "Krzesło tapicerowane",
    href: "#",
    duration: 1,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 30 zł",
    imageSrc: chair,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 8,
    name: "Puf podnóżek",
    href: "#",
    duration: 1,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 40 zł",
    imageSrc: pouf,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 9,
    name: "Poduszka tepicerowana",
    href: "#",
    duration: 1,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 40 zł",
    imageSrc: pillow,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

export const mattress = [
  {
    id: 1,
    name: "Materac pojedynczy",
    href: "#",
    duration: 2,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 150 zł",
    imageSrc: mattressSingle,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Materac podwójny",
    href: "#",
    duration: 3,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 250 zł",
    imageSrc: mattressDouble,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

export const vehicle = [
  {
    id: 1,
    name: "fotele samochodowe",
    href: "#",
    duration: 3,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 300 zł",
    imageSrc: carInterior,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Dywanik tekstylny",
    href: "#",
    duration: 1,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 20 zł",
    imageSrc: carCarpet,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 3,
    name: "Podłoga samochodu",
    href: "#",
    duration: 2,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 200 zł",
    imageSrc: carFloor,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 4,
    name: "bonetowanie podsufitki",
    href: "#",
    duration: 2,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 150 zł",
    imageSrc: carHeadliner,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];

export const other = [
  {
    id: 1,
    name: "Usuwanie plam",
    href: "#",
    duration: 1,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 50 zł",
    imageSrc: spray,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
  {
    id: 2,
    name: "Usuwnie nieprzyjemnych zapachów",
    href: "#",
    duration: 1,
    durationDesc: "od 0,5 do 1 godziny",
    price: "od 100 zł",
    imageSrc: smell,
    imageAlt: "Tall slender porcelain bottle with natural clay textured body and cork stopper.",
  },
];
