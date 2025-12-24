# 🤖 TPV 360 - Automatización "Datos del Cliente" con Make.com

## 📋 Índice
1. [Estructura de Datos](#estructura-de-datos)
2. [Escenario 1: Buscar Cliente](#escenario-1-buscar-cliente)
3. [Escenario 2: Crear Cliente](#escenario-2-crear-cliente)
4. [Escenario 3: Mostrar Turnos](#escenario-3-mostrar-turnos)
5. [Escenario 4: Llamar Turno](#escenario-4-llamar-turno)
6. [Escenario 5: Atender sin Datos](#escenario-5-atender-sin-datos)
7. [Escenario 6: Enlazar Cliente con Pedido](#escenario-6-enlazar-cliente-con-pedido)
8. [Escenario 7: Cierre de Atención](#escenario-7-cierre-de-atención)
9. [Escenario 8: Turnos Caducados](#escenario-8-turnos-caducados)
10. [Webhooks y Endpoints](#webhooks-y-endpoints)

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `cliente` (Extendida)
```json
{
  "id": "CLI-20241125-001",
  "nombre": "María García López",
  "telefono": "678123456",
  "email": "maria@email.com",
  "direccion": "Calle Mayor 45, Madrid",
  "punto_venta_id": "PDV-001",
  "fecha_creacion": "2024-11-25T10:30:00Z",
  "fecha_ultima_visita": "2024-11-25T10:30:00Z",
  "total_pedidos": 15,
  "total_gastado": 450.00,
  "notas": "Cliente VIP - Sin cebolla",
  "activo": true,
  "es_generico": false
}
```

### Tabla: `turno_atencion` (Nueva - Específica para Atención)
```json
{
  "id": "TURNO-ATN-001",
  "numero_visible": "A22",
  "punto_venta_id": "PDV-001",
  "cliente_id": "CLI-20241125-001",
  "pedido_id": null,
  "estado": "pendiente | atendiendo | atendido | cancelado",
  "posicion_cola": 1,
  "fecha_creacion": "2024-11-25T10:25:00Z",
  "fecha_llamada": null,
  "fecha_atencion": null,
  "fecha_finalizacion": null,
  "usuario_llamada_id": null,
  "usuario_atencion_id": null,
  "reset_diario": "2024-11-25",
  "caducado": false,
  "origen": "presencial | app",
  "tiempo_espera_minutos": 5
}
```

### Tabla: `cliente_pdv_relacion` (Muchos a Muchos)
```json
{
  "id": "REL-001",
  "cliente_id": "CLI-20241125-001",
  "punto_venta_id": "PDV-001",
  "primera_visita": "2024-01-15T12:00:00Z",
  "ultima_visita": "2024-11-25T10:30:00Z",
  "total_visitas": 15,
  "total_gastado": 450.00,
  "es_vip": true,
  "notas_pdv": "Preferencia por pizzas sin cebolla"
}
```

### Tabla: `auditoria_turnos`
```json
{
  "id": "AUD-001",
  "turno_id": "TURNO-ATN-001",
  "accion": "creado | llamado | atendiendo | atendido | cancelado",
  "usuario_id": "USR-123",
  "fecha_accion": "2024-11-25T10:30:00Z",
  "detalles": "Turno llamado desde TPV principal"
}
```

---

## 🟨 ESCENARIO 1: BUSCAR CLIENTE

### **Trigger**
- HTTP GET: `/api/clientes/buscar?q={texto}&pdv_id={punto_venta_id}`
- Llamado desde el frontend cada vez que el usuario escribe (debounce 300ms)

### **Inputs**
```json
{
  "texto_busqueda": "maria",
  "punto_venta_id": "PDV-001"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Búsqueda Cliente       │
│  Input: texto_busqueda, pdv_id      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VALIDAR INPUT                   │
│  - Mínimo 2 caracteres              │
│  - Sanitizar texto                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. BÚSQUEDA MULTICRITERIO          │
│  - Query SQL con LIKE/ILIKE         │
│  - Búsqueda en:                     │
│    * cliente.nombre                 │
│    * cliente.telefono               │
│    * cliente.email                  │
│    * turno_atencion.numero_visible  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. JOIN CON TURNOS DEL DÍA         │
│  - LEFT JOIN turno_atencion         │
│  - WHERE reset_diario = hoy         │
│  - WHERE punto_venta_id = input     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. JOIN CON RELACIÓN PDV           │
│  - Obtener stats del cliente        │
│  - Total visitas, gasto, VIP        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. ORDENAR RESULTADOS              │
│  - 1º: Coincidencia exacta          │
│  - 2º: Clientes VIP                 │
│  - 3º: Con turno activo hoy         │
│  - 4º: Última visita reciente       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. FORMATEAR RESPUESTA             │
│  - Máximo 10 resultados             │
│  - Incluir info completa            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. RESPONSE JSON                   │
│  - Lista de clientes                │
│  - Metadata (total, tiempo)         │
└─────────────────────────────────────┘
```

### **SQL Query: Búsqueda Multicriterio**
```sql
WITH busqueda_clientes AS (
  SELECT 
    c.id as cliente_id,
    c.nombre,
    c.telefono,
    c.email,
    c.total_pedidos,
    c.activo,
    cpr.es_vip,
    cpr.total_visitas,
    cpr.total_gastado,
    cpr.ultima_visita,
    ta.id as turno_id,
    ta.numero_visible as turno_numero,
    ta.estado as turno_estado,
    ta.posicion_cola,
    CASE 
      WHEN c.nombre ILIKE {{texto_exact}} THEN 1
      WHEN c.telefono = {{telefono_exact}} THEN 1
      WHEN cpr.es_vip = true THEN 2
      WHEN ta.id IS NOT NULL THEN 3
      ELSE 4
    END as prioridad
  FROM cliente c
  LEFT JOIN cliente_pdv_relacion cpr 
    ON c.id = cpr.cliente_id 
    AND cpr.punto_venta_id = {{punto_venta_id}}
  LEFT JOIN turno_atencion ta 
    ON c.id = ta.cliente_id 
    AND ta.punto_venta_id = {{punto_venta_id}}
    AND ta.reset_diario = CURRENT_DATE
    AND ta.estado IN ('pendiente', 'atendiendo')
  WHERE c.activo = true
    AND (
      c.nombre ILIKE {{texto_busqueda}}
      OR c.telefono LIKE {{texto_busqueda}}
      OR c.email ILIKE {{texto_busqueda}}
      OR ta.numero_visible ILIKE {{texto_busqueda}}
    )
)
SELECT * FROM busqueda_clientes
ORDER BY prioridad ASC, nombre ASC
LIMIT 10;
```

### **Módulos Make**
1. **Webhook** - Recibir búsqueda
2. **Text Parser** - Sanitizar texto
3. **Router** - Validar longitud mínima
4. **Supabase: Run SQL Query** - Búsqueda multicriterio
5. **Array Aggregator** - Agrupar resultados
6. **JSON** - Formatear respuesta
7. **WebHook Response** - Devolver resultados

### **Response Format**
```json
{
  "success": true,
  "resultados": [
    {
      "cliente_id": "CLI-001",
      "nombre": "María García López",
      "telefono": "678123456",
      "email": "maria@email.com",
      "total_pedidos": 15,
      "es_vip": true,
      "total_gastado": 450.00,
      "ultima_visita": "2024-11-24T15:30:00Z",
      "turno_activo": {
        "turno_id": "TURNO-ATN-001",
        "numero_visible": "A22",
        "estado": "pendiente",
        "posicion": 1
      }
    }
  ],
  "total": 1,
  "tiempo_ms": 45
}
```

---

## 🟨 ESCENARIO 2: CREAR CLIENTE (Alta Rápida)

### **Trigger**
- HTTP POST: `/api/clientes/crear`
- Webhook desde TPV cuando se pulsa "Guardar Cliente"

### **Inputs**
```json
{
  "nombre": "María García López",
  "telefono": "678123456",
  "email": "maria@email.com",
  "punto_venta_id": "PDV-001",
  "usuario_id": "USR-123"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Crear Cliente          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VALIDAR DATOS OBLIGATORIOS      │
│  - nombre: requerido                │
│  - telefono: requerido              │
│  - email: opcional                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. NORMALIZAR TELÉFONO             │
│  - Quitar espacios                  │
│  - Quitar caracteres especiales     │
│  - Formato: 678123456               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. VALIDAR EMAIL (si existe)       │
│  - Regex formato válido             │
│  - Si inválido → error              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. VERIFICAR DUPLICADOS            │
│  - Query: buscar por teléfono       │
│  - En el mismo PDV                  │
└──────────────┬──────────────────────┘
         SI    │    NO
               ▼
┌─────────────────────────────────────┐
│  6a. CLIENTE YA EXISTE              │
│  - Devolver info del existente      │
│  - Mensaje: "Ya registrado"         │
│  - Sugerir actualización            │
└─────────────────────────────────────┘

          (NO EXISTE)
               │
               ▼
┌─────────────────────────────────────┐
│  6b. GENERAR ID ÚNICO               │
│  - Formato: CLI-YYYYMMDD-NNN        │
│  - Timestamp único                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. INSERTAR EN TABLA cliente       │
│  - Todos los campos                 │
│  - fecha_creacion = NOW()           │
│  - total_pedidos = 0                │
│  - activo = true                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. CREAR RELACIÓN CON PDV          │
│  - Insertar cliente_pdv_relacion    │
│  - primera_visita = NOW()           │
│  - total_visitas = 0                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  9. REGISTRAR AUDITORÍA             │
│  - Tabla: auditoria_clientes        │
│  - Acción: "cliente_creado"         │
│  - usuario_id                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  10. RESPONSE EXITOSO               │
│  - Devolver cliente completo        │
│  - Mensaje de éxito                 │
└─────────────────────────────────────┘
```

### **SQL Query: Verificar Duplicados**
```sql
-- Buscar cliente duplicado por teléfono en el PDV
SELECT c.*, cpr.punto_venta_id
FROM cliente c
JOIN cliente_pdv_relacion cpr ON c.id = cpr.cliente_id
WHERE c.telefono = {{telefono_normalizado}}
  AND cpr.punto_venta_id = {{punto_venta_id}}
  AND c.activo = true
LIMIT 1;
```

### **SQL Query: Crear Cliente**
```sql
-- Insertar nuevo cliente
INSERT INTO cliente (
  id,
  nombre,
  telefono,
  email,
  punto_venta_id,
  fecha_creacion,
  fecha_ultima_visita,
  total_pedidos,
  total_gastado,
  activo,
  es_generico
) VALUES (
  {{cliente_id}},
  {{nombre}},
  {{telefono_normalizado}},
  {{email}},
  {{punto_venta_id}},
  NOW(),
  NOW(),
  0,
  0.00,
  true,
  false
) RETURNING *;

-- Crear relación con PDV
INSERT INTO cliente_pdv_relacion (
  cliente_id,
  punto_venta_id,
  primera_visita,
  ultima_visita,
  total_visitas,
  total_gastado,
  es_vip
) VALUES (
  {{cliente_id}},
  {{punto_venta_id}},
  NOW(),
  NOW(),
  0,
  0.00,
  false
) RETURNING *;
```

### **Response Format**

**Éxito:**
```json
{
  "success": true,
  "data": {
    "cliente_id": "CLI-20241125-001",
    "nombre": "María García López",
    "telefono": "678123456",
    "email": "maria@email.com",
    "total_pedidos": 0,
    "es_vip": false
  },
  "message": "Cliente creado correctamente"
}
```

**Cliente ya existe:**
```json
{
  "success": false,
  "error": {
    "code": "CLIENTE_DUPLICADO",
    "message": "Este cliente ya existe",
    "cliente_existente": {
      "cliente_id": "CLI-001",
      "nombre": "María García López",
      "telefono": "678123456",
      "total_pedidos": 15
    }
  },
  "sugerencia": "¿Deseas usar el cliente existente?"
}
```

---

## 🟨 ESCENARIO 3: MOSTRAR TURNOS EN ESPERA

### **Trigger**
- HTTP GET: `/api/turnos/espera?pdv_id={punto_venta_id}`
- Polling cada 5 segundos desde el frontend
- O WebSocket para tiempo real

### **Inputs**
```json
{
  "punto_venta_id": "PDV-001"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Obtener Turnos         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. QUERY: Turnos del Día           │
│  - WHERE reset_diario = hoy         │
│  - WHERE punto_venta_id = input     │
│  - WHERE estado != 'atendido'       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. JOIN CON CLIENTES               │
│  - Obtener datos completos          │
│  - nombre, teléfono, email          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. CALCULAR POSICIÓN EN COLA       │
│  - Ordenar por numero_visible       │
│  - Asignar posición 1, 2, 3...      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. CALCULAR TIEMPO ESPERA          │
│  - NOW() - fecha_creacion           │
│  - Formato: minutos                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. MARCAR SIGUIENTE                │
│  - Primer turno = "siguiente"       │
│  - Resto = "posición X"             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. VERIFICAR CADUCADOS             │
│  - Si tiempo_espera > 10 min        │
│  - Marcar como caducado             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. RESPONSE JSON                   │
│  - Lista ordenada de turnos         │
│  - Metadata                         │
└─────────────────────────────────────┘
```

### **SQL Query: Turnos en Espera**
```sql
WITH turnos_ordenados AS (
  SELECT 
    ta.id as turno_id,
    ta.numero_visible,
    ta.estado,
    ta.fecha_creacion,
    ta.fecha_llamada,
    ta.caducado,
    ta.origen,
    c.id as cliente_id,
    c.nombre as cliente_nombre,
    c.telefono as cliente_telefono,
    c.email as cliente_email,
    cpr.es_vip,
    cpr.total_pedidos,
    EXTRACT(EPOCH FROM (NOW() - ta.fecha_creacion)) / 60 as tiempo_espera_minutos,
    ROW_NUMBER() OVER (
      ORDER BY 
        CASE WHEN ta.estado = 'atendiendo' THEN 0 ELSE 1 END,
        ta.numero_visible ASC
    ) as posicion_cola
  FROM turno_atencion ta
  JOIN cliente c ON ta.cliente_id = c.id
  LEFT JOIN cliente_pdv_relacion cpr 
    ON c.id = cpr.cliente_id 
    AND cpr.punto_venta_id = ta.punto_venta_id
  WHERE ta.punto_venta_id = {{punto_venta_id}}
    AND ta.reset_diario = CURRENT_DATE
    AND ta.estado IN ('pendiente', 'atendiendo')
  ORDER BY posicion_cola
)
SELECT 
  *,
  CASE 
    WHEN posicion_cola = 1 AND estado = 'pendiente' THEN 'siguiente'
    WHEN estado = 'atendiendo' THEN 'atendiendo'
    ELSE CONCAT('posicion_', posicion_cola)
  END as etiqueta,
  CASE 
    WHEN tiempo_espera_minutos > 10 AND origen = 'app' THEN true
    ELSE false
  END as debe_caducar
FROM turnos_ordenados;
```

### **Response Format**
```json
{
  "success": true,
  "turnos": [
    {
      "turno_id": "TURNO-ATN-001",
      "numero_visible": "A22",
      "estado": "pendiente",
      "etiqueta": "siguiente",
      "posicion_cola": 1,
      "cliente": {
        "cliente_id": "CLI-001",
        "nombre": "María García López",
        "telefono": "678123456",
        "email": "maria@email.com",
        "es_vip": true,
        "total_pedidos": 15
      },
      "tiempo_espera_minutos": 5,
      "caducado": false,
      "origen": "presencial"
    },
    {
      "turno_id": "TURNO-ATN-002",
      "numero_visible": "A23",
      "estado": "pendiente",
      "etiqueta": "posicion_2",
      "posicion_cola": 2,
      "cliente": {
        "cliente_id": "CLI-002",
        "nombre": "Carlos Martínez",
        "telefono": "645987321",
        "email": null,
        "es_vip": false,
        "total_pedidos": 3
      },
      "tiempo_espera_minutos": 3,
      "caducado": false,
      "origen": "app"
    }
  ],
  "total_en_espera": 2,
  "timestamp": "2024-11-25T10:30:00Z"
}
```

---

## 🟨 ESCENARIO 4: LLAMAR TURNO

### **Trigger**
- HTTP POST: `/api/turnos/llamar`
- Webhook desde TPV cuando se pulsa "Llamar"

### **Inputs**
```json
{
  "turno_id": "TURNO-ATN-001",
  "punto_venta_id": "PDV-001",
  "usuario_id": "USR-123"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Llamar Turno           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VALIDAR TURNO EXISTE            │
│  - Query por turno_id               │
│  - Verificar estado != atendido     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. ACTUALIZAR ESTADO TURNO         │
│  - estado = 'atendiendo'            │
│  - fecha_llamada = NOW()            │
│  - usuario_llamada_id               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. REGISTRAR AUDITORÍA             │
│  - Tabla: auditoria_turnos          │
│  - Acción: "llamado"                │
│  - usuario_id, timestamp            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. NOTIFICAR TPV PRINCIPAL         │
│  - WebSocket broadcast              │
│  - Actualizar pantalla              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. NOTIFICAR APP CLIENTE (si app)  │
│  - Push notification                │
│  - "Tu turno A22 ha sido llamado"   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. RECALCULAR COLA                 │
│  - Actualizar posiciones            │
│  - Nuevo "siguiente"                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. RESPONSE EXITOSO                │
│  - Datos del turno actualizado      │
│  - Cliente asociado                 │
└─────────────────────────────────────┘
```

### **SQL Query: Actualizar Turno**
```sql
-- Actualizar estado del turno
UPDATE turno_atencion
SET 
  estado = 'atendiendo',
  fecha_llamada = NOW(),
  usuario_llamada_id = {{usuario_id}}
WHERE id = {{turno_id}}
  AND punto_venta_id = {{punto_venta_id}}
  AND estado = 'pendiente'
RETURNING *;

-- Registrar auditoría
INSERT INTO auditoria_turnos (
  turno_id,
  accion,
  usuario_id,
  fecha_accion,
  detalles
) VALUES (
  {{turno_id}},
  'llamado',
  {{usuario_id}},
  NOW(),
  'Turno llamado desde TPV principal'
);
```

### **Response Format**
```json
{
  "success": true,
  "turno": {
    "turno_id": "TURNO-ATN-001",
    "numero_visible": "A22",
    "estado": "atendiendo",
    "fecha_llamada": "2024-11-25T10:30:00Z",
    "cliente": {
      "cliente_id": "CLI-001",
      "nombre": "María García López",
      "telefono": "678123456",
      "email": "maria@email.com"
    }
  },
  "message": "Turno A22 llamado correctamente",
  "cola_actualizada": {
    "siguiente_turno": "A23",
    "total_en_espera": 3
  }
}
```

---

## 🟨 ESCENARIO 5: ATENDER SIN DATOS

### **Trigger**
- HTTP POST: `/api/clientes/atender-sin-datos`
- Webhook desde TPV cuando se pulsa "Atender sin Datos"

### **Inputs**
```json
{
  "punto_venta_id": "PDV-001",
  "usuario_id": "USR-123"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Atender sin Datos      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. BUSCAR/CREAR CLIENTE GENÉRICO   │
│  - nombre: "Cliente sin datos"      │
│  - telefono: "N/A"                  │
│  - es_generico: true                │
└──────────────┬──────────────────────┘
         ¿Existe? │ No
               ▼
┌─────────────────────────────────────┐
│  3. CREAR CLIENTE GENÉRICO          │
│  - id: CLI-GENERIC-{timestamp}      │
│  - Solo para este PDV               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. REGISTRAR ATENCIÓN              │
│  - Tabla: atencion_sin_datos        │
│  - usuario_id, timestamp            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. INCREMENTAR CONTADOR PDV        │
│  - Total atenciones sin datos hoy   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. RESPONSE CON CLIENTE NULL       │
│  - Continuar directo al pedido      │
│  - Sin crear turno                  │
└─────────────────────────────────────┘
```

### **SQL Query: Cliente Genérico**
```sql
-- Buscar cliente genérico del PDV
SELECT id, nombre, telefono
FROM cliente
WHERE punto_venta_id = {{punto_venta_id}}
  AND es_generico = true
  AND activo = true
LIMIT 1;

-- Si no existe, crear uno
INSERT INTO cliente (
  id,
  nombre,
  telefono,
  email,
  punto_venta_id,
  es_generico,
  activo,
  fecha_creacion
) VALUES (
  CONCAT('CLI-GENERIC-', {{punto_venta_id}}),
  'Cliente sin datos',
  'N/A',
  null,
  {{punto_venta_id}},
  true,
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING
RETURNING *;

-- Registrar atención
INSERT INTO atencion_sin_datos (
  punto_venta_id,
  usuario_id,
  fecha_atencion
) VALUES (
  {{punto_venta_id}},
  {{usuario_id}},
  NOW()
);
```

### **Response Format**
```json
{
  "success": true,
  "modo": "sin_datos",
  "cliente_id": null,
  "turno_id": null,
  "message": "Continuar atención sin datos del cliente",
  "redirect_to": "tpv_pedido"
}
```

---

## 🟨 ESCENARIO 6: ENLAZAR CLIENTE CON PEDIDO

### **Trigger**
- Automático cuando se selecciona cliente o se llama turno
- HTTP POST: `/api/pedidos/enlazar-cliente`

### **Inputs**
```json
{
  "pedido_id": "PED-20241125-001",
  "cliente_id": "CLI-001",
  "turno_id": "TURNO-ATN-001",
  "punto_venta_id": "PDV-001"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Enlazar Cliente        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VALIDAR PEDIDO EXISTE           │
│  - Query pedido por ID              │
│  - Verificar estado inicial         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. ACTUALIZAR PEDIDO               │
│  - cliente_id = input               │
│  - turno_id = input (si existe)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. ¿TIENE TURNO?                   │
└──────────────┬──────────────────────┘
         SI    │    NO
               ▼
┌─────────────────────────────────────┐
│  5a. ACTUALIZAR TURNO               │
│  - pedido_id = input                │
│  - estado = 'en_atencion'           │
│  - fecha_atencion = NOW()           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. ACTUALIZAR CLIENTE_PDV_RELACION │
│  - Incrementar total_visitas        │
│  - Actualizar ultima_visita         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. REGISTRAR AUDITORÍA             │
│  - Enlace cliente-pedido            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. RESPONSE EXITOSO                │
│  - Pedido con cliente enlazado      │
└─────────────────────────────────────┘
```

### **SQL Query: Enlazar**
```sql
-- Actualizar pedido
UPDATE pedido
SET 
  cliente_id = {{cliente_id}},
  turno_id = {{turno_id}},
  fecha_actualizacion = NOW()
WHERE id = {{pedido_id}}
  AND punto_venta_id = {{punto_venta_id}}
RETURNING *;

-- Si hay turno, actualizarlo
UPDATE turno_atencion
SET 
  pedido_id = {{pedido_id}},
  estado = 'en_atencion',
  fecha_atencion = NOW(),
  usuario_atencion_id = {{usuario_id}}
WHERE id = {{turno_id}}
  AND cliente_id = {{cliente_id}};

-- Actualizar relación cliente-PDV
UPDATE cliente_pdv_relacion
SET 
  ultima_visita = NOW(),
  total_visitas = total_visitas + 1
WHERE cliente_id = {{cliente_id}}
  AND punto_venta_id = {{punto_venta_id}};
```

---

## 🟨 ESCENARIO 7: CIERRE DE ATENCIÓN EN TURNOS

### **Trigger**
- Watch Records: Tabla `pedido` → Field Updated (`estado`)
- Cuando `estado` cambia a `en_preparacion`

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. TRIGGER: Estado = en_preparacion│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. ¿PEDIDO TIENE TURNO?            │
│  - Verificar turno_id != null       │
└──────────────┬──────────────────────┘
         SI    │    NO → FIN
               ▼
┌─────────────────────────────────────┐
│  3. ACTUALIZAR TURNO                │
│  - estado = 'atendido'              │
│  - fecha_finalizacion = NOW()       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. SACAR DE COLA                   │
│  - Ya no aparece en turnos espera   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. CALCULAR TIEMPO TOTAL           │
│  - finalizacion - creacion          │
│  - Guardar en estadísticas          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. REGISTRAR AUDITORÍA             │
│  - Acción: "atendido"               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. RECALCULAR COLA                 │
│  - Actualizar posiciones            │
│  - Notificar cambios                │
└─────────────────────────────────────┘
```

### **SQL Query: Cerrar Turno**
```sql
-- Actualizar turno cuando pedido pasa a preparación
UPDATE turno_atencion
SET 
  estado = 'atendido',
  fecha_finalizacion = NOW()
WHERE pedido_id = {{pedido_id}}
  AND estado = 'en_atencion'
RETURNING 
  id,
  numero_visible,
  EXTRACT(EPOCH FROM (NOW() - fecha_creacion)) / 60 as tiempo_total_minutos;

-- Registrar auditoría
INSERT INTO auditoria_turnos (
  turno_id,
  accion,
  fecha_accion,
  detalles
) VALUES (
  {{turno_id}},
  'atendido',
  NOW(),
  CONCAT('Pedido ', {{pedido_id}}, ' pasó a preparación')
);
```

---

## 🟨 ESCENARIO 8: TURNOS CADUCADOS (Caja Rápida / App)

### **Trigger**
- Scheduled: Cada 1 minuto
- Cron: `*/1 * * * *`

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. SCHEDULED: Cada 1 minuto        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. BUSCAR TURNOS CADUCADOS         │
│  - origen = 'app'                   │
│  - estado = 'pendiente'             │
│  - creado hace > 10 minutos         │
│  - caducado = false                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. ITERATOR: Por cada turno        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. MARCAR COMO CADUCADO            │
│  - caducado = true                  │
│  - fecha_caducidad = NOW()          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. MOVER A COLA AZUL               │
│  - Si tiene pedido asociado         │
│  - Actualizar vista caja rápida     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. NOTIFICAR CLIENTE APP           │
│  - Push notification                │
│  - "Tu turno ha caducado"           │
│  - Opción: Renovar turno            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. REGISTRAR AUDITORÍA             │
│  - Acción: "caducado"               │
│  - Motivo: "10 min sin atender"     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. NOTIFICAR TPV                   │
│  - WebSocket broadcast              │
│  - Actualizar lista de turnos       │
└─────────────────────────────────────┘
```

### **SQL Query: Buscar Turnos Caducados**
```sql
-- Buscar turnos que deben caducar
SELECT 
  ta.id as turno_id,
  ta.numero_visible,
  ta.cliente_id,
  ta.pedido_id,
  c.nombre as cliente_nombre,
  c.telefono as cliente_telefono,
  EXTRACT(EPOCH FROM (NOW() - ta.fecha_creacion)) / 60 as minutos_espera
FROM turno_atencion ta
JOIN cliente c ON ta.cliente_id = c.id
WHERE ta.origen = 'app'
  AND ta.estado = 'pendiente'
  AND ta.caducado = false
  AND ta.fecha_creacion < NOW() - INTERVAL '10 minutes'
  AND ta.reset_diario = CURRENT_DATE;

-- Actualizar turnos caducados
UPDATE turno_atencion
SET 
  caducado = true,
  fecha_caducidad = NOW()
WHERE id = {{turno_id}}
RETURNING *;

-- Si tiene pedido, actualizar para mover a cola azul
UPDATE pedido
SET 
  turno_caducado = true,
  cola_color = 'azul'
WHERE turno_id = {{turno_id}}
  AND estado IN ('en_preparacion', 'listo');
```

---

## 📡 WEBHOOKS Y ENDPOINTS

### **Endpoints Make**

```
1. GET /api/clientes/buscar
   → Escenario 1: Buscar Cliente

2. POST /api/clientes/crear
   → Escenario 2: Crear Cliente

3. GET /api/turnos/espera
   → Escenario 3: Mostrar Turnos

4. POST /api/turnos/llamar
   → Escenario 4: Llamar Turno

5. POST /api/clientes/atender-sin-datos
   → Escenario 5: Atender sin Datos

6. POST /api/pedidos/enlazar-cliente
   → Escenario 6: Enlazar Cliente con Pedido

7. TRIGGER: pedido.estado → en_preparacion
   → Escenario 7: Cierre de Atención

8. SCHEDULED: */1 * * * *
   → Escenario 8: Turnos Caducados
```

### **WebSocket Events**

```javascript
// Evento: Nueva búsqueda
ws.emit('cliente:busqueda', {
  resultados: [...],
  total: 5
});

// Evento: Cliente creado
ws.emit('cliente:creado', {
  cliente_id: 'CLI-001',
  nombre: 'María García'
});

// Evento: Turno llamado
ws.emit('turno:llamado', {
  turno_id: 'TURNO-ATN-001',
  numero_visible: 'A22'
});

// Evento: Cola actualizada
ws.emit('cola:actualizada', {
  turnos: [...],
  total_en_espera: 3
});

// Evento: Turno caducado
ws.emit('turno:caducado', {
  turno_id: 'TURNO-ATN-001',
  motivo: '10 minutos sin atender'
});
```

---

## 🗄️ TABLAS ADICIONALES NECESARIAS

### **Tabla: `atencion_sin_datos`**
```sql
CREATE TABLE atencion_sin_datos (
  id SERIAL PRIMARY KEY,
  punto_venta_id VARCHAR(50) REFERENCES punto_venta(id) NOT NULL,
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  fecha_atencion TIMESTAMP DEFAULT NOW(),
  pedido_id VARCHAR(50) REFERENCES pedido(id)
);

CREATE INDEX idx_atencion_sin_datos_pdv ON atencion_sin_datos(punto_venta_id);
CREATE INDEX idx_atencion_sin_datos_fecha ON atencion_sin_datos(fecha_atencion);
```

### **Tabla: `auditoria_clientes`**
```sql
CREATE TABLE auditoria_clientes (
  id SERIAL PRIMARY KEY,
  cliente_id VARCHAR(50) REFERENCES cliente(id),
  accion VARCHAR(50) NOT NULL, -- creado, actualizado, eliminado
  usuario_id VARCHAR(50) REFERENCES usuario(id),
  fecha_accion TIMESTAMP DEFAULT NOW(),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT
);

CREATE INDEX idx_auditoria_clientes_cliente ON auditoria_clientes(cliente_id);
CREATE INDEX idx_auditoria_clientes_fecha ON auditoria_clientes(fecha_accion);
```

---

## 📊 VISTAS ÚTILES

### **Vista: Clientes VIP**
```sql
CREATE OR REPLACE VIEW v_clientes_vip AS
SELECT 
  c.*,
  cpr.punto_venta_id,
  cpr.total_visitas,
  cpr.total_gastado,
  cpr.ultima_visita,
  pdv.nombre as nombre_punto_venta
FROM cliente c
JOIN cliente_pdv_relacion cpr ON c.id = cpr.cliente_id
JOIN punto_venta pdv ON cpr.punto_venta_id = pdv.id
WHERE cpr.es_vip = true
  AND c.activo = true
ORDER BY cpr.total_gastado DESC;
```

### **Vista: Estadísticas de Turnos**
```sql
CREATE OR REPLACE VIEW v_estadisticas_turnos AS
SELECT 
  punto_venta_id,
  reset_diario as fecha,
  COUNT(*) as total_turnos,
  COUNT(*) FILTER (WHERE estado = 'atendido') as turnos_atendidos,
  COUNT(*) FILTER (WHERE caducado = true) as turnos_caducados,
  AVG(
    EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60
  ) FILTER (WHERE estado = 'atendido') as tiempo_promedio_minutos,
  MAX(
    EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60
  ) FILTER (WHERE estado = 'atendido') as tiempo_maximo_minutos
FROM turno_atencion
GROUP BY punto_venta_id, reset_diario
ORDER BY reset_diario DESC, punto_venta_id;
```

---

## 🎯 MÉTRICAS Y KPIs

### **Dashboard de Turnos**
```sql
-- KPI: Turnos por día
SELECT 
  reset_diario,
  COUNT(*) as total_turnos,
  COUNT(*) FILTER (WHERE estado = 'atendido') as atendidos,
  COUNT(*) FILTER (WHERE caducado = true) as caducados,
  ROUND(
    COUNT(*) FILTER (WHERE estado = 'atendido')::DECIMAL / COUNT(*) * 100, 
    2
  ) as porcentaje_atencion
FROM turno_atencion
WHERE punto_venta_id = 'PDV-001'
  AND reset_diario >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY reset_diario
ORDER BY reset_diario DESC;

-- KPI: Tiempo promedio de atención
SELECT 
  DATE(fecha_creacion) as fecha,
  AVG(
    EXTRACT(EPOCH FROM (fecha_finalizacion - fecha_creacion)) / 60
  ) as tiempo_promedio_minutos
FROM turno_atencion
WHERE punto_venta_id = 'PDV-001'
  AND estado = 'atendido'
  AND fecha_creacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fecha
ORDER BY fecha DESC;

-- KPI: Clientes nuevos vs recurrentes
SELECT 
  DATE(p.fecha_creacion) as fecha,
  COUNT(*) FILTER (WHERE c.total_pedidos = 1) as clientes_nuevos,
  COUNT(*) FILTER (WHERE c.total_pedidos > 1) as clientes_recurrentes
FROM pedido p
JOIN cliente c ON p.cliente_id = c.id
WHERE p.punto_venta_id = 'PDV-001'
  AND p.fecha_creacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fecha
ORDER BY fecha DESC;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Base de Datos**
- [ ] Crear/Actualizar tabla `cliente`
- [ ] Crear tabla `turno_atencion`
- [ ] Crear tabla `cliente_pdv_relacion`
- [ ] Crear tabla `auditoria_turnos`
- [ ] Crear tabla `auditoria_clientes`
- [ ] Crear tabla `atencion_sin_datos`
- [ ] Crear vistas útiles
- [ ] Crear índices optimizados

### **Fase 2: Escenarios Make**
- [ ] Implementar Escenario 1 (Buscar Cliente)
- [ ] Implementar Escenario 2 (Crear Cliente)
- [ ] Implementar Escenario 3 (Mostrar Turnos)
- [ ] Implementar Escenario 4 (Llamar Turno)
- [ ] Implementar Escenario 5 (Atender sin Datos)
- [ ] Implementar Escenario 6 (Enlazar Cliente con Pedido)
- [ ] Implementar Escenario 7 (Cierre de Atención)
- [ ] Implementar Escenario 8 (Turnos Caducados)

### **Fase 3: Integración Frontend**
- [ ] Conectar buscador con API
- [ ] Implementar polling/WebSocket para turnos
- [ ] Conectar formulario crear cliente
- [ ] Implementar botón "Llamar Turno"
- [ ] Implementar botón "Atender sin Datos"
- [ ] Mostrar notificaciones en tiempo real

### **Fase 4: Testing**
- [ ] Test búsqueda multicriterio
- [ ] Test validación duplicados
- [ ] Test creación de turnos
- [ ] Test caducidad de turnos (10 min)
- [ ] Test auditoría completa
- [ ] Test WebSocket en tiempo real

### **Fase 5: Optimización**
- [ ] Índices de búsqueda
- [ ] Caché de resultados frecuentes
- [ ] Debounce en búsqueda
- [ ] Compresión de respuestas
- [ ] Rate limiting

---

## 🎯 CONCLUSIÓN

Este sistema de automatización permite:

✅ **Búsqueda inteligente** multicriterio (nombre, teléfono, email, turno)  
✅ **Creación rápida** de clientes con validación de duplicados  
✅ **Gestión de turnos** en tiempo real con posiciones dinámicas  
✅ **Auditoría completa** de todas las acciones  
✅ **Caducidad automática** de turnos app (10 minutos)  
✅ **Atención sin datos** para clientes que no quieren registrarse  
✅ **Enlace automático** cliente-pedido-turno  
✅ **Notificaciones en tiempo real** vía WebSocket  
✅ **Métricas y KPIs** para análisis de rendimiento  

**Total de Escenarios Make:** 8  
**Webhooks necesarios:** 6  
**Triggers DB necesarios:** 1  
**Scheduled tasks:** 1  
**Tablas nuevas:** 4  

🟩 **TPV 360 - AUTOMATIZACIÓN "DATOS DEL CLIENTE" COMPLETADA**
