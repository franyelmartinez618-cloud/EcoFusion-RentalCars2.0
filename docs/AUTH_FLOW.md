# EcoFusion authentication flow

1. Unauthenticated users see **Sign in** in the navbar; mobile also shows **Register**.
2. Sign-in uses a single user gesture for Google popup and prevents duplicate Google launches.
3. Firebase identity is exchanged once per UID with FastAPI; concurrent duplicate exchanges share the same promise.
4. New Google/phone users or users flagged by the backend with `privacyRequired` go to `/complete-account`.
5. Email registration sends Firebase verification email and then asks the user to sign in.
6. Client account exposes **Sign out** and provider status.
7. Google profile photo is used when Firebase provides `photoURL`; otherwise initials are shown.
8. Sensitive provider linking is only possible from an authenticated account using Firebase's provider-linking flow.
9. Production welcome-email delivery requires a configured transactional email provider; the UI never claims that a welcome email was sent when one is not configured.


## Administrator authentication (separate from customers)

- `/admin/login` uses an independent username/password credential stored as PBKDF2-SHA256 hashes in `admin_credentials`; it does not render Google or customer email login.
- Provision the first admin from a trusted backend shell with `python setup_admin.py`. A high-entropy recovery code is printed once and must be stored offline.
- Recovery requires the username plus the current recovery code and a new 14+ character password. A successful recovery rotates the recovery code and revokes active admin sessions.
- Login/recovery endpoints have process-level IP throttling; credential records also lock after repeated failures. Use HTTPS and edge rate limiting in production.
- The legacy `ADMIN_EMAILS` role grant is removed, and `current_session` rejects legacy admin users unless they have a dedicated local admin credential.
