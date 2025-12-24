# 🧪 INSTRUCCIONES DE PRUEBA - SISTEMA DE CAMBIO DE ESTADOS

**Proyecto:** Udar Edge  
**Fecha:** 1 Diciembre 2025

---

## 🚀 CÓMO PROBAR EL SISTEMA

### **PASO 1: Generar Pedidos de Demostración**

1. **Inicia sesión como Trabajador**
2. **Ve a la sección "Pedidos"** en el menú lateral
3. **Busca el botón flotante en la esquina inferior derecha** que dice:
   - 🛠️ "Modo Desarrollo"
   - "Generar Pedidos Demo"

4. **Haz clic en "Generar Pedidos Demo"**
   - Se crearán 6 pedidos de prueba automáticamente
   - Verás una notificación toast confirmando la creación

**📊 Los pedidos generados son:**

| # | Origen | Cliente | Estado | Tipo | Total |
|---|--------|---------|--------|------|-------|
| 1 | 📱 App | María García | Pagado | Domicilio | 37.95€ |
| 2 | 💳 TPV | Cliente en local | Pendiente cobro | Recogida | 16.50€ |
| 3 | 🛵 Glovo | Carlos Ruiz | En preparación | Domicilio | 35.20€ |
| 4 | 📱 App | Laura Martínez | Listo | Domicilio | 28.22€ |
| 5 | 🍔 Just Eat | Jorge López | Pagado | Domicilio | 26.95€ |
| 6 | 📱 App | Roberto Sánchez | Pagado | Recogida | 16.06€ |

---

## 🎯 FLUJO DE PRUEBA COMPLETO

### **PRUEBA 1: Iniciar Preparación**

1. Busca el pedido de **María García** (estado: Pagado)
2. Haz clic en el ícono del ojo 👁️ para abrir el detalle
3. En el modal, verás el botón azul **"Iniciar Preparación"**
4. Haz clic en él
5. ✅ **Verificar:**
   - Toast de confirmación "Pedido en preparación"
   - El modal se cierra
   - El pedido ahora tiene estado "En preparación" (azul)
   - La lista se actualiza automáticamente

---

### **PRUEBA 2: Marcar como Listo**

1. Busca el pedido de **Carlos Ruiz** (Glovo - En preparación)
2. Abre el detalle haciendo clic en el ojo 👁️
3. Ahora verás el botón verde **"Marcar como Listo"**
4. Haz clic en él
5. ✅ **Verificar:**
   - Toast "¡Pedido listo!"
   - Estado cambia a "Listo" (verde teal)
   - Se registra la fecha de "listo"
   - Lista actualizada

---

### **PRUEBA 3: Confirmar Pago en Efectivo**

1. Busca el pedido de **"Cliente en local"** (TPV - Pendiente cobro)
2. Abre el detalle
3. En la sección de "Pago", verás:
   - Método: 💵 Efectivo
   - Estado Pago: Pendiente de Cobro
   - Botón verde **"Confirmar Cobro en Efectivo"**
4. Haz clic en el botón
5. ✅ **Verificar:**
   - Toast "Pago confirmado"
   - Estado de pago cambia a "Pagado"
   - El botón desaparece
   - Ahora aparece el botón "Iniciar Preparación"

---

### **PRUEBA 4: Marcar como Entregado**

1. Busca el pedido de **Laura Martínez** (estado: Listo)
2. Abre el detalle
3. Verás el botón verde oscuro **"Marcar como Entregado"**
4. Haz clic en él
5. Si es efectivo, confirmarías el cobro con un popup
6. ✅ **Verificar:**
   - Toast "Pedido entregado correctamente"
   - Estado cambia a "Entregado"
   - Aparece badge verde grande "Pedido Completado"
   - Se registra fecha de entrega
   - El pedido desaparece de "pedidos activos" (aplicar filtro para verlo)

---

### **PRUEBA 5: Cancelar Pedido**

1. Busca el pedido de **Jorge López** (Just Eat - Pagado)
2. Abre el detalle
3. Verás el botón rojo **"Cancelar Pedido"** al final
4. Haz clic en él
5. Se abre un modal pidiendo motivo
6. Escribe: "Producto agotado"
7. Haz clic en "Confirmar Cancelación"
8. ✅ **Verificar:**
   - Toast "Pedido cancelado"
   - Estado cambia a "Cancelado" (rojo)
   - Aparece badge de alerta con el motivo
   - Fecha de cancelación registrada
   - El pedido desaparece de "pedidos activos"

---

### **PRUEBA 6: Editar Observaciones**

1. Abre cualquier pedido
2. En la sección "Observaciones", haz clic en el ícono de lápiz ✏️
3. Aparece un campo de texto
4. Escribe: "Cliente preguntó por tiempo de espera"
5. Haz clic en "Guardar"
6. ✅ **Verificar:**
   - Toast "Observaciones actualizadas"
   - El texto se guarda
   - El campo vuelve a modo lectura

---

### **PRUEBA 7: Ver QR y Ticket**

1. Abre cualquier pedido
2. Haz clic en **"Ver Código QR"**
3. ✅ **Verificar:**
   - Se despliega el código QR del pedido
   - Hay botón para descargar
4. Haz clic en **"Ver Ticket"**
5. ✅ **Verificar:**
   - Se muestra vista previa del ticket
   - Formato de ticket térmico
   - Todos los datos del pedido visibles

---

### **PRUEBA 8: Filtros y Búsqueda**

1. **Filtro por Estado:**
   - Selecciona "Pagado" en el dropdown
   - Solo se muestran pedidos pagados
   - Cambia a "En preparación"
   - Lista se actualiza

2. **Filtro por Origen:**
   - Selecciona "🛵 Glovo"
   - Solo pedidos de Glovo aparecen
   - Cambia a "📱 App"
   - Lista se actualiza

3. **Búsqueda:**
   - Escribe "María" en el buscador
   - Solo aparece el pedido de María García
   - Escribe un número de teléfono
   - Busca por ese cliente

4. **Combinar filtros:**
   - Selecciona estado + origen
   - La lista se filtra por ambos
   - Búsqueda funciona con filtros activos

---

### **PRUEBA 9: Auto-refresh**

1. Abre la vista de pedidos
2. Abre otra pestaña del navegador
3. En la segunda pestaña, cambia el estado de un pedido
4. Espera 30 segundos (o haz clic en "Actualizar")
5. ✅ **Verificar:**
   - La primera pestaña se actualiza automáticamente
   - Los cambios de la otra pestaña son visibles

---

### **PRUEBA 10: Validaciones**

**Intentar transición inválida:**
1. Abre un pedido en estado "Listo"
2. ✅ **Verificar:**
   - NO aparece botón "Iniciar Preparación"
   - NO aparece botón "Marcar como Listo"
   - Solo aparece "Marcar como Entregado"

**Intentar cancelar pedido entregado:**
1. Primero marca un pedido como entregado
2. Abre su detalle
3. ✅ **Verificar:**
   - NO aparece botón "Cancelar Pedido"
   - Aparece badge "Pedido Completado"

---

## 🎨 VERIFICACIÓN VISUAL

### **Estados y Colores Correctos:**

| Estado | Color Badge | Color Fondo | Icono |
|--------|-------------|-------------|-------|
| Pendiente | Amarillo/Gris | bg-yellow-100 | 🕐 Clock |
| Pagado | Verde | bg-green-100 | ✓ CheckCircle |
| En Preparación | Azul | bg-blue-100 | 👨‍🍳 ChefHat |
| Listo | Teal | bg-teal-100 | 📦 Package |
| Entregado | Verde oscuro | bg-green-100 | ✓✓ CheckCircle2 |
| Cancelado | Rojo | bg-red-100 | ✗ X |

### **Badges de Origen:**

| Origen | Emoji | Color |
|--------|-------|-------|
| App | 📱 | Azul |
| TPV | 💳 | Púrpura |
| Glovo | 🛵 | Amarillo |
| Just Eat | 🍔 | Naranja |
| Uber Eats | 🚗 | Verde |

---

## 🐛 TROUBLESHOOTING

### **Los pedidos no aparecen:**
- ✅ Verifica que hayas fichado en un PDV
- ✅ Los pedidos demo se crean para "PDV-TIANA"
- ✅ Asegúrate de estar fichado en ese PDV
- ✅ Haz clic en "Actualizar"

### **El botón demo no aparece:**
- ✅ Verifica que estás en la ruta `/trabajador/pedidos`
- ✅ El botón está en la esquina inferior derecha
- ✅ Scroll hacia abajo si no lo ves

### **Error al cambiar estado:**
- ✅ Abre la consola del navegador (F12)
- ✅ Verifica los logs de advertencia
- ✅ Asegúrate de que la transición es válida

### **Modal no se cierra:**
- ✅ Haz clic en el botón "Cerrar"
- ✅ Haz clic fuera del modal
- ✅ Presiona ESC

---

## 📊 DATOS DE VERIFICACIÓN

Después de hacer todas las pruebas, deberías tener:

- ✅ 1 pedido en estado "En Preparación" (María García)
- ✅ 1 pedido en estado "Listo" (Carlos Ruiz)
- ✅ 1 pedido en estado "Entregado" (Laura Martínez)
- ✅ 1 pedido en estado "Cancelado" (Jorge López)
- ✅ 2 pedidos activos restantes

---

## 🔄 RESETEAR PRUEBAS

Si quieres volver a empezar:

1. Haz clic en el botón rojo **"Reset"** en el botón flotante
2. Confirma la acción
3. Se eliminarán TODOS los pedidos
4. Se generarán 6 nuevos pedidos de prueba
5. Puedes repetir todas las pruebas

---

## ✅ CHECKLIST DE PRUEBAS

Marca cada prueba al completarla:

- [ ] Generar pedidos demo
- [ ] Iniciar preparación
- [ ] Marcar como listo
- [ ] Confirmar pago en efectivo
- [ ] Marcar como entregado
- [ ] Cancelar pedido con motivo
- [ ] Editar observaciones
- [ ] Ver código QR
- [ ] Ver ticket
- [ ] Filtrar por estado
- [ ] Filtrar por origen
- [ ] Buscar pedido
- [ ] Combinar filtros
- [ ] Auto-refresh
- [ ] Validación de transiciones
- [ ] Colores de badges correctos
- [ ] Toast notifications funcionando
- [ ] Modal responsive
- [ ] Confirmación en cancelación
- [ ] Confirmación en pago efectivo

---

## 🎉 PRÓXIMOS PASOS

Una vez verificado todo:

1. **Elimina el botón de desarrollo** antes de producción:
   - Comenta la línea `<BotonGenerarPedidosDemo />` en `PedidosTrabajador.tsx`

2. **Conecta con backend real:**
   - Reemplaza funciones de `pedidos.service.ts` con llamadas API
   - Implementa WebSockets para actualización en tiempo real

3. **Añade notificaciones:**
   - Push notifications al cliente
   - Email/SMS al cambiar estado

4. **Mejoras opcionales:**
   - Sonido al llegar pedido nuevo
   - Temporizador de preparación
   - Impresión automática de tickets

---

**¿Todo funcionando?** 🚀

¡Perfecto! Ahora tienes un sistema completo de gestión de estados de pedidos listo para producción.

---

**Developed by Udar Edge Team**  
*Digitalizando negocios con tecnología de vanguardia*
