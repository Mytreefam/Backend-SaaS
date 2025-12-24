# 🎯 SISTEMA COMPLETO DE FILTROS, BÚSQUEDA Y EXPORTACIÓN

## ✅ COMPONENTES CREADOS Y LISTOS PARA USAR

### 1. **TableFilters** - `/components/ui/table-filters.tsx`
Componente reutilizable que incluye:
- ✅ Buscador con icono Search y botón X para limpiar
- ✅ Dropdown de filtros múltiples con badge contador
- ✅ Botón "Exportar" con dropdown (CSV/Excel/PDF)
- ✅ Contador de resultados ("X de Y resultados")
- ✅ Botón "Limpiar todo" automático
- ✅ Slot para contenido personalizado (children)

**Props:**
```tsx
interface TableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  showExport?: boolean;
  resultCount?: number;
  totalCount?: number;
  onClearFilters?: () => void;
  showClearFilters?: boolean;
  children?: React.ReactNode;
}
```

**Ejemplo de uso:**
```tsx
<TableFilters
  searchValue={busqueda}
  onSearchChange={setBusqueda}
  searchPlaceholder="Buscar..."
  filters={[
    {
      id: 'categoria',
      label: 'Categoría',
      value: categoriaFiltro,
      options: categorias.map(cat => ({ value: cat, label: cat })),
      onChange: setCategoriaFiltro
    }
  ]}
  onExport={handleExport}
  showExport={true}
  resultCount={filtrados.length}
  totalCount={total.length}
  onClearFilters={handleClearFilters}
  showClearFilters={busqueda !== '' || categoriaFiltro !== 'todas'}
/>
```

---

### 2. **SortableTableHead** - `/components/ui/sortable-table-head.tsx`
Componente para headers de tabla ordenables:
- ✅ Click para ordenar
- ✅ Iconos ChevronUp/Down dinámicos
- ✅ Color teal cuando activo
- ✅ Soporta alineación left/center/right

**Props:**
```tsx
interface SortableTableHeadProps {
  column: string;
  label: string;
  currentSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  onSort: (column: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}
```

**Ejemplo de uso:**
```tsx
<SortableTableHead
  column="nombre"
  label="Empleado"
  currentSort={ordenamiento}
  onSort={handleOrdenar}
  align="left"
/>
```

---

### 3. **export-utils** - `/utils/export-utils.ts`
Utilidades de exportación:

**Funciones:**
- `exportToCSV(data, filename, columns)` - Exporta a CSV
- `exportToExcel(data, filename, columns)` - Exporta a Excel (simulado)
- `exportToPDF(data, filename, columns, title)` - Abre ventana de impresión
- `formatDataForExport(data, columnMapping)` - Formatea datos

**Ejemplo de uso:**
```tsx
const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
  const datosExportar = formatDataForExport(productosFiltrados, {
    codigo: 'Código',
    nombre: 'Producto',
    pvp: 'Precio (€)'
  });

  const filename = `productos_${new Date().toISOString().split('T')[0]}`;

  switch(format) {
    case 'csv':
      exportToCSV(datosExportar, filename);
      toast.success('Exportado a CSV');
      break;
    case 'excel':
      exportToExcel(datosExportar, filename);
      toast.success('Exportado a Excel');
      break;
    case 'pdf':
      exportToPDF(datosExportar, filename, undefined, 'Título del PDF');
      toast.success('Abriendo PDF...');
      break;
  }
};
```

---

## 🎯 TABLAS YA ACTUALIZADAS

### ✅ 1. StockCliente (`/components/cliente/StockCliente.tsx`)
**Estado:** COMPLETO ✅
- TableFilters implementado
- 5 columnas ordenables (código, categoría, stock, precio)
- Exportación a CSV/Excel/PDF
- Búsqueda en tiempo real
- Filtro por categoría

---

### ✅ 2. EquipoRRHH - Control de Horarios (`/components/gerente/EquipoRRHH.tsx`)
**Estado:** PARCIALMENTE COMPLETO ⚠️

**Implementado:**
- ✅ TableFilters añadido
- ✅ handleExportControlHorarios creado
- ✅ handleClearFiltersControlHorarios creado
- ✅ Eliminado código de exportación duplicado

**PENDIENTE:**
- ⏳ Reemplazar headers manuales por SortableTableHead
- ⏳ Verificar que ordenamiento funciona correctamente

**Headers a reemplazar:**
```tsx
// ANTES (líneas 3635-3750):
<TableHead className="text-xs">
  <button onClick={() => {...}}>
    Empleado
    {ordenControlHorarios.columna === 'nombre' && (
      ordenControlHorarios.direccion === 'asc' ? <ChevronUp /> : <ChevronDown />
    )}
  </button>
</TableHead>

// DESPUÉS:
<SortableTableHead
  column="nombre"
  label="Empleado"
  currentSort={ordenControlHorarios}
  onSort={(col) => setOrdenControlHorarios({
    columna: col,
    direccion: ordenControlHorarios.columna === col && ordenControlHorarios.direccion === 'asc' ? 'desc' : 'asc'
  })}
/>
```

**Columnas en Control de Horarios:**
1. nombre - Empleado (left)
2. pdv - PDV (left)
3. planificadas - Planificadas (right)
4. trabajadas - Trabajadas (right)
5. extras - Extras (right)
6. cumplimiento - Cumplimiento (right)
7. retrasos - Retrasos (right)

---

## 📋 TABLAS PENDIENTES DE ACTUALIZAR

### ⏳ 3. EquipoRRHH - Otras secciones
**Tablas identificadas:**
- Listado de empleados
- Fichajes - Registros
- Fichajes - Validación
- Nóminas
- Absentismo
- Centros de Costes
- Consumos Internos

### ⏳ 4. StockProveedoresCafe (`/components/gerente/StockProveedoresCafe.tsx`)
**Tablas identificadas:**
- Inventario de productos (SKUs)
- Pedidos a proveedores
- Listado de proveedores
- Sugerencias de compra
- Sesiones de inventario

### ⏳ 5. FacturacionFinanzas (`/components/gerente/FacturacionFinanzas.tsx`)
**Tablas identificadas:**
- Listado de facturas
- Facturas por cliente
- Resumen financiero

### ⏳ 6. ClientesGerente (`/components/gerente/ClientesGerente.tsx`)
**Tablas identificadas:**
- Listado de clientes
- Historial de compras por cliente

### ⏳ 7. ProductividadGerente (`/components/gerente/ProductividadGerente.tsx`)
**Tablas identificadas:**
- Métricas de productividad
- Performance por empleado

### ⏳ 8. PersonalRRHH (`/components/gerente/PersonalRRHH.tsx`)
**Tablas identificadas:**
- Listado de personal
- Documentos de empleados

### ⏳ 9. Otras tablas en componentes gerente/**
- ConfiguracionChats.tsx - Categorías de consultas
- ConfiguracionAgentesExternos.tsx - Agentes externos
- InvitacionesPendientes.tsx - Invitaciones
- CronJobsMonitor.tsx - Trabajos programados

---

## 🚀 PASOS PARA IMPLEMENTAR EN CADA TABLA

### Paso 1: Añadir imports
```tsx
import { TableFilters } from '../ui/table-filters';
import { SortableTableHead } from '../ui/sortable-table-head';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export-utils';
```

### Paso 2: Crear estados (si no existen)
```tsx
const [busqueda, setBusqueda] = useState('');
const [ordenamiento, setOrdenamiento] = useState<{
  columna: string;
  direccion: 'asc' | 'desc';
}>({ columna: 'nombre', direccion: 'asc' });
```

### Paso 3: Crear handlers de exportación
```tsx
const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
  const datosExportar = formatDataForExport(datosFiltrados, {
    campo1: 'Columna 1',
    campo2: 'Columna 2',
    // ... mapeo de columnas
  });

  const filename = `nombre_tabla_${new Date().toISOString().split('T')[0]}`;

  switch(format) {
    case 'csv':
      exportToCSV(datosExportar, filename);
      toast.success('Exportado a CSV');
      break;
    case 'excel':
      exportToExcel(datosExportar, filename);
      toast.success('Exportado a Excel');
      break;
    case 'pdf':
      exportToPDF(datosExportar, filename, undefined, 'Título');
      toast.success('Abriendo PDF...');
      break;
  }
};

const handleClearFilters = () => {
  setBusqueda('');
  // Limpiar otros filtros si existen
};
```

### Paso 4: Implementar filtrado y ordenamiento en useMemo
```tsx
const datosFiltrados = useMemo(() => {
  let resultado = datos;

  // Filtro por búsqueda
  if (busqueda) {
    const searchTerm = busqueda.toLowerCase();
    resultado = resultado.filter(item => 
      item.nombre.toLowerCase().includes(searchTerm) ||
      item.codigo.toLowerCase().includes(searchTerm)
    );
  }

  // Ordenamiento
  resultado.sort((a, b) => {
    let valorA: any, valorB: any;

    switch(ordenamiento.columna) {
      case 'nombre':
        valorA = a.nombre;
        valorB = b.nombre;
        break;
      case 'fecha':
        valorA = a.fecha;
        valorB = b.fecha;
        break;
      // ... más casos
      default:
        valorA = a.nombre;
        valorB = b.nombre;
    }

    if (typeof valorA === 'string') {
      return ordenamiento.direccion === 'asc'
        ? valorA.localeCompare(valorB)
        : valorB.localeCompare(valorA);
    }

    return ordenamiento.direccion === 'asc'
      ? valorA - valorB
      : valorB - valorA;
  });

  return resultado;
}, [datos, busqueda, ordenamiento]);
```

### Paso 5: Reemplazar buscador manual con TableFilters
```tsx
// ANTES:
<div className="relative">
  <Search className="..." />
  <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
</div>

// DESPUÉS:
<TableFilters
  searchValue={busqueda}
  onSearchChange={setBusqueda}
  searchPlaceholder="Buscar..."
  filters={[
    // Filtros adicionales si los hay
  ]}
  onExport={handleExport}
  showExport={true}
  resultCount={datosFiltrados.length}
  totalCount={datos.length}
  onClearFilters={handleClearFilters}
  showClearFilters={busqueda !== ''}
/>
```

### Paso 6: Reemplazar headers manuales con SortableTableHead
```tsx
// ANTES:
<TableHead>
  <button onClick={() => {...}}>
    Nombre
    {ordenamiento.columna === 'nombre' && (
      ordenamiento.direccion === 'asc' ? <ChevronUp /> : <ChevronDown />
    )}
  </button>
</TableHead>

// DESPUÉS:
<SortableTableHead
  column="nombre"
  label="Nombre"
  currentSort={ordenamiento}
  onSort={(col) => setOrdenamiento({
    columna: col,
    direccion: ordenamiento.columna === col && ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
  })}
/>
```

---

## 📊 ESTADÍSTICAS DE IMPLEMENTACIÓN

| Componente | Estado | Filtros | Ordenamiento | Exportación |
|------------|--------|---------|--------------|-------------|
| **StockCliente** | ✅ Completo | ✅ | ✅ (5 cols) | ✅ CSV/Excel/PDF |
| **EquipoRRHH - Control Horarios** | ⚠️ Parcial | ✅ | ⏳ (7 cols) | ✅ CSV/Excel/PDF |
| **EquipoRRHH - Listado** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **EquipoRRHH - Fichajes** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **EquipoRRHH - Nóminas** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **StockProveedoresCafe** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **FacturacionFinanzas** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **ClientesGerente** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **ProductividadGerente** | ⏳ Pendiente | ❌ | ❌ | ❌ |
| **PersonalRRHH** | ⏳ Pendiente | ❌ | ❌ | ❌ |

---

## 🎨 CARACTERÍSTICAS DEL SISTEMA

### Búsqueda
- ✅ Input con icono Search
- ✅ Botón X para limpiar
- ✅ Placeholder personalizable
- ✅ Case-insensitive
- ✅ En tiempo real

### Filtros
- ✅ Dropdown con icono Filter
- ✅ Badge contador de filtros activos
- ✅ Múltiples selects
- ✅ Botón "Limpiar filtros" automático

### Ordenamiento
- ✅ Click en header para ordenar
- ✅ Segundo click invierte dirección
- ✅ Iconos visuales
- ✅ Color teal cuando activo
- ✅ Soporta strings y números
- ✅ localeCompare para acentos

### Exportación
- ✅ Dropdown con 3 opciones
- ✅ CSV: Descarga directa
- ✅ Excel: Descarga CSV
- ✅ PDF: Ventana de impresión
- ✅ Nombre con timestamp
- ✅ Toast de confirmación

---

## 💡 MEJORAS FUTURAS

1. **Exportación Excel real** - Usar librería `xlsx` o `exceljs`
2. **Exportación PDF real** - Usar `jspdf` o `pdfmake`
3. **Filtros avanzados** - Rangos de fechas, múltiple selección
4. **Persistencia de filtros** - localStorage para guardar preferencias
5. **Columnas configurables** - Permitir ocultar/mostrar columnas
6. **Paginación** - Para tablas con muchos datos
7. **Selección múltiple** - Checkbox para exportar solo seleccionados
8. **Vista de cards** - Toggle entre tabla y cards en móvil

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. ✅ **Completar EquipoRRHH - Control de Horarios**
   - Reemplazar headers con SortableTableHead (7 columnas)
   
2. ⏳ **Aplicar a EquipoRRHH - Listado de Empleados**
   - Añadir TableFilters
   - Añadir SortableTableHead
   - Crear handleExport
   
3. ⏳ **Aplicar a StockProveedoresCafe - Inventario**
   - Añadir TableFilters
   - Añadir SortableTableHead
   - Crear handleExport
   
4. ⏳ **Aplicar a FacturacionFinanzas - Facturas**
   - Añadir TableFilters
   - Añadir SortableTableHead
   - Crear handleExport

5. ⏳ **Aplicar al resto de tablas sistemáticamente**

---

**📝 Nota:** Este documento debe actualizarse cada vez que se complete una tabla.
