@echo off
title J.A.R.V.I.S. AI OS - Fiza Nazz Edition
echo Starting J.A.R.V.I.S. Autonomous Voice Assistant...
start "" "http://localhost:8085"
python "%~dp0server.py"
pause
