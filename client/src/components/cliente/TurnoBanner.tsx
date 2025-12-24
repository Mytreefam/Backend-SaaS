import { Button } from '../ui/button';
import { Clock, Users, Info } from 'lucide-react';
import { Card } from '../ui/card';

interface TurnoData {
  numero: string;
  personasEspera: number;
  tiempoEstimado: string;
}

interface TurnoBannerProps {
  turno: TurnoData;
  onVerDetalles: () => void;
}

export function TurnoBanner({ turno, onVerDetalles }: TurnoBannerProps) {
  return (
    <Card className="bg-gradient-to-r from-teal-600 to-teal-700 border-0 shadow-lg mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Icono y Turno */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-white" />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              {/* Tu turno actual */}
              <div>
                <p className="text-xs text-teal-100">Tu turno actual</p>
                <p className="text-3xl font-bold text-white tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {turno.numero}
                </p>
              </div>

              {/* Separador vertical (solo desktop) */}
              <div className="hidden sm:block w-px h-12 bg-white/30" />

              {/* En espera y Tiempo estimado */}
              <div className="flex gap-4 sm:gap-6">
                {/* En espera */}
                <div>
                  <p className="text-xs text-teal-100">En espera</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-white" />
                    <p className="text-lg font-semibold text-white">
                      {turno.personasEspera} {turno.personasEspera === 1 ? 'persona' : 'personas'}
                    </p>
                  </div>
                </div>

                {/* Tiempo estimado */}
                <div>
                  <p className="text-xs text-teal-100">Tiempo estimado</p>
                  <p className="text-lg font-semibold text-white">
                    ~{turno.tiempoEstimado}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Ver detalles */}
          <Button
            onClick={onVerDetalles}
            variant="outline"
            className="bg-white hover:bg-teal-50 text-teal-700 border-white shrink-0"
          >
            <Info className="w-4 h-4 mr-2" />
            Ver detalles
          </Button>
        </div>
      </div>
    </Card>
  );
}
