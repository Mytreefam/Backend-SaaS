/**
 * ================================================================
 * WIDGET DE ONBOARDING
 * ================================================================
 * Componente compacto para mostrar el estado del onboarding
 * en el dashboard principal (gerente o empleado)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Trophy,
  FileText,
  Video,
  Users
} from 'lucide-react';
import { onboardingService } from '../services/onboarding.service';
import { obtenerProximasAcciones } from '../utils/onboarding-automation.util';
import type { ProcesoOnboarding } from '../types/onboarding.types';

interface OnboardingWidgetProps {
  tipo: 'empleado' | 'gerente';
  usuarioId: string;
  empresaId: string;
  onVerMas?: () => void;
}

export function OnboardingWidget({ tipo, usuarioId, empresaId, onVerMas }: OnboardingWidgetProps) {
  const [proceso, setProceso] = useState<ProcesoOnboarding | null>(null);
  const [proximasAcciones, setProximasAcciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [usuarioId, empresaId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (tipo === 'empleado') {
        // Cargar proceso del empleado
        const procesos = await onboardingService.obtenerProcesos({
          empresaId,
          empleadoId: usuarioId,
          activos: true
        });

        if (procesos.length > 0) {
          const proc = procesos[0];
          setProceso(proc);

          // Cargar próximas acciones
          const acciones = await obtenerProximasAcciones(proc.id);
          setProximasAcciones(acciones);
        }
      } else {
        // Para gerente, mostrar estadísticas generales
        const procesos = await onboardingService.obtenerProcesos({
          empresaId,
          activos: true
        });

        // Calcular resumen
        const stats = await onboardingService.obtenerEstadisticas(empresaId);
        setProceso(stats as any); // Usar stats como pseudo-proceso para el gerente
      }
    } catch (error) {
      console.error('Error cargando datos de onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista para empleado
  if (tipo === 'empleado') {
    if (!proceso) {
      return null; // No mostrar widget si no hay proceso activo
    }

    const completado = proceso.faseActual === 'onboarding_completado';

    return (
      <Card className={completado ? 'border-green-200 bg-green-50' : 'border-teal-200 bg-teal-50'}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {completado ? (
                <>
                  <Trophy className="h-5 w-5 text-green-600" />
                  <span className="text-green-900">¡Onboarding Completado!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  <span className="text-teal-900">Tu Proceso de Incorporación</span>
                </>
              )}
            </CardTitle>
            {!completado && (
              <Badge className="bg-teal-600">{proceso.progresoGeneral}%</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {completado ? (
            <div className="space-y-3">
              <p className="text-sm text-green-800">
                ¡Felicidades! Has completado exitosamente tu proceso de incorporación.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{proceso.tareasCompletadas}</div>
                  <div className="text-xs text-gray-600">Tareas</div>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{proceso.documentosCompletados}</div>
                  <div className="text-xs text-gray-600">Documentos</div>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <div className="text-lg font-bold text-green-600">{proceso.formacionesCompletadas}</div>
                  <div className="text-xs text-gray-600">Cursos</div>
                </div>
              </div>
              {proceso.tiempoProceso && (
                <p className="text-xs text-green-700 text-center">
                  Completado en {proceso.tiempoProceso} días
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-teal-800">Progreso General</span>
                  <span className="font-semibold text-teal-900">{proceso.progresoGeneral}%</span>
                </div>
                <Progress value={proceso.progresoGeneral} className="h-2 bg-teal-200" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg">
                  <div className="text-base font-semibold text-teal-900">
                    {proceso.tareasCompletadas}/{proceso.tareasTotal}
                  </div>
                  <div className="text-xs text-gray-600">Tareas</div>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <div className="text-base font-semibold text-teal-900">
                    {proceso.documentosCompletados}/{proceso.documentosTotal}
                  </div>
                  <div className="text-xs text-gray-600">Docs</div>
                </div>
                <div className="p-2 bg-white rounded-lg">
                  <div className="text-base font-semibold text-teal-900">
                    {proceso.formacionesCompletadas}/{proceso.formacionesTotal}
                  </div>
                  <div className="text-xs text-gray-600">Cursos</div>
                </div>
              </div>

              {proximasAcciones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-teal-900">Próximas acciones:</p>
                  {proximasAcciones.map((accion, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg text-sm">
                      <div className="flex-shrink-0 mt-0.5">
                        {accion.tipo === 'tarea' && <CheckCircle2 className="h-4 w-4 text-teal-600" />}
                        {accion.tipo === 'documento' && <FileText className="h-4 w-4 text-blue-600" />}
                        {accion.tipo === 'formacion' && <Video className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{accion.titulo}</p>
                        <p className="text-xs text-gray-500 truncate">{accion.descripcion}</p>
                      </div>
                      {accion.prioridad === 'critica' && (
                        <Badge variant="destructive" className="text-xs">Urgente</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={onVerMas}
                className="w-full bg-teal-600 hover:bg-teal-700"
                size="sm"
              >
                Ver mi checklist completo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Vista para gerente
  const stats = proceso as any;

  if (!stats || stats.procesosActivos === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay procesos activos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            Onboarding
          </CardTitle>
          <Badge>{stats.procesosActivos} activos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{stats.procesosActivos}</div>
              <div className="text-xs text-gray-500">En proceso</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{stats.progresoPromedio}%</div>
              <div className="text-xs text-gray-500">Progreso</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-gray-900">{stats.tiempoPromedioCompletado}d</div>
              <div className="text-xs text-gray-500">Tiempo</div>
            </div>
          </div>

          {/* Alertas */}
          {stats.procesosRequierenAccion > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">
                  {stats.procesosRequierenAccion} {stats.procesosRequierenAccion === 1 ? 'proceso requiere' : 'procesos requieren'} atención
                </p>
                <p className="text-xs text-amber-700">
                  {stats.documentosPendientesRevision} documentos por revisar
                </p>
              </div>
            </div>
          )}

          {/* Actividad reciente */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Últimos 30 días:</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Nuevos iniciados</span>
              <span className="font-semibold text-blue-600">+{stats.nuevosIniciados || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completados</span>
              <span className="font-semibold text-green-600">+{stats.completadosRecientes || 0}</span>
            </div>
          </div>

          <Button
            onClick={onVerMas}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Ver dashboard completo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
