# EcoFusion frontend-first architecture

The project is intentionally split into three experiences inside one React app:

- Public website: `/`, `/vehicles`, `/vehicles/:slug`, `/book`
- Customer account: `/account`, with reservations, payments and profile views
- Admin console: `/admin`, with fleet, reservations, payments, customers, operations and database prototype tools

## What works without a backend

The frontend uses `AppDataContext` plus `localStorage` as a prototype repository. This is enough to design and test:

- booking flows
- customer account views
- payment states
- admin CRUD
- favorites
- filters
- visual content management
- settings

No real customer secrets or card information are stored.

## What the backend must add later

FastAPI becomes the source of truth for authenticated users, reservations, availability, payments, roles, permissions and persistence in MySQL.

The intended payment boundary is:

`React -> POST /api/v1/payments/checkout -> FastAPI -> Square Checkout API -> checkout.square.site`

Then Square notifies FastAPI through a verified webhook. The backend updates the reservation/payment records and the customer/admin screens simply read the resulting state.

The browser must never contain a Square secret/access token.

## Migration strategy

The UI should stay the same while the data source changes. Replace local context operations with API calls in small slices:

1. authentication + current user
2. vehicles + availability
3. reservations
4. Square checkout creation
5. Square webhook -> payment status
6. admin permissions and audit logs

This avoids a large rewrite.
