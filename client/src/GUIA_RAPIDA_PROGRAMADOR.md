# 🚀 GUÍA RÁPIDA PARA EL PROGRAMADOR

**Módulo:** Gestión de Clientes - Trabajador  
**Fecha:** 26 Noviembre 2024  
**Estado:** ✅ Frontend completo, Backend pendiente

---

## 📦 ARCHIVOS LISTOS

```
/components/trabajador/
  ├── PedidosTrabajador.tsx          ✅ Componente principal actualizado
  └── ModalDetallePedido.tsx          ✅ Modal con circuito

/DOCUMENTACION_MODULO_CLIENTES_TRABAJADOR.md  ✅ Documentación completa
/AMARRE_GLOBAL_UDAR_DELIVERY360.md            ✅ Arquitectura multiempresa
```

---

## 🎯 DATOS EXACTOS A USAR

### IDs de Ejemplo (USAR ESTOS EN BBDD)

```typescript
// EMPRESA
empresaId: "EMP-HOSTELERIA"

// MARCAS
marcaId: "M-PIZZAS"
marcaId: "M-BURGUERS"

// PUNTOS DE VENTA
puntoVentaId: "PV-TIA"   // Tiana
puntoVentaId: "PV-BDN"   // Badalona

// PEDIDOS (nomenclatura automática)
pedidoId: "PD-TIA-0001"  // Tiana, pedido 1
pedidoId: "PD-BDN-0099"  // Badalona, pedido 99
```

---

## 🔧 3 TAREAS PRINCIPALES

### 1️⃣ CREAR TABLAS BBDD

```sql
-- Tabla: pedidos
CREATE TABLE pedidos (
  pedido_id VARCHAR(50) PRIMARY KEY,           -- PD-TIA-0001
  empresa_id VARCHAR(50) NOT NULL,             -- EMP-HOSTELERIA
  marca_id VARCHAR(50) NOT NULL,               -- M-PIZZAS
  punto_venta_id VARCHAR(50) NOT NULL,         -- PV-TIA
  cliente_id VARCHAR(50),                      -- CLI-244
  nombre_cliente VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL,            -- TPV / Online / Efectivo
  tipo_entrega VARCHAR(20) NOT NULL,           -- Recogida / Envío
  direccion_entrega TEXT,
  estado_actual VARCHAR(50) NOT NULL,          -- Pendiente / Listo para recoger / Enviado / Entregado
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_ultimo_cambio TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  repartidor_id VARCHAR(50),                   -- TRAB-112
  tracking_url TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: lineas_pedido
CREATE TABLE lineas_pedido (
  linea_pedido_id VARCHAR(50) PRIMARY KEY,     -- LP-001
  pedido_id VARCHAR(50) NOT NULL,              -- FK a pedidos
  producto_id VARCHAR(50) NOT NULL,            -- PROD-122
  nombre_producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total_linea DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id)
);

-- Tabla: circuito_pedido (historial de estados)
CREATE TABLE circuito_pedido (
  circuito_id VARCHAR(50) PRIMARY KEY,         -- CIR-001
  pedido_id VARCHAR(50) NOT NULL,              -- FK a pedidos
  estado VARCHAR(100) NOT NULL,                -- "Listo para recoger"
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
  trabajador_id VARCHAR(50),                   -- TRAB-101
  nombre_trabajador VARCHAR(255),
  nombre_repartidor VARCHAR(255),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(pedido_id)
);
```

### 2️⃣ CREAR ENDPOINTS API

#### GET /api/pedidos

**Query Params:**
- `empresa_id` (required)
- `punto_venta_id` (optional - según permisos trabajador)
- `estado` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "pedidoId": "PD-TIA-0001",
      "empresaId": "EMP-HOSTELERIA",
      "marcaId": "M-PIZZAS",
      "puntoVentaId": "PV-TIA",
      "nombreCliente": "Laura Sánchez",
      "telefono": "+34 612 321 456",
      "metodoPago": "TPV",
      "tipoEntrega": "Recogida",
      "estadoActual": "Pendiente",
      "fechaCreacion": "2024-11-26T14:30:00Z",
      "total": 18.50,
      "productos": [
        {
          "lineaId": "LP-001",
          "productoId": "PROD-122",
          "nombreProducto": "Pizza Margarita",
          "cantidad": 1,
          "precioUnitario": 10.50,
          "totalLinea": 10.50
        }
      ],
      "nombreMarca": "PIZZAS",
      "nombrePuntoVenta": "TIANA"
    }
  ]
}
```

#### PUT /api/pedidos/{pedidoId}/estado

**Request Body:**
```json
{
  "estadoNuevo": "Listo para recoger",
  "trabajadorId": "TRAB-101"
}
```

**Lógica Backend:**
```javascript
async function cambiarEstadoPedido(pedidoId, estadoNuevo, trabajadorId) {
  // 1. Actualizar tabla pedidos
  await db.query(`
    UPDATE pedidos 
    SET estado_actual = $1, 
        fecha_ultimo_cambio = NOW(),
        updated_at = NOW()
    WHERE pedido_id = $2
  `, [estadoNuevo, pedidoId]);

  // 2. Insertar en histórico (circuito_pedido)
  const circuitoId = generarCircuitoId(); // CIR-xxx
  await db.query(`
    INSERT INTO circuito_pedido 
    (circuito_id, pedido_id, estado, fecha_hora, trabajador_id)
    VALUES ($1, $2, $3, NOW(), $4)
  `, [circuitoId, pedidoId, estadoNuevo, trabajadorId]);

  // 3. Opcional: Enviar notificación al cliente
  if (estadoNuevo === 'Listo para recoger') {
    await enviarNotificacion(pedidoId, 'Tu pedido está listo');
  }

  return { success: true };
}
```

#### GET /api/pedidos/{pedidoId}/circuito

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "circuitoId": "CIR-001",
      "estado": "Pedido recibido",
      "fechaHora": "2024-11-26T14:30:00Z",
      "trabajadorId": "TRAB-001",
      "nombreTrabajador": "Sistema"
    },
    {
      "circuitoId": "CIR-002",
      "estado": "Listo para recoger",
      "fechaHora": "2024-11-26T14:45:00Z",
      "trabajadorId": "TRAB-101",
      "nombreTrabajador": "Juan Pérez"
    }
  ]
}
```

### 3️⃣ GENERADOR DE IDs

```javascript
// Función para generar ID de pedido
async function generarPedidoId(puntoVentaId) {
  // Mapeo de códigos
  const codigosPuntoVenta = {
    'PV-TIA': 'TIA',
    'PV-BDN': 'BDN'
  };
  
  const codigo = codigosPuntoVenta[puntoVentaId];
  
  // Obtener última secuencia para este punto de venta
  const result = await db.query(`
    SELECT pedido_id 
    FROM pedidos 
    WHERE punto_venta_id = $1 
    ORDER BY pedido_id DESC 
    LIMIT 1
  `, [puntoVentaId]);
  
  let secuencia = 1;
  if (result.rows.length > 0) {
    // Extraer número de PD-TIA-0001 → 0001
    const ultimoId = result.rows[0].pedido_id;
    const ultimaSecuencia = parseInt(ultimoId.split('-')[2]);
    secuencia = ultimaSecuencia + 1;
  }
  
  const secuenciaStr = secuencia.toString().padStart(4, '0');
  return `PD-${codigo}-${secuenciaStr}`;
}

// Ejemplos:
// generarPedidoId('PV-TIA') → 'PD-TIA-0001'
// generarPedidoId('PV-BDN') → 'PD-BDN-0099'
```

---

## 📝 CONECTAR FRONTEND CON API

### Paso 1: Crear servicio API

```typescript
// /services/pedidosApi.ts

const API_BASE = '/api';

export interface PedidoAPI {
  pedidoId: string;
  empresaId: string;
  marcaId: string;
  puntoVentaId: string;
  nombreCliente: string;
  telefono: string;
  metodoPago: 'TPV' | 'Online' | 'Efectivo';
  tipoEntrega: 'Recogida' | 'Envío';
  direccionEntrega?: string;
  estadoActual: 'Pendiente' | 'Listo para recoger' | 'Enviado' | 'Entregado';
  fechaCreacion: string;
  total: number;
  productos: ProductoPedido[];
  nombreMarca: string;
  nombrePuntoVenta: string;
}

// Obtener pedidos
export async function obtenerPedidos(params: {
  empresaId: string;
  puntoVentaId?: string;
  estado?: string;
}): Promise<PedidoAPI[]> {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE}/pedidos?${query}`);
  const data = await response.json();
  return data.data;
}

// Cambiar estado
export async function cambiarEstadoPedido(
  pedidoId: string,
  estadoNuevo: string,
  trabajadorId: string
): Promise<void> {
  await fetch(`${API_BASE}/pedidos/${pedidoId}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estadoNuevo, trabajadorId })
  });
}

// Obtener circuito
export async function obtenerCircuitoPedido(pedidoId: string) {
  const response = await fetch(`${API_BASE}/pedidos/${pedidoId}/circuito`);
  const data = await response.json();
  return data.data;
}
```

### Paso 2: Actualizar componente

```typescript
// En PedidosTrabajador.tsx, reemplazar datos mock:

import { obtenerPedidos, cambiarEstadoPedido } from '../../services/pedidosApi';

export function PedidosTrabajador() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar pedidos desde API
  useEffect(() => {
    cargarPedidos();
  }, []);

  async function cargarPedidos() {
    setLoading(true);
    try {
      const data = await obtenerPedidos({
        empresaId: 'EMP-HOSTELERIA',
        // puntoVentaId: obtener del usuario logueado
      });
      setPedidos(data);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }

  // Cambiar estado (reemplazar console.log)
  const cambiarEstado = async (pedido: Pedido, nuevoEstado: string) => {
    try {
      await cambiarEstadoPedido(
        pedido.pedidoId,
        nuevoEstado,
        'TRAB-101' // TODO: obtener del usuario logueado
      );
      toast.success(`Pedido ${pedido.pedidoId} actualizado`);
      cargarPedidos(); // Recargar lista
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  // ... resto del código igual
}
```

---

## 🔐 PERMISOS (Implementar en Backend)

```javascript
// Middleware de permisos
async function validarPermisosPedidos(req, res, next) {
  const { usuario } = req; // Usuario logueado
  const { punto_venta_id } = req.query;

  if (usuario.rol === 'trabajador') {
    // Verificar que el trabajador esté asignado al punto de venta
    const asignado = await db.query(`
      SELECT 1 FROM asignaciones_trabajadores
      WHERE trabajador_id = $1 AND punto_venta_id = $2
    `, [usuario.id, punto_venta_id]);

    if (asignado.rows.length === 0) {
      return res.status(403).json({
        error: 'No tienes permisos para este punto de venta'
      });
    }
  }

  next();
}
```

---

## ✅ CHECKLIST IMPLEMENTACIÓN

### Backend
- [ ] Crear tabla `pedidos`
- [ ] Crear tabla `lineas_pedido`
- [ ] Crear tabla `circuito_pedido`
- [ ] Endpoint `GET /api/pedidos`
- [ ] Endpoint `PUT /api/pedidos/{id}/estado`
- [ ] Endpoint `GET /api/pedidos/{id}/circuito`
- [ ] Función `generarPedidoId()`
- [ ] Middleware de permisos
- [ ] Índices en BBDD

### Frontend
- [ ] Crear `/services/pedidosApi.ts`
- [ ] Conectar `obtenerPedidos()`
- [ ] Conectar `cambiarEstadoPedido()`
- [ ] Conectar `obtenerCircuitoPedido()`
- [ ] Eliminar datos mock
- [ ] Obtener usuario logueado
- [ ] Manejo de errores
- [ ] Loading states

### Testing
- [ ] Crear pedido en BBDD
- [ ] Generar ID automático
- [ ] Cambiar estado
- [ ] Verificar circuito
- [ ] Probar permisos
- [ ] Validar en diferentes navegadores

---

## 🎯 DATOS DE PRUEBA

```sql
-- Insertar pedido de ejemplo
INSERT INTO pedidos VALUES (
  'PD-TIA-0001',
  'EMP-HOSTELERIA',
  'M-PIZZAS',
  'PV-TIA',
  'CLI-244',
  'Laura Sánchez',
  '+34 612 321 456',
  'TPV',
  'Recogida',
  NULL,
  'Pendiente',
  '2024-11-26 14:30:00',
  NULL,
  18.50,
  NULL,
  NULL,
  'Sin azúcar',
  NOW(),
  NOW()
);

-- Insertar línea de pedido
INSERT INTO lineas_pedido VALUES (
  'LP-001',
  'PD-TIA-0001',
  'PROD-122',
  'Pizza Margarita',
  1,
  10.50,
  10.50
);

-- Insertar circuito inicial
INSERT INTO circuito_pedido VALUES (
  'CIR-001',
  'PD-TIA-0001',
  'Pedido recibido',
  '2024-11-26 14:30:00',
  'TRAB-001',
  'Sistema',
  NULL
);
```

---

## 📞 SOPORTE

**Documentación Completa:**
- `/DOCUMENTACION_MODULO_CLIENTES_TRABAJADOR.md` (900+ líneas)
- `/AMARRE_GLOBAL_UDAR_DELIVERY360.md` (6,500+ líneas)

**Estado Actual:**
- ✅ Frontend 100% completado
- ✅ Interfaces TypeScript definidas
- ✅ console.log en todas las acciones
- ❌ Backend pendiente (3 endpoints)
- ❌ BBDD pendiente (3 tablas)

**Última actualización:** 26 Noviembre 2024  
**Versión:** 2.0 FINAL
