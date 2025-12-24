/**
 * CONTROLADOR: Gestión de Productos (Catálogo)
 * Endpoints para CRUD de productos del catálogo de ventas
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/gerente/productos:
 *   get:
 *     summary: Obtener catálogo de productos con filtros avanzados
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: marca_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo_producto
 *         schema:
 *           type: string
 *           enum: [simple, manufacturado, combo]
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catálogo de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductoCatalogo'
 */
export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const {
      empresa_id,
      marca_id,
      punto_venta_id,
      categoria,
      tipo_producto, // simple, manufacturado, combo
      activo,
      busqueda
    } = req.query;

    // Obtener productos de Prisma
    const productos = await prisma.producto.findMany({
      include: {
        pedidoItems: {
          take: 10,
          orderBy: { id: 'desc' }
        }
      }
    });

    // Transformar a formato esperado por frontend
    const productosTransformados = productos.map(p => ({
      id: p.id.toString(),
      sku: `PRD-${p.id.toString().padStart(3, '0')}`,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: 'General', // TODO: Agregar categoría al schema
      tipo_producto: 'simple', // TODO: Agregar al schema
      empresa_id: empresa_id || 'EMP-001',
      empresa_nombre: 'Mi Empresa',
      marcas_ids: [marca_id || 'MRC-001'],
      marcas_nombres: ['Mi Marca'],
      precio: p.precio,
      precio_compra: p.precio * 0.6, // Estimado
      stock: p.stock,
      stock_minimo: 10,
      imagen: p.imagen,
      activo: p.stock > 0,
      destacado: false,
      visible_app: true,
      visible_tpv: true,
      iva: 10,
      unidad: 'unidad',
      fecha_creacion: new Date(),
      fecha_modificacion: new Date()
    }));

    res.json(productosTransformados);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * GET /api/gerente/productos/:id
 * Obtener detalle completo de un producto
 */
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) },
      include: {
        pedidoItems: {
          include: {
            pedido: {
              include: {
                cliente: true
              }
            }
          }
        }
      }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      id: producto.id.toString(),
      sku: `PRD-${producto.id.toString().padStart(3, '0')}`,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen,
      ventas_totales: producto.pedidoItems.length,
      ultima_venta: producto.pedidoItems[0]?.pedido.fecha
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

/**
 * POST /api/gerente/productos
 * Crear un nuevo producto
 */
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      tipo_producto,
      empresa_id,
      marcas_ids,
      precio,
      precio_compra,
      stock_inicial,
      stock_minimo,
      imagen,
      iva,
      unidad,
      visible_app,
      visible_tpv
    } = req.body;

    // Validaciones
    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, precio' });
    }

    // Crear producto en Prisma
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        precio: parseFloat(precio),
        stock: stock_inicial || 0,
        imagen: imagen || null
      }
    });

    res.status(201).json({
      id: nuevoProducto.id.toString(),
      sku: `PRD-${nuevoProducto.id.toString().padStart(3, '0')}`,
      nombre: nuevoProducto.nombre,
      descripcion: nuevoProducto.descripcion,
      precio: nuevoProducto.precio,
      stock: nuevoProducto.stock,
      imagen: nuevoProducto.imagen,
      fecha_creacion: new Date()
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

/**
 * PUT /api/gerente/productos/:id
 * Actualizar un producto existente
 */
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre: datosActualizados.nombre,
        descripcion: datosActualizados.descripcion,
        precio: datosActualizados.precio ? parseFloat(datosActualizados.precio) : undefined,
        stock: datosActualizados.stock !== undefined ? parseInt(datosActualizados.stock) : undefined,
        imagen: datosActualizados.imagen
      }
    });

    res.json({
      ...productoActualizado,
      id: productoActualizado.id.toString(),
      message: 'Producto actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

/**
 * DELETE /api/gerente/productos/:id
 * Eliminar (desactivar) un producto
 */
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - marcar como inactivo en lugar de eliminar
    // TODO: Agregar campo 'activo' al schema
    await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        stock: 0 // Por ahora usar stock 0 como "inactivo"
      }
    });

    res.json({ message: 'Producto desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

/**
 * GET /api/gerente/productos/categorias
 * Obtener listado de categorías disponibles
 */
export const obtenerCategorias = async (req: Request, res: Response) => {
  try {
    const categorias = [
      { id: 'pan-bolleria', nombre: 'Pan y Bollería', icono: '🥖' },
      { id: 'pasteleria', nombre: 'Pastelería', icono: '🍰' },
      { id: 'bebidas', nombre: 'Bebidas', icono: '☕' },
      { id: 'salados', nombre: 'Salados', icono: '🥐' },
      { id: 'complementos', nombre: 'Complementos', icono: '🍯' }
    ];

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

/**
 * POST /api/gerente/productos/:id/duplicar
 * Duplicar un producto existente
 */
export const duplicarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productoOriginal = await prisma.producto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!productoOriginal) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoDuplicado = await prisma.producto.create({
      data: {
        nombre: `${productoOriginal.nombre} (Copia)`,
        descripcion: productoOriginal.descripcion,
        precio: productoOriginal.precio,
        stock: 0,
        imagen: productoOriginal.imagen
      }
    });

    res.status(201).json({
      id: productoDuplicado.id.toString(),
      message: 'Producto duplicado correctamente'
    });
  } catch (error) {
    console.error('Error al duplicar producto:', error);
    res.status(500).json({ error: 'Error al duplicar producto' });
  }
};

/**
 * GET /api/gerente/productos/estadisticas
 * Obtener estadísticas del catálogo
 */
export const obtenerEstadisticasProductos = async (req: Request, res: Response) => {
  try {
    const totalProductos = await prisma.producto.count();
    const productosActivos = await prisma.producto.count({
      where: { stock: { gt: 0 } }
    });
    const productosStockBajo = await prisma.producto.count({
      where: { stock: { lt: 10 } }
    });

    // Productos más vendidos
    const masVendidos = await prisma.pedidoItem.groupBy({
      by: ['productoId'],
      _sum: {
        cantidad: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 5
    });

    res.json({
      total_productos: totalProductos,
      productos_activos: productosActivos,
      productos_inactivos: totalProductos - productosActivos,
      productos_stock_bajo: productosStockBajo,
      productos_mas_vendidos: masVendidos
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
