# 🧹 CÓMO LIMPIAR EL PROYECTO (Sin comandos)

> Guía visual paso a paso para eliminar archivos históricos

---

## 🎯 OBJETIVO

**Pasar de esto:**
```
📂 Raíz del proyecto
├── README.md
├── ACTUALIZACION_FILTROS_COMPLETADA.md ❌
├── AUDITORIA_CODIGO_COMPLETA.md ❌
├── ANALISIS_COMPONENTES.md ❌
├── FIX_MOBILE_NAVIGATION.md ❌
├── PROGRESO_100_COMPLETADO.md ❌
├── RESUMEN_SESION_UI_UX.md ❌
└── ... (200+ archivos) ❌
```

**A esto:**
```
📂 Raíz del proyecto
├── README.md ✅
├── START_HERE.md ✅
├── MAPA_PRIORIDADES.md ✅
├── GUIA_BACKEND_DEVELOPER.md ✅
├── ... (solo 12 archivos) ✅
│
└── 📁 _archive/
    └── (todo el histórico aquí)
```

---

## 📋 OPCIÓN 1: LIMPIAR CON VS CODE (Drag & Drop)

### **Paso 1: Crear carpeta `_archive`**

1. En VS Code, en el panel izquierdo (donde ves los archivos)
2. Click derecho en el espacio vacío
3. **"Nueva carpeta"** o **"New Folder"**
4. Llámala: `_archive`

### **Paso 2: Seleccionar archivos históricos**

**En VS Code, selecciona TODOS estos archivos** (Ctrl+Click o Cmd+Click):

```
Todos los que empiecen con:
- ACTUALIZACION_
- AUDITORIA_
- ANALISIS_
- FIX_
- PROGRESO_
- RESUMEN_
- IMPLEMENTACION_
- FASE1_, FASE2_, FASE3_, FASE4_
- CORRECCIONES_
- ERRORES_
- CAMBIOS_
- CHANGELOG_
- INTEGRACION_ (excepto CHECKLIST_INTEGRACION_BACKEND.md)
- DOCUMENTACION_ (todos los específicos)
- VERIFICACION_
- VALIDACION_
- SOLUCION_
- REVISION_
- REVERSION_
- LISTO_
- RECORDATORIO_
- TENANTS_
- TEST_ (excepto tests de código)
- DONDE_
- EJEMPLOS_
- ESTADO_
- ESPECIFICACION_
- ESTRUCTURA_ (excepto ESTRUCTURA_CODIGO.md y ESTRUCTURA_BBDD_COMPLETA.md)
- EVENTO_
- EXPERIENCIA_
- FILTROS_ (los históricos)
- FLUJO_
- FUNCIONALIDADES_ (históricos)
- INDEX_ / INDICE_
- README_ (excepto README.md principal)
- BOTON_
- COMO_ (excepto COMO_EMPEZAR_TESTS.md)
- COMPARACION_
- COMPONENTES_PENDIENTES
- CONEXION_
- CONFIGURACION_ (específicos)
- CONFIG_
- CUESTIONARIO_
- DASHBOARD_ (específicos)
- DATA_BINDINGS_
- DEPLOYMENT_SUMMARY
- DIAGNOSTICO_
- DIAGRAMA_
- ENDPOINT_
- SISTEMA_ (específicos)
- AMARRE_
- ARQUITECTURA_ (específicos)
- BIDIRECCIONALIDAD_
- FUSION_
- IMPLEMENTADO_
- INSTALACION_ (específicos)
- INSTRUCCIONES_
- LIMPIEZA_
- MAPA_VENTANAS_
- MEJORAS_
- MOBILE_BUILD_GUIDE (si no lo necesitas)
- MODULO_
- NAVEGACION_ (específicos)
- NOTIFICACIONES_ (específicos)
- ONBOARDING_ (específicos, no la guía principal)
- OPTIMIZACION_
- OPTIMIZACIONES_
- ORGANIZACION_COMPLETADA (este que creé)
- PERMISOS_ (específicos)
- PLAN_
```

### **Paso 3: Arrastrar a `_archive`**

1. Con todos seleccionados
2. **Arrastra** (drag) hacia la carpeta `_archive`
3. Suelta (drop)

✅ **¡Listo! Proyecto limpio**

---

## 📋 OPCIÓN 2: ELIMINAR DIRECTAMENTE (Más rápido)

### **Paso 1: Seleccionar archivos históricos**

Igual que arriba, selecciona todos los archivos con:
- ACTUALIZACION_
- AUDITORIA_
- ANALISIS_
- FIX_
- PROGRESO_
- RESUMEN_
- IMPLEMENTACION_
- Etc. (ver lista completa en ARCHIVOS_ESENCIALES.md)

### **Paso 2: Eliminar**

1. Con archivos seleccionados
2. Presiona **Delete** o **Suprimir**
3. Confirma

> ⚠️ **Nota:** Asegúrate de tener git commit antes, por si acaso

---

## 📋 OPCIÓN 3: USAR ARCHIVO DE REFERENCIA

**Usa el archivo que creé:** [`ARCHIVOS_ESENCIALES.md`](ARCHIVOS_ESENCIALES.md)

1. Abre ese archivo
2. Busca la sección **"✅ ESENCIALES (12 archivos)"**
3. **Mantén SOLO esos 12**
4. Elimina/mueve todo lo demás

---

## ✅ ARCHIVOS QUE DEBEN QUEDAR (12)

```
📂 Raíz del proyecto
│
├── ✅ README.md
├── ✅ START_HERE.md
├── ✅ QUICKSTART.md
├── ✅ MAPA_PRIORIDADES.md
├── ✅ ESTRUCTURA_CODIGO.md
├── ✅ GUIA_DESARROLLO.md
├── ✅ GUIA_BACKEND_DEVELOPER.md
├── ✅ GUIA_COMPLETA_APP_MOVIL.md
├── ✅ GUIA_WHITE_LABEL.md
├── ✅ ESTRUCTURA_BBDD_COMPLETA.md
├── ✅ CHECKLIST_INTEGRACION_BACKEND.md
├── ✅ COMO_EMPEZAR_TESTS.md
│
├── 📁 components/
├── 📁 contexts/
├── 📁 hooks/
├── 📁 services/
├── 📁 lib/
├── 📁 types/
├── 📁 config/
├── 📁 data/
├── 📁 docs/
├── 📁 styles/
├── 📁 android-config/
│
└── App.tsx
```

**Solo 12 archivos .md en la raíz** ✨

---

## 🎯 RESULTADO ESPERADO

### **Antes:**
- 📄 **200+ archivos** .md en raíz
- 😵 Confusión total
- ⏱️ 30 min para encontrar algo

### **Después:**
- 📄 **12 archivos** .md en raíz
- ✅ Claridad total
- ⚡ 2 min para encontrar algo

---

## 💡 PREGUNTAS FRECUENTES

### **¿Y si borro algo importante?**

✅ Los 12 archivos esenciales cubren TODO:
- README.md → Overview
- START_HERE.md → Quick start
- MAPA_PRIORIDADES.md → Qué es CORE
- GUIA_BACKEND_DEVELOPER.md → Backend completo
- ESTRUCTURA_BBDD_COMPLETA.md → Database
- Etc.

El resto son **históricos** de sesiones pasadas.

### **¿Puedo recuperar archivos borrados?**

✅ Sí, si usas git:
```bash
git log --all --full-history -- "ARCHIVO_BORRADO.md"
git checkout [commit] -- "ARCHIVO_BORRADO.md"
```

### **¿Y si el programador pregunta por algo específico?**

✅ Los 12 archivos esenciales tienen TODA la info:
- Schema DB
- Arquitectura
- Guías completas
- Estructura código
- Prioridades

Si falta algo, está en `/docs/README_DOCS.md`

### **¿Necesito hacer backup?**

✅ Si tienes git commits, no hace falta
✅ Si quieres estar seguro, copia la carpeta completa antes

---

## 🚀 VENTAJAS DE LIMPIAR

### **Para ti:**
- ✅ Proyecto profesional
- ✅ Fácil de navegar
- ✅ Fácil de explicar

### **Para el programador:**
- ✅ Sabe qué leer (12 archivos vs 200)
- ✅ No se confunde con históricos
- ✅ Onboarding en 1 hora (vs 1 día)

### **Para el equipo:**
- ✅ Estructura clara
- ✅ Menos ruido
- ✅ Más productividad

---

## 📞 ¿NECESITAS AYUDA?

Si tienes dudas sobre qué archivo específico eliminar:

1. Busca el nombre en [`ARCHIVOS_ESENCIALES.md`](ARCHIVOS_ESENCIALES.md)
2. Si tiene ✅ → **MANTENER**
3. Si tiene ❌ → **ELIMINAR/MOVER**
4. Si no aparece → **Probablemente eliminar**

---

## ✅ CHECKLIST

- [ ] Crear carpeta `_archive/` (opcional)
- [ ] Seleccionar archivos históricos (ver ARCHIVOS_ESENCIALES.md)
- [ ] Mover a `_archive/` o eliminar
- [ ] Verificar que quedan solo 12 archivos .md en raíz
- [ ] Commit los cambios en git
- [ ] ¡Listo! Proyecto limpio ✨

---

**🎯 Proyecto limpio = Programador feliz = Desarrollo más rápido**

*Tiempo estimado: 10-15 minutos*
