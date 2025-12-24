/**
 * API CLIENT: Módulo Gerente
 * Servicios para conectar frontend con backend de gerente
 */

import { apiService } from '../api.service';
import { toast } from 'sonner';

// ============================================
// TIPOS
// ============================================

export interface DatosVentas {
  empresa_id: string;
  marca_id: string;
  punto_venta_id: string;
  periodo_tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  ventas_periodo: number;
  pedidos_periodo: number;
  productos_vendidos: number;
  ticket_medio_pedido: number;
  ticket_medio_producto: number;
  variacion_ventas_periodo: number;
  variacion_margen_neto_periodo: number;
  ventas_mostrador: number;
  variacion_mostrador: number;
  ventas_app_web: number;
  variacion_app_web: number;
  ventas_terceros: number;
  variacion_terceros: number;
  labels_ultimos_5_meses: string[];
  ingresos_ultimos_5_meses: number[];
}

export interface KPIs {
  mrr: number;
  variacion_mrr: number;
  pedidos: number;
  variacion_pedidos: number;
  clientes_unicos: number;
  variacion_clientes: number;
  margen_porcentaje: number;
  variacion_margen: number;
}

export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  foto?: string;
  puesto: string;
  empresaId: string;
  marcaId?: string;
  puntoVentaId: string;
  desempeno: number;
  horasMes: number;
  estado: string;
  fechaAlta: Date;
  fechaBaja?: Date;
  horarioEntrada: string;
  horarioSalida: string;
  salarioBase: number;
  turno?: string;
}

export interface ArticuloStock {
  id: number;
  codigoInterno: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  empresaId: string;
  puntoVentaId: string;
  proveedorId?: number;
  precioUltimaCompra?: number;
  fechaUltimaCompra?: Date;
  ubicacionAlmacen?: string;
  alertaStockBajo: boolean;
}

export interface MovimientoStock {
  id: number;
  articuloId: number;
  tipo: string; // entrada, salida, ajuste, merma
  cantidad: number;
  stockAnterior: number;
  stockPosterior: number;
  motivo?: string;
  observaciones?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  pedidoProveedorId?: number;
  fecha: Date;
}

export interface Proveedor {
  id: number;
  nombre: string;
  cif?: string;
  categoria: string;
  contactoNombre?: string;
  contactoTelefono?: string;
  contactoEmail?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  pais: string;
  condicionesPago?: string;
  estado: string;
}

export interface PedidoProveedor {
  id: number;
  numero: string;
  proveedorId: number;
  estado: string;
  fechaPedido: Date;
  fechaEntrega?: Date;
  total: number;
  observaciones?: string;
  creadoPor?: number;
  recibidoPor?: number;
}

export interface ItemPedidoProveedor {
  id: number;
  pedidoProveedorId: number;
  articuloId: number;
  nombreArticulo: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  cantidadRecibida?: number;
  observaciones?: string;
}

export interface CierreCaja {
  id: number;
  numero: string;
  puntoVentaId: string;
  empresaId: string;
  fecha: Date;
  turno: string;
  empleadoAperturaId?: number;
  empleadoCierreId?: number;
  efectivoInicial: number;
  totalVentasEfectivo: number;
  totalVentasTarjeta: number;
  totalVentasOnline: number;
  gastosCaja: number;
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
  estado: string;
  observaciones?: string;
}

export interface ProductoCatalogo {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  precio_compra: number;
  stock: number;
  stock_minimo: number;
  imagen?: string;
  activo: boolean;
  visible_app: boolean;
  visible_tpv: boolean;
}

// ============================================
// DASHBOARD
// ============================================

export const dashboardGerenteApi = {
  /**
   * Obtener datos de ventas
   */
  async obtenerDatosVentas(params: {
    empresa_id?: string;
    marca_id?: string;
    punto_venta_id?: string;
    periodo_tipo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams(params as any).toString();
      const response = await apiService.get(`/gerente/dashboard/ventas?${queryParams}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de ventas:', error);
      toast.error('Error al cargar datos de ventas');
      throw error;
    }
  },

  /**
   * Obtener KPIs principales
   */
  async obtenerKPIs(params?: {
    empresa_id?: string;
    marca_id?: string;
    punto_venta_id?: string;
  }): Promise<any> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/dashboard/kpis${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      return response.data;
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      toast.error('Error al cargar KPIs');
      throw error;
    }
  },

  /**
   * Obtener alertas
   */
  async obtenerAlertas(): Promise<any[]> {
    try {
      const response = await apiService.get('/gerente/dashboard/alertas');
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }
  }
};

// ============================================
// EMPLEADOS (RRHH)
// ============================================

export const empleadosApi = {
  /**
   * Obtener listado de empleados
   */
  async obtenerEmpleados(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    puesto?: string;
    estado?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/empleados${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      toast.error('Error al cargar empleados');
      return [];
    }
  },

  /**
   * Obtener empleado por ID
   */
  async obtenerEmpleadoPorId(id: string): Promise<any> {
    try {
      const response = await apiService.get(`/gerente/empleados/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      toast.error('Error al cargar empleado');
      throw error;
    }
  },

  /**
   * Crear empleado
   */
  async crearEmpleado(datos: any): Promise<any> {
    try {
      const response = await apiService.post('/gerente/empleados', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Empleado creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      toast.error('Error al crear empleado');
      throw error;
    }
  },

  /**
   * Actualizar empleado
   */
  async actualizarEmpleado(id: string, datos: any): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/empleados/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Empleado actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      toast.error('Error al actualizar empleado');
      throw error;
    }
  },

  /**
   * Obtener estadísticas del equipo
   */
  async obtenerEstadisticas(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
  }): Promise<any> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/empleados/estadisticas${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  },

  /**
   * Obtener empleado por ID
   */
  async obtenerPorId(id: string): Promise<any> {
    try {
      const response = await apiService.get(`/gerente/empleados/${id}`);
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      toast.error('Error al cargar datos del empleado');
      return null;
    }
  },

  /**
   * Eliminar empleado
   */
  async eliminarEmpleado(id: string): Promise<void> {
    try {
      await apiService.delete(`/gerente/empleados/${id}`);
      toast.success('Empleado eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      toast.error('Error al eliminar empleado');
      throw error;
    }
  },

  /**
   * Obtener fichajes de empleado
   */
  async obtenerFichajes(id: string, params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/empleados/${id}/fichajes${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener fichajes:', error);
      toast.error('Error al cargar fichajes');
      return [];
    }
  },

  async obtenerTodosFichajes(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/empleados/fichajes${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener fichajes:', error);
      toast.error('Error al cargar fichajes');
      return [];
    }
  },

  /**
   * Asignar tarea a empleado
   */
  async asignarTarea(id: string, tarea: {
    titulo: string;
    descripcion: string;
    prioridad: 'baja' | 'media' | 'alta';
    fecha_limite?: string;
  }): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/empleados/${id}/tareas`, tarea);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Tarea asignada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al asignar tarea:', error);
      toast.error('Error al asignar tarea');
      throw error;
    }
  },

  /**
   * Obtener desempeño individual
   */
  async obtenerDesempeno(id: string): Promise<any> {
    try {
      const response = await apiService.get(`/gerente/empleados/${id}/desempeño`);
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener desempeño:', error);
      toast.error('Error al cargar desempeño');
      return null;
    }
  },

  /**
   * ⭐ NUEVO: Registrar modificación de contrato
   */
  async crearModificacionContrato(id: string, datos: any): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/empleados/${id}/modificaciones`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Modificación de contrato registrada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al registrar modificación:', error);
      toast.error('Error al registrar modificación');
      throw error;
    }
  },

  /**
   * ⭐ NUEVO: Registrar finalización de contrato
   */
  async crearFinalizacionContrato(id: string, datos: any): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/empleados/${id}/finalizaciones`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Finalización de contrato registrada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al registrar finalización:', error);
      toast.error('Error al registrar finalización');
      throw error;
    }
  },

  /**
   * ⭐ NUEVO: Registrar remuneración adicional
   */
  async crearRemuneracion(id: string, datos: any): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/empleados/${id}/remuneraciones`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Remuneración registrada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al registrar remuneración:', error);
      toast.error('Error al registrar remuneración');
      throw error;
    }
  },

  /**
   * ⭐ NUEVO: Registrar fichaje (entrada/salida)
   */
  async registrarFichaje(datos: {
    empleadoId: number;
    tipo: 'entrada' | 'salida';
    puntoVentaId: string;
    observaciones?: string;
  }): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/fichajes/registrar`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success(`Fichaje de ${datos.tipo} registrado correctamente`);
      return response.data;
    } catch (error) {
      console.error('Error al registrar fichaje:', error);
      toast.error('Error al registrar el fichaje');
      throw error;
    }
  }
};

// ============================================
// HORARIOS Y TURNOS
// ============================================

export const horariosApi = {
  /**
   * Obtener todos los horarios de una empresa
   */
  async obtenerHorarios(empresaId?: string): Promise<any[]> {
    try {
      const params = empresaId ? `?empresaId=${empresaId}` : '';
      const response = await apiService.get(`/gerente/horarios${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      toast.error('Error al obtener horarios');
      throw error;
    }
  },

  /**
   * Obtener horario por ID
   */
  async obtenerHorarioPorId(id: number): Promise<any> {
    try {
      const response = await apiService.get(`/gerente/horarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener horario:', error);
      toast.error('Error al obtener horario');
      throw error;
    }
  },

  /**
   * Crear nuevo horario
   */
  async crearHorario(datos: any): Promise<any> {
    try {
      const response = await apiService.post('/gerente/horarios', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Horario creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear horario:', error);
      toast.error('Error al crear horario');
      throw error;
    }
  },

  /**
   * Actualizar horario
   */
  async actualizarHorario(id: number, datos: any): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/horarios/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Horario actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      toast.error('Error al actualizar horario');
      throw error;
    }
  },

  /**
   * Eliminar horario
   */
  async eliminarHorario(id: number): Promise<void> {
    try {
      const response = await apiService.delete(`/gerente/horarios/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Horario eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      toast.error('Error al eliminar horario');
      throw error;
    }
  },

  /**
   * Asignar horario a empleado
   */
  async asignarHorarioAEmpleado(empleadoId: number, datos: any): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/empleados/${empleadoId}/horarios`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Horario asignado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al asignar horario:', error);
      toast.error('Error al asignar horario');
      throw error;
    }
  },

  /**
   * Obtener horarios de un empleado
   */
  async obtenerHorariosEmpleado(empleadoId: number, activos?: boolean): Promise<any[]> {
    try {
      const params = activos !== undefined ? `?activos=${activos}` : '';
      const response = await apiService.get(`/gerente/empleados/${empleadoId}/horarios${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener horarios del empleado:', error);
      return [];
    }
  },

  /**
   * Obtener horario actual de un empleado para una fecha específica
   */
  async obtenerHorarioActualEmpleado(empleadoId: number, fecha?: Date): Promise<any> {
    try {
      const params = fecha ? `?fecha=${fecha.toISOString()}` : '';
      const response = await apiService.get(`/gerente/empleados/${empleadoId}/horarios/actual${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener horario actual:', error);
      return null;
    }
  },

  /**
   * Cancelar asignación de horario
   */
  async cancelarAsignacionHorario(asignacionId: number): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/asignaciones/${asignacionId}/cancelar`, {});
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Asignación cancelada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al cancelar asignación:', error);
      toast.error('Error al cancelar asignación');
      throw error;
    }
  }
};

// ============================================
// STOCK Y PROVEEDORES
// ============================================

export const stockApi = {
  /**
   * Obtener artículos de stock
   */
  async obtenerArticulos(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    categoria?: string;
    stock_bajo?: boolean;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/stock/articulos${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener artículos:', error);
      toast.error('Error al cargar artículos de stock');
      return [];
    }
  },

  /**
   * Obtener artículos de stock (alias)
   */
  async obtenerArticulosStock(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    categoria?: string;
    stock_bajo?: boolean;
  }): Promise<any[]> {
    return this.obtenerArticulos(params);
  },

  /**
   * Crear artículo de stock
   */
  async crearArticulo(datos: any): Promise<any> {
    try {
      const response = await apiService.post('/gerente/stock/articulos', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Artículo creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear artículo:', error);
      toast.error('Error al crear artículo');
      throw error;
    }
  },

  /**
   * Crear artículo de stock (alias)
   */
  async crearArticuloStock(datos: any): Promise<any> {
    return this.crearArticulo(datos);
  },

  /**
   * Actualizar artículo de stock
   */
  async actualizarArticuloStock(id: number, datos: any): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/stock/articulos/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Artículo actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      toast.error('Error al actualizar artículo');
      throw error;
    }
  },

  /**
   * Eliminar artículo de stock
   */
  async eliminarArticuloStock(id: number): Promise<any> {
    try {
      const response = await apiService.delete(`/gerente/stock/articulos/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Artículo eliminado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      toast.error('Error al eliminar artículo');
      throw error;
    }
  },

  /**
   * Ajustar stock
   */
  async ajustarStock(id: string, datos: {
    tipo: 'entrada' | 'salida' | 'ajuste' | 'merma';
    cantidad: number;
    motivo?: string;
    observaciones?: string;
  }): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/stock/articulos/${id}/ajustar`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Stock ajustado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al ajustar stock:', error);
      toast.error('Error al ajustar stock');
      throw error;
    }
  },

  /**
   * Obtener proveedores
   */
  async obtenerProveedores(params?: {
    empresa_id?: string;
    categoria?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/stock/proveedores${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      toast.error('Error al cargar proveedores');
      return [];
    }
  },

  /**
   * Crear proveedor
   */
  async crearProveedor(datos: any): Promise<any> {
    try {
      const response = await apiService.post('/gerente/stock/proveedores', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Proveedor creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      toast.error('Error al crear proveedor');
      throw error;
    }
  },

  /**
   * Actualizar proveedor
   */
  async actualizarProveedor(id: number, datos: any): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/stock/proveedores/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Proveedor actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      toast.error('Error al actualizar proveedor');
      throw error;
    }
  },

  /**
   * Eliminar proveedor
   */
  async eliminarProveedor(id: number): Promise<any> {
    try {
      const response = await apiService.delete(`/gerente/stock/proveedores/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Proveedor eliminado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      toast.error('Error al eliminar proveedor');
      throw error;
    }
  },

  /**
   * Obtener historial de movimientos de stock
   */
  async obtenerMovimientos(params?: {
    articulo_id?: number;
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/stock/movimientos${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener movimientos de stock:', error);
      toast.error('Error al cargar historial de movimientos');
      return [];
    }
  },

  /**
   * Obtener pedidos a proveedores
   */
  async obtenerPedidosProveedor(params?: {
    proveedor_id?: number;
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/stock/pedidos-proveedor${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener pedidos a proveedores:', error);
      toast.error('Error al cargar pedidos a proveedores');
      return [];
    }
  },

  /**
   * Crear pedido a proveedor
   */
  async crearPedidoProveedor(datos: {
    proveedorId?: number;
    proveedor_id?: number;
    puntoVentaId?: string;
    punto_venta_id?: string;
    empresaId?: string;
    empresa_id?: string;
    fechaEntregaEstimada?: string;
    fecha_entrega?: Date;
    observaciones?: string;
    notas?: string;
    items: Array<{
      articuloId?: number;
      articulo_id?: number;
      nombreArticulo?: string;
      nombre_articulo?: string;
      cantidad: number;
      precioUnitario?: number;
      precio_unitario?: number;
      total?: number;
    }>;
    subtotal?: number;
    iva?: number;
    total?: number;
  }): Promise<any> {
    try {
      const response = await apiService.post('/gerente/stock/pedidos-proveedor', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Pedido creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al crear pedido a proveedor');
      throw error;
    }
  },

  /**
   * Actualizar pedido a proveedor
   */
  async actualizarPedidoProveedor(id: number, datos: any): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/stock/pedidos-proveedor/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Pedido actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      toast.error('Error al actualizar pedido');
      throw error;
    }
  },

  /**
   * Eliminar pedido a proveedor
   */
  async eliminarPedidoProveedor(id: number): Promise<any> {
    try {
      const response = await apiService.delete(`/gerente/stock/pedidos-proveedor/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Pedido eliminado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      toast.error('Error al eliminar pedido');
      throw error;
    }
  },

  /**
   * Recibir pedido de proveedor
   */
  async recibirPedidoProveedor(pedidoId: number, datos: {
    observaciones?: string;
    items?: Array<{
      itemId?: number;
      item_id?: number;
      cantidadRecibida?: number;
      cantidad_recibida?: number;
      observacion?: string;
    }>;
  }): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/stock/pedidos-proveedor/${pedidoId}/recibir`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Pedido recibido correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al recibir pedido:', error);
      toast.error('Error al procesar recepción del pedido');
      throw error;
    }
  },

  /**
   * Obtener alertas de stock bajo
   */
  async obtenerAlertas(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/stock/alertas${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }
  },

  // ============================================
  // SESIONES DE INVENTARIO
  // ============================================

  /**
   * Obtener sesiones de inventario
   */
  async obtenerSesionesInventario(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    estado?: string;
  }): Promise<any[]> {
    try {
      console.log('📥 [API] Obteniendo sesiones de inventario:', params);
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/stock/sesiones-inventario${queryParams ? '?' + queryParams : ''}`);
      console.log('✅ [API] Sesiones recibidas:', response);
      if (Array.isArray(response)) return response;
      if (!response.success) return [];
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener sesiones de inventario:', error);
      return [];
    }
  },

  /**
   * Crear sesión de inventario
   */
  async crearSesionInventario(datos: {
    nombre: string;
    tipo?: string;
    almacen?: string;
    empresa_id: string;
    punto_venta_id: string;
    responsables?: string[];
    fecha_limite?: string;
    observaciones?: string;
  }): Promise<any> {
    try {
      console.log('📤 [API] Creando sesión de inventario:', datos);
      const response = await apiService.post('/gerente/stock/sesiones-inventario', datos);
      console.log('✅ [API] Sesión creada:', response);
      return response;
    } catch (error) {
      console.error('Error al crear sesión de inventario:', error);
      throw error;
    }
  },

  /**
   * Actualizar sesión de inventario
   */
  async actualizarSesionInventario(id: number, datos: any): Promise<any> {
    try {
      console.log('📤 [API] Actualizando sesión:', id, datos);
      const response = await apiService.put(`/gerente/stock/sesiones-inventario/${id}`, datos);
      return response;
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      throw error;
    }
  },

  /**
   * Eliminar sesión de inventario
   */
  async eliminarSesionInventario(id: number): Promise<any> {
    try {
      console.log('📤 [API] Eliminando sesión:', id);
      const response = await apiService.delete(`/gerente/stock/sesiones-inventario/${id}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      throw error;
    }
  },

  /**
   * Agregar línea a sesión de inventario
   */
  async agregarLineaInventario(sesionId: number, datos: {
    articuloId: number;
    codigoArticulo: string;
    nombreArticulo: string;
    stockTeorico: number;
    stockContado?: number;
  }): Promise<any> {
    try {
      console.log('📤 [API] Agregando línea a sesión:', sesionId, datos);
      const response = await apiService.post(`/gerente/stock/sesiones-inventario/${sesionId}/lineas`, datos);
      return response;
    } catch (error) {
      console.error('Error al agregar línea:', error);
      throw error;
    }
  },

  /**
   * Actualizar línea de inventario
   */
  async actualizarLineaInventario(sesionId: number, lineaId: number, datos: {
    stockContado?: number;
    observaciones?: string;
    contadoPor?: number;
  }): Promise<any> {
    try {
      console.log('📤 [API] Actualizando línea:', sesionId, lineaId, datos);
      const response = await apiService.put(`/gerente/stock/sesiones-inventario/${sesionId}/lineas/${lineaId}`, datos);
      return response;
    } catch (error) {
      console.error('Error al actualizar línea:', error);
      throw error;
    }
  }
};

// ============================================
// PRODUCTOS (CATÁLOGO)
// ============================================

export const productosGerenteApi = {
  /**
   * Obtener productos del catálogo
   */
  async obtenerProductos(params?: {
    empresa_id?: string;
    marca_id?: string;
    categoria?: string;
    activo?: boolean;
  }): Promise<any[]> {
    try {
      console.log('🔄 [GERENTE API] Iniciando obtenerProductos con params:', params);
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const url = `/gerente/productos${queryParams ? '?' + queryParams : ''}`;
      console.log('🔄 [GERENTE API] URL construida:', url);
      
      const response = await apiService.get(url);
      console.log('📡 [GERENTE API] Respuesta recibida:', response);
      
      if (!response.success) {
        console.warn('⚠️ [GERENTE API] Respuesta no exitosa:', response);
        return [];
      }
      
      console.log('✅ [GERENTE API] Productos recibidos exitosamente:', response.data?.length, 'productos');
      return response.data;
    } catch (error) {
      console.error('❌ [GERENTE API] Error al obtener productos:', error);
      toast.error('Error al cargar productos desde el servidor');
      return [];
    }
  },

  /**
   * Crear producto
   */
  async crearProducto(datos: any): Promise<any> {
    try {
      const response = await apiService.post('/gerente/productos', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Producto creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al crear producto');
      throw error;
    }
  },

  /**
   * Actualizar producto
   */
  async actualizarProducto(id: string, datos: any): Promise<any> {
    try {
      const response = await apiService.put(`/gerente/productos/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Producto actualizado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar producto');
      throw error;
    }
  },

  /**
   * Eliminar producto
   */
  async eliminarProducto(id: string): Promise<void> {
    try {
      const response = await apiService.delete(`/gerente/productos/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
      throw error;
    }
  },

  /**
   * Obtener estadísticas de productos
   */
  async obtenerEstadisticas(): Promise<any> {
    try {
      const response = await apiService.get('/gerente/productos/estadisticas');
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  },

  /**
   * Obtener categorías de productos
   */
  async obtenerCategorias(empresa_id?: string): Promise<any[]> {
    try {
      const queryParams = empresa_id ? new URLSearchParams({ empresa_id }).toString() : '';
      const response = await apiService.get(`/gerente/productos/categorias${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      toast.error('Error al cargar categorías');
      return [];
    }
  },

  /**
   * Obtener producto por ID
   */
  async obtenerPorId(id: string): Promise<any> {
    try {
      const response = await apiService.get(`/gerente/productos/${id}`);
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      toast.error('Error al cargar detalle del producto');
      return null;
    }
  },

  /**
   * Duplicar producto
   */
  async duplicarProducto(id: string, datos?: any): Promise<any> {
    try {
      const response = await apiService.post(`/gerente/productos/${id}/duplicar`, datos || {});
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Producto duplicado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al duplicar producto:', error);
      toast.error('Error al duplicar producto');
      throw error;
    }
  }
};

// ============================================
// FINANZAS
// ============================================

export const finanzasApi = {
  /**
   * Obtener resumen financiero
   */
  async obtenerResumen(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/resumen${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen financiero:', error);
      toast.error('Error al cargar resumen financiero');
      throw error;
    }
  },

  /**
   * Obtener facturas
   */
  async obtenerFacturas(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    cliente_id?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/facturas${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      toast.error('Error al cargar facturas');
      return [];
    }
  },

  /**
   * Obtener cierres de caja
   */
  async obtenerCierresCaja(params?: {
    punto_venta_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/cierres-caja${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener cierres de caja:', error);
      toast.error('Error al cargar cierres de caja');
      return [];
    }
  },

  /**
   * Crear cierre de caja
   */
  async crearCierreCaja(datos: any): Promise<any> {
    try {
      const response = await apiService.post('/gerente/finanzas/cierres-caja', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Cierre de caja creado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear cierre de caja:', error);
      toast.error('Error al crear cierre de caja');
      throw error;
    }
  },

  /**
   * Obtener cuenta de resultados (EBITDA)
   */
  async obtenerCuentaResultados(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    modo_visualizacion?: string;
  }): Promise<any> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/cuenta-resultados${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener cuenta de resultados:', error);
      toast.error('Error al cargar cuenta de resultados');
      return null;
    }
  },

  /**
   * Obtener cobros impagos
   */
  async obtenerImpagos(params?: {
    empresa_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    cliente_id?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/impagos${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener impagos:', error);
      toast.error('Error al cargar cobros impagos');
      return [];
    }
  },

  /**
   * Obtener pagos a proveedores
   */
  async obtenerPagosProveedores(params?: {
    proveedor_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    estado?: string;
  }): Promise<any[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/pagos-proveedores${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos a proveedores:', error);
      toast.error('Error al cargar pagos a proveedores');
      return [];
    }
  },

  /**
   * Registrar pago a proveedor
   */
  async registrarPagoProveedor(datos: {
    proveedor_id: number;
    importe: number;
    fecha_pago: Date;
    metodo_pago: string;
    concepto?: string;
    referencia?: string;
  }): Promise<any> {
    try {
      const response = await apiService.post('/gerente/finanzas/pagos-proveedores', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Pago registrado correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      toast.error('Error al registrar pago a proveedor');
      throw error;
    }
  },

  /**
   * Obtener previsión de tesorería
   */
  async obtenerPrevisionTesoreria(params?: {
    empresa_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<any> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/finanzas/prevision${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return null;
      return response.data;
    } catch (error) {
      console.error('Error al obtener previsión de tesorería:', error);
      toast.error('Error al cargar previsión de tesorería');
      return null;
    }
  }
};

// ============================================
// OPERATIVA - TAREAS
// ============================================

export interface TareaOperativa {
  id: number;
  numero: string;
  tipo: 'operativa' | 'formacion';
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  empresaId: string;
  empresaNombre?: string;
  marcaId?: string;
  marcaNombre?: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  asignadoAId?: number;
  asignadoANombre?: string;
  asignadoPorId?: number;
  asignadoPorNombre?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'aprobada' | 'rechazada' | 'vencida';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  requiereReporte: boolean;
  requiereAprobacion: boolean;
  fechaAsignacion: Date;
  fechaInicio?: Date;
  fechaVencimiento?: Date;
  fechaCompletada?: Date;
  fechaAprobada?: Date;
  recurrente: boolean;
  frecuencia?: string;
  comentarioTrabajador?: string;
  comentarioGerente?: string;
  etiquetas?: string;
  categoria?: string;
  observaciones?: string;
  asignadoA?: {
    id: number;
    nombre: string;
    email: string;
    foto?: string;
    puesto: string;
  };
  asignadoPor?: {
    id: number;
    nombre: string;
  };
}

export interface EstadisticasTareas {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  aprobadas: number;
  rechazadas: number;
  vencidas: number;
  urgentes: number;
  pendientesAprobacion: number;
  requierenReporte: number;
  informativas: number;
  porVencer: number;
}

export interface TrabajadorAsignable {
  id: number;
  nombre: string;
  email: string;
  foto?: string;
  puesto: string;
  puntoVentaId: string;
}

export const operativaApi = {
  /**
   * Obtener tareas operativas
   */
  async obtenerTareas(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    estado?: string;
    asignado_a_id?: number;
    asignado_por_id?: number;
    prioridad?: string;
    pendientes_aprobacion?: boolean;
  }): Promise<TareaOperativa[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/operativa/tareas${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return [];
      // response.data puede ser { success: true, data: [...] } o directamente [...]
      const actualData = response.data?.data || response.data;
      return Array.isArray(actualData) ? actualData : [];
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      toast.error('Error al cargar tareas');
      return [];
    }
  },

  /**
   * Crear tarea operativa
   */
  async crearTarea(datos: {
    titulo: string;
    descripcion: string;
    instrucciones?: string;
    empresa_id: string;
    empresa_nombre?: string;
    punto_venta_id?: string;
    punto_venta_nombre?: string;
    asignado_a_id?: number;
    asignado_a_nombre?: string;
    asignado_por_id?: number;
    asignado_por_nombre?: string;
    prioridad?: string;
    requiere_reporte?: boolean;
    requiere_aprobacion?: boolean;
    fecha_vencimiento?: string;
    recurrente?: boolean;
    frecuencia?: string;
    etiquetas?: string[];
    categoria?: string;
    observaciones?: string;
  }): Promise<TareaOperativa | null> {
    try {
      const response = await apiService.post('/gerente/operativa/tareas', datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Tarea creada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      toast.error('Error al crear tarea');
      return null;
    }
  },

  /**
   * Actualizar tarea
   */
  async actualizarTarea(id: number, datos: Partial<{
    titulo: string;
    descripcion: string;
    instrucciones: string;
    estado: string;
    prioridad: string;
    asignado_a_id: number;
    asignado_a_nombre: string;
    fecha_vencimiento: string;
    observaciones: string;
  }>): Promise<TareaOperativa | null> {
    try {
      const response = await apiService.put(`/gerente/operativa/tareas/${id}`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Tarea actualizada correctamente');
      return response.data;
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar tarea');
      return null;
    }
  },

  /**
   * Eliminar tarea
   */
  async eliminarTarea(id: number): Promise<boolean> {
    try {
      const response = await apiService.delete(`/gerente/operativa/tareas/${id}`);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Tarea eliminada correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      toast.error('Error al eliminar tarea');
      return false;
    }
  },

  /**
   * Completar tarea (trabajador)
   */
  async completarTarea(id: number, datos: {
    comentario?: string;
    evidencia_urls?: string[];
    tiempo_empleado?: number;
  }): Promise<TareaOperativa | null> {
    try {
      const response = await apiService.put(`/gerente/operativa/tareas/${id}/completar`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success('Tarea completada');
      return response.data;
    } catch (error) {
      console.error('Error al completar tarea:', error);
      toast.error('Error al completar tarea');
      return null;
    }
  },

  /**
   * Aprobar o rechazar tarea (gerente)
   */
  async aprobarRechazarTarea(id: number, datos: {
    aprobada: boolean;
    comentario?: string;
    gerente_id?: number;
  }): Promise<TareaOperativa | null> {
    try {
      const response = await apiService.put(`/gerente/operativa/tareas/${id}/aprobar`, datos);
      if (!response.success) throw new Error(response.message || 'Error desconocido');
      toast.success(datos.aprobada ? 'Tarea aprobada' : 'Tarea rechazada');
      return response.data;
    } catch (error) {
      console.error('Error en aprobación:', error);
      toast.error('Error en la aprobación');
      return null;
    }
  },

  /**
   * Obtener estadísticas de tareas
   */
  async obtenerEstadisticas(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
  }): Promise<EstadisticasTareas | null> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/operativa/estadisticas${queryParams ? '?' + queryParams : ''}`);
      if (!response.success) return null;
      // response.data puede ser { success: true, data: {...} } o directamente {...}
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  },

  /**
   * Obtener trabajadores para asignar
   */
  async obtenerTrabajadores(params?: {
    empresa_id?: string;
    punto_venta_id?: string;
  }): Promise<TrabajadorAsignable[]> {
    try {
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const url = `/gerente/operativa/trabajadores${queryParams ? '?' + queryParams : ''}`;
      console.log('🌐 API: Llamando a', url);
      const response = await apiService.get(url);
      console.log('🌐 API: Respuesta trabajadores:', response);
      
      // El apiService envuelve la respuesta, necesitamos extraer correctamente
      if (!response.success) return [];
      
      // response.data puede ser { success: true, data: [...] } o directamente [...]
      const actualData = response.data?.data || response.data;
      console.log('🌐 API: Datos extraídos:', actualData);
      return Array.isArray(actualData) ? actualData : [];
    } catch (error) {
      console.error('Error al obtener trabajadores:', error);
      return [];
    }
  }
};

// ============================================
// 📄 DOCUMENTACIÓN EMPRESARIAL
// ============================================
export const documentacionApi = {
  // --- DOCUMENTOS ---
  obtenerDocumentos: async (params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    categoria?: string;
    estado?: string;
    busqueda?: string;
  }) => {
    try {
      console.log('📥 obtenerDocumentos - Params:', params);
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/documentacion/documentos${queryParams ? '?' + queryParams : ''}`);
      console.log('📥 obtenerDocumentos - Response:', response);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      return [];
    }
  },

  crearDocumento: async (documento: any) => {
    try {
      console.log('📤 crearDocumento - Body:', documento);
      const response = await apiService.post('/gerente/documentacion/documentos', documento);
      console.log('📤 crearDocumento - Response:', response);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al crear documento:', error);
      throw error;
    }
  },

  actualizarDocumento: async (id: number, documento: any) => {
    try {
      console.log('📝 actualizarDocumento - ID:', id, 'Body:', documento);
      const response = await apiService.put(`/gerente/documentacion/documentos/${id}`, documento);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      throw error;
    }
  },

  eliminarDocumento: async (id: number) => {
    try {
      const response = await apiService.delete(`/gerente/documentacion/documentos/${id}`);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  },

  obtenerEstadisticasDocumentos: async (empresaId?: string) => {
    try {
      const queryParams = empresaId ? `?empresa_id=${empresaId}` : '';
      const response = await apiService.get(`/gerente/documentacion/estadisticas${queryParams}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Error al obtener estadísticas documentos:', error);
      return {};
    }
  },

  // Subir archivo
  subirArchivo: async (archivo: File): Promise<{
    url: string;
    nombre: string;
    tamano: number;
    mimeType: string;
  } | null> => {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      
      const response = await fetch('http://localhost:4000/gerente/documentacion/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      throw new Error(result.error || 'Error al subir archivo');
    } catch (error) {
      console.error('Error al subir archivo:', error);
      return null;
    }
  },

  // --- GASTOS ---
  obtenerGastos: async (params?: {
    empresa_id?: string;
    punto_venta_id?: string;
    categoria?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    estado_pago?: string;
  }) => {
    try {
      console.log('📥 obtenerGastos - Params:', params);
      const queryParams = params ? new URLSearchParams(params as any).toString() : '';
      const response = await apiService.get(`/gerente/documentacion/gastos${queryParams ? '?' + queryParams : ''}`);
      console.log('📥 obtenerGastos - Response:', response);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      return [];
    }
  },

  crearGasto: async (gasto: any) => {
    try {
      console.log('📤 crearGasto - Body:', gasto);
      const response = await apiService.post('/gerente/documentacion/gastos', gasto);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al crear gasto:', error);
      throw error;
    }
  },

  actualizarGasto: async (id: number, gasto: any) => {
    try {
      const response = await apiService.put(`/gerente/documentacion/gastos/${id}`, gasto);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      throw error;
    }
  },

  eliminarGasto: async (id: number) => {
    try {
      const response = await apiService.delete(`/gerente/documentacion/gastos/${id}`);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      throw error;
    }
  },

  obtenerResumenGastos: async (params?: { empresa_id?: string; mes?: number; anio?: number }) => {
    try {
      const queryParams = params ? new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString() : '';
      const response = await apiService.get(`/gerente/documentacion/gastos/resumen${queryParams ? '?' + queryParams : ''}`);
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('Error al obtener resumen gastos:', error);
      return {};
    }
  },

  // --- CALENDARIO DE PAGOS ---
  obtenerPagosCalendario: async (params?: {
    empresa_id?: string;
    mes?: number;
    anio?: number;
    estado_pago?: string;
  }) => {
    try {
      console.log('📥 obtenerPagosCalendario - Params:', params);
      const queryParams = params ? new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString() : '';
      const response = await apiService.get(`/gerente/documentacion/pagos-calendario${queryParams ? '?' + queryParams : ''}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error al obtener pagos calendario:', error);
      return [];
    }
  },

  crearPagoCalendario: async (pago: any) => {
    try {
      console.log('📤 crearPagoCalendario - Body:', pago);
      const response = await apiService.post('/gerente/documentacion/pagos-calendario', pago);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al crear pago calendario:', error);
      throw error;
    }
  },

  actualizarPagoCalendario: async (id: number, pago: any) => {
    try {
      const response = await apiService.put(`/gerente/documentacion/pagos-calendario/${id}`, pago);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al actualizar pago calendario:', error);
      throw error;
    }
  },

  eliminarPagoCalendario: async (id: number) => {
    try {
      const response = await apiService.delete(`/gerente/documentacion/pagos-calendario/${id}`);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al eliminar pago calendario:', error);
      throw error;
    }
  },

  marcarPagoPagado: async (id: number, data?: { metodo_pago?: string; observaciones?: string }) => {
    try {
      const response = await apiService.put(`/gerente/documentacion/pagos-calendario/${id}/pagar`, data);
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error('Error al marcar pago como pagado:', error);
      throw error;
    }
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  dashboard: dashboardGerenteApi,
  empleados: empleadosApi,
  horarios: horariosApi,
  stock: stockApi,
  productos: productosGerenteApi,
  finanzas: finanzasApi,
  operativa: operativaApi,
  documentacion: documentacionApi
};
