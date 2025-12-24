# 📊 DOCUMENTACIÓN TÉCNICA: Módulo Clientes y Productos

## 🎯 Objetivo
Este documento describe la estructura completa de datos, eventos y conexiones necesarias para que el programador integre el módulo "Clientes y Productos" del dashboard de Gerente con la base de datos / API.

---

## 🔧 FILTROS GLOBALES

**Ubicación**: Barra superior de todas las pestañas (Clientes, Facturación, Productos, Promociones)

### Estados disponibles:
```typescript
filtroMarca: 'todas' | 'pizzas' | 'burguers'
filtroPDV: 'todos' | 'tiana' | 'badalona'
filtroPeriodo: '7' | '30' | '90' | 'mes' | 'ano'  // días
filtroCanal: 'todos' | 'tpv' | 'online'
```

### ⚡ Aplicación:
Estos filtros deben pasarse como parámetros en **TODAS** las consultas SQL/API:
- WHERE marca IN (filtroMarca)
- AND pdv_id IN (filtroPDV)
- AND fecha BETWEEN (calcular rango según filtroPeriodo)
- AND canal IN (filtroCanal)

---

## 🗄️ ENTIDADES / TABLAS

### 1️⃣ CLIENTE
```sql
CREATE TABLE CLIENTE (
  id_cliente VARCHAR(50) PRIMARY KEY,
  nombre_completo VARCHAR(200) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(200),
  direccion_completa TEXT,
  cod_postal VARCHAR(10),
  fecha_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_pedido TIMESTAMP,
  fecha_cumpleaños DATE,
  pdv_habitual_id VARCHAR(50),
  marca_preferida VARCHAR(50),
  tipo_cliente ENUM('nuevo', 'regular', 'fidelizado', 'VIP', 'riesgo', 'alta_frecuencia', 'multitienda') DEFAULT 'nuevo',
  segmentos JSON  -- Array de tags: ["premium", "frecuente", etc.]
);
```

**Índices recomendados**:
- INDEX idx_fecha_ultimo_pedido ON CLIENTE(fecha_ultimo_pedido)
- INDEX idx_tipo_cliente ON CLIENTE(tipo_cliente)
- INDEX idx_pdv_habitual ON CLIENTE(pdv_habitual_id)

---

### 2️⃣ FACTURA
```sql
CREATE TABLE FACTURA (
  id_factura VARCHAR(50) PRIMARY KEY,
  id_cliente VARCHAR(50) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'online', 'mixto') NOT NULL,
  estado_verifactu BOOLEAN DEFAULT FALSE,
  pdv_id VARCHAR(50) NOT NULL,
  canal ENUM('TPV', 'Online') DEFAULT 'TPV',
  FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente)
);
```

**Índices recomendados**:
- INDEX idx_cliente_fecha ON FACTURA(id_cliente, fecha)
- INDEX idx_pdv_fecha ON FACTURA(pdv_id, fecha)
- INDEX idx_canal ON FACTURA(canal)

---

### 3️⃣ LINEA_FACTURA
```sql
CREATE TABLE LINEA_FACTURA (
  id_linea VARCHAR(50) PRIMARY KEY,
  id_factura VARCHAR(50) NOT NULL,
  id_producto VARCHAR(50) NOT NULL,
  cantidad INT NOT NULL,
  pvp_unitario DECIMAL(10,2) NOT NULL,
  descuento_aplicado DECIMAL(10,2) DEFAULT 0,
  total_linea DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_factura) REFERENCES FACTURA(id_factura),
  FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);
```

**Índices recomendados**:
- INDEX idx_factura ON LINEA_FACTURA(id_factura)
- INDEX idx_producto ON LINEA_FACTURA(id_producto)

---

### 4️⃣ PRODUCTO
```sql
CREATE TABLE PRODUCTO (
  id_producto VARCHAR(50) PRIMARY KEY,  -- PRD-XXX
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  descripcion_corta VARCHAR(200),
  descripcion_larga TEXT,
  pvp DECIMAL(10,2) NOT NULL,
  iva DECIMAL(5,2) DEFAULT 10,
  escandallo_unitario DECIMAL(10,2) NOT NULL,
  margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS ((pvp - escandallo_unitario) / pvp * 100) STORED,
  rentabilidad ENUM('Alta', 'Media', 'Baja') AS (
    CASE 
      WHEN margen_porcentaje >= 60 THEN 'Alta'
      WHEN margen_porcentaje >= 40 THEN 'Media'
      ELSE 'Baja'
    END
  ) STORED,
  ranking_ventas INT,
  visible_tpv BOOLEAN DEFAULT TRUE,
  visible_app BOOLEAN DEFAULT TRUE,
  vida_util_horas INT DEFAULT 24,
  etiquetas JSON  -- Array: ["saludable", "vegano", "premium"]
);
```

**Índices recomendados**:
- INDEX idx_categoria ON PRODUCTO(categoria)
- INDEX idx_ranking ON PRODUCTO(ranking_ventas)
- INDEX idx_visible ON PRODUCTO(visible_tpv, visible_app)

---

### 5️⃣ STOCK_PDV
```sql
CREATE TABLE STOCK_PDV (
  id_stock VARCHAR(50) PRIMARY KEY,
  id_producto VARCHAR(50) NOT NULL,
  pdv_id VARCHAR(50) NOT NULL,
  stock_actual INT DEFAULT 0,
  stock_max INT NOT NULL,
  stock_min INT NOT NULL,
  activo_en_pdv BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto),
  UNIQUE KEY unique_producto_pdv (id_producto, pdv_id)
);
```

**Índices recomendados**:
- INDEX idx_producto_pdv ON STOCK_PDV(id_producto, pdv_id)
- INDEX idx_stock_bajo ON STOCK_PDV(stock_actual) WHERE stock_actual < stock_min

---

### 6️⃣ PROMOCION
```sql
CREATE TABLE PROMOCION (
  id_promocion VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo ENUM('porcentaje', 'precio_fijo', 'pack', 'x_llevas_y', 'bienvenida', 'cumpleaños', 'riesgo', 'vip') NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  limite_por_cliente INT,
  limite_total INT,
  aplica_marca ENUM('pizza', 'burguer', 'todas') DEFAULT 'todas',
  aplica_pdv JSON,  -- Array de pdv_id: ["tiana", "badalona"]
  condiciones_ticket JSON,  -- { min_ticket: 10, escalado: {...} }
  estado ENUM('borrador', 'activa', 'pausada', 'finalizada') DEFAULT 'borrador'
);
```

**Índices recomendados**:
- INDEX idx_estado_fechas ON PROMOCION(estado, fecha_inicio, fecha_fin)
- INDEX idx_tipo ON PROMOCION(tipo)

---

### 7️⃣ PROMOCION_PRODUCTO
```sql
CREATE TABLE PROMOCION_PRODUCTO (
  id VARCHAR(50) PRIMARY KEY,
  id_promocion VARCHAR(50) NOT NULL,
  id_producto VARCHAR(50) NOT NULL,
  cantidad INT NOT NULL,
  tipo_linea ENUM('incluido', 'regalo', 'descuento_segunda_unidad') NOT NULL,
  FOREIGN KEY (id_promocion) REFERENCES PROMOCION(id_promocion),
  FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
);
```

---

### 8️⃣ PROMOCION_CLIENTE_LOG
```sql
CREATE TABLE PROMOCION_CLIENTE_LOG (
  id_log VARCHAR(50) PRIMARY KEY,
  id_promocion VARCHAR(50) NOT NULL,
  id_cliente VARCHAR(50) NOT NULL,
  fecha_enviada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_canjeada TIMESTAMP,
  canal ENUM('push', 'email', 'ticket') NOT NULL,
  FOREIGN KEY (id_promocion) REFERENCES PROMOCION(id_promocion),
  FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente)
);
```

**Índices recomendados**:
- INDEX idx_promocion_cliente ON PROMOCION_CLIENTE_LOG(id_promocion, id_cliente)
- INDEX idx_fecha_canjeada ON PROMOCION_CLIENTE_LOG(fecha_canjeada)

---

## 📐 CÁLCULOS CLAVE

### Para CLIENTES:
```sql
-- Nº de pedidos
SELECT COUNT(*) as num_pedidos
FROM FACTURA
WHERE id_cliente = ?
  AND fecha BETWEEN ? AND ?
  AND pdv_id IN (?)
  AND canal IN (?);

-- Ticket medio
SELECT SUM(total) / COUNT(*) as ticket_medio
FROM FACTURA
WHERE id_cliente = ?
  AND fecha BETWEEN ? AND ?;

-- Gasto total
SELECT SUM(total) as gasto_total
FROM FACTURA
WHERE id_cliente = ?
  AND fecha BETWEEN ? AND ?;
```

### Para PRODUCTOS:
```sql
-- Ranking por ventas
SELECT 
  p.id_producto,
  p.nombre,
  SUM(lf.cantidad) as unidades_vendidas,
  RANK() OVER (ORDER BY SUM(lf.cantidad) DESC) as ranking
FROM PRODUCTO p
JOIN LINEA_FACTURA lf ON p.id_producto = lf.id_producto
JOIN FACTURA f ON lf.id_factura = f.id_factura
WHERE f.fecha BETWEEN ? AND ?
GROUP BY p.id_producto;

-- Stock total por producto
SELECT 
  id_producto,
  SUM(stock_actual) as stock_total,
  COUNT(*) as pdvs_activos
FROM STOCK_PDV
WHERE activo_en_pdv = TRUE
GROUP BY id_producto;

-- % Promocionado
SELECT 
  p.id_producto,
  COUNT(DISTINCT CASE WHEN lf.descuento_aplicado > 0 THEN lf.id_linea END) * 100.0 / COUNT(*) as porcentaje_promocionado
FROM PRODUCTO p
JOIN LINEA_FACTURA lf ON p.id_producto = lf.id_producto
GROUP BY p.id_producto;
```

### Para PROMOCIONES:
```sql
-- Nº clientes impactados
SELECT 
  id_promocion,
  COUNT(DISTINCT id_cliente) as clientes_impactados
FROM PROMOCION_CLIENTE_LOG
WHERE fecha_enviada BETWEEN ? AND ?
GROUP BY id_promocion;

-- Escandallo de pack
SELECT 
  pp.id_promocion,
  SUM(p.escandallo_unitario * pp.cantidad) as escandallo_pack
FROM PROMOCION_PRODUCTO pp
JOIN PRODUCTO p ON pp.id_producto = p.id_producto
GROUP BY pp.id_promocion;
```

---

## 📡 EVENTOS PARA INTEGRACIÓN

### 🔵 Eventos de CLIENTES
```typescript
// Ver detalles de cliente
{
  evento: "CLIENTE_VISUALIZADO",
  payload: {
    id_cliente: string,
    seccion: "resumen" | "historial" | "promociones" | "favoritos",
    timestamp: Date
  }
}

// Ver historial
{
  evento: "HISTORIAL_CLIENTE_VISUALIZADO",
  payload: {
    id_cliente: string,
    filtros: { marca, pdv, periodo, canal },
    timestamp: Date
  }
}

// Enviar promoción
{
  evento: "PROMOCION_SELECCION_INICIADA",
  payload: {
    id_cliente: string,
    segmentos: string[],
    timestamp: Date
  }
}

// Crear cliente
{
  evento: "CLIENTE_CREADO",
  payload: {
    id_cliente: string (autogenerado),
    nombre_completo: string,
    telefono: string,
    email: string,
    timestamp: Date
  }
}
```

### 🟢 Eventos de PRODUCTOS
```typescript
// Ver producto
{
  evento: "PRODUCTO_VISUALIZADO",
  payload: {
    id_producto: string,
    timestamp: Date
  }
}

// Ver escandallo
{
  evento: "ESCANDALLO_VISUALIZADO",
  payload: {
    id_producto: string,
    timestamp: Date
  }
}

// Activar/Desactivar
{
  evento: "PRODUCTO_DESACTIVADO" | "PRODUCTO_ACTIVADO",
  payload: {
    id_producto: string,
    pdv_id: string | "todos",
    activo: boolean,
    timestamp: Date
  },
  sql: "UPDATE STOCK_PDV SET activo_en_pdv = ? WHERE id_producto = ? AND pdv_id = ?"
}

// Crear producto
{
  evento: "PRODUCTO_CREADO",
  payload: {
    id_producto: string (autogenerado PRD-XXX),
    nombre: string,
    categoria: string,
    pvp: number,
    escandallo_unitario: number,
    visible_tpv: boolean,
    visible_app: boolean,
    stock_pdv: [
      { pdv_id: string, stock_actual: number, stock_max: number, stock_min: number }
    ],
    timestamp: Date
  }
}
```

### 🟣 Eventos de PROMOCIONES
```typescript
// Crear promoción
{
  evento: "PROMOCION_CREADA",
  payload: {
    id_promocion: string (autogenerado),
    nombre: string,
    tipo: string,
    fecha_inicio: Date,
    fecha_fin: Date,
    productos: [
      { id_producto: string, cantidad: number, tipo_linea: string }
    ],
    aplica_marca: string,
    aplica_pdv: string[],
    segmentos_objetivo: string[],
    timestamp: Date
  }
}

// Activar/Desactivar promoción
{
  evento: "PROMOCION_ACTIVADA" | "PROMOCION_DESACTIVADA",
  payload: {
    id_promocion: string,
    estado: "activa" | "pausada",
    timestamp: Date
  }
}

// Aplicar promoción a cliente
{
  evento: "PROMOCION_APLICADA_A_CLIENTE",
  payload: {
    id_promocion: string,
    id_cliente: string,
    canal: "push" | "email" | "ticket",
    timestamp: Date
  },
  sql: "INSERT INTO PROMOCION_CLIENTE_LOG (id_promocion, id_cliente, fecha_enviada, canal) VALUES (?, ?, ?, ?)"
}
```

### 🟡 Eventos de FACTURACIÓN
```typescript
// Ver factura
{
  evento: "FACTURA_VISUALIZADA",
  payload: {
    id_factura: string,
    timestamp: Date
  }
}

// Ver cliente desde factura
{
  evento: "VER_CLIENTE_DESDE_FACTURA",
  payload: {
    id_factura: string,
    id_cliente: string,
    timestamp: Date
  }
}

// Descargar PDF Verifactu
{
  evento: "DESCARGAR_PDF_VERIFACTU",
  payload: {
    id_factura: string,
    timestamp: Date
  }
}
```

---

## 🔌 CONEXIÓN CON MAKE / BACKEND

### Flujo de integración:

1. **Frontend React** → Dispara evento con `console.log('📤 EVENTO: ...', payload)`
2. **Middleware** → Captura evento y envía a Make/Backend
3. **Make/Backend** → Ejecuta consulta SQL/API con filtros globales
4. **Backend** → Retorna datos JSON
5. **Frontend** → Actualiza UI con datos recibidos

### Ejemplo de consulta con filtros:
```javascript
// Endpoint: /api/clientes
async function getClientes(filtros) {
  const { marca, pdv, periodo, canal } = filtros;
  
  const query = `
    SELECT 
      c.*,
      COUNT(f.id_factura) as num_pedidos,
      SUM(f.total) / COUNT(f.id_factura) as ticket_medio,
      MAX(f.fecha) as fecha_ultimo_pedido
    FROM CLIENTE c
    LEFT JOIN FACTURA f ON c.id_cliente = f.id_cliente
    WHERE 1=1
      ${marca !== 'todas' ? 'AND f.marca = ?' : ''}
      ${pdv !== 'todos' ? 'AND f.pdv_id = ?' : ''}
      ${periodo ? 'AND f.fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)' : ''}
      ${canal !== 'todos' ? 'AND f.canal = ?' : ''}
    GROUP BY c.id_cliente
    ORDER BY fecha_ultimo_pedido DESC
  `;
  
  return await db.query(query, [marca, pdv, periodo, canal]);
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos
- [ ] Crear tablas: CLIENTE, FACTURA, LINEA_FACTURA, PRODUCTO, STOCK_PDV, PROMOCION, PROMOCION_PRODUCTO, PROMOCION_CLIENTE_LOG
- [ ] Crear índices recomendados
- [ ] Crear campos calculados (margen_porcentaje, rentabilidad)
- [ ] Insertar datos de prueba

### Fase 2: API / Endpoints
- [ ] GET /api/clientes (con filtros)
- [ ] GET /api/clientes/:id (detalles + historial)
- [ ] POST /api/clientes (crear cliente)
- [ ] GET /api/facturas (con filtros)
- [ ] GET /api/productos (con filtros + stock + ranking)
- [ ] GET /api/productos/:id (detalles + ventas + stock por PDV)
- [ ] POST /api/productos (crear producto)
- [ ] PATCH /api/productos/:id/activar (activar/desactivar)
- [ ] GET /api/promociones (con filtros)
- [ ] POST /api/promociones (crear promoción)
- [ ] POST /api/promociones/:id/aplicar (aplicar a cliente)

### Fase 3: Eventos
- [ ] Implementar sistema de eventos en frontend
- [ ] Conectar eventos con middleware
- [ ] Logging de eventos para analítica

### Fase 4: Testing
- [ ] Probar filtros globales en todas las pestañas
- [ ] Verificar cálculos (ticket medio, margen, ranking)
- [ ] Validar creación de clientes/productos/promociones
- [ ] Comprobar activación/desactivación

---

## 📞 SOPORTE

Este documento está vinculado al componente:
**`/components/gerente/ClientesGerente.tsx`**

Todos los comentarios técnicos en el código están marcados con:
- `🔌 EVENTO:` para eventos
- `📊 CONEXIÓN DATOS:` para queries
- `💡 Nota para el programador:` para indicaciones específicas

---

**Última actualización**: 26/11/2024  
**Versión**: 1.0  
**Autor**: Figma Make - Udar Edge Team
