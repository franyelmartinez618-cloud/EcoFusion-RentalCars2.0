# Google Authentication – why the button can appear to do nothing

The application now uses Firebase `signInWithRedirect()` for Google instead of relying only on a popup. This is more resilient to popup blockers and mobile browsers. Firebase restores the identity after Google redirects back to the app, and the app exchanges the Firebase ID token with FastAPI for the secure HttpOnly application session.

## Required Firebase configuration

Copy `.env.local.example` to `.env.local` and fill the Web App values from Firebase Console > Project settings > Your apps > Web app.

Then in Firebase Console > Authentication:

1. Enable Google under Sign-in providers.
2. Add `localhost` to Authorized domains for local development if it is not already present. Firebase notes that projects created after April 28, 2025 may not include localhost by default.
3. Confirm the OAuth web client exists for the Firebase Google provider.
4. Add your real production domain before deployment.

Restart Vite after editing `.env.local` because Vite loads environment values at startup.

## Expected flow

Click `Continue with Google` -> Google account chooser -> Firebase callback -> `/account`.

If Firebase configuration is missing or the domain is not authorized, the application now shows the exact error instead of leaving the button apparently inactive.

## Fast diagnosis

Open DevTools > Console and click Google. Typical fixes:

- `auth/unauthorized-domain`: add the hostname to Firebase Authentication > Settings > Authorized domains.
- `auth/invalid-api-key`: copy the Firebase Web App config again.
- `auth/operation-not-allowed`: enable Google in Authentication > Sign-in providers.
- `auth/network-request-failed`: check network/proxy/firewall.
- Google opens but no account is created: confirm the FastAPI server is running at the configured `VITE_API_BASE_URL` and has a Firebase service account configured.
