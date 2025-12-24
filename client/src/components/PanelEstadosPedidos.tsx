import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Package, Check, Truck, X, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Pedido, PermisosTPV } from './TPV360Master';

interface PanelEstadosPedidosProps {
  pedidos: Pedido[];
  onMarcarListo: (pedidoId: string) => void;
  onMarcarEntregado: (pedidoId: string) => void;
  permisos: PermisosTPV;
}

export function PanelEstadosPedidos({ 
  pedidos, 
  onMarcarListo, 
  onMarcarEntregado,
  permisos 
}: PanelEstadosPedidosProps) {
  
  // Separar pedidos por estado
  const enPreparacion = pedidos.filter(p => p.estado === 'en_preparacion');
  const listos = pedidos.filter(p => p.estado === 'listo');
  const entregados = pedidos.filter(p => p.estado === 'entregado');
  const cancelados = pedidos.filter(p => p.estado === 'cancelado');
  const devueltos = pedidos.filter(p => p.estado === 'devuelto');

  const formatearTiempo = (fecha: Date): string => {
    const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return 'Ahora';
    if (minutos === 1) return '1 min';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `${horas}h ${minutos % 60}m`;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_preparacion': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'listo': return 'bg-green-100 text-green-800 border-green-300';
      case 'entregado': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-300';
      case 'devuelto': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const TarjetaPedido = ({ pedido, acciones }: { pedido: Pedido; acciones?: React.ReactNode }) => (
    <Card className={`border-2 ${getEstadoColor(pedido.estado)}`}>
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <p className="text-3xl mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {pedido.codigo}
          </p>
          <Badge className={getEstadoColor(pedido.estado)}>
            {pedido.estado.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 mb-3 text-sm">
          <p className="font-medium">{pedido.cliente.nombre}</p>
          <p className="text-gray-600">{pedido.items.length} productos</p>
          <p className="font-medium text-lg">{pedido.total.toFixed(2)}€</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatearTiempo(pedido.fechaCreacion)}</span>
          </div>
        </div>

        {acciones}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        <Card className="border-2 border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-yellow-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {enPreparacion.length}
            </p>
            <p className="text-xs text-yellow-700 mt-1">En Preparación</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {listos.length}
            </p>
            <p className="text-xs text-green-700 mt-1">Listos</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {entregados.length}
            </p>
            <p className="text-xs text-blue-700 mt-1">Entregados</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-red-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {cancelados.length}
            </p>
            <p className="text-xs text-red-700 mt-1">Cancelados</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200">
          <CardContent className="p-4 text-center">
            <p className="text-3xl text-purple-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {devueltos.length}
            </p>
            <p className="text-xs text-purple-700 mt-1">Devueltos</p>
          </CardContent>
        </Card>
      </div>

      {/* En Preparación */}
      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-yellow-50 p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            En Preparación ({enPreparacion.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {enPreparacion.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay pedidos en preparación</p>
              </div>
            ) : (
              enPreparacion.map(pedido => (
                <TarjetaPedido 
                  key={pedido.id} 
                  pedido={pedido}
                  acciones={
                    permisos.marcar_como_listo && (
                      <Button
                        onClick={() => onMarcarListo(pedido.id)}
                        className="w-full bg-green-600 hover:bg-green-700 touch-target"
                        size="sm"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Marcar Listo
                      </Button>
                    )
                  }
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Listos */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50 p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            Listos para Entregar ({listos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {listos.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Check className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay pedidos listos</p>
              </div>
            ) : (
              listos.map(pedido => (
                <TarjetaPedido 
                  key={pedido.id} 
                  pedido={pedido}
                  acciones={
                    <Button
                      onClick={() => onMarcarEntregado(pedido.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 touch-target"
                      size="sm"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Entregar
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entregados */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Entregados Hoy ({entregados.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {entregados.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay pedidos entregados hoy</p>
              </div>
            ) : (
              entregados.slice(0, 12).map(pedido => (
                <TarjetaPedido key={pedido.id} pedido={pedido} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancelados y Devueltos */}
      {(cancelados.length > 0 || devueltos.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cancelados */}
          {cancelados.length > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <X className="w-5 h-5 text-red-600" />
                  Cancelados ({cancelados.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  {cancelados.map(pedido => (
                    <TarjetaPedido key={pedido.id} pedido={pedido} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Devueltos */}
          {devueltos.length > 0 && (
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  Devueltos ({devueltos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-3">
                  {devueltos.map(pedido => (
                    <TarjetaPedido key={pedido.id} pedido={pedido} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
