/**
 * TIPOS DE NOTIFICACIONES - Sistema Udar Edge
 * Listo para conectar con backend
 */

// ==================== TIPOS PRINCIPALES ====================

export type NotificationType = 
  | 'pedido'           // Actualizaciones de pedidos
  | 'stock'            // Alertas de stock
  | 'cita'             // Citas y recordatorios
  | 'promocion'        // Ofertas y promociones
  | 'sistema'          // Notificaciones del sistema
  | 'pago'             // Pagos y transacciones
  | 'alerta'           // Alertas críticas
  | 'mensaje'          // Mensajes del equipo
  | 'rrhh'             // Recursos Humanos (gerente)
  | 'invitacion'       // Invitaciones de empleados
  | 'fichaje'          // Fichajes y horarios (trabajador)
  | 'nomina'           // Nóminas y pagos (trabajador)
  | 'vacaciones'       // Vacaciones y ausencias
  | 'formacion';       // Formación y desarrollo

export type NotificationStatus = 'sin_leer' | 'leida' | 'archivada';

export type NotificationPriority = 'baja' | 'normal' | 'alta' | 'urgente';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';

// ==================== INTERFACES PRINCIPALES ====================

export interface Notification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  descripcion?: string;
  fecha: Date;
  status: NotificationStatus;
  prioridad: NotificationPriority;
  
  // Metadatos
  usuarioId: string;
  empresaId: string;
  puntoVentaId?: string;
  
  // Datos relacionados
  relacionId?: string;        // ID del recurso relacionado (pedido, producto, etc.)
  relacionTipo?: string;      // Tipo de recurso relacionado
  
  // URLs y acciones
  urlAccion?: string;         // URL a la que navegar al hacer clic
  accionTexto?: string;       // Texto del botón de acción
  
  // Configuración
  canales: NotificationChannel[];
  expiraEn?: Date;           // Fecha de expiración
  
  // Metadata adicional
  metadata?: Record<string, any>;
  
  // Auditoría
  creadoEn: Date;
  actualizadoEn?: Date;
  leidaEn?: Date;
  archivadaEn?: Date;
}

// ==================== PREFERENCIAS DE USUARIO ====================

export interface NotificationPreferences {
  usuarioId: string;
  
  // Canales habilitados
  canalesActivos: {
    email: boolean;
    push: boolean;
    sms: boolean;
    in_app: boolean;
  };
  
  // Preferencias por tipo
  preferencias: {
    pedido: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    stock: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    cita: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    promocion: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    sistema: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    pago: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    alerta: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    mensaje: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    rrhh: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    invitacion: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    fichaje: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    nomina: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    vacaciones: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
    formacion: {
      activo: boolean;
      canales: NotificationChannel[];
      sonido: boolean;
    };
  };
  
  // Configuración adicional
  horarioSilencioso: {
    activo: boolean;
    inicio: string;  // HH:mm formato 24h
    fin: string;     // HH:mm formato 24h
  };
  
  frecuenciaEmail: 'inmediato' | 'diario' | 'semanal';
  agruparNotificaciones: boolean;
  
  actualizadoEn: Date;
}

// ==================== ESTADÍSTICAS ====================

export interface NotificationStats {
  total: number;
  sinLeer: number;
  leidas: number;
  archivadas: number;
  porTipo: Record<NotificationType, number>;
  ultimaSemana: number;
  urgentes: number;
}

// ==================== REQUEST/RESPONSE API ====================

export interface GetNotificationsRequest {
  usuarioId: string;
  empresaId?: string;
  status?: NotificationStatus[];
  tipo?: NotificationType[];
  prioridad?: NotificationPriority[];
  desde?: Date;
  hasta?: Date;
  limit?: number;
  offset?: number;
  ordenarPor?: 'fecha' | 'prioridad' | 'tipo';
  ordenDir?: 'asc' | 'desc';
}

export interface GetNotificationsResponse {
  notificaciones: Notification[];
  total: number;
  sinLeer: number;
  hasMore: boolean;
}

export interface MarkAsReadRequest {
  notificacionIds: string[];
  usuarioId: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  actualizadas: number;
}

export interface UpdatePreferencesRequest {
  usuarioId: string;
  preferencias: Partial<NotificationPreferences>;
}

export interface UpdatePreferencesResponse {
  success: boolean;
  preferencias: NotificationPreferences;
}

export interface CreateNotificationRequest {
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  descripcion?: string;
  prioridad: NotificationPriority;
  usuarioId: string;
  empresaId: string;
  puntoVentaId?: string;
  relacionId?: string;
  relacionTipo?: string;
  urlAccion?: string;
  accionTexto?: string;
  canales: NotificationChannel[];
  expiraEn?: Date;
  metadata?: Record<string, any>;
}

export interface CreateNotificationResponse {
  success: boolean;
  notificacion: Notification;
}

// ==================== EVENTOS EN TIEMPO REAL ====================

export interface NotificationEvent {
  tipo: 'nueva' | 'actualizada' | 'eliminada';
  notificacion: Notification;
  timestamp: Date;
}

// ==================== PLANTILLAS ====================

export interface NotificationTemplate {
  id: string;
  nombre: string;
  tipo: NotificationType;
  tituloTemplate: string;
  mensajeTemplate: string;
  prioridadDefecto: NotificationPriority;
  canalesDefecto: NotificationChannel[];
  variables: string[];  // Variables disponibles para reemplazar
  activo: boolean;
}