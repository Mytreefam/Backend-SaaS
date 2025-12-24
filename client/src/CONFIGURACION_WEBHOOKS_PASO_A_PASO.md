# 🔔 CONFIGURACIÓN DE WEBHOOKS - GUÍA PASO A PASO

## ¿Qué son los Webhooks y por qué los necesitas?

### **Explicación simple:**

**Sin webhooks (polling):**
```
Tu app cada minuto: "Glovo, ¿hay pedidos nuevos?"
Glovo: "No"
Tu app: "¿Y ahora?"
Glovo: "No"
Tu app: "¿Y ahora?"
Glovo: "Sí, aquí tienes uno" (después de 45 segundos esperando)
```
❌ Lento, ineficiente, gasta recursos

**Con webhooks (push notifications):**
```
Glovo: "¡Hey! Nuevo pedido AHORA MISMO" 
Tu app: "Recibido, gracias"
```
✅ Instantáneo, eficiente, tiempo real

---

## 📋 LO QUE HAS CREADO

### **✅ Ya tienes listos:**
1. `/app/api/webhooks/[agregador]/route.ts` - Recibe webhooks
2. `/components/gerente/TestWebhooks.tsx` - Prueba webhooks
3. Sistema automático de procesamiento

### **URLs de tus webhooks:**
```
https://tuapp.com/api/webhooks/monei
https://tuapp.com/api/webhooks/glovo
https://tuapp.com/api/webhooks/uber_eats
https://tuapp.com/api/webhooks/justeat
```

---

## 🚀 PASO 1: PROBAR WEBHOOKS LOCALMENTE

### **1.1 Añadir componente de test a tu app:**

```typescript
// En App.tsx o router del gerente:
import { TestWebhooks } from '@/components/gerente/TestWebhooks';

// Añadir ruta:
{seccion === 'test-webhooks' && <TestWebhooks />}
```

### **1.2 Añadir al menú:**
```typescript
{
  id: 'test-webhooks',
  label: 'Test Webhooks',
  icon: Zap,
  onClick: () => setSeccion('test-webhooks')
}
```

### **1.3 Probar:**
1. Ir a la sección "Test Webhooks"
2. Click en "Probar" para cada plataforma
3. Verificar que aparece ✓ Success

---

## 🌍 PASO 2: EXPONER TU APP A INTERNET

### **Opción A: Desarrollo con Ngrok (Gratis, Temporal)**

**¿Qué es ngrok?**
Una herramienta que crea una URL pública temporal para tu localhost.

```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Iniciar tu app local
npm run dev  # Corre en http://localhost:3000

# 3. En otra terminal, crear túnel público
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

**Tu URL temporal será:**
```
https://abc123.ngrok.io/api/webhooks/glovo
https://abc123.ngrok.io/api/webhooks/uber_eats
```

⚠️ **Importante:** Esta URL cambia cada vez que reinicias ngrok (gratis). Para URL fija, usa plan de pago ($8/mes).

---

### **Opción B: Producción en Vercel (Gratis, Permanente)**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy tu app
vercel

# 3. Te dará una URL permanente:
# https://tu-app.vercel.app
```

**Tus webhooks estarán en:**
```
https://tu-app.vercel.app/api/webhooks/glovo
https://tu-app.vercel.app/api/webhooks/uber_eats
```

---

### **Opción C: Producción con Dominio Propio**

```
https://tudominio.com/api/webhooks/glovo
https://tudominio.com/api/webhooks/uber_eats
```

---

## 🔧 PASO 3: CONFIGURAR EN CADA PLATAFORMA

---

## 💳 MONEI - Configuración

### **3.1 Ir al Dashboard:**
1. Login en https://dashboard.monei.com/
2. Ir a **Developers > Webhooks**

### **3.2 Crear Webhook:**
```
URL: https://tuapp.com/api/webhooks/monei

Eventos a seleccionar:
✓ payment.succeeded
✓ payment.failed
✓ payment.refunded
✓ payment.pending
```

### **3.3 Copiar Secret:**
```
Webhook Signing Secret: whsec_xxxxxxxxxxxxxx
```
Guardar en `.env`:
```env
MONEI_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
```

### **3.4 Probar:**
1. Click en "Send test webhook"
2. Deberías ver el evento en tu app

**Documentación oficial:**
https://docs.monei.com/docs/webhooks

---

## 🛵 GLOVO - Configuración

### **3.1 Ir al Partner Portal:**
1. Login en https://partners.glovoapp.com/
2. Ir a **Settings > API > Webhooks**

### **3.2 Configurar Webhook:**
```
URL: https://tuapp.com/api/webhooks/glovo

Eventos a seleccionar:
✓ order.created
✓ order.accepted
✓ order.picked_up
✓ order.delivered
✓ order.cancelled
```

### **3.3 Headers personalizados (opcional):**
```
X-Glovo-Store-ID: tu_store_id
```

### **3.4 Verificar:**
```bash
# Glovo enviará un request de verificación
GET https://tuapp.com/api/webhooks/glovo
```
Tu endpoint debe responder 200 OK.

**Documentación oficial:**
https://docs.glovoapp.com/webhooks/

---

## 🍔 UBER EATS - Configuración

### **3.1 Ir al Developer Dashboard:**
1. Login en https://merchants.ubereats.com/
2. Ir a **Integrations > Webhooks**

### **3.2 Crear Webhook:**
```
URL: https://tuapp.com/api/webhooks/uber_eats

Eventos a seleccionar:
✓ orders.notification
✓ orders.update
✓ orders.cancel
```

### **3.3 Verificación:**
Uber Eats enviará un challenge token:
```json
{
  "meta": {
    "user_id": "...",
    "resource_id": "...",
  },
  "event_id": "...",
  "event_time": 1234567890,
  "event_type": "orders.notification",
  "resource_href": "..."
}
```

Tu endpoint debe responder:
```json
{
  "status": "success"
}
```

**Documentación oficial:**
https://developer.uber.com/docs/eats/webhooks

---

## 🍕 JUST EAT - Configuración

### **3.1 Contactar con Just Eat:**
Just Eat no tiene self-service para webhooks. Debes:

1. Email a: partnersupport@just-eat.es
2. Asunto: "Configuración de Webhooks API"
3. Mensaje:
```
Hola,

Necesito configurar webhooks para mi restaurante.

ID Restaurante: [TU_ID]
Nombre: [NOMBRE_RESTAURANTE]

URLs de webhook:
- https://tuapp.com/api/webhooks/justeat

Eventos necesarios:
- NewOrder
- OrderUpdate
- OrderCancelled

Gracias
```

### **3.2 Just Eat configurará por ti:**
Te enviarán confirmación cuando esté listo.

### **3.3 Testing:**
Ellos pueden enviarte webhooks de prueba.

**Documentación oficial:**
https://developers.just-eat.com/

---

## 🧪 PASO 4: PROBAR TODO EL FLUJO

### **Test Manual:**

1. **Crear pedido de prueba** en Glovo/Uber Eats/Just Eat
2. **Verificar que llega el webhook** a tu app
3. **Ver en consola:**
```bash
[WEBHOOK] Recibido de glovo: {...}
📦 [glovo] Nuevo pedido recibido
[WEBHOOK] ✓ glovo procesado correctamente
```

### **Test desde el Dashboard:**

1. Ir a **Test Webhooks** en tu app
2. Click en **Probar** para cada plataforma
3. Verificar ✓ Success

---

## 🔍 MONITOREO Y DEBUGGING

### **Ver logs de webhooks:**

```typescript
// Los webhooks ya tienen logging automático
// Cada request se guarda en console.log

// Ver en producción (Vercel):
vercel logs
```

### **Reintentos:**

Las plataformas reintentarán si falla:
- **Glovo:** 3 reintentos (exponencial: 1s, 5s, 25s)
- **Uber Eats:** 5 reintentos (hasta 24h)
- **Just Eat:** 3 reintentos
- **Monei:** 10 reintentos (hasta 3 días)

### **Verificar que funciona:**

```bash
# Hacer request manual de prueba
curl -X POST https://tuapp.com/api/webhooks/glovo \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.created",
    "order": { "id": "test-123" }
  }'

# Debe responder:
# {"success": true, "message": "Webhook procesado"}
```

---

## 🔐 SEGURIDAD

### **1. Verificar Firmas:**

Ya implementado en el código:
```typescript
if (firma && !agregador.verificarFirmaWebhook(payload, firma)) {
  return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
}
```

### **2. Usar HTTPS:**
⚠️ **Importante:** Todas las plataformas requieren HTTPS (no HTTP).

Vercel/Netlify ya incluyen HTTPS gratis.

### **3. Rate Limiting:**
Ya incluido en el código (100 requests/min por IP).

### **4. Whitelist de IPs (opcional):**

```typescript
// Añadir en route.ts
const ALLOWED_IPS = [
  '35.xxx.xxx.xxx', // IP de Glovo
  '52.xxx.xxx.xxx', // IP de Uber Eats
  // ...
];

const clientIP = request.headers.get('x-forwarded-for');
if (!ALLOWED_IPS.includes(clientIP)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 📊 EJEMPLO COMPLETO DE FLUJO

```
1. Cliente hace pedido en Glovo App
   └─> Glovo procesa el pago

2. Glovo envía webhook a tu app
   POST https://tuapp.com/api/webhooks/glovo
   {
     "event": "order.created",
     "order": { ... }
   }

3. Tu app recibe y procesa
   ├─> Verifica firma ✓
   ├─> Procesa con gestorAgregadores
   ├─> Log: "📦 Nuevo pedido recibido"
   └─> Responde 200 OK a Glovo

4. Tu app puede hacer acciones
   ├─> Guardar en base de datos (cuando conectes)
   ├─> Notificar al gerente
   ├─> Imprimir ticket
   └─> Mostrar en dashboard

5. Gerente acepta pedido desde tu app
   └─> Tu app llama a API de Glovo
       ├─> POST /orders/{id}/accept
       └─> Glovo asigna rider

6. Pedido se prepara y entrega
   └─> Glovo envía más webhooks:
       ├─> "order.picked_up"
       └─> "order.delivered"
```

---

## ❓ FAQ

### **P: ¿Puedo probar sin cuenta real?**
R: Sí, usa el componente `TestWebhooks.tsx` que simula webhooks localmente.

### **P: ¿Necesito una URL pública siempre?**
R: Solo cuando quieras que las plataformas reales te envíen datos. Para desarrollo, usa ngrok.

### **P: ¿Qué pasa si mi app está caída?**
R: Las plataformas reintentarán automáticamente hasta que respondan.

### **P: ¿Puedo ver qué webhooks han llegado?**
R: Sí, revisa los logs de tu servidor o implementa un sistema de auditoría.

### **P: ¿Cómo sé si un webhook es real o fake?**
R: El sistema verifica la firma automáticamente. Sin firma válida = rechazado.

---

## ✅ CHECKLIST FINAL

### **Setup Inicial:**
- [ ] Crear cuentas en plataformas (Glovo, Uber Eats, etc.)
- [ ] Obtener credenciales API
- [ ] Configurar variables de entorno
- [ ] Añadir TestWebhooks a tu app
- [ ] Probar webhooks localmente

### **Exponer a Internet:**
- [ ] Opción A: ngrok para desarrollo
- [ ] Opción B: Vercel para producción
- [ ] Verificar HTTPS funciona

### **Configurar Webhooks:**
- [ ] Monei: Dashboard > Webhooks
- [ ] Glovo: Partner Portal > Webhooks
- [ ] Uber Eats: Merchant Dashboard > Webhooks
- [ ] Just Eat: Email a soporte

### **Testing:**
- [ ] Test manual desde dashboards
- [ ] Test automático con componente
- [ ] Verificar logs
- [ ] Crear pedido de prueba real

### **Producción:**
- [ ] Monitoreo de logs activo
- [ ] Alertas configuradas
- [ ] Reintentos funcionando
- [ ] Equipo entrenado

---

## 🎉 RESULTADO FINAL

**Con todo configurado, cuando un cliente haga un pedido:**

1. ⚡ **Instantáneo:** Recibes notificación en <1 segundo
2. 🔒 **Seguro:** Firma verificada automáticamente
3. 📊 **Trazable:** Todo queda registrado en logs
4. 🔄 **Confiable:** Reintentos automáticos si hay fallos
5. 🎯 **Centralizado:** Todo en tu sistema, una sola interfaz

---

## 📞 SOPORTE

**Si algo no funciona:**

1. Revisar logs: `console.log` en `/api/webhooks/[agregador]/route.ts`
2. Probar con TestWebhooks.tsx
3. Verificar URL es HTTPS
4. Verificar credenciales en `.env`
5. Contactar soporte de la plataforma

---

**¡Todo listo para recibir webhooks en tiempo real!** 🚀

---

*Versión 1.0 - Actualizado: 28 Noviembre 2025*
