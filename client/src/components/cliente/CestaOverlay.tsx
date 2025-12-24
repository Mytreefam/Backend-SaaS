import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CheckoutModal } from './CheckoutModal';
import { 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  X,
  Wine,
  Coffee,
  Store,
  MapPin,
  Smartphone,
  Banknote,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  Home,
  Check,
  ChevronRight,
  Package
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCart } from '../../contexts/CartContext';
import { useProductos } from '../../contexts/ProductosContext';

interface CestaOverlayProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProcederPago?: () => void;
  userData?: {
    id?: string | number;
    name: string;
    email: string;
    telefono?: string;
    direccion?: string;
  };
}

export function CestaOverlay({ isOpen, onOpenChange, onProcederPago, userData }: CestaOverlayProps) {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [tipoEntrega, setTipoEntrega] = useState<'tienda' | 'domicilio'>('tienda');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('tiana');
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'efectivo' | 'bizum'>('tarjeta');
  const [cuponInput, setCuponInput] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  
  // 🛒 Usar el contexto del carrito
  const {
    items,
    totalItems,
    subtotal,
    descuentoCupon,
    iva,
    total,
    cuponAplicado,
    aplicarCupon,
    eliminarCupon,
    clearCart,
    addItem,
    removeItem,
    updateQuantity,
  } = useCart();

  // 🛍️ Hook de productos centralizados
  const { productos: productosContext } = useProductos();

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setPasoActual(1);
    }
  }, [isOpen]);

  // ============================================================================
  // DATOS
  // ============================================================================

  const tiendasDisponibles = [
    { id: 'tiana', nombre: 'Tiana', direccion: 'Passeig de la Vilesa, 6' },
    { id: 'montgat', nombre: 'Montgat', direccion: 'Carrer de la Platja, 15' },
  ];

  const metodosPago = [
    { id: 'tarjeta' as const, nombre: 'Tarjeta Bancaria', icono: CreditCard },
    { id: 'efectivo' as const, nombre: 'Efectivo', icono: Banknote },
    { id: 'bizum' as const, nombre: 'Bizum', icono: Smartphone },
  ];

  // ============================================================================
  // VENTA CRUZADA INTELIGENTE BASADA EN HISTORIAL
  // ============================================================================

  const marcaSeleccionada = localStorage.getItem('cliente_categoria_preferida') || 'blackburger';
  const MARCA_ID_MAP: Record<string, string> = {
    'blackburger': 'MRC-002',
    'modommio': 'MRC-001',
    'eventos': 'MRC-001'
  };
  const marcaIdActual = MARCA_ID_MAP[marcaSeleccionada] || 'MRC-002';

  // Obtener historial de pedidos del cliente
  const obtenerProductosFrecuentes = (): { [key: string]: number } => {
    const historialPedidos = JSON.parse(localStorage.getItem('pedidos_realizados') || '[]');
    const conteoProductos: { [key: string]: number } = {};

    // Contar cuántas veces ha pedido cada producto
    historialPedidos.forEach((pedido: any) => {
      if (pedido.items) {
        pedido.items.forEach((item: any) => {
          const productoId = item.productoId || item.id;
          conteoProductos[productoId] = (conteoProductos[productoId] || 0) + (item.cantidad || 1);
        });
      }
    });

    return conteoProductos;
  };

  const productosFrecuentes = obtenerProductosFrecuentes();
  
  // IDs de productos que ya están en el carrito
  const productosEnCarrito = items.map(item => item.productoId);

  // Encontrar productos que suele comprar pero que NO están en el carrito actual
  const productosFaltantesDelHistorial = Object.entries(productosFrecuentes)
    .filter(([productoId, cantidad]) => 
      cantidad >= 2 && // Ha pedido al menos 2 veces
      !productosEnCarrito.includes(productoId) // NO está en el carrito actual
    )
    .sort((a, b) => b[1] - a[1]) // Ordenar por frecuencia
    .slice(0, 3) // Top 3
    .map(([productoId]) => productoId);

  // Si hay productos del historial, usarlos; si no, usar sugerencias por categoría
  let textoSugerencia = '';
  let productosSugeridos: Array<{
    id: string;
    nombre: string;
    precio: number;
    imagen: string;
    categoria: string;
    stock?: number;
  }> = [];

  if (productosFaltantesDelHistorial.length > 0) {
    // SUGERENCIAS PERSONALIZADAS DEL HISTORIAL
    textoSugerencia = '¿Olvidaste algo que sueles pedir?';
    productosSugeridos = productosFaltantesDelHistorial
      .map(productoId => {
        const producto = productosContext.find(p => p.id === productoId);
        if (producto && producto.activo !== false && producto.visible_tpv !== false) {
          return {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen || '',
            categoria: producto.categoria || '',
            stock: producto.stock,
          };
        }
        return null;
      })
      .filter(p => p !== null) as typeof productosSugeridos;
  } else {
    // SUGERENCIAS POR CATEGORÍA (fallback si no hay historial)
    const tieneBebidas = items.some(item => 
      item.categoria?.toLowerCase().includes('bebida') || 
      item.categoria?.toLowerCase().includes('refresco')
    );
    const tienePostres = items.some(item => 
      item.categoria?.toLowerCase().includes('postre') || 
      item.categoria?.toLowerCase().includes('helado') ||
      item.categoria?.toLowerCase().includes('dulce')
    );
    const tieneComplementos = items.some(item => 
      item.categoria?.toLowerCase().includes('complemento') || 
      item.categoria?.toLowerCase().includes('extra') ||
      item.categoria?.toLowerCase().includes('acompañamiento')
    );

    let categoriaASugerir = '';

    if (!tieneBebidas) {
      categoriaASugerir = 'bebidas';
      textoSugerencia = '¿No te apetece una bebida?';
    } else if (!tienePostres) {
      categoriaASugerir = 'postres';
      textoSugerencia = '¿Y un postre para terminar?';
    } else if (!tieneComplementos) {
      categoriaASugerir = 'complementos';
      textoSugerencia = 'Añade un complemento';
    }

    productosSugeridos = categoriaASugerir
      ? productosContext
          .filter(p => 
            p.activo !== false && 
            p.visible_tpv !== false &&
            p.marcas_ids?.includes(marcaIdActual) &&
            p.categoria?.toLowerCase().includes(categoriaASugerir)
          )
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            nombre: p.nombre,
            precio: p.precio,
            imagen: p.imagen || '',
            categoria: p.categoria || '',
            stock: p.stock,
          }))
      : [];
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAñadirSugerido = (producto: typeof productosSugeridos[0]) => {
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.imagen,
      categoria: producto.categoria,
      stock: producto.stock,
    });
    toast.success(`${producto.nombre} añadido al carrito`);
  };

  const handleAplicarCupon = () => {
    if (cuponInput.trim()) {
      const aplicado = aplicarCupon(cuponInput.trim());
      if (aplicado) {
        setCuponInput('');
      }
    } else {
      toast.error('Por favor, introduce un código de cupón');
    }
  };

  const handleEliminarCupon = () => {
    eliminarCupon();
  };

  const handleVaciarCarrito = () => {
    if (items.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
    }
  };

  const handleVolverAlPedido = () => {
    onOpenChange(false);
  };

  const handleContinuarPaso2 = () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    setPasoActual(2);
  };

  const handleContinuarPaso3 = () => {
    if (tipoEntrega === 'tienda' && !tiendaSeleccionada) {
      toast.error('Por favor, selecciona una tienda de recogida');
      return;
    }
    if (tipoEntrega === 'domicilio' && !userData?.direccion) {
      toast.error('No tienes una dirección guardada en tu perfil');
      return;
    }
    if (!metodoPago) {
      toast.error('Por favor, selecciona un método de pago');
      return;
    }
    setPasoActual(3);
  };

  const handleConfirmarPedido = () => {
    // Guardar selección para el checkout
    localStorage.setItem('checkout_tipo_entrega', tipoEntrega);
    if (tipoEntrega === 'tienda') {
      localStorage.setItem('checkout_tienda', tiendaSeleccionada);
    } else {
      localStorage.setItem('checkout_direccion', userData?.direccion || '');
    }
    localStorage.setItem('checkout_metodo_pago', metodoPago);

    // Abrir modal de checkout
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = (pedidoId: string, facturaId: string) => {
    onOpenChange(false);
    if (onProcederPago) {
      onProcederPago();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Indicador de pasos
  const PasoIndicador = ({ numero, titulo, activo }: { numero: number; titulo: string; activo: boolean }) => (
    <div className={`flex items-center gap-2 ${activo ? 'opacity-100' : 'opacity-40'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        activo ? 'bg-[#ED1C24] text-white shadow-lg' : 'bg-gray-200 text-gray-500'
      }`}>
        {numero}
      </div>
      <span className={`text-xs font-medium ${activo ? 'text-gray-900' : 'text-gray-400'}`}>
        {titulo}
      </span>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            {/* Botón izquierdo dinámico según el paso */}
            {pasoActual === 1 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVolverAlPedido}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al Pedido
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPasoActual((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
                className="text-[#ED1C24] hover:text-[#C91820] hover:bg-red-50 -ml-2 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Paso anterior
              </Button>
            )}

            {/* Botón derecho */}
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVaciarCarrito}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Vaciar
              </Button>
            )}
          </div>
          
          <SheetTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Mi Cesta
              {totalItems > 0 && (
                <Badge className="bg-[#ED1C24]">{totalItems}</Badge>
              )}
            </div>
          </SheetTitle>

          {/* Indicador de pasos */}
          {items.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <PasoIndicador numero={1} titulo="Carrito" activo={pasoActual === 1} />
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <PasoIndicador numero={2} titulo="Entrega" activo={pasoActual === 2} />
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <PasoIndicador numero={3} titulo="Confirmar" activo={pasoActual === 3} />
            </div>
          )}
        </SheetHeader>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">Tu cesta está vacía</p>
              <p className="text-sm text-gray-400">Añade productos desde el catálogo</p>
            </div>
          ) : (
            <>
              {/* ========================================= */}
              {/* PASO 1: REVISIÓN DE CARRITO */}
              {/* ========================================= */}
              {pasoActual === 1 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#ED1C24]" />
                    Revisa tu pedido
                  </h3>
                  
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      {/* Imagen */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.imagen ? (
                          <ImageWithFallback
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
                          {item.nombre}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">{item.categoria}</p>
                        
                        {/* Controles */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => {
                                if (item.cantidad > 1) {
                                  updateQuantity(item.id, item.cantidad - 1);
                                } else {
                                  removeItem(item.id);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                            >
                              {item.cantidad > 1 ? (
                                <Minus className="w-3 h-3" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-500" />
                              )}
                            </button>
                            <span className="text-sm font-medium min-w-[20px] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-[#ED1C24] hover:bg-[#C91820] text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-[#ED1C24]">
                            €{(item.precio * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Botón para añadir más productos */}
                  <Button
                    variant="outline"
                    className="w-full h-12 border-2 border-dashed border-[#ED1C24] text-[#ED1C24] hover:bg-red-50 hover:border-solid font-medium mt-3"
                    onClick={handleVolverAlPedido}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Añadir más productos al pedido
                  </Button>
                </div>
              )}

              {/* ========================================= */}
              {/* PASO 2: ENTREGA Y MÉTODO DE PAGO */}
              {/* ========================================= */}
              {pasoActual === 2 && (
                <div className="space-y-2">
                  {/* Tipo de entrega */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#ED1C24]" />
                      ¿Cómo quieres recibir tu pedido?
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setTipoEntrega('tienda')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          tipoEntrega === 'tienda'
                            ? 'border-[#ED1C24] bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Store className={`w-6 h-6 mx-auto mb-2 ${
                          tipoEntrega === 'tienda' ? 'text-[#ED1C24]' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          tipoEntrega === 'tienda' ? 'text-[#ED1C24]' : 'text-gray-700'
                        }`}>
                          Recoger en tienda
                        </p>
                      </button>

                      <button
                        onClick={() => setTipoEntrega('domicilio')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          tipoEntrega === 'domicilio'
                            ? 'border-[#ED1C24] bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <Home className={`w-6 h-6 mx-auto mb-2 ${
                          tipoEntrega === 'domicilio' ? 'text-[#ED1C24]' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          tipoEntrega === 'domicilio' ? 'text-[#ED1C24]' : 'text-gray-700'
                        }`}>
                          A domicilio
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Selector de tienda o dirección */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    {tipoEntrega === 'tienda' ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#ED1C24]" />
                          Selecciona tu tienda
                        </label>
                        <select
                          value={tiendaSeleccionada}
                          onChange={(e) => setTiendaSeleccionada(e.target.value)}
                          className="w-full h-11 px-3 rounded-lg border-2 border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ED1C24] focus:border-transparent transition-all"
                        >
                          {tiendasDisponibles.map((tienda) => (
                            <option key={tienda.id} value={tienda.id}>
                              {tienda.nombre} - {tienda.direccion}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Home className="w-4 h-4 text-[#ED1C24]" />
                          Dirección de entrega
                        </label>
                        {userData?.direccion ? (
                          <div className="p-3 bg-white rounded-lg border-2 border-gray-300">
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#ED1C24]" />
                              {userData.direccion}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              ⚠️ No tienes una dirección guardada en tu perfil
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Método de pago */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#ED1C24]" />
                      Método de pago
                    </h3>
                    
                    <div className="space-y-2">
                      {metodosPago.map((metodo) => {
                        return (
                          <button
                            key={metodo.id}
                            onClick={() => setMetodoPago(metodo.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              metodoPago === metodo.id
                                ? 'border-[#ED1C24] bg-red-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <CreditCard className={`w-5 h-5 ${
                              metodoPago === metodo.id ? 'text-[#ED1C24]' : 'text-gray-400'
                            }`} />
                            <span className={`font-medium ${
                              metodoPago === metodo.id ? 'text-[#ED1C24]' : 'text-gray-700'
                            }`}>
                              {metodo.nombre}
                            </span>
                            {metodoPago === metodo.id && (
                              <Check className="w-5 h-5 text-[#ED1C24] ml-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================= */}
              {/* PASO 3: CONFIRMACIÓN FINAL */}
              {/* ========================================= */}
              {pasoActual === 3 && (
                <div className="space-y-2">
                  
                  {/* 🎯 VENTA CRUZADA - PROTAGONISTA */}
                  {productosSugeridos.length > 0 && (
                    <div className="bg-gradient-to-br from-[#ED1C24] via-red-600 to-orange-600 rounded-2xl p-5 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white rounded-full p-2 shadow-md">
                          <Sparkles className="w-5 h-5 text-[#ED1C24]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg">{textoSugerencia}</h3>
                          <p className="text-white/90 text-xs">
                            {productosFaltantesDelHistorial.length > 0 
                              ? '📊 Basado en tus pedidos anteriores'
                              : '¡Completa tu pedido con estas opciones!'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {productosSugeridos.map((producto) => (
                          <button
                            key={producto.id}
                            onClick={() => handleAñadirSugerido(producto)}
                            className="flex flex-col bg-white rounded-xl p-2.5 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                          >
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 ring-2 ring-white group-hover:ring-4 group-hover:ring-yellow-300 transition-all">
                              {producto.imagen ? (
                                <ImageWithFallback
                                  src={producto.imagen}
                                  alt={producto.nombre}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingCart className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <p className="text-xs font-bold text-gray-900 line-clamp-2 mb-2 min-h-[32px] leading-tight">
                              {producto.nombre}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-[#ED1C24]">
                                {producto.precio.toFixed(2)}€
                              </span>
                              <div className="bg-[#ED1C24] rounded-full p-1.5 group-hover:bg-yellow-400 group-hover:scale-125 transition-all shadow-md">
                                <Plus className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                        <p className="text-white text-center text-xs flex items-center justify-center gap-2">
                          <span>👆</span> Toca para añadir a tu pedido
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 📋 RESUMEN DE TU PEDIDO */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#ED1C24]" />
                      Resumen de tu pedido
                    </h3>
                    
                    <div className="space-y-2.5">
                      {/* Entrega */}
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                        {tipoEntrega === 'tienda' ? (
                          <>
                            <Store className="w-5 h-5 text-[#ED1C24] mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Recoger en tienda</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {tiendasDisponibles.find(t => t.id === tiendaSeleccionada)?.nombre}
                              </p>
                              <p className="text-xs text-gray-600">
                                {tiendasDisponibles.find(t => t.id === tiendaSeleccionada)?.direccion}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Home className="w-5 h-5 text-[#ED1C24] mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Entrega a domicilio</p>
                              <p className="text-sm font-semibold text-gray-900">{userData?.direccion}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Método de pago */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <CreditCard className="w-5 h-5 text-[#ED1C24]" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Método de pago</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {metodosPago.find(m => m.id === metodoPago)?.nombre}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🎫 CÓDIGO DE CUPÓN */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="¿Tienes un cupón de descuento?"
                          value={cuponInput}
                          onChange={(e) => setCuponInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAplicarCupon()}
                          className="pl-10 h-10"
                          disabled={!!cuponAplicado}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleAplicarCupon}
                        disabled={!!cuponAplicado}
                        className="h-10 border-[#ED1C24] text-[#ED1C24] hover:bg-[#ED1C24] hover:text-white"
                      >
                        Aplicar
                      </Button>
                    </div>
                    
                    {cuponAplicado && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-600 rounded-full p-1">
                            <Tag className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-900">{cuponAplicado.codigo}</p>
                            <p className="text-xs text-green-600">{cuponAplicado.descripcion}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEliminarCupon}
                          className="h-7 w-7 p-0 text-green-700 hover:text-green-800 hover:bg-green-100 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* 💰 TOTAL */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Subtotal</span>
                        <span>€{subtotal.toFixed(2)}</span>
                      </div>
                      
                      {descuentoCupon > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Descuento cupón</span>
                          <span>-€{descuentoCupon.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-300">IVA (21%)</span>
                        <span>€{iva.toFixed(2)}</span>
                      </div>
                      
                      <Separator className="bg-white/20" />
                      
                      <div className="flex justify-between text-xl pt-1">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-[#ED1C24]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer con botones según el paso */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4">
            {pasoActual === 1 && (
              <div className="space-y-3">
                {/* Mini resumen */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                    </span>
                    <span className="font-bold text-[#ED1C24] text-lg">
                      €{total.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg"
                  onClick={handleContinuarPaso2}
                >
                  Continuar a entrega
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {pasoActual === 2 && (
              <div className="space-y-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg"
                  onClick={handleContinuarPaso3}
                >
                  Continuar al resumen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-11 border-2 border-gray-300 hover:border-[#ED1C24] hover:bg-red-50 hover:text-[#ED1C24] font-medium"
                  onClick={() => setPasoActual(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Modificar productos del carrito
                </Button>
              </div>
            )}

            {pasoActual === 3 && (
              <div className="space-y-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-lg"
                  onClick={handleConfirmarPedido}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Confirmar Pedido
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-11 border-2 bg-red-50 text-red-600 border-red-300 hover:bg-red-100 hover:text-red-700 hover:border-red-400 font-medium"
                  onClick={() => setPasoActual(2)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Modificar entrega y pago
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>

      {/* Modal de Checkout */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSuccess={handleCheckoutSuccess}
        userData={userData || {
          id: undefined,
          name: 'Usuario',
          email: 'usuario@example.com',
        }}
      />
    </Sheet>
  );
}