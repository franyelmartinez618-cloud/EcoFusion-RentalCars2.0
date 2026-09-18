# EcoFusion current architecture

Cloudflare serves the frontend. Railway runs the FastAPI backend and MySQL production database. The repository is the source of code, but production data is not stored in the repository.

## Production flow

Browser → Cloudflare frontend → Railway FastAPI → Railway MySQL

## Database policy

The production schema is defined by `EcoFusion-production-setup.sql` with 27 tables covering identity, customers, fleet, reservations, contracts, inspections, billing, payments and auditing. The active FastAPI ORM currently maps the core runtime tables it queries.

## Homepage policy

The homepage is a landing page, not the entire catalog. It highlights the service, the booking/search action, and a small featured selection. The full inventory lives at `/vehicles`.
