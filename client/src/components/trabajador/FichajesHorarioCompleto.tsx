/**
 * 📋 FICHAJES Y HORARIO - VISTA COMPLETA
 * 
 * Componente unificado que incluye:
 * - Tab 1: Fichaje (reloj, historial, consumos)
 * - Tab 2: Horario (horario semanal y solicitudes)
 */

import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Clock, Calendar } from 'lucide-react';
import { FichajeColaborador, FichajeColaboradorRef } from '../FichajeColaborador';
import { HorarioTrabajador } from './HorarioTrabajador';

interface FichajesHorarioCompletoProps {
  trabajadorId: string;
  trabajadorNombre: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  onFichajeChange?: (fichado: boolean) => void;
}

export interface FichajesHorarioCompletoRef {
  // Métodos del fichaje que pueden ser llamados externamente
  estaFichado: () => boolean;
  abrirModalFichaje: () => void;
  fichajarSalida: () => void;
}

export const FichajesHorarioCompleto = forwardRef<FichajesHorarioCompletoRef, FichajesHorarioCompletoProps>(
  ({ trabajadorId, trabajadorNombre, puntoVentaId, puntoVentaNombre, onFichajeChange }, ref) => {
    const [activeTab, setActiveTab] = useState('fichaje');
    const fichajeRef = useRef<FichajeColaboradorRef>(null);
    
    // Exponer métodos del FichajeColaborador hacia afuera
    useImperativeHandle(ref, () => ({
      estaFichado: () => fichajeRef.current?.estaFichado() || false,
      abrirModalFichaje: () => fichajeRef.current?.abrirModalFichaje(),
      fichajarSalida: () => fichajeRef.current?.fichajarSalida(),
    }));
    
    const handleFichajeChange = (fichado: boolean) => {
      console.log('[FICHAJES_HORARIO] Estado de fichaje cambió:', fichado);
      if (onFichajeChange) {
        onFichajeChange(fichado);
      }
    };
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Fichajes y Horario</h2>
          <p className="text-muted-foreground">
            Control de jornada laboral y tareas operativas
          </p>
        </div>
        
        {/* Tabs principales - Solo Fichaje y Tareas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fichaje" className="gap-2">
              <Clock className="h-4 w-4" />
              Fichaje
            </TabsTrigger>
            <TabsTrigger value="horario" className="gap-2">
              <Calendar className="h-4 w-4" />
              Horario
            </TabsTrigger>
          </TabsList>
          
          {/* TAB 1: FICHAJE */}
          <TabsContent value="fichaje" className="space-y-4">
            <FichajeColaborador 
              ref={fichajeRef} 
              onFichajeChange={handleFichajeChange}
            />
          </TabsContent>
          
          {/* TAB 2: HORARIO */}
          <TabsContent value="horario" className="space-y-4">
            <HorarioTrabajador
              trabajadorId={trabajadorId}
              trabajadorNombre={trabajadorNombre}
              puntoVentaId={puntoVentaId}
              puntoVentaNombre={puntoVentaNombre}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);

FichajesHorarioCompleto.displayName = 'FichajesHorarioCompleto';