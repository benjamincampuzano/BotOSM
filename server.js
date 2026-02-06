const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Función para cargar credenciales desde la carpeta credentials
function loadCredentialsFromFolder() {
    const credentialsDir = path.join(__dirname, 'credentials');
    
    try {
        if (!fs.existsSync(credentialsDir)) {
            console.log('⚠️  Carpeta credentials no encontrada. Se usarán credenciales desde la interfaz.');
            return null;
        }

        const files = fs.readdirSync(credentialsDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        if (jsonFiles.length === 0) {
            console.log('⚠️  No hay archivos JSON en la carpeta credentials. Se usarán credenciales desde la interfaz.');
            return null;
        }

        // Buscar el primer archivo JSON que contenga "service_account" o "creds"
        let credsFile = jsonFiles.find(file => 
            file.toLowerCase().includes('service') || 
            file.toLowerCase().includes('creds') || 
            file.toLowerCase().includes('google')
        ) || jsonFiles[0];

        const credsPath = path.join(credentialsDir, credsFile);
        const credsContent = fs.readFileSync(credsPath, 'utf8');
        
        // Validar que sea un JSON válido
        const parsedCreds = JSON.parse(credsContent);
        
        console.log(`✅ Credenciales cargadas desde: credentials/${credsFile}`);
        return credsContent;
        
    } catch (error) {
        console.log('⚠️  Error al leer credenciales desde carpeta:', error.message);
        return null;
    }
}

// Cargar credenciales desde variables de entorno (prioridad para Railway)
let credsFromFile = null;

if (process.env.GOOGLE_CREDENTIALS_JSON) {
    credsFromFile = process.env.GOOGLE_CREDENTIALS_JSON;
    console.log('✅ Credenciales cargadas desde variable de entorno GOOGLE_CREDENTIALS_JSON');
} else {
    // Cargar credenciales desde la carpeta credentials (prioridad) o desde raíz (fallback)
    credsFromFile = loadCredentialsFromFolder();
    
    // Si no se encontró en la carpeta, intentar desde la raíz (mantener compatibilidad)
    if (!credsFromFile) {
        try {
            const credsPath = path.join(__dirname, 'creds.json');
            if (fs.existsSync(credsPath)) {
                credsFromFile = fs.readFileSync(credsPath, 'utf8');
                console.log('✅ Archivo creds.json encontrado en la raíz del proyecto (fallback)');
            } else {
                console.log('⚠️  No se encontraron credenciales. Se usarán credenciales desde la interfaz.');
            }
        } catch (error) {
            console.log('⚠️  Error al leer creds.json:', error.message);
        }
    }
}

// Intentar cargar configuración desde archivo
let configFromFile = null;
try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        configFromFile = JSON.parse(configContent);
        console.log('✅ Archivo config.json encontrado con configuración');
        if (configFromFile.spreadsheetId) {
            console.log(`📊 ID de Google Sheet configurado: ${configFromFile.spreadsheetId}`);
        }
    } else {
        console.log('⚠️  Archivo config.json no encontrado. Usando valores por defecto.');
    }
} catch (error) {
    console.log('⚠️  Error al leer config.json:', error.message);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos
app.use(express.static('public'));
app.use(express.json());

// --- CONFIGURACIÓN ---
const PALABRAS_CLAVE = [
    'ENVIO CV TM SIN ESCRITURA', 'ENVIO PH TM SIN ESCRITURA', 'ENVIO RAT TM SIN ESCRITURA', 
    'ENVIO NOV TM SIN ESCRITURA', 'ENVIO CPH TM SIN ESCRITURA', 'ENVIO AE TM SIN ESCRITURA', 
    'ENVIO ATO TM SIN ESCRITURA', 'ENVIO SUB TM SIN ESCRITURA', 'ENVIO SUS TM SIN ESCRITURA', 
    'ENVIO AMP TM SIN ESCRITURA', 'ENVIO CCR TM SIN ESCRITURA', 'ENVIO DON TM SIN ESCRITURA', 
    'ENVIO ACT TM SIN ESCRITURA', 'ENVIO MOR TM SIN ESCRITURA', 'ENVIO PPR TM SIN ESCRITURA', 
    'ENVIO LD TM SIN ESCRITURA', 'ENVIO AGR TM SIN ESCRITURA', 'ENVIO RUS TM SIN ESCRITURA', 
    'ENVIO COM TM SIN ESCRITURA', 'ENVIO SEP TM SIN ESCRITURA', 'ENVIO EXC TM SIN ESCRITURA', 
    'ENVIO APO TM SIN ESCRITURA', 'ENVIO LSG TM SIN ESCRITURA', 'ENVIO HER TM SIN ESCRITURA', 
    'ENVIO DNC TM SIN ESCRITURA', 'ENVIO APS TM SIN ESCRITURA', 'ENVIO ODC TM SIN ESCRITURA', 
    'ENVIO EXP TM SIN ESCRITURA', 'ENVIO CE TM SIN ESCRITURA'
]; 
const URL_BASE = 'https://www.mortgage.onesait.com/frontend#/search';
const TIMEOUT_DEFAULT = configFromFile?.timeout || 10000;
const BATCH_SAVE_SIZE = configFromFile?.batchSaveSize || 10;

let botEnEjecucion = false;
let browser = null;

// Función para emitir logs
function emitLog(socket, tipo, mensaje) {
    const log = {
        tipo,
        mensaje,
        timestamp: new Date().toISOString()
    };
    socket.emit('log', log);
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
}

async function resetearBusqueda(page, socket) {
    try {
        await Promise.all([
            page.waitForURL(/.*#\/search/, { timeout: TIMEOUT_DEFAULT }),
            page.locator('a[href="#/search"]', { hasText: 'Buscar expedientes' }).click()
        ]);
        
        await page.locator('div.ods-form-item:has-text("Número de expediente") input.ods-input__inner')
            .waitFor({ state: 'visible', timeout: TIMEOUT_DEFAULT });
        
        emitLog(socket, 'info', '🔄 Búsqueda reseteada');
    } catch (error) {
        emitLog(socket, 'warning', `⚠️ Advertencia al resetear: ${error.message}`);
        await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });
    }
}

async function procesarExpediente(page, codigo, socket) {
    const campo = page.locator('div.ods-form-item', { hasText: 'Número de expediente' })
        .locator('input.ods-input__inner')
        .first();
    
    await campo.clear();
    await campo.fill(codigo);
    
    const valorEscrito = await campo.inputValue();
    if (valorEscrito !== codigo) {
        throw new Error(`Valor no coincide: esperado "${codigo}", obtenido "${valorEscrito}"`);
    }

    const btnFiltros = page.getByRole('button', { name: /Aplicar filtros/i });
    await btnFiltros.click();
    
    const btnExp = page.locator(`button:has-text("${codigo}")`);
    
    try {
        await btnExp.waitFor({ state: 'visible', timeout: TIMEOUT_DEFAULT });
        await btnExp.click();
    } catch (error) {
        const sinResultados = await page.locator('text=/sin resultados|no se encontraron/i').isVisible();
        if (sinResultados) {
            return { encontradas: [], error: 'Sin resultados en la búsqueda' };
        }
        throw error;
    }

    await Promise.race([
        page.waitForSelector('textarea.ods-textarea__inner', { state: 'attached', timeout: TIMEOUT_DEFAULT }),
        page.waitForLoadState('networkidle', { timeout: TIMEOUT_DEFAULT })
    ]);
    
    await page.waitForTimeout(500);

    const [txtAreas, bodyTxt] = await Promise.all([
        page.$$eval('textarea.ods-textarea__inner', els => els.map(e => e.value)),
        page.textContent('body')
    ]);
    
    const fullTxt = (bodyTxt + " " + txtAreas.join(" ")).toUpperCase();
    const encontradas = PALABRAS_CLAVE.filter(p => fullTxt.includes(p.toUpperCase()));
    
    return { encontradas, error: null };
}

async function ejecutarBot(socketId, spreadsheetId, credsJson) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) return;

    try {
        botEnEjecucion = true;
        emitLog(socket, 'info', '🚀 Iniciando bot...');

        // Usar credenciales del archivo si están disponibles, si no, usar las proporcionadas
        const credsToUse = credsJson || credsFromFile;
        
        if (!credsToUse) {
            throw new Error('No se encontraron credenciales. Proporciona credenciales JSON o coloca creds.json en la raíz del proyecto.');
        }

        // Autenticación Google Sheets
        const creds = JSON.parse(credsToUse);
        emitLog(socket, 'info', '🔐 Usando credenciales ' + (credsJson ? 'proporcionadas por la interfaz' : 'desde creds.json'));
        
        const auth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        emitLog(socket, 'success', '✅ Autenticación Google exitosa');

        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const filas = await sheet.getRows();

        emitLog(socket, 'info', `📊 Cargadas ${filas.length} filas del sheet`);

        // Iniciar navegador con configuración optimizada para Railway
        browser = await chromium.launch({ 
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--disable-software-rasterizer',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--single-process' // Para Railway
            ]
        }); 
        const page = await browser.newPage();
        page.setDefaultTimeout(TIMEOUT_DEFAULT);
        page.setDefaultNavigationTimeout(TIMEOUT_DEFAULT * 2);

        await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' });
        emitLog(socket, 'success', '✅ Navegador iniciado - Por favor inicia sesión manualmente');
        
        // Esperar confirmación del usuario
        socket.emit('esperando_confirmacion');
        const confirmado = await new Promise((resolve) => {
            socket.once('confirmacion', () => resolve(true));
        });

        if (!confirmado) {
            throw new Error('Proceso cancelado por el usuario');
        }

        emitLog(socket, 'info', '▶️ Comenzando procesamiento...');

        let procesadas = 0;
        let exitosas = 0;
        let errores = 0;
        const promesasGuardado = [];

        for (let i = 0; i < filas.length; i++) {
            if (!botEnEjecucion) {
                emitLog(socket, 'warning', '⏸️ Bot detenido por el usuario');
                break;
            }

            const fila = filas[i];
            const codigo = fila.get('Codigo')?.trim();
            
            if (!codigo || fila.get('Resultado')) {
                emitLog(socket, 'info', `⏭️ Saltando fila ${i + 1}`);
                continue;
            }

            try {
                emitLog(socket, 'processing', `🔎 [${i + 1}/${filas.length}] Procesando: ${codigo}`);
                socket.emit('progreso', { actual: i + 1, total: filas.length });

                const { encontradas, error } = await procesarExpediente(page, codigo, socket);

                if (error) {
                    fila.set('Resultado', `⚠️ ${error}`);
                    emitLog(socket, 'warning', `[${codigo}] ⚠️ ${error}`);
                } else if (encontradas.length > 0) {
                    fila.set('Resultado', `✅ ${encontradas.join(', ')}`);
                    emitLog(socket, 'success', `[${codigo}] ✅ ${encontradas.length} coincidencia(s)`);
                    exitosas++;
                } else {
                    fila.set('Resultado', '❌ No encontrado');
                    emitLog(socket, 'error', `[${codigo}] ❌ No encontrado`);
                }

                procesadas++;

            } catch (error) {
                emitLog(socket, 'error', `🔴 Error en ${codigo}: ${error.message}`);
                fila.set('Resultado', '⚠️ Error - Reintentar');
                errores++;
            }

            await resetearBusqueda(page, socket);
            
            promesasGuardado.push(fila.save());
            
            if (promesasGuardado.length >= BATCH_SAVE_SIZE) {
                emitLog(socket, 'info', `💾 Guardando lote de ${promesasGuardado.length} filas...`);
                await Promise.allSettled(promesasGuardado);
                promesasGuardado.length = 0;
            }
        }

        if (promesasGuardado.length > 0) {
            emitLog(socket, 'info', `💾 Guardando últimas ${promesasGuardado.length} filas...`);
            await Promise.allSettled(promesasGuardado);
        }

        emitLog(socket, 'success', '═══════════════════════════════');
        emitLog(socket, 'success', '✨ TAREA COMPLETADA');
        emitLog(socket, 'success', `📊 Total: ${procesadas} | ✅ Exitosas: ${exitosas} | ❌ Errores: ${errores}`);
        emitLog(socket, 'success', '═══════════════════════════════');

        socket.emit('bot_completado', { procesadas, exitosas, errores });

    } catch (error) {
        emitLog(socket, 'error', `❌ Error fatal: ${error.message}`);
        socket.emit('bot_error', error.message);
    } finally {
        if (browser) {
            await browser.close();
            browser = null;
        }
        botEnEjecucion = false;
    }
}

// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check para Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/creds-exists', (req, res) => {
    let source = 'No encontrado';
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        source = 'Variable de entorno GOOGLE_CREDENTIALS_JSON';
    } else if (credsFromFile) {
        source = 'Carpeta credentials o raíz';
    }
    
    res.json({ 
        exists: credsFromFile !== null,
        source: source
    });
});

app.get('/api/creds', (req, res) => {
    if (credsFromFile) {
        res.json({ creds: credsFromFile });
    } else {
        res.status(404).json({ error: 'Archivo creds.json no encontrado' });
    }
});

app.get('/api/config', (req, res) => {
    res.json({
        hasConfig: configFromFile !== null,
        spreadsheetId: configFromFile?.spreadsheetId || null,
        timeout: configFromFile?.timeout || TIMEOUT_DEFAULT,
        batchSaveSize: configFromFile?.batchSaveSize || BATCH_SAVE_SIZE
    });
});

app.post('/api/iniciar', async (req, res) => {
    if (botEnEjecucion) {
        return res.status(400).json({ error: 'El bot ya está en ejecución' });
    }

    const { spreadsheetId, creds } = req.body;
    
    if (!spreadsheetId || !creds) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    res.json({ success: true, message: 'Bot iniciado' });
});

app.post('/api/detener', (req, res) => {
    botEnEjecucion = false;
    res.json({ success: true, message: 'Deteniendo bot...' });
});

// API endpoints para Google Sheets
app.get('/api/sheets/data', async (req, res) => {
    try {
        const { spreadsheetId, creds } = req.query;
        
        if (!spreadsheetId) {
            return res.status(400).json({ error: 'Se requiere spreadsheetId' });
        }

        const credsToUse = creds || credsFromFile;
        if (!credsToUse) {
            return res.status(400).json({ error: 'Se requieren credenciales' });
        }

        const credentials = typeof credsToUse === 'string' ? JSON.parse(credsToUse) : credsToUse;
        
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        const data = rows.map(row => {
            const rowData = {};
            Object.keys(row).forEach(key => {
                if (key !== '_rawData' && key !== '_sheet' && key !== '_rowNumber') {
                    rowData[key] = row[key];
                }
            });
            return rowData;
        });

        res.json({ 
            success: true, 
            data: data,
            sheetTitle: sheet.title,
            totalRows: rows.length
        });
    } catch (error) {
        console.error('Error al leer Google Sheet:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/sheets/data', async (req, res) => {
    try {
        const { spreadsheetId, creds, rowIndex, columnData } = req.body;
        
        if (!spreadsheetId || !rowIndex || !columnData) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }

        const credsToUse = creds || credsFromFile;
        if (!credsToUse) {
            return res.status(400).json({ error: 'Se requieren credenciales' });
        }

        const credentials = typeof credsToUse === 'string' ? JSON.parse(credsToUse) : credsToUse;
        
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        if (rowIndex < 0 || rowIndex >= rows.length) {
            return res.status(400).json({ error: 'Índice de fila inválido' });
        }

        const row = rows[rowIndex];
        Object.keys(columnData).forEach(column => {
            row.set(column, columnData[column]);
        });

        await row.save();

        res.json({ 
            success: true, 
            message: 'Fila actualizada correctamente' 
        });
    } catch (error) {
        console.error('Error al actualizar Google Sheet:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/sheets/row', async (req, res) => {
    try {
        const { spreadsheetId, creds, rowData } = req.body;
        
        if (!spreadsheetId || !rowData) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }

        const credsToUse = creds || credsFromFile;
        if (!credsToUse) {
            return res.status(400).json({ error: 'Se requieren credenciales' });
        }

        const credentials = typeof credsToUse === 'string' ? JSON.parse(credsToUse) : credsToUse;
        
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        const newRow = await sheet.addRow(rowData);

        res.json({ 
            success: true, 
            message: 'Fila agregada correctamente',
            rowIndex: sheet.rowCount - 1
        });
    } catch (error) {
        console.error('Error al agregar fila a Google Sheet:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/sheets/row', async (req, res) => {
    try {
        const { spreadsheetId, creds, rowIndex } = req.body;
        
        if (!spreadsheetId || rowIndex === undefined) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }

        const credsToUse = creds || credsFromFile;
        if (!credsToUse) {
            return res.status(400).json({ error: 'Se requieren credenciales' });
        }

        const credentials = typeof credsToUse === 'string' ? JSON.parse(credsToUse) : credsToUse;
        
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        if (rowIndex < 0 || rowIndex >= rows.length) {
            return res.status(400).json({ error: 'Índice de fila inválido' });
        }

        await rows[rowIndex].delete();

        res.json({ 
            success: true, 
            message: 'Fila eliminada correctamente' 
        });
    } catch (error) {
        console.error('Error al eliminar fila de Google Sheet:', error);
        res.status(500).json({ error: error.message });
    }
});

// WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('iniciar_bot', async (data) => {
        if (botEnEjecucion) {
            socket.emit('error', 'El bot ya está en ejecución');
            return;
        }

        const { spreadsheetId, creds } = data;
        ejecutarBot(socket.id, spreadsheetId, creds);
    });

    socket.on('detener_bot', () => {
        botEnEjecucion = false;
        emitLog(socket, 'warning', '⏹️ Deteniendo bot...');
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
        botEnEjecucion = false;
    });
});

const PORT = process.env.PORT || 8080;

// Health check para Railway
app.get('/health', (req, res) => {
    console.log('Health check endpoint called');
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        port: PORT
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📱 Health check disponible en http://0.0.0.0:${PORT}/health`);
});
