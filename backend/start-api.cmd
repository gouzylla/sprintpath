@echo off
cd /d C:\Users\valen\Documents\apprentissage\backend
call .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > api.log 2>&1
