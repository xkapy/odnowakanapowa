import { useState } from "react";
import { faqData } from "../data/faqData";

const Faq = () => {
  const [activeId, setActiveId] = useState<string>("1");

  const toggleAccordion = (id: string) => {
    setActiveId((prev) => (prev === id ? "" : id));
  };

  return (
    <section className="py-24 mt-23">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-manrope text-center font-bold text-gray-900 leading-[3.25rem]">Najczęściej zadawane pytania</h2>
        </div>
        <div>
          {faqData.map(({ id, question, answer }) => {
            const isActive = activeId === id;
            return (
              <div
                key={id}
                className={`rounded-xl border border-solid border-gray-300 mb-8 lg:p-0 transition-colors duration-500`}
                style={isActive ? { borderColor: "var(--color-blue-dark)", backgroundColor: "#edf7fe" } : undefined}
                id={`heading-${id}`}
              >
                <button
                  onClick={() => toggleAccordion(id)}
                  aria-controls={`collapse-${id}`}
                  aria-expanded={isActive}
                  type="button"
                  className={`group w-full flex items-center justify-between text-left text-lg font-normal leading-8 text-gray-900 transition duration-500 cursor-pointer
    ${isActive ? "font-medium text-[var(--color-blue-dark)]" : "hover:text-[var(--color-blue-dark)]"}
  `}
                  style={{ padding: "1rem 1rem" }}
                >
                  <h5 className={`flex-1 transition-all duration-500 ease-in-out ${isActive ? "font-bold" : "font-normal"}`}>{question}</h5> {/* flex-1 sprawi, że h5 zajmie resztę miejsca */}
                  {!isActive ? (
                    <svg
                      className="w-6 h-6 text-gray-900 transition duration-500 group-hover:text-[var(--color-blue-dark)] origin-center"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M6 12H18M12 18V6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-[var(--color-blue-dark)] transition duration-500 origin-center" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12H18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <div
                  id={`collapse-${id}`}
                  aria-labelledby={`heading-${id}`}
                  className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                  style={{ maxHeight: isActive ? "250px" : "0" }}
                >
                  <div className="px-4 pb-6">
                    <p className="text-base text-gray-900 font-normal leading-6">{answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
