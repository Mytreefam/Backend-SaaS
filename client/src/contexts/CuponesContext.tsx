/**
 * 🎫 CONTEXTO DE CUPONES
 * Gestión completa de cupones y reglas automáticas
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { cuponesApi } from '../services/api/cupones.api';
import type {
  Cupon,
  ReglaCupon,
  CodigoClienteGoogleMaps,
  UsoCupon,
  EstadisticasCupones,
  FiltrosCupones,
  FiltrosReglas,
  ValidacionCupon,
  AplicarCuponRequest,
  AplicarCuponResponse,
  CrearCuponRequest,
  CrearReglaRequest,
} from '../types/cupon.types';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS DEL CONTEXTO
// ============================================

interface CuponesContextValue {
  // Estado
  cupones: Cupon[];
  reglas: ReglaCupon[];
  codigosGoogleMaps: CodigoClienteGoogleMaps[];
  historialUsos: UsoCupon[];
  
  // Cupones - CRUD
  obtenerCupones: (filtros?: FiltrosCupones) => Cupon[];
  obtenerCupon: (id: string) => Cupon | undefined;
  obtenerCuponPorCodigo: (codigo: string) => Cupon | undefined;
  crearCupon: (datos: CrearCuponRequest) => Promise<Cupon | null>;
  actualizarCupon: (id: string, datos: Partial<Cupon>) => Promise<boolean>;
  eliminarCupon: (id: string) => Promise<boolean>;
  activarDesactivarCupon: (id: string, activo: boolean) => Promise<boolean>;
  
  // Validación y Aplicación
  validarCupon: (request: AplicarCuponRequest) => ValidacionCupon;
  aplicarCupon: (request: AplicarCuponRequest) => Promise<AplicarCuponResponse>;
  
  // Cupones del cliente
  obtenerCuponesCliente: (clienteId: string) => Cupon[];
  obtenerCuponesDisponiblesCliente: (clienteId: string) => Cupon[];
  
  // Reglas - CRUD
  obtenerReglas: (filtros?: FiltrosReglas) => ReglaCupon[];
  obtenerRegla: (id: string) => ReglaCupon | undefined;
  crearRegla: (datos: CrearReglaRequest) => Promise<ReglaCupon | null>;
  actualizarRegla: (id: string, datos: Partial<ReglaCupon>) => Promise<boolean>;
  eliminarRegla: (id: string) => Promise<boolean>;
  activarDesactivarRegla: (id: string, activa: boolean) => Promise<boolean>;
  ejecutarRegla: (reglaId: string) => Promise<boolean>;
  
  // Google Maps
  obtenerCodigoGoogleMaps: (clienteId: string) => CodigoClienteGoogleMaps | undefined;
  generarCodigoGoogleMaps: (clienteId: string, clienteNombre: string, clienteEmail: string) => Promise<CodigoClienteGoogleMaps | null>;
  verificarReviewsGoogleMaps: () => Promise<number>; // Retorna número de reviews detectadas
  
  // Estadísticas
  obtenerEstadisticas: () => EstadisticasCupones;
  obtenerEstadisticasRegla: (reglaId: string) => ReglaCupon['stats'];
  
  // Utilidades
  refrescar: () => void;
}

// ============================================
// CONTEXTO
// ============================================

const CuponesContext = createContext<CuponesContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface CuponesProviderProps {
  children: ReactNode;
}

export function CuponesProvider({ children }: CuponesProviderProps) {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [reglas, setReglas] = useState<ReglaCupon[]>([]);
  const [codigosGoogleMaps, setCodigosGoogleMaps] = useState<CodigoClienteGoogleMaps[]>([]);
  const [historialUsos, setHistorialUsos] = useState<UsoCupon[]>([]);

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      console.log('🎫 Cargando cupones desde el servidor...');
      // Cargar cupones desde el backend
      const cuponesBackend = await cuponesApi.getAll();
      
      if (cuponesBackend && cuponesBackend.length > 0) {
        // Transformar cupones del backend al formato del frontend
        const cuponesTransformados: Cupon[] = cuponesBackend.map((c: any) => ({
          id: c.id?.toString() || '',
          codigo: c.codigo || '',
          nombre: c.descripcion || c.codigo || '',
          descripcion: c.descripcion || '',
          tipoDescuento: c.descuento?.includes('%') ? 'porcentaje' : 'fijo',
          valorDescuento: parseFloat(c.descuento?.replace('%', '').replace('€', '') || '0'),
          monedaDescuento: '€',
          fechaInicio: new Date().toISOString(),
          fechaFin: c.validoHasta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          activo: !c.usado,
          usoMaximo: 1,
          usosActuales: c.usado ? 1 : 0,
          clienteEspecifico: c.clienteId?.toString(),
          origenCreacion: 'manual',
          creadoEn: new Date().toISOString(),
          creadoPor: 'sistema',
        }));
        
        setCupones(cuponesTransformados);
        console.log('✅ Cupones cargados desde backend:', cuponesTransformados.length);
      } else {
        // Fallback: cargar desde localStorage o usar mock
        const cuponesGuardados = localStorage.getItem('udar_cupones');
        if (cuponesGuardados) {
          setCupones(JSON.parse(cuponesGuardados));
        } else {
          const mockCupones = generarMockCupones();
          setCupones(mockCupones);
          localStorage.setItem('udar_cupones', JSON.stringify(mockCupones));
        }
      }
    } catch (error) {
      console.error('❌ Error cargando cupones:', error);
      // Fallback a localStorage
      const cuponesGuardados = localStorage.getItem('udar_cupones');
      if (cuponesGuardados) {
        setCupones(JSON.parse(cuponesGuardados));
      }
    }
    
    // Cargar reglas y otros datos desde localStorage (no hay API para estos)
    const reglasGuardadas = localStorage.getItem('udar_reglas_cupones');
    const codigosGuardados = localStorage.getItem('udar_codigos_google_maps');
    const historialGuardado = localStorage.getItem('udar_historial_cupones');

    if (reglasGuardadas) {
      setReglas(JSON.parse(reglasGuardadas));
    } else {
      const mockReglas = generarMockReglas();
      setReglas(mockReglas);
      localStorage.setItem('udar_reglas_cupones', JSON.stringify(mockReglas));
    }

    if (codigosGuardados) {
      setCodigosGoogleMaps(JSON.parse(codigosGuardados));
    }

    if (historialGuardado) {
      setHistorialUsos(JSON.parse(historialGuardado));
    }
  };

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem('udar_cupones', JSON.stringify(cupones));
  }, [cupones]);

  useEffect(() => {
    localStorage.setItem('udar_reglas_cupones', JSON.stringify(reglas));
  }, [reglas]);

  useEffect(() => {
    localStorage.setItem('udar_codigos_google_maps', JSON.stringify(codigosGoogleMaps));
  }, [codigosGoogleMaps]);

  useEffect(() => {
    localStorage.setItem('udar_historial_cupones', JSON.stringify(historialUsos));
  }, [historialUsos]);

  // ============================================
  // CUPONES - CRUD
  // ============================================

  const obtenerCupones = useCallback((filtros?: FiltrosCupones): Cupon[] => {
    let resultado = [...cupones];

    if (filtros) {
      if (filtros.activo !== undefined) {
        resultado = resultado.filter(c => c.activo === filtros.activo);
      }
      if (filtros.tipo) {
        resultado = resultado.filter(c => c.tipoDescuento === filtros.tipo);
      }
      if (filtros.clienteId) {
        resultado = resultado.filter(c => !c.clienteEspecifico || c.clienteEspecifico === filtros.clienteId);
      }
      if (filtros.marcaId) {
        resultado = resultado.filter(c => !c.marcasAplicables || c.marcasAplicables.includes(filtros.marcaId));
      }
      if (filtros.origen) {
        resultado = resultado.filter(c => c.origenCreacion === filtros.origen);
      }
      if (filtros.busqueda) {
        const busq = filtros.busqueda.toLowerCase();
        resultado = resultado.filter(c =>
          c.codigo.toLowerCase().includes(busq) ||
          c.nombre.toLowerCase().includes(busq)
        );
      }
    }

    return resultado;
  }, [cupones]);

  const obtenerCupon = useCallback((id: string): Cupon | undefined => {
    return cupones.find(c => c.id === id);
  }, [cupones]);

  const obtenerCuponPorCodigo = useCallback((codigo: string): Cupon | undefined => {
    return cupones.find(c => c.codigo.toLowerCase() === codigo.toLowerCase());
  }, [cupones]);

  const crearCupon = async (datos: CrearCuponRequest): Promise<Cupon | null> => {
    try {
      // Verificar que el código no exista
      if (obtenerCuponPorCodigo(datos.codigo)) {
        toast.error('Ya existe un cupón con ese código');
        return null;
      }

      const nuevoCupon: Cupon = {
        id: `CUP-${Date.now()}`,
        codigo: datos.codigo.toUpperCase(),
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        tipoDescuento: datos.tipoDescuento,
        valorDescuento: datos.valorDescuento,
        gastoMinimo: datos.gastoMinimo,
        usosMaximos: datos.usosMaximos,
        usosMaximosPorCliente: datos.usosMaximosPorCliente,
        usosActuales: 0,
        fechaInicio: datos.fechaInicio,
        fechaFin: datos.fechaFin,
        activo: true,
        clienteEspecifico: datos.clienteEspecifico,
        origenCreacion: 'manual',
        fechaCreacion: new Date().toISOString(),
        creadoPor: 'gerente-actual', // TODO: Obtener del contexto de usuario
        stats: {
          vecesUsado: 0,
          clientesUnicos: 0,
          totalDescuentoOtorgado: 0,
        },
      };

      setCupones(prev => [...prev, nuevoCupon]);
      return nuevoCupon;
    } catch (error) {
      console.error('Error al crear cupón:', error);
      return null;
    }
  };

  const actualizarCupon = async (id: string, datos: Partial<Cupon>): Promise<boolean> => {
    try {
      setCupones(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, ...datos }
            : c
        )
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar cupón:', error);
      return false;
    }
  };

  const eliminarCupon = async (id: string): Promise<boolean> => {
    try {
      setCupones(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error al eliminar cupón:', error);
      return false;
    }
  };

  const activarDesactivarCupon = async (id: string, activo: boolean): Promise<boolean> => {
    return actualizarCupon(id, { activo });
  };

  // ============================================
  // VALIDACIÓN Y APLICACIÓN
  // ============================================

  const validarCupon = useCallback((request: AplicarCuponRequest): ValidacionCupon => {
    const cupon = obtenerCuponPorCodigo(request.codigoCupon);

    if (!cupon) {
      return {
        valido: false,
        mensaje: 'El cupón no existe',
        razon: 'no-existe',
      };
    }

    if (!cupon.activo) {
      return {
        valido: false,
        mensaje: 'El cupón no está activo',
        razon: 'inactivo',
      };
    }

    // Verificar fechas
    const ahora = new Date();
    const inicio = new Date(cupon.fechaInicio);
    const fin = new Date(cupon.fechaFin);

    if (ahora < inicio || ahora > fin) {
      return {
        valido: false,
        mensaje: 'El cupón ha expirado o aún no es válido',
        razon: 'expirado',
      };
    }

    // Verificar usos máximos
    if (cupon.usosMaximos && cupon.usosActuales >= cupon.usosMaximos) {
      return {
        valido: false,
        mensaje: 'El cupón ha alcanzado el máximo de usos',
        razon: 'ya-usado-max',
      };
    }

    // Verificar cliente específico
    if (cupon.clienteEspecifico && cupon.clienteEspecifico !== request.clienteId) {
      return {
        valido: false,
        mensaje: 'Este cupón no está disponible para tu cuenta',
        razon: 'cliente-no-autorizado',
      };
    }

    // Verificar gasto mínimo
    if (cupon.gastoMinimo && request.montoCarrito < cupon.gastoMinimo) {
      return {
        valido: false,
        mensaje: `El gasto mínimo para este cupón es ${cupon.gastoMinimo}€`,
        razon: 'gasto-minimo-no-alcanzado',
      };
    }

    // Verificar marca
    if (cupon.marcasAplicables && !cupon.marcasAplicables.includes(request.marcaId)) {
      return {
        valido: false,
        mensaje: 'Este cupón no es válido para esta marca',
        razon: 'marca-no-aplicable',
      };
    }

    // Verificar punto de venta
    if (cupon.puntosVentaAplicables && !cupon.puntosVentaAplicables.includes(request.puntoVentaId)) {
      return {
        valido: false,
        mensaje: 'Este cupón no es válido para este punto de venta',
        razon: 'pdv-no-aplicable',
      };
    }

    // Calcular descuento aplicable
    let descuentoAplicable = 0;
    if (cupon.tipoDescuento === 'porcentaje') {
      descuentoAplicable = (request.montoCarrito * cupon.valorDescuento) / 100;
    } else if (cupon.tipoDescuento === 'fijo') {
      descuentoAplicable = cupon.valorDescuento;
    }

    return {
      valido: true,
      mensaje: 'Cupón válido',
      cupon,
      descuentoAplicable,
    };
  }, [obtenerCuponPorCodigo]);

  const aplicarCupon = async (request: AplicarCuponRequest): Promise<AplicarCuponResponse> => {
    const validacion = validarCupon(request);

    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: validacion.mensaje,
      };
    }

    const cupon = validacion.cupon!;
    const descuento = validacion.descuentoAplicable!;
    const montoFinal = Math.max(0, request.montoCarrito - descuento);

    // Registrar uso
    const uso: UsoCupon = {
      id: `USO-${Date.now()}`,
      cuponId: cupon.id,
      codigoCupon: cupon.codigo,
      clienteId: request.clienteId,
      clienteNombre: '', // TODO: Obtener del contexto
      pedidoId: '', // Se asignará al crear el pedido
      montoOriginal: request.montoCarrito,
      montoDescuento: descuento,
      montoFinal,
      puntoVentaId: request.puntoVentaId,
      marcaId: request.marcaId,
      fechaUso: new Date().toISOString(),
      canalUso: 'app-cliente',
    };

    setHistorialUsos(prev => [...prev, uso]);

    // Actualizar cupón
    await actualizarCupon(cupon.id, {
      usosActuales: cupon.usosActuales + 1,
      ultimoUso: new Date().toISOString(),
      stats: {
        ...cupon.stats,
        vecesUsado: cupon.stats.vecesUsado + 1,
        totalDescuentoOtorgado: cupon.stats.totalDescuentoOtorgado + descuento,
      },
    });

    return {
      exito: true,
      mensaje: `¡Cupón aplicado! Ahorro: ${descuento.toFixed(2)}€`,
      descuentoAplicado: descuento,
      montoFinal,
      cuponAplicado: cupon,
    };
  };

  // ============================================
  // CUPONES DEL CLIENTE
  // ============================================

  const obtenerCuponesCliente = useCallback((clienteId: string): Cupon[] => {
    return obtenerCupones({
      clienteId,
      activo: true,
    });
  }, [obtenerCupones]);

  const obtenerCuponesDisponiblesCliente = useCallback((clienteId: string): Cupon[] => {
    const ahora = new Date();
    return obtenerCuponesCliente(clienteId).filter(c => {
      const inicio = new Date(c.fechaInicio);
      const fin = new Date(c.fechaFin);
      const vigente = ahora >= inicio && ahora <= fin;
      const disponible = !c.usosMaximos || c.usosActuales < c.usosMaximos;
      return vigente && disponible;
    });
  }, [obtenerCuponesCliente]);

  // ============================================
  // REGLAS - CRUD
  // ============================================

  const obtenerReglas = useCallback((filtros?: FiltrosReglas): ReglaCupon[] => {
    let resultado = [...reglas];

    if (filtros) {
      if (filtros.activa !== undefined) {
        resultado = resultado.filter(r => r.activa === filtros.activa);
      }
      if (filtros.tipo) {
        resultado = resultado.filter(r => r.tipo === filtros.tipo);
      }
    }

    return resultado;
  }, [reglas]);

  const obtenerRegla = useCallback((id: string): ReglaCupon | undefined => {
    return reglas.find(r => r.id === id);
  }, [reglas]);

  const crearRegla = async (datos: CrearReglaRequest): Promise<ReglaCupon | null> => {
    try {
      const nuevaRegla: ReglaCupon = {
        id: `REGLA-${Date.now()}`,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        tipo: datos.tipo,
        activa: true,
        condiciones: datos.condiciones,
        recompensa: datos.recompensa,
        googleMaps: datos.googleMaps,
        ejecutarCada: datos.tipo === 'google-maps' ? datos.googleMaps?.checkIntervalHoras ? datos.googleMaps.checkIntervalHoras * 60 : 360 : undefined,
        stats: {
          cuponesGenerados: 0,
          cuponesUsados: 0,
          clientesActivos: 0,
          totalDescuentoOtorgado: 0,
        },
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: 'gerente-actual',
      };

      setReglas(prev => [...prev, nuevaRegla]);
      return nuevaRegla;
    } catch (error) {
      console.error('Error al crear regla:', error);
      return null;
    }
  };

  const actualizarRegla = async (id: string, datos: Partial<ReglaCupon>): Promise<boolean> => {
    try {
      setReglas(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, ...datos, fechaActualizacion: new Date().toISOString() }
            : r
        )
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar regla:', error);
      return false;
    }
  };

  const eliminarRegla = async (id: string): Promise<boolean> => {
    try {
      setReglas(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (error) {
      console.error('Error al eliminar regla:', error);
      return false;
    }
  };

  const activarDesactivarRegla = async (id: string, activa: boolean): Promise<boolean> => {
    return actualizarRegla(id, { activa });
  };

  const ejecutarRegla = async (reglaId: string): Promise<boolean> => {
    // TODO: Implementar lógica de ejecución según el tipo de regla
    toast.info('Ejecutando regla...');
    return true;
  };

  // ============================================
  // GOOGLE MAPS
  // ============================================

  const obtenerCodigoGoogleMaps = useCallback((clienteId: string): CodigoClienteGoogleMaps | undefined => {
    return codigosGoogleMaps.find(c => c.clienteId === clienteId && c.activo);
  }, [codigosGoogleMaps]);

  const generarCodigoGoogleMaps = async (
    clienteId: string,
    clienteNombre: string,
    clienteEmail: string
  ): Promise<CodigoClienteGoogleMaps | null> => {
    try {
      const codigo = `HOYPECAMOS-CLI-${clienteId.substring(0, 8).toUpperCase()}`;
      const urlParaCompartir = `¡Me encanta HoyPecamos! 🍔❤️ Mi código de recomendación es: ${codigo}`;

      const nuevoCodigo: CodigoClienteGoogleMaps = {
        id: `GMAPS-${Date.now()}`,
        clienteId,
        clienteNombre,
        clienteEmail,
        codigo,
        urlParaCompartir,
        compartido: false,
        detectado: false,
        cuponNotificado: false,
        fechaCreacion: new Date().toISOString(),
        activo: true,
      };

      setCodigosGoogleMaps(prev => [...prev, nuevoCodigo]);
      return nuevoCodigo;
    } catch (error) {
      console.error('Error al generar código Google Maps:', error);
      return null;
    }
  };

  const verificarReviewsGoogleMaps = async (): Promise<number> => {
    // TODO: Implementar llamada real a Google Maps API
    // Por ahora simulamos la detección
    toast.info('Verificando reviews en Google Maps...');
    return 0;
  };

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  const obtenerEstadisticas = useCallback((): EstadisticasCupones => {
    const ahora = new Date();
    const cuponesActivos = cupones.filter(c => {
      const inicio = new Date(c.fechaInicio);
      const fin = new Date(c.fechaFin);
      return c.activo && ahora >= inicio && ahora <= fin;
    });

    const cuponesExpirados = cupones.filter(c => {
      const fin = new Date(c.fechaFin);
      return ahora > fin;
    });

    const totalUsos = historialUsos.length;
    const clientesUnicos = new Set(historialUsos.map(u => u.clienteId)).size;
    const totalDescuento = historialUsos.reduce((sum, u) => sum + u.montoDescuento, 0);

    return {
      totalCupones: cupones.length,
      cuponesActivos: cuponesActivos.length,
      cuponesExpirados: cuponesExpirados.length,
      totalUsos,
      clientesUnicos,
      tasaConversion: cupones.length > 0 ? (totalUsos / cupones.length) * 100 : 0,
      totalDescuentoOtorgado: totalDescuento,
      descuentoPromedioporUso: totalUsos > 0 ? totalDescuento / totalUsos : 0,
      ticketPromedioConCupon: totalUsos > 0 ? historialUsos.reduce((sum, u) => sum + u.montoFinal, 0) / totalUsos : 0,
      usosPorTipo: {
        porcentaje: historialUsos.filter(u => {
          const cupon = obtenerCupon(u.cuponId);
          return cupon?.tipoDescuento === 'porcentaje';
        }).length,
        fijo: historialUsos.filter(u => {
          const cupon = obtenerCupon(u.cuponId);
          return cupon?.tipoDescuento === 'fijo';
        }).length,
        regalo: historialUsos.filter(u => {
          const cupon = obtenerCupon(u.cuponId);
          return cupon?.tipoDescuento === 'regalo';
        }).length,
        envioGratis: historialUsos.filter(u => {
          const cupon = obtenerCupon(u.cuponId);
          return cupon?.tipoDescuento === 'envio-gratis';
        }).length,
      },
      cuponMasUsado: cupones.sort((a, b) => b.stats.vecesUsado - a.stats.vecesUsado)[0]?.codigo || 'N/A',
      cuponMayorDescuento: cupones.sort((a, b) => b.stats.totalDescuentoOtorgado - a.stats.totalDescuentoOtorgado)[0]?.codigo || 'N/A',
      totalReglas: reglas.length,
      reglasActivas: reglas.filter(r => r.activa).length,
      cuponesGeneradosPorReglas: cupones.filter(c => c.origenCreacion === 'regla-automatica').length,
    };
  }, [cupones, reglas, historialUsos, obtenerCupon]);

  const obtenerEstadisticasRegla = useCallback((reglaId: string): ReglaCupon['stats'] => {
    const regla = obtenerRegla(reglaId);
    return regla?.stats || {
      cuponesGenerados: 0,
      cuponesUsados: 0,
      clientesActivos: 0,
      totalDescuentoOtorgado: 0,
    };
  }, [obtenerRegla]);

  // ============================================
  // UTILIDADES
  // ============================================

  const refrescar = () => {
    cargarDatos();
  };

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================

  const value: CuponesContextValue = {
    cupones,
    reglas,
    codigosGoogleMaps,
    historialUsos,
    obtenerCupones,
    obtenerCupon,
    obtenerCuponPorCodigo,
    crearCupon,
    actualizarCupon,
    eliminarCupon,
    activarDesactivarCupon,
    validarCupon,
    aplicarCupon,
    obtenerCuponesCliente,
    obtenerCuponesDisponiblesCliente,
    obtenerReglas,
    obtenerRegla,
    crearRegla,
    actualizarRegla,
    eliminarRegla,
    activarDesactivarRegla,
    ejecutarRegla,
    obtenerCodigoGoogleMaps,
    generarCodigoGoogleMaps,
    verificarReviewsGoogleMaps,
    obtenerEstadisticas,
    obtenerEstadisticasRegla,
    refrescar,
  };

  return <CuponesContext.Provider value={value}>{children}</CuponesContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useCupones(): CuponesContextValue {
  const context = useContext(CuponesContext);
  if (!context) {
    throw new Error('useCupones debe usarse dentro de CuponesProvider');
  }
  return context;
}

// ============================================
// DATOS MOCK
// ============================================

function generarMockCupones(): Cupon[] {
  const ahora = new Date();
  const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
  const en30Dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'CUP-001',
      codigo: 'BIENVENIDA10',
      nombre: 'Bienvenida 10% descuento',
      descripcion: 'Cupón de bienvenida para nuevos clientes',
      tipoDescuento: 'porcentaje',
      valorDescuento: 10,
      gastoMinimo: 20,
      usosMaximos: 100,
      usosMaximosPorCliente: 1,
      usosActuales: 23,
      fechaInicio: ahora.toISOString(),
      fechaFin: en30Dias.toISOString(),
      activo: true,
      origenCreacion: 'manual',
      fechaCreacion: ahora.toISOString(),
      creadoPor: 'GERENTE-001',
      stats: {
        vecesUsado: 23,
        clientesUnicos: 23,
        totalDescuentoOtorgado: 156.50,
      },
    },
    {
      id: 'CUP-002',
      codigo: 'VERANO2024',
      nombre: 'Verano 2024 - 5€ descuento',
      descripcion: 'Descuento fijo para el verano',
      tipoDescuento: 'fijo',
      valorDescuento: 5,
      gastoMinimo: 30,
      usosMaximos: 500,
      usosActuales: 145,
      fechaInicio: ahora.toISOString(),
      fechaFin: en30Dias.toISOString(),
      activo: true,
      origenCreacion: 'manual',
      fechaCreacion: ahora.toISOString(),
      creadoPor: 'GERENTE-001',
      stats: {
        vecesUsado: 145,
        clientesUnicos: 98,
        totalDescuentoOtorgado: 725.00,
      },
    },
  ];
}

function generarMockReglas(): ReglaCupon[] {
  const ahora = new Date();

  return [
    {
      id: 'REGLA-001',
      nombre: 'Fidelización - 7 pedidos',
      descripcion: 'Cada 7 pedidos de más de 30€, regala 5€',
      tipo: 'fidelizacion',
      activa: true,
      condiciones: {
        numeroPedidos: 7,
        gastoMinimoPorPedido: 30,
      },
      recompensa: {
        tipoDescuento: 'fijo',
        valor: 5,
        validezDias: 30,
        gastoMinimo: 20,
        usosMaximos: 1,
        prefijoCodigoCupon: 'FIDEL-',
        notificarCliente: true,
        mensajeNotificacion: '¡Felicidades! Has ganado 5€ de descuento por tu fidelidad',
      },
      stats: {
        cuponesGenerados: 12,
        cuponesUsados: 8,
        clientesActivos: 12,
        totalDescuentoOtorgado: 40.00,
      },
      fechaCreacion: ahora.toISOString(),
      fechaActualizacion: ahora.toISOString(),
      creadoPor: 'GERENTE-001',
    },
    {
      id: 'REGLA-002',
      nombre: 'Review Google Maps',
      descripcion: 'Cliente deja review con su código → 10€ descuento',
      tipo: 'google-maps',
      activa: true,
      condiciones: {},
      recompensa: {
        tipoDescuento: 'fijo',
        valor: 10,
        validezDias: 60,
        gastoMinimo: 40,
        usosMaximos: 1,
        prefijoCodigoCupon: 'GMAPS-',
        notificarCliente: true,
        mensajeNotificacion: '¡Gracias por tu review! Aquí tienes 10€ de descuento',
      },
      googleMaps: {
        apiKey: 'mock-api-key',
        placeId: 'ChIJ...',
        checkIntervalHoras: 6,
        palabrasClaveRequeridas: ['HOYPECAMOS-CLI'],
        ratingMinimo: 4,
        reviewsDetectadas: 8,
      },
      stats: {
        cuponesGenerados: 8,
        cuponesUsados: 5,
        clientesActivos: 8,
        totalDescuentoOtorgado: 50.00,
      },
      fechaCreacion: ahora.toISOString(),
      fechaActualizacion: ahora.toISOString(),
      creadoPor: 'GERENTE-001',
    },
  ];
}
