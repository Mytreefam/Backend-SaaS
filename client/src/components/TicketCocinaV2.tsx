import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import type { Pedido } from './TPV360Master';

interface TicketCocinaV2Props {
  pedido: Pedido;
  tipo: 'cocina' | 'montaje' | 'repartidor';
  anchoMM: 58 | 80;
}

export function TicketCocinaV2({ pedido, tipo, anchoMM }: TicketCocinaV2Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Generar QR solo para repartidor
    if (tipo === 'repartidor') {
      QRCode.toDataURL(pedido.id, { width: 120, margin: 1 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [pedido.id, tipo]);

  // Agrupar items por categoría
  const itemsAgrupados = pedido.items.reduce((acc, item) => {
    const categoria = item.producto.categoria || 'OTROS';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<string, typeof pedido.items>);

  const anchoClase = anchoMM === 58 ? 'max-w-[220px]' : 'max-w-[300px]';

  return (
    <Card className={`${anchoClase} mx-auto bg-white`}>
      <CardContent className="p-4 font-mono text-xs">
        {/* CÓDIGO DEL PEDIDO - MUY GRANDE Y CENTRADO */}
        <div className="text-center mb-4 pb-4 border-b-2 border-black">
          <p 
            className="text-6xl mb-2 tracking-wider" 
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}
          >
            {pedido.codigo}
          </p>
          <Badge className="text-xs px-3 py-1">
            {tipo === 'cocina' ? 'COCINA' : tipo === 'montaje' ? 'MONTAJE' : 'REPARTIDOR'}
          </Badge>
        </div>

        {/* INFORMACIÓN DEL CLIENTE - Solo para repartidor */}
        {tipo === 'repartidor' && (
          <div className="mb-4 pb-3 border-b-2 border-dashed border-gray-400">
            <p className="font-bold text-sm mb-2">CLIENTE:</p>
            <p className="text-sm mb-1">{pedido.cliente.nombre}</p>
            <p className="text-sm">{pedido.cliente.telefono}</p>
            {pedido.cliente.direccion && (
              <p className="text-xs mt-1 text-gray-600">{pedido.cliente.direccion}</p>
            )}
          </div>
        )}

        {/* CONTENIDO AGRUPADO POR CATEGORÍAS */}
        <div className="space-y-4 mb-4">
          {Object.entries(itemsAgrupados).map(([categoria, items]) => (
            <div key={categoria} className="pb-3 border-b-2 border-dashed border-gray-300">
              {/* NOMBRE DE CATEGORÍA */}
              <p 
                className="font-bold text-sm mb-3 uppercase tracking-wide bg-gray-800 text-white px-2 py-1 rounded"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {categoria}
              </p>
              
              {/* ITEMS DE LA CATEGORÍA */}
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between mb-2 text-sm">
                  <span>
                    <span className="font-bold mr-2 text-base">{item.cantidad}x</span>
                    <span className="font-medium">{item.producto.nombre}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="flex justify-between text-base border-t-2 border-black pt-3 mb-4">
          <span className="font-bold">TOTAL:</span>
          <span className="font-bold text-lg">{pedido.total.toFixed(2)}€</span>
        </div>

        {/* QR CÓDIGO - Solo para repartidor */}
        {tipo === 'repartidor' && qrDataUrl && (
          <div className="text-center pt-3 border-t-2 border-dashed border-gray-400">
            <p className="text-xs mb-3 text-gray-600 uppercase font-bold">Código de Entrega</p>
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              className="mx-auto"
              style={{ width: '120px', height: '120px' }}
            />
            <p className="text-xs mt-2 text-gray-500">{pedido.id}</p>
          </div>
        )}

        {/* NOTA: Sin hora ni tiempo estimado según especificación */}
      </CardContent>
    </Card>
  );
}
