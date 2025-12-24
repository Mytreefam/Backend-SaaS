# 📘 Integración API - Dashboard 360° Ventas

## 🎯 Objetivo
Este documento describe la integración completa entre el Dashboard 360° (sección Ventas) y el endpoint del backend que proporciona datos en tiempo real.

---

## 🔌 Configuración del Endpoint

### URL del Endpoint
```
POST /api/ventas
```

### Headers Requeridos
```json
{
  "Content-Type": "application/json"
}
```

---

## 📤 REQUEST - Parámetros de Entrada

El componente enviará los siguientes parámetros en el body de la request:

```json
{
  "empresa_id": "12345",
  "marca_id": "67890",
  "punto_venta_id": "Can Farines Centro",  // null si es "todas"
  "periodo_tipo": "mes_actual",             // hoy, ayer, semana_actual, mes_actual, mes_anterior, trimestre_actual, año_actual, personalizado
  "fecha_inicio": "2025-11-01",             // null si no es personalizado
  "fecha_fin": "2025-11-30"                 // null si no es personalizado
}
```

### Descripción de Parámetros

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `empresa_id` | string | ID único de la empresa | "12345" |
| `marca_id` | string | ID de la marca/línea de negocio | "67890" |
| `punto_venta_id` | string/null | Nombre de la tienda seleccionada o null para todas | "Can Farines Centro" |
| `periodo_tipo` | string | Tipo de período predefinido | "mes_actual" |
| `fecha_inicio` | string/null | Fecha de inicio en formato YYYY-MM-DD | "2025-11-01" |
| `fecha_fin` | string/null | Fecha de fin en formato YYYY-MM-DD | "2025-11-30" |

### Valores Posibles para `periodo_tipo`
- `hoy` - Datos del día actual
- `ayer` - Datos del día anterior
- `semana_actual` - Semana en curso (lunes a domingo)
- `mes_actual` - Mes en curso
- `mes_anterior` - Mes pasado completo
- `trimestre_actual` - Trimestre en curso
- `año_actual` - Año en curso
- `personalizado` - Rango personalizado (requiere fecha_inicio y fecha_fin)

---

## 📥 RESPONSE - Estructura del JSON

### Formato Completo (JSON Plano)

```json
{
  "empresa_id": "12345",
  "marca_id": "67890",
  "punto_venta_id": "Can Farines Centro",
  "periodo_tipo": "mes_actual",
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-30",

  "ventas_periodo": 45890.50,
  "pedidos_periodo": 342,
  "productos_vendidos": 1247,
  "ticket_medio_pedido": 134.21,
  "ticket_medio_producto": 36.80,

  "costes_variables_periodo": 18356.20,
  "costes_fijos_imputados_periodo": 12400.00,
  "comisiones_tpv_periodo": 1148.26,
  "comisiones_plataformas_periodo": 2294.53,
  "comisiones_pasarela_periodo": 458.91,

  "margen_neto_periodo": 11232.60,
  "variacion_ventas_periodo": 12.5,
  "variacion_margen_neto_periodo": 8.3,

  "ventas_mostrador": 28450.00,
  "variacion_mostrador": 8.2,
  "ventas_app_web": 12890.00,
  "variacion_app_web": 15.4,
  "ventas_terceros": 4550.50,
  "variacion_terceros": 12.1,
  "ventas_efectivo": 18320.00,
  "variacion_efectivo": 5.8,

  "ingresos_ultimos_5_meses": [38000, 41000, 39500, 43000, 45890.50],
  "gastos_ultimos_5_meses": [22000, 24000, 23500, 25000, 26500],
  "labels_ultimos_5_meses": ["Jul", "Ago", "Sep", "Oct", "Nov"],

  "categorias_ingresos": ["Pan y Bollería", "Pastelería", "Bebidas", "Complementos"],
  "valores_ingresos_categorias": [45, 30, 15, 10]
}
```

### Descripción de Campos

#### 🔍 Metadatos de Contexto
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `empresa_id` | string | ID de la empresa (eco de la request) |
| `marca_id` | string | ID de la marca (eco de la request) |
| `punto_venta_id` | string | Punto de venta seleccionado |
| `periodo_tipo` | string | Tipo de período consultado |
| `fecha_inicio` | string | Fecha de inicio del período |
| `fecha_fin` | string | Fecha de fin del período |

#### 💰 KPIs Principales
| Campo | Tipo | Descripción | Formato |
|-------|------|-------------|---------|
| `ventas_periodo` | number | Total de ventas en el período | Euros con decimales |
| `pedidos_periodo` | number | Número total de pedidos | Entero |
| `productos_vendidos` | number | Cantidad de productos vendidos | Entero |
| `ticket_medio_pedido` | number | Valor medio por pedido | Euros con decimales |
| `ticket_medio_producto` | number | Valor medio por producto | Euros con decimales |

#### 📊 Costes y Comisiones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `costes_variables_periodo` | number | Costes variables (COGS) |
| `costes_fijos_imputados_periodo` | number | Costes fijos imputados al período |
| `comisiones_tpv_periodo` | number | Comisiones de TPV/Tarjetas |
| `comisiones_plataformas_periodo` | number | Comisiones de Glovo, Uber Eats, etc. |
| `comisiones_pasarela_periodo` | number | Comisiones de pasarela de pago |

#### 📈 Márgenes y Variaciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `margen_neto_periodo` | number | Margen neto después de todos los costes |
| `variacion_ventas_periodo` | number | Variación % vs período anterior |
| `variacion_margen_neto_periodo` | number | Variación % del margen neto |

#### 🏪 Ventas por Canal
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ventas_mostrador` | number | Ventas en tienda física |
| `variacion_mostrador` | number | Variación % mostrador |
| `ventas_app_web` | number | Ventas por app/web |
| `variacion_app_web` | number | Variación % app/web |
| `ventas_terceros` | number | Ventas por plataformas terceras |
| `variacion_terceros` | number | Variación % terceros |
| `ventas_efectivo` | number | Ventas en efectivo |
| `variacion_efectivo` | number | Variación % efectivo |

#### 📊 Datos para Gráficas

**Gráfica: Ingresos vs Gastos (Últimos 5 meses)**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ingresos_ultimos_5_meses` | number[] | Array de ingresos [mes-5, mes-4, mes-3, mes-2, mes-1] |
| `gastos_ultimos_5_meses` | number[] | Array de gastos [mes-5, mes-4, mes-3, mes-2, mes-1] |
| `labels_ultimos_5_meses` | string[] | Labels de los meses ["Jul", "Ago", "Sep", "Oct", "Nov"] |

**Gráfica: Distribución de Ingresos por Categoría**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `categorias_ingresos` | string[] | Nombres de las categorías ["Pan y Bollería", "Pastelería", ...] |
| `valores_ingresos_categorias` | number[] | Porcentajes por categoría [45, 30, 15, 10] |

---

## 🎨 Mapeo de Componentes UI

### Tarjetas KPI (4 Cards)

#### 1️⃣ Tarjeta "Mostrador"
```tsx
Valor: ventas_mostrador → formateado como "€28.450,00"
Variación: variacion_mostrador → formateado como "+8,2%"
Icon: ShoppingCart
Color: border-teal-200
```

#### 2️⃣ Tarjeta "App/Web"
```tsx
Valor: ventas_app_web → formateado como "€12.890,00"
Variación: variacion_app_web → formateado como "+15,4%"
Icon: Package
Color: border-blue-200
```

#### 3️⃣ Tarjeta "Terceros"
```tsx
Valor: ventas_terceros → formateado como "€4.550,50"
Variación: variacion_terceros → formateado como "+12,1%"
Icon: Users
Color: border-purple-200
```

#### 4️⃣ Tarjeta "Total Efectivo"
```tsx
Valor: ventas_efectivo → formateado como "€18.320,00"
Variación: variacion_efectivo → formateado como "+5,8%"
Icon: DollarSign
Color: border-green-200 bg-green-50
```

### Gráficas

#### 📊 Gráfica LineChart: "Ingresos vs Gastos"
```tsx
Data Source:
- Serie 1 (Ingresos): ingresos_ultimos_5_meses
- Serie 2 (Gastos): gastos_ultimos_5_meses
- Eje X: labels_ultimos_5_meses

Configuración:
- Tipo: LineChart (recharts)
- Colores: 
  - Ingresos: #0d9488 (teal-600)
  - Gastos: #f59e0b (amber-500)
```

#### 🥧 Gráfica PieChart: "Distribución de Ingresos"
```tsx
Data Source:
- Categorías: categorias_ingresos
- Valores: valores_ingresos_categorias

Configuración:
- Tipo: PieChart (recharts)
- Colores cíclicos: ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4']
- Label: "{nombre} {valor}%"
```

---

## 🔧 Configuración del Código

### Archivo Modificado
```
/components/gerente/Dashboard360.tsx
```

### Variables de Configuración

Para configurar el endpoint, modifica la función `cargarDatosVentas()`:

```tsx
// Línea ~150 en Dashboard360.tsx
const response = await fetch('/api/ventas', {  // ⬅️ CAMBIAR ESTA URL
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    empresa_id: '12345',          // ⬅️ CAMBIAR POR ID REAL
    marca_id: '67890',            // ⬅️ CAMBIAR POR ID REAL
    punto_venta_id: tiendaSeleccionada === 'todas' ? null : tiendaSeleccionada,
    periodo_tipo: periodoSeleccionado,
    fecha_inicio: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}` : null,
    fecha_fin: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado}-${diaSeleccionado}` : null
  })
});
```

---

## 🧪 Datos de Prueba (Mock)

Para pruebas locales, puedes crear un mock endpoint que devuelva:

```json
{
  "empresa_id": "test123",
  "marca_id": "test456",
  "punto_venta_id": "Can Farines Centro",
  "periodo_tipo": "mes_actual",
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-30",
  "ventas_periodo": 45890.50,
  "pedidos_periodo": 342,
  "productos_vendidos": 1247,
  "ticket_medio_pedido": 134.21,
  "ticket_medio_producto": 36.80,
  "costes_variables_periodo": 18356.20,
  "costes_fijos_imputados_periodo": 12400.00,
  "comisiones_tpv_periodo": 1148.26,
  "comisiones_plataformas_periodo": 2294.53,
  "comisiones_pasarela_periodo": 458.91,
  "margen_neto_periodo": 11232.60,
  "variacion_ventas_periodo": 12.5,
  "variacion_margen_neto_periodo": 8.3,
  "ventas_mostrador": 28450.00,
  "variacion_mostrador": 8.2,
  "ventas_app_web": 12890.00,
  "variacion_app_web": 15.4,
  "ventas_terceros": 4550.50,
  "variacion_terceros": 12.1,
  "ventas_efectivo": 18320.00,
  "variacion_efectivo": 5.8,
  "ingresos_ultimos_5_meses": [38000, 41000, 39500, 43000, 45890.50],
  "gastos_ultimos_5_meses": [22000, 24000, 23500, 25000, 26500],
  "labels_ultimos_5_meses": ["Jul", "Ago", "Sep", "Oct", "Nov"],
  "categorias_ingresos": ["Pan y Bollería", "Pastelería", "Bebidas", "Complementos"],
  "valores_ingresos_categorias": [45, 30, 15, 10]
}
```

---

## ⚠️ Manejo de Errores

El componente maneja los siguientes estados:

### 🔄 Estado de Carga
```tsx
{cargandoDatos && (
  <Loader2 className="w-10 h-10 animate-spin" />
)}
```

### ❌ Estado de Error
```tsx
{errorCarga && (
  <AlertCircle className="w-10 h-10 text-red-500" />
  <p className="text-red-500">{errorCarga}</p>
)}
```

### ⚠️ Sin Datos
```tsx
{!datosVentasAPI && (
  <AlertCircle className="w-10 h-10 text-red-500" />
  <p>No se han obtenido datos</p>
)}
```

---

## 🚀 Flujo de Integración

1. **Usuario selecciona filtros** (tienda, período, fecha)
2. **useEffect detecta cambio** en los filtros
3. **Se dispara cargarDatosVentas()**
4. **Request POST** al endpoint `/api/ventas`
5. **Backend procesa** y devuelve JSON
6. **Frontend actualiza** `datosVentasAPI`
7. **Componentes se re-renderizan** con datos reales

---

## 📋 Checklist de Implementación

### Para el Programador Backend:
- [ ] Crear endpoint POST `/api/ventas`
- [ ] Implementar lógica de filtrado por `punto_venta_id`
- [ ] Implementar lógica de períodos (`periodo_tipo`)
- [ ] Calcular ventas por canal (mostrador, app/web, terceros, efectivo)
- [ ] Calcular variaciones vs período anterior
- [ ] Generar arrays para últimos 5 meses
- [ ] Calcular distribución por categorías
- [ ] Devolver JSON con estructura exacta
- [ ] Implementar manejo de errores
- [ ] Añadir logging para debug

### Para el Programador Frontend:
- [ ] Configurar URL del endpoint real
- [ ] Actualizar `empresa_id` y `marca_id` reales
- [ ] Probar con datos mock
- [ ] Validar formato de precios (europeo)
- [ ] Testear estados de carga/error
- [ ] Validar responsive en móvil
- [ ] Verificar filtros funcionan correctamente
- [ ] Testear todas las combinaciones de período

---

## 📞 Soporte

Para dudas sobre la integración, contactar al equipo de desarrollo o revisar la documentación en este archivo.

**Última actualización:** 25 de noviembre de 2025
