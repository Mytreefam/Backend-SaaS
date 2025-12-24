# 🔌 APIS EXTERNAS - INTEGRACIÓN COMPLETA

## 📱 Para APK Móvil - Udar Edge

---

## ✅ APIs YA CONFIGURADAS

### **1. Unsplash API** ✅
**Archivo:** Integrado en el sistema de compilación  
**Uso:** Búsqueda de imágenes de stock  
**Estado:** ✅ Funcionando

```typescript
import { unsplash_tool } from '@/tools';

// Buscar imágenes
const imagenUrl = await unsplash_tool({ query: 'coffee shop' });
```

### **2. Supabase** ✅ (Preparado)
**Archivos:**
- `/lib/supabase.ts` (preparado para crear)
- Schemas SQL en `/docs/`

**Servicios disponibles:**
- Autenticación
- Base de datos PostgreSQL
- Storage de archivos
- Realtime subscriptions
- Edge Functions

**Guía:** Ver `/GUIA_INTEGRACION_API.md`

---

## 🔧 APIS RECOMENDADAS PARA IMPLEMENTAR

### **1. PAGOS** 💳

#### **Stripe** (RECOMENDADO)
**Para:** Pagos online, suscripciones  
**Precio:** 1.4% + 0.25€ por transacción europea  
**Capacitor Plugin:** ✅ Disponible

```bash
npm install @capacitor-community/stripe
```

```typescript
// /services/stripe.service.ts
import { Stripe } from '@capacitor-community/stripe';

export class StripeService {
  async inicializar() {
    await Stripe.initialize({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  }

  async crearPago(amount: number, currency: string = 'EUR') {
    const paymentIntent = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    }).then(res => res.json());

    const result = await Stripe.createPaymentSheet({
      paymentIntentClientSecret: paymentIntent.clientSecret,
      merchantDisplayName: 'Udar Edge',
      currency: 'EUR'
    });

    return await Stripe.presentPaymentSheet();
  }
}
```

**Configuración:**
```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

#### **Redsys** (Bancos Españoles)
**Para:** TPV Virtual español  
**Precio:** Según banco, ~0.5-1.5%  
**Integración:** Requiere backend

```typescript
// /services/redsys.service.ts
export class RedsysService {
  async crearPedido(amount: number, orderId: string) {
    const params = {
      Ds_Merchant_Amount: (amount * 100).toString(),
      Ds_Merchant_Order: orderId,
      Ds_Merchant_MerchantCode: process.env.REDSYS_MERCHANT_CODE,
      Ds_Merchant_Currency: '978', // EUR
      Ds_Merchant_TransactionType: '0',
      Ds_Merchant_Terminal: '1',
      Ds_Merchant_MerchantURL: 'https://api.miapp.com/redsys/callback'
    };
    
    // Firmar con SHA256
    const signature = this.generarFirma(params);
    
    return {
      params,
      signature
    };
  }
}
```

---

### **2. NOTIFICACIONES** 📱

#### **Firebase Cloud Messaging (FCM)** ✅ (YA CONFIGURADO)
**Archivo:** `/services/push-notifications.service.ts`  
**Estado:** ✅ Implementado

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Ya funciona:
await PushNotifications.register();
```

#### **OneSignal** (Alternativa)
**Ventaja:** Dashboard avanzado, segmentación  
**Precio:** Gratis hasta 10k usuarios

```bash
npm install onesignal-cordova-plugin
npm install @awesome-cordova-plugins/onesignal
```

```typescript
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';

export class OneSignalService {
  inicializar() {
    OneSignal.startInit(
      'YOUR_ONESIGNAL_APP_ID',
      'YOUR_FCM_PROJECT_ID'
    );
    
    OneSignal.inFocusDisplaying(
      OneSignal.OSInFocusDisplayOption.Notification
    );
    
    OneSignal.handleNotificationReceived().subscribe(data => {
      console.log('Notificación recibida:', data);
    });
    
    OneSignal.endInit();
  }
}
```

---

### **3. SMS Y LLAMADAS** 📞

#### **Twilio**
**Para:** SMS, WhatsApp, llamadas  
**Precio:** ~0.05€ por SMS

```typescript
// Backend: /api/send-sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function enviarSMS(to: string, message: string) {
  const result = await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
  
  return result;
}
```

**Frontend:**
```typescript
// /services/sms.service.ts
export class SMSService {
  async enviarNotificacion(telefono: string, mensaje: string) {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: telefono, message: mensaje })
    });
    
    return response.json();
  }
}
```

---

### **4. EMAIL** 📧

#### **SendGrid**
**Precio:** Gratis hasta 100 emails/día  
**Para:** Emails transaccionales

```typescript
// Backend: /api/send-email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function enviarEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const msg = {
    to: params.to,
    from: 'noreply@udar-edge.com',
    subject: params.subject,
    html: params.html
  };
  
  await sgMail.send(msg);
}
```

**Templates disponibles:**
- Bienvenida
- Confirmación pedido
- Recordatorio cita
- Factura
- Recuperar contraseña

---

### **5. MAPAS Y GEOLOCALIZACIÓN** 🗺️

#### **Google Maps API**
**Para:** Mapas, rutas, geocoding  
**Precio:** $200 crédito mensual gratuito

```typescript
// /services/maps.service.ts
import { Geolocation } from '@capacitor/geolocation';

export class MapsService {
  async obtenerUbicacionActual() {
    const coordinates = await Geolocation.getCurrentPosition();
    return {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude
    };
  }

  async calcularRuta(origen: string, destino: string) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origen}&destination=${destino}&key=${apiKey}`;
    
    const response = await fetch(url);
    return response.json();
  }

  async geocodificar(direccion: string) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${direccion}&key=${apiKey}`;
    
    const response = await fetch(url);
    return response.json();
  }
}
```

**Componente React:**
```typescript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export function MapaUbicacion({ lat, lng }: { lat: number; lng: number }) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={{ lat, lng }}
        zoom={15}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </LoadScript>
  );
}
```

---

### **6. CONTABILIDAD** 💼

#### **Holded API**
**Para:** Facturación, contabilidad  
**Precio:** Según plan Holded

```typescript
// /services/holded.service.ts
export class HoldedService {
  private apiKey = process.env.HOLDED_API_KEY;
  private baseUrl = 'https://api.holded.com/api';

  async crearFactura(factura: {
    cliente_id: string;
    items: Array<{
      descripcion: string;
      cantidad: number;
      precio: number;
    }>;
  }) {
    const response = await fetch(`${this.baseUrl}/invoicing/v1/documents/invoice`, {
      method: 'POST',
      headers: {
        'Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactId: factura.cliente_id,
        items: factura.items.map(item => ({
          desc: item.descripcion,
          units: item.cantidad,
          price: item.precio
        }))
      })
    });
    
    return response.json();
  }

  async obtenerCliente(email: string) {
    const response = await fetch(
      `${this.baseUrl}/contacts?email=${email}`,
      { headers: { 'Key': this.apiKey } }
    );
    return response.json();
  }
}
```

---

### **7. ALMACENAMIENTO DE ARCHIVOS** 📁

#### **Cloudinary**
**Para:** Imágenes, videos  
**Precio:** Gratis hasta 25GB

```typescript
// /services/cloudinary.service.ts
export class CloudinaryService {
  private cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  private uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  async subirImagen(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    return data.secure_url;
  }
}
```

---

### **8. ANALYTICS** 📊

#### **Google Analytics 4**
```typescript
// /services/analytics.service.ts (YA EXISTE)
// Mejorar con eventos específicos

export class AnalyticsService {
  trackPedido(orderId: string, total: number) {
    gtag('event', 'purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'EUR'
    });
  }

  trackProductoVisto(productId: string, productName: string) {
    gtag('event', 'view_item', {
      items: [{
        item_id: productId,
        item_name: productName
      }]
    });
  }
}
```

---

## 🔐 GESTIÓN DE API KEYS

### **Variables de Entorno**
```env
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+34xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx

# Google
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaxxx
GOOGLE_ANALYTICS_ID=G-xxx

# Holded
HOLDED_API_KEY=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_UPLOAD_PRESET=xxx

# OneSignal (opcional)
ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx
```

### **Seguridad**
```typescript
// /lib/api-keys.ts
export const getApiKey = (service: string) => {
  // NUNCA exponer keys del servidor en el cliente
  const serverKeys = [
    'STRIPE_SECRET_KEY',
    'SUPABASE_SERVICE_KEY',
    'TWILIO_AUTH_TOKEN',
    'SENDGRID_API_KEY',
    'HOLDED_API_KEY'
  ];

  if (typeof window !== 'undefined' && serverKeys.includes(service)) {
    throw new Error(`API key ${service} no disponible en cliente`);
  }

  return process.env[service];
};
```

---

## 📱 CAPACITOR PLUGINS NECESARIOS

```json
{
  "dependencies": {
    "@capacitor/app": "^5.0.0",
    "@capacitor/camera": "^5.0.0",
    "@capacitor/geolocation": "^5.0.0",
    "@capacitor/push-notifications": "^5.0.0",
    "@capacitor/share": "^5.0.0",
    "@capacitor/haptics": "^5.0.0",
    "@capacitor/network": "^5.0.0",
    "@capacitor/filesystem": "^5.0.0",
    "@capacitor-community/stripe": "^5.0.0",
    "@capacitor-community/barcode-scanner": "^4.0.0"
  }
}
```

---

## 🔄 FLUJO DE INTEGRACIÓN

### **1. Configurar Backend (Supabase Edge Functions)**
```typescript
// supabase/functions/create-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.1.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

serve(async (req) => {
  const { amount } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'eur',
  });
  
  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### **2. Llamar desde App**
```typescript
// /services/api.service.ts
export class ApiService {
  private supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  async crearPago(amount: number) {
    const response = await fetch(
      `${this.supabaseUrl}/functions/v1/create-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getToken()}`
        },
        body: JSON.stringify({ amount })
      }
    );
    
    return response.json();
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Esenciales para APK** ⚡
- [x] **Supabase** - Base de datos y auth (Preparado)
- [ ] **Stripe/Redsys** - Pagos
- [x] **FCM** - Notificaciones push (Implementado)
- [ ] **SendGrid** - Emails transaccionales
- [ ] **Google Maps** - Geolocalización

### **Opcionales pero Recomendados** ⭐
- [ ] **Twilio** - SMS y WhatsApp
- [ ] **Cloudinary** - Gestión imágenes
- [ ] **Holded** - Contabilidad
- [ ] **OneSignal** - Notificaciones avanzadas
- [ ] **Analytics** - Tracking mejorado

### **Future** 🚀
- [ ] **Mercado Pago** - Pagos LATAM
- [ ] **PayPal** - Pagos internacionales
- [ ] **Mailchimp** - Email marketing
- [ ] **Zapier** - Integraciones automáticas

---

## 📞 SOPORTE

Para cualquier API:
1. Revisar documentación oficial
2. Verificar límites de uso gratuito
3. Implementar rate limiting
4. Cachear respuestas cuando sea posible
5. Logs de errores
6. Fallbacks

---

**Estado actual:** 
✅ Supabase preparado  
✅ Push notifications implementado  
⏳ Pagos pendiente  
⏳ Emails pendiente  

**Próximo paso:** Implementar Stripe para pagos
