import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Car,
  CheckCircle2,
  Calendar,
  Gauge,
  Wrench,
  Plus,
  LifeBuoy
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { DocumentacionVehiculo } from './DocumentacionVehiculo';

interface MiGarajeProps {
  onNavigateToPerfil?: () => void;
}

export function MiGaraje({ onNavigateToPerfil }: MiGarajeProps = {}) {
  const [vehiculoActivo, setVehiculoActivo] = useState<number | null>(1);

  const vehiculos = [
    {
      id: 1,
      marca: 'Ford',
      modelo: 'Focus',
      ano: 2019,
      matricula: 'ABC1234',
      km: 45000,
      proximaRevision: '15 días',
      color: 'Azul',
      imagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'
    },
    {
      id: 2,
      marca: 'Volkswagen',
      modelo: 'Golf',
      ano: 2021,
      matricula: 'XYZ5678',
      km: 28000,
      proximaRevision: '45 días',
      color: 'Gris',
      imagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'
    }
  ];

  const handleActivarVehiculo = (vehiculoId: number) => {
    setVehiculoActivo(vehiculoId);
    toast.success('Vehículo activado. El catálogo se filtrará para este vehículo.');
  };

  const handleAnadirVehiculo = () => {
    toast.info('Abriendo formulario para añadir vehículo...');
  };

  return (
    <div className="space-y-6">
      {/* Botón añadir vehículo */}
      <Button 
        className="w-full bg-teal-600 hover:bg-teal-700"
        onClick={handleAnadirVehiculo}
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir Vehículo
      </Button>

      {/* Listado de vehículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehiculos.map((vehiculo) => (
          <Card 
            key={vehiculo.id} 
            className={`overflow-hidden ${
              vehiculoActivo === vehiculo.id 
                ? 'border-2 border-teal-600 shadow-lg' 
                : 'border border-gray-200'
            }`}
          >
            {/* Imagen del vehículo */}
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
              {vehiculoActivo === vehiculo.id && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-teal-600 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                </div>
              )}
              <Car className="w-20 h-20 text-gray-400" />
            </div>

            <CardContent className="p-5 space-y-4">
              {/* Info principal */}
              <div>
                <h3 className="mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {vehiculo.marca} {vehiculo.modelo}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{vehiculo.ano}</span>
                  <span>•</span>
                  <span>{vehiculo.color}</span>
                  <span>•</span>
                  <span>{vehiculo.matricula}</span>
                </div>
                
                {/* Link contextual a Asistencia */}
                <button
                  onClick={() => toast.info('Abriendo asistencia 24/7...')}
                  className="flex items-center gap-1.5 mt-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span className="underline underline-offset-2">Solicitar asistencia</span>
                </button>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Kilometraje</span>
                  </div>
                  <p className="font-medium text-blue-900">
                    {vehiculo.km.toLocaleString()} km
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-gray-600">Próxima Revisión</span>
                  </div>
                  <p className="font-medium text-orange-900">
                    {vehiculo.proximaRevision}
                  </p>
                </div>
              </div>

              {/* Documentación del vehículo */}
              <DocumentacionVehiculo 
                vehiculoId={vehiculo.id.toString()} 
                onNavigateToPerfil={onNavigateToPerfil}
              />

              {/* Botones de acción */}
              {vehiculoActivo !== vehiculo.id ? (
                <Button 
                  variant="outline" 
                  className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                  onClick={() => handleActivarVehiculo(vehiculo.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Activar Vehículo
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}