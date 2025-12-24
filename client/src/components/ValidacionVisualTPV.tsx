import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ShoppingCart, 
  CreditCard, 
  Package, 
  Check,
  Play,
  Eye,
  Layers,
  Grid3x3
} from 'lucide-react';
import { ModalPagoTPV } from './ModalPagoTPV';
import { ModalOperacionesTPV } from './ModalOperacionesTPV';
import { ModalPagoMixto } from './ModalPagoMixto';
import { toast } from 'sonner@2.0.3';

export function ValidacionVisualTPV() {
  // Estados para controlar modales
  const [showModalPago, setShowModalPago] = useState(false);
  const [showModalOperaciones, setShowModalOperaciones] = useState(false);
  const [showModalPagoMixto, setShowModalPagoMixto] = useState(false);
  
  // Estados de demostración
  const [estadoPedido, setEstadoPedido] = useState<'vacio' | 'con_productos' | 'pagado' | 'entregado'>('vacio');
  const [turnoAbierto, setTurnoAbierto] = useState(true);
  
  // Permisos de ejemplo
  const permisosDemo = {
    cobrar_pedidos: true,
    marcar_como_listo: true,
    gestionar_caja_rapida: true,
    hacer_retiradas: true,
    arqueo_caja: true,
    cierre_caja: true,
    ver_informes_turno: true,
    acceso_operativa: true,
    reimprimir_tickets: true
  };

  const productosEjemplo = [
    { id: '1', nombre: 'Pan Barra', precio: 1.20, cantidad: 2 },
    { id: '2', nombre: 'Croissant', precio: 1.50, cantidad: 3 },
    { id: '3', nombre: 'Café Solo', precio: 1.20, cantidad: 1 }
  ];

  const totalEjemplo = 8.10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            TPV 360 – Validación Visual
          </h1>
          <p className="text-lg text-gray-600">
            Galería completa de modales, estados y variantes del sistema TPV 360
          </p>
          <div className="flex items-center justify-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
              <Check className="w-4 h-4 mr-2" />
              2 Modales Creados
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2">
              <Layers className="w-4 h-4 mr-2" />
              6 Variantes
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300 px-4 py-2">
              <Grid3x3 className="w-4 h-4 mr-2" />
              4 Estados
            </Badge>
          </div>
        </div>

        {/* Navegación de secciones */}
        <Tabs defaultValue="modales" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="modales" className="flex items-center gap-2 py-3">
              <Eye className="w-4 h-4" />
              <span>Modales</span>
            </TabsTrigger>
            <TabsTrigger value="estados" className="flex items-center gap-2 py-3">
              <Package className="w-4 h-4" />
              <span>Estados Pedido</span>
            </TabsTrigger>
            <TabsTrigger value="botones" className="flex items-center gap-2 py-3">
              <CreditCard className="w-4 h-4" />
              <span>Botones Adaptativos</span>
            </TabsTrigger>
            <TabsTrigger value="flujo" className="flex items-center gap-2 py-3">
              <Play className="w-4 h-4" />
              <span>Flujo Completo</span>
            </TabsTrigger>
          </TabsList>

          {/* SECCIÓN 1: MODALES */}
          <TabsContent value="modales" className="space-y-8 mt-8">
            {/* Modal de Pago */}
            <Card className="border-2 border-teal-200">
              <CardHeader className="bg-teal-50">
                <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span>1️⃣ Modal de Pago (ModalPagoTPV)</span>
                  <Badge className="bg-green-600 text-white">NUEVO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Descripción */}
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="font-medium text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Características:
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span><strong>4 métodos de pago:</strong> Efectivo, Tarjeta, Mixto, Online</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span><strong>Cálculo automático</strong> de cambio en efectivo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span><strong>Validaciones completas:</strong> monto mínimo, campos requeridos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span><strong>Estados visuales:</strong> hover, active, disabled, procesando</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span><strong>Integración con ModalPagoMixto</strong> para pagos combinados</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span><strong>Total destacado</strong> con tipografía Poppins</span>
                        </li>
                      </ul>
                    </div>

                    {/* Archivo */}
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono">
                      <div className="text-green-400 mb-2">📁 /components/ModalPagoTPV.tsx</div>
                      <div className="text-gray-400">284 líneas de código</div>
                      <div className="text-blue-400 mt-2">
                        Props: isOpen, total, onConfirmarPago, onAbrirPagoMixto, permitirOnline
                      </div>
                    </div>
                  </div>

                  {/* Botón de prueba */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-300 rounded-xl p-4 sm:p-8 text-center">
                      <div className="mb-6">
                        <p className="text-sm text-teal-700 mb-2">Total del pedido de ejemplo:</p>
                        <p className="text-4xl text-teal-700 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {totalEjemplo.toFixed(2)}€
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowModalPago(true)}
                        size="lg"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6"
                      >
                        <CreditCard className="w-6 h-6 mr-3" />
                        Abrir Modal de Pago
                      </Button>
                      <p className="text-xs text-teal-600 mt-4">
                        Click para ver el modal en acción con todos los métodos de pago
                      </p>
                    </div>

                    {/* Grid de métodos */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
                        <div className="w-10 h-10 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-lg">💵</span>
                        </div>
                        <p className="text-xs font-medium">Efectivo</p>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-lg">💳</span>
                        </div>
                        <p className="text-xs font-medium">Tarjeta</p>
                      </div>
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 text-center">
                        <div className="w-10 h-10 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-lg">🧮</span>
                        </div>
                        <p className="text-xs font-medium">Mixto</p>
                      </div>
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 text-center">
                        <div className="w-10 h-10 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-lg">📱</span>
                        </div>
                        <p className="text-xs font-medium">Online</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal de Operaciones */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span>2️⃣ Modal de Operaciones TPV (ModalOperacionesTPV)</span>
                  <Badge className="bg-green-600 text-white">NUEVO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Descripción */}
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="font-medium text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Características:
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span><strong>6 operaciones de caja:</strong> Grid 3x2 organizado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span><strong>Estado de caja visible:</strong> Abierta/Cerrada con indicador</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span><strong>Sistema de permisos:</strong> Botones deshabilitados según rol</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span><strong>Colores distintivos:</strong> Verde, Rojo, Azul, Naranja, Púrpura, Amarillo</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span><strong>Iconos lucide-react:</strong> Unlock, Lock, Calculator, TrendingDown, Coffee, RotateCcw</span>
                        </li>
                      </ul>
                    </div>

                    {/* Archivo */}
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono">
                      <div className="text-green-400 mb-2">📁 /components/ModalOperacionesTPV.tsx</div>
                      <div className="text-gray-400">218 líneas de código</div>
                      <div className="text-blue-400 mt-2">
                        Props: isOpen, onClose, onSeleccionarOperacion, turnoAbierto, permisos
                      </div>
                    </div>

                    {/* Control de estado */}
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-medium mb-3">Estado de Caja:</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setTurnoAbierto(true)}
                          variant={turnoAbierto ? "default" : "outline"}
                          size="sm"
                          className={`touch-target ${turnoAbierto ? "bg-green-600" : ""}`}
                        >
                          🔓 Abierta
                        </Button>
                        <Button
                          onClick={() => setTurnoAbierto(false)}
                          variant={!turnoAbierto ? "default" : "outline"}
                          size="sm"
                          className={`touch-target ${!turnoAbierto ? "bg-red-600" : ""}`}
                        >
                          🔒 Cerrada
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Botón de prueba y grid */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 sm:p-8 text-center">
                      <div className="mb-6">
                        <p className="text-sm text-blue-700 mb-2">Estado actual:</p>
                        <Badge className={`text-lg px-4 py-2 ${
                          turnoAbierto 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {turnoAbierto ? '🔓 Caja Abierta' : '🔒 Caja Cerrada'}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => setShowModalOperaciones(true)}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                      >
                        <Grid3x3 className="w-6 h-6 mr-3" />
                        Abrir Modal de Operaciones
                      </Button>
                      <p className="text-xs text-blue-600 mt-4">
                        Click para ver las 6 operaciones de caja
                      </p>
                    </div>

                    {/* Grid de operaciones miniatura */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-50 border border-green-300 rounded p-2 text-center">
                        <div className="text-lg mb-1">🔓</div>
                        <p className="text-xs font-medium">Apertura</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-300 rounded p-2 text-center">
                        <div className="text-lg mb-1">🧮</div>
                        <p className="text-xs font-medium">Arqueo</p>
                      </div>
                      <div className="bg-red-50 border border-red-300 rounded p-2 text-center">
                        <div className="text-lg mb-1">🔒</div>
                        <p className="text-xs font-medium">Cierre</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-300 rounded p-2 text-center">
                        <div className="text-lg mb-1">📉</div>
                        <p className="text-xs font-medium">Retiradas</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-300 rounded p-2 text-center">
                        <div className="text-lg mb-1">☕</div>
                        <p className="text-xs font-medium">Consumo</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-300 rounded p-2 text-center">
                        <div className="text-lg mb-1">↩️</div>
                        <p className="text-xs font-medium">Devoluciones</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modal Pago Mixto */}
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center justify-between" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span>3️⃣ Modal de Pago Mixto (ModalPagoMixto)</span>
                  <Badge className="bg-purple-600 text-white">INTEGRADO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="font-medium text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Características:
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span><strong>Divide el pago</strong> entre efectivo y tarjeta</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span><strong>Cálculo automático</strong> del segundo importe</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span><strong>Validación de suma</strong> igual al total</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span><strong>Conectado automáticamente</strong> desde ModalPagoTPV</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 sm:p-8 text-center">
                    <Button
                      onClick={() => setShowModalPagoMixto(true)}
                      size="lg"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
                    >
                      <CreditCard className="w-6 h-6 mr-3" />
                      Abrir Pago Mixto
                    </Button>
                    <p className="text-xs text-purple-600 mt-4">
                      Modal accesible desde el botón "Mixto" en ModalPagoTPV
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 2: ESTADOS DE PEDIDO */}
          <TabsContent value="estados" className="space-y-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estados del Pedido - Variantes Visuales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6 flex gap-2">
                  <Button
                    onClick={() => setEstadoPedido('vacio')}
                    variant={estadoPedido === 'vacio' ? 'default' : 'outline'}
                    className={estadoPedido === 'vacio' ? 'bg-gray-600' : ''}
                  >
                    Vacío
                  </Button>
                  <Button
                    onClick={() => setEstadoPedido('con_productos')}
                    variant={estadoPedido === 'con_productos' ? 'default' : 'outline'}
                    className={estadoPedido === 'con_productos' ? 'bg-teal-600' : ''}
                  >
                    Con Productos
                  </Button>
                  <Button
                    onClick={() => setEstadoPedido('pagado')}
                    variant={estadoPedido === 'pagado' ? 'default' : 'outline'}
                    className={estadoPedido === 'pagado' ? 'bg-green-600' : ''}
                  >
                    Pagado
                  </Button>
                  <Button
                    onClick={() => setEstadoPedido('entregado')}
                    variant={estadoPedido === 'entregado' ? 'default' : 'outline'}
                    className={estadoPedido === 'entregado' ? 'bg-blue-600' : ''}
                  >
                    Entregado
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Panel del carrito simulado */}
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Panel del Carrito
                        </CardTitle>
                        <Badge className={
                          estadoPedido === 'vacio' ? 'bg-gray-100 text-gray-800' :
                          estadoPedido === 'con_productos' ? 'bg-teal-100 text-teal-800' :
                          estadoPedido === 'pagado' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {estadoPedido === 'vacio' && 'Vacío'}
                          {estadoPedido === 'con_productos' && 'Con Productos'}
                          {estadoPedido === 'pagado' && 'Pagado'}
                          {estadoPedido === 'entregado' && 'Entregado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {estadoPedido === 'vacio' && (
                        <div className="text-center py-12 text-gray-400">
                          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No hay productos en el pedido</p>
                        </div>
                      )}

                      {(estadoPedido === 'con_productos' || estadoPedido === 'pagado' || estadoPedido === 'entregado') && (
                        <>
                          {/* Turno asignado */}
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="text-xs text-orange-700">Turno Asignado</p>
                                <p className="text-xl text-orange-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  P001
                                </p>
                                <p className="text-xs text-orange-600">
                                  {productosEjemplo.reduce((sum, p) => sum + p.cantidad, 0)} artículos
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Lista de productos */}
                          <div className="space-y-2">
                            {productosEjemplo.map(prod => (
                              <div key={prod.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{prod.nombre}</p>
                                    <p className="text-xs text-gray-600">{prod.precio.toFixed(2)}€ c/u</p>
                                  </div>
                                  <p className="font-medium text-teal-600">
                                    {prod.cantidad} × {prod.precio.toFixed(2)}€
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total */}
                          <div className="border-t pt-4">
                            <div className="flex justify-between pt-2">
                              <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Total
                              </span>
                              <span className="text-xl text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {totalEjemplo.toFixed(2)}€
                              </span>
                            </div>
                          </div>

                          {/* Botones según estado */}
                          <div className="space-y-2">
                            {estadoPedido === 'con_productos' && (
                              <>
                                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Procesar Pago
                                </Button>
                                <Button variant="outline" className="w-full text-red-600">
                                  Vaciar Pedido
                                </Button>
                              </>
                            )}

                            {estadoPedido === 'pagado' && (
                              <>
                                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                                  <Package className="w-4 h-4 mr-2" />
                                  Entregar
                                </Button>
                                <Button variant="outline" className="w-full">
                                  Reimprimir
                                </Button>
                              </>
                            )}

                            {estadoPedido === 'entregado' && (
                              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                                <Check className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="font-medium text-blue-700">Pedido Entregado</p>
                                <p className="text-xs text-blue-600 mt-1">El pedido ha sido completado</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Descripción del estado */}
                  <div className="space-y-4">
                    <Card className="border-2 border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Descripción del Estado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {estadoPedido === 'vacio' && (
                          <div className="space-y-3">
                            <p className="text-sm"><strong>Estado:</strong> Sin iniciar</p>
                            <p className="text-sm"><strong>Botones visibles:</strong> Empezar Pedido</p>
                            <p className="text-sm"><strong>Flujo:</strong> Añadir productos al carrito</p>
                          </div>
                        )}
                        {estadoPedido === 'con_productos' && (
                          <div className="space-y-3">
                            <p className="text-sm"><strong>Estado:</strong> Pedido iniciado sin pagar</p>
                            <p className="text-sm"><strong>Botones visibles:</strong> Procesar Pago (verde), Vaciar Pedido</p>
                            <p className="text-sm"><strong>Banner:</strong> Turno P001 con cantidad de artículos</p>
                            <p className="text-sm"><strong>Flujo siguiente:</strong> Click en "Procesar Pago" → Modal de cobro</p>
                          </div>
                        )}
                        {estadoPedido === 'pagado' && (
                          <div className="space-y-3">
                            <p className="text-sm"><strong>Estado:</strong> Pedido pagado</p>
                            <p className="text-sm"><strong>Botones visibles:</strong> Entregar (amarillo), Reimprimir</p>
                            <p className="text-sm"><strong>Cambio automático:</strong> Botón cambió de "Procesar Pago" → "Entregar"</p>
                            <p className="text-sm"><strong>Flujo siguiente:</strong> Click en "Entregar" → Marcar como entregado</p>
                          </div>
                        )}
                        {estadoPedido === 'entregado' && (
                          <div className="space-y-3">
                            <p className="text-sm"><strong>Estado:</strong> Pedido completado</p>
                            <p className="text-sm"><strong>Botones visibles:</strong> Ninguno (mensaje de confirmación)</p>
                            <p className="text-sm"><strong>Reseteo:</strong> Carrito limpiado, turno liberado</p>
                            <p className="text-sm"><strong>Flujo siguiente:</strong> Listo para nuevo pedido</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Código de transición */}
                    <Card className="bg-gray-900 text-gray-100">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-400">
                          💻 Código de Transición
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-mono text-xs space-y-2">
                        {estadoPedido === 'con_productos' && (
                          <div>
                            <div className="text-blue-400">// Al procesar pago:</div>
                            <div className="text-white">pagado: true</div>
                            <div className="text-white">estado: 'en_preparacion'</div>
                          </div>
                        )}
                        {estadoPedido === 'pagado' && (
                          <div>
                            <div className="text-blue-400">// Al entregar:</div>
                            <div className="text-white">estado: 'entregado'</div>
                            <div className="text-white">resetCarrito()</div>
                          </div>
                        )}
                        {estadoPedido === 'entregado' && (
                          <div>
                            <div className="text-blue-400">// Después de entrega:</div>
                            <div className="text-white">carrito = []</div>
                            <div className="text-white">pedidoIniciado = false</div>
                            <div className="text-white">turnoAsignado = null</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 3: BOTONES ADAPTATIVOS */}
          <TabsContent value="botones" className="space-y-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Botones Adaptativos según Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sin pagar */}
                  <Card className="border-2 border-teal-300">
                    <CardHeader className="bg-teal-50">
                      <CardTitle className="text-sm">Estado: SIN PAGAR</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Procesar Pago
                      </Button>
                      <Button variant="outline" className="w-full text-red-600">
                        Vaciar Pedido
                      </Button>
                      <div className="text-xs text-gray-600 mt-4">
                        <p className="font-medium mb-1">Características:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Botón verde grande</li>
                          <li>Abre modal de pago</li>
                          <li>Permite vaciar carrito</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagado */}
                  <Card className="border-2 border-yellow-300">
                    <CardHeader className="bg-yellow-50">
                      <CardTitle className="text-sm">Estado: PAGADO</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                        <Package className="w-4 h-4 mr-2" />
                        Entregar
                      </Button>
                      <Button variant="outline" className="w-full">
                        Reimprimir
                      </Button>
                      <div className="text-xs text-gray-600 mt-4">
                        <p className="font-medium mb-1">Características:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Botón amarillo grande</li>
                          <li>Marca como entregado</li>
                          <li>Opción de reimprimir</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Entregado */}
                  <Card className="border-2 border-blue-300">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-sm">Estado: ENTREGADO</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                        <Check className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-medium text-blue-700 text-sm">Completado</p>
                      </div>
                      <div className="text-xs text-gray-600 mt-4">
                        <p className="font-medium mb-1">Características:</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Sin botones de acción</li>
                          <li>Mensaje de confirmación</li>
                          <li>Carrito reseteado</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECCIÓN 4: FLUJO COMPLETO */}
          <TabsContent value="flujo" className="space-y-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Flujo Completo: Pago → Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Diagrama de flujo */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 sm:p-8">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="w-16 h-16 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <ShoppingCart className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium">1. Carrito Vacío</p>
                        <p className="text-xs text-gray-600">Estado inicial</p>
                      </div>
                      <div className="text-2xl text-gray-400 px-4">→</div>
                      <div className="text-center flex-1">
                        <div className="w-16 h-16 bg-teal-100 border-2 border-teal-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Package className="w-8 h-8 text-teal-600" />
                        </div>
                        <p className="text-sm font-medium">2. Con Productos</p>
                        <p className="text-xs text-gray-600">Añadir items</p>
                      </div>
                      <div className="text-2xl text-gray-400 px-4">→</div>
                      <div className="text-center flex-1">
                        <div className="w-16 h-16 bg-green-100 border-2 border-green-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CreditCard className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm font-medium">3. Pagado</p>
                        <p className="text-xs text-gray-600">Procesar pago</p>
                      </div>
                      <div className="text-2xl text-gray-400 px-4">→</div>
                      <div className="text-center flex-1">
                        <div className="w-16 h-16 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Check className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium">4. Entregado</p>
                        <p className="text-xs text-gray-600">Completado</p>
                      </div>
                    </div>
                  </div>

                  {/* Código del flujo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gray-900 text-gray-100">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-400">
                          📝 Función procesarPago()
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-mono text-xs space-y-1">
                        <div className="text-blue-400">const nuevoPedido: Pedido = {'{'}</div>
                        <div className="text-white pl-4">...datosCarrito,</div>
                        <div className="text-yellow-400 pl-4">pagado: true, // ← Marca pagado</div>
                        <div className="text-white pl-4">metodoPago: metodoPago,</div>
                        <div className="text-white pl-4">estado: 'en_preparacion'</div>
                        <div className="text-blue-400">{'}'}</div>
                        <div className="text-white mt-2">setPedidos([nuevoPedido, ...pedidos])</div>
                        <div className="text-yellow-400">setPedidoPagado(true) // ← Activa estado</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 text-gray-100">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-400">
                          📦 Función marcarComoEntregado()
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="font-mono text-xs space-y-1">
                        <div className="text-white">setPedidos(pedidos.map(p {'=>'}</div>
                        <div className="text-white pl-4">p.id === pedidoId</div>
                        <div className="text-yellow-400 pl-6">? {'{'} ...p, estado: 'entregado' {'}'}</div>
                        <div className="text-white pl-6">: p</div>
                        <div className="text-white">))</div>
                        <div className="text-white mt-2">// Resetear</div>
                        <div className="text-white">setCarrito([])</div>
                        <div className="text-white">setPedidoIniciado(false)</div>
                        <div className="text-white">setTurnoAsignado(null)</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer con estadísticas */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl text-green-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>2</p>
                <p className="text-sm text-green-600">Modales Nuevos</p>
              </div>
              <div>
                <p className="text-3xl text-green-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>6</p>
                <p className="text-sm text-green-600">Operaciones de Caja</p>
              </div>
              <div>
                <p className="text-3xl text-green-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>4</p>
                <p className="text-sm text-green-600">Métodos de Pago</p>
              </div>
              <div>
                <p className="text-3xl text-green-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>100%</p>
                <p className="text-sm text-green-600">Completado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales reales */}
      <ModalPagoTPV
        isOpen={showModalPago}
        total={totalEjemplo}
        onClose={() => setShowModalPago(false)}
        onConfirmarPago={(metodo, monto) => {
          toast.success(`Pago procesado: ${metodo}${monto ? ` - ${monto}€` : ''}`);
          setShowModalPago(false);
        }}
        onAbrirPagoMixto={() => {
          setShowModalPago(false);
          setShowModalPagoMixto(true);
        }}
        permitirOnline={true}
      />

      <ModalOperacionesTPV
        isOpen={showModalOperaciones}
        onClose={() => setShowModalOperaciones(false)}
        onSeleccionarOperacion={(op) => {
          toast.success(`Operación seleccionada: ${op}`);
        }}
        turnoAbierto={turnoAbierto}
        permisos={{
          hacer_retiradas: true,
          arqueo_caja: true,
          cierre_caja: true
        }}
      />

      {showModalPagoMixto && (
        <ModalPagoMixto
          total={totalEjemplo}
          onClose={() => setShowModalPagoMixto(false)}
          onConfirmar={(m1, monto1, m2, monto2) => {
            toast.success(`Pago mixto: ${m1} ${monto1}€ + ${m2} ${monto2}€`);
            setShowModalPagoMixto(false);
          }}
        />
      )}
    </div>
  );
}