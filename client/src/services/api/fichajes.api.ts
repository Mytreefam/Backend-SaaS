/**
 * 👷 API CLIENT - FICHAJES
 * 
 * Gestión de fichajes del trabajador
 */

import { envelopedFetch } from '../http/envelopedFetch';

function getLocalRole(): string | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.role === 'string' ? parsed.role : null;
  } catch {
    return null;
  }
}

function useGerenteEndpoints(): boolean {
  return getLocalRole() === 'gerente';
}

// ============================================================================
// TIPOS
// ============================================================================

export interface Fichaje {
  id: number;
  empleadoId: number;
  tipo: 'entrada' | 'salida' | 'pausa' | 'reanudacion';
  fecha: string;
  hora: string;
  ubicacion?: string;
  notas?: string;
  empleado?: {
    id: number;
    nombre: string;
  };
}

export interface FichajeCreate {
  empleadoId: number;
  tipo: 'entrada' | 'salida' | 'pausa' | 'reanudacion';
  puntoVentaId?: string;
  ubicacion?: string;
  notas?: string;
}

export interface EstadoFichaje {
  enTurno: boolean;
  horaEntrada?: string;
  tiempoTrabajado: number; // en segundos
  pausado: boolean;
}

export interface EstadoFichajeDetallado extends EstadoFichaje {
  empleadoId?: number;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const fichajesApi = {
  /**
   * Obtener todos los fichajes del empleado
   */
  async getByEmpleadoId(empleadoId: number): Promise<Fichaje[]> {
    try {
      const response = useGerenteEndpoints()
        ? await envelopedFetch<Fichaje[]>(`/gerente/empleados/${empleadoId}/fichajes`, { method: 'GET' })
        : await envelopedFetch<Fichaje[]>(`/trabajador/fichajes`, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener fichajes:', error);
      return [];
    }
  },

  /**
   * Obtener fichajes del día actual
   */
  async getFichajesHoy(empleadoId: number): Promise<Fichaje[]> {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const url = useGerenteEndpoints()
        ? `/gerente/empleados/${empleadoId}/fichajes?fecha=${hoy}`
        : `/trabajador/fichajes?fecha=${hoy}`;
      const response = await envelopedFetch<Fichaje[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener fichajes de hoy:', error);
      return [];
    }
  },

  /**
   * Registrar fichaje (entrada, salida, pausa, reanudación)
   */
  async registrar(data: FichajeCreate): Promise<Fichaje | null> {
    try {
      const url = useGerenteEndpoints() ? '/gerente/empleados/fichajes' : '/trabajador/fichajes';
      const response = await envelopedFetch<Fichaje>(url, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          puntoVentaId: data.puntoVentaId,
          // keep legacy fields for gerente endpoint, worker endpoint also accepts
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toTimeString().split(' ')[0],
        }),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al registrar fichaje:', error);
      return null;
    }
  },

  /**
   * Obtener estado de fichaje actual del empleado
   */
  async getEstadoActual(empleadoId: number): Promise<EstadoFichaje> {
    try {
      const fichajesHoy = await this.getFichajesHoy(empleadoId);
      
      // Calcular estado basado en fichajes del día
      let enTurno = false;
      let horaEntrada: string | undefined;
      let tiempoTrabajado = 0;
      let pausado = false;
      
      for (const fichaje of fichajesHoy) {
        if (fichaje.tipo === 'entrada') {
          enTurno = true;
          horaEntrada = fichaje.hora;
        } else if (fichaje.tipo === 'salida') {
          enTurno = false;
        } else if (fichaje.tipo === 'pausa') {
          pausado = true;
        } else if (fichaje.tipo === 'reanudacion') {
          pausado = false;
        }
      }
      
      // Calcular tiempo trabajado si está en turno
      if (enTurno && horaEntrada) {
        const [h, m, s] = horaEntrada.split(':').map(Number);
        const entrada = new Date();
        entrada.setHours(h, m, s || 0);
        tiempoTrabajado = Math.floor((Date.now() - entrada.getTime()) / 1000);
      }
      
      return { enTurno, horaEntrada, tiempoTrabajado, pausado };
    } catch (error) {
      console.error('Error al obtener estado de fichaje:', error);
      return { enTurno: false, tiempoTrabajado: 0, pausado: false };
    }
  },

  /**
   * Estado actual (detallado) del trabajador autenticado.
   * Para trabajador usa endpoint backend; para gerente deriva desde fichajes de hoy.
   */
  async getEstadoDetallado(empleadoId: number): Promise<EstadoFichajeDetallado> {
    try {
      if (!useGerenteEndpoints()) {
        const res = await envelopedFetch<EstadoFichajeDetallado>('/trabajador/fichajes/estado', { method: 'GET' });
        return (
          res.data.data ?? {
            enTurno: false,
            tiempoTrabajado: 0,
            pausado: false,
          }
        );
      }

      const base = await this.getEstadoActual(empleadoId);
      const fichajesHoy = await this.getFichajesHoy(empleadoId);
      const lastEntrada = [...fichajesHoy].reverse().find((f) => f.tipo === 'entrada');
      return {
        ...base,
        empleadoId,
        puntoVentaId: (lastEntrada as any)?.puntoVentaId,
        puntoVentaNombre: undefined,
      };
    } catch (error) {
      console.error('Error al obtener estado de fichaje detallado:', error);
      return { enTurno: false, tiempoTrabajado: 0, pausado: false };
    }
  },

  /**
   * Fichar entrada
   */
  async ficharEntrada(empleadoId: number, ubicacion?: string): Promise<Fichaje | null> {
    return this.registrar({
      empleadoId,
      tipo: 'entrada',
      ubicacion,
    });
  },

  /**
   * Fichar salida
   */
  async ficharSalida(empleadoId: number, ubicacion?: string): Promise<Fichaje | null> {
    return this.registrar({
      empleadoId,
      tipo: 'salida',
      ubicacion,
    });
  },

  /**
   * Pausar turno
   */
  async pausar(empleadoId: number): Promise<Fichaje | null> {
    return this.registrar({
      empleadoId,
      tipo: 'pausa',
    });
  },

  /**
   * Reanudar turno
   */
  async reanudar(empleadoId: number): Promise<Fichaje | null> {
    return this.registrar({
      empleadoId,
      tipo: 'reanudacion',
    });
  },
};
