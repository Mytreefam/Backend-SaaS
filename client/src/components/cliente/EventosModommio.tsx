/**
 * 🎉 EVENTOS MODOMMIO
 * 
 * Página informativa sobre servicios de catering y eventos
 * con formulario de generación de leads para presupuestos
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  PartyPopper, 
  Users, 
  Calendar, 
  Clock, 
  UtensilsCrossed,
  CheckCircle,
  Phone,
  Mail,
  User,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EventosModommioProps {
  onOpenCesta?: () => void;
}

export function EventosModommio({ onOpenCesta }: EventosModommioProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipoEvento: '',
    numeroPersonas: '',
    fecha: '',
    mensaje: ''
  });

  const [enviando, setEnviando] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || !formData.telefono || !formData.email) {
      toast.error('Por favor, completa los campos obligatorios');
      return;
    }

    setEnviando(true);

    // Simular envío (en producción, esto se conectaría con Supabase o backend)
    setTimeout(() => {
      // Guardar en localStorage como simulación
      const leads = JSON.parse(localStorage.getItem('eventos_leads') || '[]');
      const nuevoLead = {
        id: Date.now().toString(),
        ...formData,
        fechaCreacion: new Date().toISOString(),
        estado: 'pendiente'
      };
      
      leads.push(nuevoLead);
      localStorage.setItem('eventos_leads', JSON.stringify(leads));

      toast.success('¡Solicitud enviada!', {
        description: 'Nos pondremos en contacto contigo muy pronto para enviarte un presupuesto personalizado'
      });

      // Resetear formulario
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        tipoEvento: '',
        numeroPersonas: '',
        fecha: '',
        mensaje: ''
      });
      setEnviando(false);
    }, 1500);
  };

  const serviciosEventos = [
    {
      titulo: 'Eventos Corporativos',
      descripcion: 'Reuniones, conferencias, team building',
      icono: Users,
      color: '#ED1C24'
    },
    {
      titulo: 'Celebraciones',
      descripcion: 'Cumpleaños, aniversarios, fiestas privadas',
      icono: PartyPopper,
      color: '#ED1C24'
    },
    {
      titulo: 'Catering',
      descripcion: 'Servicio completo de comida y bebida',
      icono: UtensilsCrossed,
      color: '#ED1C24'
    }
  ];

  const ventajas = [
    'Menús personalizados adaptados a tu evento',
    'Pizzas artesanales elaboradas al momento',
    'Servicio de camareros y montaje',
    'Opciones vegetarianas y sin gluten',
    'Precios competitivos y transparentes',
    'Más de 10 años de experiencia'
  ];

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Hero Section */}
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black z-10" />
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80"
          alt="Eventos Modommio"
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <div className="mb-4">
            <PartyPopper className="w-16 h-16 sm:w-20 sm:h-20 text-[#ED1C24] mx-auto drop-shadow-[0_0_15px_rgba(237,28,36,0.6)]" 
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          </div>
          
          <h1 className="text-4xl sm:text-6xl mb-4 text-white"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              textShadow: '0 0 30px rgba(237, 28, 36, 0.8), 0 4px 8px rgba(0,0,0,0.8)',
              letterSpacing: '0.05em'
            }}
          >
            EVENTOS MODOMMIO
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 300,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            Haz de tu evento algo inolvidable con nuestras pizzas artesanales
          </p>
        </div>
      </div>

      {/* Servicios */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl text-white mb-3"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700
            }}
          >
            Nuestros Servicios
          </h2>
          <p className="text-gray-400 text-sm sm:text-base"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Organizamos todo tipo de eventos con la mejor comida
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {serviciosEventos.map((servicio, index) => {
            const Icono = servicio.icono;
            return (
              <Card key={index} className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#ED1C24]/30 hover:border-[#ED1C24] transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ED1C24]/10 flex items-center justify-center border-2 border-[#ED1C24]/50">
                    <Icono className="w-8 h-8 text-[#ED1C24]" />
                  </div>
                  <h3 className="text-xl text-white mb-2"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600
                    }}
                  >
                    {servicio.titulo}
                  </h3>
                  <p className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {servicio.descripcion}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ventajas */}
        <Card className="bg-gradient-to-br from-[#ED1C24]/10 to-black border-2 border-[#ED1C24]/30 mb-12">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-[#ED1C24]" />
              <h3 className="text-2xl text-white"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700
                }}
              >
                ¿Por qué elegirnos?
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ventajas.map((ventaja, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ED1C24] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm sm:text-base"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {ventaja}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulario de Lead */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#ED1C24]">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl text-white mb-3"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700
                }}
              >
                Solicita tu Presupuesto
              </h2>
              <p className="text-gray-400 text-sm sm:text-base"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Completa el formulario y nos pondremos en contacto contigo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-white mb-2 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <User className="w-4 h-4 text-[#ED1C24]" />
                    Nombre completo *
                  </label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    required
                    className="bg-black/50 border-gray-700 text-white focus:border-[#ED1C24]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white mb-2 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Phone className="w-4 h-4 text-[#ED1C24]" />
                    Teléfono *
                  </label>
                  <Input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Ej: +34 666 777 888"
                    required
                    className="bg-black/50 border-gray-700 text-white focus:border-[#ED1C24]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-white mb-2 text-sm"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <Mail className="w-4 h-4 text-[#ED1C24]" />
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: juan@email.com"
                  required
                  className="bg-black/50 border-gray-700 text-white focus:border-[#ED1C24]"
                />
              </div>

              {/* Detalles del evento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-white mb-2 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <PartyPopper className="w-4 h-4 text-[#ED1C24]" />
                    Tipo de evento
                  </label>
                  <Input
                    value={formData.tipoEvento}
                    onChange={(e) => setFormData({ ...formData, tipoEvento: e.target.value })}
                    placeholder="Ej: Cumpleaños, Boda, Corporativo"
                    className="bg-black/50 border-gray-700 text-white focus:border-[#ED1C24]"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white mb-2 text-sm"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Users className="w-4 h-4 text-[#ED1C24]" />
                    Número de personas
                  </label>
                  <Input
                    type="number"
                    value={formData.numeroPersonas}
                    onChange={(e) => setFormData({ ...formData, numeroPersonas: e.target.value })}
                    placeholder="Ej: 50"
                    className="bg-black/50 border-gray-700 text-white focus:border-[#ED1C24]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-white mb-2 text-sm"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <Calendar className="w-4 h-4 text-[#ED1C24]" />
                  Fecha aproximada del evento
                </label>
                <Input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="bg-black/50 border-gray-700 text-white focus:border-[#ED1C24]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white mb-2 text-sm"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <MessageSquare className="w-4 h-4 text-[#ED1C24]" />
                  Mensaje adicional
                </label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="Cuéntanos más sobre tu evento..."
                  rows={4}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:border-[#ED1C24] focus:outline-none focus:ring-1 focus:ring-[#ED1C24]"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>

              <Button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#ED1C24] hover:bg-[#C4161F] text-white h-12 sm:h-14 transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(237,28,36,0.5)]"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  letterSpacing: '0.05em'
                }}
              >
                {enviando ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    ENVIANDO...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    SOLICITAR PRESUPUESTO
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                * Campos obligatorios. Tus datos serán tratados de forma confidencial
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Información de contacto directo */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            ¿Prefieres llamarnos directamente?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="tel:+34666777888" 
              className="flex items-center gap-2 text-[#ED1C24] hover:text-white transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <Phone className="w-5 h-5" />
              +34 666 777 888
            </a>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <a 
              href="mailto:eventos@modommio.com" 
              className="flex items-center gap-2 text-[#ED1C24] hover:text-white transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <Mail className="w-5 h-5" />
              eventos@modommio.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
