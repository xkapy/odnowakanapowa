import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import Calendar from "../components/Calendar";

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  description?: string;
  isGuest?: boolean;
  user: {
    id: number | null;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  services: Array<{
    id?: number;
    name: string;
    price: string;
    quantity: number;
  }>;
}

export default function Admin() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingAppointment, setDeletingAppointment] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [appointmentToRestore, setAppointmentToRestore] = useState<number | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    time: "",
    services: [] as Array<{ id?: number; name: string; price: string; quantity: number }>,
  });
  const [availableServices, setAvailableServices] = useState<Array<{ id: number; name: string; price: string }>>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [originalServices, setOriginalServices] = useState<Array<{ id?: number; name: string; price: string; quantity: number }>>([]);

  useEffect(() => {
    checkAdminAccess();
    fetchAppointments();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/check`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        navigate("/");
        return;
      }
    } catch (err) {
      console.error("Admin check error:", err);
      navigate("/");
    }
  };

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Admin appointments response:", data);
        console.log("Is array?", Array.isArray(data));

        // Sprawdź czy data jest tablicą, jeśli nie to weź appointments z obiektu
        if (Array.isArray(data)) {
          console.log("Setting appointments from array:", data);
          setAppointments(data);
          // Extract occupied dates
          const occupied = data.map((apt: any) => format(new Date(apt.date), "yyyy-MM-dd")).filter((date: string, index: number, self: string[]) => self.indexOf(date) === index);
          setOccupiedDates(occupied);
        } else if (data.appointments && Array.isArray(data.appointments)) {
          console.log("Setting appointments from object.appointments:", data.appointments);
          setAppointments(data.appointments);
          // Extract occupied dates
          const occupied = data.appointments.map((apt: any) => format(new Date(apt.date), "yyyy-MM-dd")).filter((date: string, index: number, self: string[]) => self.indexOf(date) === index);
          setOccupiedDates(occupied);
        } else {
          console.log("No valid appointments data found:", data);
          setAppointments([]);
          setOccupiedDates([]);
          setError("Nieprawidłowy format danych");
        }
      } else {
        setError("Nie udało się pobrać wizyt");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/services`);
      if (response.ok) {
        const data = await response.json();
        setAvailableServices(data.services || []);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  // Filter services based on search term
  const filteredServices = availableServices.filter((service) => service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()));

  const removeService = (indexToRemove: number) => {
    // Usuń usługę po indeksie
    setEditFormData({
      ...editFormData,
      services: editFormData.services.filter((_, index) => index !== indexToRemove),
    });
  };

  // Funkcja do zmiany ilości usługi
  const updateServiceQuantity = (serviceId: number | undefined, newQuantity: number) => {
    if (newQuantity < 1) return; // Nie pozwól na ilość mniejszą niż 1

    setEditFormData({
      ...editFormData,
      services: editFormData.services.map((service) => (service.id === serviceId ? { ...service, quantity: newQuantity } : service)),
    });
  };

  const fetchAvailableTimeSlots = async (date: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/available/${date}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTimeSlots(data.availableSlots || []);
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setAvailableTimeSlots([]);
    }
  };

  const startEditingAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment.id);
    const services = appointment.services || [];
    setEditFormData({
      date: appointment.date,
      time: appointment.time,
      services: services,
    });
    setOriginalServices(services); // Zapisz oryginalne usługi
    fetchServices();
    fetchAvailableTimeSlots(appointment.date);
  };

  const cancelEditing = () => {
    setEditingAppointment(null);
    setEditFormData({ date: "", time: "", services: [] });
    setOriginalServices([]); // Wyczyść oryginalne usługi
  };

  const saveAppointmentEdit = async () => {
    if (!editingAppointment) return;

    console.log("Saving appointment with data:", editFormData);
    console.log("Original services:", originalServices);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${editingAppointment}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: editFormData.date,
          time: editFormData.time,
          services: editFormData.services,
        }),
      });

      if (response.ok) {
        setSuccess("Wizyta została zaktualizowana");
        fetchAppointments();
        cancelEditing();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Nie udało się zaktualizować wizyty");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  const showRestoreDialog = (appointmentId: number) => {
    setAppointmentToRestore(appointmentId);
    setShowRestoreConfirm(true);
  };

  const cancelRestore = () => {
    setShowRestoreConfirm(false);
    setAppointmentToRestore(null);
  };

  const confirmRestore = async () => {
    if (appointmentToRestore) {
      setShowRestoreConfirm(false);
      await updateAppointmentStatus(appointmentToRestore, "pending");
      setAppointmentToRestore(null);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Update the appointment status in the local state
        setAppointments((prev) => prev.map((appointment) => (appointment.id === appointmentId ? { ...appointment, status: status as "pending" | "confirmed" | "cancelled" } : appointment)));
        setSuccess("Status wizyty został zaktualizowany");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Nie udało się zaktualizować statusu wizyty");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  const showDeleteDialog = (appointmentId: number) => {
    setAppointmentToDelete(appointmentId);
    setShowDeleteConfirm(true);
  };

  const hideDeleteDialog = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  const confirmDelete = async () => {
    if (appointmentToDelete) {
      setShowDeleteConfirm(false);
      await performDelete(appointmentToDelete);
      setAppointmentToDelete(null);
    }
  };

  const performDelete = async (appointmentId: number) => {
    console.log("Performing delete for appointment ID:", appointmentId);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");
    setDeletingAppointment(appointmentId);
    console.log("Starting delete request for appointment:", appointmentId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Delete success:", result);
        // Remove the appointment from the local state
        setAppointments((prev) => prev.filter((appointment) => appointment.id !== appointmentId));
        setSuccess("Wizyta została usunięta");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.text();
        console.log("Delete error response:", errorData);
        setError("Nie udało się usunąć wizyty");
      }
    } catch (err) {
      console.error("Delete request failed:", err);
      setError("Błąd połączenia z serwerem");
    } finally {
      setDeletingAppointment(null);
      console.log("Delete operation finished");
    }
  };

  const deleteAppointment = async (appointmentId: number) => {
    console.log("Delete appointment called with ID:", appointmentId);
    showDeleteDialog(appointmentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Oczekująca";
      case "confirmed":
        return "Potwierdzona";
      case "cancelled":
        return "Anulowana";
      default:
        return "Nieznany";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel Administratora</h1>
          <p className="text-gray-600 mt-2">Zarządzaj wizytami klientów</p>
        </div>

        {error && <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {success && <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Wizyty ({appointments.length})</h2>
          </div>

          {appointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Brak wizyt do wyświetlenia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data i godzina</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usługi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments && appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.user?.firstName || "Brak"} {appointment.user?.lastName || "danych"}
                              {Boolean(appointment.isGuest) && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Gość</span>}
                            </div>
                            <div className="text-sm text-gray-500">{appointment.user?.email || "Brak emaila"}</div>
                            {Boolean(appointment.isGuest) && appointment.user?.phone && appointment.user?.phone !== "" && <div className="text-sm text-gray-500">{appointment.user.phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(appointment.date).toLocaleDateString("pl-PL", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {appointment.services && appointment.services.length > 0 ? (
                              appointment.services.map((service, index) => (
                                <div key={index} className="mb-1">
                                  {service.quantity > 1 ? `${service.quantity}x ` : ""}
                                  {service.name} - {service.price}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500">Brak usług</div>
                            )}
                          </div>
                          {appointment.description && (
                            <div className="text-sm text-gray-500 mt-2">
                              <strong>Opis:</strong> {appointment.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>{getStatusText(appointment.status)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {appointment.status === "pending" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingAppointment(appointment)}
                                className="text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 border-1 border-blue-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Edytuj
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                                className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Potwierdź
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                className="text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 border-1 border-gray-400 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Anuluj
                              </button>
                              <button
                                onClick={() => deleteAppointment(appointment.id)}
                                disabled={deletingAppointment === appointment.id}
                                className={`text-sm px-2 py-1 rounded-md transition-colors ${
                                  deletingAppointment === appointment.id
                                    ? "text-gray-400 bg-gray-100 border-1 border-gray-200 cursor-not-allowed"
                                    : "text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 cursor-pointer"
                                }`}
                              >
                                {deletingAppointment === appointment.id ? "Usuwanie..." : "Usuń"}
                              </button>
                            </div>
                          )}
                          {appointment.status === "confirmed" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingAppointment(appointment)}
                                className="text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 border-1 border-blue-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Edytuj
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                                className="text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 border-1 border-gray-400 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Anuluj
                              </button>
                              <button
                                onClick={() => deleteAppointment(appointment.id)}
                                disabled={deletingAppointment === appointment.id}
                                className={`text-sm px-2 py-1 rounded-md transition-colors ${
                                  deletingAppointment === appointment.id
                                    ? "text-gray-400 bg-gray-100 border-1 border-gray-200 cursor-not-allowed"
                                    : "text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 cursor-pointer"
                                }`}
                              >
                                {deletingAppointment === appointment.id ? "Usuwanie..." : "Usuń"}
                              </button>
                            </div>
                          )}
                          {appointment.status === "cancelled" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => showRestoreDialog(appointment.id)}
                                className="text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 border-1 border-blue-400 hover:border-blue-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              >
                                Przywróć
                              </button>
                              <button
                                onClick={() => deleteAppointment(appointment.id)}
                                disabled={deletingAppointment === appointment.id}
                                className={`text-sm px-2 py-1 rounded-md transition-colors cursor-pointer ${
                                  deletingAppointment === appointment.id
                                    ? "text-gray-400 bg-gray-100 border-1 border-gray-200 cursor-not-allowed"
                                    : "text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300"
                                }`}
                              >
                                {deletingAppointment === appointment.id ? "Usuwanie..." : "Usuń"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Brak wizyt do wyświetlenia
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-white/80 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg border border-gray-300 max-w-md w-mx">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Potwierdzenie przywracania wizyty</h3>
            <p className="text-sm text-gray-700 mb-6">Czy na pewno chcesz przywrócić tę wizytę? Zostanie ona ustawiona jako oczekująca na potwierdzenie.</p>
            <div className="flex space-x-3 justify-end">
              <button onClick={cancelRestore} className="cursor-pointer px-3 py-1 border-1 border-gray-400 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                Anuluj
              </button>
              <button
                onClick={confirmRestore}
                className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-3 py-1 rounded-md transition-colors cursor-pointer"
              >
                Zatwierdź
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edytuj wizytę</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Calendar and Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wybierz datę</label>
                <div>
                  <Calendar
                    selectedDate={editFormData.date}
                    onDateSelect={(date) => {
                      setEditFormData({ ...editFormData, date, time: "" });
                      fetchAvailableTimeSlots(date);
                    }}
                    occupiedDates={occupiedDates}
                    showLegend={false} // Admin nie potrzebuje legendy
                  />
                </div>

                {/* Time Selection under Calendar */}
                {editFormData.date && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setEditFormData({ ...editFormData, time: slot })}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                            editFormData.time === slot ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!editFormData.date && <p className="text-sm text-gray-500 mt-4">Najpierw wybierz datę</p>}
              </div>

              {/* Right Column - Services */}
              <div className="space-y-4">
                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usługi</label>

                  {/* Selected Services */}
                  {editFormData.services.length > 0 && (
                    <div className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Wybrane usługi:</h4>
                      <div className="space-y-2">
                        {editFormData.services.map((service, index) => {
                          const isOriginalService = originalServices.some((s) => s.id === service.id);
                          return (
                            <div key={service.id || index} className="flex items-center justify-between bg-white px-3 py-2 rounded text-sm">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {service.name} - {service.price}
                                </div>
                                {isOriginalService && <div className="text-xs text-blue-600">Oryginalna usługa</div>}
                              </div>

                              {/* Quantity controls */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateServiceQuantity(service.id, (service.quantity || 1) - 1)}
                                  disabled={!service.quantity || service.quantity <= 1}
                                  className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <span className="min-w-[20px] text-center font-medium">{service.quantity || 1}</span>
                                <button
                                  onClick={() => updateServiceQuantity(service.id, (service.quantity || 1) + 1)}
                                  className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer flex items-center justify-center text-xs"
                                >
                                  +
                                </button>

                                {/* Remove button - dla wszystkich usług */}
                                <button
                                  onClick={() => removeService(index)}
                                  className="ml-2 text-red-500 hover:text-red-700 w-6 h-6 rounded-full hover:bg-red-50 cursor-pointer flex items-center justify-center"
                                  title="Usuń usługę"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Services */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dostępne usługi:</h4>

                    {/* Search Input */}
                    <input
                      type="text"
                      placeholder="Wyszukaj usługę..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    {/* Services List with larger scrollview */}
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => {
                              if (!editFormData.services.some((s) => s.id === service.id)) {
                                setEditFormData({
                                  ...editFormData,
                                  services: [...editFormData.services, { id: service.id, name: service.name, price: service.price, quantity: 1 }],
                                });
                              }
                            }}
                            disabled={editFormData.services.some((s) => s.id === service.id)}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                              editFormData.services.some((s) => s.id === service.id) ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"
                            }`}
                          >
                            <div className="font-medium">{service.name}</div>
                            <div className="text-gray-500">{service.price}</div>
                          </button>
                        ))
                      ) : serviceSearchTerm ? (
                        <p className="text-sm text-gray-500 p-2">Nie znaleziono usług pasujących do "{serviceSearchTerm}"</p>
                      ) : availableServices.length === 0 ? (
                        <p className="text-sm text-gray-500 p-2">Ładowanie usług...</p>
                      ) : (
                        <p className="text-sm text-gray-500 p-2">Brak dostępnych usług</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 justify-end mt-6 pt-4 border-t border-gray-200">
              <button onClick={cancelEditing} className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                Anuluj
              </button>
              <button
                onClick={saveAppointmentEdit}
                disabled={!editFormData.date || !editFormData.time || editFormData.services.length === 0}
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/80 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-5 border border-gray-300 w-96 rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Potwierdzenie usunięcia wizyty</h3>
              <p className="text-sm text-gray-700 mb-6">Czy na pewno chcesz usunąć tę wizytę? Ta akcja jest nieodwracalna.</p>
              <div className="flex justify-center space-x-4">
                <button onClick={hideDeleteDialog} className="border-1 border-gray-400 cursor-pointer px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                  Anuluj
                </button>
                <button onClick={confirmDelete} className="text-sm px-3 py-1 rounded-md transition-colors text-red-800 bg-red-200 hover:bg-red-300 border-1 border-red-400 cursor-pointer">
                  Usuń
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
