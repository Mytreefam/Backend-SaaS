/**
 * 🍕 JUST EAT - Adaptador de Delivery
 * https://developers.just-eat.com/
 * Agregador de pedidos Just Eat (Takeaway.com)
 */

import {
  AgregadorBase,
  ConfiguracionAgregador,
  PedidoAgregador,
  RespuestaAgregador,
  WebhookPayload,
  EstadoPedidoAgregador
} from '../../lib/aggregator-adapter';

// ============================================
// TIPOS JUST EAT
// ============================================

interface JustEatOrder {
  Id: string;
  FriendlyOrderReference: string;
  OrderDate: string;
  Status: 'Pending' | 'Accepted' | 'Rejected' | 'ReadyForCollection' | 'Collected' | 'Delivered' | 'Cancelled';
  
  Customer: {
    Name: string;
    PhoneNumber: string;
    Email?: string;
  };
  
  DeliveryAddress?: {
    Lines: string[];
    City: string;
    Postcode: string;
  };
  
  Lines: Array<{
    ProductId: string;
    Name: string;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    Options?: Array<{
      Name: string;
      Price: number;
    }>;
    Instructions?: string;
  }>;
  
  Totals: {
    SubTotal: number;
    DeliveryCharge: number;
    ServiceCharge: number;
    Total: number;
    Discount: number;
  };
  
  EstimatedDeliveryTime?: string;
  RequestedDeliveryTime?: string;
}

// ============================================
// ADAPTADOR JUST EAT
// ============================================

export class JustEatAdapter extends AgregadorBase {
  protected baseUrl = 'https://uk-partnerapi.just-eat.io';
  private apiKey: string;
  private restaurantId: string;

  constructor(config: ConfiguracionAgregador) {
    super(config);
    this.apiKey = config.credenciales.apiKey || '';
    this.restaurantId = config.credenciales.restaurantId || '';
  }

  // ============================================
  // CONEXIÓN
  // ============================================

  async conectar(): Promise<RespuestaAgregador> {
    try {
      const response = await this.request<any>(
        'GET',
        `/restaurants/${this.restaurantId}`
      );

      this.log('info', 'Conexión exitosa con Just Eat', response);

      return {
        success: true,
        data: {
          restaurantId: response.Id,
          name: response.Name,
          address: response.Address
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'JUSTEAT_CONNECTION_ERROR',
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
  // GESTIÓN DE PEDIDOS
  // ============================================

  async obtenerPedidosNuevos(): Promise<RespuestaAgregador<PedidoAgregador[]>> {
    try {
      const response = await this.request<{ Orders: JustEatOrder[] }>(
        'GET',
        `/restaurants/${this.restaurantId}/orders?status=Pending`
      );

      const pedidos = response.Orders.map(order => this.convertirPedidoJustEat(order));

      return {
        success: true,
        data: pedidos
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'JUSTEAT_GET_ORDERS_ERROR',
          message: error.message
        }
      };
    }
  }

  async aceptarPedido(idPedido: string, tiempoPreparacion: number = 15): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/restaurants/${this.restaurantId}/orders/${idPedido}/accept`,
        {
          EstimatedPreparationTimeMinutes: tiempoPreparacion
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
          code: 'JUSTEAT_ACCEPT_ORDER_ERROR',
          message: error.message
        }
      };
    }
  }

  async rechazarPedido(idPedido: string, motivo: string): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/restaurants/${this.restaurantId}/orders/${idPedido}/reject`,
        {
          Reason: motivo,
          ReasonCode: 'BUSY' // BUSY, CLOSED, OUT_OF_STOCK, etc.
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
          code: 'JUSTEAT_REJECT_ORDER_ERROR',
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
      const estadoJustEat = this.mapearEstadoInterno(estado);
      
      const response = await this.request(
        'PUT',
        `/restaurants/${this.restaurantId}/orders/${idPedido}/status`,
        {
          Status: estadoJustEat
        }
      );

      this.log('info', `Estado de pedido ${idPedido} actualizado a ${estado}`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'JUSTEAT_UPDATE_ORDER_ERROR',
          message: error.message
        }
      };
    }
  }

  async marcarListo(idPedido: string): Promise<RespuestaAgregador> {
    return this.actualizarEstadoPedido(idPedido, EstadoPedidoAgregador.LISTO);
  }

  // ============================================
  // GESTIÓN DE MENÚ
  // ============================================

  async sincronizarMenu(productos: any[]): Promise<RespuestaAgregador> {
    try {
      const menuJustEat = {
        Categories: [{
          Id: 'main',
          Name: 'Menu Principal',
          Description: 'Todos nuestros productos',
          Products: productos.map(p => ({
            Id: p.sku || p.id,
            Name: p.nombre,
            Description: p.descripcion,
            Price: p.precio,
            Availability: p.activo && p.stock > 0 ? 'Available' : 'Unavailable',
            ImageUrl: p.imagen,
            Alcohol: false,
            Spicy: 0
          }))
        }]
      };

      const response = await this.request(
        'PUT',
        `/restaurants/${this.restaurantId}/menu`,
        menuJustEat
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
          code: 'JUSTEAT_SYNC_MENU_ERROR',
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
        `/restaurants/${this.restaurantId}/products/${sku}`,
        {
          Availability: disponible ? 'Available' : 'Unavailable'
        }
      );

      this.log('info', `Producto ${sku} ${disponible ? 'disponible' : 'no disponible'}`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'JUSTEAT_UPDATE_PRODUCT_ERROR',
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
      
      switch (data.EventType) {
        case 'NewOrder':
          this.log('info', 'Nuevo pedido recibido', data.Order);
          break;
        
        case 'OrderUpdate':
          this.log('info', 'Actualización de pedido', data.Order);
          break;
        
        case 'OrderCancelled':
          this.log('warning', 'Pedido cancelado', data.Order);
          break;
        
        default:
          this.log('info', `Evento webhook: ${data.EventType}`, data);
      }

      return {
        success: true,
        data: {
          procesado: true,
          tipo: data.EventType
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
    // Just Eat usa X-JE-Signature header con HMAC SHA256
    // La verificación se hace en el webhook route con createHmac
    return true; // Implementado en webhook route
  }

  /**
   * Convertir pedido de Just Eat a formato interno
   */
  async convertirPedido(payload: any): Promise<PedidoAgregador> {
    const order = payload.Order || payload;
    return this.convertirPedidoJustEat(order);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private convertirPedidoJustEat(order: JustEatOrder): PedidoAgregador {
    const items = order.Lines.map(line => ({
      id_externo: line.ProductId,
      nombre: line.Name,
      cantidad: line.Quantity,
      precio_unitario: line.UnitPrice,
      modificadores: line.Options?.map(opt => ({
        nombre: opt.Name,
        precio: opt.Price
      })),
      notas: line.Instructions
    }));

    return {
      id_externo: order.Id,
      agregador: 'justeat',
      fecha_creacion: new Date(order.OrderDate),
      estado: this.mapearEstadoAgregador(order.Status),
      
      cliente: {
        nombre: order.Customer.Name,
        telefono: order.Customer.PhoneNumber,
        email: order.Customer.Email
      },
      
      entrega: {
        direccion: order.DeliveryAddress?.Lines.join(', ') || 'Recogida en local',
        codigo_postal: order.DeliveryAddress?.Postcode || '',
        ciudad: order.DeliveryAddress?.City || ''
      },
      
      items,
      
      subtotal: order.Totals.SubTotal,
      gastos_envio: order.Totals.DeliveryCharge,
      comision_agregador: order.Totals.ServiceCharge,
      descuentos: order.Totals.Discount,
      total: order.Totals.Total,
      
      hora_entrega_estimada: order.EstimatedDeliveryTime 
        ? new Date(order.EstimatedDeliveryTime)
        : undefined,
      
      metadata: {
        friendlyReference: order.FriendlyOrderReference,
        requestedDeliveryTime: order.RequestedDeliveryTime
      }
    };
  }

  protected mapearEstadoInterno(estado: EstadoPedidoAgregador): string {
    const mapa: Record<EstadoPedidoAgregador, string> = {
      [EstadoPedidoAgregador.NUEVO]: 'Pending',
      [EstadoPedidoAgregador.ACEPTADO]: 'Accepted',
      [EstadoPedidoAgregador.PREPARANDO]: 'Accepted',
      [EstadoPedidoAgregador.LISTO]: 'ReadyForCollection',
      [EstadoPedidoAgregador.EN_CAMINO]: 'Collected',
      [EstadoPedidoAgregador.ENTREGADO]: 'Delivered',
      [EstadoPedidoAgregador.CANCELADO]: 'Cancelled',
      [EstadoPedidoAgregador.RECHAZADO]: 'Rejected'
    };
    return mapa[estado];
  }

  protected mapearEstadoAgregador(estadoJustEat: string): EstadoPedidoAgregador {
    const mapa: Record<string, EstadoPedidoAgregador> = {
      'Pending': EstadoPedidoAgregador.NUEVO,
      'Accepted': EstadoPedidoAgregador.ACEPTADO,
      'Rejected': EstadoPedidoAgregador.RECHAZADO,
      'ReadyForCollection': EstadoPedidoAgregador.LISTO,
      'Collected': EstadoPedidoAgregador.EN_CAMINO,
      'Delivered': EstadoPedidoAgregador.ENTREGADO,
      'Cancelled': EstadoPedidoAgregador.CANCELADO
    };
    return mapa[estadoJustEat] || EstadoPedidoAgregador.NUEVO;
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}

export default JustEatAdapter;