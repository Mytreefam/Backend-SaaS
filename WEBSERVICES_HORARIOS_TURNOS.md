# 🕐 Web Services de Turnos y Horarios - UDAR Delivery 360

## ✅ Estado: COMPLETADO Y FUNCIONAL

Se han implementado completamente los servicios web para gestionar horarios y turnos de empleados. El sistema permite crear plantillas de horarios y asignarlas a empleados.

---

## 📋 Arquitectura del Sistema

### Modelos de Base de Datos

#### 1. **Horario** (Plantilla de Horario)
Representa una plantilla reutilizable de horarios de trabajo.

```typescript
{
  id: number;
  nombre: string;                      // Ej: "Turno Mañana"
  descripcion?: string;                // Descripción del horario
  empresaId: string;                   // ID de la empresa
  lunes?: string;                      // HH:mm-HH:mm o null
  martes?: string;                     // HH:mm-HH:mm o null
  miercoles?: string;                  // HH:mm-HH:mm o null
  jueves?: string;                     // HH:mm-HH:mm o null
  viernes?: string;                    // HH:mm-HH:mm o null
  sabado?: string;                     // HH:mm-HH:mm o null
  domingo?: string;                    // HH:mm-HH:mm o null
  horasSemana: number;                 // Default: 40
  activo: boolean;                     // true/false
  creadoEn: Date;
  modificadoEn: Date;
}
```

#### 2. **AsignacionTurno** (Asignación de Horario a Empleado)
Vincula un empleado con un horario durante un período específico.

```typescript
{
  id: number;
  empleadoId: number;
  horarioId: number;
  fechaAsignacion: Date;
  fechaVigenciaDesde: Date;            // Fecha de inicio de vigencia
  fechaVigenciaHasta?: Date;           // Fecha de fin (null = indefinido)
  estado: string;                      // "activo" | "inactivo" | "cancelado"
  createdAt: Date;
  updatedAt: Date;
  empleado?: Empleado;                 // Relación
  horario?: Horario;                   // Relación
}
```

#### 3. **HorarioEmpleado** (Excepciones/Overrides)
Permite especificar horarios especiales para una fecha específica de un empleado.

```typescript
{
  id: number;
  empleadoId: number;
  fecha: Date;                         // Fecha específica (YYYY-MM-DD)
  horaEntrada: string;                 // HH:mm
  horaSalida: string;                  // HH:mm
  tipodia: string;                     // "laboral" | "descanso" | "festivo"
  observaciones?: string;              // Notas sobre el día
  createdAt: Date;
  updatedAt: Date;
  empleado?: Empleado;                 // Relación
}
```

---

## 🔌 Endpoints de la API

### 1. Gestión de Horarios (Plantillas)

#### GET `/gerente/horarios`
Obtener todos los horarios de una empresa.

**Parámetros:**
- `empresaId` (query, opcional): Filtrar por empresa

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Turno Mañana",
    "descripcion": "Horario de mañana: 08:00 - 14:00",
    "empresaId": "EMP-001",
    "lunes": "08:00-14:00",
    "martes": "08:00-14:00",
    "miercoles": "08:00-14:00",
    "jueves": "08:00-14:00",
    "viernes": "08:00-14:00",
    "sabado": "08:00-14:00",
    "domingo": null,
    "horasSemana": 40,
    "activo": true,
    "creadoEn": "2025-12-19T07:22:16.962Z",
    "modificadoEn": "2025-12-19T07:22:16.962Z",
    "asignaciones": [...]
  }
]
```

#### GET `/gerente/horarios/:id`
Obtener un horario específico por ID.

**Parámetros:**
- `id` (path): ID del horario

**Respuesta:** Objeto Horario con sus asignaciones

#### POST `/gerente/horarios`
Crear una nueva plantilla de horario.

**Body:**
```json
{
  "nombre": "Turno Noche",
  "descripcion": "Horario de noche: 21:00 - 06:00",
  "empresaId": "EMP-001",
  "lunes": "21:00-06:00",
  "martes": "21:00-06:00",
  "miercoles": "21:00-06:00",
  "jueves": "21:00-06:00",
  "viernes": "21:00-06:00",
  "sabado": "21:00-06:00",
  "domingo": null,
  "horasSemana": 40,
  "activo": true
}
```

**Respuesta:** Objeto Horario creado

#### PUT `/gerente/horarios/:id`
Actualizar un horario existente.

**Parámetros:**
- `id` (path): ID del horario

**Body:** Campos a actualizar (parcial)

**Respuesta:** Objeto Horario actualizado

#### DELETE `/gerente/horarios/:id`
Eliminar una plantilla de horario.

**Parámetros:**
- `id` (path): ID del horario

**Respuesta:**
```json
{
  "mensaje": "Horario eliminado correctamente"
}
```

### 2. Asignación de Horarios a Empleados

#### GET `/gerente/empleados/:empleadoId/horarios`
Obtener todos los horarios asignados a un empleado.

**Parámetros:**
- `empleadoId` (path): ID del empleado
- `activos` (query, opcional): `true` para solo asignaciones activas

**Respuesta:**
```json
[
  {
    "id": 1,
    "empleadoId": 10,
    "horarioId": 1,
    "fechaAsignacion": "2025-12-19T07:22:18.216Z",
    "fechaVigenciaDesde": "2025-11-19T07:22:17.905Z",
    "fechaVigenciaHasta": "2026-01-18T07:22:17.905Z",
    "estado": "activo",
    "createdAt": "2025-12-19T07:22:18.216Z",
    "updatedAt": "2025-12-19T07:22:18.216Z",
    "horario": {...}
  }
]
```

#### POST `/gerente/empleados/:empleadoId/horarios`
Asignar un horario a un empleado.

**Parámetros:**
- `empleadoId` (path): ID del empleado

**Body:**
```json
{
  "horarioId": 1,
  "fechaVigenciaDesde": "2025-12-19",
  "fechaVigenciaHasta": "2026-01-18"
}
```

**Comportamiento:**
- Desactiva automáticamente asignaciones anteriores en estado "activo"
- Activa la nueva asignación

**Respuesta:** Objeto AsignacionTurno creado

#### GET `/gerente/empleados/:empleadoId/horarios/actual`
Obtener el horario actual vigente de un empleado para una fecha específica.

**Parámetros:**
- `empleadoId` (path): ID del empleado
- `fecha` (query, opcional): Fecha a consultar (ISO string, default: hoy)

**Respuesta:** Objeto Horario vigente o error 404 si no hay asignación

#### PUT `/gerente/asignaciones/:asignacionId/cancelar`
Cancelar una asignación de horario.

**Parámetros:**
- `asignacionId` (path): ID de la asignación

**Respuesta:** Objeto AsignacionTurno con estado "cancelado"

### 3. Horarios Especiales por Empleado (Excepciones)

**Nota:** Los horarios especiales se gestionan actualmente mediante el modelo `HorarioEmpleado` en la base de datos, pero sin endpoints expuestos aún. Se pueden utilizar para:
- Días de descanso adicionales
- Cambios puntuales de horario
- Festividades
- Permisos

---

## 📱 Cliente API (Frontend)

El servicio `horariosApi` está disponible en:
```typescript
import gerenteApi from '@/services/api/gerente.api';

const horariosApi = gerenteApi.horarios;
```

### Métodos Disponibles

```typescript
// Obtener horarios
await horariosApi.obtenerHorarios(empresaId?: string): Promise<any[]>
await horariosApi.obtenerHorarioPorId(id: number): Promise<any>

// Crear/Actualizar horarios
await horariosApi.crearHorario(datos: any): Promise<any>
await horariosApi.actualizarHorario(id: number, datos: any): Promise<any>
await horariosApi.eliminarHorario(id: number): Promise<void>

// Asignaciones
await horariosApi.asignarHorarioAEmpleado(empleadoId: number, datos: any): Promise<any>
await horariosApi.obtenerHorariosEmpleado(empleadoId: number, activos?: boolean): Promise<any[]>
await horariosApi.obtenerHorarioActualEmpleado(empleadoId: number, fecha?: Date): Promise<any>
await horariosApi.cancelarAsignacionHorario(asignacionId: number): Promise<any>
```

---

## 🗂️ Estructura de Archivos

```
server/
├── src/
│   ├── controllers/gerente/
│   │   └── horarios.controller.ts         [NUEVO]
│   ├── routes/
│   │   └── gerente.ts                      [MODIFICADO - agregadas rutas]
│   └── server.ts
├── prisma/
│   └── schema.prisma                       [MODIFICADO - añadidos modelos]
└── seed-horarios.js                        [NUEVO]

client/
└── src/
    └── services/api/
        └── gerente.api.ts                  [MODIFICADO - añadido horariosApi]
```

---

## 🌱 Datos de Ejemplo (Seed)

El script `seed-horarios.js` crea automáticamente:

### Plantillas de Horarios
1. **Turno Mañana** - 08:00 a 14:00 (40 horas/semana)
2. **Turno Tarde** - 14:00 a 21:00 (40 horas/semana)
3. **Turno Noche** - 21:00 a 06:00 (40 horas/semana)
4. **Jornada Completa** - 08:00 a 17:00 (40 horas/semana)
5. **Flexible Fin de Semana** - Viernes-Domingo (30 horas/semana)

### Asignaciones a Empleados
- Empleado 1: Turno Mañana (30 días atrás - 60 días adelante)
- Empleado 2: Turno Tarde (30 días atrás - 60 días adelante)
- Empleado 3: Turno Noche (30 días atrás - 60 días adelante)
- Empleado 4: Jornada Completa (30 días atrás - indefinida)
- Empleado 5: Turno Mañana (30 días atrás - 60 días adelante)

### Horarios Especiales
- Empleado 1: Mañana especial con entrada anticipada (07:00)
- Empleado 2: Día de descanso (tipo: "descanso")

---

## 🧪 Pruebas de Endpoints

### Obtener todos los horarios
```bash
curl http://localhost:4000/gerente/horarios
```

### Obtener horario específico
```bash
curl http://localhost:4000/gerente/horarios/1
```

### Crear nuevo horario
```bash
curl -X POST http://localhost:4000/gerente/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Turno Custom",
    "descripcion": "Horario personalizado",
    "empresaId": "EMP-001",
    "lunes": "09:00-17:00",
    "martes": "09:00-17:00",
    "miercoles": "09:00-17:00",
    "jueves": "09:00-17:00",
    "viernes": "09:00-17:00",
    "sabado": null,
    "domingo": null,
    "horasSemana": 40
  }'
```

### Asignar horario a empleado
```bash
curl -X POST http://localhost:4000/gerente/empleados/10/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "horarioId": 1,
    "fechaVigenciaDesde": "2025-12-19",
    "fechaVigenciaHasta": "2026-01-18"
  }'
```

### Obtener horarios de un empleado
```bash
curl http://localhost:4000/gerente/empleados/10/horarios
```

### Obtener horario actual (para hoy)
```bash
curl http://localhost:4000/gerente/empleados/10/horarios/actual
```

### Cancelar asignación
```bash
curl -X PUT http://localhost:4000/gerente/asignaciones/1/cancelar
```

---

## 🔄 Flujo de Trabajo Típico

1. **Crear Plantillas de Horario**
   - El gerente define los horarios estándar (Mañana, Tarde, Noche, etc.)
   - Se almacenan como plantillas reutilizables

2. **Asignar Horarios a Empleados**
   - Para cada empleado, asignar una plantilla
   - Especificar período de vigencia

3. **Consultar Horarios Vigentes**
   - El sistema encuentra automáticamente el horario actual
   - Útil para verificaciones de turnos

4. **Gestionar Excepciones** (Futuro)
   - Crear horarios especiales para casos puntuales
   - Días de descanso, cambios de último momento, etc.

---

## ⚙️ Ejecución del Seed

Para cargar datos de ejemplo:

```bash
cd server
node seed-horarios.js
```

**Salida esperada:**
```
🌱 Iniciando seed de horarios...
🗑️  Limpiando asignaciones y horarios...
✅ 5 plantillas de horarios creadas
📦 Encontrados 8 empleados
✅ 5 asignaciones de turnos creadas
✅ 2 horarios especiales/excepciones creados
🎉 Seed completado exitosamente
```

---

## 🛠️ Integración Futura

### Posibles Expansiones

1. **Dashboard de Horarios**
   - Vista calendario de turnos por empleado
   - Cambios y excepciones visuales
   - Alertas de conflictos de horario

2. **Gestión de Ausencias**
   - Integrar con fichajes para validar asistencia
   - Alertas de impuntualidad
   - Reportes de horas

3. **Rotación de Turnos**
   - Algoritmo automático de asignación
   - Equilibrio de cargas
   - Preferencias de empleados

4. **Integración Móvil**
   - App móvil de empleados para ver su turno
   - Notificaciones de cambios
   - Cambios de turno entre compañeros

5. **Analytics**
   - Reportes de horas trabajadas
   - Costo de nómina por turno
   - Productividad por turno

---

## 📝 Notas Técnicas

- **Base de Datos:** PostgreSQL (51.15.198.8:5432)
- **ORM:** Prisma v5.15.0
- **Framework:** Express.js
- **Validaciones:** Básicas (requeridos campos obligatorios)
- **Errores:** Manejados con códigos HTTP estándar (400, 404, 500)
- **Logs:** Incluyen prefijos visuales (✅, ❌, 📦, etc.)

---

## 📦 Cambios Realizados

1. ✅ **Modelo Prisma**: Añadidos modelos `Horario`, `AsignacionTurno`, `HorarioEmpleado`
2. ✅ **Controlador**: Creado `horarios.controller.ts` con 9 métodos
3. ✅ **Rutas**: Agregadas 9 rutas en `gerente.ts`
4. ✅ **API Cliente**: Creado servicio `horariosApi` con 8 métodos
5. ✅ **Seed**: Creado script `seed-horarios.js` con datos de ejemplo
6. ✅ **Base de Datos**: Sincronizada con nuevos modelos

---

**Fecha de Implementación:** 19 de Diciembre de 2025  
**Estado:** ✅ LISTO PARA PRODUCCIÓN
