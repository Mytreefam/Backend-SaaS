# 🏢 INTEGRACIÓN COMPLETA - MÓDULO EQUIPO Y RRHH

**Proyecto:** Udar Edge 2.0  
**Módulo:** Equipo y RRHH  
**Versión:** 2.0  
**Fecha:** 26 Noviembre 2024  
**Estado:** ✅ Frontend Completo - Backend en Integración

---

## 📋 ÍNDICE

1. [Contexto General](#contexto-general)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Conexiones y Botones](#conexiones-y-botones)
4. [Cálculos Internos](#cálculos-internos)
5. [Escenarios Make](#escenarios-make)
6. [Vinculación Figma](#vinculación-figma)
7. [Endpoints API](#endpoints-api)
8. [Checklist de Integración](#checklist-de-integración)

---

## 📌 CONTEXTO GENERAL

### Módulo Incluye:

- ✅ Listado de empleados
- ✅ Añadir empleado
- ✅ Modificaciones (3 pestañas)
- ✅ Horarios y fichajes
- ✅ Consumos internos
- ✅ **KPI mensual** ← NUEVO
- ✅ Documentación
- ✅ Permisos
- ✅ Histórico
- ✅ Centros de coste

### Sistema Multiempresa (Jerarquía):

```
Empresa Madre
  └── Empresa
      └── Marca
          └── Punto de Venta (PDV)
              └── Empleados
```

### Roles Principales:

| Rol | Acceso | Usuario Ejemplo |
|-----|--------|-----------------|
| **Gerente General** | Total (todas empresas) | Pau |
| **Gerente Empresa** | Solo su empresa | - |
| **Gerente Marca** | Solo su marca | - |
| **Gerente PDV** | Solo su PDV | - |
| **Empleado** | App móvil (fichajes, tareas) | - |

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### 1️⃣ Tabla: `empresas`

```sql
CREATE TABLE empresas (
  empresa_id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2️⃣ Tabla: `marcas`

```sql
CREATE TABLE marcas (
  marca_id VARCHAR(50) PRIMARY KEY,
  empresa_id VARCHAR(50) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE
);
```

### 3️⃣ Tabla: `puntos_venta`

```sql
CREATE TABLE puntos_venta (
  pdv_id VARCHAR(50) PRIMARY KEY,
  marca_id VARCHAR(50) NOT NULL,
  empresa_id VARCHAR(50) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  direccion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marca_id) REFERENCES marcas(marca_id) ON DELETE CASCADE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE
);
```

### 4️⃣ Tabla: `empleados` ⭐ PRINCIPAL

```sql
CREATE TABLE empleados (
  empleado_id VARCHAR(50) PRIMARY KEY, -- EMP-001
  empresa_id VARCHAR(50) NOT NULL,
  marca_id VARCHAR(50),
  pdv_id VARCHAR(50) NOT NULL,
  
  -- Datos personales
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(200) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(150),
  dni VARCHAR(20),
  num_ss VARCHAR(50),
  direccion TEXT,
  fecha_nacimiento DATE,
  lugar_nacimiento VARCHAR(200),
  
  -- Datos laborales
  puesto VARCHAR(100),
  departamento VARCHAR(100),
  estado ENUM('activo', 'vacaciones', 'baja') DEFAULT 'activo',
  fecha_ingreso DATE,
  tipo_contrato ENUM('indefinido', 'temporal', 'practicas', 'formacion'),
  fecha_inicio DATE,
  fecha_fin DATE,
  
  -- Jornada
  horas_contrato_mes DECIMAL(5,2),
  horas_contrato_semana DECIMAL(5,2),
  
  -- Salario
  salario_base_mes DECIMAL(10,2),
  complemento_salarial_mes DECIMAL(10,2),
  categoria_profesional VARCHAR(100),
  grupo_cotizacion_ss VARCHAR(20),
  
  -- Avatar
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empresa_id) REFERENCES empresas(empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (marca_id) REFERENCES marcas(marca_id) ON DELETE SET NULL,
  FOREIGN KEY (pdv_id) REFERENCES puntos_venta(pdv_id) ON DELETE CASCADE
);
```

### 5️⃣ Tabla: `centros_coste_empleado`

```sql
CREATE TABLE centros_coste_empleado (
  id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  tipo ENUM('tienda', 'obrador', 'marca', 'empresa') NOT NULL,
  ubicacion VARCHAR(200),
  porcentaje DECIMAL(5,2) NOT NULL, -- 0-100
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  
  -- Validar que la suma de porcentajes = 100%
  CHECK (porcentaje >= 0 AND porcentaje <= 100)
);
```

### 6️⃣ Tabla: `fichajes`

```sql
CREATE TABLE fichajes (
  fichaje_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  hora_entrada TIME,
  hora_salida TIME,
  horas_trabajadas DECIMAL(5,2),
  horas_extra DECIMAL(5,2) DEFAULT 0,
  
  -- Ubicación del fichaje (opcional)
  ubicacion_entrada VARCHAR(200),
  ubicacion_salida VARCHAR(200),
  
  -- Estado
  estado ENUM('en_curso', 'completado', 'pendiente_revision') DEFAULT 'en_curso',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  INDEX idx_empleado_fecha (empleado_id, fecha)
);
```

### 7️⃣ Tabla: `incidencias_rrhh`

```sql
CREATE TABLE incidencias_rrhh (
  incidencia_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  tipo ENUM('retraso', 'ausencia', 'baja_ss', 'otro') NOT NULL,
  descripcion TEXT,
  gravedad ENUM('baja', 'media', 'alta') DEFAULT 'baja',
  estado ENUM('activa', 'resuelta') DEFAULT 'activa',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  INDEX idx_empleado_activas (empleado_id, estado)
);
```

### 8️⃣ Tabla: `documentacion_empleado`

```sql
CREATE TABLE documentacion_empleado (
  documento_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  tipo_documento ENUM('dni', 'nie', 'cuenta_bancaria', 'vida_laboral', 
                      'contrato', 'nomina', 'certificado', 'otro') NOT NULL,
  nombre_archivo VARCHAR(255),
  url TEXT NOT NULL,
  fecha_subida DATE,
  fecha_caducidad DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE
);
```

### 9️⃣ Tabla: `permisos`

```sql
CREATE TABLE permisos (
  permiso_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL UNIQUE,
  
  -- Permisos de sistema
  acceso_sistema BOOLEAN DEFAULT TRUE,
  fichar BOOLEAN DEFAULT TRUE,
  ver_pedidos BOOLEAN DEFAULT FALSE,
  gestionar_pedidos BOOLEAN DEFAULT FALSE,
  gestionar_equipo BOOLEAN DEFAULT FALSE,
  
  -- Control especial
  baja_forzada BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE
);
```

### 🔟 Tabla: `remuneraciones_extra`

```sql
CREATE TABLE remuneraciones_extra (
  remuneracion_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  tipo ENUM('bonus', 'incentivo', 'hora_extra_pagada', 'otro') NOT NULL,
  descripcion TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  INDEX idx_empleado_fecha (empleado_id, fecha)
);
```

### 1️⃣1️⃣ Tabla: `historico_rrhh`

```sql
CREATE TABLE historico_rrhh (
  historico_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo_accion ENUM('alta', 'modificacion', 'baja', 'documento', 
                   'remuneracion', 'incidencia', 'otro') NOT NULL,
  descripcion TEXT,
  datos_anteriores JSON,
  datos_nuevos JSON,
  usuario_responsable VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  INDEX idx_empleado_fecha (empleado_id, fecha)
);
```

### 1️⃣2️⃣ Tabla: `consumos_internos_equipo`

```sql
CREATE TABLE consumos_internos_equipo (
  consumo_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  tipo ENUM('producto', 'material', 'otro') NOT NULL,
  descripcion TEXT,
  cantidad DECIMAL(10,2),
  valor_estimado DECIMAL(10,2),
  estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
  
  -- Centro de coste
  centro_coste_tipo VARCHAR(50),
  centro_coste_ubicacion VARCHAR(200),
  
  aprobado_por VARCHAR(50),
  fecha_aprobacion TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  INDEX idx_empleado_estado (empleado_id, estado)
);
```

### 1️⃣3️⃣ Tabla: `kpis_rrhh` (NUEVA - PARA HISTÓRICO)

```sql
CREATE TABLE kpis_rrhh (
  kpi_id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  mes INT NOT NULL, -- 1-12
  año INT NOT NULL,
  
  -- Horas
  horas_trabajadas DECIMAL(5,2),
  horas_contrato DECIMAL(5,2),
  horas_extra DECIMAL(5,2),
  porcentaje_cumplimiento DECIMAL(5,2),
  
  -- Costes
  coste_laboral_base DECIMAL(10,2),
  coste_remuneraciones_extra DECIMAL(10,2),
  coste_total DECIMAL(10,2),
  coste_por_hora DECIMAL(10,2),
  
  -- Incidencias
  incidencias_total INT DEFAULT 0,
  incidencias_bajas INT DEFAULT 0,
  incidencias_retrasos INT DEFAULT 0,
  incidencias_ausencias INT DEFAULT 0,
  
  -- Puntualidad
  dias_puntuales INT DEFAULT 0,
  dias_totales INT DEFAULT 0,
  puntualidad_porcentaje DECIMAL(5,2),
  
  -- Productividad
  tareas_completadas INT DEFAULT 0,
  
  -- Formación
  horas_formacion DECIMAL(5,2) DEFAULT 0,
  cursos_finalizados INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
  UNIQUE KEY unique_empleado_mes (empleado_id, mes, año),
  INDEX idx_empleado_periodo (empleado_id, año, mes)
);
```

---

## 🔘 CONEXIONES Y BOTONES

### ➤ BOTÓN: Añadir Empleado

**UBICACIÓN:** Dashboard Gerente > Equipo y RRHH > Botón principal "+Añadir Empleado"

**ARCHIVO:** `/components/gerente/EquipoRRHH.tsx`

**MAKE – Trigger:**
```
Webhook: POST /empleados/crear
```

**ACCIONES:**

1. **Crear registro en `empleados`**
   ```json
   {
     "empleado_id": "EMP-001",
     "empresa_id": "EMP-123",
     "marca_id": "MRC-456",
     "pdv_id": "PDV-789",
     "nombre": "Juan",
     "apellidos": "Pérez García",
     "telefono": "+34 666 777 888",
     "email": "juan.perez@empresa.com",
     "puesto": "Barista",
     "departamento": "Producción",
     "estado": "activo",
     "fecha_ingreso": "2024-11-26",
     "tipo_contrato": "indefinido",
     "horas_contrato_mes": 160,
     "salario_base_mes": 1500
   }
   ```

2. **Crear permisos por defecto en `permisos`**
   ```json
   {
     "permiso_id": "PERM-001",
     "empleado_id": "EMP-001",
     "acceso_sistema": true,
     "fichar": true,
     "ver_pedidos": false,
     "gestionar_pedidos": false,
     "gestionar_equipo": false
   }
   ```

3. **Registrar histórico en `historico_rrhh`**
   ```json
   {
     "historico_id": "HIST-001",
     "empleado_id": "EMP-001",
     "tipo_accion": "alta",
     "descripcion": "Alta en la empresa",
     "datos_nuevos": { ...datos_empleado },
     "usuario_responsable": "Pau (Gerente General)"
   }
   ```

4. **Enviar email** (si está activado "Enviar tramitación de alta")
   - A: gestoría@empresa.com
   - CC: pau@empresa.com
   - Asunto: "Nueva alta - Juan Pérez García"
   - Adjunto: Datos del empleado en PDF

**EVENTO FRONTEND:**
```typescript
onClick={() => {
  console.log('🔌 EVENTO: CREAR_EMPLEADO', {
    endpoint: 'POST /empleados/crear',
    payload: formularioNuevoEmpleado,
    timestamp: new Date()
  });
  // Llamada a API
}}
```

---

### ➤ BOTÓN: Modificaciones (3 Pestañas)

**UBICACIÓN:** Modal "Perfil de Empleado" > Botón "Modificaciones"

#### A) Pestaña: Modificaciones (puesto, salario, jornada)

**MAKE – Trigger:**
```
Webhook: PUT /empleados/{id}/modificar
```

**ACCIONES:**

1. **Update en `empleados`**
   ```sql
   UPDATE empleados 
   SET 
     puesto = 'Encargado',
     salario_base_mes = 1800,
     horas_contrato_mes = 160
   WHERE empleado_id = 'EMP-001';
   ```

2. **Insert en `historico_rrhh`**
   ```json
   {
     "tipo_accion": "modificacion",
     "descripcion": "Cambio de puesto: Barista → Encargado",
     "datos_anteriores": { "puesto": "Barista", "salario": 1500 },
     "datos_nuevos": { "puesto": "Encargado", "salario": 1800 }
   }
   ```

3. **Si cambia salario → Recalcular coste mensual**
   ```javascript
   coste_mensual = salario_base + complemento_salarial + SUM(remuneraciones_extra)
   ```

**EVENTO FRONTEND:**
```typescript
console.log('🔌 EVENTO: MODIFICAR_EMPLEADO', {
  empleadoId: 'EMP-001',
  endpoint: 'PUT /empleados/EMP-001/modificar',
  cambios: { puesto, salario, horas },
  timestamp: new Date()
});
```

---

#### B) Pestaña: Finalizaciones

**MAKE – Trigger:**
```
Webhook: PUT /empleados/{id}/finalizar
```

**ACCIONES:**

1. **Cambiar estado → "baja"**
   ```sql
   UPDATE empleados 
   SET 
     estado = 'baja',
     fecha_fin = '2024-12-31'
   WHERE empleado_id = 'EMP-001';
   ```

2. **Registrar en histórico**
   ```json
   {
     "tipo_accion": "baja",
     "descripcion": "Fin de contrato - Voluntario",
     "datos_nuevos": { "estado": "baja", "fecha_fin": "2024-12-31" }
   }
   ```

3. **Make → Envío a gestoría**
   - Email automático con detalles
   - Adjunto: Documentación del empleado

**EVENTO FRONTEND:**
```typescript
console.log('🔌 EVENTO: FINALIZAR_EMPLEADO', {
  empleadoId: 'EMP-001',
  endpoint: 'PUT /empleados/EMP-001/finalizar',
  motivoBaja: 'Voluntario',
  fechaFin: '2024-12-31',
  timestamp: new Date()
});
```

---

#### C) Pestaña: Remuneraciones

**MAKE – Trigger:**
```
Webhook: POST /empleados/{id}/remuneracion
```

**ACCIONES:**

1. **Insert en `remuneraciones_extra`**
   ```json
   {
     "remuneracion_id": "REM-001",
     "empleado_id": "EMP-001",
     "fecha": "2024-11-26",
     "importe": 150,
     "tipo": "bonus",
     "descripcion": "Bonus ventas Noviembre"
   }
   ```

2. **Update KPI automático del mes**
   ```sql
   UPDATE kpis_rrhh 
   SET 
     coste_remuneraciones_extra = coste_remuneraciones_extra + 150,
     coste_total = coste_laboral_base + coste_remuneraciones_extra + 150
   WHERE empleado_id = 'EMP-001' AND mes = 11 AND año = 2024;
   ```

3. **Insert en histórico**
   ```json
   {
     "tipo_accion": "remuneracion",
     "descripcion": "Bonus ventas: +150€"
   }
   ```

**EVENTO FRONTEND:**
```typescript
console.log('🔌 EVENTO: AÑADIR_REMUNERACION', {
  empleadoId: 'EMP-001',
  endpoint: 'POST /empleados/EMP-001/remuneracion',
  remuneracion: { tipo, importe, descripcion },
  timestamp: new Date()
});
```

---

### ➤ BOTÓN: Consumos Internos

**UBICACIÓN:** Modal "Perfil de Empleado" > Pestaña "Histórico" > Sección "Consumos Internos"

**MAKE – Trigger:**
```
Webhook: POST /empleados/{id}/consumo
```

**ACCIONES:**

1. **Insert en `consumos_internos_equipo`**
   ```json
   {
     "consumo_id": "CONS-001",
     "empleado_id": "EMP-001",
     "fecha": "2024-11-26",
     "tipo": "producto",
     "descripcion": "Café espresso",
     "cantidad": 2,
     "valor_estimado": 6,
     "estado": "pendiente"
   }
   ```

2. **Botones ✓ o ✗ actualizan estado**
   
   **Aprobar:**
   ```sql
   UPDATE consumos_internos_equipo 
   SET 
     estado = 'aprobado',
     aprobado_por = 'Pau',
     fecha_aprobacion = NOW()
   WHERE consumo_id = 'CONS-001';
   ```
   
   **Rechazar:**
   ```sql
   UPDATE consumos_internos_equipo 
   SET estado = 'rechazado'
   WHERE consumo_id = 'CONS-001';
   ```

3. **Mover a histórico**
   ```json
   {
     "tipo_accion": "otro",
     "descripcion": "Consumo interno aprobado: Café espresso x2"
   }
   ```

**EVENTOS FRONTEND:**
```typescript
// Crear consumo
console.log('🔌 EVENTO: CREAR_CONSUMO_INTERNO', {
  empleadoId: 'EMP-001',
  endpoint: 'POST /empleados/EMP-001/consumo',
  consumo: { tipo, descripcion, cantidad, valorEstimado },
  timestamp: new Date()
});

// Aprobar
console.log('🔌 EVENTO: APROBAR_CONSUMO', {
  consumoId: 'CONS-001',
  endpoint: 'PUT /consumos/CONS-001/aprobar',
  timestamp: new Date()
});

// Rechazar
console.log('🔌 EVENTO: RECHAZAR_CONSUMO', {
  consumoId: 'CONS-001',
  endpoint: 'PUT /consumos/CONS-001/rechazar',
  timestamp: new Date()
});
```

---

### ➤ BOTÓN: Gestión de Turnos / Fichajes

**UBICACIÓN:** Modal "Perfil de Empleado" > Pestaña "Fichajes"

**MAKE – Trigger (planificación):**
```
Webhook: POST /empleados/{id}/turno
```

**MAKE – Trigger (fichaje real desde app móvil):**
```
Webhook: POST /fichajes/registrar
```

**ACCIONES:**

1. **Insert de horario planificado**
   ```json
   {
     "fichaje_id": "FICH-001",
     "empleado_id": "EMP-001",
     "fecha": "2024-11-26",
     "hora_entrada": "08:00",
     "hora_salida": "16:00",
     "estado": "pendiente_revision"
   }
   ```

2. **Insert automático desde app móvil de fichaje real**
   ```json
   {
     "fichaje_id": "FICH-001",
     "empleado_id": "EMP-001",
     "fecha": "2024-11-26",
     "hora_entrada": "08:05",
     "hora_salida": "16:10",
     "ubicacion_entrada": "PDV Madrid Centro",
     "estado": "completado"
   }
   ```

3. **Cálculo automático:**
   
   **Horas trabajadas:**
   ```javascript
   const entrada = new Date('2024-11-26 08:05');
   const salida = new Date('2024-11-26 16:10');
   const horas_trabajadas = (salida - entrada) / (1000 * 60 * 60); // 8.08h
   ```
   
   **Horas extra:**
   ```javascript
   const horas_contrato_dia = horas_contrato_mes / 20; // 160/20 = 8h
   const horas_extra = Math.max(0, horas_trabajadas - horas_contrato_dia); // 0.08h
   ```
   
   **Comparativa con contrato:**
   ```javascript
   const total_mes = SUM(fichajes.horas_trabajadas WHERE mes = 11);
   const porcentaje = (total_mes / horas_contrato_mes) * 100; // 168/160 = 105%
   ```

**EVENTOS FRONTEND:**
```typescript
// Desde app móvil - Fichar entrada
console.log('🔌 EVENTO: FICHAR_ENTRADA', {
  empleadoId: 'EMP-001',
  endpoint: 'POST /fichajes/entrada',
  ubicacion: geolocation,
  timestamp: new Date()
});

// Desde app móvil - Fichar salida
console.log('🔌 EVENTO: FICHAR_SALIDA', {
  empleadoId: 'EMP-001',
  endpoint: 'PUT /fichajes/{fichajeId}/salida',
  ubicacion: geolocation,
  timestamp: new Date()
});
```

---

### ➤ BOTÓN: Documentación – Añadir documento

**UBICACIÓN:** Modal "Perfil de Empleado" > Pestaña "Documentación" > Botón "Añadir documento"

**MAKE – Trigger:**
```
Webhook: POST /empleados/{id}/documento
```

**ACCIONES:**

1. **Subir archivo → Make lo almacena → guarda URL en tabla**
   ```json
   {
     "documento_id": "DOC-001",
     "empleado_id": "EMP-001",
     "tipo_documento": "dni",
     "nombre_archivo": "DNI_Juan_Perez.pdf",
     "url": "https://storage.udar.com/docs/EMP-001/dni.pdf",
     "fecha_subida": "2024-11-26"
   }
   ```

2. **Insert en histórico**
   ```json
   {
     "tipo_accion": "documento",
     "descripcion": "Documento actualizado: DNI"
   }
   ```

**EVENTO FRONTEND:**
```typescript
console.log('🔌 EVENTO: SUBIR_DOCUMENTO', {
  empleadoId: 'EMP-001',
  endpoint: 'POST /empleados/EMP-001/documento',
  tipoDocumento: 'dni',
  archivo: file,
  timestamp: new Date()
});
```

---

### ➤ BOTÓN: Permisos – Toggle

**UBICACIÓN:** Modal "Perfil de Empleado" > Pestaña "Permisos"

**MAKE – Trigger:**
```
Webhook: PUT /empleados/{id}/permisos
```

**ACCIONES:**

1. **Update directo en tabla `permisos`**
   ```sql
   UPDATE permisos 
   SET fichar = TRUE
   WHERE empleado_id = 'EMP-001';
   ```

2. **Si "Dar de baja" activado:**
   
   a) Cambiar estado a baja
   ```sql
   UPDATE empleados 
   SET estado = 'baja'
   WHERE empleado_id = 'EMP-001';
   ```
   
   b) Registrar en histórico
   ```json
   {
     "tipo_accion": "baja",
     "descripcion": "Baja forzada por gerente"
   }
   ```
   
   c) Enviar notificación Make
   - Email a RRHH
   - Notificación push al empleado

**EVENTO FRONTEND:**
```typescript
console.log('🔌 EVENTO: ACTUALIZAR_PERMISOS', {
  empleadoId: 'EMP-001',
  endpoint: 'PUT /empleados/EMP-001/permisos',
  permisos: { fichar, verPedidos, gestionarPedidos, ... },
  darDeBaja: false,
  timestamp: new Date()
});
```

---

### ➤ BOTÓN: KPI (Nuevo filtro añadido) ⭐

**UBICACIÓN:** Modal "Perfil de Empleado" > Pestaña **"KPI"** (NUEVA)

**MAKE – Trigger principal:**
```
Webhook: GET /empleados/{id}/kpi?mes={mes}&año={año}
```

**INPUTS:**
- `empleado_id`: "EMP-001"
- `mes`: 11 (Noviembre)
- `año`: 2024

**DEVUELVE JSON:**

```json
{
  "empleado_id": "EMP-001",
  "mes": 11,
  "año": 2024,
  "periodo": "Noviembre 2024",
  
  "horas": {
    "trabajadas": 168,
    "contrato": 160,
    "extra": 8,
    "porcentaje": 105
  },
  
  "coste": {
    "laboral_base": 1500,
    "remuneraciones_extra": 150,
    "total": 1650,
    "por_hora": 9.82
  },
  
  "incidencias": {
    "total": 2,
    "bajas": 1,
    "retrasos": 1,
    "ausencias": 0,
    "desglose": [
      {
        "tipo": "baja_ss",
        "fecha": "2024-11-15",
        "descripcion": "Gripe"
      },
      {
        "tipo": "retraso",
        "fecha": "2024-11-20",
        "descripcion": "Retraso 15 min"
      }
    ]
  },
  
  "puntualidad": {
    "porcentaje": 95,
    "dias_puntuales": 19,
    "dias_totales": 20
  },
  
  "productividad": {
    "tareas_completadas": 45,
    "tendencia": 12
  },
  
  "horas_extra_mes": 8,
  
  "formacion": {
    "horas": 12,
    "cursos_finalizados": 3
  },
  
  "historico_meses": [
    {
      "mes": 10,
      "año": 2024,
      "horas_trabajadas": 160,
      "horas_contrato": 160,
      "porcentaje": 100,
      "coste_total": 2400,
      "incidencias": 0,
      "puntualidad": 100
    },
    // ... más meses
  ],
  
  "resumen_anual": {
    "promedio_mensual": 156,
    "coste_total_anual": 28200,
    "incidencias_totales": 3
  }
}
```

**FILTROS EN UI:**
- Selector de mes: Noviembre 2024
- Selector de período: Mes actual / Meses anteriores
- Botón: Exportar KPIs (descarga PDF)

**EVENTO FRONTEND:**
```typescript
// Cambiar mes
console.log('🔌 EVENTO: CAMBIAR_MES_KPI', {
  empleadoId: 'EMP-001',
  endpoint: 'GET /empleados/EMP-001/kpi',
  params: { mes: 10, año: 2024 },
  timestamp: new Date()
});

// Exportar
console.log('🔌 EVENTO: EXPORTAR_KPI_EMPLEADO', {
  empleadoId: 'EMP-001',
  endpoint: 'GET /empleados/EMP-001/kpi/export',
  formato: 'pdf',
  timestamp: new Date()
});
```

---

## 🧮 CÁLCULOS INTERNOS

### 1️⃣ Horas Trabajadas del Mes

**Fórmula:**
```sql
SELECT SUM(horas_trabajadas) as total_horas
FROM fichajes
WHERE empleado_id = 'EMP-001'
  AND MONTH(fecha) = 11
  AND YEAR(fecha) = 2024;
```

**JavaScript:**
```javascript
const horas_trabajadas_mes = fichajes
  .filter(f => f.mes === 11 && f.año === 2024)
  .reduce((sum, f) => sum + f.horas_trabajadas, 0);
```

---

### 2️⃣ Horas Contrato

**Fórmula:**
```sql
SELECT horas_contrato_mes
FROM empleados
WHERE empleado_id = 'EMP-001';
```

**Valor:** 160 horas

---

### 3️⃣ % Cumplimiento

**Fórmula:**
```javascript
const porcentaje_cumplimiento = (horas_trabajadas_mes / horas_contrato_mes) * 100;
// Ejemplo: (168 / 160) * 100 = 105%
```

**Colores en UI:**
- Verde: ≥ 100%
- Amarillo: 90-99%
- Rojo: < 90%

---

### 4️⃣ Coste Laboral Estimado

**Fórmula:**
```javascript
const coste_laboral_base = empleado.salario_base_mes + empleado.complemento_salarial_mes;

const coste_remuneraciones_extra = remuneraciones_extra
  .filter(r => r.mes === 11 && r.año === 2024)
  .reduce((sum, r) => sum + r.importe, 0);

const coste_total = coste_laboral_base + coste_remuneraciones_extra;

const coste_por_hora = coste_total / horas_trabajadas_mes;
```

**Ejemplo:**
```
Salario base: 1.500€
Complemento: 0€
Remuneraciones extra: 150€ (bonus)
---
Total: 1.650€
Por hora: 1.650 / 168 = 9.82€/hora
```

---

### 5️⃣ Incidencias

**Fórmula (Total):**
```sql
SELECT COUNT(*) as total_incidencias
FROM incidencias_rrhh
WHERE empleado_id = 'EMP-001'
  AND MONTH(fecha) = 11
  AND YEAR(fecha) = 2024
  AND estado = 'activa';
```

**Desglose por tipo:**
```sql
SELECT 
  tipo,
  COUNT(*) as count
FROM incidencias_rrhh
WHERE empleado_id = 'EMP-001'
  AND MONTH(fecha) = 11
  AND YEAR(fecha) = 2024
GROUP BY tipo;
```

**Resultado:**
```json
{
  "total": 2,
  "bajas": 1,
  "retrasos": 1,
  "ausencias": 0
}
```

---

### 6️⃣ Puntualidad

**Fórmula:**
```sql
-- Días puntuales (fichaje entrada <= hora_planificada + 5 min)
SELECT COUNT(*) as dias_puntuales
FROM fichajes
WHERE empleado_id = 'EMP-001'
  AND MONTH(fecha) = 11
  AND YEAR(fecha) = 2024
  AND TIMESTAMPDIFF(MINUTE, hora_entrada_planificada, hora_entrada) <= 5;

-- Días totales
SELECT COUNT(*) as dias_totales
FROM fichajes
WHERE empleado_id = 'EMP-001'
  AND MONTH(fecha) = 11
  AND YEAR(fecha) = 2024
  AND estado = 'completado';
```

**JavaScript:**
```javascript
const puntualidad_porcentaje = (dias_puntuales / dias_totales) * 100;
// Ejemplo: (19 / 20) * 100 = 95%
```

---

### 7️⃣ Productividad (Tendencia)

**Fórmula:**
```javascript
const tareas_mes_actual = tareas
  .filter(t => t.mes === 11 && t.estado === 'completada')
  .length;

const tareas_mes_anterior = tareas
  .filter(t => t.mes === 10 && t.estado === 'completada')
  .length;

const tendencia = ((tareas_mes_actual - tareas_mes_anterior) / tareas_mes_anterior) * 100;
// Ejemplo: ((45 - 40) / 40) * 100 = +12.5%
```

---

### 8️⃣ Promedio Mensual (Anual)

**Fórmula:**
```sql
SELECT 
  AVG(horas_trabajadas) as promedio_mensual
FROM kpis_rrhh
WHERE empleado_id = 'EMP-001'
  AND año = 2024;
```

**JavaScript:**
```javascript
const promedio_mensual = kpis_historico
  .reduce((sum, kpi) => sum + kpi.horas_trabajadas, 0) / kpis_historico.length;
// Ejemplo: (160 + 165 + 155 + 120 + 168) / 5 = 153.6h
```

---

## 🤖 ESCENARIOS MAKE

### Escenario 1️⃣: Alta Empleado

**Trigger:** Webhook `POST /empleados/crear`

**Flujo:**

```
1. [Webhook Recibido]
   ↓
2. [Validar Datos]
   ├─ Campos obligatorios completos?
   ├─ Email válido?
   └─ DNI único?
   ↓
3. [Crear Empleado en DB]
   INSERT INTO empleados (...)
   ↓
4. [Crear Permisos Estándar]
   INSERT INTO permisos (...)
   ↓
5. [Registrar Histórico]
   INSERT INTO historico_rrhh (tipo: 'alta', ...)
   ↓
6. [¿Enviar a Gestoría?]
   ├─ SÍ → Enviar Email con datos
   └─ NO → Continuar
   ↓
7. [Respuesta]
   JSON: { success: true, empleado_id: 'EMP-001' }
```

**Módulos Make:**
- Webhook
- MySQL (Create record)
- Router (condicional)
- Email (Gmail/SMTP)
- HTTP Response

---

### Escenario 2️⃣: Fichajes en Tiempo Real

**Trigger:** Webhook `POST /fichajes/registrar` (desde app móvil)

**Flujo:**

```
1. [Webhook Recibido]
   empleado_id, tipo (entrada/salida), timestamp, ubicacion
   ↓
2. [Buscar Fichaje Abierto]
   SELECT * FROM fichajes 
   WHERE empleado_id = ? AND estado = 'en_curso' 
   ORDER BY fecha DESC LIMIT 1
   ↓
3. [¿Es Entrada o Salida?]
   ├─ ENTRADA → Crear nuevo fichaje
   │   INSERT INTO fichajes (hora_entrada, estado: 'en_curso')
   │
   └─ SALIDA → Actualizar fichaje existente
       UPDATE fichajes SET hora_salida = ?, estado = 'completado'
   ↓
4. [Calcular Horas]
   horas_trabajadas = (hora_salida - hora_entrada) / 60 / 60
   ↓
5. [Detectar Horas Extra]
   horas_extra = MAX(0, horas_trabajadas - horas_contrato_dia)
   ↓
6. [Actualizar KPI del Mes]
   UPDATE kpis_rrhh 
   SET horas_trabajadas = horas_trabajadas + ?
   WHERE empleado_id = ? AND mes = ? AND año = ?
   ↓
7. [¿Pasa > 120%?]
   ├─ SÍ → Notificar a gerente
   │   Email: "Empleado superó 120% de horas"
   └─ NO → Continuar
   ↓
8. [Respuesta]
   JSON: { success: true, horas_trabajadas: 8.5 }
```

**Módulos Make:**
- Webhook
- MySQL (Search + Update)
- Math (cálculo horas)
- Router (condicional)
- Push Notification
- HTTP Response

---

### Escenario 3️⃣: Consumos Internos

**Trigger:** Webhook `PUT /consumos/{id}/aprobar` o `PUT /consumos/{id}/rechazar`

**Flujo (Aprobar):**

```
1. [Webhook Recibido]
   consumo_id, accion (aprobar/rechazar)
   ↓
2. [Buscar Consumo]
   SELECT * FROM consumos_internos_equipo WHERE consumo_id = ?
   ↓
3. [Actualizar Estado]
   UPDATE consumos_internos_equipo 
   SET estado = 'aprobado', 
       aprobado_por = ?,
       fecha_aprobacion = NOW()
   WHERE consumo_id = ?
   ↓
4. [Registrar en Histórico]
   INSERT INTO historico_rrhh (tipo: 'otro', descripcion: 'Consumo aprobado')
   ↓
5. [¿Imputar a Centro de Coste?]
   ├─ SÍ → Crear registro en contabilidad
   └─ NO → Continuar
   ↓
6. [Respuesta]
   JSON: { success: true }
```

**Módulos Make:**
- Webhook
- MySQL (Search + Update)
- Router
- HTTP Response

---

### Escenario 4️⃣: Modificaciones RRHH

**Trigger:** Webhook `PUT /empleados/{id}/modificar`

**Flujo:**

```
1. [Webhook Recibido]
   empleado_id, cambios: { puesto, salario, ... }
   ↓
2. [Obtener Datos Anteriores]
   SELECT * FROM empleados WHERE empleado_id = ?
   ↓
3. [Guardar en Histórico]
   INSERT INTO historico_rrhh (
     tipo: 'modificacion',
     datos_anteriores: JSON,
     datos_nuevos: JSON
   )
   ↓
4. [Actualizar Empleado]
   UPDATE empleados SET ... WHERE empleado_id = ?
   ↓
5. [¿Afecta Salario?]
   ├─ SÍ → Recalcular coste mensual
   │   UPDATE kpis_rrhh SET coste_laboral_base = ?
   └─ NO → Continuar
   ↓
6. [¿Es Fin Contrato?]
   ├─ SÍ → Bloquear accesos
   │   UPDATE permisos SET acceso_sistema = FALSE
   └─ NO → Continuar
   ↓
7. [Respuesta]
   JSON: { success: true }
```

**Módulos Make:**
- Webhook
- MySQL (Search + Update)
- Router
- JSON (Parse/Build)
- HTTP Response

---

### Escenario 5️⃣: KPI Mensual ⭐ NUEVO

**Trigger:** Webhook `GET /empleados/{id}/kpi?mes={mes}&año={año}`

**Flujo:**

```
1. [Webhook Recibido]
   empleado_id, mes, año
   ↓
2. [Obtener Datos Empleado]
   SELECT * FROM empleados WHERE empleado_id = ?
   ↓
3. [Calcular Horas del Mes]
   SELECT SUM(horas_trabajadas), SUM(horas_extra)
   FROM fichajes
   WHERE empleado_id = ? AND MONTH(fecha) = ? AND YEAR(fecha) = ?
   ↓
4. [Calcular % Cumplimiento]
   porcentaje = (horas_trabajadas / horas_contrato_mes) * 100
   ↓
5. [Calcular Coste Total]
   coste_base = salario_base + complemento
   coste_extra = SUM(remuneraciones_extra)
   coste_total = coste_base + coste_extra
   coste_por_hora = coste_total / horas_trabajadas
   ↓
6. [Contar Incidencias]
   SELECT COUNT(*), tipo
   FROM incidencias_rrhh
   WHERE empleado_id = ? AND MONTH(fecha) = ? 
   GROUP BY tipo
   ↓
7. [Calcular Puntualidad]
   dias_puntuales = COUNT(fichajes con retraso <= 5min)
   dias_totales = COUNT(fichajes)
   puntualidad = (dias_puntuales / dias_totales) * 100
   ↓
8. [Obtener Histórico (últimos 6 meses)]
   SELECT * FROM kpis_rrhh
   WHERE empleado_id = ? AND año = ?
   ORDER BY mes DESC LIMIT 6
   ↓
9. [Calcular Resumen Anual]
   promedio_mensual = AVG(horas_trabajadas)
   coste_total_anual = SUM(coste_total)
   incidencias_totales = SUM(incidencias_total)
   ↓
10. [¿Guardar en Tabla kpis_rrhh?]
    ├─ SÍ → INSERT OR UPDATE kpis_rrhh
    └─ NO → Solo devolver JSON
    ↓
11. [Construir JSON Response]
    {
      horas: { ... },
      coste: { ... },
      incidencias: { ... },
      historico_meses: [ ... ],
      resumen_anual: { ... }
    }
    ↓
12. [Respuesta]
    JSON completo con todos los KPIs
```

**Módulos Make:**
- Webhook
- MySQL (Multiple queries)
- Math (cálculos)
- JSON (Build)
- HTTP Response

---

## 🎨 VINCULACIÓN FIGMA

### Variables Figma para Pestaña KPI

**Archivo:** `/components/gerente/EquipoRRHH.tsx`

**Variables dinámicas:**

```typescript
// KPI del Mes Actual
{{horas_mes}} = empleadoSeleccionado.horasTrabajadas // 168
{{horas_contrato_mes}} = empleadoSeleccionado.horasContrato // 160
{{porcentaje}} = Math.round((168 / 160) * 100) // 105

{{coste_mes}} = costeTotal.toLocaleString() // 2.520 €
{{coste_por_hora}} = (costeTotal / horasTrabajadas).toFixed(2) // 15.00 €

{{incidencias_total}} = incidencias.length // 2
{{incidencias_bajas}} = incidencias.filter(i => i.tipo === 'baja_ss').length // 1
{{incidencias_retrasos}} = incidencias.filter(i => i.tipo === 'retraso').length // 1
{{incidencias_ausencias}} = incidencias.filter(i => i.tipo === 'ausencia').length // 0

{{puntualidad_porcentaje}} = 95
{{dias_puntuales}} = 19
{{dias_totales}} = 20

{{productividad_tareas}} = 45
{{productividad_tendencia}} = +12

{{horas_extra_mes}} = 8
{{formacion_horas}} = 12
{{formacion_cursos}} = 3
```

### Componentes Figma

#### 1. Tarjeta KPI Principal

```typescript
interface KPICardProps {
  icono: ReactNode;
  titulo: string;
  valor: string;
  subtitulo?: string;
  badge?: { label: string; color: string };
  gradient: string;
}

// Ejemplo de uso
<KPICard
  icono={<Clock />}
  titulo="Horas Trabajadas"
  valor={`${horas_mes}h`}
  subtitulo={`/ ${horas_contrato_mes}h`}
  badge={{ label: `${porcentaje}%`, color: 'green' }}
  gradient="from-blue-50 to-blue-100/50"
/>
```

#### 2. Selector de Mes

```typescript
interface SelectorMesProps {
  mesActual: number;
  añoActual: number;
  onChange: (mes: number, año: number) => void;
}

// Ejemplo de uso
<SelectorMes
  mesActual={11}
  añoActual={2024}
  onChange={(mes, año) => {
    // Llamar API con nuevo mes/año
    fetchKPI(empleadoId, mes, año);
  }}
/>
```

#### 3. Tabla Histórica

```typescript
interface TablaHistoricoProps {
  meses: Array<{
    mes: string;
    horas: string;
    porcentaje: number;
    coste: number;
    incidencias: number;
    puntualidad: number;
  }>;
}

// Ejemplo de uso
<TablaHistorico
  meses={historico_meses}
/>
```

#### 4. Gráfico de Barras

```typescript
interface GraficoBárrasProps {
  datos: Array<{
    mes: string;
    valor: number;
    color: string;
  }>;
  valorReferencia: number; // Horas contrato
}

// Ejemplo de uso
<GraficoBárras
  datos={[
    { mes: 'Ago', valor: 120, color: 'blue-200' },
    { mes: 'Sep', valor: 155, color: 'blue-300' },
    { mes: 'Oct', valor: 160, color: 'blue-400' },
    { mes: 'Nov', valor: 168, color: 'teal-500' }
  ]}
  valorReferencia={160}
/>
```

---

## 🌐 ENDPOINTS API

### 1. Empleados

#### `POST /empleados/crear`
**Descripción:** Crear nuevo empleado

**Body:**
```json
{
  "empresa_id": "EMP-123",
  "marca_id": "MRC-456",
  "pdv_id": "PDV-789",
  "nombre": "Juan",
  "apellidos": "Pérez García",
  "telefono": "+34 666 777 888",
  "email": "juan.perez@empresa.com",
  "puesto": "Barista",
  "departamento": "Producción",
  "tipo_contrato": "indefinido",
  "fecha_ingreso": "2024-11-26",
  "horas_contrato_mes": 160,
  "salario_base_mes": 1500,
  "enviar_gestoria": true
}
```

**Response:**
```json
{
  "success": true,
  "empleado_id": "EMP-001",
  "message": "Empleado creado correctamente"
}
```

---

#### `GET /empleados`
**Descripción:** Listar todos los empleados

**Query Params:**
- `empresa_id` (opcional)
- `marca_id` (opcional)
- `pdv_id` (opcional)
- `estado` (opcional): activo, vacaciones, baja

**Response:**
```json
{
  "success": true,
  "empleados": [
    {
      "empleado_id": "EMP-001",
      "nombre": "Juan",
      "apellidos": "Pérez García",
      "puesto": "Barista",
      "estado": "activo",
      "horas_trabajadas_mes": 168,
      "horas_contrato_mes": 160
    }
  ],
  "total": 15
}
```

---

#### `GET /empleados/{id}`
**Descripción:** Obtener detalles de un empleado

**Response:**
```json
{
  "success": true,
  "empleado": {
    "empleado_id": "EMP-001",
    "nombre": "Juan",
    "apellidos": "Pérez García",
    "telefono": "+34 666 777 888",
    "email": "juan.perez@empresa.com",
    "puesto": "Barista",
    "departamento": "Producción",
    "estado": "activo",
    "horas_contrato_mes": 160,
    "salario_base_mes": 1500
  }
}
```

---

#### `PUT /empleados/{id}/modificar`
**Descripción:** Modificar datos del empleado

**Body:**
```json
{
  "puesto": "Encargado",
  "salario_base_mes": 1800,
  "departamento": "Gestión"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Empleado actualizado correctamente",
  "cambios_aplicados": 3
}
```

---

#### `PUT /empleados/{id}/finalizar`
**Descripción:** Dar de baja a un empleado

**Body:**
```json
{
  "fecha_fin": "2024-12-31",
  "motivo": "Fin de contrato",
  "enviar_gestoria": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Empleado dado de baja correctamente"
}
```

---

### 2. KPI ⭐ NUEVO

#### `GET /empleados/{id}/kpi`
**Descripción:** Obtener KPIs del empleado

**Query Params:**
- `mes`: 1-12 (obligatorio)
- `año`: 2024 (obligatorio)

**Response:** (Ver JSON completo en sección "BOTÓN: KPI")

---

#### `GET /empleados/{id}/kpi/historico`
**Descripción:** Obtener histórico de KPIs

**Query Params:**
- `meses`: 6 (default)

**Response:**
```json
{
  "success": true,
  "historico": [
    {
      "mes": 11,
      "año": 2024,
      "horas_trabajadas": 168,
      "porcentaje": 105,
      "coste_total": 1650
    }
  ],
  "resumen_anual": {
    "promedio_mensual": 156,
    "coste_total_anual": 28200,
    "incidencias_totales": 3
  }
}
```

---

#### `GET /empleados/{id}/kpi/export`
**Descripción:** Exportar KPIs en PDF

**Query Params:**
- `mes`: 11
- `año`: 2024
- `formato`: pdf (default)

**Response:** Archivo PDF descargable

---

### 3. Fichajes

#### `POST /fichajes/entrada`
**Descripción:** Registrar entrada (desde app móvil)

**Body:**
```json
{
  "empleado_id": "EMP-001",
  "fecha": "2024-11-26",
  "hora": "08:05",
  "ubicacion": "40.4168,-3.7038"
}
```

**Response:**
```json
{
  "success": true,
  "fichaje_id": "FICH-001",
  "message": "Entrada registrada"
}
```

---

#### `PUT /fichajes/{id}/salida`
**Descripción:** Registrar salida

**Body:**
```json
{
  "hora": "16:10",
  "ubicacion": "40.4168,-3.7038"
}
```

**Response:**
```json
{
  "success": true,
  "horas_trabajadas": 8.08,
  "horas_extra": 0.08,
  "message": "Salida registrada"
}
```

---

### 4. Consumos Internos

#### `POST /empleados/{id}/consumo`
**Descripción:** Crear consumo interno

**Body:**
```json
{
  "tipo": "producto",
  "descripcion": "Café espresso",
  "cantidad": 2,
  "valor_estimado": 6
}
```

**Response:**
```json
{
  "success": true,
  "consumo_id": "CONS-001",
  "estado": "pendiente"
}
```

---

#### `PUT /consumos/{id}/aprobar`
**Descripción:** Aprobar consumo

**Response:**
```json
{
  "success": true,
  "message": "Consumo aprobado"
}
```

---

#### `PUT /consumos/{id}/rechazar`
**Descripción:** Rechazar consumo

**Response:**
```json
{
  "success": true,
  "message": "Consumo rechazado"
}
```

---

### 5. Documentación

#### `POST /empleados/{id}/documento`
**Descripción:** Subir documento

**Body:** (multipart/form-data)
```
file: [archivo PDF/JPG]
tipo_documento: "dni"
```

**Response:**
```json
{
  "success": true,
  "documento_id": "DOC-001",
  "url": "https://storage.udar.com/docs/EMP-001/dni.pdf"
}
```

---

### 6. Permisos

#### `PUT /empleados/{id}/permisos`
**Descripción:** Actualizar permisos

**Body:**
```json
{
  "acceso_sistema": true,
  "fichar": true,
  "ver_pedidos": false,
  "gestionar_pedidos": false,
  "baja_forzada": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permisos actualizados"
}
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

### Frontend ✅ COMPLETO

- [x] Modal Perfil de Empleado con 6 pestañas
- [x] Pestaña KPI con diseño completo
- [x] Cards de KPIs principales
- [x] KPIs secundarios
- [x] Tabla histórica
- [x] Gráfico de evolución
- [x] Resumen anual
- [x] Todos los eventos con console.log
- [x] Diseño responsive
- [x] Documentación técnica completa

### Base de Datos ⏳ PENDIENTE

- [ ] Crear tabla: empresas
- [ ] Crear tabla: marcas
- [ ] Crear tabla: puntos_venta
- [ ] Crear tabla: empleados
- [ ] Crear tabla: centros_coste_empleado
- [ ] Crear tabla: fichajes
- [ ] Crear tabla: incidencias_rrhh
- [ ] Crear tabla: documentacion_empleado
- [ ] Crear tabla: permisos
- [ ] Crear tabla: remuneraciones_extra
- [ ] Crear tabla: historico_rrhh
- [ ] Crear tabla: consumos_internos_equipo
- [ ] Crear tabla: **kpis_rrhh** (NUEVA)

### Endpoints API ⏳ PENDIENTE

- [ ] POST /empleados/crear
- [ ] GET /empleados
- [ ] GET /empleados/{id}
- [ ] PUT /empleados/{id}/modificar
- [ ] PUT /empleados/{id}/finalizar
- [ ] **GET /empleados/{id}/kpi** ⭐ NUEVO
- [ ] **GET /empleados/{id}/kpi/historico** ⭐ NUEVO
- [ ] **GET /empleados/{id}/kpi/export** ⭐ NUEVO
- [ ] POST /fichajes/entrada
- [ ] PUT /fichajes/{id}/salida
- [ ] POST /empleados/{id}/consumo
- [ ] PUT /consumos/{id}/aprobar
- [ ] PUT /consumos/{id}/rechazar
- [ ] POST /empleados/{id}/documento
- [ ] PUT /empleados/{id}/permisos

### Escenarios Make ⏳ PENDIENTE

- [ ] Escenario 1: Alta empleado
- [ ] Escenario 2: Fichajes en tiempo real
- [ ] Escenario 3: Consumos internos
- [ ] Escenario 4: Modificaciones RRHH
- [ ] Escenario 5: **KPI mensual** ⭐ NUEVO

### Cálculos Automáticos ⏳ PENDIENTE

- [ ] Horas trabajadas del mes
- [ ] % Cumplimiento
- [ ] Coste laboral estimado
- [ ] Detección de horas extra
- [ ] Cálculo de puntualidad
- [ ] Tendencia de productividad
- [ ] Promedio mensual anual
- [ ] Resumen anual (coste, incidencias)

### Testing ⏳ PENDIENTE

- [ ] Test de creación de empleado
- [ ] Test de fichajes (entrada/salida)
- [ ] Test de cálculo de KPIs
- [ ] Test de exportación PDF
- [ ] Test de consumos internos
- [ ] Test de permisos
- [ ] Test responsive en mobile
- [ ] Test de rendimiento

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs del Sistema

- **Tiempo de respuesta API**: < 500ms
- **Precisión de cálculos**: 100%
- **Tasa de fichajes exitosos**: > 99%
- **Disponibilidad del sistema**: > 99.9%

### KPIs de Usuario

- **Tiempo para crear empleado**: < 2 minutos
- **Tiempo para ver KPIs**: < 3 segundos
- **Satisfacción de gerentes**: > 4/5
- **Adopción de app móvil (empleados)**: > 80%

---

## 🚀 PRÓXIMOS PASOS

### Fase 1: Base de Datos (Semana 1)

1. Crear todas las tablas SQL
2. Poblar datos de ejemplo
3. Crear triggers automáticos
4. Crear vistas para reportes

### Fase 2: API (Semana 2-3)

1. Implementar endpoints de empleados
2. Implementar endpoints de fichajes
3. Implementar **endpoints de KPI** ⭐
4. Implementar endpoints de consumos
5. Implementar endpoints de documentación

### Fase 3: Make (Semana 4)

1. Configurar escenario de alta empleado
2. Configurar escenario de fichajes
3. Configurar **escenario de KPI mensual** ⭐
4. Configurar escenario de consumos
5. Configurar escenario de modificaciones

### Fase 4: Testing (Semana 5)

1. Testing unitario de cálculos
2. Testing de integración
3. Testing de rendimiento
4. Testing de UX con usuarios reales

### Fase 5: Deploy (Semana 6)

1. Deploy a producción
2. Formación a gerentes
3. Formación a empleados (app móvil)
4. Monitorización y ajustes

---

**Documento creado:** 26 Noviembre 2024  
**Versión:** 2.0  
**Autor:** Figma Make + Udar Edge Team  
**Estado:** ✅ Documentación Completa - Listo para Desarrollo

---

