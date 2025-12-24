/**
 * BADGE DE NOTIFICACIONES - Udar Edge
 * Diseño simplificado y responsive
 */

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Clock, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';

interface NotificationBadgeProps {
  usuarioId: string;
  empresaId?: string;
  onViewAll?: () => void;
  maxPreview?: number;
}

export function NotificationBadge({
  usuarioId,
  empresaId,
  onViewAll,
  maxPreview = 5
}: NotificationBadgeProps) {
  const [open, setOpen] = useState(false);
  
  const {
    notificaciones,
    markAsRead,
    getUnreadCount,
    deleteNotification,
  } = useNotifications({
    usuarioId,
    empresaId,
    autoLoad: true,
    pollInterval: 30000,
  });
  
  const unreadCount = getUnreadCount();
  const recentNotifications = notificaciones
    .filter(n => n.status === 'sin_leer')
    .slice(0, maxPreview);
  
  const handleNotificationClick = async (id: string) => {
    await markAsRead([id]);
    setOpen(false);
    
    if (onViewAll) {
      onViewAll();
    }
  };
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };
  
  const handleViewAll = () => {
    setOpen(false);
    if (onViewAll) {
      onViewAll();
    }
  };
  
  const getPriorityColor = (prioridad: string) => {
    if (prioridad === 'urgente') return 'bg-red-500';
    if (prioridad === 'alta') return 'bg-orange-500';
    return 'bg-teal-500';
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          title="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 bg-red-500 text-white border-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[90vw] sm:w-96 p-0" align="end" sideOffset={5}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Contenido */}
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Todo al día</p>
            <p className="text-xs text-gray-400 mt-1">No hay notificaciones nuevas</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[60vh] sm:max-h-[400px]">
              <div className="divide-y">
                {recentNotifications.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                    onClick={() => handleNotificationClick(notificacion.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Indicador de prioridad */}
                      <div className={`w-1 h-full ${getPriorityColor(notificacion.prioridad)} rounded-full flex-shrink-0`} />
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {notificacion.titulo}
                          </p>
                          <button
                            onClick={(e) => handleDelete(notificacion.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                            title="Eliminar"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {notificacion.mensaje}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{format(notificacion.fecha, 'dd/MM HH:mm', { locale: es })}</span>
                          
                          {notificacion.prioridad === 'urgente' && (
                            <>
                              <span>•</span>
                              <span className="text-red-600 font-medium">Urgente</span>
                            </>
                          )}
                          {notificacion.prioridad === 'alta' && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 font-medium">Alta</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Punto sin leer */}
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Footer */}
            {onViewAll && (
              <div className="p-2 border-t bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  onClick={handleViewAll}
                >
                  Ver todas las notificaciones ({notificaciones.length})
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
