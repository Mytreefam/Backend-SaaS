import { envelopedFetch } from './http/envelopedFetch';

const API_URL = '/api/clientes';

export async function crearCliente(data: {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  ciudad?: string;
  idioma?: string;
}) {
  try {
    const response = await envelopedFetch<unknown>(API_URL, {
      method: 'POST',
      skipAuth: true, // public registration
      body: JSON.stringify(data),
    });
    return response.data.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la cuenta';
    // Preserve axios-like error shape expected by existing UI
    throw { response: { data: { message } } };
  }
}
