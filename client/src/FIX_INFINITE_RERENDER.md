# 🔧 Fix: Infinite Re-renders en TPV360Master

## ❌ Problema

```
Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

El error ocurría en el componente `TPV360Master.tsx` en la línea 153.

## 🔍 Causa Raíz

La función `calcularTotal()` estaba siendo llamada **durante el render** del componente (en el JSX) y dentro de esa función se estaban ejecutando `setState`:

```tsx
// ❌ ANTES - CÓDIGO PROBLEMÁTICO
const calcularTotal = () => {
  const totalSinDescuento = carrito.reduce((total, item) => total + item.subtotal, 0);
  
  if (carrito.length > 0) {
    const resultado = aplicarDescuentosAutomaticos(carritoServicio);
    
    // ⚠️ PROBLEMA: setState durante el render causa re-render infinito
    setPromocionesAplicadasActuales(resultado.promocionesAplicadas);
    setDescuentoTotalAplicado(resultado.descuentoTotal);
    
    return totalSinDescuento - resultado.descuentoTotal;
  }
  
  return totalSinDescuento;
};

// ❌ Llamado durante el render
<span>{calcularTotal().toFixed(2)}€</span>
```

### Ciclo Infinito:
1. Componente renderiza
2. JSX llama a `calcularTotal()`
3. `calcularTotal()` llama a `setState`
4. `setState` causa un nuevo render
5. Vuelve al paso 1 → ♾️ Loop infinito

## ✅ Solución Implementada

Mover la lógica de cálculo a un `useEffect` que se ejecuta solo cuando cambia el carrito:

```tsx
// ✅ DESPUÉS - CÓDIGO CORREGIDO
import { useState, useEffect, useMemo } from 'react';

// Estado para almacenar el total calculado
const [totalCarrito, setTotalCarrito] = useState(0);

// useEffect se ejecuta solo cuando cambia el carrito
useEffect(() => {
  const totalSinDescuento = carrito.reduce((total, item) => total + item.subtotal, 0);
  
  if (carrito.length > 0) {
    try {
      const carritoServicio: ItemCarritoServicio[] = carrito.map(item => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        categoria: item.producto.categoria
      }));

      const resultado = aplicarDescuentosAutomaticos(carritoServicio);
      
      // ✅ Ahora es seguro usar setState dentro de useEffect
      setPromocionesAplicadasActuales(resultado.promocionesAplicadas);
      setDescuentoTotalAplicado(resultado.descuentoTotal);
      setTotalCarrito(totalSinDescuento - resultado.descuentoTotal);
    } catch (error) {
      console.error('[TPV] Error al aplicar promociones:', error);
      setTotalCarrito(totalSinDescuento);
    }
  } else {
    setPromocionesAplicadasActuales([]);
    setDescuentoTotalAplicado(0);
    setTotalCarrito(0);
  }
}, [carrito, aplicarDescuentosAutomaticos]); // Dependencias

// Función simplificada que solo retorna el valor ya calculado
const calcularTotal = () => {
  return totalCarrito;
};
```

## 📋 Cambios Realizados

### 1. **Importar `useMemo`** (para futuras optimizaciones)
```tsx
import { useState, useEffect, useMemo } from 'react';
```

### 2. **Nuevo estado `totalCarrito`**
```tsx
const [totalCarrito, setTotalCarrito] = useState(0);
```

### 3. **useEffect para calcular promociones**
- Se ejecuta solo cuando `carrito` o `aplicarDescuentosAutomaticos` cambian
- Actualiza los estados de forma segura sin causar re-renders infinitos
- Maneja casos de error
- Resetea estados cuando el carrito está vacío

### 4. **Función `calcularTotal()` simplificada**
- Ahora solo retorna el valor ya calculado
- No ejecuta setState
- Segura para usar en el render

## 🎯 Beneficios

✅ **Elimina re-renders infinitos**  
✅ **Mejor performance** - Cálculos solo cuando cambia el carrito  
✅ **Código más seguro** - Separación clara entre cálculo y render  
✅ **Fácil de mantener** - Lógica bien organizada  

## 🧪 Verificación

Para verificar que el problema está resuelto:

1. ✅ El componente `TPV360Master` se renderiza correctamente
2. ✅ No hay errores en consola sobre re-renders
3. ✅ Las promociones se calculan correctamente
4. ✅ El total se actualiza cuando se modifica el carrito
5. ✅ No hay degradación de performance

## 📚 Lecciones Aprendidas

### ❌ NUNCA hacer:
```tsx
const MiComponente = () => {
  const [count, setCount] = useState(0);
  
  // ❌ setState directamente en el cuerpo del componente
  setCount(count + 1); // ♾️ Loop infinito
  
  return <div>{count}</div>;
};
```

### ✅ SIEMPRE hacer:
```tsx
const MiComponente = () => {
  const [count, setCount] = useState(0);
  
  // ✅ setState dentro de useEffect
  useEffect(() => {
    setCount(count + 1);
  }, []); // Con dependencias controladas
  
  // ✅ setState dentro de event handlers
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return <div onClick={handleClick}>{count}</div>;
};
```

## 🔗 Archivos Modificados

- `/components/TPV360Master.tsx`
  - Línea 1: Importar `useMemo`
  - Líneas 343-380: Nueva implementación de cálculo de totales

## 🚀 Estado

- ✅ **Problema resuelto**
- ✅ **Código optimizado**
- ✅ **Listo para producción**

---

**Fecha**: Noviembre 2024  
**Severidad original**: 🔴 Critical (App crasheaba)  
**Severidad actual**: ✅ Resuelto
