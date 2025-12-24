/**
 * ⌘ COMMAND PALETTE - Búsqueda Global y Navegación Rápida
 * Acceso rápido a cualquier función del sistema (Cmd+K / Ctrl+K)
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
  Search,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  Clock,
  TrendingUp,
  Building2,
  Wallet,
  Calculator,
  Home,
  ChevronRight,
  Command as CommandIcon,
  Hash,
  Calendar,
  Bell,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================
// TIPOS
// ============================================

export interface ComandoItem {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: CategoriaComando;
  icono: React.ReactNode;
  accion: () => void;
  keywords?: string[]; // Palabras clave para búsqueda
  atajo?: string; // Ej: "Cmd+N"
  url?: string; // Para navegación
}

export type CategoriaComando =
  | 'navegacion'
  | 'acciones'
  | 'busqueda'
  | 'configuracion'
  | 'ayuda';

// ============================================
// COMANDOS DISPONIBLES
// ============================================

const createComandos = (
  navigate: (path: string) => void,
  callbacks: {
    onNuevoCliente?: () => void;
    onNuevoPedido?: () => void;
    onNuevoProducto?: () => void;
    onExportar?: () => void;
    onConfiguracion?: () => void;
    onAyuda?: () => void;
    onCerrarSesion?: () => void;
  }
): ComandoItem[] => [
  // NAVEGACIÓN
  {
    id: 'nav-dashboard',
    titulo: 'Ir a Dashboard',
    descripcion: 'Vista general del negocio',
    categoria: 'navegacion',
    icono: <Home className="w-4 h-4" />,
    accion: () => navigate('/gerente/dashboard'),
    keywords: ['inicio', 'home', 'dashboard', 'principal'],
    url: '/gerente/dashboard'
  },
  {
    id: 'nav-clientes',
    titulo: 'Ir a Clientes',
    descripcion: 'Gestión de clientes',
    categoria: 'navegacion',
    icono: <Users className="w-4 h-4" />,
    accion: () => navigate('/gerente/clientes'),
    keywords: ['clientes', 'customers', 'crm'],
    url: '/gerente/clientes'
  },
  {
    id: 'nav-empleados',
    titulo: 'Ir a Equipo (RRHH)',
    descripcion: 'Gestión de empleados',
    categoria: 'navegacion',
    icono: <Users className="w-4 h-4" />,
    accion: () => navigate('/gerente/equipo'),
    keywords: ['empleados', 'equipo', 'rrhh', 'personal', 'trabajadores'],
    url: '/gerente/equipo'
  },
  {
    id: 'nav-stock',
    titulo: 'Ir a Stock',
    descripcion: 'Inventario y proveedores',
    categoria: 'navegacion',
    icono: <Package className="w-4 h-4" />,
    accion: () => navigate('/gerente/stock'),
    keywords: ['stock', 'inventario', 'almacen', 'productos', 'proveedores'],
    url: '/gerente/stock'
  },
  {
    id: 'nav-facturacion',
    titulo: 'Ir a Facturación',
    descripcion: 'Facturas y finanzas',
    categoria: 'navegacion',
    icono: <DollarSign className="w-4 h-4" />,
    accion: () => navigate('/gerente/facturacion'),
    keywords: ['facturacion', 'facturas', 'finanzas', 'dinero', 'pagos'],
    url: '/gerente/facturacion'
  },
  {
    id: 'nav-proveedores',
    titulo: 'Ir a Proveedores',
    descripcion: 'Gestión de proveedores',
    categoria: 'navegacion',
    icono: <Building2 className="w-4 h-4" />,
    accion: () => navigate('/gerente/proveedores'),
    keywords: ['proveedores', 'suppliers', 'compras'],
    url: '/gerente/proveedores'
  },
  {
    id: 'nav-productividad',
    titulo: 'Ir a Productividad',
    descripcion: 'Análisis de productividad',
    categoria: 'navegacion',
    icono: <TrendingUp className="w-4 h-4" />,
    accion: () => navigate('/gerente/productividad'),
    keywords: ['productividad', 'rendimiento', 'produccion'],
    url: '/gerente/productividad'
  },
  {
    id: 'nav-escandallo',
    titulo: 'Ir a Escandallo',
    descripcion: 'Costes de productos',
    categoria: 'navegacion',
    icono: <Calculator className="w-4 h-4" />,
    accion: () => navigate('/gerente/escandallo'),
    keywords: ['escandallo', 'costes', 'costos', 'recetas'],
    url: '/gerente/escandallo'
  },
  {
    id: 'nav-cuenta-resultados',
    titulo: 'Ir a Cuenta de Resultados',
    descripcion: 'P&L y análisis financiero',
    categoria: 'navegacion',
    icono: <Wallet className="w-4 h-4" />,
    accion: () => navigate('/gerente/cuenta-resultados'),
    keywords: ['cuenta', 'resultados', 'p&l', 'perdidas', 'ganancias', 'ebitda'],
    url: '/gerente/cuenta-resultados'
  },
  {
    id: 'nav-pedidos-trabajador',
    titulo: 'Ir a Pedidos (Trabajador)',
    descripcion: 'Gestión de pedidos',
    categoria: 'navegacion',
    icono: <ShoppingCart className="w-4 h-4" />,
    accion: () => navigate('/trabajador/pedidos'),
    keywords: ['pedidos', 'orders', 'trabajador'],
    url: '/trabajador/pedidos'
  },

  // ACCIONES RÁPIDAS
  {
    id: 'action-nuevo-cliente',
    titulo: 'Crear Nuevo Cliente',
    descripcion: 'Agregar cliente al sistema',
    categoria: 'acciones',
    icono: <Users className="w-4 h-4" />,
    accion: () => callbacks.onNuevoCliente?.(),
    keywords: ['nuevo', 'crear', 'cliente', 'add'],
    atajo: 'Cmd+Shift+C'
  },
  {
    id: 'action-nuevo-pedido',
    titulo: 'Crear Nuevo Pedido',
    descripcion: 'Registrar un pedido',
    categoria: 'acciones',
    icono: <ShoppingCart className="w-4 h-4" />,
    accion: () => callbacks.onNuevoPedido?.(),
    keywords: ['nuevo', 'crear', 'pedido', 'order'],
    atajo: 'Cmd+Shift+P'
  },
  {
    id: 'action-nuevo-producto',
    titulo: 'Crear Nuevo Producto',
    descripcion: 'Agregar producto al catálogo',
    categoria: 'acciones',
    icono: <Package className="w-4 h-4" />,
    accion: () => callbacks.onNuevoProducto?.(),
    keywords: ['nuevo', 'crear', 'producto', 'sku'],
    atajo: 'Cmd+Shift+N'
  },
  {
    id: 'action-exportar',
    titulo: 'Exportar Datos',
    descripcion: 'Exportar datos actuales',
    categoria: 'acciones',
    icono: <FileText className="w-4 h-4" />,
    accion: () => callbacks.onExportar?.(),
    keywords: ['exportar', 'descargar', 'csv', 'excel'],
    atajo: 'Cmd+E'
  },

  // BÚSQUEDA
  {
    id: 'search-clientes',
    titulo: 'Buscar Cliente',
    descripcion: 'Buscar en base de clientes',
    categoria: 'busqueda',
    icono: <Search className="w-4 h-4" />,
    accion: () => navigate('/gerente/clientes'),
    keywords: ['buscar', 'cliente', 'search']
  },
  {
    id: 'search-productos',
    titulo: 'Buscar Producto',
    descripcion: 'Buscar en catálogo de productos',
    categoria: 'busqueda',
    icono: <Search className="w-4 h-4" />,
    accion: () => navigate('/gerente/stock'),
    keywords: ['buscar', 'producto', 'sku', 'search']
  },
  {
    id: 'search-pedidos',
    titulo: 'Buscar Pedido',
    descripcion: 'Buscar pedidos por número',
    categoria: 'busqueda',
    icono: <Search className="w-4 h-4" />,
    accion: () => navigate('/trabajador/pedidos'),
    keywords: ['buscar', 'pedido', 'order', 'search']
  },

  // CONFIGURACIÓN
  {
    id: 'config-empresa',
    titulo: 'Configuración de Empresa',
    descripcion: 'Ajustes generales',
    categoria: 'configuracion',
    icono: <Settings className="w-4 h-4" />,
    accion: () => callbacks.onConfiguracion?.(),
    keywords: ['configuracion', 'settings', 'ajustes', 'empresa']
  },
  {
    id: 'config-perfil',
    titulo: 'Mi Perfil',
    descripcion: 'Configuración personal',
    categoria: 'configuracion',
    icono: <User className="w-4 h-4" />,
    accion: () => navigate('/perfil'),
    keywords: ['perfil', 'profile', 'usuario', 'cuenta']
  },
  {
    id: 'config-notificaciones',
    titulo: 'Notificaciones',
    descripcion: 'Gestionar notificaciones',
    categoria: 'configuracion',
    icono: <Bell className="w-4 h-4" />,
    accion: () => navigate('/notificaciones'),
    keywords: ['notificaciones', 'alerts', 'avisos']
  },

  // AYUDA
  {
    id: 'help-docs',
    titulo: 'Documentación',
    descripcion: 'Ver guías y tutoriales',
    categoria: 'ayuda',
    icono: <HelpCircle className="w-4 h-4" />,
    accion: () => callbacks.onAyuda?.(),
    keywords: ['ayuda', 'help', 'documentacion', 'docs', 'guia']
  },
  {
    id: 'help-shortcuts',
    titulo: 'Atajos de Teclado',
    descripcion: 'Ver todos los atajos',
    categoria: 'ayuda',
    icono: <CommandIcon className="w-4 h-4" />,
    accion: () => {},
    keywords: ['atajos', 'shortcuts', 'keyboard', 'teclado'],
    atajo: '?'
  },

  // SESIÓN
  {
    id: 'session-logout',
    titulo: 'Cerrar Sesión',
    descripcion: 'Salir de la aplicación',
    categoria: 'configuracion',
    icono: <LogOut className="w-4 h-4" />,
    accion: () => callbacks.onCerrarSesion?.(),
    keywords: ['cerrar', 'salir', 'logout', 'sesion']
  }
];

// ============================================
// CATEGORÍAS
// ============================================

const CATEGORIAS_INFO: Record<CategoriaComando, { titulo: string; color: string }> = {
  navegacion: { titulo: 'Navegación', color: 'text-blue-600' },
  acciones: { titulo: 'Acciones Rápidas', color: 'text-teal-600' },
  busqueda: { titulo: 'Búsqueda', color: 'text-purple-600' },
  configuracion: { titulo: 'Configuración', color: 'text-gray-600' },
  ayuda: { titulo: 'Ayuda', color: 'text-amber-600' }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface CommandPaletteProps {
  navigate: (path: string) => void;
  callbacks?: {
    onNuevoCliente?: () => void;
    onNuevoPedido?: () => void;
    onNuevoProducto?: () => void;
    onExportar?: () => void;
    onConfiguracion?: () => void;
    onAyuda?: () => void;
    onCerrarSesion?: () => void;
  };
}

export const CommandPalette = ({ navigate, callbacks = {} }: CommandPaletteProps) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(0);

  // Crear comandos
  const comandos = useMemo(
    () => createComandos(navigate, callbacks),
    [navigate, callbacks]
  );

  // Filtrar comandos según búsqueda
  const comandosFiltrados = useMemo(() => {
    if (!busqueda) return comandos;

    const busquedaLower = busqueda.toLowerCase();

    return comandos.filter(comando => {
      // Buscar en título
      if (comando.titulo.toLowerCase().includes(busquedaLower)) return true;
      
      // Buscar en descripción
      if (comando.descripcion?.toLowerCase().includes(busquedaLower)) return true;
      
      // Buscar en keywords
      if (comando.keywords?.some(k => k.includes(busquedaLower))) return true;
      
      return false;
    });
  }, [busqueda, comandos]);

  // Agrupar por categoría
  const comandosAgrupados = useMemo(() => {
    const grupos: Record<CategoriaComando, ComandoItem[]> = {
      navegacion: [],
      acciones: [],
      busqueda: [],
      configuracion: [],
      ayuda: []
    };

    comandosFiltrados.forEach(comando => {
      grupos[comando.categoria].push(comando);
    });

    return grupos;
  }, [comandosFiltrados]);

  // Shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setAbierto(prev => !prev);
      }

      // Escape para cerrar
      if (e.key === 'Escape' && abierto) {
        setAbierto(false);
      }

      // Navegar con flechas
      if (abierto) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSeleccionado(prev => 
            prev < comandosFiltrados.length - 1 ? prev + 1 : prev
          );
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSeleccionado(prev => prev > 0 ? prev - 1 : 0);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (comandosFiltrados[seleccionado]) {
            ejecutarComando(comandosFiltrados[seleccionado]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, comandosFiltrados, seleccionado]);

  // Resetear al abrir
  useEffect(() => {
    if (abierto) {
      setBusqueda('');
      setSeleccionado(0);
    }
  }, [abierto]);

  const ejecutarComando = (comando: ComandoItem) => {
    comando.accion();
    setAbierto(false);
  };

  return (
    <>
      {/* Botón para abrir (opcional) */}
      <button
        onClick={() => setAbierto(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Buscar...</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-white border border-gray-300 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Dialog */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="p-0 max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Buscador */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar comandos, páginas, acciones..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setSeleccionado(0);
              }}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              autoFocus
            />
            <kbd className="hidden sm:block px-2 py-1 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded">
              ESC
            </kbd>
          </div>

          {/* Resultados */}
          <div className="overflow-y-auto max-h-96 p-2">
            {comandosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No se encontraron resultados para "{busqueda}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(comandosAgrupados).map(([categoria, items]) => {
                  if (items.length === 0) return null;

                  const info = CATEGORIAS_INFO[categoria as CategoriaComando];

                  return (
                    <div key={categoria}>
                      <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase">
                        {info.titulo}
                      </div>
                      <div className="space-y-1">
                        {items.map((comando, index) => {
                          const globalIndex = comandosFiltrados.indexOf(comando);
                          const isSelected = globalIndex === seleccionado;

                          return (
                            <button
                              key={comando.id}
                              onClick={() => ejecutarComando(comando)}
                              onMouseEnter={() => setSeleccionado(globalIndex)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                                isSelected
                                  ? 'bg-teal-50 border border-teal-200'
                                  : 'hover:bg-gray-50'
                              )}
                            >
                              <div className={cn(
                                'flex items-center justify-center w-8 h-8 rounded-lg',
                                isSelected ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-600'
                              )}>
                                {comando.icono}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900">
                                  {comando.titulo}
                                </div>
                                {comando.descripcion && (
                                  <div className="text-xs text-gray-500 truncate">
                                    {comando.descripcion}
                                  </div>
                                )}
                              </div>

                              {comando.atajo && (
                                <kbd className="hidden sm:block px-2 py-1 text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded">
                                  {comando.atajo}
                                </kbd>
                              )}

                              {isSelected && (
                                <ChevronRight className="w-4 h-4 text-teal-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer con ayuda */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
                  <span className="ml-1">para navegar</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↵</kbd>
                  <span className="ml-1">para seleccionar</span>
                </span>
              </div>
              <span>{comandosFiltrados.length} resultados</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommandPalette;
