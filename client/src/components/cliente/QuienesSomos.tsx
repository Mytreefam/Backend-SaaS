import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Store, 
  MapPin, 
  Clock, 
  Phone,
  Mail,
  Award,
  Users,
  Heart,
  X,
  MessageSquare,
  Gift,
  Flame
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function QuienesSomos() {
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo] = useState('quienes-somos');
  const [imagenesLoaded, setImagenesLoaded] = useState({ tienda: false, productos: false });

  const imagenTienda = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop';
  const imagenProductos = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop';

  const tiendas = [
    {
      id: 1,
      ciudad: 'Tiana',
      tiendas: [
        { nombre: 'Hoy Pecamos Tiana', direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona', telefono: '+34 933 123 456' }
      ]
    },
    {
      id: 2,
      ciudad: 'Badalona',
      tiendas: [
        { nombre: 'Hoy Pecamos Badalona', direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona', telefono: '+34 933 123 465' }
      ]
    }
  ];

  const valores = [
    {
      icono: Flame,
      titulo: 'Horno de Leña Tradicional',
      descripcion: 'Cada pizza se cocina en nuestro horno de leña a más de 400°C, logrando esa corteza crujiente y sabor auténtico italiano'
    },
    {
      icono: Award,
      titulo: 'Ingredientes Premium',
      descripcion: 'Masa madre natural, mozzarella di bufala DOP, tomate San Marzano y aceite de oliva virgen extra importados de Italia'
    },
    {
      icono: Heart,
      titulo: 'Pasión Artesanal',
      descripcion: 'Nuestros pizzaiolos formados en Nápoles elaboran cada pizza con técnicas tradicionales y dedicación absoluta'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          ¿Quiénes somos?
        </h1>
        <p className="text-gray-600">
          Descubre la historia de <span style={{ color: '#ED1C24', fontWeight: 600 }}>Hoy Pecamos</span>, tu pizzería artesanal de confianza
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filtroActivo === 'quienes-somos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('quienes-somos')}
          className={filtroActivo === 'quienes-somos' ? 'bg-[#ED1C24] hover:bg-[#c91820]' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          ¿Quiénes somos?
        </Button>
        <Button
          variant={filtroActivo === 'empresas-colaboradoras' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('empresas-colaboradoras')}
          className={filtroActivo === 'empresas-colaboradoras' ? 'bg-[#ED1C24] hover:bg-[#c91820]' : ''}
        >
          <Store className="w-4 h-4 mr-2" />
          Empresas Colaboradoras
        </Button>
      </div>

      {/* Contenido según filtro activo */}
      {filtroActivo === 'quienes-somos' && (
        <>
          {/* Historia */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Nuestra Historia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong style={{ color: '#ED1C24' }}>Hoy Pecamos</strong> nació en 2008 con una filosofía clara: 
                traer la auténtica pizza napolitana a Barcelona, pero con un toque de irreverencia que nos hace únicos. 
                Nuestro nombre lo dice todo: <em>"Hoy pecamos porque mañana empezamos la dieta"</em>.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Lo que comenzó como un pequeño local en Badalona se convirtió rápidamente en un fenómeno gracias a 
                nuestro compromiso inquebrantable: <strong>horno de leña tradicional, masa madre fermentada 48 horas, 
                y ingredientes importados directamente desde Italia</strong>. Hoy contamos con <strong>2 locales</strong> 
                estratégicamente ubicados en <strong>Tiana y Badalona</strong>.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Nuestro horno de leña, el corazón de cada local, alcanza temperaturas de más de 400°C, cocinando 
                cada pizza en solo 90 segundos. Esto crea esa corteza crujiente por fuera y esponjosa por dentro 
                que caracteriza a la verdadera pizza napolitana. Cada pizzaiolo ha sido formado en Nápoles y 
                trabaja con recetas que respetan la tradición centenaria.
              </p>

              <p className="text-gray-700 leading-relaxed">
                Más allá de la técnica, en <strong style={{ color: '#ED1C24' }}>Hoy Pecamos</strong> creemos 
                que comer pizza es un acto de placer y rebeldía saludable. Por eso nuestro lema: "La vida es corta, 
                come buena pizza". Hoy somos el refugio de miles de amantes de la pizza auténtica que buscan 
                calidad sin compromisos y un ambiente relajado donde disfrutar del verdadero sabor italiano.
              </p>

              {/* Imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div 
                  className="h-64 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#ED1C24] transition-all bg-cover bg-center hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${imagenTienda})` }}
                  onClick={() => setImagenAmpliada(imagenTienda)}
                />

                <div 
                  className="h-64 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#ED1C24] transition-all bg-cover bg-center hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${imagenProductos})` }}
                  onClick={() => setImagenAmpliada(imagenProductos)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {valores.map((valor, index) => {
              const Icon = valor.icono;
              return (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <Icon className="w-8 h-8" style={{ color: '#ED1C24' }} />
                      </div>
                      <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {valor.titulo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {valor.descripcion}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Nuestras Tiendas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Nuestros 2 Locales
                </CardTitle>
                <Badge className="bg-[#ED1C24]">
                  <Store className="w-3 h-3 mr-1" />
                  2 ubicaciones
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tiendas.map((grupo) => (
                  <div key={grupo.id}>
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <MapPin className="w-5 h-5" style={{ color: '#ED1C24' }} />
                      {grupo.ciudad}
                      <Badge variant="outline" className="ml-2">
                        {grupo.tiendas.length} {grupo.tiendas.length === 1 ? 'local' : 'locales'}
                      </Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {grupo.tiendas.map((tienda, index) => (
                        <div 
                          key={index}
                          className="p-4 border rounded-lg hover:border-[#ED1C24] hover:shadow-md transition-all bg-white"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">{tienda.nombre}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{tienda.direccion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a 
                                href={`tel:${tienda.telefono}`}
                                className="hover:underline"
                                style={{ color: '#ED1C24' }}
                              >
                                {tienda.telefono}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>Mar-Dom: 12:00 - 23:00 | Lun: Cerrado</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ¿Tienes alguna pregunta?
                </h3>
                <p className="text-gray-700">
                  Estamos aquí para ayudarte. Contáctanos a través de cualquiera de nuestros locales 
                  o mediante nuestro servicio de atención al cliente.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Button className="bg-[#ED1C24] hover:bg-[#c91820]">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Abrir Chat
                  </Button>
                  <Button variant="outline" className="border-[#ED1C24] hover:bg-red-50" style={{ color: '#ED1C24' }}>
                    <Gift className="w-4 h-4 mr-2" />
                    Ofertas para empresas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {filtroActivo === 'empresas-colaboradoras' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Nuestras Empresas Colaboradoras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                En <strong style={{ color: '#ED1C24' }}>Hoy Pecamos</strong> creemos en la colaboración con empresas que comparten 
                nuestros valores de calidad, autenticidad y pasión por el producto. Estas alianzas nos permiten ofrecerte 
                la verdadera experiencia italiana sin compromisos.
              </p>

              {/* Lista de empresas colaboradoras */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border rounded-lg hover:border-[#ED1C24] transition-all bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="w-8 h-8" style={{ color: '#ED1C24' }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Molino Caputo (Nápoles)
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Importamos directamente la harina "00" Caputo, la preferida de los pizzaiolos napolitanos. 
                        Su textura y calidad son insuperables para nuestra masa madre.
                      </p>
                      <Badge className="bg-red-100" style={{ color: '#ED1C24' }}>Colaborador desde 2008</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg hover:border-[#ED1C24] transition-all bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Latteria Sorrentina
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Nuestra mozzarella di bufala DOP llega fresca cada semana desde la región de Campania. 
                        Sabor auténtico garantizado.
                      </p>
                      <Badge className="bg-orange-100 text-orange-700">Colaborador desde 2010</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg hover:border-[#ED1C24] transition-all bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Pomodori San Marzano DOP
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Los únicos tomates que usamos para nuestra salsa: San Marzano cultivados en las laderas 
                        del Vesubio con certificación DOP.
                      </p>
                      <Badge className="bg-green-100 text-green-700">Colaborador desde 2008</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg hover:border-[#ED1C24] transition-all bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Oleificio Toscano
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Aceite de oliva virgen extra de primera prensada en frío. El toque final perfecto 
                        para cada pizza que sale de nuestro horno.
                      </p>
                      <Badge className="bg-purple-100 text-purple-700">Colaborador desde 2012</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg hover:border-[#ED1C24] transition-all bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Delivery Express BCN
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Servicio de reparto rápido que garantiza que tu pizza llegue caliente y crujiente 
                        como recién salida del horno.
                      </p>
                      <Badge className="bg-blue-100 text-blue-700">Colaborador desde 2015</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg hover:border-[#ED1C24] transition-all bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Catering Events Barcelona
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Llevamos nuestra pizza napolitana a eventos y celebraciones. Horno de leña móvil 
                        incluido para la experiencia completa.
                      </p>
                      <Badge className="bg-yellow-100 text-yellow-700">Colaborador desde 2018</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  ¿Quieres colaborar con nosotros?
                </h3>
                <p className="text-gray-700 mb-4">
                  Si tu empresa comparte nuestra pasión por la calidad, la autenticidad y el producto artesanal, 
                  nos encantaría conocerte. Estamos abiertos a colaboraciones que enriquezcan la experiencia 
                  de nuestros clientes.
                </p>
                <Button className="bg-[#ED1C24] hover:bg-[#c91820]">
                  <Mail className="w-4 h-4 mr-2" />
                  Contacta con nosotros
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal para imagen ampliada */}
      <Dialog open={imagenAmpliada !== null} onOpenChange={() => setImagenAmpliada(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 max-h-[90vh] overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Imagen ampliada</DialogTitle>
            <DialogDescription>Visualización ampliada de la imagen seleccionada</DialogDescription>
          </VisuallyHidden>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white rounded-full"
            onClick={() => setImagenAmpliada(null)}
          >
            <X className="w-5 h-5" />
          </Button>
          {imagenAmpliada && (
            <img 
              src={imagenAmpliada} 
              alt="Imagen ampliada" 
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}