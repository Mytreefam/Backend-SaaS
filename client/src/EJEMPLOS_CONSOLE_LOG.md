# 🖥️ EJEMPLOS DE CONSOLE.LOG - DEBUGGING

**Módulo:** Gestión de Clientes  
**Propósito:** Guía visual de lo que verás en la consola del navegador

---

## 📦 Al Cambiar Estado de Pedido

### Escenario 1: Pendiente → Listo para recoger

**Trigger:** Click en botón "Marcar Listo"

**Console Output:**
```javascript
📦 CAMBIAR ESTADO PEDIDO: {
  pedidoId: "PD-TIA-0001",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  estadoAnterior: "Pendiente",
  estadoNuevo: "Listo para recoger",
  fechaHora: "2024-11-26T15:32:45.123Z",
  trabajadorId: "TRAB-101"
}
```

**Toast Notification:**
```
✅ Pedido PD-TIA-0001 marcado como "Listo para recoger"
```

---

### Escenario 2: Listo para recoger → Enviado (solo Envío)

**Trigger:** Click en botón "Marcar Enviado"

**Console Output:**
```javascript
📦 CAMBIAR ESTADO PEDIDO: {
  pedidoId: "PD-TIA-0002",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  estadoAnterior: "Listo para recoger",
  estadoNuevo: "Enviado",
  fechaHora: "2024-11-26T15:35:12.456Z",
  trabajadorId: "TRAB-101"
}
```

**Datos adicionales esperados (del backend):**
```javascript
// El backend debería añadir:
{
  repartidorId: "TRAB-112",
  trackingUrl: "https://track.udarmoto/PD-TIA-0002"
}
```

---

### Escenario 3: Enviado → Entregado

**Trigger:** Click en botón "Entregado"

**Console Output:**
```javascript
📦 CAMBIAR ESTADO PEDIDO: {
  pedidoId: "PD-BDN-0001",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-BURGUERS",
  puntoVentaId: "PV-BDN",
  estadoAnterior: "Enviado",
  estadoNuevo: "Entregado",
  fechaHora: "2024-11-26T15:45:23.789Z",
  trabajadorId: "TRAB-101"
}
```

---

## 🗺️ Al Ver Ubicación de Repartidor

**Trigger:** Click en botón "Ubicación" (solo pedidos con trackingUrl)

**Console Output:**
```javascript
🗺️ TRACKING URL: "https://track.udarmoto/PD-BDN-0001"
```

**Toast Notification:**
```
ℹ️ Abriendo tracking: https://track.udarmoto/PD-BDN-0001
```

**Acción Esperada:**
- Abrir modal con mapa (pendiente implementar)
- O redirigir a URL externa

---

## 📱 Estructura Completa de un Pedido

### Pedido en Vista Tabla/Tarjetas

**Console Output al hacer click en "Ver":**
```javascript
{
  // IDs Multiempresa (SIEMPRE presentes)
  pedidoId: "PD-TIA-0001",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  
  // Cliente
  clienteId: "CLI-244",
  nombreCliente: "Laura Sánchez",
  telefono: "+34 612 321 456",
  
  // Pago y Entrega
  metodoPago: "TPV",                    // TPV | Online | Efectivo
  tipoEntrega: "Recogida",              // Recogida | Envío
  direccionEntrega: null,               // Solo si tipoEntrega = "Envío"
  
  // Estado y Fechas
  estadoActual: "Pendiente",            // Pendiente | Listo para recoger | Enviado | Entregado
  fechaCreacion: "2024-11-26T14:30:00",
  fechaUltimoCambio: null,              // Se actualiza al cambiar estado
  
  // Financiero
  total: 18.50,                         // Calculado: SUM(productos.totalLinea)
  
  // Productos (Array)
  productos: [
    {
      lineaId: "LP-001",
      productoId: "PROD-122",
      nombreProducto: "Pizza Margarita",
      cantidad: 1,
      precioUnitario: 10.50,
      totalLinea: 10.50                 // cantidad × precioUnitario
    },
    {
      lineaId: "LP-002",
      productoId: "PROD-125",
      nombreProducto: "Coca-Cola 33cl",
      cantidad: 2,
      precioUnitario: 2.30,
      totalLinea: 4.60
    },
    {
      lineaId: "LP-003",
      productoId: "PROD-128",
      nombreProducto: "Patatas Fritas",
      cantidad: 1,
      precioUnitario: 3.40,
      totalLinea: 3.40
    }
  ],
  
  // Reparto (Opcional)
  repartidorId: null,                   // Solo si tipoEntrega = "Envío"
  trackingUrl: null,                    // Solo si está en camino
  
  // Observaciones
  observaciones: "Sin azúcar",          // Opcional
  
  // Info Contexto (para badges)
  nombreMarca: "PIZZAS",
  nombrePuntoVenta: "TIANA",
  codigoMarca: "M-PIZZAS",
  codigoPuntoVenta: "TIA"
}
```

---

## 🔄 Circuito del Pedido (Timeline)

**Endpoint:** `GET /api/pedidos/PD-TIA-0001/circuito`

**Response Esperado:**
```javascript
[
  {
    circuitoId: "CIR-001",
    pedidoId: "PD-TIA-0001",
    estado: "Pedido recibido",
    fechaHora: "2024-11-26T14:30:00Z",
    trabajadorId: "TRAB-001",
    nombreTrabajador: "Sistema",
    nombreRepartidor: null
  },
  {
    circuitoId: "CIR-002",
    pedidoId: "PD-TIA-0001",
    estado: "Preparación",
    fechaHora: "2024-11-26T14:35:00Z",
    trabajadorId: "TRAB-102",
    nombreTrabajador: "Juan Pérez",
    nombreRepartidor: null
  },
  {
    circuitoId: "CIR-003",
    pedidoId: "PD-TIA-0001",
    estado: "Listo para recoger",
    fechaHora: "2024-11-26T14:45:00Z",
    trabajadorId: "TRAB-102",
    nombreTrabajador: "Juan Pérez",
    nombreRepartidor: null
  }
]
```

**Visualización en Timeline:**
```
✅ Pedido recibido
│  26/11/2024 14:30
│  Por: Sistema
│
▼
👨‍🍳 Preparación
│  26/11/2024 14:35
│  Por: Juan Pérez
│
▼
✅ Listo para recoger
   26/11/2024 14:45
   Por: Juan Pérez
```

---

## 📊 Datos Mock Actuales (7 Pedidos)

### Pedido 1: PD-TIA-0001
```javascript
{
  pedidoId: "PD-TIA-0001",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  nombreCliente: "Laura Sánchez",
  telefono: "+34 612 321 456",
  metodoPago: "TPV",
  tipoEntrega: "Recogida",
  estadoActual: "Pendiente",
  total: 18.50,
  productos: 3,
  observaciones: "Sin azúcar"
}
```

### Pedido 2: PD-TIA-0002
```javascript
{
  pedidoId: "PD-TIA-0002",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  nombreCliente: "Carlos Martínez Ruiz",
  telefono: "+34 645 987 321",
  metodoPago: "Online",
  tipoEntrega: "Envío",
  direccionEntrega: "C/ Barcelona 22, 3°B",
  estadoActual: "Listo para recoger",
  total: 24.80,
  productos: 1,
  repartidorId: "TRAB-112",
  trackingUrl: "https://track.udarmoto/PD-TIA-0002"
}
```

### Pedido 3: PD-BDN-0001
```javascript
{
  pedidoId: "PD-BDN-0001",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-BURGUERS",
  puntoVentaId: "PV-BDN",
  nombreCliente: "Ana Rodríguez Pérez",
  telefono: "+34 612 456 789",
  metodoPago: "Efectivo",
  tipoEntrega: "Envío",
  direccionEntrega: "Av. Diagonal 200, 1°A",
  estadoActual: "Enviado",
  total: 21.00,
  productos: 2,
  repartidorId: "TRAB-113",
  trackingUrl: "https://track.udarmoto/PD-BDN-0001"
}
```

### Pedido 4: PD-TIA-0003
```javascript
{
  pedidoId: "PD-TIA-0003",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  nombreCliente: "Juan Fernández Silva",
  telefono: "+34 689 234 567",
  metodoPago: "TPV",
  tipoEntrega: "Recogida",
  estadoActual: "Entregado",
  fechaUltimoCambio: "2024-11-26T14:15:00",
  total: 32.50,
  productos: 2
}
```

### Pedido 5: PD-BDN-0002
```javascript
{
  pedidoId: "PD-BDN-0002",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-BURGUERS",
  puntoVentaId: "PV-BDN",
  nombreCliente: "María García López",
  telefono: "+34 655 789 123",
  metodoPago: "Online",
  tipoEntrega: "Recogida",
  estadoActual: "Listo para recoger",
  total: 16.90,
  productos: 3
}
```

### Pedido 6: PD-TIA-0004
```javascript
{
  pedidoId: "PD-TIA-0004",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-PIZZAS",
  puntoVentaId: "PV-TIA",
  nombreCliente: "Pedro González Martín",
  telefono: "+34 622 345 678",
  metodoPago: "Efectivo",
  tipoEntrega: "Envío",
  direccionEntrega: "Calle Goya 75, 4°A",
  estadoActual: "Pendiente",
  total: 28.30,
  productos: 3,
  trackingUrl: "https://track.udarmoto/PD-TIA-0004"
}
```

### Pedido 7: PD-BDN-0099
```javascript
{
  pedidoId: "PD-BDN-0099",
  empresaId: "EMP-HOSTELERIA",
  marcaId: "M-BURGUERS",
  puntoVentaId: "PV-BDN",
  nombreCliente: "Isabel López Hernández",
  telefono: "+34 677 654 321",
  metodoPago: "TPV",
  tipoEntrega: "Recogida",
  estadoActual: "Pendiente",
  total: 19.50,
  productos: 2
}
```

---

## 🔍 Filtros Aplicados

### Filtro por Estado "Pendiente"

**Console Output al aplicar filtro:**
```javascript
// Pedidos filtrados: 3
[
  { pedidoId: "PD-TIA-0001", estadoActual: "Pendiente" },
  { pedidoId: "PD-TIA-0004", estadoActual: "Pendiente" },
  { pedidoId: "PD-BDN-0099", estadoActual: "Pendiente" }
]
```

### Búsqueda por Texto "Laura"

**Console Output:**
```javascript
// Búsqueda: "Laura"
// Resultado: 1 pedido
[
  {
    pedidoId: "PD-TIA-0001",
    nombreCliente: "Laura Sánchez",
    telefono: "+34 612 321 456"
  }
]
```

### Búsqueda por ID "PD-BDN"

**Console Output:**
```javascript
// Búsqueda: "PD-BDN"
// Resultado: 3 pedidos de Badalona
[
  { pedidoId: "PD-BDN-0001", puntoVentaId: "PV-BDN" },
  { pedidoId: "PD-BDN-0002", puntoVentaId: "PV-BDN" },
  { pedidoId: "PD-BDN-0099", puntoVentaId: "PV-BDN" }
]
```

---

## 📡 Llamadas API Esperadas

### 1. Cargar Pedidos (Al abrir el componente)

**Request:**
```javascript
GET /api/pedidos?empresa_id=EMP-HOSTELERIA&punto_venta_id=PV-TIA
```

**Console Output esperado:**
```javascript
// Cargando pedidos...
// Request: GET /api/pedidos
// Params: { empresa_id: "EMP-HOSTELERIA", punto_venta_id: "PV-TIA" }

// Response recibido (200 OK):
{
  success: true,
  data: [
    { pedidoId: "PD-TIA-0001", ... },
    { pedidoId: "PD-TIA-0002", ... },
    { pedidoId: "PD-TIA-0003", ... },
    { pedidoId: "PD-TIA-0004", ... }
  ],
  total: 4,
  page: 1,
  pageSize: 20
}
```

### 2. Cambiar Estado

**Request:**
```javascript
PUT /api/pedidos/PD-TIA-0001/estado
Body: {
  "estadoNuevo": "Listo para recoger",
  "trabajadorId": "TRAB-101"
}
```

**Console Output esperado:**
```javascript
// Cambiando estado...
// Request: PUT /api/pedidos/PD-TIA-0001/estado
// Body: { estadoNuevo: "Listo para recoger", trabajadorId: "TRAB-101" }

// Response recibido (200 OK):
{
  success: true,
  message: "Estado actualizado correctamente",
  data: {
    pedidoId: "PD-TIA-0001",
    estadoAnterior: "Pendiente",
    estadoNuevo: "Listo para recoger",
    fechaHora: "2024-11-26T15:32:45Z"
  }
}

// Notificación enviada al cliente (backend):
{
  clienteId: "CLI-244",
  mensaje: "Tu pedido PD-TIA-0001 está listo para recoger",
  tipo: "pedido_listo"
}
```

### 3. Obtener Circuito

**Request:**
```javascript
GET /api/pedidos/PD-TIA-0001/circuito
```

**Console Output esperado:**
```javascript
// Obteniendo circuito...
// Request: GET /api/pedidos/PD-TIA-0001/circuito

// Response recibido (200 OK):
{
  success: true,
  data: [
    {
      circuitoId: "CIR-001",
      estado: "Pedido recibido",
      fechaHora: "2024-11-26T14:30:00Z",
      trabajadorId: "TRAB-001",
      nombreTrabajador: "Sistema"
    },
    {
      circuitoId: "CIR-002",
      estado: "Preparación",
      fechaHora: "2024-11-26T14:35:00Z",
      trabajadorId: "TRAB-102",
      nombreTrabajador: "Juan Pérez"
    }
  ]
}
```

---

## 🚨 Errores Comunes

### Error: Sin permisos para el punto de venta

**Request:**
```javascript
GET /api/pedidos?empresa_id=EMP-HOSTELERIA&punto_venta_id=PV-BDN
```

**Console Output:**
```javascript
❌ Error 403 Forbidden
{
  error: "No tienes permisos para ver pedidos de este punto de venta",
  trabajadorId: "TRAB-101",
  puntoVentaAsignado: "PV-TIA",
  puntoVentaSolicitado: "PV-BDN"
}
```

**Toast Notification:**
```
❌ Error: No tienes permisos para este punto de venta
```

### Error: Estado inválido

**Request:**
```javascript
PUT /api/pedidos/PD-TIA-0001/estado
Body: { estadoNuevo: "Cancelado", trabajadorId: "TRAB-101" }
```

**Console Output:**
```javascript
❌ Error 400 Bad Request
{
  error: "Transición de estado no permitida",
  estadoActual: "Pendiente",
  estadoSolicitado: "Cancelado",
  estadosPermitidos: ["Listo para recoger"]
}
```

### Error: Pedido no encontrado

**Request:**
```javascript
GET /api/pedidos/PD-XXX-9999/circuito
```

**Console Output:**
```javascript
❌ Error 404 Not Found
{
  error: "Pedido no encontrado",
  pedidoId: "PD-XXX-9999"
}
```

---

## 📝 Resumen de Console Logs

| Acción | Prefijo | Ejemplo |
|--------|---------|---------|
| Cambiar estado | 📦 | `📦 CAMBIAR ESTADO PEDIDO:` |
| Ver tracking | 🗺️ | `🗺️ TRACKING URL:` |
| Cargar pedidos | 🔄 | `🔄 Cargando pedidos...` |
| Error | ❌ | `❌ Error 403 Forbidden` |
| Success | ✅ | `✅ Pedido actualizado` |

**Nota:** Todos los console.log están listos en el código. El programador solo debe conectar las APIs y los datos reales fluirán automáticamente.

---

**Última actualización:** 26 Noviembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Documentación de debugging completa
