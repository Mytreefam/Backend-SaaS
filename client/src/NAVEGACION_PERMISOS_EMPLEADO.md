# 🗺️ NAVEGACIÓN: MODAL DE PERMISOS DE EMPLEADO

## 📍 RUTA DE NAVEGACIÓN COMPLETA

Para acceder al nuevo modal de permisos de empleado desde la vista previa:

```
Vista Previa 
  └─> Perfil: GERENTE
      └─> Menú lateral: "Equipo y RRHH"
          └─> Tab: "Equipo"
              └─> Lista de empleados
                  └─> Clic en menú "⋮" (tres puntos) de cualquier empleado
                      └─> Opción: "Administrar permisos" 🛡️
                          └─> 🎉 MODAL DE PERMISOS SE ABRE
```

---

## 🎯 PASO A PASO (VISUAL)

### 1. **Selecciona perfil GERENTE**
   - En la vista previa, asegúrate de estar en el perfil de Gerente
   - Logo verde con iniciales

### 2. **Haz clic en "Equipo y RRHH"** en el menú lateral
   - Icono: 👥 Users
   - Ubicación: Menú lateral izquierdo

### 3. **Verás 4 tabs superiores:**
   ```
   [Equipo] [Horarios] [Consumos Internos] [Modificaciones]
   ```
   - Asegúrate de estar en el tab **"Equipo"** (primero)

### 4. **Lista de empleados:**
   Verás una lista con empleados como:
   - Carlos Méndez García (Panadero Maestro)
   - María González López (Responsable de Bollería)
   - Laura Martínez Ruiz (Dependienta)
   - etc.

### 5. **Cada empleado tiene un menú "⋮" (tres puntos verticales)**
   - Ubicación: Esquina superior derecha de cada tarjeta de empleado
   - Al hacer clic, verás opciones:
     ```
     📧 Abrir Chat
     👁️ Ver perfil
     🛡️ Administrar permisos  ← ESTA OPCIÓN
     ✏️ Modificar contrato
     ```

### 6. **Haz clic en "Administrar permisos"**
   - Se abrirá el nuevo modal rediseñado

---

## 🎨 LO QUE VERÁS EN EL MODAL

### **Header del modal:**
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Permisos del empleado                                │
│    Carlos Méndez García · Código: EMP-001              │
└─────────────────────────────────────────────────────────┘
```

### **Selector de rol:**
```
Rol del empleado: [Encargado ▼]

Opciones disponibles:
- Cocinero
- Encargado
- Repartidor
- Caja / TPV
- Responsable de tienda
- Rol personalizado
```

### **Botón de resumen:**
En la parte superior derecha, junto a "Permisos por categoría":
```
[Ver resumen de permisos] 👁️
```

### **7 bloques expandibles:**
```
▼ 🛡️ Acceso al sistema          3 de 3 activos    [🟢]
▼ 🕐 Fichajes y RRHH             5 de 5 activos    [🟢]
▼ 🛒 Gestión de pedidos          7 de 7 activos    [🟢]
▼ 💳 TPV / Caja                  6 de 6 activos    [🟢]
▼ 📦 Stock y proveedores         6 de 6 activos    [🟢]
▼ 📊 KPI y Finanzas              5 de 5 activos    [🟢]
▼ 👥 Gestión de equipo           5 de 5 activos    [🟢]
```

### **Al expandir un bloque:**
Verás lista de subpermisos con toggles:
```
    ✓ Acceso a la app                          [🟢]
      Puede iniciar sesión en la aplicación
    
    ✓ Ver perfil                               [🟢]
      Puede ver su perfil personal
    
    ✓ Recibir notificaciones                   [🟢]
      Recibe notificaciones push y email
```

### **Zona de peligro (al final):**
```
⚠️ Zona de peligro
   Dar de baja a este empleado eliminará su acceso
                                    [Dar de baja]
```

### **Botones finales:**
```
                    [Cancelar] [Guardar cambios]
```

---

## 🧪 PRUEBAS QUE PUEDES HACER

### 1. **Cambiar el rol:**
   - Selecciona "Cocinero" en el dropdown
   - Observa cómo los toggles se actualizan automáticamente
   - Deberías ver un toast: "Plantilla de rol 'Cocinero' aplicada"
   - Solo algunos permisos quedarán activos (7 en total)

### 2. **Expandir/contraer bloques:**
   - Haz clic en "▼ Gestión de pedidos"
   - El bloque se expande mostrando 7 subpermisos
   - Haz clic de nuevo para contraer

### 3. **Toggle individual:**
   - Expande "Gestión de pedidos"
   - Desactiva el toggle "Ver método de pago"
   - El contador debería cambiar de "7 de 7" a "6 de 7"

### 4. **Toggle general del bloque:**
   - El toggle de la derecha (🟢) activa/desactiva TODO el bloque
   - Prueba desactivar todo el bloque "Stock y proveedores"
   - Todos los subpermisos se desactivan
   - El contador cambia a "0 de 6"

### 5. **Ver resumen:**
   - Haz clic en "Ver resumen de permisos"
   - Se abre un modal lateral/secundario
   - Verás:
     - 3 tarjetas con métricas (activos/inactivos/cobertura)
     - Lista completa por bloques con ✓ o ✗
     - Solo los permisos activos muestran descripción

### 6. **Guardar cambios:**
   - Modifica algunos permisos
   - Haz clic en "Guardar cambios"
   - Deberías ver:
     - Toast: "Permisos actualizados correctamente"
     - Console log con el payload (abre DevTools F12)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **No veo el modal al hacer clic en "Administrar permisos"**
- ✅ Verifica que estés en el perfil de GERENTE
- ✅ Asegúrate de hacer clic en el menú "⋮" correcto
- ✅ Comprueba la consola del navegador (F12) por errores

### **El modal se ve cortado o sin estilos**
- ✅ Asegúrate de que Tailwind está cargado
- ✅ Verifica que los componentes de UI (/components/ui/) existen
- ✅ Comprueba que Shadcn UI está instalado

### **Los toggles no funcionan**
- ✅ Abre DevTools (F12) → Console
- ✅ Deberías ver logs cuando cambias un toggle
- ✅ Si no hay logs, puede haber un error de JavaScript

### **No aparece el botón "Ver resumen de permisos"**
- ✅ Scroll down en el modal
- ✅ El botón está en la parte superior, junto a "Permisos por categoría"

---

## 📊 DATOS DE EJEMPLO

Los empleados de prueba tienen estos datos:

| ID | Nombre | Puesto | Rol inicial |
|----|--------|--------|-------------|
| EMP-001 | Carlos Méndez García | Panadero Maestro | encargado |
| EMP-002 | María González López | Responsable Bollería | encargado |
| EMP-003 | Laura Martínez Ruiz | Dependienta | caja_tpv |
| EMP-004 | Javier Torres Sánchez | Ayudante Panadería | cocinero |
| EMP-005 | Ana Rodríguez Pérez | Encargada Turno | responsable_tienda |

---

## 🎬 FLUJO COMPLETO DE EJEMPLO

```
1. Vista Previa → Perfil GERENTE
2. Menú lateral → "Equipo y RRHH"
3. Tab "Equipo" (ya está seleccionado por defecto)
4. Empleado "Carlos Méndez García"
5. Menú "⋮" → "Administrar permisos" 🛡️

✨ MODAL SE ABRE ✨

6. Selector de rol: "Encargado" (ya seleccionado)
7. Haz clic en "Cocinero"
8. Toast: "Plantilla de rol 'Cocinero' aplicada"
9. Observa que los bloques ahora tienen menos permisos activos
10. Expande "🛒 Gestión de pedidos"
11. Desactiva "Crear pedidos"
12. Haz clic en "Ver resumen de permisos" 👁️
13. Modal secundario se abre
14. Revisa:
    - Permisos activos: 6
    - Permisos inactivos: 31
    - Cobertura: 16%
15. Cierra el resumen (botón "Cerrar")
16. Vuelves al modal principal
17. Haz clic en "Guardar cambios"
18. Toast: "Permisos actualizados correctamente"
19. Console log muestra el payload
20. Modal se cierra
```

---

## 📝 NOTAS IMPORTANTES

- **El modal es COMPLETAMENTE FUNCIONAL** en el frontend
- **Los toggles guardan el estado** mientras el modal está abierto
- **El payload se loggea en console** al guardar (para verificar)
- **NO está conectado al backend** todavía (es solo UI)
- **Los cambios NO se persisten** al cerrar el modal (hasta conectar backend)

---

## 🚀 SIGUIENTE PASO

Una vez verificado que el modal funciona correctamente:

1. **Abre DevTools (F12)**
2. **Ve a Console**
3. **Haz cambios en permisos**
4. **Haz clic en "Guardar cambios"**
5. **Copia el payload que aparece en console**
6. **Envíalo al equipo de backend** para conectar con Make.com

Ejemplo de payload que verás:
```json
{
  "empleado_id": "EMP-001",
  "rol": "cocinero",
  "permisos_activos": [
    "acceso_app",
    "ver_perfil",
    "recibir_notificaciones",
    "fichar",
    "ver_horas",
    "ver_pedidos",
    "cambiar_estado_cocina"
  ],
  "total_permisos": 7
}
```

---

✅ **Todo listo para navegar y probar el modal de permisos!**

Si necesitas ayuda o encuentras algún problema, revisa la documentación completa en:
`/SISTEMA_PERMISOS_EMPLEADO.md`
