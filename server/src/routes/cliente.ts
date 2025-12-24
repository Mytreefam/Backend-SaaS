import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const router = Router();
router.get('/', clienteController.getAllClientes);
router.get('/:id', clienteController.getClienteById);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

// Obtener promociones de un cliente específico
router.get('/:id/promociones', async (req, res) => {
	const clienteId = Number(req.params.id);
	// Si tienes promos asociadas al cliente, ajusta el query. Aquí se devuelven todas.
	const promociones = await prisma.promocion.findMany();
	res.json(promociones);
});

// Obtener pedidos de un cliente específico
router.get('/:id/pedidos', async (req, res) => {
	const clienteId = Number(req.params.id);
	const pedidos = await prisma.pedido.findMany({
		where: { clienteId },
		include: {
			items: {
				include: {
					producto: true
				}
			}
		}
	});

	// Timeline por estado
	const estados = [
		{ estado: 'recibido', label: 'Pedido Recibido' },
		{ estado: 'preparacion', label: 'En Preparación' },
		{ estado: 'enviado', label: 'Enviado / Listo para Recogida' },
		{ estado: 'en-carretera', label: 'En Carretera' },
		{ estado: 'completado', label: 'Completado' }
	];

	const pedidosConTimeline = pedidos.map(pedido => {
		// Genera el timeline hasta el estado actual
		const timeline = estados.map((step, idx) => {
			const completado = idx <= estados.findIndex(e => e.estado === pedido.estado);
			return {
				estado: step.estado,
				label: step.label,
				completado,
				fecha: completado ? pedido.fecha : null
			};
		});
		// Productos
		const productos = (pedido.items ?? []).map((item: any) => item.producto?.nombre || 'Producto desconocido');
		return {
			...pedido,
			timeline,
			productos
		};
	});
	res.json(pedidosConTimeline);
});

// Obtener notificaciones de un cliente específico
router.get('/:id/notificaciones', async (req, res) => {
	const clienteId = Number(req.params.id);
	const notificaciones = await prisma.notificacion.findMany({ where: { clienteId } });
	res.json(notificaciones);
});

// Obtener turno activo de un cliente específico
router.get('/:id/turno-activo', async (req, res) => {
	const clienteId = Number(req.params.id);
	try {
		const turno = await prisma.turno.findFirst({
			where: {
				clienteId,
				OR: [
					{ estado: 'pendiente' },
					{ estado: 'por entregar' }
				]
			},
			orderBy: { creadoEn: 'desc' }
		});
		res.json(turno || {});
	} catch (err) {
		res.status(500).json({ error: 'Error consultando turno', details: err });
	}
});


export default router;
