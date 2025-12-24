import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { MessageSquare, Mail, HelpCircle, Search, Book, Send, X, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface MensajeChat {
  id: string;
  texto: string;
  esPropio: boolean;
  hora: string;
}

export function AyudaSoporte() {
  const [busqueda, setBusqueda] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [chatAbierto, setChatAbierto] = useState(false);
  const [chatMinimizado, setChatMinimizado] = useState(false);
  const [mensajesChat, setMensajesChat] = useState<MensajeChat[]>([]);
  const [mensajeChatActual, setMensajeChatActual] = useState('');
  const [chatDestinatario, setChatDestinatario] = useState('');

  const enviarMensaje = () => {
    if (!destinatario || !asunto || !mensajeTexto) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Iniciar chat
    setChatDestinatario(destinatario);
    setMensajesChat([
      {
        id: '1',
        texto: mensajeTexto,
        esPropio: true,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatAbierto(true);
    
    // Limpiar formulario
    setDestinatario('');
    setAsunto('');
    setMensajeTexto('');
    
    toast.success('Mensaje enviado. Chat abierto con ' + destinatario);
  };

  const enviarMensajeChat = () => {
    if (!mensajeChatActual.trim()) return;

    const nuevoMensaje: MensajeChat = {
      id: String(mensajesChat.length + 1),
      texto: mensajeChatActual,
      esPropio: true,
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajesChat([...mensajesChat, nuevoMensaje]);
    setMensajeChatActual('');

    // Simular respuesta automática
    setTimeout(() => {
      const respuestaAuto: MensajeChat = {
        id: String(mensajesChat.length + 2),
        texto: 'Gracias por contactarnos. Un agente de soporte te responderá en breve.',
        esPropio: false,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setMensajesChat((prev) => [...prev, respuestaAuto]);
    }, 1000);
  };

  const cerrarChat = () => {
    setChatAbierto(false);
    setMensajesChat([]);
    setChatDestinatario('');
    toast.success('Chat cerrado');
  };

  const preguntasFrecuentes = [
    {
      pregunta: '¿Cómo realizo un pedido?',
      respuesta: 'Para realizar un pedido, navega a la sección "Tienda y Productos", selecciona los productos que desees, agrégalos al carrito y procede al pago. Recibirás una confirmación inmediata.',
    },
    {
      pregunta: '¿Cuáles son los métodos de pago aceptados?',
      respuesta: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias y pago en efectivo contra entrega.',
    },
    {
      pregunta: '¿Cómo puedo cancelar un pedido?',
      respuesta: 'Puedes cancelar un pedido desde la sección "Mis Pedidos" siempre que aún no haya sido preparado. Una vez que el restaurante comienza a preparar tu pedido, ya no es posible cancelarlo.',
    },
    {
      pregunta: '¿Puedo modificar mi pedido después de realizarlo?',
      respuesta: 'Las modificaciones solo son posibles antes de que el restaurante confirme tu pedido. Contacta inmediatamente al restaurante a través de la sección "Comunicación".',
    },
    {
      pregunta: '¿Cuánto tiempo tarda la entrega?',
      respuesta: 'El tiempo de entrega varía según el restaurante y tu ubicación, pero generalmente es entre 30-45 minutos. Puedes ver el tiempo estimado en cada pedido.',
    },
    {
      pregunta: '¿Cómo solicito una factura?',
      respuesta: 'Todas tus compras generan automáticamente una factura que puedes descargar desde la sección "Facturación". También puedes solicitar el XML para tus declaraciones fiscales.',
    },
  ];

  const preguntasFiltradas = preguntasFrecuentes.filter((item) =>
    item.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.respuesta.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-gray-900">Chat en Vivo</p>
                <p className="text-gray-600 text-sm">Disponible 24/7</p>
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Iniciar Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-900">Email</p>
                <p className="text-gray-600 text-sm">Respuesta en 24h</p>
              </div>
              <Button variant="outline" className="w-full">
                soporte@fooddigital.com
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario para Enviar Mensaje */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensaje a Soporte</CardTitle>
          <CardDescription>Describe tu problema o pregunta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-gray-700 text-sm">Departamento:</label>
              <Select value={destinatario} onValueChange={setDestinatario}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soporte Técnico">Soporte Técnico</SelectItem>
                  <SelectItem value="Atención al Cliente">Atención al Cliente</SelectItem>
                  <SelectItem value="Facturación">Facturación</SelectItem>
                  <SelectItem value="Sugerencias">Sugerencias</SelectItem>
                  <SelectItem value="Quejas">Quejas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-gray-700 text-sm">Asunto:</label>
              <Input 
                placeholder="Escribe el asunto" 
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-gray-700 text-sm">Mensaje:</label>
            <Textarea 
              placeholder="Describe tu problema o pregunta..." 
              rows={4}
              value={mensajeTexto}
              onChange={(e) => setMensajeTexto(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={enviarMensaje}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensaje
          </Button>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
          <CardDescription>Encuentra respuestas rápidas a las dudas más comunes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar en preguntas frecuentes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion type="single" collapsible className="w-full">
            {preguntasFiltradas.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2 text-left">
                    <HelpCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    {item.pregunta}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 pl-6">{item.respuesta}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {preguntasFiltradas.length === 0 && (
            <div className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron preguntas relacionadas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Adicionales</CardTitle>
          <CardDescription>Guías y tutoriales para aprovechar al máximo FoodDigital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Book className="w-8 h-8 text-teal-600" />
              <div>
                <p className="text-gray-900">Guía de Inicio</p>
                <p className="text-gray-600 text-sm">Primeros pasos en FoodDigital</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Book className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-gray-900">Políticas de Privacidad</p>
                <p className="text-gray-600 text-sm">Cómo protegemos tus datos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Book className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-gray-900">Términos y Condiciones</p>
                <p className="text-gray-600 text-sm">Conoce las reglas del servicio</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Book className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-gray-900">Video Tutoriales</p>
                <p className="text-gray-600 text-sm">Aprende de forma visual</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat flotante */}
      {chatAbierto && (
        <div 
          className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 ${
            chatMinimizado ? 'h-14' : 'h-[500px]'
          } transition-all duration-300`}
        >
          {/* Chat Header */}
          <div className="bg-teal-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <div>
                <p className="font-medium">Chat con {chatDestinatario}</p>
                <p className="text-xs text-teal-100">En línea</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatMinimizado(!chatMinimizado)}
                className="hover:bg-teal-700 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={cerrarChat}
                className="hover:bg-teal-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!chatMinimizado && (
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto h-[380px]">
                {mensajesChat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.esPropio ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.esPropio
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.texto}</p>
                      <span className={`text-xs ${msg.esPropio ? 'text-teal-100' : 'text-gray-500'} mt-1 block`}>
                        {msg.hora}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={mensajeChatActual}
                    onChange={(e) => setMensajeChatActual(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensajeChat()}
                  />
                  <Button 
                    onClick={enviarMensajeChat}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
