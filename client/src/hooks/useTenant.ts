/**
 * 🏢 HOOK: useTenant
 * Acceder a configuración del tenant actual
 */

import { useEffect, useState } from 'react';
import { ACTIVE_TENANT, getTenantBySlug } from '../config/tenant.config';
import type { TenantConfig } from '../types/tenant.types';
import { applyBrandingToDOM } from '../config/branding.config';

export function useTenant() {
  const [tenant, setTenant] = useState<TenantConfig>(ACTIVE_TENANT);
  const [isLoading, setIsLoading] = useState(false);

  // Aplicar branding al cargar
  useEffect(() => {
    applyBrandingToDOM(tenant.branding);
  }, [tenant]);

  // Cambiar tenant dinámicamente
  const switchTenant = async (slug: string) => {
    setIsLoading(true);
    
    try {
      const newTenant = getTenantBySlug(slug);
      
      if (newTenant) {
        setTenant(newTenant);
        applyBrandingToDOM(newTenant.branding);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('activeTenant', slug);
      } else {
        console.error(`Tenant "${slug}" no encontrado`);
      }
    } catch (error) {
      console.error('Error al cambiar tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar tenant desde localStorage al iniciar
  useEffect(() => {
    const savedTenantSlug = localStorage.getItem('activeTenant');
    
    if (savedTenantSlug && savedTenantSlug !== tenant.slug) {
      const savedTenant = getTenantBySlug(savedTenantSlug);
      if (savedTenant) {
        setTenant(savedTenant);
      }
    }
  }, []);

  return {
    tenant,
    branding: tenant.branding,
    texts: tenant.texts,
    config: tenant.config,
    switchTenant,
    isLoading,
  };
}

// Hook simplificado para acceder solo al branding
export function useBranding() {
  const { branding } = useTenant();
  return branding;
}

// Hook simplificado para acceder solo a los textos
export function useTexts() {
  const { texts } = useTenant();
  return texts;
}

// Hook para verificar si una feature está habilitada
export function useFeature(
  role: 'cliente' | 'trabajador' | 'gerente',
  feature: string
) {
  const { config } = useTenant();
  return config.features[role]?.includes(feature) || false;
}

// Hook para verificar si un módulo está habilitado
export function useModule(module: keyof TenantConfig['config']['modules']) {
  const { config } = useTenant();
  return config.modules[module] || false;
}

// Hook para verificar si una integración está habilitada
export function useIntegration(integration: keyof TenantConfig['config']['integrations']) {
  const { config } = useTenant();
  return config.integrations[integration] || false;
}
