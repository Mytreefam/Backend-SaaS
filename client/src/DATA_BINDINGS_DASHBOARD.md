# 📊 Data Bindings - Dashboard 360° Ventas

## 🎯 Descripción General

Este documento describe el esquema de datos, mock data y bindings implementados en el componente `Dashboard360.tsx` para la sección de Ventas.

---

## 📋 Data Schema (TypeScript Interface)

```typescript
interface VentasAPIResponse {
  // Metadatos de contexto
  empresa_id: string;
  marca_id: string;
  punto_venta_id: string;
  periodo_tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  
  // KPIs Principales
  ventas_periodo: number;
  pedidos_periodo: number;
  productos_vendidos: number;
  ticket_medio_pedido: number;
  ticket_medio_producto: number;
  
  // Costes y Comisiones
  costes_variables_periodo: number;
  costes_fijos_imputados_periodo: number;
  comisiones_tpv_periodo: number;
  comisiones_plataformas_periodo: number;
  comisiones_pasarela_periodo: number;
  
  // Márgenes y Variaciones
  margen_neto_periodo: number;
  variacion_ventas_periodo: number;
  variacion_margen_neto_periodo: number;
  
  // Ventas por Canal
  ventas_mostrador?: number;
  variacion_mostrador?: number;
  ventas_app_web?: number;
  variacion_app_web?: number;
  ventas_terceros?: number;
  variacion_terceros?: number;
  ventas_efectivo?: number;
  variacion_efectivo?: number;
  
  // Datos para Gráficas
  ingresos_ultimos_5_meses?: number[];
  gastos_ultimos_5_meses?: number[];
  labels_ultimos_5_meses?: string[];
  categorias_ingresos?: string[];
  valores_ingresos_categorias?: number[];
}
```

---

## 🧪 Mock Data Implementado

```typescript
const MOCK_DATA_VENTAS: VentasAPIResponse = {
  // Metadatos
  empresa_id: "EMP-001",
  marca_id: "MRC-001",
  punto_venta_id: "todas",
  periodo_tipo: "mes_actual",
  fecha_inicio: "2025-11-01",
  fecha_fin: "2025-11-30",
  
  // KPIs Principales
  ventas_periodo: 45890.50,
  pedidos_periodo: 342,
  productos_vendidos: 1247,
  ticket_medio_pedido: 134.21,
  ticket_medio_producto: 36.80,
  
  // Costes y Comisiones
  costes_variables_periodo: 18356.20,
  costes_fijos_imputados_periodo: 12400.00,
  comisiones_tpv_periodo: 1148.26,
  comisiones_plataformas_periodo: 2294.53,
  comisiones_pasarela_periodo: 458.91,
  
  // Márgenes
  margen_neto_periodo: 11232.60,
  variacion_ventas_periodo: 12.5,
  variacion_margen_neto_periodo: 8.3,
  
  // Ventas por Canal
  ventas_mostrador: 28450.00,
  variacion_mostrador: 8.2,
  ventas_app_web: 12890.00,
  variacion_app_web: 15.4,
  ventas_terceros: 4550.50,
  variacion_terceros: 12.1,
  ventas_efectivo: 18320.00,
  variacion_efectivo: 5.8,
  
  // Datos para Gráficas
  ingresos_ultimos_5_meses: [38000, 41000, 39500, 43000, 45890.50],
  gastos_ultimos_5_meses: [22000, 24000, 23500, 25000, 26500],
  labels_ultimos_5_meses: ["Jul", "Ago", "Sep", "Oct", "Nov"],
  
  categorias_ingresos: ["Pan y Bollería", "Pastelería", "Bebidas", "Complementos"],
  valores_ingresos_categorias: [45, 30, 15, 10]
};
```

---

## 🔗 Data Bindings - Mapeo de Datos a UI

### 📌 Tarjetas KPI (4 Cards principales)

#### 1. Tarjeta "Mostrador" (Ventas en tienda física)
**Ubicación:** Primera card en grid de 4 columnas  
**Estilo:** `border-2 border-teal-200`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `ventas_mostrador` | `€XX.XXX,XX` | €28.450,00 |
| Variación % | `variacion_mostrador` | `+X,X%` | +8,2% |
| Ícono | ShoppingCart | - | 🛒 |

**Código:**
```tsx
<p>€{ventas_mostrador.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
<span>+{variacion_mostrador.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%</span>
```

---

#### 2. Tarjeta "App/Web" (Pedidos online)
**Ubicación:** Segunda card en grid  
**Estilo:** `border-2 border-blue-200`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `ventas_app_web` | `€XX.XXX,XX` | €12.890,00 |
| Variación % | `variacion_app_web` | `+X,X%` | +15,4% |
| Ícono | Package | - | 📦 |

**Código:**
```tsx
<p>€{ventas_app_web.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
<span>+{variacion_app_web.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%</span>
```

---

#### 3. Tarjeta "Terceros" (Glovo, Uber Eats, etc.)
**Ubicación:** Tercera card en grid  
**Estilo:** `border-2 border-purple-200`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `ventas_terceros` | `€XX.XXX,XX` | €4.550,50 |
| Variación % | `variacion_terceros` | `+X,X%` | +12,1% |
| Ícono | Users | - | 👥 |

**Código:**
```tsx
<p>€{ventas_terceros.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
<span>+{variacion_terceros.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%</span>
```

---

#### 4. Tarjeta "Total Efectivo" (Pagos en efectivo)
**Ubicación:** Cuarta card en grid  
**Estilo:** `border-2 border-green-200 bg-green-50`

| Elemento UI | Campo JSON | Formato | Ejemplo |
|-------------|------------|---------|---------|
| Valor principal | `ventas_efectivo` | `€XX.XXX,XX` | €18.320,00 |
| Variación % | `variacion_efectivo` | `+X,X%` | +5,8% |
| Ícono | DollarSign | - | 💰 |

**Código:**
```tsx
<p>€{ventas_efectivo.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
<span>+{variacion_efectivo.toLocaleString('es-ES', { minimumFractionDigits: 1 })}%</span>
```

---

### 📊 Gráficas

#### 1. LineChart: "Ingresos vs Gastos"
**Ubicación:** Primera gráfica en grid 2 columnas  
**Tipo:** LineChart (recharts)

| Elemento | Campo JSON | Tipo | Descripción |
|----------|------------|------|-------------|
| Serie 1 (Ingresos) | `ingresos_ultimos_5_meses` | number[] | Array de 5 valores |
| Serie 2 (Gastos) | `gastos_ultimos_5_meses` | number[] | Array de 5 valores |
| Eje X (Labels) | `labels_ultimos_5_meses` | string[] | ["Jul", "Ago", "Sep", "Oct", "Nov"] |

**Configuración:**
- Color Ingresos: `#0d9488` (teal-600)
- Color Gastos: `#f59e0b` (amber-500)
- strokeWidth: `2`

**Código:**
```tsx
<LineChart data={ingresos_ultimos_5_meses.map((ingreso, index) => ({
  mes: labels_ultimos_5_meses[index],
  ingresos: ingreso,
  gastos: gastos_ultimos_5_meses[index]
}))}>
  <Line dataKey="ingresos" stroke="#0d9488" />
  <Line dataKey="gastos" stroke="#f59e0b" />
</LineChart>
```

**Ejemplo de Data Transformada:**
```javascript
[
  { mes: "Jul", ingresos: 38000, gastos: 22000 },
  { mes: "Ago", ingresos: 41000, gastos: 24000 },
  { mes: "Sep", ingresos: 39500, gastos: 23500 },
  { mes: "Oct", ingresos: 43000, gastos: 25000 },
  { mes: "Nov", ingresos: 45890.50, gastos: 26500 }
]
```

---

#### 2. PieChart: "Distribución de Ingresos"
**Ubicación:** Segunda gráfica en grid  
**Tipo:** PieChart (recharts)

| Elemento | Campo JSON | Tipo | Descripción |
|----------|------------|------|-------------|
| Categorías | `categorias_ingresos` | string[] | Nombres de categorías |
| Valores | `valores_ingresos_categorias` | number[] | Porcentajes (0-100) |

**Configuración:**
- Colores: `['#0d9488', '#14b8a6', '#5eead4', '#99f6e4']` (cíclicos)
- Label: `"{nombre} {valor}%"`
- outerRadius: `80`

**Código:**
```tsx
<PieChart>
  <Pie
    data={categorias_ingresos.map((categoria, index) => ({
      nombre: categoria,
      valor: valores_ingresos_categorias[index],
      color: ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4'][index % 4]
    }))}
    dataKey="valor"
    label={(entry) => `${entry.nombre} ${entry.valor}%`}
  />
</PieChart>
```

**Ejemplo de Data Transformada:**
```javascript
[
  { nombre: "Pan y Bollería", valor: 45, color: "#0d9488" },
  { nombre: "Pastelería", valor: 30, color: "#14b8a6" },
  { nombre: "Bebidas", valor: 15, color: "#5eead4" },
  { nombre: "Complementos", valor: 10, color: "#99f6e4" }
]
```

---

### 📈 Métricas Adicionales (No mostradas actualmente pero disponibles)

Estos campos están en el schema y pueden vincularse a nuevos componentes UI:

| Campo JSON | Descripción | Uso Sugerido |
|------------|-------------|--------------|
| `ventas_periodo` | Total ventas del período | Card resumen general |
| `pedidos_periodo` | Total de pedidos | Contador de pedidos |
| `productos_vendidos` | Productos vendidos | Métrica de productos |
| `ticket_medio_pedido` | Ticket promedio por pedido | KPI de ticket medio |
| `ticket_medio_producto` | Precio promedio por producto | Análisis de pricing |
| `costes_variables_periodo` | Costes variables (COGS) | Gráfica de costes |
| `costes_fijos_imputados_periodo` | Costes fijos | Análisis de estructura |
| `comisiones_tpv_periodo` | Comisiones TPV | Desglose de comisiones |
| `comisiones_plataformas_periodo` | Comisiones plataformas | Coste de marketplace |
| `comisiones_pasarela_periodo` | Comisiones pasarela de pago | Coste de procesamiento |
| `margen_neto_periodo` | Margen neto | Rentabilidad |
| `variacion_ventas_periodo` | % variación ventas | Tendencia general |
| `variacion_margen_neto_periodo` | % variación margen | Tendencia rentabilidad |

---

## 🎨 Formato de Números (Estándar Europeo)

Todos los valores numéricos usan el formato europeo:

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Moneda | `€XX.XXX,XX` | €28.450,00 |
| Porcentaje | `+X,X%` | +8,2% |
| Enteros | `X.XXX` | 1.247 |

**Implementación:**
```typescript
// Moneda
valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// Porcentaje
valor.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────┐
│  MOCK_DATA_VENTAS   │
│  (Constante)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  useState            │
│  datosVentasAPI     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  useEffect           │
│  (Simula carga)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  renderVentas()     │
│  (Destructuring)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  UI Components      │
│  (Cards, Charts)    │
└─────────────────────┘
```

---

## 🛠️ Modificación de Datos Mock

Para cambiar los datos de prueba, edita la constante `MOCK_DATA_VENTAS` en `/components/gerente/Dashboard360.tsx`:

```typescript
// Ejemplo: Cambiar ventas de mostrador
const MOCK_DATA_VENTAS: VentasAPIResponse = {
  ...
  ventas_mostrador: 35000.00,  // ⬅️ Modificar aquí
  variacion_mostrador: 15.2,   // ⬅️ Modificar aquí
  ...
};
```

---

## 🔌 Conexión con API Real

Para conectar con un endpoint real, reemplaza el `useEffect` actual:

```typescript
// REEMPLAZAR ESTO:
useEffect(() => {
  setCargandoDatos(true);
  setTimeout(() => {
    setDatosVentasAPI({ ...MOCK_DATA_VENTAS, ... });
    setCargandoDatos(false);
  }, 300);
}, [filtros...]);

// POR ESTO:
useEffect(() => {
  const cargarDatos = async () => {
    setCargandoDatos(true);
    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: 'EMP-001',
          marca_id: 'MRC-001',
          punto_venta_id: tiendaSeleccionada,
          periodo_tipo: periodoSeleccionado,
          fecha_inicio: ...,
          fecha_fin: ...
        })
      });
      const data = await response.json();
      setDatosVentasAPI(data);
    } catch (error) {
      setErrorCarga('Error al cargar datos');
    } finally {
      setCargandoDatos(false);
    }
  };
  cargarDatos();
}, [filtros...]);
```

---

## ✅ Checklist de Validación

- [x] Data Schema definido con TypeScript
- [x] Mock Data generado con valores realistas
- [x] 4 Tarjetas KPI vinculadas a campos JSON
- [x] Gráfica LineChart vinculada (Ingresos vs Gastos)
- [x] Gráfica PieChart vinculada (Distribución)
- [x] Formato europeo aplicado (€XX.XXX,XX)
- [x] Porcentajes con formato europeo (+X,X%)
- [x] Estado de carga implementado
- [x] Actualización dinámica con filtros
- [x] Documentación completa

---

## 📞 Notas para el Programador

1. **Todos los campos del schema están disponibles** - Solo se están usando algunos en la UI actual
2. **Los datos son reactivos** - Cualquier cambio en `datosVentasAPI` actualiza la UI automáticamente
3. **Formato consistente** - Usa siempre `toLocaleString('es-ES')` para números
4. **Extensibilidad** - Fácil añadir nuevas métricas usando los campos no utilizados
5. **Preparado para API** - Solo necesita reemplazar el `useEffect` con fetch real

---

**Última actualización:** 25 de noviembre de 2025
