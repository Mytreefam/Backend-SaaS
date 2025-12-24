# 🎯 PLAN DE ACCIÓN INMEDIATO - UDAR EDGE

**Fecha**: 3 de Diciembre 2025  
**Objetivo**: Preparar el sistema para integración backend SIN romper nada  
**Tiempo estimado**: 2-3 días (frontend) + 7-10 días (backend)

---

## 📋 RESUMEN EJECUTIVO

### ✅ LO QUE FUNCIONA (NO TOCAR)
1. ✅ Estructura de empresas/marcas/PDVs (`empresaConfig.ts`)
2. ✅ Sistema de pedidos y ventas (guarda contexto completo)
3. ✅ Módulo de Equipo/RRHH (filtros y segmentación perfectos)
4. ✅ TPV (guarda ventas con contexto)
5. ✅ Filtro jerárquico `FiltroContextoJerarquico`

### ⚠️ PROBLEMAS MENORES (ARREGLAR)
1. ⚠️ EBITDA usa filtros hardcodeados
2. ⚠️ Productos sin segmentación empresa/marca/pdv

### 🎯 PRIORIDAD
**BACKEND PRIMERO** - Los problemas del frontend se arreglan en 1-2 horas, pero el backend necesita 7-10 días.

---

## 🚀 FASE 1: PREPARACIÓN FRONTEND (2-3 DÍAS)

### DÍA 1: Configuración y Auditoría

#### ✅ TAREAS COMPLETADAS:
- [x] Auditoría completa de estructura de datos
- [x] Documentación de endpoints necesarios
- [x] Identificación de puntos de integración

#### 📝 PENDIENTE:
- [ ] Crear archivo de configuración API
- [ ] Marcar puntos de integración con comentarios

---

### DÍA 2: Correcciones Críticas

#### Tarea 1: Arreglar filtro EBITDA (30 min)

**Archivo**: `/components/gerente/CuentaResultados.tsx`

**Cambios**:
```typescript
// LÍNEA ~4: Cambiar import
// ANTES:
import { FiltroEstandarGerente } from './FiltroEstandarGerente';

// DESPUÉS:
import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';

// LÍNEA ~77-78: Cambiar estado
// ANTES:
const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('Todas las tiendas');

// DESPUÉS:
const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);

// LÍNEA ~89-98: ELIMINAR array hardcodeado
// ELIMINAR ESTO:
const tiendas = [
  'Todas las tiendas',
  'Can Farines Centro',
  // ...
];

// En el JSX (buscar <FiltroEstandarGerente />):
// REEMPLAZAR por:
<FiltroContextoJerarquico
  selectedContext={selectedContext}
  onChange={setSelectedContext}
/>
```

---

#### Tarea 2: Crear configuración de API (15 min)

**Crear archivo**: `/config/api.config.ts`

```typescript
/**
 * 🔧 CONFIGURACIÓN DE API - UDAR EDGE
 * 
 * Centraliza todas las URLs de endpoints del backend.
 * Cambiar NEXT_PUBLIC_API_URL en .env.local para apuntar al backend real.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  
  // ============================================
  // PRODUCTOS
  // ============================================
  PRODUCTOS: `${API_BASE_URL}/productos`,
  PRODUCTO_BY_ID: (id: string) => `${API_BASE_URL}/productos/${id}`,
  
  // ============================================
  // PEDIDOS/VENTAS
  // ============================================
  PEDIDOS: `${API_BASE_URL}/pedidos`,
  PEDIDO_BY_ID: (id: string) => `${API_BASE_URL}/pedidos/${id}`,
  ACTUALIZAR_ESTADO_PEDIDO: (id: string) => `${API_BASE_URL}/pedidos/${id}/estado`,
  
  // ============================================
  // TRABAJADORES
  // ============================================
  TRABAJADORES: `${API_BASE_URL}/trabajadores`,
  TRABAJADOR_BY_ID: (id: string) => `${API_BASE_URL}/trabajadores/${id}`,
  FICHAJES: `${API_BASE_URL}/fichajes`,
  
  // ============================================
  // REPORTES
  // ============================================
  REPORTES_VENTAS: `${API_BASE_URL}/reportes/ventas`,
  REPORTES_EBITDA: `${API_BASE_URL}/reportes/ebitda`,
  REPORTES_CIERRES: `${API_BASE_URL}/reportes/cierres`,
  
  // ============================================
  // STOCK
  // ============================================
  STOCK: `${API_BASE_URL}/stock`,
  MOVIMIENTOS_STOCK: `${API_BASE_URL}/stock/movimientos`,
  
  // ============================================
  // PROVEEDORES
  // ============================================
  PROVEEDORES: `${API_BASE_URL}/proveedores`,
  PEDIDOS_PROVEEDORES: `${API_BASE_URL}/pedidos-proveedores`,
};

export default API_BASE_URL;
```

**Crear archivo**: `/.env.local`

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Modo de desarrollo (usa localStorage como fallback)
NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

#### Tarea 3: Marcar puntos de integración (1 hora)

**Objetivo**: Marcar con comentarios `// TODO BACKEND:` todos los lugares donde se debe conectar la API.

**Archivos a marcar**:

1. `/services/pedidos.service.ts`:
```typescript
export async function crearPedido(pedido: Pedido): Promise<Pedido> {
  // TODO BACKEND: Reemplazar localStorage por llamada a API
  // const response = await fetch(API_ENDPOINTS.PEDIDOS, {...});
  
  const pedidos = JSON.parse(localStorage.getItem('udar_pedidos') || '[]');
  // ...
}
```

2. `/services/reportes-multiempresa.service.ts`:
```typescript
export function obtenerResumenVentasPorPDV(...) {
  // TODO BACKEND: Llamar a GET /api/reportes/ventas?puntoVentaId=X
  
  const pedidos = JSON.parse(localStorage.getItem('udar_pedidos') || '[]');
  // ...
}
```

3. `/data/trabajadores.ts`:
```typescript
// TODO BACKEND: Convertir este array estático a función async
// export async function obtenerTrabajadores(filtros) { ... }

export const trabajadores: Trabajador[] = [
  // ...
];
```

---

### DÍA 3: Testing y Verificación

#### Checklist de verificación:
- [ ] EBITDA muestra filtro jerárquico correctamente
- [ ] Filtro jerárquico muestra: Empresas → Marcas → PDVs
- [ ] Los pedidos desde TPV siguen guardándose con contexto
- [ ] El módulo de Equipo sigue funcionando
- [ ] Todos los `// TODO BACKEND:` están marcados

---

## 🔧 FASE 2: BACKEND (7-10 DÍAS)

### SEMANA 1: MVP Funcional

#### Día 1-2: Setup inicial
- [ ] Crear proyecto Node.js + Express
- [ ] Configurar PostgreSQL (o MySQL/MongoDB)
- [ ] Crear esquema de base de datos
- [ ] Configurar variables de entorno

**Entregables**:
- Base de datos con tablas creadas
- Servidor Express corriendo en `localhost:3001`

---

#### Día 3-4: Autenticación
- [ ] Implementar `/api/auth/login`
- [ ] Implementar `/api/auth/me`
- [ ] Configurar JWT
- [ ] Middleware de autenticación

**Test**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

#### Día 5-6: Productos y Pedidos
- [ ] CRUD de productos
  - `GET /api/productos`
  - `POST /api/productos`
- [ ] CRUD de pedidos
  - `GET /api/pedidos`
  - `POST /api/pedidos`

**Test**:
```bash
# Obtener productos
curl -X GET "http://localhost:3001/api/productos?empresaId=EMP-001" \
  -H "Authorization: Bearer TOKEN"

# Crear pedido
curl -X POST http://localhost:3001/api/pedidos \
  -H "Authorization: Bearer TOKEN" \
  -d @pedido.json
```

---

#### Día 7: Integración Frontend
- [ ] Probar login desde frontend
- [ ] Probar obtener productos
- [ ] Probar crear pedido desde TPV

---

### SEMANA 2: Reportes y Ajustes

#### Día 8-9: Reportes
- [ ] `/api/reportes/ventas`
- [ ] `/api/reportes/ebitda`
- [ ] `/api/reportes/cierres`

#### Día 10: Testing completo
- [ ] Flujo completo: Login → Productos → Pedido → Reporte
- [ ] Ajustar errores
- [ ] Optimizar queries

---

## 📊 CRONOGRAMA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (2-3 días)                  │
├─────────────────────────────────────────────────────────┤
│ Día 1: Auditoría ✅ (COMPLETADO)                        │
│ Día 2: Correcciones (EBITDA + Config API)              │
│ Día 3: Testing y marcar TODOs                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   BACKEND (7-10 días)                   │
├─────────────────────────────────────────────────────────┤
│ Semana 1:                                               │
│   Día 1-2: Setup + BD ⚙️                                │
│   Día 3-4: Autenticación 🔐                             │
│   Día 5-6: Productos + Pedidos 📦                       │
│   Día 7: Integración con Frontend 🔌                    │
│                                                         │
│ Semana 2:                                               │
│   Día 8-9: Reportes 📊                                  │
│   Día 10: Testing y ajustes ✅                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 DECISIONES CLAVE

### ¿Frontend o Backend primero?

**RECOMENDACIÓN: BACKEND PRIMERO** ✅

**Razones**:
1. El frontend ya funciona al 90% con mocks
2. Las correcciones del frontend son mínimas (1-2 horas)
3. El backend necesita 7-10 días
4. Mientras el backend se desarrolla, el frontend sigue funcionando

---

### ¿Qué NO tocar?

❌ **NO TOCAR**:
- `Dashboard360.tsx` (excepto EBITDA)
- `FiltroContextoJerarquico.tsx`
- `empresaConfig.ts`
- Sistema de pedidos (`pedidos.service.ts`)
- Módulo de Equipo (`EquipoRRHH.tsx`)

✅ **SÍ MODIFICAR**:
- `CuentaResultados.tsx` (cambiar filtro)
- Crear `api.config.ts`
- Marcar TODOs en servicios

---

## 📝 NOTAS PARA EL PROGRAMADOR BACKEND

### Datos iniciales para la BD

**Empresas**:
```sql
INSERT INTO empresas (id, codigo, nombre_fiscal, nombre_comercial, nif) VALUES
('EMP-001', 'EMP001', 'Disarmink S.L.', 'Disarmink', 'B12345678');
```

**Marcas**:
```sql
INSERT INTO marcas (id, codigo, nombre, empresa_id, color_identidad) VALUES
('MRC-001', 'MOD', 'Modomio', 'EMP-001', '#FF5722'),
('MRC-002', 'BBQ', 'Blackburguer', 'EMP-001', '#000000');
```

**Puntos de Venta**:
```sql
INSERT INTO puntos_venta (id, codigo, nombre, empresa_id, direccion) VALUES
('PDV-TIANA', 'TIA', 'Tiana', 'EMP-001', 'Carrer Major, 123, Tiana'),
('PDV-BADALONA', 'BAD', 'Badalona', 'EMP-001', 'Av. Martí Pujol, 456, Badalona');
```

**Relación PDV-Marcas**:
```sql
INSERT INTO puntos_venta_marcas (punto_venta_id, marca_id) VALUES
('PDV-TIANA', 'MRC-001'),
('PDV-TIANA', 'MRC-002'),
('PDV-BADALONA', 'MRC-001'),
('PDV-BADALONA', 'MRC-002');
```

---

## ✅ ENTREGABLES FINALES

### Frontend:
- [ ] `AUDITORIA-ESTRUCTURA-DATOS.md` ✅
- [ ] `BACKEND-INTEGRATION-GUIDE.md` ✅
- [ ] `PLAN-ACCION-INMEDIATO.md` ✅
- [ ] `/config/api.config.ts` (a crear)
- [ ] Corrección de EBITDA (a implementar)

### Backend:
- [ ] Base de datos con esquema completo
- [ ] Endpoints de autenticación
- [ ] CRUD de productos
- [ ] CRUD de pedidos
- [ ] Endpoints de reportes

---

## 🎉 OBJETIVO FINAL

**En 10 días** (2 frontend + 7-10 backend):
1. ✅ Frontend corregido y listo
2. ✅ Backend funcional con MVP
3. ✅ Integración completa
4. ✅ Flujo end-to-end: Login → Ver productos → Crear pedido → Ver reportes

---

## 📞 CONTACTO Y DUDAS

Si tienes dudas sobre:
- **Estructura de datos**: Revisa `AUDITORIA-ESTRUCTURA-DATOS.md`
- **Endpoints**: Revisa `BACKEND-INTEGRATION-GUIDE.md`
- **Implementación**: Este archivo (`PLAN-ACCION-INMEDIATO.md`)

---

**¿Empezamos? 🚀**
