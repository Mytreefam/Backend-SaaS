import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

export interface NotificacionBackend {
  id: number;
  mensaje: string;
  leida: boolean;
  clienteId: number;
}

export const notificacionesApi = {
  // Obtener notificaciones de un cliente
  getByClienteId: async (clienteId: number): Promise<NotificacionBackend[]> => {
    try {
      const response = await fetch(buildUrl(`/clientes/${clienteId}/notificaciones`), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener notificaciones');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
      return [];
    }
  },

  // Obtener todas las notificaciones
  getAll: async (): Promise<NotificacionBackend[]> => {
    try {
      const response = await fetch(buildUrl('/notificaciones'), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener notificaciones');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
      return [];
    }
  },

  // Crear notificación
  create: async (data: { mensaje: string; clienteId: number; leida?: boolean }): Promise<NotificacionBackend | null> => {
    try {
      const response = await fetch(buildUrl('/notificaciones'), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al crear notificación');
      return await response.json();
    } catch (error) {
      console.error('Error creating notificación:', error);
      return null;
    }
  },

  // Marcar como leída
  marcarLeida: async (id: number): Promise<NotificacionBackend | null> => {
    try {
      const response = await fetch(buildUrl(`/notificaciones/${id}`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ leida: true }),
      });
      if (!response.ok) throw new Error('Error al actualizar notificación');
      return await response.json();
    } catch (error) {
      console.error('Error updating notificación:', error);
      return null;
    }
  },

  // Eliminar notificación
  delete: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(buildUrl(`/notificaciones/${id}`), {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting notificación:', error);
      return false;
    }
  },

  // Marcar todas como leídas
  marcarTodasLeidas: async (clienteId: number): Promise<boolean> => {
    try {
      // Obtener todas las notificaciones del cliente
      const notificaciones = await notificacionesApi.getByClienteId(clienteId);
      // Marcar cada una como leída
      await Promise.all(
        notificaciones
          .filter(n => !n.leida)
          .map(n => notificacionesApi.marcarLeida(n.id))
      );
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  },
};
