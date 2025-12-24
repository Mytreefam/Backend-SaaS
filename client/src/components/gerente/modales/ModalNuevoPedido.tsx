import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Separator } from '../../ui/separator';
import { Checkbox } from '../../ui/checkbox';
import { 
  Filter,
  Package,
  ShoppingCart,
  Send,
  ChevronRight,
  ChevronLeft,
  Mail,
  MessageCircle,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ArticuloPedido {
  id: string;
  codigo: string;
  nombre: string;
  marca: string;
  pdv: string;
  categoria: string;
  stockDisponible: number;
  stockMinimo: number;
  stockOptimo: number;
  cantidadSugerida: number;
  ultimoCoste: number;
  proveedorSugeridoId: string;
  proveedorSugerido: string;
  proveedorSeleccionado?: string;
  proveedorSeleccionadoId?: string;
  cantidadPedir: number;
  incluido: boolean;
}

interface PedidoPorProveedor {
  proveedorId: string;
  proveedorNombre: string;
  email?: string;
  whatsapp?: string;
  preferencia: 'email' | 'whatsapp';
  articulos: ArticuloPedido[];
  total: number;
  notas: string;
}

interface ModalNuevoPedidoProps {
  open: boolean;
  onClose: () => void;
}

export function ModalNuevoPedido({ open, onClose }: ModalNuevoPedidoProps) {
  const [paso, setPaso] = useState(1);
  
  // PASO 1: Filtros
  const [filtros, setFiltros] = useState({
    marca: '',
    pdv: '',
    categoria: '',
    proveedor: '',
    soloStockCritico: false
  });

  // PASO 2: Artículos con sugerencias
  const [articulos, setArticulos] = useState<ArticuloPedido[]>([
    {
      id: 'ART001',
      codigo: 'CAF-COL-001',
      nombre: 'Café Arábica Colombia',
      marca: 'Premium',
      pdv: 'Cafetería Central',
      categoria: 'Café',
      stockDisponible: 5,
      stockMinimo: 10,
      stockOptimo: 50,
      cantidadSugerida: 45, // stock_optimo - stock_disponible
      ultimoCoste: 12.50,
      proveedorSugeridoId: 'PROV001',
      proveedorSugerido: 'Cafés del Mundo S.L.',
      proveedorSeleccionadoId: 'PROV001',
      proveedorSeleccionado: 'Cafés del Mundo S.L.',
      cantidadPedir: 45,
      incluido: true
    },
    {
      id: 'ART002',
      codigo: 'CAF-VIE-002',
      nombre: 'Café Robusta Vietnam',
      marca: 'Premium',
      pdv: 'Cafetería Norte',
      categoria: 'Café',
      stockDisponible: 8,
      stockMinimo: 15,
      stockOptimo: 60,
      cantidadSugerida: 52,
      ultimoCoste: 10.80,
      proveedorSugeridoId: 'PROV002',
      proveedorSugerido: 'Tostadores Premium',
      proveedorSeleccionadoId: 'PROV002',
      proveedorSeleccionado: 'Tostadores Premium',
      cantidadPedir: 52,
      incluido: true
    },
    {
      id: 'ART003',
      codigo: 'CAF-BLE-003',
      nombre: 'Café Blend House',
      marca: 'House',
      pdv: 'Cafetería Central',
      categoria: 'Café',
      stockDisponible: 12,
      stockMinimo: 20,
      stockOptimo: 80,
      cantidadSugerida: 68,
      ultimoCoste: 9.50,
      proveedorSugeridoId: 'PROV001',
      proveedorSugerido: 'Cafés del Mundo S.L.',
      proveedorSeleccionadoId: 'PROV001',
      proveedorSeleccionado: 'Cafés del Mundo S.L.',
      cantidadPedir: 68,
      incluido: true
    }
  ]);

  // PASO 3 y 4: Agrupación por proveedor
  const [pedidosPorProveedor, setPedidosPorProveedor] = useState<PedidoPorProveedor[]>([]);

  // PASO 5: Confirmación y envío
  const [pedidosEnviados, setPedidosEnviados] = useState(0);

  const aplicarFiltros = () => {
    console.log('🔌 EVENTO: APLICAR_FILTROS_PEDIDO', {
      filtros,
      timestamp: new Date()
    });
    
    // Aqu�� se haría la llamada a GET /stock?filtros=...
    toast.success('Filtros aplicados', {
      description: `Se encontraron ${articulos.length} artículos`
    });
    
    setPaso(2);
  };

  const actualizarArticulo = (id: string, campo: string, valor: any) => {
    setArticulos(articulos.map(art => 
      art.id === id ? { ...art, [campo]: valor } : art
    ));
  };

  const generarAgrupacion = () => {
    // Filtrar solo artículos incluidos
    const articulosIncluidos = articulos.filter(a => a.incluido);
    
    if (articulosIncluidos.length === 0) {
      toast.error('Error', {
        description: 'Debe seleccionar al menos un artículo'
      });
      return;
    }

    // Agrupar por proveedor
    const agrupacion: { [key: string]: PedidoPorProveedor } = {};
    
    articulosIncluidos.forEach(art => {
      const provId = art.proveedorSeleccionadoId || art.proveedorSugeridoId;
      const provNombre = art.proveedorSeleccionado || art.proveedorSugerido;
      
      if (!agrupacion[provId]) {
        agrupacion[provId] = {
          proveedorId: provId,
          proveedorNombre: provNombre,
          email: provId === 'PROV001' ? 'pedidos@cafesdelmundo.com' : 'pedidos@tostadores.com',
          whatsapp: provId === 'PROV001' ? '+34900111222' : '+34900333444',
          preferencia: 'whatsapp',
          articulos: [],
          total: 0,
          notas: ''
        };
      }
      
      agrupacion[provId].articulos.push(art);
      agrupacion[provId].total += art.cantidadPedir * art.ultimoCoste;
    });

    const pedidos = Object.values(agrupacion);
    setPedidosPorProveedor(pedidos);
    
    console.log('🔌 EVENTO: AGRUPAR_PEDIDO_POR_PROVEEDOR', {
      totalProveedores: pedidos.length,
      agrupacion: pedidos.map(p => ({
        proveedorId: p.proveedorId,
        totalArticulos: p.articulos.length,
        total: p.total
      })),
      timestamp: new Date()
    });
    
    setPaso(3);
  };

  const enviarPedido = (pedido: PedidoPorProveedor) => {
    console.log('🔌 EVENTO: ENVIAR_PEDIDO', {
      proveedorId: pedido.proveedorId,
      preferencia: pedido.preferencia,
      articulos: pedido.articulos.map(a => ({
        articuloId: a.id,
        cantidad: a.cantidadPedir,
        precio: a.ultimoCoste
      })),
      total: pedido.total,
      notas: pedido.notas,
      timestamp: new Date(),
      canal: pedido.preferencia
    });

    // Simular envío
    if (pedido.preferencia === 'whatsapp' && pedido.whatsapp) {
      const mensaje = `Hola, necesitamos realizar un pedido:%0A%0A${pedido.articulos.map(a => 
        `• ${a.nombre}: ${a.cantidadPedir} uds`
      ).join('%0A')}%0A%0ATotal: €${pedido.total.toFixed(2)}%0A%0ANotas: ${pedido.notas}`;
      
      const url = `https://wa.me/${pedido.whatsapp.replace(/\D/g, '')}?text=${mensaje}`;
      
      console.log('📱 WhatsApp URI:', url);
      // window.open(url, '_blank'); // Descomentar para enviar realmente
    } else if (pedido.preferencia === 'email' && pedido.email) {
      const asunto = `Pedido de Material - ${new Date().toLocaleDateString()}`;
      const cuerpo = `Hola,%0A%0ANecesitamos realizar el siguiente pedido:%0A%0A${pedido.articulos.map(a => 
        `• ${a.nombre}: ${a.cantidadPedir} uds - €${(a.cantidadPedir * a.ultimoCoste).toFixed(2)}`
      ).join('%0A')}%0A%0ATotal: €${pedido.total.toFixed(2)}%0A%0ANotas: ${pedido.notas}%0A%0ASaludos`;
      
      const url = `mailto:${pedido.email}?subject=${asunto}&body=${cuerpo}`;
      
      console.log('📧 Email URI:', url);
      // window.location.href = url; // Descomentar para enviar realmente
    }

    // Guardar en BBDD
    console.log('🔌 EVENTO: GUARDAR_PEDIDO_BBDD', {
      endpoint: 'POST /pedido',
      pedido: {
        proveedorId: pedido.proveedorId,
        total: pedido.total,
        estado: 'enviado',
        notas: pedido.notas
      },
      detalles: {
        endpoint: 'POST /pedido/detalles',
        lineas: pedido.articulos.map(a => ({
          articuloId: a.id,
          cantidad: a.cantidadPedir,
          precioUnitario: a.ultimoCoste
        }))
      }
    });

    toast.success('Pedido enviado', {
      description: `Pedido enviado a ${pedido.proveedorNombre} por ${pedido.preferencia === 'whatsapp' ? 'WhatsApp' : 'Email'}`
    });

    setPedidosEnviados(prev => prev + 1);
  };

  const enviarTodos = () => {
    pedidosPorProveedor.forEach(pedido => {
      setTimeout(() => enviarPedido(pedido), 500);
    });
    
    setTimeout(() => {
      setPaso(5);
    }, 1000);
  };

  const actualizarNotasPedido = (proveedorId: string, notas: string) => {
    setPedidosPorProveedor(pedidosPorProveedor.map(p =>
      p.proveedorId === proveedorId ? { ...p, notas } : p
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Nuevo Pedido a Proveedores
          </DialogTitle>
          <DialogDescription>
            Crea y gestiona pedidos para tus proveedores en pasos sencillos
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de Pasos */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                paso >= num ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {paso > num ? <Check className="w-5 h-5" /> : num}
              </div>
              {num < 5 && (
                <div className={`h-1 w-20 mx-2 ${
                  paso > num ? 'bg-teal-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* PASO 1: FILTROS */}
        {paso === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600 mb-4">
              <Filter className="w-5 h-5" />
              <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Paso 1: Filtrar Productos
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Marca</Label>
                <Select value={filtros.marca} onValueChange={(val) => setFiltros({...filtros, marca: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las marcas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>PDV (Punto de Venta)</Label>
                <Select value={filtros.pdv} onValueChange={(val) => setFiltros({...filtros, pdv: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los PDV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="central">Cafetería Central</SelectItem>
                    <SelectItem value="norte">Cafetería Norte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoría</Label>
                <Select value={filtros.categoria} onValueChange={(val) => setFiltros({...filtros, categoria: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="te">Té</SelectItem>
                    <SelectItem value="chocolate">Chocolate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Proveedor</Label>
                <Select value={filtros.proveedor} onValueChange={(val) => setFiltros({...filtros, proveedor: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los proveedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PROV001">Cafés del Mundo S.L.</SelectItem>
                    <SelectItem value="PROV002">Tostadores Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="critico"
                checked={filtros.soloStockCritico}
                onCheckedChange={(checked) => setFiltros({...filtros, soloStockCritico: checked as boolean})}
              />
              <label htmlFor="critico" className="text-sm cursor-pointer">
                Mostrar solo productos con stock crítico (por debajo del mínimo)
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={aplicarFiltros}
              >
                Aplicar Filtros y Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 2: RESUMEN AUTOMÁTICO */}
        {paso === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600 mb-4">
              <Package className="w-5 h-5" />
              <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Paso 2: Revisar Cantidades Sugeridas
              </h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Cantidad Sugerida = Stock Óptimo - Stock Disponible</strong>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Puedes modificar las cantidades o deseleccionar artículos que no necesites pedir
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Artículo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>PDV</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Sugerida</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Último Coste</TableHead>
                    <TableHead>Proveedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articulos.map((art) => (
                    <TableRow key={art.id}>
                      <TableCell>
                        <Checkbox 
                          checked={art.incluido}
                          onCheckedChange={(checked) => actualizarArticulo(art.id, 'incluido', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{art.nombre}</p>
                          <p className="text-xs text-gray-500">{art.codigo}</p>
                        </div>
                      </TableCell>
                      <TableCell>{art.marca}</TableCell>
                      <TableCell>{art.pdv}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={art.stockDisponible < art.stockMinimo ? 'destructive' : 'outline'}>
                          {art.stockDisponible}/{art.stockMinimo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-teal-600">
                        {art.cantidadSugerida}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input 
                          type="number"
                          min="0"
                          value={art.cantidadPedir}
                          onChange={(e) => actualizarArticulo(art.id, 'cantidadPedir', Number(e.target.value))}
                          className="w-20 text-right"
                          disabled={!art.incluido}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        €{art.ultimoCoste.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={art.proveedorSeleccionadoId}
                          onValueChange={(val) => {
                            actualizarArticulo(art.id, 'proveedorSeleccionadoId', val);
                            const nombre = val === 'PROV001' ? 'Cafés del Mundo S.L.' : 'Tostadores Premium';
                            actualizarArticulo(art.id, 'proveedorSeleccionado', nombre);
                          }}
                          disabled={!art.incluido}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROV001">Cafés del Mundo S.L.</SelectItem>
                            <SelectItem value="PROV002">Tostadores Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setPaso(1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={generarAgrupacion}
              >
                Agrupar por Proveedor
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* PASO 3 y 4: RESUMEN POR PROVEEDOR */}
        {paso === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-teal-600 mb-4">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Paso 3: Revisar Pedidos por Proveedor
              </h3>
            </div>

            <div className="space-y-6">
              {pedidosPorProveedor.map((pedido) => (
                <div key={pedido.proveedorId} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-lg">{pedido.proveedorNombre}</h4>
                      <p className="text-sm text-gray-500">{pedido.articulos.length} artículos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-teal-600">€{pedido.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artículo</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedido.articulos.map((art) => (
                          <TableRow key={art.id}>
                            <TableCell>{art.nombre}</TableCell>
                            <TableCell className="text-right">{art.cantidadPedir}</TableCell>
                            <TableCell className="text-right">€{art.ultimoCoste.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              €{(art.cantidadPedir * art.ultimoCoste).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-4">
                    <Label>Notas para el proveedor</Label>
                    <Textarea 
                      placeholder="Añadir observaciones..."
                      value={pedido.notas}
                      onChange={(e) => actualizarNotasPedido(pedido.proveedorId, e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {pedido.preferencia === 'whatsapp' ? (
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Mail className="w-4 h-4 text-blue-600" />
                      )}
                      <span>
                        Se enviará por {pedido.preferencia === 'whatsapp' ? 'WhatsApp' : 'Email'} a{' '}
                        {pedido.preferencia === 'whatsapp' ? pedido.whatsapp : pedido.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setPaso(2)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={enviarTodos}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Todos los Pedidos
              </Button>
            </div>
          </div>
        )}

        {/* PASO 5: CONFIRMACIÓN */}
        {paso === 5 && (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ¡Pedidos Enviados!
              </h3>
              <p className="text-gray-600">
                Se han enviado {pedidosPorProveedor.length} pedidos a los proveedores correctamente
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
              <h4 className="font-medium mb-4">Resumen</h4>
              <div className="space-y-2 text-sm">
                {pedidosPorProveedor.map((pedido) => (
                  <div key={pedido.proveedorId} className="flex justify-between">
                    <span>{pedido.proveedorNombre}</span>
                    <span className="font-medium">€{pedido.total.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>€{pedidosPorProveedor.reduce((sum, p) => sum + p.total, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={onClose}
            >
              Finalizar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
