const { chromium } = require('playwright');

async function testBrowser() {
    console.log('🧪 Iniciando prueba del navegador...');
    
    try {
        // Estrategia 1: Usar Firefox en lugar de Chrome
        console.log('🦊 Probando con Firefox...');
        
        const { firefox } = require('playwright');
        const browser = await firefox.launch({ 
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        console.log('✅ Navegador Firefox iniciado correctamente');
        
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            viewport: { width: 1920, height: 1080 },
            locale: 'es-ES',
            timezoneId: 'Europe/Madrid'
        });
        
        const page = await context.newPage();
        
        // Configurar la página para evitar detección
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
        
        console.log('✅ Nueva página creada y configurada');
        
        // Probar navegación a la página del bot
        const URL_BASE = 'https://www.mortgage.onesait.com/frontend#/search';
        console.log(`🌐 Navegando a: ${URL_BASE}`);
        
        await page.goto(URL_BASE, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('✅ Página cargada');
        
        const title = await page.title();
        const url = page.url();
        
        console.log(`📄 Título: ${title}`);
        console.log(`🌐 URL actual: ${url}`);
        
        // Esperar un momento más para que cargue todo
        await page.waitForTimeout(5000);
        
        // Buscar elementos clave
        const searchInputs = await page.locator('input').count();
        const buttons = await page.locator('button').count();
        
        console.log(`🔍 Inputs encontrados: ${searchInputs}`);
        console.log(`🔘 Botones encontrados: ${buttons}`);
        
        // Si sigue con 403, probar otra estrategia
        if (title.includes('403')) {
            console.log('⚠️ Sigue con 403, probando estrategia 2...');
            
            // Estrategia 2: Acceder a la página principal primero
            await page.goto('https://www.mortgage.onesait.com', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            await page.waitForTimeout(3000);
            
            const mainTitle = await page.title();
            console.log(`� Título página principal: ${mainTitle}`);
            
            // Luego navegar a la sección específica
            await page.goto(URL_BASE, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            await page.waitForTimeout(3000);
            
            const finalTitle = await page.title();
            const finalUrl = page.url();
            
            console.log(`� Título final: ${finalTitle}`);
            console.log(`🌐 URL final: ${finalUrl}`);
        }
        
        // Tomar screenshot para depuración
        await page.screenshot({ path: 'test-firefox.png', fullPage: true });
        console.log('📸 Screenshot guardado como test-firefox.png');
        
        // Esperar 10 segundos para inspección manual
        console.log('⏳ Esperando 10 segundos para inspección manual...');
        await page.waitForTimeout(10000);
        
        await browser.close();
        console.log('✅ Prueba completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error('Stack:', error.stack);
    }
}

testBrowser();
