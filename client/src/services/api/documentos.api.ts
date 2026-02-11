/**
 * 📄 API CLIENT - DOCUMENTOS
 *
 * Usa `/documentos` (ownership enforced en backend).
 */

import { envelopedFetch } from '../http/envelopedFetch';

export interface DocumentoApi {
  id: number;
  nombre: string;
  url: string;
  clienteId: number;
}

export const documentosApi = {
  async list(): Promise<DocumentoApi[]> {
    try {
      const res = await envelopedFetch<DocumentoApi[]>('/documentos', { method: 'GET' });
      return res.data.data ?? [];
    } catch (error) {
      console.error('Error listando documentos:', error);
      return [];
    }
  },

  async create(input: { nombre: string; url: string }): Promise<DocumentoApi | null> {
    try {
      const res = await envelopedFetch<DocumentoApi>('/documentos', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data.data ?? null;
    } catch (error) {
      console.error('Error creando documento:', error);
      return null;
    }
  },

  async delete(id: number): Promise<boolean> {
    try {
      await envelopedFetch<{ deleted: boolean }>(`/documentos/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error eliminando documento:', error);
      return false;
    }
  },
};

