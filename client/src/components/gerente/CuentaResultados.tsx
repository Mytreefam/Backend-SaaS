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
import { PUNTOS_VENTA, getNombrePDVConMarcas } from '../../constants/empresaConfig';
import { dashboardGerenteApi } from '../../services/api/gerente.api';

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
  const [pdvComparado, setPdvComparado] = useState<string>(tiendaComparativa || 'PDV-TIANA');

  // Estado para datos
  const [datosAPI, setDatosAPI] = useState<CuentaResultadosData | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);

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
        
        const params = {
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          modo_visualizacion: modoVisualizacion
        };

        const datos = await dashboardGerenteApi.obtenerCuentaResultados(params);
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
              empresa_id: "EMP-001",
              punto_venta_id_base: "PDV-001", 
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
  }, [modoVisualizacion, selectedContext]);

  // ============================================
  // FUNCIONES DE CÁLCULO
  // ============================================

  const calcularDiasPeriodo = (fechaInicio: string, fechaFin: string): number => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  };

  const calcularDiasTranscurridos = (fechaInicio: string, fechaFin: string): number => {
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const fechaLimite = hoy < fin ? hoy : fin;
    const diferencia = fechaLimite.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1;
  };

  const calcularObjetivoVisible = (
    objetivoMes: number, 
    modoVis: 'mes_completo' | 'acumulado_hoy',
    diasPeriodo: number,
    diasTranscurridos: number
  ): number => {
    if (modoVis === 'mes_completo') {
      return objetivoMes;
    }
    return objetivoMes * (diasTranscurridos / diasPeriodo);
  };

  const simularImporteReal = (objetivoVisible: number, variacion: number): number => {
    // Simulamos importes reales basados en el objetivo con una variación
    return objetivoVisible * (1 + variacion / 100);
  };

  const calcularCumplimiento = (importeReal: number, objetivoVisible: number): number => {
    if (objetivoVisible === 0) return 0;
    return (importeReal / objetivoVisible) * 100;
  };

  const determinarEstado = (cumplimientoPct: number): 'up' | 'flat' | 'down' => {
    if (cumplimientoPct >= 100) return 'up';
    if (cumplimientoPct >= 90) return 'flat';
    return 'down';
  };

  // ============================================
  // GENERACIÓN DE MOCK DATA
  // ============================================

  const generarMockData = (): CuentaResultadosData => {
    // Usar fechas del mes actual
    const ahora = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
    
    const fechaInicio = primerDia.toISOString().split('T')[0];
    const fechaFin = ultimoDia.toISOString().split('T')[0];
    const diasPeriodo = calcularDiasPeriodo(fechaInicio, fechaFin);
    const diasTranscurridos = calcularDiasTranscurridos(fechaInicio, fechaFin);

    // Definir objetivos mensuales y variaciones para simular datos realistas
    const definicionesLineas = [
      // INGRESOS NETOS
      { id: 'ING_MOSTRADOR', grupo: 'INGRESOS_NETOS' as const, concepto: 'Ingresos por ventas en mostrador', objetivo_mes: 175000, variacion: 5, variacionComparada: 2 },
      { id: 'ING_APP_WEB', grupo: 'INGRESOS_NETOS' as const, concepto: 'Ingresos App / Web', objetivo_mes: 85000, variacion: 8, variacionComparada: 4 },
      { id: 'ING_TERCEROS', grupo: 'INGRESOS_NETOS' as const, concepto: 'Ingresos por terceros (apps de delivery)', objetivo_mes: 35000, variacion: -3, variacionComparada: -5 },
      { id: 'ING_OTROS', grupo: 'INGRESOS_NETOS' as const, concepto: 'Otros ingresos (eventos, alquiler de sala, etc.)', objetivo_mes: 8000, variacion: -10, variacionComparada: -8 },
      
      // COSTE DE VENTAS
      { id: 'CSV_MATERIAS', grupo: 'COSTE_VENTAS' as const, concepto: 'Materias primas alimentación (pan, bollería, etc.)', objetivo_mes: 75000, variacion: -5, variacionComparada: -3 },
      { id: 'CSV_BEBIDAS', grupo: 'COSTE_VENTAS' as const, concepto: 'Bebidas y complementos', objetivo_mes: 20000, variacion: -8, variacionComparada: -6 },
      { id: 'CSV_ENVASES', grupo: 'COSTE_VENTAS' as const, concepto: 'Envases y embalajes', objetivo_mes: 10000, variacion: -4, variacionComparada: -2 },
      { id: 'CSV_MERMAS', grupo: 'COSTE_VENTAS' as const, concepto: 'Mermas y roturas', objetivo_mes: 12000, variacion: 15, variacionComparada: 12 },
      { id: 'CSV_CONSUMOS', grupo: 'COSTE_VENTAS' as const, concepto: 'Consumos internos (productos para personal, etc.)', objetivo_mes: 8000, variacion: 18, variacionComparada: 15 },
      
      // GASTOS OPERATIVOS
      { id: 'GOP_PERSONAL', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Personal (sueldos + Seguridad Social)', objetivo_mes: 95000, variacion: -3, variacionComparada: -2 },
      { id: 'GOP_ALQUILER', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Alquiler del local', objetivo_mes: 18000, variacion: 0, variacionComparada: 0 },
      { id: 'GOP_SUMINISTROS', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Suministros (luz, agua, gas)', objetivo_mes: 9000, variacion: -8, variacionComparada: -6 },
      { id: 'GOP_LIMPIEZA', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Limpieza e higiene', objetivo_mes: 5000, variacion: -12, variacionComparada: -10 },
      { id: 'GOP_MARKETING', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Marketing y publicidad', objetivo_mes: 5000, variacion: -25, variacionComparada: -20 },
      { id: 'GOP_TRANSPORTE', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Transporte y reparto', objetivo_mes: 6000, variacion: -10, variacionComparada: -8 },
      { id: 'GOP_COMISIONES', grupo: 'GASTOS_OPERATIVOS' as const, concepto: 'Comisiones TPV / pasarela de pago', objetivo_mes: 5000, variacion: -12, variacionComparada: -10 },
      
      // COSTES ESTRUCTURALES
      { id: 'CES_AMORTIZACIONES', grupo: 'COSTES_ESTRUCTURALES' as const, concepto: 'Amortizaciones', objetivo_mes: 8000, variacion: 0, variacionComparada: 0 },
      { id: 'CES_SEGUROS', grupo: 'COSTES_ESTRUCTURALES' as const, concepto: 'Seguros', objetivo_mes: 3000, variacion: 0, variacionComparada: 0 },
      { id: 'CES_ASESORIA', grupo: 'COSTES_ESTRUCTURALES' as const, concepto: 'Asesoría legal y fiscal', objetivo_mes: 2500, variacion: 0, variacionComparada: 0 },
      { id: 'CES_TECNOLOGIA', grupo: 'COSTES_ESTRUCTURALES' as const, concepto: 'Tecnología y software', objetivo_mes: 2000, variacion: 0, variacionComparada: 0 },
      { id: 'CES_OTROS', grupo: 'COSTES_ESTRUCTURALES' as const, concepto: 'Otros gastos estructurales', objetivo_mes: 1500, variacion: 0, variacionComparada: 0 },
    ];

    // Generar líneas de detalle - usar datos reales si están disponibles
    const lineas: Linea[] = datosAPI?.lineas ? 
      // Usar datos reales del API
      datosAPI.lineas.map(lineaAPI => ({
        id: lineaAPI.id,
        grupo: lineaAPI.grupo as any,
        concepto: lineaAPI.concepto,
        tipo: lineaAPI.tipo as any,
        objetivo_mes: lineaAPI.objetivo_mes,
        objetivo_visible: lineaAPI.objetivo_mes, // Por ahora usar el objetivo mensual
        importe_real: lineaAPI.importe_real,
        cumplimiento_pct: lineaAPI.cumplimiento_pct,
        estado: lineaAPI.estado as any
      })) : 
      // Fallback a datos simulados solo si no hay datos del API
      definicionesLineas.map(def => {
        const objetivo_visible = calcularObjetivoVisible(
          def.objetivo_mes,
          modoVisualizacion,
          diasPeriodo,
          diasTranscurridos
        );
        const importe_real = simularImporteReal(objetivo_visible, def.variacion);
        const cumplimiento_pct = calcularCumplimiento(importe_real, objetivo_visible);
        const estado = determinarEstado(cumplimiento_pct);

        return {
          id: def.id,
          grupo: def.grupo,
          concepto: def.concepto,
          tipo: 'detalle',
          objetivo_mes: def.objetivo_mes,
          objetivo_visible,
          importe_real,
          cumplimiento_pct,
          estado
        };
      });

    // Calcular totales por grupo
    const calcularTotalGrupo = (grupo: string): Linea => {
      const lineasGrupo = lineas.filter(l => l.grupo === grupo);
      const objetivo_mes = lineasGrupo.reduce((sum, l) => sum + l.objetivo_mes, 0);
      const objetivo_visible = lineasGrupo.reduce((sum, l) => sum + l.objetivo_visible, 0);
      const importe_real = lineasGrupo.reduce((sum, l) => sum + l.importe_real, 0);
      const cumplimiento_pct = calcularCumplimiento(importe_real, objetivo_visible);
      const estado = determinarEstado(cumplimiento_pct);

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
      }

      return {
        id: `TOTAL_${grupo}`,
        grupo: grupo as any,
        concepto,
        tipo: 'total_grupo',
        objetivo_mes,
        objetivo_visible,
        importe_real,
        cumplimiento_pct,
        estado
      };
    };

    const totalIngresosNetos = calcularTotalGrupo('INGRESOS_NETOS');
    const totalCosteVentas = calcularTotalGrupo('COSTE_VENTAS');
    const totalGastosOperativos = calcularTotalGrupo('GASTOS_OPERATIVOS');

    // Calcular MARGEN BRUTO
    const margenBruto: Linea = {
      id: 'MARGEN_BRUTO',
      grupo: 'MARGEN_BRUTO',
      concepto: 'MARGEN BRUTO',
      tipo: 'total_global',
      objetivo_mes: totalIngresosNetos.objetivo_mes - totalCosteVentas.objetivo_mes,
      objetivo_visible: totalIngresosNetos.objetivo_visible - totalCosteVentas.objetivo_visible,
      importe_real: totalIngresosNetos.importe_real - totalCosteVentas.importe_real,
      cumplimiento_pct: calcularCumplimiento(
        totalIngresosNetos.importe_real - totalCosteVentas.importe_real,
        totalIngresosNetos.objetivo_visible - totalCosteVentas.objetivo_visible
      ),
      estado: determinarEstado(
        calcularCumplimiento(
          totalIngresosNetos.importe_real - totalCosteVentas.importe_real,
          totalIngresosNetos.objetivo_visible - totalCosteVentas.objetivo_visible
        )
      )
    };

    // Calcular EBITDA
    const ebitda: Linea = {
      id: 'EBITDA',
      grupo: 'EBITDA',
      concepto: 'EBITDA',
      tipo: 'total_global',
      objetivo_mes: margenBruto.objetivo_mes - totalGastosOperativos.objetivo_mes,
      objetivo_visible: margenBruto.objetivo_visible - totalGastosOperativos.objetivo_visible,
      importe_real: margenBruto.importe_real - totalGastosOperativos.importe_real,
      cumplimiento_pct: calcularCumplimiento(
        margenBruto.importe_real - totalGastosOperativos.importe_real,
        margenBruto.objetivo_visible - totalGastosOperativos.objetivo_visible
      ),
      estado: determinarEstado(
        calcularCumplimiento(
          margenBruto.importe_real - totalGastosOperativos.importe_real,
          margenBruto.objetivo_visible - totalGastosOperativos.objetivo_visible
        )
      )
    };

    // Calcular Total Costes Estructurales
    const totalCostesEstructurales = calcularTotalGrupo('COSTES_ESTRUCTURALES');

    // Calcular BAI (EBITDA - Costes Estructurales)
    const bai: Linea = {
      id: 'BAI',
      grupo: 'BAI',
      concepto: 'BAI',
      tipo: 'total_global',
      objetivo_mes: ebitda.objetivo_mes - totalCostesEstructurales.objetivo_mes,
      objetivo_visible: ebitda.objetivo_visible - totalCostesEstructurales.objetivo_visible,
      importe_real: ebitda.importe_real - totalCostesEstructurales.importe_real,
      cumplimiento_pct: calcularCumplimiento(
        ebitda.importe_real - totalCostesEstructurales.importe_real,
        ebitda.objetivo_visible - totalCostesEstructurales.objetivo_visible
      ),
      estado: determinarEstado(
        calcularCumplimiento(
          ebitda.importe_real - totalCostesEstructurales.importe_real,
          ebitda.objetivo_visible - totalCostesEstructurales.objetivo_visible
        )
      )
    };

    // Calcular IMPUESTO SOBRE SOCIEDADES (25% aprox. sobre BAI)
    const impuestoSociedades: Linea = {
      id: 'IMPUESTO_SOCIEDADES',
      grupo: 'IMPUESTO_SOCIEDADES',
      concepto: 'IMPUESTO SOBRE SOCIEDADES (25% aprox.)',
      tipo: 'total_global',
      objetivo_mes: bai.objetivo_mes * 0.25,
      objetivo_visible: bai.objetivo_visible * 0.25,
      importe_real: bai.importe_real * 0.25,
      cumplimiento_pct: 100, // Siempre es 25% del BAI
      estado: 'flat' as 'flat'
    };

    // Calcular BENEFICIO NETO (BAI - Impuesto)
    const beneficioNeto: Linea = {
      id: 'BENEFICIO_NETO',
      grupo: 'BENEFICIO_NETO',
      concepto: 'BENEFICIO NETO',
      tipo: 'total_global',
      objetivo_mes: bai.objetivo_mes - impuestoSociedades.objetivo_mes,
      objetivo_visible: bai.objetivo_visible - impuestoSociedades.objetivo_visible,
      importe_real: bai.importe_real - impuestoSociedades.importe_real,
      cumplimiento_pct: calcularCumplimiento(
        bai.importe_real - impuestoSociedades.importe_real,
        bai.objetivo_visible - impuestoSociedades.objetivo_visible
      ),
      estado: determinarEstado(
        calcularCumplimiento(
          bai.importe_real - impuestoSociedades.importe_real,
          bai.objetivo_visible - impuestoSociedades.objetivo_visible
        )
      )
    };

    // Generar datos de comparativa
    const lineasComparativa: LineaComparativa[] = definicionesLineas.map(def => {
      const objetivo_visible = calcularObjetivoVisible(
        def.objetivo_mes,
        modoVisualizacion,
        diasPeriodo,
        diasTranscurridos
      );
      const importe_base = simularImporteReal(objetivo_visible, def.variacion);
      const importe_comparada = simularImporteReal(objetivo_visible, def.variacionComparada);

      return {
        id: def.id,
        importe_base,
        importe_comparada
      };
    });

    // Obtener PDV seleccionado para mostrar
    const pdvSeleccionado = selectedContext.length > 0 && selectedContext[0].punto_venta_id 
      ? selectedContext[0].punto_venta_id 
      : 'PDV-TIANA';

    return {
      filtros: {
        empresa_id: selectedContext[0]?.empresa_id || 'EMP-001',
        punto_venta_id_base: pdvSeleccionado,
        punto_venta_id_comparada: comparativaLocal ? pdvComparado : null,
        periodo_tipo: 'mes',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        modo_visualizacion: modoVisualizacion
      },
      lineas,
      totales: [totalIngresosNetos, totalCosteVentas, totalGastosOperativos, margenBruto, ebitda, totalCostesEstructurales, bai, impuestoSociedades, beneficioNeto],
      comparativa: {
        activo: comparativaLocal,
        nombre_tienda_comparada: comparativaLocal ? (PUNTOS_VENTA[pdvComparado]?.nombre || pdvComparado) : null,
        lineas: lineasComparativa
      }
    };
  };

  // Los datos se cargan desde el API en el primer useEffect
  // No necesitamos regenerar mock data, usamos los datos reales del API

  // Sincronizar con props externas
  useEffect(() => {
    setComparativaLocal(comparativaActiva);
  }, [comparativaActiva]);

  useEffect(() => {
    if (tiendaComparativa) {
      // Intentar encontrar el PDV por nombre (legacy) o usar directamente si es un ID
      const pdvEncontrado = Object.values(PUNTOS_VENTA).find(pdv => pdv.nombre === tiendaComparativa);
      setPdvComparado(pdvEncontrado?.id || tiendaComparativa);
    }
  }, [tiendaComparativa]);

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