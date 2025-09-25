import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";
import { Link } from "react-router-dom";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  services: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  description?: string;
  status: string;
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchUserData(token);
    fetchAppointments(token);
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setError("Błąd pobierania danych użytkownika");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  const fetchAppointments = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure we have a valid appointments array
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (field: string) => {
    if (user) {
      setEditingField(field);
      setEditValues({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
      });
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValues({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
  };

  const saveField = async (field: string) => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    setUpdateLoading(true);
    try {
      const updateData: any = {};
      if (field === "firstName") updateData.firstName = editValues.firstName;
      if (field === "lastName") updateData.lastName = editValues.lastName;
      if (field === "email") updateData.email = editValues.email;
      if (field === "phone") updateData.phone = editValues.phone;

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user);

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser.user));

        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event("authChange"));

        setEditingField(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Błąd podczas aktualizacji");
      }
    } catch (err) {
      setError("Błąd serwera");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const togglePasswordChange = () => {
    setShowPasswordChange(!showPasswordChange);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
  };

  const changePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Nowe hasła nie są identyczne");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Nowe hasło musi mieć co najmniej 6 znaków");
      return;
    }

    setPasswordLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setError("");
        alert("Hasło zostało pomyślnie zmienione!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Błąd podczas zmiany hasła");
      }
    } catch (err) {
      setError("Błąd serwera");
    } finally {
      setPasswordLoading(false);
    }
  };

  const showDeleteDialog = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    await performDelete();
  };

  const performDelete = async () => {
    console.log("performDelete function called");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return;
    }

    setDeleteLoading(true);
    setError("");
    console.log("Starting deletion process...");

    try {
      console.log("Making DELETE request to backend...");
      const response = await fetch(`${API_BASE_URL}/api/user/delete-profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        console.log("Profile deleted successfully");
        alert("Profil został pomyślnie usunięty");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        console.log("Error data:", errorData);
        setError(errorData.error || "Błąd podczas usuwania profilu");
      }
    } catch (err) {
      console.log("Catch error:", err);
      setError("Błąd serwera");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Oczekuje";
      case "confirmed":
        return "Potwierdzona";
      case "completed":
        return "Zakończona";
      case "cancelled":
        return "Anulowana";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Mój profil</h1>
              <button onClick={handleLogout} className="cursor-pointer px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800">
                Wyloguj się
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informacje osobiste</h2>
                {user && (
                  <div className="space-y-4">
                    {/* First Name */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Imię:</span>
                      <div className="flex items-center mt-1">
                        {editingField === "firstName" ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="text"
                              value={editValues.firstName}
                              onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => saveField("firstName")}
                              disabled={updateLoading}
                              className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Zapisz
                            </button>
                            <button onClick={cancelEditing} className="text-sm text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 px-2 py-1 rounded-md transition-colors cursor-pointer">
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900">{user.firstName}</p>
                            <button onClick={() => startEditing("firstName")} className="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                              Edytuj
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Nazwisko:</span>
                      <div className="flex items-center mt-1">
                        {editingField === "lastName" ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="text"
                              value={editValues.lastName}
                              onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => saveField("lastName")}
                              disabled={updateLoading}
                              className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Zapisz
                            </button>
                            <button onClick={cancelEditing} className="text-sm text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 px-2 py-1 rounded-md transition-colors cursor-pointer">
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900">{user.lastName}</p>
                            <button onClick={() => startEditing("lastName")} className="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                              Edytuj
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <div className="flex items-center mt-1">
                        {editingField === "email" ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="email"
                              value={editValues.email}
                              onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => saveField("email")}
                              disabled={updateLoading}
                              className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Zapisz
                            </button>
                            <button onClick={cancelEditing} className="text-sm text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 px-2 py-1 rounded-md transition-colors cursor-pointer">
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900">{user.email}</p>
                            <button onClick={() => startEditing("email")} className="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                              Edytuj
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Telefon:</span>
                      <div className="flex items-center mt-1">
                        {editingField === "phone" ? (
                          <div className="flex items-center space-x-2 w-full">
                            <input
                              type="tel"
                              value={editValues.phone}
                              onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                              placeholder="Wprowadź numer telefonu"
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => saveField("phone")}
                              disabled={updateLoading}
                              className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-2 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Zapisz
                            </button>
                            <button onClick={cancelEditing} className="text-sm text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 px-2 py-1 rounded-md transition-colors cursor-pointer">
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-900">{user.phone || "Nie podano numeru telefonu"}</p>
                            <button onClick={() => startEditing("phone")} className="cursor-pointer px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                              Edytuj
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex space-x-3 mb-3">
                        <button
                          onClick={togglePasswordChange}
                          className="cursor-pointer text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Zmień hasło
                        </button>
                        <button
                          onClick={() => {
                            console.log("Delete button clicked, deleteLoading:", deleteLoading);
                            showDeleteDialog();
                          }}
                          disabled={deleteLoading}
                          className="cursor-pointer text-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deleteLoading ? "Usuwam..." : "Usuń profil"}
                        </button>
                      </div>

                      {showPasswordChange && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                          <h3 className="text-md font-medium text-gray-900 mb-3">Zmiana hasła</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Aktualne hasło</label>
                              <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Nowe hasło</label>
                              <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Powtórz nowe hasło</label>
                              <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={changePassword}
                                disabled={passwordLoading}
                                className="text-sm text-green-600 bg-green-100 hover:bg-green-200 border-1 border-green-400 hover:border-green-300 px-3 py-2 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {passwordLoading ? "Zmieniam..." : "Zmień hasło"}
                              </button>
                              <button
                                onClick={togglePasswordChange}
                                className="text-sm text-red-600 bg-red-100 hover:bg-red-200 border-1 border-red-300 px-3 py-2 rounded-md transition-colors cursor-pointer"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delete Confirmation Dialog */}
                      {showDeleteConfirm && (
                        <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
                          <h3 className="text-md font-medium text-red-900 mb-3">Potwierdzenie usunięcia profilu</h3>
                          <p className="text-sm text-red-700 mb-4">Czy na pewno chcesz usunąć swój profil? Ta akcja jest nieodwracalna i spowoduje usunięcie wszystkich Twoich danych i wizyt.</p>
                          <div className="flex space-x-3">
                            <button
                              onClick={confirmDelete}
                              disabled={deleteLoading}
                              className="cursor-pointer px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleteLoading ? "Usuwam..." : "TAK, usuń profil"}
                            </button>
                            <button onClick={cancelDelete} className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">
                              Anuluj
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Szybkie akcje</h2>
                <div className="space-y-3">
                  <Link to="/booking" className="inline-block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700">
                    Umów nową wizytę
                  </Link>
                  {user?.role === "admin" && (
                    <Link to="/admin" className="inline-block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ml-3">
                      Panel administratora
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Historia wizyt</h2>

            {appointments && appointments.length === 0 ? (
              <p className="text-gray-500">Nie masz jeszcze żadnych wizyt.</p>
            ) : (
              <div className="space-y-4">
                {appointments &&
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              {appointment.date} o {appointment.time}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>{getStatusText(appointment.status)}</span>
                          </div>
                          {appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Usługi:</p>
                              {appointment.services.map((service, index) => (
                                <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2 mt-1">
                                  {service.quantity > 1 ? `${service.quantity}x ` : ""}
                                  {service.name} - {service.price}
                                </span>
                              ))}
                            </div>
                          )}
                          {appointment.description && <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>}
                          <p className="text-xs text-gray-500 mt-2">Utworzona: {new Date(appointment.createdAt).toLocaleString("pl-PL")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
