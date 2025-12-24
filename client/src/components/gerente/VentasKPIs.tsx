/**
 * 📊 VENTAS KPIs - Dashboard Gerente
 * 
 * Componente mejorado con StatsCard para mostrar
 * los KPIs principales de ventas con trends
 */

import { StatsCard } from '../ui/stats-card';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';

interface VentasKPIsProps {
  ventas_mostrador?: number;
  variacion_mostrador?: number;
  ventas_app_web?: number;
  variacion_app_web?: number;
  ventas_terceros?: number;
  variacion_terceros?: number;
  ventas_efectivo?: number;
  variacion_efectivo?: number;
}

export function VentasKPIs({
  ventas_mostrador,
  variacion_mostrador,
  ventas_app_web,
  variacion_app_web,
  ventas_terceros,
  variacion_terceros,
  ventas_efectivo,
  variacion_efectivo
}: VentasKPIsProps) {
  const formatCurrency = (value?: number) => {
    if (!value) return '€0,00';
    return `€${value.toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Mostrador */}
      <StatsCard
        title="Mostrador"
        value={formatCurrency(ventas_mostrador)}
        icon={ShoppingCart}
        trend={{
          value: variacion_mostrador || 0,
          label: 'vs mes anterior'
        }}
        variant="gradient"
        iconColor="#4DB8BA"
      />

      {/* App/Web */}
      <StatsCard
        title="App/Web"
        value={formatCurrency(ventas_app_web)}
        icon={Package}
        trend={{
          value: variacion_app_web || 0,
          label: 'vs mes anterior'
        }}
        variant="gradient"
        iconColor="#3B82F6"
      />

      {/* Terceros */}
      <StatsCard
        title="Terceros"
        value={formatCurrency(ventas_terceros)}
        icon={Users}
        trend={{
          value: variacion_terceros || 0,
          label: 'vs mes anterior'
        }}
        variant="gradient"
        iconColor="#A855F7"
      />

      {/* Total Efectivo */}
      <StatsCard
        title="Total Efectivo"
        value={formatCurrency(ventas_efectivo)}
        icon={DollarSign}
        trend={{
          value: variacion_efectivo || 0,
          label: 'vs mes anterior'
        }}
        variant="gradient"
        iconColor="#10B981"
      />
    </div>
  );
}
