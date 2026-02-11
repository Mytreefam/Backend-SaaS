/**
 * CONTROLADOR: Horarios de Trabajo
 * Gestión de plantillas horarias para empleados
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

/**
 * Obtener todos los horarios de una empresa
 */
export const obtenerHorarios = async (req: Request, res: Response) => {
  try {
    const { empresaId } = req.query;

    const horarios = await prisma.horario.findMany({
      where: empresaId ? { empresaId: empresaId as string } : {},
      include: {
        asignaciones: {
          include: { empleado: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
};

/**
 * Obtener horario por ID
 */
export const obtenerHorarioPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const horario = await prisma.horario.findUnique({
      where: { id: parseInt(id) },
      include: {
        asignaciones: {
          include: { empleado: true }
        }
      }
    });

    if (!horario) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json(horario);
  } catch (error) {
    console.error('Error al obtener horario:', error);
    res.status(500).json({ error: 'Error al obtener horario' });
  }
};

/**
 * Crear nuevo horario
 */
export const crearHorario = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      descripcion,
      empresaId,
      lunes,
      martes,
      miercoles,
      jueves,
      viernes,
      sabado,
      domingo,
      horasSemana = 40
    } = req.body;

    if (!nombre || !empresaId) {
      return res.status(400).json({ error: 'Nombre y empresaId son obligatorios' });
    }

    const nuevoHorario = await prisma.horario.create({
      data: {
        nombre: nombre.toString().trim(),
        descripcion: descripcion?.toString() || '',
        empresaId: empresaId.toString().trim(),
        lunes: lunes?.toString() || null,
        martes: martes?.toString() || null,
        miercoles: miercoles?.toString() || null,
        jueves: jueves?.toString() || null,
        viernes: viernes?.toString() || null,
        sabado: sabado?.toString() || null,
        domingo: domingo?.toString() || null,
        horasSemana: parseFloat(horasSemana.toString()) || 40,
        activo: true
      }
    });

    res.status(201).json(nuevoHorario);
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ error: 'Error al crear horario' });
  }
};

/**
 * Actualizar horario
 */
export const actualizarHorario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const horarioActualizado = await prisma.horario.update({
      where: { id: parseInt(id) },
      data: {
        nombre: datos.nombre?.toString().trim() || undefined,
        descripcion: datos.descripcion?.toString() || undefined,
        lunes: datos.lunes?.toString() || undefined,
        martes: datos.martes?.toString() || undefined,
        miercoles: datos.miercoles?.toString() || undefined,
        jueves: datos.jueves?.toString() || undefined,
        viernes: datos.viernes?.toString() || undefined,
        sabado: datos.sabado?.toString() || undefined,
        domingo: datos.domingo?.toString() || undefined,
        horasSemana: datos.horasSemana ? parseFloat(datos.horasSemana.toString()) : undefined,
        activo: datos.activo !== undefined ? datos.activo : undefined
      }
    });

    res.json(horarioActualizado);
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ error: 'Error al actualizar horario' });
  }
};

/**
 * Eliminar horario
 */
export const eliminarHorario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.horario.delete({
      where: { id: parseInt(id) }
    });

    res.json({ mensaje: 'Horario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ error: 'Error al eliminar horario' });
  }
};

/**
 * Asignar horario a un empleado
 */
export const asignarHorarioAEmpleado = async (req: Request, res: Response) => {
  try {
    const { empleadoId } = req.params;
    const { horarioId, fechaVigenciaDesde, fechaVigenciaHasta } = req.body;

    if (!empleadoId || !horarioId || !fechaVigenciaDesde) {
      return res.status(400).json({ 
        error: 'empleadoId (en URL), horarioId y fechaVigenciaDesde (en body) son obligatorios' 
      });
    }

    // Desactivar asignaciones anteriores para la misma fecha
    await prisma.asignacionTurno.updateMany({
      where: {
        empleadoId: parseInt(empleadoId),
        estado: 'activo'
      },
      data: { estado: 'inactivo' }
    });

    const asignacion = await prisma.asignacionTurno.create({
      data: {
        empleadoId: parseInt(empleadoId),
        horarioId: parseInt(horarioId),
        fechaVigenciaDesde: new Date(fechaVigenciaDesde),
        fechaVigenciaHasta: fechaVigenciaHasta ? new Date(fechaVigenciaHasta) : null,
        estado: 'activo'
      },
      include: {
        empleado: true,
        horario: true
      }
    });

    res.status(201).json(asignacion);
  } catch (error) {
    console.error('Error al asignar horario:', error);
    res.status(500).json({ error: 'Error al asignar horario' });
  }
};

/**
 * Obtener horarios asignados a un empleado
 */
export const obtenerHorariosEmpleado = async (req: Request, res: Response) => {
  try {
    const { empleadoId } = req.params;
    const { activos } = req.query;

    const asignaciones = await prisma.asignacionTurno.findMany({
      where: {
        empleadoId: parseInt(empleadoId),
        ...(activos === 'true' && { estado: 'activo' })
      },
      include: {
        horario: true
      },
      orderBy: { fechaVigenciaDesde: 'desc' }
    });

    res.json(asignaciones);
  } catch (error) {
    console.error('Error al obtener horarios del empleado:', error);
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
};

/**
 * Obtener horario actual de un empleado para una fecha específica
 */
export const obtenerHorarioActualEmpleado = async (req: Request, res: Response) => {
  try {
    const { empleadoId } = req.params;
    const { fecha } = req.query;

    const fechaConsulta = fecha ? new Date(fecha as string) : new Date();

    const asignacion = await prisma.asignacionTurno.findFirst({
      where: {
        empleadoId: parseInt(empleadoId),
        fechaVigenciaDesde: { lte: fechaConsulta },
        OR: [
          { fechaVigenciaHasta: null },
          { fechaVigenciaHasta: { gte: fechaConsulta } }
        ],
        estado: 'activo'
      },
      include: { horario: true },
      orderBy: { fechaVigenciaDesde: 'desc' }
    });

    if (!asignacion) {
      return res.status(404).json({ error: 'No hay horario asignado para esa fecha' });
    }

    res.json(asignacion.horario);
  } catch (error) {
    console.error('Error al obtener horario actual:', error);
    res.status(500).json({ error: 'Error al obtener horario actual' });
  }
};

/**
 * Cancelar asignación de horario
 */
export const cancelarAsignacionHorario = async (req: Request, res: Response) => {
  try {
    const { asignacionId } = req.params;

    const asignacion = await prisma.asignacionTurno.update({
      where: { id: parseInt(asignacionId) },
      data: { estado: 'cancelado' }
    });

    res.json(asignacion);
  } catch (error) {
    console.error('Error al cancelar asignación:', error);
    res.status(500).json({ error: 'Error al cancelar asignación' });
  }
};

/**
 * Listar solicitudes de cambio de horario creadas por trabajadores
 */
export const obtenerSolicitudesCambioHorario = async (req: Request, res: Response) => {
  try {
    const { estado, empleadoId, puntoVentaId, desde, hasta } = req.query as any;

    const where: any = {};
    if (estado) where.estado = String(estado);
    if (empleadoId) where.empleadoId = Number(empleadoId);
    if (desde || hasta) {
      where.fechaSolicitada = {};
      if (desde) where.fechaSolicitada.gte = new Date(String(desde));
      if (hasta) where.fechaSolicitada.lte = new Date(String(hasta));
    }
    if (puntoVentaId) {
      where.empleado = { puntoVentaId: String(puntoVentaId) };
    }

    const solicitudes = await prisma.solicitudCambioHorario.findMany({
      where,
      include: {
        empleado: {
          select: {
            id: true,
            nombre: true,
            email: true,
            puntoVentaId: true,
            empresaId: true,
            marcaId: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: [{ estado: 'asc' }, { solicitadoEn: 'desc' }],
    });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes de cambio de horario:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes de cambio de horario' });
  }
};

/**
 * Resolver (aprobar/rechazar) una solicitud de cambio de horario
 */
export const resolverSolicitudCambioHorario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body as { estado: 'aprobada' | 'rechazada'; respuesta?: string };

    if (!estado || !['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Intentar mapear usuario actual a empleado (si existe)
    const userEmail = (req as any).user?.email ? String((req as any).user.email) : null;
    const revisadoPor = userEmail
      ? await prisma.empleado.findUnique({ where: { email: userEmail }, select: { id: true } })
      : null;

    const updated = await prisma.solicitudCambioHorario.update({
      where: { id: Number(id) },
      data: {
        estado,
        respuesta: respuesta ?? null,
        revisadoEn: new Date(),
        revisadoPorId: revisadoPor?.id ?? null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al resolver solicitud de cambio de horario:', error);
    res.status(500).json({ error: 'Error al resolver solicitud de cambio de horario' });
  }
};
