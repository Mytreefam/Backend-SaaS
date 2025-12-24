/**
 * MÓDULO: Clientes y Productos (Gerente)
 * 
 * ESTRUCTURA DE DATOS PARA CONEXIÓN BBDD/API
 * ==========================================
 * 
 * FILTROS GLOBALES (se pasan a todas las consultas):
 * - filtroMarca: 'todas' | 'pizzas' | 'burguers'
 * - filtroPDV: 'todos' | 'tiana' | 'badalona'
 * - filtroPeriodo: '7' | '30' | '90' | 'mes' | 'ano' (días)
 * - filtroCanal: 'todos' | 'tpv' | 'online'
 * 
 * ENTIDADES/TABLAS:
 * 
 * 1. CLIENTE {
 *    id_cliente: string
 *    nombre_completo: string
 *    telefono: string
 *    email: string
 *    direccion_completa: string
 *    cod_postal: string
 *    fecha_alta: Date
 *    fecha_ultimo_pedido: Date
 *    fecha_cumpleaños: Date | null
 *    pdv_habitual_id: string
 *    marca_preferida: string
 *    tipo_cliente: 'nuevo' | 'regular' | 'fidelizado' | 'VIP' | 'riesgo' | 'alta_frecuencia' | 'multitienda'
 *    segmentos: string[] (tags dinámicos)
 * }
 * 
 * 2. FACTURA {
 *    id_factura: string
 *    id_cliente: string
 *    fecha: Date
 *    total: number
 *    metodo_pago: 'efectivo' | 'tarjeta' | 'online' | 'mixto'
 *    estado_verifactu: boolean
 *    pdv_id: string
 *    canal: 'TPV' | 'Online'
 * }
 * 
 * 3. LINEA_FACTURA {
 *    id_linea: string
 *    id_factura: string
 *    id_producto: string
 *    cantidad: number
 *    pvp_unitario: number
 *    descuento_aplicado: number
 *    total_linea: number
 * }
 * 
 * 4. PRODUCTO {
 *    id_producto: string (PRD-XXX)
 *    nombre: string
 *    categoria: string
 *    subcategoria: string
 *    descripcion_corta: string
 *    descripcion_larga: string
 *    pvp: number
 *    iva: number
 *    escandallo_unitario: number
 *    margen_porcentaje: number
 *    rentabilidad: 'Alta' | 'Media' | 'Baja'
 *    ranking_ventas: number
 *    visible_tpv: boolean
 *    visible_app: boolean
 *    vida_util_horas: number
 *    etiquetas: string[] (saludable, vegano, premium, etc.)
 * }
 * 
 * 5. STOCK_PDV {
 *    id_producto: string
 *    pdv_id: string
 *    stock_actual: number
 *    stock_max: number
 *    stock_min: number
 *    activo_en_pdv: boolean
 * }
 * 
 * 6. PROMOCION {
 *    id_promocion: string
 *    nombre: string
 *    tipo: 'porcentaje' | 'precio_fijo' | 'pack' | 'x_llevas_y' | 'bienvenida' | 'cumpleaños' | 'riesgo' | 'vip'
 *    descripcion: string
 *    fecha_inicio: Date
 *    fecha_fin: Date
 *    limite_por_cliente: number | null
 *    limite_total: number | null
 *    aplica_marca: 'pizza' | 'burguer' | 'todas'
 *    aplica_pdv: string[] (lista de pdv_id)
 *    condiciones_ticket: { min_ticket?: number, escalado?: any }
 *    estado: 'borrador' | 'activa' | 'pausada' | 'finalizada'
 * }
 * 
 * 7. PROMOCION_PRODUCTO {
 *    id_promocion: string
 *    id_producto: string
 *    cantidad: number
 *    tipo_linea: 'incluido' | 'regalo' | 'descuento_segunda_unidad'
 * }
 * 
 * 8. PROMOCION_CLIENTE_LOG {
 *    id_promocion: string
 *    id_cliente: string
 *    fecha_enviada: Date
 *    fecha_canjeada: Date | null
 *    canal: 'push' | 'email' | 'ticket'
 * }
 * 
 * CÁLCULOS CLAVE (implementar en Backend/Make):
 * - Nº pedidos cliente = count(FACTURA.id_factura WHERE id_cliente + filtros)
 * - Ticket medio cliente = sum(FACTURA.total) / nº pedidos
 * - Gasto total cliente = sum(FACTURA.total)
 * - Margen producto = (pvp - escandallo) / pvp
 * - Stock total producto = sum(STOCK_PDV.stock_actual)
 * - Ranking producto = ORDER BY unidades vendidas DESC en periodo
 * - % promocionado = (ventas con promoción / ventas totales) * 100
 * 
 * EVENTOS PARA CONEXIÓN:
 * - CLIENTE_CREADO: { id_cliente, timestamp, datos }
 * - CLIENTE_ACTUALIZADO: { id_cliente, timestamp, cambios }
 * - PRODUCTO_ACTUALIZADO: { id_producto, campo, valor_anterior, valor_nuevo }
 * - PRODUCTO_ACTIVADO/DESACTIVADO: { id_producto, pdv_id, activo }
 * - PROMOCION_CREADA: { id_promocion, timestamp }
 * - PROMOCION_APLICADA: { id_promocion, id_cliente, timestamp }
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  EMPRESAS, 
  MARCAS, 
  PUNTOS_VENTA,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca,
  getIconoMarca,
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  PUNTOS_VENTA_ARRAY
} from '../../constants/empresaConfig';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { 
  Users, 
  TrendingDown, 
  FileText, 
  DollarSign, 
  Search, 
  Plus,
  ShoppingCart,
  MapPin,
  Eye,
  TrendingUp,
  Star,
  Gift,
  CheckCircle,
  Package,
  Truck,
  Coffee,
  Filter,
  MessageCircle,
  Edit,
  MoreVertical,
  MoreHorizontal,
  ArrowUpDown,
  CreditCard,
  Smartphone,
  Calendar,
  Clock,
  Check,
  Sparkles,
  AlertTriangle,
  LayoutGrid,
  List,
  Trash2,
  UserPlus,
  Download,
  RefreshCw,
  Power,
  PowerOff,
  Award,
  BarChart3,
  Store,
  Tag,
  ChevronDown,
  Box,
  Layers,
  ListChecks,
  ArrowRight,
  ArrowLeft,
  Percent,
  Euro,
  ChefHat,
  X,
  Globe,
  Target,
  Crown,
  Zap,
  Mail,
  Phone,
  Cake,
  Heart,
  Calculator,
  FileSpreadsheet,
  Info,
  Upload
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EmptyState } from '../ui/empty-state';
import { StatsCard } from '../ui/stats-card';
import { SkeletonCard } from '../ui/skeleton-card';
import { SkeletonList } from '../ui/skeleton-list';
import { toast } from 'sonner';
import { stockIngredientes } from '../../data/stock-ingredientes';
import { promocionesDisponibles } from '../../data/promociones-disponibles';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { productosPanaderia, type ProductoPanaderia } from '../../data/productos-panaderia';
import { articulosStock, type ArticuloStock } from '../../data/articulos-stock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { clientesApi } from '../../services/api/clientes.api';
import { productosApi } from '../../services/api/productos.api';
import { promocionesApi, type PromocionAPI } from '../../services/api/promociones.api';

interface Cliente {
  id: string;
  nombre: string;
  foto: string;
  codigoPostal: string;
  numeroPedidos: number;
  ticketMedio: number;
  ticketMedioAnterior: number;
  valoracion: number;
  ultimaCompra: string;
  promocion: boolean;
  tipo: 'Nuevo' | 'Regular' | 'Fidelizado' | 'Puntual';
  // Nuevos campos
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaCumpleanos?: string;
  segmentos?: string[]; // VIP, En riesgo, Alta frecuencia, Multitienda, Marca favorita
  pdvsVisitados?: number;
  gastoTotal?: number;
  frecuenciaCompra?: 'Semanal' | 'Mensual' | 'Ocasional';
  marcaFavorita?: string;
  productoFavorito?: string;
  pdvHabitual?: string;
}

interface Factura {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  total: number;
  productos: string[];
  verifactu: boolean;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Online' | 'Mixto';
  pdv?: string;
}

interface Envio {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  estado: 'Solicitado' | 'Preparado' | 'Enviado' | 'Recibido';
  direccion: string;
  productos: string;
}

interface Valoracion {
  id: string;
  clienteId: string;
  clienteNombre: string;
  productoId: string;
  productoNombre: string;
  puntuacion: number;
  comentario: string;
  fecha: string;
}

interface Producto {
  id: string | number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
}

export function ClientesGerente() {
  const [activeTab, setActiveTab] = useState('clientes');
  const [busqueda, setBusqueda] = useState('');
  const [modalAñadirPromocion, setModalAñadirPromocion] = useState(false);
  const [modalEditarPromocion, setModalEditarPromocion] = useState(false);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<any>(null);
  const [modalVerDetalles, setModalVerDetalles] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalAñadirAnotacion, setModalAñadirAnotacion] = useState(false);
  const [nuevaAnotacion, setNuevaAnotacion] = useState('');
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false);
  const [tabNuevoCliente, setTabNuevoCliente] = useState('info');
  const [vistaPromociones, setVistaPromociones] = useState<'fichas' | 'lista'>('fichas');
  const [tabDetallesCliente, setTabDetallesCliente] = useState('resumen');
  
  // Estados para formulario de Nuevo Cliente
  const [nuevoClienteNombre, setNuevoClienteNombre] = useState('');
  const [nuevoClienteEmail, setNuevoClienteEmail] = useState('');
  const [nuevoClienteTelefono, setNuevoClienteTelefono] = useState('');
  const [nuevoClienteDireccion, setNuevoClienteDireccion] = useState('');
  const [nuevoClienteCodigoPostal, setNuevoClienteCodigoPostal] = useState('');
  const [nuevoClienteFechaCumpleanos, setNuevoClienteFechaCumpleanos] = useState('');
  const [enviarInvitacion, setEnviarInvitacion] = useState(false);
  const [canalInvitacion, setCanalInvitacion] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');
  const [marcaSeleccionadaInvitacion, setMarcaSeleccionadaInvitacion] = useState('hoypecamos'); // Marca madre por defecto
  
  const [modalExportar, setModalExportar] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState<'clientes' | 'facturas' | 'valoraciones' | 'promociones'>('clientes');
  const [modalVerProducto, setModalVerProducto] = useState(false);
  const [tabDetallesProducto, setTabDetallesProducto] = useState('general');
  
  // Estados para exportación personalizada de cliente individual
  const [modalExportarClientePersonalizado, setModalExportarClientePersonalizado] = useState(false);
  const [clienteParaExportar, setClienteParaExportar] = useState<Cliente | null>(null);
  const [camposExportacion, setCamposExportacion] = useState({
    datosBasicos: true,
    datosContacto: true,
    direccion: true,
    estadisticas: true,
    historialPedidos: true,
    promociones: true,
    valoraciones: true,
    anotaciones: true,
    preferencias: true,
    segmentacion: true
  });
  
  // Filtros superiores comunes - Se pasan a todas las consultas de datos
  const [filtroFamilia, setFiltroFamilia] = useState<string>('todas');
  const [filtroMarca, setFiltroMarca] = useState<string>('todas');
  const [filtroPDV, setFiltroPDV] = useState<string[]>([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState<'7' | '30' | '90' | 'mes' | 'ano'>('30');
  const [filtroCanal, setFiltroCanal] = useState<'todos' | 'tpv' | 'online'>('todos');
  const [modalNuevoProducto, setModalNuevoProducto] = useState(false);
  const [tabNuevoProducto, setTabNuevoProducto] = useState('general');
  const [tipoProducto, setTipoProducto] = useState<'simple' | 'manufacturado' | 'combo'>('simple');
  const [pasoActual, setPasoActual] = useState(1); // Wizard de 1 a 5 (añadido paso 5 para resumen)
  const [precioCoste, setPrecioCoste] = useState(0);
  const [precioCosteAuto, setPrecioCosteAuto] = useState(0); // Calculado automáticamente de ingredientes
  const [multiplicador, setMultiplicador] = useState(3);
  const [pvpCalculado, setPvpCalculado] = useState(0);
  const [pvpManual, setPvpManual] = useState<number | null>(null); // PVP modificado manualmente
  const [ivaSeleccionado, setIvaSeleccionado] = useState('21');
  const [visibilidadApp, setVisibilidadApp] = useState(true);
  const [visibilidadTPV, setVisibilidadTPV] = useState(true);
  
  // Estados para filtros y ordenamiento en tabla de productos
  const [busquedaPRD, setBusquedaPRD] = useState('');
  const [busquedaDescripcion, setBusquedaDescripcion] = useState('');
  const [ordenColumna, setOrdenColumna] = useState<string | null>(null);
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');
  
  // Estados para filtros y ordenamiento en tabla de facturas
  const [busquedaFacturaID, setBusquedaFacturaID] = useState('');
  const [busquedaFacturaCliente, setBusquedaFacturaCliente] = useState('');
  const [busquedaFacturaPDV, setBusquedaFacturaPDV] = useState('');
  const [busquedaFacturaMetodoPago, setBusquedaFacturaMetodoPago] = useState('');
  const [ordenFacturaColumna, setOrdenFacturaColumna] = useState<string | null>(null);
  const [ordenFacturaDireccion, setOrdenFacturaDireccion] = useState<'asc' | 'desc'>('asc');
  
  // Estados para filtros y ordenamiento en tabla de clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaCodigoPostal, setBusquedaCodigoPostal] = useState('');
  const [ordenClienteColumna, setOrdenClienteColumna] = useState<string | null>(null);
  const [ordenClienteDireccion, setOrdenClienteDireccion] = useState<'asc' | 'desc'>('desc');
  
  // Estados para filtros y ordenamiento en tabla de promociones
  const [busquedaPromoNombre, setBusquedaPromoNombre] = useState('');
  const [busquedaPromoTipo, setBusquedaPromoTipo] = useState('');
  const [ordenPromoColumna, setOrdenPromoColumna] = useState<string | null>(null);
  const [ordenPromoDireccion, setOrdenPromoDireccion] = useState<'asc' | 'desc'>('desc');
  
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<{id: string; nombre: string; precio: number; cantidad: number}[]>([]);
  const [productosComboSeleccionados, setProductosComboSeleccionados] = useState<{id: string; nombre: string; precio: number; precioCoste: number}[]>([]);
  const [articuloBaseSeleccionado, setArticuloBaseSeleccionado] = useState<ArticuloStock | null>(null);
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [busquedaCombo, setBusquedaCombo] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [imagenProducto, setImagenProducto] = useState('');
  const [stockMinimo, setStockMinimo] = useState(5);
  const [stockActual, setStockActual] = useState(20);
  const [stockMaximo, setStockMaximo] = useState(50);
  
  // Estados para Modal Crear Promoción
  const [nuevaPromocion, setNuevaPromocion] = useState({
    titulo: '',
    descripcion: '',
    descuento: '',
    validoHasta: ''
  });
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    general: true,
    precios: false,
    ingredientes: false,
    promocion: false,
    stock: false,
    visibilidad: false
  });
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    esAutonomoEmpresa: false,
    cif: '',
    nombreFiscal: '',
    enviarApp: true,
    direccion: ''
  });
  const [anotaciones, setAnotaciones] = useState([
    {
      id: '1',
      fecha: '25/11/2024',
      hora: '10:30',
      pdv: 'PV001 - Centro',
      usuario: 'María García (Gerente)',
      texto: 'Cliente preferente. Suele hacer pedidos los martes y viernes por la mañana.'
    }
  ]);
  const [clientesState, setClientesState] = useState<Cliente[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // ========================================================================
  // CARGAR CLIENTES DESDE API
  // ========================================================================
  useEffect(() => {
    const cargarDatos = async () => {
      setCargandoDatos(true);
      console.log('🔄 Cargando clientes y productos desde API...');
      
      try {
        // Cargar clientes
        const clientesAPI = await clientesApi.getAll();
        console.log('✅ Clientes recibidos:', clientesAPI.length);
        
        const clientesTransformados: Cliente[] = clientesAPI.map((c: any) => ({
          id: c.id.toString(),
          nombre: c.nombre || 'Sin nombre',
          foto: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.nombre}`,
          codigoPostal: c.ciudad || '00000',
          numeroPedidos: c.pedidos?.length || 0,
          ticketMedio: c.pedidos?.length > 0 ? c.pedidos.reduce((sum: number, p: any) => sum + (p.total || 0), 0) / c.pedidos.length : 0,
          ticketMedioAnterior: 0,
          valoracion: 5,
          ultimaCompra: c.pedidos?.[0]?.fecha || new Date().toISOString(),
          promocion: false,
          tipo: 'Regular' as const,
          email: c.email || '',
          telefono: c.telefono || '',
          direccion: c.direcciones?.[0]?.calle || '',
          segmentos: [],
          pdvsVisitados: 1,
          gastoTotal: c.pedidos?.reduce((sum: number, p: any) => sum + (p.total || 0), 0) || 0,
          frecuenciaCompra: 'Ocasional' as const,
          marcaFavorita: '',
          productoFavorito: '',
          pdvHabitual: ''
        }));
        
        setClientesState(clientesTransformados);
        
        // Cargar productos
        const productosAPI = await productosApi.getAll();
        console.log('✅ Productos recibidos:', productosAPI.length);
        
        const productosTransformados: Producto[] = productosAPI.map((p: any) => ({
          id: p.id.toString(),
          nombre: p.nombre || 'Sin nombre',
          descripcion: p.descripcion || '',
          precio: p.precio || 0,
          stock: p.stock || 0,
          imagen: p.imagen || undefined
        }));
        
        setProductosState(productosTransformados);
        
        // Cargar promociones
        const promocionesAPI = await promocionesApi.getAll();
        console.log('✅ Promociones recibidas:', promocionesAPI.length);
        setPromocionesState(promocionesAPI);
        
        toast.success(`✅ Datos cargados: ${clientesTransformados.length} clientes, ${productosTransformados.length} productos y ${promocionesAPI.length} promociones`);
        
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        toast.error('❌ Error al conectar con la API. Verifica que el servidor esté funcionando.');
      } finally {
        setCargandoDatos(false);
      }
    };
    
    cargarDatos();
  }, []);

  // ========================================================================
  // ESTADO DE PRODUCTOS (CARGADOS EN EL MISMO useEffect QUE CLIENTES)
  // ========================================================================
  const [productosState, setProductosState] = useState<Producto[]>([]);

  // ========================================================================
  // ESTADO DE PROMOCIONES (CARGADAS DESDE LA API)
  // ========================================================================
  const [promocionesState, setPromocionesState] = useState<PromocionAPI[]>([]);

  const handleTogglePromocion = (clienteId: string) => {
    setClientesState(clientesState.map(c => 
      c.id === clienteId ? { ...c, promocion: !c.promocion } : c
    ));
    const cliente = clientesState.find(c => c.id === clienteId);
    if (cliente) {
      toast.success(`Promoción ${!cliente.promocion ? 'activada' : 'desactivada'} para ${cliente.nombre}`);
    }
  };

  const handleAñadirPromocion = async () => {
    if (!nuevaPromocion.titulo || !nuevaPromocion.descripcion || !nuevaPromocion.descuento) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }
    
    try {
      // Si no hay fecha, usar 30 días desde ahora
      let fechaValida = nuevaPromocion.validoHasta;
      if (!fechaValida) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 30);
        fechaValida = fecha.toISOString();
      } else if (!fechaValida.includes('T')) {
        // Si es solo la fecha (YYYY-MM-DD), agregar T00:00:00Z
        fechaValida = fechaValida + 'T23:59:59Z';
      }

      const promocionParaCrear: Omit<PromocionAPI, 'id'> = {
        titulo: nuevaPromocion.titulo,
        descripcion: nuevaPromocion.descripcion,
        descuento: nuevaPromocion.descuento,
        validoHasta: fechaValida
      };

      console.log('📤 Enviando promoción al servidor:', JSON.stringify(promocionParaCrear, null, 2));
      const nuevaPromocionCreada = await promocionesApi.create(promocionParaCrear);
      
      // Actualizar el estado local
      setPromocionesState(prev => [...prev, nuevaPromocionCreada]);
      
      toast.success(`Promoción "${nuevaPromocion.titulo}" creada correctamente`);
      setModalAñadirPromocion(false);
      setNuevaPromocion({ 
        titulo: '', 
        descripcion: '', 
        descuento: '', 
        validoHasta: '' 
      });
      
      console.log('📤 EVENTO: PROMOCION_CREADA', { promocion: nuevaPromocionCreada });
      
    } catch (error) {
      console.error('Error al crear promoción:', error);
      toast.error('Error al crear la promoción');
    }
  };

  // Calcular automáticamente el precio de coste según el tipo de producto
  useEffect(() => {
    let total = 0;
    
    if (tipoProducto === 'simple' && articuloBaseSeleccionado) {
      // Producto Simple: Precio de coste del artículo de stock
      total = articuloBaseSeleccionado.precioCoste;
    } else if (tipoProducto === 'manufacturado') {
      // Producto Manufacturado: Suma de artículos × cantidades (receta)
      total = ingredientesSeleccionados.reduce((sum, ing) => sum + (ing.precio * ing.cantidad), 0);
    } else if (tipoProducto === 'combo') {
      // Combo: Suma del coste estimado de cada producto
      total = productosComboSeleccionados.reduce((sum, prod) => sum + prod.precioCoste, 0);
    }
    
    setPrecioCosteAuto(Number(total.toFixed(2)));
  }, [ingredientesSeleccionados, articuloBaseSeleccionado, productosComboSeleccionados, tipoProducto]);

  // Calcular automáticamente el PVP cuando cambie el precio de coste o multiplicador
  useEffect(() => {
    if (pvpManual === null) {
      const pvp = (precioCoste || precioCosteAuto) * multiplicador;
      setPvpCalculado(Number(pvp.toFixed(2)));
    }
  }, [precioCoste, precioCosteAuto, multiplicador, pvpManual]);

  const clientes = clientesState;

  const facturas: Factura[] = [
    {
      id: 'COM-001',
      clienteId: 'CLI-0013',
      clienteNombre: 'Ana García',
      fecha: '2025-11-15T10:30:00',
      total: 45.90,
      productos: ['Pan de Pueblo 1kg', 'Baguette Tradicional 250g'],
      verifactu: true,
      metodoPago: 'Tarjeta'
    },
    {
      id: 'COM-002',
      clienteId: 'CLI-0015',
      clienteNombre: 'Laura Martínez',
      fecha: '2025-11-14T15:20:00',
      total: 28.50,
      productos: ['Croissants Mantequilla 6u', 'Ensaimadas 4u'],
      verifactu: true,
      metodoPago: 'Efectivo'
    },
    {
      id: 'COM-003',
      clienteId: 'CLI-0011',
      clienteNombre: 'María López',
      fecha: '2025-11-13T09:15:00',
      total: 38.60,
      productos: ['Pan Integral 1kg', 'Magdalenas 12u'],
      verifactu: true,
      metodoPago: 'Online'
    },
    {
      id: 'COM-004',
      clienteId: 'CLI-0014',
      clienteNombre: 'Carlos Hernández',
      fecha: '2025-11-12T14:45:00',
      total: 32.80,
      productos: ['Napolitanas Chocolate 6u', 'Palmeras 8u'],
      verifactu: true,
      metodoPago: 'Mixto'
    },
  ];

  const envios: Envio[] = [
    {
      id: 'ENV-001',
      clienteId: 'CLI-0013',
      clienteNombre: 'Ana García',
      fecha: '2025-11-15T10:30:00',
      estado: 'Recibido',
      direccion: 'Calle Mayor 45, 28008 Madrid',
      productos: 'Pan de Pueblo 1kg, Baguette Tradicional 250g'
    },
    {
      id: 'ENV-002',
      clienteId: 'CLI-0015',
      clienteNombre: 'Laura Martínez',
      fecha: '2025-11-14T15:20:00',
      estado: 'Enviado',
      direccion: 'Av. de la Castellana 120, 28001 Madrid',
      productos: 'Croissants Mantequilla 6u, Ensaimadas 4u'
    },
    {
      id: 'ENV-003',
      clienteId: 'CLI-0011',
      clienteNombre: 'María López',
      fecha: '2025-11-13T09:15:00',
      estado: 'Preparado',
      direccion: 'Plaza España 8, 28003 Madrid',
      productos: 'Pan Integral 1kg, Magdalenas 12u'
    },
    {
      id: 'ENV-004',
      clienteId: 'CLI-0014',
      clienteNombre: 'Carlos Hernández',
      fecha: '2025-11-12T14:45:00',
      estado: 'Solicitado',
      direccion: 'Calle Alcalá 200, 28015 Madrid',
      productos: 'Napolitanas Chocolate 6u, Palmeras 8u'
    },
  ];

  const valoraciones: Valoracion[] = [
    {
      id: 'VAL-001',
      clienteId: 'CLI-0013',
      clienteNombre: 'Ana García',
      productoId: 'PROD-001',
      productoNombre: 'Pan de Pueblo Artesanal',
      puntuacion: 5,
      comentario: 'Excelente pan, corteza crujiente y miga esponjosa. Perfecto para tostadas.',
      fecha: '2025-11-15T11:00:00'
    },
    {
      id: 'VAL-002',
      clienteId: 'CLI-0015',
      clienteNombre: 'Laura Martínez',
      productoId: 'PROD-009',
      productoNombre: 'Croissants Mantequilla',
      puntuacion: 5,
      comentario: 'Mis favoritos para el desayuno. Crujientes y con mucha mantequilla.',
      fecha: '2025-11-14T16:00:00'
    },
    {
      id: 'VAL-003',
      clienteId: 'CLI-0011',
      clienteNombre: 'María López',
      productoId: 'PROD-002',
      productoNombre: 'Pan Integral Masa Madre',
      puntuacion: 5,
      comentario: 'Increíble sabor y textura. Perfecto para una dieta saludable.',
      fecha: '2025-11-13T10:30:00'
    },
    {
      id: 'VAL-004',
      clienteId: 'CLI-0014',
      clienteNombre: 'Carlos Hernández',
      productoId: 'PROD-005',
      productoNombre: 'Napolitanas de Chocolate',
      puntuacion: 4,
      comentario: 'Muy buenas, aunque me gustaría más chocolate. El hojaldre es excelente.',
      fecha: '2025-11-12T15:30:00'
    },
    {
      id: 'VAL-005',
      clienteId: 'CLI-0010',
      clienteNombre: 'Javier Torres',
      productoId: 'PROD-003',
      productoNombre: 'Ensaimadas Mallorquinas',
      puntuacion: 5,
      comentario: 'Espectacular. Suaves, esponjosas y con el punto justo de azúcar.',
      fecha: '2025-11-11T09:00:00'
    },
  ];

  const getTipoBadge = (tipo: 'Nuevo' | 'Regular' | 'Fidelizado' | 'Puntual') => {
    switch (tipo) {
      case 'Nuevo':
        return <Badge className="bg-blue-500 text-white">Nuevo</Badge>;
      case 'Regular':
        return <Badge variant="outline" className="border-teal-500 text-teal-700 bg-teal-50">Regular</Badge>;
      case 'Fidelizado':
        return <Badge className="bg-purple-600 text-white">Fidelizado</Badge>;
      case 'Puntual':
        return <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50">Puntual</Badge>;
      default:
        return <Badge variant="outline">Regular</Badge>;
    }
  };

  const getSegmentoBadge = (segmento: string) => {
    switch (segmento) {
      case 'VIP':
        return <Badge key={segmento} className="bg-amber-500 text-white text-xs">VIP</Badge>;
      case 'Alta frecuencia':
        return <Badge key={segmento} className="bg-green-500 text-white text-xs">Alta frecuencia</Badge>;
      case 'Multitienda':
        return <Badge key={segmento} variant="outline" className="border-indigo-500 text-indigo-700 bg-indigo-50 text-xs">Multitienda</Badge>;
      case 'En riesgo':
        return <Badge key={segmento} className="bg-red-500 text-white text-xs">En riesgo</Badge>;
      case 'En Promoción':
        return <Badge key={segmento} variant="outline" className="border-pink-500 text-pink-700 bg-pink-50 text-xs">En Promoción</Badge>;
      default:
        return <Badge key={segmento} variant="outline" className="text-xs">{segmento}</Badge>;
    }
  };

  const getEstadoEnvioBadge = (estado: string) => {
    switch (estado) {
      case 'Solicitado':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Solicitado</Badge>;
      case 'Preparado':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Preparado</Badge>;
      case 'Enviado':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Enviado</Badge>;
      case 'Recibido':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Recibido</Badge>;
      default:
        return null;
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Alias para compatibilidad
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderValoracion = (valoracion: number) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-medium text-gray-900">
          {valoracion.toFixed(1)}/5
        </span>
      </div>
    );
  };

  const renderValoracionCompleta = (valoracion: number) => {
    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < valoracion
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getTicketMedioIndicador = (ticketMedio: number, ticketMedioAnterior: number) => {
    if (ticketMedio > ticketMedioAnterior) {
      return (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-teal-600">
            €{ticketMedio.toFixed(2)}
          </span>
        </div>
      );
    } else if (ticketMedio < ticketMedioAnterior) {
      return (
        <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-gray-600">
            €{ticketMedio.toFixed(2)}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-600">
            €{ticketMedio.toFixed(2)}
          </span>
        </div>
      );
    }
  };

  // ============================================
  // CÁLCULOS DINÁMICOS CON useMemo
  // ============================================
  
  const estadisticas = useMemo(() => {
    // GRUPO 1: TOTALES BÁSICOS
    const totalClientes = clientes.length;
    const clientesActivos = clientes.filter(c => {
      const diasDesdeUltimaCompra = Math.floor(
        (new Date().getTime() - new Date(c.ultimaCompra).getTime()) / (1000 * 60 * 60 * 24)
      );
      return diasDesdeUltimaCompra <= 90; // Activos si compraron en últimos 90 días
    }).length;
    const clientesInactivos = totalClientes - clientesActivos;
    const porcentajeActivos = totalClientes > 0 ? (clientesActivos / totalClientes) * 100 : 0;
    
    // GRUPO 2: SEGMENTACIÓN POR TIPO
    const clientesNuevos = clientes.filter(c => c.tipo === 'Nuevo').length;
    const clientesRegulares = clientes.filter(c => c.tipo === 'Regular').length;
    const clientesFidelizados = clientes.filter(c => c.tipo === 'Fidelizado').length;
    const clientesVIP = clientes.filter(c => c.segmentos && Array.isArray(c.segmentos) && c.segmentos.includes('VIP')).length;
    const clientesPuntual = clientes.filter(c => c.tipo === 'Puntual').length;
    const porcentajeVIP = totalClientes > 0 ? (clientesVIP / totalClientes) * 100 : 0;
    const porcentajeFidelizados = totalClientes > 0 ? (clientesFidelizados / totalClientes) * 100 : 0;
    
    // GRUPO 3: CÁLCULOS FINANCIEROS
    const totalPedidos = clientes.reduce((acc, c) => acc + c.numeroPedidos, 0);
    const gastoTotalClientes = clientes.reduce((acc, c) => acc + c.gastoTotal, 0);
    
    // Ticket medio ponderado (correcto): Total gastado / Total pedidos
    const ticketMedioGlobal = totalPedidos > 0 
      ? gastoTotalClientes / totalPedidos 
      : 0;
    
    // Ticket medio por cliente
    const ticketMedioPorCliente = totalClientes > 0
      ? gastoTotalClientes / totalClientes
      : 0;
    
    const pedidosPromedioPorCliente = totalClientes > 0
      ? totalPedidos / totalClientes
      : 0;
    
    // GRUPO 4: ANÁLISIS DE PROMOCIONES
    const clientesConPromocion = clientes.filter(c => c.promocion).length;
    const clientesSinPromocion = totalClientes - clientesConPromocion;
    const porcentajePromocionados = totalClientes > 0 
      ? (clientesConPromocion / totalClientes) * 100 
      : 0;
    
    const gastoClientesConPromocion = clientes
      .filter(c => c.promocion)
      .reduce((acc, c) => acc + c.gastoTotal, 0);
    
    const ticketMedioPromocionados = clientesConPromocion > 0
      ? gastoClientesConPromocion / clientesConPromocion
      : 0;
    
    // GRUPO 5: ANÁLISIS DE TENDENCIAS
    const clientesConCrecimiento = clientes.filter(c => c.ticketMedio > c.ticketMedioAnterior).length;
    const clientesConDecrecimiento = clientes.filter(c => c.ticketMedio < c.ticketMedioAnterior).length;
    const clientesEstables = totalClientes - clientesConCrecimiento - clientesConDecrecimiento;
    const porcentajeCrecimiento = totalClientes > 0
      ? (clientesConCrecimiento / totalClientes) * 100
      : 0;
    const porcentajeDecrecimiento = totalClientes > 0
      ? (clientesConDecrecimiento / totalClientes) * 100
      : 0;
    
    // GRUPO 6: ANÁLISIS FRECUENCIA Y SEGMENTOS
    const clientesAltaFrecuencia = clientes.filter(c => c.segmentos && Array.isArray(c.segmentos) && c.segmentos.includes('Alta frecuencia')).length;
    const clientesEnRiesgo = clientes.filter(c => c.segmentos && Array.isArray(c.segmentos) && c.segmentos.includes('En riesgo')).length;
    const clientesMultitienda = clientes.filter(c => c.segmentos && Array.isArray(c.segmentos) && c.segmentos.includes('Multitienda')).length;
    const porcentajeAltaFrecuencia = totalClientes > 0
      ? (clientesAltaFrecuencia / totalClientes) * 100
      : 0;
    const porcentajeEnRiesgo = totalClientes > 0
      ? (clientesEnRiesgo / totalClientes) * 100
      : 0;
    
    // GRUPO 7: VALORACIÓN Y SATISFACCIÓN
    const valoracionPromedio = totalClientes > 0
      ? clientes.reduce((acc, c) => acc + c.valoracion, 0) / totalClientes
      : 0;
    
    const clientesCon5Estrellas = clientes.filter(c => c.valoracion === 5).length;
    const clientesCon4Estrellas = clientes.filter(c => c.valoracion === 4).length;
    const clientesCon3Estrellas = clientes.filter(c => c.valoracion === 3).length;
    const porcentajeSatisfaccion = totalClientes > 0
      ? ((clientesCon5Estrellas + clientesCon4Estrellas) / totalClientes) * 100
      : 0;
    
    // GRUPO 8: PDVs Y DISTRIBUCIÓN
    const pdvsVisitadosPromedio = totalClientes > 0
      ? clientes.reduce((acc, c) => acc + c.pdvsVisitados, 0) / totalClientes
      : 0;
    
    const pdvsVisitadosTotal = clientes.reduce((acc, c) => acc + c.pdvsVisitados, 0);
    const porcentajeMultitienda = totalClientes > 0
      ? (clientesMultitienda / totalClientes) * 100
      : 0;
    
    return {
      // Grupo 1: Totales básicos
      totalClientes,
      clientesActivos,
      clientesInactivos,
      porcentajeActivos,
      
      // Grupo 2: Segmentación
      clientesNuevos,
      clientesRegulares,
      clientesFidelizados,
      clientesVIP,
      clientesPuntual,
      porcentajeVIP,
      porcentajeFidelizados,
      
      // Grupo 3: Financieros
      totalPedidos,
      gastoTotalClientes,
      ticketMedioGlobal,
      ticketMedioPorCliente,
      pedidosPromedioPorCliente,
      
      // Grupo 4: Promociones
      clientesConPromocion,
      clientesSinPromocion,
      porcentajePromocionados,
      gastoClientesConPromocion,
      ticketMedioPromocionados,
      
      // Grupo 5: Tendencias
      clientesConCrecimiento,
      clientesConDecrecimiento,
      clientesEstables,
      porcentajeCrecimiento,
      porcentajeDecrecimiento,
      
      // Grupo 6: Frecuencia
      clientesAltaFrecuencia,
      clientesEnRiesgo,
      clientesMultitienda,
      porcentajeAltaFrecuencia,
      porcentajeEnRiesgo,
      
      // Grupo 7: Valoración
      valoracionPromedio,
      clientesCon5Estrellas,
      clientesCon4Estrellas,
      clientesCon3Estrellas,
      porcentajeSatisfaccion,
      
      // Grupo 8: PDVs
      pdvsVisitadosPromedio,
      pdvsVisitadosTotal,
      porcentajeMultitienda
    };
  }, [clientes]);
  
  // Extraer variables para uso en el componente
  const {
    totalClientes,
    clientesActivos,
    clientesNuevos,
    clientesRegulares,
    clientesFidelizados,
    clientesVIP,
    totalPedidos,
    gastoTotalClientes,
    ticketMedioGlobal,
    ticketMedioPorCliente,
    clientesConPromocion,
    porcentajePromocionados,
    clientesConCrecimiento,
    clientesConDecrecimiento,
    porcentajeCrecimiento,
    clientesAltaFrecuencia,
    clientesEnRiesgo,
    clientesMultitienda,
    valoracionPromedio,
    pdvsVisitadosPromedio
  } = estadisticas;

  // Filtrar clientes según filtros superiores
  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes];

    // 🔍 FILTRO 1: MARCA (Estado)
    // En producción: filtrar por marca_id desde BBDD
    // Ejemplo: WHERE marca_id = ? (si filtroMarca !== 'todas')
    if (filtroMarca !== 'todas') {
      // MOCK: Como no tenemos marca_id en clientes, por ahora mostramos todos
      // TODO Backend: resultado = resultado.filter(c => c.marca_id === filtroMarca);
    }

    // 🔍 FILTRO 2: PDV (Punto de Venta)
    // En producción: filtrar por PDV desde BBDD
    // Ejemplo: WHERE pdv_id IN (?) (si filtroPDV.length > 0)
    if (filtroPDV && filtroPDV.length > 0) {
      // MOCK: Como no tenemos pdv_id en clientes, por ahora mostramos todos
      // TODO Backend: resultado = resultado.filter(c => filtroPDV.includes(c.pdv_habitual_id));
    }

    // 🔍 FILTRO 3: PERIODO (Fecha de última compra)
    // En producción: filtrar por fecha_ultimo_pedido desde BBDD
    // Ejemplo: WHERE fecha_ultimo_pedido >= DATE_SUB(NOW(), INTERVAL ? DAY)
    if (filtroPeriodo) {
      const dias = filtroPeriodo === '7' ? 7 : 
                   filtroPeriodo === '30' ? 30 : 
                   filtroPeriodo === '90' ? 90 : 
                   filtroPeriodo === 'mes' ? 30 : 365;
      
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - dias);

      resultado = resultado.filter(c => {
        const fechaUltimaCompra = new Date(c.ultimaCompra);
        return fechaUltimaCompra >= fechaLimite;
      });
    }

    // 🔍 FILTRO 4: CANAL (TPV u Online)
    // En producción: filtrar por canal desde BBDD mediante JOIN con FACTURA
    // Ejemplo: INNER JOIN FACTURA f ON c.id_cliente = f.id_cliente WHERE f.canal = ?
    if (filtroCanal !== 'todos') {
      // MOCK: Como no tenemos canal en clientes, por ahora mostramos todos
      // TODO Backend: 
      // resultado = resultado.filter(c => c.canal_preferido === filtroCanal);
    }

    // 🔍 FILTRO 5: BÚSQUEDA POR NOMBRE/ID DE CLIENTE
    if (busquedaCliente.trim()) {
      resultado = resultado.filter(c => 
        c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.id.toLowerCase().includes(busquedaCliente.toLowerCase())
      );
    }

    // 🔍 FILTRO 6: BÚSQUEDA POR CÓDIGO POSTAL
    if (busquedaCodigoPostal.trim()) {
      resultado = resultado.filter(c => 
        c.codigoPostal.includes(busquedaCodigoPostal)
      );
    }

    // 🔢 ORDENAMIENTO
    if (ordenClienteColumna) {
      resultado.sort((a, b) => {
        let valorA: any;
        let valorB: any;

        switch (ordenClienteColumna) {
          case 'nombre':
            valorA = a.nombre.toLowerCase();
            valorB = b.nombre.toLowerCase();
            break;
          case 'codigoPostal':
            valorA = a.codigoPostal;
            valorB = b.codigoPostal;
            break;
          case 'numeroPedidos':
            valorA = a.numeroPedidos;
            valorB = b.numeroPedidos;
            break;
          case 'ticketMedio':
            valorA = a.ticketMedio;
            valorB = b.ticketMedio;
            break;
          case 'valoracion':
            valorA = a.valoracion;
            valorB = b.valoracion;
            break;
          case 'ultimaCompra':
            valorA = new Date(a.ultimaCompra).getTime();
            valorB = new Date(b.ultimaCompra).getTime();
            break;
          default:
            return 0;
        }

        if (valorA < valorB) return ordenClienteDireccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenClienteDireccion === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return resultado;
  }, [clientes, filtroMarca, filtroPDV, filtroPeriodo, filtroCanal, busquedaCliente, busquedaCodigoPostal, ordenClienteColumna, ordenClienteDireccion]);

  // Función para manejar ordenamiento de clientes
  const handleOrdenarClientes = (columna: string) => {
    if (ordenClienteColumna === columna) {
      // Si ya está ordenado por esta columna, cambiar dirección
      setOrdenClienteDireccion(ordenClienteDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una nueva columna, ordenar ascendente
      setOrdenClienteColumna(columna);
      setOrdenClienteDireccion('asc');
    }
  };

  // Función para exportar datos de cliente individual
  const handleExportarCliente = (cliente: Cliente, formato: 'excel' | 'csv' | 'pdf') => {
    console.log('📤 EVENTO: EXPORTAR_DATOS_CLIENTE', {
      id_cliente: cliente.id,
      formato: formato,
      timestamp: new Date()
    });

    // Preparar datos del cliente para exportación
    const datosExportacion = {
      // Información básica
      ID: cliente.id,
      Nombre: cliente.nombre,
      'Código Postal': cliente.codigoPostal,
      Email: cliente.email || 'No especificado',
      Teléfono: cliente.telefono || 'No especificado',
      Dirección: cliente.direccion || 'No especificada',
      
      // Métricas
      'Nº Pedidos': cliente.numeroPedidos,
      'Ticket Medio': `€${cliente.ticketMedio.toFixed(2)}`,
      'Gasto Total': `€${cliente.gastoTotal.toFixed(2)}`,
      'Valoración': `${cliente.valoracion}/5`,
      'Última Compra': formatFecha(cliente.ultimaCompra),
      'Fecha Alta': cliente.fechaAlta,
      
      // Segmentación
      Tipo: cliente.tipo,
      Segmentos: cliente.segmentos && cliente.segmentos.length > 0 ? cliente.segmentos.join(', ') : 'Ninguno',
      'En Promoción': cliente.promocion ? 'Sí' : 'No',
      
      // Preferencias
      'PDVs Visitados': cliente.pdvsVisitados || 0,
      'Frecuencia de Compra': cliente.frecuenciaCompra || 'No especificada',
      'Marca Favorita': cliente.marcaFavorita || 'No especificada',
      'Producto Favorito': cliente.productoFavorito || 'No especificado',
      'PDV Habitual': cliente.pdvHabitual || 'No especificado'
    };

    // Simular exportación según formato
    if (formato === 'excel') {
      toast.success(`📊 Exportando datos de ${cliente.nombre} a Excel...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: Aquí se haría la llamada a API para generar Excel
      // await generarExcel(datosExportacion, `cliente_${cliente.id}.xlsx`);
    } else if (formato === 'csv') {
      toast.success(`📄 Exportando datos de ${cliente.nombre} a CSV...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: Aquí se haría la llamada a API para generar CSV
      // await generarCSV(datosExportacion, `cliente_${cliente.id}.csv`);
    } else if (formato === 'pdf') {
      toast.success(`📑 Exportando datos de ${cliente.nombre} a PDF...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: Aquí se haría la llamada a API para generar PDF
      // await generarPDF(datosExportacion, `cliente_${cliente.id}.pdf`);
    }

    console.log('📋 Datos preparados para exportación:', datosExportacion);
  };

  // Función para abrir modal de exportación personalizada
  const abrirModalExportacionPersonalizada = (cliente: Cliente) => {
    setClienteParaExportar(cliente);
    setModalExportarClientePersonalizado(true);
    // Resetear checkboxes a todos seleccionados
    setCamposExportacion({
      datosBasicos: true,
      datosContacto: true,
      direccion: true,
      estadisticas: true,
      historialPedidos: true,
      promociones: true,
      valoraciones: true,
      anotaciones: true,
      preferencias: true,
      segmentacion: true
    });
  };

  // Función para exportar con campos personalizados
  const handleExportarPersonalizado = (formato: 'excel' | 'csv' | 'pdf') => {
    if (!clienteParaExportar) return;

    // Preparar datos según campos seleccionados
    const datosExportacion: any = {};

    if (camposExportacion.datosBasicos) {
      datosExportacion.datosBasicos = {
        id_cliente: clienteParaExportar.id,
        nombre_completo: clienteParaExportar.nombre,
        fecha_alta: 'Fecha de alta del cliente',
        tipo_cliente: 'Tipo de cliente (nuevo, regular, VIP, etc.)'
      };
    }

    if (camposExportacion.datosContacto) {
      datosExportacion.datosContacto = {
        email: 'email@cliente.com',
        telefono: '+34 XXX XXX XXX',
        fecha_cumpleanos: 'DD/MM/YYYY'
      };
    }

    if (camposExportacion.direccion) {
      datosExportacion.direccion = {
        direccion_completa: clienteParaExportar.codigoPostal,
        codigo_postal: clienteParaExportar.codigoPostal,
        ciudad: 'Ciudad',
        provincia: 'Provincia'
      };
    }

    if (camposExportacion.estadisticas) {
      datosExportacion.estadisticas = {
        numero_pedidos: clienteParaExportar.numeroPedidos,
        ticket_medio: clienteParaExportar.ticketMedio,
        gasto_total: clienteParaExportar.numeroPedidos * clienteParaExportar.ticketMedio,
        ultima_compra: clienteParaExportar.ultimaCompra,
        valoracion_media: clienteParaExportar.valoracion
      };
    }

    if (camposExportacion.historialPedidos) {
      datosExportacion.historialPedidos = [
        { fecha: '2025-01-15', total: 45.50, productos: 'Pizza Margherita, Coca Cola' },
        { fecha: '2025-02-20', total: 32.80, productos: 'Burger Clásica, Patatas' }
      ];
    }

    if (camposExportacion.promociones) {
      datosExportacion.promociones = [
        { nombre: 'Promo Cumpleaños', estado: 'Enviada', fecha: '2025-03-10' },
        { nombre: '2x1 Pizzas', estado: 'Canjeada', fecha: '2025-02-15' }
      ];
    }

    if (camposExportacion.valoraciones) {
      datosExportacion.valoraciones = [
        { fecha: '2025-01-16', puntuacion: 5, comentario: 'Excelente servicio' },
        { fecha: '2025-02-21', puntuacion: 4, comentario: 'Muy bueno' }
      ];
    }

    if (camposExportacion.anotaciones) {
      datosExportacion.anotaciones = [
        { fecha: '2025-01-10', autor: 'Gerente', nota: 'Cliente preferente' }
      ];
    }

    if (camposExportacion.preferencias) {
      datosExportacion.preferencias = {
        pdv_habitual: 'Tiana',
        marca_preferida: 'Hoy Pecamos',
        productos_favoritos: ['Pizza Margherita', 'Burger Clásica']
      };
    }

    if (camposExportacion.segmentacion) {
      datosExportacion.segmentacion = {
        segmentos: ['VIP', 'Alta Frecuencia'],
        canal_preferido: 'Online',
        frecuencia_compra: 'Semanal'
      };
    }

    console.log('📤 EVENTO: EXPORTACION_PERSONALIZADA_CLIENTE', {
      id_cliente: clienteParaExportar.id,
      formato: formato,
      campos_seleccionados: Object.keys(camposExportacion).filter(key => camposExportacion[key as keyof typeof camposExportacion]),
      timestamp: new Date()
    });

    // Exportar según formato
    if (formato === 'excel') {
      toast.success(`📊 Exportando datos personalizados de ${clienteParaExportar.nombre} a Excel...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: Generar Excel con campos seleccionados
      // await generarExcelPersonalizado(datosExportacion, `cliente_${clienteParaExportar.id}_personalizado.xlsx`);
    } else if (formato === 'csv') {
      toast.success(`📄 Exportando datos personalizados de ${clienteParaExportar.nombre} a CSV...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: Generar CSV con campos seleccionados
      // await generarCSVPersonalizado(datosExportacion, `cliente_${clienteParaExportar.id}_personalizado.csv`);
    } else if (formato === 'pdf') {
      toast.success(`📑 Exportando datos personalizados de ${clienteParaExportar.nombre} a PDF...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: Generar PDF con campos seleccionados
      // await generarPDFPersonalizado(datosExportacion, `cliente_${clienteParaExportar.id}_personalizado.pdf`);
    }

    console.log('📋 Datos personalizados preparados para exportación:', datosExportacion);
    setModalExportarClientePersonalizado(false);
  };

  // Función para exportar facturas
  const handleExportarFacturas = (formato: 'excel' | 'csv' | 'pdf') => {
    const datosExportacion = {
      facturas: facturasFiltradas,
      total_facturas: facturasFiltradas.length,
      suma_total: facturasFiltradas.reduce((sum, f) => sum + f.total, 0),
      filtros_aplicados: {
        // Filtros superiores
        marca: filtroMarca,
        pdv: filtroPDV,
        periodo: filtroPeriodo,
        canal: filtroCanal,
        // Filtros de tabla
        busqueda_factura_id: busquedaFacturaID,
        busqueda_cliente: busquedaFacturaCliente,
        busqueda_pdv: busquedaFacturaPDV,
        busqueda_metodo_pago: busquedaFacturaMetodoPago,
        ordenamiento_columna: ordenFacturaColumna,
        ordenamiento_direccion: ordenFacturaDireccion
      },
      fecha_exportacion: new Date().toISOString()
    };

    console.log('📤 EVENTO: EXPORTACION_FACTURAS', {
      formato,
      num_facturas: facturasFiltradas.length,
      suma_total: datosExportacion.suma_total,
      filtros_tabla: {
        busqueda_factura_id: busquedaFacturaID,
        busqueda_cliente: busquedaFacturaCliente,
        busqueda_pdv: busquedaFacturaPDV,
        busqueda_metodo_pago: busquedaFacturaMetodoPago,
        ordenamiento: ordenFacturaColumna ? `${ordenFacturaColumna} ${ordenFacturaDireccion}` : 'ninguno'
      },
      timestamp: new Date()
    });

    if (formato === 'excel') {
      toast.success(`📊 Exportando ${facturasFiltradas.length} facturas a Excel...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: await generarExcelFacturas(datosExportacion);
    } else if (formato === 'csv') {
      toast.success(`📄 Exportando ${facturasFiltradas.length} facturas a CSV...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: await generarCSVFacturas(datosExportacion);
    } else if (formato === 'pdf') {
      toast.success(`📑 Exportando ${facturasFiltradas.length} facturas a PDF...`, {
        description: 'El archivo se descargará automáticamente'
      });
      // 🔌 CONEXIÓN BACKEND: await generarPDFFacturas(datosExportacion);
    }
  };

  // Función para ordenar facturas por columna
  const handleOrdenFactura = (columna: string) => {
    if (ordenFacturaColumna === columna) {
      setOrdenFacturaDireccion(ordenFacturaDireccion === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenFacturaColumna(columna);
      setOrdenFacturaDireccion('asc');
    }
  };

  // Filtrar y ordenar facturas
  const facturasFiltradas = useMemo(() => {
    let resultado = [...facturas];

    // Aplicar filtros de búsqueda
    if (busquedaFacturaID) {
      resultado = resultado.filter(f => 
        f.id.toLowerCase().includes(busquedaFacturaID.toLowerCase())
      );
    }
    if (busquedaFacturaCliente) {
      resultado = resultado.filter(f => 
        f.clienteNombre.toLowerCase().includes(busquedaFacturaCliente.toLowerCase())
      );
    }
    if (busquedaFacturaPDV) {
      resultado = resultado.filter(f => 
        (f.pdv || '').toLowerCase().includes(busquedaFacturaPDV.toLowerCase())
      );
    }
    if (busquedaFacturaMetodoPago) {
      resultado = resultado.filter(f => 
        f.metodoPago.toLowerCase().includes(busquedaFacturaMetodoPago.toLowerCase())
      );
    }

    // Aplicar ordenamiento
    if (ordenFacturaColumna) {
      resultado.sort((a, b) => {
        let valorA: any;
        let valorB: any;

        switch (ordenFacturaColumna) {
          case 'id':
            valorA = a.id;
            valorB = b.id;
            break;
          case 'cliente':
            valorA = a.clienteNombre;
            valorB = b.clienteNombre;
            break;
          case 'fecha':
            valorA = new Date(a.fecha);
            valorB = new Date(b.fecha);
            break;
          case 'pdv':
            valorA = a.pdv || '';
            valorB = b.pdv || '';
            break;
          case 'total':
            valorA = a.total;
            valorB = b.total;
            break;
          case 'metodoPago':
            valorA = a.metodoPago;
            valorB = b.metodoPago;
            break;
          default:
            return 0;
        }

        if (valorA < valorB) return ordenFacturaDireccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenFacturaDireccion === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return resultado;
  }, [facturas, busquedaFacturaID, busquedaFacturaCliente, busquedaFacturaPDV, busquedaFacturaMetodoPago, ordenFacturaColumna, ordenFacturaDireccion]);

  // Función para exportar clientes filtrados
  const handleExportarClientesFiltrados = (formato: 'excel' | 'csv' | 'pdf') => {
    // Preparar datos de clientes con filtros aplicados
    const datosExportacion = {
      clientes: clientesFiltrados.map(cliente => ({
        id_cliente: cliente.id,
        nombre_completo: cliente.nombre,
        codigo_postal: cliente.codigoPostal,
        num_pedidos: cliente.numeroPedidos,
        ticket_medio: cliente.ticketMedio,
        gasto_total: cliente.numeroPedidos * cliente.ticketMedio,
        valoracion: cliente.valoracion,
        ultima_compra: cliente.ultimaCompra,
        tipo_cliente: cliente.tipo,
        segmentos: cliente.segmentos?.join(', ') || '',
        en_promocion: cliente.promocion ? 'Sí' : 'No',
        telefono: 'Por definir en BBDD',
        email: 'Por definir en BBDD',
        direccion_completa: 'Por definir en BBDD',
        fecha_alta: 'Por definir en BBDD',
        pdv_habitual: 'Por definir en BBDD',
        marca_preferida: 'Por definir en BBDD'
      })),
      total_clientes: clientesFiltrados.length,
      ticket_medio_global: clientesFiltrados.length > 0 ? clientesFiltrados.reduce((sum, c) => sum + c.ticketMedio, 0) / clientesFiltrados.length : 0,
      total_pedidos: clientesFiltrados.reduce((sum, c) => sum + c.numeroPedidos, 0),
      total_facturado: clientesFiltrados.reduce((sum, c) => sum + (c.numeroPedidos * c.ticketMedio), 0),
      filtros_aplicados: {
        // Filtros superiores
        familia: filtroFamilia,
        marca: filtroMarca,
        pdv: filtroPDV,
        periodo: filtroPeriodo,
        canal: filtroCanal,
        // Filtros de tabla
        busqueda_cliente: busquedaCliente,
        busqueda_codigo_postal: busquedaCodigoPostal,
        ordenamiento_columna: ordenClienteColumna,
        ordenamiento_direccion: ordenClienteDireccion
      },
      fecha_exportacion: new Date().toISOString()
    };

    console.log('📤 EVENTO: EXPORTACION_CLIENTES_FILTRADOS', {
      formato,
      num_clientes: clientesFiltrados.length,
      total_facturado: datosExportacion.total_facturado,
      filtros_superiores: {
        familia: filtroFamilia,
        marca: filtroMarca,
        pdv: filtroPDV,
        periodo: filtroPeriodo,
        canal: filtroCanal
      },
      filtros_tabla: {
        busqueda_cliente: busquedaCliente,
        busqueda_codigo_postal: busquedaCodigoPostal,
        ordenamiento: ordenClienteColumna ? `${ordenClienteColumna} ${ordenClienteDireccion}` : 'ninguno'
      },
      timestamp: new Date()
    });

    if (formato === 'excel') {
      toast.success(`📊 Exportando ${clientesFiltrados.length} clientes a Excel...`, {
        description: 'El archivo incluye todos los datos filtrados'
      });
      // 🔌 CONEXIÓN BACKEND: await generarExcelClientes(datosExportacion);
      // Endpoint: POST /api/clientes/exportar
      // Body: { formato: 'excel', filtros: {...}, datos: [...] }
      // Response: { url_descarga: string, nombre_archivo: string }
    } else if (formato === 'csv') {
      toast.success(`📄 Exportando ${clientesFiltrados.length} clientes a CSV...`, {
        description: 'El archivo incluye todos los datos filtrados'
      });
      // 🔌 CONEXIÓN BACKEND: await generarCSVClientes(datosExportacion);
    } else if (formato === 'pdf') {
      toast.success(`📑 Exportando ${clientesFiltrados.length} clientes a PDF...`, {
        description: 'El archivo incluye todos los datos filtrados'
      });
      // 🔌 CONEXIÓN BACKEND: await generarPDFClientes(datosExportacion);
    }

    console.log('📋 Datos de clientes preparados para exportación:', datosExportacion);
  };

  // Función para exportar productos filtrados
  const handleExportarProductosFiltrados = (formato: 'excel' | 'csv' | 'pdf') => {
    // Filtrar productos según búsquedas de tabla
    let productosFiltrados = [...productosPanaderia];

    // Aplicar búsqueda por PRD
    if (busquedaPRD.trim()) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.codigo.toLowerCase().includes(busquedaPRD.toLowerCase())
      );
    }

    // Aplicar búsqueda por descripción
    if (busquedaDescripcion.trim()) {
      productosFiltrados = productosFiltrados.filter(p => 
        p.nombre.toLowerCase().includes(busquedaDescripcion.toLowerCase())
      );
    }

    // Aplicar ordenamiento si existe
    if (ordenColumna) {
      productosFiltrados.sort((a, b) => {
        let valorA: any;
        let valorB: any;

        switch (ordenColumna) {
          case 'codigo':
            valorA = a.codigo;
            valorB = b.codigo;
            break;
          case 'nombre':
            valorA = a.nombre.toLowerCase();
            valorB = b.nombre.toLowerCase();
            break;
          case 'escandallo':
            valorA = a.precioCoste;
            valorB = b.precioCoste;
            break;
          case 'pvp':
            valorA = a.precioVenta;
            valorB = b.precioVenta;
            break;
          case 'margen':
            valorA = ((a.precioVenta - a.precioCoste) / a.precioVenta * 100);
            valorB = ((b.precioVenta - b.precioCoste) / b.precioVenta * 100);
            break;
          default:
            return 0;
        }

        if (valorA < valorB) return ordenDireccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenDireccion === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Preparar datos de productos con filtros aplicados
    const datosExportacion = {
      productos: productosFiltrados.map(producto => ({
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        escandallo: producto.precioCoste,
        pvp: producto.precioVenta,
        margen_rentabilidad: ((producto.precioVenta - producto.precioCoste) / producto.precioVenta * 100).toFixed(0) + '%',
        ranking: producto.ranking || 'N/A',
        stock: producto.stock || 'Por definir',
        pdv_top: producto.pdvTop || 'Por definir',
        // Backend: Incluir stock_actual, stock_minimo, ventas_periodo, pdv_asociados
      })),
      total_productos: productosFiltrados.length,
      margen_promedio: productosFiltrados.length > 0 
        ? (productosFiltrados.reduce((sum, p) => sum + ((p.precioVenta - p.precioCoste) / p.precioVenta * 100), 0) / productosFiltrados.length).toFixed(2) + '%'
        : '0%',
      precio_promedio: productosFiltrados.length > 0
        ? '€' + (productosFiltrados.reduce((sum, p) => sum + p.precioVenta, 0) / productosFiltrados.length).toFixed(2)
        : '€0.00',
      filtros_aplicados: {
        // Filtros superiores
        familia: filtroFamilia,
        marca: filtroMarca,
        pdv: filtroPDV,
        periodo: filtroPeriodo,
        canal: filtroCanal,
        // Filtros de tabla
        busqueda_prd: busquedaPRD,
        busqueda_descripcion: busquedaDescripcion,
        ordenamiento_columna: ordenColumna,
        ordenamiento_direccion: ordenDireccion
      },
      fecha_exportacion: new Date().toISOString()
    };

    console.log('📤 EVENTO: EXPORTACION_PRODUCTOS_FILTRADOS', {
      formato,
      num_productos: productosFiltrados.length,
      margen_promedio: datosExportacion.margen_promedio,
      filtros_superiores: {
        familia: filtroFamilia,
        marca: filtroMarca,
        pdv: filtroPDV,
        periodo: filtroPeriodo,
        canal: filtroCanal
      },
      filtros_tabla: {
        busqueda_prd: busquedaPRD,
        busqueda_descripcion: busquedaDescripcion,
        ordenamiento: ordenColumna ? `${ordenColumna} ${ordenDireccion}` : 'ninguno'
      },
      timestamp: new Date()
    });

    if (formato === 'excel') {
      toast.success(`📊 Exportando ${productosFiltrados.length} productos a Excel...`, {
        description: 'El archivo incluye todos los datos filtrados'
      });
      // 🔌 CONEXIÓN BACKEND: await generarExcelProductos(datosExportacion);
      // Endpoint: POST /api/productos/exportar
      // Body: { formato: 'excel', filtros: {...}, datos: [...] }
      // Response: { url_descarga: string, nombre_archivo: string }
      // 
      // ESTRUCTURA EXCEL (4 hojas):
      // Hoja 1 - Productos: codigo, nombre, categoria, escandallo, pvp, margen, ranking
      // Hoja 2 - Stock: codigo, nombre, stock_actual, stock_minimo, pdv_asociados
      // Hoja 3 - Ventas: codigo, nombre, ventas_periodo, ticket_medio, clientes_compraron
      // Hoja 4 - Resumen: total_productos, margen_promedio, precio_promedio, filtros
    } else if (formato === 'csv') {
      toast.success(`📄 Exportando ${productosFiltrados.length} productos a CSV...`, {
        description: 'El archivo incluye todos los datos filtrados'
      });
      // 🔌 CONEXIÓN BACKEND: await generarCSVProductos(datosExportacion);
    } else if (formato === 'pdf') {
      toast.success(`📑 Exportando ${productosFiltrados.length} productos a PDF...`, {
        description: 'El archivo incluye todos los datos filtrados'
      });
      // 🔌 CONEXIÓN BACKEND: await generarPDFProductos(datosExportacion);
    }

    console.log('📋 Datos de productos preparados para exportación:', datosExportacion);
  };

  // Función para crear nuevo cliente y enviar invitación
  const handleCrearCliente = async () => {
    // Validaciones
    if (!nuevoClienteNombre.trim()) {
      toast.error('Por favor, ingresa el nombre del cliente');
      return;
    }
    
    if (!nuevoClienteEmail && !nuevoClienteTelefono) {
      toast.error('Debes proporcionar al menos un email o teléfono');
      return;
    }

    // Validar formato de email si se proporciona
    if (nuevoClienteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoClienteEmail)) {
      toast.error('El formato del email no es válido');
      return;
    }

    try {
      // Crear cliente en la API
      const clienteCreado = await clientesApi.create({
        nombre: nuevoClienteNombre.trim(),
        email: nuevoClienteEmail.trim(),
        password: `temp_${Date.now()}`, // Contraseña temporal
        telefono: nuevoClienteTelefono.trim(),
        ciudad: nuevoClienteCodigoPostal.trim()
      });

      if (!clienteCreado) {
        toast.error('Error al crear el cliente');
        return;
      }

      // Agregar el nuevo cliente a la lista
      const clienteFormateado: Cliente = {
        id: clienteCreado.id.toString(),
        nombre: clienteCreado.nombre,
        foto: clienteCreado.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${clienteCreado.nombre}`,
        codigoPostal: clienteCreado.ciudad || '00000',
        numeroPedidos: 0,
        ticketMedio: 0,
        ticketMedioAnterior: 0,
        valoracion: 5,
        ultimaCompra: new Date().toISOString(),
        promocion: false,
        tipo: 'Nuevo',
        email: clienteCreado.email,
        telefono: clienteCreado.telefono || '',
        direccion: nuevoClienteDireccion.trim(),
        segmentos: [],
        pdvsVisitados: 0,
        gastoTotal: 0,
        frecuenciaCompra: 'Ocasional',
        marcaFavorita: '',
        productoFavorito: '',
        pdvHabitual: ''
      };

      setClientesState([...clientesState, clienteFormateado]);

      console.log('📤 EVENTO: CLIENTE_CREADO', {
        cliente: clienteCreado,
        timestamp: new Date(),
        enviar_invitacion: enviarInvitacion,
        canal_invitacion: enviarInvitacion ? canalInvitacion : null
      });

      // Si se marcó "Enviar invitación", enviar por el canal seleccionado
      if (enviarInvitacion) {
        // Obtener nombre de la marca seleccionada
        const nombreMarca = getNombreMarca(marcaSeleccionadaInvitacion);
        const linkDescarga = `https://app.${marcaSeleccionadaInvitacion}.com/download`;
        
        const datosInvitacion = {
          nombre: nuevoClienteNombre,
          email: nuevoClienteEmail,
          telefono: nuevoClienteTelefono,
          marca: nombreMarca,
          marca_id: marcaSeleccionadaInvitacion,
          link_descarga: linkDescarga,
          codigo_invitacion: clienteCreado.id.toString()
        };

        if (canalInvitacion === 'whatsapp') {
          console.log('📤 EVENTO: INVITACION_WHATSAPP_ENVIADA', {
            id_cliente: clienteCreado.id,
            marca: marcaSeleccionadaInvitacion,
            telefono: nuevoClienteTelefono,
            timestamp: new Date()
          });
          toast.success(`📱 Invitación de ${nombreMarca} enviada por WhatsApp a ${nuevoClienteNombre}`, {
            description: `Se ha enviado un mensaje a ${nuevoClienteTelefono}`
          });
          
        } else if (canalInvitacion === 'sms') {
          console.log('📤 EVENTO: INVITACION_SMS_ENVIADA', {
            id_cliente: clienteCreado.id,
            marca: marcaSeleccionadaInvitacion,
            telefono: nuevoClienteTelefono,
            timestamp: new Date()
          });
          toast.success(`📲 Invitación de ${nombreMarca} enviada por SMS a ${nuevoClienteNombre}`, {
            description: `Se ha enviado un SMS a ${nuevoClienteTelefono}`
          });
          
        } else if (canalInvitacion === 'email') {
          console.log('📤 EVENTO: INVITACION_EMAIL_ENVIADA', {
            id_cliente: clienteCreado.id,
            marca: marcaSeleccionadaInvitacion,
            email: nuevoClienteEmail,
            timestamp: new Date()
          });
          toast.success(`✉️ Invitación de ${nombreMarca} enviada por Email a ${nuevoClienteNombre}`, {
            description: `Se ha enviado un correo a ${nuevoClienteEmail}`
          });
        }
      } else {
        toast.success(`✅ Cliente ${nuevoClienteNombre} creado correctamente`, {
          description: 'El cliente ha sido registrado en el sistema'
        });
      }
    } catch (error) {
      console.error('Error creando cliente:', error);
      toast.error('Error al crear el cliente');
      return;
    }

    // Limpiar formulario
    setNuevoClienteNombre('');
    setNuevoClienteEmail('');
    setNuevoClienteTelefono('');
    setNuevoClienteDireccion('');
    setNuevoClienteCodigoPostal('');
    setNuevoClienteFechaCumpleanos('');
    setEnviarInvitacion(false);
    setCanalInvitacion('whatsapp');
    setMarcaSeleccionadaInvitacion('hoypecamos');
    setTabNuevoCliente('info');
    setModalNuevoCliente(false);
  };

  /**
   * TEMPLATES DE MENSAJES PERSONALIZADOS POR MARCA
   * ===============================================
   * 
   * WHATSAPP/SMS:
   * ¡Hola {nombre}! 👋
   * 
   * Te damos la bienvenida a {nombreMarca}.
   * 
   * Descarga nuestra app y completa tu perfil para disfrutar de:
   * ✅ Pedidos rápidos
   * 🎁 Promociones exclusivas
   * ⭐ Programa de fidelización
   * 
   * Descarga aquí: {link_descarga}
   * Tu código: {codigo_invitacion}
   * 
   * ¡Nos vemos pronto!
   * Equipo {nombreMarca}
   * 
   * EMAIL:
   * Asunto: ¡Bienvenido a {nombreMarca}! 🎉
   * 
   * Hola {nombre},
   * 
   * Te damos la bienvenida a nuestra familia {nombreMarca}.
   * Hemos creado tu cuenta y estás a un paso de disfrutar de:
   * 
   * • Pedidos rápidos y cómodos
   * • Promociones exclusivas para ti
   * • Programa de puntos y recompensas
   * • Seguimiento de tus pedidos en tiempo real
   * 
   * 👉 Descarga la app: {link_descarga}
   * 🔑 Tu código de registro: {codigo_invitacion}
   * 
   * ¡Nos vemos pronto!
   * El equipo de {nombreMarca}
   */

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span className="hidden sm:inline">Clientes y Productos</span>
            <span className="sm:hidden">Clientes</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            <span className="hidden sm:inline">Gestión completa de clientes, productos, facturación y promociones</span>
            <span className="sm:hidden">Gestión integral</span>
          </p>
        </div>
        
        {/* Botones de Acción */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-9 sm:h-10 text-sm"
            onClick={() => {
              console.log('📤 EVENTO: NUEVO_PRODUCTO_INICIADO');
              setModalNuevoProducto(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Producto</span>
          </Button>
          
          <Button 
            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-9 sm:h-10 text-sm"
            onClick={() => setModalNuevoCliente(true)}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </Button>
        </div>
      </div>

      {/* Tabs con Filtros */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-0.5 sm:gap-1">
          <TabsTrigger value="clientes" className="py-2 sm:py-2.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 sm:hidden" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="py-2 sm:py-2.5 text-xs sm:text-sm">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 sm:hidden" />
            <span className="hidden sm:inline">Facturación</span>
            <span className="sm:hidden">Facturas</span>
          </TabsTrigger>
          <TabsTrigger value="productos" className="py-2 sm:py-2.5 text-xs sm:text-sm">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 sm:hidden" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="promociones" className="py-2 sm:py-2.5 text-xs sm:text-sm">
            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 sm:hidden" />
            <span className="hidden sm:inline">Promociones</span>
            <span className="sm:hidden">Promos</span>
          </TabsTrigger>
        </TabsList>

        {/* Filtros Superiores Dinámicos - Se adaptan según la pestaña activa */}
        <Card className="mt-4 sm:mt-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Filtro 1 - Varía según pestaña */}
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">
                  {activeTab === 'clientes' && 'Segmento'}
                  {activeTab === 'facturacion' && 'Estado'}
                  {activeTab === 'productos' && 'Familia'}
                  {activeTab === 'promociones' && 'Tipo de Promoción'}
                </Label>
                <Select 
                  value={activeTab === 'promociones' ? 'todas' : filtroFamilia} 
                  onValueChange={(value: any) => setFiltroFamilia(value)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === 'clientes' && (
                      <>
                        <SelectItem value="todas">👥 Todos</SelectItem>
                        <SelectItem value="vip">⭐ VIP</SelectItem>
                        <SelectItem value="regulares">🔄 Regulares</SelectItem>
                        <SelectItem value="nuevos">✨ Nuevos</SelectItem>
                      </>
                    )}
                    {activeTab === 'facturacion' && (
                      <>
                        <SelectItem value="todas">📄 Todas</SelectItem>
                        <SelectItem value="verificado">✅ Verificadas</SelectItem>
                        <SelectItem value="pendiente">⏳ Pendientes</SelectItem>
                      </>
                    )}
                    {activeTab === 'productos' && (
                      <>
                        <SelectItem value="todas">🍕🍔 Todas</SelectItem>
                        <SelectItem value="pizzas">🍕 Pizzas</SelectItem>
                        <SelectItem value="burguers">🍔 Burguers</SelectItem>
                      </>
                    )}
                    {activeTab === 'promociones' && (
                      <>
                        <SelectItem value="todas">🎁 Todas</SelectItem>
                        <SelectItem value="descuento">💰 Descuento %</SelectItem>
                        <SelectItem value="2x1">🎯 2x1</SelectItem>
                        <SelectItem value="3x2">🎊 3x2</SelectItem>
                        <SelectItem value="precio_fijo">💵 Precio fijo</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro PDV - Multiselección */}
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Punto de Venta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between bg-white text-sm h-10"
                    >
                      <span className="truncate">
                        {filtroPDV.length === 0 
                          ? 'Todos los PDVs' 
                          : `${filtroPDV.length} seleccionado${filtroPDV.length > 1 ? 's' : ''}`
                        }
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <div className="space-y-3">
                      {/* Empresa */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
                        {EMPRESAS_ARRAY.map(empresa => (
                          <div key={empresa.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`empresa-${empresa.id}`}
                              checked={filtroPDV.includes(empresa.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroPDV([...filtroPDV, empresa.id]);
                                } else {
                                  setFiltroPDV(filtroPDV.filter(item => item !== empresa.id));
                                }
                              }}
                            />
                            <label htmlFor={`empresa-${empresa.id}`} className="text-sm cursor-pointer">
                              🏢 {getNombreEmpresa(empresa.id)}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Puntos de Venta */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
                        <div className="space-y-2">
                          {PUNTOS_VENTA_ARRAY.map(pdv => (
                            <div key={pdv.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={`pdv-${pdv.id}`}
                                checked={filtroPDV.includes(pdv.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFiltroPDV([...filtroPDV, pdv.id]);
                                  } else {
                                    setFiltroPDV(filtroPDV.filter(item => item !== pdv.id));
                                  }
                                }}
                              />
                              <label htmlFor={`pdv-${pdv.id}`} className="text-sm cursor-pointer">
                                📍 {getNombrePDVConMarcas(pdv.id)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Marcas */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
                        <div className="space-y-2">
                          {MARCAS_ARRAY.map(marca => (
                            <div key={marca.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={`marca-${marca.id}`}
                                checked={filtroPDV.includes(marca.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFiltroPDV([...filtroPDV, marca.id]);
                                  } else {
                                    setFiltroPDV(filtroPDV.filter(item => item !== marca.id));
                                  }
                                }}
                              />
                              <label htmlFor={`marca-${marca.id}`} className="text-sm cursor-pointer">
                                {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botón limpiar */}
                      {filtroPDV.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-xs text-red-600 hover:text-red-700"
                          onClick={() => setFiltroPDV([])}
                        >
                          Limpiar selección
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filtro Periodo */}
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Periodo</Label>
                <Select value={filtroPeriodo} onValueChange={(value: any) => setFiltroPeriodo(value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 días</SelectItem>
                    <SelectItem value="30">Últimos 30 días</SelectItem>
                    <SelectItem value="90">Últimos 90 días</SelectItem>
                    <SelectItem value="mes">Mes actual</SelectItem>
                    <SelectItem value="ano">Año actual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Canal */}
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Canal de Venta</Label>
                <Select value={filtroCanal} onValueChange={(value: any) => setFiltroCanal(value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los canales</SelectItem>
                    <SelectItem value="tpv">🏪 TPV (Tienda)</SelectItem>
                    <SelectItem value="online">🌐 Online (App/Web)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Indicador de filtros activos */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-teal-200 flex-wrap">
              <span className="text-[10px] sm:text-xs text-gray-600 shrink-0">Filtros activos:</span>
              {filtroMarca !== 'todas' && (
                <Badge variant="outline" className="bg-white text-[10px] sm:text-xs h-5 sm:h-6">
                  {activeTab === 'clientes' && (filtroMarca === 'vip' ? '⭐ VIP' : filtroMarca === 'regulares' ? '🔄 Regulares' : '✨ Nuevos')}
                  {activeTab === 'facturacion' && (filtroMarca === 'verificado' ? '✅ Verificadas' : '⏳ Pendientes')}
                  {activeTab === 'productos' && (filtroMarca === 'pizzas' ? '🍕 Pizzas' : '🍔 Burguers')}
                  {activeTab === 'promociones' && (
                    filtroMarca === 'descuento' ? '💰 Descuento' :
                    filtroMarca === '2x1' ? '🎯 2x1' :
                    filtroMarca === '3x2' ? '🎊 3x2' :
                    '💵 Precio fijo'
                  )}
                </Badge>
              )}
              {filtroPDV.length > 0 && (
                <Badge variant="outline" className="bg-white text-[10px] sm:text-xs h-5 sm:h-6">
                  Filtros: {filtroPDV.map(id => {
                    if (EMPRESAS[id]) return getNombreEmpresa(id);
                    if (PUNTOS_VENTA[id]) return PUNTOS_VENTA[id].nombre;
                    if (MARCAS[id]) return getNombreMarca(id);
                    return id;
                  }).join(', ')}
                </Badge>
              )}
              {filtroPeriodo && (
                <Badge variant="outline" className="bg-white text-[10px] sm:text-xs h-5 sm:h-6">
                  <span className="hidden sm:inline">Periodo: </span>{
                    filtroPeriodo === '7' ? '7d' :
                    filtroPeriodo === '30' ? '30d' :
                    filtroPeriodo === '90' ? '90d' :
                    filtroPeriodo === 'mes' ? 'Mes' :
                    'Año'
                  }
                </Badge>
              )}
              {filtroCanal !== 'todos' && (
                <Badge variant="outline" className="bg-white text-[10px] sm:text-xs h-5 sm:h-6">
                  {filtroCanal === 'tpv' ? '🏪 TPV' : '🌐 Online'}
                </Badge>
              )}
              {(filtroMarca !== 'todas' || filtroPDV.length > 0 || filtroCanal !== 'todos') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 sm:h-6 text-[10px] sm:text-xs text-red-600 hover:text-red-700 ml-auto px-2"
                  onClick={() => {
                    setFiltroMarca('todas');
                    setFiltroPDV([]);
                    setFiltroPeriodo('30');
                    setFiltroCanal('todos');
                    toast.info('Filtros restablecidos');
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Nota para el programador */}
            <div className="mt-2 sm:mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-[10px] sm:text-xs text-blue-800">
              <strong className="hidden sm:inline">📋 Para el programador:</strong><strong className="sm:hidden">📋</strong> Estos filtros deben pasarse como parámetros a todas las consultas de:
              CLIENTE, FACTURA, PRODUCTO, PROMOCION.
            </div>
          </CardContent>
        </Card>



        {/* TAB: Clientes */}
        {/* 
          📊 CONEXIÓN DATOS: 
          - Consultar tabla CLIENTE con filtros: filtroMarca, filtroPDV, filtroPeriodo, filtroCanal
          - JOIN con FACTURA para calcular: nº_pedidos, ticket_medio, fecha_ultimo_pedido
          - Ordenar por fecha_ultimo_pedido DESC
          - Incluir segmentos y tipo_cliente para chips visuales
        */}
        <TabsContent value="clientes" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Listado de Clientes</span>
                    <span className="sm:hidden">Clientes</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {cargandoDatos ? (
                      <span className="text-blue-600">Cargando datos desde API...</span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Ordenados del más reciente al más antiguo • </span>
                        <span className="text-green-600">{clientesFiltrados.length} clientes cargados desde API</span>
                      </>
                    )}
                  </p>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Promoción</span>
                  </Button>
                  
                  {/* Botón Exportar Clientes Filtrados */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                      >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExportarClientesFiltrados('excel')}>
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                        Exportar a Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportarClientesFiltrados('csv')}>
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Exportar a CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportarClientesFiltrados('pdf')}>
                        <FileText className="w-4 h-4 mr-2 text-red-600" />
                        Exportar a PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Vista móvil - Cards */}
              <div className="sm:hidden space-y-3">
                {clientesFiltrados.map((cliente) => (
                  <div key={cliente.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarImage src={cliente.foto} alt={cliente.nombre} />
                        <AvatarFallback className="text-xs">
                          {cliente.nombre.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{cliente.nombre}</p>
                        <p className="text-xs text-gray-500">{cliente.id}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{cliente.codigoPostal}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{cliente.numeroPedidos} pedidos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-900">{cliente.valoracion.toFixed(1)}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">€{cliente.ticketMedio.toFixed(2)}</span> medio
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatearFecha(cliente.ultimaCompra)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {getTipoBadge(cliente.tipo)}
                      {cliente.segmentos && Array.isArray(cliente.segmentos) && cliente.segmentos.map((seg) => getSegmentoBadge(seg))}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setModalVerDetalles(true);
                        }}
                        className="flex-1 h-7 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 px-2">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="w-3 h-3 mr-2" />
                            Facturas
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Gift className="w-3 h-3 mr-2" />
                            Añadir promoción
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {/* Fila de títulos con ordenamiento */}
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-4">
                        <button 
                          onClick={() => handleOrdenarClientes('nombre')}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors group w-full"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">Cliente</span>
                          {ordenClienteColumna === 'nombre' ? (
                            ordenClienteDireccion === 'asc' ? 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-2 px-4">
                        <button 
                          onClick={() => handleOrdenarClientes('codigoPostal')}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors group w-full"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">Código Postal</span>
                          {ordenClienteColumna === 'codigoPostal' ? (
                            ordenClienteDireccion === 'asc' ? 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-center py-2 px-4">
                        <button 
                          onClick={() => handleOrdenarClientes('numeroPedidos')}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">Nº Pedidos</span>
                          {ordenClienteColumna === 'numeroPedidos' ? (
                            ordenClienteDireccion === 'asc' ? 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-center py-2 px-4">
                        <button 
                          onClick={() => handleOrdenarClientes('ticketMedio')}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">Ticket Medio</span>
                          {ordenClienteColumna === 'ticketMedio' ? (
                            ordenClienteDireccion === 'asc' ? 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-center py-2 px-4">
                        <button 
                          onClick={() => handleOrdenarClientes('valoracion')}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">Valoración</span>
                          {ordenClienteColumna === 'valoracion' ? (
                            ordenClienteDireccion === 'asc' ? 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-center py-2 px-4">
                        <button 
                          onClick={() => handleOrdenarClientes('ultimaCompra')}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                        >
                          <span className="text-sm text-gray-600 group-hover:text-gray-900">Última compra</span>
                          {ordenClienteColumna === 'ultimaCompra' ? (
                            ordenClienteDireccion === 'asc' ? 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                              <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </button>
                      </th>
                      <th className="text-left py-2 px-4">
                        <span className="text-sm text-gray-600">Tipo / Segmentos</span>
                      </th>
                      <th className="text-center py-2 px-4">
                        <span className="text-sm text-gray-600">Promoción</span>
                      </th>
                      <th className="text-center py-2 px-4">
                        <span className="text-sm text-gray-600">Exportar</span>
                      </th>
                      <th className="text-center py-2 px-4">
                        <span className="text-sm text-gray-600">Acciones</span>
                      </th>
                    </tr>
                    {/* Fila de búsquedas */}
                    <tr className="border-b bg-white">
                      <th className="py-2 px-4">
                        <Input
                          placeholder="Buscar cliente..."
                          value={busquedaCliente}
                          onChange={(e) => setBusquedaCliente(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </th>
                      <th className="py-2 px-4">
                        <Input
                          placeholder="CP..."
                          value={busquedaCodigoPostal}
                          onChange={(e) => setBusquedaCodigoPostal(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                      <th className="py-2 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente) => (
                      <tr 
                        key={cliente.id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={cliente.foto} alt={cliente.nombre} />
                                <AvatarFallback>
                                  {cliente.nombre.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-sm transition-colors">
                                <Eye className="w-3 h-3 text-white" />
                              </button>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{cliente.nombre}</p>
                              <p className="text-xs text-gray-500">{cliente.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{cliente.codigoPostal}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingCart className="w-3 h-3 text-gray-400" />
                            <span className="font-medium text-gray-900">{cliente.numeroPedidos}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {getTicketMedioIndicador(cliente.ticketMedio, cliente.ticketMedioAnterior)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {renderValoracion(cliente.valoracion)}
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-gray-600">
                          {formatFecha(cliente.ultimaCompra)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1">
                              {getTipoBadge(cliente.tipo)}
                              {cliente.promocion && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  Promoción
                                </Badge>
                              )}
                            </div>
                            {cliente.segmentos && cliente.segmentos.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {cliente.segmentos.map((segmento, idx) => (
                                  <Badge 
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {segmento}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              defaultChecked={cliente.promocion}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 px-2 text-xs border-green-600 text-green-700 hover:bg-green-50"
                              onClick={() => abrirModalExportacionPersonalizada(cliente)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="w-8 h-8 p-0 rounded-full text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.info(`Abriendo chat con ${cliente.nombre}`)}>
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Abrir Chat
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  // 🔌 EVENTO: CLIENTE_VISUALIZADO
                                  // Payload: { id_cliente: cliente.id, timestamp: new Date(), seccion: 'resumen' }
                                  setClienteSeleccionado(cliente);
                                  setModoEdicion(false);
                                  setTabDetallesCliente('resumen');
                                  setModalVerDetalles(true);
                                  console.log('📤 EVENTO: CLIENTE_VISUALIZADO', { id_cliente: cliente.id, timestamp: new Date(), seccion: 'resumen' });
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // 🔌 EVENTO: HISTORIAL_CLIENTE_VISUALIZADO
                                  // Payload: { id_cliente: cliente.id, timestamp: new Date(), filtros: { marca, pdv, periodo, canal } }
                                  setClienteSeleccionado(cliente);
                                  setTabDetallesCliente('historial');
                                  setModalVerDetalles(true);
                                  console.log('📤 EVENTO: HISTORIAL_CLIENTE_VISUALIZADO', { id_cliente: cliente.id, timestamp: new Date() });
                                }}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Ver Historial
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  // 🔌 EVENTO: PROMOCION_SELECCION_INICIADA
                                  // Payload: { id_cliente: cliente.id, segmentos: cliente.segmentos, timestamp: new Date() }
                                  // Luego abrir modal para seleccionar promoción disponible según segmentos del cliente
                                  console.log('📤 EVENTO: PROMOCION_SELECCION_INICIADA', { id_cliente: cliente.id });
                                  toast.info(`Enviar promoción a ${cliente.nombre}`);
                                }}>
                                  <Gift className="w-4 h-4 mr-2" />
                                  Enviar Promoción
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Loading State */}
              {cargandoDatos && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
                  <p className="text-gray-500 mb-2">Cargando clientes desde la API...</p>
                  <p className="text-sm text-gray-400">Conectando al servidor backend</p>
                </div>
              )}

              {/* Mensaje cuando no hay clientes filtrados */}
              {!cargandoDatos && clientesFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-2">No hay clientes que coincidan con los filtros aplicados</p>
                  <p className="text-sm text-gray-400">Prueba ajustando los filtros superiores (Estado, PDV, Período, Canal)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Facturación */}
        {/* 
          📊 CONEXIÓN DATOS: 
          - Consultar tabla FACTURA + JOIN CLIENTE + JOIN PDV + JOIN MARCA
          - Aplicar filtros: filtroMarca, filtroPDV, filtroPeriodo, filtroCanal
          - JOIN con LINEA_FACTURA + PRODUCTO para columna "productos" (chips)
          - Incluir: id_factura, fecha, cliente (nombre + id), total, metodo_pago, estado_verifactu, pdv, marca_id
          - Eventos: FACTURA_VISTA, VER_CLIENTE_DESDE_FACTURA, DESCARGAR_PDF_VERIFACTU, EXPORTAR_FACTURAS
          
          🔄 GENERACIÓN AUTOMÁTICA DE FACTURAS:
          Al realizar un cobro (TPV o App/Web):
          1. Se genera automáticamente la factura en tabla FACTURA
          2. Se registran las líneas de factura en LINEA_FACTURA
          3. Se envía a Verifactu para verificación
          4. Se actualiza estado_verifactu cuando se recibe confirmación
          5. Se asocia a la MARCA correspondiente (multiempresa)
          
          🏢 SEGMENTACIÓN POR EMPRESAS:
          - Cada factura tiene marca_id (hoypecamos, modofmio, burguer)
          - Los filtros superiores (filtroMarca) segmentan automáticamente
          - Los datos se muestran solo de la marca seleccionada
          - Cada marca tiene su propia numeración de facturas
          - Verifactu se integra por marca/empresa independiente
        */}
        <TabsContent value="facturacion" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Facturas Emitidas
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Todas las facturas verificadas con Verifactu • </span>{facturasFiltradas.length} facturas
                  </p>
                </div>

                {/* Botón Exportar Facturas */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportarFacturas('excel')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                      Exportar a Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportarFacturas('csv')}>
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Exportar a CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportarFacturas('pdf')}>
                      <FileText className="w-4 h-4 mr-2 text-red-600" />
                      Exportar a PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Vista móvil - Cards */}
              <div className="sm:hidden space-y-3">
                {facturasFiltradas.map((factura) => (
                  <div key={factura.id} className="border rounded-lg p-3 bg-white hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{factura.id}</p>
                        <p className="text-xs text-gray-600 truncate">{factura.clienteNombre}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="font-semibold text-sm text-gray-900">€{factura.total.toFixed(2)}</p>
                        {factura.verifactu ? (
                          <Badge className="bg-green-100 text-green-700 text-[10px] h-4 mt-1">
                            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                            OK
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 text-[10px] h-4 mt-1">
                            Pend.
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{formatFecha(factura.fecha)}</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {factura.pdv || 'PV001'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={`text-[10px] h-5 ${
                        factura.metodoPago === 'Tarjeta' ? 'bg-blue-100 text-blue-700' :
                        factura.metodoPago === 'Efectivo' ? 'bg-green-100 text-green-700' :
                        factura.metodoPago === 'Online' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {factura.metodoPago}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2"
                        onClick={() => toast.info(`Abriendo PDF de factura ${factura.id}`)}
                      >
                        <Eye className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista desktop - Tabla */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4">
                        <div className="space-y-2">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900 text-sm text-gray-600"
                            onClick={() => handleOrdenFactura('id')}
                          >
                            ID
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                          <Input
                            type="text"
                            placeholder="Buscar..."
                            value={busquedaFacturaID}
                            onChange={(e) => setBusquedaFacturaID(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4">
                        <div className="space-y-2">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900 text-sm text-gray-600"
                            onClick={() => handleOrdenFactura('cliente')}
                          >
                            Cliente
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                          <Input
                            type="text"
                            placeholder="Buscar..."
                            value={busquedaFacturaCliente}
                            onChange={(e) => setBusquedaFacturaCliente(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">
                        <button 
                          className="flex items-center gap-1 hover:text-gray-900 text-sm text-gray-600 mx-auto"
                          onClick={() => handleOrdenFactura('fecha')}
                        >
                          Fecha
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4">
                        <div className="space-y-2">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900 text-sm text-gray-600 mx-auto"
                            onClick={() => handleOrdenFactura('pdv')}
                          >
                            PDV
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                          <Input
                            type="text"
                            placeholder="Buscar..."
                            value={busquedaFacturaPDV}
                            onChange={(e) => setBusquedaFacturaPDV(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">
                        <div className="space-y-2">
                          <button 
                            className="flex items-center gap-1 hover:text-gray-900 text-sm text-gray-600 mx-auto"
                            onClick={() => handleOrdenFactura('metodoPago')}
                          >
                            Método Pago
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                          <Input
                            type="text"
                            placeholder="Buscar..."
                            value={busquedaFacturaMetodoPago}
                            onChange={(e) => setBusquedaFacturaMetodoPago(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      </th>
                      <th className="text-center py-3 px-4">
                        <button 
                          className="flex items-center gap-1 hover:text-gray-900 text-sm text-gray-600 mx-auto"
                          onClick={() => handleOrdenFactura('total')}
                        >
                          Total
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Estado Verifactu</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasFiltradas.map((factura) => (
                      <tr 
                        key={factura.id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{factura.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{factura.clienteNombre}</p>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-gray-600">
                          {formatFecha(factura.fecha)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="text-xs">
                            {factura.pdv || 'PV001'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={
                            factura.metodoPago === 'Tarjeta' ? 'bg-blue-100 text-blue-700' :
                            factura.metodoPago === 'Efectivo' ? 'bg-green-100 text-green-700' :
                            factura.metodoPago === 'Online' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }>
                            {factura.metodoPago}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900">€{factura.total.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {factura.verifactu ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-600">
                              Pendiente
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => toast.info(`Abriendo PDF de factura ${factura.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Promociones */}
        {/* 
          📊 CONEXIÓN DATOS: 
          - Consultar tabla PROMOCION + JOIN PROMOCION_PRODUCTO + JOIN PRODUCTO
          - Aplicar filtros: filtroMarca (aplica_marca), filtroPDV (aplica_pdv contiene pdv_id)
          - Calcular:
            * nº_clientes_impactados = count(PROMOCION_CLIENTE_LOG WHERE id_promocion + fecha_enviada en periodo)
            * escandallo_pack = sum(PRODUCTO.escandallo_unitario * PROMOCION_PRODUCTO.cantidad)
            * pvp_final según tipo de promoción
          - Incluir: tipo, descripcion, fechas, estado, segmentos_objetivo
          - Eventos:
            * PROMOCION_CREADA (id_promocion, timestamp, datos)
            * PROMOCION_EDITADA (id_promocion, cambios)
            * PROMOCION_ACTIVADA/DESACTIVADA (id_promocion, estado)
            * PROMOCION_APLICADA_A_CLIENTE (id_promocion, id_cliente, canal)
        */}
        <TabsContent value="promociones" className="mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header con botón añadir */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Promociones Activas
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">Gestiona todas las promociones y descuentos disponibles</span>
                  <span className="sm:hidden">Gestión de promociones</span>
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Toggle Vista */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={vistaPromociones === 'fichas' ? 'default' : 'ghost'}
                    className={`h-8 ${vistaPromociones === 'fichas' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setVistaPromociones('fichas')}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={vistaPromociones === 'lista' ? 'default' : 'ghost'}
                    className={`h-8 ${vistaPromociones === 'lista' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setVistaPromociones('lista')}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={() => {
                    // 🔌 EVENTO: NUEVA_PROMOCION_INICIADA
                    // Payload: { timestamp: new Date() }
                    // Abrir modal con tabs: Producto y Escandallo + Config. y Público
                    console.log('📤 EVENTO: NUEVA_PROMOCION_INICIADA');
                    setModalAñadirPromocion(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Añadir Promoción</span>
                  <span className="sm:hidden">Nueva</span>
                </Button>
              </div>
            </div>

            {/* Vista en Fichas - Siempre en móvil, toggle en desktop */}
            {vistaPromociones === 'fichas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {promocionesState.length === 0 ? (
                <Card className="col-span-full p-8">
                  <div className="text-center text-gray-500">
                    <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">No hay promociones</p>
                    <p className="text-sm">Crea la primera promoción para tus clientes</p>
                  </div>
                </Card>
              ) : (
                promocionesState.map((promocion) => (
                  <Card key={promocion.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" 
                        alt={promocion.titulo} 
                        className="w-full h-36 sm:h-48 object-cover"
                      />
                      <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-600 text-white text-[10px] sm:text-xs h-5 sm:h-6">
                        {promocion.descuento}
                      </Badge>
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      {/* Fecha de inicio y clientes */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3 pb-2 sm:pb-3 border-b">
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span className="hidden sm:inline">ID: {promocion.id}</span>
                          <span className="sm:hidden">#{promocion.id}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-teal-600">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {promocion.titulo}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                        {promocion.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <span className="text-teal-600 font-semibold text-base sm:text-xl">{promocion.descuento}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs">
                          General
                        </Badge>
                        <span className="text-[10px] sm:text-sm text-gray-500">
                          <span className="hidden sm:inline">Válido hasta: </span>
                          {new Date(promocion.validoHasta).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-teal-600 hover:bg-teal-700 h-8 sm:h-9 text-xs sm:text-sm"
                          onClick={() => {
                            setPromocionSeleccionada(promocion);
                            setModalEditarPromocion(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-8 sm:h-9 px-2"
                          onClick={async () => {
                            try {
                              await promocionesApi.delete(promocion.id);
                              setPromocionesState(prev => prev.filter(p => p.id !== promocion.id));
                              toast.success('Promoción eliminada');
                            } catch (error) {
                              toast.error('Error al eliminar promoción');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}




            </div>
            )}

            {/* Vista en Lista */}
            {vistaPromociones === 'lista' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead>
                      {/* Fila de títulos con ordenamiento */}
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-4">
                          <button 
                            onClick={() => {
                              if (ordenPromoColumna === 'nombre') {
                                setOrdenPromoDireccion(ordenPromoDireccion === 'asc' ? 'desc' : 'asc');
                              } else {
                                setOrdenPromoColumna('nombre');
                                setOrdenPromoDireccion('asc');
                              }
                            }}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors group w-full"
                          >
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">Nombre Promo</span>
                            {ordenPromoColumna === 'nombre' ? (
                              ordenPromoDireccion === 'asc' ? 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                            )}
                          </button>
                        </th>
                        <th className="text-center py-2 px-4">
                          <button 
                            onClick={() => {
                              if (ordenPromoColumna === 'pvp') {
                                setOrdenPromoDireccion(ordenPromoDireccion === 'asc' ? 'desc' : 'asc');
                              } else {
                                setOrdenPromoColumna('pvp');
                                setOrdenPromoDireccion('desc');
                              }
                            }}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                          >
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">PVP</span>
                            {ordenPromoColumna === 'pvp' ? (
                              ordenPromoDireccion === 'asc' ? 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                            )}
                          </button>
                        </th>
                        <th className="text-center py-2 px-4">
                          <span className="text-sm text-gray-600">Tipo</span>
                        </th>
                        <th className="text-center py-2 px-4">
                          <button 
                            onClick={() => {
                              if (ordenPromoColumna === 'fechas') {
                                setOrdenPromoDireccion(ordenPromoDireccion === 'asc' ? 'desc' : 'asc');
                              } else {
                                setOrdenPromoColumna('fechas');
                                setOrdenPromoDireccion('desc');
                              }
                            }}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                          >
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">Fechas</span>
                            {ordenPromoColumna === 'fechas' ? (
                              ordenPromoDireccion === 'asc' ? 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                            )}
                          </button>
                        </th>
                        <th className="text-center py-2 px-4">
                          <button 
                            onClick={() => {
                              if (ordenPromoColumna === 'clientes') {
                                setOrdenPromoDireccion(ordenPromoDireccion === 'asc' ? 'desc' : 'asc');
                              } else {
                                setOrdenPromoColumna('clientes');
                                setOrdenPromoDireccion('desc');
                              }
                            }}
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors group mx-auto"
                          >
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">Nº Clientes</span>
                            {ordenPromoColumna === 'clientes' ? (
                              ordenPromoDireccion === 'asc' ? 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900 rotate-180" /> : 
                                <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                            )}
                          </button>
                        </th>
                        <th className="text-center py-2 px-4">
                          <span className="text-sm text-gray-600">Estado</span>
                        </th>
                        <th className="text-center py-2 px-4">
                          <span className="text-sm text-gray-600">Acción</span>
                        </th>
                      </tr>

                      {/* Fila de búsquedas */}
                      <tr className="border-b bg-white">
                        <th className="py-2 px-4">
                          <Input
                            placeholder="Buscar promo..."
                            value={busquedaPromoNombre}
                            onChange={(e) => setBusquedaPromoNombre(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </th>
                        <th className="py-2 px-4"></th>
                        <th className="py-2 px-4">
                          <Input
                            placeholder="Filtrar tipo..."
                            value={busquedaPromoTipo}
                            onChange={(e) => setBusquedaPromoTipo(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </th>
                        <th className="py-2 px-4"></th>
                        <th className="py-2 px-4"></th>
                        <th className="py-2 px-4"></th>
                        <th className="py-2 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Promoción 1 */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100" 
                              alt="Pack Croissants"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Pack Croissants</p>
                              <Badge className="mt-1 bg-red-100 text-red-700 text-xs h-5">25% OFF</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400 line-through text-xs block">€16.00</span>
                          <span className="text-teal-600 font-semibold text-sm">€12.00</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Fidelización
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-gray-600">
                          <div>01/11/2024</div>
                          <div className="text-gray-400">30/11/2025</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600">
                            <Users className="w-3 h-3" />
                            <span className="font-medium text-sm">142</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Activa
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                console.log('📤 EVENTO: EDITAR_PROMOCION', { id_promo: 'PROMO-001' });
                                setPromocionSeleccionada({
                                  id: 'PROMO-001',
                                  nombre: 'Pack Croissants',
                                  descuento: '25% OFF',
                                  pvp: 12.00,
                                  tipo: 'Fidelización'
                                });
                                setModalEditarPromocion(true);
                              }}
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Promoción 2 */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100" 
                              alt="Menú Desayuno Familiar"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Menú Desayuno Familiar</p>
                              <Badge className="mt-1 bg-orange-100 text-orange-700 text-xs h-5">€8 OFF</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400 line-through text-xs block">€35.00</span>
                          <span className="text-teal-600 font-semibold text-sm">€27.00</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                            Personalizada
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-gray-600">
                          <div>15/10/2024</div>
                          <div className="text-gray-400">31/12/2025</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600">
                            <Users className="w-3 h-3" />
                            <span className="font-medium text-sm">87</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Activa
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                console.log('📤 EVENTO: EDITAR_PROMOCION', { id_promo: 'PROMO-002' });
                                setPromocionSeleccionada({
                                  id: 'PROMO-002',
                                  nombre: 'Menú Desayuno Familiar',
                                  descuento: '€8 OFF',
                                  pvp: 27.00,
                                  tipo: 'Personalizada'
                                });
                                setModalEditarPromocion(true);
                              }}
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Promoción 3 */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src="https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=100" 
                              alt="Combo Bollería Completo"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">Combo Bollería Completo</p>
                              <Badge className="mt-1 bg-orange-100 text-orange-700 text-xs h-5">€4 OFF</Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400 line-through text-xs block">€18.50</span>
                          <span className="text-teal-600 font-semibold text-sm">€14.50</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Bienvenida
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-gray-600">
                          <div>20/11/2024</div>
                          <div className="text-gray-400">15/12/2025</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600">
                            <Users className="w-3 h-3" />
                            <span className="font-medium text-sm">53</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            Activa
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                console.log('📤 EVENTO: EDITAR_PROMOCION', { id_promo: 'PROMO-003' });
                                setPromocionSeleccionada({
                                  id: 'PROMO-003',
                                  nombre: 'Combo Bollería Completo',
                                  descuento: '€4 OFF',
                                  pvp: 14.50,
                                  tipo: 'Bienvenida'
                                });
                                setModalEditarPromocion(true);
                              }}
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Promoción 4 */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <img 
                            src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=100" 
                            alt="3 Baguettes al Precio de 2"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">3 Baguettes al Precio de 2</p>
                            <Badge className="mt-1 bg-red-100 text-red-700 text-xs">33% OFF</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400 line-through text-sm block">€9.00</span>
                          <span className="text-teal-600 font-semibold">€6.00</span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700">€4.20</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">05/09/2024</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">20/12/2025</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600">
                            <Users className="w-3 h-3" />
                            <span className="font-medium">218</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Fidelización
                          </Badge>
                        </td>
                      </tr>

                      {/* Promoción 5 */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <img 
                            src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100" 
                            alt="20% Descuento en Postres"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">20% Descuento en Postres</p>
                            <Badge className="mt-1 bg-red-100 text-red-700 text-xs">20% OFF</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400 line-through text-sm block">€5.50</span>
                          <span className="text-teal-600 font-semibold">€4.40</span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700">€3.15</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">12/11/2024</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">31/12/2025</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600">
                            <Users className="w-3 h-3" />
                            <span className="font-medium">95</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Bienvenida
                          </Badge>
                        </td>
                      </tr>

                      {/* Promoción 6 */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <img 
                            src="https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=100" 
                            alt="Martes de Pan Artesanal"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">Martes de Pan Artesanal</p>
                            <Badge className="mt-1 bg-red-100 text-red-700 text-xs">50% OFF</Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-gray-400 line-through text-sm block">€3.80</span>
                          <span className="text-teal-600 font-semibold">€2.85</span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700">€1.90</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">01/01/2024</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">31/01/2026</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600">
                            <Users className="w-3 h-3" />
                            <span className="font-medium">364</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Personalizada
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB: Productos */}
        {/* 
          📊 CONEXIÓN DATOS: 
          - Consultar tabla PRODUCTO + JOIN STOCK_PDV (filtrar por filtroPDV activo)
          - Aplicar filtros: filtroMarca, filtroPDV (para stock y PDV Top)
          - Calcular: 
            * margen = (pvp - escandallo_unitario) / pvp
            * stock = sum(STOCK_PDV.stock_actual) para PDVs filtrados
            * ranking = ORDER BY ventas en filtroPeriodo
            * PDV Top = MAX ventas por PDV
          - Eventos: 
            * PRODUCTO_VISUALIZADO (id_producto)
            * PRODUCTO_ACTIVADO/DESACTIVADO (id_producto, pdv_id, activo)
            * VER_ESCANDALLO (id_producto)
        */}
        <TabsContent value="productos" className="mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Catálogo de Productos
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  <span className="hidden sm:inline">Gestión completa del catálogo · </span>156 productos
                </p>
              </div>

              {/* Botón de exportación de productos */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem 
                    onClick={() => handleExportarProductosFiltrados('excel')}
                    className="cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExportarProductosFiltrados('csv')}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Exportar a CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExportarProductosFiltrados('pdf')}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2 text-red-600" />
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 sm:h-10 text-sm">
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Filtros
              </Button>
            </div>

            {/* Vista móvil - Cards */}
            <div className="sm:hidden space-y-3">
              {productosState.length === 0 ? (
                <Card className="p-4">
                  <p className="text-center text-gray-500">
                    {cargandoDatos ? 'Cargando productos...' : 'No hay productos disponibles'}
                  </p>
                </Card>
              ) : (
                productosState.slice(0, 3).map((producto, index) => (
                  <Card key={producto.id} className="p-3">
                    <div className="flex items-start gap-3 mb-3">
                      <Coffee className="w-10 h-10 text-teal-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{producto.nombre}</p>
                            <p className="text-xs text-gray-500 font-mono">{producto.id}</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] shrink-0">
                            {producto.categoria || 'General'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                          <div>
                            <p className="text-gray-500">Escand.</p>
                            <p className="font-medium text-gray-900">€{(producto.precio * 0.6).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">PVP</p>
                            <p className="font-semibold text-teal-600">€{producto.precio.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Margen</p>
                            <p className="font-semibold text-gray-900">40%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-gray-400" />
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                        <div className="text-gray-600">
                          Stock: <span className="font-medium text-teal-600">{producto.stock || 0}</span>/100
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Vista desktop - Tabla */}
            <Card className="hidden sm:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          PRD
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Escandallo (€)
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          PVP (€)
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Margen / Rentab.
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Ranking
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          PDV Top
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosState.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-gray-500">
                            {cargandoDatos ? 'Cargando productos...' : 'No hay productos disponibles'}
                          </td>
                        </tr>
                      ) : (
                        productosState.map((producto, index) => (
                          <tr key={producto.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-gray-700 font-semibold">{producto.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Coffee className="w-8 h-8 text-teal-600" />
                                <span className="font-medium text-gray-900">{producto.nombre}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {producto.categoria || 'General'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-700">
                              €{(producto.precio * 0.6).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center text-sm font-semibold text-gray-900">
                              €{producto.precio.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm font-semibold text-teal-600">40%</span>
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Media
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">#{index + 1}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-gray-700">
                                <span className="font-semibold text-teal-600">{producto.stock || 0}</span>
                                <span className="text-gray-400">/100</span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Store className="w-3 h-3 text-gray-500" />
                                <span className="text-sm text-gray-700">Centro</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2"
                                  onClick={() => {
                                    console.log('📤 EVENTO: PRODUCTO_VISUALIZADO', { id_producto: producto.id });
                                    setModalVerProducto(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2"
                                  onClick={() => {
                                    console.log('📤 EVENTO: ESCANDALLO_VISUALIZADO', { id_producto: producto.id });
                                    toast.info('Abriendo escandallo...');
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 px-2 text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    console.log('📤 EVENTO: PRODUCTO_DESACTIVADO', { id_producto: producto.id, activo: false });
                                    toast.success('Producto desactivado');
                                  }}
                                >
                                  <PowerOff className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}


                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Crear Nueva Promoción */}
      <Dialog open={modalAñadirPromocion} onOpenChange={(open) => {
        setModalAñadirPromocion(open);
        if (!open) {
          setNuevaPromocion({ 
            titulo: '', 
            descripcion: '', 
            descuento: '', 
            validoHasta: '' 
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Crear Nueva Promoción
            </DialogTitle>
            <DialogDescription>
              Completa los campos para crear una nueva promoción
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la promoción
              </label>
              <input
                type="text"
                value={nuevaPromocion.titulo}
                onChange={(e) => setNuevaPromocion(prev => ({...prev, titulo: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: 2x1 en croissants"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={nuevaPromocion.descripcion}
                onChange={(e) => setNuevaPromocion(prev => ({...prev, descripcion: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe los detalles de la promoción"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento
              </label>
              <input
                type="text"
                value={nuevaPromocion.descuento}
                onChange={(e) => setNuevaPromocion(prev => ({...prev, descuento: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: 20%, 2x1, €5 OFF"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válida hasta
              </label>
              <input
                type="date"
                value={nuevaPromocion.validoHasta}
                onChange={(e) => setNuevaPromocion(prev => ({...prev, validoHasta: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setModalAñadirPromocion(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleAñadirPromocion}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Promoción
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Detalles del Cliente */}
      <Dialog open={modalVerDetalles} onOpenChange={(open) => {
        setModalVerDetalles(open);
        if (!open) setModoEdicion(false);
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {modoEdicion ? 'Editar Cliente' : 'Detalles del Cliente'}
              </DialogTitle>
              {!modoEdicion && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setModoEdicion(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              )}
            </div>
            <DialogDescription>
              {modoEdicion ? 'Modifica la información del cliente' : 'Visualiza toda la información y actividad del cliente'}
            </DialogDescription>
          </DialogHeader>
          
          {clienteSeleccionado && (
            <div className="space-y-6 mt-4">
              {/* Header con avatar y nombre */}
              <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-lg">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={clienteSeleccionado.foto} alt={clienteSeleccionado.nombre} />
                  <AvatarFallback>
                    {clienteSeleccionado.nombre.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {clienteSeleccionado.nombre}
                  </h3>
                  <p className="text-gray-600">{clienteSeleccionado.id}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {getTipoBadge(clienteSeleccionado.tipo)}
                    {clienteSeleccionado.promocion && (
                      <Badge className="bg-purple-600 text-white">
                        <Gift className="w-3 h-3 mr-1" />
                        En Promoción
                      </Badge>
                    )}
                  </div>
                  {/* Segmentos configurables */}
                  {clienteSeleccionado.segmentos && clienteSeleccionado.segmentos.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {clienteSeleccionado.segmentos.map((segmento, idx) => (
                        <Badge 
                          key={idx}
                          variant="outline"
                          className={`text-xs ${
                            segmento === 'VIP' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                            segmento === 'En riesgo' ? 'border-red-500 text-red-700 bg-red-50' :
                            segmento === 'Alta frecuencia' ? 'border-green-500 text-green-700 bg-green-50' :
                            segmento === 'Multitienda' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                            segmento === 'Marca favorita' ? 'border-purple-500 text-purple-700 bg-purple-50' :
                            'border-gray-500 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {segmento}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs de Navegación */}
              <Tabs value={tabDetallesCliente} onValueChange={setTabDetallesCliente} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumen">Resumen</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                  <TabsTrigger value="promociones">Promociones</TabsTrigger>
                  <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
                </TabsList>

                {/* TAB 1: RESUMEN */}
                <TabsContent value="resumen" className="space-y-6 mt-4">
                  {/* Estadísticas rápidas */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <ShoppingCart className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl text-gray-900 mb-1">{clienteSeleccionado.numeroPedidos}</p>
                        <p className="text-sm text-gray-600">Pedidos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <DollarSign className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl text-gray-900 mb-1">€{clienteSeleccionado.ticketMedio.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Ticket Medio</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Calendar className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl text-gray-900 mb-1">{clienteSeleccionado.ultimaCompra}</p>
                        <p className="text-sm text-gray-600">Última Compra</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Star className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl text-gray-900 mb-1">{clienteSeleccionado.valoracion.toFixed(1)}/5</p>
                        <p className="text-sm text-gray-600">Valoración</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfica de tendencia */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Evolución del Ticket Medio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            clienteSeleccionado.ticketMedio > clienteSeleccionado.ticketMedioAnterior 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((clienteSeleccionado.ticketMedio / (clienteSeleccionado.ticketMedioAnterior * 2)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {clienteSeleccionado.ticketMedio > clienteSeleccionado.ticketMedioAnterior 
                          ? `+${((clienteSeleccionado.ticketMedio / clienteSeleccionado.ticketMedioAnterior - 1) * 100).toFixed(1)}%` 
                          : `${((clienteSeleccionado.ticketMedio / clienteSeleccionado.ticketMedioAnterior - 1) * 100).toFixed(1)}%`
                        } respecto al periodo anterior
                      </p>
                    </CardContent>
                  </Card>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clienteSeleccionado.email && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Email</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.email}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.telefono && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Teléfono</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.telefono}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.direccion && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Dirección</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.direccion}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.fechaCumpleanos && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Cake className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Cumpleaños</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.fechaCumpleanos}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.pdvHabitual && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Store className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">PDV Habitual</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.pdvHabitual}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.marcaFavorita && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Crown className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Marca Favorita</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.marcaFavorita}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.productoFavorito && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Heart className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Producto Favorito</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.productoFavorito}</p>
                        </div>
                      </div>
                    )}
                    {clienteSeleccionado.frecuenciaCompra && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Frecuencia de Compra</p>
                          <p className="text-sm text-gray-900">{clienteSeleccionado.frecuenciaCompra}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* TAB 2: HISTORIAL */}
                <TabsContent value="historial" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Historial de Pedidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        Funcionalidad en desarrollo
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 3: PROMOCIONES */}
                <TabsContent value="promociones" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Promociones Activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        Funcionalidad en desarrollo
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 4: FAVORITOS */}
                <TabsContent value="favoritos" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Productos Favoritos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        Funcionalidad en desarrollo
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            {modoEdicion ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setModoEdicion(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    toast.success(`Cliente ${clienteSeleccionado?.nombre} actualizado correctamente`);
                    setModoEdicion(false);
                  }}
                >
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setModalVerDetalles(false)}
              >
                Cerrar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Añadir Anotación */}
      <Dialog open={modalAñadirAnotacion} onOpenChange={setModalAñadirAnotacion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Añadir Nueva Anotación</DialogTitle>
            <DialogDescription>
              Agrega una nota sobre {clienteSeleccionado?.nombre}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha y Hora</Label>
                <Input 
                  type="datetime-local" 
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="space-y-2">
                <Label>Punto de Venta</Label>
                <Select defaultValue="PV001">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar PDV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PV001">PV001 - Centro</SelectItem>
                    <SelectItem value="PV002">PV002 - Norte</SelectItem>
                    <SelectItem value="PV003">PV003 - Sur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anotación</Label>
              <Textarea 
                placeholder="Escribe aquí la anotación sobre el cliente..."
                value={nuevaAnotacion}
                onChange={(e) => setNuevaAnotacion(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setModalAñadirAnotacion(false);
                setNuevaAnotacion('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => {
                if (nuevaAnotacion.trim()) {
                  const now = new Date();
                  const nuevaAnotacionObj = {
                    id: Date.now().toString(),
                    fecha: now.toLocaleDateString('es-ES'),
                    hora: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    pdv: 'PV001 - Centro',
                    usuario: 'María García (Gerente)',
                    texto: nuevaAnotacion
                  };
                  setAnotaciones([nuevaAnotacionObj, ...anotaciones]);
                  setNuevaAnotacion('');
                  setModalAñadirAnotacion(false);
                  toast.success('Anotación añadida correctamente');
                }
              }}
            >
              Guardar Anotación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nuevo Cliente */}
      <Dialog open={modalNuevoCliente} onOpenChange={setModalNuevoCliente}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Registra un nuevo cliente en el sistema
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={tabNuevoCliente} onValueChange={setTabNuevoCliente}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="promociones">Promociones</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nombre Completo *</Label>
                <Input 
                  placeholder="Ej: Juan Pérez" 
                  value={nuevoClienteNombre}
                  onChange={(e) => setNuevoClienteNombre(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="correo@ejemplo.com"
                    value={nuevoClienteEmail}
                    onChange={(e) => setNuevoClienteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input 
                    placeholder="+34 600 000 000"
                    value={nuevoClienteTelefono}
                    onChange={(e) => setNuevoClienteTelefono(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Checkbox Enviar Invitación */}
              <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="enviar-invitacion"
                    checked={enviarInvitacion}
                    onChange={(e) => setEnviarInvitacion(e.target.checked)}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="enviar-invitacion" className="cursor-pointer font-semibold text-gray-900">
                      Enviar invitación
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Envío automático al cliente acceso a la app
                    </p>
                    
                    {enviarInvitacion && (
                      <div className="mt-3 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-700">Marca:</Label>
                          <Select 
                            value={marcaSeleccionadaInvitacion} 
                            onValueChange={setMarcaSeleccionadaInvitacion}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona una marca" />
                            </SelectTrigger>
                            <SelectContent>
                              {MARCAS_ARRAY.map((marca) => (
                                <SelectItem key={marca.id} value={marca.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{getIconoMarca(marca.id)}</span>
                                    <span>{marca.nombre}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-700">Canal de envío:</Label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setCanalInvitacion('whatsapp')}
                              className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                                canalInvitacion === 'whatsapp'
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCanalInvitacion('sms')}
                              className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                                canalInvitacion === 'sms'
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4" />
                                SMS
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCanalInvitacion('email')}
                              className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                                canalInvitacion === 'email'
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-600'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input 
                  placeholder="Calle, número, ciudad"
                  value={nuevoClienteDireccion}
                  onChange={(e) => setNuevoClienteDireccion(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input 
                    placeholder="28001"
                    value={nuevoClienteCodigoPostal}
                    onChange={(e) => setNuevoClienteCodigoPostal(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Cumpleaños</Label>
                  <Input 
                    type="date"
                    value={nuevoClienteFechaCumpleanos}
                    onChange={(e) => setNuevoClienteFechaCumpleanos(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Campos obligatorios: Nombre completo y al menos Email o Teléfono
              </p>
            </TabsContent>

            <TabsContent value="promociones" className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">
                Selecciona las promociones que quieres aplicar a este nuevo cliente
              </p>
              {/* Aquí iría la lista de promociones disponibles */}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              setModalNuevoCliente(false);
              setTabNuevoCliente('info');
              // Limpiar formulario al cancelar
              setNuevoClienteNombre('');
              setNuevoClienteEmail('');
              setNuevoClienteTelefono('');
              setNuevoClienteDireccion('');
              setNuevoClienteCodigoPostal('');
              setNuevoClienteFechaCumpleanos('');
              setEnviarInvitacion(false);
              setCanalInvitacion('whatsapp');
              setMarcaSeleccionadaInvitacion('hoypecamos');
            }}>
              Cancelar
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700" 
              onClick={handleCrearCliente}
            >
              Crear Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Exportar Cliente Personalizado */}
      <Dialog open={modalExportarClientePersonalizado} onOpenChange={setModalExportarClientePersonalizado}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Exportar Cliente - {clienteParaExportar?.nombre}
            </DialogTitle>
            <DialogDescription>
              Selecciona la información que deseas exportar y el formato de descarga
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Selección de campos a exportar */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Información a Exportar</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Datos Básicos */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-datos-basicos"
                    checked={camposExportacion.datosBasicos}
                    onChange={(e) => setCamposExportacion({...camposExportacion, datosBasicos: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-datos-basicos" className="cursor-pointer font-medium text-gray-900">
                      Datos Básicos
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ID, nombre, fecha de alta, tipo de cliente
                    </p>
                  </div>
                </div>

                {/* Datos de Contacto */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-contacto"
                    checked={camposExportacion.datosContacto}
                    onChange={(e) => setCamposExportacion({...camposExportacion, datosContacto: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-contacto" className="cursor-pointer font-medium text-gray-900">
                      Datos de Contacto
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Email, teléfono, cumpleaños
                    </p>
                  </div>
                </div>

                {/* Dirección */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-direccion"
                    checked={camposExportacion.direccion}
                    onChange={(e) => setCamposExportacion({...camposExportacion, direccion: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-direccion" className="cursor-pointer font-medium text-gray-900">
                      Dirección
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Dirección completa, CP, ciudad
                    </p>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-estadisticas"
                    checked={camposExportacion.estadisticas}
                    onChange={(e) => setCamposExportacion({...camposExportacion, estadisticas: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-estadisticas" className="cursor-pointer font-medium text-gray-900">
                      Estadísticas
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Nº pedidos, ticket medio, gasto total
                    </p>
                  </div>
                </div>

                {/* Historial de Pedidos */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-historial"
                    checked={camposExportacion.historialPedidos}
                    onChange={(e) => setCamposExportacion({...camposExportacion, historialPedidos: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-historial" className="cursor-pointer font-medium text-gray-900">
                      Historial de Pedidos
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Listado completo de pedidos
                    </p>
                  </div>
                </div>

                {/* Promociones */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-promociones"
                    checked={camposExportacion.promociones}
                    onChange={(e) => setCamposExportacion({...camposExportacion, promociones: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-promociones" className="cursor-pointer font-medium text-gray-900">
                      Promociones
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Promociones enviadas y canjeadas
                    </p>
                  </div>
                </div>

                {/* Valoraciones */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-valoraciones"
                    checked={camposExportacion.valoraciones}
                    onChange={(e) => setCamposExportacion({...camposExportacion, valoraciones: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-valoraciones" className="cursor-pointer font-medium text-gray-900">
                      Valoraciones
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Reseñas y puntuaciones
                    </p>
                  </div>
                </div>

                {/* Anotaciones */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-anotaciones"
                    checked={camposExportacion.anotaciones}
                    onChange={(e) => setCamposExportacion({...camposExportacion, anotaciones: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-anotaciones" className="cursor-pointer font-medium text-gray-900">
                      Anotaciones
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Notas internas del gerente
                    </p>
                  </div>
                </div>

                {/* Preferencias */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-preferencias"
                    checked={camposExportacion.preferencias}
                    onChange={(e) => setCamposExportacion({...camposExportacion, preferencias: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-preferencias" className="cursor-pointer font-medium text-gray-900">
                      Preferencias
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      PDV habitual, marca preferida
                    </p>
                  </div>
                </div>

                {/* Segmentación */}
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    id="campo-segmentacion"
                    checked={camposExportacion.segmentacion}
                    onChange={(e) => setCamposExportacion({...camposExportacion, segmentacion: e.target.checked})}
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Label htmlFor="campo-segmentacion" className="cursor-pointer font-medium text-gray-900">
                      Segmentación
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Segmentos, canal preferido
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones rápidos */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setCamposExportacion({
                    datosBasicos: true,
                    datosContacto: true,
                    direccion: true,
                    estadisticas: true,
                    historialPedidos: true,
                    promociones: true,
                    valoraciones: true,
                    anotaciones: true,
                    preferencias: true,
                    segmentacion: true
                  })}
                >
                  Seleccionar Todos
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setCamposExportacion({
                    datosBasicos: false,
                    datosContacto: false,
                    direccion: false,
                    estadisticas: false,
                    historialPedidos: false,
                    promociones: false,
                    valoraciones: false,
                    anotaciones: false,
                    preferencias: false,
                    segmentacion: false
                  })}
                >
                  Deseleccionar Todos
                </Button>
              </div>
            </div>

            {/* Formato de exportación */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Formato de Exportación</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <Card 
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-green-600" 
                  onClick={() => handleExportarPersonalizado('excel')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Documento Excel</h4>
                          <p className="text-sm text-gray-600">Formato .xlsx para edición y análisis</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-blue-600" 
                  onClick={() => handleExportarPersonalizado('csv')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Archivo CSV</h4>
                          <p className="text-sm text-gray-600">Formato .csv para importar en otros sistemas</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-red-600" 
                  onClick={() => handleExportarPersonalizado('pdf')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-red-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">Documento PDF</h4>
                          <p className="text-sm text-gray-600">Formato .pdf para impresión y compartir</p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalExportarClientePersonalizado(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Exportar */}
      <Dialog open={modalExportar} onOpenChange={setModalExportar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Exportar {
                tipoExportacion === 'clientes' ? 'Clientes' :
                tipoExportacion === 'facturas' ? 'Facturas' :
                tipoExportacion === 'valoraciones' ? 'Valoraciones' :
                'Promociones'
              }
            </DialogTitle>
            <DialogDescription>
              Selecciona el formato en el que deseas exportar los datos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Exportando a Excel...')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Documento Excel</h4>
                      <p className="text-sm text-gray-600">Formato .xlsx para edición</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Exportando a CSV...')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Archivo CSV</h4>
                      <p className="text-sm text-gray-600">Formato .csv para importar</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info('Exportando a PDF...')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-red-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Documento PDF</h4>
                      <p className="text-sm text-gray-600">Formato .pdf para impresión</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalExportar(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Nuevo Producto - Wizard de 5 pasos */}
      <Dialog open={modalNuevoProducto} onOpenChange={setModalNuevoProducto}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              Crear Nuevo Producto
            </DialogTitle>
            <DialogDescription>
              Completa los {pasoActual === 1 ? '5 pasos' : `${5 - pasoActual + 1} pasos restantes`} del asistente para crear un nuevo producto en tu catálogo.
            </DialogDescription>
          </DialogHeader>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5].map((paso) => (
              <div key={paso} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  pasoActual === paso ? 'bg-teal-600 text-white' : 
                  pasoActual > paso ? 'bg-teal-100 text-teal-600' : 
                  'bg-gray-100 text-gray-400'
                } font-semibold text-sm`}>
                  {paso}
                </div>
                {paso < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    pasoActual > paso ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Paso 1: Selección de tipo de producto */}
          {pasoActual === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Selecciona el tipo de producto</h3>
                <p className="text-sm text-gray-600">Elige cómo quieres crear tu producto</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Producto Simple */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    tipoProducto === 'simple' ? 'border-2 border-teal-600 bg-teal-50' : 'border-2 border-transparent'
                  }`}
                  onClick={() => setTipoProducto('simple')}
                >
                  <CardContent className="p-6 text-center">
                    <Coffee className={`w-12 h-12 mx-auto mb-3 ${tipoProducto === 'simple' ? 'text-teal-600' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Producto Simple</h4>
                    <p className="text-sm text-gray-600">
                      Producto único sin componentes. Ej: Café, Agua, Galleta
                    </p>
                  </CardContent>
                </Card>

                {/* Producto Manufacturado */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    tipoProducto === 'manufacturado' ? 'border-2 border-teal-600 bg-teal-50' : 'border-2 border-transparent'
                  }`}
                  onClick={() => setTipoProducto('manufacturado')}
                >
                  <CardContent className="p-6 text-center">
                    <ChefHat className={`w-12 h-12 mx-auto mb-3 ${tipoProducto === 'manufacturado' ? 'text-teal-600' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Manufacturado</h4>
                    <p className="text-sm text-gray-600">
                      Producto con escandallo de ingredientes. Ej: Bocadillo, Tarta
                    </p>
                  </CardContent>
                </Card>

                {/* Combo/Pack */}
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    tipoProducto === 'combo' ? 'border-2 border-teal-600 bg-teal-50' : 'border-2 border-transparent'
                  }`}
                  onClick={() => setTipoProducto('combo')}
                >
                  <CardContent className="p-6 text-center">
                    <Package className={`w-12 h-12 mx-auto mb-3 ${tipoProducto === 'combo' ? 'text-teal-600' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-gray-900 mb-2">Combo/Pack</h4>
                    <p className="text-sm text-gray-600">
                      Combinación de productos. Ej: Menú desayuno, Pack familiar
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      {tipoProducto === 'simple' && 'Un producto simple no tiene ingredientes ni componentes. Su precio se define directamente.'}
                      {tipoProducto === 'manufacturado' && 'Un producto manufacturado requiere un escandallo de ingredientes. El coste se calcula automáticamente.'}
                      {tipoProducto === 'combo' && 'Un combo agrupa varios productos existentes. Puedes definir un precio especial o usar la suma de componentes.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Información general */}
          {pasoActual === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Información General</h3>
                <p className="text-sm text-gray-600">Completa los datos básicos del producto</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre del producto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del producto *
                  </label>
                  <Input 
                    placeholder="Ej: Café con leche grande"
                    className="w-full"
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                    <option value="">Seleccionar categoría</option>
                    <option value="bebidas">☕ Bebidas</option>
                    <option value="panaderia">🥖 Panadería</option>
                    <option value="reposteria">🍰 Repostería</option>
                    <option value="salado">🥪 Salado</option>
                    <option value="dulces">🍪 Dulces</option>
                    <option value="otros">📦 Otros</option>
                  </select>
                </div>

                {/* Código SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código SKU
                  </label>
                  <Input 
                    placeholder="Autogenerado si vacío"
                    className="w-full"
                  />
                </div>

                {/* Imagen del producto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del producto
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Haz clic o arrastra una imagen</p>
                    <p className="text-xs text-gray-400">PNG, JPG hasta 5MB</p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea 
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descripción breve del producto..."
                  />
                </div>

                {/* Disponible para venta online */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={visibilidadApp}
                      onChange={(e) => setVisibilidadApp(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Disponible para pedidos online</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Escandallo (solo para manufacturados) */}
          {pasoActual === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {tipoProducto === 'manufacturado' ? 'Escandallo de Ingredientes' : 
                   tipoProducto === 'combo' ? 'Productos del Combo' : 
                   'Configuración'}
                </h3>
                <p className="text-sm text-gray-600">
                  {tipoProducto === 'manufacturado' ? 'Define los ingredientes y sus cantidades' : 
                   tipoProducto === 'combo' ? 'Selecciona los productos que incluye el combo' : 
                   'Este tipo de producto no requiere configuración adicional'}
                </p>
              </div>

              {tipoProducto === 'manufacturado' && (
                <>
                  {/* Lista de ingredientes */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ingrediente</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Cantidad</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Unidad</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Coste/ud</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                          <th className="w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="py-3 px-4">
                            <select className="w-full border rounded px-2 py-1 text-sm">
                              <option>Harina (Kg)</option>
                              <option>Mantequilla (Kg)</option>
                              <option>Azúcar (Kg)</option>
                              <option>Huevos (Unidad)</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <Input type="number" className="w-full text-center" placeholder="0.5" step="0.01" />
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">Kg</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">€2.50</td>
                          <td className="py-3 px-4 text-center text-sm font-semibold text-gray-900">€1.25</td>
                          <td className="py-3 px-4 text-center">
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Botón añadir ingrediente */}
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Ingrediente
                  </Button>

                  {/* Resumen de costes */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coste materias primas:</span>
                      <span className="font-semibold text-gray-900">€1.25</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Merma estimada (10%):</span>
                      <span className="font-semibold text-gray-900">€0.13</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Coste total por unidad:</span>
                      <span className="font-semibold text-teal-600">€1.38</span>
                    </div>
                  </div>
                </>
              )}

              {tipoProducto === 'combo' && (
                <>
                  {/* Selector de productos para combo */}
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Coffee className="w-8 h-8 text-teal-600" />
                            <div>
                              <p className="font-medium text-gray-900">Café con leche</p>
                              <p className="text-sm text-gray-500">€2.50</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Producto al Combo
                  </Button>

                  {/* Resumen del combo */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Suma de productos:</span>
                      <span className="font-semibold text-gray-900">€2.50</span>
                    </div>
                  </div>
                </>
              )}

              {tipoProducto === 'simple' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Info className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-blue-800">
                    Los productos simples no requieren escandallo. Continúa al siguiente paso para configurar precios.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Precios y Stock */}
          {pasoActual === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Configuración de Precios y Stock</h3>
                <p className="text-sm text-gray-600">Define los precios de venta y stock inicial</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precio de coste */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de coste
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      className="pl-7"
                      placeholder="0.00"
                      value={precioCosteAuto || precioCoste || ''}
                      onChange={(e) => setPrecioCoste(e.target.value ? parseFloat(e.target.value) : 0)}
                      disabled={tipoProducto === 'manufacturado'}
                    />
                  </div>
                  {tipoProducto === 'manufacturado' && (
                    <p className="text-xs text-gray-500 mt-1">Calculado del escandallo</p>
                  )}
                </div>

                {/* Margen deseado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margen deseado
                  </label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      step="1"
                      className="pr-7"
                      placeholder="60"
                      value={multiplicador}
                      onChange={(e) => setMultiplicador(parseInt(e.target.value) || 0)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>

                {/* PVP Calculado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PVP Calculado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      className="pl-7 bg-gray-50"
                      value={pvpCalculado}
                      disabled
                    />
                  </div>
                </div>

                {/* PVP Final (Manual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PVP Final (Manual)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    <Input 
                      type="number" 
                      step="0.01"
                      className="pl-7"
                      placeholder="3.50"
                      value={pvpManual || ''}
                      onChange={(e) => setPvpManual(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                </div>

                {/* IVA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA
                  </label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    value={ivaSeleccionado}
                    onChange={(e) => setIvaSeleccionado(e.target.value)}
                  >
                    <option value="21">21% (General)</option>
                    <option value="10">10% (Reducido)</option>
                    <option value="4">4% (Superreducido)</option>
                    <option value="0">0% (Exento)</option>
                  </select>
                </div>

                {/* Stock inicial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock inicial
                  </label>
                  <Input 
                    type="number" 
                    step="1"
                    placeholder="0"
                  />
                </div>

                {/* Punto de venta por defecto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Punto de venta por defecto
                  </label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500">
                    <option value="">Todos los PDV</option>
                    <option value="norte">PDV Norte</option>
                    <option value="centro">PDV Centro</option>
                    <option value="sur">PDV Sur</option>
                  </select>
                </div>
              </div>

              {/* Resumen visual */}
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6 border border-teal-200">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Margen final</p>
                  <p className="text-3xl font-bold text-teal-600">61.5%</p>
                  <p className="text-xs text-gray-500">Beneficio: €2.12 por unidad</p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 5: Resumen */}
          {pasoActual === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Resumen del Producto</h3>
                <p className="text-sm text-gray-600">Revisa la información antes de crear el producto</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información general */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-teal-600" />
                      Información General
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium text-gray-900 capitalize">{tipoProducto}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium text-gray-900">Café con leche</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium text-gray-900">Bebidas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium text-gray-900 font-mono">PRD-AUTO-001</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Precios */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Euro className="w-4 h-4 text-teal-600" />
                      Precios y Márgenes
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coste:</span>
                        <span className="font-medium text-gray-900">€1.38</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PVP:</span>
                        <span className="font-medium text-gray-900">€3.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IVA:</span>
                        <span className="font-medium text-gray-900">21%</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Margen:</span>
                        <span className="font-semibold text-teal-600">61.5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stock */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-teal-600" />
                      Stock y Disponibilidad
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock inicial:</span>
                        <span className="font-medium text-gray-900">50 unidades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PDV:</span>
                        <span className="font-medium text-gray-900">Todos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Online:</span>
                        <span className="font-medium text-green-600">Sí</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Escandallo (solo manufacturados) */}
                {tipoProducto === 'manufacturado' && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-teal-600" />
                        Escandallo
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ingredientes:</span>
                          <span className="font-medium text-gray-900">1 item</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coste materias:</span>
                          <span className="font-medium text-gray-900">€1.25</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Merma (10%):</span>
                          <span className="font-medium text-gray-900">€0.13</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 mb-1">Todo listo para crear el producto</p>
                    <p className="text-sm text-green-700">
                      Al confirmar, el producto se creará y estará disponible para su venta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between items-center pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (pasoActual === 1) {
                  setModalNuevoProducto(false);
                  setPasoActual(1);
                } else {
                  setPasoActual(pasoActual - 1);
                }
              }}
            >
              {pasoActual === 1 ? 'Cancelar' : 'Anterior'}
            </Button>

            <div className="text-sm text-gray-500">
              Paso {pasoActual} de 5
            </div>

            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={async () => {
                if (pasoActual === 5) {
                  // Llamar a la API para crear el producto
                  try {
                    const nuevoProducto = {
                      nombre: nombreProducto || 'Café con leche',
                      descripcion: 'Descripción del producto',
                      precio: pvpManual || pvpCalculado || 3.50,
                      stock: 0
                    };

                    const productoCreado = await productosApi.create(nuevoProducto);
                    
                    if (productoCreado) {
                      // Agregar producto a la lista en estado
                      const productoFormateado: Producto = {
                        id: productoCreado.id.toString(),
                        nombre: productoCreado.nombre,
                        descripcion: productoCreado.descripcion || '',
                        precio: productoCreado.precio,
                        stock: productoCreado.stock,
                        imagen: productoCreado.imagen
                      };
                      setProductosState([...productosState, productoFormateado]);
                      
                      toast.success('✅ Producto creado correctamente');
                      setModalNuevoProducto(false);
                      setPasoActual(1);
                      // Resetear estados del formulario
                      setNombreProducto('');
                      setPrecioCoste(0);
                      setPrecioCosteAuto(0);
                      setMultiplicador(3);
                      setPvpCalculado(0);
                      setPvpManual(null);
                      setIvaSeleccionado('21');
                      setVisibilidadApp(true);
                      setVisibilidadTPV(true);
                      setTipoProducto('simple');
                      setIngredientesSeleccionados([]);
                      setProductosComboSeleccionados([]);
                    }
                  } catch (error) {
                    console.error('Error al crear producto:', error);
                    toast.error('❌ Error al crear el producto');
                  }
                } else {
                  setPasoActual(pasoActual + 1);
                }
              }}
            >
              {pasoActual === 5 ? 'Crear Producto' : 'Siguiente'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientesGerente;
