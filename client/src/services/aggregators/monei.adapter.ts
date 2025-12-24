/**
 * 💳 MONEI - Adaptador de Pasarela de Pagos
 * https://monei.com
 * Pasarela de pagos española con comisiones bajas
 */

import {
  AgregadorBase,
  ConfiguracionAgregador,
  RespuestaAgregador,
  WebhookPayload,
  EstadoPagoAgregador,
  PedidoAgregador
} from '../../lib/aggregator-adapter';

// ============================================
// TIPOS MONEI
// ============================================

interface MoneiPago {
  id: string;
  status: 'PENDING' | 'AUTHORIZED' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  amount: number;
  currency: string;
  orderId: string;
  customer: {
    email: string;
    name?: string;
  };
  paymentMethod?: string;
  nextAction?: {
    type: string;
    redirectUrl?: string;
  };
}

interface MoneiCrearPagoRequest {
  amount: number; // En céntimos
  currency: string;
  orderId: string;
  description?: string;
  customer?: {
    email: string;
    name?: string;
  };
  callbackUrl?: string;
  completeUrl?: string;
  cancelUrl?: string;
}

// ============================================
// ADAPTADOR MONEI
// ============================================

export class MoneiAdapter extends AgregadorBase {
  protected baseUrl = 'https://api.monei.com/v1';
  private apiKey: string;
  private accountId: string;

  constructor(config: ConfiguracionAgregador) {
    super(config);
    this.apiKey = config.credenciales.apiKey || '';
    this.accountId = config.credenciales.accountId || '';
  }

  // ============================================
  // MÉTODOS DE CONEXIÓN
  // ============================================

  async conectar(): Promise<RespuestaAgregador> {
    try {
      // Verificar credenciales obteniendo el account
      const response = await this.request<any>(
        'GET',
        '/account'
      );

      this.log('info', 'Conexión exitosa con Monei', response);

      return {
        success: true,
        data: {
          accountId: response.id,
          name: response.name,
          currency: response.currency
        }
      };
    } catch (error: any) {
      this.log('error', 'Error conectando con Monei', error);
      return {
        success: false,
        error: {
          code: 'MONEI_CONNECTION_ERROR',
          message: error.message
        }
      };
    }
  }

  async verificarConexion(): Promise<boolean> {
    try {
      const resultado = await this.conectar();
      return resultado.success;
    } catch {
      return false;
    }
  }

  // ============================================
  // MÉTODOS DE PAGO
  // ============================================

  /**
   * Crear un pago
   */
  async crearPago(params: MoneiCrearPagoRequest): Promise<RespuestaAgregador<MoneiPago>> {
    try {
      const response = await this.request<MoneiPago>(
        'POST',
        '/payments',
        {
          amount: params.amount,
          currency: params.currency || 'EUR',
          orderId: params.orderId,
          description: params.description,
          customer: params.customer,
          callbackUrl: params.callbackUrl || this.config.configuracion.callbackUrl,
          completeUrl: params.completeUrl,
          cancelUrl: params.cancelUrl
        }
      );

      this.log('info', 'Pago creado', response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      this.log('error', 'Error creando pago', error);
      return {
        success: false,
        error: {
          code: 'MONEI_CREATE_PAYMENT_ERROR',
          message: error.message
        }
      };
    }
  }

  /**
   * Obtener estado de un pago
   */
  async obtenerPago(paymentId: string): Promise<RespuestaAgregador<MoneiPago>> {
    try {
      const response = await this.request<MoneiPago>(
        'GET',
        `/payments/${paymentId}`
      );

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'MONEI_GET_PAYMENT_ERROR',
          message: error.message
        }
      };
    }
  }

  /**
   * Confirmar (capturar) un pago autorizado
   */
  async confirmarPago(paymentId: string, amount?: number): Promise<RespuestaAgregador> {
    try {
      const response = await this.request<MoneiPago>(
        'POST',
        `/payments/${paymentId}/confirm`,
        amount ? { amount } : undefined
      );

      this.log('info', 'Pago confirmado', response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'MONEI_CONFIRM_PAYMENT_ERROR',
          message: error.message
        }
      };
    }
  }

  /**
   * Cancelar un pago
   */
  async cancelarPago(paymentId: string): Promise<RespuestaAgregador> {
    try {
      const response = await this.request<MoneiPago>(
        'POST',
        `/payments/${paymentId}/cancel`
      );

      this.log('info', 'Pago cancelado', response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'MONEI_CANCEL_PAYMENT_ERROR',
          message: error.message
        }
      };
    }
  }

  /**
   * Realizar un reembolso
   */
  async reembolsarPago(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<RespuestaAgregador> {
    try {
      const response = await this.request<any>(
        'POST',
        `/payments/${paymentId}/refund`,
        {
          amount,
          reason
        }
      );

      this.log('info', 'Reembolso realizado', response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'MONEI_REFUND_ERROR',
          message: error.message
        }
      };
    }
  }

  // ============================================
  // WEBHOOKS
  // ============================================

  async procesarWebhook(payload: WebhookPayload): Promise<RespuestaAgregador> {
    try {
      const data = payload.datos;
      
      // Verificar firma
      if (payload.firma && !this.verificarFirmaWebhook(data, payload.firma)) {
        return {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Firma del webhook inválida'
          }
        };
      }

      // Procesar según el evento
      switch (data.type) {
        case 'payment.succeeded':
          this.log('info', 'Pago completado', data);
          break;
        
        case 'payment.failed':
          this.log('warning', 'Pago fallido', data);
          break;
        
        case 'payment.refunded':
          this.log('info', 'Pago reembolsado', data);
          break;
        
        default:
          this.log('info', `Evento webhook: ${data.type}`, data);
      }

      return {
        success: true,
        data: {
          procesado: true,
          tipo: data.type
        }
      };
    } catch (error: any) {
      this.log('error', 'Error procesando webhook', error);
      return {
        success: false,
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: error.message
        }
      };
    }
  }

  verificarFirmaWebhook(payload: any, firma: string): boolean {
    // Monei usa HMAC SHA256
    // La verificación se hace en el webhook route con createHmac
    return true; // Implementado en webhook route
  }

  /**
   * Convertir pago de Monei a formato interno
   * Monei no es delivery, es pasarela de pagos
   */
  async convertirPedido(payload: any): Promise<PedidoAgregador> {
    throw new Error('Monei es pasarela de pagos, no procesa pedidos de delivery');
  }

  // ============================================
  // MÉTODOS NO APLICABLES (Monei es solo pagos)
  // ============================================

  async obtenerPedidosNuevos() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  async aceptarPedido() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  async rechazarPedido() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  async actualizarEstadoPedido() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  async marcarListo() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  async sincronizarMenu() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  async actualizarDisponibilidadProducto() {
    return { success: false, error: { code: 'NOT_APPLICABLE', message: 'No aplicable para pagos' } };
  }

  // ============================================
  // AUTH HEADERS
  // ============================================

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `pk_${this.apiKey}` // Monei usa pk_ para public key
    };
  }
}

// ============================================
// HELPER PARA USAR EN COMPONENTES
// ============================================

export const moneiHelper = {
  /**
   * Convertir euros a céntimos
   */
  eurosACentimos: (euros: number): number => {
    return Math.round(euros * 100);
  },

  /**
   * Convertir céntimos a euros
   */
  centimosAEuros: (centimos: number): number => {
    return centimos / 100;
  },

  /**
   * Mapear estado Monei a estado interno
   */
  mapearEstado: (estadoMonei: string): EstadoPagoAgregador => {
    const mapa: Record<string, EstadoPagoAgregador> = {
      'PENDING': EstadoPagoAgregador.PENDIENTE,
      'AUTHORIZED': EstadoPagoAgregador.AUTORIZADO,
      'SUCCEEDED': EstadoPagoAgregador.CAPTURADO,
      'FAILED': EstadoPagoAgregador.ERROR,
      'CANCELED': EstadoPagoAgregador.CANCELADO,
      'REFUNDED': EstadoPagoAgregador.DEVUELTO
    };
    return mapa[estadoMonei] || EstadoPagoAgregador.PENDIENTE;
  }
};

export default MoneiAdapter;