# ✨ LECTURA AUTOMÁTICA DE DOCUMENTOS CON IA

**Fecha**: 3 de Diciembre 2025  
**Módulo**: Documentación y Vehículos (Gerente)  
**Funcionalidad**: OCR + IA para auto-completar campos  
**Estado**: ✅ **IMPLEMENTADO**

---

## 🎯 ¿QUÉ HACE?

Cuando subes un documento en **Documentación y Vehículos**, el sistema:

1. 📄 **Lee el archivo** con IA (simulado OCR/GPT-4 Vision)
2. 🔍 **Extrae información** según la categoría del documento
3. ✨ **Auto-completa los campos** del formulario
4. ⚡ **En 2 segundos** tiene todo listo

---

## 🎨 FLUJO VISUAL

### **1. Modal inicial**

```
┌────────────────────────────────────────┐
│ ✨ Subir Documento                     │
│                                        │
│ Sube el archivo y la IA extraerá      │
│ la información automáticamente         │
│                                        │
│ Nombre: _________________________     │
│ Categoría: [Vehículos ▼]              │
│ Empresa: [Disarmink... ▼]             │
│ PDV: [Tiana ▼]                        │
│ Archivo: [Seleccionar archivo]        │
│                                        │
│ [Cancelar] [Subir Documento]          │
└────────────────────────────────────────┘
```

### **2. Selecciona archivo → IA procesando**

```
┌────────────────────────────────────────┐
│ ✨ Subir Documento                     │
│                                        │
│ Nombre: _________________________     │
│ Categoría: [Vehículos ▼]              │
│ Empresa: [Disarmink... ▼]             │
│ PDV: [Tiana ▼]                        │
│ Archivo: [🔄 Analizando...]           │ ← Spinner
│                                        │
│ [Cancelar] [🔄 Analizando...]         │
└────────────────────────────────────────┘
```

### **3. IA completada → Campos auto-rellenados**

```
┌────────────────────────────────────────┐
│ ✨ Subir Documento                     │
│                                        │
│ Nombre: Seguro Vehículo Toyota 2025   │ ← Auto-rellenado
│ Categoría: [Vehículos ▼]              │
│ Empresa: [Disarmink... ▼]             │
│ PDV: [Tiana ▼]                        │
│ Archivo: ✅ Documento analizado con IA│
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ✨ Campos detectados automáticamente   │
│                                        │
│ Vencimiento: 2026-12-03               │ ← Extraído
│ Coste (€): 425.50                     │ ← Extraído
│ Observaciones: Seguro a todo riesgo...│ ← Extraído
│                                        │
│ [Cancelar] [Subir Documento]          │
└────────────────────────────────────────┘
```

---

## 📊 CAMPOS EXTRAÍDOS POR CATEGORÍA

### 🚗 **Vehículos**
- **Nombre**: Nombre del archivo (limpio)
- **Vencimiento**: +1 año desde hoy
- **Coste**: 200€ - 700€ (aleatorio)
- **Observaciones**: "Seguro a todo riesgo con franquicia de 300€"

### 📄 **Contratos y Alquileres**
- **Nombre**: Nombre del archivo
- **Vencimiento**: +2 años desde hoy
- **Coste**: 500€ - 2,500€ (aleatorio)
- **Observaciones**: "Renovación automática salvo notificación con 60 días de antelación"

### 🔑 **Licencias**
- **Nombre**: Nombre del archivo
- **Vencimiento**: +1 año desde hoy
- **Coste**: 50€ - 350€ (aleatorio)
- **Observaciones**: "Licencia anual, incluye 5 usuarios"

### 📊 **Fiscalidad**
- **Nombre**: Nombre del archivo
- **Vencimiento**: +90 días desde hoy
- **Coste**: (vacío)
- **Observaciones**: "Presentación trimestral - Modelo 303 IVA"

### 🏢 **Sociedad**
- **Nombre**: Nombre del archivo
- **Vencimiento**: (vacío)
- **Coste**: (vacío)
- **Observaciones**: "Escritura de constitución de la sociedad"

### 📦 **Otros**
- **Nombre**: Nombre del archivo
- **Vencimiento**: (vacío)
- **Coste**: (vacío)
- **Observaciones**: (vacío)

---

## 🔧 CÓMO FUNCIONA

### **Función principal: `leerDocumentoConIA()`**

```typescript
const leerDocumentoConIA = async (archivo: File, categoria: string) => {
  // 1️⃣ Mostrar loader
  setLeyendoDocumento(true);

  // 2️⃣ Simular llamada a API de IA (2 segundos)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3️⃣ Extraer datos según categoría
  let datosExtraidos = {};
  
  switch (categoria) {
    case 'vehiculos':
      datosExtraidos = {
        nombre: archivo.name,
        vencimiento: '2026-12-03',
        coste: '425.50',
        observaciones: 'Seguro a todo riesgo...'
      };
      break;
    // ... más categorías
  }

  // 4️⃣ Auto-rellenar campos
  setDocNombre(datosExtraidos.nombre);
  setDocVencimiento(datosExtraidos.vencimiento);
  setDocCoste(datosExtraidos.coste);
  setDocObservaciones(datosExtraidos.observaciones);

  // 5️⃣ Ocultar loader y notificar
  setLeyendoDocumento(false);
  toast.success('Documento analizado con IA');
};
```

---

## 🎬 EVENTOS PARA BACKEND/MAKE

### **Evento: LECTURA_DOCUMENTO_IA**

```json
{
  "evento": "LECTURA_DOCUMENTO_IA",
  "endpoint": "POST /api/documentos/ocr",
  "payload": {
    "archivo": "seguro-vehiculo.pdf",
    "categoria": "vehiculos",
    "tipo_ocr": "GPT-4-Vision / Azure Document Intelligence"
  },
  "timestamp": "2025-12-03T10:30:00Z"
}
```

**Backend debería**:
1. Recibir el archivo
2. Enviar a servicio OCR/IA (Azure, Google Vision, GPT-4V)
3. Parsear respuesta JSON
4. Devolver campos extraídos

**Respuesta esperada**:
```json
{
  "nombre": "Seguro Vehículo Toyota Corolla",
  "vencimiento": "2026-12-03",
  "coste": "425.50",
  "observaciones": "Seguro a todo riesgo con franquicia de 300€",
  "confianza": 0.95,
  "campos_adicionales": {
    "compania": "Mapfre",
    "poliza": "POL-123456",
    "vehiculo": "Toyota Corolla"
  }
}
```

---

## ✨ CARACTERÍSTICAS AVANZADAS

### **1. Cambio de categoría recalcula**
Si cambias la categoría después de subir el archivo, la IA **vuelve a analizar** con las reglas de la nueva categoría.

```
Usuario sube: "documento.pdf"
Categoría: Vehículos → IA extrae: vencimiento 1 año, coste 450€
Usuario cambia a: Licencias → IA recalcula: vencimiento 1 año, coste 150€
```

### **2. Validación de archivo**
Solo acepta:
- ✅ PDF
- ✅ Word (.doc, .docx)
- ✅ Imágenes (.jpg, .jpeg, .png)

### **3. Campos editables**
Aunque la IA rellena los campos, el usuario puede **editar manualmente** cualquier valor.

### **4. Estados visuales**

| Estado | Visual |
|--------|--------|
| Sin archivo | Input normal |
| Leyendo | 🔄 Spinner + input disabled |
| Completado | ✅ "Documento analizado con IA" |
| Error | ❌ Mensaje de error |

---

## 🚀 MEJORAS FUTURAS (BACKEND REAL)

### **Con IA real (GPT-4 Vision / Azure)**:

1. **Extracción de campos específicos**:
   ```
   - Número de póliza
   - Compañía aseguradora
   - Matrícula del vehículo
   - CIF/NIF del contratante
   - Firma digital
   - Código de barras
   ```

2. **Validación inteligente**:
   ```
   - Verificar formato de fechas
   - Comprobar coherencia de importes
   - Detectar documentos duplicados
   - Validar firmas
   ```

3. **Categorización automática**:
   ```
   - La IA detecta si es un seguro, contrato, licencia, etc.
   - Auto-selecciona la categoría correcta
   ```

4. **Extracción multi-página**:
   ```
   - Leer tablas complejas
   - Extraer anexos
   - Detectar cláusulas importantes
   ```

5. **OCR multiidioma**:
   ```
   - Español
   - Catalán
   - Inglés
   - Detectar idioma automáticamente
   ```

---

## 🎯 CASOS DE USO

### **Caso 1: Seguro de vehículo**
1. Usuario selecciona "Vehículos"
2. Sube "seguro-toyota.pdf"
3. IA extrae:
   - Vencimiento: 15/12/2026
   - Coste: 450€/año
   - Observaciones: "Todo riesgo, franquicia 300€"
4. Usuario revisa y confirma
5. ✅ Documento guardado

### **Caso 2: Contrato de alquiler**
1. Usuario selecciona "Contratos y Alquileres"
2. Sube "alquiler-local.pdf"
3. IA extrae:
   - Vencimiento: 01/01/2027
   - Coste: 1,200€/mes
   - Observaciones: "Renovación tácita 60 días"
4. ✅ Documento guardado

### **Caso 3: Licencia software**
1. Usuario selecciona "Licencias"
2. Sube "licencia-office365.pdf"
3. IA extrae:
   - Vencimiento: 01/06/2026
   - Coste: 120€/año
   - Observaciones: "5 usuarios incluidos"
4. ✅ Documento guardado

---

## 🔍 VERIFICACIÓN

### **Pasos para probar**:

1. ✅ Ve a **Documentación y Vehículos**
2. ✅ Haz clic en **"Subir Documento"**
3. ✅ Verifica el icono ✨ en el título y descripción
4. ✅ Selecciona **Categoría: "Vehículos"**
5. ✅ Haz clic en **"Seleccionar archivo"** y elige cualquier archivo
6. ✅ Observa el spinner 🔄 durante 2 segundos
7. ✅ Verifica que aparece "✅ Documento analizado con IA"
8. ✅ Comprueba que se muestran los campos:
   - Vencimiento (con fecha)
   - Coste (con importe)
   - Observaciones (con texto)
9. ✅ Cambia la categoría a **"Licencias"**
10. ✅ Verifica que los campos se actualizan automáticamente
11. ✅ Edita manualmente cualquier campo
12. ✅ Haz clic en **"Subir Documento"** y verifica el toast

---

## 📋 ARCHIVOS MODIFICADOS

| Archivo | Cambios |
|---------|---------|
| `/components/gerente/DocumentacionGerente.tsx` | 1. Agregados estados: `docVencimiento`, `docCoste`, `docObservaciones`, `leyendoDocumento`, `archivoSeleccionado` |
| | 2. Agregada función `leerDocumentoConIA()` con lógica por categoría |
| | 3. Agregados iconos `Loader2`, `Sparkles` |
| | 4. Actualizado modal con campos dinámicos |
| | 5. Agregado manejo de archivo con onChange |
| | 6. Agregado spinner visual durante lectura |
| | 7. Agregada sección "Campos detectados automáticamente" |

---

## 🎨 COMPONENTES VISUALES NUEVOS

### **1. Indicador de IA en título**
```tsx
<DialogTitle className="flex items-center gap-2">
  <Upload className="w-5 h-5" />
  Subir Documento
</DialogTitle>
<DialogDescription className="flex items-center gap-2">
  <Sparkles className="w-4 h-4 text-teal-600" />
  Sube el archivo y la IA extraerá la información automáticamente
</DialogDescription>
```

### **2. Spinner durante lectura**
```tsx
{leyendoDocumento && (
  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
  </div>
)}
```

### **3. Badge de confirmación**
```tsx
{archivoSeleccionado && !leyendoDocumento && (
  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">
    <Sparkles className="w-4 h-4" />
    <span>Documento analizado con IA</span>
  </div>
)}
```

### **4. Sección de campos extraídos**
```tsx
<div className="space-y-3 border-t pt-4">
  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
    <Sparkles className="w-4 h-4 text-teal-600" />
    <span>Campos detectados automáticamente</span>
  </div>
  {/* Campos aquí */}
</div>
```

---

## 💡 NOTAS TÉCNICAS

### **Simulación vs Real**:
- **Actual**: `setTimeout(2000)` simula llamada API
- **Real**: `await fetch('/api/documentos/ocr', { ... })`

### **Tipos de archivo aceptados**:
```typescript
accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
```

### **Botón deshabilitado mientras procesa**:
```typescript
disabled={!archivoSeleccionado || leyendoDocumento}
```

---

## ✅ RESUMEN EJECUTIVO

**Funcionalidad**: Lectura automática de documentos con IA  
**Tiempo de lectura**: 2 segundos (simulado)  
**Categorías soportadas**: Vehículos, Contratos, Licencias, Fiscalidad, Sociedad, Otros  
**Campos auto-completados**: Nombre, Vencimiento, Coste, Observaciones  
**Estado**: ✅ **100% Funcional en modo mock**

---

**🎉 ¡Ahora subir documentos es automático y mágico!** ✨
