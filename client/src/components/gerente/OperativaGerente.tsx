import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ClipboardList,
  Calendar,
  Users
} from 'lucide-react';
import { GestionTareasOperativas } from './GestionTareasOperativas';
import { GestionHorarios } from './GestionHorarios';
import { authApi, gerenteConfigApi } from '../../services/api';
import { useEffect, useState } from 'react';

export function OperativaGerente() {
  const [empresaId, setEmpresaId] = useState('HOYPCM000');
  const [empresaNombre, setEmpresaNombre] = useState('Empresa');
  const user = authApi.getCurrentUser();
  const gerenteId = String(user?.id ?? '');
  const gerenteNombre = String((user as any)?.nombre || user?.name || 'Gerente');

  useEffect(() => {
    let cancelled = false;
    gerenteConfigApi.empresas
      .list()
      .then((list) => {
        if (cancelled) return;
        const first = (list || [])[0] as any;
        if (first?.id) setEmpresaId(String(first.id));
        if (first?.nombreFiscal) setEmpresaNombre(String(first.nombreFiscal));
        else if (first?.nombreComercial) setEmpresaNombre(String(first.nombreComercial));
      })
      .catch(() => {
        // fallback to defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
            gerenteId={gerenteId}
            gerenteNombre={gerenteNombre}
            empresaId={empresaId}
            empresaNombre={empresaNombre}
          />
        </TabsContent>

        {/* TAB 2: HORARIOS */}
        <TabsContent value="horarios">
          <GestionHorarios
            empresaId={empresaId}
            gerenteId={gerenteId}
            gerenteNombre={gerenteNombre}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}