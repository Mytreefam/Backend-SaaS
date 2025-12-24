import { FacturaModel } from '../models/factura.model';

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 */
export const getAllFacturas = async (req: any, res: any) => {
  const facturas = await FacturaModel.findAll();
  res.json(facturas);
};

export const getFacturaById = async (req: any, res: any) => {
  const { id } = req.params;
  const factura = await FacturaModel.findById(Number(id));
  if (!factura) return res.status(404).json({ error: 'No encontrada' });
  res.json(factura);
};

/**
 * @swagger
 * /facturas:
 *   post:
 *     summary: Crear nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Factura'
 *     responses:
 *       201:
 *         description: Factura creada
 */
export const createFactura = async (req: any, res: any) => {
  const nueva = await FacturaModel.create(req.body);
  res.status(201).json(nueva);
};

export const updateFactura = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizada = await FacturaModel.update(Number(id), req.body);
  res.json(actualizada);
};

export const deleteFactura = async (req: any, res: any) => {
  const { id } = req.params;
  await FacturaModel.delete(Number(id));
  res.status(204).end();
};
