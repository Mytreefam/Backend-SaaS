import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller';
import prisma from '../prisma/client';
import { requireAuth, requireOwnershipOrRole, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public: registration
router.post('/', clienteController.createCliente);

// All other client routes require authentication
router.use(requireAuth);

// Admin/manager: list all clients
router.get('/', requireRole('gerente'), clienteController.getAllClientes);

// Ownership-protected
const requireClientOwnership = requireOwnershipOrRole({ param: 'id', rolesAllowed: ['gerente'] });

router.get('/:id', requireClientOwnership, clienteController.getClienteById);
router.put('/:id', requireClientOwnership, clienteController.updateCliente);
router.delete('/:id', requireClientOwnership, clienteController.deleteCliente);

// Obtener promociones de un cliente específico
router.get('/:id/promociones', requireClientOwnership, async (req, res) => {
	const clienteId = Number(req.params.id);
	// Si tienes promos asociadas al cliente, ajusta el query. Aquí se devuelven todas.
	const promociones = await prisma.promocion.findMany();
	res.json(promociones);
});

// Obtener pedidos de un cliente específico
router.get('/:id/pedidos', requireClientOwnership, async (req, res) => {
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

	const pedidosConTimeline = pedidos.map((pedido: any) => {
		const estadoMap: Record<string, string> = {
			pendiente: 'recibido',
			nuevo: 'recibido',
			aceptado: 'recibido',
			en_preparacion: 'preparacion',
			listo: 'enviado',
			entregado: 'completado',
			cancelado: 'completado'
		};

		const estadoTimeline = estadoMap[pedido.estado] || pedido.estado;
		const currentIndex = Math.max(0, estados.findIndex(e => e.estado === estadoTimeline));
		// Genera el timeline hasta el estado actual
		const timeline = estados.map((step, idx) => {
			const completado = idx <= currentIndex;
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
router.get('/:id/notificaciones', requireClientOwnership, async (req, res) => {
	const clienteId = Number(req.params.id);
	const notificaciones = await prisma.notificacion.findMany({ where: { clienteId } });
	res.json(notificaciones);
});

// Obtener turno activo de un cliente específico
router.get('/:id/turno-activo', requireClientOwnership, async (req, res) => {
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
		res.status(500).json({ error: 'Error consultando turno' });
	}
});


export default router;
