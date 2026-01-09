import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  Calendar, 
  Plus, 
  Eye,
  CheckCircle,
  Circle,
  PlayCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { empleadosApi } from '../../services/api/gerente.api';

interface Empleado {
  id: string;
  nombre: string;
  foto: string;
  puesto: 'Panadero' | 'Cajero' | 'Repartidor';
  desempeño: number;
  horasMes: string;
  estado: 'activo' | 'inactivo';
  ultimoFichaje: string;
  horaEntrada?: string;
  horaSalida?: string;
}

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'completada' | 'en-progreso' | 'pendiente';
  fechaAsignacion: string;
}

interface Curso {
  id: string;
  nombre: string;
  duracion: string;
  estado: 'realizado' | 'en-progreso' | 'no-realizado';
}

interface Fichaje {
  id: string;
  empleadoNombre: string;
  empleadoId: string;
  puntoVenta: string;
  tipologia: 'Entrada' | 'Salida' | 'Descanso';
  horateorica: string; // Horario estipulado por el gerente
  fichajeReal: string; // Hora real que fichó
  fecha: string;
  ajusteMinutos: number; // Calculado automáticamente
}

export function PersonalRRHH() {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<string | null>(null);
  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarNuevoEmpleado, setMostrarNuevoEmpleado] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', email: '', puesto: '', telefono: '' });
  const [creandoEmpleado, setCreandoEmpleado] = useState(false);
  const [errorEmpleado, setErrorEmpleado] = useState('');
  const [empleadoCreado, setEmpleadoCreado] = useState<{nombre: string, email: string, password: string} | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  // Cargar empleados y estadísticas al montar
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const [empleadosData, statsData] = await Promise.all([
          empleadosApi.obtenerEmpleados(),
          empleadosApi.obtenerEstadisticas()
        ]);
        
        // Mapear datos de la API al formato del componente
        const empleadosMapeados = empleadosData.map(emp => ({
          id: emp.id,
          nombre: emp.nombre,
          foto: emp.foto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.nombre}`,
          puesto: emp.puesto as 'Panadero' | 'Cajero' | 'Repartidor',
          desempeño: emp.desempeno || 0,
          horasMes: emp.horas_mes || '0h',
          estado: emp.estado as 'activo' | 'inactivo',
          ultimoFichaje: new Date().toISOString(),
          horaEntrada: emp.horario_entrada,
          horaSalida: emp.horario_salida
        }));
        
        setEmpleados(empleadosMapeados);
        setEstadisticas(statsData);
      } catch (error) {
        console.error('Error cargando datos de empleados:', error);
        // Fallback a datos mock si falla
        setEmpleados(empleadosMock);
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, []);

  // Datos mock como fallback
  const empleadosMock: Empleado[] = [
    { 
      id: '1', 
      nombre: 'Carlos Ruiz', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      puesto: 'Panadero', 
      desempeño: 94, 
      horasMes: '160h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-14T09:00:00',
      horaEntrada: '09:00',
      horaSalida: '17:00'
    },
    { 
      id: '2', 
      nombre: 'Ana López', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      puesto: 'Panadero', 
      desempeño: 88, 
      horasMes: '152h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-14T17:00:00',
      horaEntrada: '17:00',
      horaSalida: '01:00'
    },
    { 
      id: '3', 
      nombre: 'María García', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      puesto: 'Cajero', 
      desempeño: 92, 
      horasMes: '156h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-14T10:00:00',
      horaEntrada: '10:00',
      horaSalida: '18:00'
    },
    { 
      id: '4', 
      nombre: 'Laura Sánchez', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      puesto: 'Cajero', 
      desempeño: 85, 
      horasMes: '148h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-14T18:00:00',
      horaEntrada: '18:00',
      horaSalida: '02:00'
    },
    { 
      id: '5', 
      nombre: 'Javier Torres', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
      puesto: 'Repartidor', 
      desempeño: 89, 
      horasMes: '158h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-14T12:00:00',
      horaEntrada: '12:00',
      horaSalida: '20:00'
    },
    { 
      id: '6', 
      nombre: 'Pedro Martínez', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      puesto: 'Repartidor', 
      desempeño: 91, 
      horasMes: '162h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-14T20:00:00',
      horaEntrada: '20:00',
      horaSalida: '04:00'
    },
    { 
      id: '7', 
      nombre: 'Carmen Díaz', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmen',
      puesto: 'Panadero', 
      desempeño: 87, 
      horasMes: '155h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-13T09:00:00',
      horaEntrada: '09:00',
      horaSalida: '17:00'
    },
    { 
      id: '8', 
      nombre: 'Roberto Fernández', 
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
      puesto: 'Repartidor', 
      desempeño: 93, 
      horasMes: '164h', 
      estado: 'activo',
      ultimoFichaje: '2025-11-13T12:00:00',
      horaEntrada: '12:00',
      horaSalida: '20:00'
    },
  ];

  // Tareas asignadas por empleado
  const tareasEmpleados: { [key: string]: Tarea[] } = {
    '1': [
      { 
        id: 'T1', 
        titulo: 'Preparación de masas frescas', 
        descripcion: 'Preparar 50 masas para bollería',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T2', 
        titulo: 'Revisión de horno principal', 
        descripcion: 'Verificar temperatura y limpieza',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T3', 
        titulo: 'Capacitación nuevo empleado', 
        descripcion: 'Enseñar técnicas de amasado',
        estado: 'en-progreso',
        fechaAsignacion: '2025-11-14'
      },
    ],
    '2': [
      { 
        id: 'T4', 
        titulo: 'Preparación de ingredientes', 
        descripcion: 'Cortar vegetales y preparar toppings',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T5', 
        titulo: 'Control de calidad pizzas', 
        descripcion: 'Revisar todas las pizzas antes de servir',
        estado: 'en-progreso',
        fechaAsignacion: '2025-11-14'
      },
    ],
    '3': [
      { 
        id: 'T6', 
        titulo: 'Apertura de caja', 
        descripcion: 'Verificar fondo de caja y preparar terminal',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T7', 
        titulo: 'Atención pedidos telefónicos', 
        descripcion: 'Gestionar llamadas y registrar pedidos',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T8', 
        titulo: 'Cierre de turno', 
        descripcion: 'Cuadrar caja y generar reporte',
        estado: 'pendiente',
        fechaAsignacion: '2025-11-14'
      },
    ],
    '4': [
      { 
        id: 'T9', 
        titulo: 'Gestión pedidos online', 
        descripcion: 'Procesar pedidos de plataformas digitales',
        estado: 'en-progreso',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T10', 
        titulo: 'Atención al cliente presencial', 
        descripcion: 'Recibir y gestionar pedidos en local',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
    ],
    '5': [
      { 
        id: 'T11', 
        titulo: 'Entregas zona norte', 
        descripcion: '12 entregas programadas',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T12', 
        titulo: 'Revisión de vehículo', 
        descripcion: 'Verificar combustible y estado de moto',
        estado: 'completada',
        fechaAsignacion: '2025-11-14'
      },
    ],
    '6': [
      { 
        id: 'T13', 
        titulo: 'Entregas zona sur', 
        descripcion: '15 entregas programadas',
        estado: 'en-progreso',
        fechaAsignacion: '2025-11-14'
      },
      { 
        id: 'T14', 
        titulo: 'Repostaje de vehículo', 
        descripcion: 'Llenar tanque y guardar recibo',
        estado: 'pendiente',
        fechaAsignacion: '2025-11-14'
      },
    ],
    '7': [
      { 
        id: 'T15', 
        titulo: 'Elaboración pizzas especiales', 
        descripcion: 'Preparar pizzas del menú gourmet',
        estado: 'completada',
        fechaAsignacion: '2025-11-13'
      },
      { 
        id: 'T16', 
        titulo: 'Limpieza área de trabajo', 
        descripcion: 'Mantener estación de trabajo higiénica',
        estado: 'completada',
        fechaAsignacion: '2025-11-13'
      },
    ],
    '8': [
      { 
        id: 'T17', 
        titulo: 'Entregas zona centro', 
        descripcion: '18 entregas programadas',
        estado: 'completada',
        fechaAsignacion: '2025-11-13'
      },
      { 
        id: 'T18', 
        titulo: 'Mantenimiento básico moto', 
        descripcion: 'Revisar presión de neumáticos y aceite',
        estado: 'completada',
        fechaAsignacion: '2025-11-13'
      },
    ],
  };

  // Función para calcular el ajuste en minutos
  const calcularAjuste = (horateorica: string, fichajeReal: string, tipologia: 'Entrada' | 'Salida' | 'Descanso'): number => {
    const [hTeoricaH, hTeoricaM] = horateorica.split(':').map(Number);
    const [hRealH, hRealM] = fichajeReal.split(':').map(Number);
    
    const minutosTeoricos = hTeoricaH * 60 + hTeoricaM;
    const minutosReales = hRealH * 60 + hRealM;
    
    const diferencia = minutosReales - minutosTeoricos;
    
    if (tipologia === 'Entrada') {
      // Si ficha ANTES de la hora teórica de entrada → ajuste = 0
      // Si ficha DESPUÉS de la hora teórica de entrada → añadir minutos de retraso
      return diferencia > 0 ? diferencia : 0;
    } else if (tipologia === 'Salida') {
      // Si ficha ANTES de la hora teórica de salida → añadir minutos de salida anticipada
      // Si ficha DESPUÉS de la hora teórica de salida → ajuste = 0
      return diferencia < 0 ? Math.abs(diferencia) : 0;
    } else {
      // Para descansos, siempre 0 (puede ajustarse según la lógica que necesites)
      return 0;
    }
  };

  // Fichajes mock - Registros de entradas/salidas/descansos
  const fichajesMock: Fichaje[] = [
    {
      id: 'F1',
      empleadoNombre: 'Carlos Ruiz',
      empleadoId: '1',
      puntoVenta: 'Tiana',
      tipologia: 'Entrada',
      horateorica: '09:00',
      fichajeReal: '09:05',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F2',
      empleadoNombre: 'Carlos Ruiz',
      empleadoId: '1',
      puntoVenta: 'Tiana',
      tipologia: 'Salida',
      horateorica: '17:00',
      fichajeReal: '16:50',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F3',
      empleadoNombre: 'Ana López',
      empleadoId: '2',
      puntoVenta: 'Montgat',
      tipologia: 'Entrada',
      horateorica: '17:00',
      fichajeReal: '17:15',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F4',
      empleadoNombre: 'Ana López',
      empleadoId: '2',
      puntoVenta: 'Montgat',
      tipologia: 'Descanso',
      horateorica: '21:00',
      fichajeReal: '21:05',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F5',
      empleadoNombre: 'María García',
      empleadoId: '3',
      puntoVenta: 'Tiana',
      tipologia: 'Entrada',
      horateorica: '10:00',
      fichajeReal: '09:55',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F6',
      empleadoNombre: 'María García',
      empleadoId: '3',
      puntoVenta: 'Tiana',
      tipologia: 'Salida',
      horateorica: '18:00',
      fichajeReal: '18:10',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F7',
      empleadoNombre: 'Laura Sánchez',
      empleadoId: '4',
      puntoVenta: 'Montgat',
      tipologia: 'Entrada',
      horateorica: '18:00',
      fichajeReal: '18:20',
      fecha: '2025-11-28',
      ajusteMinutos: 0
    },
    {
      id: 'F8',
      empleadoNombre: 'Javier Torres',
      empleadoId: '5',
      puntoVenta: 'Tiana',
      tipologia: 'Entrada',
      horateorica: '12:00',
      fichajeReal: '11:50',
      fecha: '2025-11-28',
      ajusteMinutos: 0
    },
    {
      id: 'F9',
      empleadoNombre: 'Javier Torres',
      empleadoId: '5',
      puntoVenta: 'Tiana',
      tipologia: 'Salida',
      horateorica: '20:00',
      fichajeReal: '19:45',
      fecha: '2025-11-28',
      ajusteMinutos: 0
    },
    {
      id: 'F10',
      empleadoNombre: 'Pedro Martínez',
      empleadoId: '6',
      puntoVenta: 'Montgat',
      tipologia: 'Entrada',
      horateorica: '20:00',
      fichajeReal: '20:30',
      fecha: '2025-11-27',
      ajusteMinutos: 0
    },
  ];

  // Calcular ajustes para cada fichaje
  fichajesMock.forEach(fichaje => {
    fichaje.ajusteMinutos = calcularAjuste(fichaje.horateorica, fichaje.fichajeReal, fichaje.tipologia);
  });

  // Cursos disponibles
  const cursos: Curso[] = [
    { id: 'C1', nombre: 'Manipulación de Alimentos', duracion: '8h', estado: 'realizado' },
    { id: 'C2', nombre: 'Seguridad e Higiene', duracion: '6h', estado: 'realizado' },
    { id: 'C3', nombre: 'Atención al Cliente', duracion: '4h', estado: 'en-progreso' },
    { id: 'C4', nombre: 'Técnicas de Venta', duracion: '5h', estado: 'no-realizado' },
    { id: 'C5', nombre: 'Primeros Auxilios', duracion: '10h', estado: 'en-progreso' },
  ];

  // Formación por empleado
  const formacionEmpleados: { [key: string]: { [key: string]: 'realizado' | 'en-progreso' | 'no-realizado' } } = {
    '1': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'en-progreso', 'C4': 'no-realizado', 'C5': 'realizado' },
    '2': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'realizado', 'C4': 'no-realizado', 'C5': 'en-progreso' },
    '3': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'realizado', 'C4': 'en-progreso', 'C5': 'no-realizado' },
    '4': { 'C1': 'realizado', 'C2': 'en-progreso', 'C3': 'realizado', 'C4': 'no-realizado', 'C5': 'no-realizado' },
    '5': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'no-realizado', 'C4': 'no-realizado', 'C5': 'realizado' },
    '6': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'en-progreso', 'C4': 'no-realizado', 'C5': 'en-progreso' },
    '7': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'realizado', 'C4': 'en-progreso', 'C5': 'realizado' },
    '8': { 'C1': 'realizado', 'C2': 'realizado', 'C3': 'no-realizado', 'C4': 'no-realizado', 'C5': 'realizado' },
  };

  const getPuestoColor = (puesto: string) => {
    switch (puesto) {
      case 'Panadero':
        return 'bg-orange-500 text-white';
      case 'Cajero':
        return 'bg-blue-500 text-white';
      case 'Repartidor':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getEstadoCursoBadge = (estado: string) => {
    switch (estado) {
      case 'realizado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Realizado</Badge>;
      case 'en-progreso':
        return <Badge className="bg-yellow-100 text-yellow-800"><PlayCircle className="w-3 h-3 mr-1" />En progreso</Badge>;
      case 'no-realizado':
        return <Badge className="bg-gray-100 text-gray-600"><Circle className="w-3 h-3 mr-1" />No realizado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getEstadoTareaBadge = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      case 'en-progreso':
        return <Badge className="bg-yellow-100 text-yellow-800">En progreso</Badge>;
      case 'pendiente':
        return <Badge className="bg-gray-100 text-gray-600">Pendiente</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerTareas = (empleadoId: string) => {
    setEmpleadoSeleccionado(empleadoId);
    setMostrarTareas(true);
  };

  const empleadoActual = empleados.find(e => e.id === empleadoSeleccionado);
  const tareasActuales = empleadoSeleccionado ? tareasEmpleados[empleadoSeleccionado] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Personal y RR.HH.
          </h2>
          <p className="text-gray-600 text-sm">
            Gestión de equipo y desempeño
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setMostrarNuevoEmpleado(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Empleados Activos</p>
                <p className="text-gray-900 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {empleados.filter(e => e.estado === 'activo').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Horas Totales (Mes)</p>
                <p className="text-gray-900 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  1,255h
                </p>
              </div>
              <Clock className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Desempeño Promedio</p>
                <p className="text-gray-900 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {Math.round(empleados.reduce((acc, e) => acc + e.desempeño, 0) / empleados.length)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En Formación</p>
                <p className="text-gray-900 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {empleados.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="equipo">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="equipo">Equipo</TabsTrigger>
          <TabsTrigger value="fichajes">Fichajes</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="desempeno">Desempeño</TabsTrigger>
          <TabsTrigger value="formacion">Formación</TabsTrigger>
          <TabsTrigger value="permisos">Permisos/Altas-Bajas</TabsTrigger>
        </TabsList>

        {/* Tab: Equipo */}
        <TabsContent value="equipo" className="space-y-4 mt-6">
          {empleados.map((emp) => (
            <Card key={emp.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={emp.foto} alt={emp.nombre} />
                      <AvatarFallback>
                        {emp.nombre.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {emp.nombre}
                      </h3>
                      <Badge className={getPuestoColor(emp.puesto)}>{emp.puesto}</Badge>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <Badge className="bg-green-100 text-green-800">
                          Desempeño: {emp.desempeño}%
                        </Badge>
                        <span className="text-gray-600">{emp.horasMes} este mes</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Ficha
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab: Fichajes */}
        <TabsContent value="fichajes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Registro de Fichajes
              </CardTitle>
              <CardDescription>
                Control de entradas, salidas y descansos del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Equipo</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Punto de Venta</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Tipología</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Hora Teórica</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Fichaje Real</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichajesMock.map((fichaje) => {
                      const empleado = empleados.find(e => e.id === fichaje.empleadoId);
                      return (
                        <tr key={fichaje.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {empleado && (
                                <>
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={empleado.foto} alt={fichaje.empleadoNombre} />
                                    <AvatarFallback>
                                      {fichaje.empleadoNombre.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm text-gray-900">{fichaje.empleadoNombre}</p>
                                    <Badge className={`${getPuestoColor(empleado.puesto)} text-xs`}>
                                      {empleado.puesto}
                                    </Badge>
                                  </div>
                                </>
                              )}
                              {!empleado && (
                                <p className="text-sm text-gray-900">{fichaje.empleadoNombre}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">{fichaje.puntoVenta}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={
                                fichaje.tipologia === 'Entrada' 
                                  ? 'bg-green-100 text-green-800'
                                  : fichaje.tipologia === 'Salida'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-orange-100 text-orange-800'
                              }
                            >
                              {fichaje.tipologia}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-700">
                              {new Date(fichaje.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-700">{fichaje.horateorica}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">{fichaje.fichajeReal}</span>
                          </td>
                          <td className="py-4 px-4">
                            {fichaje.ajusteMinutos === 0 ? (
                              <Badge className="bg-gray-100 text-gray-600">
                                0 min
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800">
                                +{fichaje.ajusteMinutos} min
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Resumen de ajustes */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-700">Total Ajustes</p>
                        <p className="text-2xl text-amber-900">
                          {fichajesMock.reduce((acc, f) => acc + f.ajusteMinutos, 0)} min
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">Fichajes Puntuales</p>
                        <p className="text-2xl text-green-900">
                          {fichajesMock.filter(f => f.ajusteMinutos === 0).length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-700">Con Ajustes</p>
                        <p className="text-2xl text-red-900">
                          {fichajesMock.filter(f => f.ajusteMinutos > 0).length}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Turnos */}
        <TabsContent value="turnos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Control de Turnos
              </CardTitle>
              <CardDescription>
                Gestión de turnos del personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Empleado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Puesto</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Último Fichaje</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Hora Entrada</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Hora Salida</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Horas Mes</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50 transition-colors">
                        {/* Empleado */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={emp.foto} alt={emp.nombre} />
                              <AvatarFallback>
                                {emp.nombre.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{emp.nombre}</p>
                              <p className="text-xs text-gray-500">{emp.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Puesto */}
                        <td className="py-4 px-4 text-center">
                          <Badge className={getPuestoColor(emp.puesto)}>{emp.puesto}</Badge>
                        </td>

                        {/* Último Fichaje */}
                        <td className="py-4 px-4 text-center">
                          <div>
                            <p className="text-sm text-gray-900">{formatFecha(emp.ultimoFichaje)}</p>
                            <p className="text-xs text-gray-500">{formatHora(emp.ultimoFichaje)}</p>
                          </div>
                        </td>

                        {/* Hora Entrada */}
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="border-green-500 text-green-700">
                            {emp.horaEntrada}
                          </Badge>
                        </td>

                        {/* Hora Salida */}
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="border-red-500 text-red-700">
                            {emp.horaSalida}
                          </Badge>
                        </td>

                        {/* Horas Mes */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-teal-600">{emp.horasMes}</span>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 text-center">
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Desempeño */}
        <TabsContent value="desempeno" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Evaluación de Desempeño
              </CardTitle>
              <CardDescription>
                Métricas de rendimiento del equipo • Haz clic en un empleado para ver sus tareas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Empleado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Puesto</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">% Desempeño</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Horas Mes</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleVerTareas(emp.id)}
                      >
                        {/* Empleado */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={emp.foto} alt={emp.nombre} />
                              <AvatarFallback>
                                {emp.nombre.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{emp.nombre}</p>
                              <p className="text-xs text-gray-500">{emp.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Puesto */}
                        <td className="py-4 px-4 text-center">
                          <Badge className={getPuestoColor(emp.puesto)}>{emp.puesto}</Badge>
                        </td>

                        {/* % Desempeño */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  emp.desempeño >= 90 ? 'bg-green-600' : 
                                  emp.desempeño >= 75 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${emp.desempeño}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-900 min-w-[45px]">
                              {emp.desempeño}%
                            </span>
                          </div>
                        </td>

                        {/* Horas Mes */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-teal-600">{emp.horasMes}</span>
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerTareas(emp.id);
                            }}
                          >
                            Ver Tareas
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Formación */}
        <TabsContent value="formacion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Programas de Formación
              </CardTitle>
              <CardDescription>
                Estado de cursos y capacitaciones del equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resumen de cursos */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {cursos.map((curso) => (
                  <Card key={curso.id} className="border-2 border-teal-200">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-900 font-medium">{curso.nombre}</p>
                        <p className="text-xs text-gray-500">{curso.duracion}</p>
                        {getEstadoCursoBadge(curso.estado)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tabla de formación por empleado */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Empleado</th>
                      {cursos.map((curso) => (
                        <th key={curso.id} className="text-center py-3 px-4 text-sm text-gray-600">
                          {curso.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empleados.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50 transition-colors">
                        {/* Empleado */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={emp.foto} alt={emp.nombre} />
                              <AvatarFallback>
                                {emp.nombre.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{emp.nombre}</p>
                              <Badge className={getPuestoColor(emp.puesto)} variant="outline">
                                {emp.puesto}
                              </Badge>
                            </div>
                          </div>
                        </td>

                        {/* Estado de cada curso */}
                        {cursos.map((curso) => (
                          <td key={curso.id} className="py-4 px-4 text-center">
                            {getEstadoCursoBadge(formacionEmpleados[emp.id][curso.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Permisos */}
        <TabsContent value="permisos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Gestión de Permisos y Altas/Bajas
              </CardTitle>
              <CardDescription>
                Solicitudes de permisos, cambios de turno y gestión de altas/bajas laborales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Empleado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Tipo de Solicitud</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Detalles</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Fecha Solicitud</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Estado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Días de Permiso */}
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" alt="Carlos Ruiz" />
                            <AvatarFallback>CR</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">Carlos Ruiz</p>
                            <p className="text-xs text-gray-500">Pizzero</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-blue-600 text-white">Días de Permiso</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <p>3 días • 18-20 Nov 2025</p>
                          <p className="text-xs text-gray-500 mt-1">Motivo: Asuntos personales</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">12 nov, 2025</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                            Aprobar
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Cambio de Turno */}
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" alt="María García" />
                            <AvatarFallback>MG</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">María García</p>
                            <p className="text-xs text-gray-500">Cajero</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-purple-600 text-white">Cambio de Turno</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <p>16 Nov: Tarde → Mañana</p>
                          <p className="text-xs text-gray-500 mt-1">Cambio con: Ana López</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">13 nov, 2025</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                            Aprobar
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Baja Laboral */}
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Javier" alt="Javier Torres" />
                            <AvatarFallback>JT</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">Javier Torres</p>
                            <p className="text-xs text-gray-500">Repartidor</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-red-600 text-white">Baja Laboral</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <p>7 días • 15-21 Nov 2025</p>
                          <p className="text-xs text-gray-500 mt-1">Motivo: Enfermedad común</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">14 nov, 2025</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>

                    {/* Alta Laboral */}
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Laura" alt="Laura Sánchez" />
                            <AvatarFallback>LS</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">Laura Sánchez</p>
                            <p className="text-xs text-gray-500">Cajero</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-green-600 text-white">Alta Laboral</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <p>Regreso: 15 Nov 2025</p>
                          <p className="text-xs text-gray-500 mt-1">Tras baja por enfermedad</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">14 nov, 2025</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-green-100 text-green-800">Procesada</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>

                    {/* Días de Permiso 2 */}
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" alt="Pedro Martínez" />
                            <AvatarFallback>PM</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">Pedro Martínez</p>
                            <p className="text-xs text-gray-500">Repartidor</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-blue-600 text-white">Días de Permiso</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <p>1 día • 22 Nov 2025</p>
                          <p className="text-xs text-gray-500 mt-1">Motivo: Cita médica</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">13 nov, 2025</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>

                    {/* Cambio de Turno 2 */}
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" alt="Ana López" />
                            <AvatarFallback>AL</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">Ana López</p>
                            <p className="text-xs text-gray-500">Pizzero</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-purple-600 text-white">Cambio de Turno</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          <p>17 Nov: Noche → Tarde</p>
                          <p className="text-xs text-gray-500 mt-1">Cambio con: Carmen Díaz</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">11 nov, 2025</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Motivo
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Tareas Asignadas */}
            {/* Modal Nuevo Empleado */}
            <Dialog open={mostrarNuevoEmpleado} onOpenChange={setMostrarNuevoEmpleado}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Crear nuevo empleado
                  </DialogTitle>
                  <DialogDescription>
                    Completa los datos para invitar y activar un nuevo empleado. Se enviará una invitación por email.
                  </DialogDescription>
                </DialogHeader>
                {empleadoCreado ? (
                  <div className="space-y-4 mt-4">
                    <div className="text-green-700 text-lg font-semibold">¡Empleado creado exitosamente!</div>
                    <div className="bg-gray-100 rounded p-4">
                      <div><span className="font-medium">Nombre:</span> {empleadoCreado.nombre}</div>
                      <div><span className="font-medium">Email:</span> {empleadoCreado.email}</div>
                      <div><span className="font-medium">Contraseña inicial:</span> <span className="font-mono">{empleadoCreado.password}</span></div>
                      <div className="text-xs text-gray-500 mt-2">Pide al empleado que cambie su contraseña tras el primer acceso.</div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button type="button" className="bg-teal-600 hover:bg-teal-700" onClick={() => { setMostrarNuevoEmpleado(false); setEmpleadoCreado(null); }}>
                        Cerrar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form
                    className="space-y-4 mt-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setCreandoEmpleado(true);
                      setErrorEmpleado('');
                      try {
                        // Aquí deberías llamar a la API real
                        const res = await empleadosApi.crearEmpleado(nuevoEmpleado);
                        setEmpleadoCreado({
                          nombre: res.nombre || nuevoEmpleado.nombre,
                          email: res.email || nuevoEmpleado.email,
                          password: res.password || 'udar2026'
                        });
                        setNuevoEmpleado({ nombre: '', email: '', puesto: '', telefono: '' });
                      } catch (err) {
                        setErrorEmpleado('Error al crear empleado. Verifica los datos o intenta de nuevo.');
                      } finally {
                        setCreandoEmpleado(false);
                      }
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={nuevoEmpleado.nombre}
                        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={nuevoEmpleado.email}
                        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Puesto</label>
                      <select
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={nuevoEmpleado.puesto}
                        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, puesto: e.target.value })}
                      >
                        <option value="">Selecciona puesto</option>
                        <option value="Panadero">Panadero</option>
                        <option value="Cajero">Cajero</option>
                        <option value="Repartidor">Repartidor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        value={nuevoEmpleado.telefono}
                        onChange={e => setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })}
                      />
                    </div>
                    {errorEmpleado && (
                      <div className="text-red-600 text-sm">{errorEmpleado}</div>
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={() => setMostrarNuevoEmpleado(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={creandoEmpleado}>
                        {creandoEmpleado ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                        Crear empleado
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
      <Dialog open={mostrarTareas} onOpenChange={setMostrarTareas}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Tareas Asignadas - {empleadoActual?.nombre}
            </DialogTitle>
            <DialogDescription>
              {empleadoActual?.puesto} • {tareasActuales.length} tareas asignadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {tareasActuales.length > 0 ? (
              tareasActuales.map((tarea) => (
                <Card key={tarea.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{tarea.titulo}</h4>
                          {getEstadoTareaBadge(tarea.estado)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{tarea.descripcion}</p>
                        <p className="text-xs text-gray-500">
                          Asignada: {formatFecha(tarea.fechaAsignacion)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay tareas asignadas a este empleado
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}