const BACKEND_ORIGIN = "https://ecofusion-rentalcars2-0.onrender.com";
const ADMIN_PATH_SETTING = "ADMIN_ENTRY_PATH";

// ADMIN_ENTRY_PATH must be configured as a Cloudflare Worker secret/variable,
// for example: /<a-cryptographically-random-token>. It must never be committed
// to this public repository. The browser only receives it on private admin pages.
function getAdminEntryPath(env) {
  const value = typeof env?.[ADMIN_PATH_SETTING] === "string"
    ? env[ADMIN_PATH_SETTING].trim()
    : "";

  return /^\/[A-Za-z0-9_-]{24,128}$/.test(value) ? value : "";
}

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

function isPublicAdminPath(pathname) {
  return pathname === "/admin"
    || pathname.startsWith("/admin/")
    || pathname === "/login"
    || pathname.startsWith("/login/");
}

async function servePrivateAdminAsset(request, env, adminEntryPath) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const bootstrap = `<script>window.__ECOFUSION_ADMIN_BASE__=${JSON.stringify(adminEntryPath)};</script>`;
  const updatedHtml = /<head[^>]*>/i.test(html)
    ? html.replace(/<head([^>]*)>/i, `<head$1>${bootstrap}`)
    : `${bootstrap}${html}`;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.delete("Content-Length");

  return new Response(updatedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const adminEntryPath = getAdminEntryPath(env);

    // Keep API calls on the backend. Admin API operations must still enforce
    // valid server-side admin sessions and roles; hiding UI paths is not auth.
    if (pathname.startsWith("/api/")) {
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

      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set("Cache-Control", "no-store");
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    }

    // Public guesses such as /admin, /admin/login and /login never reach SPA.
    if (isPublicAdminPath(pathname)) {
      return notFound();
    }

    // The secret entry point is only enabled once configured in Cloudflare.
    // Until then, all admin UI access fails closed.
    if (!adminEntryPath) {
      return notFound();
    }

    const isPrivateAdminRequest = pathname === adminEntryPath
      || pathname === `${adminEntryPath}/panel`;

    if (isPrivateAdminRequest) {
      return servePrivateAdminAsset(request, env, adminEntryPath);
    }

    return env.ASSETS.fetch(request);
  },
};
