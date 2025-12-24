import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, ChevronDown, ChevronUp, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner@2.0.3';

interface MiPedidoProps {
  onCerrar?: () => void;
  onProcederAlPago?: () => void;
  onVolverACatalogo?: () => void;
}

export function MiPedido({ onCerrar, onProcederAlPago, onVolverACatalogo }: MiPedidoProps) {
  const { items, removeItem, updateQuantity, updateItemOptions, total } = useCart();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Auto-expandir combos que no tienen selección completa
  useEffect(() => {
    const newExpanded = new Set<string>();
    items.forEach(item => {
      const isCombo = item.categoria === 'Combos' || item.nombre.toLowerCase().includes('combo');
      if (isCombo) {
        const comboSeleccion = item.opciones?.comboSeleccion;
        const isComplete = comboSeleccion?.pizza && comboSeleccion?.bebida && comboSeleccion?.helado;
        if (!isComplete) {
          newExpanded.add(item.id);
        }
      }
    });
    setExpandedItems(newExpanded);
  }, [items]);

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleUpdateComboSelection = (itemId: string, tipo: 'pizza' | 'helado' | 'bebida', opcion: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Crear opciones actualizadas
    const opcionesActualizadas = {
      ...item.opciones,
      comboSeleccion: {
        ...item.opciones?.comboSeleccion,
        [tipo]: opcion
      }
    };

    updateItemOptions(itemId, opcionesActualizadas);
    toast.success(`Combo actualizado: ${opcion}`);

    // Verificar si el combo está completo y cerrar automáticamente
    const comboCompleto = opcionesActualizadas.comboSeleccion;
    if (comboCompleto?.pizza && comboCompleto?.bebida && comboCompleto?.helado) {
      // Esperar un momento para que el usuario vea la selección final
      setTimeout(() => {
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        toast.success('¡Combo completado! ✨');
      }, 500);
    }
  };

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header mejorado */}
        <div className="bg-gradient-to-b from-zinc-900 to-black border-b border-[#ED1C24]/30 shadow-xl">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-white tracking-wide">MI PEDIDO</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCerrar}
              className="text-white hover:bg-[#ED1C24]/20 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShoppingCart className="w-16 h-16 text-[#ED1C24]/30 mx-auto" />
            <p className="text-white/60 text-lg">Tu pedido está vacío</p>
            <Button
              onClick={onVolverACatalogo}
              className="bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white"
            >
              Ver productos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header mejorado */}
      <div className="bg-gradient-to-b from-zinc-900 to-black border-b border-[#ED1C24]/30 shadow-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onVolverACatalogo}
              className="text-white hover:bg-[#ED1C24]/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">MI PEDIDO</h2>
              <Badge className="bg-[#ED1C24] text-white px-2.5 py-0.5 rounded-full shadow-lg" style={{ boxShadow: '0 0 10px rgba(237, 28, 36, 0.5)' }}>
                {items.length}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCerrar}
            className="text-white hover:bg-[#ED1C24]/20 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Lista de productos desplegables */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const isCombo = item.categoria === 'Combos';

          return (
            <Card key={item.id} className="bg-zinc-900 border-[#ED1C24]/20">
              <CardContent className="p-4">
                {/* Header del producto */}
                <div className="flex items-center gap-3">
                  {/* Cantidad - Solo muestra el número */}
                  <div className="flex items-center justify-center bg-[#ED1C24]/20 rounded-lg min-w-[44px] h-11 border border-[#ED1C24]/40 shrink-0">
                    <span className="text-[#ED1C24] font-bold text-lg">{item.cantidad}x</span>
                  </div>

                  {/* Info del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.nombre}</h3>
                        {isCombo && (
                          <Badge className="bg-[#ED1C24]/20 text-[#ED1C24] mt-1">
                            COMBO
                          </Badge>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#ED1C24] font-bold">€{(item.precio * item.cantidad).toFixed(2)}</p>
                        <p className="text-white/40 text-xs">€{item.precio.toFixed(2)} c/u</p>
                      </div>
                    </div>

                    {/* Botón expandir si es combo */}
                    {isCombo && (
                      <Button
                        variant="ghost"
                        onClick={() => toggleExpand(item.id)}
                        className="w-full mt-2 justify-between text-white/60 hover:text-white hover:bg-[#ED1C24]/10"
                      >
                        <span className="text-sm">
                          {isExpanded ? 'Ocultar personalización' : 'Personalizar combo'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>

                  {/* Botón eliminar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeItem(item.id);
                      toast.success('Producto eliminado');
                    }}
                    className="text-white/60 hover:text-[#ED1C24] hover:bg-[#ED1C24]/10 shrink-0 h-11 w-11 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Sección de personalización de combo (expandible) */}
                {isCombo && isExpanded && (
                  <div className="mt-4 space-y-4 pt-4 border-t border-[#ED1C24]/20">
                    {/* Pizza */}
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm font-medium">Elige tu Pizza:</label>
                      <div className="space-y-1">
                        {['Margarita', 'Pepperoni', 'Carbonara', 'BBQ'].map((opcion) => (
                          <label
                            key={opcion}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ED1C24]/10 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`pizza-${item.id}`}
                              value={opcion}
                              checked={item.opciones?.comboSeleccion?.pizza === opcion}
                              onChange={() => handleUpdateComboSelection(item.id, 'pizza', opcion)}
                              className="accent-[#ED1C24]"
                            />
                            <span className="text-white text-sm">{opcion}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Bebida */}
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm font-medium">Elige tu Bebida:</label>
                      <div className="space-y-1">
                        {['Coca-Cola', 'Fanta', 'Sprite', 'Agua'].map((opcion) => (
                          <label
                            key={opcion}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ED1C24]/10 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`bebida-${item.id}`}
                              value={opcion}
                              checked={item.opciones?.comboSeleccion?.bebida === opcion}
                              onChange={() => handleUpdateComboSelection(item.id, 'bebida', opcion)}
                              className="accent-[#ED1C24]"
                            />
                            <span className="text-white text-sm">{opcion}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Helado */}
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm font-medium">Elige tu Helado:</label>
                      <div className="space-y-1">
                        {['Chocolate', 'Vainilla', 'Fresa', 'Pistacho'].map((opcion) => (
                          <label
                            key={opcion}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ED1C24]/10 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`helado-${item.id}`}
                              value={opcion}
                              checked={item.opciones?.comboSeleccion?.helado === opcion}
                              onChange={() => handleUpdateComboSelection(item.id, 'helado', opcion)}
                              className="accent-[#ED1C24]"
                            />
                            <span className="text-white text-sm">{opcion}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer con total y botones */}
      <div className="border-t border-[#ED1C24]/30 p-4 space-y-3 bg-black/60">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-white text-lg">TOTAL</span>
          <span className="text-[#ED1C24] text-2xl font-bold">€{total.toFixed(2)}</span>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onVolverACatalogo}
            className="border-[#ED1C24] text-[#ED1C24] hover:bg-[#ED1C24]/10"
          >
            Añadir más
          </Button>
          <Button
            onClick={onProcederAlPago}
            className="bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white"
          >
            Proceder al pago
          </Button>
        </div>
      </div>
    </div>
  );
}
