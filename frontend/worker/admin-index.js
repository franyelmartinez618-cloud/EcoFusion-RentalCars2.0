const BACKEND_ORIGIN = "https://ecofusion-rentalcars2-0.onrender.com";

// Apply the same browser security headers to admin HTML, assets and API responses.
function secureResponse(response, { noStore = false } = {}) {
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    headers.set("Content-Security-Policy", "frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
    headers.set("X-Robots-Tag", "noindex, nofollow");
    if (noStore) headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Cloudflare edge limits slow repeated API and credential attempts before they reach Render.
async function allowRequest(env, bindingName, key) {
    const limiter = env[bindingName];
    if (!limiter || typeof limiter.limit !== "function") throw new Error("Missing rate limit binding: " + bindingName);
    const result = await limiter.limit({ key });
    return result?.success === true;
}

// Keep credential brute-force responses small and non-cacheable.\n// Reuse the HTTP-only server session for authenticated traffic; anonymous requests use the edge IP.
function getRequestRateKey(request) {
    const cookie = request.headers.get("Cookie") || "";
    const session = cookie.match(/(?:^|;\s*)ef_session=([^;]+)/i)?.[1];
    if (session) return `session:${session}`;
    return `ip:${request.headers.get("CF-Connecting-IP") || "unknown"}`;
}

// Separate administrator login attempts by both source IP and account name.
async function getAdminCredentialKey(request) {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const payload = await request.clone().json().catch(() => ({}));
    const username = String(payload?.username || "unknown").trim().toLowerCase().slice(0, 120) || "unknown";
    return { ip, username };
}

// Return a small response when the admin traffic budget is exceeded.
function rateLimitResponse() {
    return secureResponse(new Response(JSON.stringify({
        detail: "Demasiadas solicitudes. Espera un momento y vuelve a intentarlo.",
    }), {
        status: 429,
        headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "60" },
    }), { noStore: true });
}

// Route the admin hostname to the admin HTML entry while keeping assets and APIs separate.
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        if (pathname.startsWith("/api/")) {
            // The admin Worker may call admin endpoints and read/clear its own server session only.
            const isAdminRoute = pathname.startsWith("/api/v1/admin/");
            const isAdminSessionRoute = pathname === "/api/v1/auth/me" || pathname === "/api/v1/auth/logout";
            if (!isAdminRoute && !isAdminSessionRoute) {
                return secureResponse(new Response("Not Found", { status: 404 }), { noStore: true });
            }
            const ip = request.headers.get("CF-Connecting-IP") || "unknown";
            const rateKey = getRequestRateKey(request);
            try {
                if (!(await allowRequest(env, "ADMIN_API_LIMITER", rateKey))) return rateLimitResponse();

                const isCredentialAction = /^\/api\/v1\/admin\/auth\/(login|recover)$/i.test(pathname);
                if (isCredentialAction) {
                    const identity = await getAdminCredentialKey(request);
                    if (!(await allowRequest(env, "ADMIN_IP_LIMITER", identity.ip))) return rateLimitResponse();
                    if (!(await allowRequest(env, "ADMIN_LOGIN_LIMITER", identity.ip + ":" + identity.username))) return rateLimitResponse();
                }
            } catch {
                return secureResponse(new Response(JSON.stringify({
                    detail: "La protección de solicitudes no está disponible temporalmente.",
                }), {
                    status: 503,
                    headers: { "Content-Type": "application/json; charset=utf-8", "Retry-After": "30" },
                }), { noStore: true });
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
            return secureResponse(upstream, { noStore: true });
        }

        // The public app's index.html is never exposed on this separate admin host.
        const assetPath = pathname === "/" || pathname === "/index.html" || !/\.[a-z0-9]+$/i.test(pathname)
            ? "/admin.html"
            : pathname;
        const assetUrl = new URL(request.url);
        assetUrl.pathname = assetPath;
        const assetRequest = new Request(assetUrl.toString(), request);
        const response = await env.ASSETS.fetch(assetRequest);
        return secureResponse(response, { noStore: assetPath === "/admin.html" });
    },
};
