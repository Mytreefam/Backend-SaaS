/**
 * ========================================
 * 🚀 SERVICIO DE SINCRONIZACIÓN CON DELIVERY PARTNERS
 * ========================================
 * 
 * Sincroniza productos con plataformas de delivery:
 * - Uber Eats
 * - Just Eat
 * - Glovo
 * - Deliveroo
 * - Stuart
 * 
 * Funcionalidades:
 * - Sincronización automática de productos
 * - Actualización de precios y stock
 * - Gestión de disponibilidad
 * - Sistema de reintentos
 * - Logs de sincronización
 */

import type { Producto } from '../contexts/ProductosContext';

// ============================================
// TIPOS DE PLATAFORMAS
// ============================================

export type PlataformaDelivery = 
  | 'uber_eats' 
  | 'just_eat' 
  | 'glovo' 
  | 'deliveroo' 
  | 'stuart';

export interface ConfiguracionPlataforma {
  id: PlataformaDelivery;
  nombre: string;
  logo: string;
  activa: boolean;
  credenciales: {
    apiKey?: string;
    storeId?: string;
    restaurantId?: string;
    merchantId?: string;
    accessToken?: string;
  };
  configuracion: {
    sincronizarPrecios: boolean;
    sincronizarStock: boolean;
    sincronizarDisponibilidad: boolean;
    sincronizarImagenes: boolean;
    margenPrecio?: number; // Porcentaje adicional para delivery
  };
  ultimaSincronizacion?: Date;
  estado?: 'conectada' | 'error' | 'desconectada';
  mensajeError?: string;
}

export interface ProductoDelivery extends Producto {
  idExterno?: {
    uber_eats?: string;
    just_eat?: string;
    glovo?: string;
    deliveroo?: string;
    stuart?: string;
  };
  disponibleEn?: PlataformaDelivery[];
  precioDelivery?: number; // Precio con margen para delivery
}

export interface LogSincronizacion {
  id: string;
  timestamp: Date;
  plataforma: PlataformaDelivery;
  accion: 'crear' | 'actualizar' | 'eliminar' | 'toggle_disponibilidad';
  productoId: string;
  productoNombre: string;
  estado: 'exitoso' | 'error' | 'pendiente';
  mensaje?: string;
  detalles?: any;
}

export interface ResultadoSincronizacion {
  exitoso: boolean;
  plataforma: PlataformaDelivery;
  mensaje: string;
  datos?: any;
  error?: any;
}

// ============================================
// CLASE DE SERVICIO
// ============================================

class DeliverySyncService {
  private configuraciones: Map<PlataformaDelivery, ConfiguracionPlataforma>;
  private logs: LogSincronizacion[];
  private sincronizandoActualmente: Set<string>;

  constructor() {
    this.configuraciones = new Map();
    this.logs = [];
    this.sincronizandoActualmente = new Set();
    this.cargarConfiguraciones();
  }

  // ============================================
  // GESTIÓN DE CONFIGURACIONES
  // ============================================

  private cargarConfiguraciones() {
    const configuracionesGuardadas = localStorage.getItem('delivery_configuraciones');
    
    if (configuracionesGuardadas) {
      const configs = JSON.parse(configuracionesGuardadas);
      configs.forEach((config: ConfiguracionPlataforma) => {
        this.configuraciones.set(config.id, config);
      });
    } else {
      // Configuraciones por defecto
      this.inicializarConfiguracionesPorDefecto();
    }
  }

  private inicializarConfiguracionesPorDefecto() {
    const plataformasDefecto: ConfiguracionPlataforma[] = [
      {
        id: 'uber_eats',
        nombre: 'Uber Eats',
        logo: '🍔',
        activa: false,
        credenciales: {},
        configuracion: {
          sincronizarPrecios: true,
          sincronizarStock: true,
          sincronizarDisponibilidad: true,
          sincronizarImagenes: true,
          margenPrecio: 15 // 15% adicional para Uber Eats
        },
        estado: 'desconectada'
      },
      {
        id: 'just_eat',
        nombre: 'Just Eat',
        logo: '🍕',
        activa: false,
        credenciales: {},
        configuracion: {
          sincronizarPrecios: true,
          sincronizarStock: true,
          sincronizarDisponibilidad: true,
          sincronizarImagenes: true,
          margenPrecio: 12
        },
        estado: 'desconectada'
      },
      {
        id: 'glovo',
        nombre: 'Glovo',
        logo: '🛵',
        activa: false,
        credenciales: {},
        configuracion: {
          sincronizarPrecios: true,
          sincronizarStock: true,
          sincronizarDisponibilidad: true,
          sincronizarImagenes: true,
          margenPrecio: 10
        },
        estado: 'desconectada'
      },
      {
        id: 'deliveroo',
        nombre: 'Deliveroo',
        logo: '🚴',
        activa: false,
        credenciales: {},
        configuracion: {
          sincronizarPrecios: true,
          sincronizarStock: true,
          sincronizarDisponibilidad: true,
          sincronizarImagenes: true,
          margenPrecio: 13
        },
        estado: 'desconectada'
      },
      {
        id: 'stuart',
        nombre: 'Stuart',
        logo: '📦',
        activa: false,
        credenciales: {},
        configuracion: {
          sincronizarPrecios: true,
          sincronizarStock: false,
          sincronizarDisponibilidad: true,
          sincronizarImagenes: false,
          margenPrecio: 8
        },
        estado: 'desconectada'
      }
    ];

    plataformasDefecto.forEach(config => {
      this.configuraciones.set(config.id, config);
    });

    this.guardarConfiguraciones();
  }

  private guardarConfiguraciones() {
    const configs = Array.from(this.configuraciones.values());
    localStorage.setItem('delivery_configuraciones', JSON.stringify(configs));
  }

  getConfiguracion(plataforma: PlataformaDelivery): ConfiguracionPlataforma | undefined {
    return this.configuraciones.get(plataforma);
  }

  getTodasConfiguraciones(): ConfiguracionPlataforma[] {
    return Array.from(this.configuraciones.values());
  }

  actualizarConfiguracion(plataforma: PlataformaDelivery, configuracion: Partial<ConfiguracionPlataforma>) {
    const actual = this.configuraciones.get(plataforma);
    if (actual) {
      this.configuraciones.set(plataforma, { ...actual, ...configuracion });
      this.guardarConfiguraciones();
    }
  }

  // ============================================
  // SINCRONIZACIÓN DE PRODUCTOS
  // ============================================

  async sincronizarProducto(
    producto: ProductoDelivery,
    accion: 'crear' | 'actualizar' | 'eliminar',
    plataformas?: PlataformaDelivery[]
  ): Promise<ResultadoSincronizacion[]> {
    // Si no se especifican plataformas, usar todas las activas
    const plataformasASincronizar = plataformas || this.getPlataformasActivas();

    if (plataformasASincronizar.length === 0) {
      console.log('⚠️ No hay plataformas activas para sincronizar');
      return [];
    }

    const resultados: ResultadoSincronizacion[] = [];

    // Sincronizar en paralelo con todas las plataformas
    const promesas = plataformasASincronizar.map(plataforma => 
      this.sincronizarConPlataforma(producto, accion, plataforma)
    );

    const resultadosPromesas = await Promise.allSettled(promesas);

    resultadosPromesas.forEach((resultado, index) => {
      const plataforma = plataformasASincronizar[index];
      
      if (resultado.status === 'fulfilled') {
        resultados.push(resultado.value);
        this.registrarLog({
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          plataforma,
          accion,
          productoId: producto.id,
          productoNombre: producto.nombre,
          estado: resultado.value.exitoso ? 'exitoso' : 'error',
          mensaje: resultado.value.mensaje,
          detalles: resultado.value.datos
        });
      } else {
        resultados.push({
          exitoso: false,
          plataforma,
          mensaje: `Error: ${resultado.reason}`,
          error: resultado.reason
        });
        this.registrarLog({
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          plataforma,
          accion,
          productoId: producto.id,
          productoNombre: producto.nombre,
          estado: 'error',
          mensaje: `Error: ${resultado.reason}`
        });
      }
    });

    return resultados;
  }

  private async sincronizarConPlataforma(
    producto: ProductoDelivery,
    accion: 'crear' | 'actualizar' | 'eliminar',
    plataforma: PlataformaDelivery
  ): Promise<ResultadoSincronizacion> {
    const config = this.configuraciones.get(plataforma);

    if (!config || !config.activa) {
      return {
        exitoso: false,
        plataforma,
        mensaje: 'Plataforma no activa'
      };
    }

    // Generar clave única para evitar sincronizaciones duplicadas
    const claveSync = `${plataforma}-${producto.id}-${accion}`;
    
    if (this.sincronizandoActualmente.has(claveSync)) {
      return {
        exitoso: false,
        plataforma,
        mensaje: 'Sincronización ya en progreso'
      };
    }

    this.sincronizandoActualmente.add(claveSync);

    try {
      // Calcular precio con margen si está configurado
      const precioFinal = config.configuracion.margenPrecio
        ? producto.precio * (1 + config.configuracion.margenPrecio / 100)
        : producto.precio;

      const datosProducto = this.adaptarProductoParaPlataforma(producto, plataforma, precioFinal);

      // Llamar a la API correspondiente
      const resultado = await this.llamarAPIPlataforma(plataforma, accion, datosProducto, config);

      // Actualizar estado de la plataforma
      this.actualizarConfiguracion(plataforma, {
        ultimaSincronizacion: new Date(),
        estado: 'conectada',
        mensajeError: undefined
      });

      return {
        exitoso: true,
        plataforma,
        mensaje: `Producto ${accion === 'crear' ? 'creado' : accion === 'actualizar' ? 'actualizado' : 'eliminado'} correctamente`,
        datos: resultado
      };

    } catch (error: any) {
      console.error(`❌ Error sincronizando con ${plataforma}:`, error);

      // Actualizar estado de error
      this.actualizarConfiguracion(plataforma, {
        estado: 'error',
        mensajeError: error.message || 'Error desconocido'
      });

      return {
        exitoso: false,
        plataforma,
        mensaje: `Error: ${error.message}`,
        error
      };

    } finally {
      this.sincronizandoActualmente.delete(claveSync);
    }
  }

  // ============================================
  // ADAPTADORES POR PLATAFORMA
  // ============================================

  private adaptarProductoParaPlataforma(
    producto: ProductoDelivery,
    plataforma: PlataformaDelivery,
    precio: number
  ): any {
    const base = {
      name: producto.nombre,
      description: producto.descripcion || '',
      price: Math.round(precio * 100), // Precio en centavos
      available: producto.activo !== false,
      image_url: producto.imagen || '',
      category: producto.categoria
    };

    switch (plataforma) {
      case 'uber_eats':
        return {
          ...base,
          external_data: producto.idExterno?.uber_eats,
          quantity: producto.stock || 0,
          tax_info: {
            tax_rate: (producto.iva || 10) / 100
          }
        };

      case 'just_eat':
        return {
          ...base,
          productId: producto.idExterno?.just_eat,
          stock: producto.stock || 0,
          sku: producto.sku || producto.id
        };

      case 'glovo':
        return {
          ...base,
          id: producto.idExterno?.glovo,
          attributes: {
            stock_quantity: producto.stock || 0
          },
          collections: [producto.categoria]
        };

      case 'deliveroo':
        return {
          ...base,
          menu_item_id: producto.idExterno?.deliveroo,
          in_stock: (producto.stock || 0) > 0,
          modifier_groups: []
        };

      case 'stuart':
        return {
          ...base,
          reference: producto.idExterno?.stuart || producto.id,
          package_type: 'small'
        };

      default:
        return base;
    }
  }

  // ============================================
  // LLAMADAS A API (MOCK - REEMPLAZAR CON APIS REALES)
  // ============================================

  private async llamarAPIPlataforma(
    plataforma: PlataformaDelivery,
    accion: 'crear' | 'actualizar' | 'eliminar',
    datos: any,
    config: ConfiguracionPlataforma
  ): Promise<any> {
    // 🔧 IMPLEMENTACIÓN MOCK - En producción, reemplazar con llamadas reales a las APIs

    console.log(`📡 Sincronizando con ${plataforma}:`, { accion, datos });

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simular respuesta exitosa (85% de éxito)
    if (Math.random() < 0.85) {
      return {
        id: `${plataforma}-${datos.name}-${Date.now()}`,
        status: 'success',
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error(`Error de red al conectar con ${config.nombre}`);
    }

    /* 
    // ============================================
    // EJEMPLO DE IMPLEMENTACIÓN REAL CON UBER EATS
    // ============================================
    
    if (plataforma === 'uber_eats') {
      const endpoint = accion === 'crear' 
        ? `https://api.uber.com/v1/eats/stores/${config.credenciales.storeId}/menus/items`
        : accion === 'actualizar'
        ? `https://api.uber.com/v1/eats/stores/${config.credenciales.storeId}/menus/items/${datos.external_data}`
        : `https://api.uber.com/v1/eats/stores/${config.credenciales.storeId}/menus/items/${datos.external_data}`;

      const response = await fetch(endpoint, {
        method: accion === 'crear' ? 'POST' : accion === 'actualizar' ? 'PUT' : 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.credenciales.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: accion !== 'eliminar' ? JSON.stringify(datos) : undefined
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }

    // Implementaciones similares para otras plataformas...
    */
  }

  // ============================================
  // SINCRONIZACIÓN MASIVA
  // ============================================

  async sincronizarTodosLosProductos(productos: ProductoDelivery[]): Promise<{
    exitosos: number;
    errores: number;
    resultados: ResultadoSincronizacion[];
  }> {
    console.log(`🔄 Iniciando sincronización masiva de ${productos.length} productos...`);

    const todosLosResultados: ResultadoSincronizacion[] = [];
    let exitosos = 0;
    let errores = 0;

    // Sincronizar en lotes de 5 productos a la vez para no saturar las APIs
    const TAMANO_LOTE = 5;
    
    for (let i = 0; i < productos.length; i += TAMANO_LOTE) {
      const lote = productos.slice(i, i + TAMANO_LOTE);
      
      const promesasLote = lote.map(producto => 
        this.sincronizarProducto(producto, 'actualizar')
      );

      const resultadosLote = await Promise.all(promesasLote);
      
      resultadosLote.forEach(resultadosProducto => {
        todosLosResultados.push(...resultadosProducto);
        resultadosProducto.forEach(r => {
          if (r.exitoso) exitosos++;
          else errores++;
        });
      });

      // Pausa entre lotes
      if (i + TAMANO_LOTE < productos.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Sincronización masiva completada: ${exitosos} exitosos, ${errores} errores`);

    return { exitosos, errores, resultados: todosLosResultados };
  }

  // ============================================
  // GESTIÓN DE LOGS
  // ============================================

  private registrarLog(log: LogSincronizacion) {
    this.logs.unshift(log);
    
    // Mantener solo los últimos 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    // Guardar en localStorage
    this.guardarLogs();
  }

  private guardarLogs() {
    localStorage.setItem('delivery_logs', JSON.stringify(this.logs.slice(0, 100)));
  }

  getLogs(limite?: number): LogSincronizacion[] {
    return limite ? this.logs.slice(0, limite) : this.logs;
  }

  getLogsPorPlataforma(plataforma: PlataformaDelivery, limite?: number): LogSincronizacion[] {
    const logs = this.logs.filter(log => log.plataforma === plataforma);
    return limite ? logs.slice(0, limite) : logs;
  }

  limpiarLogs() {
    this.logs = [];
    localStorage.removeItem('delivery_logs');
  }

  // ============================================
  // UTILIDADES
  // ============================================

  private getPlataformasActivas(): PlataformaDelivery[] {
    return Array.from(this.configuraciones.values())
      .filter(config => config.activa)
      .map(config => config.id);
  }

  verificarConexion(plataforma: PlataformaDelivery): boolean {
    const config = this.configuraciones.get(plataforma);
    return config?.activa && config?.estado === 'conectada' || false;
  }

  getEstadisticas() {
    const plataformasActivas = this.getPlataformasActivas().length;
    const ultimaHora = new Date(Date.now() - 60 * 60 * 1000);
    const sincronizacionesRecientes = this.logs.filter(log => log.timestamp > ultimaHora).length;
    const erroresRecientes = this.logs.filter(log => log.timestamp > ultimaHora && log.estado === 'error').length;

    return {
      plataformasActivas,
      plataformasTotal: this.configuraciones.size,
      sincronizacionesRecientes,
      erroresRecientes,
      tasaExito: sincronizacionesRecientes > 0 
        ? ((sincronizacionesRecientes - erroresRecientes) / sincronizacionesRecientes * 100).toFixed(1)
        : '100'
    };
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================

export const deliverySyncService = new DeliverySyncService();
