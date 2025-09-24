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
import drying from "../assets/images/drying.jpg";

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
    durationDesc: "około 1 godziny",
    price: "od 200 zł",
    imageSrc: sofa,
    desc: "Cena dotyczy prania kanapy, sofy, wersalki 2-3 osobowej metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 2,
    name: "Narożnik mały szezlong",
    href: "#",
    duration: 3,
    durationDesc: "około 1,5 godziny",
    price: "od 300 zł",
    imageSrc: chaiseLongue,
    desc: "Cena dotyczy prania narożnika 3-4 osobowego typu szezlong bez poduszek metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 3,
    name: 'Narożnik duży "L"',
    href: "#",
    duration: 4,
    durationDesc: "około 2 godzin",
    price: "od 350 zł",
    imageSrc: cornerL,
    desc: "Cena dotyczy prania narożnika dużego 4-5 osobowego typu „L” bez poduszek metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 4,
    name: 'Narożnik duży "U"',
    href: "#",
    duration: 5,
    durationDesc: "około 2,5 godziny",
    price: "od 450 zł",
    imageSrc: cornerU,
    desc: "Cena dotyczy prania narożnika dużego 5-6 osobowego typu „U” bez poduszek metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 5,
    name: "Fotel mały",
    href: "#",
    duration: 2,
    durationDesc: "około 1 godziny",
    price: "od 100 zł",
    imageSrc: armchairSmall,
    desc: "Cena dotyczy prania małego fotela metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 6,
    name: "Fotel duży",
    href: "#",
    duration: 3,
    durationDesc: "około 1,5 godziny",
    price: "od 150 zł",
    imageSrc: armchairBig,
    desc: "Cena dotyczy prania dużego fotela typu „Uszak” metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 7,
    name: "Krzesło tapicerowane",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 30 zł",
    imageSrc: chair,
    desc: "Cena dotyczy prania krzeseł tapicerowanych z oparciem oraz foteli biurkowych metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 8,
    name: "Puf podnóżek",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 40 zł",
    imageSrc: pouf,
    desc: "Cena dotyczy prania pufy lub podnóżka tapicerowanego metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 9,
    name: "Poduszka tepicerowana",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 40 zł",
    imageSrc: pillow,
    desc: "Cena dotyczy prania poduszek tapicerowanych będących elementem oparcia w kanapach, sofach, narożnikach metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
];

export const mattress = [
  {
    id: 101,
    name: "Materac pojedynczy",
    href: "#",
    duration: 2,
    durationDesc: "około 1 godziny",
    price: "od 150 zł",
    imageSrc: mattressSingle,
    desc: "Cena dotyczy prania materaca 1 osobowego do rozmiaru 120x200 cm po jednej stronie metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 102,
    name: "Materac podwójny",
    href: "#",
    duration: 3,
    durationDesc: "około 1,5 godziny",
    price: "od 250 zł",
    imageSrc: mattressDouble,
    desc: "Cena dotyczy prania materaca 2 osobowego do rozmiaru 200x200 cm po jednej stronie metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
];

export const vehicle = [
  {
    id: 201,
    name: "Fotele samochodowe",
    href: "#",
    duration: 3,
    durationDesc: "około 1,5 godziny",
    price: "od 300 zł",
    imageSrc: carInterior,
    desc: "Cena dotyczy prania tapicerki samochodowej foteli przednich oraz kanapy tylnej metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 202,
    name: "Dywanik tekstylny",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 20 zł",
    imageSrc: carCarpet,
    desc: "Cena dotyczy prania 1 szt dywanika tekstylnego metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji",
  },
  {
    id: 203,
    name: "Podłoga samochodu",
    href: "#",
    duration: 2,
    durationDesc: "około 1 godziny",
    price: "od 200 zł",
    imageSrc: carFloor,
    desc: "Cena dotyczy odkurzania oraz prania podłogi samochodu osobowego metodą ekstrakcyjną standardowych zabrudzeń w wyniku eksploatacji (zależy od wielkości pojazdu)",
  },
  {
    id: 204,
    name: "Bonetowanie podsufitki",
    href: "#",
    duration: 2,
    durationDesc: "około 1 godziny",
    price: "od 150 zł",
    imageSrc: carHeadliner,
    desc: "Cena dotyczy czyszczenia oraz bonetowania podsufitki samochodu osobowego standardowych zabrudzeń w wyniku eksploatacji (zależy od wielkości pojazdu)",
  },
];

export const other = [
  {
    id: 301,
    name: "Usuwanie plam",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 50 zł",
    imageSrc: spray,
    desc: "Cena dotyczy usuwania ponadnormatywnych plam z materiałów tekstylnych spowodowanych zabrudzeniami spożywczymi oraz biologicznymi typu ( kawa, herbata, mleko, sok, artykuły spożywcze, krew, pomadka, lakier, sadza, guma, wosk, itp.) wycena uzależniona od stopnia i wielkości zabrudzeń",
  },
  {
    id: 302,
    name: "Usuwnie nieprzyjemnych zapachów",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 100 zł",
    imageSrc: smell,
    desc: "Cena obejmuje neutralizację nieprzyjemnych zapachów spowodowanych zabrudzeniami pochodzenia biologicznego np. mocz, kał, itp. cena może różnic się od stopnia zabrudzeń",
  },
  {
    id: 303,
    name: "Osuszanie",
    href: "#",
    duration: 1,
    durationDesc: "około 0,5 godziny",
    price: "od 50 zł",
    imageSrc: drying,
    desc: "Cena dotyczy usługi osuszania mebli tapicerowanych po praniu ekstrakcyjnym w wyniku czego przyspiesza możliwość natychmiastowego użytkowania",
  },
];
