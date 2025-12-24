/**
 * EJEMPLO DE USO - Sistema de Optimización de Imágenes
 * 
 * Este archivo muestra cómo usar los nuevos componentes optimizados
 * en diferentes contextos de la aplicación.
 */

import React from 'react';
import { 
  ImageOptimized, 
  AvatarOptimized, 
  ProductImage, 
  HeroImage 
} from './components/shared/ImageOptimized';
import { 
  LazyImage, 
  LazyAvatar, 
  LazyProductImage 
} from './components/shared/LazyImage';
import { useOptimalImageConfig, useNetworkQuality } from './hooks/useImagePerformance';
import { optimizeUnsplashUrl, IMAGE_SIZES } from './utils/imageOptimization';

// ===========================================
// EJEMPLO 1: Hero/Banner Principal
// ===========================================
export function EjemploHeroBanner() {
  return (
    <div className="w-full">
      <HeroImage
        src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200"
        alt="Promoción especial de panadería"
        className="w-full rounded-lg"
      />
    </div>
  );
}

// ===========================================
// EJEMPLO 2: Avatar de Usuario
// ===========================================
export function EjemploAvatar() {
  const avatarUrl = "https://images.unsplash.com/photo-1531299983330-093763e1d963?w=400";
  
  return (
    <div className="flex items-center gap-4">
      {/* Opción 1: AvatarOptimized (recomendado) */}
      <AvatarOptimized 
        src={avatarUrl}
        alt="Usuario"
        size="lg"
      />
      
      {/* Opción 2: LazyAvatar (compatible con sistema existente) */}
      <LazyAvatar 
        src={avatarUrl}
        alt="Usuario"
        size="lg"
      />
    </div>
  );
}

// ===========================================
// EJEMPLO 3: Grid de Productos
// ===========================================
export function EjemploGridProductos() {
  const productos = [
    {
      id: 1,
      nombre: 'Croissant',
      imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
      precio: 2.50,
    },
    {
      id: 2,
      nombre: 'Baguette',
      imagen: 'https://images.unsplash.com/photo-1612582905318-8db155e9d52e?w=600',
      precio: 3.00,
    },
    // ... más productos
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {productos.map((producto, index) => (
        <div key={producto.id} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Productos iniciales con prioridad alta, resto con lazy */}
          <ProductImage
            src={producto.imagen}
            alt={producto.nombre}
            priority={index < 4 ? 'high' : 'low'}
            className="w-full"
          />
          <div className="p-3">
            <h3 className="font-medium">{producto.nombre}</h3>
            <p className="text-teal-600">{producto.precio}€</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// EJEMPLO 4: Lista con Lazy Loading
// ===========================================
export function EjemploListaConLazy() {
  const items = [
    {
      id: 1,
      titulo: 'Promoción 1',
      imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    },
    // ... muchos más items
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg">
          <LazyProductImage
            src={item.imagen}
            alt={item.titulo}
            className="w-24 h-24"
            aspectRatio="square"
          />
          <div className="flex-1">
            <h3>{item.titulo}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// EJEMPLO 5: Adaptativo según Conexión
// ===========================================
export function EjemploAdaptativo() {
  const { quality, effectiveType } = useNetworkQuality();
  const config = useOptimalImageConfig();

  // URL original
  const originalUrl = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200";
  
  // Optimizar según configuración adaptativa
  const optimizedUrl = optimizeUnsplashUrl(originalUrl, {
    width: config.width,
    quality: config.quality,
    format: config.format,
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">
          Conexión: <strong>{effectiveType}</strong> - 
          Calidad: <strong>{quality}</strong>
        </p>
      </div>
      
      <ImageOptimized
        src={optimizedUrl}
        alt="Imagen adaptativa"
        className="w-full rounded-lg"
        lazy={config.lazy}
      />
    </div>
  );
}

// ===========================================
// EJEMPLO 6: Con Aspect Ratio (Evita Layout Shift)
// ===========================================
export function EjemploAspectRatio() {
  return (
    <div className="space-y-4">
      {/* Imagen cuadrada */}
      <ImageOptimized
        src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"
        alt="Producto cuadrado"
        aspectRatio={1}
        className="w-full rounded-lg"
      />

      {/* Imagen 16:9 */}
      <ImageOptimized
        src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"
        alt="Banner 16:9"
        aspectRatio={16/9}
        className="w-full rounded-lg"
      />

      {/* Imagen 4:3 */}
      <ImageOptimized
        src="https://images.unsplash.com/photo-1612582905318-8db155e9d52e?w=600"
        alt="Producto 4:3"
        aspectRatio={4/3}
        className="w-full rounded-lg"
      />
    </div>
  );
}

// ===========================================
// EJEMPLO 7: Responsive Sizes
// ===========================================
export function EjemploResponsiveSizes() {
  return (
    <ImageOptimized
      src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200"
      alt="Imagen responsive"
      responsiveSizes={{
        mobile: 400,   // Para pantallas < 640px
        tablet: 800,   // Para pantallas < 1024px  
        desktop: 1200  // Para pantallas >= 1024px
      }}
      aspectRatio={16/9}
      className="w-full rounded-lg"
    />
  );
}

// ===========================================
// EJEMPLO 8: Migración desde ImageWithFallback
// ===========================================

// ANTES (usando ImageWithFallback directamente)
function AntesMigracion() {
  return (
    <img 
      src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400"
      alt="Producto"
      className="w-full"
    />
  );
}

// DESPUÉS - Opción 1: Cambio mínimo con LazyImage
function DespuesMigracionOpcion1() {
  return (
    <LazyImage 
      src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400"
      alt="Producto"
      className="w-full"
    />
  );
}

// DESPUÉS - Opción 2: Optimización completa
function DespuesMigracionOpcion2() {
  return (
    <ImageOptimized 
      src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400"
      alt="Producto"
      className="w-full"
      lazy={true}
      aspectRatio={1}
      responsiveSizes={{
        mobile: 300,
        tablet: 400,
        desktop: 600
      }}
    />
  );
}

// ===========================================
// EJEMPLO 9: Uso de Tamaños Predefinidos
// ===========================================
export function EjemploTamanosPredefinidos() {
  const productoUrl = "https://images.unsplash.com/photo-1555507036-ab1f4038808a";
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Thumbnail pequeño */}
      <ImageOptimized
        src={optimizeUnsplashUrl(productoUrl, { width: IMAGE_SIZES.product.thumbnail })}
        alt="Thumbnail"
        className="w-full"
      />

      {/* Card mediana */}
      <ImageOptimized
        src={optimizeUnsplashUrl(productoUrl, { width: IMAGE_SIZES.product.card })}
        alt="Card"
        className="w-full"
      />

      {/* Detalle grande */}
      <ImageOptimized
        src={optimizeUnsplashUrl(productoUrl, { width: IMAGE_SIZES.product.detail })}
        alt="Detalle"
        className="w-full col-span-2"
      />
    </div>
  );
}

// ===========================================
// EJEMPLO 10: Componente Completo Real
// ===========================================
export function EjemploComponenteRealPromocion() {
  const promocion = {
    id: 'PROMO-001',
    titulo: 'Pack Croissants',
    descripcion: 'Compra 6 croissants y llévate 2 gratis',
    descuento: '25%',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
    destacada: true,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Imagen optimizada con aspect ratio */}
      <div className="relative">
        <ProductImage
          src={promocion.imagen}
          alt={promocion.titulo}
          priority={promocion.destacada ? 'high' : 'low'}
          className="w-full"
        />
        {promocion.destacada && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {promocion.descuento} OFF
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{promocion.titulo}</h3>
        <p className="text-gray-600 text-sm mb-4">{promocion.descripcion}</p>
        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded">
          Aplicar Promoción
        </button>
      </div>
    </div>
  );
}

// ===========================================
// EJEMPLO 11: Con Monitor de Performance (Dev)
// ===========================================
export function EjemploConMonitor() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Galería de Productos</h2>
      
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <ImageOptimized
            key={i}
            src={`https://images.unsplash.com/photo-${1555507036000 + i}?w=400`}
            alt={`Producto ${i + 1}`}
            aspectRatio={1}
            lazy={true}
            className="w-full rounded"
          />
        ))}
      </div>

      {/* Monitor solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4">
          {/* El monitor se importaría desde components/dev/ImagePerformanceMonitor */}
          <p className="text-xs text-gray-500">
            Monitor de imágenes activo (solo dev)
          </p>
        </div>
      )}
    </div>
  );
}

// ===========================================
// EXPORT DE TODOS LOS EJEMPLOS
// ===========================================
export default function EjemplosOptimizacionImagenes() {
  return (
    <div className="container mx-auto p-6 space-y-12">
      <h1 className="text-3xl font-bold">Ejemplos de Optimización de Imágenes</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Hero/Banner</h2>
        <EjemploHeroBanner />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Avatares</h2>
        <EjemploAvatar />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Grid de Productos</h2>
        <EjemploGridProductos />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">4. Lista con Lazy Loading</h2>
        <EjemploListaConLazy />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Adaptativo por Conexión</h2>
        <EjemploAdaptativo />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Aspect Ratios</h2>
        <EjemploAspectRatio />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">7. Responsive Sizes</h2>
        <EjemploResponsiveSizes />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">8. Tamaños Predefinidos</h2>
        <EjemploTamanosPredefinidos />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">9. Componente Real</h2>
        <EjemploComponenteRealPromocion />
      </section>
    </div>
  );
}
