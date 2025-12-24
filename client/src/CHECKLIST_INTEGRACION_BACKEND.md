# ✅ CHECKLIST DE INTEGRACIÓN BACKEND
## Stock y Proveedores V2 - Udar Edge

---

## 🎯 INSTRUCCIONES

Este checklist te guiará paso a paso para conectar el frontend (ya 100% completo) con el backend.

Marca cada casilla ✅ cuando completes la tarea.

---

## 📦 FASE 1: BASE DE DATOS

### Crear Tablas (8 tablas principales)

```sql
-- Referencia: DOCUMENTACION_STOCK_PROVEEDORES_V2.md
-- Sección: "INTEGRACIÓN CON BBDD/API"
```

- [ ] Tabla `stock` (artículos)
- [ ] Tabla `proveedores`
- [ ] Tabla `recepciones` + `recepciones_detalles`
- [ ] Tabla `pedidos_proveedores` + `pedidos_proveedores_detalles`
- [ ] Tabla `inventarios` + `inventarios_conteos`
- [ ] Tabla `transferencias` + `transferencias_detalles`
- [ ] Tabla `acuerdos_proveedores`
- [ ] Tabla `escandallo`

### Crear Índices

- [ ] Índice en `stock.codigo`
- [ ] Índice en `stock.proveedor_principal_id`
- [ ] Índice en `proveedores.cif`
- [ ] Índice en `recepciones.proveedor_id`
- [ ] Índice en `pedidos_proveedores.proveedor_id`
- [ ] Índice compuesto en `inventarios_conteos (inventario_id, articulo_id)`
- [ ] Índice compuesto en `transferencias_detalles (transferencia_id, articulo_id)`

### Relaciones (Foreign Keys)

- [ ] `stock.proveedor_principal_id` → `proveedores.id`
- [ ] `recepciones.proveedor_id` → `proveedores.id`
- [ ] `recepciones_detalles.recepcion_id` → `recepciones.id`
- [ ] `recepciones_detalles.articulo_id` → `stock.id`
- [ ] `pedidos_proveedores.proveedor_id` → `proveedores.id`
- [ ] `pedidos_proveedores_detalles.pedido_id` → `pedidos_proveedores.id`
- [ ] `pedidos_proveedores_detalles.articulo_id` → `stock.id`
- [ ] `inventarios_conteos.inventario_id` → `inventarios.id`
- [ ] `inventarios_conteos.articulo_id` → `stock.id`
- [ ] `transferencias_detalles.transferencia_id` → `transferencias.id`
- [ ] `transferencias_detalles.articulo_id` → `stock.id`
- [ ] `acuerdos_proveedores.proveedor_id` → `proveedores.id`
- [ ] `escandallo.articulo_id` → `stock.id`
- [ ] `escandallo.componente_id` → `stock.id`

### Datos de Ejemplo (Seed)

- [ ] 20+ artículos de ejemplo
- [ ] 5+ proveedores de ejemplo
- [ ] 10+ recepciones históricas
- [ ] 5+ pedidos de ejemplo
- [ ] 2+ acuerdos activos

---

## 🌐 FASE 2: API ENDPOINTS

### Stock (6 endpoints)

- [ ] `GET /api/stock` - Listar con filtros
  - Query params: `marca`, `pdv`, `categoria`, `proveedor`, `stockCritico`
- [ ] `GET /api/stock/:id` - Obtener detalle completo
- [ ] `PATCH /api/stock/:id` - Actualizar artículo
- [ ] `PATCH /api/stock/:id/add` - Añadir stock (recepción)
- [ ] `PATCH /api/stock/:id/transfer` - Transferir stock
- [ ] `PATCH /api/stock/diferencia` - Ajuste por inventario

### Proveedores (7 endpoints)

- [ ] `GET /api/proveedores` - Listar proveedores
- [ ] `GET /api/proveedores/:id` - Detalle completo
- [ ] `GET /api/proveedores/:id/compras` - Historial de compras
- [ ] `GET /api/proveedores/:id/acuerdos` - Acuerdos activos
- [ ] `POST /api/proveedores/acuerdo` - Crear acuerdo
- [ ] `PATCH /api/proveedores/acuerdo/:id` - Actualizar acuerdo
- [ ] `PATCH /api/proveedores/:id` - Actualizar proveedor

### Recepciones (2 endpoints)

- [ ] `POST /api/recepciones` - Crear recepción
  - Incluye recalculo de coste medio
  - Actualiza stock disponible
  - Crea historial
- [ ] `PATCH /api/recepciones/:id` - Actualizar recepción

### Pedidos (4 endpoints)

- [ ] `POST /api/pedido` - Crear pedido principal
- [ ] `POST /api/pedido/detalles` - Crear líneas de pedido
- [ ] `GET /api/pedido` - Listar pedidos
- [ ] `GET /api/pedido/:id` - Detalle de pedido

### Inventarios (4 endpoints)

- [ ] `POST /api/inventario` - Crear sesión
- [ ] `GET /api/inventario/sesiones` - Listar sesiones
- [ ] `POST /api/inventario/conteo` - Registrar conteo
- [ ] `PATCH /api/inventario/:id/cerrar` - Cerrar sesión
  - Recalcula stock
  - Crea asiento de merma
  - Calcula diferencias en €

### Transferencias (3 endpoints)

- [ ] `POST /api/transferencias` - Crear transferencia
- [ ] `GET /api/transferencias` - Listar transferencias
- [ ] `PATCH /api/transferencias/:id` - Actualizar estado

### Otros (3 endpoints)

- [ ] `GET /api/escandallo/:id` - Obtener composición
- [ ] `GET /api/compras?articulo={id}` - Historial de compras por artículo
- [ ] `GET /api/marcas` - Listar marcas
- [ ] `GET /api/pdvs` - Listar puntos de venta

---

## 🧮 FASE 3: CÁLCULOS (Implementar en Backend)

### Cálculo 1: Punto de Reorden (ROP)

```javascript
function calcularROP(leadTime, consumoMedio) {
  return leadTime * consumoMedio;
}
```

- [ ] Implementado en función/método
- [ ] Probado con datos reales
- [ ] Se actualiza automáticamente

### Cálculo 2: Cantidad Sugerida

```javascript
function calcularCantidadSugerida(stockOptimo, stockDisponible) {
  return Math.max(0, stockOptimo - stockDisponible);
}
```

- [ ] Implementado
- [ ] Se usa en generación de pedidos

### Cálculo 3: Coste Medio Ponderado

```javascript
function recalcularCosteMedio(stockActual, costeActual, cantidadRecibida, precioRecepcion) {
  const totalActual = stockActual * costeActual;
  const totalRecibido = cantidadRecibida * precioRecepcion;
  const nuevoStock = stockActual + cantidadRecibida;
  
  return (totalActual + totalRecibido) / nuevoStock;
}
```

- [ ] Implementado
- [ ] Se ejecuta en cada recepción
- [ ] Histórico de cambios guardado

### Cálculo 4: Margen Bruto

```javascript
function calcularMargen(pvp, costeTotal) {
  const margen = pvp - costeTotal;
  const porcentaje = (margen / pvp) * 100;
  return { margen, porcentaje };
}
```

- [ ] Implementado
- [ ] Se calcula en consulta de detalle

### Cálculo 5: Valor de Stock

```javascript
function calcularValorStock(stockDisponible, costeUnitario) {
  return stockDisponible * costeUnitario;
}
```

- [ ] Implementado
- [ ] Se muestra en dashboard

### Cálculo 6: Rotación

```javascript
function calcularRotacion(ventasPeriodo, stockMedio) {
  return stockMedio > 0 ? ventasPeriodo / stockMedio : 0;
}
```

- [ ] Implementado
- [ ] Se calcula mensualmente

### Cálculo 7: Días de Stock

```javascript
function calcularDiasStock(stockDisponible, consumoMedio) {
  return consumoMedio > 0 ? Math.round(stockDisponible / consumoMedio) : 0;
}
```

- [ ] Implementado
- [ ] Se muestra en análisis

### Cálculo 8: Resumen Compras Proveedor

```javascript
function calcularResumenProveedor(compras) {
  const hoy = new Date();
  const hace30Dias = new Date(hoy - 30 * 24 * 60 * 60 * 1000);
  
  const total30d = compras
    .filter(c => new Date(c.fecha) > hace30Dias)
    .reduce((sum, c) => sum + c.importe, 0);
    
  const total12m = compras.reduce((sum, c) => sum + c.importe, 0);
  const precioMedio = total12m / compras.length;
  
  return { total30d, total12m, precioMedio };
}
```

- [ ] Implementado
- [ ] Se usa en modal de proveedor

---

## 🔌 FASE 4: CONECTAR EVENTOS

### Buscar y Reemplazar Eventos

Abre el terminal en la raíz del proyecto y ejecuta:

```bash
grep -r "🔌 EVENTO:" components/gerente/modales/
grep -r "🔌 EVENTO:" components/gerente/StockProveedoresCafe.tsx
```

### Eventos a Conectar (19 eventos)

#### Stock
- [ ] `VER_DETALLE_ARTICULO` → `GET /api/stock/:id`
- [ ] `ACTUALIZAR_ARTICULO` → `PATCH /api/stock/:id`
- [ ] `RECIBIR_MATERIAL_INICIADO` → Abrir modal
- [ ] `REALIZAR_INVENTARIO` → Abrir flujo inventario
- [ ] `TRANSFERIR_ARTICULO` → Abrir modal transferencia

#### Recepción
- [ ] `RECEPCION_MATERIAL_CREADA` → `POST /api/recepciones`
  - Incluye todos los recalculos automáticos

#### Pedidos
- [ ] `APLICAR_FILTROS_PEDIDO` → `GET /api/stock?filtros=...`
- [ ] `AGRUPAR_PEDIDO_POR_PROVEEDOR` → Ejecutar agrupación
- [ ] `ENVIAR_PEDIDO` → Crear URIs WhatsApp/Email + `POST /api/pedido`
- [ ] `GUARDAR_PEDIDO_BBDD` → `POST /api/pedido` + `POST /api/pedido/detalles`
- [ ] `CREAR_PEDIDO_AUTOMATICO` → `POST /api/pedido` (desde ROP)

#### Proveedores
- [ ] `ACTUALIZAR_PROVEEDOR` → `PATCH /api/proveedores/:id`
- [ ] `VER_DETALLE_COMPRA` → `GET /api/proveedores/:id/compras/:compraId`
- [ ] `CREAR_ACUERDO` → `POST /api/proveedores/acuerdo`
- [ ] `EDITAR_ACUERDO` → `PATCH /api/proveedores/acuerdo/:id`
- [ ] `NUEVO_PROVEEDOR_INICIADO` → Abrir modal

#### Inventarios
- [ ] `CREAR_INVENTARIO` → `POST /api/inventario`
- [ ] `REGISTRAR_CONTEO` → `POST /api/inventario/conteo`
- [ ] `CERRAR_INVENTARIO` → `PATCH /api/inventario/:id/cerrar`

---

## 🧪 FASE 5: TESTING

### Tests Unitarios

- [ ] Test: Cálculo ROP
- [ ] Test: Cálculo Cantidad Sugerida
- [ ] Test: Recalculo Coste Medio
- [ ] Test: Cálculo Margen
- [ ] Test: Agrupación por Proveedor
- [ ] Test: Formato URI WhatsApp
- [ ] Test: Formato mailto Email

### Tests de Integración

- [ ] Test: Crear artículo completo
- [ ] Test: Recepción de material con recalculo
- [ ] Test: Crear pedido completo (5 pasos)
- [ ] Test: Actualizar stock con inventario
- [ ] Test: Transferencia entre almacenes
- [ ] Test: Crear y consultar acuerdo
- [ ] Test: Historial de compras proveedor

### Tests de Flujo Completo (E2E)

- [ ] Flujo: Pedido desde ROP hasta recepción
  1. Stock cae por debajo de ROP
  2. Sistema sugiere pedido
  3. Crear pedido
  4. Enviar por WhatsApp/Email
  5. Recibir material
  6. Stock actualizado + coste medio recalculado

- [ ] Flujo: Inventario completo
  1. Crear sesión de inventario
  2. Registrar conteos
  3. Detectar diferencias
  4. Cerrar sesión
  5. Stock ajustado
  6. Merma registrada

- [ ] Flujo: Transferencia
  1. Crear transferencia
  2. Estado "Preparando"
  3. Cambiar a "En tránsito"
  4. Recibir en destino
  5. Stock actualizado en ambas ubicaciones

### Tests de Rendimiento

- [ ] Listar 1000+ artículos con filtros < 1s
- [ ] Calcular ROP para todos los artículos < 2s
- [ ] Generar pedido con 50+ artículos < 1s
- [ ] Recalcular coste medio en lote < 500ms

---

## 📱 FASE 6: INTEGRACIONES EXTERNAS

### WhatsApp

- [ ] Validar formato de número telefónico
- [ ] Construir URI correcta
- [ ] Escapar caracteres especiales en mensaje
- [ ] Abrir en nueva ventana
- [ ] Logging de envíos

Ejemplo de URI:
```
https://wa.me/34600123456?text=Hola,%20necesitamos%20realizar%20un%20pedido...
```

### Email

- [ ] Validar formato de email
- [ ] Construir URI mailto correcta
- [ ] Escapar caracteres especiales
- [ ] Subject y body pre-rellenados
- [ ] Logging de envíos

Ejemplo de URI:
```
mailto:proveedor@example.com?subject=Pedido%20Material&body=Hola...
```

### Notificaciones

- [ ] Sistema de notificaciones configurado
- [ ] Notificación: Stock crítico
- [ ] Notificación: Material recibido
- [ ] Notificación: Pedido enviado
- [ ] Notificación: Inventario completado
- [ ] Notificación: Diferencias de inventario

---

## 🔒 FASE 7: SEGURIDAD Y VALIDACIONES

### Validaciones Backend

- [ ] Validar stock no negativo
- [ ] Validar precios positivos
- [ ] Validar cantidades positivas
- [ ] Validar existencia de artículo
- [ ] Validar existencia de proveedor
- [ ] Validar permisos de usuario (solo gerente)
- [ ] Validar formato de CIF
- [ ] Validar formato de email
- [ ] Validar formato de teléfono

### Transacciones

- [ ] Recepción de material es transaccional
  - Crear recepción
  - Actualizar stock
  - Recalcular coste medio
  - Todo o nada (rollback si falla)

- [ ] Cierre de inventario es transaccional
  - Actualizar todos los stocks
  - Crear asientos de merma
  - Actualizar sesión
  - Todo o nada

- [ ] Transferencia es transaccional
  - Descontar de origen
  - Añadir a destino
  - Actualizar estado
  - Todo o nada

### Logging y Auditoría

- [ ] Log de todas las actualizaciones de stock
- [ ] Log de creación/modificación de proveedores
- [ ] Log de pedidos enviados
- [ ] Log de recepciones
- [ ] Registro de usuario y timestamp en cada operación

---

## 📊 FASE 8: DASHBOARD Y REPORTES

### KPIs en Dashboard

- [ ] Total artículos con stock crítico
- [ ] Valor total del inventario
- [ ] Rotación media del almacén
- [ ] Pedidos pendientes de recibir
- [ ] Top 5 proveedores por volumen
- [ ] Diferencias de inventario del último mes

### Reportes

- [ ] Reporte: Stock valorado
- [ ] Reporte: Movimientos de stock
- [ ] Reporte: Compras por proveedor
- [ ] Reporte: Artículos sin rotación
- [ ] Reporte: Mermas y diferencias

---

## 🎨 FASE 9: UX/UI

### Toast Notifications

- [ ] Success: Color verde, duración 3s
- [ ] Error: Color rojo, duración 5s
- [ ] Info: Color azul, duración 3s
- [ ] Warning: Color amarillo, duración 4s

### Loading States

- [ ] Spinner al cargar listado de stock
- [ ] Spinner al cargar detalle de artículo
- [ ] Spinner al guardar recepción
- [ ] Spinner al enviar pedido
- [ ] Skeleton en tablas mientras carga

### Estados Vacíos

- [ ] Mensaje "No hay artículos" en stock vacío
- [ ] Mensaje "No hay compras" en historial vacío
- [ ] Mensaje "No hay acuerdos" en proveedor sin acuerdos
- [ ] Botón CTA en cada estado vacío

### Responsive

- [ ] Modales responsive en mobile
- [ ] Tablas con scroll horizontal en mobile
- [ ] Botones adaptados al tamaño de pantalla
- [ ] Navegación optimizada en tablet

---

## 📖 FASE 10: DOCUMENTACIÓN

### Documentación de API

- [ ] README con endpoints
- [ ] Documentación Swagger/OpenAPI
- [ ] Ejemplos de request/response
- [ ] Códigos de error documentados

### Documentación de Cálculos

- [ ] Fórmula ROP documentada
- [ ] Fórmula coste medio documentada
- [ ] Lógica de agrupación documentada

### Guía de Usuario

- [ ] Cómo crear un pedido
- [ ] Cómo recibir material
- [ ] Cómo hacer un inventario
- [ ] Cómo gestionar proveedores

---

## ✅ CHECKLIST FINAL

### Antes de Desplegar a Producción

- [ ] Todos los tests pasan
- [ ] Cobertura de tests > 80%
- [ ] Performance validada
- [ ] Seguridad revisada
- [ ] Documentación completa
- [ ] Backup de BD configurado
- [ ] Logs configurados
- [ ] Monitoreo activo
- [ ] Rollback plan definido

### Post-Despliegue

- [ ] Validar en producción con datos reales
- [ ] Entrenar usuarios
- [ ] Recoger feedback
- [ ] Iterar mejoras

---

## 🎉 ¡COMPLETADO!

Cuando todas las casillas estén marcadas ✅, el módulo Stock y Proveedores estará **100% operativo** y listo para producción.

---

**Fecha de inicio:** _________________  
**Fecha de finalización:** _________________  
**Desarrollador responsable:** _________________  
**Revisado por:** _________________

---

💡 **TIP:** Imprime este checklist o úsalo como GitHub Issues/Trello cards para trackear el progreso.
