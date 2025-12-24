/**
 * 📅 GESTIÓN DE HORARIOS - GERENTE
 * Integración con Web Services de Horarios y Turnos
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import gerenteApi from '../../services/api/gerente.api';

interface GestionHorariosProps {
  gerenteId: string;
  gerenteNombre: string;
}

interface Horario {
  id: number;
  nombre: string;
  descripcion?: string;
  lunes?: string;
  martes?: string;
  miercoles?: string;
  jueves?: string;
  viernes?: string;
  sabado?: string;
  domingo?: string;
  horasSemana: number;
  activo: boolean;
}

interface Empleado {
  id: number;
  nombre: string;
  email: string;
  puesto: string;
}

export function GestionHorarios({ gerenteId, gerenteNombre }: GestionHorariosProps) {
  const [activeTab, setActiveTab] = useState('horarios');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para crear horario
  const [modalCrearHorario, setModalCrearHorario] = useState(false);
  const [nombreHorario, setNombreHorario] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lunes, setLunes] = useState('');
  const [martes, setMartes] = useState('');
  const [miercoles, setMiercoles] = useState('');
  const [jueves, setJueves] = useState('');
  const [viernes, setViernes] = useState('');
  const [sabado, setSabado] = useState('');
  const [domingo, setDomingo] = useState('');
  const [horasSemana, setHorasSemana] = useState('40');

  // Estados para asignar horario a empleado
  const [modalAsignarHorario, setModalAsignarHorario] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState('');
  const [fechaVigenciaDesde, setFechaVigenciaDesde] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [horariosData, empleadosData] = await Promise.all([
        gerenteApi.horarios.obtenerHorarios('EMP-001'),
        gerenteApi.empleados.obtenerEmpleados()
      ]);
      
      setHorarios(horariosData || []);
      setEmpleados(empleadosData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearHorario = async () => {
    if (!nombreHorario || !lunes) {
      toast.error('Completa al menos el nombre y el horario de lunes');
      return;
    }

    try {
      await gerenteApi.horarios.crearHorario({
        nombre: nombreHorario,
        descripcion,
        empresaId: 'EMP-001',
        lunes: lunes || null,
        martes: martes || null,
        miercoles: miercoles || null,
        jueves: jueves || null,
        viernes: viernes || null,
        sabado: sabado || null,
        domingo: domingo || null,
        horasSemana: parseFloat(horasSemana) || 40
      });

      toast.success('Horario creado correctamente');
      setModalCrearHorario(false);
      
      // Reset form
      setNombreHorario('');
      setDescripcion('');
      setLunes('');
      setMartes('');
      setMiercoles('');
      setJueves('');
      setViernes('');
      setSabado('');
      setDomingo('');
      setHorasSemana('40');

      cargarDatos();
    } catch (error) {
      console.error('Error al crear horario:', error);
      toast.error('Error al crear el horario');
    }
  };

  const handleAsignarHorario = async () => {
    if (!empleadoSeleccionado || !horarioSeleccionado || !fechaVigenciaDesde) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      await gerenteApi.horarios.asignarHorarioAEmpleado(
        parseInt(empleadoSeleccionado),
        { 
          horarioId: parseInt(horarioSeleccionado),
          fechaVigenciaDesde: fechaVigenciaDesde
        }
      );

      toast.success('Horario asignado correctamente');
      setModalAsignarHorario(false);
      setEmpleadoSeleccionado('');
      setHorarioSeleccionado('');
      setFechaVigenciaDesde('');
      cargarDatos();
    } catch (error) {
      console.error('Error al asignar horario:', error);
      toast.error('Error al asignar el horario');
    }
  };

  const rellenarDiasSemana = () => {
    if (lunes) {
      setMartes(lunes);
      setMiercoles(lunes);
      setJueves(lunes);
      setViernes(lunes);
    }
  };

  // Calcs estadisticas
  const turnosConfirmados = horarios.filter(h => h.activo).length;
  const turnosPendientes = 0; // Por ahora
  const totalTurnos = horarios.length;

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solicitudes Totales</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Turnos Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{turnosConfirmados}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Turnos Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{turnosPendientes}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Turnos</p>
                <p className="text-2xl font-bold">{totalTurnos}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-white border-b">
          <TabsTrigger value="horarios" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Solicitudes
          </TabsTrigger>
        </TabsList>

        {/* TAB: HORARIOS */}
        <TabsContent value="horarios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Plantillas de Horarios</h3>
            <Button onClick={() => setModalCrearHorario(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Turno
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">Cargando horarios...</p>
              </CardContent>
            </Card>
          ) : horarios.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No hay turnos asignados para esta semana</p>
                  <Button onClick={() => setModalCrearHorario(true)}>
                    Crear Primer Turno
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {horarios.map((horario) => (
                <Card key={horario.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{horario.nombre}</CardTitle>
                        {horario.descripcion && (
                          <CardDescription className="mt-1">{horario.descripcion}</CardDescription>
                        )}
                      </div>
                      <Badge variant={horario.activo ? 'default' : 'secondary'}>
                        {horario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      {horario.lunes && (
                        <p><span className="font-semibold">L-V:</span> {horario.lunes}</p>
                      )}
                      {horario.sabado && (
                        <p><span className="font-semibold">S:</span> {horario.sabado}</p>
                      )}
                      {horario.domingo && (
                        <p><span className="font-semibold">D:</span> {horario.domingo}</p>
                      )}
                      <p className="text-gray-600 mt-2">
                        {horario.horasSemana}h/semana
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Sección de asignar turno */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>+ Asignar Turno</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Asigna turnos existentes a los empleados del equipo
              </p>
              <Button variant="outline" className="w-full" onClick={() => setModalAsignarHorario(true)}>
                Gestionar Asignaciones
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SOLICITUDES */}
        <TabsContent value="solicitudes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Cambio</CardTitle>
              <CardDescription>
                Gestiona las solicitudes de cambio de turno de los empleados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay solicitudes pendientes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Asignar Horario */}
      <Dialog open={modalAsignarHorario} onOpenChange={setModalAsignarHorario}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Horario a Empleado</DialogTitle>
            <DialogDescription>
              Vincula un horario a un empleado del equipo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Seleccionar Empleado */}
            <div className="space-y-2">
              <Label htmlFor="empleado-select">Empleado *</Label>
              <Select value={empleadoSeleccionado} onValueChange={setEmpleadoSeleccionado}>
                <SelectTrigger id="empleado-select" className="w-full">
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {empleados.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay empleados disponibles</div>
                  ) : (
                    empleados.map((empleado) => (
                      <SelectItem key={empleado.id} value={empleado.id.toString()}>
                        {empleado.nombre} - {empleado.puesto}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Seleccionar Horario */}
            <div className="space-y-2">
              <Label htmlFor="horario-select">Horario *</Label>
              <Select value={horarioSeleccionado} onValueChange={setHorarioSeleccionado}>
                <SelectTrigger id="horario-select" className="w-full">
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {horarios.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay horarios disponibles</div>
                  ) : (
                    horarios.map((horario) => (
                      <SelectItem key={horario.id} value={horario.id.toString()}>
                        {horario.nombre}
                        {horario.descripcion && ` - ${horario.descripcion}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de Vigencia */}
            <div className="space-y-2">
              <Label htmlFor="fecha-vigencia">Fecha de Vigencia *</Label>
              <Input
                id="fecha-vigencia"
                type="date"
                value={fechaVigenciaDesde}
                onChange={(e) => setFechaVigenciaDesde(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAsignarHorario(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAsignarHorario}>
              Asignar Horario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Crear Horario */}
      <Dialog open={modalCrearHorario} onOpenChange={setModalCrearHorario}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Horario</DialogTitle>
            <DialogDescription>
              Define una plantilla de horario reutilizable para asignar a empleados
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nombre */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="nombre">Nombre del Horario *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Turno Mañana"
                value={nombreHorario}
                onChange={(e) => setNombreHorario(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                placeholder="Ej: Horario de mañana"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Horas por semana */}
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="horasSemana">Horas por Semana</Label>
              <Input
                id="horasSemana"
                type="number"
                min="0"
                max="48"
                value={horasSemana}
                onChange={(e) => setHorasSemana(e.target.value)}
              />
            </div>

            {/* Horarios por día */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">Horarios por Día (formato HH:mm-HH:mm)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="lunes">Lunes *</Label>
                  <Input
                    id="lunes"
                    placeholder="08:00-14:00"
                    value={lunes}
                    onChange={(e) => setLunes(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="martes">Martes</Label>
                  <Input
                    id="martes"
                    placeholder="08:00-14:00"
                    value={martes}
                    onChange={(e) => setMartes(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="miercoles">Miércoles</Label>
                  <Input
                    id="miercoles"
                    placeholder="08:00-14:00"
                    value={miercoles}
                    onChange={(e) => setMiercoles(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="jueves">Jueves</Label>
                  <Input
                    id="jueves"
                    placeholder="08:00-14:00"
                    value={jueves}
                    onChange={(e) => setJueves(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="viernes">Viernes</Label>
                  <Input
                    id="viernes"
                    placeholder="08:00-14:00"
                    value={viernes}
                    onChange={(e) => setViernes(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sabado">Sábado</Label>
                  <Input
                    id="sabado"
                    placeholder="08:00-14:00"
                    value={sabado}
                    onChange={(e) => setSabado(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="domingo">Domingo</Label>
                  <Input
                    id="domingo"
                    placeholder="08:00-14:00"
                    value={domingo}
                    onChange={(e) => setDomingo(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={rellenarDiasSemana}
              >
                Rellenar todos los días con el horario de lunes
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCrearHorario(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearHorario}>
              Crear Horario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
