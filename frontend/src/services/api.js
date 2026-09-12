const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        let detail = "Request failed";
        try {
            const data = await response.json();
            detail = data.detail || detail;
        } catch {
            // Keep the generic error when the server doesn't return JSON.
        }
        throw new Error(detail);
    }

    if (response.status === 204) return null;
    return response.json();
}

export const api = {
    listVehicles: () => request("/vehicles"),
    getVehicle: (slug) => request(`/vehicles/${encodeURIComponent(slug)}`),
    searchAvailability: (params) => request(`/availability?${new URLSearchParams(params)}`),
    createReservation: (payload) => request("/reservations", { method: "POST", body: JSON.stringify(payload) }),
    getAdminVehicles: () => request("/admin/vehicles"),
    updateAdminVehicle: (id, payload) => request(`/admin/vehicles/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteAdminVehicle: (id) => request(`/admin/vehicles/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export { API_BASE_URL };
