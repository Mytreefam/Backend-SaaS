/**
 * 💬 API CLIENT - CHATS
 * 
 * Gestión de conversaciones y mensajes
 */

import { envelopedFetch } from '../http/envelopedFetch';

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
    // Backend contract: contenido/remitente
    contenido: string;
    remitente?: string;
    leido?: boolean;
  }>;
}

export interface EnviarMensajeRequest {
  contenido: string;
  remitente?: string;
  leido?: boolean;
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

      const response = await envelopedFetch<ChatAPI[]>(url, { method: 'GET' });
      return response.data.data ?? [];
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
      const response = await envelopedFetch<ChatAPI>(`/chats/${id}`, { method: 'GET' });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<ChatAPI>('/chats', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<ChatAPI>(`/chats/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
      });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<MensajeAPI>(`/chats/${chatId}/mensajes`, {
        method: 'POST',
        body: JSON.stringify(mensaje),
      });
      return response.data.data ?? null;
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
      await envelopedFetch<unknown>(`/chats/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error al eliminar chat:', error);
      return false;
    }
  },
};
