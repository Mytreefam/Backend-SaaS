# ✅ GUÍA DE VERIFICACIÓN - CAMBIOS REALIZADOS

**Fecha**: 3 de Diciembre 2025  
**Objetivo**: Verificar que los cambios funcionan correctamente

---

## 🎯 CHECKLIST DE VERIFICACIÓN

### ✅ 1. VERIFICAR EBITDA

#### Paso 1: Abrir EBITDA
1. Iniciar la aplicación
2. Iniciar sesión como Gerente
3. Ir a: **Dashboard 360° → EBITDA**

#### Paso 2: Verificar filtro jerárquico
**Lo que debes ver**:
```
┌────────────────────────────────────────┐
│  🏢 Empresa/Marca/PDV         [v]     │
│  📅 Noviembre 2025            [v]     │
└────────────────────────────────────────┘
```

Al hacer clic en "Empresa/Marca/PDV" debes ver:
```
Filtro de Contexto
├─ 🏢 Disarmink S.L. [EMP001]
│   ├─ 🏷️ Modomio [MOD]
│   │   ├─ 📍 Tiana [TIA]
│   │   └─ 📍 Badalona [BAD]
│   └─ 🏷️ Blackburguer [BBQ]
│       ├─ 📍 Tiana [TIA]
│       └─ 📍 Badalona [BAD]
```

#### Paso 3: Seleccionar un PDV
1. Expandir "Disarmink S.L."
2. Expandir "Modomio"
3. Marcar "Tiana"
4. Cerrar el filtro

**Resultado esperado**:
- El título debe cambiar a: `Tiana - Modomio, Blackburguer - Noviembre 2025`
- La tabla de cuenta de resultados debe mostrarse correctamente

#### ✅ Verificación EBITDA:
- [ ] Filtro jerárquico aparece
- [ ] Se ven las empresas
- [ ] Se ven las marcas
- [ ] Se ven los puntos de venta
- [ ] Al seleccionar un PDV, el título cambia
- [ ] No hay errores en consola

---

### ✅ 2. VERIFICAR DASHBOARD 360°

#### Paso 1: Verificar módulo Resumen
1. Ir a: **Dashboard 360° → Resumen**
2. Verificar que el filtro jerárquico funciona
3. Seleccionar diferentes PDVs

#### Paso 2: Verificar módulo Ventas
1. Ir a: **Dashboard 360° → Ventas**
2. Verificar que el filtro jerárquico funciona
3. Los gráficos deben cargarse correctamente

#### Paso 3: Verificar módulo Cierres
1. Ir a: **Dashboard 360° → Cierres**
2. Verificar que el filtro jerárquico funciona
3. La tabla de cierres debe mostrarse

#### ✅ Verificación Dashboard:
- [ ] Resumen funciona con filtro jerárquico
- [ ] Ventas funciona con filtro jerárquico
- [ ] Cierres funciona con filtro jerárquico
- [ ] EBITDA funciona con filtro jerárquico ✅ NUEVO
- [ ] No hay errores en consola

---

### ✅ 3. VERIFICAR MÓDULO DE EQUIPO

#### Paso 1: Abrir Equipo
1. Ir a: **Equipo → Listado**

#### Paso 2: Verificar filtros
**Debe mostrar**:
```
🔍 Filtros    [v]
```

Al hacer clic debe mostrar:
```
Empresa:
  ☑️ Disarmink S.L.

Puntos de Venta:
  ☑️ Tiana - Modomio, Blackburguer
  ☑️ Badalona - Modomio, Blackburguer

Marcas:
  ☑️ Modomio
  ☑️ Blackburguer
```

#### ✅ Verificación Equipo:
- [ ] Filtros de empresa aparecen
- [ ] Filtros de PDV aparecen ✅ (Ya funcionaba)
- [ ] Filtros de marca aparecen
- [ ] Los trabajadores se filtran correctamente
- [ ] No hay errores en consola

---

### ✅ 4. VERIFICAR TPV (Terminal Punto de Venta)

#### Paso 1: Abrir TPV
1. Ir a: **TPV** (desde menú lateral)
2. Verificar que carga correctamente

#### Paso 2: Crear una venta de prueba
1. Añadir un producto al carrito
2. Completar la venta
3. Verificar que se guarda correctamente

#### Paso 3: Verificar estructura en LocalStorage
1. Abrir DevTools (F12)
2. Ir a: **Application → Local Storage → http://localhost:3000**
3. Buscar: `udar_pedidos`
4. Verificar que el último pedido tiene:
   ```json
   {
     "id": "PED-XXX",
     "empresaId": "EMP-001",
     "marcaId": "MRC-001",
     "puntoVentaId": "PDV-TIANA",
     "empresaNombre": "Disarmink S.L.",
     "marcaNombre": "Modomio",
     "puntoVentaNombre": "Tiana"
   }
   ```

#### ✅ Verificación TPV:
- [ ] TPV carga sin errores
- [ ] Se pueden añadir productos
- [ ] Las ventas se guardan correctamente
- [ ] Las ventas tienen empresaId/marcaId/puntoVentaId ✅ (Ya funcionaba)
- [ ] No hay errores en consola

---

### ✅ 5. VERIFICAR TYPESCRIPT (Errores de compilación)

#### Paso 1: Revisar consola del navegador
1. Abrir DevTools (F12)
2. Ir a pestaña: **Console**
3. Buscar errores en rojo

**No debe haber**:
```
❌ Error: Property 'empresaId' does not exist on type 'ProductoCafeteria'
❌ Error: Property 'marcaId' does not exist on type 'ProductoPanaderia'
❌ Error: Cannot read property 'punto_venta_id' of undefined
```

#### Paso 2: Revisar terminal de desarrollo
Si estás usando `npm run dev` o `yarn dev`, verifica que no hay errores de TypeScript.

#### ✅ Verificación TypeScript:
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en terminal
- [ ] La app compila correctamente
- [ ] Los tipos están correctos

---

### ✅ 6. VERIFICAR PRODUCTOS (Opcional - para cuando uses la interfaz)

#### Si tienes una vista de catálogo de productos:
1. Ir a la vista de productos
2. Verificar que se muestran correctamente
3. Si hay un filtro, verificar que funciona

#### ⚠️ NOTA IMPORTANTE:
Los productos ahora tienen campos adicionales:
- `empresaId`
- `marcaId`
- `puntosVentaDisponibles`
- `activo`

**Si un componente muestra productos**, eventualmente deberá filtrarlos así:
```typescript
const productosFiltrados = productos.filter(p => 
  p.puntosVentaDisponibles.includes(pdvSeleccionado) && 
  p.activo === true
);
```

#### ✅ Verificación Productos:
- [ ] Los productos cargan sin errores
- [ ] No hay errores de TypeScript relacionados
- [ ] (Opcional) El filtro de productos funciona

---

## 🚨 SI ENCUENTRAS ERRORES

### Error: "Property 'punto_venta_id' does not exist"

**Causa**: El filtro `selectedContext` está vacío.

**Solución**:
```typescript
// En CuentaResultados.tsx, verifica:
const pdvSeleccionado = selectedContext.length > 0 && selectedContext[0].punto_venta_id 
  ? selectedContext[0].punto_venta_id 
  : 'PDV-TIANA'; // ← Valor por defecto
```

---

### Error: "Cannot read property 'nombre' of undefined"

**Causa**: Un PDV no existe en `PUNTOS_VENTA`.

**Solución**:
```typescript
// Usar operador de encadenamiento opcional:
PUNTOS_VENTA[pdvId]?.nombre || 'PDV Desconocido'
```

---

### Error: "Property 'empresaId' does not exist on type 'ProductoCafeteria'"

**Causa**: No se actualizó correctamente el interface.

**Solución**:
1. Verificar que el archivo `/data/productos-cafeteria.ts` tiene:
   ```typescript
   export interface ProductoCafeteria {
     // ... campos existentes ...
     empresaId: string;
     marcaId: string;
     puntosVentaDisponibles: string[];
     activo?: boolean;
   }
   ```

2. Si ya está, hacer:
   ```bash
   # Detener el servidor
   Ctrl + C
   
   # Limpiar caché (opcional)
   rm -rf .next  # Next.js
   # o
   rm -rf node_modules/.cache  # Vite/React
   
   # Reiniciar
   npm run dev
   ```

---

### El filtro no aparece en EBITDA

**Causa**: Posible error en la importación o render.

**Verificar**:
1. Línea 4 de `CuentaResultados.tsx`:
   ```typescript
   import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';
   ```

2. Buscar en el JSX (línea ~520+):
   ```typescript
   // Debe existir algo así:
   <FiltroContextoJerarquico
     selectedContext={selectedContext}
     onChange={setSelectedContext}
   />
   ```

**Si no existe**, el archivo no se actualizó correctamente. Revisar `CAMBIOS-REALIZADOS.md` para los pasos exactos.

---

## 📊 TABLA DE VERIFICACIÓN COMPLETA

| Módulo | Funciona | Filtro PDV | Errores | Notas |
|--------|----------|------------|---------|-------|
| Dashboard 360° - Resumen | ☐ | ☐ | ☐ | |
| Dashboard 360° - Ventas | ☐ | ☐ | ☐ | |
| Dashboard 360° - Cierres | ☐ | ☐ | ☐ | |
| **Dashboard 360° - EBITDA** | ☐ | ☐ | ☐ | **NUEVO** ✅ |
| Equipo - Listado | ☐ | ☐ | ☐ | Ya funcionaba |
| TPV | ☐ | N/A | ☐ | |
| Productos | ☐ | N/A | ☐ | Opcional |

---

## ✅ VERIFICACIÓN COMPLETA - CHECKLIST FINAL

Marca ✅ cuando hayas verificado:

### Frontend:
- [ ] App se inicia sin errores
- [ ] EBITDA muestra filtro jerárquico con PDVs
- [ ] Dashboard 360° funciona en todas las pestañas
- [ ] Equipo muestra PDVs correctamente
- [ ] TPV funciona y guarda pedidos con contexto
- [ ] No hay errores de TypeScript en consola
- [ ] No hay warnings importantes en terminal

### Datos:
- [ ] Productos tienen `empresaId`
- [ ] Productos tienen `marcaId`
- [ ] Productos tienen `puntosVentaDisponibles`
- [ ] Pedidos guardan contexto completo
- [ ] LocalStorage tiene datos correctos

### Documentación:
- [ ] Has leído `CAMBIOS-REALIZADOS.md`
- [ ] Has leído `RESUMEN-EJECUTIVO.md`
- [ ] Sabes qué cambiar para backend (ver `BACKEND-INTEGRATION-GUIDE.md`)

---

## 🎉 SI TODO FUNCIONA

**¡FELICIDADES!** ✅

Tu frontend está:
- ✅ 100% funcional con la estructura multiempresa
- ✅ Listo para la integración backend
- ✅ Con EBITDA corregido
- ✅ Con productos segmentados correctamente

### Próximos pasos:
1. **Opcional**: Corregir componentes que muestran productos para filtrar por PDV
2. **Prioridad**: Entregar `BACKEND-INTEGRATION-GUIDE.md` al programador
3. **Mientras tanto**: Seguir usando la app con datos mock

---

## 📞 SI NECESITAS AYUDA

**Si algo no funciona**:
1. Revisa esta guía completa
2. Busca el error específico en la sección "Si encuentras errores"
3. Revisa `CAMBIOS-REALIZADOS.md` para ver qué se modificó
4. Contacta al asistente con el error específico

**Información útil para reportar un error**:
```
📍 Módulo: [Dashboard/EBITDA/TPV/etc.]
❌ Error: [Descripción del error]
🖥️ Consola: [Copiar error de consola si existe]
📱 Navegador: [Chrome/Firefox/Safari]
```

---

**¿Todo verificado?** ¡Perfecto! Ahora puedes seguir desarrollando o empezar con el backend. 🚀
