import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { TableFilters } from '../ui/table-filters';
import { SortableTableHead } from '../ui/sortable-table-head';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export-utils';
import { 
  Package,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
  Star,
  Clock,
  Box,
  Coffee,
  Truck
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCart } from '../../contexts/CartContext';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  imagen?: string;
  categoria: string;
  disponible: number;
  pvp: number;
  estado: 'disponible' | 'stock-bajo' | 'agotado';
  descripcion?: string;
  ultimaActualizacion: string;
  favorito?: boolean;
}

export function StockCliente() {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [ordenamiento, setOrdenamiento] = useState<{
    columna: string;
    direccion: 'asc' | 'desc';
  }>({ columna: 'nombre', direccion: 'asc' });

  // Mock data - En producción vendría del contexto de Stock
  const productos: Producto[] = [
    {
      id: '1',
      codigo: 'CAF001',
      nombre: 'Café Arábica Premium',
      imagen: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      categoria: 'Cafés',
      disponible: 45,
      pvp: 12.50,
      estado: 'disponible',
      descripcion: 'Café de origen colombiano, tueste medio',
      ultimaActualizacion: '2025-11-30',
      favorito: true
    },
    {
      id: '2',
      codigo: 'CAF002',
      nombre: 'Café Robusta',
      imagen: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
      categoria: 'Cafés',
      disponible: 8,
      pvp: 10.00,
      estado: 'stock-bajo',
      descripcion: 'Café intenso, ideal para espresso',
      ultimaActualizacion: '2025-11-30'
    },
    {
      id: '3',
      codigo: 'LEC001',
      nombre: 'Leche Entera 1L',
      imagen: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      categoria: 'Lácteos',
      disponible: 120,
      pvp: 1.50,
      estado: 'disponible',
      descripcion: 'Leche fresca pasteurizada',
      ultimaActualizacion: '2025-11-30'
    },
    {
      id: '4',
      codigo: 'REP001',
      nombre: 'Croissant de Mantequilla',
      imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
      categoria: 'Repostería',
      disponible: 0,
      pvp: 2.50,
      estado: 'agotado',
      descripcion: 'Croissant artesanal recién horneado',
      ultimaActualizacion: '2025-11-30'
    },
    {
      id: '5',
      codigo: 'REP002',
      nombre: 'Tarta de Zanahoria',
      imagen: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400',
      categoria: 'Repostería',
      disponible: 15,
      pvp: 3.80,
      estado: 'disponible',
      descripcion: 'Tarta casera con nueces',
      ultimaActualizacion: '2025-11-30',
      favorito: true
    },
    {
      id: '6',
      codigo: 'BEB001',
      nombre: 'Zumo Natural Naranja',
      imagen: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      categoria: 'Bebidas',
      disponible: 30,
      pvp: 3.50,
      estado: 'disponible',
      descripcion: 'Zumo recién exprimido',
      ultimaActualizacion: '2025-11-30'
    },
    {
      id: '7',
      codigo: 'CAF003',
      nombre: 'Café Descafeinado',
      imagen: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
      categoria: 'Cafés',
      disponible: 5,
      pvp: 11.00,
      estado: 'stock-bajo',
      descripcion: 'Café suave sin cafeína',
      ultimaActualizacion: '2025-11-30'
    },
    {
      id: '8',
      codigo: 'REP003',
      nombre: 'Brownie de Chocolate',
      imagen: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400',
      categoria: 'Repostería',
      disponible: 22,
      pvp: 2.80,
      estado: 'disponible',
      descripcion: 'Brownie con chips de chocolate',
      ultimaActualizacion: '2025-11-30'
    }
  ];

  const categorias = ['todas', ...Array.from(new Set(productos.map(p => p.categoria)))];

  // Estadísticas
  const stats = useMemo(() => {
    const total = productos.length;
    const disponibles = productos.filter(p => p.estado === 'disponible').length;
    const stockBajo = productos.filter(p => p.estado === 'stock-bajo').length;
    const agotados = productos.filter(p => p.estado === 'agotado').length;
    const favoritos = productos.filter(p => p.favorito).length;

    return { total, disponibles, stockBajo, agotados, favoritos };
  }, [productos]);

  // Filtrado y ordenamiento
  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    // Filtro por tab
    if (activeTab === 'disponibles') {
      resultado = resultado.filter(p => p.estado === 'disponible');
    } else if (activeTab === 'stock-bajo') {
      resultado = resultado.filter(p => p.estado === 'stock-bajo');
    } else if (activeTab === 'agotados') {
      resultado = resultado.filter(p => p.estado === 'agotado');
    } else if (activeTab === 'favoritos') {
      resultado = resultado.filter(p => p.favorito);
    }

    // Filtro por categoría
    if (categoriaFiltro !== 'todas') {
      resultado = resultado.filter(p => p.categoria === categoriaFiltro);
    }

    // Filtro por búsqueda
    if (busqueda) {
      const searchTerm = busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm) ||
        p.codigo.toLowerCase().includes(searchTerm) ||
        p.categoria.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      let valorA: any, valorB: any;

      switch(ordenamiento.columna) {
        case 'nombre':
          valorA = a.nombre;
          valorB = b.nombre;
          break;
        case 'codigo':
          valorA = a.codigo;
          valorB = b.codigo;
          break;
        case 'categoria':
          valorA = a.categoria;
          valorB = b.categoria;
          break;
        case 'disponible':
          valorA = a.disponible;
          valorB = b.disponible;
          break;
        case 'pvp':
          valorA = a.pvp;
          valorB = b.pvp;
          break;
        default:
          valorA = a.nombre;
          valorB = b.nombre;
      }

      if (typeof valorA === 'string') {
        return ordenamiento.direccion === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return ordenamiento.direccion === 'asc'
        ? valorA - valorB
        : valorB - valorA;
    });

    return resultado;
  }, [productos, activeTab, categoriaFiltro, busqueda, ordenamiento]);

  const handleOrdenar = (columna: string) => {
    setOrdenamiento({
      columna,
      direccion: ordenamiento.columna === columna && ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleAgregarAlCarrito = (producto: Producto) => {
    if (producto.estado === 'agotado') {
      toast.error('Producto agotado');
      return;
    }

    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.pvp,
      cantidad: 1,
      imagen: producto.imagen
    });

    toast.success(`${producto.nombre} añadido al carrito`);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const datosExportar = formatDataForExport(productosFiltrados, {
      codigo: 'Código',
      nombre: 'Producto',
      categoria: 'Categoría',
      disponible: 'Stock',
      pvp: 'Precio (€)',
      estado: 'Estado',
      descripcion: 'Descripción'
    });

    const filename = `productos_${activeTab}_${new Date().toISOString().split('T')[0]}`;

    switch(format) {
      case 'csv':
        exportToCSV(datosExportar, filename);
        toast.success('Exportado a CSV exitosamente');
        break;
      case 'excel':
        exportToExcel(datosExportar, filename);
        toast.success('Exportado a Excel exitosamente');
        break;
      case 'pdf':
        exportToPDF(datosExportar, filename, undefined, `Productos - ${activeTab}`);
        toast.success('Abriendo PDF...');
        break;
    }
  };

  const handleClearFilters = () => {
    setBusqueda('');
    setCategoriaFiltro('todas');
  };

  const getEstadoBadge = (estado: Producto['estado']) => {
    switch(estado) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Disponible</Badge>;
      case 'stock-bajo':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Stock Bajo</Badge>;
      case 'agotado':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Agotado</Badge>;
    }
  };

  const getIconoCategoria = (categoria: string) => {
    switch(categoria.toLowerCase()) {
      case 'cafés':
        return <Coffee className="w-4 h-4" />;
      case 'lácteos':
        return <Box className="w-4 h-4" />;
      case 'repostería':
        return <Package className="w-4 h-4" />;
      case 'bebidas':
        return <Truck className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Productos Disponibles</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Consulta la disponibilidad de nuestros productos en tiempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600">{stats.stockBajo}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Favoritos</p>
                <p className="text-2xl font-bold text-amber-600">{stats.favoritos}</p>
              </div>
              <Star className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="todos" className="whitespace-nowrap">
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="disponibles" className="whitespace-nowrap">
            Disponibles ({stats.disponibles})
          </TabsTrigger>
          <TabsTrigger value="stock-bajo" className="whitespace-nowrap">
            Stock Bajo ({stats.stockBajo})
          </TabsTrigger>
          <TabsTrigger value="agotados" className="whitespace-nowrap">
            Agotados ({stats.agotados})
          </TabsTrigger>
          <TabsTrigger value="favoritos" className="whitespace-nowrap">
            Favoritos ({stats.favoritos})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filtros con botón de exportar */}
          <Card>
            <CardContent className="p-4">
              <TableFilters
                searchValue={busqueda}
                onSearchChange={setBusqueda}
                searchPlaceholder="Buscar por nombre, código o categoría..."
                filters={[
                  {
                    id: 'categoria',
                    label: 'Categoría',
                    value: categoriaFiltro,
                    options: categorias.map(cat => ({
                      value: cat,
                      label: cat === 'todas' ? 'Todas las categorías' : cat
                    })),
                    onChange: setCategoriaFiltro
                  }
                ]}
                onExport={handleExport}
                showExport={true}
                resultCount={productosFiltrados.length}
                totalCount={activeTab === 'todos' ? stats.total : 
                           activeTab === 'disponibles' ? stats.disponibles :
                           activeTab === 'stock-bajo' ? stats.stockBajo :
                           activeTab === 'agotados' ? stats.agotados :
                           stats.favoritos}
                onClearFilters={handleClearFilters}
                showClearFilters={busqueda !== '' || categoriaFiltro !== 'todas'}
              />
            </CardContent>
          </Card>

          {/* Tabla de productos */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Lista de Productos</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Producto</TableHead>
                      <TableHead className="text-xs">
                        <button
                          onClick={() => handleOrdenar('codigo')}
                          className="flex items-center gap-1 hover:text-teal-600 transition-colors"
                        >
                          Código
                          {ordenamiento.columna === 'codigo' && (
                            ordenamiento.direccion === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs">
                        <button
                          onClick={() => handleOrdenar('categoria')}
                          className="flex items-center gap-1 hover:text-teal-600 transition-colors"
                        >
                          Categoría
                          {ordenamiento.columna === 'categoria' && (
                            ordenamiento.direccion === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        <button
                          onClick={() => handleOrdenar('disponible')}
                          className="flex items-center gap-1 hover:text-teal-600 transition-colors ml-auto"
                        >
                          Stock
                          {ordenamiento.columna === 'disponible' && (
                            ordenamiento.direccion === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs text-right">
                        <button
                          onClick={() => handleOrdenar('pvp')}
                          className="flex items-center gap-1 hover:text-teal-600 transition-colors ml-auto"
                        >
                          Precio
                          {ordenamiento.columna === 'pvp' && (
                            ordenamiento.direccion === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-xs">Estado</TableHead>
                      <TableHead className="text-xs text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Package className="w-12 h-12 opacity-30" />
                            <p className="text-sm">No se encontraron productos</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map(producto => (
                        <TableRow key={producto.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={producto.imagen} />
                                <AvatarFallback>
                                  {getIconoCategoria(producto.categoria)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate flex items-center gap-2">
                                  {producto.nombre}
                                  {producto.favorito && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                                </p>
                                {producto.descripcion && (
                                  <p className="text-xs text-gray-500 truncate">{producto.descripcion}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{producto.codigo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getIconoCategoria(producto.categoria)}
                              <span className="text-xs">{producto.categoria}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`text-sm font-medium ${
                              producto.estado === 'agotado' ? 'text-red-600' :
                              producto.estado === 'stock-bajo' ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {producto.disponible} uds
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-bold text-gray-900">
                              {producto.pvp.toFixed(2)}€
                            </span>
                          </TableCell>
                          <TableCell>
                            {getEstadoBadge(producto.estado)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={producto.estado === 'agotado' ? 'outline' : 'default'}
                              onClick={() => handleAgregarAlCarrito(producto)}
                              disabled={producto.estado === 'agotado'}
                              className="gap-2"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              <span className="hidden sm:inline">
                                {producto.estado === 'agotado' ? 'Agotado' : 'Añadir'}
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}