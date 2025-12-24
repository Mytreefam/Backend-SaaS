/**
 * Utilidades para optimización de imágenes
 */

export type ImageQuality = 'low' | 'medium' | 'high';
export type ImageFormat = 'webp' | 'jpg' | 'png';

interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  auto?: 'format' | 'compress';
}

/**
 * Optimiza URL de Unsplash con parámetros específicos
 */
export function optimizeUnsplashUrl(
  url: string,
  options: OptimizeImageOptions = {}
): string {
  if (!url.includes('unsplash.com')) return url;

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover',
    auto = 'format',
  } = options;

  let optimizedUrl = url;

  // Actualizar o agregar parámetros
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('fm', format);
  params.set('fit', fit);
  params.set('auto', auto);

  // Si la URL ya tiene parámetros, reemplazarlos
  const [baseUrl, existingParams] = optimizedUrl.split('?');
  const existingParamsObj = new URLSearchParams(existingParams);

  // Merge params
  params.forEach((value, key) => {
    existingParamsObj.set(key, value);
  });

  return `${baseUrl}?${existingParamsObj.toString()}`;
}

/**
 * Genera srcSet para imágenes responsive de Unsplash
 */
export function generateUnsplashSrcSet(
  url: string,
  widths: number[] = [400, 800, 1200, 1600]
): string {
  if (!url.includes('unsplash.com')) return '';

  return widths
    .map((width) => {
      const optimizedUrl = optimizeUnsplashUrl(url, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Genera el atributo sizes basado en breakpoints
 */
export function generateSizesAttribute(
  config: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    default?: string;
  }
): string {
  const sizes = [];

  if (config.mobile) sizes.push(`(max-width: 640px) ${config.mobile}`);
  if (config.tablet) sizes.push(`(max-width: 1024px) ${config.tablet}`);
  if (config.desktop) sizes.push(`(max-width: 1536px) ${config.desktop}`);
  if (config.default) sizes.push(config.default);

  return sizes.join(', ');
}

/**
 * Detecta el formato de imagen óptimo soportado por el navegador
 */
export function getOptimalImageFormat(): ImageFormat {
  // Check WebP support
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    // was able or not to get WebP representation
    const supportsWebP =
      canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    if (supportsWebP) return 'webp';
  }

  return 'jpg';
}

/**
 * Calcula el tamaño óptimo de imagen basado en el viewport y DPR
 */
export function calculateOptimalImageSize(
  containerWidth: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): number {
  // Multiplicar por DPR para pantallas retina
  const optimalWidth = containerWidth * devicePixelRatio;

  // Redondear a múltiplos de 100 para mejor caching
  return Math.ceil(optimalWidth / 100) * 100;
}

/**
 * Precargar imágenes críticas
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Precargar múltiples imágenes
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map((url) => preloadImage(url));
  await Promise.all(promises);
}

/**
 * Obtener calidad de imagen basada en la conexión del usuario
 */
export function getQualityBasedOnConnection(): number {
  // @ts-ignore - NetworkInformation no está en todos los navegadores
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) return 85; // Calidad alta por defecto

  const effectiveType = connection.effectiveType;

  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 50;
    case '3g':
      return 70;
    case '4g':
    default:
      return 85;
  }
}

/**
 * Detectar si el usuario tiene activado el modo de ahorro de datos
 */
export function hasSaveDataEnabled(): boolean {
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return connection && connection.saveData === true;
}

/**
 * Configuración adaptiva de imagen basada en condiciones de red
 */
export interface AdaptiveImageConfig {
  width: number;
  quality: number;
  format: ImageFormat;
  lazy: boolean;
}

export function getAdaptiveImageConfig(
  baseWidth: number = 800
): AdaptiveImageConfig {
  const saveData = hasSaveDataEnabled();
  const quality = getQualityBasedOnConnection();
  const format = getOptimalImageFormat();

  if (saveData) {
    return {
      width: Math.floor(baseWidth * 0.5), // 50% del tamaño original
      quality: 50,
      format,
      lazy: true,
    };
  }

  return {
    width: baseWidth,
    quality,
    format,
    lazy: true,
  };
}

/**
 * Convertir tamaño de bytes a formato legible
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Estimar el tamaño de una imagen sin descargarla (solo para misma origin o con CORS)
 */
export async function estimateImageSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const size = response.headers.get('content-length');
    return size ? parseInt(size, 10) : 0;
  } catch (error) {
    console.warn('Could not estimate image size:', error);
    return 0;
  }
}

/**
 * Tamaños predefinidos para diferentes contextos
 */
export const IMAGE_SIZES = {
  // Avatares
  avatar: {
    xs: 32,
    sm: 48,
    md: 64,
    lg: 96,
    xl: 128,
  },
  // Productos
  product: {
    thumbnail: 150,
    card: 300,
    detail: 600,
    hero: 1200,
  },
  // Promociones y banners
  banner: {
    mobile: 640,
    tablet: 1024,
    desktop: 1920,
  },
  // General
  general: {
    xs: 200,
    sm: 400,
    md: 800,
    lg: 1200,
    xl: 1600,
  },
} as const;

/**
 * Configuraciones de calidad predefinidas
 */
export const QUALITY_PRESETS = {
  low: 50,
  medium: 70,
  high: 85,
  max: 95,
} as const;
