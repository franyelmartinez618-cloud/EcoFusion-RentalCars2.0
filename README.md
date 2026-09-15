# EcoFusion RentalCars – full-stack foundation

This package separates the real authentication layer, the business backend and the React UI so the application can grow without replacing the frontend.

## Why Google was failing / now changed

The previous implementation depended on a popup. The current implementation uses Firebase `signInWithRedirect()` and explicitly consumes `getRedirectResult()` when the browser returns. This avoids popup-blocker failures and surfaces Firebase errors such as `auth/unauthorized-domain`.

A real Google login still requires your own Firebase project configuration. Copy `frontend/.env.local.example` to `frontend/.env.local`, enable Google in Firebase Authentication, and add your local hostname to Authorized Domains. Projects created after April 28, 2025 may not include localhost automatically.

## Real authentication architecture

Google / Email + password / Phone-SMS are handled by Firebase Authentication. The Firebase ID token is verified by the FastAPI backend using the Firebase Admin SDK. FastAPI then creates an application session in an HttpOnly cookie and applies the `admin`/`client` role server-side.

## Business backend

The API contains typed endpoints for vehicles, customer reservations, availability, payments, invoices, Square Checkout, Persona identity verification and signed webhooks. SQLAlchemy uses bound parameters for database operations.

`backend/sql/schema.sql` contains the complete 69-table domain contract used by the frontend planning layer. The core runtime tables are fully typed; extension tables begin with a JSON data column so the contract exists without pretending that every future reporting column is already final.

## Payments

The client calls `/api/v1/account/reservations/{reservation_id}/checkout`. FastAPI creates a Square-hosted payment link using the server-side access token. The browser is never given the Square secret. Square payment webhooks update the payment and confirm the reservation after a completed payment.

## Identity verification

`/api/v1/account/identity/start` creates a Persona inquiry / one-time link when Persona credentials are configured. Persona webhooks are accepted only after HMAC signature verification.

## Local setup (Windows)

1. Create `backend/.env` from `.env.example` and set `MYSQL_URL` to your XAMPP MySQL database. 2. Create `frontend/.env.local` from `.env.local.example` and add your Firebase Web App settings. 3. Run `start-dev.bat`. The app will not fabricate client accounts; customers appear only after real Firebase authentication and backend synchronization.

## Production checklist

- Use MySQL 8+ and run `backend/sql/schema.sql`.
- Put secrets only in `backend/.env` / your secret manager.
- Use HTTPS and a real production domain.
- Authorize only your production domains in Firebase.
- Enable Firebase App Check before enforcing it for Authentication.
- Configure Square webhook signing and test `payment.created` / `payment.updated`.
- Configure Persona webhook signing and test approval/review/decline paths.
- Replace development SQLite with MySQL before production.
