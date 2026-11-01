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
  if (!limiter || typeof limiter.limit !== "function") return true;
  const result = await limiter.limit({ key });
  return result?.success === true;
}

// Return a small, cache-proof response when a client exceeds its traffic budget.\nfunction rateLimitedResponse() {
  return withSecurityHeaders(new Response(JSON.stringify({
    detail: "Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.",
  }), {
    status: 429,
    headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "60" },
  }), { noStore: true });
}

// Fail closed if the Cloudflare limiter itself cannot be reached.\nfunction rateLimitUnavailableResponse() {
  return withSecurityHeaders(new Response(JSON.stringify({
    detail: "La protección de solicitudes no está disponible temporalmente.",
  }), {
    status: 503,
    headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "30" },
  }), { noStore: true });
}

// Keep private routes and missing resources from revealing application details.\nfunction notFound() {
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

// Reject all admin entry guesses before the public SPA fallback can run.\nfunction isPublicAdminPath(pathname) {
  // Paths are checked case-insensitively so /ADMIN, /Admin/Login, etc.
  // are blocked just like their lowercase equivalents.
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

    // Keep API calls on the backend. Admin API operations must still enforce
    // valid server-side admin sessions and roles; hiding UI paths is not auth.
    if (pathname.startsWith("/api/")) {
      // The public Worker never proxies administrative API routes; those belong to the admin host.
      if (pathname.startsWith("/api/v1/admin/")) {
        return withSecurityHeaders(notFound(), { noStore: true, noIndex: true });
      }
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const isAdminCredentialAction = /^\/api\/v1\/admin\/auth\/(login|recover)$/i.test(pathname);
      const isCustomerAuthAction = /^\/api\/v1\/auth\//i.test(pathname);

      try {
        // One per-IP ceiling protects the API from burst traffic across all routes.
        if (!(await allowRequest(env, "API_RATE_LIMITER", ip))) return rateLimitedResponse();
        // Authentication and admin recovery use tighter per-IP ceilings.
        if (isCustomerAuthAction && !(await allowRequest(env, "AUTH_RATE_LIMITER", ip))) return rateLimitedResponse();
        if (isAdminCredentialAction && !(await allowRequest(env, "ADMIN_AUTH_RATE_LIMITER", ip))) return rateLimitedResponse();
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

    // Public guesses such as /admin, /admin/login and /login never reach SPA.
    if (isPublicAdminPath(pathname)) {
      return withSecurityHeaders(notFound(), { noStore: true, noIndex: true });
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};
