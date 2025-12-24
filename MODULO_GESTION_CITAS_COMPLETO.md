# 📋 Módulo de Gestión de Citas - Documentación Completa

## ✅ Módulo Completado

El módulo de **Gestión de Citas** ha sido completamente implementado con todas las características necesarias.

---

## 🗂️ Estructura Creada

### 1. **Base de Datos - Schema Prisma**
**Archivo:** `server/prisma/schema.prisma`

```prisma
model Cita {
  id            Int      @id @default(autoincrement())
  fecha         DateTime
  hora          String?  // HH:mm formato
  motivo        String
  servicio      String?
  estado        String   @default("solicitada")
  clienteId     Int
  telefono      String?
  email         String?
  notas         String?
  canceladaPor  String?
  razonCancelacion String?
  creadoEn      DateTime @default(now())
  modificadoEn  DateTime @updatedAt
  cliente       Cliente  @relation(fields: [clienteId], references: [id], onDelete: Cascade)
}
```

**Estados disponibles:**
- `solicitada` - Cita solicitada (estado inicial)
- `confirmada` - Cita confirmada por el cliente
- `en_progreso` - Cita en curso
- `completada` - Cita completada satisfactoriamente
- `cancelada` - Cita cancelada
- `no_presentado` - Cliente no se presentó

**Campos:**
- `fecha` - Fecha de la cita
- `hora` - Hora de la cita (formato HH:mm)
- `motivo` - Motivo de la cita
- `servicio` - Tipo de servicio
- `estado` - Estado actual de la cita
- `clienteId` - Relación con Cliente
- `telefono` - Teléfono de contacto
- `email` - Email de contacto
- `notas` - Notas adicionales
- `canceladaPor` - Usuario que canceló la cita
- `razonCancelacion` - Razón de la cancelación

---

### 2. **Migración**
**Archivo creado:** `server/migrations/20251219140959_add_citas_fields`

Ejecutada exitosamente con el comando:
```bash
npx prisma migrate dev --name add_citas_fields
```

---

### 3. **Seed de Datos**
**Archivo:** `server/seed-citas.js`

Función que puebla la base de datos con citas de ejemplo:
- Crea citas en todos los estados disponibles
- Asocia citas con clientes existentes
- Genera datos variados y realistas
- Distribuye las citas en los últimos/próximos 30 días

**Ejecutar seed:**
```bash
node seed-citas.js
```

---

### 4. **Controlador**
**Archivo:** `server/src/controllers/citas.controller.ts`

**Métodos implementados:**

#### `getAll(req, res)` - GET /api/citas
Obtiene todas las citas con opciones de filtrado:
- **Query parameters:**
  - `estado` - Filtrar por estado
  - `clienteId` - Filtrar por cliente
  - `servicio` - Filtrar por servicio
  - `mes` - Filtrar por mes (1-12)
  - `anio` - Filtrar por año

- **Response:**
  ```json
  {
    "success": true,
    "data": [...],
    "stats": {
      "total": 18,
      "solicitadas": 3,
      "confirmadas": 5,
      "enProgreso": 2,
      "completadas": 6,
      "canceladas": 1,
      "noPresantado": 1,
      "tasaConfirmacion": 166.7,
      "tasaCumplimiento": 120.0,
      "tasaCancelacion": 5.6
    }
  }
  ```

#### `getById(req, res)` - GET /api/citas/:id
Obtiene una cita específica por ID

#### `create(req, res)` - POST /api/citas
Crea una nueva cita
- **Body requerido:**
  - `fecha` (Date)
  - `motivo` (String)
  - `clienteId` (Number)

- **Body opcional:**
  - `hora` (String)
  - `servicio` (String)
  - `telefono` (String)
  - `email` (String)
  - `notas` (String)

#### `update(req, res)` - PUT /api/citas/:id
Actualiza una cita existente

#### `changeStatus(req, res)` - PATCH /api/citas/:id/status
Cambia el estado de una cita
- **Body requerido:**
  - `estado` (String - uno de los 6 estados válidos)

- **Body opcional (si estado = cancelada):**
  - `canceladaPor` (String)
  - `razonCancelacion` (String)

#### `confirm(req, res)` - PATCH /api/citas/:id/confirm
Confirma una cita (cambia estado a "confirmada")

#### `cancel(req, res)` - PATCH /api/citas/:id/cancel
Cancela una cita
- **Body opcional:**
  - `canceladaPor` (String)
  - `razonCancelacion` (String)

#### `delete(req, res)` - DELETE /api/citas/:id
Elimina una cita

#### `getStats(req, res)` - GET /api/citas/stats
Obtiene estadísticas generales de citas:
- Conteos por estado
- Tasa de confirmación
- Tasa de cumplimiento
- Tasa de cancelación

---

### 5. **Rutas API**
**Archivo:** `server/src/routes/cita.ts`

```
GET    /api/citas              - Listar citas (con filtros)
GET    /api/citas/stats        - Obtener estadísticas
GET    /api/citas/:id          - Obtener cita por ID
POST   /api/citas              - Crear nueva cita
PUT    /api/citas/:id          - Actualizar cita
PATCH  /api/citas/:id/status   - Cambiar estado
PATCH  /api/citas/:id/confirm  - Confirmar cita
PATCH  /api/citas/:id/cancel   - Cancelar cita
DELETE /api/citas/:id          - Eliminar cita
```

---

## 📊 Estadísticas y Métricas

El sistema calcula automáticamente:

1. **Tasa de Confirmación**
   ```
   (Confirmadas / Solicitadas) × 100
   ```
   Indica el porcentaje de citas solicitadas que se confirman.

2. **Tasa de Cumplimiento**
   ```
   (Completadas / Confirmadas) × 100
   ```
   Indica el porcentaje de citas confirmadas que se completan.

3. **Tasa de Cancelación**
   ```
   (Canceladas / Total) × 100
   ```
   Indica el porcentaje de citas que se cancelan.

---

## 🚀 Ejemplo de Uso

### Crear una cita
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2025-12-25T10:00:00Z",
    "hora": "10:30",
    "motivo": "Consulta General",
    "servicio": "Consulta General",
    "clienteId": 1,
    "telefono": "600123456",
    "email": "cliente@example.com",
    "notas": "Primera cita del cliente"
  }'
```

### Obtener todas las citas con filtros
```bash
curl "http://localhost:3000/api/citas?estado=confirmada&mes=12&anio=2025"
```

### Cambiar estado de cita
```bash
curl -X PATCH http://localhost:3000/api/citas/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "confirmada"
  }'
```

### Cancelar cita
```bash
curl -X PATCH http://localhost:3000/api/citas/1/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "canceladaPor": "admin",
    "razonCancelacion": "Cliente no disponible"
  }'
```

### Obtener estadísticas
```bash
curl "http://localhost:3000/api/citas/stats"
```

---

## 📝 Notas Importantes

1. **Integración automática**: Las rutas ya están integradas en `server/src/app.ts`
2. **Base de datos sincronizada**: El schema está actualizado con la migración aplicada
3. **Datos de prueba**: Ejecutar `node seed-citas.js` para poblar datos de ejemplo
4. **Estados flexibles**: El sistema permite cambiar entre cualquier estado
5. **Auditoría**: Se registra quién canceló y la razón de cancelación

---

## ✨ Características Principales

✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
✅ Sistema de estados múltiples
✅ Filtrado avanzado (estado, cliente, servicio, fecha)
✅ Cálculo automático de tasas y métricas
✅ Registro de cancelaciones con razones
✅ Relación con clientes
✅ Timestamps automáticos (createdAt, updatedAt)
✅ Validación de datos
✅ Manejo de errores robusto

---

## 🔄 Próximos Pasos (Opcional)

1. Crear componentes en frontend para la UI
2. Implementar validaciones adicionales (express-validator)
3. Agregar autenticación/autorización a las rutas
4. Crear webhooks para notificaciones
5. Implementar búsqueda avanzada
6. Agregar paginación

