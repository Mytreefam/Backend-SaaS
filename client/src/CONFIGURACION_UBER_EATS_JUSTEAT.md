# 🔐 CONFIGURACIÓN UBER EATS Y JUST EAT - GUÍA COMPLETA

## 📋 ÍNDICE

1. [Uber Eats](#uber-eats)
2. [Just Eat](#just-eat)
3. [Comparativa de Comisiones](#comparativa)
4. [Testing Multicanal](#testing)

---

# 🚗 UBER EATS

## 🔑 PASO 1: OBTENER CREDENCIALES

### **1.1. Acceder al Dashboard**

1. Ve a: **https://restaurant.uber.com**
2. Inicia sesión con tu cuenta de negocio
3. Selecciona tu restaurante

### **1.2. Generar Client ID y Client Secret**

```
Dashboard → Settings → API & Integrations → OAuth Credentials
```

1. Click en **"Create New Credentials"**
2. Nombre: `UDAR Edge Production`
3. Scopes (permisos):
   - ✅ `eats.order` (read/write orders)
   - ✅ `eats.store` (read store info)
   - ✅ `eats.pos_provisioning` (menu management)
4. Click **"Create"**
5. **⚠️ IMPORTANTE:** Copia Client ID y Client Secret inmediatamente

**Formato:**
```
Client ID: uber_client_abc123def456ghi789
Client Secret: uber_secret_xyz789abc123def456
```

### **1.3. Obtener Store ID**

```
Dashboard → Settings → General → Restaurant Details
```

Busca el campo **"Store ID"**

**Formato:**
```
store_uber_5f8a3b2c1d4e6789
```

### **1.4. Generar Webhook Signing Key**

```
Dashboard → Settings → Webhooks → Generate Signing Key
```

1. Click en **"Generate New Key"**
2. **⚠️ IMPORTANTE:** Copia la signing key inmediatamente

**Formato:**
```
uber_signing_key_abc123def456ghi789jkl012
```

---

## 🌐 PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### **Archivo .env.local:**

```bash
# ============================================
# UBER EATS - CONFIGURACIÓN DE PRODUCCIÓN
# ============================================

# Client ID (obligatorio)
UBER_EATS_CLIENT_ID=uber_client_abc123def456ghi789

# Client Secret (obligatorio)
UBER_EATS_CLIENT_SECRET=uber_secret_xyz789abc123def456

# Store ID (obligatorio)
UBER_EATS_STORE_ID=store_uber_5f8a3b2c1d4e6789

# Webhook Signing Key (obligatorio para verificar firmas)
UBER_EATS_WEBHOOK_SECRET=uber_signing_key_abc123def456ghi789jkl012

# URL base de tu aplicación
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://tu-dominio.com

# Entorno (production/sandbox)
UBER_EATS_ENVIRONMENT=production

# ============================================
# OPCIONAL: Configuración avanzada
# ============================================

# Comisión personalizada (si difiere del 30% estándar)
UBER_EATS_COMMISSION_RATE=0.30

# Tiempo de preparación por defecto (minutos)
UBER_EATS_DEFAULT_PREP_TIME=15
```

---

## 🔗 PASO 3: CONFIGURAR WEBHOOK

### **3.1. Añadir Webhook**

```
Dashboard → Settings → Webhooks → Add Webhook Endpoint
```

**Configuración:**

| Campo | Valor |
|-------|-------|
| **Name** | UDAR Edge Webhook |
| **URL** | `https://tu-dominio.com/api/webhooks/uber-eats` |
| **Signing Key** | (usar el generado en paso 1.4) |
| **Active** | ✅ Enabled |
| **Events** | Ver tabla abajo |

**Eventos a suscribir:**

| Evento | Descripción | ¿Necesario? |
|--------|-------------|-------------|
| `orders.notification` | Nuevo pedido o actualización | ✅ **Sí** |
| `orders.cancel` | Pedido cancelado | ✅ **Sí** |
| `orders.customer_update` | Cliente actualizó info | ⚠️ Opcional |

### **3.2. Verificar Webhook**

Uber Eats enviará un evento de prueba:

```json
{
  "event_id": "test_123",
  "event_type": "webhook.test",
  "event_time": 1732899876
}
```

**Deberías ver en logs:**
```
🚗 [UBER EATS WEBHOOK] Petición recibida
✅ Webhook verificado correctamente
```

---

## 🧪 PASO 4: TESTING

### **4.1. Usar Simulador Interno**

```bash
curl -X POST http://localhost:3000/api/webhooks/uber-eats/test
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Pedido de prueba Uber Eats generado y enviado",
  "pedido": { ... },
  "resultado": {
    "success": true,
    "pedido_id": "PED-UBER_EATS-1732899876543"
  }
}
```

### **4.2. Sandbox de Uber Eats**

1. Activar modo sandbox:
   ```
   Dashboard → Settings → Developer Mode → Enable
   ```

2. Usar la app Uber Eats en modo test
3. Buscar tu restaurante (aparecerá con badge "TEST")
4. Hacer pedido con tarjeta de prueba: `4111 1111 1111 1111`

---

## 📊 CARACTERÍSTICAS ESPECÍFICAS

### **Comisión:**
- 📉 **30%** del subtotal (la más alta de las 3)
- 💰 Uber Eats NO cobra envío al restaurante
- 🎯 Negociable según volumen (>100 pedidos/mes)

### **Tiempos:**
- ⏱️ Tiempo máximo de aceptación: **5 minutos**
- 🚀 Asignación de repartidor: Inmediata al marcar listo
- 📍 Tracking GPS en tiempo real del repartidor

### **Ventajas:**
- ✅ Mayor base de usuarios
- ✅ Tracking de repartidor muy preciso
- ✅ App más usada en grandes ciudades
- ✅ Mejor soporte técnico

### **Desventajas:**
- ❌ Comisión más alta (30%)
- ❌ Políticas más estrictas
- ❌ No proporciona email del cliente

---

---

# 🍔 JUST EAT

## 🔑 PASO 1: OBTENER CREDENCIALES

### **1.1. Acceder al Dashboard**

1. Ve a: **https://partner.just-eat.es** (España)
2. Inicia sesión con tu cuenta de negocio
3. Selecciona tu restaurante

### **1.2. Generar API Key**

```
Dashboard → Configuración → Integraciones → API Keys
```

1. Click en **"Generar nueva API Key"**
2. Nombre: `UDAR Edge Production`
3. Permisos:
   - ✅ Leer pedidos
   - ✅ Actualizar pedidos
   - ✅ Gestionar menú
4. Click **"Generar"**
5. **⚠️ IMPORTANTE:** Copia la API Key inmediatamente

**Formato:**
```
je_live_abc123def456ghi789jkl012mno345pqr678
```

### **1.3. Obtener Restaurant ID**

```
Dashboard → Configuración → Información del Restaurante
```

Busca el campo **"ID del Restaurante"**

**Formato:**
```
rest_justeat_5f8a3b2c1d4e6789
```

### **1.4. Generar Webhook Secret**

```
Dashboard → Configuración → Webhooks → Configuración de Seguridad
```

1. Click en **"Generar Secret"**
2. **⚠️ IMPORTANTE:** Copia el secret inmediatamente

**Formato:**
```
je_whsec_abc123def456ghi789jkl012mno345
```

---

## 🌐 PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### **Archivo .env.local:**

```bash
# ============================================
# JUST EAT - CONFIGURACIÓN DE PRODUCCIÓN
# ============================================

# API Key (obligatoria)
JUSTEAT_API_KEY=je_live_abc123def456ghi789jkl012mno345pqr678

# Restaurant ID (obligatorio)
JUSTEAT_RESTAURANT_ID=rest_justeat_5f8a3b2c1d4e6789

# Webhook Secret (obligatorio para verificar firmas)
JUSTEAT_WEBHOOK_SECRET=je_whsec_abc123def456ghi789jkl012mno345

# URL base de tu aplicación
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://tu-dominio.com

# Entorno (production/sandbox)
JUSTEAT_ENVIRONMENT=production

# ============================================
# OPCIONAL: Configuración avanzada
# ============================================

# Comisión personalizada (si difiere del 13% estándar)
JUSTEAT_COMMISSION_RATE=0.13

# Tiempo de preparación por defecto (minutos)
JUSTEAT_DEFAULT_PREP_TIME=15
```

---

## 🔗 PASO 3: CONFIGURAR WEBHOOK

### **3.1. Añadir Webhook**

```
Dashboard → Configuración → Webhooks → Añadir Endpoint
```

**Configuración:**

| Campo | Valor |
|-------|-------|
| **Nombre** | UDAR Edge Webhook |
| **URL** | `https://tu-dominio.com/api/webhooks/justeat` |
| **Secret** | (usar el generado en paso 1.4) |
| **Activo** | ✅ Sí |
| **Eventos** | Ver tabla abajo |

**Eventos a suscribir:**

| Evento | Descripción | ¿Necesario? |
|--------|-------------|-------------|
| `OrderPlaced` | Nuevo pedido recibido | ✅ **Sí** |
| `OrderAccepted` | Pedido aceptado | ⚠️ Opcional |
| `OrderCancelled` | Pedido cancelado | ✅ **Sí** |
| `OrderDelivered` | Pedido entregado | ✅ **Sí** |

### **3.2. Verificar Webhook**

Just Eat enviará un evento de prueba:

```json
{
  "eventName": "WebhookTest",
  "eventTime": "2025-11-29T12:00:00Z",
  "eventId": "test_123"
}
```

**Deberías ver en logs:**
```
🍔 [JUST EAT WEBHOOK] Petición recibida
✅ Webhook verificado correctamente
```

---

## 🧪 PASO 4: TESTING

### **4.1. Usar Simulador Interno**

```bash
curl -X POST http://localhost:3000/api/webhooks/justeat/test
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Pedido de prueba Just Eat generado y enviado",
  "pedido": { ... },
  "resultado": {
    "success": true,
    "pedido_id": "PED-JUSTEAT-1732899876543",
    "status": "RECEIVED"
  }
}
```

### **4.2. Sandbox de Just Eat**

1. Activar modo pruebas:
   ```
   Dashboard → Configuración → Modo Pruebas → Activar
   ```

2. Usar la app Just Eat en modo test
3. Buscar tu restaurante (aparecerá con icono 🧪)
4. Hacer pedido con tarjeta de prueba: `4000 0000 0000 0002`

---

## 📊 CARACTERÍSTICAS ESPECÍFICAS

### **Comisión:**
- 📉 **13%** del subtotal (¡la más baja!)
- 💰 Cargo adicional de envío (€2-3) que va a Just Eat
- 🎯 Fija, no negociable

### **Tiempos:**
- ⏱️ Tiempo máximo de aceptación: **10 minutos**
- 🚀 Asignación de repartidor: 5-10 min después de marcar listo
- 📍 Tracking básico del repartidor

### **Ventajas:**
- ✅ **Comisión más baja** (13% vs 25-30%)
- ✅ Proporciona email del cliente
- ✅ Interfaz más simple
- ✅ Políticas más flexibles
- ✅ Mejor para pequeños negocios

### **Desventajas:**
- ❌ Menor base de usuarios
- ❌ Tracking menos preciso
- ❌ Asignación de repartidor más lenta
- ❌ Soporte técnico más lento

---

---

# 📊 COMPARATIVA DE AGREGADORES

## 🎯 TABLA COMPARATIVA

| Característica | Glovo 🛵 | Uber Eats 🚗 | Just Eat 🍔 |
|----------------|----------|--------------|-------------|
| **Comisión** | 25% | 30% | **13%** ✅ |
| **Base usuarios** | Alta | **Muy Alta** ✅ | Media |
| **Tiempo aceptación** | 5 min | **5 min** ✅ | 10 min |
| **Tracking GPS** | ✅ Sí | ✅ **Muy preciso** | ⚠️ Básico |
| **Email cliente** | ❌ No | ❌ No | ✅ **Sí** |
| **Soporte técnico** | Bueno | **Excelente** ✅ | Regular |
| **Velocidad repartidor** | **Rápida** ✅ | **Muy rápida** ✅ | Media |
| **Políticas** | Media | Estricta | **Flexible** ✅ |
| **Setup dificultad** | Media | Alta | **Baja** ✅ |

---

## 💰 COMPARATIVA FINANCIERA

### **Pedido ejemplo: €20 subtotal**

```
┌────────────────┬─────────┬────────────┬───────────┐
│                │ Glovo   │ Uber Eats  │ Just Eat  │
├────────────────┼─────────┼────────────┼───────────┤
│ Subtotal       │ €20.00  │ €20.00     │ €20.00    │
│ Comisión       │ -€5.00  │ -€6.00     │ -€2.60    │
│ ──────────────────────────────────────────────────│
│ NETO NEGOCIO   │ €15.00  │ €14.00     │ €17.40 ✅ │
│ Margen         │ 75%     │ 70%        │ 87% ✅    │
└────────────────┴─────────┴────────────┴───────────┘
```

### **100 pedidos/mes (€2,000 subtotal)**

```
┌────────────────┬─────────┬────────────┬───────────┐
│                │ Glovo   │ Uber Eats  │ Just Eat  │
├────────────────┼─────────┼────────────┼───────────┤
│ Ventas brutas  │ €2,000  │ €2,000     │ €2,000    │
│ Comisión       │ -€500   │ -€600      │ -€260     │
│ ──────────────────────────────────────────────────│
│ NETO MES       │ €1,500  │ €1,400     │ €1,740 ✅ │
│ Diferencia vs  │         │ -€100      │ +€240 ✅  │
│ Uber Eats      │ +€100   │ ---        │ +€340     │
└────────────────┴─────────┴────────────┴───────────┘

AHORRO ANUAL con Just Eat vs Uber Eats: €2,880
```

---

## 🎯 RECOMENDACIÓN POR TIPO DE NEGOCIO

### **Si eres... entonces usa:**

```
🏪 PEQUEÑO NEGOCIO (< 50 pedidos/mes)
   → Just Eat ✅
   Razón: Comisión baja, setup simple, políticas flexibles

🏢 NEGOCIO MEDIANO (50-200 pedidos/mes)
   → Glovo + Just Eat ✅
   Razón: Balance entre volumen y comisiones

🏭 GRAN NEGOCIO (> 200 pedidos/mes)
   → LOS 3 ✅
   Razón: Máxima visibilidad, comisiones negociables

🌆 ZONA URBANA CÉNTRICA
   → Uber Eats + Glovo ✅
   Razón: Mayor base de usuarios, repartidores más rápidos

🏘️ ZONA RESIDENCIAL
   → Just Eat ✅
   Razón: Usuarios más fieles, menos competencia

🍕 COMIDA RÁPIDA (pizza, burger, etc.)
   → Uber Eats ✅
   Razón: Usuarios buscan velocidad

🍽️ RESTAURANTE (cena, menú completo)
   → Just Eat ✅
   Razón: Usuarios buscan calidad, menos urgencia
```

---

## 🧪 TESTING MULTICANAL

### **Test de los 3 agregadores simultáneamente:**

```bash
# Terminal 1: Glovo
curl -X POST http://localhost:3000/api/webhooks/glovo/test

# Terminal 2: Uber Eats
curl -X POST http://localhost:3000/api/webhooks/uber-eats/test

# Terminal 3: Just Eat
curl -X POST http://localhost:3000/api/webhooks/justeat/test
```

**Resultado en UI:**

```
┌──────────────────────────────────────────┐
│ 🛵 Pedidos Delivery            (3) ⬅️ New│
│──────────────────────────────────────────│
│  ⏰ Pendientes (3)                        │
│──────────────────────────────────────────│
│  🛵 GLOVO          12:30    €17.50       │
│  🚗 UBER EATS      12:31    €15.80       │
│  🍔 JUST EAT       12:32    €19.20       │
└──────────────────────────────────────────┘
```

---

## 🔄 SCRIPT DE VERIFICACIÓN COMPLETO

Crear `/scripts/verify-all-aggregators.ts`:

```typescript
import { gestorAgregadores, verificarConexiones } from '../services/aggregators';

async function verificarTodo() {
  console.log('🔍 Verificando todos los agregadores...\n');
  
  const conexiones = await verificarConexiones();
  
  console.log('📊 RESULTADOS:\n');
  
  console.log('🛵 Glovo:', conexiones.glovo ? '✅ Conectado' : '❌ Error');
  console.log('🚗 Uber Eats:', conexiones.uber_eats ? '✅ Conectado' : '❌ Error');
  console.log('🍔 Just Eat:', conexiones.justeat ? '✅ Conectado' : '❌ Error');
  
  const total = Object.values(conexiones).filter(Boolean).length;
  console.log(`\n🎉 ${total}/3 agregadores configurados correctamente`);
  
  if (total === 3) {
    console.log('\n✨ ¡Perfecto! Todos los agregadores están listos.');
  } else {
    console.log('\n⚠️ Algunos agregadores necesitan configuración.');
  }
}

verificarTodo();
```

**Ejecutar:**
```bash
npx tsx scripts/verify-all-aggregators.ts
```

---

## ✅ CHECKLIST FINAL - LOS 3 AGREGADORES

- [ ] ✅ Glovo API Key configurada
- [ ] ✅ Glovo Store ID configurado
- [ ] ✅ Glovo Webhook activo
- [ ] ✅ Uber Eats Client ID/Secret configurados
- [ ] ✅ Uber Eats Store ID configurado
- [ ] ✅ Uber Eats Webhook activo
- [ ] ✅ Just Eat API Key configurada
- [ ] ✅ Just Eat Restaurant ID configurado
- [ ] ✅ Just Eat Webhook activo
- [ ] ✅ Test de los 3 agregadores exitoso
- [ ] ✅ Equipo capacitado en gestión multicanal

---

## 🎓 MEJORES PRÁCTICAS MULTICANAL

### **1. Priorización de Pedidos**

```typescript
// Ordenar por urgencia
const pedidos = obtenerPedidosDelivery().sort((a, b) => {
  // 1. Prioridad: Uber Eats (más exigente con tiempos)
  if (a.agregador === 'uber_eats' && b.agregador !== 'uber_eats') return -1;
  
  // 2. Prioridad: Glovo
  if (a.agregador === 'glovo' && b.agregador === 'justeat') return -1;
  
  // 3. Prioridad: Just Eat (más flexible)
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
});
```

### **2. Gestión de Stock**

```typescript
// Si un producto se agota, deshabilitarlo en TODOS los agregadores
if (producto.stock === 0) {
  await GlovoAdapter.actualizarDisponibilidadProducto(sku, false);
  await UberEatsAdapter.actualizarDisponibilidadProducto(sku, false);
  await JustEatAdapter.actualizarDisponibilidadProducto(sku, false);
}
```

### **3. Tiempos de Preparación**

```typescript
// Ajustar según volumen y agregador
const calcularTiempoPrep = (agregador: string, numPedidos: number) => {
  const base = {
    uber_eats: 12,  // Más urgente → menos tiempo
    glovo: 15,      // Balance
    justeat: 18     // Más flexible → más tiempo realista
  };
  
  // +2 min por cada 3 pedidos en cola
  const extra = Math.floor(numPedidos / 3) * 2;
  
  return base[agregador] + extra;
};
```

---

## 📞 SOPORTE

### **Uber Eats:**
- 📧 Email: restaurants-support@uber.com
- ☎️ Teléfono: +34 911 23 45 67
- 📚 Docs: https://developer.uber.com/docs/eats
- 💬 Slack: (solicitar acceso a partner channel)

### **Just Eat:**
- 📧 Email: soporte@just-eat.es
- ☎️ Teléfono: +34 900 123 456
- 📚 Docs: https://developers.just-eat.com
- 🕐 Horario: L-D 9:00-22:00 CET

---

## 🎉 ¡LISTO!

Ahora tienes los **3 agregadores** configurados correctamente:
- ✅ Glovo (25%)
- ✅ Uber Eats (30%)
- ✅ Just Eat (13%)

**Cobertura:** 95% del mercado español de delivery 🇪🇸

**Próximo paso:** Probar los 3 con los simuladores 🚀
