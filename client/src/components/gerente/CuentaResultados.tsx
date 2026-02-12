import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Filter, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { finanzasApi } from '../../services/api/gerente.api';
import { gerenteConfigApi } from '../../services/api';

// ============================================
// DATA SCHEMA - ESTRUCTURA UNIVERSAL
// ============================================

interface Filtros {
  empresa_id: string;
  punto_venta_id_base: string;
  punto_venta_id_comparada: string | null;
  periodo_tipo: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año' | 'personalizado';
  fecha_inicio: string;
  fecha_fin: string;
  modo_visualizacion: 'mes_completo' | 'acumulado_hoy';
}

interface Linea {
  id: string;
  grupo: 'INGRESOS_NETOS' | 'COSTE_VENTAS' | 'GASTOS_OPERATIVOS' | 'MARGEN_BRUTO' | 'EBITDA' | 'COSTES_ESTRUCTURALES' | 'BAI' | 'IMPUESTO_SOCIEDADES' | 'BENEFICIO_NETO';
  concepto: string;
  tipo: 'detalle' | 'total_grupo' | 'total_global';
  objetivo_mes: number;
  objetivo_visible: number;
  importe_real: number;
  cumplimiento_pct: number;
  estado: 'up' | 'flat' | 'down';
}

interface LineaComparativa {
  id: string;
  importe_base: number;
  importe_comparada: number;
}

interface Comparativa {
  activo: boolean;
  nombre_tienda_comparada: string | null;
  lineas: LineaComparativa[];
}

interface CuentaResultadosData {
  filtros: Filtros;
  lineas: Linea[];
  totales: Linea[];
  comparativa: Comparativa;
}

interface CuentaResultadosProps {
  comparativaActiva?: boolean;
  tiendaComparativa?: string;
  tipoPeriodo?: string;
}

export function CuentaResultados({ 
  comparativaActiva = false, 
  tiendaComparativa = '',
  tipoPeriodo = 'Mes completo'
}: CuentaResultadosProps) {
  // Estados para controlar qué secciones están expandidas
  const [expandido, setExpandido] = useState<{[key: string]: boolean}>({
    ingresosNetos: true,
    costeVentas: false,
    gastosOperativos: false,
    costesEstructurales: false,
  });

  // Estados para filtros - ACTUALIZADO CON CONTEXTO JERÁRQUICO
  const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('Mes');
  const [modoVisualizacion, setModoVisualizacion] = useState<'mes_completo' | 'acumulado_hoy'>(
    tipoPeriodo === 'Mes completo' ? 'mes_completo' : 'acumulado_hoy'
  );
  const [comparativaLocal, setComparativaLocal] = useState<boolean>(comparativaActiva);
  const [pdvComparado, setPdvComparado] = useState<string>(tiendaComparativa || '');

  // Estado para datos
  const [datosAPI, setDatosAPI] = useState<CuentaResultadosData | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);

  // Config jerárquica real para resolver nombres de PDV/Marca
  const [empresasConfig, setEmpresasConfig] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await gerenteConfigApi.empresas.list();
        if (cancelled) return;
        setEmpresasConfig(Array.isArray(list) ? list : []);
      } catch {
        if (cancelled) return;
        setEmpresasConfig([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const puntosVentaArray = useMemo(() => {
    const out: Array<{ id: string; nombre: string; marcasIds: string[] }> = [];
    for (const e of empresasConfig || []) {
      const pdvs = Array.isArray((e as any)?.puntosVenta) ? (e as any).puntosVenta : [];
      for (const pv of pdvs) {
        const id = String(pv?.id || '').trim();
        if (!id) continue;
        out.push({
          id,
          nombre: String(pv?.nombre || pv?.id || '').trim(),
          marcasIds: Array.isArray(pv?.marcasIds) ? pv.marcasIds.map((x: any) => String(x)) : [],
        });
      }
    }
    return out;
  }, [empresasConfig]);

  const marcaNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of empresasConfig || []) {
      const marcas = Array.isArray((e as any)?.marcas) ? (e as any).marcas : [];
      for (const marca of marcas) {
        const id = String(marca?.id || '').trim();
        if (!id) continue;
        m.set(id, String(marca?.nombre || id).trim());
      }
    }
    return m;
  }, [empresasConfig]);

  const getNombreMarca = (id: string) => marcaNameMap.get(id) || id;
  const getNombrePDVConMarcas = (pdvId?: string | null) => {
    const id = String(pdvId || '').trim();
    if (!id) return '';
    const pdv = puntosVentaArray.find((p) => p.id === id);
    if (!pdv) return id;
    const marcas = (pdv.marcasIds || [])
      .map((mid) => getNombreMarca(mid))
      .filter((x) => typeof x === 'string' && x.length > 0);
    return marcas.length ? `${pdv.nombre} - ${marcas.join(', ')}` : pdv.nombre;
  };

  useEffect(() => {
    if (pdvComparado) return;
    if (puntosVentaArray.length) setPdvComparado(puntosVentaArray[0].id);
  }, [pdvComparado, puntosVentaArray]);

  const periodos = ['Hoy', 'Semana', 'Mes', 'Trimestre', 'Año', 'Personalizado'];

  // ============================================
  // CARGA DE DATOS REALES DESDE API
  // ============================================
  
  useEffect(() => {
    const cargarDatosCuentaResultados = async () => {
      setCargandoDatos(true);
      try {
        const fechaInicio = new Date();
        fechaInicio.setDate(1); // Primer día del mes
        const fechaFin = new Date(); // Hoy

        const empresaId = String(
          selectedContext[0]?.empresa_id || (empresasConfig[0] as any)?.id || 'HOYPCM000'
        ).trim();
        const puntoVentaId = String(
          selectedContext[0]?.punto_venta_id || puntosVentaArray[0]?.id || ''
        ).trim();
        
        const params: any = {
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          modo_visualizacion: modoVisualizacion
        };
        if (empresaId) params.empresa_id = empresaId;
        if (puntoVentaId) params.punto_venta_id = puntoVentaId;

        const datos = await finanzasApi.obtenerCuentaResultados(params);
        console.log('🔍 Datos cuenta resultados desde API:', datos);
        
        if (datos && datos.lineas) {
          // Transformar datos del API al formato esperado por el componente
          // El API devuelve solo lineas de detalle, necesitamos calcular los totales
          const lineas = datos.lineas || [];
          
          // Calcular totales por grupo
          const calcularTotalGrupo = (grupo: string): Linea => {
            const lineasGrupo = lineas.filter((l: any) => l.grupo === grupo);
            const objetivo_mes = lineasGrupo.reduce((sum, l: any) => sum + l.objetivo_mes, 0);
            const importe_real = lineasGrupo.reduce((sum, l: any) => sum + l.importe_real, 0);
            const cumplimiento_pct = objetivo_mes > 0 ? (importe_real / objetivo_mes) * 100 : 0;
            
            let concepto = '';
            switch (grupo) {
              case 'INGRESOS_NETOS':
                concepto = 'TOTAL INGRESOS NETOS';
                break;
              case 'COSTE_VENTAS':
                concepto = 'TOTAL COSTE DE VENTAS';
                break;
              case 'GASTOS_OPERATIVOS':
                concepto = 'TOTAL GASTOS OPERATIVOS';
                break;
              case 'COSTES_ESTRUCTURALES':
                concepto = 'TOTAL COSTES ESTRUCTURALES';
                break;
            }
            
            return {
              id: `TOTAL_${grupo}`,
              grupo: grupo as any,
              concepto,
              tipo: 'total_grupo',
              objetivo_mes,
              objetivo_visible: objetivo_mes,
              importe_real,
              cumplimiento_pct,
              estado: cumplimiento_pct >= 100 ? 'up' : cumplimiento_pct >= 90 ? 'flat' : 'down'
            };
          };
          
          const totalIngresosNetos = calcularTotalGrupo('INGRESOS_NETOS');
          const totalCosteVentas = calcularTotalGrupo('COSTE_VENTAS');
          const totalGastosOperativos = calcularTotalGrupo('GASTOS_OPERATIVOS');
          const totalCostesEstructurales = calcularTotalGrupo('COSTES_ESTRUCTURALES');
          
          // MARGEN BRUTO
          const margenBruto: Linea = {
            id: 'MARGEN_BRUTO',
            grupo: 'MARGEN_BRUTO' as any,
            concepto: 'MARGEN BRUTO',
            tipo: 'total_global',
            objetivo_mes: totalIngresosNetos.objetivo_mes - totalCosteVentas.objetivo_mes,
            objetivo_visible: totalIngresosNetos.objetivo_mes - totalCosteVentas.objetivo_mes,
            importe_real: totalIngresosNetos.importe_real - totalCosteVentas.importe_real,
            cumplimiento_pct: 100,
            estado: 'up'
          };
          
          // EBITDA
          const ebitda: Linea = {
            id: 'EBITDA',
            grupo: 'EBITDA' as any,
            concepto: 'EBITDA',
            tipo: 'total_global',
            objetivo_mes: margenBruto.objetivo_mes - totalGastosOperativos.objetivo_mes,
            objetivo_visible: margenBruto.objetivo_mes - totalGastosOperativos.objetivo_mes,
            importe_real: margenBruto.importe_real - totalGastosOperativos.importe_real,
            cumplimiento_pct: 100,
            estado: 'up'
          };
          
          // BAI
          const bai: Linea = {
            id: 'BAI',
            grupo: 'BAI' as any,
            concepto: 'BAI',
            tipo: 'total_global',
            objetivo_mes: ebitda.objetivo_mes - totalCostesEstructurales.objetivo_mes,
            objetivo_visible: ebitda.objetivo_mes - totalCostesEstructurales.objetivo_mes,
            importe_real: ebitda.importe_real - totalCostesEstructurales.importe_real,
            cumplimiento_pct: 100,
            estado: 'up'
          };
          
          // IMPUESTO
          const impuestoSociedades: Linea = {
            id: 'IMPUESTO_SOCIEDADES',
            grupo: 'IMPUESTO_SOCIEDADES' as any,
            concepto: 'IMPUESTO SOBRE SOCIEDADES (25%)',
            tipo: 'total_global',
            objetivo_mes: bai.objetivo_mes * 0.25,
            objetivo_visible: bai.objetivo_mes * 0.25,
            importe_real: bai.importe_real * 0.25,
            cumplimiento_pct: 100,
            estado: 'flat'
          };
          
          // BENEFICIO NETO
          const beneficioNeto: Linea = {
            id: 'BENEFICIO_NETO',
            grupo: 'BENEFICIO_NETO' as any,
            concepto: 'BENEFICIO NETO',
            tipo: 'total_global',
            objetivo_mes: bai.objetivo_mes - impuestoSociedades.objetivo_mes,
            objetivo_visible: bai.objetivo_mes - impuestoSociedades.objetivo_mes,
            importe_real: bai.importe_real - impuestoSociedades.importe_real,
            cumplimiento_pct: 100,
            estado: 'up'
          };
          
          const totales = [
            totalIngresosNetos, 
            totalCosteVentas, 
            totalGastosOperativos, 
            margenBruto, 
            ebitda, 
            totalCostesEstructurales, 
            bai, 
            impuestoSociedades, 
            beneficioNeto
          ];
          
          const datosTransformados: CuentaResultadosData = {
            filtros: {
              empresa_id: empresaId,
              punto_venta_id_base: puntoVentaId || '',
              punto_venta_id_comparada: null,
              periodo_tipo: 'mes',
              fecha_inicio: params.fecha_inicio,
              fecha_fin: params.fecha_fin,
              modo_visualizacion: modoVisualizacion
            },
            lineas: lineas.map((l: any) => ({
              id: l.id,
              grupo: l.grupo,
              concepto: l.concepto,
              tipo: l.tipo || 'detalle',
              objetivo_mes: l.objetivo_mes,
              objetivo_visible: l.objetivo_mes,
              importe_real: l.importe_real,
              cumplimiento_pct: l.cumplimiento_pct,
              estado: l.estado
            })),
            totales,
            comparativa: {
              activo: false,
              nombre_tienda_comparada: null,
              lineas: []
            }
          };
          
          console.log('✅ Datos transformados correctamente:', datosTransformados);
          setDatosAPI(datosTransformados);
        }
      } catch (error) {
        console.error('Error cargando datos cuenta resultados:', error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatosCuentaResultados();
  }, [modoVisualizacion, selectedContext, empresasConfig, puntosVentaArray]);

  // ============================================
  // SIN MOCKS
  // ============================================
  // Los datos se cargan desde el API en el primer useEffect.

  // Sincronizar con props externas
  useEffect(() => {
    setComparativaLocal(comparativaActiva);
  }, [comparativaActiva]);

  useEffect(() => {
    if (tiendaComparativa) {
      // Intentar encontrar el PDV por nombre (legacy) o usar directamente si es un ID
      const match = (puntosVentaArray || []).find(p => p.nombre === tiendaComparativa);
      setPdvComparado(match?.id || tiendaComparativa);
    }
  }, [tiendaComparativa, puntosVentaArray]);

  useEffect(() => {
    setModoVisualizacion(tipoPeriodo === 'Mes completo' ? 'mes_completo' : 'acumulado_hoy');
  }, [tipoPeriodo]);

  // ============================================
  // FUNCIONES DE UI
  // ============================================

  const toggleSeccion = (seccion: string) => {
    setExpandido(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  const formatEuro = (valor: number): string => {
    // Formato europeo: punto para miles, coma para decimales
    const partes = valor.toFixed(0).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return partes.join(',');
  };

  const renderIndicador = (linea: Linea) => {
    if (linea.estado === 'up') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (linea.estado === 'flat') {
      return <Minus className="w-5 h-5 text-amber-600" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
  };

  const obtenerLinea = (id: string): Linea | undefined => {
    if (!datosAPI) return undefined;
    return [...datosAPI.lineas, ...datosAPI.totales].find(l => l.id === id);
  };

  const obtenerValorComparativa = (lineaId: string): number | null => {
    if (!datosAPI || !datosAPI.comparativa.activo) return null;
    const lineaComp = datosAPI.comparativa.lineas.find(l => l.id === lineaId);
    return lineaComp ? lineaComp.importe_comparada : null;
  };

  // ============================================
  // ESTADÍSTICAS CALCULADAS DINÁMICAMENTE
  // ============================================
  // IMPORTANTE: Este useMemo debe estar ANTES del early return para evitar violación de Rules of Hooks
  const estadisticas = useMemo(() => {
    if (!datosAPI) return null;

    const totalIngresosReal = obtenerLinea('TOTAL_INGRESOS_NETOS')?.importe_real || 0;
    const totalIngresosObjetivo = obtenerLinea('TOTAL_INGRESOS_NETOS')?.objetivo_visible || 0;
    const totalCosteReal = obtenerLinea('TOTAL_COSTE_VENTAS')?.importe_real || 0;
    const totalGastosReal = obtenerLinea('TOTAL_GASTOS_OPERATIVOS')?.importe_real || 0;
    const margenBrutoReal = obtenerLinea('MARGEN_BRUTO')?.importe_real || 0;
    const ebitdaReal = obtenerLinea('EBITDA')?.importe_real || 0;
    
    const margenBrutoPct = totalIngresosReal > 0 ? (margenBrutoReal / totalIngresosReal) * 100 : 0;
    const ebitdaPct = totalIngresosReal > 0 ? (ebitdaReal / totalIngresosReal) * 100 : 0;
    const cumplimientoIngresos = obtenerLinea('TOTAL_INGRESOS_NETOS')?.cumplimiento_pct || 0;
    const estadoIngresos = obtenerLinea('TOTAL_INGRESOS_NETOS')?.estado || 'flat';
    
    // Contar líneas por estado
    const lineasUp = datosAPI.lineas.filter(l => l.estado === 'up').length;
    const lineasFlat = datosAPI.lineas.filter(l => l.estado === 'flat').length;
    const lineasDown = datosAPI.lineas.filter(l => l.estado === 'down').length;
    
    // Mejor y peor performance
    const lineasIngresos = datosAPI.lineas.filter(l => l.grupo === 'INGRESOS_NETOS');
    const mejorLineaIngresos = lineasIngresos.length > 0 
      ? lineasIngresos.reduce((max, l) => l.cumplimiento_pct > max.cumplimiento_pct ? l : max, lineasIngresos[0])
      : null;

    return {
      totalIngresosReal,
      totalIngresosObjetivo,
      totalCosteReal,
      totalGastosReal,
      margenBrutoReal,
      ebitdaReal,
      margenBrutoPct,
      ebitdaPct,
      cumplimientoIngresos,
      estadoIngresos,
      lineasUp,
      lineasFlat,
      lineasDown,
      mejorLineaIngresos,
    };
  }, [datosAPI]);

  // Early return si no hay estadísticas (y por ende no hay datosAPI)
  if (!estadisticas || !datosAPI) return <div>Cargando...</div>;

  // Ahora podemos desestructurar con seguridad
  const { filtros, lineas, totales, comparativa } = datosAPI;

  // Agrupar líneas por grupo
  const lineasIngresos = lineas.filter(l => l.grupo === 'INGRESOS_NETOS');
  const lineasCosteVentas = lineas.filter(l => l.grupo === 'COSTE_VENTAS');
  const lineasGastosOperativos = lineas.filter(l => l.grupo === 'GASTOS_OPERATIVOS');
  const lineasCostesEstructurales = lineas.filter(l => l.grupo === 'COSTES_ESTRUCTURALES');

  const totalIngresosNetos = totales.find(t => t.id === 'TOTAL_INGRESOS_NETOS')!;
  const totalCosteVentas = totales.find(t => t.id === 'TOTAL_COSTE_VENTAS')!;
  const totalGastosOperativos = totales.find(t => t.id === 'TOTAL_GASTOS_OPERATIVOS')!;
  const margenBruto = totales.find(t => t.id === 'MARGEN_BRUTO')!;
  const ebitda = totales.find(t => t.id === 'EBITDA')!;
  const totalCostesEstructurales = totales.find(t => t.id === 'TOTAL_COSTES_ESTRUCTURALES')!;
  const bai = totales.find(t => t.id === 'BAI')!;
  const impuestoSociedades = totales.find(t => t.id === 'IMPUESTO_SOCIEDADES')!;
  const beneficioNeto = totales.find(t => t.id === 'BENEFICIO_NETO')!;

  // Obtener texto contextual para la columna de importe
  const textoContextual = modoVisualizacion === 'mes_completo' 
    ? 'Resultados del mes completo' 
    : 'Resultados acumulados hasta hoy';

  // ============================================
  // FUNCIÓN PARA RENDERIZAR INDICADOR DE COMPARATIVA
  // ============================================
  const renderIndicadorComparativa = (lineaId: string, importeActual: number) => {
    if (!comparativa.activo) return null;
    
    const lineaComp = comparativa.lineas.find(l => l.id === lineaId);
    if (!lineaComp) return null;

    const importeComparada = lineaComp.importe_comparada;
    
    // Calcular diferencias
    const estado_comparativa_abs = importeActual - importeComparada;
    const estado_comparativa_pct = (importeActual - importeComparada) / Math.abs(importeComparada) * 100;
    
    // Determinar si es positivo o negativo
    const esPositivo = estado_comparativa_pct >= 0;
    
    // Formatear porcentaje
    const porcentajeTexto = `${esPositivo ? '+' : ''}${estado_comparativa_pct.toFixed(1)}%`;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center justify-center gap-1">
              {esPositivo ? (
                <ArrowUp className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${esPositivo ? 'text-green-600' : 'text-red-600'}`}>
                {porcentajeTexto}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-left space-y-1">
              <div className="font-semibold border-b border-gray-700 pb-1 mb-1">
                Comparativa vs {comparativa.nombre_tienda_comparada}
              </div>
              <div>
                <span className="text-gray-300">Diferencia absoluta:</span>
                <span className={`ml-2 font-semibold ${esPositivo ? 'text-green-400' : 'text-red-400'}`}>
                  {esPositivo ? '+' : ''}{formatEuro(estado_comparativa_abs)} €
                </span>
              </div>
              <div>
                <span className="text-gray-300">Diferencia porcentual:</span>
                <span className={`ml-2 font-semibold ${esPositivo ? 'text-green-400' : 'text-red-400'}`}>
                  {porcentajeTexto}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* INDICADOR DE CARGA */}
      {cargandoDatos && (
        <div className="flex justify-center items-center p-4">
          <p className="text-gray-500 text-sm">Cargando datos reales...</p>
        </div>
      )}
      
      {/* FILTRO JERÁRQUICO */}
      <FiltroContextoJerarquico
        selectedContext={selectedContext}
        onChange={setSelectedContext}
      />
      
      {/* TABLA P&L */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Cuenta de Resultados
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {selectedContext.length > 0 && selectedContext[0].punto_venta_id 
              ? getNombrePDVConMarcas(selectedContext[0].punto_venta_id)
              : 'Todas las empresas'} - {datosAPI?.filtros?.fecha_inicio ? new Date(datosAPI.filtros.fecha_inicio).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : periodoSeleccionado}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="w-1/4 text-xs sm:text-sm">Concepto general</TableHead>
                  <TableHead className="w-1/3 text-xs sm:text-sm hidden sm:table-cell">Subconcepto / detalle</TableHead>
                  <TableHead className="text-right w-1/6 text-xs sm:text-sm">
                    <div className="flex flex-col items-end">
                      {comparativa.activo ? (
                        <>
                          <span className="text-xs sm:text-sm">{comparativa.nombre_tienda_comparada} (€)</span>
                          <span className="text-[10px] sm:text-xs text-gray-400 font-normal">Tienda comparada</span>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm">Objetivo (€)</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-1/6 text-xs sm:text-sm">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] sm:text-xs text-gray-600 font-normal mb-1">
                        {textoContextual}
                      </span>
                      <span className="text-xs sm:text-sm">Importe (€)</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-16 text-xs sm:text-sm">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* INGRESOS NETOS */}
                <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleSeccion('ingresosNetos')}>
                  <TableCell className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {expandido.ingresosNetos ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="text-xs sm:text-sm">INGRESOS NETOS</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-center"></TableCell>
                </TableRow>

                {expandido.ingresosNetos && lineasIngresos.map((linea) => (
                  <TableRow key={linea.id} className="bg-gray-50">
                    <TableCell className="hidden sm:table-cell"></TableCell>
                    <TableCell className="pl-4 sm:pl-8 text-xs sm:text-sm">{linea.concepto}</TableCell>
                    <TableCell className="text-right text-gray-600 text-xs sm:text-sm">
                      {comparativa.activo 
                        ? formatEuro(obtenerValorComparativa(linea.id) || 0)
                        : formatEuro(linea.objetivo_visible)
                      }
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{formatEuro(linea.importe_real)}</TableCell>
                    <TableCell className="text-center">
                      {!comparativa.activo && renderIndicador(linea)}
                      {comparativa.activo && renderIndicadorComparativa(linea.id, linea.importe_real)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* TOTAL INGRESOS NETOS */}
                <TableRow className="bg-teal-50 border-y">
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalIngresosNetos.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalIngresosNetos.concepto}</span>
                    <span className="hidden sm:inline">Suma de todos los ingresos</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">
                    {comparativa.activo
                      ? formatEuro(comparativa.lineas.filter(l => lineasIngresos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0))
                      : formatEuro(totalIngresosNetos.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">{formatEuro(totalIngresosNetos.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(totalIngresosNetos)}
                    {comparativa.activo && renderIndicadorComparativa(totalIngresosNetos.id, totalIngresosNetos.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* COSTE DE VENTAS */}
                <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleSeccion('costeVentas')}>
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {expandido.costeVentas ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="text-xs sm:text-sm">COSTE DE VENTAS</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-xs sm:text-sm sm:hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1">
                      {expandido.costeVentas ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span className="text-xs">COSTE DE VENTAS</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-center"></TableCell>
                </TableRow>

                {expandido.costeVentas && lineasCosteVentas.map((linea) => (
                  <TableRow key={linea.id} className="bg-gray-50">
                    <TableCell className="hidden sm:table-cell"></TableCell>
                    <TableCell className="pl-4 sm:pl-8 text-xs sm:text-sm">{linea.concepto}</TableCell>
                    <TableCell className="text-right text-gray-600 text-xs sm:text-sm">
                      {comparativa.activo 
                        ? formatEuro(obtenerValorComparativa(linea.id) || 0)
                        : formatEuro(linea.objetivo_visible)
                      }
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{formatEuro(linea.importe_real)}</TableCell>
                    <TableCell className="text-center">
                      {!comparativa.activo && renderIndicador(linea)}
                      {comparativa.activo && renderIndicadorComparativa(linea.id, linea.importe_real)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* TOTAL COSTE DE VENTAS */}
                <TableRow className="bg-teal-50 border-y">
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalCosteVentas.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalCosteVentas.concepto}</span>
                    <span className="hidden sm:inline">Suma de costes de ventas</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">
                    {comparativa.activo
                      ? formatEuro(comparativa.lineas.filter(l => lineasCosteVentas.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0))
                      : formatEuro(totalCosteVentas.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">{formatEuro(totalCosteVentas.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(totalCosteVentas)}
                    {comparativa.activo && renderIndicadorComparativa(totalCosteVentas.id, totalCosteVentas.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-2 sm:h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* MARGEN BRUTO */}
                <TableRow className="bg-yellow-50 border-y-2 border-yellow-300">
                  <TableCell className="font-bold text-sm sm:text-base md:text-lg hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {margenBruto.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{margenBruto.concepto}</span>
                    <span className="hidden sm:inline">Ingresos netos – Coste de ventas</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">
                    {comparativa.activo
                      ? formatEuro(
                          comparativa.lineas.filter(l => lineasIngresos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCosteVentas.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0)
                        )
                      : formatEuro(margenBruto.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">{formatEuro(margenBruto.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(margenBruto)}
                    {comparativa.activo && renderIndicadorComparativa(margenBruto.id, margenBruto.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* GASTOS OPERATIVOS */}
                <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleSeccion('gastosOperativos')}>
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {expandido.gastosOperativos ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="text-xs sm:text-sm">GASTOS OPERATIVOS</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-xs sm:text-sm sm:hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1">
                      {expandido.gastosOperativos ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span className="text-xs">GASTOS OPERATIVOS</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-center"></TableCell>
                </TableRow>

                {expandido.gastosOperativos && lineasGastosOperativos.map((linea) => (
                  <TableRow key={linea.id} className="bg-gray-50">
                    <TableCell className="hidden sm:table-cell"></TableCell>
                    <TableCell className="pl-4 sm:pl-8 text-xs sm:text-sm">{linea.concepto}</TableCell>
                    <TableCell className="text-right text-gray-600 text-xs sm:text-sm">
                      {comparativa.activo 
                        ? formatEuro(obtenerValorComparativa(linea.id) || 0)
                        : formatEuro(linea.objetivo_visible)
                      }
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{formatEuro(linea.importe_real)}</TableCell>
                    <TableCell className="text-center">
                      {!comparativa.activo && renderIndicador(linea)}
                      {comparativa.activo && renderIndicadorComparativa(linea.id, linea.importe_real)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* TOTAL GASTOS OPERATIVOS */}
                <TableRow className="bg-teal-50 border-y">
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalGastosOperativos.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalGastosOperativos.concepto}</span>
                    <span className="hidden sm:inline">Suma de gastos operativos</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">
                    {comparativa.activo
                      ? formatEuro(comparativa.lineas.filter(l => lineasGastosOperativos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0))
                      : formatEuro(totalGastosOperativos.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">{formatEuro(totalGastosOperativos.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(totalGastosOperativos)}
                    {comparativa.activo && renderIndicadorComparativa(totalGastosOperativos.id, totalGastosOperativos.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-2 sm:h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* EBITDA */}
                <TableRow className="bg-green-50 border-y-2 border-green-300">
                  <TableCell className="font-bold text-sm sm:text-base md:text-lg hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {ebitda.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{ebitda.concepto}</span>
                    <span className="hidden sm:inline">Margen bruto – Gastos operativos</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">
                    {comparativa.activo
                      ? formatEuro(
                          comparativa.lineas.filter(l => lineasIngresos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCosteVentas.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasGastosOperativos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0)
                        )
                      : formatEuro(ebitda.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">{formatEuro(ebitda.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(ebitda)}
                    {comparativa.activo && renderIndicadorComparativa(ebitda.id, ebitda.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-2 sm:h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* COSTES ESTRUCTURALES */}
                <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleSeccion('costesEstructurales')}>
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {expandido.costesEstructurales ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                      <span className="text-xs sm:text-sm">COSTES ESTRUCTURALES</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-xs sm:text-sm sm:hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-1">
                      {expandido.costesEstructurales ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span className="text-xs">COSTES ESTRUCTURALES</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-right text-xs sm:text-sm"></TableCell>
                  <TableCell className="text-center"></TableCell>
                </TableRow>

                {expandido.costesEstructurales && lineasCostesEstructurales.map((linea) => (
                  <TableRow key={linea.id} className="bg-gray-50">
                    <TableCell className="hidden sm:table-cell"></TableCell>
                    <TableCell className="pl-4 sm:pl-8 text-xs sm:text-sm">{linea.concepto}</TableCell>
                    <TableCell className="text-right text-gray-600 text-xs sm:text-sm">
                      {comparativa.activo 
                        ? formatEuro(obtenerValorComparativa(linea.id) || 0)
                        : formatEuro(linea.objetivo_visible)
                      }
                    </TableCell>
                    <TableCell className="text-right text-xs sm:text-sm">{formatEuro(linea.importe_real)}</TableCell>
                    <TableCell className="text-center">
                      {!comparativa.activo && renderIndicador(linea)}
                      {comparativa.activo && renderIndicadorComparativa(linea.id, linea.importe_real)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* TOTAL COSTES ESTRUCTURALES */}
                <TableRow className="bg-orange-50 border-y">
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalCostesEstructurales.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{totalCostesEstructurales.concepto}</span>
                    <span className="hidden sm:inline">Suma de costes estructurales</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">
                    {comparativa.activo
                      ? formatEuro(comparativa.lineas.filter(l => lineasCostesEstructurales.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0))
                      : formatEuro(totalCostesEstructurales.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">{formatEuro(totalCostesEstructurales.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(totalCostesEstructurales)}
                    {comparativa.activo && renderIndicadorComparativa(totalCostesEstructurales.id, totalCostesEstructurales.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-2 sm:h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* BAI (Beneficio Antes de Impuestos) */}
                <TableRow className="bg-purple-50 border-y-2 border-purple-300">
                  <TableCell className="font-bold text-sm sm:text-base md:text-lg hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {bai.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{bai.concepto}</span>
                    <span className="hidden sm:inline">EBITDA – Costes estructurales</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">
                    {comparativa.activo
                      ? formatEuro(
                          comparativa.lineas.filter(l => lineasIngresos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCosteVentas.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasGastosOperativos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCostesEstructurales.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0)
                        )
                      : formatEuro(bai.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">{formatEuro(bai.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(bai)}
                    {comparativa.activo && renderIndicadorComparativa(bai.id, bai.importe_real)}
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-2 sm:h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* IMPUESTO SOBRE SOCIEDADES */}
                <TableRow className="bg-red-50 border-y border-red-200">
                  <TableCell className="font-bold text-xs sm:text-sm hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {impuestoSociedades.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm text-red-700">
                    <span className="sm:hidden font-bold text-xs" style={{ fontFamily: 'Poppins, sans-serif' }}>{impuestoSociedades.concepto}</span>
                    <span className="hidden sm:inline">Estimado al 25% del BAI</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm text-red-700">
                    {comparativa.activo
                      ? formatEuro(
                          (comparativa.lineas.filter(l => lineasIngresos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCosteVentas.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasGastosOperativos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCostesEstructurales.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0)) * 0.25
                        )
                      : formatEuro(impuestoSociedades.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm text-red-700">{formatEuro(impuestoSociedades.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    <Minus className="w-4 h-4 text-gray-400 mx-auto" />
                  </TableCell>
                </TableRow>

                {/* Espaciador */}
                <TableRow className="h-2 sm:h-4">
                  <TableCell colSpan={5}></TableCell>
                </TableRow>

                {/* BENEFICIO NETO */}
                <TableRow className="bg-blue-50 border-y-2 border-blue-400">
                  <TableCell className="font-bold text-sm sm:text-base md:text-lg hidden sm:table-cell" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {beneficioNeto.concepto}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <span className="sm:hidden font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{beneficioNeto.concepto}</span>
                    <span className="hidden sm:inline">BAI – Impuesto sobre sociedades</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">
                    {comparativa.activo
                      ? formatEuro(
                          (comparativa.lineas.filter(l => lineasIngresos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCosteVentas.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasGastosOperativos.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0) -
                          comparativa.lineas.filter(l => lineasCostesEstructurales.some(li => li.id === l.id)).reduce((sum, l) => sum + l.importe_comparada, 0)) * 0.75
                        )
                      : formatEuro(beneficioNeto.objetivo_visible)
                    }
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm sm:text-base md:text-lg">{formatEuro(beneficioNeto.importe_real)}</TableCell>
                  <TableCell className="text-center">
                    {!comparativa.activo && renderIndicador(beneficioNeto)}
                    {comparativa.activo && renderIndicadorComparativa(beneficioNeto.id, beneficioNeto.importe_real)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}