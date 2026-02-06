# 🚀 GUÍA DE INICIO RÁPIDO

## ⚡ Instalación Automática

### En Linux/Mac:
```bash
chmod +x install.sh
./install.sh
```

### En Windows:
```bash
install.bat
```

---

## 📋 Instalación Manual (si los scripts no funcionan)

### 1. Renombrar archivos de configuración

```bash
# Renombrar estos archivos (quitar el nombre y dejar solo el punto):
mv env.example .env.example
mv gitignore .gitignore
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar Chromium

```bash
npx playwright install chromium
```

---

## 🎮 Iniciar la Aplicación

```bash
npm start
```

Abre tu navegador en: **http://localhost:3000**

---

## 🔐 Configuración de Google Cloud

### ⚡ Si ya tienes creds.json

1. Coloca tu archivo `creds.json` en la raíz del proyecto
2. ¡Listo! El sistema lo detectará automáticamente
3. Ve directo a **"Iniciar la Aplicación"**

### 📝 Si NO tienes creds.json

### Paso 1: Crear Service Account

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **+ CREATE CREDENTIALS** > **Service Account**
5. Dale un nombre (ej: "bot-automation")
6. Haz clic en **CREATE AND CONTINUE**
7. Asigna el rol **Editor** (opcional, pero recomendado)
8. Haz clic en **DONE**

### Paso 2: Descargar credenciales JSON

1. En la lista de Service Accounts, haz clic en la que acabas de crear
2. Ve a la pestaña **KEYS**
3. Haz clic en **ADD KEY** > **Create new key**
4. Selecciona **JSON** y haz clic en **CREATE**
5. Se descargará un archivo JSON - guárdalo en un lugar seguro

### Paso 3: Habilitar Google Sheets API

1. En Google Cloud Console, ve a **APIs & Services** > **Library**
2. Busca "Google Sheets API"
3. Haz clic en **ENABLE**

### Paso 4: Compartir tu Google Sheet

1. Abre tu Google Sheet
2. Haz clic en **Compartir** (botón verde en la esquina superior derecha)
3. Copia el email de la Service Account (está en el archivo JSON descargado: `client_email`)
4. Pégalo en el campo de compartir
5. Dale permisos de **Editor**
6. Haz clic en **Enviar**

---

## 📊 Formato de Google Sheets

Tu hoja debe tener esta estructura:

| Codigo | Resultado |
|--------|-----------|
| 12345  |           |
| 67890  |           |
| ABC123 |           |

- **Columna "Codigo"**: Los números de expediente a procesar
- **Columna "Resultado"**: Se llenará automáticamente

---

## 🎯 Uso de la Interfaz Web

### 1. Configuración Inicial

1. **ID de Google Sheet**: 
   - Copia desde la URL: `https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit`
   - Ejemplo: `1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc`

2. **Credenciales JSON**:
   - **✅ SI tienes `creds.json` en la raíz**: El campo mostrará "✅ Usando creds.json del servidor" automáticamente
   - **❌ SI NO tienes el archivo**: 
     - Abre el archivo JSON descargado en un editor de texto
     - Copia TODO el contenido
     - Pégalo en el campo de texto grande

### 2. Ejecutar el Bot

1. Haz clic en **"▶ Iniciar Bot"**
2. Se abrirá una ventana del navegador
3. **IMPORTANTE**: Inicia sesión manualmente en la página web
4. Vuelve a la interfaz web y haz clic en **"✓ Continuar"**
5. El bot comenzará a procesar automáticamente

### 3. Monitorear el Progreso

- **Panel Izquierdo**: Ver logs en tiempo real
- **Panel Derecho**: Ver Google Sheet actualizándose
- **Barra de Progreso**: Ver cuánto falta
- **Botón Detener**: Parar el bot en cualquier momento

---

## 🔧 Solución de Problemas Comunes

### "Cannot find module 'express'"
```bash
npm install
```

### "chromium not found"
```bash
npx playwright install chromium
```

### "Permission denied" al ejecutar install.sh
```bash
chmod +x install.sh
```

### El bot no guarda en Google Sheets
- Verifica que compartiste el Sheet con el email de la Service Account
- Verifica que las credenciales JSON sean válidas
- Revisa los logs en la interfaz web

### El navegador no se abre
- Verifica que Playwright esté instalado: `npx playwright install chromium`
- En Linux, instala dependencias: `npx playwright install-deps chromium`

---

## 💡 Consejos

✅ **Guarda las credenciales**: La interfaz las guarda automáticamente en localStorage  
✅ **Usa modo desarrollo**: `npm run dev` para recarga automática  
✅ **Revisa los logs**: Toda la información está en tiempo real  
✅ **No cierres el navegador**: Déjalo abierto mientras el bot trabaja  

---

## 📞 ¿Necesitas Ayuda?

- Lee el **README.md** completo para más detalles
- Revisa los logs en la interfaz web
- Abre las herramientas de desarrollador del navegador (F12)

---

**¡Listo para automatizar! 🚀**
