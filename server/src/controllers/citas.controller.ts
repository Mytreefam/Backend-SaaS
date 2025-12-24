import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CitasController = {
  // Obtener todas las citas con opciones de filtrado
  async getAll(req: Request, res: Response) {
    try {
      const { estado, clienteId, servicio, mes, anio } = req.query;

      // Construir el objeto de filtro
      const where: any = {};

      if (estado) {
        where.estado = estado as string;
      }

      if (clienteId) {
        where.clienteId = parseInt(clienteId as string);
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
        solicitadas: citas.filter((c) => c.estado === 'solicitada').length,
        confirmadas: citas.filter((c) => c.estado === 'confirmada').length,
        enProgreso: citas.filter((c) => c.estado === 'en_progreso').length,
        completadas: citas.filter((c) => c.estado === 'completada').length,
        canceladas: citas.filter((c) => c.estado === 'cancelada').length,
        noPresantado: citas.filter((c) => c.estado === 'no_presentado').length,
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
        message: 'Error al obtener citas',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Obtener cita por ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cita = await prisma.cita.findUnique({
        where: { id: parseInt(id) },
        include: { cliente: true },
      });

      if (!cita) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada',
        });
      }

      res.json({
        success: true,
        data: cita,
      });
    } catch (error) {
      console.error('Error al obtener cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Crear nueva cita
  async create(req: Request, res: Response) {
    try {
      const { fecha, hora, motivo, servicio, clienteId, telefono, email, notas } = req.body;

      // Validar datos requeridos
      if (!fecha || !motivo || !clienteId) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: fecha, motivo, clienteId',
        });
      }

      // Verificar que el cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const cita = await prisma.cita.create({
        data: {
          fecha: new Date(fecha),
          hora,
          motivo,
          servicio: servicio || motivo,
          clienteId,
          telefono: telefono || cliente.telefono,
          email: email || cliente.email,
          notas,
          estado: 'solicitada', // Estado por defecto
        },
        include: { cliente: true },
      });

      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: cita,
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Actualizar cita
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fecha, hora, motivo, servicio, estado, telefono, email, notas } = req.body;

      // Verificar que la cita existe
      const citaExistente = await prisma.cita.findUnique({
        where: { id: parseInt(id) },
      });

      if (!citaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada',
        });
      }

      const dataUpdate: any = {};
      if (fecha) dataUpdate.fecha = new Date(fecha);
      if (hora) dataUpdate.hora = hora;
      if (motivo) dataUpdate.motivo = motivo;
      if (servicio) dataUpdate.servicio = servicio;
      if (estado) dataUpdate.estado = estado;
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
        message: 'Cita actualizada exitosamente',
        data: cita,
      });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Cambiar estado de cita
  async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado, canceladaPor, razonCancelacion } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El campo estado es requerido',
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
          message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`,
        });
      }

      const dataUpdate: any = { estado };

      if (estado === 'cancelada' && canceladaPor) {
        dataUpdate.canceladaPor = canceladaPor;
        dataUpdate.razonCancelacion = razonCancelacion;
      }

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: dataUpdate,
        include: { cliente: true },
      });

      res.json({
        success: true,
        message: `Cita actualizada a estado: ${estado}`,
        data: cita,
      });
    } catch (error) {
      console.error('Error al cambiar estado de cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado de cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Confirmar cita
  async confirm(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: { estado: 'confirmada' },
        include: { cliente: true },
      });

      res.json({
        success: true,
        message: 'Cita confirmada exitosamente',
        data: cita,
      });
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al confirmar cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Cancelar cita
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { canceladaPor, razonCancelacion } = req.body;

      const cita = await prisma.cita.update({
        where: { id: parseInt(id) },
        data: {
          estado: 'cancelada',
          canceladaPor: canceladaPor || 'admin',
          razonCancelacion: razonCancelacion || 'Cancelada por administrador',
        },
        include: { cliente: true },
      });

      res.json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: cita,
      });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Eliminar cita
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cita = await prisma.cita.delete({
        where: { id: parseInt(id) },
      });

      res.json({
        success: true,
        message: 'Cita eliminada exitosamente',
        data: cita,
      });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar cita',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  // Obtener estadísticas de citas
  async getStats(req: Request, res: Response) {
    try {
      const citas = await prisma.cita.findMany();

      const stats = {
        total: citas.length,
        solicitadas: citas.filter((c) => c.estado === 'solicitada').length,
        confirmadas: citas.filter((c) => c.estado === 'confirmada').length,
        enProgreso: citas.filter((c) => c.estado === 'en_progreso').length,
        completadas: citas.filter((c) => c.estado === 'completada').length,
        canceladas: citas.filter((c) => c.estado === 'cancelada').length,
        noPresantado: citas.filter((c) => c.estado === 'no_presentado').length,
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
        message: 'Error al obtener estadísticas',
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },
};
