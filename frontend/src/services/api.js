import { appCheck } from "./firebase";
import { getToken } from "firebase/app-check";

const API = import.meta.env.PROD ? "/api/v1" : (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1");

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
  if (!response.ok) {
    const detail = data?.detail;
    const detailMessage = typeof detail === "string" ? detail : detail?.message;
    const code = detail?.code || data?.code || "";
    const internalDetail = /sql|database|mysql|sqlite|postgres|traceback|exception|stack|internal server|not configured|connection|constraint|table|column|firebase|square|persona|webhook|redis|backend|api/i;
    const message = response.status >= 500 || (detailMessage && internalDetail.test(detailMessage))
      ? "No pudimos completar la operación. Inténtalo de nuevo más tarde."
      : response.status === 429
        ? "Has realizado demasiadas solicitudes. Espera un momento y vuelve a intentarlo."
        : response.status === 401
          ? "Tu sesión no está activa. Inicia sesión para continuar."
          : response.status === 403
            ? "No tienes permiso para realizar esta acción."
            : response.status === 404
              ? "No encontramos el recurso solicitado."
              : code === "REGISTRATION_REQUIRED" && detailMessage
                ? detailMessage
                : detailMessage || "No se pudo completar la solicitud.";
    const error = new Error(message);
    error.status = response.status;
    error.code = code;
    error.data = typeof detail === "object" ? detail : data;
    throw error;
  }
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
  identityStatus: () => api("/account/identity"),
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
