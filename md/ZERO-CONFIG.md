# ⚡ CONFIGURACIÓN ZERO-CONFIG

Si ya tienes `creds.json` y conoces tu ID de Google Sheet, esta es la forma más rápida de configurar el bot.

## 🎯 Pasos (3 minutos)

### 1️⃣ Crea config.json

En la raíz del proyecto, crea un archivo llamado **`config.json`** con este contenido:

```json
{
  "spreadsheetId": "1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc",
  "timeout": 10000,
  "batchSaveSize": 10,
  "headless": false
}
```

💡 **Reemplaza el `spreadsheetId` con el tuyo** (puedes usar el de ejemplo si es el correcto)

### 2️⃣ Coloca creds.json

Coloca tu archivo **`creds.json`** en la raíz del proyecto.

### 3️⃣ Estructura final

```
bot-automation-web/
├── server.js
├── package.json
├── config.json          ← Nuevo
├── creds.json          ← Tu archivo
└── public/
    └── index.html
```

### 4️⃣ Instala y ejecuta

```bash
npm install
npx playwright install chromium
npm start
```

### 5️⃣ Abre el navegador

Ve a: **http://localhost:3000**

### 6️⃣ ¡Listo!

- ✅ El ID del Sheet ya está cargado
- ✅ Las credenciales ya están cargadas
- ✅ Solo presiona **"▶ Iniciar Bot"**

---

## 🎉 ¡Sin escribir nada!

Con esta configuración:
- ❌ NO necesitas copiar/pegar el ID del Sheet
- ❌ NO necesitas copiar/pegar las credenciales
- ❌ NO necesitas ingresar nada en la interfaz
- ✅ Solo ejecutas y presionas un botón

---

## ⚙️ Opciones de config.json

```json
{
  "spreadsheetId": "TU_ID_AQUÍ",        // Obligatorio
  "timeout": 10000,                      // Opcional (default: 10000ms)
  "batchSaveSize": 10,                   // Opcional (default: 10)
  "headless": false                      // Opcional (false = ver navegador)
}
```

### Parámetros:

- **spreadsheetId**: ID de tu Google Sheet (obligatorio)
  - Ejemplo: `1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc`

- **timeout**: Tiempo máximo de espera en milisegundos
  - Default: `10000` (10 segundos)
  - Aumenta si tu conexión es lenta

- **batchSaveSize**: Cuántas filas guardar antes de hacer commit a Sheets
  - Default: `10`
  - Menos = más actualizaciones frecuentes
  - Más = más rápido pero menos actualizaciones

- **headless**: Modo del navegador
  - `false` = Ver el navegador (recomendado para debug)
  - `true` = Ejecutar sin ventana (más rápido, para producción)

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:**
- NO subas `config.json` ni `creds.json` a Git
- El `.gitignore` ya está configurado para ignorarlos
- Si usas control de versiones, verifica que estén ignorados:
  ```bash
  git status
  # NO deberían aparecer config.json ni creds.json
  ```

---

## 🆘 Solución de Problemas

### No se cargan los archivos

Verifica en la consola del servidor:
```bash
✅ Archivo creds.json encontrado en la raíz del proyecto
✅ Archivo config.json encontrado con configuración
📊 ID de Google Sheet configurado: 1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc
```

Si no ves estos mensajes:
1. Verifica que los archivos estén en la **raíz** del proyecto
2. Verifica que se llamen **exactamente** `config.json` y `creds.json`
3. Verifica que contengan JSON válido

### Error de JSON inválido

Valida tus archivos JSON en: https://jsonlint.com

### Los campos no se llenan automáticamente

1. Refresca la página (Ctrl+R o Cmd+R)
2. Verifica la consola del navegador (F12) para ver errores
3. Verifica que el servidor esté corriendo correctamente

---

## 📝 Ejemplo completo de config.json

```json
{
  "spreadsheetId": "1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc",
  "timeout": 15000,
  "batchSaveSize": 5,
  "headless": false
}
```

Este ejemplo:
- ✅ Usa tu Google Sheet
- ✅ Espera hasta 15 segundos por operación
- ✅ Guarda cada 5 filas procesadas
- ✅ Muestra el navegador mientras trabaja

---

**¡Configuración lista en 3 minutos! ⚡**
