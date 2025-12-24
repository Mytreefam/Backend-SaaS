// Sistema de Gestión de Stock - Udar Edge
// Gestor centralizado para actualizar inventario y registrar movimientos

import { stockIngredientes, Ingrediente } from './stock-ingredientes';
import { pedidosProveedores, PedidoProveedor } from './pedidos-proveedores';

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'recepcion' | 'produccion' | 'venta' | 'merma';

export interface MovimientoStock {
  id: string;
  fecha: Date;
  tipo: TipoMovimiento;
  articuloId: string;
  articuloNombre: string;
  cantidad: number;
  cantidadAnterior: number;
  cantidadNueva: number;
  unidad: 'kg' | 'litros' | 'unidades';
  pdv: string; // 'tiana' | 'badalona'
  usuario: string;
  motivo: string;
  referencia?: string; // Número de albarán, pedido, etc.
  observaciones?: string;
}

export interface RecepcionMaterial {
  id: string;
  fecha: Date;
  numeroAlbaran: string;
  proveedorId?: string;
  proveedorNombre: string;
  pedidoRelacionado?: string; // ID del pedido si viene de un pedido previo
  pdvDestino: string;
  materiales: {
    articuloId: string;
    articuloNombre: string;
    articuloCodigo: string;
    cantidadEsperada?: number; // Si viene de un pedido
    cantidadRecibida: number;
    unidad: 'kg' | 'litros' | 'unidades';
    lote?: string;
    caducidad?: string;
    ubicacion: string;
  }[];
  usuarioRecepcion: string;
  observaciones?: string;
  estado: 'completo' | 'parcial' | 'con_diferencias';
}

// Base de datos en memoria (en producción sería Supabase)
class StockManager {
  private movimientos: MovimientoStock[] = [];
  private recepciones: RecepcionMaterial[] = [];
  private stock: Map<string, Ingrediente> = new Map();

  constructor() {
    // Inicializar stock desde datos mock
    stockIngredientes.forEach(ing => {
      this.stock.set(ing.id, { ...ing });
    });
    
    // Cargar movimientos mock
    this.cargarMovimientosMock();
  }

  private cargarMovimientosMock() {
    // Movimientos de ejemplo
    this.movimientos = [
      {
        id: 'MOV-001',
        fecha: new Date('2024-11-22'),
        tipo: 'recepcion',
        articuloId: 'ING-001',
        articuloNombre: 'Harina de trigo',
        cantidad: 100,
        cantidadAnterior: 150,
        cantidadNueva: 250,
        unidad: 'kg',
        pdv: 'tiana',
        usuario: 'María González',
        motivo: 'Recepción de pedido PED-2024-001',
        referencia: 'ALB-2024-0045',
        observaciones: 'Pedido completo sin incidencias'
      },
      {
        id: 'MOV-002',
        fecha: new Date('2024-11-26'),
        tipo: 'recepcion',
        articuloId: 'ING-006',
        articuloNombre: 'Leche entera',
        cantidad: 40,
        cantidadAnterior: 80,
        cantidadNueva: 120,
        unidad: 'litros',
        pdv: 'badalona',
        usuario: 'Carlos Ruiz',
        motivo: 'Recepción de pedido PED-2024-002',
        referencia: 'ALB-2024-0046'
      },
      {
        id: 'MOV-003',
        fecha: new Date('2024-11-28'),
        tipo: 'produccion',
        articuloId: 'ING-001',
        articuloNombre: 'Harina de trigo',
        cantidad: -25,
        cantidadAnterior: 250,
        cantidadNueva: 225,
        unidad: 'kg',
        pdv: 'tiana',
        usuario: 'Sistema',
        motivo: 'Consumo en producción',
        observaciones: 'Producción de pan del día'
      }
    ];
  }

  /**
   * Registra una recepción de material y actualiza el stock
   */
  public registrarRecepcion(recepcion: Omit<RecepcionMaterial, 'id' | 'fecha' | 'estado'>): RecepcionMaterial {
    const nuevaRecepcion: RecepcionMaterial = {
      ...recepcion,
      id: `REC-${Date.now()}`,
      fecha: new Date(),
      estado: 'completo' // Por defecto, se puede calcular según diferencias
    };

    // Actualizar stock y registrar movimientos
    recepcion.materiales.forEach(material => {
      const articulo = this.stock.get(material.articuloId);
      
      if (articulo) {
        const cantidadAnterior = articulo.stock;
        const cantidadNueva = cantidadAnterior + material.cantidadRecibida;
        
        // Actualizar stock
        articulo.stock = cantidadNueva;
        this.stock.set(material.articuloId, articulo);

        // Registrar movimiento
        const movimiento: MovimientoStock = {
          id: `MOV-${Date.now()}-${material.articuloId}`,
          fecha: nuevaRecepcion.fecha,
          tipo: 'recepcion',
          articuloId: material.articuloId,
          articuloNombre: material.articuloNombre,
          cantidad: material.cantidadRecibida,
          cantidadAnterior,
          cantidadNueva,
          unidad: material.unidad,
          pdv: recepcion.pdvDestino,
          usuario: recepcion.usuarioRecepcion,
          motivo: `Recepción - ${recepcion.proveedorNombre}`,
          referencia: recepcion.numeroAlbaran,
          observaciones: recepcion.observaciones
        };

        this.movimientos.push(movimiento);
        
        console.log(`📦 STOCK ACTUALIZADO: ${material.articuloNombre}`, {
          anterior: cantidadAnterior,
          recibido: material.cantidadRecibida,
          nuevo: cantidadNueva,
          unidad: material.unidad
        });
      } else {
        console.warn(`⚠️ Artículo no encontrado en stock: ${material.articuloId}`);
      }
    });

    // Verificar si hay diferencias con el pedido original
    if (recepcion.pedidoRelacionado) {
      const hayDiferencias = recepcion.materiales.some(mat => 
        mat.cantidadEsperada && mat.cantidadEsperada !== mat.cantidadRecibida
      );
      
      if (hayDiferencias) {
        nuevaRecepcion.estado = 'con_diferencias';
      }
    }

    this.recepciones.push(nuevaRecepcion);

    console.log('✅ RECEPCIÓN REGISTRADA', {
      id: nuevaRecepcion.id,
      albaran: nuevaRecepcion.numeroAlbaran,
      proveedor: nuevaRecepcion.proveedorNombre,
      articulos: nuevaRecepcion.materiales.length,
      estado: nuevaRecepcion.estado
    });

    return nuevaRecepcion;
  }

  /**
   * Actualiza el estado de un pedido a proveedor después de recibir materiales
   */
  public actualizarEstadoPedido(pedidoId: string, materialesRecibidos: { articuloId: string; cantidadRecibida: number }[]): void {
    const pedido = pedidosProveedores.find(p => p.id === pedidoId);
    
    if (!pedido) {
      console.warn(`⚠️ Pedido no encontrado: ${pedidoId}`);
      return;
    }

    // Actualizar cantidades recibidas en las líneas del pedido
    materialesRecibidos.forEach(matRecibido => {
      const linea = pedido.lineas.find(l => l.articuloId === matRecibido.articuloId);
      if (linea) {
        linea.cantidadRecibida = (linea.cantidadRecibida || 0) + matRecibido.cantidadRecibida;
      }
    });

    // Determinar nuevo estado del pedido
    const todasLineasCompletas = pedido.lineas.every(l => 
      l.cantidadRecibida && l.cantidadRecibida >= l.cantidad
    );
    
    const algunaLineaParcial = pedido.lineas.some(l => 
      l.cantidadRecibida && l.cantidadRecibida > 0 && l.cantidadRecibida < l.cantidad
    );

    if (todasLineasCompletas) {
      pedido.estado = 'completado';
      pedido.fechaRecepcion = new Date();
      console.log(`✅ Pedido ${pedido.numero} marcado como COMPLETADO`);
    } else if (algunaLineaParcial) {
      pedido.estado = 'parcial';
      console.log(`⚠️ Pedido ${pedido.numero} marcado como PARCIAL`);
    }
  }

  /**
   * Registra una salida de stock (producción, venta, merma)
   */
  public registrarSalida(
    articuloId: string,
    cantidad: number,
    tipo: 'produccion' | 'venta' | 'merma',
    pdv: string,
    usuario: string,
    motivo: string,
    referencia?: string,
    observaciones?: string
  ): MovimientoStock | null {
    const articulo = this.stock.get(articuloId);
    
    if (!articulo) {
      console.error(`❌ Artículo no encontrado: ${articuloId}`);
      return null;
    }

    if (articulo.stock < cantidad) {
      console.error(`❌ Stock insuficiente: ${articulo.nombre}. Disponible: ${articulo.stock}, Solicitado: ${cantidad}`);
      return null;
    }

    const cantidadAnterior = articulo.stock;
    const cantidadNueva = cantidadAnterior - cantidad;

    // Actualizar stock
    articulo.stock = cantidadNueva;
    this.stock.set(articuloId, articulo);

    // Registrar movimiento
    const movimiento: MovimientoStock = {
      id: `MOV-${Date.now()}-${articuloId}`,
      fecha: new Date(),
      tipo,
      articuloId,
      articuloNombre: articulo.nombre,
      cantidad: -cantidad,
      cantidadAnterior,
      cantidadNueva,
      unidad: articulo.unidad,
      pdv,
      usuario,
      motivo,
      referencia,
      observaciones
    };

    this.movimientos.push(movimiento);

    console.log(`📤 SALIDA REGISTRADA: ${articulo.nombre}`, {
      cantidad,
      anterior: cantidadAnterior,
      nuevo: cantidadNueva,
      motivo
    });

    return movimiento;
  }

  /**
   * Registra un ajuste de inventario (corrección manual)
   */
  public registrarAjuste(
    articuloId: string,
    cantidadNueva: number,
    pdv: string,
    usuario: string,
    motivo: string,
    observaciones?: string
  ): MovimientoStock | null {
    const articulo = this.stock.get(articuloId);
    
    if (!articulo) {
      console.error(`❌ Artículo no encontrado: ${articuloId}`);
      return null;
    }

    const cantidadAnterior = articulo.stock;
    const diferencia = cantidadNueva - cantidadAnterior;

    // Actualizar stock
    articulo.stock = cantidadNueva;
    this.stock.set(articuloId, articulo);

    // Registrar movimiento
    const movimiento: MovimientoStock = {
      id: `MOV-${Date.now()}-${articuloId}`,
      fecha: new Date(),
      tipo: 'ajuste',
      articuloId,
      articuloNombre: articulo.nombre,
      cantidad: diferencia,
      cantidadAnterior,
      cantidadNueva,
      unidad: articulo.unidad,
      pdv,
      usuario,
      motivo,
      observaciones
    };

    this.movimientos.push(movimiento);

    console.log(`🔧 AJUSTE REGISTRADO: ${articulo.nombre}`, {
      anterior: cantidadAnterior,
      nuevo: cantidadNueva,
      diferencia,
      motivo
    });

    return movimiento;
  }

  /**
   * Obtiene el stock actual de todos los artículos
   */
  public getStock(): Map<string, Ingrediente> {
    return this.stock;
  }

  /**
   * Obtiene el stock como array
   */
  public getStockArray(): Ingrediente[] {
    return Array.from(this.stock.values());
  }

  /**
   * Obtiene el stock de un artículo específico
   */
  public getStockArticulo(articuloId: string): Ingrediente | undefined {
    return this.stock.get(articuloId);
  }

  /**
   * Obtiene todos los movimientos de stock
   */
  public getMovimientos(filtros?: {
    articuloId?: string;
    tipo?: TipoMovimiento;
    pdv?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): MovimientoStock[] {
    let movimientosFiltrados = [...this.movimientos];

    if (filtros) {
      if (filtros.articuloId) {
        movimientosFiltrados = movimientosFiltrados.filter(m => m.articuloId === filtros.articuloId);
      }
      if (filtros.tipo) {
        movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo === filtros.tipo);
      }
      if (filtros.pdv) {
        movimientosFiltrados = movimientosFiltrados.filter(m => m.pdv === filtros.pdv);
      }
      if (filtros.fechaDesde) {
        movimientosFiltrados = movimientosFiltrados.filter(m => m.fecha >= filtros.fechaDesde!);
      }
      if (filtros.fechaHasta) {
        movimientosFiltrados = movimientosFiltrados.filter(m => m.fecha <= filtros.fechaHasta!);
      }
    }

    return movimientosFiltrados.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  /**
   * Obtiene todas las recepciones
   */
  public getRecepciones(): RecepcionMaterial[] {
    return [...this.recepciones].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }

  /**
   * Obtiene artículos con stock bajo
   */
  public getArticulosStockBajo(umbral: number = 50): Ingrediente[] {
    return Array.from(this.stock.values()).filter(art => art.stock < umbral && art.stock > 0);
  }

  /**
   * Obtiene artículos sin stock
   */
  public getArticulosSinStock(): Ingrediente[] {
    return Array.from(this.stock.values()).filter(art => art.stock === 0);
  }

  /**
   * Registra un movimiento de stock genérico
   * Usado por stock-integration.service para ventas
   */
  public registrarMovimiento(datos: {
    tipo: TipoMovimiento;
    articuloId: string;
    articuloNombre: string;
    cantidad: number; // Positivo = entrada, Negativo = salida
    unidad: 'kg' | 'litros' | 'unidades';
    pdv: string;
    usuario: string;
    motivo: string;
    referencia?: string;
    observaciones?: string;
  }): MovimientoStock {
    const articulo = this.stock.get(datos.articuloId);
    
    if (!articulo) {
      throw new Error(`Artículo no encontrado: ${datos.articuloId}`);
    }

    const cantidadAnterior = articulo.stock;
    const cantidadNueva = cantidadAnterior + datos.cantidad;

    // Validar que no quede stock negativo
    if (cantidadNueva < 0) {
      throw new Error(
        `Stock insuficiente de "${articulo.nombre}". ` +
        `Disponible: ${articulo.stock} ${articulo.unidad}, ` +
        `Solicitado: ${Math.abs(datos.cantidad)} ${articulo.unidad}`
      );
    }

    // Actualizar stock
    articulo.stock = cantidadNueva;
    this.stock.set(datos.articuloId, articulo);

    // Crear movimiento
    const movimiento: MovimientoStock = {
      id: `MOV-${Date.now()}-${datos.articuloId}`,
      fecha: new Date(),
      tipo: datos.tipo,
      articuloId: datos.articuloId,
      articuloNombre: datos.articuloNombre,
      cantidad: datos.cantidad,
      cantidadAnterior,
      cantidadNueva,
      unidad: datos.unidad,
      pdv: datos.pdv,
      usuario: datos.usuario,
      motivo: datos.motivo,
      referencia: datos.referencia,
      observaciones: datos.observaciones
    };

    this.movimientos.push(movimiento);

    console.log(`📝 MOVIMIENTO REGISTRADO: ${datos.articuloNombre}`, {
      tipo: datos.tipo,
      cantidad: datos.cantidad,
      anterior: cantidadAnterior,
      nuevo: cantidadNueva
    });

    return movimiento;
  }
}

// Instancia única (Singleton)
export const stockManager = new StockManager();

// Helpers para uso rápido
export const registrarRecepcion = (recepcion: Omit<RecepcionMaterial, 'id' | 'fecha' | 'estado'>) => 
  stockManager.registrarRecepcion(recepcion);

export const registrarSalida = (
  articuloId: string,
  cantidad: number,
  tipo: 'produccion' | 'venta' | 'merma',
  pdv: string,
  usuario: string,
  motivo: string,
  referencia?: string,
  observaciones?: string
) => stockManager.registrarSalida(articuloId, cantidad, tipo, pdv, usuario, motivo, referencia, observaciones);

export const registrarAjuste = (
  articuloId: string,
  cantidadNueva: number,
  pdv: string,
  usuario: string,
  motivo: string,
  observaciones?: string
) => stockManager.registrarAjuste(articuloId, cantidadNueva, pdv, usuario, motivo, observaciones);

export const getStockActual = () => stockManager.getStock();
export const getMovimientos = (filtros?: Parameters<typeof stockManager.getMovimientos>[0]) => 
  stockManager.getMovimientos(filtros);
export const getArticulosStockBajo = (umbral?: number) => stockManager.getArticulosStockBajo(umbral);
export const getArticulosSinStock = () => stockManager.getArticulosSinStock();
