

import { PromocionService } from '../services/promocion.service';
import { Request, Response } from 'express';

/**
 * @swagger
 * /promociones:
 *   get:
 *     summary: Obtener todas las promociones
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de promociones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promocion'
 */
export const getAllPromociones = async (req: Request, res: Response) => {
  try {
    const promociones = await PromocionService.getAll();
    res.json(promociones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
};

/**
 * @swagger
 * /promociones/{id}:
 *   get:
 *     summary: Obtener promoción por ID
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promoción encontrada
 *       404:
 *         description: Promoción no encontrada
 */
export const getPromocionById = async (req: Request, res: Response) => {
  try {
    const promocion = await PromocionService.getById(Number(req.params.id));
    if (!promocion) return res.status(404).json({ error: 'Promoción no encontrada' });
    res.json(promocion);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la promoción' });
  }
};

/**
 * @swagger
 * /promociones:
 *   post:
 *     summary: Crear nueva promoción
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promocion'
 *     responses:
 *       201:
 *         description: Promoción creada
 */
export const createPromocion = async (req: Request, res: Response) => {
  try {
    console.log('📨 Datos recibidos para crear promoción:', JSON.stringify(req.body, null, 2));
    const nuevaPromocion = await PromocionService.create(req.body);
    console.log('✅ Promoción creada:', nuevaPromocion);
    res.status(201).json(nuevaPromocion);
  } catch (error: any) {
    console.error('❌ Error al crear promoción:', error);
    res.status(500).json({ error: 'Error al crear la promoción', details: error.message });
  }
};

export const updatePromocion = async (req: Request, res: Response) => {
  try {
    const promocionActualizada = await PromocionService.update(Number(req.params.id), req.body);
    res.json(promocionActualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la promoción' });
  }
};

export const deletePromocion = async (req: Request, res: Response) => {
  try {
    await PromocionService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la promoción' });
  }
};
