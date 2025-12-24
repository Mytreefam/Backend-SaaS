import React, { useState, useEffect, useRef } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

const PLACEHOLDER_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg==';

interface ImageOptimizedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * Habilita lazy loading - la imagen solo se carga cuando está cerca del viewport
   * @default true
   */
  lazy?: boolean;
  /**
   * Muestra un placeholder blur mientras carga
   * @default true
   */
  showPlaceholder?: boolean;
  /**
   * Tamaños responsivos para diferentes breakpoints
   * Ejemplo: { mobile: 400, tablet: 600, desktop: 1200 }
   */
  responsiveSizes?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /**
   * Prioridad de carga - usar "high" para imágenes above the fold
   * @default "low"
   */
  priority?: 'high' | 'low';
  /**
   * Aspect ratio para evitar layout shift (width/height)
   * Ejemplo: 16/9, 1, 4/3
   */
  aspectRatio?: number;
  /**
   * Callback cuando la imagen termina de cargar
   */
  onLoad?: () => void;
}

export function ImageOptimized({
  src,
  alt,
  lazy = true,
  showPlaceholder = true,
  responsiveSizes,
  priority = 'low',
  aspectRatio,
  className,
  style,
  onLoad,
  ...rest
}: ImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority === 'high');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || priority === 'high') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Empezar a cargar 50px antes de entrar al viewport
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  // Generar srcSet para imágenes responsive (específico para Unsplash)
  const generateSrcSet = () => {
    if (!responsiveSizes || !src.includes('unsplash.com')) return undefined;

    const sizes = [];
    if (responsiveSizes.mobile) {
      const mobileUrl = src.replace(/w=\d+/, `w=${responsiveSizes.mobile}`);
      sizes.push(`${mobileUrl} ${responsiveSizes.mobile}w`);
    }
    if (responsiveSizes.tablet) {
      const tabletUrl = src.replace(/w=\d+/, `w=${responsiveSizes.tablet}`);
      sizes.push(`${tabletUrl} ${responsiveSizes.tablet}w`);
    }
    if (responsiveSizes.desktop) {
      const desktopUrl = src.replace(/w=\d+/, `w=${responsiveSizes.desktop}`);
      sizes.push(`${desktopUrl} ${responsiveSizes.desktop}w`);
    }

    return sizes.length > 0 ? sizes.join(', ') : undefined;
  };

  // Generar sizes attribute
  const generateSizes = () => {
    if (!responsiveSizes) return undefined;

    const sizesArray = [];
    if (responsiveSizes.mobile) sizesArray.push(`(max-width: 640px) ${responsiveSizes.mobile}px`);
    if (responsiveSizes.tablet) sizesArray.push(`(max-width: 1024px) ${responsiveSizes.tablet}px`);
    if (responsiveSizes.desktop) sizesArray.push(`${responsiveSizes.desktop}px`);

    return sizesArray.length > 0 ? sizesArray.join(', ') : undefined;
  };

  // Estilos para el contenedor con aspect ratio
  const containerStyle: React.CSSProperties = {
    ...style,
    ...(aspectRatio && {
      position: 'relative',
      paddingBottom: `${(1 / aspectRatio) * 100}%`,
      height: 0,
      overflow: 'hidden',
    }),
  };

  const imgStyle: React.CSSProperties = aspectRatio
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }
    : {};

  // Si hay error, mostrar imagen de error
  if (hasError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={containerStyle}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img 
            src={ERROR_IMG_SRC} 
            alt="Error loading image" 
            data-original-url={src}
            style={imgStyle}
          />
        </div>
      </div>
    );
  }

  // Contenedor con aspect ratio
  const imageElement = (
    <img
      ref={imgRef}
      src={isInView ? src : PLACEHOLDER_IMG}
      srcSet={isInView ? generateSrcSet() : undefined}
      sizes={generateSizes()}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className ?? ''}`}
      style={imgStyle}
      loading={priority === 'high' ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );

  // Si tiene aspect ratio, envolver en contenedor
  if (aspectRatio) {
    return (
      <div style={containerStyle} className={showPlaceholder && !isLoaded ? 'bg-gray-200 animate-pulse' : ''}>
        {imageElement}
      </div>
    );
  }

  // Sin aspect ratio, devolver imagen directamente
  return imageElement;
}

/**
 * Hook personalizado para detectar el tamaño de viewport
 */
export function useViewportSize() {
  const [size, setSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSize('mobile');
      } else if (width < 1024) {
        setSize('tablet');
      } else {
        setSize('desktop');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

/**
 * Utilidad para optimizar URLs de Unsplash
 */
export function optimizeUnsplashUrl(url: string, width: number = 400, quality: number = 80): string {
  if (!url.includes('unsplash.com')) return url;

  // Reemplazar parámetros de tamaño y calidad
  let optimizedUrl = url
    .replace(/w=\d+/, `w=${width}`)
    .replace(/q=\d+/, `q=${quality}`);

  // Si no tiene parámetros, agregarlos
  if (!optimizedUrl.includes('w=')) {
    optimizedUrl += optimizedUrl.includes('?') ? '&' : '?';
    optimizedUrl += `w=${width}&q=${quality}`;
  }

  // Agregar formato webp si es posible
  if (!optimizedUrl.includes('fm=')) {
    optimizedUrl += '&fm=webp';
  }

  return optimizedUrl;
}

/**
 * Componente para avatares optimizados
 */
interface AvatarOptimizedProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarOptimized({ src, alt, size = 'md', className = '' }: AvatarOptimizedProps) {
  const sizeMap = {
    xs: { width: 32, class: 'w-8 h-8' },
    sm: { width: 48, class: 'w-12 h-12' },
    md: { width: 64, class: 'w-16 h-16' },
    lg: { width: 96, class: 'w-24 h-24' },
    xl: { width: 128, class: 'w-32 h-32' },
  };

  const config = sizeMap[size];
  const optimizedSrc = optimizeUnsplashUrl(src, config.width);

  return (
    <ImageOptimized
      src={optimizedSrc}
      alt={alt}
      className={`${config.class} rounded-full object-cover ${className}`}
      aspectRatio={1}
      lazy={true}
      priority="low"
    />
  );
}

/**
 * Componente para imágenes de productos
 */
interface ProductImageProps {
  src: string;
  alt: string;
  priority?: 'high' | 'low';
  className?: string;
}

export function ProductImage({ src, alt, priority = 'low', className = '' }: ProductImageProps) {
  const optimizedSrc = optimizeUnsplashUrl(src, 600);

  return (
    <ImageOptimized
      src={optimizedSrc}
      alt={alt}
      className={className}
      aspectRatio={1} // Productos usualmente son cuadrados
      lazy={priority === 'low'}
      priority={priority}
      responsiveSizes={{
        mobile: 300,
        tablet: 400,
        desktop: 600,
      }}
    />
  );
}

/**
 * Componente para imágenes hero/banner
 */
interface HeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HeroImage({ src, alt, className = '' }: HeroImageProps) {
  const optimizedSrc = optimizeUnsplashUrl(src, 1200);

  return (
    <ImageOptimized
      src={optimizedSrc}
      alt={alt}
      className={className}
      aspectRatio={16 / 9}
      lazy={false}
      priority="high"
      responsiveSizes={{
        mobile: 640,
        tablet: 1024,
        desktop: 1920,
      }}
    />
  );
}
