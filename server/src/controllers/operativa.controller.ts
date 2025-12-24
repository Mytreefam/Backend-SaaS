/**
 * 📋 CONTROLADOR DE OPERATIVA - TAREAS Y HORARIOS
 * 
 * Gestiona:
 * - Tareas operativas (con reporte o informativas)
 * - Asignación a trabajadores
 * - Flujo de aprobación
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// TAREAS OPERATIVAS
// ============================================================================

/**
 * Obtener tareas operativas con filtros
 */
export async function obtenerTareasOperativas(req: Request, res: Response) {
  try {
    const { 
      empresa_id, 
      punto_venta_id, 
      estado, 
      asignado_a_id,
      asignado_por_id,
      prioridad,
      requiere_aprobacion,
      pendientes_aprobacion
    } = req.query;
    
    console.log('📥 obtenerTareasOperativas - Parámetros:', {
      empresa_id,
      punto_venta_id,
      estado,
      asignado_a_id,
      asignado_por_id,
      prioridad,
      requiere_aprobacion,
      pendientes_aprobacion
    });
    
    const where: any = {};
    
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    if (estado) where.estado = estado;
    if (asignado_a_id) where.asignadoAId = parseInt(asignado_a_id as string);
    if (asignado_por_id) where.asignadoPorId = parseInt(asignado_por_id as string);
    if (prioridad) where.prioridad = prioridad;
    
    if (requiere_aprobacion === 'true') where.requiereAprobacion = true;
    if (requiere_aprobacion === 'false') where.requiereAprobacion = false;
    
    // Filtro especial: pendientes de aprobación
    if (pendientes_aprobacion === 'true') {
      where.estado = 'completada';
      where.requiereAprobacion = true;
    }
    
    const tareas = await prisma.tareaOperativa.findMany({
      where,
      include: {
        asignadoA: {
          select: {
            id: true,
            nombre: true,
            email: true,
            foto: true,
            puesto: true,
          }
        },
        asignadoPor: {
          select: {
            id: true,
            nombre: true,
          }
        }
      },
      orderBy: [
        { prioridad: 'desc' },
        { fechaVencimiento: 'asc' },
        { creadoEn: 'desc' }
      ]
    });
    
    console.log('✅ Tareas encontradas:', tareas.length);
    
    res.json({ success: true, data: tareas });
  } catch (error: any) {
    console.error('❌ Error obteniendo tareas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Crear nueva tarea operativa
 */
export async function crearTareaOperativa(req: Request, res: Response) {
  try {
    const data = req.body;
    
    console.log('📥 crearTareaOperativa - Body recibido:', JSON.stringify(data, null, 2));
    
    // Normalizar campos (snake_case → camelCase)
    const titulo = data.titulo;
    const descripcion = data.descripcion;
    const instrucciones = data.instrucciones;
    const empresaId = data.empresa_id || data.empresaId;
    const empresaNombre = data.empresa_nombre || data.empresaNombre;
    const marcaId = data.marca_id || data.marcaId;
    const marcaNombre = data.marca_nombre || data.marcaNombre;
    const puntoVentaId = data.punto_venta_id || data.puntoVentaId;
    const puntoVentaNombre = data.punto_venta_nombre || data.puntoVentaNombre;
    const asignadoAId = data.asignado_a_id || data.asignadoAId;
    const asignadoANombre = data.asignado_a_nombre || data.asignadoANombre;
    const asignadoPorId = data.asignado_por_id || data.asignadoPorId;
    const asignadoPorNombre = data.asignado_por_nombre || data.asignadoPorNombre;
    const estado = data.estado || 'pendiente';
    const prioridad = data.prioridad || 'media';
    const requiereReporte = data.requiere_reporte ?? data.requiereReporte ?? true;
    const requiereAprobacion = data.requiere_aprobacion ?? data.requiereAprobacion ?? true;
    const fechaInicio = data.fecha_inicio || data.fechaInicio;
    const fechaVencimiento = data.fecha_vencimiento || data.fechaVencimiento;
    const recurrente = data.recurrente ?? false;
    const frecuencia = data.frecuencia;
    const diasSemana = data.dias_semana || data.diasSemana;
    const etiquetas = data.etiquetas;
    const categoria = data.categoria;
    const observaciones = data.observaciones;
    
    // Validaciones
    if (!titulo) {
      return res.status(400).json({ success: false, error: 'El título es requerido' });
    }
    if (!descripcion) {
      return res.status(400).json({ success: false, error: 'La descripción es requerida' });
    }
    if (!empresaId) {
      return res.status(400).json({ success: false, error: 'empresa_id es requerido' });
    }
    
    // Generar número de tarea
    const year = new Date().getFullYear();
    const count = await prisma.tareaOperativa.count({
      where: { empresaId }
    });
    const numero = `TAR-${year}-${String(count + 1).padStart(4, '0')}`;
    
    const tarea = await prisma.tareaOperativa.create({
      data: {
        numero,
        tipo: 'operativa',
        titulo,
        descripcion,
        instrucciones,
        empresaId,
        empresaNombre,
        marcaId,
        marcaNombre,
        puntoVentaId,
        puntoVentaNombre,
        asignadoAId: asignadoAId ? parseInt(asignadoAId) : null,
        asignadoANombre,
        asignadoPorId: asignadoPorId ? parseInt(asignadoPorId) : null,
        asignadoPorNombre,
        estado,
        prioridad,
        requiereReporte,
        requiereAprobacion,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        recurrente,
        frecuencia,
        diasSemana: diasSemana ? JSON.stringify(diasSemana) : null,
        etiquetas: etiquetas ? JSON.stringify(etiquetas) : null,
        categoria,
        observaciones,
      },
      include: {
        asignadoA: true,
        asignadoPor: true,
      }
    });
    
    console.log('✅ Tarea creada:', tarea.numero);
    
    res.status(201).json({ success: true, data: tarea });
  } catch (error: any) {
    console.error('❌ Error creando tarea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Actualizar tarea operativa
 */
export async function actualizarTareaOperativa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log('📥 actualizarTareaOperativa - ID:', id, 'Body:', data);
    
    const tareaExistente = await prisma.tareaOperativa.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!tareaExistente) {
      return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
    }
    
    // Normalizar campos
    const updateData: any = {};
    
    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.instrucciones !== undefined) updateData.instrucciones = data.instrucciones;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.prioridad !== undefined) updateData.prioridad = data.prioridad;
    
    const asignadoAId = data.asignado_a_id || data.asignadoAId;
    if (asignadoAId !== undefined) updateData.asignadoAId = asignadoAId ? parseInt(asignadoAId) : null;
    
    const asignadoANombre = data.asignado_a_nombre || data.asignadoANombre;
    if (asignadoANombre !== undefined) updateData.asignadoANombre = asignadoANombre;
    
    const fechaVencimiento = data.fecha_vencimiento || data.fechaVencimiento;
    if (fechaVencimiento !== undefined) updateData.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento) : null;
    
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    
    const tarea = await prisma.tareaOperativa.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        asignadoA: true,
        asignadoPor: true,
      }
    });
    
    console.log('✅ Tarea actualizada:', tarea.numero);
    
    res.json({ success: true, data: tarea });
  } catch (error: any) {
    console.error('❌ Error actualizando tarea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Eliminar tarea operativa
 */
export async function eliminarTareaOperativa(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    console.log('📥 eliminarTareaOperativa - ID:', id);
    
    await prisma.tareaOperativa.delete({
      where: { id: parseInt(id) }
    });
    
    console.log('✅ Tarea eliminada');
    
    res.json({ success: true, message: 'Tarea eliminada correctamente' });
  } catch (error: any) {
    console.error('❌ Error eliminando tarea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Completar tarea (trabajador)
 */
export async function completarTarea(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { comentario, evidencia_urls, tiempo_empleado } = req.body;
    
    console.log('📥 completarTarea - ID:', id);
    
    const tarea = await prisma.tareaOperativa.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'completada',
        fechaCompletada: new Date(),
        comentarioTrabajador: comentario,
        evidenciaUrls: evidencia_urls ? JSON.stringify(evidencia_urls) : null,
        tiempoEmpleado: tiempo_empleado,
      },
      include: {
        asignadoA: true,
        asignadoPor: true,
      }
    });
    
    console.log('✅ Tarea completada:', tarea.numero);
    
    res.json({ success: true, data: tarea });
  } catch (error: any) {
    console.error('❌ Error completando tarea:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Aprobar o rechazar tarea (gerente)
 */
export async function aprobarRechazarTarea(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { aprobada, comentario, gerente_id } = req.body;
    
    console.log('📥 aprobarRechazarTarea - ID:', id, 'Aprobada:', aprobada);
    
    const tarea = await prisma.tareaOperativa.update({
      where: { id: parseInt(id) },
      data: {
        estado: aprobada ? 'aprobada' : 'rechazada',
        fechaAprobada: aprobada ? new Date() : null,
        fechaRevision: new Date(),
        comentarioGerente: comentario,
      },
      include: {
        asignadoA: true,
        asignadoPor: true,
      }
    });
    
    console.log('✅ Tarea', aprobada ? 'aprobada' : 'rechazada', ':', tarea.numero);
    
    res.json({ success: true, data: tarea });
  } catch (error: any) {
    console.error('❌ Error en aprobación:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Obtener estadísticas de tareas
 */
export async function obtenerEstadisticasTareas(req: Request, res: Response) {
  try {
    const { empresa_id, punto_venta_id } = req.query;
    
    console.log('📥 obtenerEstadisticasTareas');
    
    const where: any = {};
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    
    const [total, pendientes, enProgreso, completadas, aprobadas, rechazadas, vencidas, urgentes] = await Promise.all([
      prisma.tareaOperativa.count({ where }),
      prisma.tareaOperativa.count({ where: { ...where, estado: 'pendiente' } }),
      prisma.tareaOperativa.count({ where: { ...where, estado: 'en_progreso' } }),
      prisma.tareaOperativa.count({ where: { ...where, estado: 'completada' } }),
      prisma.tareaOperativa.count({ where: { ...where, estado: 'aprobada' } }),
      prisma.tareaOperativa.count({ where: { ...where, estado: 'rechazada' } }),
      prisma.tareaOperativa.count({ where: { ...where, estado: 'vencida' } }),
      prisma.tareaOperativa.count({ where: { ...where, prioridad: 'urgente', estado: { notIn: ['aprobada', 'completada'] } } }),
    ]);
    
    const pendientesAprobacion = await prisma.tareaOperativa.count({
      where: { ...where, estado: 'completada', requiereAprobacion: true }
    });
    
    const requierenReporte = await prisma.tareaOperativa.count({
      where: { ...where, requiereReporte: true }
    });
    
    const informativas = await prisma.tareaOperativa.count({
      where: { ...where, requiereReporte: false }
    });
    
    // Tareas con vencimiento próximo (48 horas)
    const ahora = new Date();
    const en48h = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
    const porVencer = await prisma.tareaOperativa.count({
      where: {
        ...where,
        estado: { in: ['pendiente', 'en_progreso'] },
        fechaVencimiento: {
          lte: en48h,
          gte: ahora,
        }
      }
    });
    
    const stats = {
      total,
      pendientes,
      enProgreso,
      completadas,
      aprobadas,
      rechazadas,
      vencidas,
      urgentes,
      pendientesAprobacion,
      requierenReporte,
      informativas,
      porVencer,
    };
    
    console.log('✅ Estadísticas:', stats);
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Obtener trabajadores para asignar tareas
 */
export async function obtenerTrabajadoresParaAsignar(req: Request, res: Response) {
  try {
    const { empresa_id, punto_venta_id } = req.query;
    
    console.log('📥 obtenerTrabajadoresParaAsignar');
    
    const where: any = { estado: 'activo' };
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    
    const trabajadores = await prisma.empleado.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        foto: true,
        puesto: true,
        puntoVentaId: true,
      },
      orderBy: { nombre: 'asc' }
    });
    
    console.log('✅ Trabajadores encontrados:', trabajadores.length);
    
    res.json({ success: true, data: trabajadores });
  } catch (error: any) {
    console.error('❌ Error obteniendo trabajadores:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
