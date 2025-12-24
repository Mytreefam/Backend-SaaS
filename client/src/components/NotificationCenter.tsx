/**
 * CENTRO DE NOTIFICACIONES - Udar Edge
 * Diseño simplificado y responsive
 */

import { useState, useMemo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Bell,
  Package,
  ShoppingCart,
  Tag,
  AlertTriangle,
  Mail,
  Settings,
  Check,
  CheckCheck,
  Archive,
  Trash2,
  Clock,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import type { Notification, NotificationType } from '../types/notifications.types';

interface NotificationCenterProps {
  usuarioId: string;
  empresaId?: string;
  onNavigate?: (url: string) => void;
}

export function NotificationCenter({ usuarioId, empresaId, onNavigate }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'todas' | 'sin_leer' | 'archivadas'>('todas');
  const [filtroTipo, setFiltroTipo] = useState<NotificationType | 'todas'>('todas');
  
  const {
    notificaciones,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    refresh,
    getUnreadCount,
  } = useNotifications({
    usuarioId,
    empresaId,
    autoLoad: true,
    pollInterval: 30000,
    realtime: false,
  });
  
  // ==================== FILTROS ====================
  
  const notificacionesFiltradas = useMemo(() => {
    let filtered = notificaciones;
    
    if (activeTab === 'sin_leer') {
      filtered = filtered.filter(n => n.status === 'sin_leer');
    } else if (activeTab === 'archivadas') {
      filtered = filtered.filter(n => n.status === 'archivada');
    }
    
    if (filtroTipo !== 'todas') {
      filtered = filtered.filter(n => n.tipo === filtroTipo);
    }
    
    return filtered;
  }, [notificaciones, activeTab, filtroTipo]);
  
  // ==================== HANDLERS ====================
  
  const handleNotificationClick = async (notificacion: Notification) => {
    if (notificacion.status === 'sin_leer') {
      await markAsRead([notificacion.id]);
    }
    
    if (notificacion.urlAccion && onNavigate) {
      onNavigate(notificacion.urlAccion);
    }
  };
  
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead([id]);
  };
  
  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await archiveNotification(id);
  };
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };
  
  // ==================== ICONOS POR TIPO ====================
  
  const getNotificationIcon = (tipo: NotificationType) => {
    const icons = {
      pedido: ShoppingCart,
      stock: Package,
      cita: Calendar,
      promocion: Tag,
      sistema: Settings,
      pago: Mail,
      alerta: AlertTriangle,
      mensaje: Mail,
    };
    
    return icons[tipo] || Bell;
  };
  
  const getNotificationColor = (notificacion: Notification) => {
    if (notificacion.prioridad === 'urgente') return 'border-l-4 border-l-red-500 bg-red-50';
    if (notificacion.prioridad === 'alta') return 'border-l-4 border-l-orange-500 bg-orange-50';
    if (notificacion.status === 'sin_leer') return 'border-l-4 border-l-blue-500 bg-blue-50';
    return 'border-l-4 border-l-gray-300 bg-white';
  };
  
  const getIconColor = (prioridad: string) => {
    if (prioridad === 'urgente') return 'text-red-600';
    if (prioridad === 'alta') return 'text-orange-600';
    return 'text-teal-600';
  };
  
  const getPriorityLabel = (prioridad: string) => {
    const labels = {
      urgente: '🔴 Urgente',
      alta: '🟠 Alta',
      normal: '🔵 Normal',
      baja: '⚪ Baja',
    };
    return labels[prioridad as keyof typeof labels] || labels.normal;
  };
  
  // ==================== RENDER ====================
  
  return (
    <div className="space-y-4 pb-4">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Notificaciones</h2>
          {stats && (
            <p className="text-gray-600 text-sm">
              {stats.sinLeer > 0 ? (
                <span className="text-red-600 font-medium">{stats.sinLeer} sin leer</span>
              ) : (
                'Todo al día'
              )} • {stats.total} total
            </p>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            Actualizar
          </Button>
          
          {getUnreadCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
      </div>
      
      {/* Filtros por tipo - Más compactos */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <Badge
          variant={filtroTipo === 'todas' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap text-xs"
          onClick={() => setFiltroTipo('todas')}
        >
          Todas
        </Badge>
        <Badge
          variant={filtroTipo === 'pedido' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap text-xs"
          onClick={() => setFiltroTipo('pedido')}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          Pedidos
        </Badge>
        <Badge
          variant={filtroTipo === 'stock' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap text-xs"
          onClick={() => setFiltroTipo('stock')}
        >
          <Package className="w-3 h-3 mr-1" />
          Stock
        </Badge>
        <Badge
          variant={filtroTipo === 'alerta' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap text-xs"
          onClick={() => setFiltroTipo('alerta')}
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Alertas
        </Badge>
        <Badge
          variant={filtroTipo === 'promocion' ? 'default' : 'outline'}
          className="cursor-pointer whitespace-nowrap text-xs"
          onClick={() => setFiltroTipo('promocion')}
        >
          <Tag className="w-3 h-3 mr-1" />
          Promociones
        </Badge>
      </div>
      
      {/* Tabs simplificados */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todas" className="text-xs sm:text-sm">
            Todas
            {stats && <Badge className="ml-1 sm:ml-2 text-[10px]" variant="secondary">{stats.total}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="sin_leer" className="text-xs sm:text-sm">
            Sin leer
            {stats && stats.sinLeer > 0 && (
              <Badge className="ml-1 sm:ml-2 bg-red-500 text-white text-[10px]">{stats.sinLeer}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archivadas" className="text-xs sm:text-sm">
            Archivo
            {stats && <Badge className="ml-1 sm:ml-2 text-[10px]" variant="secondary">{stats.archivadas}</Badge>}
          </TabsTrigger>
        </TabsList>
        
        {/* Lista de notificaciones */}
        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Cargando...
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-350px)] sm:h-[600px]">
              <div className="space-y-2 pr-4">
                {notificacionesFiltradas.map((notificacion) => {
                  const Icon = getNotificationIcon(notificacion.tipo);
                  
                  return (
                    <div
                      key={notificacion.id}
                      className={`cursor-pointer transition-all hover:shadow-md rounded-lg p-3 sm:p-4 ${getNotificationColor(notificacion)}`}
                      onClick={() => handleNotificationClick(notificacion)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <div className="flex-shrink-0">
                          <Icon className={`w-5 h-5 ${getIconColor(notificacion.prioridad)}`} />
                        </div>
                        
                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          {/* Título */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 leading-tight">
                              {notificacion.titulo}
                            </h4>
                            {notificacion.status === 'sin_leer' && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          {/* Mensaje */}
                          <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                            {notificacion.mensaje}
                          </p>
                          
                          {/* Descripción adicional si existe */}
                          {notificacion.descripcion && (
                            <p className="text-xs text-gray-500 mb-2">
                              {notificacion.descripcion}
                            </p>
                          )}
                          
                          {/* Footer con metadata */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(notificacion.fecha, 'dd/MM/yy HH:mm', { locale: es })}
                            </span>
                            
                            <span className="text-gray-400">•</span>
                            
                            <span className="text-gray-600">
                              {getPriorityLabel(notificacion.prioridad)}
                            </span>
                            
                            {notificacion.accionTexto && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-teal-600 flex items-center gap-1 font-medium">
                                  {notificacion.accionTexto}
                                  <ChevronRight className="w-3 h-3" />
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Acciones rápidas */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {notificacion.status === 'sin_leer' && (
                            <button
                              onClick={(e) => handleMarkAsRead(notificacion.id, e)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-teal-600"
                              title="Marcar como leída"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          {notificacion.status !== 'archivada' && (
                            <button
                              onClick={(e) => handleArchive(notificacion.id, e)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600"
                              title="Archivar"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => handleDelete(notificacion.id, e)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
                            title="Eliminar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
