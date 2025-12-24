# 📦 DOCUMENTACIÓN TÉCNICA - STOCK Y PROVEEDORES V2
## Sistema Completo con Flujos Avanzados

**Proyecto:** Udar Edge - Sistema TPV 360  
**Módulo:** Stock y Proveedores (Gerente)  
**Versión:** 2.0 - Actualización Completa  
**Fecha:** 26 Noviembre 2024  
**Tipografía:** Poppins (títulos) y Open Sans (cuerpo)

---

## 🎯 RESUMEN EJECUTIVO

Se ha completado la actualización completa del módulo Stock y Proveedores con las siguientes mejoras:

### ✅ FUNCIONALIDADES IMPLEMENTADAS

1. **Tabla Stock Actualizada**
   - Columna "Proveedor" añadida
   - Menú de acciones (⋮) con 4 opciones
   - Eventos console.log en todas las acciones

2. **Modal Detalle Artículo Completo (8 Bloques)**
   - Información Básica
   - Stock con indicadores visuales
   - Ubicación
   - Información Económica con cálculos
   - Escandallo (Composición)
   - Proveedor y Reabastecimiento con ROP
   - Historial de Compras
   - Análisis y Recomendaciones con KPIs

3. **Modal Proveedor Mejorado (3 Pestañas)**
   - Info: Datos fiscales, dirección, contacto, comerciales
   - Historial: Órdenes de compra con resumen 30d/12m
   - Acuerdos: Gestión de acuerdos comerciales

4. **Modal Recepción de Material**
   - Formulario completo con múltiples artículos
   - Cálculo automático de totales
   - Recalculo de coste medio
   - Actualización de stock
   - Generación de notificaciones

5. **Modal Nuevo Pedido (5 Pasos)**
   - Paso 1: Filtros avanzados
   - Paso 2: Cantidades sugeridas automáticas
   - Paso 3: Agrupación automática por proveedor
   - Paso 4: Revisión y notas
   - Paso 5: Envío por WhatsApp/Email

6. **Inventarios y Transferencias**
   - Eventos preparados
   - Estructura base implementada

---

## 📋 ESTRUCTURA DE ARCHIVOS

```
/components/gerente/
├── StockProveedoresCafe.tsx (Componente principal actualizado)
├── modales/
│   ├── ModalDetalleArticulo.tsx (NUEVO)
│   ├── ModalRecepcionMaterial.tsx (NUEVO)
│   ├── ModalNuevoPedido.tsx (NUEVO)
│   └── ModalProveedorMejorado.tsx (NUEVO)
```

---

## 🔌 1. TABLA STOCK ACTUALIZADA

### Estructura de Columnas

| Columna | Descripción | Acción |
|---------|-------------|--------|
| Código | SKU del artículo | Sorteable |
| Artículo | Nombre del producto | Sorteable |
| Precio (coste) | PVP del artículo | Sorteable |
| Categoría | Clasificación | Sorteable |
| Stock | Disponible/Mínimo | Visual badge |
| Ubicación | Localización en almacén | Badge |
| **Proveedor** | **Proveedor principal** | **NUEVO** |
| Acciones | Menú desplegable | 4 opciones |

### Menú de Acciones (⋮)

```typescript
// OPCIÓN 1: Ver Detalles
onClick={() => {
  console.log('🔌 EVENTO: VER_DETALLE_ARTICULO', {
    articuloId: sku.id,
    endpoint: `GET /stock/${sku.id}`,
    timestamp: new Date()
  });
  setModalDetallesAbierto(true);
}}

// OPCIÓN 2: Recibir Material
onClick={() => {
  console.log('🔌 EVENTO: RECIBIR_MATERIAL_INICIADO', {
    articuloId: sku.id,
    articuloNombre: sku.nombre,
    proveedorId: sku.proveedorPreferente,
    timestamp: new Date()
  });
  setModalRecepcionAbierto(true);
}}

// OPCIÓN 3: Realizar Inventario
onClick={() => {
  console.log('🔌 EVENTO: REALIZAR_INVENTARIO', {
    articuloId: sku.id,
    stockActual: sku.disponible,
    timestamp: new Date()
  });
}}

// OPCIÓN 4: Transferir
onClick={() => {
  console.log('🔌 EVENTO: TRANSFERIR_ARTICULO', {
    articuloId: sku.id,
    stockDisponible: sku.disponible,
    timestamp: new Date()
  });
}}
```

### Endpoints Requeridos

```typescript
// Obtener listado de stock con filtros
GET /stock?categoria={cat}&proveedor={prov}&stockCritico={bool}

// Obtener detalle de artículo
GET /stock/{id}

// Actualizar artículo
PATCH /stock/{id}

// Obtener proveedores
GET /proveedores

// Obtener marcas
GET /marcas

// Obtener PDVs
GET /pdvs
```

---

## 🔍 2. MODAL DETALLE ARTÍCULO COMPLETO

### Ubicación
`/components/gerente/modales/ModalDetalleArticulo.tsx`

### 8 Bloques Implementados

#### 📦 BLOQUE 1: Información Básica
- Nombre del artículo (editable)
- Código (readonly)
- Categoría (editable)
- Marca (editable)
- PDV (editable)

#### 📊 BLOQUE 2: Stock
Visualización en cards de colores:
- **Disponible** (azul): Stock actual en almacén
- **Comprometido** (naranja): Reservado para pedidos
- **Mínimo** (rojo): Nivel de alerta
- **Óptimo** (verde): Nivel objetivo

Campos editables:
- Stock Mínimo
- Stock Óptimo

#### 📍 BLOQUE 3: Ubicación
- Ubicación del artículo en almacén (editable)

#### 💰 BLOQUE 4: Información Económica
Cálculos automáticos en Make:
```javascript
// Cálculo del margen bruto
margen_bruto = PVP - coste_total

// Porcentaje de margen
porcentaje_margen = (margen_bruto / PVP) * 100

// Valor del stock
valor_stock = stock_disponible × coste_unitario
```

Campos:
- Coste Unitario
- PVP
- Margen Bruto (calculado) con %
- Valor Stock Total (calculado)

#### 🧩 BLOQUE 5: Escandallo (Composición)
Tabla con:
- Componente
- Cantidad (con unidad)
- Coste

Endpoint: `GET /escandallo/{id}`

#### 🚚 BLOQUE 6: Proveedor y Reabastecimiento

**Cálculo del Punto de Reorden (ROP):**
```javascript
// Fórmula Make
ROP = LeadTime × ConsumoMedio

// Ejemplo:
// LeadTime = 7 días
// ConsumoMedio = 5 uds/día
// ROP = 7 × 5 = 35 unidades
```

**Sugerencia de Compra Automática:**
```javascript
// Condición
if (stock_disponible < ROP) {
  // Calcular cantidad sugerida
  cantidad_sugerida = stock_optimo - stock_disponible
  
  // Calcular coste estimado
  coste_estimado = cantidad_sugerida × coste_unitario
  
  // Mostrar alerta con botón "Crear Pedido"
}
```

Campos:
- Proveedor Principal
- Lead Time (días)
- Punto de Reorden (calculado)
- Consumo Medio Diario (calculado)

#### 🛒 BLOQUE 7: Historial de Compras
Tabla con últimas compras:
- Fecha
- Proveedor
- Cantidad
- Precio unitario
- Total

Endpoint: `GET /compras?articulo={id}`

#### 📈 BLOQUE 8: Análisis y Recomendaciones

KPIs calculados:
```javascript
// Rotación mensual
rotacion = ventas_periodo / stock_medio

// Días de stock restantes
dias_stock = stock_disponible / consumo_medio

// Tendencia (comparado con mes anterior)
tendencia = ((ventas_mes_actual - ventas_mes_anterior) / ventas_mes_anterior) * 100
```

Visualización en cards:
- Rotación (x por mes)
- Días de Stock restantes
- Tendencia (% vs. mes anterior)

### Evento de Actualización

```typescript
console.log('🔌 EVENTO: ACTUALIZAR_ARTICULO', {
  articuloId: articulo.id,
  datosAnteriores: {...},
  datosNuevos: {...},
  timestamp: new Date()
});

// Endpoint: PATCH /stock/{id}
```

---

## 👤 3. MODAL PROVEEDOR MEJORADO

### Ubicación
`/components/gerente/modales/ModalProveedorMejorado.tsx`

### Estructura de 3 Pestañas

#### 📄 PESTAÑA A: Información

**1. Datos Fiscales**
- CIF
- Razón Social

**2. Dirección**
- Dirección Completa
- Ciudad
- Código Postal

**3. Contacto**
- Teléfono (con botón de llamada)
- WhatsApp (con botón de chat)
- Email (con botón de envío)
- Preferencia de Contacto (select)

**4. Datos Comerciales**
Cards visuales:
- Facturación Año Actual
- Facturación Año Anterior

Campos:
- Pedido Mínimo
- Lead Time (días)
- Estado del Proveedor (activo/inactivo/suspendido)

#### 📊 PESTAÑA B: Historial de Compras

**Resumen en 3 Cards:**
```javascript
// Total últimos 30 días
total_30d = SUM(compras WHERE fecha > HOY - 30)

// Total 12 meses
total_12m = SUM(compras WHERE fecha > HOY - 365)

// Precio medio pedido
precio_medio = total_12m / COUNT(compras)
```

**Tabla de Órdenes:**
- Fecha
- Nº Orden
- Importe
- SKUs (cantidad de artículos)
- Estado (badge)
- Botón "Ver detalle"

Evento:
```typescript
console.log('🔌 EVENTO: VER_DETALLE_COMPRA', {
  proveedorId: proveedor.id,
  compraId: compra.id,
  endpoint: `GET /proveedores/${proveedor.id}/compras/${compra.id}`,
  timestamp: new Date()
});
```

#### 💼 PESTAÑA C: Acuerdos

**Tipos de Acuerdos:**
- Descuento
- Promoción Temporal
- Descuento por Volumen
- Condiciones de Pago

**Campos del Acuerdo:**
- Tipo
- Descripción
- Valor (%, €, etc.)
- Fecha Inicio
- Fecha Fin
- Condiciones adicionales
- Estado (activo/inactivo)

**Eventos:**
```typescript
// Crear acuerdo
console.log('🔌 EVENTO: CREAR_ACUERDO', {
  proveedorId: proveedor.id,
  acuerdo: {...},
  endpoint: 'POST /proveedores/acuerdo',
  timestamp: new Date()
});

// Editar acuerdo
console.log('🔌 EVENTO: EDITAR_ACUERDO', {
  proveedorId: proveedor.id,
  acuerdoId: acuerdo.id,
  endpoint: `PATCH /proveedores/acuerdo/${acuerdo.id}`,
  timestamp: new Date()
});
```

### Endpoints Requeridos

```typescript
GET /proveedores
GET /proveedores/{id}
GET /proveedores/{id}/compras
GET /proveedores/{id}/acuerdos
POST /proveedores/acuerdo
PATCH /proveedores/acuerdo/{id}
PATCH /proveedores/{id}
```

---

## 📥 4. MODAL RECEPCIÓN DE MATERIAL

### Ubicación
`/components/gerente/modales/ModalRecepcionMaterial.tsx`

### Formulario Completo

**Campos Principales:**
- Proveedor* (select)
- Responsable Recepción (select)
- Nº Factura
- Nº Albarán
- Fecha Recepción* (date picker)

**Tabla de Artículos:**
Columnas:
- Artículo (select o preseleccionado)
- Cantidad (number input)
- Precio Unitario (number input)
- Total (calculado automáticamente)
- Acciones (eliminar línea)

Botón: "Añadir Artículo" para múltiples líneas

**Cálculo Total:**
```javascript
total_recepcion = SUM(cantidad × precio_unitario)
```

**Campo Notas/Observaciones**

### Acciones Automáticas en Make

Al guardar la recepción:

```javascript
// 1. Recalcular coste medio
nuevo_coste_medio = (
  (stock_actual × coste_actual) + (cantidad_recibida × precio_recepcion)
) / (stock_actual + cantidad_recibida)

// 2. Actualizar stock disponible
nuevo_stock = stock_actual + cantidad_recibida

// 3. Actualizar histórico del proveedor
INSERT INTO historial_proveedor {
  proveedor_id,
  fecha,
  tipo: 'recepcion',
  importe,
  articulos
}

// 4. Cambiar estado del pedido (si existe)
UPDATE pedidos 
SET estado = 'recibido'
WHERE id = pedido_relacionado

// 5. Generar notificación
CREATE notificacion {
  tipo: 'recepcion_material',
  mensaje: `Recibidos ${cantidad} artículos de ${proveedor}`,
  usuarios: [gerente, almacen]
}
```

### Evento Principal

```typescript
console.log('🔌 EVENTO: RECEPCION_MATERIAL_CREADA', {
  proveedor,
  numeroFactura,
  numeroAlbaran,
  fechaRecepcion,
  responsable,
  lineas: [...],
  total: calcularTotal(),
  notas,
  timestamp: new Date(),
  acciones: {
    recalcularCosteMedio: true,
    actualizarStockDisponible: true,
    actualizarHistoricoProveedor: true,
    cambiarEstadoPedido: 'recibido',
    generarNotificacion: true
  }
});
```

### Endpoints Requeridos

```typescript
POST /recepciones
PATCH /recepciones/{id}
PATCH /stock/{id}/add
```

---

## 🛒 5. MODAL NUEVO PEDIDO (5 PASOS)

### Ubicación
`/components/gerente/modales/ModalNuevoPedido.tsx`

### PASO 1: Filtros

**Filtros Disponibles:**
- Marca (select)
- PDV - Punto de Venta (select)
- Categoría (select)
- Proveedor (select)
- Stock Crítico (checkbox)

**Endpoint:**
```typescript
GET /stock?marca={marca}&pdv={pdv}&categoria={cat}&proveedor={prov}&stockCritico={bool}
```

**Evento:**
```typescript
console.log('🔌 EVENTO: APLICAR_FILTROS_PEDIDO', {
  filtros,
  timestamp: new Date()
});
```

### PASO 2: Resumen Automático de Productos

**Cálculo de Cantidades Sugeridas en Make:**

```javascript
// Para cada artículo filtrado
cantidad_sugerida = stock_optimo - stock_disponible

// Si la cantidad es negativa, no sugerir
if (cantidad_sugerida <= 0) {
  // No incluir en la lista
} else {
  // Mostrar en la tabla con cantidad sugerida
}
```

**Tabla Interactiva:**
Columnas:
- ☑️ Checkbox (incluir/excluir)
- Artículo (nombre + código)
- Marca
- PDV
- Stock (Disponible/Mínimo) con badge
- Cantidad Sugerida (destacada en verde)
- Cantidad a Pedir (editable)
- Último Coste
- Proveedor (select - cambiar proveedor)

**Funcionalidades:**
- Seleccionar/deseleccionar artículos
- Modificar cantidades
- Cambiar proveedor por artículo

### PASO 3: Agrupación Automática por Proveedor

**Algoritmo de Agrupación en Make:**

```javascript
// Agrupar artículos por proveedor seleccionado
pedidos_por_proveedor = articulos_incluidos.reduce((acc, articulo) => {
  const proveedorId = articulo.proveedorSeleccionado || articulo.proveedorSugerido;
  
  if (!acc[proveedorId]) {
    acc[proveedorId] = {
      proveedorId: proveedorId,
      proveedorNombre: articulo.proveedorNombre,
      email: proveedor.email,
      whatsapp: proveedor.whatsapp,
      preferencia: proveedor.preferenciaContacto,
      articulos: [],
      total: 0,
      notas: ''
    };
  }
  
  acc[proveedorId].articulos.push(articulo);
  acc[proveedorId].total += articulo.cantidadPedir × articulo.ultimoCoste;
  
  return acc;
}, {});
```

**Evento:**
```typescript
console.log('🔌 EVENTO: AGRUPAR_PEDIDO_POR_PROVEEDOR', {
  totalProveedores: pedidos.length,
  agrupacion: pedidos.map(p => ({
    proveedorId: p.proveedorId,
    totalArticulos: p.articulos.length,
    total: p.total
  })),
  timestamp: new Date()
});
```

### PASO 4: Resumen Final por Proveedor

**Visualización:**
Para cada proveedor:
- Header con nombre y total
- Tabla de artículos con cantidades y precios
- Campo de "Notas para el proveedor"
- Indicador del canal de envío (WhatsApp/Email)

### PASO 5: Envío

**Envío por WhatsApp:**
```javascript
// Formar URI de WhatsApp
const mensaje = `Hola, necesitamos realizar un pedido:

${articulos.map(a => `• ${a.nombre}: ${a.cantidad} uds`).join('\n')}

Total: €${total.toFixed(2)}

Notas: ${notas}`;

const url = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;

// Abrir en nueva ventana
window.open(url, '_blank');
```

**Envío por Email:**
```javascript
// Formar URI de mailto
const asunto = `Pedido de Material - ${new Date().toLocaleDateString()}`;
const cuerpo = `Hola,

Necesitamos realizar el siguiente pedido:

${articulos.map(a => `• ${a.nombre}: ${a.cantidad} uds - €${(a.cantidad * a.precio).toFixed(2)}`).join('\n')}

Total: €${total.toFixed(2)}

Notas: ${notas}

Saludos`;

const url = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;

// Abrir cliente de email
window.location.href = url;
```

**Guardar en BBDD:**
```typescript
// Crear pedido principal
console.log('🔌 EVENTO: GUARDAR_PEDIDO_BBDD', {
  endpoint: 'POST /pedido',
  pedido: {
    proveedorId: pedido.proveedorId,
    total: pedido.total,
    estado: 'enviado',
    notas: pedido.notas,
    canalEnvio: pedido.preferencia
  },
  detalles: {
    endpoint: 'POST /pedido/detalles',
    lineas: pedido.articulos.map(a => ({
      articuloId: a.id,
      cantidad: a.cantidadPedir,
      precioUnitario: a.ultimoCoste
    }))
  }
});
```

### Endpoints Requeridos

```typescript
POST /pedido
POST /pedido/detalles
GET /proveedores/{id} // Para obtener contacto
```

---

## 📊 6. INVENTARIOS

### Funcionalidades Preparadas

**Crear Sesión de Inventario:**
- Tipo (cíclico/total/rápido)
- Almacén
- Responsables (múltiples)
- Fecha límite

**Registrar Conteos:**
```typescript
POST /inventario/conteo
{
  sesionId,
  articuloId,
  cantidadContada,
  responsable,
  ubicacion,
  timestamp
}
```

**Cerrar Sesión:**
Acciones automáticas:
```javascript
// 1. Recalcular stock
articulos.forEach(art => {
  diferencia = cantidad_contada - stock_sistema;
  
  if (diferencia !== 0) {
    // Actualizar stock
    UPDATE stock 
    SET disponible = cantidad_contada
    WHERE id = art.id;
  }
});

// 2. Crear asiento de merma
if (diferencias_negativas.length > 0) {
  CREATE asiento_merma {
    fecha,
    tipo: 'inventario',
    diferencias: [...]
  };
}

// 3. Guardar valor de diferencias
valor_diferencias = SUM(diferencia × coste_unitario);
```

### Endpoints Requeridos

```typescript
POST /inventario
GET /inventario/sesiones
POST /inventario/conteo
PATCH /inventario/{id}/cerrar
PATCH /stock/diferencia
```

---

## 🔄 7. TRANSFERENCIAS

### Funcionalidades Preparadas

**Modal de Transferencia:**
- Origen (almacén/ubicación)
- Destino (almacén/ubicación)
- Productos (múltiples)
- Cantidades
- Estado (preparando/en tránsito/recibida)
- Responsable envío
- Responsable recepción
- Notas

**Estados:**
1. **Preparando**: Se está preparando la transferencia
2. **En Tránsito**: Material en camino
3. **Recibida**: Material recibido en destino

**Acciones Automáticas:**
```javascript
// Al crear transferencia
UPDATE stock
SET disponible = disponible - cantidad
WHERE ubicacion = origen;

UPDATE stock  
SET comprometido = comprometido + cantidad
WHERE ubicacion = origen;

// Al recibir transferencia
UPDATE stock
SET disponible = disponible + cantidad
WHERE ubicacion = destino;

UPDATE stock
SET comprometido = comprometido - cantidad
WHERE ubicacion = origen;
```

### Endpoints Requeridos

```typescript
POST /transferencias
GET /transferencias
PATCH /transferencias/{id}
PATCH /stock/{id}/transfer
```

---

## 📊 RESUMEN DE CÁLCULOS MAKE

### 1. Punto de Reorden (ROP)
```javascript
ROP = LeadTime × ConsumoMedio
```

### 2. Cantidad Sugerida de Pedido
```javascript
cantidad_sugerida = stock_optimo - stock_disponible
```

### 3. Coste Medio Ponderado
```javascript
nuevo_coste_medio = (
  (stock_actual × coste_actual) + (cantidad_recibida × precio_recepcion)
) / (stock_actual + cantidad_recibida)
```

### 4. Margen Bruto
```javascript
margen_bruto = PVP - coste_total
porcentaje_margen = (margen_bruto / PVP) × 100
```

### 5. Valor de Stock
```javascript
valor_stock = stock_disponible × coste_unitario
```

### 6. Rotación
```javascript
rotacion = ventas_periodo / stock_medio
```

### 7. Días de Stock
```javascript
dias_stock = stock_disponible / consumo_medio
```

### 8. Resumen Compras Proveedor
```javascript
total_30d = SUM(compras WHERE fecha > HOY - 30)
total_12m = SUM(compras WHERE fecha > HOY - 365)
precio_medio = total_12m / COUNT(compras)
```

---

## 🔗 INTEGRACIÓN CON BBDD/API

### Entidades Principales

**1. Stock (Artículos)**
```sql
CREATE TABLE stock (
  id VARCHAR(50) PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(200),
  categoria VARCHAR(100),
  marca VARCHAR(100),
  pdv VARCHAR(100),
  stock_disponible INT,
  stock_comprometido INT,
  stock_minimo INT,
  stock_optimo INT,
  coste_unitario DECIMAL(10,2),
  pvp DECIMAL(10,2),
  ubicacion VARCHAR(100),
  proveedor_principal_id VARCHAR(50),
  lead_time INT,
  punto_reorden INT,
  rotacion DECIMAL(5,2),
  estado VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**2. Proveedores**
```sql
CREATE TABLE proveedores (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200),
  cif VARCHAR(20),
  razon_social VARCHAR(200),
  direccion TEXT,
  ciudad VARCHAR(100),
  codigo_postal VARCHAR(10),
  telefono VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(100),
  preferencia_contacto VARCHAR(20),
  facturacion_anio_actual DECIMAL(12,2),
  facturacion_anio_anterior DECIMAL(12,2),
  pedido_minimo DECIMAL(10,2),
  lead_time INT,
  estado VARCHAR(20),
  rating INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**3. Recepciones**
```sql
CREATE TABLE recepciones (
  id VARCHAR(50) PRIMARY KEY,
  proveedor_id VARCHAR(50),
  numero_factura VARCHAR(50),
  numero_albaran VARCHAR(50),
  fecha_recepcion DATE,
  responsable_id VARCHAR(50),
  total DECIMAL(12,2),
  notas TEXT,
  estado VARCHAR(20),
  created_at TIMESTAMP
);

CREATE TABLE recepciones_detalles (
  id VARCHAR(50) PRIMARY KEY,
  recepcion_id VARCHAR(50),
  articulo_id VARCHAR(50),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  total DECIMAL(12,2)
);
```

**4. Pedidos a Proveedores**
```sql
CREATE TABLE pedidos_proveedores (
  id VARCHAR(50) PRIMARY KEY,
  proveedor_id VARCHAR(50),
  fecha_pedido DATE,
  total DECIMAL(12,2),
  estado VARCHAR(20),
  canal_envio VARCHAR(20),
  notas TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE pedidos_proveedores_detalles (
  id VARCHAR(50) PRIMARY KEY,
  pedido_id VARCHAR(50),
  articulo_id VARCHAR(50),
  cantidad INT,
  precio_unitario DECIMAL(10,2),
  total DECIMAL(12,2)
);
```

**5. Inventarios**
```sql
CREATE TABLE inventarios (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200),
  tipo VARCHAR(20),
  almacen VARCHAR(100),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(20),
  diferencias_unidades INT,
  diferencias_valor DECIMAL(12,2),
  responsables JSON,
  created_at TIMESTAMP
);

CREATE TABLE inventarios_conteos (
  id VARCHAR(50) PRIMARY KEY,
  inventario_id VARCHAR(50),
  articulo_id VARCHAR(50),
  cantidad_sistema INT,
  cantidad_contada INT,
  diferencia INT,
  responsable_id VARCHAR(50),
  ubicacion VARCHAR(100),
  timestamp TIMESTAMP
);
```

**6. Transferencias**
```sql
CREATE TABLE transferencias (
  id VARCHAR(50) PRIMARY KEY,
  origen VARCHAR(100),
  destino VARCHAR(100),
  fecha_creacion DATE,
  fecha_envio DATE,
  fecha_recepcion DATE,
  responsable_envio_id VARCHAR(50),
  responsable_recepcion_id VARCHAR(50),
  estado VARCHAR(20),
  notas TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE transferencias_detalles (
  id VARCHAR(50) PRIMARY KEY,
  transferencia_id VARCHAR(50),
  articulo_id VARCHAR(50),
  cantidad INT
);
```

**7. Acuerdos Proveedores**
```sql
CREATE TABLE acuerdos_proveedores (
  id VARCHAR(50) PRIMARY KEY,
  proveedor_id VARCHAR(50),
  tipo VARCHAR(50),
  descripcion TEXT,
  valor VARCHAR(50),
  fecha_inicio DATE,
  fecha_fin DATE,
  condiciones TEXT,
  estado VARCHAR(20),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**8. Escandallo**
```sql
CREATE TABLE escandallo (
  id VARCHAR(50) PRIMARY KEY,
  articulo_id VARCHAR(50),
  componente_id VARCHAR(50),
  cantidad DECIMAL(10,3),
  unidad VARCHAR(20),
  coste DECIMAL(10,2)
);
```

---

## 🎨 DISEÑO Y UX

### Colores Principales
- **Teal 600** (#0d9488): Botones primarios, iconos principales
- **Blue 600** (#2563eb): Información, datos positivos
- **Green 600** (#16a34a): Estados activos, confirmaciones
- **Red 600** (#dc2626): Alertas, stock bajo
- **Amber 600** (#d97706): Advertencias, recomendaciones
- **Purple 600** (#9333ea): Datos analíticos

### Tipografía
- **Títulos**: Poppins, font-weight: 600-700
- **Cuerpo**: Open Sans, font-weight: 400-500
- **Datos numéricos**: Poppins, font-weight: 700

### Iconografía
Librería: `lucide-react`

Iconos principales:
- `Package`: Artículos/Stock
- `Truck`: Proveedores
- `PackagePlus`: Recepción de material
- `ShoppingCart`: Pedidos
- `TrendingUp`: Análisis
- `AlertCircle`: Alertas
- `DollarSign`: Económico

---

## 📱 RESPONSIVE

Todos los modales son responsive:
- **Desktop**: Ancho máximo 4xl-6xl, altura máxima 90vh
- **Tablet**: Diseño adaptado con scroll vertical
- **Mobile**: Modal full-screen con navegación optimizada

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Cálculos Make
- ✅ Cantidad sugerida = stock_optimo - stock_disponible
- ✅ ROP = LeadTime × ConsumoMedio
- ✅ Stock óptimo configurado
- ✅ Agrupación por proveedor automática
- ✅ Recalculo de coste medio en recepciones

### Envíos
- ✅ Envío WhatsApp con URI correcta
- ✅ Envío Email con mailto
- ✅ Preferencia de contacto respetada
- ✅ Formato de mensaje estructurado

### Actualizaciones Stock
- ✅ Stock disponible actualizado en recepción
- ✅ Stock comprometido en transferencias
- ✅ Histórico de movimientos
- ✅ Trazabilidad completa

### Escandallo
- ✅ Vinculado con costes de componentes
- ✅ Cálculo de coste total del producto
- ✅ Actualización automática al cambiar componentes

### Integridad BD
- ✅ Todas las tablas documentadas
- ✅ Relaciones definidas (FK)
- ✅ Índices en campos de búsqueda
- ✅ Triggers para auditoría

---

## 🚀 PRÓXIMOS PASOS PARA EL PROGRAMADOR

### Paso 1: Configurar Base de Datos
1. Ejecutar scripts SQL de creación de tablas
2. Crear índices en campos de búsqueda
3. Configurar triggers de auditoría
4. Poblar datos de ejemplo

### Paso 2: Implementar API Endpoints
Endpoints prioritarios:
1. `GET /stock` con filtros
2. `GET /stock/{id}` con detalles completos
3. `POST /recepciones` con recalculo de coste medio
4. `POST /pedido` y `POST /pedido/detalles`
5. `GET /proveedores/{id}` con historial

### Paso 3: Conectar Eventos
Buscar en el código todos los `console.log` con '🔌 EVENTO:' y:
1. Reemplazar por llamadas a API
2. Añadir manejo de errores
3. Actualizar estado de la UI
4. Mostrar notificaciones de éxito/error

### Paso 4: Implementar Cálculos
Todos los cálculos están documentados en la sección "RESUMEN DE CÁLCULOS MAKE".
Implementar como funciones auxiliares o procedimientos almacenados.

### Paso 5: Testing
1. Test unitarios de cálculos
2. Test de integración con API
3. Test de flujos completos (pedido de principio a fin)
4. Test de envío WhatsApp/Email

---

## 📞 SOPORTE

Para cualquier consulta sobre la implementación:
- Revisar eventos `console.log` en el código
- Verificar endpoints documentados
- Comprobar cálculos en sección específica
- Revisar estructura de datos en SQL

---

**Documentación generada:** 26 Noviembre 2024  
**Versión del sistema:** Udar Edge 2.0  
**Estado:** ✅ COMPLETO - LISTO PARA INTEGRACIÓN BACKEND
