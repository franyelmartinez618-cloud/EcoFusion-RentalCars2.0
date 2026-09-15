# EcoFusion security baseline

This package implements a real authentication boundary (Firebase identity -> FastAPI session) and a real identity-verification integration boundary (Persona). It is not possible to honestly promise an "unhackable" application. The goal is defense-in-depth and to avoid placing security decisions in React.

## Security controls implemented
- Firebase ID tokens are verified server-side with revocation checks.
- Admin/client roles are decided server-side.
- Session identifiers are random, HttpOnly cookies with expiration and revocation.
- Mutating authenticated requests require a server-issued CSRF token.
- Login/token-exchange attempts are rate-limited.
- SQL statements use parameterized bindings; do not concatenate user input into SQL.
- Trusted Host and strict CORS configuration.
- Basic browser security headers and API no-store caching.
- Persona webhooks require a timestamped HMAC signature and duplicate-event idempotency.
- Identity provider secrets are backend environment variables only.
- Raw identity documents are not stored in EcoFusion by this integration; Persona processes them.

## Required production steps
1. Use HTTPS and set `ENVIRONMENT=production`.
2. Set `TRUSTED_HOSTS` to only your production hosts.
3. Set `FRONTEND_ORIGIN` to your exact frontend origin.
4. Configure Firebase providers and authorized domains.
5. Create a Persona production inquiry template and set `PERSONA_API_KEY`, `PERSONA_INQUIRY_TEMPLATE_ID`, and `PERSONA_WEBHOOK_SECRET`.
6. Configure Persona webhooks for inquiry approved/declined/review events.
7. Put the API behind a reverse proxy/WAF and centralized logs/monitoring.
8. Replace SQLite with MySQL/PostgreSQL before multi-instance production deployment.
9. Add backup, secret rotation, audit retention, dependency scanning, and incident response procedures.
