@echo off
echo Iniciando El Cazador de Influencia Falsa...
echo.

start "Hunter Server" cmd /k "cd server && npm start"
start "Hunter Client" cmd /k "cd client && npm run dev"

echo Sistema iniciado.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo.
pause
