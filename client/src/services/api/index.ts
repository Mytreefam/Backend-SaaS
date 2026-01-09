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
export * from './facturas.api';
export * from './turnos.api';
export * from './notificaciones.api';
export * from './caja.api';
export * from './fichajes.api';
export * from './tareas.api';
export * from './dashboard.api';
export * from './ebitda.api';
export * from './escandallo.api';
export * from './stock-proveedores.api';
export * from './integraciones.api';
export * from './chat.api';

// Re-exportar para fácil importación
export { authApi } from './auth.api';
export { clientesApi } from './clientes.api';
export { productosApi } from './productos.api';
export { pedidosApi } from './pedidos.api';
export { cuponesApi } from './cupones.api';
export { facturasApi } from './facturas.api';
export { turnosApi } from './turnos.api';
export { notificacionesApi } from './notificaciones.api';
export { cajaApi } from './caja.api';
export { fichajesApi } from './fichajes.api';
export { tareasApi } from './tareas.api';
export { dashboardApi } from './dashboard.api';
export { ebitdaApi } from './ebitda.api';
export { escandalloApi } from './escandallo.api';
export { proveedoresApi, stockApi } from './stock-proveedores.api';
export { integracionesApi } from './integraciones.api';
export { chatApi } from './chat.api';
