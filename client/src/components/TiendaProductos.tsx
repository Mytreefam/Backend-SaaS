import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, ShoppingCart, Heart, Star, Gift, Tag, Store as StoreIcon, Coffee, Sandwich, Croissant, Droplets, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { productosPanaderia } from '../data/productos-panaderia';
import { toast } from 'sonner@2.0.3';
import { useHaptics } from '../hooks/useHaptics';
import { useShare } from '../hooks/useShare';
import { useAnalytics } from '../services/analytics.service';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  rating?: number;
  imagen?: string;
  disponible?: boolean;
  stock?: number;
  destacado?: boolean;
  promocion?: {
    descuento: number;
    precioOriginal: number;
  };
}

export function TiendaProductos() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [vistaActiva, setVistaActiva] = useState<'productos' | 'promociones'>('productos');
  
  // ✅ Hooks nativos
  const haptics = useHaptics();
  const { shareProducto } = useShare();
  const analyticsHooks = useAnalytics();

  // Convertir productos de panadería al formato esperado
  const productos: Producto[] = productosPanaderia.map(p => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: p.precio,
    categoria: p.categoria, // Usar la categoría original sin lowercase
    rating: 4.5,
    imagen: p.imagen || '',
    disponible: p.stock > 0,
    stock: p.stock,
    destacado: p.destacado
  }));

  const categorias = [
    { id: 'todos', label: 'Todos' },
    { id: 'Pan básico', label: 'Pan Básico' },
    { id: 'Pan de masa madre', label: 'Masa Madre' },
    { id: 'Bollería simple', label: 'Bollería' },
    { id: 'Pasteles individuales', label: 'Pasteles' },
    { id: 'Bocadillos', label: 'Bocadillos' },
    { id: 'Empanadas', label: 'Empanadas' },
    { id: 'Bebidas calientes', label: 'Bebidas Calientes' },
    { id: 'Bebidas frías', label: 'Bebidas Frías' }
  ];

  const productosFiltrados = productos.filter((producto) => {
    const matchBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaActiva === 'todos' || producto.categoria === categoriaActiva;
    const matchVista = vistaActiva === 'productos' || (vistaActiva === 'promociones' && producto.promocion);
    return matchBusqueda && matchCategoria && matchVista;
  });

  const agregarAlCarrito = (producto: Producto) => {
    haptics.onButtonPress(); // ✅ Feedback táctil
    analyticsHooks.logAddToCart(producto.id, producto.nombre, producto.precio); // ✅ Analytics
    toast.success(`${producto.nombre} agregado al carrito`);
  };

  const handleCompartirProducto = (producto: Producto) => {
    haptics.light(); // ✅ Feedback táctil
    analyticsHooks.logShare('producto', producto.id); // ✅ Analytics
    shareProducto(producto.id, producto.nombre, producto.precio);
  };

  const handleVerProducto = (producto: Producto) => {
    analyticsHooks.logViewItem(producto.id, producto.nombre, producto.categoria); // ✅ Analytics
    toast.info(`Abriendo detalles de ${producto.nombre}`);
  };

  return (
    <div className="space-y-6">
      {/* Tabs para Productos y Promociones */}
      <Tabs value={vistaActiva} onValueChange={(value) => setVistaActiva(value as 'productos' | 'promociones')}>
        <TabsList>
          <TabsTrigger value="productos">
            <StoreIcon className="w-4 h-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="promociones">
            <Gift className="w-4 h-4 mr-2" />
            Promociones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-6 mt-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ver Carrito (0)
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={categoriaActiva === categoria.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoriaActiva(categoria.id)}
                className={`touch-target ${categoriaActiva === categoria.id ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
              >
                {categoria.label}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => (
              <Card key={producto.id} className="overflow-hidden">
                <div className="relative">
                  <ImageWithFallback
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover"
                  />
                  {!producto.disponible && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">No Disponible</Badge>
                    </div>
                  )}
                  {producto.promocion && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full shadow-md">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span className="text-sm">-{producto.promocion.descuento}%</span>
                      </div>
                    </div>
                  )}
                  <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-50">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{producto.nombre}</CardTitle>
                      <CardDescription>{producto.descripcion}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-700">{producto.rating}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-teal-700">{producto.precio.toFixed(2)}€</span>
                      {producto.promocion && (
                        <span className="text-gray-500 line-through text-sm">
                          {producto.promocion.precioOriginal.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="touch-target bg-teal-600 hover:bg-teal-700"
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={!producto.disponible}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No se encontraron productos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="promociones" className="space-y-6 mt-6">
          {/* Stats de Promociones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Promociones Activas</p>
                    <p className="text-gray-900 text-2xl">{productos.filter(p => p.promocion).length}</p>
                  </div>
                  <Gift className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Descuento Promedio</p>
                    <p className="text-gray-900 text-2xl">30%</p>
                  </div>
                  <Tag className="w-8 h-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ahorro Total</p>
                    <p className="text-gray-900 text-2xl">186€</p>
                  </div>
                  <StoreIcon className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar promociones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Ver Carrito (0)
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={categoriaActiva === categoria.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoriaActiva(categoria.id)}
                className={`touch-target ${categoriaActiva === categoria.id ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
              >
                {categoria.label}
              </Button>
            ))}
          </div>

          {/* Promociones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => (
              <Card key={producto.id} className="overflow-hidden border-2 border-orange-200">
                <div className="relative">
                  <ImageWithFallback
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span className="font-bold">-{producto.promocion?.descuento}% OFF</span>
                    </div>
                  </div>
                  <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-50">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{producto.nombre}</CardTitle>
                      <CardDescription>{producto.descripcion}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-700">{producto.rating}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-teal-700 text-2xl">{producto.precio.toFixed(2)}€</span>
                      <span className="text-gray-500 line-through text-lg">
                        {producto.promocion?.precioOriginal.toFixed(2)}€
                      </span>
                    </div>
                    <p className="text-green-600 text-sm">
                      ¡Ahorra {((producto.promocion?.precioOriginal || 0) - producto.precio).toFixed(2)}€!
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Aprovechar Oferta
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron promociones</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}