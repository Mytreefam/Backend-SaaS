/**
 * ================================================================
 * SERVICIO DE ONBOARDING - Udar Edge
 * ================================================================
 * Gestión completa del proceso de integración de nuevos empleados
 */

import type {
  ProcesoOnboarding,
  TareaOnboarding,
  DocumentoOnboarding,
  FormacionOnboarding,
  PlantillaOnboarding,
  EstadisticasOnboarding,
  CrearProcesoOnboardingRequest,
  CrearProcesoOnboardingResponse,
  ActualizarTareaRequest,
  SubirDocumentoRequest,
  ValidarDocumentoRequest,
  CompletarFormacionRequest,
  AgregarNotaRequest,
  CrearPlantillaRequest,
  FaseOnboarding,
  CuestionarioFormacion,
  IntentoCuestionario
} from '../types/onboarding.types';
import { toast } from 'sonner@2.0.3';
import { API_CONFIG } from '../config/api.config';

// ==================== CONFIGURACIÓN ====================

const API_BASE_URL = API_CONFIG.BASE_URL;
const ONBOARDING_ENDPOINT = `${API_BASE_URL}/onboarding`;

// ==================== PLANTILLAS PREDEFINIDAS ====================

const PLANTILLAS_DEFAULT: PlantillaOnboarding[] = [
  {
    id: 'plantilla-camarero',
    nombre: 'Onboarding Camarero/a',
    descripcion: 'Proceso completo de integración para personal de sala',
    departamento: 'sala',
    puesto: 'camarero',
    duracionEstimada: 7,
    activo: true,
    tareas: [
      {
        titulo: 'Completar datos personales',
        descripcion: 'Rellena tu información personal completa',
        fase: 'registro_completado',
        prioridad: 'critica',
        orden: 1,
        asignadoA: 'empleado',
        requiereAprobacion: false
      },
      {
        titulo: 'Subir DNI (ambas caras)',
        descripcion: 'Fotografía clara del DNI/NIE por ambos lados',
        fase: 'documentacion_pendiente',
        prioridad: 'critica',
        orden: 2,
        asignadoA: 'empleado',
        requiereAprobacion: true
      },
      {
        titulo: 'Datos bancarios para nómina',
        descripcion: 'IBAN completo para recibir la nómina',
        fase: 'documentacion_pendiente',
        prioridad: 'alta',
        orden: 3,
        asignadoA: 'empleado',
        requiereAprobacion: true
      },
      {
        titulo: 'Firmar contrato digital',
        descripcion: 'Lee y firma tu contrato de trabajo',
        fase: 'documentacion_pendiente',
        prioridad: 'critica',
        orden: 4,
        asignadoA: 'empleado',
        requiereAprobacion: false
      },
      {
        titulo: 'Ver vídeo de bienvenida',
        descripcion: 'Conoce la empresa y sus valores (5 min)',
        fase: 'formacion_pendiente',
        prioridad: 'media',
        orden: 5,
        asignadoA: 'empleado',
        requiereAprobacion: false
      },
      {
        titulo: 'Curso de manipulación de alimentos',
        descripcion: 'Formación obligatoria en higiene alimentaria',
        fase: 'formacion_pendiente',
        prioridad: 'critica',
        orden: 6,
        asignadoA: 'empleado',
        requiereAprobacion: false
      },
      {
        titulo: 'Curso de uso de la TPV',
        descripcion: 'Aprende a usar el sistema de punto de venta',
        fase: 'formacion_pendiente',
        prioridad: 'alta',
        orden: 7,
        asignadoA: 'empleado',
        requiereAprobacion: false
      },
      {
        titulo: 'Configurar método de fichaje',
        descripcion: 'Configura tu forma preferida de fichar (app, QR, NFC)',
        fase: 'primer_dia_pendiente',
        prioridad: 'alta',
        orden: 8,
        asignadoA: 'empleado',
        requiereAprobacion: false
      },
      {
        titulo: 'Reunión de bienvenida',
        descripcion: 'Reunión con el gerente y el equipo',
        fase: 'primer_dia_completado',
        prioridad: 'media',
        orden: 9,
        asignadoA: 'gerente',
        requiereAprobacion: false
      },
      {
        titulo: 'Revisión de primera semana',
        descripcion: 'Feedback y resolución de dudas',
        fase: 'seguimiento_programado',
        prioridad: 'media',
        orden: 10,
        asignadoA: 'gerente',
        requiereAprobacion: false,
        fechaLimite: '+7d' as any // 7 días después
      }
    ],
    documentos: [
      {
        tipo: 'dni_frontal',
        nombre: 'DNI/NIE - Frontal',
        descripcion: 'Fotografía clara de la parte frontal del DNI',
        obligatorio: true,
        requiereFirma: false,
        firmado: false
      },
      {
        tipo: 'dni_trasera',
        nombre: 'DNI/NIE - Trasera',
        descripcion: 'Fotografía clara de la parte trasera del DNI',
        obligatorio: true,
        requiereFirma: false,
        firmado: false
      },
      {
        tipo: 'numero_seguridad_social',
        nombre: 'Número de Seguridad Social',
        descripcion: 'Tarjeta o documento con tu número de la seguridad social',
        obligatorio: true,
        requiereFirma: false,
        firmado: false
      },
      {
        tipo: 'datos_bancarios',
        nombre: 'Datos bancarios',
        descripcion: 'IBAN completo para el pago de nóminas',
        obligatorio: true,
        requiereFirma: false,
        firmado: false
      },
      {
        tipo: 'contrato',
        nombre: 'Contrato de trabajo',
        descripcion: 'Contrato que debes revisar y firmar digitalmente',
        obligatorio: true,
        requiereFirma: true,
        firmado: false
      },
      {
        tipo: 'carnet_manipulador',
        nombre: 'Carné de manipulador de alimentos',
        descripcion: 'Si ya tienes el carné, súbelo aquí',
        obligatorio: false,
        requiereFirma: false,
        firmado: false
      }
    ],
    formaciones: [
      {
        titulo: 'Bienvenida a la empresa',
        descripcion: 'Vídeo de presentación de la empresa, valores y cultura',
        tipo: 'video',
        obligatorio: true,
        duracionEstimada: 5,
        generaCertificado: false
      },
      {
        titulo: 'Manipulación de alimentos',
        descripcion: 'Curso obligatorio de higiene y seguridad alimentaria',
        tipo: 'cuestionario',
        obligatorio: true,
        duracionEstimada: 30,
        puntuacionMinima: 80,
        generaCertificado: true
      },
      {
        titulo: 'Uso del sistema TPV',
        descripcion: 'Aprende a usar el terminal de punto de venta',
        tipo: 'video',
        obligatorio: true,
        duracionEstimada: 15,
        generaCertificado: false
      },
      {
        titulo: 'Prevención de Riesgos Laborales',
        descripcion: 'Formación básica en PRL para el puesto de camarero',
        tipo: 'cuestionario',
        obligatorio: true,
        duracionEstimada: 20,
        puntuacionMinima: 70,
        generaCertificado: true
      },
      {
        titulo: 'Manual del empleado',
        descripcion: 'Lee el manual con procedimientos y normas internas',
        tipo: 'lectura',
        obligatorio: true,
        duracionEstimada: 10,
        generaCertificado: false
      }
    ],
    programarRevisionEn: 7,
    notificarGerenteEn: [1, 3, 7],
    creadoPor: 'SYSTEM',
    fechaCreacion: new Date().toISOString(),
    ultimaActualizacion: new Date().toISOString()
  }
];

// ==================== MOCK DATA ====================

const PROCESOS_MOCK: ProcesoOnboarding[] = [];

// ==================== SERVICIO ====================

class OnboardingService {
  private useMock = false; // Solo datos reales del backend
  
  // ==================== PROCESOS ====================
  
  /**
   * Crear un nuevo proceso de onboarding
   */
  async crearProceso(request: CrearProcesoOnboardingRequest): Promise<CrearProcesoOnboardingResponse> {
    if (this.useMock) {
      const plantilla = request.plantillaId 
        ? PLANTILLAS_DEFAULT.find(p => p.id === request.plantillaId)
        : PLANTILLAS_DEFAULT[0]; // Default: primera plantilla
      
      if (!plantilla) {
        throw new Error('Plantilla no encontrada');
      }
      
      const proceso: ProcesoOnboarding = {
        id: `ONB-${Date.now()}`,
        empleadoId: request.empleadoId,
        empleadoNombre: 'Nuevo Empleado',
        empleadoEmail: 'empleado@ejemplo.com',
        empresaId: request.empresaId,
        empresaNombre: 'Mi Empresa',
        puesto: request.puesto,
        departamento: request.departamento,
        fechaInicio: request.fechaInicio,
        faseActual: 'invitacion_enviada',
        progresoGeneral: 0,
        fechaCreacion: new Date().toISOString(),
        fechaUltimaActualizacion: new Date().toISOString(),
        invitacionId: request.invitacionId,
        canalInvitacion: 'email',
        fechaInvitacion: new Date().toISOString(),
        tareas: plantilla.tareas.map((t, index) => ({
          ...t,
          id: `TASK-${Date.now()}-${index}`,
          estado: 'pendiente' as const,
          fechaCreacion: new Date().toISOString()
        })),
        tareasCompletadas: 0,
        tareasTotal: plantilla.tareas.length,
        documentos: plantilla.documentos.map((d, index) => ({
          ...d,
          id: `DOC-${Date.now()}-${index}`,
          estado: 'pendiente' as const
        })),
        documentosCompletados: 0,
        documentosTotal: plantilla.documentos.length,
        formaciones: plantilla.formaciones.map((f, index) => ({
          ...f,
          id: `FORM-${Date.now()}-${index}`,
          estado: 'pendiente' as const,
          progreso: 0
        })),
        formacionesCompletadas: 0,
        formacionesTotal: plantilla.formaciones.length,
        mentor: request.mentorId,
        notas: [],
        requiereAccion: true,
        alertas: []
      };
      
      // Guardar en localStorage
      const procesos = this.obtenerProcesosLocal();
      procesos.push(proceso);
      localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
      
      PROCESOS_MOCK.push(proceso);
      
      return {
        success: true,
        proceso
      };
    }
    
    // Llamada real a la API
    const response = await fetch(`${ONBOARDING_ENDPOINT}/procesos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    return await response.json();
  }
  
  /**
   * Obtener un proceso de onboarding por ID
   */
  async obtenerProceso(procesoId: string): Promise<ProcesoOnboarding> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === procesoId);
      
      if (!proceso) {
        throw new Error('Proceso no encontrado');
      }
      
      return proceso;
    }
    
    const response = await fetch(`${ONBOARDING_ENDPOINT}/procesos/${procesoId}`);
    return await response.json();
  }
  
  /**
   * Obtener procesos de onboarding (con filtros)
   */
  async obtenerProcesos(params: {
    empresaId: string;
    empleadoId?: string;
    faseActual?: FaseOnboarding;
    activos?: boolean;
  }): Promise<ProcesoOnboarding[]> {
    if (this.useMock) {
      let procesos = this.obtenerProcesosLocal();
      
      procesos = procesos.filter(p => p.empresaId === params.empresaId);
      
      if (params.empleadoId) {
        procesos = procesos.filter(p => p.empleadoId === params.empleadoId);
      }
      
      if (params.faseActual) {
        procesos = procesos.filter(p => p.faseActual === params.faseActual);
      }
      
      if (params.activos) {
        procesos = procesos.filter(p => p.faseActual !== 'onboarding_completado');
      }
      
      return procesos;
    }
    
    const queryParams = new URLSearchParams(params as any);
    const response = await fetch(`${ONBOARDING_ENDPOINT}/procesos?${queryParams}`);
    return await response.json();
  }
  
  /**
   * Actualizar fase del proceso
   */
  async actualizarFase(procesoId: string, nuevaFase: FaseOnboarding): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === procesoId);
      
      if (proceso) {
        proceso.faseActual = nuevaFase;
        proceso.fechaUltimaActualizacion = new Date().toISOString();
        
        // Actualizar progreso según la fase
        const faseProgreso: Record<FaseOnboarding, number> = {
          'invitacion_enviada': 5,
          'registro_iniciado': 15,
          'registro_completado': 25,
          'documentacion_pendiente': 35,
          'documentacion_completada': 50,
          'formacion_pendiente': 60,
          'formacion_en_progreso': 70,
          'formacion_completada': 80,
          'primer_dia_pendiente': 85,
          'primer_dia_completado': 90,
          'seguimiento_programado': 95,
          'onboarding_completado': 100
        };
        
        proceso.progresoGeneral = faseProgreso[nuevaFase];
        
        if (nuevaFase === 'onboarding_completado') {
          proceso.fechaCompletado = new Date().toISOString();
          
          // Calcular tiempo del proceso
          const inicio = new Date(proceso.fechaInvitacion);
          const fin = new Date();
          proceso.tiempoProceso = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
      }
      
      return;
    }
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${procesoId}/fase`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fase: nuevaFase })
    });
  }
  
  // ==================== TAREAS ====================
  
  /**
   * Actualizar estado de una tarea
   */
  async actualizarTarea(procesoId: string, request: ActualizarTareaRequest): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === procesoId);
      
      if (proceso) {
        const tarea = proceso.tareas.find(t => t.id === request.tareaId);
        
        if (tarea) {
          tarea.estado = request.estado;
          
          if (request.estado === 'completada') {
            tarea.fechaCompletado = new Date().toISOString();
            proceso.tareasCompletadas++;
            
            // Si requiere aprobación, cambiar a "en_progreso" hasta que el gerente apruebe
            if (tarea.requiereAprobacion) {
              tarea.estado = 'en_progreso';
            }
          }
          
          // Recalcular progreso general
          const progresoTareas = (proceso.tareasCompletadas / proceso.tareasTotal) * 100;
          proceso.progresoGeneral = Math.min(progresoTareas, 100);
          proceso.fechaUltimaActualizacion = new Date().toISOString();
          
          localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
          
          toast.success('Tarea actualizada correctamente');
        }
      }
      
      return;
    }
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${procesoId}/tareas/${request.tareaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }
  
  /**
   * Aprobar una tarea que requería validación
   */
  async aprobarTarea(procesoId: string, tareaId: string, aprobadoPor: string): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === procesoId);
      
      if (proceso) {
        const tarea = proceso.tareas.find(t => t.id === tareaId);
        
        if (tarea) {
          tarea.estado = 'completada';
          tarea.aprobadoPor = aprobadoPor;
          tarea.fechaAprobacion = new Date().toISOString();
          
          localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
          
          toast.success('Tarea aprobada');
        }
      }
      
      return;
    }
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${procesoId}/tareas/${tareaId}/aprobar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aprobadoPor })
    });
  }
  
  // ==================== DOCUMENTOS ====================
  
  /**
   * Subir documento
   */
  async subirDocumento(request: SubirDocumentoRequest): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === request.procesoId);
      
      if (proceso) {
        const documento = proceso.documentos.find(d => d.id === request.documentoId);
        
        if (documento) {
          // Simular subida de archivo
          documento.estado = 'subido';
          documento.archivoNombre = request.archivo.name;
          documento.archivoTamanio = request.archivo.size;
          documento.archivoUrl = URL.createObjectURL(request.archivo);
          documento.fechaSubida = new Date().toISOString();
          
          if (documento.obligatorio) {
            proceso.documentosCompletados++;
          }
          
          proceso.fechaUltimaActualizacion = new Date().toISOString();
          
          localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
          
          toast.success('Documento subido correctamente');
        }
      }
      
      return;
    }
    
    const formData = new FormData();
    formData.append('archivo', request.archivo);
    formData.append('documentoId', request.documentoId);
    formData.append('empleadoId', request.empleadoId);
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${request.procesoId}/documentos`, {
      method: 'POST',
      body: formData
    });
  }
  
  /**
   * Validar documento (aprobar/rechazar)
   */
  async validarDocumento(procesoId: string, request: ValidarDocumentoRequest): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === procesoId);
      
      if (proceso) {
        const documento = proceso.documentos.find(d => d.id === request.documentoId);
        
        if (documento) {
          documento.estado = request.aprobado ? 'aprobado' : 'rechazado';
          documento.validadoPor = request.validadoPor;
          documento.fechaValidacion = new Date().toISOString();
          
          if (!request.aprobado && request.motivoRechazo) {
            documento.motivoRechazo = request.motivoRechazo;
          }
          
          localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
          
          toast.success(request.aprobado ? 'Documento aprobado' : 'Documento rechazado');
        }
      }
      
      return;
    }
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${procesoId}/documentos/${request.documentoId}/validar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }
  
  // ==================== FORMACIÓN ====================
  
  /**
   * Completar formación
   */
  async completarFormacion(procesoId: string, request: CompletarFormacionRequest): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === procesoId);
      
      if (proceso) {
        const formacion = proceso.formaciones.find(f => f.id === request.formacionId);
        
        if (formacion) {
          formacion.estado = 'completada';
          formacion.progreso = 100;
          formacion.fechaCompletado = new Date().toISOString();
          
          if (request.puntuacion !== undefined) {
            formacion.puntuacion = request.puntuacion;
            
            // Verificar si aprobó
            const aprobado = formacion.puntuacionMinima 
              ? request.puntuacion >= formacion.puntuacionMinima
              : true;
              
            formacion.estado = aprobado ? 'aprobada' : 'completada';
          }
          
          if (formacion.obligatorio) {
            proceso.formacionesCompletadas++;
          }
          
          proceso.fechaUltimaActualizacion = new Date().toISOString();
          
          localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
          
          toast.success('Formación completada');
        }
      }
      
      return;
    }
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${procesoId}/formaciones/${request.formacionId}/completar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }
  
  // ==================== NOTAS ====================
  
  /**
   * Agregar nota de seguimiento
   */
  async agregarNota(request: AgregarNotaRequest): Promise<void> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal();
      const proceso = procesos.find(p => p.id === request.procesoId);
      
      if (proceso) {
        proceso.notas.push({
          id: `NOTE-${Date.now()}`,
          fecha: new Date().toISOString(),
          autorId: request.autorId,
          autorNombre: 'Usuario',
          tipo: request.tipo,
          titulo: request.titulo,
          contenido: request.contenido,
          privada: request.privada
        });
        
        localStorage.setItem('procesos_onboarding', JSON.stringify(procesos));
        
        toast.success('Nota agregada');
      }
      
      return;
    }
    
    await fetch(`${ONBOARDING_ENDPOINT}/procesos/${request.procesoId}/notas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }
  
  // ==================== PLANTILLAS ====================
  
  /**
   * Obtener plantillas disponibles
   */
  async obtenerPlantillas(params?: {
    departamento?: string;
    puesto?: string;
  }): Promise<PlantillaOnboarding[]> {
    if (this.useMock) {
      let plantillas = [...PLANTILLAS_DEFAULT];
      
      if (params?.departamento) {
        plantillas = plantillas.filter(p => !p.departamento || p.departamento === params.departamento);
      }
      
      if (params?.puesto) {
        plantillas = plantillas.filter(p => !p.puesto || p.puesto === params.puesto);
      }
      
      return plantillas;
    }
    
    const queryParams = new URLSearchParams(params as any);
    const response = await fetch(`${ONBOARDING_ENDPOINT}/plantillas?${queryParams}`);
    return await response.json();
  }
  
  /**
   * Crear plantilla personalizada
   */
  async crearPlantilla(request: CrearPlantillaRequest): Promise<PlantillaOnboarding> {
    if (this.useMock) {
      const plantilla: PlantillaOnboarding = {
        id: `PLANT-${Date.now()}`,
        nombre: request.nombre,
        descripcion: request.descripcion,
        departamento: request.departamento,
        puesto: request.puesto,
        duracionEstimada: 7,
        activo: true,
        tareas: request.tareas,
        documentos: request.documentos,
        formaciones: request.formaciones,
        creadoPor: request.creadoPor,
        fechaCreacion: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      };
      
      // Guardar en localStorage
      const plantillas = JSON.parse(localStorage.getItem('plantillas_onboarding') || '[]');
      plantillas.push(plantilla);
      localStorage.setItem('plantillas_onboarding', JSON.stringify(plantillas));
      
      toast.success('Plantilla creada');
      
      return plantilla;
    }
    
    const response = await fetch(`${ONBOARDING_ENDPOINT}/plantillas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    return await response.json();
  }
  
  // ==================== ESTADÍSTICAS ====================
  
  /**
   * Obtener estadísticas de onboarding
   */
  async obtenerEstadisticas(empresaId: string): Promise<EstadisticasOnboarding> {
    if (this.useMock) {
      const procesos = this.obtenerProcesosLocal().filter(p => p.empresaId === empresaId);
      
      const activos = procesos.filter(p => p.faseActual !== 'onboarding_completado');
      const completados = procesos.filter(p => p.faseActual === 'onboarding_completado');
      
      const progresoPromedio = procesos.length > 0
        ? procesos.reduce((sum, p) => sum + p.progresoGeneral, 0) / procesos.length
        : 0;
      
      const tiemposCompletados = completados
        .filter(p => p.tiempoProceso)
        .map(p => p.tiempoProceso!);
      
      const tiempoPromedio = tiemposCompletados.length > 0
        ? tiemposCompletados.reduce((sum, t) => sum + t, 0) / tiemposCompletados.length
        : 0;
      
      // Contar por fase
      const porFase: any = {};
      const fases: FaseOnboarding[] = [
        'invitacion_enviada', 'registro_iniciado', 'registro_completado',
        'documentacion_pendiente', 'documentacion_completada',
        'formacion_pendiente', 'formacion_en_progreso', 'formacion_completada',
        'primer_dia_pendiente', 'primer_dia_completado',
        'seguimiento_programado', 'onboarding_completado'
      ];
      
      fases.forEach(fase => {
        porFase[fase] = procesos.filter(p => p.faseActual === fase).length;
      });
      
      return {
        totalProcesos: procesos.length,
        procesosActivos: activos.length,
        procesosCompletados: completados.length,
        progresoPromedio: Math.round(progresoPromedio),
        porFase,
        tiempoPromedioCompletado: Math.round(tiempoPromedio),
        tiempoMasRapido: Math.min(...tiemposCompletados, 0),
        tiempoMasLento: Math.max(...tiemposCompletados, 0),
        documentosPendientesRevision: procesos.reduce((sum, p) => 
          sum + p.documentos.filter(d => d.estado === 'subido').length, 0
        ),
        formacionesPendientes: procesos.reduce((sum, p) => 
          sum + p.formaciones.filter(f => f.estado === 'pendiente').length, 0
        ),
        tasaAprobacionCuestionarios: 85,
        satisfaccionPromedio: 4.2,
        procesosRetrasados: 0,
        procesosRequierenAccion: procesos.filter(p => p.requiereAccion).length,
        nuevosIniciados: procesos.filter(p => {
          const creacion = new Date(p.fechaCreacion);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return creacion >= hace30Dias;
        }).length,
        completadosRecientes: completados.filter(p => {
          if (!p.fechaCompletado) return false;
          const completado = new Date(p.fechaCompletado);
          const hace30Dias = new Date();
          hace30Dias.setDate(hace30Dias.getDate() - 30);
          return completado >= hace30Dias;
        }).length,
        porDepartamento: []
      };
    }
    
    const response = await fetch(`${ONBOARDING_ENDPOINT}/estadisticas?empresaId=${empresaId}`);
    return await response.json();
  }
  
  // ==================== HELPERS ====================
  
  private obtenerProcesosLocal(): ProcesoOnboarding[] {
    const stored = localStorage.getItem('procesos_onboarding');
    return stored ? JSON.parse(stored) : [];
  }
}

export const onboardingService = new OnboardingService();
