/**
 * CONFIGURACIÓN DE INTERNACIONALIZACIÓN (i18n)
 * 
 * Soporte para múltiples idiomas: Español, Catalán, Inglés
 */

import React from 'react';

export type Language = 'es' | 'ca' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

// ============================================================================
// TRADUCCIONES - ESPAÑOL
// ============================================================================

const ES: Translations = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    skip: 'Omitir',
    finish: 'Finalizar',
    start: 'Empezar',
    close: 'Cerrar',
    ok: 'Aceptar',
    yes: 'Sí',
    no: 'No',
  },
  
  auth: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Email',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    dontHaveAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    createAccount: 'Crear cuenta',
    continueWithGoogle: 'Continuar con Google',
    continueWithFacebook: 'Continuar con Facebook',
    continueWithApple: 'Continuar con Apple',
    enterEmail: 'Introduce tu email',
    enterPassword: 'Introduce tu contraseña',
    fullName: 'Nombre completo',
    phone: 'Teléfono',
    companyName: 'Nombre de la empresa',
    selectRole: 'Selecciona tu rol',
    roles: {
      client: 'Cliente',
      worker: 'Trabajador',
      manager: 'Gerente',
    },
    hasCompany: '¿Ya tienes una empresa registrada?',
    biometricLogin: 'Iniciar sesión con huella/Face ID',
    enableBiometric: 'Activar huella digital',
    biometricTitle: 'Accede más rápido',
    biometricDescription: 'Usa tu huella digital o Face ID para iniciar sesión de forma segura',
  },
  
  onboarding: {
    welcome: 'Bienvenido a',
    getStarted: 'Empezar',
    skip: 'Omitir',
    next: 'Siguiente',
    prev: 'Anterior',
  },
  
  permissions: {
    camera: {
      title: 'Acceso a la cámara',
      description: 'Necesitamos acceso a tu cámara para escanear documentos, códigos QR y tomar fotos.',
      denied: 'Permiso de cámara denegado',
      deniedDescription: 'Ve a Ajustes de tu dispositivo para habilitar el acceso a la cámara.',
    },
    location: {
      title: 'Acceso a la ubicación',
      description: 'Necesitamos tu ubicación para verificar que estás en el punto de venta al fichar.',
      denied: 'Permiso de ubicación denegado',
      deniedDescription: 'Ve a Ajustes de tu dispositivo para habilitar el acceso a la ubicación.',
    },
    notifications: {
      title: 'Activar notificaciones',
      description: 'Recibe alertas de pedidos, mensajes y recordatorios importantes.',
      denied: 'Notificaciones desactivadas',
      deniedDescription: 'Ve a Ajustes para activar las notificaciones.',
    },
    storage: {
      title: 'Acceso al almacenamiento',
      description: 'Para guardar y leer documentos, fotos y archivos.',
    },
  },
  
  notifications: {
    newOrder: 'Nuevo pedido',
    orderReady: 'Pedido listo',
    orderDelivered: 'Pedido entregado',
    newMessage: 'Nuevo mensaje',
    permissionApproved: 'Permiso aprobado',
    permissionRejected: 'Permiso rechazado',
    lowStock: 'Stock bajo',
    cashClosed: 'Caja cerrada',
    promotion: 'Nueva promoción',
    documentExpiring: 'Documento por vencer',
  },
  
  navigation: {
    home: 'Inicio',
    orders: 'Pedidos',
    products: 'Productos',
    chat: 'Chat',
    profile: 'Perfil',
    settings: 'Configuración',
  },
  
  errors: {
    generic: 'Ha ocurrido un error. Inténtalo de nuevo.',
    network: 'Sin conexión a internet',
    unauthorized: 'No tienes permisos para esta acción',
    notFound: 'Recurso no encontrado',
    validation: 'Por favor, completa todos los campos requeridos',
  },
  
  offline: {
    title: 'Sin conexión',
    message: 'Algunas funciones están limitadas sin internet',
    willSync: 'Los cambios se sincronizarán cuando recuperes la conexión',
  },
};

// ============================================================================
// TRADUCCIONES - CATALÁN
// ============================================================================

const CA: Translations = {
  common: {
    save: 'Desar',
    cancel: 'Cancel·lar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Cercar',
    filter: 'Filtrar',
    loading: 'Carregant...',
    error: 'Error',
    success: 'Èxit',
    confirm: 'Confirmar',
    back: 'Tornar',
    next: 'Següent',
    skip: 'Ometre',
    finish: 'Finalitzar',
    start: 'Començar',
    close: 'Tancar',
    ok: 'Acceptar',
    yes: 'Sí',
    no: 'No',
  },
  
  auth: {
    login: 'Iniciar sessió',
    register: 'Registrar-se',
    logout: 'Tancar sessió',
    email: 'Email',
    password: 'Contrasenya',
    confirmPassword: 'Confirmar contrasenya',
    forgotPassword: 'Has oblidat la contrasenya?',
    dontHaveAccount: 'No tens compte?',
    alreadyHaveAccount: 'Ja tens compte?',
    createAccount: 'Crear compte',
    continueWithGoogle: 'Continuar amb Google',
    continueWithFacebook: 'Continuar amb Facebook',
    continueWithApple: 'Continuar amb Apple',
    enterEmail: 'Introdueix el teu email',
    enterPassword: 'Introdueix la teva contrasenya',
    fullName: 'Nom complet',
    phone: 'Telèfon',
    companyName: 'Nom de l\'empresa',
    selectRole: 'Selecciona el teu rol',
    roles: {
      client: 'Client',
      worker: 'Treballador',
      manager: 'Gerent',
    },
    hasCompany: 'Ja tens una empresa registrada?',
    biometricLogin: 'Iniciar sessió amb empremta/Face ID',
    enableBiometric: 'Activar empremta digital',
    biometricTitle: 'Accedeix més ràpid',
    biometricDescription: 'Utilitza la teva empremta digital o Face ID per iniciar sessió de forma segura',
  },
  
  onboarding: {
    welcome: 'Benvingut a',
    getStarted: 'Començar',
    skip: 'Ometre',
    next: 'Següent',
    prev: 'Anterior',
  },
  
  permissions: {
    camera: {
      title: 'Accés a la càmera',
      description: 'Necessitem accés a la teva càmera per escanejar documents, codis QR i fer fotos.',
      denied: 'Permís de càmera denegat',
      deniedDescription: 'Vés a Configuració del dispositiu per habilitar l\'accés a la càmera.',
    },
    location: {
      title: 'Accés a la ubicació',
      description: 'Necessitem la teva ubicació per verificar que estàs al punt de venda al fitxar.',
      denied: 'Permís d\'ubicació denegat',
      deniedDescription: 'Vés a Configuració per habilitar l\'accés a la ubicació.',
    },
    notifications: {
      title: 'Activar notificacions',
      description: 'Rep alertes de comandes, missatges i recordatoris importants.',
      denied: 'Notificacions desactivades',
      deniedDescription: 'Vés a Configuració per activar les notificacions.',
    },
    storage: {
      title: 'Accés a l\'emmagatzematge',
      description: 'Per desar i llegir documents, fotos i arxius.',
    },
  },
  
  notifications: {
    newOrder: 'Nova comanda',
    orderReady: 'Comanda llesta',
    orderDelivered: 'Comanda lliurada',
    newMessage: 'Nou missatge',
    permissionApproved: 'Permís aprovat',
    permissionRejected: 'Permís rebutjat',
    lowStock: 'Estoc baix',
    cashClosed: 'Caixa tancada',
    promotion: 'Nova promoció',
    documentExpiring: 'Document per vèncer',
  },
  
  navigation: {
    home: 'Inici',
    orders: 'Comandes',
    products: 'Productes',
    chat: 'Xat',
    profile: 'Perfil',
    settings: 'Configuració',
  },
  
  errors: {
    generic: 'S\'ha produït un error. Torna-ho a intentar.',
    network: 'Sense connexió a internet',
    unauthorized: 'No tens permisos per aquesta acció',
    notFound: 'Recurs no trobat',
    validation: 'Si us plau, completa tots els camps requerits',
  },
  
  offline: {
    title: 'Sense connexió',
    message: 'Algunes funcions estan limitades sense internet',
    willSync: 'Els canvis es sincronitzaran quan recuperis la connexió',
  },
};

// ============================================================================
// TRADUCCIONES - INGLÉS
// ============================================================================

const EN: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    finish: 'Finish',
    start: 'Start',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
  },
  
  auth: {
    login: 'Log in',
    register: 'Sign up',
    logout: 'Log out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    forgotPassword: 'Forgot your password?',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create account',
    continueWithGoogle: 'Continue with Google',
    continueWithFacebook: 'Continue with Facebook',
    continueWithApple: 'Continue with Apple',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    fullName: 'Full name',
    phone: 'Phone',
    companyName: 'Company name',
    selectRole: 'Select your role',
    roles: {
      client: 'Client',
      worker: 'Worker',
      manager: 'Manager',
    },
    hasCompany: 'Do you already have a registered company?',
    biometricLogin: 'Log in with fingerprint/Face ID',
    enableBiometric: 'Enable biometric authentication',
    biometricTitle: 'Access faster',
    biometricDescription: 'Use your fingerprint or Face ID to log in securely',
  },
  
  onboarding: {
    welcome: 'Welcome to',
    getStarted: 'Get Started',
    skip: 'Skip',
    next: 'Next',
    prev: 'Previous',
  },
  
  permissions: {
    camera: {
      title: 'Camera access',
      description: 'We need access to your camera to scan documents, QR codes and take photos.',
      denied: 'Camera permission denied',
      deniedDescription: 'Go to your device Settings to enable camera access.',
    },
    location: {
      title: 'Location access',
      description: 'We need your location to verify that you are at the point of sale when clocking in.',
      denied: 'Location permission denied',
      deniedDescription: 'Go to Settings to enable location access.',
    },
    notifications: {
      title: 'Enable notifications',
      description: 'Receive alerts for orders, messages and important reminders.',
      denied: 'Notifications disabled',
      deniedDescription: 'Go to Settings to enable notifications.',
    },
    storage: {
      title: 'Storage access',
      description: 'To save and read documents, photos and files.',
    },
  },
  
  notifications: {
    newOrder: 'New order',
    orderReady: 'Order ready',
    orderDelivered: 'Order delivered',
    newMessage: 'New message',
    permissionApproved: 'Permission approved',
    permissionRejected: 'Permission rejected',
    lowStock: 'Low stock',
    cashClosed: 'Cash register closed',
    promotion: 'New promotion',
    documentExpiring: 'Document expiring',
  },
  
  navigation: {
    home: 'Home',
    orders: 'Orders',
    products: 'Products',
    chat: 'Chat',
    profile: 'Profile',
    settings: 'Settings',
  },
  
  errors: {
    generic: 'An error occurred. Please try again.',
    network: 'No internet connection',
    unauthorized: 'You don\'t have permission for this action',
    notFound: 'Resource not found',
    validation: 'Please complete all required fields',
  },
  
  offline: {
    title: 'Offline',
    message: 'Some features are limited without internet',
    willSync: 'Changes will sync when you reconnect',
  },
};

// ============================================================================
// SISTEMA DE TRADUCCIONES
// ============================================================================

const translations: Record<Language, Translations> = {
  es: ES,
  ca: CA,
  en: EN,
};

// Idioma actual (por defecto español)
let currentLanguage: Language = 'es';

/**
 * Cambia el idioma de la aplicación
 */
export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  localStorage.setItem('app_language', lang);
};

/**
 * Obtiene el idioma actual
 */
export const getLanguage = (): Language => {
  const saved = localStorage.getItem('app_language') as Language;
  return saved || currentLanguage;
};

/**
 * Obtiene una traducción por su clave
 * 
 * @example
 * t('auth.login') // "Iniciar sesión"
 * t('common.save') // "Guardar"
 */
export const t = (key: string, fallback?: string): string => {
  const keys = key.split('.');
  let value: any = translations[getLanguage()];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return fallback || key;
    }
  }
  
  return typeof value === 'string' ? value : fallback || key;
};

/**
 * Hook personalizado para React (opcional)
 */
export const useTranslation = () => {
  const [language, setLang] = React.useState<Language>(getLanguage());
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setLang(lang);
  };
  
  return {
    t,
    language,
    changeLanguage,
  };
};

// Detectar idioma del navegador al iniciar
export const initializeLanguage = (): void => {
  const saved = localStorage.getItem('app_language') as Language;
  
  if (saved) {
    currentLanguage = saved;
    return;
  }
  
  // Detectar idioma del navegador
  const browserLang = navigator.language.split('-')[0];
  
  if (browserLang === 'es' || browserLang === 'ca' || browserLang === 'en') {
    currentLanguage = browserLang as Language;
  } else {
    currentLanguage = 'es'; // Por defecto español
  }
  
  localStorage.setItem('app_language', currentLanguage);
};
