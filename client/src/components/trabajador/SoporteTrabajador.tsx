import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  Send,
  Wrench,
  Users,
  Smartphone,
  Package,
  MessageCircle,
  User
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Chat {
  id: string;
  tipo: string;
  asunto: string;
  descripcion: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha: string;
  ultimaActualizacion: string;
  respuestas: number;
}

interface FAQ {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

export function SoporteTrabajador() {
  const [nuevoChatOpen, setNuevoChatOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  // Form states
  const [tipoIncidencia, setTipoIncidencia] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [adjuntos, setAdjuntos] = useState<File[]>([]);

  const chats: Chat[] = [
    {
      id: 'CHT-001',
      tipo: 'Incidencia del taller',
      asunto: 'Elevador 2 no funciona correctamente',
      descripcion: 'El elevador de la bahía 2 hace ruido y no sube completamente',
      estado: 'en_proceso',
      prioridad: 'alta',
      fecha: '2025-11-10T09:30:00',
      ultimaActualizacion: '2025-11-11T14:20:00',
      respuestas: 2
    },
    {
      id: 'CHT-002',
      tipo: 'Problema en la app',
      asunto: 'No puedo registrar fichaje desde móvil',
      descripcion: 'Al intentar fichar desde la app móvil me da error',
      estado: 'resuelto',
      prioridad: 'media',
      fecha: '2025-11-09T08:15:00',
      ultimaActualizacion: '2025-11-09T16:45:00',
      respuestas: 3
    },
    {
      id: 'CHT-003',
      tipo: 'Incidencia con un cliente',
      asunto: 'Cliente insatisfecho con reparación',
      descripcion: 'El cliente Juan Pérez (OT-2025-001) no está satisfecho con el trabajo',
      estado: 'cerrado',
      prioridad: 'alta',
      fecha: '2025-11-08T11:00:00',
      ultimaActualizacion: '2025-11-08T18:30:00',
      respuestas: 5
    }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      categoria: 'Fichaje',
      pregunta: '¿Cómo registro mi fichaje de entrada y salida?',
      respuesta: 'Puedes fichar desde la sección "Fichaje" en el menú lateral, o usando el botón rápido "Fichar ahora" que aparece arriba en el menú. También puedes fichar desde la app móvil.'
    },
    {
      id: '2',
      categoria: 'Tareas',
      pregunta: '¿Cómo actualizo el estado de una tarea?',
      respuesta: 'Ve a la sección "Tareas", selecciona la tarea que quieres actualizar, y haz clic en el botón de acción correspondiente (Iniciar, Pausar, Completar). El estado se actualizará automáticamente.'
    },
    {
      id: '3',
      categoria: 'Material',
      pregunta: '¿Cómo registro el consumo de material en una OT?',
      respuesta: 'En la sección "Material", busca el material que necesitas, haz clic en el menú de tres puntos y selecciona "Registrar consumo". Luego selecciona la OT correspondiente y la cantidad utilizada.'
    },
    {
      id: '4',
      categoria: 'Material',
      pregunta: '¿Qué hago si un material está agotado?',
      respuesta: 'Puedes solicitar el material al gerente usando el botón "Solicitar" en el menú del material. El gerente recibirá una notificación y podrá aprobar el pedido.'
    },
    {
      id: '5',
      categoria: 'Formación',
      pregunta: '¿Cómo accedo a los cursos de formación?',
      respuesta: 'Ve a la sección "Formación" en el menú lateral. Allí verás todos los cursos disponibles, los que tienes en progreso y tus certificaciones. Puedes iniciar un nuevo curso o continuar con los que ya empezaste.'
    },
    {
      id: '6',
      categoria: 'General',
      pregunta: '¿Cómo cambio mi contraseña?',
      respuesta: 'Ve a "Configuración" > "Seguridad" > "Cambiar contraseña". Introduce tu contraseña actual y la nueva contraseña dos veces para confirmar.'
    },
    {
      id: '7',
      categoria: 'Agenda',
      pregunta: '¿Cómo veo las OTs asignadas a mí?',
      respuesta: 'En la sección "Agenda" puedes ver todas las OTs asignadas a ti organizadas por fecha. También puedes filtrar por estado (pendiente, en proceso, completada).'
    },
    {
      id: '8',
      categoria: 'Chat',
      pregunta: '¿Cómo contacto con el gerente o con otros compañeros?',
      respuesta: 'Usa la sección "Chat" del menú lateral. Puedes enviar mensajes directos a cualquier compañero o al gerente. También hay un canal de equipo para comunicaciones generales.'
    }
  ];

  const tiposIncidencia = [
    { value: 'falta_producto', label: 'Falta de producto', icon: Package },
    { value: 'rotura_maquinaria', label: 'Rotura de maquinaria', icon: Wrench },
    { value: 'accidente_laboral', label: 'Accidente laboral', icon: AlertCircle },
    { value: 'incidencia_cliente', label: 'Incidencia con cliente', icon: Users },
    { value: 'problema_app', label: 'Fallo en la app', icon: Smartphone },
    { value: 'rrhh', label: 'Recursos Humanos', icon: User },
    { value: 'otro', label: 'Otro', icon: MessageSquare }
  ];

  const handleCrearTicket = () => {
    if (!tipoIncidencia || !asunto || !descripcion) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const tipoLabel = tiposIncidencia.find(t => t.value === tipoIncidencia)?.label || tipoIncidencia;

    toast.success(`Ticket creado: ${asunto}`);
    console.log('[NUEVO TICKET]', {
      tipo: tipoLabel,
      asunto,
      descripcion,
      prioridad,
      adjuntos: adjuntos.length
    });

    // Reset form
    setTipoIncidencia('');
    setAsunto('');
    setDescripcion('');
    setPrioridad('media');
    setAdjuntos([]);
    setNuevoChatOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdjuntos(Array.from(e.target.files));
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Abierto</Badge>;
      case 'en_proceso':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">En proceso</Badge>;
      case 'resuelto':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Resuelto</Badge>;
      case 'cerrado':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Cerrado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return <Badge className="bg-red-600 text-white">Urgente</Badge>;
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Alta</Badge>;
      case 'media':
        return <Badge variant="outline">Media</Badge>;
      case 'baja':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">Baja</Badge>;
      default:
        return <Badge variant="outline">Media</Badge>;
    }
  };

  const faqsFiltrados = faqs.filter(faq =>
    faq.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
    faq.respuesta.toLowerCase().includes(busqueda.toLowerCase()) ||
    faq.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Chat y FAQs
          </h1>
          <p className="text-gray-600 text-sm">
            Centro de ayuda, chats y preguntas frecuentes
          </p>
        </div>

        <Button
          className="bg-teal-600 hover:bg-teal-700"
          onClick={() => setNuevoChatOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Chat
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="chats">
            <MessageSquare className="w-4 h-4 mr-2" />
            Mis Chats
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="w-4 h-4 mr-2" />
            Preguntas Frecuentes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Mis Chats */}
        <TabsContent value="chats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Mis Chats de Soporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chats.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No tienes chats creados</p>
                  <p className="text-sm mt-2">Crea un chat si necesitas ayuda</p>
                  <Button
                    className="mt-4 bg-teal-600 hover:bg-teal-700"
                    onClick={() => setNuevoChatOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex flex-col md:flex-row md:items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <MessageSquare className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm text-gray-600">{chat.id}</span>
                              {getEstadoBadge(chat.estado)}
                              {getPrioridadBadge(chat.prioridad)}
                            </div>
                            <p className="text-gray-900 mb-1">{chat.asunto}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{chat.descripcion}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {chat.tipo}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(chat.fecha).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              {chat.respuestas > 0 && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {chat.respuestas} respuesta{chat.respuestas !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: FAQs */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Preguntas Frecuentes
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar en preguntas frecuentes..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqsFiltrados.map((faq, index) => (
                  <AccordionItem key={faq.id} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{faq.pregunta}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {faq.categoria}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 pr-4 text-gray-700">
                        {faq.respuesta}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {faqsFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No se encontraron resultados</p>
                  <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 mb-1">¿No encuentras lo que buscas?</p>
                    <p className="text-sm text-blue-700 mb-3">
                      Si no encuentras respuesta a tu pregunta, crea un ticket de soporte y te ayudaremos lo antes posible.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 hover:bg-blue-100"
                      onClick={() => setNuevoChatOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Ticket
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Nuevo Ticket */}
      <Dialog open={nuevoChatOpen} onOpenChange={setNuevoChatOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Crear Nuevo Ticket de Soporte
            </DialogTitle>
            <DialogDescription>
              Describe tu problema o consulta y te ayudaremos lo antes posible
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tipo de Incidencia */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de incidencia *</Label>
              <Select value={tipoIncidencia} onValueChange={setTipoIncidencia}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecciona el tipo de incidencia" />
                </SelectTrigger>
                <SelectContent>
                  {tiposIncidencia.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{tipo.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad *</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger id="prioridad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                Urgente: Problema crítico que impide trabajar
              </p>
            </div>

            {/* Asunto */}
            <div className="space-y-2">
              <Label htmlFor="asunto">Asunto *</Label>
              <Input
                id="asunto"
                placeholder="Resumen breve del problema"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el problema con el mayor detalle posible..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-gray-600">
                Incluye cualquier información relevante: pasos para reproducir el problema, mensajes de error, etc.
              </p>
            </div>

            {/* Adjuntos */}
            <div className="space-y-2">
              <Label htmlFor="adjuntos">Adjuntar archivos (opcional)</Label>
              <Input
                id="adjuntos"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
              <p className="text-xs text-gray-600">
                Puedes adjuntar capturas de pantalla o documentos (máx. 5MB cada uno)
              </p>
              {adjuntos.length > 0 && (
                <div className="text-sm text-gray-700">
                  {adjuntos.length} archivo(s) seleccionado(s)
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setNuevoChatOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleCrearTicket}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}