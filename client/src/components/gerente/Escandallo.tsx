import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  getNombreEmpresa,
  getNombreMarca,
  EMPRESAS,
  MARCAS
} from '../../constants/empresaConfig';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, Trash2, Package, TrendingUp, TrendingDown, MoreVertical, Eye, Power, ChevronsUpDown, AlertCircle } from 'lucide-react';

// ============================================
// MODELO DE DATOS - MOCK
// ============================================

interface MateriaPrima {
  id: string;
  nombre: string;
  unidad_base: string;
  precio_ultima_compra: number;
  cantidad_envase: number;
  proveedor_nombre: string;
  fecha_ultima_compra: string;
}

interface ProductoVenta {
  id: string;
  nombre: string;
  pvp: number;
  categoria: string;
  activo: boolean;
  
  // ⭐ NUEVOS CAMPOS: MULTI-EMPRESA Y MULTI-MARCA
  empresa_id: string;
  empresa_nombre: string;
  marcas_ids: string[];
  marcas_nombres: string[];
}

interface EscandalloIngrediente {
  id: string;
  producto_id: string;
  tipo_elemento: 'articulo' | 'producto';
  articulo_id: string | null;
  producto_hijo_id: string | null;
  cantidad: number;
  unidad: string;
  coste_unitario: number;
  coste_total_ingrediente: number;
}

interface EscandalloResumen {
  producto_id: string;
  nombre_producto: string;
  pvp: number;
  coste_total: number;
  margen_bruto_pct: number;
  estado: 'rentable' | 'guardado' | 'revisar';
  
  // ⭐ NUEVOS CAMPOS: MULTI-EMPRESA Y MULTI-MARCA
  empresa_id: string;
  empresa_nombre: string;
  marcas_ids: string[];
  marcas_nombres: string[];
}

// ============================================
// MOCK DATA
// ============================================

const MATERIAS_PRIMAS_MOCK: MateriaPrima[] = [
  { id: 'MP001', nombre: 'Harina de Trigo 25kg', unidad_base: 'kg', precio_ultima_compra: 20.00, cantidad_envase: 25, proveedor_nombre: 'Molinos del Sur', fecha_ultima_compra: '2025-11-01' },
  { id: 'MP002', nombre: 'Harina Integral 25kg', unidad_base: 'kg', precio_ultima_compra: 22.50, cantidad_envase: 25, proveedor_nombre: 'Molinos del Sur', fecha_ultima_compra: '2025-11-01' },
  { id: 'MP003', nombre: 'Azúcar 1kg', unidad_base: 'kg', precio_ultima_compra: 1.20, cantidad_envase: 1, proveedor_nombre: 'Azucarera', fecha_ultima_compra: '2025-11-05' },
  { id: 'MP004', nombre: 'Azúcar Moreno 1kg', unidad_base: 'kg', precio_ultima_compra: 1.80, cantidad_envase: 1, proveedor_nombre: 'Azucarera', fecha_ultima_compra: '2025-11-05' },
  { id: 'MP005', nombre: 'Mantequilla 500g', unidad_base: 'kg', precio_ultima_compra: 4.50, cantidad_envase: 0.5, proveedor_nombre: 'Lácteos San Pedro', fecha_ultima_compra: '2025-11-10' },
  { id: 'MP006', nombre: 'Levadura Seca 500g', unidad_base: 'g', precio_ultima_compra: 8.50, cantidad_envase: 500, proveedor_nombre: 'Levaduras Pro', fecha_ultima_compra: '2025-11-08' },
  { id: 'MP007', nombre: 'Sal Marina 1kg', unidad_base: 'kg', precio_ultima_compra: 0.80, cantidad_envase: 1, proveedor_nombre: 'Salinas del Mar', fecha_ultima_compra: '2025-11-01' },
  { id: 'MP008', nombre: 'Huevos Docena', unidad_base: 'ud', precio_ultima_compra: 3.60, cantidad_envase: 12, proveedor_nombre: 'Granja Feliz', fecha_ultima_compra: '2025-11-15' },
  { id: 'MP009', nombre: 'Leche Entera 1L', unidad_base: 'l', precio_ultima_compra: 0.95, cantidad_envase: 1, proveedor_nombre: 'Lácteos San Pedro', fecha_ultima_compra: '2025-11-12' },
  { id: 'MP010', nombre: 'Chocolate Negro 1kg', unidad_base: 'kg', precio_ultima_compra: 12.00, cantidad_envase: 1, proveedor_nombre: 'Chocolates Premium', fecha_ultima_compra: '2025-11-07' },
  { id: 'MP011', nombre: 'Cacao en Polvo 1kg', unidad_base: 'kg', precio_ultima_compra: 8.50, cantidad_envase: 1, proveedor_nombre: 'Chocolates Premium', fecha_ultima_compra: '2025-11-07' },
  { id: 'MP012', nombre: 'Vainilla Extracto 100ml', unidad_base: 'ml', precio_ultima_compra: 15.00, cantidad_envase: 100, proveedor_nombre: 'Esencias Naturales', fecha_ultima_compra: '2025-11-03' },
  { id: 'MP013', nombre: 'Canela Molida 500g', unidad_base: 'g', precio_ultima_compra: 12.00, cantidad_envase: 500, proveedor_nombre: 'Especias del Mundo', fecha_ultima_compra: '2025-11-05' },
  { id: 'MP014', nombre: 'Aceite de Oliva 5L', unidad_base: 'l', precio_ultima_compra: 28.00, cantidad_envase: 5, proveedor_nombre: 'Oleícola Española', fecha_ultima_compra: '2025-11-01' },
  { id: 'MP015', nombre: 'Nueces 1kg', unidad_base: 'kg', precio_ultima_compra: 14.50, cantidad_envase: 1, proveedor_nombre: 'Frutos Secos Sol', fecha_ultima_compra: '2025-11-10' },
  { id: 'MP016', nombre: 'Almendras 1kg', unidad_base: 'kg', precio_ultima_compra: 11.00, cantidad_envase: 1, proveedor_nombre: 'Frutos Secos Sol', fecha_ultima_compra: '2025-11-10' },
  { id: 'MP017', nombre: 'Pasas 500g', unidad_base: 'g', precio_ultima_compra: 4.50, cantidad_envase: 500, proveedor_nombre: 'Frutos Secos Sol', fecha_ultima_compra: '2025-11-10' },
  { id: 'MP018', nombre: 'Crema de Leche 1L', unidad_base: 'l', precio_ultima_compra: 3.80, cantidad_envase: 1, proveedor_nombre: 'Lácteos San Pedro', fecha_ultima_compra: '2025-11-12' },
  { id: 'MP019', nombre: 'Queso Crema 1kg', unidad_base: 'kg', precio_ultima_compra: 8.50, cantidad_envase: 1, proveedor_nombre: 'Lácteos San Pedro', fecha_ultima_compra: '2025-11-12' },
  { id: 'MP020', nombre: 'Mozzarella 1kg', unidad_base: 'kg', precio_ultima_compra: 7.50, cantidad_envase: 1, proveedor_nombre: 'Lácteos San Pedro', fecha_ultima_compra: '2025-11-12' },
];

const PRODUCTOS_VENTA_MOCK: ProductoVenta[] = [
  { 
    id: 'PV001', 
    nombre: 'Croissant de Mantequilla', 
    pvp: 2.50, 
    categoria: 'Bollería', 
    activo: true,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.MODOMIO],
    marcas_nombres: ['Modomio']
  },
  { 
    id: 'PV002', 
    nombre: 'Pan Integral 500g', 
    pvp: 3.20, 
    categoria: 'Pan', 
    activo: true,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.MODOMIO],
    marcas_nombres: ['Modomio']
  },
  { 
    id: 'PV003', 
    nombre: 'Tarta de Zanahoria', 
    pvp: 18.50, 
    categoria: 'Tartas', 
    activo: true,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.MODOMIO],
    marcas_nombres: ['Modomio']
  },
  { 
    id: 'PV004', 
    nombre: 'Bocadillo Vegetal', 
    pvp: 5.50, 
    categoria: 'Bocadillos', 
    activo: false,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.BLACKBURGUER],
    marcas_nombres: ['Blackburguer']
  },
  { 
    id: 'PV005', 
    nombre: 'Café con Leche', 
    pvp: 1.80, 
    categoria: 'Bebidas', 
    activo: true,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.MODOMIO, MARCAS.BLACKBURGUER], // ⭐ En ambas marcas
    marcas_nombres: ['Modomio', 'Blackburguer']
  },
  { 
    id: 'PV006', 
    nombre: 'Empanada de Atún', 
    pvp: 3.80, 
    categoria: 'Empanadas', 
    activo: false,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.BLACKBURGUER],
    marcas_nombres: ['Blackburguer']
  },
  { 
    id: 'PV007', 
    nombre: 'Panecillo de Chocolate', 
    pvp: 2.80, 
    categoria: 'Bollería', 
    activo: false,
    empresa_id: EMPRESAS.DISARMINK,
    empresa_nombre: 'Disarmink SL - Hoy Pecamos',
    marcas_ids: [MARCAS.MODOMIO],
    marcas_nombres: ['Modomio']
  },
];

export function Escandallo() {
  const [modalEscandalloAbierto, setModalEscandalloAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [pvpProducto, setPvpProducto] = useState('');
  const [productosDesactivados, setProductosDesactivados] = useState<string[]>([]);
  const [openCombobox, setOpenCombobox] = useState<{ [key: string]: boolean }>({});
  
  // ⭐ NUEVOS FILTROS: Empresa y Marca
  const [empresaFiltro, setEmpresaFiltro] = useState<string>('todos');
  const [marcaFiltro, setMarcaFiltro] = useState<string>('todos');
  
  // Estado para ingredientes del modal
  const [ingredientes, setIngredientes] = useState<Array<{
    id: string;
    tipo_elemento: 'articulo' | 'producto' | null;
    articulo_id: string;
    producto_hijo_id: string;
    cantidad: string;
    unidad: string;
    coste_unitario: number;
    coste_total_ingrediente: number;
  }>>([]);

  // Estado para escandallos guardados (simulación base de datos)
  const [escandallosDB, setEscandallosDB] = useState<EscandalloIngrediente[]>([
    // Croissant de Mantequilla
    { id: 'E001', producto_id: 'PV001', tipo_elemento: 'articulo', articulo_id: 'MP001', producto_hijo_id: null, cantidad: 50, unidad: 'g', coste_unitario: 0.0008, coste_total_ingrediente: 0.04 },
    { id: 'E002', producto_id: 'PV001', tipo_elemento: 'articulo', articulo_id: 'MP005', producto_hijo_id: null, cantidad: 30, unidad: 'g', coste_unitario: 0.009, coste_total_ingrediente: 0.27 },
    { id: 'E003', producto_id: 'PV001', tipo_elemento: 'articulo', articulo_id: 'MP006', producto_hijo_id: null, cantidad: 5, unidad: 'g', coste_unitario: 0.017, coste_total_ingrediente: 0.085 },
    { id: 'E004', producto_id: 'PV001', tipo_elemento: 'articulo', articulo_id: 'MP007', producto_hijo_id: null, cantidad: 2, unidad: 'g', coste_unitario: 0.0008, coste_total_ingrediente: 0.0016 },
    // Pan Integral
    { id: 'E005', producto_id: 'PV002', tipo_elemento: 'articulo', articulo_id: 'MP002', producto_hijo_id: null, cantidad: 400, unidad: 'g', coste_unitario: 0.0009, coste_total_ingrediente: 0.36 },
    { id: 'E006', producto_id: 'PV002', tipo_elemento: 'articulo', articulo_id: 'MP006', producto_hijo_id: null, cantidad: 10, unidad: 'g', coste_unitario: 0.017, coste_total_ingrediente: 0.17 },
    { id: 'E007', producto_id: 'PV002', tipo_elemento: 'articulo', articulo_id: 'MP007', producto_hijo_id: null, cantidad: 8, unidad: 'g', coste_unitario: 0.0008, coste_total_ingrediente: 0.0064 },
    // Tarta de Zanahoria
    { id: 'E008', producto_id: 'PV003', tipo_elemento: 'articulo', articulo_id: 'MP001', producto_hijo_id: null, cantidad: 300, unidad: 'g', coste_unitario: 0.0008, coste_total_ingrediente: 0.24 },
    { id: 'E009', producto_id: 'PV003', tipo_elemento: 'articulo', articulo_id: 'MP003', producto_hijo_id: null, cantidad: 250, unidad: 'g', coste_unitario: 0.0012, coste_total_ingrediente: 0.30 },
    { id: 'E010', producto_id: 'PV003', tipo_elemento: 'articulo', articulo_id: 'MP008', producto_hijo_id: null, cantidad: 4, unidad: 'ud', coste_unitario: 0.30, coste_total_ingrediente: 1.20 },
    { id: 'E011', producto_id: 'PV003', tipo_elemento: 'articulo', articulo_id: 'MP019', producto_hijo_id: null, cantidad: 200, unidad: 'g', coste_unitario: 0.0085, coste_total_ingrediente: 1.70 },
    { id: 'E012', producto_id: 'PV003', tipo_elemento: 'articulo', articulo_id: 'MP015', producto_hijo_id: null, cantidad: 100, unidad: 'g', coste_unitario: 0.0145, coste_total_ingrediente: 1.45 },
    // Café con Leche
    { id: 'E013', producto_id: 'PV005', tipo_elemento: 'articulo', articulo_id: 'MP009', producto_hijo_id: null, cantidad: 150, unidad: 'ml', coste_unitario: 0.00095, coste_total_ingrediente: 0.14 },
    // Panecillo de Chocolate (incluye Croissant como base)
    { id: 'E014', producto_id: 'PV007', tipo_elemento: 'producto', articulo_id: null, producto_hijo_id: 'PV001', cantidad: 1, unidad: 'ud', coste_unitario: 0.40, coste_total_ingrediente: 0.40 },
    { id: 'E015', producto_id: 'PV007', tipo_elemento: 'articulo', articulo_id: 'MP010', producto_hijo_id: null, cantidad: 50, unidad: 'g', coste_unitario: 0.012, coste_total_ingrediente: 0.60 },
  ]);

  // ============================================
  // FUNCIONES DE CÁLCULO
  // ============================================

  const calcularCosteUnitario = (materiaPrima: MateriaPrima, unidadDestino: string): number => {
    // Coste por unidad base
    const costePorUnidadBase = materiaPrima.precio_ultima_compra / materiaPrima.cantidad_envase;

    // Conversiones de unidades
    const unidadBase = materiaPrima.unidad_base;

    // kg -> g
    if (unidadBase === 'kg' && unidadDestino === 'g') {
      return costePorUnidadBase / 1000;
    }
    // kg -> kg
    if (unidadBase === 'kg' && unidadDestino === 'kg') {
      return costePorUnidadBase;
    }
    // l -> ml
    if (unidadBase === 'l' && unidadDestino === 'ml') {
      return costePorUnidadBase / 1000;
    }
    // l -> l
    if (unidadBase === 'l' && unidadDestino === 'l') {
      return costePorUnidadBase;
    }
    // g -> g
    if (unidadBase === 'g' && unidadDestino === 'g') {
      return costePorUnidadBase;
    }
    // ml -> ml
    if (unidadBase === 'ml' && unidadDestino === 'ml') {
      return costePorUnidadBase;
    }
    // ud -> ud
    if (unidadBase === 'ud' && unidadDestino === 'ud') {
      return costePorUnidadBase;
    }

    // Conversiones especiales (simuladas)
    if (unidadDestino === 'cucharada') {
      // 1 cucharada ≈ 15g o 15ml
      if (unidadBase === 'kg') return (costePorUnidadBase / 1000) * 15;
      if (unidadBase === 'l') return (costePorUnidadBase / 1000) * 15;
      if (unidadBase === 'g') return costePorUnidadBase * 15;
      if (unidadBase === 'ml') return costePorUnidadBase * 15;
    }
    if (unidadDestino === 'cucharadita') {
      // 1 cucharadita ≈ 5g o 5ml
      if (unidadBase === 'kg') return (costePorUnidadBase / 1000) * 5;
      if (unidadBase === 'l') return (costePorUnidadBase / 1000) * 5;
      if (unidadBase === 'g') return costePorUnidadBase * 5;
      if (unidadBase === 'ml') return costePorUnidadBase * 5;
    }
    if (unidadDestino === 'taza') {
      // 1 taza ≈ 240ml o 240g
      if (unidadBase === 'kg') return (costePorUnidadBase / 1000) * 240;
      if (unidadBase === 'l') return (costePorUnidadBase / 1000) * 240;
      if (unidadBase === 'g') return costePorUnidadBase * 240;
      if (unidadBase === 'ml') return costePorUnidadBase * 240;
    }
    if (unidadDestino === 'pizca') {
      // 1 pizca ≈ 0.5g
      if (unidadBase === 'kg') return (costePorUnidadBase / 1000) * 0.5;
      if (unidadBase === 'g') return costePorUnidadBase * 0.5;
    }

    return costePorUnidadBase;
  };

  const calcularCosteProductoHijo = (productoId: string): number => {
    const ingredientesProducto = escandallosDB.filter(e => e.producto_id === productoId);
    return ingredientesProducto.reduce((sum, ing) => sum + ing.coste_total_ingrediente, 0);
  };

  const calcularResumen = (): EscandalloResumen[] => {
    const resumenes: EscandalloResumen[] = [];

    PRODUCTOS_VENTA_MOCK.forEach(producto => {
      const ingredientesProducto = escandallosDB.filter(e => e.producto_id === producto.id);
      const coste_total = ingredientesProducto.reduce((sum, ing) => sum + ing.coste_total_ingrediente, 0);
      const margen_bruto_pct = producto.pvp > 0 ? ((producto.pvp - coste_total) / producto.pvp) * 100 : 0;

      let estado: 'rentable' | 'guardado' | 'revisar' = 'revisar';
      if (margen_bruto_pct >= 60) estado = 'rentable';
      else if (margen_bruto_pct >= 40) estado = 'guardado';

      resumenes.push({
        producto_id: producto.id,
        nombre_producto: producto.nombre,
        pvp: producto.pvp,
        coste_total,
        margen_bruto_pct,
        estado,
        // ⭐ NUEVOS CAMPOS
        empresa_id: producto.empresa_id,
        empresa_nombre: producto.empresa_nombre,
        marcas_ids: producto.marcas_ids,
        marcas_nombres: producto.marcas_nombres
      });
    });

    return resumenes;
  };

  const [resumenProductos, setResumenProductos] = useState<EscandalloResumen[]>([]);

  useEffect(() => {
    setResumenProductos(calcularResumen());
  }, [escandallosDB]);

  // ⭐ FILTRADO DE RESÚMENES POR EMPRESA Y MARCA
  const resumenFiltrado = useMemo(() => {
    return resumenProductos.filter(resumen => {
      const matchEmpresa = empresaFiltro === 'todos' || resumen.empresa_id === empresaFiltro;
      const matchMarca = marcaFiltro === 'todos' || resumen.marcas_ids.includes(marcaFiltro);
      return matchEmpresa && matchMarca;
    });
  }, [resumenProductos, empresaFiltro, marcaFiltro]);

  // ============================================
  // ESTADÍSTICAS CALCULADAS DINÁMICAMENTE
  // ============================================

  const estadisticas = useMemo(() => {
    // GRUPO 1: Totales básicos
    const totalProductos = PRODUCTOS_VENTA_MOCK.length;
    const productosActivos = PRODUCTOS_VENTA_MOCK.filter(p => p.activo).length;
    const productosInactivos = totalProductos - productosActivos;
    const productosConEscandallo = resumenProductos.length;
    const productosSinEscandallo = totalProductos - productosConEscandallo;

    // GRUPO 2: Totales de materias primas
    const totalMateriasPrimas = MATERIAS_PRIMAS_MOCK.length;
    const proveedoresUnicos = [...new Set(MATERIAS_PRIMAS_MOCK.map(mp => mp.proveedor_nombre))].length;

    // GRUPO 3: Análisis de rentabilidad
    const productosRentables = resumenProductos.filter(r => r.estado === 'rentable').length;
    const productosGuardados = resumenProductos.filter(r => r.estado === 'guardado').length;
    const productosRevisar = resumenProductos.filter(r => r.estado === 'revisar').length;

    // GRUPO 4: Costes y márgenes
    const costeTotal = resumenProductos.reduce((sum, r) => sum + r.coste_total, 0);
    const pvpTotal = resumenProductos.reduce((sum, r) => sum + r.pvp, 0);
    const margenBrutoPromedio = resumenProductos.length > 0 
      ? resumenProductos.reduce((sum, r) => sum + r.margen_bruto_pct, 0) / resumenProductos.length 
      : 0;

    // GRUPO 5: Top productos
    const productoMayorMargen = resumenProductos.length > 0
      ? resumenProductos.reduce((max, r) => r.margen_bruto_pct > max.margen_bruto_pct ? r : max, resumenProductos[0])
      : null;
    const productoMenorMargen = resumenProductos.length > 0
      ? resumenProductos.reduce((min, r) => r.margen_bruto_pct < min.margen_bruto_pct ? r : min, resumenProductos[0])
      : null;
    const productoMayorCoste = resumenProductos.length > 0
      ? resumenProductos.reduce((max, r) => r.coste_total > max.coste_total ? r : max, resumenProductos[0])
      : null;

    // GRUPO 6: Análisis por categoría
    const categorias = [...new Set(PRODUCTOS_VENTA_MOCK.map(p => p.categoria))];
    const totalCategorias = categorias.length;

    // GRUPO 7: Eficiencia de producción
    const costePromedioPorProducto = resumenProductos.length > 0 ? costeTotal / resumenProductos.length : 0;
    const pvpPromedioPorProducto = resumenProductos.length > 0 ? pvpTotal / resumenProductos.length : 0;
    const beneficioTotal = pvpTotal - costeTotal;
    const beneficioPromedioPorProducto = resumenProductos.length > 0 ? beneficioTotal / resumenProductos.length : 0;

    // GRUPO 8: Alertas
    const productosMargenBajo = resumenProductos.filter(r => r.margen_bruto_pct < 40).length;
    const productosMargenCritico = resumenProductos.filter(r => r.margen_bruto_pct < 20).length;

    return {
      totalProductos,
      productosActivos,
      productosInactivos,
      productosConEscandallo,
      productosSinEscandallo,
      totalMateriasPrimas,
      proveedoresUnicos,
      productosRentables,
      productosGuardados,
      productosRevisar,
      costeTotal,
      pvpTotal,
      margenBrutoPromedio,
      productoMayorMargen,
      productoMenorMargen,
      productoMayorCoste,
      totalCategorias,
      costePromedioPorProducto,
      pvpPromedioPorProducto,
      beneficioTotal,
      beneficioPromedioPorProducto,
      productosMargenBajo,
      productosMargenCritico,
    };
  }, [resumenProductos]);

  // ============================================
  // FUNCIONES DE MODAL
  // ============================================

  const agregarIngrediente = () => {
    const nuevoIngrediente = {
      id: Date.now().toString(),
      tipo_elemento: null as any,
      articulo_id: '',
      producto_hijo_id: '',
      cantidad: '',
      unidad: 'g',
      coste_unitario: 0,
      coste_total_ingrediente: 0
    };
    setIngredientes([...ingredientes, nuevoIngrediente]);
  };

  const eliminarIngrediente = (id: string) => {
    setIngredientes(ingredientes.filter(ing => ing.id !== id));
  };

  const actualizarIngrediente = (id: string, campo: string, valor: any) => {
    setIngredientes(ingredientes.map(ing => {
      if (ing.id !== id) return ing;

      const actualizado = { ...ing, [campo]: valor };

      // Si se selecciona un artículo
      if (campo === 'articulo_id' && valor) {
        actualizado.tipo_elemento = 'articulo';
        actualizado.producto_hijo_id = '';
      }

      // Si se selecciona un producto
      if (campo === 'producto_hijo_id' && valor) {
        actualizado.tipo_elemento = 'producto';
        actualizado.articulo_id = '';
      }

      // Recalcular costes
      return recalcularCostesIngrediente(actualizado);
    }));
  };

  const recalcularCostesIngrediente = (ingrediente: any) => {
    let coste_unitario = 0;

    if (ingrediente.tipo_elemento === 'articulo' && ingrediente.articulo_id) {
      const materiaPrima = MATERIAS_PRIMAS_MOCK.find(mp => mp.id === ingrediente.articulo_id);
      if (materiaPrima) {
        coste_unitario = calcularCosteUnitario(materiaPrima, ingrediente.unidad);
      }
    } else if (ingrediente.tipo_elemento === 'producto' && ingrediente.producto_hijo_id) {
      coste_unitario = calcularCosteProductoHijo(ingrediente.producto_hijo_id);
    }

    const cantidad = parseFloat(ingrediente.cantidad) || 0;
    const coste_total_ingrediente = coste_unitario * cantidad;

    return {
      ...ingrediente,
      coste_unitario,
      coste_total_ingrediente
    };
  };

  // Cálculos en tiempo real del modal
  const costeTotal = ingredientes.reduce((sum, ing) => sum + ing.coste_total_ingrediente, 0);
  const pvp = parseFloat(pvpProducto) || 0;
  const margenBruto = pvp > 0 ? ((pvp - costeTotal) / pvp) * 100 : 0;
  
  let estadoPreview: 'rentable' | 'guardado' | 'revisar' = 'revisar';
  if (margenBruto >= 60) estadoPreview = 'rentable';
  else if (margenBruto >= 40) estadoPreview = 'guardado';

  const guardarEscandallo = () => {
    // Crear o actualizar producto
    let producto_id = productoSeleccionado;
    
    if (!producto_id && nombreProducto) {
      // Crear nuevo producto
      producto_id = `PV${Date.now()}`;
      PRODUCTOS_VENTA_MOCK.push({
        id: producto_id,
        nombre: nombreProducto,
        pvp: parseFloat(pvpProducto),
        categoria: 'General',
        activo: true
      });
    }

    if (producto_id) {
      // Eliminar ingredientes antiguos del producto
      const nuevosEscandallos = escandallosDB.filter(e => e.producto_id !== producto_id);

      // Agregar nuevos ingredientes
      ingredientes.forEach(ing => {
        if (ing.tipo_elemento && (ing.articulo_id || ing.producto_hijo_id)) {
          nuevosEscandallos.push({
            id: `E${Date.now()}_${Math.random()}`,
            producto_id,
            tipo_elemento: ing.tipo_elemento,
            articulo_id: ing.articulo_id || null,
            producto_hijo_id: ing.producto_hijo_id || null,
            cantidad: parseFloat(ing.cantidad) || 0,
            unidad: ing.unidad,
            coste_unitario: ing.coste_unitario,
            coste_total_ingrediente: ing.coste_total_ingrediente
          });
        }
      });

      setEscandallosDB(nuevosEscandallos);
    }

    // Limpiar y cerrar modal
    setNombreProducto('');
    setPvpProducto('');
    setProductoSeleccionado('');
    setIngredientes([]);
    setModalEscandalloAbierto(false);
  };

  const verDetalleEscandallo = (productoId: string) => {
    const producto = PRODUCTOS_VENTA_MOCK.find(p => p.id === productoId);
    if (!producto) return;

    const ingredientesProducto = escandallosDB.filter(e => e.producto_id === productoId);

    setProductoSeleccionado(productoId);
    setNombreProducto(producto.nombre);
    setPvpProducto(producto.pvp.toString());
    
    const ingredientesModal = ingredientesProducto.map(ing => ({
      id: Date.now().toString() + Math.random(),
      tipo_elemento: ing.tipo_elemento,
      articulo_id: ing.articulo_id || '',
      producto_hijo_id: ing.producto_hijo_id || '',
      cantidad: ing.cantidad.toString(),
      unidad: ing.unidad,
      coste_unitario: ing.coste_unitario,
      coste_total_ingrediente: ing.coste_total_ingrediente
    }));

    setIngredientes(ingredientesModal);
    setModalEscandalloAbierto(true);
  };

  const desactivarProducto = (id: string) => {
    setProductosDesactivados([...productosDesactivados, id]);
  };

  const activarProducto = (id: string) => {
    setProductosDesactivados(productosDesactivados.filter(pid => pid !== id));
  };

  // ============================================
  // UTILIDADES DE FORMATO
  // ============================================

  const formatEuro = (valor: number): string => {
    const partes = valor.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${partes[0]},${partes[1]}`;
  };

  const formatPorcentaje = (valor: number): string => {
    return valor.toFixed(2).replace('.', ',');
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'rentable':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Rentable ≥60%</Badge>;
      case 'guardado':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Guardado 40-60%</Badge>;
      case 'revisar':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Revisar {'<'}40%</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getDiferenciaBadge = (porcentaje: number) => {
    if (porcentaje >= 60) {
      return (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-green-700 font-medium">{formatPorcentaje(porcentaje)}%</span>
        </div>
      );
    } else if (porcentaje >= 40) {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-amber-700 font-medium">{formatPorcentaje(porcentaje)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <span className="text-red-700 font-medium">{formatPorcentaje(porcentaje)}%</span>
        </div>
      );
    }
  };

  const obtenerNombreMateriaPrima = (id: string): string => {
    const mp = MATERIAS_PRIMAS_MOCK.find(m => m.id === id);
    return mp ? mp.nombre : '';
  };

  const obtenerNombreProducto = (id: string): string => {
    const prod = PRODUCTOS_VENTA_MOCK.find(p => p.id === id);
    return prod ? prod.nombre : '';
  };

  return (
    <div className="space-y-6">
      {/* Header con botón */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Control de Escandallos
              </CardTitle>
              <CardDescription>Análisis de costes y márgenes por producto</CardDescription>
            </div>
            <Dialog open={modalEscandalloAbierto} onOpenChange={setModalEscandalloAbierto}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setProductoSeleccionado('');
                    setNombreProducto('');
                    setPvpProducto('');
                    setIngredientes([]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Calcular Escandallo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {productoSeleccionado ? 'Editar Escandallo' : 'Calcular Nuevo Escandallo'}
                  </DialogTitle>
                  <DialogDescription>
                    Añade los ingredientes y costes para calcular el escandallo del producto
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Información del producto */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre-producto">Nuevo Producto o Combo</Label>
                      <Input
                        id="nombre-producto"
                        placeholder="Ej: Croissant de Chocolate"
                        value={nombreProducto}
                        onChange={(e) => setNombreProducto(e.target.value)}
                        disabled={!!productoSeleccionado}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pvp-producto">PVP (€)</Label>
                      <Input
                        id="pvp-producto"
                        type="number"
                        step="0.01"
                        placeholder="Ej: 2.50"
                        value={pvpProducto}
                        onChange={(e) => setPvpProducto(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Sección de ingredientes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Ingredientes</Label>
                    </div>

                    {ingredientes.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No hay ingredientes añadidos</p>
                        <p className="text-sm">Haz clic en "Añadir Ingrediente" para empezar</p>
                      </div>
                    )}

                    {ingredientes.length > 0 && (
                      <div className="border rounded-lg overflow-hidden overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[60px]">Nº</TableHead>
                              <TableHead className="w-[220px]">Artículos</TableHead>
                              <TableHead className="w-[220px]">Productos</TableHead>
                              <TableHead className="w-[120px]">Cantidad</TableHead>
                              <TableHead className="w-[140px]">Medida</TableHead>
                              <TableHead className="w-[120px] text-right">Coste (€)</TableHead>
                              <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ingredientes.map((ingrediente, index) => (
                              <TableRow key={ingrediente.id}>
                                <TableCell className="text-center text-gray-600">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <Popover 
                                    open={openCombobox[`articulo_${ingrediente.id}`] || false} 
                                    onOpenChange={(open) => setOpenCombobox({ ...openCombobox, [`articulo_${ingrediente.id}`]: open })}
                                  >
                                    <PopoverTrigger 
                                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={!!ingrediente.producto_hijo_id}
                                    >
                                      {ingrediente.articulo_id ? obtenerNombreMateriaPrima(ingrediente.articulo_id) : 'Selecciona artículo'}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 inline float-right" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[220px] p-0 border-0 shadow-lg">
                                      <Command>
                                        <CommandInput placeholder="Buscar artículo..." />
                                        <CommandList>
                                          <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                          <CommandGroup>
                                            {MATERIAS_PRIMAS_MOCK.map((mp) => (
                                              <CommandItem 
                                                key={mp.id} 
                                                value={mp.nombre} 
                                                onSelect={() => {
                                                  actualizarIngrediente(ingrediente.id, 'articulo_id', mp.id);
                                                  setOpenCombobox({ ...openCombobox, [`articulo_${ingrediente.id}`]: false });
                                                }}
                                              >
                                                {mp.nombre}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </TableCell>
                                <TableCell>
                                  <Popover 
                                    open={openCombobox[`producto_${ingrediente.id}`] || false} 
                                    onOpenChange={(open) => setOpenCombobox({ ...openCombobox, [`producto_${ingrediente.id}`]: open })}
                                  >
                                    <PopoverTrigger 
                                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={!!ingrediente.articulo_id}
                                    >
                                      {ingrediente.producto_hijo_id ? obtenerNombreProducto(ingrediente.producto_hijo_id) : 'Selecciona producto'}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 inline float-right" />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[220px] p-0 border-0 shadow-lg">
                                      <Command>
                                        <CommandInput placeholder="Buscar producto..." />
                                        <CommandList>
                                          <CommandEmpty>No se encontraron resultados</CommandEmpty>
                                          <CommandGroup>
                                            {PRODUCTOS_VENTA_MOCK.filter(p => p.activo).map((prod) => (
                                              <CommandItem 
                                                key={prod.id} 
                                                value={prod.nombre} 
                                                onSelect={() => {
                                                  actualizarIngrediente(ingrediente.id, 'producto_hijo_id', prod.id);
                                                  setOpenCombobox({ ...openCombobox, [`producto_${ingrediente.id}`]: false });
                                                }}
                                              >
                                                {prod.nombre}
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="250"
                                    className="h-9"
                                    value={ingrediente.cantidad}
                                    onChange={(e) => actualizarIngrediente(ingrediente.id, 'cantidad', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={ingrediente.unidad}
                                    onValueChange={(value) => actualizarIngrediente(ingrediente.id, 'unidad', value)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ud">ud</SelectItem>
                                      <SelectItem value="pak">pak</SelectItem>
                                      <SelectItem value="kg">kg</SelectItem>
                                      <SelectItem value="g">g</SelectItem>
                                      <SelectItem value="mg">mg</SelectItem>
                                      <SelectItem value="l">l</SelectItem>
                                      <SelectItem value="ml">ml</SelectItem>
                                      <SelectItem value="cl">cl</SelectItem>
                                      <SelectItem value="cucharada">Cucharada</SelectItem>
                                      <SelectItem value="cucharadita">Cucharadita</SelectItem>
                                      <SelectItem value="taza">Taza</SelectItem>
                                      <SelectItem value="pizca">Pizca</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className="text-sm text-gray-600">
                                    {formatEuro(ingrediente.coste_total_ingrediente)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => eliminarIngrediente(ingrediente.id)}
                                    className="h-9 w-9 p-0"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Botón Añadir Ingrediente */}
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={agregarIngrediente}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Ingrediente
                      </Button>
                    </div>
                  </div>

                  {/* Resumen en tiempo real */}
                  {ingredientes.length > 0 && (
                    <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Coste Total Escandallo:</p>
                          <p className="text-2xl font-bold text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            €{formatEuro(costeTotal)}
                          </p>
                        </div>
                        {pvpProducto && (
                          <>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Margen Bruto:</p>
                              <p className="text-2xl font-bold text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {formatPorcentaje(margenBruto)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Estado Previsto:</p>
                              <div className="mt-1">
                                {getEstadoBadge(estadoPreview)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNombreProducto('');
                        setPvpProducto('');
                        setProductoSeleccionado('');
                        setIngredientes([]);
                        setModalEscandalloAbierto(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={guardarEscandallo}
                      disabled={(!nombreProducto && !productoSeleccionado) || !pvpProducto || ingredientes.length === 0}
                    >
                      Guardar Escandallo
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* TABLA DE ESCANDALLOS */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Escandallos</CardTitle>
          <div className="text-muted-foreground">
            {/* ⭐ FILTROS DE EMPRESA Y MARCA */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <Label className="text-xs text-gray-600">Empresa</Label>
                <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
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
              </div>

              <div className="flex-1">
                <Label className="text-xs text-gray-600">Marca</Label>
                <Select value={marcaFiltro} onValueChange={setMarcaFiltro}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
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
            
            <div className="text-xs text-gray-500 mt-2">
              Mostrando {resumenFiltrado.length} de {resumenProductos.length} recetas
            </div>
            
            {/* ⭐ Información sobre sincronización */}
            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">💡 Sincronización con Productos</p>
                  <p>Si modificas los costos de una receta, ve a <strong>Gestión de Productos</strong> para actualizar los productos vinculados con el botón "Actualizar Costos".</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-teal-600 hover:bg-teal-600">
                  <TableHead className="text-white">Producto</TableHead>
                  <TableHead className="text-white">Marcas</TableHead>
                  <TableHead className="text-white text-right">PVP</TableHead>
                  <TableHead className="text-white text-right">Escandallo</TableHead>
                  <TableHead className="text-white text-center">Diferencia %</TableHead>
                  <TableHead className="text-white text-center">Estado</TableHead>
                  <TableHead className="text-white text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumenFiltrado.map((resumen) => (
                  <TableRow key={resumen.producto_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{resumen.nombre_producto}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {resumen.marcas_nombres.map((marca, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                            {marca}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">€{formatEuro(resumen.pvp)}</TableCell>
                    <TableCell className="text-right">€{formatEuro(resumen.coste_total)}</TableCell>
                    <TableCell className="text-center">{getDiferenciaBadge(resumen.margen_bruto_pct)}</TableCell>
                    <TableCell className="text-center">
                      {productosDesactivados.includes(resumen.producto_id) ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          Desactivado
                        </Badge>
                      ) : (
                        getEstadoBadge(resumen.estado)
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => verDetalleEscandallo(resumen.producto_id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver / Editar Detalle
                          </DropdownMenuItem>
                          {productosDesactivados.includes(resumen.producto_id) ? (
                            <DropdownMenuItem onClick={() => activarProducto(resumen.producto_id)}>
                              <Power className="mr-2 h-4 w-4" />
                              Activar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => desactivarProducto(resumen.producto_id)}>
                              <Power className="mr-2 h-4 w-4" />
                              Desactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-1">Productos Rentables</p>
              <p className="text-3xl text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {resumenProductos.filter(r => r.estado === 'rentable').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">≥ 60% margen</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-1">Guardados</p>
              <p className="text-3xl text-amber-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {resumenProductos.filter(r => r.estado === 'guardado').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">40-60% margen</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-1">A Revisar</p>
              <p className="text-3xl text-red-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {resumenProductos.filter(r => r.estado === 'revisar').length}
              </p>
              <p className="text-xs text-gray-600 mt-1">{'<'} 40% margen</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-1">Margen Promedio</p>
              <p className="text-3xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {resumenProductos.length > 0 
                  ? formatPorcentaje(resumenProductos.reduce((sum, r) => sum + r.margen_bruto_pct, 0) / resumenProductos.length)
                  : '0,00'
                }%
              </p>
              <p className="text-xs text-gray-600 mt-1">Total productos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}