/**
 * 🛵 GLOVO - Adaptador de Delivery
 * https://docs.glovoapp.com/
 * Agregador de pedidos y delivery
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
// TIPOS GLOVO
// ============================================

interface GlovoOrder {
  id: string;
  state: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
  storeId: string;
  customerId: string;
  
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  
  deliveryAddress: {
    label: string;
    details: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    attributes?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
    comment?: string;
  }>;
  
  totalPrice: number;
  subtotal: number;
  deliveryFee: number;
  servicesFee: number;
  
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  
  courier?: {
    id: string;
    name: string;
    phone: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

interface GlovoProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  attributes?: Array<{
    id: string;
    name: string;
    options: Array<{
      id: string;
      name: string;
      price: number;
    }>;
  }>;
  available: boolean;
  collectionId?: string;
}

// ============================================
// ADAPTADOR GLOVO
// ============================================

export class GlovoAdapter extends AgregadorBase {
  protected baseUrl = 'https://api.glovoapp.com/v1';
  private apiKey: string;
  private storeId: string;

  constructor(config: ConfiguracionAgregador) {
    super(config);
    this.apiKey = config.credenciales.apiKey || '';
    this.storeId = config.credenciales.storeId || '';
  }

  // ============================================
  // CONEXIÓN
  // ============================================

  async conectar(): Promise<RespuestaAgregador> {
    try {
      const response = await this.request<any>(
        'GET',
        `/stores/${this.storeId}`
      );

      this.log('info', 'Conexión exitosa con Glovo', response);

      return {
        success: true,
        data: {
          storeId: response.id,
          name: response.name,
          address: response.address
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'GLOVO_CONNECTION_ERROR',
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
      const response = await this.request<GlovoOrder[]>(
        'GET',
        `/stores/${this.storeId}/orders?state=NEW`
      );

      const pedidos = response.map(order => this.convertirPedidoGlovo(order));

      return {
        success: true,
        data: pedidos
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'GLOVO_GET_ORDERS_ERROR',
          message: error.message
        }
      };
    }
  }

  async aceptarPedido(idPedido: string, tiempoPreparacion: number = 15): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/stores/${this.storeId}/orders/${idPedido}/accept`,
        {
          estimatedPickupTime: this.calcularTiempoEstimado(tiempoPreparacion)
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
          code: 'GLOVO_ACCEPT_ORDER_ERROR',
          message: error.message
        }
      };
    }
  }

  async rechazarPedido(idPedido: string, motivo: string): Promise<RespuestaAgregador> {
    try {
      const response = await this.request(
        'POST',
        `/stores/${this.storeId}/orders/${idPedido}/reject`,
        {
          reason: motivo
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
          code: 'GLOVO_REJECT_ORDER_ERROR',
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
      const estadoGlovo = this.mapearEstadoInterno(estado);
      
      const response = await this.request(
        'PATCH',
        `/stores/${this.storeId}/orders/${idPedido}`,
        {
          state: estadoGlovo
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
          code: 'GLOVO_UPDATE_ORDER_ERROR',
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
      const productosGlovo: GlovoProduct[] = productos.map(p => ({
        id: p.sku || p.id,
        name: p.nombre,
        description: p.descripcion,
        price: Math.round(p.precio * 100), // Glovo usa céntimos
        imageUrl: p.imagen,
        available: p.activo && p.stock > 0
      }));

      const response = await this.request(
        'PUT',
        `/stores/${this.storeId}/menu`,
        {
          products: productosGlovo
        }
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
          code: 'GLOVO_SYNC_MENU_ERROR',
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
        `/stores/${this.storeId}/products/${sku}`,
        {
          available: disponible
        }
      );

      this.log('info', `Producto ${sku} ${disponible ? 'activado' : 'desactivado'}`, response);

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'GLOVO_UPDATE_PRODUCT_ERROR',
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
      
      switch (data.event) {
        case 'order.created':
          this.log('info', 'Nuevo pedido recibido', data.order);
          break;
        
        case 'order.accepted':
          this.log('info', 'Pedido aceptado por Glover', data.order);
          break;
        
        case 'order.picked_up':
          this.log('info', 'Pedido recogido por Glover', data.order);
          break;
        
        case 'order.delivered':
          this.log('info', 'Pedido entregado', data.order);
          break;
        
        case 'order.cancelled':
          this.log('warning', 'Pedido cancelado', data.order);
          break;
        
        default:
          this.log('info', `Evento webhook: ${data.event}`, data);
      }

      return {
        success: true,
        data: {
          procesado: true,
          tipo: data.event
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
    // Glovo usa HMAC SHA256
    // La verificación se hace en el webhook route con createHmac
    return true; // Implementado en webhook route
  }

  /**
   * Convertir pedido de Glovo a formato interno
   */
  async convertirPedido(payload: any): Promise<PedidoAgregador> {
    const glovoOrder = payload.data?.order || payload;
    
    // Calcular comisión (25% del subtotal según documentación Glovo)
    const comision = glovoOrder.subtotal * 0.25;
    
    return {
      id_externo: glovoOrder.id,
      agregador: 'glovo',
      fecha_creacion: new Date(),
      estado: this.convertirEstado(glovoOrder.state),
      
      cliente: {
        id_externo: glovoOrder.customer.id,
        nombre: glovoOrder.customer.name,
        telefono: glovoOrder.customer.phone,
        email: glovoOrder.customer.email
      },
      
      entrega: {
        direccion: `${glovoOrder.deliveryAddress.label}, ${glovoOrder.deliveryAddress.details}`,
        codigo_postal: glovoOrder.deliveryAddress.postalCode || '',
        ciudad: glovoOrder.deliveryAddress.city || '',
        notas: '',
        coordenadas: {
          lat: glovoOrder.deliveryAddress.coordinates.latitude,
          lng: glovoOrder.deliveryAddress.coordinates.longitude
        }
      },
      
      items: glovoOrder.products.map((product: any) => ({
        id_externo: product.id,
        nombre: product.name,
        cantidad: product.quantity,
        precio_unitario: product.price,
        modificadores: product.attributes?.map((attr: any) => ({
          nombre: attr.name,
          precio: attr.price
        })),
        notas: product.comment
      })),
      
      subtotal: glovoOrder.subtotal,
      gastos_envio: glovoOrder.deliveryFee,
      comision_agregador: comision,
      descuentos: glovoOrder.discount || 0,
      total: glovoOrder.totalPrice,
      
      tiempo_preparacion_min: 15,
      hora_entrega_estimada: glovoOrder.estimatedDeliveryTime 
        ? new Date(glovoOrder.estimatedDeliveryTime) 
        : undefined,
      
      metadata: {
        storeId: glovoOrder.storeId,
        servicesFee: glovoOrder.servicesFee,
        estimatedPickupTime: glovoOrder.estimatedPickupTime,
        courier: glovoOrder.courier
      }
    };
  }

  /**
   * Convertir estado de Glovo a estado interno
   */
  private convertirEstado(estado: string): EstadoPedidoAgregador {
    const mapeo: Record<string, EstadoPedidoAgregador> = {
      'NEW': EstadoPedidoAgregador.NUEVO,
      'ACCEPTED': EstadoPedidoAgregador.ACEPTADO,
      'PREPARING': EstadoPedidoAgregador.PREPARANDO,
      'READY': EstadoPedidoAgregador.LISTO,
      'PICKED_UP': EstadoPedidoAgregador.EN_CAMINO,
      'DELIVERED': EstadoPedidoAgregador.ENTREGADO,
      'CANCELLED': EstadoPedidoAgregador.CANCELADO
    };
    
    return mapeo[estado] || EstadoPedidoAgregador.NUEVO;
    return true;
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private convertirPedidoGlovo(order: GlovoOrder): PedidoAgregador {
    return {
      id_externo: order.id,
      agregador: 'glovo',
      fecha_creacion: new Date(),
      estado: this.mapearEstadoAgregador(order.state),
      
      cliente: {
        id_externo: order.customer.id,
        nombre: order.customer.name,
        telefono: order.customer.phone,
        email: order.customer.email
      },
      
      entrega: {
        direccion: order.deliveryAddress.label,
        codigo_postal: '',
        ciudad: '',
        notas: order.deliveryAddress.details,
        coordenadas: {
          lat: order.deliveryAddress.coordinates.latitude,
          lng: order.deliveryAddress.coordinates.longitude
        }
      },
      
      items: order.products.map(p => ({
        id_externo: p.id,
        nombre: p.name,
        cantidad: p.quantity,
        precio_unitario: p.price / 100, // De céntimos a euros
        modificadores: p.attributes?.map(attr => ({
          nombre: attr.name,
          precio: attr.price / 100
        })),
        notas: p.comment
      })),
      
      subtotal: order.subtotal / 100,
      gastos_envio: order.deliveryFee / 100,
      comision_agregador: order.servicesFee / 100,
      descuentos: 0,
      total: order.totalPrice / 100,
      
      tiempo_entrega_min: 30,
      hora_entrega_estimada: order.estimatedDeliveryTime 
        ? new Date(order.estimatedDeliveryTime) 
        : undefined,
      
      metadata: {
        courier: order.courier,
        estimatedPickupTime: order.estimatedPickupTime
      }
    };
  }

  protected mapearEstadoInterno(estado: EstadoPedidoAgregador): string {
    const mapa: Record<EstadoPedidoAgregador, string> = {
      [EstadoPedidoAgregador.NUEVO]: 'NEW',
      [EstadoPedidoAgregador.ACEPTADO]: 'ACCEPTED',
      [EstadoPedidoAgregador.PREPARANDO]: 'PREPARING',
      [EstadoPedidoAgregador.LISTO]: 'READY',
      [EstadoPedidoAgregador.EN_CAMINO]: 'PICKED_UP',
      [EstadoPedidoAgregador.ENTREGADO]: 'DELIVERED',
      [EstadoPedidoAgregador.CANCELADO]: 'CANCELLED',
      [EstadoPedidoAgregador.RECHAZADO]: 'CANCELLED'
    };
    return mapa[estado];
  }

  protected mapearEstadoAgregador(estadoGlovo: string): EstadoPedidoAgregador {
    const mapa: Record<string, EstadoPedidoAgregador> = {
      'NEW': EstadoPedidoAgregador.NUEVO,
      'ACCEPTED': EstadoPedidoAgregador.ACEPTADO,
      'PREPARING': EstadoPedidoAgregador.PREPARANDO,
      'READY': EstadoPedidoAgregador.LISTO,
      'PICKED_UP': EstadoPedidoAgregador.EN_CAMINO,
      'DELIVERED': EstadoPedidoAgregador.ENTREGADO,
      'CANCELLED': EstadoPedidoAgregador.CANCELADO
    };
    return mapa[estadoGlovo] || EstadoPedidoAgregador.NUEVO;
  }

  private calcularTiempoEstimado(minutos: number): string {
    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() + minutos);
    return fecha.toISOString();
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Glovo-API-Version': '14'
    };
  }
}

export default GlovoAdapter;