# 🎯 SISTEMA DE FILTRO UNIVERSAL UDAR

**Versión:** 1.0  
**Fecha:** 26 de Noviembre de 2025  
**Arquitectura:** Multiempresa

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Estructura de Datos](#estructura-de-datos)
5. [Integración por Módulo](#integración-por-módulo)
6. [Queries SQL](#queries-sql)
7. [Integración con Make.com](#integración-con-makecom)
8. [Guía de Implementación](#guía-de-implementación)
9. [Testing](#testing)
10. [FAQ](#faq)

---

## 1. RESUMEN EJECUTIVO

El **Sistema de Filtro Universal UDAR** es un componente centralizado que:

✅ **Unifica** todos los filtros de la aplicación en un único punto de control  
✅ **Respeta** la arquitectura multiempresa (Empresa → Marca → Punto de Venta)  
✅ **Persiste** el estado del filtro entre sesiones (localStorage)  
✅ **Sincroniza** con Make.com y la base de datos  
✅ **Escala** para empresas con 50+ puntos de venta  
✅ **Personaliza** según el módulo (mostrar/ocultar campos específicos)

### Módulos que lo utilizan:

- Dashboard 360°
- Clientes
- Facturación
- Productos
- Promociones
- Equipo y RRHH
- Stock y Proveedores
- Operativa
- Alertas
- Escandallos

---

## 2. ARQUITECTURA DEL SISTEMA

```
┌──────────────────────────────────────────────────────┐
│                  FiltroUniversalUDAR                 │
│              (Componente de UI)                      │
│  • Jerárquico: Empresa → Marca → PDV                │
│  • Multiselección con checkboxes                    │
│  • Filtros adicionales: periodo, canales, etc.      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────┐
│          FiltroUniversalContext (Provider)           │
│              (Estado global con React Context)       │
│  • Gestiona filtroData                              │
│  • Persiste en localStorage                         │
│  • Helpers: getEmpresasSeleccionadas(), etc.        │
└────────────────────┬─────────────────────────────────┘
                     │
                     ├─────────────┬──────────────┐
                     ↓             ↓              ↓
         ┌─────────────────┐ ┌──────────┐ ┌──────────┐
         │  Módulo 1       │ │ Módulo 2 │ │ Módulo N │
         │  (Dashboard)    │ │ (Ventas) │ │ (Stock)  │
         │                 │ │          │ │          │
         │ useFiltroUniv() │ │    ...   │ │   ...    │
         └─────────────────┘ └──────────┘ └──────────┘
                     │
                     ↓
         ┌──────────────────────────────┐
         │  Backend / Make.com          │
         │  • Recibe filtroData         │
         │  • Ejecuta queries SQL       │
         │  • Retorna datos filtrados   │
         └──────────────────────────────┘
```

---

## 3. COMPONENTES PRINCIPALES

### 3.1. `<FiltroUniversalUDAR />`

**Ubicación:** `/components/filtros/FiltroUniversalUDAR.tsx`

**Props:**

```typescript
interface FiltroUniversalUDARProps {
  empresas?: Empresa[];                    // Lista de empresas (opcional, usa mock por defecto)
  selectedContext: SelectedContext[];      // Contexto seleccionado actual
  filtrosAdicionales: FiltroAdicional;     // Filtros adicionales (periodo, canales, etc.)
  onChange: (newData: FiltroUniversalData) => void; // Callback cuando cambia el filtro
  
  // Configuración específica del módulo
  moduloConfig?: {
    mostrarPeriodo?: boolean;              // Mostrar selector de periodo
    mostrarCanales?: boolean;              // Mostrar selector de canales
    mostrarEstados?: boolean;              // Mostrar selector de estados
    mostrarTipo?: boolean;                 // Mostrar selector de tipo
    opcionesCanales?: { value: string; label: string; }[];
    opcionesEstados?: { value: string; label: string; }[];
    opcionesTipo?: { value: string; label: string; }[];
  };
}
```

**Ejemplo de uso:**

```tsx
import { FiltroUniversalUDAR } from './components/filtros/FiltroUniversalUDAR';
import { useFiltroUniversal } from './contexts/FiltroUniversalContext';

function MiModulo() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: true,
          mostrarCanales: true,
          mostrarEstados: false,
          opcionesCanales: [
            { value: 'mostrador', label: 'Mostrador' },
            { value: 'app', label: 'App móvil' }
          ]
        }}
      />
      
      {/* Tu contenido filtrado aquí */}
    </div>
  );
}
```

### 3.2. `FiltroUniversalProvider` (Context)

**Ubicación:** `/contexts/FiltroUniversalContext.tsx`

**Uso en App.tsx:**

```tsx
import { FiltroUniversalProvider } from './contexts/FiltroUniversalContext';

function App() {
  return (
    <FiltroUniversalProvider>
      <Router>
        {/* Tus rutas aquí */}
      </Router>
    </FiltroUniversalProvider>
  );
}
```

### 3.3. `useFiltroUniversal()` (Hook)

**API del hook:**

```typescript
const {
  filtroData,              // FiltroUniversalData - Estado actual del filtro
  setFiltroData,           // (data: FiltroUniversalData) => void
  resetFiltros,            // () => void - Limpiar todos los filtros
  getEmpresasSeleccionadas, // () => string[] - IDs de empresas
  getMarcasSeleccionadas,   // () => string[] - IDs de marcas
  getPDVsSeleccionados,     // () => string[] - IDs de PDVs
  isFiltered               // () => boolean - ¿Hay filtros activos?
} = useFiltroUniversal();
```

---

## 4. ESTRUCTURA DE DATOS

### 4.1. `SelectedContext`

```typescript
interface SelectedContext {
  empresa_id: string;           // Obligatorio
  marca_id: string | null;      // null = TODAS las marcas
  punto_venta_id: string | null; // null = TODOS los PDV
}
```

**Ejemplos:**

```typescript
// Toda una empresa
{ empresa_id: "EMP-001", marca_id: null, punto_venta_id: null }

// Toda una marca
{ empresa_id: "EMP-001", marca_id: "MRC-001", punto_venta_id: null }

// Un PDV específico
{ empresa_id: "EMP-001", marca_id: "MRC-001", punto_venta_id: "PDV-TIA" }

// Sin filtro (array vacío)
[]  // = TODAS las empresas, marcas y PDVs
```

### 4.2. `FiltroAdicional`

```typescript
interface FiltroAdicional {
  periodo: PeriodoFiltro;
  canales: string[];          // ['mostrador', 'app', 'web']
  estados: string[];          // ['activo', 'pendiente', 'completado']
  tipo: string | null;        // 'producto', 'cliente', etc.
}

interface PeriodoFiltro {
  tipo: 'ultimos_30_dias' | 'este_mes' | 'mes_pasado' | 'este_trimestre' | 'este_año' | 'personalizado';
  fecha_inicio: string | null;  // '2025-11-01'
  fecha_fin: string | null;      // '2025-11-30'
}
```

### 4.3. `FiltroUniversalData` (Estado completo)

```typescript
interface FiltroUniversalData {
  selectedContext: SelectedContext[];
  filtrosAdicionales: FiltroAdicional;
}
```

**Ejemplo completo:**

```json
{
  "selectedContext": [
    {
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": null
    }
  ],
  "filtrosAdicionales": {
    "periodo": {
      "tipo": "este_mes",
      "fecha_inicio": "2025-11-01",
      "fecha_fin": "2025-11-30"
    },
    "canales": ["mostrador", "app"],
    "estados": ["completado"],
    "tipo": null
  }
}
```

---

## 5. INTEGRACIÓN POR MÓDULO

### 5.1. Dashboard 360°

**Antes:**
```tsx
// Filtro antiguo: dropdown simple de tiendas
<DropdownMenu>
  <DropdownMenuItem>Todas las tiendas</DropdownMenuItem>
  <DropdownMenuItem>Tiana</DropdownMenuItem>
  <DropdownMenuItem>Badalona</DropdownMenuItem>
</DropdownMenu>
```

**Después:**
```tsx
import { FiltroUniversalUDAR } from './components/filtros/FiltroUniversalUDAR';
import { useFiltroUniversal } from './contexts/FiltroUniversalContext';

function Dashboard360() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: true,
          mostrarCanales: true,
          mostrarEstados: false
        }}
      />
      
      {/* KPIs, gráficos, etc. */}
    </div>
  );
}
```

### 5.2. Clientes

```tsx
function Clientes() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: true,
          mostrarCanales: false,
          mostrarEstados: true,
          mostrarTipo: true,
          opcionesEstados: [
            { value: 'activo', label: 'Activo' },
            { value: 'inactivo', label: 'Inactivo' }
          ],
          opcionesTipo: [
            { value: 'particular', label: 'Particular' },
            { value: 'empresa', label: 'Empresa' }
          ]
        }}
      />
      
      {/* Lista de clientes filtrada */}
    </div>
  );
}
```

### 5.3. Facturación

```tsx
function Facturacion() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: true,
          mostrarCanales: true,
          mostrarEstados: true,
          opcionesEstados: [
            { value: 'pagada', label: 'Pagada' },
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'vencida', label: 'Vencida' }
          ]
        }}
      />
      
      {/* Tabla de facturas */}
    </div>
  );
}
```

### 5.4. Productos

```tsx
function Productos() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: false, // Productos no necesitan periodo
          mostrarCanales: false,
          mostrarEstados: true,
          mostrarTipo: true,
          opcionesEstados: [
            { value: 'activo', label: 'Activo' },
            { value: 'agotado', label: 'Agotado' },
            { value: 'descatalogado', label: 'Descatalogado' }
          ],
          opcionesTipo: [
            { value: 'comida', label: 'Comida' },
            { value: 'bebida', label: 'Bebida' },
            { value: 'merchandising', label: 'Merchandising' }
          ]
        }}
      />
      
      {/* Catálogo de productos */}
    </div>
  );
}
```

### 5.5. Equipo y RRHH

```tsx
function EquipoRRHH() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: false,
          mostrarCanales: false,
          mostrarEstados: true,
          mostrarTipo: true,
          opcionesEstados: [
            { value: 'activo', label: 'Activo' },
            { value: 'vacaciones', label: 'De vacaciones' },
            { value: 'baja', label: 'De baja' },
            { value: 'despedido', label: 'Despedido' }
          ],
          opcionesTipo: [
            { value: 'gerente', label: 'Gerente' },
            { value: 'empleado', label: 'Empleado' },
            { value: 'temporal', label: 'Temporal' }
          ]
        }}
      />
      
      {/* Lista de empleados */}
    </div>
  );
}
```

### 5.6. Stock y Proveedores

```tsx
function StockProveedores() {
  const { filtroData, setFiltroData } = useFiltroUniversal();

  return (
    <div>
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: true,
          mostrarCanales: false,
          mostrarEstados: true,
          mostrarTipo: true,
          opcionesEstados: [
            { value: 'en_stock', label: 'En stock' },
            { value: 'stock_bajo', label: 'Stock bajo' },
            { value: 'agotado', label: 'Agotado' }
          ],
          opcionesTipo: [
            { value: 'producto', label: 'Productos' },
            { value: 'proveedor', label: 'Proveedores' },
            { value: 'compra', label: 'Compras' }
          ]
        }}
      />
      
      {/* Inventario y compras */}
    </div>
  );
}
```

---

## 6. QUERIES SQL

### 6.1. Helper: `generarWhereClause()`

**Ubicación:** `/contexts/FiltroUniversalContext.tsx`

```typescript
import { generarWhereClause } from './contexts/FiltroUniversalContext';

const { whereClause, params } = generarWhereClause(filtroData);

// Ejemplo de salida:
// whereClause: "WHERE empresa_id IN (:empresaIds) AND fecha >= :fechaInicio AND fecha <= :fechaFin AND canal IN (:canales)"
// params: {
//   empresaIds: ['EMP-001', 'EMP-002'],
//   fechaInicio: '2025-11-01',
//   fechaFin: '2025-11-30',
//   canales: ['mostrador', 'app']
// }
```

### 6.2. Query de Ventas

```sql
SELECT 
  v.venta_id,
  v.fecha,
  v.importe_total,
  v.canal,
  v.estado,
  pv.nombre_comercial AS punto_venta_nombre,
  m.nombre AS marca_nombre,
  e.nombre AS empresa_nombre
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE 
  -- Filtro de contexto (empresas, marcas, PDVs)
  pv.empresa_id IN (:empresaIds)
  AND (
    :marcaIds IS NULL 
    OR pv.marca_id IN (:marcaIds)
  )
  AND (
    :pdvIds IS NULL
    OR pv.punto_venta_id IN (:pdvIds)
  )
  -- Filtro de periodo
  AND v.fecha BETWEEN :fechaInicio AND :fechaFin
  -- Filtro de canales
  AND (
    :canales IS NULL
    OR v.canal IN (:canales)
  )
  -- Filtro de estados
  AND (
    :estados IS NULL
    OR v.estado IN (:estados)
  )
ORDER BY v.fecha DESC;
```

### 6.3. Query de Productos

```sql
SELECT 
  p.producto_id,
  p.nombre,
  p.precio,
  p.estado,
  p.tipo,
  pv.nombre_comercial AS punto_venta_nombre,
  m.nombre AS marca_nombre,
  e.nombre AS empresa_nombre,
  COALESCE(s.cantidad, 0) AS stock_actual
FROM productos p
INNER JOIN punto_venta pv ON p.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
LEFT JOIN stock s ON p.producto_id = s.producto_id AND s.punto_venta_id = pv.punto_venta_id
WHERE 
  pv.empresa_id IN (:empresaIds)
  AND (
    :marcaIds IS NULL 
    OR pv.marca_id IN (:marcaIds)
  )
  AND (
    :pdvIds IS NULL
    OR pv.punto_venta_id IN (:pdvIds)
  )
  AND (
    :estados IS NULL
    OR p.estado IN (:estados)
  )
  AND (
    :tipo IS NULL
    OR p.tipo = :tipo
  )
ORDER BY p.nombre;
```

### 6.4. Query de Empleados

```sql
SELECT 
  emp.empleado_id,
  emp.nombre,
  emp.apellidos,
  emp.email,
  emp.rol,
  emp.estado,
  pv.nombre_comercial AS punto_venta_asignado,
  m.nombre AS marca_nombre,
  e.nombre AS empresa_nombre
FROM empleados emp
INNER JOIN punto_venta pv ON emp.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE 
  pv.empresa_id IN (:empresaIds)
  AND (
    :marcaIds IS NULL 
    OR pv.marca_id IN (:marcaIds)
  )
  AND (
    :pdvIds IS NULL
    OR pv.punto_venta_id IN (:pdvIds)
  )
  AND (
    :estados IS NULL
    OR emp.estado IN (:estados)
  )
  AND (
    :tipo IS NULL
    OR emp.rol = :tipo
  )
ORDER BY emp.apellidos, emp.nombre;
```

---

## 7. INTEGRACIÓN CON MAKE.COM

### 7.1. Endpoint de Filtro

**POST** `/api/filtro-universal/aplicar`

**Request Body:**

```json
{
  "user_id": "uuid-pau",
  "modulo": "dashboard",
  "selected_context": [
    {
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": null
    }
  ],
  "filtros": {
    "periodo": {
      "tipo": "este_mes",
      "fecha_inicio": "2025-11-01",
      "fecha_fin": "2025-11-30"
    },
    "canales": ["mostrador", "app"],
    "estados": ["completado"],
    "tipo": null
  },
  "timestamp": "2025-11-26T16:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "modulo": "dashboard",
  "filtros_aplicados": {
    "empresas": 1,
    "marcas": 1,
    "pdvs": 2,
    "periodo": "01/11/2025 - 30/11/2025",
    "canales": 2
  },
  "datos": {
    "ventas_totales": 145250.50,
    "num_pedidos": 1247,
    "kpis": {...},
    "graficos": {...}
  }
}
```

### 7.2. Helper: `generarPayloadMake()`

```typescript
import { generarPayloadMake } from './contexts/FiltroUniversalContext';

const payload = generarPayloadMake(filtroData, userId);

// Enviar a Make.com
fetch('/api/filtro-universal/aplicar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

### 7.3. Flujo Make.com

```
┌────────────────────────────────────────────┐
│ 1. WEBHOOK: Recibe filtroData             │
│    Evento: filtro_universal_changed        │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│ 2. VALIDAR: Contexto y permisos           │
│    - Verificar que empresas existen       │
│    - Verificar que usuario tiene acceso   │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│ 3. CONSTRUIR QUERY: Usar helper SQL       │
│    - Generar WHERE clause                 │
│    - Bindear parámetros                   │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│ 4. EJECUTAR: Query PostgreSQL             │
│    - Obtener datos filtrados              │
│    - Aplicar paginación si necesario      │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│ 5. TRANSFORMAR: Formato frontend          │
│    - Agrupar por empresa/marca/pdv        │
│    - Calcular agregaciones                │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│ 6. CACHEAR: Guardar resultado (opcional)  │
│    Key: hash(user + context + filtros)    │
└────────────────┬───────────────────────────┘
                 ↓
┌────────────────────────────────────────────┐
│ 7. RESPONDER: Enviar datos al frontend    │
└────────────────────────────────────────────┘
```

---

## 8. GUÍA DE IMPLEMENTACIÓN

### Paso 1: Envolver la app con el Provider

**Archivo:** `/App.tsx`

```tsx
import { FiltroUniversalProvider } from './contexts/FiltroUniversalContext';

function App() {
  return (
    <FiltroUniversalProvider>
      {/* Tu app aquí */}
    </FiltroUniversalProvider>
  );
}
```

### Paso 2: Integrar en cada módulo

**Patrón común:**

```tsx
import { FiltroUniversalUDAR } from './components/filtros/FiltroUniversalUDAR';
import { useFiltroUniversal } from './contexts/FiltroUniversalContext';

function MiModulo() {
  const { filtroData, setFiltroData, isFiltered } = useFiltroUniversal();
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Efecto para cargar datos cuando cambia el filtro
  useEffect(() => {
    cargarDatos();
  }, [filtroData]);

  const cargarDatos = async () => {
    setCargando(true);
    
    try {
      const response = await fetch('/api/mi-modulo/datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'uuid-usuario',
          selected_context: filtroData.selectedContext,
          filtros: filtroData.filtrosAdicionales
        })
      });
      
      const data = await response.json();
      setDatos(data.resultados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      {/* Filtro */}
      <FiltroUniversalUDAR
        selectedContext={filtroData.selectedContext}
        filtrosAdicionales={filtroData.filtrosAdicionales}
        onChange={setFiltroData}
        moduloConfig={{
          mostrarPeriodo: true,
          mostrarCanales: true
        }}
      />

      {/* Indicador de filtros activos */}
      {isFiltered() && (
        <div className="my-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            Se están aplicando filtros personalizados.
            <button onClick={resetFiltros} className="ml-2 underline">
              Limpiar filtros
            </button>
          </p>
        </div>
      )}

      {/* Contenido */}
      {cargando ? (
        <div>Cargando...</div>
      ) : (
        <div>
          {/* Renderizar datos filtrados */}
          {datos.map(item => (
            <div key={item.id}>{item.nombre}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Paso 3: Configurar el backend

**Ejemplo con Node.js + PostgreSQL:**

```javascript
// api/mi-modulo/datos
export async function POST(req) {
  const { user_id, selected_context, filtros } = await req.json();
  
  // Validar permisos del usuario
  const user = await db.query('SELECT * FROM usuarios WHERE id = $1', [user_id]);
  if (!user) return Response.json({ error: 'Usuario no autorizado' }, { status: 403 });
  
  // Construir query con el filtro
  let query = `
    SELECT * FROM mi_tabla t
    INNER JOIN punto_venta pv ON t.punto_venta_id = pv.punto_venta_id
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;
  
  // Filtro de contexto
  if (selected_context.length > 0) {
    const empresaIds = selected_context.map(ctx => ctx.empresa_id);
    query += ` AND pv.empresa_id = ANY($${paramIndex})`;
    params.push(empresaIds);
    paramIndex++;
    
    // ... más lógica de filtrado
  }
  
  // Filtro de periodo
  if (filtros.periodo.fecha_inicio) {
    query += ` AND t.fecha >= $${paramIndex}`;
    params.push(filtros.periodo.fecha_inicio);
    paramIndex++;
  }
  
  if (filtros.periodo.fecha_fin) {
    query += ` AND t.fecha <= $${paramIndex}`;
    params.push(filtros.periodo.fecha_fin);
    paramIndex++;
  }
  
  // Ejecutar query
  const resultados = await db.query(query, params);
  
  return Response.json({
    success: true,
    resultados: resultados.rows
  });
}
```

---

## 9. TESTING

### 9.1. Tests Unitarios

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FiltroUniversalUDAR } from './FiltroUniversalUDAR';

describe('FiltroUniversalUDAR', () => {
  test('Renderiza correctamente', () => {
    const onChange = jest.fn();
    
    render(
      <FiltroUniversalUDAR
        selectedContext={[]}
        filtrosAdicionales={{
          periodo: { tipo: 'este_mes', fecha_inicio: null, fecha_fin: null },
          canales: [],
          estados: [],
          tipo: null
        }}
        onChange={onChange}
      />
    );
    
    expect(screen.getByText('Todas las empresas')).toBeInTheDocument();
  });
  
  test('Selecciona una empresa', () => {
    const onChange = jest.fn();
    
    render(
      <FiltroUniversalUDAR
        selectedContext={[]}
        filtrosAdicionales={{...}}
        onChange={onChange}
      />
    );
    
    fireEvent.click(screen.getByText('Todas las empresas'));
    fireEvent.click(screen.getByText('Hostelería (PAU)'));
    
    expect(onChange).toHaveBeenCalledWith({
      selectedContext: [{
        empresa_id: 'EMP-001',
        marca_id: null,
        punto_venta_id: null
      }],
      filtrosAdicionales: {...}
    });
  });
});
```

### 9.2. Tests de Integración

```typescript
describe('FiltroUniversalContext', () => {
  test('Persiste en localStorage', () => {
    const { result } = renderHook(() => useFiltroUniversal(), {
      wrapper: FiltroUniversalProvider
    });
    
    act(() => {
      result.current.setFiltroData({
        selectedContext: [{
          empresa_id: 'EMP-001',
          marca_id: null,
          punto_venta_id: null
        }],
        filtrosAdicionales: {...}
      });
    });
    
    const saved = localStorage.getItem('udar_filtro_universal');
    expect(saved).toBeTruthy();
    
    const parsed = JSON.parse(saved);
    expect(parsed.selectedContext[0].empresa_id).toBe('EMP-001');
  });
});
```

---

## 10. FAQ

### ¿Qué pasa si no selecciono ninguna empresa?

Si `selectedContext = []`, se interpreta como **TODAS** las empresas, marcas y puntos de venta. Es el estado por defecto.

### ¿Cómo filtro por múltiples empresas?

Simplemente añade múltiples objetos al array `selectedContext`:

```typescript
[
  { empresa_id: 'EMP-001', marca_id: null, punto_venta_id: null },
  { empresa_id: 'EMP-002', marca_id: null, punto_venta_id: null }
]
```

### ¿Puedo mezclar empresas completas con marcas específicas?

Sí:

```typescript
[
  { empresa_id: 'EMP-001', marca_id: null, punto_venta_id: null }, // Toda EMP-001
  { empresa_id: 'EMP-002', marca_id: 'MRC-003', punto_venta_id: null } // Solo MRC-003 de EMP-002
]
```

### ¿El filtro persiste entre sesiones?

Sí, el estado se guarda en `localStorage` automáticamente.

### ¿Cómo personalizo las opciones de canales/estados para mi módulo?

Usa `moduloConfig`:

```typescript
<FiltroUniversalUDAR
  {...props}
  moduloConfig={{
    opcionesCanales: [
      { value: 'mi_canal', label: 'Mi Canal Personalizado' }
    ]
  }}
/>
```

### ¿Funciona con empresas que tienen 50+ puntos de venta?

Sí, el componente usa `ScrollArea` optimizado y renderizado condicional (solo expande cuando el usuario hace clic).

### ¿Cómo optimizo las queries SQL?

1. Crear índices en `(empresa_id, marca_id, punto_venta_id, fecha)`
2. Usar tabla pre-calculada para agregaciones frecuentes
3. Implementar caché en Redis con TTL

---

## APÉNDICES

### A. Archivos del Sistema

```
/components/
  /filtros/
    FiltroUniversalUDAR.tsx        # Componente de UI

/contexts/
  FiltroUniversalContext.tsx       # Provider y hook

/SISTEMA_FILTRO_UNIVERSAL_UDAR.md  # Este documento
```

### B. Checklist de Implementación

- [ ] Instalar dependencias necesarias
- [ ] Crear `FiltroUniversalUDAR.tsx`
- [ ] Crear `FiltroUniversalContext.tsx`
- [ ] Envolver App con `FiltroUniversalProvider`
- [ ] Integrar en Dashboard 360°
- [ ] Integrar en Clientes
- [ ] Integrar en Facturación
- [ ] Integrar en Productos
- [ ] Integrar en Equipo/RRHH
- [ ] Integrar en Stock/Proveedores
- [ ] Configurar endpoints backend
- [ ] Crear queries SQL con filtros
- [ ] Integrar con Make.com
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Documentar para el equipo

---

**FIN DE LA DOCUMENTACIÓN**
