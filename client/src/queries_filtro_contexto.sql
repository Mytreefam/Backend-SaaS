-- ============================================================================
-- QUERIES SQL PARA FILTRO DE CONTEXTO JERÁRQUICO
-- Sistema: Udar Edge - Dashboard 360°
-- Perfil: GERENTE_GENERAL
-- ============================================================================

-- ============================================================================
-- 1. FUNCIÓN PRINCIPAL: match_context_filter
-- ============================================================================

CREATE OR REPLACE FUNCTION match_context_filter(
  p_empresa_id VARCHAR,
  p_marca_id VARCHAR,
  p_punto_venta_id VARCHAR,
  p_selected_context JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  context_item JSONB;
BEGIN
  -- Si no hay filtro (array vacío), mostrar todo
  IF jsonb_array_length(p_selected_context) = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar si el registro coincide con algún contexto seleccionado
  FOR context_item IN SELECT * FROM jsonb_array_elements(p_selected_context)
  LOOP
    -- Verificar empresa
    IF (context_item->>'empresa_id') = p_empresa_id THEN
      
      -- Si marca_id es null en el contexto, incluye todas las marcas
      IF (context_item->>'marca_id') IS NULL THEN
        RETURN TRUE;
      END IF;
      
      -- Verificar marca
      IF (context_item->>'marca_id') = p_marca_id THEN
        
        -- Si punto_venta_id es null en el contexto, incluye todos los PDV
        IF (context_item->>'punto_venta_id') IS NULL THEN
          RETURN TRUE;
        END IF;
        
        -- Verificar punto de venta exacto
        IF (context_item->>'punto_venta_id') = p_punto_venta_id THEN
          RETURN TRUE;
        END IF;
        
      END IF;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Índice para optimizar la función
CREATE INDEX IF NOT EXISTS idx_punto_venta_empresa_marca 
ON punto_venta(empresa_id, marca_id, punto_venta_id);

-- ============================================================================
-- 2. KPIs PRINCIPALES
-- ============================================================================

-- 2.1. VENTAS TOTALES
-- ----------------------------------------------------------------------------
-- Calcula ventas totales, número de pedidos y ticket medio filtrados
-- ----------------------------------------------------------------------------
SELECT 
  SUM(v.importe_total) AS ventas_totales,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio,
  COUNT(DISTINCT v.cliente_id) AS clientes_unicos
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  );

-- 2.2. EBITDA CONSOLIDADO
-- ----------------------------------------------------------------------------
-- Calcula EBITDA y margen de todo el contexto seleccionado
-- ----------------------------------------------------------------------------
SELECT 
  SUM(df.ventas) AS total_ventas,
  SUM(df.coste_ventas) AS total_coste_ventas,
  SUM(df.gastos_operativos) AS total_gastos_operativos,
  SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
  ROUND(
    (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100, 
    2
  ) AS margen_ebitda_porcentaje
FROM datos_financieros df
INNER JOIN punto_venta pv ON df.punto_venta_id = pv.punto_venta_id
WHERE df.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  );

-- 2.3. NPS (NET PROMOTER SCORE)
-- ----------------------------------------------------------------------------
-- Calcula NPS basado en valoraciones de clientes
-- ----------------------------------------------------------------------------
WITH valoraciones_filtradas AS (
  SELECT 
    val.valoracion,
    CASE
      WHEN val.valoracion >= 9 THEN 'promotor'
      WHEN val.valoracion <= 6 THEN 'detractor'
      ELSE 'neutral'
    END AS tipo_cliente
  FROM valoraciones val
  INNER JOIN pedidos p ON val.pedido_id = p.pedido_id
  INNER JOIN punto_venta pv ON p.punto_venta_id = pv.punto_venta_id
  WHERE val.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND match_context_filter(
      pv.empresa_id, 
      pv.marca_id, 
      pv.punto_venta_id,
      :selected_context::JSONB
    )
)
SELECT 
  COUNT(*) AS total_valoraciones,
  ROUND(AVG(valoracion), 1) AS valoracion_media,
  ROUND(
    ((COUNT(*) FILTER (WHERE tipo_cliente = 'promotor')::DECIMAL / COUNT(*)) * 100) -
    ((COUNT(*) FILTER (WHERE tipo_cliente = 'detractor')::DECIMAL / COUNT(*)) * 100),
    1
  ) AS nps
FROM valoraciones_filtradas;

-- ============================================================================
-- 3. DESGLOSE POR JERARQUÍA
-- ============================================================================

-- 3.1. VENTAS POR EMPRESA
-- ----------------------------------------------------------------------------
SELECT 
  e.empresa_id,
  e.codigo_empresa,
  e.nombre AS empresa_nombre,
  COUNT(DISTINCT pv.punto_venta_id) AS num_puntos_venta,
  SUM(v.importe_total) AS ventas_totales,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY e.empresa_id, e.codigo_empresa, e.nombre
ORDER BY ventas_totales DESC;

-- 3.2. VENTAS POR MARCA
-- ----------------------------------------------------------------------------
SELECT 
  e.empresa_id,
  e.nombre AS empresa_nombre,
  m.marca_id,
  m.codigo_marca,
  m.nombre AS marca_nombre,
  COUNT(DISTINCT pv.punto_venta_id) AS num_puntos_venta,
  SUM(v.importe_total) AS ventas_totales,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio,
  ROUND(
    (SUM(v.importe_total) / SUM(SUM(v.importe_total)) OVER ()) * 100,
    2
  ) AS porcentaje_ventas
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY e.empresa_id, e.nombre, m.marca_id, m.codigo_marca, m.nombre
ORDER BY ventas_totales DESC;

-- 3.3. VENTAS POR PUNTO DE VENTA
-- ----------------------------------------------------------------------------
SELECT 
  e.empresa_id,
  e.nombre AS empresa_nombre,
  m.marca_id,
  m.nombre AS marca_nombre,
  pv.punto_venta_id,
  pv.codigo_punto_venta,
  pv.nombre_comercial AS pdv_nombre,
  SUM(v.importe_total) AS ventas_totales,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio,
  COUNT(DISTINCT v.cliente_id) AS clientes_unicos,
  ROUND(
    (SUM(v.importe_total) / SUM(SUM(v.importe_total)) OVER ()) * 100,
    2
  ) AS porcentaje_ventas
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY 
  e.empresa_id, e.nombre,
  m.marca_id, m.nombre,
  pv.punto_venta_id, pv.codigo_punto_venta, pv.nombre_comercial
ORDER BY ventas_totales DESC;

-- ============================================================================
-- 4. GRÁFICOS Y TENDENCIAS
-- ============================================================================

-- 4.1. VENTAS POR DÍA (para gráfico de líneas)
-- ----------------------------------------------------------------------------
SELECT 
  v.fecha::DATE AS fecha,
  SUM(v.importe_total) AS ventas_dia,
  COUNT(DISTINCT v.pedido_id) AS pedidos_dia,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio_dia
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY v.fecha::DATE
ORDER BY fecha;

-- 4.2. VENTAS POR CATEGORÍA (para gráfico de barras)
-- ----------------------------------------------------------------------------
SELECT 
  cat.categoria_id,
  cat.nombre AS categoria_nombre,
  SUM(vi.cantidad) AS unidades_vendidas,
  SUM(vi.subtotal) AS ventas_categoria,
  ROUND(
    (SUM(vi.subtotal) / SUM(SUM(vi.subtotal)) OVER ()) * 100,
    2
  ) AS porcentaje_ventas
FROM ventas_items vi
INNER JOIN productos prod ON vi.producto_id = prod.producto_id
INNER JOIN categorias cat ON prod.categoria_id = cat.categoria_id
INNER JOIN ventas v ON vi.venta_id = v.venta_id
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY cat.categoria_id, cat.nombre
ORDER BY ventas_categoria DESC;

-- 4.3. TOP 10 PRODUCTOS (para tabla ranking)
-- ----------------------------------------------------------------------------
SELECT 
  prod.producto_id,
  prod.nombre AS producto_nombre,
  cat.nombre AS categoria_nombre,
  SUM(vi.cantidad) AS unidades_vendidas,
  SUM(vi.subtotal) AS ventas_producto,
  ROUND(AVG(vi.precio_unitario), 2) AS precio_medio,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos
FROM ventas_items vi
INNER JOIN productos prod ON vi.producto_id = prod.producto_id
INNER JOIN categorias cat ON prod.categoria_id = cat.categoria_id
INNER JOIN ventas v ON vi.venta_id = v.venta_id
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND v.estado = 'completado'
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY prod.producto_id, prod.nombre, cat.nombre
ORDER BY ventas_producto DESC
LIMIT 10;

-- ============================================================================
-- 5. CIERRES DE CAJA
-- ============================================================================

-- 5.1. LISTA DE CIERRES FILTRADOS
-- ----------------------------------------------------------------------------
SELECT 
  c.cierre_id,
  c.fecha_cierre,
  c.turno,
  pv.punto_venta_id,
  pv.codigo_punto_venta,
  pv.nombre_comercial AS pdv_nombre,
  m.nombre AS marca_nombre,
  e.nombre AS empresa_nombre,
  c.efectivo,
  c.tarjeta,
  c.transferencia,
  c.otros_metodos,
  c.total_ventas,
  c.diferencia,
  CASE
    WHEN c.diferencia = 0 THEN 'cuadrado'
    WHEN c.diferencia > 0 THEN 'sobrante'
    ELSE 'faltante'
  END AS estado_diferencia,
  c.cerrado_por_id,
  u.nombre AS cerrado_por_nombre,
  c.aprobado_por_id,
  c.notas
FROM cierres_caja c
INNER JOIN punto_venta pv ON c.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
LEFT JOIN usuario u ON c.cerrado_por_id = u.id_usuario
WHERE c.fecha_cierre BETWEEN :fecha_inicio AND :fecha_fin
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
ORDER BY c.fecha_cierre DESC;

-- 5.2. TOTALES DE CIERRES
-- ----------------------------------------------------------------------------
SELECT 
  COUNT(*) AS total_cierres,
  SUM(c.total_ventas) AS suma_total_ventas,
  SUM(c.efectivo) AS total_efectivo,
  SUM(c.tarjeta) AS total_tarjeta,
  SUM(c.diferencia) AS diferencia_total,
  COUNT(*) FILTER (WHERE c.diferencia = 0) AS cierres_cuadrados,
  COUNT(*) FILTER (WHERE c.diferencia > 0) AS cierres_sobrantes,
  COUNT(*) FILTER (WHERE c.diferencia < 0) AS cierres_faltantes,
  ROUND(AVG(c.total_ventas), 2) AS promedio_ventas_cierre
FROM cierres_caja c
INNER JOIN punto_venta pv ON c.punto_venta_id = pv.punto_venta_id
WHERE c.fecha_cierre BETWEEN :fecha_inicio AND :fecha_fin
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  );

-- ============================================================================
-- 6. COMPARATIVAS Y RANKING
-- ============================================================================

-- 6.1. RANKING DE PUNTOS DE VENTA POR EBITDA
-- ----------------------------------------------------------------------------
WITH ebitda_por_pdv AS (
  SELECT 
    pv.punto_venta_id,
    pv.codigo_punto_venta,
    pv.nombre_comercial,
    m.nombre AS marca_nombre,
    e.nombre AS empresa_nombre,
    SUM(df.ventas) AS ventas,
    SUM(df.coste_ventas) AS costes,
    SUM(df.gastos_operativos) AS gastos,
    SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
    ROUND(
      (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
      2
    ) AS margen_porcentaje
  FROM datos_financieros df
  INNER JOIN punto_venta pv ON df.punto_venta_id = pv.punto_venta_id
  INNER JOIN marca m ON pv.marca_id = m.marca_id
  INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
  WHERE df.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND match_context_filter(
      pv.empresa_id, 
      pv.marca_id, 
      pv.punto_venta_id,
      :selected_context::JSONB
    )
  GROUP BY pv.punto_venta_id, pv.codigo_punto_venta, pv.nombre_comercial, m.nombre, e.nombre
)
SELECT 
  *,
  RANK() OVER (ORDER BY ebitda DESC) AS ranking_ebitda,
  RANK() OVER (ORDER BY margen_porcentaje DESC) AS ranking_margen
FROM ebitda_por_pdv
ORDER BY ebitda DESC;

-- 6.2. COMPARATIVA PERIODO ANTERIOR
-- ----------------------------------------------------------------------------
WITH periodo_actual AS (
  SELECT 
    SUM(v.importe_total) AS ventas
  FROM ventas v
  INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
  WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND v.estado = 'completado'
    AND match_context_filter(pv.empresa_id, pv.marca_id, pv.punto_venta_id, :selected_context::JSONB)
),
periodo_anterior AS (
  SELECT 
    SUM(v.importe_total) AS ventas
  FROM ventas v
  INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
  WHERE v.fecha BETWEEN :fecha_inicio_anterior AND :fecha_fin_anterior
    AND v.estado = 'completado'
    AND match_context_filter(pv.empresa_id, pv.marca_id, pv.punto_venta_id, :selected_context::JSONB)
)
SELECT 
  pa.ventas AS ventas_periodo_actual,
  pan.ventas AS ventas_periodo_anterior,
  ROUND(((pa.ventas - pan.ventas) / NULLIF(pan.ventas, 0)) * 100, 2) AS variacion_porcentaje,
  CASE
    WHEN pa.ventas > pan.ventas THEN 'crecimiento'
    WHEN pa.ventas < pan.ventas THEN 'decrecimiento'
    ELSE 'estable'
  END AS tendencia
FROM periodo_actual pa, periodo_anterior pan;

-- ============================================================================
-- 7. ALERTAS Y EXCEPCIONES
-- ============================================================================

-- 7.1. PUNTOS DE VENTA CON VENTAS BAJO OBJETIVO
-- ----------------------------------------------------------------------------
WITH ventas_vs_objetivo AS (
  SELECT 
    pv.punto_venta_id,
    pv.codigo_punto_venta,
    pv.nombre_comercial,
    obj.objetivo_ventas_mes,
    SUM(v.importe_total) AS ventas_actuales,
    ROUND(
      (SUM(v.importe_total) / NULLIF(obj.objetivo_ventas_mes, 0)) * 100,
      2
    ) AS porcentaje_cumplimiento
  FROM punto_venta pv
  INNER JOIN objetivos obj ON pv.punto_venta_id = obj.punto_venta_id
  LEFT JOIN ventas v ON pv.punto_venta_id = v.punto_venta_id 
    AND v.fecha BETWEEN :fecha_inicio AND :fecha_fin
    AND v.estado = 'completado'
  WHERE obj.mes = EXTRACT(MONTH FROM :fecha_inicio::DATE)
    AND obj.año = EXTRACT(YEAR FROM :fecha_inicio::DATE)
    AND match_context_filter(pv.empresa_id, pv.marca_id, pv.punto_venta_id, :selected_context::JSONB)
  GROUP BY pv.punto_venta_id, pv.codigo_punto_venta, pv.nombre_comercial, obj.objetivo_ventas_mes
)
SELECT *
FROM ventas_vs_objetivo
WHERE porcentaje_cumplimiento < 80
ORDER BY porcentaje_cumplimiento ASC;

-- 7.2. CIERRES CON DIFERENCIAS SIGNIFICATIVAS
-- ----------------------------------------------------------------------------
SELECT 
  c.cierre_id,
  c.fecha_cierre,
  pv.nombre_comercial,
  c.total_ventas,
  c.diferencia,
  ROUND((c.diferencia / NULLIF(c.total_ventas, 0)) * 100, 2) AS porcentaje_diferencia,
  c.cerrado_por_id,
  u.nombre AS cerrado_por
FROM cierres_caja c
INNER JOIN punto_venta pv ON c.punto_venta_id = pv.punto_venta_id
LEFT JOIN usuario u ON c.cerrado_por_id = u.id_usuario
WHERE c.fecha_cierre BETWEEN :fecha_inicio AND :fecha_fin
  AND ABS(c.diferencia) > 50 -- Diferencia mayor a 50€
  AND match_context_filter(pv.empresa_id, pv.marca_id, pv.punto_venta_id, :selected_context::JSONB)
ORDER BY ABS(c.diferencia) DESC;

-- ============================================================================
-- 8. TABLA PRE-CALCULADA (Para optimización)
-- ============================================================================

-- 8.1. CREAR TABLA DE KPIS PRE-CALCULADOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpis_precalculados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id VARCHAR NOT NULL,
  marca_id VARCHAR NULL,
  punto_venta_id VARCHAR NULL,
  fecha DATE NOT NULL,
  periodo_tipo VARCHAR(20) NOT NULL, -- 'dia', 'semana', 'mes', 'trimestre', 'año'
  
  -- KPIs Ventas
  ventas_totales DECIMAL(12,2) DEFAULT 0,
  num_pedidos INTEGER DEFAULT 0,
  ticket_medio DECIMAL(10,2) DEFAULT 0,
  clientes_unicos INTEGER DEFAULT 0,
  
  -- KPIs Financieros
  coste_ventas DECIMAL(12,2) DEFAULT 0,
  gastos_operativos DECIMAL(12,2) DEFAULT 0,
  ebitda DECIMAL(12,2) DEFAULT 0,
  margen_porcentaje DECIMAL(5,2) DEFAULT 0,
  
  -- KPIs Operativos
  num_cierres INTEGER DEFAULT 0,
  diferencias_cierres DECIMAL(10,2) DEFAULT 0,
  
  -- KPIs Satisfacción
  valoracion_media DECIMAL(3,1) DEFAULT 0,
  nps DECIMAL(5,2) DEFAULT 0,
  num_valoraciones INTEGER DEFAULT 0,
  
  -- Metadatos
  calculado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(empresa_id, marca_id, punto_venta_id, fecha, periodo_tipo)
);

CREATE INDEX idx_kpis_fecha ON kpis_precalculados(fecha);
CREATE INDEX idx_kpis_empresa ON kpis_precalculados(empresa_id);
CREATE INDEX idx_kpis_marca ON kpis_precalculados(marca_id);
CREATE INDEX idx_kpis_pdv ON kpis_precalculados(punto_venta_id);
CREATE INDEX idx_kpis_periodo ON kpis_precalculados(periodo_tipo);

-- 8.2. PROCESO ETL PARA POBLAR TABLA
-- ----------------------------------------------------------------------------
-- Ejecutar cada noche a las 02:00 AM
INSERT INTO kpis_precalculados (
  empresa_id, marca_id, punto_venta_id, fecha, periodo_tipo,
  ventas_totales, num_pedidos, ticket_medio, clientes_unicos,
  coste_ventas, gastos_operativos, ebitda, margen_porcentaje
)
SELECT 
  pv.empresa_id,
  pv.marca_id,
  pv.punto_venta_id,
  v.fecha::DATE,
  'dia' AS periodo_tipo,
  SUM(v.importe_total) AS ventas_totales,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio,
  COUNT(DISTINCT v.cliente_id) AS clientes_unicos,
  COALESCE(SUM(df.coste_ventas), 0) AS coste_ventas,
  COALESCE(SUM(df.gastos_operativos), 0) AS gastos_operativos,
  COALESCE(SUM(df.ventas - df.coste_ventas - df.gastos_operativos), 0) AS ebitda,
  ROUND(
    COALESCE(
      (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
      0
    ),
    2
  ) AS margen_porcentaje
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
LEFT JOIN datos_financieros df ON pv.punto_venta_id = df.punto_venta_id 
  AND v.fecha::DATE = df.fecha
WHERE v.fecha::DATE = CURRENT_DATE - INTERVAL '1 day'
  AND v.estado = 'completado'
GROUP BY pv.empresa_id, pv.marca_id, pv.punto_venta_id, v.fecha::DATE
ON CONFLICT (empresa_id, marca_id, punto_venta_id, fecha, periodo_tipo) 
DO UPDATE SET
  ventas_totales = EXCLUDED.ventas_totales,
  num_pedidos = EXCLUDED.num_pedidos,
  ticket_medio = EXCLUDED.ticket_medio,
  clientes_unicos = EXCLUDED.clientes_unicos,
  coste_ventas = EXCLUDED.coste_ventas,
  gastos_operativos = EXCLUDED.gastos_operativos,
  ebitda = EXCLUDED.ebitda,
  margen_porcentaje = EXCLUDED.margen_porcentaje,
  actualizado_en = NOW();

-- ============================================================================
-- 9. QUERY OPTIMIZADA CON TABLA PRE-CALCULADA
-- ============================================================================

-- En lugar de calcular en tiempo real, usar datos pre-calculados
SELECT 
  kp.empresa_id,
  e.nombre AS empresa_nombre,
  kp.marca_id,
  m.nombre AS marca_nombre,
  kp.punto_venta_id,
  pv.nombre_comercial AS pdv_nombre,
  SUM(kp.ventas_totales) AS ventas_totales,
  SUM(kp.num_pedidos) AS num_pedidos,
  ROUND(AVG(kp.ticket_medio), 2) AS ticket_medio,
  SUM(kp.ebitda) AS ebitda,
  ROUND(AVG(kp.margen_porcentaje), 2) AS margen_porcentaje
FROM kpis_precalculados kp
INNER JOIN punto_venta pv ON kp.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE kp.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND kp.periodo_tipo = 'dia'
  AND match_context_filter(
    kp.empresa_id, 
    kp.marca_id, 
    kp.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY 
  kp.empresa_id, e.nombre,
  kp.marca_id, m.nombre,
  kp.punto_venta_id, pv.nombre_comercial;

-- ============================================================================
-- FIN DE QUERIES
-- ============================================================================
