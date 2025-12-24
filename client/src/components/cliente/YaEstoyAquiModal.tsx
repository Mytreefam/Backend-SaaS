import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { MapPin, Check, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { obtenerPedidosCliente, validarGeolocalizacion } from '../../services/pedidos.service';
import { crearTurnoSinPedido } from '../../services/turnos-sin-pedido.service';

interface YaEstoyAquiModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: () => void;
  userId: string;
  userName: string;
  userPhone?: string;
}

export function YaEstoyAquiModal({ isOpen, onOpenChange, onConfirmar, userId, userName, userPhone }: YaEstoyAquiModalProps) {
  const handleActivarUbicacion = () => {
    // DEMO: Simular asignación de turno sin geolocalización real
    toast.loading('Verificando tu ubicación...', { duration: 1000 });
    
    setTimeout(() => {
      // Marcar pedidos activos del cliente como "cliente presente"
      const pedidosCliente = obtenerPedidosCliente(userId);
      const pedidosActivos = pedidosCliente.filter(p => 
        (p.estado === 'pendiente' || p.estado === 'en_preparacion' || p.estado === 'listo') && 
        p.origenPedido === 'app'
      );

      if (pedidosActivos.length > 0) {
        // ✅ CASO 1: Cliente con pedidos activos
        // Validar geolocalización de todos los pedidos activos
        pedidosActivos.forEach(pedido => {
          validarGeolocalizacion(pedido.id);
        });

        // Crear notificación para el TPV
        const notificacionTPV = {
          id: `geo-${Date.now()}`,
          tipo: 'cliente_presente',
          clienteNombre: pedidosActivos[0].cliente.nombre,
          codigoPedido: pedidosActivos[0].codigo,
          timestamp: new Date().toISOString(),
          leida: false
        };
        
        const notificacionesTPV = JSON.parse(localStorage.getItem('notificaciones_tpv') || '[]');
        notificacionesTPV.unshift(notificacionTPV);
        localStorage.setItem('notificaciones_tpv', JSON.stringify(notificacionesTPV));
        
        toast.success('¡Ubicación confirmada! Tus pedidos están marcados como presentes');
      } else {
        // ✅ CASO 2: Cliente SIN pedidos activos → Crear turno sin pedido
        const turno = crearTurnoSinPedido({
          clienteId: userId,
          clienteNombre: userName,
          clienteTelefono: userPhone,
          motivo: 'otro'
        });

        // Crear notificación para el TPV
        const notificacionTPV = {
          id: `turno-${Date.now()}`,
          tipo: 'turno_sin_pedido',
          clienteNombre: userName,
          turnoId: turno.id,
          timestamp: new Date().toISOString(),
          leida: false
        };
        
        const notificacionesTPV = JSON.parse(localStorage.getItem('notificaciones_tpv') || '[]');
        notificacionesTPV.unshift(notificacionTPV);
        localStorage.setItem('notificaciones_tpv', JSON.stringify(notificacionesTPV));

        toast.success('¡Ubicación confirmada! Te hemos asignado un turno de atención');
      }
      
      // Cerrar modal y confirmar
      onOpenChange(false);
      onConfirmar();
    }, 1200);
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

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivarUbicacion}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Activar ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}