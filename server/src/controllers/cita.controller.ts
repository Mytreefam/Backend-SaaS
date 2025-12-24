import { CitaModel } from '../models/cita.model';

/**
 * @swagger
 * /citas:
 *   get:
 *     summary: Obtener todas las citas
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de citas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cita'
 */
export const getAllCitas = async (req: any, res: any) => {
  const citas = await CitaModel.findAll();
  res.json(citas);
};

export const getCitaById = async (req: any, res: any) => {
  const { id } = req.params;
  const cita = await CitaModel.findById(Number(id));
  if (!cita) return res.status(404).json({ error: 'No encontrada' });
  res.json(cita);
};

/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Crear nueva cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cita'
 *     responses:
 *       201:
 *         description: Cita creada
 */
export const createCita = async (req: any, res: any) => {
  const nueva = await CitaModel.create(req.body);
  res.status(201).json(nueva);
};

export const updateCita = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizada = await CitaModel.update(Number(id), req.body);
  res.json(actualizada);
};

export const deleteCita = async (req: any, res: any) => {
  const { id } = req.params;
  await CitaModel.delete(Number(id));
  res.status(204).end();
};
