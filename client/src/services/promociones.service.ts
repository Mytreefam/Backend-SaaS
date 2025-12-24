/**
 * 🎯 SERVICIO CENTRALIZADO DE PROMOCIONES
 * Sistema Master que conecta Gerente → Cliente → TPV
 */

import { 
  promocionesDisponibles, 
  type PromocionDisponible,
  type TipoPromocion,
  type PublicoObjetivo,
  type CanalPromocion
} from '../data/promociones-disponibles';

// ============================================
// TIPOS Y INTERFACES
// ============================================

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria?: string;
  promocionAplicada?: PromocionDisponible;
  descuentoAplicado?: number;
}

export interface ResultadoAplicacionPromocion {
  exito: boolean;
  mensaje: string;
  descuentoTotal: number;
  itemsAfectados: ItemCarrito[];
  promocionAplicada?: PromocionDisponible;
}

export interface ValidacionPromocion {
  valida: boolean;
  razon?: string;
}

// ============================================
// EVENT EMITTER - SISTEMA DE EVENTOS
// ============================================

type PromocionEventType = 
  | 'promocion_creada'
  | 'promocion_actualizada'
  | 'promocion_eliminada'
  | 'promocion_activada'
  | 'promocion_desactivada';

interface PromocionEvent {
  tipo: PromocionEventType;
  promocion: PromocionDisponible;
  timestamp: Date;
}

class PromocionEventEmitter {
  private listeners: Map<PromocionEventType, Array<(event: PromocionEvent) => void>> = new Map();

  on(tipo: PromocionEventType, callback: (event: PromocionEvent) => void) {
    if (!this.listeners.has(tipo)) {
      this.listeners.set(tipo, []);
    }
    this.listeners.get(tipo)!.push(callback);
  }

  off(tipo: PromocionEventType, callback: (event: PromocionEvent) => void) {
    const callbacks = this.listeners.get(tipo);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(tipo: PromocionEventType, promocion: PromocionDisponible) {
    const event: PromocionEvent = {
      tipo,
      promocion,
      timestamp: new Date()
    };

    const callbacks = this.listeners.get(tipo);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }

    // Log para debugging
    console.log(`[PromocionesService] Evento emitido: ${tipo}`, promocion.nombre);
  }
}

export const promocionEventEmitter = new PromocionEventEmitter();

// ============================================
// SERVICIO PRINCIPAL
// ============================================

class PromocionesService {
  private promociones: PromocionDisponible[] = [...promocionesDisponibles];

  // ============================================
  // OBTENER PROMOCIONES
  // ============================================

  /**
   * Obtiene todas las promociones
   */
  obtenerTodas(): PromocionDisponible[] {
    return [...this.promociones];
  }

  /**
   * Obtiene promociones activas (dentro del rango de fechas)
   */
  obtenerActivas(): PromocionDisponible[] {
    const hoy = new Date();
    return this.promociones.filter(p => {
      if (!p.activa) return false;
      const inicio = new Date(p.fechaInicio);
      const fin = new Date(p.fechaFin);
      return hoy >= inicio && hoy <= fin;
    });
  }

  /**
   * Obtiene promociones para un cliente específico
   */
  obtenerParaCliente(clienteId: string, segmento: string = 'general', canal: CanalPromocion = 'ambos'): PromocionDisponible[] {
    const activas = this.obtenerActivas();
    
    return activas.filter(p => {
      // Filtrar por canal
      if (p.canal !== 'ambos' && p.canal !== canal) {
        return false;
      }

      // Promociones personalizadas
      if (p.publicoObjetivo === 'personalizado') {
        return p.clientesAsignados?.includes(clienteId);
      }
      
      // Promociones por segmento
      if (p.publicoObjetivo !== 'general') {
        return p.publicoObjetivo === segmento.toLowerCase();
      }
      
      // Promociones generales
      return p.publicoObjetivo === 'general';
    });
  }

  /**
   * Obtiene promociones disponibles en el horario actual
   */
  obtenerPorHorario(): PromocionDisponible[] {
    const activas = this.obtenerActivas();
    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    return activas.filter(p => {
      if (!p.horaInicio || !p.horaFin) return true;
      return horaActual >= p.horaInicio && horaActual <= p.horaFin;
    });
  }

  /**
   * Busca una promoción por ID
   */
  buscarPorId(id: string): PromocionDisponible | undefined {
    return this.promociones.find(p => p.id === id);
  }

  /**
   * Busca promociones por tipo
   */
  buscarPorTipo(tipo: TipoPromocion): PromocionDisponible[] {
    return this.obtenerActivas().filter(p => p.tipo === tipo);
  }

  /**
   * Obtiene promociones destacadas
   */
  obtenerDestacadas(): PromocionDisponible[] {
    return this.obtenerActivas().filter(p => p.destacada === true);
  }

  // ============================================
  // CRUD - GERENTE
  // ============================================

  /**
   * Crea una nueva promoción
   */
  crear(promocion: Omit<PromocionDisponible, 'id'>): PromocionDisponible {
    const nuevaPromocion: PromocionDisponible = {
      ...promocion,
      id: `PROMO-${Date.now()}`,
      vecesUsada: 0,
      clientesQueUsaron: []
    };

    this.promociones.push(nuevaPromocion);
    promocionEventEmitter.emit('promocion_creada', nuevaPromocion);

    return nuevaPromocion;
  }

  /**
   * Actualiza una promoción existente
   */
  actualizar(id: string, cambios: Partial<PromocionDisponible>): PromocionDisponible | null {
    const index = this.promociones.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.promociones[index] = {
      ...this.promociones[index],
      ...cambios
    };

    promocionEventEmitter.emit('promocion_actualizada', this.promociones[index]);
    return this.promociones[index];
  }

  /**
   * Elimina una promoción
   */
  eliminar(id: string): boolean {
    const index = this.promociones.findIndex(p => p.id === id);
    if (index === -1) return false;

    const promocionEliminada = this.promociones[index];
    this.promociones.splice(index, 1);
    promocionEventEmitter.emit('promocion_eliminada', promocionEliminada);

    return true;
  }

  /**
   * Activa/Desactiva una promoción
   */
  toggleActivacion(id: string): PromocionDisponible | null {
    const promocion = this.buscarPorId(id);
    if (!promocion) return null;

    const actualizada = this.actualizar(id, { activa: !promocion.activa });
    if (actualizada) {
      const evento = actualizada.activa ? 'promocion_activada' : 'promocion_desactivada';
      promocionEventEmitter.emit(evento, actualizada);
    }

    return actualizada;
  }

  // ============================================
  // VALIDACIÓN DE PROMOCIONES
  // ============================================

  /**
   * Valida si una promoción es aplicable
   */
  validarPromocion(promocion: PromocionDisponible, carrito: ItemCarrito[]): ValidacionPromocion {
    // Verificar si está activa
    if (!promocion.activa) {
      return { valida: false, razon: 'La promoción no está activa' };
    }

    // Verificar fechas
    const hoy = new Date();
    const inicio = new Date(promocion.fechaInicio);
    const fin = new Date(promocion.fechaFin);
    if (hoy < inicio || hoy > fin) {
      return { valida: false, razon: 'La promoción no está dentro del período válido' };
    }

    // Verificar horario
    if (promocion.horaInicio && promocion.horaFin) {
      const ahora = new Date();
      const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
      if (horaActual < promocion.horaInicio || horaActual > promocion.horaFin) {
        return { valida: false, razon: `Promoción válida solo de ${promocion.horaInicio} a ${promocion.horaFin}` };
      }
    }

    // Verificar cantidad mínima
    if (promocion.cantidadMinima) {
      const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
      if (totalItems < promocion.cantidadMinima) {
        return { valida: false, razon: `Se requiere un mínimo de ${promocion.cantidadMinima} productos` };
      }
    }

    // Verificar productos aplicables (para combos)
    if (promocion.tipo === 'combo_pack' && promocion.productosIncluidos) {
      const productosIds = promocion.productosIncluidos.map(p => p.id);
      const tieneProductos = productosIds.every(id => 
        carrito.some(item => item.id === id)
      );
      if (!tieneProductos) {
        return { valida: false, razon: 'No tienes todos los productos necesarios para el combo' };
      }
    }

    return { valida: true };
  }

  // ============================================
  // APLICACIÓN DE PROMOCIONES AL CARRITO
  // ============================================

  /**
   * Aplica una promoción al carrito
   */
  aplicarAlCarrito(
    promocion: PromocionDisponible, 
    carrito: ItemCarrito[]
  ): ResultadoAplicacionPromocion {
    // Validar promoción
    const validacion = this.validarPromocion(promocion, carrito);
    if (!validacion.valida) {
      return {
        exito: false,
        mensaje: validacion.razon || 'Promoción no válida',
        descuentoTotal: 0,
        itemsAfectados: []
      };
    }

    // Aplicar según tipo
    switch (promocion.tipo) {
      case 'descuento_porcentaje':
        return this.aplicarDescuentoPorcentaje(promocion, carrito);
      
      case 'descuento_fijo':
        return this.aplicarDescuentoFijo(promocion, carrito);
      
      case '2x1':
        return this.aplicar2x1(promocion, carrito);
      
      case '3x2':
        return this.aplicar3x2(promocion, carrito);
      
      case 'combo_pack':
        return this.aplicarCombo(promocion, carrito);
      
      default:
        return {
          exito: false,
          mensaje: 'Tipo de promoción no soportado',
          descuentoTotal: 0,
          itemsAfectados: []
        };
    }
  }

  /**
   * Calcula el descuento total de todas las promociones activas aplicables
   */
  calcularDescuentosAutomaticos(carrito: ItemCarrito[], clienteId?: string, segmento?: string): ResultadoAplicacionPromocion[] {
    const promocionesAplicables = clienteId 
      ? this.obtenerParaCliente(clienteId, segmento || 'general')
      : this.obtenerActivas();

    const resultados: ResultadoAplicacionPromocion[] = [];

    for (const promocion of promocionesAplicables) {
      const resultado = this.aplicarAlCarrito(promocion, carrito);
      if (resultado.exito) {
        resultados.push(resultado);
      }
    }

    return resultados;
  }

  // ============================================
  // MÉTODOS PRIVADOS - APLICACIÓN POR TIPO
  // ============================================

  private aplicarDescuentoPorcentaje(
    promocion: PromocionDisponible, 
    carrito: ItemCarrito[]
  ): ResultadoAplicacionPromocion {
    const itemsAfectados: ItemCarrito[] = [];
    let descuentoTotal = 0;

    for (const item of carrito) {
      // Verificar si aplica por producto o categoría
      const aplica = this.verificarAplicabilidad(item, promocion);
      
      if (aplica) {
        const descuentoItem = (item.precio * item.cantidad) * (promocion.valor / 100);
        descuentoTotal += descuentoItem;
        
        itemsAfectados.push({
          ...item,
          promocionAplicada: promocion,
          descuentoAplicado: descuentoItem
        });
      }
    }

    return {
      exito: itemsAfectados.length > 0,
      mensaje: `${promocion.valor}% de descuento aplicado`,
      descuentoTotal,
      itemsAfectados,
      promocionAplicada: promocion
    };
  }

  private aplicarDescuentoFijo(
    promocion: PromocionDisponible, 
    carrito: ItemCarrito[]
  ): ResultadoAplicacionPromocion {
    const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const descuentoTotal = Math.min(promocion.valor, totalCarrito);

    return {
      exito: true,
      mensaje: `${descuentoTotal.toFixed(2)}€ de descuento aplicado`,
      descuentoTotal,
      itemsAfectados: carrito,
      promocionAplicada: promocion
    };
  }

  private aplicar2x1(
    promocion: PromocionDisponible, 
    carrito: ItemCarrito[]
  ): ResultadoAplicacionPromocion {
    const itemsAfectados: ItemCarrito[] = [];
    let descuentoTotal = 0;

    for (const item of carrito) {
      const aplica = this.verificarAplicabilidad(item, promocion);
      
      if (aplica && item.cantidad >= 2) {
        const unidadesGratis = Math.floor(item.cantidad / 2);
        const descuentoItem = unidadesGratis * item.precio;
        descuentoTotal += descuentoItem;
        
        itemsAfectados.push({
          ...item,
          promocionAplicada: promocion,
          descuentoAplicado: descuentoItem
        });
      }
    }

    return {
      exito: itemsAfectados.length > 0,
      mensaje: '2x1 aplicado - Pagas 1 y llevas 2',
      descuentoTotal,
      itemsAfectados,
      promocionAplicada: promocion
    };
  }

  private aplicar3x2(
    promocion: PromocionDisponible, 
    carrito: ItemCarrito[]
  ): ResultadoAplicacionPromocion {
    const itemsAfectados: ItemCarrito[] = [];
    let descuentoTotal = 0;

    for (const item of carrito) {
      const aplica = this.verificarAplicabilidad(item, promocion);
      
      if (aplica && item.cantidad >= 3) {
        const unidadesGratis = Math.floor(item.cantidad / 3);
        const descuentoItem = unidadesGratis * item.precio;
        descuentoTotal += descuentoItem;
        
        itemsAfectados.push({
          ...item,
          promocionAplicada: promocion,
          descuentoAplicado: descuentoItem
        });
      }
    }

    return {
      exito: itemsAfectados.length > 0,
      mensaje: '3x2 aplicado - Pagas 2 y llevas 3',
      descuentoTotal,
      itemsAfectados,
      promocionAplicada: promocion
    };
  }

  private aplicarCombo(
    promocion: PromocionDisponible, 
    carrito: ItemCarrito[]
  ): ResultadoAplicacionPromocion {
    if (!promocion.productosIncluidos || !promocion.precioCombo) {
      return {
        exito: false,
        mensaje: 'Configuración de combo inválida',
        descuentoTotal: 0,
        itemsAfectados: []
      };
    }

    // Calcular precio original del combo
    const precioOriginal = promocion.productosIncluidos.reduce(
      (sum, p) => sum + p.precioOriginal, 0
    );

    const descuentoTotal = precioOriginal - promocion.precioCombo;

    return {
      exito: true,
      mensaje: `Combo aplicado - Ahorro de ${descuentoTotal.toFixed(2)}€`,
      descuentoTotal,
      itemsAfectados: carrito,
      promocionAplicada: promocion
    };
  }

  /**
   * Verifica si un item es aplicable a una promoción
   */
  private verificarAplicabilidad(item: ItemCarrito, promocion: PromocionDisponible): boolean {
    // Por producto específico
    if (promocion.productoIdAplicable) {
      return item.id === promocion.productoIdAplicable;
    }

    // Por categoría
    if (promocion.categoriaAplicable) {
      return item.categoria === promocion.categoriaAplicable;
    }

    // Aplica a todos
    return true;
  }

  // ============================================
  // MÉTRICAS Y ESTADÍSTICAS
  // ============================================

  /**
   * Registra el uso de una promoción
   */
  registrarUso(promocionId: string, clienteId: string): void {
    const promocion = this.buscarPorId(promocionId);
    if (!promocion) return;

    const vecesUsada = (promocion.vecesUsada || 0) + 1;
    const clientesQueUsaron = promocion.clientesQueUsaron || [];
    
    if (!clientesQueUsaron.includes(clienteId)) {
      clientesQueUsaron.push(clienteId);
    }

    this.actualizar(promocionId, {
      vecesUsada,
      clientesQueUsaron
    });
  }

  /**
   * Obtiene estadísticas de una promoción
   */
  obtenerEstadisticas(promocionId: string) {
    const promocion = this.buscarPorId(promocionId);
    if (!promocion) return null;

    return {
      vecesUsada: promocion.vecesUsada || 0,
      clientesUnicos: promocion.clientesQueUsaron?.length || 0,
      activa: promocion.activa,
      fechaInicio: promocion.fechaInicio,
      fechaFin: promocion.fechaFin
    };
  }
}

// ============================================
// SINGLETON - INSTANCIA ÚNICA
// ============================================

export const promocionesService = new PromocionesService();
export default promocionesService;
