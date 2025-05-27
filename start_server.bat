@echo off
echo.
echo ========================================
echo   INICIANDO ATHCYL BACKEND
echo ========================================
echo.
cd backend
echo Activando entorno virtual...
call ..\venv\Scripts\activate.bat
echo.
echo Iniciando servidor Django...
echo Abre tu navegador en: http://localhost:8000/admin/
echo.
python manage.py runserver 0.0.0.0:8000
echo.
pause
