# 📦 DOCUMENTACIÓN TÉCNICA: Módulo Stock y Proveedores

## 🎯 Objetivo
Este documento describe la estructura de datos, eventos y conexiones necesarias para que el programador integre el módulo de Stock y Proveedores con la base de datos / API.

---

## 🗄️ ENTIDADES / TABLAS

### 1️⃣ PROVEEDOR
```sql
CREATE TABLE PROVEEDOR (
  id_proveedor VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  nombre_comercial VARCHAR(200),
  cif VARCHAR(20) UNIQUE NOT NULL,
  tipo_proveedor ENUM('materias_primas', 'productos_terminados', 'envases_embalajes', 'servicios', 'equipamiento', 'otro') DEFAULT 'materias_primas',
  
  -- Dirección
  direccion TEXT NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  provincia VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'España',
  
  -- Contacto principal
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(200) NOT NULL,
  
  -- Persona de contacto
  persona_contacto VARCHAR(200),
  cargo_contacto VARCHAR(100),
  telefono_contacto VARCHAR(20),
  email_contacto VARCHAR(200),
  
  -- Datos bancarios y pago
  iban VARCHAR(50),
  forma_pago ENUM('transferencia', 'domiciliacion', 'contado', 'cheque', 'pagare') DEFAULT 'transferencia',
  plazos_pago INT DEFAULT 30,
  
  -- Otros
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Índices recomendados**:
- INDEX idx_activo ON PROVEEDOR(activo)
- INDEX idx_nombre ON PROVEEDOR(nombre)
- UNIQUE INDEX idx_cif ON PROVEEDOR(cif)

---

### 2️⃣ ARTICULO
```sql
CREATE TABLE ARTICULO (
  id_articulo VARCHAR(50) PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  categoria VARCHAR(100),
  empresa VARCHAR(100),
  almacen VARCHAR(100),
  ubicacion VARCHAR(50),
  pasillo VARCHAR(20),
  estanteria VARCHAR(20),
  hueco VARCHAR(20),
  
  -- Stock
  disponible INT DEFAULT 0,
  comprometido INT DEFAULT 0,
  minimo INT NOT NULL,
  maximo INT NOT NULL,
  rop INT NOT NULL,
  
  -- Precios
  costo_medio DECIMAL(10,2) NOT NULL,
  pvp DECIMAL(10,2) NOT NULL,
  
  -- Proveedor
  proveedor_preferente_id VARCHAR(50),
  ultima_compra TIMESTAMP,
  lead_time INT DEFAULT 7,
  
  -- Estado y análisis
  estado ENUM('bajo', 'ok', 'sobrestock') DEFAULT 'ok',
  rotacion DECIMAL(10,2) DEFAULT 0,
  
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (proveedor_preferente_id) REFERENCES PROVEEDOR(id_proveedor)
);
```

**Índices recomendados**:
- INDEX idx_codigo ON ARTICULO(codigo)
- INDEX idx_categoria ON ARTICULO(categoria)
- INDEX idx_proveedor ON ARTICULO(proveedor_preferente_id)
- INDEX idx_stock_bajo ON ARTICULO(disponible, minimo) WHERE disponible < minimo

---

## 📡 EVENTOS PARA INTEGRACIÓN

### 🆕 Evento: NUEVO_PROVEEDOR_INICIADO
Cuando el usuario hace clic en "+ Nuevo Proveedor"
```typescript
{
  evento: "NUEVO_PROVEEDOR_INICIADO",
  payload: {
    timestamp: Date
  }
}
```
**Acción Backend**: Abrir modal de registro de proveedor

---

### 📥 EVENTOS DE EXPORTACIÓN

#### 📊 Exportar Stock/Inventario

**EXPORTAR_STOCK_EXCEL**
```typescript
{
  evento: "EXPORTAR_STOCK_EXCEL",
  payload: {
    formato: "excel",
    vista: "inventario",
    totalRegistros: number,
    timestamp: Date
  }
}
```

**EXPORTAR_STOCK_CSV**
```typescript
{
  evento: "EXPORTAR_STOCK_CSV",
  payload: {
    formato: "csv",
    vista: "inventario",
    totalRegistros: number,
    timestamp: Date
  }
}
```

**EXPORTAR_STOCK_PDF**
```typescript
{
  evento: "EXPORTAR_STOCK_PDF",
  payload: {
    formato: "pdf",
    vista: "inventario",
    totalRegistros: number,
    timestamp: Date
  }
}
```

**Campos a exportar en Stock**:
- Código
- Artículo (nombre)
- Precio (PVP)
- Categoría
- Stock Disponible
- Stock Mínimo
- Ubicación
- Proveedor Preferente

---

#### 🛒 Exportar Pedidos

**EXPORTAR_PEDIDOS_EXCEL / CSV / PDF**
```typescript
{
  evento: "EXPORTAR_PEDIDOS_[FORMATO]",
  payload: {
    formato: "excel" | "csv" | "pdf",
    vista: "pedidos",
    timestamp: Date
  }
}
```

**Campos a exportar en Pedidos**:
- Número de Pedido
- Fecha
- Proveedor
- Estado (Borrador, En Tránsito, Recibida)
- Total Artículos
- Importe Total
- Fecha Entrega Estimada

---

#### 🚚 Exportar Proveedores

**EXPORTAR_PROVEEDORES_EXCEL / CSV / PDF**
```typescript
{
  evento: "EXPORTAR_PROVEEDORES_[FORMATO]",
  payload: {
    formato: "excel" | "csv" | "pdf",
    vista: "proveedores",
    totalRegistros: number,
    timestamp: Date
  }
}
```

**Campos a exportar en Proveedores**:
- ID Proveedor
- Nombre
- CIF/NIF
- Teléfono
- Email
- Ciudad
- SLA %
- Rating
- Lead Time (días)
- Precio Medio
- Pedidos Activos

---

#### 📋 Exportar Sesiones de Inventario

**EXPORTAR_INVENTARIO_EXCEL / CSV / PDF**
```typescript
{
  evento: "EXPORTAR_INVENTARIO_[FORMATO]",
  payload: {
    formato: "excel" | "csv" | "pdf",
    vista: "inventario",
    totalRegistros: number,
    timestamp: Date
  }
}
```

**Campos a exportar en Sesiones de Inventario**:
- Nombre Sesión
- Tipo (Cíclico, Anual, Spot)
- Almacén
- Fecha Inicio
- Progreso %
- SKUs Contados / Total
- Diferencias Detectadas
- Responsables
- Estado

---

#### ↔️ Exportar Transferencias

**EXPORTAR_TRANSFERENCIAS_EXCEL / CSV / PDF**
```typescript
{
  evento: "EXPORTAR_TRANSFERENCIAS_[FORMATO]",
  payload: {
    formato: "excel" | "csv" | "pdf",
    vista: "transferencias",
    totalRegistros: number,
    timestamp: Date
  }
}
```

**Campos a exportar en Transferencias**:
- ID Transferencia
- Origen
- Destino
- Fecha
- SKUs Transferidos
- Responsable
- Estado (Pendiente, En Tránsito, Completada)

---

### 🟢 Evento: PROVEEDOR_CREADO (CRÍTICO)
Cuando el usuario completa y envía el formulario de nuevo proveedor
```typescript
{
  evento: "PROVEEDOR_CREADO",
  payload: {
    nombre: string,
    nombreComercial: string,
    cif: string,
    tipoProveedor: 'materias_primas' | 'productos_terminados' | 'envases_embalajes' | 'servicios' | 'equipamiento' | 'otro',
    telefono: string,
    email: string,
    direccion: string,
    codigoPostal: string,
    ciudad: string,
    provincia: string,
    pais: string,
    personaContacto: string,
    cargoContacto: string,
    telefonoContacto: string,
    emailContacto: string,
    iban: string,
    formaPago: 'transferencia' | 'domiciliacion' | 'contado' | 'cheque' | 'pagare',
    plazosPago: string,
    categorias: string[],
    notas: string,
    timestamp: Date
  }
}
```

**Acción Backend**:
```sql
INSERT INTO PROVEEDOR (
  id_proveedor,  -- Autogenerar: PROV-XXX
  nombre,
  nombre_comercial,
  cif,
  tipo_proveedor,
  direccion,
  codigo_postal,
  ciudad,
  provincia,
  pais,
  telefono,
  email,
  persona_contacto,
  cargo_contacto,
  telefono_contacto,
  email_contacto,
  iban,
  forma_pago,
  plazos_pago,
  notas,
  activo,
  fecha_creacion
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW());
```

**Validaciones requeridas**:
- Nombre/Razón Social: Obligatorio
- CIF/NIF: Obligatorio y único en el sistema
- Teléfono: Obligatorio y formato válido
- Email: Obligatorio y formato válido
- Dirección completa: Obligatorio
- Código Postal: Obligatorio
- Ciudad: Obligatorio
- Tipo de Proveedor: Obligatorio

**Respuesta esperada**:
```json
{
  "success": true,
  "proveedor": {
    "id_proveedor": "PROV-001",
    "nombre": "Distribuciones García S.L.",
    "cif": "B12345678",
    "email": "contacto@garcia.com",
    "telefono": "+34 900 000 000",
    "fecha_creacion": "2024-11-26T10:30:00Z"
  }
}
```

---

## 📐 CONSULTAS SQL CLAVE

### 1. Obtener listado de stock
```sql
SELECT 
  a.id_articulo,
  a.codigo,
  a.nombre,
  a.categoria,
  a.ubicacion,
  a.disponible,
  a.minimo,
  a.pvp,
  p.nombre AS proveedor_preferente
FROM ARTICULO a
LEFT JOIN PROVEEDOR p ON a.proveedor_preferente_id = p.id_proveedor
WHERE a.activo = TRUE
ORDER BY a.nombre ASC;
```

### 2. Buscar proveedor por CIF (validación unicidad)
```sql
SELECT id_proveedor, nombre
FROM PROVEEDOR
WHERE cif = ?;
```

### 3. Obtener detalles completos de proveedor
```sql
SELECT *
FROM PROVEEDOR
WHERE id_proveedor = ?;
```

### 4. Listar todos los proveedores activos
```sql
SELECT 
  id_proveedor,
  nombre,
  nombre_comercial,
  cif,
  telefono,
  email,
  ciudad,
  tipo_proveedor
FROM PROVEEDOR
WHERE activo = TRUE
ORDER BY nombre ASC;
```

---

## 🎨 COMPONENTES UI

### Modal "Nuevo Proveedor"
- **Ubicación**: `/components/gerente/StockProveedoresCafe.tsx`
- **Estado**: `modalNuevoProveedorAbierto` (boolean)
- **Secciones**: 
  1. Información de la Empresa
  2. Dirección Fiscal
  3. Persona de Contacto
  4. Datos Bancarios y Condiciones de Pago
  5. Notas y Observaciones

### Tabla de Stock
**Columnas**:
1. Código (opcional, ocultar con toggle)
2. Artículo
3. Precio
4. Categoría (opcional, ocultar con toggle)
5. Stock (Disponible / Mínimo)
6. Ubicación
7. **Proveedor** (muestra nombre del proveedor preferente)
8. Acciones (Ver detalles, etc.)

---

## 🧪 DATOS DE PRUEBA

### Proveedores de ejemplo
```javascript
const proveedoresPrueba = [
  {
    nombre: 'Distribuciones García S.L.',
    nombreComercial: 'García Distribuciones',
    cif: 'B12345678',
    tipoProveedor: 'materias_primas',
    telefono: '+34 900 123 456',
    email: 'contacto@garcia.com',
    direccion: 'Calle Principal, 123',
    codigoPostal: '08001',
    ciudad: 'Barcelona',
    provincia: 'Barcelona',
    pais: 'España'
  },
  {
    nombre: 'Harinas del Norte S.A.',
    nombreComercial: 'Harinas Norte',
    cif: 'A87654321',
    tipoProveedor: 'materias_primas',
    telefono: '+34 900 987 654',
    email: 'pedidos@harinasnorte.es',
    direccion: 'Polígono Industrial, Nave 45',
    codigoPostal: '28080',
    ciudad: 'Madrid',
    provincia: 'Madrid',
    pais: 'España'
  }
];
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Base de Datos
- [ ] Crear tabla PROVEEDOR con todos los campos
- [ ] Crear tabla ARTICULO (si no existe)
- [ ] Crear índices recomendados
- [ ] Añadir constraint UNIQUE para CIF
- [ ] Insertar datos de prueba (mínimo 5 proveedores)

### Fase 2: API / Endpoints
- [ ] POST /api/proveedores (crear nuevo proveedor)
- [ ] GET /api/proveedores (listar proveedores activos)
- [ ] GET /api/proveedores/:id (detalles de proveedor)
- [ ] PUT /api/proveedores/:id (actualizar proveedor)
- [ ] DELETE /api/proveedores/:id (desactivar proveedor)
- [ ] GET /api/proveedores/validar-cif/:cif (validar unicidad)

### Fase 3: Endpoints de Exportación
- [ ] GET /api/stock/exportar?formato=excel
- [ ] GET /api/stock/exportar?formato=csv
- [ ] GET /api/stock/exportar?formato=pdf
- [ ] GET /api/pedidos/exportar?formato=[excel|csv|pdf]
- [ ] GET /api/proveedores/exportar?formato=[excel|csv|pdf]
- [ ] GET /api/inventario/exportar?formato=[excel|csv|pdf]
- [ ] GET /api/transferencias/exportar?formato=[excel|csv|pdf]

### Fase 4: Eventos
- [ ] Capturar evento NUEVO_PROVEEDOR_INICIADO
- [ ] Capturar evento PROVEEDOR_CREADO (crítico)
- [ ] Capturar eventos EXPORTAR_STOCK_[FORMATO]
- [ ] Capturar eventos EXPORTAR_PEDIDOS_[FORMATO]
- [ ] Capturar eventos EXPORTAR_PROVEEDORES_[FORMATO]
- [ ] Capturar eventos EXPORTAR_INVENTARIO_[FORMATO]
- [ ] Capturar eventos EXPORTAR_TRANSFERENCIAS_[FORMATO]
- [ ] Implementar validaciones de campos obligatorios
- [ ] Implementar validación de CIF único

### Fase 5: Integraciones
- [ ] Conectar tabla de Stock con proveedores
- [ ] Actualizar dropdown de proveedores en módulos relacionados
- [ ] Sincronizar proveedor preferente en artículos

### Fase 6: Testing
- [ ] Probar creación de proveedor con datos completos
- [ ] Verificar validación de CIF duplicado
- [ ] Comprobar reset del formulario al cancelar
- [ ] Validar campos obligatorios antes de enviar
- [ ] Verificar toast de confirmación
- [ ] Probar exportaciones en Excel (todas las vistas)
- [ ] Probar exportaciones en CSV (todas las vistas)
- [ ] Probar exportaciones en PDF (todas las vistas)
- [ ] Verificar formato de archivos exportados
- [ ] Comprobar que los datos exportados son correctos

---

## 🔒 VALIDACIONES

### Frontend (antes de enviar):
- ✅ Nombre/Razón Social: No vacío
- ✅ CIF: No vacío y formato válido (regex)
- ✅ Teléfono: No vacío y formato válido
- ✅ Email: No vacío y formato válido (regex)
- ✅ Dirección: No vacío
- ✅ Código Postal: No vacío y formato válido
- ✅ Ciudad: No vacío
- ✅ Tipo de Proveedor: Seleccionado

### Backend (en POST /api/proveedores):
- ✅ Usuario autenticado
- ✅ Todos los campos obligatorios presentes
- ✅ CIF único en el sistema
- ✅ Formato de email válido
- ✅ Formato de teléfono válido
- ✅ IBAN válido (si se proporciona)

---

## 📊 CAMBIOS EN LA TABLA DE STOCK

### Antes:
- Columna "Estado" mostraba badge verde con "Disponible"

### Después:
- Columna "Proveedor" muestra el nombre del proveedor preferente del artículo
- Campo obtenido de: `ARTICULO.proveedor_preferente_id` → JOIN con `PROVEEDOR.nombre`
- Alineación: Izquierda
- Estilo: Texto simple, sin badge

---

## 📚 LIBRERÍAS RECOMENDADAS PARA EXPORTACIÓN

### Para Backend (Node.js)

#### Excel (.xlsx)
```bash
npm install xlsx
```
**Uso recomendado**:
```javascript
const XLSX = require('xlsx');

// Crear workbook y worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, "Stock");

// Generar archivo
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
```

#### CSV (.csv)
```bash
npm install csv-writer
```
**Uso recomendado**:
```javascript
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'output.csv',
  header: [
    {id: 'codigo', title: 'Código'},
    {id: 'nombre', title: 'Artículo'},
    {id: 'precio', title: 'Precio'}
  ]
});
```

#### PDF (.pdf)
```bash
npm install pdfkit
# O alternativamente:
npm install jspdf
npm install jspdf-autotable
```
**Uso recomendado**:
```javascript
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();

// Crear tabla con datos
doc.text('Listado de Stock', { align: 'center' });
// ... agregar contenido
```

---

## 🎨 FORMATO DE RESPUESTA DE EXPORTACIÓN

Cuando el usuario solicita una exportación, el backend debe:

1. **Obtener los datos** de la base de datos según la vista solicitada
2. **Formatear los datos** en el formato correspondiente (Excel, CSV, PDF)
3. **Retornar el archivo** como descarga

### Endpoint típico:
```
GET /api/stock/exportar?formato=excel
```

**Response headers**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="stock-export-2024-11-26.xlsx"
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
**Versión**: 2.0  
**Autor**: Figma Make - Udar Edge Team
