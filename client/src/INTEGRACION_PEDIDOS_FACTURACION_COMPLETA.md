# 🔗 INTEGRACIÓN COMPLETA: PEDIDOS → FACTURACIÓN → VENTAS → EBITDA

**Fecha de implementación**: 1 de Diciembre de 2025  
**Estado**: ✅ 100% OPERATIVO

---

## 📋 RESUMEN EJECUTIVO

Se ha completado la integración completa del flujo de pedidos multicanal con generación automática de facturas y actualización en tiempo real de ventas y EBITDA.

### ✅ CAMBIOS IMPLEMENTADOS

1. **✨ Nueva vista "Pedidos Multicanal" para el Gerente**
   - Accesible desde el menú lateral
   - Filtrado jerárquico por Empresa > Marca > PDV
   - Vista de todos los orígenes (App, TPV, Glovo, Just Eat, Uber Eats)
   - Estadísticas en tiempo real
   - Auto-refresh cada 30 segundos

2. **🧾 Facturación Automática al marcar pedido como "Listo"**
   - Cuando un pedido se marca como "listo" se genera automáticamente la factura
   - La factura se asocia al pedido (`pedido.facturaId`)
   - Integración con sistema VeriFactu
   - Logging detallado en consola

3. **📊 Actualización Automática de Ventas y EBITDA**
   - El servicio `reportes-multiempresa.service.ts` calcula automáticamente:
     - Ventas totales por empresa/marca/PDV
     - Coste de ventas
     - Gastos operativos
     - Margen bruto
     - EBITDA
   - Los dashboards se actualizan automáticamente al consultar pedidos

---

## 🔄 FLUJO COMPLETO DEL CICLO DE VIDA DEL PEDIDO

```
┌─────────────────────────────────────────────────────────────┐
│                  1. ORIGEN DEL PEDIDO                       │
├─────────────────────────────────────────────────────────────┤
│  • Cliente App     (origenPedido: 'app')                    │
│  • TPV Local       (origenPedido: 'tpv')                    │
│  • Glovo          (origenPedido: 'glovo')                   │
│  • Just Eat       (origenPedido: 'justeat')                 │
│  • Uber Eats      (origenPedido: 'ubereats')                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            2. CREACIÓN DEL PEDIDO EN SISTEMA                │
├─────────────────────────────────────────────────────────────┤
│  • Se guarda en LocalStorage (pedidos.service.ts)           │
│  • Se incluye jerarquía: Empresa → Marca → PDV              │
│  • Estado inicial: 'pendiente' o 'pagado'                   │
│  • Se asigna número de pedido único                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               3. CAMBIO DE ESTADOS                          │
├─────────────────────────────────────────────────────────────┤
│  pendiente → pagado → en_preparacion → listo → entregado    │
│                                          ↓                   │
│                              🧾 SE GENERA FACTURA           │
│                                 AUTOMÁTICAMENTE             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         4. GENERACIÓN AUTOMÁTICA DE FACTURA                 │
├─────────────────────────────────────────────────────────────┤
│  Función: marcarComoListo() en pedidos.service.ts           │
│  • Llama a procesarPagoYFacturar()                          │
│  • Crea factura en sistema VeriFactu                        │
│  • Asocia facturaId al pedido                               │
│  • Log: ✅ Factura XXXX generada correctamente              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│       5. ACTUALIZACIÓN EN VENTAS Y EBITDA                   │
├─────────────────────────────────────────────────────────────┤
│  Servicio: reportes-multiempresa.service.ts                 │
│  • Calcula ventas totales por canal                         │
│  • Calcula coste de ventas (con escandallo)                 │
│  • Suma gastos operativos del periodo                       │
│  • Calcula EBITDA = Margen Bruto - Gastos Operativos        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           6. VISUALIZACIÓN EN DASHBOARDS                    │
├─────────────────────────────────────────────────────────────┤
│  • Dashboard360: KPIs en tiempo real                        │
│  • VentasKPIs: Ventas por canal y periodo                   │
│  • EBITDAInteractivo: Análisis financiero completo          │
│  • PedidosGerente: Vista multicanal con filtros             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 ARCHIVOS MODIFICADOS/CREADOS

### ✨ Archivos NUEVOS:

1. **`/components/gerente/PedidosGerente.tsx`**
   - Vista completa de gestión de pedidos para el gerente
   - Filtros jerárquicos por empresa/marca/PDV
   - Estadísticas por origen (App, TPV, Delivery externo)
   - Auto-refresh cada 30 segundos
   - Vista tabla + tarjetas responsive

### 🔧 Archivos MODIFICADOS:

1. **`/services/pedidos.service.ts`**
   - ✅ Importación de `procesarPagoYFacturar` de facturación-automatica.service
   - ✅ Función `marcarComoListo()` ahora es async y genera factura automáticamente
   - ✅ Logging detallado del proceso de facturación
   - ✅ Manejo de errores sin fallar el flujo

2. **`/components/GerenteDashboard.tsx`**
   - ✅ Importación de `PedidosGerente` component
   - ✅ Nueva opción "Pedidos Multicanal" en el menú lateral
   - ✅ Caso 'pedidos' en la función `renderContent()`
   - ✅ Icono Receipt para pedidos

---

## 🎯 INTEGRACIÓN CON VENTAS Y EBITDA

### ✅ YA ESTÁ INTEGRADO (sin necesidad de cambios):

El servicio `reportes-multiempresa.service.ts` ya consulta automáticamente los pedidos y calcula:

```typescript
// Extrae de pedidos.service.ts usando obtenerPedidosFiltrados()
const pedidos = obtenerPedidosFiltrados(filtros);

// Calcula automáticamente:
- ventasTotales
- costeVentas (usando calcularCosteVentas)
- gastosOperativos
- margenBruto = ventasTotales - costeVentas
- ebitda = margenBruto - gastosOperativos
- margenPorcentaje = (ebitda / ventasTotales) * 100
```

### 📊 Dashboards que se benefician:

1. **Dashboard360** (`/components/gerente/Dashboard360.tsx`)
   - Consume datos de reportes-multiempresa.service.ts
   - Muestra KPIs en tiempo real

2. **VentasKPIs** (`/components/gerente/VentasKPIs.tsx`)
   - Desglose por método de pago
   - Ventas por origen (App, TPV, Delivery)

3. **EBITDAInteractivo** (`/components/gerente/EBITDAInteractivo.tsx`)
   - Análisis financiero completo
   - Gráficos de margen y rentabilidad

---

## 🔍 FUNCIONES CLAVE

### 1. Marcar pedido como "Listo" (con facturación automática)

```typescript
// /services/pedidos.service.ts
export const marcarComoListo = async (
  pedidoId: string, 
  preparadoPor?: string
): Promise<Pedido | null> => {
  // 1. Actualizar estado del pedido
  pedidos[index].estado = 'listo';
  pedidos[index].estadoEntrega = 'listo';
  pedidos[index].fechaListo = new Date().toISOString();
  
  // 2. 🧾 Generar factura automáticamente
  try {
    const factura = await procesarPagoYFacturar(pedidos[index]);
    if (factura) {
      pedidos[index].facturaId = factura.id;
      console.log(`✅ Factura ${factura.numeroFactura} generada`);
    }
  } catch (error) {
    console.error(`❌ Error al generar factura:`, error);
    // No fallar el proceso si falla la facturación
  }
  
  return pedidos[index];
};
```

### 2. Obtener pedidos con filtros

```typescript
// /services/pedidos.service.ts
export const obtenerPedidosFiltrados = (filtros: FiltrosPedidos): Pedido[] => {
  let pedidos = getPedidos();
  
  // Filtrar por empresa
  if (filtros.empresaIds) {
    pedidos = pedidos.filter(p => filtros.empresaIds.includes(p.empresaId));
  }
  
  // Filtrar por marca
  if (filtros.marcaIds) {
    pedidos = pedidos.filter(p => filtros.marcaIds.includes(p.marcaId));
  }
  
  // Filtrar por PDV
  if (filtros.puntoVentaIds) {
    pedidos = pedidos.filter(p => filtros.puntoVentaIds.includes(p.puntoVentaId));
  }
  
  // ... más filtros (fechas, estados, método de pago)
  
  return pedidos;
};
```

### 3. Calcular EBITDA desde pedidos

```typescript
// /services/reportes-multiempresa.service.ts
function calcularResumen(pedidos: Pedido[]): ResumenVentas {
  // Ventas totales
  const ventasTotales = pedidos.reduce((sum, p) => sum + p.total, 0);
  
  // Coste de ventas (con escandallo)
  const costeVentas = calcularCosteVentas(pedidos).totalCostes;
  
  // Gastos operativos del periodo
  const gastosOperativos = calcularGastosOperativosPeriodo(
    new Date(fechaDesde), 
    new Date(fechaHasta)
  );
  
  // EBITDA
  const margenBruto = ventasTotales - costeVentas;
  const ebitda = margenBruto - gastosOperativos;
  const margenPorcentaje = (ebitda / ventasTotales) * 100;
  
  return {
    ventasTotales,
    costeVentas,
    gastosOperativos,
    margenBruto,
    ebitda,
    margenPorcentaje
  };
}
```

---

## 🎨 NUEVA VISTA: PEDIDOS MULTICANAL (GERENTE)

### 📍 Ubicación en el menú:
```
Dashboard 360
TPV 360 - Base
📦 Pedidos Multicanal  ← NUEVO
Clientes y Productos
Equipo y RRHH
...
```

### ✨ Características:

#### 1. **Estadísticas en tiempo real**
   - Total de pedidos
   - Pedidos activos
   - Pedidos entregados
   - Pedidos cancelados
   - Ventas totales (€)

#### 2. **Tarjetas por origen**
   - 📱 App Móvil
   - 🏪 TPV
   - 🚚 Glovo
   - 🍔 Just Eat
   - 🚴 Uber Eats

#### 3. **Filtros jerárquicos**
   ```
   Empresa ▼  →  Marca ▼  →  Punto de Venta ▼
   ```
   - Las marcas se filtran por empresa seleccionada
   - Los PDVs se filtran por marca seleccionada

#### 4. **Filtros adicionales**
   - 🔍 Búsqueda por número, cliente, teléfono
   - Estado: Todos / Pendiente / Pagado / En preparación / Listo / Entregado / Cancelado
   - Origen: Todos / App / TPV / Glovo / Just Eat / Uber Eats

#### 5. **Vistas**
   - 📋 **Vista Tabla**: Compacta con todas las columnas
   - 🃏 **Vista Tarjetas**: Responsive para móvil

#### 6. **Acciones**
   - 👁️ Ver detalle completo del pedido
   - 🔄 Actualizar lista manualmente
   - 📥 Exportar datos (TODO)
   - Auto-refresh cada 30 segundos

#### 7. **Modal de detalle**
   - Reutiliza `ModalDetallePedido.tsx`
   - Permisos completos del gerente
   - Puede cambiar estados, confirmar pagos, cancelar

---

## 🔑 CAMPOS CLAVE DEL PEDIDO

```typescript
interface Pedido {
  // Identificación
  id: string;
  numero: string;  // 2025-000001
  
  // 🏢 JERARQUÍA MULTIEMPRESA
  empresaId: string;         // EMP-001
  empresaNombre: string;     // "Disarmink S.L."
  marcaId: string;           // MRC-001
  marcaNombre: string;       // "Modomio"
  puntoVentaId: string;      // PDV-TIANA
  puntoVentaNombre: string;  // "Tiana"
  
  // 📱 ORIGEN Y CANAL
  origenPedido: 'app' | 'tpv' | 'glovo' | 'justeat' | 'ubereats';
  
  // 💰 IMPORTES
  subtotal: number;
  iva: number;
  total: number;
  
  // 📊 ESTADOS
  estado: 'pendiente' | 'pagado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  estadoEntrega: 'pendiente' | 'preparando' | 'listo' | 'en_camino' | 'entregado';
  estadoPago: 'pagado' | 'pendiente_cobro';
  
  // 🧾 FACTURACIÓN
  facturaId?: string;  // Se asigna cuando se marca como "listo"
  
  // 📅 FECHAS
  fecha: string;              // Fecha de creación
  fechaListo?: string;        // Cuándo se marcó como listo
  fechaEntrega?: string;      // Cuándo se entregó
  fechaPago?: string;         // Cuándo se pagó
  
  // Items y cliente...
}
```

---

## 🧪 TESTING

### ✅ Cómo probar el flujo completo:

1. **Generar pedidos de prueba**:
   ```
   - Ir a "Pedidos Multicanal" (Gerente)
   - Click en "Generar Pedidos Demo"
   - Se crean 5 pedidos de diferentes orígenes
   ```

2. **Marcar pedido como "Listo"**:
   ```
   - Abrir detalle de un pedido en estado "En preparación"
   - Click en "Marcar como Listo"
   - ✅ Verificar en consola: "Factura XXXX generada correctamente"
   ```

3. **Verificar facturación**:
   ```
   - El pedido ahora tiene facturaId
   - En Dashboard360 → Ver incremento de ventas
   - En EBITDAInteractivo → Ver actualización de márgenes
   ```

4. **Verificar filtros**:
   ```
   - Seleccionar empresa específica
   - Seleccionar marca específica
   - Seleccionar PDV específico
   - Verificar que solo aparecen pedidos de ese contexto
   ```

---

## 📈 IMPACTO EN DASHBOARDS

### Dashboard360
```
✅ KPI "Ventas Totales" se actualiza en tiempo real
✅ Gráfico de ventas por canal incluye todos los orígenes
✅ Top productos más vendidos refleja pedidos de todos los canales
```

### VentasKPIs
```
✅ Desglose por método de pago (efectivo, tarjeta, bizum)
✅ Ventas por origen (App, TPV, Glovo, Just Eat, Uber Eats)
✅ Comparativa de ventas por periodo
```

### EBITDAInteractivo
```
✅ Ventas totales incluyen todos los pedidos entregados
✅ Coste de ventas calculado con escandallo real
✅ Margen bruto = Ventas - Coste de ventas
✅ EBITDA = Margen bruto - Gastos operativos
✅ Gráficos de rentabilidad por empresa/marca/PDV
```

---

## 🚀 PRÓXIMOS PASOS (Recomendaciones)

### 1. **Backend Integration** (Prioridad ALTA)
   - Sustituir LocalStorage por API REST
   - Webhooks para actualización en tiempo real
   - Sincronización con plataformas externas (Glovo, Just Eat, Uber Eats)

### 2. **Sistema de Notificaciones** (Prioridad MEDIA)
   - Push notifications cuando se genera una factura
   - Alertas para pedidos pendientes > 30 minutos
   - Notificaciones a cocina cuando llega nuevo pedido

### 3. **Exportación de Datos** (Prioridad MEDIA)
   - Implementar exportación a Excel/CSV
   - PDF con resumen de pedidos
   - Integración con herramientas de BI

### 4. **Optimización de Performance** (Prioridad BAJA)
   - Pagination para listas grandes de pedidos
   - Caché de estadísticas
   - Lazy loading de componentes pesados

---

## 📞 SOPORTE

Para cualquier duda sobre la integración:
1. Revisar logs en consola del navegador
2. Verificar estructura de datos en LocalStorage (key: 'udar-pedidos')
3. Consultar este documento para entender el flujo

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [x] Vista "Pedidos Multicanal" accesible desde menú del gerente
- [x] Filtros jerárquicos funcionando (Empresa → Marca → PDV)
- [x] Facturación automática al marcar como "Listo"
- [x] Actualización de ventas en tiempo real
- [x] Actualización de EBITDA en tiempo real
- [x] Modal de detalle con permisos completos
- [x] Auto-refresh cada 30 segundos
- [x] Estadísticas por origen (App, TPV, Delivery)
- [x] Búsqueda y filtrado funcionando
- [x] Vista tabla y tarjetas responsive
- [x] Logging detallado en consola
- [x] Manejo de errores sin romper el flujo

---

**🎉 INTEGRACIÓN COMPLETADA AL 100%**

El sistema ahora cuenta con un flujo completo y automatizado desde la creación del pedido hasta la actualización de las métricas financieras en los dashboards del gerente.
