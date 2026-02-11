/**
 * CONTROLLER: Escandallos
 * Gestión de costes, ingredientes y márgenes de productos
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

function safeNumber(n: any, decimals = 4) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}

function nowIso() {
  return new Date().toISOString();
}

// ============================================
// OBTENER TODOS LOS ESCANDALLOS
// ============================================
export const obtenerEscandallos = async (req: Request, res: Response) => {
  try {
    const empresaId = typeof req.query.empresaId === 'string' ? req.query.empresaId : undefined;
    const puntoVentaId = typeof (req.query as any).puntoVentaId === 'string' ? (req.query as any).puntoVentaId : undefined;
    const productoId = typeof req.query.productoId === 'string' ? req.query.productoId : undefined;

    const productos = await prisma.producto.findMany({
      where: { ...(productoId ? { id: Number(productoId) } : {}) },
      orderBy: { nombre: 'asc' },
      include: {
        escandallo: {
          include: { ingredientes: true },
        },
      },
    });

    const data = productos.map((p: any) => {
      const esc = p.escandallo;
      // Si se filtra por empresa/pdv, ignorar escandallos de otro contexto (si existe)
      if (esc) {
        if (empresaId && esc.empresaId && esc.empresaId !== empresaId) return null;
        if (puntoVentaId && esc.puntoVentaId && esc.puntoVentaId !== puntoVentaId) return null;
      }

      const costeTotal = safeNumber(esc?.costeTotal ?? 0, 4);
      const precioVenta = safeNumber(p.precio ?? 0, 4);
      const margen = safeNumber(precioVenta - costeTotal, 4);
      const margenPorcentaje = precioVenta > 0 ? safeNumber((margen / precioVenta) * 100, 2) : 0;

      return {
        id: esc?.id ?? null,
        productoId: p.id,
        productoNombre: p.nombre,
        categoria: 'General',
        precioVenta,
        costeTotal,
        margen,
        margenPorcentaje,
        ingredientesCount: Array.isArray(esc?.ingredientes) ? esc.ingredientes.length : 0,
        ultimaActualizacion: esc?.modificadoEn ? new Date(esc.modificadoEn).toISOString() : nowIso(),
      };
    }).filter(Boolean);

    return res.json({ success: true, data, total: data.length });
  } catch (error: any) {
    console.error('❌ Error obteniendo escandallos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// OBTENER ESCANDALLO POR PRODUCTO
// ============================================
export const obtenerEscandalloPorProducto = async (req: Request, res: Response) => {
  try {
    const { productoId } = req.params;

    const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });

    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    const esc = await prisma.escandallo.findUnique({
      where: { productoId: Number(productoId) },
      include: {
        ingredientes: {
          orderBy: { id: 'asc' },
          include: {
            articulo: { select: { id: true, nombre: true, unidadMedida: true, precioUltimaCompra: true, proveedorId: true } },
          },
        },
      },
    });

    const costeTotal = safeNumber(esc?.costeTotal ?? 0, 4);
    const precioVenta = safeNumber(producto.precio ?? 0, 4);
    const margen = safeNumber(precioVenta - costeTotal, 4);
    const margenPorcentaje = precioVenta > 0 ? safeNumber((margen / precioVenta) * 100, 2) : 0;

    const data = {
      id: esc?.id ?? null,
      productoId: producto.id,
      productoNombre: producto.nombre,
      categoria: 'General',
      precioVenta,
      costeTotal,
      margen,
      margenPorcentaje,
      ingredientes: (esc?.ingredientes || []).map((i: any) => ({
        id: i.id,
        articuloId: i.articuloId ?? null,
        nombre: i.nombre,
        unidad: i.unidad,
        cantidad: safeNumber(i.cantidad ?? 0, 4),
        costeUnitario: safeNumber(i.costeUnitario ?? 0, 4),
        costeTotal: safeNumber(i.costeTotal ?? 0, 4),
        proveedorId: i.proveedorId ?? i.articulo?.proveedorId ?? null,
      })),
      ultimaActualizacion: esc?.modificadoEn ? new Date(esc.modificadoEn).toISOString() : nowIso(),
    };

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Error obteniendo escandallo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// GUARDAR/ACTUALIZAR ESCANDALLO
// ============================================
export const guardarEscandallo = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const productoId = Number(body.productoId);
    const empresaId = typeof body.empresaId === 'string' ? body.empresaId : null;
    const puntoVentaId = typeof body.puntoVentaId === 'string' ? body.puntoVentaId : null;
    const notas = typeof body.notas === 'string' ? body.notas : null;
    const ingredientesIn = Array.isArray(body.ingredientes) ? body.ingredientes : [];

    if (!Number.isFinite(productoId)) {
      return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: productoId inválido' });
    }

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: Number(productoId) },
    });

    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    const articuloIds = ingredientesIn
      .map((i: any) => Number(i?.articuloId))
      .filter((n: number) => Number.isFinite(n));

    const articulos = articuloIds.length
      ? await prisma.articuloStock.findMany({
          where: { id: { in: articuloIds } },
          select: { id: true, nombre: true, unidadMedida: true, precioUltimaCompra: true, proveedorId: true },
        })
      : [];
    const articuloMap = new Map<number, any>(articulos.map((a) => [a.id, a]));

    const ingredientesNormalized = ingredientesIn
      .map((raw: any) => {
        const articuloId = Number(raw?.articuloId);
        const hasArticulo = Number.isFinite(articuloId) && articuloMap.has(articuloId);
        const articulo = hasArticulo ? articuloMap.get(articuloId) : null;

        const nombre = String(raw?.nombre || articulo?.nombre || '').trim();
        const unidad = String(raw?.unidad || articulo?.unidadMedida || '').trim() || 'ud';
        const cantidad = safeNumber(raw?.cantidad ?? 0, 4);
        if (!nombre || !Number.isFinite(cantidad) || cantidad <= 0) return null;

        const costeUnitarioFromPayload = Number(raw?.costeUnitario);
        const costeUnitario = Number.isFinite(costeUnitarioFromPayload)
          ? safeNumber(costeUnitarioFromPayload, 4)
          : safeNumber(articulo?.precioUltimaCompra ?? 0, 4);
        const costeTotal = safeNumber(costeUnitario * cantidad, 4);

        return {
          articuloId: hasArticulo ? articuloId : null,
          nombre,
          unidad,
          cantidad,
          costeUnitario,
          costeTotal,
          proveedorId: raw?.proveedorId ? Number(raw.proveedorId) : articulo?.proveedorId ?? null,
        };
      })
      .filter(Boolean) as any[];

    const costeTotalComputed = safeNumber(
      ingredientesNormalized.reduce((sum: number, i: any) => sum + (Number(i.costeTotal) || 0), 0),
      4,
    );

    const saved = await prisma.$transaction(async (tx) => {
      const esc = await tx.escandallo.upsert({
        where: { productoId },
        update: {
          empresaId,
          puntoVentaId,
          notas,
          costeTotal: costeTotalComputed,
        },
        create: {
          productoId,
          empresaId,
          puntoVentaId,
          notas,
          costeTotal: costeTotalComputed,
        },
      });

      await tx.escandalloIngrediente.deleteMany({ where: { escandalloId: esc.id } });
      if (ingredientesNormalized.length > 0) {
        await tx.escandalloIngrediente.createMany({
          data: ingredientesNormalized.map((i: any) => ({
            escandalloId: esc.id,
            articuloId: i.articuloId,
            nombre: i.nombre,
            unidad: i.unidad,
            cantidad: i.cantidad,
            costeUnitario: i.costeUnitario,
            costeTotal: i.costeTotal,
            proveedorId: i.proveedorId,
          })),
        });
      }

      return esc;
    });

    const data = await prisma.escandallo.findUnique({
      where: { productoId },
      include: { ingredientes: { orderBy: { id: 'asc' } } },
    });

    return res.json({ success: true, data, message: 'Escandallo guardado correctamente' });
  } catch (error: any) {
    console.error('❌ Error guardando escandallo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// OBTENER RESUMEN DE ESCANDALLOS
// ============================================
export const obtenerResumenEscandallos = async (req: Request, res: Response) => {
  try {
    const empresaId = typeof req.query.empresaId === 'string' ? req.query.empresaId : undefined;
    const puntoVentaId = typeof (req.query as any).puntoVentaId === 'string' ? (req.query as any).puntoVentaId : undefined;

    const totalProductos = await prisma.producto.count();
    const escWhere: any = {
      ...(empresaId ? { empresaId } : {}),
      ...(puntoVentaId ? { puntoVentaId } : {}),
    };
    const productosConEscandallo = await prisma.escandallo.count({ where: escWhere });

    const escs = await prisma.escandallo.findMany({
      where: escWhere,
      include: { producto: { select: { precio: true } } },
    });
    const margenesPct = escs
      .map((e: any) => {
        const precio = Number(e.producto?.precio) || 0;
        const coste = Number(e.costeTotal) || 0;
        const margen = precio - coste;
        return precio > 0 ? (margen / precio) * 100 : 0;
      })
      .filter((x) => Number.isFinite(x));

    const margenPromedio = margenesPct.length
      ? safeNumber(margenesPct.reduce((s, x) => s + x, 0) / margenesPct.length, 2)
      : 0;

    const productosMargenBajo = margenesPct.filter((x) => x > 0 && x < 40).length;

    return res.json({
      success: true,
      data: {
        totalProductos,
        productosConEscandallo,
        productosSinEscandallo: Math.max(0, totalProductos - productosConEscandallo),
        margenPromedio,
        productosMargenBajo,
        alertasCostes: productosMargenBajo,
        ultimaActualizacion: nowIso(),
      },
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo resumen escandallos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// OBTENER COSTES POR PROVEEDOR
// ============================================
export const obtenerCostesPorProveedor = async (req: Request, res: Response) => {
  try {
    const { empresaId } = req.query;

    const groups = await prisma.escandalloIngrediente.groupBy({
      by: ['proveedorId'],
      where: {
        proveedorId: { not: null },
      } as any,
      _sum: { costeTotal: true },
      _avg: { costeUnitario: true },
      _count: { _all: true },
    });

    const proveedorIds = groups.map((g) => g.proveedorId).filter((x): x is number => typeof x === 'number');
    const proveedores = await prisma.proveedor.findMany({
      where: {
        id: { in: proveedorIds },
        ...(empresaId ? { empresaId: String(empresaId) } : {}),
      } as any,
      select: { id: true, nombre: true },
    });
    const provMap = new Map<number, any>(proveedores.map((p) => [p.id, p]));

    const data = groups
      .map((g) => {
        const pid = g.proveedorId as number | null;
        if (!pid) return null;
        const p = provMap.get(pid);
        return {
          proveedorId: pid,
          proveedorNombre: p?.nombre || `Proveedor ${pid}`,
          totalLineas: g._count._all,
          costePromedioUnitario: safeNumber(g._avg.costeUnitario ?? 0, 4),
          costeTotal: safeNumber(g._sum.costeTotal ?? 0, 2),
        };
      })
      .filter(Boolean);

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Error obteniendo costes por proveedor:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// RECALCULAR ESCANDALLOS
// ============================================
export const recalcularEscandallos = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const productoIds = Array.isArray(body.productoIds) ? body.productoIds.map((x: any) => Number(x)).filter((n: number) => Number.isFinite(n)) : null;
    const empresaId = typeof body.empresaId === 'string' ? body.empresaId : undefined;
    const puntoVentaId = typeof body.puntoVentaId === 'string' ? body.puntoVentaId : undefined;

    const where: any = {
      ...(empresaId ? { empresaId } : {}),
      ...(puntoVentaId ? { puntoVentaId } : {}),
      ...(productoIds && productoIds.length > 0 ? { productoId: { in: productoIds } } : {}),
    };

    const escandallos = await prisma.escandallo.findMany({
      where,
      include: { ingredientes: true },
    });

    const start = Date.now();
    let errores = 0;

    for (const esc of escandallos) {
      try {
        const articuloIds = esc.ingredientes.map((i) => i.articuloId).filter((x): x is number => typeof x === 'number');
        const articulos = articuloIds.length
          ? await prisma.articuloStock.findMany({
              where: { id: { in: articuloIds } },
              select: { id: true, precioUltimaCompra: true },
            })
          : [];
        const map = new Map<number, any>(articulos.map((a) => [a.id, a]));

        const updates = esc.ingredientes
          .filter((i) => i.articuloId && map.has(i.articuloId))
          .map((i) => {
            const precio = Number(map.get(i.articuloId!).precioUltimaCompra) || 0;
            const costeUnitario = safeNumber(precio, 4);
            const costeTotal = safeNumber(costeUnitario * (Number(i.cantidad) || 0), 4);
            return { id: i.id, costeUnitario, costeTotal };
          });

        if (updates.length > 0) {
          await prisma.$transaction(async (tx) => {
            for (const u of updates) {
              await tx.escandalloIngrediente.update({
                where: { id: u.id },
                data: { costeUnitario: u.costeUnitario, costeTotal: u.costeTotal },
              });
            }
            const total = safeNumber(updates.reduce((s, u) => s + u.costeTotal, 0), 4);
            await tx.escandallo.update({ where: { id: esc.id }, data: { costeTotal: total } });
          });
        }
      } catch (e) {
        errores += 1;
      }
    }

    const duracionMs = Date.now() - start;
    return res.json({
      success: true,
      data: {
        productosRecalculados: escandallos.length,
        errores,
        duracionMs,
        fechaRecalculo: nowIso(),
      },
      message: `Se han recalculado ${escandallos.length} escandallos`,
    });
  } catch (error: any) {
    console.error('❌ Error recalculando escandallos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
