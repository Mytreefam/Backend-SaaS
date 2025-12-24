# 📊 ANÁLISIS COMPLETO: SISTEMA EBITDA

## 🎯 OBJETIVO

Implementar cálculo automático de EBITDA en tiempo real por Empresa/Marca/PDV.

**Fórmula EBITDA:**
```
EBITDA = Ventas - Coste de Ventas - Gastos Operativos
Margen % = (EBITDA / Ventas) × 100
```

---

## ✅ LO QUE SÍ TENEMOS

### **1. Sistema de Costes de Productos** ✅

#### **A) Ingredientes con precio de coste:**

```typescript
// /data/stock-ingredientes.ts

export interface Ingrediente {
  id: string;
  nombre: string;
  precioKg: number;        // ✅ PRECIO DE COSTE
  unidad: 'kg' | 'litros' | 'unidades';
  stock: number;
  categoria: string;
  proveedor?: string;
}

// Ejemplos reales:
const ingredientes = [
  {
    id: 'ING-001',
    nombre: 'Harina de trigo',
    precioKg: 1.50,        // ✅ Coste por kg
    stock: 250
  },
  {
    id: 'ING-005',
    nombre: 'Mantequilla',
    precioKg: 8.50,        // ✅ Coste por kg
    stock: 45
  },
  // ... 30 ingredientes más
];
```

✅ **30 ingredientes con precio**  
✅ **Función de cálculo incluida**  

---

#### **B) Cálculo de coste por receta:**

```typescript
// /data/stock-ingredientes.ts

export const calcularPrecioCosteTotal = (
  ingredientes: { id: string; cantidad: number }[]
): number => {
  return ingredientes.reduce((total, item) => {
    const ingrediente = buscarIngrediente(item.id);
    if (ingrediente) {
      return total + (ingrediente.precioKg * item.cantidad);
    }
    return total;
  }, 0);
};
```

✅ **Función implementada**  
✅ **Usa precio real de ingredientes**  

---

#### **C) Sistema de creación de productos con coste:**

```typescript
// /components/gerente/ClientesGerente.tsx

// Estados para costes
const [precioCoste, setPrecioCoste] = useState(0);
const [precioCosteAuto, setPrecioCosteAuto] = useState(0);

// Cálculo automático según tipo:
useEffect(() => {
  let total = 0;
  
  if (tipoProducto === 'simple' && articuloBaseSeleccionado) {
    // ✅ Producto Simple: Precio del artículo de stock
    total = articuloBaseSeleccionado.precioCoste;
  } 
  else if (tipoProducto === 'manufacturado') {
    // ✅ Producto Manufacturado: Suma de ingredientes × cantidades
    total = ingredientesSeleccionados.reduce(
      (sum, ing) => sum + (ing.precio * ing.cantidad), 
      0
    );
  } 
  else if (tipoProducto === 'combo') {
    // ✅ Combo: Suma del coste de cada producto
    total = productosComboSeleccionados.reduce(
      (sum, prod) => sum + prod.precioCoste, 
      0
    );
  }
  
  setPrecioCosteAuto(Number(total.toFixed(2)));
}, [ingredientesSeleccionados, articuloBaseSeleccionado, productosComboSeleccionados]);
```

✅ **3 tipos de productos cubiertos**  
✅ **Cálculo automático implementado**  
✅ **Interfaz de usuario lista**  

---

### **2. Sistema de Ventas Completo** ✅

```typescript
// /services/pedidos.service.ts

export interface Pedido {
  id: string;
  fecha: string;
  
  // ✅ Contexto multiempresa (YA IMPLEMENTADO HOY)
  empresaId: string;
  marcaId: string;
  puntoVentaId: string;
  
  // ✅ Items con detalles
  items: ItemPedido[];
  
  // ✅ Importes
  subtotal: number;      // Base sin IVA
  iva: number;           // IVA
  total: number;         // Total con IVA
  descuento: number;     // Descuentos aplicados
  
  // ✅ Estado
  estado: EstadoPedido;
  metodoPago: MetodoPago;
}
```

✅ **Pedidos con contexto completo**  
✅ **Almacenamiento en LocalStorage**  
✅ **Preparado para Supabase**  

---

### **3. Sistema de Facturación VeriFactu** ✅

```typescript
// /services/verifactu.service.ts

export interface FacturaVeriFactu {
  id: string;
  fecha: Date;
  
  // ✅ Importes con IVA desglosado
  baseImponibleTotal: number;
  importeIVATotal: number;
  importeTotal: number;
  desgloseIVA: DesgloseIVA[];
  
  // ✅ Líneas con detalle
  lineas: LineaFacturaVeriFactu[];
  
  // ✅ VeriFactu completo
  verifactu: DatosVeriFactu;
}
```

✅ **100% funcional**  
✅ **Integrado con pedidos**  
✅ **Desglose IVA automático**  

---

### **4. Sistema de Caja y Operaciones** ✅

```typescript
// /components/PanelCaja.tsx
// /components/ModalAperturaCaja.tsx
// /components/ModalCierreCaja.tsx

interface OperacionCaja {
  tipo: 'apertura' | 'cierre' | 'retirada' | 'ingreso';
  importe: number;
  efectivo: number;
  tarjeta: number;
  fecha: string;
  observaciones?: string;
}
```

✅ **Apertura de caja**  
✅ **Cierre de caja**  
✅ **Arqueo de caja**  
✅ **Retiradas**  
✅ **Almacenado en LocalStorage**  

---

### **5. Queries SQL de Ejemplo** ✅

```sql
-- /EJEMPLO_INTEGRACION_DASHBOARD.tsx

-- Query para EBITDA
SELECT 
  SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
  ROUND(
    (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
    1
  ) AS margen_porcentaje
FROM datos_financieros df
INNER JOIN punto_venta pv ON df.punto_venta_id = pv.punto_venta_id
WHERE df.fecha BETWEEN $1 AND $2;

-- Query desglose por contexto
SELECT 
  e.empresa_id,
  m.marca_id,
  pv.punto_venta_id,
  SUM(v.importe_total) AS ventas,
  SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
  ROUND((SUM(df.ebitda) / NULLIF(SUM(df.ventas), 0)) * 100, 1) AS margen_porcentaje
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
LEFT JOIN datos_financieros df ON pv.punto_venta_id = df.punto_venta_id
  AND v.fecha::date = df.fecha
GROUP BY e.empresa_id, m.marca_id, pv.punto_venta_id;
```

✅ **Queries escritas**  
✅ **Lógica de cálculo clara**  
✅ **Joins definidos**  

---

## ❌ LO QUE FALTA

### **1. Tabla `datos_financieros`** ❌

```sql
-- NO EXISTE ESTA TABLA

CREATE TABLE datos_financieros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contexto
  punto_venta_id UUID REFERENCES puntos_venta(id) NOT NULL,
  fecha DATE NOT NULL,
  
  -- ⭐ INGRESOS
  ventas DECIMAL(10,2) NOT NULL DEFAULT 0,           -- Total de ventas del día
  otros_ingresos DECIMAL(10,2) DEFAULT 0,            -- Ingresos extra
  
  -- ⭐ COSTES DE VENTAS
  coste_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,     -- Suma de (cantidad × coste) de productos vendidos
  coste_materias_primas DECIMAL(10,2) DEFAULT 0,     -- Desglose: ingredientes
  coste_productos_comprados DECIMAL(10,2) DEFAULT 0, -- Desglose: productos sin manufacturar
  
  -- ⭐ GASTOS OPERATIVOS
  gastos_operativos DECIMAL(10,2) NOT NULL DEFAULT 0, -- Total gastos del día
  alquiler_dia DECIMAL(10,2) DEFAULT 0,                -- Alquiler prorrateado
  suministros_dia DECIMAL(10,2) DEFAULT 0,             -- Luz, agua, gas
  nominas_dia DECIMAL(10,2) DEFAULT 0,                 -- Nóminas prorrateadas
  marketing_dia DECIMAL(10,2) DEFAULT 0,               -- Marketing y publicidad
  mantenimiento_dia DECIMAL(10,2) DEFAULT 0,           -- Reparaciones, limpieza
  otros_gastos_dia DECIMAL(10,2) DEFAULT 0,            -- Otros gastos
  
  -- ⭐ CALCULADOS (triggers automáticos)
  margen_bruto DECIMAL(10,2),                          -- ventas - coste_ventas
  ebitda DECIMAL(10,2),                                -- margen_bruto - gastos_operativos
  margen_porcentaje DECIMAL(5,2),                      -- (ebitda / ventas) * 100
  
  -- Metadatos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT unique_pdv_fecha UNIQUE(punto_venta_id, fecha)
);

-- Índices para rendimiento
CREATE INDEX idx_datos_financieros_fecha ON datos_financieros(fecha);
CREATE INDEX idx_datos_financieros_pdv ON datos_financieros(punto_venta_id);
CREATE INDEX idx_datos_financieros_pdv_fecha ON datos_financieros(punto_venta_id, fecha);
```

**Estado:** ❌ No existe

---

### **2. Relación Producto ↔ Coste** ❌

```typescript
// NO EXISTE: Estructura que guarde el coste de cada producto

interface ProductoConCoste {
  id: string;
  nombre: string;
  categoria: string;
  
  // ⭐ FALTA ESTO:
  precioVenta: number;        // PVP para el cliente
  precioCoste: number;        // Coste real del producto
  margenBruto: number;        // precioVenta - precioCoste
  margenPorcentaje: number;   // (margenBruto / precioVenta) * 100
  
  // Si es manufacturado:
  receta?: {
    ingrediente_id: string;
    cantidad: number;
    coste: number;
  }[];
  costeTotal?: number;         // Suma de receta
}
```

**Problema:** Los productos en `/data/productos-panaderia.ts` NO tienen campo `precioCoste`.

```typescript
// /data/productos-panaderia.ts (ACTUAL)

export interface ProductoPanaderia {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;      // ✅ Precio de venta
  // ❌ FALTA: precioCoste
  // ❌ FALTA: receta
  imagen: string;
  descripcion: string;
}
```

**Estado:** ❌ No implementado

---

### **3. Función: Calcular Coste de Venta** ❌

```typescript
// NO EXISTE: Función que calcule el coste de una venta

export const calcularCosteVenta = (pedido: Pedido): number => {
  let costeTotal = 0;
  
  for (const item of pedido.items) {
    // Buscar producto
    const producto = buscarProducto(item.productoId);
    
    if (!producto) {
      console.warn(`Producto no encontrado: ${item.productoId}`);
      continue;
    }
    
    // Si tiene receta, calcular coste
    if (producto.receta) {
      const costeUnidad = calcularCosteReceta(producto.receta);
      costeTotal += costeUnidad * item.cantidad;
    }
    // Si no tiene receta, usar precioCoste directo
    else if (producto.precioCoste) {
      costeTotal += producto.precioCoste * item.cantidad;
    }
    // Si no hay coste, estimar (50% del precio venta)
    else {
      costeTotal += (item.precio * 0.5) * item.cantidad;
    }
  }
  
  return costeTotal;
};
```

**Estado:** ❌ No implementado

---

### **4. Tabla de Gastos Fijos** ❌

```sql
-- NO EXISTE: Tabla de gastos operativos fijos

CREATE TABLE gastos_fijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punto_venta_id UUID REFERENCES puntos_venta(id),
  
  -- Tipo de gasto
  tipo VARCHAR(50) NOT NULL, -- 'alquiler', 'suministros', 'nominas', etc.
  concepto VARCHAR(200) NOT NULL,
  
  -- Importe
  importe_mensual DECIMAL(10,2) NOT NULL,
  importe_diario DECIMAL(10,2) NOT NULL, -- mensual / 30
  
  -- Periodo
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos de gastos fijos:
INSERT INTO gastos_fijos (punto_venta_id, tipo, concepto, importe_mensual, importe_diario) VALUES
('PDV-TIANA', 'alquiler', 'Alquiler local', 2500.00, 83.33),
('PDV-TIANA', 'suministros', 'Electricidad', 450.00, 15.00),
('PDV-TIANA', 'suministros', 'Agua', 120.00, 4.00),
('PDV-TIANA', 'suministros', 'Gas', 200.00, 6.67),
('PDV-TIANA', 'nominas', 'Nóminas personal', 8500.00, 283.33),
('PDV-TIANA', 'marketing', 'Publicidad online', 300.00, 10.00),
('PDV-TIANA', 'seguros', 'Seguro local', 150.00, 5.00),
('PDV-TIANA', 'mantenimiento', 'Limpieza', 400.00, 13.33);

-- Total gastos fijos PDV Tiana: 12,620€/mes (420.67€/día)
```

**Estado:** ❌ No existe

---

### **5. Función: Actualizar Datos Financieros** ❌

```typescript
// NO EXISTE: Función que actualice datos financieros al registrar venta

export const actualizarDatosFinancieros = async (
  pedido: Pedido
): Promise<void> => {
  const { puntoVentaId, fecha, total, items } = pedido;
  const fechaDia = fecha.split('T')[0]; // YYYY-MM-DD
  
  // 1. Calcular coste de la venta
  const costeVenta = calcularCosteVenta(pedido);
  
  // 2. Obtener o crear registro del día
  const { data: datosDia, error } = await supabase
    .from('datos_financieros')
    .select('*')
    .eq('punto_venta_id', puntoVentaId)
    .eq('fecha', fechaDia)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  
  // 3. Si no existe, crear con gastos fijos del día
  if (!datosDia) {
    const gastosFijos = await obtenerGastosFijosDia(puntoVentaId);
    
    await supabase.from('datos_financieros').insert({
      punto_venta_id: puntoVentaId,
      fecha: fechaDia,
      ventas: total,
      coste_ventas: costeVenta,
      gastos_operativos: gastosFijos,
    });
  }
  // 4. Si existe, actualizar acumulando
  else {
    await supabase
      .from('datos_financieros')
      .update({
        ventas: datosDia.ventas + total,
        coste_ventas: datosDia.coste_ventas + costeVenta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', datosDia.id);
  }
  
  // 5. El trigger de BD recalculará EBITDA automáticamente
};
```

**Estado:** ❌ No implementado

---

### **6. Trigger: Calcular EBITDA Automáticamente** ❌

```sql
-- NO EXISTE: Trigger que calcule EBITDA automáticamente

CREATE OR REPLACE FUNCTION calcular_ebitda()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular margen bruto
  NEW.margen_bruto := NEW.ventas - NEW.coste_ventas;
  
  -- Calcular EBITDA
  NEW.ebitda := NEW.margen_bruto - NEW.gastos_operativos;
  
  -- Calcular margen porcentaje
  IF NEW.ventas > 0 THEN
    NEW.margen_porcentaje := ROUND((NEW.ebitda / NEW.ventas) * 100, 2);
  ELSE
    NEW.margen_porcentaje := 0;
  END IF;
  
  -- Actualizar timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_ebitda
  BEFORE INSERT OR UPDATE ON datos_financieros
  FOR EACH ROW
  EXECUTE FUNCTION calcular_ebitda();
```

**Estado:** ❌ No existe

---

### **7. Servicio de EBITDA** ❌

```typescript
// NO EXISTE: /services/ebitda.service.ts

export const obtenerEBITDAPorPDV = async (
  puntoVentaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): Promise<ResumenEBITDA> => {
  const { data, error } = await supabase
    .from('datos_financieros')
    .select('*')
    .eq('punto_venta_id', puntoVentaId)
    .gte('fecha', fechaDesde.toISOString().split('T')[0])
    .lte('fecha', fechaHasta.toISOString().split('T')[0]);
  
  if (error) throw error;
  
  // Agregar datos
  const totales = data.reduce((acc, dia) => ({
    ventas: acc.ventas + dia.ventas,
    costeVentas: acc.costeVentas + dia.coste_ventas,
    gastosOperativos: acc.gastosOperativos + dia.gastos_operativos,
    ebitda: acc.ebitda + dia.ebitda,
  }), { ventas: 0, costeVentas: 0, gastosOperativos: 0, ebitda: 0 });
  
  return {
    ...totales,
    margenPorcentaje: (totales.ebitda / totales.ventas) * 100,
    diasAnalisis: data.length,
  };
};
```

**Estado:** ❌ No implementado

---

### **8. Componente de Visualización EBITDA** ❌

```tsx
// NO EXISTE: Componente específico para EBITDA

export function DashboardEBITDA() {
  const [datosEBITDA, setDatosEBITDA] = useState<ResumenEBITDA | null>(null);
  
  return (
    <div>
      {/* KPIs principales */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardTitle>Ventas</CardTitle>
          <CardContent>{formatEuro(datosEBITDA.ventas)}</CardContent>
        </Card>
        
        <Card>
          <CardTitle>Coste Ventas</CardTitle>
          <CardContent className="text-red-600">
            -{formatEuro(datosEBITDA.costeVentas)}
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>Gastos Operativos</CardTitle>
          <CardContent className="text-orange-600">
            -{formatEuro(datosEBITDA.gastosOperativos)}
          </CardContent>
        </Card>
        
        <Card>
          <CardTitle>EBITDA</CardTitle>
          <CardContent className="text-green-600">
            {formatEuro(datosEBITDA.ebitda)}
          </CardContent>
          <p className="text-sm">Margen: {datosEBITDA.margenPorcentaje}%</p>
        </Card>
      </div>
      
      {/* Gráfico cascada */}
      <WaterfallChart
        ventas={datosEBITDA.ventas}
        costeVentas={datosEBITDA.costeVentas}
        gastosOperativos={datosEBITDA.gastosOperativos}
        ebitda={datosEBITDA.ebitda}
      />
    </div>
  );
}
```

**Estado:** ❌ No implementado

---

## 📋 RESUMEN: QUÉ TENEMOS vs QUÉ FALTA

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| **1. Ingredientes con precio** | ✅ COMPLETO | 30 ingredientes, función de cálculo |
| **2. Cálculo coste receta** | ✅ COMPLETO | Implementado y funcionando |
| **3. Sistema de productos** | ⚠️ PARCIAL | Falta agregar `precioCoste` y `receta` |
| **4. Ventas con contexto** | ✅ COMPLETO | Implementado hoy |
| **5. Facturación VeriFactu** | ✅ COMPLETO | 100% funcional |
| **6. Sistema de caja** | ✅ COMPLETO | Apertura, cierre, arqueos |
| **7. Tabla `datos_financieros`** | ❌ NO EXISTE | Falta crear en Supabase |
| **8. Tabla `gastos_fijos`** | ❌ NO EXISTE | Falta crear en Supabase |
| **9. Función `calcularCosteVenta()`** | ❌ NO EXISTE | Falta implementar |
| **10. Función `actualizarDatosFinancieros()`** | ❌ NO EXISTE | Falta implementar |
| **11. Trigger `calcular_ebitda()`** | ❌ NO EXISTE | Falta crear en Supabase |
| **12. Servicio EBITDA** | ❌ NO EXISTE | Falta crear archivo |
| **13. Componente visualización** | ❌ NO EXISTE | Falta crear |
| **14. Queries SQL** | ✅ ESCRITAS | En archivo de ejemplo |

---

## 🎯 LO QUE FALTA IMPLEMENTAR (PRIORIZADO)

### **FASE 1: Preparación de Datos (8 hrs)**

1. **Agregar `precioCoste` a productos** (2 hrs)
   - Modificar interfaces
   - Actualizar datos mock
   - Agregar campo en formulario de creación

2. **Crear función `calcularCosteVenta()`** (2 hrs)
   - Implementar lógica
   - Casos: simple, manufacturado, combo
   - Testing

3. **Crear estructura `ProductoConReceta`** (2 hrs)
   - Definir interface
   - Guardar recetas con productos
   - Sistema de versionado

4. **Preparar datos de gastos fijos** (2 hrs)
   - Definir gastos por PDV
   - Calcular importe diario
   - Crear constantes o mock

---

### **FASE 2: Base de Datos Supabase (6 hrs)**

5. **Crear tabla `datos_financieros`** (2 hrs)
   - Ejecutar SQL
   - Crear índices
   - Políticas RLS

6. **Crear tabla `gastos_fijos`** (2 hrs)
   - Ejecutar SQL
   - Insertar datos iniciales
   - Crear función helper

7. **Crear trigger `calcular_ebitda()`** (2 hrs)
   - Implementar función PL/pgSQL
   - Crear trigger
   - Testing

---

### **FASE 3: Servicios Backend (8 hrs)**

8. **Crear `/services/ebitda.service.ts`** (4 hrs)
   - `actualizarDatosFinancieros()`
   - `obtenerEBITDAPorPDV()`
   - `obtenerEBITDAPorMarca()`
   - `obtenerEBITDAPorEmpresa()`
   - `obtenerTendenciaEBITDA()`

9. **Integrar con servicio de pedidos** (2 hrs)
   - Hook en `crearPedido()`
   - Calcular coste automáticamente
   - Actualizar datos financieros

10. **Crear API endpoints** (2 hrs)
    - `POST /api/ebitda/actualizar`
    - `GET /api/ebitda/pdv/:id`
    - `GET /api/ebitda/consolidado`

---

### **FASE 4: Visualización Frontend (6 hrs)**

11. **Crear `DashboardEBITDA.tsx`** (4 hrs)
    - KPIs principales
    - Gráfico cascada (waterfall)
    - Tabla de desglose
    - Filtros de fecha

12. **Integrar en Dashboard 360°** (2 hrs)
    - Nueva pestaña EBITDA
    - Conectar con datos reales
    - Actualización automática

---

## ⏱️ ESTIMACIÓN TOTAL

| Fase | Horas | Descripción |
|------|-------|-------------|
| **Fase 1** | 8 hrs | Preparación de datos |
| **Fase 2** | 6 hrs | Base de datos Supabase |
| **Fase 3** | 8 hrs | Servicios backend |
| **Fase 4** | 6 hrs | Visualización frontend |
| **TOTAL** | **28 hrs** | ~3.5 días de desarrollo |

---

## 🚀 RUTA CRÍTICA RECOMENDADA

### **Implementación Mínima Viable (12 hrs):**

1. ✅ Agregar `precioCoste` a productos (2 hrs)
2. ✅ Crear `calcularCosteVenta()` (2 hrs)
3. ✅ Crear tabla `datos_financieros` (2 hrs)
4. ✅ Función `actualizarDatosFinancieros()` (2 hrs)
5. ✅ Hook en `crearPedido()` (1 hr)
6. ✅ Dashboard básico EBITDA (3 hrs)

**Resultado:** EBITDA calculado en tiempo real por PDV

---

### **Implementación Completa (28 hrs):**

**Semana 1:**
- Días 1-2: Fase 1 (Preparación datos)
- Días 3-4: Fase 2 (Base datos)

**Semana 2:**
- Días 1-2: Fase 3 (Servicios)
- Días 3-4: Fase 4 (Frontend)

**Resultado:** Sistema completo de EBITDA multi-nivel con gastos fijos

---

## 💡 DECISIONES PENDIENTES

### **1. ¿Cómo gestionar productos sin coste definido?**

**Opción A:** Estimar coste (50% del precio venta)
```typescript
const costeEstimado = precioVenta * 0.5;
```

**Opción B:** Obligar a definir coste
```typescript
if (!producto.precioCoste) {
  throw new Error('Producto sin coste definido');
}
```

**Recomendación:** Opción A para migración suave

---

### **2. ¿Actualizar EBITDA en tiempo real o batch?**

**Opción A:** Tiempo real (al registrar cada venta)
```typescript
await crearPedido(params);
await actualizarDatosFinancieros(pedido); // ⭐ Inmediato
```

**Opción B:** Batch (cada hora o al cierre)
```typescript
// Cron job que recalcula cada hora
setInterval(recalcularDatosFinancieros, 3600000);
```

**Recomendación:** Opción A para dashboard en vivo

---

### **3. ¿Gastos fijos prorrateados o reales?**

**Opción A:** Prorrateo diario automático
```typescript
const gastosDia = gastosMensuales / 30;
```

**Opción B:** Registro manual de gastos variables
```typescript
// El gerente registra gastos diarios reales
registrarGastoDia(pdv, 'suministros', 45.30);
```

**Recomendación:** Opción A + opción B (gastos fijos + variables)

---

## 📊 EJEMPLO DE CÁLCULO COMPLETO

### **Escenario: PDV Tiana, 30 Nov 2025**

```
VENTAS DEL DÍA:
- Pedido 1: Pan Masa Madre × 5 = 17.50€
  └─ Coste: (0.5kg harina × 1.50€) + (0.05kg levadura × 4.50€) = 0.98€
- Pedido 2: Croissant × 10 = 25.00€
  └─ Coste: (0.3kg harina × 1.50€) + (0.1kg mantequilla × 8.50€) = 1.30€
- Pedido 3: Baguette × 8 = 12.00€
  └─ Coste: (0.4kg harina × 1.50€) = 0.60€
- ... más pedidos ...

TOTALES:
Ventas totales: 850.00€
Coste de ventas: 285.50€
──────────────────────────
Margen bruto: 564.50€ (66.4%)

GASTOS OPERATIVOS FIJOS:
- Alquiler: 83.33€
- Electricidad: 15.00€
- Agua: 4.00€
- Gas: 6.67€
- Nóminas: 283.33€
- Marketing: 10.00€
- Seguros: 5.00€
- Limpieza: 13.33€
──────────────────────────
Total gastos: 420.67€

EBITDA:
564.50€ - 420.67€ = 143.83€
Margen: 16.9%
```

---

## ✅ CONCLUSIÓN

### **Lo que SÍ tenemos:**
✅ Sistema de costes de ingredientes completo  
✅ Cálculo de costes por receta  
✅ Ventas con contexto multiempresa  
✅ Facturación VeriFactu 100%  
✅ Sistema de caja completo  
✅ Queries SQL de ejemplo  

### **Lo que NO tenemos:**
❌ Tabla `datos_financieros`  
❌ Tabla `gastos_fijos`  
❌ Función de cálculo de coste de venta  
❌ Servicio EBITDA  
❌ Componente de visualización  
❌ Integración automática  

### **Para tener EBITDA funcional:**
📋 **28 horas** de desarrollo  
📋 **2 tablas** en Supabase  
📋 **1 servicio** nuevo  
📋 **1 componente** de visualización  
📋 **Integración** con sistema de pedidos  

**¿Empezamos con la Fase 1?** 🚀
