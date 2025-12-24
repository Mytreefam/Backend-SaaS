# 📋 ESPECIFICACIONES DEL FLUJO - UDAR EDGE

## 🎯 PROPÓSITO DEL DOCUMENTO
Este documento define el flujo CORRECTO de la aplicación según las especificaciones del cliente.
**IMPORTANTE**: Este flujo debe respetarse cuando se implemente el backend real.

---

## 📱 FLUJO COMPLETO DE LA APLICACIÓN

### 1️⃣ SPLASH SCREEN (2 segundos)
- Logo de Udar Edge
- Animación de carga
- Inicialización de servicios

---

### 2️⃣ ONBOARDING - 4 SLIDES (Solo primera vez)

**Propósito**: Para que el cliente corporativo de Udar vea las pantallas corporativas de su negocio.

**Slides configurados**:
1. **"¿Quiénes somos?"**
   - Presentación de Udar Edge como plataforma SaaS
   - Icono: Building
   
2. **"Todo tu negocio en una sola app"**
   - TPV, pedidos, stock, fichaje, reportes
   - Icono: Smartphone
   
3. **"Trabaja desde cualquier lugar"**
   - Modo offline, sincronización, notificaciones
   - Icono: Globe
   
4. **"Aumenta tus ventas un 40%"**
   - Beneficios y call to action
   - Icono: TrendingUp

**Comportamiento**:
- Se muestra solo la primera vez
- Se guarda en `localStorage('hasSeenOnboarding')`
- Botón "Saltar" disponible
- Al terminar → Login/Registro

**Archivo**: `/components/mobile/Onboarding.tsx`
**Configuración**: `/config/white-label.config.ts`

---

### 3️⃣ LOGIN / REGISTRO

#### A) PANTALLA DE BIENVENIDA
- Iniciar Sesión
- Crear Cuenta
- Login Social (Google, Facebook, Apple)
- Biometría (Huella/Face ID)

#### B) REGISTRO - IMPORTANTE ⚠️

**Campos obligatorios**:
- Nombre completo
- Email
- Contraseña (mín. 8 caracteres)
- Teléfono

**Checkbox: "¿Tienes empresa?"**
- ✅ Si marca SÍ → Se muestran campos adicionales:
  - Nombre de la empresa
  - CIF/NIF
  - Dirección
  - Sector
  - Sitio web

**🚨 CORRECCIÓN CRÍTICA - ROL AL REGISTRARSE**:

❌ **INCORRECTO** (Actual en código):
```typescript
// Si tiene empresa → se le asigna rol "gerente" automáticamente
role: hasCompany ? 'gerente' : 'cliente'
```

✅ **CORRECTO** (A implementar con backend):
```typescript
// SIEMPRE se registra como "cliente"
// El dato "hasCompany" es SOLO para facturación
role: 'cliente'

// Datos adicionales:
hasCompany: true/false,
companyName: "...", // Para facturación a nombre de empresa
cif: "...",
// ... resto de datos empresariales
```

**Explicación**:
- Si marca "Tengo empresa" = **Cliente con empresa** (para facturación)
- NO significa que sea ADMIN/GERENTE
- Es solo para que las facturas se emitan a nombre de su empresa
- El rol de ADMIN se asigna desde el BACKEND, nunca desde el frontend

---

### 4️⃣ PERMISOS (Primera vez después de login)
- Notificaciones Push
- Ubicación (opcional)
- Cámara
- Almacenamiento

---

### 5️⃣ APP PRINCIPAL - 3 ROLES

---

## 👤 SISTEMA DE ROLES - DEFINICIÓN CORRECTA

### 🔴 ROL: ADMIN/GERENTE

**Cómo se asigna**:
- ❌ NO se asigna automáticamente desde el frontend
- ❌ NO se asigna por tener empresa
- ✅ **Solo se asigna desde el BACKEND**
- ✅ **Solo el PRIMER usuario** de toda la plataforma es ADMIN
- ✅ El ADMIN es asignado manualmente por Udar (equipo backend)

**Quién es el ADMIN**:
- El cliente corporativo que contrata Udar Edge para su negocio
- Ejemplo: Dueño de una cadena de restaurantes
- Es el "Super Usuario" de su instalación

**Permisos del ADMIN**:
- ✅ Acceso completo a Dashboard 360
- ✅ Crear/modificar empresas, marcas, puntos de venta
- ✅ **Crear trabajadores** y asignarles rol de "trabajador" o "gerente"
- ✅ Gestión de TPV 360
- ✅ Gestión de clientes y productos
- ✅ Gestión de equipo y RRHH
- ✅ Gestión de stock y proveedores
- ✅ Operativa completa
- ✅ Configuración avanzada (Cron Jobs, Zona Horaria, Verifactu)
- ✅ **Poder de "evolucionar"**: Puede cambiar roles de otros usuarios

**Funcionalidades**:
- Dashboard 360
- TPV 360 - Base
- Clientes y Productos
- Equipo y RRHH (crear trabajadores)
- Stock y Proveedores
- Operativa
- Chat y Soporte
- Documentación y Vehículos
- Notificaciones
- Configuración

---

### 🟢 ROL: CLIENTE

**Cómo se asigna**:
- ✅ Por defecto al registrarse en la app
- ✅ Todos los usuarios que se descargan la app son CLIENTES

**Tipos de clientes**:
1. **Cliente sin empresa**: Usuario particular
2. **Cliente con empresa**: Usuario que quiere facturas a nombre de su empresa
   - Tiene datos empresariales (CIF, razón social, etc.)
   - Solo para fines de facturación
   - NO tiene permisos de gestión

**Permisos del CLIENTE**:
- ✅ Ver productos disponibles
- ✅ Hacer pedidos
- ✅ Carrito de compras
- ✅ Historial de pedidos
- ✅ Chat con soporte
- ✅ Perfil y configuración básica
- ❌ NO puede crear empresas
- ❌ NO puede gestionar trabajadores
- ❌ NO puede acceder a configuración avanzada

---

### 🟡 ROL: TRABAJADOR/COLABORADOR

**Cómo se asigna**:
- ❌ NO se puede registrar desde la app
- ✅ Solo lo puede crear el ADMIN desde su panel
- ✅ El ADMIN lo invita por email/SMS
- ✅ El trabajador recibe invitación y activa su cuenta

**Permisos del TRABAJADOR**:
- ✅ Dashboard operativo
- ✅ Gestión de pedidos en tiempo real
- ✅ Chats organizados (Pedidos, Incidencias, RRHH)
- ✅ Fichajes y nóminas
- ✅ Configuración personal (Cuenta, Info, Documentación, Notificaciones, Privacidad)
- ❌ NO puede crear otros usuarios
- ❌ NO puede gestionar empresas/marcas/PDV
- ❌ NO tiene acceso a configuración avanzada

---

## 🔄 FLUJO DE CREACIÓN DE USUARIOS

### 1️⃣ PRIMER USUARIO (ADMIN)
```
Cliente contrata Udar Edge
    ↓
Udar crea cuenta y asigna rol "admin" desde BACKEND
    ↓
Cliente recibe credenciales
    ↓
Entra a la app → Ve todo el Dashboard 360 completo
```

### 2️⃣ USUARIOS NORMALES (CLIENTES)
```
Usuario descarga la app desde App Store/Google Play
    ↓
Ve Onboarding (4 slides corporativos del cliente de Udar)
    ↓
Se registra (con o sin empresa)
    ↓
Backend le asigna rol "cliente" automáticamente
    ↓
Entra a la app → Ve vista de Cliente (productos, pedidos, etc.)
```

### 3️⃣ TRABAJADORES
```
ADMIN entra a "Equipo y RRHH"
    ↓
Crea nuevo trabajador (nombre, email, rol, PDV asignado)
    ↓
Backend envía invitación por email/SMS
    ↓
Trabajador recibe link de activación
    ↓
Trabajador activa cuenta y crea contraseña
    ↓
Entra a la app → Ve vista de Trabajador
```

---

## 🔧 CAMBIO DE ROL - DESARROLLO vs PRODUCCIÓN

### EN DESARROLLO (Actual)
```typescript
// Función onCambiarRol existe para testing
const handleCambiarRol = (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => {
  setCurrentUser({ ...currentUser, role: nuevoRol });
};
```
- ✅ Útil para testing
- ✅ Permite probar las 3 vistas sin crear usuarios
- ⚠️ Solo para desarrollo

### EN PRODUCCIÓN (A implementar)
```typescript
// ❌ ELIMINAR la función onCambiarRol
// ✅ El cambio de rol se hace SOLO desde el backend
// ✅ Solo el ADMIN puede cambiar roles desde su panel

// Endpoint backend:
// POST /api/users/{userId}/change-role
// Body: { newRole: 'cliente' | 'trabajador' | 'gerente' }
// Authorization: Solo ADMIN
```

**Acción**:
- 🗑️ **Eliminar** `onCambiarRol` de todos los componentes
- 🗑️ **Eliminar** switches/botones de cambio de rol en configuración
- ✅ **Implementar** gestión de roles desde panel de ADMIN (backend)

---

## 📊 DIAGRAMA DE PERMISOS

```
┌─────────────────────────────────────────────────┐
│                    ADMIN                        │
│  (Primer usuario - Asignado por backend)        │
│                                                 │
│  ✅ TODO: Dashboard 360, TPV, RRHH, Config      │
│  ✅ Crear trabajadores                          │
│  ✅ Cambiar roles                               │
│  ✅ Gestión completa                            │
└─────────────────────────────────────────────────┘
              │
              ├───────────────┬───────────────┐
              ↓               ↓               ↓
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │  TRABAJADOR │  │  TRABAJADOR  │  │   CLIENTE    │
    │             │  │              │  │              │
    │  ✅ Pedidos │  │  ✅ Pedidos  │  │  ✅ Comprar  │
    │  ✅ Chats   │  │  ✅ Chats    │  │  ✅ Pedidos  │
    │  ✅ Fichaje │  │  ✅ Fichaje  │  │  ✅ Soporte  │
    │  ❌ Config  │  │  ❌ Config   │  │  ❌ Gestión  │
    └─────────────┘  └──────────────┘  └──────────────┘
         ↑                  ↑                  ↑
         │                  │                  │
    Creado por          Creado por         Registro
      ADMIN               ADMIN            automático
```

---

## 🚀 PRÓXIMOS PASOS - BACKEND

### 1. Sistema de Autenticación
```typescript
// Endpoint: POST /api/auth/register
{
  fullName: string;
  email: string;
  password: string;
  phone: string;
  hasCompany: boolean;
  companyName?: string; // Solo para facturación
  cif?: string;
  address?: string;
  sector?: string;
  website?: string;
}

// Respuesta:
{
  user: {
    id: string;
    name: string;
    email: string;
    role: 'cliente'; // SIEMPRE cliente al registrarse
    hasCompany: boolean;
    companyData?: {...}; // Si hasCompany = true
  },
  token: string;
  refreshToken: string;
}
```

### 2. Asignación de ADMIN
```sql
-- Solo el primer usuario tiene role = 'admin'
-- Se asigna manualmente desde backend

UPDATE users 
SET role = 'admin' 
WHERE id = '{primer_usuario_del_cliente}';
```

### 3. Creación de Trabajadores (Solo ADMIN)
```typescript
// Endpoint: POST /api/admin/workers
// Authorization: Solo ADMIN

{
  fullName: string;
  email: string;
  phone: string;
  role: 'trabajador' | 'gerente';
  assignedPDV: string;
  assignedMarca: string;
}

// Backend envía email de invitación
// Trabajador activa cuenta y crea contraseña
```

### 4. Cambio de Roles (Solo ADMIN)
```typescript
// Endpoint: POST /api/admin/users/{userId}/role
// Authorization: Solo ADMIN

{
  newRole: 'cliente' | 'trabajador' | 'gerente' | 'admin';
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend (Actual)
- [x] Onboarding 4 slides implementado
- [x] LoginViewMobile con registro
- [x] 3 dashboards (Cliente, Trabajador, Gerente)
- [x] Sistema de permisos
- [ ] ❌ **CORREGIR**: Quitar asignación automática de rol "gerente" si tiene empresa
- [ ] ❌ **ELIMINAR**: Función `onCambiarRol` para producción
- [ ] ✅ **AÑADIR**: Panel de gestión de usuarios en Dashboard Gerente

### Backend (Pendiente)
- [ ] Sistema de autenticación JWT
- [ ] Registro de usuarios (siempre como "cliente")
- [ ] Asignación manual de ADMIN
- [ ] Endpoints de creación de trabajadores
- [ ] Sistema de invitaciones por email/SMS
- [ ] Endpoints de cambio de rol (solo ADMIN)
- [ ] Middleware de verificación de permisos

---

## 📝 NOTAS IMPORTANTES

1. **NO confundir "tener empresa" con "ser admin"**:
   - Tener empresa = Datos para facturación
   - Ser admin = Rol de gestión asignado por backend

2. **El ADMIN no se "registra" como los demás**:
   - Es el primer usuario creado para el cliente corporativo
   - Se crea manualmente desde el backend de Udar
   - Recibe credenciales directamente

3. **Los trabajadores NO usan el registro normal**:
   - Solo se crean desde el panel del ADMIN
   - Reciben invitación por email/SMS
   - Activan cuenta con link único

4. **Cambio de rol en producción**:
   - Solo desde backend
   - Solo el ADMIN puede hacerlo
   - Nunca desde el frontend

---

## 🔒 SEGURIDAD

- Validar rol en CADA petición al backend
- Middleware de autorización por rol
- Tokens JWT con información de rol
- Refresh tokens para sesiones largas
- Logs de cambios de rol (auditoría)

---

**Fecha de creación**: 2025-12-01
**Última actualización**: 2025-12-01
**Estado**: Especificación aprobada - Pendiente implementación backend
