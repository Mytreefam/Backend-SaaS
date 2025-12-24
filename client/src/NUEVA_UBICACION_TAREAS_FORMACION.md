# ✅ NUEVA UBICACIÓN - TAREAS Y FORMACIÓN

## 🎯 CAMBIO REALIZADO

Los componentes de **Tareas** y **Formación** ahora están **unificados dentro de "Fichajes y Horario"** con tabs para mejor organización.

---

## 📍 NUEVA UBICACIÓN

### Vista TRABAJADOR → "Fichajes y Horario"

```
Dashboard Trabajador → Sidebar → "Fichajes y Horario" (icono ⏰)
```

**Estructura con tabs:**
```
┌────────────────────────────────────────┐
│  FICHAJES Y HORARIO                    │
├────────────────────────────────────────┤
│                                         │
│  TABS:                                  │
│  [⏰ Fichaje] [📋 Tareas] [🎓 Onboarding]│
│                                         │
└────────────────────────────────────────┘
```

---

## 📂 COMPONENTE CREADO

**Archivo:** `/components/trabajador/FichajesHorarioCompleto.tsx`

Este componente unifica:
1. **Tab 1: Fichaje** → `<FichajeColaborador />`
2. **Tab 2: Tareas** → `<TareasTrabajador />`
3. **Tab 3: Onboarding** → `<FormacionTrabajador />`

---

## 🎨 VISTA PREVIA DE LA INTERFAZ

### Tab 1: Fichaje (Original)
```
┌──────────────────────────────────────────┐
│  ⏰ FICHAJE                              │
├──────────────────────────────────────────┤
│  Trabajando en: Badalona                 │
│                                           │
│  Horas Hoy      Horas Semana             │
│  8h 15m         32h 05m                  │
│                                           │
│  ┌────────────────────────────────────┐ │
│  │     00:44:25                        │ │
│  │     Trabajando                      │ │
│  │     [🔴 Fichar Salida]             │ │
│  └────────────────────────────────────┘ │
│                                           │
│  TABS:                                    │
│  [⏰ Franja] [📊 Hoy] [📅 Semanal] [...]│
└──────────────────────────────────────────┘
```

### Tab 2: Tareas (NUEVO)
```
┌──────────────────────────────────────────┐
│  📋 TAREAS                               │
├──────────────────────────────────────────┤
│  Punto de Venta: Tiana                   │
│                                           │
│  ┌─────────┬─────────┬─────────┬───────┐│
│  │ Guion   │ Para    │ En Rev  │ Rechaz││
│  │ del Día │ Reportar│ isión   │ azadas││
│  │   3     │    2    │    1    │   0   ││
│  │ ━━ 66%  │         │         │       ││
│  └─────────┴─────────┴─────────┴───────┘│
│                                           │
│  TABS:                                    │
│  [Guion día] [Para Reportar] [Completadas]│
│                                           │
│  📋 Revisar stock crítico                │
│     [🔴 Alta] [⏰ Pendiente]             │
│     📅 Vence: 10 dic 12:00               │
│     [▶️ Iniciar] [✅ Completar]         │
└──────────────────────────────────────────┘
```

### Tab 3: Onboarding (NUEVO)
```
┌──────────────────────────────────────────┐
│  🎓 ONBOARDING                           │
├──────────────────────────────────────────┤
│  🎓 ONBOARDING INICIAL                   │
│  ━━━━━━━━━━━━━━ 80%                     │
│  4 de 5 completados                      │
│                                           │
│  ┌─────────┬─────────┬─────────┬───────┐│
│  │ Pend    │ En Rev  │ Complet │ Punt  ││
│  │   1     │    0    │    4    │  95   ││
│  └─────────┴─────────┴─────────┴───────┘│
│                                           │
│  TABS:                                    │
│  [Onboarding] [Pendientes] [Completados] │
│                                           │
│  1️⃣ ✅ Bienvenida (⭐ 100/100)          │
│  2️⃣ ✅ Uso del TPV (⭐ 95/100)          │
│  3️⃣ 🔵 Seguridad alimentaria            │
│     [🔗 Ver Contenido] [✅ Completar]   │
└──────────────────────────────────────────┘
```

---

## 🚀 CÓMO ACCEDER

### Paso 1: Login como Trabajador
```bash
1. Abrir la aplicación
2. Login → Perfil: Trabajador
3. Email: demo@empresa.com
```

### Paso 2: Navegar a "Fichajes y Horario"
```bash
OPCIÓN A (Desktop):
  → Sidebar izquierda → "Fichajes y Horario" (icono ⏰)

OPCIÓN B (Móvil):
  → Bottom navigation → "Fichaje" (icono ⏰)
```

### Paso 3: Cambiar entre tabs
```bash
Una vez dentro, verás 3 tabs arriba:
  → [⏰ Fichaje] [📋 Tareas] [🎓 Onboarding]
  
Haz clic en:
  - "Tareas" → Ver tareas operativas
  - "Onboarding" → Ver formación
```

---

## 🔄 FLUJO DE NAVEGACIÓN COMPLETO

```
┌─────────────────────────────────────────┐
│  📱 DASHBOARD TRABAJADOR                │
├─────────────────────────────────────────┤
│                                          │
│  SIDEBAR (Desktop):                      │
│  • Inicio                                │
│  • TPV 360                               │
│  • Pedidos                               │
│  • Repartidor                            │
│  • Onboarding                            │
│  • Chats                                 │
│  • Productos                             │
│  ▶ ⏰ Fichajes y Horario  ← CLIC AQUÍ  │
│  • Formación y Documentación             │
│  • Notificaciones                        │
│  • Configuración                         │
└─────────────────────────────────────────┘
              │
              ▼ CLIC EN "Fichajes y Horario"
┌─────────────────────────────────────────┐
│  FICHAJES Y HORARIO                     │
├─────────────────────────────────────────┤
│                                          │
│  TABS:                                   │
│  ┌────────┬─────────┬──────────────┐   │
│  │ Fichaje│ Tareas  │ Onboarding   │   │
│  │   ⏰   │   📋    │     🎓      │   │
│  └────────┴─────────┴──────────────┘   │
│     ▲         ▲            ▲            │
│     │         │            │            │
│  Reloj &   Sistema    Formación &      │
│  Historial  Tareas    Certificados     │
└─────────────────────────────────────────┘
```

---

## 📊 DATOS QUE FLUYEN EN CADA TAB

### Tab "Tareas"
```typescript
✅ Guion del día (informativas)
✅ Tareas para reportar (con evidencias)
✅ Tareas en revisión
✅ Tareas rechazadas con feedback
✅ Historial de completadas
```

### Tab "Onboarding"
```typescript
✅ Progreso de onboarding (%)
✅ Módulos pendientes
✅ Módulos en revisión
✅ Módulos completados
✅ Certificados disponibles
✅ Puntuación media
```

---

## 🎯 VENTAJAS DE LA NUEVA ORGANIZACIÓN

### ✅ Mejor UX
- Todo relacionado con el trabajo diario en un solo lugar
- Navegación más intuitiva
- Menos clicks para acceder

### ✅ Coherencia Conceptual
```
Fichajes y Horario:
  ├─ Reloj → Control de jornada
  ├─ Tareas → Trabajo del día
  └─ Onboarding → Formación continua
```

### ✅ Responsive
```
Desktop:  3 tabs horizontales
Móvil:    3 tabs apilados (mismo diseño)
```

---

## 🔧 ARCHIVOS MODIFICADOS

### Nuevo Componente:
```
✅ /components/trabajador/FichajesHorarioCompleto.tsx
```

### Modificados:
```
✅ /components/TrabajadorDashboard.tsx
   - Cambió ref de FichajeColaborador a FichajesHorarioCompleto
   - Ahora renderiza el componente unificado
```

### Sin cambios (se reutilizan):
```
✅ /components/trabajador/TareasTrabajador.tsx
✅ /components/trabajador/FormacionTrabajador.tsx
✅ /components/FichajeColaborador.tsx
```

---

## 🧪 CÓMO PROBAR

### Prueba 1: Ver Fichaje (5 segundos)
```
1. Login como Trabajador
2. Sidebar → "Fichajes y Horario"
3. Tab "Fichaje" (por defecto)
4. Ver reloj funcionando
```

### Prueba 2: Ver Tareas (10 segundos)
```
1. Mismo lugar → Tab "Tareas"
2. Ver guion del día
3. Ver tareas para reportar
4. Clic en [Completar Tarea] para probar modal
```

### Prueba 3: Ver Onboarding (10 segundos)
```
1. Mismo lugar → Tab "Onboarding"
2. Ver progreso 80%
3. Ver módulos completados
4. Clic en [Completar Módulo] para probar evaluación
```

---

## 📱 NAVEGACIÓN MÓVIL

### Bottom Navigation (Móvil)
```
┌─────────────────────────────────────────┐
│                                          │
│  [TPV] [Pedidos] [Chat] [Productos] [⏰]│
│                                    ▲     │
│                                    │     │
│                         Clic aquí para   │
│                         Fichajes y Horario│
└─────────────────────────────────────────┘
```

Una vez dentro, los 3 tabs funcionan igual que en desktop.

---

## 🎉 ESTADO ACTUAL

```
✅ Componente FichajesHorarioCompleto creado
✅ Integrado en TrabajadorDashboard
✅ Tab "Fichaje" funcionando
✅ Tab "Tareas" funcionando
✅ Tab "Onboarding" funcionando
✅ Refs funcionando (botón fichar desde sidebar)
✅ Parámetros correctos pasados a cada componente
✅ Responsive en móvil y desktop
```

---

## 📝 NOTAS TÉCNICAS

### Forwarding Refs
El componente mantiene la funcionalidad de refs para que el botón rápido "Fichar Entrada/Salida" del sidebar siga funcionando:

```typescript
fichajesRef.current?.estaFichado()
fichajesRef.current?.abrirModalFichaje()
fichajesRef.current?.fichajarSalida()
```

### Props Dinámicos
Se pasan los IDs reales del trabajador logueado:

```typescript
<FichajesHorarioCompleto
  trabajadorId={user.id}
  trabajadorNombre={user.name}
  puntoVentaId={puntoVentaActivo || undefined}
  puntoVentaNombre={getNombrePDVConMarcas(...)}
/>
```

---

**Creado:** Diciembre 2024  
**Estado:** ✅ Implementado y funcional  
**Ubicación:** Dashboard Trabajador → Fichajes y Horario → Tabs
