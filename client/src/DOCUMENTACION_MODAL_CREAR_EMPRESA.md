# 📄 DOCUMENTACIÓN TÉCNICA - MODAL CREAR EMPRESA

**Proyecto:** Udar Edge - Sistema SaaS Multiempresa  
**Componente:** ModalCrearEmpresa + ModalCrearAgente  
**Versión:** 1.0  
**Fecha:** 26 Noviembre 2024

---

## 📋 ÍNDICE

1. [Descripción General](#1-descripción-general)
2. [Estructura de Datos](#2-estructura-de-datos)
3. [Interfaces TypeScript](#3-interfaces-typescript)
4. [Endpoints API](#4-endpoints-api)
5. [Validaciones Frontend](#5-validaciones-frontend)
6. [Flujo de Datos](#6-flujo-de-datos)
7. [Eventos Make](#7-eventos-make)
8. [Reglas de Negocio](#8-reglas-de-negocio)

---

## 1. DESCRIPCIÓN GENERAL

### ModalCrearEmpresa

**Objetivo:** Crear una nueva empresa con toda su estructura: marcas, puntos de venta, cuentas bancarias y agentes externos.

**Ubicación:** `/components/gerente/ModalCrearEmpresa.tsx`

**Trigger:** Botón "Crear Nueva Empresa" en Configuración > Empresas

**Flujo de creación:**
1. Datos fiscales y legales
2. Marcas de la empresa (múltiples)
3. Puntos de venta (múltiples, vinculados a marcas)
4. Cuentas bancarias (múltiples, opcional)
5. Estado de la empresa (activa/inactiva)
6. Opción de añadir agentes externos

---

### ModalCrearAgente

**Objetivo:** Crear un agente externo (proveedor, gestor, auditor) vinculado a la empresa.

**Ubicación:** `/components/gerente/ModalCrearAgente.tsx`

**Trigger:** Botón "Añadir Agente Externo" dentro del ModalCrearEmpresa

**Campos:**
- Datos básicos (nombre, tipo, email, teléfono)
- Asignación (empresa, marca opcional, punto de venta opcional)
- Permisos (6 tipos diferentes)
- Estado (activo/inactivo)

---

## 2. ESTRUCTURA DE DATOS

### 2.1. EMPRESA

**Tabla BBDD:** `empresas`

| Campo | Tipo | Obligatorio | Ejemplo | Generación |
|-------|------|-------------|---------|------------|
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-123456" | Auto (frontend) |
| `nombre_fiscal` | VARCHAR(255) | ✅ | "PAU Hostelería S.L." | Manual |
| `cif` | VARCHAR(20) | ✅ | "B12345678" | Manual |
| `domicilio_fiscal` | TEXT | ✅ | "Av. Diagonal 100, Barcelona" | Manual |
| `nombre_comercial` | VARCHAR(200) | ✅ | "PAU Hostelería" | Manual |
| `convenio_colectivo_id` | VARCHAR(50) | ❌ | "CONV-001" | Manual |
| `empresa_activa` | BOOLEAN | ✅ | true | Manual |
| `created_at` | TIMESTAMP | ✅ | auto | Auto (backend) |
| `updated_at` | TIMESTAMP | ✅ | auto | Auto (backend) |

**Generación de ID:**
```javascript
const generarEmpresaId = () => {
  const timestamp = Date.now();
  return `EMP-${timestamp.toString().slice(-6)}`;
};
```

---

### 2.2. MARCA

**Tabla BBDD:** `marcas`

| Campo | Tipo | Obligatorio | Ejemplo | Generación |
|-------|------|-------------|---------|------------|
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | Auto (frontend) |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-123456" | FK |
| `marca_nombre` | VARCHAR(200) | ✅ | "PIZZAS" | Manual |
| `marca_codigo` | VARCHAR(50) | ✅ | "MRC-001" | Auto (frontend) |
| `color_identidad` | VARCHAR(7) | ❌ | "#0d9488" | Manual |
| `activo` | BOOLEAN | ✅ | true | Auto (true) |
| `created_at` | TIMESTAMP | ✅ | auto | Auto (backend) |
| `updated_at` | TIMESTAMP | ✅ | auto | Auto (backend) |

**Generación de código:**
```javascript
const generarMarcaCodigo = (index: number) => {
  return `MRC-${String(index + 1).padStart(3, '0')}`;
};
```

**Ejemplo:**
- Primera marca: `MRC-001`
- Segunda marca: `MRC-002`
- Tercera marca: `MRC-003`

---

### 2.3. PUNTO_VENTA

**Tabla BBDD:** `puntos_venta`

| Campo | Tipo | Obligatorio | Ejemplo | Generación |
|-------|------|-------------|---------|------------|
| `punto_venta_id` | VARCHAR(50) | ✅ | "PDV-001" | Auto (frontend) |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-123456" | FK |
| `marca_id` | VARCHAR(50) | ✅ | "MRC-001" | FK (selección manual) |
| `pv_nombre_comercial` | VARCHAR(200) | ✅ | "Tiana" | Manual |
| `pv_direccion` | TEXT | ✅ | "Calle Mayor 45" | Manual |
| `activo` | BOOLEAN | ✅ | true | Auto (true) |
| `created_at` | TIMESTAMP | ✅ | auto | Auto (backend) |
| `updated_at` | TIMESTAMP | ✅ | auto | Auto (backend) |

**Generación de ID:**
```javascript
puntoVentaId: `PDV-${String(index + 1).padStart(3, '0')}`
```

**⚠️ REGLA CRÍTICA:**
- Un punto de venta SIEMPRE debe tener una marca asignada (`marca_id`)
- No se puede crear un punto de venta si no existe al menos 1 marca

---

### 2.4. CUENTA_BANCARIA

**Tabla BBDD:** `cuentas_bancarias`

| Campo | Tipo | Obligatorio | Ejemplo | Generación |
|-------|------|-------------|---------|------------|
| `cuenta_id` | VARCHAR(50) | ✅ | "CTA-001" | Auto (frontend) |
| `empresa_id` | VARCHAR(50) | ✅ | "EMP-123456" | FK |
| `iban` | VARCHAR(34) | ✅ | "ES91 2100 0418 4502 0005 1332" | Manual |
| `alias_cuenta` | VARCHAR(100) | ✅ | "Cuenta principal" | Manual |
| `activo` | BOOLEAN | ✅ | true | Auto (true) |
| `created_at` | TIMESTAMP | ✅ | auto | Auto (backend) |

**Generación de ID:**
```javascript
cuentaId: `CTA-${String(index + 1).padStart(3, '0')}`
```

---

### 2.5. AGENTE_EXTERNO

**Tabla BBDD:** `agentes_externos`

| Campo | Tipo | Obligatorio | Ejemplo | Generación |
|-------|------|-------------|---------|------------|
| `agente_id` | VARCHAR(50) | ✅ | "AGE-123456" | Auto (frontend) |
| `empresa_asignada_id` | VARCHAR(50) | ✅ | "EMP-123456" | FK |
| `marca_asignada_id` | VARCHAR(50) | ❌ | "MRC-001" | FK (opcional) |
| `punto_venta_asignado_id` | VARCHAR(50) | ❌ | "PDV-001" | FK (opcional) |
| `agente_nombre` | VARCHAR(255) | ✅ | "Harinas del Norte S.L." | Manual |
| `agente_tipo` | ENUM | ✅ | "Proveedor" | Manual |
| `agente_email` | VARCHAR(255) | ✅ | "contacto@proveedor.com" | Manual |
| `agente_telefono` | VARCHAR(20) | ✅ | "+34 900 123 456" | Manual |
| `permisos` | JSON | ✅ | {...} | Manual |
| `estado` | BOOLEAN | ✅ | true | Manual |
| `fecha_creacion` | TIMESTAMP | ✅ | auto | Auto (backend) |

**Valores `agente_tipo`:**
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

**Generación de ID:**
```javascript
const generarAgenteId = () => {
  const timestamp = Date.now();
  return `AGE-${timestamp.toString().slice(-6)}`;
};
```

---

## 3. INTERFACES TYPESCRIPT

### Interface Marca (Frontend)
```typescript
interface Marca {
  marcaNombre: string;
  marcaCodigo: string;
  colorIdentidad: string;
}
```

### Interface PuntoVenta (Frontend)
```typescript
interface PuntoVenta {
  pvNombreComercial: string;
  pvDireccion: string;
  marcaId: string;
}
```

### Interface CuentaBancaria (Frontend)
```typescript
interface CuentaBancaria {
  iban: string;
  aliasCuenta: string;
}
```

### Interface Permisos
```typescript
interface Permisos {
  recibirPedidos: boolean;
  entregarAlbaranes: boolean;
  exportarFacturacion: boolean;
  recibirFacturas: boolean;
  verInventario: boolean;
  editarProductos: boolean;
}
```

---

## 4. ENDPOINTS API

### 4.1. Crear Empresa Completa

**Endpoint:** `POST /api/empresas`

**Request Body:**
```json
{
  "empresaId": "EMP-123456",
  "nombreFiscal": "PAU Hostelería S.L.",
  "cif": "B12345678",
  "domicilioFiscal": "Av. Diagonal 100, Barcelona",
  "nombreComercial": "PAU Hostelería",
  "convenioColectivoId": "CONV-001",
  "empresaActiva": true,
  "marcas": [
    {
      "marcaNombre": "PIZZAS",
      "marcaCodigo": "MRC-001",
      "colorIdentidad": "#FF5733",
      "empresaId": "EMP-123456"
    },
    {
      "marcaNombre": "BURGUERS",
      "marcaCodigo": "MRC-002",
      "colorIdentidad": "#0d9488",
      "empresaId": "EMP-123456"
    }
  ],
  "puntosVenta": [
    {
      "puntoVentaId": "PDV-001",
      "empresaId": "EMP-123456",
      "marcaId": "MRC-001",
      "pvNombreComercial": "Tiana",
      "pvDireccion": "Calle Mayor 45"
    },
    {
      "puntoVentaId": "PDV-002",
      "empresaId": "EMP-123456",
      "marcaId": "MRC-001",
      "pvNombreComercial": "Badalona",
      "pvDireccion": "Calle Menor 10"
    }
  ],
  "cuentasBancarias": [
    {
      "cuentaId": "CTA-001",
      "empresaId": "EMP-123456",
      "iban": "ES91 2100 0418 4502 0005 1332",
      "aliasCuenta": "Cuenta principal"
    }
  ]
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Empresa creada correctamente",
  "data": {
    "empresaId": "EMP-123456",
    "nombreComercial": "PAU Hostelería",
    "marcasCreadas": 2,
    "puntosVentaCreados": 2,
    "cuentasBancariasCreadas": 1
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "El CIF ya existe en el sistema",
  "code": "DUPLICATE_CIF"
}
```

---

### 4.2. Crear Agente Externo

**Endpoint:** `POST /api/agentes-externos`

**Request Body:**
```json
{
  "agenteId": "AGE-123456",
  "agenteNombre": "Harinas del Norte S.L.",
  "agenteTipo": "Proveedor",
  "agenteEmail": "contacto@proveedor.com",
  "agenteTelefono": "+34 900 123 456",
  "empresaAsignadaId": "EMP-123456",
  "empresaAsignadaNombre": "PAU Hostelería",
  "marcaAsignadaId": "MRC-001",
  "puntoVentaAsignadoId": null,
  "permisos": {
    "recibirPedidos": true,
    "entregarAlbaranes": true,
    "exportarFacturacion": false,
    "recibirFacturas": true,
    "verInventario": false,
    "editarProductos": false
  },
  "estado": true,
  "fechaCreacion": "2024-11-26T10:30:00Z"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Agente externo creado correctamente",
  "data": {
    "agenteId": "AGE-123456",
    "agenteNombre": "Harinas del Norte S.L.",
    "agenteTipo": "Proveedor",
    "empresaAsignada": "PAU Hostelería"
  }
}
```

---

## 5. VALIDACIONES FRONTEND

### 5.1. Validaciones Empresa

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `nombreFiscal` | No vacío | "El nombre fiscal es obligatorio" |
| `cif` | No vacío | "El CIF es obligatorio" |
| `domicilioFiscal` | No vacío | "El domicilio fiscal es obligatorio" |
| `nombreComercial` | No vacío | "El nombre comercial es obligatorio" |

### 5.2. Validaciones Marca

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `marcaNombre` | No vacío | "La marca {index} debe tener un nombre" |

### 5.3. Validaciones Punto de Venta

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `pvNombreComercial` | No vacío | "El punto de venta {index} debe tener un nombre comercial" |
| `pvDireccion` | No vacío | "El punto de venta {index} debe tener una dirección" |
| `marcaId` | Debe existir | "Debes crear al menos 1 Marca antes de añadir un Punto de Venta" |

### 5.4. Validaciones Cuenta Bancaria

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `iban` | No vacío | "La cuenta bancaria {index} debe tener un IBAN" |
| `aliasCuenta` | No vacío | "La cuenta bancaria {index} debe tener un alias" |

### 5.5. Validaciones Agente

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `agenteNombre` | No vacío | "El nombre del agente es obligatorio" |
| `agenteEmail` | No vacío + formato email | "El email del agente es obligatorio" |
| `agenteTelefono` | No vacío | "El teléfono del agente es obligatorio" |

---

## 6. FLUJO DE DATOS

### 6.1. Flujo Crear Empresa

```
┌─────────────────────────────────────────────┐
│ USUARIO                                     │
│ Completa formulario en ModalCrearEmpresa   │
└──────────────────┬──────────────────────────┘
                   │
                   │ Click "Crear Empresa"
                   ▼
┌─────────────────────────────────────────────┐
│ FRONTEND                                    │
│ 1. Validar todos los campos                │
│ 2. Generar IDs automáticos                 │
│ 3. Estructurar datos                       │
│ 4. console.log(datosEmpresa)               │
└──────────────────┬──────────────────────────┘
                   │
                   │ POST /api/empresas
                   ▼
┌─────────────────────────────────────────────┐
│ BACKEND (A implementar por programador)    │
│ 1. Validar datos recibidos                 │
│ 2. Verificar CIF único                     │
│ 3. Insertar empresa en BBDD                │
│ 4. Insertar marcas en BBDD                 │
│ 5. Insertar puntos de venta en BBDD        │
│ 6. Insertar cuentas bancarias en BBDD      │
│ 7. Trigger evento Make (opcional)          │
└──────────────────┬──────────────────────────┘
                   │
                   │ Response 201
                   ▼
┌─────────────────────────────────────────────┐
│ FRONTEND                                    │
│ 1. toast.success("Empresa creada")         │
│ 2. Cerrar modal                            │
│ 3. Resetear formulario                     │
│ 4. Actualizar lista de empresas            │
└─────────────────────────────────────────────┘
```

---

### 6.2. Flujo Crear Agente

```
┌─────────────────────────────────────────────┐
│ USUARIO                                     │
│ Click "Añadir Agente Externo"              │
└──────────────────┬──────────────────────────┘
                   │
                   │ Abre ModalCrearAgente
                   ▼
┌─────────────────────────────────────────────┐
│ FRONTEND                                    │
│ 1. Recibe marcas y puntos de venta         │
│ 2. Usuario completa formulario             │
│ 3. Selecciona marca (opcional)             │
│ 4. Selecciona punto de venta (opcional)    │
│ 5. Configura permisos                      │
└──────────────────┬──────────────────────────┘
                   │
                   │ Click "Crear Agente"
                   ▼
┌─────────────────────────────────────────────┐
│ FRONTEND                                    │
│ 1. Validar campos obligatorios             │
│ 2. Generar agenteId                        │
│ 3. Estructurar datos                       │
│ 4. console.log(datosAgente)                │
└──────────────────┬──────────────────────────┘
                   │
                   │ POST /api/agentes-externos
                   ▼
┌─────────────────────────────────────────────┐
│ BACKEND (A implementar por programador)    │
│ 1. Validar datos recibidos                 │
│ 2. Verificar empresa existe                │
│ 3. Verificar marca existe (si aplica)      │
│ 4. Insertar agente en BBDD                 │
└──────────────────┬──────────────────────────┘
                   │
                   │ Response 201
                   ▼
┌─────────────────────────────────────────────┐
│ FRONTEND                                    │
│ 1. toast.success("Agente creado")          │
│ 2. Cerrar modal                            │
│ 3. Resetear formulario                     │
└─────────────────────────────────────────────┘
```

---

## 7. EVENTOS MAKE

### 7.1. Evento: empresa_creada

**Trigger:** Cuando se crea una nueva empresa

**Webhook URL:** `https://hook.eu2.make.com/xxxxx`

**Payload:**
```json
{
  "event": "empresa_creada",
  "timestamp": "2024-11-26T10:30:00Z",
  "data": {
    "empresaId": "EMP-123456",
    "nombreFiscal": "PAU Hostelería S.L.",
    "nombreComercial": "PAU Hostelería",
    "cif": "B12345678",
    "numMarcas": 2,
    "numPuntosVenta": 2,
    "numCuentasBancarias": 1,
    "empresaActiva": true
  }
}
```

**Acciones Make:**
1. Enviar email de bienvenida al gerente
2. Crear estructura de carpetas en Drive/Storage
3. Notificar a equipo de onboarding
4. Crear dashboards iniciales en BI

---

### 7.2. Evento: agente_externo_creado

**Trigger:** Cuando se crea un nuevo agente externo

**Webhook URL:** `https://hook.eu2.make.com/xxxxx`

**Payload:**
```json
{
  "event": "agente_externo_creado",
  "timestamp": "2024-11-26T10:35:00Z",
  "data": {
    "agenteId": "AGE-123456",
    "agenteNombre": "Harinas del Norte S.L.",
    "agenteTipo": "Proveedor",
    "agenteEmail": "contacto@proveedor.com",
    "empresaAsignada": "EMP-123456",
    "marcaAsignada": "MRC-001",
    "permisos": ["recibirPedidos", "entregarAlbaranes", "recibirFacturas"]
  }
}
```

**Acciones Make:**
1. Enviar email de invitación al agente
2. Crear acceso al portal de proveedores
3. Notificar al gerente de la empresa
4. Registrar en log de auditoría

---

## 8. REGLAS DE NEGOCIO

### 8.1. Creación de Marcas

✅ **Permitido:**
- Crear múltiples marcas a la vez
- Asignar colores personalizados a cada marca
- Marca sin puntos de venta (temporalmente)

❌ **No permitido:**
- Marcas sin nombre
- Dos marcas con el mismo nombre en la misma empresa
- Eliminar marca si tiene puntos de venta vinculados

---

### 8.2. Creación de Puntos de Venta

✅ **Permitido:**
- Crear múltiples puntos de venta a la vez
- Asignar varios puntos de venta a la misma marca
- Cambiar la marca asignada a un punto de venta

❌ **No permitido:**
- Crear punto de venta sin marca asignada
- Crear punto de venta si no existe al menos 1 marca
- Punto de venta sin nombre o dirección

**Validación crítica:**
```javascript
const añadirPuntoVenta = () => {
  if (marcas.length === 0) {
    toast.error('Debes crear al menos 1 Marca antes de añadir un Punto de Venta');
    return;
  }
  // ... resto del código
};
```

---

### 8.3. Eliminación de Marcas

**Regla:** No se puede eliminar una marca si tiene puntos de venta vinculados.

**Validación:**
```javascript
const eliminarMarca = (index: number) => {
  const marcaAEliminar = marcas[index];
  
  // Verificar si hay puntos de venta vinculados
  const puntosVinculados = puntosVenta.filter(
    pv => pv.marcaId === marcaAEliminar.marcaCodigo
  );
  
  if (puntosVinculados.length > 0) {
    toast.error(`No se puede eliminar la marca. Tiene ${puntosVinculados.length} punto(s) de venta vinculado(s).`);
    return;
  }
  
  // Proceder con eliminación
};
```

---

### 8.4. Asignación de Agentes

✅ **Permitido:**
- Agente asignado solo a empresa (sin marca ni punto de venta)
- Agente asignado a empresa + marca
- Agente asignado a empresa + marca + punto de venta

❌ **No permitido:**
- Agente sin empresa asignada
- Agente con punto de venta pero sin marca
- Agente con marca de otra empresa

**Jerarquía:**
```
EMPRESA (obligatorio)
  └─ MARCA (opcional)
      └─ PUNTO DE VENTA (opcional)
```

---

### 8.5. Filtrado de Puntos de Venta en Agente

Cuando se selecciona una marca en el modal de agente, solo se muestran los puntos de venta de esa marca:

```javascript
const puntosVentaFiltrados = marcaAsignadaId
  ? puntosVentaDisponibles.filter(pv => pv.marcaId === marcaAsignadaId)
  : puntosVentaDisponibles;
```

---

## 9. NOTAS PARA EL PROGRAMADOR

### ✅ LO QUE ESTÁ HECHO (Frontend)

1. **ModalCrearEmpresa completo:**
   - Formulario con todas las secciones
   - Validaciones frontend
   - Generación automática de IDs
   - Gestión de marcas múltiples
   - Gestión de puntos de venta múltiples
   - Gestión de cuentas bancarias múltiples
   - console.log de los datos listos para enviar

2. **ModalCrearAgente completo:**
   - Formulario con datos básicos
   - Asignación de empresa/marca/punto de venta
   - Configuración de permisos (6 tipos)
   - Validaciones frontend
   - console.log de los datos listos para enviar

3. **Integración en ConfiguracionGerente:**
   - Botón "Crear Nueva Empresa"
   - Control de estado del modal
   - Importación de componentes

---

### 🔧 LO QUE FALTA (Backend - A implementar)

1. **Endpoints API:**
   ```
   POST /api/empresas
   POST /api/agentes-externos
   ```

2. **Validaciones backend:**
   - CIF único en sistema
   - Email único para agentes
   - Verificar que empresa/marca/punto de venta existen

3. **Transacciones BBDD:**
   - Insertar empresa
   - Insertar marcas (múltiples)
   - Insertar puntos de venta (múltiples)
   - Insertar cuentas bancarias (múltiples)
   - Todo en una transacción (rollback si falla)

4. **Webhooks Make (opcional):**
   - Trigger `empresa_creada`
   - Trigger `agente_externo_creado`

---

### 📦 DATOS QUE RECIBIRÁS DEL FRONTEND

**Ejemplo completo de `datosEmpresa`:**
```javascript
{
  empresaId: "EMP-789012",
  nombreFiscal: "PAU Hostelería S.L.",
  cif: "B12345678",
  domicilioFiscal: "Av. Diagonal 100, Barcelona",
  nombreComercial: "PAU Hostelería",
  convenioColectivoId: "CONV-001",
  empresaActiva: true,
  marcas: [
    {
      marcaNombre: "PIZZAS",
      marcaCodigo: "MRC-001",
      colorIdentidad: "#FF5733",
      empresaId: "EMP-789012"
    },
    {
      marcaNombre: "BURGUERS",
      marcaCodigo: "MRC-002",
      colorIdentidad: "#0d9488",
      empresaId: "EMP-789012"
    }
  ],
  puntosVenta: [
    {
      puntoVentaId: "PDV-001",
      empresaId: "EMP-789012",
      marcaId: "MRC-001",
      pvNombreComercial: "Tiana",
      pvDireccion: "Calle Mayor 45"
    },
    {
      puntoVentaId: "PDV-002",
      empresaId: "EMP-789012",
      marcaId: "MRC-001",
      pvNombreComercial: "Badalona",
      pvDireccion: "Calle Menor 10"
    }
  ],
  cuentasBancarias: [
    {
      cuentaId: "CTA-001",
      empresaId: "EMP-789012",
      iban: "ES91 2100 0418 4502 0005 1332",
      aliasCuenta: "Cuenta principal"
    }
  ]
}
```

**Este objeto está listo para enviar a:**
```javascript
await api.post('/empresas', datosEmpresa);
```

---

## 10. CHECKLIST IMPLEMENTACIÓN

### Frontend ✅
- [x] Componente ModalCrearEmpresa
- [x] Componente ModalCrearAgente
- [x] Validaciones de formulario
- [x] Generación automática de IDs
- [x] Integración en ConfiguracionGerente
- [x] Reglas de negocio (no crear PTV sin marca)
- [x] UI completa con Shadcn/Tailwind

### Backend ❌ (Pendiente programador)
- [ ] Endpoint POST /api/empresas
- [ ] Endpoint POST /api/agentes-externos
- [ ] Validación de CIF único
- [ ] Transacciones BBDD
- [ ] Webhook Make empresa_creada
- [ ] Webhook Make agente_externo_creado

### Base de Datos ❌ (Pendiente programador)
- [ ] Tabla `empresas`
- [ ] Tabla `marcas`
- [ ] Tabla `puntos_venta`
- [ ] Tabla `cuentas_bancarias`
- [ ] Tabla `agentes_externos`
- [ ] Foreign keys y constraints

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Frontend 100% completo - ⏳ Backend pendiente

**El programador solo necesita:**
1. Leer esta documentación
2. Crear los endpoints API
3. Conectar la base de datos
4. ¡Listo!
