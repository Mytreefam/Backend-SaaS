import axios from 'axios';

const API_URL = '/api/clientes';

export async function crearCliente(data: {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  ciudad?: string;
  idioma?: string;
}) {
  return axios.post(API_URL, data);
}
