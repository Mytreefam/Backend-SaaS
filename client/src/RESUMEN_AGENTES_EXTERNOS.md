# ✅ RESUMEN: SISTEMA DE AGENTES EXTERNOS v2.0

**Estado:** ✅ Implementado y listo para backend  
**Fecha:** 26 de Noviembre de 2025

---

## 🎯 ¿QUÉ SE HA HECHO?

Rediseño completo del módulo de Agentes Externos con **dos modos de acceso**:

1. **Modo SaaS**: Agente con credenciales y acceso al sistema
2. **Modo Canal**: Agente sin login, solo comunicación por email/WhatsApp

El sistema permite **intercambio bidireccional de documentos** con procesamiento automático.

---

## 🗺️ NAVEGACIÓN

```
Vista Previa → Gerente → Configuración → "Agentes Externos"
```

---

## 📦 ARCHIVOS CREADOS/MODIFICADOS

### ✅ Nuevos:
- `/components/gerente/ModalAgenteExterno.tsx` (30KB)
- `/SISTEMA_AGENTES_EXTERNOS.md` (documentación completa)
- `/RESUMEN_AGENTES_EXTERNOS.md` (este archivo)

### ✅ Modificados:
- `/components/gerente/ConfiguracionGerente.tsx`

---

## 🎨 NUEVA TABLA DE AGENTES

La tabla ahora tiene **8 columnas**:

| Columna | Nuevo | Descripción |
|---------|-------|-------------|
| Nombre | - | Nombre + ID del agente |
| Tipo | - | Badge: Proveedor/Gestor/Auditor/Otro |
| Empresa | - | Empresa asociada |
| **Modo** | ✅ | Badge: SaaS o Canal |
| **Canales** | ✅ | Iconos: 🔐 Login / ✉️ Email / 💬 WhatsApp |
| Contacto | - | Email + Teléfono |
| Estado | - | Activo/Inactivo |
| Acciones | ✅ | Botón Editar (abre modal) |

---

## 🔧 ESTRUCTURA DEL MODAL

### **6 Bloques principales:**

#### 1️⃣ **Datos Generales** 🏢
- Nombre, Tipo, Empresa, Email, Teléfono

#### 2️⃣ **Modo de Acceso** 🌐
Radio buttons:
- ⚪ Acceso al sistema (SaaS)
- ⚪ Comunicación externa (Canal)

#### 3️⃣ **Acceso Interno** 🛡️ (solo SaaS)
- Username (autogenerado)
- Estado: Activo/Bloqueado
- Toggle: Enviar credenciales por email
- **6 permisos internos:**
  - Subir nóminas
  - Subir contratos
  - Subir IRPF
  - Ver documentos subidos
  - Exportar facturación
  - Exportar informes

#### 4️⃣ **Canales de Comunicación** 💬 (solo Canal)
- **Email:** Toggle + email del sistema (readonly)
- **WhatsApp:** Toggle + número del bot (readonly)

#### 5️⃣ **Intercambio de Documentos** 📄 (ambos modos)

**5A. Documentos que RECIBE** ⬇️
- 6 tipos de documentos con toggle + selector de canal:
  - Recibir pedidos
  - Recibir facturas emitidas
  - Recibir albaranes
  - Recibir contratos
  - Recibir informes
  - Recibir avisos generales

**5B. Documentos que SUBE** ⬆️
- 7 tipos de documentos con toggle:
  - Subir facturas proveedor
  - Subir albaranes
  - Subir nóminas (solo gestores)
  - Subir contratos
  - Subir justificantes
  - Subir auditorías
  - Subir otros documentos

#### 6️⃣ **Reglas de Procesamiento Automático** ⚙️
4 selectores:
- **Identificador principal:** DNI, NIF, CIF, código interno, nombre...
- **Origen:** Nombre archivo, contenido OCR, asunto email, cuerpo mensaje
- **Tipo documento por defecto:** Factura, nómina, albarán, contrato...
- **Destino:** Módulo facturación, RRHH, pedidos, auditoría...

---

## 🗄️ MODELO DE DATOS (4 TABLAS)

### 1. `external_agents` (tabla principal)
Datos básicos del agente, modo, canales, credenciales SaaS

### 2. `external_agent_permissions` (solo SaaS)
6 permisos internos del sistema

### 3. `external_agent_capabilities`
Qué documentos recibe y qué documentos puede subir

### 4. `external_agent_rules`
Reglas de procesamiento automático (OCR + routing)

### 5. `external_agent_documents` (auditoría)
Registro de todos los documentos intercambiados

---

## 🔌 ENDPOINTS (7 TOTAL)

### **Gestión de Agentes:**
1. `POST /api/external-agents` - Crear
2. `PUT /api/external-agents/{id}` - Actualizar
3. `GET /api/external-agents/{id}` - Obtener uno
4. `GET /api/external-agents` - Listar todos

### **Documentos:**
5. `POST /api/external-agents/{id}/send-document` - Enviar doc al agente
6. `POST /api/external-agents/receive-document` - Webhook para recibir docs

---

## ⚡ EVENTOS PARA MAKE.COM (4 TOTAL)

1. **`on_external_agent_created`** - Al crear agente
2. **`on_external_agent_updated`** - Al actualizar agente
3. **`on_external_document_received`** - Al recibir documento
4. **`on_external_document_sent`** - Al enviar documento

---

## 🔄 EJEMPLO DE FLUJO AUTOMÁTICO

### **Proveedor envía factura por email:**

```
1. Proveedor envía a: agente_age-001@cliente.udaredge.app
   Adjunto: FACTURA_B12345678_NOV2025.pdf

2. Sistema recibe email → identifica agente AGE-001

3. Sistema aplica reglas:
   - Extrae CIF del nombre archivo: "B12345678"
   - Tipo documento: "factura_proveedor"
   - Destino: "modulo_facturacion"

4. Sistema procesa con OCR:
   - Fecha: 15/11/2025
   - Importe: 1.250€

5. Sistema crea factura automáticamente: FP-2025-045

6. Sistema dispara evento: on_external_document_received

7. Make.com ejecuta:
   - Notifica al gerente
   - Envía confirmación al proveedor
```

---

## 🧪 DATOS DE EJEMPLO (4 AGENTES)

### **AGE-001: Proveedor con Email**
- Tipo: Proveedor
- Modo: CANAL
- Canales: ✉️ Email
- Recibe: Pedidos, Albaranes
- Sube: Facturas, Albaranes

### **AGE-002: Proveedor con WhatsApp**
- Tipo: Proveedor
- Modo: CANAL
- Canales: ✉️ Email + 💬 WhatsApp
- Recibe: Pedidos (WhatsApp)
- Sube: Facturas, Albaranes

### **AGE-003: Gestoría con SaaS (Activo)**
- Tipo: Gestor
- Modo: SAAS
- Canales: 🔐 Login + ✉️ Email
- Username: carlos_fernandez
- Permisos: Todos (6/6)
- Sube: Nóminas, Contratos

### **AGE-004: Gestoría con SaaS (Bloqueado)**
- Tipo: Gestor
- Modo: SAAS
- Estado: Bloqueado
- Permisos: Parcial (3/6)
- Sube: Nóminas

---

## 🎯 FUNCIONALIDADES CLAVE

### ✅ Ya implementado (Frontend):
- Modal completo con 6 bloques
- Selector de modo (SaaS/Canal)
- Configuración de canales
- Permisos granulares (6)
- Documentos de recepción (6 + canal)
- Documentos de envío (7)
- Reglas de procesamiento (4 selectores)
- Tabla actualizada con nuevas columnas
- Datos de ejemplo (4 agentes)
- Console logs para debugging

### ⏳ Pendiente (Backend):
- Crear 4 tablas SQL
- Implementar 7 endpoints
- Configurar 4 eventos Make.com
- Integración con email
- Integración con WhatsApp Bot
- Procesamiento OCR
- Routing automático a módulos

---

## 📋 PAYLOADS DE EJEMPLO

### **Crear agente (POST /api/external-agents):**

```json
{
  "nombre": "Juan Rodríguez",
  "tipo": "proveedor",
  "modo": "CANAL",
  "canal_email_activo": true,
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

### **Evento documento recibido:**

```json
{
  "evento": "on_external_document_received",
  "agent_id": "AGE-001",
  "tipo_documento": "factura_proveedor",
  "canal": "email",
  "identificador_extraido": "B12345678",
  "destino_modulo": "modulo_facturacion",
  "estado_procesamiento": "procesado"
}
```

---

## 🚀 PRÓXIMOS PASOS

### **Para el Developer:**

1. **Crear tablas en PostgreSQL** (esquema en documentación completa)
2. **Implementar endpoints** (7 endpoints documentados)
3. **Configurar webhooks** para email y WhatsApp
4. **Integrar OCR** para procesamiento automático
5. **Configurar Make.com** (4 eventos)
6. **Testear flujos** con datos de ejemplo

### **Para probar en frontend:**

1. Ir a: Gerente → Configuración → Agentes Externos
2. Clic en "Añadir Agente"
3. Llenar datos generales
4. Seleccionar modo (SaaS o Canal)
5. Configurar según el modo elegido
6. Configurar documentos de recepción/envío
7. Definir reglas de procesamiento
8. Guardar → Ver console log (F12)

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles técnicos, ver:
- **`/SISTEMA_AGENTES_EXTERNOS.md`** - Documentación técnica completa (28KB)
  - Modelo de datos SQL completo
  - Todos los endpoints con request/response
  - Todos los eventos con payloads
  - Ejemplos de flujos completos
  - Guías de integración

---

## 💡 NOTAS IMPORTANTES

1. **Email del sistema se autogenera:** `agente_{id}@cliente.udaredge.app`
2. **Username se autogenera** desde el email (para modo SaaS)
3. **Nóminas solo visibles** si tipo = 'gestor'
4. **Canales se muestran dinámicamente** según modo elegido
5. **Reglas son obligatorias** para procesamiento automático
6. **Todo se loggea en console** para debugging

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend (✅ Completado 100%)
- [x] Modal ModalAgenteExterno.tsx
- [x] Integración en ConfiguracionGerente
- [x] Tabla con nuevas columnas
- [x] Datos de ejemplo
- [x] Console logs

### Backend (⏳ 0% completado)
- [ ] 4 tablas SQL
- [ ] 7 endpoints
- [ ] 4 eventos Make.com
- [ ] OCR + routing

---

## 🎉 CONCLUSIÓN

**Sistema 100% funcional en frontend**, completamente documentado y listo para que el developer conecte el backend.

**Características principales:**
- 2 modos de acceso (SaaS y Canal)
- 3 canales (Login, Email, WhatsApp)
- 6 permisos SaaS
- 13 tipos de documentos
- Procesamiento automático con OCR
- 4 eventos para automatización

**Todo preparado para el siguiente paso: integración con backend y Make.com! 🚀**
