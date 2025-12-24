/**
 * 📋 GESTIÓN DE TAREAS OPERATIVAS - GERENTE
 * 
 * Panel para que el gerente cree, gestione y monitoree tareas del equipo.
 * Incluye:
 * - Crear tareas con reporte
 * - Crear guiones de trabajo (informativos)
 * - Ver tareas pendientes de aprobación
 * - Estadísticas de completitud
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListChecks,
  FileText,
  Users,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  operativaApi, 
  type TareaOperativa, 
  type EstadisticasTareas,
  type TrabajadorAsignable 
} from '../../services/api/gerente.api';

type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente';

interface GestionTareasOperativasProps {
  gerenteId: string;
  gerenteNombre: string;
  empresaId: string;
  empresaNombre: string;
}

export function GestionTareasOperativas({
  gerenteId,
  gerenteNombre,
  empresaId,
  empresaNombre,
}: GestionTareasOperativasProps) {
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaOperativa | null>(null);
  const [tareas, setTareas] = useState<TareaOperativa[]>([]);
  const [trabajadores, setTrabajadores] = useState<TrabajadorAsignable[]>([]);
  const [stats, setStats] = useState<EstadisticasTareas>({
    total: 0,
    pendientes: 0,
    enProgreso: 0,
    completadas: 0,
    aprobadas: 0,
    rechazadas: 0,
    vencidas: 0,
    urgentes: 0,
    pendientesAprobacion: 0,
    requierenReporte: 0,
    informativas: 0,
    porVencer: 0,
  });
  const [cargando, setCargando] = useState(false);
  
  // Form states
  const [tipoTarea, setTipoTarea] = useState<'con_reporte' | 'informativa'>('con_reporte');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadTarea>('media');
  const [requiereAprobacion, setRequiereAprobacion] = useState(true);
  const [asignadoA, setAsignadoA] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [recurrente, setRecurrente] = useState(false);
  
  // Cargar tareas y trabajadores
  useEffect(() => {
    cargarTareas();
    cargarTrabajadores();
  }, [empresaId]);
  
  const cargarTareas = async () => {
    setCargando(true);
    try {
      const [tareasData, statsData] = await Promise.all([
        operativaApi.obtenerTareas({ empresa_id: empresaId }),
        operativaApi.obtenerEstadisticas({ empresa_id: empresaId })
      ]);
      setTareas(Array.isArray(tareasData) ? tareasData : []);
      if (statsData) setStats(statsData);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      setTareas([]);
    } finally {
      setCargando(false);
    }
  };
  
  const cargarTrabajadores = async () => {
    try {
      console.log('🔄 Cargando trabajadores para empresa:', empresaId);
      const data = await operativaApi.obtenerTrabajadores({ empresa_id: empresaId });
      console.log('✅ Trabajadores recibidos:', data);
      setTrabajadores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error cargando trabajadores:', error);
      setTrabajadores([]);
    }
  };
  
  const handleCrearTarea = async () => {
    if (!titulo || !descripcion || !asignadoA) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    
    const trabajadorSeleccionado = trabajadores.find(t => t.id.toString() === asignadoA);
    
    try {
      await operativaApi.crearTarea({
        titulo,
        descripcion,
        instrucciones: instrucciones || undefined,
        empresa_id: empresaId,
        empresa_nombre: empresaNombre,
        punto_venta_id: trabajadorSeleccionado?.puntoVentaId || 'PDV-TIANA',
        asignado_a_id: parseInt(asignadoA),
        asignado_a_nombre: trabajadorSeleccionado?.nombre || 'Trabajador',
        asignado_por_id: parseInt(gerenteId) || undefined,
        asignado_por_nombre: gerenteNombre,
        prioridad,
        requiere_reporte: tipoTarea === 'con_reporte',
        requiere_aprobacion: requiereAprobacion,
        fecha_vencimiento: fechaVencimiento || undefined,
        recurrente,
        frecuencia: recurrente ? 'diaria' : 'unica',
      });
      
      toast.success('Tarea creada correctamente', {
        description: 'El trabajador recibirá una notificación',
      });
      
      // Reset form
      setModalCrearAbierto(false);
      resetForm();
      cargarTareas();
    } catch (error) {
      toast.error('Error al crear la tarea');
      console.error(error);
    }
  };
  
  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setInstrucciones('');
    setPrioridad('media');
    setRequiereAprobacion(true);
    setAsignadoA('');
    setFechaVencimiento('');
    setRecurrente(false);
    setTipoTarea('con_reporte');
  };
  
  const handleAprobar = async (tareaId: number) => {
    try {
      await operativaApi.aprobarRechazarTarea(tareaId, {
        aprobada: true,
        comentario: 'Trabajo aprobado',
      });
      
      toast.success('Tarea aprobada');
      cargarTareas();
      setModalDetalleAbierto(false);
    } catch (error) {
      toast.error('Error al aprobar la tarea');
    }
  };
  
  const handleRechazar = async (tareaId: number, motivo: string) => {
    try {
      await operativaApi.aprobarRechazarTarea(tareaId, {
        aprobada: false,
        comentario: motivo,
      });
      
      toast.success('Tarea rechazada', {
        description: 'El trabajador recibirá feedback',
      });
      cargarTareas();
      setModalDetalleAbierto(false);
    } catch (error) {
      toast.error('Error al rechazar la tarea');
    }
  };
  
  const tareasPendientesAprobacion = (tareas || []).filter(
    t => t.estado === 'completada' && t.requiereAprobacion
  );
  
  const getPrioridadColor = (prioridad: PrioridadTarea) => {
    const colors = {
      urgente: 'bg-red-500',
      alta: 'bg-orange-500',
      media: 'bg-yellow-500',
      baja: 'bg-green-500',
    };
    return colors[prioridad];
  };
  
  const getEstadoColor = (estado: string) => {
    const colors = {
      pendiente: 'bg-gray-500',
      en_progreso: 'bg-blue-500',
      completada: 'bg-yellow-500',
      aprobada: 'bg-green-500',
      rechazada: 'bg-red-500',
      vencida: 'bg-red-700',
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-500';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Tareas Operativas</h2>
          <p className="text-muted-foreground">
            Crea tareas con reporte o guiones de trabajo informativos para tu equipo
          </p>
        </div>
        <Button onClick={() => setModalCrearAbierto(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Total Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.operativas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.requierenReporte} con reporte • {stats.informativas} informativas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pendientes Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendientesAprobacion}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren tu revisión
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.aprobadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Aprobadas y finalizadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.urgentes + stats.vencidas}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.urgentes} urgentes • {stats.vencidas} vencidas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="pendientes_aprobacion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendientes_aprobacion">
            Pendientes Aprobación ({tareasPendientesAprobacion.length})
          </TabsTrigger>
          <TabsTrigger value="todas">
            Todas las Tareas ({(tareas || []).length})
          </TabsTrigger>
          <TabsTrigger value="estadisticas">
            Estadísticas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendientes_aprobacion" className="space-y-4">
          {tareasPendientesAprobacion.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">¡Todo al día!</p>
                <p className="text-muted-foreground">No hay tareas pendientes de aprobación</p>
              </CardContent>
            </Card>
          ) : (
            tareasPendientesAprobacion.map(tarea => (
              <Card key={tarea.id} className="hover:border-primary cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {tarea.titulo}
                        <Badge className={getPrioridadColor(tarea.prioridad as PrioridadTarea)}>
                          {tarea.prioridad}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Por {tarea.asignadoANombre || tarea.asignadoA?.nombre || 'Sin asignar'} • {tarea.puntoVentaNombre || tarea.puntoVentaId}
                      </CardDescription>
                    </div>
                    <Badge className={getEstadoColor(tarea.estado)}>
                      {tarea.estado}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Reporte del trabajador:</p>
                    <p className="text-sm text-muted-foreground">
                      {tarea.comentarioTrabajador || 'Sin comentarios'}
                    </p>
                  </div>
                  
                  {tarea.tiempoEmpleado && (
                    <p className="text-xs text-muted-foreground">
                      ⏱️ Tiempo empleado: {tarea.tiempoEmpleado} minutos
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      variant="default"
                      onClick={() => handleAprobar(tarea.id)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      variant="destructive"
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setModalDetalleAbierto(true);
                      }}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="todas" className="space-y-4">
          {(tareas || []).map(tarea => (
            <Card key={tarea.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {tarea.requiereReporte ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ListChecks className="h-4 w-4" />
                      )}
                      {tarea.titulo}
                      <Badge className={getPrioridadColor(tarea.prioridad as PrioridadTarea)} variant="secondary">
                        {tarea.prioridad}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {tarea.asignadoANombre || tarea.asignadoA?.nombre || 'Sin asignar'} • {tarea.puntoVentaNombre || tarea.puntoVentaId}
                      {tarea.fechaVencimiento && (
                        <> • Vence: {new Date(tarea.fechaVencimiento).toLocaleDateString()}</>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getEstadoColor(tarea.estado)}>
                      {tarea.estado}
                    </Badge>
                    <Badge variant="outline">
                      {tarea.requiereReporte ? 'Con reporte' : 'Informativa'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tarea.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="estadisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Detalladas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Por Estado</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Pendientes</span>
                      <span className="font-medium">{stats.pendientes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>En Progreso</span>
                      <span className="font-medium">{stats.enProgreso}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completadas</span>
                      <span className="font-medium">{stats.completadas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Aprobadas</span>
                      <span className="font-medium">{stats.aprobadas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rechazadas</span>
                      <span className="font-medium">{stats.rechazadas}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Por Tipo</p>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Con Reporte</span>
                      <span className="font-medium">{stats.requierenReporte}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Informativas</span>
                      <span className="font-medium">{stats.informativas}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Por vencer</span>
                      <span className="font-medium">{stats.porVencer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modal Crear Tarea */}
      <Dialog open={modalCrearAbierto} onOpenChange={setModalCrearAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
            <DialogDescription>
              Elige si requiere reporte del trabajador o es solo informativa
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tipo de tarea */}
            <div className="space-y-2">
              <Label>Tipo de Tarea</Label>
              <Select value={tipoTarea} onValueChange={(value: any) => setTipoTarea(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="con_reporte">
                    Con Reporte - Trabajador debe completar y confirmar
                  </SelectItem>
                  <SelectItem value="informativa">
                    Guion de Trabajo - Solo informativo (checklist)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Revisar stock de ingredientes críticos"
              />
            </div>
            
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción breve de la tarea"
                rows={3}
              />
            </div>
            
            {/* Instrucciones */}
            <div className="space-y-2">
              <Label htmlFor="instrucciones">Instrucciones Detalladas</Label>
              <Textarea
                id="instrucciones"
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                placeholder="Pasos detallados para completar la tarea..."
                rows={5}
              />
            </div>
            
            {/* Asignar a */}
            <div className="space-y-2">
              <Label htmlFor="asignado">Asignar a *</Label>
              <Select value={asignadoA} onValueChange={setAsignadoA}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un trabajador" />
                </SelectTrigger>
                <SelectContent>
                  {(!trabajadores || trabajadores.length === 0) ? (
                    <SelectItem value="none" disabled>No hay trabajadores disponibles</SelectItem>
                  ) : (
                    trabajadores.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.nombre} - {t.puesto}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Prioridad */}
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select value={prioridad} onValueChange={(value: any) => setPrioridad(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Fecha vencimiento */}
              <div className="space-y-2">
                <Label htmlFor="vencimiento">Fecha Vencimiento</Label>
                <Input
                  id="vencimiento"
                  type="datetime-local"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
              </div>
            </div>
            
            {/* Opciones según tipo */}
            {tipoTarea === 'con_reporte' ? (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Requiere aprobación del gerente</Label>
                  <p className="text-sm text-muted-foreground">
                    Deberás revisar y aprobar cuando el trabajador complete la tarea
                  </p>
                </div>
                <Switch
                  checked={requiereAprobacion}
                  onCheckedChange={setRequiereAprobacion}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Tarea recurrente</Label>
                  <p className="text-sm text-muted-foreground">
                    Se repetirá automáticamente cada día
                  </p>
                </div>
                <Switch
                  checked={recurrente}
                  onCheckedChange={setRecurrente}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCrearAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearTarea}>
              Crear Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal Rechazar Tarea */}
      <Dialog open={modalDetalleAbierto} onOpenChange={setModalDetalleAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Tarea</DialogTitle>
            <DialogDescription>
              Indica qué debe corregir el trabajador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Motivo del rechazo y correcciones necesarias..."
              rows={4}
              id="motivo-rechazo"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDetalleAbierto(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const motivo = (document.getElementById('motivo-rechazo') as HTMLTextAreaElement)?.value;
                if (tareaSeleccionada && motivo) {
                  handleRechazar(tareaSeleccionada.id, motivo);
                }
              }}
            >
              Rechazar Tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
