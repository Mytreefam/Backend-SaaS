/**
 * 🎫 APLICAR CUPÓN - INPUT
 * Componente para aplicar cupón en el carrito/cesta
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Ticket, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCupones } from '../../hooks/useCupones';
import type { Cupon } from '../../types/cupon.types';

interface AplicarCuponInputProps {
  clienteId: string;
  montoCarrito: number;
  productosCarrito: Array<{
    id: string;
    categoria?: string;
  }>;
  marcaId: string;
  puntoVentaId: string;
  cuponAplicado: Cupon | null;
  onCuponAplicado: (cupon: Cupon, descuento: number) => void;
  onCuponRemovido: () => void;
}

export function AplicarCuponInput({
  clienteId,
  montoCarrito,
  productosCarrito,
  marcaId,
  puntoVentaId,
  cuponAplicado,
  onCuponAplicado,
  onCuponRemovido,
}: AplicarCuponInputProps) {
  const { validarCupon, obtenerCuponesDisponiblesCliente } = useCupones();
  const [codigo, setCodigo] = useState('');
  const [validando, setValidando] = useState(false);

  // Cupones disponibles para mostrar sugerencias
  const cuponesDisponibles = obtenerCuponesDisponiblesCliente(clienteId);

  const handleAplicarCupon = () => {
    if (!codigo.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    setValidando(true);

    // Validar cupón
    const validacion = validarCupon({
      codigoCupon: codigo,
      clienteId,
      montoCarrito,
      productosCarrito,
      marcaId,
      puntoVentaId,
    });

    setValidando(false);

    if (validacion.valido && validacion.cupon && validacion.descuentoAplicable !== undefined) {
      onCuponAplicado(validacion.cupon, validacion.descuentoAplicable);
      toast.success(`¡Cupón aplicado! Ahorro: ${validacion.descuentoAplicable.toFixed(2)}€`);
      setCodigo('');
    } else {
      toast.error(validacion.mensaje);
    }
  };

  const handleRemoverCupon = () => {
    onCuponRemovido();
    toast.info('Cupón removido');
  };

  const handleAplicarCuponSugerido = (cupon: Cupon) => {
    setCodigo(cupon.codigo);
    // Aplicar automáticamente
    setTimeout(handleAplicarCupon, 100);
  };

  return (
    <div className="space-y-3">
      {/* Input de cupón */}
      {!cuponAplicado ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Código de cupón"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAplicarCupon();
                  }
                }}
                className="pl-10 uppercase"
                disabled={validando}
              />
            </div>
            <Button
              onClick={handleAplicarCupon}
              disabled={!codigo.trim() || validando}
              className="gap-2"
            >
              {validando ? 'Validando...' : 'Aplicar'}
            </Button>
          </div>

          {/* Cupones sugeridos */}
          {cuponesDisponibles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Cupones disponibles:</div>
              <div className="flex flex-wrap gap-2">
                {cuponesDisponibles.slice(0, 3).map((cupon) => (
                  <button
                    key={cupon.id}
                    onClick={() => handleAplicarCuponSugerido(cupon)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                  >
                    <Ticket className="h-3 w-3" />
                    <span className="font-mono font-semibold">{cupon.codigo}</span>
                    <span className="text-gray-600">
                      {cupon.tipoDescuento === 'porcentaje' && `${cupon.valorDescuento}% OFF`}
                      {cupon.tipoDescuento === 'fijo' && `${cupon.valorDescuento}€ OFF`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Cupón aplicado */
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-green-500 p-2 rounded-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-green-800">{cuponAplicado.nombre}</span>
                  <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs">
                    {cuponAplicado.codigo}
                  </Badge>
                </div>
                {cuponAplicado.descripcion && (
                  <p className="text-sm text-green-700">{cuponAplicado.descripcion}</p>
                )}
                {cuponAplicado.gastoMinimo && montoCarrito < cuponAplicado.gastoMinimo && (
                  <div className="flex items-start gap-2 mt-2 text-xs text-orange-600">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Gasto mínimo: {cuponAplicado.gastoMinimo}€ 
                      (te faltan {(cuponAplicado.gastoMinimo - montoCarrito).toFixed(2)}€)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoverCupon}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
