/**
 * 📋 TAREAS TRABAJADOR - VISTA COMPLETA
 * 
 * Componente para que el trabajador:
 * - Vea su guion del día (tareas informativas)
 * - Vea tareas que requieren reporte
 * - Complete tareas con evidencias
 * - Vea historial de tareas completadas
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListChecks,
  FileText,
  Play,
  Upload,
  Eye,
  Calendar,
  Timer,
  CheckCheck,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  obtenerGuionDelDia,
  obtenerTareasParaReportar,
  completarTarea,
  marcarTareaComoVista,
  iniciarTarea,
  type TareaBase,
} from '../../services/tareas-operativas.service';
import { obtenerTareasTrabajador } from '../../services/task-management.service';

interface TareasTrabajadorProps {
  trabajadorId: string;
  trabajadorNombre: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
}

export function TareasTrabajador({
  trabajadorId,
  trabajadorNombre,
  puntoVentaId,
  puntoVentaNombre,
}: TareasTrabajadorProps) {
  const [guionDelDia, setGuionDelDia] = useState<TareaBase[]>([]);
  const [tareasParaReportar, setTareasParaReportar] = useState<TareaBase[]>([]);
  const [tareasCompletadas, setTareasCompletadas] = useState<TareaBase[]>([]);
  
  const [modalCompletarAbierto, setModalCompletarAbierto] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaBase | null>(null);
  const [tareaExpandida, setTareaExpandida] = useState<string | null>(null);
  
  // Form states
  const [comentario, setComentario] = useState('');
  const [tiempoEmpleado, setTiempoEmpleado] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);
  
  useEffect(() => {
    cargarTareas();
  }, [trabajadorId, puntoVentaId]);
  
  const cargarTareas = () => {
    // Guion del día (informativas)
    const guion = obtenerGuionDelDia(trabajadorId, puntoVentaId);
    setGuionDelDia(guion);
    
    // Tareas que requieren reporte
    const tareas = obtenerTareasParaReportar(trabajadorId, puntoVentaId);
    setTareasParaReportar(tareas);
    
    // Tareas completadas/aprobadas
    const todas = obtenerTareasTrabajador(trabajadorId);
    const completadas = todas.filter(t => 
      t.tipo === 'operativa' && 
      (t.estado === 'aprobada' || t.estado === 'rechazada')
    );
    setTareasCompletadas(completadas);
  };
  
  const handleMarcarVista = (tareaId: string) => {
    const resultado = marcarTareaComoVista(tareaId, trabajadorId);
    
    if (resultado) {
      toast.success('Tarea marcada como vista', {
        icon: <Eye className="h-4 w-4" />,
      });
      cargarTareas();
    }
  };
  
  const handleIniciarTarea = (tareaId: string) => {
    const resultado = iniciarTarea(tareaId, trabajadorId);
    
    if (resultado) {
      toast.success('Tarea iniciada', {
        description: 'El gerente verá que estás trabajando en ella',
        icon: <Play className="h-4 w-4" />,
      });
      cargarTareas();
    }
  };
  
  const handleAbrirModalCompletar = (tarea: TareaBase) => {
    setTareaSeleccionada(tarea);
    setModalCompletarAbierto(true);
    setComentario('');
    setTiempoEmpleado('');
    setEvidencias([]);
  };
  
  const handleCompletarTarea = async () => {
    if (!tareaSeleccionada) return;
    
    if (!comentario.trim()) {
      toast.error('Por favor agrega un comentario sobre el trabajo realizado');
      return;
    }
    
    try {
      await completarTarea({
        tareaId: tareaSeleccionada.id,
        trabajadorId,
        comentario,
        tiempoEmpleado: tiempoEmpleado ? parseInt(tiempoEmpleado) : undefined,
        evidenciaUrls: evidencias.length > 0 ? evidencias : undefined,
      });
      
      if (tareaSeleccionada.requiereAprobacion) {
        toast.success('Tarea completada y enviada a revisión', {
          description: 'El gerente recibirá una notificación',
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      } else {
        toast.success('Tarea completada', {
          description: 'Se ha registrado automáticamente',
          icon: <CheckCheck className="h-4 w-4" />,
        });
      }
      
      setModalCompletarAbierto(false);
      setTareaSeleccionada(null);
      cargarTareas();
    } catch (error) {
      toast.error('Error al completar la tarea');
      console.error(error);
    }
  };
  
  const handleAgregarEvidencia = () => {
    // En producción, aquí se subiría la imagen a un storage
    // Por ahora simulamos con una URL
    const mockUrl = `https://storage.example.com/evidencia-${Date.now()}.jpg`;
    setEvidencias([...evidencias, mockUrl]);
    toast.success('Evidencia agregada', {
      description: 'En producción, aquí se subiría la foto',
    });
  };
  
  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      urgente: 'destructive',
      alta: 'default',
      media: 'secondary',
      baja: 'outline',
    };
    return colors[prioridad as keyof typeof colors] || 'secondary';
  };
  
  const getPrioridadIcon = (prioridad: string) => {
    if (prioridad === 'urgente' || prioridad === 'alta') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };
  
  const getEstadoBadge = (estado: string, requiereAprobacion: boolean) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pendiente</Badge>;
      case 'en_progreso':
        return <Badge variant="default" className="gap-1 bg-blue-500"><Play className="h-3 w-3" /> En Progreso</Badge>;
      case 'completada':
        return <Badge variant="default" className="gap-1 bg-yellow-500"><Clock className="h-3 w-3" /> Esperando Aprobación</Badge>;
      case 'aprobada':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" /> Aprobada</Badge>;
      case 'rechazada':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rechazada</Badge>;
      case 'vencida':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Vencida</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };
  
  const calcularProgresoGuion = () => {
    if (guionDelDia.length === 0) return 0;
    const completadas = guionDelDia.filter(t => t.estado === 'aprobada').length;
    return Math.round((completadas / guionDelDia.length) * 100);
  };
  
  const tareasPendientes = tareasParaReportar.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso');
  const tareasEnRevision = tareasParaReportar.filter(t => t.estado === 'completada');
  const tareasRechazadas = tareasParaReportar.filter(t => t.estado === 'rechazada');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Mis Tareas</h2>
        <p className="text-muted-foreground">
          {puntoVentaNombre ? `Punto de Venta: ${puntoVentaNombre}` : 'Todas las ubicaciones'}
        </p>
      </div>
      
      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Guion del Día</p>
                <p className="text-2xl font-bold">{guionDelDia.length}</p>
              </div>
              <ListChecks className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={calcularProgresoGuion()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {calcularProgresoGuion()}% completado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Para Reportar</p>
                <p className="text-2xl font-bold">{tareasPendientes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Revisión</p>
                <p className="text-2xl font-bold text-yellow-600">{tareasEnRevision.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">{tareasRechazadas.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs principales */}
      <Tabs defaultValue="guion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guion" className="gap-2">
            <ListChecks className="h-4 w-4" />
            Guion del Día ({guionDelDia.length})
          </TabsTrigger>
          <TabsTrigger value="reportar" className="gap-2">
            <FileText className="h-4 w-4" />
            Para Reportar ({tareasPendientes.length})
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completadas ({tareasCompletadas.length})
          </TabsTrigger>
        </TabsList>
        
        {/* TAB 1: GUION DEL DÍA (Informativas) */}
        <TabsContent value="guion" className="space-y-4">
          {guionDelDia.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay tareas informativas hoy</p>
                <p className="text-muted-foreground">Tu guion del día está vacío</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Tareas informativas - Guion de trabajo
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Estas tareas son guías para tu trabajo diario. No requieren confirmación detallada,
                        solo márcalas como vistas cuando las hayas completado.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {guionDelDia.map((tarea) => (
                <Card key={tarea.id} className={tarea.estado === 'aprobada' ? 'opacity-60' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            {tarea.estado === 'aprobada' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                            )}
                            {tarea.titulo}
                          </CardTitle>
                          <Badge variant={getPrioridadColor(tarea.prioridad)} className="gap-1">
                            {getPrioridadIcon(tarea.prioridad)}
                            {tarea.prioridad}
                          </Badge>
                        </div>
                        <CardDescription>{tarea.descripcion}</CardDescription>
                      </div>
                      {tarea.estado !== 'aprobada' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarcarVista(tarea.id)}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Marcar Vista
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  {tarea.instrucciones && (
                    <CardContent>
                      <button
                        onClick={() => setTareaExpandida(tareaExpandida === tarea.id ? null : tarea.id)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
                      >
                        {tareaExpandida === tarea.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Ver instrucciones detalladas
                      </button>
                      
                      {tareaExpandida === tarea.id && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-sans">
                            {tarea.instrucciones}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* TAB 2: TAREAS PARA REPORTAR */}
        <TabsContent value="reportar" className="space-y-4">
          {tareasRechazadas.length > 0 && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Tareas Rechazadas - Requieren Corrección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tareasRechazadas.map(tarea => (
                  <Card key={tarea.id} className="border-red-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{tarea.titulo}</CardTitle>
                          <CardDescription>{tarea.descripcion}</CardDescription>
                        </div>
                        {getEstadoBadge(tarea.estado, tarea.requiereAprobacion)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tarea.comentarioGerente && (
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                            Feedback del gerente:
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {tarea.comentarioGerente}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleAbrirModalCompletar(tarea)}
                        >
                          Corregir y Reenviar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
          
          {tareasEnRevision.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  En Revisión del Gerente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tareasEnRevision.map(tarea => (
                  <Card key={tarea.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{tarea.titulo}</CardTitle>
                          <CardDescription>
                            Enviada: {new Date(tarea.fechaCompletada!).toLocaleString()}
                          </CardDescription>
                        </div>
                        {getEstadoBadge(tarea.estado, tarea.requiereAprobacion)}
                      </div>
                    </CardHeader>
                    {tarea.comentarioTrabajador && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Tu reporte: {tarea.comentarioTrabajador}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
          
          {tareasPendientes.length === 0 && tareasRechazadas.length === 0 && tareasEnRevision.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">¡Todo al día!</p>
                <p className="text-muted-foreground">No tienes tareas pendientes de reportar</p>
              </CardContent>
            </Card>
          ) : (
            tareasPendientes.map((tarea) => (
              <Card key={tarea.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{tarea.titulo}</CardTitle>
                        <Badge variant={getPrioridadColor(tarea.prioridad)} className="gap-1">
                          {getPrioridadIcon(tarea.prioridad)}
                          {tarea.prioridad}
                        </Badge>
                        {getEstadoBadge(tarea.estado, tarea.requiereAprobacion)}
                      </div>
                      <CardDescription>{tarea.descripcion}</CardDescription>
                      {tarea.fechaVencimiento && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Vence: {new Date(tarea.fechaVencimiento).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {tarea.instrucciones && (
                    <div>
                      <button
                        onClick={() => setTareaExpandida(tareaExpandida === tarea.id ? null : tarea.id)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tareaExpandida === tarea.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Instrucciones
                      </button>
                      
                      {tareaExpandida === tarea.id && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-sans">
                            {tarea.instrucciones}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {tarea.estado === 'pendiente' && (
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleIniciarTarea(tarea.id)}
                      >
                        <Play className="h-4 w-4" />
                        Iniciar
                      </Button>
                    )}
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleAbrirModalCompletar(tarea)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Completar Tarea
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        {/* TAB 3: HISTORIAL */}
        <TabsContent value="historial" className="space-y-4">
          {tareasCompletadas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay tareas completadas aún</p>
                <p className="text-muted-foreground">Tu historial aparecerá aquí</p>
              </CardContent>
            </Card>
          ) : (
            tareasCompletadas.map((tarea) => (
              <Card key={tarea.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{tarea.titulo}</CardTitle>
                        {getEstadoBadge(tarea.estado, tarea.requiereAprobacion)}
                      </div>
                      <CardDescription>
                        Completada: {new Date(tarea.fechaCompletada!).toLocaleDateString()}
                        {tarea.fechaAprobada && (
                          <> • Aprobada: {new Date(tarea.fechaAprobada).toLocaleDateString()}</>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {(tarea.comentarioTrabajador || tarea.comentarioGerente) && (
                  <CardContent className="space-y-3">
                    {tarea.comentarioTrabajador && (
                      <div>
                        <p className="text-sm font-medium mb-1">Tu reporte:</p>
                        <p className="text-sm text-muted-foreground">{tarea.comentarioTrabajador}</p>
                      </div>
                    )}
                    
                    {tarea.comentarioGerente && (
                      <div className={`p-3 rounded-lg ${
                        tarea.estado === 'aprobada' 
                          ? 'bg-green-50 dark:bg-green-950' 
                          : 'bg-red-50 dark:bg-red-950'
                      }`}>
                        <p className="text-sm font-medium mb-1">
                          Feedback del gerente:
                        </p>
                        <p className="text-sm">{tarea.comentarioGerente}</p>
                      </div>
                    )}
                    
                    {tarea.tiempoEmpleado && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Tiempo empleado: {tarea.tiempoEmpleado} minutos
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal Completar Tarea */}
      <Dialog open={modalCompletarAbierto} onOpenChange={setModalCompletarAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completar Tarea</DialogTitle>
            <DialogDescription>
              {tareaSeleccionada?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          {tareaSeleccionada && (
            <div className="space-y-4">
              {/* Info de la tarea */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm">{tareaSeleccionada.descripcion}</p>
                {tareaSeleccionada.instrucciones && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-1">Instrucciones:</p>
                    <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground">
                      {tareaSeleccionada.instrucciones}
                    </pre>
                  </div>
                )}
              </div>
              
              {tareaSeleccionada.estado === 'rechazada' && tareaSeleccionada.comentarioGerente && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Correcciones solicitadas:
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {tareaSeleccionada.comentarioGerente}
                  </p>
                </div>
              )}
              
              {/* Reporte del trabajo */}
              <div className="space-y-2">
                <Label htmlFor="comentario">
                  Reporte del Trabajo Realizado *
                </Label>
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Describe el trabajo realizado, resultados, observaciones, etc."
                  rows={5}
                />
              </div>
              
              {/* Tiempo empleado */}
              <div className="space-y-2">
                <Label htmlFor="tiempo">
                  Tiempo Empleado (minutos)
                </Label>
                <Input
                  id="tiempo"
                  type="number"
                  value={tiempoEmpleado}
                  onChange={(e) => setTiempoEmpleado(e.target.value)}
                  placeholder="Ej: 30"
                  min="1"
                />
              </div>
              
              {/* Evidencias */}
              <div className="space-y-2">
                <Label>Evidencias (Fotos/Documentos)</Label>
                <div className="space-y-2">
                  {evidencias.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1">Evidencia {index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEvidencias(evidencias.filter((_, i) => i !== index))}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleAgregarEvidencia}
                  >
                    <Upload className="h-4 w-4" />
                    Agregar Foto/Documento
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    En producción, aquí podrás subir fotos desde tu cámara o galería
                  </p>
                </div>
              </div>
              
              {/* Aviso de aprobación */}
              {tareaSeleccionada.requiereAprobacion && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Esta tarea requiere aprobación del gerente
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCompletarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompletarTarea} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {tareaSeleccionada?.requiereAprobacion ? 'Enviar a Revisión' : 'Completar Tarea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
