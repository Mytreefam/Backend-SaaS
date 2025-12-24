/**
 * CONFIGURACIÓN WHITE-LABEL
 * 
 * Este archivo permite personalizar la app para cada cliente.
 * Cambiar nombre, logo, colores, etc. sin modificar código.
 */

export interface WhiteLabelConfig {
  // Identidad
  appName: string;
  appSlogan: string;
  companyName: string;
  tagline: string; // Tagline corto para mostrar bajo el logo
  
  // Branding
  logo: string;
  logoLight: string; // Para tema oscuro
  icon: string;
  
  // Colores (Tailwind CSS)
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Información de contacto
  contact: {
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  
  // Redes sociales
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  
  // Onboarding
  onboarding: {
    enabled: boolean;
    screens: OnboardingScreen[];
  };
  
  // Configuración de la empresa
  company: {
    mission: string;
    vision: string;
    values: string[];
    description: string;
  };
}

export interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  image: string;
  icon?: string;
}

// ============================================================================
// CONFIGURACIÓN POR DEFECTO - EDITAR PARA CADA CLIENTE
// ============================================================================

export const WHITE_LABEL_CONFIG: WhiteLabelConfig = {
  // Identidad
  appName: 'Udar Edge',
  appSlogan: 'Digitaliza tu negocio en minutos',
  companyName: 'Udar Technologies',
  tagline: 'Sistema 360°', // Tagline corto para mostrar bajo el logo
  
  // Branding
  logo: 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png', // Logo de Udar Edge
  logoLight: 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png', // Logo de Udar Edge
  icon: '/icon-512.png',
  
  // Colores
  colors: {
    primary: '#0d9488', // Teal-600
    secondary: '#14b8a6', // Teal-500
    accent: '#2dd4bf', // Teal-400
    background: '#ffffff',
    text: '#1f2937', // Gray-800
  },
  
  // Contacto
  contact: {
    email: 'soporte@udaredge.com',
    phone: '+34 XXX XXX XXX',
    website: 'https://udaredge.com',
    address: 'Barcelona, España',
  },
  
  // Redes sociales
  social: {
    facebook: 'https://facebook.com/udaredge',
    instagram: 'https://instagram.com/udaredge',
    twitter: 'https://twitter.com/udaredge',
  },
  
  // Onboarding
  onboarding: {
    enabled: true,
    screens: [
      {
        id: '1',
        title: '¿Quiénes somos?',
        description: 'Somos Udar Edge, la plataforma SaaS líder en digitalización para negocios de hostelería. Ayudamos a cientos de restaurantes, bares y cafeterías a modernizarse y crecer.',
        image: '/onboarding/screen1.svg',
        icon: 'building',
      },
      {
        id: '2',
        title: 'Todo tu negocio en una app',
        description: 'TPV completo, gestión de pedidos, control de stock, fichaje de empleados, reportes en tiempo real y mucho más. Todo desde tu móvil o tablet.',
        image: '/onboarding/screen2.svg',
        icon: 'smartphone',
      },
      {
        id: '3',
        title: 'Tecnología que impulsa resultados',
        description: 'Analítica avanzada con IA, automatización inteligente, reportes personalizados y predicciones de demanda. Tu negocio siempre un paso adelante.',
        image: '/onboarding/screen3.svg',
        icon: 'sparkles',
      },
      {
        id: '4',
        title: 'Aumenta tus ventas un 40%',
        description: 'Nuestros clientes mejoran su eficiencia operativa, reducen costes y aumentan sus ingresos. Únete a la revolución digital de la hostelería.',
        image: '/onboarding/screen4.svg',
        icon: 'trending-up',
      },
    ],
  },
  
  // Información de la empresa
  company: {
    mission: 'Digitalizar negocios de hostelería para hacerlos más eficientes y rentables.',
    vision: 'Ser la plataforma líder en gestión integral para restaurantes y bares en España.',
    values: [
      'Innovación constante',
      'Facilidad de uso',
      'Soporte dedicado',
      'Transparencia total',
      'Seguridad de datos',
    ],
    description: `Somos una empresa tecnológica especializada en soluciones para el sector de la hostelería. 
    
Con más de 10 años de experiencia, ayudamos a cientos de negocios a modernizarse y crecer.

Nuestro equipo está formado por profesionales apasionados por la tecnología y el servicio al cliente.`,
  },
};

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Obtiene la configuración actual
 */
export const getConfig = (): WhiteLabelConfig => {
  // En el futuro, esto podría cargar desde una API o localStorage
  return WHITE_LABEL_CONFIG;
};

/**
 * Actualiza la configuración (útil para demo o cambios dinámicos)
 */
export const updateConfig = (updates: Partial<WhiteLabelConfig>): void => {
  Object.assign(WHITE_LABEL_CONFIG, updates);
  
  // Aplicar cambios de color al CSS
  if (updates.colors) {
    applyColorTheme(updates.colors);
  }
};

/**
 * Aplica el tema de colores al CSS
 */
const applyColorTheme = (colors: WhiteLabelConfig['colors']): void => {
  // Verificar que estamos en el navegador
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-text', colors.text);
};

/**
 * Inicializa el tema al cargar la app
 */
export const initializeTheme = (): void => {
  // Verificar que estamos en el navegador
  if (typeof document === 'undefined') return;
  
  const config = getConfig();
  applyColorTheme(config.colors);
  
  // Actualizar el título de la página
  document.title = config.appName;
  
  // Actualizar meta tags
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', config.appSlogan);
  }
};

// ============================================================================
// EJEMPLO DE USO EN OTRO ARCHIVO:
// ============================================================================
/**
 * import { getConfig } from './config/white-label.config';
 * 
 * const config = getConfig();
 * console.log(config.appName); // "Udar Edge"
 */