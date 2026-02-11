/**
 * CONTROLADOR: Facturación y Finanzas
 * Endpoints para gestión financiera, cierres de caja, pagos a proveedores
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

/**
 * @swagger
 * /api/gerente/finanzas/resumen:
 *   get:
 *     summary: Obtener resumen financiero del periodo
 *     tags: [Finanzas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: punto_venta_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resumen financiero
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_ingresos:
 *                   type: number
 *                 total_gastos:
 *                   type: number
 *                 margen_neto:
 *                   type: number
 *                 num_facturas:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 */
export const obtenerResumenFinanzas = async (req: Request, res: Response) => {
  try {
    const {
      empresa_id,
      punto_venta_id,
      fecha_inicio,
      fecha_fin
    } = req.query;

    const startDate = fecha_inicio ? new Date(fecha_inicio as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = fecha_fin ? new Date(fecha_fin as string) : new Date();

    const facturasAgg = await prisma.factura.aggregate({
      where: {
        fecha: { gte: startDate, lte: endDate },
      },
      _sum: { total: true },
      _count: { _all: true },
    });

    const totalIngresos = Number(facturasAgg._sum.total) || 0;
    const totalFacturas = facturasAgg._count._all || 0;

    // Gastos reales disponibles:
    // - Compras a proveedores: PedidoProveedor.total
    // - Gastos empresariales: GastoEmpresa.total
    // - Remuneraciones extra: EmpleadoRemuneracion.importe (no sustituye nómina completa)
    const proveedoresAgg = await prisma.pedidoProveedor.aggregate({
      where: {
        fechaPedido: { gte: startDate, lte: endDate },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
        estado: { notIn: ['cancelado'] },
      } as any,
      _sum: { total: true },
    });

    const otrosAgg = await prisma.gastoEmpresa.aggregate({
      where: {
        fechaGasto: { gte: startDate, lte: endDate },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });

    const personalExtraAgg = await prisma.empleadoRemuneracion.aggregate({
      where: {
        creadoEn: { gte: startDate, lte: endDate },
      },
      _sum: { importe: true },
    });

    const gastosProveedores = Number(proveedoresAgg._sum.total) || 0;
    const gastosOtros = Number(otrosAgg._sum.total) || 0;
    const gastosPersonal = Number(personalExtraAgg._sum.importe) || 0;

    const totalGastos = gastosProveedores + gastosOtros + gastosPersonal;
    const margenBruto = totalIngresos - totalGastos;
    const porcentajeMargen = totalIngresos > 0 ? (margenBruto / totalIngresos) * 100 : 0;

    res.json({
      periodo: {
        fecha_inicio: startDate,
        fecha_fin: endDate
      },
      ingresos: {
        total: parseFloat(totalIngresos.toFixed(2)),
        facturas: totalFacturas,
        ticket_medio: totalFacturas > 0 ? parseFloat((totalIngresos / totalFacturas).toFixed(2)) : 0
      },
      gastos: {
        total: parseFloat(totalGastos.toFixed(2)),
        proveedores: parseFloat(gastosProveedores.toFixed(2)),
        personal: parseFloat(gastosPersonal.toFixed(2)),
        otros: parseFloat(gastosOtros.toFixed(2)),
      },
      margen: {
        bruto: parseFloat(margenBruto.toFixed(2)),
        porcentaje: parseFloat(porcentajeMargen.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen finanzas:', error);
    res.status(500).json({ error: 'Error al obtener resumen finanzas' });
  }
};

/**
 * GET /api/gerente/finanzas/cuenta-resultados
 * Obtener cuenta de resultados completa (EBITDA)
 */
export const obtenerCuentaResultados = async (req: Request, res: Response) => {
  try {
    const {
      empresa_id,
      punto_venta_id,
      fecha_inicio,
      fecha_fin,
      modo_visualizacion = 'mes_completo'
    } = req.query;

    const startDate = fecha_inicio ? new Date(fecha_inicio as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = fecha_fin ? new Date(fecha_fin as string) : new Date();

    const safeNumber = (val: any, decimals = 2) => (Number.isFinite(val) ? parseFloat(Number(val).toFixed(decimals)) : 0);

    const classifyPedidoCanal = (tipoEntrega?: string | null): 'mostrador' | 'app_web' | 'terceros' | 'otros' => {
      const t = (tipoEntrega || '').toString().trim().toLowerCase();
      if (!t) return 'mostrador';
      if (t.includes('glovo') || t.includes('uber') || t.includes('just') || t.includes('deliveroo')) return 'terceros';
      if (t.includes('delivery') || t.includes('app') || t.includes('web') || t.includes('recogida')) return 'app_web';
      if (t.includes('local') || t.includes('mostrador') || t.includes('tienda')) return 'mostrador';
      return 'otros';
    };

    // =========================
    // INGRESOS (Pedidos)
    // =========================
    const pedidos = await prisma.pedido.findMany({
      where: {
        fecha: { gte: startDate, lte: endDate },
        estado: { notIn: ['cancelado'] },
      },
      select: { total: true, tipoEntrega: true },
    });

    const ingresos = { mostrador: 0, app_web: 0, terceros: 0, otros: 0 };
    pedidos.forEach((p: any) => {
      const canal = classifyPedidoCanal(p.tipoEntrega);
      ingresos[canal] += Number(p.total) || 0;
    });
    const totalIngresos = ingresos.mostrador + ingresos.app_web + ingresos.terceros + ingresos.otros;

    // =========================
    // COSTE DE VENTAS (Compras + mermas)
    // =========================
    const whereCompras: any = {
      pedidoProveedor: {
        fechaPedido: { gte: startDate, lte: endDate },
        estado: { notIn: ['cancelado'] },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      },
    };

    const itemsCompra = await prisma.itemPedidoProveedor.findMany({
      where: whereCompras,
      select: { articuloId: true, total: true },
    });

    const articuloIds = Array.from(new Set(itemsCompra.map((i) => i.articuloId)));
    const articulos = articuloIds.length
      ? await prisma.articuloStock.findMany({
          where: { id: { in: articuloIds } },
          select: { id: true, categoria: true },
        })
      : [];

    const categoriaByArticuloId = new Map<number, string>();
    articulos.forEach((a) => categoriaByArticuloId.set(a.id, a.categoria || ''));

    const coste = { materias: 0, bebidas: 0, envases: 0, consumos: 0 };
    itemsCompra.forEach((it) => {
      const total = Number(it.total) || 0;
      const cat = (categoriaByArticuloId.get(it.articuloId) || '').toLowerCase();
      if (cat.includes('bebida')) coste.bebidas += total;
      else if (cat.includes('envase') || cat.includes('embal') || cat.includes('pack')) coste.envases += total;
      else coste.materias += total;
    });

    const mermasMovs = await prisma.movimientoStock.findMany({
      where: {
        tipo: 'merma',
        fecha: { gte: startDate, lte: endDate },
      },
      include: { articulo: { select: { precioUltimaCompra: true } } },
    });

    const costeMermas = mermasMovs.reduce((sum: number, m: any) => {
      const qty = Math.abs(Number(m.cantidad) || 0);
      const unit = Number(m.articulo?.precioUltimaCompra) || 0;
      return sum + qty * unit;
    }, 0);

    const totalCosteVentas = coste.materias + coste.bebidas + coste.envases + coste.consumos + costeMermas;
    const margenBruto = totalIngresos - totalCosteVentas;

    // =========================
    // GASTOS OPERATIVOS / ESTRUCTURA
    // =========================
    const gastosEmpresa = await prisma.gastoEmpresa.findMany({
      where: {
        fechaGasto: { gte: startDate, lte: endDate },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      select: { total: true, categoria: true, subtipo: true },
    });

    const personalExtra = await prisma.empleadoRemuneracion.aggregate({
      where: { creadoEn: { gte: startDate, lte: endDate } },
      _sum: { importe: true },
    });
    const empleados = await prisma.empleado.findMany({
      where: {
        estado: 'activo',
        fechaAlta: { lte: endDate },
        OR: [{ fechaBaja: null }, { fechaBaja: { gte: startDate } }],
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      select: { salarioBase: true },
    });
    const salariosBase = empleados.reduce((sum, e) => sum + (Number(e.salarioBase) || 0), 0);

    const opex = {
      personal: salariosBase + (Number(personalExtra._sum.importe) || 0),
      alquiler: 0,
      suministros: 0,
      limpieza: 0,
      marketing: 0,
      transporte: 0,
      comisiones: 0,
    };
    const estruct = { amortizaciones: 0, seguros: 0, asesoria: 0, tecnologia: 0, otros: 0 };

    const norm = (s: any) => String(s || '').toLowerCase();
    gastosEmpresa.forEach((g) => {
      const cat = norm(g.categoria);
      const sub = norm(g.subtipo);
      const total = Number(g.total) || 0;

      if (cat.includes('personal')) opex.personal += total;
      else if (cat.includes('alquiler')) opex.alquiler += total;
      else if (cat.includes('sumin')) opex.suministros += total;
      else if (cat.includes('limpieza') || sub.includes('limpieza')) opex.limpieza += total;
      else if (cat.includes('marketing') || cat.includes('public')) opex.marketing += total;
      else if (cat.includes('transporte') || cat.includes('reparto')) opex.transporte += total;
      else if (cat.includes('comision') || sub.includes('tpv') || sub.includes('pasarela')) opex.comisiones += total;
      else if (cat.includes('amort')) estruct.amortizaciones += total;
      else if (cat.includes('seguro')) estruct.seguros += total;
      else if (cat.includes('asesor') || cat.includes('legal') || cat.includes('fiscal')) estruct.asesoria += total;
      else if (cat.includes('tecnolog') || cat.includes('software') || sub.includes('software')) estruct.tecnologia += total;
      else estruct.otros += total;
    });

    const objetivos = {
      ING_MOSTRADOR: 175000,
      ING_APP_WEB: 85000,
      ING_TERCEROS: 35000,
      ING_OTROS: 8000,
      CSV_MATERIAS: 75000,
      CSV_BEBIDAS: 20000,
      CSV_ENVASES: 10000,
      CSV_MERMAS: 12000,
      CSV_CONSUMOS: 8000,
      GOP_PERSONAL: 95000,
      GOP_ALQUILER: 18000,
      GOP_SUMINISTROS: 9000,
      GOP_LIMPIEZA: 5000,
      GOP_MARKETING: 5000,
      GOP_TRANSPORTE: 6000,
      GOP_COMISIONES: 5000,
      CES_AMORTIZACIONES: 8000,
      CES_SEGUROS: 3000,
      CES_ASESORIA: 2500,
      CES_TECNOLOGIA: 2000,
      CES_OTROS: 1500,
    } as const;

    const estadoFromCumplimiento = (pct: number) => (pct >= 100 ? 'up' : 'down');
    const mkLinea = (id: string, grupo: string, concepto: string, importe: number) => {
      const objetivo = (objetivos as any)[id] ?? 0;
      const cumplimiento = objetivo > 0 ? (importe / objetivo) * 100 : 0;
      return {
        id,
        grupo,
        concepto,
        tipo: 'detalle',
        objetivo_mes: objetivo,
        importe_real: safeNumber(importe),
        cumplimiento_pct: safeNumber(cumplimiento, 1),
        estado: estadoFromCumplimiento(cumplimiento),
      };
    };

    const lineas = [
      // INGRESOS NETOS
      mkLinea('ING_MOSTRADOR', 'INGRESOS_NETOS', 'Ingresos por ventas en mostrador', ingresos.mostrador),
      mkLinea('ING_APP_WEB', 'INGRESOS_NETOS', 'Ingresos App / Web', ingresos.app_web),
      mkLinea('ING_TERCEROS', 'INGRESOS_NETOS', 'Ingresos por terceros (apps de delivery)', ingresos.terceros),
      mkLinea('ING_OTROS', 'INGRESOS_NETOS', 'Otros ingresos (eventos, alquiler de sala, etc.)', ingresos.otros),

      // COSTE DE VENTAS
      mkLinea('CSV_MATERIAS', 'COSTE_VENTAS', 'Materias primas alimentación (pan, bollería, etc.)', coste.materias),
      mkLinea('CSV_BEBIDAS', 'COSTE_VENTAS', 'Bebidas y complementos', coste.bebidas),
      mkLinea('CSV_ENVASES', 'COSTE_VENTAS', 'Envases y embalajes', coste.envases),
      mkLinea('CSV_MERMAS', 'COSTE_VENTAS', 'Mermas y roturas', costeMermas),
      mkLinea('CSV_CONSUMOS', 'COSTE_VENTAS', 'Consumos internos (productos para personal, etc.)', coste.consumos),

      // GASTOS OPERATIVOS
      mkLinea('GOP_PERSONAL', 'GASTOS_OPERATIVOS', 'Personal (sueldos + Seguridad Social)', opex.personal),
      mkLinea('GOP_ALQUILER', 'GASTOS_OPERATIVOS', 'Alquiler del local', opex.alquiler),
      mkLinea('GOP_SUMINISTROS', 'GASTOS_OPERATIVOS', 'Suministros (luz, agua, gas)', opex.suministros),
      mkLinea('GOP_LIMPIEZA', 'GASTOS_OPERATIVOS', 'Limpieza e higiene', opex.limpieza),
      mkLinea('GOP_MARKETING', 'GASTOS_OPERATIVOS', 'Marketing y publicidad', opex.marketing),
      mkLinea('GOP_TRANSPORTE', 'GASTOS_OPERATIVOS', 'Transporte y reparto', opex.transporte),
      mkLinea('GOP_COMISIONES', 'GASTOS_OPERATIVOS', 'Comisiones TPV / pasarela de pago', opex.comisiones),

      // COSTES ESTRUCTURALES
      mkLinea('CES_AMORTIZACIONES', 'COSTES_ESTRUCTURALES', 'Amortizaciones', estruct.amortizaciones),
      mkLinea('CES_SEGUROS', 'COSTES_ESTRUCTURALES', 'Seguros', estruct.seguros),
      mkLinea('CES_ASESORIA', 'COSTES_ESTRUCTURALES', 'Asesoría legal y fiscal', estruct.asesoria),
      mkLinea('CES_TECNOLOGIA', 'COSTES_ESTRUCTURALES', 'Tecnología y software', estruct.tecnologia),
      mkLinea('CES_OTROS', 'COSTES_ESTRUCTURALES', 'Otros gastos estructurales', estruct.otros),
    ];

    const cuentaResultados = {
      periodo: {
        fecha_inicio: startDate,
        fecha_fin: endDate,
        modo_visualizacion,
        pedidos_procesados: pedidos.length,
      },
      lineas,
      resumen: {
        total_ingresos: safeNumber(totalIngresos),
        total_coste_ventas: safeNumber(totalCosteVentas),
        margen_bruto: safeNumber(margenBruto),
        pedidos_base: pedidos.length,
        ticket_medio: pedidos.length > 0 ? safeNumber(totalIngresos / pedidos.length) : 0,
      }
    };

    res.json(cuentaResultados);
  } catch (error) {
    console.error('Error al obtener cuenta de resultados:', error);
    res.status(500).json({ error: 'Error al obtener cuenta de resultados' });
  }
};

/**
 * GET /api/gerente/finanzas/facturas
 * Obtener listado de facturas
 */
export const obtenerFacturas = async (req: Request, res: Response) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      cliente_id,
      estado_pago
    } = req.query;

    const facturas = await prisma.factura.findMany({
      include: {
        cliente: true,
        pedido: {
          include: {
            items: {
              include: {
                producto: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    const facturasFormateadas = facturas.map((f: any) => ({
      id: f.id.toString(),
      numero: `F-${f.id.toString().padStart(6, '0')}`,
      fecha: f.fecha,
      cliente_id: f.clienteId,
      cliente_nombre: f.cliente.nombre,
      pedido_id: f.pedidoId,
      subtotal: f.total / 1.21, // Asumiendo IVA 21%
      iva: f.total - (f.total / 1.21),
      total: f.total,
      estado_pago: 'pagado', // TODO: Agregar al schema
      metodo_pago: 'tarjeta', // TODO: Agregar al schema
      items: f.pedido?.items?.map((item: any) => ({
        producto_nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        total: item.cantidad * item.precio
      })) || []
    }));

    res.json(facturasFormateadas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

/**
 * GET /api/gerente/finanzas/cierres-caja
 * Obtener cierres de caja
 */
export const obtenerCierresCaja = async (req: Request, res: Response) => {
  try {
    const {
      punto_venta_id,
      fecha_inicio,
      fecha_fin
    } = req.query;

    // Construir filtros dinámicos
    const filtros: any = {};

    if (punto_venta_id) {
      filtros.puntoVentaId = punto_venta_id as string;
    }

    if (fecha_inicio || fecha_fin) {
      filtros.fecha = {};
      if (fecha_inicio) {
        filtros.fecha.gte = new Date(fecha_inicio as string);
      }
      if (fecha_fin) {
        filtros.fecha.lte = new Date(fecha_fin as string);
      }
    }

    // Obtener cierres de caja desde la base de datos
    const cierresDB = await prisma.cierreCaja.findMany({
      where: filtros,
      orderBy: {
        fecha: 'desc'
      },
      include: {
        empleadoApertura: true,
        empleadoCierre: true
      }
    });

    // Transformar datos para coincidir con la interface esperada
    const cierres = cierresDB.map((cierre: any) => ({
      id: cierre.id.toString(),
      numero: cierre.numero,
      punto_venta_id: cierre.puntoVentaId,
      punto_venta_nombre: `Punto de Venta ${cierre.puntoVentaId}`,
      fecha: cierre.fecha,
      turno: cierre.turno,
      empleado_apertura: cierre.empleadoApertura?.nombre || 'No asignado',
      empleado_cierre: cierre.empleadoCierre?.nombre || 'No asignado',
      efectivo_inicial: cierre.efectivoInicial,
      total_ventas_efectivo: cierre.totalVentasEfectivo,
      total_ventas_tarjeta: cierre.totalVentasTarjeta,
      total_ventas_online: cierre.totalVentasOnline,
      gastos_caja: cierre.gastosCaja,
      efectivo_esperado: cierre.efectivoEsperado,
      efectivo_contado: cierre.efectivoContado,
      diferencia: cierre.diferencia,
      estado: cierre.estado,
      observaciones: cierre.observaciones,
      validado_por: cierre.validadoPor?.toString() || null,
      fecha_validacion: cierre.fechaValidacion
    }));

    res.json(cierres);
  } catch (error) {
    console.error('Error al obtener cierres de caja:', error);
    res.status(500).json({ error: 'Error al obtener cierres de caja' });
  }
};

/**
 * POST /api/gerente/finanzas/cierres-caja
 * Crear un nuevo cierre de caja
 */
export const crearCierreCaja = async (req: Request, res: Response) => {
  try {
    const {
      punto_venta_id,
      turno,
      empleado_id,
      efectivo_inicial,
      total_ventas_efectivo,
      total_ventas_tarjeta,
      total_ventas_online,
      gastos_caja,
      efectivo_contado,
      observaciones
    } = req.body;

    const efectivo_esperado = efectivo_inicial + total_ventas_efectivo - gastos_caja;
    const diferencia = efectivo_contado - efectivo_esperado;

    const cierreCaja = {
      id: `CC-${Date.now()}`,
      numero: `CC-${new Date().getFullYear()}-${Date.now()}`,
      punto_venta_id,
      fecha: new Date(),
      turno,
      empleado_id,
      efectivo_inicial,
      total_ventas_efectivo,
      total_ventas_tarjeta,
      total_ventas_online,
      gastos_caja,
      efectivo_esperado,
      efectivo_contado,
      diferencia,
      estado: 'cerrado',
      observaciones
    };

    res.status(201).json(cierreCaja);
  } catch (error) {
    console.error('Error al crear cierre de caja:', error);
    res.status(500).json({ error: 'Error al crear cierre de caja' });
  }
};

/**
 * GET /api/gerente/finanzas/impagos
 * Obtener cobros pendientes/impagos
 */
export const obtenerImpagos = async (req: Request, res: Response) => {
  try {
    // TODO: Implementar sistema de cobros pendientes
    const impagos = [
      {
        id: 'IMP-001',
        factura_id: 'F-000123',
        cliente_id: '1',
        cliente_nombre: 'Cliente Ejemplo',
        importe: 450.50,
        fecha_emision: new Date('2025-10-01'),
        fecha_vencimiento: new Date('2025-11-01'),
        dias_vencido: 14,
        estado: 'vencido', // pendiente, vencido, en_gestion
        gestiones: []
      }
    ];

    res.json(impagos);
  } catch (error) {
    console.error('Error al obtener impagos:', error);
    res.status(500).json({ error: 'Error al obtener impagos' });
  }
};

/**
 * GET /api/gerente/finanzas/pagos-proveedores
 * Obtener pagos pendientes a proveedores
 */
export const obtenerPagosProveedores = async (req: Request, res: Response) => {
  try {
    const { estado } = req.query;

    // TODO: Implementar desde PedidosProveedor
    const pagos = [
      {
        id: 'PAG-001',
        proveedor_id: 'PROV-001',
        proveedor_nombre: 'Harinas del Sur S.L.',
        pedido_proveedor_id: 'PP-001',
        importe: 856.50,
        fecha_pedido: new Date('2025-11-01'),
        fecha_vencimiento: new Date('2025-12-01'),
        estado: 'pendiente', // pendiente, pagado, vencido
        forma_pago: 'Transferencia',
        dias_para_vencimiento: 17
      }
    ];

    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos a proveedores:', error);
    res.status(500).json({ error: 'Error al obtener pagos a proveedores' });
  }
};

/**
 * POST /api/gerente/finanzas/pagos-proveedores/:id/pagar
 * Marcar un pago a proveedor como realizado
 */
export const registrarPagoProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      metodo_pago,
      referencia,
      fecha_pago,
      observaciones
    } = req.body;

    // TODO: Actualizar estado del pago
    const pago = {
      id,
      estado: 'pagado',
      metodo_pago,
      referencia,
      fecha_pago: fecha_pago || new Date(),
      observaciones,
      fecha_registro: new Date()
    };

    res.json({
      message: 'Pago registrado correctamente',
      pago
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
};

/**
 * GET /api/gerente/finanzas/prevision
 * Obtener previsión de tesorería
 */
export const obtenerPrevisionTesoreria = async (req: Request, res: Response) => {
  try {
    const { dias = 30 } = req.query;

    // Mock data - TODO: Calcular desde ventas históricas y pagos programados
    const prevision = [];
    const hoy = new Date();

    for (let i = 0; i < parseInt(dias as string); i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);

      prevision.push({
        fecha: fecha.toISOString().split('T')[0],
        ingresos_estimados: Math.random() * 1000 + 500,
        gastos_estimados: Math.random() * 600 + 300,
        saldo_estimado: Math.random() * 400 + 200
      });
    }

    res.json(prevision);
  } catch (error) {
    console.error('Error al obtener previsión:', error);
    res.status(500).json({ error: 'Error al obtener previsión' });
  }
};
