# 🔄 INTEGRACIÓN TPV - PASOS PENDIENTES

## ✅ Lo que YA está implementado:

1. ✅ **Servicio Centralizado** (`/services/promociones.service.ts`)
   - Sistema completo de promociones
   - Validación y aplicación automática
   - Event Emitter para tiempo real

2. ✅ **Hooks React** (`/hooks/usePromociones.ts`)
   - `usePromociones()` - Cliente
   - `usePromocionesTPV()` - TPV  
   - `usePromocionesGerente()` - Gerente

3. ✅ **Catálogo Cliente** (`/components/cliente/CatalogoPromos.tsx`)
   - ✅ Conectado a base de datos master
   - ✅ Auto-actualización en tiempo real
   - ✅ Visualización mejorada

4. ✅ **TPV - Parcialmente** (`/components/TPV360Master.tsx`)
   - ✅ Hook `usePromocionesTPV()` importado
   - ✅ Función `calcularTotal()` con aplicación automática de promociones
   - ✅ Estados para promociones aplicadas y descuentos

## 🔄 Lo que FALTA hacer en el TPV:

### 1. **Eliminar funciones antiguas**

El TPV tiene funciones obsoletas que deben eliminarse:

```typescript
// ❌ ELIMINAR estas funciones:
- cargarPromocionesActivas()
- aplicarPromocion()
- aplicarDescuentoGeneral()
- aplicar2x1()
- aplicar3x2()
- quitarPromocion()
- calcularTotalDescuentos() // obsoleta
- calcularTotalConPromociones() // obsoleta
- obtenerPromocionesAplicadas() // si existe
```

**Archivo:** `/components/TPV360Master.tsx` líneas aprox. 387-492

### 2. **Actualizar renderizado del carrito**

Reemplazar la sección del total (líneas 1279-1320) por:

```tsx
{/* Resumen de Promociones Aplicadas */}
{promocionesAplicadasActuales.length > 0 && (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 space-y-2 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <Zap className="w-4 h-4 text-green-600" />
      <span className="text-xs font-medium text-green-800">Promociones Aplicadas</span>
    </div>
    {promocionesAplicadasActuales.map(promo => (
      <div key={promo.id} className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-green-700">
          <Sparkles className="w-3 h-3" />
          {promo.nombre}
        </span>
        <Badge className="bg-green-600 text-white text-xs h-5">
          {promo.tipo === 'descuento_porcentaje' && `${promo.valor}%`}
          {promo.tipo === 'descuento_fijo' && `-${promo.valor}€`}
          {promo.tipo === '2x1' && '2x1'}
          {promo.tipo === '3x2' && '3x2'}
          {promo.tipo === 'combo_pack' && `${promo.valor}%`}
        </Badge>
      </div>
    ))}
  </div>
)}

{/* Total */}
<div className="border-t pt-4 space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Subtotal</span>
    <span>{calcularSubtotalSinDescuento().toFixed(2)}€</span>
  </div>
  {descuentoTotalAplicado > 0 && (
    <div className="flex justify-between text-sm">
      <span className="flex items-center gap-1 text-green-600">
        <TrendingDown className="w-3 h-3" />
        Descuentos
      </span>
      <span className="font-medium text-green-600">-{descuentoTotalAplicado.toFixed(2)}€</span>
    </div>
  )}
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Subtotal con descuentos</span>
    <span className="font-medium">{calcularTotal().toFixed(2)}€</span>
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">IVA (10%)</span>
    <span>{calcularIVA().toFixed(2)}€</span>
  </div>
  <div className="flex justify-between pt-2 border-t">
    <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
      Total a Pagar
    </span>
    <span className="text-2xl text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {calcularTotalConIVA().toFixed(2)}€
    </span>
  </div>
  {descuentoTotalAplicado > 0 && (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
      <p className="text-xs text-green-700 text-center flex items-center justify-center gap-1">
        <Gift className="w-3 h-3" />
        ¡Ahorraste {descuentoTotalAplicado.toFixed(2)}€ con promociones!
      </p>
    </div>
  )}
</div>
```

### 3. **Actualizar Panel de Promociones Activas**

Reemplazar la sección del panel de promociones (líneas aprox. 1221-1296) por:

```tsx
{/* Panel de Promociones Disponibles - CONECTADO A BASE MASTER */}
{mostrarPanelPromociones && promocionesDisponibles.length > 0 && (
  <Card>
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600" />
          Promociones Disponibles
          <Badge className="ml-2 bg-purple-600 text-white">
            {promocionesDisponibles.length}
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMostrarPanelPromociones(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {promocionesDisponibles.map(promo => (
          <div
            key={promo.id}
            className={`border rounded-lg p-3 transition-all ${
              promo.destacada ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-2">
              {promo.destacada && (
                <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{promo.nombre}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {promo.descripcion}
                </p>
                {promo.horaInicio && promo.horaFin && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{promo.horaInicio} - {promo.horaFin}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {promo.tipo === 'descuento_porcentaje' && `${promo.valor}% OFF`}
                    {promo.tipo === 'descuento_fijo' && `-${promo.valor}€`}
                    {promo.tipo === '2x1' && '2x1'}
                    {promo.tipo === '3x2' && '3x2'}
                    {promo.tipo === 'combo_pack' && 'Combo'}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    {promo.canal === 'tienda' ? 'Solo Tienda' : promo.canal === 'app' ? 'Solo App' : 'Tienda y App'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-500 text-center">
          ℹ️ Las promociones se aplican automáticamente al agregar productos al carrito
        </p>
      </div>
    </CardContent>
  </Card>
)}

{!mostrarPanelPromociones && promocionesDisponibles.length > 0 && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setMostrarPanelPromociones(true)}
    className="w-full"
  >
    <Tag className="w-4 h-4 mr-2" />
    Ver Promociones Disponibles ({promocionesDisponibles.length})
  </Button>
)}
```

### 4. **Actualizar Modal de Pago**

Buscar todas las referencias a funciones obsoletas en el modal de pago y reemplazarlas:

```typescript
// ❌ Reemplazar:
calcularTotalConPromociones()

// ✅ Por:
calcularTotal()

// ❌ Reemplazar:
calcularTotalDescuentos()

// ✅ Por:
descuentoTotalAplicado

// ❌ Reemplazar:
calcularTotalConPromociones() * 1.1

// ✅ Por:
calcularTotalConIVA()
```

**Archivos afectados:**
- `/components/TPV360Master.tsx` (modales de pago)
- Buscar todas las referencias con: `calcularTotalConPromociones`, `calcularTotalDescuentos`

### 5. **Eliminar referencias antiguas a items del carrito**

El TPV ya no necesita guardar `promocionAplicada` ni `descuento` en cada item del carrito individual, porque las promociones se calculan automáticamente.

**Eliminar de la interfaz ItemCarrito:**
```typescript
// ❌ ELIMINAR estos campos (si existen):
promocionAplicada?: PromocionDisponible;
descuento?: number;
subtotalConDescuento?: number;
```

**Eliminar del renderizado del carrito:**
```tsx
// ❌ ELIMINAR estas líneas (aprox. 1358-1420):
{item.promocionAplicada && (
  <Badge>...</Badge>
)}
...
{item.descuento && item.descuento > 0 ? (
  ...
)}
...
{item.promocionAplicada && (
  <Button onClick={() => quitarPromocion(item.producto.id)}>
    Quitar promoción
  </Button>
)}
```

Las promociones ahora se muestran en un panel separado arriba del total, no en cada item individual.

### 6. **Actualizar función procesarPago**

Buscar la función `procesarPago` y actualizar:

```typescript
const procesarPago = () => {
  // Validaciones...
  
  const totalSinDescuento = calcularSubtotalSinDescuento();
  const totalConDescuento = calcularTotal(); // Ya incluye descuentos
  const totalFinal = calcularTotalConIVA(); // Total con IVA
  
  const nuevoPedido: Pedido = {
    // ...otros campos
    total: totalFinal,
    totalSinDescuento: totalSinDescuento,
    totalDescuento: descuentoTotalAplicado,
    promocionesAplicadas: promocionesAplicadasActuales,
    // ...
  };
  
  // Registrar uso de promociones
  if (promocionesAplicadasActuales.length > 0) {
    promocionesAplicadasActuales.forEach(promo => {
      // Aquí podrías llamar al servicio para registrar el uso
      // promocionesService.registrarUso(promo.id, clienteId);
      console.log(`Promoción aplicada: ${promo.nombre}`);
    });
  }
  
  // ...resto del código
};
```

## 📊 Resultado Final Esperado

Cuando termines, el TPV debe:

1. ✅ Mostrar panel de "Promociones Disponibles" con todas las promociones del servicio
2. ✅ Aplicar descuentos **automáticamente** cuando se agrega un producto al carrito
3. ✅ Mostrar un resumen visual de "Promociones Aplicadas" arriba del total
4. ✅ Calcular correctamente:
   - Subtotal sin descuentos
   - Descuentos aplicados
   - Subtotal con descuentos
   - IVA (10%)
   - Total a pagar
5. ✅ No requerir acción manual para aplicar promociones
6. ✅ Actualizarse en tiempo real cuando el gerente crea/modifica promociones

## 🎯 Beneficio Final

**ANTES:**
- Promociones hardcoded
- Aplicación manual por el trabajador
- Sin sincronización con el gerente
- Propenso a errores

**DESPUÉS:**
- Promociones desde base de datos master
- Aplicación automática al agregar productos
- Sincronización en tiempo real con el gerente
- Sin intervención manual necesaria
- Registro automático de métricas

## 🔥 Prioridad

**Alta** - Esta es la pieza final que conecta todo el sistema de promociones. Una vez completado, tendrás un sistema profesional completamente funcional de promociones en tiempo real.

---

**Próximo paso sugerido:** Completar estas modificaciones en el TPV y luego conectar el panel del Gerente para que emita eventos al crear/editar promociones.
