import { motion } from 'motion/react';
import logoModomio from 'figma:asset/7a4d64c95291a62dd24c849142ae4540d5e2f45f.png';
import logoBlackburger from 'figma:asset/60b944da0efe66e24a868c7d759146e988e8fa41.png';

const LOGOS_MAP: Record<string, string> = {
  'MRC-001': logoModomio,
  'MRC-002': logoBlackburger,
};

interface PerfilClienteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType;
}

export function PerfilCliente({ isOpen, onOpenChange, user }: PerfilClienteProps) {
  const handleGuardar = () => {
    toast.success('Datos actualizados correctamente');
  };

  const facturas = [
    { id: 'FAC-2025-001', fecha: '01 Nov 2025', total: 145.00, pdf: '#' },
    { id: 'FAC-2025-002', fecha: '15 Oct 2025', total: 67.50, pdf: '#' },
    { id: 'FAC-2025-003', fecha: '05 Oct 2025', total: 234.00, pdf: '#' }
  ];

  const [isEmpresa, setIsEmpresa] = useState(false);
  const [marcaPreferida, setMarcaPreferida] = useState<string | null>(null);

  // Estados para Quienes Somos y FAQs
  const [quienesSomos, setQuienesSomos] = useState({
    titulo: 'Quiénes Somos',
    elementos: [
      {
        id: '1',
        tipo: 'texto' as const,
        titulo: 'Descripción',
        contenido: 'Somos una empresa comprometida con la excelencia y la calidad en nuestros productos y servicios.',
        orden: 0
      },
      {
        id: '2',
        tipo: 'texto' as const,
        titulo: 'Misión',
        contenido: 'Proporcionar productos y servicios de alta calidad que superen las expectativas de nuestros clientes.',
        orden: 1
      },
      {
        id: '3',
        tipo: 'texto' as const,
        titulo: 'Visión',
        contenido: 'Ser líderes en nuestro sector, reconocidos por nuestra innovación y compromiso con la excelencia.',
        orden: 2
      },
      {
        id: '4',
        tipo: 'texto' as const,
        titulo: 'Valores',
        contenido: 'Calidad, Integridad, Innovación, Compromiso con el cliente, Responsabilidad social',
        orden: 3
      }
    ]
  });

  const [faqsList, setFaqsList] = useState([
    {
      id: '1',
      categoria: 'Pedidos',
      pregunta: '¿Cómo puedo realizar un pedido?',
      respuesta: 'Puedes realizar un pedido directamente desde nuestra app móvil o desde la web.'
    },
    {
      id: '2',
      categoria: 'Pedidos',
      pregunta: '¿Cuál es el tiempo de entrega?',
      respuesta: 'El tiempo de entrega estimado es de 30-45 minutos dependiendo de tu ubicación.'
    },
    {
      id: '3',
      categoria: 'Pagos',
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta: 'Aceptamos pagos con tarjeta de crédito/débito, PayPal, Bizum y pago en efectivo.'
    }
  ]);

  const [faqExpandido, setFaqExpandido] = useState<string | null>(null);

  // Cargar datos de localStorage
  useEffect(() => {
    const storedQuienesSomos = localStorage.getItem('quienesSomos');
    if (storedQuienesSomos) {
      setQuienesSomos(JSON.parse(storedQuienesSomos));
    }

    const storedFaqs = localStorage.getItem('faqsList');
    if (storedFaqs) {
      setFaqsList(JSON.parse(storedFaqs));
    }

    // Cargar marca preferida
    const storedMarca = localStorage.getItem('cliente_marca_preferida');
    if (storedMarca) {
      setMarcaPreferida(storedMarca);
    }
  }, [isOpen]);

  const handleCambiarMarca = (marcaId: string) => {
    setMarcaPreferida(marcaId);
    localStorage.setItem('cliente_marca_preferida', marcaId);
    const marca = MARCAS_ARRAY.find(m => m.id === marcaId);
    toast.success(`Marca cambiada a ${marca?.nombre}. Los productos se actualizarán en tu próxima búsqueda.`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto scrollbar-hide p-4 sm:p-6">
        <SheetHeader className="mb-4 sm:mb-6">
          <SheetTitle className="text-base sm:text-lg md:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Perfil - Cuenta y Facturación
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Foto de perfil */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1755519024827-fd05075a7200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHByb2ZpbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMwNjI1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Foto de perfil"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-teal-100"
                  />
                  <button
                    onClick={() => toast.info('Funcionalidad de cambiar foto próximamente')}
                    className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all touch-manipulation active:scale-95"
                  >
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Carlos Martínez López
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">Cliente</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="min-h-[44px] text-xs sm:text-sm touch-manipulation active:scale-95"
                  onClick={() => toast.info('Funcionalidad de cambiar foto próximamente')}
                >
                  <Camera className="w-4 h-4 mr-2 shrink-0" />
                  Cambiar foto de perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Datos Personales */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="nombre" defaultValue="Carlos Martínez López" className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="email" type="email" defaultValue="carlos.martinez@email.com" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="telefono" placeholder="+34 600 123 456" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni">DNI/NIE</Label>
                  <Input id="dni" placeholder="12345678A" />
                </div>
              </div>

              {/* Separador visual */}
              <Separator className="my-6" />

              {/* Información de empresa */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="esEmpresa" 
                    checked={isEmpresa}
                    onCheckedChange={(checked) => setIsEmpresa(checked as boolean)}
                  />
                  <Label 
                    htmlFor="esEmpresa" 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-gray-600" />
                    Soy empresa
                  </Label>
                </div>

                {isEmpresa && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50">
                    {/* Nombre Fiscal */}
                    <div className="space-y-2">
                      <Label htmlFor="nombreFiscal">Nombre Fiscal</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          id="nombreFiscal" 
                          placeholder="Nombre de la empresa" 
                          className="pl-10" 
                        />
                      </div>
                    </div>

                    {/* CIF */}
                    <div className="space-y-2">
                      <Label htmlFor="cif">CIF</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          id="cif" 
                          placeholder="A12345678" 
                          className="pl-10" 
                        />
                      </div>
                    </div>

                    {/* Marca Preferida */}
                    <div className="space-y-2">
                      <Label htmlFor="marcaPreferida">Marca Preferida</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          id="marcaPreferida"
                          className="pl-10 w-full"
                          value={marcaPreferida || ''}
                          onChange={(e) => handleCambiarMarca(e.target.value)}
                        >
                          <option value="">Selecciona una marca</option>
                          {MARCAS_ARRAY.map(marca => (
                            <option key={marca.id} value={marca.id}>
                              {getNombreMarca(marca.id)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Separador antes del botón */}
              <Separator className="my-6" />

              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>

          {/* Marca Preferida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <Store className="w-5 h-5 text-teal-600" />
                Mi Marca Favorita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona tu marca favorita para personalizar tu experiencia de compra
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MARCAS_ARRAY.map((marca) => (
                  <motion.div
                    key={marca.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCambiarMarca(marca.id)}
                    className={`
                      relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300
                      ${marcaPreferida === marca.id 
                        ? 'border-teal-600 bg-teal-50/50 shadow-lg' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    {/* Checkmark */}
                    {marcaPreferida === marca.id && (
                      <div className="absolute top-2 right-2 bg-teal-600 rounded-full p-1">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Logo de la marca */}
                    <div className="flex justify-center items-center h-24 mb-3 bg-black rounded-lg overflow-hidden">
                      {LOGOS_MAP[marca.id] ? (
                        <img
                          src={LOGOS_MAP[marca.id]}
                          alt={marca.nombre}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-4xl">{marca.icono}</div>
                      )}
                    </div>

                    {/* Nombre de la marca */}
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900">{marca.nombre}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Direcciones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Direcciones
                </CardTitle>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Añadir Dirección
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg border-2 border-teal-200 bg-teal-50/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge className="mb-2 bg-teal-600">Principal</Badge>
                    <p className="font-medium">Calle Mayor 123, 4ºB</p>
                    <p className="text-sm text-gray-600">28001 Madrid, España</p>
                  </div>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">Avenida Libertad 45</p>
                    <p className="text-sm text-gray-600">28002 Madrid, España</p>
                  </div>
                  <Button variant="ghost" size="sm">Editar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pago */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Métodos de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MisMetodosPago />
            </CardContent>
          </Card>

          {/* Facturas */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Facturas
              </CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
          </Card>

          {/* Quienes Somos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <Info className="w-5 h-5 text-teal-600" />
                {quienesSomos.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {quienesSomos.elementos && quienesSomos.elementos.length > 0 ? (
                quienesSomos.elementos
                  .sort((a, b) => a.orden - b.orden)
                  .map((elemento, index) => (
                    <div key={elemento.id}>
                      {index > 0 && <Separator />}
                      
                      {elemento.tipo === 'texto' ? (
                        <div className="space-y-2">
                          {elemento.titulo && (
                            <div className="flex items-center gap-2">
                              {elemento.titulo.toLowerCase().includes('misión') && <Target className="w-5 h-5 text-teal-600" />}
                              {elemento.titulo.toLowerCase().includes('visión') && <Eye className="w-5 h-5 text-teal-600" />}
                              {elemento.titulo.toLowerCase().includes('valor') && <Award className="w-5 h-5 text-teal-600" />}
                              {!elemento.titulo.toLowerCase().includes('misión') && 
                               !elemento.titulo.toLowerCase().includes('visión') && 
                               !elemento.titulo.toLowerCase().includes('valor') && 
                               elemento.titulo !== 'Descripción' && <FileText className="w-5 h-5 text-teal-600" />}
                              {elemento.titulo !== 'Descripción' && (
                                <h4 className="font-medium text-gray-900">{elemento.titulo}</h4>
                              )}
                            </div>
                          )}
                          <div className={elemento.titulo && elemento.titulo !== 'Descripción' ? 'pl-7' : ''}>
                            {elemento.titulo.toLowerCase().includes('valor') && elemento.contenido.includes(',') ? (
                              <div className="flex flex-wrap gap-2">
                                {elemento.contenido.split(',').map((valor, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                    {valor.trim()}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {elemento.contenido}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {elemento.titulo && (
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              <Image className="w-5 h-5 text-teal-600" />
                              {elemento.titulo}
                            </h4>
                          )}
                          <img 
                            src={elemento.contenido}
                            alt={elemento.titulo || 'Imagen'}
                            className="w-full rounded-lg object-cover max-h-96"
                          />
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay información disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQs - Preguntas Frecuentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <HelpCircle className="w-5 h-5 text-teal-600" />
                Preguntas Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {faqsList.length > 0 ? (
                <div className="space-y-3">
                  {faqsList.map((faq) => (
                    <div key={faq.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setFaqExpandido(faqExpandido === faq.id ? null : faq.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-xs">
                              {faq.categoria}
                            </Badge>
                            <p className="font-medium text-gray-900">
                              {faq.pregunta}
                            </p>
                          </div>
                          <div className={`transition-transform ${faqExpandido === faq.id ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      {faqExpandido === faq.id && (
                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t animate-in slide-in-from-top-2">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {faq.respuesta}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay preguntas frecuentes disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}