import base64
import hashlib
import hmac
import json
import os
import secrets
import time
import uuid
from pathlib import Path
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine,
    String,
    Text,
    Integer,
    BigInteger,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey,
    JSON,
    select,
    and_,
    or_,
    func,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
    Session as DBSession,
)

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth, credentials
except Exception:
    firebase_admin = None
    firebase_auth = None
    credentials = None


# ============================================================
# CONFIGURATION
# ============================================================

ENV = os.getenv("ENVIRONMENT", "development")

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173",
).strip()

TRUSTED_HOSTS = [
    x.strip()
    for x in os.getenv(
        "TRUSTED_HOSTS",
        "localhost,127.0.0.1",
    ).split(",")
    if x.strip()
]

SESSION_TTL = int(os.getenv("SESSION_TTL_SECONDS", "28800"))

MAX_BODY_BYTES = 1024 * 1024

ADMIN_EMAILS = {
    x.strip().lower()
    for x in os.getenv("ADMIN_EMAILS", "").split(",")
    if x.strip()
}


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.getenv(
    "MYSQL_URL",
    "sqlite:///./ecofusion_dev.sqlite3",
).strip()

# Railway normalmente entrega mysql://...
# SQLAlchemy + PyMySQL necesita mysql+pymysql://...
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "mysql://",
        "mysql+pymysql://",
        1,
    )

connect_args = (
    {"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)


# ============================================================
# EXTERNAL SERVICES
# ============================================================

SQUARE_TOKEN = os.getenv("SQUARE_ACCESS_TOKEN", "").strip()
SQUARE_ENV = os.getenv("SQUARE_ENVIRONMENT", "sandbox").strip().lower()
SQUARE_LOCATION_ID = os.getenv("SQUARE_LOCATION_ID", "").strip()
SQUARE_WEBHOOK_KEY = os.getenv(
    "SQUARE_WEBHOOK_SIGNATURE_KEY",
    "",
).strip()
SQUARE_WEBHOOK_URL = os.getenv(
    "SQUARE_WEBHOOK_NOTIFICATION_URL",
    "",
).strip()

SQUARE_BASE = (
    "https://connect.squareup.com"
    if SQUARE_ENV == "production"
    else "https://connect.squareupsandbox.com"
)

PERSONA_API_KEY = os.getenv("PERSONA_API_KEY", "").strip()
PERSONA_TEMPLATE_ID = os.getenv(
    "PERSONA_INQUIRY_TEMPLATE_ID",
    "",
).strip()
PERSONA_WEBHOOK_SECRET = os.getenv(
    "PERSONA_WEBHOOK_SECRET",
    "",
).strip()

PERSONA_BASE = "https://api.withpersona.com/api/v1"


# ============================================================
# MODELS
# ============================================================

class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    firebase_uid: Mapped[str] = mapped_column(
        String(191),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(160),
        default="",
    )

    email: Mapped[str] = mapped_column(
        String(254),
        default="",
        index=True,
    )

    phone: Mapped[str] = mapped_column(
        String(40),
        default="",
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="client",
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(50),
        default="",
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )

    identity_status: Mapped[str] = mapped_column(
        String(30),
        default="not_started",
    )

    identity_provider: Mapped[str] = mapped_column(
        String(40),
        default="",
    )

    identity_inquiry_id: Mapped[Optional[str]] = mapped_column(
        String(191),
        nullable=True,
        unique=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    last_login_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(
        String(96),
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    csrf_token: Mapped[str] = mapped_column(
        String(96),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
    )

    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime,
        nullable=True,
    )


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    public_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(160),
    )

    slug: Mapped[str] = mapped_column(
        String(180),
        unique=True,
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(80),
        default="",
    )

    transmission: Mapped[str] = mapped_column(
        String(40),
        default="Automatic",
    )

    fuel: Mapped[str] = mapped_column(
        String(40),
        default="",
    )

    seats: Mapped[int] = mapped_column(
        Integer,
        default=5,
    )

    price_per_day: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    location: Mapped[str] = mapped_column(
        String(120),
        default="",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="ACTIVE",
        index=True,
    )

    image_url: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    metadata_json: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
    )


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        default="",
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        default="",
    )

    email: Mapped[str] = mapped_column(
        String(254),
        default="",
        index=True,
    )

    phone: Mapped[str] = mapped_column(
        String(40),
        default="",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="ACTIVE",
    )


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    public_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"),
        index=True,
    )

    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id", ondelete="RESTRICT"),
        index=True,
    )

    pickup_at: Mapped[datetime] = mapped_column(
        DateTime,
        index=True,
    )

    return_at: Mapped[datetime] = mapped_column(
        DateTime,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        index=True,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        default="USD",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    taxes: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    fees: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    notes: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    public_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )

    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservations.id", ondelete="RESTRICT"),
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(40),
        default="square",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        index=True,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        default="USD",
    )

    square_order_id: Mapped[str] = mapped_column(
        String(191),
        default="",
        index=True,
    )

    square_payment_link_id: Mapped[str] = mapped_column(
        String(191),
        default="",
    )

    checkout_url: Mapped[str] = mapped_column(
        Text,
        default="",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class PaymentWebhookEvent(Base):
    __tablename__ = "payment_webhook_events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    provider: Mapped[str] = mapped_column(
        String(40),
        index=True,
    )

    event_id: Mapped[str] = mapped_column(
        String(191),
        unique=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    public_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
    )

    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservations.id", ondelete="RESTRICT"),
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="ISSUED",
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        default="USD",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    taxes: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        nullable=True,
        index=True,
    )

    action: Mapped[str] = mapped_column(
        String(120),
    )

    entity: Mapped[str] = mapped_column(
        String(120),
    )

    entity_id: Mapped[str] = mapped_column(
        String(120),
        default="",
    )

    ip: Mapped[str] = mapped_column(
        String(64),
        default="",
    )

    details: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="EcoFusion RentalCars API",
    version="4.0.0",
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=TRUSTED_HOSTS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "DELETE",
    ],
    allow_headers=[
        "Content-Type",
        "X-CSRF-Token",
    ],
)


# ============================================================
# SECURITY HEADERS
# ============================================================

@app.middleware("http")
async def security_headers(request: Request, call_next):
    cl = request.headers.get("content-length")

    if cl and int(cl) > MAX_BODY_BYTES:
        return Response(
            status_code=413,
            content="Request body too large",
        )

    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = (
        "strict-origin-when-cross-origin"
    )
    response.headers["Permissions-Policy"] = (
        "camera=(self), microphone=(), geolocation=()"
    )

    response.headers["Cache-Control"] = (
        "no-store"
        if request.url.path.startswith("/api/")
        else "no-cache"
    )

    if ENV == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "object-src 'none'"
        )

    return response


# ============================================================
# HELPERS
# ============================================================

def db():
    s = SessionLocal()

    try:
        yield s
    finally:
        s.close()


def now():
    return datetime.now(timezone.utc)


def firebase_ready():
    return (
        firebase_admin is not None
        and bool(firebase_admin._apps)
    )


def init_firebase():
    if firebase_admin is None or firebase_admin._apps:
        return

    raw = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_JSON",
        "",
    ).strip()

    path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "",
    ).strip()

    if raw:
        firebase_admin.initialize_app(
            credentials.Certificate(
                json.loads(raw)
            )
        )

    elif path and os.path.exists(path):
        firebase_admin.initialize_app(
            credentials.Certificate(path)
        )


try:
    init_firebase()
except Exception:
    pass


def new_session(
    s: DBSession,
    user_id: int,
):
    sid = secrets.token_urlsafe(48)
    csrf = secrets.token_urlsafe(32)

    s.add(
        UserSession(
            id=sid,
            user_id=user_id,
            csrf_token=csrf,
            created_at=now(),
            expires_at=now().replace(
                microsecond=0
            ),
        )
    )

    row = (
        s.query(UserSession)
        .filter_by(id=sid)
        .one()
    )

    row.expires_at = (
        now()
        + __import__("datetime").timedelta(
            seconds=SESSION_TTL
        )
    )

    return sid, csrf


def set_cookies(
    response: Response,
    sid: str,
    csrf: str,
):
    secure = ENV == "production"

    response.set_cookie(
        "ef_session",
        sid,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=SESSION_TTL,
        path="/",
    )

    response.set_cookie(
        "ef_csrf",
        csrf,
        httponly=False,
        secure=secure,
        samesite="lax",
        max_age=SESSION_TTL,
        path="/",
    )


def current_session(
    request: Request,
    s: DBSession,
):
    sid = request.cookies.get("ef_session")

    if not sid:
        return None

    row = (
        s.query(UserSession, User)
        .join(
            User,
            User.id == UserSession.user_id,
        )
        .filter(
            UserSession.id == sid,
            UserSession.revoked_at.is_(None),
            User.active.is_(True),
        )
        .first()
    )

    if not row:
        return None

    sess, user = row

    if sess.expires_at < now():
        return None

    return sess, user


def require_auth(
    request: Request,
    s: DBSession,
    role: Optional[str] = None,
):
    pair = current_session(request, s)

    if not pair:
        raise HTTPException(
            401,
            "Authentication required",
        )

    sess, user = pair

    if role and user.role != role:
        raise HTTPException(
            403,
            "Forbidden",
        )

    return sess, user


def require_csrf(
    request: Request,
    sess: UserSession,
):
    token = request.headers.get(
        "X-CSRF-Token",
        "",
    )

    if (
        not token
        or not hmac.compare_digest(
            token,
            sess.csrf_token,
        )
    ):
        raise HTTPException(
            403,
            "Invalid CSRF token",
        )


def audit(
    s,
    request,
    user_id,
    action,
    entity,
    entity_id="",
    details=None,
):
    s.add(
        AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            ip=(
                request.client.host
                if request.client
                else ""
            ),
            details=details or {},
        )
    )


# ============================================================
# SCHEMAS
# ============================================================

class FirebaseExchange(BaseModel):
    id_token: str = Field(
        min_length=20,
        max_length=5000,
    )

    profile_name: str = Field(
        default="",
        max_length=160,
    )


class VehicleIn(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=160,
    )

    slug: str = Field(
        min_length=2,
        max_length=180,
    )

    category: str = ""
    transmission: str = "Automatic"
    fuel: str = ""

    seats: int = Field(
        default=5,
        ge=1,
        le=20,
    )

    price_per_day: Decimal = Field(
        default=0,
        ge=0,
    )

    location: str = ""
    status: str = "ACTIVE"
    image_url: str = ""
    metadata_json: dict = {}


class ReservationIn(BaseModel):
    vehicle_id: int
    pickup_at: datetime
    return_at: datetime
    notes: str = ""
    currency: str = "USD"


class ProfilePatch(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=160,
    )


class IdentityStart(BaseModel):
    pass


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/v1/health")
def health():
    return {
        "ok": True,
        "database": (
            "mysql"
            if DATABASE_URL.startswith("mysql")
            else "sqlite-dev"
        ),
        "firebaseConfigured": firebase_ready(),
        "squareConfigured": bool(
            SQUARE_TOKEN
            and SQUARE_LOCATION_ID
        ),
        "identityProviderConfigured": bool(
            PERSONA_API_KEY
            and PERSONA_TEMPLATE_ID
        ),
    }


# ============================================================
# AUTH
# ============================================================

@app.get("/api/v1/auth/me")
def me(
    request: Request,
    s: DBSession = Depends(db),
):
    pair = current_session(request, s)

    if not pair:
        return {
            "authenticated": False,
            "user": None,
        }

    _, u = pair

    return {
        "authenticated": True,
        "user": {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "provider": u.provider,
            "identityStatus": u.identity_status,
            "identityProvider": u.identity_provider,
        },
    }


@app.post("/api/v1/auth/firebase")
def exchange_firebase(
    payload: FirebaseExchange,
    request: Request,
    response: Response,
    s: DBSession = Depends(db),
):
    if not firebase_ready():
        raise HTTPException(
            503,
            "Firebase Authentication is not configured on the server.",
        )

    try:
        decoded = firebase_auth.verify_id_token(
            payload.id_token,
            check_revoked=True,
        )
    except Exception:
        raise HTTPException(
            401,
            "Invalid or expired Firebase identity token",
        )

    uid = decoded.get("uid")

    email = (
        decoded.get("email") or ""
    ).lower().strip()

    phone = decoded.get("phone_number") or ""

    provider = (
        decoded.get("firebase", {})
        .get("sign_in_provider")
        or "unknown"
    )

    if not uid:
        raise HTTPException(
            401,
            "Firebase token has no user identity",
        )

    if (
        provider == "password"
        and not decoded.get("email_verified")
    ):
        raise HTTPException(
            403,
            "Please verify your email before signing in.",
        )

    u = (
        s.query(User)
        .filter_by(firebase_uid=uid)
        .first()
    )

    display = " ".join(
        (
            payload.profile_name.strip()
            or decoded.get("name")
            or (
                email.split("@")[0]
                if email
                else "Customer"
            )
        ).split()
    )[:160]

    if u is None:
        role = (
            "admin"
            if email
            and email in ADMIN_EMAILS
            else "client"
        )

        u = User(
            firebase_uid=uid,
            name=display,
            email=email,
            phone=phone,
            role=role,
            provider=provider,
            created_at=now(),
            last_login_at=now(),
        )

        s.add(u)
        s.flush()

        if role == "client":
            parts = display.split(" ", 1)

            s.add(
                Customer(
                    user_id=u.id,
                    first_name=parts[0],
                    last_name=(
                        parts[1]
                        if len(parts) > 1
                        else ""
                    ),
                    email=email,
                    phone=phone,
                )
            )

    else:
        u.name = display or u.name
        u.email = email
        u.phone = phone
        u.provider = provider
        u.last_login_at = now()

    sid, csrf = new_session(
        s,
        u.id,
    )

    audit(
        s,
        request,
        u.id,
        "login",
        "users",
        u.id,
        {"provider": provider},
    )

    s.commit()

    set_cookies(
        response,
        sid,
        csrf,
    )

    return {
        "user": {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "provider": u.provider,
            "identityStatus": u.identity_status,
            "identityProvider": u.identity_provider,
        }
    }


@app.post("/api/v1/auth/logout")
def logout(
    request: Request,
    response: Response,
    s: DBSession = Depends(db),
):
    pair = current_session(
        request,
        s,
    )

    if pair:
        sess, u = pair

        require_csrf(
            request,
            sess,
        )

        sess.revoked_at = now()

        audit(
            s,
            request,
            u.id,
            "logout",
            "users",
            u.id,
        )

        s.commit()

    response.delete_cookie(
        "ef_session",
        path="/",
    )

    response.delete_cookie(
        "ef_csrf",
        path="/",
    )

    return {
        "ok": True,
    }


@app.patch("/api/v1/auth/profile")
def profile(
    payload: ProfilePatch,
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
    )

    require_csrf(
        request,
        sess,
    )

    u.name = " ".join(
        payload.name.strip().split()
    )

    s.commit()

    return {
        "ok": True,
        "name": u.name,
    }


# ============================================================
# ADMIN
# ============================================================

@app.get("/api/v1/admin/ping")
def admin_ping(
    request: Request,
    s: DBSession = Depends(db),
):
    _, u = require_auth(
        request,
        s,
        "admin",
    )

    return {
        "ok": True,
        "user": {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
        },
    }


@app.get("/api/v1/admin/security")
def admin_security(
    request: Request,
    s: DBSession = Depends(db),
):
    require_auth(
        request,
        s,
        "admin",
    )

    return {
        "sessionTtlSeconds": SESSION_TTL,
        "csrf": True,
        "parameterizedSql": True,
        "trustedHosts": TRUSTED_HOSTS,
        "corsOrigin": FRONTEND_ORIGIN,
        "squareConfigured": bool(
            SQUARE_TOKEN
            and SQUARE_LOCATION_ID
        ),
        "firebaseConfigured": firebase_ready(),
        "identityProvider": (
            "persona"
            if PERSONA_API_KEY
            and PERSONA_TEMPLATE_ID
            else "not_configured"
        ),
    }


# ============================================================
# VEHICLES
# ============================================================

@app.get("/api/v1/vehicles")
def list_vehicles(
    status: str = "ACTIVE",
    location: str = "",
    s: DBSession = Depends(db),
):
    q = s.query(Vehicle)

    if status:
        q = q.filter(
            Vehicle.status == status
        )

    if location:
        q = q.filter(
            Vehicle.location == location
        )

    return [
        {
            "id": v.id,
            "publicId": v.public_id,
            "name": v.name,
            "slug": v.slug,
            "category": v.category,
            "transmission": v.transmission,
            "fuel": v.fuel,
            "seats": v.seats,
            "pricePerDay": float(
                v.price_per_day
            ),
            "location": v.location,
            "status": v.status,
            "imageUrl": v.image_url,
            "metadata": v.metadata_json,
        }
        for v in q.order_by(
            Vehicle.id.desc()
        ).all()
    ]


@app.post("/api/v1/admin/vehicles")
def create_vehicle(
    payload: VehicleIn,
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
        "admin",
    )

    require_csrf(
        request,
        sess,
    )

    if (
        s.query(Vehicle)
        .filter(
            or_(
                Vehicle.slug == payload.slug,
                Vehicle.name == payload.name,
            )
        )
        .first()
    ):
        raise HTTPException(
            409,
            "Vehicle already exists",
        )

    v = Vehicle(
        public_id=f"VEH-{uuid.uuid4().hex[:10].upper()}",
        **payload.model_dump(),
    )

    s.add(v)
    s.flush()

    audit(
        s,
        request,
        u.id,
        "create",
        "vehicles",
        v.id,
    )

    s.commit()

    return {
        "id": v.id,
        "publicId": v.public_id,
    }


@app.patch("/api/v1/admin/vehicles/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    payload: VehicleIn,
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
        "admin",
    )

    require_csrf(
        request,
        sess,
    )

    v = s.get(
        Vehicle,
        vehicle_id,
    )

    if not v:
        raise HTTPException(
            404,
            "Vehicle not found",
        )

    for k, val in payload.model_dump().items():
        setattr(v, k, val)

    audit(
        s,
        request,
        u.id,
        "update",
        "vehicles",
        v.id,
    )

    s.commit()

    return {
        "ok": True,
    }


@app.delete("/api/v1/admin/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
        "admin",
    )

    require_csrf(
        request,
        sess,
    )

    v = s.get(
        Vehicle,
        vehicle_id,
    )

    if not v:
        raise HTTPException(
            404,
            "Vehicle not found",
        )

    v.status = "DELETED"

    audit(
        s,
        request,
        u.id,
        "delete",
        "vehicles",
        vehicle_id,
    )

    s.commit()

    return {
        "ok": True,
    }


# ============================================================
# RESERVATIONS
# ============================================================

@app.get("/api/v1/account/reservations")
def my_reservations(
    request: Request,
    s: DBSession = Depends(db),
):
    _, u = require_auth(
        request,
        s,
        "client",
    )

    c = (
        s.query(Customer)
        .filter_by(user_id=u.id)
        .first()
    )

    if not c:
        return []

    rows = (
        s.query(Reservation, Vehicle)
        .join(
            Vehicle,
            Vehicle.id == Reservation.vehicle_id,
        )
        .filter(
            Reservation.customer_id == c.id
        )
        .order_by(
            Reservation.pickup_at.desc()
        )
        .all()
    )

    return [
        {
            "id": r.public_id,
            "vehicle": v.name,
            "pickupAt": r.pickup_at.isoformat(),
            "returnAt": r.return_at.isoformat(),
            "status": r.status,
            "total": float(r.total),
            "currency": r.currency,
        }
        for r, v in rows
    ]


@app.get("/api/v1/account/payments")
def my_payments(
    request: Request,
    s: DBSession = Depends(db),
):
    _, u = require_auth(
        request,
        s,
        "client",
    )

    c = (
        s.query(Customer)
        .filter_by(user_id=u.id)
        .first()
    )

    if not c:
        return []

    rows = (
        s.query(Payment, Reservation)
        .join(
            Reservation,
            Reservation.id == Payment.reservation_id,
        )
        .filter(
            Reservation.customer_id == c.id
        )
        .order_by(
            Payment.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": p.public_id,
            "reservation": r.public_id,
            "amount": float(p.amount),
            "status": p.status,
            "provider": p.provider,
            "checkoutUrl": p.checkout_url,
        }
        for p, r in rows
    ]


@app.post("/api/v1/account/reservations")
def create_reservation(
    payload: ReservationIn,
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
        "client",
    )

    require_csrf(
        request,
        sess,
    )

    c = (
        s.query(Customer)
        .filter_by(user_id=u.id)
        .first()
    )

    if not c:
        raise HTTPException(
            409,
            "Customer profile not found",
        )

    if payload.return_at <= payload.pickup_at:
        raise HTTPException(
            400,
            "Return date must be after pickup date",
        )

    vehicle = s.get(
        Vehicle,
        payload.vehicle_id,
    )

    if (
        not vehicle
        or vehicle.status != "ACTIVE"
    ):
        raise HTTPException(
            404,
            "Vehicle unavailable",
        )

    clash = (
        s.query(Reservation)
        .filter(
            Reservation.vehicle_id == vehicle.id,
            Reservation.status.in_(
                [
                    "PENDING",
                    "CONFIRMED",
                    "ACTIVE",
                ]
            ),
            Reservation.pickup_at < payload.return_at,
            Reservation.return_at > payload.pickup_at,
        )
        .first()
    )

    if clash:
        raise HTTPException(
            409,
            "Vehicle is already reserved for those dates",
        )

    days = max(
        1,
        (
            payload.return_at.date()
            - payload.pickup_at.date()
        ).days,
    )

    subtotal = (
        Decimal(days)
        * Decimal(vehicle.price_per_day)
    )

    taxes = (
        subtotal * Decimal("0.0875")
    ).quantize(
        Decimal("0.01")
    )

    total = subtotal + taxes

    r = Reservation(
        public_id=f"RS-{uuid.uuid4().hex[:10].upper()}",
        customer_id=c.id,
        vehicle_id=vehicle.id,
        pickup_at=payload.pickup_at,
        return_at=payload.return_at,
        status="PENDING",
        currency=payload.currency,
        subtotal=subtotal,
        taxes=taxes,
        fees=Decimal("0"),
        total=total,
        notes=payload.notes,
    )

    s.add(r)
    s.flush()

    audit(
        s,
        request,
        u.id,
        "create",
        "reservations",
        r.id,
    )

    s.commit()

    return {
        "id": r.public_id,
        "subtotal": float(subtotal),
        "taxes": float(taxes),
        "total": float(total),
        "currency": r.currency,
    }


@app.get("/api/v1/availability")
def availability(
    vehicle_id: int,
    pickup_at: datetime,
    return_at: datetime,
    s: DBSession = Depends(db),
):
    if return_at <= pickup_at:
        raise HTTPException(
            400,
            "Invalid rental interval",
        )

    v = s.get(
        Vehicle,
        vehicle_id,
    )

    if (
        not v
        or v.status != "ACTIVE"
    ):
        return {
            "available": False,
        }

    clash = (
        s.query(Reservation)
        .filter(
            Reservation.vehicle_id == vehicle_id,
            Reservation.status.in_(
                [
                    "PENDING",
                    "CONFIRMED",
                    "ACTIVE",
                ]
            ),
            Reservation.pickup_at < return_at,
            Reservation.return_at > pickup_at,
        )
        .first()
    )

    return {
        "available": clash is None,
        "vehicleId": vehicle_id,
    }


# ============================================================
# SQUARE
# ============================================================

async def square_headers():
    return {
        "Authorization": f"Bearer {SQUARE_TOKEN}",
        "Content-Type": "application/json",
        "Square-Version": "2026-08-19",
    }


@app.post(
    "/api/v1/account/reservations/{reservation_id}/checkout"
)
async def create_checkout(
    reservation_id: str,
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
        "client",
    )

    require_csrf(
        request,
        sess,
    )

    if (
        not SQUARE_TOKEN
        or not SQUARE_LOCATION_ID
    ):
        raise HTTPException(
            503,
            "Square is not configured",
        )

    c = (
        s.query(Customer)
        .filter_by(user_id=u.id)
        .first()
    )

    r = (
        s.query(Reservation)
        .filter_by(
            public_id=reservation_id,
            customer_id=(
                c.id
                if c
                else -1
            ),
        )
        .first()
    )

    if not r:
        raise HTTPException(
            404,
            "Reservation not found",
        )

    amount = int(
        (
            Decimal(r.total)
            * 100
        ).quantize(
            Decimal("1")
        )
    )

    idem = secrets.token_hex(16)

    body = {
        "idempotency_key": idem,
        "order": {
            "location_id": SQUARE_LOCATION_ID,
            "line_items": [
                {
                    "name": (
                        f"Vehicle rental "
                        f"{reservation_id}"
                    ),
                    "quantity": "1",
                    "base_price_money": {
                        "amount": amount,
                        "currency": r.currency,
                    },
                }
            ],
        },
        "checkout_options": {
            "redirect_url": (
                f"{FRONTEND_ORIGIN}"
                f"/account?payment="
                f"{reservation_id}"
            ),
        },
        "description": (
            "EcoFusion RentalCars reservation "
            f"{reservation_id}"
        ),
    }

    async with httpx.AsyncClient(
        timeout=20
    ) as client:
        resp = await client.post(
            f"{SQUARE_BASE}"
            "/v2/online-checkout/payment-links",
            headers=await square_headers(),
            json=body,
        )

    if resp.status_code >= 300:
        raise HTTPException(
            502,
            "Square could not create checkout",
        )

    data = resp.json()

    pl = data.get(
        "payment_link",
        {},
    )

    order_id = pl.get(
        "order_id",
        "",
    )

    p = Payment(
        public_id=f"PAY-{uuid.uuid4().hex[:10].upper()}",
        reservation_id=r.id,
        status="PENDING",
        amount=r.total,
        currency=r.currency,
        square_order_id=order_id,
        square_payment_link_id=(
            pl.get("id", "")
            or ""
        ),
        checkout_url=(
            pl.get("url")
            or pl.get("long_url")
            or ""
        ),
    )

    s.add(p)
    s.commit()

    return {
        "paymentId": p.public_id,
        "checkoutUrl": p.checkout_url,
    }


@app.post("/api/v1/webhooks/square")
async def square_webhook(
    request: Request,
    s: DBSession = Depends(db),
):
    raw = await request.body()

    sig = request.headers.get(
        "x-square-hmacsha256-signature",
        "",
    )

    if not SQUARE_WEBHOOK_KEY:
        raise HTTPException(
            503,
            "Square webhook signing key is not configured",
        )

    notification_url = (
        SQUARE_WEBHOOK_URL
        or str(request.url)
    )

    expected = base64.b64encode(
        hmac.new(
            SQUARE_WEBHOOK_KEY.encode(),
            (
                notification_url
                + raw.decode()
            ).encode(),
            hashlib.sha256,
        ).digest()
    ).decode()

    if not hmac.compare_digest(
        expected,
        sig,
    ):
        raise HTTPException(
            401,
            "Invalid Square webhook signature",
        )

    payload = json.loads(
        raw.decode()
    )

    event_id = (
        payload.get("event_id")
        or ""
    )

    etype = payload.get(
        "type",
        "",
    )

    if not event_id:
        raise HTTPException(
            400,
            "Missing Square event_id",
        )

    if (
        s.query(PaymentWebhookEvent)
        .filter_by(event_id=event_id)
        .first()
    ):
        return {
            "ok": True,
            "duplicate": True,
        }

    s.add(
        PaymentWebhookEvent(
            provider="square",
            event_id=event_id,
            created_at=now(),
        )
    )

    if etype.startswith("payment."):
        payment_data = (
            payload.get("data") or {}
        ).get(
            "object",
            {},
        ).get(
            "payment",
            {},
        )

        square_id = payment_data.get(
            "id",
            "",
        )

        order_id = payment_data.get(
            "order_id",
            "",
        )

        status = payment_data.get(
            "status",
            "",
        )

        p = (
            s.query(Payment)
            .filter(
                or_(
                    Payment.square_order_id
                    == order_id,
                    Payment.square_payment_link_id
                    == square_id,
                )
            )
            .first()
        )

        if p:
            p.status = {
                "COMPLETED": "PAID",
                "FAILED": "FAILED",
                "CANCELED": "CANCELED",
                "PENDING": "PENDING",
            }.get(
                status,
                status or p.status,
            )

            r = s.get(
                Reservation,
                p.reservation_id,
            )

            if (
                r
                and p.status == "PAID"
            ):
                r.status = "CONFIRMED"

                if not (
                    s.query(Invoice)
                    .filter_by(
                        reservation_id=r.id
                    )
                    .first()
                ):
                    s.add(
                        Invoice(
                            public_id=(
                                "INV-"
                                f"{uuid.uuid4().hex[:10].upper()}"
                            ),
                            reservation_id=r.id,
                            status="PAID",
                            currency=r.currency,
                            subtotal=r.subtotal,
                            taxes=r.taxes,
                            total=r.total,
                            created_at=now(),
                        )
                    )

    s.commit()

    return {
        "ok": True,
        "eventId": event_id,
    }


# ============================================================
# PERSONA / IDENTITY
# ============================================================

@app.get("/api/v1/account/identity")
def identity_status(
    request: Request,
    s: DBSession = Depends(db),
):
    _, u = require_auth(
        request,
        s,
        "client",
    )

    return {
        "status": u.identity_status,
        "provider": u.identity_provider,
        "inquiryId": u.identity_inquiry_id,
    }


@app.post("/api/v1/account/identity/start")
async def identity_start(
    request: Request,
    s: DBSession = Depends(db),
):
    sess, u = require_auth(
        request,
        s,
        "client",
    )

    require_csrf(
        request,
        sess,
    )

    if (
        not PERSONA_API_KEY
        or not PERSONA_TEMPLATE_ID
    ):
        raise HTTPException(
            503,
            "Identity verification is not configured",
        )

    if u.identity_status == "verified":
        return {
            "status": "verified",
            "url": None,
        }

    payload = {
        "data": {
            "attributes": {
                "inquiry-template-id": (
                    PERSONA_TEMPLATE_ID
                ),
                "reference-id": (
                    f"ecofusion-user-{u.id}"
                ),
                "fields": {
                    "name-first": (
                        u.name.split(" ", 1)[0]
                        if u.name
                        else ""
                    ),
                    "name-last": (
                        u.name.split(" ", 1)[-1]
                        if u.name
                        else ""
                    ),
                    "email-address": u.email,
                },
            }
        }
    }

    if u.identity_inquiry_id:
        endpoint = (
            f"{PERSONA_BASE}"
            f"/inquiries/"
            f"{u.identity_inquiry_id}"
            "/generate-one-time-link"
        )

        body = {}

    else:
        endpoint = (
            f"{PERSONA_BASE}"
            "/inquiries"
        )

        body = payload

    headers = {
        "Authorization": (
            f"Bearer {PERSONA_API_KEY}"
        ),
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(
        timeout=20
    ) as client:
        resp = await client.post(
            endpoint,
            headers=headers,
            json=body,
        )

    if resp.status_code >= 300:
        raise HTTPException(
            502,
            "Identity provider could not start verification",
        )

    data = resp.json()

    inquiry = data.get(
        "data",
        {},
    )

    u.identity_inquiry_id = (
        inquiry.get("id")
        or u.identity_inquiry_id
    )

    u.identity_provider = "persona"
    u.identity_status = "pending"

    s.commit()

    return {
        "status": "pending",
        "url": (
            data.get("meta", {})
            .get("one-time-link")
        ),
    }


@app.post("/api/v1/webhooks/persona")
async def persona_webhook(
    request: Request,
    s: DBSession = Depends(db),
):
    raw = await request.body()

    header = request.headers.get(
        "Persona-Signature",
        "",
    )

    if not PERSONA_WEBHOOK_SECRET:
        raise HTTPException(
            503,
            "Identity provider webhook signing secret is not configured",
        )

    valid = False

    for chunk in header.split():
        parts = dict(
            item.split("=", 1)
            for item in chunk.split(",")
            if "=" in item
        )

        ts = parts.get("t", "")
        v1 = parts.get("v1", "")

        if not ts or not v1:
            continue

        try:
            if (
                abs(
                    int(time.time())
                    - int(ts)
                )
                > 300
            ):
                continue

        except ValueError:
            continue

        expected = hmac.new(
            PERSONA_WEBHOOK_SECRET.encode(),
            (
                ts
                + "."
                + raw.decode()
            ).encode(),
            hashlib.sha256,
        ).hexdigest()

        if hmac.compare_digest(
            expected,
            v1,
        ):
            valid = True
            break

    if not valid:
        raise HTTPException(
            401,
            "Invalid Persona webhook signature",
        )

    payload = json.loads(
        raw.decode()
    )

    event = payload.get(
        "data"
    ) or {}

    attrs = event.get(
        "attributes"
    ) or {}

    name = attrs.get(
        "name",
        "",
    )

    inquiry_id = (
        event.get("id")
        or (
            (
                attrs.get("payload")
                or {}
            )
            .get("data")
            or {}
        ).get("id")
    )

    mapping = {
        "inquiry.completed": "verified",
        "inquiry.approved": "verified",
        "inquiry.declined": "failed",
        "inquiry.marked-for-review": "review",
    }

    if (
        inquiry_id
        and name in mapping
    ):
        u = (
            s.query(User)
            .filter_by(
                identity_inquiry_id=inquiry_id
            )
            .first()
        )

        if u:
            u.identity_status = mapping[name]

    s.commit()

    return {
        "ok": True,
    }


# ============================================================
# ADMIN: RESERVATIONS
# ============================================================

@app.get("/api/v1/admin/reservations")
def admin_reservations(
    request: Request,
    s: DBSession = Depends(db),
):
    require_auth(
        request,
        s,
        "admin",
    )

    rows = (
        s.query(
            Reservation,
            Customer,
            Vehicle,
        )
        .join(
            Customer,
            Customer.id
            == Reservation.customer_id,
        )
        .join(
            Vehicle,
            Vehicle.id
            == Reservation.vehicle_id,
        )
        .order_by(
            Reservation.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": r.public_id,
            "customer": (
                f"{c.first_name} "
                f"{c.last_name}"
            ).strip(),
            "vehicle": v.name,
            "status": r.status,
            "pickupAt": r.pickup_at.isoformat(),
            "returnAt": r.return_at.isoformat(),
            "total": float(r.total),
            "currency": r.currency,
        }
        for r, c, v in rows
    ]


# ============================================================
# ADMIN: PAYMENTS
# ============================================================

@app.get("/api/v1/admin/payments")
def admin_payments(
    request: Request,
    s: DBSession = Depends(db),
):
    require_auth(
        request,
        s,
        "admin",
    )

    rows = (
        s.query(
            Payment,
            Reservation,
            Customer,
        )
        .join(
            Reservation,
            Reservation.id
            == Payment.reservation_id,
        )
        .join(
            Customer,
            Customer.id
            == Reservation.customer_id,
        )
        .order_by(
            Payment.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": p.public_id,
            "reservation": r.public_id,
            "customer": (
                f"{c.first_name} "
                f"{c.last_name}"
            ).strip(),
            "amount": float(p.amount),
            "status": p.status,
            "provider": p.provider,
            "checkoutUrl": p.checkout_url,
        }
        for p, r, c in rows
    ]


# ============================================================
# ADMIN: CUSTOMERS
# ============================================================

@app.get("/api/v1/admin/customers")
def admin_customers(
    request: Request,
    s: DBSession = Depends(db),
):
    require_auth(
        request,
        s,
        "admin",
    )

    rows = (
        s.query(Customer, User)
        .join(
            User,
            User.id == Customer.user_id,
        )
        .order_by(
            Customer.id.desc()
        )
        .all()
    )

    return [
        {
            "id": c.id,
            "name": (
                f"{c.first_name} "
                f"{c.last_name}"
            ).strip(),
            "email": c.email,
            "phone": c.phone,
            "status": c.status,
            "role": u.role,
            "identityStatus": u.identity_status,
        }
        for c, u in rows
    ]


# ============================================================
# ADMIN: INVOICES
# ============================================================

@app.get("/api/v1/admin/invoices")
def admin_invoices(
    request: Request,
    s: DBSession = Depends(db),
):
    require_auth(
        request,
        s,
        "admin",
    )

    result = []

    for i in (
        s.query(Invoice)
        .order_by(
            Invoice.created_at.desc()
        )
        .all()
    ):
        r = s.get(
            Reservation,
            i.reservation_id,
        )

        result.append(
            {
                "id": i.public_id,
                "reservationId": (
                    r.public_id
                    if r
                    else ""
                ),
                "status": i.status,
                "total": float(i.total),
                "currency": i.currency,
            }
        )

    return result