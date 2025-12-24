# ⚡ EVENTOS MAKE.COM - AGENTES EXTERNOS

**Documentación de eventos para automatización con Make.com / AutoFlow**

---

## 📋 ÍNDICE DE EVENTOS

1. **`on_external_agent_created`** - Crear agente externo
2. **`on_external_agent_updated`** - Actualizar agente
3. **`on_external_document_received`** - Recibir documento
4. **`on_external_document_sent`** - Enviar documento

---

## 🔔 EVENTO 1: `on_external_agent_created`

### **¿Cuándo se dispara?**
Al crear un nuevo agente externo desde el modal.

### **Payload completo:**

```json
{
  "evento": "on_external_agent_created",
  "timestamp": "2025-11-26T14:30:00Z",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-001",
  "gerente_id": "USR-GERENTE-001",
  
  "agente": {
    "id": "AGE-005",
    "nombre": "Carlos Pérez González",
    "tipo": "gestor",
    "empresa": "Gestoría Fiscal Pérez",
    "email": "carlos@gestoriaperez.com",
    "telefono": "+34 915 123 456",
    "modo": "SAAS",
    
    "acceso_saas": {
      "username": "carlos_perez",
      "email_destino_sistema": null,
      "estado_usuario": "activo",
      "enviar_credenciales": true
    },
    
    "canales": {
      "email": false,
      "whatsapp": false,
      "saas": true
    }
  }
}
```

### **Acciones sugeridas en Make.com:**

#### **Flujo 1: Enviar credenciales por email**
```
1. Trigger: on_external_agent_created
2. Condición: agente.acceso_saas.enviar_credenciales === true
3. Generar contraseña temporal
4. Crear usuario en auth_system
5. Enviar email con credenciales:
   - Asunto: "Bienvenido a Udar Edge"
   - Cuerpo: Template con username y contraseña
   - Link: https://app.udaredge.com/login
6. Registrar en log de auditoría
```

#### **Flujo 2: Notificar al gerente**
```
1. Trigger: on_external_agent_created
2. Enviar notificación push al gerente
3. Mensaje: "Nuevo agente externo creado: {nombre}"
4. Enviar email resumen al gerente
```

#### **Flujo 3: Crear registro en CRM**
```
1. Trigger: on_external_agent_created
2. Crear contacto en CRM (HubSpot/Salesforce)
3. Tag: "Agente Externo - {tipo}"
4. Asignar a gestor de cuenta
```

---

## 🔔 EVENTO 2: `on_external_agent_updated`

### **¿Cuándo se dispara?**
Al editar un agente existente y guardar cambios.

### **Payload completo:**

```json
{
  "evento": "on_external_agent_updated",
  "timestamp": "2025-11-26T15:00:00Z",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "gerente_id": "USR-GERENTE-001",
  
  "agente": {
    "id": "AGE-001",
    "nombre": "Juan Rodríguez"
  },
  
  "cambios": [
    {
      "campo": "canal_whatsapp_activo",
      "valor_anterior": false,
      "valor_nuevo": true
    },
    {
      "campo": "recepcion.recibir_pedidos.canal",
      "valor_anterior": "email",
      "valor_nuevo": "whatsapp"
    }
  ]
}
```

### **Acciones sugeridas en Make.com:**

#### **Flujo 1: Cambio de canal activado**
```
1. Trigger: on_external_agent_updated
2. Condición: cambios incluye "canal_whatsapp_activo" = true
3. Activar webhook de WhatsApp para este agente
4. Configurar número del bot
5. Enviar mensaje de prueba al agente
6. Notificar al gerente
```

#### **Flujo 2: Cambio de permisos**
```
1. Trigger: on_external_agent_updated
2. Condición: cambios incluye "permisos.*"
3. Actualizar permisos en sistema de auth
4. Enviar email al agente informando del cambio
5. Registrar en log de auditoría
```

#### **Flujo 3: Bloqueo de usuario**
```
1. Trigger: on_external_agent_updated
2. Condición: cambios.estado_usuario = "bloqueado"
3. Revocar sesiones activas
4. Bloquear acceso en sistema de auth
5. Enviar email al agente
6. Notificar al gerente
```

---

## 🔔 EVENTO 3: `on_external_document_received`

### **¿Cuándo se dispara?**
Cuando un agente envía un documento al sistema (email/WhatsApp/SaaS).

### **Payload completo:**

```json
{
  "evento": "on_external_document_received",
  "timestamp": "2025-11-26T16:00:00Z",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-001",
  
  "documento": {
    "id": "DOC-2025-00123",
    "tipo_documento": "factura_proveedor",
    "nombre_archivo": "FACTURA_B12345678_NOV2025.pdf",
    "mime_type": "application/pdf",
    "tamaño_bytes": 345678,
    "url_almacenamiento": "https://storage.udaredge.com/docs/2025/11/...",
    "url_preview": "https://storage.udaredge.com/preview/..."
  },
  
  "agente": {
    "id": "AGE-001",
    "nombre": "Juan Rodríguez",
    "tipo": "proveedor",
    "empresa": "Harinas Molino del Sur"
  },
  
  "canal": "email",
  "origen": {
    "email_remitente": "juan@molinodelsur.com",
    "asunto": "Factura noviembre 2025",
    "cuerpo": "Adjunto factura del mes de noviembre. Saludos.",
    "fecha_recepcion": "2025-11-26T15:55:00Z"
  },
  
  "procesamiento": {
    "identificador_extraido": "B12345678",
    "tipo_identificador": "cif",
    "destino_modulo": "modulo_facturacion",
    "estado": "procesado",
    "errores": []
  },
  
  "datos_extraidos_ocr": {
    "cif_proveedor": "B12345678",
    "razon_social": "Harinas Molino del Sur SL",
    "numero_factura": "2025-001",
    "fecha_factura": "2025-11-15",
    "fecha_vencimiento": "2025-12-15",
    "base_imponible": 1033.33,
    "iva": 216.67,
    "total": 1250.00,
    "lineas": [
      {
        "concepto": "Harina de trigo tipo 550",
        "cantidad": 100,
        "precio_unitario": 10.33,
        "importe": 1033.33
      }
    ]
  },
  
  "entidad_creada": {
    "tipo": "factura_proveedor",
    "id": "FP-2025-00045",
    "url": "/facturas/proveedores/FP-2025-00045"
  }
}
```

### **Acciones sugeridas en Make.com:**

#### **Flujo 1: Procesamiento de factura de proveedor**
```
1. Trigger: on_external_document_received
2. Condición: tipo_documento = "factura_proveedor"
3. Validar datos extraídos por OCR:
   - ¿CIF existe en base de datos?
   - ¿Importe dentro de rangos esperados?
   - ¿Fecha válida?
4. Si OK → Aprobar factura automáticamente
5. Si NOK → Marcar para revisión manual
6. Crear asiento contable en ERP
7. Programar pago según fecha_vencimiento
8. Enviar confirmación al proveedor
9. Notificar al gerente/contable
```

#### **Flujo 2: Procesamiento de nómina**
```
1. Trigger: on_external_document_received
2. Condición: tipo_documento = "nomina"
3. Extraer DNI del empleado
4. Buscar empleado en BBDD
5. Si encontrado:
   - Asociar nómina al empleado
   - Marcar mes como pagado
   - Enviar notificación al empleado
6. Si no encontrado:
   - Alertar al gerente
   - Marcar para revisión manual
```

#### **Flujo 3: Notificación y confirmación**
```
1. Trigger: on_external_document_received
2. Si procesamiento.estado = "procesado":
   - Enviar email confirmación al agente
   - Mensaje: "Documento recibido y procesado"
3. Si procesamiento.estado = "error":
   - Enviar email al agente con error
   - Notificar al gerente
```

---

## 🔔 EVENTO 4: `on_external_document_sent`

### **¿Cuándo se dispara?**
Cuando el sistema envía un documento a un agente externo.

### **Payload completo:**

```json
{
  "evento": "on_external_document_sent",
  "timestamp": "2025-11-26T17:00:00Z",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-001",
  "usuario_id": "USR-GERENTE-001",
  
  "documento": {
    "id": "DOC-2025-00124",
    "tipo_documento": "pedido",
    "nombre_archivo": "PEDIDO_PED-2025-001.pdf",
    "mime_type": "application/pdf",
    "tamaño_bytes": 125000,
    "url_almacenamiento": "https://storage.udaredge.com/docs/2025/11/...",
    "url_descarga": "https://storage.udaredge.com/download/..."
  },
  
  "agente": {
    "id": "AGE-002",
    "nombre": "María González",
    "tipo": "proveedor",
    "empresa": "Lácteos Menorca"
  },
  
  "canal": "whatsapp",
  "destino": {
    "whatsapp_numero": "+34 917 654 321",
    "email": null
  },
  
  "modulo_origen": "modulo_pedidos",
  "entidad_origen": {
    "tipo": "pedido",
    "id": "PED-2025-001",
    "url": "/pedidos/PED-2025-001"
  },
  
  "datos_pedido": {
    "numero": "PED-2025-001",
    "fecha": "2025-11-26",
    "fecha_entrega_esperada": "2025-11-28",
    "punto_venta": "Tiana",
    "total": 450.00,
    "lineas": [
      {
        "producto": "Leche entera",
        "cantidad": 50,
        "unidad": "litros",
        "precio_unitario": 0.90,
        "importe": 45.00
      },
      {
        "producto": "Yogur natural",
        "cantidad": 100,
        "unidad": "unidades",
        "precio_unitario": 0.50,
        "importe": 50.00
      }
    ]
  },
  
  "estado_envio": "enviado",
  "fecha_envio": "2025-11-26T17:00:00Z",
  "mensaje_id_whatsapp": "wamid.HBgNMzQ5MTc2NTQzMjEVAgARGBI1NzY3RTI4QjVDNjBFNjg3QkMA"
}
```

### **Acciones sugeridas en Make.com:**

#### **Flujo 1: Envío de pedido por WhatsApp**
```
1. Trigger: on_external_document_sent
2. Condición: tipo_documento = "pedido" AND canal = "whatsapp"
3. Enviar mensaje WhatsApp:
   - Texto: "Nuevo pedido {numero}"
   - Adjunto: PDF del pedido
4. Registrar envío en log
5. Programar recordatorio si no hay respuesta en 24h
6. Actualizar estado del pedido en BBDD
```

#### **Flujo 2: Envío de factura por email**
```
1. Trigger: on_external_document_sent
2. Condición: tipo_documento = "factura_emitida" AND canal = "email"
3. Enviar email con template profesional:
   - Asunto: "Factura {numero} - {empresa}"
   - Cuerpo: HTML con resumen
   - Adjunto: PDF de factura
4. Registrar envío
5. Actualizar estado en CRM
```

#### **Flujo 3: Seguimiento automático**
```
1. Trigger: on_external_document_sent
2. Esperar 24 horas
3. Verificar si el agente ha respondido
4. Si no → Enviar recordatorio
5. Si sí → Marcar como confirmado
6. Notificar al gerente
```

---

## 🔄 FLUJOS COMBINADOS

### **Flujo A: Ciclo completo de pedido**

```
1. Sistema envía pedido al proveedor (whatsapp)
   → Dispara: on_external_document_sent

2. Proveedor responde confirmando disponibilidad
   → Sistema recibe mensaje WhatsApp

3. Proveedor envía albarán (email)
   → Dispara: on_external_document_received
   → Procesamiento automático
   → Crea albarán en sistema

4. Sistema actualiza estado del pedido
   → Notifica al gerente

5. Proveedor envía factura (email)
   → Dispara: on_external_document_received
   → Procesamiento automático
   → Crea factura en módulo facturación

6. Sistema programa pago
   → Notifica al gerente para aprobación
```

---

### **Flujo B: Gestión de nóminas mensuales**

```
1. Fin de mes → Trigger automático

2. Sistema exporta datos de empleados
   → Genera archivo Excel

3. Sistema envía a gestoría (modo SaaS)
   → Dispara: on_external_document_sent
   → Canal: saas (descarga desde panel)

4. Gestoría procesa nóminas

5. Gestoría sube nóminas al sistema
   → Dispara: on_external_document_received (x N empleados)
   → Procesamiento automático por DNI
   → Asocia cada nómina al empleado

6. Sistema notifica a cada empleado
   → Email: "Tu nómina de {mes} está disponible"

7. Sistema actualiza RRHH
   → Marca mes como pagado
   → Actualiza costes laborales
```

---

## 📊 ESTADÍSTICAS Y MÉTRICAS

### **Eventos sugeridos para tracking:**

```json
{
  "evento": "external_agents_metrics_daily",
  "fecha": "2025-11-26",
  "metricas": {
    "agentes_activos": 12,
    "agentes_modo_saas": 4,
    "agentes_modo_canal": 8,
    "documentos_recibidos": {
      "total": 45,
      "facturas": 20,
      "nominas": 15,
      "albaranes": 10
    },
    "documentos_enviados": {
      "total": 30,
      "pedidos": 25,
      "informes": 5
    },
    "procesamiento": {
      "exitosos": 43,
      "con_errores": 2,
      "tasa_exito": 95.6
    },
    "canales": {
      "email": 50,
      "whatsapp": 20,
      "saas": 5
    }
  }
}
```

---

## 🧪 TESTING DE EVENTOS

### **Cómo probar en desarrollo:**

```javascript
// Simular evento en console del navegador
const testEvent = {
  evento: "on_external_document_received",
  timestamp: new Date().toISOString(),
  agente: { id: "AGE-001", nombre: "Test" },
  documento: { tipo_documento: "factura_proveedor" }
};

// Enviar a webhook de Make.com
fetch('https://hook.eu1.make.com/YOUR_WEBHOOK_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testEvent)
});
```

---

## 📝 NOTAS PARA DEVELOPER

### **Implementación de eventos:**

```typescript
// Ejemplo de disparo de evento
const dispararEvento = async (
  evento: string, 
  payload: any
) => {
  try {
    // Log en console
    console.log(`🔔 EVENTO: ${evento}`, payload);
    
    // Enviar a Make.com
    const response = await fetch(process.env.MAKECOM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Event-Type': evento,
        'X-API-Key': process.env.MAKECOM_API_KEY
      },
      body: JSON.stringify(payload)
    });
    
    // Registrar en log de auditoría
    await db.audit_logs.create({
      evento,
      payload,
      timestamp: new Date(),
      estado: response.ok ? 'enviado' : 'error'
    });
    
  } catch (error) {
    console.error('Error disparando evento:', error);
  }
};

// Uso en el código
await dispararEvento('on_external_agent_created', {
  evento: 'on_external_agent_created',
  agente: { id: 'AGE-005', ... }
});
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN MAKE.COM

- [ ] Crear webhook para cada evento (4 webhooks)
- [ ] Configurar autenticación con API Key
- [ ] Crear escenarios para cada flujo sugerido
- [ ] Testear con datos de ejemplo
- [ ] Configurar gestión de errores
- [ ] Activar logging y monitoreo
- [ ] Documentar cada escenario
- [ ] Configurar notificaciones de error

---

## 🎉 CONCLUSIÓN

**4 eventos principales** completamente documentados y listos para implementar en Make.com.

Cada evento incluye:
- ✅ Payload completo
- ✅ Ejemplos de uso
- ✅ Flujos sugeridos
- ✅ Casos de uso reales

**Todo preparado para automatizar el intercambio de documentos con agentes externos! 🚀**
