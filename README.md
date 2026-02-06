# Bot de Automatización - Google Sheets

Bot de automatización con interfaz web para procesar expedientes desde Google Sheets.

## 🚀 Características

- **Interfaz web moderna** con diseño oscuro y animaciones  
- **Integración con Google Sheets** para lectura y procesamiento de datos  
- **Automatización con Playwright** para navegación web  
- **WebSocket en tiempo real** para logs y progreso  
- **Configuración automática** desde archivos `config.json` y `creds.json`  
- **Zero-config** - funciona sin configuración manual si los archivos existen  

## 📋 Requisitos

- Node.js 18+  
- Credenciales de Google Service Account  
- Acceso al Google Sheet con permisos de lectura/escritura  

## ⚙️ Configuración

### 1. Credenciales de Google

Crea un archivo `creds.json` en la raíz:

```json
{
  "type": "service_account",
  "project_id": "tu-project-id",
  "private_key_id": "tu-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tu-service-account@tu-project.iam.gserviceaccount.com",
  "client_id": "tu-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### 2. Configuración del Sheet

Crea un archivo `config.json`:

```json
{
  "spreadsheetId": "tu-google-sheet-id",
  "timeout": 10000,
  "batchSaveSize": 10
}
```

### 3. Variables de Entorno (Opcional)

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

## 🚀 Instalación y Ejecución

### Desarrollo

```bash
npm install
npm run dev
```

### Producción

```bash
npm install
npm start
```

## 🌐 Deploy

### Railway

1. Conecta tu repositorio a Railway  
2. Railway detectará automáticamente el `Procfile`  
3. Configura las variables de entorno en el dashboard de Railway:

- `PORT=8080`  
- `NODE_ENV=production`  
- `SPREADSHEET_ID=tu-sheet-id`  
- `GOOGLE_CREDS` (contenido del JSON como string)  

## 📊 Uso

1. Abre la aplicación en tu navegador  
2. Si tienes `config.json` y `creds.json`, la configuración se cargará automáticamente  
3. Si no, ingresa manualmente el ID del Google Sheet y las credenciales JSON  
4. Haz clic en **"Iniciar Bot"** para comenzar el procesamiento  
5. La vista de Google Sheets permite edición directa con permisos nativos  

## 🔧 API Endpoints

- `GET /api/config` - Obtener configuración del servidor  
- `GET /api/creds-exists` - Verificar si existen credenciales  
- `GET /api/creds` - Obtener credenciales del servidor  
- `POST /api/iniciar` - Iniciar el bot  
- `POST /api/detener` - Detener el bot  
- `GET /health` - Health check para deploy  

## 🎨 Tecnologías

- **Backend**: Node.js, Express, Socket.io  
- **Frontend**: HTML5, CSS3, JavaScript Vanilla  
- **Automatización**: Playwright  
- **Integración**: Google Sheets API  
- **Deploy**: Railway, Vercel, Heroku compatible  

## 📝 Estructura del Proyecto

```bash
├── public/
│   └── index.html      # Interfaz web principal
├── server.js           # Servidor Express + WebSocket
├── index.js            # Script de automatización standalone
├── package.json        # Dependencias y scripts
├── creds.json          # Credenciales de Google (no subir a git)
├── config.json         # Configuración del sheet
├── .env.example        # Plantilla de variables de entorno
├── Procfile            # Configuración de deploy
└── README.md           # Este archivo
```

## 🔐 Seguridad

- Las credenciales nunca se exponen en el frontend  
- El archivo `creds.json` está en `.gitignore`  
- Comunicación segura via WebSocket  
- Validación de inputs en el backend  

## 🐛 Troubleshooting

### Error: EADDRINUSE

```bash
# Matar procesos en el puerto
lsof -ti:8080 | xargs kill -9

# En Windows
netstat -ano | findstr :8080
taskkill /PID /F
```

### Error: Google Sheets API

- Verifica que el service account tenga permisos de lectura/escritura  
- Comparte el Google Sheet con el email del service account  
- Revisa que el spreadsheet ID sea correcto  

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles  

# BotOSM
