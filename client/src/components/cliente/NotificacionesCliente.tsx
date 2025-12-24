import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EmptyState } from '../ui/empty-state';
import { 
  Bell,
  Package,
  CalendarDays,
  Tag,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Check,
  BellOff,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { notificacionesApi, NotificacionBackend } from '../../services/api/notificaciones.api';

interface Notificacion {
  id: string;
  tipo: 'pedido' | 'cita' | 'promocion' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
}

interface HistorialAccion {
  id: string;
  tipo: 'pedido' | 'cita' | 'pago' | 'vehiculo';
  accion: string;
  detalles: string;
  fecha: Date;
}

interface NotificacionesClienteProps {
  clienteId?: string | number;
}

export function NotificacionesCliente({ clienteId }: NotificacionesClienteProps) {
  const [activeTab, setActiveTab] = useState('alertas');
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  // Función para detectar el tipo de notificación basado en el mensaje
  const detectarTipo = (mensaje: string): 'pedido' | 'cita' | 'promocion' | 'sistema' => {
    const mensajeLower = mensaje.toLowerCase();
    if (mensajeLower.includes('pedido') || mensajeLower.includes('entrega') || mensajeLower.includes('camino')) {
      return 'pedido';
    }
    if (mensajeLower.includes('cita') || mensajeLower.includes('confirmada') || mensajeLower.includes('reserva')) {
      return 'cita';
    }
    if (mensajeLower.includes('cupón') || mensajeLower.includes('descuento') || mensajeLower.includes('oferta') || mensajeLower.includes('promoción')) {
      return 'promocion';
    }
    return 'sistema';
  };

  // Función para generar título basado en el tipo
  const generarTitulo = (tipo: string, mensaje: string): string => {
    const titulos: Record<string, string> = {
      pedido: 'Actualización de pedido',
      cita: 'Información de cita',
      promocion: 'Promoción disponible',
      sistema: 'Notificación del sistema'
    };
    // Si el mensaje es corto, usarlo como título
    if (mensaje.length < 50) {
      return mensaje.split('.')[0];
    }
    return titulos[tipo] || 'Notificación';
  };

  // Transformar notificación del backend al formato del frontend
  const transformarNotificacion = (n: NotificacionBackend): Notificacion => {
    const tipo = detectarTipo(n.mensaje);
    return {
      id: String(n.id),
      tipo,
      titulo: generarTitulo(tipo, n.mensaje),
      mensaje: n.mensaje,
      fecha: new Date(), // El backend no tiene fecha, usamos la actual
      leida: n.leida,
    };
  };

  // Cargar notificaciones del backend
  const cargarNotificaciones = async () => {
    if (!clienteId) {
      setCargando(false);
      return;
    }
    
    try {
      const data = await notificacionesApi.getByClienteId(Number(clienteId));
      const notificacionesTransformadas = data.map(transformarNotificacion);
      setNotificaciones(notificacionesTransformadas);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setCargando(false);
    }
  };

  // Actualizar notificaciones
  const handleActualizar = async () => {
    setActualizando(true);
    await cargarNotificaciones();
    setActualizando(false);
    toast.success('Notificaciones actualizadas');
  };

  useEffect(() => {
    cargarNotificaciones();
  }, [clienteId]);

  const historial: HistorialAccion[] = [
    {
      id: '1',
      tipo: 'pedido',
      accion: 'Pedido creado',
      detalles: 'Pedido #1234 - 10 Barras Pan + Croissants - 28,50 €',
      fecha: new Date(2025, 10, 10, 15, 45),
    },
    {
      id: '2',
      tipo: 'pedido',
      accion: 'Pedido completado',
      detalles: 'Pedido #1233 - Bollería variada - 32,90 €',
      fecha: new Date(2025, 10, 8, 11, 20),
    },
    {
      id: '3',
      tipo: 'pago',
      accion: 'Pago completado',
      detalles: 'Pedido #1232 - 45,50 € (Tarjeta VISA)',
      fecha: new Date(2025, 10, 5, 9, 15),
    },
    {
      id: '4',
      tipo: 'pedido',
      accion: 'Pedido creado',
      detalles: 'Pedido #1231 - Pan Artesanal + Ensaimadas - 38,90 €',
      fecha: new Date(2025, 10, 1, 14, 30),
    },
    {
      id: '5',
      tipo: 'pedido',
      accion: 'Pedido completado',
      detalles: 'Pedido #1230 - Menú Desayuno - 15,90 € - 25 Oct 2025',
      fecha: new Date(2025, 9, 25, 17, 0),
    },
  ];

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const marcarComoLeida = async (id: string) => {
    const result = await notificacionesApi.marcarLeida(Number(id));
    if (result) {
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
      toast.success('Notificación marcada como leída');
    } else {
      toast.error('Error al marcar como leída');
    }
  };

  const marcarTodasComoLeidas = async () => {
    if (!clienteId) return;
    const result = await notificacionesApi.marcarTodasLeidas(Number(clienteId));
    if (result) {
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      toast.success('Todas las notificaciones marcadas como leídas');
    } else {
      toast.error('Error al marcar todas como leídas');
    }
  };

  const eliminarNotificacion = async (id: string) => {
    const result = await notificacionesApi.delete(Number(id));
    if (result) {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      toast.success('Notificación eliminada');
    } else {
      toast.error('Error al eliminar notificación');
    }
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, { icon: any; color: string }> = {
      pedido: { icon: Package, color: 'text-blue-600' },
      cita: { icon: CalendarDays, color: 'text-teal-600' },
      promocion: { icon: Tag, color: 'text-green-600' },
      sistema: { icon: Bell, color: 'text-gray-600' },
      pago: { icon: CheckCircle2, color: 'text-green-600' },
      vehiculo: { icon: Wrench, color: 'text-orange-600' },
    };
    return icons[tipo] || icons.sistema;
  };

  const getFechaRelativa = (fecha: Date) => {
    if (isToday(fecha)) {
      return 'Hoy';
    } else if (isYesterday(fecha)) {
      return 'Ayer';
    } else {
      const diasDiferencia = differenceInDays(new Date(), fecha);
      return `${diasDiferencia} días atrás`;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="alertas" className="relative py-2 sm:py-2.5 text-sm sm:text-base">
            <span className="hidden sm:inline">Notificaciones</span>
            <span className="sm:hidden">Notif.</span>
            {noLeidas > 0 && (
              <Badge className="ml-1.5 sm:ml-2 bg-red-500 text-white h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 text-[10px] sm:text-xs">
                {noLeidas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historial" className="py-2 sm:py-2.5 text-sm sm:text-base">Actividad</TabsTrigger>
        </TabsList>

        {/* TAB: NOTIFICACIONES */}
        <TabsContent value="alertas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="hidden sm:inline">Notificaciones del Sistema</span>
                  <span className="sm:hidden">Notificaciones</span>
                </CardTitle>
                {noLeidas > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={marcarTodasComoLeidas}
                    className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Marcar todas como leídas</span>
                    <span className="sm:hidden">Marcar todas</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {notificaciones.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm sm:text-base">No tienes notificaciones</p>
                  <p className="text-xs sm:text-sm mt-1">
                    Aquí aparecerán las alertas del sistema
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {notificaciones.map((notif) => {
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
                          notif.leida 
                            ? 'bg-white border-gray-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                          notif.leida ? 'bg-gray-100' : 'bg-blue-100'
                        }`}>
                          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-sm sm:text-base font-medium ${!notif.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.titulo}
                            </p>
                            {!notif.leida && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            {notif.mensaje}
                          </p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {format(notif.fecha, "d 'de' MMMM, HH:mm", { locale: es })}
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {!notif.leida && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => marcarComoLeida(notif.id)}
                                  className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
                                >
                                  <Eye className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Marcar leída</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarNotificacion(notif.id)}
                                className="h-7 sm:h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 touch-target"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: HISTORIAL */}
        <TabsContent value="historial" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Registro de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {historial.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm sm:text-base">No hay actividad registrada</p>
                  <p className="text-xs sm:text-sm mt-1">
                    Aquí verás un log de todas tus acciones
                  </p>
                </div>
              ) : (
                <div className="space-y-0 sm:space-y-1">
                  {historial.map((item, index) => {
                    const tipoInfo = getTipoIcon(item.tipo);
                    const Icon = tipoInfo.icon;
                    const esUltimo = index === historial.length - 1;
                    
                    return (
                      <div key={item.id} className="flex items-start gap-2 sm:gap-4 py-2 sm:py-3 relative">
                        {/* Línea vertical */}
                        {!esUltimo && (
                          <div className="absolute left-[16px] sm:left-[20px] top-10 sm:top-12 bottom-0 w-0.5 bg-gray-200" />
                        )}
                        
                        {/* Icono */}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100 z-10 relative`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${tipoInfo.color}`} />
                        </div>
                        
                        {/* Contenido */}
                        <div className="flex-1 pt-0.5 sm:pt-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900">{item.accion}</p>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">{item.detalles}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {format(item.fecha, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}