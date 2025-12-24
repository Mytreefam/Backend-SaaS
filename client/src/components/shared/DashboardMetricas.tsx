/**
 * 📊 DASHBOARD DE MÉTRICAS UNIFICADO
 * 
 * Componente reutilizable que muestra KPIs y estadísticas
 * de forma visual y consistente en toda la aplicación.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================
// TIPOS
// ============================================

export interface MetricaKPI {
  id: string;
  titulo: string;
  valor: number | string;
  valorAnterior?: number;
  unidad?: string;
  formato?: 'numero' | 'moneda' | 'porcentaje' | 'tiempo';
  tendencia?: 'subida' | 'bajada' | 'neutro';
  objetivo?: number;
  descripcion?: string;
  alerta?: 'exito' | 'advertencia' | 'error' | 'info';
  icono?: React.ReactNode;
}

export interface GrupoMetricas {
  titulo: string;
  descripcion?: string;
  metricas: MetricaKPI[];
}

// ============================================
// UTILIDADES DE FORMATO
// ============================================

const formatearValor = (
  valor: number | string,
  formato?: 'numero' | 'moneda' | 'porcentaje' | 'tiempo',
  unidad?: string
): string => {
  if (typeof valor === 'string') return valor;
  
  switch (formato) {
    case 'moneda':
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(valor);
      
    case 'porcentaje':
      return `${valor.toFixed(1)}%`;
      
    case 'tiempo':
      return `${valor.toFixed(0)}h`;
      
    case 'numero':
    default:
      const formatted = new Intl.NumberFormat('es-ES').format(valor);
      return unidad ? `${formatted} ${unidad}` : formatted;
  }
};

const calcularCambio = (actual: number, anterior: number): number => {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return ((actual - anterior) / anterior) * 100;
};

const calcularProgreso = (actual: number, objetivo: number): number => {
  if (objetivo === 0) return 0;
  return Math.min((actual / objetivo) * 100, 100);
};

// ============================================
// COMPONENTE: TARJETA KPI
// ============================================

interface TarjetaKPIProps {
  metrica: MetricaKPI;
  size?: 'sm' | 'md' | 'lg';
}

export const TarjetaKPI = ({ metrica, size = 'md' }: TarjetaKPIProps) => {
  const {
    titulo,
    valor,
    valorAnterior,
    formato,
    unidad,
    tendencia,
    objetivo,
    descripcion,
    alerta,
    icono
  } = metrica;
  
  // Calcular cambio porcentual
  const cambio = valorAnterior !== undefined && typeof valor === 'number'
    ? calcularCambio(valor, valorAnterior)
    : null;
  
  // Calcular progreso hacia objetivo
  const progreso = objetivo !== undefined && typeof valor === 'number'
    ? calcularProgreso(valor, objetivo)
    : null;
  
  // Determinar color según alerta
  const colorAlerta = {
    exito: 'text-green-600 bg-green-50 border-green-200',
    advertencia: 'text-amber-600 bg-amber-50 border-amber-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  }[alerta || 'info'];
  
  // Tamaños
  const sizes = {
    sm: {
      card: 'p-3',
      titulo: 'text-xs',
      valor: 'text-lg',
      cambio: 'text-xs'
    },
    md: {
      card: 'p-4',
      titulo: 'text-sm',
      valor: 'text-2xl',
      cambio: 'text-sm'
    },
    lg: {
      card: 'p-6',
      titulo: 'text-base',
      valor: 'text-3xl',
      cambio: 'text-base'
    }
  };
  
  const sizeClasses = sizes[size];
  
  return (
    <Card className={cn('border-2 transition-all hover:shadow-lg', alerta && colorAlerta)}>
      <CardContent className={sizeClasses.card}>
        {/* Header con título e icono */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className={cn('text-gray-600 font-medium', sizeClasses.titulo)}>
              {titulo}
            </p>
            {descripcion && (
              <p className="text-xs text-gray-500 mt-0.5">{descripcion}</p>
            )}
          </div>
          {icono && (
            <div className="ml-2 text-gray-400">
              {icono}
            </div>
          )}
        </div>
        
        {/* Valor principal */}
        <div className={cn('font-bold mb-2', sizeClasses.valor)}>
          {formatearValor(valor, formato, unidad)}
        </div>
        
        {/* Tendencia y cambio */}
        {cambio !== null && (
          <div className="flex items-center gap-2">
            {tendencia === 'subida' && (
              <div className="flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className={cn('font-medium', sizeClasses.cambio)}>
                  +{cambio.toFixed(1)}%
                </span>
              </div>
            )}
            {tendencia === 'bajada' && (
              <div className="flex items-center text-red-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className={cn('font-medium', sizeClasses.cambio)}>
                  {cambio.toFixed(1)}%
                </span>
              </div>
            )}
            {tendencia === 'neutro' && (
              <div className="flex items-center text-gray-600">
                <Minus className="w-4 h-4 mr-1" />
                <span className={cn('font-medium', sizeClasses.cambio)}>
                  0.0%
                </span>
              </div>
            )}
            <span className="text-xs text-gray-500">vs anterior</span>
          </div>
        )}
        
        {/* Progreso hacia objetivo */}
        {progreso !== null && objetivo !== undefined && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Objetivo: {formatearValor(objetivo, formato, unidad)}</span>
              <span>{progreso.toFixed(0)}%</span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>
        )}
        
        {/* Badge de alerta */}
        {alerta && (
          <div className="mt-2">
            <Badge variant="outline" className={cn('text-xs', colorAlerta)}>
              {alerta === 'exito' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {alerta === 'advertencia' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {alerta === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {alerta === 'info' && <Info className="w-3 h-3 mr-1" />}
              {alerta}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// COMPONENTE: GRID DE KPIs
// ============================================

interface GridKPIsProps {
  metricas: MetricaKPI[];
  columnas?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}

export const GridKPIs = ({ metricas, columnas = 4, size = 'md' }: GridKPIsProps) => {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={cn('grid gap-4', gridClasses[columnas])}>
      {metricas.map(metrica => (
        <TarjetaKPI key={metrica.id} metrica={metrica} size={size} />
      ))}
    </div>
  );
};

// ============================================
// COMPONENTE: SECCIÓN DE MÉTRICAS
// ============================================

interface SeccionMetricasProps {
  grupo: GrupoMetricas;
  columnas?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  plegable?: boolean;
}

export const SeccionMetricas = ({
  grupo,
  columnas = 4,
  size = 'md',
  plegable = false
}: SeccionMetricasProps) => {
  return (
    <div className="space-y-4">
      {/* Header de sección */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{grupo.titulo}</h3>
        {grupo.descripcion && (
          <p className="text-sm text-gray-600 mt-1">{grupo.descripcion}</p>
        )}
      </div>
      
      {/* Grid de métricas */}
      <GridKPIs metricas={grupo.metricas} columnas={columnas} size={size} />
    </div>
  );
};

// ============================================
// COMPONENTE: DASHBOARD COMPLETO
// ============================================

interface DashboardMetricasProps {
  grupos: GrupoMetricas[];
  columnas?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}

export const DashboardMetricas = ({
  grupos,
  columnas = 4,
  size = 'md'
}: DashboardMetricasProps) => {
  return (
    <div className="space-y-8">
      {grupos.map((grupo, index) => (
        <SeccionMetricas
          key={index}
          grupo={grupo}
          columnas={columnas}
          size={size}
        />
      ))}
    </div>
  );
};

// ============================================
// COMPONENTE: MÉTRICA COMPACTA (Para tablas)
// ============================================

interface MetricaCompactaProps {
  valor: number | string;
  cambio?: number;
  formato?: 'numero' | 'moneda' | 'porcentaje';
}

export const MetricaCompacta = ({ valor, cambio, formato }: MetricaCompactaProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">
        {formatearValor(valor, formato)}
      </span>
      {cambio !== undefined && (
        <span className={cn(
          'text-xs flex items-center',
          cambio > 0 ? 'text-green-600' : cambio < 0 ? 'text-red-600' : 'text-gray-600'
        )}>
          {cambio > 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : cambio < 0 ? (
            <ArrowDownRight className="w-3 h-3" />
          ) : (
            <Minus className="w-3 h-3" />
          )}
          {Math.abs(cambio).toFixed(1)}%
        </span>
      )}
    </div>
  );
};

// ============================================
// UTILIDAD: CREAR MÉTRICA
// ============================================

export const crearMetrica = (
  titulo: string,
  valor: number | string,
  opciones?: Partial<MetricaKPI>
): MetricaKPI => {
  return {
    id: titulo.toLowerCase().replace(/\s+/g, '-'),
    titulo,
    valor,
    ...opciones
  };
};

// ============================================
// EXPORTAR
// ============================================

export default {
  TarjetaKPI,
  GridKPIs,
  SeccionMetricas,
  DashboardMetricas,
  MetricaCompacta,
  crearMetrica
};
