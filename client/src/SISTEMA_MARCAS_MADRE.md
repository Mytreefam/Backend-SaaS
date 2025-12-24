# ⭐ SISTEMA DE MARCAS MADRE - UDAR EDGE

## 📋 Resumen

Sistema unificado de gestión de marcas que funciona como única fuente de verdad para toda la aplicación. Las marcas se crean desde el **Perfil Gerente → Empresas → Crear/Editar Empresa** y se sincronizan automáticamente con:

- ✅ TPV (selector visual con logos)
- ✅ App Cliente (catálogo de productos)
- ✅ Gestión de Productos (filtrado por marca)
- ✅ Todos los módulos del sistema

---

## 🏗️ Arquitectura

### **Flujo de Datos:**

```
Gerente → Crear Empresa → Añadir Marcas (con logos)
    ↓
localStorage: 'udar_marcas_sistema'
    ↓
┌─→ empresaConfig.ts (lee marcas y actualiza MARCAS)
├─→ ProductosContext (filtra productos por marca)
├─→ TPV360Master (selector visual con logos)
└─→ CatalogoCliente (filtrado de productos)
```

---

## 📂 Archivos Principales

### **1. `/utils/marcasHelper.ts`**
Helper centralizado para CRUD de marcas en localStorage.

**Funciones principales:**
- `inicializarMarcasDefault()` - Crea marcas por defecto si no existen
- `obtenerMarcas()` - Obtiene todas las marcas del sistema
- `guardarMarca()` - Guarda o actualiza una marca
- `guardarMarcasMultiples()` - Guarda varias marcas (desde crear empresa)
- `eliminarMarca()` - Elimina una marca
- `obtenerMarcasPorEmpresa()` - Filtra marcas por empresa

### **2. `/constants/empresaConfig.ts`**
Configuración centralizada que lee marcas desde localStorage.

**Características:**
- ✅ Lee automáticamente desde `localStorage: 'udar_marcas_sistema'`
- ✅ Fallback a marcas por defecto si localStorage está vacío
- ✅ Se actualiza automáticamente con el evento `'marcas-sistema-updated'`
- ✅ Exporta `MARCAS`, `MARCAS_ARRAY`, `OPCIONES_FILTRO_MARCA`

### **3. `/components/gerente/ModalCrearEmpresa.tsx`**
Modal para crear nuevas empresas con sus marcas.

**Funcionalidades:**
- ✅ Añadir múltiples marcas con logo
- ✅ Preview de logos circulares
- ✅ Validación de imágenes (tipo, tamaño)
- ✅ Sincronización automática con localStorage
- ✅ Dispara evento `'marcas-sistema-updated'` al guardar

### **4. `/components/TPV360Master.tsx`**
TPV con selector visual de marcas.

**Características:**
- ✅ Botones circulares con logo de cada marca
- ✅ Cambio de marca con click
- ✅ Filtrado automático de productos por marca activa
- ✅ Contador de productos por marca
- ✅ Indicador visual de marca activa

---

## 🔄 Sincronización Automática

### **Evento Custom: `'marcas-sistema-updated'`**

Cuando se crea o actualiza una marca, se dispara este evento:

```typescript
window.dispatchEvent(new CustomEvent('marcas-sistema-updated'));
```

Todos los componentes que usan marcas escuchan este evento y se actualizan automáticamente.

### **Listener en empresaConfig.ts:**

```typescript
window.addEventListener('marcas-sistema-updated', () => {
  recargarMarcas();
});
```

---

## 🎨 Estructura de una Marca

```typescript
interface MarcaSistema {
  id: string;              // Ej: 'MRC-001'
  codigo: string;          // Ej: 'MODOMIO'
  nombre: string;          // Ej: 'Modomio'
  color?: string;          // Ej: '#FF6B35'
  colorIdentidad?: string; // Alias de color
  logo?: string;           // Base64 o URL de la imagen
  logoUrl?: string;        // Alias de logo
  icono?: string;          // Emoji (opcional)
  empresaId?: string;      // ID de la empresa propietaria
  empresaNombre?: string;  // Nombre de la empresa
  activo?: boolean;        // Si la marca está activa
  fechaCreacion?: string;  // ISO timestamp
}
```

---

## 📊 Productos y Marcas

### **Relación Multimarca:**

Un producto puede pertenecer a **múltiples marcas** (ejemplo: Coca-Cola):

```typescript
interface Producto {
  id: string;
  nombre: string;
  marcas_ids: string[];     // ['MRC-001', 'MRC-002']
  marcas_nombres: string[]; // ['Modomio', 'Blackburguer']
  // ... otros campos
}
```

### **Ejemplo: Coca-Cola multimarca**

```typescript
{
  id: 'PROD-015',
  nombre: 'Coca-Cola 33cl',
  marcas_ids: ['MRC-001', 'MRC-002'], // Se vende en ambas marcas
  marcas_nombres: ['Modomio', 'Blackburguer'],
  precio: 2.50,
  // ...
}
```

---

## 🎯 Uso en Componentes

### **TPV - Selector de Marca:**

```tsx
import { MARCAS } from '../../constants/empresaConfig';

// El TPV ya tiene implementado el selector visual
{marcasDisponibles.map(marcaId => {
  const marca = MARCAS[marcaId];
  return (
    <button onClick={() => cambiarMarca(marcaId)}>
      <img src={marca.logoUrl} alt={marca.nombre} />
    </button>
  );
})}
```

### **Cliente - Filtrar Productos:**

```tsx
import { MARCAS } from '../../constants/empresaConfig';

const productosFiltrados = productos.filter(p => 
  p.marcas_ids?.includes(marcaSeleccionada) &&
  p.activo !== false
);
```

### **Gerente - Crear Marca:**

```tsx
import { guardarMarcasMultiples } from '../../utils/marcasHelper';

// Al crear empresa con marcas
const marcasNuevas = marcas.map(m => ({
  id: m.marcaCodigo,
  codigo: m.marcaCodigo,
  nombre: m.marcaNombre,
  logo: m.logoUrl,
  color: m.colorIdentidad,
  empresaId: empresaId
}));

guardarMarcasMultiples(marcasNuevas);
```

---

## ✅ Ventajas del Sistema

1. **✅ Única Fuente de Verdad**
   - localStorage como base de datos centralizada
   - No hay duplicación de código

2. **✅ Sincronización Automática**
   - Eventos custom para propagación de cambios
   - Todos los componentes se actualizan en tiempo real

3. **✅ Soporte Multimarca**
   - Productos pueden estar en varias marcas
   - Ejemplo: Coca-Cola en panadería y hamburguesas

4. **✅ Visual y Funcional**
   - Logos de marcas en TPV (selector circular)
   - Preview de logos al crear/editar

5. **✅ Fácil de Extender**
   - Sistema modular
   - Helper functions para operaciones comunes

---

## 🚀 Próximos Pasos

### **Funcionalidades Futuras:**

- [ ] Sincronizar con backend/API cuando esté disponible
- [ ] Gestión de marcas en ConfiguracionGerente (edición individual)
- [ ] Historial de cambios de marcas
- [ ] Importación/Exportación de marcas
- [ ] Permisos por marca (qué usuarios ven qué marcas)

---

## 🔧 Mantenimiento

### **Limpiar localStorage (desarrollo):**

```javascript
localStorage.removeItem('udar_marcas_sistema');
location.reload();
```

### **Ver marcas actuales (consola):**

```javascript
JSON.parse(localStorage.getItem('udar_marcas_sistema'));
```

### **Forzar recarga de marcas:**

```javascript
window.dispatchEvent(new CustomEvent('marcas-sistema-updated'));
```

---

## 📝 Notas Importantes

- ⚠️ **NO modificar** `MARCAS` directamente en `empresaConfig.ts`
- ⚠️ **SIEMPRE usar** `guardarMarca()` o `guardarMarcasMultiples()` para cambios
- ⚠️ **El archivo** `/components/gerente/GestionMarcas.tsx` está **DEPRECADO** (ya no se usa)
- ✅ Las marcas se crean **SOLO desde Gerente → Empresas → Crear/Editar**

---

**Documentado: 03/12/2025**  
**Sistema: Udar Edge v1.0**  
**Autor: Sistema de Marcas MADRE**
