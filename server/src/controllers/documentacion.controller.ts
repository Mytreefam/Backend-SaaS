/**
 * 📄 CONTROLADOR DE DOCUMENTACIÓN Y GASTOS
 * 
 * Gestiona:
 * - Documentos empresariales (sociedad, vehículos, contratos, licencias, fiscalidad)
 * - Gastos empresariales
 * - Calendario de pagos
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// DOCUMENTOS EMPRESARIALES
// ============================================================================

/**
 * Obtener documentos con filtros
 */
export async function obtenerDocumentos(req: Request, res: Response) {
  try {
    const { 
      empresa_id, 
      punto_venta_id, 
      categoria,
      estado,
      busqueda
    } = req.query;
    
    console.log('📥 obtenerDocumentos - Parámetros:', {
      empresa_id,
      punto_venta_id,
      categoria,
      estado,
      busqueda
    });
    
    const where: any = {};
    
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda as string, mode: 'insensitive' } },
        { codigo: { contains: busqueda as string, mode: 'insensitive' } },
        { descripcion: { contains: busqueda as string, mode: 'insensitive' } },
      ];
    }
    
    const documentos = await prisma.documentoEmpresa.findMany({
      where,
      include: {
        subidoPor: {
          select: {
            id: true,
            nombre: true,
          }
        }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { creadoEn: 'desc' }
      ]
    });
    
    console.log('✅ Documentos encontrados:', documentos.length);
    
    res.json({ success: true, data: documentos });
  } catch (error: any) {
    console.error('❌ Error obteniendo documentos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Crear nuevo documento
 */
export async function crearDocumento(req: Request, res: Response) {
  try {
    const data = req.body;
    
    console.log('📥 crearDocumento - Body recibido:', JSON.stringify(data, null, 2));
    
    // Normalizar campos
    const empresaId = data.empresa_id || data.empresaId;
    const puntoVentaId = data.punto_venta_id || data.puntoVentaId;
    const categoria = data.categoria;
    const tipo = data.tipo || 'General';
    const nombre = data.nombre;
    const descripcion = data.descripcion;
    const archivoUrl = data.archivo_url || data.archivoUrl;
    const archivoNombre = data.archivo_nombre || data.archivoNombre;
    const tamanoArchivo = data.tamano_archivo || data.tamanoArchivo;
    const mimeType = data.mime_type || data.mimeType;
    const fechaVencimiento = data.fecha_vencimiento || data.fechaVencimiento;
    const fechaEmision = data.fecha_emision || data.fechaEmision;
    const costeAsociado = data.coste_asociado || data.costeAsociado;
    const categoriaEBITDA = data.categoria_ebitda || data.categoriaEBITDA;
    const responsable = data.responsable;
    const subidoPorId = data.subido_por_id || data.subidoPorId;
    const observaciones = data.observaciones;
    const etiquetas = data.etiquetas;
    
    // Validaciones
    if (!nombre) {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }
    if (!empresaId) {
      return res.status(400).json({ success: false, error: 'empresa_id es requerido' });
    }
    if (!categoria) {
      return res.status(400).json({ success: false, error: 'categoria es requerida' });
    }
    
    // Generar código único
    const ultimoDocumento = await prisma.documentoEmpresa.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextId = ultimoDocumento ? ultimoDocumento.id + 1 : 1;
    const codigo = `DOC-${String(nextId).padStart(3, '0')}`;
    
    // Determinar estado basado en vencimiento
    let estado = 'vigente';
    if (fechaVencimiento) {
      const fechaVenc = new Date(fechaVencimiento);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes < 0) {
        estado = 'caducado';
      } else if (diasRestantes <= 30) {
        estado = 'proximo_vencer';
      }
    }
    
    const documento = await prisma.documentoEmpresa.create({
      data: {
        codigo,
        empresaId,
        puntoVentaId,
        categoria,
        tipo,
        nombre,
        descripcion,
        archivoUrl,
        archivoNombre,
        tamanoArchivo: tamanoArchivo ? parseInt(tamanoArchivo) : null,
        mimeType,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        fechaEmision: fechaEmision ? new Date(fechaEmision) : null,
        estado,
        costeAsociado: costeAsociado ? parseFloat(costeAsociado) : null,
        categoriaEBITDA,
        responsable,
        subidoPorId: subidoPorId ? parseInt(subidoPorId) : null,
        observaciones,
        etiquetas: etiquetas ? JSON.stringify(etiquetas) : null,
      },
      include: {
        subidoPor: true
      }
    });
    
    console.log('✅ Documento creado:', documento.codigo);
    
    res.status(201).json({ success: true, data: documento });
  } catch (error: any) {
    console.error('❌ Error creando documento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Actualizar documento
 */
export async function actualizarDocumento(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log('📥 actualizarDocumento - ID:', id, 'Body:', data);
    
    const updateData: any = {};
    
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.responsable !== undefined) updateData.responsable = data.responsable;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    
    const fechaVencimiento = data.fecha_vencimiento || data.fechaVencimiento;
    if (fechaVencimiento !== undefined) {
      updateData.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento) : null;
    }
    
    const costeAsociado = data.coste_asociado || data.costeAsociado;
    if (costeAsociado !== undefined) {
      updateData.costeAsociado = costeAsociado ? parseFloat(costeAsociado) : null;
    }
    
    const documento = await prisma.documentoEmpresa.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subidoPor: true
      }
    });
    
    console.log('✅ Documento actualizado:', documento.codigo);
    
    res.json({ success: true, data: documento });
  } catch (error: any) {
    console.error('❌ Error actualizando documento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Eliminar documento
 */
export async function eliminarDocumento(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    console.log('📥 eliminarDocumento - ID:', id);
    
    await prisma.documentoEmpresa.delete({
      where: { id: parseInt(id) }
    });
    
    console.log('✅ Documento eliminado');
    
    res.json({ success: true, message: 'Documento eliminado correctamente' });
  } catch (error: any) {
    console.error('❌ Error eliminando documento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Obtener estadísticas de documentos
 */
export async function obtenerEstadisticasDocumentos(req: Request, res: Response) {
  try {
    const { empresa_id } = req.query;
    
    const where: any = {};
    if (empresa_id) where.empresaId = empresa_id;
    
    const [total, vigentes, proximosVencer, caducados, archivados] = await Promise.all([
      prisma.documentoEmpresa.count({ where }),
      prisma.documentoEmpresa.count({ where: { ...where, estado: 'vigente' } }),
      prisma.documentoEmpresa.count({ where: { ...where, estado: 'proximo_vencer' } }),
      prisma.documentoEmpresa.count({ where: { ...where, estado: 'caducado' } }),
      prisma.documentoEmpresa.count({ where: { ...where, estado: 'archivado' } }),
    ]);
    
    // Por categoría
    const porCategoria = await prisma.documentoEmpresa.groupBy({
      by: ['categoria'],
      where,
      _count: { id: true }
    });
    
    const stats = {
      total,
      vigentes,
      proximosVencer,
      caducados,
      archivados,
      porCategoria: porCategoria.reduce((acc, item) => {
        acc[item.categoria] = item._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
    
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ============================================================================
// GASTOS EMPRESARIALES
// ============================================================================

/**
 * Obtener gastos con filtros
 */
export async function obtenerGastos(req: Request, res: Response) {
  try {
    const { 
      empresa_id, 
      punto_venta_id, 
      categoria,
      fecha_desde,
      fecha_hasta,
      estado_pago
    } = req.query;
    
    console.log('📥 obtenerGastos - Parámetros:', req.query);
    
    const where: any = {};
    
    if (empresa_id) where.empresaId = empresa_id;
    if (punto_venta_id) where.puntoVentaId = punto_venta_id;
    if (categoria) where.categoria = categoria;
    if (estado_pago) where.estadoPago = estado_pago;
    
    if (fecha_desde || fecha_hasta) {
      where.fechaGasto = {};
      if (fecha_desde) where.fechaGasto.gte = new Date(fecha_desde as string);
      if (fecha_hasta) where.fechaGasto.lte = new Date(fecha_hasta as string);
    }
    
    const gastos = await prisma.gastoEmpresa.findMany({
      where,
      include: {
        pagoCalendario: true,
        registradoPor: {
          select: {
            id: true,
            nombre: true,
          }
        }
      },
      orderBy: { fechaGasto: 'desc' }
    });
    
    console.log('✅ Gastos encontrados:', gastos.length);
    
    res.json({ success: true, data: gastos });
  } catch (error: any) {
    console.error('❌ Error obteniendo gastos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Crear nuevo gasto
 */
export async function crearGasto(req: Request, res: Response) {
  try {
    const data = req.body;
    
    console.log('📥 crearGasto - Body recibido:', JSON.stringify(data, null, 2));
    
    // Normalizar campos
    const empresaId = data.empresa_id || data.empresaId;
    const puntoVentaId = data.punto_venta_id || data.puntoVentaId;
    const concepto = data.concepto;
    const proveedorNombre = data.proveedor_nombre || data.proveedorNombre;
    const nifProveedor = data.nif_proveedor || data.nifProveedor;
    const numeroFactura = data.numero_factura || data.numeroFactura;
    const importe = data.importe;
    const iva = data.iva;
    const total = data.total || importe;
    const categoria = data.categoria;
    const subtipo = data.subtipo;
    const centroCoste = data.centro_coste || data.centroCoste;
    const fechaGasto = data.fecha_gasto || data.fechaGasto;
    const metodoPago = data.metodo_pago || data.metodoPago;
    const ticketUrl = data.ticket_url || data.ticketUrl;
    const facturaUrl = data.factura_url || data.facturaUrl;
    const pagoCalendarioId = data.pago_calendario_id || data.pagoCalendarioId;
    const datosOCR = data.datos_ocr || data.datosOCR;
    const observaciones = data.observaciones;
    const registradoPorId = data.registrado_por_id || data.registradoPorId;
    
    // Validaciones
    if (!concepto) {
      return res.status(400).json({ success: false, error: 'El concepto es requerido' });
    }
    if (!empresaId) {
      return res.status(400).json({ success: false, error: 'empresa_id es requerido' });
    }
    if (!importe) {
      return res.status(400).json({ success: false, error: 'El importe es requerido' });
    }
    
    // Generar código único
    const ultimoGasto = await prisma.gastoEmpresa.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextId = ultimoGasto ? ultimoGasto.id + 1 : 1;
    const codigo = `GAS-${String(nextId).padStart(4, '0')}`;
    
    const gasto = await prisma.gastoEmpresa.create({
      data: {
        codigo,
        empresaId,
        puntoVentaId,
        concepto,
        proveedorNombre,
        nifProveedor,
        numeroFactura,
        importe: parseFloat(importe),
        iva: iva ? parseFloat(iva) : null,
        total: parseFloat(total),
        categoria: categoria || 'Otros',
        subtipo,
        centroCoste,
        fechaGasto: fechaGasto ? new Date(fechaGasto) : new Date(),
        metodoPago,
        estadoPago: 'pendiente',
        ticketUrl,
        facturaUrl,
        pagoCalendarioId: pagoCalendarioId ? parseInt(pagoCalendarioId) : null,
        datosOCR: datosOCR ? JSON.stringify(datosOCR) : null,
        observaciones,
        registradoPorId: registradoPorId ? parseInt(registradoPorId) : null,
      },
      include: {
        pagoCalendario: true,
        registradoPor: true
      }
    });
    
    console.log('✅ Gasto creado:', gasto.codigo);
    
    res.status(201).json({ success: true, data: gasto });
  } catch (error: any) {
    console.error('❌ Error creando gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Actualizar gasto
 */
export async function actualizarGasto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log('📥 actualizarGasto - ID:', id, 'Body:', data);
    
    const updateData: any = {};
    
    if (data.concepto !== undefined) updateData.concepto = data.concepto;
    if (data.proveedorNombre !== undefined) updateData.proveedorNombre = data.proveedorNombre;
    if (data.importe !== undefined) updateData.importe = parseFloat(data.importe);
    if (data.total !== undefined) updateData.total = parseFloat(data.total);
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.estadoPago !== undefined) updateData.estadoPago = data.estadoPago;
    if (data.metodoPago !== undefined) updateData.metodoPago = data.metodoPago;
    if (data.contabilizado !== undefined) updateData.contabilizado = data.contabilizado;
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    
    if (data.fechaPago !== undefined) {
      updateData.fechaPago = data.fechaPago ? new Date(data.fechaPago) : null;
    }
    
    const gasto = await prisma.gastoEmpresa.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        pagoCalendario: true,
        registradoPor: true
      }
    });
    
    console.log('✅ Gasto actualizado:', gasto.codigo);
    
    res.json({ success: true, data: gasto });
  } catch (error: any) {
    console.error('❌ Error actualizando gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Eliminar gasto
 */
export async function eliminarGasto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    await prisma.gastoEmpresa.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true, message: 'Gasto eliminado correctamente' });
  } catch (error: any) {
    console.error('❌ Error eliminando gasto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Obtener resumen de gastos
 */
export async function obtenerResumenGastos(req: Request, res: Response) {
  try {
    const { empresa_id, mes, anio } = req.query;
    
    const where: any = {};
    if (empresa_id) where.empresaId = empresa_id;
    
    // Filtrar por mes/año si se proporcionan
    if (mes && anio) {
      const inicioMes = new Date(parseInt(anio as string), parseInt(mes as string) - 1, 1);
      const finMes = new Date(parseInt(anio as string), parseInt(mes as string), 0);
      where.fechaGasto = {
        gte: inicioMes,
        lte: finMes
      };
    }
    
    const gastos = await prisma.gastoEmpresa.findMany({ where });
    
    const totalGastos = gastos.reduce((sum, g) => sum + g.total, 0);
    const gastosPendientes = gastos.filter(g => g.estadoPago === 'pendiente').reduce((sum, g) => sum + g.total, 0);
    const gastosPagados = gastos.filter(g => g.estadoPago === 'pagado').reduce((sum, g) => sum + g.total, 0);
    
    // Por categoría
    const porCategoria: Record<string, number> = {};
    gastos.forEach(g => {
      porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.total;
    });
    
    res.json({
      success: true,
      data: {
        totalGastos,
        gastosPendientes,
        gastosPagados,
        cantidadGastos: gastos.length,
        porCategoria
      }
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo resumen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// ============================================================================
// CALENDARIO DE PAGOS
// ============================================================================

/**
 * Obtener pagos del calendario
 */
export async function obtenerPagosCalendario(req: Request, res: Response) {
  try {
    const { 
      empresa_id, 
      mes,
      anio,
      estado_pago
    } = req.query;
    
    console.log('📥 obtenerPagosCalendario - Parámetros:', req.query);
    
    const where: any = {};
    
    if (empresa_id) where.empresaId = empresa_id;
    if (estado_pago) where.estadoPago = estado_pago;
    
    // Filtrar por mes/año si se proporcionan
    if (mes && anio) {
      const inicioMes = new Date(parseInt(anio as string), parseInt(mes as string) - 1, 1);
      const finMes = new Date(parseInt(anio as string), parseInt(mes as string), 0);
      where.fecha = {
        gte: inicioMes,
        lte: finMes
      };
    }
    
    const pagos = await prisma.pagoCalendario.findMany({
      where,
      include: {
        gastos: true
      },
      orderBy: { fecha: 'asc' }
    });
    
    console.log('✅ Pagos encontrados:', pagos.length);
    
    res.json({ success: true, data: pagos });
  } catch (error: any) {
    console.error('❌ Error obteniendo pagos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Crear pago en calendario
 */
export async function crearPagoCalendario(req: Request, res: Response) {
  try {
    const data = req.body;
    
    console.log('📥 crearPagoCalendario - Body:', data);
    
    const empresaId = data.empresa_id || data.empresaId;
    const puntoVentaId = data.punto_venta_id || data.puntoVentaId;
    const concepto = data.concepto;
    const descripcion = data.descripcion;
    const monto = data.monto;
    const categoria = data.categoria;
    const fecha = data.fecha;
    const fechaRecordatorio = data.fecha_recordatorio || data.fechaRecordatorio;
    const recurrente = data.recurrente ?? false;
    const frecuencia = data.frecuencia;
    const diaDelMes = data.dia_del_mes || data.diaDelMes;
    const metodoPago = data.metodo_pago || data.metodoPago;
    const observaciones = data.observaciones;
    
    if (!concepto) {
      return res.status(400).json({ success: false, error: 'El concepto es requerido' });
    }
    if (!empresaId) {
      return res.status(400).json({ success: false, error: 'empresa_id es requerido' });
    }
    if (!monto) {
      return res.status(400).json({ success: false, error: 'El monto es requerido' });
    }
    
    // Generar código único
    const ultimoPago = await prisma.pagoCalendario.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextId = ultimoPago ? ultimoPago.id + 1 : 1;
    const codigo = `PAG-${String(nextId).padStart(4, '0')}`;
    
    const pago = await prisma.pagoCalendario.create({
      data: {
        codigo,
        empresaId,
        puntoVentaId,
        concepto,
        descripcion,
        monto: parseFloat(monto),
        categoria: categoria || 'Otros',
        fecha: fecha ? new Date(fecha) : new Date(),
        fechaRecordatorio: fechaRecordatorio ? new Date(fechaRecordatorio) : null,
        estadoPago: 'pendiente',
        recurrente,
        frecuencia,
        diaDelMes: diaDelMes ? parseInt(diaDelMes) : null,
        metodoPago,
        observaciones,
      },
      include: {
        gastos: true
      }
    });
    
    console.log('✅ Pago creado:', pago.codigo);
    
    res.status(201).json({ success: true, data: pago });
  } catch (error: any) {
    console.error('❌ Error creando pago:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Actualizar pago del calendario
 */
export async function actualizarPagoCalendario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updateData: any = {};
    
    if (data.concepto !== undefined) updateData.concepto = data.concepto;
    if (data.monto !== undefined) updateData.monto = parseFloat(data.monto);
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.estadoPago !== undefined) updateData.estadoPago = data.estadoPago;
    if (data.fecha !== undefined) updateData.fecha = new Date(data.fecha);
    if (data.observaciones !== undefined) updateData.observaciones = data.observaciones;
    
    const pago = await prisma.pagoCalendario.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        gastos: true
      }
    });
    
    res.json({ success: true, data: pago });
  } catch (error: any) {
    console.error('❌ Error actualizando pago:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Eliminar pago del calendario
 */
export async function eliminarPagoCalendario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    await prisma.pagoCalendario.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true, message: 'Pago eliminado correctamente' });
  } catch (error: any) {
    console.error('❌ Error eliminando pago:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Marcar pago como pagado
 */
export async function marcarPagoPagado(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { metodo_pago, observaciones } = req.body;
    
    const pago = await prisma.pagoCalendario.update({
      where: { id: parseInt(id) },
      data: {
        estadoPago: 'pagado',
        metodoPago: metodo_pago,
        observaciones: observaciones || undefined,
      },
      include: {
        gastos: true
      }
    });
    
    console.log('✅ Pago marcado como pagado:', pago.codigo);
    
    res.json({ success: true, data: pago });
  } catch (error: any) {
    console.error('❌ Error marcando pago:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
