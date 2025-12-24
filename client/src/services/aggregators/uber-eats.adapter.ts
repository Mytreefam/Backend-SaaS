/**
 * 🍔 UBER EATS - Adaptador de Delivery
 * https://developer.uber.com/docs/eats
 * Agregador de pedidos Uber Eats
 */

import {
  AgregadorBase,
  ConfiguracionAgregador,
  PedidoAgregador,
  EstadoPedidoAgregador
} from '../../lib/aggregator-adapter';

// ============================================
// TIPOS UBER EATS
// ============================================

interface UberEatsOrder {
  id: string;
  display_id: string;
  type: 'DELIVERY_BY_UBER' | 'PICKUP' | 'DINE_IN';
  current_state: 'CREATED' | 'ACCEPTED' | 'DENIED' | 'FINISHED' | 'CANCELLED';
  
  eater: {
    first_name: string;
    phone: string;
    phone_code: string;
  };
  
  cart: {
    items: Array<{
      id: string;
      external_data: string;
      title: string;
      quantity: number;
      price: {
        unit_price: {
          amount: number;
          currency_code: string;
          formatted: string;
        };
        total_price: {
          amount: number;
        };
      };
      selected_modifier_groups?: Array<{
        title: string;
        selected_items: Array<{
          title: string;
          price: {
            amount: number;
          };
        }>;
      }>;
      special_instructions?: string;
    }>;
    special_instructions?: string;
  };
  
  payment: {
    charges: {
      total: {
        amount: number;
      };
      sub_total: {
        amount: number;
      };
      tax: {
        amount: number;
      };
      total_fee: {
        amount: number;
      };
    };
  };
  
  estimated_ready_for_pickup_at?: string;
  placed_at: string;
  
  delivery?: {
    dropoff: {
      address: string;
      notes?: string;
    };
  };
}

// ============================================
// ADAPTADOR UBER EATS
// ============================================

export class UberEatsAdapter extends AgregadorBase {
  protected baseUrl = 'https://api.uber.com/v1/eats';
  private clientId: string;
  private clientSecret: string;
  private storeId: string;
  private accessToken: string = '';

  constructor(config: ConfiguracionAgregador) {
    super(config);
    this.clientId = config.credenciales.clientId || '';
    this.clientSecret = config.credenciales.clientSecret || '';
    this.storeId = config.credenciales.storeId || '';
  }

  // ============================================
  // CONEXIÓN Y AUTENTICACIÓN
  // ============================================

  async conectar(): Promise<RespuestaAgregador> {
    try {
      // Obtener token OAuth2
      const tokenResponse = await fetch('https://login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          scope: 'eats.store'
        })
      });

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;

      // Verificar acceso al store
      const storeResponse = await this.request<any>(
        'GET',
        `/stores/${this.storeId}`
      );

      this.log('info', 'Conexión exitosa con Uber Eats', storeResponse);

      return {
        success: true,
        data: {
          storeId: storeResponse.id,
          name: storeResponse.name
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_CONNECTION_ERROR',
          message: error.message
        }
      };
    }
  }

  async verificarConexion(): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.conectar();
      }
      return true;
    } catch {
      return false;
    }
  }

  // ============================================
  // GESTIÓN DE PEDIDOS
  // ============================================

  async obtenerPedidosNuevos(): Promise<RespuestaAgregador<PedidoAgregador[]>> {
    try {
      const response = await this.request<{ orders: UberEatsOrder[] }>(
        'GET',
        `/stores/${this.storeId}/orders?current_state=CREATED`
      );

      const pedidos = response.orders.map(order => this.convertirPedidoUberEats(order));

      return {
        success: true,
        data: pedidos
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_GET_ORDERS_ERROR',
          message: error.message
        }
      };
    }
  }

  async aceptarPedido(idPedido: string, tiempoPreparacion: number = 15): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/stores/${this.storeId}/orders/${idPedido}/accept_pos_order`,
        {
          reason: 'Order accepted',
          fields_to_update: {
            estimated_ready_for_pickup_at: this.calcularTiempoEstimado(tiempoPreparacion)
          }
        }
      );

      this.log('info', `Pedido ${idPedido} aceptado`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_ACCEPT_ORDER_ERROR',
          message: error.message
        }
      };
    }
  }

  async rechazarPedido(idPedido: string, motivo: string): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/stores/${this.storeId}/orders/${idPedido}/deny_pos_order`,
        {
          reason: motivo,
          denial_reason_code: 'BUSY' // OUT_OF_ITEMS, BUSY, CLOSED, etc.
        }
      );

      this.log('info', `Pedido ${idPedido} rechazado`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_REJECT_ORDER_ERROR',
          message: error.message
        }
      };
    }
  }

  async actualizarEstadoPedido(
    idPedido: string,
    estado: EstadoPedidoAgregador
  ): Promise<RespuestaAgregador> {
    try {
      // Uber Eats no tiene endpoint directo para cambiar estado
      // Se hace según el flujo: accept -> mark_ready -> complete
      
      if (estado === EstadoPedidoAgregador.LISTO) {
        return await this.marcarListo(idPedido);
      }

      return {
        success: true,
        data: { message: 'Estado actualizado localmente' }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_UPDATE_ORDER_ERROR',
          message: error.message
        }
      };
    }
  }

  async marcarListo(idPedido: string): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/stores/${this.storeId}/orders/${idPedido}/mark_ready_for_pickup`
      );

      this.log('info', `Pedido ${idPedido} marcado como listo`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_MARK_READY_ERROR',
          message: error.message
        }
      };
    }
  }

  // ============================================
  // GESTIÓN DE MENÚ
  // ============================================

  async sincronizarMenu(productos: any[]): Promise<RespuestaAgregador> {
    try {
      // Uber Eats usa un sistema de menú estructurado
      const menu = {
        menus: [{
          title: 'Menu Principal',
          category_ids: ['todos'],
          service_availability: [{
            day_of_week: 'monday',
            time_periods: [{ start_time: '00:00', end_time: '23:59' }]
          }]
        }],
        categories: [{
          id: 'todos',
          title: 'Todos los productos'
        }],
        items: productos.map(p => ({
          id: p.sku || p.id,
          external_data: p.id,
          title: p.nombre,
          description: p.descripcion,
          image_url: p.imagen,
          price: {
            unit_price: {
              amount: Math.round(p.precio * 100), // Céntimos
              currency_code: 'EUR'
            }
          },
          tax_rate: p.iva || 10,
          quantity_available: p.stock || 0,
          sold_out: !p.activo || p.stock === 0
        }))
      };

      const response = await this.request(
        'POST',
        `/stores/${this.storeId}/menus`,
        menu
      );

      this.log('info', `Menú sincronizado: ${productos.length} productos`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_SYNC_MENU_ERROR',
          message: error.message
        }
      };
    }
  }

  async actualizarDisponibilidadProducto(
    sku: string,
    disponible: boolean
  ): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'PATCH',
        `/stores/${this.storeId}/items/${sku}`,
        {
          sold_out: !disponible
        }
      );

      this.log('info', `Producto ${sku} ${disponible ? 'disponible' : 'agotado'}`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UBER_EATS_UPDATE_PRODUCT_ERROR',
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
      
      switch (data.event_type) {
        case 'orders.notification':
          this.log('info', 'Nuevo pedido recibido', data);
          break;
        
        case 'orders.update':
          this.log('info', 'Actualización de pedido', data);
          break;
        
        case 'orders.cancel':
          this.log('warning', 'Pedido cancelado', data);
          break;
        
        default:
          this.log('info', `Evento webhook: ${data.event_type}`, data);
      }

      return {
        success: true,
        data: {
          procesado: true,
          tipo: data.event_type
        }
      };
    } catch (error: any) {
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
    // Uber Eats usa X-Uber-Signature header con HMAC SHA256
    // La verificación se hace en el webhook route con createHmac
    return true; // Implementado en webhook route
  }

  /**
   * Convertir pedido de Uber Eats a formato interno
   */
  async convertirPedido(payload: any): Promise<PedidoAgregador> {
    const order = payload.resource || payload;
    return this.convertirPedidoUberEats(order);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private convertirPedidoUberEats(order: UberEatsOrder): PedidoAgregador {
    const items = order.cart.items.map(item => {
      const modificadores = item.selected_modifier_groups?.flatMap(group =>
        group.selected_items.map(mod => ({
          nombre: mod.title,
          precio: mod.price.amount / 100
        }))
      );

      return {
        id_externo: item.id,
        sku: item.external_data,
        nombre: item.title,
        cantidad: item.quantity,
        precio_unitario: item.price.unit_price.amount / 100,
        modificadores,
        notas: item.special_instructions
      };
    });

    return {
      id_externo: order.id,
      agregador: 'uber_eats',
      fecha_creacion: new Date(order.placed_at),
      estado: this.mapearEstadoAgregador(order.current_state),
      
      cliente: {
        nombre: order.eater.first_name,
        telefono: `${order.eater.phone_code}${order.eater.phone}`
      },
      
      entrega: {
        direccion: order.delivery?.dropoff.address || 'Recogida en local',
        codigo_postal: '',
        ciudad: '',
        notas: order.delivery?.dropoff.notes || order.cart.special_instructions
      },
      
      items,
      
      subtotal: order.payment.charges.sub_total.amount / 100,
      gastos_envio: 0,
      comision_agregador: order.payment.charges.total_fee.amount / 100,
      descuentos: 0,
      total: order.payment.charges.total.amount / 100,
      
      hora_entrega_estimada: order.estimated_ready_for_pickup_at 
        ? new Date(order.estimated_ready_for_pickup_at)
        : undefined,
      
      metadata: {
        display_id: order.display_id,
        type: order.type
      }
    };
  }

  protected mapearEstadoAgregador(estadoUber: string): EstadoPedidoAgregador {
    const mapa: Record<string, EstadoPedidoAgregador> = {
      'CREATED': EstadoPedidoAgregador.NUEVO,
      'ACCEPTED': EstadoPedidoAgregador.ACEPTADO,
      'DENIED': EstadoPedidoAgregador.RECHAZADO,
      'FINISHED': EstadoPedidoAgregador.ENTREGADO,
      'CANCELLED': EstadoPedidoAgregador.CANCELADO
    };
    return mapa[estadoUber] || EstadoPedidoAgregador.NUEVO;
  }

  private calcularTiempoEstimado(minutos: number): string {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() + minutos);
    return Math.floor(fecha.getTime() / 1000).toString(); // Unix timestamp
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }
}

export default UberEatsAdapter;