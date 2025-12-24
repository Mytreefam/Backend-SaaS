/**
 * 📋 API CLIENT - INDEX
 * 
 * Exportación centralizada de todos los clientes API
 */

export * from './auth.api';
export * from './clientes.api';
export * from './productos.api';
export * from './pedidos.api';
export * from './cupones.api';

// Re-exportar para fácil importación
export { authApi } from './auth.api';
export { clientesApi } from './clientes.api';
export { productosApi } from './productos.api';
export { pedidosApi } from './pedidos.api';
export { cuponesApi } from './cupones.api';
