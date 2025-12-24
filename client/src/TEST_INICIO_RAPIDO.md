# ⚡ TEST - INICIO RÁPIDO

**Duración estimada:** 10-15 minutos  
**Nivel:** Básico  
**Objetivo:** Verificar optimizaciones y funcionalidad principal

---

## 🚀 PASO 1: ARRANCAR LA APLICACIÓN

### En tu terminal:
```bash
# 1. Asegúrate de estar en el directorio del proyecto
cd /path/to/udar-edge

# 2. Instalar dependencias (si no lo has hecho)
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Debería abrirse en: http://localhost:5173
```

**✅ Verificación:** El navegador debe abrir automáticamente

---

## 🔍 PASO 2: VERIFICAR LAZY LOADING (Performance)

### Abrir DevTools
```
Windows/Linux: F12 o Ctrl + Shift + I
Mac: Cmd + Option + I
```

### Test de Bundle Inicial
1. ✅ Ir a **Network** tab
2. ✅ Recargar la página: `Ctrl/Cmd + Shift + R`
3. ✅ Buscar `app.js` en la lista
4. ✅ Verificar tamaño: **debe ser ≤ 1 MB**

**Resultado Esperado:**
```
✅ app.js: ~800 KB
✅ Total transferido: ~1.2 MB
✅ Tiempo de carga: < 3s
```

**❌ Si ves > 2 MB:** Algo salió mal, reportar

---

## 👤 PASO 3: TEST CLIENTE DASHBOARD

### 3.1 Login como Cliente
1. ✅ En la pantalla inicial, click **"Comenzar"** (SplashScreen)
2. ✅ Seleccionar perfil: **"Cliente"**
3. ✅ Hacer login con cualquier credencial

### 3.2 Verificar Lazy Loading del Dashboard
**DevTools > Network > Filtrar por "chunk"**

**Debes ver:**
```
✅ ClienteDashboard.chunk.js (~600 KB) ← SE CARGA
❌ TrabajadorDashboard.chunk.js ← NO SE CARGA
❌ GerenteDashboard.chunk.js ← NO SE CARGA
```

### 3.3 Test de Navegación Básica
Click en cada sección del menú:
- ✅ **Inicio** → Debe cargar InicioCliente
- ✅ **Elige tu producto** → Debe cargar CatalogoPromos
- ✅ **Pedidos** → Debe cargar MisPedidos
- ✅ **Chat** → Debe cargar ChatCliente

**❌ Si alguna sección no carga:** Abrir consola (F12 > Console) y copiar el error

### 3.4 Test del Carrito (Lazy Loading de Modal)
1. ✅ Ir a **"Elige tu producto"**
2. ✅ Click en cualquier producto → **"Añadir al carrito"**
3. ✅ Click en icono del carrito (arriba derecha)

**DevTools > Network:**
```
✅ CestaOverlay.chunk.js se debe cargar AHORA (lazy)
✅ Modal debe abrirse con LoadingFallback primero
✅ Productos visibles en la cesta
```

### 3.5 Test de Modal "Nueva Cita" (Lazy Loading)
1. ✅ En el sidebar (izquierda), click **"Nueva Cita"**

**DevTools > Network:**
```
✅ NuevaCitaModal.chunk.js se carga AHORA (lazy)
✅ LoadingFallback visible ~500ms
✅ Modal se abre correctamente
```

**Resultado Esperado Cliente:**
```
✅ Dashboard carga rápido (~1.2s)
✅ Solo ClienteDashboard.chunk.js cargado
✅ Modales cargan bajo demanda
✅ Navegación fluida sin errores
✅ Carrito funciona correctamente
```

---

## 👨‍💼 PASO 4: TEST GERENTE DASHBOARD + TPV

### 4.1 Cambiar a Gerente
1. ✅ Logout (botón sidebar)
2. ✅ Login como **"Gerente"**

### 4.2 Verificar Lazy Loading
**DevTools > Network > Clear > Filtrar "chunk"**

**Debes ver:**
```
✅ GerenteDashboard.chunk.js (~700 KB) ← SE CARGA
❌ ClienteDashboard.chunk.js ← NO SE CARGA
❌ TPV360Master.chunk.js ← NO SE CARGA AÚN
```

### 4.3 Test de TPV360Master (Lazy Loading)
1. ✅ En el menú, click **"TPV 360 - Base"**
2. ✅ Debe aparecer modal de selección de PDV
3. ✅ Seleccionar cualquier punto de venta
4. ✅ Click **"Confirmar"**

**DevTools > Network:**
```
✅ ModalSeleccionTPV.chunk.js se carga (lazy)
✅ TPV360Master.chunk.js se carga AHORA (lazy, ~700 KB)
✅ LoadingFallback visible ~1s
✅ TPV se muestra correctamente
```

### 4.4 Test Operativa del TPV
1. ✅ Click **"Abrir Caja"**
2. ✅ Ingresar monto: **100.00**
3. ✅ Click **"Confirmar"**
4. ✅ Añadir 2-3 productos al ticket
5. ✅ Click **"Cobrar"**
6. ✅ Seleccionar método de pago: **Efectivo**
7. ✅ Completar pago

**Resultado Esperado Gerente:**
```
✅ GerenteDashboard carga rápido
✅ TPV se carga SOLO al acceder (~1s extra)
✅ Apertura de caja funciona
✅ Añadir productos funciona
✅ Sistema de cobro funciona
✅ Toast confirmaciones aparecen
```

---

## 📊 PASO 5: TEST DE PERFORMANCE (Lighthouse)

### Ejecutar Lighthouse
1. ✅ DevTools > **Lighthouse** tab
2. ✅ Seleccionar:
   - ✅ **Performance**
   - ✅ **Mobile**
3. ✅ Click **"Analyze page load"**
4. ✅ Esperar ~30s

### Resultados Esperados
```
✅ Performance: > 80
✅ Accessibility: > 85
✅ Best Practices: > 80
✅ SEO: > 75

Métricas clave:
✅ First Contentful Paint (FCP): < 1.5s
✅ Largest Contentful Paint (LCP): < 2.5s
✅ Time to Interactive (TTI): < 2.5s
✅ Total Blocking Time (TBT): < 300ms
✅ Cumulative Layout Shift (CLS): < 0.1
```

**❌ Si Performance < 70:** Algo salió mal, reportar

---

## 🖼️ PASO 6: TEST DE LAZY LOADING DE IMÁGENES

### Verificar Imágenes
1. ✅ Ir a **"Elige tu producto"** (Cliente)
2. ✅ DevTools > Network > Img
3. ✅ Hacer scroll LENTO hacia abajo

**Debes observar:**
```
✅ Imágenes se cargan AL entrar en viewport
✅ NO todas las imágenes cargan al inicio
✅ "loading=lazy" en inspector (DevTools > Elements)
```

### Cómo verificar:
```
1. Click derecho en una imagen
2. "Inspeccionar elemento"
3. Ver en el código HTML:
   <img src="..." loading="lazy" ... />
```

---

## ✅ PASO 7: CHECKLIST FINAL

### Performance
- [ ] Bundle inicial ≤ 1 MB
- [ ] TTI < 2.5s
- [ ] Lighthouse Performance > 80
- [ ] Lazy loading dashboards funciona
- [ ] Lazy loading modales funciona
- [ ] Lazy loading TPV funciona
- [ ] Lazy loading imágenes funciona

### Funcionalidad Cliente
- [ ] Login funciona
- [ ] Navegación entre secciones
- [ ] Carrito funciona
- [ ] Modal "Nueva Cita" abre
- [ ] Productos se muestran
- [ ] Sin errores en consola

### Funcionalidad Gerente
- [ ] Login funciona
- [ ] Dashboard 360 muestra KPIs
- [ ] Acceso a TPV funciona
- [ ] Modal selección PDV funciona
- [ ] TPV carga correctamente
- [ ] Apertura de caja funciona
- [ ] Añadir productos funciona
- [ ] Sistema de cobro funciona

### Calidad General
- [ ] Sin errores en consola
- [ ] Sin warnings críticos
- [ ] LoadingFallback aparece al cargar
- [ ] Transiciones suaves
- [ ] Responsive en móvil
- [ ] Todo funcional

---

## 🐛 REPORTE DE ERRORES

### Si encuentras algún error:

#### 1. Abrir Consola (F12 > Console)
```
Copiar TODO el error completo
```

#### 2. Anotar:
```
- ¿Qué estabas haciendo?
- ¿Qué esperabas que pasara?
- ¿Qué pasó en realidad?
- ¿Se puede reproducir?
```

#### 3. Captura de pantalla
```
- Error en consola
- Vista de la aplicación
```

#### 4. Información del entorno
```
- Navegador: Chrome/Firefox/Safari + Versión
- OS: Windows/Mac/Linux
- Tamaño de pantalla: Desktop/Mobile
```

---

## 📊 MÉTRICAS OBJETIVO vs REAL

### Al finalizar los tests, completa:

| Métrica | Objetivo | Real | ✅/❌ |
|---------|----------|------|------|
| **Bundle Inicial** | ≤ 1 MB | ___ KB | ⏳ |
| **TTI** | < 2.5s | ___ s | ⏳ |
| **FCP** | < 1.5s | ___ s | ⏳ |
| **Lighthouse Performance** | > 80 | ___ | ⏳ |
| **ClienteDashboard Chunk** | ~600 KB | ___ KB | ⏳ |
| **GerenteDashboard Chunk** | ~700 KB | ___ KB | ⏳ |
| **TPV360Master Chunk** | ~700 KB | ___ KB | ⏳ |
| **CestaOverlay Chunk** | ~150 KB | ___ KB | ⏳ |

---

## 🎯 RESULTADO FINAL

### Todo OK ✅
```
✅ Performance excelente
✅ Lazy loading funciona perfectamente
✅ Sin errores críticos
✅ Funcionalidad completa
→ LISTO PARA PRODUCCIÓN
```

### Hay Issues ❌
```
❌ [Listar issues encontrados]
→ REQUIERE CORRECCIONES
```

---

## 🚀 PRÓXIMOS PASOS

### Si TODO está OK:
1. ✅ Ejecutar tests completos (ver `GUIA_TESTS_FUNCIONALES.md`)
2. ✅ Tests en diferentes navegadores
3. ✅ Tests en dispositivos móviles reales
4. ✅ Tests de carga con múltiples usuarios

### Si hay Issues:
1. ❌ Reportar errores con detalles
2. ❌ Esperar correcciones
3. ❌ Re-testear después de fixes

---

## 📞 AYUDA

### Comandos útiles:
```bash
# Limpiar caché y node_modules
rm -rf node_modules package-lock.json
npm install

# Limpiar caché del navegador
DevTools > Application > Clear Storage > Clear site data

# Ver tamaño del bundle
npm run build
# Revisar carpeta dist/
```

### Atajos DevTools:
```
F12 = Abrir DevTools
Ctrl/Cmd + Shift + R = Hard Reload (sin caché)
Ctrl/Cmd + Shift + Delete = Borrar historial/caché
Ctrl/Cmd + Shift + C = Selector de elementos
```

---

**⏱️ Tiempo estimado total:** 10-15 minutos  
**✅ Estado:** Listo para ejecutar  
**📅 Fecha:** Diciembre 2024  

---

**🎯 ¡A TESTEAR! 🚀**
