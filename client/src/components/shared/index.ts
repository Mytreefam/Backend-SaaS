/**
 * Componentes compartidos optimizados
 */

// Imágenes optimizadas
export {
  ImageOptimized,
  AvatarOptimized,
  ProductImage,
  HeroImage,
  useViewportSize,
  optimizeUnsplashUrl,
} from './ImageOptimized';

export {
  LazyImage,
  LazyAvatar,
  LazyProductImage,
} from './LazyImage';

// Re-exportar ImageWithFallback para compatibilidad
export { ImageWithFallback } from '../figma/ImageWithFallback';
