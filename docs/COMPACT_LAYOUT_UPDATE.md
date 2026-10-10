# Compact layout update — EcoFusion RentalCars

This update is a presentation-only pass for the React frontend.

## What changed
- Reduced excessive vertical padding across public pages and homepage sections.
- Made customer sign-in a compact, viewport-centered screen. Its footer is hidden only on that sign-in screen so the form can fit in one view at normal laptop/desktop heights.
- Kept sign-in scrollable on very short windows and mobile, so fields are not clipped.
- Compactened registration and account setup without forcing long verification/consent forms into a clipped no-scroll layout.
- Fixed the admin layout conflict: it previously combined a grid sidebar with repeated fixed widths and `margin-left`, pushing the workspace out of alignment. The sidebar now occupies one grid column and the content region uses the remaining viewport height.
- The admin content area and tables scroll internally on desktop; mobile switches back to normal page scrolling.
- Customer Firebase authentication remains unchanged. `AdminLogin.jsx` is now separate from the customer sign-in flow and uses local administrator credentials backed by dedicated FastAPI endpoints.

## Apply the minimal patch (recommended)
Extract `EcoFusion-RentalCars-compact-layout-patch.zip` over the existing project root, allowing these files to be overwritten:
- `frontend/src/App.jsx`
- `frontend/src/styles/compact-layout.css` (new)
- `frontend/src/pages/SignIn/SignIn.jsx`
- `frontend/src/pages/Auth/Register.jsx`
- `frontend/src/pages/Auth/AccountSetup.jsx`

Do **not** replace or delete your existing environment files. Keep your current:
- `frontend/.env.local`
- `frontend/.env.production` (if used)
- `backend/.env`

These contain local deployment/auth configuration and are intentionally not included in the patch.

Then from `frontend` run:
```powershell
npm run dev
```

For production bundle validation:
```powershell
npm run build
```

## Configuration/security note
The full source bundle intentionally excludes `.env` files, `node_modules`, Python virtual environments, `.git`, and local SQLite databases. Restore your own environment variables locally; never publish Firebase service-account credentials, API secrets, database passwords, or production tokens. Firebase Web App configuration variables (the `VITE_FIREBASE_*` browser config) belong in `frontend/.env.local`; backend service-account secrets must remain in `backend/.env` or the deployment platform's secret manager.

This is a layout adjustment; it does not prove that Google OAuth is configured correctly for a deployed domain. Google sign-in still depends on the existing Firebase project settings and authorized domains.
