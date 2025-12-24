# 🎯 RESUMEN EJECUTIVO - MÓDULO EQUIPO Y RRHH

**Para:** Programador Backend  
**De:** Figma Make  
**Fecha:** 26 Noviembre 2024  
**Prioridad:** ALTA  

---

## ⚡ LO QUE NECESITAS SABER EN 3 MINUTOS

### ✅ ESTADO ACTUAL

El **frontend está 100% completo** y funcional. Todos los componentes, modales, pestañas, botones y eventos están implementados y listos. Solo falta **conectar la base de datos y la API**.

### 🎯 TU MISIÓN

Implementar el **backend completo** del módulo Equipo y RRHH, incluyendo:

1. **13 tablas** de base de datos (SQL)
2. **16 endpoints** API (REST)
3. **5 escenarios** Make (automatización)
4. **8 cálculos** automáticos (fórmulas)

---

## 📁 ARCHIVOS CLAVE

| Archivo | Qué contiene |
|---------|-------------|
| `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` | **TODO** lo que necesitas: tablas SQL, endpoints, escenarios Make, cálculos, flujos completos |
| `/ACTUALIZACION_KPI_EMPLEADOS.md` | Documentación específica de la **nueva pestaña KPI** (lo último que se añadió) |
| `/components/gerente/EquipoRRHH.tsx` | Componente React principal con todos los eventos preparados |
| `/RESUMEN_EJECUTIVO_PROGRAMADOR.md` | Este documento (resumen rápido) |

---

## 🗄️ BASE DE DATOS - 13 TABLAS

### Prioridad 1 (Críticas):

```sql
1. empresas
2. marcas
3. puntos_venta
4. empleados ⭐ PRINCIPAL
5. permisos
6. fichajes
```

### Prioridad 2 (Importantes):

```sql
7. incidencias_rrhh
8. documentacion_empleado
9. remuneraciones_extra
10. historico_rrhh
11. consumos_internos_equipo
```

### Prioridad 3 (Nuevas):

```sql
12. centros_coste_empleado
13. kpis_rrhh ⭐ NUEVA (para pestaña KPI)
```

**📄 SQL completo en:** `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` (sección "ESTRUCTURA DE BASE DE DATOS")

---

## 🌐 ENDPOINTS API - 16 ENDPOINTS

### Empleados (6 endpoints):

```
✅ POST   /empleados/crear
✅ GET    /empleados
✅ GET    /empleados/{id}
✅ PUT    /empleados/{id}/modificar
✅ PUT    /empleados/{id}/finalizar
✅ PUT    /empleados/{id}/permisos
```

### KPI ⭐ NUEVO (3 endpoints):

```
⭐ GET    /empleados/{id}/kpi?mes=11&año=2024
⭐ GET    /empleados/{id}/kpi/historico?meses=6
⭐ GET    /empleados/{id}/kpi/export?formato=pdf
```

### Fichajes (2 endpoints):

```
✅ POST   /fichajes/entrada
✅ PUT    /fichajes/{id}/salida
```

### Consumos (3 endpoints):

```
✅ POST   /empleados/{id}/consumo
✅ PUT    /consumos/{id}/aprobar
✅ PUT    /consumos/{id}/rechazar
```

### Documentación (1 endpoint):

```
✅ POST   /empleados/{id}/documento
```

### Remuneraciones (1 endpoint):

```
✅ POST   /empleados/{id}/remuneracion
```

**📄 Documentación completa en:** `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` (sección "ENDPOINTS API")

---

## 🧮 CÁLCULOS AUTOMÁTICOS - 8 FÓRMULAS

| Cálculo | Fórmula | Cuándo |
|---------|---------|--------|
| **Horas trabajadas mes** | `SUM(fichajes.horas_trabajadas)` WHERE mes=X | Al cerrar fichaje |
| **% Cumplimiento** | `(horas_trabajadas / horas_contrato) × 100` | Al consultar KPI |
| **Horas extra** | `MAX(0, horas_trabajadas - horas_contrato_dia)` | Al cerrar fichaje |
| **Coste laboral** | `salario_base + complemento + SUM(remuneraciones_extra)` | Al consultar KPI |
| **Coste por hora** | `coste_total / horas_trabajadas` | Al consultar KPI |
| **Incidencias** | `COUNT(incidencias_rrhh)` WHERE mes=X | Al consultar KPI |
| **Puntualidad** | `(dias_puntuales / dias_totales) × 100` | Al consultar KPI |
| **Promedio mensual** | `AVG(horas_trabajadas)` del año | Al consultar histórico |

**📄 Fórmulas detalladas en:** `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` (sección "CÁLCULOS INTERNOS")

---

## 🤖 ESCENARIOS MAKE - 5 FLUJOS

### 1. Alta Empleado
```
Trigger: POST /empleados/crear
→ Crear empleado
→ Crear permisos por defecto
→ Registrar histórico
→ Enviar email a gestoría
```

### 2. Fichajes en Tiempo Real ⚡
```
Trigger: POST /fichajes/registrar
→ Crear/actualizar fichaje
→ Calcular horas trabajadas
→ Detectar horas extra
→ Actualizar KPI del mes
→ Notificar si pasa > 120%
```

### 3. Consumos Internos
```
Trigger: PUT /consumos/{id}/aprobar
→ Actualizar estado
→ Registrar histórico
→ Imputar a centro de coste
```

### 4. Modificaciones RRHH
```
Trigger: PUT /empleados/{id}/modificar
→ Guardar datos anteriores en histórico
→ Actualizar empleado
→ Recalcular coste si cambia salario
→ Bloquear accesos si es baja
```

### 5. KPI Mensual ⭐ NUEVO
```
Trigger: GET /empleados/{id}/kpi
→ Calcular horas del mes
→ Calcular % cumplimiento
→ Calcular coste total
→ Contar incidencias
→ Calcular puntualidad
→ Obtener histórico (6 meses)
→ Calcular resumen anual
→ Devolver JSON completo
```

**📄 Flujos completos en:** `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` (sección "ESCENARIOS MAKE")

---

## 🎨 FRONTEND - EVENTOS PREPARADOS

Todos los botones y acciones del frontend tienen **eventos preparados con `console.log`** que muestran:

- 🔌 **Endpoint** a llamar
- 📦 **Payload** a enviar
- ⏰ **Timestamp** de la acción

### Ejemplo de evento (botón "Añadir Empleado"):

```typescript
console.log('🔌 EVENTO: CREAR_EMPLEADO', {
  endpoint: 'POST /empleados/crear',
  payload: {
    nombre: 'Juan',
    apellidos: 'Pérez García',
    puesto: 'Barista',
    // ... más datos
  },
  timestamp: new Date()
});
```

### ¿Qué debes hacer?

1. **Buscar** en el código los `console.log` con "🔌 EVENTO:"
2. **Reemplazar** el console.log con una llamada real a tu API
3. **Usar** el endpoint y payload que ya están preparados

**Ejemplo:**

```typescript
// ANTES (actual)
onClick={() => {
  console.log('🔌 EVENTO: CREAR_EMPLEADO', { ... });
}}

// DESPUÉS (con tu API)
onClick={async () => {
  try {
    const response = await fetch('/api/empleados/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    toast.success('Empleado creado correctamente');
  } catch (error) {
    toast.error('Error al crear empleado');
  }
}}
```

---

## ⭐ FOCUS: NUEVA PESTAÑA KPI

La **pestaña KPI** es lo último que se añadió y requiere atención especial.

### Estructura visual:

```
┌─────────────────────────────────────────────────────┐
│  KPI DEL MES ACTUAL                    [Nov 2024]  │
├─────────────────────────────────────────────────────┤
│  [Horas: 168/160]  [Coste: 2.520€]  [Incid: 2]    │
│  [Puntualidad: 95%]  [Productividad: +12%]         │
│  [Horas Extra: 8h]   [Formación: 12h]              │
├─────────────────────────────────────────────────────┤
│  HISTÓRICO DE MESES ANTERIORES                      │
├─────────────────────────────────────────────────────┤
│  Tabla con 6 columnas × N filas                     │
│  Gráfico de barras (evolución)                      │
│  Resumen anual (3 cards)                            │
├─────────────────────────────────────────────────────┤
│                            [Exportar KPIs (PDF)] →  │
└─────────────────────────────────────────────────────┘
```

### Endpoint principal:

```
GET /empleados/{id}/kpi?mes=11&año=2024
```

### JSON Response esperado:

```json
{
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
    "ausencias": 0
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
      "porcentaje": 100,
      "coste_total": 2400,
      "incidencias": 0,
      "puntualidad": 100
    }
    // ... más meses
  ],
  "resumen_anual": {
    "promedio_mensual": 156,
    "coste_total_anual": 28200,
    "incidencias_totales": 3
  }
}
```

**📄 Documentación completa en:** `/ACTUALIZACION_KPI_EMPLEADOS.md`

---

## 🚦 PLAN DE ACCIÓN SUGERIDO

### Semana 1: Base de Datos

- [ ] Día 1: Crear tablas de prioridad 1 (empresas, marcas, puntos_venta, empleados, permisos, fichajes)
- [ ] Día 2: Crear tablas de prioridad 2 (incidencias, documentación, remuneraciones, histórico, consumos)
- [ ] Día 3: Crear tabla **kpis_rrhh** (nueva)
- [ ] Día 4: Crear triggers automáticos (cálculo de horas, detección de horas extra)
- [ ] Día 5: Poblar datos de ejemplo para testing

### Semana 2: Endpoints Core

- [ ] Día 1: Endpoints de empleados (crear, listar, obtener, modificar)
- [ ] Día 2: Endpoints de fichajes (entrada, salida)
- [ ] Día 3: Endpoints de consumos (crear, aprobar, rechazar)
- [ ] Día 4: Endpoint de documentación (subir)
- [ ] Día 5: Endpoint de permisos (actualizar)

### Semana 3: Endpoints KPI ⭐

- [ ] Día 1-2: **GET /empleados/{id}/kpi** (implementar todos los cálculos)
- [ ] Día 3: **GET /empleados/{id}/kpi/historico** (obtener meses anteriores)
- [ ] Día 4: **GET /empleados/{id}/kpi/export** (generar PDF)
- [ ] Día 5: Testing de endpoints KPI

### Semana 4: Make

- [ ] Día 1: Escenario 1 (Alta empleado)
- [ ] Día 2: Escenario 2 (Fichajes en tiempo real)
- [ ] Día 3: Escenario 3 (Consumos internos)
- [ ] Día 4: Escenario 4 (Modificaciones RRHH)
- [ ] Día 5: **Escenario 5 (KPI mensual)** ⭐

### Semana 5: Testing e Integración

- [ ] Testing completo de todos los endpoints
- [ ] Conectar frontend con backend
- [ ] Testing de flujos completos
- [ ] Ajustes y correcciones

---

## 🆘 PREGUNTAS FRECUENTES

### ¿Por dónde empiezo?

1. Lee `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` (documento maestro)
2. Crea las 13 tablas SQL (empieza por las de prioridad 1)
3. Implementa el endpoint `POST /empleados/crear` (el más simple)
4. Prueba desde el frontend (busca el evento `CREAR_EMPLEADO`)
5. Continúa con los demás endpoints

### ¿Qué tecnologías debo usar?

**Esto depende de tu stack, pero recomendamos:**

- **Base de datos**: MySQL 8.0+ o PostgreSQL
- **Backend**: Node.js + Express, PHP + Laravel, Python + FastAPI, o cualquier framework REST
- **Make**: https://make.com (para automatizaciones)
- **Almacenamiento**: AWS S3, Cloudinary, o similar (para documentos)
- **PDF**: jsPDF, PDFKit, o similar

### ¿Cómo manejo los fichajes desde la app móvil?

Los fichajes vienen desde una app móvil (no incluida en este proyecto de frontend web). Debes:

1. Crear los endpoints `POST /fichajes/entrada` y `PUT /fichajes/{id}/salida`
2. Recibir: empleado_id, timestamp, ubicación (GPS)
3. Calcular automáticamente las horas trabajadas
4. Detectar horas extra si pasan de las horas contrato/día
5. Actualizar la tabla `kpis_rrhh` automáticamente

### ¿Cómo calculo las horas extra?

```javascript
// 1. Obtener horas contrato por día
const horas_contrato_dia = empleado.horas_contrato_mes / 20; // Ej: 160/20 = 8h

// 2. Calcular horas trabajadas del día
const entrada = new Date(fichaje.hora_entrada);
const salida = new Date(fichaje.hora_salida);
const horas_trabajadas_dia = (salida - entrada) / (1000 * 60 * 60);

// 3. Detectar horas extra
const horas_extra = Math.max(0, horas_trabajadas_dia - horas_contrato_dia);
// Ej: (8.5 - 8) = 0.5h extra
```

### ¿Cómo genero el PDF para exportar KPIs?

Opciones:

**Opción 1: jsPDF (JavaScript/Node.js)**
```javascript
const jsPDF = require('jspdf');
const doc = new jsPDF();

doc.text(`KPI - ${empleado.nombre}`, 10, 10);
doc.text(`Horas: ${kpi.horas.trabajadas}h`, 10, 20);
// ... más contenido

doc.save(`KPI_${empleado.id}_${mes}_${año}.pdf`);
```

**Opción 2: Puppeteer (renderizar HTML a PDF)**
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setContent(html_template);
await page.pdf({ path: 'kpi.pdf', format: 'A4' });
```

**Opción 3: Servicio externo (DocRaptor, PDFShift)**

### ¿Cómo manejo los permisos de usuario?

Hay una tabla `permisos` con un registro por empleado. Los campos booleanos son:

- `acceso_sistema`: Puede entrar a la plataforma web
- `fichar`: Puede fichar entrada/salida (app móvil)
- `ver_pedidos`: Puede ver pedidos (si aplica al negocio)
- `gestionar_pedidos`: Puede crear/modificar pedidos
- `gestionar_equipo`: Puede ver/gestionar otros empleados
- `baja_forzada`: Si está TRUE, el empleado está bloqueado

**Validación en cada endpoint:**
```javascript
// Ejemplo
app.get('/empleados', async (req, res) => {
  // 1. Obtener usuario actual del token/sesión
  const usuario = await getCurrentUser(req);
  
  // 2. Verificar permiso
  const permisos = await Permisos.findOne({ empleado_id: usuario.id });
  if (!permisos.gestionar_equipo) {
    return res.status(403).json({ error: 'Sin permisos' });
  }
  
  // 3. Continuar con la lógica
  const empleados = await Empleados.findAll();
  res.json({ empleados });
});
```

### ¿Qué pasa con los centros de coste?

Cada empleado puede tener **múltiples centros de coste** que sumen 100%.

**Ejemplo:**
```
Juan Pérez:
- 60% → Tienda Madrid Centro
- 30% → Obrador Central
- 10% → Marca Corporativa
---
Total: 100%
```

Esto sirve para **imputar costes** cuando el empleado trabaja en varios sitios. Debes validar que la suma siempre sea 100%:

```sql
-- Trigger de validación
CREATE TRIGGER validar_centros_coste
BEFORE INSERT ON centros_coste_empleado
FOR EACH ROW
BEGIN
  DECLARE total DECIMAL(5,2);
  
  SELECT SUM(porcentaje) INTO total
  FROM centros_coste_empleado
  WHERE empleado_id = NEW.empleado_id;
  
  IF total + NEW.porcentaje > 100 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'La suma de centros de coste no puede superar 100%';
  END IF;
END;
```

---

## 📞 CONTACTO Y SOPORTE

Si tienes dudas o problemas:

1. **Revisa primero:** `/INTEGRACION_COMPLETA_EQUIPO_RRHH.md` (99% de las dudas están ahí)
2. **Busca en el código:** Los eventos con `console.log` te guían
3. **Contacta al equipo:** [Tu canal de comunicación]

---

## ✅ CHECKLIST FINAL

Antes de dar por terminado el módulo, verifica:

### Base de Datos
- [ ] 13 tablas creadas correctamente
- [ ] Relaciones (FOREIGN KEY) funcionando
- [ ] Triggers de validación activos
- [ ] Índices para optimizar queries
- [ ] Datos de ejemplo poblados

### Endpoints
- [ ] 16 endpoints implementados
- [ ] Todos devuelven JSON correcto
- [ ] Manejo de errores implementado
- [ ] Validaciones de datos funcionando
- [ ] Autenticación y permisos activos

### Cálculos
- [ ] Horas trabajadas calculándose bien
- [ ] % Cumplimiento correcto
- [ ] Horas extra detectándose
- [ ] Coste laboral calculándose
- [ ] Puntualidad calculándose
- [ ] Promedio mensual correcto

### Make
- [ ] 5 escenarios configurados
- [ ] Webhooks conectados
- [ ] Emails enviándose
- [ ] Notificaciones funcionando

### Frontend ↔ Backend
- [ ] Todos los botones conectados
- [ ] Modales cargando datos
- [ ] Formularios enviando datos
- [ ] Toast notifications funcionando
- [ ] Exportación PDF funcionando

### Testing
- [ ] Test de cada endpoint
- [ ] Test de cálculos
- [ ] Test de flujos completos
- [ ] Test de casos extremos
- [ ] Test de rendimiento

---

**¡ÉXITO EN LA IMPLEMENTACIÓN! 🚀**

Este módulo es la **columna vertebral** del sistema Udar Edge. Con estos documentos tienes todo lo necesario para implementarlo sin dudas.

**Recuerda:** El frontend está 100% listo. Solo tienes que conectar el backend siguiendo esta guía.

---

**Última actualización:** 26 Noviembre 2024  
**Versión documento:** 1.0  
**Estado:** ✅ Completo y listo para desarrollo
