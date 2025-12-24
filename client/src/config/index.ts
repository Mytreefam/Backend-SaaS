/**
 * 📦 EXPORTS CENTRALIZADOS DE CONFIGURACIÓN
 * Importa todo desde aquí para mayor comodidad
 */

// ============================================
// 🎨 BRANDING
// ============================================
export {
  BRANDING_UDAR_EDGE,
  BRANDING_LA_PIZZERIA,
  BRANDING_COFFEE_HOUSE,
  BRANDING_FASHION_STORE,
  BRANDING_HOY_PECAMOS,
  ACTIVE_BRANDING,
  ALL_BRANDINGS,
  applyBrandingToDOM,
  type BrandingKey,
} from './branding.config';

// ============================================
// 📝 TEXTOS
// ============================================
export {
  TEXTS_ES_GENERIC,
  TEXTS_ES_PIZZERIA,
  TEXTS_ES_COFFEE,
  TEXTS_ES_HOY_PECAMOS,
  TEXTS_EN_GENERIC,
} from './texts.config';

// ============================================
// 🏢 TENANTS
// ============================================
export {
  TENANT_UDAR_EDGE,
  TENANT_LA_PIZZERIA,
  TENANT_COFFEE_HOUSE,
  TENANT_FASHION_STORE,
  TENANT_HOY_PECAMOS,
  ACTIVE_TENANT,
  ALL_TENANTS,
  getTenantBySlug,
  isFeatureEnabled,
  isModuleEnabled,
  isIntegrationEnabled,
  type TenantKey,
} from './tenant.config';

// ============================================
// ⚙️ OTRAS CONFIGURACIONES
// ============================================
export * from './app.config';
export * from './features.config';
export * from './i18n.config';
export * from './timezone.config';
export * from './white-label.config';
