/**
 * SERVICIO DE FACTURACIÓN AUTOMÁTICA
 * Genera facturas VeriFactu automáticamente cuando se completa un pago
 */

import verifactuService from './verifactu.service';
import {
  FacturaVeriFactu,
  LineaFacturaVeriFactu,
  DesgloseIVA,
  DatosCobro,
} from '../types/verifactu.types';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS PARA PEDIDOS
// ============================================

interface Pedido {
  id: string;
  numero_pedido: string;
  cliente_id: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    nif?: string;
    telefono?: string;
    direccion?: string;
  };
  lineas: LineaPedido[];
  subtotal: number;
  iva: number;
  total: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros';
  estado_pago: 'pendiente' | 'pagado' | 'rechazado';
  fecha_pago?: Date;
  fecha_pedido: Date;
}

interface LineaPedido {
  id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  tipo_iva: number;
  subtotal: number;
  iva_linea: number;
  total: number;
}

// ============================================
// CONFIGURACIÓN DE LA EMPRESA
// ============================================

const EMPRESA_CONFIG = {
  nif: 'B12345678', // ⚠️ CAMBIAR POR TU NIF REAL
  razonSocial: 'Udar Edge S.L.', // ⚠️ CAMBIAR
  nombreComercial: 'Udar Edge',
  direccion: {
    tipoVia: 'Calle',
    nombreVia: 'Gran Vía',
    numeroFinca: '45',
    piso: '3',
    puerta: 'A',
    codigoPostal: '28013',
    municipio: 'Madrid',
    provincia: 'Madrid',
    codigoPais: 'ES',
  },
  email: 'info@udaredge.com',
  telefono: '+34 900 123 456',
  web: 'https://udaredge.com',
};

// ============================================
// CLASE PRINCIPAL
// ============================================

class FacturacionAutomaticaService {
  private contadorFacturas: number = 1;

  /**
   * FUNCIÓN PRINCIPAL: Genera factura automáticamente cuando se paga un pedido
   * Esta función debe llamarse desde el sistema de pagos
   */
  async generarFacturaAutomatica(pedido: Pedido): Promise<FacturaVeriFactu | null> {
    try {
      console.log('🚀 Iniciando generación automática de factura...');
      console.log('📦 Pedido:', pedido.numero_pedido);

      // 1. Validar que el pedido esté pagado
      if (pedido.estado_pago !== 'pagado') {
        console.warn('⚠️ Pedido no está pagado, no se genera factura');
        return null;
      }

      // 2. Verificar si ya existe factura para este pedido
      const facturaExistente = await this.verificarFacturaExistente(pedido.id);
      if (facturaExistente) {
        console.warn('⚠️ Ya existe factura para este pedido');
        toast.warning('Este pedido ya tiene factura generada');
        return facturaExistente;
      }

      // 3. Convertir pedido a factura
      const factura = this.convertirPedidoAFactura(pedido);

      // 4. Generar VeriFactu (hash, QR, firma)
      console.log('🔐 Generando VeriFactu...');
      const facturaConVeriFactu = await verifactuService.generarVeriFactu(factura);

      // 5. Enviar a AEAT (en producción será real)
      console.log('📤 Enviando a AEAT...');
      const resultadoAEAT = await verifactuService.enviarAEAT(facturaConVeriFactu);

      if (!resultadoAEAT.exito) {
        console.error('❌ Error al enviar a AEAT:', resultadoAEAT.mensaje);
        toast.error('Error al registrar factura en AEAT', {
          description: resultadoAEAT.mensaje,
        });
        // Aunque falle AEAT, guardamos la factura localmente
      }

      // 6. Guardar en localStorage (en producción sería Supabase)
      await this.guardarFactura(facturaConVeriFactu, pedido.id);

      // 7. Notificar éxito
      console.log('✅ Factura generada correctamente:', facturaConVeriFactu.numeroCompleto);
      toast.success('Factura generada automáticamente', {
        description: `Factura ${facturaConVeriFactu.numeroCompleto} creada con VeriFactu`,
        duration: 5000,
      });

      // 8. Enviar email al cliente (simulado)
      await this.enviarEmailFactura(pedido.cliente, facturaConVeriFactu);

      return facturaConVeriFactu;
    } catch (error) {
      console.error('❌ Error generando factura automática:', error);
      toast.error('Error al generar factura', {
        description: String(error),
      });
      return null;
    }
  }

  /**
   * Convierte un pedido en una estructura de factura VeriFactu
   */
  private convertirPedidoAFactura(pedido: Pedido): FacturaVeriFactu {
    const fechaHoy = new Date();
    const numeroFactura = this.generarNumeroFactura();

    // Convertir líneas de pedido a líneas de factura
    const lineasFactura: LineaFacturaVeriFactu[] = pedido.lineas.map((linea, index) => ({
      numeroLinea: index + 1,
      descripcion: linea.producto_nombre,
      cantidad: linea.cantidad,
      unidad: 'ud',
      precioUnitario: linea.precio_unitario,
      descuento: linea.descuento || 0,
      tipoIVA: linea.tipo_iva || 21,
      importeIVA: linea.iva_linea,
      baseImponible: linea.subtotal,
      importeTotal: linea.total,
    }));

    // Calcular desglose de IVA
    const desgloseIVA = this.calcularDesgloseIVA(pedido.lineas);

    // Determinar si es factura simplificada
    const esSimplificada = !pedido.cliente.nif || pedido.total < 400;

    // Crear estructura de factura
    const factura: FacturaVeriFactu = {
      id: `FAC-${Date.now()}-${pedido.id}`,
      serie: '2025',
      numero: numeroFactura,
      numeroCompleto: `2025/${numeroFactura}`,
      fechaExpedicion: fechaHoy,
      fechaOperacion: pedido.fecha_pedido,
      horaExpedicion: fechaHoy.toTimeString().split(' ')[0],
      tipoFactura: 'F1',
      tipoOperacion: 'venta',
      facturaSimplificada: esSimplificada,
      facturaSinDestinatario: !pedido.cliente.nif,
      
      // EMISOR (tu empresa)
      emisor: {
        nif: EMPRESA_CONFIG.nif,
        razonSocial: EMPRESA_CONFIG.razonSocial,
        nombreComercial: EMPRESA_CONFIG.nombreComercial,
        direccion: EMPRESA_CONFIG.direccion,
      },
      
      // RECEPTOR (cliente)
      receptor: {
        tipoIdentificador: pedido.cliente.nif ? 'NIF' : 'SinIdentificar',
        numeroIdentificador: pedido.cliente.nif || undefined,
        razonSocial: pedido.cliente.nombre,
        codigoPais: 'ES',
        direccion: pedido.cliente.direccion ? {
          direccion: pedido.cliente.direccion,
          codigoPais: 'ES',
        } : undefined,
      },
      
      // LÍNEAS
      lineas: lineasFactura,
      
      // DESGLOSE IVA
      desgloseIVA: desgloseIVA,
      
      // TOTALES
      baseImponibleTotal: pedido.subtotal,
      cuotaIVATotal: pedido.iva,
      importeTotal: pedido.total,
      
      // DATOS DE COBRO
      datosCobro: {
        medioCobro: this.convertirMetodoPago(pedido.metodo_pago),
        importe: pedido.total,
        fecha: pedido.fecha_pago || fechaHoy,
      },
      
      // DESCRIPCIÓN
      descripcionOperacion: `Factura correspondiente al pedido ${pedido.numero_pedido}`,
      referenciaExterna: pedido.numero_pedido,
    };

    return factura;
  }

  /**
   * Calcula el desglose de IVA agrupado por tipo
   */
  private calcularDesgloseIVA(lineas: LineaPedido[]): DesgloseIVA[] {
    const desglosePorTipo: { [key: number]: { base: number; cuota: number } } = {};

    lineas.forEach((linea) => {
      const tipoIVA = linea.tipo_iva || 21;

      if (!desglosePorTipo[tipoIVA]) {
        desglosePorTipo[tipoIVA] = { base: 0, cuota: 0 };
      }

      desglosePorTipo[tipoIVA].base += linea.subtotal;
      desglosePorTipo[tipoIVA].cuota += linea.iva_linea;
    });

    return Object.entries(desglosePorTipo).map(([tipo, valores]) => ({
      tipoIVA: Number(tipo),
      baseImponible: Number(valores.base.toFixed(2)),
      cuotaIVA: Number(valores.cuota.toFixed(2)),
    }));
  }

  /**
   * Convierte el método de pago del pedido al formato de VeriFactu
   */
  private convertirMetodoPago(metodoPago: string): DatosCobro['medioCobro'] {
    const mapa: { [key: string]: DatosCobro['medioCobro'] } = {
      efectivo: 'efectivo',
      tarjeta: 'tarjeta',
      transferencia: 'transferencia',
      otros: 'otros',
    };
    return mapa[metodoPago] || 'otros';
  }

  /**
   * Genera un número de factura único
   */
  private generarNumeroFactura(): string {
    // Obtener el contador del localStorage
    const stored = localStorage.getItem('contador_facturas');
    if (stored) {
      this.contadorFacturas = parseInt(stored, 10);
    }

    // Incrementar
    const numero = this.contadorFacturas;
    this.contadorFacturas++;

    // Guardar
    localStorage.setItem('contador_facturas', String(this.contadorFacturas));

    // Retornar con padding (001, 002, 003...)
    return String(numero).padStart(6, '0');
  }

  /**
   * Verifica si ya existe una factura para este pedido
   */
  private async verificarFacturaExistente(pedidoId: string): Promise<FacturaVeriFactu | null> {
    const facturas = this.obtenerTodasLasFacturas();
    const factura = facturas.find((f) => f.referenciaExterna === pedidoId);
    return factura || null;
  }

  /**
   * Guarda la factura en localStorage
   * En producción, esto sería una inserción en Supabase
   */
  private async guardarFactura(factura: FacturaVeriFactu, pedidoId: string): Promise<void> {
    try {
      // Obtener facturas existentes
      const facturas = this.obtenerTodasLasFacturas();

      // Añadir la nueva
      facturas.push({
        ...factura,
        referenciaExterna: pedidoId, // Guardar referencia al pedido
      });

      // Guardar en localStorage
      localStorage.setItem('facturas_verifactu', JSON.stringify(facturas));

      console.log('💾 Factura guardada correctamente');
    } catch (error) {
      console.error('❌ Error guardando factura:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las facturas del localStorage
   */
  obtenerTodasLasFacturas(): FacturaVeriFactu[] {
    try {
      const stored = localStorage.getItem('facturas_verifactu');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error obteniendo facturas:', error);
      return [];
    }
  }

  /**
   * Obtiene las facturas de un cliente específico
   */
  obtenerFacturasCliente(clienteId: string): FacturaVeriFactu[] {
    const todasLasFacturas = this.obtenerTodasLasFacturas();
    return todasLasFacturas.filter(
      (f) => f.receptor?.numeroIdentificador === clienteId || 
             f.receptor?.razonSocial?.includes(clienteId)
    );
  }

  /**
   * Simula el envío de email con la factura al cliente
   */
  private async enviarEmailFactura(
    cliente: Pedido['cliente'],
    factura: FacturaVeriFactu
  ): Promise<void> {
    console.log('📧 Enviando email a:', cliente.email);
    console.log('📄 Factura:', factura.numeroCompleto);
    console.log('💰 Importe:', factura.importeTotal.toFixed(2), '€');

    // Simular delay de envío
    await new Promise((resolve) => setTimeout(resolve, 500));

    // En producción, aquí iría:
    // - Generar PDF de la factura
    // - Enviar email con SendGrid/AWS SES/etc.
    // - Adjuntar PDF y QR
    // - Incluir link de descarga

    console.log('✅ Email enviado correctamente');

    toast.success('Factura enviada por email', {
      description: `Enviada a ${cliente.email}`,
    });
  }

  /**
   * Descarga una factura en formato JSON (para desarrollo)
   * En producción sería PDF
   */
  descargarFactura(factura: FacturaVeriFactu): void {
    const dataStr = JSON.stringify(factura, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Factura-${factura.numeroCompleto}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Factura descargada');
  }

  /**
   * Descarga múltiples facturas en un ZIP
   */
  async descargarFacturasMasivo(facturas: FacturaVeriFactu[]): Promise<void> {
    // Por ahora, descargar individualmente
    // En producción, usar JSZip para crear un archivo ZIP
    toast.info('Descargando facturas...', {
      description: `${facturas.length} facturas`,
    });

    for (const factura of facturas) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.descargarFactura(factura);
    }

    toast.success('Facturas descargadas');
  }

  /**
   * Exporta facturas a CSV
   */
  exportarFacturasCSV(facturas: FacturaVeriFactu[]): void {
    const headers = [
      'Número',
      'Fecha',
      'Cliente',
      'NIF Cliente',
      'Base Imponible',
      'IVA',
      'Total',
      'Estado VeriFactu',
      'Hash',
    ];

    const rows = facturas.map((f) => [
      f.numeroCompleto,
      f.fechaExpedicion.toLocaleDateString('es-ES'),
      f.receptor?.razonSocial || 'Sin identificar',
      f.receptor?.numeroIdentificador || '-',
      f.baseImponibleTotal.toFixed(2),
      f.cuotaIVATotal.toFixed(2),
      f.importeTotal.toFixed(2),
      f.verifactu?.estado || 'pendiente',
      f.verifactu?.hash.substring(0, 16) || '-',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facturas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exportado correctamente');
  }

  /**
   * Limpia todas las facturas (solo para desarrollo)
   */
  limpiarFacturas(): void {
    localStorage.removeItem('facturas_verifactu');
    localStorage.removeItem('contador_facturas');
    toast.success('Facturas limpiadas');
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================

export const facturacionAutomaticaService = new FacturacionAutomaticaService();
export default facturacionAutomaticaService;

// ============================================
// FUNCIÓN DE INTEGRACIÓN RÁPIDA
// ============================================

/**
 * Función simple para integrar en tu sistema de pagos
 * 
 * Uso:
 * ```typescript
 * import { procesarPagoYFacturar } from './services/facturacion-automatica.service';
 * 
 * await procesarPagoYFacturar(pedido);
 * ```
 */
export async function procesarPagoYFacturar(pedido: Pedido): Promise<FacturaVeriFactu | null> {
  return await facturacionAutomaticaService.generarFacturaAutomatica(pedido);
}
