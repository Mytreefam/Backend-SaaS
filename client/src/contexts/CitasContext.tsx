/**
 * 📅 CONTEXTO DE CITAS
 * Estado compartido del sistema de citas entre todos los perfiles
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { citasAPIService } from '../services/citasAPI.service';
import { citasService } from '../services/citas.service';
import type { 
  Cita, 
  ConfiguracionCitas, 
  SolicitudCita, 
  FiltrosCitas,
  DisponibilidadDia,
  EstadisticasCitas
} from '../types/cita.types';

// ============================================
// TIPOS DEL CONTEXTO
// ============================================

interface CitasContextType {
  // Estado
  citas: Cita[];
  citasPendientes: number;
  citasConfirmadas: number;
  
  // Configuración
  configuracion: ConfiguracionCitas | null;
  
  // CRUD Citas
  crearCita: (solicitud: SolicitudCita, clienteNombre: string) => Promise<{ exito: boolean; cita?: Cita; error?: string }>;
  obtenerCitas: (filtros?: FiltrosCitas) => Cita[];
  obtenerCitaPorId: (id: string) => Cita | null;
  confirmarCita: (citaId: string, trabajadorId: string, trabajadorNombre: string) => Promise<{ exito: boolean; error?: string }>;
  cancelarCita: (citaId: string, motivo: string, canceladoPor: string) => Promise<boolean>;
  actualizarEstadoCita: (citaId: string, estado: Cita['estado'], usuarioId: string) => Promise<boolean>;
  
  // Configuración
  cargarConfiguracion: (puntoVentaId: string) => void;
  guardarConfiguracion: (config: ConfiguracionCitas) => void;
  
  // Disponibilidad
  obtenerDisponibilidad: (fecha: string, puntoVentaId: string) => DisponibilidadDia;
  
  // Estadísticas
  obtenerEstadisticas: (filtros?: FiltrosCitas) => EstadisticasCitas;
  
  // Verificación de cita confirmada
  tieneCitaConfirmada: (clienteId: string) => boolean;
  obtenerProximaCitaConfirmada: (clienteId: string) => Cita | null;
  
  // Refrescar datos
  refrescar: () => void;
}

const CitasContext = createContext<CitasContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface CitasProviderProps {
  children: ReactNode;
}

export function CitasProvider({ children }: CitasProviderProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionCitas | null>(null);
  const [citasPendientes, setCitasPendientes] = useState(0);
  const [citasConfirmadas, setCitasConfirmadas] = useState(0);

  // Cargar citas desde el servidor
  const cargarCitas = useCallback(async () => {
    try {
      console.log('🔄 Cargando citas desde servidor...');
      const todasLasCitas = await citasAPIService.obtenerCitas();
      setCitas(todasLasCitas);
      
      // Actualizar contadores
      const pendientes = todasLasCitas.filter(c => c.estado === 'solicitada').length;
      const confirmadas = todasLasCitas.filter(c => c.estado === 'confirmada').length;
      
      setCitasPendientes(pendientes);
      setCitasConfirmadas(confirmadas);
      
      console.log('✅ Citas cargadas:', todasLasCitas.length);
    } catch (error) {
      console.error('❌ Error cargando citas:', error);
    }
  }, []);

  useEffect(() => {
    cargarCitas();
    
    // Recargar cada 30 segundos
    const interval = setInterval(() => {
      cargarCitas();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [cargarCitas]);

  // ============================================
  // CRUD CITAS
  // ============================================

  const crearCita = useCallback(async (solicitud: SolicitudCita, clienteNombre: string) => {
    try {
      // Transformar al formato que espera el backend
      const payload = {
        fecha: solicitud.fecha,
        hora: solicitud.horaInicio,
        motivo: solicitud.mensaje || solicitud.servicioId || 'Cita general',
        servicio: solicitud.servicioId || 'Servicio general',
        clienteId: parseInt(String(solicitud.clienteId), 10), // Asegurar que sea número
        notas: solicitud.mensaje,
      };
      
      console.log('📅 Creando cita con payload:', payload);
      const cita = await citasAPIService.crearCita(payload as any);
      
      if (cita) {
        await cargarCitas();
        return { exito: true, cita };
      }
      
      return { exito: false, error: 'No se pudo crear la cita' };
    } catch (error: any) {
      return { exito: false, error: error.message || 'Error al crear cita' };
    }
  }, [cargarCitas]);

  const obtenerCitas = useCallback((filtros?: FiltrosCitas): Cita[] => {
    // Filtrar desde el estado local (ya cargado)
    console.log('📊 CitasContext.obtenerCitas - Total citas en estado:', citas.length);
    console.log('📊 CitasContext.obtenerCitas - Citas:', citas);
    console.log('📊 CitasContext.obtenerCitas - Filtros:', filtros);
    
    let citasFiltradas = [...citas];
    
    if (filtros) {
      if (filtros.clienteId) {
        console.log('📊 Filtrando por clienteId:', filtros.clienteId, 'tipo:', typeof filtros.clienteId);
        citas.forEach(c => {
          console.log('📊 Cita clienteId:', c.clienteId, 'tipo:', typeof c.clienteId, 'match:', String(c.clienteId) === String(filtros.clienteId));
        });
        citasFiltradas = citasFiltradas.filter(c => String(c.clienteId) === String(filtros.clienteId));
      }
      if (filtros.estado) {
        citasFiltradas = citasFiltradas.filter(c => c.estado === filtros.estado);
      }
      if (filtros.servicio) {
        citasFiltradas = citasFiltradas.filter(c => c.servicioNombre === filtros.servicio);
      }
    }
    
    console.log('📊 Citas filtradas resultado:', citasFiltradas.length);
    return citasFiltradas;
  }, [citas]);

  const obtenerCitaPorId = useCallback((id: string): Cita | null => {
    return citas.find(c => String(c.id) === String(id)) || null;
  }, [citas]);

  const confirmarCita = useCallback(async (citaId: string, trabajadorId: string, trabajadorNombre: string) => {
    try {
      const cita = await citasAPIService.confirmarCita(citaId);
      
      if (cita) {
        await cargarCitas();
        return { exito: true };
      }
      
      return { exito: false, error: 'No se pudo confirmar la cita' };
    } catch (error: any) {
      return { exito: false, error: error.message || 'Error al confirmar cita' };
    }
  }, [cargarCitas]);

  const cancelarCita = useCallback(async (citaId: string, motivo: string, canceladoPor: string) => {
    try {
      const cita = await citasAPIService.cancelarCita(citaId, canceladoPor, motivo);
      
      if (cita) {
        await cargarCitas();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      return false;
    }
  }, [cargarCitas]);

  const actualizarEstadoCita = useCallback(async (citaId: string, estado: Cita['estado'], usuarioId: string) => {
    try {
      const cita = await citasAPIService.cambiarEstado(citaId, { estado });
      
      if (cita) {
        await cargarCitas();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return false;
    }
  }, [cargarCitas]);

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  const cargarConfiguracion = useCallback((puntoVentaId: string) => {
    const config = citasService.getConfiguracion(puntoVentaId);
    setConfiguracion(config);
  }, []);

  const guardarConfiguracion = useCallback((config: ConfiguracionCitas) => {
    citasService.saveConfiguracion(config);
    setConfiguracion(config);
  }, []);

  // ============================================
  // DISPONIBILIDAD
  // ============================================

  const obtenerDisponibilidad = useCallback((fecha: string, puntoVentaId: string): DisponibilidadDia => {
    // Retornar disponibilidad vacía por ahora (puede ser mejorado después)
    return {
      fecha,
      slots: [],
      cupos: 0,
      disponibles: 0
    };
  }, []);

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  const obtenerEstadisticas = useCallback(async (filtros?: FiltrosCitas) => {
    return await citasAPIService.obtenerEstadisticas(filtros);
  }, []);

  // ============================================
  // VERIFICACIÓN CITA CONFIRMADA
  // ============================================

  const tieneCtaConfirmada = useCallback((clienteId: string) => {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    
    const citasConfirmadasCliente = citas.filter(c => 
      c.clienteId === clienteId &&
      c.estado === 'confirmada' &&
      c.fecha >= hoy
    );
    
    return citasConfirmadasCliente.length > 0;
  }, [citas]);

  const obtenerProximaCitaConfirmada = useCallback((clienteId: string) => {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    
    const citasConfirmadasCliente = citas
      .filter(c => 
        c.clienteId === clienteId &&
        c.estado === 'confirmada' &&
        c.fecha >= hoy
      )
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
        const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
        return fechaA.getTime() - fechaB.getTime();
      });
    
    return citasConfirmadasCliente[0] || null;
  }, [citas]);

  // ============================================
  // REFRESCAR
  // ============================================

  const refrescar = useCallback(() => {
    cargarCitas();
  }, [cargarCitas]);

  // ============================================
  // VALUE
  // ============================================

  const value: CitasContextType = {
    citas,
    citasPendientes,
    citasConfirmadas,
    configuracion,
    crearCita,
    obtenerCitas,
    obtenerCitaPorId,
    confirmarCita,
    cancelarCita,
    actualizarEstadoCita,
    cargarConfiguracion,
    guardarConfiguracion,
    obtenerDisponibilidad,
    obtenerEstadisticas,
    tieneCtaConfirmada,
    obtenerProximaCitaConfirmada,
    refrescar
  };

  return (
    <CitasContext.Provider value={value}>
      {children}
    </CitasContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useCitas() {
  const context = useContext(CitasContext);
  
  if (context === undefined) {
    throw new Error('useCitas debe usarse dentro de CitasProvider');
  }
  
  return context;
}
