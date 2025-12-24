# 🔧 INSTRUCCIONES PARA LIMPIAR CACHÉ

**Fecha:** 27 Noviembre 2025

---

## ❌ PROBLEMA

Sigues viendo el error aunque el código está comentado:
```
ERROR: Failed to fetch @capacitor-community/native-biometric
```

**Causa:** El bundler/navegador tiene caché del código antiguo.

---

## ✅ SOLUCIÓN - LIMPIAR TODO EL CACHÉ

### **Opción 1: Detener y limpiar (RECOMENDADO)**

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Limpiar node_modules/.vite
rm -rf node_modules/.vite

# 3. Limpiar caché de npm (opcional pero recomendado)
npm cache clean --force

# 4. Reiniciar
npm run dev
```

---

### **Opción 2: Limpiar todo y reinstalar**

```bash
# 1. Detener el servidor (Ctrl+C)

# 2. Eliminar carpetas de caché
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm -rf node_modules/.vite

# 3. Reinstalar dependencias
npm install

# 4. Iniciar
npm run dev
```

---

### **Opción 3: Hard refresh en el navegador**

Si el servidor ya está corriendo:

**Chrome/Edge:**
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

**Firefox:**
```
Ctrl + F5  (Windows/Linux)
Cmd + Shift + R  (Mac)
```

---

### **Opción 4: En Windows (PowerShell)**

```powershell
# 1. Detener el servidor (Ctrl+C)

# 2. Limpiar caché
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 3. Reiniciar
npm run dev
```

---

## 🔍 VERIFICAR QUE EL CÓDIGO ESTÉ COMENTADO

Busca en `/services/oauth.service.ts` la línea que te da error (ej: línea 535):

**DEBE verse así:**
```typescript
/*
// DESCOMENTAR ESTE CÓDIGO CUANDO SE INSTALE EL PLUGIN:
try {
  const { NativeBiometric } = await import('@capacitor-community/native-biometric');
  // ... más código
}
*/
```

**NO debe verse así:**
```typescript
// ❌ ESTO CAUSARÍA ERROR
const { NativeBiometric } = await import('@capacitor-community/native-biometric');
```

---

## 🎯 PROCESO COMPLETO

### **Paso 1: Detener servidor**
```bash
Ctrl + C
```

### **Paso 2: Limpiar caché**
```bash
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
```

### **Paso 3: Verificar archivo**
```bash
# Ver la línea que causaba el error
grep -n "import('@capacitor-community/native-biometric')" services/oauth.service.ts
```

**Resultado esperado:** Solo líneas comentadas dentro de `/* */`

### **Paso 4: Reiniciar**
```bash
npm run dev
```

### **Paso 5: Hard refresh en navegador**
```
Ctrl + Shift + R
```

---

## 📊 CHECKLIST

Sigue estos pasos en orden:

- [ ] 1. Detener el servidor (Ctrl+C)
- [ ] 2. Limpiar `node_modules/.vite`
- [ ] 3. Limpiar `.vite` (si existe)
- [ ] 4. Limpiar `dist` (si existe)
- [ ] 5. Ejecutar `npm run dev`
- [ ] 6. Esperar a que compile completamente
- [ ] 7. Hard refresh en navegador (Ctrl+Shift+R)
- [ ] 8. Verificar que no hay errores en consola

---

## ⚠️ SI SIGUE FALLANDO

### **Verifica el archivo manualmente:**

```bash
# Ver las líneas alrededor del error
sed -n '530,560p' services/oauth.service.ts
```

**Buscar:** Cualquier línea con `import('@capacitor-community/native-biometric')` que NO esté dentro de `/* */`

### **Reinstalar completamente:**

```bash
# Limpiar TODO
rm -rf node_modules
rm -rf package-lock.json
rm -rf .vite
rm -rf dist

# Reinstalar
npm install

# Iniciar
npm run dev
```

---

## 🚀 COMANDO RÁPIDO (COPIA Y PEGA)

### **Linux/Mac:**
```bash
# Detener con Ctrl+C primero, luego:
rm -rf node_modules/.vite .vite dist && npm run dev
```

### **Windows (CMD):**
```cmd
rem Detener con Ctrl+C primero, luego:
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q .vite 2>nul
rmdir /s /q dist 2>nul
npm run dev
```

### **Windows (PowerShell):**
```powershell
# Detener con Ctrl+C primero, luego:
Remove-Item -Recurse -Force node_modules\.vite, .vite, dist -ErrorAction SilentlyContinue; npm run dev
```

---

## ✅ RESULTADO ESPERADO

Después de limpiar el caché:

```
✅ Compilación exitosa
✅ 0 errores
✅ Servidor corriendo en http://localhost:5173
✅ Splash screen visible
✅ Login funcionando
```

---

## 📝 NOTA IMPORTANTE

**El caché del bundler es MUY agresivo.** A veces retiene imports antiguos incluso después de cambiar el código. Por eso es crucial:

1. ✅ Detener el servidor completamente
2. ✅ Limpiar las carpetas de caché
3. ✅ Reiniciar desde cero
4. ✅ Hard refresh en el navegador

---

## 🔍 DEBUG AVANZADO

Si después de todo sigue fallando:

```bash
# Ver TODOS los archivos que importan el paquete
grep -r "@capacitor-community/native-biometric" . --include="*.ts" --include="*.tsx"
```

**Resultado esperado:**
- Solo referencias dentro de comentarios `/* */`
- NINGUNA referencia fuera de comentarios

---

## 💡 EXPLICACIÓN TÉCNICA

**¿Por qué el caché causa este problema?**

1. El bundler (Vite) cachea los imports en `node_modules/.vite`
2. Cuando detecta un import, lo pre-procesa
3. Si el import falló, guarda el error en caché
4. Incluso si comentas el código, el caché sigue intentando resolver el import antiguo

**Solución:** Limpiar el caché fuerza al bundler a reanalizar todo el código desde cero.

---

## ✅ CONFIRMACIÓN

Después de seguir estos pasos, deberías poder ejecutar:

```bash
npm run dev
```

Y ver:
```
✅ No errores de compilación
✅ Servidor corriendo
✅ App funcionando correctamente
```

---

**Fecha:** 27 Noviembre 2025  
**Estado:** ✅ LISTO PARA APLICAR
