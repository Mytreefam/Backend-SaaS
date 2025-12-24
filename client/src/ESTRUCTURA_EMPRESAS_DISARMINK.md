# 🏢 ESTRUCTURA EMPRESARIAL - DISARMINK S.L.

## 📋 RESUMEN EJECUTIVO

Sistema de configuración de empresas completamente implementado con la estructura jerárquica real de **Disarmink S.L.** operando bajo el nombre comercial **"Hoy Pecamos"** con dos marcas: **Modomio** (pizzas) y **Blackburguer** (hamburguesas), cada una con puntos de venta en Tiana y Badalona.

---

## 🏗️ ESTRUCTURA JERÁRQUICA

```
📦 DISARMINK S.L. [EMP-001]
    │
    ├─ 🏪 Nombre Comercial: "Hoy Pecamos"
    ├─ 📄 CIF: B67284315
    ├─ 📍 Domicilio Fiscal: Avenida Onze Setembre, 1, 08391 Tiana, Barcelona
    │
    ├─ 🍕 MARCA: Modomio [MRC-001 / MRC-MIO]
    │   ├─ 📍 Punto de Venta: Tiana [PDV-TIA-MIO]
    │   │   ├─ Dirección: Passeig de la Vilesa, 6, 08391 Tiana, Barcelona
    │   │   ├─ Teléfono: +34 933 456 789
    │   │   └─ Email: tiana.modomio@hoypecamos.com
    │   │
    │   └─ 📍 Punto de Venta: Badalona [PDV-BAD-MIO]
    │       ├─ Dirección: Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona
    │       ├─ Teléfono: +34 933 456 790
    │       └─ Email: badalona.modomio@hoypecamos.com
    │
    └─ 🍔 MARCA: Blackburguer [MRC-002 / MRC-BBG]
        ├─ 📍 Punto de Venta: Tiana [PDV-TIA-BBG]
        │   ├─ Dirección: Passeig de la Vilesa, 6, 08391 Tiana, Barcelona
        │   ├─ Teléfono: +34 933 456 791
        │   └─ Email: tiana.blackburguer@hoypecamos.com
        │
        └─ 📍 Punto de Venta: Badalona [PDV-BAD-BBG]
            ├─ Dirección: Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona
            ├─ Teléfono: +34 933 456 792
            └─ Email: badalona.blackburguer@hoypecamos.com
```

---

## 💳 CUENTAS BANCARIAS

| ID | IBAN | Alias |
|----|------|-------|
| CTA-001 | ES91 2100 0418 4502 0005 1332 | Cuenta Principal Disarmink |
| CTA-002 | ES76 0128 0123 4501 0006 7890 | Cuenta Operativa Hoy Pecamos |

---

## 📊 DETALLES POR PUNTO DE VENTA

### 🍕 Modomio Tiana
- **ID:** PDV-TIA-MIO
- **Dirección:** Passeig de la Vilesa, 6, 08391 Tiana, Barcelona
- **Horario:** 12:00 - 23:00
- **Arrendador:** Inmobiliaria Costa Maresme SL
- **Alquiler:** 1.800 €/mes
- **Vencimiento Contrato:** 31/12/2026
- **Licencias:**
  - Licencia de Actividad: LIC-TIA-2022-00089 (vence 30/06/2027)
  - Licencia Sanitaria: SAN-TIA-2022-00234 (vence 15/06/2026)
- **Comunidad de Vecinos:** Sí (Joan Ferrer - +34 933 123 456)

### 🍕 Modomio Badalona
- **ID:** PDV-BAD-MIO
- **Dirección:** Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona
- **Horario:** 12:00 - 23:30
- **Arrendador:** Gestión Badalona Locales SA
- **Alquiler:** 2.200 €/mes
- **Vencimiento Contrato:** 31/03/2027
- **Licencias:**
  - Licencia de Actividad: LIC-BAD-2023-00156 (vence 31/03/2028)
  - Licencia Sanitaria: SAN-BAD-2023-00401 (vence 28/02/2027)
- **Comunidad de Vecinos:** Sí (Ana Martínez - +34 933 234 567)

### 🍔 Blackburguer Tiana
- **ID:** PDV-TIA-BBG
- **Dirección:** Passeig de la Vilesa, 6, 08391 Tiana, Barcelona
- **Horario:** 12:00 - 00:00
- **Arrendador:** Inmobiliaria Costa Maresme SL
- **Alquiler:** 1.800 €/mes
- **Vencimiento Contrato:** 31/12/2026
- **Licencias:**
  - Licencia de Actividad: LIC-TIA-2023-00112 (vence 30/09/2028)
  - Licencia Sanitaria: SAN-TIA-2023-00289 (vence 15/08/2027)
- **Comunidad de Vecinos:** Sí (Joan Ferrer - +34 933 123 456)

### 🍔 Blackburguer Badalona
- **ID:** PDV-BAD-BBG
- **Dirección:** Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona
- **Horario:** 12:00 - 00:30
- **Arrendador:** Gestión Badalona Locales SA
- **Alquiler:** 2.200 €/mes
- **Vencimiento Contrato:** 31/03/2027
- **Licencias:**
  - Licencia de Actividad: LIC-BAD-2024-00034 (vence 30/04/2029)
  - Licencia Sanitaria: SAN-BAD-2024-00098 (vence 31/03/2028)
- **Comunidad de Vecinos:** Sí (Ana Martínez - +34 933 234 567)

---

## 📂 ARCHIVOS ACTUALIZADOS

### ✅ Configuración Completa

1. **`/components/gerente/ConfiguracionEmpresas.tsx`** (NUEVO)
   - Componente principal de gestión de empresas
   - Vista jerárquica con acordeones
   - Muestra empresa → marcas → puntos de venta
   - Información fiscal, cuentas bancarias y documentación
   - Modal para crear nuevas empresas

2. **`/components/gerente/ConfiguracionGerente.tsx`**
   - Integrado el nuevo componente ConfiguracionEmpresas
   - Actualizado el filtro "puntosVenta" → "Empresas"
   - Datos mock actualizados con estructura Disarmink

3. **`/components/filtros/FiltroUniversalUDAR.tsx`**
   - Datos mock actualizados:
     - Empresa: "Disarmink S.L." [EMP-001]
     - Marcas: "Modomio" [MRC-MIO] y "Blackburguer" [MRC-BBG]
     - Puntos de venta con IDs correctos

4. **`/EJEMPLO_INTEGRACION_DASHBOARD.tsx`**
   - Actualizado el desglose de ventas con 4 puntos de venta
   - Datos de ejemplo para Modomio y Blackburguer

5. **`/EJEMPLO_INTEGRACION_PERMISOS_EMPLEADO.tsx`**
   - Actualizado datos de empleados con nueva estructura

6. **`/components/agente-externo/PanelAgenteExterno.tsx`**
   - Actualizado nombre de empresa en lista de empresas permitidas

7. **`/components/gerente/ModalCrearEmpresa.tsx`**
   - Modal existente para crear empresas
   - Permite crear empresa → marcas → puntos de venta → cuentas bancarias
   - Validación de datos completa

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Gestión de Empresas
- ✅ Vista jerárquica completa (Empresa → Marca → Punto de Venta)
- ✅ Información fiscal detallada
- ✅ Gestión de cuentas bancarias
- ✅ Documentación por punto de venta (alquiler, licencias, comunidad)
- ✅ Estados activo/inactivo
- ✅ Colores de identidad por marca

### ✅ Modal de Creación
- ✅ Crear empresa con datos fiscales
- ✅ Añadir múltiples marcas con colores
- ✅ Añadir puntos de venta vinculados a marcas
- ✅ Añadir cuentas bancarias
- ✅ Validaciones completas
- ✅ Regla: no eliminar marca con puntos de venta vinculados

### ✅ Filtros Jerárquicos
- ✅ Filtro universal por empresa/marca/punto de venta
- ✅ Selección múltiple de contextos
- ✅ Sincronización con todos los módulos
- ✅ Datos mock actualizados en todos los componentes

---

## 👥 VISIBILIDAD POR ROL

### 🎩 GERENTE
- ✅ **Acceso completo** a Configuración > Empresas
- ✅ Puede ver la estructura jerárquica completa
- ✅ Puede crear, editar y gestionar empresas
- ✅ Puede crear marcas y puntos de venta
- ✅ Puede gestionar cuentas bancarias
- ✅ Puede ver toda la documentación

### 👷 TRABAJADOR
- ❌ **No tiene acceso** a la configuración de empresas
- ℹ️ Solo ve los datos de su punto de venta asignado en otros módulos

### 🛒 CLIENTE
- ❌ **No tiene acceso** a la configuración de empresas
- ℹ️ Solo ve información pública de las tiendas en el módulo "Quiénes Somos"

---

## 🔄 SINCRONIZACIÓN DE DATOS

Todos los componentes que usan la estructura empresa/marca/punto de venta están sincronizados:

1. **ConfiguracionEmpresas.tsx** → Gestión completa
2. **FiltroUniversalUDAR.tsx** → Filtro jerárquico
3. **Dashboard360.tsx** → Visualización de métricas
4. **EJEMPLO_INTEGRACION_DASHBOARD.tsx** → Documentación de API
5. **Presupuestos** → Filtros por marca y punto de venta
6. **Gestión de Personal** → Asignación de empleados
7. **Agentes Externos** → Vinculación a empresas

---

## 📝 PRÓXIMOS PASOS RECOMENDADOS

### 🔴 Prioridad Alta
1. Conectar con backend real para persistir datos
2. Implementar endpoints de API para CRUD de empresas/marcas/PDV
3. Añadir permisos granulares por rol (gerente_empresa, gerente_marca, gerente_pdv)

### 🟡 Prioridad Media
4. Añadir validación de CIF en tiempo real
5. Implementar carga de documentos (licencias, contratos)
6. Añadir historial de cambios en configuración
7. Implementar sistema de notificaciones para vencimientos

### 🟢 Mejoras Futuras
8. Gráficos de rendimiento por marca/punto de venta
9. Comparativas entre puntos de venta
10. Dashboard específico por marca
11. Gestión de personal por punto de venta desde el mismo módulo

---

## 💾 FORMATO DE DATOS PARA API

### Estructura de Empresa
```typescript
interface Empresa {
  id: string;                    // EMP-001
  codigo_empresa: string;        // DIS-001
  nombre_fiscal: string;         // Disarmink S.L.
  cif: string;                   // B67284315
  nombre_comercial: string;      // Hoy Pecamos
  domicilio_fiscal: string;      // Avenida Onze Setembre, 1, 08391 Tiana, Barcelona
  activo: boolean;               // true
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Estructura de Marca
```typescript
interface Marca {
  id: string;                    // MRC-001
  codigo_marca: string;          // MRC-MIO
  nombre: string;                // Modomio
  color_identidad: string;       // #FF6B35
  empresa_id: string;            // EMP-001 (FK)
  activo: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Estructura de Punto de Venta
```typescript
interface PuntoVenta {
  id: string;                    // PDV-TIA-MIO
  codigo_pdv: string;            // PDV-TIA-MIO
  nombre_comercial: string;      // Tiana
  direccion: string;             // Passeig de la Vilesa, 6, 08391 Tiana, Barcelona
  telefono: string;              // +34 933 456 789
  email: string;                 // tiana.modomio@...
  horario: string;               // 12:00 - 23:00
  marca_id: string;              // MRC-001 (FK)
  empresa_id: string;            // EMP-001 (FK)
  activo: boolean;
  created_at: timestamp;
  updated_at: timestamp;
}
```

---

## ✅ ESTADO ACTUAL

- ✅ **Frontend:** Implementado al 100%
- ✅ **Datos Mock:** Completamente actualizados
- ✅ **UI/UX:** Interfaz completa y funcional
- ✅ **Sincronización:** Todos los componentes actualizados
- ⏳ **Backend:** Pendiente de implementación
- ⏳ **Persistencia:** Datos en memoria (mock)

---

**Última actualización:** 28 de noviembre de 2025
**Versión:** 1.0
**Estado:** ✅ Completamente Funcional (Frontend)
