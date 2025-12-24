import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bell,
  Package,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';

interface Notificacion {
  id: string;
  tipo: 'pedido' | 'tarea' | 'inventario' | 'turno' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
}

interface Alerta {
  id: string;
  tipo: 'critica' | 'importante' | 'informativa';
  categoria: 'stock' | 'pedido' | 'turno' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: Date;
  resuelta: boolean;
}

export function NotificacionesTrabajador() {
  const [activeTab, setActiveTab] = useState('notificaciones');
  
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: '1',
      tipo: 'pedido',
      titulo: 'Nuevo pedido recibido #P-1245',
      mensaje: 'Cliente Juan García - Pedido para recoger a las 18:00h. Total: 45,80 €',
      fecha: new Date(2025, 10, 18, 10, 30),
      leida: false,
    },
    {
      id: '2',
      tipo: 'tarea',
      titulo: 'Nueva tarea asignada',
      mensaje: 'Reponer croissants en el expositor principal - Prioridad: Alta',
      fecha: new Date(2025, 10, 18, 9, 15),
      leida: false,
    },
    {
      id: '3',
      tipo: 'inventario',
      titulo: 'Stock bajo: Harina integral',
      mensaje: 'Quedan solo 5 kg de harina integral. Revisa el stock.',
      fecha: new Date(2025, 10, 18, 8, 45),
      leida: false,
    },
    {
      id: '4',
      tipo: 'turno',
      titulo: 'Recordatorio de turno',
      mensaje: 'Tu turno comienza en 30 minutos (11:00 - 19:00)',
      fecha: new Date(2025, 10, 17, 10, 30),
      leida: true,
    },
    {
      id: '5',
      tipo: 'sistema',
      titulo: 'Actualización completada',
      mensaje: 'El sistema TPV se ha actualizado correctamente a la versión 2.3.1',
      fecha: new Date(2025, 10, 16, 20, 0),
      leida: true,
    },
  ]);

  const [alertas, setAlertas] = useState<Alerta[]>([
    {
      id: '1',
      tipo: 'critica',
      categoria: 'stock',
      titulo: 'Stock crítico: Pan de molde',
      mensaje: 'Solo quedan 3 unidades en stock. Se recomienda hornear nuevo lote urgentemente.',
      fecha: new Date(2025, 10, 18, 11, 0),
      resuelta: false,
    },
    {
      id: '2',
      tipo: 'importante',
      categoria: 'pedido',
      titulo: 'Pedido retrasado #P-1238',
      mensaje: 'El pedido debía estar listo hace 15 minutos. Cliente esperando.',
      fecha: new Date(2025, 10, 18, 10, 45),
      resuelta: false,
    },
    {
      id: '3',
      tipo: 'critica',
      categoria: 'turno',
      titulo: 'Falta cobertura en turno de tarde',
      mensaje: 'No hay suficiente personal para el turno de 14:00-18:00. Se necesita confirmar disponibilidad.',
      fecha: new Date(2025, 10, 18, 9, 30),
      resuelta: false,
    },
    {
      id: '4',
      tipo: 'informativa',
      categoria: 'sistema',
      titulo: 'Mantenimiento programado',
      mensaje: 'El sistema estará en mantenimiento mañana de 02:00 a 04:00.',
      fecha: new Date(2025, 10, 17, 15, 0),
      resuelta: true,
    },
    {
      id: '5',
      tipo: 'importante',
      categoria: 'stock',
      titulo: 'Revisión de caducidades',
      mensaje: 'Hay 8 productos que caducan en las próximas 48 horas.',
      fecha: new Date(2025, 10, 17, 8, 0),
      resuelta: true,
    },
  ]);

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;
  const alertasNoResueltas = alertas.filter(a => !a.resuelta).length;

  const marcarComoLeida = (id: string) => {
    setNotificaciones(prev => 
      prev.map(n => n.id === id ? { ...n, leida: true } : n)
    );
    toast.success('Notificación marcada como leída');
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
    toast.success('Notificación eliminada');
  };

  const marcarAlertaResuelta = (id: string) => {
    setAlertas(prev => 
      prev.map(a => a.id === id ? { ...a, resuelta: true } : a)
    );
    toast.success('Alerta marcada como resuelta');
  };

  const eliminarAlerta = (id: string) => {
    setAlertas(prev => prev.filter(a => a.id !== id));
    toast.success('Alerta eliminada');
  };

  const getTipoNotificacionIcon = (tipo: string) => {
    const icons: Record<string, { icon: any; color: string }> = {
      pedido: { icon: Package, color: 'text-blue-600' },
      tarea: { icon: ClipboardList, color: 'text-purple-600' },
      inventario: { icon: Package, color: 'text-orange-600' },
      turno: { icon: Clock, color: 'text-teal-600' },
      sistema: { icon: Bell, color: 'text-gray-600' },
    };
    return icons[tipo] || icons.sistema;
  };

  const getAlertaTipoConfig = (tipo: string) => {
    const configs: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
      critica: { 
        bgColor: 'bg-red-50', 
        textColor: 'text-red-900', 
        borderColor: 'border-red-200' 
      },
      importante: { 
        bgColor: 'bg-orange-50', 
        textColor: 'text-orange-900', 
        borderColor: 'border-orange-200' 
      },
      informativa: { 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-900', 
        borderColor: 'border-blue-200' 
      },
    };
    return configs[tipo] || configs.informativa;
  };

  const getAlertaCategoriaIcon = (categoria: string) => {
    const icons: Record<string, any> = {
      stock: Package,
      pedido: ClipboardList,
      turno: Clock,
      sistema: Bell,
    };
    return icons[categoria] || Bell;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <span className="hidden sm:inline">Centro de Notificaciones</span>
          <span className="sm:hidden">Notificaciones</span>
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm">
          Mantente al día con notificaciones y alertas importantes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="notificaciones" className="relative py-2 sm:py-2.5 text-sm sm:text-base">
            <span className="hidden sm:inline">Notificaciones</span>
            <span className="sm:hidden">Notif.</span>
            {notificacionesNoLeidas > 0 && (
              <Badge className="ml-1.5 sm:ml-2 bg-blue-500 text-white h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 text-[10px] sm:text-xs">
                {notificacionesNoLeidas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alertas" className="relative py-2 sm:py-2.5 text-sm sm:text-base">
            Alertas
            {alertasNoResueltas > 0 && (
              <Badge className="ml-1.5 sm:ml-2 bg-red-500 text-white h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 text-[10px] sm:text-xs">
                {alertasNoResueltas}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB: NOTIFICACIONES */}
        <TabsContent value="notificaciones" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="hidden sm:inline">Notificaciones del Sistema</span>
                  <span className="sm:hidden">Notificaciones</span>
                </CardTitle>
                {notificacionesNoLeidas > 0 && (
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
                    Aquí aparecerán las notificaciones del sistema
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {notificaciones.map((notif) => {
                    const tipoInfo = getTipoNotificacionIcon(notif.tipo);
                    const Icon = tipoInfo.icon;
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
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${tipoInfo.color}`} />
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

        {/* TAB: ALERTAS */}
        <TabsContent value="alertas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Alertas del Sistema
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Alertas que requieren tu atención inmediata
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {alertas.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm sm:text-base">No hay alertas activas</p>
                  <p className="text-xs sm:text-sm mt-1">
                    Todas las alertas han sido resueltas
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {alertas.map((alerta) => {
                    const tipoConfig = getAlertaTipoConfig(alerta.tipo);
                    const Icon = getAlertaCategoriaIcon(alerta.categoria);
                    
                    return (
                      <div
                        key={alerta.id}
                        className={`flex items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
                          alerta.resuelta 
                            ? 'bg-white border-gray-200 opacity-60' 
                            : `${tipoConfig.bgColor} ${tipoConfig.borderColor}`
                        }`}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                          alerta.resuelta ? 'bg-gray-100' : 'bg-white'
                        }`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            alerta.resuelta ? 'text-gray-400' : 
                            alerta.tipo === 'critica' ? 'text-red-600' :
                            alerta.tipo === 'importante' ? 'text-orange-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <p className={`text-sm sm:text-base font-medium ${
                                alerta.resuelta ? 'text-gray-500' : tipoConfig.textColor
                              }`}>
                                {alerta.titulo}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] sm:text-xs ${
                                  alerta.resuelta ? 'border-gray-300 text-gray-500' :
                                  alerta.tipo === 'critica' ? 'border-red-300 text-red-700 bg-red-50' :
                                  alerta.tipo === 'importante' ? 'border-orange-300 text-orange-700 bg-orange-50' :
                                  'border-blue-300 text-blue-700 bg-blue-50'
                                }`}
                              >
                                {alerta.tipo === 'critica' ? 'CRÍTICA' : 
                                 alerta.tipo === 'importante' ? 'IMPORTANTE' : 'INFO'}
                              </Badge>
                            </div>
                            {alerta.resuelta && (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                            )}
                          </div>
                          <p className={`text-xs sm:text-sm mb-2 ${
                            alerta.resuelta ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {alerta.mensaje}
                          </p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <p className="text-[10px] sm:text-xs text-gray-500">
                              {format(alerta.fecha, "d 'de' MMMM, HH:mm", { locale: es })}
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {!alerta.resuelta && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => marcarAlertaResuelta(alerta.id)}
                                  className="h-7 sm:h-8 text-[10px] sm:text-xs border-green-300 text-green-700 hover:bg-green-50 px-2 sm:px-3"
                                >
                                  <CheckCircle2 className="w-3 h-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Resolver</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarAlerta(alerta.id)}
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
      </Tabs>
    </div>
  );
}
