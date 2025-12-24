/**
 * 🎫 SERVICIO DE CUPONES
 * Gestión completa de cupones de descuento
 */

import { toast } from 'sonner@2.0.3';
import type {
  Cupon,
  RegistroUsoCupon,
  ResultadoValidacionCupon,
  AplicacionCupon,
  FiltrosCupones,
  EstadisticasCupones,
  SolicitudCrearCupon,
  ResultadoCrearCupon,
  SolicitudAplicarCupon,
  MotivoRechazo
} from '../types/cupon.types';

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEY = 'udar_cupones';
const CONTADOR_KEY = 'udar_contador_cupones';

// ============================================
// CUPONES INICIALES (MOCK)
// ============================================

const CUPONES_INICIALES: Cupon[] = [
  {
    id: 'CUP-001',
    codigo: 'BIENVENIDA10',
    tipo: 'porcentaje',
    valor: 10,
    nombre: 'Cupón de Bienvenida',
    descripcion: '10% de descuento en tu primera compra',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2025-12-31',
    compraMinima: 10,
    usosPorCliente: 1,
    usosTotal: 1000,
    usosActuales: 0,
    nuevosClientesOnly: true,
    canal: 'ambos',
    acumulableConOtros: false,
    acumulableConCupones: false,
    origen: 'automatico',
    clientesQueUsaron: [],
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-001'
  },
  {
    id: 'CUP-002',
    codigo: 'VERANO2024',
    tipo: 'fijo',
    valor: 5,
    nombre: 'Cupón de Verano',
    descripcion: '5€ de descuento en compras superiores a 20€',
    activo: true,
    fechaInicio: '2024-06-01',
    fechaFin: '2024-09-30',
    compraMinima: 20,
    usosPorCliente: 3,
    usosTotal: 500,
    usosActuales: 0,
    canal: 'ambos',
    acumulableConOtros: true,
    acumulableConCupones: false,
    origen: 'manual',
    clientesQueUsaron: [],
    fechaCreacion: '2024-06-01T00:00:00Z',
    creadoPor: 'GERENTE-001',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-001'
  },
  {
    id: 'CUP-003',
    codigo: 'VIP20',
    tipo: 'porcentaje',
    valor: 20,
    nombre: 'Cupón VIP',
    descripcion: '20% de descuento exclusivo para clientes VIP',
    activo: true,
    fechaInicio: '2024-01-01',
    fechaFin: '2025-12-31',
    usosPorCliente: 10,
    usosTotal: 10000,
    usosActuales: 0,
    segmentosPermitidos: ['vip', 'frecuente'],
    canal: 'ambos',
    acumulableConOtros: false,
    acumulableConCupones: false,
    origen: 'fidelizacion',
    clientesQueUsaron: [],
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-001'
  }
];

// ============================================
// GESTIÓN DE STORAGE
// ============================================

class CuponesStorage {
  private getCupones(): Cupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Inicializar con cupones de ejemplo
        this.saveCupones(CUPONES_INICIALES);
        return CUPONES_INICIALES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error leyendo cupones:', error);
      return CUPONES_INICIALES;
    }
  }

  private saveCupones(cupones: Cupon[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cupones));
      // Emitir evento para sincronización
      window.dispatchEvent(new CustomEvent('cupones-updated'));
    } catch (error) {
      console.error('Error guardando cupones:', error);
      throw new Error('No se pudo guardar el cupón');
    }
  }

  private getContador(): number {
    try {
      const contador = localStorage.getItem(CONTADOR_KEY);
      return contador ? parseInt(contador, 10) : CUPONES_INICIALES.length;
    } catch (error) {
      return CUPONES_INICIALES.length;
    }
  }

  private incrementarContador(): number {
    const contador = this.getContador() + 1;
    localStorage.setItem(CONTADOR_KEY, contador.toString());
    return contador;
  }

  // ============================================
  // CRUD CUPONES
  // ============================================

  crear(solicitud: SolicitudCrearCupon, creadoPor: string): ResultadoCrearCupon {
    try {
      const cupones = this.getCupones();
      
      // Validar código único
      const codigoExiste = cupones.some(c => 
        c.codigo.toUpperCase() === solicitud.codigo.toUpperCase()
      );
      
      if (codigoExiste) {
        return {
          exito: false,
          error: 'Ya existe un cupón con este código'
        };
      }
      
      // Crear cupón
      const contador = this.incrementarContador();
      const nuevoCupon: Cupon = {
        id: `CUP-${contador.toString().padStart(3, '0')}`,
        codigo: solicitud.codigo.toUpperCase(),
        tipo: solicitud.tipo,
        valor: solicitud.valor,
        nombre: solicitud.nombre,
        descripcion: solicitud.descripcion,
        activo: true,
        fechaInicio: solicitud.fechaInicio,
        fechaFin: solicitud.fechaFin,
        compraMinima: solicitud.compraMinima,
        usosPorCliente: solicitud.usosPorCliente,
        usosTotal: solicitud.usosTotal,
        usosActuales: 0,
        canal: solicitud.canal,
        acumulableConOtros: solicitud.acumulableConOtros,
        acumulableConCupones: false, // Por defecto no acumulable con otros cupones
        origen: 'manual',
        clientesQueUsaron: [],
        fechaCreacion: new Date().toISOString(),
        creadoPor,
        empresaId: 'EMP-001', // TODO: Obtener de contexto
        marcaId: 'MARCA-001'
      };
      
      cupones.push(nuevoCupon);
      this.saveCupones(cupones);
      
      return {
        exito: true,
        cupon: nuevoCupon
      };
      
    } catch (error: any) {
      return {
        exito: false,
        error: error.message || 'Error al crear el cupón'
      };
    }
  }

  obtenerTodos(filtros: FiltrosCupones = {}): Cupon[] {
    let cupones = this.getCupones();
    
    // Filtro por activo
    if (filtros.activo !== undefined) {
      cupones = cupones.filter(c => c.activo === filtros.activo);
    }
    
    // Filtro por tipo
    if (filtros.tipo) {
      cupones = cupones.filter(c => c.tipo === filtros.tipo);
    }
    
    // Filtro por origen
    if (filtros.origen) {
      cupones = cupones.filter(c => c.origen === filtros.origen);
    }
    
    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      cupones = cupones.filter(c => 
        c.codigo.toLowerCase().includes(busqueda) ||
        c.nombre.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por vigencia
    if (filtros.vigentes) {
      const ahora = new Date().toISOString();
      cupones = cupones.filter(c => 
        c.fechaInicio <= ahora && c.fechaFin >= ahora
      );
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    return cupones.sort((a, b) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  }

  obtenerPorCodigo(codigo: string): Cupon | null {
    const cupones = this.getCupones();
    return cupones.find(c => c.codigo.toUpperCase() === codigo.toUpperCase()) || null;
  }

  obtenerPorId(id: string): Cupon | null {
    const cupones = this.getCupones();
    return cupones.find(c => c.id === id) || null;
  }

  actualizar(id: string, cambios: Partial<Cupon>): Cupon | null {
    try {
      const cupones = this.getCupones();
      const index = cupones.findIndex(c => c.id === id);
      
      if (index === -1) {
        return null;
      }
      
      cupones[index] = { ...cupones[index], ...cambios };
      this.saveCupones(cupones);
      
      return cupones[index];
    } catch (error) {
      console.error('Error actualizando cupón:', error);
      return null;
    }
  }

  eliminar(id: string): boolean {
    try {
      const cupones = this.getCupones();
      const nuevosCupones = cupones.filter(c => c.id !== id);
      
      if (nuevosCupones.length === cupones.length) {
        return false; // No se encontró
      }
      
      this.saveCupones(nuevosCupones);
      return true;
    } catch (error) {
      console.error('Error eliminando cupón:', error);
      return false;
    }
  }

  toggleActivacion(id: string): Cupon | null {
    const cupon = this.obtenerPorId(id);
    if (!cupon) return null;
    
    return this.actualizar(id, { activo: !cupon.activo });
  }

  // ============================================
  // VALIDACIÓN
  // ============================================

  validar(solicitud: SolicitudAplicarCupon): ResultadoValidacionCupon {
    const cupon = this.obtenerPorCodigo(solicitud.codigo);
    
    // No existe
    if (!cupon) {
      return {
        valido: false,
        error: 'Cupón no válido',
        motivoRechazo: 'no_existe'
      };
    }
    
    // Inactivo
    if (!cupon.activo) {
      return {
        valido: false,
        cupon,
        error: 'Este cupón está deshabilitado',
        motivoRechazo: 'inactivo'
      };
    }
    
    // Verificar fechas
    const ahora = new Date();
    const fechaInicio = new Date(cupon.fechaInicio);
    const fechaFin = new Date(cupon.fechaFin);
    
    if (ahora < fechaInicio) {
      return {
        valido: false,
        cupon,
        error: 'Este cupón todavía no está activo',
        motivoRechazo: 'no_iniciado'
      };
    }
    
    if (ahora > fechaFin) {
      return {
        valido: false,
        cupon,
        error: 'Este cupón ha expirado',
        motivoRechazo: 'expirado'
      };
    }
    
    // Verificar límite total de usos
    if (cupon.usosActuales >= cupon.usosTotal) {
      return {
        valido: false,
        cupon,
        error: 'Este cupón ha alcanzado su límite de usos',
        motivoRechazo: 'limite_usos_total'
      };
    }
    
    // Verificar usos por cliente
    const usosCliente = cupon.clientesQueUsaron.filter(
      r => r.clienteId === solicitud.clienteId
    ).length;
    
    if (usosCliente >= cupon.usosPorCliente) {
      return {
        valido: false,
        cupon,
        error: 'Ya has usado este cupón el máximo de veces permitidas',
        motivoRechazo: 'limite_usos_cliente'
      };
    }
    
    // Verificar compra mínima
    if (cupon.compraMinima && solicitud.importeOriginal < cupon.compraMinima) {
      return {
        valido: false,
        cupon,
        error: `Compra mínima de ${cupon.compraMinima.toFixed(2)}€ requerida`,
        motivoRechazo: 'compra_minima'
      };
    }
    
    // Verificar compra máxima
    if (cupon.compraMaxima && solicitud.importeOriginal > cupon.compraMaxima) {
      return {
        valido: false,
        cupon,
        error: `Compra máxima de ${cupon.compraMaxima.toFixed(2)}€ excedida`,
        motivoRechazo: 'compra_maxima'
      };
    }
    
    // TODO: Validar PDV, canal, productos, categorías, segmentos
    
    // Calcular descuento
    let descuento = 0;
    
    if (cupon.tipo === 'porcentaje') {
      descuento = (solicitud.importeOriginal * cupon.valor) / 100;
    } else if (cupon.tipo === 'fijo') {
      descuento = cupon.valor;
    }
    
    // El descuento no puede ser mayor al importe
    descuento = Math.min(descuento, solicitud.importeOriginal);
    
    const importeFinal = Math.max(0, solicitud.importeOriginal - descuento);
    
    return {
      valido: true,
      cupon,
      descuentoCalculado: descuento,
      importeFinal
    };
  }

  // ============================================
  // APLICAR CUPÓN
  // ============================================

  aplicar(solicitud: SolicitudAplicarCupon, pedidoId: string): AplicacionCupon {
    const validacion = this.validar(solicitud);
    
    if (!validacion.valido || !validacion.cupon) {
      return {
        cupon: validacion.cupon!,
        importeOriginal: solicitud.importeOriginal,
        importeDescuento: 0,
        importeFinal: solicitud.importeOriginal,
        aplicado: false,
        mensaje: validacion.error || 'No se pudo aplicar el cupón'
      };
    }
    
    // Registrar uso
    const registro: RegistroUsoCupon = {
      clienteId: solicitud.clienteId,
      clienteNombre: 'Cliente', // TODO: Obtener nombre real
      fechaUso: new Date().toISOString(),
      pedidoId,
      importeOriginal: solicitud.importeOriginal,
      importeDescuento: validacion.descuentoCalculado!,
      importeFinal: validacion.importeFinal!,
      puntoVentaId: solicitud.puntoVentaId
    };
    
    // Actualizar cupón
    const cupon = validacion.cupon;
    this.actualizar(cupon.id, {
      usosActuales: cupon.usosActuales + 1,
      clientesQueUsaron: [...cupon.clientesQueUsaron, registro]
    });
    
    return {
      cupon,
      importeOriginal: solicitud.importeOriginal,
      importeDescuento: validacion.descuentoCalculado!,
      importeFinal: validacion.importeFinal!,
      aplicado: true,
      mensaje: `Cupón ${cupon.codigo} aplicado correctamente`
    };
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  obtenerEstadisticas(): EstadisticasCupones {
    const cupones = this.getCupones();
    
    const totalCupones = cupones.length;
    const cuponesActivos = cupones.filter(c => c.activo).length;
    const cuponesUsados = cupones.filter(c => c.usosActuales > 0).length;
    const cuponesDisponibles = cupones.filter(c => 
      c.activo && c.usosActuales < c.usosTotal
    ).length;
    
    const usosTotal = cupones.reduce((sum, c) => sum + c.usosActuales, 0);
    
    const clientesUnicosSet = new Set<string>();
    cupones.forEach(c => {
      c.clientesQueUsaron.forEach(r => clientesUnicosSet.add(r.clienteId));
    });
    const clientesUnicos = clientesUnicosSet.size;
    
    const descuentoTotalOtorgado = cupones.reduce((sum, c) => 
      sum + c.clientesQueUsaron.reduce((s, r) => s + r.importeDescuento, 0), 0
    );
    
    const ventasTotalesConCupon = cupones.reduce((sum, c) => 
      sum + c.clientesQueUsaron.reduce((s, r) => s + r.importeFinal, 0), 0
    );
    
    const ticketPromedioConCupon = usosTotal > 0 
      ? ventasTotalesConCupon / usosTotal 
      : 0;
    
    const tasaRedencion = totalCupones > 0 
      ? (cuponesUsados / totalCupones) * 100 
      : 0;
    
    const cuponMasUsado = cupones
      .sort((a, b) => b.usosActuales - a.usosActuales)[0]?.codigo || 'N/A';
    
    // Origen más efectivo
    const origenStats = new Map<string, number>();
    cupones.forEach(c => {
      origenStats.set(c.origen, (origenStats.get(c.origen) || 0) + c.usosActuales);
    });
    const origenMasEfectivo = Array.from(origenStats.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] as any || 'manual';
    
    return {
      totalCupones,
      cuponesActivos,
      cuponesUsados,
      cuponesDisponibles,
      usosTotal,
      clientesUnicos,
      descuentoTotalOtorgado,
      ventasTotalesConCupon,
      ticketPromedioConCupon,
      tasaRedencion,
      cuponMasUsado,
      origenMasEfectivo,
      usosPorDia: [] // TODO: Implementar
    };
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================

export const cuponesService = new CuponesStorage();
