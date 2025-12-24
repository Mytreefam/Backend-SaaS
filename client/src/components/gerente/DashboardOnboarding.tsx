/**
 * ================================================================
 * DASHBOARD DE ONBOARDING - Vista del Gerente
 * ================================================================
 * Panel de control para gestionar procesos de incorporación
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Calendar,
  Filter,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Star,
  UserPlus,
  Sparkles,
  Mail
} from 'lucide-react';
import { onboardingService } from '../../services/onboarding.service';
import type { ProcesoOnboarding, EstadisticasOnboarding, FaseOnboarding } from '../../types/onboarding.types';
import { toast } from 'sonner@2.0.3';

interface DashboardOnboardingProps {
  empresaId: string;
  gerenteId: string;
}

export function DashboardOnboarding({ empresaId, gerenteId }: DashboardOnboardingProps) {
  const [procesos, setProcesos] = useState<ProcesoOnboarding[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroFase, setFiltroFase] = useState<FaseOnboarding | 'todos'>('todos');

  useEffect(() => {
    cargarDatos();
  }, [empresaId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [procesosData, statsData] = await Promise.all([
        onboardingService.obtenerProcesos({ empresaId, activos: true }),
        onboardingService.obtenerEstadisticas(empresaId)
      ]);

      setProcesos(procesosData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos de onboarding');
    } finally {
      setLoading(false);
    }
  };

  const aprobarDocumento = async (procesoId: string, documentoId: string) => {
    try {
      await onboardingService.validarDocumento(procesoId, {
        documentoId,
        aprobado: true,
        validadoPor: gerenteId
      });
      await cargarDatos();
    } catch (error) {
      console.error('Error aprobando documento:', error);
      toast.error('Error al aprobar documento');
    }
  };

  const rechazarDocumento = async (procesoId: string, documentoId: string, motivo: string) => {
    try {
      await onboardingService.validarDocumento(procesoId, {
        documentoId,
        aprobado: false,
        validadoPor: gerenteId,
        motivoRechazo: motivo
      });
      await cargarDatos();
    } catch (error) {
      console.error('Error rechazando documento:', error);
      toast.error('Error al rechazar documento');
    }
  };

  const crearProcesoPrueba = async () => {
    try {
      const empleadoId = `EMP-${Date.now()}`;
      const empleadoNombre = `Empleado de Prueba ${Math.floor(Math.random() * 100)}`;
      
      // Crear proceso directamente usando el método disponible
      const response = await onboardingService.crearProceso({
        empleadoId,
        empleadoNombre,
        empleadoEmail: `prueba${Date.now()}@ejemplo.com`,
        puesto: 'Camarero/a',
        departamento: 'Sala',
        empresaId,
        fechaInicio: new Date().toISOString(),
        plantillaId: 'plantilla-camarero',
        invitacionId: `INV-${Date.now()}`,
        mentorId: gerenteId
      });

      if (response.success) {
        toast.success('Proceso de prueba creado correctamente', {
          description: `${empleadoNombre} ha sido añadido al onboarding`
        });
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error creando proceso de prueba:', error);
      toast.error('Error al crear proceso de prueba');
    }
  };

  const procesosFiltrados = filtroFase === 'todos' 
    ? procesos 
    : procesos.filter(p => p.faseActual === filtroFase);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título y acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-500 mt-1">Gestión de incorporación de nuevos empleados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" onClick={crearProcesoPrueba}>
            <Sparkles className="h-4 w-4 mr-2" />
            Crear Proceso de Prueba
          </Button>
        </div>
      </div>

      {/* Tabs de gestión */}
      <Tabs defaultValue="procesos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="procesos">
            Procesos ({procesos.length})
          </TabsTrigger>
          <TabsTrigger value="revision">
            Pendientes Revisión ({estadisticas?.documentosPendientesRevision || 0})
          </TabsTrigger>
          <TabsTrigger value="estadisticas">
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* TAB: PROCESOS */}
        <TabsContent value="procesos" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filtroFase === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroFase('todos')}
            >
              Todos ({procesos.length})
            </Button>
            <Button
              size="sm"
              variant={filtroFase === 'documentacion_pendiente' ? 'default' : 'outline'}
              onClick={() => setFiltroFase('documentacion_pendiente')}
            >
              Documentación ({estadisticas?.porFase.documentacion_pendiente || 0})
            </Button>
            <Button
              size="sm"
              variant={filtroFase === 'formacion_pendiente' ? 'default' : 'outline'}
              onClick={() => setFiltroFase('formacion_pendiente')}
            >
              Formación ({estadisticas?.porFase.formacion_pendiente || 0})
            </Button>
          </div>

          {/* Lista de procesos */}
          <div className="space-y-4">
            {procesosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="max-w-2xl mx-auto">
                    <Sparkles className="h-20 w-20 text-teal-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      ¡Comienza a incorporar nuevos empleados!
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Todavía no hay procesos de onboarding activos. Los nuevos empleados aparecerán aquí cuando acepten su invitación.
                    </p>

                    {/* Instrucciones */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Cómo añadir empleados:
                      </h4>
                      <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[20px]">1.</span>
                          <span>Ve al botón <strong>"Nuevo Empleado"</strong> (arriba a la derecha)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[20px]">2.</span>
                          <span>Selecciona <strong>"Invitar por Email/Link"</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[20px]">3.</span>
                          <span>Completa el formulario con los datos del empleado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[20px]">4.</span>
                          <span>Envía la invitación por Email, WhatsApp o SMS</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[20px]">5.</span>
                          <span className="text-teal-700">✨ <strong>El sistema automáticamente creará el proceso de onboarding</strong> cuando el empleado acepte la invitación</span>
                        </li>
                      </ol>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 justify-center">
                      <Button 
                        size="lg" 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={crearProcesoPrueba}
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Crear Proceso de Prueba
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => {
                          // Scroll hacia arriba para que vea el botón "Nuevo Empleado"
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          toast.info('Busca el botón "Nuevo Empleado" arriba a la derecha');
                        }}
                      >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Invitar Empleado Real
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      💡 Prueba creando un proceso de prueba primero para familiarizarte con el sistema
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              procesosFiltrados.map(proceso => (
                <Card key={proceso.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {proceso.empleadoNombre}
                          </h3>
                          <Badge>{proceso.puesto}</Badge>
                          <Badge variant="outline">{proceso.departamento}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Inicio: {new Date(proceso.fechaInicio).toLocaleDateString('es-ES')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.floor((new Date().getTime() - new Date(proceso.fechaInvitacion).getTime()) / (1000 * 60 * 60 * 24))} días
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progreso general</span>
                            <span className="font-medium">{proceso.progresoGeneral}%</span>
                          </div>
                          <Progress value={proceso.progresoGeneral} className="h-2" />
                          
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900">
                                {proceso.tareasCompletadas}/{proceso.tareasTotal}
                              </div>
                              <div className="text-xs text-gray-500">Tareas</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900">
                                {proceso.documentosCompletados}/{proceso.documentosTotal}
                              </div>
                              <div className="text-xs text-gray-500">Documentos</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <div className="text-lg font-semibold text-gray-900">
                                {proceso.formacionesCompletadas}/{proceso.formacionesTotal}
                              </div>
                              <div className="text-xs text-gray-500">Formaciones</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                        {proceso.requiereAccion && (
                          <Badge variant="destructive" className="justify-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Requiere acción
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Alertas del proceso */}
                    {proceso.alertas.length > 0 && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            {proceso.alertas.map((alerta, index) => (
                              <p key={index} className="text-sm text-amber-800">{alerta}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB: PENDIENTES DE REVISIÓN */}
        <TabsContent value="revision" className="space-y-4">
          {procesos.map(proceso => {
            const documentosPendientes = proceso.documentos.filter(d => d.estado === 'subido');
            
            if (documentosPendientes.length === 0) return null;

            return (
              <Card key={proceso.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{proceso.empleadoNombre}</CardTitle>
                      <CardDescription>{proceso.puesto} · {proceso.departamento}</CardDescription>
                    </div>
                    <Badge>{documentosPendientes.length} pendientes</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {documentosPendientes.map(documento => (
                    <div key={documento.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{documento.nombre}</h4>
                          <p className="text-sm text-gray-600 mt-1">{documento.descripcion}</p>
                          {documento.archivoNombre && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{documento.archivoNombre}</span>
                              <span className="text-xs">({(documento.archivoTamanio! / 1024).toFixed(1)} KB)</span>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={documento.archivoUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </a>
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => aprobarDocumento(proceso.id, documento.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const motivo = prompt('Motivo del rechazo:');
                            if (motivo) {
                              rechazarDocumento(proceso.id, documento.id, motivo);
                            }
                          }}
                          className="flex-1"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {procesos.every(p => p.documentos.filter(d => d.estado === 'subido').length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hay documentos pendientes de revisión
                </h3>
                <p className="text-gray-500">
                  Todos los documentos han sido revisados
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: ESTADÍSTICAS */}
        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Métricas de tiempo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiempos de Completado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiempo promedio</span>
                  <span className="font-semibold">{estadisticas?.tiempoPromedioCompletado} días</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Más rápido</span>
                  <span className="font-semibold text-green-600">{estadisticas?.tiempoMasRapido} días</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Más lento</span>
                  <span className="font-semibold text-red-600">{estadisticas?.tiempoMasLento} días</span>
                </div>
              </CardContent>
            </Card>

            {/* Satisfacción */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i <= (estadisticas?.satisfaccionPromedio || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {estadisticas?.satisfaccionPromedio.toFixed(1)}/5.0
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Valoración promedio de nuevos empleados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tendencias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Últimos 30 días</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nuevos iniciados</span>
                  <span className="font-semibold text-blue-600">
                    +{estadisticas?.nuevosIniciados}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completados</span>
                  <span className="font-semibold text-green-600">
                    +{estadisticas?.completadosRecientes}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Formación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasa de aprobación</span>
                  <span className="font-semibold text-green-600">
                    {estadisticas?.tasaAprobacionCuestionarios}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Formaciones pendientes</span>
                  <span className="font-semibold">{estadisticas?.formacionesPendientes}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}