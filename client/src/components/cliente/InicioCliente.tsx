import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Percent, 
  Tag, 
  ShoppingCart, 
  Calendar, 
  Gift, 
  Clock,
  ArrowLeft,
  Home,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCart } from '../../contexts/CartContext';
import { SelectorCategoriaHoyPecamos } from './SelectorCategoriaHoyPecamos';
import { CatalogoPromos } from './CatalogoPromos';
import { EventosModommio } from './EventosModommio';

interface InicioClienteProps {
  onOpenCesta?: () => void;
  onOpenNuevaCita?: () => void;
  onYaEstoyAqui?: () => void;
  onNavigate?: (route: string) => void;
}

export function InicioCliente({ onOpenCesta, onOpenNuevaCita, onYaEstoyAqui, onNavigate }: InicioClienteProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const { addItem } = useCart();

  // Si no hay categoría seleccionada, mostrar selector
  if (!categoriaSeleccionada) {
    return (
      <SelectorCategoriaHoyPecamos
        onCategoriaSelected={(categoriaId) => {
          setCategoriaSeleccionada(categoriaId);
          localStorage.setItem('cliente_categoria_preferida', categoriaId);
          toast.success(`Has seleccionado ${categoriaId === 'modommio' ? 'MODOMMIO' : categoriaId === 'blackburger' ? 'BLACKBURGER' : 'EVENTOS MODOMMIO'}`);
        }}
      />
    );
  }

  // ✅ Si la categoría es "eventos", mostrar página de Eventos Modommio
  if (categoriaSeleccionada === 'eventos') {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header de marca - Todo en 1 línea */}
        <div className="flex items-center justify-between gap-3">
          {/* Botón CAMBIAR MARCA con recuadro bonito */}
          <Button
            variant="outline"
            onClick={() => {
              setCategoriaSeleccionada(null);
              localStorage.removeItem('cliente_categoria_preferida');
            }}
            className="px-3 py-2 rounded-lg border-2 border-[#ED1C24] bg-black/40 hover:bg-[#ED1C24] hover:scale-105 transition-all duration-200 gap-2 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium uppercase tracking-wide">Cambiar Marca</span>
          </Button>

          {/* Badge de marca actual con icono pequeño */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.2) 0%, rgba(237, 28, 36, 0.1) 100%)',
              border: '1px solid rgba(237, 28, 36, 0.3)',
            }}
          >
            <span className="text-[#ED1C24] text-xs sm:text-sm tracking-wider"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                textShadow: '0 0 10px rgba(237, 28, 36, 0.3)',
              }}
            >
              EVENTOS MODOMMIO
            </span>
            {/* Icono pequeño a la derecha */}
            <span className="text-base sm:text-lg">🎉</span>
          </div>
        </div>

        {/* Página de Eventos Modommio */}
        <EventosModommio onOpenCesta={onOpenCesta} />
      </div>
    );
  }

  // ✅ Si hay categoría seleccionada (modommio o blackburger), mostrar catálogo con pestañas de productos
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header de marca - Todo en 1 línea */}
      <div className="flex items-center justify-between gap-3">
        {/* Botón CAMBIAR MARCA con recuadro bonito */}
        <Button
          variant="outline"
          onClick={() => {
            setCategoriaSeleccionada(null);
            localStorage.removeItem('cliente_categoria_preferida');
          }}
          className="px-3 py-2 rounded-lg border-2 border-[#ED1C24] bg-black/40 hover:bg-[#ED1C24] hover:scale-105 transition-all duration-200 gap-2 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium uppercase tracking-wide">Cambiar Marca</span>
        </Button>

        {/* Badge de marca actual con icono pequeño */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.2) 0%, rgba(237, 28, 36, 0.1) 100%)',
            border: '1px solid rgba(237, 28, 36, 0.3)',
          }}
        >
          <span className="text-[#ED1C24] text-xs sm:text-sm tracking-wider"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              textShadow: '0 0 10px rgba(237, 28, 36, 0.3)',
            }}
          >
            {categoriaSeleccionada === 'modommio' ? 'MODOMMIO' : categoriaSeleccionada === 'blackburger' ? 'BLACKBURGER' : 'EVENTOS'}
          </span>
          {/* Icono pequeño a la derecha */}
          <span className="text-base sm:text-lg">
            {categoriaSeleccionada === 'modommio' ? '🍕' : categoriaSeleccionada === 'blackburger' ? '🍔' : '🎉'}
          </span>
        </div>
      </div>

      {/* Catálogo de productos con pestañas */}
      <CatalogoPromos onOpenCesta={onOpenCesta} />
    </div>
  );
}