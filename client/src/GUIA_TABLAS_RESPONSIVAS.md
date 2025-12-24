# Guía: Tablas Responsivas en Udar Edge

## 🎯 Problema Identificado
Las tablas con scroll horizontal (`overflow-x-auto`) crean una mala experiencia de usuario en móviles porque:
- No es intuitivo que hay que deslizar horizontalmente
- El contenido queda oculto y cortado
- Dificulta la lectura y navegación
- No se aprovecha el espacio vertical disponible en móviles

## ✅ Solución Implementada
**Vistas Adaptativas**: Mostrar la información de forma diferente según el dispositivo.

### Desktop/Tablet (≥1024px)
- **Tabla tradicional** con todas las columnas visibles
- Scroll horizontal solo si es absolutamente necesario
- Acciones en menú dropdown

### Móvil (<1024px)
- **Cards verticales** con toda la información visible
- Sin scroll horizontal
- Botones de acción visibles y accesibles
- Información organizada en grid responsive

## 🛠️ Implementación

### Método 1: Manual (Más Control)

```tsx
{/* Vista Móvil - Cards */}
<div className="lg:hidden space-y-3">
  {items.length === 0 ? (
    <Card>
      <CardContent className="py-12 text-center text-gray-500">
        <IconoVacio className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No hay elementos</p>
      </CardContent>
    </Card>
  ) : (
    items.map((item) => (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 mb-1">{item.nombre}</p>
                <Badge variant="outline" className="text-xs">{item.codigo}</Badge>
              </div>
              {item.badge}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Campo 1</p>
                <p className="text-gray-900">{item.valor1}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Campo 2</p>
                <p className="text-gray-900">{item.valor2}</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Icon className="w-3 h-3 mr-1" />
                Acción 1
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Icon className="w-3 h-3 mr-1" />
                Acción 2
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  )}
</div>

{/* Vista Desktop/Tablet - Tabla */}
<Card className="hidden lg:block">
  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Columna 1</TableHead>
            <TableHead>Columna 2</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.valor1}</TableCell>
              <TableCell>{item.valor2}</TableCell>
              <TableCell>
                <DropdownMenu>
                  {/* Acciones */}
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
```

### Método 2: Componente Reutilizable

```tsx
import { ResponsiveTable } from '@/components/ui/responsive-table';

<ResponsiveTable
  headers={['Código', 'Producto', 'Stock', 'Estado', 'Acciones']}
  data={productos}
  
  // Renderizado desktop (tabla)
  renderDesktopRow={(producto) => (
    <TableRow key={producto.id}>
      <TableCell>{producto.codigo}</TableCell>
      <TableCell>{producto.nombre}</TableCell>
      <TableCell>{producto.stock}</TableCell>
      <TableCell>{getEstadoBadge(producto)}</TableCell>
      <TableCell>
        <DropdownMenu>...</DropdownMenu>
      </TableCell>
    </TableRow>
  )}
  
  // Renderizado móvil (cards)
  renderMobileCard={(producto) => (
    <Card key={producto.id}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <p className="font-medium">{producto.nombre}</p>
          <Badge>{producto.codigo}</Badge>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Stock</p>
              <p>{producto.stock}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )}
  
  emptyMessage="No hay productos"
  emptyIcon={<Package className="w-12 h-12 text-gray-300" />}
/>
```

## 📱 Clases Tailwind Importantes

### Visibilidad Responsive
```tsx
// Ocultar en móvil, mostrar en desktop
className="hidden lg:block"

// Mostrar en móvil, ocultar en desktop
className="lg:hidden"

// Diferentes breakpoints
className="hidden sm:block"  // ≥640px
className="hidden md:block"  // ≥768px
className="hidden lg:block"  // ≥1024px
className="hidden xl:block"  // ≥1280px
```

### Grid Responsive
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
```

### Espaciado Responsive
```tsx
className="p-3 sm:p-4 lg:p-6"
className="gap-2 sm:gap-3 lg:gap-4"
className="space-y-2 sm:space-y-3 lg:space-y-4"
```

### Tipografía Responsive
```tsx
className="text-xs sm:text-sm lg:text-base"
className="text-sm sm:text-base lg:text-lg"
```

## 🎨 Patrones de Diseño para Cards Móviles

### 1. Card Básica
```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardContent className="p-4">
    <div className="space-y-3">
      {/* Contenido */}
    </div>
  </CardContent>
</Card>
```

### 2. Header con Badge
```tsx
<div className="flex items-start justify-between gap-3">
  <div className="flex-1 min-w-0">
    <p className="font-medium text-gray-900 mb-1 truncate">{titulo}</p>
    <p className="text-xs text-gray-500">{subtitulo}</p>
  </div>
  <Badge>{estado}</Badge>
</div>
```

### 3. Grid de Información
```tsx
<div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
  <div>
    <p className="text-gray-500 text-xs mb-0.5">Etiqueta</p>
    <p className="text-gray-900">Valor</p>
  </div>
  {/* Más campos... */}
</div>
```

### 4. Botones de Acción
```tsx
{/* Horizontal (2 columnas) */}
<div className="grid grid-cols-2 gap-2 pt-2 border-t">
  <Button variant="outline" size="sm" className="text-xs h-8">
    <Icon className="w-3 h-3 mr-1" />
    Acción
  </Button>
</div>

{/* Vertical (1 columna) */}
<div className="flex flex-col gap-2 pt-2 border-t">
  <Button variant="outline" size="sm" className="text-xs h-8">
    Acción
  </Button>
</div>

{/* Horizontal flexible */}
<div className="flex gap-2 pt-2 border-t">
  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
    Acción
  </Button>
</div>
```

## 📋 Checklist de Implementación

- [ ] Identificar todas las tablas con `overflow-x-auto`
- [ ] Analizar las columnas más importantes
- [ ] Diseñar la card móvil con la información esencial
- [ ] Implementar vista móvil con `lg:hidden`
- [ ] Implementar vista desktop con `hidden lg:block`
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Verificar que no hay scroll horizontal en móvil
- [ ] Asegurar que todas las acciones son accesibles

## 🔍 Archivos Ya Actualizados

✅ `/components/trabajador/MaterialTrabajador.tsx`
- Tabla de materiales
- Tabla de movimientos

✅ `/components/trabajador/FormacionTrabajador.tsx`
- Filtros y búsqueda responsive
- Tabs responsive
- Cards de cursos responsive

## 📂 Archivos Pendientes de Actualizar

Los siguientes archivos tienen tablas con scroll horizontal que deberían convertirse:

### Prioridad Alta
- `/components/gerente/ClientesGerente.tsx` (múltiples tablas)
- `/components/gerente/StockProveedoresCafe.tsx`
- `/components/PanelOperativa.tsx`
- `/components/PanelOperativaAvanzado.tsx`

### Prioridad Media
- `/components/gerente/EquipoRRHH.tsx`
- `/components/gerente/DocumentacionGerente.tsx`
- `/components/gerente/FacturacionFinanzas.tsx`
- `/components/gerente/ConfiguracionGerente.tsx`

### Prioridad Baja (tablas de datos históricos)
- `/components/gerente/CuentaResultados.tsx`
- `/components/gerente/Dashboard360.tsx`
- `/components/PanelCaja.tsx`

## 💡 Tips y Mejores Prácticas

1. **Priorizar información**: En móvil solo mostrar los datos más relevantes
2. **Usar truncate**: Para textos largos: `className="truncate"`
3. **Iconos más pequeños**: `w-3 h-3` en móvil, `w-4 h-4` en desktop
4. **Grid flexible**: `grid-cols-1 sm:grid-cols-2` para adaptabilidad
5. **Touch targets**: Botones mínimo `h-8` para facilitar el toque
6. **Estados vacíos**: Siempre incluir un mensaje cuando no hay datos
7. **Loading states**: Considerar esqueletos o spinners
8. **Accesibilidad**: Mantener la estructura semántica

## 🚀 Próximos Pasos

1. Aplicar este patrón a todas las tablas principales
2. Crear variantes del componente ResponsiveTable para casos específicos
3. Documentar patrones adicionales según surjan necesidades
4. Considerar añadir modo "compacto" para tablas muy grandes

---

**Nota**: Esta solución elimina completamente el scroll horizontal en móviles,
mejorando significativamente la experiencia de usuario y haciendo la aplicación
más intuitiva y profesional.
