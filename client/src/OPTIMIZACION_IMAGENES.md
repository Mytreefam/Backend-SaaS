# 📸 Guía de Optimización de Imágenes - Udar Edge

## 🎯 Objetivo

Optimizar la carga de imágenes en dispositivos móviles para mejorar el rendimiento, reducir el consumo de datos y proporcionar una mejor experiencia de usuario.

## 📦 Componentes Disponibles

### 1. **ImageOptimized** (Recomendado)

Componente completo con todas las optimizaciones:

```tsx
import { ImageOptimized } from './components/shared/ImageOptimized';

// Uso básico
<ImageOptimized
  src="https://images.unsplash.com/photo-..."
  alt="Producto"
  lazy={true}
  showPlaceholder={true}
/>

// Con responsive sizes
<ImageOptimized
  src="https://images.unsplash.com/photo-..."
  alt="Producto"
  responsiveSizes={{
    mobile: 400,
    tablet: 600,
    desktop: 1200
  }}
  aspectRatio={16/9}
  priority="high" // Para imágenes above the fold
/>
```

### 2. **LazyImage** (Compatible con sistema existente)

Wrapper de `ImageWithFallback` con lazy loading:

```tsx
import { LazyImage } from './components/shared/LazyImage';

<LazyImage
  src="https://images.unsplash.com/photo-..."
  alt="Producto"
  threshold={0.1}
  rootMargin="50px"
/>
```

### 3. **Componentes Especializados**

#### AvatarOptimized / LazyAvatar
```tsx
import { AvatarOptimized } from './components/shared/ImageOptimized';

<AvatarOptimized
  src="url"
  alt="Usuario"
  size="md" // xs, sm, md, lg, xl
/>
```

#### ProductImage / LazyProductImage
```tsx
import { ProductImage } from './components/shared/ImageOptimized';

<ProductImage
  src="url"
  alt="Café Premium"
  priority="high" // Para productos en vista inicial
/>
```

#### HeroImage
```tsx
import { HeroImage } from './components/shared/ImageOptimized';

<HeroImage
  src="url"
  alt="Banner promocional"
/>
```

## 🔧 Hooks Disponibles

### useNetworkQuality

Detecta la calidad de la conexión del usuario:

```tsx
import { useNetworkQuality } from '../hooks/useImagePerformance';

const { quality, effectiveType } = useNetworkQuality();
// quality: 'high' | 'medium' | 'low'
// effectiveType: '4g' | '3g' | '2g' | 'slow-2g'
```

### useSaveData

Detecta si el usuario tiene activado el modo de ahorro de datos:

```tsx
import { useSaveData } from '../hooks/useImagePerformance';

const saveData = useSaveData();
if (saveData) {
  // Cargar imágenes de menor calidad
}
```

### useOptimalImageConfig

Retorna la configuración óptima basada en red y preferencias:

```tsx
import { useOptimalImageConfig } from '../hooks/useImagePerformance';

const config = useOptimalImageConfig();
// { quality: 85, width: 1200, format: 'webp', lazy: true }
```

### useImagePreload

Precargar imágenes importantes:

```tsx
import { useImagePreload } from '../hooks/useImagePerformance';

const urls = [
  'https://images.unsplash.com/photo-1...',
  'https://images.unsplash.com/photo-2...',
];

const { isLoaded, hasFailed } = useImagePreload(urls);
```

## 🛠️ Utilidades

### optimizeUnsplashUrl

Optimiza URLs de Unsplash:

```tsx
import { optimizeUnsplashUrl } from './utils/imageOptimization';

const optimized = optimizeUnsplashUrl(originalUrl, {
  width: 600,
  quality: 80,
  format: 'webp',
});
```

### generateUnsplashSrcSet

Genera srcSet para imágenes responsive:

```tsx
import { generateUnsplashSrcSet } from './utils/imageOptimization';

const srcSet = generateUnsplashSrcSet(url, [400, 800, 1200]);
// "url?w=400 400w, url?w=800 800w, url?w=1200 1200w"
```

### getAdaptiveImageConfig

Configuración adaptiva según conexión:

```tsx
import { getAdaptiveImageConfig } from './utils/imageOptimization';

const config = getAdaptiveImageConfig(800);
// Ajusta calidad y tamaño según la conexión
```

## 📊 Monitor de Performance (Solo Desarrollo)

```tsx
import { ImagePerformanceMonitor } from './components/dev/ImagePerformanceMonitor';

// En tu App.tsx (solo en desarrollo)
{process.env.NODE_ENV === 'development' && (
  <ImagePerformanceMonitor 
    defaultOpen={false}
    position="bottom-right"
  />
)}
```

## 📐 Tamaños Predefinidos

```tsx
import { IMAGE_SIZES } from './utils/imageOptimization';

// Avatares
IMAGE_SIZES.avatar.xs  // 32px
IMAGE_SIZES.avatar.sm  // 48px
IMAGE_SIZES.avatar.md  // 64px
IMAGE_SIZES.avatar.lg  // 96px
IMAGE_SIZES.avatar.xl  // 128px

// Productos
IMAGE_SIZES.product.thumbnail  // 150px
IMAGE_SIZES.product.card       // 300px
IMAGE_SIZES.product.detail     // 600px
IMAGE_SIZES.product.hero       // 1200px

// Banners
IMAGE_SIZES.banner.mobile   // 640px
IMAGE_SIZES.banner.tablet   // 1024px
IMAGE_SIZES.banner.desktop  // 1920px
```

## 🎨 Calidades Predefinidas

```tsx
import { QUALITY_PRESETS } from './utils/imageOptimization';

QUALITY_PRESETS.low     // 50
QUALITY_PRESETS.medium  // 70
QUALITY_PRESETS.high    // 85
QUALITY_PRESETS.max     // 95
```

## 💡 Mejores Prácticas

### 1. **Usar Lazy Loading por Defecto**

```tsx
// ✅ Correcto - lazy loading habilitado
<ImageOptimized src="url" alt="Producto" lazy={true} />

// ❌ Incorrecto - carga inmediata innecesaria
<img src="url" alt="Producto" />
```

### 2. **Priorizar Imágenes Above The Fold**

```tsx
// ✅ Para imágenes visibles al cargar la página
<ImageOptimized 
  src="url" 
  alt="Hero" 
  priority="high"
  lazy={false}
/>

// ✅ Para imágenes below the fold
<ImageOptimized 
  src="url" 
  alt="Producto" 
  priority="low"
  lazy={true}
/>
```

### 3. **Especificar Aspect Ratio para Evitar Layout Shift**

```tsx
// ✅ Correcto - evita layout shift
<ImageOptimized 
  src="url" 
  alt="Producto"
  aspectRatio={1} // Cuadrado
/>

<ImageOptimized 
  src="url" 
  alt="Banner"
  aspectRatio={16/9} // Widescreen
/>
```

### 4. **Usar Tamaños Responsive**

```tsx
// ✅ Correcto - carga tamaño apropiado por dispositivo
<ImageOptimized 
  src="url" 
  alt="Producto"
  responsiveSizes={{
    mobile: 400,   // Para pantallas < 640px
    tablet: 600,   // Para pantallas < 1024px
    desktop: 1200  // Para pantallas mayores
  }}
/>
```

### 5. **Optimizar URLs de Unsplash**

```tsx
import { optimizeUnsplashUrl } from './utils/imageOptimization';

// ✅ Correcto - URL optimizada
const src = optimizeUnsplashUrl(originalUrl, {
  width: 600,
  quality: 80,
  format: 'webp'
});

// ❌ Incorrecto - URL sin optimizar
const src = originalUrl; // Puede ser muy grande
```

### 6. **Usar Componentes Especializados**

```tsx
// ✅ Para avatares
<AvatarOptimized src="url" alt="Usuario" size="md" />

// ✅ Para productos
<ProductImage src="url" alt="Café" priority="high" />

// ✅ Para banners/heroes
<HeroImage src="url" alt="Promoción" />
```

## 📱 Estrategias por Tipo de Conexión

### Conexión 4G (Alta velocidad)
- Calidad: 85%
- Tamaño: 1200px
- Formato: WebP
- Lazy loading: Sí

### Conexión 3G (Media velocidad)
- Calidad: 70%
- Tamaño: 600px
- Formato: WebP
- Lazy loading: Sí

### Conexión 2G (Baja velocidad)
- Calidad: 50%
- Tamaño: 400px
- Formato: WebP comprimido
- Lazy loading: Sí (agresivo)

### Modo Ahorro de Datos
- Calidad: 50%
- Tamaño: 50% del original
- Formato: WebP
- Lazy loading: Sí (muy agresivo)

## 🔍 Debugging

### Ver métricas en consola:

```tsx
import { useImagePerformance } from '../hooks/useImagePerformance';

const { metrics, totalLoadTime, averageLoadTime } = useImagePerformance();

console.log('Total images:', metrics.length);
console.log('Average load time:', averageLoadTime);
console.log('Total size:', totalSize);
```

### Monitor visual (solo desarrollo):

```tsx
<ImagePerformanceMonitor />
```

## 🚀 Migración desde ImageWithFallback

```tsx
// Antes
import { ImageWithFallback } from './components/figma/ImageWithFallback';

<ImageWithFallback src="url" alt="Producto" className="w-full" />

// Después (Opción 1 - Mínimo cambio)
import { LazyImage } from './components/shared/LazyImage';

<LazyImage src="url" alt="Producto" className="w-full" />

// Después (Opción 2 - Optimización completa)
import { ImageOptimized } from './components/shared/ImageOptimized';

<ImageOptimized 
  src="url" 
  alt="Producto" 
  className="w-full"
  lazy={true}
  aspectRatio={1}
  responsiveSizes={{ mobile: 400, tablet: 600, desktop: 1200 }}
/>
```

## 📈 Métricas de Éxito

### Antes de la optimización:
- Tiempo promedio de carga: ~2-3s
- Tamaño promedio por imagen: ~500KB
- Total de datos descargados: ~5-10MB por página

### Después de la optimización:
- Tiempo promedio de carga: ~500ms-1s
- Tamaño promedio por imagen: ~100-200KB
- Total de datos descargados: ~1-2MB por página
- Mejora: **60-80% reducción** en tiempo y datos

## ⚠️ Consideraciones

1. **ImageWithFallback es protegido**: No modificar directamente
2. **Usar LazyImage o ImageOptimized**: Para nuevos componentes
3. **Migración gradual**: No es necesario cambiar todo de una vez
4. **Testing**: Probar en diferentes velocidades de red
5. **Monitor solo en dev**: No incluir en producción

## 🎯 Checklist de Implementación

- [ ] Reemplazar imágenes críticas con `ImageOptimized`
- [ ] Añadir lazy loading a imágenes below the fold
- [ ] Especificar aspect ratios para evitar layout shift
- [ ] Configurar responsive sizes para imágenes grandes
- [ ] Optimizar URLs de Unsplash con utilidades
- [ ] Implementar preload para imágenes críticas
- [ ] Añadir monitor de performance en desarrollo
- [ ] Probar en conexiones lentas (3G/2G)
- [ ] Verificar que funcione el modo ahorro de datos
- [ ] Medir mejoras en Web Vitals (LCP, CLS)

## 📚 Recursos Adicionales

- [Web Vitals](https://web.dev/vitals/)
- [Lazy Loading Images](https://web.dev/lazy-loading-images/)
- [Responsive Images](https://web.dev/responsive-images/)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
- [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

**Última actualización**: Noviembre 2024  
**Versión**: 1.0.0
