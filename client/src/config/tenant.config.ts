/**
 * 🏢 CONFIGURACIÓN MULTI-TENANT
 * Define empresas/clientes con su propio branding y configuración
 */

import type { TenantConfig } from '../types/tenant.types';
import { 
  BRANDING_UDAR_EDGE, 
  BRANDING_LA_PIZZERIA, 
  BRANDING_COFFEE_HOUSE,
  BRANDING_FASHION_STORE,
  BRANDING_HOY_PECAMOS
} from './branding.config';
import { 
  TEXTS_ES_GENERIC, 
  TEXTS_ES_PIZZERIA, 
  TEXTS_ES_COFFEE,
  TEXTS_ES_HOY_PECAMOS
} from './texts.config';

// ============================================
// 🎨 TENANT 1: UDAR EDGE (App genérica)
// ============================================
export const TENANT_UDAR_EDGE: TenantConfig = {
  id: 'tenant-001',
  slug: 'udar-edge',
  
  branding: BRANDING_UDAR_EDGE,
  texts: TEXTS_ES_GENERIC,
  
  config: {
    features: {
      cliente: ['orders', 'favorites', 'profile', 'notifications'],
      trabajador: ['tasks', 'schedule', 'checkin', 'notifications'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'integrations', 'users', 'settings'],
    },
    
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: true,
      users: true,
      tasks: true,
      schedule: true,
    },
    
    integrations: {
      monei: true,
      glovo: true,
      uberEats: true,
      justEat: true,
    },
    
    oauth: {
      google: true,
      apple: true,
      facebook: true,
    },
    
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};

// ============================================
// 🍕 TENANT 2: LA PIZZERÍA
// ============================================
export const TENANT_LA_PIZZERIA: TenantConfig = {
  id: 'tenant-002',
  slug: 'la-pizzeria',
  
  branding: BRANDING_LA_PIZZERIA,
  texts: TEXTS_ES_PIZZERIA,
  
  config: {
    features: {
      cliente: ['orders', 'favorites', 'profile'],
      trabajador: ['tasks', 'schedule'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'integrations', 'users'],
    },
    
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: true,
      users: true,
      tasks: true,
      schedule: true,
    },
    
    integrations: {
      monei: true,
      glovo: true,
      uberEats: true,
      justEat: false, // Just Eat deshabilitado
    },
    
    oauth: {
      google: true,
      apple: false, // Apple login deshabilitado
      facebook: true,
    },
    
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};

// ============================================
// ☕ TENANT 3: COFFEE HOUSE
// ============================================
export const TENANT_COFFEE_HOUSE: TenantConfig = {
  id: 'tenant-003',
  slug: 'coffee-house',
  
  branding: BRANDING_COFFEE_HOUSE,
  texts: TEXTS_ES_COFFEE,
  
  config: {
    features: {
      cliente: ['orders', 'favorites', 'profile', 'loyalty'], // Programa de lealtad
      trabajador: ['tasks', 'schedule'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'users'],
    },
    
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: false, // Sin integraciones delivery
      users: true,
      tasks: true,
      schedule: true,
    },
    
    integrations: {
      monei: true,
      glovo: false, // Solo recogida en local
      uberEats: false,
      justEat: false,
    },
    
    oauth: {
      google: true,
      apple: true,
      facebook: false,
    },
    
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};

// ============================================
// 👗 TENANT 4: FASHION STORE
// ============================================
export const TENANT_FASHION_STORE: TenantConfig = {
  id: 'tenant-004',
  slug: 'fashion-store',
  
  branding: BRANDING_FASHION_STORE,
  texts: TEXTS_ES_GENERIC, // Usa textos genéricos
  
  config: {
    features: {
      cliente: ['orders', 'favorites', 'profile', 'wishlist'],
      trabajador: ['tasks', 'schedule', 'inventory'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'users', 'inventory'],
    },
    
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: false, // Sin delivery
      users: true,
      tasks: true,
      schedule: true,
    },
    
    integrations: {
      monei: true,
      glovo: false,
      uberEats: false,
      justEat: false,
    },
    
    oauth: {
      google: true,
      apple: true,
      facebook: true,
    },
    
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};

// ============================================
// 🍰 TENANT 5: HOY PECAMOS
// ============================================
export const TENANT_HOY_PECAMOS: TenantConfig = {
  id: 'tenant-005',
  slug: 'hoy-pecamos',
  
  branding: BRANDING_HOY_PECAMOS,
  texts: TEXTS_ES_HOY_PECAMOS,
  
  config: {
    features: {
      cliente: ['orders', 'favorites', 'profile', 'notifications'],
      trabajador: ['tasks', 'schedule', 'checkin'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'integrations', 'users', 'settings'],
    },
    
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: true,
      users: true,
      tasks: true,
      schedule: true,
    },
    
    integrations: {
      monei: true,
      glovo: true,
      uberEats: true,
      justEat: false,
    },
    
    oauth: {
      google: true,
      apple: false,
      facebook: true,
    },
    
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};

// ============================================
// ⚙️ CONFIGURACIÓN ACTIVA
// ============================================

/**
 * 🎯 CAMBIA AQUÍ PARA SELECCIONAR EL TENANT ACTIVO
 * 
 * Esto cambiará:
 * - Logo y colores (branding)
 * - Todos los textos (texts)
 * - Features habilitadas (config.features)
 * - Módulos disponibles (config.modules)
 * - Integraciones activas (config.integrations)
 */
export const ACTIVE_TENANT: TenantConfig = TENANT_HOY_PECAMOS;

// ============================================
// 📚 TODOS LOS TENANTS DISPONIBLES
// ============================================
export const ALL_TENANTS = {
  'udar-edge': TENANT_UDAR_EDGE,
  'la-pizzeria': TENANT_LA_PIZZERIA,
  'coffee-house': TENANT_COFFEE_HOUSE,
  'fashion-store': TENANT_FASHION_STORE,
  'hoy-pecamos': TENANT_HOY_PECAMOS,
};

export type TenantKey = keyof typeof ALL_TENANTS;

// ============================================
// 🔧 HELPER: Obtener tenant por slug
// ============================================
export function getTenantBySlug(slug: string): TenantConfig | undefined {
  return Object.values(ALL_TENANTS).find(t => t.slug === slug);
}

// ============================================
// 🔧 HELPER: Verificar si feature está habilitada
// ============================================
export function isFeatureEnabled(
  tenant: TenantConfig,
  role: 'cliente' | 'trabajador' | 'gerente',
  feature: string
): boolean {
  return tenant.config.features[role]?.includes(feature) || false;
}

// ============================================
// 🔧 HELPER: Verificar si módulo está habilitado
// ============================================
export function isModuleEnabled(
  tenant: TenantConfig,
  module: keyof TenantConfig['config']['modules']
): boolean {
  return tenant.config.modules[module] || false;
}

// ============================================
// 🔧 HELPER: Verificar si integración está habilitada
// ============================================
export function isIntegrationEnabled(
  tenant: TenantConfig,
  integration: keyof TenantConfig['config']['integrations']
): boolean {
  return tenant.config.integrations[integration] || false;
}