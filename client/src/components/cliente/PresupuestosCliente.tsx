import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { 
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Car,
  Wrench,
  Package,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download,
  Eye,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Presupuesto {
  id: string;
  tipo: 'servicio' | 'producto' | 'mixto';
  titulo: string;
  descripcion: string;
  vehiculo?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'expirado';
  fecha: string;
  fechaExpiracion: string;
  total: number;
  desglose?: {
    manoObra: number;
    piezas: number;
    iva: number;
  };
  items: Array<{
    concepto: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  notas?: string;
  tecnico?: string;
}

interface PresupuestosClienteProps {
  onNavigateToChat?: () => void;
}

export function PresupuestosCliente({ onNavigateToChat }: PresupuestosClienteProps = {}) {
  const [activeTab, setActiveTab] = useState('pendientes');
  const [modalSolicitar, setModalSolicitar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<Presupuesto | null>(null);

  // Formulario de solicitud
  const [tipoSolicitud, setTipoSolicitud] = useState<'servicio' | 'producto' | 'mixto'>('servicio');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('');
  const [tituloSolicitud, setTituloSolicitud] = useState('');
  const [descripcionSolicitud, setDescripcionSolicitud] = useState('');

  // Vehículos del cliente
  const vehiculos = [
    { id: '1', nombre: 'Ford Focus - ABC1234', modelo: 'Focus 1.6 TDCi (2018)' },
    { id: '2', nombre: 'Volkswagen Golf - XYZ5678', modelo: 'Golf 2.0 TDI (2020)' },
  ];

  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([
    {
      id: 'PRES-001',
      tipo: 'mixto',
      titulo: 'Cambio de neumáticos + alineación',
      descripcion: 'Cambio de 4 neumáticos 205/55R16 Michelin + alineación y equilibrado',
      vehiculo: 'Ford Focus - ABC1234',
      estado: 'pendiente',
      fecha: '2025-11-09T10:00:00',
      fechaExpiracion: '2025-11-16T23:59:59',
      total: 420.50,
      desglose: {
        manoObra: 60.00,
        piezas: 295.00,
        iva: 65.50
      },
      items: [
        { concepto: 'Neumático Michelin Energy Saver 205/55R16', cantidad: 4, precioUnitario: 68.00 },
        { concepto: 'Equilibrado ruedas', cantidad: 4, precioUnitario: 8.00 },
        { concepto: 'Alineación y geometría', cantidad: 1, precioUnitario: 35.00 }
      ],
      notas: 'Se incluye revisión de presiones y válvulas sin coste adicional',
      tecnico: 'Carlos Méndez'
    },
    {
      id: 'PRES-002',
      tipo: 'servicio',
      titulo: 'Revisión 20.000 km',
      descripcion: 'Revisión completa de 20.000 km según manual del fabricante',
      vehiculo: 'Volkswagen Golf - XYZ5678',
      estado: 'pendiente',
      fecha: '2025-11-08T14:30:00',
      fechaExpiracion: '2025-11-15T23:59:59',
      total: 185.00,
      desglose: {
        manoObra: 80.00,
        piezas: 63.00,
        iva: 42.00
      },
      items: [
        { concepto: 'Cambio aceite motor 5W30', cantidad: 1, precioUnitario: 35.00 },
        { concepto: 'Filtro aceite', cantidad: 1, precioUnitario: 12.00 },
        { concepto: 'Filtro aire', cantidad: 1, precioUnitario: 16.00 },
        { concepto: 'Revisión completa sistema frenos', cantidad: 1, precioUnitario: 0.00 },
        { concepto: 'Revisión suspensión y dirección', cantidad: 1, precioUnitario: 0.00 }
      ],
      notas: 'Incluye informe técnico detallado del estado del vehículo',
      tecnico: 'Luis Fernández'
    },
    {
      id: 'PRES-003',
      tipo: 'producto',
      titulo: 'Pastillas y discos de freno',
      descripcion: 'Cambio de pastillas y discos de freno eje delantero',
      vehiculo: 'Ford Focus - ABC1234',
      estado: 'aprobado',
      fecha: '2025-11-05T09:00:00',
      fechaExpiracion: '2025-11-12T23:59:59',
      total: 245.00,
      desglose: {
        manoObra: 45.00,
        piezas: 155.00,
        iva: 45.00
      },
      items: [
        { concepto: 'Discos de freno delanteros (par)', cantidad: 1, precioUnitario: 95.00 },
        { concepto: 'Pastillas de freno delanteras', cantidad: 1, precioUnitario: 60.00 },
        { concepto: 'Líquido de frenos', cantidad: 1, precioUnitario: 12.00 }
      ],
      tecnico: 'Carlos Méndez'
    },
    {
      id: 'PRES-004',
      tipo: 'servicio',
      titulo: 'Aire acondicionado no enfría',
      descripcion: 'Diagnóstico y reparación sistema aire acondicionado',
      vehiculo: 'Volkswagen Golf - XYZ5678',
      estado: 'rechazado',
      fecha: '2025-11-01T11:00:00',
      fechaExpiracion: '2025-11-08T23:59:59',
      total: 180.00,
      items: [
        { concepto: 'Diagnóstico electrónico AC', cantidad: 1, precioUnitario: 35.00 },
        { concepto: 'Recarga gas R134a', cantidad: 1, precioUnitario: 85.00 },
        { concepto: 'Filtro habitáculo', cantidad: 1, precioUnitario: 25.00 }
      ],
      notas: 'Cliente rechazó por encontrar otra opción más económica',
      tecnico: 'Luis Fernández'
    },
    {
      id: 'PRES-005',
      tipo: 'mixto',
      titulo: 'Cambio correa distribución',
      descripcion: 'Cambio kit distribución + bomba agua',
      vehiculo: 'Ford Focus - ABC1234',
      estado: 'expirado',
      fecha: '2025-10-25T10:00:00',
      fechaExpiracion: '2025-11-01T23:59:59',
      total: 540.00,
      items: [
        { concepto: 'Kit distribución completo', cantidad: 1, precioUnitario: 180.00 },
        { concepto: 'Bomba de agua', cantidad: 1, precioUnitario: 95.00 },
        { concepto: 'Líquido refrigerante', cantidad: 1, precioUnitario: 15.00 },
        { concepto: 'Mano de obra', cantidad: 1, precioUnitario: 250.00 }
      ],
      tecnico: 'Carlos Méndez'
    }
  ]);

  const presupuestosPendientes = presupuestos.filter(p => p.estado === 'pendiente');
  const presupuestosAprobados = presupuestos.filter(p => p.estado === 'aprobado');
  const presupuestosHistorial = presupuestos.filter(p => ['rechazado', 'expirado'].includes(p.estado));

  const handleSolicitarPresupuesto = () => {
    if (!tituloSolicitud.trim() || !descripcionSolicitud.trim() || !vehiculoSeleccionado) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const nuevoPresupuesto: Presupuesto = {
      id: `PRES-${String(presupuestos.length + 1).padStart(3, '0')}`,
      tipo: tipoSolicitud,
      titulo: tituloSolicitud,
      descripcion: descripcionSolicitud,
      vehiculo: vehiculos.find(v => v.id === vehiculoSeleccionado)?.nombre,
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      total: 0,
      items: [],
      notas: 'En espera de valoración por parte del taller'
    };

    setPresupuestos([nuevoPresupuesto, ...presupuestos]);
    setModalSolicitar(false);
    setTituloSolicitud('');
    setDescripcionSolicitud('');
    setVehiculoSeleccionado('');
    setTipoSolicitud('servicio');
    toast.success('¡Solicitud enviada! Te responderemos en breve');
  };

  const handleAprobarPresupuesto = (presupuesto: Presupuesto) => {
    setPresupuestos(prev => prev.map(p => 
      p.id === presupuesto.id ? { ...p, estado: 'aprobado' } : p
    ));
    setModalDetalle(false);
    toast.success(`Presupuesto ${presupuesto.id} aprobado. Se procederá con el servicio.`);
  };

  const handleRechazarPresupuesto = (presupuesto: Presupuesto) => {
    setPresupuestos(prev => prev.map(p => 
      p.id === presupuesto.id ? { ...p, estado: 'rechazado' } : p
    ));
    setModalDetalle(false);
    toast.info(`Presupuesto ${presupuesto.id} rechazado`);
  };

  const handleVerDetalle = (presupuesto: Presupuesto) => {
    setPresupuestoSeleccionado(presupuesto);
    setModalDetalle(true);
  };

  const handleDescargarPDF = (presupuesto: Presupuesto) => {
    toast.success(`Descargando presupuesto ${presupuesto.id}.pdf`);
  };

  const handleChatPresupuesto = (presupuestoId: string) => {
    if (onNavigateToChat) {
      onNavigateToChat();
      toast.success(`Abriendo chat para presupuesto ${presupuestoId}`);
    } else {
      toast.info(`Abriendo chat para presupuesto ${presupuestoId}`);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { label: string; icon: any; className: string }> = {
      pendiente: { 
        label: 'Pendiente', 
        icon: Clock, 
        className: 'bg-orange-100 text-orange-700 border-orange-200' 
      },
      aprobado: { 
        label: 'Aprobado', 
        icon: CheckCircle2, 
        className: 'bg-green-100 text-green-700 border-green-200' 
      },
      rechazado: { 
        label: 'Rechazado', 
        icon: XCircle, 
        className: 'bg-red-100 text-red-700 border-red-200' 
      },
      expirado: { 
        label: 'Expirado', 
        icon: AlertCircle, 
        className: 'bg-gray-100 text-gray-700 border-gray-200' 
      }
    };
    const badge = badges[estado] || badges.pendiente;
    const Icon = badge.icon;
    return (
      <Badge variant="outline" className={badge.className}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return <Wrench className="w-4 h-4" />;
      case 'producto':
        return <Package className="w-4 h-4" />;
      case 'mixto':
        return <div className="flex gap-0.5">
          <Wrench className="w-3 h-3" />
          <Package className="w-3 h-3" />
        </div>;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'servicio':
        return 'Servicio';
      case 'producto':
        return 'Producto';
      case 'mixto':
        return 'Mixto';
      default:
        return tipo;
    }
  };

  const calcularDiasRestantes = (fechaExpiracion: string) => {
    const diff = new Date(fechaExpiracion).getTime() - new Date().getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const PresupuestoCard = ({ presupuesto }: { presupuesto: Presupuesto }) => {
    const diasRestantes = calcularDiasRestantes(presupuesto.fechaExpiracion);

    return (
      <Card className={
        presupuesto.estado === 'pendiente' 
          ? 'border-orange-200 hover:shadow-md transition-shadow' 
          : 'hover:shadow-sm transition-shadow'
      }>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {getTipoIcon(presupuesto.tipo)}
                  <span className="ml-1">{getTipoLabel(presupuesto.tipo)}</span>
                </Badge>
                {getEstadoBadge(presupuesto.estado)}
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {presupuesto.id}
                </h3>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1">{presupuesto.titulo}</h4>
              <p className="text-sm text-gray-600 mb-2">{presupuesto.descripcion}</p>
              
              {presupuesto.vehiculo && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Car className="w-4 h-4" />
                  <span>{presupuesto.vehiculo}</span>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Creado: {new Date(presupuesto.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="text-right ml-4">
              <p className="text-2xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                €{presupuesto.total.toFixed(2)}
              </p>
              {presupuesto.estado === 'pendiente' && diasRestantes > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Válido {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
                </p>
              )}
            </div>
          </div>

          {presupuesto.estado === 'pendiente' && diasRestantes <= 3 && diasRestantes > 0 && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
              <p className="text-sm text-orange-700">
                Este presupuesto expira en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
              </p>
            </div>
          )}

          {presupuesto.tecnico && (
            <p className="text-xs text-gray-500 mb-3">Técnico: {presupuesto.tecnico}</p>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 touch-target"
              onClick={() => handleVerDetalle(presupuesto)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver detalle
            </Button>

            {presupuesto.estado === 'pendiente' && (
              <>
                <Button 
                  size="sm"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 touch-target"
                  onClick={() => handleAprobarPresupuesto(presupuesto)}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Aprobar
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleChatPresupuesto(presupuesto.id)}
                  className="touch-target"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </>
            )}

            {presupuesto.estado === 'aprobado' && presupuesto.total > 0 && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleDescargarPDF(presupuesto)}
                className="touch-target"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {presupuestosPendientes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {presupuestosAprobados.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total mes</p>
                <p className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{presupuestos.reduce((acc, p) => acc + p.total, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón Solicitar Presupuesto */}
      <Button 
        onClick={() => setModalSolicitar(true)}
        className="w-full bg-teal-600 hover:bg-teal-700"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Solicitar Presupuesto
      </Button>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendientes">
            Pendientes
            {presupuestosPendientes.length > 0 && (
              <Badge className="ml-2 bg-orange-600 text-white h-5 px-1.5">
                {presupuestosPendientes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprobados">Aprobados</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Tab Pendientes */}
        <TabsContent value="pendientes" className="space-y-4 mt-6">
          {presupuestosPendientes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No hay presupuestos pendientes</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Solicita un presupuesto para servicios o productos
                </p>
                <Button onClick={() => setModalSolicitar(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Solicitar Presupuesto
                </Button>
              </CardContent>
            </Card>
          ) : (
            presupuestosPendientes.map(presupuesto => (
              <PresupuestoCard key={presupuesto.id} presupuesto={presupuesto} />
            ))
          )}
        </TabsContent>

        {/* Tab Aprobados */}
        <TabsContent value="aprobados" className="space-y-4 mt-6">
          {presupuestosAprobados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No hay presupuestos aprobados</h3>
                <p className="text-sm text-gray-500">
                  Los presupuestos que apruebes aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            presupuestosAprobados.map(presupuesto => (
              <PresupuestoCard key={presupuesto.id} presupuesto={presupuesto} />
            ))
          )}
        </TabsContent>

        {/* Tab Historial */}
        <TabsContent value="historial" className="space-y-4 mt-6">
          {presupuestosHistorial.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Sin historial</h3>
                <p className="text-sm text-gray-500">
                  Los presupuestos rechazados o expirados aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            presupuestosHistorial.map(presupuesto => (
              <PresupuestoCard key={presupuesto.id} presupuesto={presupuesto} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Solicitar Presupuesto */}
      <Dialog open={modalSolicitar} onOpenChange={setModalSolicitar}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Solicitar Presupuesto
            </DialogTitle>
            <DialogDescription>
              Describe el servicio o productos que necesitas y te enviaremos un presupuesto detallado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tipo">Tipo de solicitud *</Label>
              <Select value={tipoSolicitud} onValueChange={(v: any) => setTipoSolicitud(v)}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servicio">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Servicio / Reparación
                    </div>
                  </SelectItem>
                  <SelectItem value="producto">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Producto / Pieza
                    </div>
                  </SelectItem>
                  <SelectItem value="mixto">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <Package className="w-4 h-4" />
                      Servicio + Producto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vehiculo">Vehículo *</Label>
              <Select value={vehiculoSeleccionado} onValueChange={setVehiculoSeleccionado}>
                <SelectTrigger id="vehiculo">
                  <SelectValue placeholder="Selecciona un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehiculos.map(vehiculo => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id}>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <div>
                          <div>{vehiculo.nombre}</div>
                          <div className="text-xs text-gray-500">{vehiculo.modelo}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="titulo">Título de la solicitud *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Cambio de pastillas de freno"
                value={tituloSolicitud}
                onChange={(e) => setTituloSolicitud(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción detallada *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe con el máximo detalle posible qué necesitas. Incluye síntomas, ruidos, problemas que hayas notado, etc."
                rows={5}
                value={descripcionSolicitud}
                onChange={(e) => setDescripcionSolicitud(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Cuanto más detallada sea tu descripción, más preciso será el presupuesto
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>💡 Consejo:</strong> Si tienes fotos o vídeos del problema, puedes enviarlos por el chat después de crear la solicitud.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalSolicitar(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSolicitarPresupuesto}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={!tituloSolicitud.trim() || !descripcionSolicitud.trim() || !vehiculoSeleccionado}
            >
              <Plus className="w-4 h-4 mr-2" />
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle Presupuesto */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {presupuestoSeleccionado && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {presupuestoSeleccionado.id}
                  </DialogTitle>
                  {getEstadoBadge(presupuestoSeleccionado.estado)}
                </div>
                <DialogDescription>
                  {presupuestoSeleccionado.titulo}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Info general */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tipo</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {getTipoIcon(presupuestoSeleccionado.tipo)}
                      <span className="ml-1">{getTipoLabel(presupuestoSeleccionado.tipo)}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Vehículo</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {presupuestoSeleccionado.vehiculo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fecha creación</p>
                    <p className="text-sm font-medium">
                      {new Date(presupuestoSeleccionado.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Válido hasta</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(presupuestoSeleccionado.fechaExpiracion).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600">{presupuestoSeleccionado.descripcion}</p>
                </div>

                {/* Items */}
                {presupuestoSeleccionado.items.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Desglose detallado</h4>
                    <div className="space-y-2">
                      {presupuestoSeleccionado.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.concepto}</p>
                            <p className="text-xs text-gray-500">
                              Cantidad: {item.cantidad} × €{item.precioUnitario.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900">
                            €{(item.cantidad * item.precioUnitario).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desglose */}
                {presupuestoSeleccionado.desglose && (
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mano de obra</span>
                        <span>€{presupuestoSeleccionado.desglose.manoObra.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Piezas y materiales</span>
                        <span>€{presupuestoSeleccionado.desglose.piezas.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IVA (21%)</span>
                        <span>€{presupuestoSeleccionado.desglose.iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
                        <span>TOTAL</span>
                        <span className="text-teal-600">€{presupuestoSeleccionado.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas */}
                {presupuestoSeleccionado.notas && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">Notas del técnico</p>
                    <p className="text-sm text-blue-800">{presupuestoSeleccionado.notas}</p>
                  </div>
                )}

                {presupuestoSeleccionado.tecnico && (
                  <p className="text-xs text-gray-500">Técnico responsable: {presupuestoSeleccionado.tecnico}</p>
                )}
              </div>

              <DialogFooter className="gap-2">
                {presupuestoSeleccionado.estado === 'pendiente' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleRechazarPresupuesto(presupuestoSeleccionado)}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleChatPresupuesto(presupuestoSeleccionado.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Consultar
                    </Button>
                    <Button 
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => handleAprobarPresupuesto(presupuestoSeleccionado)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Aprobar Presupuesto
                    </Button>
                  </>
                )}

                {presupuestoSeleccionado.estado === 'aprobado' && presupuestoSeleccionado.total > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => handleDescargarPDF(presupuestoSeleccionado)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
