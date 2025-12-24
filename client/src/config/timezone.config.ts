/**
 * CONFIGURACIÓN DE ZONAS HORARIAS
 * 
 * Sistema de conversión automática de hora de referencia
 * a hora local del usuario
 */

export interface TimezoneConfig {
  empresaId: string;
  zonaHorariaReferencia: string; // Ej: "Europe/Madrid", "America/Mexico_City"
  nombreZonaHoraria: string; // Ej: "Hora de España (CET)", "Hora de México (CST)"
  horaEjecucionReferencia: number; // Hora en zona de referencia (0-23)
  minutoEjecucionReferencia: number; // Minuto en zona de referencia (0-59)
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO
// ============================================================================

const DEFAULT_TIMEZONE_CONFIG: TimezoneConfig = {
  empresaId: 'udar-edge',
  zonaHorariaReferencia: 'Europe/Madrid', // España
  nombreZonaHoraria: 'Hora de España (CET/CEST)',
  horaEjecucionReferencia: 5, // 5:00 AM
  minutoEjecucionReferencia: 0
};

// ============================================================================
// ZONAS HORARIAS DISPONIBLES
// ============================================================================

export const ZONAS_HORARIAS_DISPONIBLES = [
  // Europa
  { value: 'Europe/Madrid', label: 'España (CET/CEST)', offset: '+01:00' },
  { value: 'Europe/London', label: 'Reino Unido (GMT/BST)', offset: '+00:00' },
  { value: 'Europe/Paris', label: 'Francia (CET/CEST)', offset: '+01:00' },
  { value: 'Europe/Berlin', label: 'Alemania (CET/CEST)', offset: '+01:00' },
  
  // América
  { value: 'America/Mexico_City', label: 'México (CST/CDT)', offset: '-06:00' },
  { value: 'America/Bogota', label: 'Colombia (COT)', offset: '-05:00' },
  { value: 'America/Lima', label: 'Perú (PET)', offset: '-05:00' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (ART)', offset: '-03:00' },
  { value: 'America/Santiago', label: 'Chile (CLT/CLST)', offset: '-04:00' },
  { value: 'America/Caracas', label: 'Venezuela (VET)', offset: '-04:00' },
  { value: 'America/New_York', label: 'EE.UU. Este (EST/EDT)', offset: '-05:00' },
  { value: 'America/Los_Angeles', label: 'EE.UU. Pacífico (PST/PDT)', offset: '-08:00' },
  
  // Asia
  { value: 'Asia/Tokyo', label: 'Japón (JST)', offset: '+09:00' },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: '+08:00' },
  { value: 'Asia/Dubai', label: 'EAU (GST)', offset: '+04:00' },
];

// ============================================================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================================================

/**
 * Obtener configuración de zona horaria guardada
 */
export function obtenerConfiguracionZonaHoraria(): TimezoneConfig {
  const configJson = localStorage.getItem('udar_timezone_config');
  if (configJson) {
    try {
      return JSON.parse(configJson);
    } catch (e) {
      console.error('Error parseando configuración de zona horaria:', e);
    }
  }
  return DEFAULT_TIMEZONE_CONFIG;
}

/**
 * Guardar configuración de zona horaria
 */
export function guardarConfiguracionZonaHoraria(config: TimezoneConfig): void {
  localStorage.setItem('udar_timezone_config', JSON.stringify(config));
  console.log('✅ Configuración de zona horaria guardada:', config);
}

/**
 * Actualizar solo la zona horaria de referencia
 */
export function actualizarZonaHorariaReferencia(
  zonaHoraria: string,
  nombreZonaHoraria: string
): void {
  const config = obtenerConfiguracionZonaHoraria();
  config.zonaHorariaReferencia = zonaHoraria;
  config.nombreZonaHoraria = nombreZonaHoraria;
  guardarConfiguracionZonaHoraria(config);
}

/**
 * Actualizar hora de ejecución en zona de referencia
 */
export function actualizarHoraEjecucionReferencia(
  hora: number,
  minuto: number
): void {
  const config = obtenerConfiguracionZonaHoraria();
  config.horaEjecucionReferencia = hora;
  config.minutoEjecucionReferencia = minuto;
  guardarConfiguracionZonaHoraria(config);
}

// ============================================================================
// FUNCIONES DE CONVERSIÓN
// ============================================================================

/**
 * Convierte hora de referencia a hora local del usuario
 * 
 * @param horaReferencia - Hora en zona de referencia (0-23)
 * @param minutoReferencia - Minuto en zona de referencia (0-59)
 * @param zonaHorariaReferencia - Zona horaria de referencia (IANA timezone)
 * @returns Date con la hora local equivalente
 */
export function convertirAHoraLocal(
  horaReferencia: number,
  minutoReferencia: number,
  zonaHorariaReferencia: string
): Date {
  // Crear fecha de hoy en zona de referencia
  const hoy = new Date();
  
  // Formatear fecha en zona de referencia
  const fechaRefString = hoy.toLocaleString('en-US', {
    timeZone: zonaHorariaReferencia,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Crear fecha en zona de referencia con la hora específica
  const [mes, dia, año] = fechaRefString.split('/');
  const fechaEnReferencia = new Date(`${año}-${mes}-${dia}T${horaReferencia.toString().padStart(2, '0')}:${minutoReferencia.toString().padStart(2, '0')}:00`);
  
  // Obtener offset de la zona de referencia
  const offsetReferenciaMs = obtenerOffsetZonaHoraria(zonaHorariaReferencia);
  
  // Obtener offset local
  const offsetLocalMs = hoy.getTimezoneOffset() * -60 * 1000;
  
  // Calcular diferencia
  const diferenciaMs = offsetLocalMs - offsetReferenciaMs;
  
  // Crear fecha local ajustada
  const fechaLocal = new Date(fechaEnReferencia.getTime() + diferenciaMs);
  
  return fechaLocal;
}

/**
 * Obtiene el offset en milisegundos de una zona horaria
 */
function obtenerOffsetZonaHoraria(zonaHoraria: string): number {
  const ahora = new Date();
  
  // Obtener fecha/hora en UTC
  const utcString = ahora.toLocaleString('en-US', { timeZone: 'UTC' });
  const utcDate = new Date(utcString);
  
  // Obtener fecha/hora en zona horaria específica
  const tzString = ahora.toLocaleString('en-US', { timeZone: zonaHoraria });
  const tzDate = new Date(tzString);
  
  // Diferencia = offset
  return tzDate.getTime() - utcDate.getTime();
}

/**
 * Obtiene la próxima ejecución en hora local del usuario
 */
export function obtenerProximaEjecucionLocal(): {
  fechaLocal: Date;
  fechaReferencia: Date;
  nombreZonaReferencia: string;
  horaReferenciaStr: string;
  horaLocalStr: string;
} {
  const config = obtenerConfiguracionZonaHoraria();
  
  // Convertir a hora local
  const fechaLocal = convertirAHoraLocal(
    config.horaEjecucionReferencia,
    config.minutoEjecucionReferencia,
    config.zonaHorariaReferencia
  );
  
  // Si ya pasó hoy, mover a mañana
  const ahora = new Date();
  if (ahora >= fechaLocal) {
    fechaLocal.setDate(fechaLocal.getDate() + 1);
  }
  
  // Crear fecha en zona de referencia para mostrar
  const fechaReferencia = new Date();
  fechaReferencia.setHours(config.horaEjecucionReferencia, config.minutoEjecucionReferencia, 0, 0);
  if (ahora >= fechaReferencia) {
    fechaReferencia.setDate(fechaReferencia.getDate() + 1);
  }
  
  return {
    fechaLocal,
    fechaReferencia,
    nombreZonaReferencia: config.nombreZonaHoraria,
    horaReferenciaStr: `${config.horaEjecucionReferencia.toString().padStart(2, '0')}:${config.minutoEjecucionReferencia.toString().padStart(2, '0')}`,
    horaLocalStr: `${fechaLocal.getHours().toString().padStart(2, '0')}:${fechaLocal.getMinutes().toString().padStart(2, '0')}`
  };
}

/**
 * Verifica si debe ejecutarse el cron job (comparando con hora local convertida)
 */
export function debeEjecutarseCron(ultimaEjecucion: Date | null): boolean {
  const ahora = new Date();
  const config = obtenerConfiguracionZonaHoraria();
  
  // Si nunca se ejecutó, ejecutar
  if (!ultimaEjecucion) {
    return true;
  }
  
  // Convertir hora de referencia a hora local
  const horaEjecucionLocal = convertirAHoraLocal(
    config.horaEjecucionReferencia,
    config.minutoEjecucionReferencia,
    config.zonaHorariaReferencia
  );
  
  // Verificar si ya se ejecutó hoy
  const yaSeEjecutoHoy = ultimaEjecucion.toDateString() === ahora.toDateString();
  
  // Verificar si ya pasó la hora
  const yaPasoLaHora = ahora.getHours() > horaEjecucionLocal.getHours() || 
                       (ahora.getHours() === horaEjecucionLocal.getHours() && 
                        ahora.getMinutes() >= horaEjecucionLocal.getMinutes());
  
  return yaPasoLaHora && !yaSeEjecutoHoy;
}