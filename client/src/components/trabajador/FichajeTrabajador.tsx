import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths, subWeeks, subMonths, eachDayOfInterval, isSameDay, getDay } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { DateRange } from 'react-day-picker@9.4.3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { EmptyState } from '../ui/empty-state';
import { SkeletonList } from '../ui/skeleton-list';
import { fichajesApi, Fichaje, trabajadorRrhhApi, authApi } from '../../services/api';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Timer, 
  Play, 
  Pause, 
  Coffee, 
  Plus, 
  TrendingUp, 
  Filter, 
  Calendar as CalendarIcon, 
  Receipt, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface RegistroFichaje {
  id: string;
  tipo: 'entrada' | 'salida' | 'pausa' | 'reanudacion';
  hora: string;
  notas?: string;
}

interface SolicitudHoraExtra {
  id: string;
  fecha: string;
  rango: string;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

interface SolicitudVacaciones {
  id: string;
  rango: string;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  dias: number;
}

interface ConsumoProducto {
  id: string;
  producto: string;
  categoria: 'comida' | 'bebida' | 'uniforme' | 'herramientas';
  cantidad: number;
  fecha: string;
  precio: number;
}

interface GastoEmpleado {
  id: string;
  concepto: string;
  categoria: 'limpieza' | 'transporte' | 'material' | 'otros';
  importe: number;
  fecha: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  justificante?: string;
  notas?: string;
}

interface RegistroConsumo {
  id: string;
  tipo: 'consumo_interno' | 'gasto';
  concepto: string;
  categoria: string;
  importe: number;
  fecha: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  justificante?: string;
  notas?: string;
  cantidad?: number;
}

interface FichajeTrabajadorProps {
  enTurno?: boolean;
  onFicharChange?: (enTurno: boolean) => void;
}

export function FichajeTrabajador({ enTurno: enTurnoExterno, onFicharChange }: FichajeTrabajadorProps = {}) {
  const user = authApi.getCurrentUser();
  const empleadoId = Number(user?.id || 1);
  
  const [activeTab, setActiveTab] = useState('fichaje');
  const [enTurno, setEnTurno] = useState(enTurnoExterno || false);
  const [pausado, setPausado] = useState(false);
  const [tiempoFichaje, setTiempoFichaje] = useState(0);
  const [horaActual, setHoraActual] = useState(new Date());
  const [cambioTurnoModalOpen, setCambioTurnoModalOpen] = useState(false);
  const [horasExtraModalOpen, setHorasExtraModalOpen] = useState(false);
  const [vacacionesModalOpen, setVacacionesModalOpen] = useState(false);
  const [gastoModalOpen, setGastoModalOpen] = useState(false);
  const [consumoInternoModalOpen, setConsumoInternoModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filtroConsumos, setFiltroConsumos] = useState<'todos' | 'consumos' | 'gastos' | 'pendientes' | 'aprobados'>('todos');
  const [vistaHorario, setVistaHorario] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [fechaActualHorario, setFechaActualHorario] = useState(new Date());
  const [cargando, setCargando] = useState(true);

  // Cargar estado de fichaje del backend
  const cargarEstadoFichaje = useCallback(async () => {
    try {
      setCargando(true);
      const estado = await fichajesApi.getEstadoActual(empleadoId);
      setEnTurno(estado.enTurno);
      setTiempoFichaje(estado.tiempoTrabajado);
      setPausado(estado.pausado);
      
      // Cargar fichajes del día
      const fichajesHoy = await fichajesApi.getFichajesHoy(empleadoId);
      const registros: RegistroFichaje[] = fichajesHoy.map(f => ({
        id: f.id.toString(),
        tipo: f.tipo,
        hora: f.hora,
        notas: f.notas,
      }));
      setRegistrosHoy(registros);
    } catch (error) {
      console.error('Error al cargar estado de fichaje:', error);
    } finally {
      setCargando(false);
    }
  }, [empleadoId]);

  useEffect(() => {
    cargarEstadoFichaje();
  }, [cargarEstadoFichaje]);

  // Sincronizar estado externo con interno
  useEffect(() => {
    if (enTurnoExterno !== undefined) {
      setEnTurno(enTurnoExterno);
    }
  }, [enTurnoExterno]);

  // Datos de fichajes del día (se carga del backend)
  const [registrosHoy, setRegistrosHoy] = useState<RegistroFichaje[]>([]);

  const [solicitudesHorasExtra, setSolicitudesHorasExtra] = useState<SolicitudHoraExtra[]>([]);
  const [solicitudesVacaciones, setSolicitudesVacaciones] = useState<SolicitudVacaciones[]>([]);
  const [consumosProductos, setConsumosProductos] = useState<ConsumoProducto[]>([]);
  const [gastosEmpleado, setGastosEmpleado] = useState<GastoEmpleado[]>([]);

  // Formularios modales (backend-first)
  const [horasExtraForm, setHorasExtraForm] = useState({ fecha: '', horaInicio: '', horaFin: '', motivo: '' });
  const [vacacionesMotivo, setVacacionesMotivo] = useState('');
  const [gastoForm, setGastoForm] = useState({ concepto: '', categoria: '', importe: '', fecha: '', notas: '' });
  const [consumoForm, setConsumoForm] = useState({ producto: '', categoria: '', cantidad: '1', fecha: '', notas: '' });

  // Unificar consumos internos y gastos en una sola lista
  const registrosConsumos: RegistroConsumo[] = [
    ...consumosProductos.map(c => ({
      id: c.id,
      tipo: 'consumo_interno' as const,
      concepto: c.producto,
      categoria: c.categoria,
      importe: c.cantidad * c.precio,
      fecha: c.fecha,
      estado: 'aprobado' as const,
      cantidad: c.cantidad
    })),
    ...gastosEmpleado.map(g => ({
      id: g.id,
      tipo: 'gasto' as const,
      concepto: g.concepto,
      categoria: g.categoria,
      importe: g.importe,
      fecha: g.fecha,
      estado: g.estado,
      justificante: g.justificante,
      notas: g.notas
    }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const refreshRrhh = useCallback(async () => {
    try {
      const [vac, he, cons, gas] = await Promise.all([
        trabajadorRrhhApi.listVacaciones(),
        trabajadorRrhhApi.listHorasExtra(),
        trabajadorRrhhApi.listConsumos(),
        trabajadorRrhhApi.listGastos(),
      ]);

      setSolicitudesVacaciones(
        (vac || []).map((v) => {
          const desde = new Date(v.desde);
          const hasta = new Date(v.hasta);
          const dias =
            Number.isFinite(desde.getTime()) && Number.isFinite(hasta.getTime())
              ? Math.max(1, Math.round((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)) + 1)
              : 1;
          return {
            id: String(v.id),
            rango: `${desde.toLocaleDateString('es-ES')} - ${hasta.toLocaleDateString('es-ES')}`,
            motivo: v.motivo,
            estado: (v.estado as any) || 'pendiente',
            dias,
          };
        }),
      );

      setSolicitudesHorasExtra(
        (he || []).map((h) => ({
          id: String(h.id),
          fecha: new Date(h.fecha).toLocaleDateString('es-ES'),
          rango: `${h.horaInicio} - ${h.horaFin}`,
          motivo: h.motivo,
          estado: (h.estado as any) || 'pendiente',
        })),
      );

      setConsumosProductos(
        (cons || []).map((c) => ({
          id: `CONS-${c.id}`,
          producto: c.producto,
          categoria: c.categoria as any,
          cantidad: Number(c.cantidad || 1),
          fecha: new Date(c.fecha).toISOString().split('T')[0],
          precio: Number(c.precio || 0),
        })),
      );

      setGastosEmpleado(
        (gas || []).map((g) => ({
          id: `GASTO-${g.id}`,
          concepto: g.concepto,
          categoria: g.categoria as any,
          importe: Number(g.importe || 0),
          fecha: new Date(g.fechaGasto).toISOString().split('T')[0],
          estado: (g.estado as any) || 'pendiente',
          justificante: g.justificanteUrl || undefined,
          notas: g.notas || undefined,
        })),
      );
    } catch (e) {
      console.error('Error cargando RRHH trabajador:', e);
    }
  }, []);

  useEffect(() => {
    void refreshRrhh();
  }, [refreshRrhh]);

  const vacacionesSaldo = {
    pendientes: 18,
    usadas: 7,
    totales: 25
  };

  const semana = [
    { dia: 'Lun 11', turno: 'Turno', horas: '09:00 - 18:00', previstas: 8, reales: 8 },
    { dia: 'Mar 12', turno: 'Turno', horas: '09:00 - 18:00', previstas: 8, reales: 8.5 },
    { dia: 'Mié 13', turno: 'Turno', horas: '09:00 - 18:00', previstas: 8, reales: 7.5 },
    { dia: 'Jue 14', turno: 'Turno', horas: '09:00 - 18:00', previstas: 8, reales: 8 },
    { dia: 'Vie 15', turno: 'Turno', horas: '09:00 - 18:00', previstas: 8, reales: 0 },
    { dia: 'Sáb 16', turno: 'Descanso', horas: '-', previstas: 0, reales: 0 },
    { dia: 'Dom 17', turno: 'Descanso', horas: '-', previstas: 0, reales: 0 },
  ];

  const totalPrevistas = semana.reduce((sum, d) => sum + d.previstas, 0);
  const totalReales = semana.reduce((sum, d) => sum + d.reales, 0);

  // Actualizar reloj
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cronómetro
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
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleFichar = async () => {
    try {
      if (enTurno) {
        // Fichar salida
        const resultado = await fichajesApi.ficharSalida(empleadoId);
        if (resultado) {
          const nuevoRegistro: RegistroFichaje = {
            id: resultado.id.toString(),
            tipo: 'salida',
            hora: resultado.hora,
          };
          setRegistrosHoy([...registrosHoy, nuevoRegistro]);
          setEnTurno(false);
          setTiempoFichaje(0);
          setPausado(false);
          toast.success('Salida registrada correctamente', {
            description: `Hora: ${nuevoRegistro.hora}`,
          });
          if (onFicharChange) {
            onFicharChange(false);
          }
        }
      } else {
        // Fichar entrada
        const resultado = await fichajesApi.ficharEntrada(empleadoId);
        if (resultado) {
          const nuevoRegistro: RegistroFichaje = {
            id: resultado.id.toString(),
            tipo: 'entrada',
            hora: resultado.hora,
          };
          setRegistrosHoy([...registrosHoy, nuevoRegistro]);
          setEnTurno(true);
          setTiempoFichaje(0);
          toast.success('Entrada registrada correctamente', {
            description: `Hora: ${nuevoRegistro.hora}`,
          });
          if (onFicharChange) {
            onFicharChange(true);
          }
        }
      }
    } catch (error) {
      toast.error('Error al registrar fichaje');
    }
  };

  const handlePausarContinuar = async () => {
    try {
      if (pausado) {
        // Reanudar
        const resultado = await fichajesApi.reanudar(empleadoId);
        if (resultado) {
          const nuevoRegistro: RegistroFichaje = {
            id: resultado.id.toString(),
            tipo: 'reanudacion',
            hora: resultado.hora,
          };
          setRegistrosHoy([...registrosHoy, nuevoRegistro]);
          setPausado(false);
          toast.info('Cronómetro reanudado', {
            description: `Hora: ${nuevoRegistro.hora}`,
          });
        }
      } else {
        // Pausar
        const resultado = await fichajesApi.pausar(empleadoId);
        if (resultado) {
          const nuevoRegistro: RegistroFichaje = {
            id: resultado.id.toString(),
            tipo: 'pausa',
            hora: resultado.hora,
          };
          setRegistrosHoy([...registrosHoy, nuevoRegistro]);
          setPausado(true);
          toast.info('Pausa registrada', {
            description: `Hora: ${nuevoRegistro.hora}`,
          });
        }
      }
    } catch (error) {
      toast.error('Error al pausar/reanudar');
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, { label: string; icon: any; color: string }> = {
      entrada: { label: 'Entrada', icon: LogIn, color: 'text-green-600' },
      salida: { label: 'Salida', icon: LogOut, color: 'text-red-600' },
      pausa: { label: 'Pausa', icon: Coffee, color: 'text-orange-600' },
      reanudacion: { label: 'Reanudación', icon: Play, color: 'text-blue-600' },
    };
    return labels[tipo] || labels.entrada;
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { label: string; className: string }> = {
      pendiente: { label: 'Pendiente', className: 'bg-orange-100 text-orange-700' },
      aprobada: { label: 'Aprobada', className: 'bg-green-100 text-green-700' },
      rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-700' },
    };
    const badge = estados[estado] || estados.pendiente;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-auto sm:h-10">
          <TabsTrigger value="fichaje" className="text-xs sm:text-sm py-2">Fichaje</TabsTrigger>
          <TabsTrigger value="horario" className="text-xs sm:text-sm py-2">Horario</TabsTrigger>
          <TabsTrigger value="consumos">Consumos</TabsTrigger>
          <TabsTrigger value="vacaciones">Vacaciones</TabsTrigger>
        </TabsList>

        {/* TAB: FICHAJE */}
        <TabsContent value="fichaje" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sistema de Fichaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reloj */}
              <div className="text-center py-8">
                <Clock className="w-16 h-16 mx-auto mb-4 text-teal-600" />
                <p className="text-5xl text-gray-900 mb-2 font-mono" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {format(horaActual, 'HH:mm:ss')}
                </p>
                <p className="text-gray-600 mb-6">
                  {format(horaActual, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>

                {/* Botón Fichar */}
                <Button
                  size="lg"
                  onClick={handleFichar}
                  className={`${enTurno ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} min-h-[56px] px-8`}
                >
                  {enTurno ? (
                    <>
                      <LogOut className="w-6 h-6 mr-2" />
                      Fichar Salida
                    </>
                  ) : (
                    <>
                      <LogIn className="w-6 h-6 mr-2" />
                      Fichar Entrada
                    </>
                  )}
                  <span className="ml-3 pl-3 border-l border-white/30 text-sm">
                    {enTurno ? 'En turno' : 'Fuera de turno'}
                  </span>
                </Button>
              </div>

              {/* Cronómetro */}
              {enTurno && (
                <div className="border-t pt-6">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Timer className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-700">Tiempo desde última entrada</span>
                    </div>
                    <p className="text-4xl text-blue-900 mb-4 font-mono" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatearTiempo(tiempoFichaje)}
                    </p>
                    <Button
                      variant="outline"
                      onClick={handlePausarContinuar}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      {pausado ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Registro de hoy */}
              <div className="border-t pt-6">
                <h3 className="text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Registro de Hoy
                </h3>
                <div className="space-y-2">
                  {registrosHoy.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No hay registros hoy</p>
                    </div>
                  ) : (
                    registrosHoy.map((registro) => {
                      const tipoInfo = getTipoLabel(registro.tipo);
                      const Icon = tipoInfo.icon;
                      return (
                        <div key={registro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${tipoInfo.color}`} />
                            <div>
                              <span className="text-gray-900 font-medium">{tipoInfo.label}</span>
                              {registro.notas && (
                                <p className="text-sm text-gray-600">{registro.notas}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-900 font-mono">{registro.hora}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: HORARIO */}
        <TabsContent value="horario" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {vistaHorario === 'semana' ? 'Horario de esta Semana' : `Horario de ${format(fechaActualHorario, 'MMMM yyyy', { locale: es })}`}
                </CardTitle>
                {/* Botones de navegación y vista */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (vistaHorario === 'semana') {
                        setFechaActualHorario(subWeeks(fechaActualHorario, 1));
                      } else {
                        setFechaActualHorario(subMonths(fechaActualHorario, 1));
                      }
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={vistaHorario === 'semana' ? 'default' : 'outline'}
                    onClick={() => setVistaHorario('semana')}
                    className={vistaHorario === 'semana' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    Semana
                  </Button>
                  <Button
                    size="sm"
                    variant={vistaHorario === 'mes' ? 'default' : 'outline'}
                    onClick={() => setVistaHorario('mes')}
                    className={vistaHorario === 'mes' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  >
                    Mes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (vistaHorario === 'semana') {
                        setFechaActualHorario(addWeeks(fechaActualHorario, 1));
                      } else {
                        setFechaActualHorario(addMonths(fechaActualHorario, 1));
                      }
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {vistaHorario === 'semana' ? (
                <>
                  {/* Vista Semanal */}
                  <div className="space-y-3">
                    {semana.map((dia, index) => {
                      const esHoy = dia.dia.includes(format(new Date(), 'd'));
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                            esHoy ? 'bg-teal-50 border-teal-200' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="min-w-[80px]">
                              <p className={`font-medium ${esHoy ? 'text-teal-900' : 'text-gray-900'}`}>
                                {dia.dia}
                              </p>
                            </div>
                            <Badge className={dia.turno === 'Turno' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'}>
                              {dia.turno}
                            </Badge>
                            <span className={esHoy ? 'text-teal-700' : 'text-gray-600'}>{dia.horas}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-sm ${esHoy ? 'text-teal-700' : 'text-gray-600'}`}>
                                Previstas: {dia.previstas}h | Reales: {dia.reales}h
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen */}
                  <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-teal-700 mb-1">Total de la semana</p>
                        <p className="text-2xl text-teal-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Previstas: {totalPrevistas}h | Reales: {totalReales}h
                        </p>
                      </div>
                      {totalReales > totalPrevistas && (
                        <div className="flex items-center gap-2 text-green-700">
                          <TrendingUp className="w-5 h-5" />
                          <span className="font-medium">+{totalReales - totalPrevistas}h extra</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Vista Mensual - Calendario */}
                  <div className="space-y-4">
                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
                      <div>L</div>
                      <div>M</div>
                      <div>X</div>
                      <div>J</div>
                      <div>V</div>
                      <div>S</div>
                      <div>D</div>
                    </div>

                    {/* Días del mes */}
                    {(() => {
                      const inicio = startOfMonth(fechaActualHorario);
                      const fin = endOfMonth(fechaActualHorario);
                      const diasMes = eachDayOfInterval({ start: inicio, end: fin });
                      
                      // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
                      const primerDiaSemana = getDay(inicio);
                      // Ajustar para que lunes sea 0
                      const espaciosVacios = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
                      
                      // Días de trabajo simulados (en una app real vendrían del backend)
                      const diasTrabajo = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30];
                      
                      return (
                        <div className="grid grid-cols-7 gap-2">
                          {/* Espacios vacíos antes del primer día */}
                          {Array.from({ length: espaciosVacios }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                          ))}
                          
                          {/* Días del mes */}
                          {diasMes.map((dia, index) => {
                            const numeroDia = parseInt(format(dia, 'd'));
                            const esHoy = isSameDay(dia, new Date());
                            const esDiaTrabajo = diasTrabajo.includes(numeroDia);
                            const esDomingo = getDay(dia) === 0;
                            
                            return (
                              <div
                                key={index}
                                className={`
                                  aspect-square flex flex-col items-center justify-center p-2 rounded-lg border text-sm
                                  ${esHoy ? 'bg-teal-100 border-teal-300 ring-2 ring-teal-400' : ''}
                                  ${esDiaTrabajo && !esHoy ? 'bg-teal-50 border-teal-200' : ''}
                                  ${!esDiaTrabajo && !esHoy ? 'bg-gray-50 border-gray-200' : ''}
                                  ${esDomingo ? 'bg-red-50 border-red-200' : ''}
                                `}
                              >
                                <span className={`
                                  font-medium
                                  ${esHoy ? 'text-teal-900' : ''}
                                  ${esDiaTrabajo && !esHoy ? 'text-teal-700' : ''}
                                  ${!esDiaTrabajo && !esHoy ? 'text-gray-600' : ''}
                                `}>
                                  {numeroDia}
                                </span>
                                {esDiaTrabajo && (
                                  <span className="text-[10px] text-teal-600 mt-1">8h</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Leyenda */}
                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-teal-100 border-2 border-teal-400"></div>
                        <span className="text-gray-600">Hoy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-teal-50 border border-teal-200"></div>
                        <span className="text-gray-600">Día de trabajo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div>
                        <span className="text-gray-600">Descanso</span>
                      </div>
                    </div>

                    {/* Resumen mensual */}
                    <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                      <p className="text-sm text-teal-700 mb-1">Total del mes</p>
                      <p className="text-2xl text-teal-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Días trabajados: 22 | Horas: 176h
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* CTA Solicitar Cambio de Turno */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCambioTurnoModalOpen(true)}
                  className="w-full"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Solicitar Cambio de Turno
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CONSUMOS */}
        <TabsContent value="consumos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Consumos Internos y Gastos
                </CardTitle>
                {/* Botones en la misma línea del título */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setConsumoInternoModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Consumo Interno
                  </Button>
                  <Button
                    onClick={() => setGastoModalOpen(true)}
                    variant="outline"
                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Informar de Gasto
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Subfiltro y Barra de búsqueda en la misma línea */}
              <div className="flex items-center gap-3 mb-4">
                {/* Subfiltro con dropdown Todos */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {filtroConsumos === 'todos' && 'Todos'}
                      {filtroConsumos === 'consumos' && 'Consumos'}
                      {filtroConsumos === 'gastos' && 'Gastos'}
                      {filtroConsumos === 'pendientes' && 'Pendientes'}
                      {filtroConsumos === 'aprobados' && 'Aprobados'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFiltroConsumos('todos')}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroConsumos('consumos')}>
                      <span className="text-purple-700">Consumos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroConsumos('gastos')}>
                      <span className="text-blue-700">Gastos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroConsumos('pendientes')}>
                      <span className="text-orange-700">Pendientes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroConsumos('aprobados')}>
                      <span className="text-green-700">Aprobados</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Barra de búsqueda más corta */}
                <Input
                  placeholder="Buscar por concepto, categoría o fecha..."
                  className="flex-1"
                />
              </div>

              {/* Tabla unificada */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Tipo</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-center">Justificante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrosConsumos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p>No hay consumos ni gastos registrados</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrosConsumos.map((registro) => (
                        <TableRow key={registro.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                registro.tipo === 'consumo_interno'
                                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }
                            >
                              {registro.tipo === 'consumo_interno' ? 'Consumo' : 'Gasto'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{registro.concepto}</p>
                              {registro.cantidad && (
                                <p className="text-sm text-gray-500">Cantidad: {registro.cantidad}</p>
                              )}
                              {registro.notas && (
                                <p className="text-sm text-gray-500">{registro.notas}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              registro.categoria === 'comida' || registro.categoria === 'bebida'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : registro.categoria === 'transporte'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : registro.categoria === 'limpieza'
                                ? 'bg-orange-100 text-orange-700 border-orange-200'
                                : registro.categoria === 'material'
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }>
                              {registro.categoria}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {format(new Date(registro.fecha), "d MMM yyyy", { locale: es })}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-gray-900">
                              {registro.importe.toFixed(2)}€
                            </span>
                          </TableCell>
                          <TableCell>
                            {getEstadoBadge(registro.estado)}
                          </TableCell>
                          <TableCell className="text-center">
                            {registro.justificante ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-teal-600 hover:text-teal-700"
                              >
                                <Receipt className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Resumen total */}
              <div className="mt-4 p-4 bg-teal-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 mb-1">Total acumulado</p>
                  <p className="text-2xl text-teal-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {registrosConsumos.reduce((sum, r) => sum + r.importe, 0).toFixed(2)}€
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Consumos: </span>
                    <span className="font-medium text-gray-900">
                      {registrosConsumos.filter(r => r.tipo === 'consumo_interno').reduce((sum, r) => sum + r.importe, 0).toFixed(2)}€
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gastos: </span>
                    <span className="font-medium text-gray-900">
                      {registrosConsumos.filter(r => r.tipo === 'gasto').reduce((sum, r) => sum + r.importe, 0).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: VACACIONES */}
        <TabsContent value="vacaciones" className="space-y-6">
          {/* Saldo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Pendientes</p>
                  <p className="text-4xl text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {vacacionesSaldo.pendientes}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">días</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Usadas</p>
                  <p className="text-4xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {vacacionesSaldo.usadas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">días</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Totales</p>
                  <p className="text-4xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {vacacionesSaldo.totales}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">días</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendario */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Seleccionar Rango de Vacaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
                locale={es}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Solicitudes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Mis Solicitudes
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setVacacionesModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Solicitar Vacaciones
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {solicitudesVacaciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No tienes solicitudes activas</p>
                  <p className="text-sm mt-1">Solicita tus próximas vacaciones usando el calendario</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rango</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitudesVacaciones.map((solicitud) => (
                      <TableRow key={solicitud.id}>
                        <TableCell>{solicitud.rango}</TableCell>
                        <TableCell>{solicitud.dias}</TableCell>
                        <TableCell>{solicitud.motivo}</TableCell>
                        <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Solicitar Cambio de Turno */}
      <Dialog open={cambioTurnoModalOpen} onOpenChange={setCambioTurnoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Solicitar Cambio de Turno
            </DialogTitle>
            <DialogDescription>
              Completa los datos para solicitar un cambio en tu turno
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fecha-cambio">Fecha del turno a cambiar</Label>
              <Input id="fecha-cambio" type="date" className="min-h-[44px]" />
            </div>
            <div>
              <Label htmlFor="motivo-cambio">Motivo del cambio</Label>
              <Textarea
                id="motivo-cambio"
                placeholder="Describe el motivo del cambio de turno..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCambioTurnoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => {
                setCambioTurnoModalOpen(false);
                toast.success('Solicitud enviada correctamente');
              }}
            >
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Solicitar Horas Extra */}
      <Dialog open={horasExtraModalOpen} onOpenChange={setHorasExtraModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Solicitar Horas Extra
            </DialogTitle>
            <DialogDescription>
              Indica la fecha, rango horario y motivo de las horas extra
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fecha-extra">Fecha</Label>
              <Input
                id="fecha-extra"
                type="date"
                className="min-h-[44px]"
                value={horasExtraForm.fecha}
                onChange={(e) => setHorasExtraForm((p) => ({ ...p, fecha: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hora-inicio">Hora inicio</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  className="min-h-[44px]"
                  value={horasExtraForm.horaInicio}
                  onChange={(e) => setHorasExtraForm((p) => ({ ...p, horaInicio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="hora-fin">Hora fin</Label>
                <Input
                  id="hora-fin"
                  type="time"
                  className="min-h-[44px]"
                  value={horasExtraForm.horaFin}
                  onChange={(e) => setHorasExtraForm((p) => ({ ...p, horaFin: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="motivo-extra">Motivo</Label>
              <Textarea
                id="motivo-extra"
                placeholder="Describe el motivo de las horas extra..."
                className="min-h-[80px]"
                value={horasExtraForm.motivo}
                onChange={(e) => setHorasExtraForm((p) => ({ ...p, motivo: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHorasExtraModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={async () => {
                try {
                  const { fecha, horaInicio, horaFin, motivo } = horasExtraForm;
                  await trabajadorRrhhApi.createHorasExtra({ fecha, horaInicio, horaFin, motivo });
                  toast.success('Solicitud de horas extra enviada');
                  setHorasExtraForm({ fecha: '', horaInicio: '', horaFin: '', motivo: '' });
                  await refreshRrhh();
                } catch (e) {
                  console.error(e);
                  toast.error('No se pudo enviar la solicitud de horas extra');
                } finally {
                  setHorasExtraModalOpen(false);
                }
              }}
            >
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Solicitar Vacaciones */}
      <Dialog open={vacacionesModalOpen} onOpenChange={setVacacionesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Solicitar Vacaciones
            </DialogTitle>
            <DialogDescription>
              Selecciona el rango de fechas y describe el motivo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rango seleccionado</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {dateRange?.from && dateRange?.to ? (
                  <p>
                    {format(dateRange.from, 'dd/MM/yyyy', { locale: es })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: es })}
                  </p>
                ) : (
                  <p className="text-gray-500">Selecciona un rango en el calendario</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="motivo-vacaciones">Motivo</Label>
              <Textarea
                id="motivo-vacaciones"
                placeholder="Describe el motivo de las vacaciones..."
                className="min-h-[80px]"
                value={vacacionesMotivo}
                onChange={(e) => setVacacionesMotivo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVacacionesModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              disabled={!dateRange?.from || !dateRange?.to}
              onClick={async () => {
                if (!dateRange?.from || !dateRange?.to) return;
                try {
                  const desde = dateRange.from.toISOString().split('T')[0];
                  const hasta = dateRange.to.toISOString().split('T')[0];
                  await trabajadorRrhhApi.createVacaciones({ desde, hasta, motivo: vacacionesMotivo || 'Vacaciones' });
                  toast.success('Solicitud de vacaciones enviada');
                  setVacacionesMotivo('');
                  await refreshRrhh();
                } catch (e) {
                  console.error(e);
                  toast.error('No se pudo enviar la solicitud de vacaciones');
                } finally {
                  setVacacionesModalOpen(false);
                }
              }}
            >
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nuevo Gasto */}
      <Dialog open={gastoModalOpen} onOpenChange={setGastoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Solicitar Reembolso de Gasto
            </DialogTitle>
            <DialogDescription>
              Completa la información del gasto realizado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="concepto-gasto">Concepto del gasto</Label>
              <Input 
                id="concepto-gasto" 
                placeholder="Ej: Productos de limpieza, Gasolina moto..." 
                className="min-h-[44px]" 
                value={gastoForm.concepto}
                onChange={(e) => setGastoForm((p) => ({ ...p, concepto: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="categoria-gasto">Categoría</Label>
              <select 
                id="categoria-gasto"
                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3"
                value={gastoForm.categoria}
                onChange={(e) => setGastoForm((p) => ({ ...p, categoria: e.target.value }))}
              >
                <option value="">Selecciona una categoría</option>
                <option value="limpieza">Limpieza</option>
                <option value="transporte">Transporte</option>
                <option value="material">Material</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="importe-gasto">Importe (€)</Label>
                <Input 
                  id="importe-gasto" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="min-h-[44px]" 
                  value={gastoForm.importe}
                  onChange={(e) => setGastoForm((p) => ({ ...p, importe: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="fecha-gasto">Fecha</Label>
                <Input 
                  id="fecha-gasto" 
                  type="date" 
                  className="min-h-[44px]" 
                  value={gastoForm.fecha}
                  onChange={(e) => setGastoForm((p) => ({ ...p, fecha: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="justificante">Justificante (Factura/Ticket)</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input 
                  id="justificante" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="min-h-[44px]" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Formatos: PDF, JPG, PNG (máx. 5MB)</p>
            </div>
            <div>
              <Label htmlFor="notas-gasto">Notas adicionales (opcional)</Label>
              <Textarea
                id="notas-gasto"
                placeholder="Añade detalles sobre el gasto..."
                className="min-h-[60px]"
                value={gastoForm.notas}
                onChange={(e) => setGastoForm((p) => ({ ...p, notas: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGastoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={async () => {
                try {
                  await trabajadorRrhhApi.createGasto({
                    concepto: gastoForm.concepto,
                    categoria: gastoForm.categoria,
                    importe: Number(gastoForm.importe),
                    fechaGasto: gastoForm.fecha || undefined,
                    notas: gastoForm.notas || undefined,
                  });
                  toast.success('Solicitud de reembolso enviada correctamente');
                  setGastoForm({ concepto: '', categoria: '', importe: '', fecha: '', notas: '' });
                  await refreshRrhh();
                } catch (e) {
                  console.error(e);
                  toast.error('No se pudo enviar el gasto');
                } finally {
                  setGastoModalOpen(false);
                }
              }}
            >
              Solicitar Reembolso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Consumo Interno */}
      <Dialog open={consumoInternoModalOpen} onOpenChange={setConsumoInternoModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Registrar Consumo Interno
            </DialogTitle>
            <DialogDescription>
              Registra un producto consumido de la panadería
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="producto-consumo">Producto consumido</Label>
              <Input 
                id="producto-consumo" 
                placeholder="Ej: Bocadillo, Café, Agua..." 
                className="min-h-[44px]" 
                value={consumoForm.producto}
                onChange={(e) => setConsumoForm((p) => ({ ...p, producto: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="categoria-consumo">Categoría</Label>
              <select 
                id="categoria-consumo"
                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3"
                value={consumoForm.categoria}
                onChange={(e) => setConsumoForm((p) => ({ ...p, categoria: e.target.value }))}
              >
                <option value="">Selecciona una categoría</option>
                <option value="comida">Comida</option>
                <option value="bebida">Bebida</option>
                <option value="uniforme">Uniforme</option>
                <option value="herramientas">Herramientas</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cantidad-consumo">Cantidad</Label>
                <Input 
                  id="cantidad-consumo" 
                  type="number" 
                  step="1" 
                  placeholder="1" 
                  className="min-h-[44px]" 
                  value={consumoForm.cantidad}
                  onChange={(e) => setConsumoForm((p) => ({ ...p, cantidad: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="fecha-consumo">Fecha</Label>
                <Input 
                  id="fecha-consumo" 
                  type="date" 
                  className="min-h-[44px]" 
                  value={consumoForm.fecha}
                  onChange={(e) => setConsumoForm((p) => ({ ...p, fecha: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notas-consumo">Notas adicionales (opcional)</Label>
              <Textarea
                id="notas-consumo"
                placeholder="Añade detalles sobre el consumo..."
                className="min-h-[60px]"
                value={consumoForm.notas}
                onChange={(e) => setConsumoForm((p) => ({ ...p, notas: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumoInternoModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={async () => {
                try {
                  await trabajadorRrhhApi.createConsumo({
                    producto: consumoForm.producto,
                    categoria: consumoForm.categoria,
                    cantidad: Number(consumoForm.cantidad || 1),
                    fecha: consumoForm.fecha || undefined,
                    notas: consumoForm.notas || undefined,
                  });
                  toast.success('Consumo interno registrado correctamente');
                  setConsumoForm({ producto: '', categoria: '', cantidad: '1', fecha: '', notas: '' });
                  await refreshRrhh();
                } catch (e) {
                  console.error(e);
                  toast.error('No se pudo registrar el consumo interno');
                } finally {
                  setConsumoInternoModalOpen(false);
                }
              }}
            >
              Registrar Consumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}