/**
 * 🕐 MONITOR DE CRON JOBS
 * 
 * Componente para visualizar y gestionar las tareas automáticas programadas
 * Permite al gerente ver logs, estadísticas y ejecutar manualmente
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  TrendingUp,
  RefreshCw,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import {
  obtenerEstadisticasCronJobs,
  ejecutarManualmente,
  resetearUltimaEjecucion,
  CronJobLog
} from '../../services/cron-jobs';
import { obtenerProximaEjecucionLocal } from '../../config/timezone.config';
import { toast } from 'sonner@2.0.3';

export function CronJobsMonitor() {
  const [stats, setStats] = useState(obtenerEstadisticasCronJobs());
  const [ejecutando, setEjecutando] = useState(false);
  const [logExpandido, setLogExpandido] = useState<string | null>(null);
  const [infoZonaHoraria, setInfoZonaHoraria] = useState(obtenerProximaEjecucionLocal());

  // Actualizar stats cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(obtenerEstadisticasCronJobs());
      setInfoZonaHoraria(obtenerProximaEjecucionLocal());
    }, 60000); // Cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  const handleEjecutarManualmente = async () => {
    setEjecutando(true);
    toast.info('Ejecutando tareas automáticas...');

    try {
      const log = await ejecutarManualmente();
      
      toast.success('Tareas completadas correctamente', {
        description: `${log.tareasEjecutadas.length} tareas ejecutadas en ${log.duracionMs}ms`
      });

      // Actualizar stats
      setStats(obtenerEstadisticasCronJobs());
    } catch (error) {
      toast.error('Error ejecutando tareas automáticas');
    } finally {
      setEjecutando(false);
    }
  };

  const handleResetear = () => {
    resetearUltimaEjecucion();
    setStats(obtenerEstadisticasCronJobs());
    toast.success('Última ejecución reseteada');
  };

  const toggleLog = (logId: string) => {
    setLogExpandido(logExpandido === logId ? null : logId);
  };

  return (
    <div className="space-y-4">
      {/* Header con información general */}
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Tareas Automáticas
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Sistema de procesamiento nocturno a las {stats.horaConfiguracion}
                </p>
              </div>
            </div>
            <Badge 
              variant={stats.ejecutadoHoy ? 'default' : 'outline'}
              className={stats.ejecutadoHoy ? 'bg-green-600' : 'border-amber-400 text-amber-700'}
            >
              {stats.ejecutadoHoy ? 'Ejecutado hoy' : 'Pendiente'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Última ejecución */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Última Ejecución</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stats.ultimaEjecucion 
                    ? new Date(stats.ultimaEjecucion.fecha + ' ' + stats.ultimaEjecucion.hora).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próxima ejecución */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Próxima Ejecución (Tu hora local)</p>
                <p className="text-sm font-semibold text-gray-900">
                  {infoZonaHoraria.fechaLocal.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {infoZonaHoraria.horaLocalStr} (basado en {infoZonaHoraria.horaReferenciaStr} {infoZonaHoraria.nombreZonaReferencia})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total ejecuciones */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Total Ejecuciones</p>
                <p className="text-sm font-semibold text-gray-900">
                  {stats.totalEjecuciones}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Zona Horaria */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900 mb-1">
                🌍 Sistema de Zona Horaria Automático
              </p>
              <div className="text-xs text-purple-800 space-y-1">
                <p>
                  • Hora de referencia configurada: <span className="font-semibold">{infoZonaHoraria.horaReferenciaStr} ({infoZonaHoraria.nombreZonaReferencia})</span>
                </p>
                <p>
                  • Tu hora local de ejecución: <span className="font-semibold">{infoZonaHoraria.horaLocalStr}</span>
                </p>
                <p className="text-purple-700">
                  ℹ️ El sistema convierte automáticamente la hora de referencia a tu zona horaria local
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Acciones Manuales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleEjecutarManualmente}
              disabled={ejecutando}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {ejecutando ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Ejecutar Ahora
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleResetear}
              disabled={ejecutando}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetear Estado
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Las tareas se ejecutan automáticamente cada día a las {stats.horaConfiguracion}. 
            Puedes forzar la ejecución manual para testing.
          </p>
        </CardContent>
      </Card>

      {/* Historial de ejecuciones */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Historial de Ejecuciones ({stats.logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {stats.logs.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No hay ejecuciones registradas</p>
              <p className="text-xs text-gray-500 mt-1">
                El sistema se ejecutará automáticamente a las {stats.horaConfiguracion}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.logs.map((log: CronJobLog) => (
                <div 
                  key={log.id} 
                  className="border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  {/* Header del log */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleLog(log.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Icono de estado */}
                      {log.estado === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : log.estado === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">
                            {new Date(log.fecha + ' ' + log.hora).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <Badge 
                            variant={log.estado === 'success' ? 'default' : 'destructive'}
                            className={
                              log.estado === 'success' 
                                ? 'bg-green-600' 
                                : log.estado === 'error' 
                                ? 'bg-red-600' 
                                : 'bg-amber-600'
                            }
                          >
                            {log.estado === 'success' ? 'Exitoso' : log.estado === 'error' ? 'Error' : 'Parcial'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <span>{log.tareasEjecutadas.length} tareas</span>
                          <span>•</span>
                          <span>{log.duracionMs}ms</span>
                        </div>
                      </div>
                    </div>

                    {logExpandido === log.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Detalles expandidos */}
                  {logExpandido === log.id && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      {/* Tareas ejecutadas */}
                      <div className="pt-3 space-y-2">
                        <h4 className="text-xs font-semibold text-gray-700">Tareas Ejecutadas:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {log.tareasEjecutadas.map((tarea, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              {tarea}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resultados */}
                      <div className="pt-3 mt-3 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Resultados:</h4>
                        <div className="space-y-2">
                          {/* Fichajes incompletos */}
                          {log.resultados.fichajesIncompletos && (
                            <div className="p-2 bg-white rounded border text-xs">
                              <span className="font-medium">Fichajes Incompletos:</span>{' '}
                              <span className="text-gray-600">
                                {log.resultados.fichajesIncompletos.cerrados} cerrados de {log.resultados.fichajesIncompletos.procesados}
                              </span>
                            </div>
                          )}

                          {/* Validación automática */}
                          {log.resultados.validacionAutomatica && (
                            <div className="p-2 bg-white rounded border text-xs">
                              <span className="font-medium">Validación Automática:</span>{' '}
                              <span className="text-gray-600">
                                {log.resultados.validacionAutomatica.validados} fichajes validados
                              </span>
                            </div>
                          )}

                          {/* Absentismo */}
                          {log.resultados.absentismo && (
                            <div className="p-2 bg-white rounded border text-xs">
                              <span className="font-medium">Absentismo:</span>{' '}
                              <span className="text-gray-600">
                                {log.resultados.absentismo.conAbsentismo} trabajadores con absentismo de {log.resultados.absentismo.trabajadores}
                              </span>
                            </div>
                          )}

                          {/* Centros de costes */}
                          {log.resultados.centrosCostes && (
                            <div className="p-2 bg-white rounded border text-xs">
                              <span className="font-medium">Centros de Costes:</span>{' '}
                              <span className="text-gray-600">
                                {log.resultados.centrosCostes.actualizados} trabajadores actualizados de {log.resultados.centrosCostes.trabajadores}
                              </span>
                            </div>
                          )}

                          {/* Reporte diario */}
                          {log.resultados.reporteDiario && (
                            <div className="p-2 bg-white rounded border text-xs">
                              <span className="font-medium">Reporte Diario:</span>{' '}
                              <span className="text-gray-600">
                                {log.resultados.reporteDiario.fichajes} fichajes, {log.resultados.reporteDiario.trabajadores} trabajadores activos
                              </span>
                            </div>
                          )}

                          {/* Anomalías */}
                          {log.resultados.anomalias && log.resultados.anomalias.alertas.length > 0 && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-amber-900">
                                    {log.resultados.anomalias.alertas.length} anomalías detectadas:
                                  </p>
                                  <ul className="mt-1 space-y-1">
                                    {log.resultados.anomalias.alertas.map((alerta: string, idx: number) => (
                                      <li key={idx} className="text-xs text-amber-800">• {alerta}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-blue-900">
              <p className="font-medium mb-1">Sobre las tareas automáticas:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Se ejecutan automáticamente cada día a la hora configurada</li>
                <li>• Procesan fichajes, calculan métricas y generan reportes</li>
                <li>• Los logs se guardan durante 30 días</li>
                <li>• En producción con backend real, se ejecutarían en el servidor</li>
                <li className="mt-2 pt-2 border-t border-blue-300">
                  <strong>💡 Puedes cambiar la hora y zona horaria arriba en:</strong> "Volcado Automático de Datos" → Configurar Hora y Zona Horaria
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}