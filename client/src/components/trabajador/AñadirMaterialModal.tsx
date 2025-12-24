import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Package, 
  Search, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2,
  AlertCircle,
  FileText,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Plus,
  Minus,
  Trash2,
  Printer,
  Mail,
  User,
  X,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Material {
  id: string;
  codigo: string;
  nombre: string;
  stock: number;
  minimo: number;
  ubicacion: string;
  categoria: string;
  lote?: string;
  pvp?: number;
}

interface OrdenTrabajo {
  id: string;
  numero: string;
  vehiculo: string;
  matricula: string;
  cliente: string;
  estado: 'abierta' | 'cerrada';
}

interface Cliente {
  id: string;
  nombre: string;
  nif: string;
  tipo: 'empresa' | 'particular' | 'mostrador';
}

interface ArticuloVenta {
  material: Material;
  cantidad: number;
  descuento: number;
}

interface AñadirMaterialModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMaterialRegistrado: (material: any) => void;
  tareaId?: string;
  vehiculo?: string;
  ordenTrabajo?: string;
  modoVentaDirecta?: boolean;
}

export function AñadirMaterialModal({ 
  isOpen, 
  onOpenChange, 
  onMaterialRegistrado,
  tareaId,
  vehiculo,
  ordenTrabajo,
  modoVentaDirecta = false
}: AñadirMaterialModalProps) {
  // Modo: conOT (true) o ventaDirecta (false)
  const [modoConOT, setModoConOT] = useState(!modoVentaDirecta);

  // ===== MODO CON OT =====
  const [busquedaOT, setBusquedaOT] = useState('');
  const [otSeleccionada, setOtSeleccionada] = useState<OrdenTrabajo | null>(null);
  const [busquedaMaterial, setBusquedaMaterial] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [lote, setLote] = useState('');
  const [nota, setNota] = useState('');
  const [esCorreccion, setEsCorreccion] = useState(false);
  const [motivoCorreccion, setMotivoCorreccion] = useState('');

  // ===== MODO VENTA DIRECTA (POS) =====
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nifCliente, setNifCliente] = useState('');
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [articulosVenta, setArticulosVenta] = useState<ArticuloVenta[]>([]);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'tpv' | 'transferencia'>('efectivo');
  const [tipoDocumento, setTipoDocumento] = useState<'ticket' | 'factura'>('ticket');
  const [emailEnvio, setEmailEnvio] = useState('');

  // Stock simulado
  const materialesDisponibles: Material[] = [
    { id: 'M001', codigo: 'ACE001', nombre: 'Aceite Motor 5W30 - 5L', stock: 15, minimo: 5, ubicacion: 'A-12', categoria: 'Lubricantes', pvp: 35.90 },
    { id: 'M002', codigo: 'FIL001', nombre: 'Filtro de Aceite Universal', stock: 8, minimo: 3, ubicacion: 'B-05', categoria: 'Filtros', pvp: 12.50 },
    { id: 'M003', codigo: 'FRE001', nombre: 'Pastillas de Freno Delanteras', stock: 8, minimo: 4, ubicacion: 'C-08', categoria: 'Frenos', pvp: 65.00 },
    { id: 'M004', codigo: 'BAT001', nombre: 'Batería 12V 60Ah', stock: 2, minimo: 3, ubicacion: 'D-15', categoria: 'Electricidad', lote: 'L2024-11', pvp: 129.00 },
    { id: 'M005', codigo: 'NEU001', nombre: 'Neumático 205/55R16', stock: 12, minimo: 8, ubicacion: 'E-20', categoria: 'Neumáticos', pvp: 89.90 },
  ];

  const ordenesTrabajoDisponibles: OrdenTrabajo[] = [
    { id: 'OT001', numero: 'OT-2025-001', vehiculo: 'Toyota Corolla', matricula: '1234ABC', cliente: 'Juan Pérez', estado: 'abierta' },
    { id: 'OT002', numero: 'OT-2025-002', vehiculo: 'Ford Focus', matricula: '5678DEF', cliente: 'María García', estado: 'abierta' },
    { id: 'OT003', numero: 'OT-2025-003', vehiculo: 'VW Golf', matricula: '9012GHI', cliente: 'Pedro López', estado: 'cerrada' },
    { id: 'OT004', numero: 'OT-2025-004', vehiculo: 'Seat Ibiza', matricula: '3456JKL', cliente: 'Ana Martín', estado: 'abierta' },
  ];

  const clientesDisponibles: Cliente[] = [
    { id: 'C001', nombre: 'Juan Pérez', nif: '12345678A', tipo: 'particular' },
    { id: 'C002', nombre: 'María García', nif: '87654321B', tipo: 'particular' },
    { id: 'C003', nombre: 'Talleres AutoMax S.L.', nif: 'B12345678', tipo: 'empresa' },
    { id: 'C004', nombre: 'Venta mostrador', nif: '', tipo: 'mostrador' },
  ];

  // ===== FUNCIONES MODO CON OT =====

  const handleBuscarOT = (busqueda: string, estado?: 'abierta' | 'todas') => {
    let resultados = ordenesTrabajoDisponibles;
    
    if (estado === 'abierta') {
      resultados = resultados.filter(ot => ot.estado === 'abierta');
    }

    const encontrada = resultados.find(
      ot => ot.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
            ot.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
            ot.cliente.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (encontrada) {
      setOtSeleccionada(encontrada);
      toast.success(`OT seleccionada: ${encontrada.numero}`);
      if (encontrada.estado === 'cerrada') {
        setEsCorreccion(true);
      }
    } else {
      toast.error('OT no encontrada');
    }
  };

  const handleBuscarMaterial = () => {
    const encontrado = materialesDisponibles.find(
      m => m.codigo.toLowerCase().includes(busquedaMaterial.toLowerCase()) || 
           m.nombre.toLowerCase().includes(busquedaMaterial.toLowerCase())
    );
    
    if (encontrado) {
      setMaterialSeleccionado(encontrado);
      setUbicacion(encontrado.ubicacion);
      setLote(encontrado.lote || '');
      toast.success(`Material encontrado: ${encontrado.nombre}`);
    } else {
      toast.error('Material no encontrado');
      setMaterialSeleccionado(null);
    }
  };

  const handleEscanearMaterial = () => {
    toast.info('Escaneando código...');
    setTimeout(() => {
      const random = materialesDisponibles[Math.floor(Math.random() * materialesDisponibles.length)];
      setBusquedaMaterial(random.codigo);
      setMaterialSeleccionado(random);
      setUbicacion(random.ubicacion);
      setLote(random.lote || '');
      toast.success(`Código escaneado: ${random.codigo}`);
    }, 1000);
  };

  const handleGuardarConsumoOT = (solicitarReposicion = false) => {
    if (!materialSeleccionado) {
      toast.error('Selecciona un material');
      return;
    }

    if (!otSeleccionada) {
      toast.error('Selecciona una orden de trabajo');
      return;
    }

    if (!cantidad || parseInt(cantidad) <= 0) {
      toast.error('Introduce una cantidad válida');
      return;
    }

    if (esCorreccion && !motivoCorreccion.trim()) {
      toast.error('Introduce el motivo de la corrección');
      return;
    }

    const cantidadNum = parseInt(cantidad);

    if (cantidadNum > materialSeleccionado.stock) {
      toast.error(`Stock insuficiente. Disponible: ${materialSeleccionado.stock}`);
      return;
    }

    const consumo = {
      id: `CONS-${Date.now()}`,
      tipo: esCorreccion ? 'correccion' : 'ot',
      materialId: materialSeleccionado.id,
      material: materialSeleccionado.nombre,
      codigo: materialSeleccionado.codigo,
      cantidad: cantidadNum,
      ubicacion,
      lote,
      nota,
      ot: otSeleccionada.numero,
      vehiculo: otSeleccionada.vehiculo,
      matricula: otSeleccionada.matricula,
      cliente: otSeleccionada.cliente,
      esCorreccion,
      motivoCorreccion: esCorreccion ? motivoCorreccion : undefined,
      fecha: new Date().toISOString(),
      stockAnterior: materialSeleccionado.stock,
      stockNuevo: materialSeleccionado.stock - cantidadNum,
    };

    onMaterialRegistrado(consumo);

    // Verificar si queda por debajo del mínimo o si se solicita reposición
    const stockNuevo = materialSeleccionado.stock - cantidadNum;
    if (solicitarReposicion || stockNuevo < materialSeleccionado.minimo) {
      toast.warning(
        `Solicitud de reposición enviada al Gerente`,
        { duration: 4000 }
      );
      console.log('[NOTIFICACIÓN GERENTE] Solicitud de reposición:', {
        material: materialSeleccionado.nombre,
        codigo: materialSeleccionado.codigo,
        stockActual: stockNuevo,
        minimo: materialSeleccionado.minimo,
        cantidad: materialSeleccionado.minimo * 2,
        solicitadoPor: 'Colaborador',
        automatica: !solicitarReposicion
      });
    }

    if (esCorreccion) {
      console.log('[NOTIFICACIÓN GERENTE] Corrección en OT cerrada:', {
        ot: otSeleccionada.numero,
        material: materialSeleccionado.nombre,
        cantidad: cantidadNum,
        motivo: motivoCorreccion,
        colaborador: 'Usuario actual'
      });
    }

    toast.success(esCorreccion ? 'Corrección registrada' : 'Consumo registrado correctamente');
    resetForm();
    onOpenChange(false);
  };

  // ===== FUNCIONES MODO VENTA DIRECTA (POS) =====

  const handleSeleccionarCliente = (clienteId: string) => {
    const cliente = clientesDisponibles.find(c => c.id === clienteId);
    if (cliente) {
      setClienteSeleccionado(cliente);
      setNifCliente(cliente.nif);
    }
  };

  const handleBuscarArticulo = () => {
    const encontrado = materialesDisponibles.find(
      m => m.codigo.toLowerCase().includes(busquedaArticulo.toLowerCase()) || 
           m.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
    );
    
    if (encontrado) {
      if (encontrado.stock === 0) {
        toast.error('Sin stock disponible');
        return;
      }
      
      // Añadir o incrementar cantidad
      const existente = articulosVenta.find(a => a.material.id === encontrado.id);
      if (existente) {
        if (existente.cantidad >= encontrado.stock) {
          toast.error(`Stock máximo alcanzado: ${encontrado.stock}`);
          return;
        }
        setArticulosVenta(articulosVenta.map(a => 
          a.material.id === encontrado.id 
            ? { ...a, cantidad: a.cantidad + 1 }
            : a
        ));
      } else {
        setArticulosVenta([...articulosVenta, { material: encontrado, cantidad: 1, descuento: 0 }]);
      }
      
      setBusquedaArticulo('');
      toast.success(`${encontrado.nombre} añadido`);
    } else {
      toast.error('Artículo no encontrado');
    }
  };

  const handleEscanearArticulo = () => {
    toast.info('Escaneando código...');
    setTimeout(() => {
      const random = materialesDisponibles.filter(m => m.stock > 0)[
        Math.floor(Math.random() * materialesDisponibles.filter(m => m.stock > 0).length)
      ];
      if (random) {
        setBusquedaArticulo(random.codigo);
        handleBuscarArticulo();
      }
    }, 1000);
  };

  const handleCambiarCantidad = (materialId: string, delta: number) => {
    setArticulosVenta(articulosVenta.map(a => {
      if (a.material.id === materialId) {
        const nuevaCantidad = a.cantidad + delta;
        if (nuevaCantidad <= 0) return a; // No permitir 0 (usar eliminar)
        if (nuevaCantidad > a.material.stock) {
          toast.error(`Stock máximo: ${a.material.stock}`);
          return a;
        }
        return { ...a, cantidad: nuevaCantidad };
      }
      return a;
    }));
  };

  const handleEliminarArticulo = (materialId: string) => {
    setArticulosVenta(articulosVenta.filter(a => a.material.id !== materialId));
  };

  const handleCambiarDescuento = (materialId: string, descuento: number) => {
    const descuentoNum = Math.max(0, Math.min(100, descuento));
    
    // Si el descuento supera el 20%, notificar al gerente
    if (descuentoNum > 20) {
      console.log('[NOTIFICACIÓN GERENTE] Descuento superior al umbral:', {
        colaborador: 'Usuario actual',
        descuento: `${descuentoNum}%`,
        articulo: articulosVenta.find(a => a.material.id === materialId)?.material.nombre,
        requiereAprobacion: true
      });
    }

    setArticulosVenta(articulosVenta.map(a => 
      a.material.id === materialId ? { ...a, descuento: descuentoNum } : a
    ));
  };

  const calcularSubtotal = () => {
    return articulosVenta.reduce((sum, a) => {
      const precioConDescuento = (a.material.pvp || 0) * (1 - a.descuento / 100);
      return sum + (precioConDescuento * a.cantidad);
    }, 0);
  };

  const calcularIVA = () => {
    return calcularSubtotal() * 0.21; // IVA 21%
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIVA();
  };

  const handleCobrar = () => {
    if (!clienteSeleccionado) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (articulosVenta.length === 0) {
      toast.error('Añade al menos un artículo');
      return;
    }

    if (tipoDocumento === 'factura' && !nifCliente) {
      toast.error('Introduce el NIF para emitir factura');
      return;
    }

    const venta = {
      id: `VD-${Date.now()}`,
      tipo: 'venta_directa',
      cliente: clienteSeleccionado.nombre,
      nif: nifCliente,
      tipoCliente: clienteSeleccionado.tipo,
      articulos: articulosVenta.map(a => ({
        materialId: a.material.id,
        material: a.material.nombre,
        codigo: a.material.codigo,
        cantidad: a.cantidad,
        pvp: a.material.pvp,
        descuento: a.descuento,
        subtotal: (a.material.pvp || 0) * (1 - a.descuento / 100) * a.cantidad
      })),
      subtotal: calcularSubtotal(),
      iva: calcularIVA(),
      total: calcularTotal(),
      metodoPago,
      tipoDocumento,
      fecha: new Date().toISOString(),
    };

    onMaterialRegistrado(venta);

    // Generar PDF simulado
    console.log(`[PDF] Generando ${tipoDocumento}:`, venta);
    
    toast.success(
      `${tipoDocumento === 'ticket' ? 'Ticket' : 'Factura'} emitido: ${venta.total.toFixed(2)}€`,
      { duration: 4000 }
    );

    // Si hay email, enviar
    if (emailEnvio) {
      setTimeout(() => {
        toast.success(`${tipoDocumento} enviado a ${emailEnvio}`);
        console.log(`[EMAIL] ${tipoDocumento} enviado a:`, emailEnvio);
      }, 500);
    }

    // Verificar descuentos altos y notificar
    const descuentosAltos = articulosVenta.filter(a => a.descuento > 20);
    if (descuentosAltos.length > 0) {
      console.log('[NOTIFICACIÓN GERENTE] Venta con descuentos superiores al umbral:', {
        venta: venta.id,
        total: venta.total,
        descuentos: descuentosAltos.map(a => ({
          articulo: a.material.nombre,
          descuento: `${a.descuento}%`
        }))
      });
    }

    resetForm();
    onOpenChange(false);
  };

  // ===== RESET =====

  const resetForm = () => {
    // Con OT
    setBusquedaOT('');
    setOtSeleccionada(null);
    setBusquedaMaterial('');
    setMaterialSeleccionado(null);
    setCantidad('');
    setUbicacion('');
    setLote('');
    setNota('');
    setEsCorreccion(false);
    setMotivoCorreccion('');

    // Venta Directa
    setClienteSeleccionado(null);
    setNifCliente('');
    setBusquedaArticulo('');
    setArticulosVenta([]);
    setMetodoPago('efectivo');
    setTipoDocumento('ticket');
    setEmailEnvio('');
  };

  const getStockBadge = (material: Material) => {
    if (material.stock === 0) {
      return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Sin stock</Badge>;
    } else if (material.stock < material.minimo) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Stock bajo</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Disponible</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Material utilizado
              </DialogTitle>
              <DialogDescription className="text-left">
                {modoConOT ? 'Registra el material consumido en una OT' : 'Venta directa de material'}
              </DialogDescription>
            </div>
          </div>

          {/* Selector de modo */}
          <div className="flex gap-2 pt-4">
            <Button
              variant={modoConOT ? 'default' : 'outline'}
              onClick={() => {
                setModoConOT(true);
                resetForm();
              }}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Con OT
            </Button>
            <Button
              variant={!modoConOT ? 'default' : 'outline'}
              onClick={() => {
                setModoConOT(false);
                resetForm();
              }}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Venta directa
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* ===== MODO CON OT ===== */}
          {modoConOT && (
            <div className="space-y-4">
              {/* Buscar OT */}
              <div className="space-y-2">
                <Label>Orden de Trabajo *</Label>
                <Tabs defaultValue="abiertas" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="abiertas">Abiertas</TabsTrigger>
                    <TabsTrigger value="todas">Todas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="abiertas" className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar por OT, matrícula o cliente..."
                        value={busquedaOT}
                        onChange={(e) => setBusquedaOT(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBuscarOT(busquedaOT, 'abierta')}
                      />
                      <Button onClick={() => handleBuscarOT(busquedaOT, 'abierta')} variant="outline">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="todas" className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar por OT, matrícula o cliente..."
                        value={busquedaOT}
                        onChange={(e) => setBusquedaOT(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBuscarOT(busquedaOT, 'todas')}
                      />
                      <Button onClick={() => handleBuscarOT(busquedaOT, 'todas')} variant="outline">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {otSeleccionada && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {otSeleccionada.numero} - {otSeleccionada.vehiculo}
                        </p>
                        <p className="text-sm text-blue-700">
                          {otSeleccionada.matricula} · Cliente: {otSeleccionada.cliente}
                        </p>
                      </div>
                      <Badge variant={otSeleccionada.estado === 'abierta' ? 'default' : 'outline'}>
                        {otSeleccionada.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Buscar Material */}
              <div className="space-y-2">
                <Label htmlFor="busqueda-material">Buscar material (código o nombre) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="busqueda-material"
                    placeholder="Ej: ACE001 o Aceite..."
                    value={busquedaMaterial}
                    onChange={(e) => setBusquedaMaterial(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarMaterial()}
                  />
                  <Button onClick={handleBuscarMaterial} variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button onClick={handleEscanearMaterial} variant="outline">
                    <QrCode className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Material seleccionado */}
              {materialSeleccionado && (
                <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-blue-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {materialSeleccionado.nombre}
                        </h4>
                        {getStockBadge(materialSeleccionado)}
                      </div>
                      <p className="text-sm text-blue-700">
                        Código: {materialSeleccionado.codigo} · Stock: {materialSeleccionado.stock} · Mínimo: {materialSeleccionado.minimo}
                      </p>
                    </div>
                  </div>

                  {materialSeleccionado.stock === 0 && (
                    <Alert className="border-red-200 bg-red-50 mb-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-700">
                        <strong>Stock agotado.</strong> No puedes registrar consumo.
                      </AlertDescription>
                    </Alert>
                  )}

                  {materialSeleccionado.stock > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cantidad">Cantidad *</Label>
                          <Input
                            id="cantidad"
                            type="number"
                            min="1"
                            max={materialSeleccionado.stock}
                            placeholder="1"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ubicacion">Ubicación</Label>
                          <Input
                            id="ubicacion"
                            placeholder="Ej: A-12"
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="lote">Lote (opcional)</Label>
                          <Input
                            id="lote"
                            placeholder="Ej: L2024-11"
                            value={lote}
                            onChange={(e) => setLote(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Checkbox Corrección */}
                      {otSeleccionada?.estado === 'cerrada' && (
                        <div className="space-y-3 pt-3 border-t border-blue-300">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="correccion" 
                              checked={esCorreccion}
                              onCheckedChange={(checked) => setEsCorreccion(checked as boolean)}
                            />
                            <Label 
                              htmlFor="correccion"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Corrección (OT cerrada)
                            </Label>
                          </div>

                          {esCorreccion && (
                            <div className="space-y-2 pl-6">
                              <Label htmlFor="motivo-correccion">Motivo de la corrección *</Label>
                              <Textarea
                                id="motivo-correccion"
                                placeholder="Explica por qué se registra material en una OT cerrada..."
                                value={motivoCorreccion}
                                onChange={(e) => setMotivoCorreccion(e.target.value)}
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="nota">Notas (opcional)</Label>
                <Textarea
                  id="nota"
                  placeholder="Información adicional sobre el consumo..."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* ===== MODO VENTA DIRECTA (POS) ===== */}
          {!modoConOT && (
            <div className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Select 
                    value={clienteSeleccionado?.id || ''} 
                    onValueChange={handleSeleccionarCliente}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesDisponibles.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.tipo === 'empresa' && '(Empresa)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    id="nif"
                    placeholder="NIF (para factura)"
                    value={nifCliente}
                    onChange={(e) => setNifCliente(e.target.value)}
                    disabled={clienteSeleccionado?.tipo === 'mostrador'}
                  />
                </div>
              </div>

              {clienteSeleccionado && (
                <>
                  {/* Buscar artículo */}
                  <div className="space-y-2">
                    <Label htmlFor="busqueda-articulo">Añadir artículo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="busqueda-articulo"
                        placeholder="Buscar por código o nombre..."
                        value={busquedaArticulo}
                        onChange={(e) => setBusquedaArticulo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBuscarArticulo()}
                      />
                      <Button onClick={handleBuscarArticulo} variant="outline">
                        <Search className="w-4 h-4" />
                      </Button>
                      <Button onClick={handleEscanearArticulo} variant="outline">
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Lista de artículos */}
                  {articulosVenta.length > 0 && (
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Artículo</TableHead>
                              <TableHead className="text-center">Cant.</TableHead>
                              <TableHead className="text-right">PVP</TableHead>
                              <TableHead className="text-center">Dto.%</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {articulosVenta.map((articulo) => {
                              const precioConDescuento = (articulo.material.pvp || 0) * (1 - articulo.descuento / 100);
                              const subtotal = precioConDescuento * articulo.cantidad;
                              
                              return (
                                <TableRow key={articulo.material.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium text-sm">{articulo.material.nombre}</p>
                                      <p className="text-xs text-gray-500">{articulo.material.codigo}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleCambiarCantidad(articulo.material.id, -1)}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-8 text-center font-medium">{articulo.cantidad}</span>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleCambiarCantidad(articulo.material.id, 1)}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {(articulo.material.pvp || 0).toFixed(2)}€
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={articulo.descuento}
                                      onChange={(e) => handleCambiarDescuento(
                                        articulo.material.id, 
                                        parseFloat(e.target.value) || 0
                                      )}
                                      className="h-7 w-16 text-center text-sm"
                                    />
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {subtotal.toFixed(2)}€
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleEliminarArticulo(articulo.material.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>

                        {/* Totales */}
                        <div className="p-4 bg-gray-50 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">{calcularSubtotal().toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">IVA (21%):</span>
                            <span className="font-medium">{calcularIVA().toFixed(2)}€</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Total:</span>
                            <span className="font-medium text-xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {calcularTotal().toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Método de pago */}
                  {articulosVenta.length > 0 && (
                    <div className="space-y-3">
                      <Label>Método de pago</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                          variant={metodoPago === 'efectivo' ? 'default' : 'outline'}
                          onClick={() => setMetodoPago('efectivo')}
                          className="h-auto py-3 flex-col gap-1"
                        >
                          <Banknote className="w-5 h-5" />
                          <span className="text-xs">Efectivo</span>
                        </Button>
                        <Button
                          variant={metodoPago === 'tarjeta' ? 'default' : 'outline'}
                          onClick={() => setMetodoPago('tarjeta')}
                          className="h-auto py-3 flex-col gap-1"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span className="text-xs">Tarjeta</span>
                        </Button>
                        <Button
                          variant={metodoPago === 'tpv' ? 'default' : 'outline'}
                          onClick={() => setMetodoPago('tpv')}
                          className="h-auto py-3 flex-col gap-1"
                        >
                          <Smartphone className="w-5 h-5" />
                          <span className="text-xs">TPV</span>
                        </Button>
                        <Button
                          variant={metodoPago === 'transferencia' ? 'default' : 'outline'}
                          onClick={() => setMetodoPago('transferencia')}
                          className="h-auto py-3 flex-col gap-1"
                        >
                          <Building className="w-5 h-5" />
                          <span className="text-xs">Transfer.</span>
                        </Button>
                      </div>

                      {/* Tipo de documento */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Tipo de documento</Label>
                          <Select value={tipoDocumento} onValueChange={(v) => setTipoDocumento(v as 'ticket' | 'factura')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ticket">Ticket</SelectItem>
                              <SelectItem value="factura">Factura</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email-envio">Email (opcional)</Label>
                          <Input
                            id="email-envio"
                            type="email"
                            placeholder="cliente@email.com"
                            value={emailEnvio}
                            onChange={(e) => setEmailEnvio(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          
          {modoConOT ? (
            <>
              {materialSeleccionado?.stock > 0 && otSeleccionada && (
                <>
                  <Button
                    onClick={() => handleGuardarConsumoOT(false)}
                    disabled={!cantidad || (esCorreccion && !motivoCorreccion.trim())}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Guardar consumo
                  </Button>
                  <Button
                    onClick={() => handleGuardarConsumoOT(true)}
                    disabled={!cantidad || (esCorreccion && !motivoCorreccion.trim())}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Guardar + Solicitar
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {articulosVenta.length > 0 && clienteSeleccionado && (
                <Button
                  onClick={handleCobrar}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Cobrar y emitir {tipoDocumento}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}