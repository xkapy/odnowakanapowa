import { Link } from "react-router-dom";
import logoText from "../../assets/images/logo-text.svg";
import logoIcon from "../../assets/images/logo-icon.svg";
import olxLogo from "../../assets/images/olx-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-100">
      <div className="mx-auto max-w-screen-xl 2xl:max-w-screen-2xl w-full p-8 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <img src={logoIcon} className="h-8 me-3" alt="logoIcon" />
              <img src={logoText} className="self-center h-5" alt="logoText" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-0 sm:pl-20 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 font-semibold text-gray-900 dark:text-gray-600">Linki</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-3">
                  <Link to="/services" className="hover:underline">
                    Usługi
                  </Link>
                </li>
                    <li className="mb-3">
                      <Link to="/booking" className="hover:underline">
                        Umów wizytę
                      </Link>
                    </li>
                <li className="mb-3">
                  <Link to="/about" className="hover:underline">
                    O nas
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 font-semibold text-gray-900 dark:text-gray-600">Śledź nas</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-3">
                  <a href="https://www.facebook.com/profile.php?id=61572996153015&sk=about" className="hover:underline" target="_blank">
                    Facebook
                  </a>
                </li>
                <li className="mb-3">
                  <a
                    href="https://www.instagram.com/odnowakanapowa?fbclid=IwY2xjawJvhutleHRuA2FlbQIxMAABHvuwlOWvyF-zj5dv7bLg1ubeX75_ZkBwM2XdC7lBbGXn9Ab5qdAdQCQzq7jk_aem_WljfwiuhPHHsVLrSLp1O3A"
                    className="hover:underline"
                    target="_blank"
                  >
                    Instagram
                  </a>
                </li>
                <li className="mb-3">
                  <a href="https://www.olx.pl/d/oferta/profesjonalne-pranie-tapicerki-swiezosc-w-kazdym-wloknie-CID4371-ID154nxO.html" className="hover:underline" target="_blank">
                    Olx
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 font-semibold text-gray-900 dark:text-gray-600">Informacje</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-3">
                  <Link to="/privacy-policy" className="hover:underline">
                    Polityka Prywatności
                  </Link>
                </li>
                <li className="mb-3">
                  <Link to="/terms-of-use" className="hover:underline">
                    Warunki oraz Regulamin
                  </Link>
                </li>
                <li className="mb-3">
                  <Link to="/faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-300 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 Odnowa Kanapowa. Wszystkie prawa zastrzeżone.</span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a href="https://www.facebook.com/profile.php?id=61572996153015&sk=about" target="_blank" className="text-gray-500 hover:opacity-70 transition-all duration-100 ease-in-out">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Facebook page</span>
            </a>
            <a
              href="https://www.instagram.com/odnowakanapowa?fbclid=IwY2xjawJvhutleHRuA2FlbQIxMAABHvuwlOWvyF-zj5dv7bLg1ubeX75_ZkBwM2XdC7lBbGXn9Ab5qdAdQCQzq7jk_aem_WljfwiuhPHHsVLrSLp1O3A"
              target="_blank"
              className="text-gray-500 hover:opacity-70 transition-all duration-100 ease-in-out ms-5"
            >
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                <path
                  d="M11.6184625 0.16H4.3815375C2.05108125 0.16249375 0.16249375 2.05108125 0.16 4.3815375v7.236925c0.00249375 2.33045625 1.89108125 4.21904375 4.2215375 4.2215375h7.236925c2.33045625 -0.00249375 4.21904375 -1.89108125 4.2215375 -4.2215375V4.3815375c-0.00249375 -2.33045625 -1.89108125 -4.21904375 -4.2215375 -4.2215375ZM8 11.6184625c-2.78549375 0.000125 -4.5264 -3.01518125 -3.1337625 -5.42755625 1.39264375 -2.41236875 4.87450625 -2.412525 6.2673625 -0.000275 0.3176375 0.55010625 0.4848625 1.17414375 0.4848625 1.80936875 -0.00208125 1.9975625 -1.6209 3.61638125 -3.6184625 3.6184625Zm4.523075 -7.236925c-0.69636875 0.00003125 -1.1316 -0.75379375 -0.7834375 -1.3568875 0.34815625 -0.60309375 1.218625 -0.60313125 1.5668375 -0.00006875 0.0794125 0.137525 0.12121875 0.29353125 0.12121875 0.45234375 0 0.4995875 -0.405025 0.90459375 -0.90461875 0.9046125ZM10.41230625 8c0 1.85699375 -2.01025625 3.01761875 -3.6184625 2.08911875 -1.6082 -0.9285 -1.6082 -3.24974375 0 -4.1782375 0.36671875 -0.211725 0.78270625 -0.3231875 1.20615625 -0.3231875 1.33228125 0 2.41230625 1.080025 2.41230625 2.41230625Z"
                  strokeWidth="0.0625"
                ></path>
              </svg>
              <span className="sr-only">Instagram page</span>
            </a>
            <a
              href="https://www.olx.pl/d/oferta/profesjonalne-pranie-tapicerki-swiezosc-w-kazdym-wloknie-CID4371-ID154nxO.html"
              target="_blank"
              className="text-gray-500 hover:opacity-70 transition-all duration-100 ease-in-out ms-5"
            >
              <img src={olxLogo} alt="Olx logo" className="w-5.5 h-4" aria-hidden="true" />
              <span className="sr-only">Olx page</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
