import { envelopedFetch } from '../http/envelopedFetch';

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
      const response = await envelopedFetch<NotificacionBackend[]>(`/clientes/${clienteId}/notificaciones`, {
        method: 'GET',
      });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
      return [];
    }
  },

  // Obtener todas las notificaciones
  getAll: async (): Promise<NotificacionBackend[]> => {
    try {
      const response = await envelopedFetch<NotificacionBackend[]>('/notificaciones', { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
      return [];
    }
  },

  // Crear notificación
  create: async (data: { mensaje: string; clienteId: number; leida?: boolean }): Promise<NotificacionBackend | null> => {
    try {
      const response = await envelopedFetch<NotificacionBackend>('/notificaciones', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error creating notificación:', error);
      return null;
    }
  },

  // Marcar como leída
  marcarLeida: async (id: number): Promise<NotificacionBackend | null> => {
    try {
      const response = await envelopedFetch<NotificacionBackend>(`/notificaciones/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ leida: true }),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error updating notificación:', error);
      return null;
    }
  },

  // Eliminar notificación
  delete: async (id: number): Promise<boolean> => {
    try {
      await envelopedFetch<unknown>(`/notificaciones/${id}`, { method: 'DELETE' });
      return true;
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
