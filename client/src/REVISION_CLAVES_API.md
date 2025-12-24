# 🔑 REVISIÓN DE CLAVES API Y CONFIGURACIÓN DE SERVICIOS EXTERNOS

## 📋 RESUMEN EJECUTIVO

### ✅ SERVICIOS IMPLEMENTADOS (CON DATOS MOCK)

Todos los servicios externos están **completamente implementados en el frontend** con:
- ✅ Adaptadores funcionales completos
- ✅ Interfaces de configuración en UI
- ✅ Simulación de datos (localStorage)
- ❌ **NO hay claves API reales configuradas** (pendiente backend)

---

## 🎯 SERVICIOS EXTERNOS REVISADOS

### 1️⃣ **AGREGADORES DE DELIVERY Y PAGOS**

#### 📦 Ubicación de Implementación
- **Componente UI:** `/components/gerente/IntegracionesAgregadores.tsx`
- **Adaptadores:** `/services/aggregators/`
  - `glovo.adapter.ts`
  - `uber-eats.adapter.ts`
  - `justeat.adapter.ts`
  - `monei.adapter.ts`
- **Gestor central:** `/services/aggregators/index.ts`

#### 🔑 Claves API Necesarias

##### **GLOVO**
```typescript
credenciales: {
  apiKey: '',        // ❌ No configurada
  storeId: ''        // ❌ No configurada
}
config: {
  tiempoPreparacion: 15,
  radioEntrega: 5
}
comision: 25%
```

**Estado:** 
- ✅ Adaptador implementado
- ✅ UI de configuración disponible
- ❌ Sin credenciales reales
- ❌ Sin webhooks configurados

**Para activar:**
1. Obtener API Key en: https://developers.glovoapp.com/
2. Crear Store ID en panel de Glovo Partner
3. Configurar webhook: `https://tuapp.com/api/webhooks/glovo`
4. Añadir en variables de entorno:
   ```bash
   GLOVO_API_KEY=Bearer xxxxx
   GLOVO_STORE_ID=store-xxxxx
   ```

---

##### **UBER EATS**
```typescript
credenciales: {
  clientId: '',         // ❌ No configurada
  clientSecret: '',     // ❌ No configurada
  storeId: ''          // ❌ No configurada
}
config: {
  tiempoPreparacion: 15
}
comision: 30%
```

**Estado:** 
- ✅ Adaptador implementado
- ✅ UI de configuración disponible
- ❌ Sin credenciales reales
- ❌ Sin webhooks configurados

**Para activar:**
1. Registrarse en: https://developer.uber.com/
2. Crear aplicación OAuth
3. Obtener Client ID y Secret
4. Configurar webhook: `https://tuapp.com/api/webhooks/uber_eats`
5. Añadir en variables de entorno:
   ```bash
   UBER_EATS_CLIENT_ID=xxxxx
   UBER_EATS_CLIENT_SECRET=xxxxx
   UBER_EATS_STORE_ID=store-xxxxx
   ```

---

##### **JUST EAT**
```typescript
credenciales: {
  apiKey: '',          // ❌ No configurada
  restaurantId: ''     // ❌ No configurada
}
config: {
  tiempoPreparacion: 15
}
comision: 13%
```

**Estado:** 
- ✅ Adaptador implementado
- ✅ UI de configuración disponible
- ❌ Sin credenciales reales
- ❌ Sin webhooks configurados

**Para activar:**
1. Registrarse en: https://partner.just-eat.co.uk/
2. Solicitar acceso API
3. Obtener API Key
4. Configurar webhook: `https://tuapp.com/api/webhooks/justeat`
5. Añadir en variables de entorno:
   ```bash
   JUSTEAT_API_KEY=xxxxx
   JUSTEAT_RESTAURANT_ID=restaurant-xxxxx
   ```

---

##### **MONEI (Pagos)**
```typescript
credenciales: {
  apiKey: '',           // ❌ No configurada
  accountId: '',        // ❌ No configurada
  webhookSecret: ''     // ❌ No configurada
}
config: {
  currency: 'EUR',
  callbackUrl: 'https://miapp.com/webhooks/monei'
}
comision: 1.4%
```

**Estado:** 
- ✅ Adaptador implementado
- ✅ UI de configuración disponible
- ❌ Sin credenciales reales
- ❌ Sin webhooks configurados

**Para activar:**
1. Registrarse en: https://monei.com/
2. Crear cuenta de merchant
3. Obtener API Key desde dashboard
4. Configurar webhook: `https://tuapp.com/api/webhooks/monei`
5. Añadir en variables de entorno:
   ```bash
   MONEI_API_KEY=pk_xxxxx
   MONEI_ACCOUNT_ID=acc_xxxxx
   MONEI_WEBHOOK_SECRET=whsec_xxxxx
   ```

---

### 2️⃣ **VERIFACTU (AEAT)**

#### 📦 Ubicación de Implementación
- **Servicio:** `/services/verifactu.service.ts`
- **Tipos:** `/types/verifactu.types.ts`
- **Componentes UI:**
  - `/components/gerente/GestionVeriFactu.tsx`
  - `/components/gerente/GestionVeriFactuAvanzado.tsx`
  - `/components/cliente/MisFacturas.tsx`

#### 🔑 Configuración Actual

```typescript
const CONFIGURACION_DEFAULT: ConfiguracionVeriFactu = {
  nifEmpresa: 'B12345678',           // ⚠️ CAMBIAR por NIF real
  nombreSistemaInformatico: 'Udar Edge',
  versionSistema: '1.0.0',
  algoritmoHash: 'SHA-256',
  urlBase: 'https://verifactu.agenciatributaria.gob.es/verifactu',
  seriesPorDefecto: {
    normal: '2025',
    simplificada: 'S2025',
    rectificativa: 'R2025',
  },
  modoProduccion: false,             // ❌ MODO PRUEBAS
}
```

**Estado actual:**
- ✅ Generación de hash implementada
- ✅ Generación de QR implementada
- ✅ Encadenamiento de facturas
- ✅ Generación de XML
- ⚠️ **Modo producción:** DESACTIVADO
- ❌ **Certificado digital:** NO configurado
- ❌ **Envío real a AEAT:** SIMULADO

**Para activar en PRODUCCIÓN:**

1. **Obtener certificado digital**
   ```bash
   # Certificado de la empresa o representante legal
   # Desde: https://www.sede.fnmt.gob.es/
   ```

2. **Configurar NIF de empresa**
   ```typescript
   // En /services/verifactu.service.ts
   nifEmpresa: 'B12345678' // ← CAMBIAR por tu NIF real
   ```

3. **Activar modo producción**
   ```typescript
   // En el dashboard de Gestión VeriFactu
   modoProduccion: true
   ```

4. **Variables de entorno necesarias:**
   ```bash
   VERIFACTU_NIF_EMPRESA=B12345678
   VERIFACTU_CERTIFICADO_PATH=/path/to/cert.pfx
   VERIFACTU_CERTIFICADO_PASSWORD=xxxxx
   VERIFACTU_MODO_PRODUCCION=false  # true para producción
   ```

5. **Documentación oficial:**
   - https://sede.agenciatributaria.gob.es/Sede/verifactu.html
   - Ley 11/2021 (medidas antifraude)

---

### 3️⃣ **OAUTH Y AUTENTICACIÓN SOCIAL**

#### 🔑 Servicios Configurados

##### **GOOGLE OAuth**
```bash
VITE_GOOGLE_CLIENT_ID=           # ❌ No configurada
```

**Para activar:**
1. Ir a: https://console.cloud.google.com/
2. Crear proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Añadir URIs autorizadas:
   ```
   http://localhost:5173
   https://tuapp.com
   ```
6. Añadir en `.env`:
   ```bash
   VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   ```

---

##### **FACEBOOK Login**
```bash
VITE_FACEBOOK_APP_ID=            # ❌ No configurada
```

**Para activar:**
1. Ir a: https://developers.facebook.com/
2. Crear aplicación
3. Añadir producto "Facebook Login"
4. Configurar URI de redirección
5. Añadir en `.env`:
   ```bash
   VITE_FACEBOOK_APP_ID=xxxxx
   ```

---

##### **APPLE Sign In**
```bash
VITE_APPLE_CLIENT_ID=            # ❌ No configurada
```

**Para activar:**
1. Ir a: https://developer.apple.com/
2. Crear Service ID
3. Configurar Sign In with Apple
4. Añadir en `.env`:
   ```bash
   VITE_APPLE_CLIENT_ID=com.udaredge.service
   ```

---

### 4️⃣ **PUSH NOTIFICATIONS (Firebase)**

#### 🔑 Configuración Actual

```bash
VITE_FIREBASE_API_KEY=           # ❌ No configurada
VITE_FIREBASE_PROJECT_ID=        # ❌ No configurada
```

**Estado:**
- ✅ Servicio implementado: `/services/push-notifications.service.ts`
- ✅ Service Worker configurado: `/public/service-worker.js`
- ⚠️ VAPID keys: Comentadas (TODO)
- ❌ Sin credenciales Firebase

**Para activar:**

1. **Crear proyecto Firebase:**
   - https://console.firebase.google.com/

2. **Habilitar Cloud Messaging:**
   - Project Settings → Cloud Messaging
   - Generar VAPID keys

3. **Descargar google-services.json:**
   - Para Android

4. **Configurar variables:**
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_PROJECT_ID=udar-edge
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_VAPID_KEY=BM4dG...
   ```

5. **Descomentar código en:**
   ```typescript
   // /services/push-notifications.service.ts línea 197
   // TODO: Configurar VAPID keys de Firebase
   ```

---

### 5️⃣ **MAKE.COM (Automatización)**

#### 🔑 Webhooks Configurables

```bash
MAKECOM_WEBHOOK_URL=             # ❌ No configurada
MAKECOM_API_KEY=                 # ❌ No configurada
```

**Eventos disponibles:**
- `FACTURA_GENERADA`
- `PEDIDO_COMPLETADO`
- `STOCK_BAJO`
- `CLIENTE_NUEVO`

**Para activar:**
1. Crear cuenta en: https://www.make.com/
2. Crear escenarios para cada evento
3. Obtener URL de webhook
4. Configurar en `/components/gerente/TestWebhooks.tsx`
5. Añadir en `.env`:
   ```bash
   MAKECOM_WEBHOOK_URL=https://hook.eu1.make.com/xxxxx
   MAKECOM_API_KEY=xxxxx
   ```

**Documentación completa:**
- Ver: `/EVENTOS_MAKECOM_AGENTES_EXTERNOS.md`

---

### 6️⃣ **EMAIL (SendGrid / SMTP)**

#### 🔑 Configuración Pendiente

```bash
SENDGRID_API_KEY=                # ❌ No configurada
EMAIL_FROM=noreply@udaredge.com
EMAIL_FROM_NAME=Udar Edge
```

**Para activar:**
1. Crear cuenta en: https://sendgrid.com/
2. Verificar dominio de email
3. Generar API Key
4. Añadir en `.env`:
   ```bash
   SENDGRID_API_KEY=SG.xxxxx
   EMAIL_FROM=noreply@tuempresa.com
   EMAIL_FROM_NAME=Tu Empresa
   ```

**Eventos de email:**
- Bienvenida de cliente
- Recuperación de contraseña
- Confirmación de pedido
- Facturas por email
- Invitaciones de empleados

---

### 7️⃣ **ALMACENAMIENTO (Cloudinary / S3)**

#### 🔑 Configuración Pendiente

```bash
CLOUDINARY_CLOUD_NAME=           # ❌ No configurada
CLOUDINARY_API_KEY=              # ❌ No configurada
CLOUDINARY_API_SECRET=           # ❌ No configurada
```

**Para activar:**
1. Crear cuenta en: https://cloudinary.com/
2. Obtener credenciales desde dashboard
3. Añadir en `.env`:
   ```bash
   CLOUDINARY_CLOUD_NAME=xxxxx
   CLOUDINARY_API_KEY=xxxxx
   CLOUDINARY_API_SECRET=xxxxx
   ```

**Uso previsto:**
- Fotos de productos
- Logos de empresas
- Documentación laboral
- Justificantes de gastos
- Avatares de usuarios

---

## 📊 RESUMEN GENERAL

### ✅ LO QUE YA FUNCIONA (MODO SIMULACIÓN)

| Servicio | Implementación | UI Config | Datos Mock | Backend Real |
|----------|---------------|-----------|------------|--------------|
| **Glovo** | ✅ | ✅ | ✅ | ❌ |
| **Uber Eats** | ✅ | ✅ | ✅ | ❌ |
| **Just Eat** | ✅ | ✅ | ✅ | ❌ |
| **Monei** | ✅ | ✅ | ✅ | ❌ |
| **VeriFactu** | ✅ | ✅ | ✅ (hash/QR) | ❌ (envío AEAT) |
| **OAuth Google** | ✅ | ✅ | ✅ | ❌ |
| **OAuth Facebook** | ✅ | ✅ | ✅ | ❌ |
| **OAuth Apple** | ✅ | ✅ | ✅ | ❌ |
| **Push Notifications** | ✅ | ✅ | ✅ | ❌ |
| **Make.com** | ✅ | ✅ | ✅ | ❌ |
| **SendGrid** | ⚠️ | ❌ | ❌ | ❌ |
| **Cloudinary** | ⚠️ | ❌ | ❌ | ❌ |

**Leyenda:**
- ✅ = Implementado y funcional
- ⚠️ = Parcialmente implementado
- ❌ = No implementado o sin credenciales

---

## 🎯 SIGUIENTE PASO: BACKEND

### Prioridad de Implementación

#### **🔴 CRÍTICO (Para MVP)**
1. **Supabase/PostgreSQL**
   - Base de datos principal
   - Autenticación de usuarios
   - RLS (Row Level Security)

2. **VeriFactu**
   - Certificado digital
   - Envío real a AEAT
   - Almacenamiento de hashes

3. **OAuth Social**
   - Google (más usado)
   - Facebook
   - Apple (iOS)

#### **🟡 IMPORTANTE (Para producción)**
4. **Agregadores de delivery**
   - Glovo (25% comisión)
   - Uber Eats (30% comisión)
   - Just Eat (13% comisión)

5. **Monei (Pagos)**
   - Pasarela de pagos
   - Webhooks de confirmación

6. **Firebase Push**
   - Notificaciones móviles
   - VAPID keys

#### **🟢 OPCIONAL (Para escalabilidad)**
7. **Make.com**
   - Automatizaciones avanzadas
   - Integraciones con terceros

8. **SendGrid**
   - Emails transaccionales
   - Marketing

9. **Cloudinary**
   - Almacenamiento de imágenes
   - CDN

---

## 📝 ARCHIVO .ENV COMPLETO SUGERIDO

```bash
# ============================================
# SUPABASE (OBLIGATORIO)
# ============================================
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# ============================================
# TENANT (OBLIGATORIO)
# ============================================
VITE_TENANT_SLUG=los-pecados
VITE_PLAN=profesional

# ============================================
# OAUTH (OPCIONAL - PERO RECOMENDADO)
# ============================================
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=xxxxx
VITE_APPLE_CLIENT_ID=com.udaredge.service

# ============================================
# FIREBASE PUSH (IMPORTANTE)
# ============================================
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=udar-edge
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_VAPID_KEY=BM4dG...

# ============================================
# AGREGADORES DE DELIVERY (CRÍTICO PARA TPV)
# ============================================
GLOVO_API_KEY=Bearer xxxxx
GLOVO_STORE_ID=store-xxxxx

UBER_EATS_CLIENT_ID=xxxxx
UBER_EATS_CLIENT_SECRET=xxxxx
UBER_EATS_STORE_ID=store-xxxxx

JUSTEAT_API_KEY=xxxxx
JUSTEAT_RESTAURANT_ID=restaurant-xxxxx

# ============================================
# PAGOS (CRÍTICO)
# ============================================
MONEI_API_KEY=pk_xxxxx
MONEI_ACCOUNT_ID=acc_xxxxx
MONEI_WEBHOOK_SECRET=whsec_xxxxx

# ============================================
# VERIFACTU (OBLIGATORIO EN ESPAÑA)
# ============================================
VERIFACTU_NIF_EMPRESA=B12345678
VERIFACTU_CERTIFICADO_PATH=/path/to/cert.pfx
VERIFACTU_CERTIFICADO_PASSWORD=xxxxx
VERIFACTU_MODO_PRODUCCION=false

# ============================================
# MAKE.COM (OPCIONAL)
# ============================================
MAKECOM_WEBHOOK_URL=https://hook.eu1.make.com/xxxxx
MAKECOM_API_KEY=xxxxx

# ============================================
# EMAIL (IMPORTANTE)
# ============================================
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@udaredge.com
EMAIL_FROM_NAME=Udar Edge

# ============================================
# ALMACENAMIENTO (OPCIONAL)
# ============================================
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# ============================================
# CONFIGURACIÓN ADICIONAL
# ============================================
NEXT_PUBLIC_API_URL=https://api.udaredge.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_WEBHOOK_BASE_URL=https://tuapp.com
```

---

## ✅ CHECKLIST DE ACTIVACIÓN

### Para Gerente/Administrador

```markdown
## CONFIGURACIÓN BÁSICA
- [ ] Crear proyecto Supabase
- [ ] Configurar OAuth providers
- [ ] Obtener certificado digital VeriFactu
- [ ] Configurar NIF de empresa

## AGREGADORES
- [ ] Registrarse en Glovo Partners
- [ ] Registrarse en Uber Eats
- [ ] Registrarse en Just Eat España
- [ ] Configurar webhooks de cada agregador

## PAGOS
- [ ] Crear cuenta Monei
- [ ] Verificar empresa en Monei
- [ ] Obtener API keys
- [ ] Configurar webhooks de pago

## NOTIFICACIONES
- [ ] Crear proyecto Firebase
- [ ] Habilitar Cloud Messaging
- [ ] Generar VAPID keys
- [ ] Configurar service worker

## EMAIL Y ALMACENAMIENTO
- [ ] Crear cuenta SendGrid
- [ ] Verificar dominio de email
- [ ] Crear cuenta Cloudinary (opcional)

## PRODUCCIÓN
- [ ] Configurar dominio propio
- [ ] Instalar certificado SSL
- [ ] Configurar variables de entorno
- [ ] Probar todos los webhooks
- [ ] Activar modo producción VeriFactu
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `/DEPLOYMENT_SUMMARY.md` - Guía de despliegue completa
- `/GUIA_INTEGRACION_API.md` - Integración con backend
- `/EVENTOS_MAKECOM_AGENTES_EXTERNOS.md` - Automatizaciones
- `/DOCUMENTACION_VERIFACTU.md` - Sistema de facturación AEAT
- `/README_BACKEND_AGREGADORES.md` - Implementación de agregadores
- `/GUIA_BACKEND_DEVELOPER.md` - Guía completa para desarrollador backend

---

## 🎓 CONCLUSIONES

### 🎯 Estado Actual
El frontend está **100% funcional** con datos mock. Todos los servicios externos tienen:
- ✅ Adaptadores implementados
- ✅ Interfaces de usuario completas
- ✅ Simulación de funcionalidad
- ✅ Gestión de errores
- ✅ Logs y debugging

### 🚀 Para Producción
Se necesita:
1. **Backend real** (Supabase o similar)
2. **Credenciales de API** de cada servicio
3. **Webhooks configurados** en cada plataforma
4. **Certificado digital** para VeriFactu
5. **Variables de entorno** correctamente configuradas

### 💡 Recomendación
Priorizar la implementación en este orden:
1. Supabase + OAuth (autenticación)
2. VeriFactu (obligatorio en España)
3. Agregadores de delivery (ingresos)
4. Monei (pagos)
5. Firebase Push (engagement)
6. Resto de servicios (según necesidad)

---

**Documento generado:** 28/11/2024  
**Versión:** 1.0  
**Autor:** Sistema Udar Edge
