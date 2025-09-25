import { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import { API_BASE_URL } from "../config/api";
import { parseResponse } from "../utils/parseResponse";
// Removed local data imports - now using API data with categorization

interface SelectedService {
  id: number;
  name: string;
  price: string;
  quantity: number;
}

const Booking = () => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [comment, setComment] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [apiServices, setApiServices] = useState<any[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);

  // Handle scroll to show/hide gradients
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Show top gradient when scrolled down from top
    setShowTopGradient(scrollTop > 10);

    // Show bottom gradient when not at bottom
    setShowBottomGradient(scrollTop < scrollHeight - clientHeight - 10);
  };

  // Get user and token from localStorage safely
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { safeParseJSON } = require("../utils/safeParseJSON");
  const user = safeParseJSON(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Fetch services from API
  const fetchServicesFromAPI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services`);
      if (response.ok) {
        const services = await parseResponse(response);
        console.log("✅ Loaded services from API:", services.length, "services");
        console.log("API Services IDs:", services.map((s: any) => `${s.id}: ${s.name}`).join(", "));
        setApiServices(services);
        setServicesLoaded(true);
      } else {
        console.error("❌ Failed to fetch services from API, status:", response.status);
        setServicesLoaded(true); // Still set to true to use fallback
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServicesLoaded(true); // Still set to true to use fallback
    }
  };

  // Use API services if loaded, otherwise fallback to local data
  const allServices =
    servicesLoaded && apiServices.length > 0
      ? apiServices.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          description: service.description,
          quantity: 0, // Will be managed by selectedServices state
        }))
      : []; // Force empty array until API loads to prevent using wrong IDs

  useEffect(() => {
    fetchServicesFromAPI();
  }, []);

  // Categorize services from API based on service names
  const categorizeServices = (services: any[]) => {
    const furniture = services.filter((service) =>
      ["Kanapa", "Narożnik mały szezlong", "Narożnik duży L", "Narożnik duży U", "Fotel mały", "Fotel duży", "Krzesło tapicerowane", "Puf podnóżek", "Poduszka tapicerowana"].includes(service.name)
    );

    const mattress = services.filter((service) => ["Materac pojedynczy", "Materac podwójny"].includes(service.name));

    const vehicle = services.filter((service) => ["Fotele samochodowe", "Dywanik tekstylny", "Podłoga samochodu", "Bonetowanie podsufitki"].includes(service.name));

    const other = services.filter((service) => ["Usuwanie plam", "Usuwanie nieprzyjemnych zapachów", "Osuszanie"].includes(service.name));

    return { furniture, mattress, vehicle, other };
  };

  // Filter services based on search term
  const categorizedServices = categorizeServices(allServices);
  const filteredServices = {
    furniture: categorizedServices.furniture.filter(
      (service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()) || (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    mattress: categorizedServices.mattress.filter(
      (service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()) || (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    vehicle: categorizedServices.vehicle.filter(
      (service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()) || (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    other: categorizedServices.other.filter(
      (service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()) || (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  };

  useEffect(() => {
    fetchOccupiedDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/available-times/${date}`);
      if (response.ok) {
        const data = await parseResponse(response);
        setAvailableSlots(data.availableTimes || []);
        setSelectedTime(""); // Reset selected time when date changes
      }
    } catch (err) {
      console.error("Error fetching available slots:", err);
    }
  };

  const fetchOccupiedDates = async () => {
    try {
      // Fetch occupied dates for the next 3 months
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const response = await fetch(`${API_BASE_URL}/api/appointments/occupied-dates?endDate=${endDate.toISOString().split("T")[0]}`);
      if (response.ok) {
        const data = await parseResponse(response);
        setOccupiedDates(data.occupiedDates || []);
      }
    } catch (err) {
      console.error("Error fetching occupied dates:", err);
    }
  };

  const handleServiceAdd = (serviceId: number) => {
    const service = allServices.find((s) => s.id === serviceId);
    if (!service) return;

    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.id === serviceId);
      if (existing) {
        return prev.map((s) => (s.id === serviceId ? { ...s, quantity: s.quantity + 1 } : s));
      } else {
        return [
          ...prev,
          {
            id: service.id,
            name: service.name,
            price: service.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleServiceRemove = (serviceId: number) => {
    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.id === serviceId);
      if (!existing) return prev;

      if (existing.quantity > 1) {
        return prev.map((s) => (s.id === serviceId ? { ...s, quantity: s.quantity - 1 } : s));
      } else {
        return prev.filter((s) => s.id !== serviceId);
      }
    });
  };

  const getServiceQuantity = (serviceId: number) => {
    const service = selectedServices.find((s) => s.id === serviceId);
    return service ? service.quantity : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for guest users
    if (isGuest) {
      if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone) {
        setMessage("Proszę wypełnić wszystkie pola z danymi osobowymi");
        return;
      }
    } else if (!user) {
      setMessage("Musisz być zalogowany lub kontynuować jako gość");
      return;
    }

    if (selectedServices.length === 0) {
      setMessage("Proszę wybrać przynajmniej jedną usługę");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setMessage("Proszę wybrać datę i godzinę");
      return;
    }

    // Debug logging
    console.log("Selected services before sending:", selectedServices);

    const appointmentData = isGuest
      ? {
          date: selectedDate,
          time: selectedTime,
          services: selectedServices.map((s) => ({ id: s.id, quantity: s.quantity })),
          comment: comment.trim() || null,
          guestName: `${guestData.firstName} ${guestData.lastName}`,
          guestEmail: guestData.email,
          guestPhone: guestData.phone,
        }
      : {
          date: selectedDate,
          time: selectedTime,
          services: selectedServices.map((s) => ({ id: s.id, quantity: s.quantity })),
          comment: comment.trim() || null,
        };

    // Debug logging
    console.log("Appointment data being sent:", appointmentData);

    try {
      const endpoint = isGuest ? `${API_BASE_URL}/api/appointments/guest` : `${API_BASE_URL}/api/appointments`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (!isGuest && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        setMessage("Wizyta została pomyślnie umówiona! Otrzymasz email z potwierdzeniem.");
        setSelectedServices([]);
        setSelectedDate("");
        setSelectedTime("");
        setComment("");
        setAvailableSlots([]);
        if (isGuest) {
          setGuestData({ firstName: "", lastName: "", email: "", phone: "" });
        }
      } else {
        const errorData = await parseResponse(response);
        setMessage(errorData.message || errorData.error || "Błąd podczas umawiania wizyty");
      }
    } catch (err) {
      console.error("Error submitting appointment:", err);
      setMessage("Błąd serwera. Spróbuj ponownie.");
    }
  };

  const getTotalPrice = () => {
    // Prices are strings like "od 200 zł", so we extract numbers
    return selectedServices.reduce((total, service) => {
      const priceMatch = service.price.match(/\d+/);
      const price = priceMatch ? parseInt(priceMatch[0]) : 0;
      return total + price * service.quantity;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-white py-12 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Umów wizytę</h1>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {message && (
              <div className={`px-4 py-3 rounded ${message.includes("pomyślnie") ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Guest/Login Options - Show only if not logged in and not continuing as guest */}
            {!user && !isGuest && (
              <div className="text-center pt-6 pb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Zaloguj się lub kontynuuj jako gość</h2>
                <div className="flex justify-center gap-4">
                  <a
                    href="/login"
                    className="cursor-pointer group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-blue-dark)] hover:bg-[var(--color-blue-dark-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Zaloguj się
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsGuest(true)}
                    className="cursor-pointer group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Kontynuuj jako gość
                  </button>
                </div>
              </div>
            )}

            {/* Services Selection - Show only if logged in or continuing as guest */}
            {(user || isGuest) && (
              <div>
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Wybierz usługi</h2>
                    <div className="flex-1 max-w-sm ml-4">
                      <input
                        type="text"
                        placeholder="Wyszukaj usługę..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="max-h-96 overflow-y-auto pr-2" onScroll={handleScroll}>
                      {/* Furniture Section */}
                      {filteredServices.furniture.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-md font-medium text-gray-700 mb-4">Meble tapicerowane</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.furniture.map((service) => (
                              <div key={`furniture-${service.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 flex flex-col items-center text-center h-full justify-between">
                                  <div className="flex-grow flex flex-col justify-center">
                                    <h4 className="font-medium text-gray-900 mb-3">{service.name}</h4>
                                    <span className="font-medium text-[var(--color-blue-dark)] mb-4">{service.price}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => handleServiceRemove(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50"
                                      disabled={getServiceQuantity(service.id) === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-medium">{getServiceQuantity(service.id)}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleServiceAdd(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mattress Section */}
                      {filteredServices.mattress.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-md font-medium text-gray-700 mb-4">Materace</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.mattress.map((service) => (
                              <div key={`mattress-${service.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 flex flex-col items-center text-center h-full justify-between">
                                  <div className="flex-grow flex flex-col justify-center">
                                    <h4 className="font-medium text-gray-900 mb-3">{service.name}</h4>
                                    <span className="font-medium text-[var(--color-blue-dark)] mb-4">{service.price}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => handleServiceRemove(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50"
                                      disabled={getServiceQuantity(service.id) === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-medium">{getServiceQuantity(service.id)}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleServiceAdd(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vehicle Section */}
                      {filteredServices.vehicle.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-md font-medium text-gray-700 mb-4">Samochody</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.vehicle.map((service) => (
                              <div key={`vehicle-${service.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 flex flex-col items-center text-center h-full justify-between">
                                  <div className="flex-grow flex flex-col justify-center">
                                    <h4 className="font-medium text-gray-900 mb-3">{service.name}</h4>
                                    <span className="font-medium text-[var(--color-blue-dark)] mb-4">{service.price}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => handleServiceRemove(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50"
                                      disabled={getServiceQuantity(service.id) === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-medium">{getServiceQuantity(service.id)}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleServiceAdd(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Services Section */}
                      {filteredServices.other.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-md font-medium text-gray-700 mb-4">Inne usługi</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.other.map((service) => (
                              <div key={`other-${service.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 flex flex-col items-center text-center h-full justify-between">
                                  <div className="flex-grow flex flex-col justify-center">
                                    <h4 className="font-medium text-gray-900 mb-3">{service.name}</h4>
                                    <span className="font-medium text-[var(--color-blue-dark)] mb-4">{service.price}</span>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => handleServiceRemove(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50"
                                      disabled={getServiceQuantity(service.id) === 0}
                                    >
                                      -
                                    </button>
                                    <span className="w-8 text-center font-medium">{getServiceQuantity(service.id)}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleServiceAdd(service.id)}
                                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fade out gradient at top of scroll area */}
                    {showTopGradient && <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>}

                    {/* Fade out gradient at bottom of scroll area */}
                    {showBottomGradient && <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>}
                  </div>
                </div>
                {/* End of scroll area */}
                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Wybrane usługi</h3>
                    <div className="space-y-3">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-900">{service.name}</span>
                            <span className="text-gray-600 ml-2">x{service.quantity}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-gray-900">
                              {(() => {
                                const priceMatch = service.price.match(/\d+/);
                                const price = priceMatch ? parseInt(priceMatch[0]) : 0;
                                return `${price * service.quantity} zł`;
                              })()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Suma całkowita:</span>
                        <span className="text-lg font-bold text-gray-900">{getTotalPrice()} zł</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Date Selection - Show only if logged in or continuing as guest */}
            {(user || isGuest) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Wybierz datę</label>
                  <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} occupiedDates={occupiedDates} />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Wybierz godzinę
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              selectedTime === slot ? "bg-gray-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">Brak dostępnych terminów w wybranym dniu.</p>
                    )}
                  </div>
                )}

                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                    Dodatkowe informacje (opcjonalnie)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Opisz swoje potrzeby lub dodatkowe informacje..."
                  />
                </div>
              </>
            )}

            {/* Guest Contact Form - Show only if continuing as guest */}
            {isGuest && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Dane kontaktowe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="guestFirstName" className="block text-sm font-medium text-gray-700">
                      Imię *
                    </label>
                    <input
                      type="text"
                      id="guestFirstName"
                      value={guestData.firstName}
                      onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guestLastName" className="block text-sm font-medium text-gray-700">
                      Nazwisko *
                    </label>
                    <input
                      type="text"
                      id="guestLastName"
                      value={guestData.lastName}
                      onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="guestEmail"
                      value={guestData.email}
                      onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700">
                      Numer telefonu *
                    </label>
                    <input
                      type="tel"
                      id="guestPhone"
                      value={guestData.phone}
                      onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button - Show only if logged in or continuing as guest */}
            {(user || isGuest) && (
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={selectedServices.length === 0 || !selectedDate || !selectedTime}
                  className="flex cursor-pointer justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Umów wizytę
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
