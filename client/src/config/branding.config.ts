/**
 * 🎨 CONFIGURACIÓN DE BRANDING
 * Cambia estos valores para personalizar la app para cada cliente/empresa
 */

import type { TenantBranding } from '../types/tenant.types';

// ============================================
// 🏢 EJEMPLO 1: UDAR EDGE (Tu app actual)
// ============================================
export const BRANDING_UDAR_EDGE: TenantBranding = {
  appName: 'Udar Edge',
  companyName: 'Udar Technologies',
  tagline: 'Digitaliza tu negocio',
  
  logo: '🎨', // Puedes cambiar por URL: '/logos/udar-edge.png'
  logoSmall: '🎨',
  favicon: '/favicon-udar.ico',
  
  colors: {
    primary: '#030213',
    primaryForeground: '#ffffff',
    secondary: '#f3f3f5',
    accent: '#e9ebef',
    background: '#ffffff',
    foreground: '#030213',
    muted: '#ececf0',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Open Sans, sans-serif',
  },
  
  images: {
    loginBackground: undefined,
    onboardingSlides: [],
    emptyStateImage: undefined,
  },
};

// ============================================
// 🍕 EJEMPLO 2: RESTAURANTE "LA PIZZERÍA"
// ============================================
export const BRANDING_LA_PIZZERIA: TenantBranding = {
  appName: 'La Pizzería',
  companyName: 'Restaurante La Pizzería S.L.',
  tagline: 'La mejor pizza de la ciudad',
  
  logo: '🍕',
  logoSmall: '🍕',
  favicon: '/favicon-pizzeria.ico',
  
  colors: {
    primary: '#d32f2f', // Rojo italiano
    primaryForeground: '#ffffff',
    secondary: '#fff3e0',
    accent: '#ff6f00',
    background: '#fffef7',
    foreground: '#1a1a1a',
    muted: '#fafaf8',
    border: 'rgba(211, 47, 47, 0.2)',
  },
  
  fonts: {
    heading: 'Montserrat, sans-serif',
    body: 'Roboto, sans-serif',
  },
  
  images: {
    loginBackground: '/images/pizzeria-bg.jpg',
    onboardingSlides: [
      '/images/pizzeria-slide1.jpg',
      '/images/pizzeria-slide2.jpg',
    ],
    emptyStateImage: '/images/pizzeria-empty.svg',
  },
};

// ============================================
// ☕ EJEMPLO 3: CAFETERÍA "COFFEE HOUSE"
// ============================================
export const BRANDING_COFFEE_HOUSE: TenantBranding = {
  appName: 'Coffee House',
  companyName: 'Coffee House Premium',
  tagline: 'El mejor café artesanal',
  
  logo: '☕',
  logoSmall: '☕',
  favicon: '/favicon-coffee.ico',
  
  colors: {
    primary: '#5d4037', // Marrón café
    primaryForeground: '#ffffff',
    secondary: '#efebe9',
    accent: '#ff6f00',
    background: '#fafafa',
    foreground: '#212121',
    muted: '#f5f5f5',
    border: 'rgba(93, 64, 55, 0.2)',
  },
  
  fonts: {
    heading: 'Playfair Display, serif',
    body: 'Lato, sans-serif',
  },
  
  images: {
    loginBackground: '/images/coffee-bg.jpg',
    onboardingSlides: [],
    emptyStateImage: '/images/coffee-empty.svg',
  },
};

// ============================================
// 🏪 EJEMPLO 4: RETAIL "FASHION STORE"
// ============================================
export const BRANDING_FASHION_STORE: TenantBranding = {
  appName: 'Fashion Store',
  companyName: 'Fashion Store International',
  tagline: 'Tu estilo, nuestra pasión',
  
  logo: '👗',
  logoSmall: '👗',
  favicon: '/favicon-fashion.ico',
  
  colors: {
    primary: '#000000', // Negro elegante
    primaryForeground: '#ffffff',
    secondary: '#f8f8f8',
    accent: '#e91e63',
    background: '#ffffff',
    foreground: '#000000',
    muted: '#f0f0f0',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  
  fonts: {
    heading: 'Archivo, sans-serif',
    body: 'Inter, sans-serif',
  },
  
  images: {
    loginBackground: '/images/fashion-bg.jpg',
    onboardingSlides: [],
    emptyStateImage: '/images/fashion-empty.svg',
  },
};

// ============================================
// 🍰 EJEMPLO 5: PASTELERÍA "HOY PECAMOS"
// ============================================
export const BRANDING_HOY_PECAMOS: TenantBranding = {
  appName: 'Hoy Pecamos',
  companyName: 'Hoy Pecamos',
  tagline: 'Pizza & Burger artesanal',
  
  logo: 'figma:asset/a3428b28dbe9517759563dab398d0145766bcbf4.png', // Logo principal HoyPecamos (del SplashScreen)
  logoSmall: 'figma:asset/a3428b28dbe9517759563dab398d0145766bcbf4.png',
  favicon: '/favicon-hoypecamos.ico',
  
  colors: {
    primary: '#ED1C24', // Rojo HoyPecamos
    primaryForeground: '#ffffff',
    secondary: '#1a1a1a', // Negro suave
    accent: '#FF4444', // Rojo claro acento
    background: '#000000', // Negro profundo
    foreground: '#ffffff', // Texto blanco
    muted: '#2a2a2a', // Gris oscuro
    border: 'rgba(237, 28, 36, 0.3)', // Borde rojo suave
  },
  
  fonts: {
    heading: 'Montserrat, sans-serif', // Bold moderna
    body: 'Poppins, sans-serif',
  },
  
  images: {
    loginBackground: undefined,
    onboardingSlides: [],
    emptyStateImage: undefined,
  },
};

// ============================================
// ⚙️ CONFIGURACIÓN ACTIVA
// ============================================

/**
 * 🎯 CAMBIA AQUÍ PARA SELECCIONAR EL BRANDING ACTIVO
 * 
 * Opciones disponibles:
 * - BRANDING_UDAR_EDGE
 * - BRANDING_LA_PIZZERIA
 * - BRANDING_COFFEE_HOUSE
 * - BRANDING_FASHION_STORE
 * - BRANDING_HOY_PECAMOS
 * 
 * O crea tu propio branding siguiendo el mismo formato
 */
export const ACTIVE_BRANDING: TenantBranding = BRANDING_HOY_PECAMOS;

// ============================================
// 🎨 HELPER: Aplicar branding a CSS variables
// ============================================
export function applyBrandingToDOM(branding: TenantBranding) {
  const root = document.documentElement;
  
  // Aplicar colores
  Object.entries(branding.colors).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Aplicar fuentes
  root.style.setProperty('--font-heading', branding.fonts.heading);
  root.style.setProperty('--font-body', branding.fonts.body);
  
  // Aplicar título de página
  document.title = branding.appName;
  
  // Aplicar favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = branding.favicon;
  }
}

// ============================================
// 📚 TODOS LOS BRANDINGS DISPONIBLES
// ============================================
export const ALL_BRANDINGS = {
  'udar-edge': BRANDING_UDAR_EDGE,
  'la-pizzeria': BRANDING_LA_PIZZERIA,
  'coffee-house': BRANDING_COFFEE_HOUSE,
  'fashion-store': BRANDING_FASHION_STORE,
  'hoypecamos': BRANDING_HOY_PECAMOS,
};

export type BrandingKey = keyof typeof ALL_BRANDINGS;