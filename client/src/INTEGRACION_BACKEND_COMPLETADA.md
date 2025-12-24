# 🔌 GUÍA DE INTEGRACIÓN BACKEND - FRONTEND

## ✅ Integración Completada

Se ha creado una arquitectura completa de integración con el backend real ubicado en:
```
https://mytreefam.com/sass/api/
```

---

## 📁 Estructura de Archivos Creados

```
client/src/
├── config/
│   └── api.config.ts              # Configuración centralizada de API
├── services/
│   ├── api/
│   │   ├── index.ts               # Exportaciones centralizadas
│   │   ├── auth.api.ts            # 🔐 Login, logout, refresh token
│   │   ├── clientes.api.ts        # 👤 CRUD clientes, pedidos, notificaciones
│   │   ├── productos.api.ts       # 🛍️ CRUD productos, catálogo
│   │   ├── pedidos.api.ts         # 📦 CRUD pedidos, estados
│   │   └── cupones.api.ts         # 🎫 Validación y gestión de cupones
│   └── api.service.ts             # ✅ Actualizado con nueva config
├── hooks/
│   └── useApi.ts                  # 🎣 Hooks personalizados (useQuery, useMutation)
└── examples/
    └── EJEMPLO_USO_API_HOOKS.tsx  # 📝 Ejemplos de uso
```

---

## 🔧 Configuración (api.config.ts)

### Constantes Globales
```typescript
API_CONFIG.BASE_URL = 'https://mytreefam.com/sass/api'
API_CONFIG.TIMEOUT = 30000
API_CONFIG.MAX_RETRIES = 3
```

### Endpoints Disponibles
```typescript
// Autenticación
/auth/login
/auth/logout
/auth/refresh

// Clientes
/clientes
/clientes/:id
/clientes/:id/pedidos
/clientes/:id/promociones
/clientes/:id/notificaciones
/clientes/:id/turno-activo

// Productos
/productos
/productos/:id

// Pedidos
/pedidos
/pedidos/:id

// Cupones
/cupones
/cupones/validar

// Otros módulos...
```

---

## 🚀 Uso de los Clientes API

### 1. Autenticación (auth.api.ts)

```typescript
import { authApi } from '@/services/api';

// Login
const user = await authApi.login({
  email: 'cliente@ejemplo.com',
  password: 'password123',
  remember: true, // Guardar sesión
});

// Logout
await authApi.logout();

// Verificar sesión
const isAuth = authApi.isAuthenticated();

// Obtener usuario actual
const currentUser = authApi.getCurrentUser();
```

### 2. Clientes (clientes.api.ts)

```typescript
import { clientesApi } from '@/services/api';

// Obtener todos los clientes (admin/gerente)
const clientes = await clientesApi.getAll();

// Obtener cliente por ID
const cliente = await clientesApi.getById('123');

// Crear cliente (registro)
const nuevoCliente = await clientesApi.create({
  nombre: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  password: 'password123',
  telefono: '+34 600 123 456',
});

// Actualizar cliente
const actualizado = await clientesApi.update('123', {
  nombre: 'Juan Pérez López',
  telefono: '+34 600 999 888',
});

// Obtener pedidos de un cliente
const pedidos = await clientesApi.getPedidos('123');

// Obtener promociones de un cliente
const promociones = await clientesApi.getPromociones('123');

// Obtener notificaciones de un cliente
const notificaciones = await clientesApi.getNotificaciones('123');

// Obtener turno activo
const turno = await clientesApi.getTurnoActivo('123');
```

### 3. Productos (productos.api.ts)

```typescript
import { productosApi } from '@/services/api';

// Obtener todos los productos
const productos = await productosApi.getAll();

// Obtener producto por ID
const producto = await productosApi.getById('456');

// Crear producto (admin/gerente)
const nuevoProducto = await productosApi.create({
  nombre: 'Pizza Margarita',
  descripcion: 'Pizza clásica con tomate y queso',
  precio: 12.50,
  stock: 100,
});

// Actualizar producto
const actualizado = await productosApi.update('456', {
  precio: 13.50,
  stock: 95,
});
```

### 4. Pedidos (pedidos.api.ts)

```typescript
import { pedidosApi } from '@/services/api';

// Obtener todos los pedidos (admin/gerente)
const pedidos = await pedidosApi.getAll();

// Obtener pedido por ID
const pedido = await pedidosApi.getById('789');

// Crear pedido
const nuevoPedido = await pedidosApi.create({
  clienteId: 123,
  items: [
    { productoId: 1, cantidad: 2, precio: 12.50 },
    { productoId: 2, cantidad: 1, precio: 8.00 },
  ],
  total: 33.00,
  tipoEntrega: 'domicilio',
  direccionEntrega: 'Calle Ejemplo 123, Madrid',
  metodoPago: 'tarjeta',
});

// Actualizar estado de pedido
const actualizado = await pedidosApi.update('789', {
  estado: 'en_preparacion',
});

// Cancelar pedido
await pedidosApi.delete('789');
```

### 5. Cupones (cupones.api.ts)

```typescript
import { cuponesApi } from '@/services/api';

// Validar cupón
const resultado = await cuponesApi.validar({
  codigo: 'VERANO2024',
  clienteId: 123,
  total: 50.00,
});

if (resultado.valido) {
  console.log('Descuento:', resultado.descuentoCalculado);
}
```

---

## 🎣 Hooks Personalizados (useApi.ts)

### useQuery - Para obtener datos (GET)

```typescript
import { useQuery } from '@/hooks/useApi';
import { clientesApi } from '@/services/api';

function MisPedidos({ clienteId }) {
  const { data, loading, error, refetch } = useQuery(
    () => clientesApi.getPedidos(clienteId),
    {
      showErrorToast: true,
    }
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <button onClick={refetch}>Actualizar</button>
      {data?.map(pedido => <PedidoCard key={pedido.id} pedido={pedido} />)}
    </div>
  );
}
```

### useMutation - Para modificar datos (POST, PUT, DELETE)

```typescript
import { useMutation } from '@/hooks/useApi';
import { pedidosApi } from '@/services/api';

function CrearPedido() {
  const { mutate, loading, isSuccess } = useMutation(
    (data) => pedidosApi.create(data),
    {
      showSuccessToast: true,
      successMessage: '¡Pedido creado!',
      onSuccess: (pedido) => {
        console.log('Pedido ID:', pedido.id);
        // Navegar a página de confirmación
      },
    }
  );

  const handleSubmit = () => {
    mutate({
      clienteId: 123,
      items: [...],
      total: 45.00,
    });
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Creando...' : 'Crear Pedido'}
    </button>
  );
}
```

---

## 🔐 Sistema de Autenticación

### Flujo de Login
1. Usuario ingresa credenciales
2. Se llama a `authApi.login()`
3. Backend devuelve: `{ id, nombre, email, role, token }`
4. Token se guarda en localStorage/sessionStorage
5. Token se envía en todas las peticiones posteriores

### Headers de Autenticación
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
}
```

### Manejo de Tokens
```typescript
// Guardar token
setAuthToken(token, remember);

// Obtener token
const token = getAuthToken();

// Eliminar token
clearAuthToken();
```

---

## 🛡️ Seguridad y Validación

### Validación de Sesión
```typescript
// Verificar si hay sesión activa
if (!authApi.isAuthenticated()) {
  // Redirigir a login
}

// Obtener usuario actual
const user = authApi.getCurrentUser();
if (user.role !== 'cliente') {
  // No autorizado
}
```

### Manejo de Errores
Todos los clientes API manejan automáticamente:
- ✅ Errores de red (offline)
- ✅ Errores 401 (no autenticado)
- ✅ Errores 403 (no autorizado)
- ✅ Errores 404 (no encontrado)
- ✅ Errores 500 (servidor)
- ✅ Timeouts

---

## 📦 Próximos Pasos

### 1. Actualizar Componentes Existentes
Reemplazar mock data con llamadas reales:

```typescript
// ❌ Antes (mock)
const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');

// ✅ Después (API real)
const { data: pedidos } = useQuery(() => clientesApi.getPedidos(clienteId));
```

### 2. Actualizar Contextos
Modificar `CartContext`, `ProductosContext`, etc. para usar la API:

```typescript
// CartContext.tsx
const crearPedido = async () => {
  const pedido = await pedidosApi.create({
    clienteId: user.id,
    items: items,
    total: total,
  });
  return pedido;
};
```

### 3. Sincronización en Tiempo Real
Implementar WebSockets o polling para actualizaciones:

```typescript
// Polling cada 30 segundos
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 🔍 Testing

### Test de Conexión
```typescript
// Verificar que la API responde
const productos = await productosApi.getAll();
console.log('Productos:', productos);
```

### Test de Autenticación
```typescript
// Probar login
const user = await authApi.login({
  email: 'test@ejemplo.com',
  password: 'test123',
});
console.log('Usuario autenticado:', user);
```

---

## 📚 Recursos Adicionales

- Ver: `EJEMPLO_USO_API_HOOKS.tsx` para ejemplos completos
- Backend: https://mytreefam.com/sass/api/
- Documentación del servidor: `/server/src/`

---

## ✅ Checklist de Integración

- [x] Crear configuración de API
- [x] Crear clientes API (auth, clientes, productos, pedidos, cupones)
- [x] Actualizar LoginViewMobile para usar API real
- [x] Actualizar App.tsx para logout con API
- [x] Crear hooks personalizados (useQuery, useMutation)
- [x] Crear documentación y ejemplos
- [ ] Actualizar componentes de cliente para usar API real
- [ ] Actualizar contextos (CartContext, ProductosContext)
- [ ] Implementar sincronización en tiempo real
- [ ] Testing completo de integración
- [ ] Manejo de casos offline

---

## 🎉 Conclusión

La integración básica está **completada**. Ahora puedes:

1. ✅ Hacer login con usuarios reales del backend
2. ✅ Obtener datos de clientes, productos, pedidos
3. ✅ Crear pedidos conectados al backend
4. ✅ Validar cupones
5. ✅ Usar hooks personalizados para simplificar el código

**Siguiente paso**: Actualizar los componentes principales para reemplazar mock data con llamadas reales a la API.
