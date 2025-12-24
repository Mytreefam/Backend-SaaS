/**
 * HOOK DE NOTIFICACIONES - Udar Edge
 * Hook personalizado para gestionar notificaciones
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notifications.service';
import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  GetNotificationsRequest,
  NotificationType,
  NotificationStatus,
  NotificationEvent
} from '../types/notifications.types';
import { toast } from 'sonner@2.0.3';

interface UseNotificationsOptions {
  usuarioId: string;
  empresaId?: string;
  autoLoad?: boolean;
  pollInterval?: number;  // Intervalo de polling en ms (0 = sin polling)
  realtime?: boolean;     // Usar eventos en tiempo real
}

interface UseNotificationsReturn {
  // Estado
  notificaciones: Notification[];
  preferencias: NotificationPreferences | null;
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  loadNotifications: (filters?: Partial<GetNotificationsRequest>) => Promise<void>;
  markAsRead: (notificacionIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (notificacionId: string) => Promise<void>;
  deleteNotification: (notificacionId: string) => Promise<void>;
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  loadStats: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Utilidades
  getUnreadCount: () => number;
  getNotificationsByType: (tipo: NotificationType) => Notification[];
  getUrgentNotifications: () => Notification[];
}

export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const {
    usuarioId,
    empresaId,
    autoLoad = true,
    pollInterval = 0,
    realtime = false
  } = options;
  
  // ==================== ESTADO ====================
  
  const [notificaciones, setNotificaciones] = useState<Notification[]>([]);
  const [preferencias, setPreferencias] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ==================== CARGAR NOTIFICACIONES ====================
  
  const loadNotifications = useCallback(async (filters?: Partial<GetNotificationsRequest>) => {
    if (!usuarioId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const request: GetNotificationsRequest = {
        usuarioId,
        empresaId,
        ordenarPor: 'fecha',
        ordenDir: 'desc',
        limit: 100,
        ...filters,
      };
      
      const response = await notificationsService.getNotifications(request);
      setNotificaciones(response.notificaciones);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar notificaciones';
      setError(errorMsg);
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [usuarioId, empresaId]);
  
  // ==================== MARCAR COMO LEÍDA ====================
  
  const markAsRead = useCallback(async (notificacionIds: string[]) => {
    if (!usuarioId) return;
    
    try {
      await notificationsService.markAsRead({
        notificacionIds,
        usuarioId,
      });
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n =>
          notificacionIds.includes(n.id)
            ? { ...n, status: 'leida' as NotificationStatus, leidaEn: new Date() }
            : n
        )
      );
      
      // Actualizar stats
      await loadStats();
    } catch (err) {
      console.error('Error marcando como leída:', err);
      toast.error('Error al marcar notificación como leída');
    }
  }, [usuarioId]);
  
  // ==================== MARCAR TODAS COMO LEÍDAS ====================
  
  const markAllAsRead = useCallback(async () => {
    if (!usuarioId) return;
    
    try {
      await notificationsService.markAllAsRead(usuarioId);
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, status: 'leida' as NotificationStatus, leidaEn: new Date() }))
      );
      
      // Actualizar stats
      await loadStats();
      
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (err) {
      console.error('Error marcando todas como leídas:', err);
      toast.error('Error al marcar todas como leídas');
    }
  }, [usuarioId]);
  
  // ==================== ARCHIVAR NOTIFICACIÓN ====================
  
  const archiveNotification = useCallback(async (notificacionId: string) => {
    if (!usuarioId) return;
    
    try {
      await notificationsService.archiveNotification(notificacionId, usuarioId);
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n =>
          n.id === notificacionId
            ? { ...n, status: 'archivada' as NotificationStatus, archivadaEn: new Date() }
            : n
        )
      );
      
      toast.success('Notificación archivada');
    } catch (err) {
      console.error('Error archivando notificación:', err);
      toast.error('Error al archivar notificación');
    }
  }, [usuarioId]);
  
  // ==================== ELIMINAR NOTIFICACIÓN ====================
  
  const deleteNotification = useCallback(async (notificacionId: string) => {
    if (!usuarioId) return;
    
    try {
      await notificationsService.deleteNotification(notificacionId, usuarioId);
      
      // Actualizar estado local
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      
      toast.success('Notificación eliminada');
    } catch (err) {
      console.error('Error eliminando notificación:', err);
      toast.error('Error al eliminar notificación');
    }
  }, [usuarioId]);
  
  // ==================== CARGAR PREFERENCIAS ====================
  
  const loadPreferences = useCallback(async () => {
    if (!usuarioId) return;
    
    try {
      const prefs = await notificationsService.getPreferences(usuarioId);
      setPreferencias(prefs);
    } catch (err) {
      console.error('Error cargando preferencias:', err);
    }
  }, [usuarioId]);
  
  // ==================== ACTUALIZAR PREFERENCIAS ====================
  
  const updatePreferences = useCallback(async (preferences: Partial<NotificationPreferences>) => {
    if (!usuarioId) return;
    
    try {
      const response = await notificationsService.updatePreferences({
        usuarioId,
        preferencias: preferences,
      });
      
      setPreferencias(response.preferencias);
      toast.success('Preferencias actualizadas correctamente');
    } catch (err) {
      console.error('Error actualizando preferencias:', err);
      toast.error('Error al actualizar preferencias');
    }
  }, [usuarioId]);
  
  // ==================== CARGAR ESTADÍSTICAS ====================
  
  const loadStats = useCallback(async () => {
    if (!usuarioId) return;
    
    try {
      const statistics = await notificationsService.getStats(usuarioId, empresaId);
      setStats(statistics);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  }, [usuarioId, empresaId]);
  
  // ==================== REFRESH ====================
  
  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadPreferences(),
      loadStats(),
    ]);
  }, [loadNotifications, loadPreferences, loadStats]);
  
  // ==================== UTILIDADES ====================
  
  const getUnreadCount = useCallback(() => {
    return notificaciones.filter(n => n.status === 'sin_leer').length;
  }, [notificaciones]);
  
  const getNotificationsByType = useCallback((tipo: NotificationType) => {
    return notificaciones.filter(n => n.tipo === tipo);
  }, [notificaciones]);
  
  const getUrgentNotifications = useCallback(() => {
    return notificaciones.filter(n => n.prioridad === 'urgente' && n.status === 'sin_leer');
  }, [notificaciones]);
  
  // ==================== EFECTOS ====================
  
  // Carga inicial
  useEffect(() => {
    if (autoLoad && usuarioId) {
      refresh();
    }
  }, [autoLoad, usuarioId, refresh]);
  
  // Polling
  useEffect(() => {
    if (pollInterval > 0 && usuarioId) {
      const interval = setInterval(() => {
        loadNotifications();
        loadStats();
      }, pollInterval);
      
      return () => clearInterval(interval);
    }
  }, [pollInterval, usuarioId, loadNotifications, loadStats]);
  
  // Eventos en tiempo real
  useEffect(() => {
    if (realtime && usuarioId) {
      const unsubscribe = notificationsService.subscribe((event: NotificationEvent) => {
        if (event.tipo === 'nueva') {
          setNotificaciones(prev => [event.notificacion, ...prev]);
          
          // Mostrar toast para nueva notificación
          if (event.notificacion.prioridad === 'urgente') {
            toast.error(event.notificacion.titulo, {
              description: event.notificacion.mensaje,
              duration: 5000,
            });
          } else {
            toast.info(event.notificacion.titulo, {
              description: event.notificacion.mensaje,
            });
          }
          
          // Actualizar stats
          loadStats();
        } else if (event.tipo === 'actualizada') {
          setNotificaciones(prev =>
            prev.map(n => (n.id === event.notificacion.id ? event.notificacion : n))
          );
        } else if (event.tipo === 'eliminada') {
          setNotificaciones(prev => prev.filter(n => n.id !== event.notificacion.id));
        }
      });
      
      return unsubscribe;
    }
  }, [realtime, usuarioId, loadStats]);
  
  // ==================== RETURN ====================
  
  return {
    // Estado
    notificaciones,
    preferencias,
    stats,
    loading,
    error,
    
    // Acciones
    loadNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    loadPreferences,
    updatePreferences,
    loadStats,
    refresh,
    
    // Utilidades
    getUnreadCount,
    getNotificationsByType,
    getUrgentNotifications,
  };
}
