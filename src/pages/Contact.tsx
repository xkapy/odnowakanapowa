import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuFileText, LuMailOpen, LuMessagesSquare, LuCopy } from "react-icons/lu";
import { Link } from "react-router-dom";

const Contact = () => {
  const [errors, setErrors] = useState<{ email?: string; phone?: string; general?: string }>({});
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const firstName = formData.get("hs-firstname-contacts-1") as string;
    const lastName = formData.get("hs-lastname-contacts-1") as string;
    const email = formData.get("hs-email-contacts-1") as string;
    const phone = formData.get("hs-phone-number-1") as string;
    const message = formData.get("hs-about-contacts-1") as string;

    let validationErrors: typeof errors = {};

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
      setErrors({ general: "Wypełnij wszystkie pola." });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      validationErrors.email = "Wprowadź poprawny adres e-mail.";
      setErrors(validationErrors);
      return;
    }

    if (phone?.trim()) {
      if (!/^(?:\+\d{1,3} \d{9}|\+\d{1,3}\s?\d{3}\s?\d{3}\s?\d{3}|\+\d{1,3} \d{3} \d{3} \d{3}|\d{9}|\d{3} \d{3} \d{3})$/.test(phone.trim())) {
        validationErrors.phone = "Wprowadź poprawny numer telefonu.";
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("https://formspree.io/f/xnndqyed", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        setPopupMessage("Wiadomość została wysłana!");
        form.reset();
        setTimeout(() => setPopupMessage(""), 3000);
      } else {
        setPopupMessage("Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.");
        setTimeout(() => setPopupMessage(""), 3000);
      }
    } catch (error) {
      setPopupMessage("Wystąpił błąd. Spróbuj ponownie później.");
      setTimeout(() => setPopupMessage(""), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText("odnowakanapowa@gmail.com")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Błąd kopiowania:", err));
  };

  return (
    <div className="max-w-6xl px-4 min-h-screen sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="max-w-2xl lg:max-w-5xl mx-auto pt-30 not-lg:pt-40 not-lg:pb-30">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">Skontaktuj się z nami</h1>
          <p className="mt-1 text-gray-500 text-md">Chętnie porozmawiamy o tym, jak możemy Ci pomóc.</p>
        </div>

        <div className="mt-12 grid items-center lg:grid-cols-2 gap-6 lg:gap-16">
          <div className="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8">
            <h2 className="mb-8 text-xl font-semibold text-gray-800">Dane kontaktowe</h2>

            <form onSubmit={handleSubmit} action="https://formspree.io/f/xdkgovqd" method="POST">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hs-firstname-contacts-1" className="sr-only">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="hs-firstname-contacts-1"
                      id="hs-firstname-contacts-1"
                      className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                      placeholder="Imię"
                    />
                  </div>

                  <div>
                    <label htmlFor="hs-lastname-contacts-1" className="sr-only">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="hs-lastname-contacts-1"
                      id="hs-lastname-contacts-1"
                      className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                      placeholder="Nazwisko"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hs-email-contacts-1" className="sr-only">
                    Email
                  </label>
                  <input
                    type="text"
                    name="hs-email-contacts-1"
                    id="hs-email-contacts-1"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className={`py-2.5 sm:py-3 px-4 block w-full border rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="hs-phone-number-1" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="hs-phone-number-1"
                    id="hs-phone-number-1"
                    className={`py-2.5 sm:py-3 px-4 block w-full border rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none pr-10 ${
                      errors.phone ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Numer telefonu"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <span className="relative flex h-5 w-5 cursor-default items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs font-bold select-none group">
                      ?
                      <div className="absolute bottom-full left-1/2 mb-2 w-max max-w-xs -translate-x-1/2 rounded-md bg-gray-200 px-2 py-1 text-xs font-normal text-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                        To pole nie jest wymagane
                      </div>
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="hs-about-contacts-1" className="sr-only">
                    Details
                  </label>
                  <textarea
                    id="hs-about-contacts-1"
                    name="hs-about-contacts-1"
                    rows={4}
                    className="py-2.5 sm:py-3 px-4 block w-full border border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                    placeholder="Wiadomość"
                  ></textarea>
                  {errors.general && <div className="mt-4 text-sm text-red-600">{errors.general}</div>}
                </div>
              </div>

              <div className="mt-4 grid">
                <button
                  type="submit"
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent cursor-pointer bg-[var(--color-blue-dark)] text-white hover:bg-[var(--color-blue-dark-hover)] transition duration-200 ease-in-out focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Wyślij
                </button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500">Odezwiemy się do ciebie w przeciągu 1-2 dni roboczych.</p>
              </div>
            </form>
          </div>

          <div className="divide-y divide-gray-200">
            <div className="flex gap-x-7 py-6">
              <div className="flex justify-center w-8 shrink-0 size-6 mt-1">
                <LuMessagesSquare size={24} />
              </div>
              <div className="grow">
                <h3 className="font-semibold text-gray-800">FAQ</h3>
                <p className="mt-1 text-sm text-gray-500">Przejrzyj nasze FAQ, aby znaleźć odpowiedzi na pytania.</p>
                <Link to="/FAQ" className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-hidden focus:text-gray-800">
                  Sprawdź FAQ <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="flex gap-x-7 py-6">
              <div className="flex justify-center w-8 shrink-0 size-6 mt-1">
                <LuFileText size={24} />
              </div>
              <div className="grow">
                <h3 className="font-semibold text-gray-800">Regulamin</h3>
                <p className="mt-1 text-sm text-gray-500">Zapoznaj się z zasadami korzystania naszego serwisu.</p>
                <Link to="/terms-of-use" className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-hidden focus:text-gray-800">
                  Zobacz regulamin <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className=" flex gap-x-7 py-6">
              <div className="flex justify-center w-8 shrink-0 size-6 mt-1">
                <LuMailOpen size={24} />
              </div>
              <div className="grow">
                <h3 className="font-semibold text-gray-800">Skontaktuj się przez email</h3>
                <p className="mt-1 text-sm text-gray-500">Jeśli wolisz napisać do nas email, użyj proszę:</p>
                <div className="mt-2 inline-flex items-center gap-x-2">
                  <a className="text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-hidden focus:text-gray-800" href="mailto:odnowakanapowa@gmail.com">
                    odnowakanapowa@gmail.com
                  </a>
                  <LuCopy size={14} style={{ cursor: "pointer", color: "#4a5565", strokeWidth: "2.5px" }} onClick={handleCopy} />
                  <p className="text-sm text-green-600">
                    <AnimatePresence>
                      {copied && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: 0 }} className="text-sm text-green-600">
                          Skopiowano!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {popupMessage && (
          <motion.div
            className="fixed bottom-0 right-0 mb-6 mr-6 p-4 bg-gray-50 border border-gray-200 rounded-lg w-80 z-50 text-green-700 text-sm flex justify-center"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            {popupMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
