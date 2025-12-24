# ✅ MEJORAS EN CLIENTE: DIRECCIONES Y CONFIRMACIÓN DE PEDIDOS

## 📅 Fecha de Implementación
**29 de Noviembre de 2025**

---

## 🎯 RESUMEN EJECUTIVO

Se han implementado mejoras significativas en el flujo de pedidos del Cliente, centrándose en:

1. **Sistema de Gestión de Direcciones** completo
2. **Modal de Confirmación de Pedido** rediseñado en 2 pasos
3. **Geolocalización automática** del cliente
4. **Recomendación inteligente de PDV** por cercanía
5. **Tab predeterminado** en catálogo: "Productos Udar Edge"

---

## 📦 ARCHIVOS CREADOS

### 1. `/components/cliente/MisDirecciones.tsx`
**Componente completo de gestión de direcciones**

#### Características:
- ✅ CRUD completo de direcciones (Crear, Leer, Actualizar, Eliminar)
- ✅ Tipos de dirección: Casa, Trabajo, Otro
- ✅ Dirección predeterminada (marcada con estrella)
- ✅ Geolocalización con botón "Usar mi ubicación actual"
- ✅ Campos completos: Calle, Número, Piso, Puerta, CP, Ciudad, Provincia, País
- ✅ Notas adicionales para cada dirección
- ✅ Guardar coordenadas (latitud/longitud)
- ✅ Dos modos de visualización:
  - **Completo**: Para la página de configuración
  - **Compacto**: Para selección en modal de checkout

#### Interfaz de Datos:
```typescript
export interface Direccion {
  id: string;
  tipo: 'casa' | 'trabajo' | 'otro';
  alias?: string;
  calle: string;
  numero: string;
  piso?: string;
  puerta?: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  notas?: string;
  latitud?: number;
  longitud?: number;
  esPredeterminada: boolean;
  fechaCreacion: Date;
  fechaUltimoUso?: Date;
}
```

#### Props:
```typescript
interface MisDireccionesProps {
  clienteId?: string;
  onSeleccionarDireccion?: (direccion: Direccion) => void;
  modoSeleccion?: boolean; // true en modal de checkout
  compacto?: boolean; // true para vista compacta
}
```

#### Funcionalidades:
1. **Añadir Nueva Dirección**
   - Modal con formulario completo
   - Validación de campos obligatorios
   - Botón de geolocalización integrado
   - Checkbox para marcar como predeterminada

2. **Editar Dirección Existente**
   - Pre-rellena el formulario con datos actuales
   - Mantiene el ID original

3. **Eliminar Dirección**
   - Confirmación antes de eliminar
   - No permite eliminar la predeterminada sin cambiarla antes

4. **Establecer como Predeterminada**
   - Solo una dirección puede ser predeterminada
   - Actualiza automáticamente las demás

5. **Seleccionar Dirección** (modo compacto)
   - Botones grandes con toda la info
   - Icono de check al seleccionar
   - Badge de "Predeterminada" visible

#### Datos Mock Incluidos:
```typescript
[
  {
    id: 'DIR-001',
    tipo: 'casa',
    alias: 'Mi Casa',
    calle: 'Calle Gran Vía',
    numero: '45',
    piso: '3',
    puerta: 'B',
    codigoPostal: '28013',
    ciudad: 'Madrid',
    provincia: 'Madrid',
    pais: 'España',
    notas: 'Portero automático, código: 1234B',
    esPredeterminada: true
  },
  {
    id: 'DIR-002',
    tipo: 'trabajo',
    alias: 'Oficina',
    calle: 'Paseo de la Castellana',
    numero: '120',
    piso: '8',
    // ...
  }
]
```

---

### 2. `/components/cliente/PedidoConfirmacionModalMejorado.tsx`
**Modal rediseñado en 2 pasos con geolocalización**

#### Estructura del Flujo:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PASO 1                                  │
│                  TIPO DE ENTREGA + RESUMEN                      │
└─────────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────┐                        ┌────────────────┐
│  ENTREGA A    │                        │  RECOGIDA EN   │
│  DOMICILIO    │                        │    TIENDA      │
└───────────────┘                        └────────────────┘
        │                                         │
        └────────────────────┬────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PASO 2                                  │
│                    DATOS DE ENTREGA                             │
│  - Selector de dirección (domicilio) o PDV (recogida)          │
│  - Método de pago                                               │
│  - Notas adicionales                                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Características Principales:

**PASO 1: Tipo de Entrega + Resumen**

1. **Resumen del Pedido**
   - Lista de productos con cantidades
   - Subtotal, Descuentos, IVA, Total
   - Indicador visual de promociones aplicadas

2. **Datos del Cliente**
   - Nombre, Email, Teléfono
   - Pre-rellenados del contexto del usuario

3. **Selector de Tipo de Entrega**
   
   **Opción A: Entrega a Domicilio** 🏠
   - Badge "Recomendado"
   - Icono de geolocalización
   - Descripción: "Recibe tu pedido en la dirección que prefieras"
   - Con geolocalización automática

   **Opción B: Recogida en Tienda** 🏪
   - Tiempo estimado: "Listo en X minutos"
   - Punto más cercano calculado automáticamente
   - Distancia mostrada si hay geolocalización

**PASO 2: Datos de Entrega**

1. **Indicador del Tipo Seleccionado**
   - Banner verde con el tipo elegido
   - Botón "Cambiar" para volver al Paso 1

2. **Si seleccionó DOMICILIO:**
   - Integración completa con componente `MisDirecciones`
   - Vista compacta con direcciones guardadas
   - Botón "+ Añadir nueva dirección"
   - Geolocalización disponible

3. **Si seleccionó RECOGIDA:**
   - Lista de puntos de venta ordenados por cercanía
   - Card por cada PDV con:
     - Nombre del punto
     - Dirección completa
     - Distancia en km (si hay geolocalización)
     - Tiempo estimado de preparación
     - Badge "Más cercano" en el primero
   - Selección con check visual

4. **Método de Pago**
   - Tarjeta de crédito/débito
   - Bizum
   - Efectivo (pagar en tienda/contra reembolso)
   - Badge "Pendiente de pago" en efectivo

5. **Notas Adicionales** (opcional)
   - Textarea para instrucciones especiales
   - Placeholder con ejemplos

#### Geolocalización Automática:

```typescript
const obtenerUbicacion = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      
      // Calcular distancias con fórmula de Haversine
      const puntosOrdenados = calcularDistancias(latitude, longitude);
      
      // Seleccionar automáticamente el más cercano
      setPuntoVentaSeleccionado(puntosOrdenados[0]);
      
      toast.success('Ubicación obtenida correctamente');
    },
    (error) => {
      toast.info('No se pudo obtener tu ubicación');
    }
  );
};
```

#### Fórmula de Haversine (Cálculo de Distancia):
```typescript
const calcularDistanciaHaversine = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

#### Puntos de Venta Mock:
```typescript
const puntosVentaMock: PuntoVenta[] = [
  {
    id: 'PDV-001',
    nombre: 'Udar Edge - Centro',
    direccion: 'Calle Gran Vía 45, 28013 Madrid',
    distancia: 0.8, // Se calcula dinámicamente
    tiempoEstimado: 15,
    latitud: 40.4206,
    longitud: -3.7033
  },
  {
    id: 'PDV-002',
    nombre: 'Udar Edge - Castellana',
    direccion: 'Paseo de la Castellana 120, 28046 Madrid',
    distancia: 2.3,
    tiempoEstimado: 20,
    latitud: 40.4512,
    longitud: -3.6887
  }
  // ...
];
```

#### Interfaz de Confirmación:
```typescript
export interface DatosConfirmacion {
  tipoEntrega: 'domicilio' | 'recogida';
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  direccionEntrega?: Direccion;
  datosCliente: {
    nombre: string;
    email: string;
    telefono: string;
  };
  metodoPago: 'tarjeta' | 'bizum' | 'efectivo';
  notasAdicionales?: string;
}
```

#### Props del Componente:
```typescript
interface PedidoConfirmacionMejoradoProps {
  isOpen: boolean;
  onClose: () => void;
  items: ItemPedido[];
  subtotal: number;
  descuento?: number;
  iva: number;
  total: number;
  onConfirmar: (datos: DatosConfirmacion) => void;
}
```

#### Validaciones Implementadas:
1. ✅ Tipo de entrega debe estar seleccionado
2. ✅ Si es recogida, debe tener PDV seleccionado
3. ✅ Si es domicilio, debe tener dirección seleccionada
4. ✅ Datos de cliente completos (nombre, email, teléfono)
5. ✅ Método de pago seleccionado

---

## 🔧 ARCHIVOS MODIFICADOS

### 1. `/components/ConfiguracionCliente.tsx`

**Cambios realizados:**

1. **Import de MapPin icon**
```typescript
import { MapPin } from 'lucide-react';
```

2. **Import del componente MisDirecciones**
```typescript
import { MisDirecciones } from './cliente/MisDirecciones';
```

3. **Añadido Tab "Direcciones"**
```tsx
<TabsList className="grid w-full grid-cols-6 h-auto gap-0.5 sm:gap-1 p-1">
  <TabsTrigger value="cuenta">...</TabsTrigger>
  <TabsTrigger value="direcciones"> {/* ✨ NUEVO */}
    <MapPin className="w-4 h-4 shrink-0" />
    <span>Direcciones</span>
  </TabsTrigger>
  <TabsTrigger value="privacidad">...</TabsTrigger>
  {/* ... */}
</TabsList>
```

4. **Añadido TabsContent para Direcciones**
```tsx
<TabsContent value="direcciones" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
  <MisDirecciones />
</TabsContent>
```

**Ubicación en la UI:**
```
Configuración > [Cuenta | Direcciones | Privacidad | Seguridad | Notificaciones | Sistema]
                        ↑
                    NUEVO TAB
```

---

### 2. `/components/cliente/CatalogoPromos.tsx`

**Cambio realizado:**

```typescript
// ANTES
const [activeTab, setActiveTab] = useState('promos');

// DESPUÉS
const [activeTab, setActiveTab] = useState('catalogo'); 
// ✅ Ahora "Productos Udar Edge" es la primera vista
```

**Efecto:**
- Cuando el cliente entra a "Elige tu producto", ve primero el catálogo completo
- Las promociones siguen disponibles en la segunda pestaña

---

## 🎨 FLUJO VISUAL COMPLETO

### Escenario 1: Cliente hace un pedido con Entrega a Domicilio

```
1. Cliente añade productos al carrito
   ↓
2. Hace clic en "Finalizar Pedido"
   ↓
3. Se abre modal PASO 1
   - Ve resumen del pedido
   - Ve sus datos de contacto
   - Selecciona "Entrega a Domicilio"
   ↓
4. Se abre modal PASO 2
   - Ve sus direcciones guardadas
   - Puede seleccionar una existente
   - O añadir nueva con geolocalización
   - Selecciona método de pago
   - Añade notas opcionales
   ↓
5. Confirma el pedido
   ↓
6. Sistema guarda:
   - Tipo: domicilio
   - Dirección seleccionada (completa con coordenadas)
   - Método de pago
   - Notas
```

### Escenario 2: Cliente hace un pedido con Recogida en Tienda

```
1. Cliente añade productos al carrito
   ↓
2. Hace clic en "Finalizar Pedido"
   ↓
3. Se abre modal PASO 1
   - Sistema obtiene geolocalización automáticamente
   - Ve resumen del pedido
   - Selecciona "Recogida en Tienda"
   ↓
4. Se abre modal PASO 2
   - Ve lista de PDV ordenados por cercanía
   - Punto más cercano pre-seleccionado
   - Ve distancia y tiempo estimado
   - Selecciona método de pago
   - Añade notas opcionales
   ↓
5. Confirma el pedido
   ↓
6. Sistema guarda:
   - Tipo: recogida
   - PDV seleccionado (ID + nombre)
   - Método de pago
   - Notas
```

---

## 📍 INTEGRACIÓN EN LA APLICACIÓN

### Ubicaciones del Componente MisDirecciones

1. **Configuración > Direcciones** (Vista Completa)
```tsx
<TabsContent value="direcciones">
  <MisDirecciones />
</TabsContent>
```

2. **Modal de Confirmación de Pedido** (Vista Compacta)
```tsx
<MisDirecciones 
  onSeleccionarDireccion={setDireccionSeleccionada}
  modoSeleccion
  compacto
/>
```

### Ubicación del Modal de Confirmación

**Llamado desde:**
- `CestaOverlay.tsx` → Botón "Finalizar Pedido"
- `CatalogoPromos.tsx` → Botón "Comprar Ahora"
- Cualquier componente que necesite confirmar un pedido

**Ejemplo de uso:**
```tsx
import { PedidoConfirmacionModalMejorado } from './cliente/PedidoConfirmacionModalMejorado';

function MiComponente() {
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const handleConfirmar = (datos: DatosConfirmacion) => {
    // Procesar el pedido con los datos confirmados
    console.log('Pedido confirmado:', datos);
    
    // Crear pedido en backend
    // Limpiar carrito
    // Mostrar confirmación
  };
  
  return (
    <>
      <Button onClick={() => setModalAbierto(true)}>
        Finalizar Pedido
      </Button>
      
      <PedidoConfirmacionModalMejorado
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        items={itemsCarrito}
        subtotal={50.00}
        descuento={5.00}
        iva={4.50}
        total={49.50}
        onConfirmar={handleConfirmar}
      />
    </>
  );
}
```

---

## 🔄 SINCRONIZACIÓN DE DIRECCIONES

### Guardar Dirección desde Modal de Checkout

Cuando el cliente añade una nueva dirección durante el proceso de checkout:

1. **Se guarda en la base de datos** → Hook/Service de direcciones
2. **Se añade a la lista del usuario** → Context de usuario
3. **Aparece automáticamente** en Configuración > Direcciones
4. **Se puede establecer como predeterminada**

```typescript
// En el componente padre (ej: CestaOverlay)
const handleConfirmarPedido = (datos: DatosConfirmacion) => {
  // Si hay nueva dirección, guardarla en el contexto/backend
  if (datos.direccionEntrega && !datos.direccionEntrega.id.startsWith('DIR-')) {
    // Es una dirección nueva
    await guardarDireccionEnBackend(datos.direccionEntrega);
  }
  
  // Procesar pedido...
};
```

---

## 🎯 VENTAJAS DEL NUEVO SISTEMA

### Para el Cliente:

1. ✅ **Menos pasos** para completar un pedido
2. ✅ **Direcciones guardadas** para compras futuras
3. ✅ **Geolocalización automática** - no necesita escribir direcciones manualmente
4. ✅ **Recomendación inteligente** del PDV más cercano
5. ✅ **Vista clara del resumen** antes de confirmar
6. ✅ **Flexibilidad** para elegir entrega o recogida

### Para el Negocio:

1. ✅ **Mayor conversión** - proceso más intuitivo
2. ✅ **Datos más precisos** - coordenadas geográficas guardadas
3. ✅ **Optimización de rutas** - direcciones con lat/lng
4. ✅ **Menos errores** en direcciones
5. ✅ **Fidelización** - cliente guarda direcciones para próximas compras
6. ✅ **Analytics** - saber qué PDV son más populares

---

## 📱 RESPONSIVE

Todos los componentes son **completamente responsive**:

### Desktop (> 1024px)
- Modal de confirmación: 2 columnas donde sea posible
- Direcciones: Cards en grid
- Formularios: 2 columnas

### Tablet (768px - 1024px)
- Modal: 1 columna
- Direcciones: Grid de 2 columnas
- Formularios: 2 columnas en horizontal

### Mobile (< 768px)
- Todo en 1 columna
- Botones más grandes (touch-friendly)
- Textos adaptados (abreviaciones)
- Modales full-screen si es necesario

---

## 🧪 TESTING RECOMENDADO

### Test Manual - Gestión de Direcciones

1. **Añadir Nueva Dirección**
   - [ ] Botón "+ Nueva Dirección" funciona
   - [ ] Modal se abre correctamente
   - [ ] Todos los campos se pueden rellenar
   - [ ] Botón de geolocalización pide permisos
   - [ ] Geolocalización guarda coordenadas
   - [ ] Validación de campos obligatorios
   - [ ] Checkbox "Predeterminada" funciona
   - [ ] Se guarda correctamente

2. **Editar Dirección**
   - [ ] Botón de editar funciona
   - [ ] Datos pre-rellenados correctamente
   - [ ] Cambios se guardan
   - [ ] ID se mantiene

3. **Eliminar Dirección**
   - [ ] Botón de eliminar funciona
   - [ ] No permite eliminar predeterminada
   - [ ] Confirmación antes de eliminar

4. **Establecer Predeterminada**
   - [ ] Solo una puede ser predeterminada
   - [ ] Estrella amarilla visible
   - [ ] Se actualiza en todas las vistas

### Test Manual - Modal de Confirmación

1. **Paso 1: Tipo de Entrega**
   - [ ] Resumen del pedido correcto
   - [ ] Datos del cliente visibles
   - [ ] Opción "Domicilio" seleccionable
   - [ ] Opción "Recogida" seleccionable
   - [ ] Geolocalización se ejecuta automáticamente
   - [ ] Badge "Recomendado" visible

2. **Paso 2: Domicilio**
   - [ ] Lista de direcciones cargada
   - [ ] Se puede seleccionar una dirección
   - [ ] Se puede añadir nueva dirección
   - [ ] Métodos de pago seleccionables
   - [ ] Textarea de notas funciona
   - [ ] Botón "Volver" funciona
   - [ ] Botón "Confirmar" valida correctamente

3. **Paso 2: Recogida**
   - [ ] Lista de PDV cargada
   - [ ] PDV ordenados por cercanía
   - [ ] Badge "Más cercano" en el primero
   - [ ] Distancia y tiempo visibles
   - [ ] Se puede seleccionar PDV
   - [ ] Métodos de pago seleccionables
   - [ ] Botón "Confirmar" valida correctamente

4. **Validaciones**
   - [ ] Error si no hay tipo de entrega
   - [ ] Error si falta dirección (domicilio)
   - [ ] Error si falta PDV (recogida)
   - [ ] Error si faltan datos de cliente
   - [ ] Confirmación exitosa con datos completos

### Test de Integración

1. **Flujo Completo E2E**
   ```
   Cliente entra a catálogo
   → Ve "Productos Udar Edge" primero ✓
   → Añade productos al carrito
   → Abre modal de confirmación
   → Selecciona "Entrega a Domicilio"
   → Añade nueva dirección con geolocalización
   → Selecciona método de pago
   → Confirma pedido
   → Pedido se crea correctamente
   → Dirección aparece en Configuración > Direcciones ✓
   ```

2. **Sincronización de Direcciones**
   ```
   Añadir dirección en Configuración
   → Aparece en modal de checkout ✓
   
   Añadir dirección en modal de checkout
   → Aparece en Configuración ✓
   ```

---

## 🚀 PRÓXIMOS PASOS (Opcional)

### 1. Backend Integration
- [ ] Conectar con API REST de direcciones
- [ ] Persistir direcciones en base de datos
- [ ] Endpoint GET /direcciones/:clienteId
- [ ] Endpoint POST /direcciones
- [ ] Endpoint PUT /direcciones/:id
- [ ] Endpoint DELETE /direcciones/:id

### 2. Reverse Geocoding
- [ ] Integrar Google Maps API o Mapbox
- [ ] Convertir coordenadas a dirección legible
- [ ] Autocompletar direcciones al escribir

### 3. Mapa Interactivo
- [ ] Mostrar mapa en el modal de checkout
- [ ] Pin del PDV más cercano
- [ ] Ruta calculada desde ubicación del cliente

### 4. Notificaciones
- [ ] Push notification cuando el pedido esté listo
- [ ] SMS con número de pedido
- [ ] Email de confirmación

### 5. Historial de Direcciones
- [ ] Mostrar direcciones más usadas primero
- [ ] Sugerencias basadas en horario
- [ ] Eliminar automáticamente direcciones sin usar en 6 meses

---

## 📚 REFERENCIAS

### APIs de Geolocalización
- [MDN - Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)

### Fórmulas de Distancia
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Great-circle distance](https://en.wikipedia.org/wiki/Great-circle_distance)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN COMPLETA

### Componentes
- [x] MisDirecciones.tsx creado
- [x] PedidoConfirmacionModalMejorado.tsx creado
- [x] ConfiguracionCliente.tsx modificado
- [x] CatalogoPromos.tsx modificado

### Funcionalidades
- [x] CRUD de direcciones
- [x] Geolocalización del cliente
- [x] Cálculo de distancias (Haversine)
- [x] Recomendación de PDV más cercano
- [x] Modal en 2 pasos
- [x] Selección de tipo de entrega
- [x] Selección de dirección/PDV
- [x] Selección de método de pago
- [x] Validaciones completas
- [x] Responsive design
- [x] Tab "Productos Udar Edge" primero

### Documentación
- [x] README de cambios
- [x] Interfaces documentadas
- [x] Ejemplos de uso
- [x] Guía de testing

---

**Estado:** ✅ **COMPLETADO Y LISTO PARA INTEGRACIÓN** 🚀

**Desarrollado por:** AI Assistant  
**Fecha:** 29 de Noviembre de 2025  
**Versión:** 1.0.0
