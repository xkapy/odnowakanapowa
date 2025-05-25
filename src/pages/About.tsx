import aboutImg from "../assets/images/about.png";

const About = () => {
  return (
    <section className="min-h-dvh py-35 relative xl:mr-0 lg:mr-5 mr-0">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center xl:gap-12 gap-10 grid lg:grid-cols-2 grid-cols-1">
          <div className="w-full flex-col justify-center lg:items-start items-center gap-10 inline-flex">
            <div className="w-full flex-col justify-center items-start gap-8 flex">
              <div className="flex-col justify-start lg:items-start items-center gap-4 flex">
                <div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex">
                  <h2 className="text-[var(--color-blue-dark)] text-4xl font-bold font-manrope leading-normal lg:text-start text-center">Dowiedz się kim jesteśmy</h2>
                  <div className="w-full flex-col justify-start lg:items-start items-center gap-3 flex border-gray-200 lg:border-l-1 pl-2">
                    <p className="text-gray-500  text-base font-normal leading-relaxed lg:text-start text-center">
                      Specjalizujemy się w profesjonalnym praniu tapicerki meblowej i samochodowej na terenie województwa śląskiego. Naszą misją jest przywracanie świeżości, czystości i komfortu Twoim
                      meblom oraz wnętrzu samochodu.
                    </p>
                    <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                      Korzystamy wyłącznie z profesjonalnego sprzętu renomowanych marek oraz najwyższej jakości środków czyszczących, które są skuteczne, a jednocześnie bezpieczne dla materiałów i
                      zdrowia domowników. Dzięki temu możemy zaoferować usługę na najwyższym poziomie.
                    </p>
                    <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                      Nieustannie podnosimy swoje kwalifikacje poprzez specjalistyczne szkolenia z zakresu prania tapicerki oraz dywanów, czego potwierdzeniem są uzyskane certyfikaty. Dzięki zdobytej
                      wiedzy i doświadczeniu potrafimy poradzić sobie nawet z trudnymi zabrudzeniami, dbając jednocześnie o zachowanie struktury i koloru tkaniny.
                    </p>
                    <p className="text-gray-500 text-base font-normal leading-relaxed lg:text-start text-center">
                      Działamy z pasją, precyzją i zaangażowaniem, ponieważ dla nas liczy się nie tylko efekt końcowy, ale również zadowolenie naszych klientów. Zapraszamy do współpracy!
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full flex-col justify-center items-start gap-6 flex">
                <div className="w-full justify-start items-center gap-8 grid md:grid-cols-2 grid-cols-1">
                  <div className="w-full h-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Chemia</h4>
                    <p className="text-gray-500 text-base font-normal leading-relaxed">Używamy najwyższej jakości chemii renomowanych i sprawdzonych marek</p>
                  </div>
                  <div className="w-full h-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Certyfikaty</h4>
                    <p className="text-gray-500 text-base font-normal leading-relaxed">Posiadamy certyfikaty ukończonych praktycznych szkoleń</p>
                  </div>
                </div>
                <div className="w-full h-full justify-start items-center gap-8 grid md:grid-cols-2 grid-cols-1">
                  <div className="w-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Sprzęt</h4>
                    <p className="text-gray-500 text-base font-normal leading-relaxed">Korzystamy z profesjonalnego sprzętu do prania i czyszczenia tapicerek</p>
                  </div>
                  <div className="w-full h-full p-3.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-700 ease-in-out flex-col justify-start items-start gap-2.5 inline-flex">
                    <h4 className="text-gray-900 text-2xl font-bold font-manrope leading-9">Klienci</h4>
                    <p className="text-gray-500 text-base font-normal leading-relaxed">Zadowolenie naszych klientów z oferowanych usług jest dla nas priorytetem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:justify-start justify-center items-start flex">
            <div className="sm:w-[564px] w-full sm:h-[646px] h-full sm:bg-gray-100 rounded-3xl sm:border border-gray-200 relative">
              <img className="sm:mt-5 sm:ml-5 w-full h-full rounded-3xl object-cover" src={aboutImg} alt="about Us image" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
