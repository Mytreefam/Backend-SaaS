# 💳 SISTEMA DE PAGOS CON MONEI - DOCUMENTACIÓN COMPLETA

## 📋 RESUMEN EJECUTIVO

Se ha implementado un **sistema completo de gestión de pagos con MONEI** en el perfil Cliente, incluyendo:

✅ **Gestión de tarjetas guardadas** en el perfil  
✅ **Selección de tarjeta** durante el checkout  
✅ **Proceso visual de pago** con modales de procesamiento y resultado  
✅ **Todo preparado para conectar con APIs de MONEI** (actualmente mock con LocalStorage)

---

## 🎯 COMPONENTES CREADOS

### 1. **TarjetaCard.tsx** (`/components/cliente/TarjetaCard.tsx`)
Componente visual de tarjeta guardada con diseño tipo "credit card"

**Características:**
- Muestra últimos 4 dígitos de la tarjeta
- Detección automática de tipo (Visa/Mastercard/Amex)
- Iconos visuales para cada tipo de tarjeta
- Badge "Principal" para tarjeta predeterminada
- Modo selección (para checkout)
- Modo gestión (para perfil con botones eliminar/marcar principal)

**Interfaz de datos:**
```typescript
interface TarjetaGuardada {
  id: string;
  numeroTarjeta: string; // Últimos 4 dígitos: "4242"
  nombreTitular: string;
  fechaExpiracion: string; // "12/26"
  tipo: 'visa' | 'mastercard' | 'amex';
  esPredeterminada: boolean;
  token?: string; // Token de MONEI (para backend)
}
```

---

### 2. **AñadirTarjetaModal.tsx** (`/components/cliente/AñadirTarjetaModal.tsx`)
Modal para añadir nueva tarjeta con formulario completo

**Características:**
- Formateo automático de número de tarjeta (espacios cada 4 dígitos)
- Validación de fecha de expiración (MM/YY)
- Detección automática de tipo de tarjeta por BIN
- CVV con longitud variable (3 para Visa/MC, 4 para Amex)
- Checkbox para marcar como predeterminada
- Aviso de seguridad MONEI
- Simulación de tokenización (2s de carga)

**Validaciones incluidas:**
- ✅ Número de tarjeta (13-16 dígitos)
- ✅ Fecha no expirada
- ✅ CVV correcto
- ✅ Nombre del titular obligatorio

---

### 3. **MisMetodosPago.tsx** (`/components/cliente/MisMetodosPago.tsx`)
Componente de gestión completa de tarjetas

**Características:**
- Lista de tarjetas guardadas
- Botón "Añadir tarjeta"
- Eliminar tarjeta (con confirmación)
- Marcar tarjeta como predeterminada
- Estado vacío con mensaje
- Modo compacto (para checkout)
- Modo selección (para checkout)

**Almacenamiento:**
- LocalStorage key: `udar-tarjetas-guardadas`
- Formato: Array de `TarjetaGuardada[]`

---

### 4. **PagoProcesamientoModal.tsx** (`/components/cliente/PagoProcesamientoModal.tsx`)
Modal de loading durante el procesamiento del pago

**Características:**
- Spinner animado personalizado
- Mensajes específicos por método de pago (Tarjeta/Bizum/Efectivo)
- Barra de progreso animada
- Icono de seguridad
- Advertencia de no cerrar la ventana
- Sin botón de cierre (no puede ser cerrado manualmente)

---

### 5. **PagoResultadoModal.tsx** (`/components/cliente/PagoResultadoModal.tsx`)
Modal de resultado del pago (éxito o error)

**Características:**
- Diseño diferenciado para éxito (verde) y error (rojo)
- Detalles del pedido (nº pedido, nº factura, total)
- Botón "Descargar factura" (si exitoso)
- Botón "Ver pedido" (si exitoso)
- Botón "Reintentar pago" (si error)
- Mensajes de error personalizados

---

## 🔄 FLUJO DE PAGO COMPLETO

### **PASO 1: Gestión en Perfil (Opcional)**
```
Usuario → Perfil → Métodos de Pago
   ↓
1. Ver tarjetas guardadas
2. Añadir nueva tarjeta
3. Marcar como predeterminada
4. Eliminar tarjeta
```

### **PASO 2: Checkout - Selección de Método de Pago**
```
1. Carrito → Finalizar Pedido
2. CheckoutModal Paso 1: Tipo entrega (Domicilio/Recogida)
3. CheckoutModal Paso 2: Datos entrega + Método de pago
   
   Si selecciona "Tarjeta":
   ↓
   4a. Muestra "Selecciona tu tarjeta"
   4b. Lista de tarjetas guardadas (componente MisMetodosPago en modo selección)
   4c. Botón "Añadir nueva tarjeta"
```

### **PASO 3: Procesamiento del Pago**
```
1. Click "Confirmar Pedido"
2. Validaciones (dirección, stock, tarjeta seleccionada)
3. Abrir PagoProcesamientoModal
   ↓
   [AQUÍ EL DEV CONECTA MONEI]
   - Crear pago en MONEI
   - Esperar respuesta de MONEI
   ↓
4. Cerrar PagoProcesamientoModal
5. Abrir PagoResultadoModal (éxito o error)
```

### **PASO 4: Resultado**
```
Si ÉXITO:
  - Mostrar nº pedido + nº factura + total
  - Crear pedido en BD
  - Generar factura VeriFactu
  - Limpiar carrito
  - Enviar notificación
  - Botón "Ver pedido" / "Descargar factura"

Si ERROR:
  - Mostrar mensaje de error
  - Botón "Reintentar pago"
  - No crear pedido
```

---

## 🔌 INTEGRACIÓN CON MONEI

### **Servicio ya preparado:** `/services/aggregators/monei.adapter.ts`

**Métodos disponibles:**

1. **`crearPago(params)`** - Crear un nuevo pago
```typescript
await moneiAdapter.crearPago({
  amount: moneiHelper.eurosACentimos(total), // Convertir a céntimos
  currency: 'EUR',
  orderId: nuevoPedido.id,
  description: `Pedido ${nuevoPedido.numero}`,
  customer: {
    email: userData.email,
    name: userData.name
  },
  completeUrl: `${window.location.origin}/pedido-exitoso`,
  cancelUrl: `${window.location.origin}/pedido-cancelado`
});
```

2. **`obtenerPago(paymentId)`** - Consultar estado de un pago

3. **`confirmarPago(paymentId)`** - Confirmar/capturar un pago autorizado

4. **`cancelarPago(paymentId)`** - Cancelar un pago

5. **`reembolsarPago(paymentId, amount, reason)`** - Reembolsar un pago

---

## 📍 DÓNDE CONECTAR EL BACKEND

### **En `CheckoutModal.tsx` → función `handleConfirmarPedido()`**

**ANTES (línea ~315-450):**
```typescript
// Actualmente:
await new Promise(resolve => setTimeout(resolve, 2000)); // MOCK
const nuevoPedido = crearPedido({...}); // Se crea directamente
```

**DESPUÉS (con MONEI):**
```typescript
// 1. Validar tarjeta seleccionada
if (metodoPago === 'tarjeta' && !tarjetaSeleccionada) {
  toast.error('Selecciona una tarjeta');
  return;
}

// 2. Mostrar modal procesando
setModalProcesando(true);

try {
  // 3. Crear pago en MONEI
  const pagoMonei = await moneiAdapter.crearPago({
    amount: moneiHelper.eurosACentimos(total),
    currency: 'EUR',
    orderId: generarIdTemporal(),
    customer: {
      email: userData.email,
      name: userData.name
    },
    // Token de la tarjeta seleccionada
    paymentToken: tarjetaSeleccionada.token
  });

  if (!pagoMonei.success) {
    throw new Error(pagoMonei.error.message);
  }

  // 4. Verificar si necesita 3DS (redirección)
  if (pagoMonei.data.nextAction?.type === 'redirect') {
    window.location.href = pagoMonei.data.nextAction.redirectUrl;
    return;
  }

  // 5. Si el pago fue exitoso, crear pedido
  const nuevoPedido = crearPedido({
    ...datos,
    pagoId: pagoMonei.data.id
  });

  // 6. Cerrar modal procesando
  setModalProcesando(false);

  // 7. Mostrar resultado éxito
  setPagoExitoso(true);
  setDatosResultado({
    numeroPedido: nuevoPedido.numero,
    numeroFactura: facturaId,
    total: total
  });
  setModalResultado(true);

} catch (error) {
  // Error en el pago
  setModalProcesando(false);
  setPagoExitoso(false);
  setDatosResultado({ mensajeError: error.message });
  setModalResultado(true);
}
```

---

## 🎨 DISEÑO Y COLORES

**Paleta HoyPecamos aplicada:**
- Color principal: `#ED1C24` (Rojo HoyPecamos)
- Negro: `#000000`
- Grises: `#1A1A1A`, `#333333`, `#666666`

**Componentes con branding:**
- Badges de tarjeta principal: Verde estándar
- Badges de tarjeta seleccionada: Rojo `#ED1C24`
- Botones principales: Rojo `#ED1C24`
- Iconos de tarjeta: Colores oficiales (Visa azul, MC rojo/naranja, Amex azul)

---

## 📂 ESTRUCTURA DE ARCHIVOS

```
/components/cliente/
├── TarjetaCard.tsx              # Componente visual de tarjeta
├── AñadirTarjetaModal.tsx       # Modal añadir nueva tarjeta
├── MisMetodosPago.tsx           # Gestión de tarjetas (perfil + checkout)
├── PagoProcesamientoModal.tsx   # Loading durante pago
├── PagoResultadoModal.tsx       # Resultado pago (éxito/error)
├── CheckoutModal.tsx            # ✅ MODIFICADO - Integra selección de tarjetas
└── PerfilCliente.tsx            # ✅ MODIFICADO - Añade sección "Métodos de Pago"

/services/aggregators/
└── monei.adapter.ts             # Adaptador MONEI (ya existía)
```

---

## 🧪 TESTING LOCAL (Sin backend)

**Todo funciona con datos mock en LocalStorage:**

1. **Añadir tarjetas de prueba:**
   - Ir a Perfil → Métodos de Pago
   - Click "Añadir tarjeta"
   - Usar números de prueba:
     - Visa: `4242 4242 4242 4242`
     - Mastercard: `5555 5555 5555 4444`
     - Amex: `3782 822463 10005`
   - Fecha: Cualquier fecha futura (ej: `12/26`)
   - CVV: Cualquier (ej: `123`)

2. **Probar checkout:**
   - Añadir productos al carrito
   - Finalizar pedido
   - Seleccionar "Tarjeta" como método de pago
   - Elegir una tarjeta guardada
   - Confirmar pedido
   - Ver modal "Procesando pago..." (2s)
   - Ver modal "¡Pago realizado con éxito!"

---

## ✅ CHECKLIST PARA EL DESARROLLADOR

### **1. Configurar MONEI**
- [ ] Crear cuenta en [monei.com](https://monei.com)
- [ ] Obtener API Key (pk_test_... para test, pk_live_... para producción)
- [ ] Configurar Account ID
- [ ] Configurar Webhook URL en panel MONEI

### **2. Conectar Backend**
- [ ] Crear endpoint `/api/pagos/crear` que use `moneiAdapter.crearPago()`
- [ ] Crear endpoint `/api/pagos/estado/:id` que use `moneiAdapter.obtenerPago()`
- [ ] Crear endpoint `/api/pagos/confirmar/:id` que use `moneiAdapter.confirmarPago()`
- [ ] Crear endpoint `/api/webhooks/monei` que use `moneiAdapter.procesarWebhook()`

### **3. Modificar CheckoutModal.tsx**
- [ ] Importar servicio MONEI
- [ ] Sustituir `await new Promise(...)` por llamada real a MONEI
- [ ] Manejar respuesta 3DS (redirecciones)
- [ ] Guardar `pagoId` en el pedido
- [ ] Mostrar modales de procesamiento/resultado correctamente

### **4. Base de Datos**
- [ ] Crear tabla `tarjetas` con campos:
  - `id`, `usuario_id`, `numero_tarjeta` (últimos 4), `tipo`, `token_monei`, `es_predeterminada`
- [ ] Crear tabla `transacciones_monei` con campos:
  - `id`, `pedido_id`, `monei_payment_id`, `estado`, `importe`, `fecha`

### **5. Seguridad**
- [ ] Nunca guardar CVV
- [ ] Guardar solo token de MONEI (nunca número completo)
- [ ] Usar HTTPS en producción
- [ ] Validar webhooks con firma HMAC

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Bizum:**
   - Añadir flujo específico para Bizum
   - Modal con código QR o redirección
   - Simulación de espera de confirmación

2. **Google Pay / Apple Pay:**
   - MONEI soporta ambos
   - Añadir botones específicos en checkout
   - Detección automática de dispositivo

3. **Guardar última tarjeta usada:**
   - Marcar automáticamente la última tarjeta usada en próximo pedido

4. **Historial de transacciones:**
   - Nueva sección en perfil con todas las transacciones
   - Filtros por fecha/estado
   - Descarga de comprobantes

---

## 📞 SOPORTE

**Documentación MONEI:**
- Docs: https://docs.monei.com
- Dashboard: https://dashboard.monei.com
- Soporte: support@monei.com

**Números de prueba MONEI:**
- Pago exitoso: `4242 4242 4242 4242`
- Pago con 3DS: `4000 0027 6000 3184`
- Pago rechazado: `4000 0000 0000 0002`

---

## 🎉 RESUMEN FINAL

✅ **Sistema completo de pagos MONEI implementado visualmente**  
✅ **Gestión de tarjetas guardadas en Perfil Cliente**  
✅ **Selección de tarjetas en Checkout**  
✅ **Modales de procesamiento y resultado**  
✅ **Todo preparado para conectar con APIs reales de MONEI**  
✅ **Funciona con datos mock en LocalStorage para testing**

**El desarrollador solo necesita:**
1. Conectar las APIs de MONEI en `CheckoutModal.tsx`
2. Sustituir LocalStorage por llamadas a backend
3. Configurar webhooks
4. ¡Listo para producción!

---

**Creado:** Diciembre 2025  
**Versión:** 1.0  
**Estado:** ✅ Completo y listo para integración backend
