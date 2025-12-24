/**
 * 📅 PANEL CONFIRMACIÓN DE CITAS (TRABAJADOR)
 * Panel para que los trabajadores confirmen las citas solicitadas
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Calendar,
  Clock, 
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCitas } from '../../hooks/useCitas';
import type { Cita } from '../../types/cita.types';

interface ConfirmacionCitasProps {
  trabajadorId: string;
  trabajadorNombre: string;
  puntoVentaId: string;
}

export function ConfirmacionCitas({ 
  trabajadorId, 
  trabajadorNombre,
  puntoVentaId 
}: ConfirmacionCitasProps) {
  const { obtenerCitas, confirmarCita, cancelarCita, refrescar } = useCitas();
  
  const [citasPendientes, setCitasPendientes] = useState<Cita[]>([]);
  const [citasConfirmadas, setCitasConfirmadas] = useState<Cita[]>([]);
  const [expandedCita, setExpandedCita] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = () => {
    // Obtener citas pendientes del punto de venta
    const pendientes = obtenerCitas({
      puntoVentaId,
      estado: 'solicitada'
    });
    
    // Obtener citas confirmadas asignadas al trabajador
    const confirmadas = obtenerCitas({
      trabajadorId,
      estado: ['confirmada', 'en-progreso']
    });
    
    setCitasPendientes(pendientes);
    setCitasConfirmadas(confirmadas);
  };

  const handleConfirmar = async (cita: Cita) => {
    setProcesando(cita.id);
    
    try {
      const resultado = await confirmarCita(cita.id, trabajadorId, trabajadorNombre);
      
      if (resultado.exito) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-medium">Cita confirmada</span>
            <span className="text-sm opacity-90">
              {cita.numero} - {cita.clienteNombre}
            </span>
          </div>
        );
        cargarCitas();
        refrescar();
      } else {
        toast.error(resultado.error || 'No se pudo confirmar la cita');
      }
    } catch (error) {
      toast.error('Error al confirmar la cita');
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (cita: Cita) => {
    setProcesando(cita.id);
    
    try {
      const exito = await cancelarCita(
        cita.id, 
        'Rechazada por el trabajador', 
        trabajadorId
      );
      
      if (exito) {
        toast.info(`Cita ${cita.numero} rechazada`);
        cargarCitas();
        refrescar();
      } else {
        toast.error('No se pudo rechazar la cita');
      }
    } catch (error) {
      toast.error('Error al rechazar la cita');
    } finally {
      setProcesando(null);
    }
  };

  const toggleExpanded = (citaId: string) => {
    setExpandedCita(expandedCita === citaId ? null : citaId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Gestión de Citas</h2>
        <p className="text-gray-600">
          Confirma o rechaza las citas solicitadas por los clientes
        </p>
      </div>

      {/* Citas Pendientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Citas Pendientes de Confirmación
          </h3>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {citasPendientes.length} pendiente{citasPendientes.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {citasPendientes.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">
              No hay citas pendientes de confirmación
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {citasPendientes.map((cita) => (
              <Card key={cita.id} className="p-4">
                <div className="space-y-4">
                  {/* Header de la cita */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">
                          {cita.numero}
                        </Badge>
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          {cita.estado.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{cita.clienteNombre}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(cita.fecha + 'T00:00:00'), "d 'de' MMMM", { locale: es })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{cita.horaInicio} - {cita.horaFin}</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Servicio:</span>{' '}
                        <span className="text-gray-600">{cita.servicioNombre}</span>
                        <span className="text-gray-400 ml-2">({cita.servicioDuracion} min)</span>
                      </div>
                    </div>

                    {/* Botón expandir */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(cita.id)}
                    >
                      {expandedCita === cita.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Detalles expandidos */}
                  {expandedCita === cita.id && (
                    <div className="pt-4 border-t space-y-3">
                      {cita.mensaje && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="text-sm font-medium text-gray-700">Mensaje del cliente:</span>
                          </div>
                          <p className="text-sm text-gray-600 pl-6">{cita.mensaje}</p>
                        </div>
                      )}

                      {cita.archivosAdjuntos && cita.archivosAdjuntos.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Archivos adjuntos ({cita.archivosAdjuntos.length})
                            </span>
                          </div>
                          <div className="space-y-1 pl-6">
                            {cita.archivosAdjuntos.map((archivo) => (
                              <div key={archivo.id} className="text-sm text-blue-600 hover:underline cursor-pointer">
                                {archivo.nombre}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Solicitada el {format(new Date(cita.fechaCreacion), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleConfirmar(cita)}
                      disabled={procesando !== null}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {procesando === cita.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar Cita
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRechazar(cita)}
                      disabled={procesando !== null}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Citas Confirmadas */}
      {citasConfirmadas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Mis Citas Confirmadas
            </h3>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {citasConfirmadas.length} confirmada{citasConfirmadas.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="space-y-3">
            {citasConfirmadas.map((cita) => (
              <Card key={cita.id} className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700">
                        {cita.numero}
                      </Badge>
                      <Badge className="bg-green-600 text-white">
                        CONFIRMADA
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{cita.clienteNombre}</span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(cita.fecha + 'T00:00:00'), "d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{cita.horaInicio} - {cita.horaFin}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Servicio:</span>{' '}
                      <span className="text-gray-600">{cita.servicioNombre}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
