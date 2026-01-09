/**
 * 👷 API CLIENT - TAREAS TRABAJADOR
 * 
 * Gestión de tareas del trabajador conectada al backend
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

// ============================================================================
// TIPOS
// ============================================================================

export interface TareaTrabajador {
  id: number;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'alta' | 'media' | 'baja';
  tipo: 'operativa' | 'administrativa' | 'limpieza' | 'inventario' | 'otra';
  empleadoId: number;
  empresaId: number;
  fechaCreacion: string;
  fechaLimite?: string;
  fechaCompletada?: string;
  notas?: string;
  empleado?: {
    id: number;
    nombre: string;
  };
}

export interface TareaCreate {
  titulo: string;
  descripcion?: string;
  prioridad?: 'alta' | 'media' | 'baja';
  tipo?: 'operativa' | 'administrativa' | 'limpieza' | 'inventario' | 'otra';
  empleadoId: number;
  fechaLimite?: string;
}

export interface TareaUpdate {
  titulo?: string;
  descripcion?: string;
  estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad?: 'alta' | 'media' | 'baja';
  notas?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const tareasApi = {
  /**
   * Obtener todas las tareas del empleado
   */
  async getByEmpleadoId(empleadoId: number): Promise<TareaTrabajador[]> {
    try {
      const response = await fetch(buildUrl(`/gerente/operativa/tareas?empleadoId=${empleadoId}`), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        // Si no existe endpoint, devolver array vacío
        if (response.status === 404) {
          return [];
        }
        throw new Error('Error al obtener tareas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      // Fallback a localStorage mientras se implementa backend
      return this.getFromLocalStorage(empleadoId);
    }
  },

  /**
   * Obtener tareas pendientes del día
   */
  async getTareasHoy(empleadoId: number): Promise<TareaTrabajador[]> {
    try {
      const tareas = await this.getByEmpleadoId(empleadoId);
      const hoy = new Date().toISOString().split('T')[0];
      
      return tareas.filter(t => 
        t.estado !== 'completada' && 
        t.estado !== 'cancelada' &&
        (!t.fechaLimite || t.fechaLimite >= hoy)
      );
    } catch (error) {
      console.error('Error al obtener tareas de hoy:', error);
      return [];
    }
  },

  /**
   * Crear nueva tarea
   */
  async create(data: TareaCreate): Promise<TareaTrabajador | null> {
    try {
      const response = await fetch(buildUrl('/gerente/operativa/tareas'), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          ...data,
          estado: 'pendiente',
          fechaCreacion: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear tarea');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear tarea:', error);
      return null;
    }
  },

  /**
   * Actualizar tarea
   */
  async update(id: number, data: TareaUpdate): Promise<TareaTrabajador | null> {
    try {
      const response = await fetch(buildUrl(`/gerente/operativa/tareas/${id}`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar tarea');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      return null;
    }
  },

  /**
   * Completar tarea
   */
  async completar(id: number): Promise<TareaTrabajador | null> {
    try {
      const response = await fetch(buildUrl(`/gerente/operativa/tareas/${id}/completar`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ estado: 'completada' }),
      });

      if (!response.ok) {
        throw new Error('Error al completar tarea');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al completar tarea:', error);
      return null;
    }
  },

  /**
   * Iniciar tarea (marcar como en progreso)
   */
  async iniciar(id: number): Promise<TareaTrabajador | null> {
    return this.update(id, {
      estado: 'en_progreso',
    });
  },

  /**
   * Cancelar tarea
   */
  async cancelar(id: number): Promise<TareaTrabajador | null> {
    return this.update(id, {
      estado: 'cancelada',
    });
  },

  /**
   * Eliminar tarea
   */
  async delete(id: number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/gerente/operativa/tareas/${id}`), {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      return false;
    }
  },

  // ========================================
  // FALLBACK - LocalStorage (temporal)
  // ========================================
  
  getFromLocalStorage(empleadoId: number): TareaTrabajador[] {
    try {
      const storedTareas = localStorage.getItem('tareas_trabajador');
      if (storedTareas) {
        const tareas: TareaTrabajador[] = JSON.parse(storedTareas);
        return tareas.filter(t => t.empleadoId === empleadoId);
      }
    } catch (e) {
      console.warn('Error al leer tareas de localStorage:', e);
    }
    return [];
  },
};
