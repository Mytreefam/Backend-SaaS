/**
 * 📷 COMPONENTE: Escáner de Código QR
 * 
 * Permite escanear códigos QR de pedidos.
 * En navegador: usa input file para subir imagen QR
 * En móvil con Capacitor: usaría cámara nativa (preparado)
 * 
 * ✨ Características:
 * - Escaneo desde archivo
 * - Validación de formato
 * - Callback con datos del pedido
 * - Preparado para cámara nativa
 */

import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Camera, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsQR from 'jsqr';

interface DatosQRPedido {
  type: string;
  pedidoId: string;
  numero: string;
  timestamp: number;
}

interface EscanerQRProps {
  onEscaneoExitoso: (datos: DatosQRPedido) => void;
  onCancelar?: () => void;
}

export function EscanerQR({ onEscaneoExitoso, onCancelar }: EscanerQRProps) {
  const [escaneando, setEscaneando] = useState(false);
  const [imagenPreview, setImagenPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const abrirSeleccionArchivo = () => {
    fileInputRef.current?.click();
  };

  const procesarImagen = async (file: File) => {
    setEscaneando(true);
    setImagenPreview(URL.createObjectURL(file));

    try {
      // Leer la imagen
      const img = await crearImagen(file);
      
      // Crear canvas para extraer datos
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear contexto canvas');
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Extraer datos de imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Buscar QR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (!code) {
        throw new Error('No se encontró código QR en la imagen');
      }

      // Parsear datos
      const datos: DatosQRPedido = JSON.parse(code.data);

      // Validar formato
      if (datos.type !== 'pedido' || !datos.pedidoId || !datos.numero) {
        throw new Error('Código QR inválido');
      }

      // Éxito
      toast.success('Código QR escaneado correctamente', {
        description: `Pedido #${datos.numero}`,
      });

      onEscaneoExitoso(datos);
      
    } catch (error) {
      console.error('Error escaneando QR:', error);
      toast.error('Error al escanear código QR', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setEscaneando(false);
    }
  };

  const crearImagen = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      procesarImagen(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview de imagen */}
      {imagenPreview && (
        <div className="relative">
          <img 
            src={imagenPreview} 
            alt="QR Preview" 
            className="max-w-sm rounded-lg border-2 border-gray-200"
          />
          {escaneando && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white">
                <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2" />
                <div className="text-sm">Escaneando...</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instrucciones */}
      {!imagenPreview && (
        <div className="text-center space-y-2 py-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="font-semibold text-lg">Escanear Código QR</h3>
          <p className="text-sm text-gray-600 max-w-sm">
            Sube una imagen con el código QR del pedido para escanearlo
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-sm text-blue-800">
            💡 <strong>Tip:</strong> En la app móvil podrás usar la cámara directamente
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 w-full max-w-sm">
        {!imagenPreview ? (
          <>
            <Button
              onClick={abrirSeleccionArchivo}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={escaneando}
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Imagen QR
            </Button>
            {onCancelar && (
              <Button
                onClick={onCancelar}
                variant="outline"
              >
                Cancelar
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                setImagenPreview('');
                abrirSeleccionArchivo();
              }}
              variant="outline"
              className="flex-1"
              disabled={escaneando}
            >
              <Camera className="w-4 h-4 mr-2" />
              Escanear Otro
            </Button>
            <Button
              onClick={() => {
                setImagenPreview('');
                onCancelar?.();
              }}
              variant="outline"
              disabled={escaneando}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Nota sobre Capacitor */}
      <div className="text-xs text-gray-500 text-center max-w-md mt-4">
        <AlertCircle className="w-4 h-4 inline mr-1" />
        En producción con Capacitor, este componente usará la cámara nativa del dispositivo
      </div>
    </div>
  );
}
