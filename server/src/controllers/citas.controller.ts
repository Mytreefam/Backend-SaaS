import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const CitasController = {
  // Obtener todas las citas con opciones de filtrado
  async getAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }

      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      const { estado, clienteId, servicio, mes, anio } = req.query;

      // Construir el objeto de filtro
      const where: any = {};

      if (estado) {
        where.estado = estado as string;
      }

      if (isStaff) {
        if (clienteId) {
          where.clienteId = parseInt(clienteId as string);
        }
      } else {
        // Ownership: clients can only see their own citas
        where.clienteId = req.user.id;
      }

      if (servicio) {
        where.servicio = {
          contains: servicio as string,
          mode: 'insensitive',
        };
      }

      // Filtro por mes y año
      if (mes || anio) {
        const mesNum = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
        const anioNum = anio ? parseInt(anio as string) : new Date().getFullYear();

        const inicio = new Date(anioNum, mesNum - 1, 1);
        const fin = new Date(anioNum, mesNum, 0, 23, 59, 59);

        where.fecha = {
          gte: inicio,
          lte: fin,
        };
      }

      const citas = await prisma.cita.findMany({
        where,
        include: {
          cliente: true,
        },
        orderBy: {
          fecha: 'desc',
        },
      });

      // Calcular estadísticas
      const stats = {
        total: citas.length,
        solicitadas: citas.filter((c: any) => c.estado === 'solicitada').length,
        confirmadas: citas.filter((c: any) => c.estado === 'confirmada').length,
        enProgreso: citas.filter((c: any) => c.estado === 'en_progreso').length,
        completadas: citas.filter((c: any) => c.estado === 'completada').length,
        canceladas: citas.filter((c: any) => c.estado === 'cancelada').length,
        noPresantado: citas.filter((c: any) => c.estado === 'no_presentado').length,
      };

      // Calcular tasas
      const tasaConfirmacion =
        stats.solicitadas > 0 ? ((stats.confirmadas / stats.solicitadas) * 100).toFixed(1) : '0.0';
      const tasaCumplimiento =
        stats.confirmadas > 0 ? ((stats.completadas / stats.confirmadas) * 100).toFixed(1) : '0.0';
      const tasaCancelacion =
        stats.total > 0 ? ((stats.canceladas / stats.total) * 100).toFixed(1) : '0.0';

      res.json({
        success: true,
        data: citas,
        stats: {
          ...stats,
          tasaConfirmacion: parseFloat(tasaConfirmacion),
          tasaCumplimiento: parseFloat(tasaCumplimiento),
          tasaCancelacion: parseFloat(tasaCancelacion),
        },
      });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({
        success: false,
        error: 'CITAS_LIST_FAILED',
      });
    }
  },

  // Obtener cita por ID
  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      const { id } = req.params;

      const cita = await prisma.cita.findUnique({
        where: { id: parseInt(id) },
        include: { cliente: true },
      });

      if (!cita) {
        return res.status(404).json({
          success: false,
          error: 'CITA_NOT_FOUND',
        });
      }

      if (!isStaff && cita.clienteId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al obtener cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_GET_FAILED',
      });
    }
  },

  // Crear nueva cita
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';

      const { fecha, hora, motivo, servicio, clienteId, telefono, email, notas } = req.body;

      // Validar datos requeridos
      if (!fecha || !motivo || (!isStaff && !req.user.id) || (isStaff && !clienteId)) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
        });
      }

      const resolvedClienteId = isStaff ? clienteId : req.user.id;

      // Verificar que el cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: resolvedClienteId },
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          error: 'CLIENTE_NOT_FOUND',
        });
      }

      const cita = await prisma.cita.create({
        data: {
          fecha: new Date(fecha),
          hora,
          motivo,
          servicio: servicio || motivo,
          clienteId: resolvedClienteId,
          telefono: telefono || cliente.telefono,
          email: email || cliente.email,
          notas,
          estado: 'solicitada', // Estado por defecto
        },
        include: { cliente: true },
      });

      res.status(201).json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_CREATE_FAILED',
      });
    }
  },

  // Actualizar cita
  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      const { id } = req.params;
      const { fecha, hora, motivo, servicio, estado, telefono, email, notas } = req.body;

      // Verificar que la cita existe
      const citaExistente = await prisma.cita.findUnique({
        where: { id: parseInt(id) },
      });

      if (!citaExistente) {
        return res.status(404).json({
          success: false,
          error: 'CITA_NOT_FOUND',
        });
      }

      if (!isStaff && citaExistente.clienteId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }

      const dataUpdate: any = {};
      if (fecha) dataUpdate.fecha = new Date(fecha);
      if (hora) dataUpdate.hora = hora;
      if (motivo) dataUpdate.motivo = motivo;
      if (servicio) dataUpdate.servicio = servicio;
      // Clients cannot arbitrarily change estado
      if (estado && isStaff) dataUpdate.estado = estado;
      if (telefono) dataUpdate.telefono = telefono;
      if (email) dataUpdate.email = email;
      if (notas !== undefined) dataUpdate.notas = notas;

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: dataUpdate,
        include: { cliente: true },
      });

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_UPDATE_FAILED',
      });
    }
  },

  // Cambiar estado de cita
  async changeStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      if (!isStaff) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }

      const { id } = req.params;
      const { estado, canceladaPor, razonCancelacion } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
        });
      }

      // Estados válidos
      const estadosValidos = [
        'solicitada',
        'confirmada',
        'en_progreso',
        'completada',
        'cancelada',
        'no_presentado',
      ];

      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_ESTADO',
        });
      }

      const dataUpdate: any = { estado };

      if (estado === 'cancelada' && canceladaPor) {
        dataUpdate.canceladaPor = canceladaPor;
        dataUpdate.razonCancelacion = razonCancelacion;
      }

      const citaExistente = await prisma.cita.findUnique({ where: { id: parseInt(id) } });
      if (!citaExistente) {
        return res.status(404).json({ success: false, error: 'CITA_NOT_FOUND' });
      }

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: dataUpdate,
        include: { cliente: true },
      });

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al cambiar estado de cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_STATUS_FAILED',
      });
    }
  },

  // Confirmar cita
  async confirm(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      if (!isStaff) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }
      const { id } = req.params;

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: { estado: 'confirmada' },
        include: { cliente: true },
      });

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_CONFIRM_FAILED',
      });
    }
  },

  // Cancelar cita
  async cancel(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      const { id } = req.params;
      const { canceladaPor, razonCancelacion } = req.body;

      const citaExistente = await prisma.cita.findUnique({ where: { id: parseInt(id) } });
      if (!citaExistente) {
        return res.status(404).json({ success: false, error: 'CITA_NOT_FOUND' });
      }
      if (!isStaff && citaExistente.clienteId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'cancelada',
          canceladaPor: canceladaPor || (isStaff ? 'admin' : 'cliente'),
          razonCancelacion: razonCancelacion || (isStaff ? 'Cancelada por administrador' : 'Cancelada por cliente'),
        },
        include: { cliente: true },
      });

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_CANCEL_FAILED',
      });
    }
  },

  // Eliminar cita
  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      const { id } = req.params;

      const citaExistente = await prisma.cita.findUnique({ where: { id: parseInt(id) } });
      if (!citaExistente) {
        return res.status(404).json({ success: false, error: 'CITA_NOT_FOUND' });
      }
      if (!isStaff && citaExistente.clienteId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }

      const cita = await prisma.cita.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({
        success: false,
        error: 'CITA_DELETE_FAILED',
      });
    }
  },

  // Obtener estadísticas de citas
  async getStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
      }
      const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
      if (!isStaff) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN' });
      }
      const citas = await prisma.cita.findMany();

      const stats = {
        total: citas.length,
        solicitadas: citas.filter((c: any) => c.estado === 'solicitada').length,
        confirmadas: citas.filter((c: any) => c.estado === 'confirmada').length,
        enProgreso: citas.filter((c: any) => c.estado === 'en_progreso').length,
        completadas: citas.filter((c: any) => c.estado === 'completada').length,
        canceladas: citas.filter((c: any) => c.estado === 'cancelada').length,
        noPresantado: citas.filter((c: any) => c.estado === 'no_presentado').length,
      };

      const tasaConfirmacion =
        stats.solicitadas > 0 ? ((stats.confirmadas / stats.solicitadas) * 100).toFixed(1) : '0.0';
      const tasaCumplimiento =
        stats.confirmadas > 0 ? ((stats.completadas / stats.confirmadas) * 100).toFixed(1) : '0.0';
      const tasaCancelacion =
        stats.total > 0 ? ((stats.canceladas / stats.total) * 100).toFixed(1) : '0.0';

      res.json({
        success: true,
        data: {
          ...stats,
          tasaConfirmacion: parseFloat(tasaConfirmacion),
          tasaCumplimiento: parseFloat(tasaCumplimiento),
          tasaCancelacion: parseFloat(tasaCancelacion),
        },
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'CITAS_STATS_FAILED',
      });
    }
  },
};
