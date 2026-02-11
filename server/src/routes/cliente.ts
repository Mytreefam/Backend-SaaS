import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller';
import prisma from '../prisma/client';
import { requireAuth, requireOwnershipOrRole, requireRole } from '../middleware/auth.middleware';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public: registration
router.post(
  '/',
  validate({
    body: z.object({
      nombre: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      telefono: z.string().min(3).optional(),
      avatar: z.string().min(1).optional(),
      ciudad: z.string().min(1).optional(),
      idioma: z.string().min(1).optional(),
      // role is ignored server-side for public registration
      role: z.string().optional(),
    }),
  }),
  clienteController.createCliente,
);

// All other client routes require authentication
router.use(requireAuth);

// Admin/manager: list all clients
router.get('/', requireRole('gerente'), clienteController.getAllClientes);

// Ownership-protected
const requireClientOwnership = requireOwnershipOrRole({ param: 'id', rolesAllowed: ['gerente'] });

router.get('/:id', requireClientOwnership, clienteController.getClienteById);
router.put(
  '/:id',
  requireClientOwnership,
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      nombre: z.string().min(1).optional(),
      email: z.string().email().optional(),
      telefono: z.string().min(3).optional(),
      avatar: z.string().min(1).nullable().optional(),
      ciudad: z.string().min(1).optional(),
      idioma: z.string().min(1).optional(),
      // role/password changes disallowed here
      role: z.string().optional(),
      password: z.string().optional(),
    }),
  }),
  clienteController.updateCliente,
);
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

// ============================================
// DIRECCIONES (Entrega)
// ============================================
router.get(
  '/:id/direcciones',
  requireClientOwnership,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  async (req, res) => {
    const clienteId = Number(req.params.id);
    const direcciones = await prisma.direccion.findMany({
      where: { clienteId },
      orderBy: [{ esPredeterminada: 'desc' }, { fechaCreacion: 'desc' }],
    });
    res.json(direcciones);
  },
);

router.post(
  '/:id/direcciones',
  requireClientOwnership,
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      tipo: z.enum(['casa', 'trabajo', 'otro']).optional(),
      alias: z.string().min(1).optional(),
      calle: z.string().min(1),
      numero: z.string().min(1),
      piso: z.string().min(1).optional(),
      puerta: z.string().min(1).optional(),
      codigoPostal: z.string().min(3),
      ciudad: z.string().min(1),
      provincia: z.string().min(1).optional(),
      pais: z.string().min(1).optional(),
      notas: z.string().min(1).optional(),
      latitud: z.number().optional(),
      longitud: z.number().optional(),
      esPredeterminada: z.boolean().optional(),
    }),
  }),
  async (req, res) => {
    const clienteId = Number(req.params.id);

    const existingCount = await prisma.direccion.count({ where: { clienteId } });
    const makeDefault = Boolean(req.body.esPredeterminada) || existingCount === 0;

    const data = {
      clienteId,
      tipo: req.body.tipo ?? 'casa',
      alias: req.body.alias,
      calle: req.body.calle,
      numero: req.body.numero,
      piso: req.body.piso,
      puerta: req.body.puerta,
      codigoPostal: req.body.codigoPostal,
      ciudad: req.body.ciudad,
      provincia: req.body.provincia ?? req.body.ciudad,
      pais: req.body.pais ?? 'España',
      notas: req.body.notas,
      latitud: req.body.latitud,
      longitud: req.body.longitud,
      esPredeterminada: makeDefault,
    };

    const created = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.direccion.updateMany({
          where: { clienteId },
          data: { esPredeterminada: false },
        });
      }
      return tx.direccion.create({ data });
    });

    res.status(201).json(created);
  },
);

router.put(
  '/:id/direcciones/:direccionId',
  requireClientOwnership,
  validate({
    params: z.object({ id: z.string().min(1), direccionId: z.string().min(1) }),
    body: z.object({
      tipo: z.enum(['casa', 'trabajo', 'otro']).optional(),
      alias: z.string().optional(),
      calle: z.string().min(1).optional(),
      numero: z.string().min(1).optional(),
      piso: z.string().optional(),
      puerta: z.string().optional(),
      codigoPostal: z.string().min(3).optional(),
      ciudad: z.string().min(1).optional(),
      provincia: z.string().optional(),
      pais: z.string().optional(),
      notas: z.string().optional(),
      latitud: z.number().optional(),
      longitud: z.number().optional(),
      esPredeterminada: z.boolean().optional(),
    }),
  }),
  async (req, res) => {
    const clienteId = Number(req.params.id);
    const direccionId = Number(req.params.direccionId);

    const existing = await prisma.direccion.findUnique({ where: { id: direccionId } });
    if (!existing || existing.clienteId !== clienteId) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    const makeDefault = req.body.esPredeterminada === true;

    const updated = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.direccion.updateMany({
          where: { clienteId },
          data: { esPredeterminada: false },
        });
      }

      return tx.direccion.update({
        where: { id: direccionId },
        data: {
          tipo: req.body.tipo,
          alias: req.body.alias,
          calle: req.body.calle,
          numero: req.body.numero,
          piso: req.body.piso,
          puerta: req.body.puerta,
          codigoPostal: req.body.codigoPostal,
          ciudad: req.body.ciudad,
          provincia: req.body.provincia,
          pais: req.body.pais,
          notas: req.body.notas,
          latitud: req.body.latitud,
          longitud: req.body.longitud,
          esPredeterminada: makeDefault ? true : undefined,
          fechaUltimoUso: new Date(),
        },
      });
    });

    res.json(updated);
  },
);

router.delete(
  '/:id/direcciones/:direccionId',
  requireClientOwnership,
  validate({ params: z.object({ id: z.string().min(1), direccionId: z.string().min(1) }) }),
  async (req, res) => {
    const clienteId = Number(req.params.id);
    const direccionId = Number(req.params.direccionId);

    const existing = await prisma.direccion.findUnique({ where: { id: direccionId } });
    if (!existing || existing.clienteId !== clienteId) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    await prisma.direccion.delete({ where: { id: direccionId } });
    res.status(204).end();
  },
);


export default router;
