/**
 * 📚 EJEMPLOS DE USO DEL SISTEMA DE TAREAS Y FORMACIÓN
 * 
 * Este archivo muestra cómo usar el sistema de tareas desde los diferentes perfiles.
 */

import {
  crearTareaConReporte,
  crearGuionTrabajo,
  obtenerGuionDelDia,
  obtenerTareasParaReportar,
  completarTarea,
  marcarTareaComoVista,
  iniciarTarea,
} from '../services/tareas-operativas.service';

import {
  asignarModuloFormacionDesdeTemplate,
  asignarOnboardingCompleto,
  obtenerProgresoOnboarding,
  completarModuloFormacion,
  MODULOS_ONBOARDING,
} from '../services/formacion.service';

import {
  aprobarTarea,
  cancelarTarea,
  obtenerTareasGerente,
  obtenerEstadisticasTareas,
} from '../services/task-management.service';

// ============================================================================
// EJEMPLO 1: GERENTE CREA TAREA CON REPORTE
// ============================================================================

export async function ejemplo1_GerenteCreaTareaConReporte() {
  console.log('📋 EJEMPLO 1: Gerente crea tarea que requiere confirmación');
  
  const tarea = await crearTareaConReporte({
    // Jerarquía
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    marcaId: 'MRC-001',
    marcaNombre: 'HoyPecamos',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    
    // Asignación
    asignadoA: 'TRB-001',
    asignadoNombre: 'Juan Pérez',
    asignadoPor: 'GER-001',
    asignadoPorNombre: 'María García (Gerente)',
    
    // Contenido
    titulo: 'Revisar stock de ingredientes críticos',
    descripcion: 'Verificar nivel de harina, tomate y queso antes de las 12:00',
    instrucciones: `
      1. Ve al almacén principal
      2. Revisa stock físico de: Harina (>50kg), Tomate (>20kg), Queso (>15kg)
      3. Compara con sistema
      4. Si hay diferencias, reportar cantidad real con foto
      5. Si algún producto está por debajo del mínimo, avisar urgentemente
    `,
    
    // Configuración
    prioridad: 'alta',
    requiereAprobacion: true, // Gerente debe revisar el reporte
    
    // Fechas
    fechaVencimiento: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 horas
    
    // Metadata
    etiquetas: ['inventario', 'crítico', 'diario'],
    categoria: 'stock',
  });
  
  console.log('✅ Tarea creada:', tarea.id);
  console.log('📱 Trabajador recibirá notificación push');
  console.log('⏰ Vence en 3 horas');
  
  return tarea;
}

// ============================================================================
// EJEMPLO 2: GERENTE CREA GUION DE TRABAJO (INFORMATIVO)
// ============================================================================

export async function ejemplo2_GerenteCreaGuionTrabajo() {
  console.log('📝 EJEMPLO 2: Gerente crea guion informativo (no requiere confirmación)');
  
  const guion = await crearGuionTrabajo({
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    
    asignadoA: 'TRB-001',
    asignadoNombre: 'Juan Pérez',
    asignadoPor: 'GER-001',
    asignadoPorNombre: 'María García',
    
    titulo: 'Checklist de apertura del local',
    descripcion: 'Tareas rutinarias al abrir el establecimiento',
    instrucciones: `
      ☐ Desactivar alarma
      ☐ Encender luces
      ☐ Encender hornos (precalentar a 220°C)
      ☐ Revisar temperatura cámaras frigoríficas
      ☐ Preparar estación de trabajo
      ☐ Verificar dinero en caja
      ☐ Revisar pedidos del día
      ☐ Encender TPV y sistemas
    `,
    
    prioridad: 'media',
    recurrente: true,
    frecuencia: 'diaria',
    
    etiquetas: ['apertura', 'rutina', 'checklist'],
    categoria: 'operativa',
  });
  
  console.log('✅ Guion creado:', guion.id);
  console.log('ℹ️ Es informativo - trabajador solo debe marcar como visto');
  console.log('🔁 Se repetirá automáticamente cada día');
  
  return guion;
}

// ============================================================================
// EJEMPLO 3: TRABAJADOR VE SU GUION DEL DÍA
// ============================================================================

export function ejemplo3_TrabajadorVeGuionDelDia() {
  console.log('👀 EJEMPLO 3: Trabajador consulta su guion del día');
  
  const guion = obtenerGuionDelDia('TRB-001', 'PDV-TIANA');
  
  console.log(`📋 Tienes ${guion.length} tareas informativas hoy:`);
  guion.forEach((tarea, index) => {
    console.log(`${index + 1}. [${tarea.prioridad.toUpperCase()}] ${tarea.titulo}`);
  });
  
  console.log('\nℹ️ Estas tareas son guías de trabajo, no necesitas reportar completitud');
  
  return guion;
}

// ============================================================================
// EJEMPLO 4: TRABAJADOR MARCA GUION COMO VISTO
// ============================================================================

export function ejemplo4_TrabajadorMarcaGuionVisto() {
  console.log('✅ EJEMPLO 4: Trabajador marca guion informativo como visto');
  
  const tareaId = 'TSK-123456789';
  const trabajadorId = 'TRB-001';
  
  const resultado = marcarTareaComoVista(tareaId, trabajadorId);
  
  if (resultado) {
    console.log('✅ Guion marcado como completado');
    console.log('ℹ️ No requiere aprobación del gerente');
  }
  
  return resultado;
}

// ============================================================================
// EJEMPLO 5: TRABAJADOR VE TAREAS QUE DEBE REPORTAR
// ============================================================================

export function ejemplo5_TrabajadorVeTareasParaReportar() {
  console.log('📋 EJEMPLO 5: Trabajador consulta tareas que debe completar y reportar');
  
  const tareas = obtenerTareasParaReportar('TRB-001', 'PDV-TIANA');
  
  console.log(`🎯 Tienes ${tareas.length} tareas que requieren reporte:`);
  tareas.forEach((tarea, index) => {
    const vencimiento = tarea.fechaVencimiento 
      ? new Date(tarea.fechaVencimiento).toLocaleString()
      : 'Sin fecha límite';
    
    console.log(`${index + 1}. [${tarea.prioridad.toUpperCase()}] ${tarea.titulo}`);
    console.log(`   Estado: ${tarea.estado} | Vence: ${vencimiento}`);
    console.log(`   Requiere aprobación: ${tarea.requiereAprobacion ? 'Sí' : 'No'}`);
  });
  
  return tareas;
}

// ============================================================================
// EJEMPLO 6: TRABAJADOR INICIA TAREA
// ============================================================================

export function ejemplo6_TrabajadorIniciaTarea() {
  console.log('▶️ EJEMPLO 6: Trabajador marca que está trabajando en una tarea');
  
  const tareaId = 'TSK-123456789';
  const trabajadorId = 'TRB-001';
  
  const resultado = iniciarTarea(tareaId, trabajadorId);
  
  if (resultado) {
    console.log('✅ Tarea marcada como "en progreso"');
    console.log('⏱️ El gerente verá que estás trabajando en ella');
  }
  
  return resultado;
}

// ============================================================================
// EJEMPLO 7: TRABAJADOR COMPLETA TAREA CON REPORTE
// ============================================================================

export async function ejemplo7_TrabajadorCompletaTareaConReporte() {
  console.log('✅ EJEMPLO 7: Trabajador completa tarea y envía reporte');
  
  const resultado = await completarTarea({
    tareaId: 'TSK-123456789',
    trabajadorId: 'TRB-001',
    comentario: `
      Stock revisado:
      - Harina: 65kg (OK - por encima del mínimo)
      - Tomate: 18kg (⚠️ Cerca del mínimo, recomendar pedido)
      - Queso: 22kg (OK)
      
      He ajustado las cantidades en el sistema.
    `,
    evidenciaUrls: [
      'https://storage.example.com/foto-harina.jpg',
      'https://storage.example.com/foto-tomate.jpg',
    ],
    tiempoEmpleado: 25, // minutos
  });
  
  if (resultado) {
    console.log('✅ Tarea completada y enviada a revisión');
    console.log('📱 Gerente recibirá notificación para aprobar');
  }
  
  return resultado;
}

// ============================================================================
// EJEMPLO 8: GERENTE APRUEBA TAREA
// ============================================================================

export async function ejemplo8_GerenteApruebaTarea() {
  console.log('👍 EJEMPLO 8: Gerente revisa y aprueba tarea completada');
  
  const resultado = await aprobarTarea({
    tareaId: 'TSK-123456789',
    gerenteId: 'GER-001',
    aprobada: true,
    comentario: 'Excelente trabajo Juan. Procederé a hacer el pedido de tomate.',
  });
  
  if (resultado) {
    console.log('✅ Tarea aprobada');
    console.log('📱 Trabajador recibirá notificación de aprobación');
  }
  
  return resultado;
}

// ============================================================================
// EJEMPLO 9: GERENTE RECHAZA TAREA (NECESITA CORRECCIÓN)
// ============================================================================

export async function ejemplo9_GerenteRechazaTarea() {
  console.log('❌ EJEMPLO 9: Gerente rechaza tarea que necesita corrección');
  
  const resultado = await aprobarTarea({
    tareaId: 'TSK-987654321',
    gerenteId: 'GER-001',
    aprobada: false,
    comentario: 'Falta revisar el queso mozzarella. Por favor, vuelve a revisar esa sección.',
  });
  
  if (resultado) {
    console.log('❌ Tarea rechazada');
    console.log('📱 Trabajador recibirá notificación con indicaciones');
    console.log('🔄 El trabajador deberá volver a completarla');
  }
  
  return resultado;
}

// ============================================================================
// EJEMPLO 10: GERENTE ASIGNA ONBOARDING COMPLETO A NUEVO EMPLEADO
// ============================================================================

export async function ejemplo10_GerenteAsignaOnboarding() {
  console.log('🎓 EJEMPLO 10: Gerente asigna programa completo de onboarding');
  
  const modulos = await asignarOnboardingCompleto({
    trabajadorId: 'TRB-002',
    trabajadorNombre: 'Ana Martínez (Nueva empleada)',
    gerenteId: 'GER-001',
    gerenteNombre: 'María García',
    empresaId: 'EMP-001',
    empresaNombre: 'Disarmink S.L.',
  });
  
  console.log(`✅ ${modulos.length} módulos de formación asignados:`);
  modulos.forEach((modulo, index) => {
    const vence = new Date(modulo.fechaVencimiento || '').toLocaleDateString();
    console.log(`${index + 1}. ${modulo.titulo} (Vence: ${vence})`);
  });
  
  console.log('\n📱 Ana recibirá notificaciones de cada módulo');
  console.log('⏰ Tiene 1 semana para completar todo el onboarding');
  
  return modulos;
}

// ============================================================================
// EJEMPLO 11: TRABAJADOR VE PROGRESO DE SU ONBOARDING
// ============================================================================

export function ejemplo11_TrabajadorVeProgresoOnboarding() {
  console.log('📊 EJEMPLO 11: Trabajador consulta progreso de su onboarding');
  
  const progreso = obtenerProgresoOnboarding('TRB-002');
  
  console.log(`🎯 Progreso de onboarding:`);
  console.log(`   Total módulos: ${progreso.total}`);
  console.log(`   Completados: ${progreso.completados}`);
  console.log(`   En progreso: ${progreso.enProgreso}`);
  console.log(`   Pendientes: ${progreso.pendientes}`);
  console.log(`   Porcentaje: ${progreso.porcentaje}%`);
  console.log(`   Finalizado: ${progreso.finalizado ? 'SÍ ✅' : 'NO ⏳'}`);
  
  return progreso;
}

// ============================================================================
// EJEMPLO 12: TRABAJADOR COMPLETA MÓDULO DE FORMACIÓN
// ============================================================================

export async function ejemplo12_TrabajadorCompletaFormacion() {
  console.log('🎓 EJEMPLO 12: Trabajador completa módulo de formación');
  
  const resultado = await completarModuloFormacion({
    moduloId: 'TSK-FORM-001',
    trabajadorId: 'TRB-002',
    puntuacion: 95, // 0-100
    comentario: 'He completado el curso y pasado la evaluación final',
  });
  
  if (resultado) {
    console.log('✅ Módulo de formación completado');
    console.log(`📊 Puntuación: ${resultado.puntuacion}/100`);
    console.log('📱 Gerente recibirá notificación para aprobar y emitir certificado');
  }
  
  return resultado;
}

// ============================================================================
// EJEMPLO 13: GERENTE VE ESTADÍSTICAS GENERALES
// ============================================================================

export function ejemplo13_GerenteVeEstadisticas() {
  console.log('📊 EJEMPLO 13: Gerente consulta estadísticas de tareas');
  
  const stats = obtenerEstadisticasTareas();
  
  console.log('📈 ESTADÍSTICAS GLOBALES:');
  console.log(`   Total tareas: ${stats.total}`);
  console.log(`   Operativas: ${stats.operativas} | Formación: ${stats.formacion}`);
  console.log(`   Pendientes: ${stats.pendientes}`);
  console.log(`   En progreso: ${stats.enProgreso}`);
  console.log(`   Completadas: ${stats.completadas}`);
  console.log(`   Aprobadas: ${stats.aprobadas}`);
  console.log(`   Rechazadas: ${stats.rechazadas}`);
  console.log(`   Vencidas: ${stats.vencidas}`);
  console.log(`\n   Requieren reporte: ${stats.requierenReporte}`);
  console.log(`   Informativas: ${stats.informativas}`);
  console.log(`\n   ⏳ Pendientes de aprobación: ${stats.pendientesAprobacion}`);
  
  return stats;
}

// ============================================================================
// EJEMPLO 14: GERENTE CANCELA TAREA
// ============================================================================

export async function ejemplo14_GerenteCancelaTarea() {
  console.log('🗑️ EJEMPLO 14: Gerente cancela una tarea asignada');
  
  const resultado = await cancelarTarea(
    'TSK-999888777',
    'GER-001',
    'Ya no es necesario, el proveedor hizo entrega anticipada'
  );
  
  if (resultado) {
    console.log('🗑️ Tarea cancelada');
    console.log('📱 Trabajador recibirá notificación de cancelación');
  }
  
  return resultado;
}

// ============================================================================
// RESUMEN DE USO
// ============================================================================

export function mostrarResumenDeUso() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           SISTEMA DE TAREAS Y FORMACIÓN - RESUMEN             ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  GERENTE PUEDE:                                               ║
║  ✅ Crear tareas con reporte (requieren confirmación)         ║
║  ✅ Crear guiones de trabajo (informativos)                   ║
║  ✅ Asignar formación y onboarding                            ║
║  ✅ Aprobar/rechazar tareas completadas                       ║
║  ✅ Ver estadísticas y progreso del equipo                    ║
║  ✅ Cancelar tareas                                           ║
║                                                               ║
║  TRABAJADOR PUEDE:                                            ║
║  ✅ Ver su guion del día (tareas informativas)                ║
║  ✅ Marcar guiones como vistos (sin reporte)                  ║
║  ✅ Ver tareas que requieren reporte                          ║
║  ✅ Iniciar tareas (marcar en progreso)                       ║
║  ✅ Completar tareas con evidencia y comentarios              ║
║  ✅ Ver progreso de formación/onboarding                      ║
║  ✅ Completar módulos de formación con evaluación             ║
║                                                               ║
║  TIPOS DE TAREAS:                                             ║
║  📋 Operativas con reporte → Trabajador debe confirmar        ║
║  📝 Operativas informativas → Solo guía de trabajo            ║
║  🎓 Formación → Siempre requiere completar y aprobar          ║
║                                                               ║
║  NOTIFICACIONES BIDIRECCIONALES:                              ║
║  📱 Trabajador recibe: Nueva tarea, aprobación, rechazo       ║
║  📱 Gerente recibe: Tarea completada, formación terminada     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}
