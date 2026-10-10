"""Create or reset a dedicated local EcoFusion administrator account.

Run from the backend directory:
    python setup_admin.py
    python setup_admin.py --reset

The recovery code is shown only in this terminal. Store it offline.
"""
import argparse
import getpass
import re
import secrets
import sys

from main import AdminCredential, SessionLocal, User, hash_admin_secret, now

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9._-]{3,80}$")


def prompt_new_password():
    while True:
        password = getpass.getpass("Contraseña nueva (mínimo 14 caracteres): ")
        confirm = getpass.getpass("Repite la contraseña: ")
        if password != confirm:
            print("Las contraseñas no coinciden. Inténtalo de nuevo.")
            continue
        if len(password) < 14:
            print("Usa al menos 14 caracteres; una frase larga es una buena opción.")
            continue
        if len(password) > 128:
            print("La contraseña no puede superar los 128 caracteres.")
            continue
        return password


def main():
    parser = argparse.ArgumentParser(description="Configura el acceso local del panel administrativo.")
    parser.add_argument("--reset", action="store_true", help="restablece la contraseña y regenera el código de recuperación desde la consola del servidor")
    args = parser.parse_args()

    session = SessionLocal()
    try:
        existing = session.query(AdminCredential).order_by(AdminCredential.id.asc()).first()
        if args.reset:
            if not existing:
                print("No existe una cuenta administrativa para restablecer. Ejecuta primero python setup_admin.py.")
                return 1
            credential = existing
            user = session.get(User, credential.user_id)
            if not user:
                print("La cuenta administrativa está incompleta en la base de datos.")
                return 1
            print(f"Se restablecerá la cuenta administrativa: {credential.username}")
        else:
            if existing:
                print("Ya existe una cuenta administrativa. Para restablecerla desde una consola segura, ejecuta: python setup_admin.py --reset")
                return 1
            username = input("Usuario administrador (3–80 letras, números, punto, guion o guion bajo): ").strip().casefold()
            if not USERNAME_PATTERN.fullmatch(username):
                print("Nombre de usuario no válido.")
                return 1
            password = prompt_new_password()
            user = User(
                firebase_uid=f"local-admin:{username}",
                name=username,
                email="",
                phone="",
                phone_verified=False,
                role="admin",
                provider="local_password",
                active=True,
                identity_status="not_started",
                identity_provider="",
                created_at=now(),
                last_login_at=now(),
            )
            session.add(user)
            session.flush()
            recovery_code = secrets.token_urlsafe(32)
            credential = AdminCredential(
                user_id=user.id,
                username=username,
                password_hash=hash_admin_secret(password),
                recovery_code_hash=hash_admin_secret(recovery_code),
                failed_attempts=0,
                recovery_failed_attempts=0,
                created_at=now(),
                password_changed_at=now(),
            )
            session.add(credential)
            session.commit()
            print("\nCuenta administrativa creada. Copia este código ahora; no vuelve a mostrarse:")
            print("=" * 78)
            print(recovery_code)
            print("=" * 78)
            print("Guárdalo fuera del ordenador/servidor, preferiblemente en un gestor de contraseñas.")
            print("No lo envíes por correo ni lo añadas al repositorio.")
            print("\nAcceso: /admin/login")
            return 0

        password = prompt_new_password()
        recovery_code = secrets.token_urlsafe(32)
        credential.password_hash = hash_admin_secret(password)
        credential.recovery_code_hash = hash_admin_secret(recovery_code)
        credential.failed_attempts = 0
        credential.locked_until = None
        credential.recovery_failed_attempts = 0
        credential.recovery_locked_until = None
        credential.password_changed_at = now()
        # Invalidate any existing sessions after an operator-side reset.
        from main import UserSession
        for active_session in session.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.revoked_at.is_(None),
        ).all():
            active_session.revoked_at = now()
        session.commit()
        print("\nAcceso restablecido. Copia este código de recuperación nuevo ahora:")
        print("=" * 78)
        print(recovery_code)
        print("=" * 78)
        print("El código anterior y las sesiones previas quedan invalidados.")
        return 0
    finally:
        session.close()


if __name__ == "__main__":
    sys.exit(main())
