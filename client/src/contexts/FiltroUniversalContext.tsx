import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SelectedContext, FiltroAdicional, FiltroUniversalData, PeriodoFiltro } from '../components/filtros/FiltroUniversalUDAR';

// ============================================================================
// TIPOS
// ============================================================================

interface FiltroUniversalContextType {
  filtroData: FiltroUniversalData;
  setFiltroData: (data: FiltroUniversalData) => void;
  resetFiltros: () => void;
  
  // Helpers
  getEmpresasSeleccionadas: () => string[];
  getMarcasSeleccionadas: () => string[];
  getPDVsSeleccionados: () => string[];
  isFiltered: () => boolean;
}

interface FiltroUniversalProviderProps {
  children: ReactNode;
  initialData?: Partial<FiltroUniversalData>;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const FiltroUniversalContext = createContext<FiltroUniversalContextType | undefined>(undefined);

// ============================================================================
// DATOS POR DEFECTO
// ============================================================================

const FILTRO_DEFAULT: FiltroUniversalData = {
  selectedContext: [],
  filtrosAdicionales: {
    periodo: {
      tipo: 'este_mes',
      fecha_inicio: null,
      fecha_fin: null
    },
    canales: [],
    estados: [],
    tipo: null
  }
};

// ============================================================================
// PROVIDER
// ============================================================================

export function FiltroUniversalProvider({ children, initialData }: FiltroUniversalProviderProps) {
  const [filtroData, setFiltroDataState] = useState<FiltroUniversalData>({
    ...FILTRO_DEFAULT,
    ...initialData
  });

  // Calcular fechas automáticas al iniciar
  useEffect(() => {
    calcularFechasPeriodo(filtroData.filtrosAdicionales.periodo.tipo);
  }, []);

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  const calcularFechasPeriodo = (tipo: string) => {
    const hoy = new Date();
    let fecha_inicio: string | null = null;
    let fecha_fin: string | null = null;
    
    switch (tipo) {
      case 'ultimos_30_dias':
        fecha_fin = hoy.toISOString().split('T')[0];
        const hace30 = new Date(hoy);
        hace30.setDate(hace30.getDate() - 30);
        fecha_inicio = hace30.toISOString().split('T')[0];
        break;
      case 'este_mes':
        fecha_inicio = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
        fecha_fin = hoy.toISOString().split('T')[0];
        break;
      case 'mes_pasado':
        const mesPasado = new Date(hoy);
        mesPasado.setMonth(mesPasado.getMonth() - 1);
        fecha_inicio = `${mesPasado.getFullYear()}-${String(mesPasado.getMonth() + 1).padStart(2, '0')}-01`;
        const ultimoDia = new Date(mesPasado.getFullYear(), mesPasado.getMonth() + 1, 0);
        fecha_fin = ultimoDia.toISOString().split('T')[0];
        break;
      case 'este_trimestre':
        const trimestre = Math.floor(hoy.getMonth() / 3);
        const mesInicio = trimestre * 3;
        fecha_inicio = `${hoy.getFullYear()}-${String(mesInicio + 1).padStart(2, '0')}-01`;
        fecha_fin = hoy.toISOString().split('T')[0];
        break;
      case 'este_año':
        fecha_inicio = `${hoy.getFullYear()}-01-01`;
        fecha_fin = hoy.toISOString().split('T')[0];
        break;
    }

    return { fecha_inicio, fecha_fin };
  };

  // ============================================================================
  // SET FILTRO DATA (con auto-cálculo de fechas)
  // ============================================================================

  const setFiltroData = (data: FiltroUniversalData) => {
    // Si el periodo cambió y no es personalizado, calcular fechas
    if (data.filtrosAdicionales.periodo.tipo !== 'personalizado') {
      const { fecha_inicio, fecha_fin } = calcularFechasPeriodo(data.filtrosAdicionales.periodo.tipo);
      data.filtrosAdicionales.periodo.fecha_inicio = fecha_inicio;
      data.filtrosAdicionales.periodo.fecha_fin = fecha_fin;
    }

    setFiltroDataState(data);
    
    // Persistir en localStorage (opcional)
    try {
      localStorage.setItem('udar_filtro_universal', JSON.stringify(data));
    } catch (e) {
      console.warn('No se pudo guardar el filtro en localStorage:', e);
    }
  };

  // ============================================================================
  // RESET FILTROS
  // ============================================================================

  const resetFiltros = () => {
    const resetData = { ...FILTRO_DEFAULT };
    const { fecha_inicio, fecha_fin } = calcularFechasPeriodo('este_mes');
    resetData.filtrosAdicionales.periodo.fecha_inicio = fecha_inicio;
    resetData.filtrosAdicionales.periodo.fecha_fin = fecha_fin;
    
    setFiltroDataState(resetData);
    
    try {
      localStorage.removeItem('udar_filtro_universal');
    } catch (e) {
      console.warn('No se pudo limpiar el filtro de localStorage:', e);
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getEmpresasSeleccionadas = (): string[] => {
    const empresas = new Set<string>();
    filtroData.selectedContext.forEach(ctx => {
      empresas.add(ctx.empresa_id);
    });
    return Array.from(empresas);
  };

  const getMarcasSeleccionadas = (): string[] => {
    const marcas = new Set<string>();
    filtroData.selectedContext.forEach(ctx => {
      if (ctx.marca_id) {
        marcas.add(ctx.marca_id);
      }
    });
    return Array.from(marcas);
  };

  const getPDVsSeleccionados = (): string[] => {
    const pdvs = new Set<string>();
    filtroData.selectedContext.forEach(ctx => {
      if (ctx.punto_venta_id) {
        pdvs.add(ctx.punto_venta_id);
      }
    });
    return Array.from(pdvs);
  };

  const isFiltered = (): boolean => {
    return filtroData.selectedContext.length > 0 ||
           filtroData.filtrosAdicionales.canales.length > 0 ||
           filtroData.filtrosAdicionales.estados.length > 0 ||
           filtroData.filtrosAdicionales.tipo !== null;
  };

  // ============================================================================
  // CARGAR DESDE LOCALSTORAGE AL INICIAR
  // ============================================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem('udar_filtro_universal');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFiltroDataState(parsed);
      }
    } catch (e) {
      console.warn('No se pudo cargar el filtro desde localStorage:', e);
    }
  }, []);

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const contextValue: FiltroUniversalContextType = {
    filtroData,
    setFiltroData,
    resetFiltros,
    getEmpresasSeleccionadas,
    getMarcasSeleccionadas,
    getPDVsSeleccionados,
    isFiltered
  };

  return (
    <FiltroUniversalContext.Provider value={contextValue}>
      {children}
    </FiltroUniversalContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function useFiltroUniversal(): FiltroUniversalContextType {
  const context = useContext(FiltroUniversalContext);
  if (!context) {
    throw new Error('useFiltroUniversal debe usarse dentro de FiltroUniversalProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS PARA QUERIES SQL
// ============================================================================

/**
 * Genera la parte WHERE de una query SQL basada en el filtro universal
 */
export function generarWhereClause(filtroData: FiltroUniversalData): {
  whereClause: string;
  params: Record<string, any>;
} {
  const conditions: string[] = [];
  const params: Record<string, any> = {};

  // CONTEXTO (empresas, marcas, PDV)
  if (filtroData.selectedContext.length > 0) {
    const empresaIds = new Set<string>();
    const marcaIds = new Set<string>();
    const pdvIds = new Set<string>();

    filtroData.selectedContext.forEach(ctx => {
      empresaIds.add(ctx.empresa_id);
      if (ctx.marca_id) marcaIds.add(ctx.marca_id);
      if (ctx.punto_venta_id) pdvIds.add(ctx.punto_venta_id);
    });

    // Empresa
    if (empresaIds.size > 0) {
      conditions.push('empresa_id IN (:empresaIds)');
      params.empresaIds = Array.from(empresaIds);
    }

    // Marca (si se especificó alguna)
    if (marcaIds.size > 0) {
      const hasEmpresaWide = filtroData.selectedContext.some(
        ctx => ctx.marca_id === null && ctx.punto_venta_id === null
      );
      
      if (hasEmpresaWide) {
        conditions.push('(marca_id IN (:marcaIds) OR marca_id IS NOT NULL)');
      } else {
        conditions.push('marca_id IN (:marcaIds)');
      }
      params.marcaIds = Array.from(marcaIds);
    }

    // PDV (si se especificó alguno)
    if (pdvIds.size > 0) {
      const hasMarcaWide = filtroData.selectedContext.some(
        ctx => ctx.marca_id !== null && ctx.punto_venta_id === null
      );
      
      if (hasMarcaWide) {
        conditions.push('(punto_venta_id IN (:pdvIds) OR punto_venta_id IS NOT NULL)');
      } else {
        conditions.push('punto_venta_id IN (:pdvIds)');
      }
      params.pdvIds = Array.from(pdvIds);
    }
  }

  // PERIODO
  if (filtroData.filtrosAdicionales.periodo.fecha_inicio) {
    conditions.push('fecha >= :fechaInicio');
    params.fechaInicio = filtroData.filtrosAdicionales.periodo.fecha_inicio;
  }
  if (filtroData.filtrosAdicionales.periodo.fecha_fin) {
    conditions.push('fecha <= :fechaFin');
    params.fechaFin = filtroData.filtrosAdicionales.periodo.fecha_fin;
  }

  // CANALES
  if (filtroData.filtrosAdicionales.canales.length > 0) {
    conditions.push('canal IN (:canales)');
    params.canales = filtroData.filtrosAdicionales.canales;
  }

  // ESTADOS
  if (filtroData.filtrosAdicionales.estados.length > 0) {
    conditions.push('estado IN (:estados)');
    params.estados = filtroData.filtrosAdicionales.estados;
  }

  // TIPO
  if (filtroData.filtrosAdicionales.tipo) {
    conditions.push('tipo = :tipo');
    params.tipo = filtroData.filtrosAdicionales.tipo;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  return { whereClause, params };
}

/**
 * Genera objeto para enviar a Make.com
 */
export function generarPayloadMake(filtroData: FiltroUniversalData, userId: string): any {
  return {
    user_id: userId,
    selected_context: filtroData.selectedContext,
    filtros: {
      periodo: {
        tipo: filtroData.filtrosAdicionales.periodo.tipo,
        fecha_inicio: filtroData.filtrosAdicionales.periodo.fecha_inicio,
        fecha_fin: filtroData.filtrosAdicionales.periodo.fecha_fin
      },
      canales: filtroData.filtrosAdicionales.canales,
      estados: filtroData.filtrosAdicionales.estados,
      tipo: filtroData.filtrosAdicionales.tipo
    },
    timestamp: new Date().toISOString()
  };
}
