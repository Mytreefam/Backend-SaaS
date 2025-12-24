# 📦 MÓDULO PRODUCTOS - PERFIL TRABAJADOR/ENCARGADO

**Versión:** 2.0  
**Fecha:** 26 de Noviembre de 2025  
**Estado:** ✅ Actualizado con cambios mínimos

---

## 📋 RESUMEN DE CAMBIOS REALIZADOS

Se han actualizado los modales y menús de acciones del módulo "Productos" para Trabajadores/Encargados, aplicando **solo los cambios mínimos necesarios** y manteniendo la estructura visual actual. El diseño está **100% preparado para conectar con la misma BBDD** que usa el perfil Gerente.

---

## 🟦 1. PANTALLA: "Productos / Recepción"

### ✅ Cambios realizados:

**Botones principales (sin cambios):**
- ✅ "Escanear albarán (OCR)"
- ✅ "Entrada manual"

**En el modal "Entrada manual":**
- ✅ Se mantiene toda la estructura de campos del albarán
- ✅ Se mantiene el listado de materiales añadidos
- 🆕 **Botón nuevo:** "Registrar devolución" 
  - Ubicación: Debajo del botón "Añadir a la lista"
  - Estilo: Gris (outline), mismo tamaño
  - Acción: Abre modal "Devolver material"

**Campos ocultos preparados para API/Make:**
```typescript
{
  EmpresaId: string;      // Ej: 'EMP-001'
  MarcaId: string;        // Ej: 'MRC-001'
  PuntoVentaId: string;   // Ej: 'PDV-TIA'
  UsuarioId: string;      // Ej: 'USER-123'
  FechaHora: string;      // ISO: '2025-11-26T16:00:00Z'
}
```

---

## 🟩 2. PANTALLA: "Productos / Stock"

### ✅ Menú de acciones "…" de cada producto:

**Opciones actualizadas:**
1. ✅ Registrar consumo
2. ✅ Solicitar material
3. ✅ Transferir material
4. ✅ Registrar merma
5. ✅ Ver ficha
6. 🆕 **Devolver material** (nuevo)

**Opciones eliminadas:**
- ❌ Venta directa (ELIMINADO)
- ❌ Ver OT (ELIMINADO)

---

## 🟧 3. MODALES ACTUALIZADOS

### 🟩 A) Modal "Registrar consumo" (antes "Material utilizado")

**Cambios:**
- ❌ Eliminada pestaña "Venta directa" completamente
- ✅ Renombrada pestaña "OT" a "Registrar consumo"

**Campos visibles:**
- Buscar producto (con autocomplete)
- Cantidad
- Nota (opcional)

**Datos ocultos (Make/API):**
```typescript
{
  TipoMovimiento: "Consumo",
  EmpresaId: "EMP-001",
  MarcaId: "MRC-001",
  PuntoVentaId: "PDV-TIA",
  UsuarioId: "USER-123"
}
```

---

### 🟩 B) Modal "Solicitar material" (NUEVO)

**Campos visibles:**
- Producto (búsqueda con autocomplete)
- Cantidad
- Proveedor sugerido (se autocompleta con el habitual)
- Nota

**Datos ocultos (Make/API):**
```typescript
{
  TipoMovimiento: "Solicitud",
  EmpresaId: "EMP-001",
  MarcaId: "MRC-001",
  PuntoVentaId: "PDV-TIA",
  UsuarioId: "USER-123"
}
```

**Acción:** Envía solicitud al proveedor/almacén central

---

### 🟩 C) Modal "Transferir material" (NUEVO)

**Campos visibles:**
- **Punto de venta origen** (bloqueado, valor del usuario actual)
- **Punto de venta destino** (selector dropdown)
- Producto (búsqueda)
- Cantidad
- Motivo

**Datos ocultos (Make/API):**
```typescript
{
  TipoMovimiento: "Transferencia",
  PuntoVentaDestinoId: "PDV-BAD", // Seleccionado por el usuario
  EmpresaId: "EMP-001",
  MarcaId: "MRC-001",
  PuntoVentaId: "PDV-TIA", // Origen
  UsuarioId: "USER-123"
}
```

**Opciones de destino:**
- Badalona (Pizza)
- Tiana (Burguers)
- Badalona (Burguers)
- Etc. (según la estructura multiempresa)

---

### 🟩 D) Modal "Registrar merma" (ACTUALIZADO)

**Campos visibles (mínimos):**
- Producto (búsqueda)
- Cantidad
- Motivo (textarea obligatorio)

**Datos ocultos (Make/API):**
```typescript
{
  TipoMovimiento: "Merma",
  EmpresaId: "EMP-001",
  MarcaId: "MRC-001",
  PuntoVentaId: "PDV-TIA",
  UsuarioId: "USER-123"
}
```

---

### 🟩 E) Modal "Devolver material" (NUEVO)

**Campos visibles:**
- Producto (búsqueda)
- Cantidad
- **Motivo** (dropdown):
  - Mal estado
  - Error de proveedor
  - Caducado
  - Roto o defectuoso
  - Otro
- Nota opcional (textarea)

**Datos ocultos (Make/API):**
```typescript
{
  TipoMovimiento: "Devolución",
  Motivo: "mal_estado", // Del dropdown
  EmpresaId: "EMP-001",
  MarcaId: "MRC-001",
  PuntoVentaId: "PDV-TIA",
  UsuarioId: "USER-123"
}
```

**Ubicación:**
- Accesible desde Stock (menú "…")
- Accesible desde Recepción (botón gris en entrada manual)

---

### 🟩 F) Modal "Ver ficha" (ACTUALIZADO)

**Campos visibles (sin costes ni precios):**
- Código
- Nombre
- Categoría
- Stock actual / Stock óptimo
- Proveedor habitual
- Última compra
- Marca del producto
- Punto de venta

**NO muestra:**
- ❌ Precio de compra
- ❌ Precio de venta (PVP)
- ❌ Márgenes
- ❌ Costes

---

## 🟦 4. PANTALLA: "Productos / Consumos y Movimientos"

### ✅ Tipos válidos en la tabla:

| Tipo | Origen | Color Badge |
|------|--------|-------------|
| Consumo | Trabajador | Purple |
| Solicitud | Trabajador | Blue |
| Transferencia | Trabajador | Teal |
| Merma | Trabajador | Orange |
| Devolución | Trabajador | Red |
| Recepción | Trabajador | Green |
| Venta mostrador | TPV (solo lectura) | Gray |

### ✅ Menú de acciones "…" (simplificado):

**Opciones disponibles:**
- ✅ Ver detalle

**Opciones eliminadas:**
- ❌ Devolver (eliminado, solo en Stock)
- ❌ Ver OT (eliminado)

---

## 🟪 5. FILTROS (CAMBIOS MÍNIMOS)

### Pantalla: Recepción
```
[Buscar] [Proveedor] [Estado] [Periodo]
```

### Pantalla: Stock
```
[Buscar] [Categoría] [Estado stock]
```

### Pantalla: Consumos y Movimientos
```
[Buscar] [Tipo de movimiento] [Periodo]
```

**⚠️ Nota importante:**
Si el usuario **no tiene permiso multiplanta**, NO se muestran los filtros:
- Empresa
- Marca
- Punto de Venta

---

## 🟥 6. PAYLOAD ESTÁNDAR PARA API/BBDD

Todos los modales generan este payload al guardar:

```typescript
interface MovimientoStockPayload {
  MovimientoId: string;              // Ej: "MOV-1732654321000"
  Tipo: "Consumo" | "Solicitud" | "Transferencia" | "Merma" | "Devolución" | "Recepción";
  EmpresaId: string;                 // Ej: "EMP-001"
  MarcaId: string;                   // Ej: "MRC-001"
  PuntoVentaId: string;              // Ej: "PDV-TIA"
  UsuarioId: string;                 // Ej: "USER-123"
  ProductoId: string;                // Ej: "M001"
  Cantidad: number;                  // Ej: 5
  ProveedorId?: string;              // Ej: "PROV-001" (solo Solicitud)
  PuntoVentaDestinoId?: string;      // Ej: "PDV-BAD" (solo Transferencia)
  Motivo?: string;                   // Texto libre o enum
  Nota?: string;                     // Texto libre opcional
  FechaHora: string;                 // ISO: "2025-11-26T16:00:00Z"
}
```

### Ejemplo de payload "Registrar consumo":
```json
{
  "MovimientoId": "MOV-1732654321000",
  "Tipo": "Consumo",
  "EmpresaId": "EMP-001",
  "MarcaId": "MRC-001",
  "PuntoVentaId": "PDV-TIA",
  "UsuarioId": "USER-123",
  "ProductoId": "M001",
  "Cantidad": 2,
  "Nota": "Consumo para mantenimiento preventivo",
  "FechaHora": "2025-11-26T16:30:00Z"
}
```

### Ejemplo de payload "Transferir material":
```json
{
  "MovimientoId": "MOV-1732654322000",
  "Tipo": "Transferencia",
  "EmpresaId": "EMP-001",
  "MarcaId": "MRC-001",
  "PuntoVentaId": "PDV-TIA",
  "UsuarioId": "USER-123",
  "ProductoId": "M001",
  "Cantidad": 5,
  "PuntoVentaDestinoId": "PDV-BAD",
  "Motivo": "Urgencia en punto de venta Badalona",
  "FechaHora": "2025-11-26T16:35:00Z"
}
```

---

## 📊 ACTUALIZACIÓN AUTOMÁTICA DE STOCK

Tras cualquier movimiento, el **Stock** debe actualizarse automáticamente:

| Tipo de movimiento | Efecto en Stock | Actualiza tabla |
|--------------------|-----------------|-----------------|
| Consumo | ⬇️ Resta cantidad | `stock.cantidad` |
| Solicitud | ⚠️ No afecta (pendiente) | `solicitudes_pendientes` |
| Transferencia | ⬇️ Resta origen, ➕ Suma destino | `stock.cantidad` (2 PDVs) |
| Merma | ⬇️ Resta cantidad | `stock.cantidad` |
| Devolución | ⬇️ Resta cantidad | `stock.cantidad` + `devoluciones` |
| Recepción | ➕ Suma cantidad | `stock.cantidad` |
| Venta mostrador (TPV) | ⬇️ Resta cantidad | `stock.cantidad` (automático) |

**Tabla compartida:**
```sql
-- La tabla "stock" es compartida por:
-- 1. Perfil GERENTE
-- 2. Perfil ENCARGADO/TRABAJADOR
-- Ambos leen y escriben en la misma tabla

SELECT * FROM stock
WHERE empresa_id = 'EMP-001'
  AND marca_id = 'MRC-001'
  AND punto_venta_id = 'PDV-TIA'
  AND producto_id = 'M001';
```

---

## 🎨 DISEÑO VISUAL (sin cambios estructurales)

### Colores por tipo de movimiento:

| Tipo | Color Header | Icono |
|------|--------------|-------|
| Consumo | Purple (#9333EA) | Package |
| Solicitud | Blue (#2563EB) | Send |
| Transferencia | Teal (#14B8A6) | Repeat |
| Merma | Orange (#F97316) | AlertTriangle |
| Devolución | Red (#DC2626) | Trash2 |
| Ver ficha | Gray (#6B7280) | FileText |

### Estructura de los modales (común):
```
┌────────────────────────────────────────────────────┐
│ [Icono color] Título del modal                     │
│               Descripción                          │
│                                                    │
│ ──────────────────────────────────────────────────│
│                                                    │
│  Campo 1: [Input/Select]                          │
│  Campo 2: [Input/Select]                          │
│  Campo 3: [Textarea opcional]                     │
│                                                    │
│ ──────────────────────────────────────────────────│
│                       [Cancelar] [Confirmar]       │
└────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS (Backend)

### 1. Usuario realiza acción en modal
```
[Frontend] Modal abierto → Usuario completa campos → Clic "Confirmar"
```

### 2. Frontend genera payload
```typescript
const payload: MovimientoStockPayload = {
  MovimientoId: `MOV-${Date.now()}`,
  Tipo: 'Consumo',
  EmpresaId: getCurrentEmpresaId(),
  MarcaId: getCurrentMarcaId(),
  PuntoVentaId: getCurrentPuntoVentaId(),
  UsuarioId: getCurrentUserId(),
  ProductoId: materialSeleccionado.id,
  Cantidad: parseInt(cantidad),
  Nota: nota || undefined,
  FechaHora: new Date().toISOString()
};
```

### 3. Envío al backend (Make.com / API)
```
POST /api/movimientos-stock

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body: {payload}
```

### 4. Backend procesa
```javascript
// Pseudocódigo backend
function procesarMovimiento(payload) {
  // 1. Validar permisos
  if (!usuarioTienePermiso(payload.UsuarioId, payload.PuntoVentaId)) {
    return { error: 'Sin permisos' };
  }
  
  // 2. Actualizar stock
  if (payload.Tipo === 'Consumo') {
    await restarStock(payload.ProductoId, payload.Cantidad, payload.PuntoVentaId);
  } else if (payload.Tipo === 'Transferencia') {
    await restarStock(payload.ProductoId, payload.Cantidad, payload.PuntoVentaId);
    await sumarStock(payload.ProductoId, payload.Cantidad, payload.PuntoVentaDestinoId);
  } else if (payload.Tipo === 'Recepción') {
    await sumarStock(payload.ProductoId, payload.Cantidad, payload.PuntoVentaId);
  }
  // etc...
  
  // 3. Guardar movimiento en historial
  await db.insertMovimiento(payload);
  
  // 4. Notificar al gerente (si aplica)
  if (payload.Tipo === 'Solicitud' || payload.Tipo === 'Devolución') {
    await notificarGerente(payload);
  }
  
  return { success: true, movimientoId: payload.MovimientoId };
}
```

### 5. Frontend recibe respuesta
```typescript
// Success
toast.success('Consumo registrado correctamente');
onOpenChange(false);
refreshStockTable();

// Error
toast.error('Error al registrar consumo');
```

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### ✅ Archivos nuevos:
```
/components/trabajador/ModalesMovimientosStock.tsx  (32KB)
  ├─ ModalRegistrarConsumo
  ├─ ModalSolicitarMaterial
  ├─ ModalTransferirMaterial
  ├─ ModalRegistrarMerma
  ├─ ModalDevolverMaterial
  └─ ModalVerFicha

/MODULO_PRODUCTOS_TRABAJADOR_ACTUALIZADO.md (este archivo)
```

### ✅ Archivos modificados:
```
/components/trabajador/RecepcionMaterialModal.tsx
  └─ Añadido: estado modalDevolucionOpen
  └─ Preparado: campos ocultos para API
```

---

## 🚀 INTEGRACIÓN CON MAKE.COM

### Endpoints necesarios:

#### 1. POST /api/movimientos-stock/registrar
```json
Request:
{
  "MovimientoId": "MOV-1732654321000",
  "Tipo": "Consumo",
  "EmpresaId": "EMP-001",
  "MarcaId": "MRC-001",
  "PuntoVentaId": "PDV-TIA",
  "UsuarioId": "USER-123",
  "ProductoId": "M001",
  "Cantidad": 2,
  "Nota": "Consumo para mantenimiento",
  "FechaHora": "2025-11-26T16:30:00Z"
}

Response:
{
  "success": true,
  "movimientoId": "MOV-1732654321000",
  "stockActualizado": {
    "producto_id": "M001",
    "stock_anterior": 15,
    "stock_actual": 13
  }
}
```

#### 2. GET /api/stock/producto/{productoId}
```json
Response:
{
  "producto_id": "M001",
  "codigo": "ACE001",
  "nombre": "Aceite Motor 5W30 - 5L",
  "stock": 13,
  "stock_optimo": 20,
  "categoria": "Lubricantes",
  "proveedor": "Repuestos AutoMax",
  "empresa_id": "EMP-001",
  "marca_id": "MRC-001",
  "punto_venta_id": "PDV-TIA"
}
```

#### 3. GET /api/movimientos-stock/historial
```json
Query params:
  ?empresa_id=EMP-001
  &punto_venta_id=PDV-TIA
  &fecha_desde=2025-11-01
  &fecha_hasta=2025-11-30
  &tipo=Consumo

Response:
{
  "movimientos": [
    {
      "movimiento_id": "MOV-1732654321000",
      "tipo": "Consumo",
      "producto": "Aceite Motor 5W30 - 5L",
      "cantidad": 2,
      "usuario": "Carlos Méndez",
      "fecha": "2025-11-26T16:30:00Z",
      "nota": "Consumo para mantenimiento"
    }
  ],
  "total": 25,
  "pagina": 1
}
```

---

## 🔐 SEGURIDAD Y PERMISOS

### Validaciones obligatorias en backend:

1. **Usuario autenticado:** Token JWT válido
2. **Usuario pertenece al Punto de Venta:** 
   ```sql
   SELECT * FROM user_scope 
   WHERE usuario_id = 'USER-123' 
     AND punto_venta_id = 'PDV-TIA';
   ```
3. **Producto existe y pertenece al mismo contexto:**
   ```sql
   SELECT * FROM productos 
   WHERE producto_id = 'M001' 
     AND empresa_id = 'EMP-001'
     AND punto_venta_id = 'PDV-TIA';
   ```
4. **Stock suficiente (para consumos, mermas, transferencias, devoluciones):**
   ```sql
   SELECT stock FROM stock 
   WHERE producto_id = 'M001' 
     AND stock >= cantidad_solicitada;
   ```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend (completado):
- [x] Crear archivo `ModalesMovimientosStock.tsx`
- [x] Modificar `RecepcionMaterialModal.tsx`
- [x] Eliminar pestaña "Venta directa" de modal consumo
- [x] Crear modal "Solicitar material"
- [x] Crear modal "Transferir material"
- [x] Actualizar modal "Registrar merma"
- [x] Crear modal "Devolver material"
- [x] Actualizar modal "Ver ficha" (sin precios)
- [x] Preparar payloads con campos ocultos
- [x] Documentación completa

### Backend (pendiente):
- [ ] Crear endpoint `/api/movimientos-stock/registrar`
- [ ] Crear endpoint `/api/stock/producto/{id}`
- [ ] Crear endpoint `/api/movimientos-stock/historial`
- [ ] Implementar actualización automática de stock
- [ ] Implementar validaciones de permisos
- [ ] Crear notificaciones al gerente
- [ ] Testing de integración

### Base de Datos (pendiente):
- [ ] Tabla `movimientos_stock` (si no existe)
- [ ] Índices en `(empresa_id, punto_venta_id, fecha)`
- [ ] Triggers para actualización automática de stock
- [ ] Constraints de integridad referencial

---

## 🎯 PRÓXIMOS PASOS

1. **Conectar modales con la API real** (reemplazar `console.log` por `fetch`)
2. **Implementar endpoints en Make.com / Backend**
3. **Crear tabla compartida de stock**
4. **Testing en entorno real con múltiples puntos de venta**
5. **Añadir notificaciones en tiempo real al Gerente**

---

## 📚 NOTAS TÉCNICAS

### Diferencias entre perfiles:

| Característica | Trabajador/Encargado | Gerente |
|----------------|----------------------|---------|
| Ver Stock | ✅ Sí | ✅ Sí |
| Ver Costes/Precios | ❌ No | ✅ Sí |
| Registrar Consumo | ✅ Sí | ✅ Sí |
| Solicitar Material | ✅ Sí | ✅ Sí (+ aprobar) |
| Transferir Material | ✅ Sí | ✅ Sí |
| Devolver Material | ✅ Sí | ✅ Sí |
| Editar Precios | ❌ No | ✅ Sí |
| Borrar Productos | ❌ No | ✅ Sí |
| Ver Todos los PDVs | ❌ No (solo el suyo) | ✅ Sí (multiplanta) |

### Tabla compartida `stock`:
```sql
CREATE TABLE stock (
  stock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresa(empresa_id),
  marca_id UUID NOT NULL REFERENCES marca(marca_id),
  punto_venta_id UUID NOT NULL REFERENCES punto_venta(punto_venta_id),
  producto_id UUID NOT NULL REFERENCES productos(producto_id),
  cantidad INT NOT NULL DEFAULT 0,
  stock_optimo INT,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, punto_venta_id, producto_id)
);

CREATE INDEX idx_stock_punto_venta ON stock(punto_venta_id, producto_id);
```

---

**FIN DE LA DOCUMENTACIÓN**

✅ Todos los cambios están implementados y documentados  
✅ Diseño preparado para conexión con BBDD  
✅ Payload estándar definido para Make.com  
✅ Estructura visual mantenida (cambios mínimos)  

🚀 Listo para integración backend!
