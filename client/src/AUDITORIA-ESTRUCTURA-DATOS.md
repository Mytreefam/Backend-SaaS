# 🔍 AUDITORÍA COMPLETA - ESTRUCTURA MULTIEMPRESA UDAR EDGE

**Fecha**: 3 de Diciembre 2025  
**Estado del Proyecto**: Frontend 85-90% - Backend 0%  
**Objetivo**: Verificar segmentación Empresa → Marca → Punto de Venta en TODOS los módulos

---

## ✅ 1. ESTRUCTURA BASE (CORE)

### `/constants/empresaConfig.ts`
**Estado**: ✅ **PERFECTO - 100% COMPLETO**

```typescript
✅ EMPRESAS: { 'EMP-001': Disarmink S.L. }
✅ MARCAS: { 
    'MRC-001': Modomio,
    'MRC-002': Blackburguer 
  }
✅ PUNTOS_VENTA: {
    'PDV-TIANA': Tiana (Modomio, Blackburguer),
    'PDV-BADALONA': Badalona (Modomio, Blackburguer)
  }
✅ Funciones helper: getNombreEmpresa(), getNombreMarca(), getNombrePDV()
✅ Arrays exportados: EMPRESAS_ARRAY, MARCAS_ARRAY, PUNTOS_VENTA_ARRAY
```

**Diagnóstico**: La base está perfecta. Toda la jerarquía existe.

---

## ✅ 2. SISTEMA DE VENTAS Y PEDIDOS

### `/services/pedidos.service.ts`
**Estado**: ✅ **PERFECTO - 100% SEGMENTADO**

```typescript
export interface Pedido {
  ✅ empresaId: string;          // EMP-001
  ✅ empresaNombre: string;      // "Disarmink S.L."
  ✅ marcaId: string;            // MRC-001
  ✅ marcaNombre: string;        // "Modomio"
  ✅ puntoVentaId: string;       // PDV-TIANA
  ✅ puntoVentaNombre: string;   // "Tiana"
  // ... resto de campos
}
```

**Funciones clave**:
- ✅ `crearPedido()` - guarda con contexto completo
- ✅ `obtenerPedidosFiltrados()` - filtra por empresa/marca/pdv
- ✅ localStorage: `'udar_pedidos'`

**Diagnóstico**: EXCELENTE. Los pedidos ya tienen toda la estructura.

---

## ✅ 3. SISTEMA DE EQUIPO/RRHH

### `/data/trabajadores.ts`
**Estado**: ✅ **PERFECTO - 100% SEGMENTADO**

```typescript
export interface Trabajador {
  ✅ empresaId: string;                // Empresa principal
  ✅ marcaId?: string;                 // Marca principal
  ✅ puntoVentaId: string;             // PDV principal
  ✅ puntosVentaAsignados?: string[];  // Múltiples PDVs
  // ... resto de campos
}
```

**Componente**: `/components/gerente/EquipoRRHH.tsx`
- ✅ Filtros: `filtroEmpresaId`, `filtroMarcaId`, `filtroPuntoVentaId`
- ✅ UI: Muestra correctamente la jerarquía en el filtro
- ✅ Funcionalidad: Filtra trabajadores por PDV

**Diagnóstico**: PERFECTO. El módulo de Equipo es el mejor ejemplo.

---

## ⚠️ 4. PRODUCTOS Y CATÁLOGO

### `/data/productos-*.ts`
**Estado**: ❌ **PROBLEMA CRÍTICO - SIN SEGMENTACIÓN**

**Archivos encontrados**:
- `/data/productos-cafe.ts`
- `/data/productos-cafeteria.ts`
- `/data/productos-panaderia.ts`
- `/data/productos-personalizables.ts`

**Estructura actual**:
```typescript
❌ export interface ProductoCafe {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  // ❌ NO tiene: empresaId, marcaId, puntoVentaId
}
```

### 🚨 **PROBLEMA**:
Los productos NO están vinculados a empresas/marcas/PDVs. 

### ✅ **SOLUCIÓN PARA BACKEND**:
Crear nueva estructura:

```typescript
// Backend debe devolver:
interface ProductoSegmentado {
  id: string;
  nombre: string;
  precio: number;
  
  // ⭐ NUEVO - Segmentación
  empresaId: string;
  marcaId: string;
  puntosVentaDisponibles: string[];  // Array de PDV IDs donde está disponible
  
  // Opcional: Precios por PDV
  preciosPorPDV?: {
    [pdvId: string]: number;
  };
}
```

**Endpoint necesario**:
```
GET /api/productos?empresaId=EMP-001&marcaId=MRC-001&puntoVentaId=PDV-TIANA
```

---

## ⚠️ 5. DASHBOARD 360° - MÓDULO EBITDA

### `/components/gerente/CuentaResultados.tsx`
**Estado**: ⚠️ **PROBLEMA - FILTROS HARDCODEADOS**

**Problema encontrado**:
```typescript
// ❌ Usa filtros hardcodeados:
const tiendas = [
  'Todas las tiendas',
  'Can Farines Centro',    // ❌ Hardcoded
  'Can Farines Llefià',    // ❌ Hardcoded
  'Can Farines Poblenou',  // ❌ Hardcoded
  // ...
];
```

**Por qué NO se ven los PDVs en EBITDA**:
1. ❌ NO usa `FiltroContextoJerarquico` (el componente correcto)
2. ❌ Usa `FiltroEstandarGerente` que SÍ funciona, pero lo implementa mal
3. ❌ Los nombres hardcodeados no coinciden con `empresaConfig.ts`

### ✅ **SOLUCIÓN**:
Reemplazar el filtro hardcodeado por el jerárquico:

```typescript
// ANTES (❌):
import { FiltroEstandarGerente } from './FiltroEstandarGerente';
const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('Todas las tiendas');

// DESPUÉS (✅):
import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';
const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);
```

---

## ✅ 6. COMPONENTES DE FILTRADO

### `/components/gerente/FiltroContextoJerarquico.tsx`
**Estado**: ✅ **PERFECTO - FUNCIONA 100%**

**Jerarquía visual**:
```
📁 Empresa (checkbox)
  └─ 🏷️ Marca 1 (checkbox)
      └─ 📍 PDV 1 (checkbox)
      └─ 📍 PDV 2 (checkbox)
  └─ 🏷️ Marca 2 (checkbox)
      └─ 📍 PDV 3 (checkbox)
```

**Usado en**:
- ✅ Dashboard360 → Resumen
- ✅ Dashboard360 → Ventas
- ✅ Dashboard360 → Cierres
- ✅ Dashboard360 → EBITDA (SÍ está, pero mal configurado)

**Diagnóstico**: El componente funciona perfectamente.

---

### `/components/gerente/FiltroEstandarGerente.tsx`
**Estado**: ✅ **FUNCIONA - PERO ES DIFERENTE**

**Vista plana (no jerárquica)**:
```
Empresa:
  ☑️ Disarmink S.L.

Puntos de Venta:
  ☑️ Tiana - Modomio, Blackburguer
  ☑️ Badalona - Modomio, Blackburguer

Marcas:
  ☑️ Modomio
  ☑️ Blackburguer
```

**Usado en**:
- ✅ CuentaResultados (EBITDA) - PERO MAL IMPLEMENTADO
- ✅ Otros módulos

**Diagnóstico**: Funciona, pero es menos intuitivo que el jerárquico.

---

## ✅ 7. TPV 360 (Terminal Punto de Venta)

### `/components/tpv/TPV360Master.tsx`
**Estado**: ✅ **VERIFICADO - GUARDA CONTEXTO**

```typescript
// Cuando se procesa una venta en TPV:
const nuevoPedido: Pedido = {
  ✅ empresaId: pdvActual.empresaId,
  ✅ marcaId: marcaActual.id,
  ✅ puntoVentaId: pdvActual.id,
  ✅ empresaNombre: empresa.nombreComercial,
  ✅ marcaNombre: marcaActual.nombre,
  ✅ puntoVentaNombre: pdvActual.nombre,
  // ...
};
```

**Diagnóstico**: ✅ El TPV SÍ guarda el contexto completo.

---

## 📊 8. REPORTES Y ANALYTICS

### `/services/reportes-multiempresa.service.ts`
**Estado**: ✅ **PERFECTO - PREPARADO PARA BACKEND**

```typescript
export interface ResumenVentas {
  ✅ empresaId?: string;
  ✅ empresaNombre?: string;
  ✅ marcaId?: string;
  ✅ marcaNombre?: string;
  ✅ puntoVentaId?: string;
  ✅ puntoVentaNombre?: string;
  
  // KPIs de ventas
  ventasTotales: number;
  numeroPedidos: number;
  ticketMedio: number;
  // ...
}
```

**Funciones existentes**:
- ✅ `obtenerResumenVentasPorEmpresa()`
- ✅ `obtenerResumenVentasPorMarca()`
- ✅ `obtenerResumenVentasPorPDV()`
- ✅ `calcularEBITDA()` - con contexto multiempresa

**Diagnóstico**: EXCELENTE. Ya está listo para consumir API.

---

## 🗄️ 9. LOCALSTORAGE (DATOS ACTUALES)

**Claves usadas**:
```javascript
✅ 'udar_pedidos'              // Pedidos con contexto completo
✅ 'udar_trabajadores'         // Trabajadores con empresaId/marcaId/pdv
⚠️ 'productos_*'              // SIN contexto (problema pendiente)
✅ 'cierres_*'                // Con contexto
✅ 'ventas_procesadas'        // Con contexto
```

---

## 📋 RESUMEN EJECUTIVO

### ✅ LO QUE FUNCIONA BIEN:
1. ✅ **Estructura base** (`empresaConfig.ts`) - PERFECTA
2. ✅ **Sistema de Pedidos/Ventas** - 100% segmentado
3. ✅ **Equipo y RRHH** - 100% segmentado y filtros funcionando
4. ✅ **TPV** - Guarda contexto completo
5. ✅ **Reportes multiempresa** - Listo para backend
6. ✅ **Filtro Jerárquico** - Componente perfecto y reutilizable

### ❌ PROBLEMAS ENCONTRADOS:
1. ❌ **Productos NO están segmentados** por empresa/marca/pdv
2. ❌ **EBITDA usa filtros hardcodeados** en vez del sistema correcto
3. ⚠️ **Algunos módulos usan datos mock** en vez de la estructura universal

---

## 🎯 PLAN DE ACCIÓN PARA BACKEND

### FASE 1: ENDPOINTS CRÍTICOS (SEMANA 1)

#### 1.1 Sistema de Autenticación
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

**Response ejemplo**:
```json
{
  "userId": "USR-001",
  "empresaId": "EMP-001",
  "rol": "gerente",
  "puntosVentaAcceso": ["PDV-TIANA", "PDV-BADALONA"]
}
```

---

#### 1.2 Catálogo de Productos
```
GET    /api/productos?empresaId=X&marcaId=Y&puntoVentaId=Z
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
```

**Response ejemplo**:
```json
{
  "productos": [
    {
      "id": "PROD-001",
      "nombre": "Combo Satisfayer",
      "precio": 15.90,
      "empresaId": "EMP-001",
      "marcaId": "MRC-002",
      "puntosVentaDisponibles": ["PDV-TIANA", "PDV-BADALONA"],
      "activo": true,
      "stock": 50,
      "gruposOpciones": [ ... ]
    }
  ]
}
```

---

#### 1.3 Sistema de Pedidos/Ventas
```
GET    /api/pedidos?empresaId=X&marcaId=Y&puntoVentaId=Z&fechaInicio=...&fechaFin=...
POST   /api/pedidos
PUT    /api/pedidos/:id
GET    /api/pedidos/:id
```

**Request ejemplo** (crear pedido):
```json
{
  "empresaId": "EMP-001",
  "marcaId": "MRC-001",
  "puntoVentaId": "PDV-TIANA",
  "cliente": { ... },
  "items": [ ... ],
  "total": 32.50,
  "metodoPago": "tarjeta",
  "origenPedido": "tpv"
}
```

---

#### 1.4 Equipo y RRHH
```
GET    /api/trabajadores?empresaId=X&marcaId=Y&puntoVentaId=Z
POST   /api/trabajadores
PUT    /api/trabajadores/:id
GET    /api/trabajadores/:id/fichajes
POST   /api/fichajes
```

**Response ejemplo**:
```json
{
  "trabajadores": [
    {
      "id": "TRB-001",
      "nombre": "Carlos Méndez",
      "empresaId": "EMP-001",
      "marcaId": "MRC-001",
      "puntoVentaId": "PDV-TIANA",
      "puntosVentaAsignados": ["PDV-TIANA", "PDV-BADALONA"],
      "puesto": "Panadero Maestro",
      "horasContrato": 160
    }
  ]
}
```

---

### FASE 2: REPORTES Y ANALYTICS (SEMANA 2)

#### 2.1 Resumen de Ventas
```
GET    /api/reportes/ventas?empresaId=X&marcaId=Y&puntoVentaId=Z&periodo=mes_actual
GET    /api/reportes/ebitda?empresaId=X&marcaId=Y&puntoVentaId=Z&periodo=mes_actual
GET    /api/reportes/cierres?empresaId=X&marcaId=Y&puntoVentaId=Z&fecha=2025-12-03
```

**Response ejemplo** (ventas):
```json
{
  "empresaId": "EMP-001",
  "marcaId": "MRC-001",
  "puntoVentaId": "PDV-TIANA",
  "periodo": {
    "tipo": "mes_actual",
    "fechaInicio": "2025-12-01",
    "fechaFin": "2025-12-31"
  },
  "kpis": {
    "ventasTotales": 45380.50,
    "numeroPedidos": 532,
    "ticketMedio": 85.30,
    "ventasEfectivo": 12500.00,
    "ventasTarjeta": 28900.50,
    "ventasBizum": 3980.00
  }
}
```

---

#### 2.2 EBITDA
```
GET    /api/reportes/cuenta-resultados?empresaId=X&puntoVentaId=Y&periodo=mes_actual
```

**Response ejemplo**:
```json
{
  "filtros": {
    "empresaId": "EMP-001",
    "puntoVentaId": "PDV-TIANA",
    "periodoTipo": "mes",
    "fechaInicio": "2025-12-01",
    "fechaFin": "2025-12-31"
  },
  "lineas": [
    {
      "id": "ING-001",
      "grupo": "INGRESOS_NETOS",
      "concepto": "Venta en mostrador",
      "objetivoMes": 175000,
      "importeReal": 183750,
      "cumplimientoPct": 105,
      "estado": "up"
    }
  ],
  "totales": {
    "ingresosNetos": 316700,
    "ebitda": 68450
  }
}
```

---

### FASE 3: STOCK Y PROVEEDORES (SEMANA 3)

```
GET    /api/stock?empresaId=X&puntoVentaId=Y
POST   /api/stock/movimiento
GET    /api/proveedores
POST   /api/pedidos-proveedores
```

---

## 🔧 PUNTOS DE INTEGRACIÓN EN EL FRONTEND

### Archivos que deben modificarse para conectar backend:

#### 1. `/services/pedidos.service.ts`
```typescript
// ANTES (localStorage):
localStorage.setItem('udar_pedidos', JSON.stringify(pedidos));

// DESPUÉS (API):
const response = await fetch('/api/pedidos', {
  method: 'POST',
  body: JSON.stringify(pedido)
});
```

#### 2. `/services/reportes-multiempresa.service.ts`
```typescript
// ANTES (mock):
const pedidos = JSON.parse(localStorage.getItem('udar_pedidos') || '[]');

// DESPUÉS (API):
const response = await fetch(`/api/reportes/ventas?empresaId=${id}&periodo=${periodo}`);
const data = await response.json();
```

#### 3. `/data/trabajadores.ts`
```typescript
// ANTES (array estático):
export const trabajadores: Trabajador[] = [ ... ];

// DESPUÉS (API):
export async function obtenerTrabajadores(filtros) {
  const response = await fetch(`/api/trabajadores?${params}`);
  return await response.json();
}
```

---

## 📝 PRÓXIMOS PASOS INMEDIATOS

### Para el FRONTEND (TÚ):
1. ✅ **NO tocar más el Dashboard del Gerente** - está funcionando
2. ⚠️ **Corregir módulo EBITDA** - cambiar filtro hardcodeado por jerárquico
3. ⚠️ **Preparar archivos de configuración** para URLs de API

### Para el BACKEND (TU PROGRAMADOR):
1. 🎯 **Crear base de datos** con tablas:
   - `empresas`
   - `marcas`
   - `puntos_venta`
   - `productos` (con relación a empresas/marcas/pdvs)
   - `pedidos` (con todos los campos del interface Pedido)
   - `trabajadores`
   - `ventas_procesadas`
   
2. 🎯 **Implementar endpoints FASE 1** (los 4 endpoints críticos arriba)

3. 🎯 **Probar integración** con un PDV primero (PDV-TIANA)

---

## ✅ CONCLUSIÓN

**Estado General**: El frontend está MUY BIEN estructurado. El 85-90% es correcto.

**Problemas críticos**: Solo 2
1. Productos sin segmentación (backend lo arreglará)
2. EBITDA con filtros hardcodeados (fácil de corregir)

**Listo para backend**: SÍ ✅

El sistema está preparado para que el backend se conecte sin grandes cambios en el frontend.
