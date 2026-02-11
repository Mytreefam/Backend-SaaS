# Dashboard Testing Report - Real Backend Inspection
**Date:** February 10, 2026  
**Frontend URL:** http://localhost:5173/  
**Purpose:** Inspect dashboards with real backend, identify data sources, KPIs, and potential issues

---

## 🔍 Known Issues to Verify

### 1. **parseInt(userId) Issue in Cliente Dashboard**
- **Location:** `YaEstoyAquiModal.tsx` lines 38, 48, 56
- **Issue:** `userId` is passed as a string but parsed to int without validation
- **Test:** Click "Ya estoy aquí" button and check console for NaN errors
- **Expected Behavior:** Should handle string IDs or validate before parseInt
- **Files Affected:**
  - `client/src/components/cliente/YaEstoyAquiModal.tsx`

### 2. **user.name Rendering Issues**
- **Locations Found:**
  - `ClienteDashboard.tsx` line 326 (top bar)
  - `Sidebar.tsx` line 221 (sidebar)
  - Multiple components receiving `user.name` as prop
- **Test:** Login and check if name displays correctly in header/sidebar
- **Potential Issue:** If backend returns null/undefined name, UI shows blank

### 3. **Gerente Pedidos Filters Not Applying**
- **Location:** `PedidosGerente.tsx` lines 84-95
- **Issue:** Filters (empresa/marca/pdv) trigger useEffect but filtering logic at line 127-144 doesn't use them
- **Test:** 
  1. Select empresa filter → verify pedidos list changes
  2. Select marca filter → verify pedidos list changes
  3. Select PDV filter → verify pedidos list changes
- **Expected:** Filters should reduce visible pedidos
- **Actual:** Filters only used in API call (line 86) but not in `pedidosFiltrados` memo (line 127)

### 4. **Polling/Toast Spam Every 30s**
- **Location:** `PedidosGerente.tsx` lines 89-95
- **Issue:** Auto-refresh every 30s with silent mode, but line 116 shows toast on success
- **Test:** 
  1. Go to Gerente → Pedidos Multicanal
  2. Wait 30 seconds
  3. Check if toast appears repeatedly
- **Expected:** Silent refresh should not show toast
- **Actual:** May show "Pedidos actualizados" toast every 30s

---

## 📊 Testing Matrix

### **ROLE 1: Cliente Dashboard**
**Login:** `cliente@prueba.com` / `1234`

#### KPIs/Widgets to Capture:
| Widget Name | Location | Data Source | Expected Value |
|------------|----------|-------------|----------------|
| Pedidos Activos | Top bar badge | `obtenerPedidosCliente(user.id)` filtered by state | Count of pendiente/en_preparacion/listo |
| Pedidos Completados | Calculated | `obtenerPedidosCliente(user.id)` filtered by entregado | Count |
| Citas Programadas | State variable | Hardcoded `useState(2)` | 2 (mock) |
| Notificaciones No Leídas | State variable | Hardcoded `useState(2)` | 2 (mock) |
| Items en Cesta | CartContext | `useCart().totalItems` | Dynamic |
| Turno Activo | State | `turnoActivo` state | null or turno object |

#### Sections to Test:

**1. Inicio**
- Component: `InicioCliente`
- Actions:
  - [ ] Click "Nuevo Pedido" → Should open catalog
  - [ ] Click "Ya estoy aquí" → Opens `YaEstoyAquiModal`
  - [ ] Verify category selector (MODOMMIO/BLACKBURGER/EVENTOS)
- Data Sources:
  - Categories from `SelectorCategoriaHoyPecamos`
  - Products from `CatalogoPromos` or `EventosModommio`

**2. Pedidos**
- Component: `MisPedidos`
- Props: `clienteId={user.id}`
- Actions:
  - [ ] View list of pedidos
  - [ ] Click on pedido → Opens detail modal
  - [ ] Check if empty state shows correctly
- Data Sources:
  - `obtenerPedidosCliente(user.id)` from `pedidos.service.ts`

**3. Citas**
- Component: `MisCitas` (lazy loaded)
- Props: `clienteId={user.id}`
- Actions:
  - [ ] Click "Nueva Cita" → Opens `SolicitudCitaModal`
  - [ ] View existing citas
  - [ ] Cancel/modify cita
- Data Sources:
  - Backend API (check network tab for `/api/citas` calls)

**4. Cupones**
- Component: `MisCupones`
- Props: `clienteId={user.id}`, `clienteNombre={user.name}`, `clienteEmail={user.email}`
- Actions:
  - [ ] View available cupones
  - [ ] Apply cupon
  - [ ] Check expiration dates
- Data Sources:
  - Backend API (check network tab)

**5. Chat**
- Component: `ChatCliente`
- Props: `clienteId={user.id}`, `clienteNombre={user.name}`
- Actions:
  - [ ] Send message
  - [ ] Receive response
  - [ ] Check connection status
- Data Sources:
  - Backend API (likely WebSocket or polling)

**6. Notificaciones**
- Component: `NotificationCenter`
- Props: `usuarioId={user.id}`
- Actions:
  - [ ] View notifications
  - [ ] Mark as read
  - [ ] Click notification → Navigate
- Data Sources:
  - Backend API `/api/notificaciones`

#### Special Tests:

**Ya Estoy Aquí Flow (parseInt Issue)**
1. Click "Ya estoy aquí" button (sidebar or inicio)
2. Open browser DevTools Console
3. Click "Activar ubicación" in modal
4. **Check for:**
   - [ ] Console error: `NaN` in API calls
   - [ ] Network tab: POST to `/api/notificaciones` with `clienteId: NaN`
   - [ ] Network tab: POST to `/api/turnos` with `clienteId: NaN`
5. **Expected Fix:** userId should be validated or API should accept strings

**User Name Display**
1. After login, check:
   - [ ] Top bar shows `{user.name}` correctly
   - [ ] Sidebar shows `{user.name}` correctly
   - [ ] If name is blank, check network response from login API
2. **Reproduce blank name:**
   - Modify backend to return `name: null` or `name: ""`
   - Reload dashboard
   - Verify UI shows fallback (initials, "Usuario", etc.)

---

### **ROLE 2: Gerente Dashboard**
**Login:** `gerente@prueba.com` / `5678`

#### KPIs/Widgets to Capture:
| Widget Name | Location | Data Source | Expected Value |
|------------|----------|-------------|----------------|
| MRR | KPICards | Hardcoded | €12,450 |
| NPS | KPICards | Hardcoded | 8.4 |
| Margen | KPICards | Hardcoded | 34% |
| Churn | KPICards | Hardcoded | 2.1% |
| Alertas | Menu badge | Hardcoded `const alertas = 3` | 3 |
| Impagos | State | Hardcoded `const impagos = 5` | 5 |
| Urgentes | Menu badge | Hardcoded `const urgentes = 2` | 2 |
| No Leídos | Menu badge | Hardcoded `const noLeidos = 8` | 8 |
| Citas Pendientes | Menu badge | Hardcoded `const citasPendientes = 5` | 5 |

#### Sections to Test:

**1. Dashboard 360**
- Component: `Dashboard360`
- Actions:
  - [ ] View main KPIs
  - [ ] Check filtro jerárquico (Empresa → Marca → PDV)
  - [ ] Verify charts load (ingresos, gastos, categorías)
  - [ ] Check onboarding widget
- Data Sources:
  - `dashboardGerenteApi.getVentas()` (line 97 in Dashboard360.tsx)
  - `stockApi.getAlertasStock()` (if used)
  - `finanzasApi.getCierresCaja()` (if used)
- **Test Filters:**
  1. Select Empresa → API call should include `empresa_id`
  2. Select Marca → API call should include `marca_id`
  3. Select PDV → API call should include `punto_venta_id`
  4. Check if KPIs update after filter change

**2. Pedidos Multicanal (CRITICAL - Filter Bug)**
- Component: `PedidosGerente`
- Actions:
  - [ ] View pedidos list
  - [ ] Apply Empresa filter → **VERIFY LIST CHANGES**
  - [ ] Apply Marca filter → **VERIFY LIST CHANGES**
  - [ ] Apply PDV filter → **VERIFY LIST CHANGES**
  - [ ] Apply Estado filter (pendiente, pagado, etc.)
  - [ ] Apply Origen filter (app, tpv, glovo, etc.)
  - [ ] Search by número/cliente/teléfono
  - [ ] Switch between tabla/tarjetas view
  - [ ] Click "Actualizar" → Check toast
  - [ ] Wait 30 seconds → **CHECK FOR TOAST SPAM**
- Data Sources:
  - `pedidosApi.getAll()` (line 99)
  - Auto-refresh every 30s (line 90)
- **Bug Reproduction:**
  1. Load Pedidos page
  2. Select "Empresa: HOY PECAMOS"
  3. **Expected:** Only pedidos from HOY PECAMOS show
  4. **Actual:** All pedidos still visible (filter not applied in memo)
  5. Check lines 127-144 in `PedidosGerente.tsx` → filters missing

**3. Clientes y Productos**
- Component: `ClientesGerente`
- Actions:
  - [ ] View clientes list
  - [ ] Search cliente
  - [ ] View cliente detail
  - [ ] View productos catalog
- Data Sources:
  - Backend API (check network tab)

**4. Gestión de Citas**
- Component: `GestionCitas` (lazy loaded)
- Actions:
  - [ ] View citas solicitadas (badge shows 5)
  - [ ] Approve/reject cita
  - [ ] Assign trabajador
- Data Sources:
  - Backend API `/api/citas`

**5. TPV 360 - Base**
- Component: `TPV360Master` (lazy loaded)
- Actions:
  - [ ] Select Punto de Venta (opens `ModalSeleccionTPV`)
  - [ ] Select TPV terminal
  - [ ] Open caja
  - [ ] Create pedido
  - [ ] Close caja
- Data Sources:
  - `PUNTOS_VENTA_ARRAY` from `empresaConfig.ts`
  - Backend API for caja operations

#### Special Tests:

**Filter Application Bug**
1. Go to "Pedidos Multicanal"
2. Note total pedidos count (e.g., 50)
3. Select Empresa filter: "HOY PECAMOS"
4. **Check:**
   - [ ] URL updates with query param?
   - [ ] API called with empresa_id?
   - [ ] Pedidos list reduces?
   - [ ] Stats cards update?
5. Select Marca filter: "MODOMMIO"
6. **Check:**
   - [ ] API called with marca_id?
   - [ ] Pedidos list reduces further?
7. Select PDV filter: "Madrid Centro"
8. **Check:**
   - [ ] API called with punto_venta_id?
   - [ ] Pedidos list shows only Madrid Centro?

**Expected Behavior:**
- Lines 84-86: `useEffect` triggers on filter change → calls `cargarPedidos()`
- Line 99: API call should include filters as params
- Lines 127-144: `pedidosFiltrados` memo should filter by empresa/marca/pdv

**Actual Behavior:**
- `pedidosFiltrados` only filters by `busqueda`, `filtroEstado`, `filtroOrigen`
- Missing filters: `filtroEmpresa`, `filtroMarca`, `filtroPDV`

**Fix Required:**
```typescript
const pedidosFiltrados = useMemo(() => {
  return pedidos.filter(pedido => {
    // Existing filters
    const matchBusqueda = ...;
    const matchEstado = ...;
    const matchOrigen = ...;
    
    // ADD MISSING FILTERS:
    const matchEmpresa = filtroEmpresa === 'todas' || pedido.empresaId === filtroEmpresa;
    const matchMarca = filtroMarca === 'todas' || pedido.marcaId === filtroMarca;
    const matchPDV = filtroPDV === 'todos' || pedido.puntoVentaId === filtroPDV;
    
    return matchBusqueda && matchEstado && matchOrigen && matchEmpresa && matchMarca && matchPDV;
  });
}, [pedidos, busqueda, filtroEstado, filtroOrigen, filtroEmpresa, filtroMarca, filtroPDV]);
```

**Toast Spam Every 30s**
1. Go to "Pedidos Multicanal"
2. Wait 30 seconds
3. **Check:**
   - [ ] Toast appears: "Pedidos actualizados"
   - [ ] Toast appears every 30s repeatedly
4. **Root Cause:**
   - Line 91: `cargarPedidos(true)` with `silent = true`
   - Line 116: Toast shown even when `silent = false` check missing
5. **Fix Required:**
```typescript
if (!silent) {
  toast.success('Pedidos actualizados', {
    description: `${pedidosAdaptados.length} pedidos encontrados`
  });
}
```
**Note:** Fix already exists at line 115-119, so toast spam should NOT occur. Verify this.

---

### **ROLE 3: Trabajador Dashboard**
**Login:** `trabajador@demo.com` / `demo123`

#### KPIs/Widgets to Capture:
| Widget Name | Location | Data Source | Expected Value |
|------------|----------|-------------|----------------|
| Tareas Completadas | KPICards | Hardcoded | 23 |
| Tareas Pendientes | KPICards | Hardcoded `const tareasPendientes = 5` | 5 |
| Horas (esta semana) | KPICards | Hardcoded | 38h |
| Desempeño | KPICards | Hardcoded | 92% |
| Mensajes No Leídos | Menu badge | Hardcoded `const mensajesNoLeidos = 3` | 3 |
| Cursos Pendientes | Menu badge | Hardcoded `const cursosPendientes = 2` | 2 |
| En Turno | State | `enTurno` state from fichaje | true/false |

#### Sections to Test:

**1. Inicio**
- Component: `InicioTrabajador`
- Actions:
  - [ ] View dashboard overview
  - [ ] Quick actions available
- Data Sources:
  - Hardcoded/mock data

**2. TPV 360**
- Component: `TPV360Master`
- Actions:
  - [ ] Select terminal (opens `ModalSeleccionTPV`)
  - [ ] Open caja
  - [ ] Process pedido
  - [ ] Close caja
- Data Sources:
  - Same as Gerente TPV

**3. Pedidos**
- Component: `PedidosTrabajador`
- Actions:
  - [ ] View assigned pedidos
  - [ ] Mark as "En preparación"
  - [ ] Mark as "Listo"
  - [ ] Entregar pedido (opens `ModalEntregarPedido`)
- Data Sources:
  - Backend API `/api/pedidos`

**4. Repartidor**
- Component: `RepartidorDashboard`
- Actions:
  - [ ] View assigned deliveries
  - [ ] Update delivery status
  - [ ] Complete delivery
- Data Sources:
  - Backend API `/api/deliveries` or `/api/pedidos`

**5. Fichajes y Horario**
- Component: `FichajesHorarioCompleto` (always mounted, ref-controlled)
- Actions:
  - [ ] Click "Fichar Entrada" → Opens modal
  - [ ] Select PDV
  - [ ] Confirm fichaje
  - [ ] Click "Fichar Salida" → Confirms exit
  - [ ] View fichajes history
- Data Sources:
  - Backend API `/api/fichajes`
- **Special:** Component always mounted (line 436) but hidden with `display: none`

**6. Formación y Documentación**
- Component: `FormacionDocumentacionCompleto`
- Actions:
  - [ ] View cursos (badge shows 2 pendientes)
  - [ ] Complete curso
  - [ ] View documentos
- Data Sources:
  - Backend API

---

## 🔌 Backend Connection Tests

### Connection Indicator
- **Component:** `ConnectionIndicator` (mobile)
- **Location:** Should appear in mobile view
- **Tests:**
  1. **Online State:**
     - [ ] Indicator shows "Conectado" (green)
     - [ ] Wifi icon visible
  2. **Offline State:**
     - [ ] Turn off network (DevTools → Network → Offline)
     - [ ] Indicator shows "Sin conexión" (red)
     - [ ] WifiOff icon visible
     - [ ] Toast: "Los cambios se guardarán localmente..."
  3. **Pending Actions:**
     - [ ] Perform action while offline (e.g., create pedido)
     - [ ] Indicator shows "X pendientes"
     - [ ] Go online → Click "Sincronizar ahora"
     - [ ] Verify actions sync to backend
  4. **Syncing State:**
     - [ ] During sync, indicator shows "Sincronizando..." (yellow)
     - [ ] RefreshCw icon spinning

### API Endpoints to Monitor (Network Tab)

**Cliente:**
- `GET /api/clientes/:id/pedidos` - MisPedidos
- `GET /api/clientes/:id/citas` - MisCitas
- `GET /api/clientes/:id/cupones` - MisCupones
- `POST /api/turnos` - Ya estoy aquí (check clienteId param)
- `POST /api/notificaciones` - Ya estoy aquí (check clienteId param)
- `GET /api/notificaciones?usuarioId=:id` - NotificationCenter

**Gerente:**
- `GET /api/gerente/dashboard/ventas?empresa_id=&marca_id=&punto_venta_id=` - Dashboard360
- `GET /api/pedidos` - PedidosGerente (check if filters applied)
- `GET /api/clientes` - ClientesGerente
- `GET /api/citas` - GestionCitas
- `GET /api/stock/alertas` - Dashboard360 stock alerts
- `GET /api/finanzas/cierres-caja` - Dashboard360 caja closures

**Trabajador:**
- `GET /api/pedidos?trabajadorId=:id` - PedidosTrabajador
- `POST /api/fichajes` - FichajesHorarioCompleto
- `GET /api/fichajes?trabajadorId=:id` - Fichajes history
- `GET /api/formacion/cursos?trabajadorId=:id` - FormacionDocumentacionCompleto

---

## 🐛 Error States to Test

### 1. Empty States
For each section, test with NO data:
- [ ] Cliente → Pedidos (no pedidos) → Should show EmptyState component
- [ ] Cliente → Citas (no citas) → Should show "No tienes citas programadas"
- [ ] Gerente → Pedidos (no pedidos) → Should show EmptyState with icon
- [ ] Trabajador → Pedidos (no assigned) → Should show empty message

### 2. Loading States
- [ ] Slow network (DevTools → Network → Slow 3G)
- [ ] Check for loading spinners/skeletons
- [ ] Components using `<Suspense fallback={<LoadingFallback />}>`

### 3. Error States
- [ ] Stop backend server
- [ ] Try to load data
- [ ] Check for error toasts
- [ ] Check for error boundaries
- [ ] Verify ConnectionIndicator shows offline

### 4. 0 vs Empty Distinction
- **Misleading UX:** Does "0 pedidos" look the same as "error loading pedidos"?
- Test:
  1. Load page with 0 pedidos → Note UI
  2. Stop backend → Reload page → Note UI
  3. **Check:** Are they distinguishable?

---

## 🔒 Security Checks

### Role Switching
- [ ] Login as Cliente
- [ ] Open DevTools Console
- [ ] Try to call `onCambiarRol('gerente')` manually
- [ ] Check if role changes without authentication
- [ ] **Expected:** Should require re-authentication or backend validation

### Visible Sensitive Logs
- [ ] Open DevTools Console
- [ ] Login and navigate dashboards
- [ ] **Check for:**
  - [ ] API tokens in console.log
  - [ ] User passwords in logs
  - [ ] Full user objects with sensitive data
  - [ ] SQL queries or backend errors
- **Found in code:**
  - `GerenteDashboard.tsx` line 73: `console.log('👑 GerenteDashboard iniciado para usuario:', user)`
  - `TrabajadorDashboard.tsx` lines 91-101: Multiple console.logs with user data

### API Response Exposure
- [ ] Open Network tab
- [ ] Perform actions
- [ ] **Check responses for:**
  - [ ] Other users' data
  - [ ] Admin-only fields
  - [ ] Unfiltered database dumps

---

## 📝 Testing Checklist Summary

### Cliente Dashboard (`cliente@prueba.com` / `1234`)
- [ ] Login successful, name displays correctly
- [ ] Inicio: Category selector works
- [ ] Pedidos: List loads, detail modal opens
- [ ] Citas: List loads, nueva cita modal opens
- [ ] Cupones: List loads, can apply
- [ ] Chat: Can send/receive messages
- [ ] Notificaciones: List loads, can mark read
- [ ] Ya estoy aquí: Check console for parseInt/NaN errors
- [ ] Carrito: Add items, view cesta, checkout
- [ ] ConnectionIndicator: Test online/offline states

### Gerente Dashboard (`gerente@prueba.com` / `5678`)
- [ ] Login successful, name displays correctly
- [ ] Dashboard 360: KPIs load, filters work
- [ ] Pedidos Multicanal: **CRITICAL - Test filters (empresa/marca/pdv)**
- [ ] Pedidos Multicanal: **Wait 30s for auto-refresh, check toast spam**
- [ ] Clientes y Productos: Lists load
- [ ] Gestión de Citas: Badge shows 5, can approve/reject
- [ ] TPV 360: Can select terminal, open/close caja
- [ ] Equipo y RRHH: View team data
- [ ] Stock y Proveedores: View stock alerts

### Trabajador Dashboard (`trabajador@demo.com` / `demo123`)
- [ ] Login successful, name displays correctly
- [ ] Inicio: Dashboard overview loads
- [ ] TPV 360: Can select terminal, process pedidos
- [ ] Pedidos: View assigned, mark states, entregar
- [ ] Repartidor: View deliveries, update status
- [ ] Fichajes: Fichar entrada/salida works
- [ ] Formación: View cursos (badge shows 2)
- [ ] Chat: Can communicate

---

## 🎯 Priority Issues

### HIGH PRIORITY
1. **Gerente → Pedidos filters not applying** (empresa/marca/pdv)
   - Impact: Cannot filter pedidos by context
   - Fix: Add filters to `pedidosFiltrados` memo

2. **parseInt(userId) in YaEstoyAquiModal**
   - Impact: Potential NaN errors, failed API calls
   - Fix: Validate userId or accept strings in API

3. **user.name blank rendering**
   - Impact: Poor UX, confusing for users
   - Fix: Add fallback (initials, "Usuario", etc.)

### MEDIUM PRIORITY
4. **Toast spam every 30s in Pedidos** (verify if fixed)
   - Impact: Annoying UX
   - Fix: Already has `silent` check, verify it works

5. **Console.log exposure of user data**
   - Impact: Security/privacy concern
   - Fix: Remove or gate behind DEBUG flag

### LOW PRIORITY
6. **Hardcoded KPIs in dashboards**
   - Impact: Not real-time data
   - Fix: Connect to backend APIs

---

## 📊 Output Format

For each dashboard tested, provide:

```markdown
### [ROLE] Dashboard - [Section]

**KPIs/Widgets:**
- Widget 1: Value X (source: API endpoint or hardcoded)
- Widget 2: Value Y (source: ...)

**Notable Failures:**
- Issue 1: Description, steps to reproduce
- Issue 2: ...

**Reproducible Steps:**
1. Step 1
2. Step 2
3. Expected: ...
4. Actual: ...

**UX Misleading States:**
- 0 data vs error: [distinguishable? yes/no]
- Empty state message: [helpful? yes/no]

**Security Exposure:**
- Console logs: [found sensitive data? yes/no]
- Network responses: [found exposure? yes/no]
```

---

## 🚀 Next Steps After Testing

1. **Fix Critical Bugs:**
   - Pedidos filters
   - parseInt(userId)
   - user.name fallback

2. **Improve UX:**
   - Distinguish 0 data from errors
   - Better loading states
   - Consistent empty states

3. **Security Hardening:**
   - Remove console.logs in production
   - Validate role switching
   - Audit API responses

4. **Backend Integration:**
   - Replace hardcoded KPIs with real data
   - Implement missing API endpoints
   - Add error handling

---

**End of Testing Report Template**
