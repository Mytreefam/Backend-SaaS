/**
 * 📅 HORARIO TRABAJADOR
 * 
 * Componente para gestionar el horario del trabajador:
 * - Ver horario asignado
 * - Ver turnos próximos
 * - Solicitar cambios
 * - Ver historial
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  Plus,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  obtenerTurnosSemanaActual,
  obtenerTurnosMesActual,
  obtenerSolicitudesTrabajador,
  crearSolicitudCambio,
  TIPOS_TURNO,
  type Turno,
  type SolicitudCambioHorario,
  type TipoSolicitud,
} from '../../services/horarios.service';

interface HorarioTrabajadorProps {
  trabajadorId: string;
  trabajadorNombre: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
}

export function HorarioTrabajador({ trabajadorId, trabajadorNombre }: HorarioTrabajadorProps) {
  const [activeTab, setActiveTab] = useState('semanal');
  const [turnosSemana, setTurnosSemana] = useState<Turno[]>([]);
  const [turnosMes, setTurnosMes] = useState<Turno[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudCambioHorario[]>([]);
  const [modalSolicitudAbierto, setModalSolicitudAbierto] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState<TipoSolicitud>('dia_libre');
  const [fechaSolicitada, setFechaSolicitada] = useState('');
  const [motivoSolicitud, setMotivoSolicitud] = useState('');
  const [detallesSolicitud, setDetallesSolicitud] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [trabajadorId]);

  const cargarDatos = () => {
    // Obtener turnos de la semana actual
    const turnosSem = obtenerTurnosSemanaActual(trabajadorId);
    setTurnosSemana(turnosSem);

    // Obtener turnos del mes completo
    const turnosMes = obtenerTurnosMesActual(trabajadorId);
    setTurnosMes(turnosMes);

    // Obtener solicitudes
    const sols = obtenerSolicitudesTrabajador(trabajadorId);
    setSolicitudes(sols);
  };

  const handleCrearSolicitud = () => {
    if (!motivoSolicitud.trim()) {
      toast.error('Debes proporcionar un motivo');
      return;
    }

    if (!fechaSolicitada) {
      toast.error('Debes seleccionar una fecha');
      return;
    }

    const nuevaSolicitud = crearSolicitudCambio({
      trabajadorId,
      trabajadorNombre,
      tipo: tipoSolicitud,
      fechaSolicitada,
      motivoSolicitud,
      detalles: detallesSolicitud || undefined,
    });

    toast.success('Solicitud enviada', {
      description: 'Tu gerente revisará la solicitud pronto',
    });

    setModalSolicitudAbierto(false);
    setMotivoSolicitud('');
    setDetallesSolicitud('');
    setFechaSolicitada('');
    cargarDatos();
  };

  const getDiaSemana = (fecha: string): string => {
    const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const date = new Date(fecha + 'T00:00:00');
    return dias[date.getDay()];
  };

  const getDia = (fecha: string): number => {
    const date = new Date(fecha + 'T00:00:00');
    return date.getDate();
  };

  const getBadgeVariant = (estado: Turno['estado']): 'default' | 'secondary' | 'outline' => {
    switch (estado) {
      case 'confirmado':
        return 'default';
      case 'pendiente':
        return 'outline';
      case 'modificado':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getBadgeSolicitud = (estado: SolicitudCambioHorario['estado']) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'aprobada':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Aprobada</Badge>;
      case 'rechazada':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>;
    }
  };

  const formatearFecha = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoSolicitudLabel = (tipo: TipoSolicitud): string => {
    switch (tipo) {
      case 'cambio_turno':
        return 'Cambio de turno';
      case 'dia_libre':
        return 'Día libre';
      case 'cambio_horario':
        return 'Cambio de horario';
      case 'intercambio':
        return 'Intercambio';
      default:
        return tipo;
    }
  };

  const getTipoTurnoLabel = (turno: Turno): string => {
    const tipoInfo = TIPOS_TURNO.find(t => t.value === turno.tipoTurno);
    return tipoInfo?.label || turno.tipoTurno;
  };

  const getHorarioTurno = (turno: Turno): string => {
    if (turno.tipoTurno === 'descanso') {
      return 'Sin turno asignado';
    }
    
    if (turno.tipoTurno === 'partido' && turno.horaInicio && turno.horaFin && turno.horaInicio2 && turno.horaFin2) {
      return `${turno.horaInicio} - ${turno.horaFin} / ${turno.horaInicio2} - ${turno.horaFin2}`;
    }
    
    if (turno.horaInicio && turno.horaFin) {
      return `${turno.horaInicio} - ${turno.horaFin}`;
    }
    
    return 'Horario no definido';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Mi Horario</h2>
        <p className="text-muted-foreground">
          Gestiona tu horario y turnos asignados
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="semanal" className="gap-2">
            <Calendar className="h-4 w-4" />
            Esta Semana
          </TabsTrigger>
          <TabsTrigger value="mensual" className="gap-2">
            <Calendar className="h-4 w-4" />
            Este Mes
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="gap-2">
            <Clock className="h-4 w-4" />
            Solicitudes
            {solicitudes.filter(s => s.estado === 'pendiente').length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {solicitudes.filter(s => s.estado === 'pendiente').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Esta Semana */}
        <TabsContent value="semanal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Semana del 2 - 8 Diciembre</CardTitle>
                <Button variant="ghost" size="sm" onClick={cargarDatos}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {turnosSemana.length === 0 ? (
                <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No hay turnos asignados para esta semana
                    </p>
                  </div>
                </div>
              ) : (
                turnosSemana.map(turno => (
                  <div key={turno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{getDiaSemana(turno.fecha)}</p>
                        <p className="text-lg font-bold">{getDia(turno.fecha)}</p>
                      </div>
                      <div>
                        <p className="font-medium">{getTipoTurnoLabel(turno)}</p>
                        <p className="text-sm text-muted-foreground">{getHorarioTurno(turno)}</p>
                        {turno.puntoVentaNombre && (
                          <p className="text-xs text-muted-foreground">{turno.puntoVentaNombre}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(turno.estado)}>
                      {turno.estado === 'confirmado' ? 'Confirmado' : turno.estado === 'pendiente' ? 'Pendiente' : 'Modificado'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Este Mes */}
        <TabsContent value="mensual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diciembre 2024 - {turnosMes.length} turnos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {turnosMes.length === 0 ? (
                <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No hay turnos asignados para este mes
                    </p>
                  </div>
                </div>
              ) : (
                turnosMes.map(turno => (
                  <div key={turno.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{getDiaSemana(turno.fecha)}</p>
                        <p className="text-sm font-bold">{getDia(turno.fecha)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getTipoTurnoLabel(turno)}</p>
                        <p className="text-xs text-muted-foreground">{getHorarioTurno(turno)}</p>
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(turno.estado)} className="text-xs">
                      {turno.estado}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Solicitudes */}
        <TabsContent value="solicitudes" className="space-y-4">
          {/* Información */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900">
                    Puedes solicitar cambios de turno o días libres. Tu gerente revisará las solicitudes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solicitudes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Mis Solicitudes</CardTitle>
              <Button size="sm" onClick={() => setModalSolicitudAbierto(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {solicitudes.length === 0 ? (
                <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No tienes solicitudes registradas
                    </p>
                    <Button variant="outline" onClick={() => setModalSolicitudAbierto(true)}>
                      Crear Primera Solicitud
                    </Button>
                  </div>
                </div>
              ) : (
                solicitudes.map(solicitud => (
                  <div key={solicitud.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium">
                        {getTipoSolicitudLabel(solicitud.tipo)} - {solicitud.fechaSolicitada}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {solicitud.motivoSolicitud}
                      </p>
                      {solicitud.detalles && (
                        <p className="text-xs text-muted-foreground">
                          {solicitud.detalles}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Solicitado: {formatearFecha(solicitud.solicitadoEn)}
                      </p>
                      {solicitud.respuesta && (
                        <p className="text-xs text-blue-900 bg-blue-50 p-2 rounded mt-2">
                          <strong>Respuesta:</strong> {solicitud.respuesta}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      {getBadgeSolicitud(solicitud.estado)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Nueva Solicitud */}
      <Dialog open={modalSolicitudAbierto} onOpenChange={setModalSolicitudAbierto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud</DialogTitle>
            <DialogDescription>
              Solicita un cambio de turno o un día libre. Tu gerente revisará tu solicitud.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipoSolicitud">Tipo de Solicitud</Label>
              <Select
                value={tipoSolicitud}
                onValueChange={(value) => setTipoSolicitud(value as TipoSolicitud)}
              >
                <SelectTrigger id="tipoSolicitud">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cambio_turno">Cambio de Turno</SelectItem>
                  <SelectItem value="dia_libre">Día Libre</SelectItem>
                  <SelectItem value="cambio_horario">Cambio de Horario</SelectItem>
                  <SelectItem value="intercambio">Intercambio con Compañero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaSolicitada">Fecha Solicitada</Label>
              <Input
                id="fechaSolicitada"
                type="date"
                value={fechaSolicitada}
                onChange={(e) => setFechaSolicitada(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivoSolicitud">Motivo *</Label>
              <Input
                id="motivoSolicitud"
                value={motivoSolicitud}
                onChange={(e) => setMotivoSolicitud(e.target.value)}
                placeholder="Ej: Cita médica, asunto familiar..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detallesSolicitud">Detalles (opcional)</Label>
              <Textarea
                id="detallesSolicitud"
                value={detallesSolicitud}
                onChange={(e) => setDetallesSolicitud(e.target.value)}
                placeholder="Información adicional que pueda ayudar..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalSolicitudAbierto(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCrearSolicitud}>
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
