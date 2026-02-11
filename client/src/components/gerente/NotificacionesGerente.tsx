import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Bell,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Package,
  Users,
  Euro,
  Clock,
  AlertTriangle,
  Info,
  DollarSign,
  ShoppingCart,
  UserX,
  MessageSquare,
  Trash2,
  Check,
  FileText,
  ArrowRightLeft,
  HelpCircle,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { notificacionesApi } from '../../services/api/notificaciones.api';
import { authApi } from '../../services/api/auth.api';

interface Notificacion {
  id: string;
  tipo: 'critica' | 'advertencia' | 'info' | 'exito';
  categoria: 'stock' | 'personal' | 'finanzas' | 'operativa' | 'cliente' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accionable: boolean;
  accionLabel?: string;
  icono?: React.ReactNode;
}

export function NotificacionesGerente() {
  const [vistaActual, setVistaActual] = useState<'todas' | 'noLeidas'>('noLeidas');
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const currentUser = useMemo(() => authApi.getCurrentUser(), []);

  useEffect(() => {
    const clienteId = (currentUser as any)?.id ? Number((currentUser as any).id) : null;
    if (!clienteId) {
      setNotificaciones([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    notificacionesApi
      .getByClienteId(clienteId)
      .then((data) => {
        const now = new Date().toISOString();
        setNotificaciones(
          (Array.isArray(data) ? data : []).map((n) => ({
            id: String(n.id),
            tipo: 'info',
            categoria: 'sistema',
            titulo: 'Notificación',
            mensaje: n.mensaje,
            fecha: now,
            leida: !!n.leida,
            accionable: false,
            icono: <Info className="w-5 h-5" />,
          }))
        );
      })
      .catch(() => setNotificaciones([]))
      .finally(() => setCargando(false));
  }, [currentUser]);

  const notificacionesFiltradas = notificaciones.filter(n => {
    switch (vistaActual) {
      case 'noLeidas':
        return !n.leida;
      default:
        return true;
    }
  });

  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const criticas = notificaciones.filter(n => n.tipo === 'critica').length;

  const handleMarcarLeida = async (id: string) => {
    const ok = await notificacionesApi.marcarLeida(Number(id));
    if (ok) {
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
      toast.success('Notificación marcada como leída');
    } else {
      toast.error('No se pudo marcar la notificación');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    const clienteId = (currentUser as any)?.id ? Number((currentUser as any).id) : null;
    if (!clienteId) return;
    const ok = await notificacionesApi.marcarTodasLeidas(clienteId);
    if (ok) {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      toast.success('Todas las notificaciones marcadas como leídas');
    } else {
      toast.error('No se pudieron marcar todas');
    }
  };

  const handleEliminar = async (id: string) => {
    const ok = await notificacionesApi.delete(Number(id));
    if (ok) {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notificación eliminada');
    } else {
      toast.error('No se pudo eliminar la notificación');
    }
  };

  const handleAccion = (notif: Notificacion) => {
    toast.info(`Ejecutando acción: ${notif.accionLabel}`);
    console.log('[NOTIFICACIÓN] Acción ejecutada:', {
      id: notif.id,
      tipo: notif.tipo,
      categoria: notif.categoria,
      accion: notif.accionLabel
    });
    handleMarcarLeida(notif.id);
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Crítica</Badge>;
      case 'advertencia':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Advertencia</Badge>;
      case 'info':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Info</Badge>;
      case 'exito':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Éxito</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const getCategoriaBadge = (categoria: string) => {
    switch (categoria) {
      case 'stock':
        return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">Stock</Badge>;
      case 'personal':
        return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Personal</Badge>;
      case 'finanzas':
        return <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Finanzas</Badge>;
      case 'operativa':
        return <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">Operativa</Badge>;
      case 'cliente':
        return <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">Cliente</Badge>;
      case 'sistema':
        return <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">Sistema</Badge>;
      default:
        return null;
    }
  };

  const getIconoBgColor = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return 'bg-red-100 text-red-600';
      case 'advertencia':
        return 'bg-orange-100 text-orange-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'exito':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Notificaciones
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Centro de alertas y eventos importantes del sistema
          </p>
        </div>
        <Button 
          onClick={handleMarcarTodasLeidas} 
          variant="outline" 
          disabled={noLeidas === 0}
          className="w-full sm:w-auto h-9 sm:h-10 text-sm"
        >
          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Marcar todas como leídas</span>
          <span className="sm:hidden">Marcar todas</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as any)}>
        <TabsList className="h-auto">
          <TabsTrigger value="noLeidas" className="py-2 sm:py-2.5 text-sm sm:text-base">
            No leídas
            {noLeidas > 0 && (
              <Badge variant="outline" className="ml-1.5 sm:ml-2 bg-orange-100 text-orange-700 border-orange-200 text-[10px] sm:text-xs">
                {noLeidas}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="todas" className="py-2 sm:py-2.5 text-sm sm:text-base">
            Todas ({notificaciones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={vistaActual} className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {cargando ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Cargando notificaciones...</h3>
                <p className="text-xs sm:text-sm text-gray-500">Sincronizando con el servidor</p>
              </CardContent>
            </Card>
          ) : notificacionesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {vistaActual === 'noLeidas' && 'Todas tus notificaciones están leídas'}
                  {vistaActual === 'criticas' && 'No hay notificaciones críticas'}
                  {vistaActual === 'todas' && 'No tienes ninguna notificación'}
                </p>
              </CardContent>
            </Card>
          ) : (
            notificacionesFiltradas.map((notif) => (
              <Card key={notif.id} className={`transition-all ${!notif.leida ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-4">
                    {/* Icono */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ${getIconoBgColor(notif.tipo)}`}>
                      {notif.icono || <Bell className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900">
                              {notif.titulo}
                            </h3>
                            {!notif.leida && (
                              <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            {getTipoBadge(notif.tipo)}
                            {getCategoriaBadge(notif.categoria)}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          {!notif.leida && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarcarLeida(notif.id)}
                              className="h-7 sm:h-8 px-1.5 sm:px-2 touch-target"
                              title="Marcar como leída"
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEliminar(notif.id)}
                            className="h-7 sm:h-8 px-1.5 sm:px-2 text-red-600 hover:text-red-700 hover:bg-red-50 touch-target"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
                        {notif.mensaje}
                      </p>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.fecha).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {notif.accionable && notif.accionLabel && (
                          <Button
                            size="sm"
                            onClick={() => handleAccion(notif)}
                            className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
                          >
                            {notif.accionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}