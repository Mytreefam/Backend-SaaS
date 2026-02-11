/**
 * 🖼️ API CLIENT - UPLOADS
 *
 * Subida de archivos (imágenes) usando el backend `/upload`.
 */

import { API_CONFIG } from '../../config/api.config';
import { envelopedFetch } from '../http/envelopedFetch';

export const uploadsApi = {
  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);

    const response = await envelopedFetch<{ url: string }>(API_CONFIG.ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: form,
      // IMPORTANT: do NOT set Content-Type; browser will set multipart boundary
    });

    const url = response.data.data?.url;
    if (!url) throw new Error('UPLOAD_FAILED');
    // Return raw backend path (usually "/uploads/...")
    // We resolve it to an absolute URL at render-time based on API base URL.
    return url;
  },
};

