/**
 * 🏢 TIPOS PARA SISTEMA MULTI-TENANT
 * Sistema white-label donde cada empresa puede tener su propio branding
 */

export interface TenantBranding {
  // Identidad de marca
  appName: string;
  companyName: string;
  tagline: string;
  
  // Logo (puede ser URL o import)
  logo: string;
  logoSmall: string; // Para sidebar colapsada
  favicon: string;
  
  // Colores (CSS variables)
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  
  // Fuentes
  fonts: {
    heading: string;
    body: string;
  };
  
  // Imágenes
  images: {
    loginBackground?: string;
    onboardingSlides?: string[];
    emptyStateImage?: string;
  };
}

export interface TenantTexts {
  // Login
  login: {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    loginButton: string;
    registerButton: string;
    forgotPassword: string;
    orContinueWith: string;
  };
  
  // Onboarding
  onboarding: {
    skip: string;
    next: string;
    getStarted: string;
    slides: Array<{
      title: string;
      description: string;
    }>;
  };
  
  // Cliente
  cliente: {
    dashboard: {
      title: string;
      welcomeMessage: string;
    };
    orders: {
      title: string;
      emptyState: string;
      newOrderButton: string;
    };
    favorites: {
      title: string;
      emptyState: string;
    };
    profile: {
      title: string;
      editButton: string;
    };
  };
  
  // Trabajador
  trabajador: {
    dashboard: {
      title: string;
      welcomeMessage: string;
    };
    tasks: {
      title: string;
      emptyState: string;
    };
    schedule: {
      title: string;
    };
  };
  
  // Gerente
  gerente: {
    dashboard: {
      title: string;
      welcomeMessage: string;
    };
    products: {
      title: string;
      newProductButton: string;
      emptyState: string;
    };
    analytics: {
      title: string;
    };
    integrations: {
      title: string;
    };
    users: {
      title: string;
      newUserButton: string;
    };
  };
  
  // Común
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    logout: string;
    settings: string;
    search: string;
    filter: string;
    sort: string;
    actions: string;
  };
}

export interface TenantConfig {
  // Identificación
  id: string;
  slug: string; // Para URL: app.com/tenant-slug
  
  // Branding
  branding: TenantBranding;
  
  // Textos
  texts: TenantTexts;
  
  // Configuración
  config: {
    // Features habilitadas por rol
    features: {
      cliente: string[];
      trabajador: string[];
      gerente: string[];
    };
    
    // Módulos disponibles
    modules: {
      products: boolean;
      orders: boolean;
      analytics: boolean;
      integrations: boolean;
      users: boolean;
      tasks: boolean;
      schedule: boolean;
    };
    
    // Integraciones habilitadas
    integrations: {
      monei: boolean;
      glovo: boolean;
      uberEats: boolean;
      justEat: boolean;
    };
    
    // OAuth providers habilitados
    oauth: {
      google: boolean;
      apple: boolean;
      facebook: boolean;
    };
    
    // Configuración regional
    locale: string;
    currency: string;
    timezone: string;
  };
}

export type UserRole = 'cliente' | 'trabajador' | 'gerente';

export interface TenantUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
}
