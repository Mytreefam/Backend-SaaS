import React, { useState, useEffect, useRef } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * Threshold para lazy loading (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Margen antes de empezar a cargar (en px)
   * @default '50px'
   */
  rootMargin?: string;
  /**
   * Mostrar placeholder mientras carga
   * @default true
   */
  showPlaceholder?: boolean;
  /**
   * Clase CSS para el placeholder
   */
  placeholderClassName?: string;
}

/**
 * Wrapper de ImageWithFallback con lazy loading
 * Compatible con el sistema existente pero optimizado para móvil
 */
export function LazyImage({
  src,
  alt,
  threshold = 0.1,
  rootMargin = '50px',
  showPlaceholder = true,
  placeholderClassName = 'bg-gray-200 animate-pulse',
  className,
  ...rest
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={imgRef} className="relative">
      {showPlaceholder && !isLoaded && (
        <div className={`absolute inset-0 ${placeholderClassName}`} />
      )}
      {isInView && (
        <ImageWithFallback
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          {...rest}
        />
      )}
    </div>
  );
}

/**
 * Avatar con lazy loading optimizado
 */
interface LazyAvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LazyAvatar({ src, alt, size = 'md', className = '' }: LazyAvatarProps) {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      showPlaceholder={true}
      placeholderClassName="bg-gray-200 animate-pulse rounded-full"
    />
  );
}

/**
 * Imagen de producto con lazy loading
 */
interface LazyProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export function LazyProductImage({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
}: LazyProductImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden`}>
      <LazyImage
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        showPlaceholder={true}
      />
    </div>
  );
}
