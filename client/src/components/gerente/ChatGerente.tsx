import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  MessageSquare,
  Send,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Filter,
  Package,
  Info,
  AlertCircle,
  Bug,
  User,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Mensaje {
  id: string;
  contenido: string;
  autor: string;
  rol: 'cliente' | 'colaborador' | 'gerente';
  avatar?: string;
  timestamp: string;
  leido: boolean;
}

interface Conversacion {
  id: string;
  tipo: 'pedido' | 'informacion' | 'reclamacion' | 'fallo-app' | 'otro';
  asunto: string;
  cliente: string;
  clienteAvatar?: string;
  estado: 'abierto' | 'en-curso' | 'cerrado';
  fechaCreacion: string;
  fechaUltimoMensaje: string;
  asignadoA?: string;
  valoracion?: number;
  mensajes: Mensaje[];
}

export function ChatGerente() {
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [filtroColaborador, setFiltroColaborador] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  const gerenteNombre = 'Ana García';
  const gerenteAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100';

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([
    {
      id: 'CHAT-001',
      tipo: 'pedido',
      asunto: 'Consulta sobre pedido PED-002',
      cliente: 'María González',
      clienteAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      estado: 'en-curso',
      fechaCreacion: '2025-11-10T09:00:00',
      fechaUltimoMensaje: '2025-11-10T14:30:00',
      asignadoA: 'Carlos Méndez',
      mensajes: [
        {
          id: 'M1',
          contenido: '¿Cuándo estará listo mi pedido de pan y bollería?',
          autor: 'María González',
          rol: 'cliente',
          timestamp: '2025-11-10T09:00:00',
          leido: true
        },
        {
          id: 'M2',
          contenido: 'Hola María, estoy revisando tu pedido PED-002. Debería estar listo para mañana por la tarde.',
          autor: 'Carlos Méndez',
          rol: 'colaborador',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          timestamp: '2025-11-10T10:15:00',
          leido: true
        }
      ]
    },
    {
      id: 'CHAT-002',
      tipo: 'informacion',
      asunto: 'Información sobre Pan Integral',
      cliente: 'Roberto Sánchez',
      estado: 'cerrado',
      fechaCreacion: '2025-11-09T11:00:00',
      fechaUltimoMensaje: '2025-11-09T11:30:00',
      asignadoA: 'Ana García',
      valoracion: 5,
      mensajes: [
        {
          id: 'M5',
          contenido: 'Hola, quisiera saber si tienen disponibilidad de Pan Integral de masa madre',
          autor: 'Roberto Sánchez',
          rol: 'cliente',
          timestamp: '2025-11-09T11:00:00',
          leido: true
        },
        {
          id: 'M6',
          contenido: 'Sí, tenemos disponibilidad. El precio es 89,90€ por unidad. ¿Cuántos necesitas?',
          autor: 'Ana García',
          rol: 'gerente',
          avatar: gerenteAvatar,
          timestamp: '2025-11-09T11:30:00',
          leido: true
        }
      ]
    },
    {
      id: 'CHAT-003',
      tipo: 'reclamacion',
      asunto: 'Factura incorrecta FAC-2025-0847',
      cliente: 'Laura Martínez',
      estado: 'cerrado',
      fechaCreacion: '2025-11-05T16:00:00',
      fechaUltimoMensaje: '2025-11-06T10:00:00',
      asignadoA: 'Ana García',
      valoracion: 5,
      mensajes: [
        {
          id: 'M7',
          contenido: 'La factura que recibí tiene un error en el total',
          autor: 'Laura Martínez',
          rol: 'cliente',
          timestamp: '2025-11-05T16:00:00',
          leido: true
        }
      ]
    },
    {
      id: 'CHAT-004',
      tipo: 'informacion',
      asunto: 'Disponibilidad de croissants',
      cliente: 'Pedro Gómez',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T08:00:00',
      fechaUltimoMensaje: '2025-11-11T08:00:00',
      mensajes: [
        {
          id: 'M10',
          contenido: 'Buenos días, necesito croissants de mantequilla para mañana',
          autor: 'Pedro Gómez',
          rol: 'cliente',
          timestamp: '2025-11-11T08:00:00',
          leido: false
        }
      ]
    },
    {
      id: 'CHAT-005',
      tipo: 'pedido',
      asunto: 'Estado de reparación',
      cliente: 'Sofía Ruiz',
      estado: 'cerrado',
      fechaCreacion: '2025-11-08T10:00:00',
      fechaUltimoMensaje: '2025-11-08T16:00:00',
      asignadoA: 'Carlos Méndez',
      valoracion: 4,
      mensajes: []
    },
    {
      id: 'CHAT-006',
      tipo: 'fallo-app',
      asunto: 'Error al procesar pago',
      cliente: 'Diego Torres',
      estado: 'cerrado',
      fechaCreacion: '2025-11-07T14:00:00',
      fechaUltimoMensaje: '2025-11-07T15:30:00',
      asignadoA: 'Ana García',
      valoracion: 3,
      mensajes: []
    }
  ]);

  // KPIs
  const totalChats = conversaciones.length;
  const chatsAbiertos = conversaciones.filter(c => c.estado === 'abierto').length;
  const chatsCerrados = conversaciones.filter(c => c.estado === 'cerrado').length;
  const chatsEnCurso = conversaciones.filter(c => c.estado === 'en-curso').length;

  const valoraciones = conversaciones.filter(c => c.valoracion).map(c => c.valoracion!);
  const valoracionPromedio = valoraciones.length > 0 
    ? (valoraciones.reduce((a, b) => a + b, 0) / valoraciones.length).toFixed(1)
    : '0';

  const chatsPorTipo = {
    pedido: conversaciones.filter(c => c.tipo === 'pedido').length,
    informacion: conversaciones.filter(c => c.tipo === 'informacion').length,
    reclamacion: conversaciones.filter(c => c.tipo === 'reclamacion').length,
    falloApp: conversaciones.filter(c => c.tipo === 'fallo-app').length,
    otro: conversaciones.filter(c => c.tipo === 'otro').length
  };

  const tiempoRespuestaPromedio = '12 min'; // Simulado
  const tasaResolucion = chatsCerrados > 0 ? ((chatsCerrados / totalChats) * 100).toFixed(1) : '0';

  const conversacionActual = conversaciones.find(c => c.id === conversacionSeleccionada);

  const conversacionesFiltradas = conversaciones.filter(conv => {
    const matchEstado = filtroEstado === 'todas' || conv.estado === filtroEstado;
    const matchColaborador = filtroColaborador === 'todos' || conv.asignadoA === filtroColaborador;
    const matchBusqueda = conv.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
                          conv.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                          conv.id.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchColaborador && matchBusqueda;
  });

  const colaboradores = Array.from(new Set(conversaciones.map(c => c.asignadoA).filter(Boolean))) as string[];

  const handleEnviarMensaje = () => {
    if (!mensaje.trim() || !conversacionSeleccionada) return;

    setConversaciones(prev => prev.map(conv => {
      if (conv.id === conversacionSeleccionada) {
        return {
          ...conv,
          mensajes: [
            ...conv.mensajes,
            {
              id: `M${Date.now()}`,
              contenido: mensaje,
              autor: gerenteNombre,
              rol: 'gerente',
              avatar: gerenteAvatar,
              timestamp: new Date().toISOString(),
              leido: true
            }
          ],
          fechaUltimoMensaje: new Date().toISOString()
        };
      }
      return conv;
    }));

    setMensaje('');
    toast.success('Mensaje enviado al cliente');
  };

  const handleCerrarChat = (chatId: string) => {
    setConversaciones(prev => prev.map(conv => {
      if (conv.id === chatId) {
        return {
          ...conv,
          estado: 'cerrado',
          mensajes: [
            ...conv.mensajes,
            {
              id: `M${Date.now()}`,
              contenido: 'El chat ha sido cerrado. Por favor, valora la atención recibida.',
              autor: 'Sistema',
              rol: 'gerente',
              timestamp: new Date().toISOString(),
              leido: false
            }
          ]
        };
      }
      return conv;
    }));
    toast.success('Chat cerrado. Se ha solicitado valoración al cliente.');
    setConversacionSeleccionada(null);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return <Package className="w-4 h-4" />;
      case 'informacion':
        return <Info className="w-4 h-4" />;
      case 'reclamacion':
        return <AlertCircle className="w-4 h-4" />;
      case 'fallo-app':
        return <Bug className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return 'Pedido';
      case 'informacion':
        return 'Información';
      case 'reclamacion':
        return 'Reclamación';
      case 'fallo-app':
        return 'Fallo de la app';
      default:
        return 'Otro';
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'informacion':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'reclamacion':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'fallo-app':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'en-curso':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">En curso</Badge>;
      case 'cerrado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Cerrado</Badge>;
      default:
        return null;
    }
  };

  // Vista de conversación individual
  if (conversacionSeleccionada && conversacionActual) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConversacionSeleccionada(null)}
                  >
                    ← Volver
                  </Button>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversacionActual.clienteAvatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {conversacionActual.cliente.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {conversacionActual.cliente}
                    </h3>
                    <p className="text-sm text-gray-600">{conversacionActual.asunto}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getTipoBadgeColor(conversacionActual.tipo)}>
                    {getTipoIcon(conversacionActual.tipo)}
                    <span className="ml-1">{getTipoLabel(conversacionActual.tipo)}</span>
                  </Badge>
                  {getEstadoBadge(conversacionActual.estado)}
                  {conversacionActual.asignadoA && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <User className="w-3 h-3 mr-1" />
                      {conversacionActual.asignadoA}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">ID: {conversacionActual.id}</span>
                </div>
              </div>

              {conversacionActual.estado !== 'cerrado' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCerrarChat(conversacionActual.id)}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Cerrar chat
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {conversacionActual.mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.rol === 'gerente' && msg.autor === gerenteNombre ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={msg.rol === 'cliente' ? conversacionActual.clienteAvatar : msg.avatar} />
                  <AvatarFallback className={msg.rol === 'cliente' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}>
                    {msg.autor.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 max-w-[80%] ${msg.rol === 'gerente' && msg.autor === gerenteNombre ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{msg.autor}</span>
                    {msg.rol !== 'cliente' && (
                      <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                        {msg.rol === 'gerente' ? 'Gerente' : 'Colaborador'}
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg ${
                      msg.rol === 'gerente' && msg.autor === gerenteNombre
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.contenido}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {conversacionActual.estado !== 'cerrado' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEnviarMensaje();
                    }
                  }}
                />
                <Button
                  onClick={handleEnviarMensaje}
                  className="bg-teal-600 hover:bg-teal-700 self-end"
                  disabled={!mensaje.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Vista principal con KPIs
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            💬 Conversaciones
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {totalChats} conversaciones · {chatsAbiertos + chatsEnCurso} activas
          </p>
        </div>
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
          <MessageSquare className="w-3 h-3 mr-1" />
          Chat en tiempo real
        </Badge>
      </div>

      {/* KPIs Compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {totalChats}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {chatsAbiertos + chatsEnCurso}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {chatsCerrados}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">Cerradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-100 flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {valoracionPromedio}⭐
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">Valoración</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas colapsables (opcional - solo desktop) */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-sm">Distribución por tipo</h3>
            </div>
            <div className="grid grid-cols-5 gap-3 text-center">
              <div>
                <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{chatsPorTipo.pedido}</p>
                <p className="text-xs text-gray-600">Pedidos</p>
              </div>
              <div>
                <Info className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{chatsPorTipo.informacion}</p>
                <p className="text-xs text-gray-600">Info</p>
              </div>
              <div>
                <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{chatsPorTipo.reclamacion}</p>
                <p className="text-xs text-gray-600">Reclamaciones</p>
              </div>
              <div>
                <Bug className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{chatsPorTipo.falloApp}</p>
                <p className="text-xs text-gray-600">Fallos</p>
              </div>
              <div>
                <MessageSquare className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-lg font-semibold">{chatsPorTipo.otro}</p>
                <p className="text-xs text-gray-600">Otros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Buscador y Filtros rápidos */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Buscador principal */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>

            {/* Filtros rápidos - Pills */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filtroEstado === 'todas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroEstado('todas')}
                className="h-8 text-xs"
              >
                Todas ({conversaciones.length})
              </Button>
              <Button
                variant={filtroEstado === 'abierto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroEstado('abierto')}
                className="h-8 text-xs"
              >
                🔔 Pendientes ({chatsAbiertos})
              </Button>
              <Button
                variant={filtroEstado === 'en-curso' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroEstado('en-curso')}
                className="h-8 text-xs"
              >
                💬 En curso ({chatsEnCurso})
              </Button>
              <Button
                variant={filtroEstado === 'cerrado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroEstado('cerrado')}
                className="h-8 text-xs"
              >
                ✅ Cerradas ({chatsCerrados})
              </Button>
            </div>

            {/* Filtro por colaborador (solo en desktop) */}
            <div className="hidden sm:block">
              <Select value={filtroColaborador} onValueChange={setFiltroColaborador}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los colaboradores</SelectItem>
                  {colaboradores.map(colab => (
                    <SelectItem key={colab} value={colab}>{colab}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de conversaciones - Estilo WhatsApp */}
      <Card>
        <CardHeader className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              Conversaciones activas
            </CardTitle>
            <span className="text-xs sm:text-sm text-gray-500">
              {conversacionesFiltradas.length} {conversacionesFiltradas.length === 1 ? 'conversación' : 'conversaciones'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {conversacionesFiltradas.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No hay conversaciones</h3>
              <p className="text-sm text-gray-500">
                No hay chats que mostrar con los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {conversacionesFiltradas.map((conv, index) => {
                const ultimoMensaje = conv.mensajes[conv.mensajes.length - 1];
                const tieneNoLeidos = conv.mensajes.some(m => !m.leido && m.rol === 'cliente');
                
                return (
                  <div
                    key={conv.id}
                    className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                    onClick={() => setConversacionSeleccionada(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar con indicador de estado */}
                      <div className="relative shrink-0">
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
                          <AvatarImage src={conv.clienteAvatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-base">
                            {conv.cliente.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conv.estado === 'en-curso' && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                        {tieneNoLeidos && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                            {conv.mensajes.filter(m => !m.leido && m.rol === 'cliente').length}
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        {/* Línea 1: Nombre + Hora */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                            {conv.cliente}
                          </h4>
                          <span className="text-xs text-gray-500 shrink-0">
                            {new Date(conv.fechaUltimoMensaje).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Línea 2: Badges de tipo y estado */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getTipoBadgeColor(conv.tipo)}`}>
                            {getTipoIcon(conv.tipo)}
                            <span className="ml-1">{getTipoLabel(conv.tipo)}</span>
                          </Badge>
                          {getEstadoBadge(conv.estado)}
                          {conv.asignadoA && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-purple-50 text-purple-700 border-purple-200">
                              <User className="w-2.5 h-2.5 mr-0.5" />
                              {conv.asignadoA.split(' ')[0]}
                            </Badge>
                          )}
                        </div>

                        {/* Línea 3: Último mensaje (preview) */}
                        <p className="text-sm text-gray-600 truncate">
                          {ultimoMensaje.rol === 'cliente' ? '' : '✓ '}
                          {ultimoMensaje.contenido}
                        </p>

                        {/* Valoración si existe */}
                        {conv.valoracion && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < conv.valoracion!
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Indicador visual de acción */}
                      <div className="self-center shrink-0 text-gray-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}