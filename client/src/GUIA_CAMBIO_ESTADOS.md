# 🔄 GUÍA: CAMBIO DE ESTADOS DE PEDIDOS

**Proyecto:** Udar Edge  
**Fecha:** 1 Diciembre 2025

---

## 📊 DIAGRAMA DE ESTADOS

```
┌─────────────┐
│  PENDIENTE  │ (Efectivo no cobrado aún)
└──────┬──────┘
       │ confirmarPago()
       ↓
┌─────────────┐
│   PAGADO    │ (Pedido confirmado)
└──────┬──────┘
       │ marcarEnPreparacion()
       ↓
┌─────────────┐
│EN PREPARACIÓN│ (Cocina trabajando)
└──────┬──────┘
       │ marcarComoListo()
       ↓
┌─────────────┐
│    LISTO    │ (Esperando entrega)
└──────┬──────┘
       │ marcarEnReparto() / marcarEntregado()
       ↓
┌─────────────┐
│  ENTREGADO  │ (Completado)
└─────────────┘

     ❌ cancelarPedido() → CANCELADO (desde cualquier estado excepto ENTREGADO)
```

---

## 🎯 FUNCIONES DISPONIBLES

### ✅ **1. marcarEnPreparacion**
**Cuándo:** Cocina empieza a preparar el pedido  
**Quién:** Trabajador de cocina  
**De:** `pendiente` o `pagado`  
**A:** `en_preparacion`

```typescript
import { marcarEnPreparacion } from '../services/pedidos.service';

const handleIniciarPreparacion = (pedidoId: string) => {
  const resultado = marcarEnPreparacion(pedidoId, 'TRABAJADOR-001');
  
  if (resultado) {
    toast.success('Pedido en preparación');
    cargarPedidos(); // Refrescar lista
  } else {
    toast.error('No se pudo cambiar el estado');
  }
};
```

**Botón en UI:**
```tsx
{pedido.estado === 'pagado' && (
  <Button
    onClick={() => handleIniciarPreparacion(pedido.id)}
    className="bg-blue-600 hover:bg-blue-700"
    size="sm"
  >
    <ChefHat className="w-4 h-4 mr-2" />
    Iniciar Preparación
  </Button>
)}
```

---

### ✅ **2. marcarComoListo**
**Cuándo:** Pedido está terminado, listo para entregar  
**Quién:** Trabajador de cocina  
**De:** `en_preparacion`  
**A:** `listo`

```typescript
import { marcarComoListo } from '../services/pedidos.service';

const handleMarcarListo = (pedidoId: string) => {
  const resultado = marcarComoListo(pedidoId, 'TRABAJADOR-001');
  
  if (resultado) {
    toast.success('¡Pedido listo!', {
      description: 'El cliente será notificado',
    });
    
    // Opcional: Notificar al cliente
    notificarClientePedidoListo(pedidoId);
    
    cargarPedidos();
  } else {
    toast.error('El pedido debe estar en preparación primero');
  }
};
```

**Botón en UI:**
```tsx
{pedido.estado === 'en_preparacion' && (
  <Button
    onClick={() => handleMarcarListo(pedido.id)}
    className="bg-green-600 hover:bg-green-700"
    size="sm"
  >
    <CheckCircle2 className="w-4 h-4 mr-2" />
    Marcar Listo
  </Button>
)}
```

---

### ✅ **3. marcarEnReparto**
**Cuándo:** Repartidor escanea QR y toma el pedido  
**Quién:** Repartidor  
**De:** `listo`  
**A:** `en_camino` (estadoEntrega)

```typescript
import { marcarEnReparto } from '../services/pedidos.service';

const handleTomarPedido = (pedidoId: string) => {
  const repartidorId = 'REPARTIDOR-001';
  const repartidorNombre = 'Juan Pérez';
  
  const resultado = marcarEnReparto(pedidoId, repartidorId, repartidorNombre);
  
  if (resultado) {
    toast.success('Pedido asignado', {
      description: `Asignado a ${repartidorNombre}`,
    });
    cargarPedidos();
  }
};
```

**Ya implementado en:** `RepartidorDashboard.tsx`

---

### ✅ **4. marcarEntregado**
**Cuándo:** Pedido entregado al cliente  
**Quién:** Repartidor o cajero  
**De:** Cualquier estado  
**A:** `entregado`

```typescript
import { marcarEntregado } from '../services/pedidos.service';

const handleMarcarEntregado = (pedido: Pedido) => {
  // Si es efectivo, confirmar cobro
  if (pedido.pagoEnEfectivo) {
    const confirmar = window.confirm(
      `¿Confirmas que has cobrado ${pedido.total.toFixed(2)}€ en efectivo?`
    );
    if (!confirmar) return;
  }
  
  const resultado = marcarEntregado(pedido.id, 'REPARTIDOR-001');
  
  if (resultado) {
    toast.success('Pedido entregado correctamente');
    cargarPedidos();
  }
};
```

**Ya implementado en:** `RepartidorDashboard.tsx` y `ModalEntregarPedido.tsx`

---

### ✅ **5. cancelarPedido**
**Cuándo:** Cliente cancela o hay un problema  
**Quién:** Trabajador, gerente o cliente  
**De:** Cualquier estado excepto `entregado`  
**A:** `cancelado`

```typescript
import { cancelarPedido } from '../services/pedidos.service';

const [modalCancelar, setModalCancelar] = useState(false);
const [motivoCancelacion, setMotivoCancelacion] = useState('');

const handleCancelar = (pedido: Pedido) => {
  if (!motivoCancelacion.trim()) {
    toast.error('Debes indicar el motivo de cancelación');
    return;
  }
  
  const resultado = cancelarPedido(
    pedido.id,
    motivoCancelacion,
    'TRABAJADOR-001' // ID de quien cancela
  );
  
  if (resultado) {
    toast.success('Pedido cancelado');
    setModalCancelar(false);
    setMotivoCancelacion('');
    cargarPedidos();
    
    // Opcional: Notificar al cliente
    notificarClientePedidoCancelado(pedido.id, motivoCancelacion);
  } else {
    toast.error('No se pudo cancelar el pedido');
  }
};
```

**Botón en UI:**
```tsx
<Button
  onClick={() => setModalCancelar(true)}
  variant="destructive"
  size="sm"
>
  <X className="w-4 h-4 mr-2" />
  Cancelar Pedido
</Button>

{/* Modal de cancelación */}
<Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>¿Cancelar Pedido #{pedido.numero}?</DialogTitle>
      <DialogDescription>
        Esta acción notificará al cliente. El pedido no se podrá recuperar.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-3">
      <label className="text-sm font-medium">Motivo de cancelación:</label>
      <textarea
        value={motivoCancelacion}
        onChange={(e) => setMotivoCancelacion(e.target.value)}
        className="w-full p-3 border rounded-lg"
        rows={4}
        placeholder="Ej: Producto agotado, cliente solicitó cancelación, etc."
      />
    </div>
    
    <DialogFooter>
      <Button onClick={() => setModalCancelar(false)} variant="outline">
        Volver
      </Button>
      <Button onClick={() => handleCancelar(pedido)} variant="destructive">
        Confirmar Cancelación
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### ✅ **6. confirmarPago**
**Cuándo:** Cliente paga un pedido en efectivo pendiente  
**Quién:** Cajero  
**De:** `pendiente`  
**A:** `pagado`

```typescript
import { confirmarPago } from '../services/pedidos.service';

const handleConfirmarPago = (pedido: Pedido, metodoPago: string) => {
  const resultado = confirmarPago(pedido.id, metodoPago);
  
  if (resultado) {
    toast.success('Pago confirmado');
    cargarPedidos();
  }
};
```

**Botón en UI:**
```tsx
{pedido.estado === 'pendiente' && pedido.pagoEnEfectivo && (
  <Button
    onClick={() => handleConfirmarPago(pedido, 'efectivo')}
    className="bg-green-600 hover:bg-green-700"
    size="sm"
  >
    <DollarSign className="w-4 h-4 mr-2" />
    Confirmar Pago en Efectivo
  </Button>
)}
```

---

### ✅ **7. actualizarObservaciones**
**Cuándo:** Se necesitan notas adicionales  
**Quién:** Cualquier trabajador  
**De/A:** Mantiene el estado actual

```typescript
import { actualizarObservaciones } from '../services/pedidos.service';

const [observaciones, setObservaciones] = useState(pedido.observaciones || '');

const handleGuardarObservaciones = () => {
  const resultado = actualizarObservaciones(pedido.id, observaciones);
  
  if (resultado) {
    toast.success('Observaciones actualizadas');
  }
};
```

**UI:**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Observaciones:</label>
  <textarea
    value={observaciones}
    onChange={(e) => setObservaciones(e.target.value)}
    className="w-full p-2 border rounded-lg"
    rows={3}
  />
  <Button onClick={handleGuardarObservaciones} size="sm">
    Guardar Observaciones
  </Button>
</div>
```

---

## 🎨 COMPONENTES DE UI A CREAR

### **1. Botones de Acción en PedidosTrabajador**

Añadir al componente `/components/trabajador/PedidosTrabajador.tsx`:

```tsx
// En la función TarjetaPedido o tabla, añadir columna de acciones:

function AccionesPedido({ pedido, onActualizar }: { pedido: Pedido, onActualizar: () => void }) {
  const [modalCancelar, setModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  const handleIniciarPreparacion = () => {
    const resultado = marcarEnPreparacion(pedido.id);
    if (resultado) {
      toast.success('Pedido en preparación');
      onActualizar();
    }
  };

  const handleMarcarListo = () => {
    const resultado = marcarComoListo(pedido.id);
    if (resultado) {
      toast.success('¡Pedido listo!');
      onActualizar();
    }
  };

  const handleCancelar = () => {
    if (!motivoCancelacion.trim()) {
      toast.error('Indica el motivo');
      return;
    }
    const resultado = cancelarPedido(pedido.id, motivoCancelacion, 'TRABAJADOR-001');
    if (resultado) {
      toast.success('Pedido cancelado');
      setModalCancelar(false);
      onActualizar();
    }
  };

  return (
    <div className="flex gap-2">
      {/* Iniciar Preparación */}
      {pedido.estado === 'pagado' && (
        <Button
          onClick={handleIniciarPreparacion}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          Iniciar
        </Button>
      )}

      {/* Marcar Listo */}
      {pedido.estado === 'en_preparacion' && (
        <Button
          onClick={handleMarcarListo}
          className="bg-green-600 hover:bg-green-700"
          size="sm"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Marcar Listo
        </Button>
      )}

      {/* Cancelar */}
      {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
        <Button
          onClick={() => setModalCancelar(true)}
          variant="destructive"
          size="sm"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      )}

      {/* Modal Cancelar */}
      <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar Pedido?</DialogTitle>
          </DialogHeader>
          <textarea
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Motivo de cancelación..."
          />
          <DialogFooter>
            <Button onClick={() => setModalCancelar(false)} variant="outline">
              Volver
            </Button>
            <Button onClick={handleCancelar} variant="destructive">
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

### **2. Modal de Detalle Mejorado**

Crear `/components/pedidos/ModalDetallePedido.tsx`:

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  marcarEnPreparacion, 
  marcarComoListo, 
  cancelarPedido,
  actualizarObservaciones,
  type Pedido 
} from '../../services/pedidos.service';
import { GeneradorQR } from './GeneradorQR';
import { TicketPedido } from './TicketPedido';

interface ModalDetallePedidoProps {
  pedido: Pedido;
  open: boolean;
  onClose: () => void;
  onActualizar: () => void;
}

export function ModalDetallePedido({ 
  pedido, 
  open, 
  onClose, 
  onActualizar 
}: ModalDetallePedidoProps) {
  const [mostrarQR, setMostrarQR] = useState(false);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [observaciones, setObservaciones] = useState(pedido.observaciones || '');

  const handleCambiarEstado = (accion: 'preparacion' | 'listo' | 'cancelar') => {
    let resultado = null;
    
    switch (accion) {
      case 'preparacion':
        resultado = marcarEnPreparacion(pedido.id);
        break;
      case 'listo':
        resultado = marcarComoListo(pedido.id);
        break;
      case 'cancelar':
        const motivo = prompt('Motivo de cancelación:');
        if (motivo) {
          resultado = cancelarPedido(pedido.id, motivo, 'TRABAJADOR-001');
        }
        break;
    }
    
    if (resultado) {
      toast.success('Estado actualizado');
      onActualizar();
      onClose();
    }
  };

  const handleGuardarObservaciones = () => {
    const resultado = actualizarObservaciones(pedido.id, observaciones);
    if (resultado) {
      toast.success('Observaciones guardadas');
      onActualizar();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Pedido #{pedido.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda: Datos */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Cliente</h3>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <div><strong>Nombre:</strong> {pedido.cliente.nombre}</div>
                <div><strong>Teléfono:</strong> {pedido.cliente.telefono}</div>
                {pedido.direccionEntrega && (
                  <div><strong>Dirección:</strong> {pedido.direccionEntrega}</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Productos</h3>
              <div className="space-y-2">
                {pedido.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                    <span>{item.cantidad}x {item.nombre}</span>
                    <span className="font-medium">{item.subtotal.toFixed(2)}€</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-teal-600">{pedido.total.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Observaciones</h3>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full p-2 border rounded-lg"
                rows={3}
              />
              <Button 
                onClick={handleGuardarObservaciones} 
                size="sm"
                className="mt-2"
              >
                Guardar Observaciones
              </Button>
            </div>
          </div>

          {/* Columna derecha: Acciones */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Estado Actual</h3>
              <BadgeEstado estado={pedido.estado} />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold mb-2">Acciones</h3>
              
              {pedido.estado === 'pagado' && (
                <Button
                  onClick={() => handleCambiarEstado('preparacion')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Iniciar Preparación
                </Button>
              )}

              {pedido.estado === 'en_preparacion' && (
                <Button
                  onClick={() => handleCambiarEstado('listo')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Listo
                </Button>
              )}

              <Button
                onClick={() => setMostrarQR(!mostrarQR)}
                variant="outline"
                className="w-full"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {mostrarQR ? 'Ocultar' : 'Ver'} Código QR
              </Button>

              <Button
                onClick={() => setMostrarTicket(!mostrarTicket)}
                variant="outline"
                className="w-full"
              >
                <Printer className="w-4 h-4 mr-2" />
                {mostrarTicket ? 'Ocultar' : 'Imprimir'} Ticket
              </Button>

              {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                <Button
                  onClick={() => handleCambiarEstado('cancelar')}
                  variant="destructive"
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Pedido
                </Button>
              )}
            </div>

            {/* QR Code */}
            {mostrarQR && (
              <div className="border rounded-lg p-4">
                <GeneradorQR
                  pedidoId={pedido.id}
                  pedidoNumero={pedido.numero || pedido.id}
                  size={200}
                  showDownload={true}
                />
              </div>
            )}

            {/* Ticket */}
            {mostrarTicket && (
              <div className="border rounded-lg p-4">
                <TicketPedido pedido={pedido} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Backend (Servicio):
- [x] marcarEnPreparacion
- [x] marcarComoListo
- [x] marcarEnReparto
- [x] marcarEntregado
- [x] cancelarPedido
- [x] confirmarPago
- [x] actualizarObservaciones

### 🔲 Frontend (Botones):
- [ ] Botón "Iniciar Preparación" en PedidosTrabajador
- [ ] Botón "Marcar Listo" en PedidosTrabajador
- [ ] Botón "Cancelar" con modal en PedidosTrabajador
- [ ] Modal de detalle mejorado con todas las acciones
- [ ] Integración de TicketPedido en modales
- [ ] Integración de GeneradorQR en modales
- [ ] Confirmación de pago en efectivo en modal
- [ ] Actualizar observaciones en modal

### 🔲 Componentes a Crear:
- [ ] `/components/pedidos/ModalDetallePedido.tsx`
- [ ] `/components/pedidos/AccionesPedido.tsx` (botones reutilizables)
- [ ] `/components/pedidos/ModalCancelarPedido.tsx`

### 🔲 Integraciones:
- [ ] Actualizar `PedidosTrabajador.tsx` con botones de acción
- [ ] Añadir imports de funciones en componentes
- [ ] Toast notifications para feedback
- [ ] Auto-refresh después de cambios de estado

---

## 🎉 RESUMEN

**Tienes TODO listo en el servicio** para cambiar estados. Ahora solo necesitas:

1. **Añadir botones** en `PedidosTrabajador.tsx`
2. **Crear modal de detalle** mejorado
3. **Importar las funciones** que ya existen
4. **Toast notifications** para feedback

Las funciones ya validan que los cambios de estado sean correctos (ej: no puedes marcar listo si no está en preparación).

---

**¿Empezamos implementando los botones en PedidosTrabajador?** 🚀
