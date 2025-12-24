# 🔄 Botón de Cambio de Perfil (Modo Desarrollo)

**Fecha:** 27 de noviembre de 2024  
**Estado:** ✅ Implementado y visible

---

## 📍 Ubicación

El botón de cambio de perfil está ahora **visible en la parte superior** de la página de Configuración de los 3 perfiles:

### **Cliente:**
- Archivo: `/components/ConfiguracionCliente.tsx`
- Ubicación: Banner destacado arriba, justo después del header

### **Trabajador:**
- Archivo: `/components/trabajador/ConfiguracionTrabajador.tsx`
- Ubicación: Banner destacado arriba, justo después del header

### **Gerente:**
- Archivo: `/components/gerente/ConfiguracionGerente.tsx`
- Ubicación: Banner destacado arriba, justo después del header

---

## 🎨 Diseño Visual

```
┌──────────────────────────────────────────────────────────────┐
│  🔧                                                           │
│  Modo Desarrollo - Cambio de Perfil         [Cambiar Perfil] │
│  Rol actual: Cliente                                         │
└──────────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Fondo ámbar claro (`bg-amber-50`)
- ✅ Borde ámbar (`border-amber-200`)
- ✅ Icono `UserCog` destacado
- ✅ Muestra el rol actual
- ✅ Botón grande y visible con icono `RefreshCw`

---

## ⚙️ Funcionamiento

### **Rotación de Roles:**

```
Cliente → Trabajador → Gerente → Cliente (bucle infinito)
```

### **Código:**

```typescript
const handleCambiarRol = () => {
  if (!onCambiarRol) return;
  
  // Rotar entre roles
  const siguienteRol = 
    user.role === 'cliente' ? 'trabajador' :
    user.role === 'trabajador' ? 'gerente' :
    'cliente';
  
  const nombreRol = 
    siguienteRol === 'cliente' ? 'Cliente' :
    siguienteRol === 'trabajador' ? 'Colaborador/Trabajador' :
    'Gerente General';
  
  onCambiarRol(siguienteRol);
  toast.success(`Cambiado a perfil de ${nombreRol} 🔄`);
};
```

---

## 🔌 Integración con App.tsx

En `/App.tsx` ya existe la función `handleCambiarRol`:

```typescript
const handleCambiarRol = (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => {
  if (currentUser) {
    setCurrentUser({
      ...currentUser,
      role: nuevoRol
    });
    toast.success(`Cambiado a perfil de ${nuevoRol}`);
  }
};
```

Esta función se pasa como prop `onCambiarRol` a todos los dashboards.

---

## 📱 Cómo Usar

### **Desde Cliente:**
1. Ir a **Configuración** en el menú lateral
2. Ver el banner ámbar en la parte superior
3. Hacer clic en **"Cambiar Perfil"**
4. → Cambia a **Trabajador**

### **Desde Trabajador:**
1. Ir a **Configuración** 
2. Ver el banner ámbar en la parte superior
3. Hacer clic en **"Cambiar Perfil"**
4. → Cambia a **Gerente**

### **Desde Gerente:**
1. Ir a **Configuración** en la pestaña "General"
2. Ver el banner ámbar en la parte superior
3. Hacer clic en **"Cambiar Perfil"**
4. → Cambia a **Cliente**

---

## 🎯 Visibilidad

El botón **solo aparece si**:
1. La prop `onCambiarRol` está definida (pasada desde `App.tsx`)
2. El objeto `user` existe

```typescript
{onCambiarRol && user && (
  <Card className="border-amber-200 bg-amber-50">
    {/* Banner visible */}
  </Card>
)}
```

---

## 🚀 Para Producción

**⚠️ IMPORTANTE:** Este botón es **solo para desarrollo**.

### **Opción 1: Deshabilitarlo con ENV**

En `/App.tsx`:

```typescript
const isDev = import.meta.env.DEV; // true en desarrollo, false en producción

// Pasar condicionalmente
onCambiarRol={isDev ? handleCambiarRol : undefined}
```

### **Opción 2: Removerlo Manualmente**

Antes de publicar, eliminar el banner en:
- `/components/ConfiguracionCliente.tsx` (líneas ~96-123)
- `/components/trabajador/ConfiguracionTrabajador.tsx` (líneas ~135-162)
- `/components/gerente/ConfiguracionGerente.tsx` (líneas ~524-551)

### **Opción 3: Dejarlo (con restricciones)**

Puedes dejarlo pero solo visible para **GERENTE_GENERAL** con permisos especiales:

```typescript
const puedeVerModoDesarrollo = user.role === 'gerente' && user.permissions?.includes('DEV_MODE');

{puedeVerModoDesarrollo && (
  <Card>...</Card>
)}
```

---

## 🎨 Personalización

### **Cambiar Color del Banner:**

```typescript
// De ámbar a azul, por ejemplo:
<Card className="border-blue-200 bg-blue-50">
  <div className="p-2 rounded-lg bg-blue-100">
    <UserCog className="w-5 h-5 text-blue-600" />
  </div>
  <Button className="bg-blue-600 hover:bg-blue-700">
    Cambiar Perfil
  </Button>
</Card>
```

### **Añadir Confirmación:**

```typescript
const handleCambiarRol = () => {
  if (!confirm('¿Estás seguro de cambiar de perfil?')) return;
  
  // ... resto del código
};
```

---

## ✅ Checklist de Implementación

- [x] Banner visible en `ConfiguracionCliente.tsx`
- [x] Banner visible en `ConfiguracionTrabajador.tsx`
- [x] Banner visible en `ConfiguracionGerente.tsx`
- [x] Iconos `UserCog` y `RefreshCw` importados
- [x] Función `handleCambiarRol` implementada
- [x] Toast de confirmación al cambiar
- [x] Eliminados botones duplicados/viejos
- [x] Diseño consistente en los 3 perfiles

---

## 📸 Preview

**Banner en la configuración:**

```
╔════════════════════════════════════════════════════════╗
║  🔧  Modo Desarrollo - Cambio de Perfil                ║
║      Rol actual: Cliente                               ║
║                                      [🔄 Cambiar Perfil]║
╚════════════════════════════════════════════════════════╝

[Cuenta] [Privacidad] [Seguridad] [Notificaciones] [Otros]

┌────────────────────────────────────────────────────────┐
│  Información Personal                                  │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

---

## 🔗 Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `/App.tsx` | Función principal `handleCambiarRol` |
| `/components/ConfiguracionCliente.tsx` | Banner para Cliente |
| `/components/trabajador/ConfiguracionTrabajador.tsx` | Banner para Trabajador |
| `/components/gerente/ConfiguracionGerente.tsx` | Banner para Gerente |
| `/components/ClienteDashboard.tsx` | Recibe prop `onCambiarRol` |
| `/components/TrabajadorDashboard.tsx` | Recibe prop `onCambiarRol` |
| `/components/GerenteDashboard.tsx` | Recibe prop `onCambiarRol` |

---

**¡Listo para usar!** 🎉

Ahora puedes cambiar entre perfiles fácilmente desde la configuración de cualquier perfil.
