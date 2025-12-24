# 📦 DOCUMENTACIÓN TÉCNICA: Módulo Stock y Pedidos a Proveedores

## 🎯 Objetivo
Este documento describe la estructura de datos, eventos y conexiones necesarias para que el programador integre el modal de "Nuevo Pedido" del módulo Stock y Proveedores con la base de datos / API.

---

## 🗄️ ENTIDADES / TABLAS

### 1️⃣ ARTICULO
```sql
CREATE TABLE ARTICULO (
  id_articulo VARCHAR(50) PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(100),
  marca ENUM('pizzas', 'burguers', 'ambos') NOT NULL,
  pdv_id VARCHAR(50) NOT NULL,
  stock_actual INT DEFAULT 0,
  stock_optimo INT NOT NULL,
  stock_minimo INT NOT NULL,
  precio_coste DECIMAL(10,2) NOT NULL,
  proveedor_preferente_id VARCHAR(50),
  ultima_compra TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (proveedor_preferente_id) REFERENCES PROVEEDOR(id_proveedor)
);
```

**Índices recomendados**:
- INDEX idx_marca_pdv ON ARTICULO(marca, pdv_id)
- INDEX idx_stock_bajo ON ARTICULO(stock_actual, stock_optimo) WHERE stock_actual < stock_optimo
- INDEX idx_proveedor ON ARTICULO(proveedor_preferente_id)

---

### 2️⃣ PROVEEDOR
```sql
CREATE TABLE PROVEEDOR (
  id_proveedor VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  contacto VARCHAR(200),
  telefono VARCHAR(20),
  email VARCHAR(200),
  email_pedidos VARCHAR(200),
  whatsapp VARCHAR(20),
  enviar_email_automatico BOOLEAN DEFAULT FALSE,
  enviar_whatsapp_automatico BOOLEAN DEFAULT FALSE,
  invitacion_app_enviada BOOLEAN DEFAULT FALSE,
  direccion TEXT,
  dias_entrega INT DEFAULT 7,
  pedido_minimo DECIMAL(10,2),
  calificacion DECIMAL(3,2) DEFAULT 5.00,
  activo BOOLEAN DEFAULT TRUE
);
```

**Índices recomendados**:
- INDEX idx_activo ON PROVEEDOR(activo)
- INDEX idx_nombre ON PROVEEDOR(nombre)

**Nuevos campos para contacto**:
- `email_pedidos`: Email específico para recibir pedidos (puede ser diferente al email general)
- `whatsapp`: Número de WhatsApp con código de país (ej: +34600123456)
- `enviar_email_automatico`: Si está activo, enviar pedidos automáticamente por email
- `enviar_whatsapp_automatico`: Si está activo, notificar pedidos por WhatsApp
- `invitacion_app_enviada`: Si se ha enviado invitación para usar la app móvil

---

### 3️⃣ ARTICULO_PROVEEDOR (Relación Muchos a Muchos)
```sql
CREATE TABLE ARTICULO_PROVEEDOR (
  id VARCHAR(50) PRIMARY KEY,
  id_articulo VARCHAR(50) NOT NULL,
  id_proveedor VARCHAR(50) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  unidad_medida VARCHAR(50) DEFAULT 'unidad',
  tiempo_entrega_dias INT DEFAULT 7,
  preferente BOOLEAN DEFAULT FALSE,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_articulo) REFERENCES ARTICULO(id_articulo),
  FOREIGN KEY (id_proveedor) REFERENCES PROVEEDOR(id_proveedor),
  UNIQUE KEY unique_articulo_proveedor (id_articulo, id_proveedor)
);
```

**Índices recomendados**:
- INDEX idx_articulo ON ARTICULO_PROVEEDOR(id_articulo)
- INDEX idx_proveedor ON ARTICULO_PROVEEDOR(id_proveedor)
- INDEX idx_preferente ON ARTICULO_PROVEEDOR(preferente) WHERE preferente = TRUE

---

### 4️⃣ PEDIDO_PROVEEDOR
```sql
CREATE TABLE PEDIDO_PROVEEDOR (
  id_pedido VARCHAR(50) PRIMARY KEY,
  numero_pedido VARCHAR(50) UNIQUE NOT NULL,
  id_proveedor VARCHAR(50) NOT NULL,
  fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_esperada TIMESTAMP,
  fecha_recepcion TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  estado ENUM('borrador', 'enviado', 'confirmado', 'en_transito', 'recibido', 'cancelado') DEFAULT 'borrador',
  anotaciones TEXT,
  usuario_id VARCHAR(50),
  FOREIGN KEY (id_proveedor) REFERENCES PROVEEDOR(id_proveedor)
);
```

**Índices recomendados**:
- INDEX idx_proveedor_fecha ON PEDIDO_PROVEEDOR(id_proveedor, fecha_pedido)
- INDEX idx_estado ON PEDIDO_PROVEEDOR(estado)
- INDEX idx_numero ON PEDIDO_PROVEEDOR(numero_pedido)

---

### 5️⃣ LINEA_PEDIDO
```sql
CREATE TABLE LINEA_PEDIDO (
  id_linea VARCHAR(50) PRIMARY KEY,
  id_pedido VARCHAR(50) NOT NULL,
  id_articulo VARCHAR(50) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  cantidad_recibida INT DEFAULT 0,
  FOREIGN KEY (id_pedido) REFERENCES PEDIDO_PROVEEDOR(id_pedido),
  FOREIGN KEY (id_articulo) REFERENCES ARTICULO(id_articulo)
);
```

**Índices recomendados**:
- INDEX idx_pedido ON LINEA_PEDIDO(id_pedido)
- INDEX idx_articulo ON LINEA_PEDIDO(id_articulo)

---

## 📐 CONSULTAS SQL CLAVE

### 1. Obtener artículos con stock bajo (para modal de Nuevo Pedido)
```sql
SELECT 
  a.id_articulo,
  a.codigo,
  a.nombre AS articulo,
  a.marca,
  a.pdv_id,
  a.stock_actual,
  a.stock_optimo,
  (a.stock_optimo - a.stock_actual) AS propuesta,
  ap.precio_unitario AS precio,
  p.nombre AS proveedor,
  p.id_proveedor AS proveedorId
FROM ARTICULO a
LEFT JOIN ARTICULO_PROVEEDOR ap ON a.id_articulo = ap.id_articulo AND ap.preferente = TRUE
LEFT JOIN PROVEEDOR p ON ap.id_proveedor = p.id_proveedor
WHERE a.stock_actual < a.stock_optimo
  AND a.activo = TRUE
ORDER BY (a.stock_optimo - a.stock_actual) DESC;
```

### 2. Obtener proveedores disponibles
```sql
SELECT 
  id_proveedor AS id,
  nombre
FROM PROVEEDOR
WHERE activo = TRUE
ORDER BY nombre ASC;
```

### 3. Obtener precio de artículo para un proveedor específico
```sql
SELECT 
  ap.precio_unitario,
  ap.tiempo_entrega_dias
FROM ARTICULO_PROVEEDOR ap
WHERE ap.id_articulo = ? 
  AND ap.id_proveedor = ?;
```

### 4. Crear pedido completo (transacción)
```sql
-- Paso 1: Crear cabecera del pedido
INSERT INTO PEDIDO_PROVEEDOR (
  id_pedido, 
  numero_pedido, 
  id_proveedor, 
  fecha_pedido, 
  total, 
  estado, 
  anotaciones, 
  usuario_id
) VALUES (?, ?, ?, NOW(), ?, 'enviado', ?, ?);

-- Paso 2: Insertar líneas del pedido
INSERT INTO LINEA_PEDIDO (
  id_linea,
  id_pedido,
  id_articulo,
  cantidad,
  precio_unitario
) VALUES (?, ?, ?, ?, ?);

-- Repetir paso 2 para cada artículo

-- Paso 3: Actualizar fecha de última compra del artículo
UPDATE ARTICULO 
SET ultima_compra = NOW()
WHERE id_articulo IN (lista_de_articulos_del_pedido);
```

### 5. Agrupar artículos por proveedor (para Resumen)
```sql
SELECT 
  p.id_proveedor,
  p.nombre AS proveedor,
  COUNT(DISTINCT a.id_articulo) AS num_articulos,
  SUM((a.stock_optimo - a.stock_actual) * ap.precio_unitario) AS total_estimado
FROM ARTICULO a
JOIN ARTICULO_PROVEEDOR ap ON a.id_articulo = ap.id_articulo AND ap.preferente = TRUE
JOIN PROVEEDOR p ON ap.id_proveedor = p.id_proveedor
WHERE a.stock_actual < a.stock_optimo
  AND a.activo = TRUE
GROUP BY p.id_proveedor, p.nombre
ORDER BY total_estimado DESC;
```

---

## 📡 EVENTOS PARA INTEGRACIÓN

### 🔵 Evento: PEDIDO_INICIADO
Cuando el usuario abre el modal de Nuevo Pedido
```typescript
{
  evento: "PEDIDO_INICIADO",
  payload: {
    timestamp: Date
  }
}
```
**Acción Backend**: Consultar artículos con stock bajo y cargar proveedores

---

### 🟢 Evento: PROVEEDOR_CAMBIADO
Cuando el usuario cambia el proveedor de un artículo
```typescript
{
  evento: "PROVEEDOR_CAMBIADO",
  payload: {
    id_articulo: string,
    proveedor_anterior_id: string,
    proveedor_nuevo_id: string,
    proveedor_nuevo_nombre: string,
    timestamp: Date
  }
}
```
**Acción Backend**: 
- Consultar nuevo precio del artículo con el proveedor seleccionado
- Actualizar precio en la fila de la tabla

---

### 🟣 Evento: CANTIDAD_MODIFICADA
Cuando el usuario modifica la cantidad propuesta
```typescript
{
  evento: "CANTIDAD_MODIFICADA",
  payload: {
    id_articulo: string,
    cantidad_anterior: number,
    cantidad_nueva: number,
    timestamp: Date
  }
}
```
**Acción Backend**: Recalcular subtotales y totales por proveedor

---

### 🟡 Evento: ARTICULO_ELIMINADO
Cuando el usuario elimina un artículo del pedido
```typescript
{
  evento: "ARTICULO_ELIMINADO",
  payload: {
    id_articulo: string,
    codigo: string,
    nombre: string,
    timestamp: Date
  }
}
```
**Acción Backend**: Eliminar artículo de la lista temporal del pedido

---

### 🔴 Evento: PEDIDO_ENVIADO (CRÍTICO)
Cuando el usuario hace clic en "Enviar Pedido" para un proveedor
```typescript
{
  evento: "PEDIDO_ENVIADO",
  payload: {
    proveedor_id: string,
    proveedor_nombre: string,
    articulos: [
      {
        id_articulo: string,
        codigo: string,
        cantidad: number,
        precio_unitario: number,
        subtotal: number
      }
    ],
    total: number,
    anotaciones: string,
    usuario_id: string,
    timestamp: Date
  }
}
```

**Acción Backend (TRANSACCIÓN)**:
```sql
BEGIN TRANSACTION;

-- 1. Crear pedido
INSERT INTO PEDIDO_PROVEEDOR (
  id_pedido, 
  numero_pedido,  -- Autogenerar: PED-PROV-YYYYMMDD-XXX
  id_proveedor, 
  fecha_pedido, 
  total, 
  estado, 
  anotaciones, 
  usuario_id
) VALUES (...);

-- 2. Insertar líneas
FOR EACH articulo IN payload.articulos:
  INSERT INTO LINEA_PEDIDO (
    id_linea,  -- Autogenerar
    id_pedido,
    id_articulo,
    cantidad,
    precio_unitario
  ) VALUES (...);

-- 3. Actualizar última compra
UPDATE ARTICULO 
SET ultima_compra = NOW()
WHERE id_articulo IN (lista_articulos);

-- 4. Opcional: Enviar email al proveedor
-- Llamar función de envío de email con PDF del pedido

COMMIT;
```

**Respuesta esperada**:
```json
{
  "success": true,
  "pedido": {
    "id_pedido": "PED-001",
    "numero_pedido": "PED-PROV-20241126-001",
    "proveedor": "Harinas del Norte",
    "total": 647.50,
    "fecha_pedido": "2024-11-26T10:30:00Z",
    "estado": "enviado"
  }
}
```

---

### 🟠 Evento: ARTICULO_AÑADIDO
Cuando el usuario hace clic en "Añadir Artículo" (futuro)
```typescript
{
  evento: "ARTICULO_AÑADIDO",
  payload: {
    timestamp: Date
  }
}
```
**Acción Backend**: Abrir selector de artículos disponibles (modal secundario)

---

## 🔄 FLUJO DE INTEGRACIÓN

### Flujo completo: Crear Nuevo Pedido

```mermaid
graph TD
    A[Usuario click "Nuevo Pedido"] --> B[EVENTO: PEDIDO_INICIADO]
    B --> C[Backend: Consultar artículos stock bajo]
    C --> D[Cargar tabla con artículos y proveedores]
    D --> E[Usuario modifica cantidades/proveedores]
    E --> F[Usuario click "Ver Resumen"]
    F --> G[Agrupar artículos por proveedor]
    G --> H[Mostrar resumen por proveedor]
    H --> I[Usuario añade anotaciones]
    I --> J[Usuario click "Enviar Pedido"]
    J --> K[EVENTO: PEDIDO_ENVIADO]
    K --> L[Backend: Crear PEDIDO_PROVEEDOR + LINEA_PEDIDO]
    L --> M[Actualizar ARTICULO.ultima_compra]
    M --> N[Enviar email al proveedor]
    N --> O[Mostrar confirmación al usuario]
```

---

## 🎨 COMPONENTES UI

### Modal "Nuevo Pedido"
- **Ubicación**: `/components/gerente/StockProveedoresCafe.tsx`
- **Estado**: `modalNuevoPedido` (boolean)
- **Tabs**: 
  - `pedidos`: Tabla editable de artículos
  - `resumen`: Agrupación por proveedor con anotaciones

### Tabla de Pedidos (Tab 1)
**Columnas**:
1. Código (editable: ❌)
2. Artículo (editable: ❌)
3. Marca (editable: ❌)
4. PDV (editable: ❌)
5. Stock Actual/Óptimo (visual con Progress bar)
6. Propuesta (editable: ✅ - Input numérico)
7. Precio (editable: ❌ - se actualiza al cambiar proveedor)
8. Proveedor (editable: ✅ - Select dropdown)
9. Acciones (botón eliminar)

**Botones**:
- "Añadir Artículo" (top-right): Futuro - abrir modal de selección
- "X" (por fila): Eliminar artículo del pedido

### Resumen por Proveedor (Tab 2)
**Por cada proveedor**:
- Card con header (logo, nombre, total)
- Tabla de artículos con subtotales
- Textarea para anotaciones
- Botón "Enviar Pedido a [Proveedor]"

**Comportamiento**:
- Si no hay artículos: Mostrar mensaje "No hay artículos en el pedido"
- Si hay artículos: Mostrar un Card por cada proveedor único

---

## 🧪 DATOS DE PRUEBA

### Artículos de ejemplo
```javascript
const articulosPrueba = [
  {
    codigo: 'HAR-001',
    articulo: 'Harina de Trigo T45',
    marca: 'Pizzas',
    pdv: 'Tiana',
    stockActual: 15,
    stockOptimo: 50,
    precio: 18.50,
    proveedor: 'Harinas del Norte'
  },
  // ... más artículos
];
```

### Proveedores de ejemplo
```javascript
const proveedoresPrueba = [
  { id: 'PROV-001', nombre: 'Harinas del Norte' },
  { id: 'PROV-002', nombre: 'Lácteos Premium' },
  { id: 'PROV-003', nombre: 'Conservas Mediterráneas' },
  // ... más proveedores
];
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos
- [ ] Crear tablas: ARTICULO, PROVEEDOR, ARTICULO_PROVEEDOR, PEDIDO_PROVEEDOR, LINEA_PEDIDO
- [ ] Crear índices recomendados
- [ ] Crear campo calculado subtotal en LINEA_PEDIDO
- [ ] Insertar datos de prueba (mínimo 5 proveedores y 20 artículos)

### Fase 2: API / Endpoints
- [ ] GET /api/articulos/stock-bajo (con filtros marca, pdv)
- [ ] GET /api/proveedores (activos)
- [ ] GET /api/articulos/:id/precio-proveedor/:proveedor_id
- [ ] POST /api/pedidos (crear pedido completo con líneas)
- [ ] GET /api/pedidos/:id (detalles de pedido creado)

### Fase 3: Eventos
- [ ] Capturar evento PEDIDO_INICIADO
- [ ] Capturar evento PROVEEDOR_CAMBIADO
- [ ] Capturar evento CANTIDAD_MODIFICADA
- [ ] Capturar evento ARTICULO_ELIMINADO
- [ ] Capturar evento PEDIDO_ENVIADO (crítico)

### Fase 4: Email / Notificaciones
- [ ] Diseñar plantilla email pedido proveedor
- [ ] Configurar envío automático al crear pedido
- [ ] Incluir PDF con detalle del pedido
- [ ] Notificación interna al gerente

### Fase 5: Testing
- [ ] Probar consulta de artículos stock bajo
- [ ] Verificar cambio de proveedor actualiza precio
- [ ] Validar cálculo de totales por proveedor
- [ ] Comprobar transacción completa de pedido
- [ ] Verificar envío de email

---

## 📊 MÉTRICAS Y ANALÍTICA

### Métricas a trackear:
- Tiempo medio para crear un pedido
- Nº artículos por pedido promedio
- Proveedor más utilizado
- Valor medio de pedidos por proveedor
- Tasa de cumplimiento de proveedores (fecha esperada vs recibida)

---

## 🔒 VALIDACIONES

### Frontend (antes de enviar):
- ✅ Al menos 1 artículo en el pedido
- ✅ Cantidad propuesta > 0 para todos los artículos
- ✅ Proveedor seleccionado para todos los artículos
- ✅ Total del pedido > pedido_minimo del proveedor (si existe)

### Backend (en POST /api/pedidos):
- ✅ Usuario autenticado
- ✅ Proveedor existe y está activo
- ✅ Todos los artículos existen
- ✅ Precios son consistentes con ARTICULO_PROVEEDOR
- ✅ No hay artículos duplicados en el mismo pedido
- ✅ Stock no es negativo después de comprometer

---

## 📱 NUEVA FUNCIONALIDAD: Pestaña Contacto en Modal Proveedor

### Descripción
Se ha añadido una pestaña "Contacto" en el modal de detalles de proveedor que permite configurar las opciones de comunicación automática para el envío de pedidos.

### Campos de la pestaña Contacto

#### 1. Enviar por correo electrónico
- **Checkbox**: `enviar_email_automatico`
- **Campo**: `email_pedidos` (Input tipo email)
- **Descripción**: Configurar email para envío automático de pedidos

#### 2. Enviar por WhatsApp
- **Checkbox**: `enviar_whatsapp_automatico`
- **Campo**: `whatsapp` (Input tipo tel)
- **Descripción**: Configurar número de WhatsApp para notificaciones
- **Formato esperado**: +34 600 123 456 (código de país + número)

#### 3. Enviar invitación a la App
- **Checkbox**: `invitacion_app_enviada`
- **Descripción**: Invitar al proveedor a usar la app móvil Udar Edge
- **Beneficios mostrados**:
  - Recibir pedidos instantáneamente
  - Confirmar disponibilidad en tiempo real
  - Actualizar precios y catálogo
  - Consultar historial de pedidos

### Evento: CONTACTO_PROVEEDOR_ACTUALIZADO

Cuando el usuario guarda las opciones de contacto:

```typescript
{
  evento: "CONTACTO_PROVEEDOR_ACTUALIZADO",
  payload: {
    proveedor_id: string,
    email: {
      activo: boolean,
      direccion: string
    },
    whatsapp: {
      activo: boolean,
      numero: string
    },
    invitacion_app: boolean,
    timestamp: Date
  }
}
```

**Acción Backend**:
```sql
UPDATE PROVEEDOR
SET 
  email_pedidos = ?,
  enviar_email_automatico = ?,
  whatsapp = ?,
  enviar_whatsapp_automatico = ?,
  invitacion_app_enviada = ?
WHERE id_proveedor = ?;

-- Si invitacion_app = true y antes era false:
-- Enviar email/SMS con enlace de descarga de la app
```

### Query para obtener configuración de contacto

```sql
SELECT 
  email_pedidos,
  enviar_email_automatico,
  whatsapp,
  enviar_whatsapp_automatico,
  invitacion_app_enviada
FROM PROVEEDOR
WHERE id_proveedor = ?;
```

---

## 📊 NUEVA FUNCIONALIDAD: Contadores en Modal Nuevo Pedido

### Descripción
Se han añadido dos contadores en el header del modal "Nuevo Pedido" para tracking en tiempo real.

### Contadores

#### 1. Total Pedidos
- **Variable**: `totalPedidosEnviados`
- **Color**: Teal (verde azulado)
- **Descripción**: Cuenta el número total de pedidos enviados en la sesión actual
- **Incremento**: +1 cada vez que se hace click en "Enviar Pedido a [Proveedor]"

#### 2. Pedidos Pendientes de Enviar
- **Variable**: `pedidosPendientes`
- **Color**: Orange (naranja)
- **Descripción**: Muestra cuántos proveedores tienen pedidos pendientes de enviar
- **Inicialización**: Se calcula al abrir el modal contando proveedores únicos en artículos seleccionados
- **Decremento**: -1 cada vez que se envía un pedido a un proveedor

### Lógica de actualización

```typescript
// Al abrir modal "Nuevo Pedido"
const numProveedores = new Set(articulosSeleccionados.map(a => a.proveedorId)).size;
setPedidosPendientes(numProveedores);

// Al enviar pedido a un proveedor
setTotalPedidosEnviados(prev => prev + 1);
setPedidosPendientes(prev => Math.max(0, prev - 1));
```

### Almacenamiento recomendado

Para persistir estos contadores entre sesiones:

```sql
-- Opción 1: Tabla de sesión de pedidos
CREATE TABLE SESION_PEDIDO (
  id_sesion VARCHAR(50) PRIMARY KEY,
  usuario_id VARCHAR(50),
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_pedidos_enviados INT DEFAULT 0,
  pedidos_pendientes INT DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE
);

-- Opción 2: Estadística diaria del usuario
CREATE TABLE ESTADISTICA_PEDIDOS_USUARIO (
  id VARCHAR(50) PRIMARY KEY,
  usuario_id VARCHAR(50),
  fecha DATE,
  total_pedidos_creados INT DEFAULT 0,
  UNIQUE KEY unique_usuario_fecha (usuario_id, fecha)
);
```

---

## 📞 SOPORTE

Este documento está vinculado al componente:
**`/components/gerente/StockProveedoresCafe.tsx`**

Todos los comentarios técnicos en el código están marcados con:
- `🔌 EVENTO:` para eventos
- `📊 CONEXIÓN DATOS:` para queries
- `💡 Nota para el programador:` para indicaciones específicas

---

**Última actualización**: 26/11/2024  
**Versión**: 1.0  
**Autor**: Figma Make - Udar Edge Team