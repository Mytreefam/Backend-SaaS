# 🏢 ARQUITECTURA MULTIEMPRESA SAAS - UDAR EDGE

**Proyecto:** Udar Edge - Sistema SaaS Multiempresa  
**Cliente Base:** PAU (Hostelería, Eventos, Construcción)  
**Versión:** 1.0  
**Fecha:** 26 Noviembre 2024

---

## 📋 ÍNDICE

1. [Estructura de Datos](#1-estructura-de-datos)
2. [Cálculos Internos CORE](#2-cálculos-internos-core)
3. [Vistas y Permisos por Rol](#3-vistas-y-permisos-por-rol)
4. [Automatizaciones Make CORE](#4-automatizaciones-make-core)
5. [Validación y Optimizaciones CORE](#5-validación-y-optimizaciones-core)

---

## 🎯 CONTEXTO DEL CLIENTE (CASO BASE)

```
EMPRESA MADRE: PAU
│
├── EMPRESA 1: HOSTELERÍA
│   ├── MARCAS:
│   │   ├── M1: PIZZAS
│   │   └── M2: BURGUERS
│   └── PUNTOS DE VENTA:
│       ├── PV1: TIANA
│       └── PV2: BADALONA
│
├── EMPRESA 2: EVENTOS (futura)
│
└── EMPRESA 3: CONSTRUCCIÓN (futura)
```

---

## 1. ESTRUCTURA DE DATOS

### 🔑 REGLA DE ORO

**TODAS las entidades incluyen:**
- `empresa_id` (VARCHAR(50))
- `marca_id` (VARCHAR(50)) - cuando aplique
- `punto_venta_id` (VARCHAR(50)) - cuando aplique

**TODOS los filtros permiten:**
- Por Empresa
- Por Marca
- Por Punto de Venta
- Por Fecha/Periodo (día, mes, año)

---

### 📊 ENTIDADES

#### 1.1. EMPRESA_MADRE

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `empresa_madre_id` | VARCHAR(50) | "EM-001" | ✅ | - | `empresaMadreId` |
| `razon_social` | VARCHAR(255) | "PAU S.L." | ✅ | - | `razonSocial` |
| `cif` | VARCHAR(20) | "B12345678" | ✅ | - | `cif` |
| `domicilio_fiscal` | TEXT | "Calle Principal 123" | ✅ | - | `domicilioFiscal` |
| `fecha_creacion` | DATE | "2019-01-15" | ✅ | - | `fechaCreacion` |
| `logo_url` | TEXT | "https://..." | ❌ | - | `logoUrl` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Ejemplo:**
```json
{
  "empresa_madre_id": "EM-001",
  "razon_social": "PAU S.L.",
  "cif": "B12345678",
  "domicilio_fiscal": "Av. Diagonal 100, Barcelona",
  "fecha_creacion": "2019-01-15",
  "activo": true
}
```

---

#### 1.2. EMPRESA

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | `empresa_madre_id` | `empresaId` |
| `empresa_madre_id` | VARCHAR(50) | "EM-001" | ✅ | FK | `empresaMadreId` |
| `nombre` | VARCHAR(200) | "Hostelería" | ✅ | - | `nombre` |
| `tipo_negocio` | ENUM | "hosteleria" | ✅ | - | `tipoNegocio` |
| `descripcion` | TEXT | "Restauración..." | ❌ | - | `descripcion` |
| `fecha_inicio` | DATE | "2020-01-01" | ✅ | - | `fechaInicio` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Valores `tipo_negocio`:**
- `hosteleria`
- `eventos`
- `construccion`
- `retail`
- `servicios`

**Ejemplo:**
```json
{
  "empresa_id": "EMP-001",
  "empresa_madre_id": "EM-001",
  "nombre": "Hostelería",
  "tipo_negocio": "hosteleria",
  "descripcion": "División de restauración de PAU",
  "fecha_inicio": "2020-01-01",
  "activo": true
}
```

---

#### 1.3. MARCA

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `marca_id` | VARCHAR(50) | "MRC-001" | ✅ | `empresa_id` | `marcaId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `nombre_comercial` | VARCHAR(200) | "PIZZAS" | ✅ | - | `nombreComercial` |
| `nombre_fiscal` | VARCHAR(255) | "Pizzas PAU S.L." | ✅ | - | `nombreFiscal` |
| `cif` | VARCHAR(20) | "B87654321" | ❌ | - | `cif` |
| `logo_url` | TEXT | "https://..." | ❌ | - | `logoUrl` |
| `color_primario` | VARCHAR(7) | "#FF5733" | ❌ | - | `colorPrimario` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Ejemplo:**
```json
{
  "marca_id": "MRC-001",
  "empresa_id": "EMP-001",
  "nombre_comercial": "PIZZAS",
  "nombre_fiscal": "Pizzas PAU S.L.",
  "color_primario": "#FF5733",
  "activo": true
}
```

---

#### 1.4. PUNTO_VENTA

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ✅ | `empresa_id`, `marca_id` | `puntoVentaId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `marca_id` | VARCHAR(50) | "MRC-001" | ✅ | FK | `marcaId` |
| `nombre` | VARCHAR(200) | "Tiana" | ✅ | - | `nombre` |
| `direccion` | TEXT | "Calle Mayor 45" | ✅ | - | `direccion` |
| `ciudad` | VARCHAR(100) | "Tiana" | ✅ | - | `ciudad` |
| `codigo_postal` | VARCHAR(10) | "08391" | ✅ | - | `codigoPostal` |
| `telefono` | VARCHAR(20) | "+34 931234567" | ✅ | - | `telefono` |
| `email` | VARCHAR(255) | "tiana@pizzas.com" | ✅ | - | `email` |
| `latitud` | DECIMAL(10,8) | 41.4850 | ❌ | - | `latitud` |
| `longitud` | DECIMAL(11,8) | 2.1734 | ❌ | - | `longitud` |
| `horario` | TEXT | "L-D: 12:00-23:00" | ❌ | - | `horario` |
| `capacidad` | INT | 50 | ❌ | - | `capacidad` |
| `fecha_apertura` | DATE | "2020-06-15" | ✅ | - | `fechaApertura` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Ejemplo:**
```json
{
  "punto_venta_id": "PDV-001",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "nombre": "Tiana",
  "direccion": "Calle Mayor 45",
  "ciudad": "Tiana",
  "codigo_postal": "08391",
  "telefono": "+34 931234567",
  "email": "tiana@pizzas.com",
  "capacidad": 50,
  "fecha_apertura": "2020-06-15",
  "activo": true
}
```

---

#### 1.5. USUARIO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `usuario_id` | VARCHAR(50) | "USR-001" | ✅ | - | `usuarioId` |
| `nombre_completo` | VARCHAR(255) | "Carlos Martínez" | ✅ | - | `nombreCompleto` |
| `email` | VARCHAR(255) | "carlos@pau.com" | ✅ | - | `email` |
| `telefono` | VARCHAR(20) | "+34 600123456" | ❌ | - | `telefono` |
| `password_hash` | VARCHAR(255) | "hash..." | ✅ | - | - |
| `rol_principal` | ENUM | "gerente_general" | ✅ | - | `rolPrincipal` |
| `empresa_id_defecto` | VARCHAR(50) | "EMP-001" | ❌ | FK | `empresaIdDefecto` |
| `marca_id_defecto` | VARCHAR(50) | "MRC-001" | ❌ | FK | `marcaIdDefecto` |
| `punto_venta_id_defecto` | VARCHAR(50) | "PDV-001" | ❌ | FK | `puntoVentaIdDefecto` |
| `avatar_url` | TEXT | "https://..." | ❌ | - | `avatarUrl` |
| `fecha_ultimo_acceso` | TIMESTAMP | auto | ❌ | - | `fechaUltimoAcceso` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Valores `rol_principal`:**
- `gerente_general` - Ve todo
- `gerente_empresa` - Ve su empresa
- `gerente_marca` - Ve su marca
- `gerente_punto_venta` - Ve su punto de venta
- `trabajador` - Asignado a un punto de venta
- `cliente` - Hace pedidos

**Ejemplo:**
```json
{
  "usuario_id": "USR-001",
  "nombre_completo": "Carlos Martínez",
  "email": "carlos@pau.com",
  "rol_principal": "gerente_general",
  "empresa_id_defecto": "EMP-001",
  "marca_id_defecto": "MRC-001",
  "punto_venta_id_defecto": "PDV-001",
  "activo": true
}
```

---

#### 1.6. ROL_USUARIO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `rol_usuario_id` | VARCHAR(50) | "RU-001" | ✅ | - | `rolUsuarioId` |
| `usuario_id` | VARCHAR(50) | "USR-001" | ✅ | FK | `usuarioId` |
| `rol` | ENUM | "gerente_marca" | ✅ | - | `rol` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `marca_id` | VARCHAR(50) | "MRC-001" | ❌ | FK | `marcaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ❌ | FK | `puntoVentaId` |
| `permisos` | JSON | {...} | ❌ | - | `permisos` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |

**Ejemplo:**
```json
{
  "rol_usuario_id": "RU-001",
  "usuario_id": "USR-001",
  "rol": "gerente_marca",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "permisos": {
    "ver_ventas": true,
    "editar_productos": true,
    "gestionar_personal": false
  },
  "activo": true
}
```

---

#### 1.7. PRODUCTO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `producto_id` | VARCHAR(50) | "PRD-001" | ✅ | - | `productoId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `marca_id` | VARCHAR(50) | "MRC-001" | ✅ | FK | `marcaId` |
| `nombre` | VARCHAR(255) | "Pizza Margarita" | ✅ | - | `nombre` |
| `descripcion` | TEXT | "Pizza clásica..." | ❌ | - | `descripcion` |
| `categoria` | VARCHAR(100) | "Pizzas" | ✅ | - | `categoria` |
| `precio_venta` | DECIMAL(10,2) | 12.50 | ✅ | - | `precioVenta` |
| `coste_ingredientes` | DECIMAL(10,2) | 4.20 | ✅ | - | `costeIngredientes` |
| `coste_envases` | DECIMAL(10,2) | 0.80 | ✅ | - | `costeEnvases` |
| `imagen_url` | TEXT | "https://..." | ❌ | - | `imagenUrl` |
| `disponible` | BOOLEAN | true | ✅ | - | `disponible` |
| `destacado` | BOOLEAN | false | ✅ | - | `destacado` |
| `tiempo_preparacion` | INT | 15 | ❌ | - | `tiempoPreparacion` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Ejemplo:**
```json
{
  "producto_id": "PRD-001",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "nombre": "Pizza Margarita",
  "categoria": "Pizzas",
  "precio_venta": 12.50,
  "coste_ingredientes": 4.20,
  "coste_envases": 0.80,
  "disponible": true,
  "tiempo_preparacion": 15
}
```

---

#### 1.8. ARTICULO_COMPRA

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `articulo_id` | VARCHAR(50) | "ART-001" | ✅ | - | `articuloId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `nombre` | VARCHAR(255) | "Harina 00" | ✅ | - | `nombre` |
| `categoria` | VARCHAR(100) | "Ingredientes" | ✅ | - | `categoria` |
| `unidad_medida` | VARCHAR(50) | "kg" | ✅ | - | `unidadMedida` |
| `proveedor_principal` | VARCHAR(255) | "Harinas del Norte" | ❌ | - | `proveedorPrincipal` |
| `precio_ultima_compra` | DECIMAL(10,2) | 1.20 | ✅ | - | `precioUltimaCompra` |
| `fecha_ultima_compra` | DATE | "2024-11-20" | ❌ | - | `fechaUltimaCompra` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |
| `updated_at` | TIMESTAMP | auto | ✅ | - | `updatedAt` |

**Ejemplo:**
```json
{
  "articulo_id": "ART-001",
  "empresa_id": "EMP-001",
  "nombre": "Harina 00",
  "categoria": "Ingredientes",
  "unidad_medida": "kg",
  "proveedor_principal": "Harinas del Norte",
  "precio_ultima_compra": 1.20,
  "fecha_ultima_compra": "2024-11-20"
}
```

---

#### 1.9. STOCK

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `stock_id` | VARCHAR(50) | "STK-001" | ✅ | - | `stockId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ✅ | FK | `puntoVentaId` |
| `articulo_id` | VARCHAR(50) | "ART-001" | ✅ | FK | `articuloId` |
| `cantidad_actual` | DECIMAL(10,2) | 45.00 | ✅ | - | `cantidadActual` |
| `cantidad_optima` | DECIMAL(10,2) | 50.00 | ✅ | - | `cantidadOptima` |
| `cantidad_minima` | DECIMAL(10,2) | 10.00 | ✅ | - | `cantidadMinima` |
| `ultima_actualizacion` | TIMESTAMP | auto | ✅ | - | `ultimaActualizacion` |

**Ejemplo:**
```json
{
  "stock_id": "STK-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "articulo_id": "ART-001",
  "cantidad_actual": 45.00,
  "cantidad_optima": 50.00,
  "cantidad_minima": 10.00
}
```

---

#### 1.10. PEDIDO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `pedido_id` | VARCHAR(50) | "PED-001" | ✅ | - | `pedidoId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `marca_id` | VARCHAR(50) | "MRC-001" | ✅ | FK | `marcaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ✅ | FK | `puntoVentaId` |
| `cliente_id` | VARCHAR(50) | "CLI-001" | ❌ | FK | `clienteId` |
| `fecha_pedido` | TIMESTAMP | auto | ✅ | - | `fechaPedido` |
| `tipo_pedido` | ENUM | "local" | ✅ | - | `tipoPedido` |
| `estado` | ENUM | "completado" | ✅ | - | `estado` |
| `total_venta` | DECIMAL(10,2) | 37.50 | ✅ | - | `totalVenta` |
| `coste_variable_total` | DECIMAL(10,2) | 15.80 | ✅ | - | `costeVariableTotal` |
| `margen_bruto` | DECIMAL(10,2) | 21.70 | ✅ | - | `margenBruto` |
| `comision_tpv` | DECIMAL(10,2) | 0.75 | ❌ | - | `comisionTpv` |
| `metodo_pago` | ENUM | "tarjeta" | ✅ | - | `metodoPago` |
| `trabajador_id` | VARCHAR(50) | "USR-005" | ❌ | FK | `trabajadorId` |
| `tpv_session_id` | VARCHAR(50) | "TPV-001" | ❌ | FK | `tpvSessionId` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |

**Valores `tipo_pedido`:**
- `local` - Comer en local
- `para_llevar` - Para llevar
- `delivery` - A domicilio

**Valores `estado`:**
- `pendiente`
- `en_preparacion`
- `listo`
- `entregado`
- `completado`
- `cancelado`

**Valores `metodo_pago`:**
- `efectivo`
- `tarjeta`
- `transferencia`
- `wallet`

**Ejemplo:**
```json
{
  "pedido_id": "PED-001",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-001",
  "fecha_pedido": "2024-11-26T14:30:00",
  "tipo_pedido": "local",
  "estado": "completado",
  "total_venta": 37.50,
  "coste_variable_total": 15.80,
  "margen_bruto": 21.70,
  "comision_tpv": 0.75,
  "metodo_pago": "tarjeta",
  "trabajador_id": "USR-005"
}
```

---

#### 1.11. LINEA_PEDIDO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `linea_pedido_id` | VARCHAR(50) | "LP-001" | ✅ | - | `lineaPedidoId` |
| `pedido_id` | VARCHAR(50) | "PED-001" | ✅ | FK | `pedidoId` |
| `producto_id` | VARCHAR(50) | "PRD-001" | ✅ | FK | `productoId` |
| `cantidad` | INT | 3 | ✅ | - | `cantidad` |
| `precio_unitario` | DECIMAL(10,2) | 12.50 | ✅ | - | `precioUnitario` |
| `coste_unitario_ingredientes` | DECIMAL(10,2) | 4.20 | ✅ | - | `costeUnitarioIngredientes` |
| `coste_unitario_envases` | DECIMAL(10,2) | 0.80 | ✅ | - | `costeUnitarioEnvases` |
| `subtotal` | DECIMAL(10,2) | 37.50 | ✅ | - | `subtotal` |
| `notas` | TEXT | "Sin cebolla" | ❌ | - | `notas` |

**Ejemplo:**
```json
{
  "linea_pedido_id": "LP-001",
  "pedido_id": "PED-001",
  "producto_id": "PRD-001",
  "cantidad": 3,
  "precio_unitario": 12.50,
  "coste_unitario_ingredientes": 4.20,
  "coste_unitario_envases": 0.80,
  "subtotal": 37.50
}
```

---

#### 1.12. TPV_SESSION

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `tpv_session_id` | VARCHAR(50) | "TPV-001" | ✅ | - | `tpvSessionId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ✅ | FK | `puntoVentaId` |
| `trabajador_id` | VARCHAR(50) | "USR-005" | ✅ | FK | `trabajadorId` |
| `fecha_apertura` | TIMESTAMP | auto | ✅ | - | `fechaApertura` |
| `fecha_cierre` | TIMESTAMP | null | ❌ | - | `fechaCierre` |
| `efectivo_inicial` | DECIMAL(10,2) | 100.00 | ✅ | - | `efectivoInicial` |
| `efectivo_final` | DECIMAL(10,2) | null | ❌ | - | `efectivoFinal` |
| `total_ventas` | DECIMAL(10,2) | 0 | ✅ | - | `totalVentas` |
| `total_efectivo` | DECIMAL(10,2) | 0 | ✅ | - | `totalEfectivo` |
| `total_tarjeta` | DECIMAL(10,2) | 0 | ✅ | - | `totalTarjeta` |
| `num_pedidos` | INT | 0 | ✅ | - | `numPedidos` |
| `estado` | ENUM | "abierta" | ✅ | - | `estado` |

**Valores `estado`:**
- `abierta`
- `cerrada`

**Ejemplo:**
```json
{
  "tpv_session_id": "TPV-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "trabajador_id": "USR-005",
  "fecha_apertura": "2024-11-26T08:00:00",
  "efectivo_inicial": 100.00,
  "total_ventas": 450.00,
  "total_efectivo": 120.00,
  "total_tarjeta": 330.00,
  "num_pedidos": 18,
  "estado": "abierta"
}
```

---

#### 1.13. HORAS_TRABAJADAS

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `hora_trabajada_id` | VARCHAR(50) | "HT-001" | ✅ | - | `horaTrabajadaId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ✅ | FK | `puntoVentaId` |
| `trabajador_id` | VARCHAR(50) | "USR-005" | ✅ | FK | `trabajadorId` |
| `fecha` | DATE | "2024-11-26" | ✅ | - | `fecha` |
| `hora_entrada` | TIME | "08:00:00" | ✅ | - | `horaEntrada` |
| `hora_salida` | TIME | "16:00:00" | ❌ | - | `horaSalida` |
| `total_horas` | DECIMAL(4,2) | 8.00 | ❌ | - | `totalHoras` |
| `horas_previstas` | DECIMAL(4,2) | 8.00 | ✅ | - | `horasPrevistas` |
| `tipo_jornada` | ENUM | "completa" | ✅ | - | `tipoJornada` |
| `notas` | TEXT | "Todo ok" | ❌ | - | `notas` |
| `created_at` | TIMESTAMP | auto | ✅ | - | `createdAt` |

**Valores `tipo_jornada`:**
- `completa`
- `media`
- `reducida`
- `extra`

**Ejemplo:**
```json
{
  "hora_trabajada_id": "HT-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "trabajador_id": "USR-005",
  "fecha": "2024-11-26",
  "hora_entrada": "08:00:00",
  "hora_salida": "16:00:00",
  "total_horas": 8.00,
  "horas_previstas": 8.00,
  "tipo_jornada": "completa"
}
```

---

#### 1.14. COSTE_FIJO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `coste_fijo_id` | VARCHAR(50) | "CF-001" | ✅ | - | `costeFijoId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ❌ | FK | `puntoVentaId` |
| `concepto` | VARCHAR(255) | "Alquiler local" | ✅ | - | `concepto` |
| `categoria` | VARCHAR(100) | "Inmueble" | ✅ | - | `categoria` |
| `importe_mensual` | DECIMAL(10,2) | 2500.00 | ✅ | - | `importeMensual` |
| `fecha_inicio` | DATE | "2020-06-01" | ✅ | - | `fechaInicio` |
| `fecha_fin` | DATE | null | ❌ | - | `fechaFin` |
| `recurrente` | BOOLEAN | true | ✅ | - | `recurrente` |
| `activo` | BOOLEAN | true | ✅ | - | `activo` |

**Categorías comunes:**
- `Inmueble` (alquiler)
- `Personal` (nóminas)
- `Servicios` (luz, agua, internet)
- `Seguros`
- `Impuestos`

**Ejemplo:**
```json
{
  "coste_fijo_id": "CF-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "concepto": "Alquiler local Tiana",
  "categoria": "Inmueble",
  "importe_mensual": 2500.00,
  "fecha_inicio": "2020-06-01",
  "recurrente": true,
  "activo": true
}
```

---

#### 1.15. COSTE_VARIABLE

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `coste_variable_id` | VARCHAR(50) | "CV-001" | ✅ | - | `costeVariableId` |
| `pedido_id` | VARCHAR(50) | "PED-001" | ✅ | FK | `pedidoId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `tipo_coste` | VARCHAR(100) | "Ingredientes" | ✅ | - | `tipoCoste` |
| `importe` | DECIMAL(10,2) | 12.60 | ✅ | - | `importe` |
| `descripcion` | TEXT | "Coste ingredientes" | ❌ | - | `descripcion` |

**Tipos de coste variable:**
- `Ingredientes`
- `Envases`
- `Comisión TPV`
- `Comisión delivery`
- `Otros`

**Ejemplo:**
```json
{
  "coste_variable_id": "CV-001",
  "pedido_id": "PED-001",
  "empresa_id": "EMP-001",
  "tipo_coste": "Ingredientes",
  "importe": 12.60,
  "descripcion": "Coste ingredientes pizza x3"
}
```

---

#### 1.16. ESCANDALLO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `escandallo_id` | VARCHAR(50) | "ESC-001" | ✅ | - | `escandalloId` |
| `producto_id` | VARCHAR(50) | "PRD-001" | ✅ | FK | `productoId` |
| `articulo_id` | VARCHAR(50) | "ART-001" | ✅ | FK | `articuloId` |
| `cantidad_necesaria` | DECIMAL(10,3) | 0.250 | ✅ | - | `cantidadNecesaria` |
| `unidad_medida` | VARCHAR(50) | "kg" | ✅ | - | `unidadMedida` |
| `coste_unitario` | DECIMAL(10,2) | 1.20 | ✅ | - | `costeUnitario` |
| `coste_total` | DECIMAL(10,2) | 0.30 | ✅ | - | `costeTotal` |

**Ejemplo:**
```json
{
  "escandallo_id": "ESC-001",
  "producto_id": "PRD-001",
  "articulo_id": "ART-001",
  "cantidad_necesaria": 0.250,
  "unidad_medida": "kg",
  "coste_unitario": 1.20,
  "coste_total": 0.30
}
```

---

#### 1.17. FACTURA

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `factura_id` | VARCHAR(50) | "FAC-001" | ✅ | - | `facturaId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ❌ | FK | `puntoVentaId` |
| `numero_factura` | VARCHAR(100) | "2024/001" | ✅ | - | `numeroFactura` |
| `fecha_emision` | DATE | "2024-11-26" | ✅ | - | `fechaEmision` |
| `cliente_nombre` | VARCHAR(255) | "Cliente XYZ" | ✅ | - | `clienteNombre` |
| `cliente_cif` | VARCHAR(20) | "B12345678" | ❌ | - | `clienteCif` |
| `base_imponible` | DECIMAL(10,2) | 100.00 | ✅ | - | `baseImponible` |
| `iva` | DECIMAL(10,2) | 21.00 | ✅ | - | `iva` |
| `total` | DECIMAL(10,2) | 121.00 | ✅ | - | `total` |
| `estado` | ENUM | "pagada" | ✅ | - | `estado` |
| `pdf_url` | TEXT | "https://..." | ❌ | - | `pdfUrl` |

**Valores `estado`:**
- `pendiente`
- `pagada`
- `parcialmente_pagada`
- `vencida`
- `anulada`

---

#### 1.18. COBRO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `cobro_id` | VARCHAR(50) | "COB-001" | ✅ | - | `cobroId` |
| `factura_id` | VARCHAR(50) | "FAC-001" | ✅ | FK | `facturaId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `fecha_cobro` | DATE | "2024-11-26" | ✅ | - | `fechaCobro` |
| `importe` | DECIMAL(10,2) | 121.00 | ✅ | - | `importe` |
| `metodo_pago` | ENUM | "transferencia" | ✅ | - | `metodoPago` |
| `referencia` | VARCHAR(255) | "TRANS-12345" | ❌ | - | `referencia` |

---

#### 1.19. DOCUMENTO

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `documento_id` | VARCHAR(50) | "DOC-001" | ✅ | - | `documentoId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `punto_venta_id` | VARCHAR(50) | "PDV-001" | ❌ | FK | `puntoVentaId` |
| `tipo_documento` | VARCHAR(100) | "Licencia" | ✅ | - | `tipoDocumento` |
| `nombre` | VARCHAR(255) | "Licencia actividad" | ✅ | - | `nombre` |
| `fecha_emision` | DATE | "2020-01-01" | ❌ | - | `fechaEmision` |
| `fecha_vencimiento` | DATE | "2025-01-01" | ❌ | - | `fechaVencimiento` |
| `estado` | ENUM | "vigente" | ✅ | - | `estado` |
| `url_archivo` | TEXT | "https://..." | ❌ | - | `urlArchivo` |

**Valores `estado`:**
- `vigente`
- `proximo_vencer`
- `vencido`
- `archivado`

---

#### 1.20. NOTIFICACION

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `notificacion_id` | VARCHAR(50) | "NOT-001" | ✅ | - | `notificacionId` |
| `usuario_id` | VARCHAR(50) | "USR-001" | ✅ | FK | `usuarioId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `tipo` | VARCHAR(100) | "stock_bajo" | ✅ | - | `tipo` |
| `titulo` | VARCHAR(255) | "Stock bajo" | ✅ | - | `titulo` |
| `mensaje` | TEXT | "Harina < 10kg" | ✅ | - | `mensaje` |
| `prioridad` | ENUM | "alta" | ✅ | - | `prioridad` |
| `leida` | BOOLEAN | false | ✅ | - | `leida` |
| `fecha_creacion` | TIMESTAMP | auto | ✅ | - | `fechaCreacion` |

**Valores `prioridad`:**
- `baja`
- `media`
- `alta`
- `urgente`

---

#### 1.21. CONFIG_EMPRESA

| Campo | Tipo | Ejemplo | Obligatorio | Relaciones | Clave Make |
|-------|------|---------|-------------|------------|------------|
| `config_id` | VARCHAR(50) | "CFG-001" | ✅ | - | `configId` |
| `empresa_id` | VARCHAR(50) | "EMP-001" | ✅ | FK | `empresaId` |
| `clave` | VARCHAR(100) | "comision_tpv" | ✅ | - | `clave` |
| `valor` | TEXT | "0.02" | ✅ | - | `valor` |
| `tipo_dato` | VARCHAR(50) | "decimal" | ✅ | - | `tipoDato` |
| `descripcion` | TEXT | "% comisión TPV" | ❌ | - | `descripcion` |

**Configuraciones comunes:**
- `comision_tpv` - Porcentaje comisión TPV (0.02 = 2%)
- `comision_delivery` - Porcentaje comisión delivery
- `iva_defecto` - IVA por defecto (0.21 = 21%)
- `moneda` - EUR, USD, etc.
- `zona_horaria` - Europe/Madrid

---

## 2. CÁLCULOS INTERNOS CORE

### 2.1. INGRESOS

#### Por Empresa

**Fórmula:**
```
INGRESOS_EMPRESA = SUM(PEDIDO.total_venta) 
WHERE 
  PEDIDO.empresa_id = 'EMP-001'
  AND PEDIDO.estado IN ('completado', 'entregado')
  AND PEDIDO.fecha_pedido BETWEEN fecha_inicio AND fecha_fin
```

**Inputs:**
- `PEDIDO.empresa_id`
- `PEDIDO.total_venta`
- `PEDIDO.estado`
- `PEDIDO.fecha_pedido`

**Ejemplo - Hostelería (Pizzas + Burguers) en noviembre 2024:**
```
Tiana (Pizzas): 45 pedidos x 25€ promedio = 1.125€
Badalona (Pizzas): 38 pedidos x 27€ promedio = 1.026€
Tiana (Burguers): 52 pedidos x 18€ promedio = 936€
Badalona (Burguers): 48 pedidos x 19€ promedio = 912€

TOTAL INGRESOS EMPRESA HOSTELERÍA = 3.999€
```

---

#### Por Marca

**Fórmula:**
```
INGRESOS_MARCA = SUM(PEDIDO.total_venta) 
WHERE 
  PEDIDO.marca_id = 'MRC-001'
  AND PEDIDO.estado IN ('completado', 'entregado')
  AND PEDIDO.fecha_pedido BETWEEN fecha_inicio AND fecha_fin
```

**Inputs:**
- `PEDIDO.marca_id`
- `PEDIDO.total_venta`
- `PEDIDO.estado`
- `PEDIDO.fecha_pedido`

**Ejemplo - Marca PIZZAS en noviembre 2024:**
```
Tiana: 45 pedidos x 25€ = 1.125€
Badalona: 38 pedidos x 27€ = 1.026€

TOTAL INGRESOS MARCA PIZZAS = 2.151€
```

---

#### Por Punto de Venta

**Fórmula:**
```
INGRESOS_PTV = SUM(PEDIDO.total_venta) 
WHERE 
  PEDIDO.punto_venta_id = 'PDV-001'
  AND PEDIDO.estado IN ('completado', 'entregado')
  AND PEDIDO.fecha_pedido BETWEEN fecha_inicio AND fecha_fin
```

**Inputs:**
- `PEDIDO.punto_venta_id`
- `PEDIDO.total_venta`
- `PEDIDO.estado`
- `PEDIDO.fecha_pedido`

**Ejemplo - Tiana (todas las marcas) en noviembre 2024:**
```
Pizzas: 1.125€
Burguers: 936€

TOTAL INGRESOS TIANA = 2.061€
```

---

### 2.2. COSTE VARIABLE POR PEDIDO

**Fórmula:**
```
COSTE_VARIABLE_PEDIDO = 
  COSTE_INGREDIENTES 
  + COSTE_ENVASES 
  + COMISION_TPV 
  + COMISION_DELIVERY (si aplica)

Donde:
COSTE_INGREDIENTES = SUM(LINEA_PEDIDO.cantidad * LINEA_PEDIDO.coste_unitario_ingredientes)
COSTE_ENVASES = SUM(LINEA_PEDIDO.cantidad * LINEA_PEDIDO.coste_unitario_envases)
COMISION_TPV = PEDIDO.total_venta * CONFIG_EMPRESA.comision_tpv
COMISION_DELIVERY = PEDIDO.total_venta * CONFIG_EMPRESA.comision_delivery (si tipo_pedido = 'delivery')
```

**Inputs:**
- `LINEA_PEDIDO.cantidad`
- `LINEA_PEDIDO.coste_unitario_ingredientes`
- `LINEA_PEDIDO.coste_unitario_envases`
- `PEDIDO.total_venta`
- `PEDIDO.tipo_pedido`
- `CONFIG_EMPRESA.comision_tpv` (ejemplo: 0.02 = 2%)
- `CONFIG_EMPRESA.comision_delivery` (ejemplo: 0.15 = 15%)

**Ejemplo - Pedido de 3 pizzas Margarita (local, pago tarjeta):**
```
Ingredientes: 3 x 4.20€ = 12.60€
Envases: 3 x 0.80€ = 2.40€
Comisión TPV: 37.50€ x 0.02 = 0.75€
Comisión Delivery: 0€ (pedido local)

COSTE VARIABLE TOTAL = 15.75€
```

---

### 2.3. COSTE FIJO IMPUTADO POR PUNTO DE VENTA

**Fórmula (reparto proporcional por ingresos):**
```
COSTE_FIJO_PTV_MES = 
  (INGRESOS_PTV_MES / INGRESOS_EMPRESA_MES) 
  * SUM(COSTE_FIJO.importe_mensual WHERE empresa_id = 'EMP-001')
```

**Inputs:**
- `PEDIDO` (para calcular ingresos por PTV)
- `COSTE_FIJO.importe_mensual`
- `COSTE_FIJO.empresa_id`
- `COSTE_FIJO.activo = true`

**Ejemplo - Noviembre 2024:**

**Costes fijos totales empresa Hostelería:**
```
Alquiler Tiana: 2.500€
Alquiler Badalona: 2.200€
Nóminas: 8.500€
Servicios Tiana: 450€
Servicios Badalona: 420€
Seguros: 600€

TOTAL COSTES FIJOS = 14.670€
```

**Reparto proporcional:**
```
Ingresos totales empresa: 3.999€
Ingresos Tiana: 2.061€ (51.56%)
Ingresos Badalona: 1.938€ (48.44%)

Coste fijo imputado Tiana: 14.670€ x 51.56% = 7.564€
Coste fijo imputado Badalona: 14.670€ x 48.44% = 7.106€
```

---

### 2.4. MARGEN BRUTO

#### Por Pedido

**Fórmula:**
```
MARGEN_BRUTO_PEDIDO = PEDIDO.total_venta - PEDIDO.coste_variable_total
```

**Inputs:**
- `PEDIDO.total_venta`
- `PEDIDO.coste_variable_total`

**Ejemplo - Pedido 3 pizzas:**
```
Venta: 37.50€
Coste variable: 15.75€

MARGEN BRUTO = 21.75€ (58% margen)
```

---

#### Por Marca

**Fórmula:**
```
MARGEN_BRUTO_MARCA = 
  SUM(PEDIDO.total_venta) - SUM(PEDIDO.coste_variable_total)
WHERE 
  PEDIDO.marca_id = 'MRC-001'
  AND periodo
```

**Ejemplo - Marca PIZZAS en noviembre:**
```
Ingresos: 2.151€
Costes variables: 860€

MARGEN BRUTO PIZZAS = 1.291€ (60% margen)
```

---

#### Por Punto de Venta

**Fórmula:**
```
MARGEN_BRUTO_PTV = 
  SUM(PEDIDO.total_venta) - SUM(PEDIDO.coste_variable_total)
WHERE 
  PEDIDO.punto_venta_id = 'PDV-001'
  AND periodo
```

**Ejemplo - Tiana en noviembre:**
```
Ingresos: 2.061€
Costes variables: 824€

MARGEN BRUTO TIANA = 1.237€ (60% margen)
```

---

### 2.5. EBITDA MENSUAL SIMPLIFICADO

**Fórmula:**
```
EBITDA = INGRESOS - COSTES_VARIABLES - COSTES_FIJOS

Donde:
INGRESOS = SUM(PEDIDO.total_venta)
COSTES_VARIABLES = SUM(PEDIDO.coste_variable_total)
COSTES_FIJOS = SUM(COSTE_FIJO.importe_mensual WHERE activo = true)
```

**Inputs:**
- `PEDIDO.total_venta`
- `PEDIDO.coste_variable_total`
- `COSTE_FIJO.importe_mensual`
- `COSTE_FIJO.activo`

**Ejemplo - Empresa Hostelería en noviembre 2024:**
```
Ingresos totales: 3.999€
Costes variables totales: 1.600€
Costes fijos totales: 14.670€

EBITDA = 3.999€ - 1.600€ - 14.670€ = -12.271€

⚠️ RESULTADO NEGATIVO - Revisar estrategia
```

---

### 2.6. PRODUCTIVIDAD TRABAJADORES

**Fórmula:**
```
PRODUCTIVIDAD_TRABAJADOR = {
  pedidos_gestionados: COUNT(PEDIDO WHERE trabajador_id),
  ventas_totales: SUM(PEDIDO.total_venta WHERE trabajador_id),
  horas_trabajadas: SUM(HORAS_TRABAJADAS.total_horas),
  ticket_medio: ventas_totales / pedidos_gestionados,
  ventas_por_hora: ventas_totales / horas_trabajadas,
  pedidos_por_hora: pedidos_gestionados / horas_trabajadas
}

MÉTRICA_FINAL = (ventas_por_hora * 0.5) + (pedidos_por_hora * 10) * 0.5
```

**Inputs:**
- `PEDIDO.trabajador_id`
- `PEDIDO.total_venta`
- `HORAS_TRABAJADAS.trabajador_id`
- `HORAS_TRABAJADAS.total_horas`

**Ejemplo - Trabajador María en Tiana (noviembre):**
```
Pedidos gestionados: 45
Ventas totales: 1.125€
Horas trabajadas: 160h

Ticket medio: 1.125€ / 45 = 25€
Ventas por hora: 1.125€ / 160h = 7.03€/h
Pedidos por hora: 45 / 160h = 0.28 pedidos/h

MÉTRICA PRODUCTIVIDAD = (7.03 * 0.5) + (0.28 * 10 * 0.5) = 4.92 puntos
```

---

## 3. VISTAS Y PERMISOS POR ROL

### 3.1. GERENTE_GENERAL

**Contexto:** Ve TODAS las empresas, marcas y puntos de venta

**Dashboard Global:**
```
KPI Empresas:
- Ingresos totales por empresa
- EBITDA por empresa
- Margen bruto % por empresa
- Comparativa mes anterior

KPI Marcas:
- Ingresos totales por marca
- Productos más vendidos por marca
- Margen bruto % por marca

KPI Puntos de Venta:
- Ranking puntos de venta por ingresos
- Ticket medio por punto de venta
- Ocupación / capacidad

Filtros disponibles:
✅ Empresa (todas / selección múltiple)
✅ Marca (todas / selección múltiple)
✅ Punto de Venta (todos / selección múltiple)
✅ Periodo (día, mes, año, custom)
```

**Permisos CRUD:**
| Entidad | Ver | Crear | Editar | Eliminar |
|---------|-----|-------|--------|----------|
| Empresa | ✅ | ✅ | ✅ | ✅ |
| Marca | ✅ | ✅ | ✅ | ✅ |
| Punto Venta | ✅ | ✅ | ✅ | ✅ |
| Usuario | ✅ | ✅ | ✅ | ✅ |
| Producto | ✅ | ✅ | ✅ | ✅ |
| Pedido | ✅ | ❌ | ✅ | ❌ |
| Stock | ✅ | ✅ | ✅ | ❌ |
| Coste Fijo | ✅ | ✅ | ✅ | ✅ |
| Documento | ✅ | ✅ | ✅ | ✅ |

---

### 3.2. GERENTE_EMPRESA

**Contexto:** Solo ve su empresa (ejemplo: EMP-001 - Hostelería)

**Dashboard Empresa:**
```
KPI Empresa:
- Ingresos totales empresa
- EBITDA empresa
- Margen bruto %
- Comparativa marcas

KPI Marcas:
- Ingresos por marca (Pizzas vs Burguers)
- Productos más vendidos
- Margen por marca

KPI Puntos de Venta:
- Comparativa puntos de venta
- Personal por punto de venta
- Stock por punto de venta

Filtros disponibles:
✅ Marca (todas de su empresa / selección)
✅ Punto de Venta (todos de su empresa / selección)
✅ Periodo (día, mes, año, custom)
❌ NO puede ver otras empresas
```

**Permisos CRUD:**
| Entidad | Ver | Crear | Editar | Eliminar |
|---------|-----|-------|--------|----------|
| Empresa | ✅ (solo su empresa) | ❌ | ✅ (solo su empresa) | ❌ |
| Marca | ✅ (solo su empresa) | ✅ | ✅ | ❌ |
| Punto Venta | ✅ (solo su empresa) | ✅ | ✅ | ❌ |
| Usuario | ✅ (solo su empresa) | ✅ | ✅ | ❌ |
| Producto | ✅ (solo su empresa) | ✅ | ✅ | ✅ |
| Pedido | ✅ (solo su empresa) | ❌ | ✅ | ❌ |
| Stock | ✅ (solo su empresa) | ✅ | ✅ | ❌ |
| Coste Fijo | ✅ (solo su empresa) | ✅ | ✅ | ✅ |

---

### 3.3. GERENTE_MARCA

**Contexto:** Solo ve su marca (ejemplo: MRC-001 - PIZZAS)

**Dashboard Marca:**
```
KPI Marca:
- Ingresos totales marca
- Margen bruto marca
- Productos más vendidos
- Comparativa puntos de venta

KPI Puntos de Venta:
- Ventas por punto de venta
- Stock por punto de venta
- Personal por punto de venta

Productos:
- Catálogo completo
- Escandallo por producto
- Rentabilidad por producto

Filtros disponibles:
✅ Punto de Venta (todos de su marca / selección)
✅ Periodo (día, mes, año, custom)
❌ NO puede ver otras marcas
❌ NO puede ver otras empresas
```

**Permisos CRUD:**
| Entidad | Ver | Crear | Editar | Eliminar |
|---------|-----|-------|--------|----------|
| Marca | ✅ (solo su marca) | ❌ | ✅ (solo su marca) | ❌ |
| Punto Venta | ✅ (solo su marca) | ❌ | ✅ (solo su marca) | ❌ |
| Usuario | ✅ (solo su marca) | ✅ | ✅ | ❌ |
| Producto | ✅ (solo su marca) | ✅ | ✅ | ✅ |
| Pedido | ✅ (solo su marca) | ❌ | ✅ | ❌ |
| Stock | ✅ (solo su marca) | ✅ | ✅ | ❌ |

---

### 3.4. GERENTE_PUNTO_VENTA

**Contexto:** Solo ve su punto de venta (ejemplo: PDV-001 - Tiana)

**Dashboard Punto de Venta:**
```
KPI Punto de Venta:
- Ingresos del día / mes
- Pedidos del día
- Ticket medio
- Personal activo

Operaciones:
- Pedidos en tiempo real
- Estado cocina
- Estado mesas
- Stock actual

Personal:
- Horas trabajadas
- Asistencias
- Productividad

Filtros disponibles:
✅ Periodo (día, mes, año, custom)
❌ NO puede ver otros puntos de venta
❌ NO puede ver otras marcas
❌ NO puede ver otras empresas
```

**Permisos CRUD:**
| Entidad | Ver | Crear | Editar | Eliminar |
|---------|-----|-------|--------|----------|
| Punto Venta | ✅ (solo el suyo) | ❌ | ✅ (solo el suyo) | ❌ |
| Usuario | ✅ (solo su PTV) | ❌ | ❌ | ❌ |
| Producto | ✅ (solo su PTV) | ❌ | ✅ (disponibilidad) | ❌ |
| Pedido | ✅ (solo su PTV) | ✅ | ✅ | ❌ |
| Stock | ✅ (solo su PTV) | ❌ | ✅ | ❌ |
| Horas Trabajadas | ✅ (solo su PTV) | ✅ | ✅ | ❌ |

---

### 3.5. TRABAJADOR

**Contexto:** Asignado a un punto de venta específico (ejemplo: PDV-001 - Tiana)

**Vista Trabajador:**
```
Pedidos del día:
- Pedidos asignados
- Pedidos pendientes
- Pedidos completados

Tareas:
- Checklist apertura
- Checklist cierre
- Limpieza
- Reposición

Horas:
- Fichar entrada
- Fichar salida
- Registro de horas
- Historial

Incidencias:
- Reportar incidencia
- Ver incidencias abiertas
```

**Permisos CRUD:**
| Entidad | Ver | Crear | Editar | Eliminar |
|---------|-----|-------|--------|----------|
| Pedido | ✅ (solo asignados) | ✅ | ✅ (estado) | ❌ |
| Stock | ✅ (consulta) | ❌ | ❌ | ❌ |
| Horas Trabajadas | ✅ (solo suyas) | ✅ | ❌ | ❌ |
| Producto | ✅ (catálogo) | ❌ | ❌ | ❌ |

---

### 3.6. CLIENTE

**Contexto:** Hace pedidos de una marca/punto de venta

**Vista Cliente:**
```
Hacer Pedido:
- Catálogo productos
- Carrito
- Método pago
- Dirección entrega

Mis Pedidos:
- Estado pedido actual
- Historial pedidos
- Tickets / facturas
- Valoraciones

Perfil:
- Datos personales
- Direcciones guardadas
- Métodos de pago guardados
```

**Permisos CRUD:**
| Entidad | Ver | Crear | Editar | Eliminar |
|---------|-----|-------|--------|----------|
| Producto | ✅ (catálogo) | ❌ | ❌ | ❌ |
| Pedido | ✅ (solo suyos) | ✅ | ❌ | ❌ |
| Usuario | ✅ (solo su perfil) | ❌ | ✅ (solo su perfil) | ❌ |

---

## 4. AUTOMATIZACIONES MAKE CORE

### 4.1. ESCENARIO 1: NUEVO PEDIDO

**Trigger:** Webhook cuando se crea un nuevo pedido

**Datos de entrada:**
```json
{
  "pedido_id": "PED-001",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-001",
  "total_venta": 37.50,
  "lineas_pedido": [
    {
      "producto_id": "PRD-001",
      "cantidad": 3,
      "precio_unitario": 12.50,
      "coste_unitario_ingredientes": 4.20,
      "coste_unitario_envases": 0.80
    }
  ],
  "metodo_pago": "tarjeta",
  "tipo_pedido": "local"
}
```

**Procesos:**

**1. Calcular costes variables:**
```javascript
// Ingredientes + Envases
coste_ingredientes = 3 * 4.20 = 12.60€
coste_envases = 3 * 0.80 = 2.40€

// Comisión TPV (si pago tarjeta)
comision_tpv = 37.50 * 0.02 = 0.75€

// Comisión Delivery (si aplica)
comision_delivery = 0€ // pedido local

COSTE_VARIABLE_TOTAL = 15.75€
```

**2. Calcular margen bruto:**
```javascript
MARGEN_BRUTO = 37.50 - 15.75 = 21.75€
```

**3. Actualizar stock consumido:**
```javascript
// Por cada línea de pedido
FOR cada linea IN lineas_pedido:
  // Obtener escandallo del producto
  escandallos = GET escandallos WHERE producto_id = linea.producto_id
  
  // Descontar stock de cada artículo
  FOR cada escandallo IN escandallos:
    cantidad_consumida = escandallo.cantidad_necesaria * linea.cantidad
    
    UPDATE stock
    SET cantidad_actual = cantidad_actual - cantidad_consumida
    WHERE articulo_id = escandallo.articulo_id
      AND punto_venta_id = 'PDV-001'
    
    // Comprobar si stock bajo
    IF stock.cantidad_actual < stock.cantidad_minima:
      TRIGGER escenario_stock_bajo
```

**4. Actualizar KPIs del día:**
```javascript
// KPI Punto de Venta
UPDATE kpi_ptv
SET 
  ingresos_dia = ingresos_dia + 37.50,
  pedidos_dia = pedidos_dia + 1,
  margen_bruto_dia = margen_bruto_dia + 21.75
WHERE punto_venta_id = 'PDV-001' AND fecha = HOY

// KPI Marca
UPDATE kpi_marca
SET 
  ingresos_dia = ingresos_dia + 37.50,
  pedidos_dia = pedidos_dia + 1
WHERE marca_id = 'MRC-001' AND fecha = HOY

// KPI Empresa
UPDATE kpi_empresa
SET 
  ingresos_dia = ingresos_dia + 37.50,
  pedidos_dia = pedidos_dia + 1
WHERE empresa_id = 'EMP-001' AND fecha = HOY
```

**5. Notificación gerente:**
```javascript
IF pedido.total_venta > 100:
  CREATE notificacion {
    usuario_id: gerente_punto_venta_id,
    tipo: 'pedido_alto',
    titulo: 'Pedido de alto importe',
    mensaje: 'Pedido PED-001 por 37.50€ en Tiana',
    prioridad: 'media'
  }
```

**Salidas:**
```json
{
  "pedido_actualizado": {
    "pedido_id": "PED-001",
    "coste_variable_total": 15.75,
    "margen_bruto": 21.75,
    "estado": "procesado"
  },
  "kpis_actualizados": {
    "kpi_ptv_id": "KPI-PDV-001-20241126",
    "kpi_marca_id": "KPI-MRC-001-20241126",
    "kpi_empresa_id": "KPI-EMP-001-20241126"
  },
  "stock_actualizado": true,
  "notificaciones_enviadas": 1
}
```

**Campos clave Make:**
- Trigger: `pedidoCreado`
- Input: `pedidoId`, `empresaId`, `marcaId`, `puntoVentaId`
- Output: `pedidoActualizado`, `kpisActualizados`

---

### 4.2. ESCENARIO 2: CIERRE DE DÍA (por punto de venta)

**Trigger:** Cierre TPV o automático a las 23:59

**Datos de entrada:**
```json
{
  "tpv_session_id": "TPV-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "fecha": "2024-11-26",
  "trabajador_id": "USR-005"
}
```

**Procesos:**

**1. Calcular resumen del día:**
```javascript
// Obtener todos los pedidos del día
pedidos_dia = GET pedidos 
WHERE punto_venta_id = 'PDV-001' 
  AND DATE(fecha_pedido) = '2024-11-26'

// Calcular totales
total_ventas = SUM(pedidos_dia.total_venta)
total_pedidos = COUNT(pedidos_dia)
ticket_medio = total_ventas / total_pedidos
margen_bruto_total = SUM(pedidos_dia.margen_bruto)

// Desglose por método de pago
total_efectivo = SUM(pedidos_dia.total_venta WHERE metodo_pago = 'efectivo')
total_tarjeta = SUM(pedidos_dia.total_venta WHERE metodo_pago = 'tarjeta')

// Horas trabajadas
horas_trabajadas = GET horas_trabajadas
WHERE punto_venta_id = 'PDV-001'
  AND fecha = '2024-11-26'

total_horas = SUM(horas_trabajadas.total_horas)
```

**2. Generar resumen:**
```json
{
  "resumen_dia": {
    "punto_venta_id": "PDV-001",
    "fecha": "2024-11-26",
    "total_ventas": 450.00,
    "total_pedidos": 18,
    "ticket_medio": 25.00,
    "margen_bruto_total": 270.00,
    "desglose_pago": {
      "efectivo": 120.00,
      "tarjeta": 330.00
    },
    "horas_trabajadas": {
      "total_horas": 16.00,
      "trabajadores": 2
    }
  }
}
```

**3. Actualizar dashboards:**
```javascript
// Dashboard Gerente Punto de Venta
UPDATE dashboard_ptv
SET resumen_dia = resumen_dia
WHERE punto_venta_id = 'PDV-001'

// Dashboard Gerente Empresa
UPDATE dashboard_empresa
SET resumen_dia_ptv = [...resumen_dia_ptv, resumen_dia]
WHERE empresa_id = 'EMP-001'

// Dashboard Gerente Marca
UPDATE dashboard_marca
SET resumen_dia_ptv = [...resumen_dia_ptv, resumen_dia]
WHERE marca_id = 'MRC-001'
```

**4. Enviar notificaciones:**
```javascript
// A gerente punto de venta
CREATE notificacion {
  usuario_id: gerente_ptv_id,
  tipo: 'cierre_dia',
  titulo: 'Cierre de día - Tiana',
  mensaje: '18 pedidos, 450€ facturados, ticket medio 25€',
  prioridad: 'baja'
}

// A gerente empresa (resumen diario)
CREATE notificacion {
  usuario_id: gerente_empresa_id,
  tipo: 'resumen_diario',
  titulo: 'Resumen diario - Hostelería',
  mensaje: 'Tiana: 450€, Badalona: 380€. Total: 830€',
  prioridad: 'media'
}
```

**Salidas:**
```json
{
  "tpv_session_cerrada": true,
  "resumen_dia": {...},
  "dashboards_actualizados": true,
  "notificaciones_enviadas": 2,
  "pdf_cierre_url": "https://storage.com/cierres/TPV-001.pdf"
}
```

**Campos clave Make:**
- Trigger: `cierreDia`
- Input: `tpvSessionId`, `puntoVentaId`, `fecha`
- Output: `resumenDia`, `pdfCierreUrl`

---

### 4.3. ESCENARIO 3: CONTROL DE HORAS TRABAJADAS

**Trigger:** Nuevo registro de horas o fichaje de salida

**Datos de entrada:**
```json
{
  "hora_trabajada_id": "HT-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "trabajador_id": "USR-005",
  "fecha": "2024-11-26",
  "hora_entrada": "08:00:00",
  "hora_salida": "16:00:00",
  "total_horas": 8.00,
  "horas_previstas": 8.00
}
```

**Procesos:**

**1. Comparar previsto vs real:**
```javascript
diferencia_horas = total_horas - horas_previstas
// 8.00 - 8.00 = 0

IF diferencia_horas > 0.5:
  alerta = 'Exceso de horas'
ELSE IF diferencia_horas < -0.5:
  alerta = 'Falta de horas'
ELSE:
  alerta = null
```

**2. Calcular productividad:**
```javascript
// Obtener pedidos gestionados
pedidos_trabajador = GET pedidos
WHERE trabajador_id = 'USR-005'
  AND DATE(fecha_pedido) = '2024-11-26'

num_pedidos = COUNT(pedidos_trabajador)
ventas_totales = SUM(pedidos_trabajador.total_venta)

// Calcular métricas
pedidos_por_hora = num_pedidos / total_horas
ventas_por_hora = ventas_totales / total_horas
ticket_medio = ventas_totales / num_pedidos

// Métrica final
productividad = (ventas_por_hora * 0.5) + (pedidos_por_hora * 10 * 0.5)
```

**3. Actualizar KPI trabajador:**
```javascript
UPDATE kpi_trabajador
SET 
  horas_trabajadas_mes = horas_trabajadas_mes + 8.00,
  pedidos_gestionados_mes = pedidos_gestionados_mes + num_pedidos,
  ventas_totales_mes = ventas_totales_mes + ventas_totales,
  productividad_promedio = CALCULAR_PROMEDIO(productividad)
WHERE trabajador_id = 'USR-005'
  AND mes = '2024-11'
```

**4. Alertar gerente si anomalía:**
```javascript
IF alerta != null:
  CREATE notificacion {
    usuario_id: gerente_ptv_id,
    tipo: 'horas_anomalia',
    titulo: alerta,
    mensaje: 'Trabajador USR-005: ' + alerta + ' (' + diferencia_horas + 'h)',
    prioridad: 'media'
  }

IF productividad < umbral_minimo:
  CREATE notificacion {
    usuario_id: gerente_ptv_id,
    tipo: 'productividad_baja',
    titulo: 'Productividad baja',
    mensaje: 'Trabajador USR-005: productividad ' + productividad + ' puntos',
    prioridad: 'alta'
  }
```

**Salidas:**
```json
{
  "horas_registradas": true,
  "kpi_trabajador_actualizado": true,
  "productividad": {
    "pedidos_dia": 6,
    "ventas_dia": 150.00,
    "pedidos_por_hora": 0.75,
    "ventas_por_hora": 18.75,
    "metrica_productividad": 7.13
  },
  "alertas": [],
  "notificaciones_enviadas": 0
}
```

**Campos clave Make:**
- Trigger: `horasRegistradas`
- Input: `trabajadorId`, `totalHoras`, `horasPrevistas`
- Output: `productividad`, `alertas`

---

### 4.4. ESCENARIO 4: STOCK BAJO / PEDIDO AUTOMÁTICO

**Trigger:** Stock actual < stock mínimo

**Datos de entrada:**
```json
{
  "stock_id": "STK-001",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "articulo_id": "ART-001",
  "articulo_nombre": "Harina 00",
  "cantidad_actual": 8.00,
  "cantidad_minima": 10.00,
  "cantidad_optima": 50.00,
  "proveedor_principal": "Harinas del Norte"
}
```

**Procesos:**

**1. Calcular cantidad a pedir:**
```javascript
cantidad_a_pedir = cantidad_optima - cantidad_actual
// 50.00 - 8.00 = 42.00 kg
```

**2. Generar borrador pedido proveedor:**
```javascript
CREATE pedido_proveedor {
  pedido_proveedor_id: 'PP-' + TIMESTAMP(),
  empresa_id: 'EMP-001',
  punto_venta_id: 'PDV-001',
  proveedor: 'Harinas del Norte',
  estado: 'borrador',
  lineas: [
    {
      articulo_id: 'ART-001',
      articulo_nombre: 'Harina 00',
      cantidad: 42.00,
      unidad_medida: 'kg',
      precio_estimado: 1.20,
      total_estimado: 50.40
    }
  ],
  total_estimado: 50.40,
  fecha_creacion: NOW(),
  creado_por: 'sistema_automatico'
}
```

**3. Notificar gerentes:**
```javascript
// Gerente Punto de Venta
CREATE notificacion {
  usuario_id: gerente_ptv_id,
  tipo: 'stock_bajo',
  titulo: 'Stock bajo - Harina 00',
  mensaje: 'Stock actual: 8kg. Pedido automático creado: 42kg',
  prioridad: 'alta'
}

// Gerente Empresa
CREATE notificacion {
  usuario_id: gerente_empresa_id,
  tipo: 'pedido_proveedor_pendiente',
  titulo: 'Pedido proveedor pendiente - Tiana',
  mensaje: 'Pedido PP-001 (50.40€) pendiente de aprobación',
  prioridad: 'media'
}
```

**4. Enviar email al proveedor (opcional, si aprobación automática):**
```javascript
IF config.auto_aprobar_pedidos_menores_100:
  IF total_estimado < 100:
    UPDATE pedido_proveedor
    SET estado = 'enviado'
    
    SEND_EMAIL {
      to: proveedor_email,
      subject: 'Nuevo pedido - Pizzas PAU',
      body: 'Pedido PP-001: 42kg Harina 00'
    }
```

**Salidas:**
```json
{
  "stock_bajo_detectado": true,
  "pedido_proveedor_creado": {
    "pedido_proveedor_id": "PP-001",
    "estado": "borrador",
    "total_estimado": 50.40,
    "lineas": 1
  },
  "notificaciones_enviadas": 2,
  "email_enviado": false
}
```

**Campos clave Make:**
- Trigger: `stockBajo`
- Input: `stockId`, `articuloId`, `cantidadActual`, `cantidadMinima`
- Output: `pedidoProveedorCreado`, `notificacionesEnviadas`

---

## 5. VALIDACIÓN Y OPTIMIZACIONES CORE

### 5.1. RIESGOS HABITUALES Y SOLUCIONES

#### Riesgo 1: Duplicidad de datos por múltiples empresas

**Problema:**
```
Usuario crea producto "Pizza Margarita" en:
- Empresa Hostelería > Marca Pizzas > Tiana
- Empresa Eventos > Marca Catering > Evento X

Ambos productos comparten ingredientes pero tienen IDs diferentes
```

**Solución:**
```sql
-- Índice único por empresa + nombre
CREATE UNIQUE INDEX idx_producto_unico 
ON producto(empresa_id, marca_id, nombre);

-- Artículos de compra compartidos a nivel empresa
CREATE TABLE articulo_compra (
  articulo_id VARCHAR(50) PRIMARY KEY,
  empresa_id VARCHAR(50), -- Nivel empresa, no punto de venta
  nombre VARCHAR(255),
  UNIQUE(empresa_id, nombre)
);
```

---

#### Riesgo 2: Asignaciones incorrectas de empresa/marca/PTV

**Problema:**
```
Trabajador asignado a Tiana (MRC-001 Pizzas) 
crea pedido en Badalona (MRC-002 Burguers)
```

**Solución:**
```javascript
// Validación al crear pedido
BEFORE INSERT ON pedido:
  // Verificar que trabajador esté asignado al punto de venta
  rol_usuario = GET rol_usuario 
  WHERE usuario_id = pedido.trabajador_id
    AND punto_venta_id = pedido.punto_venta_id
  
  IF rol_usuario NOT FOUND:
    THROW ERROR 'Trabajador no asignado a este punto de venta'
  
  // Verificar coherencia empresa > marca > PTV
  punto_venta = GET punto_venta WHERE id = pedido.punto_venta_id
  
  IF punto_venta.empresa_id != pedido.empresa_id:
    THROW ERROR 'Empresa no coincide con punto de venta'
  
  IF punto_venta.marca_id != pedido.marca_id:
    THROW ERROR 'Marca no coincide con punto de venta'
```

---

#### Riesgo 3: Stock desalineado por cambios en escandallo

**Problema:**
```
Pizza Margarita usa 0.250kg harina
Se actualiza escandallo a 0.300kg harina
Stock no refleja el cambio en pedidos anteriores
```

**Solución:**
```javascript
// Guardar costes en línea_pedido al crear pedido
WHEN pedido.creado:
  FOR cada linea IN pedido.lineas:
    // Guardar costes actuales del escandallo
    linea.coste_unitario_ingredientes = CALCULAR_COSTE_ESCANDALLO(linea.producto_id)
    linea.coste_unitario_envases = producto.coste_envases
    
    // No recalcular posteriormente
    // Usar siempre los valores guardados en línea_pedido

// Histórico de cambios en escandallo
CREATE TABLE escandallo_historico (
  escandallo_historico_id VARCHAR(50),
  producto_id VARCHAR(50),
  articulo_id VARCHAR(50),
  cantidad_anterior DECIMAL(10,3),
  cantidad_nueva DECIMAL(10,3),
  fecha_cambio TIMESTAMP,
  usuario_cambio VARCHAR(50)
);
```

---

### 5.2. CAMPOS CALCULADOS ÚTILES

#### En tabla PEDIDO:

```sql
ALTER TABLE pedido ADD COLUMN margen_porcentaje DECIMAL(5,2) GENERATED ALWAYS AS (
  (margen_bruto / total_venta) * 100
) STORED;

ALTER TABLE pedido ADD COLUMN coste_fijo_imputado DECIMAL(10,2);
-- Calculado mensualmente por escenario Make

ALTER TABLE pedido ADD COLUMN rentabilidad_neta DECIMAL(10,2) GENERATED ALWAYS AS (
  margen_bruto - coste_fijo_imputado
) STORED;
```

#### En tabla PUNTO_VENTA:

```sql
ALTER TABLE punto_venta ADD COLUMN ingresos_mes_actual DECIMAL(10,2);
ALTER TABLE punto_venta ADD COLUMN pedidos_mes_actual INT;
ALTER TABLE punto_venta ADD COLUMN ticket_medio_mes DECIMAL(10,2) GENERATED ALWAYS AS (
  CASE WHEN pedidos_mes_actual > 0 
    THEN ingresos_mes_actual / pedidos_mes_actual 
    ELSE 0 
  END
) STORED;
```

#### En tabla TRABAJADOR (usuario):

```sql
CREATE TABLE kpi_trabajador (
  kpi_trabajador_id VARCHAR(50) PRIMARY KEY,
  trabajador_id VARCHAR(50),
  mes DATE, -- primer día del mes
  horas_trabajadas DECIMAL(6,2),
  pedidos_gestionados INT,
  ventas_totales DECIMAL(10,2),
  productividad DECIMAL(6,2),
  UNIQUE(trabajador_id, mes)
);
```

---

### 5.3. ESTRUCTURA REUTILIZABLE EN EVENTOS Y CONSTRUCCIÓN

**Adaptación para EVENTOS:**

```json
{
  "empresa_id": "EMP-002",
  "nombre": "Eventos",
  "tipo_negocio": "eventos",
  
  "marca": {
    "marca_id": "MRC-003",
    "nombre_comercial": "Catering PAU"
  },
  
  "punto_venta": {
    "punto_venta_id": "PDV-003",
    "nombre": "Base Central",
    "tipo_evento": "bodas_corporativos"
  },
  
  "producto": {
    "producto_id": "PRD-EVENT-001",
    "nombre": "Menú Boda Premium",
    "precio_venta": 85.00,
    "coste_ingredientes": 32.00,
    "coste_servicio": 18.00, // Nuevo campo específico eventos
    "comensales_minimo": 50 // Nuevo campo específico eventos
  },
  
  "pedido": {
    "pedido_id": "PED-EVENT-001",
    "tipo_pedido": "evento", // Nuevo valor
    "fecha_evento": "2025-01-15", // Nuevo campo
    "num_comensales": 120, // Nuevo campo
    "ubicacion_evento": "Hotel Majestic" // Nuevo campo
  }
}
```

**Adaptación para CONSTRUCCIÓN:**

```json
{
  "empresa_id": "EMP-003",
  "nombre": "Construcción",
  "tipo_negocio": "construccion",
  
  "marca": {
    "marca_id": "MRC-004",
    "nombre_comercial": "Obras PAU"
  },
  
  "punto_venta": {
    "punto_venta_id": "PDV-004",
    "nombre": "Obra Barcelona Centro",
    "tipo_obra": "reforma_integral"
  },
  
  "producto": {
    // En construcción, "producto" = "partida de obra"
    "producto_id": "PRD-OBRA-001",
    "nombre": "Reforma completa cocina",
    "precio_venta": 8500.00,
    "coste_materiales": 3200.00,
    "coste_mano_obra": 2800.00, // Nuevo campo específico construcción
    "dias_estimados": 12 // Nuevo campo específico construcción
  },
  
  "pedido": {
    // En construcción, "pedido" = "presupuesto aceptado"
    "pedido_id": "PED-OBRA-001",
    "tipo_pedido": "obra",
    "fecha_inicio": "2025-02-01",
    "fecha_fin_estimada": "2025-02-12",
    "direccion_obra": "Calle Mayor 123" // Nuevo campo
  }
}
```

---

## 📦 ENTREGA FINAL

### ✅ Todo preparado para Figma

**Nombres exactos de campos:**
- Todos en snake_case para BBDD
- Todos en camelCase para Make
- Tablas listas para crear modelos visuales

**Ejemplo de uso en Figma:**
```javascript
// Componente Usuario
usuario_id: "USR-001"
nombre_completo: "Carlos Martínez"
rol_principal: "gerente_general"
empresa_id_defecto: "EMP-001"
marca_id_defecto: "MRC-001"
punto_venta_id_defecto: "PDV-001"
```

---

### ✅ Claves de sincronización Make

**Ejemplo webhook nuevo pedido:**
```json
{
  "event": "pedidoCreado",
  "data": {
    "pedidoId": "PED-001",
    "empresaId": "EMP-001",
    "marcaId": "MRC-001",
    "puntoVentaId": "PDV-001",
    "totalVenta": 37.50,
    "metodoPago": "tarjeta"
  }
}
```

---

### ✅ Ejemplos reales aplicados

**Caso Pizzas/Burguers + Tiana/Badalona:**

Todos los ejemplos en este documento usan:
- Empresa: "EMP-001 - Hostelería"
- Marcas: "MRC-001 - Pizzas" y "MRC-002 - Burguers"
- Puntos de Venta: "PDV-001 - Tiana" y "PDV-002 - Badalona"

---

### ✅ Arquitectura escalable

**Añadir nueva empresa (Eventos):**
1. INSERT INTO empresa (empresa_id, nombre, tipo_negocio)
2. INSERT INTO marca (marca_id, empresa_id, nombre_comercial)
3. INSERT INTO punto_venta (punto_venta_id, empresa_id, marca_id, nombre)
4. TODOS los KPIs y reportes funcionan automáticamente

**Añadir nuevo punto de venta:**
1. INSERT INTO punto_venta (...)
2. Sistema automáticamente:
   - Calcula costes fijos proporcionales
   - Incluye en dashboards
   - Permite filtrar por nuevo PTV
   - Genera reportes independientes

---

## 🎉 CONCLUSIÓN

**Sistema completamente listo para:**
- ✅ Crear entidades en Figma
- ✅ Conectar webhooks Make
- ✅ Calcular KPIs automáticos
- ✅ Escalar a nuevas empresas
- ✅ Adaptar a Eventos y Construcción

**El programador tiene:**
- 21 tablas SQL completas
- 6 cálculos CORE con fórmulas
- 6 roles con permisos CRUD
- 4 escenarios Make documentados
- Validaciones y optimizaciones

**Todo está documentado, ejemplificado y listo para implementar.**

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Arquitectura Completa
