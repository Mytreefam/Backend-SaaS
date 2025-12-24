# 📘 GUÍA DE USO: StockContext - Sincronización en Tiempo Real

**Sistema:** Udar Edge - Stock y Proveedores  
**Fecha:** 29 de Noviembre de 2025  
**Estado:** ✅ IMPLEMENTADO Y LISTO PARA USAR

---

## ✅ **¿QUÉ SE HA IMPLEMENTADO?**

Se ha creado un **Context API de React** que:

1. ✅ Gestiona **stock separado por empresa y punto de venta**
2. ✅ Sincroniza **en tiempo real** entre gerente y trabajador
3. ✅ Integra con la **configuración de empresas** del gerente
4. ✅ Actualiza automáticamente cuando se reciben pedidos
5. ✅ Mantiene la estructura de datos actual (compatibilidad total)

---

## 🎯 **BENEFICIOS INMEDIATOS**

### ANTES (sin StockContext):
```
TRABAJADOR recibe pedido → Stock actualizado en memoria
                                    ↓
                           ❌ GERENTE NO LO VE hasta recargar
```

### AHORA (con StockContext):
```
TRABAJADOR recibe pedido → Stock actualizado en StockContext
                                    ↓
                           ✅ GERENTE LO VE INMEDIATAMENTE
                           ✅ KPIs se actualizan automáticamente
                           ✅ Pedido cambia de estado en tiempo real
```

---

## 📦 **ARCHIVOS CREADOS**

### 1. `/contexts/StockContext.tsx`
Context API con todas las funciones necesarias:

```typescript
// Funciones disponibles:
- empresas                    // Lista de empresas configuradas
- empresaActiva              // Empresa seleccionada actualmente
- puntoVentaActivo           // Punto de venta activo
- stock                      // Array de todos los SKUs
- pedidosProveedores         // Array de pedidos
- proveedores                // Array de proveedores
- movimientos                // Array de movimientos
- recepciones                // Array de recepciones

// Funciones de empresa/PDV:
- setEmpresaActiva(empresaId)
- setPuntoVentaActivo(puntoVentaId)
- getPuntosVentaDeEmpresa(empresaId)

// Funciones de stock:
- getStockPorEmpresa(empresa)
- getStockPorPuntoVenta(empresa, puntoVenta)
- actualizarStockArticulo(articuloId, cantidad)

// Funciones de pedidos:
- getPedidosPorEmpresa(empresa)
- getPedidosPorPuntoVenta(empresa, puntoVenta)
- crearPedidoProveedor(pedido)

// Funciones de recepción:
- registrarRecepcion(recepcion)
- getMovimientosPorPuntoVenta(puntoVenta)

// Actualización global:
- refreshAll()
```

### 2. `/App.tsx` (modificado)
Ahora envuelve toda la aplicación con `StockProvider`:

```tsx
<StockProvider>
  <ConfiguracionChatsProvider>
    <CartProvider>
      {/* Componentes */}
    </CartProvider>
  </ConfiguracionChatsProvider>
</StockProvider>
```

---

## 🚀 **CÓMO USAR EN TUS COMPONENTES**

### **Ejemplo 1: Ver Stock en Pantalla del Gerente**

**Archivo:** `/components/gerente/StockProveedoresCafe.tsx`

#### ANTES (datos mock locales):
```typescript
export function StockProveedoresCafe() {
  // ❌ Datos locales que no se sincronizan
  const [skus] = useState<SKU[]>([
    { id: 'SKU001', nombre: 'Harina...', disponible: 15, ... }
  ]);
  
  return (
    <div>
      {skus.map(sku => ...)}
    </div>
  );
}
```

#### AHORA (con StockContext):
```typescript
import { useStock } from '../../contexts/StockContext';

export function StockProveedoresCafe() {
  // ✅ Usa datos del contexto compartido
  const { 
    stock, 
    empresaActiva, 
    puntoVentaActivo,
    getStockPorPuntoVenta 
  } = useStock();
  
  // Filtrar stock por punto de venta activo
  const stockFiltrado = puntoVentaActivo 
    ? getStockPorPuntoVenta('Disarmink SL - Hoy Pecamos', puntoVentaActivo)
    : stock;
  
  return (
    <div>
      {stockFiltrado.map(sku => (
        <div key={sku.id}>
          {sku.nombre} - Stock: {sku.disponible}
        </div>
      ))}
    </div>
  );
}
```

**✅ AHORA:** Cuando el trabajador reciba material, el gerente lo verá inmediatamente sin recargar.

---

### **Ejemplo 2: Recibir Material en Pantalla del Trabajador**

**Archivo:** `/components/trabajador/RecepcionMaterialModal.tsx`

#### ANTES (solo actualizaba StockManager):
```typescript
const handleConfirmarRecepcion = () => {
  // ❌ Solo actualiza StockManager, no sincroniza
  const recepcion = stockManager.registrarRecepcion({
    numeroAlbaran,
    proveedorNombre: proveedor,
    materiales: materialesParaStock,
    ...
  });
  
  toast.success('Recepción completada');
  onRecepcionCompletada();
};
```

#### AHORA (con StockContext):
```typescript
import { useStock } from '../../contexts/StockContext';

export function RecepcionMaterialModal({ ... }) {
  // ✅ Usa la función del contexto
  const { registrarRecepcion, puntoVentaActivo } = useStock();
  
  const handleConfirmarRecepcion = () => {
    // ✅ Registra y sincroniza automáticamente
    const recepcion = registrarRecepcion({
      numeroAlbaran,
      proveedorNombre: proveedor,
      pedidoRelacionado: pedidoSeleccionado,
      pdvDestino: puntoVentaActivo || 'tiana',
      materiales: materialesParaStock,
      usuarioRecepcion: 'Usuario Actual',
      observaciones: notas
    });
    
    toast.success('¡Recepción completada!', {
      description: `Stock actualizado. El gerente puede verlo ahora mismo.`
    });
    
    onRecepcionCompletada();
  };
  
  return (
    // ... tu modal actual
  );
}
```

**✅ AHORA:** Al confirmar recepción:
1. Stock se actualiza en el contexto
2. Gerente lo ve inmediatamente
3. Pedido cambia de estado automáticamente
4. KPIs se recalculan en tiempo real

---

### **Ejemplo 3: Ver Pedidos del Trabajador**

**Archivo:** `/components/trabajador/MaterialTrabajador.tsx`

#### ANTES (datos mock locales):
```typescript
export function MaterialTrabajador() {
  // ❌ Datos locales independientes
  const pedidosPendientes: PedidoPendiente[] = [
    { id: 'PED-2025-011', proveedor: 'Harinas...', ... }
  ];
  
  return (
    <div>
      {pedidosPendientes.map(pedido => ...)}
    </div>
  );
}
```

#### AHORA (con StockContext):
```typescript
import { useStock } from '../../contexts/StockContext';

export function MaterialTrabajador() {
  // ✅ Usa pedidos del contexto
  const { 
    pedidosProveedores, 
    empresaActiva,
    puntoVentaActivo,
    getPedidosPorPuntoVenta 
  } = useStock();
  
  // Filtrar pedidos pendientes del punto de venta actual
  const pedidosPendientes = getPedidosPorPuntoVenta(
    'Disarmink SL - Hoy Pecamos',
    puntoVentaActivo || 'Tiana'
  ).filter(p => p.estado !== 'entregado' && p.estado !== 'anulado');
  
  return (
    <div>
      <h3>Pedidos Pendientes de Recibir</h3>
      {pedidosPendientes.map(pedido => (
        <div key={pedido.id}>
          <p>{pedido.numeroPedido} - {pedido.proveedorNombre}</p>
          <Badge>{pedido.estado}</Badge>
          <Button onClick={() => abrirRecepcion(pedido.id)}>
            Recibir
          </Button>
        </div>
      ))}
    </div>
  );
}
```

**✅ AHORA:** El trabajador ve los pedidos creados por el gerente en tiempo real.

---

### **Ejemplo 4: Crear Pedido desde Pantalla del Gerente**

**Archivo:** `/components/gerente/StockProveedoresCafe.tsx`

```typescript
import { useStock } from '../../contexts/StockContext';

export function StockProveedoresCafe() {
  const { crearPedidoProveedor, empresaActiva, puntoVentaActivo } = useStock();
  
  const handleCrearPedido = (articulosSeleccionados: any[]) => {
    // ✅ Crear pedido en el contexto compartido
    const nuevoPedido = crearPedidoProveedor({
      proveedorId: 'PROV-001',
      proveedorNombre: 'Harinas del Norte',
      estado: 'solicitado',
      fechaSolicitud: new Date().toISOString(),
      fechaEstimadaEntrega: '2025-12-05',
      empresa: 'Disarmink SL - Hoy Pecamos',
      puntoVenta: puntoVentaActivo || 'Tiana',
      articulos: articulosSeleccionados,
      lineas: articulosSeleccionados,
      subtotal: 740.00,
      totalIva: 29.60,
      totalRecargoEquivalencia: 3.70,
      total: 773.30,
      responsable: 'Gerente',
    });
    
    toast.success('Pedido creado', {
      description: `${nuevoPedido.numeroPedido} - El trabajador puede verlo ahora`
    });
  };
  
  return (
    // ... tu componente
  );
}
```

**✅ AHORA:** El pedido aparece inmediatamente en la pantalla del trabajador.

---

## 🏢 **FILTRADO POR EMPRESA Y PUNTO DE VENTA**

### **Estructura de Datos:**

```typescript
// Stock separado por empresa y punto de venta
{
  id: 'SKU001',
  nombre: 'Harina de Trigo T45',
  empresa: 'Disarmink SL - Hoy Pecamos',  // ← Empresa
  ubicacion: 'Tiana',                      // ← Punto de venta
  almacen: 'Tiana',
  disponible: 15,
  ...
}

// Pedido separado por empresa y punto de venta
{
  id: 'PED-001',
  numeroPedido: 'PED-2025-001',
  empresa: 'Disarmink SL - Hoy Pecamos',  // ← Empresa
  puntoVenta: 'Tiana',                     // ← Punto de venta
  proveedorNombre: 'Harinas del Norte',
  ...
}
```

### **Funciones de Filtrado:**

```typescript
const { 
  stock,
  getStockPorEmpresa,
  getStockPorPuntoVenta 
} = useStock();

// Filtrar por empresa
const stockTiana = getStockPorEmpresa('Disarmink SL - Hoy Pecamos');

// Filtrar por punto de venta específico
const stockBadalona = getStockPorPuntoVenta(
  'Disarmink SL - Hoy Pecamos', 
  'Badalona'
);

// Lo mismo para pedidos
const pedidosTiana = getPedidosPorPuntoVenta(
  'Disarmink SL - Hoy Pecamos',
  'Tiana'
);
```

---

## 🎨 **INTEGRACIÓN CON CONFIGURACIÓN DE EMPRESAS**

El `StockContext` usa la misma estructura de empresas que `ConfiguracionEmpresas.tsx`:

```typescript
// Estructura de empresa (desde ConfiguracionEmpresas)
interface Empresa {
  id: string;                    // 'EMP-001'
  nombreFiscal: string;          // 'Disarmink S.L.'
  nombreComercial: string;       // 'Hoy Pecamos'
  marcas: Marca[];               // ['Modomio', 'Blackburguer']
  puntosVenta: PuntoVenta[];     // ['Tiana', 'Badalona']
  ...
}

// Acceder desde cualquier componente:
const { 
  empresas,                      // Array de todas las empresas
  empresaActiva,                 // Empresa seleccionada
  getPuntosVentaDeEmpresa        // Obtener PDVs de una empresa
} = useStock();

// Ejemplo: Obtener puntos de venta
const puntosVenta = getPuntosVentaDeEmpresa('EMP-001');
// Retorna: [{ id: 'PDV-TIANA', nombre: 'Tiana', ... }, { id: 'PDV-BADALONA', ... }]
```

---

## 📊 **ACTUALIZACIÓN AUTOMÁTICA DE KPIs**

Los KPIs se recalculan automáticamente cuando cambia el stock:

```typescript
import { useStock } from '../../contexts/StockContext';
import { useMemo } from 'react';

export function KPIStock() {
  const { stock } = useStock();
  
  // ✅ Se recalcula automáticamente cuando cambia stock
  const kpis = useMemo(() => {
    const totalArticulos = stock.length;
    const stockBajo = stock.filter(s => s.estado === 'bajo').length;
    const valorTotal = stock.reduce((sum, s) => sum + (s.disponible * s.costoMedio), 0);
    
    return { totalArticulos, stockBajo, valorTotal };
  }, [stock]); // ← Recalcula cuando stock cambia
  
  return (
    <div>
      <KPI label="Total Artículos" value={kpis.totalArticulos} />
      <KPI label="Stock Bajo" value={kpis.stockBajo} />
      <KPI label="Valor Total" value={`€${kpis.valorTotal.toFixed(2)}`} />
    </div>
  );
}
```

**✅ BENEFICIO:** Cuando el trabajador recibe material, los KPIs del gerente se actualizan automáticamente.

---

## 🔄 **FLUJO COMPLETO DE RECEPCIÓN**

```
1. GERENTE crea pedido
   ↓
   crearPedidoProveedor() actualiza StockContext
   ↓
   ✅ TRABAJADOR ve el pedido inmediatamente en su pantalla

2. Llega la mercancía
   ↓
   TRABAJADOR abre RecepcionMaterialModal
   ↓
   Selecciona pedido pendiente
   ↓
   Confirma recepción
   ↓
   registrarRecepcion() actualiza StockContext
   ↓
   ✅ Stock actualizado
   ✅ Pedido marcado como 'entregado'
   ✅ Movimientos registrados
   
3. GERENTE ve cambios en tiempo real
   ↓
   Stock actualizado automáticamente
   KPIs recalculados
   Pedido cambia de 'en-transito' a 'entregado'
   ✅ Sin recargar la página
```

---

## 🛠️ **EJEMPLO COMPLETO: Componente con StockContext**

```typescript
import { useStock } from '../../contexts/StockContext';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';

export function MiComponenteDeStock() {
  // 1. Obtener datos del contexto
  const {
    stock,
    pedidosProveedores,
    empresaActiva,
    puntoVentaActivo,
    getStockPorPuntoVenta,
    getPedidosPorPuntoVenta,
    registrarRecepcion,
    crearPedidoProveedor,
  } = useStock();

  // 2. Filtrar datos por punto de venta
  const stockLocal = useMemo(() => {
    if (!empresaActiva || !puntoVentaActivo) return stock;
    return getStockPorPuntoVenta(empresaActiva, puntoVentaActivo);
  }, [stock, empresaActiva, puntoVentaActivo]);

  const pedidosPendientes = useMemo(() => {
    if (!empresaActiva || !puntoVentaActivo) return [];
    return getPedidosPorPuntoVenta(empresaActiva, puntoVentaActivo)
      .filter(p => p.estado !== 'entregado');
  }, [pedidosProveedores, empresaActiva, puntoVentaActivo]);

  // 3. Calcular KPIs automáticos
  const kpis = useMemo(() => ({
    totalArticulos: stockLocal.length,
    stockBajo: stockLocal.filter(s => s.estado === 'bajo').length,
    pedidosPendientes: pedidosPendientes.length,
  }), [stockLocal, pedidosPendientes]);

  // 4. Función para recibir material
  const handleRecibirMaterial = (pedidoId: string, materiales: any[]) => {
    const recepcion = registrarRecepcion({
      numeroAlbaran: `ALB-${Date.now()}`,
      proveedorNombre: 'Proveedor X',
      pedidoRelacionado: pedidoId,
      pdvDestino: puntoVentaActivo || 'tiana',
      materiales: materiales,
      usuarioRecepcion: 'Usuario Actual',
    });

    toast.success('Material recibido correctamente', {
      description: `${materiales.length} artículos añadidos al stock`
    });
  };

  // 5. Efecto para detectar cambios
  useEffect(() => {
    console.log('Stock actualizado:', stockLocal.length);
  }, [stockLocal]);

  return (
    <div>
      <h2>Stock de {puntoVentaActivo}</h2>
      
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Artículos" value={kpis.totalArticulos} />
        <KPICard label="Stock Bajo" value={kpis.stockBajo} />
        <KPICard label="Pedidos" value={kpis.pedidosPendientes} />
      </div>

      {/* Lista de stock */}
      <div>
        {stockLocal.map(articulo => (
          <div key={articulo.id}>
            <h4>{articulo.nombre}</h4>
            <p>Stock: {articulo.disponible}</p>
            <Badge>{articulo.estado}</Badge>
          </div>
        ))}
      </div>

      {/* Pedidos pendientes */}
      <div>
        <h3>Pedidos Pendientes</h3>
        {pedidosPendientes.map(pedido => (
          <div key={pedido.id}>
            <p>{pedido.numeroPedido}</p>
            <Button onClick={() => handleRecibirMaterial(pedido.id, pedido.articulos)}>
              Recibir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ⚡ **VENTAJAS DEL STOCKCONTEXT**

| Característica | Antes (Mock Local) | Ahora (StockContext) |
|----------------|-------------------|----------------------|
| **Sincronización** | ❌ No | ✅ Tiempo real |
| **Datos compartidos** | ❌ No | ✅ Sí |
| **Filtro por empresa** | ⚠️ Manual | ✅ Automático |
| **Filtro por PDV** | ⚠️ Manual | ✅ Automático |
| **Actualización KPIs** | ❌ Manual | ✅ Automática |
| **Pedidos sincronizados** | ❌ No | ✅ Sí |
| **Persistencia** | ❌ No | ⚠️ En memoria |

---

## 🚨 **LIMITACIONES ACTUALES**

1. **No hay persistencia**: Los datos se pierden al recargar la página
   - **Solución futura**: Conectar con Supabase

2. **Solo funciona en el mismo navegador**: No sincroniza entre dispositivos
   - **Solución futura**: WebSockets + Supabase Realtime

3. **Datos iniciales son mock**: No hay backend real
   - **Solución futura**: APIs REST + Supabase

---

## 🎯 **PRÓXIMOS PASOS**

### **FASE 1: Actualizar Componentes Existentes** (1-2 días)
```bash
1. Actualizar StockProveedoresCafe.tsx para usar useStock()
2. Actualizar MaterialTrabajador.tsx para usar useStock()
3. Actualizar RecepcionMaterialModal.tsx para usar registrarRecepcion()
4. Probar sincronización gerente-trabajador
```

### **FASE 2: Agregar LocalStorage** (Opcional)
```bash
1. Persistir estado en localStorage
2. Restaurar al recargar página
3. Sincronizar entre pestañas
```

### **FASE 3: Migrar a Supabase** (Cuando estés listo)
```bash
1. Crear tablas en Supabase
2. Implementar APIs
3. Conectar StockContext con Supabase
4. Implementar Realtime Subscriptions
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

- [x] ✅ Crear StockContext.tsx
- [x] ✅ Envolver App con StockProvider
- [x] ✅ Separar stock por empresa y punto de venta
- [x] ✅ Integrar con ConfiguracionEmpresas
- [ ] ⏳ Actualizar StockProveedoresCafe.tsx
- [ ] ⏳ Actualizar MaterialTrabajador.tsx
- [ ] ⏳ Actualizar RecepcionMaterialModal.tsx
- [ ] ⏳ Probar sincronización en tiempo real
- [ ] ⏳ Agregar filtros por empresa/PDV en UI
- [ ] ⏳ Documentar casos de uso adicionales

---

## 📞 **¿NECESITAS AYUDA?**

Si tienes dudas sobre cómo usar el StockContext en algún componente específico, pregúntame y te ayudo a implementarlo paso a paso.

**¿Quieres que actualice ahora alguno de los componentes principales para que use el StockContext?** 🚀
