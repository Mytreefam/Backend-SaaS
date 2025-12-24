import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { 
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Package,
  Info,
  AlertCircle,
  Bug,
  User,
  Plus,
  Building2,
  UserCircle2,
  Briefcase,
  Truck,
  Users,
  Building,
  Wrench,
  FileText,
  AlertTriangle,
  Paperclip
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useConfiguracionChats } from '../../contexts/ConfiguracionChatsContext';

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
  mensajes: Mensaje[];
  categoria: 'clientes' | 'otras-tiendas' | 'gerente' | 'agentes-externos'; // Actualizada con agentes-externos
  tienda?: string; // Para chats de otras tiendas
  accionTipo?: 'averia-maquinaria' | 'consulta-rrhh' | 'consulta-material' | 'problema-cliente' | 'otros'; // Nueva propiedad para filtrar por acción
}

export function ChatColaborador() {
  const { categoriasTrabajadores, chatsPedidosActivo } = useConfiguracionChats();
  const categoriasActivas = categoriasTrabajadores.filter(c => c.activo);
  
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas'); // Filtro de categoría
  const [busqueda, setBusqueda] = useState('');
  const [modalEmpezarChat, setModalEmpezarChat] = useState(false);
  
  // Estados para el nuevo modal
  const [accionSeleccionada, setAccionSeleccionada] = useState<string>(categoriasActivas[0]?.accionId || '');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('');
  const [asuntoChat, setAsuntoChat] = useState('');
  const [mensajeChat, setMensajeChat] = useState('');
  const [archivoAdjunto, setArchivoAdjunto] = useState<File | null>(null);

  // Lista de tiendas de Quienes Somos
  const tiendas = [
    'Can Farines - Badalona Centro',
    'Can Farines - Poblenou',
    'Can Farines - Gràcia',
    'Can Farines - Sant Martí',
    'Can Farines - El Born'
  ];

  // Nombre del colaborador actual (vendría de props o contexto)
  const colaboradorActual = 'Carlos Méndez';
  const colaboradorAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100';

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
          contenido: '¿Cuándo estará lista mi pizza? Llevo esperando 20 minutos',
          autor: 'María González',
          rol: 'cliente',
          timestamp: '2025-11-10T09:00:00',
          leido: true
        },
        {
          id: 'M2',
          contenido: 'Hola María, disculpa la espera. Tu Pizza Pepperoni está saliendo del horno ahora mismo. Estará lista en 2 minutos.',
          autor: 'Carlos Méndez',
          rol: 'colaborador',
          avatar: colaboradorAvatar,
          timestamp: '2025-11-10T10:15:00',
          leido: true
        },
        {
          id: 'M3',
          contenido: 'Perfecto, gracias por la información',
          autor: 'María González',
          rol: 'cliente',
          timestamp: '2025-11-10T10:20:00',
          leido: true
        },
        {
          id: 'M4',
          contenido: 'De nada, disfruta tu pizza!',
          autor: 'Carlos Méndez',
          rol: 'colaborador',
          avatar: colaboradorAvatar,
          timestamp: '2025-11-10T14:30:00',
          leido: true
        }
      ],
      categoria: 'clientes'
    },
    {
      id: 'CHAT-004',
      tipo: 'informacion',
      asunto: 'Ingredientes de la hamburguesa vegetariana',
      cliente: 'Roberto Sánchez',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T08:00:00',
      fechaUltimoMensaje: '2025-11-11T08:00:00',
      mensajes: [
        {
          id: 'M10',
          contenido: 'Buenos días, soy alérgico a los frutos secos. ¿La hamburguesa vegetariana contiene nueces?',
          autor: 'Roberto Sánchez',
          rol: 'cliente',
          timestamp: '2025-11-11T08:00:00',
          leido: false
        }
      ],
      categoria: 'clientes'
    },
    {
      id: 'CHAT-005',
      tipo: 'pedido',
      asunto: 'Cambio en el pedido',
      cliente: 'Laura Martínez',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T09:30:00',
      fechaUltimoMensaje: '2025-11-11T09:30:00',
      mensajes: [
        {
          id: 'M11',
          contenido: 'Hola, hice un pedido pero me olvidé de pedir extra de queso. ¿Puedo agregarlo?',
          autor: 'Laura Martínez',
          rol: 'cliente',
          timestamp: '2025-11-11T09:30:00',
          leido: false
        }
      ],
      categoria: 'clientes'
    },
    {
      id: 'CHAT-006',
      tipo: 'reclamacion',
      asunto: 'Pizza llegó fría',
      cliente: 'Pedro López',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T10:00:00',
      fechaUltimoMensaje: '2025-11-11T10:00:00',
      mensajes: [
        {
          id: 'M12',
          contenido: 'Mi pizza llegó fría. Me gustaría una solución por favor.',
          autor: 'Pedro López',
          rol: 'cliente',
          timestamp: '2025-11-11T10:00:00',
          leido: false
        }
      ],
      categoria: 'clientes'
    },
    {
      id: 'CHAT-007',
      tipo: 'informacion',
      asunto: 'Consulta sobre promociones',
      cliente: 'Tienda Badalona Centro',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T11:00:00',
      fechaUltimoMensaje: '2025-11-11T11:00:00',
      mensajes: [
        {
          id: 'M13',
          contenido: 'Hola, ¿tenéis disponibles las promociones de pan de payés para esta semana?',
          autor: 'Tienda Badalona Centro',
          rol: 'colaborador',
          timestamp: '2025-11-11T11:00:00',
          leido: false
        }
      ],
      categoria: 'otras-tiendas',
      tienda: 'Tienda Badalona Centro'
    },
    {
      id: 'CHAT-008',
      tipo: 'pedido',
      asunto: 'Solicitud de inventario',
      cliente: 'Jorge Martín - Gerente',
      clienteAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T12:00:00',
      fechaUltimoMensaje: '2025-11-11T12:00:00',
      mensajes: [
        {
          id: 'M14',
          contenido: 'Buenos días, necesito el reporte de inventario actualizado para la reunión de las 15:00h',
          autor: 'Jorge Martín - Gerente',
          rol: 'gerente',
          timestamp: '2025-11-11T12:00:00',
          leido: false
        }
      ],
      categoria: 'gerente'
    },
    {
      id: 'CHAT-009',
      tipo: 'informacion',
      asunto: 'Transferencia de productos',
      cliente: 'Tienda Poblenou',
      estado: 'en-curso',
      fechaCreacion: '2025-11-10T16:00:00',
      fechaUltimoMensaje: '2025-11-11T09:00:00',
      asignadoA: 'Carlos Méndez',
      mensajes: [
        {
          id: 'M15',
          contenido: 'Necesitamos 20 baguettes para mañana temprano, ¿podéis enviarnos?',
          autor: 'Tienda Poblenou',
          rol: 'colaborador',
          timestamp: '2025-11-10T16:00:00',
          leido: true
        },
        {
          id: 'M16',
          contenido: 'Sí, sin problema. Las tendremos listas antes de las 7:00h',
          autor: 'Carlos Méndez',
          rol: 'colaborador',
          avatar: colaboradorAvatar,
          timestamp: '2025-11-11T09:00:00',
          leido: true
        }
      ],
      categoria: 'otras-tiendas',
      tienda: 'Tienda Poblenou'
    },
    {
      id: 'CHAT-010',
      tipo: 'reclamacion',
      asunto: 'Revisión de procedimientos',
      cliente: 'Jorge Martín - Gerente',
      clienteAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      estado: 'en-curso',
      fechaCreacion: '2025-11-09T10:00:00',
      fechaUltimoMensaje: '2025-11-11T08:30:00',
      asignadoA: 'Carlos Méndez',
      mensajes: [
        {
          id: 'M17',
          contenido: 'Carlos, he recibido comentarios sobre los tiempos de espera. Necesitamos revisar el proceso del TPV.',
          autor: 'Jorge Martín - Gerente',
          rol: 'gerente',
          timestamp: '2025-11-09T10:00:00',
          leido: true
        },
        {
          id: 'M18',
          contenido: 'Entendido. He implementado el nuevo sistema de Estado TPV que ayudará con las aperturas y cierres. ¿Podemos reunirnos para revisarlo?',
          autor: 'Carlos Méndez',
          rol: 'colaborador',
          avatar: colaboradorAvatar,
          timestamp: '2025-11-11T08:30:00',
          leido: true
        }
      ],
      categoria: 'gerente'
    },
    {
      id: 'CHAT-011',
      tipo: 'pedido',
      asunto: 'Pedido de harina premium',
      cliente: 'Harinas Selectas S.L.',
      estado: 'abierto',
      fechaCreacion: '2025-11-11T13:00:00',
      fechaUltimoMensaje: '2025-11-11T13:00:00',
      mensajes: [
        {
          id: 'M19',
          contenido: 'Buenas tardes, nos gustaría confirmar el pedido de 50kg de harina de trigo integral para la próxima semana.',
          autor: 'Harinas Selectas S.L.',
          rol: 'colaborador',
          timestamp: '2025-11-11T13:00:00',
          leido: false
        }
      ],
      categoria: 'agentes-externos'
    },
    {
      id: 'CHAT-012',
      tipo: 'informacion',
      asunto: 'Consulta sobre instalación equipos',
      cliente: 'TechnoHorno Industrial',
      estado: 'en-curso',
      fechaCreacion: '2025-11-10T11:00:00',
      fechaUltimoMensaje: '2025-11-11T10:00:00',
      asignadoA: 'Carlos Méndez',
      mensajes: [
        {
          id: 'M20',
          contenido: 'Hola, necesitamos coordinar la instalación del nuevo horno para el próximo mes.',
          autor: 'TechnoHorno Industrial',
          rol: 'colaborador',
          timestamp: '2025-11-10T11:00:00',
          leido: true
        },
        {
          id: 'M21',
          contenido: 'Perfecto, ¿podríamos agendar la visita técnica para la semana del 25?',
          autor: 'Carlos Méndez',
          rol: 'colaborador',
          avatar: colaboradorAvatar,
          timestamp: '2025-11-11T10:00:00',
          leido: true
        }
      ],
      categoria: 'agentes-externos'
    }
  ]);

  const conversacionActual = conversaciones.find(c => c.id === conversacionSeleccionada);

  // Helper para obtener el icono de una categoría
  const getCategoriaIcon = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      Wrench: <Wrench className="w-4 h-4" />,
      Users: <Users className="w-4 h-4" />,
      Package: <Package className="w-4 h-4" />,
      AlertTriangle: <AlertTriangle className="w-4 h-4" />,
      Building: <Building className="w-4 h-4" />,
      FileText: <FileText className="w-4 h-4" />,
      Mail: <MessageSquare className="w-4 h-4" />,
      MessageCircle: <MessageSquare className="w-4 h-4" />,
      Settings: <MessageSquare className="w-4 h-4" />,
    };
    return iconMap[iconName] || <MessageSquare className="w-4 h-4" />;
  };

  const conversacionesFiltradas = conversaciones.filter(conv => {
    const matchBusqueda = conv.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
                          conv.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                          conv.id.toLowerCase().includes(busqueda.toLowerCase());
    
    // Nueva lógica de filtrado por categorías agrupadas
    let matchCategoria = false;
    
    if (filtroCategoria === 'todas') {
      matchCategoria = true;
    } else if (filtroCategoria === 'pedidos') {
      // Solo chats de tipo pedido
      matchCategoria = conv.tipo === 'pedido';
    } else if (filtroCategoria === 'incidencias') {
      // Agrupa: avería maquinaria + incidencia cliente
      matchCategoria = 
        conv.accionTipo === 'averia-maquinaria' || 
        conv.accionTipo === 'problema-cliente' ||
        conv.tipo === 'reclamacion';
    } else if (filtroCategoria === 'otros') {
      // Agrupa: Otras tiendas + gerente + rrhh + otros
      matchCategoria = 
        conv.categoria === 'otras-tiendas' ||
        conv.categoria === 'gerente' ||
        conv.categoria === 'agentes-externos' ||
        conv.accionTipo === 'consulta-rrhh' ||
        conv.accionTipo === 'consulta-material' ||
        conv.accionTipo === 'otros' ||
        (conv.tipo === 'informacion' && !conv.accionTipo && conv.categoria !== 'clientes');
    }
    
    return matchBusqueda && matchCategoria;
  });

  const chatsPendientes = conversaciones.filter(c => c.estado === 'abierto').length;
  const chatsEnCurso = conversaciones.filter(c => c.estado === 'en-curso' && c.asignadoA === colaboradorActual).length;

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
              autor: colaboradorActual,
              rol: 'colaborador',
              avatar: colaboradorAvatar,
              timestamp: new Date().toISOString(),
              leido: true
            }
          ],
          fechaUltimoMensaje: new Date().toISOString(),
          estado: conv.estado === 'abierto' ? 'en-curso' : conv.estado,
          asignadoA: conv.estado === 'abierto' ? colaboradorActual : conv.asignadoA
        };
      }
      return conv;
    }));

    setMensaje('');
    toast.success('Mensaje enviado al cliente');
  };

  const handleTomarChat = (chatId: string) => {
    setConversaciones(prev => prev.map(conv => {
      if (conv.id === chatId) {
        return {
          ...conv,
          estado: 'en-curso',
          asignadoA: colaboradorActual
        };
      }
      return conv;
    }));
    setConversacionSeleccionada(chatId);
    toast.success('Chat asignado a ti');
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
              rol: 'colaborador',
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
        {/* Header */}
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

        {/* Mensajes */}
        <Card>
          <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {conversacionActual.mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.rol === 'colaborador' && msg.autor === colaboradorActual ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={msg.rol === 'cliente' ? conversacionActual.clienteAvatar : msg.avatar} />
                  <AvatarFallback className={msg.rol === 'cliente' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}>
                    {msg.autor.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 max-w-[80%] ${msg.rol === 'colaborador' && msg.autor === colaboradorActual ? 'text-right' : ''}`}>
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
                      msg.rol === 'colaborador' && msg.autor === colaboradorActual
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

        {/* Input de mensaje */}
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

  // Vista principal
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Chats
          </h1>
          <p className="text-gray-600 mt-1">
            Comunícate más rápido con todos tus compañeros/as de trabajo
          </p>
        </div>
        
        <Button 
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => {
            setModalEmpezarChat(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Empezar Chat
        </Button>
      </div>

      {/* Filtros de búsqueda y categoría */}
      <div className="space-y-3">
        {/* Filtros de categoría como botones */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {/* Todos los Chats */}
            <Button
              onClick={() => setFiltroCategoria('todas')}
              variant={filtroCategoria === 'todas' ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap ${
                filtroCategoria === 'todas' 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              Todos los Chats
            </Button>
            
            {/* Pedidos (solo si chatsPedidosActivo es true) */}
            {chatsPedidosActivo && (
              <Button
                onClick={() => setFiltroCategoria('pedidos')}
                variant={filtroCategoria === 'pedidos' ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap ${
                  filtroCategoria === 'pedidos' 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 mr-1" />
                Pedidos
              </Button>
            )}
            
            {/* Incidencias */}
            <Button
              onClick={() => setFiltroCategoria('incidencias')}
              variant={filtroCategoria === 'incidencias' ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap ${
                filtroCategoria === 'incidencias' 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Incidencias
            </Button>
            
            {/* Otros */}
            <Button
              onClick={() => setFiltroCategoria('otros')}
              variant={filtroCategoria === 'otros' ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap ${
                filtroCategoria === 'otros' 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              <Building className="w-4 h-4 mr-1" />
              Otros
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda con botón Filtros */}
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-gray-300">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, asunto o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Lista de conversaciones - Estilo WhatsApp */}
      <Card>
        <CardHeader className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              Conversaciones
            </CardTitle>
            <span className="text-xs sm:text-sm text-gray-500">
              {conversacionesFiltradas.length} {conversacionesFiltradas.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {conversacionesFiltradas.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No hay chats</h3>
              <p className="text-sm text-gray-500">
                No hay conversaciones que mostrar
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {conversacionesFiltradas.map((conv) => {
                const ultimoMensaje = conv.mensajes[conv.mensajes.length - 1];
                const mensajesNoLeidos = conv.mensajes.filter(m => !m.leido && m.rol !== 'colaborador').length;
                
                return (
                  <div
                    key={conv.id}
                    className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                    onClick={() => {
                      if (conv.estado === 'abierto') {
                        handleTomarChat(conv.id);
                      } else {
                        setConversacionSeleccionada(conv.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar con indicadores */}
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
                        {conv.estado === 'abierto' && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 border-2 border-white rounded-full"></div>
                        )}
                        {mensajesNoLeidos > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                            {mensajesNoLeidos}
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

                        {/* Línea 2: Asunto */}
                        <p className="text-sm font-medium text-gray-700 truncate mb-1">
                          {conv.asunto}
                        </p>

                        {/* Línea 3: Preview del último mensaje */}
                        <p className="text-sm text-gray-600 truncate mb-1.5">
                          {ultimoMensaje.rol === 'colaborador' ? 'Tú: ' : `${ultimoMensaje.autor}: `}
                          {ultimoMensaje.contenido}
                        </p>

                        {/* Badges de estado y tipo */}
                        <div className="flex items-center gap-1.5 flex-wrap">
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
                      </div>

                      {/* Botón de acción o indicador */}
                      <div className="self-center shrink-0">
                        {conv.estado === 'abierto' ? (
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTomarChat(conv.id);
                            }}
                          >
                            Tomar
                          </Button>
                        ) : (
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para empezar un chat - NUEVO DISEÑO */}
      <Dialog open={modalEmpezarChat} onOpenChange={(open) => {
        setModalEmpezarChat(open);
        if (!open) {
          // Reset al cerrar
          setAccionSeleccionada(categoriasActivas[0]?.accionId || '');
          setTiendaSeleccionada('');
          setAsuntoChat('');
          setMensajeChat('');
          setArchivoAdjunto(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>Empezar un Nuevo Chat</DialogTitle>
            <DialogDescription>
              Completa los siguientes campos para iniciar una conversación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Desplegable de Acciones */}
            <div className="space-y-2">
              <Label htmlFor="accion">Tipo de Consulta *</Label>
              <Select
                value={accionSeleccionada}
                onValueChange={(value) => {
                  setAccionSeleccionada(value);
                  // Reset tienda si cambia de acción
                  if (value !== 'otra-tienda') {
                    setTiendaSeleccionada('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasActivas.map((categoria) => (
                    <SelectItem key={categoria.accionId} value={categoria.accionId}>
                      <div className="flex items-center gap-2">
                        {getCategoriaIcon(categoria.icono)}
                        <span>{categoria.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="otra-tienda">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-600" />
                      <span>Otra Tienda</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de tienda (solo aparece si se selecciona "Otra Tienda") */}
            {accionSeleccionada === 'otra-tienda' && (
              <div className="space-y-2">
                <Label htmlFor="tienda">Selecciona la tienda *</Label>
                <Select
                  value={tiendaSeleccionada}
                  onValueChange={setTiendaSeleccionada}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiendas.map(tienda => (
                      <SelectItem key={tienda} value={tienda}>
                        {tienda}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campo Asunto */}
            <div className="space-y-2">
              <Label htmlFor="asunto">Asunto *</Label>
              <Input
                id="asunto"
                placeholder="Escribe el asunto del chat..."
                value={asuntoChat}
                onChange={(e) => setAsuntoChat(e.target.value)}
              />
            </div>

            {/* Campo Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje *</Label>
              <Textarea
                id="mensaje"
                placeholder="Escribe tu mensaje..."
                value={mensajeChat}
                onChange={(e) => setMensajeChat(e.target.value)}
                rows={4}
              />
            </div>

            {/* Botón Adjuntar Archivo (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="archivo">Adjuntar archivo (opcional)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-orange-50 border-orange-300 hover:bg-orange-100 text-orange-700"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  {archivoAdjunto ? archivoAdjunto.name : 'Seleccionar archivo'}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setArchivoAdjunto(file);
                      toast.success(`Archivo "${file.name}" seleccionado`);
                    }
                  }}
                />
                {archivoAdjunto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setArchivoAdjunto(null);
                      // Reset input
                      const input = document.getElementById('file-upload') as HTMLInputElement;
                      if (input) input.value = '';
                    }}
                  >
                    ✕
                  </Button>
                )}
              </div>
              {archivoAdjunto && (
                <p className="text-xs text-gray-600">
                  Archivo: {archivoAdjunto.name} ({(archivoAdjunto.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalEmpezarChat(false);
                setAccionSeleccionada(categoriasActivas[0]?.accionId || '');
                setTiendaSeleccionada('');
                setAsuntoChat('');
                setMensajeChat('');
                setArchivoAdjunto(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              disabled={
                !accionSeleccionada ||
                (accionSeleccionada === 'otra-tienda' && !tiendaSeleccionada) ||
                !asuntoChat.trim() ||
                !mensajeChat.trim()
              }
              onClick={() => {
                // Crear el chat
                const nuevoChat: Conversacion = {
                  id: `CHAT-${Date.now()}`,
                  tipo: 'informacion',
                  asunto: asuntoChat,
                  cliente: colaboradorActual,
                  clienteAvatar: colaboradorAvatar,
                  estado: 'abierto',
                  fechaCreacion: new Date().toISOString(),
                  fechaUltimoMensaje: new Date().toISOString(),
                  mensajes: [
                    {
                      id: `M${Date.now()}`,
                      contenido: mensajeChat,
                      autor: colaboradorActual,
                      rol: 'colaborador',
                      avatar: colaboradorAvatar,
                      timestamp: new Date().toISOString(),
                      leido: false
                    }
                  ],
                  categoria: accionSeleccionada === 'otra-tienda' ? 'otras-tiendas' : 'gerente',
                  tienda: accionSeleccionada === 'otra-tienda' ? tiendaSeleccionada : undefined,
                  accionTipo: accionSeleccionada as 'averia-maquinaria' | 'consulta-rrhh' | 'consulta-material' | 'problema-cliente' | 'otros'
                };

                // Añadir a la lista de conversaciones
                setConversaciones(prev => [nuevoChat, ...prev]);

                // Mostrar notificación
                const categoriaSeleccionadaData = categoriasTrabajadores.find(c => c.accionId === accionSeleccionada);
                const destinatario = accionSeleccionada === 'otra-tienda' 
                  ? tiendaSeleccionada 
                  : (categoriaSeleccionadaData?.nombre || 'Gerencia');
                  
                toast.success(`Chat creado: ${asuntoChat}`, {
                  description: `Destinatario: ${destinatario}`
                });

                // Reset y cerrar
                setModalEmpezarChat(false);
                setAccionSeleccionada(categoriasActivas[0]?.accionId || '');
                setTiendaSeleccionada('');
                setAsuntoChat('');
                setMensajeChat('');
                setArchivoAdjunto(null);

                // Abrir el chat recién creado
                setConversacionSeleccionada(nuevoChat.id);
              }}
            >
              Crear Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}