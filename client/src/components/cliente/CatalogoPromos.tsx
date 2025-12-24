import { useState } from 'react';
import { useProductos } from '../../contexts/ProductosContext';
import { useCart } from '../../contexts/CartContext';
import { usePromociones, type PromocionDisponible } from '../../hooks/usePromociones';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Tag, 
  Coffee, 
  Beef, 
  Pizza, 
  Wine, 
  IceCream, 
  Gift, 
  Sparkles, 
  Percent, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { EventoModal } from './EventoModal';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  precioAnterior?: number;
  stock: number;
  descripcion: string;
  marca?: string;
  destacado?: boolean;
  imagen?: string;
}

interface CatalogoPromosProps {
  onOpenCesta?: () => void;
}

export function CatalogoPromos({ onOpenCesta }: CatalogoPromosProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [eventoModalOpen, setEventoModalOpen] = useState(false);
  const [productoEventoSeleccionado, setProductoEventoSeleccionado] = useState<Producto | null>(null);
  
  // 🛒 Hook del carrito
  const { addItem, totalItems } = useCart();
  
  // 🏢 Obtener marca seleccionada del localStorage
  const marcaSeleccionada = localStorage.getItem('cliente_categoria_preferida') || 'blackburger';
  
  // Mapeo de marca a ID de marca
  const MARCA_ID_MAP: Record<string, string> = {
    'blackburger': 'MRC-002',
    'modommio': 'MRC-001',
    'eventos': 'MRC-001'
  };
  
  const marcaIdActual = MARCA_ID_MAP[marcaSeleccionada] || 'MRC-002';
  
  // 🛍️ Hook de productos centralizados - ✅ CONECTADO AL GERENTE
  const { productos: productosContext, categorias: categoriasContext } = useProductos();

  // ✅ PRODUCTOS AHORA VIENEN DEL CONTEXTO (sincronizados con el gerente)
  // ✅ FILTRADOS POR MARCA SELECCIONADA
  const productos: Producto[] = productosContext
    .filter(p => 
      p.activo !== false && 
      p.visible_tpv !== false &&
      p.marcas_ids?.includes(marcaIdActual) // 🔥 Filtro por marca
    )
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria || 'Otros',
      precio: p.precio,
      stock: p.stock,
      descripcion: p.descripcion || '',
      destacado: false,
      imagen: p.imagen || ''
    }));

  // ✅ CATEGORÍAS FILTRADAS - Solo las que tienen productos en la marca actual
  const categorias = Array.from(new Set(productos.map(p => p.categoria)));

  // 🔍 Filtrado de productos
  const productosFiltrados = productos.filter(producto => {
    // Filtro por búsqueda
    const matchBusqueda = searchQuery === '' || 
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por categoría - comparación case-insensitive
    const matchCategoria = categoriaFiltro === 'todos' || producto.categoria.toLowerCase() === categoriaFiltro.toLowerCase();
    
    return matchBusqueda && matchCategoria;
  });

  const handleAnadirCarrito = (producto: Producto) => {
    // 🎉 EVENTOS - Abrir modal especial
    if (marcaSeleccionada === 'eventos' || producto.categoria?.toLowerCase().includes('evento')) {
      setProductoEventoSeleccionado(producto);
      setEventoModalOpen(true);
      return;
    }

    // ✅ Añadir directamente al carrito (real, no mock)
    const itemId = addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.imagen,
      categoria: producto.categoria,
      stock: producto.stock,
    });
    
    // 🎯 SIEMPRE abrir el carrito (estilo Glovo)
    onOpenCesta?.();
    
    // Si es un COMBO → expandir personalización automáticamente
    if (producto.categoria === 'Combos') {
      localStorage.setItem('combo_a_personalizar', itemId || '');
    }
  };



  const getCategoriaIcon = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'combos':
        return <Package className="w-5 h-5" />;
      case 'burgers':
        return <Beef className="w-5 h-5" />;
      case 'pizzas premium':
        return <Pizza className="w-5 h-5" />;
      case 'pizzas clásicas':
        return <Pizza className="w-5 h-5" />;
      case 'entrantes':
        return <Coffee className="w-5 h-5" />;
      case 'postres':
        return <IceCream className="w-5 h-5" />;
      case 'bebidas sin alcohol':
        return <Wine className="w-5 h-5" />;
      case 'bebidas con alcohol':
        return <Wine className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // ❌ Ya no usamos ProductoDetalle - todo va directo al carrito

  return (
    <div className="space-y-3">
      {/* Barra de Búsqueda */}
      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
        />
      </div>

      {/* Filtros visuales de categorías */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categorias.map((cat) => (
          <Button
            key={cat}
            variant={categoriaFiltro === cat.toLowerCase() ? 'default' : 'outline'}
            size="sm"
            className={`flex-shrink-0 px-2.5 py-0.5 h-7 text-xs ${
              categoriaFiltro === cat.toLowerCase() 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setCategoriaFiltro(cat.toLowerCase())}
          >
            {cat}
          </Button>
        ))}

        <Button
          variant={categoriaFiltro === 'todos' ? 'default' : 'outline'}
          size="sm"
          className={`flex-shrink-0 px-2.5 py-0.5 h-7 text-xs ${
            categoriaFiltro === 'todos' 
              ? 'bg-teal-600 hover:bg-teal-700 text-white' 
              : 'hover:bg-gray-50'
          }`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todos
        </Button>
      </div>

      {/* Resultados */}
      <p className="text-xs sm:text-sm text-gray-600">
        Mostrando {productosFiltrados.length} de {productos.length} productos
      </p>

      {/* Listado de Productos - Grid optimizado para móvil */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {productosFiltrados.map((producto) => (
          <Card 
            key={producto.id} 
            className={`overflow-hidden hover:shadow-md transition-all active:scale-[0.98] flex flex-col h-full ${
              producto.destacado ? 'border-teal-200 ring-1 ring-teal-200' : ''
            }`}
          >
            <div className="aspect-square relative overflow-hidden bg-gray-100">
              {producto.imagen ? (
                <ImageWithFallback 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  {getCategoriaIcon(producto.categoria)}
                </div>
              )}
              {producto.destacado && (
                <Badge className="absolute top-1.5 right-1.5 bg-teal-600 text-white text-[9px] px-1 py-0.5">
                  Top
                </Badge>
              )}
              {producto.precioAnterior && (
                <Badge className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] px-1 py-0.5">
                  Oferta
                </Badge>
              )}
            </div>
            <CardContent className="p-2 flex flex-col flex-1 gap-0.5">
              <h3 className="text-[11px] line-clamp-2 leading-tight">{producto.nombre}</h3>
              
              <div className="flex items-center gap-1 mt-auto">
                <p className="text-sm text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{producto.precio.toFixed(2)}
                </p>
                {producto.precioAnterior && (
                  <p className="text-[9px] text-gray-400 line-through">
                    €{producto.precioAnterior.toFixed(2)}
                  </p>
                )}
              </div>
              
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 h-7 text-[10px] touch-manipulation active:scale-95"
                onClick={() => handleAnadirCarrito(producto)}
                disabled={producto.stock === 0}
              >
                <ShoppingCart className="w-3 h-3 mr-1 shrink-0" />
                <span>Añadir</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Intenta con otros términos de búsqueda o cambia los filtros
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Eventos */}
      <EventoModal
        open={eventoModalOpen}
        onOpenChange={setEventoModalOpen}
        productoNombre={productoEventoSeleccionado?.nombre}
        productoImagen={productoEventoSeleccionado?.imagen}
      />
    </div>
  );
}
