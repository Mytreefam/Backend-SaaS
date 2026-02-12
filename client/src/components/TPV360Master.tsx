import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ShoppingCart, 
  Clock, 
  ListChecks, 
  Settings,
  DollarSign,
  BarChart3,
  Plus,
  Search,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Calculator,
  Check,
  X,
  Printer,
  User,
  Phone,
  Lock,
  Unlock,
  Package,
  AlertCircle,
  Store,
  Tag,
  Percent,
  Gift,
  Sparkles,
  ChevronRight,
  Info,
  Zap,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useProductos } from '../contexts/ProductosContext';
import { pedidosApi, type Pedido as PedidoBackend } from '../services/api/pedidos.api';
import { integracionesApi } from '../services/api/integraciones.api';

// Importar componentes modulares
import { ModalOperacionesTPV } from './ModalOperacionesTPV';
import { ModalPagoMixto } from './ModalPagoMixto';
import { ModalAperturaCaja } from './ModalAperturaCaja';
import { ModalArqueoCaja } from './ModalArqueoCaja';
import { ModalCierreCaja } from './ModalCierreCaja';
import { ModalRetiradaCaja } from './ModalRetiradaCaja';
import { ModalConsumoPropio } from './ModalConsumoPropio';
import { ModalDevolucionTicket } from './ModalDevolucionTicket';
import { CajaRapidaMejorada } from './CajaRapidaMejorada';
import { TicketCocinaV2 } from './TicketCocinaV2';
import { PanelOperativaAvanzado } from './PanelOperativaAvanzado';
import { ConfiguracionImpresoras } from './ConfiguracionImpresoras';
import PanelCaja from './PanelCaja';
import { GestionTurnos } from './GestionTurnos';
import { PanelEstadosPedidos } from './PanelEstadosPedidos';
import { ProductoPersonalizacionModal } from './ProductoPersonalizacionModal';
import { usePromocionesTPV } from '../hooks/usePromociones';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { PromocionDisponible } from '../data/promociones-disponibles';
import type { ItemCarrito as ItemCarritoServicio } from '../services/promociones.service';
import { gerenteConfigApi } from '../services/api';
import { useGerenteEmpresasConfig } from '../hooks/useGerenteEmpresasConfig';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import type { OperacionCaja, EstadoCaja, TipoOperacionCaja } from '../types/operaciones-caja';
import { generarOperacionId, emitirOperacionCaja } from '../types/operaciones-caja';

// ============================================
// INTERFACES Y TIPOS
// ============================================

export interface PermisosTPV {
  cobrar_pedidos: boolean;
  marcar_como_listo: boolean;
  gestionar_caja_rapida: boolean;
  hacer_retiradas: boolean;
  arqueo_caja: boolean;
  cierre_caja: boolean;
  ver_informes_turno: boolean;
  acceso_operativa: boolean;
  reimprimir_tickets: boolean;
}

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagen?: string;
  marcas_ids?: string[]; // ⭐ Marcas donde está disponible
  activo?: boolean; // ⭐ Si está activo para venta
  visible_tpv?: boolean; // ⭐ Si es visible en TPV
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
  promocionAplicada?: PromocionDisponible;
  descuento?: number;
  subtotalConDescuento?: number;
  // 🎯 NUEVO: Opciones personalizadas (combos, pizzas, etc.)
  opcionesPersonalizadas?: Array<{
    grupoId: string;
    grupoTitulo: string;
    opciones: Array<{
      opcionId: string;
      nombre: string;
      precioAdicional: number;
    }>;
  }>;
}

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
}

export interface Pedido {
  id: string;
  codigo: string; // P001-P999
  cliente: Cliente;
  items: ItemCarrito[];
  total: number;
  totalSinDescuento?: number;
  totalDescuento?: number;
  promocionesAplicadas?: PromocionDisponible[];
  estado: 'en_preparacion' | 'listo' | 'entregado' | 'cancelado' | 'devuelto';
  origenPedido: 'presencial' | 'app' | 'web' | string;
  metodoPago?: 'efectivo' | 'tarjeta' | 'mixto' | 'online';
  pagado: boolean;
  fechaCreacion: Date;
  geolocalizacionValidada?: boolean;
  fechaGeolocalizacion?: string;
  motivoCancelacion?: string;
  motivoDevolucion?: string;
  // Multicanal fields for filtering and display
  empresa?: string;
  marca?: string;
  pdv?: string;
}

interface TPV360MasterProps {
  permisos: PermisosTPV;
  nombreUsuario: string;
  rolUsuario?: string;
  puntoVentaId: string;
  tpvId?: string;
  marcaActiva?: string; // Marca/punto de venta actualmente seleccionado
  marcasDisponibles?: string[]; // Marcas disponibles en este terminal
  onCerrarCaja?: () => void;
  onSolicitarSeleccionTPV?: () => void;
  onCambiarMarca?: (marcaId: string) => void; // Callback para cambiar de marca
}

// ============================================
// HELPER: IMÁGENES POR CATEGORÍA
// ============================================

const getImagenPorCategoria = (categoria: string): string => {
  const imagenesCategoria: Record<string, string> = {
    'Pan básico': 'https://images.unsplash.com/photo-1568471382005-99e347e2aef0?w=600',
    'Pan de masa madre': 'https://images.unsplash.com/photo-1610307522769-f923139bac30?w=600',
    'Bollería simple': 'https://images.unsplash.com/photo-1568471382005-99e347e2aef0?w=600',
    'Bollería especial': 'https://images.unsplash.com/photo-1712723247649-35dda2670f1c?w=600',
    'Pasteles individuales': 'https://images.unsplash.com/photo-1602630209855-dceac223adfe?w=600',
    'Tartas': 'https://images.unsplash.com/photo-1602630209855-dceac223adfe?w=600',
    'Bocadillos': 'https://images.unsplash.com/photo-1763647814142-b1eb054d42f1?w=600',
    'Hamburguesas': 'https://images.unsplash.com/photo-1764471443859-a997da49b4d0?w=600',
    'Empanadas': 'https://images.unsplash.com/photo-1646314230198-e27c375e1a2a?w=600',
    'Bebidas calientes': 'https://images.unsplash.com/photo-1705952285570-113e76f63fb0?w=600',
    'Bebidas frías': 'https://images.unsplash.com/photo-1640349457292-3bee29b905fe?w=600',
    'Combos': 'https://images.unsplash.com/photo-1729376161051-f5a7a38d5f2d?w=600',
    'Otros': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'
  };
  
  return imagenesCategoria[categoria] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600';
};

// ============================================
// COMPONENTE MAESTRO TPV 360
// ============================================

export function TPV360Master({ 
  permisos, 
  nombreUsuario, 
  rolUsuario = 'Trabajador',
  puntoVentaId,
  tpvId,
  marcaActiva,
  marcasDisponibles = [],
  onCerrarCaja,
  onSolicitarSeleccionTPV,
  onCambiarMarca
}: TPV360MasterProps) {
  
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  
  const [vistaActiva, setVistaActiva] = useState<'tpv' | 'caja-rapida' | 'turnos' | 'estados' | 'operativa' | 'impresoras' | 'caja' | 'informes'>('tpv');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  
  // 🎯 NUEVO: Hook de promociones del servicio centralizado
  const { 
    promocionesDisponibles, 
    aplicarDescuentosAutomaticos,
    obtenerPromocionesHorario 
  } = usePromocionesTPV();
  
  // 🛍️ Hook de productos centralizados
  const { productos: productosContext, categorias: categoriasContext } = useProductos();

  // Config real Empresa/Marca/PDV (sin constants/empresaConfig)
  const { getNombreMarca } = useGerenteEmpresasConfig();
  const [empresasConfig, setEmpresasConfig] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await gerenteConfigApi.empresas.list();
        if (cancelled) return;
        setEmpresasConfig(Array.isArray(list) ? list : []);
      } catch {
        if (cancelled) return;
        setEmpresasConfig([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const marcaById = useMemo(() => {
    const m = new Map<string, any>();
    for (const e of empresasConfig || []) {
      const marcas = Array.isArray((e as any)?.marcas) ? (e as any).marcas : [];
      for (const marca of marcas) {
        const id = String(marca?.id || '').trim();
        if (!id) continue;
        m.set(id, marca);
      }
    }
    return m;
  }, [empresasConfig]);

  const pdvById = useMemo(() => {
    const m = new Map<string, any>();
    for (const e of empresasConfig || []) {
      const pdvs = Array.isArray((e as any)?.puntosVenta) ? (e as any).puntosVenta : [];
      for (const pv of pdvs) {
        const id = String(pv?.id || '').trim();
        if (!id) continue;
        m.set(id, pv);
      }
    }
    return m;
  }, [empresasConfig]);

  const empresaById = useMemo(() => {
    const m = new Map<string, any>();
    for (const e of empresasConfig || []) {
      const id = String((e as any)?.id || '').trim();
      if (!id) continue;
      m.set(id, e);
    }
    return m;
  }, [empresasConfig]);
  
  // Estados de promociones
  const [promocionesAplicadasActuales, setPromocionesAplicadasActuales] = useState<PromocionDisponible[]>([]);
  const [descuentoTotalAplicado, setDescuentoTotalAplicado] = useState(0);
  
  // Estados de modales
  const [showPagoDialog, setShowPagoDialog] = useState(false);
  const [showPagoMixto, setShowPagoMixto] = useState(false);
  const [showModalOperaciones, setShowModalOperaciones] = useState(false);
  const [showModalApertura, setShowModalApertura] = useState(false);
  const [showModalArqueo, setShowModalArqueo] = useState(false);
  const [showModalCierre, setShowModalCierre] = useState(false);
  const [showModalRetirada, setShowModalRetirada] = useState(false);
  const [showModalConsumoPropio, setShowModalConsumoPropio] = useState(false);
  const [showModalDevolucion, setShowModalDevolucion] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [pedidoPagado, setPedidoPagado] = useState(false);
  const [productoPersonalizable, setProductoPersonalizable] = useState<Producto | null>(null); // 🎯 Modal personalización
  const [showPersonalizacion, setShowPersonalizacion] = useState(false);
  
  // Estados de caja
  const [estadoCaja, setEstadoCaja] = useState<EstadoCaja>({
    caja_abierta: false,
    ultima_apertura: null,
    ultimo_cierre: null,
    ultimo_arqueo: null,
    saldo_actual_teorico: 0,
    saldo_actual_real: 0,
    diferencia_acumulada: 0,
    operaciones_del_turno: [],
    requiere_atencion: false
  });
  const [turnoAbierto, setTurnoAbierto] = useState(false); // Estado de caja
  
  // Estados de pago
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'mixto' | 'online' | null>(null);
  const [montoPagado, setMontoPagado] = useState('');
  
  // Estados de clientes y pedidos
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [pedidoIniciado, setPedidoIniciado] = useState(false);
  const [turnoAsignado, setTurnoAsignado] = useState<string | null>(null);
  
  // Estado para carrito flotante móvil
  const [carritoMovilAbierto, setCarritoMovilAbierto] = useState(false);
  const [contadorTurnos, setContadorTurnos] = useState(1);
  
  // Estado para PDV efectivo (puede venir de props o del fichaje)
  const [pdvEfectivo, setPdvEfectivo] = useState<{id: string, nombre: string} | null>(null);
  
  // ⭐ ESTADOS DE EMPRESA Y MARCA
  const [empresaActiva, setEmpresaActiva] = useState<string>('EMP-001'); // ✅ Disarmink
  const [marcaActivaLocal, setMarcaActivaLocal] = useState<string>(marcaActiva || 'MRC-001'); // ✅ Modomio por defecto
  const [marcasDisponiblesLocal, setMarcasDisponiblesLocal] = useState<string[]>(marcasDisponibles);
  
  // Estados de pedidos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('');
  const [filtroMarca, setFiltroMarca] = useState<string>('');
  const [filtroPDV, setFiltroPDV] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroOrigen, setFiltroOrigen] = useState<string>('');
  const [filtroBusqueda, setFiltroBusqueda] = useState<string>('');

  // Cargar pedidos multicanal reales (internos y externos)
  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const pedidosInternosRaw = await pedidosApi.getAll();
        const pedidosInternos: Pedido[] = pedidosInternosRaw.map((p: PedidoBackend) => {
          const fecha = p.fecha ? new Date(p.fecha) : new Date();
          const year = fecha.getFullYear();
          const codigo = `${year}-${String(p.id).padStart(6, '0')}`;
          const clienteNombre = p.cliente?.nombre || 'Cliente';
          const clienteTelefono = p.cliente?.telefono || '';
          const clienteEmail = p.cliente?.email || '';

          const items: any[] = (p.items || []).map((it) => {
            const prod = it.producto;
            const precio = typeof prod?.precio === 'number' ? prod.precio : it.precio;
            return {
              producto: {
                id: String(prod?.id ?? it.productoId),
                nombre: prod?.nombre || `Producto ${it.productoId}`,
                precio,
                categoria: '',
                stock: 0,
                activo: true,
                visible_tpv: true,
                descripcion: prod?.descripcion,
                imagen: prod?.imagen,
              },
              cantidad: it.cantidad,
              subtotal: precio * it.cantidad,
            };
          });

          const metodoPago = (p.metodoPago as any) || undefined;
          const pagado = metodoPago !== 'efectivo' || p.estado !== 'pendiente';

          return {
            id: String(p.id),
            codigo,
            cliente: {
              id: String(p.cliente?.id ?? p.clienteId),
              nombre: clienteNombre,
              telefono: clienteTelefono,
              email: clienteEmail || undefined,
            },
            items,
            total: p.total,
            estado: (p.estado as any) || 'pendiente',
            origenPedido: 'app',
            metodoPago,
            pagado,
            fechaCreacion: fecha,
          } as Pedido;
        });
        const pedidosExternos = await integracionesApi.getPedidosExternos();
        const pedidosExternosAdaptados = pedidosExternos.map((p: any) => ({
          ...p,
          id: p.pedidoExternoId || p.id,
          codigo: p.codigo || p.pedidoExternoId || p.id,
          cliente: p.cliente || { id: '', nombre: p.nombreCliente || '', telefono: p.telefonoCliente || '' },
          items: p.items || [],
          total: p.total || 0,
          estado: p.estado || 'en_preparacion',
          origenPedido: p.origen || p.plataforma || 'externo',
          metodoPago: p.metodoPago || undefined,
          pagado: p.pagado || false,
          fechaCreacion: p.fechaPedido ? new Date(p.fechaPedido) : new Date(),
          empresa: p.empresa || '',
          marca: p.marca || '',
          pdv: p.pdv || '',
        }));
        setPedidos([
          ...pedidosInternos,
          ...pedidosExternosAdaptados
        ]);
      } catch (error) {
        toast.error('Error al cargar pedidos multicanal');
      }
    };
    cargarPedidos();
  }, []);

  // Filtros multicanal
  useEffect(() => {
    let filtrados = [...pedidos];
    if (filtroEmpresa) filtrados = filtrados.filter(p => (p.empresa || '').toLowerCase().includes(filtroEmpresa.toLowerCase()));
    if (filtroMarca) filtrados = filtrados.filter(p => (p.marca || '').toLowerCase().includes(filtroMarca.toLowerCase()));
    if (filtroPDV) filtrados = filtrados.filter(p => (p.pdv || '').toLowerCase().includes(filtroPDV.toLowerCase()));
    if (filtroEstado) filtrados = filtrados.filter(p => (p.estado || '').toLowerCase() === filtroEstado.toLowerCase());
    if (filtroOrigen) filtrados = filtrados.filter(p => (p.origenPedido || '').toLowerCase() === filtroOrigen.toLowerCase());
    if (filtroBusqueda) {
      const q = filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        (p.codigo && p.codigo.toLowerCase().includes(q)) ||
        (p.cliente && (
          (p.cliente.nombre && p.cliente.nombre.toLowerCase().includes(q)) ||
          (p.cliente.telefono && p.cliente.telefono.toLowerCase().includes(q))
        ))
      );
    }
    setPedidosFiltrados(filtrados);
  }, [pedidos, filtroEmpresa, filtroMarca, filtroPDV, filtroEstado, filtroOrigen, filtroBusqueda]);

  // ⭐ Usamos productos del contexto en lugar de mock local
  const productos = productosContext;

  // ============================================
  // FUNCIONES DE PROMOCIONES
  // ============================================
  
  // ✨ Función helper para determinar si un producto tiene promoción activa
  const verificarPromocionProducto = useCallback((producto: Producto): { 
    tienePromo: boolean; 
    promocion?: PromocionDisponible;
    precioConDescuento?: number;
  } => {
    // Buscar si hay alguna promoción que aplique a este producto
    const promoAplicable = promocionesDisponibles.find(promo => {
      if (!promo.activa) return false;
      
      // Verificar si la promo es para este producto específico
      if (promo.productoIdAplicable === producto.id) return true;
      
      // Verificar si la promo es para la categoría del producto
      if (promo.categoriaAplicable === producto.categoria) return true;
      
      // Verificar si el producto está en un combo
      if (promo.tipo === 'combo_pack' && promo.productosIncluidos) {
        return promo.productosIncluidos.some(p => p.id === producto.id);
      }
      
      return false;
    });
    
    if (!promoAplicable) {
      return { tienePromo: false };
    }
    
    // Calcular precio con descuento
    let precioConDescuento = producto.precio;
    
    if (promoAplicable.tipo === 'descuento_porcentaje') {
      precioConDescuento = producto.precio * (1 - promoAplicable.valor / 100);
    } else if (promoAplicable.tipo === 'descuento_fijo') {
      precioConDescuento = Math.max(0, producto.precio - promoAplicable.valor);
    } else if (promoAplicable.tipo === 'combo_pack' && promoAplicable.precioCombo) {
      // Para combos, mostrar el precio del combo dividido entre productos
      const numProductos = promoAplicable.productosIncluidos?.length || 1;
      precioConDescuento = promoAplicable.precioCombo / numProductos;
    }
    
    return {
      tienePromo: true,
      promocion: promoAplicable,
      precioConDescuento
    };
  }, [promocionesDisponibles]);

  // ⭐ Categorías dinámicas del contexto + 'todos' y 'promociones'
  const categorias = useMemo(() => ['todos', 'promociones', ...categoriasContext], [categoriasContext]);

  // ⭐ FILTRADO POR MARCA, CATEGORÍA Y BÚSQUEDA (incluye filtro de promociones)
  const productosFiltrados = productos.filter(producto => {
    const matchBusqueda = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Si la categoría es 'promociones', solo mostrar productos con promoción activa
    let matchCategoria = true;
    if (categoriaActiva === 'promociones') {
      const tienePromocion = verificarPromocionProducto(producto).tienePromo;
      matchCategoria = tienePromocion;
    } else {
      matchCategoria = categoriaActiva === 'todos' || producto.categoria === categoriaActiva;
    }
    
    const matchMarca = !producto.marcas_ids || producto.marcas_ids.includes(marcaActivaLocal);
    const esActivo = producto.activo !== false;
    const esVisibleTPV = producto.visible_tpv !== false;
    
    return matchBusqueda && matchCategoria && matchMarca && esActivo && esVisibleTPV;
  });

  // Contador de productos por marca
  const contadorProductosMarca = useMemo(() => {
    return productos.filter(p => 
      (!p.marcas_ids || p.marcas_ids.includes(marcaActivaLocal)) && 
      p.activo !== false && 
      p.visible_tpv !== false
    ).length;
  }, [productos, marcaActivaLocal]);

  // ============================================
  // EFECTOS
  // ============================================

  // Sincronizar PDV efectivo desde props o fichaje
  useEffect(() => {
    const sincronizarPDV = () => {
      // Primero intentar usar el prop puntoVentaId
      if (puntoVentaId) {
        console.log('[TPV] Usando PDV de props:', puntoVentaId);
        setPdvEfectivo({ id: puntoVentaId, nombre: puntoVentaId });
        return;
      }

      // Si no hay prop, intentar obtener del fichaje activo
      try {
        const fichajeGuardado = localStorage.getItem('fichaje_activo');
        if (fichajeGuardado) {
          const fichaje = JSON.parse(fichajeGuardado);
          if (fichaje.puntoVentaId && fichaje.puntoVentaNombre) {
            console.log('[TPV] Usando PDV del fichaje:', fichaje.puntoVentaId, fichaje.puntoVentaNombre);
            setPdvEfectivo({
              id: fichaje.puntoVentaId,
              nombre: fichaje.puntoVentaNombre
            });
            return;
          }
        }
      } catch (error) {
        console.error('[TPV] Error al obtener PDV del fichaje:', error);
      }

      // Si no hay ninguno, limpiar
      console.log('[TPV] No hay PDV disponible');
      setPdvEfectivo(null);
    };

    sincronizarPDV();

    // Intervalo para sincronizar periódicamente
    const interval = setInterval(sincronizarPDV, 2000);

    return () => clearInterval(interval);
  }, [puntoVentaId]);

  // ✅ Las promociones se cargan automáticamente a través del hook usePromocionesTPV
  // con autoRefresh: true, por lo que no necesitamos un useEffect manual aquí

  // Sincronizar e inicializar marcas disponibles
  useEffect(() => {
    // Si se pasan marcas desde props, usarlas
    if (marcasDisponibles && marcasDisponibles.length > 0) {
      setMarcasDisponiblesLocal(marcasDisponibles);
      return;
    }

    // Si no hay marcas, inicializar con marcas por defecto
    // Si hay TPV definido, usar su configuración; si no, mostrar todas por defecto
    const esPrimerTerminal = !tpvId || tpvId.includes('TPV1') || tpvId.includes('TPV-1');
    const marcasDefault = esPrimerTerminal ? ['MRC-001', 'MRC-002'] : ['MRC-001'];
    setMarcasDisponiblesLocal(marcasDefault);
    console.log('[TPV] Marcas inicializadas por defecto:', marcasDefault);
  }, [marcasDisponibles, tpvId]);

  // Sincronizar marca activa desde props
  useEffect(() => {
    if (marcaActiva) {
      setMarcaActivaLocal(marcaActiva);
    }
  }, [marcaActiva]);

  // ============================================
  // FUNCIONES DE CARRITO
  // ============================================

  const agregarAlCarrito = (producto: Producto) => {
    // ✅ Validar que la caja esté abierta antes de añadir productos
    if (!estadoCaja.caja_abierta) {
      toast.error('No se pueden añadir productos', {
        description: 'Debes abrir la caja antes de realizar ventas'
      });
      return;
    }
    
    // 🎯 NUEVO: Si el producto tiene opciones personalizables, abrir modal
    if (producto.gruposOpciones && producto.gruposOpciones.length > 0) {
      setProductoPersonalizable(producto);
      setShowPersonalizacion(true);
      return;
    }
    
    const itemExistente = carrito.find(item => item.producto.id === producto.id);
    const nuevaCantidad = itemExistente ? itemExistente.cantidad + 1 : 1;
    
    // ⭐ VALIDAR STOCK DISPONIBLE
    if (!verificarStockDisponible(producto.id, nuevaCantidad)) {
      toast.error(`Sin stock suficiente de ${producto.nombre}`, {
        description: `Stock disponible: ${producto.stock} unidades`
      });
      return;
    }
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.producto.id === producto.id
          ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * producto.precio }
          : item
      ));
    } else {
      setCarrito([...carrito, { producto, cantidad: 1, subtotal: producto.precio }]);
    }
    
    toast.success(`${producto.nombre} añadido`);
  };

  // 🎯 NUEVO: Manejar productos personalizados desde el modal
  const handleAgregarPersonalizado = (
    producto: Producto,
    opcionesEstructuradas: Array<{
      grupoId: string;
      grupoTitulo: string;
      opciones: Array<{
        opcionId: string;
        nombre: string;
        precioAdicional: number;
      }>;
    }>,
    cantidad: number
  ) => {
    // ✅ CALCULAR subtotal incluyendo precio base + extras
    let precioUnitario = producto.precio;
    opcionesEstructuradas.forEach(grupo => {
      grupo.opciones.forEach(opcion => {
        precioUnitario += opcion.precioAdicional;
      });
    });
    
    const subtotal = precioUnitario * cantidad;
    
    // ✅ GUARDAR las opciones en el carrito con toda la información
    const itemExistente = carrito.find(item => 
      item.producto.id === producto.id &&
      JSON.stringify(item.opcionesPersonalizadas) === JSON.stringify(opcionesEstructuradas)
    );
    
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      setCarrito(carrito.map(item =>
        item === itemExistente
          ? { ...item, cantidad: nuevaCantidad, subtotal: precioUnitario * nuevaCantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto,
        cantidad,
        subtotal,
        opcionesPersonalizadas: opcionesEstructuradas // ✅ GUARDAR OPCIONES
      }]);
    }
    
    toast.success(`${producto.nombre} personalizado añadido (${cantidad}x)`);
  };

  const modificarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    // ⭐ VALIDAR STOCK DISPONIBLE
    if (!verificarStockDisponible(productoId, nuevaCantidad)) {
      const producto = productos.find(p => p.id === productoId);
      toast.error(`Sin stock suficiente`, {
        description: producto ? `Stock disponible: ${producto.stock} unidades` : ''
      });
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.producto.id === productoId
        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.producto.precio }
        : item
    ));
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter(item => item.producto.id !== productoId));
    toast.info('Producto eliminado');
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setClienteSeleccionado(null);
    setPedidoIniciado(false);
    setTurnoAsignado(null);
    toast.info('Pedido cancelado');
  };

  // ✅ Usar useEffect para calcular promociones sin causar re-renders infinitos
  const [totalCarrito, setTotalCarrito] = useState(0);
  
  useEffect(() => {
    const totalSinDescuento = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    
    // 🎯 NUEVO: Aplicar promociones automáticamente
    if (carrito.length > 0) {
      try {
        // Convertir carrito a formato del servicio
        const carritoServicio: ItemCarritoServicio[] = carrito.map(item => ({
          id: item.producto.id,
          nombre: item.producto.nombre,
          precio: item.producto.precio,
          cantidad: item.cantidad,
          categoria: item.producto.categoria
        }));

        const resultado = aplicarDescuentosAutomaticos(carritoServicio);
        
        // Actualizar estados de promociones aplicadas
        setPromocionesAplicadasActuales(resultado.promocionesAplicadas);
        setDescuentoTotalAplicado(resultado.descuentoTotal);
        setTotalCarrito(totalSinDescuento - resultado.descuentoTotal);
      } catch (error) {
        console.error('[TPV] Error al aplicar promociones:', error);
        setTotalCarrito(totalSinDescuento);
      }
    } else {
      setPromocionesAplicadasActuales([]);
      setDescuentoTotalAplicado(0);
      setTotalCarrito(0);
    }
  }, [carrito, aplicarDescuentosAutomaticos]);

  const calcularTotal = () => {
    return totalCarrito;
  };

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  
  const calcularSubtotalSinDescuento = () => {
    return carrito.reduce((acc, item) => acc + item.subtotal, 0);
  };
  
  const calcularIVA = () => {
    const totalConDescuento = calcularTotal();
    return totalConDescuento * 0.1; // 10% IVA
  };
  
  const calcularTotalConIVA = () => {
    return calcularTotal() + calcularIVA();
  };



  // ============================================
  // FUNCIONES DE CLIENTES Y TURNOS
  // ============================================

  const generarCodigoTurno = (): string => {
    const numero = contadorTurnos.toString().padStart(3, '0');
    setContadorTurnos(contadorTurnos + 1);
    return `P${numero}`;
  };

  const iniciarPedido = () => {
    if (!clienteSeleccionado) {
      const clienteAnonimo: Cliente = {
        id: `CLI-${Date.now()}`,
        nombre: 'Cliente sin datos',
        telefono: 'N/A'
      };
      setClienteSeleccionado(clienteAnonimo);
    }
    
    const codigoTurno = generarCodigoTurno();
    setTurnoAsignado(codigoTurno);
    setPedidoIniciado(true);
    setModalCliente(false);
    toast.success(`Pedido iniciado - Turno ${codigoTurno}`);
  };

  // ============================================
  // FUNCIONES DE STOCK
  // ============================================

  const actualizarStockDespuesDeVenta = (itemsVendidos: ItemCarrito[]) => {
    setProductos(prevProductos => {
      const productosActualizados = prevProductos.map(producto => {
        // Buscar si este producto fue vendido
        const itemVendido = itemsVendidos.find(item => item.producto.id === producto.id);
        
        if (itemVendido) {
          const nuevoStock = Math.max(0, producto.stock - itemVendido.cantidad);
          
          // Alerta si stock bajo
          if (nuevoStock <= 5 && nuevoStock > 0) {
            toast.warning(`⚠️ Stock bajo: ${producto.nombre} (${nuevoStock} unidades)`);
          } else if (nuevoStock === 0) {
            toast.error(`❌ Sin stock: ${producto.nombre}`);
          }
          
          return {
            ...producto,
            stock: nuevoStock
          };
        }
        
        return producto;
      });
      
      return productosActualizados;
    });
  };

  const verificarStockDisponible = (productoId: string, cantidadSolicitada: number): boolean => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return false;
    
    return producto.stock >= cantidadSolicitada;
  };

  // ============================================
  // FUNCIONES DE PAGO
  // ============================================

  const procesarPago = () => {
    if (!permisos.cobrar_pedidos) {
      toast.error('No tienes permisos para cobrar pedidos');
      return;
    }

    if (!metodoPago) {
      toast.error('Selecciona un método de pago');
      return;
    }

    if (metodoPago === 'mixto') {
      setShowPagoMixto(true);
      setShowPagoDialog(false);
      return;
    }

    if (metodoPago === 'efectivo' && !montoPagado) {
      toast.error('Ingresa el monto pagado');
      return;
    }

    // 🎯 NUEVO: Usar funciones actualizadas
    const subtotalSinDescuento = calcularSubtotalSinDescuento();
    const totalConDescuento = calcularTotal(); // Ya incluye descuentos automáticos
    const totalFinal = calcularTotalConIVA(); // Total con IVA
    const totalDescuento = descuentoTotalAplicado;
    const promocionesAplicadas = promocionesAplicadasActuales;
    
    if (metodoPago === 'efectivo') {
      const pago = parseFloat(montoPagado);
      if (pago < totalFinal) {
        toast.error('El monto pagado es insuficiente');
        return;
      }
    }

    // Obtener info real de PDV/Empresa/Marca
    const pdvIdFinal = String(pdvEfectivo?.id || puntoVentaId || '').trim();
    const pdv = pdvById.get(pdvIdFinal);
    const marcaId = String(marcaActiva || pdv?.marcasIds?.[0] || '').trim();
    const marca = marcaById.get(marcaId);
    const empresaId = String(marca?.empresaId || pdv?.empresaId || '').trim();
    const empresa = empresaById.get(empresaId);

    // Crear nuevo pedido con datos reales de empresa y ubicación
    const nuevoPedido: Pedido = {
      id: `PED-${Date.now()}`,
      codigo: turnoAsignado || generarCodigoTurno(),
      cliente: clienteSeleccionado || { id: 'ANONIMO', nombre: 'Cliente sin datos', telefono: 'N/A' },
      items: carrito,
      total: totalFinal,
      totalSinDescuento: totalDescuento > 0 ? subtotalSinDescuento : undefined,
      totalDescuento: totalDescuento > 0 ? totalDescuento : undefined,
      promocionesAplicadas: promocionesAplicadas.length > 0 ? promocionesAplicadas : undefined,
      estado: 'en_preparacion',
      origenPedido: 'presencial',
      metodoPago,
      pagado: true,
      fechaCreacion: new Date(),
      empresa: empresa?.nombreComercial || empresaId,
      marca: marca?.nombre || getNombreMarca(marcaId) || marcaId,
      pdv: pdv?.nombre || pdvIdFinal,
      // Ubicación
      direccion: pdv?.direccion,
      latitud: pdv?.latitud,
      longitud: pdv?.longitud
    };

    setPedidos([nuevoPedido, ...pedidos]);
    
    // ⭐ RESTAR STOCK DE PRODUCTOS VENDIDOS
    actualizarStockDespuesDeVenta(carrito);
    
    // Mensaje con resumen
    if (totalDescuento > 0) {
      toast.success(`Pago procesado - Ahorro: ${totalDescuento.toFixed(2)}€`, {
        description: `Total pagado: ${totalFinal.toFixed(2)}€`
      });
    } else {
      toast.success('Pago procesado correctamente');
    }
    
    setCarrito([]);
    setShowPagoDialog(false);
    setMetodoPago(null);
    setMontoPagado('');
    setPedidoIniciado(false);
    setClienteSeleccionado(null);
    setTurnoAsignado(null);
    setPedidoPagado(true);
  };

  const calcularCambio = () => {
    const total = calcularTotalConIVA();
    const pago = parseFloat(montoPagado) || 0;
    return Math.max(0, pago - total);
  };

  // ============================================
  // FUNCIONES DE ESTADOS DE PEDIDO
  // ============================================

  const isBackendPedidoId = (pedidoId: string): boolean => /^\d+$/.test(pedidoId);

  const upsertPedidoFromBackend = (raw: PedidoBackend) => {
    const fecha = raw.fecha ? new Date(raw.fecha) : new Date();
    const year = fecha.getFullYear();
    const codigo = `${year}-${String(raw.id).padStart(6, '0')}`;
    const metodoPago = (raw.metodoPago as any) || undefined;
    const pagado = metodoPago !== 'efectivo' || raw.estado !== 'pendiente';

    const adapted: Pedido = {
      id: String(raw.id),
      codigo,
      cliente: {
        id: String(raw.cliente?.id ?? raw.clienteId),
        nombre: raw.cliente?.nombre || 'Cliente',
        telefono: raw.cliente?.telefono || '',
        email: raw.cliente?.email || undefined,
      },
      items: (raw.items || []).map((it: any) => {
        const prod = it.producto;
        const precio = typeof prod?.precio === 'number' ? prod.precio : it.precio;
        return {
          producto: {
            id: String(prod?.id ?? it.productoId),
            nombre: prod?.nombre || `Producto ${it.productoId}`,
            precio,
            categoria: '',
            stock: 0,
            activo: true,
            visible_tpv: true,
            descripcion: prod?.descripcion,
            imagen: prod?.imagen,
          },
          cantidad: it.cantidad,
          subtotal: precio * it.cantidad,
        };
      }),
      total: raw.total,
      estado: (raw.estado as any) || 'pendiente',
      origenPedido: 'app',
      metodoPago,
      pagado,
      fechaCreacion: fecha,
    };

    setPedidos((prev) => {
      const idx = prev.findIndex((p) => p.id === adapted.id);
      if (idx === -1) return [adapted, ...prev];
      return prev.map((p) => (p.id === adapted.id ? { ...p, ...adapted } : p));
    });
  };

  const cobrarPedido = async (pedidoId: string) => {
    if (!permisos.cobrar_pedidos) {
      toast.error('No tienes permisos para cobrar pedidos');
      return;
    }
    if (!isBackendPedidoId(pedidoId)) {
      toast.info('Este pedido no es del backend');
      return;
    }
    const actualizado = await pedidosApi.cobrar(pedidoId);
    if (actualizado) upsertPedidoFromBackend(actualizado);
  };

  const marcarComoListo = async (pedidoId: string) => {
    if (!permisos.marcar_como_listo) {
      toast.error('No tienes permisos para marcar pedidos como listos');
      return;
    }

    if (isBackendPedidoId(pedidoId)) {
      const actualizado = await pedidosApi.update(pedidoId, { estado: 'listo' } as any);
      if (actualizado) upsertPedidoFromBackend(actualizado);
      toast.success('Pedido marcado como listo');
      return;
    }

    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, estado: 'listo' } : p)));
    toast.success('Pedido marcado como listo');
  };

  const marcarComoEntregado = async (pedidoId: string) => {
    if (isBackendPedidoId(pedidoId)) {
      const actualizado = await pedidosApi.update(pedidoId, { estado: 'entregado' } as any);
      if (actualizado) upsertPedidoFromBackend(actualizado);
      toast.success('Pedido entregado');
      return;
    }

    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, estado: 'entregado' } : p)));
    toast.success('Pedido entregado');
  };

  const cancelarPedido = (pedidoId: string, motivo: string) => {
    if (!permisos.acceso_operativa) {
      toast.error('No tienes permisos para cancelar pedidos');
      return;
    }

    if (/^\d+$/.test(pedidoId)) {
      pedidosApi
        .update(pedidoId, { estado: 'cancelado', motivoCancelacion: motivo } as any)
        .then((updated) => {
          if (updated) upsertPedidoFromBackend(updated as any);
          toast.success('Pedido cancelado');
        })
        .catch(() => toast.error('Error al cancelar pedido'));
      return;
    }

    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, estado: 'cancelado', motivoCancelacion: motivo } : p)));
    toast.success('Pedido cancelado');
  };

  const devolverPedido = (pedidoId: string, motivo: string) => {
    if (!permisos.acceso_operativa) {
      toast.error('No tienes permisos para hacer devoluciones');
      return;
    }

    if (/^\d+$/.test(pedidoId)) {
      pedidosApi
        .update(pedidoId, { estado: 'devuelto', motivoDevolucion: motivo } as any)
        .then((updated) => {
          if (updated) upsertPedidoFromBackend(updated as any);
          toast.success('Devolución procesada');
        })
        .catch(() => toast.error('Error al procesar devolución'));
      return;
    }

    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, estado: 'devuelto', motivoDevolucion: motivo } : p)));
    toast.success('Devolución procesada');
  };

  // ============================================
  // FUNCIONES DE OPERACIONES DE CAJA
  // ============================================

  /**
   * Obtiene el PDV activo, ya sea del prop o del fichaje del colaborador
   */
  const obtenerPDVActivo = (): { id: string; nombre: string } | null => {
    // Usar el pdvEfectivo que ya sincronizamos automáticamente
    return pdvEfectivo;
  };

  const handleSeleccionarOperacion = (operacion: TipoOperacionCaja) => {
    setShowModalOperaciones(false);

    switch (operacion) {
      case 'apertura':
        if (estadoCaja.caja_abierta) {
          toast.error('La caja ya está abierta');
          return;
        }
        // Verificar que haya un PDV disponible
        if (!pdvEfectivo) {
          toast.error('Debes fichar entrada primero', {
            description: 'Ve a la sección de Fichaje y registra tu entrada para seleccionar un punto de venta',
          });
          return;
        }
        console.log('[TPV] Abriendo modal de apertura con PDV:', pdvEfectivo);
        setShowModalApertura(true);
        break;
      
      case 'arqueo':
        if (!estadoCaja.caja_abierta) {
          toast.error('Debes abrir la caja primero');
          return;
        }
        setShowModalArqueo(true);
        break;
      
      case 'cierre':
        if (!estadoCaja.caja_abierta) {
          toast.error('La caja ya está cerrada');
          return;
        }
        if (!permisos.cierre_caja) {
          toast.error('No tienes permisos para cerrar caja');
          return;
        }
        setShowModalCierre(true);
        break;
      
      case 'retirada':
        if (!estadoCaja.caja_abierta) {
          toast.error('Debes abrir la caja primero');
          return;
        }
        if (!permisos.hacer_retiradas) {
          toast.error('No tienes permisos para hacer retiradas');
          return;
        }
        setShowModalRetirada(true);
        break;
      
      case 'consumo_propio':
        if (!estadoCaja.caja_abierta) {
          toast.error('Debes abrir la caja primero');
          return;
        }
        setShowModalConsumoPropio(true);
        break;
      
      case 'devolucion':
        if (!estadoCaja.caja_abierta) {
          toast.error('Debes abrir la caja primero');
          return;
        }
        setShowModalDevolucion(true);
        break;
    }
  };

  const confirmarAperturaCaja = (importeInicial: number, observaciones: string) => {
    const pdvActivo = obtenerPDVActivo();
    console.log('[TPV] Confirmando apertura de caja con PDV:', pdvActivo);
    if (!pdvActivo) {
      console.error('[TPV] No hay PDV activo disponible. pdvEfectivo:', pdvEfectivo, 'puntoVentaId:', puntoVentaId);
      toast.error('No se pudo determinar el punto de venta', {
        description: 'Asegúrate de haber fichado entrada con un punto de venta seleccionado'
      });
      return;
    }

    const operacion: OperacionCaja = {
      operacion_id: generarOperacionId(),
      tipo_operacion: 'apertura',
      empresa_id: 'EMP001',
      punto_venta_id: pdvActivo.id,
      usuario_id: 'USER001',
      nombre_usuario: nombreUsuario,
      fecha_hora: new Date(),
      importe_efectivo: importeInicial,
      importe_tarjeta: 0,
      saldo_caja_teorico: importeInicial,
      saldo_caja_real: importeInicial,
      diferencia: 0,
      observaciones: observaciones
    };

    setEstadoCaja({
      ...estadoCaja,
      caja_abierta: true,
      ultima_apertura: operacion,
      saldo_actual_teorico: importeInicial,
      saldo_actual_real: importeInicial,
      diferencia_acumulada: 0,
      operaciones_del_turno: [operacion],
      requiere_atencion: false
    });

    setTurnoAbierto(true);
    emitirOperacionCaja(operacion);
    setShowModalApertura(false);
    toast.success(`Caja abierta con ${importeInicial.toFixed(2)}€`);
  };

  const confirmarArqueoCaja = (efectivoReal: number, tarjetaReal: number, observaciones: string) => {
    const pdvActivo = obtenerPDVActivo();
    if (!pdvActivo) {
      toast.error('No se pudo determinar el punto de venta');
      return;
    }

    const totalReal = efectivoReal + tarjetaReal;
    const diferencia = totalReal - estadoCaja.saldo_actual_teorico;

    const operacion: OperacionCaja = {
      operacion_id: generarOperacionId(),
      tipo_operacion: 'arqueo',
      empresa_id: 'EMP001',
      punto_venta_id: pdvActivo.id,
      usuario_id: 'USER001',
      nombre_usuario: nombreUsuario,
      fecha_hora: new Date(),
      importe_efectivo: efectivoReal,
      importe_tarjeta: tarjetaReal,
      saldo_caja_teorico: estadoCaja.saldo_actual_teorico,
      saldo_caja_real: totalReal,
      diferencia: diferencia,
      observaciones: observaciones
    };

    const nuevaDiferenciaAcumulada = estadoCaja.diferencia_acumulada + diferencia;
    const requiereAtencion = Math.abs(nuevaDiferenciaAcumulada) > 10;

    setEstadoCaja({
      ...estadoCaja,
      ultimo_arqueo: operacion,
      saldo_actual_real: totalReal,
      diferencia_acumulada: nuevaDiferenciaAcumulada,
      operaciones_del_turno: [...estadoCaja.operaciones_del_turno, operacion],
      requiere_atencion: requiereAtencion
    });

    emitirOperacionCaja(operacion);
    setShowModalArqueo(false);

    if (Math.abs(diferencia) < 0.01) {
      toast.success('Arqueo completado - Caja cuadrada ✓');
    } else if (diferencia > 0) {
      toast.success(`Arqueo completado - Sobrante: ${diferencia.toFixed(2)}€`);
    } else {
      toast.error(`Arqueo completado - Faltante: ${Math.abs(diferencia).toFixed(2)}€`);
    }
  };

  const confirmarCierreCaja = (efectivoFinal: number, tarjetaFinal: number, observaciones: string) => {
    const pdvActivo = obtenerPDVActivo();
    if (!pdvActivo) {
      toast.error('No se pudo determinar el punto de venta');
      return;
    }

    const totalReal = efectivoFinal + tarjetaFinal;
    const diferencia = totalReal - estadoCaja.saldo_actual_teorico;

    const operacion: OperacionCaja = {
      operacion_id: generarOperacionId(),
      tipo_operacion: 'cierre',
      empresa_id: 'EMP001',
      punto_venta_id: pdvActivo.id,
      usuario_id: 'USER001',
      nombre_usuario: nombreUsuario,
      fecha_hora: new Date(),
      importe_efectivo: efectivoFinal,
      importe_tarjeta: tarjetaFinal,
      saldo_caja_teorico: estadoCaja.saldo_actual_teorico,
      saldo_caja_real: totalReal,
      diferencia: diferencia,
      observaciones: observaciones
    };

    setEstadoCaja({
      ...estadoCaja,
      caja_abierta: false,
      ultimo_cierre: operacion,
      saldo_actual_real: totalReal,
      diferencia_acumulada: estadoCaja.diferencia_acumulada + diferencia,
      operaciones_del_turno: [...estadoCaja.operaciones_del_turno, operacion],
      requiere_atencion: false
    });

    setTurnoAbierto(false);
    emitirOperacionCaja(operacion);
    setShowModalCierre(false);

    if (Math.abs(diferencia) < 0.01) {
      toast.success('Caja cerrada correctamente - Sin diferencias ✓');
    } else {
      toast.success(`Caja cerrada - Diferencia: ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)}€`);
    }

    // Llamar al callback de cierre si está definido
    if (onCerrarCaja) {
      onCerrarCaja();
    }
  };

  const confirmarRetiradaCaja = (importe: number, motivo: string) => {
    const pdvActivo = obtenerPDVActivo();
    if (!pdvActivo) {
      toast.error('No se pudo determinar el punto de venta');
      return;
    }

    const operacion: OperacionCaja = {
      operacion_id: generarOperacionId(),
      tipo_operacion: 'retirada',
      empresa_id: 'EMP001',
      punto_venta_id: pdvActivo.id,
      usuario_id: 'USER001',
      nombre_usuario: nombreUsuario,
      fecha_hora: new Date(),
      importe_efectivo: -importe, // Negativo porque sale dinero
      importe_tarjeta: 0,
      saldo_caja_teorico: estadoCaja.saldo_actual_teorico - importe,
      saldo_caja_real: estadoCaja.saldo_actual_real - importe,
      diferencia: 0,
      observaciones: motivo
    };

    setEstadoCaja({
      ...estadoCaja,
      saldo_actual_teorico: estadoCaja.saldo_actual_teorico - importe,
      saldo_actual_real: estadoCaja.saldo_actual_real - importe,
      operaciones_del_turno: [...estadoCaja.operaciones_del_turno, operacion]
    });

    emitirOperacionCaja(operacion);
    setShowModalRetirada(false);
    toast.success(`Retirada registrada: ${importe.toFixed(2)}€`);
  };

  const confirmarConsumoPropio = (productosSeleccionados: { producto: Producto; cantidad: number }[], observaciones: string) => {
    const totalConsumo = productosSeleccionados.reduce((acc, item) => 
      acc + (item.producto.precio * item.cantidad), 0
    );

    const operacion: OperacionCaja = {
      operacion_id: generarOperacionId(),
      tipo_operacion: 'consumo_propio',
      empresa_id: 'EMP001',
      punto_venta_id: pdvEfectivo?.id || puntoVentaId,
      usuario_id: 'USER001',
      nombre_usuario: nombreUsuario,
      fecha_hora: new Date(),
      importe_efectivo: -totalConsumo, // Negativo porque reduce el inventario
      importe_tarjeta: 0,
      saldo_caja_teorico: estadoCaja.saldo_actual_teorico,
      saldo_caja_real: estadoCaja.saldo_actual_real,
      diferencia: 0,
      observaciones: `Consumo propio: ${productosSeleccionados.length} productos. ${observaciones}`
    };

    setEstadoCaja({
      ...estadoCaja,
      operaciones_del_turno: [...estadoCaja.operaciones_del_turno, operacion]
    });

    emitirOperacionCaja(operacion);
    setShowModalConsumoPropio(false);
    toast.success(`Consumo propio registrado: ${totalConsumo.toFixed(2)}€ (${productosSeleccionados.length} productos)`);
  };

  const confirmarDevolucion = (pedidoId: string, itemsDevueltos: string[], motivo: string, importeDevolucion: number) => {
    const operacion: OperacionCaja = {
      operacion_id: generarOperacionId(),
      tipo_operacion: 'devolucion',
      empresa_id: 'EMP001',
      punto_venta_id: pdvEfectivo?.id || puntoVentaId,
      usuario_id: 'USER001',
      nombre_usuario: nombreUsuario,
      fecha_hora: new Date(),
      importe_efectivo: -importeDevolucion, // Negativo porque devolvemos dinero
      importe_tarjeta: 0,
      saldo_caja_teorico: estadoCaja.saldo_actual_teorico - importeDevolucion,
      saldo_caja_real: estadoCaja.saldo_actual_real - importeDevolucion,
      diferencia: 0,
      observaciones: `Devolución ticket ${pedidoId}: ${motivo}`
    };

    // Actualizar el pedido para marcarlo como devuelto
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, estado: 'devuelto', motivoDevolucion: motivo } : p
    ));

    setEstadoCaja({
      ...estadoCaja,
      saldo_actual_teorico: estadoCaja.saldo_actual_teorico - importeDevolucion,
      saldo_actual_real: estadoCaja.saldo_actual_real - importeDevolucion,
      operaciones_del_turno: [...estadoCaja.operaciones_del_turno, operacion]
    });

    emitirOperacionCaja(operacion);
    setShowModalDevolucion(false);
    toast.success(`Devolución procesada: ${importeDevolucion.toFixed(2)}€ devueltos`);
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-[1800px] mx-auto space-y-3 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  TPV 360 - Base
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden md:inline">Usuario: <strong>{nombreUsuario}</strong> · Rol: <strong>{rolUsuario}</strong></span>
                    <span className="md:hidden"><strong>{nombreUsuario}</strong></span>
                  </p>
                  {pdvEfectivo ? (
                    <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700 text-xs">
                      <Store className="w-3 h-3 mr-1" />
                      PDV: {pdvEfectivo.nombre}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Sin PDV asignado
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Botón Estado TPV que abre modal de operaciones o apertura */}
              <Button
                onClick={() => {
                  if (!estadoCaja.caja_abierta) {
                    // Si la caja está cerrada, abrir directamente el modal de apertura
                    const pdvActivo = obtenerPDVActivo();
                    console.log('[TPV] Intento de apertura - PDV actual:', pdvActivo);
                    if (!pdvActivo) {
                      toast.error('Debes fichar entrada primero para abrir la caja', {
                        description: 'Ve a la sección de Fichaje y selecciona un punto de venta'
                      });
                      return;
                    }
                    setShowModalApertura(true);
                  } else {
                    // Si la caja está abierta, mostrar el modal de operaciones
                    setShowModalOperaciones(true);
                  }
                }}
                className={`text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 gap-1.5 sm:gap-2 w-full sm:w-auto ${
                  estadoCaja.caja_abierta 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {estadoCaja.caja_abierta ? (
                  <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="hidden sm:inline">Estado TPV: {estadoCaja.caja_abierta ? 'Operativo' : 'Cerrado'}</span>
                <span className="sm:hidden">{estadoCaja.caja_abierta ? 'Operativo' : 'Cerrado'}</span>
                {estadoCaja.requiere_atencion && (
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Banner de Advertencia - Sin PDV asignado */}
        {!pdvEfectivo && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-900">
                    <strong>No hay punto de venta asignado</strong>
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Para poder operar en el TPV, primero debes fichar entrada y seleccionar un punto de venta. Ve a la sección de <strong>Fichaje</strong> en el menú principal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navegación Principal */}
        <Card>
          <CardContent className="p-2 sm:p-4">
            <Tabs value={vistaActiva} onValueChange={(v) => setVistaActiva(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 h-auto gap-1">
                <TabsTrigger value="tpv" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight text-center">
                    <span className="hidden sm:inline">TPV Principal</span>
                    <span className="sm:hidden">TPV</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="caja-rapida" 
                  className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2"
                  disabled={!permisos.gestionar_caja_rapida}
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight text-center">
                    <span className="hidden sm:inline">Caja Rápida</span>
                    <span className="sm:hidden">Rápida</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="turnos" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight">Turnos</span>
                </TabsTrigger>
                <TabsTrigger value="estados" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight">Estados</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="operativa" 
                  className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2"
                  disabled={!permisos.acceso_operativa}
                >
                  <ListChecks className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight">Operativa</span>
                </TabsTrigger>
                <TabsTrigger value="impresoras" className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight">
                    <span className="hidden sm:inline">Impresoras</span>
                    <span className="sm:hidden">Print</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="caja" 
                  className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2"
                  disabled={!permisos.cierre_caja && !permisos.arqueo_caja}
                >
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight">Caja</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="informes" 
                  className="flex flex-col gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2"
                  disabled={!permisos.ver_informes_turno}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[10px] sm:text-xs leading-tight">Informes</span>
                </TabsTrigger>
              </TabsList>

              {/* VISTA TPV PRINCIPAL */}
              <TabsContent value="tpv" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Alerta de caja cerrada */}
                {!estadoCaja.caja_abierta && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-red-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">Caja Cerrada</p>
                        <p className="text-xs text-red-700 mt-1">
                          No se pueden añadir productos al carrito. Debes abrir la caja primero desde la pestaña "Caja" o mediante el botón de operaciones.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filtros Multicanal Pedidos */}
                <div className="mb-4 flex flex-wrap gap-2 items-end bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Empresa</label>
                    <select className="border rounded px-2 py-1 text-xs" value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}>
                      <option value="">Todas</option>
                      {Array.from(new Set(pedidos.map(p => p.empresa).filter(Boolean))).map(emp => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
                    <select className="border rounded px-2 py-1 text-xs" value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)}>
                      <option value="">Todas</option>
                      {Array.from(new Set(pedidos.map(p => p.marca).filter(Boolean))).map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">PDV</label>
                    <select className="border rounded px-2 py-1 text-xs" value={filtroPDV} onChange={e => setFiltroPDV(e.target.value)}>
                      <option value="">Todos</option>
                      {Array.from(new Set(pedidos.map(p => p.pdv).filter(Boolean))).map(pdv => (
                        <option key={pdv} value={pdv}>{pdv}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                    <select className="border rounded px-2 py-1 text-xs" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                      <option value="">Todos</option>
                      {Array.from(new Set(pedidos.map(p => p.estado).filter(Boolean))).map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Origen</label>
                    <select className="border rounded px-2 py-1 text-xs" value={filtroOrigen} onChange={e => setFiltroOrigen(e.target.value)}>
                      <option value="">Todos</option>
                      {Array.from(new Set(pedidos.map(p => p.origenPedido).filter(Boolean))).map(origen => (
                        <option key={origen} value={origen}>{origen}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Búsqueda</label>
                    <input
                      className="border rounded px-2 py-1 text-xs"
                      type="text"
                      placeholder="Buscar código, cliente..."
                      value={filtroBusqueda}
                      onChange={e => setFiltroBusqueda(e.target.value)}
                    />
                  </div>
                  <button
                    className="ml-2 px-3 py-1 text-xs rounded bg-gray-100 border border-gray-300 hover:bg-gray-200"
                    onClick={() => {
                      setFiltroEmpresa(''); setFiltroMarca(''); setFiltroPDV(''); setFiltroEstado(''); setFiltroOrigen(''); setFiltroBusqueda('');
                    }}
                  >Limpiar</button>
                </div>

                {/* Tabla de Pedidos Multicanal */}
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-2 text-left">Código</th>
                        <th className="px-2 py-2 text-left">Cliente</th>
                        <th className="px-2 py-2 text-left">Empresa</th>
                        <th className="px-2 py-2 text-left">Marca</th>
                        <th className="px-2 py-2 text-left">PDV</th>
                        <th className="px-2 py-2 text-left">Estado</th>
                        <th className="px-2 py-2 text-left">Origen</th>
                        <th className="px-2 py-2 text-left">Fecha</th>
                        <th className="px-2 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center text-gray-400 py-6">No hay pedidos para los filtros seleccionados</td>
                        </tr>
                      ) : (
                        pedidosFiltrados.map(p => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="px-2 py-1 font-semibold">{p.codigo}</td>
                            <td className="px-2 py-1">{p.cliente?.nombre || ''}</td>
                            <td className="px-2 py-1">{p.empresa}</td>
                            <td className="px-2 py-1">{p.marca}</td>
                            <td className="px-2 py-1">{p.pdv}</td>
                            <td className="px-2 py-1">{p.estado}</td>
                            <td className="px-2 py-1">{p.origenPedido}</td>
                            <td className="px-2 py-1">{p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleString() : ''}</td>
                            <td className="px-2 py-1">{p.total?.toFixed(2)}€</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Panel de Productos */}
                  <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                    <Card>
                      <CardHeader className="p-3 sm:p-6">
                        <div className="space-y-2 sm:space-y-4">
                          {/* Título */}
                          <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Productos
                          </CardTitle>
                          
                          {/* Botones de marca con imagen */}
                          {marcasDisponiblesLocal.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {marcasDisponiblesLocal.map(marcaId => {
                                const marca = marcaById.get(marcaId);
                                const nombreMarca = String(marca?.nombre || getNombreMarca(marcaId) || marcaId);
                                
                                const isActive = marcaActivaLocal === marcaId;
                                const contadorProductos = productos.filter(p => 
                                  (!p.marcas_ids || p.marcas_ids.includes(marcaId)) && 
                                  p.activo !== false && 
                                  p.visible_tpv !== false
                                ).length;
                                
                                return (
                                  <button
                                    key={marcaId}
                                    onClick={() => {
                                      setMarcaActivaLocal(marcaId);
                                      onCambiarMarca?.(marcaId);
                                      toast.info(`Cambiado a ${nombreMarca}`);
                                    }}
                                    className={`
                                      relative group flex-shrink-0
                                      w-16 h-16 sm:w-20 sm:h-20
                                      rounded-full overflow-hidden
                                      transition-all duration-200
                                      bg-black
                                      ${isActive 
                                        ? 'border-4 border-[#ED1C24] ring-4 ring-[#ED1C24]/30 shadow-lg shadow-[#ED1C24]/50' 
                                        : 'border-3 border-gray-300 hover:border-[#ED1C24]/50 hover:shadow-md'
                                      }
                                    `}
                                    title={`${nombreMarca} (${contadorProductos} productos)`}
                                  >
                                    {/* Imagen de la marca */}
                                    <ImageWithFallback
                                      src={String(marca?.logoUrl || '')}
                                      alt={nombreMarca}
                                      className="w-full h-full object-contain p-2"
                                    />
                                    
                                    {/* Indicador de activo - check pequeño arriba a la derecha */}
                                    {isActive && (
                                      <div className="absolute -top-1 -right-1 w-7 h-7 bg-[#ED1C24] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                        <Check className="w-4 h-4 text-white stroke-[3]" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Buscador */}
                          <div className="relative">
                            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                            <Input
                              placeholder="Buscar productos..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
                            />
                          </div>

                          {/* Filtros de categorías - SIN SCROLL HORIZONTAL */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {categorias.map(cat => {
                              const isPromo = cat === 'promociones';
                              const isActive = categoriaActiva === cat;
                              
                              return (
                                <Button
                                  key={cat}
                                  onClick={() => setCategoriaActiva(cat)}
                                  variant={isActive ? "default" : "outline"}
                                  size="sm"
                                  className={`h-7 sm:h-9 text-[11px] sm:text-sm px-2 sm:px-3 ${
                                    isActive 
                                      ? isPromo 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0'
                                        : 'bg-teal-600 hover:bg-teal-700' 
                                      : isPromo
                                        ? 'border-purple-300 hover:bg-purple-50'
                                        : ''
                                  }`}
                                >
                                  {isPromo && <Sparkles className="w-3 h-3 mr-1" />}
                                  {cat === 'todos' ? 'Todos' : cat === 'promociones' ? 'Promociones' : cat}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-2 sm:p-6">
                        {/* Grid de productos con imágenes */}
                        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 max-h-[calc(100vh-350px)] sm:max-h-[600px] sm:overflow-y-auto snap-x snap-mandatory pb-2">
                          {productosFiltrados.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400">
                              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No hay productos disponibles</p>
                              <p className="text-xs mt-2">
                                {categoriaActiva !== 'todos' 
                                  ? `No hay productos en la categoría "${categoriaActiva}"`
                                  : 'No hay productos cargados'}
                              </p>
                            </div>
                          ) : (
                            productosFiltrados.map(producto => {
                            // ✨ Verificar si el producto tiene promoción
                            const infoPromo = verificarPromocionProducto(producto);
                            
                            return (
                              <button
                                key={producto.id}
                                onClick={() => agregarAlCarrito(producto)}
                                disabled={!estadoCaja.caja_abierta || producto.stock === 0}
                                className={`bg-white border-2 rounded-xl p-3 sm:p-4 transition-all text-left group touch-target relative flex flex-col flex-shrink-0 w-[180px] sm:w-auto snap-center ${
                                  !estadoCaja.caja_abierta || producto.stock === 0
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : infoPromo.tienePromo
                                      ? 'hover:shadow-xl hover:border-purple-500 border-purple-200 cursor-pointer' 
                                      : 'hover:shadow-xl hover:border-teal-500 cursor-pointer'
                                }`}
                              >
                                {/* Badge de promoción en esquina superior derecha */}
                                {infoPromo.tienePromo && producto.stock > 0 && (
                                  <div className="absolute -top-1 -right-1 z-10">
                                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 shadow-md">
                                      <Percent className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5" />
                                      PROMO
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* ⭐ Badge de Sin Stock */}
                                {producto.stock === 0 && (
                                  <div className="absolute -top-1 -right-1 z-10">
                                    <Badge className="bg-red-600 text-white text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 shadow-md">
                                      ❌ SIN STOCK
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Imagen del producto */}
                                <div className="w-full h-36 sm:h-40 mb-3 rounded-xl overflow-hidden bg-gray-100">
                                  <ImageWithFallback
                                    src={producto.imagen || getImagenPorCategoria(producto.categoria)}
                                    alt={producto.nombre}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                
                                {/* Nombre del producto */}
                                <p className="font-semibold text-sm sm:text-base mb-3 line-clamp-2 min-h-[2.5rem]">{producto.nombre}</p>
                                
                                {/* Precio del producto */}
                                <div className="flex items-center justify-between mt-auto">
                                  {infoPromo.tienePromo && infoPromo.precioConDescuento !== undefined ? (
                                    <div className="flex flex-col">
                                      <p className="text-xs text-gray-400 line-through">
                                        {producto.precio.toFixed(2)}€
                                      </p>
                                      <p className="text-xl sm:text-2xl text-purple-600 font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                        {infoPromo.precioConDescuento.toFixed(2)}€
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-xl sm:text-2xl text-teal-600 font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      {producto.precio.toFixed(2)}€
                                    </p>
                                  )}
                                </div>
                              </button>
                            );
                          })
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Panel del Carrito - Solo Desktop */}
                  <div className="hidden lg:block lg:col-span-1">
                    <Card className="lg:sticky lg:top-6">
                      <CardHeader className="pb-3 p-4 sm:p-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              Pedido Actual
                            </CardTitle>
                            {carrito.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={vaciarCarrito}
                                className="touch-target text-red-600 hover:text-red-700 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Botón Empezar / Info del turno */}
                          {!pedidoIniciado ? (
                            <Button
                              onClick={iniciarPedido}
                              className="w-full bg-teal-600 hover:bg-teal-700"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Empezar Pedido
                            </Button>
                          ) : (
                            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-3 text-center">
                              <p className="text-xs text-teal-700 mb-1">Turno Asignado</p>
                              <p className="text-2xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {turnoAsignado}
                              </p>
                              {clienteSeleccionado && clienteSeleccionado.nombre !== 'Cliente sin datos' && (
                                <p className="text-xs text-teal-600 mt-1">{clienteSeleccionado.nombre}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {carrito.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay productos en el pedido</p>
                          </div>
                        ) : (
                          <>
                            {/* Lista de items - Estilo compacto tipo ticket */}
                            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                              {carrito.map(item => (
                                <div key={item.producto.id} className="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-xs truncate">{item.producto.nombre}</p>
                                      <p className="text-[10px] text-gray-500">{item.producto.precio.toFixed(2)}€/u</p>
                                    </div>
                                    <button
                                      onClick={() => eliminarDelCarrito(item.producto.id)}
                                      className="touch-target text-red-500 hover:text-red-700 flex-shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => modificarCantidad(item.producto.id, item.cantidad - 1)}
                                        className="touch-target h-6 w-6 p-0"
                                      >
                                        <Minus className="w-2.5 h-2.5" />
                                      </Button>
                                      <span className="w-7 text-center text-xs font-medium">{item.cantidad}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => modificarCantidad(item.producto.id, item.cantidad + 1)}
                                        className="touch-target h-6 w-6 p-0"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                      </Button>
                                    </div>
                                    <p className="text-sm font-medium text-teal-600">
                                      {item.subtotal.toFixed(2)}€
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Resumen de Promociones Aplicadas */}
                            {promocionesAplicadasActuales.length > 0 && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 space-y-2">
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

                            {/* Botones de acción */}
                            <div className="space-y-2">
                              <Button
                                onClick={() => setShowPagoDialog(true)}
                                className="w-full bg-teal-600 hover:bg-teal-700"
                                disabled={!permisos.cobrar_pedidos}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Cobrar Pedido
                              </Button>
                              {permisos.marcar_como_listo && (
                                <Button
                                  variant="outline"
                                  className="w-full"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Marcar como Listo
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* VISTA CAJA RÁPIDA */}
              <TabsContent value="caja-rapida" className="mt-6">
                <CajaRapidaMejorada 
                  pedidos={pedidos}
                  onCobrarPedido={cobrarPedido}
                  onMarcarListo={marcarComoListo}
                  onMarcarEntregado={marcarComoEntregado}
                  permisos={permisos}
                />
              </TabsContent>

              {/* VISTA TURNOS */}
              <TabsContent value="turnos" className="mt-6">
                <GestionTurnos 
                  puntoVentaId={pdvEfectivo?.id || puntoVentaId}
                />
              </TabsContent>

              {/* VISTA ESTADOS */}
              <TabsContent value="estados" className="mt-6">
                <PanelEstadosPedidos 
                  pedidos={pedidos}
                  onMarcarListo={marcarComoListo}
                  onMarcarEntregado={marcarComoEntregado}
                  permisos={permisos}
                />
              </TabsContent>

              {/* VISTA OPERATIVA */}
              <TabsContent value="operativa" className="mt-6">
                <PanelOperativaAvanzado 
                  pedidos={pedidos}
                  onCancelar={cancelarPedido}
                  onDevolver={devolverPedido}
                  permisos={permisos}
                />
              </TabsContent>

              {/* VISTA IMPRESORAS */}
              <TabsContent value="impresoras" className="mt-6">
                <ConfiguracionImpresoras 
                  puntoVentaId={pdvEfectivo?.id || puntoVentaId}
                />
              </TabsContent>

              {/* VISTA CAJA */}
              <TabsContent value="caja" className="mt-6">
                <PanelCaja 
                  permisos={permisos}
                  nombreUsuario={nombreUsuario}
                />
              </TabsContent>

              {/* VISTA INFORMES */}
              <TabsContent value="informes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informes del Turno</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Módulo de informes en desarrollo</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botón Flotante Carrito - Solo Móvil */}
        {carrito.length > 0 && vistaActiva === 'tpv' && (
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Button
              onClick={() => setCarritoMovilAbierto(true)}
              className="h-14 w-14 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700 relative"
              size="lg"
            >
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-red-600 border-2 border-white">
                {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
              </Badge>
            </Button>
          </div>
        )}

        {/* Modal Carrito Móvil */}
        <Dialog open={carritoMovilAbierto} onOpenChange={setCarritoMovilAbierto}>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-0">
            <div className="sticky top-0 bg-white z-10 border-b p-4">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Poppins, sans-serif' }}>Pedido Actual</span>
                  {carrito.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={vaciarCarrito}
                      className="text-red-600 hover:text-red-700 h-8 px-2 text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {carrito.length === 0 ? 'No hay productos en el pedido' : `${carrito.reduce((sum, item) => sum + item.cantidad, 0)} artículos en el pedido`}
                </DialogDescription>
              </DialogHeader>
              
              {/* Botón Empezar / Info del turno */}
              {!pedidoIniciado ? (
                <Button
                  onClick={() => {
                    iniciarPedido();
                    setCarritoMovilAbierto(false);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 mt-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Empezar Pedido
                </Button>
              ) : (
                <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-3 text-center mt-3">
                  <p className="text-xs text-teal-700 mb-1">Turno Asignado</p>
                  <p className="text-2xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {turnoAsignado}
                  </p>
                  {clienteSeleccionado && clienteSeleccionado.nombre !== 'Cliente sin datos' && (
                    <p className="text-xs text-teal-600 mt-1">{clienteSeleccionado.nombre}</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 space-y-4">
              {carrito.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay productos en el pedido</p>
                </div>
              ) : (
                <>
                  {/* Lista de items */}
                  <div className="space-y-3">
                    {carrito.map(item => (
                      <div key={item.producto.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.producto.nombre}</p>
                            <p className="text-xs text-gray-600">{item.producto.precio.toFixed(2)}€ c/u</p>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(item.producto.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => modificarCantidad(item.producto.id, item.cantidad - 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.cantidad}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => modificarCantidad(item.producto.id, item.cantidad + 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-medium text-teal-600">
                            {item.subtotal.toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen de Promociones Aplicadas */}
                  {promocionesAplicadasActuales.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 space-y-2">
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

                  {/* Botones de acción */}
                  <div className="space-y-2 sticky bottom-0 bg-white pt-4 border-t">
                    <Button
                      onClick={() => {
                        setCarritoMovilAbierto(false);
                        setShowPagoDialog(true);
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={!permisos.cobrar_pedidos}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Cobrar Pedido
                    </Button>
                    {permisos.marcar_como_listo && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCarritoMovilAbierto(false)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Marcar como Listo
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Pago */}
        <Dialog open={showPagoDialog} onOpenChange={setShowPagoDialog}>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Procesar Pago
              </DialogTitle>
              <DialogDescription>
                Total a cobrar: <span className="font-medium text-teal-600">{calcularTotalConIVA().toFixed(2)}€</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Resumen de promociones aplicadas */}
              {descuentoTotalAplicado > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                    <Tag className="w-4 h-4" />
                    Promociones Aplicadas
                  </div>
                  {promocionesAplicadasActuales.map(promo => (
                    <div key={promo.id} className="flex items-center justify-between text-xs text-green-700">
                      <span className="flex items-center gap-1">
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
                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Subtotal sin descuento:</span>
                      <span className="text-green-700 line-through">{calcularSubtotalSinDescuento().toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-green-800">Total ahorro:</span>
                      <span className="text-green-800">-{descuentoTotalAplicado.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Pago</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('efectivo')}
                    className={`flex-col h-auto py-3 ${metodoPago === 'efectivo' ? 'bg-teal-600' : ''}`}
                  >
                    <Banknote className="w-5 h-5 mb-1" />
                    <span className="text-xs">Efectivo</span>
                  </Button>
                  <Button
                    variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('tarjeta')}
                    className={`flex-col h-auto py-3 ${metodoPago === 'tarjeta' ? 'bg-teal-600' : ''}`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span className="text-xs">Tarjeta</span>
                  </Button>
                  <Button
                    variant={metodoPago === 'mixto' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('mixto')}
                    className={`flex-col h-auto py-3 ${metodoPago === 'mixto' ? 'bg-teal-600' : ''}`}
                  >
                    <Calculator className="w-5 h-5 mb-1" />
                    <span className="text-xs">Mixto</span>
                  </Button>
                  <Button
                    variant={metodoPago === 'online' ? 'default' : 'outline'}
                    onClick={() => setMetodoPago('online')}
                    className={`flex-col h-auto py-3 ${metodoPago === 'online' ? 'bg-teal-600' : ''}`}
                  >
                    <Check className="w-5 h-5 mb-1" />
                    <span className="text-xs">Online</span>
                  </Button>
                </div>
              </div>

              {metodoPago === 'efectivo' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Recibido</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                  />
                  {montoPagado && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Cambio:</span>
                        <span className="font-medium text-green-700">
                          {calcularCambio().toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPagoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={procesarPago} className="bg-teal-600 hover:bg-teal-700">
                Confirmar Pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Pago Mixto */}
        {showPagoMixto && (
          <ModalPagoMixto
            total={calcularTotalConIVA()}
            onClose={() => {
              setShowPagoMixto(false);
              setShowPagoDialog(true);
            }}
            onConfirmar={(metodo1, monto1, metodo2, monto2) => {
              const subtotalSinDescuento = calcularSubtotalSinDescuento();
              const totalConDescuento = calcularTotal();
              const totalFinal = calcularTotalConIVA();
              const totalDescuento = descuentoTotalAplicado;
              const promocionesAplicadas = promocionesAplicadasActuales;

              const nuevoPedido: Pedido = {
                id: `PED-${Date.now()}`,
                codigo: turnoAsignado || generarCodigoTurno(),
                cliente: clienteSeleccionado || { id: 'ANONIMO', nombre: 'Cliente sin datos', telefono: 'N/A' },
                items: carrito,
                total: totalFinal,
                totalSinDescuento: totalDescuento > 0 ? subtotalSinDescuento : undefined,
                totalDescuento: totalDescuento > 0 ? totalDescuento : undefined,
                promocionesAplicadas: promocionesAplicadas.length > 0 ? promocionesAplicadas : undefined,
                estado: 'en_preparacion',
                origenPedido: 'presencial',
                metodoPago: 'mixto',
                pagado: true,
                fechaCreacion: new Date()
              };

              setPedidos([nuevoPedido, ...pedidos]);
              
              toast.success('Pago mixto procesado correctamente');
              setCarrito([]);
              setShowPagoMixto(false);
              setPedidoIniciado(false);
              setClienteSeleccionado(null);
              setTurnoAsignado(null);
              setPedidoPagado(true);
            }}
          />
        )}

        {/* Modal Operaciones TPV */}
        <ModalOperacionesTPV
          isOpen={showModalOperaciones}
          onClose={() => setShowModalOperaciones(false)}
          onSeleccionarOperacion={handleSeleccionarOperacion}
          turnoAbierto={estadoCaja.caja_abierta}
          permisos={permisos}
        />

        {/* Modal Apertura de Caja */}
        <ModalAperturaCaja
          isOpen={showModalApertura}
          onClose={() => setShowModalApertura(false)}
          onConfirmar={confirmarAperturaCaja}
        />

        {/* Modal Arqueo de Caja */}
        <ModalArqueoCaja
          isOpen={showModalArqueo}
          onClose={() => setShowModalArqueo(false)}
          onConfirmar={confirmarArqueoCaja}
          saldoTeorico={estadoCaja.saldo_actual_teorico}
        />

        {/* Modal Cierre de Caja */}
        <ModalCierreCaja
          isOpen={showModalCierre}
          onClose={() => setShowModalCierre(false)}
          onConfirmar={confirmarCierreCaja}
          saldoTeorico={estadoCaja.saldo_actual_teorico}
          importeApertura={estadoCaja.ultima_apertura?.importe_efectivo || 0}
        />

        {/* Modal Retirada de Caja */}
        <ModalRetiradaCaja
          isOpen={showModalRetirada}
          onClose={() => setShowModalRetirada(false)}
          onConfirmar={confirmarRetiradaCaja}
          saldoActual={estadoCaja.saldo_actual_teorico}
        />

        {/* Modal Consumo Propio */}
        <ModalConsumoPropio
          isOpen={showModalConsumoPropio}
          onClose={() => setShowModalConsumoPropio(false)}
          onConfirmar={confirmarConsumoPropio}
          productosDisponibles={productos}
        />

        {/* Modal Devolución */}
        <ModalDevolucionTicket
          isOpen={showModalDevolucion}
          onClose={() => setShowModalDevolucion(false)}
          onConfirmar={confirmarDevolucion}
          pedidos={pedidos}
        />

        {/* 🎯 Modal Personalización de Productos (Combos, Pizzas, etc.) */}
        <ProductoPersonalizacionModal
          producto={productoPersonalizable}
          isOpen={showPersonalizacion}
          onClose={() => {
            setShowPersonalizacion(false);
            setProductoPersonalizable(null);
          }}
          onAddToCart={handleAgregarPersonalizado}
        />
      </div>
    </div>
  );
}