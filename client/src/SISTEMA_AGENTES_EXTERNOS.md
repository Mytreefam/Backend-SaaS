# 📋 SISTEMA DE AGENTES EXTERNOS v2.0

**Estado:** ✅ Implementado y listo para backend  
**Módulo:** Gerente → Configuración → Agentes Externos  
**Fecha:** 26 de Noviembre de 2025

---

## 🎯 OBJETIVO

Rediseñar la gestión de agentes externos (proveedores, gestorías, auditores) permitiendo **dos modos de acceso**:
1. **Modo SaaS**: Usuario con credenciales y acceso al sistema
2. **Modo Canal**: Comunicación externa solo por email/WhatsApp (sin login)

Sistema preparado para **envío y recepción de documentos**, con reglas de procesamiento automático y preparado para conectar con APIs/Make.com.

---

## 🗺️ NAVEGACIÓN

```
Vista Previa → Perfil Gerente → Configuración → Tab "Agentes Externos"
```

---

## 📦 ARCHIVOS IMPLEMENTADOS

### ✅ Nuevos componentes:
```
/components/gerente/ModalAgenteExterno.tsx (30KB)
  ├─ Modal principal con todos los bloques
  ├─ Selector de modo (SaaS/Canal)
  ├─ Configuración de canales
  ├─ Permisos internos (modo SaaS)
  ├─ Intercambio de documentos (recepción/envío)
  └─ Reglas de procesamiento automático
```

### ✅ Modificados:
```
/components/gerente/ConfiguracionGerente.tsx
  ├─ Actualizada interfaz AgenteExterno
  ├─ Nueva tabla con columnas "Modo" y "Canales"
  ├─ Integración del ModalAgenteExterno
  ├─ Handler handleSaveAgenteExterno
  └─ Datos de ejemplo actualizados (4 agentes)
```

---

## 🎨 DISEÑO DE LA PANTALLA PRINCIPAL

### **Tabla de Agentes Externos**

| Columna | Contenido | Ejemplo |
|---------|-----------|---------|
| **Nombre** | Nombre completo + ID | Juan Rodríguez<br/>AGE-001 |
| **Tipo** | Badge con icono | 🚛 Proveedor<br/>🏢 Gestor<br/>📊 Auditor |
| **Empresa** | Nombre empresa | Harinas Molino del Sur |
| **Modo** | Badge SaaS o Canal | 🔐 SaaS<br/>💬 Canal |
| **Canales** | Iconos de canales activos | 🔐 Login<br/>✉️ Email<br/>💬 WhatsApp |
| **Contacto** | Email + Teléfono | ✉️ juan@empresa.com<br/>📞 +34 918 765 432 |
| **Estado** | Badge Activo/Inactivo | ✓ Activo<br/>✗ Inactivo |
| **Acciones** | Botón Editar | ✏️ Editar |

---

## 🔧 ESTRUCTURA DEL MODAL

### **BLOQUE 1: DATOS GENERALES** 🏢

```typescript
{
  id: string;              // AGE-001 (autogenerado)
  nombre: string;          // "Juan Rodríguez"
  tipo: 'proveedor' | 'gestor' | 'auditor' | 'otro';
  empresa: string;         // Selector de empresas
  email: string;           // Email de contacto
  telefono: string;        // Teléfono
}
```

**UI:**
- 2 columnas responsive
- Badges de colores por tipo:
  - Proveedor: azul 🔵
  - Gestor: morado 🟣
  - Auditor: naranja 🟠
  - Otro: gris ⚪

---

### **BLOQUE 2: MODO DE ACCESO** 🌐

**Radio buttons:**

```
⚪ Acceso al sistema (usuario y contraseña) → modo = "SAAS"
   El agente tendrá credenciales para iniciar sesión

⚪ Comunicación externa (email / WhatsApp) → modo = "CANAL"
   El agente enviará/recibirá documentos solo por canales externos
```

Al cambiar el modo, se muestran/ocultan bloques dinámicamente.

---

### **BLOQUE 3: ACCESO INTERNO** 🛡️
**(Solo si modo = SAAS)**

```typescript
{
  username: string;              // Autogenerado desde email
  estadoUsuario: 'activo' | 'bloqueado';
  enviarCredenciales: boolean;   // Toggle
  
  permisos: {
    puede_subir_nominas: boolean;
    puede_subir_contratos: boolean;
    puede_subir_irpf: boolean;
    puede_ver_documentos_subidos: boolean;
    puede_exportar_facturacion: boolean;
    puede_exportar_informes: boolean;
  }
}
```

**UI:**
- Username autogenerado (editable)
- Selector de estado (Activo/Bloqueado)
- Toggle "Enviar credenciales por email"
- 6 permisos con toggles individuales

---

### **BLOQUE 4: CANALES DE COMUNICACIÓN** 💬
**(Solo si modo = CANAL)**

#### **Canal Email** ✉️
```typescript
{
  canal_email_activo: boolean;
  email_destino_sistema: string;  // agente_age-001@cliente.udaredge.app
}
```

**UI:**
- Toggle activar/desactivar
- Email del sistema (readonly) - para que el agente envíe docs

#### **Canal WhatsApp** 📱
```typescript
{
  canal_whatsapp_activo: boolean;
  whatsapp_numero_sistema: string;  // +34 600 XXX XXX
}
```

**UI:**
- Toggle activar/desactivar
- Número del bot (readonly) - para que el agente envíe docs

---

### **BLOQUE 5: INTERCAMBIO DE DOCUMENTOS** 📄
**(Común para ambos modos)**

#### **5A. Documentos que el agente RECIBE** ⬇️

Accordion expandible con lista:

```typescript
recepcion: {
  recibir_pedidos: { 
    activo: boolean; 
    canal: 'email' | 'whatsapp' | 'saas' 
  };
  recibir_facturas_emitidas: { activo: boolean; canal: ... };
  recibir_albaranes: { activo: boolean; canal: ... };
  recibir_contratos: { activo: boolean; canal: ... };
  recibir_informes: { activo: boolean; canal: ... };
  recibir_avisos_generales: { activo: boolean; canal: ... };
}
```

**UI:**
```
[✓] Recibir pedidos          → Canal: [WhatsApp ▼]
[✓] Recibir facturas emitidas → Canal: [Email ▼]
[✗] Recibir albaranes
```

#### **5B. Documentos que el agente PUEDE SUBIR** ⬆️

Accordion expandible con lista:

```typescript
envio: {
  subir_facturas_proveedor: boolean;
  subir_albaranes: boolean;
  subir_nominas: boolean;         // Solo si tipo = 'gestor'
  subir_contratos: boolean;
  subir_justificantes: boolean;
  subir_auditorias: boolean;
  subir_otros_documentos: boolean;
}
```

**UI:**
- Toggles simples on/off
- Nota: "Los documentos recibidos se procesan según las reglas definidas"

---

### **BLOQUE 6: REGLAS DE PROCESAMIENTO AUTOMÁTICO** ⚙️

```typescript
reglas: {
  identificador_principal: 'dni' | 'nif' | 'cif' | 'codigo_interno' | 'nombre_trabajador' | 'nombre_proveedor';
  origen_identificador: 'nombre_archivo' | 'contenido_ocr' | 'asunto_email' | 'cuerpo_mensaje';
  tipo_documento_por_defecto: 'factura_proveedor' | 'nomina' | 'albaran' | 'contrato' | 'informe' | 'otro';
  destino_por_defecto: 'modulo_facturacion' | 'modulo_rrhh' | 'modulo_pedidos' | 'modulo_auditoria' | 'modulo_documentacion_general';
}
```

**UI:**
- 4 selectores (2x2 grid)
- Ejemplo visual debajo mostrando la configuración actual

**Ejemplo:**
```
Identificador principal: CIF
Origen: Nombre del archivo
Tipo doc por defecto: Factura proveedor
Destino: Módulo facturación
```

---

## 🗄️ MODELO DE DATOS PARA BACKEND

### **Tabla: `external_agents`**

```sql
CREATE TABLE external_agents (
  id VARCHAR(20) PRIMARY KEY,                    -- AGE-001
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,                     -- proveedor, gestor, auditor, otro
  empresa_id VARCHAR(20),                        -- FK a tabla empresas
  email_contacto VARCHAR(255),
  telefono_contacto VARCHAR(50),
  
  -- Modo de acceso
  modo VARCHAR(10) NOT NULL,                     -- SAAS, CANAL
  
  -- Acceso SaaS (solo si modo = SAAS)
  username VARCHAR(100),
  password_hash VARCHAR(255),
  estado_usuario VARCHAR(20),                    -- activo, bloqueado
  enviar_credenciales BOOLEAN DEFAULT true,
  
  -- Canales (solo si modo = CANAL)
  canal_email_activo BOOLEAN DEFAULT false,
  canal_whatsapp_activo BOOLEAN DEFAULT false,
  email_destino_sistema VARCHAR(255),
  whatsapp_numero_sistema VARCHAR(50),
  
  -- Metadata
  activo BOOLEAN DEFAULT true,
  fecha_alta TIMESTAMP DEFAULT NOW(),
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  modificado_por VARCHAR(20),                    -- ID del gerente
  
  -- Multiempresa
  empresa_id_propietario VARCHAR(20) NOT NULL,   -- Empresa del cliente
  marca_id VARCHAR(20),
  punto_venta_id VARCHAR(20),
  
  CONSTRAINT fk_empresa_propietario FOREIGN KEY (empresa_id_propietario) REFERENCES empresas(id)
);
```

### **Tabla: `external_agent_permissions`**
**(Solo para modo SaaS)**

```sql
CREATE TABLE external_agent_permissions (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(20) NOT NULL,
  
  -- Permisos SaaS
  puede_subir_nominas BOOLEAN DEFAULT false,
  puede_subir_contratos BOOLEAN DEFAULT false,
  puede_subir_irpf BOOLEAN DEFAULT false,
  puede_ver_documentos_subidos BOOLEAN DEFAULT false,
  puede_exportar_facturacion BOOLEAN DEFAULT false,
  puede_exportar_informes BOOLEAN DEFAULT false,
  
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_agent_permissions FOREIGN KEY (agent_id) REFERENCES external_agents(id) ON DELETE CASCADE
);
```

### **Tabla: `external_agent_capabilities`**

```sql
CREATE TABLE external_agent_capabilities (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(20) NOT NULL,
  
  -- Documentos que RECIBE desde el sistema
  recibir_pedidos BOOLEAN DEFAULT false,
  recibir_pedidos_canal VARCHAR(20),             -- email, whatsapp, saas
  recibir_facturas_emitidas BOOLEAN DEFAULT false,
  recibir_facturas_canal VARCHAR(20),
  recibir_albaranes BOOLEAN DEFAULT false,
  recibir_albaranes_canal VARCHAR(20),
  recibir_contratos BOOLEAN DEFAULT false,
  recibir_contratos_canal VARCHAR(20),
  recibir_informes BOOLEAN DEFAULT false,
  recibir_informes_canal VARCHAR(20),
  recibir_avisos_generales BOOLEAN DEFAULT false,
  recibir_avisos_canal VARCHAR(20),
  
  -- Documentos que SUBE al sistema
  subir_facturas_proveedor BOOLEAN DEFAULT false,
  subir_albaranes BOOLEAN DEFAULT false,
  subir_nominas BOOLEAN DEFAULT false,
  subir_contratos BOOLEAN DEFAULT false,
  subir_justificantes BOOLEAN DEFAULT false,
  subir_auditorias BOOLEAN DEFAULT false,
  subir_otros_documentos BOOLEAN DEFAULT false,
  
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_agent_capabilities FOREIGN KEY (agent_id) REFERENCES external_agents(id) ON DELETE CASCADE
);
```

### **Tabla: `external_agent_rules`**

```sql
CREATE TABLE external_agent_rules (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(20) NOT NULL,
  
  -- Reglas de procesamiento automático
  identificador_principal VARCHAR(50) NOT NULL,   -- dni, nif, cif, codigo_interno, etc.
  origen_identificador VARCHAR(50) NOT NULL,      -- nombre_archivo, contenido_ocr, asunto_email, etc.
  tipo_documento_por_defecto VARCHAR(50) NOT NULL,-- factura_proveedor, nomina, albaran, etc.
  destino_por_defecto VARCHAR(50) NOT NULL,       -- modulo_facturacion, modulo_rrhh, etc.
  
  fecha_modificacion TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_agent_rules FOREIGN KEY (agent_id) REFERENCES external_agents(id) ON DELETE CASCADE
);
```

### **Tabla: `external_agent_documents`**
**(Auditoría de documentos intercambiados)**

```sql
CREATE TABLE external_agent_documents (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(20) NOT NULL,
  tipo_intercambio VARCHAR(20) NOT NULL,         -- enviado, recibido
  tipo_documento VARCHAR(50),
  canal VARCHAR(20),                              -- email, whatsapp, saas
  
  -- Datos del documento
  nombre_archivo VARCHAR(255),
  ruta_almacenamiento TEXT,
  tamaño_bytes BIGINT,
  mime_type VARCHAR(100),
  
  -- Procesamiento automático
  identificador_extraido VARCHAR(100),
  destino_modulo VARCHAR(50),
  estado_procesamiento VARCHAR(50),               -- pendiente, procesado, error
  error_mensaje TEXT,
  
  -- Metadata
  fecha_intercambio TIMESTAMP DEFAULT NOW(),
  procesado_por VARCHAR(20),                      -- ID del usuario/sistema
  
  CONSTRAINT fk_agent_documents FOREIGN KEY (agent_id) REFERENCES external_agents(id)
);
```

---

## 🔌 ENDPOINTS PARA BACKEND/MAKE.COM

### **1. Gestión de Agentes**

#### `POST /api/external-agents`
Crear nuevo agente externo

**Request:**
```json
{
  "nombre": "Juan Rodríguez",
  "tipo": "proveedor",
  "empresa": "Harinas Molino del Sur",
  "email": "juan@empresa.com",
  "telefono": "+34 918 765 432",
  "modo": "CANAL",
  "canal_email_activo": true,
  "canal_whatsapp_activo": false,
  "recepcion": {
    "recibir_pedidos": { "activo": true, "canal": "email" }
  },
  "envio": {
    "subir_facturas_proveedor": true
  },
  "reglas": {
    "identificador_principal": "cif",
    "origen_identificador": "nombre_archivo",
    "tipo_documento_por_defecto": "factura_proveedor",
    "destino_por_defecto": "modulo_facturacion"
  }
}
```

**Response:**
```json
{
  "success": true,
  "agent_id": "AGE-005",
  "email_destino_sistema": "agente_age-005@cliente.udaredge.app",
  "whatsapp_numero_sistema": null
}
```

---

#### `PUT /api/external-agents/{agent_id}`
Actualizar agente existente

**Request:** (mismo formato que POST)

**Response:**
```json
{
  "success": true,
  "agent_id": "AGE-001",
  "mensaje": "Agente actualizado correctamente"
}
```

---

#### `GET /api/external-agents/{agent_id}`
Obtener datos de un agente

**Response:**
```json
{
  "id": "AGE-001",
  "nombre": "Juan Rodríguez",
  "tipo": "proveedor",
  "empresa": "Harinas Molino del Sur",
  "email": "juan@empresa.com",
  "telefono": "+34 918 765 432",
  "modo": "CANAL",
  "canal_email_activo": true,
  "canal_whatsapp_activo": false,
  "email_destino_sistema": "agente_age-001@cliente.udaredge.app",
  "recepcion": { ... },
  "envio": { ... },
  "reglas": { ... },
  "activo": true,
  "fecha_alta": "2024-01-15T10:00:00Z"
}
```

---

#### `GET /api/external-agents`
Listar todos los agentes (con filtros)

**Query params:**
- `tipo`: proveedor, gestor, auditor, otro
- `modo`: SAAS, CANAL
- `activo`: true, false
- `empresa_id`: filtrar por empresa

**Response:**
```json
{
  "agentes": [
    { "id": "AGE-001", ... },
    { "id": "AGE-002", ... }
  ],
  "total": 4,
  "pagina": 1,
  "por_pagina": 20
}
```

---

### **2. Envío de Documentos**

#### `POST /api/external-agents/{agent_id}/send-document`
Enviar documento al agente por el canal configurado

**Request:**
```json
{
  "tipo_documento": "pedido",
  "canal": "email",                    // o "whatsapp", "saas"
  "archivo_url": "https://...",
  "metadata": {
    "numero_pedido": "PED-001",
    "fecha": "2025-11-26",
    "importe": 150.00
  }
}
```

**Response:**
```json
{
  "success": true,
  "document_id": "DOC-001",
  "canal_usado": "email",
  "destinatario": "agente_age-001@cliente.udaredge.app",
  "estado": "enviado",
  "fecha_envio": "2025-11-26T14:30:00Z"
}
```

---

### **3. Recepción de Documentos**

#### `POST /api/external-agents/receive-document`
Webhook para recibir documentos de agentes (email/WhatsApp)

**Request:**
```json
{
  "origen": "email",                   // o "whatsapp"
  "remitente": "juan@empresa.com",
  "asunto": "Factura 2025-001",
  "cuerpo": "Adjunto factura del mes",
  "archivo": {
    "nombre": "FACTURA_CIF_B12345678_2025001.pdf",
    "url": "https://...",
    "mime_type": "application/pdf",
    "tamaño_bytes": 245678
  }
}
```

**Response:**
```json
{
  "success": true,
  "document_id": "DOC-002",
  "agent_id": "AGE-001",
  "identificador_extraido": "B12345678",
  "tipo_documento": "factura_proveedor",
  "destino_modulo": "modulo_facturacion",
  "estado_procesamiento": "procesado",
  "entidad_creada": {
    "tipo": "factura_proveedor",
    "id": "FP-2025-001"
  }
}
```

---

## ⚡ EVENTOS PARA MAKE.COM / AUTOFLOW

### **Evento 1: `on_external_agent_created`**

Disparado cuando se crea un nuevo agente externo.

**Payload:**
```json
{
  "evento": "on_external_agent_created",
  "timestamp": "2025-11-26T14:30:00Z",
  "agent_id": "AGE-005",
  "nombre": "Carlos Pérez",
  "tipo": "gestor",
  "modo": "SAAS",
  "email": "carlos@gestoria.com",
  "email_destino_sistema": "agente_age-005@cliente.udaredge.app",
  "enviar_credenciales": true
}
```

**Acciones sugeridas:**
- Crear usuario en el sistema SaaS
- Enviar email de bienvenida con credenciales
- Crear registro en CRM
- Notificar al gerente

---

### **Evento 2: `on_external_agent_updated`**

Disparado cuando se actualiza un agente.

**Payload:**
```json
{
  "evento": "on_external_agent_updated",
  "timestamp": "2025-11-26T15:00:00Z",
  "agent_id": "AGE-001",
  "cambios": {
    "campo": "canal_whatsapp_activo",
    "valor_anterior": false,
    "valor_nuevo": true
  }
}
```

**Acciones sugeridas:**
- Activar webhook de WhatsApp
- Actualizar configuración de canales
- Notificar al agente del cambio

---

### **Evento 3: `on_external_document_received`**

Disparado cuando un agente envía un documento al sistema.

**Payload:**
```json
{
  "evento": "on_external_document_received",
  "timestamp": "2025-11-26T16:00:00Z",
  "document_id": "DOC-123",
  "agent_id": "AGE-001",
  "agent_nombre": "Juan Rodríguez",
  "tipo_documento": "factura_proveedor",
  "canal": "email",
  "archivo": {
    "nombre": "factura_nov_2025.pdf",
    "url": "https://storage.../...",
    "tamaño_bytes": 345678
  },
  "identificador_extraido": "B12345678",
  "destino_modulo": "modulo_facturacion",
  "ruta_destino": "/facturas/proveedores/",
  "estado_procesamiento": "procesado"
}
```

**Acciones sugeridas:**
- Procesar documento con OCR
- Extraer datos (CIF, importe, fecha)
- Crear factura en el módulo de facturación
- Notificar al gerente
- Registrar en auditoría

---

### **Evento 4: `on_external_document_sent`**

Disparado cuando el sistema envía un documento a un agente.

**Payload:**
```json
{
  "evento": "on_external_document_sent",
  "timestamp": "2025-11-26T17:00:00Z",
  "document_id": "DOC-124",
  "agent_id": "AGE-002",
  "agent_nombre": "María González",
  "tipo_documento": "pedido",
  "canal": "whatsapp",
  "destinatario": "+34 600 XXX XXX",
  "archivo": {
    "nombre": "pedido_PED-001.pdf",
    "url": "https://...",
    "tamaño_bytes": 125000
  },
  "modulo_origen": "modulo_pedidos",
  "id_entidad_origen": "PED-001",
  "estado_envio": "enviado"
}
```

**Acciones sugeridas:**
- Confirmar envío al agente
- Registrar en auditoría
- Actualizar estado del pedido
- Programar recordatorio si no hay respuesta

---

## 🔄 FLUJO DE PROCESAMIENTO AUTOMÁTICO

### **Escenario 1: Proveedor envía factura por email**

```
1. Proveedor envía email a: agente_age-001@cliente.udaredge.app
   Asunto: "Factura noviembre 2025"
   Adjunto: "FACTURA_B12345678_NOV2025.pdf"

2. Sistema recibe email → Dispara webhook
   POST /api/external-agents/receive-document

3. Sistema identifica agente por email destino
   agent_id: AGE-001

4. Sistema busca reglas del agente:
   - identificador_principal: "cif"
   - origen_identificador: "nombre_archivo"
   - tipo_documento: "factura_proveedor"
   - destino: "modulo_facturacion"

5. Sistema extrae CIF del nombre del archivo:
   "B12345678"

6. Sistema procesa documento con OCR:
   - Fecha: 15/11/2025
   - Importe: 1.250,00€
   - Proveedor: Harinas Molino del Sur

7. Sistema crea factura en módulo de facturación:
   FP-2025-045

8. Sistema registra en auditoría:
   - document_id: DOC-123
   - estado: "procesado"
   - entidad_creada: FP-2025-045

9. Sistema dispara evento:
   on_external_document_received

10. Make.com/AutoFlow ejecuta acciones:
    - Notifica al gerente
    - Envía email de confirmación al proveedor
```

---

### **Escenario 2: Gestoría sube nóminas por SaaS**

```
1. Gestoría inicia sesión en el sistema
   Usuario: carlos_fernandez

2. Navega a: Módulo RRHH → Subir nóminas

3. Selecciona múltiples archivos:
   - NOMINA_12345678A_NOV2025.pdf (Empleado Carlos)
   - NOMINA_87654321B_NOV2025.pdf (Empleado María)

4. Sistema procesa cada archivo:
   - Extrae DNI del nombre (regla configurada)
   - Busca empleado por DNI
   - Crea registro en trabajador_doc_laboral
   - Asocia documento al empleado correcto

5. Sistema registra en auditoría

6. Sistema dispara evento:
   on_external_document_received (x2)

7. Notificación a empleados:
   "Tu nómina de noviembre ya está disponible"
```

---

## 🧪 DATOS DE EJEMPLO

### **Agente 1: Proveedor con Canal Email**

```typescript
{
  id: 'AGE-001',
  nombre: 'Juan Rodríguez',
  tipo: 'proveedor',
  empresa: 'Harinas Molino del Sur',
  email: 'juan.rodriguez@molinodelsur.com',
  telefono: '+34 918 765 432',
  modo: 'CANAL',
  canal_email_activo: true,
  canal_whatsapp_activo: false,
  email_destino_sistema: 'agente_age-001@cliente.udaredge.app',
  recepcion: {
    recibir_pedidos: { activo: true, canal: 'email' },
    recibir_albaranes: { activo: true, canal: 'email' }
  },
  envio: {
    subir_facturas_proveedor: true,
    subir_albaranes: true,
    subir_justificantes: true
  },
  reglas: {
    identificador_principal: 'cif',
    origen_identificador: 'nombre_archivo',
    tipo_documento_por_defecto: 'factura_proveedor',
    destino_por_defecto: 'modulo_facturacion'
  }
}
```

---

### **Agente 2: Proveedor con WhatsApp**

```typescript
{
  id: 'AGE-002',
  nombre: 'María González',
  tipo: 'proveedor',
  empresa: 'Lácteos Menorca',
  modo: 'CANAL',
  canal_email_activo: true,
  canal_whatsapp_activo: true,
  whatsapp_numero_sistema: '+34 600 XXX XXX',
  recepcion: {
    recibir_pedidos: { activo: true, canal: 'whatsapp' },
    recibir_albaranes: { activo: true, canal: 'whatsapp' }
  },
  envio: {
    subir_facturas_proveedor: true,
    subir_albaranes: true
  },
  reglas: {
    identificador_principal: 'cif',
    origen_identificador: 'contenido_ocr',
    tipo_documento_por_defecto: 'factura_proveedor',
    destino_por_defecto: 'modulo_facturacion'
  }
}
```

---

### **Agente 3: Gestoría con acceso SaaS**

```typescript
{
  id: 'AGE-003',
  nombre: 'Carlos Fernández',
  tipo: 'gestor',
  empresa: 'Asesoría Fiscal Menéndez',
  modo: 'SAAS',
  username: 'carlos_fernandez',
  estadoUsuario: 'activo',
  enviarCredenciales: true,
  permisos: {
    puede_subir_nominas: true,
    puede_subir_contratos: true,
    puede_subir_irpf: true,
    puede_ver_documentos_subidos: true,
    puede_exportar_facturacion: true,
    puede_exportar_informes: true
  },
  recepcion: {
    recibir_facturas_emitidas: { activo: true, canal: 'saas' },
    recibir_informes: { activo: true, canal: 'saas' }
  },
  envio: {
    subir_nominas: true,
    subir_contratos: true,
    subir_otros_documentos: true
  },
  reglas: {
    identificador_principal: 'dni',
    origen_identificador: 'contenido_ocr',
    tipo_documento_por_defecto: 'nomina',
    destino_por_defecto: 'modulo_rrhh'
  }
}
```

---

## 📝 CONSOLE LOGS PARA DEBUGGING

Al guardar un agente, el sistema loggea en console:

```javascript
console.log('💾 GUARDAR AGENTE EXTERNO:', {
  agente: {
    id: 'AGE-001',
    nombre: 'Juan Rodríguez',
    tipo: 'proveedor',
    empresa: 'Harinas Molino del Sur'
  },
  modo: 'CANAL',
  canales: {
    email: true,
    whatsapp: false
  },
  permisos: null,  // null si modo = CANAL
  recepcion: {
    recibir_pedidos: { activo: true, canal: 'email' },
    // ... más
  },
  envio: {
    subir_facturas_proveedor: true,
    // ... más
  },
  reglas: {
    identificador_principal: 'cif',
    origen_identificador: 'nombre_archivo',
    tipo_documento_por_defecto: 'factura_proveedor',
    destino_por_defecto: 'modulo_facturacion'
  }
});
```

---

## ✅ CHECKLIST PARA DEVELOPER

### **Frontend** (✅ Completado)
- [x] Modal ModalAgenteExterno.tsx creado
- [x] Selector de modo (SaaS/Canal)
- [x] Bloques condicionales según modo
- [x] Configuración de canales (Email/WhatsApp)
- [x] Permisos SaaS (6 toggles)
- [x] Documentos de recepción (6 opciones + canal)
- [x] Documentos de envío (7 opciones)
- [x] Reglas de procesamiento (4 selectores)
- [x] Tabla actualizada (columnas Modo y Canales)
- [x] Integración en ConfiguracionGerente
- [x] Handler handleSaveAgenteExterno
- [x] Datos de ejemplo (4 agentes)

### **Backend** (⏳ Pendiente)
- [ ] Crear tablas SQL (4 tablas)
- [ ] Endpoint POST /api/external-agents
- [ ] Endpoint PUT /api/external-agents/{id}
- [ ] Endpoint GET /api/external-agents/{id}
- [ ] Endpoint GET /api/external-agents (lista)
- [ ] Endpoint POST /api/external-agents/{id}/send-document
- [ ] Webhook POST /api/external-agents/receive-document
- [ ] Autogeneración de email_destino_sistema
- [ ] Autogeneración de whatsapp_numero_sistema
- [ ] Integración con servicio de email
- [ ] Integración con WhatsApp Bot
- [ ] Procesamiento OCR de documentos
- [ ] Extracción de identificadores
- [ ] Routing automático a módulos

### **Make.com / AutoFlow** (⏳ Pendiente)
- [ ] Evento on_external_agent_created
- [ ] Evento on_external_agent_updated
- [ ] Evento on_external_document_received
- [ ] Evento on_external_document_sent
- [ ] Flow: Envío de credenciales por email
- [ ] Flow: Procesamiento de facturas recibidas
- [ ] Flow: Procesamiento de nóminas recibidas
- [ ] Flow: Notificaciones a gerente
- [ ] Flow: Confirmaciones a agentes

---

## 🎉 CONCLUSIÓN

El **Sistema de Agentes Externos v2.0** está **100% implementado en frontend** y **completamente documentado** para integración con backend.

### **Características clave:**
✅ Dos modos de acceso (SaaS y Canal)  
✅ Configuración flexible de canales (Email/WhatsApp)  
✅ Permisos granulares para modo SaaS  
✅ Intercambio bidireccional de documentos  
✅ Reglas de procesamiento automático  
✅ Preparado para OCR y routing automático  
✅ Eventos para Make.com/AutoFlow  
✅ Modelo de datos completo (4 tablas)  
✅ 7 endpoints definidos  
✅ 4 eventos documentados  

**Todo listo para que el developer conecte las APIs y active el flujo automático de documentos! 🚀**

---

**Documentación adicional:**
- Modelo de datos: Ver sección "Modelo de datos para backend"
- Endpoints: Ver sección "Endpoints para backend/Make.com"
- Eventos: Ver sección "Eventos para Make.com / AutoFlow"
- Ejemplos: Ver sección "Datos de ejemplo"
