const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { chromium } = require('playwright');
const creds = require('./creds.json');
const readline = require('readline');

// --- CONFIGURACIÓN ---
const SPREADSHEET_ID = '1uOR3oS2bmBKFKOsC9mht12890ALET-XGH6AHBGNUOBc'; 
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
    'ENVIO EXP TM SIN ESCRITURA', 'ENVIO CE TM SIN ESCRITURA', 'RAT INSCRITA', 'ENVIO RAT TM'
]; 
const URL_BASE = 'https://www.mortgage.onesait.com/frontend#/search';

function esperarConfirmacion() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question('\n✅ SESIÓN LISTA: Presiona ENTER para iniciar', () => {
        rl.close();
        resolve();
    }));
}

async function iniciarBot() {
    const auth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const filas = await sheet.getRows();

    const browser = await chromium.launch({ headless: false }); 
    const page = await browser.newPage();

    await page.goto(URL_BASE, { waitUntil: 'commit' }); // Carga más rápida inicial
    await esperarConfirmacion();

    for (let fila of filas) {
        const codigo = fila.get('Codigo')?.trim();
        if (!codigo || fila.get('Resultado')) continue;

        try {
            console.log(`🔎 Procesando: ${codigo}`);

            // 1. Escritura ultra rápida
            const campo = page.locator('div.ods-form-item', { hasText: 'Número de expediente' }).locator('input.ods-input__inner').first();
            await campo.fill(codigo); // Fill es más rápido que type si la web lo permite

            // 2. Clic y espera mínima necesaria
            await page.getByRole('button', { name: /Aplicar filtros/i }).click();
            
            // Esperamos al botón o a que la tabla se actualice (esto es más rápido que un timeout fijo)
            const btnExp = page.locator(`button:has-text("${codigo}")`);
            await btnExp.waitFor({ state: 'visible', timeout: 5000 });
            await btnExp.click();

            // 3. Espera inteligente a los datos
            await page.waitForSelector('textarea.ods-textarea__inner', { state: 'attached', timeout: 5000 });

            // 4. Extracción masiva y rápida
            const [txtAreas, bodyTxt] = await Promise.all([
                page.$$eval('textarea.ods-textarea__inner', els => els.map(e => e.value)),
                page.textContent('body')
            ]);
            
            const fullTxt = (bodyTxt + " " + txtAreas.join(" ")).toUpperCase();

            // 5. Encontrar TODAS las coincidencias (por si hay más de una)
            let encontradas = PALABRAS_CLAVE.filter(p => fullTxt.includes(p.toUpperCase()));

            if (encontradas.length > 0) {
                // Si hay varias, las separa con comas
                fila.set('Resultado', `✅ ${encontradas.join(', ')}`);
                console.log(`[${codigo}] Encontrado: ${encontradas.length} coincidencia(s)`);
            } else {
                fila.set('Resultado', '❌ No encontrado');
            }

        } catch (error) {
            console.error(`🔴 Salto en ${codigo}: Posible retraso de red.`);
            fila.set('Resultado', '⚠️ Reintentar');
        }

        // 6. Reseteo instantáneo
        await page.locator('a[href="#/search"]', { hasText: 'Buscar expedientes' }).evaluate(el => el.click());
        
        // Guardado asíncrono para no frenar el navegador
        fila.save().catch(e => console.error("Error al guardar en Sheets"));
    }

    console.log('✨ Tarea completada.');
    await browser.close();
}

iniciarBot().catch(console.error);