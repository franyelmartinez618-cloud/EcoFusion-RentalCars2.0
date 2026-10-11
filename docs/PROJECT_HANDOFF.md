# EcoFusion RentalCars — project handoff notes

These notes preserve ongoing project decisions so future work can continue without repeating setup questions. Do not store passwords, database URLs, Firebase service-account JSON, admin recovery codes, or private admin paths here.

## Hosting and current architecture

- Repository: franyelmartinez618-cloud/EcoFusion-RentalCars2.0, branch main.
- Frontend: Vite + React in frontend/, served by the Cloudflare Worker ecofusion-rentalcars2-0.
- Public frontend: https://ecofusion-rentalcars2-0.ecofusionrentalcars.workers.dev.
- Backend: FastAPI on Render at https://ecofusion-rentalcars2-0.onrender.com.
- Database: TiDB Cloud Starter, MySQL-compatible; Render's MYSQL_URL points to the database.
- The Worker proxies /api/* to the Render backend. Keep frontend/worker/index.js pointed to Render, not the expired Railway service.

## Sensitive configuration

- frontend/.env.local contains Firebase Web App configuration used by Vite at build time. It must remain local and must not be committed.
- Local production build/deploy on Windows PowerShell:
  1. git pull origin main --ff-only
  2. cd frontend
  3. Set VITE_API_BASE_URL to https://ecofusion-rentalcars2-0.ecofusionrentalcars.workers.dev/api/v1
  4. npm run build
  5. npx wrangler deploy --keep-vars
- Wrangler warns that dashboard variables differ from local config. Preserve runtime variables with --keep-vars; don't accept a normal deploy that overwrites ADMIN_ENTRY_PATH.
- ADMIN_ENTRY_PATH is stored only in the Cloudflare Worker runtime variables. Never commit or share its value. Do not regenerate it casually; it is the private entry route.
- MYSQL_URL stays in Render's backend environment. Never print it or paste it in chat.
- Firebase Admin FIREBASE_SERVICE_ACCOUNT_JSON is separate from the public Vite VITE_FIREBASE_* settings.

## Administrator access and security goals

- Customer authentication uses Firebase (Google, email/password, phone) plus a server-side FastAPI session.
- Admin authentication is a separate local username/password account created from a trusted backend setup command, python setup_admin.py. It is not the customer's Google account.
- The admin recovery code appears only once during creation/reset. Save it privately offline/in a password manager; never add it to GitHub or share it.
- Public guessed routes /admin, /admin/login, and /login should return 404. The private ADMIN_ENTRY_PATH maps internally to the admin login/panel. Hiding a route is not a substitute for backend admin-session and role checks.
- If the private route stops working, verify the Worker source is deployed and that ADMIN_ENTRY_PATH still exists in Cloudflare runtime variables; do not disable authentication to make it work.

## Outstanding UI/behavior requirements

- If a person signs in with an identity that is not registered in EcoFusion, show a clear registration-required message and route them to /register; do not silently create/sign in a customer account through a login attempt. A Google identity that has an incomplete EcoFusion profile should continue through the profile-completion flow if the backend marks it as such.
- Keep sign-in and registration phone icons as proper SVGs (not broken/garbled glyphs).
- Keep the public footer free of an Admin Console link.
- The How It Works page must not repeat the same page title/description twice; keep the practical preparation guidance.
- Expand About and Contact with useful content without inventing phone numbers, office addresses, support hours, or other unverified company details.
- The Contact form is currently a local draft/copy helper, not an email-delivery service. Do not claim a message has been sent unless a real backend delivery endpoint is implemented.
- Keep the existing vehicle-card visual theme but normalize card/media proportions and text height so the grid looks even without stretching vehicle images.

## Safety rules for future changes

- Never commit .env, .env.local, .dev.vars, database URLs, service account keys, admin passwords, recovery codes, or the private admin route.
- After changing multiple frontend files, run npm run build from frontend/ before deploying.
- Verify public pages and Google sign-in after a deployment. Test /admin and /admin/login return 404, and test the private route separately without sharing it.
- Do not reset the admin account unless its password/recovery code actually needs recovery; python setup_admin.py --reset rotates credentials and invalidates existing admin sessions.