# 🚀 BIENVENIDO AL PROYECTO UDAR EDGE - GUÍA DE INICIO PARA BACKEND

**Versión:** 1.0.0  
**Fecha:** 27 Noviembre 2025  
**Estado del Frontend:** ✅ 100% Completado

---

## 👋 ¡HOLA DESARROLLADOR DE BACKEND!

Bienvenido al proyecto **Udar Edge**, una aplicación SaaS multiempresa para digitalizar negocios de hostelería.

Este README te guiará paso a paso para entender el proyecto y comenzar a trabajar de manera efectiva.

---

## 📚 PASO 1: LEE ESTOS DOCUMENTOS EN ORDEN

### **🎯 DOCUMENTOS OBLIGATORIOS (Leer primero)**

#### **1. GUÍA PRINCIPAL PARA BACKEND** 📖
**Archivo:** `/GUIA_BACKEND_DEVELOPER.md`

**Contenido:**
- Arquitectura completa del proyecto
- Todas las entidades y modelos de datos
- Todos los endpoints API necesarios (con ejemplos)
- Sistema de autenticación JWT
- WebSockets para tiempo real
- Integración con Make.com
- Variables de entorno
- Testing y despliegue

⏱️ **Tiempo de lectura:** 45-60 minutos  
⭐ **Importancia:** CRÍTICA

---

#### **2. AMARRE GLOBAL - REGLA DE ORO** 🔐
**Archivo:** `/AMARRE_GLOBAL_UDAR_DELIVERY360.md`

**Contenido:**
- Regla obligatoria: Todas las entidades incluyen `EmpresaId`, `MarcaId`, `PuntoVentaId`
- Ejemplos de queries correctas
- Errores comunes a evitar
- Estructura jerárquica

⏱️ **Tiempo de lectura:** 15 minutos  
⭐ **Importancia:** CRÍTICA

**⚠️ REGLA DE ORO:**
```sql
-- ❌ MAL - Query sin filtro
SELECT * FROM Pedidos;

-- ✅ BIEN - Query con AMARRE GLOBAL
SELECT * FROM Pedidos 
WHERE EmpresaId = ? 
  AND MarcaId = ? 
  AND PuntoVentaId = ?;
```

---

#### **3. CHECKLIST DE FUNCIONALIDADES** ✅
**Archivo:** `/CHECKLIST_FUNCIONALIDADES_FRONTEND.md`

**Contenido:**
- Todas las funcionalidades implementadas en el frontend
- Dónde encontrar cada componente
- Qué datos mock hay que reemplazar con API
- Puntos de integración específicos

⏱️ **Tiempo de lectura:** 30 minutos  
⭐ **Importancia:** ALTA

---

### **📘 DOCUMENTOS DE REFERENCIA (Consultar cuando sea necesario)**

#### **4. Arquitectura Multiempresa**
**Archivo:** `/ARQUITECTURA_MULTIEMPRESA_SAAS.md`
- Jerarquía: Cliente → Empresa → Marca → Punto de Venta
- Casos de uso
- Ejemplos reales

#### **5. Sistema de Permisos de Empleado**
**Archivo:** `/SISTEMA_PERMISOS_EMPLEADO.md`
- Flujo completo de permisos
- Estados y transiciones
- Documentación y OCR

#### **6. Sistema de Filtro Universal**
**Archivo:** `/SISTEMA_FILTRO_UNIVERSAL_UDAR.md`
- Cómo funciona el filtro jerárquico
- Context de React
- Persistencia en localStorage

#### **7. Auditoría de Duplicidades**
**Archivo:** `/AUDITORIA_DUPLICIDADES_CODIGO.md`
- Qué duplicidades había
- Qué se eliminó
- Qué queda por refactorizar (opcional)

---

### **🗄️ SCHEMAS DE BASE DE DATOS**

#### **8. Schema Completo TPV360**
**Archivo:** `/docs/DATABASE_SCHEMA_TPV360.sql`
- Script SQL completo
- Todas las tablas con relaciones
- Índices y constraints

#### **9. Schema Datos Cliente**
**Archivo:** `/docs/DATABASE_SCHEMA_DATOS_CLIENTE.sql`
- Tablas de clientes
- Vehículos y documentación

---

### **🔗 AUTOMATIZACIONES MAKE.COM**

#### **10. Automatizaciones TPV360**
**Archivo:** `/docs/MAKE_AUTOMATION_TPV360.md`
- Webhooks configurados
- Eventos que disparan automatizaciones
- Payloads de ejemplo

#### **11. Automatizaciones Datos Cliente**
**Archivo:** `/docs/MAKE_AUTOMATION_DATOS_CLIENTE.md`
- Notificaciones automáticas
- Integraciones con terceros

---

## 🎯 PASO 2: ESTRUCTURA DEL PROYECTO

```
/
├── components/                 # ⚛️ COMPONENTES REACT (NO TOCAR - ya está completo)
│   ├── cliente/               # Perfil Cliente
│   ├── trabajador/            # Perfil Trabajador/Colaborador
│   ├── gerente/               # Perfil Gerente
│   ├── filtros/               # Sistema de filtros
│   ├── navigation/            # Navegación y menús
│   └── ui/                    # Componentes UI (shadcn)
│
├── data/                      # 📊 DATOS MOCK - REEMPLAZAR CON TU API
│   ├── productos-cafe.ts      # → Endpoint: GET /api/productos?categoria=cafe
│   ├── productos-cafeteria.ts # → Endpoint: GET /api/productos?categoria=cafeteria
│   ├── productos-panaderia.ts # → Endpoint: GET /api/productos?categoria=panaderia
│   └── productos-personalizables.ts
│
├── docs/                      # 📚 DOCUMENTACIÓN TÉCNICA
│   ├── DATABASE_SCHEMA_TPV360.sql         # ⭐ Schema completo de BD
│   ├── DATABASE_SCHEMA_DATOS_CLIENTE.sql
│   ├── MAKE_AUTOMATION_TPV360.md
│   └── MAKE_AUTOMATION_DATOS_CLIENTE.md
│
├── types/                     # 📝 TIPOS TYPESCRIPT
│   └── operaciones-caja.ts
│
├── contexts/                  # 🌐 CONTEXTS DE REACT
│   └── FiltroUniversalContext.tsx
│
├── GUIA_BACKEND_DEVELOPER.md           # 🎯 TU GUÍA PRINCIPAL
├── CHECKLIST_FUNCIONALIDADES_FRONTEND.md
├── AMARRE_GLOBAL_UDAR_DELIVERY360.md   # ⚠️ REGLA CRÍTICA
├── ARQUITECTURA_MULTIEMPRESA_SAAS.md
├── SISTEMA_PERMISOS_EMPLEADO.md
├── SISTEMA_FILTRO_UNIVERSAL_UDAR.md
└── README_PARA_BACKEND.md              # 👈 ESTÁS AQUÍ
```

---

## 🚀 PASO 3: PLAN DE TRABAJO RECOMENDADO

### **Semana 1: Setup y Autenticación**

#### **Día 1-2: Setup inicial**
- [ ] Leer documentación completa
- [ ] Configurar entorno de desarrollo (Node.js, DB, etc.)
- [ ] Crear estructura del proyecto backend
- [ ] Configurar variables de entorno

#### **Día 3-4: Base de datos**
- [ ] Ejecutar scripts SQL de `/docs/DATABASE_SCHEMA_TPV360.sql`
- [ ] Verificar que todas las tablas tienen EmpresaId, MarcaId, PuntoVentaId
- [ ] Crear seeds con datos de ejemplo
- [ ] Probar conexión a BD

#### **Día 5: Autenticación**
- [ ] Implementar POST /auth/register
- [ ] Implementar POST /auth/login
- [ ] Implementar JWT tokens
- [ ] Implementar refresh tokens
- [ ] Probar con Postman

---

### **Semana 2: Estructura Multiempresa**

#### **Día 1-2: Empresas, Marcas, Puntos de Venta**
- [ ] Implementar CRUD de Empresas
- [ ] Implementar CRUD de Marcas
- [ ] Implementar CRUD de Puntos de Venta
- [ ] Validar AMARRE GLOBAL en todas las queries

#### **Día 3-4: Usuarios y Permisos**
- [ ] Implementar gestión de usuarios
- [ ] Implementar middleware de autorización por rol
- [ ] Validar que solo puede acceder a sus empresas

#### **Día 5: Testing**
- [ ] Tests de endpoints de empresas
- [ ] Tests de AMARRE GLOBAL
- [ ] Tests de autorización

---

### **Semana 3: Productos y TPV**

#### **Día 1-2: Productos**
- [ ] Implementar GET /productos con filtros
- [ ] Implementar POST /productos
- [ ] Implementar PUT /productos/:id
- [ ] Implementar DELETE /productos/:id

#### **Día 3-4: Stock**
- [ ] Implementar movimientos de stock
- [ ] Implementar alertas de stock bajo
- [ ] Webhook a Make.com cuando stock < mínimo

#### **Día 5: Pedidos**
- [ ] Implementar POST /pedidos
- [ ] Implementar actualización de estado
- [ ] Webhook a Make.com para nuevo pedido

---

### **Semana 4: RRHH y Caja**

#### **Día 1-2: Empleados**
- [ ] Implementar CRUD de empleados
- [ ] Implementar fichajes
- [ ] Implementar permisos

#### **Día 3-4: Caja**
- [ ] Implementar apertura de caja
- [ ] Implementar operaciones (venta, retirada, arqueo)
- [ ] Implementar cierre de caja

#### **Día 5: Documentación**
- [ ] Implementar subida de archivos a S3
- [ ] Endpoints de gestión de documentos

---

### **Semana 5: Chat y Notificaciones**

#### **Día 1-2: Conversaciones y Mensajes**
- [ ] Implementar CRUD de conversaciones
- [ ] Implementar envío de mensajes
- [ ] Implementar lectura de mensajes

#### **Día 3-4: WebSockets**
- [ ] Configurar Socket.io
- [ ] Implementar salas por empresa/punto de venta
- [ ] Eventos en tiempo real

#### **Día 5: Notificaciones**
- [ ] Sistema de notificaciones
- [ ] Push notifications
- [ ] Email notifications

---

### **Semana 6: Reportes y Finalizaciones**

#### **Día 1-2: Reportes**
- [ ] GET /reportes/ventas
- [ ] GET /reportes/ebitda
- [ ] GET /reportes/stock
- [ ] GET /reportes/empleados

#### **Día 3-4: Integraciones**
- [ ] OAuth (Google, Facebook, Apple)
- [ ] Make.com webhooks completos
- [ ] SendGrid para emails
- [ ] Twilio para SMS

#### **Día 5: Testing final**
- [ ] Tests E2E
- [ ] Tests de integración
- [ ] Verificar coverage >80%

---

## 📝 PASO 4: ENDPOINTS PRIORITARIOS

### **🔴 PRIORIDAD CRÍTICA (Semana 1-2)**

```
POST /auth/login
POST /auth/register
GET  /users/me

GET  /empresas
POST /empresas
GET  /marcas
POST /marcas
GET  /puntos-venta
POST /puntos-venta
```

### **🟠 PRIORIDAD ALTA (Semana 3)**

```
GET  /productos
POST /productos
POST /productos/:id/stock/ajustar

GET  /pedidos
POST /pedidos
PUT  /pedidos/:id
```

### **🟡 PRIORIDAD MEDIA (Semana 4)**

```
GET  /empleados
POST /empleados
POST /fichajes/entrada
POST /fichajes/salida

POST /caja/apertura
POST /caja/cierre
GET  /caja/turno/:id
```

### **🟢 PRIORIDAD NORMAL (Semana 5-6)**

```
GET  /conversaciones
POST /conversaciones
POST /conversaciones/:id/mensajes

GET  /notificaciones
PUT  /notificaciones/:id/leer

GET  /reportes/ventas
GET  /reportes/ebitda
```

---

## 🔧 PASO 5: HERRAMIENTAS RECOMENDADAS

### **Backend Framework**
- **Node.js + Express** (más común)
- **NestJS** (TypeScript nativo, más estructurado)
- **Fastify** (más rápido)

### **Base de Datos**
- **PostgreSQL** ⭐ Recomendado
- **MySQL** (alternativa)
- **Supabase** (PostgreSQL gestionado con auth incluido)

### **ORM**
- **Prisma** ⭐ Recomendado (TypeScript first)
- **TypeORM**
- **Sequelize**

### **Autenticación**
- **Passport.js** (para OAuth)
- **jsonwebtoken** (para JWT)

### **Storage**
- **AWS S3** ⭐ Recomendado
- **Cloudinary** (alternativa)

### **WebSockets**
- **Socket.io** ⭐ Recomendado

### **Testing**
- **Jest** (unit tests)
- **Supertest** (integration tests)
- **Cypress** o **Playwright** (E2E)

### **Monitoring**
- **Sentry** (error tracking)
- **DataDog** o **New Relic** (APM)

---

## 📊 PASO 6: EJEMPLO DE IMPLEMENTACIÓN

### **Ejemplo: Endpoint de Productos con AMARRE GLOBAL**

```typescript
// routes/productos.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ProductosController } from '../controllers/productos.controller';

const router = Router();

// Middleware de autenticación en todas las rutas
router.use(authenticate);

// GET /api/productos
router.get('/', async (req, res) => {
  const { empresaId, marcaId, categoria, activo } = req.query;
  const userId = req.user.id;
  
  // ⚠️ VALIDAR AMARRE GLOBAL
  if (!empresaId) {
    return res.status(400).json({ 
      error: 'EmpresaId es obligatorio' 
    });
  }
  
  // ⚠️ VALIDAR que el usuario tiene acceso a esta empresa
  const tieneAcceso = await verificarAccesoEmpresa(userId, empresaId);
  if (!tieneAcceso) {
    return res.status(403).json({ 
      error: 'No tienes acceso a esta empresa' 
    });
  }
  
  // Query con AMARRE GLOBAL
  const productos = await prisma.producto.findMany({
    where: {
      EmpresaId: empresaId,
      MarcaId: marcaId || undefined,
      categoria: categoria || undefined,
      activo: activo === 'true' ? true : undefined,
    },
    include: {
      Marca: true,
    },
    orderBy: {
      nombre: 'asc',
    },
  });
  
  res.json({
    productos,
    total: productos.length,
  });
});

// POST /api/productos
router.post('/', async (req, res) => {
  const { empresaId, marcaId, nombre, precio, stock } = req.body;
  const userId = req.user.id;
  
  // Validar AMARRE GLOBAL
  if (!empresaId || !marcaId) {
    return res.status(400).json({ 
      error: 'EmpresaId y MarcaId son obligatorios' 
    });
  }
  
  // Validar acceso
  const tieneAcceso = await verificarAccesoEmpresa(userId, empresaId);
  if (!tieneAcceso) {
    return res.status(403).json({ 
      error: 'No tienes acceso a esta empresa' 
    });
  }
  
  // Crear producto
  const producto = await prisma.producto.create({
    data: {
      EmpresaId: empresaId,
      MarcaId: marcaId,
      nombre,
      precio,
      stock,
      sku: generarSKU(),
      activo: true,
    },
  });
  
  res.status(201).json({ producto });
});

export default router;
```

---

## ⚠️ ERRORES COMUNES A EVITAR

### **1. Olvidar el AMARRE GLOBAL**
```typescript
// ❌ MAL
const productos = await prisma.producto.findMany();

// ✅ BIEN
const productos = await prisma.producto.findMany({
  where: {
    EmpresaId: empresaId,
    MarcaId: marcaId,
  },
});
```

### **2. No validar acceso del usuario**
```typescript
// ❌ MAL
const empresa = await prisma.empresa.findUnique({
  where: { id: empresaId }
});

// ✅ BIEN
const empresa = await prisma.empresa.findFirst({
  where: { 
    id: empresaId,
    ClienteId: userId, // Solo sus empresas
  }
});
```

### **3. No usar transacciones para operaciones críticas**
```typescript
// ❌ MAL
await prisma.producto.update({ ... });
await prisma.movimientoStock.create({ ... });

// ✅ BIEN
await prisma.$transaction(async (tx) => {
  await tx.producto.update({ ... });
  await tx.movimientoStock.create({ ... });
});
```

---

## 🎓 PASO 7: RECURSOS ADICIONALES

### **Documentación de Librerías**
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/docs/v4/)
- [JWT](https://jwt.io/)

### **Tutoriales**
- [Building a REST API with Node.js](https://nodejs.org/en/docs/guides)
- [Authentication with JWT](https://jwt.io/introduction)
- [WebSockets with Socket.io](https://socket.io/get-started/chat)

---

## 📞 CONTACTO

### **¿Tienes dudas?**

1. **Revisa primero:** `/GUIA_BACKEND_DEVELOPER.md`
2. **Busca en:** Documentación específica del módulo
3. **Contacta:** [Email del equipo frontend]

---

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] He leído `/GUIA_BACKEND_DEVELOPER.md` completa
- [ ] He leído `/AMARRE_GLOBAL_UDAR_DELIVERY360.md`
- [ ] He revisado `/CHECKLIST_FUNCIONALIDADES_FRONTEND.md`
- [ ] He revisado el schema de BD en `/docs/DATABASE_SCHEMA_TPV360.sql`
- [ ] Tengo claro qué es el AMARRE GLOBAL y por qué es importante
- [ ] Tengo configurado mi entorno de desarrollo
- [ ] He creado la base de datos local
- [ ] Tengo Postman o Thunder Client listo para probar endpoints

---

## 🎉 ¡LISTO PARA EMPEZAR!

El frontend está **100% completado** y esperando tu API.

Todos los componentes ya saben qué datos necesitan y en qué formato.

Solo necesitas implementar los endpoints documentados en `/GUIA_BACKEND_DEVELOPER.md` y el frontend funcionará automáticamente.

**¡Mucha suerte con el desarrollo! 🚀**

---

**Próximo paso:** Abre `/GUIA_BACKEND_DEVELOPER.md` y empieza por la sección de **Autenticación**.

---

**Versión:** 1.0.0  
**Última actualización:** 27 Noviembre 2025
