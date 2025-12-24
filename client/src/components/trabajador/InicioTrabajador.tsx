import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { StatsCard } from '../ui/stats-card';
import { 
  Clock, 
  Play, 
  Pause,
  CheckCircle2,
  ClipboardList,
  BarChart3,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowRight,
  AlertCircle,
  Target,
  Activity
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../mobile/PullToRefreshIndicator';
import { useHaptics } from '../../hooks/useHaptics';
import { useAnalytics } from '../../services/analytics.service';
import { OnboardingWidget } from '../OnboardingWidget';

export function InicioTrabajador() {
  const [enTurno, setEnTurno] = useState(true);
  const [tiempoFichaje, setTiempoFichaje] = useState(0); // en segundos
  const [pausado, setPausado] = useState(false);

  // ✅ Hooks nativos
  const haptics = useHaptics();
  const analyticsHooks = useAnalytics();

  // ✅ Pull to Refresh
  const refreshDashboard = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Dashboard actualizado');
  };
  const { pullIndicatorRef } = usePullToRefresh(refreshDashboard);

  // Simular cronómetro
  useEffect(() => {
    if (enTurno && !pausado) {
      const interval = setInterval(() => {
        setTiempoFichaje((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [enTurno, pausado]);

  const formatearTiempo = (segundos: number): string => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  const handleFichar = () => {
    haptics.heavy(); // ✅ Feedback táctil fuerte para acción importante
    
    if (enTurno) {
      setEnTurno(false);
      setTiempoFichaje(0);
      analyticsHooks.logFeatureUsed('fichaje_salida', 'inicio_trabajador'); // ✅ Analytics
      toast.success('Fichaje de salida registrado correctamente');
    } else {
      setEnTurno(true);
      setTiempoFichaje(0);
      analyticsHooks.logFeatureUsed('fichaje_entrada', 'inicio_trabajador'); // ✅ Analytics
      toast.success('Fichaje de entrada registrado correctamente');
    }
  };

  const handlePausarContinuar = () => {
    haptics.medium(); // ✅ Feedback táctil
    setPausado(!pausado);
    analyticsHooks.logButtonClick(pausado ? 'reanudar_cronometro' : 'pausar_cronometro', 'inicio_trabajador'); // ✅ Analytics
    toast.info(pausado ? 'Cronómetro reanudado' : 'Cronómetro pausado');
  };

  const handleEmpezarTarea = () => {
    toast.success('Tarea iniciada');
  };

  const handleReanudarCurso = () => {
    toast.info('Reanudando curso...');
  };

  // Datos de ejemplo
  const tareasHechas = 3;
  const tareasPendientes = 5;
  const totalTareas = tareasHechas + tareasPendientes;
  const progresoTareas = (tareasHechas / totalTareas) * 100;

  const horasObjetivo = 40;
  const horasReales = 38;
  const proyeccionViernes = 42;

  const rendimientoCalidad = 92;
  const tendenciaPositiva = true;

  return (
    <div className="space-y-6">
      {/* ✅ Indicador de Pull to Refresh */}
      <PullToRefreshIndicator indicatorRef={pullIndicatorRef} />
      
      {/* Header con Fichar */}
      <div className="flex flex-col gap-4">
        <Card className={enTurno ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'}>
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className={`p-2 sm:p-3 rounded-full ${enTurno ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-6 h-6 sm:w-8 sm:h-8 ${enTurno ? 'text-green-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Estado actual</p>
                  <p className="text-lg sm:text-xl font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {enTurno ? 'En turno' : 'Fuera de turno'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {enTurno ? `Tiempo trabajado: ${formatearTiempo(tiempoFichaje)}` : 'Último fichaje: 08:30'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleFichar}
                className={`${enTurno ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} w-full sm:w-auto`}
                size="lg"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Fichar {enTurno ? 'Salida' : 'Entrada'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas KPI Mejoradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Mi Hoy */}
        <Card className="border-teal-200 hover:shadow-lg transition-all active:scale-[0.99]">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg shrink-0">
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                </div>
                <span className="truncate">Mi Hoy</span>
              </CardTitle>
              {tareasPendientes > 0 && (
                <Badge className="bg-teal-100 text-teal-700 text-xs shrink-0">
                  {tareasPendientes}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {tareasPendientes > 0 ? (
              <>
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-teal-50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Próxima tarea:</p>
                  <p className="text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-2">Limpieza profunda zona cocina</p>
                  <Badge variant="outline" className="border-orange-300 text-orange-700 text-[10px] sm:text-xs">
                    🔥 Alta Prioridad
                  </Badge>
                </div>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 min-h-[44px] text-sm touch-manipulation active:scale-95"
                  onClick={handleEmpezarTarea}
                >
                  <Play className="w-4 h-4 mr-2 shrink-0" />
                  Empezar Ahora
                </Button>
              </>
            ) : (
              <div className="text-center py-4 sm:py-6">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-green-500" />
                <p className="text-xs sm:text-sm text-gray-600 mb-3">¡Todo completado!</p>
                <Button variant="outline" size="sm" className="min-h-[40px] text-xs touch-manipulation active:scale-95">
                  Crear recordatorio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fichaje - Cronómetro */}
        <Card className="border-blue-200 hover:shadow-lg transition-all active:scale-[0.99]">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              Cronómetro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {enTurno ? (
              <>
                <div className="text-center mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-mono mb-1 sm:mb-2 text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {formatearTiempo(tiempoFichaje)}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Tiempo trabajado hoy</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 min-h-[44px] text-sm touch-manipulation active:scale-95"
                  onClick={handlePausarContinuar}
                >
                  {pausado ? (
                    <>
                      <Play className="w-4 h-4 mr-2 shrink-0" />
                      <span className="hidden sm:inline">Continuar Cronómetro</span>
                      <span className="sm:hidden">Continuar</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2 shrink-0" />
                      Pausar Cronómetro
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No has fichado entrada</p>
                <p className="text-xs text-gray-400 mt-1">Ficha para iniciar el cronómetro</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                </div>
                Tareas Hoy
              </CardTitle>
              <Badge className="bg-orange-100 text-orange-700">
                {tareasPendientes} pendientes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <p className="text-3xl font-semibold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {tareasHechas}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Completadas</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center flex-1">
                  <p className="text-3xl font-semibold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {tareasPendientes}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Pendientes</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Progreso</span>
                  <span className="font-medium">{Math.round(progresoTareas)}%</span>
                </div>
                <Progress value={progresoTareas} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horas */}
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                Horas Semanales
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-4xl font-semibold text-purple-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {horasReales}h
                </p>
                <p className="text-xs text-gray-600 mt-1">de {horasObjetivo}h objetivo</p>
              </div>
              <div className="space-y-2">
                <Progress value={(horasReales / horasObjetivo) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Progreso semanal</span>
                  <span className="font-medium">{Math.round((horasReales / horasObjetivo) * 100)}%</span>
                </div>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-gray-600">Proyección viernes</span>
                <div className="flex items-center gap-1">
                  {proyeccionViernes >= horasObjetivo ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  )}
                  <span className={`font-medium text-sm ${proyeccionViernes >= horasObjetivo ? 'text-green-600' : 'text-orange-600'}`}>
                    {proyeccionViernes}h
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rendimiento */}
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                Rendimiento
              </CardTitle>
              <Badge className={tendenciaPositiva ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {tendenciaPositiva ? '↑ +5.2%' : '↓ -2.1%'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-semibold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {rendimientoCalidad}
                </span>
                <div className="flex flex-col items-start">
                  <span className="text-2xl font-medium text-green-600">%</span>
                  {tendenciaPositiva ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600">Calidad Personal</p>
            </div>
            <div className="mt-3 pt-3 border-t text-center">
              <p className="text-xs text-gray-500">
                {tendenciaPositiva ? '¡Excelente trabajo!' : 'Sigue mejorando'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formación */}
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                Formación
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700">
                37%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <Badge variant="outline" className="mb-2 border-blue-300 text-blue-700 text-xs">
                📚 Curso Recomendado
              </Badge>
              <p className="font-medium text-sm mb-2">Manipulación de Alimentos Avanzada</p>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                <span>Módulo 3 de 8</span>
                <span>•</span>
                <span>37% completado</span>
              </div>
              <Progress value={37} className="h-2" />
            </div>
            <Button 
              variant="outline" 
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={handleReanudarCurso}
            >
              <Play className="w-4 h-4 mr-2" />
              Continuar Curso
            </Button>
          </CardContent>
        </Card>

        {/* Widget de Onboarding */}
        <OnboardingWidget 
          tipo="empleado"
          usuarioId="TRABAJADOR-001"
          empresaId="EMPRESA-001"
        />
      </div>
    </div>
  );
}