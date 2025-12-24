# 📊 ESPECIFICACIÓN TÉCNICA: COMPARATIVA EBITDA CON INDICADORES

**Módulo:** Dashboard 360° - Cuenta de Resultados  
**Perfil:** GERENTE_GENERAL  
**Fecha:** 26 de Noviembre de 2025  
**Versión:** 1.0

---

## 1. RESUMEN EJECUTIVO

Se ha implementado un sistema de **comparativa visual entre tiendas/puntos de venta** en la Cuenta de Resultados (EBITDA). Cuando el toggle "Comparativa" está activo, cada línea muestra:

- **Icono visual:** Flecha verde ↑ o roja ↓ según performance
- **Porcentaje de variación:** "+X.X%" o "-X.X%" con una cifra decimal
- **Tooltip informativo:** Diferencia absoluta (€) y diferencia porcentual (%)

---

## 2. LÓGICA DE CÁLCULO

### 2.1. Fórmulas

```javascript
// Importe actual = importe del punto de venta seleccionado (base)
// Importe comparada = importe del punto de venta a comparar

estado_comparativa_abs = importe_actual - importe_comparada

estado_comparativa_% = (importe_actual - importe_comparada) / ABS(importe_comparada) * 100
```

### 2.2. Ejemplos

#### Ejemplo 1: Crecimiento positivo

```
Tiana (actual): 185.000 €
Poblenou (comparada): 175.000 €

estado_comparativa_abs = 185.000 - 175.000 = 10.000 €
estado_comparativa_% = (185.000 - 175.000) / 175.000 * 100 = 5.7%

→ Icono: ↑ verde
→ Texto: "+5.7%"
```

#### Ejemplo 2: Decrecimiento negativo

```
Tiana (actual): 165.000 €
Poblenou (comparada): 175.000 €

estado_comparativa_abs = 165.000 - 175.000 = -10.000 €
estado_comparativa_% = (165.000 - 175.000) / 175.000 * 100 = -5.7%

→ Icono: ↓ roja
→ Texto: "-5.7%"
```

#### Ejemplo 3: Valores negativos (costes/gastos)

```
Tiana coste actual: 80.000 €
Poblenou coste comparado: 75.000 €

estado_comparativa_abs = 80.000 - 75.000 = 5.000 €
estado_comparativa_% = (80.000 - 75.000) / 75.000 * 100 = 6.7%

→ Icono: ↑ verde (pero en este contexto es NEGATIVO porque el coste subió)
→ IMPORTANTE: En costes/gastos, ↑ significa PEOR performance
```

---

## 3. ESTRUCTURA DE DATOS

### 3.1. Request a Make.com

**Endpoint:** `POST /api/gerente/cuenta-resultados/comparativa`

```json
{
  "user_id": "uuid-pau",
  "filtros": {
    "empresa_id": "EMP-001",
    "selected_context": [
      {
        "empresa_id": "EMP-001",
        "marca_id": "MRC-001",
        "punto_venta_id": "PDV-TIA"
      }
    ],
    "punto_venta_id_base": "PDV-TIA",
    "punto_venta_id_comparada": "PDV-BAD",
    "periodo_tipo": "mes",
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-11-30",
    "modo_visualizacion": "mes_completo"
  },
  "comparativa_activa": true,
  "timestamp": "2025-11-26T15:30:00Z"
}
```

### 3.2. Response de Make.com

```json
{
  "success": true,
  "filtros": {
    "punto_venta_base": {
      "punto_venta_id": "PDV-TIA",
      "nombre": "Tiana",
      "codigo": "PDV-TIA"
    },
    "punto_venta_comparada": {
      "punto_venta_id": "PDV-BAD",
      "nombre": "Badalona",
      "codigo": "PDV-BAD"
    },
    "periodo": "Noviembre 2025",
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-11-30"
  },
  "lineas": [
    {
      "id": "ING_MOSTRADOR",
      "grupo": "INGRESOS_NETOS",
      "concepto": "Ingresos por ventas en mostrador",
      "tipo": "detalle",
      "importe_base": 183750.00,
      "importe_comparada": 178500.00,
      "estado_comparativa_abs": 5250.00,
      "estado_comparativa_pct": 2.9,
      "es_positivo": true
    },
    {
      "id": "ING_APP_WEB",
      "grupo": "INGRESOS_NETOS",
      "concepto": "Ingresos App / Web",
      "importe_base": 91800.00,
      "importe_comparada": 88400.00,
      "estado_comparativa_abs": 3400.00,
      "estado_comparativa_pct": 3.8,
      "es_positivo": true
    },
    {
      "id": "CSV_MATERIAS",
      "grupo": "COSTE_VENTAS",
      "concepto": "Materias primas alimentación",
      "importe_base": 71250.00,
      "importe_comparada": 72750.00,
      "estado_comparativa_abs": -1500.00,
      "estado_comparativa_pct": -2.1,
      "es_positivo": false
    }
  ],
  "totales": [
    {
      "id": "TOTAL_INGRESOS_NETOS",
      "concepto": "TOTAL INGRESOS NETOS",
      "importe_base": 304090.00,
      "importe_comparada": 294760.00,
      "estado_comparativa_abs": 9330.00,
      "estado_comparativa_pct": 3.2,
      "es_positivo": true
    },
    {
      "id": "EBITDA",
      "concepto": "EBITDA",
      "importe_base": 52140.00,
      "importe_comparada": 48230.00,
      "estado_comparativa_abs": 3910.00,
      "estado_comparativa_pct": 8.1,
      "es_positivo": true
    }
  ]
}
```

---

## 4. QUERIES SQL PARA MAKE.COM

### 4.1. Query Base: Obtener Datos de Dos Puntos de Venta

```sql
-- Calcular datos para punto de venta BASE
WITH datos_base AS (
  SELECT 
    'ING_MOSTRADOR' AS id,
    'INGRESOS_NETOS' AS grupo,
    'Ingresos por ventas en mostrador' AS concepto,
    SUM(v.importe_total) AS importe
  FROM ventas v
  WHERE v.punto_venta_id = :punto_venta_id_base
    AND v.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND v.canal = 'mostrador'
    AND v.estado = 'completado'
  
  UNION ALL
  
  SELECT 
    'ING_APP_WEB' AS id,
    'INGRESOS_NETOS' AS grupo,
    'Ingresos App / Web' AS concepto,
    SUM(v.importe_total) AS importe
  FROM ventas v
  WHERE v.punto_venta_id = :punto_venta_id_base
    AND v.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND v.canal IN ('app', 'web')
    AND v.estado = 'completado'
  
  UNION ALL
  
  SELECT 
    'CSV_MATERIAS' AS id,
    'COSTE_VENTAS' AS grupo,
    'Materias primas alimentación' AS concepto,
    SUM(c.importe) AS importe
  FROM costes c
  WHERE c.punto_venta_id = :punto_venta_id_base
    AND c.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND c.categoria = 'materias_primas'
),

-- Calcular datos para punto de venta COMPARADA
datos_comparada AS (
  SELECT 
    'ING_MOSTRADOR' AS id,
    SUM(v.importe_total) AS importe
  FROM ventas v
  WHERE v.punto_venta_id = :punto_venta_id_comparada
    AND v.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND v.canal = 'mostrador'
    AND v.estado = 'completado'
  
  UNION ALL
  
  SELECT 
    'ING_APP_WEB' AS id,
    SUM(v.importe_total) AS importe
  FROM ventas v
  WHERE v.punto_venta_id = :punto_venta_id_comparada
    AND v.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND v.canal IN ('app', 'web')
    AND v.estado = 'completado'
  
  UNION ALL
  
  SELECT 
    'CSV_MATERIAS' AS id,
    SUM(c.importe) AS importe
  FROM costes c
  WHERE c.punto_venta_id = :punto_venta_id_comparada
    AND c.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND c.categoria = 'materias_primas'
)

-- Combinar y calcular diferencias
SELECT 
  db.id,
  db.grupo,
  db.concepto,
  db.importe AS importe_base,
  dc.importe AS importe_comparada,
  (db.importe - dc.importe) AS estado_comparativa_abs,
  ROUND(
    ((db.importe - dc.importe) / NULLIF(ABS(dc.importe), 0)) * 100,
    1
  ) AS estado_comparativa_pct,
  CASE 
    WHEN (db.importe - dc.importe) >= 0 THEN true 
    ELSE false 
  END AS es_positivo
FROM datos_base db
INNER JOIN datos_comparada dc ON db.id = dc.id
ORDER BY db.grupo, db.id;
```

### 4.2. Query Optimizado con Tabla Pre-calculada

```sql
-- Usar tabla kpis_precalculados para mayor velocidad
SELECT 
  kp_base.linea_id AS id,
  kp_base.grupo,
  kp_base.concepto,
  kp_base.importe AS importe_base,
  kp_comp.importe AS importe_comparada,
  (kp_base.importe - kp_comp.importe) AS estado_comparativa_abs,
  ROUND(
    ((kp_base.importe - kp_comp.importe) / NULLIF(ABS(kp_comp.importe), 0)) * 100,
    1
  ) AS estado_comparativa_pct,
  CASE 
    WHEN (kp_base.importe - kp_comp.importe) >= 0 THEN true 
    ELSE false 
  END AS es_positivo
FROM kpis_cuenta_resultados kp_base
INNER JOIN kpis_cuenta_resultados kp_comp 
  ON kp_base.linea_id = kp_comp.linea_id
  AND kp_comp.punto_venta_id = :punto_venta_id_comparada
  AND kp_comp.fecha BETWEEN :fecha_inicio AND :fecha_fin
WHERE kp_base.punto_venta_id = :punto_venta_id_base
  AND kp_base.fecha BETWEEN :fecha_inicio AND :fecha_fin
ORDER BY kp_base.orden;
```

---

## 5. TRIGGERS Y RECÁLCULOS

### 5.1. Cuándo Recalcular

Make.com debe recalcular los datos de comparativa cuando:

1. **Cambia el filtro de contexto** (empresas/marcas/puntos de venta seleccionados)
2. **Cambia el mes/periodo** de análisis
3. **Cambia la tienda base** (selector principal)
4. **Cambia la tienda comparada** (selector "Comparar con")
5. **Se activa/desactiva el toggle "Comparativa"**
6. **Se registra una nueva venta o gasto** en cualquiera de las dos tiendas (opcional: debounce de 5 min)

### 5.2. Eventos Webhook

**Evento:** `ebitda_comparativa_filter_changed`

```json
{
  "event": "ebitda_comparativa_filter_changed",
  "timestamp": "2025-11-26T15:30:00Z",
  "user_id": "uuid-pau",
  "punto_venta_base": "PDV-TIA",
  "punto_venta_comparada": "PDV-BAD",
  "periodo": {
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-11-30"
  },
  "contexto_seleccionado": [
    {
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": null
    }
  ]
}
```

---

## 6. VISUALIZACIÓN EN FRONTEND

### 6.1. Columna "Estado" en Modo Comparativa

```
┌──────────────────────────────────────────────┐
│ Estado                                       │
├──────────────────────────────────────────────┤
│ ↑ +5.7%    [hover muestra tooltip]          │
│ ↓ -2.3%    [hover muestra tooltip]          │
│ ↑ +12.4%   [hover muestra tooltip]          │
└──────────────────────────────────────────────┘
```

### 6.2. Tooltip al Pasar el Ratón

```
┌─────────────────────────────────────────┐
│ Comparativa vs Badalona                 │
├─────────────────────────────────────────┤
│ Diferencia absoluta:  +5.250 €         │
│ Diferencia porcentual: +2.9%            │
└─────────────────────────────────────────┘
```

### 6.3. Código HTML Generado

```html
<div class="flex items-center justify-center gap-1">
  <!-- Icono: verde si positivo, rojo si negativo -->
  <svg class="w-4 h-4 text-green-600">
    <path d="M12 19V6M5 12l7-7 7 7"/> <!-- ArrowUp -->
  </svg>
  
  <!-- Texto del porcentaje -->
  <span class="text-sm font-medium text-green-600">
    +5.7%
  </span>
</div>

<!-- Tooltip (invisible hasta hover) -->
<div class="tooltip">
  <div>
    <strong>Comparativa vs Badalona</strong>
  </div>
  <div>
    Diferencia absoluta: <span class="text-green-400">+5.250 €</span>
  </div>
  <div>
    Diferencia porcentual: <span class="text-green-400">+5.7%</span>
  </div>
</div>
```

---

## 7. CASOS ESPECIALES

### 7.1. División por Cero

Si `importe_comparada = 0`:

```javascript
estado_comparativa_pct = null; // No calculable
// Mostrar: "N/A" o "Sin datos"
```

### 7.2. Ambos Valores son Cero

```javascript
if (importe_base === 0 && importe_comparada === 0) {
  estado_comparativa_pct = 0;
  estado_comparativa_abs = 0;
  // Mostrar: "0.0%" sin icono
}
```

### 7.3. Valores Negativos (EBITDA negativo)

```javascript
// Si el EBITDA es negativo en ambas tiendas
Tiana: -5.000 €
Badalona: -8.000 €

estado_comparativa_abs = -5.000 - (-8.000) = 3.000 €
estado_comparativa_pct = (-5.000 - (-8.000)) / ABS(-8.000) * 100 = 37.5%

→ Icono: ↑ verde (porque Tiana pierde MENOS que Badalona)
→ Texto: "+37.5%"
→ Interpretación: Tiana tiene mejor performance (menos pérdidas)
```

### 7.4. Cambio de Signo (de negativo a positivo)

```javascript
Tiana: +2.000 € (EBITDA positivo)
Badalona: -1.000 € (EBITDA negativo)

estado_comparativa_abs = 2.000 - (-1.000) = 3.000 €
estado_comparativa_pct = (2.000 - (-1.000)) / ABS(-1.000) * 100 = 300%

→ Icono: ↑ verde
→ Texto: "+300%"
→ Interpretación: Mejora significativa
```

---

## 8. INTERPRETACIÓN SEMÁNTICA

### 8.1. Ingresos (más es mejor)

| Icono | Significado | Color |
|-------|-------------|-------|
| ↑ +X% | Tiana gana MÁS que comparada | 🟢 Verde |
| ↓ -X% | Tiana gana MENOS que comparada | 🔴 Rojo |

### 8.2. Costes y Gastos (menos es mejor)

| Icono | Significado | Color |
|-------|-------------|-------|
| ↑ +X% | Tiana gasta MÁS que comparada | 🟢 Verde (técnicamente, pero PEOR) |
| ↓ -X% | Tiana gasta MENOS que comparada | 🔴 Rojo (técnicamente, pero MEJOR) |

**⚠️ IMPORTANTE:** La flecha indica la **dirección matemática**, no el juicio de valor. Un coste que sube (↑) es técnicamente "positivo" en matemáticas, pero negativo en negocio.

**Solución futura (opcional):** Invertir colores para costes/gastos:
- Costes ↑ → Rojo (malo)
- Costes ↓ → Verde (bueno)

---

## 9. TESTING Y VALIDACIÓN

### 9.1. Test Cases

```javascript
// TEST 1: Crecimiento positivo básico
describe('Comparativa EBITDA', () => {
  test('Calcula correctamente crecimiento positivo', () => {
    const base = 100;
    const comparada = 80;
    const result = calcularComparativa(base, comparada);
    
    expect(result.abs).toBe(20);
    expect(result.pct).toBe(25.0);
    expect(result.esPositivo).toBe(true);
  });
  
  // TEST 2: Decrecimiento negativo
  test('Calcula correctamente decrecimiento', () => {
    const base = 80;
    const comparada = 100;
    const result = calcularComparativa(base, comparada);
    
    expect(result.abs).toBe(-20);
    expect(result.pct).toBe(-20.0);
    expect(result.esPositivo).toBe(false);
  });
  
  // TEST 3: División por cero
  test('Maneja división por cero', () => {
    const base = 50;
    const comparada = 0;
    const result = calcularComparativa(base, comparada);
    
    expect(result.pct).toBeNull();
  });
  
  // TEST 4: Valores negativos
  test('Calcula con valores negativos', () => {
    const base = -5000;
    const comparada = -8000;
    const result = calcularComparativa(base, comparada);
    
    expect(result.abs).toBe(3000);
    expect(result.pct).toBe(37.5);
    expect(result.esPositivo).toBe(true);
  });
});
```

### 9.2. Checklist de Validación

- [ ] Los porcentajes se redondean a 1 cifra decimal
- [ ] El signo "+" se muestra en positivos, "-" en negativos
- [ ] Los iconos ↑↓ son del tamaño correcto (w-4 h-4)
- [ ] El tooltip aparece al hover
- [ ] El tooltip desaparece al quitar el ratón
- [ ] Los colores verde/rojo son consistentes
- [ ] El formateo de euros usa punto para miles (1.250 €)
- [ ] Se maneja correctamente división por cero
- [ ] Funciona con valores negativos
- [ ] Se recalcula al cambiar filtros

---

## 10. PERFORMANCE Y OPTIMIZACIÓN

### 10.1. Caché

```javascript
// Clave de caché
const cacheKey = `comparativa:${punto_venta_base}:${punto_venta_comparada}:${fecha_inicio}:${fecha_fin}`;

// TTL: 5 minutos para datos en tiempo real
// TTL: 1 hora para datos históricos
```

### 10.2. Query Optimizations

```sql
-- Índices recomendados
CREATE INDEX idx_ventas_pdv_fecha_canal 
ON ventas(punto_venta_id, fecha, canal) 
WHERE estado = 'completado';

CREATE INDEX idx_costes_pdv_fecha_categoria 
ON costes(punto_venta_id, fecha, categoria);

-- Materialized view para comparativas frecuentes
CREATE MATERIALIZED VIEW mv_comparativa_tiendas AS
SELECT 
  pv.punto_venta_id,
  DATE_TRUNC('day', v.fecha) AS fecha,
  'ingresos' AS tipo,
  SUM(v.importe_total) AS importe
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.estado = 'completado'
GROUP BY pv.punto_venta_id, DATE_TRUNC('day', v.fecha);

-- Refrescar cada hora
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_comparativa_tiendas;
```

---

## 11. INTEGRACIÓN CON FILTRO DE CONTEXTO JERÁRQUICO

Cuando se usa el **Filtro de Contexto Jerárquico** (ver `/ESPECIFICACION_FILTRO_CONTEXTO_JERARQUICO.md`):

### 11.1. Comportamiento

1. **Punto de venta base:** Se determina por el `selected_context` activo
2. **Punto de venta comparada:** Se elige del dropdown "Comparar con"
3. **Validación:** Ambos PDV deben estar dentro del `selected_context`

### 11.2. Ejemplo

```json
{
  "selected_context": [
    {
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": null  // TODOS los PDV de Pizzas
    }
  ],
  "punto_venta_base": "PDV-TIA",       // Tiana (dentro del contexto)
  "punto_venta_comparada": "PDV-BAD"   // Badalona (dentro del contexto)
}
```

**✅ Válido:** Ambos PDV están en la marca Pizzas.

```json
{
  "selected_context": [
    {
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": "PDV-TIA"  // SOLO Tiana
    }
  ],
  "punto_venta_base": "PDV-TIA",
  "punto_venta_comparada": "PDV-BAD"
}
```

**❌ Inválido:** PDV-BAD no está en el contexto seleccionado.

---

## 12. DOCUMENTACIÓN PARA EL USUARIO FINAL

### 12.1. Texto de Ayuda (Tooltip "?" junto al toggle)

```
💡 Comparativa entre Tiendas

Activa esta opción para comparar el performance
de la tienda actual con otra tienda.

• Icono ↑ verde: performance superior
• Icono ↓ rojo: performance inferior
• Pasa el ratón sobre el indicador para ver
  detalles de la diferencia en € y %.

Nota: Los cálculos se actualizan automáticamente
al cambiar los filtros de periodo o tienda.
```

### 12.2. Ejemplo Visual en Documentación

```
ANTES (sin comparativa):
┌─────────────┬──────────┬──────────┬────────┐
│ Concepto    │ Objetivo │ Importe  │ Estado │
├─────────────┼──────────┼──────────┼────────┤
│ Ingresos    │ 175.000 €│ 183.750 │   ↑    │
│ Costes      │  75.000 €│  71.250 │   ↑    │
│ EBITDA      │  50.000 €│  52.140 │   ↑    │
└─────────────┴──────────┴──────────┴────────┘

DESPUÉS (con comparativa vs Badalona):
┌─────────────┬──────────┬──────────┬──────────┐
│ Concepto    │ Badalona │ Importe  │  Estado  │
├─────────────┼──────────┼──────────┼──────────┤
│ Ingresos    │ 178.500 │ 183.750 │ ↑ +2.9%  │
│ Costes      │  72.750 │  71.250 │ ↓ -2.1%  │
│ EBITDA      │  48.230 │  52.140 │ ↑ +8.1%  │
└─────────────┴──────────┴──────────┴──────────┘
```

---

## 13. ENDPOINTS API RESUMIDOS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cuenta-resultados/comparativa` | Obtener datos comparativos |
| POST | `/api/cuenta-resultados/comparativa/validate` | Validar PDVs seleccionados |
| GET | `/api/cuenta-resultados/comparativa/historico` | Histórico de comparativas |

---

## 14. CHANGELOG

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-26 | Especificación inicial |

---

**FIN DE LA ESPECIFICACIÓN**
