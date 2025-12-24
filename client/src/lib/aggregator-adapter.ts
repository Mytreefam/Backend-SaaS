/**
 * 🔌 SISTEMA DE AGREGADORES GENÉRICO
 * Arquitectura extensible para conectar cualquier plataforma de delivery/pagos
 * Monei, Glovo, Uber Eats, Just Eat, y cualquier otra futura
 */

// ============================================
// TIPOS BASE
// ============================================

export enum TipoAgregador {
  DELIVERY = 'delivery',
  PAGO = 'pago',
  MARKETPLACE = 'marketplace'
}

export enum EstadoPedidoAgregador {
  NUEVO = 'nuevo',
  ACEPTADO = 'aceptado',
  PREPARANDO = 'preparando',
  LISTO = 'listo',
  EN_CAMINO = 'en_camino',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
  RECHAZADO = 'rechazado'
}

export enum EstadoPagoAgregador {
  PENDIENTE = 'pendiente',
  AUTORIZADO = 'autorizado',
  CAPTURADO = 'capturado',
  CANCELADO = 'cancelado',
  DEVUELTO = 'devuelto',
  ERROR = 'error'
}

// ============================================
// INTERFACES BASE
// ============================================

export interface ConfiguracionAgregador {
  id: string;
  nombre: string;
  tipo: TipoAgregador;
  activo: boolean;
  credenciales: Record<string, string>;
  configuracion: {
    webhookUrl?: string;
    callbackUrl?: string;
    comision?: number;
    tiempoPreparacion?: number;
    radioEntrega?: number;
  };
}

export interface PedidoAgregador {
  id_externo: string;
  agregador: string;
  fecha_creacion: Date;
  estado: EstadoPedidoAgregador;
  
  // Cliente
  cliente: {
    id_externo?: string;
    nombre: string;
    telefono: string;
    email?: string;
  };
  
  // Dirección entrega
  entrega: {
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    notas?: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  
  // Items del pedido
  items: Array<{
    id_externo?: string;
    sku?: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    modificadores?: Array<{
      nombre: string;
      precio: number;
    }>;
    notas?: string;
  }>;
  
  // Totales
  subtotal: number;
  gastos_envio: number;
  comision_agregador: number;
  descuentos: number;
  total: number;
  
  // Tiempo estimado
  tiempo_preparacion_min?: number;
  tiempo_entrega_min?: number;
  hora_entrega_estimada?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface RespuestaAgregador<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface WebhookPayload {
  agregador: string;
  tipo: 'pedido' | 'actualizacion' | 'cancelacion' | 'pago';
  timestamp: Date;
  firma?: string;
  datos: any;
}

// ============================================
// CLASE BASE AGREGADOR
// ============================================

export abstract class AgregadorBase {
  protected config: ConfiguracionAgregador;
  protected baseUrl: string = '';
  
  constructor(config: ConfiguracionAgregador) {
    this.config = config;
  }

  // ============================================
  // MÉTODOS ABSTRACTOS (DEBEN IMPLEMENTARSE)
  // ============================================

  /**
   * Conectar con la API del agregador
   */
  abstract conectar(): Promise<RespuestaAgregador>;

  /**
   * Verificar estado de conexión
   */
  abstract verificarConexion(): Promise<boolean>;

  /**
   * Obtener pedidos nuevos
   */
  abstract obtenerPedidosNuevos(): Promise<RespuestaAgregador<PedidoAgregador[]>>;

  /**
   * Aceptar un pedido
   */
  abstract aceptarPedido(idPedido: string, tiempoPreparacion?: number): Promise<RespuestaAgregador>;

  /**
   * Rechazar un pedido
   */
  abstract rechazarPedido(idPedido: string, motivo: string): Promise<RespuestaAgregador>;

  /**
   * Actualizar estado del pedido
   */
  abstract actualizarEstadoPedido(
    idPedido: string,
    estado: EstadoPedidoAgregador
  ): Promise<RespuestaAgregador>;

  /**
   * Marcar pedido como listo para recoger
   */
  abstract marcarListo(idPedido: string): Promise<RespuestaAgregador>;

  /**
   * Sincronizar menú/productos
   */
  abstract sincronizarMenu(productos: any[]): Promise<RespuestaAgregador>;

  /**
   * Actualizar disponibilidad de producto
   */
  abstract actualizarDisponibilidadProducto(
    sku: string,
    disponible: boolean
  ): Promise<RespuestaAgregador>;

  /**
   * Procesar webhook
   */
  abstract procesarWebhook(payload: WebhookPayload): Promise<RespuestaAgregador>;

  /**
   * Verificar firma de webhook
   */
  abstract verificarFirmaWebhook(payload: any, firma: string): boolean;

  /**
   * Convertir pedido del formato del agregador al formato interno
   */
  abstract convertirPedido(payload: any): Promise<PedidoAgregador>;

  // ============================================
  // MÉTODOS COMUNES
  // ============================================

  /**
   * Hacer request HTTP genérico
   */
  protected async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtener headers de autenticación
   */
  protected getAuthHeaders(): Record<string, string> {
    return {};
  }

  /**
   * Mapear estado interno a estado del agregador
   */
  protected mapearEstadoInterno(estado: EstadoPedidoAgregador): string {
    // Override en cada implementación
    return estado;
  }

  /**
   * Mapear estado del agregador a estado interno
   */
  protected mapearEstadoAgregador(estadoExterno: string): EstadoPedidoAgregador {
    // Override en cada implementación
    return EstadoPedidoAgregador.NUEVO;
  }

  /**
   * Registrar evento
   */
  protected log(tipo: 'info' | 'error' | 'warning', mensaje: string, data?: any) {
    console.log(`[${this.config.nombre}] [${tipo.toUpperCase()}] ${mensaje}`, data || '');
    
    // TODO: Enviar a sistema de logging (Sentry, LogRocket, etc.)
  }

  /**
   * Obtener configuración
   */
  getConfig(): ConfiguracionAgregador {
    return this.config;
  }

  /**
   * Actualizar configuración
   */
  updateConfig(config: Partial<ConfiguracionAgregador>) {
    this.config = { ...this.config, ...config };
  }
}

// ============================================
// GESTOR DE AGREGADORES
// ============================================

export class GestorAgregadores {
  private agregadores: Map<string, AgregadorBase> = new Map();
  private webhookHandlers: Map<string, Function[]> = new Map();

  /**
   * Registrar un agregador
   */
  registrar(id: string, agregador: AgregadorBase) {
    this.agregadores.set(id, agregador);
    this.log('info', `Agregador registrado: ${id}`);
  }

  /**
   * Obtener agregador por ID
   */
  obtener(id: string): AgregadorBase | undefined {
    return this.agregadores.get(id);
  }

  /**
   * Obtener todos los agregadores
   */
  obtenerTodos(): AgregadorBase[] {
    return Array.from(this.agregadores.values());
  }

  /**
   * Obtener agregadores activos
   */
  obtenerActivos(): AgregadorBase[] {
    return this.obtenerTodos().filter(a => a.getConfig().activo);
  }

  /**
   * Obtener agregadores por tipo
   */
  obtenerPorTipo(tipo: TipoAgregador): AgregadorBase[] {
    return this.obtenerTodos().filter(a => a.getConfig().tipo === tipo);
  }

  /**
   * Verificar conexión de todos los agregadores
   */
  async verificarConexiones(): Promise<Record<string, boolean>> {
    const resultados: Record<string, boolean> = {};
    
    for (const [id, agregador] of this.agregadores) {
      try {
        resultados[id] = await agregador.verificarConexion();
      } catch (error) {
        resultados[id] = false;
        this.log('error', `Error verificando ${id}`, error);
      }
    }
    
    return resultados;
  }

  /**
   * Obtener todos los pedidos nuevos de todos los agregadores
   */
  async obtenerTodosPedidosNuevos(): Promise<PedidoAgregador[]> {
    const agregadoresActivos = this.obtenerActivos().filter(
      a => a.getConfig().tipo === TipoAgregador.DELIVERY
    );
    
    const promesas = agregadoresActivos.map(async agregador => {
      try {
        const resultado = await agregador.obtenerPedidosNuevos();
        return resultado.success ? resultado.data || [] : [];
      } catch (error) {
        this.log('error', `Error obteniendo pedidos de ${agregador.getConfig().nombre}`, error);
        return [];
      }
    });
    
    const resultados = await Promise.all(promesas);
    return resultados.flat();
  }

  /**
   * Aceptar pedido en el agregador correspondiente
   */
  async aceptarPedido(
    agregadorId: string,
    idPedido: string,
    tiempoPreparacion?: number
  ): Promise<RespuestaAgregador> {
    const agregador = this.obtener(agregadorId);
    
    if (!agregador) {
      return {
        success: false,
        error: {
          code: 'AGREGADOR_NO_ENCONTRADO',
          message: `No se encontró el agregador ${agregadorId}`
        }
      };
    }
    
    return await agregador.aceptarPedido(idPedido, tiempoPreparacion);
  }

  /**
   * Actualizar estado en todos los agregadores donde existe el pedido
   */
  async actualizarEstadoPedido(
    pedidos: Array<{ agregadorId: string; idPedido: string }>,
    estado: EstadoPedidoAgregador
  ): Promise<Record<string, RespuestaAgregador>> {
    const resultados: Record<string, RespuestaAgregador> = {};
    
    for (const pedido of pedidos) {
      const agregador = this.obtener(pedido.agregadorId);
      if (agregador) {
        resultados[pedido.agregadorId] = await agregador.actualizarEstadoPedido(
          pedido.idPedido,
          estado
        );
      }
    }
    
    return resultados;
  }

  /**
   * Sincronizar menú en todos los agregadores de delivery
   */
  async sincronizarMenuTodos(productos: any[]): Promise<Record<string, RespuestaAgregador>> {
    const agregadoresDelivery = this.obtenerPorTipo(TipoAgregador.DELIVERY)
      .filter(a => a.getConfig().activo);
    
    const resultados: Record<string, RespuestaAgregador> = {};
    
    for (const agregador of agregadoresDelivery) {
      const id = agregador.getConfig().id;
      try {
        resultados[id] = await agregador.sincronizarMenu(productos);
      } catch (error) {
        resultados[id] = {
          success: false,
          error: {
            code: 'ERROR_SINCRONIZACION',
            message: `Error sincronizando con ${id}`,
            details: error
          }
        };
      }
    }
    
    return resultados;
  }

  /**
   * Procesar webhook genérico
   */
  async procesarWebhook(
    agregadorId: string,
    payload: WebhookPayload
  ): Promise<RespuestaAgregador> {
    const agregador = this.obtener(agregadorId);
    
    if (!agregador) {
      return {
        success: false,
        error: {
          code: 'AGREGADOR_NO_ENCONTRADO',
          message: `No se encontró el agregador ${agregadorId}`
        }
      };
    }
    
    // Procesar en el agregador
    const resultado = await agregador.procesarWebhook(payload);
    
    // Ejecutar handlers registrados
    const handlers = this.webhookHandlers.get(agregadorId) || [];
    for (const handler of handlers) {
      try {
        await handler(payload, resultado);
      } catch (error) {
        this.log('error', `Error ejecutando webhook handler para ${agregadorId}`, error);
      }
    }
    
    return resultado;
  }

  /**
   * Registrar handler para webhooks
   */
  onWebhook(agregadorId: string, handler: Function) {
    const handlers = this.webhookHandlers.get(agregadorId) || [];
    handlers.push(handler);
    this.webhookHandlers.set(agregadorId, handlers);
  }

  /**
   * Obtener estadísticas de todos los agregadores
   */
  async obtenerEstadisticas(): Promise<Record<string, any>> {
    const estadisticas: Record<string, any> = {};
    
    for (const [id, agregador] of this.agregadores) {
      const config = agregador.getConfig();
      estadisticas[id] = {
        nombre: config.nombre,
        tipo: config.tipo,
        activo: config.activo,
        conectado: await agregador.verificarConexion()
      };
    }
    
    return estadisticas;
  }

  private log(tipo: 'info' | 'error' | 'warning', mensaje: string, data?: any) {
    console.log(`[GestorAgregadores] [${tipo.toUpperCase()}] ${mensaje}`, data || '');
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const gestorAgregadores = new GestorAgregadores();

// ============================================
// UTILIDADES
// ============================================

/**
 * Normalizar producto para agregadores
 */
export function normalizarProductoParaAgregador(producto: any) {
  return {
    id: producto.id,
    sku: producto.sku,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    categoria: producto.categoria,
    disponible: producto.activo && producto.stock > 0,
    imagen: producto.imagen,
    tiempo_preparacion: producto.tiempo_preparacion || 15
  };
}

/**
 * Calcular comisión del agregador
 */
export function calcularComisionAgregador(
  subtotal: number,
  porcentajeComision: number
): number {
  return Math.round((subtotal * porcentajeComision / 100) * 100) / 100;
}

/**
 * Generar ID único para pedido
 */
export function generarIdPedidoInterno(agregadorId: string, idExterno: string): string {
  return `${agregadorId}_${idExterno}_${Date.now()}`;
}

export default gestorAgregadores;
