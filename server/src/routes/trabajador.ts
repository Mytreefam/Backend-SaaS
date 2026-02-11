import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import * as fichajesController from '../controllers/trabajador/fichajes.controller';
import * as pedidosController from '../controllers/trabajador/pedidos.controller';
import * as impresorasController from '../controllers/trabajador/impresoras.controller';
import * as tareasController from '../controllers/trabajador/tareas.controller';
import * as horariosController from '../controllers/trabajador/horarios.controller';
import * as stockController from '../controllers/trabajador/stock.controller';
import * as rrhhController from '../controllers/trabajador/rrhh.controller';

const router = Router();

router.get(
  '/fichajes',
  validate({
    query: z
      .object({
        fecha: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  fichajesController.getMisFichajes,
);

router.get('/fichajes/estado', fichajesController.getMiEstadoFichaje);

router.post(
  '/fichajes',
  validate({
    body: z.object({
      tipo: z.enum(['entrada', 'salida', 'pausa', 'reanudacion']),
      puntoVentaId: z.string().min(1).optional(),
      notas: z.string().optional(),
      fecha: z.string().optional(),
      hora: z.string().optional(),
    }),
  }),
  fichajesController.crearMiFichaje,
);

router.get(
  '/pedidos',
  validate({
    query: z
      .object({
        estado: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  pedidosController.getPedidos,
);

router.put(
  '/pedidos/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z
      .object({
        estado: z.string().min(1).optional(),
        metodoPago: z.string().min(1).optional(),
        tipoEntrega: z.string().min(1).optional(),
        motivoCancelacion: z.string().min(1).optional(),
        motivoDevolucion: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  pedidosController.updatePedido,
);

router.post(
  '/pedidos/:id/cobrar',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  pedidosController.cobrarPedido,
);

router.get(
  '/impresoras',
  validate({
    query: z
      .object({
        puntoVentaId: z.string().min(1),
      })
      .passthrough(),
  }),
  impresorasController.listImpresoras,
);

router.post(
  '/impresoras',
  validate({
    body: z.object({
      puntoVentaId: z.string().min(1),
      nombre: z.string().min(1),
      activa: z.boolean().optional(),
      categorias: z.array(z.string().min(1)),
      ipAddress: z.string().min(1).optional(),
      modelo: z.string().min(1).optional(),
    }),
  }),
  impresorasController.createImpresora,
);

router.put(
  '/impresoras/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z
      .object({
        nombre: z.string().min(1).optional(),
        activa: z.boolean().optional(),
        categorias: z.array(z.string().min(1)).optional(),
        ipAddress: z.string().min(1).optional(),
        modelo: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  impresorasController.updateImpresora,
);

router.delete(
  '/impresoras/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  impresorasController.deleteImpresora,
);

router.get(
  '/tareas',
  validate({
    query: z
      .object({
        fecha: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  tareasController.listMisTareas,
);

router.put(
  '/tareas/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z
      .object({
        estado: z.string().min(1).optional(),
        notas: z.string().optional(),
      })
      .passthrough(),
  }),
  tareasController.updateMiTarea,
);

router.put(
  '/tareas/:id/completar',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  tareasController.completarMiTarea,
);

// ============================================================================
// HORARIOS (trabajador)
// ============================================================================

router.get(
  '/horarios',
  validate({
    query: z
      .object({
        from: z.string().min(1).optional(),
        to: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  horariosController.getMisHorarios,
);

router.get('/horarios/solicitudes', horariosController.getMisSolicitudesHorario);

router.post(
  '/horarios/solicitudes',
  validate({
    body: z.object({
      tipo: z.enum(['cambio_turno', 'dia_libre', 'cambio_horario', 'intercambio']),
      fechaSolicitada: z.string().min(1),
      motivoSolicitud: z.string().min(1),
      detalles: z.string().optional(),
    }),
  }),
  horariosController.crearMiSolicitudHorario,
);

// ============================================================================
// STOCK / MATERIAL (trabajador)
// ============================================================================

router.get(
  '/stock/articulos',
  validate({
    query: z
      .object({
        puntoVentaId: z.string().min(1),
        empresaId: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  stockController.listArticulos,
);

router.get(
  '/stock/movimientos',
  validate({
    query: z
      .object({
        puntoVentaId: z.string().min(1),
      })
      .passthrough(),
  }),
  stockController.listMovimientos,
);

router.get(
  '/stock/pedidos-proveedor',
  validate({
    query: z
      .object({
        puntoVentaId: z.string().min(1),
        empresaId: z.string().min(1).optional(),
        estado: z.string().min(1).optional(),
      })
      .passthrough(),
  }),
  stockController.listPedidosProveedor,
);

router.post(
  '/stock/pedidos-proveedor/:id/recibir',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z
      .object({
        observaciones: z.string().optional(),
        items: z
          .array(
            z.object({
              articuloId: z.number().int().optional(),
              itemId: z.number().int().optional(),
              cantidadRecibida: z.number().optional(),
              cantidad: z.number().optional(),
            }),
          )
          .optional(),
      })
      .passthrough(),
  }),
  stockController.recibirPedidoProveedor,
);

router.post(
  '/stock/articulos/:id/ajustar',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      tipo: z.enum(['entrada', 'salida', 'ajuste', 'merma', 'consumo_propio']),
      cantidad: z.number().positive(),
      motivo: z.string().optional(),
      observaciones: z.string().optional(),
    }),
  }),
  stockController.ajustarArticulo,
);

// ============================================================================
// RRHH / CONSUMOS (trabajador)
// ============================================================================

router.get('/rrhh/vacaciones', rrhhController.listMisVacaciones);
router.post(
  '/rrhh/vacaciones',
  validate({
    body: z.object({
      desde: z.string().min(1),
      hasta: z.string().min(1),
      motivo: z.string().min(1),
    }),
  }),
  rrhhController.crearMisVacaciones,
);

router.get('/rrhh/horas-extra', rrhhController.listMisHorasExtra);
router.post(
  '/rrhh/horas-extra',
  validate({
    body: z.object({
      fecha: z.string().min(1),
      horaInicio: z.string().min(1),
      horaFin: z.string().min(1),
      motivo: z.string().min(1),
    }),
  }),
  rrhhController.crearMisHorasExtra,
);

router.get('/rrhh/consumos', rrhhController.listMisConsumos);
router.post(
  '/rrhh/consumos',
  validate({
    body: z.object({
      producto: z.string().min(1),
      categoria: z.string().min(1),
      cantidad: z.number().optional(),
      precio: z.number().optional(),
      fecha: z.string().optional(),
      notas: z.string().optional(),
    }),
  }),
  rrhhController.crearMiConsumo,
);

router.get('/rrhh/gastos', rrhhController.listMisGastos);
router.post(
  '/rrhh/gastos',
  validate({
    body: z.object({
      concepto: z.string().min(1),
      categoria: z.string().min(1),
      importe: z.number(),
      fechaGasto: z.string().optional(),
      justificanteUrl: z.string().optional(),
      notas: z.string().optional(),
    }),
  }),
  rrhhController.crearMiGasto,
);

export default router;

