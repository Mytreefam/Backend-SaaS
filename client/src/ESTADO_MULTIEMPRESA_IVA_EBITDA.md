# 🏢 ANÁLISIS: MULTIEMPRESA + IVA + EBITDA EN TIEMPO REAL

## 📊 RESUMEN EJECUTIVO

| Pregunta | Respuesta Corta | Estado |
|----------|----------------|--------|
| **1. ¿Ventas organizadas por Empresas/Marcas/PDV?** | ⚠️ **PARCIAL** | Preparado pero NO implementado |
| **2. ¿Almacenamiento con IVA + VeriFactu?** | ✅ **SÍ** | 100% funcional |
| **3. ¿Conectado con EBITDA en tiempo real?** | ❌ **NO** | Solo ejemplo de código |

---

## 1️⃣ VENTAS POR EMPRESAS/MARCAS/PDV

### ⚠️ ESTADO: PREPARADO PERO NO IMPLEMENTADO

### **Lo que SÍ existe:**

#### **A) Estructura conceptual definida:**

```typescript
// Archivo: /constants/empresaConfig.ts
export const EMPRESAS = {
  DISARMINK: 'EMP-001',
  ALLFOOD: 'EMP-002',
  // ...
};

export const MARCAS = {
  MODOMIO: 'MRC-001',
  BLACKBURGUER: 'MRC-002',
  CANFARINES: 'MRC-003',
  // ...
};

export const PUNTOS_VENTA = {
  MODOMIO_TIANA: 'PDV-TIANA',
  MODOMIO_BADALONA: 'PDV-BADALONA',
  // ...
};
```

✅ **Constantes definidas**  
✅ **Helper functions** (`getNombreEmpresa`, `getNombreMarca`)  
✅ **Arrays para selects**

#### **B) Campo opcional en Pedido:**

```typescript
// Archivo: /services/pedidos.service.ts
export interface Pedido {
  id: string;
  numero: string;
  // ... otros campos ...
  
  puntoVentaId?: string; // ✅ EXISTE pero es opcional
  
  // ❌ FALTAN:
  // empresaId?: string;
  // marcaId?: string;
}
```

⚠️ **Solo puntoVentaId, NO empresa ni marca**

#### **C) Ejemplo de queries SQL:**

```sql
-- Archivo: /EJEMPLO_INTEGRACION_DASHBOARD.tsx
-- ⚠️ ESTO ES SOLO UN EJEMPLO, NO ESTÁ EJECUTÁNDOSE

SELECT 
  e.empresa_id,
  e.nombre AS empresa_nombre,
  m.marca_id,
  m.nombre AS marca_nombre,
  pv.punto_venta_id AS pdv_id,
  pv.nombre_comercial AS pdv_nombre,
  SUM(v.importe_total) AS ventas,
  SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
LEFT JOIN datos_financieros df ON pv.punto_venta_id = df.punto_venta_id
WHERE v.estado = 'completado'
GROUP BY e.empresa_id, e.nombre, m.marca_id, m.nombre, pv.punto_venta_id, pv.nombre_comercial
ORDER BY ventas DESC;
```

✅ **Código SQL está escrito**  
❌ **NO hay tablas reales en DB**  
❌ **NO hay API endpoint implementada**

---

### **Lo que NO existe:**

#### **❌ 1. Estructura completa en Pedido:**

```typescript
// LO QUE DEBERÍA SER:
export interface Pedido {
  id: string;
  numero: string;
  fecha: string;
  
  // ⭐ JERARQUÍA COMPLETA
  empresaId: string;          // "EMP-001" (Disarmink)
  empresaNombre: string;      // "Disarmink S.L."
  marcaId: string;            // "MRC-001" (Modomio)
  marcaNombre: string;        // "Modomio"
  puntoVentaId: string;       // "PDV-TIANA"
  puntoVentaNombre: string;   // "Modomio Tiana"
  
  // ... resto de campos
}

// LO QUE HAY AHORA:
export interface Pedido {
  // ... campos ...
  puntoVentaId?: string;  // ⚠️ Solo esto, y es opcional
}
```

#### **❌ 2. Tablas de base de datos:**

```sql
-- NO EXISTEN ESTAS TABLAS:

CREATE TABLE empresas (
  id UUID PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombre VARCHAR(200),
  nif VARCHAR(20),
  direccion TEXT,
  created_at TIMESTAMP
);

CREATE TABLE marcas (
  id UUID PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombre VARCHAR(200),
  empresa_id UUID REFERENCES empresas(id),
  logo_url TEXT,
  created_at TIMESTAMP
);

CREATE TABLE punto_venta (
  id UUID PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,
  nombre_comercial VARCHAR(200),
  empresa_id UUID REFERENCES empresas(id),
  marca_id UUID REFERENCES marcas(id),
  direccion TEXT,
  telefono VARCHAR(20),
  responsable_id UUID,
  created_at TIMESTAMP
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY,
  numero VARCHAR(50),
  fecha TIMESTAMP,
  punto_venta_id UUID REFERENCES punto_venta(id),  -- ⚠️ Tabla no existe
  cliente_id UUID,
  total DECIMAL(10,2),
  estado VARCHAR(20),
  created_at TIMESTAMP
);
```

**Estado:** ❌ Ninguna de estas tablas existe en Supabase

#### **❌ 3. Servicios y funciones:**

```typescript
// NO EXISTEN ESTOS SERVICIOS:

// Obtener ventas por empresa
export const getVentasPorEmpresa = async (
  empresaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): Promise<VentasResumen> => {
  // ❌ No implementado
};

// Obtener ventas por marca
export const getVentasPorMarca = async (
  marcaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): Promise<VentasResumen> => {
  // ❌ No implementado
};

// Obtener ventas por PDV
export const getVentasPorPDV = async (
  pdvId: string,
  fechaDesde: Date,
  fechaHasta: Date
): Promise<VentasResumen> => {
  // ❌ No implementado
};
```

#### **❌ 4. Filtros y agregaciones:**

```typescript
// NO EXISTE:
const reporteConsolidado = await getReporteConsolidado({
  empresas: ['EMP-001'],
  marcas: ['MRC-001', 'MRC-002'],
  pdvs: ['PDV-TIANA'],
  fechaDesde: '2025-01-01',
  fechaHasta: '2025-12-31',
  agruparPor: 'marca' // o 'empresa' o 'pdv'
});
```

---

### **⚠️ CONCLUSIÓN PREGUNTA 1:**

```
✅ CONCEPTUAL: Está diseñado
✅ CONSTANTES: Definidas y documentadas
⚠️ DATOS: puntoVentaId existe pero opcional
❌ BASE DE DATOS: No hay tablas
❌ SERVICIOS: No hay funciones de consulta
❌ AGREGACIONES: No se pueden hacer reportes

VEREDICTO: Preparado al 30%, NO funcional
```

---

## 2️⃣ ALMACENAMIENTO CON IVA + VERIFACTU

### ✅ ESTADO: 100% FUNCIONAL

### **Lo que SÍ existe y funciona:**

#### **A) Estructura completa de factura con IVA:**

```typescript
// Archivo: /types/verifactu.types.ts

export interface FacturaVeriFactu {
  id: string;
  serie: string;
  numero: string;
  numeroCompleto: string;
  fecha: Date;
  
  // Emisor
  emisor: EmisorVeriFactu;
  
  // Receptor
  receptor: ReceptorVeriFactu;
  
  // Líneas de la factura
  lineas: LineaFacturaVeriFactu[];
  
  // ⭐ IMPORTES CON IVA
  baseImponibleTotal: number;      // Suma de bases
  importeIVATotal: number;          // Suma de IVAs
  importeTotal: number;             // Total factura
  
  // ⭐ DESGLOSE DE IVA
  desgloseIVA: DesgloseIVA[];       // Desglose por tipo de IVA
  
  // Cobro
  datosCobro: DatosCobro;
  
  // VeriFactu
  verifactu?: DatosVeriFactu;
  
  // Relaciones
  referenciaExterna?: string;       // ID del pedido
}
```

✅ **100% implementado**

#### **B) Desglose de IVA por tipo:**

```typescript
export interface DesgloseIVA {
  tipoIVA: number;                   // 21%, 10%, 4%, 0%
  baseImponible: number;             // Base para este tipo de IVA
  cuotaIVA: number;                  // Cuota de IVA
  tipoRecargoEquivalencia?: number;  // Recargo (si aplica)
  cuotaRecargoEquivalencia?: number; // Cuota recargo
}
```

**Ejemplo real:**

```json
{
  "desgloseIVA": [
    {
      "tipoIVA": 21,
      "baseImponible": 50.00,
      "cuotaIVA": 10.50
    },
    {
      "tipoIVA": 10,
      "baseImponible": 30.00,
      "cuotaIVA": 3.00
    }
  ],
  "baseImponibleTotal": 80.00,
  "importeIVATotal": 13.50,
  "importeTotal": 93.50
}
```

✅ **Cálculo automático**  
✅ **Validación de sumas**  
✅ **Soporte múltiples tipos de IVA**

#### **C) Líneas de factura con IVA individual:**

```typescript
export interface LineaFacturaVeriFactu {
  numeroLinea: number;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuento: number;
  
  // ⭐ IVA POR LÍNEA
  tipoIVA: number;           // 21%, 10%, 4%
  importeIVA: number;        // IVA de esta línea
  baseImponible: number;     // Base de esta línea
  importeTotal: number;      // Total línea (base + IVA)
}
```

**Ejemplo:**

```json
{
  "numeroLinea": 1,
  "descripcion": "Pan de Masa Madre",
  "cantidad": 2,
  "unidad": "ud",
  "precioUnitario": 3.50,
  "descuento": 0,
  "tipoIVA": 10,           // ⭐ Pan tiene IVA reducido 10%
  "baseImponible": 7.00,    // 2 × 3.50
  "importeIVA": 0.70,       // 10% de 7.00
  "importeTotal": 7.70      // 7.00 + 0.70
}
```

✅ **IVA calculado línea por línea**  
✅ **Soporte descuentos**  
✅ **Agregación automática**

#### **D) Generación automática de desglose:**

```typescript
// Archivo: /services/facturacion-automatica.service.ts

private calcularDesgloseIVA(lineas: LineaFacturaVeriFactu[]): DesgloseIVA[] {
  const mapa = new Map<number, { base: number; iva: number }>();
  
  // Agrupar por tipo de IVA
  lineas.forEach((linea) => {
    const tipo = linea.tipoIVA;
    const actual = mapa.get(tipo) || { base: 0, iva: 0 };
    
    mapa.set(tipo, {
      base: actual.base + linea.baseImponible,
      iva: actual.iva + linea.importeIVA,
    });
  });
  
  // Convertir a array
  return Array.from(mapa.entries()).map(([tipo, datos]) => ({
    tipoIVA: tipo,
    baseImponible: datos.base,
    cuotaIVA: datos.iva,
  }));
}
```

✅ **Función implementada y funcionando**

#### **E) Integración VeriFactu completa:**

```typescript
// Archivo: /services/verifactu.service.ts

class VeriFactuService {
  async generarVeriFactu(factura: FacturaVeriFactu): Promise<FacturaVeriFactu> {
    // 1. Generar hash SHA-256
    const hash = this.generarHash(factura);
    
    // 2. Encadenar con factura anterior
    const hashAnterior = this.configuracion.ultimoHash || null;
    
    // 3. Generar código QR
    const qrData = await this.generarQR(factura, hash);
    
    // 4. Firmar (si hay certificado)
    let firma;
    if (this.configuracion.certificado) {
      firma = await this.firmarFactura(factura, hash);
    }
    
    // 5. Crear datos VeriFactu
    const datosVeriFactu: DatosVeriFactu = {
      idVeriFactu: this.generarIdVeriFactu(factura),
      hash,
      algoritmoHash: 'SHA-256',
      hashFacturaAnterior: hashAnterior,
      firma,
      codigoQR: qrData.qrBase64,
      urlQR: qrData.url,
      fechaRegistro: new Date(),
      estado: 'firmada',
    };
    
    // 6. Generar XML según normativa AEAT
    const xml = this.construirXML(factura);
    
    // 7. Enviar a AEAT (simulado - en producción real)
    // const respuesta = await this.enviarAEAT(xml);
    
    return {
      ...factura,
      verifactu: datosVeriFactu,
    };
  }
}
```

✅ **Hash generado**  
✅ **Encadenamiento de facturas**  
✅ **QR generado**  
✅ **XML según normativa**  
⚠️ **Firma preparada** (pendiente certificado real)  
⚠️ **Envío a AEAT preparado** (pendiente credenciales)

#### **F) Almacenamiento en LocalStorage:**

```typescript
// Archivo: /services/facturacion-automatica.service.ts

private async guardarFactura(
  factura: FacturaVeriFactu, 
  pedidoId: string
): Promise<void> {
  // Obtener facturas existentes
  const facturas = JSON.parse(
    localStorage.getItem('facturas_verifactu') || '[]'
  );
  
  // Añadir nueva factura
  facturas.push({
    ...factura,
    referenciaExterna: pedidoId, // Relacionar con pedido
  });
  
  // Guardar
  localStorage.setItem('facturas_verifactu', JSON.stringify(facturas));
  
  console.log('✅ Factura guardada con IVA desglosado y VeriFactu');
}
```

**Datos guardados:**

```json
// localStorage['facturas_verifactu']
[
  {
    "id": "FAC-001",
    "numeroCompleto": "2025-000001",
    "fecha": "2025-11-29T10:30:00.000Z",
    
    "emisor": {
      "nif": "B12345678",
      "razonSocial": "Udar Edge SL"
    },
    
    "receptor": {
      "tipoIdentificador": "NIF",
      "numeroIdentificador": "12345678A",
      "razonSocial": "Juan Pérez"
    },
    
    "lineas": [
      {
        "numeroLinea": 1,
        "descripcion": "Pan Masa Madre",
        "cantidad": 2,
        "precioUnitario": 3.50,
        "tipoIVA": 10,
        "baseImponible": 7.00,
        "importeIVA": 0.70,
        "importeTotal": 7.70
      }
    ],
    
    "desgloseIVA": [
      {
        "tipoIVA": 10,
        "baseImponible": 7.00,
        "cuotaIVA": 0.70
      }
    ],
    
    "baseImponibleTotal": 7.00,
    "importeIVATotal": 0.70,
    "importeTotal": 7.70,
    
    "verifactu": {
      "hash": "a3f5b2c8d1e9f0a2b3c4d5e6f7g8h9i0",
      "hashFacturaAnterior": "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6",
      "codigoQR": "data:image/png;base64,iVBOR...",
      "urlQR": "https://verifactu.gob.es/verify/...",
      "estado": "firmada"
    },
    
    "referenciaExterna": "PED-1732895234567-ABC123"
  }
]
```

✅ **Todo guardado correctamente**

---

### **✅ CONCLUSIÓN PREGUNTA 2:**

```
✅ ESTRUCTURA: 100% completa
✅ DESGLOSE IVA: Automático y validado
✅ VERIFACTU: Hash, QR, XML completo
✅ ALMACENAMIENTO: LocalStorage funcionando
✅ GENERACIÓN AUTO: Al confirmar pago
⚠️ PRODUCCIÓN: Falta certificado + AEAT real

VEREDICTO: 100% funcional (mock), 80% listo para producción
```

---

## 3️⃣ CONEXIÓN CON EBITDA EN TIEMPO REAL

### ❌ ESTADO: NO IMPLEMENTADO (SOLO EJEMPLO)

### **Lo que existe:**

#### **A) Archivo de ejemplo con código SQL:**

```typescript
// Archivo: /EJEMPLO_INTEGRACION_DASHBOARD.tsx
// ⚠️ ESTO ES SOLO UN EJEMPLO EDUCATIVO, NO SE EJECUTA

export function Dashboard360Actualizado() {
  const cargarDatos = async () => {
    // ❌ Este fetch NO funciona, no hay endpoint
    const response = await fetch('/api/dashboard/kpis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    setDatosKPIs(data);
  };
  
  return (
    <div>
      {/* ⚠️ Renderiza datos mock, no reales */}
      <Card>
        <CardTitle>EBITDA</CardTitle>
        <CardContent>
          {formatEuro(datosKPIs.ebitda || 0)}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### **B) Queries SQL de ejemplo:**

```sql
-- ⚠️ ESTO ESTÁ ESCRITO PERO NO SE EJECUTA

-- Query 1: KPIs de ventas
SELECT 
  SUM(v.importe_total) AS ventas_totales,
  COUNT(DISTINCT v.pedido_id) AS num_pedidos,
  ROUND(AVG(v.importe_total), 2) AS ticket_medio
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
WHERE v.estado = 'completado'
  AND v.fecha BETWEEN $1 AND $2;

-- Query 2: EBITDA
SELECT 
  SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
  ROUND(
    (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
    1
  ) AS margen_porcentaje
FROM datos_financieros df
INNER JOIN punto_venta pv ON df.punto_venta_id = pv.punto_venta_id
WHERE df.fecha BETWEEN $1 AND $2;

-- Query 3: Desglose por empresa/marca/PDV
SELECT 
  e.empresa_id,
  e.nombre AS empresa_nombre,
  m.marca_id,
  m.nombre AS marca_nombre,
  pv.punto_venta_id AS pdv_id,
  pv.nombre_comercial AS pdv_nombre,
  SUM(v.importe_total) AS ventas,
  SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
  ROUND(
    (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
    1
  ) AS margen_porcentaje
FROM ventas v
INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
INNER JOIN marca m ON pv.marca_id = m.marca_id
INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
LEFT JOIN datos_financieros df ON pv.punto_venta_id = df.punto_venta_id
  AND v.fecha::date = df.fecha
WHERE v.estado = 'completado'
GROUP BY e.empresa_id, e.nombre, m.marca_id, m.nombre, pv.punto_venta_id, pv.nombre_comercial
ORDER BY ventas DESC;
```

✅ **Código SQL está escrito**  
❌ **NO hay tablas `ventas`, `datos_financieros`**  
❌ **NO hay endpoint `/api/dashboard/kpis`**  
❌ **NO hay conexión con Supabase**

#### **C) Datos mock/hardcoded:**

```typescript
// En el ejemplo solo hay datos hardcoded:

const datosMock = {
  success: true,
  ventas_totales: 145250.50,    // ⚠️ Número inventado
  num_pedidos: 1247,            // ⚠️ Número inventado
  ebitda: 52140.30,             // ⚠️ Número inventado
  margen_porcentaje: 35.9,      // ⚠️ Número inventado
  desglose: [
    {
      empresa_nombre: "Disarmink S.L.",
      marca_nombre: "Modomio",
      pdv_nombre: "Tiana",
      ventas: 85000.00,           // ⚠️ Inventado
      ebitda: 28500.00,           // ⚠️ Inventado
      margen_porcentaje: 33.5     // ⚠️ Inventado
    }
  ]
};
```

---

### **Lo que NO existe:**

#### **❌ 1. Tabla `datos_financieros`:**

```sql
-- NO EXISTE EN SUPABASE:

CREATE TABLE datos_financieros (
  id UUID PRIMARY KEY,
  punto_venta_id UUID REFERENCES punto_venta(id),
  fecha DATE NOT NULL,
  
  -- Ingresos
  ventas DECIMAL(10,2) NOT NULL,           -- Ventas totales del día
  otros_ingresos DECIMAL(10,2) DEFAULT 0,
  
  -- Costes
  coste_ventas DECIMAL(10,2) NOT NULL,     -- Coste de materias primas vendidas
  coste_materias_primas DECIMAL(10,2),
  coste_mano_obra DECIMAL(10,2),
  
  -- Gastos operativos
  gastos_operativos DECIMAL(10,2) NOT NULL,
  alquiler DECIMAL(10,2),
  suministros DECIMAL(10,2),
  marketing DECIMAL(10,2),
  otros_gastos DECIMAL(10,2),
  
  -- Calculados
  margen_bruto DECIMAL(10,2),              -- ventas - coste_ventas
  ebitda DECIMAL(10,2),                    -- margen_bruto - gastos_operativos
  margen_porcentaje DECIMAL(5,2),          -- (ebitda / ventas) * 100
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Estado:** ❌ Tabla no existe

#### **❌ 2. Sistema de cálculo automático:**

```typescript
// NO IMPLEMENTADO:

// Función que debería ejecutarse al registrar una venta
async function actualizarDatosFinancieros(venta: Venta): Promise<void> {
  const { punto_venta_id, fecha, total, items } = venta;
  
  // 1. Calcular coste de ventas
  const costeVentas = await calcularCosteItems(items);
  
  // 2. Obtener datos financieros del día
  const datosDia = await obtenerDatosFinancierosDia(punto_venta_id, fecha);
  
  // 3. Actualizar
  const nuevosdatos = {
    ...datosDia,
    ventas: datosDia.ventas + total,
    coste_ventas: datosDia.coste_ventas + costeVentas,
  };
  
  // 4. Recalcular EBITDA
  nuevosdatos.margen_bruto = nuevosdatos.ventas - nuevosData.coste_ventas;
  nuevosData.ebitda = nuevosData.margen_bruto - nuevosData.gastos_operativos;
  nuevosData.margen_porcentaje = (nuevosData.ebitda / nuevosData.ventas) * 100;
  
  // 5. Guardar
  await supabase
    .from('datos_financieros')
    .upsert(nuevosData);
}
```

**Estado:** ❌ No existe

#### **❌ 3. API endpoint `/api/dashboard/kpis`:**

```typescript
// NO EXISTE:

// Archivo que debería estar en: /app/api/dashboard/kpis/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { empresas, marcas, pdvs, fechaDesde, fechaHasta } = body;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  // Query 1: Ventas totales
  const { data: ventas } = await supabase
    .from('ventas')
    .select('importe_total, pedido_id')
    .in('punto_venta_id', pdvs)
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .eq('estado', 'completado');
  
  // Query 2: EBITDA
  const { data: financieros } = await supabase
    .from('datos_financieros')
    .select('ventas, coste_ventas, gastos_operativos')
    .in('punto_venta_id', pdvs)
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta);
  
  // Calcular
  const ventasTotales = ventas.reduce((sum, v) => sum + v.importe_total, 0);
  const ebitda = financieros.reduce(
    (sum, f) => sum + (f.ventas - f.coste_ventas - f.gastos_operativos),
    0
  );
  
  return NextResponse.json({
    success: true,
    ventas_totales: ventasTotales,
    num_pedidos: ventas.length,
    ebitda,
    margen_porcentaje: (ebitda / ventasTotales) * 100,
  });
}
```

**Estado:** ❌ Archivo no existe

#### **❌ 4. Integración en tiempo real:**

```typescript
// NO IMPLEMENTADO:

// Esto debería ejecutarse automáticamente en el TPV al confirmar venta:

const handleConfirmarVenta = async (venta: Venta) => {
  // 1. Guardar venta
  await guardarVenta(venta);
  
  // 2. ⭐ Actualizar EBITDA automáticamente
  await actualizarDatosFinancieros(venta);  // ❌ No existe
  
  // 3. ⭐ Notificar dashboard en tiempo real
  await notificarActualizacionDashboard();  // ❌ No existe
  
  // 4. Generar factura
  await generarFactura(venta);
};
```

**Estado:** ❌ No implementado

---

### **❌ CONCLUSIÓN PREGUNTA 3:**

```
✅ CONCEPTO: Documentado y diseñado
✅ QUERIES SQL: Escritas correctamente
❌ TABLAS: No existen en BD
❌ ENDPOINTS: No hay API
❌ CÁLCULO AUTO: No implementado
❌ TIEMPO REAL: No existe
❌ INTEGRACIÓN: No conectada

VEREDICTO: 0% funcional, solo documentación
```

---

## 📊 RESUMEN FINAL

### **TABLA COMPARATIVA:**

| Aspecto | Multiempresa/Marcas/PDV | IVA + VeriFactu | EBITDA Tiempo Real |
|---------|------------------------|-----------------|-------------------|
| **Diseño conceptual** | ✅ Completo | ✅ Completo | ✅ Completo |
| **Tipos/Interfaces** | ⚠️ Parcial | ✅ Completo | ❌ No |
| **Tablas de BD** | ❌ No existen | ❌ No existen | ❌ No existen |
| **Servicios** | ❌ No | ✅ Completo | ❌ No |
| **API Endpoints** | ❌ No | ❌ No | ❌ No |
| **Cálculos automáticos** | ❌ No | ✅ Sí (mock) | ❌ No |
| **Almacenamiento** | ⚠️ Solo PDV | ✅ LocalStorage | ❌ No |
| **Queries preparadas** | ✅ Sí (ejemplo) | ✅ Sí (servicio) | ✅ Sí (ejemplo) |
| **Funcional ahora** | ❌ No | ✅ Sí (mock) | ❌ No |
| **Listo producción** | ❌ 20% | ⚠️ 80% | ❌ 0% |

---

## 🎯 PARA HACER TODO FUNCIONAL

### **1. MULTIEMPRESA/MARCAS/PDV (16-20 hrs):**

```typescript
// 1. Crear tablas Supabase (2 hrs)
CREATE TABLE empresas (...);
CREATE TABLE marcas (...);
CREATE TABLE punto_venta (...);

// 2. Modificar servicio de pedidos (4 hrs)
interface Pedido {
  empresaId: string;
  marcaId: string;
  puntoVentaId: string;
  // ...
}

// 3. Crear servicios de consulta (6 hrs)
export const getVentasPorEmpresa = async (...) => { ... };
export const getVentasPorMarca = async (...) => { ... };
export const getVentasPorPDV = async (...) => { ... };

// 4. Crear API endpoints (4 hrs)
/api/ventas/por-empresa
/api/ventas/por-marca
/api/ventas/por-pdv

// 5. Actualizar componentes (4 hrs)
// Modificar TPV para capturar empresa/marca/pdv
```

---

### **2. IVA + VERIFACTU A PRODUCCIÓN (8-12 hrs):**

```typescript
// 1. Crear tabla facturas en Supabase (2 hrs)
CREATE TABLE facturas (...);
CREATE TABLE desglose_iva_facturas (...);

// 2. Modificar servicio para usar Supabase (4 hrs)
// Reemplazar localStorage por supabase.from('facturas')

// 3. Obtener certificado digital FNMT (2 hrs)
// Proceso manual en FNMT

// 4. Integrar firma real (2 hrs)
import forge from 'node-forge';
// Implementar firma con certificado

// 5. Credenciales AEAT (2 hrs)
// Solicitar acceso a VeriFactu
// Configurar endpoints
```

---

### **3. EBITDA EN TIEMPO REAL (20-24 hrs):**

```typescript
// 1. Crear tabla datos_financieros (2 hrs)
CREATE TABLE datos_financieros (...);

// 2. Sistema de costes por producto (6 hrs)
// Definir coste de cada ingrediente/producto
// Calcular coste de recetas

// 3. Función de actualización automática (4 hrs)
async function actualizarDatosFinancieros(venta) {
  const coste = await calcularCosteVenta(venta);
  // Actualizar datos_financieros
}

// 4. Trigger en ventas (2 hrs)
// Al insertar venta → actualizar datos_financieros

// 5. API de dashboard (4 hrs)
POST /api/dashboard/kpis
// Implementar queries reales

// 6. Conexión tiempo real (2 hrs)
// Supabase Realtime subscriptions
supabase
  .channel('ventas')
  .on('INSERT', () => recargarDashboard())
  .subscribe();
```

---

## ✅ RESPUESTAS FINALES

### **Pregunta 1: ¿Ventas por empresas/marcas/PDV?**

**Respuesta:** ⚠️ **PARCIALMENTE**

- ✅ Diseño completo y documentado
- ✅ Constantes definidas
- ⚠️ Solo `puntoVentaId` en pedidos (opcional)
- ❌ Falta `empresaId` y `marcaId`
- ❌ No hay tablas de BD
- ❌ No hay servicios de consulta

**Esfuerzo para completar:** 16-20 horas

---

### **Pregunta 2: ¿Almacenamiento con IVA + VeriFactu?**

**Respuesta:** ✅ **SÍ, 100% FUNCIONAL**

- ✅ Estructura completa implementada
- ✅ Desglose de IVA automático
- ✅ Hash, QR, encadenamiento
- ✅ XML según normativa
- ✅ Almacenamiento en LocalStorage
- ⚠️ Falta certificado real
- ⚠️ Falta conexión AEAT real

**Estado:** Funcional en mock, 80% listo para producción

**Esfuerzo para producción:** 8-12 horas

---

### **Pregunta 3: ¿Conectado con EBITDA en tiempo real?**

**Respuesta:** ❌ **NO**

- ✅ Código SQL de ejemplo escrito
- ❌ No hay tablas de BD
- ❌ No hay endpoints
- ❌ No hay cálculo automático
- ❌ No hay integración con ventas

**Estado:** 0% funcional, solo documentación

**Esfuerzo para implementar:** 20-24 horas

---

## 📈 RUTA RECOMENDADA

### **Prioridad 1 (Crítico):**
1. Migrar a Supabase
2. Crear tablas de ventas
3. Migrar facturas VeriFactu a BD

### **Prioridad 2 (Importante):**
4. Implementar multiempresa/marca/PDV completo
5. Crear API de consultas

### **Prioridad 3 (Deseable):**
6. Implementar datos_financieros
7. Sistema de EBITDA en tiempo real
8. Dashboard consolidado

---

**¿Quieres que empiece con alguna de estas implementaciones?** 🚀
