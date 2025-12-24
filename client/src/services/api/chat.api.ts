/**
 * 💬 API CLIENT - CHATS
 * 
 * Gestión de conversaciones y mensajes
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

// ============================================================================
// TIPOS
// ============================================================================

export interface MensajeAPI {
  id: number;
  chatId: number;
  autor: string;
  texto: string;
  fecha: string;
}

export interface ChatAPI {
  id: number;
  asunto: string;
  estado: string;
  clienteId: number;
  pedidoId: number;
  creadoEn: string;
  mensajes: MensajeAPI[];
  cliente?: {
    id: number;
    nombre: string;
    email: string;
  };
  pedido?: {
    id: number;
    numero: string;
  };
}

export interface CrearChatRequest {
  asunto: string;
  estado?: string;
  clienteId: number;
  pedidoId?: number;
  tipo?: string;
  mensajes?: Array<{
    autor: string;
    texto: string;
  }>;
}

export interface EnviarMensajeRequest {
  autor: string;
  texto: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const chatApi = {
  /**
   * Obtener todos los chats
   */
  async getAll(clienteId?: number): Promise<ChatAPI[]> {
    try {
      let url = '/chats';
      if (clienteId) {
        url += `?clienteId=${clienteId}`;
      }
      
      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener chats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener chats:', error);
      return [];
    }
  },

  /**
   * Obtener un chat por ID
   */
  async getById(id: number): Promise<ChatAPI | null> {
    try {
      const response = await fetch(buildUrl(`/chats/${id}`), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener chat:', error);
      return null;
    }
  },

  /**
   * Crear un nuevo chat
   */
  async create(data: CrearChatRequest): Promise<ChatAPI | null> {
    try {
      const response = await fetch(buildUrl('/chats'), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear chat');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear chat:', error);
      return null;
    }
  },

  /**
   * Actualizar estado del chat
   */
  async updateStatus(id: number, estado: string): Promise<ChatAPI | null> {
    try {
      const response = await fetch(buildUrl(`/chats/${id}`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ estado }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar chat');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar chat:', error);
      return null;
    }
  },

  /**
   * Enviar mensaje a un chat
   */
  async sendMessage(chatId: number, mensaje: EnviarMensajeRequest): Promise<MensajeAPI | null> {
    try {
      const response = await fetch(buildUrl(`/chats/${chatId}/mensajes`), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(mensaje),
      });

      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return null;
    }
  },

  /**
   * Eliminar un chat
   */
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/chats/${id}`), {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error al eliminar chat:', error);
      return false;
    }
  },
};
