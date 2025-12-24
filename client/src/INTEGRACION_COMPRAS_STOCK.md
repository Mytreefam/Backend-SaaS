# 📦 Sistema de Gestión de Compras y Stock - Udar Edge

## Guía de Integración Completa

Este documento explica cómo integrar todos los componentes del sistema de gestión de compras y stock en la aplicación Udar Edge.

---

## 📋 Componentes Disponibles

### 1. **Gestión de Pedidos a Proveedores**
**Archivo:** `/components/gerente/GestionPedidosProveedores.tsx`

**Características:**
- ✅ Vista completa de todos los pedidos realizados
- ✅ Filtros por estado, proveedor, PDV y búsqueda
- ✅ Métricas: Pendientes, Parciales, Completados, Retrasados
- ✅ Acciones: Ver detalle, Editar, Duplicar, Cancelar, Descargar PDF
- ✅ Seguimiento de progreso de recepción
- ✅ Alertas de pedidos retrasados
- ✅ Modal de detalle completo con información del pedido
- ✅ Paginación con 10 pedidos por página
- ✅ Interfaz responsive

**Uso:**
```tsx
import { GestionPedidosProveedores } from './components/gerente/GestionPedidosProveedores';

// En tu componente de navegación del Gerente
<GestionPedidosProveedores />
```

---

### 2. **Dashboard de Compras**
**Archivo:** `/components/gerente/DashboardCompras.tsx`

**Características:**
- ✅ Métricas ejecutivas: Gasto total, Variación, Tasa cumplimiento
- ✅ Gráfica de evolución de gastos mensuales (BarChart)
- ✅ Distribución de gasto por categoría (PieChart)
- ✅ Top 5 proveedores por volumen de compra
- ✅ Alertas de pedidos retrasados
- ✅ Resumen de actividad (Pendientes, Completados, Retrasados)
- ✅ Filtros por período (semana, mes, trimestre, año)

**Uso:**
```tsx
import { DashboardCompras } from './components/gerente/DashboardCompras';

// Como página principal de la sección de Compras
<DashboardCompras />
```

---

### 3. **Modal Crear Pedido a Proveedor**
**Archivo:** `/components/gerente/modales/ModalCrearPedidoProveedor.tsx`

**Características:**
- ✅ Wizard de 3 pasos (Proveedor → Artículos → Resumen)
- ✅ Validación de pedido mínimo
- ✅ Cálculo automático de subtotales, IVA y total
- ✅ Búsqueda de artículos con autocompletado
- ✅ Selección de PDV destino
- ✅ Observaciones del pedido

**Uso:**
```tsx
import { ModalCrearPedidoProveedor } from './components/gerente/modales/ModalCrearPedidoProveedor';

const [modalAbierto, setModalAbierto] = useState(false);

<ModalCrearPedidoProveedor
  isOpen={modalAbierto}
  onClose={() => setModalAbierto(false)}
  onCrearPedido={(pedido) => {
    console.log('Nuevo pedido:', pedido);
    // Actualizar lista de pedidos
  }}
/>
```

---

### 4. **Recepción de Material**
**Archivo:** `/components/trabajador/RecepcionMaterialModal.tsx`

**Características:**
- ✅ Selección de pedido existente o entrada manual
- ✅ Escaneo OCR de albaranes (simulado)
- ✅ Entrada manual de materiales
- ✅ Vinculación con pedidos previos
- ✅ Actualización automática de stock mediante stockManager
- ✅ Registro de lotes, caducidades y ubicaciones
- ✅ Actualización de estado de pedidos

**Uso:**
```tsx
import { RecepcionMaterialModal } from './components/trabajador/RecepcionMaterialModal';

<RecepcionMaterialModal
  isOpen={modalOpen}
  onOpenChange={setModalOpen}
  onRecepcionCompletada={() => {
    // Refrescar datos
    console.log('Recepción completada');
  }}
/>
```

---

### 5. **Historial de Movimientos de Stock**
**Archivo:** `/components/gerente/HistorialMovimientosStock.tsx`

**Características:**
- ✅ Tabla completa con todos los movimientos
- ✅ Filtros por tipo (recepción, producción, venta, merma, ajuste)
- ✅ Filtros por PDV y búsqueda
- ✅ Visualización de cantidades anterior/nueva
- ✅ Referencias a albaranes y pedidos
- ✅ Exportación a Excel (botón preparado)
- ✅ Paginación con 20 movimientos por página

**Uso:**
```tsx
import { HistorialMovimientosStock } from './components/gerente/HistorialMovimientosStock';

<HistorialMovimientosStock />
```

---

### 6. **Alertas de Stock**
**Archivo:** `/components/gerente/AlertasStock.tsx`

**Características:**
- ✅ Dashboard con métricas de stock (Bajo, Sin Stock, Valor en Riesgo)
- ✅ Alertas agrupadas por proveedor
- ✅ Botón rápido para crear pedido por proveedor
- ✅ Tabla detallada de artículos con stock bajo
- ✅ Progreso visual del nivel de stock
- ✅ Integración con modal de crear pedido

**Uso:**
```tsx
import { AlertasStock } from './components/gerente/AlertasStock';

<AlertasStock />
```

---

## 🗃️ Archivos de Datos

### 1. **Stock Manager** (Sistema centralizado)
**Archivo:** `/data/stock-manager.ts`

**Funciones principales:**
```typescript
import { stockManager, registrarRecepcion, registrarSalida, getStockActual } from './data/stock-manager';

// Registrar recepción de material
const recepcion = stockManager.registrarRecepcion({
  numeroAlbaran: 'ALB-001',
  proveedorNombre: 'Proveedor X',
  pdvDestino: 'tiana',
  materiales: [...],
  usuarioRecepcion: 'Usuario',
  observaciones: 'Pedido completo'
});

// Registrar salida por producción
stockManager.registrarSalida(
  'ING-001', // articuloId
  50,        // cantidad
  'produccion', // tipo
  'tiana',   // pdv
  'Usuario', // usuario
  'Producción de pan'
);

// Obtener stock actual
const stock = stockManager.getStock();

// Obtener movimientos con filtros
const movimientos = stockManager.getMovimientos({
  tipo: 'recepcion',
  pdv: 'tiana',
  fechaDesde: new Date('2024-11-01')
});

// Obtener alertas
const stockBajo = stockManager.getArticulosStockBajo(100); // umbral de 100 unidades
const sinStock = stockManager.getArticulosSinStock();
```

---

### 2. **Proveedores**
**Archivo:** `/data/proveedores.ts`

```typescript
import { proveedores, buscarProveedores, obtenerProveedorPorId } from './data/proveedores';

// Obtener todos los proveedores
const todosProveedores = proveedores;

// Buscar por categoría
const proveedoresHarinas = buscarProveedores({ categoria: 'harinas' });

// Obtener proveedor específico
const proveedor = obtenerProveedorPorId('PROV-001');
```

---

### 3. **Pedidos a Proveedores**
**Archivo:** `/data/pedidos-proveedores.ts`

```typescript
import { 
  pedidosProveedores, 
  obtenerPedidosPorEstado,
  obtenerPedidosPorProveedor 
} from './data/pedidos-proveedores';

// Obtener pedidos pendientes
const pendientes = obtenerPedidosPorEstado('pendiente');

// Obtener pedidos de un proveedor
const pedidosProveedor = obtenerPedidosPorProveedor('PROV-001');
```

---

### 4. **Stock de Ingredientes**
**Archivo:** `/data/stock-ingredientes.ts`

```typescript
import { stockIngredientes, Ingrediente } from './data/stock-ingredientes';

// Obtener todo el stock
const todosIngredientes = stockIngredientes;

// Filtrar por categoría
const harinas = stockIngredientes.filter(ing => ing.categoria === 'harinas');
```

---

## 🚀 Integración en la Navegación

### Ejemplo COMPLETO de estructura de navegación para el Gerente

```tsx
// En tu componente principal del Gerente (ej: /App.tsx o Dashboard del Gerente)

import { useState } from 'react';
import { GestionPedidosProveedores } from './components/gerente/GestionPedidosProveedores';
import { DashboardCompras } from './components/gerente/DashboardCompras';
import { HistorialMovimientosStock } from './components/gerente/HistorialMovimientosStock';
import { AlertasStock } from './components/gerente/AlertasStock';
import { HistorialRecepciones } from './components/gerente/HistorialRecepciones';
import { GestionProveedores } from './components/gerente/GestionProveedores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  ShoppingCart, 
  BarChart3, 
  Package, 
  AlertTriangle, 
  Truck,
  Users 
} from 'lucide-react';

function SeccionComprasStockGerente() {
  return (
    <div className="p-6">
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="recepciones" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Recepciones
          </TabsTrigger>
          <TabsTrigger value="proveedores" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Proveedores
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="alertas" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardCompras />
        </TabsContent>

        <TabsContent value="pedidos">
          <GestionPedidosProveedores />
        </TabsContent>

        <TabsContent value="recepciones">
          <HistorialRecepciones />
        </TabsContent>

        <TabsContent value="proveedores">
          <GestionProveedores />
        </TabsContent>

        <TabsContent value="stock">
          <HistorialMovimientosStock />
        </TabsContent>

        <TabsContent value="alertas">
          <AlertasStock />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SeccionComprasStockGerente;
```

### Alternativa: Navegación con Sidebar

```tsx
import { useState } from 'react';
import { Button } from './components/ui/button';
import { 
  BarChart3, 
  ShoppingCart, 
  Truck, 
  Users, 
  Package, 
  AlertTriangle 
} from 'lucide-react';

function SeccionComprasStockConSidebar() {
  const [vistaActual, setVistaActual] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: DashboardCompras },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart, component: GestionPedidosProveedores },
    { id: 'recepciones', label: 'Recepciones', icon: Truck, component: HistorialRecepciones },
    { id: 'proveedores', label: 'Proveedores', icon: Users, component: GestionProveedores },
    { id: 'stock', label: 'Stock', icon: Package, component: HistorialMovimientosStock },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle, component: AlertasStock },
  ];

  const ComponenteActual = menuItems.find(item => item.id === vistaActual)?.component;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-4 space-y-2">
        <h2 className="text-lg font-bold mb-4 px-3">Compras & Stock</h2>
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={vistaActual === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start ${
                vistaActual === item.id ? 'bg-teal-600 text-white' : ''
              }`}
              onClick={() => setVistaActual(item.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-6">
        {ComponenteActual && <ComponenteActual />}
      </div>
    </div>
  );
}

export default SeccionComprasStockConSidebar;
```

---

## 🔄 Flujo Completo del Sistema

### 1. **Crear Pedido** (Gerente)
```
Gerente → Dashboard Compras → [+] Nuevo Pedido
  ↓
Modal Crear Pedido (3 pasos)
  → Seleccionar Proveedor
  → Añadir Artículos
  → Confirmar Pedido
  ↓
Pedido guardado con estado "pendiente"
  ↓
Notificación al proveedor (mock)
```

### 2. **Recibir Material** (Trabajador)
```
Trabajador → Recepción Material
  ↓
Seleccionar modo:
  - Desde pedido existente (auto-completa datos)
  - OCR de albarán
  - Entrada manual
  ↓
Revisar materiales recibidos
  ↓
Confirmar recepción
  ↓
Stock Manager actualiza:
  - Stock de cada artículo (+cantidad)
  - Registra movimiento de tipo "recepcion"
  - Actualiza estado del pedido (parcial/completado)
  ↓
Notificación al Gerente (mock)
```

### 3. **Monitorear** (Gerente)
```
Gerente → Ver:
  - Dashboard Compras (métricas generales)
  - Gestión de Pedidos (seguimiento individual)
  - Historial de Movimientos (trazabilidad)
  - Alertas de Stock (reposición necesaria)
```

---

## 📊 Tipos de Movimientos de Stock

| Tipo | Descripción | Afecta Stock | Ejemplo |
|------|-------------|--------------|---------|
| `recepcion` | Entrada de material desde proveedor | ✅ Aumenta | Recibir pedido |
| `produccion` | Consumo en fabricación | ✅ Disminuye | Hacer pan |
| `venta` | Venta directa de ingrediente | ✅ Disminuye | Vender harina |
| `merma` | Pérdida o deterioro | ✅ Disminuye | Caducidad |
| `ajuste` | Corrección manual | ✅ Ajusta | Inventario físico |
| `entrada` | Entrada genérica | ✅ Aumenta | Devolución |
| `salida` | Salida genérica | ✅ Disminuye | Transferencia |

---

## 📋 Nuevos Componentes Implementados (ACTUALIZACIÓN)

### 7. **Historial de Recepciones** ⭐ NUEVO
**Archivo:** `/components/gerente/HistorialRecepciones.tsx`

**Características:**
- ✅ Listado completo de todas las recepciones registradas
- ✅ Métricas: Últimos 30 días, Valor total, Esta semana, Con diferencias
- ✅ Filtros por proveedor, PDV, fecha y búsqueda
- ✅ Tabla detallada con albarán, fecha/hora, proveedor, pedido relacionado
- ✅ Modal de detalle con artículos recibidos, lotes y caducidades
- ✅ Vinculación automática con pedidos a proveedores
- ✅ Exportación a Excel (preparado)
- ✅ Descarga de albaranes en PDF (preparado)
- ✅ Paginación con 15 recepciones por página

**Uso:**
```tsx
import { HistorialRecepciones } from './components/gerente/HistorialRecepciones';

<HistorialRecepciones />
```

---

### 8. **Gestión de Proveedores (CRUD)** ⭐ NUEVO
**Archivo:** `/components/gerente/GestionProveedores.tsx`

**Características:**
- ✅ Vista completa de todos los proveedores
- ✅ Métricas: Total, Evaluación media, Top proveedor, Activos
- ✅ Filtros por categoría, estado y búsqueda
- ✅ Tabla con información de contacto, ubicación, evaluación
- ✅ CRUD completo: Crear, Editar, Ver detalle, Activar/Desactivar
- ✅ Modal de creación/edición con validaciones
- ✅ Modal de detalle con estadísticas completas
- ✅ Evaluaciones por estrellas (calidad, puntualidad, precio, atención)
- ✅ Historial de compras por proveedor (preparado)
- ✅ Paginación con 10 proveedores por página

**Uso:**
```tsx
import { GestionProveedores } from './components/gerente/GestionProveedores';

<GestionProveedores />
```

---

### 9. **Modal Crear/Editar Proveedor** ⭐ NUEVO
**Archivo:** `/components/gerente/modales/ModalCrearEditarProveedor.tsx`

**Características:**
- ✅ Formulario completo de proveedor
- ✅ Validaciones en tiempo real
- ✅ Secciones: Básica, Contacto, Dirección, Comercial, Categorías
- ✅ Selección múltiple de categorías
- ✅ Campos obligatorios marcados
- ✅ Modo crear y editar
- ✅ Mensajes de error visuales
- ✅ 15 categorías predefinidas

---

### 10. **Modal Detalle Proveedor** ⭐ NUEVO
**Archivo:** `/components/gerente/modales/ModalDetalleProveedor.tsx`

**Características:**
- ✅ Vista completa del proveedor
- ✅ Estadísticas: Pedidos, Completados, Gasto total, Cumplimiento
- ✅ Información de contacto y dirección
- ✅ Condiciones comerciales detalladas
- ✅ Evaluación con estrellas y barras de progreso
- ✅ Resumen de rendimiento
- ✅ Notas adicionales
- ✅ Diseño visual atractivo con cards de colores

---

## 🎯 Próximos Pasos Recomendados

### Alta Prioridad
1. ✅ **Integrar en navegación principal** - Añadir enlaces en el menú del Gerente
2. ✅ **Conectar con Supabase** - Persistencia real de datos
3. ✅ **Vista de Recepciones Completadas** - ✅ COMPLETADO
4. ⏳ **Sistema de Notificaciones** - Alertar al gerente de recepciones y pedidos

### Media Prioridad
5. ✅ **Gestión de Proveedores (CRUD)** - ✅ COMPLETADO
6. ⏳ **Sistema de Devoluciones** - Gestionar material defectuoso
7. ⏳ **Edición de Pedidos** - Modificar pedidos no completados
8. ⏳ **Exportación de Reportes** - PDF y Excel funcionales

### Baja Prioridad
9. ⏳ **Stock por ubicación física** - Estanterías y almacenes
10. ⏳ **Predicción con IA** - Sugerir cantidades de pedido
11. ⏳ **Integración con APIs de proveedores** - Pedidos automáticos
12. ⏳ **Sistema de aprobaciones** - Flujo de aprobación para compras grandes

---

## 🐛 Troubleshooting

### Problema: Stock no se actualiza
**Solución:** Verificar que:
1. Los códigos de artículos coincidan entre el pedido y stock-ingredientes.ts
2. El stockManager esté importado correctamente
3. La función `registrarRecepcion` se llame en `handleConfirmarRecepcion`

### Problema: Modal no se abre
**Solución:** Verificar estados:
```tsx
const [modalAbierto, setModalAbierto] = useState(false);

// Botón
<Button onClick={() => setModalAbierto(true)}>Abrir</Button>

// Modal
<Modal isOpen={modalAbierto} onOpenChange={setModalAbierto} />
```

### Problema: Filtros no funcionan
**Solución:** Verificar que:
1. Los estados de filtros estén inicializados
2. La función de filtrado use los valores correctos
3. El `useMemo` tenga las dependencias correctas

---

## 📞 Soporte

Para dudas o problemas con la integración, consulta:
- Documentación de componentes individuales (comentarios en código)
- Ejemplos de uso en cada archivo
- Console.log() para debugging (todos los componentes tienen logs detallados)

---

## 🎉 ¡Sistema Listo!

Con estos componentes tienes un sistema completo de gestión de compras y stock que incluye:
- ✅ Creación de pedidos a proveedores
- ✅ Recepción de material con actualización automática de stock
- ✅ Seguimiento de pedidos con estados y progreso
- ✅ Dashboard ejecutivo con métricas y gráficas
- ✅ Alertas inteligentes de stock
- ✅ Historial completo de movimientos
- ✅ Trazabilidad total del inventario

**¡Todo conectado y funcionando! 🚀**
