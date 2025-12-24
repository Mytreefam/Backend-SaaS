/**
 * 📦 GESTIÓN DE PRODUCTOS - GERENTE
 * CRUD completo de productos para gestionar catálogo desde móvil/web
 * Optimizado para uso en APK móvil
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  PUNTOS_VENTA_ARRAY,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca,
  getIconoMarca,
  EMPRESAS,
  MARCAS,
  PUNTOS_VENTA
} from '../../constants/empresaConfig';
import { useStock } from '../../contexts/StockContext';
import { CATEGORIAS_PRODUCTOS } from '../../contexts/ProductosContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Filter,
  SortAsc,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { productosGerenteApi } from '../../services/api/gerente.api';

// ============================================
// TIPOS
// ============================================

interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  
  // ⭐ NUEVOS CAMPOS: TIPO DE PRODUCTO
  tipo_producto: 'simple' | 'manufacturado' | 'combo';
  
  // ⭐ NUEVOS CAMPOS: MULTI-EMPRESA Y MULTI-MARCA
  empresa_id: string;
  empresa_nombre: string;
  marcas_ids: string[]; // ⭐ Array: producto puede estar en VARIAS marcas
  marcas_nombres: string[]; // ⭐ Array: nombres de las marcas
  punto_venta_id?: string; // Opcional: catálogo global o específico de tienda
  
  // ⭐ NUEVOS CAMPOS: RELACIONES
  articulo_stock_id?: string; // Solo si tipo_producto = 'simple'
  escandallo_id?: string;     // Solo si tipo_producto = 'manufacturado'
  productos_incluidos?: Array<{ // Solo si tipo_producto = 'combo'
    producto_id: string;
    cantidad: number;
  }>;
  
  // COSTOS (calculados desde escandallo si manufacturado)
  costo_ingredientes?: number;
  costo_envases?: number;
  costo_total?: number;
  margen_bruto_pct?: number;
  
  // PRECIOS
  precio: number;
  precio_compra: number;
  
  // STOCK (solo para productos simples)
  stock: number;
  stock_minimo: number;
  
  // PRESENTACIÓN
  imagen?: string;
  peso?: number;
  unidad: 'unidad' | 'kg' | 'litro';
  
  // ESTADO
  activo: boolean;
  destacado: boolean;
  visible_app: boolean;
  visible_tpv: boolean;
  
  // FISCALIDAD
  iva: number;
  
  // LEGACY
  proveedor_id?: string;
  
  // METADATA
  fecha_creacion: Date;
  fecha_modificacion: Date;
  notas?: string;
}

// ============================================
// DATOS MOCK
// ============================================

// ⭐ ESCANDALLOS DISPONIBLES (para vincular con productos)
interface EscandalloDisponible {
  id: string;
  nombre_producto: string;
  costo_ingredientes: number;
  costo_envases: number;
  costo_total: number;
  empresa_id: string;
  marcas_ids: string[];
}

const ESCANDALLOS_DISPONIBLES: EscandalloDisponible[] = [
  {
    id: 'ESC-PAN-001',
    nombre_producto: 'Pan de Masa Madre',
    costo_ingredientes: 1.05,
    costo_envases: 0.15,
    costo_total: 1.20,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.MODOMIO]
  },
  {
    id: 'ESC-CROIS-001',
    nombre_producto: 'Croissant de Mantequilla',
    costo_ingredientes: 0.40,
    costo_envases: 0.05,
    costo_total: 0.45,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.MODOMIO]
  },
  {
    id: 'ESC-TARTA-001',
    nombre_producto: 'Tarta de Zanahoria',
    costo_ingredientes: 1.65,
    costo_envases: 0.15,
    costo_total: 1.80,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.MODOMIO]
  },
  {
    id: 'ESC-BOC-001',
    nombre_producto: 'Bocadillo de Jamón Ibérico',
    costo_ingredientes: 2.30,
    costo_envases: 0.20,
    costo_total: 2.50,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.BLACKBURGUER]
  },
  {
    id: 'ESC-CAFE-001',
    nombre_producto: 'Café con Leche',
    costo_ingredientes: 0.12,
    costo_envases: 0.03,
    costo_total: 0.15,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.MODOMIO, MARCAS.BLACKBURGUER] // ⭐ En ambas marcas
  },
];



// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function GestionProductos() {
  // Contextos
  const { stock: stockArticulos, getStockPorEmpresa } = useStock();
  
  // Estados - Cargar productos desde la API
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [fuenteDatos, setFuenteDatos] = useState<'api' | 'mock'>('api');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  
  // Estados de filtros (movidos aquí ANTES del useEffect)
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'inactivos'>('activos');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'simple' | 'manufacturado' | 'combo'>('todos');
  const [empresaFiltro, setEmpresaFiltro] = useState<string>('todos');
  const [marcaFiltro, setMarcaFiltro] = useState<string>('todos');
  const [ordenar, setOrdenar] = useState<'nombre' | 'precio' | 'stock' | 'ventas'>('nombre');
  
  // Cargar productos de la API
  useEffect(() => {
    const cargarProductos = async () => {
      console.log('🔄 Iniciando carga de productos desde API...');
      setCargandoProductos(true);
      try {
        const productosData = await productosGerenteApi.obtenerProductos({
          empresa_id: empresaFiltro !== 'todos' ? empresaFiltro : undefined,
          marca_id: marcaFiltro !== 'todos' ? marcaFiltro : undefined,
          activo: estadoFiltro === 'activos' ? true : estadoFiltro === 'inactivos' ? false : undefined
        });
        
        console.log('✅ Productos recibidos de la API:', productosData.length, productosData);
        
        // Mapear datos de la API al formato del componente
        const productosMapeados = productosData.map(p => ({
          ...p,
          tipo_producto: 'simple' as 'simple' | 'manufacturado' | 'combo',
          empresa_id: p.empresa_id || EMPRESAS.DISARMINK,
          empresa_nombre: 'Mi Empresa',
          marcas_ids: [MARCAS.MODOMIO],
          marcas_nombres: ['Mi Marca'],
          precio_compra: p.precio_compra || p.precio * 0.6,
          stock_minimo: p.stock_minimo || 10,
          activo: p.activo !== undefined ? p.activo : true,
          destacado: false,
          visible_app: p.visible_app !== undefined ? p.visible_app : true,
          visible_tpv: p.visible_tpv !== undefined ? p.visible_tpv : true,
          iva: 10,
          unidad: 'unidad' as 'unidad' | 'kg' | 'litro',
          fecha_creacion: new Date(),
          fecha_modificacion: new Date()
        }));
        
        console.log('✅ Productos mapeados para la interfaz:', productosMapeados.length);
        setProductos(productosMapeados);
        setFuenteDatos('api');
        toast.success(`Cargados ${productosMapeados.length} productos desde la API`);
      } catch (error) {
        console.error('❌ Error cargando productos desde API:', error);
        setProductos([]); // Array vacío si no hay conexión a API
        setFuenteDatos('api');
        toast.error('❌ Error conectando con la API. Verifica que el servidor esté corriendo.');
      } finally {
        setCargandoProductos(false);
      }
    };
    
    cargarProductos();
  }, [empresaFiltro, marcaFiltro, estadoFiltro]); // Removido productosContext de dependencias
  
  // Modales
  const [modalProducto, setModalProducto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null);
  
  // Formulario
  const [formData, setFormData] = useState<Partial<Producto>>({
    sku: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo_producto: 'simple',
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.MODOMIO], // ⭐ Array de marcas
    marcas_nombres: ['Modomio'],
    precio: 0,
    precio_compra: 0,
    stock: 0,
    stock_minimo: 10,
    activo: true,
    destacado: false,
    visible_app: true,
    visible_tpv: true,
    iva: 10,
    unidad: 'unidad',
    notas: ''
  });

  // ============================================
  // CÁLCULOS CON USEMEMO
  // ============================================

  // ⭐ FILTRAR ESCANDALLOS según empresa y marcas del producto
  const escandallosFiltrados = useMemo(() => {
    if (!formData.empresa_id) return [];
    
    return ESCANDALLOS_DISPONIBLES.filter(esc => {
      // Debe pertenecer a la misma empresa
      const matchEmpresa = esc.empresa_id === formData.empresa_id;
      
      // Debe tener al menos una marca en común
      const tieneAlgunaMarcaEnComun = formData.marcas_ids?.some(marcaId => 
        esc.marcas_ids.includes(marcaId)
      );
      
      return matchEmpresa && tieneAlgunaMarcaEnComun;
    });
  }, [formData.empresa_id, formData.marcas_ids]);

  // ⭐ CALCULAR COSTOS Y MARGEN DEL FORMULARIO
  const costosCalculados = useMemo(() => {
    let costo_total = 0;
    let costo_ingredientes = 0;
    let costo_envases = 0;

    // Si hay escandallo seleccionado, obtener su costo
    if (formData.tipo_producto === 'manufacturado' && formData.escandallo_id) {
      const escandallo = ESCANDALLOS_DISPONIBLES.find(e => e.id === formData.escandallo_id);
      if (escandallo) {
        costo_ingredientes = escandallo.costo_ingredientes;
        costo_envases = escandallo.costo_envases;
        costo_total = escandallo.costo_total;
      }
    } else if (formData.tipo_producto === 'simple') {
      // Para productos simples, usar precio_compra
      costo_total = formData.precio_compra || 0;
    }

    // Calcular margen
    const precio = formData.precio || 0;
    const margen_bruto_pct = precio > 0 ? ((precio - costo_total) / precio) * 100 : 0;

    return {
      costo_ingredientes,
      costo_envases,
      costo_total,
      margen_bruto_pct
    };
  }, [formData.tipo_producto, formData.escandallo_id, formData.precio, formData.precio_compra]);

  const productosCalculados = useMemo(() => {
    return productos.map(p => ({
      ...p,
      margen: ((p.precio - p.precio_compra) / p.precio) * 100,
      margen_unitario: p.precio - p.precio_compra,
      precio_con_iva: p.precio * (1 + p.iva / 100),
      valor_stock: p.stock * p.precio_compra,
      necesita_reposicion: p.stock <= p.stock_minimo
    }));
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productosCalculados.filter(p => {
      const matchBusqueda = 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchCategoria = categoriaFiltro === 'todos' || p.categoria === categoriaFiltro;
      
      const matchEstado = 
        estadoFiltro === 'todos' ? true :
        estadoFiltro === 'activos' ? p.activo :
        !p.activo;
      
      // ⭐ NUEVOS FILTROS
      const matchTipo = tipoFiltro === 'todos' || p.tipo_producto === tipoFiltro;
      const matchEmpresa = empresaFiltro === 'todos' || p.empresa_id === empresaFiltro;
      const matchMarca = marcaFiltro === 'todos' || p.marcas_ids.includes(marcaFiltro); // ⭐ Buscar en array
      
      return matchBusqueda && matchCategoria && matchEstado && matchTipo && matchEmpresa && matchMarca;
    }).sort((a, b) => {
      switch (ordenar) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'precio':
          return b.precio - a.precio;
        case 'stock':
          return a.stock - b.stock;
        case 'ventas':
          return b.precio - a.precio; // Mock: ordenar por precio
        default:
          return 0;
      }
    });
  }, [productosCalculados, busqueda, categoriaFiltro, estadoFiltro, tipoFiltro, empresaFiltro, marcaFiltro, ordenar]);

  const estadisticas = useMemo(() => {
    const activos = productos.filter(p => p.activo);
    const destacados = productos.filter(p => p.destacado);
    const stockBajo = productosCalculados.filter(p => p.necesita_reposicion);
    const simples = productos.filter(p => p.tipo_producto === 'simple');
    const manufacturados = productos.filter(p => p.tipo_producto === 'manufacturado');
    const combos = productos.filter(p => p.tipo_producto === 'combo');
    
    const valorTotal = productosCalculados.reduce((sum, p) => sum + p.valor_stock, 0);
    const precioMedio = productos.reduce((sum, p) => sum + p.precio, 0) / productos.length;
    const margenMedio = productosCalculados.reduce((sum, p) => sum + p.margen, 0) / productos.length;
    
    return {
      total: productos.length,
      activos: activos.length,
      inactivos: productos.length - activos.length,
      destacados: destacados.length,
      stockBajo: stockBajo.length,
      simples: simples.length,
      manufacturados: manufacturados.length,
      combos: combos.length,
      valorTotal,
      precioMedio,
      margenMedio
    };
  }, [productos, productosCalculados]);

  // ============================================
  // FUNCIONES
  // ============================================

  const abrirModalNuevo = () => {
    setProductoEditando(null);
    setFormData({
      sku: `SKU-${Date.now()}`,
      nombre: '',
      descripcion: '',
      categoria: '',
      tipo_producto: 'simple',
      empresa_id: EMPRESAS.DISARMINK,
      empresa_nombre: 'Disarmink SL - Hoy Pecamos',
      marcas_ids: [MARCAS.MODOMIO], // ⭐ Array de marcas
      marcas_nombres: ['Modomio'],
      precio: 0,
      precio_compra: 0,
      stock: 0,
      stock_minimo: 10,
      activo: true,
      destacado: false,
      visible_app: true,
      visible_tpv: true,
      iva: 10,
      unidad: 'unidad',
      notas: ''
    });
    setModalProducto(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setFormData(producto);
    setModalProducto(true);
  };

  const guardarProducto = async () => {
    // Validaciones básicas
    if (!formData.nombre || !formData.categoria || !formData.sku) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (!formData.tipo_producto || !formData.empresa_id || !formData.marcas_ids || formData.marcas_ids.length === 0) {
      toast.error('Debes seleccionar tipo de producto, empresa y al menos una marca');
      return;
    }

    // ⭐ Validaciones por tipo de producto
    if (formData.tipo_producto === 'simple' && !formData.articulo_stock_id) {
      toast.error('Los productos simples deben estar vinculados a un artículo del stock');
      return;
    }

    if (formData.tipo_producto === 'manufacturado' && !formData.escandallo_id) {
      toast.warning('Los productos manufacturados deberían tener una receta (escandallo). Puedes crearla después.');
    }

    if (formData.tipo_producto === 'combo' && (!formData.productos_incluidos || formData.productos_incluidos.length === 0)) {
      toast.error('Los combos deben incluir al menos un producto');
      return;
    }

    // Actualizar nombres de empresa y marcas según los IDs
    const empresaSeleccionada = EMPRESAS_ARRAY.find(e => e.id === formData.empresa_id);
    const marcasNombres = formData.marcas_ids?.map(marcaId => {
      const marca = MARCAS_ARRAY.find(m => m.id === marcaId);
      return marca ? getNombreMarca(marca.id) : '';
    }).filter(Boolean) || [];

    // ⭐ INCLUIR COSTOS CALCULADOS DESDE ESCANDALLO
    const datosActualizados = {
      ...formData,
      empresa_nombre: empresaSeleccionada ? getNombreEmpresa(empresaSeleccionada.id) : formData.empresa_nombre,
      marcas_nombres: marcasNombres,
      // ⭐ Añadir costos calculados
      costo_ingredientes: costosCalculados.costo_ingredientes,
      costo_envases: costosCalculados.costo_envases,
      costo_total: costosCalculados.costo_total,
      margen_bruto_pct: costosCalculados.margen_bruto_pct,
      // Actualizar precio_compra para productos manufacturados
      precio_compra: formData.tipo_producto === 'manufacturado' 
        ? costosCalculados.costo_total 
        : formData.precio_compra
    };

    try {
      if (productoEditando) {
        // Editar
        const productoActualizado = await productosGerenteApi.actualizarProducto(productoEditando.id, datosActualizados);
        setProductos(productos.map(p => 
          p.id === productoEditando.id 
            ? { ...productoEditando, ...productoActualizado, fecha_modificacion: new Date() }
            : p
        ));
        actualizarProducto(productoEditando.id, productoActualizado); // ✅ Sincronizar con contexto
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo
        const nuevoProducto = await productosGerenteApi.crearProducto(datosActualizados);
        setProductos([...productos, { ...datosActualizados, ...nuevoProducto, fecha_creacion: new Date(), fecha_modificacion: new Date() } as Producto]);
        agregarProducto(nuevoProducto as Producto); // ✅ Sincronizar con contexto
        toast.success('Producto creado correctamente');
      }
      setModalProducto(false);
    } catch (error) {
      toast.error(productoEditando ? 'Error al actualizar producto' : 'Error al crear producto');
      console.error(error);
    }
  };

  const confirmarEliminar = async () => {
    if (!productoEliminar) return;
    
    try {
      await productosGerenteApi.eliminarProducto(productoEliminar.id);
      setProductos(productos.filter(p => p.id !== productoEliminar.id));
      eliminarProducto(productoEliminar.id); // ✅ Sincronizar con contexto
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
      console.error(error);
    } finally {
      setModalEliminar(false);
      setProductoEliminar(null);
    }
  };

  const duplicarProducto = (producto: Producto) => {
    const duplicado: Producto = {
      ...producto,
      id: `prod-${Date.now()}`,
      sku: `${producto.sku}-COPY`,
      nombre: `${producto.nombre} (Copia)`,
      fecha_creacion: new Date(),
      fecha_modificacion: new Date()
    };
    setProductos([...productos, duplicado]);
    agregarProducto(duplicado); // ✅ Sincronizar con contexto
    toast.success('Producto duplicado correctamente');
  };

  const toggleEstado = async (producto: Producto) => {
    const estadoNuevo = !producto.activo;
    try {
      await productosGerenteApi.actualizarProducto(producto.id, { activo: estadoNuevo });
      setProductos(productos.map(p =>
        p.id === producto.id ? { ...p, activo: estadoNuevo } : p
      ));
      actualizarProducto(producto.id, { activo: estadoNuevo }); // ✅ Sincronizar con contexto
      toast.success(`Producto ${estadoNuevo ? 'activado' : 'desactivado'}`);
    } catch (error) {
      toast.error('Error al cambiar estado del producto');
      console.error(error);
    }
  };

  const toggleDestacado = (producto: Producto) => {
    setProductos(productos.map(p =>
      p.id === producto.id ? { ...p, destacado: !p.destacado } : p
    ));
    toast.success(`Producto ${!producto.destacado ? 'destacado' : 'quitado de destacados'}`);
  };

  // ============================================
  // ⭐ FASE 4: SINCRONIZACIÓN BIDIRECCIONAL
  // ============================================

  // Función para verificar si un producto tiene costos desactualizados
  const verificarCostosDesactualizados = (producto: Producto): boolean => {
    if (producto.tipo_producto !== 'manufacturado' || !producto.escandallo_id) {
      return false;
    }

    const escandallo = ESCANDALLOS_DISPONIBLES.find(e => e.id === producto.escandallo_id);
    if (!escandallo) return false;

    // Comparar con tolerancia de 0.01€
    const diferencia = Math.abs((producto.costo_total || 0) - escandallo.costo_total);
    return diferencia > 0.01;
  };

  // Función para recalcular costos de un producto desde su escandallo
  const recalcularCostosDesdeEscandallo = (productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
      toast.error('Producto no encontrado');
      return;
    }

    if (producto.tipo_producto !== 'manufacturado' || !producto.escandallo_id) {
      toast.error('Este producto no tiene escandallo vinculado');
      return;
    }

    const escandallo = ESCANDALLOS_DISPONIBLES.find(e => e.id === producto.escandallo_id);
    if (!escandallo) {
      toast.error('Escandallo no encontrado');
      return;
    }

    // Recalcular margen con el nuevo costo
    const nuevoMargen = producto.precio > 0 
      ? ((producto.precio - escandallo.costo_total) / producto.precio) * 100 
      : 0;

    // Actualizar producto
    setProductos(productos.map(p =>
      p.id === productoId
        ? {
            ...p,
            costo_ingredientes: escandallo.costo_ingredientes,
            costo_envases: escandallo.costo_envases,
            costo_total: escandallo.costo_total,
            precio_compra: escandallo.costo_total,
            margen_bruto_pct: nuevoMargen,
            fecha_modificacion: new Date()
          }
        : p
    ));

    toast.success(`Costos actualizados: €${escandallo.costo_total.toFixed(2)} | Margen: ${nuevoMargen.toFixed(1)}%`);
  };

  // Función para recalcular todos los productos con costos desactualizados
  const recalcularTodosLosProductosDesactualizados = () => {
    const productosDesactualizados = productos.filter(p => verificarCostosDesactualizados(p));
    
    if (productosDesactualizados.length === 0) {
      toast.info('Todos los productos están sincronizados');
      return;
    }

    productosDesactualizados.forEach(producto => {
      recalcularCostosDesdeEscandallo(producto.id);
    });

    toast.success(`${productosDesactualizados.length} producto(s) actualizados`);
  };

  // Contar productos desactualizados
  const countProductosDesactualizados = useMemo(() => {
    return productos.filter(p => verificarCostosDesactualizados(p)).length;
  }, [productos]);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl tracking-tight">Gestión de Productos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra tu catálogo de productos
            {cargandoProductos ? (
              <span className="ml-2 text-blue-600 font-medium">
                • Cargando desde API...
              </span>
            ) : (
              <span className={`ml-2 font-medium ${fuenteDatos === 'api' ? 'text-green-600' : 'text-orange-600'}`}>
                • {productos.length} productos cargados desde {fuenteDatos === 'api' ? 'API' : 'MOCK'}
              </span>
            )}
            {countProductosDesactualizados > 0 && (
              <span className="ml-2 text-orange-600 font-medium">
                • {countProductosDesactualizados} producto(s) con costos desactualizados
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          {/* ⭐ Botón para recalcular productos desactualizados */}
          {countProductosDesactualizados > 0 && (
            <Button 
              onClick={recalcularTodosLosProductosDesactualizados}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 w-full sm:w-auto"
            >
              <Package className="w-4 h-4 mr-2" />
              Actualizar Costos ({countProductosDesactualizados})
            </Button>
          )}
          <Button 
            onClick={abrirModalNuevo}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Package className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Productos</p>
                <p className="text-xl sm:text-2xl font-semibold">{estadisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Activos</p>
                <p className="text-xl sm:text-2xl font-semibold">{estadisticas.activos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Stock Bajo</p>
                <p className="text-xl sm:text-2xl font-semibold">{estadisticas.stockBajo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Margen Medio</p>
                <p className="text-xl sm:text-2xl font-semibold">{estadisticas.margenMedio.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Fila 1: Búsqueda, Categoría, Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {/* Búsqueda */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, SKU..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Categoría */}
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {categoriasContext.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Estado */}
              <Select value={estadoFiltro} onValueChange={(v: any) => setEstadoFiltro(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ⭐ Fila 2: NUEVOS FILTROS - Tipo, Empresa, Marca */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {/* Tipo de Producto */}
              <Select value={tipoFiltro} onValueChange={(v: any) => setTipoFiltro(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="simple">Simple (sin manufacturar)</SelectItem>
                  <SelectItem value="manufacturado">Manufacturado (con receta)</SelectItem>
                  <SelectItem value="combo">Combo/Pack</SelectItem>
                </SelectContent>
              </Select>

              {/* Empresa */}
              <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las empresas</SelectItem>
                  {EMPRESAS_ARRAY.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {getNombreEmpresa(emp.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Marca */}
              <Select value={marcaFiltro} onValueChange={setMarcaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las marcas</SelectItem>
                  {MARCAS_ARRAY.map(marca => (
                    <SelectItem key={marca.id} value={marca.id}>
                      {getNombreMarca(marca.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Productos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Productos ({productosFiltrados.length})
            </CardTitle>
            <Select value={ordenar} onValueChange={(v: any) => setOrdenar(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nombre">Nombre</SelectItem>
                <SelectItem value="precio">Precio</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Vista Mobile - Cards */}
          <div className="block md:hidden space-y-3 p-4">
            {productosFiltrados.map(producto => (
              <Card key={producto.id} className="overflow-hidden">
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{producto.nombre}</h3>
                        {producto.destacado && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            ⭐
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{producto.sku}</p>
                      <p className="text-xs text-gray-600 mt-1">{producto.categoria}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {producto.tipo_producto === 'simple' ? '🥤 Simple' : 
                           producto.tipo_producto === 'manufacturado' ? '👨‍🍳 Manufacturado' : 
                           '📦 Combo'}
                        </Badge>
                        {producto.marcas_nombres.map((marca, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0 bg-teal-50 text-teal-700 border-teal-200">
                            {marca}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={producto.activo ? 'default' : 'secondary'} className={producto.activo ? 'bg-green-100 text-green-800' : ''}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Precio</p>
                      <p className="font-semibold text-teal-600">{producto.precio.toFixed(2)}€</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Stock</p>
                      <p className={`font-semibold ${producto.necesita_reposicion ? 'text-red-600' : 'text-gray-900'}`}>
                        {producto.stock}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Margen</p>
                      <p className="font-semibold text-green-600">{producto.margen.toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    {/* ⭐ Botón recalcular (solo si desactualizado) */}
                    {verificarCostosDesactualizados(producto) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => recalcularCostosDesdeEscandallo(producto.id)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Package className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirModalEditar(producto)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicarProducto(producto)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleEstado(producto)}
                      className={producto.activo ? '' : 'text-green-600'}
                    >
                      {producto.activo ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Vista Desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-600">Producto</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600">SKU</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600">Tipo</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600">Marca</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-600">Categoría</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Costo</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Precio</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Stock</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Margen</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {productosFiltrados.map(producto => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {producto.destacado && <span className="text-yellow-500">⭐</span>}
                        <div>
                          <p className="font-medium">{producto.nombre}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {producto.descripcion}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{producto.sku}</td>
                    <td className="p-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          producto.tipo_producto === 'simple' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          producto.tipo_producto === 'manufacturado' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {producto.tipo_producto === 'simple' ? '🥤 Simple' : 
                         producto.tipo_producto === 'manufacturado' ? '👨‍🍳 Manufacturado' : 
                         '📦 Combo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {producto.marcas_nombres.map((marca, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                            {marca}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">
                        {producto.categoria}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      {producto.tipo_producto === 'manufacturado' && producto.costo_total ? (
                        <>
                          <div className="flex items-center justify-end gap-2">
                            <p className="font-medium text-gray-700">{producto.costo_total.toFixed(2)}€</p>
                            {verificarCostosDesactualizados(producto) && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                Desact.
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {producto.escandallo_id ? '📊 Escandallo' : 'Manual'}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400">-</p>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-medium text-teal-600">{producto.precio.toFixed(2)}€</p>
                      <p className="text-xs text-gray-500">{producto.precio_con_iva.toFixed(2)}€ (IVA)</p>
                    </td>
                    <td className="p-3 text-right">
                      <p className={`font-medium ${producto.necesita_reposicion ? 'text-red-600' : ''}`}>
                        {producto.stock}
                      </p>
                      {producto.necesita_reposicion && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          Bajo
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <p className={`font-medium ${
                        producto.tipo_producto === 'manufacturado' && producto.margen_bruto_pct !== undefined
                          ? producto.margen_bruto_pct >= 60 ? 'text-green-600' :
                            producto.margen_bruto_pct >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          : producto.margen >= 60 ? 'text-green-600' :
                            producto.margen >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                      }`}>
                        {producto.tipo_producto === 'manufacturado' && producto.margen_bruto_pct !== undefined
                          ? producto.margen_bruto_pct.toFixed(1)
                          : producto.margen.toFixed(1)
                        }%
                      </p>
                      <p className="text-xs text-gray-500">+{producto.margen_unitario.toFixed(2)}€</p>
                    </td>
                    <td className="p-3 text-center">
                      <Badge 
                        variant={producto.activo ? 'default' : 'secondary'}
                        className={producto.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* ⭐ Botón recalcular (solo si está desactualizado) */}
                        {verificarCostosDesactualizados(producto) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => recalcularCostosDesdeEscandallo(producto.id)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Recalcular costos desde escandallo"
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => abrirModalEditar(producto)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicarProducto(producto)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleEstado(producto)}
                        >
                          {producto.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setProductoEliminar(producto);
                            setModalEliminar(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear/Editar Producto */}
      <Dialog open={modalProducto} onOpenChange={setModalProducto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {productoEditando 
                ? 'Modifica los datos del producto'
                : 'Completa los datos para crear un nuevo producto'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* ⭐ NUEVA SECCIÓN: Tipo y Configuración */}
            <div className="border-b pb-4">
              <h3 className="font-medium mb-3">Tipo de Producto y Configuración</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tipo_producto">Tipo de Producto *</Label>
                  <Select 
                    value={formData.tipo_producto} 
                    onValueChange={(v: any) => setFormData({ ...formData, tipo_producto: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">
                        <div className="flex flex-col">
                          <span>Simple (sin manufacturar)</span>
                          <span className="text-xs text-gray-500">Bebidas, snacks - venta directa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="manufacturado">
                        <div className="flex flex-col">
                          <span>Manufacturado (con receta)</span>
                          <span className="text-xs text-gray-500">Pan, pizzas - tiene escandallo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="combo">
                        <div className="flex flex-col">
                          <span>Combo/Pack</span>
                          <span className="text-xs text-gray-500">Incluye varios productos</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="empresa_id">Empresa *</Label>
                  <Select 
                    value={formData.empresa_id} 
                    onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPRESAS_ARRAY.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {getNombreEmpresa(emp.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Marcas * (puede seleccionar varias)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {formData.marcas_ids && formData.marcas_ids.length > 0
                            ? `${formData.marcas_ids.length} marca(s) seleccionada(s)`
                            : 'Selecciona marcas'}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-3">
                      <div className="space-y-2">
                        {MARCAS_ARRAY.map(marca => (
                          <label key={marca.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <Checkbox
                              checked={formData.marcas_ids?.includes(marca.id) || false}
                              onCheckedChange={(checked) => {
                                const currentMarcas = formData.marcas_ids || [];
                                if (checked) {
                                  setFormData({ 
                                    ...formData, 
                                    marcas_ids: [...currentMarcas, marca.id]
                                  });
                                } else {
                                  setFormData({ 
                                    ...formData, 
                                    marcas_ids: currentMarcas.filter(id => id !== marca.id)
                                  });
                                }
                              }}
                            />
                            <span className="text-sm">{getNombreMarca(marca.id)}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500 mt-1">
                    El producto estará disponible en todas las marcas seleccionadas
                  </p>
                </div>
              </div>

              {/* ⭐ RELACIÓN CON STOCK (solo si tipo = 'simple') */}
              {formData.tipo_producto === 'simple' && (
                <div className="mt-4">
                  <Label htmlFor="articulo_stock_id">Artículo del Stock Vinculado *</Label>
                  <Select 
                    value={formData.articulo_stock_id} 
                    onValueChange={(v) => setFormData({ ...formData, articulo_stock_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona artículo del stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockArticulos
                        .filter(art => art.empresa === formData.empresa_nombre)
                        .map(art => (
                          <SelectItem key={art.id} value={art.id}>
                            {art.codigo} - {art.nombre} (Stock: {art.disponible} {art.unidad})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Este producto restará automáticamente del stock al venderse
                  </p>
                </div>
              )}

              {/* ⭐ RELACIÓN CON ESCANDALLO (solo si tipo = 'manufacturado') */}
              {formData.tipo_producto === 'manufacturado' && (
                <div className="mt-4 bg-amber-50 p-4 rounded-md border border-amber-200">
                  <Label htmlFor="escandallo_id">Escandallo (Receta) *</Label>
                  <Select 
                    value={formData.escandallo_id || 'sin-escandallo'} 
                    onValueChange={(value) => {
                      if (value === 'sin-escandallo') {
                        setFormData({ ...formData, escandallo_id: undefined });
                      } else {
                        setFormData({ ...formData, escandallo_id: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un escandallo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin-escandallo">
                        Sin escandallo (crear después)
                      </SelectItem>
                      {escandallosFiltrados.length === 0 ? (
                        <SelectItem value="no-disponibles" disabled>
                          No hay escandallos disponibles para esta empresa/marca
                        </SelectItem>
                      ) : (
                        escandallosFiltrados.map(esc => (
                          <SelectItem key={esc.id} value={esc.id}>
                            {esc.nombre_producto} - €{esc.costo_total.toFixed(2)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  {/* ⭐ MOSTRAR COSTOS DEL ESCANDALLO SELECCIONADO */}
                  {formData.escandallo_id && (
                    <div className="mt-3 space-y-2 bg-white p-3 rounded border border-amber-300">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Costo ingredientes:</span>
                        <span className="font-medium text-gray-900">€{costosCalculados.costo_ingredientes.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Costo envases:</span>
                        <span className="font-medium text-gray-900">€{costosCalculados.costo_envases.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-medium text-gray-700">Costo total:</span>
                        <span className="font-bold text-teal-600">€{costosCalculados.costo_total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-amber-700 mt-2">
                    {escandallosFiltrados.length === 0 
                      ? '⚠️ Primero crea la receta en el módulo "Escandallo" y asegúrate de asignar la misma empresa/marca'
                      : '💡 Los costos se calculan automáticamente desde el escandallo'
                    }
                  </p>
                </div>
              )}

              {/* ⭐ PRODUCTOS INCLUIDOS (solo si tipo = 'combo') */}
              {formData.tipo_producto === 'combo' && (
                <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                  <Label>Productos Incluidos en el Combo</Label>
                  <p className="text-xs text-blue-700 mt-1">
                    ℹ️ Funcionalidad de combos disponible próximamente
                  </p>
                </div>
              )}
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="SKU-001"
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción detallada del producto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoría *</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasContext.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unidad">Unidad de medida</Label>
                <Select 
                  value={formData.unidad} 
                  onValueChange={(v: any) => setFormData({ ...formData, unidad: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                    <SelectItem value="litro">Litro (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="precio_compra">Precio Compra (€)</Label>
                <Input
                  id="precio_compra"
                  type="number"
                  step="0.01"
                  value={formData.precio_compra}
                  onChange={(e) => setFormData({ ...formData, precio_compra: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio Venta (€) *</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                />
                
                {/* ⭐ MARGEN CALCULADO EN TIEMPO REAL */}
                {formData.tipo_producto === 'manufacturado' && formData.escandallo_id && formData.precio > 0 && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-md border border-teal-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Margen bruto:</span>
                      <span className={`text-sm font-bold ${
                        costosCalculados.margen_bruto_pct >= 60 ? 'text-green-600' :
                        costosCalculados.margen_bruto_pct >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {costosCalculados.margen_bruto_pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-600">Beneficio unitario:</span>
                      <span className="text-xs font-medium text-gray-900">
                        €{(formData.precio - costosCalculados.costo_total).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs">
                      {costosCalculados.margen_bruto_pct >= 60 && (
                        <span className="text-green-700">✅ Rentable (≥60%)</span>
                      )}
                      {costosCalculados.margen_bruto_pct >= 40 && costosCalculados.margen_bruto_pct < 60 && (
                        <span className="text-yellow-700">⚠️ Margen aceptable (40-60%)</span>
                      )}
                      {costosCalculados.margen_bruto_pct < 40 && (
                        <span className="text-red-700">❌ Margen bajo (&lt;40%)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="iva">IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  value={formData.iva}
                  onChange={(e) => setFormData({ ...formData, iva: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Stock Actual</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-sm">Producto activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.destacado}
                  onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-sm">Producto destacado</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible_app}
                  onChange={(e) => setFormData({ ...formData, visible_app: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-sm">Visible en App</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible_tpv}
                  onChange={(e) => setFormData({ ...formData, visible_tpv: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-sm">Visible en TPV</span>
              </label>
            </div>

            {/* Notas */}
            <div>
              <Label htmlFor="notas">Notas internas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas o comentarios internos"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setModalProducto(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={guardarProducto}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {productoEditando ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <AlertDialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar "{productoEliminar?.nombre}". 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminar}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default GestionProductos;
