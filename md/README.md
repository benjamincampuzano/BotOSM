# 🤖 Bot de Automatización Web - Google Sheets

Sistema de automatización con interfaz web moderna para procesar expedientes desde Google Sheets con Playwright.

## 📋 Características

- ✅ Interfaz web moderna con diseño dividido
- 📊 Vista en tiempo real de Google Sheets (lado derecho)
- 📝 Logs en tiempo real (lado izquierdo)
- 🔄 Conexión WebSocket para actualizaciones instantáneas
- ⚡ Procesamiento optimizado con lotes
- 🎯 Barra de progreso visual
- 🔐 Detección automática de config.json y creds.json (ZERO CONFIG)
- 💾 Almacenamiento de credenciales en localStorage (si se ingresan manualmente)
- 🛑 Control de inicio/parada en tiempo real
- ⚙️ Configuración centralizada con timeouts y opciones personalizables

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Instalar navegadores de Playwright

```bash
npx playwright install chromium
```

### 3. Configurar credenciales de Google

**Opción A: Usar archivos de configuración (Recomendado - ZERO CONFIG)**

Si ya tienes tu archivo `creds.json` de Google Service Account:

1. **Crea `config.json`** en la raíz del proyecto con este contenido:
   ```json
   {
     "spreadsheetId": "1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc",
     "timeout": 10000,
     "batchSaveSize": 10,
     "headless": false
   }
   ```

2. **Coloca `creds.json`** en la raíz del proyecto

3. **¡Listo!** El sistema detectará ambos archivos automáticamente
   - No necesitas ingresar el ID del Sheet
   - No necesitas pegar las credenciales
   - Solo presiona "▶ Iniciar Bot" ✨

**Opción B: Ingresar datos manualmente**

Si no tienes los archivos, puedes pegar todo manualmente en la interfaz web.

**Cómo obtener credenciales:**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Google Sheets
4. Crea una Service Account
5. Descarga el JSON de credenciales (este es tu `creds.json`)
6. Comparte tu Google Sheet con el email de la service account

## 📦 Estructura del Proyecto

```
bot-automation-web/
├── server.js           # Servidor Express + WebSocket + Bot
├── public/
│   └── index.html      # Interfaz web
├── package.json        # Dependencias
└── README.md          # Este archivo
```

## 🎮 Uso

### 1. Iniciar el servidor

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

### 2. Configurar en la interfaz web

**Con archivos de configuración (config.json + creds.json):**
- ✅ Los campos se llenan automáticamente
- ✅ Solo presiona "▶ Iniciar Bot"

**Sin archivos de configuración:**

1. **ID de Google Sheet**: Copia el ID de tu Google Sheet desde la URL
   - Ejemplo: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`

2. **Credenciales JSON**: Pega el contenido completo del archivo JSON de tu Service Account

3. **Presiona "Iniciar Bot"**

### 3. Flujo de ejecución

1. El bot abre el navegador (modo visible)
2. **IMPORTANTE**: Inicia sesión manualmente en la página web
3. Presiona el botón "Continuar" en la interfaz
4. El bot procesará automáticamente todos los códigos
5. Los resultados se guardan en tiempo real en Google Sheets

## 🎨 Interfaz

### Panel Izquierdo (60%)
- **Controles**: ID de Sheet + Credenciales JSON
- **Botones**: Iniciar, Detener, Continuar
- **Barra de estado**: Indicador de estado + progreso
- **Logs en tiempo real**: Todos los eventos del bot

### Panel Derecho (40%)
- **Google Sheets embebido**: Vista en tiempo real del documento
- Se actualiza automáticamente al ingresar el ID

## 🔧 Configuración Avanzada

### Cambiar el puerto

Edita `server.js` o usa variable de entorno:

```bash
PORT=8080 npm start
```

### Ajustar timeouts

En `server.js`, modifica:

```javascript
const TIMEOUT_DEFAULT = 10000; // 10 segundos
const BATCH_SAVE_SIZE = 10;    // Guardar cada 10 filas
```

### Modo headless

Para ejecutar sin interfaz gráfica del navegador:

```javascript
// En server.js, línea ~120
browser = await chromium.launch({ 
    headless: true,  // Cambiar a true
    args: ['--disable-blink-features=AutomationControlled']
});
```

## 📊 Formato de Google Sheets

Tu hoja debe tener al menos estas columnas:

| Codigo | Resultado |
|--------|-----------|
| 12345  |           |
| 67890  |           |

- **Codigo**: Número de expediente a procesar
- **Resultado**: Se llenará automáticamente con los resultados

## ⚠️ Solución de Problemas

### Error: "El bot ya está en ejecución"
- Recarga la página o espera a que termine el proceso actual

### Error: "Faltan parámetros requeridos"
- Verifica que hayas ingresado el ID del Sheet y las credenciales JSON

### El navegador no se abre
- Ejecuta: `npx playwright install chromium`
- Verifica que tengas las dependencias del sistema necesarias

### No se guarda en Google Sheets
- Verifica que hayas compartido el Sheet con el email de la Service Account
- Revisa que el JSON de credenciales sea válido

### Logs no aparecen
- Abre la consola del navegador (F12) para ver errores
- Verifica que el servidor esté corriendo

## 🛠️ Desarrollo

Para modo desarrollo con recarga automática:

```bash
npm run dev
```

## 📝 Palabras Clave Buscadas

El bot busca estas palabras clave en los expedientes:

- ENVIO CV TM SIN ESCRITURA
- ENVIO PH TM SIN ESCRITURA
- ENVIO RAT TM SIN ESCRITURA
- ENVIO NOV TM SIN ESCRITURA
- ... (y más, ver server.js)

## 🔐 Seguridad

- ⚠️ No compartas tu archivo de credenciales JSON
- ⚠️ No subas las credenciales a repositorios públicos
- ✅ Usa variables de entorno para producción
- ✅ Las credenciales se almacenan en localStorage del navegador

## 📄 Licencia

MIT License

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas, abre un issue en el repositorio.

---

**Hecho con ❤️ y ☕**
