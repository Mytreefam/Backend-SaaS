import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { FiltroEstandarGerente } from './FiltroEstandarGerente';
import { 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  PUNTOS_VENTA_ARRAY,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca
} from '../../constants/empresaConfig';
import { stockApi } from '../../services/api/gerente.api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  Package,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  Download,
  ShoppingCart,
  PackagePlus,
  RefreshCw,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  Warehouse,
  Clock,
  BarChart3,
  ArrowUpDown,
  Eye,
  FileBarChart,
  Truck,
  ArrowRightLeft,
  AlertTriangle,
  Minus,
  DollarSign,
  Star,
  Building2,
  ScanLine,
  Users,
  Calendar,
  XCircle,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Phone,
  CheckCircle,
  FileDown,
  FileSpreadsheet,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ModalDetalleArticulo } from './modales/ModalDetalleArticulo';
import { RecepcionMaterialModal } from '../trabajador/RecepcionMaterialModal';
import { ModalNuevoPedido as ModalNuevoPedidoV2 } from './modales/ModalNuevoPedido';
import { ModalNuevoProveedor } from './modales/ModalNuevoProveedor';
import { ModalNuevoArticulo } from './modales/ModalNuevoArticulo';
import { ModalNuevoPedidoProveedor } from './modales/ModalNuevoPedidoProveedor';
import { RecepcionMaterialModal as ModalRecepcionMaterial } from './modales/ModalRecepcionMaterial';
import { useStock } from '../../contexts/StockContext';

interface ProveedorArticulo {
  proveedorId: string;
  proveedorNombre: string;
  codigoProveedor: string; // Código que usa el proveedor para este artículo
  nombreProveedor: string; // Nombre que usa el proveedor para este artículo
  precioCompra: number; // Precio SIN IVA
  iva: number; // Porcentaje de IVA (4, 10 o 21)
  recargoEquivalencia: number; // Porcentaje de recargo de equivalencia (0, 0.5, 1.4, 5.2)
  ultimaCompra: string; // Fecha última compra
  ultimaFactura: string; // ID de la última factura
  esPreferente: boolean;
  activo: boolean;
}

interface SKU {
  id: string;
  codigo: string; // NUESTRO código interno
  nombre: string; // NUESTRO nombre
  imagen?: string;
  categoria: string;
  empresa: string;
  almacen: string;
  ubicacion: string;
  pasillo: string;
  estanteria: string;
  hueco: string;
  disponible: number;
  comprometido: number;
  minimo: number;
  maximo: number;
  rop: number;
  costoMedio: number;
  pvp: number;
  proveedores: ProveedorArticulo[]; // Array de proveedores para este artículo
  proveedorPreferente: string; // ID del proveedor preferente
  ultimaCompra: string;
  leadTime: number;
  estado: 'bajo' | 'ok' | 'sobrestock';
  rotacion: number;
}

interface Proveedor {
  id: string;
  nombre: string;
  sla: number;
  rating: number;
  leadTime: number;
  precioMedio: number;
  pedidosActivos: number;
  imagen?: string;
}

interface SesionInventario {
  id: string;
  nombre: string;
  tipo: 'total' | 'ciclico' | 'rapido';
  almacen: string;
  progreso: number;
  diferenciasUnidades: number;
  diferenciasValor: number;
  responsables: string[];
  fechaLimite: string;
  estado: 'activa' | 'pausada' | 'completada';
}

interface Transferencia {
  id: string;
  origen: string;
  destino: string;
  skus: number;
  responsable: string;
  fecha: string;
  estado: 'borrador' | 'transito' | 'recibida';
}

interface SugerenciaCompra {
  sku: SKU;
  cantidadRecomendada: number;
  costoEstimado: number;
}

interface ArticuloPedido {
  id: string;
  codigo: string;
  codigoProveedor: string;
  nombre: string;
  nombreProveedor: string;
  cantidad: number;
  precioUnitario: number; // Precio SIN IVA
  iva: number; // Porcentaje de IVA
  recargoEquivalencia: number; // Porcentaje de recargo
  subtotal: number; // Subtotal SIN IVA
  totalConImpuestos: number; // Total CON IVA + Recargo
}

interface PedidoProveedor {
  id: string;
  numeroPedido: string;
  proveedorId: string;
  proveedorNombre: string;
  estado: 'solicitado' | 'confirmado' | 'en-transito' | 'entregado' | 'reclamado' | 'anulado';
  fechaSolicitud: string;
  fechaConfirmacion?: string;
  fechaEntrega?: string;
  fechaEstimadaEntrega?: string;
  articulos: ArticuloPedido[];
  subtotal: number; // Subtotal SIN IVA
  totalIva: number; // Total de IVA
  totalRecargoEquivalencia: number; // Total de Recargo de Equivalencia
  total: number; // Total CON IVA + Recargo
  anotaciones?: string;
  metodoEnvio?: 'email' | 'whatsapp' | 'app' | 'telefono';
  responsable: string;
  facturaId?: string;
  facturaCaseada?: boolean;
}

export function StockProveedores() {
  // ✅ HOOK DE STOCKCONTEXT - Sincronización en tiempo real
  const {
    stock: stockFromContext,
    pedidosProveedores: pedidosFromContext,
    proveedores: proveedoresFromContext,
    empresaActiva,
    puntoVentaActivo,
    getStockPorPuntoVenta,
    getPedidosPorPuntoVenta,
    crearPedidoProveedor,
    registrarRecepcion,
  } = useStock();

  // Estados para carga de datos de la API
  const [cargandoStock, setCargandoStock] = useState(true);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);

  const [vistaActual, setVistaActual] = useState<'inventario' | 'pedidos' | 'proveedores' | 'sesiones' | 'transferencias'>('inventario');
  const [busqueda, setBusqueda] = useState('');
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<string[]>([]);
  const [panelSugerenciasAbierto, setPanelSugerenciasAbierto] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState<SKU | null>(null);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [modalRecepcionAbierto, setModalRecepcionAbierto] = useState(false);
  const [modalNuevoPedidoV2, setModalNuevoPedidoV2] = useState(false);
  const [columnasOcultas, setColumnasOcultas] = useState(false); // Control de columnas Código y Categoría
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [tabPedido, setTabPedido] = useState<'pedidos' | 'resumen'>('pedidos');
  const [totalPedidosEnviados, setTotalPedidosEnviados] = useState(0);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  
  // Estados para modal de proveedor
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
  const [seccionProveedorActiva, setSeccionProveedorActiva] = useState<'info' | 'historial' | 'acuerdos' | 'contacto'>('info');
  
  // Estados para la pestaña Contacto
  const [enviarPorEmail, setEnviarPorEmail] = useState(false);
  const [emailContacto, setEmailContacto] = useState('');
  const [enviarPorWhatsApp, setEnviarPorWhatsApp] = useState(false);
  const [numeroWhatsApp, setNumeroWhatsApp] = useState('');
  const [enviarInvitacionApp, setEnviarInvitacionApp] = useState(false);
  
  // Estados para modal de Nuevo Proveedor
  const [modalNuevoProveedorAbierto, setModalNuevoProveedorAbierto] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    nombreComercial: '',
    cif: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    provincia: '',
    pais: 'España',
    telefono: '',
    email: '',
    personaContacto: '',
    cargoContacto: '',
    telefonoContacto: '',
    emailContacto: '',
    iban: '',
    formaPago: 'transferencia',
    plazosPago: '30',
    tipoProveedor: 'materias_primas',
    categorias: [] as string[],
    notas: ''
  });
  
  // ✅ NUEVOS ESTADOS PARA CRUD
  const [showModalNuevoProveedor, setShowModalNuevoProveedor] = useState(false);
  const [showModalNuevoArticulo, setShowModalNuevoArticulo] = useState(false);
  const [showModalNuevoPedido, setShowModalNuevoPedido] = useState(false);
  const [showModalRecepcion, setShowModalRecepcion] = useState(false);
  const [showModalNuevaSesion, setShowModalNuevaSesion] = useState(false);
  
  const [editingProveedor, setEditingProveedor] = useState<any>(null);
  const [editingArticulo, setEditingArticulo] = useState<any>(null);
  const [editingPedido, setEditingPedido] = useState<any>(null);
  const [selectedPedidoRecepcion, setSelectedPedidoRecepcion] = useState<any>(null);
  
  const [proveedoresData, setProveedoresData] = useState<any[]>([]);
  const [articulosData, setArticulosData] = useState<any[]>([]);
  const [pedidosData, setPedidosData] = useState<any[]>([]);
  const [sesionesInventarioData, setSesionesInventarioData] = useState<any[]>([]);
  
  // Estados para formulario de nueva sesión
  const [nuevaSesionForm, setNuevaSesionForm] = useState({
    nombre: '',
    tipo: 'ciclico',
    almacen: 'PDV',
    responsables: '',
    fechaLimite: '',
    observaciones: ''
  });
  
  // Estados para controlar la visibilidad de secciones en el modal de detalles
  const [seccionesVisibles, setSeccionesVisibles] = useState({
    informacionBasica: false,
    informacionStock: true,
    ubicacion: false,
    informacionEconomica: false,
    escandallo: true,
    proveedor: false,
    historialCompras: false,
    analisis: true
  });

  // ✅ Cargar datos de stock y proveedores desde la API
  useEffect(() => {
    const cargarDatosStock = async () => {
      setCargandoStock(true);
      try {
        const [articulosData, proveedoresData] = await Promise.all([
          stockApi.obtenerArticulos({
            empresa_id: empresaActiva,
            punto_venta_id: puntoVentaActivo
          }),
          stockApi.obtenerProveedores({
            empresa_id: empresaActiva
          })
        ]);

        // La API ya devuelve los datos, se usan directamente
        // El StockContext se encargará de sincronizar si es necesario
        console.log('Datos cargados desde API:', { articulosData, proveedoresData });
      } catch (error) {
        console.error('Error cargando datos de stock:', error);
        toast.error('Error cargando inventario. Mostrando datos locales.');
      } finally {
        setCargandoStock(false);
        setCargandoProveedores(false);
      }
    };

    cargarDatosStock();
  }, [empresaActiva, puntoVentaActivo]);

  // ✅ FUNCIONES DE CARGA DE DATOS PARA CRUD
  const cargarProveedores = async () => {
    try {
      console.log('📥 Cargando proveedores con empresaActiva:', empresaActiva);
      const response = await stockApi.obtenerProveedores({
        empresa_id: empresaActiva
      });
      console.log('✅ Respuesta proveedores (completa):', JSON.stringify(response, null, 2));
      if (Array.isArray(response)) {
        setProveedoresData(response);
        console.log('✅ Proveedores cargados:', response.length, 'IDs:', response.map((p: any) => p.id || p.proveedor_id));
      } else if (response.success) {
        setProveedoresData(response.data || []);
        console.log('✅ Proveedores cargados:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando proveedores:', error);
      toast.error('Error al cargar proveedores');
    }
  };

  const cargarArticulos = async () => {
    try {
      console.log('📥 Cargando artículos con empresa:', empresaActiva, 'PDV:', puntoVentaActivo);
      const response = await stockApi.obtenerArticulosStock({
        empresa_id: empresaActiva,
        punto_venta_id: puntoVentaActivo
      });
      console.log('✅ Respuesta artículos (completa):', JSON.stringify(response, null, 2));
      // Si es un array directo
      if (Array.isArray(response)) {
        setArticulosData(response);
        console.log('✅ Artículos cargados:', response.length, 'IDs:', response.map((a: any) => a.id || a.articulo_id));
      } 
      // Si es un objeto con success
      else if (response.success) {
        setArticulosData(response.data || []);
        console.log('✅ Artículos cargados:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando artículos:', error);
      toast.error('Error al cargar artículos');
    }
  };

  const cargarPedidos = async () => {
    try {
      console.log('📥 Cargando pedidos con empresaActiva:', empresaActiva);
      const response = await stockApi.obtenerPedidosProveedor({
        empresa_id: empresaActiva
      });
      console.log('✅ Respuesta pedidos (completa):', JSON.stringify(response, null, 2));
      if (Array.isArray(response)) {
        setPedidosData(response);
        console.log('✅ Pedidos cargados:', response.length, 'IDs:', response.map((p: any) => p.id || p.numero));
      } else if (response.success) {
        setPedidosData(response.data || []);
        console.log('✅ Pedidos cargados:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      toast.error('Error al cargar pedidos');
    }
  };

  const cargarSesionesInventario = async () => {
    try {
      console.log('📥 Cargando sesiones de inventario con empresaActiva:', empresaActiva);
      const response = await stockApi.obtenerSesionesInventario({
        empresa_id: empresaActiva
      });
      console.log('✅ Respuesta sesiones:', response);
      if (Array.isArray(response)) {
        setSesionesInventarioData(response);
        console.log('✅ Sesiones cargadas:', response.length);
      } else if (response.success) {
        setSesionesInventarioData(response.data || []);
        console.log('✅ Sesiones cargadas:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error cargando sesiones de inventario:', error);
      toast.error('Error al cargar sesiones de inventario');
    }
  };

  // Función normalizadora para convertir estructura del API a estructura esperada
  const normalizarPedido = (pedidoApi: any) => {
    return {
      id: pedidoApi.id || pedidoApi.numero_pedido || '',
      numeroPedido: pedidoApi.numeroPedido || pedidoApi.numero_pedido || '',
      proveedorId: pedidoApi.proveedorId || pedidoApi.proveedor_id || '',
      proveedorNombre: pedidoApi.proveedorNombre || pedidoApi.nombre_proveedor || '',
      estado: pedidoApi.estado || pedidoApi.status || 'solicitado',
      fechaSolicitud: pedidoApi.fechaSolicitud || pedidoApi.fecha_solicitud || new Date().toISOString(),
      fechaConfirmacion: pedidoApi.fechaConfirmacion || pedidoApi.fecha_confirmacion,
      fechaEntrega: pedidoApi.fechaEntrega || pedidoApi.fecha_entrega,
      fechaEstimadaEntrega: pedidoApi.fechaEstimadaEntrega || pedidoApi.fecha_estimada_entrega,
      articulos: pedidoApi.articulos || pedidoApi.articles || [],
      subtotal: pedidoApi.subtotal || 0,
      totalIva: pedidoApi.totalIva || pedidoApi.total_iva || 0,
      totalRecargoEquivalencia: pedidoApi.totalRecargoEquivalencia || pedidoApi.total_recargo || 0,
      total: pedidoApi.total || 0,
      anotaciones: pedidoApi.anotaciones || pedidoApi.notes || '',
      metodoEnvio: pedidoApi.metodoEnvio || pedidoApi.metodo_envio || '',
      responsable: pedidoApi.responsable || pedidoApi.responsable_usuario || '',
      facturaId: pedidoApi.facturaId || pedidoApi.factura_id,
      facturaCaseada: pedidoApi.facturaCaseada || pedidoApi.factura_caseada || false
    };
  };

  const normalizarSesion = (sesionApi: any) => {
    return {
      id: sesionApi.id || sesionApi.sesion_id || '',
      nombre: sesionApi.nombre || sesionApi.name || '',
      tipo: sesionApi.tipo || sesionApi.type || 'ciclico',
      almacen: sesionApi.almacen || sesionApi.warehouse || '',
      progreso: sesionApi.progreso || sesionApi.progress || 0,
      diferenciasUnidades: sesionApi.diferenciasUnidades || sesionApi.diferencias_unidades || 0,
      diferenciasValor: sesionApi.diferenciasValor || sesionApi.diferencias_valor || 0,
      responsables: sesionApi.responsables || sesionApi.responsables_ids || [],
      fechaLimite: sesionApi.fechaLimite || sesionApi.fecha_limite || new Date().toISOString(),
      estado: sesionApi.estado || sesionApi.status || 'activa'
    };
  };

  const normalizarProveedor = (proveedorApi: any) => {
    return {
      id: proveedorApi.id || proveedorApi.proveedor_id || '',
      nombre: proveedorApi.nombre || proveedorApi.nombre_proveedor || proveedorApi.proveedor_nombre || ''
    };
  };

  const normalizarArticulo = (articuloApi: any) => {
    const normalizado = {
      id: articuloApi.id || articuloApi.articulo_id || articuloApi.sku_id || '',
      codigo: articuloApi.codigo || articuloApi.codigo_interno || '',
      nombre: articuloApi.nombre || articuloApi.articulo_nombre || '',
      precioUnitario: articuloApi.precioUnitario || articuloApi.precio_unitario || 0
    };
    console.log('🔧 Normalizando artículo:', { original: articuloApi, normalizado });
    return normalizado;
  };


  // useEffect para cargar datos cuando cambia la empresa o PDV
  useEffect(() => {
    if (empresaActiva) {
      cargarProveedores();
      cargarArticulos();
      cargarPedidos();
      cargarSesionesInventario();
    }
  }, [empresaActiva, puntoVentaActivo]);

  // ✅ DATOS DEL CONTEXTO (sincronizados en tiempo real)
  // Usar datos del contexto si están disponibles, sino usar mock local
  const skus: SKU[] = stockFromContext.length > 0 ? stockFromContext : [
    {
      id: 'SKU001',
      codigo: 'ART-001',
      nombre: 'Harina de Trigo T45',
      categoria: 'Harinas',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Tiana',
      ubicacion: 'Tiana',
      pasillo: 'A',
      estanteria: '01',
      hueco: '01',
      disponible: 15,
      comprometido: 5,
      minimo: 20,
      maximo: 50,
      rop: 25,
      costoMedio: 18.50,
      pvp: 28.00,
      proveedores: [
        {
          proveedorId: 'PROV-001',
          proveedorNombre: 'Harinas del Norte',
          codigoProveedor: 'HAR-001',
          nombreProveedor: 'Harina de Trigo T45 25kg',
          precioCompra: 18.50,
          iva: 4, // IVA superreducido para cereales/harinas
          recargoEquivalencia: 0.5,
          ultimaCompra: '2025-11-20',
          ultimaFactura: 'FACT-2025-101',
          esPreferente: true,
          activo: true
        },
        {
          proveedorId: 'PROV-005',
          proveedorNombre: 'Panadería Industrial',
          codigoProveedor: 'PI-T45-25',
          nombreProveedor: 'T45 Premium 25kg',
          precioCompra: 19.20,
          iva: 4,
          recargoEquivalencia: 0.5,
          ultimaCompra: '2025-10-15',
          ultimaFactura: 'FACT-2025-085',
          esPreferente: false,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-001',
      ultimaCompra: '2025-11-20',
      leadTime: 3,
      estado: 'bajo',
      rotacion: 35.5
    },
    {
      id: 'SKU002',
      codigo: 'ART-002',
      nombre: 'Queso Mozzarella',
      categoria: 'Lácteos',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Tiana',
      ubicacion: 'Tiana',
      pasillo: 'A',
      estanteria: '01',
      hueco: '02',
      disponible: 3,
      comprometido: 2,
      minimo: 8,
      maximo: 25,
      rop: 12,
      costoMedio: 22.80,
      pvp: 35.00,
      proveedores: [
        {
          proveedorId: 'PROV-002',
          proveedorNombre: 'Lácteos Premium',
          codigoProveedor: 'QUE-002',
          nombreProveedor: 'Mozzarella Fior di Latte 5kg',
          precioCompra: 22.80,
          iva: 4, // IVA superreducido para quesos
          recargoEquivalencia: 0.5,
          ultimaCompra: '2025-11-18',
          ultimaFactura: 'FACT-2025-098',
          esPreferente: true,
          activo: true
        },
        {
          proveedorId: 'PROV-007',
          proveedorNombre: 'Quesos Artesanales',
          codigoProveedor: 'QA-MOZ-5K',
          nombreProveedor: 'Mozzarella Italiana 5kg',
          precioCompra: 24.50,
          iva: 4,
          recargoEquivalencia: 0.5,
          ultimaCompra: '2025-09-22',
          ultimaFactura: 'FACT-2025-067',
          esPreferente: false,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-002',
      ultimaCompra: '2025-11-18',
      leadTime: 2,
      estado: 'bajo',
      rotacion: 42.3
    },
    {
      id: 'SKU003',
      codigo: 'ART-003',
      nombre: 'Tomate Triturado Natural',
      categoria: 'Conservas',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Tiana',
      ubicacion: 'Tiana',
      pasillo: 'B',
      estanteria: '02',
      hueco: '01',
      disponible: 8,
      comprometido: 3,
      minimo: 15,
      maximo: 40,
      rop: 20,
      costoMedio: 12.30,
      pvp: 18.50,
      proveedores: [
        {
          proveedorId: 'PROV-003',
          proveedorNombre: 'Conservas Mediterráneas',
          codigoProveedor: 'TOM-003',
          nombreProveedor: 'Tomate Triturado Lata 3kg',
          precioCompra: 12.30,
          iva: 10, // IVA reducido para conservas
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-11-15',
          ultimaFactura: 'FACT-2025-095',
          esPreferente: true,
          activo: true
        },
        {
          proveedorId: 'PROV-008',
          proveedorNombre: 'Importaciones Italianas',
          codigoProveedor: 'IT-TOM-3K',
          nombreProveedor: 'Pomodoro Pelato 3kg',
          precioCompra: 14.80,
          iva: 10,
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-08-10',
          ultimaFactura: 'FACT-2025-052',
          esPreferente: false,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-003',
      ultimaCompra: '2025-11-15',
      leadTime: 5,
      estado: 'bajo',
      rotacion: 28.8
    },
    {
      id: 'SKU004',
      codigo: 'ART-004',
      nombre: 'Carne de Ternera Premium',
      categoria: 'Cárnicos',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Badalona',
      ubicacion: 'Badalona',
      pasillo: 'C',
      estanteria: '01',
      hueco: '01',
      disponible: 12,
      comprometido: 8,
      minimo: 20,
      maximo: 50,
      rop: 25,
      costoMedio: 35.40,
      pvp: 52.00,
      proveedores: [
        {
          proveedorId: 'PROV-004',
          proveedorNombre: 'Cárnicos Selectos',
          codigoProveedor: 'CAR-004',
          nombreProveedor: 'Ternera Añojo Selección 5kg',
          precioCompra: 35.40,
          iva: 10, // IVA reducido para carne fresca
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-11-22',
          ultimaFactura: 'FACT-2025-103',
          esPreferente: true,
          activo: true
        },
        {
          proveedorId: 'PROV-009',
          proveedorNombre: 'Ganadería Premium',
          codigoProveedor: 'GP-TERN-5K',
          nombreProveedor: 'Ternera Gallega Premium 5kg',
          precioCompra: 38.90,
          iva: 10,
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-10-05',
          ultimaFactura: 'FACT-2025-078',
          esPreferente: false,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-004',
      ultimaCompra: '2025-11-22',
      leadTime: 2,
      estado: 'bajo',
      rotacion: 32.5
    },
    {
      id: 'SKU005',
      codigo: 'ART-005',
      nombre: 'Pan de Hamburguesa Brioche',
      categoria: 'Panadería',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Badalona',
      ubicacion: 'Badalona',
      pasillo: 'A',
      estanteria: '03',
      hueco: '01',
      disponible: 18,
      comprometido: 12,
      minimo: 30,
      maximo: 80,
      rop: 40,
      costoMedio: 15.60,
      pvp: 24.00,
      proveedores: [
        {
          proveedorId: 'PROV-005',
          proveedorNombre: 'Panadería Industrial',
          codigoProveedor: 'PAN-005',
          nombreProveedor: 'Brioche Burger Buns 50 uds',
          precioCompra: 15.60,
          iva: 4, // IVA superreducido para pan
          recargoEquivalencia: 0.5,
          ultimaCompra: '2025-11-21',
          ultimaFactura: 'FACT-2025-102',
          esPreferente: true,
          activo: true
        },
        {
          proveedorId: 'PROV-010',
          proveedorNombre: 'Bollería Artesanal',
          codigoProveedor: 'BA-BRIOCHE-50',
          nombreProveedor: 'Pan Brioche Hamburguesa x50',
          precioCompra: 17.20,
          iva: 4,
          recargoEquivalencia: 0.5,
          ultimaCompra: '2025-09-15',
          ultimaFactura: 'FACT-2025-065',
          esPreferente: false,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-005',
      ultimaCompra: '2025-11-21',
      leadTime: 1,
      estado: 'bajo',
      rotacion: 45.2
    },
    {
      id: 'SKU006',
      codigo: 'ART-006',
      nombre: 'Aceite de Oliva Virgen Extra',
      categoria: 'Aceites',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Tiana',
      ubicacion: 'Tiana',
      pasillo: 'B',
      estanteria: '03',
      hueco: '02',
      disponible: 6,
      comprometido: 2,
      minimo: 12,
      maximo: 30,
      rop: 15,
      costoMedio: 28.90,
      pvp: 45.00,
      proveedores: [
        {
          proveedorId: 'PROV-006',
          proveedorNombre: 'Aceites del Sur',
          codigoProveedor: 'ACE-006',
          nombreProveedor: 'AOVE Premium Garrafa 5L',
          precioCompra: 28.90,
          iva: 10, // IVA reducido para aceites alimentarios
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-11-19',
          ultimaFactura: 'FACT-2025-099',
          esPreferente: true,
          activo: true
        },
        {
          proveedorId: 'PROV-011',
          proveedorNombre: 'Aceites Mediterráneos',
          codigoProveedor: 'AM-AOVE-5L',
          nombreProveedor: 'Aceite Virgen Extra 5L',
          precioCompra: 31.20,
          iva: 10,
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-08-25',
          ultimaFactura: 'FACT-2025-058',
          esPreferente: false,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-006',
      ultimaCompra: '2025-11-19',
      leadTime: 4,
      estado: 'bajo',
      rotacion: 22.5
    },
    {
      id: 'SKU007',
      codigo: 'ART-007',
      nombre: 'Verduras Salteadas Congeladas',
      categoria: 'Congelados',
      empresa: 'Disarmink SL - Hoy Pecamos',
      almacen: 'Tiana',
      ubicacion: 'Tiana',
      pasillo: 'D',
      estanteria: '01',
      hueco: '01',
      disponible: 22,
      comprometido: 5,
      minimo: 25,
      maximo: 60,
      rop: 30,
      costoMedio: 8.50,
      pvp: 14.00,
      proveedores: [
        {
          proveedorId: 'PROV-012',
          proveedorNombre: 'Congelados Express',
          codigoProveedor: 'VER-007',
          nombreProveedor: 'Mix Verduras Salteadas 2.5kg',
          precioCompra: 8.50,
          iva: 10, // IVA reducido para verduras congeladas
          recargoEquivalencia: 1.4,
          ultimaCompra: '2025-11-17',
          ultimaFactura: 'FACT-2025-096',
          esPreferente: true,
          activo: true
        }
      ],
      proveedorPreferente: 'PROV-012',
      ultimaCompra: '2025-11-17',
      leadTime: 2,
      estado: 'ok',
      rotacion: 18.8
    },
  ]; // Cierre del array SKU mock

  // ✅ PROVEEDORES DEL CONTEXTO
  const proveedores: Proveedor[] = proveedoresFromContext.length > 0 ? proveedoresFromContext : [
    { id: 'PROV-001', nombre: 'Harinas del Norte', sla: 96.5, rating: 4.8, leadTime: 3, precioMedio: 18.50, pedidosActivos: 2 },
    { id: 'PROV-002', nombre: 'Lácteos Premium', sla: 98.0, rating: 4.9, leadTime: 2, precioMedio: 22.80, pedidosActivos: 3 },
    { id: 'PROV-003', nombre: 'Conservas Mediterráneas', sla: 94.2, rating: 4.7, leadTime: 5, precioMedio: 12.30, pedidosActivos: 1 },
    { id: 'PROV-004', nombre: 'Cárnicos Selectos', sla: 97.5, rating: 4.9, leadTime: 2, precioMedio: 35.40, pedidosActivos: 4 },
    { id: 'PROV-005', nombre: 'Panadería Industrial', sla: 95.8, rating: 4.8, leadTime: 1, precioMedio: 15.60, pedidosActivos: 2 },
    { id: 'PROV-006', nombre: 'Aceites del Sur', sla: 93.5, rating: 4.6, leadTime: 4, precioMedio: 28.90, pedidosActivos: 1 },
    { id: 'PROV-007', nombre: 'Quesos Artesanales', sla: 91.2, rating: 4.5, leadTime: 3, precioMedio: 24.50, pedidosActivos: 0 },
    { id: 'PROV-008', nombre: 'Importaciones Italianas', sla: 89.5, rating: 4.4, leadTime: 7, precioMedio: 14.80, pedidosActivos: 0 },
    { id: 'PROV-009', nombre: 'Ganadería Premium', sla: 96.0, rating: 4.9, leadTime: 2, precioMedio: 38.90, pedidosActivos: 1 },
    { id: 'PROV-010', nombre: 'Bollería Artesanal', sla: 92.0, rating: 4.6, leadTime: 1, precioMedio: 17.20, pedidosActivos: 0 },
    { id: 'PROV-011', nombre: 'Aceites Mediterráneos', sla: 90.5, rating: 4.5, leadTime: 5, precioMedio: 31.20, pedidosActivos: 0 },
    { id: 'PROV-012', nombre: 'Congelados Express', sla: 94.8, rating: 4.7, leadTime: 2, precioMedio: 8.50, pedidosActivos: 1 },
  ]; // Cierre del array Proveedores mock

  // ✅ PEDIDOS DEL API - Usar datos cargados desde la API
  // Los pedidos vienen directamente del API a través de pedidosData
  const pedidosProveedores = (pedidosData.length > 0 ? pedidosData : (pedidosFromContext.length > 0 ? pedidosFromContext : [
    {
      id: 'PED-001',
      numeroPedido: 'PED-2025-001',
      proveedorId: 'PROV-001',
      proveedorNombre: 'Harinas del Norte',
      estado: 'entregado',
      fechaSolicitud: '2025-11-15T10:30:00',
      fechaConfirmacion: '2025-11-15T14:20:00',
      fechaEntrega: '2025-11-18T09:15:00',
      fechaEstimadaEntrega: '2025-11-18T00:00:00',
      articulos: [
        {
          id: 'SKU001',
          codigo: 'ART-001',
          codigoProveedor: 'HAR-001',
          nombre: 'Harina de Trigo T45',
          nombreProveedor: 'Harina de Trigo T45 25kg',
          cantidad: 40,
          precioUnitario: 18.50,
          iva: 4,
          recargoEquivalencia: 0.5,
          subtotal: 740.00,
          totalConImpuestos: 773.30 // 740 + (740*0.04) + (740*0.005) = 740 + 29.60 + 3.70
        }
      ],
      subtotal: 740.00,
      totalIva: 29.60,
      totalRecargoEquivalencia: 3.70,
      total: 773.30,
      anotaciones: 'Entrega en horario de mañana',
      metodoEnvio: 'email',
      responsable: 'Carlos Martínez',
      facturaId: 'FACT-2025-101',
      facturaCaseada: true
    },
    {
      id: 'PED-002',
      numeroPedido: 'PED-2025-002',
      proveedorId: 'PROV-002',
      proveedorNombre: 'Lácteos Premium',
      estado: 'en-transito',
      fechaSolicitud: '2025-11-22T08:45:00',
      fechaConfirmacion: '2025-11-22T11:30:00',
      fechaEstimadaEntrega: '2025-11-24T00:00:00',
      articulos: [
        {
          id: 'SKU002',
          codigo: 'ART-002',
          codigoProveedor: 'QUE-002',
          nombre: 'Queso Mozzarella',
          nombreProveedor: 'Mozzarella Fior di Latte 5kg',
          cantidad: 10,
          precioUnitario: 22.80,
          iva: 4,
          recargoEquivalencia: 0.5,
          subtotal: 228.00,
          totalConImpuestos: 238.26 // 228 + (228*0.04) + (228*0.005) = 228 + 9.12 + 1.14
        }
      ],
      subtotal: 228.00,
      totalIva: 9.12,
      totalRecargoEquivalencia: 1.14,
      total: 238.26,
      anotaciones: '',
      metodoEnvio: 'whatsapp',
      responsable: 'Ana López',
      facturaCaseada: false
    },
    {
      id: 'PED-003',
      numeroPedido: 'PED-2025-003',
      proveedorId: 'PROV-004',
      proveedorNombre: 'Cárnicos Selectos',
      estado: 'confirmado',
      fechaSolicitud: '2025-11-25T15:20:00',
      fechaConfirmacion: '2025-11-25T16:45:00',
      fechaEstimadaEntrega: '2025-11-27T00:00:00',
      articulos: [
        {
          id: 'SKU004',
          codigo: 'ART-004',
          codigoProveedor: 'CAR-004',
          nombre: 'Carne de Ternera Premium',
          nombreProveedor: 'Ternera Añojo Selección 5kg',
          cantidad: 20,
          precioUnitario: 35.40,
          iva: 10,
          recargoEquivalencia: 1.4,
          subtotal: 708.00,
          totalConImpuestos: 788.71 // 708 + (708*0.10) + (708*0.014) = 708 + 70.80 + 9.91
        }
      ],
      subtotal: 708.00,
      totalIva: 70.80,
      totalRecargoEquivalencia: 9.91,
      total: 788.71,
      metodoEnvio: 'email',
      responsable: 'María García',
      facturaCaseada: false
    },
    {
      id: 'PED-004',
      numeroPedido: 'PED-2025-004',
      proveedorId: 'PROV-005',
      proveedorNombre: 'Panadería Industrial',
      estado: 'solicitado',
      fechaSolicitud: '2025-11-28T09:00:00',
      fechaEstimadaEntrega: '2025-11-29T00:00:00',
      articulos: [
        {
          id: 'SKU005',
          codigo: 'ART-005',
          codigoProveedor: 'PAN-005',
          nombre: 'Pan de Hamburguesa Brioche',
          nombreProveedor: 'Brioche Burger Buns 50 uds',
          cantidad: 60,
          precioUnitario: 15.60,
          iva: 4,
          recargoEquivalencia: 0.5,
          subtotal: 936.00,
          totalConImpuestos: 978.12 // 936 + (936*0.04) + (936*0.005) = 936 + 37.44 + 4.68
        }
      ],
      subtotal: 936.00,
      totalIva: 37.44,
      totalRecargoEquivalencia: 4.68,
      total: 978.12,
      anotaciones: 'URGENTE - Necesario para el fin de semana',
      metodoEnvio: 'whatsapp',
      responsable: 'Carlos Martínez',
      facturaCaseada: false
    },
    {
      id: 'PED-005',
      numeroPedido: 'PED-2025-005',
      proveedorId: 'PROV-003',
      proveedorNombre: 'Conservas Mediterráneas',
      estado: 'reclamado',
      fechaSolicitud: '2025-11-20T11:30:00',
      fechaConfirmacion: '2025-11-20T14:00:00',
      fechaEstimadaEntrega: '2025-11-23T00:00:00',
      articulos: [
        {
          id: 'SKU003',
          codigo: 'ART-003',
          codigoProveedor: 'TOM-003',
          nombre: 'Tomate Triturado Natural',
          nombreProveedor: 'Tomate Triturado Lata 3kg',
          cantidad: 25,
          precioUnitario: 12.30,
          iva: 10,
          recargoEquivalencia: 1.4,
          subtotal: 307.50,
          totalConImpuestos: 342.56 // 307.50 + (307.50*0.10) + (307.50*0.014) = 307.50 + 30.75 + 4.31
        }
      ],
      subtotal: 307.50,
      totalIva: 30.75,
      totalRecargoEquivalencia: 4.31,
      total: 342.56,
      anotaciones: 'Reclamado por retraso en la entrega',
      metodoEnvio: 'telefono',
      responsable: 'Ana López',
      facturaCaseada: false
    },
    {
      id: 'PED-006',
      numeroPedido: 'PED-2025-006',
      proveedorId: 'PROV-001',
      proveedorNombre: 'Harinas del Norte',
      estado: 'anulado',
      fechaSolicitud: '2025-11-10T16:00:00',
      articulos: [
        {
          id: 'SKU001',
          codigo: 'ART-001',
          codigoProveedor: 'HAR-001',
          nombre: 'Harina de Trigo T45',
          nombreProveedor: 'Harina de Trigo T45 25kg',
          cantidad: 30,
          precioUnitario: 18.50,
          iva: 4,
          recargoEquivalencia: 0.5,
          subtotal: 555.00,
          totalConImpuestos: 579.98 // 555 + (555*0.04) + (555*0.005) = 555 + 22.20 + 2.78
        }
      ],
      subtotal: 555.00,
      totalIva: 22.20,
      totalRecargoEquivalencia: 2.78,
      total: 579.98,
      anotaciones: 'Anulado - Proveedor sin stock',
      metodoEnvio: 'email',
      responsable: 'María García',
      facturaCaseada: false
    }
  ])).map(normalizarPedido);

  const sesionesInventario: SesionInventario[] = (sesionesInventarioData.length > 0 ? sesionesInventarioData : [
    {
      id: 'INV-2025-14',
      nombre: 'Inventario PDV 1',
      tipo: 'ciclico',
      almacen: 'PDV',
      progreso: 75,
      diferenciasUnidades: 3,
      diferenciasValor: 38.70,
      responsables: ['Carlos Ruiz', 'Ana López'],
      fechaLimite: '2025-11-16T20:00:00',
      estado: 'activa'
    },
    {
      id: 'INV-2025-15',
      nombre: 'Inventario Almacén Central',
      tipo: 'ciclico',
      almacen: 'Almacén 1',
      progreso: 60,
      diferenciasUnidades: -2,
      diferenciasValor: -25.80,
      responsables: ['María García', 'Pedro Martínez'],
      fechaLimite: '2025-11-17T20:00:00',
      estado: 'activa'
    },
    {
      id: 'INV-2025-13',
      nombre: 'Inventario Total - Noviembre',
      tipo: 'total',
      almacen: 'Todos',
      progreso: 100,
      diferenciasUnidades: 8,
      diferenciasValor: 103.20,
      responsables: ['Carlos Ruiz', 'María García', 'Ana López', 'Pedro Martínez'],
      fechaLimite: '2025-11-14T23:59:59',
      estado: 'completada'
    },
  ]).map(normalizarSesion);

  const transferencias: Transferencia[] = [
    {
      id: 'TR-2025-008',
      origen: 'Almacén 1',
      destino: 'PDV',
      skus: 4,
      responsable: 'Carlos Ruiz',
      fecha: '2025-11-15T10:00:00',
      estado: 'transito'
    },
    {
      id: 'TR-2025-007',
      origen: 'Almacén 1',
      destino: 'PDV',
      skus: 3,
      responsable: 'Ana López',
      fecha: '2025-11-14T15:30:00',
      estado: 'recibida'
    },
    {
      id: 'TR-2025-006',
      origen: 'PDV',
      destino: 'Almacén 1',
      skus: 2,
      responsable: 'María García',
      fecha: '2025-11-13T09:00:00',
      estado: 'recibida'
    },
  ];

  // 📊 FUNCIÓN: Generar artículos de pedido automáticamente desde SKUs con stock bajo
  // Filtra artículos donde disponible < rop (punto de reorden)
  // Extrae info del proveedor preferente de cada artículo
  const generarArticulosPedido = () => {
    return skus
      .filter(sku => sku.disponible < sku.rop) // Stock bajo
      .map(sku => {
        // Buscar proveedor preferente
        const proveedorPreferenteData = sku.proveedores.find(p => p.esPreferente) || sku.proveedores[0];
        
        if (!proveedorPreferenteData) {
          console.warn(`⚠️ SKU ${sku.codigo} no tiene proveedores configurados`);
          return null;
        }

        return {
          id: sku.id,
          codigo: sku.codigo, // NUESTRO código
          codigoProveedor: proveedorPreferenteData.codigoProveedor, // Código del proveedor
          articulo: sku.nombre, // NUESTRO nombre
          nombreProveedor: proveedorPreferenteData.nombreProveedor, // Nombre del proveedor
          pdv: sku.almacen,
          stockActual: sku.disponible,
          stockOptimo: sku.maximo,
          propuesta: sku.maximo - sku.disponible, // Calculado automáticamente
          precio: proveedorPreferenteData.precioCompra,
          proveedor: proveedorPreferenteData.proveedorNombre,
          proveedorId: proveedorPreferenteData.proveedorId,
          ultimaFactura: proveedorPreferenteData.ultimaFactura,
          proveedoresDisponibles: sku.proveedores // Todos los proveedores para el dropdown
        };
      })
      .filter(item => item !== null); // Eliminar nulls
  };

  const articulosPedido = generarArticulosPedido();

  // Proveedores disponibles para el dropdown del pedido
  const proveedoresPedido = proveedores.map(p => ({ id: p.id, nombre: p.nombre }));

  // Estado para artículos del pedido (permite modificar proveedor y cantidad)
  const [articulosSeleccionados, setArticulosSeleccionados] = useState(articulosPedido);

  // Estados para modal de añadir artículo al pedido
  const [modalAñadirArticuloAbierto, setModalAñadirArticuloAbierto] = useState(false);
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [articuloSeleccionadoParaAñadir, setArticuloSeleccionadoParaAñadir] = useState<SKU | null>(null);
  const [proveedorSeleccionadoParaAñadir, setProveedorSeleccionadoParaAñadir] = useState<string>('');
  const [cantidadParaAñadir, setCantidadParaAñadir] = useState<number>(0);

  // Filtrar artículos según búsqueda
  const articulosFiltrados = skus.filter(sku => 
    sku.codigo.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
    sku.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
    sku.categoria.toLowerCase().includes(busquedaArticulo.toLowerCase())
  );

  // Estados para vista de pedidos a proveedores
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoProveedor | null>(null);
  const [modalDetallesPedido, setModalDetallesPedido] = useState(false);
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState<string>('todos');
  const [filtroProveedorPedido, setFiltroProveedorPedido] = useState<string>('todos');

  // Filtrar pedidos según filtros
  const pedidosFiltrados = pedidosProveedores.filter(pedido => {
    const numeroPedido = pedido.numero || pedido.numeroPedido || pedido.numero_pedido || pedido.id || '';
    const proveedorNombre = pedido.proveedor?.nombre || pedido.proveedorNombre || pedido.nombre_proveedor || '';
    const estado = pedido.estado || pedido.status || '';
    const proveedorId = pedido.proveedorId || pedido.proveedor_id || '';
    
    const cumpleBusqueda = numeroPedido.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
                          proveedorNombre.toString().toLowerCase().includes(busqueda.toLowerCase());
    const cumpleEstado = filtroEstadoPedido === 'todos' || estado === filtroEstadoPedido;
    const cumpleProveedor = filtroProveedorPedido === 'todos' || proveedorId.toString() === filtroProveedorPedido;
    return cumpleBusqueda && cumpleEstado && cumpleProveedor;
  });

  // Agrupar artículos por proveedor para el resumen
  const articulosPorProveedor = articulosSeleccionados.reduce((acc: any, articulo) => {
    const proveedorId = articulo.proveedorId;
    if (!acc[proveedorId]) {
      acc[proveedorId] = {
        proveedor: articulo.proveedor,
        proveedorId: proveedorId,
        articulos: [],
        total: 0,
        anotaciones: ''
      };
    }
    acc[proveedorId].articulos.push(articulo);
    acc[proveedorId].total += articulo.propuesta * articulo.precio;
    return acc;
  }, {});

  // Filtrar SKUs
  const skusFiltrados = skus.filter(sku => {
    return sku.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
           sku.codigo.toLowerCase().includes(busqueda.toLowerCase());
  });

  // Calcular sugerencias
  const sugerenciasCompra: SugerenciaCompra[] = skus
    .filter(sku => sku.disponible <= sku.rop)
    .map(sku => ({
      sku,
      cantidadRecomendada: sku.maximo - sku.disponible,
      costoEstimado: (sku.maximo - sku.disponible) * sku.costoMedio
    }));

  const getRupturas = () => skus.filter(s => s.disponible < s.minimo).length;
  const getTotalRotacion = () => {
    const suma = skus.reduce((acc, s) => acc + s.rotacion, 0);
    return (suma / skus.length).toFixed(1);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'bajo':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Stock Bajo</Badge>;
      case 'ok':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Óptimo</Badge>;
      case 'sobrestock':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Sobrestock</Badge>;
      default:
        return null;
    }
  };

  const getEstadoSesionBadge = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-blue-600">Activa</Badge>;
      case 'pausada':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pausada</Badge>;
      case 'completada':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Completada</Badge>;
      default:
        return null;
    }
  };

  const getEstadoTransferenciaBadge = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Borrador</Badge>;
      case 'transito':
        return <Badge className="bg-blue-600">En Tránsito</Badge>;
      case 'recibida':
        return <Badge className="bg-green-600">Recibida</Badge>;
      default:
        return null;
    }
  };

  // ============================================
  // FUNCIONES PARA PEDIDOS A PROVEEDORES
  // ============================================

  // Función para obtener badge de estado de pedido
  const getBadgePedido = (estado: PedidoProveedor['estado'] | string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge className="bg-yellow-500 text-white">⏳ Pendiente</Badge>;
      case 'solicitado':
        return <Badge className="bg-yellow-500 text-white">📋 Solicitado</Badge>;
      case 'confirmado':
        return <Badge className="bg-blue-500 text-white">✅ Confirmado</Badge>;
      case 'enviado':
      case 'en-transito':
        return <Badge className="bg-purple-500 text-white">🚚 En Tránsito</Badge>;
      case 'recibido':
      case 'entregado':
        return <Badge className="bg-green-500 text-white">📦 Entregado</Badge>;
      case 'reclamado':
        return <Badge className="bg-orange-500 text-white">⚠️ Reclamado</Badge>;
      case 'anulado':
      case 'cancelado':
        return <Badge className="bg-red-500 text-white">❌ Anulado</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white">{estado || 'Sin estado'}</Badge>;
    }
  };

  // Función para cambiar estado de pedido
  const cambiarEstadoPedido = (pedidoId: string, nuevoEstado: PedidoProveedor['estado']) => {
    // ⚠️ TODO: Implementar actualización en StockContext
    // Por ahora solo registramos el evento
    // En el futuro agregar: actualizarEstadoPedido(pedidoId, nuevoEstado) al contexto
    
    console.log('🔄 EVENTO: ESTADO_PEDIDO_CAMBIADO', {
      pedidoId,
      estadoAnterior: pedidosProveedores.find(p => p.id === pedidoId)?.estado,
      estadoNuevo: nuevoEstado,
      timestamp: new Date()
    });

    const mensajes = {
      solicitado: 'Pedido solicitado',
      confirmado: 'Pedido confirmado',
      'en-transito': 'Pedido marcado como en tránsito',
      entregado: 'Pedido marcado como entregado',
      reclamado: 'Pedido reclamado',
      anulado: 'Pedido anulado'
    };

    toast.success(mensajes[nuevoEstado] || 'Estado actualizado');
  };

  // ============================================
  // CÁLCULOS DINÁMICOS CON useMemo - INVENTARIO
  // ============================================
  
  const estadisticas = useMemo(() => {
    // GRUPO 1: INVENTARIO - TOTALES Y ESTADOS
    const totalSKUs = skus.length;
    const skusStockOk = skus.filter(s => s.estado === 'ok').length;
    const skusStockBajo = skus.filter(s => s.estado === 'bajo').length;
    const skusSobrestock = skus.filter(s => s.estado === 'sobrestock').length;
    const skusRuptura = skus.filter(s => s.disponible < s.minimo).length;
    const porcentajeStockOk = totalSKUs > 0 ? (skusStockOk / totalSKUs) * 100 : 0;
    const porcentajeStockBajo = totalSKUs > 0 ? (skusStockBajo / totalSKUs) * 100 : 0;
    const porcentajeRuptura = totalSKUs > 0 ? (skusRuptura / totalSKUs) * 100 : 0;
    
    // GRUPO 2: STOCK - CANTIDADES Y DISTRIBUCIÓN
    const totalStockDisponible = skus.reduce((acc, s) => acc + s.disponible, 0);
    const totalStockComprometido = skus.reduce((acc, s) => acc + s.comprometido, 0);
    const totalStockLibre = totalStockDisponible - totalStockComprometido;
    const porcentajeStockComprometido = totalStockDisponible > 0
      ? (totalStockComprometido / totalStockDisponible) * 100
      : 0;
    const porcentajeStockLibre = totalStockDisponible > 0
      ? (totalStockLibre / totalStockDisponible) * 100
      : 0;
    const stockPromedioPorSKU = totalSKUs > 0 ? totalStockDisponible / totalSKUs : 0;
    
    // GRUPO 3: VALORACIÓN FINANCIERA
    const valorTotalStock = skus.reduce((acc, s) => acc + (s.disponible * s.costoMedio), 0);
    const valorStockComprometido = skus.reduce((acc, s) => acc + (s.comprometido * s.costoMedio), 0);
    const valorStockLibre = valorTotalStock - valorStockComprometido;
    const valorPromedioPorSKU = totalSKUs > 0 ? valorTotalStock / totalSKUs : 0;
    
    // Potencial de venta (PVP total)
    const potencialVentaTotal = skus.reduce((acc, s) => acc + (s.disponible * s.pvp), 0);
    const margenPotencial = potencialVentaTotal - valorTotalStock;
    const porcentajeMargenPotencial = valorTotalStock > 0 
      ? (margenPotencial / valorTotalStock) * 100 
      : 0;
    const margenPromedioPorSKU = totalSKUs > 0 ? margenPotencial / totalSKUs : 0;
    
    // GRUPO 4: ROTACIÓN Y PERFORMANCE
    const rotacionPromedio = skus.length > 0
      ? skus.reduce((acc, s) => acc + s.rotacion, 0) / skus.length
      : 0;
    const skusAltaRotacion = skus.filter(s => s.rotacion > 20).length;
    const skusBajaRotacion = skus.filter(s => s.rotacion < 10).length;
    const skusRotacionMedia = totalSKUs - skusAltaRotacion - skusBajaRotacion;
    const porcentajeAltaRotacion = totalSKUs > 0 ? (skusAltaRotacion / totalSKUs) * 100 : 0;
    const porcentajeBajaRotacion = totalSKUs > 0 ? (skusBajaRotacion / totalSKUs) * 100 : 0;
    
    // GRUPO 5: SUGERENCIAS DE COMPRA
    const totalSugerencias = sugerenciasCompra.length;
    const costoSugerenciasTotal = sugerenciasCompra.reduce((acc, s) => acc + s.costoEstimado, 0);
    const cantidadSugeridaTotal = sugerenciasCompra.reduce((acc, s) => acc + s.cantidadRecomendada, 0);
    const costoPromedioSugerencia = totalSugerencias > 0 ? costoSugerenciasTotal / totalSugerencias : 0;
    const cantidadPromedioSugerencia = totalSugerencias > 0 ? cantidadSugeridaTotal / totalSugerencias : 0;
    
    // GRUPO 6: PROVEEDORES Y ANÁLISIS DE SUMINISTRO
    const totalProveedores = proveedores.length;
    const proveedoresActivos = proveedores.filter(p => p.pedidosActivos > 0).length;
    const proveedoresInactivos = totalProveedores - proveedoresActivos;
    const slaPromedioProveedores = proveedores.length > 0
      ? proveedores.reduce((acc, p) => acc + p.sla, 0) / proveedores.length
      : 0;
    const leadTimePromedio = proveedores.length > 0
      ? proveedores.reduce((acc, p) => acc + p.leadTime, 0) / proveedores.length
      : 0;
    const precioMedioProveedores = proveedores.length > 0
      ? proveedores.reduce((acc, p) => acc + p.precioMedio, 0) / proveedores.length
      : 0;
    const totalPedidosProveedores = proveedores.reduce((acc, p) => acc + p.pedidosActivos, 0);
    
    // GRUPO 7: PEDIDOS Y LOGÍSTICA
    const totalPedidosRegistrados = pedidosProveedores.length;
    const pedidosPendientesCount = pedidosProveedores.filter(p => p.estado === 'solicitado' || p.estado === 'confirmado').length;
    const pedidosRecibidosCount = pedidosProveedores.filter(p => p.estado === 'entregado').length;
    const pedidosEnTransitoCount = pedidosProveedores.filter(p => p.estado === 'en-transito').length;
    const porcentajePedidosPendientes = totalPedidosRegistrados > 0
      ? (pedidosPendientesCount / totalPedidosRegistrados) * 100
      : 0;
    const porcentajePedidosRecibidos = totalPedidosRegistrados > 0
      ? (pedidosRecibidosCount / totalPedidosRegistrados) * 100
      : 0;
    
    // GRUPO 8: SESIONES DE RECEPCIÓN
    const totalSesiones = sesionesInventario.length;
    const sesionesActivas = sesionesInventario.filter(s => s.estado === 'activa').length;
    const sesionesCompletadas = sesionesInventario.filter(s => s.estado === 'completada').length;
    const sesionesPendientes = totalSesiones - sesionesActivas - sesionesCompletadas;
    const porcentajeSesionesCompletadas = totalSesiones > 0
      ? (sesionesCompletadas / totalSesiones) * 100
      : 0;
    
    // GRUPO 9: TRANSFERENCIAS ENTRE ALMACENES
    const totalTransferencias = transferencias.length;
    const transferenciasBorrador = transferencias.filter(t => t.estado === 'borrador').length;
    const transferenciasEnTransito = transferencias.filter(t => t.estado === 'transito').length;
    const transferenciasRecibidas = transferencias.filter(t => t.estado === 'recibida').length;
    const porcentajeTransferenciasRecibidas = totalTransferencias > 0
      ? (transferenciasRecibidas / totalTransferencias) * 100
      : 0;
    const porcentajeTransferenciasEnTransito = totalTransferencias > 0
      ? (transferenciasEnTransito / totalTransferencias) * 100
      : 0;
    
    // GRUPO 10: CATEGORÍAS - Análisis por categoría
    const skusPorCategoria = skus.reduce((acc, s) => {
      acc[s.categoria] = (acc[s.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const valorPorCategoria = skus.reduce((acc, s) => {
      const valor = s.disponible * s.costoMedio;
      acc[s.categoria] = (acc[s.categoria] || 0) + valor;
      return acc;
    }, {} as Record<string, number>);
    
    const categoriaConMasValor = Object.entries(valorPorCategoria).sort((a, b) => b[1] - a[1])[0];
    const categoriaConMasSKUs = Object.entries(skusPorCategoria).sort((a, b) => b[1] - a[1])[0];
    
    return {
      // Grupo 1: Inventario básico
      totalSKUs,
      skusStockOk,
      skusStockBajo,
      skusSobrestock,
      skusRuptura,
      porcentajeStockOk,
      porcentajeStockBajo,
      porcentajeRuptura,
      
      // Grupo 2: Cantidades
      totalStockDisponible,
      totalStockComprometido,
      totalStockLibre,
      porcentajeStockComprometido,
      porcentajeStockLibre,
      stockPromedioPorSKU,
      
      // Grupo 3: Valoración
      valorTotalStock,
      valorStockComprometido,
      valorStockLibre,
      valorPromedioPorSKU,
      potencialVentaTotal,
      margenPotencial,
      porcentajeMargenPotencial,
      margenPromedioPorSKU,
      
      // Grupo 4: Rotación
      rotacionPromedio,
      skusAltaRotacion,
      skusBajaRotacion,
      skusRotacionMedia,
      porcentajeAltaRotacion,
      porcentajeBajaRotacion,
      
      // Grupo 5: Sugerencias
      totalSugerencias,
      costoSugerenciasTotal,
      cantidadSugeridaTotal,
      costoPromedioSugerencia,
      cantidadPromedioSugerencia,
      
      // Grupo 6: Proveedores
      totalProveedores,
      proveedoresActivos,
      proveedoresInactivos,
      slaPromedioProveedores,
      leadTimePromedio,
      precioMedioProveedores,
      totalPedidosProveedores,
      
      // Grupo 7: Pedidos
      totalPedidosRegistrados,
      pedidosPendientesCount,
      pedidosRecibidosCount,
      pedidosEnTransitoCount,
      porcentajePedidosPendientes,
      porcentajePedidosRecibidos,
      
      // Grupo 8: Sesiones
      totalSesiones,
      sesionesActivas,
      sesionesCompletadas,
      sesionesPendientes,
      porcentajeSesionesCompletadas,
      
      // Grupo 9: Transferencias
      totalTransferencias,
      transferenciasBorrador,
      transferenciasEnTransito,
      transferenciasRecibidas,
      porcentajeTransferenciasRecibidas,
      porcentajeTransferenciasEnTransito,
      
      // Grupo 10: Categorías
      skusPorCategoria,
      valorPorCategoria,
      categoriaConMasValor,
      categoriaConMasSKUs
    };
  }, [skus, sugerenciasCompra, proveedores, pedidosProveedores, sesionesInventario, transferencias]);
  
  // Extraer variables para uso en el componente
  const {
    totalSKUs,
    skusStockOk,
    skusStockBajo,
    skusSobrestock,
    skusRuptura,
    totalStockDisponible,
    totalStockComprometido,
    totalStockLibre,
    valorTotalStock,
    valorStockComprometido,
    valorStockLibre,
    potencialVentaTotal,
    margenPotencial,
    porcentajeMargenPotencial,
    rotacionPromedio,
    skusAltaRotacion,
    skusBajaRotacion,
    totalSugerencias,
    costoSugerenciasTotal,
    cantidadSugeridaTotal,
    totalProveedores,
    proveedoresActivos,
    slaPromedioProveedores,
    leadTimePromedio,
    precioMedioProveedores,
    totalPedidosRegistrados,
    pedidosPendientesCount,
    pedidosRecibidosCount,
    pedidosEnTransitoCount,
    totalSesiones,
    sesionesActivas,
    sesionesCompletadas,
    totalTransferencias,
    transferenciasBorrador,
    transferenciasEnTransito,
    transferenciasRecibidas,
    skusPorCategoria,
    valorPorCategoria
  } = estadisticas;

  // KPIs principales (calculados dinámicamente)
  const kpis = {
    stockValorado: Math.round(valorTotalStock),
    rupturas: skusRuptura,
    rotacion: parseFloat(rotacionPromedio.toFixed(1)),
    diasInventario: rotacionPromedio > 0 ? Math.round(30 / rotacionPromedio) : 0,
    slaProveedor: parseFloat(slaPromedioProveedores.toFixed(1))
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span className="hidden sm:inline">Stock y Proveedores</span>
            <span className="sm:hidden">Stock</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Gestión de inventario, proveedores y almacenes</span>
            <span className="sm:hidden">Inventario y proveedores</span>
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
            onClick={() => {
              setEditingProveedor(null);
              setShowModalNuevoProveedor(true);
              console.log('🔌 EVENTO: NUEVO_PROVEEDOR_INICIADO');
            }}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Proveedor</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
          <Button 
            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
            onClick={() => {
              console.log('🔌 EVENTO: RECIBIR_MATERIAL_INICIADO_GENERAL');
              // Este botón abre el modal de recepción, pero necesita un pedido seleccionado
              // Por ahora solo abre el modal
              setShowModalRecepcion(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Recibir Material</span>
            <span className="sm:hidden">Recibir</span>
          </Button>
          
          {/* Botón Exportar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none">
                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                console.log('🔌 EVENTO: EXPORTAR_PEDIDOS_EXCEL', {
                  formato: 'excel',
                  vista: 'pedidos',
                  timestamp: new Date()
                });
                toast.success('Exportando pedidos a Excel...', {
                  description: 'Se descargará el archivo en unos momentos'
                });
              }}>
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                console.log('🔌 EVENTO: EXPORTAR_PEDIDOS_CSV', {
                  formato: 'csv',
                  vista: 'pedidos',
                  timestamp: new Date()
                });
                toast.success('Exportando pedidos a CSV...', {
                  description: 'Se descargará el archivo en unos momentos'
                });
              }}>
                <FileBarChart className="w-4 h-4 mr-2 text-blue-600" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                console.log('🔌 EVENTO: EXPORTAR_PEDIDOS_PDF', {
                  formato: 'pdf',
                  vista: 'pedidos',
                  timestamp: new Date()
                });
                toast.success('Exportando pedidos a PDF...', {
                  description: 'Se descargará el archivo en unos momentos'
                });
              }}>
                <FileDown className="w-4 h-4 mr-2 text-red-600" />
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
            onClick={() => {
              setEditingPedido(null);
              setShowModalNuevoPedido(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Pedido</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as any)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="inventario" className="text-xs sm:text-sm">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Stock</span>
            <span className="sm:hidden">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="text-xs sm:text-sm">
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Pedidos</span>
            <span className="sm:hidden">Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="proveedores" className="text-xs sm:text-sm">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Proveedores</span>
            <span className="sm:hidden">Prov.</span>
          </TabsTrigger>
          <TabsTrigger value="sesiones" className="text-xs sm:text-sm">
            <Clipboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Inventario</span>
            <span className="sm:hidden">Inv.</span>
          </TabsTrigger>
          <TabsTrigger value="transferencias" className="text-xs sm:text-sm">
            <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Transferencias</span>
            <span className="sm:hidden">Trans.</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== INVENTARIO ===== */}
        <TabsContent value="inventario" className="mt-4 sm:mt-6">
          <div className="space-y-3 sm:space-y-4">
            {/* KPIs Inventario */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Card className="border-2 border-teal-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 mx-auto mb-1" />
                    <p className="text-xl sm:text-2xl text-teal-600 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {kpis.stockValorado.toLocaleString()}€
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Stock Valorado</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {totalSKUs} SKUs
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mx-auto mb-1" />
                    <p className="text-2xl sm:text-3xl text-red-600 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {kpis.rupturas}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Rupturas</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {skusStockBajo} bajo stock
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl sm:text-2xl text-blue-600 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {kpis.rotacion}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Rotación</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {skusAltaRotacion} alta
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl sm:text-3xl text-purple-600 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {kpis.diasInventario}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Días Inventario</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      promedio
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl sm:text-2xl text-green-600 mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {totalSugerencias}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Sugerencias</p>
                    <p className="text-[10px] text-green-600 mt-0.5">
                      {costoSugerenciasTotal.toFixed(0)}€
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y Barra de acciones */}
            <div className="space-y-3">
              {/* Filtros */}
              <FiltroEstandarGerente
                onFiltrosChange={setFiltrosSeleccionados}
                onBusquedaChange={setBusqueda}
                placeholder="Buscar productos en stock..."
              />

              {/* Barra de acciones */}
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={() => {
                    setEditingArticulo(null);
                    setShowModalNuevoArticulo(true);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 bg-teal-600 hover:bg-teal-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Nuevo Artículo</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-1.5 sm:gap-2 text-green-600 border-green-600 bg-transparent hover:bg-green-50 h-8 sm:h-9 text-xs sm:text-sm">
                  <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Recibir material</span>
                  <span className="sm:hidden">Recibir</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-1.5 sm:gap-2 text-purple-600 border-purple-300 h-8 sm:h-9 text-xs sm:text-sm">
                  <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Realizar Inventario</span>
                  <span className="sm:hidden">Inventario</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-1.5 sm:gap-2 text-red-600 border-red-300 h-8 sm:h-9 text-xs sm:text-sm">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Merma
                </Button>
              </div>
            </div>



            {/* Vista Dual: Cards móvil + Tabla desktop */}
            
            {/* MÓVIL: Cards */}
            <div className="lg:hidden space-y-3">
              {articulosData.length > 0 ? (
                articulosData.map((articulo) => (
                  <Card key={articulo.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 truncate mb-0.5">{articulo.nombre}</h3>
                          <p className="text-xs text-gray-600">#{articulo.codigo_interno || articulo.codigo || '-'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm text-gray-900">{typeof articulo.precio_unitario === 'number' ? articulo.precio_unitario.toFixed(2) : '-'}€</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-semibold text-gray-900 ml-1">{articulo.stock_actual || 0}</span>
                          <span className="text-gray-500"> / {articulo.stock_minimo || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ubicación:</span>
                          <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                            {articulo.ubicacion || '-'}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Proveedor:</span>
                          <span className="text-gray-900 ml-1">{articulo.proveedor_id || '-'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-8 text-xs"
                          onClick={() => {
                            setEditingArticulo(articulo);
                            setShowModalNuevoArticulo(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-red-600 hover:bg-red-700 h-8 text-xs"
                          onClick={async () => {
                            if (window.confirm('¿Eliminar este artículo?')) {
                              try {
                                await stockApi.eliminarArticuloStock(articulo.id);
                                toast.success('Artículo eliminado');
                                cargarArticulos();
                              } catch (error) {
                                toast.error('Error al eliminar artículo');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay artículos disponibles
                </div>
              )}
            </div>

            {/* DESKTOP: Tabla */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            Código
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            Artículo
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-end gap-2">
                            Precio
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            Categoría
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-center gap-2">
                            Stock
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center justify-center gap-2">
                            Ubicación
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            Proveedor
                            <ArrowUpDown className="w-4 h-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articulosData.map((articulo) => (
                        <TableRow key={articulo.id}>
                          <TableCell className="font-medium font-mono text-sm">{articulo.codigoInterno || articulo.codigo_interno || '-'}</TableCell>
                          <TableCell className="font-medium text-gray-900">{articulo.nombre}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {typeof articulo.precioUltimaCompra === 'number' ? articulo.precioUltimaCompra.toFixed(2) : (typeof articulo.precio_unitario === 'number' ? articulo.precio_unitario.toFixed(2) : '-')} €
                          </TableCell>
                          <TableCell>{articulo.categoria || '-'}</TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">{articulo.stockActual ?? articulo.stock_actual ?? 0}</span>
                            <span className="text-gray-500"> / {articulo.stockMinimo ?? articulo.stock_minimo ?? 0}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {articulo.ubicacionAlmacen || articulo.ubicacion || '-'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">{articulo.proveedor?.nombre || (articulo.proveedorId ? `ID: ${articulo.proveedorId}` : '-')}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setEditingArticulo(articulo);
                                    setShowModalNuevoArticulo(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    if (window.confirm('¿Eliminar este artículo?')) {
                                      try {
                                        await stockApi.eliminarArticuloStock(articulo.id);
                                        toast.success('Artículo eliminado');
                                        cargarArticulos();
                                      } catch (error) {
                                        toast.error('Error al eliminar artículo');
                                      }
                                    }
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    {articulosData.length === 0 && (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No hay artículos disponibles
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== PROVEEDORES ===== */}
        <TabsContent value="proveedores" className="mt-4 sm:mt-6">
          {/* Filtros para Proveedores */}
          <div className="mb-4">
            <FiltroEstandarGerente
              onFiltrosChange={setFiltrosSeleccionados}
              onBusquedaChange={setBusqueda}
              placeholder="Buscar proveedores..."
            />
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-base sm:text-lg text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Proveedores de Café</span>
                    <span className="sm:hidden">Proveedores</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {proveedores.length} <span className="hidden sm:inline">proveedores</span> registrados
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Botón Nuevo Proveedor */}
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setEditingProveedor(null);
                      setShowModalNuevoProveedor(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Nuevo
                  </Button>
                
                  {/* Botón Exportar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
                        <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      console.log('🔌 EVENTO: EXPORTAR_PROVEEDORES_EXCEL', {
                        formato: 'excel',
                        vista: 'proveedores',
                        totalRegistros: proveedores.length,
                        timestamp: new Date()
                      });
                      toast.success('Exportando proveedores a Excel...', {
                        description: 'Se descargará el archivo en unos momentos'
                      });
                    }}>
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                      Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      console.log('🔌 EVENTO: EXPORTAR_PROVEEDORES_CSV', {
                        formato: 'csv',
                        vista: 'proveedores',
                        totalRegistros: proveedores.length,
                        timestamp: new Date()
                      });
                      toast.success('Exportando proveedores a CSV...', {
                        description: 'Se descargará el archivo en unos momentos'
                      });
                    }}>
                      <FileBarChart className="w-4 h-4 mr-2 text-blue-600" />
                      CSV (.csv)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      console.log('🔌 EVENTO: EXPORTAR_PROVEEDORES_PDF', {
                        formato: 'pdf',
                        vista: 'proveedores',
                        totalRegistros: proveedores.length,
                        timestamp: new Date()
                      });
                      toast.success('Exportando proveedores a PDF...', {
                        description: 'Se descargará el archivo en unos momentos'
                      });
                    }}>
                      <FileDown className="w-4 h-4 mr-2 text-red-600" />
                      PDF (.pdf)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>CIF</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proveedoresData.map((proveedor) => (
                      <TableRow key={proveedor.id}>
                        <TableCell className="font-mono text-sm">{proveedor.id}</TableCell>
                        <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                        <TableCell>{proveedor.cif || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {proveedor.categoria || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>{proveedor.contactoNombre || proveedor.contacto_nombre || '-'}</TableCell>
                        <TableCell>{proveedor.contactoTelefono || proveedor.telefono || '-'}</TableCell>
                        <TableCell>
                          {proveedor.contactoEmail || proveedor.email ? (
                            <a href={`mailto:${proveedor.contactoEmail || proveedor.email}`} className="text-blue-600 hover:underline">
                              {proveedor.contactoEmail || proveedor.email}
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setEditingProveedor(proveedor);
                                  setShowModalNuevoProveedor(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={async () => {
                                  if (window.confirm('¿Eliminar este proveedor?')) {
                                    try {
                                      await stockApi.eliminarProveedor(proveedor.id);
                                      toast.success('Proveedor eliminado');
                                      cargarProveedores();
                                    } catch (error) {
                                      toast.error('Error al eliminar proveedor');
                                    }
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {proveedoresData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay proveedores disponibles
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PEDIDOS ===== */}
        <TabsContent value="pedidos" className="mt-4 sm:mt-6">
          {/* Filtros para Pedidos */}
          <div className="mb-4">
            <FiltroEstandarGerente
              onFiltrosChange={setFiltrosSeleccionados}
              onBusquedaChange={setBusqueda}
              placeholder="Buscar pedidos..."
            />
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-base sm:text-lg text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Pedidos a Proveedores</span>
                    <span className="sm:hidden">Pedidos</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Gestión de órdenes de compra</span>
                    <span className="sm:hidden">Órdenes de compra</span>
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setEditingPedido(null);
                    setShowModalNuevoPedido(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Nuevo Pedido
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Filtros de pedidos */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <Select value={filtroEstadoPedido} onValueChange={setFiltroEstadoPedido}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="solicitado">📋 Solicitado</SelectItem>
                      <SelectItem value="confirmado">✅ Confirmado</SelectItem>
                      <SelectItem value="en-transito">🚚 En Tránsito</SelectItem>
                      <SelectItem value="entregado">📦 Entregado</SelectItem>
                      <SelectItem value="reclamado">⚠️ Reclamado</SelectItem>
                      <SelectItem value="anulado">❌ Anulado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={filtroProveedorPedido} onValueChange={setFiltroProveedorPedido}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los proveedores</SelectItem>
                      {proveedores.map(prov => (
                        <SelectItem key={prov.id} value={prov.id}>
                          {prov.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabla de pedidos */}
              {pedidosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron pedidos</p>
                  <p className="text-sm mt-1">Ajusta los filtros o crea un nuevo pedido</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>N° Pedido</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-center">Fecha Solicitud</TableHead>
                        <TableHead className="text-center">Fecha Entrega</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Artículos</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosFiltrados.map((pedido) => (
                        <TableRow key={pedido.id} className="hover:bg-gray-50">
                          <TableCell>
                            <span className="font-mono font-semibold text-teal-700">
                              {pedido.numero || pedido.numeroPedido || `PED-${pedido.id}`}
                            </span>
                            {pedido.facturaCaseada && (
                              <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                                ✓ Caseado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-600" />
                              <span className="font-medium">{pedido.proveedor?.nombre || pedido.proveedorNombre || `Proveedor ID: ${pedido.proveedorId}`}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getBadgePedido(pedido.estado)}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {new Date(pedido.fechaPedido || pedido.fechaSolicitud || pedido.creadoEn).toLocaleDateString('es-ES')}
                            <p className="text-xs text-gray-500">
                              {new Date(pedido.fechaPedido || pedido.fechaSolicitud || pedido.creadoEn).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {pedido.fechaRecepcion || pedido.fechaEntrega ? (
                              <>
                                {new Date(pedido.fechaRecepcion || pedido.fechaEntrega).toLocaleDateString('es-ES')}
                                <p className="text-xs text-green-600">✓ Entregado</p>
                              </>
                            ) : pedido.fechaEntregaEstimada || pedido.fechaEstimadaEntrega ? (
                              <>
                                {new Date(pedido.fechaEntregaEstimada || pedido.fechaEstimadaEntrega).toLocaleDateString('es-ES')}
                                <p className="text-xs text-gray-500">Estimado</p>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-gray-900">
                              {(pedido.total ?? 0).toFixed(2)}€
                            </span>
                            <p className="text-xs text-gray-500">
                              IVA: {(pedido.iva ?? pedido.totalIva ?? 0).toFixed(2)}€
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {(pedido.items?.length || pedido.articulos?.length || 0)} {(pedido.items?.length || pedido.articulos?.length || 0) === 1 ? 'artículo' : 'artículos'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setPedidoSeleccionado(pedido);
                                  setModalDetallesPedido(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {pedido.estado === 'solicitado' && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setEditingPedido(pedido);
                                          setShowModalNuevoPedido(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar pedido
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => cambiarEstadoPedido(pedido.id, 'confirmado')}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Confirmar pedido
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={async () => {
                                          if (window.confirm('¿Eliminar este pedido?')) {
                                            try {
                                              await stockApi.eliminarPedidoProveedor(pedido.id);
                                              toast.success('Pedido eliminado');
                                              cargarPedidos();
                                            } catch (error) {
                                              toast.error('Error al eliminar pedido');
                                            }
                                          }
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar pedido
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => cambiarEstadoPedido(pedido.id, 'anulado')}>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Anular pedido
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {pedido.estado === 'confirmado' && (
                                    <>
                                      <DropdownMenuItem onClick={() => cambiarEstadoPedido(pedido.id, 'en-transito')}>
                                        <Truck className="w-4 h-4 mr-2" />
                                        Marcar en tránsito
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={async () => {
                                          if (window.confirm('¿Eliminar este pedido?')) {
                                            try {
                                              await stockApi.eliminarPedidoProveedor(pedido.id);
                                              toast.success('Pedido eliminado');
                                              cargarPedidos();
                                            } catch (error) {
                                              toast.error('Error al eliminar pedido');
                                            }
                                          }
                                        }}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar pedido
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {pedido.estado === 'en-transito' && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          setSelectedPedidoRecepcion(pedido);
                                          setShowModalRecepcion(true);
                                        }}
                                      >
                                        <PackagePlus className="w-4 h-4 mr-2" />
                                        Recibir material
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Marcar como entregado
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => cambiarEstadoPedido(pedido.id, 'reclamado')}>
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Reclamar pedido
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {pedido.estado === 'reclamado' && (
                                    <DropdownMenuItem onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Marcar como entregado
                                    </DropdownMenuItem>
                                  )}
                                  {pedido.estado === 'entregado' && !pedido.facturaCaseada && (
                                    <DropdownMenuItem onClick={() => {
                                      toast.info('Función de caseado en desarrollo');
                                    }}>
                                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                                      Casear con factura
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Estadísticas de pedidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Total Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">{pedidosProveedores.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {pedidosProveedores.filter(p => p.estado === 'pendiente' || p.estado === 'solicitado' || p.estado === 'confirmado').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">En Tránsito</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {pedidosProveedores.filter(p => p.estado === 'en-transito' || p.estado === 'enviado').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Entregados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pedidosProveedores.filter(p => p.estado === 'entregado' || p.estado === 'recibido').length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SESIONES DE INVENTARIO ===== */}
        <TabsContent value="sesiones" className="mt-4 sm:mt-6">
          {/* Filtros para Sesiones */}
          <div className="mb-4">
            <FiltroEstandarGerente
              onFiltrosChange={setFiltrosSeleccionados}
              onBusquedaChange={setBusqueda}
              placeholder="Buscar sesiones de inventario..."
            />
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-base sm:text-lg text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Sesiones de Inventario</span>
                    <span className="sm:hidden">Inventario</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Gestión de conteos físicos de inventario</span>
                    <span className="sm:hidden">Conteos físicos</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {/* Botón Exportar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <FileDown className="w-4 h-4" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        console.log('🔌 EVENTO: EXPORTAR_INVENTARIO_EXCEL', {
                          formato: 'excel',
                          vista: 'inventario',
                          totalRegistros: sesionesInventario.length,
                          timestamp: new Date()
                        });
                        toast.success('Exportando sesiones de inventario a Excel...', {
                          description: 'Se descargará el archivo en unos momentos'
                        });
                      }}>
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                        Excel (.xlsx)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('🔌 EVENTO: EXPORTAR_INVENTARIO_CSV', {
                          formato: 'csv',
                          vista: 'inventario',
                          totalRegistros: sesionesInventario.length,
                          timestamp: new Date()
                        });
                        toast.success('Exportando sesiones de inventario a CSV...', {
                          description: 'Se descargará el archivo en unos momentos'
                        });
                      }}>
                        <FileBarChart className="w-4 h-4 mr-2 text-blue-600" />
                        CSV (.csv)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('🔌 EVENTO: EXPORTAR_INVENTARIO_PDF', {
                          formato: 'pdf',
                          vista: 'inventario',
                          totalRegistros: sesionesInventario.length,
                          timestamp: new Date()
                        });
                        toast.success('Exportando sesiones de inventario a PDF...', {
                          description: 'Se descargará el archivo en unos momentos'
                        });
                      }}>
                        <FileDown className="w-4 h-4 mr-2 text-red-600" />
                        PDF (.pdf)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => setShowModalNuevaSesion(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Sesión
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sesión</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Almacén</TableHead>
                      <TableHead className="text-center">Progreso</TableHead>
                      <TableHead className="text-center">Diferencias</TableHead>
                      <TableHead>Responsables</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sesionesInventario.map((sesion) => {
                      // Normalizar responsables: puede ser string separado por comas o array
                      const responsablesArray = Array.isArray(sesion.responsables) 
                        ? sesion.responsables 
                        : (typeof sesion.responsables === 'string' && sesion.responsables 
                            ? sesion.responsables.split(',').map((r: string) => r.trim()) 
                            : []);
                      
                      return (
                        <TableRow key={sesion.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">{sesion.nombre}</p>
                              <p className="text-xs text-gray-500">{sesion.numero || sesion.id}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {sesion.tipo === 'total' && 'Total'}
                              {sesion.tipo === 'ciclico' && 'Cíclico'}
                              {sesion.tipo === 'rapido' && 'Rápido'}
                              {sesion.tipo === 'aleatorio' && 'Aleatorio'}
                              {!['total', 'ciclico', 'rapido', 'aleatorio'].includes(sesion.tipo) && (sesion.tipo || 'Sin tipo')}
                            </Badge>
                          </TableCell>
                          <TableCell>{sesion.almacen}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium">{sesion.progreso?.toFixed(0) || 0}%</span>
                              <Progress value={sesion.progreso || 0} className="h-2 w-24 mt-1" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-medium ${(sesion.diferenciasUnidades || 0) > 0 ? 'text-green-600' : (sesion.diferenciasUnidades || 0) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {(sesion.diferenciasUnidades || 0) > 0 ? '+' : ''}{sesion.diferenciasUnidades || 0} unid.
                              </span>
                              <span className={`text-xs ${(sesion.diferenciasValor || 0) > 0 ? 'text-green-600' : (sesion.diferenciasValor || 0) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                €{(sesion.diferenciasValor || 0).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {responsablesArray.slice(0, 3).map((responsable: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center border-2 border-white text-xs text-white font-medium"
                                  title={responsable}
                                >
                                  {responsable.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              ))}
                              {responsablesArray.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white text-xs text-gray-600 font-medium">
                                  +{responsablesArray.length - 3}
                                </div>
                              )}
                              {responsablesArray.length === 0 && (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getEstadoSesionBadge(sesion.estado)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    // TODO: Editar sesión
                                    toast.info('Editar sesión próximamente');
                                  }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {sesion.estado === 'activa' && (
                                    <DropdownMenuItem onClick={async () => {
                                      try {
                                        await stockApi.actualizarSesionInventario(sesion.id, { estado: 'completada', progreso: 100, fechaFinalizacion: new Date().toISOString() });
                                        toast.success('Sesión completada');
                                        cargarSesionesInventario();
                                      } catch (error) {
                                        toast.error('Error al completar sesión');
                                      }
                                    }}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Marcar Completada
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={async () => {
                                      if (window.confirm('¿Eliminar esta sesión de inventario?')) {
                                        try {
                                          await stockApi.eliminarSesionInventario(sesion.id);
                                          toast.success('Sesión eliminada');
                                          cargarSesionesInventario();
                                        } catch (error) {
                                          toast.error('Error al eliminar sesión');
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TRANSFERENCIAS ===== */}
        <TabsContent value="transferencias" className="mt-4 sm:mt-6">
          {/* Filtros para Transferencias */}
          <div className="mb-4">
            <FiltroEstandarGerente
              onFiltrosChange={setFiltrosSeleccionados}
              onBusquedaChange={setBusqueda}
              placeholder="Buscar transferencias..."
            />
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-base sm:text-lg text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Transferencias entre Almacenes</span>
                    <span className="sm:hidden">Transferencias</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="hidden sm:inline">Movimientos de café entre ubicaciones</span>
                    <span className="sm:hidden">Movimientos</span>
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Botón Exportar */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
                        <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Exportar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        console.log('🔌 EVENTO: EXPORTAR_TRANSFERENCIAS_EXCEL', {
                          formato: 'excel',
                          vista: 'transferencias',
                          totalRegistros: transferencias.length,
                          timestamp: new Date()
                        });
                        toast.success('Exportando transferencias a Excel...', {
                          description: 'Se descargará el archivo en unos momentos'
                        });
                      }}>
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                        Excel (.xlsx)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('🔌 EVENTO: EXPORTAR_TRANSFERENCIAS_CSV', {
                          formato: 'csv',
                          vista: 'transferencias',
                          totalRegistros: transferencias.length,
                          timestamp: new Date()
                        });
                        toast.success('Exportando transferencias a CSV...', {
                          description: 'Se descargará el archivo en unos momentos'
                        });
                      }}>
                        <FileBarChart className="w-4 h-4 mr-2 text-blue-600" />
                        CSV (.csv)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('🔌 EVENTO: EXPORTAR_TRANSFERENCIAS_PDF', {
                          formato: 'pdf',
                          vista: 'transferencias',
                          totalRegistros: transferencias.length,
                          timestamp: new Date()
                        });
                        toast.success('Exportando transferencias a PDF...', {
                          description: 'Se descargará el archivo en unos momentos'
                        });
                      }}>
                        <FileDown className="w-4 h-4 mr-2 text-red-600" />
                        PDF (.pdf)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Transferencia
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transferencia</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead className="text-center">SKUs</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferencias.map((transferencia) => (
                      <TableRow key={transferencia.id}>
                        <TableCell className="font-medium">{transferencia.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {transferencia.origen}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                            {transferencia.destino}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {transferencia.skus}
                        </TableCell>
                        <TableCell>{transferencia.responsable}</TableCell>
                        <TableCell>
                          {new Date(transferencia.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          {getEstadoTransferenciaBadge(transferencia.estado)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalles del Producto */}
      <Dialog open={modalDetallesAbierto} onOpenChange={setModalDetallesAbierto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Package className="w-6 h-6 text-teal-600" />
              Detalles del Artículo
            </DialogTitle>
            <DialogDescription>
              Información completa del artículo en inventario
            </DialogDescription>
          </DialogHeader>
          
          {productoSeleccionado && (
            <>
              {/* Acordeón de Secciones */}
              <Accordion type="multiple" className="space-y-2">
                {/* Información Básica */}
                <AccordionItem value="informacion-basica" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-900">Información Básica</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-600">Código de Artículo</label>
                      <p className="font-semibold text-gray-900 mt-1">{productoSeleccionado.codigo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Nombre del Artículo</label>
                      <p className="font-semibold text-gray-900 mt-1">{productoSeleccionado.nombre}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Categoría</label>
                      <p className="font-semibold text-gray-900 mt-1">{productoSeleccionado.categoria}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Estado</label>
                      <div className="mt-1">
                        {getEstadoBadge(productoSeleccionado.estado)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Información de Stock */}
                <AccordionItem value="informacion-stock" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-900">Información de Stock</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-gray-600">Stock Disponible</label>
                      <p className="text-2xl font-bold text-teal-600 mt-1">{productoSeleccionado.disponible}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Stock Comprometido</label>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{productoSeleccionado.comprometido}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Stock Total</label>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {productoSeleccionado.disponible + productoSeleccionado.comprometido}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Stock Mínimo</label>
                      <p className="font-semibold text-amber-600 mt-1">{productoSeleccionado.minimo} unidades</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Stock Máximo</label>
                      <p className="font-semibold text-gray-900 mt-1">{productoSeleccionado.maximo} unidades</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Punto de Reorden (ROP)</label>
                      <p className="font-semibold text-blue-600 mt-1">{productoSeleccionado.rop} unidades</p>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Ubicación y Almacenamiento */}
                <AccordionItem value="ubicacion" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-900">Ubicación y Almacenamiento</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-600">Almacén</label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Warehouse className="w-3 h-3 mr-1" />
                          {productoSeleccionado.almacen}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Ubicación Específica</label>
                      <p className="font-semibold text-gray-900 mt-1">{productoSeleccionado.ubicacion}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Pasillo</label>
                      <p className="font-semibold text-gray-900 mt-1">Pasillo {productoSeleccionado.pasillo}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Estantería</label>
                      <p className="font-semibold text-gray-900 mt-1">Estantería {productoSeleccionado.estanteria}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Hueco</label>
                      <p className="font-semibold text-gray-900 mt-1">Hueco {productoSeleccionado.hueco}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Código de Ubicación</label>
                      <p className="font-mono font-semibold text-gray-900 mt-1 bg-gray-100 px-3 py-1 rounded">
                        {productoSeleccionado.pasillo}-{productoSeleccionado.estanteria}-{productoSeleccionado.hueco}
                      </p>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Información Económica */}
                <AccordionItem value="informacion-economica" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-900">Información Económica</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-gray-600">Precio de Venta (PVP)</label>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {productoSeleccionado.pvp.toFixed(2).replace('.', ',')} €
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Costo Medio</label>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {productoSeleccionado.costoMedio.toFixed(2).replace('.', ',')} €
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Margen Unitario</label>
                      <p className="text-2xl font-bold text-teal-600 mt-1">
                        {(productoSeleccionado.pvp - productoSeleccionado.costoMedio).toFixed(2).replace('.', ',')} €
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Margen Porcentual</label>
                      <p className="font-semibold text-purple-600 mt-1">
                        {(((productoSeleccionado.pvp - productoSeleccionado.costoMedio) / productoSeleccionado.pvp) * 100).toFixed(1).replace('.', ',')}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Valor Stock Disponible</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {(productoSeleccionado.disponible * productoSeleccionado.costoMedio).toFixed(2).replace('.', ',')} €
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Valor Stock Total</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {((productoSeleccionado.disponible + productoSeleccionado.comprometido) * productoSeleccionado.costoMedio).toFixed(2).replace('.', ',')} €
                      </p>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Escandallo del Producto */}
                <AccordionItem value="escandallo" className="border rounded-lg border-purple-200 bg-purple-50">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-purple-100">
                    <span className="font-medium text-purple-900">Escandallo del Producto</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {/* Resumen del Escandallo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-white border border-purple-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Coste Total Ingredientes</p>
                        <p className="text-xl font-bold text-purple-700">
                          {productoSeleccionado.costoMedio.toFixed(2).replace('.', ',')} €
                        </p>
                      </div>
                      <div className="p-3 bg-white border border-purple-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Precio de Venta</p>
                        <p className="text-xl font-bold text-green-600">
                          {productoSeleccionado.pvp.toFixed(2).replace('.', ',')} €
                        </p>
                      </div>
                      <div className="p-3 bg-white border border-purple-200 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Margen Bruto</p>
                        <p className="text-xl font-bold text-teal-600">
                          {(((productoSeleccionado.pvp - productoSeleccionado.costoMedio) / productoSeleccionado.pvp) * 100).toFixed(1).replace('.', ',')}%
                        </p>
                      </div>
                    </div>

                    {/* Tabla de Ingredientes */}
                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Composición de Ingredientes</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-purple-100">
                              <TableHead className="text-purple-900">Ingrediente</TableHead>
                              <TableHead className="text-purple-900 text-right">Cantidad</TableHead>
                              <TableHead className="text-purple-900 text-right">Unidad</TableHead>
                              <TableHead className="text-purple-900 text-right">Coste/ud</TableHead>
                              <TableHead className="text-purple-900 text-right">Coste Total</TableHead>
                              <TableHead className="text-purple-900 text-right">% del Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Harina de trigo</TableCell>
                              <TableCell className="text-sm text-right">0,500</TableCell>
                              <TableCell className="text-sm text-right">kg</TableCell>
                              <TableCell className="text-sm text-right">0,65 €</TableCell>
                              <TableCell className="text-sm text-right font-semibold">0,33 €</TableCell>
                              <TableCell className="text-sm text-right">
                                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                  {((0.33 / productoSeleccionado.costoMedio) * 100).toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Levadura fresca</TableCell>
                              <TableCell className="text-sm text-right">0,020</TableCell>
                              <TableCell className="text-sm text-right">kg</TableCell>
                              <TableCell className="text-sm text-right">4,50 €</TableCell>
                              <TableCell className="text-sm text-right font-semibold">0,09 €</TableCell>
                              <TableCell className="text-sm text-right">
                                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                  {((0.09 / productoSeleccionado.costoMedio) * 100).toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Sal</TableCell>
                              <TableCell className="text-sm text-right">0,010</TableCell>
                              <TableCell className="text-sm text-right">kg</TableCell>
                              <TableCell className="text-sm text-right">0,80 €</TableCell>
                              <TableCell className="text-sm text-right font-semibold">0,01 €</TableCell>
                              <TableCell className="text-sm text-right">
                                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                  {((0.01 / productoSeleccionado.costoMedio) * 100).toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Agua</TableCell>
                              <TableCell className="text-sm text-right">0,300</TableCell>
                              <TableCell className="text-sm text-right">L</TableCell>
                              <TableCell className="text-sm text-right">0,002 €</TableCell>
                              <TableCell className="text-sm text-right font-semibold">0,00 €</TableCell>
                              <TableCell className="text-sm text-right">
                                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                  {((0.00 / productoSeleccionado.costoMedio) * 100).toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-sm font-medium">Aceite de oliva</TableCell>
                              <TableCell className="text-sm text-right">0,015</TableCell>
                              <TableCell className="text-sm text-right">L</TableCell>
                              <TableCell className="text-sm text-right">6,50 ���</TableCell>
                              <TableCell className="text-sm text-right font-semibold">0,10 €</TableCell>
                              <TableCell className="text-sm text-right">
                                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                  {((0.10 / productoSeleccionado.costoMedio) * 100).toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-purple-50 font-semibold">
                              <TableCell colSpan={4} className="text-right">TOTAL COSTE INGREDIENTES</TableCell>
                              <TableCell className="text-right text-purple-700">
                                {productoSeleccionado.costoMedio.toFixed(2).replace('.', ',')} €
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge className="bg-purple-600 text-white">100%</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-white border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <p className="text-sm font-semibold text-gray-700">Tiempo de Elaboración</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">45 minutos</p>
                        <p className="text-xs text-gray-500 mt-1">Incluye reposo y horneado</p>
                      </div>
                      <div className="p-3 bg-white border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-purple-600" />
                          <p className="text-sm font-semibold text-gray-700">Rendimiento</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">1 unidad (250g)</p>
                        <p className="text-xs text-gray-500 mt-1">Peso después del horneado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Información de Proveedor y Reabastecimiento */}
                <AccordionItem value="proveedor" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-900">Proveedor y Reabastecimiento</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-600">Proveedor Preferente</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <p className="font-semibold text-gray-900">{productoSeleccionado.proveedorPreferente}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Tiempo de Entrega (Lead Time)</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-gray-900">{productoSeleccionado.leadTime} día(s)</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Última Compra</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <p className="font-semibold text-gray-900">
                          {new Date(productoSeleccionado.ultimaCompra).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Rotación de Inventario</label>
                      <div className="flex items-center gap-2 mt-1">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-gray-900">{productoSeleccionado.rotacion.toFixed(1).replace('.', ',')}x</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Historial de Compras */}
                <AccordionItem value="historial-compras" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-900">Historial de Compras</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Fecha</TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unitario</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="text-sm">22/11/2025</TableCell>
                          <TableCell className="text-sm">{productoSeleccionado.proveedorPreferente}</TableCell>
                          <TableCell className="text-sm text-right">50 ud</TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {productoSeleccionado.costoMedio.toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(50 * productoSeleccionado.costoMedio).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">Recibido</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-sm">15/11/2025</TableCell>
                          <TableCell className="text-sm">{productoSeleccionado.proveedorPreferente}</TableCell>
                          <TableCell className="text-sm text-right">45 ud</TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(productoSeleccionado.costoMedio * 0.98).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(45 * productoSeleccionado.costoMedio * 0.98).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">Recibido</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-sm">08/11/2025</TableCell>
                          <TableCell className="text-sm">{productoSeleccionado.proveedorPreferente}</TableCell>
                          <TableCell className="text-sm text-right">60 ud</TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(productoSeleccionado.costoMedio * 1.02).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(60 * productoSeleccionado.costoMedio * 1.02).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">Recibido</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-sm">01/11/2025</TableCell>
                          <TableCell className="text-sm">{productoSeleccionado.proveedorPreferente}</TableCell>
                          <TableCell className="text-sm text-right">55 ud</TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(productoSeleccionado.costoMedio * 0.95).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(55 * productoSeleccionado.costoMedio * 0.95).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">Recibido</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="text-sm">25/10/2025</TableCell>
                          <TableCell className="text-sm">{productoSeleccionado.proveedorPreferente}</TableCell>
                          <TableCell className="text-sm text-right">40 ud</TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(productoSeleccionado.costoMedio * 1.05).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {(40 * productoSeleccionado.costoMedio * 1.05).toFixed(2).replace('.', ',')} €
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-700 border-green-200">Recibido</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Precio Medio (últimas 5 compras)</p>
                        <p className="text-xl font-bold text-blue-700 mt-1">
                          {productoSeleccionado.costoMedio.toFixed(2).replace('.', ',')} €
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Comprado</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">250 ud</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Inversión Total</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {(250 * productoSeleccionado.costoMedio).toFixed(2).replace('.', ',')} €
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>

                {/* Análisis y Recomendaciones */}
                <AccordionItem value="analisis" className="border rounded-lg border-teal-200 bg-teal-50">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-teal-100">
                    <span className="font-medium text-teal-900">Análisis y Recomendaciones</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {productoSeleccionado.disponible <= productoSeleccionado.rop && (
                      <div className="flex items-start gap-3 p-3 bg-amber-100 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">Punto de Reorden Alcanzado</p>
                          <p className="text-sm text-amber-800 mt-1">
                            El stock disponible ({productoSeleccionado.disponible} unidades) ha alcanzado o está por debajo del punto de reorden ({productoSeleccionado.rop} unidades). 
                            Se recomienda generar una orden de compra por {productoSeleccionado.maximo - productoSeleccionado.disponible} unidades.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {productoSeleccionado.disponible < productoSeleccionado.minimo && (
                      <div className="flex items-start gap-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-700 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900">Stock Crítico</p>
                          <p className="text-sm text-red-800 mt-1">
                            El stock está por debajo del mínimo establecido. Acción urgente requerida.
                          </p>
                        </div>
                      </div>
                    )}

                    {productoSeleccionado.disponible > productoSeleccionado.rop && productoSeleccionado.disponible >= productoSeleccionado.minimo && (
                      <div className="flex items-start gap-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-700 mt-0.5" />
                        <div>
                          <p className="font-semibold text-green-900">Stock Óptimo</p>
                          <p className="text-sm text-green-800 mt-1">
                            El nivel de inventario es adecuado. No se requieren acciones inmediatas.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-white rounded-lg border">
                        <label className="text-sm text-gray-600">Días de Cobertura Actual</label>
                        <p className="text-xl font-bold text-teal-600 mt-1">
                          {(productoSeleccionado.disponible / productoSeleccionado.rotacion).toFixed(0)} días
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <label className="text-sm text-gray-600">Cantidad Sugerida de Reorden</label>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {productoSeleccionado.maximo - productoSeleccionado.disponible} unidades
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
                <Button variant="outline" onClick={() => setModalDetallesAbierto(false)}>
                  Cerrar
                </Button>
                <Button variant="outline" className="text-blue-600 border-blue-300">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transferir
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <PackagePlus className="w-4 h-4 mr-2" />
                  Generar Orden de Compra
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Proveedor */}
      <Dialog open={modalProveedorAbierto} onOpenChange={setModalProveedorAbierto}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Truck className="w-6 h-6 text-teal-600" />
              {proveedorSeleccionado?.nombre}
            </DialogTitle>
            <DialogDescription>
              Información detallada del proveedor
            </DialogDescription>
          </DialogHeader>

          {proveedorSeleccionado && (
            <div className="space-y-4">
              {/* Botones de navegación */}
              <div className="flex gap-2">
                <Button
                  variant={seccionProveedorActiva === 'info' ? 'default' : 'outline'}
                  onClick={() => setSeccionProveedorActiva('info')}
                  className={seccionProveedorActiva === 'info' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Info
                </Button>
                <Button
                  variant={seccionProveedorActiva === 'historial' ? 'default' : 'outline'}
                  onClick={() => setSeccionProveedorActiva('historial')}
                  className={seccionProveedorActiva === 'historial' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Historial de compras
                </Button>
                <Button
                  variant={seccionProveedorActiva === 'acuerdos' ? 'default' : 'outline'}
                  onClick={() => setSeccionProveedorActiva('acuerdos')}
                  className={seccionProveedorActiva === 'acuerdos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Acuerdos
                </Button>
                <Button
                  variant={seccionProveedorActiva === 'contacto' ? 'default' : 'outline'}
                  onClick={() => setSeccionProveedorActiva('contacto')}
                  className={seccionProveedorActiva === 'contacto' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contacto
                </Button>
              </div>

              {/* Contenido según sección activa */}
              {seccionProveedorActiva === 'info' && (
                <Card>
                  <CardHeader>
                    <h4 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Información del Proveedor
                    </h4>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {/* Datos Fiscales */}
                      <div className="border-b pb-4">
                        <h5 className="font-medium mb-3 text-gray-900">Datos Fiscales</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">CIF/NIF</p>
                            <p className="font-medium">B-12345678</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Razón Social</p>
                            <p className="font-medium">{proveedorSeleccionado.nombre}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Dirección Fiscal</p>
                            <p className="font-medium text-sm">Calle Principal 123, Barcelona</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-medium">+34 93 123 45 67</p>
                          </div>
                        </div>
                      </div>

                      {/* Facturación */}
                      <div className="border-b pb-4">
                        <h5 className="font-medium mb-3 text-gray-900">Facturación</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Facturación año en curso (2025)</p>
                            <p className="font-semibold text-teal-600">€18.450,00</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Facturación año pasado (2024)</p>
                            <p className="font-medium">€21.230,00</p>
                          </div>
                        </div>
                      </div>

                      {/* Pedidos */}
                      <div>
                        <h5 className="font-medium mb-3 text-gray-900">Pedidos</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Pedidos realizados</p>
                            <p className="font-medium">24 pedidos</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pedidos pendientes de recibir</p>
                            <Badge className="bg-orange-600">{proveedorSeleccionado.pedidosActivos} pendientes</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {seccionProveedorActiva === 'historial' && (
                <Card>
                  <CardHeader>
                    <h4 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Historial de Compras
                    </h4>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">Orden #OC-2025-045</p>
                          <Badge className="bg-green-600">Recibida</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Fecha: 15/11/2025</p>
                          <p>Importe: €1.245,00</p>
                          <p>Productos: 3 SKUs</p>
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">Orden #OC-2025-038</p>
                          <Badge className="bg-green-600">Recibida</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Fecha: 08/11/2025</p>
                          <p>Importe: €980,50</p>
                          <p>Productos: 2 SKUs</p>
                        </div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">Orden #OC-2025-031</p>
                          <Badge className="bg-green-600">Recibida</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Fecha: 01/11/2025</p>
                          <p>Importe: €1.567,80</p>
                          <p>Productos: 4 SKUs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {seccionProveedorActiva === 'acuerdos' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Acuerdos Comerciales
                      </h4>
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => toast.success('Funcionalidad de añadir acuerdo en desarrollo')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Acuerdo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">Acuerdo Marco 2025</p>
                            <p className="text-sm text-gray-600">Vigente desde: 01/01/2025</p>
                          </div>
                          <Badge className="bg-green-600">Activo</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Descuento volumen:</span> <span className="font-medium">5% &gt; 1.000 kg/mes</span></p>
                          <p><span className="text-gray-600">Condiciones de pago:</span> <span className="font-medium">30 días</span></p>
                          <p><span className="text-gray-600">Mínimo de pedido:</span> <span className="font-medium">€500,00</span></p>
                        </div>
                      </div>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium">Acuerdo Especial Navidad</p>
                            <p className="text-sm text-gray-600">Vigente: 01/12/2025 - 31/01/2026</p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Temporal</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Descuento especial:</span> <span className="font-medium">8% en pedidos &gt; €2.000</span></p>
                          <p><span className="text-gray-600">Envío gratuito:</span> <span className="font-medium">Pedidos &gt; €1.500</span></p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sección Contacto */}
              {seccionProveedorActiva === 'contacto' && (
                <Card>
                  <CardHeader>
                    <h4 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Opciones de Contacto
                    </h4>
                    <p className="text-sm text-gray-600">
                      Configura cómo enviar pedidos y comunicaciones
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="enviarEmail"
                          checked={enviarPorEmail}
                          onChange={(e) => setEnviarPorEmail(e.target.checked)}
                          className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor="enviarEmail" className="font-medium text-gray-900 cursor-pointer">
                            📧 Enviar por correo electrónico
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Enviar automáticamente los pedidos por email
                          </p>
                        </div>
                      </div>
                      {enviarPorEmail && (
                        <div className="ml-7 mt-3">
                          <Label htmlFor="emailContacto" className="text-sm font-medium text-gray-700">
                            Dirección de correo electrónico
                          </Label>
                          <Input
                            id="emailContacto"
                            type="email"
                            placeholder="proveedor@ejemplo.com"
                            value={emailContacto}
                            onChange={(e) => setEmailContacto(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Los pedidos se enviarán automáticamente a esta dirección
                          </p>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="enviarWhatsApp"
                          checked={enviarPorWhatsApp}
                          onChange={(e) => setEnviarPorWhatsApp(e.target.checked)}
                          className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor="enviarWhatsApp" className="font-medium text-gray-900 cursor-pointer">
                            💬 Enviar por WhatsApp
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Notificar pedidos vía WhatsApp Business
                          </p>
                        </div>
                      </div>
                      {enviarPorWhatsApp && (
                        <div className="ml-7 mt-3">
                          <Label htmlFor="numeroWhatsApp" className="text-sm font-medium text-gray-700">
                            Número de WhatsApp
                          </Label>
                          <Input
                            id="numeroWhatsApp"
                            type="tel"
                            placeholder="+34 600 123 456"
                            value={numeroWhatsApp}
                            onChange={(e) => setNumeroWhatsApp(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Introduce el número con código de país (ej: +34)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Invitación App */}
                    <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="invitacionApp"
                          checked={enviarInvitacionApp}
                          onChange={(e) => setEnviarInvitacionApp(e.target.checked)}
                          className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label htmlFor="invitacionApp" className="font-medium text-gray-900 cursor-pointer">
                            📱 Enviar invitación a la App
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Invitar al proveedor a usar la app móvil de Udar Edge para gestión de pedidos en tiempo real
                          </p>
                          {enviarInvitacionApp && (
                            <div className="mt-3 p-3 bg-white border border-purple-200 rounded">
                              <p className="text-sm font-medium text-purple-900 mb-2">
                                ✨ Beneficios de la App:
                              </p>
                              <ul className="text-xs text-gray-700 space-y-1 ml-4">
                                <li>• Recibir pedidos instantáneamente</li>
                                <li>• Confirmar disponibilidad en tiempo real</li>
                                <li>• Actualizar precios y catálogo</li>
                                <li>• Consultar historial de pedidos</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón Guardar */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setModalProveedorAbierto(false)}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          // 🔌 EVENTO: CONTACTO_PROVEEDOR_ACTUALIZADO
                          console.log('📤 EVENTO: CONTACTO_PROVEEDOR_ACTUALIZADO', {
                            proveedor_id: proveedorSeleccionado?.id,
                            email: {
                              activo: enviarPorEmail,
                              direccion: emailContacto
                            },
                            whatsapp: {
                              activo: enviarPorWhatsApp,
                              numero: numeroWhatsApp
                            },
                            invitacion_app: enviarInvitacionApp,
                            timestamp: new Date()
                          });
                          toast.success('Opciones de contacto guardadas correctamente');
                          setModalProveedorAbierto(false);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Guardar Opciones
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Nuevo Pedido */}
      {/* 
        📊 CONEXIÓN DATOS: 
        - Consultar artículos con stock bajo: WHERE stock_actual < stock_optimo
        - Calcular propuesta: stock_optimo - stock_actual
        - Filtros: marca, pdv
        - Proveedores: tabla PROVEEDORES con relación ARTICULO_PROVEEDOR
        Evento final: PEDIDO_ENVIADO { proveedor_id, articulos: [{id, cantidad, precio}], total, anotaciones, timestamp }
      */}
      <Dialog open={modalNuevoPedido} onOpenChange={setModalNuevoPedido}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  📦 Nuevo Pedido a Proveedores
                </DialogTitle>
                <DialogDescription>
                  Gestiona los artículos y genera pedidos por proveedor
                </DialogDescription>
              </div>
              <div className="flex gap-3">
                <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 min-w-[140px]">
                  <p className="text-xs text-teal-600 font-medium">Total Pedidos</p>
                  <p className="text-2xl font-bold text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalPedidosEnviados}
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 min-w-[140px]">
                  <p className="text-xs text-orange-600 font-medium">Pendientes Enviar</p>
                  <p className="text-2xl font-bold text-orange-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {pedidosPendientes}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={tabPedido} onValueChange={(value: any) => setTabPedido(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pedidos">
                <ClipboardList className="w-4 h-4 mr-2" />
                Pedidos
              </TabsTrigger>
              <TabsTrigger value="resumen">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Resumen Pedido
              </TabsTrigger>
            </TabsList>

            {/* TAB: Pedidos (Tabla de artículos) */}
            <TabsContent value="pedidos" className="mt-4">
              <div className="space-y-4">
                {/* Botón añadir artículo */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setModalAñadirArticuloAbierto(true);
                      setBusquedaArticulo('');
                      setArticuloSeleccionadoParaAñadir(null);
                      setProveedorSeleccionadoParaAñadir('');
                      setCantidadParaAñadir(0);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Artículo
                  </Button>
                </div>

                {/* Tabla de artículos */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[100px]">Código</TableHead>
                        <TableHead>Artículo</TableHead>
                        <TableHead className="text-center w-[100px]">Ref. Proveedor</TableHead>
                        <TableHead className="text-center w-[100px]">PDV</TableHead>
                        <TableHead className="text-center w-[120px]">Stock Actual/Óptimo</TableHead>
                        <TableHead className="text-center w-[100px]">Propuesta</TableHead>
                        <TableHead className="text-center w-[100px]">Precio (€)</TableHead>
                        <TableHead className="w-[180px]">Proveedor</TableHead>
                        <TableHead className="text-center w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articulosSeleccionados.map((articulo, index) => (
                        <TableRow key={articulo.id} className="hover:bg-gray-50">
                          <TableCell>
                            <span className="font-mono text-sm font-semibold text-teal-700">
                              {articulo.codigo}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">Nuestro código</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-teal-600" />
                              <span className="font-medium text-gray-900">{articulo.articulo}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-mono text-sm text-gray-700">
                              {articulo.codigoProveedor}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">Código prov.</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-gray-700">📍 {articulo.pdv}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className={`font-semibold ${articulo.stockActual < articulo.stockOptimo * 0.3 ? 'text-red-600' : 'text-gray-700'}`}>
                                {articulo.stockActual}
                              </span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600">{articulo.stockOptimo}</span>
                            </div>
                            <Progress 
                              value={(articulo.stockActual / articulo.stockOptimo) * 100} 
                              className="h-1.5 mt-1"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              value={articulo.propuesta}
                              onChange={(e) => {
                                const nuevosArticulos = [...articulosSeleccionados];
                                nuevosArticulos[index].propuesta = parseInt(e.target.value) || 0;
                                setArticulosSeleccionados(nuevosArticulos);
                              }}
                              className="w-20 text-center font-semibold"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold text-gray-900">{articulo.precio.toFixed(2)}€</span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Total: {(articulo.propuesta * articulo.precio).toFixed(2)}€
                            </p>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={articulo.proveedorId}
                              onValueChange={(value) => {
                                const nuevosArticulos = [...articulosSeleccionados];
                                const articuloActual = nuevosArticulos[index];
                                
                                // Buscar el proveedor seleccionado en la lista de proveedores del artículo
                                const proveedorData = articuloActual.proveedoresDisponibles?.find(p => p.proveedorId === value);
                                
                                if (proveedorData) {
                                  // Actualizar proveedor, precio y códigos según el proveedor seleccionado
                                  nuevosArticulos[index] = {
                                    ...articuloActual,
                                    proveedorId: value,
                                    proveedor: proveedorData.proveedorNombre,
                                    codigoProveedor: proveedorData.codigoProveedor,
                                    nombreProveedor: proveedorData.nombreProveedor,
                                    precio: proveedorData.precioCompra,
                                    ultimaFactura: proveedorData.ultimaFactura
                                  };
                                  
                                  setArticulosSeleccionados(nuevosArticulos);
                                  
                                  console.log('🔌 EVENTO: PROVEEDOR_CAMBIADO', {
                                    articuloId: articuloActual.id,
                                    codigo: articuloActual.codigo,
                                    proveedorAnterior: articuloActual.proveedorId,
                                    proveedorNuevo: value,
                                    precioAnterior: articuloActual.precio,
                                    precioNuevo: proveedorData.precioCompra,
                                    timestamp: new Date()
                                  });
                                  
                                  toast.success(`Proveedor actualizado a ${proveedorData.proveedorNombre}`, {
                                    description: `Precio actualizado: ${proveedorData.precioCompra.toFixed(2)}€`
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(articulo.proveedoresDisponibles || []).map(prov => (
                                  <SelectItem key={prov.proveedorId} value={prov.proveedorId}>
                                    <div className="flex items-center justify-between gap-3 w-full">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="w-3 h-3" />
                                        {prov.proveedorNombre}
                                      </div>
                                      <span className="text-xs text-gray-500">{prov.precioCompra.toFixed(2)}€</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                const nuevosArticulos = articulosSeleccionados.filter((_, i) => i !== index);
                                setArticulosSeleccionados(nuevosArticulos);
                                toast.info('Artículo eliminado del pedido');
                              }}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Nota para programador */}
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  <strong>✅ IMPLEMENTADO:</strong> Los artículos se consultan dinámicamente desde SKUs WHERE disponible {'<'} rop. 
                  La propuesta se calcula automáticamente (maximo - disponible). 
                  Cada artículo tiene múltiples proveedores con precios distintos. Al cambiar proveedor en el dropdown, 
                  se recalcula el precio según la última factura de ese proveedor.
                </div>
              </div>
            </TabsContent>

            {/* TAB: Resumen Pedido (Agrupado por proveedor) */}
            <TabsContent value="resumen" className="mt-4">
              <div className="space-y-6">
                {Object.values(articulosPorProveedor).map((grupo: any) => (
                  <Card key={grupo.proveedorId} className="border-2">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {grupo.proveedor}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {grupo.articulos.length} artículos · Total: {grupo.total.toFixed(2)}€
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-teal-600 text-white">
                          Pedido #{grupo.proveedorId}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Tabla de artículos del proveedor */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Código</TableHead>
                              <TableHead>Artículo</TableHead>
                              <TableHead className="text-center">Ref. Proveedor</TableHead>
                              <TableHead className="text-center">PDV</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-right">Precio Unit.</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {grupo.articulos.map((articulo: any) => (
                              <TableRow key={articulo.id}>
                                <TableCell>
                                  <span className="font-mono text-sm font-semibold text-teal-700">
                                    {articulo.codigo}
                                  </span>
                                  <p className="text-xs text-gray-500">Nuestro</p>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium text-gray-900">{articulo.articulo}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-mono text-sm text-gray-700">
                                    {articulo.codigoProveedor}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-sm text-gray-700">
                                  📍 {articulo.pdv}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-semibold text-teal-600">
                                    {articulo.propuesta} uds
                                  </span>
                                </TableCell>
                                <TableCell className="text-right text-gray-700">
                                  {articulo.precio.toFixed(2)}€
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="font-semibold text-gray-900">
                                    {(articulo.propuesta * articulo.precio).toFixed(2)}€
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* Fila de total */}
                            <TableRow className="bg-teal-50 font-semibold">
                              <TableCell colSpan={6} className="text-right">
                                Total Pedido:
                              </TableCell>
                              <TableCell className="text-right text-teal-700">
                                {grupo.total.toFixed(2)}€
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Anotaciones */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Anotaciones para {grupo.proveedor}
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Añade notas o instrucciones especiales para este proveedor..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                          value={grupo.anotaciones}
                          onChange={(e) => {
                            const nuevosPorProveedor = { ...articulosPorProveedor };
                            nuevosPorProveedor[grupo.proveedorId].anotaciones = e.target.value;
                          }}
                        />
                      </div>

                      {/* Botón Enviar Pedido */}
                      <div className="flex justify-end pt-3 border-t">
                        <Button
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => {
                            // Generar número de pedido
                            const numeroPedido = `PED-2025-${String(pedidosProveedores.length + 1).padStart(3, '0')}`;
                            
                            // Calcular IVA y Recargo por cada artículo
                            const articulosPedido = grupo.articulos.map(a => {
                              // Buscar el artículo en skus para obtener los datos del proveedor
                              const skuOriginal = skus.find(s => s.id === a.id);
                              const proveedorData = skuOriginal?.proveedores.find(p => p.proveedorId === a.proveedorId);
                              
                              const subtotal = a.propuesta * a.precio;
                              const iva = proveedorData?.iva || 21; // Por defecto 21% si no se encuentra
                              const recargoEquivalencia = proveedorData?.recargoEquivalencia || 0;
                              const importeIva = subtotal * (iva / 100);
                              const importeRecargo = subtotal * (recargoEquivalencia / 100);
                              const totalConImpuestos = subtotal + importeIva + importeRecargo;

                              return {
                                id: a.id,
                                codigo: a.codigo,
                                codigoProveedor: a.codigoProveedor || '',
                                nombre: a.articulo,
                                nombreProveedor: a.nombreProveedor || a.articulo,
                                cantidad: a.propuesta,
                                precioUnitario: a.precio,
                                iva: iva,
                                recargoEquivalencia: recargoEquivalencia,
                                subtotal: subtotal,
                                totalConImpuestos: totalConImpuestos
                              };
                            });

                            // Calcular totales del pedido
                            const subtotalPedido = articulosPedido.reduce((sum, a) => sum + a.subtotal, 0);
                            const totalIvaPedido = articulosPedido.reduce((sum, a) => sum + (a.subtotal * (a.iva / 100)), 0);
                            const totalRecargoPedido = articulosPedido.reduce((sum, a) => sum + (a.subtotal * (a.recargoEquivalencia / 100)), 0);
                            const totalPedido = subtotalPedido + totalIvaPedido + totalRecargoPedido;
                            
                            // Crear nuevo pedido
                            const nuevoPedido: PedidoProveedor = {
                              id: `PED-${Date.now()}`,
                              numeroPedido: numeroPedido,
                              proveedorId: grupo.proveedorId,
                              proveedorNombre: grupo.proveedor,
                              estado: 'solicitado',
                              fechaSolicitud: new Date().toISOString(),
                              fechaEstimadaEntrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 días
                              articulos: articulosPedido,
                              subtotal: subtotalPedido,
                              totalIva: totalIvaPedido,
                              totalRecargoEquivalencia: totalRecargoPedido,
                              total: totalPedido,
                              anotaciones: grupo.anotaciones || '',
                              metodoEnvio: enviarPorEmail ? 'email' : enviarPorWhatsApp ? 'whatsapp' : 'app',
                              responsable: 'Carlos Martínez', // TODO: Obtener usuario actual
                              facturaCaseada: false
                            };

                            // Guardar pedido en estado
                            setPedidosProveedores(prev => [nuevoPedido, ...prev]);

                            // Emitir evento
                            console.log('📤 EVENTO: PEDIDO_ENVIADO', {
                              pedidoId: nuevoPedido.id,
                              numeroPedido: nuevoPedido.numeroPedido,
                              proveedorId: grupo.proveedorId,
                              proveedorNombre: grupo.proveedor,
                              articulos: nuevoPedido.articulos.map(a => ({
                                id: a.id,
                                codigo: a.codigo,
                                cantidad: a.cantidad,
                                precioUnitario: a.precioUnitario,
                                subtotal: a.subtotal
                              })),
                              total: nuevoPedido.total,
                              metodoEnvio: nuevoPedido.metodoEnvio,
                              timestamp: new Date()
                            });
                            
                            // Actualizar contadores
                            setTotalPedidosEnviados(prev => prev + 1);
                            setPedidosPendientes(prev => Math.max(0, prev - 1));
                            
                            // Remover artículos del pedido temporal
                            const nuevosArticulos = articulosSeleccionados.filter(a => a.proveedorId !== grupo.proveedorId);
                            setArticulosSeleccionados(nuevosArticulos);
                            
                            toast.success(`Pedido ${numeroPedido} enviado a ${grupo.proveedor}`, {
                              description: `Total: ${nuevoPedido.total.toFixed(2)}€ • ${nuevoPedido.articulos.length} artículos`
                            });
                          }}
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Enviar Pedido a {grupo.proveedor}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {Object.keys(articulosPorProveedor).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No hay artículos en el pedido</p>
                    <p className="text-sm mt-1">Ve a la pestaña "Pedidos" para añadir artículos</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              <strong>{articulosSeleccionados.length}</strong> artículos seleccionados · 
              <strong className="ml-2">{Object.keys(articulosPorProveedor).length}</strong> proveedores
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setModalNuevoPedido(false);
                  setTabPedido('pedidos');
                }}
              >
                Cerrar
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setTabPedido('resumen')}
                disabled={articulosSeleccionados.length === 0}
              >
                Ver Resumen →
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================= */}
      {/* MODAL: AÑADIR ARTÍCULO AL PEDIDO */}
      {/* ========================================= */}
      <Dialog open={modalAñadirArticuloAbierto} onOpenChange={setModalAñadirArticuloAbierto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              ➕ Añadir Artículo al Pedido
            </DialogTitle>
            <DialogDescription>
              Busca y selecciona artículos de tu inventario para añadir al pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* PASO 1: Buscar y seleccionar artículo */}
            {!articuloSeleccionadoParaAñadir && (
              <div className="space-y-4">
                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por código, nombre o categoría..."
                    value={busquedaArticulo}
                    onChange={(e) => setBusquedaArticulo(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>

                {/* Lista de artículos */}
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {articulosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No se encontraron artículos</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow className="bg-gray-50">
                          <TableHead>Código</TableHead>
                          <TableHead>Artículo</TableHead>
                          <TableHead className="text-center">Categoría</TableHead>
                          <TableHead className="text-center">PDV</TableHead>
                          <TableHead className="text-center">Stock</TableHead>
                          <TableHead className="text-center">Proveedores</TableHead>
                          <TableHead className="text-center w-[100px]">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articulosFiltrados.map((sku) => (
                          <TableRow key={sku.id} className="hover:bg-gray-50">
                            <TableCell>
                              <span className="font-mono text-sm font-semibold text-teal-700">
                                {sku.codigo}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-teal-600" />
                                <span className="font-medium text-gray-900">{sku.nombre}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-xs">
                                {sku.categoria}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-700">
                              📍 {sku.almacen}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${sku.disponible < sku.rop ? 'text-red-600' : 'text-gray-700'}`}>
                                {sku.disponible}
                              </span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-gray-600">{sku.maximo}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-blue-100 text-blue-700">
                                {sku.proveedores.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setArticuloSeleccionadoParaAñadir(sku);
                                  // Seleccionar proveedor preferente por defecto
                                  const provPreferente = sku.proveedores.find(p => p.esPreferente);
                                  if (provPreferente) {
                                    setProveedorSeleccionadoParaAñadir(provPreferente.proveedorId);
                                  }
                                  // Calcular cantidad sugerida
                                  setCantidadParaAñadir(Math.max(0, sku.maximo - sku.disponible));
                                }}
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}

            {/* PASO 2: Configurar cantidad y proveedor */}
            {articuloSeleccionadoParaAñadir && (
              <div className="space-y-6">
                {/* Artículo seleccionado */}
                <Card className="bg-teal-50 border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {articuloSeleccionadoParaAñadir.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                              Código: <span className="font-mono">{articuloSeleccionadoParaAñadir.codigo}</span> · 
                              PDV: {articuloSeleccionadoParaAñadir.almacen} · 
                              Stock: {articuloSeleccionadoParaAñadir.disponible}/{articuloSeleccionadoParaAñadir.maximo}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setArticuloSeleccionadoParaAñadir(null);
                          setProveedorSeleccionadoParaAñadir('');
                          setCantidadParaAñadir(0);
                        }}
                      >
                        Cambiar artículo
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Seleccionar proveedor */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Proveedor *
                  </label>
                  <Select
                    value={proveedorSeleccionadoParaAñadir}
                    onValueChange={(value) => setProveedorSeleccionadoParaAñadir(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {articuloSeleccionadoParaAñadir.proveedores.map((prov) => (
                        <SelectItem key={prov.proveedorId} value={prov.proveedorId}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3 h-3" />
                              <span>{prov.proveedorNombre}</span>
                              {prov.esPreferente && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Preferente
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                Ref: <span className="font-mono">{prov.codigoProveedor}</span>
                              </span>
                              <span className="font-semibold text-teal-700">
                                {prov.precioCompra.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cantidad */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Cantidad *
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      value={cantidadParaAñadir}
                      onChange={(e) => setCantidadParaAñadir(parseInt(e.target.value) || 0)}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-600">
                      Sugerido: {articuloSeleccionadoParaAñadir.maximo - articuloSeleccionadoParaAñadir.disponible} uds
                    </span>
                  </div>
                </div>

                {/* Preview precio total */}
                {proveedorSeleccionadoParaAñadir && cantidadParaAñadir > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Total estimado:</span>
                        <span className="text-xl font-bold text-blue-700">
                          {(
                            cantidadParaAñadir *
                            (articuloSeleccionadoParaAñadir.proveedores.find(
                              p => p.proveedorId === proveedorSeleccionadoParaAñadir
                            )?.precioCompra || 0)
                          ).toFixed(2)}€
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setModalAñadirArticuloAbierto(false);
                setArticuloSeleccionadoParaAñadir(null);
                setProveedorSeleccionadoParaAñadir('');
                setCantidadParaAñadir(0);
                setBusquedaArticulo('');
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              disabled={!articuloSeleccionadoParaAñadir || !proveedorSeleccionadoParaAñadir || cantidadParaAñadir <= 0}
              onClick={() => {
                if (!articuloSeleccionadoParaAñadir) return;
                
                const proveedorData = articuloSeleccionadoParaAñadir.proveedores.find(
                  p => p.proveedorId === proveedorSeleccionadoParaAñadir
                );

                if (!proveedorData) return;

                // Verificar si el artículo ya está en el pedido
                const articuloExistente = articulosSeleccionados.find(
                  a => a.id === articuloSeleccionadoParaAñadir.id && a.proveedorId === proveedorSeleccionadoParaAñadir
                );

                if (articuloExistente) {
                  // Si ya existe, actualizar cantidad
                  const nuevosArticulos = articulosSeleccionados.map(a =>
                    a.id === articuloSeleccionadoParaAñadir.id && a.proveedorId === proveedorSeleccionadoParaAñadir
                      ? { ...a, propuesta: a.propuesta + cantidadParaAñadir }
                      : a
                  );
                  setArticulosSeleccionados(nuevosArticulos);
                  toast.success('Cantidad actualizada', {
                    description: `Se han añadido ${cantidadParaAñadir} unidades más`
                  });
                } else {
                  // Si no existe, añadir nuevo
                  const nuevoArticulo = {
                    id: articuloSeleccionadoParaAñadir.id,
                    codigo: articuloSeleccionadoParaAñadir.codigo,
                    codigoProveedor: proveedorData.codigoProveedor,
                    articulo: articuloSeleccionadoParaAñadir.nombre,
                    nombreProveedor: proveedorData.nombreProveedor,
                    pdv: articuloSeleccionadoParaAñadir.almacen,
                    stockActual: articuloSeleccionadoParaAñadir.disponible,
                    stockOptimo: articuloSeleccionadoParaAñadir.maximo,
                    propuesta: cantidadParaAñadir,
                    precio: proveedorData.precioCompra,
                    proveedor: proveedorData.proveedorNombre,
                    proveedorId: proveedorData.proveedorId,
                    ultimaFactura: proveedorData.ultimaFactura,
                    proveedoresDisponibles: articuloSeleccionadoParaAñadir.proveedores
                  };

                  setArticulosSeleccionados([...articulosSeleccionados, nuevoArticulo]);
                  
                  console.log('➕ EVENTO: ARTICULO_AÑADIDO_A_PEDIDO', {
                    articuloId: nuevoArticulo.id,
                    codigo: nuevoArticulo.codigo,
                    proveedor: proveedorData.proveedorNombre,
                    cantidad: cantidadParaAñadir,
                    precioUnitario: proveedorData.precioCompra,
                    total: cantidadParaAñadir * proveedorData.precioCompra,
                    timestamp: new Date()
                  });

                  toast.success('Artículo añadido al pedido', {
                    description: `${cantidadParaAñadir} × ${articuloSeleccionadoParaAñadir.nombre}`
                  });
                }

                // Cerrar modal y limpiar
                setModalAñadirArticuloAbierto(false);
                setArticuloSeleccionadoParaAñadir(null);
                setProveedorSeleccionadoParaAñadir('');
                setCantidadParaAñadir(0);
                setBusquedaArticulo('');
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir al Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================= */}
      {/* MODAL: DETALLES DE PEDIDO */}
      {/* ========================================= */}
      <Dialog open={modalDetallesPedido} onOpenChange={setModalDetallesPedido}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              📦 Detalles del Pedido
            </DialogTitle>
            <DialogDescription>
              Información completa del pedido al proveedor
            </DialogDescription>
          </DialogHeader>

          {pedidoSeleccionado && (
            <div className="space-y-6">
              {/* Información general del pedido */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Número de Pedido</p>
                    <p className="text-xl font-bold font-mono text-teal-700">
                      {pedidoSeleccionado.numeroPedido}
                    </p>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Proveedor</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <p className="text-xl font-semibold">{pedidoSeleccionado.proveedorNombre}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Estado</p>
                    <div className="mt-1">
                      {getBadgePedido(pedidoSeleccionado.estado)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Responsable</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <p className="font-medium">{pedidoSeleccionado.responsable}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fechas */}
              <Card>
                <CardHeader className="pb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Historial de Fechas
                  </h4>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">📋 Fecha de solicitud:</span>
                    <span className="font-medium">
                      {new Date(pedidoSeleccionado.fechaSolicitud).toLocaleString('es-ES')}
                    </span>
                  </div>
                  {pedidoSeleccionado.fechaConfirmacion && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">✅ Fecha de confirmación:</span>
                      <span className="font-medium">
                        {new Date(pedidoSeleccionado.fechaConfirmacion).toLocaleString('es-ES')}
                      </span>
                    </div>
                  )}
                  {pedidoSeleccionado.fechaEntrega ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">📦 Fecha de entrega:</span>
                      <span className="font-medium text-green-600">
                        {new Date(pedidoSeleccionado.fechaEntrega).toLocaleString('es-ES')}
                      </span>
                    </div>
                  ) : pedidoSeleccionado.fechaEstimadaEntrega && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">🕐 Fecha estimada de entrega:</span>
                      <span className="font-medium text-blue-600">
                        {new Date(pedidoSeleccionado.fechaEstimadaEntrega).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Artículos del pedido */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Artículos del Pedido
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Código</TableHead>
                        <TableHead>Artículo</TableHead>
                        <TableHead className="text-center">Ref. Proveedor</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidoSeleccionado.articulos.map((articulo) => (
                        <TableRow key={articulo.id}>
                          <TableCell>
                            <span className="font-mono text-sm font-semibold text-teal-700">
                              {articulo.codigo}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{articulo.nombre}</span>
                            <p className="text-xs text-gray-500">{articulo.nombreProveedor}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-mono text-sm text-gray-700">
                              {articulo.codigoProveedor}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-teal-100 text-teal-700">
                              {articulo.cantidad} uds
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {articulo.precioUnitario.toFixed(2)}€
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {articulo.subtotal.toFixed(2)}€
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Resumen financiero */}
              <Card className="bg-gradient-to-br from-teal-50 to-blue-50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal (sin impuestos):</span>
                    <span className="font-semibold text-lg">{pedidoSeleccionado.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">IVA:</span>
                    <span className="font-semibold text-lg">{pedidoSeleccionado.totalIva.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Recargo de Equivalencia:</span>
                    <span className="font-semibold text-lg">{pedidoSeleccionado.totalRecargoEquivalencia.toFixed(2)}€</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-gray-900">TOTAL:</span>
                    <span className="text-2xl font-bold text-teal-700">{pedidoSeleccionado.total.toFixed(2)}€</span>
                  </div>
                </CardContent>
              </Card>

              {/* Anotaciones */}
              {pedidoSeleccionado.anotaciones && (
                <Card>
                  <CardHeader className="pb-3">
                    <h4 className="font-semibold">📝 Anotaciones</h4>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{pedidoSeleccionado.anotaciones}</p>
                  </CardContent>
                </Card>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-4">
                {pedidoSeleccionado.metodoEnvio && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Método de Envío</p>
                      <Badge variant="outline">
                        {pedidoSeleccionado.metodoEnvio === 'email' && '📧 Email'}
                        {pedidoSeleccionado.metodoEnvio === 'whatsapp' && '💬 WhatsApp'}
                        {pedidoSeleccionado.metodoEnvio === 'app' && '📱 App'}
                        {pedidoSeleccionado.metodoEnvio === 'telefono' && '📞 Teléfono'}
                      </Badge>
                    </CardContent>
                  </Card>
                )}
                {pedidoSeleccionado.facturaId && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-1">Factura</p>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                        <span className="font-mono text-sm font-semibold">
                          {pedidoSeleccionado.facturaId}
                        </span>
                        {pedidoSeleccionado.facturaCaseada && (
                          <Badge className="bg-green-100 text-green-700 text-xs">✓ Caseada</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Acciones rápidas */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setModalDetallesPedido(false)}
                >
                  Cerrar
                </Button>
                {pedidoSeleccionado.estado !== 'entregado' && pedidoSeleccionado.estado !== 'anulado' && (
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      toast.info('Función de edición en desarrollo');
                    }}
                  >
                    Editar Pedido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================= */}
      {/* MODAL: NUEVO PROVEEDOR */}
      {/* ========================================= */}
      <Dialog open={modalNuevoProveedorAbierto} onOpenChange={setModalNuevoProveedorAbierto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nuevo Proveedor
            </DialogTitle>
            <DialogDescription>
              Registra un nuevo proveedor con toda su información comercial y fiscal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Información de la Empresa */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Información de la Empresa</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre / Razón Social *</Label>
                  <Input
                    id="nombre"
                    value={nuevoProveedor.nombre}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})}
                    placeholder="Ej: Distribuciones García S.L."
                  />
                </div>
                <div>
                  <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                  <Input
                    id="nombreComercial"
                    value={nuevoProveedor.nombreComercial}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombreComercial: e.target.value})}
                    placeholder="Ej: García Distribuciones"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cif">CIF / NIF *</Label>
                  <Input
                    id="cif"
                    value={nuevoProveedor.cif}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, cif: e.target.value})}
                    placeholder="Ej: B12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="tipoProveedor">Tipo de Proveedor *</Label>
                  <Select
                    value={nuevoProveedor.tipoProveedor}
                    onValueChange={(value) => setNuevoProveedor({...nuevoProveedor, tipoProveedor: value})}
                  >
                    <SelectTrigger id="tipoProveedor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materias_primas">Materias Primas</SelectItem>
                      <SelectItem value="productos_terminados">Productos Terminados</SelectItem>
                      <SelectItem value="envases_embalajes">Envases y Embalajes</SelectItem>
                      <SelectItem value="servicios">Servicios</SelectItem>
                      <SelectItem value="equipamiento">Equipamiento</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={nuevoProveedor.telefono}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})}
                    placeholder="+34 900 000 000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={nuevoProveedor.email}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, email: e.target.value})}
                  placeholder="contacto@proveedor.com"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Dirección Fiscal</h3>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección Completa *</Label>
                <Input
                  id="direccion"
                  value={nuevoProveedor.direccion}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, direccion: e.target.value})}
                  placeholder="Calle, número, piso, puerta"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="codigoPostal">Código Postal *</Label>
                  <Input
                    id="codigoPostal"
                    value={nuevoProveedor.codigoPostal}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, codigoPostal: e.target.value})}
                    placeholder="08001"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="ciudad">Ciudad / Localidad *</Label>
                  <Input
                    id="ciudad"
                    value={nuevoProveedor.ciudad}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, ciudad: e.target.value})}
                    placeholder="Barcelona"
                  />
                </div>
                <div>
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    value={nuevoProveedor.provincia}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, provincia: e.target.value})}
                    placeholder="Barcelona"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={nuevoProveedor.pais}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, pais: e.target.value})}
                />
              </div>
            </div>

            {/* Persona de Contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Persona de Contacto</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personaContacto">Nombre Completo</Label>
                  <Input
                    id="personaContacto"
                    value={nuevoProveedor.personaContacto}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, personaContacto: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <Label htmlFor="cargoContacto">Cargo</Label>
                  <Input
                    id="cargoContacto"
                    value={nuevoProveedor.cargoContacto}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, cargoContacto: e.target.value})}
                    placeholder="Director Comercial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefonoContacto">Teléfono</Label>
                  <Input
                    id="telefonoContacto"
                    type="tel"
                    value={nuevoProveedor.telefonoContacto}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefonoContacto: e.target.value})}
                    placeholder="+34 600 000 000"
                  />
                </div>
                <div>
                  <Label htmlFor="emailContacto">Email</Label>
                  <Input
                    id="emailContacto"
                    type="email"
                    value={nuevoProveedor.emailContacto}
                    onChange={(e) => setNuevoProveedor({...nuevoProveedor, emailContacto: e.target.value})}
                    placeholder="juan.perez@proveedor.com"
                  />
                </div>
              </div>
            </div>

            {/* Datos Bancarios y de Pago */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <DollarSign className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Datos Bancarios y Condiciones de Pago</h3>
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={nuevoProveedor.iban}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, iban: e.target.value})}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formaPago">Forma de Pago</Label>
                  <Select
                    value={nuevoProveedor.formaPago}
                    onValueChange={(value) => setNuevoProveedor({...nuevoProveedor, formaPago: value})}
                  >
                    <SelectTrigger id="formaPago">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                      <SelectItem value="domiciliacion">Domiciliación Bancaria</SelectItem>
                      <SelectItem value="contado">Contado</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="pagare">Pagaré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plazosPago">Plazo de Pago (días)</Label>
                  <Select
                    value={nuevoProveedor.plazosPago}
                    onValueChange={(value) => setNuevoProveedor({...nuevoProveedor, plazosPago: value})}
                  >
                    <SelectTrigger id="plazosPago">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Contado (0 días)</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                      <SelectItem value="120">120 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notas Adicionales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <ClipboardList className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Notas y Observaciones</h3>
              </div>

              <div>
                <Label htmlFor="notas">Notas Internas</Label>
                <Textarea
                  id="notas"
                  value={nuevoProveedor.notas}
                  onChange={(e) => setNuevoProveedor({...nuevoProveedor, notas: e.target.value})}
                  placeholder="Información adicional sobre el proveedor, acuerdos especiales, etc."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 pt-4 border-t">
            <p className="text-sm text-gray-500">* Campos obligatorios</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setModalNuevoProveedorAbierto(false);
                  // Reset form
                  setNuevoProveedor({
                    nombre: '',
                    nombreComercial: '',
                    cif: '',
                    direccion: '',
                    ciudad: '',
                    codigoPostal: '',
                    provincia: '',
                    pais: 'España',
                    telefono: '',
                    email: '',
                    personaContacto: '',
                    cargoContacto: '',
                    telefonoContacto: '',
                    emailContacto: '',
                    iban: '',
                    formaPago: 'transferencia',
                    plazosPago: '30',
                    tipoProveedor: 'materias_primas',
                    categorias: [],
                    notas: ''
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  // 🔌 EVENTO: PROVEEDOR_CREADO
                  console.log('🔌 EVENTO: PROVEEDOR_CREADO', {
                    payload: nuevoProveedor,
                    timestamp: new Date()
                  });
                  
                  toast.success('Proveedor creado correctamente', {
                    description: `${nuevoProveedor.nombre} ha sido registrado en el sistema`
                  });
                  
                  setModalNuevoProveedorAbierto(false);
                  
                  // Reset form
                  setNuevoProveedor({
                    nombre: '',
                    nombreComercial: '',
                    cif: '',
                    direccion: '',
                    ciudad: '',
                    codigoPostal: '',
                    provincia: '',
                    pais: 'España',
                    telefono: '',
                    email: '',
                    personaContacto: '',
                    cargoContacto: '',
                    telefonoContacto: '',
                    emailContacto: '',
                    iban: '',
                    formaPago: 'transferencia',
                    plazosPago: '30',
                    tipoProveedor: 'materias_primas',
                    categorias: [],
                    notas: ''
                  });
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Proveedor
              </Button>
            </div>
          </div>

          {/* 🔌 EVENTO: PROVEEDOR_CREADO */}
          {/* 📊 CONEXIÓN DATOS: INSERT INTO PROVEEDOR */}
          {/* 💡 Nota para el programador: Validar campos obligatorios antes de enviar */}
        </DialogContent>
      </Dialog>

      {/* ========================================= */}
      {/* MODAL: DETALLE ARTÍCULO COMPLETO */}
      {/* ========================================= */}
      <ModalDetalleArticulo 
        open={modalDetallesAbierto}
        onClose={() => setModalDetallesAbierto(false)}
        articulo={productoSeleccionado ? {
          id: productoSeleccionado.id,
          codigo: productoSeleccionado.codigo,
          nombre: productoSeleccionado.nombre,
          categoria: productoSeleccionado.categoria,
          marca: productoSeleccionado.empresa,
          pdv: productoSeleccionado.almacen,
          disponible: productoSeleccionado.disponible,
          comprometido: productoSeleccionado.comprometido,
          minimo: productoSeleccionado.minimo,
          optimo: productoSeleccionado.maximo,
          ubicacion: productoSeleccionado.ubicacion,
          costeUnitario: productoSeleccionado.costoMedio,
          pvp: productoSeleccionado.pvp,
          margen: productoSeleccionado.pvp - productoSeleccionado.costoMedio,
          valorStock: productoSeleccionado.disponible * productoSeleccionado.costoMedio,
          proveedorPrincipal: productoSeleccionado.proveedorPreferente,
          proveedorId: 'PROV001',
          leadTime: productoSeleccionado.leadTime,
          puntoReorden: productoSeleccionado.rop,
          rotacion: productoSeleccionado.rotacion,
          consumoMedio: productoSeleccionado.disponible / 30,
          ultimasCompras: [
            {
              fecha: '2024-11-20',
              proveedor: productoSeleccionado.proveedorPreferente,
              cantidad: 50,
              precio: productoSeleccionado.costoMedio,
              total: 50 * productoSeleccionado.costoMedio
            }
          ],
          escandallo: []
        } : null}
      />

      {/* ========================================= */}
      {/* MODAL: RECEPCIÓN DE MATERIAL */}
      {/* ========================================= */}
      <RecepcionMaterialModal 
        isOpen={modalRecepcionAbierto}
        onOpenChange={(open) => {
          setModalRecepcionAbierto(open);
          if (!open) {
            setProductoSeleccionado(null);
          }
        }}
        onRecepcionCompletada={() => {
          toast.success('Material recibido correctamente');
          console.log('🔌 EVENTO: MATERIAL_RECIBIDO_GERENTE', {
            articulo: productoSeleccionado,
            timestamp: new Date()
          });
        }}
      />

      {/* ========================================= */}
      {/* MODAL: NUEVO PEDIDO V2 (FLUJO COMPLETO 5 PASOS) */}
      {/* ========================================= */}
      <ModalNuevoPedidoV2 
        open={modalNuevoPedidoV2}
        onClose={() => setModalNuevoPedidoV2(false)}
      />

      {/* ========================================= */}
      {/* MODALES CRUD PROVEEDORES Y ARTÍCULOS */}
      {/* ========================================= */}
      <ModalNuevoProveedor
        isOpen={showModalNuevoProveedor}
        onClose={() => {
          setShowModalNuevoProveedor(false);
          setEditingProveedor(null);
        }}
        onSuccess={() => {
          setShowModalNuevoProveedor(false);
          setEditingProveedor(null);
          cargarProveedores();
          toast.success(editingProveedor ? 'Proveedor actualizado' : 'Proveedor creado');
        }}
        empresaId={empresaActiva}
        isEditing={!!editingProveedor}
        proveedorData={editingProveedor}
      />

      <ModalNuevoArticulo
        isOpen={showModalNuevoArticulo}
        onClose={() => {
          setShowModalNuevoArticulo(false);
          setEditingArticulo(null);
        }}
        onSuccess={() => {
          setShowModalNuevoArticulo(false);
          setEditingArticulo(null);
          cargarArticulos();
          toast.success(editingArticulo ? 'Artículo actualizado' : 'Artículo creado');
        }}
        empresaId={empresaActiva}
        puntoVentaId={puntoVentaActivo}
        isEditing={!!editingArticulo}
        articuloData={editingArticulo}
      />

      <ModalNuevoPedidoProveedor
        isOpen={showModalNuevoPedido}
        onClose={() => {
          setShowModalNuevoPedido(false);
          setEditingPedido(null);
        }}
        onSuccess={() => {
          setShowModalNuevoPedido(false);
          setEditingPedido(null);
          cargarPedidos();
          toast.success(editingPedido ? 'Pedido actualizado' : 'Pedido creado');
        }}
        empresaId={empresaActiva}
        puntoVentaId={puntoVentaActivo}
        proveedores={proveedoresData.map(normalizarProveedor)}
        articulos={(() => {
          const articulosNormalizados = articulosData.map(normalizarArticulo);
          console.log('📋 Artículos normalizados para modal:', articulosNormalizados);
          return articulosNormalizados;
        })()}
        isEditing={!!editingPedido}
        pedidoData={editingPedido}
      />

      <ModalRecepcionMaterial
        isOpen={showModalRecepcion}
        onClose={() => {
          setShowModalRecepcion(false);
          setSelectedPedidoRecepcion(null);
        }}
        onSuccess={() => {
          setShowModalRecepcion(false);
          setSelectedPedidoRecepcion(null);
          cargarPedidos();
          toast.success('Recepción registrada correctamente');
        }}
        pedidoData={selectedPedidoRecepcion}
      />

      {/* Modal Nueva Sesión de Inventario */}
      <Dialog open={showModalNuevaSesion} onOpenChange={setShowModalNuevaSesion}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Sesión de Inventario</DialogTitle>
            <DialogDescription>
              Crea una nueva sesión para realizar conteo de inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="sesion-nombre">Nombre de la Sesión *</Label>
              <Input
                id="sesion-nombre"
                placeholder="Ej: Inventario PDV Diciembre"
                value={nuevaSesionForm.nombre}
                onChange={(e) => setNuevaSesionForm(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sesion-tipo">Tipo</Label>
                <Select 
                  value={nuevaSesionForm.tipo} 
                  onValueChange={(value) => setNuevaSesionForm(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ciclico">Cíclico</SelectItem>
                    <SelectItem value="total">Total</SelectItem>
                    <SelectItem value="aleatorio">Aleatorio</SelectItem>
                    <SelectItem value="rapido">Rápido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sesion-almacen">Almacén</Label>
                <Select 
                  value={nuevaSesionForm.almacen} 
                  onValueChange={(value) => setNuevaSesionForm(prev => ({ ...prev, almacen: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDV">Punto de Venta</SelectItem>
                    <SelectItem value="Almacén 1">Almacén 1</SelectItem>
                    <SelectItem value="Almacén 2">Almacén 2</SelectItem>
                    <SelectItem value="Todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="sesion-responsables">Responsables (separados por coma)</Label>
              <Input
                id="sesion-responsables"
                placeholder="Ej: Carlos Ruiz, María García"
                value={nuevaSesionForm.responsables}
                onChange={(e) => setNuevaSesionForm(prev => ({ ...prev, responsables: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="sesion-fecha">Fecha Límite</Label>
              <Input
                id="sesion-fecha"
                type="date"
                value={nuevaSesionForm.fechaLimite}
                onChange={(e) => setNuevaSesionForm(prev => ({ ...prev, fechaLimite: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="sesion-obs">Observaciones</Label>
              <Textarea
                id="sesion-obs"
                placeholder="Notas adicionales..."
                value={nuevaSesionForm.observaciones}
                onChange={(e) => setNuevaSesionForm(prev => ({ ...prev, observaciones: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowModalNuevaSesion(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={async () => {
                if (!nuevaSesionForm.nombre.trim()) {
                  toast.error('El nombre de la sesión es requerido');
                  return;
                }
                
                try {
                  await stockApi.crearSesionInventario({
                    nombre: nuevaSesionForm.nombre,
                    tipo: nuevaSesionForm.tipo,
                    almacen: nuevaSesionForm.almacen,
                    empresa_id: empresaActiva || 'EMP-001',
                    punto_venta_id: puntoVentaActivo || 'PDV-001',
                    responsables: nuevaSesionForm.responsables.split(',').map(r => r.trim()).filter(r => r),
                    fecha_limite: nuevaSesionForm.fechaLimite || undefined,
                    observaciones: nuevaSesionForm.observaciones || undefined
                  });
                  
                  toast.success('Sesión de inventario creada');
                  setShowModalNuevaSesion(false);
                  setNuevaSesionForm({
                    nombre: '',
                    tipo: 'ciclico',
                    almacen: 'PDV',
                    responsables: '',
                    fechaLimite: '',
                    observaciones: ''
                  });
                  cargarSesionesInventario();
                } catch (error) {
                  console.error('Error al crear sesión:', error);
                  toast.error('Error al crear sesión de inventario');
                }
              }}
            >
              Crear Sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}