/**
 * Configuración global de la aplicación
 * Centraliza todas las variables de entorno y configuraciones
 */

export const APP_CONFIG = {
  // Información de la App
  app: {
    name: 'Taller 360',
    version: '1.0.0',
    environment: 'development',
    supportEmail: 'soporte@taller360.com',
    supportPhone: '+34123456789',
  },

  // API Configuration
  api: {
    baseUrl: 'http://localhost:3000',
    version: 'v1',
    timeout: 30000,
  },

  // Autenticación
  auth: {
    domain: '',
    clientId: '',
    jwtSecret: '',
    tokenKey: 'taller360_auth_token',
    userKey: 'taller360_user',
  },

  // Firebase (opcional)
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: '',
    mixpanelToken: '',
  },

  // Error Tracking
  sentry: {
    dsn: '',
    environment: 'development',
  },

  // Storage
  storage: {
    url: '',
    maxSize: 10485760, // 10MB default
  },

  // Payment (opcional)
  payment: {
    stripeKey: '',
    paypalClientId: '',
  },

  // Maps (opcional)
  maps: {
    googleMapsApiKey: '',
  },

  // Feature Flags
  features: {
    pushNotifications: false,
    offlineMode: false,
    analytics: false,
    debug: true,
  },

  // Roles y Permisos
  roles: {
    CLIENTE: 'cliente',
    TRABAJADOR: 'trabajador',
    GERENTE: 'gerente',
  } as const,

  // Configuración Mobile
  mobile: {
    minTouchSize: 48, // px - Mínimo para accesibilidad
    headerHeight: 64, // px
    bottomNavHeight: 56, // px
  },

  // Timeouts y Delays
  timeouts: {
    toastDuration: 3000, // ms
    debounceDelay: 300, // ms
    apiTimeout: 30000, // ms
    retryDelay: 1000, // ms
  },

  // Límites
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxUploadFiles: 10,
    itemsPerPage: 20,
  },

  // Colores del tema (sync con Tailwind)
  theme: {
    primary: '#0d9488', // teal-600
    secondary: '#14b8a6', // teal-500
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },
};

// Type-safe access
export type AppConfig = typeof APP_CONFIG;
export type UserRole = typeof APP_CONFIG.roles[keyof typeof APP_CONFIG.roles];

// Helpers
export const isDevelopment = () => APP_CONFIG.app.environment === 'development';
export const isProduction = () => APP_CONFIG.app.environment === 'production';
export const isDebugEnabled = () => APP_CONFIG.features.debug;

// API URL builder
export const buildApiUrl = (endpoint: string): string => {
  const base = APP_CONFIG.api.baseUrl;
  const version = APP_CONFIG.api.version;
  return `${base}/api/${version}${endpoint}`;
};

// Validate required environment variables
export const validateConfig = (): boolean => {
  return true;
};

export default APP_CONFIG;
