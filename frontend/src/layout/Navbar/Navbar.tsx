import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import logoIcon from "../../assets/images/logo-icon.svg";
import logoText from "../../assets/images/logo-text.svg";
import { Link } from "react-router-dom";
import { safeParseJSON } from "../../utils/safeParseJSON";

const navigation = [
  { id: "home", name: "Home", to: "/" },
  { id: "services", name: "Usługi", to: "/services" },
  { id: "booking", name: "Rezerwacja", to: "/booking" },
  { id: "about", name: "O nas", to: "/about" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check auth status on component mount and listen for changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const parsedUser = safeParseJSON(userData);

      if (token && parsedUser) {
        setIsLoggedIn(true);
        setUser(parsedUser);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Check on mount
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener("storage", checkAuthStatus);

    // Listen for custom events (when user logs in/out in same tab)
    window.addEventListener("authChange", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authChange", checkAuthStatus);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authChange"));

    // Redirect to home
    window.location.href = "/";
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex gap-5">
            <span className="sr-only">Odnowa Kanapowa</span>
            <img alt="Logo Icon" src={logoIcon} className="h-8 w-auto" />
            <img alt="Logo Text" src={logoText} className="h-6 w-auto self-center" />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button type="button" onClick={() => setMobileMenuOpen(true)} className="-m-2.5 inline-flex cursor-pointer rounded-md p-2.5 items-center justify-center text-gray-700">
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link key={item.id} to={item.to} className="text-md/6 font-semibold text-gray-900 cursor-pointer">
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4 lg:items-center">
          <Link to="/contact" className="text-md/6 font-semibold text-gray-900 cursor-pointer">
            Kontakt
          </Link>
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1 text-black hover:text-gray-600 transition duration-100 ease-in-out cursor-pointer">
                <UserIcon className="h-6 w-6" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-gray-200 ring-opacity-80 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">Witaj, {user?.firstName || "Użytkowniku"}!</div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => setDropdownOpen(false)}>
                      Szczegóły
                    </Link>
                    {user?.role === "admin" && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer" onClick={() => setDropdownOpen(false)}>
                        Panel Admina
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                    >
                      Wyloguj
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-md bg-gray-700 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 transition duration-100 ease-in-out cursor-pointer">
              Login
            </Link>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Odnowa Kanapowa</span>
              <img alt="Logo Icon" src={logoIcon} className="h-8 w-auto" />
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 cursor-pointer text-gray-700">
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 cursor-pointer"
                  >
                    {item.name}
                  </Link>
                ))}
                {isLoggedIn && user?.role === "admin" && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-blue-600 hover:bg-gray-50 cursor-pointer">
                    Panel Admin
                  </Link>
                )}
              </div>
              <div className="py-6 space-y-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-1 block rounded-md bg-gray-100 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition duration-100 ease-in-out cursor-pointer"
                    >
                      Szczegóły
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="-mx-1 block w-full text-left rounded-md bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 transition duration-100 ease-in-out cursor-pointer"
                    >
                      Wyloguj
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-1 block rounded-md bg-gray-700 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 transition duration-100 ease-in-out cursor-pointer"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-1 block rounded-md border border-gray-700 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-100 ease-in-out cursor-pointer"
                >
                  Skontaktuj się z nami
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Navbar;
