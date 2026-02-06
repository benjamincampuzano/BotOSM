#!/bin/bash

# Script de Deploy para Bot de Automatización
# Compatible con Railway, Vercel y Heroku

echo "🚀 Iniciando deploy del Bot de Automatización..."

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json. Ejecuta desde la raíz del proyecto."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar archivos de configuración
if [ ! -f "creds.json" ]; then
    echo "⚠️  Advertencia: No se encuentra creds.json"
    echo "   Copia .env.example a .env y configura las variables de entorno"
fi

if [ ! -f "config.json" ]; then
    echo "⚠️  Advertencia: No se encuentra config.json"
    echo "   Copia config.example.json a config.json"
fi

# Detectar plataforma de deploy
if [ "$1" = "railway" ]; then
    echo "🚂 Deploy en Railway..."
    echo "   1. Conecta tu repositorio a Railway"
    echo "   2. Configura variables de entorno en el dashboard"
    echo "   3. Railway hará deploy automático"
    
elif [ "$1" = "vercel" ]; then
    echo "⚡ Deploy en Vercel..."
    npx vercel --prod
    
elif [ "$1" = "heroku" ]; then
    echo "🌿 Deploy en Heroku..."
    heroku create bot-automation-$(date +%s)
    heroku config:set NODE_ENV=production
    heroku config:set PORT=8080
    git push heroku main
    
else
    echo "📋 Uso: ./deploy.sh [railway|vercel|heroku]"
    echo ""
    echo "🌐 Plataformas soportadas:"
    echo "   railway  - Deploy automático via GitHub"
    echo "   vercel   - Deploy rápido con Vercel CLI"
    echo "   heroku   - Deploy tradicional con Heroku"
    echo ""
    echo "⚙️  Pre-requisitos:"
    echo "   - Railway: Cuenta y repositorio conectado"
    echo "   - Vercel: CLI instalada (npm i -g vercel)"
    echo "   - Heroku: CLI instalada y app creada"
fi

echo "✅ Script de deploy completado"
