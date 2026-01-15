import { useState } from 'react';

// Usuario simulado para desarrollo
const defaultUser = {
  id: 1,
  nombre: 'Usuario Demo',
  email: 'demo@demo.com',
};

export function useAuth() {
  // En producción, aquí iría la lógica real de autenticación
  const [user] = useState(defaultUser);
  return { user };
}
