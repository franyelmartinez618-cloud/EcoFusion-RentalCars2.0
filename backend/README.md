# EcoFusion FastAPI backend

## Local administrator credentials

From this directory, after configuring `.env` and the database:

```powershell
python setup_admin.py
```

Choose a unique username and a password of at least 14 characters. The terminal prints a high-entropy recovery code once. Save it offline; it cannot be retrieved later.

To reset the admin password and rotate the recovery code from a trusted server shell:

```powershell
python setup_admin.py --reset
```

The admin browser flow is at `/admin/login`; it does not use Google or customer email authentication. Never commit `.env`, admin passwords, or recovery codes. For production, use HTTPS, restrict shell/database access, and configure rate limits at the edge.
