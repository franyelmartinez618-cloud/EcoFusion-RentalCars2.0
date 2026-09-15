@echo off
setlocal
cd /d "%~dp0"
echo === EcoFusion MySQL setup ===
echo Make sure XAMPP MySQL is running on port 3306.
echo Edit .env first with your real MYSQL_URL.
if not exist .env copy .env.example .env
if not exist .venv python -m venv .venv
call .venv\Scripts\activate
python -m pip install -r requirements.txt
python setup_mysql.py
pause
