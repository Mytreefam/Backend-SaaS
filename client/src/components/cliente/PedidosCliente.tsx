import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Package,
  MessageSquare,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  LifeBuoy,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../mobile/PullToRefreshIndicator';
import { useHaptics } from '../../hooks/useHaptics';
import { useShare } from '../../hooks/useShare';
import { useAnalytics } from '../../services/analytics.service';

interface PedidosClienteProps {
  onNavigateToChat?: () => void;
}

export function PedidosCliente({ onNavigateToChat }: PedidosClienteProps = {}) {
  const [activeTab, setActiveTab] = useState('seguimiento');
  
  // ✅ Hooks nativos
  const haptics = useHaptics();
  const { sharePedido } = useShare();
  const analyticsHooks = useAnalytics();

  // ✅ Pull to Refresh
  const refreshPedidos = async () => {
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Pedidos actualizados');
  };
  const { pullIndicatorRef } = usePullToRefresh(refreshPedidos);

  const pedidos = [
    {
      id: 'PED-001',
      estado: 'preparacion',
      fecha: '10 Nov 2025',
      total: 28.40,
      productos: ['10 Barras de Pan', 'Coca-Cola 33cl'],
      timeline: [
        { estado: 'recibido', completado: true, fecha: '10 Nov 10:00' },
        { estado: 'preparacion', completado: true, fecha: '10 Nov 14:30' },
        { estado: 'enviado', completado: false, fecha: null },
        { estado: 'completado', completado: false, fecha: null }
      ]
    },
    {
      id: 'PED-002',
      estado: 'en-carretera',
      fecha: '08 Nov 2025',
      total: 42.80,
      productos: ['10 Barras de Pan', 'Patatas Fritas', 'Fanta Naranja 33cl'],
      timeline: [
        { estado: 'recibido', completado: true, fecha: '08 Nov 09:15' },
        { estado: 'preparacion', completado: true, fecha: '08 Nov 11:00' },
        { estado: 'enviado', completado: true, fecha: '10 Nov 08:00' },
        { estado: 'completado', completado: false, fecha: null }
      ]
    }
  ];

  const completados = [
    {
      id: 'PED-099',
      fecha: '01 Nov 2025',
      total: 45.30,
      productos: ['10 Barras de Pan', '5 Croissants', 'Agua Mineral 50cl x2']
    },
    {
      id: 'PED-098',
      fecha: '15 Oct 2025',
      total: 32.90,
      productos: ['10 Barras de Pan', 'Aros de Cebolla', 'Cerveza Estrella Galicia']
    }
  ];

  const handleChatPedido = (pedidoId: string) => {
    haptics.onButtonPress(); // ✅ Feedback táctil
    analyticsHooks.logButtonClick('chat_pedido', 'pedidos_cliente'); // ✅ Analytics
    
    if (onNavigateToChat) {
      onNavigateToChat();
      toast.success(`Abriendo chat para pedido ${pedidoId}`);
    } else {
      toast.info(`Abriendo chat para pedido ${pedidoId}`);
    }
  };

  const handleCompartirPedido = (pedidoId: string, total: number) => {
    haptics.light(); // ✅ Feedback táctil
    analyticsHooks.logShare('pedido', pedidoId); // ✅ Analytics
    sharePedido(pedidoId, total);
  };

  const handleDescargarFactura = (pedidoId: string) => {
    haptics.medium(); // ✅ Feedback táctil
    analyticsHooks.logButtonClick('descargar_factura', 'pedidos_cliente'); // ✅ Analytics
    toast.success(`Descargando factura ${pedidoId}`);
  };

  const handleAsistenciaCarretera = (pedidoId: string) => {
    toast.info(`Solicitando asistencia para pedido ${pedidoId}`);
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      recibido: { label: 'Recibido', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      preparacion: { label: 'En Preparación', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      enviado: { label: 'Enviado', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      'en-carretera': { label: 'En Carretera', className: 'bg-red-100 text-red-700 border-red-200' },
      completado: { label: 'Completado', className: 'bg-green-100 text-green-700 border-green-200' }
    };
    const badge = badges[estado] || badges.pendiente;
    return <Badge variant="outline" className={badge.className}>{badge.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* ✅ Indicador de Pull to Refresh */}
      <PullToRefreshIndicator indicatorRef={pullIndicatorRef} />
      
      <Tabs value={activeTab} onValueChange={(value) => {
        haptics.onTabChange(); // ✅ Feedback táctil al cambiar tab
        setActiveTab(value);
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="seguimiento" className="text-xs sm:text-sm">Seguimiento</TabsTrigger>
          <TabsTrigger value="completados" className="text-xs sm:text-sm">Completados</TabsTrigger>
        </TabsList>

        {/* Tab Seguimiento */}
        <TabsContent value="seguimiento" className="space-y-4 mt-6">
          {pedidos.map((pedido) => (
            <Card key={pedido.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm sm:text-base md:text-lg truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Pedido {pedido.id}
                  </CardTitle>
                  <div className="shrink-0">
                    {getEstadoBadge(pedido.estado)}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">{pedido.fecha}</p>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {/* Timeline de Estados */}
                <div className="space-y-2 sm:space-y-3">
                  {pedido.timeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                        step.completado ? 'bg-teal-100' : 'bg-gray-100'
                      }`}>
                        {step.completado ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                        ) : (
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5 sm:pt-1">
                        <p className={`text-xs sm:text-sm font-medium ${
                          step.completado ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.estado === 'recibido' && 'Pedido Recibido'}
                          {step.estado === 'preparacion' && 'En Preparación'}
                          {step.estado === 'enviado' && 'Enviado / Listo para Recogida'}
                          {step.estado === 'completado' && 'Completado'}
                        </p>
                        {step.fecha && (
                          <p className="text-xs text-gray-500">{step.fecha}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Productos */}
                <div className="pt-2 sm:pt-3 border-t">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Productos:</p>
                  <ul className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                    {pedido.productos.map((prod, idx) => (
                      <li key={idx} className="text-gray-700">• {prod}</li>
                    ))}
                  </ul>
                  
                  {/* Link contextual a Asistencia para pedidos en-carretera */}
                  {pedido.estado === 'en-carretera' && (
                    <button
                      onClick={() => handleAsistenciaCarretera(pedido.id)}
                      className="flex items-center gap-1.5 mt-2 sm:mt-3 text-xs sm:text-sm text-orange-600 hover:text-orange-700 transition-colors touch-target"
                    >
                      <LifeBuoy className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="underline underline-offset-2">Solicitar asistencia</span>
                    </button>
                  )}
                </div>

                {/* Total y Acciones */}
                <div className="pt-2 sm:pt-3 border-t space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Total: <span className="text-teal-600">€{pedido.total.toFixed(2)}</span>
                    </p>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCompartirPedido(pedido.id, pedido.total)}
                      className="touch-target h-9"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full touch-target h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => handleChatPedido(pedido.id)}
                  >
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Chat con este pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab Completados */}
        <TabsContent value="completados" className="space-y-4 mt-6">
          {completados.map((pedido) => (
            <Card key={pedido.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                      <h3 className="font-medium text-sm sm:text-base truncate">{pedido.id}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">{pedido.fecha}</p>
                  </div>
                  <p className="text-sm sm:text-base text-teal-600 shrink-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    €{pedido.total.toFixed(2)}
                  </p>
                </div>
                <div className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                  {pedido.productos.map((prod, idx) => (
                    <p key={idx} className="text-gray-600">• {prod}</p>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      haptics.medium();
                      analyticsHooks.logButtonClick('repetir_pedido', 'pedidos_completados');
                      toast.success(`Repitiendo pedido ${pedido.id}`);
                    }}
                    className="touch-target h-8 sm:h-9 px-1.5 sm:px-2 text-xs flex-col sm:flex-row gap-0.5 sm:gap-1"
                  >
                    <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Repetir</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDescargarFactura(pedido.id)}
                    className="touch-target h-8 sm:h-9 px-1.5 sm:px-2 text-xs flex-col sm:flex-row gap-0.5 sm:gap-1"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Factura</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCompartirPedido(pedido.id, pedido.total)}
                    className="touch-target h-8 sm:h-9 px-2"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleChatPedido(pedido.id)}
                    className="touch-target h-8 sm:h-9 px-2"
                  >
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}