/**
 * CONTROLADOR: Gestión de Stock y Proveedores
 * Endpoints para gestionar inventario, artículos, proveedores y pedidos
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

// ============================================
// ARTÍCULOS DE STOCK
// ============================================

export const obtenerArticulosStock = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id, categoria, busqueda, stock_bajo } = req.query;

    console.log('📥 obtenerArticulosStock - Parámetros:', { empresa_id, punto_venta_id, categoria, busqueda, stock_bajo });

    const where: any = {};
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    if (categoria) where.categoria = { contains: categoria as string };
    if (stock_bajo === 'true') {
      where.alertaStockBajo = true;
    }
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda as string } },
        { codigoInterno: { contains: busqueda as string } }
      ];
    }

    console.log('🔍 Filtros donde:', JSON.stringify(where));

    const articulos = await prisma.articuloStock.findMany({
      where,
      include: {
        proveedor: {
          select: { id: true, nombre: true, contactoEmail: true, contactoTelefono: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    console.log('✅ Artículos encontrados:', articulos.length, 'IDs:', articulos.map((a: any) => a.id));

    res.json({ success: true, data: articulos });
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener artículos' });
  }
};

export const crearArticuloStock = async (req: Request, res: Response) => {
  try {
    console.log('📥 Crear artículo - Body recibido:', req.body);
    
    const {
      // Aceptar ambos formatos: camelCase y snake_case
      codigoInterno, codigo_interno,
      nombre,
      categoria,
      unidadMedida, unidad_medida,
      stockActual, stock_actual,
      stockMinimo, stock_minimo,
      stockMaximo, stock_maximo,
      empresaId, empresa_id,
      puntoVentaId, punto_venta_id,
      proveedorId, proveedor_id,
      precioUltimaCompra, precio_ultima_compra,
      ubicacionAlmacen, ubicacion_almacen
    } = req.body;

    const codigoInternoFinal = codigoInterno || codigo_interno;
    const empresaIdFinal = empresaId || empresa_id;
    const puntoVentaIdFinal = puntoVentaId || punto_venta_id;
    const unidadMedidaFinal = unidadMedida || unidad_medida || 'unidad';
    const stockActualFinal = stockActual ?? stock_actual ?? 0;
    const stockMinimoFinal = stockMinimo ?? stock_minimo ?? 0;
    const stockMaximoFinal = stockMaximo ?? stock_maximo ?? 999999;
    const proveedorIdFinal = proveedorId || proveedor_id;
    const precioUltimaCompraFinal = precioUltimaCompra ?? precio_ultima_compra;
    const ubicacionAlmacenFinal = ubicacionAlmacen || ubicacion_almacen;

    if (!codigoInternoFinal || !nombre || !empresaIdFinal || !puntoVentaIdFinal) {
      console.log('❌ Faltan campos:', { codigoInternoFinal, nombre, empresaIdFinal, puntoVentaIdFinal });
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios (código, nombre, empresa, punto de venta)' });
    }

    // Validar código único
    const existe = await prisma.articuloStock.findUnique({
      where: { codigoInterno: codigoInternoFinal }
    });

    if (existe) {
      return res.status(400).json({ success: false, error: 'El código de artículo ya existe' });
    }

    const articulo = await prisma.articuloStock.create({
      data: {
        codigoInterno: codigoInternoFinal,
        nombre,
        categoria: categoria || 'general',
        unidadMedida: unidadMedidaFinal,
        stockActual: stockActualFinal,
        stockMinimo: stockMinimoFinal,
        stockMaximo: stockMaximoFinal,
        empresaId: empresaIdFinal,
        puntoVentaId: puntoVentaIdFinal,
        proveedorId: proveedorIdFinal ? parseInt(proveedorIdFinal) : null,
        precioUltimaCompra: precioUltimaCompraFinal || null,
        ubicacionAlmacen: ubicacionAlmacenFinal || null,
        alertaStockBajo: stockActualFinal <= stockMinimoFinal
      },
      include: {
        proveedor: true
      }
    });

    console.log('✅ Artículo creado:', articulo.id);
    res.status(201).json({ success: true, data: articulo });
  } catch (error) {
    console.error('Error al crear artículo:', error);
    res.status(500).json({ success: false, error: 'Error al crear artículo' });
  }
};

export const actualizarArticuloStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      categoria,
      unidadMedida,
      stockMinimo,
      stockMaximo,
      precioUltimaCompra,
      ubicacionAlmacen,
      proveedorId
    } = req.body;

    const articulo = await prisma.articuloStock.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre && { nombre }),
        ...(categoria && { categoria }),
        ...(unidadMedida && { unidadMedida }),
        ...(stockMinimo !== undefined && { stockMinimo }),
        ...(stockMaximo !== undefined && { stockMaximo }),
        ...(precioUltimaCompra !== undefined && { precioUltimaCompra }),
        ...(ubicacionAlmacen && { ubicacionAlmacen }),
        ...(proveedorId && { proveedorId: parseInt(proveedorId) })
      },
      include: { proveedor: true }
    });

    res.json({ success: true, data: articulo });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar artículo' });
  }
};

export const eliminarArticuloStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.articuloStock.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Artículo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar artículo' });
  }
};

// ============================================
// AJUSTE DE STOCK
// ============================================

export const ajustarStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo, cantidad, motivo, observaciones, usuario_id, usuarioNombre } = req.body;

    const articuloId = parseInt(id, 10);
    const qty = typeof cantidad === 'string' ? Number(cantidad) : cantidad;

    if (!tipo || !qty) {
      return res.status(400).json({ success: false, error: 'Faltan datos del ajuste' });
    }
    if (!Number.isFinite(articuloId) || articuloId <= 0) {
      return res.status(400).json({ success: false, error: 'ID inválido' });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'Cantidad inválida' });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Obtener artículo actual
      const articulo = await tx.articuloStock.findUnique({
        where: { id: articuloId },
      });

      if (!articulo) {
        return { kind: 'not_found' as const };
      }

      // Calcular nuevo stock
      let nuevoStock = articulo.stockActual;
      if (tipo === 'entrada') {
        nuevoStock += qty;
      } else if (tipo === 'salida') {
        nuevoStock -= qty;
        if (nuevoStock < 0) {
          return { kind: 'insufficient' as const };
        }
      } else if (tipo === 'ajuste' || tipo === 'merma') {
        nuevoStock = qty;
      }

      const articuloActualizado = await tx.articuloStock.update({
        where: { id: articuloId },
        data: {
          stockActual: nuevoStock,
          alertaStockBajo: nuevoStock <= articulo.stockMinimo,
          modificadoEn: new Date(),
        },
      });

      const movimiento = await tx.movimientoStock.create({
        data: {
          articuloId,
          tipo,
          cantidad: qty,
          stockAnterior: articulo.stockActual,
          stockPosterior: nuevoStock,
          motivo: motivo || tipo,
          observaciones,
          usuarioId: usuario_id ? parseInt(usuario_id, 10) : null,
          usuarioNombre: usuarioNombre || 'Sistema',
        },
      });

      return { kind: 'ok' as const, articulo: articuloActualizado, movimiento };
    });

    if (result.kind === 'not_found') {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }
    if (result.kind === 'insufficient') {
      return res.status(400).json({ success: false, error: 'Stock insuficiente' });
    }

    res.json({ success: true, data: { articulo: result.articulo, movimiento: result.movimiento } });
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({ success: false, error: 'Error al ajustar stock' });
  }
};

// ============================================
// MOVIMIENTOS DE STOCK
// ============================================

export const obtenerMovimientosStock = async (req: Request, res: Response) => {
  try {
    const { articulo_id, tipo, fecha_inicio, fecha_fin, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    if (articulo_id) where.articuloId = parseInt(articulo_id as string);
    if (tipo) where.tipo = tipo;
    if (fecha_inicio || fecha_fin) {
      where.fecha = {};
      if (fecha_inicio) where.fecha.gte = new Date(fecha_inicio as string);
      if (fecha_fin) where.fecha.lte = new Date(fecha_fin as string);
    }

    const movimientos = await prisma.movimientoStock.findMany({
      where,
      include: { articulo: true },
      orderBy: { fecha: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.movimientoStock.count({ where });

    res.json({ success: true, data: movimientos, total });
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener movimientos' });
  }
};

// ============================================
// PROVEEDORES
// ============================================

export const obtenerProveedores = async (req: Request, res: Response) => {
  try {
    const { empresa_id, categoria, activo } = req.query;

    console.log('📥 obtenerProveedores - Parámetros:', { empresa_id, categoria, activo });

    const where: any = {};
    // IMPORTANTE: No filtrar por activo si no se especifica explícitamente
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }
    if (empresa_id) where.empresaId = empresa_id;
    if (categoria) where.categoria = categoria;

    console.log('🔍 Filtros donde:', JSON.stringify(where));

    const proveedores = await prisma.proveedor.findMany({
      where,
      include: {
        articulos: true,
        pedidos: { where: { estado: { in: ['pendiente', 'recibido'] } } }
      },
      orderBy: { nombre: 'asc' }
    });

    console.log('✅ Proveedores encontrados:', proveedores.length, 'IDs:', proveedores.map((p: any) => p.id));

    res.json({ success: true, data: proveedores });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ success: false, error: 'Error al obtener proveedores' });
  }
};

export const crearProveedor = async (req: Request, res: Response) => {
  try {
    console.log('📥 Crear proveedor - Body recibido:', req.body);
    
    const {
      nombre,
      cif,
      categoria,
      // Aceptar ambos formatos: camelCase y snake_case
      contactoNombre, contacto_nombre,
      contactoTelefono, contacto_telefono,
      contactoEmail, contacto_email,
      direccion,
      ciudad,
      codigoPostal, codigo_postal,
      pais,
      empresaId, empresa_id,
      diasEntrega, dias_entrega,
      formaPago, forma_pago,
      activo
    } = req.body;

    const empresaIdFinal = empresaId || empresa_id;
    
    if (!nombre || !empresaIdFinal) {
      return res.status(400).json({ success: false, error: 'Nombre y empresa son requeridos' });
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        nombre,
        cif: cif || null,
        categoria: categoria || 'general',
        contactoNombre: contactoNombre || contacto_nombre || null,
        contactoTelefono: contactoTelefono || contacto_telefono || null,
        contactoEmail: contactoEmail || contacto_email || null,
        direccion: direccion || null,
        ciudad: ciudad || null,
        codigoPostal: codigoPostal || codigo_postal || null,
        pais: pais || 'España',
        empresaId: empresaIdFinal,
        diasEntrega: diasEntrega || dias_entrega || null,
        formaPago: formaPago || forma_pago || null,
        activo: activo !== false
      }
    });

    console.log('✅ Proveedor creado:', proveedor.id);
    res.status(201).json({ success: true, data: proveedor });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ success: false, error: 'Error al crear proveedor' });
  }
};

export const actualizarProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const proveedor = await prisma.proveedor.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        modificadoEn: new Date()
      }
    });

    res.json({ success: true, data: proveedor });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar proveedor' });
  }
};

export const eliminarProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que no tenga artículos asociados
    const articulosAsociados = await prisma.articuloStock.count({
      where: { proveedorId: parseInt(id) }
    });

    if (articulosAsociados > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `No se puede eliminar. El proveedor tiene ${articulosAsociados} artículos asociados` 
      });
    }

    await prisma.proveedor.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    });

    res.json({ success: true, message: 'Proveedor desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar proveedor' });
  }
};

// ============================================
// PEDIDOS A PROVEEDORES
// ============================================

export const obtenerPedidosProveedor = async (req: Request, res: Response) => {
  try {
    const { proveedor_id, punto_venta_id, empresa_id, estado, fecha_inicio, fecha_fin } = req.query;

    const where: any = {};
    if (proveedor_id) where.proveedorId = parseInt(proveedor_id as string);
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    if (empresa_id) where.empresaId = empresa_id;
    if (estado) where.estado = estado;
    if (fecha_inicio || fecha_fin) {
      where.fechaPedido = {};
      if (fecha_inicio) where.fechaPedido.gte = new Date(fecha_inicio as string);
      if (fecha_fin) where.fechaPedido.lte = new Date(fecha_fin as string);
    }

    const pedidos = await prisma.pedidoProveedor.findMany({
      where,
      include: {
        proveedor: true,
        items: true
      },
      orderBy: { fechaPedido: 'desc' }
    });

    res.json({ success: true, data: pedidos });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener pedidos' });
  }
};

export const crearPedidoProveedor = async (req: Request, res: Response) => {
  try {
    console.log('📥 Crear pedido proveedor - Body recibido:', JSON.stringify(req.body, null, 2));
    
    const {
      // Aceptar ambos formatos: camelCase y snake_case
      proveedorId, proveedor_id,
      puntoVentaId, punto_venta_id,
      empresaId, empresa_id,
      fechaEntregaEstimada, fecha_entrega_estimada,
      observaciones,
      items,
      subtotal,
      iva,
      total
    } = req.body;

    const proveedorIdFinal = proveedorId || proveedor_id;
    const puntoVentaIdFinal = puntoVentaId || punto_venta_id;
    const empresaIdFinal = empresaId || empresa_id;
    const fechaEntregaFinal = fechaEntregaEstimada || fecha_entrega_estimada;

    console.log('🔍 IDs procesados:', { proveedorIdFinal, puntoVentaIdFinal, empresaIdFinal, itemsLength: items?.length });

    if (!proveedorIdFinal || !items || items.length === 0) {
      console.log('❌ Validación fallida - proveedorId:', proveedorIdFinal, 'items:', items?.length);
      return res.status(400).json({ success: false, error: 'Proveedor e items son requeridos' });
    }

    // Generar número de pedido
    const numero = `PED-${Date.now()}`;

    // Normalizar items para aceptar ambos formatos
    const itemsNormalizados = items.map((item: any) => ({
      articuloId: item.articuloId || item.articulo_id,
      nombreArticulo: item.nombreArticulo || item.nombre_articulo,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario || item.precio_unitario,
      total: item.total || item.cantidad * (item.precioUnitario || item.precio_unitario)
    }));

    console.log('📝 Items normalizados:', itemsNormalizados);

    const pedido = await prisma.pedidoProveedor.create({
      data: {
        numero,
        proveedorId: parseInt(proveedorIdFinal),
        puntoVentaId: puntoVentaIdFinal,
        empresaId: empresaIdFinal,
        estado: 'pendiente',
        fechaPedido: new Date(),
        fechaEntregaEstimada: fechaEntregaFinal ? new Date(fechaEntregaFinal) : null,
        observaciones,
        subtotal: subtotal || 0,
        iva: iva || 0,
        total: total || 0,
        items: {
          create: itemsNormalizados
        }
      },
      include: { proveedor: true, items: true }
    });

    console.log('✅ Pedido creado:', pedido.id, pedido.numero);
    res.status(201).json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ success: false, error: 'Error al crear pedido' });
  }
};

export const actualizarPedidoProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const pedido = await prisma.pedidoProveedor.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        modificadoEn: new Date()
      },
      include: { proveedor: true, items: true }
    });

    res.json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar pedido' });
  }
};

export const eliminarPedidoProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Eliminar items primero
    await prisma.itemPedidoProveedor.deleteMany({
      where: { pedidoProveedorId: parseInt(id) }
    });

    // Luego eliminar el pedido
    await prisma.pedidoProveedor.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar pedido' });
  }
};

export const recibirPedidoProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items, observaciones } = req.body;

    // Actualizar pedido como recibido
    const pedido = await prisma.pedidoProveedor.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'recibido',
        fechaRecepcion: new Date(),
        observaciones: observaciones || undefined,
        modificadoEn: new Date()
      },
      include: { proveedor: true, items: true }
    });

    // Actualizar stock para cada item
    if (items && items.length > 0) {
      for (const item of items) {
        const cantidadRecibida = item.cantidadRecibida || item.cantidad;
        
        // Obtener artículo actual
        const articulo = await prisma.articuloStock.findUnique({
          where: { id: item.articuloId || item.itemId }
        });

        if (articulo) {
          const nuevoStock = articulo.stockActual + cantidadRecibida;

          // Actualizar artículo
          await prisma.articuloStock.update({
            where: { id: articulo.id },
            data: {
              stockActual: nuevoStock,
              alertaStockBajo: nuevoStock <= articulo.stockMinimo,
              fechaUltimaCompra: new Date()
            }
          });

          // Crear movimiento
          await prisma.movimientoStock.create({
            data: {
              articuloId: articulo.id,
              tipo: 'entrada',
              cantidad: cantidadRecibida,
              stockAnterior: articulo.stockActual,
              stockPosterior: nuevoStock,
              motivo: `Recepción pedido ${pedido.numero}`,
              pedidoProveedorId: parseInt(id),
              usuarioNombre: 'Sistema'
            }
          });
        }
      }
    }

    res.json({ success: true, data: pedido, message: 'Pedido recibido y stock actualizado' });
  } catch (error) {
    console.error('Error al recibir pedido:', error);
    res.status(500).json({ success: false, error: 'Error al recibir pedido' });
  }
};

// ============================================
// ALERTAS
// ============================================

export const obtenerAlertasStock = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id } = req.query;

    const where: any = { alertaStockBajo: true };
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;

    const alertas = await prisma.articuloStock.findMany({
      where,
      include: { proveedor: true },
      orderBy: { stockActual: 'asc' }
    });

    res.json({ success: true, data: alertas });
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ success: false, error: 'Error al obtener alertas' });
  }
};

// ============================================
// SESIONES DE INVENTARIO
// ============================================

export const obtenerSesionesInventario = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id, estado } = req.query;
    console.log('📥 obtenerSesionesInventario - Parámetros:', { empresa_id, punto_venta_id, estado });

    const where: any = {};
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    if (estado) where.estado = estado;

    const sesiones = await prisma.sesionInventario.findMany({
      where,
      include: { lineas: true },
      orderBy: { creadoEn: 'desc' }
    });

    console.log('✅ Sesiones encontradas:', sesiones.length);
    res.json({ success: true, data: sesiones });
  } catch (error) {
    console.error('Error al obtener sesiones de inventario:', error);
    res.status(500).json({ success: false, error: 'Error al obtener sesiones de inventario' });
  }
};

export const crearSesionInventario = async (req: Request, res: Response) => {
  try {
    console.log('📥 Crear sesión inventario - Body:', req.body);
    
    const {
      nombre,
      tipo, type,
      almacen, warehouse,
      empresaId, empresa_id,
      puntoVentaId, punto_venta_id,
      responsables,
      fechaLimite, fecha_limite,
      observaciones
    } = req.body;

    const nombreFinal = nombre || 'Sesión de Inventario';
    const tipoFinal = tipo || type || 'ciclico';
    const almacenFinal = almacen || warehouse || 'PDV';
    const empresaIdFinal = empresaId || empresa_id;
    const puntoVentaIdFinal = puntoVentaId || punto_venta_id;
    const fechaLimiteFinal = fechaLimite || fecha_limite;

    if (!empresaIdFinal || !puntoVentaIdFinal) {
      return res.status(400).json({ success: false, error: 'Empresa y punto de venta son requeridos' });
    }

    const numero = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const sesion = await prisma.sesionInventario.create({
      data: {
        numero,
        nombre: nombreFinal,
        tipo: tipoFinal,
        almacen: almacenFinal,
        empresaId: empresaIdFinal,
        puntoVentaId: puntoVentaIdFinal,
        responsables: Array.isArray(responsables) ? responsables.join(',') : responsables || null,
        fechaLimite: fechaLimiteFinal ? new Date(fechaLimiteFinal) : null,
        observaciones: observaciones || null,
        estado: 'activa',
        progreso: 0
      },
      include: { lineas: true }
    });

    console.log('✅ Sesión creada:', sesion.id, sesion.numero);
    res.status(201).json({ success: true, data: sesion });
  } catch (error) {
    console.error('Error al crear sesión de inventario:', error);
    res.status(500).json({ success: false, error: 'Error al crear sesión de inventario' });
  }
};

export const actualizarSesionInventario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log('📥 Actualizar sesión inventario:', id, data);

    const sesion = await prisma.sesionInventario.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.almacen && { almacen: data.almacen }),
        ...(data.estado && { estado: data.estado }),
        ...(data.progreso !== undefined && { progreso: data.progreso }),
        ...(data.diferenciasUnidades !== undefined && { diferenciasUnidades: data.diferenciasUnidades }),
        ...(data.diferenciasValor !== undefined && { diferenciasValor: data.diferenciasValor }),
        ...(data.observaciones && { observaciones: data.observaciones }),
        ...(data.fechaFinalizacion && { fechaFinalizacion: new Date(data.fechaFinalizacion) }),
        modificadoEn: new Date()
      },
      include: { lineas: true }
    });

    console.log('✅ Sesión actualizada:', sesion.id);
    res.json({ success: true, data: sesion });
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar sesión' });
  }
};

export const eliminarSesionInventario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('📥 Eliminar sesión inventario:', id);

    await prisma.sesionInventario.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Sesión eliminada:', id);
    res.json({ success: true, message: 'Sesión eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar sesión' });
  }
};

export const agregarLineaInventario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { articuloId, codigoArticulo, nombreArticulo, stockTeorico, stockContado } = req.body;
    console.log('📥 Agregar línea a sesión:', id, req.body);
    const sesionId = parseInt(id, 10);
    const result = await prisma.$transaction(async (tx: any) => {
      const linea = await tx.lineaInventario.create({
        data: {
          sesionInventarioId: sesionId,
          articuloId: articuloId || 0,
          codigoArticulo: codigoArticulo || '',
          nombreArticulo: nombreArticulo || '',
          stockTeorico: stockTeorico || 0,
          stockContado: stockContado ?? null,
          diferencia: stockContado !== undefined ? stockContado - (stockTeorico || 0) : null,
        },
      });

      // Actualizar progreso de la sesión
      const sesion = await tx.sesionInventario.findUnique({
        where: { id: sesionId },
        include: { lineas: true },
      });

      if (sesion) {
        const lineasContadas = sesion.lineas.filter((l: any) => l.stockContado !== null).length;
        const totalLineas = sesion.lineas.length;
        const progreso = totalLineas > 0 ? (lineasContadas / totalLineas) * 100 : 0;

        await tx.sesionInventario.update({
          where: { id: sesionId },
          data: { progreso },
        });
      }

      return linea;
    });

    console.log('✅ Línea agregada:', result.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error al agregar línea:', error);
    res.status(500).json({ success: false, error: 'Error al agregar línea de inventario' });
  }
};

export const actualizarLineaInventario = async (req: Request, res: Response) => {
  try {
    const { id, lineaId } = req.params;
    const { stockContado, observaciones, contadoPor } = req.body;
    console.log('📥 Actualizar línea inventario:', lineaId, req.body);
    const sesionId = parseInt(id, 10);
    const lineaIdNum = parseInt(lineaId, 10);

    const result = await prisma.$transaction(async (tx: any) => {
      const lineaActual = await tx.lineaInventario.findUnique({
        where: { id: lineaIdNum },
      });

      if (!lineaActual) {
        return { kind: 'not_found' as const };
      }

      const diferencia =
        stockContado !== undefined ? stockContado - lineaActual.stockTeorico : lineaActual.diferencia;

      const linea = await tx.lineaInventario.update({
        where: { id: lineaIdNum },
        data: {
          stockContado: stockContado !== undefined ? stockContado : lineaActual.stockContado,
          diferencia,
          observaciones: observaciones || lineaActual.observaciones,
          contadoPor: contadoPor || lineaActual.contadoPor,
          fechaConteo: stockContado !== undefined ? new Date() : lineaActual.fechaConteo,
          modificadoEn: new Date(),
        },
      });

      // Actualizar totales de la sesión
      const sesion = await tx.sesionInventario.findUnique({
        where: { id: sesionId },
        include: { lineas: true },
      });

      if (sesion) {
        const lineasContadas = sesion.lineas.filter((l: any) => l.stockContado !== null).length;
        const totalLineas = sesion.lineas.length;
        const progreso = totalLineas > 0 ? (lineasContadas / totalLineas) * 100 : 0;
        const diferenciasUnidades = sesion.lineas.reduce(
          (acc: number, l: any) => acc + (l.diferencia || 0),
          0,
        );
        const diferenciasValor = sesion.lineas.reduce(
          (acc: number, l: any) => acc + (l.valorDiferencia || 0),
          0,
        );

        await tx.sesionInventario.update({
          where: { id: sesionId },
          data: { progreso, diferenciasUnidades, diferenciasValor },
        });
      }

      return { kind: 'ok' as const, linea };
    });

    if (result.kind === 'not_found') {
      return res.status(404).json({ success: false, error: 'Línea no encontrada' });
    }

    console.log('✅ Línea actualizada:', result.linea.id);
    res.json({ success: true, data: result.linea });
  } catch (error) {
    console.error('Error al actualizar línea:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar línea' });
  }
};
