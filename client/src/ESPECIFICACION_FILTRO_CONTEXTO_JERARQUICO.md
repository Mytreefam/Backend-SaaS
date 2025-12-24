# 📊 ESPECIFICACIÓN TÉCNICA: FILTRO DE CONTEXTO JERÁRQUICO

**Perfil:** GERENTE_GENERAL  
**Fecha:** 26 de Noviembre de 2025  
**Versión:** 1.0

---

## 1. RESUMEN EJECUTIVO

Se ha implementado un **filtro jerárquico con selección múltiple** que reemplaza el antiguo selector "Todas las tiendas" en el Dashboard 360° del perfil Gerente General.

Este filtro permite seleccionar múltiples:
- Empresas completas
- Marcas específicas dentro de empresas
- Puntos de venta específicos dentro de marcas

**Impacto:** Todos los KPIs, gráficos, tablas y cálculos de EBITDA deben filtrar los datos según la selección activa.

---

## 2. ESTRUCTURA DE DATOS

### 2.1. Tipo de Dato: `SelectedContext[]`

```typescript
interface SelectedContext {
  empresa_id: string;       // Obligatorio: ID de la empresa
  marca_id: string | null;  // Opcional: null = TODAS las marcas
  punto_venta_id: string | null; // Opcional: null = TODOS los PDV
}
```

### 2.2. Ejemplos de Selección

#### Ejemplo 1: Toda una empresa
```json
{
  "empresa_id": "EMP-001",
  "marca_id": null,
  "punto_venta_id": null
}
```
**Interpretación:** TODAS las marcas y TODOS los puntos de venta de EMP-001.

#### Ejemplo 2: Una marca completa
```json
{
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": null
}
```
**Interpretación:** TODOS los puntos de venta de la marca MRC-001 (Pizzas).

#### Ejemplo 3: Un punto de venta específico
```json
{
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-TIA"
}
```
**Interpretación:** SOLO el punto de venta PDV-TIA de la marca Pizzas.

#### Ejemplo 4: Selección múltiple mixta
```json
[
  {
    "empresa_id": "EMP-001",
    "marca_id": null,
    "punto_venta_id": null
  },
  {
    "empresa_id": "EMP-002",
    "marca_id": "MRC-003",
    "punto_venta_id": "PDV-BCN"
  }
]
```
**Interpretación:** 
- TODA la empresa Hostelería (EMP-001)
- SOLO el PDV-BCN de Catering Premium (MRC-003) de Eventos (EMP-002)

#### Ejemplo 5: Sin selección (por defecto)
```json
[]
```
**Interpretación:** TODAS las empresas, marcas y puntos de venta (sin filtro).

---

## 3. INTEGRACIÓN CON MAKE.COM / BACKEND

### 3.1. Endpoint de Filtrado

**POST** `/api/gerente/dashboard/filter`

**Request Body:**
```json
{
  "user_id": "uuid-pau",
  "rol_global": "GerenteGeneral",
  "selected_context": [
    {
      "empresa_id": "EMP-001",
      "marca_id": "MRC-001",
      "punto_venta_id": null
    }
  ],
  "periodo": {
    "tipo": "mes_actual",
    "fecha_inicio": "2025-11-01",
    "fecha_fin": "2025-11-30"
  },
  "timestamp": "2025-11-26T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "filtered_by": "1 empresa, 1 marca, 2 PDVs",
  "kpis": {
    "ventas_totales": 145250.50,
    "ebitda": 45123.30,
    "margen_porcentaje": 31.08,
    "nps": 8.4,
    "pedidos_totales": 1247,
    "ticket_medio": 116.45
  },
  "graficos": {
    "ventas_por_dia": [...],
    "ventas_por_categoria": [...],
    "top_productos": [...]
  },
  "cierres": [...]
}
```

---

## 4. LÓGICA DE FILTRADO SQL

### 4.1. Función PostgreSQL para Verificar Coincidencia

```sql
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
$$ LANGUAGE plpgsql;
```

### 4.2. Ejemplo de Query: Ventas Totales

```sql
-- Calcular ventas totales filtradas por contexto
SELECT 
  SUM(v.importe_total) AS ventas_totales,
  COUNT(*) AS num_pedidos,
  AVG(v.importe_total) AS ticket_medio
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  );
```

### 4.3. Ejemplo de Query: EBITDA por Punto de Venta

```sql
-- Calcular EBITDA filtrado por contexto
SELECT 
  pv.empresa_id,
  e.nombre AS empresa_nombre,
  pv.marca_id,
  m.nombre AS marca_nombre,
  pv.punto_venta_id,
  pv.nombre_comercial AS pdv_nombre,
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
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE df.fecha BETWEEN :fecha_inicio AND :fecha_fin
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
GROUP BY 
  pv.empresa_id, e.nombre,
  pv.marca_id, m.nombre,
  pv.punto_venta_id, pv.nombre_comercial
ORDER BY ebitda DESC;
```

### 4.4. Ejemplo de Query: Cierres de Caja Filtrados

```sql
-- Obtener cierres de caja filtrados por contexto
SELECT 
  c.cierre_id,
  c.fecha_cierre,
  c.punto_venta_id,
  pv.nombre_comercial AS pdv_nombre,
  pv.marca_id,
  m.nombre AS marca_nombre,
  pv.empresa_id,
  e.nombre AS empresa_nombre,
  c.efectivo,
  c.tarjeta,
  c.total_ventas,
  c.diferencia,
  c.estado,
  c.cerrado_por
FROM cierres_caja c
INNER JOIN punto_venta pv ON c.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
WHERE c.fecha_cierre BETWEEN :fecha_inicio AND :fecha_fin
  AND match_context_filter(
    pv.empresa_id, 
    pv.marca_id, 
    pv.punto_venta_id,
    :selected_context::JSONB
  )
ORDER BY c.fecha_cierre DESC;
```

---

## 5. FLUJO MAKE.COM

### 5.1. Escenario: Usuario Cambia Filtro de Contexto

```
┌──────────────────────────────────────────────────────┐
│ 1. TRIGGER: Webhook recibe selected_context[]       │
│    Evento: context_filter_changed                   │
│    Payload: { user_id, selected_context, periodo }  │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ 2. VALIDAR: Contexto válido                         │
│    - Verificar que empresa_id existe                │
│    - Verificar que marca_id existe (si no es null)  │
│    - Verificar que punto_venta_id existe            │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ 3. EJECUTAR: Query PostgreSQL con función filter    │
│    - Calcular KPIs (ventas, ebitda, margen, nps)   │
│    - Obtener datos de gráficos                      │
│    - Obtener lista de cierres                       │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ 4. TRANSFORMAR: Datos a formato frontend            │
│    - Agrupar por empresa/marca/pdv                  │
│    - Calcular porcentajes y tendencias              │
│    - Formatear fechas y monedas                     │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ 5. CACHEAR: Guardar resultado (opcional)            │
│    - Key: hash(user_id + selected_context + periodo)│
│    - TTL: 5 minutos                                  │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ 6. RESPONDER: Enviar datos al frontend              │
│    Response: { kpis, graficos, cierres, metadata }  │
└──────────────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│ 7. REGISTRAR: Auditoría                             │
│    - Log en tabla auditoria_filtros                 │
│    - Timestamp, user_id, selected_context           │
└──────────────────────────────────────────────────────┘
```

---

## 6. OPTIMIZACIONES Y CACHÉ

### 6.1. Estrategia de Caché

**Clave de caché:**
```
cache_key = MD5(user_id + JSON.stringify(selected_context) + periodo_tipo + fecha_inicio + fecha_fin)
```

**Ejemplo:**
```
gerente_pau_EMP001-MRC001-NULL_mes_actual_2025-11-01_2025-11-30
```

**TTL (Time To Live):**
- **Datos en tiempo real:** No cachear (ventas del día actual)
- **Datos históricos:** 1 hora
- **Datos consolidados mensuales:** 24 horas

### 6.2. Invalidación de Caché

Invalidar cuando:
- Se registra una nueva venta
- Se cierra una caja
- Se actualiza el inventario
- Se modifican datos financieros del periodo

### 6.3. Pre-cálculo de Agregaciones

**Tabla auxiliar:** `kpis_precalculados`

```sql
CREATE TABLE kpis_precalculados (
  id UUID PRIMARY KEY,
  empresa_id VARCHAR NOT NULL,
  marca_id VARCHAR NULL,
  punto_venta_id VARCHAR NULL,
  fecha DATE NOT NULL,
  periodo_tipo VARCHAR(20), -- 'dia', 'semana', 'mes'
  
  -- KPIs
  ventas_totales DECIMAL(12,2),
  num_pedidos INTEGER,
  ticket_medio DECIMAL(10,2),
  ebitda DECIMAL(12,2),
  margen_porcentaje DECIMAL(5,2),
  
  -- Metadatos
  calculado_en TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(empresa_id, marca_id, punto_venta_id, fecha, periodo_tipo)
);

CREATE INDEX idx_kpis_fecha ON kpis_precalculados(fecha);
CREATE INDEX idx_kpis_empresa ON kpis_precalculados(empresa_id);
```

**Proceso ETL diario:**
1. Cada noche a las 02:00 AM
2. Calcular KPIs del día anterior
3. Insertar en `kpis_precalculados`
4. Usar estos datos para consultas rápidas

---

## 7. CASOS DE USO ESPECÍFICOS

### 7.1. CASO 1: Pau ve todo el grupo empresarial

**Selected Context:**
```json
[]
```

**Query resultante:**
```sql
-- Sin filtro → devuelve TODO
SELECT * FROM ventas;
```

**Dashboard muestra:**
- Ventas de TODAS las empresas (Hostelería + Eventos + Construcción)
- EBITDA consolidado del grupo
- Comparativa entre empresas

---

### 7.2. CASO 2: Pau analiza solo Hostelería

**Selected Context:**
```json
[
  {
    "empresa_id": "EMP-001",
    "marca_id": null,
    "punto_venta_id": null
  }
]
```

**Query resultante:**
```sql
WHERE pv.empresa_id = 'EMP-001'
```

**Dashboard muestra:**
- Ventas de Hostelería (Pizzas + Burguers)
- Desglose por marcas
- Comparativa entre puntos de venta

---

### 7.3. CASO 3: Pau compara Pizzas Tiana vs Burguers Badalona

**Selected Context:**
```json
[
  {
    "empresa_id": "EMP-001",
    "marca_id": "MRC-001",
    "punto_venta_id": "PDV-TIA"
  },
  {
    "empresa_id": "EMP-001",
    "marca_id": "MRC-002",
    "punto_venta_id": "PDV-BAD-BG"
  }
]
```

**Query resultante:**
```sql
WHERE (pv.empresa_id = 'EMP-001' AND pv.marca_id = 'MRC-001' AND pv.punto_venta_id = 'PDV-TIA')
   OR (pv.empresa_id = 'EMP-001' AND pv.marca_id = 'MRC-002' AND pv.punto_venta_id = 'PDV-BAD-BG')
```

**Dashboard muestra:**
- Comparativa directa entre ambos PDV
- KPIs lado a lado
- Gráficos de tendencias comparados

---

## 8. VALIDACIONES Y SEGURIDAD

### 8.1. Validaciones Backend

```javascript
// Validar selected_context antes de ejecutar query
function validateSelectedContext(selectedContext, userId) {
  
  // 1. Verificar formato
  if (!Array.isArray(selectedContext)) {
    throw new Error('selected_context debe ser un array');
  }
  
  // 2. Validar cada elemento
  for (const ctx of selectedContext) {
    if (!ctx.empresa_id) {
      throw new Error('empresa_id es obligatorio');
    }
    
    // 3. Verificar que la empresa existe
    const empresaExists = await db.query(
      'SELECT 1 FROM empresa WHERE empresa_id = $1',
      [ctx.empresa_id]
    );
    if (empresaExists.rows.length === 0) {
      throw new Error(`Empresa ${ctx.empresa_id} no existe`);
    }
    
    // 4. Si marca_id no es null, verificar que existe
    if (ctx.marca_id !== null) {
      const marcaExists = await db.query(
        'SELECT 1 FROM marca WHERE marca_id = $1 AND empresa_id = $2',
        [ctx.marca_id, ctx.empresa_id]
      );
      if (marcaExists.rows.length === 0) {
        throw new Error(`Marca ${ctx.marca_id} no existe en empresa ${ctx.empresa_id}`);
      }
    }
    
    // 5. Si punto_venta_id no es null, verificar que existe
    if (ctx.punto_venta_id !== null) {
      const pdvExists = await db.query(
        'SELECT 1 FROM punto_venta WHERE punto_venta_id = $1 AND marca_id = $2',
        [ctx.punto_venta_id, ctx.marca_id]
      );
      if (pdvExists.rows.length === 0) {
        throw new Error(`PDV ${ctx.punto_venta_id} no existe en marca ${ctx.marca_id}`);
      }
    }
  }
  
  // 6. Verificar permisos del usuario (solo GERENTE_GENERAL puede ver todo)
  const user = await db.query(
    'SELECT rol_global FROM usuario WHERE id_usuario = $1',
    [userId]
  );
  
  if (user.rows[0].rol_global !== 'GerenteGeneral') {
    // Verificar que el usuario tiene acceso a los contextos seleccionados
    // según su tabla USER_SCOPE
    await validateUserAccess(userId, selectedContext);
  }
  
  return true;
}
```

### 8.2. Protección contra SQL Injection

- ✅ Usar **parámetros preparados** en todas las queries
- ✅ **NO concatenar** strings en SQL
- ✅ Validar tipos de datos (UUIDs, strings, números)
- ✅ Usar funciones de PostgreSQL en lugar de lógica en string concatenation

**INCORRECTO:**
```sql
-- ❌ NUNCA HACER ESTO
query = `SELECT * FROM ventas WHERE empresa_id = '${ctx.empresa_id}'`;
```

**CORRECTO:**
```sql
-- ✅ Usar parámetros preparados
query = 'SELECT * FROM ventas WHERE empresa_id = $1';
params = [ctx.empresa_id];
```

---

## 9. MONITOREO Y DEBUGGING

### 9.1. Logs Recomendados

```javascript
// Log cada cambio de filtro
console.log({
  timestamp: new Date().toISOString(),
  event: 'context_filter_changed',
  user_id: userId,
  selected_context: selectedContext,
  results: {
    total_ventas: results.ventas_totales,
    num_registros_filtrados: results.count,
    tiempo_query_ms: queryTime
  }
});
```

### 9.2. Métricas a Monitorizar

1. **Tiempo de respuesta de queries filtradas**
   - Objetivo: < 500ms
   - Alerta si > 2 segundos

2. **Uso de caché**
   - Cache hit rate > 80%
   - Invalidaciones correctas

3. **Errores de validación**
   - Empresas/marcas/PDV inexistentes
   - Permisos denegados

4. **Combinaciones de filtros más usadas**
   - Para optimizar índices
   - Para pre-calcular agregaciones

---

## 10. MIGRACIÓN Y DEPLOYMENT

### 10.1. Checklist de Deploy

- [ ] Crear función `match_context_filter` en PostgreSQL
- [ ] Crear índices en tablas relacionadas
- [ ] Actualizar endpoints API
- [ ] Configurar caché (Redis/Memcached)
- [ ] Migrar datos históricos a `kpis_precalculados`
- [ ] Configurar proceso ETL diario
- [ ] Actualizar documentación API
- [ ] Crear tests de integración
- [ ] Validar performance con datos reales
- [ ] Configurar monitoreo y alertas

### 10.2. Rollback Plan

Si hay problemas:
1. Revertir a selector simple de tiendas
2. Mantener datos de `selected_context` en sesión
3. Implementar feature flag para activar/desactivar filtro jerárquico

---

## 11. TESTING

### 11.1. Tests Unitarios (Backend)

```javascript
describe('matchContextFilter', () => {
  
  test('Empty context returns all records', async () => {
    const result = await matchContextFilter('EMP-001', 'MRC-001', 'PDV-TIA', []);
    expect(result).toBe(true);
  });
  
  test('Specific PDV matches correctly', async () => {
    const context = [{ empresa_id: 'EMP-001', marca_id: 'MRC-001', punto_venta_id: 'PDV-TIA' }];
    const result = await matchContextFilter('EMP-001', 'MRC-001', 'PDV-TIA', context);
    expect(result).toBe(true);
  });
  
  test('Different PDV does not match', async () => {
    const context = [{ empresa_id: 'EMP-001', marca_id: 'MRC-001', punto_venta_id: 'PDV-TIA' }];
    const result = await matchContextFilter('EMP-001', 'MRC-001', 'PDV-BAD', context);
    expect(result).toBe(false);
  });
  
  test('Null marca_id matches all marcas', async () => {
    const context = [{ empresa_id: 'EMP-001', marca_id: null, punto_venta_id: null }];
    const result = await matchContextFilter('EMP-001', 'MRC-001', 'PDV-TIA', context);
    expect(result).toBe(true);
  });
  
});
```

### 11.2. Tests de Integración

```javascript
describe('Dashboard Filter Integration', () => {
  
  test('Filter by entire company returns correct aggregates', async () => {
    const response = await request(app)
      .post('/api/gerente/dashboard/filter')
      .send({
        user_id: 'uuid-pau',
        selected_context: [{ empresa_id: 'EMP-001', marca_id: null, punto_venta_id: null }],
        periodo: { tipo: 'mes_actual' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.kpis.ventas_totales).toBeGreaterThan(0);
    expect(response.body.filtered_by).toContain('empresa');
  });
  
});
```

---

## 12. CONTACTO Y SOPORTE

**Desarrollador Frontend:** [Tu Nombre]  
**Desarrollador Backend:** [Nombre del Backend Dev]  
**Arquitecto de Datos:** [Nombre del Arquitecto]  

**Repositorio:** `udar-edge/filtro-contexto-jerarquico`  
**Jira Epic:** `UE-1234 - Filtro Jerárquico Multiempresa`

---

## APÉNDICE A: Estructura de Datos Completa

```
EMPRESA
├── empresa_id (PK)
├── codigo_empresa
├── nombre
└── marcas[]
    ├── MARCA
    │   ├── marca_id (PK)
    │   ├── codigo_marca
    │   ├── nombre
    │   └── puntos_venta[]
    │       └── PUNTO_VENTA
    │           ├── punto_venta_id (PK)
    │           ├── codigo_punto_venta
    │           └── nombre_comercial
```

---

## APÉNDICE B: Queries de Ejemplo Completas

Ver archivo: `queries_filtro_contexto.sql`

---

**FIN DE LA ESPECIFICACIÓN**
