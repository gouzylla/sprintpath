@echo off
cd /d C:\Users\valen\Documents\apprentissage\frontend
call npm.cmd install --legacy-peer-deps > install.log 2>&1
echo %ERRORLEVEL% > install.exit
