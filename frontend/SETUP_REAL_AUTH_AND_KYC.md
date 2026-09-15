# EcoFusion — autenticación, identidad y seguridad real

## 1. Firebase Authentication

Create a Firebase project and enable:
- Google
- Email/Password
- Phone

Add `localhost` for local development when Firebase requires an authorized domain. Put the Web App values into `frontend/.env` using `.env.example`.

The backend must also receive a Firebase Admin service-account credential through `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON`. Never put that service account credential in Vite/React.

## 2. Identity verification

Create a Persona production or sandbox inquiry template configured for the checks you require (government ID + selfie/liveness are supported by Persona). Set the backend variables:

```
PERSONA_API_KEY=...
PERSONA_INQUIRY_TEMPLATE_ID=itmpl_...
PERSONA_WEBHOOK_SECRET=wbhsec_...
```

When an authenticated client clicks **Verify identity**, FastAPI creates a unique Persona inquiry for that user and opens a one-time verification link. Persona hosts the capture flow; the EcoFusion database stores only the verification status/provider reference in this integration.

Configure Persona to send inquiry outcome webhooks to:

```
POST https://YOUR_API_HOST/api/v1/webhooks/persona
```

The endpoint verifies the Persona HMAC signature and ignores duplicate event IDs.

## 3. Production security

Set:

```
ENVIRONMENT=production
FRONTEND_ORIGIN=https://your-domain.example
TRUSTED_HOSTS=your-domain.example,api.your-domain.example
```

Serve everything over HTTPS, put FastAPI behind a reverse proxy/WAF, rotate secrets, back up the database, enable monitoring, and migrate the auth database from SQLite to MySQL/PostgreSQL before running multiple API instances.

## 4. What “anti-hack” means here

No application can honestly be promised as 100% unhackable. This baseline removes several common classes of mistakes: client-side-only authorization, plaintext app passwords, unparameterized SQL, unverified identity webhooks, unrestricted CORS, long-lived browser session IDs, and missing CSRF protection for mutating authenticated requests.

## 5. Frontend language

Language state is global in `AppContext`, persisted in localStorage, and also propagated to Firebase Auth. Auth/account/admin strings added in this iteration use the same translation source so the UI changes together instead of button-by-button.
