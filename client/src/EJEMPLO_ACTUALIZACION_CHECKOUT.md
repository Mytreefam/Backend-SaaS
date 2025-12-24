# 📝 EJEMPLO: ACTUALIZAR CHECKOUTMODAL.TSX

## 🎯 OBJETIVO

Actualizar el `CheckoutModal.tsx` para que incluya el contexto multiempresa al crear pedidos.

---

## 📋 PASOS

### **1. Importar helpers:**

```typescript
// Al inicio del archivo
import { obtenerContextoVenta } from '../../utils/contexto-venta.helper';
import { PUNTOS_VENTA, MARCAS } from '../../constants/empresaConfig';
```

---

### **2. Agregar estado para PDV y Marca:**

```typescript
export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  // ... estados existentes ...
  
  // ⭐ NUEVO: Estados para contexto multiempresa
  const [pdvSeleccionado, setPdvSeleccionado] = useState('PDV-TIANA'); // Valor por defecto
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('MRC-001'); // Valor por defecto
  
  // Obtener datos del PDV seleccionado
  const pdvActual = PUNTOS_VENTA[pdvSeleccionado];
  const marcasDisponibles = pdvActual 
    ? pdvActual.marcasDisponibles.map(id => MARCAS[id])
    : [];
  
  // ... resto del código ...
}
```

---

### **3. Agregar UI para seleccionar PDV y Marca:**

```tsx
{/* Después de los datos del cliente, antes del resumen */}

{/* Sección: Punto de Recogida */}
<div className="space-y-4">
  <h3 className="font-semibold">📍 Punto de Recogida</h3>
  
  {/* Selector de PDV */}
  <div>
    <label className="block text-sm font-medium mb-2">
      Selecciona tu punto de venta
    </label>
    <select
      value={pdvSeleccionado}
      onChange={(e) => {
        const nuevoPDV = e.target.value;
        setPdvSeleccionado(nuevoPDV);
        
        // Auto-seleccionar primera marca disponible del nuevo PDV
        const pdv = PUNTOS_VENTA[nuevoPDV];
        if (pdv) {
          setMarcaSeleccionada(pdv.marcasDisponibles[0]);
        }
      }}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
    >
      {Object.values(PUNTOS_VENTA).map((pdv) => (
        <option key={pdv.id} value={pdv.id}>
          📍 {pdv.nombre} - {pdv.direccion}
        </option>
      ))}
    </select>
    
    {/* Info del PDV seleccionado */}
    {pdvActual && (
      <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
        <p className="text-gray-600">
          📞 {pdvActual.telefono}
        </p>
        <p className="text-gray-600">
          ✉️ {pdvActual.email}
        </p>
      </div>
    )}
  </div>
  
  {/* Selector de Marca (solo si hay múltiples) */}
  {marcasDisponibles.length > 1 && (
    <div>
      <label className="block text-sm font-medium mb-2">
        Selecciona tu marca favorita
      </label>
      <div className="grid grid-cols-2 gap-3">
        {marcasDisponibles.map((marca) => (
          <button
            key={marca.id}
            type="button"
            onClick={() => setMarcaSeleccionada(marca.id)}
            className={`p-4 border-2 rounded-lg transition-all ${
              marcaSeleccionada === marca.id
                ? 'border-teal-600 bg-teal-50'
                : 'border-gray-200 hover:border-teal-300'
            }`}
          >
            <div className="text-2xl mb-1">{marca.icono}</div>
            <div className="font-semibold">{marca.nombre}</div>
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

---

### **4. Actualizar función de crear pedido:**

**ANTES:**

```typescript
const handleConfirmarPago = async () => {
  try {
    // Crear pedido
    const pedido = crearPedido({
      clienteId: userData?.id || 'invitado',
      clienteNombre: datosCliente.nombre,
      clienteEmail: datosCliente.email,
      clienteTelefono: datosCliente.telefono,
      clienteDireccion: datosCliente.direccion,
      items: items,
      subtotal: subtotal,
      descuento: descuento,
      iva: iva,
      total: total,
      metodoPago: metodoPago,
      tipoEntrega: tipoEntrega,
      observaciones: observaciones,
      puntoVentaId: 'PDV-TIANA', // ⚠️ Hardcoded
    });
    
    // ... resto del código
  } catch (error) {
    console.error(error);
  }
};
```

**DESPUÉS:**

```typescript
const handleConfirmarPago = async () => {
  try {
    // ⭐ NUEVO: Obtener contexto completo
    const contextoVenta = obtenerContextoVenta(pdvSeleccionado, marcaSeleccionada);
    
    // Validar contexto (opcional pero recomendado)
    try {
      validarContextoVenta(contextoVenta);
    } catch (validationError) {
      toast.error('Error en la configuración', {
        description: validationError.message,
      });
      return;
    }
    
    // Crear pedido con contexto completo
    const pedido = crearPedido({
      // ⭐ Contexto multiempresa
      ...contextoVenta,
      
      // Datos del cliente
      clienteId: userData?.id || 'invitado',
      clienteNombre: datosCliente.nombre,
      clienteEmail: datosCliente.email,
      clienteTelefono: datosCliente.telefono,
      clienteDireccion: datosCliente.direccion,
      
      // Items y totales
      items: items,
      subtotal: subtotal,
      descuento: descuento,
      iva: iva,
      total: total,
      
      // Pago y entrega
      metodoPago: metodoPago,
      tipoEntrega: tipoEntrega,
      observaciones: observaciones,
    });
    
    console.log('✅ Pedido creado:', pedido);
    console.log('📍 PDV:', contextoVenta.puntoVentaNombre);
    console.log('🏷️ Marca:', contextoVenta.marcaNombre);
    
    // Descontar stock (si aplica)
    await descontarStockPedido(pedido);
    
    // Generar factura
    const facturaId = generarFacturaAutomatica(pedido);
    
    // Notificar éxito
    toast.success('¡Pedido realizado con éxito!', {
      description: `Recoge tu pedido en ${contextoVenta.puntoVentaNombre}`,
    });
    
    // Limpiar carrito y cerrar
    clearCart();
    onClose();
    
    // Redirigir a confirmación
    router.push(`/cliente/pedidos/${pedido.id}`);
    
  } catch (error) {
    console.error('Error al crear pedido:', error);
    toast.error('Error al procesar el pedido', {
      description: error.message || 'Inténtalo de nuevo',
    });
  }
};
```

---

### **5. Actualizar el resumen del pedido:**

```tsx
{/* En la sección de resumen, mostrar PDV y marca */}

<div className="bg-gray-50 p-4 rounded-lg space-y-2">
  <h3 className="font-semibold mb-3">Resumen del Pedido</h3>
  
  {/* ⭐ NUEVO: Info de PDV y Marca */}
  <div className="flex justify-between text-sm pb-2 border-b">
    <span className="text-gray-600">Punto de Recogida:</span>
    <span className="font-semibold">
      {pdvActual?.nombre}
    </span>
  </div>
  
  {marcasDisponibles.length > 1 && (
    <div className="flex justify-between text-sm pb-2 border-b">
      <span className="text-gray-600">Marca:</span>
      <span className="font-semibold">
        {MARCAS[marcaSeleccionada]?.icono} {MARCAS[marcaSeleccionada]?.nombre}
      </span>
    </div>
  )}
  
  {/* Resumen de items */}
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Subtotal</span>
    <span>{formatEuro(subtotal)}</span>
  </div>
  
  {descuento > 0 && (
    <div className="flex justify-between text-sm text-orange-600">
      <span>Descuento</span>
      <span>-{formatEuro(descuento)}</span>
    </div>
  )}
  
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">IVA (10%)</span>
    <span>{formatEuro(iva)}</span>
  </div>
  
  <div className="flex justify-between text-lg font-bold pt-2 border-t">
    <span>TOTAL</span>
    <span className="text-teal-600">{formatEuro(total)}</span>
  </div>
</div>
```

---

## 📱 RESULTADO VISUAL

```
┌─────────────────────────────────────┐
│  Checkout                     [X]   │
├─────────────────────────────────────┤
│                                     │
│  👤 Datos del Cliente               │
│  [Nombre]                           │
│  [Email]                            │
│  [Teléfono]                         │
│                                     │
│  📍 Punto de Recogida        ⭐ NEW │
│  ┌─────────────────────────────┐   │
│  │ 📍 Tiana - Passeig de... ▼ │   │
│  └─────────────────────────────┘   │
│  📞 +34 933 456 789                 │
│  ✉️ tiana@hoypecamos.com           │
│                                     │
│  🏷️ Selecciona tu marca     ⭐ NEW │
│  ┌──────────┐  ┌──────────┐       │
│  │ 🍕       │  │ 🍔       │       │
│  │ Modomio  │  │Blackbur. │       │
│  └──────────┘  └──────────┘       │
│     ✓ Seleccionado                 │
│                                     │
│  💳 Método de Pago                  │
│  ( ) Tarjeta  ( ) Efectivo         │
│                                     │
│  📦 Resumen del Pedido              │
│  ┌─────────────────────────────┐   │
│  │ PDV: Tiana          ⭐ NEW  │   │
│  │ Marca: 🍕 Modomio   ⭐ NEW  │   │
│  ├─────────────────────────────┤   │
│  │ Subtotal       100.00€      │   │
│  │ IVA (10%)       10.00€      │   │
│  │ TOTAL          110.00€      │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Confirmar Pedido]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE ACTUALIZACIÓN

- [ ] Importar `obtenerContextoVenta` y constantes
- [ ] Agregar estados `pdvSeleccionado` y `marcaSeleccionada`
- [ ] Agregar UI de selección de PDV
- [ ] Agregar UI de selección de Marca (si múltiples)
- [ ] Actualizar función `handleConfirmarPago`
- [ ] Actualizar resumen del pedido
- [ ] Probar flujo completo
- [ ] Verificar que se guarda correctamente

---

## 🧪 TESTING

### **1. Probar creación de pedido:**

```typescript
// En la consola del navegador:

// Ver último pedido creado
const pedidos = JSON.parse(localStorage.getItem('udar-pedidos'));
const ultimoPedido = pedidos[0];

console.log('Empresa:', ultimoPedido.empresaNombre);
console.log('Marca:', ultimoPedido.marcaNombre);
console.log('PDV:', ultimoPedido.puntoVentaNombre);

// Debe mostrar:
// Empresa: Disarmink S.L.
// Marca: Modomio
// PDV: Tiana
```

### **2. Probar consultas:**

```typescript
import { obtenerPedidosPorPDV } from './services/pedidos.service';

const pedidosTiana = obtenerPedidosPorPDV('PDV-TIANA');
console.log(`${pedidosTiana.length} pedidos en Tiana`);

// Verificar que todos tienen contexto
pedidosTiana.forEach(p => {
  console.assert(p.empresaId, 'Falta empresaId');
  console.assert(p.marcaId, 'Falta marcaId');
  console.assert(p.puntoVentaId, 'Falta puntoVentaId');
});
```

---

## 🚨 ERRORES COMUNES

### **Error 1: "Cannot read property 'empresaId' of undefined"**

**Causa:** No se está pasando el contexto al crear pedido.

**Solución:**
```typescript
const contexto = obtenerContextoVenta(pdvSeleccionado, marcaSeleccionada);

crearPedido({
  ...contexto, // ✅ No olvidar esto
  // ... resto
});
```

---

### **Error 2: "La marca no está disponible en el PDV"**

**Causa:** Se seleccionó una marca que no está en `pdv.marcasDisponibles`.

**Solución:**
```typescript
// Al cambiar PDV, actualizar marca automáticamente
const handleCambioPDV = (nuevoPDVId: string) => {
  setPdvSeleccionado(nuevoPDVId);
  
  const pdv = PUNTOS_VENTA[nuevoPDVId];
  setMarcaSeleccionada(pdv.marcasDisponibles[0]); // ✅ Primera marca disponible
};
```

---

### **Error 3: Pedidos antiguos sin contexto**

**Causa:** Hay pedidos creados antes de la actualización.

**Solución:**
```typescript
// Ejecutar migración UNA vez
import { migrarTodosPedidosEnLocalStorage } from './utils/contexto-venta.helper';

migrarTodosPedidosEnLocalStorage();
```

---

## 💡 MEJORAS OPCIONALES

### **1. Guardar PDV preferido del usuario:**

```typescript
// Guardar preferencia
const guardarPDVPreferido = (pdvId: string) => {
  localStorage.setItem('pdv-preferido', pdvId);
};

// Cargar al montar
useEffect(() => {
  const preferido = localStorage.getItem('pdv-preferido');
  if (preferido && PUNTOS_VENTA[preferido]) {
    setPdvSeleccionado(preferido);
  }
}, []);
```

---

### **2. Mostrar distancia al PDV:**

```typescript
// Si tienes geolocalización del usuario
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  // Fórmula de Haversine
  // ... implementación
};

const distancia = calcularDistancia(
  userLat,
  userLon,
  pdvActual.coordenadas.latitud,
  pdvActual.coordenadas.longitud
);

// Mostrar en UI
<p>📍 A {distancia.toFixed(1)} km de tu ubicación</p>
```

---

### **3. Filtrar PDVs por marca:**

```typescript
// Si el usuario ya eligió marca, mostrar solo PDVs que la tienen

const [marcaPreferida, setMarcaPreferida] = useState(null);

const pdvsFiltrados = marcaPreferida
  ? Object.values(PUNTOS_VENTA).filter(pdv => 
      pdv.marcasDisponibles.includes(marcaPreferida)
    )
  : Object.values(PUNTOS_VENTA);
```

---

## ✅ RESULTADO FINAL

✅ Usuario selecciona PDV y Marca  
✅ Contexto completo se guarda en pedido  
✅ Reportes funcionan correctamente  
✅ Consultas por empresa/marca/PDV operativas  
✅ Exportación CSV incluye jerarquía  

---

**¿Listo para actualizar?** Sigue este documento paso a paso. 🚀
