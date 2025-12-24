import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sidebar, MenuItem, QuickAction as SidebarQuickAction } from './navigation/Sidebar';
import { BottomNav, BottomNavItem } from './navigation/BottomNav';
import { MobileDrawer, DrawerMenuItem } from './navigation/MobileDrawer';
import { QuickActions, QuickAction } from './navigation/QuickActions';
import { KPICards, KPIData } from './navigation/KPICards';
import { Breadcrumb, BreadcrumbItem } from './navigation/Breadcrumb';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getConfig } from '../config/white-label.config';
import udarLogo from 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png';

import { 
  Home,
  ClipboardList,
  Clock,
  CalendarDays,
  MessageSquare,
  BarChart3,
  GraduationCap,
  HelpCircle,
  Settings,
  LogOut,
  Package,
  ListTodo,
  CheckCircle2,
  PackagePlus,
  FileText,
  CreditCard,
  Cog,
  TruckIcon,
  Bell,
  Menu,
  Rocket,
  Store
} from 'lucide-react';
import { InicioTrabajador } from './trabajador/InicioTrabajador';
import { TareasTrabajador } from './trabajador/TareasTrabajador';
import { FichajeColaborador, FichajeColaboradorRef } from './FichajeColaborador';
import { FichajesHorarioCompleto, FichajesHorarioCompletoRef } from './trabajador/FichajesHorarioCompleto';
import { FormacionDocumentacionCompleto } from './trabajador/FormacionDocumentacionCompleto';
import { AgendaTrabajador } from './trabajador/AgendaTrabajador';
import { MaterialTrabajador } from './trabajador/MaterialTrabajador';
import { ChatTrabajador } from './trabajador/ChatTrabajador';
import { ReportesTrabajador } from './trabajador/ReportesTrabajador';
import { FormacionTrabajador } from './trabajador/FormacionTrabajador';
import { DocumentacionTrabajador } from './trabajador/DocumentacionTrabajador';
import { NotificacionesTrabajador } from './trabajador/NotificacionesTrabajador';
import { ConfiguracionTrabajador } from './trabajador/ConfiguracionTrabajador';
import { OnboardingChecklist } from './trabajador/OnboardingChecklist';
import { TPVLosPecados } from './trabajador/TPVLosPecados';
import { PedidosTrabajador } from './trabajador/PedidosTrabajador';
import { TPV360Master, PermisosTPV } from './TPV360Master';
import { ModalSeleccionTPV } from './gerente/ModalSeleccionTPV';
import { ModalEntregarPedido } from './trabajador/ModalEntregarPedido';
import { RepartidorDashboard } from './repartidor/RepartidorDashboard';
import type { User } from '../App';
import { toast } from 'sonner@2.0.3';

interface TrabajadorDashboardProps {
  user: User;
  onLogout: () => void;
  onCambiarRol?: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
}

export function TrabajadorDashboard({ user, onLogout, onCambiarRol }: TrabajadorDashboardProps) {
  const [activeSection, setActiveSection] = useState('tpv');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enTurno, setEnTurno] = useState(false);
  
  // Ref para controlar el componente FichajesHorarioCompleto
  const fichajesRef = useRef<FichajesHorarioCompletoRef>(null);
  
  // Estados para TPV y selección de punto de venta
  const [showModalSeleccionTPV, setShowModalSeleccionTPV] = useState(false);
  const [puntoVentaActivo, setPuntoVentaActivo] = useState<string>('');
  const [tpvActivo, setTpvActivo] = useState<string>('');
  const [marcaActiva, setMarcaActiva] = useState<string>('');
  const [marcasDisponibles, setMarcasDisponibles] = useState<string[]>([]);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [showModalEntregarPedido, setShowModalEntregarPedido] = useState(false);

  // Badges
  const tareasPendientes = 5;
  const mensajesNoLeidos = 3;
  const cursosPendientes = 2;

  // Callback para recibir notificación de cambios en el fichaje
  const handleFichajeChange = (fichado: boolean) => {
    console.log('[TRABAJADOR] Estado de fichaje cambió:', fichado);
    setEnTurno(fichado);
  };

  const handleFicharClick = () => {
    console.log('[TRABAJADOR] Botón de fichaje clickeado');
    
    // Verificar si ya está fichado
    const estaFichado = fichajesRef.current?.estaFichado();
    console.log('[TRABAJADOR] ¿Está fichado?', estaFichado);
    
    // Ir a la sección de fichaje para mostrar el componente
    setActiveSection('fichaje');
    
    // El componente está siempre montado, así que podemos llamar directamente
    if (estaFichado) {
      // Ya está fichado, hacer fichar salida
      console.log('[TRABAJADOR] Llamando a fichajarSalida()');
      fichajesRef.current?.fichajarSalida();
    } else {
      // No está fichado, abrir modal para fichar entrada
      console.log('[TRABAJADOR] Llamando a abrirModalFichaje()');
      fichajesRef.current?.abrirModalFichaje();
    }
  };

  // Funciones para manejar la selección de TPV
  const handleConfirmarTPV = (puntoVentaId: string, tpvId: string, marcaSeleccionada?: string) => {
    setPuntoVentaActivo(puntoVentaId);
    setTpvActivo(tpvId);
    
    // Configurar marcas disponibles según el terminal
    const esPrimerTerminal = tpvId.includes('TPV1') || tpvId.includes('TPV-1');
    const marcasTerminal = esPrimerTerminal ? ['MRC-001', 'MRC-002'] : ['MRC-001'];
    
    setMarcasDisponibles(marcasTerminal);
    setMarcaActiva(marcaSeleccionada || marcasTerminal[0]);
    
    // No marcar caja como abierta aquí - eso lo hará el TPV360Master después de la apertura
    toast.success(`TPV ${tpvId} configurado correctamente`, {
      description: 'Ahora puedes abrir la caja para comenzar a operar'
    });
  };

  const handleCerrarTPV = () => {
    setPuntoVentaActivo('');
    setTpvActivo('');
    setMarcaActiva('');
    setMarcasDisponibles([]);
    setCajaAbierta(false);
    setActiveSection('inicio');
    toast.info('Caja cerrada correctamente');
  };

  const handleCambiarMarca = (nuevaMarcaId: string) => {
    // Validar que la marca esté disponible
    if (!marcasDisponibles.includes(nuevaMarcaId)) {
      toast.error('Esta marca no está disponible en el terminal actual');
      return;
    }
    
    // Cambiar marca directamente
    setMarcaActiva(nuevaMarcaId);
    
    // Feedback simple
    toast.success(`Marca cambiada`);
  };



  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'tpv', label: 'TPV 360', icon: CreditCard },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'repartidor', label: 'Repartidor', icon: TruckIcon },
    { id: 'operativa', label: 'Operativa', icon: ClipboardList },
    { id: 'chat', label: 'Chats', icon: MessageSquare, badge: mensajesNoLeidos },
    { id: 'material', label: 'Productos', icon: Package },
    { id: 'fichaje', label: 'Fichajes y Horario', icon: Clock },
    { id: 'formacion', label: 'Formación y Documentación', icon: GraduationCap, badge: cursosPendientes },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  // Bottom nav items para móvil (5 botones principales centrados)
  const bottomNavItems: BottomNavItem[] = [
    { id: 'tpv', label: 'TPV 360', icon: CreditCard },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: mensajesNoLeidos },
    { id: 'material', label: 'Productos', icon: Package },
    { id: 'fichaje', label: 'Fichaje', icon: Clock },
  ];

  // Items para el drawer móvil (todas las opciones del menú principal)
  const drawerItems: DrawerMenuItem[] = menuItems;

  // Botones rápidos para el sidebar
  const sidebarQuickActions: SidebarQuickAction[] = [
    {
      label: enTurno ? 'Fichar Salida' : 'Fichar Entrada',
      icon: Clock,
      onClick: handleFicharClick,
      variant: enTurno ? 'warning' : 'success',
      tooltip: enTurno ? 'Registrar salida' : 'Registrar entrada/salida'
    },
    {
      label: 'Entregar Pedido',
      icon: TruckIcon,
      onClick: () => setShowModalEntregarPedido(true),
      variant: 'purple',
      tooltip: 'Entregar pedidos a clientes (Local/Domicilio)'
    }
  ];

  const quickActions: QuickAction[] = [
    { 
      id: 'fichar', 
      label: 'Fichar Entrada/Salida', 
      icon: Clock, 
      variant: 'green',
      onClick: handleFicharClick
    },
    { 
      id: 'abrir-tareas-hoy', 
      label: 'Abrir Tareas de Hoy', 
      icon: ListTodo, 
      variant: 'teal',
      onClick: () => setActiveSection('tareas')
    },
  ];

  const kpis: KPIData[] = [
    { 
      id: 'tareas-completadas', 
      label: 'Tareas Completadas', 
      value: '23', 
      change: 15.3, 
      icon: CheckCircle2, 
      iconColor: 'text-green-600' 
    },
    { 
      id: 'tareas-pendientes', 
      label: 'Tareas Pendientes', 
      value: '5', 
      icon: ClipboardList, 
      iconColor: 'text-orange-600' 
    },
    { 
      id: 'horas-trabajadas', 
      label: 'Horas (esta semana)', 
      value: '38h', 
      icon: Clock, 
      iconColor: 'text-blue-600' 
    },
    { 
      id: 'desempeno', 
      label: 'Desempeño', 
      value: '92%', 
      change: 8.2, 
      icon: BarChart3, 
      iconColor: 'text-teal-600' 
    },
  ];

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Colaborador' },
    { label: getSectionLabel(activeSection) },
  ];

  function getSectionLabel(id: string): string {
    const item = menuItems.find(item => item.id === id);
    return item ? item.label : 'Inicio';
  }

  function getNombrePDVConMarcas(puntoVentaId: string): string {
    // Aquí puedes implementar la lógica para obtener el nombre del punto de venta y las marcas disponibles
    // Por ejemplo, podrías consultar una base de datos o un servicio para obtener esta información
    // Para este ejemplo, devolveremos un nombre genérico
    return `Punto de Venta ${puntoVentaId} - Marcas: ${marcasDisponibles.join(', ')}`;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return <InicioTrabajador />;
      case 'operativa':
        return (
          <TareasTrabajador
            trabajadorId={user.id}
            trabajadorNombre={user.name}
            puntoVentaId={puntoVentaActivo || undefined}
            puntoVentaNombre={puntoVentaActivo ? getNombrePDVConMarcas(puntoVentaActivo) : undefined}
          />
        );
      case 'fichaje':
        return null; // Renderizado aparte para mantener el ref
      case 'tareas':
        return (
          <TareasTrabajador
            trabajadorId={user.id}
            trabajadorNombre={user.name}
            puntoVentaId={puntoVentaActivo || undefined}
            puntoVentaNombre={puntoVentaActivo ? getNombrePDVConMarcas(puntoVentaActivo) : undefined}
          />
        );
      case 'material':
        return <MaterialTrabajador />;
      case 'chat':
        return <ChatTrabajador />;
      case 'formacion':
        return (
          <FormacionDocumentacionCompleto
            trabajadorId={user.id}
            trabajadorNombre={user.name}
          />
        );
      case 'documentacion':
        return <DocumentacionTrabajador />;
      case 'notificaciones':
        return <NotificacionesTrabajador />;
      case 'configuracion':
        return <ConfiguracionTrabajador user={user} onCambiarRol={onCambiarRol} />;
      case 'tpv':
        // TPV360Master con permisos completos para trabajador
        const permisosTPV: PermisosTPV = {
          cobrar_pedidos: true,
          marcar_como_listo: true,
          gestionar_caja_rapida: true,
          hacer_retiradas: true,
          arqueo_caja: true,
          cierre_caja: true,
          ver_informes_turno: true,
          acceso_operativa: true,
          reimprimir_tickets: true
        };
        return (
          <TPV360Master
            permisos={permisosTPV}
            nombreUsuario={user.name}
            rolUsuario="Trabajador"
            puntoVentaId={puntoVentaActivo}
            tpvId={tpvActivo}
            marcaActiva={marcaActiva}
            marcasDisponibles={marcasDisponibles}
            onCerrarCaja={handleCerrarTPV}
            onSolicitarSeleccionTPV={() => setShowModalSeleccionTPV(true)}
            onCambiarMarca={handleCambiarMarca}
          />
        );
      case 'pedidos':
        return <PedidosTrabajador />;
      case 'repartidor':
        return <RepartidorDashboard />;
      default:
        return <InicioTrabajador />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Desktop & Tablet */}
      <Sidebar
        user={{ ...user, name: 'Juan Pérez' }}
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        roleLabel="Panadero"
        avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3MzE2MTMyMDh8MA&ixlib=rb-4.0.3&q=80&w=200"
        quickActions={sidebarQuickActions}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {/* Top Bar - Optimizado para móvil */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Solo mostrar breadcrumbs si NO estamos en Inicio y estamos en desktop */}
            {activeSection !== 'inicio' && (
              <div className="hidden md:block">
                <Breadcrumb items={breadcrumbs} />
              </div>
            )}
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
                  onClick={() => setActiveSection('notificaciones')}
                  className="relative min-w-[44px] min-h-[44px] p-0 flex items-center justify-center"
                >
                  <Bell className="w-5 h-5" />
                  {tareasPendientes > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                      {tareasPendientes > 9 ? '9+' : tareasPendientes}
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
          {/* FichajesHorarioCompleto siempre montado para mantener el ref activo */}
          <div style={{ display: activeSection === 'fichaje' ? 'block' : 'none' }}>
            <FichajesHorarioCompleto 
              ref={fichajesRef}
              trabajadorId={user.id}
              trabajadorNombre={user.name}
              puntoVentaId={puntoVentaActivo || undefined}
              puntoVentaNombre={puntoVentaActivo ? getNombrePDVConMarcas(puntoVentaActivo) : undefined}
            />
          </div>
          
          {/* Resto de contenido */}
          {activeSection !== 'fichaje' && renderContent()}
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <BottomNav
        items={bottomNavItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onMoreClick={() => setDrawerOpen(true)}
        maxItems={5}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onOpenChange={setDrawerOpen}
        items={drawerItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        title="Menú Principal"
      />

      {/* Modal de Selección de Punto de Venta y TPV */}
      <ModalSeleccionTPV
        open={showModalSeleccionTPV}
        onOpenChange={setShowModalSeleccionTPV}
        onConfirmar={handleConfirmarTPV}
      />

      {/* Modal de Entregar Pedido */}
      <ModalEntregarPedido
        open={showModalEntregarPedido}
        onClose={() => setShowModalEntregarPedido(false)}
      />
    </div>
  );
}