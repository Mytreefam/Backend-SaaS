# 📊 Data Bindings - Dashboard 360° Cierres

## 🎯 Descripción General

Este documento describe el esquema de datos, mock data y bindings implementados en el tab "Cierres" del componente `Dashboard360.tsx`.

---

## 📋 Data Schema (TypeScript Interfaces)

### Interface Principal: CierreCaja

```typescript
interface CierreCaja {
  id: string;                       // Identificador único del cierre
  empresa_id: string;                // ID de la empresa
  marca_id: string;                  // ID de la marca
  punto_venta_id: string;            // Nombre del punto de venta
  caja_id: string;                   // ID de la caja
  fecha_hora: string;                // Fecha y hora en formato ISO 8601
  empleado_nombre: string;           // Nombre del empleado que realizó la acción
  tipo_accion: 'apertura' | 'cierre' | 'arqueo' | 'retirada' | 'devolucion' | 'consumo_propio';
  contado_esperado: number;          // Cantidad esperada en caja
  contado_real: number;              // Cantidad real contada
  diferencia: number;                // Diferencia entre esperado y real
  total_ventas: number;              // Total de ventas del período
  ventas_efectivo: number;           // Ventas en efectivo
  ventas_tarjeta: number;            // Ventas con tarjeta
  retiradas: number;                 // Cantidad retirada de caja
  resultado: number;                 // Resultado final en caja
  incoherencia: number;              // Incoherencias detectadas
}
```

### Interface de Response: CierresAPIResponse

```typescript
interface CierresAPIResponse {
  totales: {
    total_cierres: number;           // Total de movimientos de caja
    efectivo_total: number;          // Suma de todo el efectivo
    tarjetas_total: number;          // Suma de todas las tarjetas
    diferencias_total: number;       // Suma de todas las diferencias
  };
  cierres: CierreCaja[];             // Array de cierres de caja
  paginacion: {
    pagina: number;                  // Página actual
    por_pagina: number;              // Registros por página
    total_registros: number;         // Total de registros disponibles
  };
}
```

---

## 🧪 Mock Data Implementado

### Estructura de los Datos Mock

Los datos mock incluyen 20 registros de diferentes tiendas con varios tipos de acciones:

- **Aperturas**: Inicio de turno con importe inicial
- **Cierres**: Fin de turno con cuadre final
- **Arqueos**: Conteos intermedios durante el día
- **Retiradas**: Retiro de efectivo para seguridad
- **Devoluciones**: Devoluciones a clientes
- **Consumo Propio**: Consumos del personal

**Ejemplo de registro:**

```typescript
{
  id: "CRR-001",
  empresa_id: "EMP-001",
  marca_id: "MRC-001",
  punto_venta_id: "Can Farines Centro",
  caja_id: "CAJA-01",
  fecha_hora: "2025-11-25T08:00:00",
  empleado_nombre: "Ana Rodríguez",
  tipo_accion: "apertura",
  contado_esperado: 200.00,
  contado_real: 200.00,
  diferencia: 0.00,
  total_ventas: 0.00,
  ventas_efectivo: 0.00,
  ventas_tarjeta: 0.00,
  retiradas: 0.00,
  resultado: 200.00,
  incoherencia: 0.00
}
```

### Totales Mock:

```typescript
totales: {
  total_cierres: 20,
  efectivo_total: 6935.75,
  tarjetas_total: 13876.80,
  diferencias_total: 20.00
}
```

### Lógica de Continuidad

Los datos mock están diseñados para que:
- La **apertura del día siguiente** tome como `contado_esperado` el `resultado` del **cierre del día anterior**
- Ejemplo: Cierre día 1 → resultado: 350€ | Apertura día 2 → contado_esperado: 350€

---

## 🔗 Data Bindings - Mapeo de Datos a UI

### 📌 Tarjetas KPI Superiores (4 Cards)

#### 1. Tarjeta "Total Cierres"
**Ubicación:** Primera card en grid de 4 columnas  
**Estilo:** `border-2 border-green-200 bg-green-50`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `totales.total_cierres` | Número entero | 20 |
| Descripción | - | Texto estático | "Este mes" |
| Color texto | green-700 | - | - |

**Código:**
```tsx
<p className="text-3xl text-green-700">
  {totales.total_cierres}
</p>
```

---

#### 2. Tarjeta "Efectivo Total"
**Ubicación:** Segunda card en grid  
**Estilo:** `border-2 border-blue-200 bg-blue-50`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `totales.efectivo_total` | €XX.XXX,XX | €6.935,75 |
| Descripción | - | Texto estático | "Acumulado" |
| Color texto | blue-700 | - | - |

**Código:**
```tsx
<p className="text-3xl text-blue-700">
  {formatEuro(totales.efectivo_total)}
</p>
```

---

#### 3. Tarjeta "Transacciones"
**Ubicación:** Tercera card en grid  
**Estilo:** `border-2 border-yellow-200 bg-yellow-50`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `totales.tarjetas_total` | €XX.XXX,XX | €13.876,80 |
| Descripción | - | Texto estático | "Total tarjetas" |
| Color texto | yellow-700 | - | - |

**Código:**
```tsx
<p className="text-3xl text-yellow-700">
  {formatEuro(totales.tarjetas_total)}
</p>
```

---

#### 4. Tarjeta "Diferencias"
**Ubicación:** Cuarta card en grid  
**Estilo:** `border-2 border-purple-200 bg-purple-50`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `totales.diferencias_total` | €XX.XXX,XX | €20,00 |
| Descripción | - | Texto estático | "Con ajustes" |
| Color texto | purple-700 | - | - |

**Código:**
```tsx
<p className="text-3xl text-purple-700">
  {formatEuro(totales.diferencias_total)}
</p>
```

---

### 📋 Tabla de Movimientos de Caja

Cada fila de la tabla mapea los siguientes campos:

| Columna | Campo JSON | Formato | Función Helper |
|---------|------------|---------|----------------|
| Día y hora | `fecha_hora` | DD/MM/YYYY HH:MM | `formatFechaHora()` |
| Tienda | `punto_venta_id` | Texto | - |
| Acción | `tipo_accion` | Badge coloreado | `getBadgeTipoAccion()` |
| Empleada | `empleado_nombre` | Texto | - |
| Contado Esperado | `contado_esperado` | €XX.XXX,XX | `formatEuro()` |
| Contado Real | `contado_real` | €XX.XXX,XX | `formatEuro()` |
| Diferencia | `diferencia` | €XX.XXX,XX (rojo si ≠ 0) | `formatEuro()` |
| Total Ventas | `total_ventas` | €XX.XXX,XX | `formatEuro()` |
| Ventas Efectivo | `ventas_efectivo` | €XX.XXX,XX | `formatEuro()` |
| Ventas Tarjeta | `ventas_tarjeta` | €XX.XXX,XX | `formatEuro()` |
| Retiradas | `retiradas` | €XX.XXX,XX | `formatEuro()` |
| Resultado | `resultado` | €XX.XXX,XX | `formatEuro()` |
| Incoherencia | `incoherencia` | €XX.XXX,XX (rojo si ≠ 0) | `formatEuro()` |

#### Código de ejemplo de fila:

```tsx
{cierresPaginados.map((cierre) => (
  <TableRow key={cierre.id} className="hover:bg-gray-50">
    <TableCell className="text-sm whitespace-nowrap">
      {formatFechaHora(cierre.fecha_hora)}
    </TableCell>
    <TableCell className="text-sm">{cierre.punto_venta_id}</TableCell>
    <TableCell className="text-sm">
      {getBadgeTipoAccion(cierre.tipo_accion)}
    </TableCell>
    <TableCell className="text-sm">{cierre.empleado_nombre}</TableCell>
    <TableCell className="text-sm">{formatEuro(cierre.contado_esperado)}</TableCell>
    <TableCell className="text-sm">{formatEuro(cierre.contado_real)}</TableCell>
    <TableCell className={`text-sm ${
      cierre.diferencia !== 0 ? 'font-medium text-red-600' : ''
    }`}>
      {formatEuro(cierre.diferencia)}
    </TableCell>
    <TableCell className="text-sm">{formatEuro(cierre.total_ventas)}</TableCell>
    <TableCell className="text-sm">{formatEuro(cierre.ventas_efectivo)}</TableCell>
    <TableCell className="text-sm">{formatEuro(cierre.ventas_tarjeta)}</TableCell>
    <TableCell className="text-sm">{formatEuro(cierre.retiradas)}</TableCell>
    <TableCell className="text-sm font-medium">{formatEuro(cierre.resultado)}</TableCell>
    <TableCell className={`text-sm ${
      cierre.incoherencia !== 0 ? 'font-medium text-red-600' : ''
    }`}>
      {formatEuro(cierre.incoherencia)}
    </TableCell>
  </TableRow>
))}
```

---

### 🎨 Badges de Tipo de Acción

La función `getBadgeTipoAccion()` mapea cada tipo de acción a un badge específico:

| Tipo Acción | Color Badge | Texto | Estilo |
|-------------|-------------|-------|--------|
| `apertura` | Azul | Apertura | `bg-blue-100 text-blue-800 border-blue-200` |
| `cierre` | Verde | Cierre | `bg-green-100 text-green-800 border-green-200` |
| `arqueo` | Morado | Arqueo | `bg-purple-100 text-purple-800 border-purple-200` |
| `retirada` | Amarillo | Retirada | `bg-yellow-100 text-yellow-800 border-yellow-200` |
| `devolucion` | Rojo | Devolución | `bg-red-100 text-red-800 border-red-200` |
| `consumo_propio` | Naranja | Consumo Propio | `bg-orange-100 text-orange-800 border-orange-200` |

---

## 🔍 Filtros y Paginación

### Filtros Aplicados

Los datos pueden filtrarse por:

1. **Punto de venta** (`tiendaSeleccionada`)
   - Valor `"todas"`: Muestra todos los cierres
   - Valor específico: Filtra por `punto_venta_id`

```typescript
const cierresFiltrados = tiendaSeleccionada === 'todas' 
  ? cierres 
  : cierres.filter(c => c.punto_venta_id === tiendaSeleccionada);
```

2. **Período temporal** (heredado del Dashboard)
   - `periodo_tipo`: hoy, ayer, semana_actual, mes_actual, etc.
   - `fecha_inicio` y `fecha_fin`: Rango personalizado

### Paginación

**Estados:**
- `paginaActualCierres`: Página actual (estado local)
- `paginacion.por_pagina`: Registros por página (del API)
- `paginacion.total_registros`: Total de registros (del API)

**Cálculos:**
```typescript
// Calcular cierres a mostrar
const cierresPaginados = cierresFiltrados.slice(
  (paginaActualCierres - 1) * paginacion.por_pagina,
  paginaActualCierres * paginacion.por_pagina
);

// Calcular total de páginas
const totalPaginas = Math.ceil(cierresFiltrados.length / paginacion.por_pagina);
```

**Controles de Paginación:**
- Botón "Anterior": Retrocede una página (deshabilitado en página 1)
- Botones numéricos: Saltan a página específica
- Botón "Siguiente": Avanza una página (deshabilitado en última página)

**Texto informativo:**
```
"Mostrando 1 a 20 de 20 registros"
```

---

## 🎨 Formato de Datos

### Función `formatEuro()`

Formatea números a moneda europea:

```typescript
const formatEuro = (valor: number) => {
  return `€${valor.toLocaleString('es-ES', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};
```

**Ejemplos:**
- `200.00` → `€200,00`
- `6935.75` → `€6.935,75`
- `13876.80` → `€13.876,80`

### Función `formatFechaHora()`

Convierte fechas ISO 8601 a formato español:

```typescript
const formatFechaHora = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  const horas = fecha.getHoras().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
};
```

**Ejemplos:**
- `"2025-11-25T08:00:00"` → `"25/11/2025 08:00"`
- `"2025-11-24T20:45:00"` → `"24/11/2025 20:45"`

---

## 🎯 Casos de Uso y Reglas de Negocio

### 1. Detección de Diferencias

Las diferencias se resaltan en rojo:

```tsx
<TableCell className={`text-sm ${
  cierre.diferencia !== 0 ? 'font-medium text-red-600' : ''
}`}>
  {formatEuro(cierre.diferencia)}
</TableCell>
```

### 2. Incoherencias

Las incoherencias también se resaltan:

```tsx
<TableCell className={`text-sm ${
  cierre.incoherencia !== 0 ? 'font-medium text-red-600' : ''
}`}>
  {formatEuro(cierre.incoherencia)}
</TableCell>
```

### 3. Continuidad de Caja

La lógica de continuidad debe implementarse en el backend:
- Al crear una **apertura**, el `contado_esperado` debe ser igual al `resultado` del último **cierre**
- Esto asegura la trazabilidad del efectivo día a día

---

## 🔌 Integración con API Real

### Endpoint Esperado

```
POST /api/cierres
```

### Request Body

```json
{
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "Can Farines Centro",  // null para todas
  "fecha_inicio": "2025-11-01",            // opcional
  "fecha_fin": "2025-11-30",               // opcional
  "pagina": 1,
  "por_pagina": 20
}
```

### Response Esperada

```json
{
  "totales": {
    "total_cierres": 20,
    "efectivo_total": 6935.75,
    "tarjetas_total": 13876.80,
    "diferencias_total": 20.00
  },
  "cierres": [
    {
      "id": "CRR-001",
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": "Can Farines Centro",
      "caja_id": "CAJA-01",
      "fecha_hora": "2025-11-25T08:00:00",
      "empleado_nombre": "Ana Rodríguez",
      "tipo_accion": "apertura",
      "contado_esperado": 200.00,
      "contado_real": 200.00,
      "diferencia": 0.00,
      "total_ventas": 0.00,
      "ventas_efectivo": 0.00,
      "ventas_tarjeta": 0.00,
      "retiradas": 0.00,
      "resultado": 200.00,
      "incoherencia": 0.00
    }
  ],
  "paginacion": {
    "pagina": 1,
    "por_pagina": 20,
    "total_registros": 120
  }
}
```

### Código de Integración

Para conectar con el API real, reemplaza el estado mock por una llamada fetch:

```typescript
useEffect(() => {
  const cargarCierres = async () => {
    setCargandoDatos(true);
    try {
      const response = await fetch('/api/cierres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: 'EMP-001',
          marca_id: 'MRC-001',
          punto_venta_id: tiendaSeleccionada === 'todas' ? null : tiendaSeleccionada,
          fecha_inicio: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}` : null,
          fecha_fin: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}` : null,
          pagina: paginaActualCierres,
          por_pagina: 20
        })
      });
      const data = await response.json();
      setDatosCierresAPI(data);
    } catch (error) {
      setErrorCarga('Error al cargar cierres');
    } finally {
      setCargandoDatos(false);
    }
  };
  cargarCierres();
}, [tiendaSeleccionada, paginaActualCierres, periodoSeleccionado]);
```

---

## ✅ Checklist de Validación

- [x] Data Schema definido con TypeScript (CierreCaja, CierresAPIResponse)
- [x] Mock Data generado con 20 registros realistas
- [x] Continuidad de caja implementada (apertura usa resultado del cierre anterior)
- [x] 4 Tarjetas KPI vinculadas a `totales`
- [x] Tabla completa con todos los campos del cierre
- [x] Formato europeo aplicado (€XX.XXX,XX)
- [x] Formato de fechas español (DD/MM/YYYY HH:MM)
- [x] Badges coloreados para tipos de acción
- [x] Diferencias e incoherencias resaltadas en rojo
- [x] Paginación implementada y funcional
- [x] Filtrado por tienda implementado
- [x] Documentación completa

---

## 📞 Notas para el Programador Backend

1. **Calcular Totales**: Los totales deben calcularse considerando los filtros aplicados
2. **Paginación del servidor**: Implementar paginación en el backend para mejorar performance
3. **Continuidad de Caja**: Validar que cada apertura tome el resultado del cierre anterior
4. **Tipos de Acción**: Respetar los valores exactos del enum: `'apertura' | 'cierre' | 'arqueo' | 'retirada' | 'devolucion' | 'consumo_propio'`
5. **Fechas ISO**: Siempre devolver fechas en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss`)
6. **Decimales**: Todos los valores monetarios deben tener exactamente 2 decimales

---

**Última actualización:** 25 de noviembre de 2025
