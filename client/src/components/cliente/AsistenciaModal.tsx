import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, PhoneCall, Wrench, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AsistenciaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onIrAPerfil: () => void;
  numeroAseguradora?: string | null;
}

export function AsistenciaModal({ 
  isOpen, 
  onOpenChange, 
  onIrAPerfil,
  numeroAseguradora 
}: AsistenciaModalProps) {
  
  // Datos del taller (estos deberían venir de la configuración)
  const tallerInfo = {
    nombre: 'Taller 360',
    telefono: '+34 912 345 678',
    whatsapp: '+34 612 345 678',
    direccion: 'Calle Principal 123, Madrid',
    horario: 'Lun-Vie: 8:00-20:00 | Sáb: 9:00-14:00'
  };

  const handleLlamarTaller = () => {
    window.location.href = `tel:${tallerInfo.telefono}`;
    toast.success(`Llamando a ${tallerInfo.nombre}...`);
    onOpenChange(false);
  };

  const handleWhatsAppTaller = () => {
    const mensaje = encodeURIComponent('Hola, necesito asistencia');
    window.open(`https://wa.me/${tallerInfo.whatsapp.replace(/\s/g, '')}?text=${mensaje}`, '_blank');
    toast.success('Abriendo WhatsApp...');
    onOpenChange(false);
  };

  const handleLlamarAseguradora = () => {
    if (numeroAseguradora) {
      window.location.href = `tel:${numeroAseguradora}`;
      toast.success('Llamando a tu aseguradora...');
      onOpenChange(false);
    } else {
      toast.error('Número de aseguradora no configurado');
    }
  };

  const handleIrAPerfil = () => {
    onOpenChange(false);
    onIrAPerfil();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Asistencia 24/7
              </DialogTitle>
              <DialogDescription>
                Contacta rápidamente para obtener ayuda
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Alerta de emergencia */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              <strong>Para emergencias graves, llama al 112.</strong>
            </AlertDescription>
          </Alert>

          {/* Opción 1: Llamar al Taller */}
          <Card className="border-teal-200 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {tallerInfo.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Contacto directo con nuestro taller para averías, consultas técnicas o asistencia inmediata
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneCall className="w-4 h-4" />
                      <span>{tallerInfo.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{tallerInfo.direccion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{tallerInfo.horario}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleLlamarTaller}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Llamar ahora
                    </Button>
                    <Button
                      onClick={handleWhatsAppTaller}
                      variant="outline"
                      className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opción 2: Aseguradora */}
          <Card className={
            numeroAseguradora 
              ? "border-blue-200 hover:shadow-md transition-shadow" 
              : "border-gray-200 bg-gray-50"
          }>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  numeroAseguradora ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <PhoneCall className={`w-6 h-6 ${numeroAseguradora ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${numeroAseguradora ? 'text-gray-900' : 'text-gray-500'}`} 
                      style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Asistencia en Carretera (Aseguradora)
                  </h3>
                  
                  {numeroAseguradora ? (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Servicio de grúa y asistencia en carretera 24 horas proporcionado por tu aseguradora
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <PhoneCall className="w-4 h-4" />
                        <span>{numeroAseguradora}</span>
                      </div>
                      <Button
                        onClick={handleLlamarAseguradora}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Llamar a aseguradora
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-3">
                        Para acceder a la asistencia en carretera, configura el número de teléfono de tu aseguradora en tu perfil
                      </p>
                      <Button
                        onClick={handleIrAPerfil}
                        variant="outline"
                        className="w-full"
                      >
                        Configurar aseguradora
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 Recomendación:</strong> Guarda estos números en tu agenda para tener acceso rápido en caso de emergencia.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
