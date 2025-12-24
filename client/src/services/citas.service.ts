/**
 * 📅 SERVICIO DE CITAS
 * Gestión completa del sistema de reservas/citas - VERSIÓN HTTP
 */

import { toast } from 'sonner@2.0.3';
import { apiService } from './api.service';
import type {
  Cita,
  ConfiguracionCitas,
  SolicitudCita,
  ResultadoCrearCita,
  ResultadoConfirmarCita,
  FiltrosCitas,
  DisponibilidadDia,
  SlotDisponibilidad,
  EstadisticasCitas,
  ServicioCita,
  HorarioDisponibilidad
} from '../types/cita.types';

// ============================================
// CONFIGURACIÓN API
// ============================================

const API_BASE = '/api/citas';

// ============================================
// CONFIGURACIÓN POR DEFECTO
// ============================================

const CONFIGURACION_DEFECTO: Omit<ConfiguracionCitas, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'actualizadoPor'> = {
  puntoVentaId: 'PDV-001',
  empresaId: 'EMP-001',
  marcaId: 'MARCA-001',
  habilitado: true,
  intervaloMinutos: 30,
  capacidadSimultanea: 2,
  anticipacionMinimaDias: 1,
  anticipacionMaximaDias: 30,
  notificarNuevaCita: true,
  notificarRecordatorio: true,
  horasAntesRecordatorio: 24,
  
  horarios: [
    { diaSemana: 1, nombreDia: 'Lunes', habilitado: true, horaInicio: '09:00', horaFin: '18:00', descansoInicio: '14:00', descansoFin: '15:00' },
    { diaSemana: 2, nombreDia: 'Martes', habilitado: true, horaInicio: '09:00', horaFin: '18:00', descansoInicio: '14:00', descansoFin: '15:00' },
    { diaSemana: 3, nombreDia: 'Miércoles', habilitado: true, horaInicio: '09:00', horaFin: '18:00', descansoInicio: '14:00', descansoFin: '15:00' },
    { diaSemana: 4, nombreDia: 'Jueves', habilitado: true, horaInicio: '09:00', horaFin: '18:00', descansoInicio: '14:00', descansoFin: '15:00' },
    { diaSemana: 5, nombreDia: 'Viernes', habilitado: true, horaInicio: '09:00', horaFin: '18:00', descansoInicio: '14:00', descansoFin: '15:00' },
    { diaSemana: 6, nombreDia: 'Sábado', habilitado: true, horaInicio: '10:00', horaFin: '14:00' },
    { diaSemana: 0, nombreDia: 'Domingo', habilitado: false, horaInicio: '00:00', horaFin: '00:00' }
  ],
  
  servicios: [
    { id: 'SRV-001', nombre: 'Consulta General', descripcion: 'Consulta o asesoramiento general', duracionMinutos: 30, habilitado: true, color: '#3B82F6', icono: 'MessageCircle', orden: 1 },
    { id: 'SRV-002', nombre: 'Recogida de Pedido', descripcion: 'Recoger pedido preparado', duracionMinutos: 15, habilitado: true, color: '#10B981', icono: 'Package', orden: 2 },
    { id: 'SRV-003', nombre: 'Asesoramiento Personalizado', descripcion: 'Asesoramiento detallado sobre productos', duracionMinutos: 45, habilitado: true, color: '#F59E0B', icono: 'Lightbulb', orden: 3 },
    { id: 'SRV-004', nombre: 'Servicio Técnico', descripcion: 'Revisión o reparación técnica', duracionMinutos: 60, habilitado: true, color: '#EF4444', icono: 'Wrench', orden: 4 }
  ]
};

// ============================================
// GESTIÓN DE STORAGE
// ============================================

class CitasStorage {
  private getCitas(): Cita[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CITAS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error leyendo citas:', error);
      return [];
    }
  }

  private saveCitas(citas: Cita[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(citas));
    } catch (error) {
      console.error('Error guardando citas:', error);
      throw new Error('No se pudo guardar la cita');
    }
  }

  private getContador(): number {
    try {
      const contador = localStorage.getItem(STORAGE_KEYS.CONTADOR);
      return contador ? parseInt(contador, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  private incrementarContador(): number {
    const contador = this.getContador() + 1;
    localStorage.setItem(STORAGE_KEYS.CONTADOR, contador.toString());
    return contador;
  }

  getConfiguracion(puntoVentaId: string): ConfiguracionCitas {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIGURACION);
      const configs: ConfiguracionCitas[] = data ? JSON.parse(data) : [];
      
      let config = configs.find(c => c.puntoVentaId === puntoVentaId);
      
      if (!config) {
        // Crear configuración por defecto
        config = {
          ...CONFIGURACION_DEFECTO,
          id: `CONFIG-${Date.now()}`,
          puntoVentaId,
          fechaCreacion: new Date().toISOString(),
          fechaActualizacion: new Date().toISOString(),
          actualizadoPor: 'Sistema'
        };
        
        configs.push(config);
        localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(configs));
      }
      
      return config;
    } catch (error) {
      console.error('Error leyendo configuración:', error);
      return {
        ...CONFIGURACION_DEFECTO,
        id: 'CONFIG-DEFAULT',
        puntoVentaId,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        actualizadoPor: 'Sistema'
      };
    }
  }

  saveConfiguracion(config: ConfiguracionCitas): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIGURACION);
      const configs: ConfiguracionCitas[] = data ? JSON.parse(data) : [];
      
      const index = configs.findIndex(c => c.id === config.id);
      
      if (index >= 0) {
        configs[index] = { ...config, fechaActualizacion: new Date().toISOString() };
      } else {
        configs.push(config);
      }
      
      localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(configs));
    } catch (error) {
      console.error('Error guardando configuración:', error);
      throw new Error('No se pudo guardar la configuración');
    }
  }

  // CRUD Citas
  
  crear(solicitud: SolicitudCita, clienteNombre: string): ResultadoCrearCita {
    try {
      const citas = this.getCitas();
      const config = this.getConfiguracion(solicitud.puntoVentaId);
      
      // Validar disponibilidad
      if (!config.habilitado) {
        return {
          exito: false,
          error: 'El sistema de citas está deshabilitado temporalmente'
        };
      }
      
      // Obtener servicio
      const servicio = config.servicios.find(s => s.id === solicitud.servicioId);
      if (!servicio || !servicio.habilitado) {
        return {
          exito: false,
          error: 'El servicio seleccionado no está disponible'
        };
      }
      
      // Calcular hora fin
      const [horaH, horaM] = solicitud.horaInicio.split(':').map(Number);
      const minutosTotales = horaH * 60 + horaM + servicio.duracionMinutos;
      const horaFin = `${Math.floor(minutosTotales / 60).toString().padStart(2, '0')}:${(minutosTotales % 60).toString().padStart(2, '0')}`;
      
      // Verificar disponibilidad del slot
      const disponibilidad = this.obtenerDisponibilidadDia(solicitud.fecha, solicitud.puntoVentaId);
      const slot = disponibilidad.slots.find(s => s.horaInicio === solicitud.horaInicio);
      
      if (!slot || !slot.disponible) {
        return {
          exito: false,
          error: 'El horario seleccionado ya no está disponible'
        };
      }
      
      // Crear cita
      const contador = this.incrementarContador();
      const numero = `CITA-${contador.toString().padStart(4, '0')}`;
      
      const nuevaCita: Cita = {
        id: `CITA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        numero,
        clienteId: solicitud.clienteId,
        clienteNombre,
        servicioId: servicio.id,
        servicioNombre: servicio.nombre,
        servicioDuracion: servicio.duracionMinutos,
        fecha: solicitud.fecha,
        horaInicio: solicitud.horaInicio,
        horaFin,
        puntoVentaId: solicitud.puntoVentaId,
        puntoVentaNombre: 'Punto de Venta', // TODO: Obtener nombre real
        empresaId: config.empresaId,
        marcaId: config.marcaId,
        estado: 'solicitada',
        prioridad: 'normal',
        mensaje: solicitud.mensaje,
        archivosAdjuntos: [], // TODO: Procesar archivos
        notificacionEnviada: false,
        recordatorioEnviado: false,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        creadoPor: solicitud.clienteId
      };
      
      citas.push(nuevaCita);
      this.saveCitas(citas);
      
      // Notificar
      if (config.notificarNuevaCita) {
        this.notificarNuevaCita(nuevaCita);
      }
      
      return {
        exito: true,
        cita: nuevaCita,
        mensaje: `Cita ${numero} creada correctamente`
      };
      
    } catch (error: any) {
      console.error('Error creando cita:', error);
      return {
        exito: false,
        error: error.message || 'Error al crear la cita'
      };
    }
  }

  obtenerPorId(id: string): Cita | null {
    const citas = this.getCitas();
    return citas.find(c => c.id === id) || null;
  }

  obtenerCitas(filtros: FiltrosCitas = {}): Cita[] {
    let citas = this.getCitas();
    
    if (filtros.clienteId) {
      citas = citas.filter(c => c.clienteId === filtros.clienteId);
    }
    
    if (filtros.trabajadorId) {
      citas = citas.filter(c => c.trabajadorAsignadoId === filtros.trabajadorId);
    }
    
    if (filtros.puntoVentaId) {
      citas = citas.filter(c => c.puntoVentaId === filtros.puntoVentaId);
    }
    
    if (filtros.estado) {
      if (Array.isArray(filtros.estado)) {
        citas = citas.filter(c => filtros.estado!.includes(c.estado));
      } else {
        citas = citas.filter(c => c.estado === filtros.estado);
      }
    }
    
    if (filtros.fechaDesde) {
      citas = citas.filter(c => c.fecha >= filtros.fechaDesde!);
    }
    
    if (filtros.fechaHasta) {
      citas = citas.filter(c => c.fecha <= filtros.fechaHasta!);
    }
    
    if (filtros.servicioId) {
      citas = citas.filter(c => c.servicioId === filtros.servicioId);
    }
    
    // Ordenar por fecha y hora más reciente primero
    return citas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
      const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
      return fechaB.getTime() - fechaA.getTime();
    });
  }

  confirmar(citaId: string, trabajadorId: string, trabajadorNombre: string): ResultadoConfirmarCita {
    try {
      const citas = this.getCitas();
      const index = citas.findIndex(c => c.id === citaId);
      
      if (index === -1) {
        return {
          exito: false,
          error: 'Cita no encontrada'
        };
      }
      
      const cita = citas[index];
      
      if (cita.estado !== 'solicitada') {
        return {
          exito: false,
          error: 'La cita ya ha sido procesada'
        };
      }
      
      citas[index] = {
        ...cita,
        estado: 'confirmada',
        trabajadorAsignadoId: trabajadorId,
        trabajadorAsignadoNombre: trabajadorNombre,
        confirmadaPor: trabajadorId,
        fechaConfirmacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      
      this.saveCitas(citas);
      
      // Notificar al cliente
      this.notificarConfirmacion(citas[index]);
      
      return {
        exito: true,
        cita: citas[index],
        trabajadorAsignado: trabajadorNombre
      };
      
    } catch (error: any) {
      return {
        exito: false,
        error: error.message || 'Error al confirmar la cita'
      };
    }
  }

  cancelar(citaId: string, motivo: string, canceladoPor: string): boolean {
    try {
      const citas = this.getCitas();
      const index = citas.findIndex(c => c.id === citaId);
      
      if (index === -1) {
        return false;
      }
      
      citas[index] = {
        ...citas[index],
        estado: 'cancelada',
        motivoCancelacion: motivo,
        canceladaPor,
        fechaCancelacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      
      this.saveCitas(citas);
      
      // Notificar cancelación
      this.notificarCancelacion(citas[index]);
      
      return true;
    } catch (error) {
      console.error('Error cancelando cita:', error);
      return false;
    }
  }

  actualizarEstado(citaId: string, nuevoEstado: Cita['estado'], usuarioId: string): boolean {
    try {
      const citas = this.getCitas();
      const index = citas.findIndex(c => c.id === citaId);
      
      if (index === -1) {
        return false;
      }
      
      citas[index] = {
        ...citas[index],
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString()
      };
      
      this.saveCitas(citas);
      
      return true;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      return false;
    }
  }

  // DISPONIBILIDAD
  
  obtenerDisponibilidadDia(fecha: string, puntoVentaId: string): DisponibilidadDia {
    const config = this.getConfiguracion(puntoVentaId);
    const fechaObj = new Date(fecha + 'T00:00:00');
    const diaSemana = fechaObj.getDay();
    
    const horario = config.horarios.find(h => h.diaSemana === diaSemana);
    
    if (!horario || !horario.habilitado) {
      return {
        fecha,
        diaSemana,
        habilitado: false,
        slots: []
      };
    }
    
    // Generar slots
    const slots: SlotDisponibilidad[] = [];
    const intervalo = config.intervaloMinutos;
    
    // Convertir horas a minutos
    const [horaInicioH, horaInicioM] = horario.horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = horario.horaFin.split(':').map(Number);
    
    let descansoInicioMin: number | null = null;
    let descansoFinMin: number | null = null;
    
    if (horario.descansoInicio && horario.descansoFin) {
      const [dInicioH, dInicioM] = horario.descansoInicio.split(':').map(Number);
      const [dFinH, dFinM] = horario.descansoFin.split(':').map(Number);
      descansoInicioMin = dInicioH * 60 + dInicioM;
      descansoFinMin = dFinH * 60 + dFinM;
    }
    
    const inicioMin = horaInicioH * 60 + horaInicioM;
    const finMin = horaFinH * 60 + horaFinM;
    
    // Obtener citas del día
    const citasDelDia = this.getCitas().filter(c => 
      c.fecha === fecha && 
      c.puntoVentaId === puntoVentaId &&
      c.estado !== 'cancelada'
    );
    
    // Generar slots
    for (let min = inicioMin; min < finMin; min += intervalo) {
      const horaInicio = `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`;
      const horaFin = `${Math.floor((min + intervalo) / 60).toString().padStart(2, '0')}:${((min + intervalo) % 60).toString().padStart(2, '0')}`;
      
      // Saltar slots en horario de descanso
      if (descansoInicioMin !== null && descansoFinMin !== null) {
        if (min >= descansoInicioMin && min < descansoFinMin) {
          continue;
        }
      }
      
      // Contar citas en este slot
      const citasEnSlot = citasDelDia.filter(cita => {
        const [citaH, citaM] = cita.horaInicio.split(':').map(Number);
        const citaMin = citaH * 60 + citaM;
        return citaMin === min;
      });
      
      const ocupados = citasEnSlot.length;
      const disponible = ocupados < config.capacidadSimultanea;
      
      slots.push({
        horaInicio,
        horaFin,
        disponible,
        ocupados,
        capacidad: config.capacidadSimultanea,
        citasEnSlot: citasEnSlot.map(c => c.id)
      });
    }
    
    return {
      fecha,
      diaSemana,
      habilitado: true,
      slots
    };
  }

  // NOTIFICACIONES (simuladas)
  
  private notificarNuevaCita(cita: Cita): void {
    console.log('📢 Nueva cita creada:', cita.numero);
    // En producción: enviar notificación real a trabajadores
  }

  private notificarConfirmacion(cita: Cita): void {
    console.log('✅ Cita confirmada:', cita.numero);
    toast.success(`Cita ${cita.numero} confirmada por ${cita.trabajadorAsignadoNombre}`);
    // En producción: notificar al cliente
  }

  private notificarCancelacion(cita: Cita): void {
    console.log('❌ Cita cancelada:', cita.numero);
    toast.info(`Cita ${cita.numero} cancelada`);
    // En producción: notificar a involucrados
  }

  // ESTADÍSTICAS
  
  obtenerEstadisticas(filtros: FiltrosCitas = {}): EstadisticasCitas {
    const citas = this.obtenerCitas(filtros);
    
    const totalCitas = citas.length;
    const citasSolicitadas = citas.filter(c => c.estado === 'solicitada').length;
    const citasConfirmadas = citas.filter(c => c.estado === 'confirmada').length;
    const citasCompletadas = citas.filter(c => c.estado === 'completada').length;
    const citasCanceladas = citas.filter(c => c.estado === 'cancelada').length;
    const citasNoPresentado = citas.filter(c => c.estado === 'no-presentado').length;
    
    const tasaConfirmacion = totalCitas > 0 ? (citasConfirmadas / totalCitas) * 100 : 0;
    const tasaCumplimiento = totalCitas > 0 ? (citasCompletadas / totalCitas) * 100 : 0;
    const tasaCancelacion = totalCitas > 0 ? (citasCanceladas / totalCitas) * 100 : 0;
    
    // Servicio más solicitado
    const servicios = new Map<string, number>();
    citas.forEach(c => {
      servicios.set(c.servicioNombre, (servicios.get(c.servicioNombre) || 0) + 1);
    });
    const servicioMasSolicitado = Array.from(servicios.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Horario más demandado
    const horarios = new Map<string, number>();
    citas.forEach(c => {
      const hora = c.horaInicio.split(':')[0];
      horarios.set(`${hora}:00`, (horarios.get(`${hora}:00`) || 0) + 1);
    });
    const horarioMasDemandado = Array.from(horarios.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Tiempo promedio de confirmación
    const citasConConfirmacion = citas.filter(c => c.fechaConfirmacion);
    const tiemposConfirmacion = citasConConfirmacion.map(c => {
      const creacion = new Date(c.fechaCreacion).getTime();
      const confirmacion = new Date(c.fechaConfirmacion!).getTime();
      return (confirmacion - creacion) / 1000 / 60; // minutos
    });
    const tiempoPromedioConfirmacion = tiemposConfirmacion.length > 0
      ? tiemposConfirmacion.reduce((a, b) => a + b, 0) / tiemposConfirmacion.length
      : 0;
    
    return {
      totalCitas,
      citasSolicitadas,
      citasConfirmadas,
      citasCompletadas,
      citasCanceladas,
      citasNoPresentado,
      tasaConfirmacion,
      tasaCumplimiento,
      tasaCancelacion,
      servicioMasSolicitado,
      horarioMasDemandado,
      tiempoPromedioConfirmacion
    };
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================

export const citasService = new CitasStorage();
