import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, Clock, Calendar, Sparkles, UserPlus } from 'lucide-react';
import { PersonalRRHH } from './PersonalRRHH';
import { GestionFichajes } from './GestionFichajes';
import { GestionHorarios } from './GestionHorarios';
import { DashboardOnboarding } from './DashboardOnboarding';
import { InvitacionesPendientes } from './InvitacionesPendientes';
import { authApi } from '../../services/api/auth.api';

/**
 * Equipo y RRHH (Gerente)
 *
 * Este módulo se simplificó para eliminar dependencias de `client/src/data/*`
 * (mocks) y concentrar el flujo en vistas conectadas al backend:
 * - PersonalRRHH: empleados + estadísticas
 * - GestionFichajes: fichajes
 * - GestionHorarios: plantillas + asignaciones + solicitudes
 * - DashboardOnboarding: onboarding/estado
 * - InvitacionesPendientes: invitaciones
 */
export function EquipoRRHH() {
  const currentUser = authApi.getCurrentUser();
  const gerenteId = currentUser?.id ? String(currentUser.id) : 'GER-001';
  const gerenteNombre = currentUser?.nombre || currentUser?.name || 'Gerente';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Equipo y RRHH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gestión de equipo conectada al backend (empleados, fichajes, horarios, onboarding e invitaciones).
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="equipo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="equipo" className="gap-2">
            <Users className="w-4 h-4" />
            Equipo
          </TabsTrigger>
          <TabsTrigger value="fichajes" className="gap-2">
            <Clock className="w-4 h-4" />
            Fichajes
          </TabsTrigger>
          <TabsTrigger value="horarios" className="gap-2">
            <Calendar className="w-4 h-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="invitaciones" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invitaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipo">
          <PersonalRRHH />
        </TabsContent>

        <TabsContent value="fichajes">
          <GestionFichajes />
        </TabsContent>

        <TabsContent value="horarios">
          <GestionHorarios gerenteId={gerenteId} gerenteNombre={gerenteNombre} />
        </TabsContent>

        <TabsContent value="onboarding">
          <DashboardOnboarding />
        </TabsContent>

        <TabsContent value="invitaciones">
          <InvitacionesPendientes />
        </TabsContent>
      </Tabs>
    </div>
  );
}

