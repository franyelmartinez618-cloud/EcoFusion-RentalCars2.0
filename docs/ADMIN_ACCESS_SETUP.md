# Configurar el acceso privado de administración

El administrador **no** inicia sesión con Google ni con el correo de un cliente. Se usa una cuenta local separada y verificada por FastAPI.

## 1. Preparar el backend

Asegúrate de que MySQL/XAMPP está iniciado, que la base `ecofusion` existe y que `backend/.env` contiene el `MYSQL_URL` correcto. Después inicia el proyecto con `start-dev.bat` para que el entorno de Python quede instalado.

## 2. Crear usuario y contraseña del administrador

Abre otra ventana de PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd backend
.venv\Scripts\activate
python setup_admin.py
```

Elige un usuario de 3 a 80 caracteres y una contraseña de al menos 14 caracteres. El programa generará y mostrará en la terminal un **código de recuperación de alta entropía**, una sola vez. Guárdalo fuera del ordenador o en un gestor de contraseñas. No lo metas en el repositorio, capturas, mensajes ni archivos `.env`. La base de datos guarda hashes, no el código ni la contraseña en claro.

## 3. Entrar al panel

Abre `http://localhost:5173/admin/login` o usa el puerto que aparezca en la consola de Vite, por ejemplo `http://localhost:5174/admin/login`. Introduce el usuario y contraseña creados en el paso anterior. No uses el inicio de sesión de clientes.

## 4. Recuperar el acceso desde la web

En la pantalla de administración, selecciona **Recuperar acceso**, introduce usuario, código de recuperación y una contraseña nueva de al menos 14 caracteres. Si se valida el código, la contraseña cambia, las sesiones administrativas existentes se invalidan y se muestra un **código nuevo**. El código anterior deja de funcionar. Guarda el nuevo código antes de cerrar la pantalla. No se envía nada por correo.

## 5. Si se pierden la contraseña y el código

Desde una consola confiable del servidor/backend, ejecuta:

```powershell
python setup_admin.py --reset
```

Se cambiará la contraseña y se rotará el código de recuperación; las sesiones anteriores se revocarán. Este procedimiento requiere acceso directo al entorno del backend, por eso la consola y las credenciales del servidor deben estar protegidas.

## Medidas aplicadas

- La cuenta administrativa se crea desde la consola del backend, no desde el registro público ni Firebase.
- Contraseña y código de recuperación se almacenan como hashes PBKDF2-SHA256 con sal aleatoria.
- Contraseñas nuevas de 14+ caracteres, límites de intentos y bloqueo temporal tras fallos repetidos.
- Código de recuperación rotatorio, de un solo uso, no enviado por correo.
- Sesiones administrativas limitadas a una hora por defecto y revocadas al recuperar acceso.
- Las rutas `/api/v1/admin/*` requieren una sesión con credencial administrativa dedicada.

En producción, usa HTTPS, limita el acceso al servidor y a la base de datos, configura rate limiting en el proxy y guarda copias de seguridad seguras. El rate limit en memoria del proceso es solo una capa adicional.
