export type Question = {
  id: string;
  question: string;
  answer: string;
};

export const faqData: Question[] = [
  {
    id: "1",
    question: "Jak działa czyszczenie mobilne tapicerki?",
    answer:
      "Nasz specjalista przyjeżdża do Twojego domu lub samochodu z pełnym sprzętem i środkami czystości. Wykonujemy profesjonalne czyszczenie na miejscu, bez konieczności przewożenia mebli lub samochodu.",
  },
  {
    id: "2",
    question: "Czy używane środki są bezpieczne dla dzieci i zwierząt?",
    answer: "Tak, stosujemy tylko ekologiczne i bezpieczne środki czystości, które nie są szkodliwe dla domowników ani zwierząt.",
  },
  {
    id: "3",
    question: "Ile trwa standardowe czyszczenie tapicerki?",
    answer: "Czas zależy od rodzaju i stopnia zabrudzenia, ale zwykle proces trwa od 1 do 2 godzin na mebel lub samochód.",
  },
  {
    id: "4",
    question: "Czy dojazd do klienta jest darmowy?",
    answer: "Tak! Dojazd na terenie Śląska i okolic jest całkowicie darmowy — nie doliczamy żadnych ukrytych opłat.",
  },
  {
    id: "5",
    question: "Czy trzeba coś przygotować przed przyjazdem specjalisty?",
    answer: "Prosimy o udostępnienie miejsca pracy i usunięcie drobnych przedmiotów z okolicy tapicerki, aby zapewnić bezproblemową pracę.",
  },
  {
    id: "6",
    question: "Czy usuwacie plamy z kawy, wina lub innych trudnych zabrudzeń?",
    answer: "Tak, specjalizujemy się w usuwaniu różnego rodzaju plam, w tym tych trudnych, takich jak kawa, wino, tłuszcz, czy inne.",
  },
  {
    id: "7",
    question: "Jak mogę umówić się na wizytę?",
    answer: "Możesz do nas zadzwonić, napisać wiadomość lub skorzystać z formularza online dostępnego na naszej stronie.",
  },
];
