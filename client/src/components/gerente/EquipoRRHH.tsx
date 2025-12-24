import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronDown } from 'lucide-react';
import { 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  PUNTOS_VENTA_ARRAY,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca,
  getIconoMarca,
  EMPRESAS,
  MARCAS,
  PUNTOS_VENTA
} from '../../constants/empresaConfig';
import { 
  trabajadores, 
  obtenerTrabajadoresPorPDV,
  obtenerTrabajadoresPorMarca,
  obtenerTrabajadoresPorEmpresa,
  calcularNominaPDV,
  obtenerResumenPDV,
  obtenerHorasExtras,
  type Trabajador
} from '../../data/trabajadores';
import { 
  calcularAbsentismo,
  obtenerTrabajadoresAltoAbsentismo,
  calcularHorasTrabajadas,
  calcularDiasTrabajados,
  generarResumenFichajes,
  obtenerFichajesPendientesValidacion,
  validarFichaje,
  obtenerFichajesIncompletos,
  fichajes
} from '../../data/fichajes';
import { 
  obtenerDistribucionEfectiva,
  calcularNominaPDVConDistribucion,
  compararDistribuciones,
  establecerDistribucionManual,
  toggleDistribucionManual,
  obtenerTrabajadoresConDesviacion
} from '../../data/trabajadores-integracion-fichajes';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DashboardOnboarding } from './DashboardOnboarding';
import { GestionHorarios } from './GestionHorarios';
import { GestionFichajes } from './GestionFichajes';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TableFilters } from '../ui/table-filters';
import { SortableTableHead } from '../ui/sortable-table-head';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export-utils';
import { 
  Users, 
  Clock, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  TrendingUp,
  FileText,
  Plus,
  Filter,
  Download,
  FileDown,
  CalendarDays,
  Table as TableIcon,
  User,
  Shield,
  Edit,
  Eye,
  Image as ImageIcon,
  Trash2,
  IdCard,
  Home,
  Building2,
  CreditCard,
  Euro,
  Receipt,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  MessageCircle,
  Percent,
  ClipboardList,
  History,
  UserCheck,
  Upload,
  DollarSign,
  Award,
  CheckCircle,
  Coffee,
  UserPlus,
  Sparkles,
  Copy,
  Target,
  Lightbulb,
  Send,
  Save
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { Checkbox } from '../ui/checkbox';
import { ModalPermisosEmpleado } from './ModalPermisosEmpleado';
import { ModalInvitarEmpleado } from './ModalInvitarEmpleado';
import { empleadosApi } from '../../services/api/gerente.api';
import { InvitacionesPendientes } from './InvitacionesPendientes';

// Usar la interfaz Trabajador de /data/trabajadores.ts
// Ya no necesitamos duplicar la interfaz aquí

interface RegistroHorario {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: string;
  horaEntrada: string;
  horaSalida?: string;
  totalHoras?: number;
  tipo: 'regular' | 'extra' | 'nocturno';
}

interface SolicitudHoraExtra {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  totalHoras: number;
  motivo: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fechaSolicitud: string;
}

interface Incidencia {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  tipo: 'ausencia' | 'retraso' | 'falta' | 'otro';
  fecha: string;
  descripcion: string;
  estado: 'abierta' | 'resuelta' | 'en-revision';
  prioridad: 'baja' | 'media' | 'alta';
}

interface GastoEquipo {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  empleadoAvatar?: string;
  concepto: string;
  categoria: 'transporte' | 'comida' | 'alojamiento' | 'material' | 'formacion' | 'otros';
  importe: number;
  fecha: string;
  fechaSolicitud: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  justificante?: string;
  notas?: string;
}

interface CentroCoste {
  id: string;
  tipo: string;
  ubicacion: string;
  porcentaje: number;
}

interface Fichaje {
  id: string;
  empleadoNombre: string;
  empleadoId: string;
  empleadoAvatar?: string;
  empleadoPuesto: string;
  puntoVenta: string;
  tipologia: 'Entrada' | 'Salida' | 'Descanso';
  horateorica: string; // Horario estipulado por el gerente
  fichajeReal: string; // Hora real que fichó
  fecha: string;
  ajusteMinutos: number; // Calculado automáticamente
}

interface FichajeAgrupado {
  id: string;
  empleadoNombre: string;
  empleadoId: string;
  empleadoAvatar?: string;
  empleadoPuesto: string;
  puntoVenta: string;
  fecha: string;
  entradaTeorica: string;
  entradaReal: string;
  descansoTeorico?: string;
  descansoReal?: string;
  salidaTeorica: string;
  salidaReal: string;
  ajusteEntrada: number;
  ajusteDescanso: number;
  ajusteSalida: number;
  ajusteTotal: number;
}

export function EquipoRRHH() {
  // ⭐ NUEVO: Estado para cargar empleados desde API
  const [empleadosAPI, setEmpleadosAPI] = useState<Trabajador[]>([]);
  const [cargandoEmpleados, setCargandoEmpleados] = useState(true);
  
  // Cargar empleados desde API al inicializar
  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        setCargandoEmpleados(true);
        const datos = await empleadosApi.obtenerEmpleados();
        if (datos && Array.isArray(datos)) {
          setEmpleadosAPI(datos);
        }
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        toast.error('Error al cargar empleados');
      } finally {
        setCargandoEmpleados(false);
      }
    };
    
    cargarEmpleados();
  }, []);
  
  const [activeTab, setActiveTab] = useState('equipo');
  const [subTabEquipo, setSubTabEquipo] = useState<'listado' | 'centros-costes' | 'absentismo' | 'consumos-internos' | 'modificaciones'>('listado'); // ⭐ NUEVO
  const [subTabFichajes, setSubTabFichajes] = useState<'registros' | 'validacion'>('registros'); // ⭐ NUEVO
  const [subTabHorarios, setSubTabHorarios] = useState<'calendario' | 'control-horarios' | 'resumen-cumplimiento'>('calendario'); // ⭐ NUEVO
  const [vistaHorarios, setVistaHorarios] = useState<'tabla' | 'calendario'>('calendario');
  const [vistaCalendario, setVistaCalendario] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [ordenControlHorarios, setOrdenControlHorarios] = useState<{ columna: string; direccion: 'asc' | 'desc' }>({ columna: 'nombre', direccion: 'asc' }); // ⭐ NUEVO
  const [busquedaControlHorarios, setBusquedaControlHorarios] = useState(''); // ⭐ NUEVO
  const [semanaActual, setSemanaActual] = useState(new Date());
  const [modalAñadirEmpleado, setModalAñadirEmpleado] = useState(false);
  const [modalInvitarEmpleado, setModalInvitarEmpleado] = useState(false);
  const [modalVerPerfil, setModalVerPerfil] = useState(false);
  const [modalPermisos, setModalPermisos] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Trabajador | null>(null);
  
  // ⭐ NUEVO: Filtros multiempresa
  const [filtroEmpresaId, setFiltroEmpresaId] = useState<string>('');
  const [filtroMarcaId, setFiltroMarcaId] = useState<string>('');
  const [filtroPuntoVentaId, setFiltroPuntoVentaId] = useState<string>('');
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [tabPerfilActivo, setTabPerfilActivo] = useState('cuenta');
  const [darDeBaja, setDarDeBaja] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState('cocinero');
  const [modalResumenPermisos, setModalResumenPermisos] = useState(false);
  const [fichajeDetalle, setFichajeDetalle] = useState<string | null>(null);
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState<string[]>([]);
  const [permisosActivos, setPermisosActivos] = useState({
    // Acceso al sistema
    iniciar_sesion: true,
    ver_perfil: true,
    recibir_notificaciones: true,
    // Fichar horarios
    fichar_entrada_salida: true,
    ver_horas: true,
    ver_calendario: true,
    // Gestión de pedidos
    ver_pedidos: true,
    crear_pedido: false,
    editar_pedido: false,
    cambiar_estado_cocina: true,
    cambiar_estado_reparto: false,
    ver_metodo_pago: false,
    ver_costes_escandallo: false,
    // Gestión de equipo
    ver_empleados: false,
    ver_fichajes_equipo: false,
    cambiar_roles: false,
    invitar_trabajador: false
  });
  const [centrosCostes, setCentrosCostes] = useState<CentroCoste[]>([
    { id: '1', tipo: 'Tienda', ubicacion: 'Tienda Barcelona Centro', porcentaje: 70 },
    { id: '2', tipo: 'Tienda', ubicacion: 'Tienda Barcelona Sur', porcentaje: 30 }
  ]);
  const [documentosEmpleado] = useState([
    { id: 1, nombre: 'DNI', tipo: 'image/jpeg', fecha: '2024-03-15', size: '2.3 MB' },
    { id: 2, nombre: 'Cuenta Bancaria', tipo: 'application/pdf', fecha: '2024-03-10', size: '485 KB' },
    { id: 3, nombre: 'Vida Laboral', tipo: 'application/pdf', fecha: '2024-02-28', size: '1.1 MB' },
  ]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    tipoContrato: '',
    horasSemanales: '',
    dni: '',
    nss: '',
    direccion: '',
    fechaNacimiento: '',
    poblacionNacimiento: ''
  });
  const [modalModificaciones, setModalModificaciones] = useState(false);
  const [empleadoFiltro, setEmpleadoFiltro] = useState('');
  const [tipoModificacion, setTipoModificacion] = useState<'modificacion' | 'finalizacion' | 'remuneracion' | null>('modificacion');
  const [formModificacion, setFormModificacion] = useState({
    fechaInicio: '',
    nuevoHorario: '',
    nuevoSalario: '',
    motivoNovacion: ''
  });
  const [formFinalizacion, setFormFinalizacion] = useState({
    fechaFinalizacion: '',
    motivoFinalizacion: ''
  });
  const [formRemuneracion, setFormRemuneracion] = useState({
    motivo: '',
    euros: ''
  });

  // ⭐ NUEVO: Estados para Gestión de Turnos
  const [modalGestionTurnos, setModalGestionTurnos] = useState(false);
  const [stepGestionTurnos, setStepGestionTurnos] = useState<'config' | 'asignacion' | 'revision'>('config');
  const [periodoVentas, setPeriodoVentas] = useState<'semana-anterior' | 'personalizado'>('semana-anterior');
  const [fechaInicioVentas, setFechaInicioVentas] = useState('');
  const [fechaFinVentas, setFechaFinVentas] = useState('');
  const [objetivosPorDia, setObjetivosPorDia] = useState({
    lunes: '',
    martes: '',
    miercoles: '',
    jueves: '',
    viernes: '',
    sabado: '',
    domingo: ''
  });
  const [copiarDe, setCopiarDe] = useState<'ninguno' | 'semana-anterior' | 'mes-anterior' | 'plantilla'>('ninguno');
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [turnosAsignados, setTurnosAsignados] = useState<any[]>([]);
  const [estadoTurnos, setEstadoTurnos] = useState<'borrador' | 'publicado'>('borrador');
  const [filtroDisponibilidadPuesto, setFiltroDisponibilidadPuesto] = useState<string>('todos');
  const [filtroDisponibilidadEstado, setFiltroDisponibilidadEstado] = useState<string>('todos');
  const [modalHistorialVersiones, setModalHistorialVersiones] = useState(false);
  const [vistaImpresion, setVistaImpresion] = useState(false);
  const [filtroTurnosEmpresa, setFiltroTurnosEmpresa] = useState<string>('');
  const [filtroTurnosMarca, setFiltroTurnosMarca] = useState<string>('');
  const [filtroTurnosPDV, setFiltroTurnosPDV] = useState<string>('');
  const [filtroHistorialFechaDesde, setFiltroHistorialFechaDesde] = useState<string>('');
  const [filtroHistorialFechaHasta, setFiltroHistorialFechaHasta] = useState<string>('');
  const [notificarPublicacion, setNotificarPublicacion] = useState<boolean>(true);

  // Mock data para ventas
  const ventasSemanaAnterior = {
    lunes: 2450,
    martes: 2100,
    miercoles: 2350,
    jueves: 2800,
    viernes: 4200,
    sabado: 5100,
    domingo: 3200
  };

  // Mock data para comparativas de semanas anteriores
  const costesSemanasAnteriores = [
    { semana: 'Hace 3 semanas', horas: 265, coste: 3975, ventas: 21200, porcentaje: 18.7 },
    { semana: 'Hace 2 semanas', horas: 272, coste: 4080, ventas: 22800, porcentaje: 17.9 },
    { semana: 'Semana pasada', horas: 280, coste: 4200, ventas: 22000, porcentaje: 19.1 },
    { semana: 'Esta semana (plan)', horas: 280, coste: 4200, ventas: 22000, porcentaje: 19.0 }
  ];

  // Mock data para disponibilidad de empleados
  const disponibilidadEmpleados = [
    { id: 'TRB-001', nombre: 'Carlos Méndez García', puesto: 'Cocinero', estado: 'disponible', horasAsignadas: 32, maxHoras: 40, incidencias: [] },
    { id: 'TRB-002', nombre: 'Ana López Torres', puesto: 'Repartidor', estado: 'disponible', horasAsignadas: 28, maxHoras: 40, incidencias: [] },
    { id: 'TRB-003', nombre: 'Miguel Santos Ruiz', puesto: 'Cocinero', estado: 'vacaciones', horasAsignadas: 0, maxHoras: 40, incidencias: ['Vacaciones 25/11 - 02/12'] },
    { id: 'TRB-004', nombre: 'Laura Fernández Gil', puesto: 'Administrativo', estado: 'disponible', horasAsignadas: 35, maxHoras: 40, incidencias: [] },
    { id: 'TRB-005', nombre: 'David Martín Pérez', puesto: 'Repartidor', estado: 'baja', horasAsignadas: 0, maxHoras: 40, incidencias: ['Baja médica hasta 05/12'] },
    { id: 'TRB-006', nombre: 'Sara González Vega', puesto: 'Cocinero', estado: 'disponible', horasAsignadas: 38, maxHoras: 40, incidencias: ['Cerca del límite'] },
  ];

  // Mock data para historial de versiones de turnos
  const historialVersionesTurnos = [
    { 
      id: 'V-001', 
      version: 'v1.3',
      semana: 'Semana 48 (25/11 - 01/12)', 
      fechaPublicacion: '23/11/2024 14:35',
      publicadoPor: 'María García (Gerente)',
      estado: 'publicado',
      totalHoras: 280,
      totalEmpleados: 6,
      modificaciones: 'Ajuste en turno de Carlos el viernes'
    },
    { 
      id: 'V-002', 
      version: 'v1.2',
      semana: 'Semana 47 (18/11 - 24/11)', 
      fechaPublicacion: '16/11/2024 09:20',
      publicadoPor: 'María García (Gerente)',
      estado: 'publicado',
      totalHoras: 272,
      totalEmpleados: 6,
      modificaciones: 'Cambio de turno de David por baja médica'
    },
    { 
      id: 'V-003', 
      version: 'v1.1',
      semana: 'Semana 46 (11/11 - 17/11)', 
      fechaPublicacion: '09/11/2024 16:45',
      publicadoPor: 'María García (Gerente)',
      estado: 'publicado',
      totalHoras: 265,
      totalEmpleados: 6,
      modificaciones: 'Planificación inicial sin cambios'
    },
  ];

  // Filtrar empleados según filtros de disponibilidad
  const empleadosFiltrados = disponibilidadEmpleados.filter(emp => {
    const matchPuesto = filtroDisponibilidadPuesto === 'todos' || emp.puesto === filtroDisponibilidadPuesto;
    const matchEstado = filtroDisponibilidadEstado === 'todos' || emp.estado === filtroDisponibilidadEstado;
    return matchPuesto && matchEstado;
  });

  // Filtrar historial por fechas
  const historialFiltrado = historialVersionesTurnos.filter(version => {
    if (!filtroHistorialFechaDesde && !filtroHistorialFechaHasta) return true;
    
    // Convertir fecha del formato "23/11/2024 14:35" a Date
    const [fecha] = version.fechaPublicacion.split(' ');
    const [dia, mes, año] = fecha.split('/');
    const fechaVersion = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
    
    // Validar que fechaVersion es una fecha válida
    if (isNaN(fechaVersion.getTime())) return true;
    
    if (filtroHistorialFechaDesde && filtroHistorialFechaDesde.trim() !== '') {
      const fechaDesde = new Date(filtroHistorialFechaDesde);
      if (!isNaN(fechaDesde.getTime()) && fechaVersion < fechaDesde) return false;
    }
    
    if (filtroHistorialFechaHasta && filtroHistorialFechaHasta.trim() !== '') {
      const fechaHasta = new Date(filtroHistorialFechaHasta);
      if (!isNaN(fechaHasta.getTime()) && fechaVersion > fechaHasta) return false;
    }
    
    return true;
  });

  // Función para exportar historial a CSV
  const handleExportarHistorialCSV = () => {
    toast.success('📊 Generando CSV del historial...');
    
    // Preparar datos CSV
    const headers = ['Versión', 'Semana', 'Fecha Publicación', 'Publicado Por', 'Estado', 'Total Horas', 'Total Empleados', 'Media/Empleado', 'Modificaciones'];
    const rows = historialFiltrado.map(v => [
      v.version,
      v.semana,
      v.fechaPublicacion,
      v.publicadoPor,
      v.estado,
      v.totalHoras,
      v.totalEmpleados,
      Math.round(v.totalHoras / v.totalEmpleados),
      v.modificaciones || 'Sin modificaciones'
    ]);
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_turnos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      toast.success(`✅ CSV descargado: ${historialFiltrado.length} versiones exportadas`);
    }, 800);
  };

  // Función para exportar turnos
  const handleExportarTurnos = (formato: 'pdf' | 'excel') => {
    if (formato === 'pdf') {
      setVistaImpresion(true);
      toast.success('📄 Generando vista de impresión...');
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          setVistaImpresion(false);
          toast.success('PDF generado correctamente');
        }, 500);
      }, 500);
    } else {
      toast.success('📊 Generando Excel de turnos...');
      // Aquí iría la lógica de exportación a Excel
      setTimeout(() => {
        toast.success('Excel descargado: turnos_semana_48.xlsx');
      }, 1500);
    }
  };

  // ⭐ NUEVO: Handler para modificaciones de empleados
  const handleGuardarModificacion = async () => {
    if (!empleadoFiltro || !tipoModificacion) {
      toast.error('Por favor, selecciona un empleado y un tipo de modificación');
      return;
    }

    try {
      if (tipoModificacion === 'modificacion') {
        if (!formModificacion.fechaInicio) {
          toast.error('Por favor, ingresa la fecha de inicio');
          return;
        }
        await empleadosApi.crearModificacionContrato(empleadoFiltro, {
          fecha_inicio: formModificacion.fechaInicio,
          nuevo_salario: formModificacion.nuevoSalario ? parseFloat(formModificacion.nuevoSalario) : undefined,
          nuevas_funciones: formModificacion.nuevoHorario,
          motivo: formModificacion.motivoNovacion
        });
      } else if (tipoModificacion === 'finalizacion') {
        if (!formFinalizacion.fechaFinalizacion) {
          toast.error('Por favor, ingresa la fecha de finalización');
          return;
        }
        await empleadosApi.crearFinalizacionContrato(empleadoFiltro, {
          fecha_finalizacion: formFinalizacion.fechaFinalizacion,
          motivo: formFinalizacion.motivoFinalizacion
        });
      } else if (tipoModificacion === 'remuneracion') {
        if (!formRemuneracion.motivo || !formRemuneracion.euros) {
          toast.error('Por favor, completa todos los campos');
          return;
        }
        await empleadosApi.crearRemuneracion(empleadoFiltro, {
          motivo: formRemuneracion.motivo,
          importe: parseFloat(formRemuneracion.euros)
        });
      }
      
      setModalModificaciones(false);
    } catch (error) {
      console.error('Error al guardar modificación:', error);
      toast.error('Error al guardar la modificación');
    }
  };

  const handleAñadirEmpleado = async () => {
    // Solo validar nombre y email (campos obligatorios)
    if (!nuevoEmpleado.nombre?.trim() || !nuevoEmpleado.email?.trim()) {
      toast.error('Por favor, completa el nombre y email');
      return;
    }
    
    try {
      // ⭐ Llamar a API para crear empleado
      const empleadoCreado = await empleadosApi.crearEmpleado({
        nombre: nuevoEmpleado.nombre.trim(),
        apellidos: nuevoEmpleado.apellidos?.trim() || '',
        email: nuevoEmpleado.email.trim(),
        telefono: nuevoEmpleado.telefono?.trim() || '',
        tipo_contrato: nuevoEmpleado.tipoContrato || 'indefinido',
        horas_semanales: nuevoEmpleado.horasSemanales ? parseInt(nuevoEmpleado.horasSemanales) : 40,
        dni: nuevoEmpleado.dni?.trim() || '',
        nss: nuevoEmpleado.nss?.trim() || '',
        direccion: nuevoEmpleado.direccion?.trim() || '',
        fecha_nacimiento: nuevoEmpleado.fechaNacimiento || '',
        poblacion_nacimiento: nuevoEmpleado.poblacionNacimiento?.trim() || ''
      });

      if (empleadoCreado) {
        // Agregar a la lista local
        setEmpleadosAPI([...empleadosAPI, empleadoCreado]);
        toast.success(`Empleado ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellidos} añadido correctamente`);
      }
    } catch (error) {
      console.error('Error al añadir empleado:', error);
      toast.error('Error al crear el empleado');
      return;
    }

    setModalAñadirEmpleado(false);
    setNuevoEmpleado({ 
      nombre: '', 
      apellidos: '', 
      telefono: '', 
      email: '',
      tipoContrato: '',
      horasSemanales: '',
      dni: '',
      nss: '',
      direccion: '',
      fechaNacimiento: '',
      poblacionNacimiento: ''
    });
  };

  const handleAbrirChat = (trabajador: Trabajador) => {
    toast.info(`Abriendo chat con ${trabajador.nombre} ${trabajador.apellidos}`);
    // Aquí iría la lógica para abrir el chat
  };

  const handleVerPerfil = (trabajador: Trabajador) => {
    setEmpleadoSeleccionado(trabajador);
    setModalVerPerfil(true);
  };

  const handleAdministrarPermisos = (trabajador: Trabajador) => {
    setEmpleadoSeleccionado(trabajador);
    setModalPermisos(true);
  };

  const handleModificarContrato = (trabajador: Trabajador) => {
    setEmpleadoSeleccionado(trabajador);
    setTabPerfilActivo('cuenta');
    setModalVerPerfil(true);
  };

  const handleDescargarDocumento = (nombre: string) => {
    toast.success(`Descargando ${nombre}...`);
  };

  const handleEliminarDocumento = (id: number) => {
    toast.success('Documento eliminado correctamente');
  };

  const handleNotificarGestoria = () => {
    if (empleadoSeleccionado) {
      toast.success(`Notificación de baja enviada a Gestoría para ${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellidos}`);
    }
  };

  const handleAñadirCentroCoste = () => {
    const nuevoCentro: CentroCoste = {
      id: Date.now().toString(),
      tipo: 'Tienda',
      ubicacion: '',
      porcentaje: 0
    };
    setCentrosCostes([...centrosCostes, nuevoCentro]);
  };

  const handleEliminarCentroCoste = (id: string) => {
    setCentrosCostes(centrosCostes.filter(c => c.id !== id));
  };

  const handleActualizarCentroCoste = (id: string, campo: keyof CentroCoste, valor: string | number) => {
    setCentrosCostes(centrosCostes.map(c => 
      c.id === id ? { ...c, [campo]: valor } : c
    ));
  };

  const calcularTotalPorcentaje = () => {
    return centrosCostes.reduce((sum, c) => sum + Number(c.porcentaje), 0);
  };

  const porcentajeValido = () => {
    return calcularTotalPorcentaje() === 100;
  };

  // ⭐ NUEVO: Aplicar filtros a los trabajadores
  const trabajadoresFiltrados = useMemo(() => {
    // ⭐ PRIORIDAD: API > Mockups locales
    // Usar siempre datos de API si están cargados, incluso si está vacío
    let resultado = empleadosAPI && empleadosAPI.length > 0 
      ? [...empleadosAPI] 
      : (!cargandoEmpleados && empleadosAPI.length === 0) 
        ? [] // Si terminó de cargar y está vacío, mostrar vacío (no fallback a mockups)
        : [...trabajadores]; // Solo usar mockups mientras está cargando
    
    // Filtro por empresa
    if (filtroEmpresaId) {
      resultado = resultado.filter(t => t.empresaId === filtroEmpresaId);
    }
    
    // Filtro por marca
    if (filtroMarcaId) {
      resultado = resultado.filter(t => t.marcaId === filtroMarcaId);
    }
    
    // Filtro por punto de venta
    if (filtroPuntoVentaId) {
      resultado = resultado.filter(t => 
        t.puntoVentaId === filtroPuntoVentaId || 
        t.puntosVentaAsignados?.includes(filtroPuntoVentaId)
      );
    }
    
    // Filtro por departamento
    if (filtroDepartamento) {
      resultado = resultado.filter(t => t.departamento === filtroDepartamento);
    }
    
    // Filtro por estado
    if (filtroEstado) {
      resultado = resultado.filter(t => t.estado === filtroEstado);
    }
    
    return resultado;
  }, [empleadosAPI, filtroEmpresaId, filtroMarcaId, filtroPuntoVentaId, filtroDepartamento, filtroEstado]);
  
  // Alias para compatibilidad con código existente
  const empleados = trabajadoresFiltrados;

  // Handlers para exportación de Control de Horarios
  const handleExportControlHorarios = (format: 'csv' | 'excel' | 'pdf') => {
    const empleadosFiltradosBusqueda = empleados.filter(empleado => {
      if (!busquedaControlHorarios) return true;
      const searchTerm = busquedaControlHorarios.toLowerCase();
      const nombreCompleto = `${empleado.nombre} ${empleado.apellidos}`.toLowerCase();
      const pdv = PUNTOS_VENTA[empleado.puntoVentaId]?.nombre?.toLowerCase() || '';
      const puesto = empleado.puesto.toLowerCase();
      return nombreCompleto.includes(searchTerm) || pdv.includes(searchTerm) || puesto.includes(searchTerm);
    });

    const datosExportar = formatDataForExport(
      empleadosFiltradosBusqueda.map(e => {
        const horasTrabajadas = calcularHorasTrabajadas(e.id, 2025, 11);
        const horasExtras = obtenerHorasExtras().find(he => he.empleadoId === e.id);
        const cumplimiento = ((horasTrabajadas / e.horasContrato) * 100).toFixed(1);
        const retrasos = fichajes.filter(f => f.empleadoId === e.id && f.retraso && f.retraso > 0).length;
        
        return {
          empleado: `${e.nombre} ${e.apellidos}`,
          pdv: PUNTOS_VENTA[e.puntoVentaId]?.nombre || 'N/A',
          puesto: e.puesto,
          horasPlanificadas: e.horasContrato,
          horasTrabajadas: horasTrabajadas,
          horasExtras: horasExtras?.horasExtras || 0,
          cumplimiento: cumplimiento + '%',
          retrasos: retrasos
        };
      }),
      {
        empleado: 'Empleado',
        pdv: 'PDV',
        puesto: 'Puesto',
        horasPlanificadas: 'Horas Planificadas',
        horasTrabajadas: 'Horas Trabajadas',
        horasExtras: 'Horas Extras',
        cumplimiento: 'Cumplimiento',
        retrasos: 'Retrasos'
      }
    );

    const filename = `control_horarios_${new Date().toISOString().split('T')[0]}`;

    switch(format) {
      case 'csv':
        exportToCSV(datosExportar, filename);
        break;
      case 'excel':
        exportToExcel(datosExportar, filename);
        break;
      case 'pdf':
        exportToPDF(datosExportar, filename, undefined, 'Control de Horarios - Noviembre 2025');
        break;
    }
  };

  const handleClearFiltersControlHorarios = () => {
    setBusquedaControlHorarios('');
  };

  const handleOrdenarControlHorarios = (columna: string) => {
    setOrdenControlHorarios({
      columna,
      direccion: ordenControlHorarios.columna === columna && ordenControlHorarios.direccion === 'asc' ? 'desc' : 'asc'
    });
  };

  // Función para calcular el ajuste en minutos
  const calcularAjusteFichaje = (horateorica: string, fichajeReal: string, tipologia: 'Entrada' | 'Salida' | 'Descanso'): number => {
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
      // Para descansos, siempre 0
      return 0;
    }
  };

  // Fichajes mock - Registros de entradas/salidas/descansos
  const fichajesMock: Fichaje[] = [
    {
      id: 'F1',
      empleadoNombre: 'Carlos Méndez García',
      empleadoId: 'EMP-001',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      empleadoPuesto: 'Panadero Maestro',
      puntoVenta: 'Tiana',
      tipologia: 'Entrada',
      horateorica: '06:00',
      fichajeReal: '06:05',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F2',
      empleadoNombre: 'Carlos Méndez García',
      empleadoId: 'EMP-001',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      empleadoPuesto: 'Panadero Maestro',
      puntoVenta: 'Tiana',
      tipologia: 'Salida',
      horateorica: '14:30',
      fichajeReal: '14:20',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F3',
      empleadoNombre: 'María González López',
      empleadoId: 'EMP-002',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      empleadoPuesto: 'Responsable de Bollería',
      puntoVenta: 'Montgat',
      tipologia: 'Entrada',
      horateorica: '07:00',
      fichajeReal: '07:15',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F4',
      empleadoNombre: 'María González López',
      empleadoId: 'EMP-002',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      empleadoPuesto: 'Responsable de Bollería',
      puntoVenta: 'Montgat',
      tipologia: 'Descanso',
      horateorica: '11:00',
      fichajeReal: '11:05',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F5',
      empleadoNombre: 'Laura Martínez Ruiz',
      empleadoId: 'EMP-003',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      empleadoPuesto: 'Dependienta',
      puntoVenta: 'Tiana',
      tipologia: 'Entrada',
      horateorica: '09:00',
      fichajeReal: '08:55',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F6',
      empleadoNombre: 'Laura Martínez Ruiz',
      empleadoId: 'EMP-003',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      empleadoPuesto: 'Dependienta',
      puntoVenta: 'Tiana',
      tipologia: 'Salida',
      horateorica: '18:00',
      fichajeReal: '18:10',
      fecha: '2025-11-29',
      ajusteMinutos: 0
    },
    {
      id: 'F7',
      empleadoNombre: 'Ana Rodríguez Pérez',
      empleadoId: 'EMP-005',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      empleadoPuesto: 'Encargada de Turno',
      puntoVenta: 'Montgat',
      tipologia: 'Entrada',
      horateorica: '08:00',
      fichajeReal: '08:25',
      fecha: '2025-11-28',
      ajusteMinutos: 0
    },
    {
      id: 'F8',
      empleadoNombre: 'Carlos Méndez García',
      empleadoId: 'EMP-001',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      empleadoPuesto: 'Panadero Maestro',
      puntoVenta: 'Tiana',
      tipologia: 'Entrada',
      horateorica: '06:00',
      fichajeReal: '05:50',
      fecha: '2025-11-28',
      ajusteMinutos: 0
    },
    {
      id: 'F9',
      empleadoNombre: 'Carlos Méndez García',
      empleadoId: 'EMP-001',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      empleadoPuesto: 'Panadero Maestro',
      puntoVenta: 'Tiana',
      tipologia: 'Salida',
      horateorica: '14:30',
      fichajeReal: '14:15',
      fecha: '2025-11-28',
      ajusteMinutos: 0
    },
    {
      id: 'F10',
      empleadoNombre: 'Laura Martínez Ruiz',
      empleadoId: 'EMP-003',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      empleadoPuesto: 'Dependienta',
      puntoVenta: 'Montgat',
      tipologia: 'Entrada',
      horateorica: '09:00',
      fichajeReal: '09:30',
      fecha: '2025-11-27',
      ajusteMinutos: 0
    },
  ];

  // Calcular ajustes para cada fichaje
  fichajesMock.forEach(fichaje => {
    fichaje.ajusteMinutos = calcularAjusteFichaje(fichaje.horateorica, fichaje.fichajeReal, fichaje.tipologia);
  });

  // Agrupar fichajes por empleado y fecha
  const fichajesAgrupados: FichajeAgrupado[] = useMemo(() => {
    const agrupados = new Map<string, FichajeAgrupado>();
    
    fichajesMock.forEach(fichaje => {
      const key = `${fichaje.empleadoId}-${fichaje.fecha}`;
      
      if (!agrupados.has(key)) {
        agrupados.set(key, {
          id: key,
          empleadoNombre: fichaje.empleadoNombre,
          empleadoId: fichaje.empleadoId,
          empleadoAvatar: fichaje.empleadoAvatar,
          empleadoPuesto: fichaje.empleadoPuesto,
          puntoVenta: fichaje.puntoVenta,
          fecha: fichaje.fecha,
          entradaTeorica: '',
          entradaReal: '',
          descansoTeorico: undefined,
          descansoReal: undefined,
          salidaTeorica: '',
          salidaReal: '',
          ajusteEntrada: 0,
          ajusteDescanso: 0,
          ajusteSalida: 0,
          ajusteTotal: 0
        });
      }
      
      const agrupado = agrupados.get(key)!;
      
      if (fichaje.tipologia === 'Entrada') {
        agrupado.entradaTeorica = fichaje.horateorica;
        agrupado.entradaReal = fichaje.fichajeReal;
        agrupado.ajusteEntrada = fichaje.ajusteMinutos;
      } else if (fichaje.tipologia === 'Descanso') {
        agrupado.descansoTeorico = fichaje.horateorica;
        agrupado.descansoReal = fichaje.fichajeReal;
        agrupado.ajusteDescanso = fichaje.ajusteMinutos;
      } else if (fichaje.tipologia === 'Salida') {
        agrupado.salidaTeorica = fichaje.horateorica;
        agrupado.salidaReal = fichaje.fichajeReal;
        agrupado.ajusteSalida = fichaje.ajusteMinutos;
      }
      
      agrupado.ajusteTotal = agrupado.ajusteEntrada + agrupado.ajusteDescanso + agrupado.ajusteSalida;
    });
    
    return Array.from(agrupados.values()).sort((a, b) => {
      // Ordenar por fecha descendente
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }, []);

  const registrosHorarios: RegistroHorario[] = [
    {
      id: 'REG-001',
      empleadoId: 'EMP-001',
      empleadoNombre: 'Carlos Méndez',
      fecha: '2025-11-18',
      horaEntrada: '06:00',
      horaSalida: '14:30',
      totalHoras: 8.5,
      tipo: 'regular'
    },
    {
      id: 'REG-002',
      empleadoId: 'EMP-002',
      empleadoNombre: 'María González',
      fecha: '2025-11-18',
      horaEntrada: '07:00',
      horaSalida: '15:00',
      totalHoras: 8,
      tipo: 'regular'
    },
    {
      id: 'REG-003',
      empleadoId: 'EMP-003',
      empleadoNombre: 'Laura Martínez',
      fecha: '2025-11-18',
      horaEntrada: '09:00',
      totalHoras: undefined,
      tipo: 'regular'
    },
    {
      id: 'REG-004',
      empleadoId: 'EMP-001',
      empleadoNombre: 'Carlos Méndez',
      fecha: '2025-11-17',
      horaEntrada: '06:00',
      horaSalida: '16:00',
      totalHoras: 10,
      tipo: 'extra'
    },
    {
      id: 'REG-005',
      empleadoId: 'EMP-005',
      empleadoNombre: 'Ana Rodríguez',
      fecha: '2025-11-18',
      horaEntrada: '08:00',
      horaSalida: '16:00',
      totalHoras: 8,
      tipo: 'regular'
    }
  ];

  const solicitudesHorasExtras: SolicitudHoraExtra[] = [
    {
      id: 'SOL-001',
      empleadoId: 'EMP-001',
      empleadoNombre: 'Carlos Méndez',
      fecha: '2025-11-20',
      horaInicio: '15:00',
      horaFin: '18:00',
      totalHoras: 3,
      motivo: 'Pedido especial para evento corporativo',
      estado: 'pendiente',
      fechaSolicitud: '2025-11-17T10:30:00'
    },
    {
      id: 'SOL-002',
      empleadoId: 'EMP-002',
      empleadoNombre: 'María González',
      fecha: '2025-11-19',
      horaInicio: '16:00',
      horaFin: '19:00',
      totalHoras: 3,
      motivo: 'Preparación masa para fin de semana',
      estado: 'aprobada',
      fechaSolicitud: '2025-11-16T14:20:00'
    },
    {
      id: 'SOL-003',
      empleadoId: 'EMP-005',
      empleadoNombre: 'Ana Rodríguez',
      fecha: '2025-11-21',
      horaInicio: '17:00',
      horaFin: '20:00',
      totalHoras: 3,
      motivo: 'Cubrir turno de compañero enfermo',
      estado: 'pendiente',
      fechaSolicitud: '2025-11-17T16:45:00'
    }
  ];

  const incidencias: Incidencia[] = [
    {
      id: 'INC-001',
      empleadoId: 'EMP-003',
      empleadoNombre: 'Laura Martínez',
      tipo: 'retraso',
      fecha: '2025-11-15',
      descripcion: 'Llegada 20 minutos tarde por problemas de transporte',
      estado: 'resuelta',
      prioridad: 'baja'
    },
    {
      id: 'INC-002',
      empleadoId: 'EMP-004',
      empleadoNombre: 'Javier Torres',
      tipo: 'ausencia',
      fecha: '2025-11-10',
      descripcion: 'Ausencia justificada por cita médica',
      estado: 'resuelta',
      prioridad: 'media'
    },
    {
      id: 'INC-003',
      empleadoId: 'EMP-001',
      empleadoNombre: 'Carlos Méndez',
      tipo: 'otro',
      fecha: '2025-11-18',
      descripcion: 'Solicitud de cambio de turno para próxima semana',
      estado: 'en-revision',
      prioridad: 'media'
    }
  ];

  const gastosEquipo: GastoEquipo[] = [
    {
      id: 'GASTO-001',
      empleadoId: 'EMP-001',
      empleadoNombre: 'Carlos Méndez García',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      concepto: 'Transporte para formación en Madrid',
      categoria: 'transporte',
      importe: 85.50,
      fecha: '2025-11-15',
      fechaSolicitud: '2025-11-14T10:30:00',
      estado: 'pendiente',
      justificante: 'ticket-tren-madrid.pdf',
      notas: 'Viaje de ida y vuelta para el curso de panadería artesanal'
    },
    {
      id: 'GASTO-002',
      empleadoId: 'EMP-002',
      empleadoNombre: 'María González López',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      concepto: 'Material de trabajo - Delantales profesionales',
      categoria: 'material',
      importe: 45.00,
      fecha: '2025-11-12',
      fechaSolicitud: '2025-11-12T14:20:00',
      estado: 'aprobado',
      justificante: 'factura-delantales.pdf'
    },
    {
      id: 'GASTO-003',
      empleadoId: 'EMP-003',
      empleadoNombre: 'Laura Martínez Ruiz',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      concepto: 'Comida durante turno extra',
      categoria: 'comida',
      importe: 12.50,
      fecha: '2025-11-18',
      fechaSolicitud: '2025-11-18T16:45:00',
      estado: 'pendiente',
      justificante: 'ticket-restaurante.pdf'
    },
    {
      id: 'GASTO-004',
      empleadoId: 'EMP-001',
      empleadoNombre: 'Carlos Méndez García',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      concepto: 'Curso de especialización en bollería francesa',
      categoria: 'formacion',
      importe: 350.00,
      fecha: '2025-11-10',
      fechaSolicitud: '2025-11-08T09:15:00',
      estado: 'aprobado',
      justificante: 'inscripcion-curso.pdf',
      notas: 'Curso de 3 días en Barcelona'
    },
    {
      id: 'GASTO-005',
      empleadoId: 'EMP-005',
      empleadoNombre: 'Ana Rodríguez Pérez',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      concepto: 'Herramientas de trabajo - Termómetro digital',
      categoria: 'material',
      importe: 28.90,
      fecha: '2025-11-16',
      fechaSolicitud: '2025-11-16T11:00:00',
      estado: 'pendiente',
      justificante: 'factura-termometro.pdf'
    },
    {
      id: 'GASTO-006',
      empleadoId: 'EMP-004',
      empleadoNombre: 'Javier Torres Sánchez',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
      concepto: 'Taxi urgente por avería de transporte público',
      categoria: 'transporte',
      importe: 15.20,
      fecha: '2025-11-19',
      fechaSolicitud: '2025-11-19T07:30:00',
      estado: 'aprobado',
      justificante: 'ticket-taxi.pdf',
      notas: 'Metro en huelga'
    },
    {
      id: 'GASTO-007',
      empleadoId: 'EMP-002',
      empleadoNombre: 'María González López',
      empleadoAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      concepto: 'Libros técnicos de pastelería',
      categoria: 'formacion',
      importe: 65.00,
      fecha: '2025-11-11',
      fechaSolicitud: '2025-11-11T12:00:00',
      estado: 'rechazado',
      justificante: 'factura-libros.pdf',
      notas: 'No aprobado - material disponible en biblioteca de la empresa'
    }
  ];

  const handleAprobarGasto = (gastoId: string) => {
    toast.success('Gasto aprobado correctamente');
  };

  const handleRechazarGasto = (gastoId: string) => {
    toast.error('Gasto rechazado');
  };

  const getCategoriaGastoLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'transporte': 'Transporte',
      'comida': 'Comida',
      'alojamiento': 'Alojamiento',
      'material': 'Material',
      'formacion': 'Formación',
      'otros': 'Otros'
    };
    return labels[categoria] || categoria;
  };

  const getCategoriaGastoBadge = (categoria: string) => {
    const configs: Record<string, string> = {
      'transporte': 'bg-blue-100 text-blue-700 border-blue-200',
      'comida': 'bg-green-100 text-green-700 border-green-200',
      'alojamiento': 'bg-purple-100 text-purple-700 border-purple-200',
      'material': 'bg-orange-100 text-orange-700 border-orange-200',
      'formacion': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'otros': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return configs[categoria] || configs.otros;
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      activo: { variant: 'default' as const, className: 'bg-green-600', label: 'Activo' },
      vacaciones: { variant: 'default' as const, className: 'bg-blue-600', label: 'Vacaciones' },
      baja: { variant: 'default' as const, className: 'bg-red-600', label: 'Baja' },
      pendiente: { variant: 'default' as const, className: 'bg-yellow-600', label: 'Pendiente' },
      aprobada: { variant: 'default' as const, className: 'bg-green-600', label: 'Aprobada' },
      rechazada: { variant: 'default' as const, className: 'bg-red-600', label: 'Rechazada' },
      abierta: { variant: 'default' as const, className: 'bg-orange-600', label: 'Abierta' },
      resuelta: { variant: 'default' as const, className: 'bg-green-600', label: 'Resuelta' },
      'en-revision': { variant: 'default' as const, className: 'bg-blue-600', label: 'En Revisión' }
    };
    const config = configs[estado as keyof typeof configs] || configs.activo;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getTipoIncidenciaIcon = (tipo: string) => {
    const icons = {
      ausencia: <XCircle className="w-5 h-5 text-red-600" />,
      retraso: <Clock className="w-5 h-5 text-orange-600" />,
      falta: <AlertCircle className="w-5 h-5 text-red-600" />,
      otro: <FileText className="w-5 h-5 text-blue-600" />
    };
    return icons[tipo as keyof typeof icons] || icons.otro;
  };

  // Generar datos del calendario semanal
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // ============================================
  // CÁLCULOS DINÁMICOS CON useMemo - RRHH
  // ============================================
  
  const estadisticas = useMemo(() => {
    // GRUPO 1: EMPLEADOS - TOTALES Y SEGMENTACIÓN
    const totalEmpleados = empleados.length;
    const empleadosActivos = empleados.filter(e => e.estado === 'activo').length;
    const empleadosVacaciones = empleados.filter(e => e.estado === 'vacaciones').length;
    const empleadosBaja = empleados.filter(e => e.estado === 'baja').length;
    const porcentajeActivos = totalEmpleados > 0 ? (empleadosActivos / totalEmpleados) * 100 : 0;
    const porcentajeVacaciones = totalEmpleados > 0 ? (empleadosVacaciones / totalEmpleados) * 100 : 0;
    
    // GRUPO 2: DEPARTAMENTOS Y DISTRIBUCIÓN
    const empleadosProduccion = empleados.filter(e => e.departamento === 'Producción').length;
    const empleadosVentas = empleados.filter(e => e.departamento === 'Ventas').length;
    const empleadosAdministracion = empleados.filter(e => e.departamento === 'Administración').length;
    const empleadosLogistica = empleados.filter(e => e.departamento === 'Logística').length;
    const porcentajeProduccion = totalEmpleados > 0 ? (empleadosProduccion / totalEmpleados) * 100 : 0;
    const porcentajeVentas = totalEmpleados > 0 ? (empleadosVentas / totalEmpleados) * 100 : 0;
    
    // GRUPO 3: HORAS - TOTALES Y PROMEDIOS
    const totalHorasTrabajadas = empleados.reduce((acc, e) => acc + e.horasTrabajadas, 0);
    const totalHorasContrato = empleados.reduce((acc, e) => acc + e.horasContrato, 0);
    const horasExtrasTotales = empleados.reduce((acc, e) => {
      const extras = e.horasTrabajadas - e.horasContrato;
      return acc + (extras > 0 ? extras : 0);
    }, 0);
    const promedioHorasPorEmpleado = totalEmpleados > 0 
      ? totalHorasTrabajadas / totalEmpleados 
      : 0;
    const promedioHorasContratoPorEmpleado = totalEmpleados > 0
      ? totalHorasContrato / totalEmpleados
      : 0;
    const porcentajeHorasExtras = totalHorasContrato > 0
      ? (horasExtrasTotales / totalHorasContrato) * 100
      : 0;
    
    // GRUPO 4: HORARIOS - REGISTROS
    const totalRegistrosHorarios = registrosHorarios.length;
    const horasRegularesTotales = registrosHorarios
      .filter(r => r.tipo === 'regular')
      .reduce((acc, r) => acc + (r.totalHoras || 0), 0);
    const horasExtrasTotalesRegistros = registrosHorarios
      .filter(r => r.tipo === 'extra')
      .reduce((acc, r) => acc + (r.totalHoras || 0), 0);
    const horasNocturnasTotal = registrosHorarios
      .filter(r => r.tipo === 'nocturno')
      .reduce((acc, r) => acc + (r.totalHoras || 0), 0);
    const promedioHorasPorRegistro = totalRegistrosHorarios > 0
      ? (horasRegularesTotales + horasExtrasTotalesRegistros + horasNocturnasTotal) / totalRegistrosHorarios
      : 0;
    
    // GRUPO 5: GASTOS - ANÁLISIS FINANCIERO
    const totalGastos = gastosEquipo.length;
    const gastosPendientes = gastosEquipo.filter(g => g.estado === 'pendiente').length;
    const gastosAprobados = gastosEquipo.filter(g => g.estado === 'aprobado').length;
    const gastosRechazados = gastosEquipo.filter(g => g.estado === 'rechazado').length;
    const porcentajeGastosAprobados = totalGastos > 0 ? (gastosAprobados / totalGastos) * 100 : 0;
    const porcentajeGastosPendientes = totalGastos > 0 ? (gastosPendientes / totalGastos) * 100 : 0;
    
    // Total importes por estado
    const importeTotalPendiente = gastosEquipo
      .filter(g => g.estado === 'pendiente')
      .reduce((acc, g) => acc + g.importe, 0);
    const importeTotalAprobado = gastosEquipo
      .filter(g => g.estado === 'aprobado')
      .reduce((acc, g) => acc + g.importe, 0);
    const importeTotalRechazado = gastosEquipo
      .filter(g => g.estado === 'rechazado')
      .reduce((acc, g) => acc + g.importe, 0);
    const importeTotalGastos = gastosEquipo.reduce((acc, g) => acc + g.importe, 0);
    const promedioImportePorGasto = totalGastos > 0 ? importeTotalGastos / totalGastos : 0;
    
    // Gastos por categoría
    const gastosPorCategoria = gastosEquipo.reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + g.importe;
      return acc;
    }, {} as Record<string, number>);
    
    const categoriaConMasGastos = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0];
    
    // GRUPO 6: CENTRO DE COSTES
    const totalPorcentajeCentrosCostes = empleados.reduce(
      (acc, e) => acc + (e.centroCostePorcentaje || 0), 
      0
    );
    const promedioCentroCostes = totalEmpleados > 0 
      ? totalPorcentajeCentrosCostes / totalEmpleados 
      : 0;
    const empleadosConCentroCostes = empleados.filter(e => e.centroCostePorcentaje && e.centroCostePorcentaje > 0).length;
    
    // GRUPO 7: ANTIGÜEDAD Y RETENCIÓN
    const empleadosAntiguos = empleados.filter(e => {
      if (!e.fechaIngreso) return false;
      const fechaIngreso = new Date(e.fechaIngreso);
      if (isNaN(fechaIngreso.getTime())) return false;
      const añosAntiguedad = (new Date().getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return añosAntiguedad >= 2;
    }).length;
    const empleadosNuevos = empleados.filter(e => {
      if (!e.fechaIngreso) return false;
      const fechaIngreso = new Date(e.fechaIngreso);
      if (isNaN(fechaIngreso.getTime())) return false;
      const añosAntiguedad = (new Date().getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return añosAntiguedad < 1;
    }).length;
    const porcentajeEmpleadosAntiguos = totalEmpleados > 0 ? (empleadosAntiguos / totalEmpleados) * 100 : 0;
    const añosAntiguedadPromedio = totalEmpleados > 0
      ? empleados.reduce((acc, e) => {
          if (!e.fechaIngreso) return acc;
          const fechaIngreso = new Date(e.fechaIngreso);
          if (isNaN(fechaIngreso.getTime())) return acc;
          const años = (new Date().getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return acc + años;
        }, 0) / totalEmpleados
      : 0;
    
    // GRUPO 8: RENDIMIENTO - Cumplimiento de horas
    const empleadosConHorasCompletas = empleados.filter(
      e => e.horasTrabajadas >= e.horasContrato
    ).length;
    const empleadosBajoRendimiento = empleados.filter(
      e => e.horasTrabajadas < e.horasContrato * 0.9
    ).length;
    const porcentajeCumplimiento = totalEmpleados > 0
      ? (empleadosConHorasCompletas / totalEmpleados) * 100
      : 0;
    const porcentajeRendimientoOptimo = totalEmpleados > 0
      ? ((totalEmpleados - empleadosBajoRendimiento) / totalEmpleados) * 100
      : 0;
    
    return {
      // Grupo 1: Empleados básicos
      totalEmpleados,
      empleadosActivos,
      empleadosVacaciones,
      empleadosBaja,
      porcentajeActivos,
      porcentajeVacaciones,
      
      // Grupo 2: Departamentos
      empleadosProduccion,
      empleadosVentas,
      empleadosAdministracion,
      empleadosLogistica,
      porcentajeProduccion,
      porcentajeVentas,
      
      // Grupo 3: Horas
      totalHorasTrabajadas,
      totalHorasContrato,
      horasExtrasTotales,
      promedioHorasPorEmpleado,
      promedioHorasContratoPorEmpleado,
      porcentajeHorasExtras,
      
      // Grupo 4: Registros horarios
      totalRegistrosHorarios,
      horasRegularesTotales,
      horasExtrasTotalesRegistros,
      horasNocturnasTotal,
      promedioHorasPorRegistro,
      
      // Grupo 5: Gastos
      totalGastos,
      gastosPendientes,
      gastosAprobados,
      gastosRechazados,
      porcentajeGastosAprobados,
      porcentajeGastosPendientes,
      importeTotalPendiente,
      importeTotalAprobado,
      importeTotalRechazado,
      importeTotalGastos,
      promedioImportePorGasto,
      gastosPorCategoria,
      categoriaConMasGastos,
      
      // Grupo 6: Centro de costes
      totalPorcentajeCentrosCostes,
      promedioCentroCostes,
      empleadosConCentroCostes,
      
      // Grupo 7: Antigüedad
      empleadosAntiguos,
      empleadosNuevos,
      porcentajeEmpleadosAntiguos,
      añosAntiguedadPromedio,
      
      // Grupo 8: Rendimiento
      empleadosConHorasCompletas,
      empleadosBajoRendimiento,
      porcentajeCumplimiento,
      porcentajeRendimientoOptimo
    };
  }, [empleados, registrosHorarios, gastosEquipo]);
  
  // Extraer variables para uso en el componente
  const {
    totalEmpleados,
    empleadosActivos,
    empleadosVacaciones,
    empleadosBaja,
    empleadosProduccion,
    empleadosVentas,
    totalHorasTrabajadas,
    totalHorasContrato,
    horasExtrasTotales,
    promedioHorasPorEmpleado,
    totalRegistrosHorarios,
    horasRegularesTotales,
    horasExtrasTotalesRegistros,
    totalGastos,
    gastosPendientes,
    gastosAprobados,
    gastosRechazados,
    importeTotalPendiente,
    importeTotalAprobado,
    importeTotalRechazado,
    importeTotalGastos,
    gastosPorCategoria,
    totalPorcentajeCentrosCostes,
    promedioCentroCostes,
    empleadosAntiguos,
    empleadosConHorasCompletas,
    porcentajeCumplimiento
  } = estadisticas;

  // ⭐ FUNCIONES DE EXPORTACIÓN
  const exportarAExcel = (datos: any[], nombreArchivo: string, columnas: string[]) => {
    // Crear CSV (Excel abrirá CSV)
    const headers = columnas.join(',');
    const rows = datos.map(dato => {
      return columnas.map(col => {
        const valor = dato[col] ?? '';
        // Escapar comillas y valores con comas
        return typeof valor === 'string' && (valor.includes(',') || valor.includes('"')) 
          ? `"${valor.replace(/"/g, '""')}"` 
          : valor;
      }).join(',');
    });
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Exportado a Excel correctamente');
  };

  const exportarACSV = (datos: any[], nombreArchivo: string, columnas: string[]) => {
    const headers = columnas.join(',');
    const rows = datos.map(dato => {
      return columnas.map(col => {
        const valor = dato[col] ?? '';
        return typeof valor === 'string' && (valor.includes(',') || valor.includes('"')) 
          ? `"${valor.replace(/"/g, '""')}"` 
          : valor;
      }).join(',');
    });
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Exportado a CSV correctamente');
  };

  const exportarAPDF = (datos: any[], nombreArchivo: string, columnas: string[], titulo: string) => {
    // Crear un HTML simple para imprimir como PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #0d9488; font-size: 24px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #0d9488; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 20px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        <p style="font-size: 12px; color: #666;">Generado el: ${new Date().toLocaleString('es-ES')}</p>
        <table>
          <thead>
            <tr>${columnas.map(col => `<th>${col}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${datos.map(dato => `
              <tr>${columnas.map(col => `<td>${dato[col] ?? ''}</td>`).join('')}</tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Udar Edge - Sistema de Gestión Multiempresa</p>
        </div>
      </body>
      </html>
    `;
    
    const ventana = window.open('', '', 'width=800,height=600');
    if (ventana) {
      ventana.document.write(htmlContent);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
        toast.success('Preparado para imprimir como PDF');
      }, 250);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900 mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span className="hidden sm:inline">Equipo y Recursos Humanos</span>
            <span className="sm:hidden">RRHH</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Gestión completa del equipo, horarios, horas extras e incidencias</span>
            <span className="sm:hidden">Gestión de equipo</span>
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm">
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Empleado</span>
                <span className="sm:hidden">Nuevo</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setModalInvitarEmpleado(true)} className="cursor-pointer">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                <div className="flex flex-col">
                  <span className="font-medium">Invitar por Email/Link</span>
                  <span className="text-xs text-gray-500">El empleado se auto-registra</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModalAñadirEmpleado(true)} className="cursor-pointer">
                <UserPlus className="w-4 h-4 mr-2 text-teal-600" />
                <div className="flex flex-col">
                  <span className="font-medium">Crear Directamente</span>
                  <span className="text-xs text-gray-500">Alta manual del empleado</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm" onClick={() => setModalModificaciones(true)}>
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Modificaciones</span>
            <span className="sm:hidden">Modif.</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="equipo" className="text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Equipo</span>
            <span className="sm:hidden">Equipo</span>
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Onboarding</span>
            <span className="sm:hidden">Onboard</span>
          </TabsTrigger>
          <TabsTrigger value="horarios" className="text-xs sm:text-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Horarios</span>
            <span className="sm:hidden">Horarios</span>
          </TabsTrigger>
          <TabsTrigger value="fichajes" className="text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Fichajes</span>
            <span className="sm:hidden">Fichajes</span>
          </TabsTrigger>
        </TabsList>

        {/* Barra de búsqueda y filtros */}
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Filtro PDV - Multiselección */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center justify-between gap-2 border-gray-300 h-9 sm:h-10 text-sm w-full sm:w-auto"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    {filtrosSeleccionados.length === 0 
                      ? 'Filtros' 
                      : `${filtrosSeleccionados.length} filtro${filtrosSeleccionados.length > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
              <div className="space-y-3">
                {/* Empresa */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
                  {EMPRESAS_ARRAY.map(empresa => (
                    <div key={empresa.id} className="flex items-center gap-2 mb-2">
                      <Checkbox 
                        id={`empresa-${empresa.id}`}
                        checked={filtrosSeleccionados.includes(empresa.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFiltrosSeleccionados([...filtrosSeleccionados, empresa.id]);
                          } else {
                            setFiltrosSeleccionados(filtrosSeleccionados.filter(item => item !== empresa.id));
                          }
                        }}
                      />
                      <label htmlFor={`empresa-${empresa.id}`} className="text-sm cursor-pointer">
                        🏢 {getNombreEmpresa(empresa.id)}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Puntos de Venta */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
                  <div className="space-y-2">
                    {PUNTOS_VENTA_ARRAY.map(pdv => (
                      <div key={pdv.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`pdv-${pdv.id}`}
                          checked={filtrosSeleccionados.includes(pdv.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiltrosSeleccionados([...filtrosSeleccionados, pdv.id]);
                            } else {
                              setFiltrosSeleccionados(filtrosSeleccionados.filter(item => item !== pdv.id));
                            }
                          }}
                        />
                        <label htmlFor={`pdv-${pdv.id}`} className="text-sm cursor-pointer">
                          📍 {getNombrePDVConMarcas(pdv.id)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marcas */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
                  <div className="space-y-2">
                    {MARCAS_ARRAY.map(marca => (
                      <div key={marca.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={`marca-${marca.id}`}
                          checked={filtrosSeleccionados.includes(marca.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiltrosSeleccionados([...filtrosSeleccionados, marca.id]);
                            } else {
                              setFiltrosSeleccionados(filtrosSeleccionados.filter(item => item !== marca.id));
                            }
                          }}
                        />
                        <label htmlFor={`marca-${marca.id}`} className="text-sm cursor-pointer">
                          {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón limpiar */}
                {filtrosSeleccionados.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setFiltrosSeleccionados([])}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Buscar empleados..."
            className="flex-1 h-9 sm:h-10 text-sm"
          />

          {/* Mostrar filtros activos */}
          {filtrosSeleccionados.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {filtrosSeleccionados.map(id => {
                let label = '';
                if (EMPRESAS[id]) label = getNombreEmpresa(id);
                else if (PUNTOS_VENTA[id]) label = PUNTOS_VENTA[id].nombre;
                else if (MARCAS[id]) label = getNombreMarca(id);
                
                return (
                  <Badge key={id} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* TAB: EQUIPO */}
        <TabsContent value="equipo" className="space-y-3 sm:space-y-4 mt-4">
          {/* ⭐ SUB-TABS: Equipo | Centros de Costes | Absentismo */}
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <Button
              variant={subTabEquipo === 'listado' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabEquipo('listado')}
              className="text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Equipo
            </Button>
            <Button
              variant={subTabEquipo === 'centros-costes' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabEquipo('centros-costes')}
              className="text-sm"
            >
              <Percent className="w-4 h-4 mr-2" />
              Centros de Costes
            </Button>
            <Button
              variant={subTabEquipo === 'absentismo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabEquipo('absentismo')}
              className="text-sm"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Absentismo
            </Button>
            <Button
              variant={subTabEquipo === 'consumos-internos' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabEquipo('consumos-internos')}
              className="text-sm"
            >
              <Euro className="w-4 h-4 mr-2" />
              Consumos Internos
            </Button>
            <Button
              variant={subTabEquipo === 'modificaciones' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabEquipo('modificaciones')}
              className="text-sm"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Modificaciones
            </Button>
          </div>

          {/* SUB-TAB: LISTADO DE EQUIPO */}
          {subTabEquipo === 'listado' && (
            <Card>
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Listado del Equipo
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const datos = empleados.map(e => ({
                      'Nombre': `${e.nombre} ${e.apellidos}`,
                      'Empresa': getNombreEmpresa(e.empresaId),
                      'PDV': e.puntosVentaAsignados?.map(p => PUNTOS_VENTA[p]?.nombre).join(', ') || 'N/A',
                      'Puesto': e.puesto,
                      'Email': e.email,
                      'Teléfono': e.telefono,
                      'Estado': e.estado
                    }));
                    exportarAExcel(datos, 'listado_equipo', ['Nombre', 'Empresa', 'PDV', 'Puesto', 'Email', 'Teléfono', 'Estado']);
                  }}>
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const datos = empleados.map(e => ({
                      'Nombre': `${e.nombre} ${e.apellidos}`,
                      'Empresa': getNombreEmpresa(e.empresaId),
                      'PDV': e.puntosVentaAsignados?.map(p => PUNTOS_VENTA[p]?.nombre).join(', ') || 'N/A',
                      'Puesto': e.puesto,
                      'Email': e.email,
                      'Teléfono': e.telefono,
                      'Estado': e.estado
                    }));
                    exportarACSV(datos, 'listado_equipo', ['Nombre', 'Empresa', 'PDV', 'Puesto', 'Email', 'Teléfono', 'Estado']);
                  }}>
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const datos = empleados.map(e => ({
                      'Nombre': `${e.nombre} ${e.apellidos}`,
                      'Empresa': getNombreEmpresa(e.empresaId),
                      'PDV': e.puntosVentaAsignados?.map(p => PUNTOS_VENTA[p]?.nombre).join(', ') || 'N/A',
                      'Puesto': e.puesto,
                      'Email': e.email,
                      'Teléfono': e.telefono,
                      'Estado': e.estado
                    }));
                    exportarAPDF(datos, 'listado_equipo', ['Nombre', 'Empresa', 'PDV', 'Puesto', 'Email', 'Teléfono', 'Estado'], 'Listado del Equipo');
                  }}>
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {empleados.map((empleado) => (
                  <div
                    key={empleado.id}
                    className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                      <AvatarImage src={empleado?.avatar} alt={empleado?.nombre} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {(empleado?.nombre || 'E').charAt(0)}{(empleado?.apellidos || 'A').charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                          {empleado.nombre} {empleado.apellidos}
                        </h3>
                        {getEstadoBadge(empleado.estado)}
                      </div>

                      {/* ⭐ NUEVO: Mostrar contexto multiempresa */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 border-blue-200">
                          🏢 {getNombreEmpresa(empleado.empresaId)}
                        </Badge>
                        {empleado.marcaId && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {getIconoMarca(empleado.marcaId)} {getNombreMarca(empleado.marcaId)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-50 text-green-700 border-green-200">
                          📍 {PUNTOS_VENTA[empleado.puntoVentaId]?.nombre || empleado.puntoVentaId}
                        </Badge>
                        {empleado.puntosVentaAsignados && empleado.puntosVentaAsignados.length > 1 && (
                          <Badge variant="outline" className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 border-amber-200">
                            +{empleado.puntosVentaAsignados.length - 1} PDV más
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{empleado.puesto} - {empleado.departamento}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{empleado.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span>{empleado.telefono}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          {empleado.fechaIngreso && !isNaN(new Date(empleado.fechaIngreso).getTime()) ? (
                            <>
                              <span className="hidden sm:inline">Desde {format(new Date(empleado.fechaIngreso), 'dd/MM/yyyy')}</span>
                              <span className="sm:hidden">{format(new Date(empleado.fechaIngreso), 'dd/MM/yy')}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">Fecha no disponible</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 shrink-0" />
                          <span className="text-xs sm:text-sm">
                            <span className="font-medium">{empleado.horasTrabajadas}h</span>
                            <span className="text-gray-500"> / {empleado.horasContrato}h <span className="hidden sm:inline">este mes</span></span>
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                empleado.horasTrabajadas > empleado.horasContrato
                                  ? 'bg-orange-500'
                                  : 'bg-teal-600'
                              }`}
                              style={{
                                width: `${Math.min((empleado.horasTrabajadas / empleado.horasContrato) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        {empleado.centroCostePorcentaje && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                            <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="font-medium">{empleado.centroCostePorcentaje}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 shrink-0">
                          <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAbrirChat(empleado)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Abrir Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVerPerfil(empleado)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAdministrarPermisos(empleado)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Administrar permisos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModificarContrato(empleado)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modificar contrato
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* SUB-TAB: CENTROS DE COSTES */}
          {subTabEquipo === 'centros-costes' && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Distribución de Centros de Costes
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Gestiona la distribución de nóminas por punto de venta
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const datos = empleados
                          .filter(e => e.puntosVentaAsignados && e.puntosVentaAsignados.length > 1)
                          .flatMap(e => {
                            const dist = obtenerDistribucionEfectiva(e, 2025, 11);
                            return dist.distribucion.map(d => ({
                              'Empleado': `${e.nombre} ${e.apellidos}`,
                              'PDV': PUNTOS_VENTA[d.pdvId]?.nombre || 'N/A',
                              'Porcentaje': `${d.porcentajeReal}%`,
                              'Salario Asignado': `${d.salarioAsignado}€`,
                              'Horas': d.horasTrabajadas
                            }));
                          });
                        exportarAExcel(datos, 'centros_costes', ['Empleado', 'PDV', 'Porcentaje', 'Salario Asignado', 'Horas']);
                      }}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = empleados
                          .filter(e => e.puntosVentaAsignados && e.puntosVentaAsignados.length > 1)
                          .flatMap(e => {
                            const dist = obtenerDistribucionEfectiva(e, 2025, 11);
                            return dist.distribucion.map(d => ({
                              'Empleado': `${e.nombre} ${e.apellidos}`,
                              'PDV': PUNTOS_VENTA[d.pdvId]?.nombre || 'N/A',
                              'Porcentaje': `${d.porcentajeReal}%`,
                              'Salario Asignado': `${d.salarioAsignado}€`,
                              'Horas': d.horasTrabajadas
                            }));
                          });
                        exportarACSV(datos, 'centros_costes', ['Empleado', 'PDV', 'Porcentaje', 'Salario Asignado', 'Horas']);
                      }}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = empleados
                          .filter(e => e.puntosVentaAsignados && e.puntosVentaAsignados.length > 1)
                          .flatMap(e => {
                            const dist = obtenerDistribucionEfectiva(e, 2025, 11);
                            return dist.distribucion.map(d => ({
                              'Empleado': `${e.nombre} ${e.apellidos}`,
                              'PDV': PUNTOS_VENTA[d.pdvId]?.nombre || 'N/A',
                              'Porcentaje': `${d.porcentajeReal}%`,
                              'Salario Asignado': `${d.salarioAsignado}€`,
                              'Horas': d.horasTrabajadas
                            }));
                          });
                        exportarAPDF(datos, 'centros_costes', ['Empleado', 'PDV', 'Porcentaje', 'Salario Asignado', 'Horas'], 'Distribución de Centros de Costes');
                      }}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-4">
                  {empleados.filter(e => e.puntosVentaAsignados && e.puntosVentaAsignados.length > 1).map((empleado) => {
                    const distribucionEfectiva = obtenerDistribucionEfectiva(empleado, 2025, 11);
                    const comparacion = compararDistribuciones(empleado.id);
                    
                    return (
                      <div key={empleado.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={empleado?.avatar} />
                              <AvatarFallback>{(empleado?.nombre || 'E').charAt(0)}{(empleado?.apellidos || 'A').charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-sm">{empleado?.nombre} {empleado?.apellidos}</h4>
                              <p className="text-xs text-gray-600">{empleado?.puesto}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {empleado.salarioMensual?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </p>
                            <p className="text-xs text-gray-600">Salario mensual</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {distribucionEfectiva.map((dist) => {
                            const pdv = PUNTOS_VENTA[dist.puntoVentaId];
                            const costo = (empleado.salarioMensual || 0) * (dist.porcentaje / 100);
                            
                            return (
                              <div key={dist.puntoVentaId} className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                    <span className="text-sm font-medium">{pdv?.nombre}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">{dist.porcentaje}%</Badge>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Coste asignado:</span>
                                  <span className="font-medium">{costo.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-teal-600" 
                                    style={{ width: `${dist.porcentaje}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {comparacion?.desviacion && comparacion.desviacion.some(d => Math.abs(d.diferencia) >= 5) && (
                          <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-900">Desviación detectada</p>
                              <p className="text-amber-700">
                                La distribución manual difiere del cálculo por fichajes en hasta {Math.max(...comparacion.desviacion.map(d => Math.abs(d.diferencia)))}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB: ABSENTISMO */}
          {subTabEquipo === 'absentismo' && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Dashboard de Absentismo
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Métricas de ausencias y cumplimiento horario - Noviembre 2025
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const datos = empleados.map(e => {
                          const absentismo = calcularAbsentismo(e.id, 2025, 11);
                          const horasTrabajadas = calcularHorasTrabajadas(e.id, 2025, 11);
                          return {
                            'Empleado': `${e.nombre} ${e.apellidos}`,
                            'Horas Trabajadas': horasTrabajadas.toFixed(2),
                            'Ausencias': absentismo.ausencias,
                            'Tasa Absentismo': `${absentismo.porcentaje.toFixed(1)}%`,
                            'Estado': absentismo.porcentaje > 15 ? 'Alto' : absentismo.porcentaje > 8 ? 'Medio' : 'Normal'
                          };
                        });
                        exportarAExcel(datos, 'absentismo_equipo', ['Empleado', 'Horas Trabajadas', 'Ausencias', 'Tasa Absentismo', 'Estado']);
                      }}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = empleados.map(e => {
                          const absentismo = calcularAbsentismo(e.id, 2025, 11);
                          const horasTrabajadas = calcularHorasTrabajadas(e.id, 2025, 11);
                          return {
                            'Empleado': `${e.nombre} ${e.apellidos}`,
                            'Horas Trabajadas': horasTrabajadas.toFixed(2),
                            'Ausencias': absentismo.ausencias,
                            'Tasa Absentismo': `${absentismo.porcentaje.toFixed(1)}%`,
                            'Estado': absentismo.porcentaje > 15 ? 'Alto' : absentismo.porcentaje > 8 ? 'Medio' : 'Normal'
                          };
                        });
                        exportarACSV(datos, 'absentismo_equipo', ['Empleado', 'Horas Trabajadas', 'Ausencias', 'Tasa Absentismo', 'Estado']);
                      }}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = empleados.map(e => {
                          const absentismo = calcularAbsentismo(e.id, 2025, 11);
                          const horasTrabajadas = calcularHorasTrabajadas(e.id, 2025, 11);
                          return {
                            'Empleado': `${e.nombre} ${e.apellidos}`,
                            'Horas Trabajadas': horasTrabajadas.toFixed(2),
                            'Ausencias': absentismo.ausencias,
                            'Tasa Absentismo': `${absentismo.porcentaje.toFixed(1)}%`,
                            'Estado': absentismo.porcentaje > 15 ? 'Alto' : absentismo.porcentaje > 8 ? 'Medio' : 'Normal'
                          };
                        });
                        exportarAPDF(datos, 'absentismo_equipo', ['Empleado', 'Horas Trabajadas', 'Ausencias', 'Tasa Absentismo', 'Estado'], 'Dashboard de Absentismo');
                      }}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-4">
                  {empleados.map((empleado) => {
                    try {
                      const absentismo = calcularAbsentismo(empleado.id, 2025, 11);
                      const horasTrabajadas = calcularHorasTrabajadas(empleado.id, 2025, 11);
                      const diasTrabajados = calcularDiasTrabajados(empleado.id, 2025, 11);
                      
                      if (horasTrabajadas === 0) return null;

                      const porcentajeCumplimiento = (horasTrabajadas / empleado.horasContrato) * 100;
                      const alertaAbsentismo = absentismo.porcentajeAbsentismoHoras > 10;

                      return (
                        <div 
                          key={empleado.id} 
                          className={`p-4 border rounded-lg ${alertaAbsentismo ? 'bg-red-50 border-red-200' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={empleado?.avatar} />
                                <AvatarFallback>{(empleado?.nombre || 'E').charAt(0)}{(empleado?.apellidos || 'A').charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-sm">{empleado?.nombre} {empleado?.apellidos}</h4>
                                <p className="text-xs text-gray-600">{PUNTOS_VENTA[empleado?.puntoVentaId]?.nombre}</p>
                              </div>
                            </div>
                            {alertaAbsentismo && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Alto Absentismo
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-2 bg-blue-50 rounded">
                              <p className="text-xs text-gray-600">Horas Trabajadas</p>
                              <p className="text-lg font-semibold text-blue-600">{horasTrabajadas}h</p>
                              <p className="text-xs text-gray-500">de {empleado.horasContrato}h</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded">
                              <p className="text-xs text-gray-600">Días Fichados</p>
                              <p className="text-lg font-semibold text-green-600">{diasTrabajados}</p>
                              <p className="text-xs text-gray-500">de {absentismo.diasContrato} días</p>
                            </div>
                            <div className={`p-2 rounded ${alertaAbsentismo ? 'bg-red-100' : 'bg-gray-50'}`}>
                              <p className="text-xs text-gray-600">Ausencias (horas)</p>
                              <p className={`text-lg font-semibold ${alertaAbsentismo ? 'text-red-600' : 'text-gray-700'}`}>
                                {absentismo.horasAusencia}h
                              </p>
                              <p className="text-xs text-gray-500">{absentismo.porcentajeAbsentismoHoras}%</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded">
                              <p className="text-xs text-gray-600">Cumplimiento</p>
                              <p className="text-lg font-semibold text-purple-600">
                                {Math.min(porcentajeCumplimiento, 100).toFixed(0)}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {porcentajeCumplimiento > 100 ? `+${(horasTrabajadas - empleado.horasContrato).toFixed(0)}h extra` : 'del objetivo'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progreso mensual</span>
                              <span>{porcentajeCumplimiento.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  porcentajeCumplimiento >= 100 ? 'bg-green-500' : 
                                  porcentajeCumplimiento >= 90 ? 'bg-teal-500' : 
                                  porcentajeCumplimiento >= 75 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(porcentajeCumplimiento, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return null;
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB: CONSUMOS INTERNOS */}
          {subTabEquipo === 'consumos-internos' && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <span className="hidden sm:inline">Consumos y Gastos Internos del Equipo</span>
                    <span className="sm:hidden">Gastos del Equipo</span>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const datos = gastosEquipo.map(g => ({
                          'Empleado': g.empleadoNombre,
                          'Categoría': g.categoria,
                          'Descripción': g.descripcion,
                          'Fecha': g.fecha,
                          'Importe': `${g.importe}€`,
                          'Estado': g.estado,
                          'PDV': g.pdv
                        }));
                        exportarAExcel(datos, 'consumos_gastos_internos', ['Empleado', 'Categoría', 'Descripción', 'Fecha', 'Importe', 'Estado', 'PDV']);
                      }}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = gastosEquipo.map(g => ({
                          'Empleado': g.empleadoNombre,
                          'Categoría': g.categoria,
                          'Descripción': g.descripcion,
                          'Fecha': g.fecha,
                          'Importe': `${g.importe}€`,
                          'Estado': g.estado,
                          'PDV': g.pdv
                        }));
                        exportarACSV(datos, 'consumos_gastos_internos', ['Empleado', 'Categoría', 'Descripción', 'Fecha', 'Importe', 'Estado', 'PDV']);
                      }}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = gastosEquipo.map(g => ({
                          'Empleado': g.empleadoNombre,
                          'Categoría': g.categoria,
                          'Descripción': g.descripcion,
                          'Fecha': g.fecha,
                          'Importe': `${g.importe}€`,
                          'Estado': g.estado,
                          'PDV': g.pdv
                        }));
                        exportarAPDF(datos, 'consumos_gastos_internos', ['Empleado', 'Categoría', 'Descripción', 'Fecha', 'Importe', 'Estado', 'PDV'], 'Consumos y Gastos Internos del Equipo');
                      }}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {gastosEquipo.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm sm:text-base">No hay gastos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gastosEquipo.map((gasto) => (
                      <div
                        key={gasto.id}
                        className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                          <AvatarImage src={gasto?.empleadoAvatar} alt={gasto?.empleadoNombre} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {(gasto?.empleadoNombre || 'E').split(' ').map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                              {gasto.empleadoNombre}
                            </h3>
                            <Badge
                              className={`${getCategoriaGastoBadge(gasto.categoria)} text-[10px] sm:text-xs`}
                              variant="outline"
                            >
                              {getCategoriaGastoLabel(gasto.categoria)}
                            </Badge>
                            {getEstadoBadge(gasto.estado)}
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                            <span className="capitalize">{gasto.concepto}</span>
                          </p>

                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            {gasto.fecha && !isNaN(new Date(gasto.fecha).getTime()) ? (
                              <>
                                <span className="hidden sm:inline">{format(new Date(gasto.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                                <span className="sm:hidden">{format(new Date(gasto.fecha), "d MMM yyyy", { locale: es })}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Fecha no disponible</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm text-gray-700 truncate flex-1">{gasto.notas}</p>
                            <p className="text-base sm:text-lg font-semibold text-teal-600 shrink-0">
                              {gasto.importe.toFixed(2)}€
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none h-8 sm:h-9 sm:w-9 sm:p-0"
                            onClick={() => handleAprobarGasto(gasto.id)}
                          >
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="sm:hidden ml-1.5">Aprobar</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-none h-8 sm:h-9 sm:w-9 sm:p-0"
                            onClick={() => handleRechazarGasto(gasto.id)}
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="sm:hidden ml-1.5">Rechazar</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB: MODIFICACIONES */}
          {subTabEquipo === 'modificaciones' && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Modificaciones del Personal
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const datos = incidencias.map(i => ({
                          'Empleado': i.empleadoNombre,
                          'Tipo': i.tipo,
                          'Descripción': i.descripcion,
                          'Fecha': i.fecha,
                          'Estado': i.estado,
                          'Prioridad': i.prioridad || 'Normal',
                          'PDV': i.pdv
                        }));
                        exportarAExcel(datos, 'modificaciones_personal', ['Empleado', 'Tipo', 'Descripción', 'Fecha', 'Estado', 'Prioridad', 'PDV']);
                      }}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = incidencias.map(i => ({
                          'Empleado': i.empleadoNombre,
                          'Tipo': i.tipo,
                          'Descripción': i.descripcion,
                          'Fecha': i.fecha,
                          'Estado': i.estado,
                          'Prioridad': i.prioridad || 'Normal',
                          'PDV': i.pdv
                        }));
                        exportarACSV(datos, 'modificaciones_personal', ['Empleado', 'Tipo', 'Descripción', 'Fecha', 'Estado', 'Prioridad', 'PDV']);
                      }}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const datos = incidencias.map(i => ({
                          'Empleado': i.empleadoNombre,
                          'Tipo': i.tipo,
                          'Descripción': i.descripcion,
                          'Fecha': i.fecha,
                          'Estado': i.estado,
                          'Prioridad': i.prioridad || 'Normal',
                          'PDV': i.pdv
                        }));
                        exportarAPDF(datos, 'modificaciones_personal', ['Empleado', 'Tipo', 'Descripción', 'Fecha', 'Estado', 'Prioridad', 'PDV'], 'Modificaciones del Personal');
                      }}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {incidencias.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm sm:text-base">No hay incidencias registradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incidencias.map((incidencia) => (
                      <div
                        key={incidencia.id}
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {getTipoIncidenciaIcon(incidencia.tipo)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                              {incidencia.empleadoNombre}
                            </h3>
                            {getEstadoBadge(incidencia.estado)}
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] sm:text-xs ${
                                incidencia.prioridad === 'alta' ? 'border-red-600 text-red-600' :
                                incidencia.prioridad === 'media' ? 'border-orange-600 text-orange-600' :
                                'border-gray-600 text-gray-600'
                              }`}
                            >
                              {incidencia.prioridad}
                            </Badge>
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                            <span className="capitalize">{incidencia.tipo}</span> - 
                            <span className="hidden sm:inline"> {format(new Date(incidencia.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                            <span className="sm:hidden"> {format(new Date(incidencia.fecha), "d MMM yyyy", { locale: es })}</span>
                          </p>

                          <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{incidencia.descripcion}</p>
                        </div>

                        <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 shrink-0">
                          <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: FICHAJES */}
        <TabsContent value="fichajes" className="space-y-3 sm:space-y-4 mt-4">
          {/* ⭐ SUB-TABS: Registros | Validación */}
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <Button
              variant={subTabFichajes === 'registros' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabFichajes('registros')}
              className="text-sm"
            >
              <Clock className="w-4 h-4 mr-2" />
              Registro de Fichajes
            </Button>
            <Button
              variant={subTabFichajes === 'validacion' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubTabFichajes('validacion')}
              className="text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validación de Fichajes
            </Button>
          </div>

          {/* SUB-TAB: REGISTROS DE FICHAJES */}
          {subTabFichajes === 'registros' && (
            <GestionFichajes 
              gerenteId="GERENTE-001"
              gerenteNombre="María García"
            />
          )}

          {/* SUB-TAB: VALIDACIÓN DE FICHAJES */}
          {subTabFichajes === 'validacion' && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Validación de Fichajes
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Revisa y aprueba los fichajes del equipo
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        const pendientes = obtenerFichajesPendientesValidacion();
                        const datos = pendientes.map(f => {
                          const empleado = trabajadores.find(t => t.id === f.empleadoId);
                          return {
                            'Empleado': empleado ? `${empleado.nombre} ${empleado.apellidos}` : 'N/A',
                            'PDV': PUNTOS_VENTA[f.pdvId]?.nombre || 'N/A',
                            'Fecha': f.fecha,
                            'Entrada': f.entrada,
                            'Salida': f.salida || 'En curso',
                            'Horas': f.horasTrabajadas.toFixed(2),
                            'Estado': 'Pendiente Validación'
                          };
                        });
                        exportarAExcel(datos, 'fichajes_pendientes_validacion', ['Empleado', 'PDV', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Estado']);
                      }}>
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const pendientes = obtenerFichajesPendientesValidacion();
                        const datos = pendientes.map(f => {
                          const empleado = trabajadores.find(t => t.id === f.empleadoId);
                          return {
                            'Empleado': empleado ? `${empleado.nombre} ${empleado.apellidos}` : 'N/A',
                            'PDV': PUNTOS_VENTA[f.pdvId]?.nombre || 'N/A',
                            'Fecha': f.fecha,
                            'Entrada': f.entrada,
                            'Salida': f.salida || 'En curso',
                            'Horas': f.horasTrabajadas.toFixed(2),
                            'Estado': 'Pendiente Validación'
                          };
                        });
                        exportarACSV(datos, 'fichajes_pendientes_validacion', ['Empleado', 'PDV', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Estado']);
                      }}>
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        const pendientes = obtenerFichajesPendientesValidacion();
                        const datos = pendientes.map(f => {
                          const empleado = trabajadores.find(t => t.id === f.empleadoId);
                          return {
                            'Empleado': empleado ? `${empleado.nombre} ${empleado.apellidos}` : 'N/A',
                            'PDV': PUNTOS_VENTA[f.pdvId]?.nombre || 'N/A',
                            'Fecha': f.fecha,
                            'Entrada': f.entrada,
                            'Salida': f.salida || 'En curso',
                            'Horas': f.horasTrabajadas.toFixed(2),
                            'Estado': 'Pendiente Validación'
                          };
                        });
                        exportarAPDF(datos, 'fichajes_pendientes_validacion', ['Empleado', 'PDV', 'Fecha', 'Entrada', 'Salida', 'Horas', 'Estado'], 'Validación de Fichajes Pendientes');
                      }}>
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Resumen de estado */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-amber-200 bg-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-amber-700">Pendientes de Validar</p>
                            <p className="text-2xl font-semibold text-amber-900">
                              {obtenerFichajesPendientesValidacion().length}
                            </p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-red-700">Fichajes Incompletos</p>
                            <p className="text-2xl font-semibold text-red-900">
                              {obtenerFichajesIncompletos().length}
                            </p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-green-700">Validados</p>
                            <p className="text-2xl font-semibold text-green-900">
                              {fichajes.filter(f => f.validado).length}
                            </p>
                          </div>
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lista de fichajes pendientes */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Fichajes Pendientes de Validación</h3>
                    
                    {obtenerFichajesPendientesValidacion().length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Todos los fichajes están validados</p>
                      </div>
                    ) : (
                      obtenerFichajesPendientesValidacion().map((fichaje) => {
                        const trabajador = trabajadores.find(t => t.id === fichaje.trabajadorId);
                        const pdv = PUNTOS_VENTA[fichaje.puntoVentaId];
                        const tiempoHoras = fichaje.tiempoEfectivoMinutos ? (fichaje.tiempoEfectivoMinutos / 60).toFixed(1) : '-';

                        return (
                          <div key={fichaje.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={trabajador?.avatar} />
                                  <AvatarFallback>
                                    {(trabajador?.nombre || 'E').charAt(0)}{(trabajador?.apellidos || 'A').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm">
                                      {trabajador?.nombre} {trabajador?.apellidos}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {pdv?.nombre}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(fichaje.fecha).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-green-600" />
                                      Entrada: {fichaje.horaEntrada}
                                    </div>
                                    {fichaje.horaSalida && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-red-600" />
                                        Salida: {fichaje.horaSalida}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      {tiempoHoras}h trabajadas
                                    </div>
                                  </div>
                                  {fichaje.pausas && fichaje.pausas.length > 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                      <Coffee className="w-3 h-3" />
                                      {fichaje.pausas.length} pausa(s) - {fichaje.tiempoPausasMinutos}min total
                                    </div>
                                  )}
                                  {fichaje.geolocalizacionEntrada && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                      <MapPin className="w-3 h-3 text-blue-600" />
                                      Ubicación verificada (±{fichaje.geolocalizacionEntrada.precision.toFixed(0)}m)
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    validarFichaje(fichaje.id);
                                    toast.success('Fichaje validado correctamente');
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Validar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            </div>

                            {!fichaje.horaSalida && (
                              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800">
                                  <p className="font-medium">Fichaje incompleto</p>
                                  <p>El trabajador no ha registrado la salida</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Fichajes incompletos */}
                  {obtenerFichajesIncompletos().length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Fichajes Incompletos (sin salida)
                      </h3>
                      
                      {obtenerFichajesIncompletos().map((fichaje) => {
                        const trabajador = trabajadores.find(t => t.id === fichaje.trabajadorId);
                        const pdv = PUNTOS_VENTA[fichaje.puntoVentaId];

                        return (
                          <div key={fichaje.id} className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={trabajador?.avatar} />
                                  <AvatarFallback>
                                    {(trabajador?.nombre || 'E').charAt(0)}{(trabajador?.apellidos || 'A').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-sm text-red-900">
                                    {trabajador?.nombre} {trabajador?.apellidos}
                                  </h4>
                                  <div className="flex gap-3 text-xs text-red-700 mt-1">
                                    <span>{pdv?.nombre}</span>
                                    <span>•</span>
                                    <span>{fichaje.fecha}</span>
                                    <span>•</span>
                                    <span>Entrada: {fichaje.horaEntrada}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="destructive">
                                Sin salida
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: HORARIOS */}
        <TabsContent value="horarios" className="space-y-3 sm:space-y-4 mt-4">
          {/* 📅 Componente unificado de gestión de horarios y solicitudes */}
          <GestionHorarios 
            gerenteId="GERENTE-001"
            gerenteNombre="María García"
          />
        </TabsContent>

        {/* TAB: ONBOARDING */}
        <TabsContent value="onboarding" className="space-y-3 sm:space-y-4 mt-4">
          <DashboardOnboarding 
            empresaId={filtroEmpresaId || "EMPRESA-001"}
            gerenteId="GERENTE-001"
          />
        </TabsContent>

      </Tabs>

      {/* Modal Añadir Empleado */}
      <Dialog open={modalAñadirEmpleado} onOpenChange={setModalAñadirEmpleado}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <DialogTitle className="text-base sm:text-lg">Añadir Empleado</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm mt-1">
                  <span className="hidden sm:inline">Completa los campos para añadir un nuevo empleado a la plantilla.</span>
                  <span className="sm:hidden">Completa los campos del empleado.</span>
                </DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto"
                onClick={() => toast.info('Selecciona archivos para subir')}
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Subir archivos</span>
                <span className="sm:hidden">Archivos</span>
              </Button>
            </div>
          </DialogHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                <Input
                  id="nombre"
                  value={nuevoEmpleado.nombre}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                  placeholder="Ej: Juan"
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos <span className="text-gray-400">(Opcional)</span></Label>
                <Input
                  id="apellidos"
                  value={nuevoEmpleado.apellidos}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, apellidos: e.target.value })}
                  placeholder="Ej: García López"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono <span className="text-gray-400">(Opcional)</span></Label>
                <Input
                  id="telefono"
                  value={nuevoEmpleado.telefono}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })}
                  placeholder="Ej: +34 666 123 456"
                />
              </div>
              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  value={nuevoEmpleado.email}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })}
                  placeholder="Ej: juan@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                <Select value={nuevoEmpleado.tipoContrato} onValueChange={(value) => setNuevoEmpleado({ ...nuevoEmpleado, tipoContrato: value })}>
                  <SelectTrigger id="tipoContrato">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indefinido">Indefinido</SelectItem>
                    <SelectItem value="temporal">Temporal</SelectItem>
                    <SelectItem value="practicas">Prácticas</SelectItem>
                    <SelectItem value="formacion">Formación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="horasSemanales">Horas Semanales</Label>
                <Input
                  id="horasSemanales"
                  type="number"
                  value={nuevoEmpleado.horasSemanales}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, horasSemanales: e.target.value })}
                  placeholder="40"
                />
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-3">Documentación (Opcional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={nuevoEmpleado.dni}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, dni: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nss">NSS</Label>
                  <Input
                    id="nss"
                    value={nuevoEmpleado.nss}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nss: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={nuevoEmpleado.direccion}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, direccion: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={nuevoEmpleado.fechaNacimiento}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, fechaNacimiento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="poblacionNacimiento">Población de Nacimiento</Label>
                  <Input
                    id="poblacionNacimiento"
                    value={nuevoEmpleado.poblacionNacimiento}
                    onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, poblacionNacimiento: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 justify-end pt-4 border-t mt-4">
              <Button variant="outline" onClick={() => setModalAñadirEmpleado(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAñadirEmpleado}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Empleado
              </Button>
            </div>
          </CardContent>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Perfil Empleado */}
      <Dialog open={modalVerPerfil} onOpenChange={setModalVerPerfil}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {empleadoSeleccionado && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="kpis">KPIs</TabsTrigger>
                <TabsTrigger value="permisos">Permisos</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              {/* TAB: PERMISOS */}
              <TabsContent value="permisos" className="space-y-4 mt-6">
              {/* Selector de Rol */}
              <div className="p-4 border rounded-lg bg-gradient-to-br from-teal-50 to-teal-100/30">
                <Label htmlFor="rol-trabajador" className="text-sm font-medium text-gray-900 mb-2 block">
                  Rol asignado
                </Label>
                <Select value={rolSeleccionado} onValueChange={setRolSeleccionado}>
                  <SelectTrigger id="rol-trabajador">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cocinero">Cocinero</SelectItem>
                    <SelectItem value="encargado">Encargado</SelectItem>
                    <SelectItem value="repartidor">Repartidor</SelectItem>
                    <SelectItem value="camarero">Camarero</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-2">
                  El rol determina los permisos predeterminados del empleado
                </p>
              </div>

              {/* Acordeones de permisos */}
              <Accordion type="multiple" className="w-full space-y-2">
                {/* ACCESO AL SISTEMA */}
                <AccordionItem value="acceso-sistema" className="border rounded-lg px-4">
                  <div className="flex items-center justify-between py-4">
                    <AccordionTrigger className="hover:no-underline flex-1 py-0">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-teal-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Acceso al sistema</p>
                          <p className="text-xs text-gray-500">
                            {permisosActivos.iniciar_sesion || permisosActivos.ver_perfil || permisosActivos.recibir_notificaciones
                              ? `${[permisosActivos.iniciar_sesion, permisosActivos.ver_perfil, permisosActivos.recibir_notificaciones].filter(Boolean).length} permisos activos`
                              : 'Sin permisos activos'}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <Checkbox
                      checked={permisosActivos.iniciar_sesion && permisosActivos.ver_perfil && permisosActivos.recibir_notificaciones}
                      onCheckedChange={(checked) => {
                        setPermisosActivos({
                          ...permisosActivos,
                          iniciar_sesion: checked as boolean,
                          ver_perfil: checked as boolean,
                          recibir_notificaciones: checked as boolean
                        });
                      }}
                    />
                  </div>
                  <AccordionContent className="space-y-2 pt-2 pb-4">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Iniciar sesión</span>
                      <Checkbox
                        checked={permisosActivos.iniciar_sesion}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, iniciar_sesion: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver su perfil</span>
                      <Checkbox
                        checked={permisosActivos.ver_perfil}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_perfil: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Recibir notificaciones</span>
                      <Checkbox
                        checked={permisosActivos.recibir_notificaciones}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, recibir_notificaciones: checked as boolean})}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* FICHAR HORARIOS */}
                <AccordionItem value="fichar-horarios" className="border rounded-lg px-4">
                  <div className="flex items-center justify-between py-4">
                    <AccordionTrigger className="hover:no-underline flex-1 py-0">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Fichar horarios</p>
                          <p className="text-xs text-gray-500">
                            {permisosActivos.fichar_entrada_salida || permisosActivos.ver_horas || permisosActivos.ver_calendario
                              ? `${[permisosActivos.fichar_entrada_salida, permisosActivos.ver_horas, permisosActivos.ver_calendario].filter(Boolean).length} permisos activos`
                              : 'Sin permisos activos'}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <Checkbox
                      checked={permisosActivos.fichar_entrada_salida && permisosActivos.ver_horas && permisosActivos.ver_calendario}
                      onCheckedChange={(checked) => {
                        setPermisosActivos({
                          ...permisosActivos,
                          fichar_entrada_salida: checked as boolean,
                          ver_horas: checked as boolean,
                          ver_calendario: checked as boolean
                        });
                      }}
                    />
                  </div>
                  <AccordionContent className="space-y-2 pt-2 pb-4">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Fichar entrada/salida</span>
                      <Checkbox
                        checked={permisosActivos.fichar_entrada_salida}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, fichar_entrada_salida: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver horas</span>
                      <Checkbox
                        checked={permisosActivos.ver_horas}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_horas: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver calendario</span>
                      <Checkbox
                        checked={permisosActivos.ver_calendario}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_calendario: checked as boolean})}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* GESTIÓN DE PEDIDOS */}
                <AccordionItem value="gestion-pedidos" className="border rounded-lg px-4">
                  <div className="flex items-center justify-between py-4">
                    <AccordionTrigger className="hover:no-underline flex-1 py-0">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Gestión de pedidos</p>
                          <p className="text-xs text-gray-500">
                            {[permisosActivos.ver_pedidos, permisosActivos.crear_pedido, permisosActivos.editar_pedido, 
                              permisosActivos.cambiar_estado_cocina, permisosActivos.cambiar_estado_reparto, 
                              permisosActivos.ver_metodo_pago, permisosActivos.ver_costes_escandallo].filter(Boolean).length} de 7 permisos activos
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <Checkbox
                      checked={
                        permisosActivos.ver_pedidos && permisosActivos.crear_pedido && permisosActivos.editar_pedido &&
                        permisosActivos.cambiar_estado_cocina && permisosActivos.cambiar_estado_reparto &&
                        permisosActivos.ver_metodo_pago && permisosActivos.ver_costes_escandallo
                      }
                      onCheckedChange={(checked) => {
                        setPermisosActivos({
                          ...permisosActivos,
                          ver_pedidos: checked as boolean,
                          crear_pedido: checked as boolean,
                          editar_pedido: checked as boolean,
                          cambiar_estado_cocina: checked as boolean,
                          cambiar_estado_reparto: checked as boolean,
                          ver_metodo_pago: checked as boolean,
                          ver_costes_escandallo: checked as boolean
                        });
                      }}
                    />
                  </div>
                  <AccordionContent className="space-y-2 pt-2 pb-4">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver pedidos</span>
                      <Checkbox
                        checked={permisosActivos.ver_pedidos}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_pedidos: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Crear pedido</span>
                      <Checkbox
                        checked={permisosActivos.crear_pedido}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, crear_pedido: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Editar pedido</span>
                      <Checkbox
                        checked={permisosActivos.editar_pedido}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, editar_pedido: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Cambiar estado cocina</span>
                      <Checkbox
                        checked={permisosActivos.cambiar_estado_cocina}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, cambiar_estado_cocina: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Cambiar estado reparto</span>
                      <Checkbox
                        checked={permisosActivos.cambiar_estado_reparto}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, cambiar_estado_reparto: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver método de pago</span>
                      <Checkbox
                        checked={permisosActivos.ver_metodo_pago}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_metodo_pago: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver costes escandallo</span>
                      <Checkbox
                        checked={permisosActivos.ver_costes_escandallo}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_costes_escandallo: checked as boolean})}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* GESTIÓN DE EQUIPO */}
                <AccordionItem value="gestion-equipo" className="border rounded-lg px-4">
                  <div className="flex items-center justify-between py-4">
                    <AccordionTrigger className="hover:no-underline flex-1 py-0">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-orange-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Gestión de equipo</p>
                          <p className="text-xs text-gray-500">
                            {[permisosActivos.ver_empleados, permisosActivos.ver_fichajes_equipo, 
                              permisosActivos.cambiar_roles, permisosActivos.invitar_trabajador].filter(Boolean).length} de 4 permisos activos
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <Checkbox
                      checked={
                        permisosActivos.ver_empleados && permisosActivos.ver_fichajes_equipo &&
                        permisosActivos.cambiar_roles && permisosActivos.invitar_trabajador
                      }
                      onCheckedChange={(checked) => {
                        setPermisosActivos({
                          ...permisosActivos,
                          ver_empleados: checked as boolean,
                          ver_fichajes_equipo: checked as boolean,
                          cambiar_roles: checked as boolean,
                          invitar_trabajador: checked as boolean
                        });
                      }}
                    />
                  </div>
                  <AccordionContent className="space-y-2 pt-2 pb-4">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver empleados</span>
                      <Checkbox
                        checked={permisosActivos.ver_empleados}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_empleados: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ver fichajes del equipo</span>
                      <Checkbox
                        checked={permisosActivos.ver_fichajes_equipo}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, ver_fichajes_equipo: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Cambiar roles</span>
                      <Checkbox
                        checked={permisosActivos.cambiar_roles}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, cambiar_roles: checked as boolean})}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Invitar trabajador</span>
                      <Checkbox
                        checked={permisosActivos.invitar_trabajador}
                        onCheckedChange={(checked) => setPermisosActivos({...permisosActivos, invitar_trabajador: checked as boolean})}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Botón Ver Resumen de Permisos */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => setModalResumenPermisos(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver resumen de permisos
              </Button>

              {/* Dar de baja */}
              <div className="mt-6 pt-6 border-t">
                <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <Label className="text-red-900 font-medium cursor-pointer" htmlFor="dar-de-baja">
                        Dar de baja
                      </Label>
                    </div>
                    <Checkbox 
                      id="dar-de-baja"
                      checked={darDeBaja}
                      onCheckedChange={(checked) => setDarDeBaja(checked as boolean)}
                    />
                  </div>
                  <p className="text-xs text-red-700 mb-3">
                    Al activar esta opción, se iniciará el proceso de baja del empleado en el sistema y la Seguridad Social.
                  </p>
                  {darDeBaja && (
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={handleNotificarGestoria}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Notificar a Gestoría
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB: HISTÓRICO */}
            <TabsContent value="historico" className="space-y-4 mt-6">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-green-600 bg-green-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-gray-900">Alta SS Enfermedad Común</p>
                    </div>
                    <span className="text-xs text-gray-500">05 Nov 2025</span>
                  </div>
                  <p className="text-xs text-gray-600">Reincorporación tras baja médica - Notificado a Gestoría y Seguridad Social</p>
                </div>
                <div className="p-3 border-l-4 border-red-600 bg-red-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm font-medium text-gray-900">Baja SS Enfermedad Común</p>
                    </div>
                    <span className="text-xs text-gray-500">22 Oct 2025</span>
                  </div>
                  <p className="text-xs text-gray-600">Baja médica por gripe - Duración: 14 días - Parte médico enviado a Gestoría</p>
                </div>
                <div className="p-3 border-l-4 border-teal-600 bg-teal-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">Modificación de contrato</p>
                    <span className="text-xs text-gray-500">12 Oct 2025</span>
                  </div>
                  <p className="text-xs text-gray-600">Aumento de jornada de 30h a 40h semanales</p>
                </div>
                <div className="p-3 border-l-4 border-blue-600 bg-blue-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">Finalización formación</p>
                    <span className="text-xs text-gray-500">08 Sep 2025</span>
                  </div>
                  <p className="text-xs text-gray-600">Curso de Panadería Artesanal Avanzada - 40h</p>
                </div>
                <div className="p-3 border-l-4 border-purple-600 bg-purple-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">Renovación de contrato</p>
                    <span className="text-xs text-gray-500">15 Ene 2025</span>
                  </div>
                  <p className="text-xs text-gray-600">Renovación anual con actualización salarial del 5%</p>
                </div>
                <div className="p-3 border-l-4 border-orange-600 bg-orange-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">Actualización salarial</p>
                    <span className="text-xs text-gray-500">01 Jul 2024</span>
                  </div>
                  <p className="text-xs text-gray-600">Incremento salarial del 3% - Nuevo salario: €2.250/mes</p>
                </div>
                <div className="p-3 border-l-4 border-green-600 bg-green-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">Alta en la empresa</p>
                    <span className="text-xs text-gray-500">15 Ene 2023</span>
                  </div>
                  <p className="text-xs text-gray-600">Incorporación como Panadero Maestro - Salario inicial: €2.100/mes</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalVerPerfil(false)}>
              Cerrar
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => {
                if (!porcentajeValido()) {
                  toast.error('La suma de los porcentajes de centros de coste debe ser 100%');
                  return;
                }
                toast.success(`Cambios guardados correctamente para ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellidos}`);
                setModalVerPerfil(false);
              }}
            >
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Modificaciones */}
      <Dialog open={modalModificaciones} onOpenChange={(open) => {
        setModalModificaciones(open);
        if (!open) {
          setEmpleadoFiltro('');
          setTipoModificacion(null);
          setFormModificacion({ fechaInicio: '', nuevoHorario: '', nuevoSalario: '', motivoNovacion: '' });
          setFormFinalizacion({ fechaFinalizacion: '', motivoFinalizacion: '' });
          setFormRemuneracion({ motivo: '', euros: '' });
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Nueva Modificación</DialogTitle>
                <DialogDescription>Selecciona el empleado y el tipo de modificación a realizar</DialogDescription>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Upload className="w-4 h-4 mr-2" />
                Subir archivo
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Seleccionar Empleado - Movido arriba */}
            <div>
              <Label htmlFor="empleadoSelect" className="mb-2 block">Seleccionar empleado</Label>
              <Select 
                value={empleadoFiltro}
                onValueChange={setEmpleadoFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.apellidos} - {emp.puesto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de tipo de modificación */}
            <div>
              <Label className="mb-3 block">Tipo de modificación</Label>
              <div className="flex gap-2">
                <Button 
                  variant={tipoModificacion === 'modificacion' ? 'default' : 'outline'}
                  className={tipoModificacion === 'modificacion' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setTipoModificacion('modificacion')}
                >
                  Modificaciones
                </Button>
                <Button 
                  variant={tipoModificacion === 'finalizacion' ? 'default' : 'outline'}
                  className={tipoModificacion === 'finalizacion' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setTipoModificacion('finalizacion')}
                >
                  Finalizaciones
                </Button>
                <Button 
                  variant={tipoModificacion === 'remuneracion' ? 'default' : 'outline'}
                  className={tipoModificacion === 'remuneracion' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={() => setTipoModificacion('remuneracion')}
                >
                  Remuneraciones
                </Button>
              </div>
            </div>

            {/* Formularios según el tipo de modificación */}
            {tipoModificacion === 'finalizacion' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fechaFin">Fecha fin</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formFinalizacion.fechaFinalizacion}
                      onChange={(e) => setFormFinalizacion({ ...formFinalizacion, fechaFinalizacion: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motivoFin">Motivo</Label>
                    <Input
                      id="motivoFin"
                      placeholder="Ej: Fin de contrato temporal, dimisión voluntaria..."
                      value={formFinalizacion.motivoFinalizacion}
                      onChange={(e) => setFormFinalizacion({ ...formFinalizacion, motivoFinalizacion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoModificacion === 'remuneracion' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="motivoRemuneracion">Motivo</Label>
                    <Input
                      id="motivoRemuneracion"
                      placeholder="Ej: Bonus mensual, horas extras, incentivo..."
                      value={formRemuneracion.motivo}
                      onChange={(e) => setFormRemuneracion({ ...formRemuneracion, motivo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="euros">Euros</Label>
                    <Input
                      id="euros"
                      type="text"
                      placeholder="500,00 €"
                      value={formRemuneracion.euros}
                      onChange={(e) => setFormRemuneracion({ ...formRemuneracion, euros: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {tipoModificacion === 'modificacion' && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fechaInicio">Fecha de inicio modificación</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formModificacion.fechaInicio}
                      onChange={(e) => setFormModificacion({ ...formModificacion, fechaInicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuevoSalario">Nuevo salario (si cambia)</Label>
                    <Input
                      id="nuevoSalario"
                      type="text"
                      placeholder="2.500,00 €"
                      value={formModificacion.nuevoSalario}
                      onChange={(e) => setFormModificacion({ ...formModificacion, nuevoSalario: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuevasFunciones">Nuevas funciones</Label>
                    <Input
                      id="nuevasFunciones"
                      placeholder="Ej: Responsable de Producción"
                      value={formModificacion.nuevoHorario}
                      onChange={(e) => setFormModificacion({ ...formModificacion, nuevoHorario: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="motivoMod">Motivo</Label>
                    <Input
                      id="motivoMod"
                      placeholder="Ej: Promoción interna, cambio de departamento..."
                      value={formModificacion.motivoNovacion}
                      onChange={(e) => setFormModificacion({ ...formModificacion, motivoNovacion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setModalModificaciones(false)}
            >
              Cancelar
            </Button>
            {tipoModificacion && (
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleGuardarModificacion}
              >
                Confirmar
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Permisos */}
      {empleadoSeleccionado && (
        <ModalPermisosEmpleado
          isOpen={modalPermisos}
          onOpenChange={setModalPermisos}
          empleado={{
            id: empleadoSeleccionado.id,
            nombre: `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellidos}`,
            codigo: empleadoSeleccionado.id,
            rol: empleadoSeleccionado.puesto,
            email: empleadoSeleccionado.email,
            telefono: empleadoSeleccionado.telefono,
            puesto: empleadoSeleccionado.puesto,
            empresa: 'PAU Hostelería',
            marca: 'Pizza',
            puntoVenta: 'Tiana'
          }}
        />
      )}

      {/* Modal Resumen de Permisos */}
      <Dialog open={modalResumenPermisos} onOpenChange={setModalResumenPermisos}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              Resumen de permisos activos
            </DialogTitle>
            <DialogDescription>
              {empleadoSeleccionado && `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellidos} • Rol: ${rolSeleccionado}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Acceso al sistema */}
            {(permisosActivos.iniciar_sesion || permisosActivos.ver_perfil || permisosActivos.recibir_notificaciones) && (
              <div className="border-l-4 border-teal-600 bg-teal-50 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <h3 className="font-medium text-gray-900">Acceso al sistema</h3>
                </div>
                <div className="space-y-2 ml-7">
                  {permisosActivos.iniciar_sesion && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Iniciar sesión</span>
                    </div>
                  )}
                  {permisosActivos.ver_perfil && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver su perfil</span>
                    </div>
                  )}
                  {permisosActivos.recibir_notificaciones && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Recibir notificaciones</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fichar horarios */}
            {(permisosActivos.fichar_entrada_salida || permisosActivos.ver_horas || permisosActivos.ver_calendario) && (
              <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Fichar horarios</h3>
                </div>
                <div className="space-y-2 ml-7">
                  {permisosActivos.fichar_entrada_salida && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Fichar entrada/salida</span>
                    </div>
                  )}
                  {permisosActivos.ver_horas && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver horas</span>
                    </div>
                  )}
                  {permisosActivos.ver_calendario && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver calendario</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gestión de pedidos */}
            {(permisosActivos.ver_pedidos || permisosActivos.crear_pedido || permisosActivos.editar_pedido || 
              permisosActivos.cambiar_estado_cocina || permisosActivos.cambiar_estado_reparto || 
              permisosActivos.ver_metodo_pago || permisosActivos.ver_costes_escandallo) && (
              <div className="border-l-4 border-purple-600 bg-purple-50 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-gray-900">Gestión de pedidos</h3>
                </div>
                <div className="space-y-2 ml-7">
                  {permisosActivos.ver_pedidos && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver pedidos</span>
                    </div>
                  )}
                  {permisosActivos.crear_pedido && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Crear pedido</span>
                    </div>
                  )}
                  {permisosActivos.editar_pedido && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Editar pedido</span>
                    </div>
                  )}
                  {permisosActivos.cambiar_estado_cocina && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Cambiar estado cocina</span>
                    </div>
                  )}
                  {permisosActivos.cambiar_estado_reparto && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Cambiar estado reparto</span>
                    </div>
                  )}
                  {permisosActivos.ver_metodo_pago && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver método de pago</span>
                    </div>
                  )}
                  {permisosActivos.ver_costes_escandallo && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver costes escandallo</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gestión de equipo */}
            {(permisosActivos.ver_empleados || permisosActivos.ver_fichajes_equipo || 
              permisosActivos.cambiar_roles || permisosActivos.invitar_trabajador) && (
              <div className="border-l-4 border-orange-600 bg-orange-50 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Gestión de equipo</h3>
                </div>
                <div className="space-y-2 ml-7">
                  {permisosActivos.ver_empleados && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver empleados</span>
                    </div>
                  )}
                  {permisosActivos.ver_fichajes_equipo && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Ver fichajes del equipo</span>
                    </div>
                  )}
                  {permisosActivos.cambiar_roles && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Cambiar roles</span>
                    </div>
                  )}
                  {permisosActivos.invitar_trabajador && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Invitar trabajador</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resumen total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total de permisos activos:</span>
                <Badge className="bg-teal-600">
                  {Object.values(permisosActivos).filter(Boolean).length} de {Object.keys(permisosActivos).length}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalResumenPermisos(false)}>
              Cerrar
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => {
                console.log('💾 GUARDAR PERMISOS:', {
                  empleadoId: empleadoSeleccionado?.id,
                  rol: rolSeleccionado,
                  permisos: permisosActivos
                });
                toast.success('Permisos guardados correctamente');
                setModalResumenPermisos(false);
              }}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: INVITAR EMPLEADO */}
      <ModalInvitarEmpleado 
        isOpen={modalInvitarEmpleado} 
        onOpenChange={setModalInvitarEmpleado}
        empresaId="EMPRESA-001"
        empresaNombre="Los Pecados"
        onInvitacionCreada={() => {
          toast.success('Invitación enviada correctamente');
        }}
      />

      {/* ⭐ MODAL: GESTIÓN DE TURNOS */}
      <Dialog open={modalGestionTurnos} onOpenChange={(open) => {
        setModalGestionTurnos(open);
        if (!open) {
          setStepGestionTurnos('config');
          setCopiarDe('ninguno');
          setEstadoTurnos('borrador');
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Gestión de Turnos</DialogTitle>
                <DialogDescription>
                  Planifica horarios basándote en ventas y objetivos
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={estadoTurnos === 'borrador' ? 'outline' : 'default'} className={estadoTurnos === 'publicado' ? 'bg-green-600' : ''}>
                  {estadoTurnos === 'borrador' ? 'Borrador' : 'Publicado'}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* STEPPER */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepGestionTurnos === 'config' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium ${stepGestionTurnos === 'config' ? 'text-teal-600' : 'text-gray-500'}`}>
                  Configuración
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200" />
              
              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepGestionTurnos === 'asignacion' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${stepGestionTurnos === 'asignacion' ? 'text-teal-600' : 'text-gray-500'}`}>
                  Asignación
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200" />
              
              {/* Step 3 */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepGestionTurnos === 'revision' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className={`text-sm font-medium ${stepGestionTurnos === 'revision' ? 'text-teal-600' : 'text-gray-500'}`}>
                  Revisión
                </span>
              </div>
            </div>
          </div>

          {/* ⭐ FILTROS DE EMPRESA/MARCA/PDV */}
          <Card className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Filtrar turnos por:
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {/* Filtro Empresa */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Empresa</label>
                    <select 
                      className="w-full h-9 text-xs rounded-md border border-gray-300 px-3 bg-white"
                      value={filtroTurnosEmpresa}
                      onChange={(e) => {
                        setFiltroTurnosEmpresa(e.target.value);
                        setFiltroTurnosMarca('');
                        setFiltroTurnosPDV('');
                      }}
                    >
                      <option value="">Todas las empresas</option>
                      {EMPRESAS_ARRAY.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Marca */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Marca</label>
                    <select 
                      className="w-full h-9 text-xs rounded-md border border-gray-300 px-3 bg-white"
                      value={filtroTurnosMarca}
                      onChange={(e) => {
                        setFiltroTurnosMarca(e.target.value);
                        setFiltroTurnosPDV('');
                      }}
                      disabled={!filtroTurnosEmpresa}
                    >
                      <option value="">Todas las marcas</option>
                      {filtroTurnosEmpresa && MARCAS_ARRAY
                        .filter(marca => marca.empresaId === filtroTurnosEmpresa)
                        .map(marca => (
                          <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                        ))}
                    </select>
                  </div>

                  {/* Filtro PDV */}
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Punto de Venta</label>
                    <select 
                      className="w-full h-9 text-xs rounded-md border border-gray-300 px-3 bg-white"
                      value={filtroTurnosPDV}
                      onChange={(e) => setFiltroTurnosPDV(e.target.value)}
                      disabled={!filtroTurnosMarca}
                    >
                      <option value="">Todos los PDV</option>
                      {filtroTurnosMarca && PUNTOS_VENTA_ARRAY
                        .filter(pdv => pdv.marcaId === filtroTurnosMarca)
                        .map(pdv => (
                          <option key={pdv.id} value={pdv.id}>{pdv.nombre}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Botón limpiar filtros */}
                {(filtroTurnosEmpresa || filtroTurnosMarca || filtroTurnosPDV) && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setFiltroTurnosEmpresa('');
                      setFiltroTurnosMarca('');
                      setFiltroTurnosPDV('');
                    }}
                    className="text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Indicador de filtro activo */}
              {filtroTurnosPDV && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-gray-700">
                    Mostrando turnos de: <strong>{getNombreEmpresa(filtroTurnosEmpresa)}</strong> › 
                    <strong>{getNombreMarca(filtroTurnosMarca)}</strong> › 
                    <strong>{PUNTOS_VENTA_ARRAY.find(pdv => pdv.id === filtroTurnosPDV)?.nombre}</strong>
                  </span>
                </div>
              )}
              {filtroTurnosMarca && !filtroTurnosPDV && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-gray-700">
                    Mostrando turnos de: <strong>{getNombreEmpresa(filtroTurnosEmpresa)}</strong> › 
                    <strong>{getNombreMarca(filtroTurnosMarca)}</strong> › Todos los PDV
                  </span>
                </div>
              )}
              {filtroTurnosEmpresa && !filtroTurnosMarca && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span className="text-gray-700">
                    Mostrando turnos de: <strong>{getNombreEmpresa(filtroTurnosEmpresa)}</strong> › Todas las marcas
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 1: CONFIGURACIÓN */}
          {stepGestionTurnos === 'config' && (
            <div className="space-y-6">
              {/* Copiar de semana/mes anterior o plantilla */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Copy className="w-5 h-5 text-teal-600" />
                    Copiar Configuración
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant={copiarDe === 'ninguno' ? 'default' : 'outline'}
                      className={copiarDe === 'ninguno' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setCopiarDe('ninguno')}
                    >
                      Desde Cero
                    </Button>
                    <Button
                      variant={copiarDe === 'semana-anterior' ? 'default' : 'outline'}
                      className={copiarDe === 'semana-anterior' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setCopiarDe('semana-anterior')}
                    >
                      Semana Anterior
                    </Button>
                    <Button
                      variant={copiarDe === 'mes-anterior' ? 'default' : 'outline'}
                      className={copiarDe === 'mes-anterior' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setCopiarDe('mes-anterior')}
                    >
                      Mes Anterior
                    </Button>
                    <Button
                      variant={copiarDe === 'plantilla' ? 'default' : 'outline'}
                      className={copiarDe === 'plantilla' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setCopiarDe('plantilla')}
                    >
                      Plantilla
                    </Button>
                  </div>
                  
                  {copiarDe === 'plantilla' && (
                    <div className="mt-4">
                      <Label>Seleccionar plantilla</Label>
                      <select 
                        className="w-full h-10 rounded-md border border-gray-300 px-3 mt-2"
                        value={plantillaSeleccionada}
                        onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                      >
                        <option value="">Selecciona una plantilla...</option>
                        <option value="temporada-alta">Temporada Alta</option>
                        <option value="temporada-baja">Temporada Baja</option>
                        <option value="fin-semana">Fin de Semana</option>
                        <option value="festivos">Festivos</option>
                      </select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Análisis de Ventas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    Análisis de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      variant={periodoVentas === 'semana-anterior' ? 'default' : 'outline'}
                      size="sm"
                      className={periodoVentas === 'semana-anterior' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPeriodoVentas('semana-anterior')}
                    >
                      Semana Anterior
                    </Button>
                    <Button
                      variant={periodoVentas === 'personalizado' ? 'default' : 'outline'}
                      size="sm"
                      className={periodoVentas === 'personalizado' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPeriodoVentas('personalizado')}
                    >
                      Período Personalizado
                    </Button>
                  </div>

                  {periodoVentas === 'personalizado' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Fecha inicio</Label>
                        <Input
                          type="date"
                          value={fechaInicioVentas}
                          onChange={(e) => setFechaInicioVentas(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fecha fin</Label>
                        <Input
                          type="date"
                          value={fechaFinVentas}
                          onChange={(e) => setFechaFinVentas(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Gráfico de ventas */}
                  <div className="grid grid-cols-7 gap-2 mt-4">
                    {Object.entries(ventasSemanaAnterior).map(([dia, venta]) => (
                      <div key={dia} className="text-center">
                        <div className="text-xs text-gray-500 capitalize mb-1">{dia.substring(0, 3)}</div>
                        <div 
                          className="bg-teal-100 rounded-t-lg mx-auto" 
                          style={{ 
                            height: `${(venta / 5100) * 120}px`,
                            width: '100%'
                          }}
                        />
                        <div className="text-xs font-medium mt-1">{venta}€</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Objetivos por día */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    Objetivos de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.keys(objetivosPorDia).map((dia) => (
                      <div key={dia}>
                        <Label className="text-xs capitalize">{dia.substring(0, 3)}</Label>
                        <Input
                          type="number"
                          placeholder="€"
                          value={objetivosPorDia[dia as keyof typeof objetivosPorDia]}
                          onChange={(e) => setObjetivosPorDia({
                            ...objetivosPorDia,
                            [dia]: e.target.value
                          })}
                          className="text-sm h-9"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Recomendación inteligente */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Recomendación Inteligente</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Basándonos en las ventas anteriores, te recomendamos: <strong>2-3 empleados</strong> de lunes a jueves, 
                          <strong> 4-5 empleados</strong> viernes y sábado, y <strong>3-4 empleados</strong> domingo.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2: ASIGNACIÓN DE TURNOS */}
          {stepGestionTurnos === 'asignacion' && (
            <div className="space-y-6">
              {/* ⭐ DISPONIBILIDAD DE EMPLEADOS */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-teal-600" />
                      Disponibilidad de Empleados
                    </CardTitle>
                    
                    {/* ⭐ FILTROS */}
                    <div className="flex gap-2">
                      <select 
                        className="h-9 text-xs rounded-md border border-gray-300 px-3"
                        value={filtroDisponibilidadPuesto}
                        onChange={(e) => setFiltroDisponibilidadPuesto(e.target.value)}
                      >
                        <option value="todos">Todos los puestos</option>
                        <option value="Cocinero">Cocineros</option>
                        <option value="Repartidor">Repartidores</option>
                        <option value="Administrativo">Administrativos</option>
                      </select>
                      
                      <select 
                        className="h-9 text-xs rounded-md border border-gray-300 px-3"
                        value={filtroDisponibilidadEstado}
                        onChange={(e) => setFiltroDisponibilidadEstado(e.target.value)}
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="disponible">Solo disponibles</option>
                        <option value="vacaciones">Solo vacaciones</option>
                        <option value="baja">Solo bajas</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Contador de resultados */}
                  <div className="mb-3 text-sm text-gray-600">
                    Mostrando <strong>{empleadosFiltrados.length}</strong> de <strong>{disponibilidadEmpleados.length}</strong> empleados
                  </div>
                  
                  <div className="space-y-2">
                    {empleadosFiltrados.map((emp) => (
                      <div 
                        key={emp.id} 
                        className={`grid grid-cols-12 gap-3 items-center p-3 rounded-lg border ${
                          emp.estado === 'disponible' 
                            ? 'bg-green-50 border-green-200' 
                            : emp.estado === 'vacaciones'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-gray-900">{emp.nombre}</p>
                          <p className="text-xs text-gray-500">{emp.id} • {emp.puesto}</p>
                        </div>
                        <div className="col-span-2">
                          <Badge 
                            variant={emp.estado === 'disponible' ? 'default' : 'outline'}
                            className={
                              emp.estado === 'disponible' 
                                ? 'bg-green-600' 
                                : emp.estado === 'vacaciones'
                                ? 'bg-orange-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                          >
                            {emp.estado === 'disponible' ? 'Disponible' : emp.estado === 'vacaciones' ? 'Vacaciones' : 'Baja médica'}
                          </Badge>
                        </div>
                        <div className="col-span-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Horas asignadas</span>
                              <span className="font-medium">{emp.horasAsignadas}/{emp.maxHoras}h</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  emp.horasAsignadas >= 38 ? 'bg-orange-500' : 'bg-teal-600'
                                }`}
                                style={{ width: `${(emp.horasAsignadas / emp.maxHoras) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3">
                          {emp.incidencias.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-orange-600" />
                              <p className="text-xs text-orange-700">{emp.incidencias[0]}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Sin incidencias</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Leyenda */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded" />
                      <span>Disponible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded" />
                      <span>Vacaciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded" />
                      <span>Baja médica</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    Asignar Empleados a Turnos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Tabla de turnos por día */}
                  <div className="space-y-4">
                    {Object.keys(objetivosPorDia).map((dia) => (
                      <div key={dia} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium capitalize">{dia}</h4>
                            <p className="text-xs text-gray-500">
                              Objetivo: {objetivosPorDia[dia as keyof typeof objetivosPorDia] || 0}€ • 
                              Ventas anteriores: {ventasSemanaAnterior[dia as keyof typeof ventasSemanaAnterior]}€
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Añadir Turno
                          </Button>
                        </div>
                        
                        {/* Turnos del día (ejemplo) */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded">
                            <div className="col-span-3">
                              <select className="w-full h-8 text-xs rounded border">
                                <option value="">Seleccionar empleado...</option>
                                {empleados.slice(0, 5).map(emp => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.nombre} {emp.apellidos}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <select className="w-full h-8 text-xs rounded border">
                                <option value="cocinero">Cocinero</option>
                                <option value="repartidor">Repartidor</option>
                                <option value="admin">Administrativo</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <Input type="time" className="h-8 text-xs" defaultValue="09:00" />
                            </div>
                            <div className="col-span-2">
                              <Input type="time" className="h-8 text-xs" defaultValue="17:00" />
                            </div>
                            <div className="col-span-2 text-center">
                              <Badge variant="outline" className="text-xs">8h</Badge>
                            </div>
                            <div className="col-span-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: REVISIÓN */}
          {stepGestionTurnos === 'revision' && (
            <div className="space-y-6">
              {/* Resumen de costes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    Resumen de Costes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Horas</p>
                      <p className="text-2xl font-bold text-gray-900">280h</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Coste Nómina</p>
                      <p className="text-2xl font-bold text-gray-900">4.200€</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Objetivo Ventas</p>
                      <p className="text-2xl font-bold text-gray-900">22.000€</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700">% sobre Ventas</p>
                      <p className="text-2xl font-bold text-green-700">19%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ⭐ COMPARATIVA CON SEMANAS ANTERIORES */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                    Comparativa con Semanas Anteriores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead className="text-center">Horas</TableHead>
                          <TableHead className="text-center">Coste Nómina</TableHead>
                          <TableHead className="text-center">Ventas</TableHead>
                          <TableHead className="text-center">% Coste/Ventas</TableHead>
                          <TableHead className="text-center">Tendencia</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costesSemanasAnteriores.map((semana, index) => (
                          <TableRow key={index} className={semana.semana.includes('plan') ? 'bg-teal-50' : ''}>
                            <TableCell className="font-medium">
                              {semana.semana}
                              {semana.semana.includes('plan') && (
                                <Badge className="ml-2 bg-teal-600 text-xs">Planificación</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">{semana.horas}h</TableCell>
                            <TableCell className="text-center font-medium">{semana.coste.toLocaleString()}€</TableCell>
                            <TableCell className="text-center font-medium">{semana.ventas.toLocaleString()}€</TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline"
                                className={
                                  semana.porcentaje < 18 
                                    ? 'bg-green-50 text-green-700 border-green-300' 
                                    : semana.porcentaje < 20
                                    ? 'bg-orange-50 text-orange-700 border-orange-300'
                                    : 'bg-red-50 text-red-700 border-red-300'
                                }
                              >
                                {semana.porcentaje}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {index > 0 && (
                                semana.porcentaje < costesSemanasAnteriores[index - 1].porcentaje ? (
                                  <div className="flex items-center justify-center gap-1 text-green-600">
                                    <TrendingUp className="w-4 h-4 rotate-180" />
                                    <span className="text-xs">Mejora</span>
                                  </div>
                                ) : semana.porcentaje > costesSemanasAnteriores[index - 1].porcentaje ? (
                                  <div className="flex items-center justify-center gap-1 text-red-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs">Empeora</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1 text-gray-600">
                                    <span className="text-xs">Igual</span>
                                  </div>
                                )
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* ⭐ GRÁFICO DE LÍNEAS */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Evolución de % Coste/Ventas</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={costesSemanasAnteriores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="semana" 
                          tick={{ fontSize: 11 }}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }}
                          domain={[16, 21]}
                          label={{ value: '% Coste/Ventas', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                        />
                        <Tooltip 
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          formatter={(value: any) => [`${value}%`, '% Coste/Ventas']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="porcentaje" 
                          stroke="#0d9488" 
                          strokeWidth={2}
                          dot={{ fill: '#0d9488', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* ⭐ GRÁFICO DE BARRAS APILADAS */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución de Costes vs Ventas</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={costesSemanasAnteriores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="semana" 
                          tick={{ fontSize: 11 }}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }}
                          label={{ value: 'Euros (€)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                        />
                        <Tooltip 
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          formatter={(value: any) => [`${value.toLocaleString()}€`, '']}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: 11 }}
                          iconType="rect"
                        />
                        <Bar 
                          dataKey="coste" 
                          stackId="a" 
                          fill="#ef4444" 
                          name="Coste Nómina"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar 
                          dataKey="ventas" 
                          stackId="b" 
                          fill="#10b981" 
                          name="Ventas"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Leyenda explicativa */}
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <div className="w-3 h-3 bg-red-500 rounded" />
                        <div>
                          <p className="font-medium text-red-900">Coste Nómina</p>
                          <p className="text-red-700">Gasto en personal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <div>
                          <p className="font-medium text-green-900">Ventas</p>
                          <p className="text-green-700">Ingresos totales</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resumen de tendencia */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Análisis de Tendencia</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Tu planificación está en línea con el promedio histórico (19%). 
                          La semana con mejor eficiencia fue hace 2 semanas con un 17.9% de coste sobre ventas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Validaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-teal-600" />
                    Validaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>No hay conflictos de horarios</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      <span>Todos los empleados dentro de horas máximas (40h/semana)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Carlos Méndez tiene 2 turnos el mismo día (revisar)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vista previa calendario */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-teal-600" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.keys(objetivosPorDia).map((dia) => (
                      <div key={dia} className="border rounded p-2">
                        <p className="text-xs font-medium capitalize mb-2">{dia}</p>
                        <div className="space-y-1">
                          <div className="text-[10px] p-1 bg-blue-100 rounded">
                            👨‍🍳 Carlos M.
                            <br />
                            <span className="text-gray-600">09:00-17:00</span>
                          </div>
                          <div className="text-[10px] p-1 bg-green-100 rounded">
                            🚗 Ana L.
                            <br />
                            <span className="text-gray-600">12:00-20:00</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ⭐ HISTORIAL DE VERSIONES */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="w-5 h-5 text-teal-600" />
                      Historial de Versiones
                    </CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setModalHistorialVersiones(true)}
                    >
                      Ver historial completo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {historialVersionesTurnos.slice(0, 2).map((version) => (
                      <div key={version.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {version.version}
                            </Badge>
                            <h4 className="text-sm font-medium text-gray-900">{version.semana}</h4>
                          </div>
                          <Badge className="bg-green-600 text-xs">{version.estado}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                          <div>📅 {version.fechaPublicacion}</div>
                          <div>👤 {version.publicadoPor}</div>
                          <div>⏱️ {version.totalHoras}h totales</div>
                          <div>👥 {version.totalEmpleados} empleados</div>
                        </div>
                        
                        {version.modificaciones && (
                          <div className="text-xs text-gray-500 italic border-t pt-2 mt-2">
                            📝 {version.modificaciones}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 text-xs text-center text-gray-500">
                    Mostrando las 2 versiones más recientes
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="flex justify-between gap-3 pt-4 border-t">
            <div className="flex gap-2">
              {stepGestionTurnos !== 'config' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (stepGestionTurnos === 'asignacion') setStepGestionTurnos('config');
                    if (stepGestionTurnos === 'revision') setStepGestionTurnos('asignacion');
                  }}
                >
                  <ChevronDown className="w-4 h-4 mr-2 rotate-90" />
                  Anterior
                </Button>
              )}
              
              {/* ⭐ CONFIGURACIÓN DE NOTIFICACIONES (solo en paso revisión) */}
              {stepGestionTurnos === 'revision' && (
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
                  <Checkbox 
                    id="notificar-publicacion"
                    checked={notificarPublicacion}
                    onCheckedChange={(checked) => setNotificarPublicacion(checked as boolean)}
                  />
                  <label 
                    htmlFor="notificar-publicacion" 
                    className="text-sm text-gray-700 cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-600" />
                    Enviar notificación push a empleados
                  </label>
                </div>
              )}

              {/* ⭐ BOTONES DE EXPORTACIÓN (solo en paso revisión) */}
              {stepGestionTurnos === 'revision' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleExportarTurnos('pdf')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Exportar a PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportarTurnos('excel')}>
                      <FileDown className="w-4 h-4 mr-2" />
                      Exportar a Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalGestionTurnos(false)}>
                Cancelar
              </Button>
              
              {stepGestionTurnos === 'revision' ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEstadoTurnos('borrador');
                      toast.success('Turnos guardados como borrador');
                      setModalGestionTurnos(false);
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Borrador
                  </Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      setEstadoTurnos('publicado');
                      
                      // Notificaciones push si están activadas
                      if (notificarPublicacion) {
                        toast.success('📅 Turnos publicados correctamente', {
                          description: 'Los empleados recibirán una notificación push'
                        });
                        
                        // Simular envío de notificaciones push
                        setTimeout(() => {
                          toast.success('🔔 Notificaciones enviadas', {
                            description: '6 empleados notificados correctamente'
                          });
                        }, 1500);
                      } else {
                        toast.success('📅 Turnos publicados correctamente', {
                          description: 'Sin notificaciones (desactivadas)'
                        });
                      }
                      
                      setModalGestionTurnos(false);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {notificarPublicacion ? 'Publicar y Notificar' : 'Publicar sin Notificar'}
                  </Button>
                </>
              ) : (
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    if (stepGestionTurnos === 'config') setStepGestionTurnos('asignacion');
                    if (stepGestionTurnos === 'asignacion') setStepGestionTurnos('revision');
                  }}
                >
                  Siguiente
                  <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ⭐ MODAL: HISTORIAL COMPLETO DE VERSIONES */}
      <Dialog open={modalHistorialVersiones} onOpenChange={setModalHistorialVersiones}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <History className="w-6 h-6 text-teal-600" />
              Historial Completo de Versiones
            </DialogTitle>
            <DialogDescription>
              Todas las planificaciones de turnos publicadas
            </DialogDescription>
          </DialogHeader>

          {/* ⭐ FILTROS DE FECHA Y EXPORTAR */}
          <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg border">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Desde</Label>
                <Input 
                  type="date" 
                  className="h-9 text-xs mt-1"
                  value={filtroHistorialFechaDesde}
                  onChange={(e) => setFiltroHistorialFechaDesde(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Hasta</Label>
                <Input 
                  type="date" 
                  className="h-9 text-xs mt-1"
                  value={filtroHistorialFechaHasta}
                  onChange={(e) => setFiltroHistorialFechaHasta(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {(filtroHistorialFechaDesde || filtroHistorialFechaHasta) && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setFiltroHistorialFechaDesde('');
                    setFiltroHistorialFechaHasta('');
                  }}
                  className="h-9"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpiar
                </Button>
              )}
              
              <Button 
                size="sm"
                onClick={handleExportarHistorialCSV}
                className="bg-teal-600 hover:bg-teal-700 h-9"
              >
                <Download className="w-3 h-3 mr-1" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-gray-600">
            Mostrando <strong>{historialFiltrado.length}</strong> de <strong>{historialVersionesTurnos.length}</strong> versiones
          </div>

          <div className="space-y-3">
            {historialFiltrado.map((version, index) => (
              <div key={version.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-teal-700">#{historialFiltrado.length - index}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {version.version}
                        </Badge>
                        <h4 className="text-base font-medium text-gray-900">{version.semana}</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Publicado el {version.fechaPublicacion} por {version.publicadoPor}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600">{version.estado}</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total Horas</p>
                    <p className="text-lg font-bold text-gray-900">{version.totalHoras}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Empleados</p>
                    <p className="text-lg font-bold text-gray-900">{version.totalEmpleados}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Media por empleado</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(version.totalHoras / version.totalEmpleados)}h
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver detalles
                  </Button>
                  <Button size="sm" variant="outline">
                    Descargar PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}