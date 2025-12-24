# 📖 GUÍA RÁPIDA DE USO - Sistema de Pedidos a Proveedores

## 🎯 Cómo Crear un Pedido en 3 Pasos

### **PASO 1: Abrir Modal de Nuevo Pedido**

1. Ve a la sección "Stock y Proveedores"
2. Haz clic en el botón **"🛒 Nuevo Pedido"**
3. Se abrirá un modal con artículos que tienen stock bajo

✅ **Automático:** El sistema carga artículos donde `Stock Actual < Punto de Reorden`

---

### **PASO 2: Revisar y Ajustar Artículos**

#### **Opción A: Usar artículos sugeridos**
Los artículos con stock bajo ya están cargados con:
- ✅ Proveedor preferente seleccionado
- ✅ Cantidad sugerida calculada automáticamente
- ✅ Precio del proveedor

**Puedes:**
- Cambiar la cantidad manualmente
- Cambiar el proveedor (el precio se recalcula automáticamente)
- Eliminar artículos que no quieras pedir

#### **Opción B: Añadir artículos adicionales**
1. Haz clic en **"➕ Añadir Artículo"**
2. Busca el artículo por código, nombre o categoría
3. Haz clic en **"Seleccionar"**
4. Elige el proveedor (verás los precios de cada uno)
5. Ingresa la cantidad deseada
6. Haz clic en **"Añadir al Pedido"**

---

### **PASO 3: Enviar Pedido**

1. Haz clic en la pestaña **"Resumen"**
2. Revisa los artículos agrupados por proveedor
3. Añade anotaciones especiales si lo necesitas (opcional)
4. Haz clic en **"Enviar Pedido a [Nombre Proveedor]"** para cada proveedor
5. ✅ El pedido se crea con número automático (ej: PED-2025-007)
6. Verás una confirmación y el pedido aparecerá en la vista de pedidos

---

## 📋 Cómo Ver y Gestionar Pedidos

### **Acceder a la Vista de Pedidos**

1. Ve a "Stock y Proveedores"
2. Selecciona la pestaña **"Pedidos a Proveedores"**
3. Verás una tabla con todos los pedidos

### **Filtrar Pedidos**

Usa los filtros en la parte superior:

- **Por Estado:**
  - Todos los estados
  - 📋 Solicitado
  - ✅ Confirmado
  - 🚚 En Tránsito
  - 📦 Entregado
  - ⚠️ Reclamado
  - ❌ Anulado

- **Por Proveedor:**
  - Todos los proveedores
  - [Lista de tus proveedores]

- **Por Búsqueda:**
  - Escribe el número de pedido o nombre del proveedor

### **Ver Detalles de un Pedido**

1. Localiza el pedido en la tabla
2. Haz clic en el botón **👁️ (Ver)**
3. Se abre un modal con toda la información:
   - Artículos pedidos
   - Cantidades y precios
   - Fechas (solicitud, confirmación, entrega)
   - Total con IVA desglosado
   - Anotaciones
   - Método de envío

---

## 🔄 Cambiar Estado de un Pedido

### **Estados Disponibles:**

#### **1. Solicitado** 📋
**Acciones:**
- ✅ Confirmar pedido
- ❌ Anular pedido

#### **2. Confirmado** ✅
**Acciones:**
- 🚚 Marcar en tránsito

#### **3. En Tránsito** 🚚
**Acciones:**
- ✅ Marcar como entregado
- ⚠️ Reclamar pedido (si hay problemas)

#### **4. Reclamado** ⚠️
**Acciones:**
- ✅ Marcar como entregado (una vez resuelto)

#### **5. Entregado** 📦
**Acciones:**
- 📊 Casear con factura (próximamente)

#### **6. Anulado** ❌
- Sin acciones disponibles

### **Cómo Cambiar el Estado:**

1. Localiza el pedido en la tabla
2. Haz clic en el botón **⋮ (Más opciones)**
3. Selecciona la acción deseada del menú
4. Confirma el cambio
5. ✅ El estado se actualiza automáticamente

---

## 💡 Consejos y Trucos

### **🎯 Optimizar Pedidos**

1. **Revisa las sugerencias:** El sistema calcula automáticamente la cantidad óptima
2. **Compara precios:** Cambia de proveedor para ver diferentes precios
3. **Agrupa por proveedor:** Añade todos los artículos del mismo proveedor antes de enviar
4. **Usa anotaciones:** Añade instrucciones especiales (ej: "Urgente", "Entregar en almacén 2")

### **📊 Monitorizar Pedidos**

1. **Usa los filtros** para ver solo pedidos pendientes
2. **Revisa las fechas estimadas** para anticipar recepciones
3. **Reclama pedidos retrasados** usando la acción "Reclamar"
4. **Marca como entregado** cuando recibas la mercancía

### **🔍 Búsqueda Rápida**

- Busca por número: `PED-2025-001`
- Busca por proveedor: `Harinas del Norte`
- Combina filtros para búsquedas avanzadas

---

## ❓ Preguntas Frecuentes

### **¿Puedo añadir el mismo artículo dos veces?**
Sí, pero:
- **Mismo artículo + mismo proveedor** → Se incrementa la cantidad
- **Mismo artículo + diferente proveedor** → Se crea una línea nueva

### **¿Cómo sé qué código es cuál?**
- **Código en TEAL (turquesa):** Nuestro código interno (ART-001)
- **Código en GRIS:** Código del proveedor (HAR-001)

### **¿Puedo editar un pedido ya enviado?**
Actualmente no, pero puedes:
- Anular el pedido (si está en estado "Solicitado")
- Crear un nuevo pedido con las modificaciones

### **¿Qué significa "Caseado"?**
Un pedido caseado es aquel cuya factura ha sido verificada contra el pedido original. El sistema valida que:
- Los artículos coincidan
- Las cantidades coincidan
- Los precios coincidan

---

## 🚨 Solución de Problemas

### **No aparecen artículos en el modal de nuevo pedido**
✅ **Solución:** Esto significa que todos tus artículos tienen stock suficiente. Usa el botón "➕ Añadir Artículo" para añadir manualmente.

### **No puedo cambiar el estado de un pedido**
✅ **Solución:** Verifica que el pedido esté en el estado correcto. Cada estado solo permite ciertas transiciones.

### **El precio no se actualiza al cambiar proveedor**
✅ **Solución:** Asegúrate de seleccionar un proveedor diferente del dropdown. El precio se actualiza automáticamente.

### **No encuentro un pedido**
✅ **Solución:** 
1. Revisa los filtros (estado y proveedor)
2. Usa la búsqueda por número o nombre
3. Cambia el filtro de estado a "Todos los estados"

---

## 📞 Soporte

Si necesitas ayuda adicional:

1. Revisa esta guía completa
2. Consulta los documentos técnicos:
   - `RESUMEN_FINAL_SISTEMA_PEDIDOS.md`
   - `IMPLEMENTACION_BOTON_AÑADIR_ARTICULO.md`
3. Contacta con el equipo de desarrollo

---

## ✅ Checklist para tu Primer Pedido

- [ ] Acceder a "Stock y Proveedores"
- [ ] Hacer clic en "🛒 Nuevo Pedido"
- [ ] Revisar artículos sugeridos
- [ ] Ajustar cantidades si es necesario
- [ ] (Opcional) Añadir artículos adicionales
- [ ] Ir a pestaña "Resumen"
- [ ] Revisar totales
- [ ] Añadir anotaciones si es necesario
- [ ] Hacer clic en "Enviar Pedido a [Proveedor]"
- [ ] Verificar que aparezca en "Pedidos a Proveedores"
- [ ] Monitorizar el estado del pedido

---

**Última actualización:** 29 de Noviembre de 2025  
**Versión:** 1.0
