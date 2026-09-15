import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv(Path(__file__).with_name(".env"))
url=os.getenv("MYSQL_URL", "")
if not url.startswith("mysql"):
    raise SystemExit("MYSQL_URL must be a mysql+pymysql:// URL in backend/.env")
schema=Path(__file__).with_name("sql")/"schema.sql"
# Execute statements except CREATE DATABASE/USE; connect directly to the configured database.
engine=create_engine(url, future=True)
raw=schema.read_text(encoding="utf-8")
statements=[]
for stmt in raw.split(";"):
    stmt=stmt.strip()
    if not stmt or stmt.upper().startswith("CREATE DATABASE") or stmt.upper().startswith("USE ecofusion"):
        continue
    statements.append(stmt)
with engine.begin() as conn:
    for stmt in statements:
        conn.execute(text(stmt))
print("MySQL schema applied successfully.")
print("69 tables are defined in backend/sql/schema.sql.")
