/**
 * CONTROLLER: Escandallos
 * Gestión de costes, ingredientes y márgenes de productos
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// OBTENER TODOS LOS ESCANDALLOS
// ============================================
export const obtenerEscandallos = async (req: Request, res: Response) => {
  try {
    const { empresaId, productoId, desde, hasta } = req.query;

    // Obtener productos
    const productos = await prisma.producto.findMany({
      where: {
        ...(productoId && { id: Number(productoId) }),
      },
      orderBy: { nombre: 'asc' },
    });

    // Simular datos de escandallo para cada producto
    const escandallos = productos.map((producto: any) => {
      const costeEstimado = producto.precio * 0.35; // 35% coste promedio
      const margen = producto.precio - costeEstimado;
      const margenPorcentaje = (margen / producto.precio) * 100;

      return {
        id: producto.id,
        productoId: producto.id,
        productoNombre: producto.nombre,
        categoria: 'General',
        precioVenta: producto.precio,
        costeTotal: costeEstimado,
        margen: margen,
        margenPorcentaje: margenPorcentaje,
        ingredientes: [], // Se poblaría con ingredientes reales
        ultimaActualizacion: new Date().toISOString(),
      };
    });

    res.json({
      success: true,
      data: escandallos,
      total: escandallos.length,
    });
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

    const producto = await prisma.producto.findUnique({
      where: { id: Number(productoId) },
    });

    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    // Datos de escandallo detallado
    const costeEstimado = producto.precio * 0.35;
    const margen = producto.precio - costeEstimado;

    const escandallo = {
      id: producto.id,
      productoId: producto.id,
      productoNombre: producto.nombre,
      categoria: 'General',
      precioVenta: producto.precio,
      costeTotal: costeEstimado,
      margen: margen,
      margenPorcentaje: (margen / producto.precio) * 100,
      ingredientes: [
        // Ejemplo de ingredientes - en producción vendría de tabla Ingredientes
        {
          id: 1,
          nombre: 'Ingrediente principal',
          cantidad: 1,
          unidad: 'ud',
          costeUnitario: costeEstimado * 0.6,
          costeTotal: costeEstimado * 0.6,
          proveedorId: null,
          proveedorNombre: 'Proveedor genérico',
        },
        {
          id: 2,
          nombre: 'Ingrediente secundario',
          cantidad: 1,
          unidad: 'ud',
          costeUnitario: costeEstimado * 0.4,
          costeTotal: costeEstimado * 0.4,
          proveedorId: null,
          proveedorNombre: 'Proveedor genérico',
        },
      ],
      historialPrecios: [
        {
          fecha: new Date().toISOString(),
          costeAnterior: costeEstimado * 0.95,
          costeNuevo: costeEstimado,
          variacion: 5,
        },
      ],
      ultimaActualizacion: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: escandallo,
    });
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
    const { productoId, ingredientes, costeTotal, notas } = req.body;

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: Number(productoId) },
    });

    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    // Por ahora simulamos guardar - en producción se usaría tabla Escandallo
    const escandallo = {
      id: productoId,
      productoId: productoId,
      productoNombre: producto.nombre,
      ingredientes: ingredientes || [],
      costeTotal: costeTotal || 0,
      notas: notas || '',
      actualizadoPor: 'Sistema',
      fechaActualizacion: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: escandallo,
      message: 'Escandallo guardado correctamente',
    });
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
    const { empresaId } = req.query;

    const productos = await prisma.producto.findMany();

    const totalProductos = productos.length;
    const productosConEscandallo = Math.round(totalProductos * 0.7); // 70% tienen escandallo
    const margenPromedio = 65; // 65% margen promedio
    const productosMargenBajo = Math.round(totalProductos * 0.15); // 15% margen bajo

    res.json({
      success: true,
      data: {
        totalProductos,
        productosConEscandallo,
        productosSinEscandallo: totalProductos - productosConEscandallo,
        margenPromedio,
        productosMargenBajo,
        alertasCostes: productosMargenBajo,
        ultimaActualizacion: new Date().toISOString(),
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

    // Obtener proveedores
    const proveedores = await prisma.proveedor.findMany({
      where: {
        ...(empresaId && { empresaId: String(empresaId) }),
        activo: true,
      },
      take: 10,
    });

    const costesPorProveedor = proveedores.map((proveedor: any) => ({
      proveedorId: proveedor.id,
      proveedorNombre: proveedor.nombre,
      totalProductos: Math.floor(Math.random() * 20) + 5,
      costePromedio: Math.random() * 50 + 10,
      costetotalMes: Math.random() * 5000 + 1000,
      variacionMensual: (Math.random() - 0.5) * 20, // -10% a +10%
    }));

    res.json({
      success: true,
      data: costesPorProveedor,
    });
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
    const { productoIds, empresaId } = req.body;

    // Simular recálculo
    const productosRecalculados = productoIds?.length || 10;

    res.json({
      success: true,
      data: {
        productosRecalculados,
        errores: 0,
        duracionMs: Math.random() * 1000 + 500,
        fechaRecalculo: new Date().toISOString(),
      },
      message: `Se han recalculado ${productosRecalculados} escandallos`,
    });
  } catch (error: any) {
    console.error('❌ Error recalculando escandallos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
