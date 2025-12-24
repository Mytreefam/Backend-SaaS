# 🎯 CÓMO EMPEZAR A TESTEAR - GUÍA VISUAL

**⏱️ Tiempo:** 2 minutos para empezar  
**🎓 Nivel:** Principiante  

---

## 🚀 OPCIÓN 1: TEST AUTOMÁTICO (RECOMENDADO)

### Paso 1: Ejecutar script de verificación
```bash
# En tu terminal, ejecuta:
chmod +x verificar-optimizaciones.sh
./verificar-optimizaciones.sh
```

### Paso 2: Ver resultados
```
✅ Si TODO pasa → Continúa con TEST MANUAL
❌ Si hay errores → Reporta los errores
```

---

## 🧪 OPCIÓN 2: TEST MANUAL RÁPIDO

### Paso 1: Arrancar la app
```bash
npm run dev
```

### Paso 2: Abrir navegador
```
http://localhost:5173
```

### Paso 3: Abrir DevTools
```
Presiona F12 (o Cmd+Option+I en Mac)
```

### Paso 4: Ir a Network tab
```
1. Click en "Network"
2. Asegúrate que esté grabando (botón rojo)
3. Recarga la página: Ctrl+Shift+R (Cmd+Shift+R en Mac)
```

### Paso 5: Verificar bundle inicial
```
Busca "app.js" en la lista
Debe decir: ~800 KB (o menos de 1 MB)

✅ Si es < 1 MB → EXCELENTE
❌ Si es > 2 MB → REPORTAR
```

### Paso 6: Login y verificar lazy loading
```
1. Click "Comenzar" (SplashScreen)
2. Seleccionar "Cliente"
3. Login con cualquier credencial
4. En DevTools > Network > Filtrar "chunk"
5. Debes ver: ClienteDashboard.chunk.js
6. NO debes ver: TrabajadorDashboard.chunk.js ni GerenteDashboard.chunk.js
```

### Paso 7: Test del carrito
```
1. Click "Elige tu producto" (menú lateral)
2. Añadir producto al carrito
3. Click icono del carrito (arriba derecha)
4. En Network debes ver: CestaOverlay.chunk.js (se carga ahora)
5. Modal debe abrirse correctamente
```

---

## 📊 OPCIÓN 3: TEST CON LIGHTHOUSE (Performance)

### Paso 1: DevTools > Lighthouse
```
1. Presiona F12
2. Click en "Lighthouse" tab (arriba)
3. Seleccionar:
   ✅ Performance
   ✅ Mobile
4. Click "Analyze page load"
5. Esperar 30 segundos
```

### Paso 2: Revisar score
```
Performance debe ser: > 80

Métricas clave:
✅ First Contentful Paint (FCP): < 1.5s
✅ Time to Interactive (TTI): < 2.5s
✅ Total Blocking Time (TBT): < 300ms
```

---

## 📚 GUÍAS DISPONIBLES

### Para Tests Rápidos (10-15 min)
```bash
# Abre este archivo:
TEST_INICIO_RAPIDO.md

# Contiene:
- 7 pasos de testing básico
- Checklist completa
- Reporte de errores
```

### Para Tests Completos (1-2 horas)
```bash
# Abre este archivo:
GUIA_TESTS_FUNCIONALES.md

# Contiene:
- 31 tests documentados
- Tests de performance
- Tests por dashboard
- Tests de funcionalidades
- Criterios de aceptación
```

### Para Ver Implementación Técnica
```bash
# Abre este archivo:
OPTIMIZACIONES_PERFORMANCE.md

# Contiene:
- 7 optimizaciones implementadas
- Código de ejemplo
- Métricas de impacto
- Configuración técnica
```

### Para Ver Resumen Ejecutivo
```bash
# Abre este archivo:
RESUMEN_IMPLEMENTACION_FINAL.md

# Contiene:
- Resumen completo de todo
- Checklist de estado
- Métricas finales
- Próximos pasos
```

---

## 🎯 FLUJO RECOMENDADO

```
1. Ejecutar script automático
   └→ ./verificar-optimizaciones.sh

2. Si pasa → Test manual rápido (10 min)
   └→ TEST_INICIO_RAPIDO.md

3. Si todo OK → Test completo (1-2 horas)
   └→ GUIA_TESTS_FUNCIONALES.md

4. Si todo OK → Tests en otros navegadores
   └→ Chrome, Firefox, Safari, Edge

5. Si todo OK → Tests en móvil
   └→ Dispositivos reales o emuladores

6. Reportar resultados
   └→ Completar checklist final
```

---

## ⚡ QUICK START (3 COMANDOS)

```bash
# 1. Verificar optimizaciones
./verificar-optimizaciones.sh

# 2. Arrancar app
npm run dev

# 3. Abrir navegador y testear
# → http://localhost:5173
```

---

## 🐛 SI ENCUENTRAS UN ERROR

### 1. Captura información
```
- ¿Qué hiciste?
- ¿Qué esperabas?
- ¿Qué pasó?
- Captura de pantalla
- Error en consola (F12 > Console)
```

### 2. Verifica entorno
```
- Navegador: Chrome/Firefox/Safari + versión
- OS: Windows/Mac/Linux
- Tamaño pantalla: Desktop/Mobile
- Versión Node: node --version
```

### 3. Intenta solución básica
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar caché del navegador
# DevTools > Application > Clear Storage > Clear site data

# Reintentar
npm run dev
```

### 4. Reporta el error
```
Incluir toda la información de los pasos 1 y 2
```

---

## 📞 AYUDA RÁPIDA

### Comandos útiles
```bash
# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Limpiar todo
rm -rf node_modules package-lock.json dist
npm install

# Build de producción
npm run build

# Ver tamaño del bundle
npm run build && ls -lh dist/assets/
```

### Atajos DevTools
```
F12                    = Abrir DevTools
Ctrl+Shift+R          = Recarga sin caché
Ctrl+Shift+Delete     = Borrar caché navegador
Ctrl+Shift+C          = Inspector de elementos
Ctrl+Shift+I          = Abrir DevTools
Esc                   = Abrir consola en cualquier tab
```

### URLs importantes
```
Desarrollo:  http://localhost:5173
Build Info:  Ver carpeta /dist después de npm run build
Docs:        Ver archivos .md en raíz del proyecto
```

---

## ✅ CHECKLIST PRE-TEST

Antes de empezar, asegúrate de:

- [ ] Node.js instalado (v16+)
- [ ] npm instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto compila (`npm run build`)
- [ ] DevTools funcionan en tu navegador
- [ ] Terminal abierta y funcionando

---

## 🎉 ¡LISTO PARA EMPEZAR!

### Recomendación:
```
1️⃣ Empieza con: TEST_INICIO_RAPIDO.md (10 min)
2️⃣ Si todo OK: GUIA_TESTS_FUNCIONALES.md (1-2 horas)
3️⃣ Documenta: Completa checklist y reporta resultados
```

---

## 📊 ESTRUCTURA DE DOCUMENTACIÓN

```
📁 Documentación de Tests
├── 📄 COMO_EMPEZAR_TESTS.md          ← ESTÁS AQUÍ
├── 📄 TEST_INICIO_RAPIDO.md           ← Test rápido (10 min)
├── 📄 GUIA_TESTS_FUNCIONALES.md       ← Test completo (31 tests)
├── 📄 OPTIMIZACIONES_PERFORMANCE.md   ← Docs técnicas
├── 📄 RESUMEN_IMPLEMENTACION_FINAL.md ← Resumen ejecutivo
└── 🔧 verificar-optimizaciones.sh     ← Script automático
```

---

**🚀 TODO LISTO - ¡A TESTEAR!**

**Próximo paso:** Ejecuta `./verificar-optimizaciones.sh` o abre `TEST_INICIO_RAPIDO.md`

---

**Última actualización:** Diciembre 2024  
**Estado:** ✅ Listo para usar  
**Duración total tests:** 10 minutos (rápido) o 1-2 horas (completo)  
