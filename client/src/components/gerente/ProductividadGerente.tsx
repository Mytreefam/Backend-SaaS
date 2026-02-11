import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Target, Clock, Users, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { gerenteConfigApi } from '../../services/api';

// ============================================
// INTERFACES
// ============================================

interface OKR {
  id: string;
  objetivo: string;
  progreso: number;
  equipo: string;
  prioridad: 'alta' | 'media' | 'baja';
  fechaLimite: string;
  responsable: string;
}

interface Equipo {
  nombre: string;
  eficiencia: number;
  miembros: number;
  okrsActivos: number;
}

export function ProductividadGerente() {
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    gerenteConfigApi.okrs
      .list({ activo: true })
      .then((data) => {
        if (cancelled) return;
        const mapped: OKR[] = (data || []).map((o: any) => ({
          id: String(o.id),
          objetivo: String(o.objetivo),
          progreso: Number(o.progreso || 0),
          equipo: String(o.equipo || 'Equipo'),
          prioridad: (String(o.prioridad || 'media') as any),
          fechaLimite: o.fechaLimite ? String(o.fechaLimite).slice(0, 10) : '',
          responsable: o.responsable ? String(o.responsable) : '—',
        }));
        setOkrs(mapped);

        // Equipos derivados de OKRs (sin mocks)
        const byEquipo: Record<string, { count: number; sum: number }> = {};
        mapped.forEach((k) => {
          byEquipo[k.equipo] = byEquipo[k.equipo] || { count: 0, sum: 0 };
          byEquipo[k.equipo].count += 1;
          byEquipo[k.equipo].sum += k.progreso;
        });
        const equiposDerivados: Equipo[] = Object.entries(byEquipo).map(([nombre, v]) => ({
          nombre,
          eficiencia: v.count ? Math.round(v.sum / v.count) : 0,
          miembros: 0,
          okrsActivos: v.count,
        }));
        setEquipos(equiposDerivados);
      })
      .catch((e) => {
        console.error('Error cargando OKRs:', e);
        if (!cancelled) {
          setOkrs([]);
          setEquipos([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================
  // CÁLCULOS DINÁMICOS CON useMemo
  // ============================================

  const estadisticas = useMemo(() => {
    // GRUPO 1: Totales y promedios de OKRs
    const totalOKRs = okrs.length;
    const progresoGeneral = okrs.reduce((sum, okr) => sum + okr.progreso, 0) / totalOKRs;
    
    // GRUPO 2: OKRs por estado
    const okrsCompletados = okrs.filter(okr => okr.progreso >= 100).length;
    const okrsEnBuenCamino = okrs.filter(okr => okr.progreso >= 70 && okr.progreso < 100).length;
    const okrsEnRiesgo = okrs.filter(okr => okr.progreso >= 50 && okr.progreso < 70).length;
    const okrsRetrasados = okrs.filter(okr => okr.progreso < 50).length;

    // GRUPO 3: Por prioridad
    const okrsAltaPrioridad = okrs.filter(okr => okr.prioridad === 'alta').length;
    const okrsMediaPrioridad = okrs.filter(okr => okr.prioridad === 'media').length;
    const okrsBajaPrioridad = okrs.filter(okr => okr.prioridad === 'baja').length;
    
    const progresoAltaPrioridad = okrs
      .filter(okr => okr.prioridad === 'alta')
      .reduce((sum, okr) => sum + okr.progreso, 0) / (okrsAltaPrioridad || 1);

    // GRUPO 4: Equipos y eficiencia
    const totalEquipos = equipos.length;
    const totalMiembros = equipos.reduce((sum, e) => sum + e.miembros, 0);
    const eficienciaPromedio = equipos.reduce((sum, e) => sum + e.eficiencia, 0) / totalEquipos;
    
    const equipoMasEficiente = equipos.reduce((max, e) => e.eficiencia > max.eficiencia ? e : max, equipos[0]);
    const equipoMenosEficiente = equipos.reduce((min, e) => e.eficiencia < min.eficiencia ? e : min, equipos[0]);

    // GRUPO 5: Equipos por rendimiento
    const equiposExcelentes = equipos.filter(e => e.eficiencia >= 90).length;
    const equiposBuenos = equipos.filter(e => e.eficiencia >= 80 && e.eficiencia < 90).length;
    const equiposMejorables = equipos.filter(e => e.eficiencia < 80).length;

    // GRUPO 6: Análisis temporal
    const fechaHoy = new Date('2025-11-28'); // Fecha del sistema
    const okrsProximosAVencer = okrs.filter(okr => {
      const fechaLimite = new Date(okr.fechaLimite);
      const diasRestantes = Math.floor((fechaLimite.getTime() - fechaHoy.getTime()) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 7 && diasRestantes >= 0;
    }).length;

    const okrsVencidos = okrs.filter(okr => {
      const fechaLimite = new Date(okr.fechaLimite);
      return fechaLimite < fechaHoy && okr.progreso < 100;
    }).length;

    // GRUPO 7: Distribución por equipo
    const okrsPorEquipo = okrs.reduce((acc, okr) => {
      acc[okr.equipo] = (acc[okr.equipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const equipoConMasOKRs = Object.entries(okrsPorEquipo).reduce((max, [equipo, cantidad]) => 
      cantidad > max.cantidad ? { equipo, cantidad } : max, 
      { equipo: '', cantidad: 0 }
    );

    // GRUPO 8: Tiempo estimado
    const okrsPendientes = totalOKRs - okrsCompletados;
    const tiempoEstimadoTotal = okrsPendientes * 1.5; // 1.5h por OKR pendiente (promedio)
    const tiempoEstimadoHoras = Math.floor(tiempoEstimadoTotal);
    const tiempoEstimadoMinutos = Math.round((tiempoEstimadoTotal - tiempoEstimadoHoras) * 60);

    return {
      totalOKRs,
      progresoGeneral,
      okrsCompletados,
      okrsEnBuenCamino,
      okrsEnRiesgo,
      okrsRetrasados,
      okrsAltaPrioridad,
      okrsMediaPrioridad,
      okrsBajaPrioridad,
      progresoAltaPrioridad,
      totalEquipos,
      totalMiembros,
      eficienciaPromedio,
      equipoMasEficiente,
      equipoMenosEficiente,
      equiposExcelentes,
      equiposBuenos,
      equiposMejorables,
      okrsProximosAVencer,
      okrsVencidos,
      equipoConMasOKRs,
      tiempoEstimadoHoras,
      tiempoEstimadoMinutos,
      okrsPendientes,
    };
  }, [okrs, equipos]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Productividad y OKRs</h2>
        <p className="text-gray-600">Objetivos, tiempos y eficiencia</p>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">Cargando OKRs...</CardContent>
        </Card>
      )}

      {!loading && okrs.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-gray-600">
            No hay OKRs configurados todavía. (Puedes crearlos desde backend usando el endpoint `/gerente/productividad/okrs`.)
          </CardContent>
        </Card>
      )}

      {/* KPIs PRINCIPALES CALCULADOS DINÁMICAMENTE */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">OKRs Activos</p>
                <p className="text-gray-900 text-2xl">{estadisticas.totalOKRs}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.okrsAltaPrioridad} alta prioridad
                </p>
              </div>
              <Target className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Progreso General</p>
                <p className="text-gray-900 text-2xl">{estadisticas.progresoGeneral.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.okrsEnBuenCamino} en buen camino
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tiempo Estimado</p>
                <p className="text-gray-900 text-2xl">
                  {estadisticas.tiempoEstimadoHoras}h {estadisticas.tiempoEstimadoMinutos}m
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.okrsPendientes} OKRs pendientes
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Equipos</p>
                <p className="text-gray-900 text-2xl">{estadisticas.totalEquipos}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.totalMiembros} miembros totales
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESTADÍSTICAS ADICIONALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado de OKRs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completados (100%)</span>
              <Badge className="bg-green-100 text-green-800">
                {estadisticas.okrsCompletados}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En buen camino (70-99%)</span>
              <Badge className="bg-blue-100 text-blue-800">
                {estadisticas.okrsEnBuenCamino}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En riesgo (50-69%)</span>
              <Badge className="bg-amber-100 text-amber-800">
                {estadisticas.okrsEnRiesgo}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retrasados ({'<'}50%)</span>
              <Badge className="bg-red-100 text-red-800">
                {estadisticas.okrsRetrasados}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Prioridades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alta prioridad</span>
              <Badge className="bg-red-100 text-red-800">
                {estadisticas.okrsAltaPrioridad}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media prioridad</span>
              <Badge className="bg-amber-100 text-amber-800">
                {estadisticas.okrsMediaPrioridad}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Progreso alta prioridad</p>
              <p className="text-lg text-teal-600">{estadisticas.progresoAltaPrioridad.toFixed(0)}%</p>
            </div>
            {estadisticas.okrsProximosAVencer > 0 && (
              <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-amber-800">
                    {estadisticas.okrsProximosAVencer} vencen en 7 días
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rendimiento Equipos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Excelentes (≥90%)</span>
              <Badge className="bg-green-100 text-green-800">
                {estadisticas.equiposExcelentes}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Buenos (80-89%)</span>
              <Badge className="bg-blue-100 text-blue-800">
                {estadisticas.equiposBuenos}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mejorables ({'<'}80%)</span>
              <Badge className="bg-amber-100 text-amber-800">
                {estadisticas.equiposMejorables}
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500">Eficiencia promedio</p>
              <p className="text-lg text-teal-600">{estadisticas.eficienciaPromedio.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTA DE OKRs */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos y Key Results (OKRs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {okrs.map((okr) => (
              <div key={okr.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{okr.objetivo}</h3>
                      {okr.prioridad === 'alta' && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Alta</Badge>
                      )}
                      {okr.progreso >= 90 && okr.progreso < 100 && (
                        <Award className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{okr.equipo}</Badge>
                      <span className="text-xs text-gray-500">{okr.responsable}</span>
                      <span className="text-xs text-gray-400">
                        Vence: {new Date(okr.fechaLimite).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <span 
                    className={
                      okr.progreso >= 70 
                        ? "text-teal-600" 
                        : okr.progreso >= 50 
                        ? "text-amber-600" 
                        : "text-red-600"
                    }
                  >
                    {okr.progreso}%
                  </span>
                </div>
                <Progress 
                  value={okr.progreso} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EFICIENCIA POR EQUIPO */}
      <Card>
        <CardHeader>
          <CardTitle>Eficiencia por Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipos.map((equipo, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">{equipo.nombre}</p>
                    {equipo.nombre === estadisticas.equipoMasEficiente.nombre && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {equipo.miembros} miembros • {equipo.okrsActivos} OKRs activos
                  </p>
                </div>
                <Badge 
                  className={
                    equipo.eficiencia >= 90 
                      ? "bg-green-100 text-green-800" 
                      : equipo.eficiencia >= 80 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {equipo.eficiencia}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
