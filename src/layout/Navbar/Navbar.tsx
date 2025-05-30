import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logoIcon from "../../assets/images/logo-icon.svg";
import logoText from "../../assets/images/logo-text.svg";
import { Link } from "react-router-dom";

const navigation = [
  { id: "home", name: "Home", to: "/" },
  { id: "store", name: "Cennik", to: "/store" },
  { id: "services", name: "Usługi", to: "/services" },
  { id: "about", name: "O nas", to: "/about" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Link key={item.id} to={item.to} className="text-md/6 font-semibold text-gray-900">
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link to="/contact" className="rounded-md bg-gray-700 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 transition duration-100 ease-in-out ">
            Kontakt
          </Link>
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
                  <Link key={item.id} to={item.to} onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-mx-1 rounded-md bg-gray-700 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 transition duration-100 ease-in-out "
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
