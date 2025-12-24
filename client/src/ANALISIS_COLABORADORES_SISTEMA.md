# 🔍 ANÁLISIS COMPLETO: COLABORADORES EN SISTEMA MULTIEMPRESA

## 📌 TERMINOLOGÍA EN EL SISTEMA

### **Nombres utilizados actualmente:**

| Término | Dónde se usa | Contexto |
|---------|--------------|----------|
| **Colaborador** | Componentes `/components/FichajeColaborador.tsx` | Fichaje, formación, soporte, tareas, incidencias |
| **Trabajador** | Dashboard principal `/components/TrabajadorDashboard.tsx` | Dashboard completo, sección de trabajador |
| **Empleado** | `/components/gerente/EquipoRRHH.tsx` | Gestión de RRHH, nóminas, permisos |
| **Equipo** | `/components/gerente/EquipoRRHH.tsx` | Vista de equipo en dashboard gerente |
| **Personal** | `/components/gerente/PersonalRRHH.tsx` | Vista simplificada de personal |

### **✅ CONCLUSIÓN: NOMENCLATURA MIXTA**

```
ROL DEL SISTEMA: "trabajador"
├─ Dashboard: TrabajadorDashboard
├─ Componentes específicos: *Colaborador.tsx
│  ├─ FichajeColaborador
│  ├─ FormacionColaborador
│  ├─ TareasColaborador
│  ├─ SoporteColaborador
│  └─ IncidenciasColaborador
│
└─ Vista Gerente: "Empleado" / "Equipo"
   ├─ EquipoRRHH → Gestión completa
   └─ PersonalRRHH → Vista simplificada
```

---

## 🏗️ ARQUITECTURA ACTUAL

### **1. Componentes de Colaborador (17 archivos)**

#### **Carpeta `/components/` (nivel raíz - 6 archivos):**
```
✅ FichajeColaborador.tsx      → Sistema de fichaje con pausas
✅ FormacionColaborador.tsx    → Cursos y formación
✅ IncidenciasColaborador.tsx  → Gestión de incidencias
✅ SoporteColaborador.tsx      → Ayuda y soporte
✅ TareasColaborador.tsx       → Gestión de tareas
✅ TrabajadorDashboard.tsx     → Dashboard principal
```

#### **Carpeta `/components/trabajador/` (22 archivos):**
```
✅ InicioTrabajador.tsx         → Página de inicio
✅ TareasTrabajador.tsx         → Lista de tareas
✅ AgendaTrabajador.tsx         → Calendario y horarios
✅ FichajeTrabajador.tsx        → Fichaje avanzado
✅ MaterialTrabajador.tsx       → Gestión de material
✅ ChatTrabajador.tsx           → Chat interno
✅ ChatColaborador.tsx          → Chat (duplicado?)
✅ ReportesTrabajador.tsx       → Reportes y estadísticas
✅ FormacionTrabajador.tsx      → Formación (duplicado?)
✅ DocumentacionTrabajador.tsx  → Documentos laborales
✅ DocumentacionLaboral.tsx     → Documentos (duplicado?)
✅ NotificacionesTrabajador.tsx → Notificaciones
✅ ConfiguracionTrabajador.tsx  → Configuración
✅ PedidosTrabajador.tsx        → Gestión de pedidos
✅ SoporteTrabajador.tsx        → Soporte (duplicado?)
✅ ConteoInventario.tsx         → Inventario
✅ TPVLosPecados.tsx            → TPV específico
✅ ModalDetallePedido.tsx       → Modal pedido
✅ ModalesMovimientosStock.tsx  → Movimientos stock
✅ RecepcionMaterialModal.tsx   → Recepción material
✅ AñadirMaterialModal.tsx      → Añadir material
✅ CompletarTareaModal.tsx      → Completar tarea
✅ EstadoTPVModal.tsx           → Estado TPV
```

#### **Componentes del Gerente para gestión de equipo:**
```
✅ /components/gerente/EquipoRRHH.tsx       → Gestión completa de RRHH
✅ /components/gerente/PersonalRRHH.tsx     → Vista simplificada
✅ /components/gerente/ModalInvitarEmpleado.tsx
✅ /components/gerente/ModalPermisosEmpleado.tsx
✅ /components/gerente/InvitacionesPendientes.tsx
```

---

## 🔍 ESTADO ACTUAL: INTERFACES

### **1. Interface en EquipoRRHH.tsx (GESTIÓN GERENTE)**

```typescript
interface Empleado {
  id: string;
  nombre: string;
  apellidos: string;
  puesto: string;
  departamento: string;
  email: string;
  telefono: string;
  avatar?: string;
  estado: 'activo' | 'vacaciones' | 'baja';
  horasTrabajadas: number;
  horasContrato: number;
  fechaIngreso: string;
  centroCostePorcentaje?: number;
  
  // ❌ NO TIENE:
  // empresaId
  // marcaId
  // puntoVentaId
  // puntosVentaAsignados
}
```

### **2. Interface en PersonalRRHH.tsx (VISTA SIMPLIFICADA)**

```typescript
interface Empleado {
  id: string;
  nombre: string;
  foto: string;
  puesto: 'Panadero' | 'Cajero' | 'Repartidor';
  desempeño: number;
  horasMes: string;
  estado: 'activo' | 'inactivo';
  ultimoFichaje: string;
  horaEntrada?: string;
  horaSalida?: string;
  
  // ❌ NO TIENE:
  // empresaId
  // marcaId
  // puntoVentaId
}
```

### **3. Interface en FichajeColaborador.tsx**

```typescript
interface FichajeActivo {
  id: string;
  userId: string;
  empresaId: string;
  marcaId: string;
  puntoVentaId: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string | null;
  pausas: Pausa[];
  observaciones: string;
}

// ✅ ESTE SÍ TIENE CONTEXTO MULTIEMPRESA!
```

---

## 📊 ANÁLISIS: ¿QUÉ TIENE CONTEXTO MULTIEMPRESA?

| Componente | Tiene empresaId | Tiene marcaId | Tiene puntoVentaId | Estado |
|-----------|-----------------|---------------|-------------------|--------|
| **FichajeColaborador** | ✅ | ✅ | ✅ | Completo |
| **EquipoRRHH (Empleado)** | ❌ | ❌ | ❌ | Falta |
| **PersonalRRHH (Empleado)** | ❌ | ❌ | ❌ | Falta |
| **Fichaje (interface)** | ✅ | ✅ | ✅ | Completo |
| **GastoEquipo** | ❌ | ❌ | ❌ | Falta |
| **RegistroHorario** | ❌ | ❌ | ❌ | Falta |

### **✅ LO QUE SÍ FUNCIONA:**

```typescript
// FichajeColaborador - Líneas 70-81
interface FichajeActivo {
  id: string;
  userId: string;
  empresaId: string;      // ✅
  marcaId: string;        // ✅
  puntoVentaId: string;   // ✅
  fecha: string;
  horaEntrada: string;
  horaSalida: string | null;
  pausas: Pausa[];
  observaciones: string;
}
```

**Los fichajes YA están contextualizados por PDV!** 🎉

### **❌ LO QUE FALTA:**

```typescript
// EquipoRRHH.tsx - Empleados
interface Empleado {
  id: string;
  nombre: string;
  // ❌ NO tiene empresaId
  // ❌ NO tiene marcaId
  // ❌ NO tiene puntoVentaId
}
```

**Los empleados NO están contextualizados!** ⚠️

---

## 🎯 DATOS MOCK ACTUALES

### **EquipoRRHH.tsx (línea 362-450):**

```javascript
const empleados: Empleado[] = [
  {
    id: 'EMP-001',
    nombre: 'Carlos',
    apellidos: 'Méndez García',
    puesto: 'Panadero Maestro',
    departamento: 'Producción',
    email: 'carlos.mendez@canfarines.com',
    telefono: '+34 610 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    estado: 'activo',
    horasTrabajadas: 168,
    horasContrato: 160,
    fechaIngreso: '2023-01-15',
    centroCostePorcentaje: 70
    // ❌ NO tiene empresaId
    // ❌ NO tiene marcaId
    // ❌ NO tiene puntoVentaId
  },
  // ... 12 empleados más (total 13)
];
```

---

## 🏢 INTEGRACIÓN CON SISTEMA MULTIEMPRESA

### **Contexto del sistema:**

```typescript
// /constants/empresaConfig.ts

EMPRESAS = {
  'EMP-001': { nombreFiscal: 'Blackfriday XXI', cif: 'B12345678' },
  'EMP-002': { nombreFiscal: 'Modomio', cif: 'B87654321' },
  'EMP-003': { nombreFiscal: 'Can Farines', cif: 'B11223344' }
}

MARCAS = {
  'MARCA-MODOMIO': { nombre: 'Modomio', empresaId: 'EMP-001' },
  'MARCA-BLACKBURGUER': { nombre: 'Blackburguer', empresaId: 'EMP-001' },
  'MARCA-MODOMIO-RESTAURACION': { nombre: 'Modomio Restauración', empresaId: 'EMP-002' },
  'MARCA-CAN-FARINES': { nombre: 'Can Farines', empresaId: 'EMP-003' }
}

PUNTOS_VENTA = {
  'PDV-TIANA': { nombre: 'Tiana', marcaId: 'MARCA-MODOMIO' },
  'PDV-BADALONA': { nombre: 'Badalona', marcaId: 'MARCA-MODOMIO' },
  'PDV-MONTGAT': { nombre: 'Montgat', marcaId: 'MARCA-BLACKBURGUER' },
  'PDV-CAN-FARINES': { nombre: 'Can Farines', marcaId: 'MARCA-MODOMIO-RESTAURACION' }
}
```

---

## 🔧 PROPUESTA DE IMPLEMENTACIÓN

### **OPCIÓN 1: Interface Unificada "Colaborador"**

```typescript
// /types/colaboradores.types.ts

export interface Colaborador {
  // Identificación
  id: string;
  userId: string;                   // Relación con User de autenticación
  
  // ⭐ CONTEXTO MULTIEMPRESA
  empresaId: string;                // Empresa principal
  marcaId?: string;                 // Marca principal (opcional)
  puntoVentaId: string;             // PDV principal de trabajo
  puntosVentaAsignados?: string[];  // Múltiples PDVs
  
  // Datos personales
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  avatar?: string;
  
  // Datos laborales
  puesto: string;
  departamento: string;
  fechaIngreso: string;
  fechaSalida?: string;
  estado: 'activo' | 'vacaciones' | 'baja' | 'suspendido';
  
  // Contrato y horarios
  tipoContrato: 'indefinido' | 'temporal' | 'practicas' | 'formacion';
  horasContrato: number;
  horasTrabajadas: number;
  salarioMensual?: number;
  
  // Permisos y acceso
  rol: 'colaborador' | 'responsable_pdv' | 'coordinador' | 'gerente_marca';
  permisos: string[];
  
  // Centro de costes
  centroCostePorcentaje?: number;
  distribucionCostes?: {
    puntoVentaId: string;
    porcentaje: number;
  }[];
  
  // Documentación
  dni?: string;
  nss?: string;
  direccion?: string;
  fechaNacimiento?: string;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}
```

### **OPCIÓN 2: Reutilizar "Empleado" pero extendido**

```typescript
// Mantener el nombre "Empleado" en EquipoRRHH
// Pero agregar contexto multiempresa

export interface Empleado {
  // ... campos existentes ...
  
  // ⭐ NUEVO: Contexto multiempresa
  empresaId: string;
  marcaId?: string;
  puntoVentaId: string;
  puntosVentaAsignados?: string[];
}
```

---

## 📂 ESTRUCTURA DE ARCHIVOS PROPUESTA

### **Crear archivo centralizado:**

```
/data/
├── colaboradores.ts          ← NUEVO: Datos centralizados
│   ├── interface Colaborador
│   ├── const colaboradores[]
│   └── funciones helper
│
├── gastos-operativos.ts      ← YA EXISTE
└── productos-panaderia.ts    ← YA EXISTE
```

### **Archivo `/data/colaboradores.ts`:**

```typescript
import { 
  EMPRESAS, 
  MARCAS, 
  PUNTOS_VENTA 
} from '../constants/empresaConfig';

export interface Colaborador {
  // ... interfaz completa ...
}

// ============================================
// DATOS MOCK
// ============================================

export const colaboradores: Colaborador[] = [
  // ==========================================
  // EMPRESA: Blackfriday XXI
  // MARCA: Modomio
  // PDV: Tiana
  // ==========================================
  {
    id: 'COL-001',
    userId: 'USER-001',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Carlos',
    apellidos: 'Méndez García',
    email: 'carlos.mendez@modomio.com',
    telefono: '+34 610 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    
    puesto: 'Panadero Maestro',
    departamento: 'Producción',
    fechaIngreso: '2023-01-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 168,
    salarioMensual: 1800,
    
    rol: 'colaborador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'COL-002',
    userId: 'USER-002',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA', 'PDV-BADALONA'], // ⭐ Multi-ubicación
    
    nombre: 'María',
    apellidos: 'González López',
    email: 'maria.gonzalez@modomio.com',
    telefono: '+34 620 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    
    puesto: 'Responsable de Bollería',
    departamento: 'Producción',
    fechaIngreso: '2023-03-20',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 155,
    salarioMensual: 2100,
    
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_equipo'],
    
    distribucionCostes: [
      { puntoVentaId: 'PDV-TIANA', porcentaje: 60 },
      { puntoVentaId: 'PDV-BADALONA', porcentaje: 40 }
    ],
    
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  // ... más colaboradores ...
];

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtener colaboradores por punto de venta
 */
export const obtenerColaboradoresPorPDV = (
  puntoVentaId: string
): Colaborador[] => {
  return colaboradores.filter(col => 
    col.puntoVentaId === puntoVentaId || 
    col.puntosVentaAsignados?.includes(puntoVentaId)
  );
};

/**
 * Obtener colaboradores por marca
 */
export const obtenerColaboradoresPorMarca = (
  marcaId: string
): Colaborador[] => {
  return colaboradores.filter(col => col.marcaId === marcaId);
};

/**
 * Obtener colaboradores por empresa
 */
export const obtenerColaboradoresPorEmpresa = (
  empresaId: string
): Colaborador[] => {
  return colaboradores.filter(col => col.empresaId === empresaId);
};

/**
 * Calcular nómina total de un PDV
 */
export const calcularNominaPDV = (puntoVentaId: string): number => {
  const colsPDV = obtenerColaboradoresPorPDV(puntoVentaId);
  
  return colsPDV.reduce((total, col) => {
    if (col.distribucionCostes) {
      // Si tiene distribución, aplicar porcentaje
      const distribucion = col.distribucionCostes.find(
        d => d.puntoVentaId === puntoVentaId
      );
      const porcentaje = distribucion ? distribucion.porcentaje / 100 : 0;
      return total + ((col.salarioMensual || 0) * porcentaje);
    } else {
      // Si no tiene distribución, asignar 100% si es su PDV principal
      return col.puntoVentaId === puntoVentaId 
        ? total + (col.salarioMensual || 0)
        : total;
    }
  }, 0);
};

/**
 * Obtener resumen de colaboradores por PDV
 */
export const obtenerResumenPDV = (puntoVentaId: string) => {
  const cols = obtenerColaboradoresPorPDV(puntoVentaId);
  
  return {
    totalColaboradores: cols.length,
    activos: cols.filter(c => c.estado === 'activo').length,
    deVacaciones: cols.filter(c => c.estado === 'vacaciones').length,
    deBaja: cols.filter(c => c.estado === 'baja').length,
    nominaTotal: calcularNominaPDV(puntoVentaId),
    horasTotales: cols.reduce((sum, c) => sum + c.horasTrabajadas, 0),
    puestos: [...new Set(cols.map(c => c.puesto))]
  };
};
```

---

## 🔗 INTEGRACIÓN CON EBITDA

### **Antes (gastos fijos manuales):**

```typescript
// /data/gastos-operativos.ts
{
  id: 'GF-005',
  puntoVentaId: 'PDV-TIANA',
  tipo: 'nominas',
  concepto: 'Nóminas personal (6 empleados)',
  importeMensual: 8500.00,  // ⚠️ Hardcodeado
  importeDiario: 283.33
}
```

### **Después (calculado automáticamente):**

```typescript
// Cálculo automático desde colaboradores
const nominaPDV = calcularNominaPDV('PDV-TIANA');
// → 8,500€ (suma de salarios reales)

// Integración con EBITDA
resumen.gastosOperativos = 
  calcularGastosFijosNoNomina(puntoVentaId) +  // Alquiler, luz, etc.
  calcularNominaPDV(puntoVentaId);             // Nóminas calculadas
```

---

## 📊 DISTRIBUCIÓN PROPUESTA DE COLABORADORES

| Empresa | Marca | PDV | Colaboradores | Nómina Mensual |
|---------|-------|-----|---------------|----------------|
| **Blackfriday XXI** | Modomio | Tiana | 6 | 8,500€ |
| **Blackfriday XXI** | Modomio | Badalona | 8 | 10,500€ |
| **Blackfriday XXI** | Blackburguer | Montgat | 5 | 7,200€ |
| **Modomio** | Modomio Restauración | Can Farines | 12 | 15,800€ |
| **Can Farines** | Can Farines | Principal | 8 | 10,200€ |
| **TOTAL** | - | - | **39** | **52,200€** |

---

## ⏱️ PLAN DE IMPLEMENTACIÓN

### **FASE 1: Crear estructura base (30 min)**
- ✅ Crear `/data/colaboradores.ts`
- ✅ Definir interface `Colaborador`
- ✅ Crear funciones helper básicas

### **FASE 2: Migrar datos mock (40 min)**
- ✅ Agregar contexto multiempresa a 39 colaboradores
- ✅ Distribuir por empresa/marca/PDV
- ✅ Asignar salarios realistas

### **FASE 3: Actualizar EquipoRRHH.tsx (30 min)**
- ✅ Importar datos de `/data/colaboradores.ts`
- ✅ Agregar filtros por empresa/marca/PDV
- ✅ Mostrar indicadores de asignación

### **FASE 4: Integrar con EBITDA (20 min)**
- ✅ Calcular nóminas automáticamente
- ✅ Vincular con gastos-operativos.ts
- ✅ Actualizar reportes multiempresa

### **FASE 5: Actualizar componentes (30 min)**
- ✅ PersonalRRHH.tsx
- ✅ Modales de empleados
- ✅ Filtros y búsquedas

**TOTAL: 2h 30min**

---

## ✅ CHECKLIST

| Tarea | Tiempo | Prioridad | Estado |
|-------|--------|-----------|--------|
| Crear `/data/colaboradores.ts` | 30 min | 🔴 Alta | ❌ |
| Definir datos mock (39 colaboradores) | 40 min | 🔴 Alta | ❌ |
| Actualizar EquipoRRHH.tsx | 30 min | 🔴 Alta | ❌ |
| Integrar con EBITDA | 20 min | 🔴 Alta | ❌ |
| Actualizar PersonalRRHH.tsx | 30 min | 🟠 Media | ❌ |
| Tests de funciones | 20 min | 🟡 Baja | ❌ |

---

## 🎯 DECISIÓN NOMENCLATURA

### **Propuesta final:**

```
TÉRMINO OFICIAL: "Colaborador"
├─ Archivo de datos: /data/colaboradores.ts
├─ Interface: Colaborador
├─ Componentes: *Colaborador.tsx (mantener)
├─ Dashboard: TrabajadorDashboard (mantener por compatibilidad)
└─ Vista Gerente: "Equipo" (EquipoRRHH.tsx)
```

**Razón:** 
- ✅ Ya usamos "Colaborador" en 6 componentes principales
- ✅ Es más moderno y profesional que "empleado"
- ✅ Mantiene compatibilidad con código existente
- ✅ El sistema ya lo reconoce (LoginView muestra "Colaborador")

---

## 🚀 PRÓXIMO PASO

**¿Implementamos la arquitectura de colaboradores con contexto multiempresa?**

**Opciones:**

1. ✅ **Implementar completo (2h 30min)**
   - Crear `/data/colaboradores.ts`
   - 39 colaboradores con contexto
   - Funciones helper
   - Integración EBITDA
   - Actualizar componentes

2. ✅ **Implementar base (1h 30min)**
   - Solo estructura y 10-15 colaboradores
   - Funciones básicas
   - Sin integración EBITDA aún

3. ❌ **Posponer**
   - Continuar con otra funcionalidad

---

**¿Qué prefieres?** 🎯
