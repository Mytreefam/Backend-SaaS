#!/usr/bin/env node

/**
 * Script para generar iconos de Android en múltiples resoluciones
 * 
 * Uso:
 *   node scripts/generate-icons.js
 * 
 * Requisitos:
 *   - Tener sharp instalado: npm install sharp
 *   - Icono original en: assets/icons/icon-1024.png (1024x1024)
 */

const fs = require('fs');
const path = require('path');

// Verificar si sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: Sharp no está instalado.');
  console.error('📦 Instálalo con: npm install sharp');
  process.exit(1);
}

// Configuración
const ICON_SOURCE = path.join(__dirname, '..', 'assets', 'icons', 'icon-1024.png');
const ANDROID_RES_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Resoluciones para Android
const ANDROID_SIZES = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 }
];

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Verificar que el icono original existe
 */
function checkSourceIcon() {
  console.log(`${colors.blue}🔍 Verificando icono original...${colors.reset}`);
  
  if (!fs.existsSync(ICON_SOURCE)) {
    console.error(`${colors.red}❌ Error: No se encontró el icono original en:${colors.reset}`);
    console.error(`   ${ICON_SOURCE}`);
    console.error('');
    console.error(`${colors.yellow}💡 Solución:${colors.reset}`);
    console.error('   1. Crea la carpeta: mkdir -p assets/icons');
    console.error('   2. Coloca tu icono de 1024x1024 en: assets/icons/icon-1024.png');
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ Icono original encontrado${colors.reset}`);
}

/**
 * Crear directorios si no existen
 */
function createDirectories() {
  console.log(`${colors.blue}📁 Creando directorios...${colors.reset}`);
  
  ANDROID_SIZES.forEach(({ folder }) => {
    const dir = path.join(ANDROID_RES_DIR, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   ✓ Creado: ${folder}`);
    }
  });
  
  console.log(`${colors.green}✅ Directorios listos${colors.reset}`);
}

/**
 * Generar iconos en diferentes resoluciones
 */
async function generateIcons() {
  console.log(`${colors.blue}🎨 Generando iconos...${colors.reset}`);
  
  for (const { folder, size } of ANDROID_SIZES) {
    const outputPath = path.join(ANDROID_RES_DIR, folder, 'ic_launcher.png');
    
    try {
      await sharp(ICON_SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 13, g: 148, b: 136, alpha: 1 } // #0d9488
        })
        .png()
        .toFile(outputPath);
      
      console.log(`   ${colors.green}✓${colors.reset} ${folder}/ic_launcher.png (${size}x${size})`);
    } catch (error) {
      console.error(`   ${colors.red}✗${colors.reset} Error en ${folder}: ${error.message}`);
    }
  }
  
  console.log(`${colors.green}✅ Iconos generados correctamente${colors.reset}`);
}

/**
 * Generar icono redondo (ic_launcher_round.png)
 */
async function generateRoundIcons() {
  console.log(`${colors.blue}🔵 Generando iconos redondos...${colors.reset}`);
  
  for (const { folder, size } of ANDROID_SIZES) {
    const outputPath = path.join(ANDROID_RES_DIR, folder, 'ic_launcher_round.png');
    
    try {
      // Crear máscara circular
      const circleBuffer = Buffer.from(
        `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`
      );
      
      await sharp(ICON_SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 13, g: 148, b: 136, alpha: 1 }
        })
        .composite([{
          input: circleBuffer,
          blend: 'dest-in'
        }])
        .png()
        .toFile(outputPath);
      
      console.log(`   ${colors.green}✓${colors.reset} ${folder}/ic_launcher_round.png (${size}x${size})`);
    } catch (error) {
      console.error(`   ${colors.red}✗${colors.reset} Error en ${folder}: ${error.message}`);
    }
  }
  
  console.log(`${colors.green}✅ Iconos redondos generados${colors.reset}`);
}

/**
 * Generar iconos foreground para adaptive icons
 */
async function generateForegroundIcons() {
  console.log(`${colors.blue}📱 Generando iconos foreground (adaptive)...${colors.reset}`);
  
  for (const { folder, size } of ANDROID_SIZES) {
    const outputPath = path.join(ANDROID_RES_DIR, folder, 'ic_launcher_foreground.png');
    
    try {
      // El foreground debe ser el icono con padding (108dp grid)
      // El icono debe estar en el centro 72dp (66% del total)
      const foregroundSize = Math.round(size * 1.5); // 108dp equivalente
      
      await sharp(ICON_SOURCE)
        .resize(foregroundSize, foregroundSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparente
        })
        .png()
        .toFile(outputPath);
      
      console.log(`   ${colors.green}✓${colors.reset} ${folder}/ic_launcher_foreground.png (${foregroundSize}x${foregroundSize})`);
    } catch (error) {
      console.error(`   ${colors.red}✗${colors.reset} Error en ${folder}: ${error.message}`);
    }
  }
  
  console.log(`${colors.green}✅ Iconos foreground generados${colors.reset}`);
}

/**
 * Generar icono de notificación (monocromo)
 */
async function generateNotificationIcon() {
  console.log(`${colors.blue}🔔 Generando icono de notificación...${colors.reset}`);
  
  const notificationSizes = [
    { folder: 'drawable-mdpi', size: 24 },
    { folder: 'drawable-hdpi', size: 36 },
    { folder: 'drawable-xhdpi', size: 48 },
    { folder: 'drawable-xxhdpi', size: 72 },
    { folder: 'drawable-xxxhdpi', size: 96 }
  ];
  
  for (const { folder, size } of notificationSizes) {
    const dir = path.join(ANDROID_RES_DIR, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const outputPath = path.join(dir, 'ic_stat_notification.png');
    
    try {
      await sharp(ICON_SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .greyscale() // Convertir a escala de grises
        .png()
        .toFile(outputPath);
      
      console.log(`   ${colors.green}✓${colors.reset} ${folder}/ic_stat_notification.png (${size}x${size})`);
    } catch (error) {
      console.error(`   ${colors.red}✗${colors.reset} Error en ${folder}: ${error.message}`);
    }
  }
  
  console.log(`${colors.green}✅ Icono de notificación generado${colors.reset}`);
}

/**
 * Mostrar resumen
 */
function showSummary() {
  console.log('');
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ GENERACIÓN DE ICONOS COMPLETADA${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}📊 Iconos generados:${colors.reset}`);
  console.log(`   • ${ANDROID_SIZES.length} resoluciones estándar (mdpi - xxxhdpi)`);
  console.log(`   • ${ANDROID_SIZES.length} iconos redondos`);
  console.log(`   • ${ANDROID_SIZES.length} iconos foreground (adaptive)`);
  console.log(`   • 5 tamaños de icono de notificación`);
  console.log('');
  console.log(`${colors.blue}📁 Ubicación:${colors.reset}`);
  console.log(`   ${ANDROID_RES_DIR}`);
  console.log('');
  console.log(`${colors.green}🚀 Próximos pasos:${colors.reset}`);
  console.log(`   1. Verifica los iconos en Android Studio`);
  console.log(`   2. Sincroniza con Capacitor: npx cap sync android`);
  console.log(`   3. Compila la app: npx cap open android`);
  console.log('');
}

/**
 * Función principal
 */
async function main() {
  console.log('');
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   🎨 GENERADOR DE ICONOS ANDROID - UDAR EDGE${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
  console.log('');
  
  try {
    checkSourceIcon();
    createDirectories();
    await generateIcons();
    await generateRoundIcons();
    await generateForegroundIcons();
    await generateNotificationIcon();
    showSummary();
  } catch (error) {
    console.error(`${colors.red}❌ Error fatal: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar
main();
