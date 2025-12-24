# 🔔 Notificaciones - Resumen Rápido

## 📍 Posición: BOTTOM-CENTER

### ✅ Por qué bottom-center?

1. **No tapa navegación superior** (botón volver, menú)
2. **No tapa navegación inferior** (bottom nav, tabs)
3. **Estándar en apps móviles** (WhatsApp, Instagram, etc.)
4. **Mejor ergonomía** (cerca del pulgar)
5. **No interfiere con gestos** (pull-to-refresh, etc.)

---

## 📱 Posición Visual

```
┌─────────────────────────────────┐
│  [←] Header - LIBRE       [☰]  │ ← ✅ Accesible
├─────────────────────────────────┤
│                                 │
│                                 │
│   Contenido Principal           │
│   TOTALMENTE USABLE             │
│                                 │
│                                 │
├─────────────────────────────────┤
│   ┌─────────────────────┐      │
│   │ ✅ Notificación [X]│      │ ← Aquí están
│   └─────────────────────┘      │
├─────────────────────────────────┤
│ [🏠] [📊] [⚙️] [👤]            │ ← Bottom Nav
└─────────────────────────────────┘
    80px de espacio ↑
```

---

## ⚙️ Configuración

```tsx
<Toaster 
  position="bottom-center"  // ⭐ Clave
  visibleToasts={3}
  duration={3000}
  closeButton
/>
```

---

## 📏 Espaciado

### Mobile (< 768px)
- `bottom: 80px` - Deja espacio para bottom nav
- `+ env(safe-area-inset-bottom)` - iPhone home indicator

### Desktop (>= 768px)
- `bottom: 20px` - Más cerca del borde
- Sin bottom nav típicamente

---

## ⏱️ Duraciones

| Tipo | Duración | Uso |
|------|----------|-----|
| ✅ Success | 2s | Confirmaciones rápidas |
| ℹ️ Info | 3s | Información general |
| ⚠️ Warning | 3.5s | Advertencias |
| ❌ Error | 4s | Errores (más tiempo para leer) |

---

## 🎯 Máximo 3 Toasts

Solo 3 toasts visibles simultáneamente:
1. Primer toast: opacidad 100%
2. Segundo toast: opacidad 85%
3. Tercer toast: opacidad 70%
4. Resto: ocultos

---

## 💡 Uso Recomendado

### ✅ BIEN
```typescript
toast.success('Guardado');
toast.error('Error al guardar');
toast('Acción completada', { duration: 2000 });
```

### ⚠️ EVITAR
```typescript
// NO hacer muchos toasts seguidos
for (let i = 0; i < 10; i++) {
  toast('Mensaje ' + i); // ❌
}

// MEJOR: Un solo toast con resumen
toast.success('10 productos agregados'); // ✅
```

---

## 🔥 Características

- ✅ No bloquea interacción (pointer-events)
- ✅ Botón cerrar manual [X]
- ✅ Auto-dismiss según tipo
- ✅ Responsive mobile/desktop
- ✅ Respeta safe areas
- ✅ Animaciones suaves
- ✅ Rich colors según tipo

---

## 📊 Comparación

| Aspecto | Antes (top) | Ahora (bottom) |
|---------|-------------|----------------|
| Navegación superior | ❌ Tapada | ✅ Libre |
| Navegación inferior | ✅ Libre | ✅ Libre (80px espacio) |
| Ergonomía mobile | ⚠️ Lejos del pulgar | ✅ Cerca del pulgar |
| Estándar apps | ❌ No | ✅ Sí (WhatsApp, etc.) |
| Gestos nativos | ⚠️ Interfería | ✅ Compatible |

---

## 🚀 Testing

### Checklist:
- [ ] Navegar atrás mientras hay toast → ✅ Funciona
- [ ] Abrir menú mientras hay toast → ✅ Funciona
- [ ] Click en bottom nav mientras hay toast → ✅ Funciona
- [ ] 5 toasts seguidos → ✅ Solo 3 visibles
- [ ] Toast en iPhone con notch → ✅ Respeta safe area
- [ ] Toast en iPhone sin home button → ✅ Respeta home indicator

---

## ✅ Resultado

**Notificaciones que informan sin molestar.**

El usuario puede:
- ✅ Navegar libremente
- ✅ Usar todos los botones
- ✅ Interactuar con la app
- ✅ Cerrar toasts manualmente si quiere
- ✅ O dejar que se cierren solos

---

*Udar Edge - Sistema de Notificaciones v2.0*
