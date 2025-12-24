# 🧪 Guía de Pruebas - Mejoras Caja Rápida TPV

## 🎯 Objetivo
Esta guía te ayudará a probar las 4 mejoras implementadas en el sistema "Ya estoy aquí" de la Caja Rápida.

---

## 🚀 Inicio Rápido (3 minutos)

### Método 1: Prueba Automática (Recomendado)

1. **Abre la consola del navegador** (F12 → Pestaña Console)

2. **Ejecuta el escenario completo:**
   ```javascript
   testCajaRapida.simularEscenarioCompleto()
   ```

3. **Observa en el TPV:**
   - ✅ 2 clientes aparecen inmediatamente
   - ✅ En 5 segundos: sonido + nuevo cliente
   - ✅ En 10 segundos: sonido + otro cliente más
   - ✅ Contador de clientes se actualiza (2 → 3 → 4)
   - ✅ Tiempo promedio de espera se calcula
   - ✅ Pedidos con cliente presente aparecen primero

---

## 📋 Pruebas Detalladas por Mejora

### 1️⃣ ORDENAMIENTO AUTOMÁTICO

**Objetivo:** Verificar que pedidos con cliente presente aparecen primero

**Pasos:**
```javascript
// 1. Limpiar datos anteriores
testCajaRapida.limpiarPedidosPrueba()

// 2. Crear pedido SIN geolocalización
// (Usar el flujo normal de la app, sin hacer "Ya estoy aquí")

// 3. Crear pedido CON geolocalización
testCajaRapida.crearPedidoPruebaConGeo({
  clienteNombre: 'Cliente Presente',
  clienteTelefono: '678123456',
  total: 25.50,
  pagado: true
})

// 4. Crear otro pedido SIN geolocalización

// 5. Ir a Caja Rápida → Pestaña "Caja Rápida"
```

**Resultado Esperado:**
- El pedido "Cliente Presente" debe aparecer PRIMERO
- Los demás pedidos aparecen después en orden cronológico
- Al crear un nuevo pedido con geo, se reordena automáticamente

---

### 2️⃣ CONTADOR DE CLIENTES PRESENTES

**Objetivo:** Verificar que el contador muestra el número correcto

**Pasos:**
```javascript
// 1. Verificar estado inicial
testCajaRapida.obtenerEstadisticasClientesPresentes()

// 2. Simular llegada de 3 clientes
testCajaRapida.simularLlegadaMultiple(3)

// 3. Ir a Caja Rápida
```

**Resultado Esperado:**
- Card VERDE con icono 👥
- Número "3" grande
- Texto "Clientes Presentes"
- Se actualiza cada 2 segundos

**Validación:**
```javascript
// Verificar que coincide con las estadísticas
testCajaRapida.obtenerEstadisticasClientesPresentes()
// El campo "total" debe mostrar 3
```

---

### 3️⃣ SONIDO DE ALERTA

**Objetivo:** Verificar que suena al llegar un nuevo cliente

**Pasos:**

**A. Verificar que está activado:**
1. Ir a Caja Rápida
2. Buscar botón con icono 🔊 en el header (esquina superior derecha)
3. Si muestra 🔇, hacer clic para activar

**B. Probar sonido:**
```javascript
// Esperar 3 segundos y crear cliente
setTimeout(() => {
  testCajaRapida.crearPedidoPruebaConGeo({
    clienteNombre: 'Test Sonido',
    clienteTelefono: '600000000',
    total: 10,
    pagado: true
  })
}, 3000)
```

**Resultado Esperado:**
- Se escucha un "beep" corto
- Aparece toast notification verde
- El pedido se muestra en la lista

**C. Desactivar sonido:**
1. Clic en botón 🔊
2. Cambia a 🔇
3. Crear otro cliente (no debe sonar)

**Persistencia:**
- Recargar página
- El estado del toggle debe mantenerse

---

### 4️⃣ TIEMPO DE ESPERA PROMEDIO

**Objetivo:** Verificar cálculo de tiempo promedio

**Pasos:**
```javascript
// 1. Crear cliente que llegó hace 5 minutos (simulado)
const pedidoId1 = testCajaRapida.crearPedidoPruebaConGeo({
  clienteNombre: 'Cliente 1',
  clienteTelefono: '611111111',
  total: 20,
  pagado: true
})

// 2. Manipular tiempo de llegada (5 minutos atrás)
const pedidos = JSON.parse(localStorage.getItem('udar-pedidos'))
const pedido = pedidos.find(p => p.id === pedidoId1)
pedido.fechaGeolocalizacion = new Date(Date.now() - 5 * 60 * 1000).toISOString()
localStorage.setItem('udar-pedidos', JSON.stringify(pedidos))

// 3. Crear cliente que acaba de llegar
testCajaRapida.crearPedidoPruebaConGeo({
  clienteNombre: 'Cliente 2',
  clienteTelefono: '622222222',
  total: 15,
  pagado: true
})

// 4. Verificar cálculo
testCajaRapida.obtenerEstadisticasClientesPresentes()
```

**Resultado Esperado:**
- Card MORADO con icono 📊
- Número aproximado: "2" o "3" minutos
- Cálculo: (5 + 0) / 2 = 2.5 minutos
- Se actualiza en tiempo real

---

## 🎬 Escenarios de Prueba Completos

### Escenario A: Día Normal (5 clientes)

```javascript
// Simular mañana con 5 clientes llegando
testCajaRapida.limpiarPedidosPrueba()

// Cliente 1: Ya está presente
testCajaRapida.crearPedidoPruebaConGeo({
  clienteNombre: 'María García',
  clienteTelefono: '678123456',
  total: 25.50,
  pagado: true
})

// Cliente 2: Llegará en 10 segundos
testCajaRapida.simularLlegadaConRetraso(10, {
  clienteNombre: 'Carlos López',
  clienteTelefono: '645987321',
  total: 15.00,
  pagado: false
})

// Cliente 3: Llegará en 20 segundos
testCajaRapida.simularLlegadaConRetraso(20, {
  clienteNombre: 'Ana Martínez',
  clienteTelefono: '612345678',
  total: 30.00,
  pagado: true
})

// Observar durante 30 segundos
```

**Qué observar:**
- Contador empieza en 1
- A los 10s: sonido + contador sube a 2
- A los 20s: sonido + contador sube a 3
- Tiempo promedio aumenta gradualmente
- Reordenamiento automático

---

### Escenario B: Hora Punta (8 clientes)

```javascript
// Simular hora punta del mediodía
testCajaRapida.limpiarPedidosPrueba()
testCajaRapida.simularLlegadaMultiple(8)

// Observar en Caja Rápida
testCajaRapida.obtenerEstadisticasClientesPresentes()
```

**Qué observar:**
- Card verde muestra "8 Clientes Presentes"
- Listas llenas de pedidos con badge verde
- Tiempo promedio bajo (todos acaban de llegar)
- Scroll en las listas

---

### Escenario C: Cliente Impaciente (tiempo alto)

```javascript
// Simular cliente esperando mucho
testCajaRapida.limpiarPedidosPrueba()

const pedidoId = testCajaRapida.crearPedidoPruebaConGeo({
  clienteNombre: 'Cliente Impaciente',
  clienteTelefono: '666666666',
  total: 50,
  pagado: true
})

// Simular 15 minutos de espera
const pedidos = JSON.parse(localStorage.getItem('udar-pedidos'))
const pedido = pedidos.find(p => p.id === pedidoId)
pedido.fechaGeolocalizacion = new Date(Date.now() - 15 * 60 * 1000).toISOString()
localStorage.setItem('udar-pedidos', JSON.stringify(pedidos))

// Refrescar Caja Rápida
```

**Qué observar:**
- Tiempo de espera: "15 minutos"
- Pedido aparece primero
- Badge verde parpadeante

---

## 📊 Verificación de Métricas

### Ver estadísticas en consola:

```javascript
testCajaRapida.obtenerEstadisticasClientesPresentes()
```

**Output esperado:**
```
📊 Estadísticas de Clientes Presentes:
┌─────────────────────────┬────────┐
│ total                   │ 3      │
│ pagados                 │ 2      │
│ pendientes              │ 1      │
│ tiempoPromedioMinutos   │ 5      │
│ tiempoMaximoMinutos     │ 12     │
│ tiempoMinimoMinutos     │ 1      │
└─────────────────────────┴────────┘
```

---

## 🧹 Limpieza

### Limpiar pedidos de prueba:

```javascript
testCajaRapida.limpiarPedidosPrueba()
```

### Limpiar TODO (usar con cuidado):

```javascript
localStorage.removeItem('udar-pedidos')
localStorage.removeItem('notificaciones_tpv')
localStorage.removeItem('caja_rapida_sonido')
location.reload()
```

---

## ✅ Checklist de Verificación

### Mejora 1: Ordenamiento ✓
- [ ] Pedidos con cliente presente aparecen primero
- [ ] Se mantiene orden cronológico dentro de cada grupo
- [ ] Reordenamiento automático al crear nuevo pedido con geo
- [ ] Funciona en ambas listas (azul y naranja)

### Mejora 2: Contador ✓
- [ ] Card verde visible
- [ ] Número correcto de clientes
- [ ] Se actualiza cada 2 segundos
- [ ] No cuenta pedidos entregados/cancelados

### Mejora 3: Sonido ✓
- [ ] Botón toggle visible en header
- [ ] Sonido se reproduce al detectar nuevo cliente
- [ ] Estado persiste en localStorage
- [ ] No suena si está desactivado

### Mejora 4: Tiempo Espera ✓
- [ ] Card morado visible
- [ ] Cálculo correcto del promedio
- [ ] Se actualiza en tiempo real
- [ ] Muestra 0 si no hay clientes

---

## 🐛 Troubleshooting

### El sonido no se reproduce

**Causas posibles:**
1. Navegador bloqueó audio (requiere interacción del usuario primero)
2. Toggle desactivado
3. Volumen del sistema en 0

**Solución:**
```javascript
// Verificar estado
localStorage.getItem('caja_rapida_sonido') // Debe ser 'true'

// Forzar activación
localStorage.setItem('caja_rapida_sonido', 'true')
location.reload()
```

### Los pedidos no se ordenan

**Causas posibles:**
1. Campo `geolocalizacionValidada` no está en `true`
2. Cache del navegador

**Solución:**
```javascript
// Verificar pedidos
const pedidos = JSON.parse(localStorage.getItem('udar-pedidos'))
console.log(pedidos.map(p => ({
  id: p.id,
  geo: p.geolocalizacionValidada
})))
```

### El contador no se actualiza

**Causas posibles:**
1. Componente no está montado
2. Error en la sincronización

**Solución:**
- Recargar la página
- Verificar consola del navegador para errores

---

## 📞 Soporte

Si encuentras algún problema:

1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Ejecuta: `testCajaRapida.obtenerEstadisticasClientesPresentes()`
4. Captura el output y los errores

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Sistema:** Udar Edge - TPV 360 Master
