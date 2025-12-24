import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Tag, 
  Clock,
  Sparkles,
  Gift,
  AlertCircle,
  Calendar,
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { toast } from 'sonner';
import {
  notificacionesCliente,
  obtenerNotificacionesNoLeidas,
  marcarComoLeida,
  contarNoLeidas,
  type NotificacionCliente as NotifCliente,
  type TipoNotificacion
} from '../data/notificaciones-promociones';

interface NotificacionesPromocionesClienteProps {
  onVerPromocion?: (promocionId: string) => void;
}

export default function NotificacionesPromocionesCliente({ onVerPromocion }: NotificacionesPromocionesClienteProps) {
  const [notificaciones, setNotificaciones] = useState<NotifCliente[]>(notificacionesCliente);
  const [open, setOpen] = useState(false);
  
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const handleMarcarLeida = (notifId: string) => {
    setNotificaciones(prev => 
      prev.map(n => n.id === notifId ? { ...n, leida: true } : n)
    );
    marcarComoLeida(notifId);
  };

  const handleVerPromocion = (notif: NotifCliente) => {
    handleMarcarLeida(notif.id);
    if (notif.promocionId && onVerPromocion) {
      onVerPromocion(notif.promocionId);
      setOpen(false);
      toast.success('Abriendo promoción...');
    }
  };

  const handleMarcarTodasLeidas = () => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const getTipoIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'nueva_promocion':
        return <Gift className="w-5 h-5 text-green-600" />;
      case 'vencimiento_proximo':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'activacion_horario':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'recordatorio':
        return <Bell className="w-5 h-5 text-purple-600" />;
      default:
        return <Tag className="w-5 h-5 text-teal-600" />;
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-gray-100"
        >
          <Bell className="w-5 h-5" />
          {noLeidas > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
            >
              {noLeidas}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            Notificaciones de Promociones
          </SheetTitle>
          <SheetDescription>
            Mantente al día con las últimas promociones
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Acciones rápidas */}
          {noLeidas > 0 && (
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">
                {noLeidas} {noLeidas === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleMarcarTodasLeidas}
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas leídas
              </Button>
            </div>
          )}

          {/* Lista de notificaciones */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {notificaciones.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No tienes notificaciones</p>
                  <p className="text-sm mt-1">Te avisaremos cuando haya novedades</p>
                </div>
              ) : (
                notificaciones.map((notif) => (
                  <Card 
                    key={notif.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notif.leida ? 'bg-teal-50 border-teal-200' : 'bg-white'
                    }`}
                    onClick={() => handleVerPromocion(notif)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Icono tipo */}
                        <div className="flex-shrink-0 mt-1">
                          {getTipoIcon(notif.tipo)}
                        </div>

                        {/* Imagen y contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`text-sm font-medium ${!notif.leida ? 'text-teal-900' : 'text-gray-900'}`}>
                              {notif.titulo}
                            </h4>
                            {!notif.leida && (
                              <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notif.mensaje}
                          </p>

                          {/* Imagen de la promoción */}
                          {notif.imagen && (
                            <div className="mb-2">
                              <img 
                                src={notif.imagen} 
                                alt={notif.titulo}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatearFecha(notif.fecha)}
                            </span>
                            {notif.promocionId && (
                              <span className="text-xs text-teal-600 flex items-center gap-1 font-medium">
                                Ver promoción
                                <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Componente Badge para notificaciones en el header (alternativa compacta)
export function NotificacionesPromocionBadge() {
  const noLeidas = contarNoLeidas();

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-gray-600" />
      {noLeidas > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {noLeidas > 9 ? '9+' : noLeidas}
        </div>
      )}
    </div>
  );
}

// Componente de Notificación Toast (para mostrar en tiempo real)
interface NotificacionToastProps {
  notificacion: NotifCliente;
  onVerPromocion: (promocionId: string) => void;
}

export function NotificacionPromocionToast({ notificacion, onVerPromocion }: NotificacionToastProps) {
  return (
    <div className="flex gap-3 p-4 bg-white rounded-lg shadow-lg border-l-4 border-teal-600 max-w-md">
      {notificacion.imagen && (
        <img 
          src={notificacion.imagen} 
          alt={notificacion.titulo}
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
      )}
      <div className="flex-1">
        <div className="flex items-start gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <h4 className="font-medium text-sm">{notificacion.titulo}</h4>
        </div>
        <p className="text-xs text-gray-600 mb-2">{notificacion.mensaje}</p>
        {notificacion.promocionId && (
          <Button 
            size="sm" 
            className="h-7 text-xs bg-teal-600 hover:bg-teal-700"
            onClick={() => onVerPromocion(notificacion.promocionId!)}
          >
            Ver ahora
          </Button>
        )}
      </div>
    </div>
  );
}
