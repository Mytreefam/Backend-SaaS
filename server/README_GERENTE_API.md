# API Backend - Módulo Gerente

Backend completo para el módulo de gerente de Udar Edge Delivery 360.

## 🎯 Estructura Creada

### Controladores (`/server/src/controllers/gerente/`)

1. **dashboard.controller.ts** - Dashboard y métricas
   - `GET /api/gerente/dashboard/ventas` - Datos de ventas del periodo
   - `GET /api/gerente/dashboard/kpis` - KPIs principales
   - `GET /api/gerente/dashboard/alertas` - Alertas importantes

2. **empleados.controller.ts** - Gestión de RRHH
   - `GET /api/gerente/empleados` - Listado de empleados
   - `GET /api/gerente/empleados/:id` - Detalle de empleado
   - `POST /api/gerente/empleados` - Crear empleado
   - `PUT /api/gerente/empleados/:id` - Actualizar empleado
   - `DELETE /api/gerente/empleados/:id` - Desactivar empleado
   - `GET /api/gerente/empleados/:id/fichajes` - Fichajes del empleado
   - `POST /api/gerente/empleados/:id/tareas` - Asignar tarea
   - `GET /api/gerente/empleados/:id/desempeño` - Métricas de desempeño
   - `GET /api/gerente/empleados/estadisticas` - Estadísticas del equipo

3. **stock.controller.ts** - Stock y proveedores
   - `GET /api/gerente/stock/articulos` - Artículos de stock
   - `POST /api/gerente/stock/articulos` - Crear artículo
   - `PUT /api/gerente/stock/articulos/:id/ajustar` - Ajustar stock
   - `GET /api/gerente/stock/movimientos` - Historial de movimientos
   - `GET /api/gerente/stock/alertas` - Alertas de stock bajo
   - `GET /api/gerente/stock/proveedores` - Listado de proveedores
   - `POST /api/gerente/stock/proveedores` - Crear proveedor
   - `GET /api/gerente/stock/pedidos-proveedor` - Pedidos a proveedores
   - `POST /api/gerente/stock/pedidos-proveedor` - Crear pedido
   - `PUT /api/gerente/stock/pedidos-proveedor/:id/recibir` - Recibir pedido

4. **productos.controller.ts** - Gestión de catálogo
   - `GET /api/gerente/productos` - Catálogo de productos
   - `GET /api/gerente/productos/:id` - Detalle de producto
   - `POST /api/gerente/productos` - Crear producto
   - `PUT /api/gerente/productos/:id` - Actualizar producto
   - `DELETE /api/gerente/productos/:id` - Desactivar producto
   - `POST /api/gerente/productos/:id/duplicar` - Duplicar producto
   - `GET /api/gerente/productos/categorias` - Categorías disponibles
   - `GET /api/gerente/productos/estadisticas` - Estadísticas del catálogo

5. **finanzas.controller.ts** - Facturación y finanzas
   - `GET /api/gerente/finanzas/resumen` - Resumen financiero
   - `GET /api/gerente/finanzas/facturas` - Listado de facturas
   - `GET /api/gerente/finanzas/cierres-caja` - Cierres de caja
   - `POST /api/gerente/finanzas/cierres-caja` - Crear cierre
   - `GET /api/gerente/finanzas/impagos` - Cobros pendientes
   - `GET /api/gerente/finanzas/pagos-proveedores` - Pagos pendientes
   - `POST /api/gerente/finanzas/pagos-proveedores/:id/pagar` - Registrar pago
   - `GET /api/gerente/finanzas/prevision` - Previsión de tesorería

### Servicios (`/server/src/services/`)

1. **empresarial.service.ts** - Gestión multiempresa
   - Filtros por empresa, marca y punto de venta
   - Validación de permisos
   - Obtener recursos accesibles por usuario

2. **calculos-financieros.service.ts** - Cálculos financieros
   - Calcular margen bruto
   - Calcular coste desde escandallo
   - Calcular ticket medio
   - Calcular variaciones porcentuales
   - Calcular ROI
   - Calcular EBITDA
   - Calcular punto de equilibrio
   - Calcular flujo de caja

3. **reportes.service.ts** - Reportes y análisis
   - Generar reportes (ventas, stock, RRHH)
   - Exportar a CSV
   - Métricas comparativas entre periodos
   - Análisis de tendencias

### Rutas (`/server/src/routes/`)

**gerente.ts** - Router principal que agrupa todos los endpoints del módulo gerente

## 📊 Modelos de Datos Requeridos

Ver archivo `SCHEMA_EXTENSIONS_GERENTE.sql` para las extensiones necesarias al schema de Prisma:

- **Empleado** - Gestión de personal
- **Fichaje** - Control de horarios
- **Tarea** - Asignación de tareas
- **ArticuloStock** - Inventario de materias primas
- **MovimientoStock** - Historial de entradas/salidas
- **Proveedor** - Proveedores
- **PedidoProveedor** - Compras a proveedores
- **ItemPedidoProveedor** - Líneas de pedidos
- **CierreCaja** - Cierres de caja diarios

## 🔧 Integración con Frontend

Los controladores están diseñados para integrarse perfectamente con los componentes de frontend:

- `Dashboard360.tsx` → `dashboard.controller.ts`
- `PersonalRRHH.tsx` → `empleados.controller.ts`
- `StockProveedores.tsx` → `stock.controller.ts`
- `GestionProductos.tsx` → `productos.controller.ts`
- `FacturacionFinanzas.tsx` → `finanzas.controller.ts`

## 🚀 Próximos Pasos

1. **Actualizar schema.prisma** con los modelos documentados
2. **Ejecutar migraciones**: `npx prisma migrate dev`
3. **Implementar middleware de autenticación** para proteger rutas
4. **Agregar validaciones** con express-validator
5. **Implementar lógica real** en lugar de datos mock
6. **Crear tests unitarios** para cada controlador
7. **Documentar API** con Swagger/OpenAPI

## 📝 Notas

- Todos los controladores incluyen manejo de errores
- Los datos mock permiten probar endpoints sin base de datos completa
- Los filtros multiempresa están preparados pero requieren campos en schema
- Los cálculos financieros son reutilizables desde el servicio
- Las rutas están protegidas para rol gerente (implementar middleware)

## 🔐 Autenticación

Agregar middleware de autenticación en `gerente.ts`:

```typescript
import { authMiddleware } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/role.middleware';

router.use(authMiddleware);
router.use(checkRole(['gerente', 'admin']));
```

## 📦 Dependencias Requeridas

Ya instaladas en el proyecto:
- express
- @prisma/client
- cors

Verificar que estén en package.json del servidor.
