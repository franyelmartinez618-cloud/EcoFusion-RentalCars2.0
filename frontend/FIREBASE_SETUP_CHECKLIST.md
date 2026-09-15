# Firebase setup checklist — exact user experience

The login/register UI is already wired for three real identity methods:

1. Continue with Google → Firebase Google OAuth popup/account chooser.
2. Email + password → Firebase account, email verification, then secure EcoFusion session.
3. Phone → Firebase SMS verification + reCAPTCHA, then secure EcoFusion session.

## Console

- Firebase Console → Authentication → Sign-in method → enable Google.
- Enable Email/Password.
- Enable Phone and configure the allowed SMS regions.
- Authentication → Settings → Authorized domains → add the domain used by the app.
- For production phone authentication, deploy over HTTPS. Firebase does not allow localhost as a hosted domain for the Phone provider.
- Create an admin user in Firebase Authentication with the email listed in `ADMIN_EMAILS`.
- Create a Firebase service account and keep the JSON outside the repository.

The Firebase Web config goes in frontend `.env` (`VITE_FIREBASE_*`). The service-account credentials stay server-side in `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON`.
