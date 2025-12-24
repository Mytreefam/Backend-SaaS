/**
 * TIPOS GLOBALES
 * 
 * Tipos compartidos por toda la aplicación
 */

declare global {
  // Tipos de usuario
  type UserRole = 'cliente' | 'trabajador' | 'gerente' | null;
  
  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }
  
  // Alias para compatibilidad (algunos archivos usan UserType)
  type UserType = User;
}

// Tipos para Vite import.meta.env
interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // OAuth
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_CLIENT_SECRET?: string;
  readonly VITE_FACEBOOK_APP_ID?: string;
  readonly VITE_FACEBOOK_APP_SECRET?: string;
  readonly VITE_APPLE_CLIENT_ID?: string;
  readonly VITE_APPLE_TEAM_ID?: string;
  readonly VITE_APPLE_KEY_ID?: string;
  readonly VITE_APPLE_PRIVATE_KEY?: string;
  
  // Firebase
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_VAPID_KEY?: string;
  
  // Configuración de tenant
  readonly VITE_DEFAULT_TENANT_ID?: string;
  readonly VITE_TENANT_SLUG?: string;
  readonly VITE_PLAN?: string;
  readonly VITE_APP_MODE?: string;
  readonly VITE_DEBUG_MODE?: string;
  
  // Otras
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GA_TRACKING_ID?: string;
  readonly VITE_MIXPANEL_TOKEN?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_PAYPAL_CLIENT_ID?: string;
  readonly VITE_STORAGE_URL?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_MAKE_WEBHOOK_URL?: string;
  readonly VITE_OCR_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
