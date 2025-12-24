/**
 * HOOK PERSONALIZADO: useFacturacionAutomatica
 * 
 * Automatiza la generación de facturas cuando se completa un pago
 * Uso simple: solo añadir este hook en tu componente de pagos
 */

import { useEffect, useCallback } from 'react';
import facturacionAutomaticaService from '../services/facturacion-automatica.service';
import { toast } from 'sonner@2.0.3';

interface PedidoConPago {
  id: string;
  estado_pago: 'pendiente' | 'pagado' | 'rechazado';
  // ... resto de campos
}

/**
 * Hook para automatizar la facturación
 * 
 * @example
 * ```tsx
 * function ComponentePago() {
 *   const { procesarPago } = useFacturacionAutomatica();
 *   
 *   const handlePagar = async () => {
 *     const resultado = await procesarPago(pedido);
 *     if (resultado.factura) {
 *       console.log('Factura generada:', resultado.factura.numeroCompleto);
 *     }
 *   };
 * }
 * ```
 */
export function useFacturacionAutomatica() {
  /**
   * Procesa un pago y genera automáticamente la factura
   */
  const procesarPago = useCallback(async (pedido: any) => {
    try {
      console.log('💳 Procesando pago del pedido:', pedido.numero_pedido);

      // 1. Aquí iría tu lógica de pago real
      // Por ejemplo: Stripe, PayPal, Redsys, etc.
      // const resultadoPago = await procesarPagoConPasarela(pedido);

      // 2. Si el pago es exitoso, generar factura automáticamente
      if (pedido.estado_pago === 'pagado') {
        console.log('✅ Pago completado, generando factura...');

        const factura = await facturacionAutomaticaService.generarFacturaAutomatica(pedido);

        if (factura) {
          return {
            exito: true,
            mensaje: 'Pago procesado y factura generada',
            factura,
          };
        } else {
          return {
            exito: false,
            mensaje: 'Pago procesado pero error al generar factura',
            factura: null,
          };
        }
      }

      return {
        exito: false,
        mensaje: 'Pago no completado',
        factura: null,
      };
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast.error('Error procesando pago');
      return {
        exito: false,
        mensaje: String(error),
        factura: null,
      };
    }
  }, []);

  /**
   * Escucha cambios en el estado de pago de un pedido
   * Útil para sistemas en tiempo real con Supabase
   */
  const escucharCambiosPago = useCallback((pedidoId: string, callback: (factura: any) => void) => {
    // Aquí se implementaría la suscripción a cambios en Supabase
    // Por ejemplo:
    // const subscription = supabase
    //   .from('pedidos')
    //   .on('UPDATE', async (payload) => {
    //     if (payload.new.estado_pago === 'pagado') {
    //       const factura = await facturacionAutomaticaService.generarFacturaAutomatica(payload.new);
    //       callback(factura);
    //     }
    //   })
    //   .subscribe();
    
    // return () => subscription.unsubscribe();

    console.log('Escuchando cambios en pedido:', pedidoId);
  }, []);

  return {
    procesarPago,
    escucharCambiosPago,
  };
}

// ============================================
// FUNCIÓN HELPER PARA INTEGRACIÓN RÁPIDA
// ============================================

/**
 * Función standalone para usar sin hook
 * Perfecta para llamar desde cualquier parte
 * 
 * @example
 * ```tsx
 * import { generarFacturaSiPagado } from './hooks/useFacturacionAutomatica';
 * 
 * await generarFacturaSiPagado(pedido);
 * ```
 */
export async function generarFacturaSiPagado(pedido: any) {
  if (pedido.estado_pago === 'pagado') {
    return await facturacionAutomaticaService.generarFacturaAutomatica(pedido);
  }
  return null;
}

/**
 * Función para marcar pedido como pagado Y generar factura
 * Todo en uno
 * 
 * @example
 * ```tsx
 * import { marcarPagadoYFacturar } from './hooks/useFacturacionAutomatica';
 * 
 * await marcarPagadoYFacturar(pedidoId, metodoPago);
 * ```
 */
export async function marcarPagadoYFacturar(
  pedidoId: string,
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
) {
  try {
    // 1. Marcar como pagado (en tu sistema)
    // Aquí iría tu lógica para actualizar el pedido
    // Por ejemplo: await supabase.from('pedidos').update({ estado_pago: 'pagado' }).eq('id', pedidoId)

    // 2. Obtener el pedido actualizado
    // const pedido = await obtenerPedido(pedidoId);

    // 3. Generar factura automáticamente
    // const factura = await facturacionAutomaticaService.generarFacturaAutomatica(pedido);

    toast.success('Pedido pagado y facturado');

    // return factura;
  } catch (error) {
    toast.error('Error procesando');
    throw error;
  }
}
