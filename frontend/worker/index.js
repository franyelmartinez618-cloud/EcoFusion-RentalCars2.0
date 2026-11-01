const BACKEND_ORIGIN = "https://ecofusion-rentalcars2-0.onrender.com";

// Add browser-side protections without changing cache headers for fingerprinted assets.
function withSecurityHeaders(response, { noStore = false, noIndex = false } = {}) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Content-Security-Policy", "frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
  if (noStore) headers.set("Cache-Control", "no-store");
  if (noIndex) headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Ask Cloudflare's edge limiter before forwarding requests to the application server.
async function allowRequest(env, bindingName, key) {
  const limiter = env[bindingName];
  if (!limiter || typeof limiter.limit !== "function") throw new Error("Missing rate limit binding: " + bindingName);
  const result = await limiter.limit({ key });
  return result?.success === true;
}

// Return a small, cache-proof response when a client exceeds its traffic budget.
function rateLimitedResponse() {
  return withSecurityHeaders(new Response(JSON.stringify({
    detail: "Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.",
  }), {
    status: 429,
    headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "60" },
  }), { noStore: true });
}

// Hash limit keys so session tokens and administrator names are never stored in clear text.
async function digestRateKey(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

// Use the HTTP-only session after login; anonymous traffic falls back to the edge IP.
async function getRequestRateKey(request) {
  const cookie = request.headers.get("Cookie") || "";
  const sessionCookie = cookie.split(";").map(part => part.trim()).find(part => part.toLowerCase().startsWith("ef_session="));
  const session = sessionCookie ? sessionCookie.slice("ef_session=".length) : "";
    ? `session:${session}`
    : `ip:${request.headers.get("CF-Connecting-IP") || "unknown"}`;
  return digestRateKey(identity);
}

// Keep repeated administrator credential attempts distinct without exposing the account name.
async function getAdminCredentialKey(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const payload = await request.clone().json().catch(() => ({}));
  const username = String(payload?.username || "unknown").trim().toLowerCase().slice(0, 64) || "unknown";
  return { ip, usernameKey: await digestRateKey(`${ip}:${username}`) };
}

function rateLimitUnavailableResponse() {
  return withSecurityHeaders(new Response(JSON.stringify({
    detail: "La protección de solicitudes no está disponible temporalmente.",
  }), {
    status: 503,
    headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "30" },
  }), { noStore: true });
}

// Keep private routes and missing resources from revealing application details.
function notFound() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

// Reject all admin entry guesses before the public SPA fallback can run.
function isPublicAdminPath(pathname) {
  // Paths are checked case-insensitively so /ADMIN, /Admin/Login, etc. are blocked.
  const path = pathname.toLowerCase();
  return path === "/admin"
    || path.startsWith("/admin/")
    || path === "/admin.html"
    || path.startsWith("/admin.")
    || path === "/login"
    || path.startsWith("/login/");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Keep API calls on the backend; server-side session and role guards remain authoritative.
    if (pathname.startsWith("/api/")) {
      // The public Worker never proxies administrative API routes.
      if (pathname.startsWith("/api/v1/admin/")) {
        return withSecurityHeaders(notFound(), { noStore: true, noIndex: true });
      }
      const rateKey = await getRequestRateKey(request);
      const isCustomerAuthAction = pathname.startsWith("/api/v1/auth/");

      try {
        if (!(await allowRequest(env, "API_RATE_LIMITER", rateKey))) return rateLimitedResponse();
        if (isCustomerAuthAction && !(await allowRequest(env, "AUTH_RATE_LIMITER", rateKey))) return rateLimitedResponse();
      } catch {
        return rateLimitUnavailableResponse();
      }

      const target = new URL(pathname + url.search, BACKEND_ORIGIN);
      const headers = new Headers(request.headers);
      headers.set("X-Forwarded-Host", url.host);
      headers.set("X-Forwarded-Proto", "https");

      const upstream = await fetch(new Request(target, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "manual",
      }));
      return withSecurityHeaders(upstream, { noStore: true });
    }

    // Public guesses such as /admin and /login never reach the SPA fallback.
    if (isPublicAdminPath(pathname)) {
      return withSecurityHeaders(notFound(), { noStore: true, noIndex: true });
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
