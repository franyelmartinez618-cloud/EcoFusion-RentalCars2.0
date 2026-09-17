# EcoFusion current architecture

Cloudflare serves the frontend. Railway runs the FastAPI backend and MySQL production database. The repository is the source of code, but production data is not stored in the repository.

## Production flow

Browser → Cloudflare frontend → Railway FastAPI → Railway MySQL

## Database policy

The production schema is intentionally compact: 9 core tables. Optional domains such as GPS, maintenance, promotions, support, notifications, and legal-document workflows are not created until their functionality is implemented and needs persistent storage.

## Homepage policy

The homepage is a landing page, not the entire catalog. It highlights the service, the booking/search action, and a small featured selection. The full inventory lives at `/vehicles`.
