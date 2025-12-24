import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Calendar, 
  Users, 
  Eye, 
  MousePointerClick,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  AlertCircle,
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { toast } from 'sonner';
import {
  notificacionesHistorial,
  obtenerNotificacionesEnviadas,
  obtenerNotificacionesProgramadas,
  calcularTasaApertura,
  calcularTasaClics,
  obtenerEstadisticasGlobales,
  crearNotificacionTemplate,
  enviarNotificacion,
  type NotificacionPromocion,
  type TipoNotificacion,
  type CanalNotificacion
} from '../data/notificaciones-promociones';
import { 
  promocionesDisponibles,
  obtenerPromocionesActivas,
  type PromocionDisponible 
} from '../data/promociones-disponibles';

export default function GestionNotificacionesPromo() {
  const [notificaciones, setNotificaciones] = useState<NotificacionPromocion[]>(notificacionesHistorial);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalPreview, setMostrarModalPreview] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  
  // Estados del formulario
  const [nuevaNotif, setNuevaNotif] = useState<Partial<NotificacionPromocion>>({
    tipo: 'personalizada',
    titulo: '',
    mensaje: '',
    publicoObjetivo: 'general',
    canal: 'push',
    estado: 'programada',
    fechaCreacion: new Date().toISOString(),
    enviadas: 0,
    leidas: 0,
    clicsPromocion: 0,
    automatica: false,
    creadaPor: 'GER-001',
    gerenteNombre: 'Carlos Martínez'
  });

  const estadisticas = obtenerEstadisticasGlobales();
  const promocionesActivas = obtenerPromocionesActivas();

  // Filtrar notificaciones
  const notificacionesFiltradas = filtroEstado === 'todas' 
    ? notificaciones 
    : notificaciones.filter(n => n.estado === filtroEstado);

  const handleCrearNotificacion = () => {
    setNuevaNotif({
      ...crearNotificacionTemplate('personalizada'),
      creadaPor: 'GER-001',
      gerenteNombre: 'Carlos Martínez'
    });
    setMostrarModalCrear(true);
  };

  const handleEnviarNotificacion = async () => {
    if (!nuevaNotif.titulo || !nuevaNotif.mensaje) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Estimación de destinatarios según público objetivo
    const estimacionDestinatarios = {
      'general': 450,
      'premium': 87,
      'nuevo': 125,
      'alta_frecuencia': 203,
      'multitienda': 45
    };

    const notificacionCompleta: NotificacionPromocion = {
      ...nuevaNotif,
      id: `NOTIF-${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
      cantidadDestinatarios: estimacionDestinatarios[nuevaNotif.publicoObjetivo as keyof typeof estimacionDestinatarios] || 450,
    } as NotificacionPromocion;

    // Simular envío
    toast.loading('Enviando notificación...');
    
    const exito = await enviarNotificacion(notificacionCompleta);
    
    if (exito) {
      notificacionCompleta.estado = 'enviada';
      notificacionCompleta.fechaEnviada = new Date().toISOString();
      notificacionCompleta.enviadas = notificacionCompleta.cantidadDestinatarios || 0;
      
      setNotificaciones([notificacionCompleta, ...notificaciones]);
      toast.dismiss();
      toast.success(`Notificación enviada a ${notificacionCompleta.enviadas} clientes`);
      setMostrarModalCrear(false);
    } else {
      toast.dismiss();
      toast.error('Error al enviar la notificación');
    }
  };

  const handleProgramarNotificacion = () => {
    if (!nuevaNotif.titulo || !nuevaNotif.mensaje || !nuevaNotif.fechaProgramada) {
      toast.error('Por favor completa todos los campos y selecciona una fecha');
      return;
    }

    const estimacionDestinatarios = {
      'general': 450,
      'premium': 87,
      'nuevo': 125,
      'alta_frecuencia': 203,
      'multitienda': 45
    };

    const notificacionCompleta: NotificacionPromocion = {
      ...nuevaNotif,
      id: `NOTIF-${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
      estado: 'programada',
      cantidadDestinatarios: estimacionDestinatarios[nuevaNotif.publicoObjetivo as keyof typeof estimacionDestinatarios] || 450,
    } as NotificacionPromocion;

    setNotificaciones([notificacionCompleta, ...notificaciones]);
    toast.success('Notificación programada correctamente');
    setMostrarModalCrear(false);
  };

  const handleSeleccionarPromocion = (promocionId: string) => {
    const promocion = promocionesActivas.find(p => p.id === promocionId);
    if (promocion) {
      setNuevaNotif({
        ...nuevaNotif,
        promocionId: promocion.id,
        titulo: `🎉 ${promocion.nombre}`,
        mensaje: promocion.descripcion,
        tipo: 'nueva_promocion'
      });
    }
  };

  const getTipoBadge = (tipo: TipoNotificacion) => {
    const configs = {
      'nueva_promocion': { color: 'bg-green-100 text-green-700', label: 'Nueva Promo' },
      'vencimiento_proximo': { color: 'bg-orange-100 text-orange-700', label: 'Vencimiento' },
      'activacion_horario': { color: 'bg-blue-100 text-blue-700', label: 'Horario' },
      'personalizada': { color: 'bg-purple-100 text-purple-700', label: 'Personalizada' },
      'recordatorio': { color: 'bg-yellow-100 text-yellow-700', label: 'Recordatorio' },
    };
    return configs[tipo] || configs.personalizada;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'enviada':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'programada':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-teal-600" />
            Notificaciones de Promociones
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Envía notificaciones push a tus clientes sobre promociones activas
          </p>
        </div>
        <Button 
          onClick={handleCrearNotificacion}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Notificación
        </Button>
      </div>

      {/* Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enviadas</p>
                <p className="font-medium mt-1">{estadisticas.totalEnviadas}</p>
              </div>
              <Send className="w-8 h-8 text-teal-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Apertura</p>
                <p className="font-medium mt-1">{estadisticas.tasaAperturaPromedio.toFixed(1)}%</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Clics</p>
                <p className="font-medium mt-1">{estadisticas.tasaClicsPromedio.toFixed(1)}%</p>
              </div>
              <MousePointerClick className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Notificaciones</p>
                <p className="font-medium mt-1">{estadisticas.totalNotificaciones}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Historial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historial de Notificaciones</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="enviada">Enviadas</SelectItem>
                  <SelectItem value="programada">Programadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificacionesFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay notificaciones en este estado</p>
              </div>
            ) : (
              notificacionesFiltradas.map((notif) => {
                const tipoBadge = getTipoBadge(notif.tipo);
                const tasaApertura = calcularTasaApertura(notif);
                const tasaClics = calcularTasaClics(notif);
                
                return (
                  <Card key={notif.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {/* Imagen */}
                        {notif.imagen && (
                          <div className="flex-shrink-0">
                            <img 
                              src={notif.imagen} 
                              alt={notif.titulo}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getEstadoIcon(notif.estado)}
                                <h4 className="font-medium">{notif.titulo}</h4>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{notif.mensaje}</p>
                            </div>
                            <Badge className={tipoBadge.color}>
                              {tipoBadge.label}
                            </Badge>
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {notif.cantidadDestinatarios} destinatarios
                            </span>
                            
                            {notif.estado === 'enviada' && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {tasaApertura.toFixed(1)}% apertura
                                </span>
                                <span className="flex items-center gap-1">
                                  <MousePointerClick className="w-3 h-3" />
                                  {tasaClics.toFixed(1)}% clics
                                </span>
                              </>
                            )}
                            
                            {notif.estado === 'programada' && notif.fechaProgramada && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Programada: {new Date(notif.fechaProgramada).toLocaleString('es-ES')}
                              </span>
                            )}
                            
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(notif.fechaCreacion).toLocaleDateString('es-ES')}
                            </span>
                            
                            {!notif.automatica && (
                              <span className="text-teal-600">
                                Por: {notif.gerenteNombre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear/Enviar Notificación */}
      <Dialog open={mostrarModalCrear} onOpenChange={setMostrarModalCrear}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-teal-600" />
              Nueva Notificación Push
            </DialogTitle>
            <DialogDescription>
              Crea y envía notificaciones personalizadas a tus clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Seleccionar Promoción */}
            <div className="space-y-2">
              <Label>Vincular a Promoción (Opcional)</Label>
              <Select 
                value={nuevaNotif.promocionId || ''} 
                onValueChange={handleSeleccionarPromocion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una promoción activa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ninguna">Ninguna (personalizada)</SelectItem>
                  {promocionesActivas.map(promo => (
                    <SelectItem key={promo.id} value={promo.id}>
                      {promo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Notificación */}
            <div className="space-y-2">
              <Label>Tipo de Notificación</Label>
              <Select 
                value={nuevaNotif.tipo} 
                onValueChange={(value) => setNuevaNotif({...nuevaNotif, tipo: value as TipoNotificacion})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizada">Personalizada</SelectItem>
                  <SelectItem value="nueva_promocion">Nueva Promoción</SelectItem>
                  <SelectItem value="recordatorio">Recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Ej: ¡Nueva promoción disponible!"
                value={nuevaNotif.titulo}
                onChange={(e) => setNuevaNotif({...nuevaNotif, titulo: e.target.value})}
              />
            </div>

            {/* Mensaje */}
            <div className="space-y-2">
              <Label>Mensaje *</Label>
              <Textarea
                placeholder="Escribe el mensaje de la notificación..."
                value={nuevaNotif.mensaje}
                onChange={(e) => setNuevaNotif({...nuevaNotif, mensaje: e.target.value})}
                rows={3}
              />
            </div>

            {/* URL Imagen */}
            <div className="space-y-2">
              <Label>URL de Imagen (Opcional)</Label>
              <Input
                placeholder="https://..."
                value={nuevaNotif.imagen || ''}
                onChange={(e) => setNuevaNotif({...nuevaNotif, imagen: e.target.value})}
              />
            </div>

            {/* Público Objetivo */}
            <div className="space-y-2">
              <Label>Público Objetivo</Label>
              <Select 
                value={nuevaNotif.publicoObjetivo} 
                onValueChange={(value) => setNuevaNotif({...nuevaNotif, publicoObjetivo: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General (450 clientes)</SelectItem>
                  <SelectItem value="premium">Premium (87 clientes)</SelectItem>
                  <SelectItem value="nuevo">Nuevos (125 clientes)</SelectItem>
                  <SelectItem value="alta_frecuencia">Alta Frecuencia (203 clientes)</SelectItem>
                  <SelectItem value="multitienda">Multitienda (45 clientes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Programar Fecha */}
            <div className="space-y-2">
              <Label>Programar Envío (Opcional)</Label>
              <Input
                type="datetime-local"
                value={nuevaNotif.fechaProgramada ? nuevaNotif.fechaProgramada.slice(0, 16) : ''}
                onChange={(e) => setNuevaNotif({...nuevaNotif, fechaProgramada: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
              />
              <p className="text-xs text-gray-500">
                Deja vacío para enviar inmediatamente
              </p>
            </div>

            {/* Preview */}
            {(nuevaNotif.titulo || nuevaNotif.mensaje) && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                <div className="bg-white rounded-lg shadow-md p-3 flex gap-3">
                  {nuevaNotif.imagen && (
                    <img 
                      src={nuevaNotif.imagen} 
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{nuevaNotif.titulo || 'Título de la notificación'}</p>
                    <p className="text-xs text-gray-600 mt-1">{nuevaNotif.mensaje || 'Mensaje de la notificación'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarModalCrear(false)}>
              Cancelar
            </Button>
            {nuevaNotif.fechaProgramada ? (
              <Button onClick={handleProgramarNotificacion} className="bg-blue-600 hover:bg-blue-700">
                <Clock className="w-4 h-4 mr-2" />
                Programar
              </Button>
            ) : (
              <Button onClick={handleEnviarNotificacion} className="bg-teal-600 hover:bg-teal-700">
                <Send className="w-4 h-4 mr-2" />
                Enviar Ahora
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
