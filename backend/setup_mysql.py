import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(BACKEND_DIR / ".env")

url = os.getenv("MYSQL_URL", "").strip()
if not url.startswith("mysql"):
    raise SystemExit("MYSQL_URL must point to a MySQL database.")

schema_path = PROJECT_ROOT / "EcoFusion-production-setup.sql"
if not schema_path.exists():
    raise SystemExit(f"Production schema not found: {schema_path}")

raw = schema_path.read_text(encoding="utf-8")
statements = [stmt.strip() for stmt in raw.split(";") if stmt.strip()]

engine = create_engine(url, future=True)

with engine.begin() as conn:
    for stmt in statements:
        conn.execute(text(stmt))

print("EcoFusion production MySQL schema and starter data applied successfully.")
print("Authoritative schema: EcoFusion-production-setup.sql (27 tables).")
