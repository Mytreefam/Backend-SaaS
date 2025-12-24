import { useState, lazy, Suspense } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sidebar, type MenuItem } from './navigation/Sidebar';
import { Breadcrumb, type BreadcrumbItem } from './navigation/Breadcrumb';
import { MobileDrawer, type DrawerMenuItem } from './navigation/MobileDrawer';
import { BottomNav, type BottomNavItem } from './navigation/BottomNav';
import { useCart } from '../contexts/CartContext';
import { Home, Package, ShoppingBag, Store, MapPin, Calendar, Clock, MessageSquare, Settings, Info, LogOut, Menu, Bell, ShoppingCart, CheckCircle2, Ticket } from 'lucide-react';
import { InicioCliente } from './cliente/InicioCliente';
import { MisPedidos } from './cliente/MisPedidos';
import { QuienesSomos } from './cliente/QuienesSomos';
import { ChatCliente } from './cliente/ChatCliente';
import { NotificationCenter } from './NotificationCenter';
import { ConfiguracionCliente } from './ConfiguracionCliente';
import { LoadingFallback } from './LoadingFallback';
import { MisCupones } from './cliente/MisCupones';
import { obtenerPedidosCliente, obtenerPedido, type Pedido } from '../services/pedidos.service';
import type { User } from '../App';
import { toast } from 'sonner@2.0.3';
import { getConfig } from '../config/white-label.config';
import udarLogo from 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png';

// ⚡ Lazy Loading de modales pesados
const MiPedido = lazy(() => import('./cliente/MiPedido').then(m => ({ default: m.MiPedido })));
const CestaOverlay = lazy(() => import('./cliente/CestaOverlay').then(m => ({ default: m.CestaOverlay })));
const SolicitudCitaModal = lazy(() => import('./cliente/SolicitudCitaModal').then(m => ({ default: m.SolicitudCitaModal })));
const MisCitas = lazy(() => import('./cliente/MisCitas').then(m => ({ default: m.MisCitas })));
const AsistenciaModal = lazy(() => import('./cliente/AsistenciaModal').then(m => ({ default: m.AsistenciaModal })));
const YaEstoyAquiModal = lazy(() => import('./cliente/YaEstoyAquiModal').then(m => ({ default: m.YaEstoyAquiModal })));
const TurnoDetallesModal = lazy(() => import('./cliente/TurnoDetallesModal').then(m => ({ default: m.TurnoDetallesModal })));
const PedidoConfirmacionModal = lazy(() => import('./cliente/PedidoConfirmacionModal').then(m => ({ default: m.PedidoConfirmacionModal })));
const TurnoBanner = lazy(() => import('./cliente/TurnoBanner').then(m => ({ default: m.TurnoBanner })));

interface ClienteDashboardProps {
  user: User;
  onLogout: () => void;
  onCambiarRol?: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
}

export function ClienteDashboard({ user, onLogout, onCambiarRol }: ClienteDashboardProps) {
  const [activeSection, setActiveSection] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [miPedidoOpen, setMiPedidoOpen] = useState(false); // PASO 2: Líneas de pedido
  const [cestaOpen, setCestaOpen] = useState(false); // PASO 3: Carrito final
  const [solicitudCitaModalOpen, setSolicitudCitaModalOpen] = useState(false);
  const [asistenciaModalOpen, setAsistenciaModalOpen] = useState(false);
  const [citasProgramadas, setCitasProgramadas] = useState(2);
  
  // 🛒 Carrito de compra - Contador dinámico
  const { totalItems: itemsEnCesta } = useCart();
  
  // 📦 Modal de confirmación de pedido
  const [pedidoConfirmacionOpen, setPedidoConfirmacionOpen] = useState(false);
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null);
  
  // Estado para "Ya estoy aquí"
  const [yaEstoyAquiModalOpen, setYaEstoyAquiModalOpen] = useState(false);
  const [turnoActivo, setTurnoActivo] = useState<{
    numero: string;
    personasEspera: number;
    tiempoEstimado: string;
  } | null>(null);
  const [turnoDetallesModalOpen, setTurnoDetallesModalOpen] = useState(false);

  // 📊 Obtener estadísticas reales de pedidos
  const pedidosCliente = obtenerPedidosCliente(user.id);
  const pedidosActivos = pedidosCliente.filter(p => 
    p.estado === 'pendiente' || p.estado === 'en_preparacion' || p.estado === 'listo'
  ).length;
  const pedidosCompletados = pedidosCliente.filter(p => p.estado === 'entregado').length;

  // Número de aseguradora (simulado - debería venir de la configuración del usuario)
  const [numeroAseguradora, setNumeroAseguradora] = useState<string | null>(null); // null = no configurado
  
  // Vehículos de ejemplo
  const vehiculos = [
    { id: '1', nombre: 'Ford Focus - ABC1234', activo: true },
    { id: '2', nombre: 'Volkswagen Golf - XYZ5678', activo: false },
  ];
  
  // Notificaciones no leídas
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(2);

  // Handler para Asistencia 24/7
  const handleAsistencia247 = () => {
    if (numeroAseguradora) {
      window.location.href = `tel:${numeroAseguradora}`;
      toast.info(`Llamando a ${numeroAseguradora}`);
    } else {
      setAsistenciaModalOpen(true);
    }
  };

  // Handler para "Ya estoy aquí"
  const handleYaEstoyAqui = () => {
    setYaEstoyAquiModalOpen(true);
  };

  // Handler para confirmar ubicación y asignar turno
  const handleConfirmarUbicacion = () => {
    const turno = {
      numero: 'A-24',
      personasEspera: 2,
      tiempoEstimado: '8 min'
    };
    
    setTurnoActivo(turno);
    toast.success(`¡Turno asignado! Tu turno es ${turno.numero}`);
    
    setTimeout(() => {
      toast.info('Tu turno se acerca. Prepárate para ser atendido.', {
        duration: 5000
      });
    }, 15000);
  };

  // Handler para ver detalles del turno
  const handleVerDetallesTurno = () => {
    setTurnoDetallesModalOpen(true);
  };

  // Handler para cuando se completa un pedido exitosamente
  const handlePedidoCompletado = (pedidoId: string, facturaId: string) => {
    const pedido = obtenerPedido(pedidoId);
    if (pedido) {
      setPedidoActual(pedido);
      setPedidoConfirmacionOpen(true);
    }
  };

  // Handler para cancelar turno
  const handleCancelarTurno = () => {
    setTurnoActivo(null);
    toast.success('Tu turno ha sido cancelado');
  };

  const menuItems: MenuItem[] = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: pedidosActivos > 0 ? pedidosActivos : undefined },
    { id: 'citas', label: 'Mis Citas', icon: Calendar, badge: citasProgramadas > 0 ? citasProgramadas : undefined },
    { id: 'cupones', label: 'Mis Cupones', icon: Ticket },
    { id: 'quienes-somos', label: '¿Quiénes somos?', icon: Info },
    { id: 'chat', label: 'Chat y Soporte', icon: MessageSquare },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, badge: notificacionesNoLeidas },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
    { 
      id: 'logout', 
      label: 'Salir', 
      icon: LogOut, 
      onClick: () => {
        toast.success('Cerrando sesión...');
        onLogout();
      }
    },
  ];

  // Bottom nav items para móvil (4 botones principales)
  const bottomNavItems: BottomNavItem[] = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: pedidosActivos > 0 ? pedidosActivos : undefined },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  // Items para el drawer móvil (TODAS las opciones incluyendo las del menú)
  const drawerItems: DrawerMenuItem[] = menuItems;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Cliente' },
    { label: getSectionLabel(activeSection) },
  ];

  function getSectionLabel(id: string): string {
    if (id === 'garaje') return 'Productos Disponibles';
    const item = menuItems.find(item => item.id === id);
    return item ? item.label : 'Inicio';
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return <InicioCliente onOpenCesta={() => setMiPedidoOpen(true)} onOpenNuevaCita={() => setSolicitudCitaModalOpen(true)} onYaEstoyAqui={handleYaEstoyAqui} />;
      case 'pedidos':
        return <MisPedidos clienteId={user.id} />;
      case 'citas':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MisCitas 
              clienteId={user.id} 
              onSolicitarCita={() => setSolicitudCitaModalOpen(true)} 
            />
          </Suspense>
        );
      case 'cupones':
        return <MisCupones clienteId={user.id} clienteNombre={user.name} clienteEmail={user.email} />;
      case 'quienes-somos':
        return <QuienesSomos />;
      case 'chat':
        return <ChatCliente clienteId={user.id} clienteNombre={user.name} />;
      case 'notificaciones':
        return <NotificationCenter usuarioId={user.id} onNavigate={(url) => console.log('Navigate to:', url)} />;
      case 'configuracion':
        return <ConfiguracionCliente 
          user={user} 
          onCambiarRol={onCambiarRol}
          onNavigateToChat={() => setActiveSection('chat')}
        />;
      default:
        return <InicioCliente onOpenCesta={() => setMiPedidoOpen(true)} onOpenNuevaCita={() => setSolicitudCitaModalOpen(true)} onYaEstoyAqui={handleYaEstoyAqui} />;
    }
  };

  const handleCitaCreada = () => {
    setCitasProgramadas(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black flex overflow-x-hidden">
      {/* Sidebar - Desktop & Tablet */}
      <Sidebar
        user={user}
        menuItems={menuItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        roleLabel="Cliente"
        avatarUrl="https://images.unsplash.com/photo-1531299983330-093763e1d963?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI2NzM4NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        primaryAction={
          <div className="space-y-3">
            <Button
              onClick={() => {
                toast.success('Abriendo catálogo para realizar pedido');
                setActiveSection('catalogo');
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 h-12 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Nuevo Pedido</span>
            </Button>
            <Button
              onClick={handleYaEstoyAqui}
              className="w-full bg-orange-600 hover:bg-orange-700 h-12 flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              <span>Ya estoy aquí</span>
            </Button>
          </div>
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        {/* Top Bar - Optimizado para móvil */}
        <div className="bg-black border-b border-gray-800 sticky top-0 z-10 shadow-lg"
          style={{
            boxShadow: '0 4px 6px -1px rgba(237, 28, 36, 0.2), 0 2px 4px -1px rgba(237, 28, 36, 0.1)'
          }}
        >
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            {/* Breadcrumb solo en desktop */}
            <div className="hidden md:block mb-3">
              <Breadcrumb items={breadcrumbs} />
            </div>
            
            {/* Header principal con info del usuario */}
            <div className="flex items-center justify-between gap-3">
              {/* Logo, Menú y Usuario - Móvil/Desktop */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Botón menú - Solo móvil */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden min-w-[44px] min-h-[44px] p-0 flex items-center justify-center text-white hover:text-[#ED1C24] hover:bg-white/10"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6" />
                </Button>
                
                {/* Logo - Solo visible en móvil */}
                <div className="md:hidden flex items-center gap-2">
                  <div 
                    className="px-3 py-1 rounded-lg flex items-center justify-center whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.2) 0%, rgba(237, 28, 36, 0.1) 100%)',
                      border: '1px solid rgba(237, 28, 36, 0.3)',
                      boxShadow: '0 0 15px rgba(237, 28, 36, 0.3)'
                    }}
                  >
                    <span 
                      className="tracking-widest whitespace-nowrap"
                      style={{
                        color: '#ED1C24',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        textShadow: '0 0 10px rgba(237, 28, 36, 0.5)',
                        letterSpacing: '0.12em'
                      }}
                    >
                      HOY PECAMOS
                    </span>
                  </div>
                </div>
                
                {/* Info Usuario - Desktop */}
                <div className="hidden md:flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1531299983330-093763e1d963?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjI2NzM4NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ED1C24]/30"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                    </div>
                    
                    {/* Nombre y Rol */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white text-sm font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {user.name}
                        </h3>
                        <Badge className="bg-[#ED1C24]/20 text-[#ED1C24] border-[#ED1C24]/30 text-xs px-2 py-0.5">
                          Cliente
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Separador */}
                  <div className="h-10 w-px bg-gray-800"></div>
                  
                  {/* Título de sección */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-white text-xl lg:text-2xl truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {getSectionLabel(activeSection)}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Acciones de la derecha */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Campana de notificaciones - Touch optimizado */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveSection('notificaciones')}
                  className="relative min-w-[44px] min-h-[44px] p-0 flex items-center justify-center text-white hover:text-[#ED1C24] hover:bg-white/10"
                >
                  <Bell className="w-5 h-5" />
                  {notificacionesNoLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ED1C24] text-white text-[10px] rounded-full flex items-center justify-center px-1 shadow-lg"
                      style={{ boxShadow: '0 0 10px rgba(237, 28, 36, 0.6)' }}
                    >
                      {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                    </span>
                  )}
                </Button>
                {/* Botón de Carrito - Touch optimizado */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMiPedidoOpen(true)}
                  className="relative min-w-[44px] min-h-[44px] p-0 flex items-center justify-center text-white hover:text-[#ED1C24] hover:bg-white/10"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemsEnCesta > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ED1C24] text-white text-[10px] rounded-full flex items-center justify-center px-1 shadow-lg"
                      style={{ boxShadow: '0 0 10px rgba(237, 28, 36, 0.6)' }}
                    >
                      {itemsEnCesta > 9 ? '9+' : itemsEnCesta}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="hidden lg:flex items-center gap-2 min-h-[44px] border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
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
          {/* Turno Banner - Se muestra en toda la app cuando hay turno activo */}
          {turnoActivo && (
            <Suspense fallback={<LoadingFallback />}>
              <TurnoBanner 
                turno={turnoActivo} 
                onVerDetalles={handleVerDetallesTurno}
              />
            </Suspense>
          )}

          {/* Section Content */}
          {renderContent()}
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
        userName={user.name}
      />

      {/* PASO 2: Mi Pedido - Líneas de pedido */}
      {miPedidoOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <MiPedido
            onCerrar={() => setMiPedidoOpen(false)}
            onProcederAlPago={() => {
              setMiPedidoOpen(false);
              setCestaOpen(true);
            }}
            onVolverACatalogo={() => {
              setMiPedidoOpen(false);
              setActiveSection('inicio'); // Volver a las 3 marcas
            }}
          />
        </Suspense>
      )}

      {/* PASO 3: Cesta Final - Resumen y venta cruzada */}
      <Suspense fallback={<LoadingFallback />}>
        <CestaOverlay
          isOpen={cestaOpen}
          onOpenChange={setCestaOpen}
          onProcederPago={handlePedidoCompletado}
          userData={{
            id: user.id,
            name: user.name,
            email: user.email,
            telefono: '+34 612 345 678', // Mock - en producción desde el perfil del usuario
          }}
        />
      </Suspense>

      {/* Solicitud Cita Modal */}
      <Suspense fallback={<LoadingFallback />}>
        <SolicitudCitaModal
          isOpen={solicitudCitaModalOpen}
          onOpenChange={setSolicitudCitaModalOpen}
          clienteId={user.id}
          clienteNombre={user.name}
          puntoVentaId="PDV-001" // TODO: Obtener del contexto/selección del usuario
        />
      </Suspense>

      {/* Asistencia Modal */}
      <Suspense fallback={<LoadingFallback />}>
        <AsistenciaModal
          isOpen={asistenciaModalOpen}
          onOpenChange={setAsistenciaModalOpen}
          numeroAseguradora={numeroAseguradora}
          onIrAPerfil={() => {
            setAsistenciaModalOpen(false);
            setActiveSection('configuracion');
          }}
        />
      </Suspense>

      {/* Ya estoy aquí Modal */}
      <Suspense fallback={<LoadingFallback />}>
        <YaEstoyAquiModal
          isOpen={yaEstoyAquiModalOpen}
          onOpenChange={setYaEstoyAquiModalOpen}
          onConfirmar={handleConfirmarUbicacion}
          userId={user.id}
          userName={user.name}
          userPhone={user.email}
        />
      </Suspense>

      {/* Turno Detalles Modal */}
      {turnoActivo && (
        <Suspense fallback={<LoadingFallback />}>
          <TurnoDetallesModal
            isOpen={turnoDetallesModalOpen}
            onOpenChange={setTurnoDetallesModalOpen}
            turno={turnoActivo}
            onCancelarTurno={handleCancelarTurno}
          />
        </Suspense>
      )}

      {/* Modal de confirmación de pedido */}
      <Suspense fallback={<LoadingFallback />}>
        <PedidoConfirmacionModal
          isOpen={pedidoConfirmacionOpen}
          onClose={() => setPedidoConfirmacionOpen(false)}
          pedido={pedidoActual}
        />
      </Suspense>
    </div>
  );
}