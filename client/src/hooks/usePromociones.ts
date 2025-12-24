/**
 * 🎯 HOOK DE PROMOCIONES
 * Hook React para gestionar promociones en toda la aplicación
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  promocionesService, 
  promocionEventEmitter,
  type ItemCarrito,
  type ResultadoAplicacionPromocion
} from '../services/promociones.service';
import type { PromocionDisponible, CanalPromocion } from '../data/promociones-disponibles';

// ============================================
// INTERFACES
// ============================================

interface UsePromocionesOptions {
  clienteId?: string;
  segmento?: string;
  canal?: CanalPromocion;
  autoRefresh?: boolean; // Actualizar automáticamente cuando hay cambios
}

interface UsePromocionesReturn {
  // Estado
  promociones: PromocionDisponible[];
  promocionesActivas: PromocionDisponible[];
  promocionesDestacadas: PromocionDisponible[];
  cargando: boolean;
  error: string | null;

  // Acciones
  refrescar: () => void;
  buscarPorId: (id: string) => PromocionDisponible | undefined;
  validarPromocion: (promocion: PromocionDisponible, carrito: ItemCarrito[]) => { valida: boolean; razon?: string };
  aplicarPromocion: (promocion: PromocionDisponible, carrito: ItemCarrito[]) => ResultadoAplicacionPromocion;
  calcularDescuentosAutomaticos: (carrito: ItemCarrito[]) => ResultadoAplicacionPromocion[];
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function usePromociones(options: UsePromocionesOptions = {}): UsePromocionesReturn {
  const {
    clienteId,
    segmento = 'general',
    canal = 'ambos',
    autoRefresh = true
  } = options;

  // Estados
  const [promociones, setPromociones] = useState<PromocionDisponible[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FUNCIÓN DE CARGA
  // ============================================

  const cargarPromociones = useCallback(() => {
    try {
      setCargando(true);
      setError(null);

      let promos: PromocionDisponible[];

      if (clienteId) {
        // Obtener promociones específicas para el cliente
        promos = promocionesService.obtenerParaCliente(clienteId, segmento, canal);
      } else {
        // Obtener todas las promociones activas
        promos = promocionesService.obtenerActivas();
      }

      setPromociones(promos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar promociones');
      console.error('[usePromociones] Error:', err);
    } finally {
      setCargando(false);
    }
  }, [clienteId, segmento, canal]);

  // ============================================
  // EFECTO INICIAL Y SUSCRIPCIÓN A EVENTOS
  // ============================================

  useEffect(() => {
    // Carga inicial
    cargarPromociones();

    if (!autoRefresh) return;

    // Suscribirse a eventos para auto-actualizar
    const onPromocionCambiada = () => {
      cargarPromociones();
    };

    promocionEventEmitter.on('promocion_creada', onPromocionCambiada);
    promocionEventEmitter.on('promocion_actualizada', onPromocionCambiada);
    promocionEventEmitter.on('promocion_eliminada', onPromocionCambiada);
    promocionEventEmitter.on('promocion_activada', onPromocionCambiada);
    promocionEventEmitter.on('promocion_desactivada', onPromocionCambiada);

    // Cleanup
    return () => {
      promocionEventEmitter.off('promocion_creada', onPromocionCambiada);
      promocionEventEmitter.off('promocion_actualizada', onPromocionCambiada);
      promocionEventEmitter.off('promocion_eliminada', onPromocionCambiada);
      promocionEventEmitter.off('promocion_activada', onPromocionCambiada);
      promocionEventEmitter.off('promocion_desactivada', onPromocionCambiada);
    };
  }, [cargarPromociones, autoRefresh]);

  // ============================================
  // MEMOIZACIONES
  // ============================================

  const promocionesActivas = useMemo(() => {
    return promociones.filter(p => p.activa);
  }, [promociones]);

  const promocionesDestacadas = useMemo(() => {
    return promociones.filter(p => p.destacada && p.activa);
  }, [promociones]);

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================

  const buscarPorId = useCallback((id: string) => {
    return promocionesService.buscarPorId(id);
  }, []);

  const validarPromocion = useCallback((promocion: PromocionDisponible, carrito: ItemCarrito[]) => {
    return promocionesService.validarPromocion(promocion, carrito);
  }, []);

  const aplicarPromocion = useCallback((promocion: PromocionDisponible, carrito: ItemCarrito[]) => {
    const resultado = promocionesService.aplicarAlCarrito(promocion, carrito);
    
    // Registrar uso si es exitoso
    if (resultado.exito && clienteId) {
      promocionesService.registrarUso(promocion.id, clienteId);
    }

    return resultado;
  }, [clienteId]);

  const calcularDescuentosAutomaticos = useCallback((carrito: ItemCarrito[]) => {
    return promocionesService.calcularDescuentosAutomaticos(carrito, clienteId, segmento);
  }, [clienteId, segmento]);

  const refrescar = useCallback(() => {
    cargarPromociones();
  }, [cargarPromociones]);

  // ============================================
  // RETURN
  // ============================================

  return {
    promociones,
    promocionesActivas,
    promocionesDestacadas,
    cargando,
    error,
    refrescar,
    buscarPorId,
    validarPromocion,
    aplicarPromocion,
    calcularDescuentosAutomaticos
  };
}

// ============================================
// HOOK SIMPLIFICADO PARA TPV
// ============================================

interface UsePromocionesTPVReturn {
  promocionesDisponibles: PromocionDisponible[];
  aplicarDescuentosAutomaticos: (carrito: ItemCarrito[]) => {
    carritoConDescuentos: ItemCarrito[];
    descuentoTotal: number;
    promocionesAplicadas: PromocionDisponible[];
  };
  obtenerPromocionesHorario: () => PromocionDisponible[];
}

export function usePromocionesTPV(): UsePromocionesTPVReturn {
  const { promocionesActivas, calcularDescuentosAutomaticos } = usePromociones({
    canal: 'tienda',
    autoRefresh: true
  });

  const aplicarDescuentosAutomaticos = useCallback((carrito: ItemCarrito[]) => {
    const resultados = calcularDescuentosAutomaticos(carrito);
    
    // Aplicar descuentos al carrito
    const carritoConDescuentos = carrito.map(item => {
      const resultado = resultados.find(r => 
        r.itemsAfectados.some(i => i.id === item.id)
      );
      
      if (resultado) {
        const itemAfectado = resultado.itemsAfectados.find(i => i.id === item.id);
        return itemAfectado || item;
      }
      
      return item;
    });

    const descuentoTotal = resultados.reduce((sum, r) => sum + r.descuentoTotal, 0);
    const promocionesAplicadas = resultados
      .filter(r => r.promocionAplicada)
      .map(r => r.promocionAplicada!);

    return {
      carritoConDescuentos,
      descuentoTotal,
      promocionesAplicadas
    };
  }, [calcularDescuentosAutomaticos]);

  const obtenerPromocionesHorario = useCallback(() => {
    return promocionesService.obtenerPorHorario();
  }, []);

  return {
    promocionesDisponibles: promocionesActivas,
    aplicarDescuentosAutomaticos,
    obtenerPromocionesHorario
  };
}

// ============================================
// HOOK PARA GERENTE
// ============================================

interface UsePromocionesGerenteReturn {
  promociones: PromocionDisponible[];
  crear: (promocion: Omit<PromocionDisponible, 'id'>) => PromocionDisponible;
  actualizar: (id: string, cambios: Partial<PromocionDisponible>) => PromocionDisponible | null;
  eliminar: (id: string) => boolean;
  toggleActivacion: (id: string) => PromocionDisponible | null;
  obtenerEstadisticas: (id: string) => any;
  refrescar: () => void;
}

export function usePromocionesGerente(): UsePromocionesGerenteReturn {
  const [promociones, setPromociones] = useState<PromocionDisponible[]>([]);

  const cargarPromociones = useCallback(() => {
    const todasPromociones = promocionesService.obtenerTodas();
    setPromociones(todasPromociones);
  }, []);

  useEffect(() => {
    cargarPromociones();

    // Auto-refresh cuando hay cambios
    const handler = () => cargarPromociones();
    promocionEventEmitter.on('promocion_creada', handler);
    promocionEventEmitter.on('promocion_actualizada', handler);
    promocionEventEmitter.on('promocion_eliminada', handler);

    return () => {
      promocionEventEmitter.off('promocion_creada', handler);
      promocionEventEmitter.off('promocion_actualizada', handler);
      promocionEventEmitter.off('promocion_eliminada', handler);
    };
  }, [cargarPromociones]);

  const crear = useCallback((promocion: Omit<PromocionDisponible, 'id'>) => {
    return promocionesService.crear(promocion);
  }, []);

  const actualizar = useCallback((id: string, cambios: Partial<PromocionDisponible>) => {
    return promocionesService.actualizar(id, cambios);
  }, []);

  const eliminar = useCallback((id: string) => {
    return promocionesService.eliminar(id);
  }, []);

  const toggleActivacion = useCallback((id: string) => {
    return promocionesService.toggleActivacion(id);
  }, []);

  const obtenerEstadisticas = useCallback((id: string) => {
    return promocionesService.obtenerEstadisticas(id);
  }, []);

  return {
    promociones,
    crear,
    actualizar,
    eliminar,
    toggleActivacion,
    obtenerEstadisticas,
    refrescar: cargarPromociones
  };
}
