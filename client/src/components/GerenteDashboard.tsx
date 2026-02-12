import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Button } from './ui/button';
import { Sidebar, MenuItem, QuickAction as SidebarQuickAction } from './navigation/Sidebar';
import { BottomNav, BottomNavItem } from './navigation/BottomNav';
import { MobileDrawer, DrawerMenuItem } from './navigation/MobileDrawer';
import { QuickActions, QuickAction } from './navigation/QuickActions';
import { KPICards, KPIData } from './navigation/KPICards';
import { Breadcrumb, BreadcrumbItem } from './navigation/Breadcrumb';
import { Dashboard360 } from './gerente/Dashboard360';
import { OperativaGerente } from './gerente/OperativaGerente';
import { ClientesGerente } from './gerente/ClientesGerente';
import { FacturacionFinanzas } from './gerente/FacturacionFinanzas';
import { PersonalRRHH } from './gerente/PersonalRRHH';
import { StockProveedores } from './gerente/StockProveedores';
import { ProductividadGerente } from './gerente/ProductividadGerente';
import { EquipoRRHH } from './gerente/EquipoRRHH';
import { IntegracionesDelivery } from './gerente/IntegracionesDelivery';
import { PedidosGerente } from './gerente/PedidosGerente';
import { PUNTOS_VENTA_ARRAY, getNombrePDVConMarcas, getNombreMarca, MARCAS } from '../constants/empresaConfig';
import { NotificacionesGerente } from './gerente/NotificacionesGerente';
import { AyudaGerente } from './gerente/AyudaGerente';
import { ConfiguracionGerente } from './gerente/ConfiguracionGerente';
import { DocumentacionGerente } from './gerente/DocumentacionGerente';
import { LoadingFallback } from './LoadingFallback';
import type { User } from '../App';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getConfig } from '../config/white-label.config';
import udarLogo from 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png';
import { dashboardGerenteApi, finanzasApi, operativaApi } from '../services/api/gerente.api';
import { gerenteConfigApi, puntosVentaApi } from '../services/api';
import {
  LayoutDashboard,
  Store,
  Users,
  UserCheck,
  Package,
  Coffee,
  HelpCircle,
  FolderOpen,
  Bell,
  Settings,
  Receipt,
  Wallet,
  CheckSquare,
  FileCheck,
  DollarSign,
  UserPlus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Percent,
  UserMinus,
  Menu,
  LogOut,
  Truck,
  Calendar
} from 'lucide-react';

// ⚡ Lazy Loading de componentes pesados (TPV y modales)
const TPV360Master = lazy(() => import('./TPV360Master').then(m => ({ default: m.TPV360Master || m.default })));
const ModalSeleccionTPV = lazy(() => import('./gerente/ModalSeleccionTPV').then(m => ({ default: m.ModalSeleccionTPV })));
const GestionCitas = lazy(() => import('./gerente/GestionCitas').then(m => ({ default: m.GestionCitas })));

import type { PermisosTPV } from './TPV360Master';

interface GerenteDashboardProps {
  user: User;
  onLogout: () => void;
  onCambiarRol?: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
}

export function GerenteDashboard({ user, onLogout, onCambiarRol }: GerenteDashboardProps) {
  console.log('👑 GerenteDashboard iniciado para usuario:', user);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accionRapidaDialog, setAccionRapidaDialog] = useState<string | null>(null);
  
  // Estados para TPV
  const [showModalSeleccionTPV, setShowModalSeleccionTPV] = useState(false);
  const [puntoVentaActivo, setPuntoVentaActivo] = useState<string>('');
  const [tpvActivo, setTpvActivo] = useState<string>('');
  const [marcaActiva, setMarcaActiva] = useState<string>('');
  const [marcasDisponibles, setMarcasDisponibles] = useState<string[]>([]);
  const [cajaAbierta, setCajaAbierta] = useState(false);

  const [badges, setBadges] = useState({
    alertas: 0,
    impagos: 0,
    urgentes: 0,
    noLeidos: 0,
    citasPendientes: 0,
  });

  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard 360', 
      icon: LayoutDashboard, 
      badge: badges.alertas > 0 ? badges.alertas : undefined 
    },
    { 
      id: 'tienda', 
      label: 'TPV 360 - Base', 
      icon: Store 
    },
    { 
      id: 'pedidos', 
      label: 'Pedidos Multicanal', 
      icon: Receipt 
    },
    { 
      id: 'citas', 
      label: 'Gestión de Citas', 
      icon: Calendar,
      badge: badges.citasPendientes > 0 ? badges.citasPendientes : undefined 
    },
    { 
      id: 'clientes', 
      label: 'Clientes y Productos', 
      icon: Users 
    },
    { 
      id: 'equipo', 
      label: 'Equipo y RRHH', 
      icon: UserCheck 
    },
    { 
      id: 'proveedores', 
      label: 'Stock y Proveedores', 
      icon: Package 
    },
    { 
      id: 'integraciones-delivery', 
      label: 'Integraciones Delivery', 
      icon: Truck 
    },
    { 
      id: 'operativa', 
      label: 'Operativa', 
      icon: Coffee, 
      badge: badges.urgentes > 0 ? badges.urgentes : undefined 
    },
    { 
      id: 'ayuda', 
      label: 'Chat y Soporte', 
      icon: HelpCircle,
      badge: badges.noLeidos > 0 ? badges.noLeidos : undefined
    },
    { 
      id: 'documentacion', 
      label: 'Documentación y Vehículos', 
      icon: FolderOpen 
    },
    { 
      id: 'notificaciones', 
      label: 'Notificaciones', 
      icon: Bell 
    },
    { 
      id: 'configuracion', 
      label: 'Configuración', 
      icon: Settings
    },
  ];

  // Bottom nav items para móvil (5 botones principales centrados)
  const bottomNavItems: BottomNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: badges.alertas },
    { id: 'tienda', label: 'TPV', icon: Store },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'operativa', label: 'Operativa', icon: Coffee, badge: badges.urgentes },
    { id: 'equipo', label: 'Equipo', icon: UserCheck },
  ];

  // Items para el drawer móvil (todas las opciones del menú principal)
  const drawerItems: DrawerMenuItem[] = menuItems;

  // Botones rápidos para el sidebar
  const sidebarQuickActions: SidebarQuickAction[] = [
    {
      label: 'Aprobar compra',
      icon: Receipt,
      onClick: () => {
        toast.success('Abriendo compras pendientes...');
        handleAccionRapida('aprobar-compra');
      },
      variant: 'warning',
      tooltip: 'Revisar y aprobar compras'
    },
    {
      label: 'Autorizar pago',
      icon: Wallet,
      onClick: () => {
        toast.info('Abriendo pagos pendientes...');
        handleAccionRapida('autorizar-pago');
      },
      variant: 'orange',
      tooltip: 'Autorizar pagos pendientes'
    }
  ];

  const quickActions: QuickAction[] = [
    { 
      id: 'aprobar-presupuesto', 
      label: 'Aprobar Presupuesto', 
      icon: CheckSquare, 
      variant: 'green',
      onClick: () => handleAccionRapida('aprobar-presupuesto')
    },
    { 
      id: 'crear-presupuesto', 
      label: 'Crear Presupuesto', 
      icon: FileCheck, 
      variant: 'teal',
      onClick: () => handleAccionRapida('crear-presupuesto')
    },
    { 
      id: 'autorizar-pago', 
      label: 'Autorizar Pago', 
      icon: DollarSign, 
      variant: 'blue',
      onClick: () => handleAccionRapida('autorizar-pago')
    },
    { 
      id: 'alta-rapida', 
      label: 'Alta Rápida', 
      icon: UserPlus, 
      variant: 'purple',
      onClick: () => handleAccionRapida('alta-rapida')
    },
  ];

  const [kpis, setKpis] = useState<KPIData[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadBadgesAndKpis = async () => {
      try {
        const empresaId = (await gerenteConfigApi.empresas.list())?.[0]?.id;
        const [alertasArr, impagosArr, statsOperativa, kpisApi] = await Promise.all([
          dashboardGerenteApi.obtenerAlertas(),
          finanzasApi.obtenerImpagos(empresaId ? { empresa_id: String(empresaId) } : undefined),
          operativaApi.obtenerEstadisticas(empresaId ? { empresa_id: String(empresaId) } : undefined),
          dashboardGerenteApi.obtenerKPIs(empresaId ? { empresa_id: String(empresaId) } : undefined),
        ]);

        if (cancelled) return;
        setBadges({
          alertas: Array.isArray(alertasArr) ? alertasArr.length : 0,
          impagos: Array.isArray(impagosArr) ? impagosArr.length : 0,
          urgentes: Number((statsOperativa as any)?.urgentes || 0),
          noLeidos: 0,
          citasPendientes: 0,
        });

        const k = kpisApi || {};
        setKpis([
          {
            id: 'mrr',
            label: 'MRR',
            value: `€${Number(k.mrr || 0).toLocaleString('es-ES')}`,
            change: Number(k.variacion_mrr || 0),
            icon: TrendingUp,
            iconColor: 'text-green-600',
          },
          {
            id: 'pedidos',
            label: 'Pedidos',
            value: `${Number(k.pedidos || 0).toLocaleString('es-ES')}`,
            change: Number(k.variacion_pedidos || 0),
            icon: Receipt,
            iconColor: 'text-blue-600',
          },
          {
            id: 'clientes',
            label: 'Clientes',
            value: `${Number(k.clientes_unicos || 0).toLocaleString('es-ES')}`,
            change: Number(k.variacion_clientes || 0),
            icon: Users,
            iconColor: 'text-orange-600',
          },
          {
            id: 'margen',
            label: 'Margen',
            value: `${Number(k.margen_porcentaje || 0).toFixed(1)}%`,
            change: Number(k.variacion_margen || 0),
            icon: Percent,
            iconColor: 'text-purple-600',
          },
        ]);
      } catch (e) {
        console.error('Error cargando badges/kpis gerente:', e);
        if (!cancelled) {
          setBadges({ alertas: 0, impagos: 0, urgentes: 0, noLeidos: 0, citasPendientes: 0 });
          setKpis([]);
        }
      }
    };
    void loadBadgesAndKpis();
    return () => {
      cancelled = true;
    };
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Gerente' },
    { label: getSectionLabel(activeSection) },
  ];

  function getSectionLabel(id: string): string {
    const item = menuItems.find(item => item.id === id);
    if (item) return item.label;
    
    // Check submenu items
    for (const menuItem of menuItems) {
      if (menuItem.submenu) {
        const subItem = menuItem.submenu.find(sub => sub.id === id);
        if (subItem) return subItem.label;
      }
    }
    
    return 'Dashboard';
  }

  const handleAccionRapida = (id: string) => {
    setAccionRapidaDialog(id);
  };

  const handleConfirmarAccion = () => {
    toast.success('Acción ejecutada correctamente');
    setAccionRapidaDialog(null);
  };

  // Manejador para cambio de sección con validación de PDV para TPV
  const handleSectionChange = (sectionId: string) => {
    // Si intenta ir a TPV y no hay PDV configurado, mostrar modal de selección
    if (sectionId === 'tienda' && !puntoVentaActivo) {
      setShowModalSeleccionTPV(true);
      return;
    }
    setActiveSection(sectionId);
  };

  const handleConfirmarTPV = (puntoVentaId: string, tpvId: string, marcaSeleccionada?: string) => {
    setPuntoVentaActivo(puntoVentaId);
    setTpvActivo(tpvId);
    
    // Marcas disponibles: terminal -> PDV
    void (async () => {
      try {
        const [terminales, pdv] = await Promise.all([
          gerenteConfigApi.terminales.list({ puntoVentaId }),
          puntosVentaApi.getById(puntoVentaId),
        ]);
        const terminal = (terminales || []).find((t) => t.id === tpvId);
        const marcas = (terminal?.marcas?.length ? terminal.marcas : pdv?.marcasIds) || [];
        const marcasIds = (marcas || []).map(String);
        setMarcasDisponibles(marcasIds);
        setMarcaActiva(marcaSeleccionada || marcasIds[0] || '');
      } catch (e) {
        console.error(e);
        setMarcasDisponibles([]);
        setMarcaActiva(marcaSeleccionada || '');
      }
    })();
    
    // Cambiar a la sección tienda después de configurar
    setActiveSection('tienda');
    
    // No marcar caja como abierta aquí - eso lo hará el TPV360Master después de la apertura
    toast.success(`TPV ${tpvId} configurado correctamente`, {
      description: marcaSeleccionada 
        ? `Punto de venta: ${marcaSeleccionada}. Ahora puedes abrir la caja para comenzar a operar`
        : 'Ahora puedes abrir la caja para comenzar a operar'
    });
  };

  const handleCerrarTPV = () => {
    setPuntoVentaActivo('');
    setTpvActivo('');
    setMarcaActiva('');
    setMarcasDisponibles([]);
    setCajaAbierta(false);
    setActiveSection('dashboard');
    toast.success('Caja cerrada correctamente');
  };

  const handleCambiarMarca = (nuevaMarcaId: string) => {
    // Validar que la marca esté disponible en el PDV actual
    if (!marcasDisponibles.includes(nuevaMarcaId)) {
      toast.error('Esta marca no está disponible en el PDV actual');
      return;
    }
    
    // Cambiar marca directamente
    setMarcaActiva(nuevaMarcaId);
    
    // Guardar preferencia (opcional)
    if (puntoVentaActivo) {
      localStorage.setItem(`gerente_marca_preferida_${puntoVentaActivo}`, nuevaMarcaId);
    }
    
    // Feedback
    const nombreMarca = getNombreMarca(nuevaMarcaId);
    toast.success(`Cambiado a ${nombreMarca}`);
  };



  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard360 />;
      case 'operativa':
        return <OperativaGerente />;
      case 'clientes':
        return <ClientesGerente />;
      case 'pedidos':
        return <PedidosGerente />;
      case 'citas':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <GestionCitas />
          </Suspense>
        );
      case 'facturacion':
        return <FacturacionFinanzas />;
      case 'personal':
        return <PersonalRRHH />;
      case 'proveedores':
        return <StockProveedores />;
      case 'integraciones-delivery':
        return <IntegracionesDelivery />;
      case 'productividad':
        return <ProductividadGerente />;
      case 'equipo':
        return <EquipoRRHH />;
      case 'tienda':
        // TPV360Master con permisos completos para gerente
        const permisosTPV: PermisosTPV = {
          cobrar_pedidos: true,
          marcar_como_listo: true,
          gestionar_caja_rapida: true,
          hacer_retiradas: true,
          arqueo_caja: true,
          cierre_caja: true,
          ver_informes_turno: true,
          acceso_operativa: true,
          reimprimir_tickets: true,
        };
        
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TPV360Master
              permisos={permisosTPV}
              nombreUsuario={user.name}
              rolUsuario="Gerente"
              puntoVentaId={puntoVentaActivo}
              tpvId={tpvActivo}
              marcaActiva={marcaActiva}
              marcasDisponibles={marcasDisponibles}
              onCerrarCaja={handleCerrarTPV}
              onSolicitarSeleccionTPV={() => setShowModalSeleccionTPV(true)}
              onCambiarMarca={handleCambiarMarca}
            />
          </Suspense>
        );
      case 'notificaciones':
        return <NotificacionesGerente />;
      case 'ayuda':
        return <AyudaGerente />;
      case 'documentacion':
        return <DocumentacionGerente />;
      case 'configuracion':
        return <ConfiguracionGerente activeSubsection={activeSection} user={user} onCambiarRol={onCambiarRol} />;
      default:
        return <Dashboard360 />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Desktop & Tablet */}
      <Sidebar
        user={user}
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        roleLabel="Gerente"
        avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI2NzM4NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        quickActions={sidebarQuickActions}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {/* Top Bar - Optimizado para móvil */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Breadcrumb solo en desktop */}
            <div className="hidden md:block">
              <Breadcrumb items={breadcrumbs} />
            </div>
            <div className="flex items-center justify-between">
              {/* Logo y Menú - Móvil */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden min-w-[44px] min-h-[44px] p-0 flex items-center justify-center"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6" />
                </Button>
                
                {/* Logo - Solo visible en móvil */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-200">
                    <img
                      src={udarLogo}
                      alt={getConfig().appName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                <h1 className="text-gray-900 text-base sm:text-lg md:text-xl lg:text-2xl truncate flex-1 min-w-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {getSectionLabel(activeSection)}
                </h1>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Botón Notificaciones - Touch optimizado */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSectionChange('notificaciones')}
                  className="relative min-w-[44px] min-h-[44px] p-0 flex items-center justify-center"
                >
                  <Bell className="w-5 h-5" />
                  {badges.alertas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                      {badges.alertas > 9 ? '9+' : badges.alertas}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="hidden lg:flex items-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Optimizado para móvil */}
        <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Section Content */}
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <BottomNav
        items={bottomNavItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onMoreClick={() => setDrawerOpen(true)}
        maxItems={5}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        items={drawerItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        title="Menú Principal"
      />

      {/* Dialogs para Acciones Rápidas */}
      <Dialog open={accionRapidaDialog !== null} onOpenChange={() => setAccionRapidaDialog(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {accionRapidaDialog === 'aprobar-presupuesto' && 'Aprobar Presupuesto'}
              {accionRapidaDialog === 'crear-presupuesto' && 'Crear Presupuesto'}
              {accionRapidaDialog === 'autorizar-pago' && 'Autorizar Pago'}
              {accionRapidaDialog === 'alta-rapida' && 'Alta Rápida'}
              {!accionRapidaDialog && 'Acción Rápida'}
            </DialogTitle>
            <DialogDescription>
              Completa los detalles para procesar esta acción rápida
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setAccionRapidaDialog(null)}>
              Cancelar
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleConfirmarAccion}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Punto de Venta y TPV */}
      <Suspense fallback={<LoadingFallback />}>
        <ModalSeleccionTPV
          open={showModalSeleccionTPV}
          onOpenChange={setShowModalSeleccionTPV}
          onConfirmar={handleConfirmarTPV}
        />
      </Suspense>
    </div>
  );
}