# 📋 SISTEMA DE TAREAS Y FORMACIÓN - DOCUMENTACIÓN COMPLETA

## 🎯 Resumen Ejecutivo

Sistema híbrido de gestión de tareas operativas y formación que permite al **Gerente** decidir si las tareas requieren reporte del trabajador o son simplemente informativas (guiones de trabajo).

---

## 🏗️ Arquitectura

### Servicio Base
- **`task-management.service.ts`**: Servicio centralizado que gestiona toda la lógica

### Wrappers Específicos
- **`tareas-operativas.service.ts`**: Interfaz simplificada para tareas del día a día
- **`formacion.service.ts`**: Interfaz para módulos de formación y onboarding

### Componentes UI
- **`GestionTareasOperativas.tsx`**: Panel del gerente para crear y gestionar tareas
- ✅ **`TareasTrabajador.tsx`** - Vista del trabajador para tareas operativas
- ✅ **`FormacionTrabajador.tsx`** - Vista de formación del trabajador

---

## 🔑 Conceptos Clave

### Tipos de Tareas

| Tipo | Descripción | Requiere Reporte | Uso |
|------|-------------|------------------|-----|
| **Tarea Operativa con Reporte** | El trabajador debe completarla y confirmar | ✅ Sí | Tareas que necesitan validación |
| **Guion de Trabajo (Informativa)** | Solo es una guía/checklist | ❌ No | Rutinas diarias, pasos a seguir |
| **Módulo de Formación** | Capacitación/onboarding | ✅ Siempre | Formación y certificaciones |

---

## 🎛️ Control del Gerente

El gerente tiene **control total** sobre cada tarea mediante 3 parámetros:

### 1. `requiereReporte` (boolean)
```typescript
requiereReporte: true  // ✅ Trabajador DEBE completar y reportar
requiereReporte: false // ❌ Solo informativa (checklist visual)
```

### 2. `requiereAprobacion` (boolean)
```typescript
// Solo aplica si requiereReporte = true
requiereAprobacion: true  // ✅ Gerente debe aprobar
requiereAprobacion: false // ❌ Se aprueba automáticamente
```

### 3. `recurrente` (boolean)
```typescript
recurrente: true  // 🔁 Se repite automáticamente
recurrente: false // 🎯 Única vez
```

---

## 📊 Flujos de Trabajo

### Flujo 1: Tarea con Reporte y Aprobación

```
GERENTE                    TRABAJADOR                 GERENTE
   │                           │                         │
   ├─ Crea tarea              │                         │
   │  requiereReporte: true   │                         │
   │  requiereAprobacion: true│                         │
   │                           │                         │
   │─────────────────────────>│                         │
   │        Notificación       │                         │
   │                           │                         │
   │                           ├─ Ve tarea en lista     │
   │                           ├─ Inicia tarea          │
   │                           ├─ Realiza trabajo       │
   │                           ├─ Sube evidencias       │
   │                           ├─ Completa con reporte  │
   │                           │                         │
   │                           │────────────────────────>│
   │                           │      Notificación       │
   │                           │                         │
   │                           │                         ├─ Revisa reporte
   │                           │                         ├─ Ve evidencias
   │                           │                         ├─ APRUEBA ✅
   │                           │                         │
   │                           │<────────────────────────┤
   │                           │      Notificación       │
   │                           │                         │
   │                           ├─ ✅ Tarea finalizada    │
```

### Flujo 2: Guion de Trabajo (Informativo)

```
GERENTE                    TRABAJADOR
   │                           │
   ├─ Crea guion              │
   │  requiereReporte: false  │
   │  recurrente: true        │
   │                           │
   │─────────────────────────>│
   │        Notificación       │
   │                           │
   │                           ├─ Ve checklist del día
   │                           ├─ ☐ Tarea 1
   │                           ├─ ☑ Tarea 2 (marca vista)
   │                           ├─ ☐ Tarea 3
   │                           │
   │                           │ (Sin reportar, sin aprobar)
   │                           │ (Se repite automáticamente mañana)
```

### Flujo 3: Formación/Onboarding

```
GERENTE                    TRABAJADOR                 GERENTE
   │                           │                         │
   ├─ Asigna onboarding       │                         │
   │  completo (5 módulos)    │                         │
   │                           │                         │
   │─────────────────────────>│                         │
   │                           │                         │
   │                           ├─ Módulo 1: Bienvenida  │
   │                           ├─ Módulo 2: TPV         │
   │                           ├─ Módulo 3: Fichajes    │
   │                           ├─ Completa con examen   │
   │                           │   Puntuación: 95/100    │
   │                           │                         │
   │                           │────────────────────────>│
   │                           │                         │
   │                           │                         ├─ Revisa puntuación
   │                           │                         ├─ Aprueba ✅
   │                           │                         ├─ Emite certificado
   │                           │                         │
   │                           │<────────────────────────┤
   │                           │                         │
   │                           ├─ 🎓 Certificado recibido
```

---

## 🔧 Uso en Código

### Gerente: Crear Tarea con Reporte

```typescript
import { crearTareaConReporte } from './services/tareas-operativas.service';

const tarea = await crearTareaConReporte({
  empresaId: 'EMP-001',
  empresaNombre: 'Disarmink S.L.',
  puntoVentaId: 'PDV-TIANA',
  puntoVentaNombre: 'Tiana',
  
  asignadoA: 'TRB-001',
  asignadoNombre: 'Juan Pérez',
  asignadoPor: 'GER-001',
  asignadoPorNombre: 'María García',
  
  titulo: 'Revisar stock crítico',
  descripcion: 'Verificar harina, tomate y queso',
  instrucciones: '1. Ir al almacén\n2. Contar físicamente\n3. Reportar con foto',
  
  prioridad: 'alta',
  requiereAprobacion: true, // ✅ Gerente debe aprobar
  
  fechaVencimiento: '2024-12-10T12:00:00Z',
  etiquetas: ['inventario', 'crítico'],
});

// ✅ Trabajador recibe notificación push automáticamente
```

### Gerente: Crear Guion Informativo

```typescript
import { crearGuionTrabajo } from './services/tareas-operativas.service';

const guion = await crearGuionTrabajo({
  empresaId: 'EMP-001',
  empresaNombre: 'Disarmink S.L.',
  puntoVentaId: 'PDV-TIANA',
  puntoVentaNombre: 'Tiana',
  
  asignadoA: 'TRB-001',
  asignadoNombre: 'Juan Pérez',
  asignadoPor: 'GER-001',
  asignadoPorNombre: 'María García',
  
  titulo: 'Checklist de apertura',
  descripcion: 'Tareas al abrir el local',
  instrucciones: `
    ☐ Desactivar alarma
    ☐ Encender luces
    ☐ Precalentar hornos
    ☐ Revisar cámaras
    ☐ Preparar estación
  `,
  
  prioridad: 'media',
  recurrente: true, // 🔁 Se repite cada día
  frecuencia: 'diaria',
});

// ℹ️ Solo es informativo, no requiere confirmación
```

### Trabajador: Ver Guion del Día

```typescript
import { obtenerGuionDelDia } from './services/tareas-operativas.service';

const guion = obtenerGuionDelDia('TRB-001', 'PDV-TIANA');

console.log(`Tienes ${guion.length} tareas informativas hoy:`);
guion.forEach(tarea => {
  console.log(`- [${tarea.prioridad}] ${tarea.titulo}`);
});
```

### Trabajador: Marcar Guion como Visto

```typescript
import { marcarTareaComoVista } from './services/tareas-operativas.service';

// No requiere reporte, solo marcar como visto
const resultado = marcarTareaComoVista(tareaId, trabajadorId);

// ✅ Se marca como completada automáticamente (no requiere aprobación)
```

### Trabajador: Completar Tarea con Reporte

```typescript
import { completarTarea } from './services/tareas-operativas.service';

const resultado = await completarTarea({
  tareaId: 'TSK-123',
  trabajadorId: 'TRB-001',
  comentario: 'Stock revisado. Harina: 65kg (OK), Tomate: 18kg (bajo)',
  evidenciaUrls: [
    'https://storage/foto-harina.jpg',
    'https://storage/foto-tomate.jpg',
  ],
  tiempoEmpleado: 25, // minutos
});

// ✅ Gerente recibe notificación automáticamente
```

### Gerente: Aprobar Tarea

```typescript
import { aprobarTarea } from './services/task-management.service';

const resultado = await aprobarTarea({
  tareaId: 'TSK-123',
  gerenteId: 'GER-001',
  aprobada: true,
  comentario: 'Excelente trabajo, procederé a pedir tomate',
});

// ✅ Trabajador recibe notificación de aprobación
```

### Gerente: Rechazar Tarea

```typescript
const resultado = await aprobarTarea({
  tareaId: 'TSK-123',
  gerenteId: 'GER-001',
  aprobada: false,
  comentario: 'Falta revisar el queso mozzarella, por favor completa esa parte',
});

// ❌ Trabajador recibe notificación de rechazo con feedback
// 🔄 Trabajador debe volver a completarla
```

### Gerente: Asignar Onboarding Completo

```typescript
import { asignarOnboardingCompleto } from './services/formacion.service';

const modulos = await asignarOnboardingCompleto({
  trabajadorId: 'TRB-002',
  trabajadorNombre: 'Ana Martínez',
  gerenteId: 'GER-001',
  gerenteNombre: 'María García',
  empresaId: 'EMP-001',
  empresaNombre: 'Disarmink S.L.',
});

console.log(`${modulos.length} módulos asignados:`);
// ✅ 5 módulos de onboarding con fechas escalonadas
```

### Trabajador: Ver Progreso de Onboarding

```typescript
import { obtenerProgresoOnboarding } from './services/formacion.service';

const progreso = obtenerProgresoOnboarding('TRB-002');

console.log(`Progreso: ${progreso.porcentaje}%`);
console.log(`Completados: ${progreso.completados}/${progreso.total}`);
console.log(`Finalizado: ${progreso.finalizado ? 'SÍ' : 'NO'}`);
```

---

## 📱 Notificaciones Automáticas

El sistema envía notificaciones push automáticas en estos eventos:

### Para el Trabajador
- ✅ Nueva tarea asignada
- ✅ Tarea aprobada por gerente
- ❌ Tarea rechazada (con feedback)
- 🗑️ Tarea cancelada
- 🎓 Nuevo módulo de formación
- 🎓 Certificado emitido

### Para el Gerente
- ✅ Tarea completada (pendiente de aprobación)
- 🎓 Formación completada (pendiente de certificar)
- ⚠️ Tarea vencida sin completar

---

## 📊 Estadísticas Disponibles

```typescript
import { obtenerEstadisticasTareas } from './services/task-management.service';

const stats = obtenerEstadisticasTareas();

console.log({
  total: stats.total,
  operativas: stats.operativas,
  formacion: stats.formacion,
  
  // Por estado
  pendientes: stats.pendientes,
  enProgreso: stats.enProgreso,
  completadas: stats.completadas,
  aprobadas: stats.aprobadas,
  rechazadas: stats.rechazadas,
  vencidas: stats.vencidas,
  
  // Por tipo
  requierenReporte: stats.requierenReporte,
  informativas: stats.informativas,
  
  // Pendientes
  pendientesAprobacion: stats.pendientesAprobacion,
});
```

---

## 🎨 Interfaz de Usuario

### Componente del Gerente: `GestionTareasOperativas.tsx`

**Características:**
- ✅ Crear tareas con reporte o informativas
- ✅ Toggle para decidir si requiere aprobación
- ✅ Toggle para tareas recurrentes
- ✅ Vista de tareas pendientes de aprobación
- ✅ Aprobar/rechazar con un clic
- ✅ Estadísticas en tiempo real
- ✅ Filtros por estado, tipo, prioridad

**Uso:**
```tsx
import { GestionTareasOperativas } from './components/gerente/GestionTareasOperativas';

<GestionTareasOperativas
  gerenteId="GER-001"
  gerenteNombre="María García"
  empresaId="EMP-001"
  empresaNombre="Disarmink S.L."
/>
```

### Componente del Trabajador: `TareasTrabajador.tsx`

**Características:**
- ✅ Ver guion del día (tareas informativas) con checklist
- ✅ Marcar tareas informativas como vistas
- ✅ Ver tareas que requieren reporte
- ✅ Completar tareas con evidencias (fotos/documentos)
- ✅ Ver tareas rechazadas con feedback del gerente
- ✅ Ver tareas en revisión
- ✅ Historial de tareas completadas
- ✅ Estadísticas de progreso

**Uso:**
```tsx
import { TareasTrabajador } from './components/trabajador/TareasTrabajador';

<TareasTrabajador
  trabajadorId="TRB-001"
  trabajadorNombre="Juan Pérez"
  puntoVentaId="PDV-TIANA"
  puntoVentaNombre="Tiana"
/>
```

### Componente del Trabajador: `FormacionTrabajador.tsx`

**Características:**
- ✅ Ver progreso de onboarding con % completado
- ✅ Acceder a módulos de formación
- ✅ Completar módulos con evaluación (puntuación 0-100)
- ✅ Ver módulos rechazados con feedback
- ✅ Ver módulos en revisión
- ✅ Descargar certificados obtenidos
- ✅ Estadísticas de rendimiento (puntuación media)
- ✅ Filtros por categoría de formación

**Uso:**
```tsx
import { FormacionTrabajador } from './components/trabajador/FormacionTrabajador';

<FormacionTrabajador
  trabajadorId="TRB-001"
  trabajadorNombre="Juan Pérez"
/>
```

---

## 🔗 Integración con Otros Sistemas

### Sistema de Notificaciones
✅ **Conectado** - Usa `notifications.service.ts`
- Notificaciones push automáticas
- In-app notifications
- Email notifications

### Sistema de Fichajes
✅ **Listo para conectar** - Las tareas pueden filtrar por PDV fichado
```typescript
const { puntoVentaId } = usePuntoVentaActivo();
const tareas = obtenerGuionDelDia(trabajadorId, puntoVentaId);
```

### Sistema de Permisos
✅ **Listo para conectar** - Validación de roles
```typescript
// Solo el gerente asignador puede aprobar
if (tarea.asignadoPor !== gerenteId) {
  throw new Error('No autorizado');
}
```

---

## 📝 Próximos Pasos

### Componentes Pendientes

1. **`TareasTrabajador.tsx`** - Vista para el trabajador
   - Pestañas: "Guion del Día" | "Tareas para Reportar" | "Completadas"
   - Modal para completar tareas con evidencias
   - Progreso visual

2. **`FormacionTrabajador.tsx`** - Vista de formación
   - Progreso de onboarding
   - Módulos disponibles
   - Certificados obtenidos
   - Evaluaciones

3. **`ModalDetalleTarea.tsx`** - Modal compartido
   - Vista detallada de tarea
   - Historial de cambios
   - Comentarios trabajador/gerente

### Mejoras Futuras
- [ ] Asignación masiva de tareas
- [ ] Templates de tareas recurrentes
- [ ] Firma digital en tareas críticas
- [ ] Gamificación (puntos por completar formación)
- [ ] Estadísticas avanzadas por trabajador
- [ ] Exportación de reportes

---

## 🐛 Testing

Ver archivo: `/examples/ejemplo-uso-tareas.ts`

Contiene 14 ejemplos completos de uso de todos los flujos.

---

## 📚 Referencias

### Archivos del Sistema
```
/services/
  ├── task-management.service.ts      ← Servicio base
  ├── tareas-operativas.service.ts    ← Wrapper tareas
  └── formacion.service.ts            ← Wrapper formación

/components/gerente/
  └── GestionTareasOperativas.tsx     ← UI Gerente

/examples/
  └── ejemplo-uso-tareas.ts           ← 14 ejemplos de uso
```

### Tipos TypeScript
```typescript
// Ver definiciones completas en:
- TareaBase
- CrearTareaOperativaParams
- CrearModuloFormacionParams
- CompletarTareaParams
- AprobarTareaParams
- FiltrosTareas
```

---

## ✅ Checklist de Implementación

- [x] Servicio base creado
- [x] Wrappers específicos creados
- [x] Sistema de notificaciones integrado
- [x] Componente UI del gerente
- [x] Componente UI tareas del trabajador
- [x] Componente UI formación del trabajador
- [x] Ejemplos de uso documentados
- [x] Documentación completa
- [ ] Tests unitarios
- [ ] Tests E2E
- [ ] Migración de datos mock a backend real

---

## 🎉 ¡Listo para Usar!

El sistema está **100% funcional** con datos mock en localStorage. 

Para conectar con backend real:
1. Cambiar `localStorage` por llamadas API en los servicios
2. Mantener las mismas interfaces TypeScript
3. El resto del código no necesita cambios

---

**Creado:** Diciembre 2024  
**Versión:** 1.0.0  
**Estado:** ✅ Producción (mock)