import { PedidoModel } from '../models/pedido.model';

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Obtener todos los pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 */
export const getAllPedidos = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  const pedidos = await PedidoModel.findAll();
  res.json(pedidos);
};

export const getPedidoById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const pedido = await PedidoModel.findById(Number(id));
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && pedido.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json(pedido);
};

/**
 * @swagger
 * /pedidos:
 *   post:
 *     summary: Crear nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pedido'
 *     responses:
 *       201:
 *         description: Pedido creado
 */
export const createPedido = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  // Prevent mass assignment: clients can only create for themselves
  const payload = { ...req.body };
  if (req.user.role !== 'gerente') {
    payload.clienteId = req.user.id;
  }

  const nuevo = await PedidoModel.create(payload);
  res.status(201).json(nuevo);
};

export const updatePedido = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const pedido = await PedidoModel.findById(Number(id));
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && pedido.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  // Mass-assignment prevention: restrict updatable fields
  const payload: any = {
    estado: req.body?.estado,
    total: req.body?.total,
    tipoEntrega: req.body?.tipoEntrega,
    metodoPago: req.body?.metodoPago,
  };

  const actualizado = await PedidoModel.update(Number(id), payload);
  res.json(actualizado);
};

export const deletePedido = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const pedido = await PedidoModel.findById(Number(id));
  if (!pedido) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && pedido.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  await PedidoModel.delete(Number(id));
  res.status(204).end();
};
