/**
 * ================================================================
 * TIPOS: SISTEMA DE INVITACIONES DE EMPLEADOS
 * ================================================================
 * Define tipos para el sistema de invitación de trabajadores
 */

export type MetodoInvitacion = 'email' | 'codigo' | 'preregistro';
export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada' | 'expirada' | 'cancelada';

export interface InvitacionEmpleado {
  id: string;
  empresaId: string;
  empresaNombre: string;
  metodo: MetodoInvitacion;
  
  // Datos del empleado invitado
  email: string;
  nombre?: string;
  apellidos?: string;
  puesto?: string;
  departamento?: string;
  
  // Datos de la invitación
  codigoInvitacion?: string; // Para método 'codigo'
  linkInvitacion?: string; // Para método 'email'
  credencialesTemporales?: {
    usuario: string;
    password: string;
  }; // Para método 'preregistro'
  
  // Estado y metadata
  estado: EstadoInvitacion;
  fechaCreacion: string;
  fechaExpiracion: string;
  fechaAceptacion?: string;
  creadoPor: string;
  creadoPorNombre: string;
  
  // Configuración
  requiereAprobacion?: boolean;
  permisos?: string[];
  horasSemanales?: number;
  tipoContrato?: string;
  
  // Notas
  notas?: string;
  motivoRechazo?: string;
}

export interface FormularioInvitacion {
  metodo: MetodoInvitacion;
  email: string;
  nombre?: string;
  apellidos?: string;
  puesto: string;
  departamento: string;
  horasSemanales?: number;
  tipoContrato?: string;
  notas?: string;
  enviarEmailInmediatamente?: boolean;
}

export interface DatosAceptacionInvitacion {
  invitacionId: string;
  codigo?: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  password: string;
  aceptaTerminos: boolean;
}

export interface EstadisticasInvitaciones {
  total: number;
  pendientes: number;
  aceptadas: number;
  rechazadas: number;
  expiradas: number;
  porMetodo: {
    email: number;
    codigo: number;
    preregistro: number;
  };
  tasaAceptacion: number;
}
