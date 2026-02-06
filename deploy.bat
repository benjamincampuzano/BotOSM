@echo off
REM Script de Deploy para Bot de Automatización - Windows
REM Compatible con Railway, Vercel y Heroku

echo 🚀 Iniciando deploy del Bot de Automatización...

REM Verificar si estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encuentra package.json. Ejecuta desde la raíz del proyecto.
    pause
    exit /b 1
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

REM Verificar archivos de configuración
if not exist "creds.json" (
    echo ⚠️  Advertencia: No se encuentra creds.json
    echo    Copia .env.example a .env y configura las variables de entorno
)

if not exist "config.json" (
    echo ⚠️  Advertencia: No se encuentra config.json
    echo    Copia config.example.json a config.json
)

REM Detectar plataforma de deploy
if "%1"=="railway" (
    echo 🚂 Deploy en Railway...
    echo    1. Conecta tu repositorio a Railway
    echo    2. Configura variables de entorno en el dashboard
    echo    3. Railway hará deploy automático
    
) else if "%1"=="vercel" (
    echo ⚡ Deploy en Vercel...
    call npx vercel --prod
    
) else if "%1"=="heroku" (
    echo 🌿 Deploy en Heroku...
    call heroku create bot-automation-%random%
    call heroku config:set NODE_ENV=production
    call heroku config:set PORT=8080
    call git push heroku main
    
) else (
    echo 📋 Uso: deploy.bat [railway^|vercel^|heroku]
    echo.
    echo 🌐 Plataformas soportadas:
    echo    railway  - Deploy automático via GitHub
    echo    vercel   - Deploy rápido con Vercel CLI
    echo    heroku   - Deploy tradicional con Heroku
    echo.
    echo ⚙️  Pre-requisitos:
    echo    - Railway: Cuenta y repositorio conectado
    echo    - Vercel: CLI instalada (npm i -g vercel)
    echo    - Heroku: CLI instalada y app creada
)

echo ✅ Script de deploy completado
pause
