# 🎯 MAPA DE PRIORIDADES - UDAR EDGE

> Vista rápida: ¿Qué es CORE y qué es secundario?

---

## 🔥 TIER 1: CRÍTICO (Core Business)

**Estos componentes son el corazón del negocio**

### **Auth & Login**
```
🔐 CRÍTICO - Sin esto, nadie puede entrar
├── LoginView.tsx                    ⭐⭐⭐⭐⭐
├── LoginViewMobile.tsx              ⭐⭐⭐⭐⭐
└── AcceptarInvitacion.tsx           ⭐⭐⭐⭐
```

### **Dashboards Principales**
```
📊 CRÍTICO - Vista principal de cada rol
├── ClienteDashboard.tsx             ⭐⭐⭐⭐⭐
├── TrabajadorDashboard.tsx          ⭐⭐⭐⭐⭐
└── GerenteDashboard.tsx             ⭐⭐⭐⭐⭐
```

### **Pedidos (Core)**
```
🛒 CRÍTICO - Sin pedidos, no hay negocio
├── cliente/MisPedidos.tsx           ⭐⭐⭐⭐⭐
├── cliente/CheckoutModal.tsx        ⭐⭐⭐⭐⭐
├── trabajador/PedidosTrabajador.tsx ⭐⭐⭐⭐⭐
└── PanelEstadosPedidos.tsx          ⭐⭐⭐⭐
```

### **Productos (Core)**
```
📦 CRÍTICO - Sin productos, no hay qué vender
├── cliente/TiendaProductos.tsx      ⭐⭐⭐⭐⭐
├── cliente/ProductoDetalle.tsx      ⭐⭐⭐⭐⭐
└── gerente/GestionProductos.tsx     ⭐⭐⭐⭐⭐
```

### **TPV (Core)**
```
💰 CRÍTICO - Cobrar es crítico
├── TPV360Master.tsx                 ⭐⭐⭐⭐⭐
├── ModalAperturaCaja.tsx            ⭐⭐⭐⭐⭐
├── ModalCierreCaja.tsx              ⭐⭐⭐⭐⭐
├── ModalPagoTPV.tsx                 ⭐⭐⭐⭐⭐
└── trabajador/TPVLosPecados.tsx     ⭐⭐⭐⭐
```

### **Navegación**
```
🧭 CRÍTICO - Sin navegación, app inusable
├── navigation/Sidebar.tsx           ⭐⭐⭐⭐⭐
├── navigation/BottomNav.tsx         ⭐⭐⭐⭐⭐
└── navigation/MobileDrawer.tsx      ⭐⭐⭐⭐
```

---

## ⚡ TIER 2: IMPORTANTE (Features Principales)

**Features que el 80% de usuarios usan frecuentemente**

### **Clientes**
```
👥 IMPORTANTE - Gestión clientes
├── gerente/ClientesGerente.tsx      ⭐⭐⭐⭐
├── cliente/PerfilCliente.tsx        ⭐⭐⭐⭐
└── cliente/MisDirecciones.tsx       ⭐⭐⭐
```

### **Stock**
```
📦 IMPORTANTE - Control inventario
├── gerente/StockProveedores.tsx     ⭐⭐⭐⭐
├── gerente/AlertasStock.tsx         ⭐⭐⭐⭐
└── trabajador/ConteoInventario.tsx  ⭐⭐⭐
```

### **EBITDA & Finanzas**
```
📊 IMPORTANTE - Salud del negocio
├── gerente/EBITDAInteractivo.tsx    ⭐⭐⭐⭐
├── gerente/VentasKPIs.tsx           ⭐⭐⭐⭐
└── gerente/CuentaResultados.tsx     ⭐⭐⭐
```

### **RRHH**
```
👔 IMPORTANTE - Gestión empleados
├── gerente/EquipoRRHH.tsx           ⭐⭐⭐⭐
├── trabajador/FichajeTrabajador.tsx ⭐⭐⭐⭐
└── gerente/GestionTurnos.tsx        ⭐⭐⭐
```

### **Facturación**
```
🧾 IMPORTANTE - Emitir facturas
├── gerente/FacturacionFinanzas.tsx  ⭐⭐⭐⭐
├── cliente/MisFacturas.tsx          ⭐⭐⭐⭐
└── gerente/GestionVeriFactu.tsx     ⭐⭐⭐
```

### **Notificaciones**
```
🔔 IMPORTANTE - Comunicación
├── NotificationCenter.tsx           ⭐⭐⭐⭐
├── cliente/NotificacionesCliente.tsx⭐⭐⭐
└── gerente/NotificacionesGerente.tsx⭐⭐⭐
```

---

## 💼 TIER 3: ÚTIL (Features Avanzadas)

**Features que añaden valor pero no son críticas**

### **Proveedores**
```
📋 ÚTIL - Gestión proveedores
├── gerente/ProveedoresGerente.tsx   ⭐⭐⭐
├── gerente/GestionProveedores.tsx   ⭐⭐⭐
└── gerente/GestionPedidosProveedores.tsx ⭐⭐
```

### **Promociones**
```
🎁 ÚTIL - Marketing
├── gerente/PromocionesGerente.tsx   ⭐⭐⭐
├── cliente/CatalogoPromos.tsx       ⭐⭐⭐
└── GestionNotificacionesPromo.tsx   ⭐⭐
```

### **Reportes**
```
📈 ÚTIL - Business Intelligence
├── gerente/ProductividadGerente.tsx ⭐⭐⭐
├── gerente/ReportesMultiempresa.tsx ⭐⭐⭐
└── trabajador/ReportesTrabajador.tsx⭐⭐
```

### **Configuración**
```
⚙️ ÚTIL - Settings
├── gerente/ConfiguracionGerente.tsx ⭐⭐⭐
├── trabajador/ConfiguracionTrabajador.tsx ⭐⭐
└── ConfiguracionCliente.tsx         ⭐⭐
```

### **Onboarding**
```
🎓 ÚTIL - Capacitación empleados
├── gerente/DashboardOnboarding.tsx  ⭐⭐⭐
├── trabajador/OnboardingChecklist.tsx⭐⭐
└── OnboardingWidget.tsx             ⭐⭐
```

### **Integraciones**
```
🔌 ÚTIL - Servicios externos
├── gerente/IntegracionesAgregadores.tsx ⭐⭐⭐
├── gerente/ConfiguracionAgentesExternos.tsx ⭐⭐
└── agente-externo/PanelAgenteExterno.tsx ⭐⭐
```

---

## 🔧 TIER 4: ADMIN (Herramientas de Gestión)

**Herramientas para administración, no críticas operativamente**

### **Auditoría & Históricos**
```
📜 ADMIN - Trazabilidad
├── gerente/HistorialMovimientosStock.tsx ⭐⭐
├── gerente/HistorialRecepciones.tsx      ⭐⭐
└── shared/ActividadReciente.tsx          ⭐⭐
```

### **Documentación**
```
📄 ADMIN - Gestión documental
├── trabajador/DocumentacionTrabajador.tsx⭐⭐
├── trabajador/DocumentacionLaboral.tsx   ⭐⭐
├── gerente/DocumentacionGerente.tsx      ⭐⭐
└── cliente/DocumentacionVehiculo.tsx     ⭐
```

### **Avanzado**
```
🎛️ ADMIN - Configuración avanzada
├── gerente/GestionVeriFactuAvanzado.tsx  ⭐⭐
├── gerente/CronJobsMonitor.tsx           ⭐⭐
├── gerente/ConfiguracionEmpresas.tsx     ⭐⭐
└── gerente/ConfiguracionChats.tsx        ⭐
```

### **Multiempresa**
```
🏢 ADMIN - Multi-tenant
├── gerente/ReportesMultiempresa.tsx      ⭐⭐
├── gerente/ModalCrearEmpresa.tsx         ⭐⭐
└── filtros/FiltroUniversalUDAR.tsx       ⭐⭐
```

---

## 🧪 TIER 5: DEBUG & TESTING (Solo desarrollo)

**No van a producción, solo para desarrollo**

### **Testing**
```
🧪 DEBUG - Solo para testear
├── gerente/TestWebhooks.tsx             ⭐
├── ValidacionVisualTPV.tsx              ⭐
└── demo/SyncDemoIndicator.tsx           ⭐
```

### **Dev Tools**
```
🛠️ DEBUG - Herramientas desarrollo
├── dev/NavigationDebug.tsx              ⭐
├── dev/BreakpointIndicator.tsx          ⭐
├── dev/ImagePerformanceMonitor.tsx      ⭐
└── OfflineDebugger.tsx                  ⭐
```

### **Demos**
```
🎬 DEMO - Demostraciones
├── demo/DemoFlujosMultimarca.tsx        ⭐
├── demo/DemoNotificacionesAgrupadas.tsx ⭐
└── DevicePreview.tsx                    ⭐
```

---

## 🤝 SHARED: COMPONENTES REUTILIZABLES

**Usados por múltiples features, difícil de priorizar**

### **UI Primitives** (shadcn/ui)
```
🎨 SHARED - Base components
├── ui/button.tsx                        ⭐⭐⭐⭐⭐
├── ui/card.tsx                          ⭐⭐⭐⭐⭐
├── ui/dialog.tsx                        ⭐⭐⭐⭐⭐
├── ui/table.tsx                         ⭐⭐⭐⭐
├── ui/badge.tsx                         ⭐⭐⭐⭐
└── ... (50+ componentes)
```

### **Componentes Custom Compartidos**
```
🔄 SHARED - Custom reusables
├── ui/empty-state.tsx                   ⭐⭐⭐⭐
├── ui/skeleton-card.tsx                 ⭐⭐⭐⭐
├── ui/stats-card.tsx                    ⭐⭐⭐⭐
├── ui/timeline.tsx                      ⭐⭐⭐
└── ui/responsive-table.tsx              ⭐⭐⭐
```

### **Shared Features**
```
🤝 SHARED - Features compartidas
├── shared/BrandedHeader.tsx             ⭐⭐⭐⭐
├── shared/DashboardMetricas.tsx         ⭐⭐⭐⭐
├── shared/ExportadorDatos.tsx           ⭐⭐⭐
├── shared/ImageOptimized.tsx            ⭐⭐⭐
└── shared/CommandPalette.tsx            ⭐⭐
```

---

## 📊 RESUMEN VISUAL

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 TIER 1: CRÍTICO (20 componentes)
    Auth, Dashboards, Pedidos, TPV, Nav
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ TIER 2: IMPORTANTE (30 componentes)
    Stock, EBITDA, RRHH, Facturación, Clientes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 TIER 3: ÚTIL (25 componentes)
    Proveedores, Promos, Reportes, Config
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 TIER 4: ADMIN (20 componentes)
    Auditoría, Históricos, Documentación
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TIER 5: DEBUG (15 componentes)
    Testing, Dev tools, Demos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤝 SHARED: REUTILIZABLES (60+ componentes)
    UI, Navigation, Utils
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 REGLAS DE PRIORIZACIÓN

### **⭐⭐⭐⭐⭐ Crítico (Tier 1)**
- Sin esto, la app NO funciona
- Usado por 90%+ de usuarios
- Ruta crítica del negocio

### **⭐⭐⭐⭐ Importante (Tier 2)**
- Usado frecuentemente (50-80% usuarios)
- Features core del negocio
- Alto impacto en UX

### **⭐⭐⭐ Útil (Tier 3)**
- Añade valor significativo
- Usado por usuarios avanzados
- Diferenciador competitivo

### **⭐⭐ Admin (Tier 4)**
- Solo gerentes/admin
- Uso ocasional
- Herramientas de gestión

### **⭐ Debug (Tier 5)**
- Solo desarrollo
- No va a producción
- Herramientas internas

---

## 📋 CHECKLIST RÁPIDO

### **¿Es CRÍTICO si...?**
```
✅ Sin esto, nadie puede usar la app
✅ 90%+ de usuarios lo necesitan
✅ Es parte del flujo principal (login → pedido → pago)
✅ Su fallo bloquea el negocio
```

### **¿Es IMPORTANTE si...?**
```
✅ 50-80% de usuarios lo usan regularmente
✅ Impacta directamente en ventas/operación
✅ Su ausencia se nota inmediatamente
✅ Clientes preguntan por esto
```

### **¿Es ÚTIL si...?**
```
✅ Añade valor pero no es vital
✅ Solo algunos usuarios lo usan
✅ Mejora eficiencia pero no bloquea
✅ Es un "nice to have"
```

### **¿Es ADMIN si...?**
```
✅ Solo gerentes lo necesitan
✅ Uso esporádico (mensual/trimestral)
✅ Es auditoría/histórico/trazabilidad
✅ No impacta operación diaria
```

### **¿Es DEBUG si...?**
```
✅ Solo desarrolladores lo ven
✅ Es para testing/validación
✅ No va a producción
✅ Es demo/ejemplo
```

---

## 🚀 ROADMAP DE DESARROLLO

### **Sprint 1: CRÍTICO**
```
Semana 1-2: Auth + Dashboards
Semana 3-4: Pedidos + Productos
Semana 5-6: TPV + Navegación
```

### **Sprint 2: IMPORTANTE**
```
Semana 7-8: Stock + EBITDA
Semana 9-10: RRHH + Facturación
Semana 11-12: Clientes + Notificaciones
```

### **Sprint 3: ÚTIL**
```
Semana 13-14: Proveedores + Promociones
Semana 15-16: Reportes + Config
Semana 17-18: Integraciones
```

### **Sprint 4: ADMIN**
```
Semana 19-20: Auditoría + Históricos
Semana 21-22: Documentación avanzada
Semana 23-24: Multiempresa
```

---

## 💡 DECISIONES RÁPIDAS

### **¿Dónde empezar a desarrollar backend?**
```
1️⃣ TIER 1 (Crítico): Auth → Pedidos → TPV
2️⃣ TIER 2 (Importante): Stock → EBITDA → RRHH
3️⃣ TIER 3 (Útil): Resto
```

### **¿Qué eliminar si hay que reducir scope?**
```
❌ TIER 5 (Debug) - Siempre eliminable
❌ TIER 4 (Admin) - Puede esperar
⚠️ TIER 3 (Útil) - Evaluar caso a caso
⛔ TIER 2 (Importante) - No eliminar
⛔ TIER 1 (Crítico) - NUNCA eliminar
```

### **¿Qué optimizar primero?**
```
1. TIER 1: Performance crítico
2. TIER 2: Performance importante
3. Shared: Afecta a todos
4. TIER 3-5: Baja prioridad
```

---

## 📖 DOCUMENTACIÓN RELACIONADA

- [ESTRUCTURA_CODIGO.md](./ESTRUCTURA_CODIGO.md) - Estructura detallada
- [README.md](./README.md) - README principal
- [docs/README_DOCS.md](./docs/README_DOCS.md) - Índice docs

---

**🎯 Priorización clara | Decisiones rápidas | Desarrollo eficiente**

*Última actualización: Diciembre 2025*
