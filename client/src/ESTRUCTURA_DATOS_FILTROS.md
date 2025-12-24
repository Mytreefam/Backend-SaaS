# 📊 ESTRUCTURA DE DATOS Y FILTROS - SISTEMA UDAR EDGE

## 🎯 OBJETIVO
Documento de referencia para mantener **CONSISTENCIA ABSOLUTA** en todos los módulos del sistema al gestionar empresas, marcas y puntos de venta.

---

## 🏢 JERARQUÍA DE DATOS

```
EMPRESA
  └── MARCAS
      └── PUNTOS DE VENTA (PDV)
```

### Ejemplo Real:
```
Disarmink S.L. - Hoy Pecamos (EMPRESA)
  ├── Modomio (MARCA 🍕)
  │   ├── Tiana (PDV)
  │   └── Badalona (PDV)
  └── Blackburguer (MARCA 🍔)
      ├── Tiana (PDV)
      └── Badalona (PDV)
```

---

## 📁 ARCHIVO CENTRALIZADO

**Ubicación:** `/constants/empresaConfig.ts`

### ¿Por qué es importante?
- ✅ **Fuente única de verdad** para toda la aplicación
- ✅ Evita duplicación de datos
- ✅ Facilita mantenimiento cuando se añadan nuevas empresas/PDVs
- ✅ Garantiza consistencia en nombres y formatos
- ✅ Permite escalabilidad multi-empresa

---

## 🎨 FORMATO DE VISUALIZACIÓN

### 1. Empresa
```typescript
// FORMATO
"{nombreFiscal} - {nombreComercial}"

// EJEMPLOS
"Disarmink S.L. - Hoy Pecamos"
```

### 2. Punto de Venta (PDV)

#### Con 1 marca:
```typescript
// FORMATO
"{nombrePDV} - {marca}"

// EJEMPLO
"Tiana - Modomio"
```

#### Con 2+ marcas:
```typescript
// FORMATO
"{nombrePDV} - {marca1}, {marca2}"

// EJEMPLO
"Tiana - Modomio, Blackburguer"
```

### 3. Marca
```typescript
// FORMATO
"{icono} {nombreMarca}"

// EJEMPLOS
"🍕 Modomio"
"🍔 Blackburguer"
```

---

## 🔧 FUNCIONES AUXILIARES DISPONIBLES

Importar desde `/constants/empresaConfig.ts`:

```typescript
// Obtener nombre completo de empresa
getNombreEmpresa('EMP-001') 
// → "Disarmink S.L. - Hoy Pecamos"

// Obtener nombre PDV con marcas
getNombrePDVConMarcas('PDV-TIANA') 
// → "Tiana - Modomio, Blackburguer"

// Obtener solo nombre PDV
getNombrePDV('PDV-TIANA') 
// → "Tiana"

// Obtener nombre marca
getNombreMarca('MRC-001') 
// → "Modomio"

// Obtener icono marca
getIconoMarca('MRC-001') 
// → "🍕"

// Obtener marcas de una empresa
getMarcasEmpresa('EMP-001') 
// → [{ id: 'MRC-001', nombre: 'Modomio', ... }, ...]

// Obtener PDVs de una empresa
getPDVsEmpresa('EMP-001') 
// → [{ id: 'PDV-TIANA', nombre: 'Tiana', ... }, ...]

// Obtener PDVs que tienen una marca
getPDVsPorMarca('MRC-001') 
// → [{ id: 'PDV-TIANA', ... }, { id: 'PDV-BADALONA', ... }]
```

---

## 📋 MÓDULOS QUE DEBEN USAR ESTA ESTRUCTURA

### ✅ Ya implementados:
- [x] **ClientesGerente.tsx** - Filtro multiselección PDV
- [x] **LoginView.tsx** - Nombre de empresa
- [x] **ConfiguracionCliente.tsx** - Referencias de empresa
- [x] **PedidosCliente.tsx** - Nombre de restaurante

### ⏳ Pendientes de revisar/actualizar:
- [ ] **VentasGerente** - Filtros de empresa/PDV/marca
- [ ] **CierresGerente** - Filtros de empresa/PDV/marca
- [ ] **EBITDAGerente** - Filtros de empresa/PDV/marca
- [ ] **FacturacionGerente** - Filtros de empresa/PDV/marca (en ClientesGerente.tsx)
- [ ] **ProductosGerente** - Filtros de empresa/PDV/marca (en ClientesGerente.tsx)
- [ ] **PromocionesGerente** - Filtros de empresa/PDV/marca
- [ ] **EquipoRRHH.tsx** - Filtro de puntos de venta
- [ ] **StockGerente** - Filtros de empresa/PDV/marca
- [ ] **ProveedoresGerente** - Filtros de empresa/PDV/marca
- [ ] **OperativaGerente** - (Pendiente de articular)
- [ ] **ChatSoporte** - Referencias de empresa

---

## 🎯 IMPLEMENTACIÓN EN FILTROS

### Estructura recomendada para filtros multiselección:

```tsx
import { 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  PUNTOS_VENTA_ARRAY,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca,
  getIconoMarca
} from '../../constants/empresaConfig';

// Estado
const [filtroSeleccionado, setFiltroSeleccionado] = useState<string[]>([]);

// Render
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {filtroSeleccionado.length === 0 
        ? 'Todos' 
        : `${filtroSeleccionado.length} seleccionado${filtroSeleccionado.length > 1 ? 's' : ''}`
      }
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-3">
      {/* Empresas */}
      <div>
        <Label>Empresa</Label>
        {EMPRESAS_ARRAY.map(empresa => (
          <Checkbox
            key={empresa.id}
            checked={filtroSeleccionado.includes(empresa.id)}
            label={getNombreEmpresa(empresa.id)}
          />
        ))}
      </div>

      {/* PDVs */}
      <div>
        <Label>Puntos de Venta</Label>
        {PUNTOS_VENTA_ARRAY.map(pdv => (
          <Checkbox
            key={pdv.id}
            checked={filtroSeleccionado.includes(pdv.id)}
            label={getNombrePDVConMarcas(pdv.id)}
          />
        ))}
      </div>

      {/* Marcas */}
      <div>
        <Label>Marcas</Label>
        {MARCAS_ARRAY.map(marca => (
          <Checkbox
            key={marca.id}
            checked={filtroSeleccionado.includes(marca.id)}
            label={`${getIconoMarca(marca.id)} ${getNombreMarca(marca.id)}`}
          />
        ))}
      </div>
    </div>
  </PopoverContent>
</Popover>
```

---

## 🚀 ESCALABILIDAD MULTI-EMPRESA

Cuando se añada una nueva empresa:

1. **Agregar en `/constants/empresaConfig.ts`:**
```typescript
export const EMPRESAS: Record<string, Empresa> = {
  'EMP-001': { ... }, // Disarmink S.L. - Hoy Pecamos
  'EMP-002': {
    id: 'EMP-002',
    codigo: 'NUEVAEMPRESA',
    nombreFiscal: 'Nueva Empresa S.L.',
    nombreComercial: 'Nombre Comercial',
    cif: 'B12345678',
    // ... resto de datos
  }
};
```

2. **Añadir sus marcas:**
```typescript
export const MARCAS: Record<string, Marca> = {
  'MRC-001': { ... }, // Modomio
  'MRC-002': { ... }, // Blackburguer
  'MRC-003': {
    id: 'MRC-003',
    codigo: 'NUEVAMARCA',
    nombre: 'Nueva Marca',
    colorIdentidad: '#FF0000',
    icono: '🔥'
  }
};
```

3. **Añadir sus PDVs:**
```typescript
export const PUNTOS_VENTA: Record<string, PuntoVenta> = {
  'PDV-TIANA': { ... },
  'PDV-BADALONA': { ... },
  'PDV-NUEVO': {
    id: 'PDV-NUEVO',
    codigo: 'PDV-NUEVO',
    nombre: 'Nuevo PDV',
    empresaId: 'EMP-002',
    marcasDisponibles: ['MRC-003'],
    // ... resto de datos
  }
};
```

4. **¡Listo!** Todos los filtros se actualizarán automáticamente.

---

## ⚠️ REGLAS IMPORTANTES

1. **NUNCA** usar nombres hardcodeados como "Udar Edge"
2. **SIEMPRE** usar las funciones auxiliares de `empresaConfig.ts`
3. **VERIFICAR** que los IDs sean consistentes (EMP-XXX, MRC-XXX, PDV-XXX)
4. **MANTENER** el formato de visualización establecido
5. **ACTUALIZAR** este documento cuando se añadan nuevas estructuras

---

## 📊 QUERIES DE BASE DE DATOS

Cuando se implemente backend, las consultas deberían seguir esta estructura:

```sql
-- Obtener ventas filtradas por empresa
SELECT * FROM ventas 
WHERE empresa_id IN (filtro_empresas_seleccionadas)
  AND pdv_id IN (filtro_pdvs_seleccionados)
  AND marca_id IN (filtro_marcas_seleccionadas);

-- Obtener todos los datos de una empresa
SELECT 
  e.*,
  m.nombre as marca_nombre,
  p.nombre as pdv_nombre
FROM empresas e
LEFT JOIN marcas m ON m.empresa_id = e.empresa_id
LEFT JOIN puntos_venta p ON p.empresa_id = e.empresa_id
WHERE e.empresa_id = 'EMP-001';
```

---

## 🔍 CASOS DE USO

### Caso 1: Filtrar ventas por PDV específico
```typescript
const ventasFiltradas = ventas.filter(venta => 
  filtroSeleccionado.includes(venta.pdv_id)
);
```

### Caso 2: Mostrar nombre de empresa en header
```typescript
const empresaActual = 'EMP-001';
const nombreMostrar = getNombreEmpresa(empresaActual);
// → "Disarmink S.L. - Hoy Pecamos"
```

### Caso 3: Filtrar por marca y obtener PDVs afectados
```typescript
const marcaSeleccionada = 'MRC-001';
const pdvsAfectados = getPDVsPorMarca(marcaSeleccionada);
// → [PDV-TIANA, PDV-BADALONA]
```

---

## 📝 CHECKLIST PARA NUEVOS COMPONENTES

Cuando crees un componente que use filtros:

- [ ] Importar desde `/constants/empresaConfig.ts`
- [ ] Usar arrays `EMPRESAS_ARRAY`, `MARCAS_ARRAY`, `PUNTOS_VENTA_ARRAY`
- [ ] Aplicar funciones auxiliares para visualización
- [ ] No hardcodear nombres de empresas/marcas/PDVs
- [ ] Mantener formato de visualización establecido
- [ ] Actualizar este documento si hay cambios

---

**Última actualización:** 29 de noviembre de 2025  
**Mantenedor:** Sistema Udar Edge  
**Versión:** 1.0
