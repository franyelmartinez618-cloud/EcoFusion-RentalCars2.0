# EcoFusion RentalCars – full-stack foundation

This package separates the real authentication layer, the business backend and the React UI so the application can grow without replacing the frontend.

## Why Google was failing / now changed

The previous implementation depended on a popup. The current implementation uses Firebase `signInWithRedirect()` and explicitly consumes `getRedirectResult()` when the browser returns. This avoids popup-blocker failures and surfaces Firebase errors such as `auth/unauthorized-domain`.

A real Google login still requires your own Firebase project configuration. Copy `frontend/.env.local.example` to `frontend/.env.local`, enable Google in Firebase Authentication, and add your local hostname to Authorized Domains. Projects created after April 28, 2025 may not include localhost automatically.

## Real authentication architecture

Customer Google / Email + password / Phone-SMS sign-in is handled by Firebase Authentication. The Firebase ID token is verified by FastAPI and exchanged for an HttpOnly application session. The administrator panel uses a separate local username/password account provisioned from the backend console; customer Firebase/email identities cannot grant themselves the admin role.

## Separate administrator access

The administrator no longer signs in through Google or the customer email/password flow. After the backend database is configured, run `python setup_admin.py` from the `backend` directory. Choose a unique username and a long password (14+ characters). The command displays a high-entropy recovery code once; keep it offline in a password manager or another secure location. The web UI never emails or stores this code in plain text. To perform a recovery online, the username and current recovery code are required; recovery rotates the code and invalidates active admin sessions. From a trusted server console, `python setup_admin.py --reset` is the fallback if both are lost.

Admin login attempts are throttled, repeated credential failures trigger temporary lockouts, the database stores password/recovery hashes rather than raw secrets, and admin sessions have a shorter lifetime. These measures supplement—not replace—HTTPS, database access controls, secret management and deployment-level rate limiting.

## Business backend

The API contains typed endpoints for vehicles, customer reservations, availability, payments, invoices, Square Checkout, Persona identity verification and signed webhooks. SQLAlchemy uses bound parameters for database operations.

`EcoFusion-production-setup.sql` is the single authoritative production database file. It creates the 27-table MySQL schema used by EcoFusion and includes the California starter fleet. The FastAPI runtime currently maps the core runtime tables it actively queries; the remaining tables are reserved for the rental lifecycle, fleet inspections, billing and audit domains.

## Payments

The client calls `/api/v1/account/reservations/{reservation_id}/checkout`. FastAPI creates a Square-hosted payment link using the server-side access token. The browser is never given the Square secret. Square payment webhooks update the payment and confirm the reservation after a completed payment.

## Identity verification

`/api/v1/account/identity/start` creates a Persona inquiry / one-time link when Persona credentials are configured. Persona webhooks are accepted only after HMAC signature verification.

## Local setup (Windows)

1. Create `backend/.env` from `.env.example` and set `MYSQL_URL` to your XAMPP MySQL database. 2. Create `frontend/.env.local` from `.env.local.example` and add your Firebase Web App settings for customer sign-in. 3. Run `start-dev.bat`. 4. In a separate PowerShell window, run `cd backend` and `python setup_admin.py` to create the private administrator username/password and one-time recovery code. Customers still require real Firebase authentication and backend synchronization.

## Production checklist

- Use MySQL 8+ and run `backend/sql/schema.sql`.
- Put secrets only in `backend/.env` / your secret manager.
- Use HTTPS and a real production domain.
- Authorize only your production domains in Firebase.
- Enable Firebase App Check before enforcing it for Authentication.
- Configure Square webhook signing and test `payment.created` / `payment.updated`.
- Configure Persona webhook signing and test approval/review/decline paths.
- Production is already configured for Railway MySQL via `MYSQL_URL`.
