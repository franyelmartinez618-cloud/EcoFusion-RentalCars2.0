# EcoFusion — seguridad, cuenta e integraciones

## Cuenta y registro

- `/account` es una zona protegida: una persona no autenticada va a `/sign-in`.
- Después de autenticarse, si todavía no aceptó privacidad/términos, pasa a `/complete-account`.
- La aceptación se registra server-side en `user_consents` con versión, fecha, IP y user-agent.
- El alta por correo exige verificación de email de Firebase.
- Google usa OAuth de Firebase. El perfil puede mostrar la foto que entrega Google (`photoURL`) sin almacenar la imagen en MySQL.
- Un cliente con otra cuenta puede vincular Google desde Seguridad de cuenta mediante `linkWithPopup`; esto es una acción explícita del usuario.
- Cerrar sesión revoca la sesión server-side y elimina las cookies de sesión.

## Antiabuso

- El backend soporta Firebase App Check con reCAPTCHA Enterprise de forma opcional.
- Para activar enforcement después de registrar la clave de producción: `FIREBASE_APPCHECK_REQUIRED=true` en Railway y `VITE_FIREBASE_RECAPTCHA_SITE_KEY` en el frontend.
- El frontend envía el token en `X-Firebase-AppCheck`; el backend lo valida con Firebase Admin.
- El login por teléfono usa reCAPTCHA de Firebase.
- La protección no se considera absoluta: se combinan autenticación, sesión server-side, CSRF, CORS, validación, rate limiting y auditoría.

## Privacidad

La política incorporada es un borrador operativo para la aplicación. Antes de producción comercial deben completarse los datos jurídicos reales del responsable (razón social, NIT, domicilio y canal de atención) y revisarse por asesoría legal. La estructura toma como referencia el régimen colombiano de protección de datos y la forma en que organizaciones publican su política y canales de derechos.

## Square

No se debe usar un enlace público fijo como `square.link/u/...` para representar cualquier reserva. El flujo de producción recomendado es:

1. Crear la reserva en FastAPI.
2. Crear un checkout de Square desde el backend para esa reserva, usando una `idempotency_key` única.
3. Guardar `payment_link.id`, `order_id` y el estado del pago en MySQL.
4. Redirigir al checkout alojado por Square.
5. Confirmar el pago desde los webhooks de Square; nunca confiar únicamente en la redirección del navegador.
6. Actualizar la reserva/factura cuando llegue `payment.updated` o el evento correspondiente.

## Aplicaciones externas de franRentCar

Las URLs de `franRentCar · Mi cuenta` y `franRentCar · Mis cobros` son aplicaciones separadas y no forman parte de EcoFusion. No se deben integrar como si fueran una API propia sin un contrato de integración/autorización. Si se desea usarlas juntas, la integración debe ser explícita (por ejemplo, un enlace de back-office o una API autenticada independiente).
