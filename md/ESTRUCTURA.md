# 📁 Estructura del Proyecto

```
bot-automation-web/
│
├── 📄 server.js              # Servidor Node.js con Express + WebSocket
├── 📄 package.json           # Dependencias del proyecto
├── 📄 README.md              # Documentación completa
├── 📄 INICIO-RAPIDO.md       # Guía rápida de inicio
├── 📄 ESTRUCTURA.md          # Este archivo
│
├── 🔐 creds.json            # ⭐ COLOCA TU ARCHIVO AQUÍ ⭐
│                             # (Credenciales de Google Service Account)
│                             # ⚠️ NO lo compartas ni lo subas a Git
│
├── ⚙️  config.json           # ⭐ COLOCA TU ARCHIVO AQUÍ ⭐
│                             # (Configuración con ID de Google Sheet)
│                             # ⚠️ NO lo subas a Git (contiene tu ID)
│
├── 📄 config.example.json    # Ejemplo de config.json
├── 📄 .env.example           # Ejemplo de variables de entorno
├── 📄 .gitignore            # Archivos ignorados por Git
│
├── 📄 env.example            # (Renombrar a .env.example)
├── 📄 gitignore              # (Renombrar a .gitignore)
│
├── 🔧 install.sh            # Script de instalación (Linux/Mac)
├── 🔧 install.bat           # Script de instalación (Windows)
│
└── 📁 public/
    └── 📄 index.html         # Interfaz web del bot
```

---

## 🔐 Ubicación de Archivos de Configuración

Ambos archivos deben estar en la **raíz del proyecto**, al mismo nivel que `server.js`:

```
✅ CORRECTO:
bot-automation-web/
├── server.js
├── creds.json          ← AQUÍ
├── config.json         ← AQUÍ
└── public/
    └── index.html

❌ INCORRECTO:
bot-automation-web/
├── server.js
├── public/
│   ├── index.html
│   ├── creds.json      ← NO AQUÍ
│   └── config.json     ← NI AQUÍ
```

---

## ⚙️  Contenido de config.json

```json
{
  "spreadsheetId": "1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc",
  "timeout": 10000,
  "batchSaveSize": 10,
  "headless": false
}
```

### Descripción de campos:

- **spreadsheetId**: ID de tu Google Sheet (obligatorio)
- **timeout**: Tiempo de espera en milisegundos (default: 10000)
- **batchSaveSize**: Cantidad de filas por lote (default: 10)
- **headless**: `true` para modo sin ventana, `false` para ver el navegador (default: false)

---

## 🎯 Contenido de creds.json

Tu archivo debe tener esta estructura (valores de ejemplo):

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "bot-automation@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 🔍 Verificación

Cuando inicies el servidor con `npm start`, deberías ver:

```bash
✅ Archivo creds.json encontrado en la raíz del proyecto
✅ Archivo config.json encontrado con configuración
📊 ID de Google Sheet configurado: 1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc
🚀 Servidor corriendo en http://localhost:3000
```

Si no ves estos mensajes, verifica que:
1. Los archivos se llamen exactamente `creds.json` y `config.json`
2. Estén en la raíz del proyecto (mismo nivel que `server.js`)
3. Contengan JSON válido

---

## 🚀 Uso Simplificado

Con ambos archivos configurados, **solo necesitas**:

1. Ejecutar `npm start`
2. Abrir `http://localhost:3000`
3. Presionar "▶ Iniciar Bot"

¡Sin ingresar nada manualmente! Todo se carga automáticamente. ✨

---

## ⚠️ Seguridad

- ❌ **NUNCA** subas `creds.json` a Git o repositorios públicos
- ✅ El archivo `.gitignore` ya está configurado para ignorarlo
- ✅ No compartas este archivo por email o chat
- ✅ Genera nuevas credenciales si crees que fueron comprometidas

---

## 💡 Alternativa

Si prefieres NO usar el archivo `creds.json`:
- Deja el campo vacío en la interfaz web
- Pega las credenciales JSON manualmente cada vez
- Se guardarán en el localStorage del navegador

---

## 🆘 Problemas Comunes

### "Archivo creds.json no encontrado"
- Verifica la ubicación del archivo
- Asegúrate que el nombre sea exacto: `creds.json`
- Reinicia el servidor después de colocar el archivo

### "Error al parsear creds.json"
- Abre el archivo en un editor de texto
- Verifica que sea JSON válido (usa https://jsonlint.com)
- Asegúrate de no tener caracteres extraños al inicio/final

### El bot no guarda en Google Sheets
- Verifica que el Sheet esté compartido con el email en `client_email`
- Da permisos de "Editor" al compartir
- Verifica que la API de Google Sheets esté habilitada

---

**¿Necesitas más ayuda?** Lee el archivo `README.md` completo.
