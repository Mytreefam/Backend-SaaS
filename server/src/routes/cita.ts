import express, { Router } from 'express';
import { CitasController } from '../controllers/citas.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router: Router = express.Router();

/**
 * @route   GET /api/citas
 * @desc    Obtener todas las citas con opciones de filtrado
 * @query   {String} estado - Filtrar por estado (solicitada, confirmada, en_progreso, completada, cancelada, no_presentado)
 * @query   {Number} clienteId - Filtrar por cliente
 * @query   {String} servicio - Filtrar por servicio
 * @query   {Number} mes - Filtrar por mes (1-12)
 * @query   {Number} anio - Filtrar por año
 */
router.get('/', CitasController.getAll);

/**
 * @route   GET /api/citas/stats
 * @desc    Obtener estadísticas de citas (tasas, conteos)
 */
router.get('/stats', CitasController.getStats);

/**
 * @route   GET /api/citas/:id
 * @desc    Obtener cita por ID
 */
router.get('/:id', CitasController.getById);

/**
 * @route   POST /api/citas
 * @desc    Crear nueva cita
 * @body    {Date} fecha - Fecha de la cita
 * @body    {String} hora - Hora de la cita (HH:mm)
 * @body    {String} motivo - Motivo de la cita
 * @body    {String} servicio - Tipo de servicio
 * @body    {Number} clienteId - ID del cliente
 * @body    {String} telefono - Teléfono de contacto (opcional)
 * @body    {String} email - Email de contacto (opcional)
 * @body    {String} notas - Notas adicionales (opcional)
 */
router.post(
  '/',
  validate({
    body: z.object({
      fecha: z.union([z.string().min(1), z.date()]),
      hora: z.string().min(1).optional(),
      motivo: z.string().min(1),
      servicio: z.string().min(1).optional(),
      clienteId: z.number().int().optional(),
      telefono: z.string().min(3).optional(),
      email: z.string().email().optional(),
      notas: z.string().optional(),
    }),
  }),
  CitasController.create,
);

/**
 * @route   PUT /api/citas/:id
 * @desc    Actualizar cita
 * @body    {Date} fecha - Fecha de la cita (opcional)
 * @body    {String} hora - Hora de la cita (opcional)
 * @body    {String} motivo - Motivo de la cita (opcional)
 * @body    {String} servicio - Tipo de servicio (opcional)
 * @body    {String} estado - Estado de la cita (opcional)
 * @body    {String} telefono - Teléfono (opcional)
 * @body    {String} email - Email (opcional)
 * @body    {String} notas - Notas (opcional)
 */
router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      fecha: z.union([z.string().min(1), z.date()]).optional(),
      hora: z.string().min(1).optional(),
      motivo: z.string().min(1).optional(),
      servicio: z.string().min(1).optional(),
      estado: z.string().min(1).optional(),
      telefono: z.string().min(3).optional(),
      email: z.string().email().optional(),
      notas: z.string().optional(),
    }),
  }),
  CitasController.update,
);

/**
 * @route   PATCH /api/citas/:id/status
 * @desc    Cambiar estado de la cita
 * @body    {String} estado - Nuevo estado (solicitada, confirmada, en_progreso, completada, cancelada, no_presentado)
 * @body    {String} canceladaPor - Usuario que canceló (si estado = cancelada) (opcional)
 * @body    {String} razonCancelacion - Razón de cancelación (opcional)
 */
router.patch(
  '/:id/status',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      estado: z.string().min(1),
      canceladaPor: z.string().optional(),
      razonCancelacion: z.string().optional(),
    }),
  }),
  CitasController.changeStatus,
);

/**
 * @route   PATCH /api/citas/:id/confirm
 * @desc    Confirmar cita
 */
router.patch('/:id/confirm', validate({ params: z.object({ id: z.string().min(1) }) }), CitasController.confirm);

/**
 * @route   PATCH /api/citas/:id/cancel
 * @desc    Cancelar cita
 * @body    {String} canceladaPor - Usuario que canceló (opcional)
 * @body    {String} razonCancelacion - Razón de cancelación (opcional)
 */
router.patch(
  '/:id/cancel',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      canceladaPor: z.string().optional(),
      razonCancelacion: z.string().optional(),
    }),
  }),
  CitasController.cancel,
);

/**
 * @route   DELETE /api/citas/:id
 * @desc    Eliminar cita
 */
router.delete('/:id', validate({ params: z.object({ id: z.string().min(1) }) }), CitasController.delete);

export default router;
