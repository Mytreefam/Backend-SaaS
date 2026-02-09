/**
 * 👷 API CLIENT - TAREAS TRABAJADOR
 * 
 * Gestión de tareas del trabajador conectada al backend
 */

import { envelopedFetch } from '../http/envelopedFetch';

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
      const response = await envelopedFetch<TareaTrabajador[]>(
        `/gerente/operativa/tareas?empleadoId=${empleadoId}`,
        { method: 'GET' },
      );
      return response.data.data ?? [];
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      console.error('Error al obtener tareas:', error);

      // Si no existe endpoint, devolver array vacío
      if (message.includes('No encontrado') || message.includes('NOT_FOUND')) {
        return [];
      }

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
      const response = await envelopedFetch<TareaTrabajador>('/gerente/operativa/tareas', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          estado: 'pendiente',
          fechaCreacion: new Date().toISOString(),
        }),
      });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<TareaTrabajador>(`/gerente/operativa/tareas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<TareaTrabajador>(`/gerente/operativa/tareas/${id}/completar`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'completada' }),
      });
      return response.data.data ?? null;
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
      await envelopedFetch<unknown>(`/gerente/operativa/tareas/${id}`, { method: 'DELETE' });
      return true;
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
