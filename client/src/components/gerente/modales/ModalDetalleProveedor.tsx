import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Proveedor } from '../../../data/proveedores';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Euro,
  Calendar,
  CreditCard,
  Star,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  BarChart3,
  ShoppingCart
} from 'lucide-react';

interface ModalDetalleProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  proveedor: Proveedor;
}

export function ModalDetalleProveedor({
  isOpen,
  onClose,
  proveedor
}: ModalDetalleProveedorProps) {
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const getEstrellas = (puntuacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < puntuacion ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Detalle del Proveedor
          </DialogTitle>
          <DialogDescription>
            Información completa y estadísticas del proveedor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con nombre y estado */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{proveedor.nombre}</h3>
              <p className="text-sm text-gray-600 mt-1">{proveedor.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {proveedor.activo ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Inactivo
                </Badge>
              )}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Categorías</h4>
            <div className="flex flex-wrap gap-2">
              {proveedor.categoria.map(cat => (
                <Badge key={cat} variant="outline" className="capitalize">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-blue-700">Total Pedidos</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {proveedor.estadisticas.totalPedidos}
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-green-700">Completados</p>
                    <p className="text-2xl font-bold text-green-900">
                      {proveedor.estadisticas.pedidosCompletados}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-purple-700">Gasto Total</p>
                    <p className="text-lg font-bold text-purple-900">
                      {formatearMoneda(proveedor.estadisticas.gastoTotal)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs text-amber-700">Cumplimiento</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {proveedor.estadisticas.tasaCumplimiento}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de Contacto y Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Persona de contacto</p>
                    <p className="font-semibold text-gray-900">{proveedor.contacto.personaContacto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Teléfono</p>
                    <p className="font-semibold text-gray-900">{proveedor.contacto.telefono}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{proveedor.contacto.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {proveedor.direccion.calle && (
                  <p className="text-sm text-gray-900">{proveedor.direccion.calle}</p>
                )}
                <p className="text-sm text-gray-900">
                  {proveedor.direccion.codigoPostal && `${proveedor.direccion.codigoPostal}, `}
                  {proveedor.direccion.ciudad}
                </p>
                <p className="text-sm text-gray-900">{proveedor.direccion.provincia}</p>
              </CardContent>
            </Card>
          </div>

          {/* Condiciones Comerciales */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Condiciones Comerciales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pedido Mínimo</p>
                  <p className="font-bold text-gray-900">
                    {formatearMoneda(proveedor.condicionesComerciales.pedidoMinimo)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Días de Entrega</p>
                  <p className="font-bold text-gray-900">
                    {proveedor.condicionesComerciales.diasEntrega} días
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Forma de Pago</p>
                  <p className="font-bold text-gray-900 capitalize">
                    {proveedor.condicionesComerciales.formaPago}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Plazos de Pago</p>
                  <p className="font-bold text-gray-900">
                    {proveedor.condicionesComerciales.plazosPago}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluación */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                Evaluación del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Puntuación General */}
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <p className="font-semibold text-gray-900">Puntuación General</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getEstrellas(proveedor.evaluacion.puntuacionGeneral)}
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-gray-900">
                    {proveedor.evaluacion.puntuacionGeneral}/5
                  </span>
                </div>

                {/* Detalles de evaluación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Calidad</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getEstrellas(proveedor.evaluacion.calidad)}</div>
                        <span className="text-sm font-semibold">{proveedor.evaluacion.calidad}/5</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(proveedor.evaluacion.calidad / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Puntualidad</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getEstrellas(proveedor.evaluacion.puntualidad)}</div>
                        <span className="text-sm font-semibold">{proveedor.evaluacion.puntualidad}/5</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(proveedor.evaluacion.puntualidad / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Precio</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getEstrellas(proveedor.evaluacion.precio)}</div>
                        <span className="text-sm font-semibold">{proveedor.evaluacion.precio}/5</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(proveedor.evaluacion.precio / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Atención al Cliente</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">{getEstrellas(proveedor.evaluacion.atencionCliente)}</div>
                        <span className="text-sm font-semibold">{proveedor.evaluacion.atencionCliente}/5</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${(proveedor.evaluacion.atencionCliente / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notas */}
          {proveedor.notas && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{proveedor.notas}</p>
              </CardContent>
            </Card>
          )}

          {/* Resumen de Rendimiento */}
          <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Resumen de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-600 mb-2">Tiempo Medio de Entrega</p>
                  <p className="text-3xl font-bold text-teal-600">
                    {proveedor.estadisticas.tiempoMedioEntrega}
                  </p>
                  <p className="text-xs text-gray-500">días</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-600 mb-2">Tasa de Cumplimiento</p>
                  <p className="text-3xl font-bold text-green-600">
                    {proveedor.estadisticas.tasaCumplimiento}%
                  </p>
                  <p className="text-xs text-gray-500">pedidos completos</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <p className="text-xs text-gray-600 mb-2">Pedidos Activos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {proveedor.estadisticas.totalPedidos - proveedor.estadisticas.pedidosCompletados}
                  </p>
                  <p className="text-xs text-gray-500">en proceso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón Cerrar */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-teal-600 hover:bg-teal-700">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
