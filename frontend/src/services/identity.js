const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function csrf() {
  return document.cookie.split("; ").find((x) => x.startsWith("ef_csrf="))?.split("=")[1] || "";
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const identityApi = {
  status: () => request("/identity/status"),
  start: () => request("/identity/start", { method: "POST", headers: { "X-CSRF-Token": csrf() } }),
};
