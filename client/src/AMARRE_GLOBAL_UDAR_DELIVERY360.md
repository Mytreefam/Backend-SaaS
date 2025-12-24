# 🔗 AMARRE GLOBAL UDAR DELIVERY360

**Proyecto:** UDAR Edge - Sistema SaaS Multiempresa Delivery360  
**Cliente Base:** PAU (Hostelería - PIZZAS + BURGUERS en TIANA + BADALONA)  
**Versión:** 1.0 CONSOLIDADO  
**Fecha:** 26 Noviembre 2024

---

## 🎯 OBJETIVO

**Estructurar todos los componentes del proyecto Figma para que estén 100% listos para:**
1. Conectarse a la BBDD (mapeo 1:1)
2. Ejecutar cálculos internos (ingresos, costes, EBITDA, productividad)
3. Funcionar con arquitectura multiempresa (Empresa → Marca → Punto de Venta)

---

## 📐 REGLA DE ORO (OBLIGATORIA EN TODO EL SISTEMA)

### Todas las entidades de negocio DEBEN incluir (cuando aplique):

```typescript
{
  empresaId: string;      // Obligatorio en TODAS las entidades de negocio
  marcaId?: string;       // Obligatorio cuando el dato es específico de marca
  puntoVentaId?: string;  // Obligatorio cuando el dato es específico de punto de venta
}
```

### Todos los informes y cálculos DEBEN poder filtrarse por:

1. **Empresa** (todas, específica)
2. **Marca** (todas, específica)
3. **Punto de Venta** (todos, específico)
4. **Periodo** (día, mes, año, rango custom)

---

## 🏢 ESTRUCTURA REAL DEL CLIENTE PAU

```
EMPRESA MADRE: PAU S.L.
│
└── EMPRESA 1: Hostelería
    │
    ├── MARCA 1: PIZZAS
    │   ├── Punto de Venta 1: TIANA
    │   └── Punto de Venta 2: BADALONA
    │
    └── MARCA 2: BURGUERS
        ├── Punto de Venta 1: TIANA
        └── Punto de Venta 2: BADALONA
```

**IDs Ejemplo:**
- Empresa: `EMP-001` (Hostelería)
- Marcas: `MRC-001` (PIZZAS), `MRC-002` (BURGUERS)
- Puntos de Venta: `PDV-001` (Tiana), `PDV-002` (Badalona)

---

## 📊 MODELO DE DATOS COMPLETO

### MÓDULO 1: CONFIGURACIÓN

#### 1.1. USUARIO

**Tabla:** `usuarios`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `usuario_id` | VARCHAR(50) | ✅ | "USR-001" | PK |
| `nombre_completo` | VARCHAR(255) | ✅ | "Carlos Martínez" | Nombre completo |
| `email` | VARCHAR(255) | ✅ | "carlos@pau.com" | Email único |
| `telefono` | VARCHAR(20) | ❌ | "+34 600123456" | Teléfono |
| `password_hash` | VARCHAR(255) | ✅ | "hash..." | Password hasheado |
| `rol` | ENUM | ✅ | "gerente_general" | Ver valores abajo |
| `empresa_defecto_id` | VARCHAR(50) | ❌ | "EMP-001" | FK - Contexto por defecto |
| `marca_defecto_id` | VARCHAR(50) | ❌ | "MRC-001" | FK - Contexto por defecto |
| `punto_venta_defecto_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Contexto por defecto |
| `avatar_url` | TEXT | ❌ | "https://..." | URL imagen |
| `activo` | BOOLEAN | ✅ | true | Usuario activo |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Valores `rol`:**
- `gerente_general` - Ve TODAS las empresas
- `gerente_empresa` - Ve solo su empresa
- `gerente_marca` - Ve solo su marca
- `gerente_punto_venta` - Ve solo su punto de venta
- `trabajador` - Asignado a punto(s) de venta
- `cliente` - Solo hace pedidos

**Uso del contexto por defecto:**
Cuando el usuario entra al sistema, se carga automáticamente:
- Dashboard de su `empresa_defecto_id`
- Filtros preseleccionados con `marca_defecto_id` y `punto_venta_defecto_id`

---

#### 1.2. EMPRESA

**Tabla:** `empresas`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | PK |
| `nombre_fiscal` | VARCHAR(255) | ✅ | "PAU Hostelería S.L." | Razón social |
| `cif` | VARCHAR(20) | ✅ | "B12345678" | CIF único |
| `domicilio_fiscal` | TEXT | ✅ | "Av. Diagonal 100" | Dirección fiscal |
| `nombre_comercial` | VARCHAR(200) | ✅ | "PAU Hostelería" | Nombre comercial |
| `convenio_colectivo_id` | VARCHAR(50) | ❌ | "CONV-001" | FK convenio |
| `empresa_activa` | BOOLEAN | ✅ | true | Estado |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Relaciones:**
- Empresa → Marcas (1:N)
- Empresa → Puntos de Venta (1:N)
- Empresa → Cuentas Bancarias (1:N)
- Empresa → Agentes Externos (1:N)

---

#### 1.3. MARCA

**Tabla:** `marcas`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa padre |
| `nombre_marca` | VARCHAR(200) | ✅ | "PIZZAS" | Nombre marca |
| `codigo_marca` | VARCHAR(50) | ✅ | "MRC-001" | Código único |
| `color_identidad` | VARCHAR(7) | ❌ | "#FF5733" | Color hex |
| `activo` | BOOLEAN | ✅ | true | Estado |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Relaciones:**
- Marca → Empresa (N:1)
- Marca → Puntos de Venta (1:N)
- Marca → Productos (1:N)

**Regla:** No se puede eliminar una marca si tiene puntos de venta vinculados.

---

#### 1.4. PUNTO_VENTA

**Tabla:** `puntos_venta`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `punto_venta_id` | VARCHAR(50) | ✅ | "PDV-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | FK - Marca (OBLIGATORIO) |
| `nombre_punto_venta` | VARCHAR(200) | ✅ | "Tiana" | Nombre comercial |
| `direccion` | TEXT | ✅ | "Calle Mayor 45" | Dirección completa |
| `codigo_postal` | VARCHAR(10) | ✅ | "08391" | CP |
| `ciudad` | VARCHAR(100) | ✅ | "Tiana" | Ciudad |
| `telefono` | VARCHAR(20) | ✅ | "+34 931234567" | Teléfono |
| `email` | VARCHAR(255) | ✅ | "tiana@pizzas.com" | Email |
| `activo` | BOOLEAN | ✅ | true | Estado |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Relaciones:**
- Punto de Venta → Empresa (N:1)
- Punto de Venta → Marca (N:1)
- Punto de Venta → Pedidos (1:N)
- Punto de Venta → Horas Trabajadas (1:N)

**Regla CRÍTICA:** No se puede crear un Punto de Venta sin asociarlo a una Marca.

---

#### 1.5. CUENTA_BANCARIA

**Tabla:** `cuentas_bancarias`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `cuenta_bancaria_id` | VARCHAR(50) | ✅ | "CTA-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `iban` | VARCHAR(34) | ✅ | "ES91..." | IBAN |
| `alias_cuenta` | VARCHAR(100) | ✅ | "Cuenta principal" | Alias |
| `es_cuenta_principal` | BOOLEAN | ✅ | true | Principal |
| `activo` | BOOLEAN | ✅ | true | Estado |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |

**Relaciones:**
- Cuenta Bancaria → Empresa (N:1)

---

#### 1.6. AGENTE_EXTERNO

**Tabla:** `agentes_externos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `agente_externo_id` | VARCHAR(50) | ✅ | "AGE-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa (OBLIGATORIO) |
| `marca_id` | VARCHAR(50) | ❌ | "MRC-001" | FK - Marca (OPCIONAL) |
| `punto_venta_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Punto Venta (OPCIONAL) |
| `nombre` | VARCHAR(255) | ✅ | "Harinas del Norte" | Nombre agente |
| `tipo` | ENUM | ✅ | "Proveedor" | Ver valores abajo |
| `email` | VARCHAR(255) | ✅ | "contacto@proveedor.com" | Email |
| `telefono` | VARCHAR(20) | ✅ | "+34 900123456" | Teléfono |
| `permisos` | JSON | ✅ | {...} | Ver estructura abajo |
| `estado` | ENUM | ✅ | "Activo" | Activo/Inactivo |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |

**Valores `tipo`:**
- `Proveedor`
- `Gestor`
- `Auditor`
- `Otros`

**Estructura `permisos` (JSON):**
```json
{
  "recibirPedidos": true,
  "entregarAlbaranes": true,
  "exportarFacturacion": false,
  "recibirFacturas": true,
  "verInventario": false,
  "editarProductos": false
}
```

**Relaciones:**
- Agente → Empresa (N:1) - OBLIGATORIO
- Agente → Marca (N:1) - OPCIONAL
- Agente → Punto de Venta (N:1) - OPCIONAL

**Regla:** Un agente SIEMPRE tiene `empresa_id`. `marca_id` y `punto_venta_id` son opcionales.

---

#### 1.7. PRESUPUESTO

**Tabla:** `presupuestos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `presupuesto_id` | VARCHAR(50) | ✅ | "PRE-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ❌ | "MRC-001" | FK - Marca (NULL = todas) |
| `punto_venta_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Punto Venta (NULL = todos) |
| `anio` | INT | ✅ | 2024 | Año presupuesto |
| `mes` | INT | ❌ | 11 | Mes (NULL = anual) |
| `concepto_general` | VARCHAR(100) | ✅ | "Ingresos netos" | Ver conceptos abajo |
| `subconcepto` | VARCHAR(100) | ❌ | "Ventas local" | Detalle |
| `importe_objetivo` | DECIMAL(10,2) | ✅ | 45000.00 | Objetivo |
| `importe_real` | DECIMAL(10,2) | ❌ | 42500.00 | Real (se calcula) |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Valores `concepto_general`:**
- Ingresos netos
- Coste de ventas
- Margen bruto
- Gastos operativos
- Costes estructurales
- EBITDA

**Niveles de presupuesto:**
1. **Totales empresa**: `marca_id` = NULL, `punto_venta_id` = NULL
2. **Por marca**: `marca_id` = "MRC-001", `punto_venta_id` = NULL
3. **Por punto de venta**: `marca_id` = "MRC-001", `punto_venta_id` = "PDV-001"

**Filtros UI obligatorios:**
- Selector Empresa
- Selector Marca
- Selector Punto de Venta
- Selector Año
- Selector Mes (opcional para anual)

---

### MÓDULO 2: PRODUCTOS Y NEGOCIO

#### 2.1. PRODUCTO

**Tabla:** `productos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `producto_id` | VARCHAR(50) | ✅ | "PRD-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | FK - Marca |
| `punto_venta_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Punto Venta (si catálogo por tienda) |
| `nombre_producto` | VARCHAR(255) | ✅ | "Pizza Margarita" | Nombre |
| `tipo` | ENUM | ✅ | "ProductoVenta" | Ver valores abajo |
| `categoria` | VARCHAR(100) | ✅ | "Pizzas" | Categoría |
| `precio_venta` | DECIMAL(10,2) | ✅ | 12.50 | Precio sin IVA |
| `descripcion` | TEXT | ❌ | "Pizza clásica..." | Descripción |
| `imagen_url` | TEXT | ❌ | "https://..." | Imagen |
| `activo` | BOOLEAN | ✅ | true | Disponible |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Valores `tipo`:**
- `ProductoVenta` - Producto que se vende al cliente
- `ArticuloCompra` - Artículo que se compra a proveedores

**Relaciones:**
- Producto → Empresa (N:1)
- Producto → Marca (N:1)
- Producto → Punto de Venta (N:1) - OPCIONAL
- Producto → Escandallo (1:N)
- Producto → Líneas de Pedido (1:N)

**Niveles de catálogo:**
1. **Global empresa**: `punto_venta_id` = NULL (mismo catálogo en todos los puntos)
2. **Por punto de venta**: `punto_venta_id` = "PDV-001" (catálogos diferentes)

---

#### 2.2. ESCANDALLO_PRODUCTO (Coste Variable)

**Tabla:** `escandallos_productos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `escandallo_id` | VARCHAR(50) | ✅ | "ESC-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | FK - Marca |
| `punto_venta_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Punto Venta |
| `producto_id` | VARCHAR(50) | ✅ | "PRD-001" | FK - Producto |
| `articulo_compra_id` | VARCHAR(50) | ✅ | "ART-001" | FK - Artículo de compra |
| `cantidad_necesaria` | DECIMAL(10,3) | ✅ | 0.250 | Cantidad (ej. 250g) |
| `unidad_medida` | VARCHAR(50) | ✅ | "kg" | Unidad |
| `costo_unitario` | DECIMAL(10,2) | ✅ | 1.20 | Coste por unidad |
| `costo_total` | DECIMAL(10,2) | ✅ | 0.30 | cantidad × costo_unitario |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Cálculo del coste variable por producto:**
```sql
SELECT 
  producto_id,
  SUM(costo_total) as costo_variable_unitario
FROM escandallos_productos
WHERE producto_id = 'PRD-001'
GROUP BY producto_id;
```

**Ejemplo Pizza Margarita:**
```
Harina: 0.250kg × 1.20€/kg = 0.30€
Tomate: 0.100kg × 2.50€/kg = 0.25€
Queso: 0.150kg × 8.00€/kg = 1.20€
...
TOTAL COSTE VARIABLE = 4.20€
```

**Relaciones:**
- Escandallo → Producto (N:1)
- Escandallo → Artículo Compra (N:1)

---

#### 2.3. PEDIDO

**Tabla:** `pedidos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `pedido_id` | VARCHAR(50) | ✅ | "PED-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | FK - Marca |
| `punto_venta_id` | VARCHAR(50) | ✅ | "PDV-001" | FK - Punto Venta (OBLIGATORIO) |
| `cliente_id` | VARCHAR(50) | ❌ | "USR-005" | FK - Usuario cliente |
| `trabajador_id` | VARCHAR(50) | ❌ | "USR-008" | FK - Usuario trabajador |
| `fecha_hora_pedido` | TIMESTAMP | ✅ | "2024-11-26 14:30" | Fecha/hora |
| `estado` | ENUM | ✅ | "Entregado" | Ver valores abajo |
| `canal` | ENUM | ✅ | "Local" | Ver valores abajo |
| `importe_bruto` | DECIMAL(10,2) | ✅ | 37.50 | Bruto sin IVA |
| `iva` | DECIMAL(10,2) | ✅ | 7.88 | IVA (21%) |
| `importe_neto` | DECIMAL(10,2) | ✅ | 45.38 | Bruto + IVA |
| `costo_variable_total` | DECIMAL(10,2) | ✅ | 15.75 | Suma costes líneas |
| `margen_bruto` | DECIMAL(10,2) | ✅ | 21.75 | importe_bruto - costo_variable |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |
| `updated_at` | TIMESTAMP | ✅ | auto | Fecha actualización |

**Valores `estado`:**
- `Pendiente`
- `En preparación`
- `Listo`
- `Entregado`
- `Completado`
- `Cancelado`

**Valores `canal`:**
- `Local` - Comer en local
- `Delivery` - A domicilio
- `TakeAway` - Para llevar
- `PlataformaExterna` - Glovo, Uber Eats, etc.

**Relaciones:**
- Pedido → Empresa (N:1)
- Pedido → Marca (N:1)
- Pedido → Punto de Venta (N:1)
- Pedido → Cliente (N:1)
- Pedido → Trabajador (N:1)
- Pedido → Líneas Pedido (1:N)

**Cálculos derivados:**
```javascript
costo_variable_total = SUM(lineas_pedido.costo_variable_linea)
margen_bruto = importe_bruto - costo_variable_total
```

---

#### 2.4. LINEA_PEDIDO

**Tabla:** `lineas_pedido`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `linea_pedido_id` | VARCHAR(50) | ✅ | "LP-001" | PK |
| `pedido_id` | VARCHAR(50) | ✅ | "PED-001" | FK - Pedido |
| `producto_id` | VARCHAR(50) | ✅ | "PRD-001" | FK - Producto |
| `cantidad` | INT | ✅ | 3 | Cantidad |
| `precio_unitario` | DECIMAL(10,2) | ✅ | 12.50 | Precio sin IVA |
| `importe_linea` | DECIMAL(10,2) | ✅ | 37.50 | cantidad × precio_unitario |
| `costo_variable_linea` | DECIMAL(10,2) | ✅ | 12.60 | cantidad × costo_unitario_producto |
| `notas` | TEXT | ❌ | "Sin cebolla" | Notas cliente |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |

**Relaciones:**
- Línea Pedido → Pedido (N:1)
- Línea Pedido → Producto (N:1)

**Cálculos:**
```javascript
importe_linea = cantidad × precio_unitario
costo_variable_linea = cantidad × costo_unitario_producto
```

**Ejemplo:**
```
3 × Pizza Margarita (12.50€ c/u, coste 4.20€ c/u)
importe_linea = 3 × 12.50 = 37.50€
costo_variable_linea = 3 × 4.20 = 12.60€
margen_bruto_linea = 37.50 - 12.60 = 24.90€
```

---

### MÓDULO 3: RRHH Y COSTES

#### 3.1. HORAS_TRABAJADAS

**Tabla:** `horas_trabajadas`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `registro_horas_id` | VARCHAR(50) | ✅ | "RH-001" | PK |
| `trabajador_id` | VARCHAR(50) | ✅ | "USR-008" | FK - Usuario trabajador |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ❌ | "MRC-001" | FK - Marca |
| `punto_venta_id` | VARCHAR(50) | ✅ | "PDV-001" | FK - Punto Venta |
| `fecha` | DATE | ✅ | "2024-11-26" | Fecha |
| `hora_entrada` | TIME | ✅ | "08:00:00" | Hora entrada |
| `hora_salida` | TIME | ❌ | "16:00:00" | Hora salida |
| `horas_totales` | DECIMAL(4,2) | ❌ | 8.00 | Horas (calculado) |
| `tipo_hora` | ENUM | ✅ | "ordinaria" | Ver valores abajo |
| `notas` | TEXT | ❌ | "Todo ok" | Notas |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |

**Valores `tipo_hora`:**
- `ordinaria`
- `extra`
- `baja_no_remunerada`
- `vacaciones`
- `festivo`

**Relaciones:**
- Horas Trabajadas → Trabajador (N:1)
- Horas Trabajadas → Punto de Venta (N:1)

**Cálculo automático:**
```javascript
horas_totales = TIMESTAMPDIFF(HOUR, hora_entrada, hora_salida)
```

---

#### 3.2. COSTE_FIJO

**Tabla:** `costes_fijos`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `coste_fijo_id` | VARCHAR(50) | ✅ | "CF-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ❌ | "MRC-001" | FK - Marca |
| `punto_venta_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Punto Venta |
| `nombre_coste` | VARCHAR(255) | ✅ | "Alquiler local" | Concepto |
| `periodicidad` | ENUM | ✅ | "mensual" | Ver valores abajo |
| `importe_periodo` | DECIMAL(10,2) | ✅ | 2500.00 | Importe |
| `metodo_reparto` | ENUM | ✅ | "por_ventas" | Ver valores abajo |
| `activo` | BOOLEAN | ✅ | true | Estado |
| `fecha_inicio` | DATE | ✅ | "2020-06-01" | Inicio |
| `fecha_fin` | DATE | ❌ | null | Fin (null = indefinido) |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |

**Valores `periodicidad`:**
- `mensual`
- `anual`
- `trimestral`

**Valores `metodo_reparto`:**
- `por_ventas` - Reparte proporcionalmente según ventas
- `por_porcentaje_fijo` - % fijo por punto de venta
- `por_numero_pedidos` - Según nº de pedidos
- `directo` - Asignado directamente a un punto de venta

**Niveles de coste:**
1. **Coste empresa**: `punto_venta_id` = NULL (se reparte entre puntos)
2. **Coste punto de venta**: `punto_venta_id` = "PDV-001" (directo)

**Ejemplo reparto por ventas:**
```
Coste fijo total empresa: 10.000€/mes
Ventas Tiana: 30.000€ (60%)
Ventas Badalona: 20.000€ (40%)

Coste imputado Tiana: 10.000€ × 60% = 6.000€
Coste imputado Badalona: 10.000€ × 40% = 4.000€
```

---

### MÓDULO 4: FACTURACIÓN

#### 4.1. FACTURA

**Tabla:** `facturas`

| Campo | Tipo | Obligatorio | Ejemplo | Descripción |
|-------|------|-------------|---------|-------------|
| `factura_id` | VARCHAR(50) | ✅ | "FAC-001" | PK |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-001" | FK - Empresa |
| `marca_id` | VARCHAR(50) | ❌ | "MRC-001" | FK - Marca |
| `punto_venta_id` | VARCHAR(50) | ❌ | "PDV-001" | FK - Punto Venta |
| `pedido_id` | VARCHAR(50) | ❌ | "PED-001" | FK - Pedido (si aplica) |
| `numero_factura` | VARCHAR(100) | ✅ | "2024/001" | Nº factura |
| `fecha_factura` | DATE | ✅ | "2024-11-26" | Fecha |
| `cliente_nombre` | VARCHAR(255) | ✅ | "Cliente XYZ" | Nombre cliente |
| `cliente_cif` | VARCHAR(20) | ❌ | "B12345678" | CIF cliente |
| `importe_total` | DECIMAL(10,2) | ✅ | 121.00 | Total con IVA |
| `iva` | DECIMAL(10,2) | ✅ | 21.00 | IVA |
| `forma_pago` | ENUM | ✅ | "TPV" | Ver valores abajo |
| `estado_cobro` | ENUM | ✅ | "Cobrado" | Ver valores abajo |
| `pdf_url` | TEXT | ❌ | "https://..." | URL PDF |
| `created_at` | TIMESTAMP | ✅ | auto | Fecha creación |

**Valores `forma_pago`:**
- `TPV` - Tarjeta TPV
- `Efectivo`
- `Transferencia`
- `PasarelaOnline` - Stripe, PayPal, etc.

**Valores `estado_cobro`:**
- `Pendiente`
- `Cobrado`
- `Parcialmente_cobrado`
- `Devuelto`

**Relaciones:**
- Factura → Empresa (N:1)
- Factura → Marca (N:1)
- Factura → Punto de Venta (N:1)
- Factura → Pedido (N:1)

---

## 🧮 CÁLCULOS CLAVE

### 1. INGRESOS

#### Por Empresa
```sql
SELECT 
  empresa_id,
  SUM(importe_bruto) as ingresos_totales
FROM pedidos
WHERE empresa_id = 'EMP-001'
  AND estado IN ('Completado', 'Entregado')
  AND fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
GROUP BY empresa_id;
```

#### Por Marca
```sql
SELECT 
  empresa_id,
  marca_id,
  SUM(importe_bruto) as ingresos_marca
FROM pedidos
WHERE empresa_id = 'EMP-001'
  AND marca_id = 'MRC-001'
  AND estado IN ('Completado', 'Entregado')
  AND fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
GROUP BY empresa_id, marca_id;
```

#### Por Punto de Venta
```sql
SELECT 
  empresa_id,
  marca_id,
  punto_venta_id,
  SUM(importe_bruto) as ingresos_punto_venta
FROM pedidos
WHERE empresa_id = 'EMP-001'
  AND punto_venta_id = 'PDV-001'
  AND estado IN ('Completado', 'Entregado')
  AND fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
GROUP BY empresa_id, marca_id, punto_venta_id;
```

---

### 2. COSTE VARIABLE POR PEDIDO

```sql
SELECT 
  p.pedido_id,
  p.importe_bruto,
  p.costo_variable_total,
  p.margen_bruto,
  (p.margen_bruto / p.importe_bruto * 100) as margen_porcentaje
FROM pedidos p
WHERE p.pedido_id = 'PED-001';
```

**Fórmula:**
```javascript
costo_variable_total = SUM(lineas_pedido.costo_variable_linea)
margen_bruto = importe_bruto - costo_variable_total
margen_porcentaje = (margen_bruto / importe_bruto) × 100
```

---

### 3. COSTE FIJO IMPUTADO

```sql
-- Obtener ingresos por punto de venta
WITH ingresos_ptv AS (
  SELECT 
    punto_venta_id,
    SUM(importe_bruto) as ingresos
  FROM pedidos
  WHERE empresa_id = 'EMP-001'
    AND fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
  GROUP BY punto_venta_id
),
-- Calcular reparto proporcional
reparto AS (
  SELECT 
    punto_venta_id,
    ingresos,
    ingresos / SUM(ingresos) OVER () as porcentaje
  FROM ingresos_ptv
)
-- Aplicar coste fijo
SELECT 
  r.punto_venta_id,
  cf.nombre_coste,
  cf.importe_periodo,
  cf.importe_periodo * r.porcentaje as coste_imputado
FROM reparto r
CROSS JOIN costes_fijos cf
WHERE cf.empresa_id = 'EMP-001'
  AND cf.punto_venta_id IS NULL
  AND cf.metodo_reparto = 'por_ventas';
```

---

### 4. EBITDA SIMPLIFICADO MENSUAL

```sql
WITH ingresos AS (
  SELECT 
    empresa_id,
    punto_venta_id,
    SUM(importe_bruto) as total_ingresos
  FROM pedidos
  WHERE fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
  GROUP BY empresa_id, punto_venta_id
),
costes_variables AS (
  SELECT 
    empresa_id,
    punto_venta_id,
    SUM(costo_variable_total) as total_costes_variables
  FROM pedidos
  WHERE fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
  GROUP BY empresa_id, punto_venta_id
),
costes_fijos AS (
  SELECT 
    empresa_id,
    punto_venta_id,
    SUM(importe_periodo) as total_costes_fijos
  FROM costes_fijos
  WHERE activo = true
  GROUP BY empresa_id, punto_venta_id
)
SELECT 
  i.empresa_id,
  i.punto_venta_id,
  i.total_ingresos,
  cv.total_costes_variables,
  cf.total_costes_fijos,
  (i.total_ingresos - cv.total_costes_variables - cf.total_costes_fijos) as ebitda
FROM ingresos i
LEFT JOIN costes_variables cv ON i.punto_venta_id = cv.punto_venta_id
LEFT JOIN costes_fijos cf ON i.punto_venta_id = cf.punto_venta_id;
```

**Fórmula:**
```
EBITDA = Ingresos - Costes Variables - Costes Fijos
```

---

### 5. PRODUCTIVIDAD POR TRABAJADOR

```sql
WITH pedidos_trabajador AS (
  SELECT 
    trabajador_id,
    punto_venta_id,
    COUNT(*) as num_pedidos,
    SUM(importe_bruto) as ventas_totales
  FROM pedidos
  WHERE trabajador_id IS NOT NULL
    AND fecha_hora_pedido BETWEEN '2024-11-01' AND '2024-11-30'
  GROUP BY trabajador_id, punto_venta_id
),
horas_trabajador AS (
  SELECT 
    trabajador_id,
    punto_venta_id,
    SUM(horas_totales) as horas_trabajadas
  FROM horas_trabajadas
  WHERE fecha BETWEEN '2024-11-01' AND '2024-11-30'
  GROUP BY trabajador_id, punto_venta_id
)
SELECT 
  p.trabajador_id,
  u.nombre_completo,
  p.punto_venta_id,
  p.num_pedidos,
  p.ventas_totales,
  h.horas_trabajadas,
  (p.ventas_totales / p.num_pedidos) as ticket_medio,
  (p.ventas_totales / h.horas_trabajadas) as ventas_por_hora,
  (p.num_pedidos / h.horas_trabajadas) as pedidos_por_hora
FROM pedidos_trabajador p
LEFT JOIN horas_trabajador h ON p.trabajador_id = h.trabajador_id
LEFT JOIN usuarios u ON p.trabajador_id = u.usuario_id;
```

**KPIs por trabajador:**
- Nº pedidos gestionados
- Ventas totales
- Horas trabajadas
- Ticket medio = ventas / pedidos
- Ventas por hora = ventas / horas
- Pedidos por hora = pedidos / horas

---

## 🔐 PERMISOS POR ROL

| Rol | Ve Empresas | Ve Marcas | Ve Puntos Venta | Filtros Disponibles |
|-----|-------------|-----------|-----------------|---------------------|
| **gerente_general** | ✅ Todas | ✅ Todas | ✅ Todos | Empresa, Marca, PTV, Periodo |
| **gerente_empresa** | Solo su empresa | Solo su empresa | Solo su empresa | Marca, PTV, Periodo |
| **gerente_marca** | No | Solo su marca | Solo su marca | PTV, Periodo |
| **gerente_punto_venta** | No | No | Solo su PTV | Periodo |
| **trabajador** | No | No | Solo asignados | Periodo (solo vista) |
| **cliente** | No | No | No | Solo sus pedidos |

**Implementación filtros:**
```javascript
// Según rol del usuario logueado
const obtenerFiltrosDisponibles = (usuario) => {
  switch (usuario.rol) {
    case 'gerente_general':
      return {
        empresas: obtenerTodasEmpresas(),
        marcas: obtenerTodasMarcas(),
        puntosVenta: obtenerTodosPuntosVenta()
      };
    
    case 'gerente_empresa':
      return {
        empresas: [usuario.empresa_defecto_id],
        marcas: obtenerMarcasPorEmpresa(usuario.empresa_defecto_id),
        puntosVenta: obtenerPuntosVentaPorEmpresa(usuario.empresa_defecto_id)
      };
    
    case 'gerente_marca':
      return {
        empresas: [usuario.empresa_defecto_id],
        marcas: [usuario.marca_defecto_id],
        puntosVenta: obtenerPuntosVentaPorMarca(usuario.marca_defecto_id)
      };
    
    case 'gerente_punto_venta':
      return {
        empresas: [usuario.empresa_defecto_id],
        marcas: [usuario.marca_defecto_id],
        puntosVenta: [usuario.punto_venta_defecto_id]
      };
    
    default:
      return { empresas: [], marcas: [], puntosVenta: [] };
  }
};
```

---

## 📝 CHECKLIST PARA EL PROGRAMADOR

### ✅ Configuración de Tablas BBDD

- [ ] Tabla `usuarios` con campos contexto por defecto
- [ ] Tabla `empresas`
- [ ] Tabla `marcas` con FK a empresas
- [ ] Tabla `puntos_venta` con FK a empresas y marcas
- [ ] Tabla `cuentas_bancarias` con FK a empresas
- [ ] Tabla `agentes_externos` con FK a empresas (marcas y PTV opcionales)
- [ ] Tabla `presupuestos` con FK a empresas, marcas y PTV
- [ ] Tabla `productos` con FK a empresas, marcas (PTV opcional)
- [ ] Tabla `escandallos_productos` con FK a productos
- [ ] Tabla `pedidos` con FK a empresas, marcas y PTV (OBLIGATORIO)
- [ ] Tabla `lineas_pedido` con FK a pedidos y productos
- [ ] Tabla `horas_trabajadas` con FK a trabajadores y PTV
- [ ] Tabla `costes_fijos` con FK a empresas (marcas y PTV opcionales)
- [ ] Tabla `facturas` con FK a empresas, marcas y PTV

### ✅ Validaciones de Integridad

- [ ] No se puede crear Punto de Venta sin Marca
- [ ] No se puede eliminar Marca con Puntos de Venta vinculados
- [ ] Todos los Pedidos deben tener empresa_id, marca_id y punto_venta_id
- [ ] Agentes externos siempre tienen empresa_id (marca y PTV opcionales)
- [ ] CIF único por empresa
- [ ] Email único por usuario

### ✅ Filtros en UI

- [ ] Todos los módulos de negocio tienen filtros: Empresa, Marca, Punto de Venta, Periodo
- [ ] Filtros dinámicos según rol de usuario
- [ ] Contexto por defecto cargado al iniciar sesión

### ✅ Cálculos Implementados

- [ ] Ingresos por Empresa/Marca/Punto de Venta/Periodo
- [ ] Coste variable por pedido (automático al crear pedido)
- [ ] Margen bruto por pedido (automático)
- [ ] Coste fijo imputado según método de reparto
- [ ] EBITDA mensual por punto de venta
- [ ] Productividad por trabajador

### ✅ APIs Necesarias

```
GET    /api/empresas
POST   /api/empresas
GET    /api/marcas?empresa_id={id}
POST   /api/marcas
GET    /api/puntos-venta?marca_id={id}
POST   /api/puntos-venta
GET    /api/productos?empresa_id={id}&marca_id={id}
POST   /api/productos
GET    /api/pedidos?empresa_id={id}&marca_id={id}&punto_venta_id={id}&periodo={periodo}
POST   /api/pedidos
GET    /api/calculos/ingresos?empresa_id={id}&marca_id={id}&punto_venta_id={id}&periodo={periodo}
GET    /api/calculos/ebitda?empresa_id={id}&punto_venta_id={id}&mes={mes}
GET    /api/calculos/productividad?trabajador_id={id}&periodo={periodo}
```

---

## 🎉 CONCLUSIÓN

**Este documento es la FUENTE DE VERDAD para todo el proyecto Udar Delivery360.**

**Todas las pantallas, componentes y tablas deben:**
1. Usar estos nombres de campos exactos
2. Incluir empresa_id, marca_id, punto_venta_id cuando aplique
3. Permitir filtros por Empresa/Marca/Punto de Venta/Periodo
4. Respetar las relaciones FK definidas
5. Implementar las validaciones de integridad
6. Calcular los KPIs según las fórmulas SQL especificadas

**El programador puede mapear 1:1 contra este documento para:**
- Crear las tablas BBDD
- Implementar las APIs
- Conectar los componentes Figma
- Calcular los KPIs automáticamente

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 1.0 CONSOLIDADO  
**Estado:** ✅ Arquitectura Completa y Consolidada
