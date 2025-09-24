import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-[var(--color-blue-dark)]">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Strona nie znaleziona</h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">Przepraszamy, ale nie mogliśmy znaleźć strony, której szukasz.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/home"
            className="rounded-md bg-[var(--color-blue-dark)] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--color-blue-dark-hover)] transition duration-100 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Home
          </Link>
          <Link to="/contact" className="text-sm font-semibold text-gray-900">
            Pomoc techniczna <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
