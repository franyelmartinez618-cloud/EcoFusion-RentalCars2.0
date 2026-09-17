import { appCheck } from "./firebase";
import { getToken } from "firebase/app-check";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function csrf() {
  return document.cookie.split("; ").find((v) => v.startsWith("ef_csrf="))?.split("=")[1] || "";
}

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-Token"] = csrf();
  if (appCheck) {
    try {
      const token = await getToken(appCheck, false);
      if (token?.token) headers["X-Firebase-AppCheck"] = token.token;
    } catch {
      // Optional until App Check enforcement is enabled.
    }
  }
  const response = await fetch(`${API}${path}`, { credentials: "include", ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const apiClient = {
  me: () => api("/auth/me"),
  health: () => api("/health"),
  vehicles: () => api("/vehicles"),
  myReservations: () => api("/account/reservations"),
  myPayments: () => api("/account/payments"),
  createReservation: (payload) => api("/account/reservations", { method: "POST", body: JSON.stringify(payload) }),
  checkout: (reservationId) => api(`/account/reservations/${encodeURIComponent(reservationId)}/checkout`, { method: "POST" }),
  identityStart: () => api("/account/identity/start", { method: "POST", body: JSON.stringify({}) }),
  adminVehicles: () => api("/vehicles"),
  adminReservations: () => api("/admin/reservations"),
  adminPayments: () => api("/admin/payments"),
  adminCustomers: () => api("/admin/customers"),
  adminInvoices: () => api("/admin/invoices"),
  adminCreateVehicle: (payload) => api("/admin/vehicles", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateVehicle: (id, payload) => api(`/admin/vehicles/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }),
  adminDeleteVehicle: (id) => api(`/admin/vehicles/${encodeURIComponent(id)}`, { method: "DELETE" }),
  updateProfile: (name, phone="") => api("/auth/profile", { method: "PATCH", body: JSON.stringify({ name, phone }) }),
  consent: (payload) => api("/auth/consent", { method: "POST", body: JSON.stringify(payload) }),
  security: () => api("/admin/security"),
};
