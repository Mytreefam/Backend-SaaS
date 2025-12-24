/**
 * ================================================================
 * CHECKLIST DE ONBOARDING - Vista del Empleado
 * ================================================================
 * Guía interactiva paso a paso para el proceso de incorporación
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Video,
  ClipboardCheck,
  Calendar,
  Trophy,
  ChevronRight,
  Download,
  ExternalLink,
  Play,
  FileCheck,
  Building2,
  Users,
  Sparkles
} from 'lucide-react';
import { onboardingService } from '../../services/onboarding.service';
import type { ProcesoOnboarding, TareaOnboarding, DocumentoOnboarding, FormacionOnboarding } from '../../types/onboarding.types';
import { toast } from 'sonner@2.0.3';

interface OnboardingChecklistProps {
  empleadoId: string;
  empresaId: string;
}

export function OnboardingChecklist({ empleadoId, empresaId }: OnboardingChecklistProps) {
  const [proceso, setProceso] = useState<ProcesoOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [tareaActiva, setTareaActiva] = useState<TareaOnboarding | null>(null);
  const [documentoActivo, setDocumentoActivo] = useState<DocumentoOnboarding | null>(null);
  const [formacionActiva, setFormacionActiva] = useState<FormacionOnboarding | null>(null);

  useEffect(() => {
    cargarProceso();
  }, [empleadoId, empresaId]);

  const cargarProceso = async () => {
    setLoading(true);
    try {
      const procesos = await onboardingService.obtenerProcesos({
        empresaId,
        empleadoId,
        activos: true
      });

      if (procesos.length > 0) {
        setProceso(procesos[0]);
      }
    } catch (error) {
      console.error('Error cargando proceso:', error);
      toast.error('Error al cargar el proceso de onboarding');
    } finally {
      setLoading(false);
    }
  };

  const completarTarea = async (tareaId: string) => {
    if (!proceso) return;

    try {
      await onboardingService.actualizarTarea(proceso.id, {
        tareaId,
        estado: 'completada',
        completadoPor: empleadoId
      });

      await cargarProceso();
      setTareaActiva(null);
    } catch (error) {
      console.error('Error completando tarea:', error);
      toast.error('Error al completar la tarea');
    }
  };

  const subirDocumento = async (documentoId: string, archivo: File) => {
    if (!proceso) return;

    try {
      await onboardingService.subirDocumento({
        procesoId: proceso.id,
        documentoId,
        archivo,
        empleadoId
      });

      await cargarProceso();
      setDocumentoActivo(null);
    } catch (error) {
      console.error('Error subiendo documento:', error);
      toast.error('Error al subir el documento');
    }
  };

  const completarFormacion = async (formacionId: string, puntuacion?: number) => {
    if (!proceso) return;

    try {
      await onboardingService.completarFormacion(proceso.id, {
        formacionId,
        empleadoId,
        puntuacion
      });

      await cargarProceso();
      setFormacionActiva(null);
    } catch (error) {
      console.error('Error completando formación:', error);
      toast.error('Error al completar la formación');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tu proceso de onboarding...</p>
        </div>
      </div>
    );
  }

  if (!proceso) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes un proceso de onboarding activo
          </h3>
          <p className="text-gray-500">
            Contacta con recursos humanos para más información
          </p>
        </CardContent>
      </Card>
    );
  }

  const tareasDelEmpleado = proceso.tareas.filter(t => t.asignadoA === 'empleado');
  const tareasPendientes = tareasDelEmpleado.filter(t => t.estado === 'pendiente');
  const tareasEnProgreso = tareasDelEmpleado.filter(t => t.estado === 'en_progreso');
  const tareasCompletadas = tareasDelEmpleado.filter(t => t.estado === 'completada');

  const documentosPendientes = proceso.documentos.filter(d => d.estado === 'pendiente' || d.estado === 'rechazado');
  const formacionesPendientes = proceso.formaciones.filter(f => f.estado === 'pendiente');

  return (
    <div className="space-y-6">
      {/* Header con bienvenida */}
      <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <p className="text-sm opacity-90">¡Bienvenido/a al equipo!</p>
              </div>
              <h2 className="text-2xl font-bold mb-1">
                Proceso de Incorporación
              </h2>
              <p className="text-sm opacity-90">
                {proceso.puesto} · {proceso.departamento}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">
                {proceso.progresoGeneral}%
              </div>
              <p className="text-xs opacity-90">Completado</p>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={proceso.progresoGeneral} className="h-2 bg-white/20" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold">{tareasCompletadas.length}/{tareasDelEmpleado.length}</div>
              <div className="text-xs opacity-90">Tareas</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{proceso.documentosCompletados}/{proceso.documentosTotal}</div>
              <div className="text-xs opacity-90">Documentos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{proceso.formacionesCompletadas}/{proceso.formacionesTotal}</div>
              <div className="text-xs opacity-90">Formaciones</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas/Acciones urgentes */}
      {proceso.requiereAccion && (tareasPendientes.length > 0 || documentosPendientes.length > 0) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 mb-1">
                  Tienes acciones pendientes
                </p>
                <p className="text-sm text-amber-700">
                  {tareasPendientes.length > 0 && `${tareasPendientes.length} tareas pendientes`}
                  {tareasPendientes.length > 0 && documentosPendientes.length > 0 && ' · '}
                  {documentosPendientes.length > 0 && `${documentosPendientes.length} documentos por subir`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="tareas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tareas" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Tareas ({tareasPendientes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Documentos ({documentosPendientes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="formacion" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Formación ({formacionesPendientes.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: TAREAS */}
        <TabsContent value="tareas" className="space-y-4">
          {tareasPendientes.length === 0 && tareasEnProgreso.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Todas las tareas completadas!
                </h3>
                <p className="text-gray-500">
                  Has completado todas tus tareas asignadas
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tareas pendientes */}
              {tareasPendientes.map(tarea => (
                <Card key={tarea.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        tarea.prioridad === 'critica' ? 'bg-red-100' :
                        tarea.prioridad === 'alta' ? 'bg-orange-100' :
                        tarea.prioridad === 'media' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        <Circle className={`h-5 w-5 ${
                          tarea.prioridad === 'critica' ? 'text-red-600' :
                          tarea.prioridad === 'alta' ? 'text-orange-600' :
                          tarea.prioridad === 'media' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{tarea.titulo}</h4>
                            <p className="text-sm text-gray-600 mt-1">{tarea.descripcion}</p>
                          </div>
                          <Badge variant={
                            tarea.prioridad === 'critica' ? 'destructive' :
                            tarea.prioridad === 'alta' ? 'default' : 'secondary'
                          }>
                            {tarea.prioridad === 'critica' ? 'Urgente' :
                             tarea.prioridad === 'alta' ? 'Importante' :
                             tarea.prioridad === 'media' ? 'Normal' : 'Baja'}
                          </Badge>
                        </div>
                        
                        {tarea.instrucciones && (
                          <p className="text-sm text-gray-500 mb-3 italic">
                            💡 {tarea.instrucciones}
                          </p>
                        )}
                        
                        {tarea.fechaLimite && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Clock className="h-4 w-4" />
                            <span>Fecha límite: {new Date(tarea.fechaLimite).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => completarTarea(tarea.id)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar como completada
                          </Button>
                          
                          {tarea.urlAyuda && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={tarea.urlAyuda} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ayuda
                              </a>
                            </Button>
                          )}
                        </div>
                        
                        {tarea.requiereAprobacion && (
                          <p className="text-xs text-amber-600 mt-2">
                            ⚠️ Esta tarea requiere aprobación del gerente
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Tareas en progreso (esperando aprobación) */}
              {tareasEnProgreso.map(tarea => (
                <Card key={tarea.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1">{tarea.titulo}</h4>
                        <p className="text-sm text-blue-700">
                          ⏳ Esperando aprobación del gerente
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* Tareas completadas (colapsable) */}
          {tareasCompletadas.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-600" />
                    Tareas Completadas ({tareasCompletadas.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tareasCompletadas.map(tarea => (
                    <div key={tarea.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">{tarea.titulo}</span>
                      <span className="text-xs text-gray-500">
                        {tarea.fechaCompletado && new Date(tarea.fechaCompletado).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: DOCUMENTOS */}
        <TabsContent value="documentos" className="space-y-4">
          {documentosPendientes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileCheck className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Todos los documentos subidos!
                </h3>
                <p className="text-gray-500">
                  Has completado la documentación requerida
                </p>
              </CardContent>
            </Card>
          ) : (
            proceso.documentos.map(documento => (
              <Card key={documento.id} className={
                documento.estado === 'rechazado' ? 'border-red-200' :
                documento.estado === 'aprobado' ? 'border-green-200 bg-green-50' :
                documento.estado === 'revision' ? 'border-blue-200 bg-blue-50' :
                ''
              }>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      documento.estado === 'aprobado' ? 'bg-green-100' :
                      documento.estado === 'rechazado' ? 'bg-red-100' :
                      documento.estado === 'revision' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        documento.estado === 'aprobado' ? 'text-green-600' :
                        documento.estado === 'rechazado' ? 'text-red-600' :
                        documento.estado === 'revision' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {documento.nombre}
                            {documento.obligatorio && (
                              <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{documento.descripcion}</p>
                        </div>
                        
                        {documento.estado === 'aprobado' && (
                          <Badge className="bg-green-600">Aprobado ✓</Badge>
                        )}
                        {documento.estado === 'rechazado' && (
                          <Badge variant="destructive">Rechazado</Badge>
                        )}
                        {documento.estado === 'revision' && (
                          <Badge className="bg-blue-600">En revisión</Badge>
                        )}
                      </div>
                      
                      {documento.estado === 'rechazado' && documento.motivoRechazo && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-red-800">
                            <strong>Motivo del rechazo:</strong> {documento.motivoRechazo}
                          </p>
                        </div>
                      )}
                      
                      {(documento.estado === 'pendiente' || documento.estado === 'rechazado') && (
                        <div className="mt-3">
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                subirDocumento(documento.id, file);
                              }
                            }}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Formatos aceptados: PDF, JPG, PNG (máx. 5MB)
                          </p>
                        </div>
                      )}
                      
                      {documento.archivoNombre && (
                        <div className="mt-2 text-sm text-gray-600">
                          📎 {documento.archivoNombre} ({(documento.archivoTamanio! / 1024).toFixed(1)} KB)
                          {documento.fechaSubida && (
                            <span className="ml-2">· Subido el {new Date(documento.fechaSubida).toLocaleDateString('es-ES')}</span>
                          )}
                        </div>
                      )}
                      
                      {documento.requiereFirma && !documento.firmado && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm">
                            <FileCheck className="h-4 w-4 mr-2" />
                            Firmar digitalmente
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TAB: FORMACIÓN */}
        <TabsContent value="formacion" className="space-y-4">
          {formacionesPendientes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¡Formación completada!
                </h3>
                <p className="text-gray-500">
                  Has completado todos los cursos requeridos
                </p>
              </CardContent>
            </Card>
          ) : (
            proceso.formaciones.map(formacion => (
              <Card key={formacion.id} className={
                formacion.estado === 'aprobada' ? 'border-green-200 bg-green-50' :
                formacion.estado === 'en_progreso' ? 'border-blue-200 bg-blue-50' :
                ''
              }>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      formacion.estado === 'aprobada' ? 'bg-green-100' :
                      formacion.estado === 'en_progreso' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {formacion.tipo === 'video' && <Video className="h-5 w-5 text-gray-600" />}
                      {formacion.tipo === 'cuestionario' && <ClipboardCheck className="h-5 w-5 text-gray-600" />}
                      {formacion.tipo === 'lectura' && <FileText className="h-5 w-5 text-gray-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {formacion.titulo}
                            {formacion.obligatorio && (
                              <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                            )}
                            {formacion.generaCertificado && (
                              <Badge className="text-xs bg-purple-600">Certificado</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{formacion.descripcion}</p>
                        </div>
                        
                        {formacion.estado === 'aprobada' && (
                          <Badge className="bg-green-600">Completado ✓</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formacion.duracionEstimada} min
                        </span>
                        {formacion.tipo === 'cuestionario' && formacion.puntuacionMinima && (
                          <span>Puntuación mínima: {formacion.puntuacionMinima}%</span>
                        )}
                      </div>
                      
                      {formacion.progreso > 0 && formacion.progreso < 100 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progreso</span>
                            <span className="font-medium">{formacion.progreso}%</span>
                          </div>
                          <Progress value={formacion.progreso} className="h-2" />
                        </div>
                      )}
                      
                      {formacion.estado === 'pendiente' && (
                        <Button
                          onClick={() => setFormacionActiva(formacion)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          {formacion.tipo === 'video' && <Play className="h-4 w-4 mr-2" />}
                          {formacion.tipo === 'cuestionario' && <ClipboardCheck className="h-4 w-4 mr-2" />}
                          Comenzar
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                      
                      {formacion.estado === 'aprobada' && formacion.certificadoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={formacion.certificadoUrl} download>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar certificado
                          </a>
                        </Button>
                      )}
                      
                      {formacion.puntuacion !== undefined && (
                        <p className="text-sm text-gray-600 mt-2">
                          Puntuación obtenida: <strong>{formacion.puntuacion}%</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de formación activa */}
      {formacionActiva && (
        <Dialog open={!!formacionActiva} onOpenChange={() => setFormacionActiva(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formacionActiva.titulo}</DialogTitle>
              <DialogDescription>{formacionActiva.descripcion}</DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {formacionActiva.tipo === 'video' && (
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                    <Play className="h-16 w-16 text-white opacity-50" />
                  </div>
                  <Button
                    onClick={() => completarFormacion(formacionActiva.id)}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como completado
                  </Button>
                </div>
              )}
              
              {formacionActiva.tipo === 'cuestionario' && (
                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    Cuestionario de {formacionActiva.duracionEstimada} minutos
                  </p>
                  <Button
                    onClick={() => completarFormacion(formacionActiva.id, 85)}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Comenzar cuestionario
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
