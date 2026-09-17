# EcoFusion database

This project intentionally keeps the production schema small and functional. The current core contains 9 tables that map directly to active backend features: authentication, sessions, customers, fleet, reservations, payments, payment webhooks, invoices, and audit logs.

`schema.sql` creates the structure. `seed.sql` inserts the starter fleet.

Do not add a table until a real feature requires persistent data that cannot be modeled safely in an existing table.
