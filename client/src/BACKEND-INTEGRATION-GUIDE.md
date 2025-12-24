# 🚀 GUÍA DE INTEGRACIÓN BACKEND - UDAR EDGE

**Objetivo**: Conectar el frontend (React) con un backend funcional  
**Stack sugerido**: Node.js + Express + PostgreSQL (o similar)  
**Prioridad**: MVP primero, optimizar después

---

## 📋 TABLA DE CONTENIDOS

1. [Esquema de Base de Datos](#esquema-de-base-de-datos)
2. [Endpoints Prioritarios (MVP)](#endpoints-prioritarios-mvp)
3. [Estructura de Responses](#estructura-de-responses)
4. [Autenticación y Seguridad](#autenticación-y-seguridad)
5. [Migraciones de LocalStorage](#migraciones-de-localstorage)
6. [Testing y Validación](#testing-y-validación)

---

## 1. ESQUEMA DE BASE DE DATOS

### 1.1 Tabla: `empresas`

```sql
CREATE TABLE empresas (
  id VARCHAR(20) PRIMARY KEY,                    -- 'EMP-001'
  codigo VARCHAR(10) UNIQUE NOT NULL,            -- 'EMP001'
  nombre_fiscal VARCHAR(255) NOT NULL,           -- 'Disarmink S.L.'
  nombre_comercial VARCHAR(255) NOT NULL,        -- 'Disarmink'
  nif VARCHAR(20) UNIQUE NOT NULL,               -- 'B12345678'
  direccion_fiscal TEXT,
  telefono VARCHAR(20),
  email VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_empresas_activo ON empresas(activo);
```

---

### 1.2 Tabla: `marcas`

```sql
CREATE TABLE marcas (
  id VARCHAR(20) PRIMARY KEY,                    -- 'MRC-001'
  codigo VARCHAR(10) UNIQUE NOT NULL,            -- 'MOD'
  nombre VARCHAR(100) NOT NULL,                  -- 'Modomio'
  empresa_id VARCHAR(20) NOT NULL,               -- FK a empresas
  color_identidad VARCHAR(7),                    -- '#FF5722'
  logo_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_marcas_empresa ON marcas(empresa_id);
CREATE INDEX idx_marcas_activo ON marcas(activo);
```

---

### 1.3 Tabla: `puntos_venta`

```sql
CREATE TABLE puntos_venta (
  id VARCHAR(20) PRIMARY KEY,                    -- 'PDV-TIANA'
  codigo VARCHAR(10) UNIQUE NOT NULL,            -- 'TIA'
  nombre VARCHAR(100) NOT NULL,                  -- 'Tiana'
  empresa_id VARCHAR(20) NOT NULL,               -- FK a empresas
  direccion TEXT,
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  telefono VARCHAR(20),
  email VARCHAR(255),
  horario_apertura TIME,
  horario_cierre TIME,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_pdv_empresa ON puntos_venta(empresa_id);
CREATE INDEX idx_pdv_activo ON puntos_venta(activo);
```

---

### 1.4 Tabla: `puntos_venta_marcas` (relación N:M)

```sql
CREATE TABLE puntos_venta_marcas (
  punto_venta_id VARCHAR(20) NOT NULL,
  marca_id VARCHAR(20) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (punto_venta_id, marca_id),
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE CASCADE,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_pdv_marcas_pdv ON puntos_venta_marcas(punto_venta_id);
CREATE INDEX idx_pdv_marcas_marca ON puntos_venta_marcas(marca_id);
```

---

### 1.5 Tabla: `productos`

```sql
CREATE TABLE productos (
  id VARCHAR(20) PRIMARY KEY,                    -- 'PROD-001'
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  empresa_id VARCHAR(20) NOT NULL,
  marca_id VARCHAR(20) NOT NULL,
  categoria VARCHAR(100),
  tipo VARCHAR(20) NOT NULL,                     -- 'simple', 'manufacturado', 'combo'
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_productos_empresa_marca ON productos(empresa_id, marca_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_categoria ON productos(categoria);
```

---

### 1.6 Tabla: `productos_puntos_venta` (disponibilidad por PDV)

```sql
CREATE TABLE productos_puntos_venta (
  producto_id VARCHAR(20) NOT NULL,
  punto_venta_id VARCHAR(20) NOT NULL,
  precio_pdv DECIMAL(10, 2),                     -- Precio específico del PDV (opcional)
  stock_disponible INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (producto_id, punto_venta_id),
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_prod_pdv_producto ON productos_puntos_venta(producto_id);
CREATE INDEX idx_prod_pdv_pdv ON productos_puntos_venta(punto_venta_id);
```

---

### 1.7 Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
  id VARCHAR(20) PRIMARY KEY,                    -- 'USR-001'
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt hash
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),
  telefono VARCHAR(20),
  rol VARCHAR(20) NOT NULL,                      -- 'cliente', 'trabajador', 'gerente'
  empresa_id VARCHAR(20),                        -- NULL para clientes
  activo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
```

---

### 1.8 Tabla: `trabajadores`

```sql
CREATE TABLE trabajadores (
  id VARCHAR(20) PRIMARY KEY,                    -- 'TRB-001'
  usuario_id VARCHAR(20) UNIQUE NOT NULL,        -- FK a usuarios
  empresa_id VARCHAR(20) NOT NULL,
  marca_id VARCHAR(20),
  punto_venta_id VARCHAR(20) NOT NULL,          -- PDV principal
  dni VARCHAR(20) UNIQUE,
  nss VARCHAR(20),
  puesto VARCHAR(100),
  departamento VARCHAR(100),
  tipo_contrato VARCHAR(20),                    -- 'indefinido', 'temporal', etc.
  fecha_alta DATE,
  fecha_baja DATE,
  salario_base DECIMAL(10, 2),
  horas_contrato INTEGER,                        -- Horas semanales
  estado VARCHAR(20) DEFAULT 'activo',          -- 'activo', 'vacaciones', 'baja'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL,
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_trabajadores_empresa ON trabajadores(empresa_id);
CREATE INDEX idx_trabajadores_pdv ON trabajadores(punto_venta_id);
CREATE INDEX idx_trabajadores_estado ON trabajadores(estado);
```

---

### 1.9 Tabla: `pedidos`

```sql
CREATE TABLE pedidos (
  id VARCHAR(20) PRIMARY KEY,                    -- 'PED-001'
  numero VARCHAR(20) UNIQUE,                     -- Número secuencial por PDV
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Contexto multiempresa
  empresa_id VARCHAR(20) NOT NULL,
  marca_id VARCHAR(20) NOT NULL,
  punto_venta_id VARCHAR(20) NOT NULL,
  
  -- Cliente
  cliente_id VARCHAR(20),                        -- FK a usuarios (si está registrado)
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20),
  cliente_direccion TEXT,
  
  -- Importes
  subtotal DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  cupon_aplicado VARCHAR(50),
  iva DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Pago
  metodo_pago VARCHAR(20) NOT NULL,             -- 'tarjeta', 'efectivo', 'bizum'
  estado_pago VARCHAR(20) DEFAULT 'pagado',     -- 'pagado', 'pendiente_cobro'
  pago_efectivo BOOLEAN DEFAULT false,
  
  -- Entrega
  tipo_entrega VARCHAR(20) NOT NULL,            -- 'recogida', 'domicilio'
  direccion_entrega TEXT,
  
  -- Estados
  estado VARCHAR(20) DEFAULT 'pendiente',       -- 'pendiente', 'pagado', 'en_preparacion', 'listo', 'entregado', 'cancelado'
  estado_entrega VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'preparando', 'listo', 'en_camino', 'entregado'
  
  -- Origen
  origen_pedido VARCHAR(20) NOT NULL,           -- 'app', 'tpv', 'glovo', 'justeat'
  
  -- Metadatos
  codigo_qr VARCHAR(100),
  repartidor_id VARCHAR(20),
  factura_id VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT,
  FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE RESTRICT,
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE RESTRICT,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_pedidos_empresa ON pedidos(empresa_id);
CREATE INDEX idx_pedidos_marca ON pedidos(marca_id);
CREATE INDEX idx_pedidos_pdv ON pedidos(punto_venta_id);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
```

---

### 1.10 Tabla: `items_pedido`

```sql
CREATE TABLE items_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id VARCHAR(20) NOT NULL,
  producto_id VARCHAR(20) NOT NULL,
  producto_nombre VARCHAR(255) NOT NULL,        -- Snapshot del nombre
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10, 2) NOT NULL,      -- Precio en el momento de la venta
  precio_total DECIMAL(10, 2) NOT NULL,
  opciones_personalizadas JSONB,                 -- Guarda las opciones seleccionadas
  notas TEXT,
  
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
);

-- Índices
CREATE INDEX idx_items_pedido ON items_pedido(pedido_id);
CREATE INDEX idx_items_producto ON items_pedido(producto_id);
```

---

## 2. ENDPOINTS PRIORITARIOS (MVP)

### 2.1 Autenticación

#### `POST /api/auth/login`
**Request**:
```json
{
  "email": "gerente@disarmink.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "USR-001",
    "email": "gerente@disarmink.com",
    "nombre": "Juan",
    "apellidos": "García",
    "rol": "gerente",
    "empresaId": "EMP-001",
    "puntosVentaAcceso": ["PDV-TIANA", "PDV-BADALONA"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### `GET /api/auth/me`
**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "USR-001",
    "email": "gerente@disarmink.com",
    "nombre": "Juan",
    "rol": "gerente",
    "empresaId": "EMP-001"
  }
}
```

---

### 2.2 Productos

#### `GET /api/productos`
**Query params**:
- `empresaId` (opcional)
- `marcaId` (opcional)
- `puntoVentaId` (opcional)
- `categoria` (opcional)
- `activo` (opcional, default: true)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "PROD-001",
      "nombre": "Combo Satisfayer",
      "descripcion": "Personaliza tu pedido...",
      "precio": 15.90,
      "empresaId": "EMP-001",
      "marcaId": "MRC-002",
      "categoria": "Combos",
      "tipo": "combo",
      "destacado": true,
      "imagenUrl": "https://...",
      "puntosVentaDisponibles": ["PDV-TIANA", "PDV-BADALONA"],
      "gruposOpciones": [ ... ]
    }
  ],
  "total": 45
}
```

---

#### `POST /api/productos`
**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "nombre": "Nueva Hamburguesa",
  "precio": 8.50,
  "empresaId": "EMP-001",
  "marcaId": "MRC-002",
  "categoria": "Hamburguesas",
  "tipo": "simple",
  "puntosVentaIds": ["PDV-TIANA"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "PROD-125",
    "nombre": "Nueva Hamburguesa",
    ...
  }
}
```

---

### 2.3 Pedidos

#### `GET /api/pedidos`
**Query params**:
- `empresaId` (opcional)
- `marcaId` (opcional)
- `puntoVentaId` (opcional)
- `fechaInicio` (opcional, ISO 8601)
- `fechaFin` (opcional, ISO 8601)
- `estado` (opcional)
- `page` (default: 1)
- `limit` (default: 50)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "PED-001",
      "numero": "001",
      "fecha": "2025-12-03T10:30:00Z",
      "empresaId": "EMP-001",
      "empresaNombre": "Disarmink S.L.",
      "marcaId": "MRC-001",
      "marcaNombre": "Modomio",
      "puntoVentaId": "PDV-TIANA",
      "puntoVentaNombre": "Tiana",
      "cliente": {
        "id": "USR-123",
        "nombre": "María López",
        "email": "maria@example.com",
        "telefono": "+34666777888"
      },
      "items": [
        {
          "productoId": "PROD-001",
          "productoNombre": "Combo Satisfayer",
          "cantidad": 1,
          "precioUnitario": 15.90,
          "precioTotal": 15.90,
          "opcionesPersonalizadas": {
            "burger": ["bacon", "clasica"],
            "side": ["patatas"],
            "bebida": ["coca"]
          }
        }
      ],
      "subtotal": 15.90,
      "descuento": 0,
      "iva": 1.67,
      "total": 17.57,
      "metodoPago": "tarjeta",
      "estadoPago": "pagado",
      "estado": "entregado",
      "origenPedido": "tpv"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 127,
    "totalPages": 3
  }
}
```

---

#### `POST /api/pedidos`
**Headers**: `Authorization: Bearer <token>`

**Request**:
```json
{
  "empresaId": "EMP-001",
  "marcaId": "MRC-001",
  "puntoVentaId": "PDV-TIANA",
  "cliente": {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "+34666555444"
  },
  "items": [
    {
      "productoId": "PROD-001",
      "cantidad": 2,
      "precioUnitario": 15.90,
      "opcionesPersonalizadas": { ... }
    }
  ],
  "subtotal": 31.80,
  "iva": 3.34,
  "total": 35.14,
  "metodoPago": "tarjeta",
  "tipoEntrega": "recogida",
  "origenPedido": "tpv"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "PED-532",
    "numero": "532",
    "fecha": "2025-12-03T15:45:00Z",
    ...
  }
}
```

---

### 2.4 Trabajadores

#### `GET /api/trabajadores`
**Query params**:
- `empresaId` (opcional)
- `marcaId` (opcional)
- `puntoVentaId` (opcional)
- `estado` (opcional)
- `departamento` (opcional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "TRB-001",
      "nombre": "Carlos",
      "apellidos": "Méndez",
      "email": "carlos@disarmink.com",
      "telefono": "+34666111222",
      "empresaId": "EMP-001",
      "marcaId": "MRC-001",
      "puntoVentaId": "PDV-TIANA",
      "puntosVentaAsignados": ["PDV-TIANA", "PDV-BADALONA"],
      "puesto": "Panadero Maestro",
      "departamento": "Producción",
      "tipoContrato": "indefinido",
      "horasContrato": 160,
      "salarioBase": 1800.00,
      "estado": "activo",
      "fechaAlta": "2023-01-15"
    }
  ],
  "total": 12
}
```

---

### 2.5 Reportes

#### `GET /api/reportes/ventas`
**Query params**:
- `empresaId` (requerido)
- `marcaId` (opcional)
- `puntoVentaId` (opcional)
- `periodo` (opciones: 'hoy', 'ayer', 'semana_actual', 'mes_actual', 'personalizado')
- `fechaInicio` (si periodo='personalizado')
- `fechaFin` (si periodo='personalizado')

**Response**:
```json
{
  "success": true,
  "data": {
    "empresaId": "EMP-001",
    "marcaId": "MRC-001",
    "puntoVentaId": "PDV-TIANA",
    "periodo": {
      "tipo": "mes_actual",
      "fechaInicio": "2025-12-01",
      "fechaFin": "2025-12-31"
    },
    "kpis": {
      "ventasTotales": 45380.50,
      "numeroPedidos": 532,
      "ticketMedio": 85.30,
      "ventasEfectivo": 12500.00,
      "ventasTarjeta": 28900.50,
      "ventasBizum": 3980.00,
      "ventasTransferencia": 0.00
    },
    "ventasPorDia": [
      {
        "fecha": "2025-12-01",
        "ventas": 1520.00,
        "pedidos": 18
      },
      ...
    ]
  }
}
```

---

#### `GET /api/reportes/ebitda`
**Query params**:
- `empresaId` (requerido)
- `puntoVentaId` (opcional)
- `periodo` (igual que ventas)
- `fechaInicio` (opcional)
- `fechaFin` (opcional)

**Response**:
```json
{
  "success": true,
  "data": {
    "filtros": {
      "empresaId": "EMP-001",
      "puntoVentaId": "PDV-TIANA",
      "periodo": "mes_actual"
    },
    "lineas": [
      {
        "id": "ING-001",
        "grupo": "INGRESOS_NETOS",
        "concepto": "Venta en mostrador",
        "tipo": "detalle",
        "objetivoMes": 175000,
        "importeReal": 183750,
        "cumplimientoPct": 105,
        "estado": "up"
      },
      {
        "id": "ING-002",
        "grupo": "INGRESOS_NETOS",
        "concepto": "App / Web",
        "tipo": "detalle",
        "objetivoMes": 85000,
        "importeReal": 91800,
        "cumplimientoPct": 108,
        "estado": "up"
      }
    ],
    "totales": {
      "ingresosNetos": 316700,
      "costeVentas": 89500,
      "margenBruto": 227200,
      "gastosOperativos": 158750,
      "ebitda": 68450
    }
  }
}
```

---

## 3. CONFIGURACIÓN EN EL FRONTEND

### 3.1 Crear archivo de configuración

**Archivo**: `/config/api.config.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Productos
  PRODUCTOS: `${API_BASE_URL}/productos`,
  PRODUCTO_BY_ID: (id: string) => `${API_BASE_URL}/productos/${id}`,
  
  // Pedidos
  PEDIDOS: `${API_BASE_URL}/pedidos`,
  PEDIDO_BY_ID: (id: string) => `${API_BASE_URL}/pedidos/${id}`,
  
  // Trabajadores
  TRABAJADORES: `${API_BASE_URL}/trabajadores`,
  TRABAJADOR_BY_ID: (id: string) => `${API_BASE_URL}/trabajadores/${id}`,
  
  // Reportes
  REPORTES_VENTAS: `${API_BASE_URL}/reportes/ventas`,
  REPORTES_EBITDA: `${API_BASE_URL}/reportes/ebitda`,
  REPORTES_CIERRES: `${API_BASE_URL}/reportes/cierres`,
};

export default API_BASE_URL;
```

---

### 3.2 Ejemplo de integración en servicio

**Archivo**: `/services/pedidos.service.ts` (modificado)

```typescript
import { API_ENDPOINTS } from '../config/api.config';

export async function crearPedido(pedido: Pedido): Promise<Pedido> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(API_ENDPOINTS.PEDIDOS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pedido)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear pedido');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error:', error);
    
    // FALLBACK: Guardar en localStorage si falla la API
    const pedidos = JSON.parse(localStorage.getItem('udar_pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('udar_pedidos', JSON.stringify(pedidos));
    
    return pedido;
  }
}
```

---

## 4. AUTENTICACIÓN Y SEGURIDAD

### 4.1 JWT (JSON Web Tokens)

**Implementación sugerida**:

```javascript
// Backend: Generar token al login
const jwt = require('jsonwebtoken');

function generarToken(usuario) {
  const payload = {
    userId: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    empresaId: usuario.empresa_id
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}
```

---

### 4.2 Middleware de autenticación

```javascript
// Backend: Middleware para proteger rutas
function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token no proporcionado' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
}
```

---

### 4.3 Permisos por rol

```javascript
// Backend: Verificar permisos
function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autenticado' 
      });
    }
    
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos' 
      });
    }
    
    next();
  };
}

// Uso:
app.post('/api/productos', 
  verificarToken, 
  requiereRol('gerente', 'trabajador'), 
  crearProducto
);
```

---

## 5. MIGRACIONES DE LOCALSTORAGE

### Script para migrar datos de prueba

**Archivo**: `/scripts/migrate-to-backend.ts`

```typescript
async function migrarPedidos() {
  const pedidos = JSON.parse(localStorage.getItem('udar_pedidos') || '[]');
  
  for (const pedido of pedidos) {
    try {
      await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
      console.log(`✅ Pedido ${pedido.id} migrado`);
    } catch (error) {
      console.error(`❌ Error migrando ${pedido.id}:`, error);
    }
  }
}
```

---

## 6. TESTING

### 6.1 Test de endpoints con cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gerente@disarmink.com","password":"password123"}'

# Obtener productos
curl -X GET "http://localhost:3001/api/productos?empresaId=EMP-001&marcaId=MRC-001" \
  -H "Authorization: Bearer <TOKEN>"

# Crear pedido
curl -X POST http://localhost:3001/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d @pedido.json
```

---

## ✅ CHECKLIST FINAL

### Backend debe tener:
- [ ] Base de datos creada con todas las tablas
- [ ] Endpoint de login funcional
- [ ] Endpoints de productos (GET y POST)
- [ ] Endpoints de pedidos (GET y POST)
- [ ] JWT implementado
- [ ] CORS configurado para el frontend
- [ ] Variables de entorno (.env)

### Frontend debe modificar:
- [ ] Crear `/config/api.config.ts`
- [ ] Actualizar `/services/pedidos.service.ts`
- [ ] Actualizar `/services/reportes-multiempresa.service.ts`
- [ ] Probar flujo: Login → Ver productos → Crear pedido

---

## 🎯 PRÓXIMOS PASOS

1. **Crear base de datos** (1 día)
2. **Implementar endpoints de autenticación** (1 día)
3. **Implementar CRUD de productos** (1 día)
4. **Implementar gestión de pedidos** (2 días)
5. **Probar integración con frontend** (1 día)
6. **Ajustar y corregir errores** (1-2 días)

**Total estimado**: 7-10 días para MVP funcional

---

¿Necesitas algo más específico o tienes dudas sobre algún endpoint?
