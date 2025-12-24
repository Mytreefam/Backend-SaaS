import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CalendarDays, Clock, MapPin, User, Package, Calendar as CalendarIcon, List } from 'lucide-react';
import { AñadirMaterialModal } from './AñadirMaterialModal';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';

export function AgendaTrabajador() {
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Turno del colaborador
  const turnoActual = {
    tipo: 'Turno Tarde',
    horario: '14:00 - 22:00',
    dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    descanso: ['Sábado', 'Domingo']
  };

  const eventos = [
    {
      id: 1,
      titulo: 'Turno de Cocina - Pizzas',
      descripcion: 'Preparación de pizzas en horno principal',
      fecha: '15 Nov 2025',
      hora: '14:00',
      duracion: '4h',
      lugar: 'Cocina - Estación Pizzas',
      tipo: 'turno'
    },
    {
      id: 2,
      titulo: 'Atención al Cliente',
      descripcion: 'Servicio en mostrador y caja',
      fecha: '15 Nov 2025',
      hora: '18:00',
      duracion: '2h',
      lugar: 'Área de Atención',
      tipo: 'turno'
    },
    {
      id: 3,
      titulo: 'Inventario Semanal',
      descripcion: 'Conteo de materia prima y reposición',
      fecha: '16 Nov 2025',
      hora: '14:30',
      duracion: '1.5h',
      lugar: 'Almacén',
      tipo: 'tarea'
    },
    {
      id: 4,
      titulo: 'Formación: Nuevas Recetas',
      descripcion: 'Capacitación sobre pizza prosciutto y carbonara',
      fecha: '17 Nov 2025',
      hora: '09:00',
      duracion: '2h',
      lugar: 'Sala de Capacitación',
      tipo: 'formacion'
    },
    {
      id: 5,
      titulo: 'Limpieza Profunda',
      descripcion: 'Limpieza de hornos y área de preparación',
      fecha: '18 Nov 2025',
      hora: '21:00',
      duracion: '1h',
      lugar: 'Cocina',
      tipo: 'limpieza'
    }
  ];

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; className: string }> = {
      turno: { label: 'Turno', className: 'bg-blue-100 text-blue-700' },
      tarea: { label: 'Tarea', className: 'bg-teal-100 text-teal-700' },
      formacion: { label: 'Formación', className: 'bg-purple-100 text-purple-700' },
      limpieza: { label: 'Limpieza', className: 'bg-orange-100 text-orange-700' }
    };
    const badge = tipos[tipo] || tipos.tarea;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const abrirModalMaterial = (evento: any) => {
    setEventoSeleccionado(evento);
    setMaterialModalOpen(true);
  };

  const handleMaterialRegistrado = (material: any) => {
    console.log('Material registrado desde agenda:', material);
    toast.success('Material registrado correctamente');
    setEventoSeleccionado(null);
  };

  return (
    <div className="space-y-6">
      {/* Turno Actual */}
      <Card className="border-l-4 border-l-teal-600">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {turnoActual.tipo}
              </h3>
              <p className="text-gray-600">Tu horario de trabajo</p>
            </div>
            <Badge className="bg-teal-600 text-white">Activo</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Horario</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <p className="font-medium">{turnoActual.horario}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Días Laborables</p>
              <p className="font-medium">{turnoActual.dias.join(', ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Días de Descanso</p>
              <p className="font-medium text-green-600">{turnoActual.descanso.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para filtros */}
      <Tabs defaultValue="proximos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10">
          <TabsTrigger value="proximos" className="text-xs sm:text-sm">
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
            Próximos Eventos
          </TabsTrigger>
          <TabsTrigger value="calendario">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendario
          </TabsTrigger>
        </TabsList>

        {/* Tab: Próximos Eventos */}
        <TabsContent value="proximos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Mi Agenda - Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventos.map((evento) => (
                <div key={evento.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTipoBadge(evento.tipo)}
                        <span className="text-sm text-gray-500">
                          {evento.fecha} • {evento.hora}
                        </span>
                      </div>
                      <h3 className="font-medium mb-1">{evento.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-2">{evento.descripcion}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Duración: {evento.duracion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{evento.lugar}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalles
                    </Button>
                    {(evento.tipo === 'turno' || evento.tipo === 'tarea') && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => abrirModalMaterial(evento)}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Añadir material
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Calendario */}
        <TabsContent value="calendario">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Vista de Calendario */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={es}
                />
                {selectedDate && (
                  <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                    <p className="text-sm text-gray-600">Fecha seleccionada:</p>
                    <p className="font-medium text-teal-700">
                      {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eventos del día seleccionado */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Eventos del día
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {eventos.slice(0, 2).map((evento) => (
                  <div key={evento.id} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      {getTipoBadge(evento.tipo)}
                      <span className="text-sm text-gray-500">
                        {evento.hora}
                      </span>
                    </div>
                    <h3 className="font-medium mb-1">{evento.titulo}</h3>
                    <p className="text-sm text-gray-600">{evento.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{evento.lugar}</span>
                    </div>
                  </div>
                ))}
                {eventos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarDays className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay eventos para esta fecha</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal añadir material */}
      <AñadirMaterialModal
        isOpen={materialModalOpen}
        onOpenChange={setMaterialModalOpen}
        onMaterialRegistrado={handleMaterialRegistrado}
        tareaId={eventoSeleccionado?.id.toString()}
      />
    </div>
  );
}
