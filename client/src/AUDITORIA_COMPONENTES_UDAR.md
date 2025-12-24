# 🔍 AUDITORÍA GLOBAL - UDAR DELIVERY360

**Fecha:** 26 Noviembre 2024  
**Auditor:** Sistema Figma Make  
**Objetivo:** Verificar que TODOS los componentes cumplan con el AMARRE GLOBAL

---

## 📋 RESUMEN EJECUTIVO

### ✅ LO QUE ESTÁ CORRECTO

1. **Módulo Configuración - Estructura Base**
   - ✅ Modal Crear Empresa implementado con todos los campos
   - ✅ Generación automática de IDs (EMP-xxx, MRC-xxx, PDV-xxx, CTA-xxx)
   - ✅ Relaciones Empresa → Marca → Punto de Venta correctas
   - ✅ Modal Crear Agente con empresa_id obligatorio
   - ✅ Validación: No se puede crear Punto de Venta sin Marca
   - ✅ Validación: No se puede eliminar Marca con Puntos de Venta vinculados

2. **Campos de Contexto en Usuario**
   - ✅ Campo `rol` con 6 opciones implementado
   - ✅ Campos `empresa_defecto_id`, `marca_defecto_id`, `punto_venta_defecto_id` implementados

3. **Módulo Presupuesto**
   - ✅ Filtros por Empresa/Marca/Punto de Venta implementados
   - ✅ Selector de año
   - ✅ Estados para almacenar filtros

4. **Documentación**
   - ✅ Arquitectura multiempresa documentada (21 entidades)
   - ✅ Cálculos CORE documentados (ingresos, costes, EBITDA, productividad)
   - ✅ Vistas y permisos por rol documentados
   - ✅ Automatizaciones Make documentadas

---

### ⚠️ LO QUE FALTA O NECESITA CORRECCIÓN

## 1. COMPONENTE: ConfiguracionGerente.tsx

### 1.1. Tabla "Empresas" (filtroActivo === 'puntosVenta')

**PROBLEMA:** La tabla actual muestra datos de "Marca" pero está en la pestaña "Empresas"

**Estado actual:**
```typescript
{filtroActivo === 'puntosVenta' && (
  <Card>
    <CardHeader>
      <CardTitle>Gestión de Empresas</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Fiscal</TableHead>
            <TableHead>CIF</TableHead>
            <TableHead>Nombre Comercial</TableHead>
            // ...
          </TableRow>
        </TableHeader>
        <TableBody>
          {marcas.map((marca) => ( // ❌ Debería ser "empresas"
            // ...
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)}
```

**DEBE SER:**
```typescript
// Estado necesario
const [empresas, setEmpresas] = useState<Empresa[]>([
  {
    empresaId: 'EMP-001',
    nombreFiscal: 'PAU Hostelería S.L.',
    cif: 'B12345678',
    domicilioFiscal: 'Av. Diagonal 100, Barcelona',
    nombreComercial: 'PAU Hostelería',
    empresaActiva: true,
    marcas: [
      { marcaId: 'MRC-001', nombreMarca: 'PIZZAS' },
      { marcaId: 'MRC-002', nombreMarca: 'BURGUERS' }
    ],
    puntosVenta: [
      { puntoVentaId: 'PDV-001', nombre: 'Tiana' },
      { puntoVentaId: 'PDV-002', nombre: 'Badalona' }
    ]
  }
]);

// Tabla debe iterar sobre empresas, no marcas
{empresas.map((empresa) => (
  <TableRow key={empresa.empresaId}>
    <TableCell>{empresa.nombreFiscal}</TableCell>
    <TableCell>{empresa.cif}</TableCell>
    <TableCell>{empresa.nombreComercial}</TableCell>
    <TableCell>
      {empresa.marcas.length} marcas
    </TableCell>
    <TableCell>
      {empresa.puntosVenta.length} puntos
    </TableCell>
    // ...
  </TableRow>
))}
```

**ARCHIVOS A MODIFICAR:**
- `/components/gerente/ConfiguracionGerente.tsx`

**CAMPOS QUE FALTAN EN LA INTERFAZ:**
```typescript
interface Empresa {
  empresaId: string;           // ✅ Existe como 'id'
  nombreFiscal: string;         // ✅ Existe
  cif: string;                  // ✅ Existe
  domicilioFiscal: string;      // ✅ Existe
  nombreComercial: string;      // ✅ Existe
  convenioColectivoId?: string; // ❌ FALTA
  empresaActiva: boolean;       // ✅ Existe como 'activo'
  marcas: Marca[];              // ❌ FALTA (relación)
  puntosVenta: PuntoVenta[];    // ✅ Existe pero mal tipado
  cuentasBancarias: CuentaBancaria[]; // ✅ Existe pero mal tipado
}
```

---

### 1.2. Interfaz Marca

**PROBLEMA:** Falta campo `marca_id` y `empresa_id` en la interfaz

**Estado actual:**
```typescript
interface Marca {
  id: string;                    // ❌ Debería ser marcaId
  nombreFiscal: string;          // ❌ No corresponde a Marca
  cif: string;                   // ❌ No corresponde a Marca
  domicilioFiscal: string;       // ❌ No corresponde a Marca
  nombreComercial: string;       // ❌ Debería ser nombreMarca
  // ...
  activo: boolean;
}
```

**DEBE SER:**
```typescript
interface Marca {
  marcaId: string;              // ✅ Cambiar de 'id'
  empresaId: string;            // ❌ FALTA
  nombreMarca: string;          // ✅ Cambiar de 'nombreComercial'
  codigoMarca: string;          // ❌ FALTA (ej. MRC-001)
  colorIdentidad?: string;      // ❌ FALTA
  activo: boolean;              // ✅ OK
}
```

---

### 1.3. Interfaz PuntoVenta

**PROBLEMA:** Falta campo `empresa_id` y `marca_id`

**Estado actual:**
```typescript
interface PuntoVenta {
  id: string;                    // ❌ Debería ser puntoVentaId
  nombre: string;                // ❌ Debería ser nombrePuntoVenta
  direccion: string;             // ✅ OK
  telefono: string;              // ✅ OK
  email: string;                 // ✅ OK
  activo: boolean;               // ✅ OK
  horario: string;               // ✅ OK
  // ...
}
```

**DEBE SER:**
```typescript
interface PuntoVenta {
  puntoVentaId: string;         // ✅ Cambiar de 'id'
  empresaId: string;            // ❌ FALTA
  marcaId: string;              // ❌ FALTA (OBLIGATORIO)
  nombrePuntoVenta: string;     // ✅ Cambiar de 'nombre'
  direccion: string;            // ✅ OK
  codigoPostal: string;         // ❌ FALTA
  ciudad: string;               // ❌ FALTA
  telefono: string;             // ✅ OK
  email: string;                // ✅ OK
  activo: boolean;              // ✅ OK
  horario?: string;             // ✅ OK
}
```

---

### 1.4. Modal "Añadir Empresa" (viejo)

**PROBLEMA:** Existe un modal viejo que usa `marcas` como entidades independientes

**Ubicación:** Línea ~764 de ConfiguracionGerente.tsx

**Estado actual:**
```typescript
<Button
  onClick={() => {
    setMarcaEditando(null);
    setPuntosVentaTemp([{ nombreComercial: '', direccion: '' }]);
    setCuentasBancariasTemp([{ numero: '', alias: '' }]);
    setModalMarcaOpen(true); // ❌ Modal viejo
  }}
>
  Añadir nueva Empresa
</Button>
```

**ACCIÓN REQUERIDA:**
- ✅ Ya se cambió a `setModalCrearEmpresaOpen(true)` ✅
- ❌ PERO aún existe el modal viejo `modalMarcaOpen`
- ❌ Eliminar todo el código del modal viejo (Dialog que usa `modalMarcaOpen`)

---

## 2. COMPONENTE: ModalCrearEmpresa.tsx

### ✅ LO QUE ESTÁ BIEN

- ✅ Campo `empresaId` generado automáticamente
- ✅ Campos fiscales: nombreFiscal, cif, domicilioFiscal, nombreComercial
- ✅ Campo `convenioColectivoId`
- ✅ Campo `empresaActiva` (boolean)
- ✅ Gestión de marcas múltiples con `marcaId`, `marcaNombre`, `marcaCodigo`, `colorIdentidad`
- ✅ Gestión de puntos de venta con `marcaId` obligatorio
- ✅ Gestión de cuentas bancarias
- ✅ Validaciones correctas

### ⚠️ LO QUE FALTA

**Campos en datos enviados:**

```typescript
// Estado actual al guardar:
const datosEmpresa = {
  empresaId,
  nombreFiscal,
  cif,
  domicilioFiscal,
  nombreComercial,
  convenioColectivoId,
  empresaActiva,
  marcas: [...],
  puntosVenta: [...],
  cuentasBancarias: [...]
};
```

**CAMPOS QUE FALTAN EN puntosVenta:**

Actualmente se envía:
```typescript
puntosVenta: [
  {
    puntoVentaId: "PDV-001",
    empresaId: "EMP-001",
    marcaId: "MRC-001",
    pvNombreComercial: "Tiana",
    pvDireccion: "Calle Mayor 45"
  }
]
```

**DEBERÍA ENVIAR:**
```typescript
puntosVenta: [
  {
    puntoVentaId: "PDV-001",
    empresaId: "EMP-001",
    marcaId: "MRC-001",
    nombrePuntoVenta: "Tiana",      // ✅ Cambiar de pvNombreComercial
    direccion: "Calle Mayor 45",     // ✅ Cambiar de pvDireccion
    codigoPostal: "",                // ❌ FALTA - Añadir campo en formulario
    ciudad: "",                      // ❌ FALTA - Añadir campo en formulario
    telefono: "",                    // ❌ FALTA - Añadir campo en formulario
    email: "",                       // ❌ FALTA - Añadir campo en formulario
    activo: true                     // ❌ FALTA - Por defecto true
  }
]
```

**ACCIÓN REQUERIDA:**
1. Añadir campos al formulario de Punto de Venta:
   - Código Postal (input)
   - Ciudad (input)
   - Teléfono (input)
   - Email (input)
2. Cambiar nombres de campos:
   - `pvNombreComercial` → `nombrePuntoVenta`
   - `pvDireccion` → `direccion`

---

## 3. COMPONENTE: ModalCrearAgente.tsx

### ✅ LO QUE ESTÁ BIEN

- ✅ Campo `empresaId` obligatorio
- ✅ Campos `marcaId` y `puntoVentaId` opcionales
- ✅ Permisos en formato JSON correcto
- ✅ Campo `agenteTipo` con valores correctos

### ⚠️ LO QUE FALTA

**Nombres de campos inconsistentes:**

Actualmente se envía:
```typescript
{
  agenteId: "AGE-001",
  agenteNombre: "Harinas del Norte",
  agenteTipo: "Proveedor",
  agenteEmail: "contacto@...",
  agenteTelefono: "+34 900..."
}
```

**DEBERÍA SER (según AMARRE GLOBAL):**
```typescript
{
  agenteExternoId: "AGE-001",     // ✅ Cambiar de agenteId
  empresaId: "EMP-001",            // ✅ Cambiar de empresaAsignadaId
  marcaId: "MRC-001",              // ✅ Cambiar de marcaAsignadaId
  puntoVentaId: "PDV-001",         // ✅ Cambiar de puntoVentaAsignadoId
  nombre: "Harinas del Norte",     // ✅ Cambiar de agenteNombre
  tipo: "Proveedor",               // ✅ Cambiar de agenteTipo
  email: "contacto@...",           // ✅ Cambiar de agenteEmail
  telefono: "+34 900...",          // ✅ Cambiar de agenteTelefono
  permisos: {...},                 // ✅ OK
  estado: "Activo"                 // ✅ OK
}
```

**ACCIÓN REQUERIDA:**
Cambiar nombres de variables en `guardarAgente()` para que coincidan con la tabla BBDD.

---

## 4. MÓDULO PRODUCTOS (NO EXISTE AÚN)

### ❌ COMPONENTES QUE FALTAN

#### 4.1. GestionProductos.tsx

**Debe incluir:**

```typescript
interface Producto {
  productoId: string;           // ❌ FALTA COMPONENTE
  empresaId: string;            // ❌ FALTA COMPONENTE
  marcaId: string;              // ❌ FALTA COMPONENTE
  puntoVentaId?: string;        // ❌ FALTA COMPONENTE (opcional si catálogo global)
  nombreProducto: string;
  tipo: 'ProductoVenta' | 'ArticuloCompra';
  categoria: string;
  precioVenta: number;
  activo: boolean;
}
```

**Filtros necesarios:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según catálogo)
- ✅ Categoría
- ✅ Estado (activo/inactivo)

**Acciones:**
- Crear producto
- Editar producto
- Ver escandallo (coste variable)
- Activar/Desactivar producto

---

#### 4.2. EscandalloProducto.tsx

**Debe incluir:**

```typescript
interface Escandallo {
  escandalloId: string;         // ❌ FALTA COMPONENTE
  empresaId: string;            // ❌ FALTA COMPONENTE
  marcaId: string;              // ❌ FALTA COMPONENTE
  puntoVentaId?: string;        // ❌ FALTA COMPONENTE
  productoId: string;
  articuloCompraId: string;
  cantidadNecesaria: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
}
```

**Funcionalidad:**
- Lista de ingredientes/artículos
- Cantidad por producto
- Cálculo automático coste total
- **RESULTADO:** `costo_variable_unitario` del producto

---

## 5. MÓDULO PEDIDOS (NO EXISTE AÚN)

### ❌ COMPONENTES QUE FALTAN

#### 5.1. GestionPedidos.tsx

**Debe incluir:**

```typescript
interface Pedido {
  pedidoId: string;             // ❌ FALTA COMPONENTE
  empresaId: string;            // ❌ FALTA COMPONENTE (OBLIGATORIO)
  marcaId: string;              // ❌ FALTA COMPONENTE (OBLIGATORIO)
  puntoVentaId: string;         // ❌ FALTA COMPONENTE (OBLIGATORIO)
  clienteId?: string;
  trabajadorId?: string;
  fechaHoraPedido: Date;
  estado: 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado' | 'Completado' | 'Cancelado';
  canal: 'Local' | 'Delivery' | 'TakeAway' | 'PlataformaExterna';
  importeBruto: number;
  iva: number;
  importeNeto: number;
  costoVariableTotal: number;   // ❌ CALCULADO desde líneas
  margenBruto: number;          // ❌ CALCULADO: importeBruto - costoVariableTotal
}
```

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Periodo (día, mes, año)
- ✅ Estado
- ✅ Canal

**Acciones:**
- Crear pedido
- Ver detalle (líneas)
- Cambiar estado
- **Calcular automáticamente:**
  - `costoVariableTotal` = SUM(lineas.costoVariableLinea)
  - `margenBruto` = importeBruto - costoVariableTotal

---

#### 5.2. LineaPedido (sub-componente)

**Debe incluir:**

```typescript
interface LineaPedido {
  lineaPedidoId: string;        // ❌ FALTA COMPONENTE
  pedidoId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  importeLinea: number;         // ❌ CALCULADO: cantidad × precioUnitario
  costoVariableLinea: number;   // ❌ CALCULADO: cantidad × costo_unitario_producto
  notas?: string;
}
```

**Cálculo automático al añadir línea:**
1. Obtener `costo_variable_unitario` del producto (desde escandallo)
2. Calcular `costoVariableLinea = cantidad × costo_variable_unitario`
3. Calcular `importeLinea = cantidad × precioUnitario`
4. Actualizar `costoVariableTotal` del pedido

---

## 6. MÓDULO RRHH (NO EXISTE AÚN)

### ❌ COMPONENTES QUE FALTAN

#### 6.1. RegistroHoras.tsx

**Debe incluir:**

```typescript
interface RegistroHoras {
  registroHorasId: string;      // ❌ FALTA COMPONENTE
  trabajadorId: string;
  empresaId: string;            // ❌ FALTA COMPONENTE
  marcaId?: string;             // ❌ FALTA COMPONENTE
  puntoVentaId: string;         // ❌ FALTA COMPONENTE (OBLIGATORIO)
  fecha: Date;
  horaEntrada: Time;
  horaSalida?: Time;
  horasTotales?: number;        // ❌ CALCULADO automáticamente
  tipoHora: 'ordinaria' | 'extra' | 'baja_no_remunerada' | 'vacaciones' | 'festivo';
  notas?: string;
}
```

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Periodo (día, mes, año)
- ✅ Trabajador

**Acciones:**
- Fichar entrada
- Fichar salida
- Ver historial
- **Calcular automáticamente:** `horasTotales` = horaSalida - horaEntrada

---

#### 6.2. ProductividadTrabajadores.tsx

**Debe incluir KPIs:**

```typescript
interface ProductividadTrabajador {
  trabajadorId: string;
  nombreCompleto: string;
  puntoVentaId: string;
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  // KPIs CALCULADOS:
  numPedidos: number;           // COUNT(pedidos WHERE trabajador_id)
  ventasTotales: number;        // SUM(pedidos.importe_bruto WHERE trabajador_id)
  horasTrabajadas: number;      // SUM(horas_trabajadas.horas_totales)
  ticketMedio: number;          // ventasTotales / numPedidos
  ventasPorHora: number;        // ventasTotales / horasTrabajadas
  pedidosPorHora: number;       // numPedidos / horasTrabajadas
}
```

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Periodo (mes, año)
- ✅ Trabajador

---

## 7. MÓDULO COSTES (NO EXISTE AÚN)

### ❌ COMPONENTES QUE FALTAN

#### 7.1. GestionCostesFijos.tsx

**Debe incluir:**

```typescript
interface CosteFijo {
  costeFijoId: string;          // ❌ FALTA COMPONENTE
  empresaId: string;            // ❌ FALTA COMPONENTE (OBLIGATORIO)
  marcaId?: string;             // ❌ FALTA COMPONENTE
  puntoVentaId?: string;        // ❌ FALTA COMPONENTE
  nombreCoste: string;
  periodicidad: 'mensual' | 'anual' | 'trimestral';
  importePeriodo: number;
  metodoReparto: 'por_ventas' | 'por_porcentaje_fijo' | 'por_numero_pedidos' | 'directo';
  activo: boolean;
  fechaInicio: Date;
  fechaFin?: Date;
}
```

**Niveles de coste:**
1. **Coste empresa** (puntoVentaId = NULL) → se reparte
2. **Coste punto de venta** (puntoVentaId = "PDV-001") → directo

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Periodicidad

---

## 8. MÓDULO DASHBOARDS / REPORTES (NO EXISTE AÚN)

### ❌ COMPONENTES QUE FALTAN

#### 8.1. DashboardIngresos.tsx

**Debe calcular:**

```typescript
interface DashboardIngresos {
  empresaId: string;
  marcaId?: string;
  puntoVentaId?: string;
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  // MÉTRICAS CALCULADAS:
  ingresosTotales: number;      // SUM(pedidos.importe_bruto)
  numPedidos: number;           // COUNT(pedidos)
  ticketMedio: number;          // ingresosTotales / numPedidos
  ingresosPorCanal: {           // GROUP BY canal
    Local: number;
    Delivery: number;
    TakeAway: number;
    PlataformaExterna: number;
  };
  evolucion: {                  // GROUP BY fecha
    fecha: Date;
    ingresos: number;
  }[];
}
```

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Periodo (día, mes, año, custom)

---

#### 8.2. DashboardEBITDA.tsx

**Debe calcular:**

```typescript
interface DashboardEBITDA {
  empresaId: string;
  marcaId?: string;
  puntoVentaId?: string;
  mes: number;
  anio: number;
  // MÉTRICAS CALCULADAS:
  ingresosTotales: number;          // SUM(pedidos.importe_bruto)
  costesVariablesTotales: number;   // SUM(pedidos.costo_variable_total)
  costesFijosTotales: number;       // SUM(costes_fijos.importe_periodo) con reparto
  margenBruto: number;              // ingresosTotales - costesVariablesTotales
  ebitda: number;                   // margenBruto - costesFijosTotales
  margenEbitdaPorcentaje: number;   // (ebitda / ingresosTotales) × 100
}
```

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Mes
- ✅ Año

---

## 9. MÓDULO FACTURACIÓN (NO EXISTE AÚN)

### ❌ COMPONENTES QUE FALTAN

#### 9.1. GestionFacturas.tsx

**Debe incluir:**

```typescript
interface Factura {
  facturaId: string;            // ❌ FALTA COMPONENTE
  empresaId: string;            // ❌ FALTA COMPONENTE (OBLIGATORIO)
  marcaId?: string;             // ❌ FALTA COMPONENTE
  puntoVentaId?: string;        // ❌ FALTA COMPONENTE
  pedidoId?: string;
  numeroFactura: string;
  fechaFactura: Date;
  clienteNombre: string;
  clienteCif?: string;
  importeTotal: number;
  iva: number;
  formaPago: 'TPV' | 'Efectivo' | 'Transferencia' | 'PasarelaOnline';
  estadoCobro: 'Pendiente' | 'Cobrado' | 'Parcialmente_cobrado' | 'Devuelto';
  pdfUrl?: string;
}
```

**Filtros OBLIGATORIOS:**
- ✅ Empresa (según rol)
- ✅ Marca (según rol)
- ✅ Punto de Venta (según rol)
- ✅ Periodo
- ✅ Estado cobro
- ✅ Forma de pago

---

## 10. RESUMEN DE CAMPOS FALTANTES POR MÓDULO

### Configuración (ConfiguracionGerente.tsx)
- ❌ Renombrar interfaz `Marca` a `Empresa`
- ❌ Añadir campo `convenioColectivoId` en empresas
- ❌ Añadir campo `empresaId` en marcas
- ❌ Añadir campo `codigoMarca` en marcas
- ❌ Añadir campos `empresaId` y `marcaId` en puntos de venta
- ❌ Renombrar campos en punto de venta (nombre → nombrePuntoVenta)
- ❌ Eliminar modal viejo de empresas/marcas

### ModalCrearEmpresa.tsx
- ❌ Añadir campos en Punto de Venta:
  - codigoPostal
  - ciudad
  - telefono
  - email
- ❌ Renombrar campos:
  - pvNombreComercial → nombrePuntoVenta
  - pvDireccion → direccion

### ModalCrearAgente.tsx
- ❌ Renombrar campos para coincidir con BBDD:
  - agenteId → agenteExternoId
  - empresaAsignadaId → empresaId
  - marcaAsignadaId → marcaId
  - puntoVentaAsignadoId → puntoVentaId
  - agenteNombre → nombre
  - agenteTipo → tipo
  - agenteEmail → email
  - agenteTelefono → telefono

### Módulos que NO EXISTEN:
- ❌ GestionProductos.tsx
- ❌ EscandalloProducto.tsx
- ❌ GestionPedidos.tsx
- ❌ LineaPedido.tsx (sub-componente)
- ❌ RegistroHoras.tsx
- ❌ ProductividadTrabajadores.tsx
- ❌ GestionCostesFijos.tsx
- ❌ DashboardIngresos.tsx
- ❌ DashboardEBITDA.tsx
- ❌ GestionFacturas.tsx

---

## 11. CHECKLIST PARA COMPLETAR EL AMARRE

### ✅ Fase 1: Corregir Configuración (PRIORITARIO)

- [ ] Renombrar interfaces en ConfiguracionGerente.tsx
  - [ ] Marca → Empresa
  - [ ] Añadir empresaId en Marca
  - [ ] Añadir empresaId y marcaId en PuntoVenta
- [ ] Completar campos en ModalCrearEmpresa.tsx
  - [ ] Añadir CP, ciudad, teléfono, email en Punto de Venta
  - [ ] Renombrar campos (pvNombreComercial → nombrePuntoVenta)
- [ ] Renombrar campos en ModalCrearAgente.tsx
  - [ ] Todos los campos según tabla BBDD
- [ ] Eliminar modal viejo de empresas/marcas
- [ ] Actualizar datos mock con estructura correcta

### ✅ Fase 2: Crear Módulo Productos

- [ ] Crear GestionProductos.tsx
  - [ ] Incluir empresaId, marcaId, puntoVentaId (opcional)
  - [ ] Filtros por Empresa/Marca/Punto de Venta
  - [ ] CRUD productos
- [ ] Crear EscandalloProducto.tsx
  - [ ] Gestión de ingredientes/artículos
  - [ ] Cálculo coste variable unitario

### ✅ Fase 3: Crear Módulo Pedidos

- [ ] Crear GestionPedidos.tsx
  - [ ] Incluir empresaId, marcaId, puntoVentaId (OBLIGATORIOS)
  - [ ] Filtros por Empresa/Marca/Punto de Venta/Periodo
  - [ ] Cálculo automático costoVariableTotal y margenBruto
- [ ] Crear componente LineaPedido
  - [ ] Cálculo automático costoVariableLinea

### ✅ Fase 4: Crear Módulo RRHH

- [ ] Crear RegistroHoras.tsx
  - [ ] Incluir empresaId, puntoVentaId (OBLIGATORIOS)
  - [ ] Filtros por Empresa/Punto de Venta/Periodo/Trabajador
  - [ ] Cálculo automático horasTotales
- [ ] Crear ProductividadTrabajadores.tsx
  - [ ] KPIs calculados desde pedidos y horas

### ✅ Fase 5: Crear Módulo Costes

- [ ] Crear GestionCostesFijos.tsx
  - [ ] Incluir empresaId (OBLIGATORIO)
  - [ ] marcaId y puntoVentaId (OPCIONALES)
  - [ ] Métodos de reparto

### ✅ Fase 6: Crear Dashboards

- [ ] Crear DashboardIngresos.tsx
  - [ ] Filtros por Empresa/Marca/Punto de Venta/Periodo
  - [ ] Cálculos desde tabla pedidos
- [ ] Crear DashboardEBITDA.tsx
  - [ ] Filtros por Empresa/Marca/Punto de Venta/Mes/Año
  - [ ] Cálculo EBITDA = Ingresos - Costes Variables - Costes Fijos

### ✅ Fase 7: Crear Módulo Facturación

- [ ] Crear GestionFacturas.tsx
  - [ ] Incluir empresaId (OBLIGATORIO)
  - [ ] marcaId y puntoVentaId (OPCIONALES)
  - [ ] Filtros por Empresa/Marca/Punto de Venta/Periodo

---

## 12. PRIORIDAD DE IMPLEMENTACIÓN

### 🔴 URGENTE (Esta semana)

1. ✅ Corregir interfaces en ConfiguracionGerente.tsx
2. ✅ Completar campos en ModalCrearEmpresa.tsx
3. ✅ Renombrar campos en ModalCrearAgente.tsx
4. ✅ Eliminar modal viejo

### 🟡 ALTA (Próximas 2 semanas)

5. ⏳ Crear GestionProductos.tsx + EscandalloProducto.tsx
6. ⏳ Crear GestionPedidos.tsx + LineaPedido.tsx

### 🟢 MEDIA (Próximo mes)

7. ⏳ Crear RegistroHoras.tsx + ProductividadTrabajadores.tsx
8. ⏳ Crear GestionCostesFijos.tsx
9. ⏳ Crear DashboardIngresos.tsx + DashboardEBITDA.tsx

### ⚪ BAJA (Backlog)

10. ⏳ Crear GestionFacturas.tsx
11. ⏳ Crear módulo de Reportes avanzados

---

## 13. CONCLUSIÓN

### ✅ Estado actual: 30% completado

- ✅ Arquitectura base definida
- ✅ Módulo Configuración al 80% (falta corregir interfaces)
- ✅ Documentación completa
- ❌ Módulos de negocio: 0% (Productos, Pedidos, RRHH, Costes, Dashboards)

### 🎯 Objetivo: 100% completado

**Para lograr el AMARRE GLOBAL completo:**

1. **Corregir ConfiguracionGerente.tsx** (2-3 horas)
2. **Completar ModalCrearEmpresa.tsx** (1 hora)
3. **Renombrar ModalCrearAgente.tsx** (30 min)
4. **Crear 10 módulos de negocio** (80-100 horas)

**Estimación total:** 85-105 horas de desarrollo

---

**Última actualización:** 26 Noviembre 2024  
**Auditor:** Sistema Figma Make  
**Estado:** ✅ Auditoría completa realizada
