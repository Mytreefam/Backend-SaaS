/**
 * CONTROLADOR: Integraciones Delivery
 * Endpoints para gestión de plataformas externas (Glovo, Uber Eats, etc.)
 *
 * Nota: Este archivo estaba con imports a mitad de fichero (inválido en TS).
 * Se reordenó únicamente para mantener el mismo comportamiento y permitir build.
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

// Datos de plataformas disponibles (configuración base)
const PLATAFORMAS_BASE = [
  { id: 1, codigo: 'glovo', nombre: 'Glovo', logo: '/logos/glovo.png' },
  { id: 2, codigo: 'uber_eats', nombre: 'Uber Eats', logo: '/logos/ubereats.png' },
  { id: 3, codigo: 'just_eat', nombre: 'Just Eat', logo: '/logos/justeat.png' },
  { id: 4, codigo: 'deliveroo', nombre: 'Deliveroo', logo: '/logos/deliveroo.png' },
] as const;

/**
 * GET /api/gerente/integraciones/plataformas
 * Obtener todas las plataformas configuradas
 */
export const obtenerPlataformas = async (req: Request, res: Response) => {
  try {
    const empresaId = String(req.query.empresa_id || process.env.DEFAULT_EMPRESA_ID || 'HOYPCM000');

    // Ensure base platforms exist for this empresa
    await prisma.$transaction(
      PLATAFORMAS_BASE.map((p) =>
        prisma.integracionDelivery.upsert({
          where: { empresaId_codigo: { empresaId, codigo: p.codigo } },
          update: { nombre: p.nombre, logo: p.logo },
          create: {
            empresaId,
            codigo: p.codigo,
            nombre: p.nombre,
            logo: p.logo,
            activa: false,
            conectada: false,
            errores: 0,
            productosSync: 0,
            pedidosHoy: 0,
            configuracion: {},
          },
        }),
      ),
    );

    const plataformas = await prisma.integracionDelivery.findMany({
      where: { empresaId },
      orderBy: { id: 'asc' },
    });

    return res.json({
      success: true,
      data: plataformas.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        logo: p.logo,
        activa: p.activa,
        conectada: p.conectada,
        ultimaSincronizacion: p.ultimaSincronizacion ? p.ultimaSincronizacion.toISOString() : null,
        errores: p.errores ?? 0,
        productosSync: p.productosSync ?? 0,
        pedidosHoy: p.pedidosHoy ?? 0,
        configuracion: (p.configuracion as any) || {},
      })),
    });
  } catch (error) {
    console.error('Error al obtener plataformas:', error);
    return res.status(500).json({ success: false, error: 'GET_PLATAFORMAS_FAILED' });
  }
};

export const obtenerPlataformaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plataformaId = Number(id);
    if (!Number.isFinite(plataformaId)) return res.status(400).json({ success: false, error: 'INVALID_ID' });

    const plataforma = await prisma.integracionDelivery.findUnique({ where: { id: plataformaId } });
    if (!plataforma) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

    return res.json({
      success: true,
      data: {
        id: plataforma.id,
        codigo: plataforma.codigo,
        nombre: plataforma.nombre,
        logo: plataforma.logo,
        activa: plataforma.activa,
        conectada: plataforma.conectada,
        ultimaSincronizacion: plataforma.ultimaSincronizacion ? plataforma.ultimaSincronizacion.toISOString() : null,
        errores: plataforma.errores ?? 0,
        productosSync: plataforma.productosSync ?? 0,
        pedidosHoy: plataforma.pedidosHoy ?? 0,
        configuracion: (plataforma.configuracion as any) || {},
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'GET_PLATAFORMA_FAILED' });
  }
};

export const crearPlataforma = async (req: Request, res: Response) => {
  try {
    const empresaId = String(req.body?.empresaId || process.env.DEFAULT_EMPRESA_ID || 'HOYPCM000');
    const codigo = String(req.body?.codigo || '').trim();
    const nombre = String(req.body?.nombre || '').trim();
    if (!codigo || !nombre) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });

    const created = await prisma.integracionDelivery.create({
      data: {
        empresaId,
        codigo,
        nombre,
        logo: req.body?.logo || null,
        activa: Boolean(req.body?.activa ?? false),
        conectada: Boolean(req.body?.conectada ?? false),
        configuracion: req.body?.configuracion || {},
      },
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'CREATE_PLATAFORMA_FAILED' });
  }
};

export const actualizarPlataforma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plataformaId = Number(id);
    if (!Number.isFinite(plataformaId)) return res.status(400).json({ success: false, error: 'INVALID_ID' });

    const data: any = {};
    if (typeof req.body?.activa === 'boolean') data.activa = req.body.activa;
    if (typeof req.body?.conectada === 'boolean') data.conectada = req.body.conectada;
    if (typeof req.body?.nombre === 'string') data.nombre = req.body.nombre;
    if (typeof req.body?.logo === 'string' || req.body?.logo === null) data.logo = req.body.logo;
    if (req.body?.configuracion && typeof req.body.configuracion === 'object') data.configuracion = req.body.configuracion;

    const updated = await prisma.integracionDelivery.update({ where: { id: plataformaId }, data });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'UPDATE_PLATAFORMA_FAILED' });
  }
};

export const eliminarPlataforma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plataformaId = Number(id);
    if (!Number.isFinite(plataformaId)) return res.status(400).json({ success: false, error: 'INVALID_ID' });

    await prisma.integracionDelivery.delete({ where: { id: plataformaId } });
    return res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'DELETE_PLATAFORMA_FAILED' });
  }
};

/**
 * Alias usado por rutas: GET /gerente/integraciones/historial
 */
export const obtenerHistorialSincronizacion = async (req: Request, res: Response) => {
  try {
    // Reutiliza historial simulado (compatible con frontend)
    return res.json({
      success: true,
      data: [
        {
          id: 1,
          plataformaId: 1,
          plataformaNombre: 'Glovo',
          tipo: 'productos',
          resultado: 'ok',
          elementosSincronizados: 0,
          errores: [],
          fecha: new Date().toISOString(),
          duracionMs: 0,
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'GET_HISTORIAL_FAILED' });
  }
};

/**
 * Alias usado por rutas: GET /gerente/integraciones/estadisticas
 */
export const obtenerEstadisticasIntegraciones = async (req: Request, res: Response) => {
  try {
    const empresaId = String(req.query.empresa_id || process.env.DEFAULT_EMPRESA_ID || 'HOYPCM000');
    const [plataformasTotales, plataformasActivas] = await Promise.all([
      prisma.integracionDelivery.count({ where: { empresaId } }),
      prisma.integracionDelivery.count({ where: { empresaId, activa: true } }),
    ]);

    return res.json({
      success: true,
      data: {
        plataformasActivas,
        plataformasTotales,
        pedidosUltimaHora: 0,
        tasaExitoSync: 100,
        productosSync: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'GET_STATS_FAILED' });
  }
};

/**
 * PUT /api/gerente/integraciones/plataformas/:id/toggle
 * Activar/desactivar plataforma
 */
export const togglePlataforma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { activa } = req.body;
    const plataformaId = Number(id);
    if (!Number.isFinite(plataformaId)) return res.status(400).json({ success: false, error: 'INVALID_ID' });

    const updated = await prisma.integracionDelivery.update({
      where: { id: plataformaId },
      data: { activa: Boolean(activa) },
    });

    return res.json({
      success: true,
      data: { id: updated.id, activa: updated.activa },
    });
  } catch (error) {
    console.error('Error al cambiar estado de plataforma:', error);
    return res.status(500).json({ success: false, error: 'TOGGLE_FAILED' });
  }
};

/**
 * PUT /api/gerente/integraciones/plataformas/:id/config
 * Configurar credenciales de plataforma
 */
export const configurarPlataforma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plataformaId = Number(id);
    if (!Number.isFinite(plataformaId)) return res.status(400).json({ success: false, error: 'INVALID_ID' });

    // Puede llegar como { configuracion: { apiKey, storeId, secretKey } } o plano
    const cfg = (req.body?.configuracion && typeof req.body.configuracion === 'object') ? req.body.configuracion : req.body;
    const apiKey = typeof cfg?.apiKey === 'string' ? cfg.apiKey : undefined;
    const storeId = typeof cfg?.storeId === 'string' ? cfg.storeId : undefined;
    const secretKey = typeof cfg?.secretKey === 'string' ? cfg.secretKey : undefined;

    const updated = await prisma.integracionDelivery.update({
      where: { id: plataformaId },
      data: { configuracion: { apiKey, storeId, secretKey } },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error al configurar plataforma:', error);
    return res.status(500).json({ success: false, error: 'CONFIG_FAILED' });
  }
};

/**
 * POST /api/gerente/integraciones/sincronizar/productos
 * Sincronizar productos con plataformas
 */
export const sincronizarProductos = async (req: Request, res: Response) => {
  try {
    const plataformaId = Number(req.params?.id || req.body?.plataformaId || 0);

    // Obtener productos
    const productos = await prisma.producto.findMany({
      select: { id: true, nombre: true, precio: true },
    });

    // TODO: Enviar a APIs de plataformas
    // Simulamos resultado
    const sincronizados = productos.length;
    const errores = Math.floor(Math.random() * 3); // Simulamos algunos errores aleatorios

    // Persist some telemetry when specific platform is provided
    if (Number.isFinite(plataformaId) && plataformaId > 0) {
      await prisma.integracionDelivery.updateMany({
        where: { id: plataformaId },
        data: {
          ultimaSincronizacion: new Date(),
          productosSync: sincronizados,
          errores,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        sincronizados,
        errores,
        plataformaId: Number.isFinite(plataformaId) && plataformaId > 0 ? plataformaId : null,
        fecha: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error al sincronizar productos:', error);
    return res.status(500).json({ success: false, error: 'SYNC_FAILED' });
  }
};

/**
 * GET /api/gerente/integraciones/historial
 * Obtener historial de sincronizaciones
 */
export const obtenerHistorial = async (req: Request, res: Response) => {
  try {
    const { plataforma_id, tipo, fecha_inicio, fecha_fin } = req.query;

    // TODO: Obtener de BD real
    // Simulamos historial
    const historial = [
      {
        id: 1,
        plataformaId: 1,
        plataformaNombre: 'Glovo',
        tipo: 'productos',
        resultado: 'ok',
        elementosSincronizados: 45,
        errores: [],
        fecha: new Date().toISOString(),
        duracionMs: 1234,
      },
      {
        id: 2,
        plataformaId: 1,
        plataformaNombre: 'Glovo',
        tipo: 'pedidos',
        resultado: 'ok',
        elementosSincronizados: 12,
        errores: [],
        fecha: new Date(Date.now() - 3600000).toISOString(),
        duracionMs: 567,
      },
      {
        id: 3,
        plataformaId: 2,
        plataformaNombre: 'Uber Eats',
        tipo: 'productos',
        resultado: 'error',
        elementosSincronizados: 0,
        errores: ['Error de autenticación'],
        fecha: new Date(Date.now() - 7200000).toISOString(),
        duracionMs: 123,
      },
    ];

    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

/**
 * GET /api/gerente/integraciones/pedidos
 * Obtener pedidos externos
 */
export const obtenerPedidosExternos = async (req: Request, res: Response) => {
  try {
    const { plataforma_id, estado, fecha } = req.query;

    // Obtener pedidos con tipo de entrega delivery
    const where: any = {
      tipoEntrega: 'delivery',
    };

    if (estado) where.estado = estado;
    if (fecha) {
      const fechaFiltro = new Date(fecha as string);
      const inicioDia = new Date(fechaFiltro);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fechaFiltro);
      finDia.setHours(23, 59, 59, 999);
      where.fecha = { gte: inicioDia, lte: finDia };
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        cliente: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 50,
    });

    const pedidosFormateados = pedidos.map((p: any) => ({
      id: p.id,
      plataformaId: 1, // Plataforma genérica
      plataformaNombre: 'Delivery',
      pedidoExternoId: `EXT-${p.id}`,
      estado: p.estado,
      cliente: {
        nombre: p.cliente?.nombre || 'Cliente externo',
        telefono: p.cliente?.telefono,
        direccion: p.cliente?.ciudad,
      },
      productos: p.items.map((d: any) => ({
        nombre: d.producto?.nombre || 'Producto',
        cantidad: d.cantidad,
        precio: Number(d.precio),
        notas: '',
      })),
      total: Number(p.total),
      fechaPedido: p.fecha.toISOString(),
      fechaEntregaEstimada: null,
      notas: '',
    }));

    res.json(pedidosFormateados);
  } catch (error) {
    console.error('Error al obtener pedidos externos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos externos' });
  }
};

/**
 * PUT /api/gerente/integraciones/pedidos/:id/aceptar
 * Aceptar pedido externo
 */
export const aceptarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tiempoEstimado } = req.body;

    const pedido = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'aceptado',
      },
    });

    // TODO: Notificar a la plataforma externa via API

    res.json({ id: pedido.id, estado: 'aceptado' });
  } catch (error) {
    console.error('Error al aceptar pedido:', error);
    res.status(500).json({ error: 'Error al aceptar pedido' });
  }
};

/**
 * PUT /api/gerente/integraciones/pedidos/:id/rechazar
 * Rechazar pedido externo
 */
export const rechazarPedido = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const pedido = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'cancelado',
      },
    });

    // TODO: Notificar a la plataforma externa via API

    res.json({ id: pedido.id, estado: 'rechazado' });
  } catch (error) {
    console.error('Error al rechazar pedido:', error);
    res.status(500).json({ error: 'Error al rechazar pedido' });
  }
};

/**
 * GET /api/gerente/integraciones/estadisticas
 * Obtener estadísticas de integraciones
 */
export const obtenerEstadisticas = async (req: Request, res: Response) => {
  try {
    const { empresa_id } = req.query;

    // Contar pedidos de última hora (delivery)
    const unaHoraAtras = new Date(Date.now() - 3600000);
    const pedidosUltimaHora = await prisma.pedido.count({
      where: {
        tipoEntrega: 'delivery',
        fecha: { gte: unaHoraAtras },
      },
    });

    // Contar productos activos (potencialmente sincronizables)
    const productosSync = await prisma.producto.count();

    res.json({
      plataformasActivas: 2, // Simulado
      plataformasTotales: 4,
      pedidosUltimaHora,
      tasaExitoSync: 95, // Simulado
      productosSync,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * POST /api/gerente/integraciones/plataformas/:id/test
 * Probar conexión con plataforma
 */
export const testConexion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Hacer llamada real a API de la plataforma
    // Simulamos resultado
    const exito = Math.random() > 0.3; // 70% de éxito simulado

    res.json({
      ok: exito,
      mensaje: exito ? 'Conexión exitosa' : 'Error: No se pudo conectar con la plataforma',
    });
  } catch (error) {
    console.error('Error al probar conexión:', error);
    res.status(500).json({ ok: false, mensaje: 'Error interno al probar conexión' });
  }
};
