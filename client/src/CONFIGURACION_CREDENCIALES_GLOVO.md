# 🔐 CONFIGURACIÓN DE CREDENCIALES GLOVO - GUÍA PASO A PASO

## 📋 REQUISITOS PREVIOS

Antes de empezar, asegúrate de tener:
- ✅ Cuenta de negocio en Glovo (restaurante/tienda registrado)
- ✅ Acceso al Dashboard de Glovo
- ✅ Dominio con HTTPS (obligatorio para webhooks)
- ✅ Servidor Next.js desplegado (Vercel, Railway, etc.)

---

## 🔑 PASO 1: OBTENER CREDENCIALES DE GLOVO

### **1.1. Acceder al Dashboard**

1. Ve a: **https://dashboard.glovoapp.com**
2. Inicia sesión con tu cuenta de negocio
3. Selecciona tu tienda/restaurante

### **1.2. Generar API Key**

```
Dashboard → Configuración → API & Integrations → API Keys
```

1. Click en **"Generate new API Key"**
2. Nombre: `UDAR Edge Production`
3. Permisos:
   - ✅ Read orders
   - ✅ Update orders
   - ✅ Read menu
   - ✅ Update menu
4. Click **"Generate"**
5. **⚠️ IMPORTANTE:** Copia la API Key inmediatamente (solo se muestra una vez)

**Formato:**
```
glv_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### **1.3. Obtener Store ID**

```
Dashboard → Configuración → General → Store Details
```

Busca el campo **"Store ID"** o **"Restaurant ID"**

**Formato:**
```
store_5f8a3b2c1d4e6789abcdef01
```

### **1.4. Generar Webhook Secret**

```
Dashboard → Configuración → Webhooks → Settings
```

1. Click en **"Generate Webhook Secret"**
2. **⚠️ IMPORTANTE:** Copia el secret inmediatamente

**Formato:**
```
whsec_abc123def456ghi789jkl012mno345pqr
```

---

## 🌐 PASO 2: CONFIGURAR VARIABLES DE ENTORNO

### **2.1. Archivo Local (Desarrollo)**

Crea/edita `.env.local` en la raíz del proyecto:

```bash
# ============================================
# GLOVO - CONFIGURACIÓN DE PRODUCCIÓN
# ============================================

# API Key (obligatoria)
GLOVO_API_KEY=glv_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz

# Store ID (obligatorio)
GLOVO_STORE_ID=store_5f8a3b2c1d4e6789abcdef01

# Webhook Secret (obligatorio para verificar firmas)
GLOVO_WEBHOOK_SECRET=whsec_abc123def456ghi789jkl012mno345pqr

# URL base de tu aplicación (importante para webhooks)
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://tu-dominio.com

# Entorno (production/sandbox)
GLOVO_ENVIRONMENT=production

# ============================================
# OPCIONAL: Configuración avanzada
# ============================================

# Comisión personalizada (si difiere del 25% estándar)
GLOVO_COMMISSION_RATE=0.25

# Tiempo de preparación por defecto (minutos)
GLOVO_DEFAULT_PREP_TIME=15

# Activar logs detallados (development only)
GLOVO_DEBUG_LOGS=false
```

### **2.2. Archivo Producción (Servidor)**

Si usas **Vercel:**

```bash
# Dashboard de Vercel → Tu Proyecto → Settings → Environment Variables

# Añadir cada variable:
GLOVO_API_KEY=glv_live_...
GLOVO_STORE_ID=store_...
GLOVO_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://tu-dominio.vercel.app
GLOVO_ENVIRONMENT=production
```

Si usas **Railway/Render/Fly.io:**

```bash
# Dashboard → Environment Variables → Add

GLOVO_API_KEY=glv_live_...
GLOVO_STORE_ID=store_...
GLOVO_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://tu-app.railway.app
GLOVO_ENVIRONMENT=production
```

---

## 🔗 PASO 3: CONFIGURAR WEBHOOK EN GLOVO

### **3.1. Añadir Webhook**

```
Dashboard Glovo → Configuración → Webhooks → Add Webhook
```

**Configuración:**

| Campo | Valor |
|-------|-------|
| **Name** | UDAR Edge Webhook |
| **URL** | `https://tu-dominio.com/api/webhooks/glovo` |
| **Secret** | (usar el generado en paso 1.4) |
| **Active** | ✅ Enabled |
| **Events** | Ver tabla abajo |

**Eventos a suscribir:**

| Evento | Descripción | ¿Necesario? |
|--------|-------------|-------------|
| `order.new` | Nuevo pedido recibido | ✅ **Sí** |
| `order.accepted` | Pedido aceptado por restaurante | ⚠️ Opcional |
| `order.rejected` | Pedido rechazado | ⚠️ Opcional |
| `order.ready` | Pedido listo para recoger | ⚠️ Opcional |
| `order.picked_up` | Repartidor recogió pedido | ✅ **Sí** |
| `order.delivered` | Pedido entregado | ✅ **Sí** |
| `order.cancelled` | Pedido cancelado | ✅ **Sí** |
| `menu.updated` | Menú actualizado | ⚠️ Opcional |

### **3.2. Verificar Webhook**

Glovo enviará un evento de prueba:

```json
{
  "event": "webhook.test",
  "timestamp": "2025-11-29T12:00:00Z",
  "data": {
    "message": "Test webhook"
  }
}
```

**Deberías ver en logs:**
```
🛵 [GLOVO WEBHOOK] Petición recibida
✅ Webhook verificado correctamente
```

---

## ✅ PASO 4: VERIFICAR CONFIGURACIÓN

### **4.1. Test de Conectividad**

Crea un script de verificación:

```typescript
// /scripts/verify-glovo.ts

import { gestorAgregadores } from '../services/aggregators';

async function verificarGlovo() {
  console.log('🔍 Verificando configuración de Glovo...\n');
  
  // 1. Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log(`  GLOVO_API_KEY: ${process.env.GLOVO_API_KEY ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`  GLOVO_STORE_ID: ${process.env.GLOVO_STORE_ID ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`  GLOVO_WEBHOOK_SECRET: ${process.env.GLOVO_WEBHOOK_SECRET ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`  WEBHOOK_BASE_URL: ${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL || '❌ Faltante'}\n`);
  
  // 2. Verificar conexión con API
  console.log('🌐 Conectividad:');
  const agregador = gestorAgregadores.obtener('glovo');
  
  if (!agregador) {
    console.log('  ❌ Agregador Glovo no inicializado');
    return;
  }
  
  const conectado = await agregador.verificarConexion();
  console.log(`  ${conectado ? '✅' : '❌'} Conexión con API Glovo\n`);
  
  // 3. Test de webhook
  console.log('🔗 Webhook:');
  console.log(`  URL: ${process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL}/api/webhooks/glovo`);
  console.log(`  Estado: ${conectado ? '✅ Listo para recibir' : '❌ Verificar configuración'}\n`);
  
  console.log(conectado ? '🎉 ¡Todo configurado correctamente!' : '⚠️ Hay problemas de configuración');
}

verificarGlovo();
```

**Ejecutar:**
```bash
npx tsx scripts/verify-glovo.ts
```

**Output esperado:**
```
🔍 Verificando configuración de Glovo...

📋 Variables de entorno:
  GLOVO_API_KEY: ✅ Configurada
  GLOVO_STORE_ID: ✅ Configurada
  GLOVO_WEBHOOK_SECRET: ✅ Configurada
  WEBHOOK_BASE_URL: ✅ https://tu-dominio.com

🌐 Conectividad:
  ✅ Conexión con API Glovo

🔗 Webhook:
  URL: https://tu-dominio.com/api/webhooks/glovo
  Estado: ✅ Listo para recibir

🎉 ¡Todo configurado correctamente!
```

---

## 🧪 PASO 5: HACER PRIMER PEDIDO DE PRUEBA

### **5.1. Modo Sandbox (Recomendado)**

Glovo ofrece un entorno de pruebas:

```
Dashboard → Settings → Sandbox Mode → Enable
```

**Ventajas:**
- ✅ Pedidos de prueba sin cargo
- ✅ Repartidores simulados
- ✅ No afecta métricas reales

**Cómo hacer pedido sandbox:**

1. Descarga la app Glovo
2. Activa modo sandbox en tu cuenta
3. Busca tu restaurante
4. Haz un pedido de prueba
5. Paga con tarjeta de prueba: `4242 4242 4242 4242`

### **5.2. Verificar Recepción**

**En tu servidor, deberías ver:**

```
🛵 [GLOVO WEBHOOK] Petición recibida
📦 [GLOVO WEBHOOK] Evento: order.new
📦 [GLOVO WEBHOOK] Pedido ID: GLOVO-TEST-123
🆕 [GLOVO] Procesando nuevo pedido...
✅ [GLOVO] Pedido creado: PED-GLOVO-1732899876543
```

**En la UI:**

```
┌──────────────────────────────────────────┐
│ 🛵 GLOVO          12:30        €17.50   │
│─────────────────────────────────────────│
│ 👤 Test User                            │
│ 📞 612345678                            │
│ 📍 Calle Test, 42                       │
│                                         │
│ Items: 2x Producto Test                │
│                                         │
│ [✅ ACEPTAR]      [❌ RECHAZAR]         │
└──────────────────────────────────────────┘
```

### **5.3. Aceptar el Pedido**

1. Click **"ACEPTAR"**
2. Tiempo prep: **15 minutos**
3. Confirmar

**Resultado en Glovo:**
```
Pedido #123 - ACEPTADO
Tiempo preparación: 15 min
Buscando repartidor...
```

### **5.4. Marcar como Listo**

1. Esperar 15 minutos (o simular)
2. Click **"MARCAR LISTO"**

**Resultado en Glovo:**
```
Pedido #123 - LISTO
Repartidor asignado: Juan R.
Llegada estimada: 5 min
```

---

## 🔐 SEGURIDAD

### **6.1. Verificación de Firmas**

El webhook ya verifica firmas HMAC automáticamente:

```typescript
// /app/api/webhooks/glovo/route.ts

const firma = request.headers.get('x-glovo-signature');
const bodyText = await request.text();

if (!verificarFirma(bodyText, firma)) {
  return NextResponse.json(
    { error: 'Firma inválida' },
    { status: 401 }
  );
}
```

**⚠️ NUNCA desactives esta verificación en producción.**

### **6.2. Rate Limiting**

Añade protección contra spam:

```typescript
// /middleware.ts (crear si no existe)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
    const ip = request.ip || 'unknown';
    const now = Date.now();
    const limit = rateLimitMap.get(ip);
    
    if (limit && now < limit.resetTime) {
      if (limit.count >= 100) { // 100 requests per minute
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/webhooks/:path*',
};
```

---

## 📊 MONITORIZACIÓN

### **7.1. Logs en Producción**

Si usas **Vercel:**

```
Dashboard → Logs → Runtime Logs

Filtrar por: "/api/webhooks/glovo"
```

Si usas **Railway:**

```
Dashboard → Deployments → View Logs

Buscar: "GLOVO WEBHOOK"
```

### **7.2. Alertas**

Configurar alertas por email/Slack:

```typescript
// /lib/monitoring.ts

export async function enviarAlerta(tipo: 'error' | 'warning', mensaje: string) {
  // Opción 1: Email
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'admin@tu-dominio.com',
      subject: `[${tipo.toUpperCase()}] Webhook Glovo`,
      text: mensaje
    })
  });
  
  // Opción 2: Slack
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 *${tipo.toUpperCase()}*: ${mensaje}`
    })
  });
}
```

Usar en webhook:

```typescript
// En route.ts
if (!resultado.success) {
  await enviarAlerta('error', `Error procesando pedido Glovo: ${resultado.error}`);
}
```

---

## 🐛 TROUBLESHOOTING

### **Problema 1: "API Key inválida"**

**Síntoma:**
```
❌ Error: Authentication failed
```

**Solución:**
1. Verificar que copiaste la API Key completa
2. Verificar que no hay espacios al inicio/final
3. Verificar que es la key de **producción** (no sandbox si estás en prod)
4. Regenerar API Key en dashboard Glovo

---

### **Problema 2: "Webhook no recibe eventos"**

**Síntoma:**
```
Pedido en Glovo pero no aparece en el sistema
```

**Solución:**

1. Verificar URL del webhook:
   ```
   Dashboard Glovo → Webhooks → Verificar URL
   ¿Es HTTPS? ¿Es la correcta?
   ```

2. Test manual:
   ```bash
   curl -X POST https://tu-dominio.com/api/webhooks/glovo \
     -H "Content-Type: application/json" \
     -H "x-glovo-signature: test" \
     -d '{"event":"order.new","data":{}}'
   ```

3. Verificar logs del servidor

4. Verificar firewall/CORS

---

### **Problema 3: "Firma inválida"**

**Síntoma:**
```
❌ [GLOVO WEBHOOK] Firma inválida
```

**Solución:**

1. Verificar `GLOVO_WEBHOOK_SECRET` es correcto
2. Regenerar secret en Glovo Dashboard
3. Actualizar en `.env.local` y reiniciar servidor
4. En desarrollo, temporalmente desactivar verificación:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     // Skip signature verification
   }
   ```

---

### **Problema 4: "Timeout en webhook"**

**Síntoma:**
```
⏱️ Webhook timeout after 10s
```

**Solución:**

1. Optimizar procesamiento:
   ```typescript
   // NO hacer operaciones pesadas síncronas
   await procesarPedido(); // ❌ Lento
   
   // Usar cola de trabajos
   queue.add('procesar-pedido', payload); // ✅ Rápido
   return NextResponse.json({ received: true });
   ```

2. Incrementar timeout del servidor (Vercel: max 10s en Free)

---

## ✅ CHECKLIST FINAL

Antes de ir a producción:

- [ ] ✅ API Key configurada
- [ ] ✅ Store ID configurado
- [ ] ✅ Webhook Secret configurado
- [ ] ✅ URL webhook con HTTPS
- [ ] ✅ Webhook activo en Glovo Dashboard
- [ ] ✅ Eventos suscritos correctamente
- [ ] ✅ Test de pedido sandbox exitoso
- [ ] ✅ Verificación de firma activa
- [ ] ✅ Rate limiting configurado
- [ ] ✅ Logs de monitorización activos
- [ ] ✅ Alertas configuradas (opcional)
- [ ] ✅ Equipo capacitado

---

## 🎓 MEJORES PRÁCTICAS

### **1. Gestión de Secretos**

```bash
# ❌ MAL: Subir al repositorio
git add .env.local  # NUNCA hacer esto

# ✅ BIEN: Usar .gitignore
echo ".env.local" >> .gitignore

# ✅ BIEN: Variables de entorno del servidor
# Vercel/Railway/etc. tienen UI para esto
```

### **2. Rotación de Credenciales**

```
Cada 3-6 meses:
1. Generar nueva API Key
2. Actualizar en servidor (sin downtime)
3. Eliminar API Key antigua
4. Verificar funcionamiento
```

### **3. Separación de Entornos**

```bash
# Desarrollo
GLOVO_API_KEY=glv_test_...
GLOVO_ENVIRONMENT=sandbox

# Producción
GLOVO_API_KEY=glv_live_...
GLOVO_ENVIRONMENT=production
```

---

## 📞 SOPORTE GLOVO

**API & Integraciones:**
- 📧 Email: api-support@glovoapp.com
- 📚 Docs: https://docs.glovoapp.com
- 💬 Slack: (solicitar invitación a partners channel)

**Soporte General:**
- ☎️ Teléfono: +34 931 234 567
- 📧 Email: partner-support@glovoapp.com
- 🕐 Horario: L-V 9:00-18:00 CET

**Emergencias (pedidos activos):**
- ☎️ Línea directa: +34 900 123 456 (24/7)

---

## 🎉 ¡LISTO!

Ahora tienes Glovo configurado correctamente en producción.

**Próximo paso:** Implementar Uber Eats y Just Eat 🚀
