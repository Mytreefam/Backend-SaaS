import { ClienteModel } from '../models/cliente.model';

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
export const getAllClientes = async (req: any, res: any) => {
  const clientes = await ClienteModel.findAll();
  const safe = (clientes || []).map((c: any) => {
    if (!c) return c;
    const { password, ...rest } = c;
    return rest;
  });
  res.json(safe);
};

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
 */
export const getClienteById = async (req: any, res: any) => {
  const { id } = req.params;
  const cliente = await ClienteModel.findById(Number(id));
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  const { password, ...safe } = cliente as any;
  res.json(safe);
};

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 */
export const createCliente = async (req: any, res: any) => {
  // Public registration: always force role=cliente
  const payload = {
    ...req.body,
    role: 'cliente',
  };
  const nuevo = await ClienteModel.create(payload);
  const { password, ...safe } = nuevo as any;
  res.status(201).json(safe);
};

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 */
export const updateCliente = async (req: any, res: any) => {
  const { id } = req.params;
  // Disallow role updates via this endpoint (RBAC handled elsewhere)
  const { role, password, ...rest } = req.body || {};
  const actualizado = await ClienteModel.update(Number(id), rest);
  const { password: _pw, ...safe } = actualizado as any;
  res.json(safe);
};

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cliente eliminado
 */
export const deleteCliente = async (req: any, res: any) => {
  const { id } = req.params;
  await ClienteModel.delete(Number(id));
  res.status(204).end();
};
