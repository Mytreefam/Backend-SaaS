import { useState, useEffect } from 'react';
import { getTicketsSoporte, createTicketSoporte } from '../../services/api/gerente.api';
import { chatApi } from '../../services/api/chat.api';
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
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Paperclip,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

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
  const [busqueda] = useState(''); // setBusqueda is unused, keep busqueda for filter logic
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


  // Estado de chats
  const [chats, setChats] = useState<Chat[]>([]);
  const [, setLoadingChats] = useState(false); // loadingChats is unused

  // Estado de tickets
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Filtro de chats
  const chatsFiltrados = chats.filter((chat: Chat) => {
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

  useEffect(() => {
    let cancelled = false;
    setLoadingChats(true);
    chatApi
      .getAll()
      .then((data) => {
        if (cancelled) return;
        setChats(
          (Array.isArray(data) ? data : []).map((chat) => ({
            id: chat.id?.toString?.() ?? String(chat.id ?? ''),
            titulo: (chat.asunto || '').toString(),
            descripcion: (chat.asunto || '').toString(),
            categoria: ((chat as any).tipo || 'clientes') as any,
            estado: (chat.estado || 'abierto') as any,
            prioridad: 'media',
            creador: chat.cliente?.nombre || '',
            asignadoA: '',
            fechaCreacion: (chat.creadoEn || '') as any,
            fechaActualizacion: (chat.creadoEn || '') as any,
            mensajes: (chat.mensajes || []).map((msg: any) => ({
              id: msg.id?.toString?.() ?? String(msg.id ?? ''),
              autor: msg.autor || '',
              mensaje: msg.texto || msg.mensaje || '',
              fecha: msg.fecha || '',
              esGerente: (msg.autor || '') === 'Gerente',
            })),
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
        setChats([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingChats(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch tickets reales
  useEffect(() => {
    setLoadingTickets(true);
    getTicketsSoporte()
      .then((data) => {
        setTickets(Array.isArray(data) ? data : []);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }, []);
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatSeleccionado) return;
    try {
      const sent = await chatApi.sendMessage(Number(chatSeleccionado.id), {
        contenido: nuevoMensaje,
        remitente: 'Gerente',
      });
      if (!sent) throw new Error('Error al enviar mensaje');
      toast.success('Mensaje enviado correctamente');
      setNuevoMensaje('');
      // Refrescar mensajes del chat seleccionado
      const chatData = await chatApi.getById(Number(chatSeleccionado.id));
      if (chatData) {
        setChatSeleccionado((prev) =>
          prev
            ? {
                ...prev,
                mensajes: (chatData.mensajes || []).map((msg: any) => ({
                  id: msg.id?.toString?.() ?? String(msg.id ?? ''),
                  autor: msg.autor || '',
                  mensaje: msg.texto || msg.mensaje || '',
                  fecha: msg.fecha || '',
                  esGerente: (msg.autor || '') === 'Gerente',
                })),
              }
            : prev
        );
      }
    } catch (e) {
      toast.error('No se pudo enviar el mensaje');
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

  const handleCrearTicket = async () => {
    if (!nuevoTicket.titulo || !nuevoTicket.descripcion || !nuevoTicket.creador) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      await createTicketSoporte({
        asunto: nuevoTicket.titulo,
        descripcion: nuevoTicket.descripcion,
        categoria: nuevoTicket.categoria,
        prioridad: nuevoTicket.prioridad,
        // Puedes agregar más campos si la API los soporta
      });
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
      // Refrescar la lista de tickets
      getTicketsSoporte().then(data => setTickets(Array.isArray(data) ? data : []));
    } catch (error) {
      toast.error('Error al crear el ticket');
    }
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
                Chats {activeFilter !== 'todos' && `- ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {chatsFiltrados.length} {chatsFiltrados.length === 1 ? 'chat encontrado' : 'chats encontrados'}
              </p>
            </CardHeader>
            <CardContent>
              {chatsFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay chats que mostrar</p>
                  <p className="text-sm mt-1">
                    Ajusta los filtros o crea un nuevo chat
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

          {/* Tickets reales debajo de los chats */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Tickets de Soporte (API Real)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {loadingTickets ? 'Cargando tickets...' : `${tickets.length} ${tickets.length === 1 ? 'ticket encontrado' : 'tickets encontrados'}`}
                </p>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Cargando tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No hay tickets de soporte que mostrar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map((ticket: any) => (
                      <div key={ticket.id || ticket._id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-orange-900">{ticket.asunto || ticket.titulo || 'Sin asunto'}</h3>
                          <span className="text-xs text-gray-500">{ticket.id || ticket._id}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {ticket.descripcion || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className="bg-orange-500 text-white">{ticket.estado || 'Abierto'}</Badge>
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            {ticket.categoria || 'General'}
                          </Badge>
                          <Badge variant="outline" className="border-red-500 text-red-700">
                            {ticket.prioridad || 'Media'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Por: {ticket.creador || ticket.reportadoPor || 'Desconocido'}</span>
                          <span>{ticket.creadoEn ? format(new Date(ticket.creadoEn), 'dd/MM/yy HH:mm') : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                onValueChange={(value: string) => setNuevoTicket({ ...nuevoTicket, asignadoA: value })}
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