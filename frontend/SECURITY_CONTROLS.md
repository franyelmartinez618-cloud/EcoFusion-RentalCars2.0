# FRANKEY Rentals Car — security controls

This document records the controls currently implemented in the public and administrator Workers. It is an operational record, not a claim that the service is impossible to attack.

## Public website

- Production browser API calls use the same origin (/api/v1) so requests pass through the public Cloudflare Worker.
- The public Worker rejects /admin, /admin.html, /login and all /api/v1/admin/* paths.
- The Worker sets browser security headers, disables caching for API responses, and adds noindex to blocked private paths.
- Cloudflare rate-limit bindings apply a shared API ceiling of 120 requests per IP per 60-second window and a 20-per-minute limit to customer authentication routes.

## Separate administrator portal

- The admin application is a separate Vite entry (admin.html) and a separate Worker configured by wrangler.admin.jsonc.
- Its Worker hostname is frankey-rentals-admin.ecofusionrentalcars.workers.dev.
- The admin Worker serves only the admin entry, its assets and an allowlist of admin/session API routes. It does not proxy customer API routes.
- Admin login and recovery are limited to 12 attempts per IP and 5 attempts per IP/account name per 60-second window. The admin and public Workers share the admin-auth and general API rate-limit namespaces.
- The admin site sends X-Robots-Tag: noindex, nofollow; this is an indexing instruction, not an authentication mechanism.
- Access to admin data must continue to be checked by backend session and role guards. The separate URL and hidden UI are not substitutes for server authorization.

## Limits and remaining hardening

Cloudflare Workers Rate Limiting bindings are approximate and local to each Cloudflare location. Counters are eventually consistent, so traffic can temporarily exceed the configured threshold; this is not a strict worldwide quota. The current IP key can also combine people who share a network address. A strict global limit would require a centralized limiter such as Durable Objects or a server-side shared store.

These limits protect traffic routed through the Workers. The Render origin is still a separately addressable service; origin-only access restriction or a private Worker-to-origin authentication secret has not been configured here. Do not describe the API as inaccessible directly until that additional control is deployed.

Cloudflare Turnstile has not been enabled in this change because a site key and server-side secret must be provisioned for this account. Do not claim CAPTCHA verification is active until those credentials are installed and verified.

## Operational expectations

- Keep ef_session HTTP-only and Secure in production and continue enforcing CSRF checks on state-changing requests.
- Keep administrator passwords and recovery codes out of the frontend, source control and support messages.
- Review 429 responses and Worker logs after deployment. Adjust thresholds only after checking legitimate traffic patterns.
- Validate the public site and admin portal independently after every Cloudflare deployment.