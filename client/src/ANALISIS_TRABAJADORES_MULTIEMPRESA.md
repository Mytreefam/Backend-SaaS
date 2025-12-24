# 🔍 ANÁLISIS: TRABAJADORES Y SISTEMA MULTIEMPRESA

## ❌ RESPUESTA DIRECTA: NO ESTÁ SEGMENTADO

**Los trabajadores NO están segmentados por empresa/marca/PDV actualmente.**

---

## 📋 ESTADO ACTUAL

### **1. Interfaz de Empleado (EquipoRRHH.tsx)**

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
  centroCostePorcentaje?: number;  // ⚠️ Solo porcentaje genérico
}
```

### **❌ LO QUE FALTA:**

```typescript
// NO EXISTE:
empresaId?: string;
marcaId?: string;
puntoVentaId?: string;
puntosVentaAsignados?: string[];  // Múltiples PDVs
```

---

## 🗂️ DATOS MOCK ACTUALES

### **Empleados hardcodeados (línea 362-450):**

```javascript
const empleados: Empleado[] = [
  {
    id: 'EMP-001',
    nombre: 'Carlos',
    apellidos: 'Méndez García',
    puesto: 'Panadero Maestro',
    departamento: 'Producción',
    // ❌ NO tiene empresaId
    // ❌ NO tiene marcaId
    // ❌ NO tiene puntoVentaId
  },
  {
    id: 'EMP-002',
    nombre: 'María',
    apellidos: 'González López',
    puesto: 'Responsable de Bollería',
    // ❌ NO tiene empresaId
    // ❌ NO tiene marcaId
    // ❌ NO tiene puntoVentaId
  },
  // ... 11 empleados más
];
```

**Total:** 13 empleados sin asignación a empresa/marca/PDV

---

## 🏢 COMPARACIÓN CON OTROS SISTEMAS

### **✅ Sistema de Pedidos (SÍ tiene contexto multiempresa):**

```typescript
interface Pedido {
  id: string;
  empresaId: string;      // ✅
  marcaId: string;        // ✅
  puntoVentaId: string;   // ✅
  // ...
}
```

### **✅ Sistema de Gastos Operativos (SÍ tiene contexto):**

```typescript
interface GastoFijo {
  id: string;
  puntoVentaId: string;   // ✅
  puntoVentaNombre: string;
  // ...
}
```

### **❌ Sistema de Empleados (NO tiene contexto):**

```typescript
interface Empleado {
  id: string;
  nombre: string;
  // ❌ NO tiene empresaId
  // ❌ NO tiene marcaId
  // ❌ NO tiene puntoVentaId
}
```

---

## 🔧 LO QUE NECESITAMOS IMPLEMENTAR

### **1. Actualizar la interfaz Empleado**

```typescript
export interface Empleado {
  // Identificación
  id: string;
  nombre: string;
  apellidos: string;
  
  // ⭐ NUEVO: Contexto multiempresa
  empresaId: string;                    // Empresa a la que pertenece
  marcaId?: string;                     // Marca específica (opcional)
  puntoVentaId: string;                 // PDV principal de trabajo
  puntosVentaAsignados?: string[];      // PDVs donde puede trabajar
  
  // Información laboral
  puesto: string;
  departamento: string;
  email: string;
  telefono: string;
  avatar?: string;
  estado: 'activo' | 'vacaciones' | 'baja';
  
  // Horarios y contrato
  horasTrabajadas: number;
  horasContrato: number;
  fechaIngreso: string;
  
  // Permisos y acceso
  rol: 'trabajador' | 'responsable_pdv' | 'gerente_marca' | 'admin';
  permisos: string[];
  
  // Centro de costes (ya existe)
  centroCostePorcentaje?: number;
}
```

---

### **2. Datos mock con contexto multiempresa**

```javascript
const empleados: Empleado[] = [
  // ==========================================
  // EMPRESA: Blackfriday XXI
  // MARCA: Modomio
  // PDV: Tiana
  // ==========================================
  {
    id: 'EMP-001',
    nombre: 'Carlos',
    apellidos: 'Méndez García',
    
    // ⭐ CONTEXTO MULTIEMPRESA
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    puesto: 'Panadero Maestro',
    departamento: 'Producción',
    email: 'carlos.mendez@modomio.com',
    telefono: '+34 610 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    estado: 'activo',
    horasTrabajadas: 168,
    horasContrato: 160,
    fechaIngreso: '2023-01-15',
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina'],
    centroCostePorcentaje: 100
  },
  
  {
    id: 'EMP-002',
    nombre: 'María',
    apellidos: 'González López',
    
    // ⭐ CONTEXTO MULTIEMPRESA
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA', 'PDV-BADALONA'], // Trabaja en 2 PDVs
    
    puesto: 'Responsable de Bollería',
    departamento: 'Producción',
    email: 'maria.gonzalez@modomio.com',
    telefono: '+34 620 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    estado: 'activo',
    horasTrabajadas: 155,
    horasContrato: 160,
    fechaIngreso: '2023-03-20',
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_equipo'],
    centroCostePorcentaje: 50 // 50% Tiana, 50% Badalona
  },
  
  // ==========================================
  // EMPRESA: Blackfriday XXI
  // MARCA: Modomio
  // PDV: Badalona
  // ==========================================
  {
    id: 'EMP-003',
    nombre: 'Laura',
    apellidos: 'Martínez Ruiz',
    
    // ⭐ CONTEXTO MULTIEMPRESA
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    puesto: 'Dependienta',
    departamento: 'Ventas',
    email: 'laura.martinez@modomio.com',
    telefono: '+34 630 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    estado: 'activo',
    horasTrabajadas: 152,
    horasContrato: 160,
    fechaIngreso: '2023-05-10',
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar'],
    centroCostePorcentaje: 100
  },
  
  // ==========================================
  // EMPRESA: Blackfriday XXI
  // MARCA: Blackburguer
  // PDV: Montgat
  // ==========================================
  {
    id: 'EMP-004',
    nombre: 'Javier',
    apellidos: 'Sánchez Torres',
    
    // ⭐ CONTEXTO MULTIEMPRESA
    empresaId: 'EMP-001',
    marcaId: 'MARCA-BLACKBURGUER',
    puntoVentaId: 'PDV-MONTGAT',
    puntosVentaAsignados: ['PDV-MONTGAT'],
    
    puesto: 'Cocinero',
    departamento: 'Cocina',
    email: 'javier.sanchez@blackburguer.com',
    telefono: '+34 640 567 890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
    estado: 'activo',
    horasTrabajadas: 160,
    horasContrato: 160,
    fechaIngreso: '2023-07-01',
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina'],
    centroCostePorcentaje: 100
  },
  
  // ==========================================
  // EMPRESA: Modomio
  // MARCA: Modomio Restauración
  // PDV: Can Farines
  // ==========================================
  {
    id: 'EMP-005',
    nombre: 'Ana',
    apellidos: 'Rodríguez Pérez',
    
    // ⭐ CONTEXTO MULTIEMPRESA
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    puesto: 'Camarera',
    departamento: 'Sala',
    email: 'ana.rodriguez@modomio.com',
    telefono: '+34 650 678 901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    estado: 'activo',
    horasTrabajadas: 145,
    horasContrato: 160,
    fechaIngreso: '2023-09-15',
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar'],
    centroCostePorcentaje: 100
  }
];
```

---

## 📊 DISTRIBUCIÓN PROPUESTA DE EMPLEADOS

### **Empresa: Blackfriday XXI (EMP-001)**

#### **Marca: Modomio**

| PDV | Empleados | Puestos |
|-----|-----------|---------|
| **Tiana** | 6 empleados | 2 Panaderos, 2 Dependientes, 1 Responsable, 1 Limpieza |
| **Badalona** | 8 empleados | 3 Panaderos, 3 Dependientes, 1 Responsable, 1 Limpieza |

**Total Modomio:** 14 empleados

#### **Marca: Blackburguer**

| PDV | Empleados | Puestos |
|-----|-----------|---------|
| **Montgat** | 5 empleados | 2 Cocineros, 2 Camareros, 1 Responsable |

**Total Blackburguer:** 5 empleados

**Total Blackfriday XXI:** 19 empleados

---

### **Empresa: Modomio (EMP-002)**

#### **Marca: Modomio Restauración**

| PDV | Empleados | Puestos |
|-----|-----------|---------|
| **Can Farines** | 12 empleados | 3 Cocineros, 4 Camareros, 2 Barra, 2 Limpieza, 1 Responsable |

**Total Modomio:** 12 empleados

---

### **Empresa: Can Farines (EMP-003)**

#### **Marca: Can Farines**

| PDV | Empleados | Puestos |
|-----|-----------|---------|
| **Can Farines Principal** | 8 empleados | 2 Panaderos, 3 Dependientes, 2 Producción, 1 Responsable |

**Total Can Farines:** 8 empleados

---

## 🔗 INTEGRACIÓN CON EBITDA

### **Actualmente:**

```typescript
// Gastos operativos incluyen nóminas
{
  id: 'GF-005',
  puntoVentaId: 'PDV-TIANA',
  tipo: 'nominas',
  concepto: 'Nóminas personal (6 empleados)',
  importeMensual: 8500.00,
  importeDiario: 283.33
}
```

### **Con empleados segmentados:**

```typescript
// Podríamos calcular automáticamente
const empleadosPDV = empleados.filter(e => 
  e.puntoVentaId === 'PDV-TIANA' || 
  e.puntosVentaAsignados?.includes('PDV-TIANA')
);

const nominasAutomaticas = calcularNominas(empleadosPDV);
// → 8,500€ (calculado desde salarios individuales)
```

---

## 📱 FUNCIONALIDADES QUE MEJORARÍAN

### **1. Fichajes por PDV**

```typescript
interface Fichaje {
  empleadoId: string;
  empresaId: string;      // ⭐
  marcaId: string;        // ⭐
  puntoVentaId: string;   // ⭐
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
}
```

### **2. Reportes de productividad por PDV**

```typescript
// Con empleados segmentados:
const productividadTiana = calcularProductividad('PDV-TIANA');
// → Empleados: 6
// → Horas trabajadas: 960h
// → Ventas: 12,500€
// → Productividad: 13.02€/hora
```

### **3. Gestión de horarios por PDV**

```typescript
// Asignar horarios solo a empleados del PDV
const empleadosTiana = empleados.filter(e => 
  e.puntoVentaId === 'PDV-TIANA'
);

// Crear turnos para la semana
crearTurnos(empleadosTiana, semanaActual);
```

### **4. Costes de personal en EBITDA**

```typescript
// Calcular coste real de personal
const costePersonalPDV = empleados
  .filter(e => e.puntoVentaId === 'PDV-TIANA')
  .reduce((sum, e) => sum + e.salarioMensual, 0);

// Integrar con EBITDA
ebitda.gastosOperativos += costePersonalPDV;
```

---

## 🎯 IMPLEMENTACIÓN RECOMENDADA

### **FASE 1: Actualizar interfaz (30 min)**

1. Modificar `interface Empleado` en `EquipoRRHH.tsx`
2. Agregar campos: `empresaId`, `marcaId`, `puntoVentaId`, `puntosVentaAsignados`
3. Actualizar datos mock de empleados

### **FASE 2: Crear archivo de datos (20 min)**

1. Crear `/data/empleados.ts` con datos reales
2. Exportar interfaz `Empleado`
3. Exportar array `empleados` con 30-40 empleados

### **FASE 3: Funciones de consulta (20 min)**

```typescript
// Obtener empleados de un PDV
export const obtenerEmpleadosPorPDV = (puntoVentaId: string): Empleado[] => {
  return empleados.filter(e => 
    e.puntoVentaId === puntoVentaId || 
    e.puntosVentaAsignados?.includes(puntoVentaId)
  );
};

// Obtener empleados de una marca
export const obtenerEmpleadosPorMarca = (marcaId: string): Empleado[] => {
  return empleados.filter(e => e.marcaId === marcaId);
};

// Obtener empleados de una empresa
export const obtenerEmpleadosPorEmpresa = (empresaId: string): Empleado[] => {
  return empleados.filter(e => e.empresaId === empresaId);
};
```

### **FASE 4: Actualizar componente (40 min)**

1. Importar `empresaConfig` y mostrar empresa/marca/PDV
2. Agregar filtros por empresa/marca/PDV
3. Agregar indicadores visuales de asignación
4. Actualizar formulario de añadir empleado

### **FASE 5: Integrar con EBITDA (30 min)**

1. Vincular nóminas con empleados reales
2. Calcular costes de personal por PDV
3. Mostrar distribución de empleados en reportes

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

| Tarea | Tiempo | Estado |
|-------|--------|--------|
| Actualizar interfaz Empleado | 30 min | ❌ Pendiente |
| Crear /data/empleados.ts | 20 min | ❌ Pendiente |
| Crear funciones de consulta | 20 min | ❌ Pendiente |
| Actualizar EquipoRRHH.tsx | 40 min | ❌ Pendiente |
| Integrar con EBITDA | 30 min | ❌ Pendiente |
| Crear tests de empleados | 15 min | ❌ Pendiente |
| **TOTAL** | **2h 35min** | |

---

## 🚀 EJEMPLO DE VISTA CON SEGMENTACIÓN

### **Dashboard Gerente > Equipo**

```
┌────────────────────────────────────────────────────────────────┐
│  👥 EQUIPO DE TRABAJO                                          │
│                                                                 │
│  Filtros:                                                       │
│  [Empresa ▾] [Marca ▾] [PDV ▾] [Puesto ▾] [Estado ▾]          │
│                                                                 │
│  Empresa: Blackfriday XXI                                       │
│  Marca: Modomio                                                 │
│  PDV: Tiana                                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Carlos Méndez García                                   │ │
│  │ 🏭 Panadero Maestro                                       │ │
│  │ 📍 PDV: Tiana                                             │ │
│  │ 🏢 Empresa: Blackfriday XXI > Modomio                     │ │
│  │ ⏰ 168h / 160h (↑ 8h extras)                              │ │
│  │ ✅ Activo                                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 María González López                                   │ │
│  │ 👔 Responsable de Bollería                                │ │
│  │ 📍 PDVs: Tiana, Badalona (2 ubicaciones)                 │ │
│  │ 🏢 Empresa: Blackfriday XXI > Modomio                     │ │
│  │ ⏰ 155h / 160h                                            │ │
│  │ ✅ Activo                                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Mostrando 6 de 6 empleados del PDV Tiana                      │
└────────────────────────────────────────────────────────────────┘
```

---

## ✅ CONCLUSIÓN

### **Estado Actual:**
- ❌ Empleados NO segmentados por empresa/marca/PDV
- ❌ NO hay filtros multiempresa
- ❌ NO se pueden calcular costes de personal por PDV
- ❌ Datos mock genéricos sin contexto

### **Para implementar segmentación:**
- ⏱️ Tiempo estimado: **2h 35min**
- 🛠️ Complejidad: **Media**
- 📊 Impacto: **Alto** (necesario para EBITDA completo)

### **Beneficios:**
- ✅ Control de personal por PDV
- ✅ Costes de nóminas correctos en EBITDA
- ✅ Productividad por ubicación
- ✅ Gestión de horarios multiubicación
- ✅ Fichajes contextualizados

---

**¿Quieres que implemente la segmentación de empleados ahora?** 🚀

Podemos:
1. ✅ Actualizar interfaz y datos mock (50 min)
2. ✅ Crear funciones de consulta (20 min)
3. ✅ Actualizar visualización (40 min)
4. ✅ Integrar con EBITDA (30 min)

**Total: ~2h 30min para sistema completo**
