/**
 * 🖨️ COMPONENTE: Ticket de Pedido
 * 
 * Plantilla de ticket para imprimir pedidos.
 * Compatible con impresoras térmicas ESC/POS.
 * 
 * ✨ Características:
 * - Diseño optimizado para impresoras térmicas 80mm
 * - Información completa del pedido
 * - Código QR para escaneo
 * - Botón de impresión
 * - Auto-impresión opcional
 */

import { useRef } from 'react';
import { Button } from '../ui/button';
import { Printer, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { GeneradorQR } from './GeneradorQR';
import type { Pedido } from '../../services/pedidos.service';

interface TicketPedidoProps {
  pedido: Pedido;
  autoImprimir?: boolean;
  onImprimir?: () => void;
}

export function TicketPedido({ pedido, autoImprimir = false, onImprimir }: TicketPedidoProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const imprimir = () => {
    if (!ticketRef.current) return;

    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    if (!ventanaImpresion) {
      toast.error('No se pudo abrir ventana de impresión');
      return;
    }

    // Clonar contenido
    const contenido = ticketRef.current.cloneNode(true) as HTMLElement;

    // HTML de la ventana
    ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket Pedido #${pedido.numero}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 10mm;
            }
            .ticket {
              width: 80mm;
              margin: 0 auto;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${contenido.outerHTML}
        </body>
      </html>
    `);

    ventanaImpresion.document.close();

    // Esperar a que cargue e imprimir
    ventanaImpresion.onload = () => {
      setTimeout(() => {
        ventanaImpresion.print();
        ventanaImpresion.close();
        onImprimir?.();
        toast.success('Ticket enviado a impresora');
      }, 250);
    };
  };

  return (
    <div className="space-y-4">
      {/* Ticket Preview */}
      <div 
        ref={ticketRef}
        className="ticket bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg max-w-sm mx-auto"
        style={{ fontFamily: 'Courier New, monospace' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-3">
          <div className="text-2xl font-bold">{pedido.empresaNombre}</div>
          <div className="text-sm">{pedido.marcaNombre}</div>
          <div className="text-xs mt-1">{pedido.puntoVentaNombre}</div>
        </div>

        {/* Info Pedido */}
        <div className="space-y-1 text-sm mb-3">
          <div className="flex justify-between font-bold text-lg">
            <span>PEDIDO:</span>
            <span>#{pedido.numero}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span>{new Date(pedido.fecha).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex justify-between">
            <span>Hora:</span>
            <span>{new Date(pedido.fecha).toLocaleTimeString('es-ES')}</span>
          </div>
          <div className="flex justify-between">
            <span>Origen:</span>
            <span className="uppercase font-semibold">{getOrigenLabel(pedido.origenPedido)}</span>
          </div>
        </div>

        {/* Cliente */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-3">
          <div className="font-bold mb-1">CLIENTE:</div>
          <div className="text-sm">
            <div>{pedido.cliente.nombre}</div>
            <div>{pedido.cliente.telefono}</div>
            {pedido.direccionEntrega && (
              <div className="mt-1 text-xs">{pedido.direccionEntrega}</div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-3">
          <div className="font-bold mb-2">PRODUCTOS:</div>
          {pedido.items.map((item, idx) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">
                  {item.cantidad}x {item.nombre}
                </span>
                <span>{item.subtotal.toFixed(2)}€</span>
              </div>
              {item.opciones && item.opciones.length > 0 && (
                <div className="text-xs ml-4 text-gray-600">
                  {item.opciones.map((op, i) => (
                    <div key={i}>+ {op.nombre}</div>
                  ))}
                </div>
              )}
              {item.observaciones && (
                <div className="text-xs ml-4 italic text-gray-600">
                  Obs: {item.observaciones}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-3">
          <div className="flex justify-between mb-1">
            <span>Subtotal:</span>
            <span>{pedido.subtotal.toFixed(2)}€</span>
          </div>
          {pedido.descuento > 0 && (
            <div className="flex justify-between mb-1 text-green-600">
              <span>Descuento:</span>
              <span>-{pedido.descuento.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between mb-1">
            <span>IVA:</span>
            <span>{pedido.iva.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t-2 border-black pt-2 mt-2">
            <span>TOTAL:</span>
            <span>{pedido.total.toFixed(2)}€</span>
          </div>
        </div>

        {/* Método de Pago */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-3">
          <div className="flex justify-between">
            <span>Pago:</span>
            <span className="font-semibold uppercase">{getMetodoPagoLabel(pedido.metodoPago)}</span>
          </div>
          {pedido.pagoEnEfectivo && (
            <div className="bg-yellow-100 border-2 border-yellow-400 p-2 mt-2 text-center font-bold">
              ⚠️ COBRAR EN EFECTIVO: {pedido.total.toFixed(2)}€
            </div>
          )}
        </div>

        {/* Tipo de Entrega */}
        <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-3">
          <div className="flex justify-between">
            <span>Entrega:</span>
            <span className="font-semibold uppercase">
              {pedido.tipoEntrega === 'domicilio' ? '🚚 DOMICILIO' : '🏪 RECOGIDA'}
            </span>
          </div>
          {pedido.fechaEstimadaEntrega && (
            <div className="text-xs mt-1">
              Estimado: {new Date(pedido.fechaEstimadaEntrega).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Observaciones */}
        {pedido.observaciones && (
          <div className="border-t-2 border-dashed border-gray-400 pt-3 mb-3">
            <div className="font-bold mb-1">OBSERVACIONES:</div>
            <div className="text-sm bg-yellow-50 p-2 rounded">
              {pedido.observaciones}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="border-t-2 border-black pt-3 mt-3">
          <div className="text-center">
            <GeneradorQR
              pedidoId={pedido.id}
              pedidoNumero={pedido.numero || pedido.id}
              size={150}
              showDownload={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs mt-3 pt-3 border-t-2 border-dashed border-gray-400">
          <div>¡Gracias por su pedido!</div>
          <div className="mt-1 text-gray-600">www.udar-edge.com</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-center no-print">
        <Button
          onClick={imprimir}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir Ticket
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getOrigenLabel(origen: string): string {
  const labels: Record<string, string> = {
    app: '📱 App',
    tpv: '💳 TPV',
    glovo: '🛵 Glovo',
    justeat: '🍔 Just Eat',
    ubereats: '🚗 Uber Eats',
    deliveroo: '🚴 Deliveroo',
  };
  return labels[origen] || origen;
}

function getMetodoPagoLabel(metodo: string): string {
  const labels: Record<string, string> = {
    tarjeta: '💳 Tarjeta',
    efectivo: '💵 Efectivo',
    bizum: '📱 Bizum',
    transferencia: '🏦 Transferencia',
  };
  return labels[metodo] || metodo;
}
