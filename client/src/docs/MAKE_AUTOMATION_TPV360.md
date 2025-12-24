# 🤖 TPV 360 - Automatización con Make.com

## 📋 Índice
1. [Estructura de Datos](#estructura-de-datos)
2. [Escenario 1: Nuevo Pedido](#escenario-1-nuevo-pedido)
3. [Escenario 2: Pago/Cobro](#escenario-2-pagocobro)
4. [Escenario 3: Cambio de Estado](#escenario-3-cambio-de-estado)
5. [Escenario 4: Operaciones de Caja](#escenario-4-operaciones-de-caja)
6. [Escenario 5: Gestión de Impresoras](#escenario-5-gestión-de-impresoras)
7. [Escenario 6: Geolocalización](#escenario-6-geolocalización)
8. [Webhooks y Endpoints](#webhooks-y-endpoints)

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `pedido`
```json
{
  "id": "PED-20241125-001",
  "codigo_turno": "P001",
  "punto_venta_id": "PDV-001",
  "usuario_id": "USR-123",
  "cliente_id": "CLI-456",
  "canal_origen": "presencial | app | web",
  "estado": "en_preparacion | listo | entregado | cancelado | devuelto",
  "total_bruto": 45.00,
  "total_descuentos": 0.00,
  "total_impuestos": 4.50,
  "total_neto": 49.50,
  "pagado": false,
  "fecha_creacion": "2024-11-25T10:30:00Z",
  "fecha_actualizacion": "2024-11-25T10:30:00Z",
  "geolocalizacion_validada": false,
  "latitud": 40.4168,
  "longitud": -3.7038,
  "distancia_metros": 85,
  "motivo_cancelacion": null,
  "motivo_devolucion": null
}
```

### Tabla: `linea_pedido`
```json
{
  "id": "LP-001",
  "pedido_id": "PED-20241125-001",
  "producto_id": "PROD-789",
  "categoria_id": "CAT-PIZZAS",
  "cantidad": 2,
  "precio_unitario": 12.50,
  "descuento": 0.00,
  "subtotal_bruto": 25.00,
  "impuesto_porcentaje": 10,
  "impuesto_importe": 2.50,
  "subtotal_neto": 27.50,
  "notas": "Sin cebolla"
}
```

### Tabla: `turno_pedido`
```json
{
  "id": "TURNO-001",
  "pedido_id": "PED-20241125-001",
  "punto_venta_id": "PDV-001",
  "numero_turno": 1,
  "codigo_turno": "P001",
  "fecha_asignacion": "2024-11-25T10:30:00Z",
  "fecha_llamada": null,
  "fecha_atencion": null,
  "estado_turno": "en_cola | llamado | atendido | cancelado",
  "canal_origen": "presencial | app",
  "reset_diario": "2024-11-25"
}
```

### Tabla: `pago`
```json
{
  "id": "PAGO-001",
  "pedido_id": "PED-20241125-001",
  "metodo_pago": "efectivo | tarjeta | mixto | online",
  "importe": 49.50,
  "fecha_pago": "2024-11-25T10:35:00Z",
  "usuario_id": "USR-123",
  "punto_venta_id": "PDV-001",
  "referencia_externa": null,
  "estado_pago": "pendiente | completado | fallido | reembolsado"
}
```

### Tabla: `pago_mixto_detalle`
```json
{
  "id": "PMD-001",
  "pago_id": "PAGO-001",
  "metodo_1": "efectivo",
  "importe_1": 30.00,
  "metodo_2": "tarjeta",
  "importe_2": 19.50
}
```

### Tabla: `ticket_impresion`
```json
{
  "id": "TICKET-001",
  "pedido_id": "PED-20241125-001",
  "impresora_id": "IMP-001",
  "tipo_ticket": "cocina | montaje | repartidor | cliente",
  "estado_impresion": "pendiente | ok | error",
  "categorias_incluidas": ["Pizzas", "Bebidas"],
  "fecha_impresion": "2024-11-25T10:30:15Z",
  "intentos_impresion": 1,
  "mensaje_error": null
}
```

### Tabla: `impresora`
```json
{
  "id": "IMP-001",
  "punto_venta_id": "PDV-001",
  "nombre": "Impresora Cocina Principal",
  "ip_address": "192.168.1.100",
  "modelo": "Epson TM-T20III",
  "activa": true,
  "categorias_asignadas": ["Pizzas", "Burguers", "Complementos"]
}
```

### Tabla: `operacion_caja`
```json
{
  "id": "OPCAJA-001",
  "punto_venta_id": "PDV-001",
  "turno_caja_id": "TCAJA-001",
  "tipo_operacion": "apertura | retirada | consumo_propio | arqueo | cierre",
  "monto": 100.00,
  "fecha_operacion": "2024-11-25T08:00:00Z",
  "usuario_id": "USR-123",
  "notas": "Apertura de caja del turno mañana",
  "pedido_id": null
}
```

### Tabla: `turno_caja`
```json
{
  "id": "TCAJA-001",
  "punto_venta_id": "PDV-001",
  "usuario_apertura_id": "USR-123",
  "usuario_cierre_id": null,
  "fecha_apertura": "2024-11-25T08:00:00Z",
  "fecha_cierre": null,
  "monto_inicial": 100.00,
  "efectivo_teorico": 450.00,
  "efectivo_real": null,
  "diferencia": null,
  "estado": "abierto | cerrado"
}
```

---

## 🟨 ESCENARIO 1: NUEVO PEDIDO

### **Trigger**
- Webhook: `POST /api/pedidos/crear`
- Watch Records: Tabla `pedido` → New Record

### **Inputs**
```json
{
  "punto_venta_id": "PDV-001",
  "usuario_id": "USR-123",
  "cliente_id": "CLI-456",
  "canal_origen": "presencial",
  "lineas": [
    {
      "producto_id": "PROD-789",
      "categoria_id": "CAT-PIZZAS",
      "cantidad": 2,
      "precio_unitario": 12.50
    },
    {
      "producto_id": "PROD-456",
      "categoria_id": "CAT-BEBIDAS",
      "cantidad": 2,
      "precio_unitario": 2.50
    }
  ]
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Nuevo Pedido           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. CALCULAR TOTALES                │
│  - total_bruto = Σ líneas           │
│  - impuestos = bruto * 0.10         │
│  - total_neto = bruto + impuestos   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. GENERAR TURNO_PEDIDO            │
│  - Obtener último turno del día     │
│  - Si reset_diario != hoy → 001     │
│  - Sino → incrementar               │
│  - Crear código P001-P999           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. CREAR PEDIDO EN BD              │
│  - Insertar en tabla pedido         │
│  - Estado: en_preparacion           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. CREAR LÍNEAS DE PEDIDO          │
│  - Insertar cada línea en BD        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. OBTENER CONFIG IMPRESORAS       │
│  - Query: config_pdv_impresora      │
│  - Filtrar por punto_venta_id       │
│  - Filtrar por categorías del pedido│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. CREAR TICKETS_IMPRESION         │
│  - Para cada impresora activa       │
│  - Agrupar líneas por categoría     │
│  - Crear registro ticket_impresion  │
│  - Estado: pendiente                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. ENVIAR A IMPRESORAS             │
│  - HTTP POST a cada impresora       │
│  - Payload: ticket formateado       │
│  - Actualizar estado_impresion      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  9. UBICAR EN CAJA RÁPIDA           │
│  - Si canal_origen = app            │
│  - Si pagado = true → Naranja       │
│  - Si pagado = false → Azul         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  10. NOTIFICACIÓN                   │
│  - Enviar a frontend vía websocket  │
│  - Actualizar dashboard             │
└─────────────────────────────────────┘
```

### **Módulos Make**

1. **Webhook** - Recibir datos
2. **Math Operations** - Calcular totales
3. **Supabase: Search Rows** - Obtener último turno
4. **Router** - Check reset diario
5. **Set Variable** - Número de turno
6. **Supabase: Insert Row** - Crear pedido
7. **Iterator** - Recorrer líneas
8. **Supabase: Insert Row** - Crear líneas
9. **Supabase: Search Rows** - Config impresoras
10. **Iterator** - Recorrer impresoras
11. **Supabase: Insert Row** - Crear tickets
12. **HTTP** - Enviar a impresora
13. **Supabase: Update Row** - Estado impresión
14. **WebSocket** - Notificar frontend

### **SQL Queries Necesarias**

```sql
-- Obtener último turno del día
SELECT numero_turno, reset_diario
FROM turno_pedido
WHERE punto_venta_id = {{punto_venta_id}}
  AND reset_diario = CURRENT_DATE
ORDER BY numero_turno DESC
LIMIT 1;

-- Obtener impresoras por categorías
SELECT i.*, array_agg(c.categoria) as categorias
FROM impresora i
JOIN config_pdv_impresora c ON i.id = c.impresora_id
WHERE i.punto_venta_id = {{punto_venta_id}}
  AND i.activa = true
  AND c.categoria IN ({{categorias_pedido}})
GROUP BY i.id;
```

---

## 🟨 ESCENARIO 2: PAGO/COBRO

### **Trigger**
- Webhook: `POST /api/pagos/procesar`
- Watch Records: Tabla `pago` → New/Updated Record

### **Inputs**
```json
{
  "pedido_id": "PED-20241125-001",
  "metodo_pago": "mixto",
  "importe_total": 49.50,
  "detalles_mixto": {
    "metodo_1": "efectivo",
    "importe_1": 30.00,
    "metodo_2": "tarjeta",
    "importe_2": 19.50
  },
  "usuario_id": "USR-123",
  "punto_venta_id": "PDV-001"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Pago Recibido          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VALIDAR DATOS                   │
│  - Verificar pedido existe          │
│  - Verificar no pagado previamente  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. CREAR REGISTRO PAGO             │
│  - Insertar en tabla pago           │
│  - Estado: pendiente                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. ¿PAGO MIXTO?                    │
└──────────────┬──────────────────────┘
         SI    │    NO
               ▼
┌─────────────────────────────────────┐
│  5a. CREAR DETALLE MIXTO            │
│  - Insertar en pago_mixto_detalle   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. CALCULAR TOTAL PAGADO           │
│  - Sumar todos los pagos del pedido │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. ¿TOTAL = TOTAL_NETO?            │
└──────────────┬──────────────────────┘
         SI    │    NO
               ▼
┌─────────────────────────────────────┐
│  8. MARCAR PEDIDO COMO PAGADO       │
│  - UPDATE pedido SET pagado = true  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  9. ACTUALIZAR EFECTIVO_TEORICO     │
│  - Si método incluye efectivo       │
│  - UPDATE turno_caja                │
│  - efectivo_teorico += importe      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  10. MOVER A LISTA NARANJA          │
│  - Si canal_origen = app            │
│  - Notificar a Caja Rápida          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  11. NOTIFICACIÓN                   │
│  - Enviar confirmación a frontend   │
│  - Actualizar dashboard             │
└─────────────────────────────────────┘
```

### **SQL Queries**

```sql
-- Sumar todos los pagos del pedido
SELECT SUM(importe) as total_pagado
FROM pago
WHERE pedido_id = {{pedido_id}}
  AND estado_pago = 'completado';

-- Actualizar efectivo teórico
UPDATE turno_caja
SET efectivo_teorico = efectivo_teorico + {{importe_efectivo}}
WHERE punto_venta_id = {{punto_venta_id}}
  AND estado = 'abierto';
```

---

## 🟨 ESCENARIO 3: CAMBIO DE ESTADO

### **Trigger**
- Webhook: `POST /api/pedidos/cambiar-estado`
- Watch Records: Tabla `pedido` → Field Updated (`estado`)

### **Inputs**
```json
{
  "pedido_id": "PED-20241125-001",
  "estado_anterior": "en_preparacion",
  "estado_nuevo": "listo",
  "usuario_id": "USR-123"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Cambio de Estado       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. OBTENER DATOS DEL PEDIDO        │
│  - Query pedido completo            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. ROUTER POR ESTADO               │
└──┬──────┬───────┬──────┬────────┬───┘
   │      │       │      │        │
   ▼      ▼       ▼      ▼        ▼
┌─────┐┌──────┐┌──────┐┌──────┐┌──────┐
│LISTO││ENTRE.││CANCE.││DEVOL.││PREP. │
└──┬──┘└───┬──┘└───┬──┘└───┬──┘└───┬──┘
   │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼
```

### **Ruta: Estado → LISTO**
```
┌─────────────────────────────────────┐
│  4a. IMPRIMIR TICKET MONTAJE        │
│  - Buscar impresora montaje         │
│  - Crear ticket_impresion           │
│  - Enviar a impresora               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5a. NOTIFICAR CAJA RÁPIDA          │
│  - Si origen = app                  │
│  - Actualizar estado visual         │
└─────────────────────────────────────┘
```

### **Ruta: Estado → ENTREGADO**
```
┌─────────────────────────────────────┐
│  4b. REGISTRAR ENTREGA              │
│  - UPDATE pedido                    │
│  - fecha_entrega = NOW()            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5b. REMOVER DE CAJA RÁPIDA         │
│  - Quitar de listas visuales        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6b. ACTUALIZAR TURNO               │
│  - UPDATE turno_pedido              │
│  - estado_turno = atendido          │
└─────────────────────────────────────┘
```

### **Ruta: Estado → CANCELADO**
```
┌─────────────────────────────────────┐
│  4c. VERIFICAR SI HABÍA COBRO       │
└──────────────┬──────────────────────┘
         SI    │    NO
               ▼
┌─────────────────────────────────────┐
│  5c. REGISTRAR OPERACIÓN CAJA       │
│  - tipo: cancelacion_con_reembolso  │
│  - monto: -total_neto               │
│  - Restar de efectivo_teorico       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6c. IMPRIMIR TICKET "CANCELADO"    │
│  - Si ya se imprimió anteriormente  │
│  - Notificar a cocina               │
└─────────────────────────────────────┘
```

### **Ruta: Estado → DEVUELTO**
```
┌─────────────────────────────────────┐
│  4d. CREAR OPERACIÓN DEVOLUCIÓN     │
│  - tipo: devolucion                 │
│  - monto: -total_neto (o parcial)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5d. ACTUALIZAR TURNO_CAJA          │
│  - Restar de efectivo_teorico       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6d. ACTUALIZAR TOTALES DIARIOS     │
│  - Recalcular estadísticas del día  │
└─────────────────────────────────────┘
```

---

## 🟨 ESCENARIO 4: OPERACIONES DE CAJA

### **Trigger**
- Webhook: `POST /api/caja/operacion`
- Watch Records: Tabla `operacion_caja` → New Record

### **Inputs**
```json
{
  "punto_venta_id": "PDV-001",
  "turno_caja_id": "TCAJA-001",
  "tipo_operacion": "retirada",
  "monto": 200.00,
  "usuario_id": "USR-123",
  "notas": "Retirada para banco"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: Nueva Operación Caja   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. VALIDAR TURNO CAJA ABIERTO      │
│  - Query turno_caja                 │
│  - Verificar estado = abierto       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. CREAR OPERACIÓN EN BD           │
│  - Insert operacion_caja            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. ROUTER POR TIPO OPERACIÓN       │
└──┬──────┬───────┬──────┬────────┬───┘
   │      │       │      │        │
   ▼      ▼       ▼      ▼        ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│APERT.││RETIR.││CONSU.││ARQUE.││CIERR.│
└───┬──┘└───┬──┘└───┬──┘└───┬──┘└───┬──┘
```

### **Tipo: APERTURA**
```sql
UPDATE turno_caja
SET monto_inicial = {{monto}},
    efectivo_teorico = {{monto}}
WHERE id = {{turno_caja_id}};
```

### **Tipo: RETIRADA**
```sql
UPDATE turno_caja
SET efectivo_teorico = efectivo_teorico - {{monto}}
WHERE id = {{turno_caja_id}};
```

### **Tipo: CONSUMO_PROPIO**
```sql
UPDATE turno_caja
SET efectivo_teorico = efectivo_teorico - {{monto}}
WHERE id = {{turno_caja_id}};
```

### **Tipo: ARQUEO**
```
┌─────────────────────────────────────┐
│  5. COMPARAR TEÓRICO VS. CONTADO    │
│  - efectivo_teorico (de BD)         │
│  - efectivo_contado (input)         │
│  - diferencia = contado - teorico   │
└──────────────┬──────────────────────┘
               │
               ▼
┌────────────────────────���────────────┐
│  6. REGISTRAR RESULTADO             │
│  - Guardar en notas de operación    │
└─────────────────────────────────────┘
```

### **Tipo: CIERRE**
```
┌─────────────────────────────────────┐
│  5. CALCULAR TOTALES FINALES        │
│  - efectivo_real = input            │
│  - diferencia = real - teorico      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. CERRAR TURNO_CAJA               │
│  - UPDATE turno_caja                │
│  - estado = cerrado                 │
│  - fecha_cierre = NOW()             │
│  - efectivo_real, diferencia        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. GENERAR REPORTE DE CIERRE       │
│  - Total ventas por método          │
│  - Total operaciones                │
│  - Diferencias                      │
│  - PDF o JSON                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. ENVIAR NOTIFICACIÓN             │
│  - Email al gerente                 │
│  - Guardar en historial             │
└─────────────────────────────────────┘
```

### **SQL Query: Reporte de Cierre**
```sql
-- Total ventas por método de pago
SELECT 
  metodo_pago,
  COUNT(*) as cantidad_transacciones,
  SUM(importe) as total
FROM pago
WHERE punto_venta_id = {{punto_venta_id}}
  AND DATE(fecha_pago) = CURRENT_DATE
  AND estado_pago = 'completado'
GROUP BY metodo_pago;

-- Total operaciones de caja
SELECT 
  tipo_operacion,
  COUNT(*) as cantidad,
  SUM(monto) as total
FROM operacion_caja
WHERE turno_caja_id = {{turno_caja_id}}
GROUP BY tipo_operacion;
```

---

## 🟨 ESCENARIO 5: GESTIÓN DE IMPRESORAS

### **Trigger**
- Watch Records: Tabla `ticket_impresion` → Field Updated (`estado_impresion`)
- Scheduled: Cada 2 minutos (verificar tickets pendientes)

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. BUSCAR TICKETS CON ERROR        │
│  - Query: estado_impresion = error  │
│  - intentos_impresion < 3           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. ITERATOR: Por cada ticket       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. OBTENER DATOS COMPLETOS         │
│  - JOIN pedido + lineas + impresora │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. NOTIFICAR EN OPERATIVA          │
│  - WebSocket al frontend            │
│  - Mostrar en panel de errores      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. ESPERAR ACCIÓN MANUAL           │
│  - Usuario hace clic "Reimprimir"   │
│  - Webhook recibe pedido_id + tipo  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. REINTENTAR IMPRESIÓN            │
│  - HTTP POST a impresora            │
│  - Incrementar intentos_impresion   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. ACTUALIZAR ESTADO               │
│  - Si éxito: estado = ok            │
│  - Si fallo: estado = error         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8. REGISTRAR EN LOG                │
│  - Crear registro en ticket_log     │
│  - fecha, usuario, resultado        │
└─────────────────────────────────────┘
```

### **SQL Query: Tickets con Error**
```sql
SELECT 
  t.*,
  p.codigo_turno,
  i.nombre as nombre_impresora,
  i.ip_address
FROM ticket_impresion t
JOIN pedido p ON t.pedido_id = p.id
JOIN impresora i ON t.impresora_id = i.id
WHERE t.estado_impresion = 'error'
  AND t.intentos_impresion < 3
  AND p.estado NOT IN ('entregado', 'cancelado')
ORDER BY t.fecha_impresion DESC;
```

### **Payload HTTP a Impresora**
```json
{
  "printer_ip": "192.168.1.100",
  "ticket_type": "cocina",
  "data": {
    "codigo_turno": "P001",
    "categorias": [
      {
        "nombre": "PIZZAS",
        "items": [
          {
            "cantidad": 2,
            "nombre": "Margarita"
          }
        ]
      },
      {
        "nombre": "BEBIDAS",
        "items": [
          {
            "cantidad": 2,
            "nombre": "Coca-Cola"
          }
        ]
      }
    ],
    "total": 49.50
  },
  "format": {
    "width": "80mm",
    "font_size": "normal",
    "cut_paper": true
  }
}
```

---

## 🟨 ESCENARIO 6: GEOLOCALIZACIÓN

### **Trigger**
- Webhook: `POST /api/geolocalizacion/validar`
- Enviado desde app móvil cuando cliente pulsa "Ya estoy aquí"

### **Inputs**
```json
{
  "pedido_id": "PED-20241125-001",
  "cliente_id": "CLI-456",
  "latitud": 40.4168,
  "longitud": -3.7038,
  "timestamp": "2024-11-25T10:25:00Z"
}
```

### **Flujo Make**

```
┌─────────────────────────────────────┐
│  1. WEBHOOK: "Ya estoy aquí"        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. OBTENER DATOS DEL PEDIDO        │
│  - Query pedido + punto_venta       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. OBTENER COORDENADAS PDV         │
│  - Query punto_venta                │
│  - lat_pdv, lng_pdv                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. CALCULAR DISTANCIA              │
│  - Fórmula Haversine                │
│  - distancia_metros                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. ¿DISTANCIA <= 100m?             │
└──────────────┬──────────────────────┘
         SI    │    NO
               ▼
┌─────────────────────────────────────┐
│  6a. VALIDAR GEOLOCALIZACIÓN        │
│  - UPDATE pedido                    │
│  - geolocalizacion_validada = true  │
│  - latitud, longitud, distancia     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7a. CREAR/ACTUALIZAR TURNO         │
│  - Si no tiene turno → crear        │
│  - estado_turno = en_cola           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  8a. MOSTRAR EN CAJA RÁPIDA         │
│  - Lista Naranja (si pagado)        │
│  - Notificar frontend               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  9a. INICIAR TEMPORIZADOR 10 MIN    │
│  - Scheduled trigger                │
│  - Guardar timestamp_llegada        │
└─────────────────────────────────────┘

          (NO - distancia > 100m)
               │
               ▼
┌─────────────────────────────────────┐
│  6b. RECHAZAR GEOLOCALIZACIÓN       │
│  - geolocalizacion_validada = false │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7b. NOTIFICAR CLIENTE              │
│  - Push notification                │
│  - "Aún no estás en la zona"        │
│  - Mostrar distancia actual         │
└─────────────────────────────────────┘
```

### **Cálculo Haversine (Distancia)**
```javascript
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distancia en metros
}
```

### **Flujo: Temporizador 10 minutos**

```
┌─────────────────────────────────────┐
│  1. SCHEDULED: Cada minuto          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. BUSCAR PEDIDOS EXPIRADOS        │
│  - geolocalizacion_validada = true  │
│  - timestamp_llegada < NOW() - 10min│
│  - estado = en_preparacion o listo  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. ITERATOR: Por cada pedido       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. MOVER A LISTA AZUL              │
│  - UPDATE pedido                    │
│  - geolocalizacion_validada = false │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. NOTIFICAR EN CAJA RÁPIDA        │
│  - Cambiar de Naranja a Azul        │
│  - Mostrar mensaje "Tiempo expirado"│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. NOTIFICAR CLIENTE               │
│  - Push: "Tu turno ha expirado"     │
│  - Opción: Volver a validar         │
└─────────────────────────────────────┘
```

### **SQL Query: Pedidos Expirados**
```sql
SELECT *
FROM pedido
WHERE geolocalizacion_validada = true
  AND timestamp_llegada < NOW() - INTERVAL '10 minutes'
  AND estado IN ('en_preparacion', 'listo')
  AND canal_origen = 'app';
```

---

## 📡 WEBHOOKS Y ENDPOINTS

### **Endpoints Make (Webhooks)**

```
1. POST /api/pedidos/crear
   → Escenario 1: Nuevo Pedido

2. POST /api/pagos/procesar
   → Escenario 2: Pago/Cobro

3. POST /api/pedidos/cambiar-estado
   → Escenario 3: Cambio de Estado

4. POST /api/caja/operacion
   → Escenario 4: Operaciones de Caja

5. POST /api/impresoras/reimprimir
   → Escenario 5: Reimpresión

6. POST /api/geolocalizacion/validar
   → Escenario 6: Geolocalización
```

### **Configuración en Make**

```javascript
// Webhook Custom en Make
{
  "url": "https://hook.eu2.make.com/xyz123abc456",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{API_KEY}}"
  }
}
```

### **Response Standard**

```json
{
  "success": true,
  "data": {
    "pedido_id": "PED-20241125-001",
    "codigo_turno": "P001",
    "estado": "en_preparacion"
  },
  "message": "Pedido creado correctamente",
  "timestamp": "2024-11-25T10:30:00Z"
}
```

### **Error Response**

```json
{
  "success": false,
  "error": {
    "code": "PEDIDO_001",
    "message": "No se pudo crear el turno",
    "details": "Límite de turnos diarios alcanzado"
  },
  "timestamp": "2024-11-25T10:30:00Z"
}
```

---

## 🔄 INTEGRACIÓN CON SUPABASE

### **Configuración de Triggers en Supabase**

```sql
-- Trigger: Nuevo pedido creado
CREATE OR REPLACE FUNCTION notify_nuevo_pedido()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'nuevo_pedido',
    json_build_object(
      'pedido_id', NEW.id,
      'punto_venta_id', NEW.punto_venta_id,
      'total_neto', NEW.total_neto
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nuevo_pedido
AFTER INSERT ON pedido
FOR EACH ROW
EXECUTE FUNCTION notify_nuevo_pedido();

-- Trigger: Cambio de estado
CREATE OR REPLACE FUNCTION notify_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    PERFORM pg_notify(
      'cambio_estado_pedido',
      json_build_object(
        'pedido_id', NEW.id,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cambio_estado
AFTER UPDATE ON pedido
FOR EACH ROW
EXECUTE FUNCTION notify_cambio_estado();
```

### **Suscripción en Make**

```javascript
// Make module: Supabase Realtime
{
  "table": "pedido",
  "event": "INSERT",
  "filter": "punto_venta_id=eq.PDV-001"
}
```

---

## 📊 MÉTRICAS Y MONITOREO

### **KPIs a Trackear**

```sql
-- Pedidos por hora
SELECT 
  DATE_TRUNC('hour', fecha_creacion) as hora,
  COUNT(*) as total_pedidos,
  AVG(total_neto) as ticket_medio
FROM pedido
WHERE punto_venta_id = 'PDV-001'
  AND DATE(fecha_creacion) = CURRENT_DATE
GROUP BY hora
ORDER BY hora;

-- Tasa de error de impresión
SELECT 
  estado_impresion,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM ticket_impresion
WHERE DATE(fecha_impresion) = CURRENT_DATE
GROUP BY estado_impresion;

-- Tiempo promedio por estado
SELECT 
  estado,
  AVG(
    EXTRACT(EPOCH FROM (
      COALESCE(fecha_entrega, NOW()) - fecha_creacion
    )) / 60
  ) as minutos_promedio
FROM pedido
WHERE DATE(fecha_creacion) = CURRENT_DATE
GROUP BY estado;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Fase 1: Setup Inicial**
- [ ] Crear todas las tablas en Supabase
- [ ] Configurar triggers de base de datos
- [ ] Crear webhooks en Make
- [ ] Configurar variables de entorno

### **Fase 2: Escenarios Core**
- [ ] Implementar Escenario 1 (Nuevo Pedido)
- [ ] Implementar Escenario 2 (Pago/Cobro)
- [ ] Implementar Escenario 3 (Cambio de Estado)

### **Fase 3: Escenarios Avanzados**
- [ ] Implementar Escenario 4 (Operaciones de Caja)
- [ ] Implementar Escenario 5 (Gestión de Impresoras)
- [ ] Implementar Escenario 6 (Geolocalización)

### **Fase 4: Testing**
- [ ] Test end-to-end de cada escenario
- [ ] Test de errores y reintentos
- [ ] Test de carga (múltiples pedidos simultáneos)
- [ ] Test de geolocalización

### **Fase 5: Monitoreo**
- [ ] Configurar alertas de errores
- [ ] Dashboard de métricas
- [ ] Logs centralizados

---

## 🎯 CONCLUSIÓN

Este sistema de automatización permite:

✅ **Flujo automático** de pedidos desde creación hasta entrega  
✅ **Gestión inteligente** de impresoras por categorías  
✅ **Control total de caja** con operaciones trazables  
✅ **Validación de geolocalización** para pedidos app  
✅ **Manejo de errores** con reintentos automáticos  
✅ **Trazabilidad completa** de todas las operaciones  

**Total de Escenarios Make:** 6  
**Webhooks necesarios:** 6  
**Triggers DB necesarios:** 4  
**Scheduled tasks:** 2  

🟩 **TPV 360 - Sistema de Automatización COMPLETADO**
