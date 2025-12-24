/**
 * 🧪 PÁGINA DE TESTING - SISTEMA DE STOCK
 * 
 * Página de desarrollo para probar y visualizar el sistema de stock,
 * reservas y sincronización en tiempo real.
 * 
 * SOLO PARA DESARROLLO - Eliminar en producción
 */

import { useState } from 'react';
import { StockMonitor } from '../components/StockMonitor';
import { ReservationManagerPanel } from '../components/ReservationManagerPanel';
import { ProductStockBadge } from '../components/ProductStockBadge';
import { useProductos } from '../contexts/ProductosContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner@2.0.3';

export default function DevStockTest() {
  const { productos, actualizarStock, incrementarStock, decrementarStock } = useProductos();
  const { addItem, items } = useCart();
  const [vistaActual, setVistaActual] = useState<'monitor' | 'reservas' | 'productos'>('monitor');
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);

  // Simular actualización de stock
  const handleSimularVenta = (productoId: string, cantidad: number) => {
    const exito = decrementarStock(productoId, cantidad);
    
    if (exito) {
      toast.success(`Stock decrementado: -${cantidad} unidades`);
    } else {
      toast.error('Stock insuficiente para decrementar');
    }
  };

  const handleSimularRecepcion = (productoId: string, cantidad: number) => {
    incrementarStock(productoId, cantidad);
    toast.success(`Stock incrementado: +${cantidad} unidades`);
  };

  const handleActualizarStock = (productoId: string, nuevoStock: number) => {
    actualizarStock(productoId, nuevoStock);
    toast.success(`Stock actualizado a ${nuevoStock} unidades`);
  };

  const handleAgregarAlCarrito = (productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;

    const resultado = addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      imagen: producto.imagen,
    });

    // El toast ya se muestra desde CartContext
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🧪</span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Sistema de Stock - Testing
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Prueba y visualiza el sistema de validación de stock, reservas temporales y sincronización multi-tab
          </p>
          
          {/* Warning */}
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-semibold text-yellow-800 dark:text-yellow-400">
                  Página de Desarrollo
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                  Esta página es solo para testing. Eliminar antes de producción.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setVistaActual('monitor')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              vistaActual === 'monitor'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📊 Monitor de Stock
          </button>
          
          <button
            onClick={() => setVistaActual('reservas')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              vistaActual === 'reservas'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            🔧 Gestión de Reservas
          </button>
          
          <button
            onClick={() => setVistaActual('productos')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              vistaActual === 'productos'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            🛍️ Simulador de Productos
          </button>
        </div>

        {/* Contenido según vista */}
        {vistaActual === 'monitor' && (
          <div className="space-y-6">
            <StockMonitor />
            
            {/* Instrucciones */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                💡 Instrucciones
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Abre múltiples tabs de esta página para ver la sincronización en tiempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Los cambios de stock se propagan instantáneamente entre todos los tabs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Las reservas se muestran en tiempo real cuando agregas productos al carrito</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Stock Disponible = Stock Real - Stock Reservado por otros</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {vistaActual === 'reservas' && (
          <ReservationManagerPanel />
        )}

        {vistaActual === 'productos' && (
          <div className="space-y-6">
            {/* Grid de productos */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🛍️ Simulador de Productos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.slice(0, 9).map(producto => (
                  <div
                    key={producto.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Imagen */}
                    {producto.imagen && (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Info */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {producto.nombre}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {producto.descripcion?.substring(0, 100)}...
                      </p>
                      
                      {/* Badge de stock */}
                      <ProductStockBadge productoId={producto.id} showDetails />
                      
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-3">
                        {producto.precio.toFixed(2)}€
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-2">
                      {/* Agregar al carrito */}
                      <button
                        onClick={() => handleAgregarAlCarrito(producto.id)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        🛒 Agregar al Carrito
                      </button>

                      {/* Controles de stock */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSimularVenta(producto.id, 1)}
                          className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                          title="Simular venta (decrementar stock)"
                        >
                          -1
                        </button>
                        
                        <button
                          onClick={() => handleSimularRecepcion(producto.id, 5)}
                          className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
                          title="Simular recepción (incrementar stock)"
                        >
                          +5
                        </button>
                        
                        <button
                          onClick={() => {
                            const nuevoStock = prompt('Nuevo stock:', producto.stock.toString());
                            if (nuevoStock && !isNaN(parseInt(nuevoStock))) {
                              handleActualizarStock(producto.id, parseInt(nuevoStock));
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                          title="Establecer stock manualmente"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3">
                🎮 Cómo usar el simulador
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-400">
                <div>
                  <div className="font-semibold mb-2">Agregar al Carrito:</div>
                  <ul className="space-y-1">
                    <li>• Click en "Agregar al Carrito"</li>
                    <li>• Se crea una reserva automática (15 min)</li>
                    <li>• El stock disponible se actualiza en tiempo real</li>
                    <li>• Verás notificación de éxito o error</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold mb-2">Controles de Stock:</div>
                  <ul className="space-y-1">
                    <li>• <strong>-1</strong>: Simula una venta (decrementa 1)</li>
                    <li>• <strong>+5</strong>: Simula recepción (incrementa 5)</li>
                    <li>• <strong>✏️</strong>: Establece stock manualmente</li>
                    <li>• Los cambios se sincronizan a todos los tabs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Carrito actual */}
            {items.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🛒 Carrito Actual ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                </h3>
                
                <div className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {item.imagen && (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.cantidad} x {item.precio.toFixed(2)}€
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <ProductStockBadge productoId={item.productoId} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
