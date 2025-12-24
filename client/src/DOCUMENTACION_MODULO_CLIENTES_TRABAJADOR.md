# 📄 DOCUMENTACIÓN TÉCNICA - MÓDULO CLIENTES/TRABAJADOR

**Proyecto:** Udar Edge - Sistema SaaS Multiempresa  
**Módulo:** Gestión de Clientes (Perfil Trabajador/Colaborador)  
**Versión:** 2.0 ACTUALIZADA  
**Fecha:** 26 Noviembre 2024

---

## 📋 ÍNDICE

1. [Cambios Implementados](#1-cambios-implementados)
2. [Nomenclatura de Pedidos](#2-nomenclatura-de-pedidos)
3. [Estructura de Datos](#3-estructura-de-datos)
4. [Estados y Flujo](#4-estados-y-flujo)
5. [Vistas: Tabla y Tarjetas](#5-vistas-tabla-y-tarjetas)
6. [Modal Detalle con Circuito](#6-modal-detalle-con-circuito)
7. [Métodos de Pago](#7-métodos-de-pago)
8. [Arquitectura Multiempresa](#8-arquitectura-multiempresa)
9. [APIs y Endpoints](#9-apis-y-endpoints)
10. [Permisos por Rol](#10-permisos-por-rol)

---

## 1. CAMBIOS IMPLEMENTADOS

### ✅ Componentes Creados

1. **`/components/trabajador/PedidosTrabajadorActualizado.tsx`**
   - Vista completa con tabla y tarjetas
   - Filtros por estado, búsqueda
   - Acciones según estado del pedido
   - Integración con AMARRE GLOBAL

2. **`/components/trabajador/ModalDetallePedido.tsx`**
   - Modal completo con 3 secciones principales
   - Circuito del pedido (timeline visual)
   - Lista de productos
   - Acciones según estado

### ✅ Funcionalidades Nuevas

- ✅ Nomenclatura automática de IDs: `PD-TIA-0001`, `PD-BDN-0002`
- ✅ Vista doble: Tabla ↔ Tarjetas (selector visual)
- ✅ 4 Estados del pedido (Pendiente, Listo, Enviado, Entregado)
- ✅ Métodos de pago con badges (TPV, Online, Efectivo)
- ✅ Badges de Marca y Punto de Venta en cada pedido
- ✅ Circuito completo del pedido (timeline)
- ✅ Acciones contextuales según estado
- ✅ Tracking para pedidos de envío
- ✅ Colores diferenciados por estado en tarjetas
- ✅ Arquitectura multiempresa completa

---

## 2. NOMENCLATURA DE PEDIDOS

### Formato Obligatorio

```
PD-{CÓDIGO_PUNTO_VENTA}-{SECUENCIA}
```

**Ejemplos:**
- TIANA → `PD-TIA-0001`, `PD-TIA-0002`, `PD-TIA-0003`
- BADALONA → `PD-BDN-0001`, `PD-BDN-0002`, `PD-BDN-0003`

### Reglas de Generación

1. **Prefix:** `PD` (Pedido)
2. **Código Punto Venta:** 3 letras (primeras 3 del nombre)
   - Tiana → TIA
   - Badalona → BDN
   - Barcelona → BAR
3. **Secuencia:** 4 dígitos, incremental por punto de venta

### Implementación (Backend)

```typescript
// Función para generar ID de pedido
function generarPedidoId(codigoPuntoVenta: string): string {
  // Obtener último número de secuencia para este punto de venta
  const ultimaSecuencia = await obtenerUltimaSecuenciaPuntoVenta(codigoPuntoVenta);
  const nuevaSecuencia = (ultimaSecuencia + 1).toString().padStart(4, '0');
  
  return `PD-${codigoPuntoVenta}-${nuevaSecuencia}`;
}

// Ejemplos de salida:
// generarPedidoId('TIA') → 'PD-TIA-0001'
// generarPedidoId('BDN') → 'PD-BDN-0001'
```

---

## 3. ESTRUCTURA DE DATOS

### 3.1. PEDIDO (Entidad Principal)

**Tabla BBDD:** `pedidos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `pedido_id` | VARCHAR(50) | ✅ | "PD-TIA-0001" | PK - ID con nomenclatura |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa (OBLIGATORIO) |
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | FK - Marca (OBLIGATORIO) |
| `punto_venta_id` | VARCHAR(50) | ✅ | "PDV-001" | FK - Punto Venta (OBLIGATORIO) |
| `cliente_id` | VARCHAR(50) | ❌ | "USR-005" | FK - Usuario cliente |
| `nombre_cliente` | VARCHAR(255) | ✅ | "María García López" | Nombre del cliente |
| `telefono` | VARCHAR(20) | ✅ | "+34 678 123 456" | Teléfono contacto |
| `metodo_pago` | ENUM | ✅ | "TPV" | TPV / Online / Efectivo |
| `tipo_entrega` | ENUM | ✅ | "Recogida" | Recogida / Envío |
| `direccion_entrega` | TEXT | ❌ | "Calle Girona 12..." | Solo si tipo_entrega = Envío |
| `estado_actual` | ENUM | ✅ | "Pendiente" | Ver estados abajo |
| `fecha_creacion` | TIMESTAMP | ✅ | "2024-11-26 14:30" | Fecha/hora creación |
| `total` | DECIMAL(10,2) | ✅ | 25.40 | Total del pedido |
| `repartidor_id` | VARCHAR(50) | ❌ | "TRAB-102" | FK - Trabajador repartidor |
| `tracking_url` | TEXT | ❌ | "https://..." | URL de tracking |
| `observaciones` | TEXT | ❌ | "Sin cebolla" | Notas del cliente |

**Valores `estado_actual`:**
- `Pendiente` - Recién recibido
- `Listo para recoger` - Preparado
- `Enviado` - En camino (solo si tipo_entrega = Envío)
- `Entregado` - Completado

**Valores `metodo_pago`:**
- `TPV` - TPV UDAR (tarjeta en local)
- `Online` - Pago online (tarjeta web/app)
- `Efectivo` - Pago en efectivo

**Valores `tipo_entrega`:**
- `Recogida` - Cliente recoge en local
- `Envío` - Delivery a domicilio

---

### 3.2. LINEA_PEDIDO

**Tabla BBDD:** `lineas_pedido`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `linea_pedido_id` | VARCHAR(50) | ✅ | "LP-001" | PK |
| `pedido_id` | VARCHAR(50) | ✅ | "PD-TIA-0001" | FK - Pedido |
| `producto_id` | VARCHAR(50) | ✅ | "PRD-001" | FK - Producto |
| `nombre_producto` | VARCHAR(255) | ✅ | "Pizza Margarita" | Nombre (redundante para histórico) |
| `cantidad` | INT | ✅ | 2 | Cantidad |
| `precio_unitario` | DECIMAL(10,2) | ✅ | 10.50 | Precio unitario sin IVA |
| `total_linea` | DECIMAL(10,2) | ✅ | 21.00 | cantidad × precio_unitario |
| `costo_variable_linea` | DECIMAL(10,2) | ✅ | 8.40 | Coste variable (para gerentes) |

**Cálculo:**
```javascript
total_linea = cantidad × precio_unitario
```

---

### 3.3. CIRCUITO_PEDIDO (Histórico de Estados)

**Tabla BBDD:** `circuito_pedido`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `circuito_id` | VARCHAR(50) | ✅ | "CIR-001" | PK |
| `pedido_id` | VARCHAR(50) | ✅ | "PD-TIA-0001" | FK - Pedido |
| `estado` | VARCHAR(100) | ✅ | "Listo para recoger" | Estado alcanzado |
| `fecha_hora` | TIMESTAMP | ✅ | "2024-11-26 14:45" | Cuándo se alcanzó |
| `trabajador_id` | VARCHAR(50) | ❌ | "TRAB-102" | FK - Quién cambió el estado |
| `nombre_trabajador` | VARCHAR(255) | ❌ | "Juan Pérez" | Nombre (redundante) |
| `nombre_repartidor` | VARCHAR(255) | ❌ | "Carlos García" | Si aplica (estado Enviado) |

**Estados del circuito:**
1. **Pedido recibido** - Creación del pedido
2. **Preparación** - En cocina/preparación
3. **Listo para recoger** - Pedido terminado
4. **Enviado** - Repartidor en camino (solo Envío)
5. **Entregado** - Completado

**Uso:**
```sql
-- Obtener circuito completo de un pedido
SELECT * FROM circuito_pedido 
WHERE pedido_id = 'PD-TIA-0001' 
ORDER BY fecha_hora ASC;
```

---

## 4. ESTADOS Y FLUJO

### Diagrama de Estados

```
┌─────────────┐
│  Pendiente  │ ───────┐
└─────────────┘        │
                       │ Marcar como "Listo para recoger"
                       ▼
              ┌─────────────────────┐
              │ Listo para recoger  │
              └─────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │                           │
         │ (Recogida)                │ (Envío)
         │                           │
         ▼                           ▼
┌─────────────┐           ┌─────────────┐
│  Entregado  │           │   Enviado   │
└─────────────┘           └─────────────┘
                                  │
                                  │ Marcar como "Entregado"
                                  ▼
                          ┌─────────────┐
                          │  Entregado  │
                          └─────────────┘
```

### Acciones por Estado

| Estado Actual | Acciones Disponibles | Botones Visibles |
|---------------|---------------------|------------------|
| **Pendiente** | - Marcar como "Listo para recoger"<br>- Ver pedido | • Marcar Listo<br>• Ver |
| **Listo para recoger** (Recogida) | - Marcar como "Entregado"<br>- Ver pedido | • Entregado<br>• Ver |
| **Listo para recoger** (Envío) | - Marcar como "Enviado"<br>- Marcar como "Entregado"<br>- Ver pedido | • Marcar Enviado<br>• Entregado<br>• Ver |
| **Enviado** | - Marcar como "Entregado"<br>- Ver ubicación (si tracking_url)<br>- Ver pedido | • Entregado<br>• Ubicación<br>• Ver |
| **Entregado** | - Ver pedido | • Ver |

### Implementación de Cambio de Estado

```typescript
// Función para cambiar estado (a implementar por el programador)
async function cambiarEstadoPedido(
  pedidoId: string, 
  nuevoEstado: string, 
  trabajadorId: string
) {
  // 1. Actualizar estado en tabla pedidos
  await db.query(`
    UPDATE pedidos 
    SET estado_actual = $1, updated_at = NOW()
    WHERE pedido_id = $2
  `, [nuevoEstado, pedidoId]);

  // 2. Insertar en histórico (circuito_pedido)
  await db.query(`
    INSERT INTO circuito_pedido (
      circuito_id, pedido_id, estado, fecha_hora, trabajador_id
    ) VALUES (
      $1, $2, $3, NOW(), $4
    )
  `, [generarCircuitoId(), pedidoId, nuevoEstado, trabajadorId]);

  // 3. Enviar notificación (opcional)
  if (nuevoEstado === 'Listo para recoger') {
    await enviarNotificacionCliente(pedidoId, 'Tu pedido está listo');
  }
  
  if (nuevoEstado === 'Enviado') {
    await enviarNotificacionCliente(pedidoId, 'Tu pedido está en camino');
  }

  return { success: true };
}
```

---

## 5. VISTAS: TABLA Y TARJETAS

### 5.1. Selector de Vista

**UI:**
```
Vista: [◻ Tabla] [◼ Tarjetas]
```

**Ubicación:** Top-right del CardHeader

**Comportamiento:**
- Click en "Tabla" → Muestra vista tabla
- Click en "Tarjetas" → Muestra vista tarjetas
- Estado se guarda en localStorage (opcional)

---

### 5.2. Vista TABLA

**Columnas:**
1. ID Pedido (PD-TIA-0001)
2. Marca / Punto Venta (badges)
3. Cliente (nombre)
4. Teléfono
5. Productos (resumen + "+X más")
6. Método Pago (badge)
7. Total (€)
8. Estado (badge con color)
9. Acciones (botones según estado)

**Características:**
- Scroll horizontal en móvil
- Hover effect en filas
- Ordenable por columnas (TODO)

---

### 5.3. Vista TARJETAS

**Estructura de Tarjeta:**
```
┌────────────────────────────────┐
│ PD-TIA-0001        [Pendiente] │ ← Header con badge estado
│ María García                   │
├────────────────────────────────┤
│ [PIZZAS] [TIANA]               │ ← Badges marca/punto venta
│ 📞 +34 678 123 456             │ ← Teléfono
│                                │
│ Productos:                     │
│ 2x Pizza Margarita     21.00€  │
│ 2x Coca-Cola 33cl       4.40€  │
│ +1 más                         │
├────────────────────────────────┤
│ 25.40€         [TPV UDAR]      │ ← Total y método pago
├────────────────────────────────┤
│ [Marcar Listo]    [Ver]        │ ← Botones acción
└────────────────────────────────┘
```

**Colores según Estado:**
- **Pendiente:** Border-left amarillo, bg-yellow-50
- **Listo para recoger:** Border-left azul, bg-blue-50
- **Enviado:** Border-left naranja, bg-orange-50
- **Entregado:** Border-left verde, bg-green-50

**Grid Responsive:**
- Desktop (lg): 3 columnas
- Tablet (md): 2 columnas
- Móvil (sm): 1 columna

---

## 6. MODAL DETALLE CON CIRCUITO

### Estructura del Modal

```
┌─────────────────────────────────────────────┐
│ 📦 Detalle del Pedido                  [X] │
├─────────────────────────────────────────────┤
│                                             │
│ 1. ENCABEZADO                               │
│    ┌─────────────────────────────────────┐ │
│    │ ID: PD-TIA-0001  [PIZZAS] [TIANA]  │ │
│    │ Cliente: María García               │ │
│    │ Teléfono: +34 678 123 456           │ │
│    │ Método Pago: [TPV UDAR]             │ │
│    │ Tipo Entrega: [Recogida]            │ │
│    │ Observaciones: Sin cebolla          │ │
│    └─────────────────────────────────────┘ │
│                                             │
│ 2. CIRCUITO DEL PEDIDO (Timeline)          │
│    ┌─────────────────────────────────────┐ │
│    │ ✅ Pedido recibido                  │ │
│    │ │  26/11/2024 14:30                 │ │
│    │ ▼                                   │ │
│    │ 👨‍🍳 Preparación                     │ │
│    │ │  Por: Juan Pérez                  │ │
│    │ │  26/11/2024 14:35                 │ │
│    │ ▼                                   │ │
│    │ ✅ Listo para recoger               │ │
│    │    Por: Juan Pérez                  │ │
│    │    26/11/2024 14:45                 │ │
│    └─────────────────────────────────────┘ │
│                                             │
│ 3. PRODUCTOS                                │
│    ┌─────────────────────────────────────┐ │
│    │ Producto         Cant  P.Unit Total │ │
│    ├─────────────────────────────────────┤ │
│    │ Pizza Margarita   2   10.50  21.00 │ │
│    │ Coca-Cola 33cl    2    2.20   4.40 │ │
│    ├─────────────────────────────────────┤ │
│    │ TOTAL                        25.40€ │ │
│    └─────────────────────────────────────┘ │
│                                             │
│ 4. ACCIONES                                 │
│    [Marcar como Listo]      [Ver Ubicación]│
│                                             │
├─────────────────────────────────────────────┤
│                          [Cerrar]           │
└─────────────────────────────────────────────┘
```

### Secciones del Modal

#### Sección 1: Encabezado
- ID del pedido
- Badges de marca y punto de venta
- Cliente y teléfono
- Método de pago (badge)
- Tipo de entrega (badge)
- Dirección de envío (si aplica)
- Observaciones (si existen)

#### Sección 2: Circuito del Pedido
- Timeline visual con iconos
- Cada paso muestra:
  - Estado
  - Fecha/hora
  - Trabajador/Repartidor (si aplica)
- Línea vertical conectando pasos
- Colores diferenciados por tipo de paso

#### Sección 3: Productos
- Tabla con todos los productos
- Columnas: Nombre, Cantidad, Precio Unit., Total
- Fila de total al final (destacada)

#### Sección 4: Acciones
- Botones contextuales según estado actual
- Mismo comportamiento que en tabla/tarjetas
- Se ejecuta la acción y cierra el modal

---

## 7. MÉTODOS DE PAGO

### Tipos de Pago

| Método | Icono | Color | Descripción |
|--------|-------|-------|-------------|
| **TPV UDAR** | 💳 | Púrpura | TPV físico en el local |
| **Online** | 🌐 | Azul | Pago online (web/app) |
| **Efectivo** | 💵 | Verde | Pago en efectivo |

### Badges de Método de Pago

```jsx
// TPV UDAR
<Badge className="bg-purple-50 text-purple-700 border-purple-200">
  <CreditCard className="w-3 h-3 mr-1" />
  TPV UDAR
</Badge>

// Online
<Badge className="bg-blue-50 text-blue-700 border-blue-200">
  <Globe className="w-3 h-3 mr-1" />
  Online
</Badge>

// Efectivo
<Badge className="bg-green-50 text-green-700 border-green-200">
  <Banknote className="w-3 h-3 mr-1" />
  Efectivo
</Badge>
```

### Ubicación

- **Vista Tabla:** Columna "Método Pago"
- **Vista Tarjetas:** Junto al total (bottom)
- **Modal Detalle:** En el encabezado

---

## 8. ARQUITECTURA MULTIEMPRESA

### Campos Obligatorios en Pedido

```typescript
interface Pedido {
  empresaId: string;      // EMP-001 (OBLIGATORIO)
  marcaId: string;        // MRC-001 (OBLIGATORIO)
  puntoVentaId: string;   // PDV-001 (OBLIGATORIO)
  // ... resto de campos
}
```

### Badges Marca y Punto de Venta

**Ubicación:**
- Vista Tabla: Columna específica
- Vista Tarjetas: Debajo del header
- Modal Detalle: Encabezado

**Diseño:**
```jsx
// Marca
<Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
  <Store className="w-3 h-3 mr-1" />
  PIZZAS
</Badge>

// Punto de Venta
<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
  <MapPin className="w-3 h-3 mr-1" />
  TIANA
</Badge>
```

### Filtros Multiempresa (Opcional - No implementado aún)

```typescript
// Filtros adicionales para gerentes
const [filtroMarca, setFiltroMarca] = useState<string>('todas');
const [filtroPuntoVenta, setFiltroPuntoVenta] = useState<string>('todos');

// Aplicar filtros
const pedidosFiltrados = pedidos.filter(pedido => {
  const matchMarca = filtroMarca === 'todas' || pedido.marcaId === filtroMarca;
  const matchPuntoVenta = filtroPuntoVenta === 'todos' || pedido.puntoVentaId === filtroPuntoVenta;
  // ... resto de filtros
});
```

---

## 9. APIS Y ENDPOINTS

### 9.1. Obtener Pedidos

**Endpoint:** `GET /api/pedidos`

**Query Params:**
- `empresa_id` - Filtrar por empresa (obligatorio según rol)
- `marca_id` - Filtrar por marca (opcional)
- `punto_venta_id` - Filtrar por punto de venta (opcional)
- `estado` - Filtrar por estado (opcional)
- `fecha_desde` - Fecha inicio (opcional)
- `fecha_hasta` - Fecha fin (opcional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "pedidoId": "PD-TIA-0001",
      "empresaId": "EMP-001",
      "marcaId": "MRC-001",
      "puntoVentaId": "PDV-001",
      "nombreCliente": "María García",
      "telefono": "+34 678 123 456",
      "metodoPago": "TPV",
      "tipoEntrega": "Recogida",
      "estadoActual": "Pendiente",
      "fechaCreacion": "2024-11-26T14:30:00Z",
      "total": 25.40,
      "productos": [...],
      "nombreMarca": "PIZZAS",
      "nombrePuntoVenta": "TIANA"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

---

### 9.2. Cambiar Estado Pedido

**Endpoint:** `PUT /api/pedidos/{pedidoId}/estado`

**Request Body:**
```json
{
  "estadoNuevo": "Listo para recoger",
  "trabajadorId": "TRAB-102",
  "observaciones": "Pedido listo"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Estado actualizado correctamente",
  "data": {
    "pedidoId": "PD-TIA-0001",
    "estadoAnterior": "Pendiente",
    "estadoNuevo": "Listo para recoger",
    "fechaHora": "2024-11-26T14:45:00Z"
  }
}
```

**Acciones del Backend:**
1. Validar estado válido
2. Actualizar `pedidos.estado_actual`
3. Insertar registro en `circuito_pedido`
4. Enviar notificación al cliente (opcional)
5. Retornar confirmación

---

### 9.3. Obtener Circuito del Pedido

**Endpoint:** `GET /api/pedidos/{pedidoId}/circuito`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "circuitoId": "CIR-001",
      "estado": "Pedido recibido",
      "fechaHora": "2024-11-26T14:30:00Z",
      "trabajadorId": "TRAB-001",
      "nombreTrabajador": "Sistema"
    },
    {
      "circuitoId": "CIR-002",
      "estado": "Preparación",
      "fechaHora": "2024-11-26T14:35:00Z",
      "trabajadorId": "TRAB-102",
      "nombreTrabajador": "Juan Pérez"
    },
    {
      "circuitoId": "CIR-003",
      "estado": "Listo para recoger",
      "fechaHora": "2024-11-26T14:45:00Z",
      "trabajadorId": "TRAB-102",
      "nombreTrabajador": "Juan Pérez"
    }
  ]
}
```

---

## 10. PERMISOS POR ROL

### Permisos del Trabajador

✅ **Puede ver:**
- Pedidos de su(s) punto(s) de venta asignado(s)
- Estados de los pedidos
- Productos del pedido
- Datos del cliente (nombre, teléfono)
- Método de pago
- Circuito del pedido

❌ **NO puede ver:**
- Costes variables
- Escandallos
- Márgenes de ganancia
- Datos de otros puntos de venta no asignados

✅ **Puede hacer:**
- Cambiar estado de pedidos
- Ver detalle del pedido
- Ver ubicación de repartidor (si tracking disponible)
- Buscar y filtrar pedidos

❌ **NO puede hacer:**
- Eliminar pedidos
- Modificar precios
- Ver reportes financieros
- Acceder a configuración de productos

### Implementación en Backend

```typescript
// Middleware de permisos
async function validarPermisosPedidos(req, res, next) {
  const { usuario } = req;
  const { punto_venta_id } = req.query;

  if (usuario.rol === 'trabajador') {
    // Verificar que el trabajador está asignado a ese punto de venta
    const asignado = await verificarAsignacion(usuario.id, punto_venta_id);
    
    if (!asignado) {
      return res.status(403).json({
        error: 'No tienes permisos para ver pedidos de este punto de venta'
      });
    }
  }

  next();
}
```

---

## 11. CHECKLIST IMPLEMENTACIÓN

### ✅ Frontend (Completado)

- [x] Componente PedidosTrabajadorActualizado.tsx
- [x] Componente ModalDetallePedido.tsx
- [x] Nomenclatura de IDs correcta
- [x] Vista Tabla
- [x] Vista Tarjetas
- [x] Selector de vista
- [x] Filtros por estado
- [x] Búsqueda por ID/Cliente/Teléfono
- [x] Badges de Marca y Punto de Venta
- [x] Badges de Método de Pago
- [x] Acciones según estado
- [x] Modal con circuito completo
- [x] Tracking para envíos
- [x] Colores por estado en tarjetas
- [x] Interfaces TypeScript completas
- [x] console.log para debugging

### ❌ Backend (Pendiente Programador)

- [ ] Endpoint GET /api/pedidos
- [ ] Endpoint PUT /api/pedidos/{id}/estado
- [ ] Endpoint GET /api/pedidos/{id}/circuito
- [ ] Generación automática de PedidoId
- [ ] Middleware de permisos por rol
- [ ] Notificaciones a clientes (opcional)
- [ ] Validación de transiciones de estado
- [ ] Logs de auditoría

### ❌ Base de Datos (Pendiente Programador)

- [ ] Tabla `pedidos` con todos los campos
- [ ] Tabla `lineas_pedido`
- [ ] Tabla `circuito_pedido`
- [ ] Índices para búsquedas rápidas
- [ ] Triggers para actualizar updated_at
- [ ] Constraints de FK

---

## 12. EJEMPLOS DE USO

### Flujo Completo de un Pedido (Recogida)

```
1. Cliente hace pedido → Pedido creado con estado "Pendiente"
   PD-TIA-0001 | Pendiente

2. Trabajador lo ve en pantalla de Gestión Clientes
   Filtro: Pendiente → Muestra tarjeta amarilla

3. Trabajador prepara el pedido
   Click "Marcar Listo" → Estado cambia a "Listo para recoger"
   Tarjeta cambia a azul

4. Cliente llega a recoger
   Click "Entregado" → Estado cambia a "Entregado"
   Tarjeta cambia a verde

5. Pedido completado
   Se guarda en histórico con todos los timestamps
```

### Flujo Completo de un Pedido (Envío)

```
1. Cliente hace pedido con Envío → Pedido creado "Pendiente"
   PD-BDN-0001 | Pendiente | Envío

2. Trabajador prepara → "Listo para recoger"
   Tarjeta azul, botón "Marcar Enviado" visible

3. Repartidor recoge → "Enviado"
   Tarjeta naranja, botón "Ver Ubicación" visible
   Tracking activado

4. Repartidor entrega → "Entregado"
   Tarjeta verde, pedido completado
```

---

## 13. CONCLUSIÓN

### ✅ Estado Actual

El módulo de Gestión de Clientes para Trabajador está **100% preparado** para conectarse a la base de datos y APIs.

**Características implementadas:**
- ✅ Nomenclatura automática de IDs
- ✅ Vista doble (Tabla/Tarjetas)
- ✅ 4 Estados con flujo correcto
- ✅ Métodos de pago visuales
- ✅ Arquitectura multiempresa
- ✅ Modal con circuito completo
- ✅ Tracking para envíos
- ✅ Permisos por rol documentados

### 🔧 Próximos Pasos

1. **Programador Backend:**
   - Crear endpoints API (sección 9)
   - Implementar generación de IDs
   - Configurar permisos por rol

2. **Programador Frontend:**
   - Conectar componentes con APIs reales
   - Eliminar datos mock
   - Implementar filtros avanzados (opcional)
   - Añadir paginación (opcional)

3. **Testing:**
   - Probar flujos completos
   - Validar permisos por rol
   - Verificar responsive design

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 2.0  
**Estado:** ✅ Frontend 100% completo, Backend pendiente
