import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Clock, 
  PlayCircle, 
  PauseCircle, 
  StopCircle,
  Calendar,
  TrendingUp,
  Coffee,
  MapPin,
  Navigation,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Euro,
  Plus,
  ShoppingBag,
  UtensilsCrossed
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================
// INTERFACES
// ============================================

// ESTRUCTURA PARA BASE DE DATOS (Supabase)
// Tabla: fichajes
// Campos:
//   - id (uuid, primary key)
//   - trabajador_id (uuid, foreign key -> usuarios)
//   - punto_venta_id (uuid, foreign key -> puntos_venta)
//   - fecha_entrada (date)
//   - hora_entrada (time)
//   - fecha_salida (date, nullable)
//   - hora_salida (time, nullable)
//   - tiempo_total (interval, nullable)
//   - geolocalizacion_entrada (jsonb: {latitud, longitud, precision})
//   - geolocalizacion_salida (jsonb, nullable)
//   - pausas (jsonb array, nullable)
//   - created_at (timestamp)

export interface FichajeColaboradorRef {
  abrirModalFichaje: () => void;
  fichajarSalida: () => void;
  estaFichado: () => boolean;
}

export interface FichajeColaboradorProps {
  onFichajeChange?: (fichado: boolean) => void;
}

interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  activo: boolean;
}

interface FichajeActivo {
  id: string;
  trabajadorId: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  fechaEntrada: Date;
  horaEntrada: string;
  geolocalizacion?: {
    latitud: number;
    longitud: number;
    precision: number;
  };
  enPausa: boolean;
}

// ============================================
// DATOS MOCK - PDVs (desde ConfiguracionEmpresas del Gerente)
// ============================================

const puntosVentaMock: PuntoVenta[] = [
  {
    id: 'PDV-TIANA',
    nombre: 'Tiana',
    direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
    coordenadas: {
      latitud: 41.4933,
      longitud: 2.2633,
    },
    activo: true,
  },
  {
    id: 'PDV-BADALONA',
    nombre: 'Badalona',
    direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
    coordenadas: {
      latitud: 41.4500,
      longitud: 2.2461,
    },
    activo: true,
  },
];

export const FichajeColaborador = forwardRef<FichajeColaboradorRef, FichajeColaboradorProps>((props, ref) => {
  const { onFichajeChange } = props;
  const [fichadoActivo, setFichadoActivo] = useState<FichajeActivo | null>(null);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoActual, setTiempoActual] = useState('00:00:00');
  
  // Estados para el modal de fichaje
  const [modalFichajeOpen, setModalFichajeOpen] = useState(false);
  const [pdvSeleccionado, setPdvSeleccionado] = useState<string>('');
  const [geolocalizando, setGeolocalizando] = useState(false);
  const [geolocalizacion, setGeolocalizacion] = useState<{
    latitud: number;
    longitud: number;
    precision: number;
  } | null>(null);

  // Estados para Consumos Internos
  const [modalConsumoOpen, setModalConsumoOpen] = useState(false);
  const [consumos, setConsumos] = useState([
    { id: '1', fecha: '30 Nov 2025', hora: '10:30', categoria: 'Comida', producto: 'Menú del día', cantidad: 1, importe: 8.50, pdv: 'Tiana', estado: 'Aprobado' },
    { id: '2', fecha: '29 Nov 2025', hora: '15:00', categoria: 'Bebida', producto: 'Café con leche', cantidad: 2, importe: 3.00, pdv: 'Tiana', estado: 'Aprobado' },
    { id: '3', fecha: '28 Nov 2025', hora: '12:00', categoria: 'Comida', producto: 'Bocadillo', cantidad: 1, importe: 4.50, pdv: 'Montgat', estado: 'Pendiente' },
    { id: '4', fecha: '27 Nov 2025', hora: '14:30', categoria: 'Bebida', producto: 'Refresco', cantidad: 1, importe: 2.50, pdv: 'Tiana', estado: 'Aprobado' },
  ]);

  // Estados para nuevo consumo
  const [nuevoConsumo, setNuevoConsumo] = useState({
    categoria: '',
    producto: '',
    cantidad: '1',
    importe: '',
    pdv: '',
    observaciones: ''
  });

  const registrosHoy = [
    { tipo: 'entrada', hora: '09:00 AM', fecha: 'Hoy', pdv: 'Tiana' },
    { tipo: 'pausa', hora: '11:30 AM', fecha: 'Hoy', pdv: 'Tiana' },
    { tipo: 'reanudacion', hora: '11:45 AM', fecha: 'Hoy', pdv: 'Tiana' },
  ];

  const registrosSemana = [
    { dia: 'Lunes', entrada: '09:00 AM', salida: '06:00 PM', horas: '8h 00m', pdv: 'Tiana' },
    { dia: 'Martes', entrada: '09:05 AM', salida: '06:10 PM', horas: '8h 05m', pdv: 'Tiana' },
    { dia: 'Miércoles', entrada: '08:55 AM', salida: '05:55 PM', horas: '8h 00m', pdv: 'Montgat' },
    { dia: 'Jueves', entrada: '09:00 AM', salida: '06:00 PM', horas: '8h 00m', pdv: 'Montgat' },
    { dia: 'Viernes', entrada: '09:00 AM', salida: '-', horas: 'En curso', pdv: 'Tiana' },
  ];

  // ============================================
  // EFECTOS
  // ============================================

  // Cargar fichaje activo desde localStorage al montar
  useEffect(() => {
    try {
      const fichajeGuardado = localStorage.getItem('fichaje_activo');
      if (fichajeGuardado) {
        const fichaje = JSON.parse(fichajeGuardado);
        // Convertir las fechas de string a Date
        fichaje.fechaEntrada = new Date(fichaje.fechaEntrada);
        setFichadoActivo(fichaje);
        setEnPausa(fichaje.enPausa || false);
        console.log('[FICHAJE] Fichaje activo cargado desde localStorage:', fichaje);
        // Notificar al padre
        onFichajeChange?.(true);
      }
    } catch (error) {
      console.error('[FICHAJE] Error al cargar fichaje desde localStorage:', error);
      localStorage.removeItem('fichaje_activo');
    }
  }, []);

  // Timer para actualizar el tiempo trabajado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (fichadoActivo && !enPausa) {
      interval = setInterval(() => {
        const horaEntrada = new Date(fichadoActivo.fechaEntrada);
        const ahora = new Date();
        const diff = ahora.getTime() - horaEntrada.getTime();
        
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTiempoActual(
          `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
        );
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fichadoActivo, enPausa]);

  // ============================================
  // REF HANDLE - Exponer funciones al padre
  // ============================================
  
  useImperativeHandle(ref, () => ({
    abrirModalFichaje: () => {
      if (!fichadoActivo) {
        console.log('[REF] Abriendo modal de fichaje desde ref');
        setPdvSeleccionado('');
        setGeolocalizacion(null);
        setModalFichajeOpen(true);
      }
    },
    fichajarSalida: () => {
      if (fichadoActivo) {
        console.log('[REF] Fichando salida desde ref');
        handleFicharSalida();
      }
    },
    estaFichado: () => {
      return !!fichadoActivo;
    }
  }));

  // ============================================
  // FUNCIONES
  // ============================================

  const handleSolicitarGeolocalización = () => {
    setGeolocalizando(true);
    
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      setGeolocalizando(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocalizacion({
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          precision: position.coords.accuracy,
        });
        setGeolocalizando(false);
        toast.success('Ubicación obtenida correctamente', {
          description: `Precisión: ${Math.round(position.coords.accuracy)}m`,
        });
      },
      (error) => {
        setGeolocalizando(false);
        toast.error('No se pudo obtener tu ubicación', {
          description: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleIniciarFichaje = () => {
    console.log('[FICHAJE] handleIniciarFichaje llamado. Estado actual:', {
      fichadoActivo,
      modalFichajeOpen
    });
    
    if (!fichadoActivo) {
      // Abrir modal para seleccionar PDV y obtener geolocalización
      console.log('[FICHAJE] No hay fichaje activo. Abriendo modal...');
      setPdvSeleccionado('');
      setGeolocalizacion(null);
      setModalFichajeOpen(true);
      console.log('[FICHAJE] Modal abierto. Estado:', { modalFichajeOpen: true });
    } else {
      // Fichar salida directamente
      console.log('[FICHAJE] Ya hay fichaje activo. Fichando salida...', fichadoActivo);
      handleFicharSalida();
    }
  };

  const handleConfirmarFichaje = () => {
    if (!pdvSeleccionado) {
      toast.error('Debes seleccionar un punto de venta');
      return;
    }

    const pdvData = puntosVentaMock.find(p => p.id === pdvSeleccionado);
    if (!pdvData) {
      toast.error('Punto de venta no encontrado');
      return;
    }

    const ahora = new Date();
    const nuevoFichaje: FichajeActivo = {
      id: `FICH-${Date.now()}`,
      trabajadorId: 'TRAB-001', // En producción vendría del usuario logueado
      puntoVentaId: pdvSeleccionado,
      puntoVentaNombre: pdvData.nombre,
      fechaEntrada: ahora,
      horaEntrada: ahora.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      geolocalizacion: geolocalizacion || undefined,
      enPausa: false,
    };

    setFichadoActivo(nuevoFichaje);
    setModalFichajeOpen(false);
    
    // Guardar el fichaje en localStorage
    localStorage.setItem('fichaje_activo', JSON.stringify(nuevoFichaje));
    
    // TODO: Aquí se guardará el fichaje en la base de datos con Supabase
    // Datos a guardar: trabajadorId, puntoVentaId, fechaEntrada, horaEntrada, geolocalizacion
    console.log('[FICHAJE] Registro de ENTRADA para guardar en BBDD:', {
      trabajadorId: nuevoFichaje.trabajadorId,
      puntoVentaId: nuevoFichaje.puntoVentaId,
      puntoVentaNombre: nuevoFichaje.puntoVentaNombre,
      fechaEntrada: nuevoFichaje.fechaEntrada,
      horaEntrada: nuevoFichaje.horaEntrada,
      geolocalizacion: nuevoFichaje.geolocalizacion
    });
    
    // Notificar al padre que hay fichaje activo
    onFichajeChange?.(true);
    
    toast.success('Fichaje de entrada registrado', {
      description: `PDV: ${pdvData.nombre}${geolocalizacion ? ' | Ubicación registrada' : ''}`,
    });
  };

  const handleFicharSalida = () => {
    if (!fichadoActivo) return;

    const horaSalida = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    
    const fechaSalida = new Date();
    
    // TODO: Aquí se actualizará el registro de fichaje en la base de datos con Supabase
    // Se actualiza el registro con: fechaSalida, horaSalida
    console.log('[FICHAJE] Registro de SALIDA para actualizar en BBDD:', {
      fichajeId: fichadoActivo.id,
      trabajadorId: fichadoActivo.trabajadorId,
      puntoVentaId: fichadoActivo.puntoVentaId,
      fechaEntrada: fichadoActivo.fechaEntrada,
      horaEntrada: fichadoActivo.horaEntrada,
      fechaSalida: fechaSalida,
      horaSalida: horaSalida,
      tiempoTotal: tiempoActual
    });

    setFichadoActivo(null);
    setEnPausa(false);
    setTiempoActual('00:00:00');
    
    // Eliminar el fichaje de localStorage
    localStorage.removeItem('fichaje_activo');
    
    // Notificar al padre que no hay fichaje activo
    onFichajeChange?.(false);
    
    toast.success('Fichaje de salida registrado', {
      description: `PDV: ${fichadoActivo.puntoVentaNombre} | Tiempo total: ${tiempoActual}`,
    });
  };

  const handlePausa = () => {
    if (!fichadoActivo) return;

    if (!enPausa) {
      setEnPausa(true);
      setFichadoActivo({
        ...fichadoActivo,
        enPausa: true,
      });
      toast.info('Pausa iniciada');
    } else {
      setEnPausa(false);
      setFichadoActivo({
        ...fichadoActivo,
        enPausa: false,
      });
      toast.info('Pausa finalizada');
    }
  };

  // Funciones para Consumos
  const handleRegistrarConsumo = () => {
    // Validaciones
    if (!nuevoConsumo.categoria) {
      toast.error('Debes seleccionar una categoría');
      return;
    }
    if (!nuevoConsumo.producto.trim()) {
      toast.error('Debes indicar el producto o descripción');
      return;
    }
    if (!nuevoConsumo.importe || parseFloat(nuevoConsumo.importe) <= 0) {
      toast.error('Debes indicar un importe válido');
      return;
    }
    if (!nuevoConsumo.pdv) {
      toast.error('Debes seleccionar un punto de venta');
      return;
    }

    // Crear nuevo consumo
    const ahora = new Date();
    const fechaFormateada = ahora.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const horaFormateada = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const consumoNuevo = {
      id: `CONS-${Date.now()}`,
      fecha: fechaFormateada,
      hora: horaFormateada,
      categoria: nuevoConsumo.categoria,
      producto: nuevoConsumo.producto,
      cantidad: parseInt(nuevoConsumo.cantidad),
      importe: parseFloat(nuevoConsumo.importe),
      pdv: puntosVentaMock.find(p => p.id === nuevoConsumo.pdv)?.nombre || nuevoConsumo.pdv,
      estado: 'Pendiente' // Los consumos nuevos siempre empiezan como pendientes
    };

    // Añadir al inicio de la lista
    setConsumos([consumoNuevo, ...consumos]);

    // TODO: Guardar en base de datos con Supabase
    console.log('[CONSUMO] Nuevo consumo para guardar en BBDD:', consumoNuevo);

    // Limpiar formulario
    setNuevoConsumo({
      categoria: '',
      producto: '',
      cantidad: '1',
      importe: '',
      pdv: fichadoActivo?.puntoVentaId || '', // Si está fichado, pre-seleccionar el PDV
      observaciones: ''
    });

    // Cerrar modal
    setModalConsumoOpen(false);

    // Mostrar confirmación
    toast.success('Consumo registrado correctamente', {
      description: `${consumoNuevo.producto} - ${consumoNuevo.importe.toFixed(2)}€`,
    });
  };

  const handleAbrirModalConsumo = () => {
    // Pre-seleccionar el PDV actual si está fichado
    if (fichadoActivo) {
      setNuevoConsumo(prev => ({
        ...prev,
        pdv: fichadoActivo.puntoVentaId
      }));
    }
    setModalConsumoOpen(true);
  };

  // Debug: Monitorear cambios en el estado del modal
  useEffect(() => {
    console.log('[FICHAJE] Estado del modal cambió:', modalFichajeOpen);
    if (modalFichajeOpen) {
      console.log('[FICHAJE] ✅ Modal debería estar VISIBLE');
      console.log('[FICHAJE] PDVs disponibles:', puntosVentaMock);
    }
  }, [modalFichajeOpen]);

  // Debug: Renderizado del componente
  console.log('[FICHAJE] Componente renderizado. Estado:', {
    fichadoActivo: !!fichadoActivo,
    modalFichajeOpen,
    pdvSeleccionado
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Fichajes y Horario</h2>
          <p className="text-gray-600">Gestiona tu jornada laboral y consumos</p>
        </div>
      </div>

      {/* Info PDV Activo */}
      {fichadoActivo && (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Trabajando en:</p>
                <p className="text-teal-900">{fichadoActivo.puntoVentaNombre}</p>
              </div>
              {fichadoActivo.geolocalizacion && (
                <Badge variant="outline" className="gap-1 bg-white">
                  <MapPin className="w-3 h-3" />
                  Ubicación
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Horas Hoy</p>
                <p className="text-gray-900 text-2xl">8h 15m</p>
              </div>
              <Clock className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Horas Semana</p>
                <p className="text-gray-900 text-2xl">32h 05m</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Puntualidad</p>
                <p className="text-gray-900 text-2xl">98%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Consumos Mes</p>
                <p className="text-gray-900 text-2xl">18.50€</p>
              </div>
              <Euro className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para organizar la información */}
      <Tabs defaultValue="fichaje" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fichaje" className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Fichaje</span>
          </TabsTrigger>
          <TabsTrigger value="hoy" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Hoy</span>
          </TabsTrigger>
          <TabsTrigger value="semanal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Semanal</span>
          </TabsTrigger>
          <TabsTrigger value="consumos" className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="hidden sm:inline">Consumos</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: Fichaje */}
        <TabsContent value="fichaje" className="space-y-6 mt-6">
          {/* Reloj Fichaje */}
          <Card className="border-2 border-teal-200">
            <CardHeader>
              <CardTitle>Fichaje Actual</CardTitle>
              <CardDescription>Controla tu jornada laboral</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reloj */}
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg">
                <div className="text-6xl text-gray-900 mb-4" style={{ fontFamily: 'monospace' }}>
                  {tiempoActual}
                </div>
                <Badge className={fichadoActivo ? (enPausa ? 'bg-orange-500' : 'bg-green-600') : 'bg-gray-400'}>
                  {fichadoActivo ? (enPausa ? 'En Pausa' : 'Trabajando') : 'No Fichado'}
                </Badge>
              </div>

              {/* Botones de Control */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleIniciarFichaje}
                  className={fichadoActivo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  size="lg"
                >
                  {fichadoActivo ? (
                    <>
                      <StopCircle className="w-5 h-5 mr-2" />
                      Fichar Salida
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Fichar Entrada
                    </>
                  )}
                </Button>

                <Button
                  onClick={handlePausa}
                  variant="outline"
                  size="lg"
                  disabled={!fichadoActivo}
                  className="border-2"
                >
                  <PauseCircle className="w-5 h-5 mr-2" />
                  {enPausa ? 'Reanudar' : 'Pausar'}
                </Button>

                <Button variant="outline" size="lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Ver Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Hoy */}
        <TabsContent value="hoy" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Hoy</CardTitle>
              <CardDescription>Detalle de fichajes del día - 30 Nov 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {registrosHoy.map((registro, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      registro.tipo === 'entrada' ? 'bg-green-100' :
                      registro.tipo === 'pausa' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      <Clock className={`w-5 h-5 ${
                        registro.tipo === 'entrada' ? 'text-green-600' :
                        registro.tipo === 'pausa' ? 'text-orange-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 capitalize">{registro.tipo}</p>
                      <p className="text-gray-600 text-sm">{registro.fecha}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{registro.hora}</p>
                      <p className="text-gray-600 text-xs flex items-center gap-1 justify-end mt-1">
                        <Store className="w-3 h-3" />
                        {registro.pdv}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del día */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Entrada</p>
                  <p className="text-xl text-gray-900">09:00 AM</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Pausas</p>
                  <p className="text-xl text-gray-900">1 (15min)</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <p className="text-sm text-gray-600">Total Hoy</p>
                  <p className="text-xl text-gray-900">8h 15m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Semanal */}
        <TabsContent value="semanal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Semanal</CardTitle>
              <CardDescription>Registro de horas trabajadas esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {registrosSemana.map((registro, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-gray-900">{registro.dia}</p>
                        <p className="text-gray-600 text-sm">
                          {registro.entrada} - {registro.salida}
                        </p>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                          <Store className="w-3 h-3" />
                          {registro.pdv}
                        </p>
                      </div>
                    </div>
                    <Badge className={registro.horas === 'En curso' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {registro.horas}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">Total horas esta semana:</p>
                  <p className="text-teal-700 text-xl">32h 05m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Consumos */}
        <TabsContent value="consumos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-teal-600" />
                    Mis Consumos
                  </CardTitle>
                  <CardDescription>Registro de consumos internos del mes</CardDescription>
                </div>
                <Button
                  onClick={handleAbrirModalConsumo}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Consumo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Resumen de Consumos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Mes</p>
                      <p className="text-2xl text-gray-900">18.50€</p>
                    </div>
                    <Euro className="w-8 h-8 text-teal-600" />
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Aprobados</p>
                      <p className="text-2xl text-gray-900">14.00€</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pendientes</p>
                      <p className="text-2xl text-gray-900">4.50€</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Lista de Consumos */}
              <div className="space-y-3">
                {consumos.map((consumo) => (
                  <div key={consumo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        consumo.categoria === 'Comida' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        {consumo.categoria === 'Comida' ? (
                          <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Coffee className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{consumo.producto}</p>
                        <p className="text-sm text-gray-600">
                          {consumo.fecha} • {consumo.hora}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Store className="w-3 h-3" />
                          {consumo.pdv}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-semibold">{consumo.importe.toFixed(2)}€</p>
                      <Badge 
                        className={`mt-2 ${
                          consumo.estado === 'Aprobado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {consumo.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Fichaje de Entrada */}
      <Dialog open={modalFichajeOpen} onOpenChange={setModalFichajeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-green-600" />
              Fichar Entrada
            </DialogTitle>
            <DialogDescription>
              Selecciona el punto de venta donde vas a trabajar y confirma tu ubicación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selección de PDV */}
            <div className="space-y-2">
              <Label htmlFor="pdv" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Punto de Venta *
              </Label>
              <Select value={pdvSeleccionado} onValueChange={setPdvSeleccionado}>
                <SelectTrigger id="pdv">
                  <SelectValue placeholder="Selecciona un punto de venta" />
                </SelectTrigger>
                <SelectContent>
                  {puntosVentaMock
                    .filter(p => p.activo)
                    .map((pdv) => (
                      <SelectItem key={pdv.id} value={pdv.id}>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{pdv.nombre}</p>
                            <p className="text-xs text-gray-500">{pdv.direccion}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Geolocalización */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Geolocalización
              </Label>
              
              {!geolocalizacion ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSolicitarGeolocalización}
                  disabled={geolocalizando}
                >
                  {geolocalizando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Obtener mi ubicación
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-green-900 font-medium">Ubicación registrada</p>
                      <p className="text-xs text-green-700 mt-1">
                        Lat: {geolocalizacion.latitud.toFixed(6)}, 
                        Lng: {geolocalizacion.longitud.toFixed(6)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Precisión: ~{Math.round(geolocalizacion.precision)}m
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setGeolocalizacion(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-800">
                  La geolocalización es opcional pero recomendada para verificar tu ubicación al fichar.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalFichajeOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarFichaje}
              disabled={!pdvSeleccionado}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar Fichaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Registro de Consumo */}
      <Dialog open={modalConsumoOpen} onOpenChange={setModalConsumoOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              Registrar Consumo
            </DialogTitle>
            <DialogDescription>
              Registra un nuevo consumo interno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selección de PDV */}
            <div className="space-y-2">
              <Label htmlFor="consumo-pdv" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Punto de Venta *
              </Label>
              <Select value={nuevoConsumo.pdv} onValueChange={value => setNuevoConsumo(prev => ({ ...prev, pdv: value }))}>
                <SelectTrigger id="consumo-pdv">
                  <SelectValue placeholder="Selecciona un punto de venta" />
                </SelectTrigger>
                <SelectContent>
                  {puntosVentaMock
                    .filter(p => p.activo)
                    .map((pdv) => (
                      <SelectItem key={pdv.id} value={pdv.id}>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{pdv.nombre}</p>
                            <p className="text-xs text-gray-500">{pdv.direccion}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Categoría *
              </Label>
              <Select value={nuevoConsumo.categoria} onValueChange={value => setNuevoConsumo(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comida">Comida</SelectItem>
                  <SelectItem value="Bebida">Bebida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Producto */}
            <div className="space-y-2">
              <Label htmlFor="producto" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Producto *
              </Label>
              <Input
                id="producto"
                value={nuevoConsumo.producto}
                onChange={e => setNuevoConsumo(prev => ({ ...prev, producto: e.target.value }))}
                placeholder="Indica el producto o descripción"
              />
            </div>

            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Cantidad *
              </Label>
              <Input
                id="cantidad"
                value={nuevoConsumo.cantidad}
                onChange={e => setNuevoConsumo(prev => ({ ...prev, cantidad: e.target.value }))}
                placeholder="1"
                type="number"
                min="1"
              />
            </div>

            {/* Importe */}
            <div className="space-y-2">
              <Label htmlFor="importe" className="flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Importe *
              </Label>
              <Input
                id="importe"
                value={nuevoConsumo.importe}
                onChange={e => setNuevoConsumo(prev => ({ ...prev, importe: e.target.value }))}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Observaciones
              </Label>
              <Input
                id="observaciones"
                value={nuevoConsumo.observaciones}
                onChange={e => setNuevoConsumo(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Añade observaciones si es necesario"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalConsumoOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRegistrarConsumo}
              disabled={!nuevoConsumo.categoria || !nuevoConsumo.producto.trim() || !nuevoConsumo.importe || parseFloat(nuevoConsumo.importe) <= 0 || !nuevoConsumo.pdv}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Registrar Consumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

FichajeColaborador.displayName = 'FichajeColaborador';