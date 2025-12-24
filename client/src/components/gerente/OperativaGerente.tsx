import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ClipboardList,
  Calendar,
  Users
} from 'lucide-react';
import { GestionTareasOperativas } from './GestionTareasOperativas';
import { GestionHorarios } from './GestionHorarios';

// Datos de ejemplo - En producción estos vendrán del contexto de usuario/empresa
const MOCK_DATA = {
  gerenteId: 'GER-001',
  gerenteNombre: 'María García',
  empresaId: 'EMP-001',
  empresaNombre: 'Disarmink S.L.',
};

export function OperativaGerente() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Operativa</h2>
        <p className="text-muted-foreground">
          Gestiona tareas y horarios del equipo
        </p>
      </div>

      {/* Tabs para separar Tareas y Horarios */}
      <Tabs defaultValue="tareas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tareas" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="horarios" className="gap-2">
            <Calendar className="h-4 w-4" />
            Horarios
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TAREAS */}
        <TabsContent value="tareas">
          <GestionTareasOperativas
            gerenteId={MOCK_DATA.gerenteId}
            gerenteNombre={MOCK_DATA.gerenteNombre}
            empresaId={MOCK_DATA.empresaId}
            empresaNombre={MOCK_DATA.empresaNombre}
          />
        </TabsContent>

        {/* TAB 2: HORARIOS */}
        <TabsContent value="horarios">
          <GestionHorarios
            gerenteId={MOCK_DATA.gerenteId}
            gerenteNombre={MOCK_DATA.gerenteNombre}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}