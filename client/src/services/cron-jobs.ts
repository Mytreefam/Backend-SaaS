/**
 * 🕐 SISTEMA DE CRON JOBS - TAREAS PROGRAMADAS
 * 
 * Simula tareas automáticas que se ejecutan a horas específicas
 * En producción, esto se ejecutaría en el backend (Supabase Edge Functions)
 * 
 * CONFIGURACIÓN:
 * - Ejecución diaria a las 5:00 AM
 * - Verifica al cargar la app si debe ejecutarse
 * - Registra log de ejecuciones en localStorage
 */

import { fichajes, validarFichaje, obtenerFichajesIncompletos } from '../data/fichajes';
import { trabajadores } from '../data/trabajadores';
import { calcularAbsentismo } from '../data/fichajes';
import { actualizarTodosTrabajadores } from '../data/trabajadores-integracion-fichajes';
import { 
  obtenerConfiguracionZonaHoraria, 
  obtenerProximaEjecucionLocal,
  debeEjecutarseCron 
} from '../config/timezone.config';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

export interface CronJobLog {
  id: string;
  fecha: string;
  hora: string;
  tareasEjecutadas: string[];
  resultados: {
    [key: string]: any;
  };
  estado: 'success' | 'error' | 'partial';
  duracionMs: number;
}

const CRON_CONFIG = {
  HORA_EJECUCION: 5, // 5:00 AM
  MINUTO_EJECUCION: 0,
  STORAGE_KEY_ULTIMA_EJECUCION: 'udar_ultima_ejecucion_cron',
  STORAGE_KEY_LOGS: 'udar_cron_logs',
  MAX_LOGS: 30, // Guardar últimos 30 días
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene la última vez que se ejecutó el cron job
 */
function obtenerUltimaEjecucion(): Date | null {
  const timestamp = localStorage.getItem(CRON_CONFIG.STORAGE_KEY_ULTIMA_EJECUCION);
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Guarda el timestamp de la última ejecución
 */
function guardarUltimaEjecucion(fecha: Date): void {
  localStorage.setItem(CRON_CONFIG.STORAGE_KEY_ULTIMA_EJECUCION, fecha.toISOString());
}

/**
 * Obtiene todos los logs de ejecuciones anteriores
 */
export function obtenerLogsEjecuciones(): CronJobLog[] {
  const logsJson = localStorage.getItem(CRON_CONFIG.STORAGE_KEY_LOGS);
  return logsJson ? JSON.parse(logsJson) : [];
}

/**
 * Guarda un nuevo log de ejecución
 */
function guardarLog(log: CronJobLog): void {
  const logs = obtenerLogsEjecuciones();
  logs.unshift(log); // Agregar al inicio
  
  // Mantener solo los últimos MAX_LOGS
  const logsLimitados = logs.slice(0, CRON_CONFIG.MAX_LOGS);
  
  localStorage.setItem(CRON_CONFIG.STORAGE_KEY_LOGS, JSON.stringify(logsLimitados));
}

/**
 * Verifica si debe ejecutarse el cron job
 * NUEVO: Usa sistema de conversión de zona horaria
 */
export function debeEjecutarse(): boolean {
  const ultimaEjecucion = obtenerUltimaEjecucion();
  return debeEjecutarseCron(ultimaEjecucion);
}

/**
 * Obtiene la próxima fecha de ejecución
 * NUEVO: Retorna información de zona horaria
 */
export function obtenerProximaEjecucion(): Date {
  const info = obtenerProximaEjecucionLocal();
  return info.fechaLocal;
}

// ============================================================================
// TAREAS NOCTURNAS
// ============================================================================

/**
 * TAREA 1: Cerrar fichajes incompletos del día anterior
 */
function tarea_CerrarFichajesIncompletos(): { procesados: number; cerrados: number } {
  console.log('🔄 [CRON] Ejecutando: Cerrar fichajes incompletos...');
  
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const fichajesIncompletos = obtenerFichajesIncompletos().filter(
    f => f.fecha === fechaAyer
  );

  let cerrados = 0;
  fichajesIncompletos.forEach(fichaje => {
    // Simular cierre automático a las 23:59 del día
    fichaje.horaSalida = '23:59';
    fichaje.notas = (fichaje.notas || '') + ' [Auto-cerrado por sistema a las 5 AM]';
    cerrados++;
  });

  console.log(`✅ [CRON] Fichajes cerrados: ${cerrados}/${fichajesIncompletos.length}`);
  
  return {
    procesados: fichajesIncompletos.length,
    cerrados
  };
}

/**
 * TAREA 2: Validar fichajes antiguos automáticamente
 */
function tarea_ValidarFichajesAntiguos(): { procesados: number; validados: number } {
  console.log('🔄 [CRON] Ejecutando: Validar fichajes antiguos...');
  
  // Validar automáticamente fichajes de hace más de 7 días
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  let validados = 0;
  const fichajesPendientes = fichajes.filter(f => !f.validado);

  fichajesPendientes.forEach(fichaje => {
    const fechaFichaje = new Date(fichaje.fecha);
    if (fechaFichaje < hace7Dias && fichaje.horaSalida) {
      validarFichaje(fichaje.id);
      validados++;
    }
  });

  console.log(`✅ [CRON] Fichajes auto-validados: ${validados}`);
  
  return {
    procesados: fichajesPendientes.length,
    validados
  };
}

/**
 * TAREA 3: Calcular métricas de absentismo
 */
function tarea_CalcularAbsentismo(): { trabajadores: number; conAbsentismo: number } {
  console.log('🔄 [CRON] Ejecutando: Calcular absentismo...');
  
  const trabajadoresConAbsentismo = trabajadores.filter(t => {
    const datos = calcularAbsentismo(t.id);
    return datos.porcentajeAbsentismo > 0;
  });

  console.log(`✅ [CRON] Trabajadores con absentismo: ${trabajadoresConAbsentismo.length}/${trabajadores.length}`);
  
  return {
    trabajadores: trabajadores.length,
    conAbsentismo: trabajadoresConAbsentismo.length
  };
}

/**
 * TAREA 4: Actualizar distribución de costes por PDV
 */
function tarea_ActualizarCentrosCostes(): { trabajadores: number; actualizados: number } {
  console.log('🔄 [CRON] Ejecutando: Actualizar centros de costes...');
  
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = ahora.getMonth() + 1;
  
  const resultado = actualizarTodosTrabajadores(año, mes);

  console.log(`✅ [CRON] Centros de costes actualizados: ${resultado.exitosos} trabajadores`);
  
  return {
    trabajadores: resultado.exitosos + resultado.fallidos,
    actualizados: resultado.exitosos
  };
}

/**
 * TAREA 5: Generar reporte diario automático
 */
function tarea_GenerarReporteDiario(): { fecha: string; fichajes: number; trabajadores: number } {
  console.log('🔄 [CRON] Ejecutando: Generar reporte diario...');
  
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaAyer = ayer.toISOString().split('T')[0];

  const fichajesAyer = fichajes.filter(f => f.fecha === fechaAyer);
  const trabajadoresActivos = new Set(fichajesAyer.map(f => f.trabajadorId)).size;

  console.log(`✅ [CRON] Reporte generado: ${fichajesAyer.length} fichajes, ${trabajadoresActivos} trabajadores activos`);
  
  return {
    fecha: fechaAyer,
    fichajes: fichajesAyer.length,
    trabajadores: trabajadoresActivos
  };
}

/**
 * TAREA 6: Limpiar datos antiguos
 */
function tarea_LimpiarDatosAntiguos(): { eliminados: number } {
  console.log('🔄 [CRON] Ejecutando: Limpiar datos antiguos...');
  
  // En producción, eliminaría logs muy antiguos, cachés, etc.
  // Por ahora solo simula la limpieza
  
  const logs = obtenerLogsEjecuciones();
  const logsAntiguos = logs.length - CRON_CONFIG.MAX_LOGS;
  const eliminados = Math.max(0, logsAntiguos);

  console.log(`✅ [CRON] Datos antiguos limpiados: ${eliminados} registros`);
  
  return {
    eliminados
  };
}

/**
 * TAREA 7: Detectar anomalías y alertas
 */
function tarea_DetectarAnomalias(): { alertas: string[] } {
  console.log('🔄 [CRON] Ejecutando: Detectar anomalías...');
  
  const alertas: string[] = [];

  // Detectar fichajes sin salida de hace más de 2 días
  const hace2Dias = new Date();
  hace2Dias.setDate(hace2Dias.getDate() - 2);
  const fichajesProblema = fichajes.filter(f => {
    const fecha = new Date(f.fecha);
    return !f.horaSalida && fecha < hace2Dias;
  });

  if (fichajesProblema.length > 0) {
    alertas.push(`${fichajesProblema.length} fichajes sin salida hace más de 2 días`);
  }

  // Detectar trabajadores con absentismo > 20%
  trabajadores.forEach(t => {
    const datos = calcularAbsentismo(t.id);
    if (datos.porcentajeAbsentismo > 20) {
      alertas.push(`${t.nombre} ${t.apellidos}: ${datos.porcentajeAbsentismo.toFixed(1)}% absentismo`);
    }
  });

  console.log(`✅ [CRON] Anomalías detectadas: ${alertas.length}`);
  
  return {
    alertas
  };
}

// ============================================================================
// EJECUTOR PRINCIPAL
// ============================================================================

/**
 * Ejecuta todas las tareas programadas
 */
export async function ejecutarCronJobs(): Promise<CronJobLog> {
  const inicio = Date.now();
  const ahora = new Date();
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🕐 INICIANDO CRON JOBS - TAREAS AUTOMÁTICAS NOCTURNAS');
  console.log(`⏰ Hora de ejecución: ${ahora.toLocaleTimeString('es-ES')}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const tareasEjecutadas: string[] = [];
  const resultados: { [key: string]: any } = {};
  let estado: 'success' | 'error' | 'partial' = 'success';

  try {
    // TAREA 1: Cerrar fichajes incompletos
    tareasEjecutadas.push('Cerrar fichajes incompletos');
    resultados.fichajesIncompletos = tarea_CerrarFichajesIncompletos();

    // TAREA 2: Validar fichajes antiguos
    tareasEjecutadas.push('Validar fichajes antiguos');
    resultados.validacionAutomatica = tarea_ValidarFichajesAntiguos();

    // TAREA 3: Calcular absentismo
    tareasEjecutadas.push('Calcular absentismo');
    resultados.absentismo = tarea_CalcularAbsentismo();

    // TAREA 4: Actualizar centros de costes
    tareasEjecutadas.push('Actualizar centros de costes');
    resultados.centrosCostes = tarea_ActualizarCentrosCostes();

    // TAREA 5: Generar reporte diario
    tareasEjecutadas.push('Generar reporte diario');
    resultados.reporteDiario = tarea_GenerarReporteDiario();

    // TAREA 6: Limpiar datos antiguos
    tareasEjecutadas.push('Limpiar datos antiguos');
    resultados.limpieza = tarea_LimpiarDatosAntiguos();

    // TAREA 7: Detectar anomalías
    tareasEjecutadas.push('Detectar anomalías');
    resultados.anomalias = tarea_DetectarAnomalias();

  } catch (error) {
    console.error('❌ [CRON] Error ejecutando tareas:', error);
    estado = 'error';
  }

  const fin = Date.now();
  const duracionMs = fin - inicio;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ CRON JOBS COMPLETADOS');
  console.log(`⏱️  Duración: ${duracionMs}ms`);
  console.log(`📋 Tareas ejecutadas: ${tareasEjecutadas.length}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Crear log de ejecución
  const log: CronJobLog = {
    id: `cron-${Date.now()}`,
    fecha: ahora.toISOString().split('T')[0],
    hora: ahora.toLocaleTimeString('es-ES'),
    tareasEjecutadas,
    resultados,
    estado,
    duracionMs
  };

  // Guardar log y timestamp
  guardarLog(log);
  guardarUltimaEjecucion(ahora);

  return log;
}

/**
 * Inicializa el sistema de cron jobs
 * Se ejecuta al cargar la aplicación
 */
export function inicializarCronJobs(): void {
  console.log('🚀 Inicializando sistema de Cron Jobs...');
  
  // Verificar si debe ejecutarse
  if (debeEjecutarse()) {
    console.log('✅ Debe ejecutarse el cron job. Ejecutando...');
    ejecutarCronJobs();
  } else {
    const ultimaEjecucion = obtenerUltimaEjecucion();
    const proximaEjecucion = obtenerProximaEjecucion();
    
    console.log('ℹ️ Cron job ya se ejecutó hoy');
    if (ultimaEjecucion) {
      console.log(`📅 Última ejecución: ${ultimaEjecucion.toLocaleString('es-ES')}`);
    }
    console.log(`⏭️  Próxima ejecución: ${proximaEjecucion.toLocaleString('es-ES')}`);
  }

  // Programar verificación cada hora
  setInterval(() => {
    if (debeEjecutarse()) {
      console.log('⏰ Hora de ejecución alcanzada. Ejecutando cron jobs...');
      ejecutarCronJobs();
    }
  }, 60 * 60 * 1000); // Verificar cada hora
}

/**
 * Forzar ejecución manual (para testing)
 */
export function ejecutarManualmente(): Promise<CronJobLog> {
  console.log('🔧 Ejecución manual forzada');
  return ejecutarCronJobs();
}

/**
 * Resetear última ejecución (para testing)
 */
export function resetearUltimaEjecucion(): void {
  localStorage.removeItem(CRON_CONFIG.STORAGE_KEY_ULTIMA_EJECUCION);
  console.log('🔄 Última ejecución reseteada');
}

/**
 * Obtener estadísticas de ejecuciones
 */
export function obtenerEstadisticasCronJobs() {
  const logs = obtenerLogsEjecuciones();
  
  return {
    totalEjecuciones: logs.length,
    ultimaEjecucion: logs[0] || null,
    proximaEjecucion: obtenerProximaEjecucion(),
    horaConfiguracion: `${CRON_CONFIG.HORA_EJECUCION}:${CRON_CONFIG.MINUTO_EJECUCION.toString().padStart(2, '0')}`,
    ejecutadoHoy: obtenerUltimaEjecucion()?.toDateString() === new Date().toDateString(),
    logs: logs.slice(0, 10) // Últimos 10 logs
  };
}