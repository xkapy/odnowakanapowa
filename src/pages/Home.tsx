"use client";

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8 flex justify-center gap-20 overflow-hidden pb-20">
        <div className="max-w-3xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
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
              Każdy zasługuje na odrobinę świeżości i przyjemności we własnym domu. My sprawimy, że Twoje ulubione miejsca będą czyste, pachnące i jak nowe.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-[var(--color-blue-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Zaczynajmy
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900">
                Dowiedz się więcej <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex w-[360px] relative max-lg:hidden">
          <div className="flex w-[550px] gap-6 absolute top-0 -right-45 pt-25 max-xl:-right-82">
            <div className="flex flex-col justify-end gap-6 w-1/3 pb-20">
              <div className={`bg-[url("../../public/images/sofa2.jpg")] bg-cover bg-center rounded-xl h-60`}></div>
            </div>

            <div className="flex flex-col justify-end gap-6 w-1/3 max-xl:pt-20">
              <div className={`bg-[url("../../public/images/sofa4.jpg")] bg-cover bg-center rounded-xl h-60`}></div>
              <div className={`bg-[url("../../public/images/sofa3.jpg")] bg-cover bg-center rounded-xl h-60`}></div>
            </div>

            <div className="flex flex-col justify-end gap-6 w-1/3 pb-40 max-xl:hidden">
              <div className={`bg-[url("../../public/images/sofa5.jpg")] bg-cover bg-center rounded-xl h-60`}></div>
              <div className={`bg-[url("../../public/images/sofa1.jpg")] bg-cover bg-center rounded-xl h-60`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
