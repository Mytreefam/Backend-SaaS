# ✅ PERMISOS DE EMPLEADO v2.0 - COMPLETADO

**Estado:** ✅ Implementado 100% en frontend  
**Fecha:** 26 de Noviembre de 2025  
**Módulo:** Gerente → Equipo y RRHH → Perfil de Empleado → Tab "Permisos"

---

## 🎯 OBJETIVO

Rediseñar la pestaña de "Permisos" del modal "Perfil de Empleado" añadiendo:
1. **Selector de Rol** del trabajador (6 roles)
2. **Acordeones expandibles** para cada bloque de permisos
3. **Sub-permisos** dentro de cada bloque (17 sub-permisos total)
4. **Modal de Resumen** de permisos activos
5. **Estructura autolayout** para conexión con APIs

---

## 🗺️ NAVEGACIÓN

```
Vista Previa → Gerente → Equipo y RRHH 
→ Tab "Equipo" 
→ Empleado "Carlos Méndez García" 
→ Botón "..." → "Ver perfil"
→ Tab "Permisos"
```

---

## 📦 ARCHIVOS MODIFICADOS

### ✅ Actualizado:
```
/components/gerente/EquipoRRHH.tsx
  ├─ Añadido import de Accordion
  ├─ Nuevos estados:
  │  ├─ rolSeleccionado
  │  ├─ modalResumenPermisos
  │  └─ permisosActivos (17 permisos)
  ├─ Rediseñada pestaña "Permisos"
  │  ├─ Selector de rol
  │  ├─ 4 acordeones con sub-permisos
  │  └─ Botón "Ver resumen de permisos"
  └─ Nuevo modal "Resumen de permisos"
```

---

## 🎨 ESTRUCTURA REDISEÑADA

### **1. SELECTOR DE ROL** 🎭

**Ubicación:** Arriba del todo, antes de los acordeones

**Componente:**
```tsx
<Select value={rolSeleccionado} onValueChange={setRolSeleccionado}>
  <SelectItem value="cocinero">Cocinero</SelectItem>
  <SelectItem value="encargado">Encargado</SelectItem>
  <SelectItem value="repartidor">Repartidor</SelectItem>
  <SelectItem value="camarero">Camarero</SelectItem>
  <SelectItem value="gerente">Gerente</SelectItem>
  <SelectItem value="administrador">Administrador</SelectItem>
</Select>
```

**Características:**
- ✅ Dropdown con 6 roles predefinidos
- ✅ Fondo degradado teal
- ✅ Descripción: "El rol determina los permisos predeterminados"
- ✅ AutoLayout horizontal
- ✅ Estado: `rolSeleccionado`

**Uso futuro:**
```typescript
// Al cambiar rol → Cargar plantilla de permisos
const cargarPlantillaRol = (rol: string) => {
  const plantillas = {
    cocinero: {
      fichar_entrada_salida: true,
      cambiar_estado_cocina: true,
      ver_pedidos: true
      // ... más permisos
    },
    encargado: {
      // Todos los permisos excepto cambiar_roles
    }
  };
  setPermisosActivos(plantillas[rol]);
};
```

---

### **2. ACORDEONES DE PERMISOS** 🎼

**Cantidad:** 4 bloques expandibles

#### **BLOQUE 1: Acceso al sistema** 🛡️

**Icono:** `Shield` (teal-600)

**Toggle general:** Activa/desactiva los 3 sub-permisos

**Sub-permisos:**
- ✅ Iniciar sesión (`iniciar_sesion`)
- ✅ Ver su perfil (`ver_perfil`)
- ✅ Recibir notificaciones (`recibir_notificaciones`)

**Estado dinámico:**
```
"3 permisos activos" / "Sin permisos activos"
```

---

#### **BLOQUE 2: Fichar horarios** ⏰

**Icono:** `Clock` (blue-600)

**Toggle general:** Activa/desactiva los 3 sub-permisos

**Sub-permisos:**
- ✅ Fichar entrada/salida (`fichar_entrada_salida`)
- ✅ Ver horas (`ver_horas`)
- ✅ Ver calendario (`ver_calendario`)

**Estado dinámico:**
```
"3 permisos activos" / "1 permiso activo" / "Sin permisos activos"
```

---

#### **BLOQUE 3: Gestión de pedidos** 📄

**Icono:** `FileText` (purple-600)

**Toggle general:** Activa/desactiva los 7 sub-permisos

**Sub-permisos:**
- ✅ Ver pedidos (`ver_pedidos`)
- ✅ Crear pedido (`crear_pedido`)
- ✅ Editar pedido (`editar_pedido`)
- ✅ Cambiar estado cocina (`cambiar_estado_cocina`)
- ✅ Cambiar estado reparto (`cambiar_estado_reparto`)
- ✅ Ver método de pago (`ver_metodo_pago`)
- ✅ Ver costes escandallo (`ver_costes_escandallo`)

**Estado dinámico:**
```
"4 de 7 permisos activos"
```

---

#### **BLOQUE 4: Gestión de equipo** 👥

**Icono:** `Users` (orange-600)

**Toggle general:** Activa/desactiva los 4 sub-permisos

**Sub-permisos:**
- ✅ Ver empleados (`ver_empleados`)
- ✅ Ver fichajes del equipo (`ver_fichajes_equipo`)
- ✅ Cambiar roles (`cambiar_roles`)
- ✅ Invitar trabajador (`invitar_trabajador`)

**Estado dinámico:**
```
"0 de 4 permisos activos" / "4 de 4 permisos activos"
```

---

### **3. BOTÓN "VER RESUMEN DE PERMISOS"** 👁️

**Ubicación:** Después de los acordeones, antes de "Dar de baja"

**Componente:**
```tsx
<Button 
  variant="outline" 
  size="sm" 
  className="w-full mt-3"
  onClick={() => setModalResumenPermisos(true)}
>
  <Eye className="w-4 h-4 mr-2" />
  Ver resumen de permisos
</Button>
```

**Acción:** Abre el modal de resumen con todos los permisos activos

---

## 📊 MODAL RESUMEN DE PERMISOS

### **Estructura:**

#### **Header:**
```
Icono Shield + "Resumen de permisos activos"
Descripción: "Carlos Méndez García • Rol: cocinero"
```

#### **Contenido:**

Muestra **solo los permisos activos** agrupados por bloque:

```
┌─ Acceso al sistema (borde izq teal)
│  ✓ Iniciar sesión
│  ✓ Ver su perfil
│  ✓ Recibir notificaciones
└────

┌─ Fichar horarios (borde izq blue)
│  ✓ Fichar entrada/salida
│  ✓ Ver horas
│  ✓ Ver calendario
└────

┌─ Gestión de pedidos (borde izq purple)
│  ✓ Ver pedidos
│  ✓ Cambiar estado cocina
│  ✘ Crear pedidos (no se muestra, está inactivo)
└────

┌─ Total de permisos activos:
│  9 de 17 (badge teal)
└────
```

#### **Footer:**
- Botón "Cerrar"
- Botón "Guardar cambios" (teal) → Guarda en BBDD y cierra modal

---

## 🗄️ ESTRUCTURA DE DATOS

### **Estado completo de permisos:**

```typescript
const [permisosActivos, setPermisosActivos] = useState({
  // Acceso al sistema (3)
  iniciar_sesion: true,
  ver_perfil: true,
  recibir_notificaciones: true,
  
  // Fichar horarios (3)
  fichar_entrada_salida: true,
  ver_horas: true,
  ver_calendario: true,
  
  // Gestión de pedidos (7)
  ver_pedidos: true,
  crear_pedido: false,
  editar_pedido: false,
  cambiar_estado_cocina: true,
  cambiar_estado_reparto: false,
  ver_metodo_pago: false,
  ver_costes_escandallo: false,
  
  // Gestión de equipo (4)
  ver_empleados: false,
  ver_fichajes_equipo: false,
  cambiar_roles: false,
  invitar_trabajador: false
});
```

**Total:** 17 sub-permisos

---

## 🔌 INTEGRACIÓN CON BACKEND

### **Endpoint sugerido:**

#### `GET /api/empleados/{id}/permisos`
Obtener permisos actuales del empleado

**Response:**
```json
{
  "empleado_id": "EMP-001",
  "rol": "cocinero",
  "permisos": {
    "iniciar_sesion": true,
    "ver_perfil": true,
    "recibir_notificaciones": true,
    "fichar_entrada_salida": true,
    "ver_horas": true,
    "ver_calendario": true,
    "ver_pedidos": true,
    "crear_pedido": false,
    "editar_pedido": false,
    "cambiar_estado_cocina": true,
    "cambiar_estado_reparto": false,
    "ver_metodo_pago": false,
    "ver_costes_escandallo": false,
    "ver_empleados": false,
    "ver_fichajes_equipo": false,
    "cambiar_roles": false,
    "invitar_trabajador": false
  },
  "fecha_modificacion": "2025-11-26T10:30:00Z",
  "modificado_por": "USR-GERENTE-001"
}
```

---

#### `PUT /api/empleados/{id}/permisos`
Actualizar permisos del empleado

**Request:**
```json
{
  "rol": "encargado",
  "permisos": {
    "iniciar_sesion": true,
    "ver_perfil": true,
    "recibir_notificaciones": true,
    "fichar_entrada_salida": true,
    "ver_horas": true,
    "ver_calendario": true,
    "ver_pedidos": true,
    "crear_pedido": true,
    "editar_pedido": true,
    "cambiar_estado_cocina": true,
    "cambiar_estado_reparto": true,
    "ver_metodo_pago": true,
    "ver_costes_escandallo": false,
    "ver_empleados": true,
    "ver_fichajes_equipo": true,
    "cambiar_roles": false,
    "invitar_trabajador": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Permisos actualizados correctamente",
  "permisos_activos": 15
}
```

---

#### `GET /api/roles/{rol}/plantilla-permisos`
Obtener plantilla de permisos por rol

**Response:**
```json
{
  "rol": "cocinero",
  "permisos_predeterminados": {
    "iniciar_sesion": true,
    "ver_perfil": true,
    "recibir_notificaciones": true,
    "fichar_entrada_salida": true,
    "ver_horas": true,
    "ver_calendario": true,
    "ver_pedidos": true,
    "crear_pedido": false,
    "editar_pedido": false,
    "cambiar_estado_cocina": true,
    "cambiar_estado_reparto": false,
    "ver_metodo_pago": false,
    "ver_costes_escandallo": false,
    "ver_empleados": false,
    "ver_fichajes_equipo": false,
    "cambiar_roles": false,
    "invitar_trabajador": false
  }
}
```

---

## 📋 PLANTILLAS DE PERMISOS POR ROL

### **Cocinero** 👨‍🍳
```
✅ Acceso básico (3/3)
✅ Fichar horarios (3/3)
🟡 Gestión pedidos (2/7): Ver pedidos, Cambiar estado cocina
❌ Gestión equipo (0/4)
```

### **Encargado** 👔
```
✅ Acceso básico (3/3)
✅ Fichar horarios (3/3)
✅ Gestión pedidos (6/7): Todos excepto costes escandallo
🟡 Gestión equipo (3/4): Ver empleados, Ver fichajes, Invitar (sin cambiar roles)
```

### **Repartidor** 🏍️
```
✅ Acceso básico (3/3)
✅ Fichar horarios (3/3)
🟡 Gestión pedidos (2/7): Ver pedidos, Cambiar estado reparto
❌ Gestión equipo (0/4)
```

### **Camarero** 🍽️
```
✅ Acceso básico (3/3)
✅ Fichar horarios (3/3)
🟡 Gestión pedidos (3/7): Ver, Crear, Ver método pago
❌ Gestión equipo (0/4)
```

### **Gerente** 💼
```
✅ Acceso básico (3/3)
✅ Fichar horarios (3/3)
✅ Gestión pedidos (7/7): TODOS
✅ Gestión equipo (4/4): TODOS
```

### **Administrador** 🔧
```
✅ TODOS LOS PERMISOS (17/17)
```

---

## 🎨 CARACTERÍSTICAS UI/UX

### **Acordeones:**
- ✅ Pueden abrirse múltiples a la vez (`type="multiple"`)
- ✅ Toggle general en la cabecera (no se colapsa al hacer clic)
- ✅ Contador dinámico de permisos activos
- ✅ Hover en sub-permisos (bg-gray-50)
- ✅ Iconos con colores específicos por bloque

### **Selector de Rol:**
- ✅ Fondo degradado `from-teal-50 to-teal-100/30`
- ✅ Border rounded
- ✅ Descripción explicativa
- ✅ 6 opciones de rol

### **Modal Resumen:**
- ✅ Muestra solo permisos activos
- ✅ Agrupados por bloque con borde izquierdo de color
- ✅ Iconos CheckCircle verdes
- ✅ Badge con total de permisos activos
- ✅ Botones Cerrar + Guardar cambios

### **Estilos respetados:**
- ✅ NO se han cambiado colores
- ✅ NO se han cambiado iconos
- ✅ NO se han cambiado paddings/margins
- ✅ NO se ha modificado tipografía
- ✅ Bloque rojo "Dar de baja" intacto

---

## 🧪 CONSOLE LOGS PARA DEBUGGING

Al guardar permisos desde el modal de resumen:

```javascript
console.log('💾 GUARDAR PERMISOS:', {
  empleadoId: 'EMP-001',
  rol: 'cocinero',
  permisos: {
    iniciar_sesion: true,
    ver_perfil: true,
    recibir_notificaciones: true,
    // ... todos los permisos
  }
});
```

---

## 📱 COMPORTAMIENTO RESPONSIVE

- ✅ Selector de rol: 100% width en móvil
- ✅ Acordeones: Stack vertical
- ✅ Sub-permisos: Flex horizontal con wrap
- ✅ Modal resumen: `max-w-2xl` con scroll

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Frontend** (✅ Completado 100%)
- [x] Import de Accordion añadido
- [x] Estados para rol y permisos creados
- [x] Selector de rol implementado (6 opciones)
- [x] 4 acordeones con sub-permisos creados
- [x] 17 sub-permisos configurados
- [x] Toggle general en cada acordeón
- [x] Contador dinámico de permisos
- [x] Botón "Ver resumen" añadido
- [x] Modal resumen implementado
- [x] Filtrado de permisos activos
- [x] Badge con total de permisos
- [x] Console logs para debugging
- [x] Estilos y colores originales respetados
- [x] Bloque "Dar de baja" intacto

### **Backend** (⏳ Pendiente)
- [ ] Tabla `empleado_permisos` (17 columnas boolean)
- [ ] Tabla `rol_plantillas` (plantillas por rol)
- [ ] Endpoint GET /api/empleados/{id}/permisos
- [ ] Endpoint PUT /api/empleados/{id}/permisos
- [ ] Endpoint GET /api/roles/{rol}/plantilla-permisos
- [ ] Migración de permisos existentes
- [ ] Validación de permisos en APIs
- [ ] Auditoría de cambios de permisos

---

## 🔄 FLUJO DE USO

### **Caso 1: Asignar permisos a nuevo empleado**

```
1. Gerente abre "Ver perfil" de empleado
2. Va a tab "Permisos"
3. Selecciona rol "Cocinero"
4. Sistema carga plantilla de cocinero
5. Gerente revisa/ajusta permisos en acordeones
6. Clic en "Ver resumen de permisos"
7. Revisa lista de permisos activos
8. Clic en "Guardar cambios"
9. Sistema guarda en BBDD
10. Empleado ahora tiene permisos actualizados
```

---

### **Caso 2: Promover empleado a Encargado**

```
1. Gerente cambia rol de "Cocinero" a "Encargado"
2. Sistema sugiere cargar plantilla de encargado
3. Gerente acepta
4. Automáticamente se activan más permisos:
   - Crear/Editar pedidos
   - Ver empleados
   - Ver fichajes equipo
   - Invitar trabajador
5. Gerente hace ajustes finales
6. Guarda cambios
7. Empleado recibe notificación de cambio de rol
```

---

### **Caso 3: Permisos personalizados**

```
1. Gerente no selecciona rol predefinido
2. Activa permisos manualmente uno por uno
3. Ejemplo: Repartidor que también cocina
   - Activa: Cambiar estado reparto
   - Activa: Cambiar estado cocina
4. Crea perfil híbrido personalizado
5. Guarda y queda registrado
```

---

## 🛠️ MODELO DE DATOS SQL

### **Tabla: `empleado_permisos`**

```sql
CREATE TABLE empleado_permisos (
  id SERIAL PRIMARY KEY,
  empleado_id VARCHAR(20) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  
  -- Acceso al sistema
  iniciar_sesion BOOLEAN DEFAULT true,
  ver_perfil BOOLEAN DEFAULT true,
  recibir_notificaciones BOOLEAN DEFAULT true,
  
  -- Fichar horarios
  fichar_entrada_salida BOOLEAN DEFAULT true,
  ver_horas BOOLEAN DEFAULT true,
  ver_calendario BOOLEAN DEFAULT true,
  
  -- Gestión de pedidos
  ver_pedidos BOOLEAN DEFAULT false,
  crear_pedido BOOLEAN DEFAULT false,
  editar_pedido BOOLEAN DEFAULT false,
  cambiar_estado_cocina BOOLEAN DEFAULT false,
  cambiar_estado_reparto BOOLEAN DEFAULT false,
  ver_metodo_pago BOOLEAN DEFAULT false,
  ver_costes_escandallo BOOLEAN DEFAULT false,
  
  -- Gestión de equipo
  ver_empleados BOOLEAN DEFAULT false,
  ver_fichajes_equipo BOOLEAN DEFAULT false,
  cambiar_roles BOOLEAN DEFAULT false,
  invitar_trabajador BOOLEAN DEFAULT false,
  
  -- Metadata
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  modificado_por VARCHAR(20),
  
  -- Multiempresa
  empresa_id VARCHAR(20) NOT NULL,
  marca_id VARCHAR(20),
  punto_venta_id VARCHAR(20),
  
  CONSTRAINT fk_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
  UNIQUE(empleado_id)
);
```

---

### **Tabla: `rol_plantillas`**

```sql
CREATE TABLE rol_plantillas (
  id SERIAL PRIMARY KEY,
  rol VARCHAR(50) NOT NULL UNIQUE,
  nombre_display VARCHAR(100),
  descripcion TEXT,
  
  -- Permisos predeterminados (JSON o columnas individuales)
  permisos_json JSONB,
  
  -- Metadata
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_rol UNIQUE(rol)
);

-- Insertar plantillas predefinidas
INSERT INTO rol_plantillas (rol, nombre_display, descripcion, permisos_json) VALUES
('cocinero', 'Cocinero', 'Prepara pedidos en cocina', '{
  "iniciar_sesion": true,
  "ver_perfil": true,
  "recibir_notificaciones": true,
  "fichar_entrada_salida": true,
  "ver_horas": true,
  "ver_calendario": true,
  "ver_pedidos": true,
  "cambiar_estado_cocina": true
}'),
('encargado', 'Encargado', 'Supervisa operaciones diarias', '{
  "iniciar_sesion": true,
  "ver_perfil": true,
  "recibir_notificaciones": true,
  "fichar_entrada_salida": true,
  "ver_horas": true,
  "ver_calendario": true,
  "ver_pedidos": true,
  "crear_pedido": true,
  "editar_pedido": true,
  "cambiar_estado_cocina": true,
  "cambiar_estado_reparto": true,
  "ver_metodo_pago": true,
  "ver_empleados": true,
  "ver_fichajes_equipo": true,
  "invitar_trabajador": true
}');
```

---

## 🎉 CONCLUSIÓN

**Sistema de Permisos de Empleado v2.0** completamente implementado en frontend:

✅ **6 roles** configurables  
✅ **4 bloques** de permisos con acordeones  
✅ **17 sub-permisos** individuales  
✅ **Toggle general** + toggles individuales  
✅ **Contador dinámico** de permisos activos  
✅ **Modal resumen** con vista agrupada  
✅ **AutoLayout** preparado para APIs  
✅ **Console logs** para debugging  
✅ **Estilos originales** 100% respetados  

**Todo listo para conectar con backend y gestionar permisos granulares de empleados! 🚀**
