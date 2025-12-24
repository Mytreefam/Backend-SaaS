/**
 * 🎫 MIS CUPONES - PERFIL CLIENTE
 * Vista de cupones disponibles para el cliente
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Ticket,
  Copy,
  Check,
  Calendar,
  TrendingUp,
  Gift,
  Percent,
  DollarSign,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCupones } from '../../hooks/useCupones';
import type { Cupon, CodigoClienteGoogleMaps } from '../../types/cupon.types';

interface MisCuponesProps {
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
}

export function MisCupones({ clienteId, clienteNombre, clienteEmail }: MisCuponesProps) {
  const {
    obtenerCuponesDisponiblesCliente,
    obtenerCodigoGoogleMaps,
    generarCodigoGoogleMaps,
  } = useCupones();

  const [copiado, setCopiado] = useState<string | null>(null);
  const [modalCodigo, setModalCodigo] = useState(false);
  const [codigoGoogle, setCodigoGoogle] = useState<CodigoClienteGoogleMaps | null>(null);

  // Obtener cupones disponibles
  const cuponesDisponibles = useMemo(() => {
    console.log('🎫 MisCupones - clienteId:', clienteId, typeof clienteId);
    const cupones = obtenerCuponesDisponiblesCliente(String(clienteId));
    console.log('🎫 MisCupones - cupones obtenidos:', cupones);
    return cupones;
  }, [obtenerCuponesDisponiblesCliente, clienteId]);

  // Verificar si tiene código de Google Maps
  const codigoGoogleMaps = useMemo(() => {
    return obtenerCodigoGoogleMaps(String(clienteId));
  }, [obtenerCodigoGoogleMaps, clienteId]);

  // Handler para copiar código
  const handleCopiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopiado(null), 2000);
  };

  // Handler para generar código Google Maps
  const handleGenerarCodigoGoogle = async () => {
    if (codigoGoogleMaps) {
      setCodigoGoogle(codigoGoogleMaps);
      setModalCodigo(true);
      return;
    }

    const resultado = await generarCodigoGoogleMaps(clienteId, clienteNombre, clienteEmail);
    if (resultado) {
      setCodigoGoogle(resultado);
      setModalCodigo(true);
      toast.success('¡Código generado! Compártelo en Google Maps');
    } else {
      toast.error('Error al generar el código');
    }
  };

  // Handler para compartir código Google Maps
  const handleCompartirCodigoGoogle = () => {
    if (!codigoGoogle) return;

    if (navigator.share) {
      navigator.share({
        title: 'Mi código de recomendación',
        text: codigoGoogle.urlParaCompartir,
      });
    } else {
      handleCopiarCodigo(codigoGoogle.urlParaCompartir);
    }
  };

  // Función para obtener icono según tipo de descuento
  const getIconoDescuento = (tipo: Cupon['tipoDescuento']) => {
    switch (tipo) {
      case 'porcentaje':
        return <Percent className="h-5 w-5" />;
      case 'fijo':
        return <DollarSign className="h-5 w-5" />;
      case 'regalo':
        return <Gift className="h-5 w-5" />;
      default:
        return <Ticket className="h-5 w-5" />;
    }
  };

  // Función para formatear descuento
  const formatearDescuento = (cupon: Cupon) => {
    if (cupon.tipoDescuento === 'porcentaje') {
      return `${cupon.valorDescuento}% OFF`;
    } else if (cupon.tipoDescuento === 'fijo') {
      return `${cupon.valorDescuento}€ OFF`;
    } else if (cupon.tipoDescuento === 'regalo') {
      return cupon.productoRegalo?.nombre || 'Regalo';
    }
    return 'Envío gratis';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Mis Cupones</h2>
        <p className="text-gray-600">
          Cupones y descuentos disponibles para ti
        </p>
      </div>

      {/* Banner Google Maps */}
      {!codigoGoogleMaps?.detectado && (
        <Card className="border-2 border-[#ED1C24] bg-gradient-to-r from-[#ED1C24]/5 to-[#ED1C24]/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#ED1C24] p-3 rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  ¡Gana 10€ con tu opinión!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Deja una reseña en Google Maps con tu código único y recibe 10€ de descuento
                </p>
                <Button
                  onClick={handleGenerarCodigoGoogle}
                  className="bg-[#ED1C24] hover:bg-[#D11820] gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {codigoGoogleMaps ? 'Ver mi código' : 'Obtener mi código'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cupón de Google Maps detectado */}
      {codigoGoogleMaps?.detectado && codigoGoogleMaps.cuponGenerado && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-green-800">
                  ¡Gracias por tu reseña!
                </h3>
                <p className="text-sm text-green-700 mb-2">
                  Hemos detectado tu código en Google Maps. Tu cupón de 10€ ya está disponible abajo.
                </p>
                {codigoGoogleMaps.reviewUrl && (
                  <a
                    href={codigoGoogleMaps.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 underline"
                  >
                    Ver mi reseña
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cupones disponibles */}
      {cuponesDisponibles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuponesDisponibles.map((cupon) => (
            <Card
              key={cupon.id}
              className="border-2 hover:border-[#ED1C24] transition-all cursor-pointer"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header del cupón */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#ED1C24]/10 p-2 rounded-lg text-[#ED1C24]">
                        {getIconoDescuento(cupon.tipoDescuento)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{cupon.nombre}</h3>
                        {cupon.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">
                            {cupon.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Descuento */}
                  <div className="bg-gradient-to-r from-[#ED1C24] to-[#D11820] text-white p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold mb-1">
                      {formatearDescuento(cupon)}
                    </div>
                    {cupon.gastoMinimo && (
                      <div className="text-xs opacity-90">
                        Compra mínima: {cupon.gastoMinimo}€
                      </div>
                    )}
                  </div>

                  {/* Código */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      Código del cupón
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono font-semibold text-center">
                        {cupon.codigo}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopiarCodigo(cupon.codigo)}
                        className="gap-2"
                      >
                        {copiado === cupon.codigo ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Validez */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Válido hasta {format(parseISO(cupon.fechaFin), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>

                  {/* Restricciones */}
                  {(cupon.usosMaximosPorCliente || cupon.marcasAplicables) && (
                    <div className="pt-3 border-t space-y-2">
                      {cupon.usosMaximosPorCliente && (
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>Máximo {cupon.usosMaximosPorCliente} uso(s) por cliente</span>
                        </div>
                      )}
                      {cupon.marcasAplicables && cupon.marcasAplicables.length > 0 && (
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>Válido solo en marcas seleccionadas</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No tienes cupones disponibles</h3>
            <p className="text-gray-600 mb-6">
              Completa pedidos y participa en promociones para ganar cupones
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal código Google Maps */}
      <Dialog open={modalCodigo} onOpenChange={setModalCodigo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tu código de recomendación</DialogTitle>
            <DialogDescription>
              Comparte este código en tu reseña de Google Maps para ganar 10€ de descuento
            </DialogDescription>
          </DialogHeader>

          {codigoGoogle && (
            <div className="space-y-4 py-4">
              {/* Código */}
              <div className="bg-gradient-to-r from-[#ED1C24] to-[#D11820] text-white p-6 rounded-lg text-center">
                <div className="text-xs uppercase tracking-wide opacity-90 mb-2">
                  Tu código único
                </div>
                <div className="text-2xl font-bold font-mono mb-4">
                  {codigoGoogle.codigo}
                </div>
                <Button
                  onClick={() => handleCopiarCodigo(codigoGoogle.codigo)}
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                >
                  {copiado === codigoGoogle.codigo ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar código
                    </>
                  )}
                </Button>
              </div>

              {/* Texto para compartir */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Texto sugerido para tu reseña:</div>
                <div className="bg-gray-100 p-4 rounded-lg text-sm">
                  {codigoGoogle.urlParaCompartir}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopiarCodigo(codigoGoogle.urlParaCompartir)}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    {copiado === codigoGoogle.urlParaCompartir ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar texto
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCompartirCodigoGoogle}
                    className="flex-1 gap-2 bg-[#ED1C24] hover:bg-[#D11820]"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <div className="font-semibold mb-2">¿Cómo obtener mi descuento?</div>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Busca "HoyPecamos" en Google Maps</li>
                      <li>Deja una reseña honesta (mínimo 4 estrellas)</li>
                      <li>Incluye tu código <strong>{codigoGoogle.codigo}</strong> en la reseña</li>
                      <li>En las próximas 24-48h recibirás tu cupón de 10€</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
