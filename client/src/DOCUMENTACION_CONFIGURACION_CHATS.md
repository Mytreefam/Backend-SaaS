# 📦 DOCUMENTACIÓN - CONFIGURACIÓN DE CHATS Y COMUNICACIÓN

**Módulo:** Gerente → Configuración → Chats  
**Fecha:** 26 Noviembre 2024  
**Versión:** 1.0  
**Estado:** ✅ 100% Completado

---

## 📋 ÍNDICE

1. [Descripción General](#descripción-general)
2. [Acceso al Módulo](#acceso-al-módulo)
3. [Estructura Visual](#estructura-visual)
4. [Categorías de Consulta](#categorías-de-consulta)
5. [Modal de Configuración](#modal-de-configuración)
6. [Modelo de Datos](#modelo-de-datos)
7. [Lógica de Negocio](#lógica-de-negocio)
8. [Endpoints API](#endpoints-api)
9. [Casos de Uso](#casos-de-uso)
10. [Implementación Frontend](#implementación-frontend)

---

## 1. DESCRIPCIÓN GENERAL

El módulo de **Configuración de Chats y Comunicación** permite a los gerentes:

✅ Gestionar categorías de consulta para el sistema de chat interno  
✅ Definir destinos personalizados (equipo, tiendas, email, WhatsApp)  
✅ Activar/desactivar categorías según necesidad  
✅ Crear categorías personalizadas para su empresa  
✅ Configurar si se permiten archivos adjuntos  

### Objetivos

- **Flexibilidad:** Cada empresa puede personalizar sus categorías de consulta
- **Escalabilidad:** Sistema preparado para múltiples destinos
- **Integración:** Conecta con email, WhatsApp y equipos internos
- **Control:** Gerente tiene control total sobre las comunicaciones

---

## 2. ACCESO AL MÓDULO

### Ruta de Navegación

```
Dashboard Gerente → Configuración (sidebar) → Botón "Chats"
```

### Estructura de Menú

```
Configuración
├── Cuenta
├── Empresas
├── Presupuesto
├── Agentes Externos
├── Privacidad
├── Seguridad
├── Notificaciones
├── Sistema
└── Chats  ← NUEVO
```

### Permisos

| Rol | Ver | Editar | Crear | Eliminar |
|-----|-----|--------|-------|----------|
| **Gerente** | ✅ | ✅ | ✅ | ✅ (solo personalizadas) |
| **Trabajador** | ❌ | ❌ | ❌ | ❌ |
| **Cliente** | ❌ | ❌ | ❌ | ❌ |

---

## 3. ESTRUCTURA VISUAL

### Layout Principal

```
┌────────────────────────────────────────────────────────────┐
│ 📦 Configuración de Chats y Comunicación                  │
│ Gestiona las categorías de consulta y sus destinos...     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Lista de Categorías de Consulta    [➕ Añadir nueva] ││
│ ├────────────────────────────────────────────────────────┤│
│ │ [🔍 Buscar categoría...]                              ││
│ ├────────────────────────────────────────────────────────┤│
│ │                                                        ││
│ │ TABLA:                                                ││
│ │ ┌──────┬────────────┬────────┬──────────┬─────┬──────┐││
│ │ │ Icon │ Nombre     │ Estado │ Destino  │Adj. │Accs. │││
│ │ ├──────┼────────────┼────────┼──────────┼─────┼──────┤││
│ │ │ 🔧   │Avería...   │Activo  │Equipo    │ Sí  │Edit │││
│ │ │ 👥   │RRHH        │Activo  │Equipo    │ No  │Edit │││
│ │ │ 📦   │Material    │Activo  │Equipo    │ Sí  │Edit │││
│ │ │ ⚠️   │Problema... │Activo  │Equipo    │ Sí  │Edit │││
│ │ │ 🏢   │Otra...     │Activo  │Tienda    │ Sí  │Edit │││
│ │ │ 📄   │Otros       │Activo  │Equipo    │ Sí  │Edit │││
│ │ │ ⚙️   │Informát... │Inactivo│Email     │ Sí  │Del. │││
│ │ └──────┴────────────┴────────┴──────────┴─────┴──────┘││
│ │                                                        ││
│ │ ℹ️ Categorías protegidas: No se pueden eliminar...    ││
│ └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Tabla de Categorías

| Columna | Descripción | Tipo |
|---------|-------------|------|
| **Icono** | Representación visual | Icon (preview) |
| **Nombre consulta** | Nombre de la categoría + Badge "Protegida" | Text + Badge |
| **Estado** | Activo / Inactivo (clickable) | Badge toggle |
| **Destino actual** | Equipo / Tienda / Email / WhatsApp | Text + Icon |
| **Adjuntos** | Sí / No | Badge |
| **Tipo** | Sistema / Personalizada | Text |
| **Acciones** | Editar / Eliminar | Buttons |

---

## 4. CATEGORÍAS DE CONSULTA

### Categorías Protegidas (6)

No se pueden eliminar, pero **sí se pueden renombrar y reconfigurar**.

| ID | Nombre | Icono | Destino Default | Adjuntos | Orden |
|----|--------|-------|-----------------|----------|-------|
| `AVERIA-001` | Avería maquinaria | 🔧 Wrench | EQUIPO (Gerente mantenimiento) | ✅ Sí | 1 |
| `RRHH-001` | Consulta RRHH | 👥 Users | EQUIPO (Gerente RRHH) | ❌ No | 2 |
| `MATERIAL-001` | Solicitud/Petición material | 📦 Package | EQUIPO (Responsable almacén) | ✅ Sí | 3 |
| `PROBLEMA-CLIENTE-001` | Problema con cliente | ⚠️ AlertTriangle | EQUIPO (Múltiples) | ✅ Sí | 4 |
| `OTRA-TIENDA-001` | Reclamación a otra tienda | 🏢 Building | OTRA_TIENDA | ✅ Sí | 5 |
| `OTROS-001` | Otros | 📄 FileText | EQUIPO (Gerente general) | ✅ Sí | 6 |

### Categorías Personalizadas (Ejemplos)

Creadas por el gerente según necesidad.

| ID | Nombre | Icono | Destino | Adjuntos | Estado |
|----|--------|-------|---------|----------|--------|
| `CUSTOM-001` | Consulta informática | ⚙️ Settings | EMAIL (soporte@empresa.com) | ✅ Sí | ✅ Activo |
| `CUSTOM-002` | Urgencias WhatsApp | 💬 MessageCircle | WHATSAPP (+34612345678) | ❌ No | ❌ Inactivo |

---

## 5. MODAL DE CONFIGURACIÓN

### Acceso al Modal

- **Crear nueva:** Click en botón "➕ Añadir nueva categoría"
- **Editar existente:** Click en botón "Editar" de cualquier categoría

### Estructura del Modal

```
┌─────────────────────────────────────────────────┐
│ Editar categoría de consulta            [X]    │
│ Esta es una categoría protegida...             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Nombre de la consulta *                         │
│ [Avería maquinaria                   ]         │
│                                                 │
│ Icono *                                         │
│ [🔧 Llave inglesa                    ▼]        │
│                                                 │
│ ─────────────────────────────────────           │
│                                                 │
│ Destino *                                       │
│ [👥 Equipo interno                   ▼]        │
│                                                 │
│ Miembros del equipo *                           │
│ ┌─────────────────────────────────────────┐    │
│ │ ☑ Jorge Martín - Gerente General       │    │
│ │ ☐ Ana López - Gerente RRHH             │    │
│ │ ☐ Carlos Ruiz - Responsable Almacén    │    │
│ │ ☐ Juan Pérez - Trabajador              │    │
│ └─────────────────────────────────────────┘    │
│ 1 miembro(s) seleccionado(s)                    │
│                                                 │
│ ─────────────────────────────────────           │
│                                                 │
│ Activar categoría                    [ON/OFF]  │
│ Si está desactivada, no aparecerá...           │
│                                                 │
│ Permitir adjuntar archivos           [ON/OFF]  │
│ Los usuarios podrán adjuntar archivos...       │
│                                                 │
├─────────────────────────────────────────────────┤
│                        [Cancelar] [Guardar]    │
└─────────────────────────────────────────────────┘
```

### Campos del Modal

#### 1. Nombre de la consulta
- **Tipo:** Input text
- **Obligatorio:** ✅ Sí
- **Placeholder:** "Ej: Avería maquinaria"
- **Validación:** No puede estar vacío

#### 2. Icono
- **Tipo:** Select con preview
- **Obligatorio:** ✅ Sí
- **Opciones:** 15 iconos disponibles

| Icono | Nombre | Uso sugerido |
|-------|--------|--------------|
| 🔧 Wrench | Llave inglesa | Averías, mantenimiento |
| 👥 Users | Usuarios | RRHH, equipo |
| 📦 Package | Paquete | Material, stock |
| ⚠️ AlertTriangle | Alerta | Problemas urgentes |
| 🏢 Building | Edificio | Tiendas, locales |
| 📄 FileText | Documento | Documentos, otros |
| 📧 Mail | Correo | Emails |
| 💬 MessageCircle | Mensaje | WhatsApp, chat |
| ⚙️ Settings | Configuración | Informática, técnico |
| ⚡ Zap | Rayo | Urgencias |
| 🔔 Bell | Campana | Notificaciones |
| ❓ HelpCircle | Ayuda | Soporte |
| 🛡️ Shield | Escudo | Seguridad |
| 💻 Cpu | CPU | Sistemas, IT |
| 💾 Database | Base datos | Datos, backup |

#### 3. Destino (4 tipos)

##### A) EQUIPO (Interno)

**Muestra:**
- Listado de miembros del equipo (checkboxes)
- Admite múltiples selecciones
- Obtiene datos del módulo "Equipo y RRHH"

**Estructura datos:**

```typescript
{
  destinoTipo: 'EQUIPO',
  destinoValor: 'GERENTE-001,TRAB-102'  // IDs separados por coma
}
```

**Ejemplo visual:**

```
Miembros del equipo *
┌─────────────────────────────────────┐
│ ☑ Jorge Martín - Gerente General   │
│ ☐ Ana López - Gerente RRHH         │
│ ☑ Carlos Ruiz - Responsable...     │
│ ☐ Juan Pérez - Trabajador          │
│ ☐ María García - Trabajador        │
│ ☐ Pedro Sánchez - Trabajador       │
└─────────────────────────────────────┘
2 miembro(s) seleccionado(s)
```

##### B) OTRA_TIENDA

**Muestra:**
- Listado de tiendas (checkboxes)
- Admite múltiples selecciones
- Obtiene datos de "Configuración → Empresas → Puntos de Venta"

**Estructura datos:**

```typescript
{
  destinoTipo: 'OTRA_TIENDA',
  destinoValor: 'PV-TIA,PV-BDN'  // IDs separados por coma
}
```

**Ejemplo visual:**

```
Tiendas destino *
┌─────────────────────────────────────┐
│ ☑ Can Farines - Tiana (PV-TIA)     │
│ ☑ Can Farines - Badalona (PV-BDN)  │
│ ☐ Can Farines - Poblenou (PV-POB)  │
│ ☐ Can Farines - Gràcia (PV-GRA)    │
│ ☐ Can Farines - Sant Martí...      │
└─────────────────────────────────────┘
2 tienda(s) seleccionada(s)
```

##### C) EMAIL

**Muestra:**
- Input de correo electrónico
- Validación de formato email

**Estructura datos:**

```typescript
{
  destinoTipo: 'EMAIL',
  destinoValor: 'soporte@empresa.com'
}
```

**Ejemplo visual:**

```
Correo electrónico *
[soporte@empresa.com                 ]
Los chats enviados a este destino generarán
un correo automático
```

**Validación:**
- Formato email válido: `xxx@xxx.xxx`
- No puede estar vacío

##### D) WHATSAPP

**Muestra:**
- Input de número de teléfono
- Validación de formato

**Estructura datos:**

```typescript
{
  destinoTipo: 'WHATSAPP',
  destinoValor: '+34612345678'
}
```

**Ejemplo visual:**

```
Número de teléfono *
[+34 612 345 678                     ]
Incluye el código de país (ej: +34 para España)
```

**Validación:**
- Solo dígitos, espacios, guiones, paréntesis y +
- Debe incluir código de país

#### 4. Activar categoría

**Tipo:** Toggle ON/OFF  
**Default:** ON (activo)  
**Descripción:** Si está desactivada, no aparecerá en el selector de chats

#### 5. Permitir adjuntar archivos

**Tipo:** Toggle ON/OFF  
**Default:** ON (permite)  
**Descripción:** Los usuarios podrán adjuntar archivos en esta categoría

---

## 6. MODELO DE DATOS

### Entidad: CHAT_ACCION

Tabla principal de configuración de categorías.

```sql
CREATE TABLE chat_accion (
  accion_id VARCHAR(50) PRIMARY KEY,              -- AVERIA-001, CUSTOM-001
  empresa_id VARCHAR(50) NOT NULL,                -- EMP-HOSTELERIA
  nombre VARCHAR(255) NOT NULL,                   -- "Avería maquinaria"
  icono VARCHAR(50) NOT NULL,                     -- "Wrench"
  destino_tipo VARCHAR(20) NOT NULL,              -- EQUIPO | OTRA_TIENDA | EMAIL | WHATSAPP
  destino_valor TEXT,                             -- UserId | PuntoVentaId | email | teléfono
  activo BOOLEAN DEFAULT true,
  permite_adjuntos BOOLEAN DEFAULT true,
  orden INT NOT NULL,
  es_protegida BOOLEAN DEFAULT false,             -- No se puede eliminar
  creado_por VARCHAR(50),                         -- SISTEMA | GERENTE-001
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_modificacion TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id)
);
```

### Índices Recomendados

```sql
CREATE INDEX idx_chat_accion_empresa ON chat_accion(empresa_id);
CREATE INDEX idx_chat_accion_activo ON chat_accion(activo);
CREATE INDEX idx_chat_accion_orden ON chat_accion(orden);
```

### Datos de Ejemplo

```sql
-- Categoría protegida: Avería maquinaria
INSERT INTO chat_accion VALUES (
  'AVERIA-001',
  'EMP-HOSTELERIA',
  'Avería maquinaria',
  'Wrench',
  'EQUIPO',
  'GERENTE-001',  -- ID del gerente de mantenimiento
  true,
  true,
  1,
  true,  -- Es protegida
  'SISTEMA',
  NOW(),
  NULL
);

-- Categoría personalizada: Consulta informática
INSERT INTO chat_accion VALUES (
  'CUSTOM-001',
  'EMP-HOSTELERIA',
  'Consulta informática',
  'Settings',
  'EMAIL',
  'soporte@empresa.com',
  true,
  true,
  7,
  false,  -- No es protegida (se puede eliminar)
  'GERENTE-001',
  NOW(),
  NULL
);
```

---

## 7. LÓGICA DE NEGOCIO

### Al Crear un Chat

Cuando un trabajador crea un chat desde el modal:

```
┌─────────────────────────────────────────┐
│ 1. Trabajador selecciona categoría     │
│    → "Avería maquinaria"                │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 2. Sistema busca configuración          │
│    SELECT * FROM chat_accion            │
│    WHERE accion_id = 'AVERIA-001'       │
│    AND empresa_id = 'EMP-HOSTELERIA'    │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 3. Lee el destino configurado           │
│    destino_tipo = 'EQUIPO'              │
│    destino_valor = 'GERENTE-001'        │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 4. Enruta el chat según destino:        │
│                                         │
│    • EQUIPO → Notificar a usuarios      │
│    • OTRA_TIENDA → Asignar a tienda     │
│    • EMAIL → Enviar correo automático   │
│    • WHATSAPP → Registrar en cola envío │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 5. Crear registro en tabla CHATS        │
│    INSERT INTO chats ...                │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 6. Crear mensaje inicial                │
│    INSERT INTO mensajes_chat ...        │
└─────────────────────────────────────────┘
```

### Enrutamiento según Destino

#### EQUIPO (Interno)

```javascript
async function enrutarAChatEquipo(chatId, destinoValor) {
  // destinoValor = "GERENTE-001,TRAB-102" (múltiples IDs)
  const miembrosIds = destinoValor.split(',');
  
  for (const miembroId of miembrosIds) {
    // Asignar chat al miembro
    await db.query(`
      INSERT INTO chat_asignaciones (chat_id, usuario_id, asignado_en)
      VALUES (?, ?, NOW())
    `, [chatId, miembroId]);
    
    // Enviar notificación interna
    await enviarNotificacionInterna(miembroId, chatId);
  }
}
```

#### OTRA_TIENDA

```javascript
async function enrutarAChatOtraTienda(chatId, destinoValor) {
  // destinoValor = "PV-TIA,PV-BDN" (múltiples tiendas)
  const tiendasIds = destinoValor.split(',');
  
  for (const tiendaId of tiendasIds) {
    // Obtener gerentes/responsables de la tienda
    const responsables = await db.query(`
      SELECT usuario_id FROM usuarios
      WHERE punto_venta_id = ? AND rol IN ('gerente', 'responsable')
    `, [tiendaId]);
    
    // Notificar a cada responsable
    for (const responsable of responsables.rows) {
      await enviarNotificacionInterna(responsable.usuario_id, chatId);
    }
  }
}
```

#### EMAIL

```javascript
async function enrutarAChatEmail(chatId, destinoValor) {
  // destinoValor = "soporte@empresa.com"
  const chat = await obtenerDatosChat(chatId);
  
  // Generar correo automático
  const emailData = {
    to: destinoValor,
    subject: `Nuevo chat: ${chat.asunto}`,
    body: `
      <h2>Nuevo mensaje de chat</h2>
      <p><strong>De:</strong> ${chat.nombreTrabajador}</p>
      <p><strong>Asunto:</strong> ${chat.asunto}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${chat.mensajeInicial}</p>
      <p><a href="${process.env.APP_URL}/chats/${chatId}">Ver chat</a></p>
    `
  };
  
  await enviarEmail(emailData);
  
  // Registrar envío
  await db.query(`
    INSERT INTO chat_envios_email (chat_id, email_destino, enviado_en)
    VALUES (?, ?, NOW())
  `, [chatId, destinoValor]);
}
```

#### WHATSAPP

```javascript
async function enrutarAChatWhatsApp(chatId, destinoValor) {
  // destinoValor = "+34612345678"
  const chat = await obtenerDatosChat(chatId);
  
  // Preparar mensaje WhatsApp
  const mensaje = `
    📩 *Nuevo chat*
    
    *Asunto:* ${chat.asunto}
    *De:* ${chat.nombreTrabajador}
    *Mensaje:* ${chat.mensajeInicial}
    
    Ver más: ${process.env.APP_URL}/chats/${chatId}
  `;
  
  // Enviar vía API de WhatsApp Business (ej: Twilio, WhatsApp Cloud API)
  await enviarWhatsApp({
    to: destinoValor,
    message: mensaje
  });
  
  // Registrar envío
  await db.query(`
    INSERT INTO chat_envios_whatsapp (chat_id, telefono_destino, enviado_en)
    VALUES (?, ?, NOW())
  `, [chatId, destinoValor]);
}
```

---

## 8. ENDPOINTS API

### GET /api/chat-acciones

Obtiene todas las categorías de chat de una empresa.

**Request:**
```http
GET /api/chat-acciones?empresa_id=EMP-HOSTELERIA
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "accionId": "AVERIA-001",
      "empresaId": "EMP-HOSTELERIA",
      "nombre": "Avería maquinaria",
      "icono": "Wrench",
      "destinoTipo": "EQUIPO",
      "destinoValor": "GERENTE-001",
      "activo": true,
      "permiteAdjuntos": true,
      "orden": 1,
      "esProtegida": true
    },
    {
      "accionId": "CUSTOM-001",
      "empresaId": "EMP-HOSTELERIA",
      "nombre": "Consulta informática",
      "icono": "Settings",
      "destinoTipo": "EMAIL",
      "destinoValor": "soporte@empresa.com",
      "activo": true,
      "permiteAdjuntos": true,
      "orden": 7,
      "esProtegida": false
    }
  ]
}
```

---

### POST /api/chat-acciones

Crea una nueva categoría de chat.

**Request:**
```json
{
  "empresaId": "EMP-HOSTELERIA",
  "nombre": "Consulta informática",
  "icono": "Settings",
  "destinoTipo": "EMAIL",
  "destinoValor": "soporte@empresa.com",
  "activo": true,
  "permiteAdjuntos": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categoría creada correctamente",
  "data": {
    "accionId": "CUSTOM-003",
    "orden": 8
  }
}
```

---

### PUT /api/chat-acciones/{accionId}

Actualiza una categoría existente.

**Request:**
```json
{
  "nombre": "Avería maquinaria URGENTE",
  "destinoValor": "GERENTE-001,GERENTE-002",
  "permiteAdjuntos": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Categoría actualizada correctamente"
}
```

---

### DELETE /api/chat-acciones/{accionId}

Elimina una categoría personalizada (no protegida).

**Request:**
```http
DELETE /api/chat-acciones/CUSTOM-001
```

**Response:**
```json
{
  "success": true,
  "message": "Categoría eliminada correctamente"
}
```

**Error (categoría protegida):**
```json
{
  "success": false,
  "error": "No se puede eliminar una categoría protegida del sistema"
}
```

---

### PATCH /api/chat-acciones/{accionId}/toggle

Activa/desactiva una categoría.

**Request:**
```http
PATCH /api/chat-acciones/CUSTOM-001/toggle
```

**Response:**
```json
{
  "success": true,
  "message": "Estado actualizado",
  "data": {
    "activo": false
  }
}
```

---

### GET /api/equipo

Obtiene miembros del equipo para el selector EQUIPO.

**Request:**
```http
GET /api/equipo?empresa_id=EMP-HOSTELERIA
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "GERENTE-001",
      "nombre": "Jorge Martín",
      "rol": "Gerente General"
    },
    {
      "id": "TRAB-101",
      "nombre": "Juan Pérez",
      "rol": "Trabajador"
    }
  ]
}
```

---

### GET /api/puntos-venta

Obtiene tiendas para el selector OTRA_TIENDA.

**Request:**
```http
GET /api/puntos-venta?empresa_id=EMP-HOSTELERIA
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PV-TIA",
      "nombre": "Can Farines - Tiana"
    },
    {
      "id": "PV-BDN",
      "nombre": "Can Farines - Badalona"
    }
  ]
}
```

---

## 9. CASOS DE USO

### Caso 1: Crear nueva categoría EMAIL

**Escenario:**  
El gerente quiere crear una categoría "Consulta informática" que envíe emails automáticos.

**Pasos:**

1. Navegar a: Configuración → Chats
2. Click en "➕ Añadir nueva categoría"
3. Rellenar:
   - Nombre: "Consulta informática"
   - Icono: ⚙️ Settings
   - Destino: EMAIL
   - Email: soporte@empresa.com
   - Activo: ON
   - Adjuntos: ON
4. Click "Crear categoría"

**Resultado:**
- ✅ Nueva categoría creada con ID `CUSTOM-003`
- ✅ Aparece en la tabla
- ✅ Toast: "Nueva categoría creada correctamente"
- ✅ Trabajadores ya pueden usarla en el chat

---

### Caso 2: Editar destino de "Avería maquinaria"

**Escenario:**  
El gerente quiere que las averías lleguen a 2 personas: Gerente y Responsable de mantenimiento.

**Pasos:**

1. Localizar "Avería maquinaria" en la tabla
2. Click en "Editar"
3. En el modal:
   - Destino: EQUIPO
   - Seleccionar:
     - ☑ Jorge Martín - Gerente General
     - ☑ Carlos Ruiz - Responsable Almacén
4. Click "Guardar cambios"

**Resultado:**
- ✅ `destinoValor = "GERENTE-001,GERENTE-003"`
- ✅ Próximos chats de averías llegarán a ambos
- ✅ Toast: "Categoría actualizada correctamente"

---

### Caso 3: Desactivar categoría temporalmente

**Escenario:**  
El gerente quiere desactivar temporalmente "Urgencias WhatsApp" porque están de vacaciones.

**Pasos:**

1. Localizar "Urgencias WhatsApp" en la tabla
2. Click en el badge "Activo" (toggle)

**Resultado:**
- ✅ Badge cambia a "Inactivo" (gris)
- ✅ La categoría desaparece del selector de chat para trabajadores
- ✅ Toast: "Estado actualizado"
- ✅ Se puede reactivar en cualquier momento

---

### Caso 4: Eliminar categoría personalizada

**Escenario:**  
El gerente creó una categoría de prueba y quiere eliminarla.

**Pasos:**

1. Localizar categoría personalizada (sin badge "Protegida")
2. Click en botón "🗑️ Eliminar"
3. Confirmar eliminación

**Resultado:**
- ✅ Categoría eliminada de la BBDD
- ✅ Desaparece de la tabla
- ✅ Toast: "Categoría eliminada correctamente"
- ✅ Chats anteriores creados con esa categoría se mantienen (solo se marca como "categoría eliminada")

---

## 10. IMPLEMENTACIÓN FRONTEND

### Archivos Creados

```
/components/gerente/
  ├── ConfiguracionChats.tsx           ✅ 450 líneas
  └── ModalConfigCategoriaChat.tsx      ✅ 600 líneas

/components/gerente/ConfiguracionGerente.tsx  (actualizado)
  └── Añadido botón "Chats" y sección
```

### Componentes

#### 1. ConfiguracionChats.tsx

**Estado:**

```typescript
const [busqueda, setBusqueda] = useState('');
const [modalOpen, setModalOpen] = useState(false);
const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaChat | null>(null);
const [categorias, setCategorias] = useState<CategoriaChat[]>([...]);
```

**Funciones principales:**

```typescript
handleNuevaCategoria()          // Abre modal en modo crear
handleEditarCategoria(cat)      // Abre modal en modo editar
handleEliminarCategoria(id)     // Elimina categoría (solo no protegidas)
handleToggleActivo(id)          // Activa/desactiva
handleGuardarCategoria(cat)     // Guarda (crear o editar)
```

---

#### 2. ModalConfigCategoriaChat.tsx

**Props:**

```typescript
interface ModalConfigCategoriaChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: CategoriaChat | null;
  onGuardar: (categoria: CategoriaChat) => void;
}
```

**Estado:**

```typescript
const [nombre, setNombre] = useState('');
const [icono, setIcono] = useState('FileText');
const [destinoTipo, setDestinoTipo] = useState<'EQUIPO' | 'OTRA_TIENDA' | 'EMAIL' | 'WHATSAPP'>('EQUIPO');
const [destinoValor, setDestinoValor] = useState('');
const [activo, setActivo] = useState(true);
const [permiteAdjuntos, setPermiteAdjuntos] = useState(true);
const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([]);
const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState<string[]>([]);
```

**Validaciones:**

```typescript
// Email
if (destinoTipo === 'EMAIL' && !isValidEmail(destinoValor)) {
  toast.error('El correo electrónico no es válido');
  return;
}

// WhatsApp
if (destinoTipo === 'WHATSAPP' && !isValidPhone(destinoValor)) {
  toast.error('El número de teléfono no es válido');
  return;
}

// Equipo
if (destinoTipo === 'EQUIPO' && miembrosSeleccionados.length === 0) {
  toast.error('Selecciona al menos un miembro del equipo');
  return;
}
```

---

### Console Logs para Debugging

```javascript
// Crear categoría
console.log('➕ CREAR CATEGORÍA:', {
  empresaId: 'EMP-HOSTELERIA',
  nombre: 'Consulta informática',
  destinoTipo: 'EMAIL',
  destinoValor: 'soporte@empresa.com'
});

// Editar categoría
console.log('✏️ EDITAR CATEGORÍA:', {
  accionId: 'AVERIA-001',
  nuevoDestinoValor: 'GERENTE-001,GERENTE-003'
});

// Eliminar categoría
console.log('🗑️ ELIMINAR CATEGORÍA:', {
  accionId: 'CUSTOM-001',
  empresaId: 'EMP-HOSTELERIA'
});

// Toggle activo
console.log('🔄 TOGGLE ACTIVO:', {
  accionId: 'CUSTOM-002',
  nuevoEstado: false
});
```

---

## CHECKLIST PROGRAMADOR

### Backend
- [ ] Crear tabla `chat_accion`
- [ ] Endpoint GET /api/chat-acciones
- [ ] Endpoint POST /api/chat-acciones
- [ ] Endpoint PUT /api/chat-acciones/{id}
- [ ] Endpoint DELETE /api/chat-acciones/{id}
- [ ] Endpoint PATCH /api/chat-acciones/{id}/toggle
- [ ] Endpoint GET /api/equipo
- [ ] Endpoint GET /api/puntos-venta
- [ ] Lógica enrutamiento EQUIPO
- [ ] Lógica enrutamiento OTRA_TIENDA
- [ ] Lógica enrutamiento EMAIL (integración email)
- [ ] Lógica enrutamiento WHATSAPP (integración API)
- [ ] Validaciones de negocio
- [ ] Testing unitario

### Frontend
- [ ] Cargar categorías desde API
- [ ] Conectar POST (crear)
- [ ] Conectar PUT (editar)
- [ ] Conectar DELETE (eliminar)
- [ ] Conectar PATCH (toggle)
- [ ] Cargar miembros equipo desde API
- [ ] Cargar tiendas desde API
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Testing E2E

---

## CONCLUSIÓN

**Estado actual:**  
✅ Frontend 100% completado  
✅ Interfaces TypeScript definidas  
✅ Console.log para debugging  
❌ Backend pendiente (8 endpoints)  
❌ Integraciones email/WhatsApp pendientes

**Tiempo estimado backend:** 5-7 días  
**Complejidad:** Media-Alta  
**Prioridad:** Alta

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Documentación completa
