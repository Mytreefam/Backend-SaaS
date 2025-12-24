/**
 * 📱 COMPONENTE: Generador de Código QR
 * 
 * Genera y muestra códigos QR para pedidos.
 * Usa la librería 'qrcode' para generar QR real.
 * 
 * ✨ Características:
 * - Genera QR con datos del pedido
 * - Descargable como imagen
 * - Tamaño configurable
 * - Estilo personalizable
 */

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '../ui/button';
import { Download, QrCode } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface GeneradorQRProps {
  pedidoId: string;
  pedidoNumero: string;
  size?: number;
  showDownload?: boolean;
  className?: string;
}

export function GeneradorQR({ 
  pedidoId, 
  pedidoNumero, 
  size = 200, 
  showDownload = true,
  className = '' 
}: GeneradorQRProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generarQR();
  }, [pedidoId, size]);

  const generarQR = async () => {
    try {
      // Datos que contendrá el QR
      const qrData = JSON.stringify({
        type: 'pedido',
        pedidoId: pedidoId,
        numero: pedidoNumero,
        timestamp: Date.now(),
      });

      // Generar QR como Data URL
      const url = await QRCode.toDataURL(qrData, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });

      setQrDataURL(url);

      // También generar en canvas (para descargar)
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, qrData, {
          width: size,
          margin: 2,
        });
      }
    } catch (error) {
      console.error('Error generando QR:', error);
      toast.error('Error al generar código QR');
    }
  };

  const descargarQR = () => {
    if (!qrDataURL) return;

    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = `QR-Pedido-${pedidoNumero}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Código QR descargado');
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* QR Code */}
      {qrDataURL ? (
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200">
          <img 
            src={qrDataURL} 
            alt={`QR Pedido ${pedidoNumero}`}
            className="block"
            style={{ width: size, height: size }}
          />
        </div>
      ) : (
        <div 
          className="bg-gray-100 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <QrCode className="w-12 h-12 text-gray-400 animate-pulse" />
        </div>
      )}

      {/* Canvas oculto para descargar */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Info */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-900">Pedido #{pedidoNumero}</div>
        <div className="text-xs text-gray-500">Escanea para recoger</div>
      </div>

      {/* Botón descargar */}
      {showDownload && (
        <Button
          onClick={descargarQR}
          variant="outline"
          size="sm"
          disabled={!qrDataURL}
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar QR
        </Button>
      )}
    </div>
  );
}
