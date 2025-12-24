# ✅ NUEVA PESTAÑA KPI - PERFIL DE EMPLEADO

## 📋 RESUMEN

Se ha añadido una nueva pestaña **"KPI"** en el modal de Perfil de Empleado, ubicada entre "Documentación" y "Permisos".

---

## 🎯 UBICACIÓN

**Archivo:** `/components/gerente/EquipoRRHH.tsx`

**Modal:** Perfil de Empleado (Dashboard Gerente > Equipo y RRHH)

**Orden de pestañas:**
1. Cuenta
2. Fichajes
3. Documentación
4. **KPI** ← NUEVO
5. Permisos
6. Histórico

---

## 📊 CONTENIDO DE LA PESTAÑA KPI

### SECCIÓN 1: KPI DEL MES ACTUAL

#### 🔷 Cards Principales (3 columnas)

**1. Horas Trabajadas**
- Icono: Clock (azul)
- Muestra: `168h / 160h (105%)`
- Badge dinámico:
  - Verde si ≥ horas contrato
  - Amarillo si < horas contrato
- Cálculo: `(horasTrabajadas / horasContrato) × 100`

**2. Coste Laboral Estimado**
- Icono: DollarSign (morado)
- Muestra: `2.520 €`
- Subcalculo: `~15 €/hora`
- Fórmula: `horasTrabajadas × costePorHora`

**3. Incidencias**
- Icono: AlertCircle (amarillo/ámbar)
- Muestra: `2` (número de incidencias)
- Detalle: `1 baja, 1 retraso`
- Badge: "2 activas"

#### 🔶 KPIs Secundarios (2 columnas x 4)

**1. Puntualidad**
- Icono: CheckCircle (verde)
- Porcentaje: `95%`
- Detalle: `19 de 20 días`
- Badge verde

**2. Productividad**
- Icono: TrendingUp (teal)
- Incremento: `+12%`
- Detalle: `45 tareas este mes`
- Badge teal

**3. Horas Extra**
- Icono: Clock (azul)
- Total: `8h`
- Estado: `Compensación pendiente`
- Badge outline

**4. Formación**
- Icono: Award (morado)
- Horas: `12h`
- Detalle: `3 cursos finalizados`
- Badge outline

---

### SECCIÓN 2: HISTÓRICO DE MESES ANTERIORES

#### 📊 Tabla Comparativa

**Columnas:**
1. **Mes**: Nombre del mes (ej: Octubre 2024)
2. **Horas**: Trabajadas / Contratadas
3. **% Cumplimiento**: Badge con color según %
4. **Coste**: Coste laboral total del mes
5. **Incidencias**: Número de incidencias
6. **Puntualidad**: Porcentaje de puntualidad

**Colores de Badges:**
- Verde: 100% cumplimiento
- Amarillo: 95-99% cumplimiento
- Azul: < 95% cumplimiento

**Ejemplo de datos:**

| Mes | Horas | % | Coste | Incidencias | Puntualidad |
|-----|-------|---|-------|-------------|-------------|
| Octubre 2024 | 160h / 160h | 100% | 2.400 € | 0 | 100% |
| Septiembre 2024 | 155h / 160h | 97% | 2.325 € | 1 | 98% |
| Agosto 2024 | 120h / 160h | 75% | 1.800 € | 0 | 100% |
| Julio 2024 | 165h / 160h | 103% | 2.475 € | 0 | 100% |

#### 📈 Gráfico de Evolución

**Gráfico de barras** mostrando evolución de horas trabajadas:
- Eje X: Meses (Agosto - Noviembre)
- Eje Y: Horas trabajadas
- Color actual (Nov): Teal
- Colores anteriores: Gradiente azul
- Altura relativa a horas contrato (160h = 100%)

#### 📌 Resumen Anual (3 Cards)

**1. Promedio Mensual**
- Valor: `156h`
- Color: Azul
- Fórmula: `SUM(horas_meses) / COUNT(meses)`

**2. Coste Total Anual**
- Valor: `28.200 €`
- Color: Morado
- Fórmula: `SUM(costes_mensuales)`

**3. Incidencias Totales**
- Valor: `3`
- Color: Verde
- Fórmula: `COUNT(incidencias_año)`

---

## 🔌 EVENTOS IMPLEMENTADOS

### Exportar KPIs

```typescript
console.log('🔌 EVENTO: EXPORTAR_KPI_EMPLEADO', {
  empleadoId: empleadoSeleccionado.id,
  endpoint: `GET /empleados/${empleadoSeleccionado.id}/kpi/export`,
  timestamp: new Date()
});
```

**Acción:** Botón "Exportar KPIs" al final de la pestaña

**Función:** Descargar informe completo en PDF con todos los KPIs del empleado

---

## 📊 CÁLCULOS MAKE / BACKEND

### 1. Porcentaje de Cumplimiento
```javascript
porcentaje_cumplimiento = (horas_trabajadas / horas_contrato) × 100
```

### 2. Coste Laboral
```javascript
coste_laboral = horas_trabajadas × coste_por_hora
```

### 3. Puntualidad
```javascript
puntualidad = (dias_puntuales / dias_totales) × 100
```

### 4. Promedio Mensual
```javascript
promedio_mensual = SUM(horas_meses) / COUNT(meses)
```

### 5. Tendencia de Productividad
```javascript
tendencia = ((tareas_mes_actual - tareas_mes_anterior) / tareas_mes_anterior) × 100
```

---

## 🎨 DISEÑO Y COLORES

### Paleta de Colores

**KPIs Principales:**
- Horas: Azul (`bg-blue-50`, `bg-blue-600`)
- Coste: Morado (`bg-purple-50`, `bg-purple-600`)
- Incidencias: Ámbar/Amarillo (`bg-amber-50`, `bg-amber-600`)

**KPIs Secundarios:**
- Puntualidad: Verde (`bg-green-100`, `text-green-600`)
- Productividad: Teal (`bg-teal-100`, `text-teal-600`)
- Horas Extra: Azul (`bg-blue-100`, `text-blue-600`)
- Formación: Morado (`bg-purple-100`, `text-purple-600`)

### Gradientes

Cards principales usan gradientes:
```css
bg-gradient-to-br from-blue-50 to-blue-100/50
bg-gradient-to-br from-purple-50 to-purple-100/50
bg-gradient-to-br from-amber-50 to-amber-100/50
```

### Tipografía

- **Títulos principales:** `text-lg font-medium` (Poppins)
- **Valores grandes:** `text-2xl font-bold` o `text-3xl font-bold`
- **Etiquetas:** `text-sm text-gray-600`
- **Detalles:** `text-xs text-gray-500`

---

## 📱 RESPONSIVE

### Desktop (≥ 768px)
- Cards principales: 3 columnas (`md:grid-cols-3`)
- KPIs secundarios: 2 columnas (`md:grid-cols-2`)
- Tabla: Visible completa

### Mobile (< 768px)
- Cards principales: 1 columna
- KPIs secundarios: 1 columna
- Tabla: Scroll horizontal

---

## 🔗 ENDPOINTS REQUERIDOS

### 1. Obtener KPIs del mes actual
```
GET /empleados/{id}/kpi/actual
```

**Response:**
```json
{
  "mes": "noviembre",
  "año": 2024,
  "horasTrabajadas": 168,
  "horasContrato": 160,
  "costePorHora": 15,
  "costeTotal": 2520,
  "incidencias": {
    "total": 2,
    "desglose": [
      { "tipo": "baja", "count": 1 },
      { "tipo": "retraso", "count": 1 }
    ]
  },
  "puntualidad": {
    "porcentaje": 95,
    "diasPuntuales": 19,
    "diasTotales": 20
  },
  "productividad": {
    "tareasCompletadas": 45,
    "tendencia": 12
  },
  "horasExtra": 8,
  "formacion": {
    "horas": 12,
    "cursosFinalizados": 3
  }
}
```

### 2. Obtener histórico de KPIs
```
GET /empleados/{id}/kpi/historico?meses=6
```

**Response:**
```json
{
  "meses": [
    {
      "mes": "octubre",
      "año": 2024,
      "horasTrabajadas": 160,
      "horasContrato": 160,
      "porcentajeCumplimiento": 100,
      "costeTotal": 2400,
      "incidencias": 0,
      "puntualidad": 100
    },
    // ... más meses
  ],
  "resumenAnual": {
    "promedioMensual": 156,
    "costeTotalAnual": 28200,
    "incidenciasTotales": 3
  }
}
```

### 3. Exportar KPIs en PDF
```
GET /empleados/{id}/kpi/export?format=pdf
```

**Response:** Archivo PDF descargable con informe completo

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Frontend ✅
- [x] Pestaña añadida al TabsList
- [x] Contenido de la pestaña KPI
- [x] Cards de KPIs principales
- [x] KPIs secundarios
- [x] Tabla histórica
- [x] Gráfico de evolución
- [x] Resumen anual
- [x] Botón exportar con evento
- [x] Diseño responsive
- [x] Colores y tipografía

### Backend (Pendiente)
- [ ] Endpoint: GET /empleados/{id}/kpi/actual
- [ ] Endpoint: GET /empleados/{id}/kpi/historico
- [ ] Endpoint: GET /empleados/{id}/kpi/export
- [ ] Cálculo de porcentaje cumplimiento
- [ ] Cálculo de coste laboral
- [ ] Cálculo de puntualidad
- [ ] Cálculo de productividad
- [ ] Generación de PDF

### Base de Datos (Pendiente)
- [ ] Tabla: empleado_kpi_mensual
- [ ] Tabla: empleado_incidencias
- [ ] Tabla: empleado_formacion
- [ ] Vista: kpi_resumen_anual
- [ ] Trigger: actualizar_kpi_al_fichar

---

## 🗂️ ESTRUCTURA DE TABLAS SUGERIDA

### Tabla: empleado_kpi_mensual
```sql
CREATE TABLE empleado_kpi_mensual (
  id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  mes INT NOT NULL,
  año INT NOT NULL,
  horas_trabajadas DECIMAL(5,2),
  horas_contrato DECIMAL(5,2),
  coste_por_hora DECIMAL(10,2),
  coste_total DECIMAL(10,2),
  dias_puntuales INT,
  dias_totales INT,
  tareas_completadas INT,
  horas_extra DECIMAL(5,2),
  horas_formacion DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id),
  UNIQUE KEY unique_empleado_mes (empleado_id, mes, año)
);
```

### Tabla: empleado_incidencias
```sql
CREATE TABLE empleado_incidencias (
  id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  tipo ENUM('baja', 'retraso', 'ausencia', 'otro'),
  fecha DATE NOT NULL,
  descripcion TEXT,
  estado ENUM('activa', 'resuelta') DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);
```

### Tabla: empleado_formacion
```sql
CREATE TABLE empleado_formacion (
  id VARCHAR(50) PRIMARY KEY,
  empleado_id VARCHAR(50) NOT NULL,
  curso_nombre VARCHAR(200),
  horas DECIMAL(5,2),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado ENUM('en_curso', 'completado', 'cancelado'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);
```

---

## 🚀 PRÓXIMOS PASOS

### Para el Programador Backend:

1. **Crear las tablas** de base de datos sugeridas
2. **Implementar los endpoints** documentados
3. **Conectar el evento** de exportación (`EXPORTAR_KPI_EMPLEADO`)
4. **Implementar los cálculos** automáticos
5. **Crear triggers** para actualizar KPIs automáticamente al fichar
6. **Generar PDF** con biblioteca como jsPDF o similar
7. **Poblar datos de ejemplo** para testing

### Testing:

- [ ] Verificar cálculo de porcentajes
- [ ] Validar datos históricos
- [ ] Comprobar exportación PDF
- [ ] Test responsive en mobile
- [ ] Test de rendimiento con muchos meses

---

## 📸 REFERENCIA VISUAL

La pestaña KPI muestra:
- **Arriba:** 3 cards grandes con KPIs principales (Horas, Coste, Incidencias)
- **Medio:** 4 cards pequeños con KPIs secundarios (Puntualidad, Productividad, Horas Extra, Formación)
- **Separador**
- **Tabla comparativa** de meses anteriores
- **Gráfico de barras** de evolución
- **3 cards de resumen anual**
- **Botón exportar** al final

---

**Fecha de implementación:** 26 Noviembre 2024  
**Versión:** Udar Edge 2.0  
**Estado:** ✅ FRONTEND COMPLETO - BACKEND PENDIENTE
