# 🔗 INTEGRACIÓN: Cómo Conectar los Modales en StockProveedoresCafe.tsx

## Paso a Paso para Integrar el CRUD Completo

Este archivo contiene la guía de integración del sistema CRUD de Stock, Proveedores y Pedidos en el componente `StockProveedoresCafe.tsx`.

---

## 📥 1. IMPORTAR LOS MODALES

Agregar estas líneas al inicio del archivo `StockProveedoresCafe.tsx`:

```tsx
// En la sección de imports
import { ModalNuevoProveedor } from './modales/ModalNuevoProveedor';
import { ModalNuevoArticulo } from './modales/ModalNuevoArticulo';
import { ModalNuevoPedidoProveedor } from './modales/ModalNuevoPedidoProveedor';
import { RecepcionMaterialModal } from './modales/ModalRecepcionMaterial';
```

---

## 🎯 2. AGREGAR ESTADOS AL COMPONENTE

Agregar estos hooks en la función del componente:

```tsx
export function StockProveedoresCafe() {
  // ... estados existentes ...
  
  // NUEVOS ESTADOS PARA MODALES
  const [showModalNuevoProveedor, setShowModalNuevoProveedor] = useState(false);
  const [showModalNuevoArticulo, setShowModalNuevoArticulo] = useState(false);
  const [showModalNuevoPedido, setShowModalNuevoPedido] = useState(false);
  const [showModalRecepcion, setShowModalRecepcion] = useState(false);
  
  // Estados para edición
  const [editingProveedor, setEditingProveedor] = useState<any>(null);
  const [editingArticulo, setEditingArticulo] = useState<any>(null);
  const [editingPedido, setEditingPedido] = useState<any>(null);
  const [selectedPedidoRecepcion, setSelectedPedidoRecepcion] = useState<any>(null);
  
  // Estados para datos
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [articulos, setArticulos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  
  // ... resto del código ...
}
```

---

## 📡 3. AGREGAR FUNCIONES DE CARGA DE DATOS

```tsx
// Cargar datos del servidor
const cargarProveedores = async () => {
  try {
    const data = await stockApi.obtenerProveedores({
      empresa_id: empresaFiltro
    });
    setProveedores(data);
  } catch (error) {
    toast.error('Error al cargar proveedores');
  }
};

const cargarArticulos = async () => {
  try {
    const data = await stockApi.obtenerArticulos({
      empresa_id: empresaFiltro,
      punto_venta_id: pdvFiltro
    });
    setArticulos(data);
  } catch (error) {
    toast.error('Error al cargar artículos');
  }
};

const cargarPedidos = async () => {
  try {
    const data = await stockApi.obtenerPedidosProveedor({
      empresa_id: empresaFiltro
    });
    setPedidos(data);
  } catch (error) {
    toast.error('Error al cargar pedidos');
  }
};

// Cargar todo al montar
useEffect(() => {
  cargarProveedores();
  cargarArticulos();
  cargarPedidos();
}, [empresaFiltro, pdvFiltro]);
```

---

## 🔘 4. AGREGAR BOTONES EN LA UI

### Para Proveedores (Pestaña Proveedores)

Agregar este botón en la sección de proveedores:

```tsx
<Button 
  onClick={() => setShowModalNuevoProveedor(true)}
  className="bg-teal-600 hover:bg-teal-700"
>
  <Plus className="w-4 h-4 mr-2" />
  Nuevo Proveedor
</Button>
```

### Para Artículos (Pestaña Stock)

```tsx
<Button 
  onClick={() => setShowModalNuevoArticulo(true)}
  className="bg-teal-600 hover:bg-teal-700"
>
  <Plus className="w-4 h-4 mr-2" />
  Nuevo Artículo
</Button>
```

### Para Pedidos (Pestaña Pedidos)

```tsx
<Button 
  onClick={() => setShowModalNuevoPedido(true)}
  className="bg-teal-600 hover:bg-teal-700"
>
  <Plus className="w-4 h-4 mr-2" />
  Nuevo Pedido
</Button>
```

---

## 📊 5. AGREGAR COLUMNA DE ACCIONES EN TABLAS

### Tabla de Proveedores

En la columna de acciones:

```tsx
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem 
        onClick={() => {
          setEditingProveedor(proveedor);
          setShowModalNuevoProveedor(true);
        }}
      >
        <Edit className="w-4 h-4 mr-2" />
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={async () => {
          if (confirm('¿Desactivar proveedor?')) {
            await stockApi.eliminarProveedor(proveedor.id);
            cargarProveedores();
          }
        }}
        className="text-red-600"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Eliminar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

### Tabla de Artículos

```tsx
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem 
        onClick={() => {
          setEditingArticulo(articulo);
          setShowModalNuevoArticulo(true);
        }}
      >
        <Edit className="w-4 h-4 mr-2" />
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={async () => {
          if (confirm('¿Eliminar artículo?')) {
            await stockApi.eliminarArticuloStock(articulo.id);
            cargarArticulos();
          }
        }}
        className="text-red-600"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Eliminar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

### Tabla de Pedidos

```tsx
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {pedido.estado === 'pendiente' && (
        <>
          <DropdownMenuItem 
            onClick={() => {
              setEditingPedido(pedido);
              setShowModalNuevoPedido(true);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setSelectedPedidoRecepcion(pedido);
              setShowModalRecepcion(true);
            }}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Recibir Material
          </DropdownMenuItem>
        </>
      )}
      {pedido.estado === 'recibido' && (
        <DropdownMenuItem disabled className="text-green-600">
          <CheckCircle className="w-4 h-4 mr-2" />
          Recibido
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onClick={async () => {
          if (confirm('¿Eliminar pedido?')) {
            await stockApi.eliminarPedidoProveedor(pedido.id);
            cargarPedidos();
          }
        }}
        className="text-red-600"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Eliminar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

---

## 🎨 6. RENDERIZAR LOS MODALES

Agregar esto al final del componente (antes del return principal):

```tsx
// Modales
<ModalNuevoProveedor
  isOpen={showModalNuevoProveedor}
  onClose={() => {
    setShowModalNuevoProveedor(false);
    setEditingProveedor(null);
  }}
  onSuccess={cargarProveedores}
  empresaId={empresaFiltro}
  isEditing={!!editingProveedor}
  proveedorData={editingProveedor}
/>

<ModalNuevoArticulo
  isOpen={showModalNuevoArticulo}
  onClose={() => {
    setShowModalNuevoArticulo(false);
    setEditingArticulo(null);
  }}
  onSuccess={cargarArticulos}
  empresaId={empresaFiltro}
  puntoVentaId={pdvFiltro}
  isEditing={!!editingArticulo}
  articuloData={editingArticulo}
/>

<ModalNuevoPedidoProveedor
  isOpen={showModalNuevoPedido}
  onClose={() => {
    setShowModalNuevoPedido(false);
    setEditingPedido(null);
  }}
  onSuccess={cargarPedidos}
  empresaId={empresaFiltro}
  puntoVentaId={pdvFiltro}
  proveedores={proveedores}
  articulos={articulos}
  isEditing={!!editingPedido}
  pedidoData={editingPedido}
/>

<RecepcionMaterialModal
  isOpen={showModalRecepcion}
  onClose={() => {
    setShowModalRecepcion(false);
    setSelectedPedidoRecepcion(null);
  }}
  onSuccess={cargarPedidos}
  pedidoData={selectedPedidoRecepcion}
/>
```

---

## 🧪 7. PRUEBA DE INTEGRACIÓN

### Test Manual

1. **Crear Proveedor**
   - Click en "Nuevo Proveedor"
   - Completa formulario
   - Click "Crear Proveedor"
   - ✅ Ver en tabla

2. **Crear Artículo**
   - Click en "Nuevo Artículo"
   - Selecciona proveedor
   - Completa datos
   - Click "Crear Artículo"
   - ✅ Ver en tabla

3. **Crear Pedido**
   - Click en "Nuevo Pedido"
   - Selecciona proveedor
   - Agrega artículos
   - Click "Crear Pedido"
   - ✅ Ver en tabla con estado "pendiente"

4. **Recibir Material**
   - Click en opción "Recibir Material"
   - Verifica cantidades
   - Click "Confirmar Recepción"
   - ✅ Stock actualizado automáticamente

---

## 🔍 8. VERIFICACIÓN POST-INTEGRACIÓN

Checklist de verificación:

- [ ] Todos los modales se abren/cierren correctamente
- [ ] Formularios validan datos
- [ ] Los toasts notifican acciones
- [ ] Las tablas se actualizan después de CRUD
- [ ] Los botones editar cargan datos previos
- [ ] El botón eliminar pide confirmación
- [ ] La recepción actualiza stock
- [ ] Los filtros funcionan correctamente
- [ ] No hay errores en consola
- [ ] Las validaciones funcionan

---

## 🐛 DEBUGGING

Si algo no funciona:

```tsx
// Agrega logs temporales
const cargarProveedores = async () => {
  try {
    console.log('Cargando proveedores...');
    const data = await stockApi.obtenerProveedores({
      empresa_id: empresaFiltro
    });
    console.log('Proveedores cargados:', data);
    setProveedores(data);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error al cargar proveedores');
  }
};
```

Abre las DevTools (F12) y revisa:
- Network → ver respuestas de API
- Console → ver errores
- Elements → inspeccionar HTML

---

## 📌 NOTAS IMPORTANTES

1. **Variables necesarias en componente**:
   - `empresaFiltro` - ID de empresa actual
   - `pdvFiltro` - ID de punto de venta actual

2. **Imports que ya deberían existir**:
   - `toast` de 'sonner'
   - Todos los iconos de lucide-react
   - Componentes UI (Button, Dialog, etc.)

3. **API calls esperan**:
   - Backend ejecutándose en puerto 4000
   - Autenticación correcta si es necesaria

4. **Base de datos**:
   - Tablas Prisma deben existir
   - Migrations ejecutadas

---

## 🚀 PRÓXIMOS PASOS

Una vez integrado:

1. Agregar búsqueda en las tablas
2. Agregar paginación
3. Agregar exportación a Excel
4. Agregar filtros avanzados
5. Crear dashboard de alertas
6. Agregar fotos de artículos

---

**Última actualización**: 19 de Diciembre de 2025
**Versión**: 1.0
**Status**: Listo para integrar
