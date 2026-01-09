/**
 * CONTROLADOR: Integraciones Delivery
 * Endpoints para gestión de plataformas externas (Glovo, Uber Eats, etc.)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos de plataformas disponibles (configuración base)
const PLATAFORMAS_BASE = [
  { id: 1, codigo: 'glovo', nombre: 'Glovo', logo: '/logos/glovo.png' },
  { id: 2, codigo: 'uber_eats', nombre: 'Uber Eats', logo: '/logos/ubereats.png' },
  { id: 3, codigo: 'just_eat', nombre: 'Just Eat', logo: '/logos/justeat.png' },
  { id: 4, codigo: 'deliveroo', nombre: 'Deliveroo', logo: '/logos/deliveroo.png' },
];

/**
 * GET /api/gerente/integraciones/plataformas
 * Obtener todas las plataformas configuradas
 */
export const obtenerPlataformas = async (req: Request, res: Response) => {
  try {
    const { empresa_id } = req.query;

    // TODO: Obtener configuración real de BD
    // Por ahora devolvemos plataformas base con estado simulado
    const plataformas = PLATAFORMAS_BASE.map(p => ({
      ...p,
      activa: p.codigo === 'glovo' || p.codigo === 'uber_eats', // Simulamos algunas activas
      conectada: p.codigo === 'glovo',
      ultimaSincronizacion: p.codigo === 'glovo' ? new Date().toISOString() : null,
      errores: 0,
      productosSync: p.codigo === 'glovo' ? 45 : 0,
      pedidosHoy: p.codigo === 'glovo' ? 12 : 0,
    }));

    res.json(plataformas);
  } catch (error) {
    console.error('Error al obtener plataformas:', error);
    res.status(500).json({ error: 'Error al obtener plataformas' });
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

    // TODO: Guardar en BD
    res.json({ 
      id: parseInt(id), 
      activa, 
      mensaje: `Plataforma ${activa ? 'activada' : 'desactivada'} correctamente` 
    });
  } catch (error) {
    console.error('Error al cambiar estado de plataforma:', error);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

/**
 * PUT /api/gerente/integraciones/plataformas/:id/config
 * Configurar credenciales de plataforma
 */
export const configurarPlataforma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { apiKey, storeId, secretKey } = req.body;

    // TODO: Guardar credenciales encriptadas en BD
    res.json({ 
      id: parseInt(id), 
      configurado: true,
      mensaje: 'Credenciales guardadas correctamente' 
    });
  } catch (error) {
    console.error('Error al configurar plataforma:', error);
    res.status(500).json({ error: 'Error al configurar plataforma' });
  }
};

/**
 * POST /api/gerente/integraciones/sincronizar/productos
 * Sincronizar productos con plataformas
 */
export const sincronizarProductos = async (req: Request, res: Response) => {
  try {
    const { plataformaId } = req.body;

    // Obtener productos
    const productos = await prisma.producto.findMany({
      select: { id: true, nombre: true, precio: true },
    });

    // TODO: Enviar a APIs de plataformas
    // Simulamos resultado
    const sincronizados = productos.length;
    const errores = Math.floor(Math.random() * 3); // Simulamos algunos errores aleatorios

    res.json({
      sincronizados,
      errores,
      plataformaId: plataformaId || 'todas',
      fecha: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al sincronizar productos:', error);
    res.status(500).json({ error: 'Error al sincronizar productos' });
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

    const pedidosFormateados = pedidos.map(p => ({
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
