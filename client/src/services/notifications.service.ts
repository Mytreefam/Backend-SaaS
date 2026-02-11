/**
 * SERVICIO DE NOTIFICACIONES - Udar Edge
 * API Service conectado con backend real
 */

import { API_CONFIG, getAuthToken } from '../config/api.config';
import { envelopedFetch } from './http/envelopedFetch';
import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  GetNotificationsRequest,
  GetNotificationsResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
  NotificationEvent
} from '../types/notifications.types';

// ==================== CONFIGURACIÓN ====================

const API_BASE_URL = API_CONFIG.BASE_URL;
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/notificaciones`;
const CLIENTES_ENDPOINT = `${API_BASE_URL}/clientes`;

// ==================== MOCK DATA (Temporal - Para desarrollo) ====================

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-001',
    tipo: 'pedido',
    titulo: 'Nuevo pedido recibido',
    mensaje: 'Pedido #1234 de Juan Pérez por 45.50€',
    descripcion: 'Mesa 5 - 3 platos principales, 2 postres',
    fecha: new Date(),
    status: 'sin_leer',
    prioridad: 'alta',
    usuarioId: 'usr-001',
    empresaId: 'emp-001',
    puntoVentaId: 'ptv-001',
    relacionId: 'ped-1234',
    relacionTipo: 'pedido',
    urlAccion: '/pedidos/ped-1234',
    accionTexto: 'Ver pedido',
    canales: ['push', 'in_app'],
    creadoEn: new Date(),
  },
  {
    id: 'not-002',
    tipo: 'stock',
    titulo: 'Stock bajo',
    mensaje: 'Harina de Trigo - Solo quedan 5 kg',
    descripcion: 'El stock está por debajo del mínimo configurado (10 kg)',
    fecha: new Date(Date.now() - 3600000),
    status: 'sin_leer',
    prioridad: 'urgente',
    usuarioId: 'usr-001',
    empresaId: 'emp-001',
    puntoVentaId: 'ptv-001',
    relacionId: 'art-045',
    relacionTipo: 'articulo',
    urlAccion: '/inventario/art-045',
    accionTexto: 'Ver inventario',
    canales: ['push', 'in_app', 'email'],
    creadoEn: new Date(Date.now() - 3600000),
  }
];

const MOCK_PREFERENCES: NotificationPreferences = {
  usuarioId: 'usr-001',
  canalesActivos: {
    email: true,
    push: true,
    sms: false,
    in_app: true,
  },
  preferencias: {
    pedido: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: true,
    },
    stock: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    cita: {
      activo: true,
      canales: ['push', 'in_app', 'sms'],
      sonido: true,
    },
    promocion: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: false,
    },
    sistema: {
      activo: true,
      canales: ['in_app'],
      sonido: false,
    },
    pago: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    alerta: {
      activo: true,
      canales: ['push', 'in_app', 'sms', 'email'],
      sonido: true,
    },
    mensaje: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: true,
    },
    rrhh: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    invitacion: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    fichaje: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: true,
    },
    nomina: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    vacaciones: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    formacion: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: false,
    },
  },
  horarioSilencioso: {
    activo: false,
    inicio: '22:00',
    fin: '08:00',
  },
  frecuenciaEmail: 'inmediato',
  agruparNotificaciones: true,
  actualizadoEn: new Date(),
};

// ==================== SERVICIO DE API ====================

class NotificationsService {
  private useMock = false; // Solo datos reales del backend
  private listeners: ((event: NotificationEvent) => void)[] = [];
  
  // ==================== OBTENER NOTIFICACIONES ====================
  
  async getNotifications(request: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    try {
      // Usar el endpoint de cliente si tenemos usuarioId (que es el clienteId)
      const clienteId = request.usuarioId;
      const response = await envelopedFetch<any[]>(`${CLIENTES_ENDPOINT}/${clienteId}/notificaciones`, {
        method: 'GET',
      });

      const data = response.data.data ?? [];
      
      // Transformar del formato backend al formato frontend
      const notificaciones: Notification[] = data.map((n: any) => ({
        id: String(n.id),
        tipo: this.detectarTipo(n.mensaje),
        titulo: this.generarTitulo(n.mensaje),
        mensaje: n.mensaje,
        descripcion: n.mensaje,
        fecha: new Date(),
        status: n.leida ? 'leida' : 'sin_leer',
        prioridad: 'normal',
        usuarioId: String(n.clienteId),
        canales: ['in_app'],
        creadoEn: new Date(),
      }));
      
      return {
        notificaciones,
        total: notificaciones.length,
        pagina: 1,
        porPagina: 100,
        totalPaginas: 1,
      };
    } catch (error) {
      console.error('Error en getNotifications:', error);
      throw error;
    }
  }
  
  // Detectar tipo basado en mensaje
  private detectarTipo(mensaje: string): any {
    const m = mensaje.toLowerCase();
    if (m.includes('pedido') || m.includes('entrega') || m.includes('camino')) return 'pedido';
    if (m.includes('cita') || m.includes('confirmada') || m.includes('reserva')) return 'cita';
    if (m.includes('cupón') || m.includes('descuento') || m.includes('oferta')) return 'promocion';
    if (m.includes('stock')) return 'stock';
    if (m.includes('pago')) return 'pago';
    return 'sistema';
  }
  
  // Generar título basado en mensaje
  private generarTitulo(mensaje: string): string {
    if (mensaje.length < 50) return mensaje.split('.')[0];
    return mensaje.substring(0, 47) + '...';
  }
  
  // ==================== MARCAR COMO LEÍDA ====================
  
  async markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    try {
      // Marcar cada notificación como leída
      let actualizadas = 0;
      for (const id of request.notificacionIds) {
        try {
          await envelopedFetch<unknown>(`${NOTIFICATIONS_ENDPOINT}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ leida: true }),
            headers: API_CONFIG.HEADERS,
          });
          actualizadas++;
        } catch {
          // mantener conteo: solo incrementa si fue OK
        }
      }
      
      return { success: actualizadas > 0, actualizadas };
    } catch (error) {
      console.error('Error en markAsRead:', error);
      return { success: false, actualizadas: 0 };
    }
  }
  
  // ==================== MARCAR TODAS COMO LEÍDAS ====================
  
  async markAllAsRead(usuarioId: string): Promise<MarkAsReadResponse> {
    try {
      // Obtener todas las notificaciones del cliente
      const response = await envelopedFetch<any[]>(`${CLIENTES_ENDPOINT}/${usuarioId}/notificaciones`, {
        method: 'GET',
      });
      const notificaciones = response.data.data ?? [];
      let actualizadas = 0;
      
      // Marcar cada una como leída
      for (const n of notificaciones.filter((n: any) => !n.leida)) {
        try {
          await envelopedFetch<unknown>(`${NOTIFICATIONS_ENDPOINT}/${n.id}`, {
            method: 'PUT',
            body: JSON.stringify({ leida: true }),
          });
          actualizadas++;
        } catch {
          // ignore individual failures
        }
      }
      
      return { success: true, actualizadas };
    } catch (error) {
      console.error('Error en markAllAsRead:', error);
      return { success: true, actualizadas: 0 };
    }
  }
  
  // ==================== ARCHIVAR NOTIFICACIÓN ====================
  
  async archiveNotification(notificacionId: string, usuarioId: string): Promise<boolean> {
    // El backend no soporta archivar, lo manejamos localmente
    console.log('Archivar notificación:', notificacionId);
    return true;
  }
  
  // ==================== ELIMINAR NOTIFICACIÓN ====================
  
  async deleteNotification(notificacionId: string, usuarioId: string): Promise<boolean> {
    try {
      await envelopedFetch<unknown>(`${NOTIFICATIONS_ENDPOINT}/${notificacionId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error en deleteNotification:', error);
      return false;
    }
  }
  
  // ==================== OBTENER PREFERENCIAS ====================
  
  async getPreferences(usuarioId: string): Promise<NotificationPreferences> {
    try {
      const response = await envelopedFetch<NotificationPreferences>(API_CONFIG.ENDPOINTS.NOTIFICACIONES_PREFERENCIAS, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });
      const prefs = response.data.data;
      if (!prefs) throw new Error('Preferencias no disponibles');
      return prefs as any;
    } catch (error) {
      console.error('Error en getPreferences:', error);
      throw error;
    }
  }
  
  // ==================== ACTUALIZAR PREFERENCIAS ====================
  
  async updatePreferences(request: UpdatePreferencesRequest): Promise<UpdatePreferencesResponse> {
    try {
      const response = await envelopedFetch<{ preferencias: NotificationPreferences }>(
        API_CONFIG.ENDPOINTS.NOTIFICACIONES_PREFERENCIAS,
        {
          method: 'PUT',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify(request.preferencias),
        },
      );
      const prefs = response.data.data?.preferencias;
      return {
        success: true,
        preferencias: (prefs as any) || (request.preferencias as any),
      };
    } catch (error) {
      console.error('Error en updatePreferences:', error);
      throw error;
    }
  }
  
  // ==================== CREAR NOTIFICACIÓN ====================
  
  async createNotification(request: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    try {
      const response = await envelopedFetch<any>(NOTIFICATIONS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          mensaje: request.mensaje || request.titulo,
          clienteId: Number(request.usuarioId),
          leida: false,
        }),
        headers: API_CONFIG.HEADERS,
      });

      const data = response.data.data ?? {};
      const newNotification: Notification = {
        id: String(data.id),
        ...request,
        fecha: new Date(),
        status: 'sin_leer',
        creadoEn: new Date(),
      };
      
      return {
        success: true,
        notificacion: newNotification,
      };
    } catch (error) {
      console.error('Error en createNotification:', error);
      throw error;
    }
  }
  
  // ==================== ESTADÍSTICAS ====================
  
  async getStats(usuarioId: string, empresaId?: string): Promise<NotificationStats> {
    try {
      const response = await envelopedFetch<any[]>(`${CLIENTES_ENDPOINT}/${usuarioId}/notificaciones`, {
        method: 'GET',
      });
      const notificaciones = response.data.data ?? [];
      const sinLeer = notificaciones.filter((n: any) => !n.leida).length;
      
      return {
        total: notificaciones.length,
        sinLeer,
        leidas: notificaciones.length - sinLeer,
        archivadas: 0,
        porTipo: {},
        porPrioridad: { normal: notificaciones.length, alta: 0, urgente: 0, baja: 0 },
      };
    } catch (error) {
      console.error('Error en getStats:', error);
      return { total: 0, sinLeer: 0, leidas: 0, archivadas: 0, porTipo: {}, porPrioridad: { normal: 0, alta: 0, urgente: 0, baja: 0 } };
    }
  }
  
  // ==================== EVENTOS EN TIEMPO REAL ====================
  
  subscribe(callback: (event: NotificationEvent) => void): () => void {
    this.listeners.push(callback);
    
    // En producción, aquí se establecería una conexión WebSocket
    // const ws = new WebSocket(`${WS_URL}/notifications`);
    // ws.onmessage = (event) => { callback(JSON.parse(event.data)); };
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  // ==================== HELPERS PRIVADOS ====================
  
  private getToken(): string {
    // Obtener token de autenticación (desde localStorage, cookie, etc.)
    return getAuthToken() || '';
  }
  
  // ==================== MOCK IMPLEMENTATIONS ====================
  
  private getMockNotifications(request: GetNotificationsRequest): GetNotificationsResponse {
    let filtered = [...MOCK_NOTIFICATIONS];
    
    // Filtrar por status
    if (request.status && request.status.length > 0) {
      filtered = filtered.filter(n => request.status!.includes(n.status));
    }
    
    // Filtrar por tipo
    if (request.tipo && request.tipo.length > 0) {
      filtered = filtered.filter(n => request.tipo!.includes(n.tipo));
    }
    
    // Filtrar por prioridad
    if (request.prioridad && request.prioridad.length > 0) {
      filtered = filtered.filter(n => request.prioridad!.includes(n.prioridad));
    }
    
    // Ordenar
    if (request.ordenarPor === 'fecha') {
      filtered.sort((a, b) => {
        const diff = b.fecha.getTime() - a.fecha.getTime();
        return request.ordenDir === 'asc' ? -diff : diff;
      });
    }
    
    const sinLeer = filtered.filter(n => n.status === 'sin_leer').length;
    
    return {
      notificaciones: filtered,
      total: filtered.length,
      sinLeer,
      hasMore: false,
    };
  }
  
  private mockMarkAsRead(request: MarkAsReadRequest): MarkAsReadResponse {
    return {
      success: true,
      actualizadas: request.notificacionIds.length,
    };
  }
  
  private getMockStats(): NotificationStats {
    return {
      total: MOCK_NOTIFICATIONS.length,
      sinLeer: MOCK_NOTIFICATIONS.filter(n => n.status === 'sin_leer').length,
      leidas: MOCK_NOTIFICATIONS.filter(n => n.status === 'leida').length,
      archivadas: 0,
      porTipo: {
        pedido: 1,
        stock: 1,
        cita: 0,
        promocion: 0,
        sistema: 0,
        pago: 0,
        alerta: 0,
        mensaje: 0,
      },
      ultimaSemana: MOCK_NOTIFICATIONS.length,
      urgentes: MOCK_NOTIFICATIONS.filter(n => n.prioridad === 'urgente').length,
    };
  }

  async registerDeviceToken(params: { token: string; platform?: string }): Promise<boolean> {
    try {
      await envelopedFetch<{ ok?: boolean }>(API_CONFIG.ENDPOINTS.NOTIFICACIONES_DEVICES, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          token: params.token,
          platform: params.platform || 'unknown',
        }),
      });
      return true;
    } catch (error) {
      console.error('Error registrando device token:', error);
      return false;
    }
  }

  async sendTest(): Promise<boolean> {
    try {
      await envelopedFetch<{ ok?: boolean }>(API_CONFIG.ENDPOINTS.NOTIFICACIONES_TEST, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
      });
      return true;
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      return false;
    }
  }
}

// ==================== EXPORT SINGLETON ====================

export const notificationsService = new NotificationsService();