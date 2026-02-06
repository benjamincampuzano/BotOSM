# Configuración para Railway

## Variables de Entorno Requeridas

### 1. Credenciales de Google Service Account
**Nombre:** `GOOGLE_CREDENTIALS_JSON`
**Valor:** El contenido completo del archivo JSON de credenciales

**Ejemplo:**
```
{"type": "service_account", "project_id": "tu-proyecto", "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", "client_email": "tu-servicio@tu-proyecto.iam.gserviceaccount.com", "client_id": "123456789"}
```

### 2. ID de Google Sheet (Opcional)
**Nombre:** `SPREADSHEET_ID`
**Valor:** El ID de tu Google Sheet

**Ejemplo:**
```
1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc
```

## Pasos para configurar en Railway:

1. **Ve a tu proyecto en Railway**
2. **Click en "Settings" tab**
3. **Click en "Variables"**
4. **Agrega las variables de entorno:**
   - `GOOGLE_CREDENTIALS_JSON` = (pega el JSON completo)
   - `SPREADSHEET_ID` = (tu ID del sheet)

5. **Redeploy tu proyecto**

## Notas importantes:
- El JSON debe estar en una sola línea sin saltos de línea extra
- Reemplaza las comillas dobles internas con `\"` si es necesario
- El sistema detectará automáticamente las variables de entorno y las usará

## Estructura de prioridad:
1. **Variables de entorno** (Railway) - Prioridad máxima
2. **Carpeta ./credentials** - Desarrollo local
3. **Archivo creds.json** - Compatibilidad
4. **Entrada manual** - Interfaz web
