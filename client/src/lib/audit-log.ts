/**
 * 📝 SISTEMA DE AUDITORÍA Y LOGS
 * Registro completo de todas las acciones críticas del sistema
 */

import { Role } from './rbac';
import { isProduction } from './env-utils';

// ============================================
// TIPOS Y ENUMS
// ============================================

export enum TipoAccion {
  // CRUD Básico
  CREAR = 'crear',
  LEER = 'leer',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
  
  // Acciones especiales
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FALLIDO = 'login_fallido',
  CAMBIO_CONTRASEÑA = 'cambio_contraseña',
  EXPORTAR = 'exportar',
  IMPORTAR = 'importar',
  APROBAR = 'aprobar',
  RECHAZAR = 'rechazar',
  
  // Configuración
  CAMBIO_CONFIG = 'cambio_config',
  CAMBIO_PERMISOS = 'cambio_permisos',
  CAMBIO_ROL = 'cambio_rol',
  
  // Otros
  SINCRONIZAR = 'sincronizar',
  BACKUP = 'backup',
  RESTORE = 'restore'
}

export enum NivelSeveridad {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum EntidadTipo {
  CLIENTE = 'cliente',
  EMPLEADO = 'empleado',
  PRODUCTO = 'producto',
  PEDIDO = 'pedido',
  FACTURA = 'factura',
  PROVEEDOR = 'proveedor',
  STOCK = 'stock',
  USUARIO = 'usuario',
  CONFIGURACION = 'configuracion',
  ROL = 'rol',
  PERMISO = 'permiso'
}

export interface RegistroAuditoria {
  id: string;
  timestamp: Date;
  
  // Usuario que realiza la acción
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: Role;
  usuario_email?: string;
  
  // Acción realizada
  accion: TipoAccion;
  entidad_tipo: EntidadTipo;
  entidad_id?: string;
  entidad_nombre?: string;
  
  // Detalles
  descripcion: string;
  severidad: NivelSeveridad;
  
  // Cambios (para actualizaciones)
  valores_anteriores?: Record<string, any>;
  valores_nuevos?: Record<string, any>;
  
  // Metadata
  ip_address?: string;
  user_agent?: string;
  dispositivo?: string;
  ubicacion?: string;
  
  // Contexto
  modulo?: string;
  tenant_id?: string;
  sesion_id?: string;
  
  // Resultado
  exitoso: boolean;
  mensaje_error?: string;
  duracion_ms?: number;
}

// ============================================
// CLASE PARA GESTIÓN DE LOGS
// ============================================

class AuditLogger {
  private logs: RegistroAuditoria[] = [];
  private maxLogs: number = 10000;
  private enabled: boolean = true;

  /**
   * Registrar una acción en el log de auditoría
   */
  async registrar(params: Partial<RegistroAuditoria> & {
    usuario_id: string;
    usuario_nombre: string;
    usuario_rol: Role;
    accion: TipoAccion;
    entidad_tipo: EntidadTipo;
    descripcion: string;
  }): Promise<void> {
    if (!this.enabled) return;

    const registro: RegistroAuditoria = {
      id: this.generarId(),
      timestamp: new Date(),
      severidad: NivelSeveridad.INFO,
      exitoso: true,
      ...params
    };

    // Guardar en memoria
    this.logs.push(registro);

    // Mantener límite de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // En producción, enviar a base de datos
    if (isProduction) {
      await this.enviarABaseDatos(registro);
    } else {
      // En desarrollo, mostrar en consola
      this.mostrarEnConsola(registro);
    }
  }

  /**
   * Registrar login exitoso
   */
  async registrarLogin(
    usuario_id: string,
    usuario_nombre: string,
    usuario_rol: Role,
    metadata?: Partial<RegistroAuditoria>
  ): Promise<void> {
    await this.registrar({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: TipoAccion.LOGIN,
      entidad_tipo: EntidadTipo.USUARIO,
      entidad_id: usuario_id,
      descripcion: `${usuario_nombre} inició sesión`,
      severidad: NivelSeveridad.INFO,
      ...metadata
    });
  }

  /**
   * Registrar login fallido
   */
  async registrarLoginFallido(
    email: string,
    razon: string,
    metadata?: Partial<RegistroAuditoria>
  ): Promise<void> {
    await this.registrar({
      usuario_id: 'sistema',
      usuario_nombre: 'Sistema',
      usuario_rol: Role.SUPER_ADMIN,
      accion: TipoAccion.LOGIN_FALLIDO,
      entidad_tipo: EntidadTipo.USUARIO,
      descripcion: `Intento de login fallido para ${email}: ${razon}`,
      severidad: NivelSeveridad.WARNING,
      exitoso: false,
      mensaje_error: razon,
      ...metadata
    });
  }

  /**
   * Registrar creación de entidad
   */
  async registrarCreacion(
    usuario_id: string,
    usuario_nombre: string,
    usuario_rol: Role,
    entidad_tipo: EntidadTipo,
    entidad_id: string,
    entidad_nombre: string,
    valores: Record<string, any>
  ): Promise<void> {
    await this.registrar({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: TipoAccion.CREAR,
      entidad_tipo,
      entidad_id,
      entidad_nombre,
      descripcion: `Creó ${entidad_tipo}: ${entidad_nombre}`,
      valores_nuevos: valores,
      severidad: NivelSeveridad.INFO
    });
  }

  /**
   * Registrar actualización de entidad
   */
  async registrarActualizacion(
    usuario_id: string,
    usuario_nombre: string,
    usuario_rol: Role,
    entidad_tipo: EntidadTipo,
    entidad_id: string,
    entidad_nombre: string,
    valoresAnteriores: Record<string, any>,
    valoresNuevos: Record<string, any>
  ): Promise<void> {
    // Detectar qué campos cambiaron
    const camposCambiados = Object.keys(valoresNuevos).filter(
      key => valoresNuevos[key] !== valoresAnteriores[key]
    );

    await this.registrar({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: TipoAccion.ACTUALIZAR,
      entidad_tipo,
      entidad_id,
      entidad_nombre,
      descripcion: `Actualizó ${entidad_tipo}: ${entidad_nombre} (campos: ${camposCambiados.join(', ')})`,
      valores_anteriores: valoresAnteriores,
      valores_nuevos: valoresNuevos,
      severidad: NivelSeveridad.INFO
    });
  }

  /**
   * Registrar eliminación de entidad
   */
  async registrarEliminacion(
    usuario_id: string,
    usuario_nombre: string,
    usuario_rol: Role,
    entidad_tipo: EntidadTipo,
    entidad_id: string,
    entidad_nombre: string
  ): Promise<void> {
    await this.registrar({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: TipoAccion.ELIMINAR,
      entidad_tipo,
      entidad_id,
      entidad_nombre,
      descripcion: `Eliminó ${entidad_tipo}: ${entidad_nombre}`,
      severidad: NivelSeveridad.WARNING
    });
  }

  /**
   * Registrar exportación de datos
   */
  async registrarExportacion(
    usuario_id: string,
    usuario_nombre: string,
    usuario_rol: Role,
    entidad_tipo: EntidadTipo,
    cantidad: number,
    formato: string
  ): Promise<void> {
    await this.registrar({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: TipoAccion.EXPORTAR,
      entidad_tipo,
      descripcion: `Exportó ${cantidad} ${entidad_tipo}(s) en formato ${formato}`,
      severidad: NivelSeveridad.INFO
    });
  }

  /**
   * Registrar cambio de rol
   */
  async registrarCambioRol(
    usuario_id: string,
    usuario_nombre: string,
    usuario_rol: Role,
    objetivo_id: string,
    objetivo_nombre: string,
    rol_anterior: Role,
    rol_nuevo: Role
  ): Promise<void> {
    await this.registrar({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: TipoAccion.CAMBIO_ROL,
      entidad_tipo: EntidadTipo.USUARIO,
      entidad_id: objetivo_id,
      entidad_nombre: objetivo_nombre,
      descripcion: `Cambió rol de ${objetivo_nombre} de ${rol_anterior} a ${rol_nuevo}`,
      valores_anteriores: { rol: rol_anterior },
      valores_nuevos: { rol: rol_nuevo },
      severidad: NivelSeveridad.WARNING
    });
  }

  /**
   * Obtener logs con filtros
   */
  obtenerLogs(filtros?: {
    usuario_id?: string;
    accion?: TipoAccion;
    entidad_tipo?: EntidadTipo;
    severidad?: NivelSeveridad;
    desde?: Date;
    hasta?: Date;
    limite?: number;
  }): RegistroAuditoria[] {
    let logsFilter = [...this.logs];

    if (filtros) {
      if (filtros.usuario_id) {
        logsFilter = logsFilter.filter(l => l.usuario_id === filtros.usuario_id);
      }
      if (filtros.accion) {
        logsFilter = logsFilter.filter(l => l.accion === filtros.accion);
      }
      if (filtros.entidad_tipo) {
        logsFilter = logsFilter.filter(l => l.entidad_tipo === filtros.entidad_tipo);
      }
      if (filtros.severidad) {
        logsFilter = logsFilter.filter(l => l.severidad === filtros.severidad);
      }
      if (filtros.desde) {
        logsFilter = logsFilter.filter(l => l.timestamp >= filtros.desde!);
      }
      if (filtros.hasta) {
        logsFilter = logsFilter.filter(l => l.timestamp <= filtros.hasta!);
      }
    }

    // Ordenar por timestamp descendente (más recientes primero)
    logsFilter.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Aplicar límite
    if (filtros?.limite) {
      logsFilter = logsFilter.slice(0, filtros.limite);
    }

    return logsFilter;
  }

  /**
   * Obtener timeline de una entidad específica
   */
  obtenerTimelineEntidad(
    entidad_tipo: EntidadTipo,
    entidad_id: string
  ): RegistroAuditoria[] {
    return this.logs
      .filter(l => l.entidad_tipo === entidad_tipo && l.entidad_id === entidad_id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Obtener actividad reciente de un usuario
   */
  obtenerActividadUsuario(
    usuario_id: string,
    limite: number = 50
  ): RegistroAuditoria[] {
    return this.obtenerLogs({ usuario_id, limite });
  }

  /**
   * Generar estadísticas de auditoría
   */
  generarEstadisticas(periodo: 'hoy' | 'semana' | 'mes' = 'hoy') {
    const ahora = new Date();
    let desde = new Date();

    switch (periodo) {
      case 'hoy':
        desde.setHours(0, 0, 0, 0);
        break;
      case 'semana':
        desde.setDate(ahora.getDate() - 7);
        break;
      case 'mes':
        desde.setMonth(ahora.getMonth() - 1);
        break;
    }

    const logsPeriodo = this.obtenerLogs({ desde });

    return {
      total_acciones: logsPeriodo.length,
      por_accion: this.contarPorCampo(logsPeriodo, 'accion'),
      por_entidad: this.contarPorCampo(logsPeriodo, 'entidad_tipo'),
      por_severidad: this.contarPorCampo(logsPeriodo, 'severidad'),
      por_usuario: this.contarPorCampo(logsPeriodo, 'usuario_nombre'),
      acciones_fallidas: logsPeriodo.filter(l => !l.exitoso).length,
      periodo: periodo
    };
  }

  /**
   * Exportar logs a JSON
   */
  exportarJSON(filtros?: Parameters<typeof this.obtenerLogs>[0]): string {
    const logs = this.obtenerLogs(filtros);
    return JSON.stringify({
      exportado_en: new Date().toISOString(),
      total_registros: logs.length,
      registros: logs
    }, null, 2);
  }

  /**
   * Limpiar logs antiguos
   */
  limpiarLogsAntiguos(diasRetencion: number = 90): number {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasRetencion);

    const longitudAnterior = this.logs.length;
    this.logs = this.logs.filter(l => l.timestamp > fechaLimite);

    return longitudAnterior - this.logs.length;
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private generarId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async enviarABaseDatos(registro: RegistroAuditoria): Promise<void> {
    // TODO: Implementar envío a Supabase
    // await supabase.from('audit_logs').insert(registro);
    console.log('[AUDIT] Guardado en BD:', registro);
  }

  private mostrarEnConsola(registro: RegistroAuditoria): void {
    const emoji = {
      [NivelSeveridad.INFO]: 'ℹ️',
      [NivelSeveridad.WARNING]: '⚠️',
      [NivelSeveridad.ERROR]: '❌',
      [NivelSeveridad.CRITICAL]: '🚨'
    }[registro.severidad];

    console.log(
      `${emoji} [AUDIT] ${registro.accion.toUpperCase()} - ${registro.descripcion}`,
      registro
    );
  }

  private contarPorCampo(
    logs: RegistroAuditoria[],
    campo: keyof RegistroAuditoria
  ): Record<string, number> {
    return logs.reduce((acc, log) => {
      const valor = String(log[campo]);
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const auditLogger = new AuditLogger();

// ============================================
// HOOK DE REACT
// ============================================

import { useCallback } from 'react';

export const useAuditLog = (
  usuario_id: string,
  usuario_nombre: string,
  usuario_rol: Role
) => {
  const registrar = useCallback(
    async (params: Omit<Parameters<typeof auditLogger.registrar>[0], 'usuario_id' | 'usuario_nombre' | 'usuario_rol'>) => {
      await auditLogger.registrar({
        usuario_id,
        usuario_nombre,
        usuario_rol,
        ...params
      });
    },
    [usuario_id, usuario_nombre, usuario_rol]
  );

  return {
    registrar,
    registrarCreacion: (
      entidad_tipo: EntidadTipo,
      entidad_id: string,
      entidad_nombre: string,
      valores: Record<string, any>
    ) => auditLogger.registrarCreacion(
      usuario_id,
      usuario_nombre,
      usuario_rol,
      entidad_tipo,
      entidad_id,
      entidad_nombre,
      valores
    ),
    registrarActualizacion: (
      entidad_tipo: EntidadTipo,
      entidad_id: string,
      entidad_nombre: string,
      valoresAnteriores: Record<string, any>,
      valoresNuevos: Record<string, any>
    ) => auditLogger.registrarActualizacion(
      usuario_id,
      usuario_nombre,
      usuario_rol,
      entidad_tipo,
      entidad_id,
      entidad_nombre,
      valoresAnteriores,
      valoresNuevos
    ),
    registrarEliminacion: (
      entidad_tipo: EntidadTipo,
      entidad_id: string,
      entidad_nombre: string
    ) => auditLogger.registrarEliminacion(
      usuario_id,
      usuario_nombre,
      usuario_rol,
      entidad_tipo,
      entidad_id,
      entidad_nombre
    ),
    registrarExportacion: (
      entidad_tipo: EntidadTipo,
      cantidad: number,
      formato: string
    ) => auditLogger.registrarExportacion(
      usuario_id,
      usuario_nombre,
      usuario_rol,
      entidad_tipo,
      cantidad,
      formato
    )
  };
};

// ============================================
// EXPORTAR
// ============================================

export default auditLogger;
