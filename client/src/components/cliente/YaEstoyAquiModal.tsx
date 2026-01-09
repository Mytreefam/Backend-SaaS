import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MapPin, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { clientesApi } from '../../services/api/clientes.api';
import { turnosApi } from '../../services/api/turnos.api';
import { notificacionesApi } from '../../services/api/notificaciones.api';

interface YaEstoyAquiModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  userId: string;
  userName: string;
  userPhone?: string;
}

export function YaEstoyAquiModal({ isOpen, onOpenChange, onConfirmar, userId, userName, userPhone }: YaEstoyAquiModalProps) {
  const [procesando, setProcesando] = useState(false);

  const handleActivarUbicacion = async () => {
    setProcesando(true);
    toast.loading('Verificando tu ubicación...', { id: 'geo-check' });

    try {
      // Obtener pedidos activos del cliente desde el backend
      const pedidosCliente = await clientesApi.getPedidos(userId);
      const pedidosActivos = pedidosCliente.filter((p: any) =>
        (p.estado === 'pendiente' || p.estado === 'en_preparacion' || p.estado === 'listo')
      );

      if (pedidosActivos.length > 0) {
        // CASO 1: Cliente con pedidos activos - marcar como presente
        // Crear notificación en backend
        await notificacionesApi.create({
          mensaje: `Cliente ${userName} ha llegado para recoger pedido`,
          clienteId: parseInt(userId),
          leida: false
        });
        toast.dismiss('geo-check');
        toast.success('¡Ubicación confirmada! Tus pedidos están marcados como presentes');
      } else {
        // CASO 2: Cliente SIN pedidos activos → Crear turno en backend
        const turno = await turnosApi.create({
          numero: `T${Date.now() % 10000}`,
          estado: 'en_cola',
          clienteId: parseInt(userId),
          pedidoId: null
        });

        if (turno) {
          // Crear notificación en backend
          await notificacionesApi.create({
            mensaje: `Nuevo turno asignado a ${userName}`,
            clienteId: parseInt(userId),
            leida: false
          });
          toast.dismiss('geo-check');
          toast.success('¡Ubicación confirmada! Te hemos asignado un turno de atención');
        } else {
          throw new Error('No se pudo crear el turno');
        }
      }

      // Cerrar modal y confirmar
      onOpenChange(false);
      onConfirmar();
    } catch (error) {
      console.error('Error en Ya Estoy Aquí:', error);
      toast.dismiss('geo-check');
      toast.error('Error al procesar tu solicitud. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ya estoy aquí
          </DialogTitle>
          <DialogDescription>
            Para asignarte un turno necesitamos verificar tu ubicación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Card de Geolocalización */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Geolocalización</h3>
                <p className="text-sm text-blue-700">
                  Activa tu ubicación para confirmar que estás en el negocio y recibir tu turno de atención
                </p>
              </div>
            </div>

            {/* ¿Por qué necesitamos tu ubicación? */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">¿Por qué necesitamos tu ubicación?</p>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Verificar que estás en el negocio</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Asignarte un turno de forma automática</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">Optimizar los tiempos de espera</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de privacidad */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Tu ubicación solo se usa para este servicio y no se almacena
            </p>
          </div>

          {/* Mensaje del navegador */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Tu navegador te pedirá permiso para acceder a tu ubicación. Acepta para continuar.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
              disabled={procesando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivarUbicacion}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={procesando}
            >
              {procesando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              {procesando ? 'Procesando...' : 'Activar ubicación'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}