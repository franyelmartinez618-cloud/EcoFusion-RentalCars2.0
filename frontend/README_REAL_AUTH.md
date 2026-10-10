# EcoFusion — real authentication (Firebase + FastAPI)

This build uses Firebase Authentication for customer identity and FastAPI for the application session and role authorization. The administrator console uses a separate local username/password credential and recovery code.

## Sign-in methods
- Email/password with email verification.
- Google OAuth.
- Phone number + SMS verification code + reCAPTCHA.

## Important security model
The browser never decides whether someone is an admin. For customers, Firebase proves identity and FastAPI verifies the Firebase ID token. Admin access is provisioned only from a trusted backend console, uses PBKDF2-SHA256 password/recovery hashes in the database, has lockouts and a shorter session lifetime, and does not use Google or the customer email login. The database never stores the administrator password or recovery code in plain text. Admin recovery rotates the code and revokes active admin sessions.

## Firebase setup
1. Create a Firebase project.
2. Add a Web App and copy its config into `.env` (using `.env.example` as the template).
3. Authentication → Sign-in method: enable Email/Password and Google.
4. For SMS: enable Phone, configure allowed SMS regions, and add the production domain to Authorized domains.
5. Authentication → Settings → Authorized domains: add the domain where the app will run. `localhost` is fine for most web auth development, but Firebase does not allow `localhost` as a hosted domain for the Phone provider; use a deployed HTTPS domain for real SMS testing.
6. Create a Firebase service account (Project Settings → Service accounts) and save the JSON outside the repository. Point `FIREBASE_SERVICE_ACCOUNT_PATH` at it.
7. After the backend database is configured, run `python setup_admin.py` from the `backend` directory. Save the one-time recovery code somewhere offline. Do not provision an administrator by adding a Firebase email or role.

## Run on Windows
From this folder:

```text
npm install
```

Create `.env` from `.env.example` and fill the Firebase web config.

In a second terminal:

```text
cd backend
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
set FIREBASE_SERVICE_ACCOUNT_PATH=C:\full\path\to\firebase-service-account.json
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Then, from the frontend folder:

```text
npm run dev
```

## Test the real flows
- `/register` → create an email account, verify the email, then sign in.
- Google button → real Google account selector.
- Phone button → real SMS code (requires an authorized deployed domain for phone auth).
- `/admin` → redirects to `/admin/login`; sign in with the separate admin username/password created by `python setup_admin.py`. Customer Firebase identities cannot receive administrator privileges.
- Logout revokes the server session.

## Production
Use HTTPS, a secret manager for server credentials, a real domain in CORS/Authorized Domains, rate limiting at the edge, and a managed production database instead of local SQLite. Restrict shell access to the backend because the trusted-console admin setup/reset command can provision administrator credentials. Firebase App Check can also be enabled with Identity Platform for additional abuse protection.

## Identity verification
The customer account includes a real identity-verification boundary using Persona Hosted Flow. The backend creates a unique inquiry for the authenticated customer and returns a one-time verification link; Persona can collect government ID and selfie/liveness checks according to your configured inquiry template. Persona documents recommend API-created unique hosted links for production, and webhook signatures should be verified before accepting status changes. See `SECURITY_PRODUCTION.md`.
