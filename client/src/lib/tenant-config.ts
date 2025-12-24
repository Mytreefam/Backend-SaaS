/**
 * 🏢 SISTEMA DE CONFIGURACIÓN MULTI-EMPRESA (TENANT)
 * Gestión de configuración personalizada por empresa
 */

import { useMemo, useState, useEffect } from 'react';
import { isProduction } from './env-utils';

// ============================================
// TIPOS
// ============================================

export interface TenantConfig {
  // Identificación
  tenant_id: string;
  nombre_empresa: string;
  nombre_comercial?: string;
  
  // Branding
  logo_url?: string;
  logo_dark_url?: string; // Para modo oscuro
  favicon_url?: string;
  colores: {
    primario: string;
    secundario: string;
    acento: string;
    exito: string;
    advertencia: string;
    error: string;
    info: string;
  };
  
  // Datos Fiscales
  cif_nif: string;
  direccion_fiscal: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  telefono?: string;
  email_contacto?: string;
  web?: string;
  
  // Configuración Regional
  idioma: 'es' | 'en' | 'ca' | 'eu';
  zona_horaria: string;
  moneda: string;
  simbolo_moneda: string;
  formato_fecha: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  formato_hora: '12h' | '24h';
  primer_dia_semana: 0 | 1; // 0 = Domingo, 1 = Lunes
  
  // Configuración Fiscal
  tipo_iva_defecto: number;
  regimen_fiscal: 'general' | 'simplificado' | 'autonomo' | 'sociedad';
  incluir_iva_precios: boolean;
  
  // Configuración de Negocio
  sectores: string[];
  tipo_negocio: 'restaurante' | 'cafeteria' | 'panaderia' | 'retail' | 'mixto';
  numero_empleados: number;
  numero_puntos_venta: number;
  
  // Features habilitados
  features: {
    tpv: boolean;
    inventario: boolean;
    rrhh: boolean;
    contabilidad: boolean;
    crm: boolean;
    reservas: boolean;
    delivery: boolean;
    produccion: boolean;
    analytics: boolean;
    multi_pdv: boolean;
  };
  
  // Configuración de Suscripción
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  fecha_alta: Date;
  fecha_expiracion?: Date;
  estado: 'activo' | 'prueba' | 'suspendido' | 'cancelado';
  limite_usuarios: number;
  limite_storage_gb: number;
  
  // Notificaciones
  notificaciones: {
    email_pedidos: boolean;
    email_stock_bajo: boolean;
    email_facturas: boolean;
    sms_alertas: boolean;
    push_enabled: boolean;
  };
  
  // Integraciones
  integraciones: {
    stripe_enabled: boolean;
    stripe_key?: string;
    google_analytics_id?: string;
    sendgrid_key?: string;
    twilio_enabled: boolean;
    contabilidad_sistema?: 'holded' | 'a3' | 'sage' | 'ninguno';
  };
  
  // Personalización UI
  ui_config: {
    tema: 'light' | 'dark' | 'auto';
    densidad: 'compacta' | 'normal' | 'espaciosa';
    sidebar_expandido: boolean;
    mostrar_barra_ayuda: boolean;
    animaciones_habilitadas: boolean;
  };
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

// ============================================
// CONFIGURACIONES POR DEFECTO
// ============================================

export const DEFAULT_TENANT_CONFIG: Omit<TenantConfig, 'tenant_id' | 'nombre_empresa' | 'cif_nif' | 'direccion_fiscal' | 'codigo_postal' | 'ciudad' | 'provincia'> = {
  pais: 'España',
  
  colores: {
    primario: '#0d9488', // teal-600
    secundario: '#14b8a6', // teal-500
    acento: '#f59e0b', // amber-500
    exito: '#10b981', // green-500
    advertencia: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },
  
  idioma: 'es',
  zona_horaria: 'Europe/Madrid',
  moneda: 'EUR',
  simbolo_moneda: '€',
  formato_fecha: 'DD/MM/YYYY',
  formato_hora: '24h',
  primer_dia_semana: 1,
  
  tipo_iva_defecto: 21,
  regimen_fiscal: 'general',
  incluir_iva_precios: true,
  
  sectores: ['Hostelería'],
  tipo_negocio: 'cafeteria',
  numero_empleados: 5,
  numero_puntos_venta: 1,
  
  features: {
    tpv: true,
    inventario: true,
    rrhh: true,
    contabilidad: true,
    crm: true,
    reservas: false,
    delivery: false,
    produccion: true,
    analytics: true,
    multi_pdv: false,
  },
  
  plan: 'starter',
  fecha_alta: new Date(),
  estado: 'activo',
  limite_usuarios: 10,
  limite_storage_gb: 5,
  
  notificaciones: {
    email_pedidos: true,
    email_stock_bajo: true,
    email_facturas: true,
    sms_alertas: false,
    push_enabled: true,
  },
  
  integraciones: {
    stripe_enabled: false,
    twilio_enabled: false,
    contabilidad_sistema: 'ninguno',
  },
  
  ui_config: {
    tema: 'light',
    densidad: 'normal',
    sidebar_expandido: true,
    mostrar_barra_ayuda: true,
    animaciones_habilitadas: true,
  },
  
  created_at: new Date(),
  updated_at: new Date(),
  created_by: 'sistema',
};

// ============================================
// LÍMITES POR PLAN
// ============================================

export const LIMITES_PLANES = {
  free: {
    usuarios: 2,
    storage_gb: 1,
    pedidos_mes: 100,
    productos: 50,
    features: {
      tpv: true,
      inventario: true,
      rrhh: false,
      contabilidad: false,
      crm: false,
      reservas: false,
      delivery: false,
      produccion: false,
      analytics: false,
      multi_pdv: false,
    }
  },
  starter: {
    usuarios: 10,
    storage_gb: 5,
    pedidos_mes: 1000,
    productos: 500,
    features: {
      tpv: true,
      inventario: true,
      rrhh: true,
      contabilidad: true,
      crm: true,
      reservas: false,
      delivery: false,
      produccion: true,
      analytics: true,
      multi_pdv: false,
    }
  },
  professional: {
    usuarios: 50,
    storage_gb: 25,
    pedidos_mes: 10000,
    productos: 5000,
    features: {
      tpv: true,
      inventario: true,
      rrhh: true,
      contabilidad: true,
      crm: true,
      reservas: true,
      delivery: true,
      produccion: true,
      analytics: true,
      multi_pdv: true,
    }
  },
  enterprise: {
    usuarios: -1, // Ilimitado
    storage_gb: 100,
    pedidos_mes: -1, // Ilimitado
    productos: -1, // Ilimitado
    features: {
      tpv: true,
      inventario: true,
      rrhh: true,
      contabilidad: true,
      crm: true,
      reservas: true,
      delivery: true,
      produccion: true,
      analytics: true,
      multi_pdv: true,
    }
  }
};

// ============================================
// CLASE DE GESTIÓN
// ============================================

class TenantManager {
  private configs: Map<string, TenantConfig> = new Map();
  private currentTenantId: string | null = null;

  /**
   * Establecer tenant actual
   */
  setCurrentTenant(tenantId: string): void {
    this.currentTenantId = tenantId;
  }

  /**
   * Obtener tenant actual
   */
  getCurrentTenant(): TenantConfig | null {
    if (!this.currentTenantId) return null;
    return this.configs.get(this.currentTenantId) || null;
  }

  /**
   * Guardar configuración de tenant
   */
  async saveConfig(config: TenantConfig): Promise<void> {
    config.updated_at = new Date();
    this.configs.set(config.tenant_id, config);

    // En producción, guardar en base de datos
    if (isProduction) {
      await this.guardarEnBaseDatos(config);
    }
  }

  /**
   * Cargar configuración de tenant
   */
  async loadConfig(tenantId: string): Promise<TenantConfig | null> {
    // Intentar obtener de caché
    let config = this.configs.get(tenantId);
    
    if (!config) {
      // Cargar de base de datos
      config = await this.cargarDeBaseDatos(tenantId);
      if (config) {
        this.configs.set(tenantId, config);
      }
    }

    return config || null;
  }

  /**
   * Crear nuevo tenant
   */
  async createTenant(
    nombre_empresa: string,
    cif_nif: string,
    email_contacto: string,
    partial?: Partial<TenantConfig>
  ): Promise<TenantConfig> {
    const tenantId = this.generarTenantId();

    const config: TenantConfig = {
      ...DEFAULT_TENANT_CONFIG,
      tenant_id: tenantId,
      nombre_empresa,
      cif_nif,
      email_contacto,
      direccion_fiscal: '',
      codigo_postal: '',
      ciudad: '',
      provincia: '',
      ...partial
    };

    await this.saveConfig(config);
    return config;
  }

  /**
   * Actualizar configuración
   */
  async updateConfig(
    tenantId: string,
    updates: Partial<TenantConfig>
  ): Promise<TenantConfig | null> {
    const config = await this.loadConfig(tenantId);
    if (!config) return null;

    const updatedConfig = {
      ...config,
      ...updates,
      tenant_id: config.tenant_id, // No permitir cambiar ID
      updated_at: new Date()
    };

    await this.saveConfig(updatedConfig);
    return updatedConfig;
  }

  /**
   * Verificar si un feature está habilitado
   */
  isFeatureEnabled(
    tenantId: string,
    feature: keyof TenantConfig['features']
  ): boolean {
    const config = this.configs.get(tenantId);
    if (!config) return false;

    // Verificar límites del plan
    const limitesPlan = LIMITES_PLANES[config.plan];
    if (!limitesPlan.features[feature]) return false;

    return config.features[feature];
  }

  /**
   * Verificar límite de usuarios
   */
  canAddUser(tenantId: string, currentUsers: number): boolean {
    const config = this.configs.get(tenantId);
    if (!config) return false;

    const limite = LIMITES_PLANES[config.plan].usuarios;
    return limite === -1 || currentUsers < limite;
  }

  /**
   * Aplicar tema personalizado
   */
  applyTheme(config: TenantConfig): void {
    const root = document.documentElement;

    // Aplicar colores
    root.style.setProperty('--color-primary', config.colores.primario);
    root.style.setProperty('--color-secondary', config.colores.secundario);
    root.style.setProperty('--color-accent', config.colores.acento);
    root.style.setProperty('--color-success', config.colores.exito);
    root.style.setProperty('--color-warning', config.colores.advertencia);
    root.style.setProperty('--color-error', config.colores.error);
    root.style.setProperty('--color-info', config.colores.info);

    // Aplicar tema
    if (config.ui_config.tema === 'dark') {
      root.classList.add('dark');
    } else if (config.ui_config.tema === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto: detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Actualizar favicon
    if (config.favicon_url) {
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon) {
        favicon.href = config.favicon_url;
      }
    }

    // Actualizar título
    document.title = `${config.nombre_comercial || config.nombre_empresa} - Udar Edge`;
  }

  /**
   * Formatear moneda según configuración
   */
  formatCurrency(amount: number, tenantId: string): string {
    const config = this.configs.get(tenantId);
    if (!config) return `${amount}`;

    return new Intl.NumberFormat(config.idioma, {
      style: 'currency',
      currency: config.moneda
    }).format(amount);
  }

  /**
   * Formatear fecha según configuración
   */
  formatDate(date: Date, tenantId: string): string {
    const config = this.configs.get(tenantId);
    if (!config) return date.toLocaleDateString();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: config.zona_horaria
    };

    return new Intl.DateTimeFormat(config.idioma, options).format(date);
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  private generarTenantId(): string {
    return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async guardarEnBaseDatos(config: TenantConfig): Promise<void> {
    // TODO: Implementar con Supabase
    console.log('[TENANT] Guardando config:', config.tenant_id);
  }

  private async cargarDeBaseDatos(tenantId: string): Promise<TenantConfig | null> {
    // TODO: Implementar con Supabase
    console.log('[TENANT] Cargando config:', tenantId);
    return null;
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const tenantManager = new TenantManager();

// ============================================
// HOOKS DE REACT
// ============================================

/**
 * Hook para obtener configuración del tenant actual
 */
export const useTenantConfig = () => {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      const currentConfig = tenantManager.getCurrentTenant();
      setConfig(currentConfig);
      setLoading(false);

      // Aplicar tema si existe
      if (currentConfig) {
        tenantManager.applyTheme(currentConfig);
      }
    };

    loadConfig();
  }, []);

  return { config, loading };
};

/**
 * Hook para verificar features habilitados
 */
export const useFeatureEnabled = (feature: keyof TenantConfig['features']) => {
  const { config } = useTenantConfig();

  return useMemo(() => {
    if (!config) return false;
    return tenantManager.isFeatureEnabled(config.tenant_id, feature);
  }, [config, feature]);
};

/**
 * Hook para formatear moneda
 */
export const useFormatCurrency = () => {
  const { config } = useTenantConfig();

  return useCallback((amount: number) => {
    if (!config) return `€${amount.toFixed(2)}`;
    return tenantManager.formatCurrency(amount, config.tenant_id);
  }, [config]);
};

/**
 * Hook para formatear fecha
 */
export const useFormatDate = () => {
  const { config } = useTenantConfig();

  return useCallback((date: Date) => {
    if (!config) return date.toLocaleDateString();
    return tenantManager.formatDate(date, config.tenant_id);
  }, [config]);
};

// ============================================
// EXPORTAR
// ============================================

export default tenantManager;
