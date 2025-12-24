/**
 * 🛒✅ MODAL "AÑADIDO AL CARRITO" - Estilo Glovo
 * 
 * Modal de confirmación cuando se añade un producto al carrito.
 * Diseño HoyPecamos: Negro + Rojo (#ED1C24)
 * 
 * Características:
 * - Checkmark animado
 * - Imagen + nombre + cantidad + precio del producto añadido
 * - 2 botones: "Seguir comprando" y "Ir al carrito"
 * - Auto-cierre después de 4 segundos
 * - Drawer en móvil, dialog en desktop
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  CheckCircle2,
  ShoppingCart,
  ChevronRight,
  X
} from 'lucide-react';

interface AñadidoAlCarritoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIrAlCarrito: () => void;
  producto: {
    nombre: string;
    imagen?: string;
    precio: number;
    cantidad: number;
  };
  totalItemsCarrito: number;
}

export function AñadidoAlCarritoModal({ 
  isOpen, 
  onClose, 
  onIrAlCarrito, 
  producto,
  totalItemsCarrito 
}: AñadidoAlCarritoModalProps) {

  // Auto-cierre después de 4 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal - Drawer en móvil, centrado en desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] max-w-md mx-auto"
          >
            <div className="bg-black text-white rounded-t-3xl md:rounded-3xl shadow-2xl border-t-4 md:border-t-0 md:border-4 border-[#ED1C24] overflow-hidden">
              
              {/* Botón cerrar (solo desktop) */}
              <button
                onClick={onClose}
                className="hidden md:block absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header con checkmark animado */}
              <div className="text-center pt-8 pb-6 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ED1C24] mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
                <h3 className="text-white uppercase tracking-wide">
                  ¡Añadido al carrito!
                </h3>
              </div>

              {/* Contenido - Producto añadido */}
              <div className="px-6 pb-6">
                <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  {/* Imagen */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                    {producto.imagen ? (
                      <ImageWithFallback
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">
                      {producto.nombre}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-white/70 text-sm">
                      <span>{producto.cantidad}x</span>
                      <span>•</span>
                      <span className="text-[#ED1C24]">
                        {(producto.precio * producto.cantidad).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="px-6 pb-8 space-y-3">
                {/* Ir al carrito - Primario */}
                <Button
                  onClick={() => {
                    onClose();
                    onIrAlCarrito();
                  }}
                  className="w-full bg-[#ED1C24] hover:bg-[#C91820] text-white h-12 rounded-xl group transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span>Ir al carrito ({totalItemsCarrito})</span>
                  <ChevronRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Seguir comprando - Secundario */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10 h-12 rounded-xl transition-all duration-200"
                >
                  Seguir comprando
                </Button>
              </div>

              {/* Barra de progreso auto-cierre */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: 'linear' }}
                className="h-1 bg-[#ED1C24] origin-left"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
