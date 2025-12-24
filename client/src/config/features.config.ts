/**
 * FEATURE FLAGS - CONTROL DE MÓDULOS
 * 
 * Activa/desactiva funcionalidades según el plan del cliente
 * o para desarrollo/staging
 */

import React from 'react';
import { isDevelopment } from '../lib/env-utils';

export interface FeaturesConfig {
  // Módulos principales
  modules: {
    tpv: boolean;                    // Sistema TPV 360
    stock: boolean;                  // Gestión de stock y proveedores
    delivery: boolean;               // Delivery y pedidos online
    rrhh: boolean;                   // Recursos Humanos (fichaje, documentación)
    clientes: boolean;               // Gestión de clientes
    contabilidad: boolean;           // EBITDA, cuenta de resultados
    chats: boolean;                  // Sistema de chats
    documentacion: boolean;          // Documentación laboral
    agentesExternos: boolean;        // Agentes externos
    reportes: boolean;               // Reportes y analíticas
  };

  // Funcionalidades específicas
  capabilities: {
    // TPV
    cajaRapida: boolean;
    pagoMixto: boolean;
    descuentos: boolean;
    propinas: boolean;
    
    // Stock
    conteoInventario: boolean;
    alertasStock: boolean;
    pedidosAutomaticos: boolean;
    
    // RRHH
    fichaje: boolean;
    geofencing: boolean;
    biometria: boolean;
    permisos: boolean;
    formacion: boolean;
    
    // Clientes
    programaFidelizacion: boolean;
    notificacionesPush: boolean;
    chatClientes: boolean;
    
    // General
    offlineMode: boolean;
    multiempresa: boolean;
    exportarDatos: boolean;
    integraciones: boolean;
  };

  // Integraciones externas
  integrations: {
    oauth: {
      google: boolean;
      facebook: boolean;
      apple: boolean;
    };
    payments: {
      stripe: boolean;
      paypal: boolean;
      redsys: boolean;
    };
    analytics: {
      googleAnalytics: boolean;
      mixpanel: boolean;
      sentry: boolean;
    };
    automation: {
      makecom: boolean;
      zapier: boolean;
    };
    ocr: boolean;
    email: boolean;
    sms: boolean;
  };

  // Límites por plan
  limits: {
    maxUsuarios: number;            // -1 = ilimitado
    maxProductos: number;
    maxClientes: number;
    maxEmpresas: number;
    maxAlmacenamiento: number;      // MB
    maxTicketsAlMes: number;
  };

  // Características de UI/UX
  ui: {
    whiteLabel: boolean;            // Personalización de marca
    darkMode: boolean;
    multiidioma: boolean;
    accesibilidad: boolean;
  };

  // Desarrollo
  dev: {
    debugMode: boolean;
    mockData: boolean;
    consoleLogging: boolean;
    errorBoundaries: boolean;
  };
}

// ============================================================================
// PLANES PREDEFINIDOS
// ============================================================================

/**
 * PLAN BÁSICO - Para negocios pequeños
 */
export const PLAN_BASICO: FeaturesConfig = {
  modules: {
    tpv: true,
    stock: true,
    delivery: false,
    rrhh: false,
    clientes: true,
    contabilidad: false,
    chats: false,
    documentacion: false,
    agentesExternos: false,
    reportes: true,
  },
  capabilities: {
    cajaRapida: true,
    pagoMixto: false,
    descuentos: true,
    propinas: false,
    conteoInventario: true,
    alertasStock: false,
    pedidosAutomaticos: false,
    fichaje: false,
    geofencing: false,
    biometria: false,
    permisos: false,
    formacion: false,
    programaFidelizacion: false,
    notificacionesPush: false,
    chatClientes: false,
    offlineMode: true,
    multiempresa: false,
    exportarDatos: false,
    integraciones: false,
  },
  integrations: {
    oauth: { google: true, facebook: false, apple: false },
    payments: { stripe: false, paypal: false, redsys: false },
    analytics: { googleAnalytics: false, mixpanel: false, sentry: false },
    automation: { makecom: false, zapier: false },
    ocr: false,
    email: false,
    sms: false,
  },
  limits: {
    maxUsuarios: 3,
    maxProductos: 100,
    maxClientes: 500,
    maxEmpresas: 1,
    maxAlmacenamiento: 500,
    maxTicketsAlMes: 1000,
  },
  ui: {
    whiteLabel: false,
    darkMode: true,
    multiidioma: false,
    accesibilidad: true,
  },
  dev: {
    debugMode: false,
    mockData: false,
    consoleLogging: false,
    errorBoundaries: true,
  },
};

/**
 * PLAN PROFESIONAL - Para negocios medianos
 */
export const PLAN_PROFESIONAL: FeaturesConfig = {
  modules: {
    tpv: true,
    stock: true,
    delivery: true,
    rrhh: true,
    clientes: true,
    contabilidad: true,
    chats: true,
    documentacion: true,
    agentesExternos: false,
    reportes: true,
  },
  capabilities: {
    cajaRapida: true,
    pagoMixto: true,
    descuentos: true,
    propinas: true,
    conteoInventario: true,
    alertasStock: true,
    pedidosAutomaticos: false,
    fichaje: true,
    geofencing: true,
    biometria: true,
    permisos: true,
    formacion: true,
    programaFidelizacion: true,
    notificacionesPush: true,
    chatClientes: true,
    offlineMode: true,
    multiempresa: false,
    exportarDatos: true,
    integraciones: true,
  },
  integrations: {
    oauth: { google: true, facebook: true, apple: true },
    payments: { stripe: true, paypal: true, redsys: false },
    analytics: { googleAnalytics: true, mixpanel: false, sentry: true },
    automation: { makecom: true, zapier: false },
    ocr: true,
    email: true,
    sms: false,
  },
  limits: {
    maxUsuarios: 15,
    maxProductos: 1000,
    maxClientes: 5000,
    maxEmpresas: 1,
    maxAlmacenamiento: 5000,
    maxTicketsAlMes: 10000,
  },
  ui: {
    whiteLabel: false,
    darkMode: true,
    multiidioma: true,
    accesibilidad: true,
  },
  dev: {
    debugMode: false,
    mockData: false,
    consoleLogging: false,
    errorBoundaries: true,
  },
};

/**
 * PLAN PREMIUM - Para cadenas y franquicias
 */
export const PLAN_PREMIUM: FeaturesConfig = {
  modules: {
    tpv: true,
    stock: true,
    delivery: true,
    rrhh: true,
    clientes: true,
    contabilidad: true,
    chats: true,
    documentacion: true,
    agentesExternos: true,
    reportes: true,
  },
  capabilities: {
    cajaRapida: true,
    pagoMixto: true,
    descuentos: true,
    propinas: true,
    conteoInventario: true,
    alertasStock: true,
    pedidosAutomaticos: true,
    fichaje: true,
    geofencing: true,
    biometria: true,
    permisos: true,
    formacion: true,
    programaFidelizacion: true,
    notificacionesPush: true,
    chatClientes: true,
    offlineMode: true,
    multiempresa: true,
    exportarDatos: true,
    integraciones: true,
  },
  integrations: {
    oauth: { google: true, facebook: true, apple: true },
    payments: { stripe: true, paypal: true, redsys: true },
    analytics: { googleAnalytics: true, mixpanel: true, sentry: true },
    automation: { makecom: true, zapier: true },
    ocr: true,
    email: true,
    sms: true,
  },
  limits: {
    maxUsuarios: -1,       // Ilimitado
    maxProductos: -1,
    maxClientes: -1,
    maxEmpresas: -1,
    maxAlmacenamiento: -1,
    maxTicketsAlMes: -1,
  },
  ui: {
    whiteLabel: true,
    darkMode: true,
    multiidioma: true,
    accesibilidad: true,
  },
  dev: {
    debugMode: false,
    mockData: false,
    consoleLogging: false,
    errorBoundaries: true,
  },
};

/**
 * PLAN DESARROLLO - Para testing
 */
export const PLAN_DESARROLLO: FeaturesConfig = {
  ...PLAN_PREMIUM,
  dev: {
    debugMode: true,
    mockData: true,
    consoleLogging: true,
    errorBoundaries: true,
  },
};

// ============================================================================
// CONFIGURACIÓN ACTIVA
// ============================================================================

/**
 * Configuración que se usará en la aplicación
 * EDITAR SEGÚN EL CLIENTE
 */
export let ACTIVE_FEATURES: FeaturesConfig = PLAN_DESARROLLO;

/**
 * Setear el plan activo
 */
export const setActivePlan = (plan: 'basico' | 'profesional' | 'premium' | 'desarrollo'): void => {
  switch (plan) {
    case 'basico':
      ACTIVE_FEATURES = PLAN_BASICO;
      break;
    case 'profesional':
      ACTIVE_FEATURES = PLAN_PROFESIONAL;
      break;
    case 'premium':
      ACTIVE_FEATURES = PLAN_PREMIUM;
      break;
    case 'desarrollo':
      ACTIVE_FEATURES = PLAN_DESARROLLO;
      break;
  }
  
  console.log(`✅ Plan activado: ${plan.toUpperCase()}`);
};

/**
 * Cargar plan desde variable de entorno o localStorage
 */
export const loadPlanFromEnv = (): void => {
  // En desarrollo, usar el plan de desarrollo por defecto
  const envPlan = isDevelopment ? 'desarrollo' : 'basico';
  setActivePlan(envPlan);
};

/**
 * Verificar si un módulo está activo
 */
export const isModuleEnabled = (module: keyof FeaturesConfig['modules']): boolean => {
  return ACTIVE_FEATURES.modules[module];
};

/**
 * Verificar si una capacidad está activa
 */
export const isCapabilityEnabled = (capability: keyof FeaturesConfig['capabilities']): boolean => {
  return ACTIVE_FEATURES.capabilities[capability];
};

/**
 * Obtener límite
 */
export const getLimit = (limit: keyof FeaturesConfig['limits']): number => {
  return ACTIVE_FEATURES.limits[limit];
};

/**
 * Verificar si se alcanzó un límite
 */
export const hasReachedLimit = (limit: keyof FeaturesConfig['limits'], current: number): boolean => {
  const max = getLimit(limit);
  if (max === -1) return false; // Ilimitado
  return current >= max;
};

// ============================================================================
// HELPERS PARA COMPONENTES
// ============================================================================

/**
 * HOC para envolver componentes según feature flag
 */
export const withFeature = (
  Component: React.ComponentType<any>,
  feature: keyof FeaturesConfig['modules'] | keyof FeaturesConfig['capabilities']
) => {
  return (props: any) => {
    const isEnabled = 
      isModuleEnabled(feature as keyof FeaturesConfig['modules']) ||
      isCapabilityEnabled(feature as keyof FeaturesConfig['capabilities']);
    
    if (!isEnabled) return null;
    return <Component {...props} />;
  };
};

/**
 * Hook para verificar features
 */
export const useFeature = (feature: string): boolean => {
  // Implementar con React hooks si es necesario
  return true;
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default ACTIVE_FEATURES;

// Tipos
export type PlanType = 'basico' | 'profesional' | 'premium' | 'desarrollo';
