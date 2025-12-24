import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  MessageSquare, 
  Users, 
  UserCheck,
  ExternalLink,
  Plus,
  Search,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';

interface Chat {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'clientes' | 'empleados' | 'externos';
  estado: 'abierto' | 'en-proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  creador: string;
  asignadoA?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  mensajes: ChatMensaje[];
}

interface ChatMensaje {
  id: string;
  autor: string;
  mensaje: string;
  fecha: string;
  esGerente: boolean;
}

export function AyudaGerente() {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'clientes' | 'empleados' | 'externos'>('todos');
  const [chatSeleccionado, setChatSeleccionado] = useState<Chat | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [vistaCompleta, setVistaCompleta] = useState(false);
  const [dialogNuevoTicket, setDialogNuevoTicket] = useState(false);
  const [archivoAdjunto, setArchivoAdjunto] = useState<string | null>(null);
  const [nuevoTicket, setNuevoTicket] = useState({
    titulo: '',
    categoria: 'empleados' as 'clientes' | 'empleados' | 'externos',
    descripcion: '',
    prioridad: 'media' as 'baja' | 'media' | 'alta' | 'urgente',
    asignadoA: '',
    creador: '',
    fechaVencimiento: '',
    etiquetas: '',
    mensajeInicial: ''
  });

  // Lista de colaboradores disponibles para asignar
  const colaboradores = [
    { id: '1', nombre: 'Ana Rodríguez' },
    { id: '2', nombre: 'María González' },
    { id: '3', nombre: 'Gerente' },
    { id: '4', nombre: 'Carlos Pérez' },
    { id: '5', nombre: 'Laura Sánchez' }
  ];

  const chats: Chat[] = [
    {
      id: 'TKT-001',
      titulo: 'Problema con pedido de pan integral',
      descripcion: 'El cliente reporta que el pan integral llegó en mal estado',
      categoria: 'clientes',
      estado: 'abierto',
      prioridad: 'alta',
      creador: 'María González (Cliente)',
      asignadoA: 'Ana Rodríguez',
      fechaCreacion: '2025-11-18T09:30:00',
      fechaActualizacion: '2025-11-18T10:15:00',
      mensajes: [
        {
          id: 'MSG-001',
          autor: 'María González (Cliente)',
          mensaje: 'El pan integral llegó en mal estado',
          fecha: '2025-11-18T09:30:00',
          esGerente: false
        },
        {
          id: 'MSG-002',
          autor: 'Ana Rodríguez',
          mensaje: 'Hemos recibido tu consulta. Estamos trabajando en ello.',
          fecha: '2025-11-18T10:15:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-002',
      titulo: 'Consulta sobre horarios de trabajo',
      descripcion: 'Solicitud de cambio de turno para próxima semana',
      categoria: 'empleados',
      estado: 'en-proceso',
      prioridad: 'media',
      creador: 'Carlos Méndez (Empleado)',
      asignadoA: 'Gerente',
      fechaCreacion: '2025-11-18T08:00:00',
      fechaActualizacion: '2025-11-18T11:30:00',
      mensajes: [
        {
          id: 'MSG-003',
          autor: 'Carlos Méndez (Empleado)',
          mensaje: 'Solicito cambio de turno para próxima semana',
          fecha: '2025-11-18T08:00:00',
          esGerente: false
        },
        {
          id: 'MSG-004',
          autor: 'Gerente',
          mensaje: 'Revisaremos tu solicitud y te contactaremos.',
          fecha: '2025-11-18T11:30:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-003',
      titulo: 'Pedido especial para evento corporativo',
      descripcion: 'Empresa solicita 200 unidades de bollería variada para el viernes',
      categoria: 'clientes',
      estado: 'en-proceso',
      prioridad: 'urgente',
      creador: 'Roberto Sánchez (Cliente)',
      asignadoA: 'María González',
      fechaCreacion: '2025-11-17T14:20:00',
      fechaActualizacion: '2025-11-18T09:00:00',
      mensajes: [
        {
          id: 'MSG-005',
          autor: 'Roberto Sánchez (Cliente)',
          mensaje: 'Necesitamos 200 unidades de bollería variada para el viernes',
          fecha: '2025-11-17T14:20:00',
          esGerente: false
        },
        {
          id: 'MSG-006',
          autor: 'María González',
          mensaje: 'Confirmamos el pedido. Se enviará el viernes.',
          fecha: '2025-11-18T09:00:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-004',
      titulo: 'Consulta proveedores de harina',
      descripcion: 'Solicitud de información sobre nuevos proveedores de harina integral',
      categoria: 'externos',
      estado: 'abierto',
      prioridad: 'media',
      creador: 'Proveedores S.L.',
      fechaCreacion: '2025-11-17T16:45:00',
      fechaActualizacion: '2025-11-17T16:45:00',
      mensajes: [
        {
          id: 'MSG-007',
          autor: 'Proveedores S.L.',
          mensaje: '¿Tienen información sobre nuevos proveedores de harina integral?',
          fecha: '2025-11-17T16:45:00',
          esGerente: false
        }
      ]
    },
    {
      id: 'TKT-005',
      titulo: 'Solicitud de vacaciones',
      descripcion: 'Solicitud de vacaciones para periodo navideño',
      categoria: 'empleados',
      estado: 'resuelto',
      prioridad: 'baja',
      creador: 'Laura Martínez (Empleada)',
      asignadoA: 'Gerente',
      fechaCreacion: '2025-11-15T10:00:00',
      fechaActualizacion: '2025-11-16T12:00:00',
      mensajes: [
        {
          id: 'MSG-008',
          autor: 'Laura Martínez (Empleada)',
          mensaje: 'Solicito vacaciones para el periodo navideño',
          fecha: '2025-11-15T10:00:00',
          esGerente: false
        },
        {
          id: 'MSG-009',
          autor: 'Gerente',
          mensaje: 'Vacaciones aprobadas para el periodo navideño.',
          fecha: '2025-11-16T12:00:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-006',
      titulo: 'Devolución por producto defectuoso',
      descripcion: 'Cliente solicita devolución de croissants por problemas de calidad',
      categoria: 'clientes',
      estado: 'cerrado',
      prioridad: 'alta',
      creador: 'Ana García (Cliente)',
      asignadoA: 'Ana Rodríguez',
      fechaCreacion: '2025-11-14T11:30:00',
      fechaActualizacion: '2025-11-15T09:00:00',
      mensajes: [
        {
          id: 'MSG-010',
          autor: 'Ana García (Cliente)',
          mensaje: 'Solicito devolución de croissants por problemas de calidad',
          fecha: '2025-11-14T11:30:00',
          esGerente: false
        },
        {
          id: 'MSG-011',
          autor: 'Ana Rodríguez',
          mensaje: 'Hemos recibido tu solicitud. Se procesará la devolución.',
          fecha: '2025-11-15T09:00:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-007',
      titulo: 'Propuesta comercial mayorista',
      descripcion: 'Cadena de hoteles interesada en compra mayorista semanal',
      categoria: 'externos',
      estado: 'en-proceso',
      prioridad: 'alta',
      creador: 'Hoteles Costa S.A.',
      asignadoA: 'Gerente',
      fechaCreacion: '2025-11-16T09:00:00',
      fechaActualizacion: '2025-11-17T15:30:00',
      mensajes: [
        {
          id: 'MSG-012',
          autor: 'Hoteles Costa S.A.',
          mensaje: 'Estamos interesados en una propuesta comercial mayorista semanal',
          fecha: '2025-11-16T09:00:00',
          esGerente: false
        },
        {
          id: 'MSG-013',
          autor: 'Gerente',
          mensaje: 'Prepararemos una propuesta comercial para ti.',
          fecha: '2025-11-17T15:30:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-008',
      titulo: 'Problema con equipo de amasado',
      descripcion: 'La amasadora principal presenta fallos intermitentes',
      categoria: 'empleados',
      estado: 'abierto',
      prioridad: 'urgente',
      creador: 'Javier Torres (Empleado)',
      asignadoA: 'Gerente',
      fechaCreacion: '2025-11-18T06:00:00',
      fechaActualizacion: '2025-11-18T06:30:00',
      mensajes: [
        {
          id: 'MSG-014',
          autor: 'Javier Torres (Empleado)',
          mensaje: 'La amasadora principal presenta fallos intermitentes',
          fecha: '2025-11-18T06:00:00',
          esGerente: false
        },
        {
          id: 'MSG-015',
          autor: 'Gerente',
          mensaje: 'Revisaremos el equipo y te contactaremos.',
          fecha: '2025-11-18T06:30:00',
          esGerente: true
        }
      ]
    },
    {
      id: 'TKT-009',
      titulo: 'Consulta sobre precios mayoristas',
      descripcion: 'Restaurante consulta tarifas para pedidos recurrentes',
      categoria: 'clientes',
      estado: 'abierto',
      prioridad: 'media',
      creador: 'Restaurante El Fogón',
      fechaCreacion: '2025-11-17T12:00:00',
      fechaActualizacion: '2025-11-17T12:00:00',
      mensajes: [
        {
          id: 'MSG-016',
          autor: 'Restaurante El Fogón',
          mensaje: '¿Tienen tarifas para pedidos recurrentes?',
          fecha: '2025-11-17T12:00:00',
          esGerente: false
        }
      ]
    },
    {
      id: 'TKT-010',
      titulo: 'Solicitud de certificado de calidad',
      descripcion: 'Auditoría externa solicita certificados de calidad alimentaria',
      categoria: 'externos',
      estado: 'en-proceso',
      prioridad: 'alta',
      creador: 'SGS Auditores',
      asignadoA: 'Gerente',
      fechaCreacion: '2025-11-16T14:00:00',
      fechaActualizacion: '2025-11-17T10:00:00',
      mensajes: [
        {
          id: 'MSG-017',
          autor: 'SGS Auditores',
          mensaje: 'Solicitamos certificados de calidad alimentaria',
          fecha: '2025-11-16T14:00:00',
          esGerente: false
        },
        {
          id: 'MSG-018',
          autor: 'Gerente',
          mensaje: 'Prepararemos los certificados para ti.',
          fecha: '2025-11-17T10:00:00',
          esGerente: true
        }
      ]
    }
  ];

  const chatsFiltrados = chats.filter(chat => {
    const matchCategoria = activeFilter === 'todos' || chat.categoria === activeFilter;
    const matchBusqueda = chat.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                         chat.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                         chat.creador.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const getEstadoBadge = (estado: string) => {
    const configs = {
      abierto: { className: 'bg-blue-600', label: 'Abierto' },
      'en-proceso': { className: 'bg-yellow-600', label: 'En Proceso' },
      resuelto: { className: 'bg-green-600', label: 'Resuelto' },
      cerrado: { className: 'bg-gray-600', label: 'Cerrado' }
    };
    const config = configs[estado as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPrioridadBadge = (prioridad: string) => {
    const configs = {
      baja: { className: 'bg-gray-500', label: 'Baja' },
      media: { className: 'bg-blue-500', label: 'Media' },
      alta: { className: 'bg-orange-500', label: 'Alta' },
      urgente: { className: 'bg-red-500', label: 'Urgente' }
    };
    const config = configs[prioridad as keyof typeof configs];
    return <Badge variant="outline" className={`border-2 ${config.className.replace('bg-', 'border-')} ${config.className.replace('bg-', 'text-')}`}>{config.label}</Badge>;
  };

  const getEstadoIcon = (estado: string) => {
    const icons = {
      abierto: <AlertCircle className="w-5 h-5 text-blue-600" />,
      'en-proceso': <Clock className="w-5 h-5 text-yellow-600" />,
      resuelto: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      cerrado: <XCircle className="w-5 h-5 text-gray-600" />
    };
    return icons[estado as keyof typeof icons];
  };

  const handleEnviarMensaje = () => {
    if (nuevoMensaje.trim()) {
      toast.success('Mensaje enviado correctamente');
      setNuevoMensaje('');
    }
  };

  const handleAbrirChat = (chat: Chat) => {
    setChatSeleccionado(chat);
    setVistaCompleta(true);
  };

  const handleCerrarVistaCompleta = () => {
    setVistaCompleta(false);
    setChatSeleccionado(null);
  };

  const handleAdjuntarArchivo = () => {
    // Simular selección de archivo
    setArchivoAdjunto('documento_adjunto.pdf');
    toast.success('Archivo adjuntado correctamente');
  };

  const handleCrearTicket = () => {
    if (!nuevoTicket.titulo || !nuevoTicket.descripcion || !nuevoTicket.creador) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    toast.success('Ticket creado exitosamente');
    setDialogNuevoTicket(false);
    setNuevoTicket({
      titulo: '',
      categoria: 'empleados',
      descripcion: '',
      prioridad: 'media',
      asignadoA: '',
      creador: '',
      fechaVencimiento: '',
      etiquetas: '',
      mensajeInicial: ''
    });
    setArchivoAdjunto(null);
  };

  const contadores = {
    todos: chats.length,
    clientes: chats.filter(t => t.categoria === 'clientes').length,
    empleados: chats.filter(t => t.categoria === 'empleados').length,
    externos: chats.filter(t => t.categoria === 'externos').length
  };

  return (
    <div className="space-y-6">
      {/* Vista Completa del Chat */}
      {vistaCompleta && chatSeleccionado ? (
        <div className="space-y-4">
          {/* Header con botón volver */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleCerrarVistaCompleta}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex-1">
              <h2 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {chatSeleccionado.titulo}
              </h2>
              <p className="text-gray-600 text-sm">{chatSeleccionado.id}</p>
            </div>
          </div>

          {/* Chat completo */}
          <Card>
            <CardContent className="p-6">
              {/* Cabecera del Ticket */}
              <div className="pb-4 border-b mb-4">
                <div className="flex items-center gap-2 mb-3">
                  {getEstadoBadge(chatSeleccionado.estado)}
                  {getPrioridadBadge(chatSeleccionado.prioridad)}
                  <Badge variant="outline" className="text-xs">
                    {chatSeleccionado.categoria === 'clientes' && <Users className="w-3 h-3 mr-1" />}
                    {chatSeleccionado.categoria === 'empleados' && <UserCheck className="w-3 h-3 mr-1" />}
                    {chatSeleccionado.categoria === 'externos' && <ExternalLink className="w-3 h-3 mr-1" />}
                    {chatSeleccionado.categoria.charAt(0).toUpperCase() + chatSeleccionado.categoria.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Creado por:</span>
                    <span className="font-medium">{chatSeleccionado.creador}</span>
                  </div>
                  {chatSeleccionado.asignadoA && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Asignado a:</span>
                      <span className="font-medium">{chatSeleccionado.asignadoA}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Creado:</span>
                    <span>{format(new Date(chatSeleccionado.fechaCreacion), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Última actualización:</span>
                    <span>{format(new Date(chatSeleccionado.fechaActualizacion), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {chatSeleccionado.descripcion}
                </p>
              </div>

              {/* Conversación */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Conversación ({chatSeleccionado.mensajes.length} mensajes)
                </h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                  {chatSeleccionado.mensajes.map(mensaje => (
                    <div
                      key={mensaje.id}
                      className={`p-4 rounded-lg ${
                        mensaje.esGerente 
                          ? 'bg-teal-100 ml-auto max-w-[80%]' 
                          : 'bg-white mr-auto max-w-[80%] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{mensaje.autor}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(mensaje.fecha), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{mensaje.mensaje}</p>
                    </div>
                  ))}
                </div>

                {/* Input para nuevo mensaje */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="outline">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Adjuntar
                    </Button>
                    <Button 
                      onClick={handleEnviarMensaje}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Chat y Soporte
              </h2>
              <p className="text-gray-600 text-sm">
                Gestión de chats y consultas de clientes, empleados y externos
              </p>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setDialogNuevoTicket(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Chat
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeFilter === 'todos' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('todos')}
              className={activeFilter === 'todos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Todos ({contadores.todos})
            </Button>
            <Button
              variant={activeFilter === 'empleados' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('empleados')}
              className={activeFilter === 'empleados' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Empleados ({contadores.empleados})
            </Button>
            <Button
              variant={activeFilter === 'externos' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('externos')}
              className={activeFilter === 'externos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Externos ({contadores.externos})
            </Button>
          </div>

          {/* Lista de Chats - Solo la columna de la lista */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Tickets {activeFilter !== 'todos' && `- ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {chatsFiltrados.length} {chatsFiltrados.length === 1 ? 'ticket encontrado' : 'tickets encontrados'}
              </p>
            </CardHeader>
            <CardContent>
              {chatsFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay tickets que mostrar</p>
                  <p className="text-sm mt-1">
                    Ajusta los filtros o crea un nuevo ticket
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chatsFiltrados.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => handleAbrirChat(chat)}
                      className="p-4 border rounded-lg cursor-pointer transition-all border-gray-200 hover:border-teal-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(chat.estado)}
                          <h3 className="font-medium text-gray-900">{chat.titulo}</h3>
                        </div>
                        <span className="text-xs text-gray-500">{chat.id}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {chat.descripcion}
                      </p>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {getEstadoBadge(chat.estado)}
                        {getPrioridadBadge(chat.prioridad)}
                        <Badge variant="outline" className="text-xs">
                          {chat.categoria === 'clientes' && <Users className="w-3 h-3 mr-1" />}
                          {chat.categoria === 'empleados' && <UserCheck className="w-3 h-3 mr-1" />}
                          {chat.categoria === 'externos' && <ExternalLink className="w-3 h-3 mr-1" />}
                          {chat.categoria.charAt(0).toUpperCase() + chat.categoria.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Por: {chat.creador}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {chat.mensajes.length}
                          </span>
                          <span>{format(new Date(chat.fechaCreacion), 'dd/MM/yy HH:mm')}</span>
                        </div>
                      </div>

                      {chat.asignadoA && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-600">
                            Asignado a: <span className="font-medium">{chat.asignadoA}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal: Nuevo Ticket */}
      <Dialog open={dialogNuevoTicket} onOpenChange={setDialogNuevoTicket}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Nuevo Ticket de Soporte
                </DialogTitle>
                <DialogDescription>
                  Completa la información del ticket de soporte
                </DialogDescription>
              </div>
              <Button 
                onClick={handleAdjuntarArchivo}
                className="bg-orange-500 hover:bg-orange-600 ml-4"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Adjuntar Archivo
              </Button>
            </div>
            {archivoAdjunto && (
              <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                {archivoAdjunto}
              </div>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título del Ticket *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Problema con equipamiento"
                value={nuevoTicket.titulo}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, titulo: e.target.value })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <Select
                value={nuevoTicket.categoria}
                onValueChange={(value: 'clientes' | 'empleados' | 'externos') => 
                  setNuevoTicket({ ...nuevoTicket, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clientes">👤 Clientes</SelectItem>
                  <SelectItem value="empleados">👥 Empleados</SelectItem>
                  <SelectItem value="externos">🔗 Externos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el problema o consulta en detalle..."
                value={nuevoTicket.descripcion}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, descripcion: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prioridad">Prioridad *</Label>
              <Select
                value={nuevoTicket.prioridad}
                onValueChange={(value: 'baja' | 'media' | 'alta' | 'urgente') => 
                  setNuevoTicket({ ...nuevoTicket, prioridad: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">⚪ Baja</SelectItem>
                  <SelectItem value="media">🔵 Media</SelectItem>
                  <SelectItem value="alta">🟠 Alta</SelectItem>
                  <SelectItem value="urgente">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="asignar">Asignar a</Label>
              <Select
                value={nuevoTicket.asignadoA}
                onValueChange={(value) => setNuevoTicket({ ...nuevoTicket, asignadoA: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((colab) => (
                    <SelectItem key={colab.id} value={colab.nombre}>
                      {colab.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creador">Persona que reporta *</Label>
              <Input
                id="creador"
                placeholder="Nombre de quien reporta"
                value={nuevoTicket.creador}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, creador: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="datetime-local"
                value={nuevoTicket.fechaVencimiento}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, fechaVencimiento: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="etiquetas">Etiquetas / Tags</Label>
              <Input
                id="etiquetas"
                placeholder="Ej: Urgente, Equipamiento, Producción (separadas por comas)"
                value={nuevoTicket.etiquetas}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, etiquetas: e.target.value })}
              />
              <p className="text-xs text-gray-500">Separa las etiquetas con comas</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mensajeInicial">Mensaje Inicial</Label>
              <Textarea
                id="mensajeInicial"
                placeholder="Escribe el primer mensaje del ticket..."
                value={nuevoTicket.mensajeInicial}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, mensajeInicial: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-gray-500">Este mensaje se agregará automáticamente al crear el ticket</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNuevoTicket(false)}>
              Cancelar
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCrearTicket}>
              Crear Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}