/**
 * CONTROLLER: Stock Extendido
 * Almacenes, transferencias, mermas y gestión avanzada de inventario
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// ALMACENES
// ============================================
export const obtenerAlmacenes = async (req: Request, res: Response) => {
  try {
    const { empresaId, puntoVentaId } = req.query;

    // Simular almacenes - en producción vendría de tabla Almacen
    const almacenes = [
      {
        id: 1,
        nombre: 'Almacén Principal',
        tipo: 'principal',
        ubicacion: 'Planta baja',
        puntoVentaId: puntoVentaId ? Number(puntoVentaId) : 1,
        empresaId: empresaId ? Number(empresaId) : 1,
        capacidad: 1000,
        ocupacion: 650,
        activo: true,
        ultimoInventario: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        nombre: 'Cámara Frigorífica',
        tipo: 'frigorifico',
        ubicacion: 'Sótano',
        puntoVentaId: puntoVentaId ? Number(puntoVentaId) : 1,
        empresaId: empresaId ? Number(empresaId) : 1,
        capacidad: 300,
        ocupacion: 180,
        activo: true,
        ultimoInventario: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        nombre: 'Almacén Secundario',
        tipo: 'secundario',
        ubicacion: 'Primera planta',
        puntoVentaId: puntoVentaId ? Number(puntoVentaId) : 1,
        empresaId: empresaId ? Number(empresaId) : 1,
        capacidad: 500,
        ocupacion: 200,
        activo: true,
        ultimoInventario: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      data: almacenes,
      total: almacenes.length,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo almacenes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crearAlmacen = async (req: Request, res: Response) => {
  try {
    const { nombre, tipo, ubicacion, capacidad, puntoVentaId, empresaId } = req.body;

    const nuevoAlmacen = {
      id: Date.now(),
      nombre,
      tipo: tipo || 'secundario',
      ubicacion,
      capacidad: capacidad || 500,
      ocupacion: 0,
      puntoVentaId,
      empresaId,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: nuevoAlmacen,
      message: 'Almacén creado correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error creando almacén:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const actualizarAlmacen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const almacenActualizado = {
      id: Number(id),
      ...datos,
      actualizadoEn: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: almacenActualizado,
      message: 'Almacén actualizado correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error actualizando almacén:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const eliminarAlmacen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: `Almacén ${id} eliminado correctamente`,
    });
  } catch (error: any) {
    console.error('❌ Error eliminando almacén:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// TRANSFERENCIAS ENTRE ALMACENES
// ============================================
export const obtenerTransferencias = async (req: Request, res: Response) => {
  try {
    const { empresaId, estado, desde, hasta } = req.query;

    const transferencias = [
      {
        id: 1,
        origenId: 1,
        origenNombre: 'Almacén Principal',
        destinoId: 2,
        destinoNombre: 'Cámara Frigorífica',
        estado: 'completada',
        articulos: [
          { id: 1, nombre: 'Producto A', cantidad: 10, unidad: 'ud' },
          { id: 2, nombre: 'Producto B', cantidad: 5, unidad: 'kg' },
        ],
        solicitadoPor: 'María García',
        aprobadoPor: 'Pedro López',
        fechaSolicitud: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fechaEjecucion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notas: 'Transferencia rutinaria',
      },
      {
        id: 2,
        origenId: 3,
        origenNombre: 'Almacén Secundario',
        destinoId: 1,
        destinoNombre: 'Almacén Principal',
        estado: 'pendiente',
        articulos: [
          { id: 3, nombre: 'Producto C', cantidad: 20, unidad: 'ud' },
        ],
        solicitadoPor: 'Juan Martín',
        aprobadoPor: null,
        fechaSolicitud: new Date().toISOString(),
        fechaEjecucion: null,
        notas: 'Urgente - falta stock',
      },
    ];

    const filtradas = estado 
      ? transferencias.filter(t => t.estado === estado)
      : transferencias;

    res.json({
      success: true,
      data: filtradas,
      total: filtradas.length,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo transferencias:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const crearTransferencia = async (req: Request, res: Response) => {
  try {
    const { origenId, destinoId, articulos, notas, urgente } = req.body;

    const nuevaTransferencia = {
      id: Date.now(),
      origenId,
      destinoId,
      estado: 'pendiente',
      articulos,
      notas,
      urgente: urgente || false,
      solicitadoPor: 'Usuario actual', // Se obtendría del token
      fechaSolicitud: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: nuevaTransferencia,
      message: 'Transferencia creada correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error creando transferencia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const aprobarTransferencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        id: Number(id),
        estado: 'aprobada',
        aprobadoPor: 'Gerente',
        fechaAprobacion: new Date().toISOString(),
      },
      message: 'Transferencia aprobada',
    });
  } catch (error: any) {
    console.error('❌ Error aprobando transferencia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const ejecutarTransferencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      data: {
        id: Number(id),
        estado: 'completada',
        ejecutadoPor: 'Almacenero',
        fechaEjecucion: new Date().toISOString(),
      },
      message: 'Transferencia ejecutada correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error ejecutando transferencia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const cancelarTransferencia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    res.json({
      success: true,
      data: {
        id: Number(id),
        estado: 'cancelada',
        motivoCancelacion: motivo,
        canceladoPor: 'Usuario',
        fechaCancelacion: new Date().toISOString(),
      },
      message: 'Transferencia cancelada',
    });
  } catch (error: any) {
    console.error('❌ Error cancelando transferencia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// MERMAS Y PÉRDIDAS
// ============================================
export const obtenerMermas = async (req: Request, res: Response) => {
  try {
    const { empresaId, desde, hasta, tipo } = req.query;

    const mermas = [
      {
        id: 1,
        articuloId: 1,
        articuloNombre: 'Tomates',
        cantidad: 5,
        unidad: 'kg',
        tipo: 'caducidad',
        valorPerdido: 15.50,
        almacenId: 2,
        almacenNombre: 'Cámara Frigorífica',
        registradoPor: 'Juan Pérez',
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notas: 'Producto caducado',
      },
      {
        id: 2,
        articuloId: 3,
        articuloNombre: 'Vasos desechables',
        cantidad: 50,
        unidad: 'ud',
        tipo: 'rotura',
        valorPerdido: 8.00,
        almacenId: 1,
        almacenNombre: 'Almacén Principal',
        registradoPor: 'María García',
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notas: 'Caja dañada en recepción',
      },
      {
        id: 3,
        articuloId: 5,
        articuloNombre: 'Aceite de oliva',
        cantidad: 2,
        unidad: 'L',
        tipo: 'derrame',
        valorPerdido: 24.00,
        almacenId: 1,
        almacenNombre: 'Almacén Principal',
        registradoPor: 'Pedro López',
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notas: 'Derrame accidental',
      },
    ];

    const filtradas = tipo
      ? mermas.filter(m => m.tipo === tipo)
      : mermas;

    res.json({
      success: true,
      data: filtradas,
      total: filtradas.length,
      resumen: {
        totalMermas: filtradas.length,
        valorTotalPerdido: filtradas.reduce((sum, m) => sum + m.valorPerdido, 0),
        porTipo: {
          caducidad: filtradas.filter(m => m.tipo === 'caducidad').length,
          rotura: filtradas.filter(m => m.tipo === 'rotura').length,
          derrame: filtradas.filter(m => m.tipo === 'derrame').length,
          hurto: filtradas.filter(m => m.tipo === 'hurto').length,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo mermas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const registrarMerma = async (req: Request, res: Response) => {
  try {
    const { articuloId, cantidad, tipo, notas, almacenId } = req.body;

    const nuevaMerma = {
      id: Date.now(),
      articuloId,
      cantidad,
      tipo,
      notas,
      almacenId,
      registradoPor: 'Usuario actual',
      fecha: new Date().toISOString(),
      valorPerdido: cantidad * 10, // Calcular con precio real
    };

    res.status(201).json({
      success: true,
      data: nuevaMerma,
      message: 'Merma registrada correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error registrando merma:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// ENTRADAS Y SALIDAS DE STOCK
// ============================================
export const registrarEntrada = async (req: Request, res: Response) => {
  try {
    const { articuloId, cantidad, almacenId, proveedorId, lote, fechaCaducidad, notas } = req.body;

    const entrada = {
      id: Date.now(),
      tipo: 'entrada',
      articuloId,
      cantidad,
      almacenId,
      proveedorId,
      lote,
      fechaCaducidad,
      notas,
      registradoPor: 'Usuario actual',
      fecha: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: entrada,
      message: 'Entrada de stock registrada',
    });
  } catch (error: any) {
    console.error('❌ Error registrando entrada:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const registrarSalida = async (req: Request, res: Response) => {
  try {
    const { articuloId, cantidad, almacenId, motivo, notas } = req.body;

    const salida = {
      id: Date.now(),
      tipo: 'salida',
      articuloId,
      cantidad,
      almacenId,
      motivo,
      notas,
      registradoPor: 'Usuario actual',
      fecha: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: salida,
      message: 'Salida de stock registrada',
    });
  } catch (error: any) {
    console.error('❌ Error registrando salida:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// ESTADÍSTICAS DE STOCK
// ============================================
export const obtenerEstadisticasStock = async (req: Request, res: Response) => {
  try {
    const { empresaId, almacenId, periodo } = req.query;

    res.json({
      success: true,
      data: {
        valorTotalStock: 45000,
        articulosTotales: 250,
        articulosBajoMinimo: 12,
        articulosSobreMaximo: 5,
        rotacionPromedio: 4.2,
        diasStockPromedio: 15,
        mermasMes: 350,
        entradasMes: 120,
        salidasMes: 115,
        precision: 98.5,
        proximosCaducar: 8,
        tendencia: {
          valorAnterior: 43000,
          variacion: 4.65,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas stock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
