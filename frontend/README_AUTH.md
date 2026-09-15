# EcoFusion — autenticación real local

## Inicio rápido Windows
1. Instala Node.js 20+ y Python 3.11+.
2. Ejecuta `start-dev.bat` desde esta carpeta.
3. Abre `http://localhost:5173`.

El backend queda en `http://localhost:8000` y crea `backend/ecofusion_auth.sqlite3` automáticamente.

## Admin demo inicial
- URL: `http://localhost:5173/admin`
- Email: `admin@ecofusionrentalcars.com`
- Password: `EcoFusionAdmin!2026`

El admin inicial es solo para desarrollo local. En producción se debe cambiar por un secreto/flujo de creación de administrador fuera del código.

## Cliente
Abre `http://localhost:5173/register`, crea tu cuenta y serás redirigido a `/account`.
No se inicia sesión con un cliente predefinido.

## Seguridad implementada
- Password hashing con `hashlib.scrypt` y salt aleatorio.
- Sesiones aleatorias almacenadas server-side en SQLite.
- Cookie de sesión `HttpOnly`, `SameSite=Lax`.
- Token CSRF para logout.
- Expiración de sesión de 8 horas y revocación al cerrar sesión.
- Rate limiting básico de 5 intentos / 15 min por IP + email.
- Role checks en backend (`admin` / `client`).
- `/api/v1/admin/ping` devuelve 401/403 cuando corresponde.

Para producción: HTTPS, cookies Secure, secretos fuera del código, Postgres/MySQL, reverse proxy, migraciones, auditoría, recuperación de contraseña y rate limiting distribuido.
