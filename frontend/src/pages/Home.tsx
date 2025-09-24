import { Link } from "react-router-dom";
import bg from "../assets/images/sofa3.jpg";

export default function Home() {
  return (
    <div className="relative h-dvh">
      {/* Background with opacity filter */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20 brightness-140" style={{ backgroundImage: `url(${bg})` }}></div>
      <div className="relative px-6 pt-14 lg:px-8 flex justify-center gap-20 overflow-hidden h-full z-10">
        <div className="max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/25 transition-all duration-100 ease-in-out">
              Nowość - pranie tapicerki samochodowej.{" "}
              <Link to="/services" className="font-semibold text-[var(--color-blue-dark)]">
                <span aria-hidden="true" className="absolute inset-0" />
                Czytaj dalej <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Czysta tapicerka to komfort na co dzień.</h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              Każdy zasługuje na odrobinę świeżości i przyjemności we własnym domu. My sprawimy, że Twoje ulubione miejsca będą czyste i pachnące.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/booking"
                className="rounded-md bg-[var(--color-blue-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--color-blue-dark-hover)] transition duration-100 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Zaczynajmy
              </Link>
              <Link to="/services" className="text-sm/6 font-semibold text-gray-900">
                Dowiedz się więcej <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
