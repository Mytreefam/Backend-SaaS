/**
 * 📅 GESTIÓN DE CITAS - PERFIL GERENTE
 * Vista completa para administrar todas las citas del sistema
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  UserCheck,
  Ban,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCitas } from '../../hooks/useCitas';
import type { Cita, EstadoCita, EstadisticasCitas } from '../../types/cita.types';

interface GestionCitasProps {
  puntoVentaId?: string;
  empresaId?: string;
}

export function GestionCitas({ puntoVentaId, empresaId }: GestionCitasProps) {
  const { 
    obtenerCitas, 
    obtenerEstadisticas,
    actualizarEstadoCita,
    cancelarCita,
    refrescar 
  } = useCitas();

  // Estados
  const [tabActiva, setTabActiva] = useState<EstadoCita | 'todas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [todasLasCitas, setTodasLasCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar citas cuando el componente monta o puntoVentaId cambia
  useEffect(() => {
    const cargarCitas = async () => {
      try {
        setCargando(true);
        console.log('📡 Cargando citas desde GestionCitas...');
        const citas = await obtenerCitas({
          puntoVentaId,
          empresaId
        });
        setTodasLasCitas(citas || []);
        console.log('✅ Citas cargadas:', citas?.length || 0);
      } catch (error) {
        console.error('❌ Error cargando citas:', error);
        setTodasLasCitas([]);
      } finally {
        setCargando(false);
      }
    };

    cargarCitas();
  }, [obtenerCitas, puntoVentaId, empresaId]);

  // Filtrar citas según tab activo y búsqueda
  const citasFiltradas = useMemo(() => {
    let citas = todasLasCitas;

    // Filtrar por estado
    if (tabActiva !== 'todas') {
      citas = citas.filter(c => c.estado === tabActiva);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      citas = citas.filter(c => 
        c.numero.toLowerCase().includes(termino) ||
        c.clienteNombre.toLowerCase().includes(termino) ||
        c.servicioNombre.toLowerCase().includes(termino) ||
        c.trabajadorAsignadoNombre?.toLowerCase().includes(termino)
      );
    }

    // Ordenar por fecha más reciente primero
    return citas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
      const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
      return fechaB.getTime() - fechaA.getTime();
    });
  }, [todasLasCitas, tabActiva, busqueda]);

  // Estado para estadísticas
  const [estadisticas, setEstadisticas] = useState<EstadisticasCitas>({
    total: 0,
    solicitadas: 0,
    confirmadas: 0,
    enProgreso: 0,
    completadas: 0,
    canceladas: 0,
    noPresantado: 0,
    tasaConfirmacion: 0,
    tasaCumplimiento: 0,
    tasaCancelacion: 0
  });

  // Cargar estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const stats = await obtenerEstadisticas({
          puntoVentaId,
          empresaId
        });
        setEstadisticas(stats || {
          total: 0,
          solicitadas: 0,
          confirmadas: 0,
          enProgreso: 0,
          completadas: 0,
          canceladas: 0,
          noPresantado: 0,
          tasaConfirmacion: 0,
          tasaCumplimiento: 0,
          tasaCancelacion: 0
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };

    cargarEstadisticas();
  }, [obtenerEstadisticas, puntoVentaId, empresaId]);

  // Contadores por estado
  const contadores = useMemo(() => {
    return {
      total: todasLasCitas.length,
      solicitadas: todasLasCitas.filter(c => c.estado === 'solicitada').length,
      confirmadas: todasLasCitas.filter(c => c.estado === 'confirmada').length,
      enProgreso: todasLasCitas.filter(c => c.estado === 'en-progreso').length,
      completadas: todasLasCitas.filter(c => c.estado === 'completada').length,
      canceladas: todasLasCitas.filter(c => c.estado === 'cancelada').length,
      noPresentado: todasLasCitas.filter(c => c.estado === 'no-presentado').length,
    };
  }, [todasLasCitas]);

  // Load initial data on component mount
  useEffect(() => {
    refrescar();
  }, []);

  // Handlers
  const handleRefrescar = () => {
    refrescar();
    toast.success('Datos actualizados');
  };

  const handleCancelarCita = async () => {
    if (!citaSeleccionada || !motivoCancelacion.trim()) {
      toast.error('Debes proporcionar un motivo de cancelación');
      return;
    }

    setProcesando(true);
    const resultado = await cancelarCita(
      citaSeleccionada.id,
      motivoCancelacion,
      'gerente'
    );

    setProcesando(false);

    if (resultado) {
      toast.success('Cita cancelada correctamente');
      setModalCancelar(false);
      setMotivoCancelacion('');
      setCitaSeleccionada(null);
    } else {
      toast.error('Error al cancelar la cita');
    }
  };

  const handleCambiarEstado = async (citaId: string, nuevoEstado: EstadoCita) => {
    setProcesando(true);
    const resultado = await actualizarEstadoCita(citaId, nuevoEstado, 'gerente-user-id');
    setProcesando(false);

    if (resultado) {
      toast.success('Estado actualizado correctamente');
    } else {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleExportar = () => {
    toast.info('Exportando datos de citas...');
    // TODO: Implementar exportación a CSV/Excel
  };

  // Función auxiliar para obtener el badge de estado
  const getEstadoBadge = (estado: EstadoCita) => {
    const configs: Record<string, { variant: 'secondary', label: string, className: string }> = {
      'solicitada': { variant: 'secondary' as const, label: 'Solicitada', className: 'bg-orange-100 text-orange-700' },
      'confirmada': { variant: 'secondary' as const, label: 'Confirmada', className: 'bg-blue-100 text-blue-700' },
      'en_progreso': { variant: 'secondary' as const, label: 'En Progreso', className: 'bg-purple-100 text-purple-700' },
      'en-progreso': { variant: 'secondary' as const, label: 'En Progreso', className: 'bg-purple-100 text-purple-700' },
      'completada': { variant: 'secondary' as const, label: 'Completada', className: 'bg-green-100 text-green-700' },
      'cancelada': { variant: 'secondary' as const, label: 'Cancelada', className: 'bg-red-100 text-red-700' },
      'no_presentado': { variant: 'secondary' as const, label: 'No se presentó', className: 'bg-gray-100 text-gray-700' },
      'no-presentado': { variant: 'secondary' as const, label: 'No se presentó', className: 'bg-gray-100 text-gray-700' },
    };

    const config = configs[estado] || { 
      variant: 'secondary' as const, 
      label: estado, 
      className: 'bg-gray-100 text-gray-700' 
    };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Gestión de Citas</h2>
          <p className="text-gray-600">
            Administra todas las citas y reservas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefrescar} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button variant="outline" onClick={handleExportar} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{contadores.total}</div>
              <div className="text-xs text-gray-600 mt-1">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{contadores.solicitadas}</div>
              <div className="text-xs text-gray-600 mt-1">Solicitadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{contadores.confirmadas}</div>
              <div className="text-xs text-gray-600 mt-1">Confirmadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{contadores.enProgreso}</div>
              <div className="text-xs text-gray-600 mt-1">En Progreso</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{contadores.completadas}</div>
              <div className="text-xs text-gray-600 mt-1">Completadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{contadores.canceladas}</div>
              <div className="text-xs text-gray-600 mt-1">Canceladas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{contadores.noPresentado}</div>
              <div className="text-xs text-gray-600 mt-1">No Presentado</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Tasa de Confirmación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(estadisticas?.tasaConfirmacion || 0).toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Citas confirmadas vs solicitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Tasa de Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(estadisticas?.tasaCumplimiento || 0).toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Citas completadas vs confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Tasa de Cancelación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(estadisticas?.tasaCancelacion || 0).toFixed(1)}%</div>
            <p className="text-xs text-gray-600 mt-1">Citas canceladas del total</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, cliente, servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por estado */}
      <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as EstadoCita | 'todas')}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="todas">
            Todas ({contadores.total})
          </TabsTrigger>
          <TabsTrigger value="solicitada">
            Solicitadas ({contadores.solicitadas})
          </TabsTrigger>
          <TabsTrigger value="confirmada">
            Confirmadas ({contadores.confirmadas})
          </TabsTrigger>
          <TabsTrigger value="en-progreso" className="hidden lg:flex">
            En Progreso ({contadores.enProgreso})
          </TabsTrigger>
          <TabsTrigger value="completada" className="hidden lg:flex">
            Completadas ({contadores.completadas})
          </TabsTrigger>
          <TabsTrigger value="cancelada" className="hidden lg:flex">
            Canceladas ({contadores.canceladas})
          </TabsTrigger>
          <TabsTrigger value="no-presentado" className="hidden lg:flex">
            No Presentado ({contadores.noPresentado})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tabActiva} className="mt-6">
          {citasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  {busqueda ? 'No se encontraron citas con ese criterio' : 'No hay citas en este estado'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Fecha y Hora</TableHead>
                        <TableHead>Trabajador</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citasFiltradas.map((cita) => (
                        <TableRow key={cita.id}>
                          <TableCell className="font-medium">{cita.numero}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{cita.clienteNombre}</div>
                              {cita.clienteTelefono && (
                                <div className="text-xs text-gray-500">{cita.clienteTelefono}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{cita.servicioNombre}</div>
                            <div className="text-xs text-gray-500">{cita.servicioDuracion} min</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="text-sm">
                                  {format(parseISO(cita.fecha), 'dd MMM yyyy', { locale: es })}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {cita.horaInicio} - {cita.horaFin}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cita.trabajadorAsignadoNombre ? (
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{cita.trabajadorAsignadoNombre}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Sin asignar</span>
                            )}
                          </TableCell>
                          <TableCell>{getEstadoBadge(cita.estado)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {cita.estado === 'solicitada' && (
                                  <DropdownMenuItem
                                    onClick={() => handleCambiarEstado(cita.id, 'confirmada')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirmar
                                  </DropdownMenuItem>
                                )}
                                {cita.estado === 'confirmada' && (
                                  <DropdownMenuItem
                                    onClick={() => handleCambiarEstado(cita.id, 'en-progreso')}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Marcar En Progreso
                                  </DropdownMenuItem>
                                )}
                                {cita.estado === 'en-progreso' && (
                                  <DropdownMenuItem
                                    onClick={() => handleCambiarEstado(cita.id, 'completada')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Marcar Completada
                                  </DropdownMenuItem>
                                )}
                                {(cita.estado === 'solicitada' || cita.estado === 'confirmada') && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setCitaSeleccionada(cita);
                                      setModalCancelar(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar Cita
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Cancelación */}
      <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la cita {citaSeleccionada?.numero}?
              Esta acción notificará al cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {citaSeleccionada && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{citaSeleccionada.clienteNombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {format(parseISO(citaSeleccionada.fecha), 'dd/MM/yyyy', { locale: es })} - {citaSeleccionada.horaInicio}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{citaSeleccionada.servicioNombre}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo de cancelación *</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                placeholder="Explica el motivo de la cancelación..."
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
              />
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
              onClick={handleCancelarCita}
              disabled={procesando || !motivoCancelacion.trim()}
            >
              {procesando ? 'Cancelando...' : 'Cancelar Cita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
