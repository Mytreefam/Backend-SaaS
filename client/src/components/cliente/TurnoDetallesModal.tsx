import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, Users, MapPin, Phone, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface TurnoData {
  numero: string;
  personasEspera: number;
  tiempoEstimado: string;
}

interface TurnoDetallesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  turno: TurnoData;
  onCancelarTurno: () => void;
}

export function TurnoDetallesModal({ isOpen, onOpenChange, turno, onCancelarTurno }: TurnoDetallesModalProps) {
  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar tu turno?')) {
      onCancelarTurno();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute -top-2 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <DialogTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Detalles del turno
          </DialogTitle>
          <DialogDescription>
            Información sobre tu turno de espera y tiempo estimado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Tu turno actual - Grande */}
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-teal-700 mb-2">Tu turno actual</p>
              <p className="text-6xl font-bold text-teal-900 tracking-wider mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {turno.numero}
              </p>
              <Badge className="bg-teal-600 text-white">
                <Clock className="w-3 h-3 mr-1" />
                En espera
              </Badge>
            </CardContent>
          </Card>

          {/* Información de espera */}
          <div className="grid grid-cols-2 gap-3">
            {/* Personas en espera */}
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{turno.personasEspera}</p>
                <p className="text-sm text-gray-600">
                  {turno.personasEspera === 1 ? 'Persona' : 'Personas'} delante
                </p>
              </CardContent>
            </Card>

            {/* Tiempo estimado */}
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">~{turno.tiempoEstimado}</p>
                <p className="text-sm text-gray-600">Tiempo estimado</p>
              </CardContent>
            </Card>
          </div>

          {/* Información del negocio */}
          <Card className="border-gray-200">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Can Farines
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <p className="text-gray-600">Calle del Café, 123, Barcelona</p>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <a href="tel:+34912345678" className="text-teal-600 hover:underline">
                    +34 912 345 678
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensaje informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              Te avisaremos cuando sea tu turno. Mantén la app abierta para recibir notificaciones.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCancelar}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              Cancelar turno
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}