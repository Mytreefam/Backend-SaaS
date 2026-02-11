import type { Response } from 'express';
import prisma from '../../prisma/client';

async function ensureEmpleadoForUser(params: {
  clienteId: number;
  email: string;
}): Promise<{ id: number; puntoVentaId: string; nombre: string }> {
  const existing = await prisma.empleado.findUnique({ where: { email: params.email } });
  if (existing) return { id: existing.id, puntoVentaId: existing.puntoVentaId, nombre: existing.nombre };

  const cliente = await prisma.cliente.findUnique({ where: { id: params.clienteId } });
  const nombre = cliente?.nombre || params.email.split('@')[0] || 'Trabajador';
  const puntoVentaId = String(process.env.DEFAULT_PUNTO_VENTA_ID || 'PDV-TIANA');

  const nuevo = await prisma.empleado.create({
    data: {
      nombre,
      email: params.email,
      telefono: cliente?.telefono || '',
      foto: cliente?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nombre)}`,
      puesto: 'Trabajador',
      empresaId: String(process.env.DEFAULT_EMPRESA_ID || 'HOYPCM000'),
      marcaId: String(process.env.DEFAULT_MARCA_ID || 'CAFE01'),
      puntoVentaId,
      horarioEntrada: '09:00',
      horarioSalida: '17:00',
      turno: null,
      salarioBase: 0,
      estado: 'activo',
      desempeno: 0,
      horasMes: 0,
    },
  });

  return { id: nuevo.id, puntoVentaId: nuevo.puntoVentaId, nombre: nuevo.nombre };
}

function requirePdvMatch(empleadoPdv: string, requestedPdv: string) {
  // For now we restrict to the PDV assigned to the employee record.
  // This avoids workers reading other PDVs by changing query params.
  if (requestedPdv && empleadoPdv && requestedPdv !== empleadoPdv) {
    return false;
  }
  return true;
}

/**
 * GET /trabajador/stock/articulos?puntoVentaId=PDV-XXX&empresaId=EMP-XXX
 */
export const listArticulos = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const puntoVentaId = String(req.query?.puntoVentaId || '').trim();
  const empresaId = req.query?.empresaId ? String(req.query.empresaId).trim() : '';
  if (!puntoVentaId) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: puntoVentaId requerido' });

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  if (!requirePdvMatch(empleado.puntoVentaId, puntoVentaId)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const where: any = { puntoVentaId };
  if (empresaId) where.empresaId = empresaId;

  const articulos = await prisma.articuloStock.findMany({
    where,
    include: { proveedor: { select: { id: true, nombre: true } } },
    orderBy: { nombre: 'asc' },
  });

  return res.json({ success: true, data: articulos });
};

/**
 * GET /trabajador/stock/movimientos?puntoVentaId=PDV-XXX
 */
export const listMovimientos = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const puntoVentaId = String(req.query?.puntoVentaId || '').trim();
  if (!puntoVentaId) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: puntoVentaId requerido' });

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  if (!requirePdvMatch(empleado.puntoVentaId, puntoVentaId)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const movimientos = await prisma.movimientoStock.findMany({
    where: { articulo: { puntoVentaId } },
    include: { articulo: true },
    orderBy: { fecha: 'desc' },
    take: 200,
  });

  const out = movimientos.map((m) => ({
    id: m.id,
    articuloId: m.articuloId,
    articuloNombre: m.articulo?.nombre || '',
    tipo: m.tipo,
    cantidad: m.cantidad,
    stockAnterior: m.stockAnterior,
    stockPosterior: m.stockPosterior,
    motivo: m.motivo,
    observaciones: m.observaciones,
    usuarioId: m.usuarioId,
    usuarioNombre: m.usuarioNombre,
    pedidoProveedorId: m.pedidoProveedorId,
    fecha: m.fecha,
  }));

  return res.json({ success: true, data: out });
};

/**
 * GET /trabajador/stock/pedidos-proveedor?puntoVentaId=PDV-XXX&empresaId=EMP-XXX&estado=pendiente
 */
export const listPedidosProveedor = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const puntoVentaId = String(req.query?.puntoVentaId || '').trim();
  const empresaId = req.query?.empresaId ? String(req.query.empresaId).trim() : '';
  const estado = req.query?.estado ? String(req.query.estado).trim() : '';
  if (!puntoVentaId) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: puntoVentaId requerido' });

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  if (!requirePdvMatch(empleado.puntoVentaId, puntoVentaId)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const where: any = { puntoVentaId };
  if (empresaId) where.empresaId = empresaId;
  if (estado) where.estado = estado;

  const pedidos = await prisma.pedidoProveedor.findMany({
    where,
    include: { proveedor: true, items: true },
    orderBy: { fechaPedido: 'desc' },
    take: 100,
  });

  return res.json({ success: true, data: pedidos });
};

/**
 * POST /trabajador/stock/pedidos-proveedor/:id/recibir
 * body: { items?: [{ articuloId: number; cantidadRecibida?: number }], observaciones?: string }
 */
export const recibirPedidoProveedor = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const pedidoId = Number(req.params?.id);
  if (!Number.isFinite(pedidoId) || pedidoId <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: id inválido' });
  }

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });

  const pedido = await prisma.pedidoProveedor.findUnique({
    where: { id: pedidoId },
    include: { items: true },
  });
  if (!pedido) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  if (!requirePdvMatch(empleado.puntoVentaId, pedido.puntoVentaId)) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const itemsInput: Array<{ articuloId?: number; itemId?: number; cantidadRecibida?: number; cantidad?: number }> =
    Array.isArray(req.body?.items) ? req.body.items : [];
  const observaciones = req.body?.observaciones ? String(req.body.observaciones) : undefined;

  const result = await prisma.$transaction(async (tx) => {
    const updatedPedido = await tx.pedidoProveedor.update({
      where: { id: pedidoId },
      data: {
        estado: 'recibido',
        fechaRecepcion: new Date(),
        observaciones: observaciones || undefined,
        recibidoPor: empleado.id,
        modificadoEn: new Date(),
      },
      include: { proveedor: true, items: true },
    });

    // If no items provided, just mark as recibido (no stock moves)
    for (const item of itemsInput) {
      const articuloId = Number(item.articuloId || item.itemId);
      if (!Number.isFinite(articuloId) || articuloId <= 0) continue;

      const cantidadRecibida = Number(item.cantidadRecibida ?? item.cantidad ?? 0);
      if (!Number.isFinite(cantidadRecibida) || cantidadRecibida <= 0) continue;

      const articulo = await tx.articuloStock.findUnique({ where: { id: articuloId } });
      if (!articulo) continue;
      if (articulo.puntoVentaId !== updatedPedido.puntoVentaId) continue;

      const nuevoStock = articulo.stockActual + cantidadRecibida;
      await tx.articuloStock.update({
        where: { id: articuloId },
        data: {
          stockActual: nuevoStock,
          alertaStockBajo: nuevoStock <= articulo.stockMinimo,
          fechaUltimaCompra: new Date(),
        },
      });

      await tx.movimientoStock.create({
        data: {
          articuloId: articuloId,
          tipo: 'entrada',
          cantidad: cantidadRecibida,
          stockAnterior: articulo.stockActual,
          stockPosterior: nuevoStock,
          motivo: `Recepción pedido ${updatedPedido.numero}`,
          pedidoProveedorId: updatedPedido.id,
          usuarioId: empleado.id,
          usuarioNombre: empleado.nombre,
        },
      });
    }

    return updatedPedido;
  });

  return res.json({ success: true, data: result });
};

/**
 * POST /trabajador/stock/articulos/:id/ajustar
 * body: { tipo: 'entrada'|'salida'|'ajuste'|'merma'; cantidad: number; motivo?: string; observaciones?: string }
 */
export const ajustarArticulo = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const articuloId = Number(req.params?.id);
  if (!Number.isFinite(articuloId) || articuloId <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: id inválido' });
  }

  const tipo = String(req.body?.tipo || '').trim();
  const cantidad = typeof req.body?.cantidad === 'string' ? Number(req.body.cantidad) : Number(req.body?.cantidad ?? NaN);
  const motivo = req.body?.motivo ? String(req.body.motivo) : undefined;
  const observaciones = req.body?.observaciones ? String(req.body.observaciones) : undefined;

  const tiposValidos = ['entrada', 'salida', 'ajuste', 'merma', 'consumo_propio'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: tipo inválido' });
  }
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: cantidad inválida' });
  }

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });

  const result = await prisma.$transaction(async (tx) => {
    const articulo = await tx.articuloStock.findUnique({ where: { id: articuloId } });
    if (!articulo) return { kind: 'not_found' as const };
    if (!requirePdvMatch(empleado.puntoVentaId, articulo.puntoVentaId)) return { kind: 'forbidden' as const };

    let nuevoStock = articulo.stockActual;
    if (tipo === 'entrada') nuevoStock = articulo.stockActual + cantidad;
    if (tipo === 'salida' || tipo === 'merma' || tipo === 'consumo_propio') nuevoStock = articulo.stockActual - cantidad;
    if (tipo === 'ajuste') nuevoStock = cantidad;

    if (nuevoStock < 0) return { kind: 'insufficient' as const };

    const articuloUpdated = await tx.articuloStock.update({
      where: { id: articuloId },
      data: {
        stockActual: nuevoStock,
        alertaStockBajo: nuevoStock <= articulo.stockMinimo,
      },
    });

    const movimiento = await tx.movimientoStock.create({
      data: {
        articuloId,
        tipo,
        cantidad,
        stockAnterior: articulo.stockActual,
        stockPosterior: nuevoStock,
        motivo: motivo || tipo,
        observaciones,
        usuarioId: empleado.id,
        usuarioNombre: empleado.nombre,
      },
    });

    return { kind: 'ok' as const, articulo: articuloUpdated, movimiento };
  });

  if (result.kind === 'not_found') return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  if (result.kind === 'forbidden') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  if (result.kind === 'insufficient') return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: Stock insuficiente' });

  return res.json({ success: true, data: { articulo: result.articulo, movimiento: result.movimiento } });
};

