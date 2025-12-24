# 🔐 SISTEMA DE PERMISOS DE EMPLEADO - UDAR EDGE

**Versión:** 2.0  
**Fecha:** 26 de Noviembre de 2025  
**Estado:** ✅ Completo con selector de rol y resumen

---

## 📋 RESUMEN DE CAMBIOS

Se ha rediseñado completamente el modal de "Perfil de Empleado > Permisos" con las siguientes mejoras:

✅ **Selector de rol funcional** con plantillas predefinidas  
✅ **Bloques expandibles** organizados por categorías  
✅ **Subpermisos individuales** con toggles independientes  
✅ **Toggle general por bloque** para activar/desactivar todo  
✅ **Modal de resumen** con vista completa de permisos  
✅ **Aplicación automática** de plantillas al cambiar rol  
✅ **Personalización manual** sobre cualquier plantilla  

---

## 🎨 ESTRUCTURA VISUAL DEL MODAL

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Permisos del empleado                                    │
│    Carlos Méndez García · Código: COD-001                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Rol del empleado: [Encargado ▼]                            │
│                                                              │
│ ℹ️ Al cambiar el rol, los permisos se actualizarán         │
│   automáticamente según la plantilla predefinida.           │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Permisos por categoría            [Ver resumen de permisos] │
│                                                              │
│ ▼ 🛡️ Acceso al sistema           3 de 3 activos     [🟢]   │
│    ✓ Acceso a la app                                   [🟢] │
│      Puede iniciar sesión en la aplicación                  │
│    ✓ Ver perfil                                        [🟢] │
│      Puede ver su perfil personal                           │
│    ✓ Recibir notificaciones                            [🟢] │
│      Recibe notificaciones push y email                     │
│                                                              │
│ ▼ 🕐 Fichajes y RRHH             4 de 5 activos      [🟢]  │
│    ✓ Fichar entrada/salida                             [🟢] │
│    ✓ Ver horas trabajadas                              [🟢] │
│    ✓ Ver calendario laboral                            [🟢] │
│    ✓ Ver documentación laboral                         [🟢] │
│    ✗ Subir documentos "Otros"                          [⚪] │
│                                                              │
│ ▼ 🛒 Gestión de pedidos          5 de 7 activos      [🟡]  │
│    ✓ Ver pedidos                                       [🟢] │
│    ✓ Crear pedidos                                     [🟢] │
│    ✓ Editar pedidos                                    [🟢] │
│    ✓ Cambiar estado cocina                             [🟢] │
│    ✓ Cambiar estado reparto                            [🟢] │
│    ✗ Ver método de pago                                [⚪] │
│    ✗ Ver costes del pedido (escandallo)                [⚪] │
│                                                              │
│ ▼ 💳 TPV / Caja                  6 de 6 activos      [🟢]  │
│ ▼ 📦 Stock y proveedores         4 de 6 activos      [🟡]  │
│ ▼ 📊 KPI y Finanzas              2 de 5 activos      [🔴]  │
│ ▼ 👥 Gestión de equipo           2 de 5 activos      [🔴]  │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ ⚠️ Zona de peligro                                          │
│    Dar de baja a este empleado eliminará su acceso          │
│                                        [Dar de baja]         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                           [Cancelar] [Guardar cambios]      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 SELECTOR DE ROL FUNCIONAL

### Opciones disponibles:

| Rol | Descripción | Permisos típicos |
|-----|-------------|------------------|
| **Cocinero** | Preparación de pedidos | Acceso, fichajes, ver pedidos, cambiar estado cocina |
| **Encargado** | Gestión operativa | Acceso, fichajes, pedidos completos, TPV, stock, KPIs básicos |
| **Repartidor** | Entrega de pedidos | Acceso, fichajes, ver pedidos, cambiar estado reparto |
| **Caja / TPV** | Operaciones de venta | Acceso, fichajes, TPV completo, ver pedidos |
| **Responsable de tienda** | Gestión integral | Todos los permisos excepto EBITDA y dar de baja |
| **Rol personalizado** | Sin plantilla | El gerente configura manualmente todos los permisos |

### Comportamiento al cambiar rol:

1. **Usuario selecciona un rol → Sistema aplica plantilla automáticamente**
   - Todos los toggles se actualizan según la plantilla
   - Toast: "Plantilla de rol 'Encargado' aplicada"

2. **Usuario modifica manualmente un permiso → Se marca como personalizado**
   - La plantilla se sobrescribe solo para ese empleado
   - El rol sigue siendo el seleccionado (ej: "Encargado")

3. **Rol "Personalizado" → Sin cambios automáticos**
   - El gerente debe configurar manualmente cada permiso
   - Útil para roles únicos o temporales

---

## 📦 BLOQUES DE PERMISOS

### Bloque 1: 🛡️ Acceso al sistema

**Toggle general:** Activa/desactiva todos los permisos básicos

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| ✅ Acceso a la app | Puede iniciar sesión en la aplicación | `acceso_app` |
| ✅ Ver perfil | Puede ver su perfil personal | `ver_perfil` |
| ✅ Recibir notificaciones | Recibe notificaciones push y email | `recibir_notificaciones` |

---

### Bloque 2: 🕐 Fichajes y RRHH

**Toggle general:** Activa/desactiva todos los permisos de RRHH

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| ⏰ Fichar entrada/salida | Puede fichar su jornada laboral | `fichar` |
| 📊 Ver horas trabajadas | Consultar registro de horas | `ver_horas` |
| 📅 Ver calendario laboral | Consultar calendario y turnos | `ver_calendario` |
| 📄 Ver documentación laboral | Acceder a nóminas, contratos e IRPF | `ver_doc_laboral` |
| 📎 Subir documentos "Otros" | Subir bajas médicas, justificantes, etc. | `subir_doc_otros` |

---

### Bloque 3: 🛒 Gestión de pedidos

**Toggle general:** Activa/desactiva todos los permisos de pedidos

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| 👁️ Ver pedidos | Consultar listado de pedidos | `ver_pedidos` |
| ➕ Crear pedidos | Crear nuevos pedidos de clientes | `crear_pedidos` |
| ✏️ Editar pedidos | Modificar pedidos existentes | `editar_pedidos` |
| 🍳 Cambiar estado cocina | Actualizar estado de preparación | `cambiar_estado_cocina` |
| 🚗 Cambiar estado reparto | Actualizar estado de entrega | `cambiar_estado_reparto` |
| 💳 Ver método de pago | Ver forma de pago del pedido | `ver_metodo_pago` |
| 💰 Ver costes del pedido (escandallo) | Ver desglose de costes | `ver_costes_pedido` |

---

### Bloque 4: 💳 TPV / Caja

**Toggle general:** Activa/desactiva todos los permisos de TPV

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| 👁️ Ver estado TPV | Consultar estado del punto de venta | `ver_tpv` |
| 🔓 Abrir caja | Iniciar turno de caja | `abrir_caja` |
| 🔒 Cerrar caja | Finalizar turno de caja | `cerrar_caja` |
| 🧮 Hacer arqueo | Realizar arqueo de caja | `arqueo` |
| 📊 Ver ventas TPV | Consultar ventas del turno | `ver_ventas_tpv` |
| ↩️ Hacer devoluciones | Procesar devoluciones de clientes | `devoluciones` |

---

### Bloque 5: 📦 Stock y proveedores

**Toggle general:** Activa/desactiva todos los permisos de stock

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| 👁️ Ver stock | Consultar niveles de inventario | `ver_stock` |
| ✏️ Editar stock | Modificar cantidades de stock | `editar_stock` |
| 🛒 Crear pedido proveedor | Realizar pedidos a proveedores | `crear_pedido_proveedor` |
| 📉 Ver mermas | Consultar pérdidas y mermas | `ver_mermas` |
| ✅ Aprobar mermas | Autorizar registro de mermas | `aprobar_mermas` |
| 📜 Ver historial | Consultar histórico de movimientos | `ver_historial` |

---

### Bloque 6: 📊 KPI y Finanzas

**Toggle general:** Activa/desactiva todos los permisos financieros

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| 📈 Ver KPIs punto de venta | Métricas del punto de venta | `ver_kpi_pv` |
| 📊 Ver KPIs marca | Métricas de toda la marca | `ver_kpi_marca` |
| 🍕 Ver escandallos | Consultar costes de productos | `ver_escandallos` |
| 💰 Ver facturación | Consultar facturación y ventas | `ver_facturacion` |
| 📉 Ver EBITDA | Acceder a cuenta de resultados | `ver_ebitda` |

---

### Bloque 7: 👥 Gestión de equipo

**Toggle general:** Activa/desactiva todos los permisos de RRHH

| Permiso | Descripción | ID Backend |
|---------|-------------|------------|
| 👁️ Ver empleados | Consultar listado de empleados | `ver_empleados` |
| 🕐 Ver fichajes del equipo | Consultar fichajes de otros | `ver_fichajes_equipo` |
| 🔧 Cambiar roles | Modificar roles y permisos | `cambiar_roles` |
| ➕ Invitar trabajador | Añadir nuevos empleados | `invitar_trabajador` |
| ❌ Dar de baja | Desactivar empleados | `dar_baja` |

---

## 🎭 PLANTILLAS DE ROLES PREDEFINIDAS

### 1. COCINERO

```json
{
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
  "total": 7
}
```

**Justificación:** El cocinero solo necesita acceder, fichar y gestionar el estado de preparación de pedidos.

---

### 2. ENCARGADO

```json
{
  "rol": "encargado",
  "permisos_activos": [
    "acceso_app", "ver_perfil", "recibir_notificaciones",
    "fichar", "ver_horas", "ver_calendario", "ver_doc_laboral",
    "ver_pedidos", "crear_pedidos", "editar_pedidos", 
    "cambiar_estado_cocina", "cambiar_estado_reparto", 
    "ver_metodo_pago",
    "ver_tpv", "abrir_caja", "cerrar_caja", "arqueo", 
    "ver_ventas_tpv", "devoluciones",
    "ver_stock", "editar_stock", "ver_mermas",
    "ver_kpi_pv", "ver_escandallos",
    "ver_empleados", "ver_fichajes_equipo"
  ],
  "total": 25
}
```

**Justificación:** El encargado gestiona operaciones diarias: pedidos, TPV, stock básico y supervisión del equipo.

---

### 3. REPARTIDOR

```json
{
  "rol": "repartidor",
  "permisos_activos": [
    "acceso_app",
    "ver_perfil",
    "recibir_notificaciones",
    "fichar",
    "ver_horas",
    "ver_pedidos",
    "cambiar_estado_reparto"
  ],
  "total": 7
}
```

**Justificación:** El repartidor solo necesita ver pedidos pendientes y actualizar el estado de entrega.

---

### 4. CAJA / TPV

```json
{
  "rol": "caja_tpv",
  "permisos_activos": [
    "acceso_app", "ver_perfil", "recibir_notificaciones",
    "fichar", "ver_horas",
    "ver_pedidos", "ver_metodo_pago",
    "ver_tpv", "abrir_caja", "cerrar_caja", "arqueo", 
    "ver_ventas_tpv", "devoluciones"
  ],
  "total": 13
}
```

**Justificación:** El cajero gestiona ventas, cobros y arqueos, sin acceso a stock ni KPIs.

---

### 5. RESPONSABLE DE TIENDA

```json
{
  "rol": "responsable_tienda",
  "permisos_activos": [
    "acceso_app", "ver_perfil", "recibir_notificaciones",
    "fichar", "ver_horas", "ver_calendario", "ver_doc_laboral", 
    "subir_doc_otros",
    "ver_pedidos", "crear_pedidos", "editar_pedidos", 
    "cambiar_estado_cocina", "cambiar_estado_reparto", 
    "ver_metodo_pago", "ver_costes_pedido",
    "ver_tpv", "abrir_caja", "cerrar_caja", "arqueo", 
    "ver_ventas_tpv", "devoluciones",
    "ver_stock", "editar_stock", "crear_pedido_proveedor", 
    "ver_mermas", "aprobar_mermas", "ver_historial",
    "ver_kpi_pv", "ver_kpi_marca", "ver_escandallos", 
    "ver_facturacion",
    "ver_empleados", "ver_fichajes_equipo", "invitar_trabajador"
  ],
  "total": 33
}
```

**Justificación:** El responsable tiene control total de la tienda excepto EBITDA (reservado para gerente) y dar de baja (solo gerente general).

---

## 📊 MODAL RESUMEN DE PERMISOS

### Estructura visual:

```
┌─────────────────────────────────────────────────────────────┐
│ 👁️ Resumen de permisos del trabajador                       │
│    Carlos Méndez García · Encargado                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│ │     25     │  │     12     │  │    68%     │            │
│ │  Permisos  │  │  Permisos  │  │ Cobertura  │            │
│ │  activos   │  │ inactivos  │  │            │            │
│ └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ 🛡️ Acceso al sistema                                        │
│    3 de 3 activos                                           │
│                                                              │
│    ✓ Acceso a la app                                        │
│      Puede iniciar sesión en la aplicación                  │
│    ✓ Ver perfil                                             │
│      Puede ver su perfil personal                           │
│    ✓ Recibir notificaciones                                 │
│      Recibe notificaciones push y email                     │
│                                                              │
│ 🕐 Fichajes y RRHH                                          │
│    4 de 5 activos                                           │
│                                                              │
│    ✓ Fichar entrada/salida                                  │
│      Puede fichar su jornada laboral                        │
│    ✓ Ver horas trabajadas                                   │
│      Consultar registro de horas                            │
│    ✓ Ver calendario laboral                                 │
│      Consultar calendario y turnos                          │
│    ✓ Ver documentación laboral                              │
│      Acceder a nóminas, contratos e IRPF                    │
│    ✗ Subir documentos "Otros"                               │
│                                                              │
│ 🛒 Gestión de pedidos                                       │
│    5 de 7 activos                                           │
│    ...                                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                              [Cerrar]        │
└─────────────────────────────────────────────────────────────┘
```

### Elementos del resumen:

1. **Header:** Nombre empleado + rol
2. **Métricas:** 3 tarjetas con:
   - Permisos activos (verde)
   - Permisos inactivos (gris)
   - Cobertura en % (morado)
3. **Lista por bloques:**
   - Icono + Título bloque
   - Contador "X de Y activos"
   - Lista de permisos con ✓ (activos en detalle) o ✗ (inactivos sin detalle)
4. **Footer:** Botón "Cerrar" o "Aceptar"

---

## 🔄 FLUJO DE DATOS (Make.com / Backend)

### 1. Cargar permisos actuales del empleado

**Endpoint:** `GET /api/empleados/{empleado_id}/permisos`

```json
Response:
{
  "empleado_id": "EMP-001",
  "nombre": "Carlos Méndez García",
  "rol": "encargado",
  "permisos": {
    "acceso_app": true,
    "ver_perfil": true,
    "fichar": true,
    "ver_pedidos": true,
    "crear_pedidos": false,
    "abrir_caja": true,
    ...
  }
}
```

---

### 2. Guardar cambios de permisos

**Endpoint:** `PUT /api/empleados/{empleado_id}/permisos`

```json
Request:
{
  "rol": "encargado",
  "permisos_activos": [
    "acceso_app",
    "ver_perfil",
    "recibir_notificaciones",
    "fichar",
    "ver_horas",
    "ver_pedidos",
    "crear_pedidos",
    "editar_pedidos",
    ...
  ],
  "modificado_por": "GERENTE-001"
}

Response:
{
  "success": true,
  "empleado_id": "EMP-001",
  "permisos_actualizados": 25,
  "mensaje": "Permisos actualizados correctamente"
}
```

---

### 3. Verificar permiso en runtime

**Middleware de seguridad:**

```javascript
// Pseudocódigo backend
async function verificarPermiso(req, res, next) {
  const usuario_id = req.user.id;
  const permiso_requerido = req.endpoint_permiso; // ej: 'crear_pedidos'
  
  const permisos = await db.query(`
    SELECT permisos->>$2 AS tiene_permiso
    FROM empleado_permisos
    WHERE empleado_id = $1
  `, [usuario_id, permiso_requerido]);
  
  if (permisos.tiene_permiso === 'true') {
    next(); // Permitir acceso
  } else {
    res.status(403).json({ error: 'No tienes permiso para esta acción' });
  }
}

// Aplicar en rutas
app.post('/api/pedidos', verificarPermiso('crear_pedidos'), crearPedido);
app.put('/api/stock', verificarPermiso('editar_stock'), editarStock);
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla: `empleado_permisos`

```sql
CREATE TABLE empleado_permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID NOT NULL REFERENCES usuario(usuario_id),
  empresa_id UUID NOT NULL REFERENCES empresa(empresa_id),
  marca_id UUID REFERENCES marca(marca_id),
  punto_venta_id UUID REFERENCES punto_venta(punto_venta_id),
  
  -- Rol funcional
  rol VARCHAR(100) NOT NULL CHECK (rol IN (
    'cocinero', 'encargado', 'repartidor', 'caja_tpv', 
    'responsable_tienda', 'personalizado'
  )),
  
  -- Permisos (JSONB para flexibilidad)
  permisos JSONB NOT NULL DEFAULT '{}',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES usuario(usuario_id),
  
  -- Índices
  UNIQUE (empleado_id, empresa_id),
  INDEX idx_empleado (empleado_id),
  INDEX idx_rol (rol),
  INDEX idx_empresa (empresa_id)
);
```

**Ejemplo de registro:**

```json
{
  "empleado_id": "EMP-001",
  "empresa_id": "EMP-001",
  "rol": "encargado",
  "permisos": {
    "acceso_app": true,
    "ver_perfil": true,
    "recibir_notificaciones": true,
    "fichar": true,
    "ver_horas": true,
    "ver_calendario": true,
    "ver_doc_laboral": true,
    "subir_doc_otros": false,
    "ver_pedidos": true,
    "crear_pedidos": true,
    "editar_pedidos": true,
    "cambiar_estado_cocina": true,
    "cambiar_estado_reparto": true,
    "ver_metodo_pago": true,
    "ver_costes_pedido": false,
    "ver_tpv": true,
    "abrir_caja": true,
    "cerrar_caja": true,
    "arqueo": true,
    "ver_ventas_tpv": true,
    "devoluciones": true,
    "ver_stock": true,
    "editar_stock": true,
    "crear_pedido_proveedor": false,
    "ver_mermas": true,
    "aprobar_mermas": false,
    "ver_historial": false,
    "ver_kpi_pv": true,
    "ver_kpi_marca": false,
    "ver_escandallos": true,
    "ver_facturacion": false,
    "ver_ebitda": false,
    "ver_empleados": true,
    "ver_fichajes_equipo": true,
    "cambiar_roles": false,
    "invitar_trabajador": false,
    "dar_baja": false
  },
  "updated_by": "GERENTE-001",
  "updated_at": "2025-11-26T18:00:00Z"
}
```

---

### Tabla: `auditoria_permisos` (opcional pero recomendada)

```sql
CREATE TABLE auditoria_permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID NOT NULL,
  modificado_por UUID NOT NULL REFERENCES usuario(usuario_id),
  
  -- Cambios
  rol_anterior VARCHAR(100),
  rol_nuevo VARCHAR(100),
  permisos_añadidos TEXT[],
  permisos_eliminados TEXT[],
  
  -- Contexto
  accion VARCHAR(50) NOT NULL, -- 'cambio_rol', 'cambio_permiso', 'aplicar_plantilla'
  ip_origen INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_empleado (empleado_id),
  INDEX idx_modificado_por (modificado_por),
  INDEX idx_fecha (created_at)
);
```

**Ejemplo de log:**

```json
{
  "empleado_id": "EMP-001",
  "modificado_por": "GERENTE-001",
  "rol_anterior": "cocinero",
  "rol_nuevo": "encargado",
  "permisos_añadidos": [
    "crear_pedidos",
    "editar_pedidos",
    "abrir_caja",
    "cerrar_caja",
    "ver_kpi_pv"
  ],
  "permisos_eliminados": [],
  "accion": "cambio_rol",
  "ip_origen": "192.168.1.100",
  "created_at": "2025-11-26T18:00:00Z"
}
```

---

## 📈 CASOS DE USO

### Caso 1: Promoción de Cocinero a Encargado

**Escenario:** Carlos era cocinero y ahora es promovido a encargado.

1. Gerente abre modal de permisos de Carlos
2. Selecciona rol: "Encargado"
3. Sistema aplica automáticamente plantilla de encargado (25 permisos)
4. Gerente revisa y decide QUITAR el permiso "ver_costes_pedido" (sensible)
5. Clic en "Guardar cambios"
6. Sistema registra en log de auditoría:
   ```json
   {
     "accion": "cambio_rol",
     "rol_anterior": "cocinero",
     "rol_nuevo": "encargado",
     "permisos_añadidos": [18 permisos nuevos],
     "permisos_eliminados": ["ver_costes_pedido"]
   }
   ```
7. Carlos recibe notificación: "Tus permisos han sido actualizados"

---

### Caso 2: Rol Personalizado para Empleado Temporal

**Escenario:** Se contrata un repartidor temporal que también ayuda en cocina.

1. Gerente crea empleado y abre modal de permisos
2. Selecciona rol: "Rol personalizado"
3. Activa manualmente:
   - ✅ Bloque "Acceso al sistema" (completo)
   - ✅ "Fichar entrada/salida"
   - ✅ "Ver pedidos"
   - ✅ "Cambiar estado cocina" (ayuda en cocina)
   - ✅ "Cambiar estado reparto" (repartidor)
4. Desactiva todo lo demás
5. Clic en "Ver resumen de permisos" → Confirma que tiene solo 7 permisos
6. Guardar cambios

---

### Caso 3: Revisión de Permisos de Equipo

**Escenario:** El gerente quiere auditar qué permisos tienen todos sus encargados.

1. Gerente abre lista de empleados
2. Filtra por rol: "Encargado"
3. Para cada empleado:
   - Clic en "Permisos"
   - Clic en "Ver resumen de permisos"
   - Revisa lista completa
   - Si detecta anomalías → Ajusta manualmente
4. Exporta reporte (futuro: botón "Exportar permisos de equipo")

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend (Completado):
- [x] Componente `ModalPermisosEmpleado.tsx`
- [x] Selector de rol con 6 opciones
- [x] Plantillas de roles predefinidas
- [x] 7 bloques expandibles (Accordion)
- [x] Toggles individuales por permiso
- [x] Toggle general por bloque
- [x] Aplicación automática de plantilla al cambiar rol
- [x] Modal resumen de permisos
- [x] Métricas visuales (activos/inactivos/cobertura)
- [x] Lista completa con iconos ✓/✗
- [x] Bloque "Zona de peligro" sin cambios
- [x] Documentación completa

### Backend (Pendiente):
- [ ] Tabla `empleado_permisos` en PostgreSQL
- [ ] Tabla `auditoria_permisos` (opcional)
- [ ] Endpoint GET `/api/empleados/{id}/permisos`
- [ ] Endpoint PUT `/api/empleados/{id}/permisos`
- [ ] Middleware de verificación de permisos
- [ ] Sistema de logs de auditoría
- [ ] Notificaciones al empleado cuando cambian permisos

### Testing (Pendiente):
- [ ] Test unitarios: cambio de rol
- [ ] Test integración: guardar permisos
- [ ] Test seguridad: verificar permisos en endpoints
- [ ] Test UI: expansión de bloques
- [ ] Test UI: modal resumen

---

## 🎯 PRÓXIMOS PASOS

1. **Crear tablas en PostgreSQL**
2. **Implementar endpoints de permisos**
3. **Integrar middleware de seguridad**
4. **Testing con usuarios reales**
5. **Exportar reportes de permisos** (Excel/PDF)
6. **Notificaciones automáticas** cuando cambian permisos
7. **Dashboard de auditoría** para gerente general

---

## 📚 NOTAS TÉCNICAS

### Diferencia entre ROL y PERMISOS

- **ROL:** Etiqueta funcional (Cocinero, Encargado, etc.)
  - Útil para reportes y organización
  - Aplica plantilla inicial de permisos
  - No determina acceso real (lo hacen los permisos)

- **PERMISOS:** Configuración granular real
  - Cada permiso controla un endpoint/funcionalidad específica
  - Se validan en el backend en cada request
  - Se pueden personalizar sobre cualquier rol

### Ejemplo de validación en frontend:

```typescript
// Hook personalizado para verificar permisos
function usePermiso(permisoRequerido: string) {
  const { usuario } = useAuth();
  return usuario?.permisos[permisoRequerido] === true;
}

// Uso en componente
function BotonCrearPedido() {
  const puedeCrearPedidos = usePermiso('crear_pedidos');
  
  if (!puedeCrearPedidos) return null;
  
  return <Button onClick={crearPedido}>Crear pedido</Button>;
}
```

---

**FIN DE LA DOCUMENTACIÓN**

✅ Sistema de permisos rediseñado completamente  
✅ Modal con selector de rol y bloques expandibles  
✅ Resumen visual de permisos  
✅ Plantillas predefinidas por rol  
✅ Documentación técnica completa  

🚀 Listo para integración con backend y Make.com!
