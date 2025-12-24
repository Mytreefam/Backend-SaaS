import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  MessageSquare,
  Send,
  Search,
  Star,
  X,
  CheckCircle2,
  Clock,
  Filter,
  Package,
  Info,
  AlertCircle,
  Bug,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useHaptics } from '../../hooks/useHaptics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { useConfiguracionChats } from '../../contexts/ConfiguracionChatsContext';
import { chatApi, type ChatAPI } from '../../services/api/chat.api';

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
  estado: 'abierto' | 'en-curso' | 'cerrado';
  fechaCreacion: string;
  fechaUltimoMensaje: string;
  mensajesNoLeidos: number;
  valoracion?: number;
  mensajes: Mensaje[];
}

interface FAQ {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

interface ChatClienteProps {
  clienteId: string | number;
  clienteNombre: string;
}

export function ChatCliente({ clienteId, clienteNombre }: ChatClienteProps) {
  const { categoriasClientes } = useConfiguracionChats();
  const categoriasActivas = categoriasClientes.filter(c => c.activo);
  
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState<string | null>(null);
  const [tipoConsulta, setTipoConsulta] = useState<string>(categoriasActivas[0]?.id || 'informacion');
  const [asuntoNuevo, setAsuntoNuevo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaFAQ, setBusquedaFAQ] = useState('');
  const [dialogValoracion, setDialogValoracion] = useState(false);
  const [valoracionSeleccionada, setValoracionSeleccionada] = useState(0);
  const [conversacionACerrar, setConversacionACerrar] = useState<string | null>(null);
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null);
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);

  const { isKeyboardVisible, keyboardHeight, hideKeyboard } = useKeyboard();
  const haptics = useHaptics();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Transformar chat del backend al formato del frontend
  const transformarChat = useCallback((chat: ChatAPI): Conversacion => {
    return {
      id: `CHAT-${chat.id}`,
      tipo: 'pedido', // Por defecto, se puede mejorar con un campo tipo en el backend
      asunto: chat.asunto,
      estado: chat.estado as 'abierto' | 'en-curso' | 'cerrado',
      fechaCreacion: chat.creadoEn,
      fechaUltimoMensaje: chat.mensajes?.length > 0 
        ? chat.mensajes[chat.mensajes.length - 1].fecha 
        : chat.creadoEn,
      mensajesNoLeidos: 0,
      mensajes: chat.mensajes?.map(m => ({
        id: `M-${m.id}`,
        contenido: m.texto,
        autor: m.autor,
        rol: m.autor === 'Cliente' ? 'cliente' : 'colaborador',
        timestamp: m.fecha,
        leido: true,
      })) || [],
    };
  }, []);

  // Cargar conversaciones desde el backend
  const cargarConversaciones = useCallback(async () => {
    try {
      setLoading(true);
      console.log('💬 Cargando chats del cliente:', clienteId);
      const chats = await chatApi.getAll(Number(clienteId));
      console.log('💬 Chats obtenidos:', chats);
      
      if (chats && chats.length > 0) {
        const conversacionesTransformadas = chats.map(transformarChat);
        setConversaciones(conversacionesTransformadas);
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [clienteId, transformarChat]);

  useEffect(() => {
    cargarConversaciones();
  }, [cargarConversaciones]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversacionSeleccionada]);

  // Crear nueva conversación
  const handleCrearConversacion = async () => {
    if (!asuntoNuevo.trim()) {
      toast.error('Por favor, escribe un asunto para tu consulta');
      return;
    }

    setEnviando(true);
    try {
      const nuevoChat = await chatApi.create({
        asunto: asuntoNuevo,
        clienteId: Number(clienteId),
        estado: 'abierto',
        tipo: tipoConsulta,
        mensajes: mensaje.trim() ? [{ autor: 'Cliente', texto: mensaje }] : undefined,
      });

      if (nuevoChat) {
        toast.success('Consulta enviada correctamente');
        setAsuntoNuevo('');
        setMensaje('');
        await cargarConversaciones();
        setConversacionSeleccionada(`CHAT-${nuevoChat.id}`);
      } else {
        toast.error('Error al crear la consulta');
      }
    } catch (error) {
      toast.error('Error al crear la consulta');
    } finally {
      setEnviando(false);
    }
  };

  // Enviar mensaje a una conversación existente
  const handleEnviarMensaje = async () => {
    if (!mensaje.trim() || !conversacionSeleccionada) return;

    const chatId = parseInt(conversacionSeleccionada.replace('CHAT-', ''));
    setEnviando(true);
    
    try {
      const nuevoMensaje = await chatApi.sendMessage(chatId, {
        autor: 'Cliente',
        texto: mensaje,
      });

      if (nuevoMensaje) {
        // Actualizar conversación local
        setConversaciones(prev => prev.map(conv => {
          if (conv.id === conversacionSeleccionada) {
            return {
              ...conv,
              mensajes: [...conv.mensajes, {
                id: `M-${nuevoMensaje.id}`,
                contenido: nuevoMensaje.texto,
                autor: nuevoMensaje.autor,
                rol: 'cliente',
                timestamp: nuevoMensaje.fecha,
                leido: true,
              }],
              fechaUltimoMensaje: nuevoMensaje.fecha,
            };
          }
          return conv;
        }));
        setMensaje('');
        haptics.notification('success');
      }
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setEnviando(false);
    }
  };

  // Mock data para FAQs (estas pueden quedarse como mock o crearse una API después)
  const faqs: FAQ[] = [
    {
      id: 'FAQ001',
      categoria: 'Pedidos',
      pregunta: '¿Cómo puedo rastrear mi pedido?',
      respuesta: 'Puedes rastrear tu pedido en la sección "Pedidos" del menú principal. Allí encontrarás el estado actualizado en tiempo real: En preparación, Listo para recoger, o En camino. También recibirás notificaciones automáticas cuando cambie el estado de tu pedido.'
    },
    {
      id: 'FAQ002',
      categoria: 'Pedidos',
      pregunta: '¿Puedo cancelar un pedido?',
      respuesta: 'Sí, puedes cancelar un pedido siempre que no haya entrado en fase de preparación (primeros 5 minutos). Para cancelarlo, ve a "Pedidos", selecciona el pedido y pulsa "Cancelar pedido". Si ya está en preparación, contacta con nosotros inmediatamente.'
    },
    {
      id: 'FAQ003',
      categoria: 'Pedidos',
      pregunta: '¿Cuánto tarda en estar listo mi pedido?',
      respuesta: 'El tiempo de preparación varía según el pedido: Hamburguesas 10-15 minutos, Pizzas 15-20 minutos. Siempre recibirás una estimación al hacer el pedido y te notificaremos cuando esté listo para recoger o salga para entrega.'
    },
    {
      id: 'FAQ004',
      categoria: 'Pagos',
      pregunta: '¿Cuáles son las formas de pago?',
      respuesta: 'Aceptamos múltiples formas de pago: tarjetas de crédito/débito (Visa, Mastercard), PayPal, Bizum, y pago en efectivo al recoger o recibir el pedido. El pago online es más rápido y tiene prioridad en preparación.'
    },
    {
      id: 'FAQ005',
      categoria: 'Pagos',
      pregunta: '¿Cuándo se cobra mi pedido?',
      respuesta: 'Si pagas con tarjeta online, el cargo se realiza al confirmar el pedido. Si eliges pago al recoger o en entrega, pagarás cuando recibas tu pedido. Recomendamos pago online para agilizar el proceso.'
    },
    {
      id: 'FAQ006',
      categoria: 'Pagos',
      pregunta: '¿Puedo obtener un ticket o factura?',
      respuesta: 'Sí, todas las compras incluyen ticket. Puedes descargar el comprobante desde "Pedidos" > "Ver detalles" > "Descargar ticket". Si necesitas factura con datos fiscales, solicítala en el momento del pedido o contacta con nosotros.'
    },
    {
      id: 'FAQ007',
      categoria: 'Entregas',
      pregunta: '¿Hacen entregas a domicilio?',
      respuesta: 'Sí, ofrecemos servicio de entrega a domicilio en un radio de 5km. El coste de envío es de €2.50 y gratis en pedidos superiores a €20. El tiempo estimado de entrega es de 30-45 minutos desde la confirmación del pedido.'
    },
    {
      id: 'FAQ008',
      categoria: 'Alimentación',
      pregunta: '¿Tienen opciones vegetarianas y veganas?',
      respuesta: 'Sí, contamos con varias opciones: Hamburguesa Vegetal (100% vegana), Pizza Vegetal, y diversos complementos sin productos de origen animal. Puedes filtrar por estas opciones en el catálogo o preguntar al hacer tu pedido.'
    },
    {
      id: 'FAQ009',
      categoria: 'Alimentación',
      pregunta: '¿Informan sobre alérgenos?',
      respuesta: 'Sí, todos nuestros productos tienen información de alérgenos disponible. Los principales alérgenos son: gluten, lácteos, huevo, frutos secos y sésamo. Consulta en cada producto o contáctanos si tienes alergias específicas.'
    }
  ];

  const conversacionActual = conversaciones.find(c => c.id === conversacionSeleccionada);

  const conversacionesFiltradas = conversaciones.filter(conv => {
    const matchTipo = filtroTipo === 'todas' || conv.tipo === filtroTipo;
    const matchBusqueda = conv.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
                          conv.id.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  const faqsFiltradas = faqs.filter(faq => {
    const searchLower = busquedaFAQ.toLowerCase();
    return faq.pregunta.toLowerCase().includes(searchLower) ||
           faq.respuesta.toLowerCase().includes(searchLower) ||
           faq.categoria.toLowerCase().includes(searchLower);
  });

  const categoriasFAQ = Array.from(new Set(faqs.map(f => f.categoria)));

  const handleCerrarChat = async (chatId: string) => {
    setConversacionACerrar(chatId);
    setDialogValoracion(true);
  };

  const handleEnviarValoracion = async () => {
    if (valoracionSeleccionada === 0) {
      toast.error('Por favor selecciona una valoración');
      return;
    }

    if (conversacionACerrar) {
      const chatIdNum = parseInt(conversacionACerrar.replace('CHAT-', ''));
      await chatApi.updateStatus(chatIdNum, 'cerrado');
      
      setConversaciones(prev => prev.map(conv => {
        if (conv.id === conversacionACerrar) {
          return {
            ...conv,
            estado: 'cerrado',
            valoracion: valoracionSeleccionada,
          };
        }
        return conv;
      }));
    }

    toast.success('¡Gracias por tu valoración!');
    setDialogValoracion(false);
    setValoracionSeleccionada(0);
    setConversacionACerrar(null);
    setConversacionSeleccionada(null);
  };

  const getTipoIcon = (tipo: string) => {
    const categoria = categoriasClientes.find(c => c.id === tipo);
    if (!categoria) return <MessageSquare className="w-4 h-4" />;
    
    const iconMap: Record<string, JSX.Element> = {
      Package: <Package className="w-4 h-4" />,
      Info: <Info className="w-4 h-4" />,
      AlertCircle: <AlertCircle className="w-4 h-4" />,
      Bug: <Bug className="w-4 h-4" />,
      HelpCircle: <HelpCircle className="w-4 h-4" />,
      MessageSquare: <MessageSquare className="w-4 h-4" />,
    };
    
    return iconMap[categoria.icono] || <MessageSquare className="w-4 h-4" />;
  };

  const getTipoLabel = (tipo: string) => {
    const categoria = categoriasClientes.find(c => c.id === tipo);
    return categoria?.nombre || 'Otro';
  };

  const getTipoBadgeColor = (tipo: string) => {
    const categoria = categoriasClientes.find(c => c.id === tipo);
    return categoria?.color || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Abierto</Badge>;
      case 'en-curso':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">En curso</Badge>;
      case 'cerrado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Cerrado</Badge>;
      default:
        return null;
    }
  };

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
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {conversacionActual.asunto}
                  </h2>
                  <Badge variant="outline" className={getTipoBadgeColor(conversacionActual.tipo)}>
                    {getTipoIcon(conversacionActual.tipo)}
                    <span className="ml-1">{getTipoLabel(conversacionActual.tipo)}</span>
                  </Badge>
                  {getEstadoBadge(conversacionActual.estado)}
                </div>
                <p className="text-sm text-gray-500 mt-1">ID: {conversacionActual.id}</p>
              </div>

              {conversacionActual.estado !== 'cerrado' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCerrarChat(conversacionActual.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cerrar chat
                </Button>
              )}
            </div>

            {conversacionActual.valoracion && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Valoración: {conversacionActual.valoracion} ⭐
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {conversacionActual.mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.rol === 'cliente' ? 'flex-row-reverse' : ''}`}
              >
                {msg.rol !== 'cliente' && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                      {msg.autor.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex-1 max-w-[80%] ${msg.rol === 'cliente' ? 'text-right' : ''}`}>
                  {msg.rol !== 'cliente' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{msg.autor}</span>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {msg.rol === 'gerente' ? 'Gerente' : 'Colaborador'}
                      </Badge>
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-lg ${
                      msg.rol === 'cliente'
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
                  placeholder="Escribe tu mensaje..."
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

  return (
    <Tabs defaultValue="faqs" className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10">
        <TabsTrigger value="faqs" className="text-xs sm:text-sm">
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
          FAQs
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat y Soporte
        </TabsTrigger>
      </TabsList>

      <TabsContent value="faqs" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar en preguntas frecuentes..."
            value={busquedaFAQ}
            onChange={(e) => setBusquedaFAQ(e.target.value)}
            className="pl-10"
          />
        </div>

        {categoriasFAQ.map(categoria => {
          const faqsCategoria = faqsFiltradas.filter(f => f.categoria === categoria);
          if (faqsCategoria.length === 0) return null;

          return (
            <div key={categoria}>
              <h3 className="text-lg font-medium text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {categoria}
              </h3>
              <div className="space-y-2">
                {faqsCategoria.map(faq => (
                  <Collapsible
                    key={faq.id}
                    open={faqAbierta === faq.id}
                    onOpenChange={(open) => setFaqAbierta(open ? faq.id : null)}
                  >
                    <Card className="hover:shadow-sm transition-shadow">
                      <CollapsibleTrigger className="w-full">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3 flex-1 text-left">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                <HelpCircle className="w-4 h-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{faq.pregunta}</h4>
                              </div>
                            </div>
                            {faqAbierta === faq.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="px-4 pb-4 pt-0">
                          <div className="pl-11">
                            <p className="text-sm text-gray-600">{faq.respuesta}</p>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </div>
          );
        })}

        {faqsFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-sm text-gray-500 mb-4">
                Intenta con otros términos de búsqueda
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-teal-50 border-teal-200">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-gray-700 mb-3">
              ¿No encuentras la respuesta que buscas?
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
              const tabsList = document.querySelector('[role="tablist"]');
              const chatTab = tabsList?.querySelector('[value="chat"]') as HTMLElement;
              chatTab?.click();
            }}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Contactar con Soporte
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="chat" className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              💬 Mis Conversaciones
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {conversaciones.length} {conversaciones.length === 1 ? 'conversación' : 'conversaciones'} · {conversaciones.filter(c => c.mensajesNoLeidos > 0).length} sin leer
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtroTipo === 'todas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroTipo('todas')}
                  className="h-8 text-xs"
                >
                  Todas ({conversaciones.length})
                </Button>
                {categoriasActivas.slice(0, 3).map((categoria) => (
                  <Button
                    key={categoria.id}
                    variant={filtroTipo === categoria.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroTipo(categoria.id)}
                    className="h-8 text-xs"
                  >
                    {getTipoIcon(categoria.id)}
                    <span className="ml-1">{categoria.nombre}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Conversaciones</CardTitle>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 h-8 text-xs"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Send className="w-3 h-3 mr-1" />
                Nueva
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {conversacionesFiltradas.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No hay conversaciones</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Inicia una nueva conversación con soporte
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {conversacionesFiltradas.map((conv) => {
                  const ultimoMensaje = conv.mensajes[conv.mensajes.length - 1];
                  
                  return (
                    <div
                      key={conv.id}
                      className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                      onClick={() => setConversacionSeleccionada(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${getTipoBadgeColor(conv.tipo).replace('text-', 'bg-').replace('-700', '-200')}`}>
                            <div className="scale-125">
                              {getTipoIcon(conv.tipo)}
                            </div>
                          </div>
                          {conv.estado === 'en-curso' && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                          {conv.mensajesNoLeidos > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                              {conv.mensajesNoLeidos}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                              {getTipoLabel(conv.tipo)}
                            </h4>
                            <span className="text-xs text-gray-500 shrink-0">
                              {new Date(conv.fechaUltimoMensaje).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-gray-700 truncate mb-1">
                            {conv.asunto}
                          </p>

                          <p className="text-sm text-gray-600 truncate">
                            {ultimoMensaje.rol === 'cliente' ? 'Tú: ' : `${ultimoMensaje.autor}: `}
                            {ultimoMensaje.contenido}
                          </p>

                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {getEstadoBadge(conv.estado)}
                            {conv.valoracion && (
                              <div className="flex items-center gap-0.5">
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
                        </div>

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

        <Card className="border-teal-200 bg-teal-50">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4" />
              Nueva Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
            <Select value={tipoConsulta} onValueChange={(v: any) => setTipoConsulta(v)}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriasActivas.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    <div className="flex items-center gap-2">
                      {getTipoIcon(categoria.id)}
                      {categoria.nombre}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Asunto de tu consulta..."
              value={asuntoNuevo}
              onChange={(e) => setAsuntoNuevo(e.target.value)}
              className="bg-white"
            />

            <Textarea
              placeholder="Describe tu consulta..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              className="bg-white"
            />

            <Button
              onClick={handleCrearConversacion}
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={!asuntoNuevo.trim() || !mensaje.trim() || enviando}
            >
              {enviando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {enviando ? 'Enviando...' : 'Enviar Consulta'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={dialogValoracion} onOpenChange={setDialogValoracion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Valora la atención recibida
            </DialogTitle>
            <DialogDescription>
              ¿Cómo calificarías la atención que recibiste?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setValoracionSeleccionada(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= valoracionSeleccionada
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {valoracionSeleccionada > 0 && (
              <p className="text-center text-sm text-gray-600">
                Has seleccionado {valoracionSeleccionada} {valoracionSeleccionada === 1 ? 'estrella' : 'estrellas'}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogValoracion(false);
                setValoracionSeleccionada(0);
                setConversacionACerrar(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviarValoracion}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={valoracionSeleccionada === 0}
            >
              Enviar valoración
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
