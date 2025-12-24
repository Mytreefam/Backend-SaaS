#!/usr/bin/env node

/**
 * UDAR EDGE - Validador de Variables de Entorno
 * 
 * Verifica que todas las variables necesarias estén configuradas
 * antes de ejecutar la aplicación.
 */

const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Variables requeridas por categoría
const requiredVars = {
  'Configuración General': [
    'VITE_APP_URL',
    'VITE_APP_NAME',
  ],
  'Backend API': [
    'VITE_API_URL',
  ],
  'Supabase (Base de Datos)': [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ],
  'Multi-Tenant': [
    'VITE_TENANT_SLUG',
    'VITE_PLAN',
  ],
};

// Variables opcionales pero recomendadas
const recommendedVars = {
  'OAuth': [
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_FACEBOOK_APP_ID',
    'VITE_APPLE_CLIENT_ID',
  ],
  'Firebase Push Notifications': [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
  ],
  'Pagos': [
    'VITE_STRIPE_PUBLIC_KEY',
  ],
  'Analytics': [
    'VITE_GA_TRACKING_ID',
  ],
};

// ============================================================================
// FUNCIONES
// ============================================================================

/**
 * Lee el archivo .env
 */
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    // Ignorar comentarios y líneas vacías
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

/**
 * Valida una variable de entorno
 */
function validateVar(envVars, varName) {
  const value = envVars[varName];
  
  if (!value || value === '') {
    return { valid: false, reason: 'No definida' };
  }
  
  // Verificar si tiene placeholder
  if (value.includes('xxxxx') || value.includes('XXXXX')) {
    return { valid: false, reason: 'Contiene placeholder' };
  }
  
  // Validaciones específicas
  if (varName.includes('URL') && !value.startsWith('http')) {
    return { valid: false, reason: 'URL inválida' };
  }
  
  if (varName.includes('EMAIL') && !value.includes('@')) {
    return { valid: false, reason: 'Email inválido' };
  }
  
  return { valid: true };
}

/**
 * Imprime resultado de validación
 */
function printValidation(varName, result) {
  const icon = result.valid ? '✅' : '❌';
  const color = result.valid ? colors.green : colors.red;
  const reason = result.valid ? '' : ` (${result.reason})`;
  
  console.log(`  ${icon} ${color}${varName}${colors.reset}${reason}`);
}

/**
 * Imprime encabezado de sección
 */
function printSection(title) {
  console.log(`\n${colors.cyan}━━━ ${title} ━━━${colors.reset}`);
}

/**
 * Imprime mensaje de advertencia
 */
function printWarning(message) {
  console.log(`\n${colors.yellow}⚠️  ${message}${colors.reset}`);
}

/**
 * Imprime mensaje de error
 */
function printError(message) {
  console.log(`\n${colors.red}❌ ${message}${colors.reset}`);
}

/**
 * Imprime mensaje de éxito
 */
function printSuccess(message) {
  console.log(`\n${colors.green}✅ ${message}${colors.reset}`);
}

// ============================================================================
// MAIN
// ============================================================================

console.log(`
${colors.blue}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🔍  UDAR EDGE - Validador de Variables de Entorno      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`);

// Cargar archivo .env
const envVars = loadEnvFile();

if (!envVars) {
  printError('Archivo .env no encontrado');
  console.log('\n📝 Para crear el archivo .env:');
  console.log('   1. Copiar el template: cp .env.example .env');
  console.log('   2. Editar .env con tus credenciales reales');
  console.log('   3. Volver a ejecutar: npm run validate-env\n');
  process.exit(1);
}

let totalErrors = 0;
let totalWarnings = 0;

// Validar variables requeridas
printSection('Variables REQUERIDAS');

Object.entries(requiredVars).forEach(([category, vars]) => {
  console.log(`\n${colors.yellow}${category}:${colors.reset}`);
  
  vars.forEach(varName => {
    const result = validateVar(envVars, varName);
    printValidation(varName, result);
    
    if (!result.valid) {
      totalErrors++;
    }
  });
});

// Validar variables recomendadas
printSection('Variables RECOMENDADAS (opcionales)');

Object.entries(recommendedVars).forEach(([category, vars]) => {
  console.log(`\n${colors.yellow}${category}:${colors.reset}`);
  
  vars.forEach(varName => {
    const result = validateVar(envVars, varName);
    const icon = result.valid ? '✅' : '⚠️';
    const color = result.valid ? colors.green : colors.yellow;
    const reason = result.valid ? '' : ` (${result.reason})`;
    
    console.log(`  ${icon} ${color}${varName}${colors.reset}${reason}`);
    
    if (!result.valid) {
      totalWarnings++;
    }
  });
});

// Resumen
console.log('\n' + '='.repeat(60));

if (totalErrors === 0 && totalWarnings === 0) {
  printSuccess('¡Todas las variables están configuradas correctamente! 🎉');
  process.exit(0);
} else if (totalErrors === 0) {
  printWarning(`${totalWarnings} variables recomendadas faltantes`);
  console.log('\n💡 Tip: Estas variables son opcionales pero mejoran la funcionalidad');
  process.exit(0);
} else {
  printError(`${totalErrors} errores encontrados`);
  
  if (totalWarnings > 0) {
    printWarning(`${totalWarnings} advertencias adicionales`);
  }
  
  console.log('\n📝 Acciones requeridas:');
  console.log('   1. Editar archivo .env');
  console.log('   2. Completar las variables marcadas con ❌');
  console.log('   3. Volver a ejecutar: npm run validate-env\n');
  
  process.exit(1);
}
