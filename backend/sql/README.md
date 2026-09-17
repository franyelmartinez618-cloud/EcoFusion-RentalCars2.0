# EcoFusion database

This project intentionally keeps the production schema small and functional. The current core contains 9 tables that map directly to active backend features: authentication, sessions, customers, fleet, reservations, payments, payment webhooks, invoices, and audit logs.

`schema.sql` creates the structure. `seed.sql` inserts the starter fleet.

Do not add a table until a real feature requires persistent data that cannot be modeled safely in an existing table.


The application now also expects a `user_consents` table for server-side privacy/terms acceptance. The final production schema should retain only functional tables; this table is functional because account onboarding depends on it.
