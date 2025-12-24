/**
 * 📅 MIS CITAS - PERFIL CLIENTE
 * Vista de citas del cliente con próximas citas y historial
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  CheckCircle,
  Plus,
  User,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCitas } from '../../hooks/useCitas';
import type { Cita } from '../../types/cita.types';

interface MisCitasProps {
  clienteId: string;
  onSolicitarCita?: () => void;
}

export function MisCitas({ clienteId, onSolicitarCita }: MisCitasProps) {
  const { obtenerCitas, cancelarCita, obtenerProximaCitaConfirmada } = useCitas();

  // Estados
  const [modalCancelar, setModalCancelar] = useState(false);
  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Helper para parsear fecha (maneja ISO y fecha simple)
  const parseFecha = (fecha: string, hora?: string): Date => {
    // Si la fecha ya incluye 'T' (formato ISO), usar solo la parte de fecha
    const fechaBase = fecha.includes('T') ? fecha.split('T')[0] : fecha;
    if (hora) {
      return new Date(`${fechaBase}T${hora}`);
    }
    return new Date(fechaBase);
  };

  // Obtener citas del cliente
  const misCitas = useMemo(() => {
    console.log('📅 MisCitas - clienteId recibido:', clienteId, typeof clienteId);
    const citas = obtenerCitas({ clienteId });
    console.log('📅 MisCitas - citas obtenidas:', citas);
    // Asegurar que sea un array
    if (!Array.isArray(citas)) return [];
    return citas.sort((a, b) => {
      const fechaA = parseFecha(a.fecha, a.horaInicio);
      const fechaB = parseFecha(b.fecha, b.horaInicio);
      return fechaB.getTime() - fechaA.getTime();
    });
  }, [obtenerCitas, clienteId]);

  // Próxima cita confirmada
  const proximaCita = useMemo(() => {
    return obtenerProximaCitaConfirmada(clienteId);
  }, [obtenerProximaCitaConfirmada, clienteId]);

  // Separar citas por estado
  const citasActivas = useMemo(() => {
    console.log('📅 Calculando citasActivas de misCitas:', misCitas.length);
    const activas = misCitas.filter(c => {
      const fechaCita = parseFecha(c.fecha, c.horaInicio);
      const esEstadoActivo = c.estado === 'solicitada' || c.estado === 'confirmada' || c.estado === 'en-progreso';
      const esFutura = isFuture(fechaCita) || isToday(fechaCita);
      console.log('📅 Cita:', c.id, 'estado:', c.estado, 'fecha:', c.fecha, 'esActivo:', esEstadoActivo, 'esFutura:', esFutura);
      return esEstadoActivo && esFutura;
    });
    console.log('📅 Citas activas resultado:', activas.length);
    return activas;
  }, [misCitas]);

  const historialCitas = useMemo(() => {
    return misCitas.filter(c => {
      const fechaCita = parseFecha(c.fecha, c.horaInicio);
      return c.estado === 'completada' || 
        c.estado === 'cancelada' || 
        c.estado === 'no-presentado' ||
        (isPast(fechaCita) && !isToday(fechaCita));
    });
  }, [misCitas]);

  // Handler para cancelar cita
  const handleCancelar = async () => {
    if (!citaACancelar || !motivoCancelacion.trim()) {
      toast.error('Debes proporcionar un motivo de cancelación');
      return;
    }

    setProcesando(true);
    const resultado = await cancelarCita(
      citaACancelar.id,
      motivoCancelacion,
      clienteId
    );

    setProcesando(false);

    if (resultado) {
      toast.success('Cita cancelada correctamente');
      setModalCancelar(false);
      setMotivoCancelacion('');
      setCitaACancelar(null);
    } else {
      toast.error('Error al cancelar la cita');
    }
  };

  // Función para obtener el badge de estado
  const getEstadoBadge = (cita: Cita) => {
    const configs = {
      'solicitada': { label: 'Pendiente de confirmación', className: 'bg-orange-100 text-orange-700' },
      'confirmada': { label: 'Confirmada', className: 'bg-blue-100 text-blue-700' },
      'en-progreso': { label: 'En progreso', className: 'bg-purple-100 text-purple-700' },
      'completada': { label: 'Completada', className: 'bg-green-100 text-green-700' },
      'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
      'no-presentado': { label: 'No te presentaste', className: 'bg-gray-100 text-gray-700' },
    };

    const config = configs[cita.estado];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Función para verificar si se puede cancelar
  const puedeCancelar = (cita: Cita) => {
    return cita.estado === 'solicitada' || cita.estado === 'confirmada';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Mis Citas</h2>
          <p className="text-gray-600">
            Gestiona tus citas y reservas
          </p>
        </div>
        <Button onClick={onSolicitarCita} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Próxima cita destacada */}
      {proximaCita && (
        <Card className="border-2 border-blue-500 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Próxima Cita Confirmada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg space-y-3">
              {/* Servicio */}
              <div>
                <div className="font-semibold text-lg">{proximaCita.servicioNombre}</div>
                <div className="text-sm text-gray-600">Duración: {proximaCita.servicioDuracion} minutos</div>
              </div>

              {/* Fecha y hora */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">
                    {format(parseISO(proximaCita.fecha), "EEEE, d 'de' MMMM", { locale: es })}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    {proximaCita.horaInicio} - {proximaCita.horaFin}
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">{proximaCita.puntoVentaNombre}</div>
                </div>
              </div>

              {/* Trabajador asignado */}
              {proximaCita.trabajadorAsignadoNombre && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Atendido por:</div>
                    <div className="font-medium">{proximaCita.trabajadorAsignadoNombre}</div>
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="pt-2">
                {getEstadoBadge(proximaCita)}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              {puedeCancelar(proximaCita) && (
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => {
                    setCitaACancelar(proximaCita);
                    setModalCancelar(true);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar Cita
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Citas Activas */}
      {citasActivas.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Citas Programadas</h3>
          <div className="space-y-3">
            {citasActivas.map((cita) => (
              <Card key={cita.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{cita.servicioNombre}</div>
                        <div className="text-sm text-gray-500">{cita.numero}</div>
                      </div>
                      {getEstadoBadge(cita)}
                    </div>

                    {/* Fecha y hora */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {format(parseISO(cita.fecha), 'dd/MM/yyyy', { locale: es })}
                      </span>
                      <Clock className="h-4 w-4 text-gray-400 ml-2" />
                      <span>{cita.horaInicio} - {cita.horaFin}</span>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{cita.puntoVentaNombre}</span>
                    </div>

                    {/* Trabajador */}
                    {cita.trabajadorAsignadoNombre && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{cita.trabajadorAsignadoNombre}</span>
                      </div>
                    )}

                    {/* Mensaje */}
                    {cita.mensaje && (
                      <div className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{cita.mensaje}</span>
                      </div>
                    )}

                    {/* Acciones */}
                    {puedeCancelar(cita) && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setCitaACancelar(cita);
                            setModalCancelar(true);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                          Cancelar Cita
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Citas */}
      {historialCitas.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Historial</h3>
          <div className="space-y-3">
            {historialCitas.map((cita) => (
              <Card key={cita.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{cita.servicioNombre}</div>
                        <div className="text-sm text-gray-500">{cita.numero}</div>
                      </div>
                      {getEstadoBadge(cita)}
                    </div>

                    {/* Fecha y hora */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {format(parseISO(cita.fecha), 'dd/MM/yyyy', { locale: es })}
                      </span>
                      <Clock className="h-4 w-4 text-gray-400 ml-2" />
                      <span>{cita.horaInicio}</span>
                    </div>

                    {/* Motivo de cancelación si aplica */}
                    {cita.estado === 'cancelada' && cita.motivoCancelacion && (
                      <div className="flex items-start gap-2 text-sm bg-red-50 p-3 rounded">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-700">Motivo de cancelación:</div>
                          <div className="text-red-600">{cita.motivoCancelacion}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {citasActivas.length === 0 && historialCitas.length === 0 && !proximaCita && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No tienes citas programadas</h3>
            <p className="text-gray-600 mb-6">
              Solicita tu primera cita para comenzar
            </p>
            <Button onClick={onSolicitarCita} className="gap-2">
              <Plus className="h-4 w-4" />
              Solicitar Cita
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Cancelación */}
      <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {citaACancelar && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {format(parseISO(citaACancelar.fecha), 'dd/MM/yyyy', { locale: es })} - {citaACancelar.horaInicio}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{citaACancelar.servicioNombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{citaACancelar.puntoVentaNombre}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo de cancelación (opcional)</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="¿Por qué cancelas esta cita?"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Tu cancelación será notificada al negocio
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalCancelar(false);
                setMotivoCancelacion('');
              }}
              disabled={procesando}
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={procesando}
            >
              {procesando ? 'Cancelando...' : 'Cancelar Cita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
