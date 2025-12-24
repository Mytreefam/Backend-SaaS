# 📄 DOCUMENTACIÓN TÉCNICA - DOCUMENTACIÓN Y GASTOS

**Proyecto:** Udar Edge 2.0  
**Módulo:** Gestión Documental y Gastos  
**Versión:** 2.0  
**Fecha:** 26 Noviembre 2024  
**Estado:** ✅ Frontend Completo - Backend en Integración

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Entidades de Base de Datos](#entidades-de-base-de-datos)
3. [Flujo OCR - Subir Gasto](#flujo-ocr---subir-gasto)
4. [Endpoints API](#endpoints-api)
5. [Eventos para Make](#eventos-para-make)
6. [Checklist de Integración](#checklist-de-integración)

---

## 🎯 RESUMEN EJECUTIVO

### ✅ Cambios Implementados

1. **Badge "Archivado"** añadido con color gris suave
2. **Columna "Tipo"** añadida en todas las tablas de documentación
3. **Flujo OCR** implementado en 2 pasos (Escanear → Formulario autocompletado)
4. **Nuevos campos en Subir Gasto**: Nº factura, NIF proveedor, Subtipo
5. **Interfaces completas** para BBDD preparadas
6. **Eventos console.log** preparados para Make

### 🎨 Diseño

- **Sin cambios visuales** - Solo añadidos los campos solicitados
- **Badge Archivado**: `bg-gray-100 text-gray-700 border-gray-200`
- **Badge Tipo**: `bg-blue-50 text-blue-700 border-blue-200`
- **Alerta OCR**: Fondo teal con mensaje informativo

---

## 🗄️ ENTIDADES DE BASE DE DATOS

### 1. DOCUMENTO

**Tabla:** `documentos`

```sql
CREATE TABLE documentos (
  doc_id VARCHAR(50) PRIMARY KEY, -- DOC-001
  empresa_id VARCHAR(50) NOT NULL,
  punto_venta_id VARCHAR(50) NULL,
  
  -- Clasificación
  categoria_documental ENUM('sociedad', 'vehiculos', 'contratos', 'licencias', 'fiscalidad') NOT NULL,
  tipo_documento VARCHAR(100) NOT NULL, -- Legal, Vehículo/Técnico, Permisos, Fiscal, Contrato, General
  
  -- Información
  nombre_documento VARCHAR(255) NOT NULL,
  codigo_referencia VARCHAR(50) NOT NULL, -- DOC-020
  
  -- Fechas
  fecha_subida DATE NOT NULL,
  fecha_vencimiento DATE NULL,
  
  -- Estado
  estado ENUM('vigente', 'proximo_vencer', 'caducado', 'archivado') NOT NULL,
  
  -- Archivo
  tamano_archivo INT NOT NULL, -- en KB
  url_archivo TEXT NOT NULL,
  
  -- Responsabilidad
  responsable VARCHAR(100) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_empresa (empresa_id),
  INDEX idx_categoria (categoria_documental),
  INDEX idx_estado (estado),
  INDEX idx_fecha_vencimiento (fecha_vencimiento),
  
  -- Claves foráneas
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(pdv_id) ON DELETE SET NULL
);
```

**Lógica de Estados:**

| Estado | Badge | Cuándo | Acción Manual |
|--------|-------|--------|---------------|
| `vigente` | Verde "Vigente" | Documento válido | - |
| `proximo_vencer` | Amarillo "Próximo a Vencer" | Menos de 30 días para vencer | - |
| `caducado` | Rojo "Vencido" | Fecha vencimiento pasada | Convertir a `archivado` |
| `archivado` | Gris "Archivado" | Documento caducado pero conservado | Manual |

**Valores de `tipo_documento`:**

| Categoría | Tipo Documento |
|-----------|----------------|
| Sociedad | Legal |
| Vehículos | Vehículo / Técnico |
| Contratos | Contrato |
| Licencias | Permisos |
| Fiscalidad | Fiscal |
| Otros | General |

---

### 2. GASTO

**Tabla:** `gastos`

```sql
CREATE TABLE gastos (
  gasto_id VARCHAR(50) PRIMARY KEY, -- GAS-001
  empresa_id VARCHAR(50) NOT NULL,
  punto_venta_id VARCHAR(50) NULL,
  
  -- Información básica
  concepto VARCHAR(255) NOT NULL,
  proveedor_nombre VARCHAR(200) NOT NULL,
  
  -- Montos y fechas
  importe DECIMAL(10, 2) NOT NULL,
  fecha_gasto DATE NOT NULL,
  
  -- Clasificación
  categoria VARCHAR(100) NOT NULL, -- Suministros, Mantenimiento, Servicios
  subtipo VARCHAR(100) NOT NULL, -- Papel, Material oficina, Limpieza, Tecnología
  
  -- Método de pago
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'otros') NOT NULL,
  
  -- Centro de coste
  centro_coste VARCHAR(100) NOT NULL,
  
  -- Estado
  estado ENUM('registrado', 'vinculado_evento', 'contabilizado') DEFAULT 'registrado',
  
  -- Contabilidad
  num_factura VARCHAR(100) NOT NULL, -- Obligatorio
  nif_proveedor VARCHAR(20) NULL, -- Opcional
  
  -- Adjuntos y relaciones
  ticket_url TEXT NOT NULL,
  evento_id VARCHAR(50) NULL, -- FK a calendario
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_empresa (empresa_id),
  INDEX idx_categoria (categoria),
  INDEX idx_fecha (fecha_gasto),
  INDEX idx_estado (estado),
  INDEX idx_num_factura (num_factura),
  
  -- Claves foráneas
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(pdv_id) ON DELETE SET NULL,
  FOREIGN KEY (evento_id) REFERENCES calendario_pagos(evento_id) ON DELETE SET NULL
);
```

**Ejemplos de Subtipo por Categoría:**

| Categoría | Subtipos Posibles |
|-----------|-------------------|
| Suministros | Papel, Material oficina, Limpieza, Tecnología |
| Mantenimiento | Preventivo, Correctivo, Inspección |
| Servicios | Consultoría, Asesoría, Auditoría |
| Transporte | Combustible, Peajes, Parking |
| Marketing | Publicidad, Diseño, Eventos |

---

### 3. PAGO_CALENDARIO

**Tabla:** `calendario_pagos`

```sql
CREATE TABLE calendario_pagos (
  evento_id VARCHAR(50) PRIMARY KEY, -- PAG-001
  empresa_id VARCHAR(50) NOT NULL,
  punto_venta_id VARCHAR(50) NULL,
  
  -- Información
  concepto VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL, -- Alquiler, Nóminas, Seguridad Social, etc.
  
  -- Monto y fecha
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  
  -- Estado
  estado_pago ENUM('pendiente', 'pagado') DEFAULT 'pendiente',
  
  -- Recurrencia
  recurrente BOOLEAN DEFAULT FALSE,
  frecuencia VARCHAR(50) NULL, -- mensual, anual, trimestral, etc.
  
  -- Método de pago
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'otros') NOT NULL,
  
  -- Vinculación con gasto real
  gasto_id VARCHAR(50) NULL, -- FK a gastos
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_empresa (empresa_id),
  INDEX idx_fecha (fecha),
  INDEX idx_estado (estado_pago),
  INDEX idx_recurrente (recurrente),
  
  -- Claves foráneas
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(pdv_id) ON DELETE SET NULL,
  FOREIGN KEY (gasto_id) REFERENCES gastos(gasto_id) ON DELETE SET NULL
);
```

---

## 🔄 FLUJO OCR - SUBIR GASTO

### Paso 1: Escanear con Móvil (OCR)

**Acción:** Usuario hace clic en "Escanear con móvil"

**Proceso:**

1. **Frontend dispara evento:**
   ```typescript
   handleEscanearTicket()
   ```

2. **Console.log preparado:**
   ```typescript
   console.log('🔌 EVENTO: INICIAR_OCR_TICKET', {
     endpoint: 'POST /api/ocr/escanear-ticket',
     accion: 'Abrir cámara o subir imagen para OCR',
     timestamp: new Date().toISOString()
   });
   ```

3. **Backend/Make debe:**
   - Abrir cámara del móvil O permitir subir imagen
   - Procesar imagen con servicio OCR (Google Vision, Tesseract, AWS Textract, etc.)
   - Extraer datos del ticket:
     - Nombre del proveedor
     - NIF del proveedor (si está visible)
     - Fecha del ticket
     - Importe total
     - Número de factura
     - Categoría sugerida (basada en nombre del proveedor o contenido)
   - Subir imagen a almacenamiento (S3, Cloudinary, etc.)
   - Obtener URL del ticket

4. **Respuesta esperada (JSON):**
   ```json
   {
     "ocr_proveedor_nombre": "Papelería Central S.L.",
     "ocr_nif_proveedor": "B12345678",
     "ocr_fecha": "2024-11-26",
     "ocr_importe": "156.50",
     "ocr_categoria_sugerida": "Suministros",
     "ocr_num_factura": "FAC-2024-1234",
     "ticket_url": "https://storage.udar.com/tickets/ticket_123456.jpg"
   }
   ```

5. **Frontend guarda datos** en estado `datosGastoLeidos`

6. **Frontend abre modal** de "Subir Gasto" con datos prellenados

---

### Paso 2: Formulario Autocompletado

**Vista:** Modal "Subir Gasto" con campos llenos

**Campos del formulario:**

| Campo | Fuente | Editable | Obligatorio |
|-------|--------|----------|-------------|
| Concepto del Gasto | Manual (usuario define) | ✅ | ✅ |
| Proveedor | `ocr_proveedor_nombre` | ✅ | ✅ |
| NIF Proveedor | `ocr_nif_proveedor` | ✅ | ❌ |
| Importe | `ocr_importe` | ✅ | ✅ |
| Fecha | `ocr_fecha` | ✅ | ✅ |
| Nº de Factura | `ocr_num_factura` | ✅ | ✅ |
| Categoría | `ocr_categoria_sugerida` | ✅ | ✅ |
| Subtipo | Manual (según categoría) | ✅ | ✅ |
| Centro de Coste | Sugerido (punto de venta actual) | ✅ | ✅ |
| Método de Pago | Botón seleccionado | ✅ | ✅ |
| Asociar Evento | Manual (opcional) | ✅ | ❌ |

**Alerta visual:**
```
┌────────────────────────────────────────────────────┐
│ ✓ Datos extraídos del ticket escaneado.           │
│   Puedes modificarlos antes de guardar.           │
└────────────────────────────────────────────────────┘
```

**Al hacer clic en "Registrar Gasto":**

1. **Recoger todos los datos** del formulario
2. **Crear objeto `GastoBBDD`** completo
3. **Disparar evento** `handleCrearGasto()`
4. **Cerrar modal** y limpiar estado
5. **Mostrar toast** de éxito

---

## 🌐 ENDPOINTS API

### 1. Documentos

#### `POST /api/documentos`
**Descripción:** Crear nuevo documento

**Body:**
```json
{
  "doc_id": "DOC-025",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "categoria_documental": "contratos",
  "tipo_documento": "Contrato",
  "nombre_documento": "Contrato Pedro López",
  "codigo_referencia": "DOC-025",
  "fecha_subida": "2024-11-26",
  "fecha_vencimiento": "2026-11-26",
  "estado": "vigente",
  "tamano_archivo": 450,
  "url_archivo": "https://storage.udar.com/docs/DOC-025.pdf",
  "responsable": "RRHH"
}
```

**Response:**
```json
{
  "success": true,
  "doc_id": "DOC-025",
  "message": "Documento creado correctamente"
}
```

---

#### `PUT /api/documentos/{doc_id}`
**Descripción:** Actualizar documento (incluyendo cambio a "archivado")

**Body:**
```json
{
  "estado": "archivado"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documento actualizado a estado archivado"
}
```

---

#### `GET /api/documentos`
**Descripción:** Listar documentos

**Query Params:**
- `empresa_id` (required)
- `categoria_documental` (optional): sociedad, vehiculos, contratos, licencias, fiscalidad
- `estado` (optional): vigente, proximo_vencer, caducado, archivado
- `tipo_documento` (optional)

**Response:**
```json
{
  "success": true,
  "documentos": [
    {
      "doc_id": "DOC-020",
      "nombre_documento": "Estatutos Sociales",
      "categoria_documental": "sociedad",
      "tipo_documento": "Legal",
      "fecha_subida": "2019-01-15",
      "estado": "vigente",
      "tamano_archivo": 1800,
      "responsable": "Legal"
    }
  ],
  "total": 24
}
```

---

### 2. Gastos

#### `POST /api/gastos`
**Descripción:** Crear nuevo gasto

**Body:**
```json
{
  "gasto_id": "GAS-004",
  "empresa_id": "EMP-001",
  "punto_venta_id": "PDV-001",
  "concepto": "Material de oficina",
  "proveedor_nombre": "Papelería Central S.L.",
  "nif_proveedor": "B12345678",
  "importe": 156.50,
  "fecha_gasto": "2024-11-26",
  "categoria": "Suministros",
  "subtipo": "Papel",
  "num_factura": "FAC-2024-1234",
  "metodo_pago": "tarjeta",
  "centro_coste": "Can Farines Centro",
  "estado": "registrado",
  "ticket_url": "https://storage.udar.com/tickets/ticket_123456.jpg",
  "evento_id": null
}
```

**Response:**
```json
{
  "success": true,
  "gasto_id": "GAS-004",
  "message": "Gasto registrado correctamente",
  "acciones_make": {
    "actualizar_kpis": true,
    "notificar_contabilidad": true
  }
}
```

---

#### `GET /api/gastos`
**Descripción:** Listar gastos

**Query Params:**
- `empresa_id` (required)
- `punto_venta_id` (optional)
- `categoria` (optional)
- `fecha_desde` (optional)
- `fecha_hasta` (optional)
- `estado` (optional)

**Response:**
```json
{
  "success": true,
  "gastos": [
    {
      "gasto_id": "GAS-001",
      "concepto": "Compra de Papel",
      "proveedor_nombre": "Papelera S.A.",
      "importe": 150.00,
      "fecha_gasto": "2025-11-15",
      "categoria": "Suministros",
      "subtipo": "Papel",
      "num_factura": "FAC-2024-1001",
      "estado": "registrado"
    }
  ],
  "total": 3,
  "sum_total": 650.00
}
```

---

### 3. OCR

#### `POST /api/ocr/escanear-ticket`
**Descripción:** Procesar ticket con OCR

**Body (multipart/form-data):**
```
imagen: [archivo JPG/PNG]
```

**Response:**
```json
{
  "success": true,
  "datos_ocr": {
    "ocr_proveedor_nombre": "Papelería Central S.L.",
    "ocr_nif_proveedor": "B12345678",
    "ocr_fecha": "2024-11-26",
    "ocr_importe": "156.50",
    "ocr_categoria_sugerida": "Suministros",
    "ocr_num_factura": "FAC-2024-1234",
    "ticket_url": "https://storage.udar.com/tickets/ticket_123456.jpg"
  }
}
```

---

### 4. Calendario

#### `PUT /api/calendario/{evento_id}/vincular-gasto`
**Descripción:** Vincular un gasto a un evento del calendario

**Body:**
```json
{
  "gasto_id": "GAS-004"
}
```

**Response:**
```json
{
  "success": true,
  "mensaje": "Gasto vinculado correctamente al evento PAG-005"
}
```

---

#### `PUT /api/calendario/{evento_id}`
**Descripción:** Actualizar evento del calendario

**Body:**
```json
{
  "estado_pago": "pagado"
}
```

**Response (si no tiene gasto vinculado):**
```json
{
  "success": true,
  "mensaje": "Evento marcado como pagado",
  "sugerencia": "Este evento no tiene gasto vinculado. ¿Deseas crear uno?"
}
```

---

## 🔌 EVENTOS PARA MAKE

### 1. onDocumentoCreado

**Trigger:** Cuando se crea un nuevo documento

**Console.log:**
```typescript
console.log('🔌 EVENTO: onDocumentoCreado', {
  endpoint: 'POST /api/documentos',
  payload: datos,
  timestamp: new Date().toISOString()
});
```

**Acciones Make:**
- Notificar a responsable
- Crear recordatorio de vencimiento (si tiene fecha)
- Actualizar dashboard de documentación

---

### 2. onDocumentoActualizado

**Trigger:** Cuando se actualiza un documento (especialmente cambio a "archivado")

**Console.log:**
```typescript
console.log('🔌 EVENTO: onDocumentoActualizado', {
  endpoint: `PUT /api/documentos/${docId}`,
  payload: cambios,
  nota: cambios.estado === 'archivado' ? 'Documento archivado - conservar' : '',
  timestamp: new Date().toISOString()
});
```

**Acciones Make:**
- Si estado → `archivado`: Mover a archivo histórico
- Si estado → `proximo_vencer`: Enviar alerta a responsable
- Actualizar contadores del dashboard

---

### 3. onGastoCreado

**Trigger:** Cuando se crea un nuevo gasto

**Console.log:**
```typescript
console.log('🔌 EVENTO: onGastoCreado', {
  endpoint: 'POST /api/gastos',
  payload: datos,
  acciones_make: {
    actualizar_kpis: true,
    vincular_evento: datos.evento_id ? true : false,
    notificar_contabilidad: true
  },
  timestamp: new Date().toISOString()
});
```

**Acciones Make:**
- Actualizar KPIs de gastos (por empresa, PDV, categoría, subtipo)
- Si tiene `evento_id`: Vincular con evento del calendario
- Notificar a departamento de contabilidad
- Enviar a gestoría (si aplica)

---

### 4. VINCULAR_GASTO_A_EVENTO

**Trigger:** Cuando se asocia un gasto a un evento del calendario

**Console.log:**
```typescript
console.log('🔌 EVENTO: VINCULAR_GASTO_A_EVENTO', {
  endpoint: `PUT /api/calendario/${eventoId}/vincular-gasto`,
  payload: { gasto_id: gastoId },
  timestamp: new Date().toISOString()
});
```

**Acciones Make:**
- Actualizar estado del evento a `vinculado_evento`
- Crear enlace bidireccional (gasto ↔ evento)

---

### 5. onPagoCalendarioActualizado

**Trigger:** Cuando se actualiza un evento del calendario (especialmente estado → "pagado")

**Console.log:**
```typescript
console.log('🔌 EVENTO: onPagoCalendarioActualizado', {
  endpoint: `PUT /api/calendario/${eventoId}`,
  payload: cambios,
  acciones_make: {
    verificar_gasto_vinculado: cambios.estado_pago === 'pagado',
    sugerir_crear_gasto: cambios.estado_pago === 'pagado' && !cambios.gasto_id
  },
  timestamp: new Date().toISOString()
});
```

**Acciones Make:**
- Si `estado_pago` → `pagado` y NO tiene `gasto_id`: Sugerir crear gasto
- Si `estado_pago` → `pagado` y SÍ tiene `gasto_id`: Marcar gasto como contabilizado
- Actualizar flujo de caja

---

### 6. INICIAR_OCR_TICKET

**Trigger:** Cuando se inicia el escaneo de un ticket

**Console.log:**
```typescript
console.log('🔌 EVENTO: INICIAR_OCR_TICKET', {
  endpoint: 'POST /api/ocr/escanear-ticket',
  accion: 'Abrir cámara o subir imagen para OCR',
  timestamp: new Date().toISOString()
});
```

**Acciones Make:**
- Abrir interfaz de cámara (app móvil) o selector de archivo
- Subir imagen a almacenamiento temporal
- Procesar con servicio OCR
- Devolver datos extraídos

---

## ✅ CHECKLIST DE INTEGRACIÓN

### Frontend ✅ COMPLETO

- [x] Badge "Archivado" con color gris
- [x] Columna "Tipo" en todas las tablas
- [x] Interfaz `DocumentoBBDD` completa
- [x] Interfaz `GastoBBDD` completa
- [x] Interfaz `PagoCalendarioBBDD` completa
- [x] Interfaz `DatosOCR` completa
- [x] Flujo OCR en 2 pasos implementado
- [x] Formulario con nuevos campos: Nº factura, NIF proveedor, Subtipo
- [x] Autocompletado desde datos OCR
- [x] Alerta visual "Datos extraídos del ticket"
- [x] Todos los eventos preparados con `console.log`

### Backend ⏳ PENDIENTE

- [ ] Tabla `documentos` creada
- [ ] Tabla `gastos` creada
- [ ] Tabla `calendario_pagos` creada
- [ ] Endpoint `POST /api/documentos`
- [ ] Endpoint `PUT /api/documentos/{id}`
- [ ] Endpoint `GET /api/documentos`
- [ ] Endpoint `POST /api/gastos`
- [ ] Endpoint `GET /api/gastos`
- [ ] Endpoint `POST /api/ocr/escanear-ticket`
- [ ] Endpoint `PUT /api/calendario/{id}/vincular-gasto`
- [ ] Endpoint `PUT /api/calendario/{id}`
- [ ] Servicio OCR integrado (Google Vision, Tesseract, AWS Textract)
- [ ] Almacenamiento de archivos (S3, Cloudinary)

### Make ⏳ PENDIENTE

- [ ] Escenario: onDocumentoCreado
- [ ] Escenario: onDocumentoActualizado
- [ ] Escenario: onGastoCreado
- [ ] Escenario: VINCULAR_GASTO_A_EVENTO
- [ ] Escenario: onPagoCalendarioActualizado
- [ ] Escenario: INICIAR_OCR_TICKET

---

## 📝 NOTAS PARA EL PROGRAMADOR

### 1. Servicio OCR Recomendado

**Opciones:**

**A) Google Cloud Vision API**
- ✅ Muy preciso
- ✅ Reconoce estructura de facturas
- ✅ Extrae tablas y campos
- ❌ Costo por llamada

**B) AWS Textract**
- ✅ Especializado en documentos financieros
- ✅ Extrae campos clave automáticamente
- ✅ Buena integración con S3
- ❌ Costo por página

**C) Tesseract (Open Source)**
- ✅ Gratis
- ✅ Funciona offline
- ❌ Menos preciso
- ❌ Requiere preprocesamiento de imagen

**D) Make.com con módulo OCR**
- ✅ Sin programación
- ✅ Integración directa
- ✅ Workflow visual
- ❌ Depende de servicio externo

**Recomendación:** Google Cloud Vision API para producción, Tesseract para desarrollo/testing.

---

### 2. Validaciones Importantes

**Al crear documento:**
- `fecha_vencimiento` debe ser mayor que `fecha_subida`
- `tamano_archivo` debe ser positivo
- `url_archivo` debe ser una URL válida
- `tipo_documento` debe corresponder con `categoria_documental`

**Al crear gasto:**
- `importe` debe ser positivo
- `num_factura` no puede estar vacío
- `subtipo` debe corresponder con `categoria`
- Si tiene `evento_id`, validar que existe y pertenece a la misma empresa

---

### 3. Cálculo Automático de Estado de Documentos

```javascript
// Ejecutar diariamente (cron job)
function actualizarEstadosDocumentos() {
  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(hoy.getDate() + 30);

  // Documentos próximos a vencer (menos de 30 días)
  UPDATE documentos 
  SET estado = 'proximo_vencer'
  WHERE fecha_vencimiento <= '${en30Dias}' 
    AND fecha_vencimiento > '${hoy}'
    AND estado = 'vigente';

  // Documentos vencidos
  UPDATE documentos 
  SET estado = 'caducado'
  WHERE fecha_vencimiento < '${hoy}'
    AND estado IN ('vigente', 'proximo_vencer');
}
```

---

### 4. Categorías y Subtipos Predefinidos

**Crear tablas de referencia:**

```sql
CREATE TABLE categorias_gasto (
  categoria_id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE subtipos_gasto (
  subtipo_id INT PRIMARY KEY AUTO_INCREMENT,
  categoria_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias_gasto(categoria_id)
);

-- Datos iniciales
INSERT INTO categorias_gasto (nombre) VALUES
  ('Suministros'),
  ('Mantenimiento'),
  ('Servicios'),
  ('Transporte'),
  ('Marketing');

INSERT INTO subtipos_gasto (categoria_id, nombre) VALUES
  (1, 'Papel'),
  (1, 'Material oficina'),
  (1, 'Limpieza'),
  (1, 'Tecnología'),
  (2, 'Preventivo'),
  (2, 'Correctivo'),
  (2, 'Inspección');
```

---

### 5. Ejemplo de Integración OCR (Python + Google Vision)

```python
from google.cloud import vision
import io

def extraer_datos_ticket(imagen_path):
    """Extrae datos de un ticket usando Google Cloud Vision API"""
    
    client = vision.ImageAnnotatorClient()

    with io.open(imagen_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    
    # Detectar texto
    response = client.document_text_detection(image=image)
    
    texto_completo = response.full_text_annotation.text
    
    # Extraer datos con regex
    import re
    
    datos_ocr = {
        'ocr_proveedor_nombre': extraer_proveedor(texto_completo),
        'ocr_nif_proveedor': extraer_nif(texto_completo),
        'ocr_fecha': extraer_fecha(texto_completo),
        'ocr_importe': extraer_importe(texto_completo),
        'ocr_num_factura': extraer_num_factura(texto_completo),
        'ocr_categoria_sugerida': categorizar_por_proveedor(texto_completo)
    }
    
    return datos_ocr
```

---

## 🎉 CONCLUSIÓN

✅ **Frontend 100% completo** con:
- Nuevo badge "Archivado"
- Columna "Tipo" en todas las tablas
- Flujo OCR en 2 pasos
- Nuevos campos en formulario de gastos
- Eventos preparados para Make

⏳ **Pendiente:** Implementación del backend según esta documentación

El programador tiene toda la estructura lista para:
1. Crear las tablas SQL
2. Implementar los endpoints
3. Integrar el servicio OCR
4. Configurar los escenarios Make

**Todo está documentado y preparado para una integración directa.**

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 2.0  
**Estado:** ✅ Documentación Completa
