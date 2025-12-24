import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  Euro,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface OperacionCaja {
  id: string;
  tipo: 'apertura' | 'retirada' | 'consumo_propio' | 'arqueo' | 'cierre' | 'devolucion';
  monto: number;
  fecha: Date;
  usuario: string;
  notas?: string;
  pedidoId?: string;
  metodoPago?: 'efectivo' | 'tarjeta';
}

interface TurnoCaja {
  id: string;
  fechaApertura: Date;
  fechaCierre?: Date;
  montoCajaInicial: number;
  montoCajaFinal?: number;
  efectivoTeorico: number;
  efectivoReal?: number;
  diferencia?: number;
  usuario: string;
  abierto: boolean;
}

interface PanelCajaProps {
  permisos: {
    hacer_retiradas: boolean;
    arqueo_caja: boolean;
    cierre_caja: boolean;
    ver_informes_turno: boolean;
  };
  nombreUsuario: string;
}

export function PanelCaja({ permisos, nombreUsuario }: PanelCajaProps) {
  const [turnoActual, setTurnoActual] = useState<TurnoCaja | null>({
    id: 'T001',
    fechaApertura: new Date(),
    montoCajaInicial: 100.00,
    efectivoTeorico: 450.00,
    usuario: nombreUsuario,
    abierto: true
  });

  const [operaciones, setOperaciones] = useState<OperacionCaja[]>([
    {
      id: 'OP001',
      tipo: 'apertura',
      monto: 100.00,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: 'Apertura de caja del turno mañana'
    },
    {
      id: 'OP002',
      tipo: 'retirada',
      monto: 200.00,
      fecha: new Date(Date.now() - 3600000),
      usuario: nombreUsuario,
      notas: 'Retirada intermedia'
    }
  ]);

  // Estados para modales
  const [modalApertura, setModalApertura] = useState(false);
  const [modalRetirada, setModalRetirada] = useState(false);
  const [modalConsumo, setModalConsumo] = useState(false);
  const [modalArqueo, setModalArqueo] = useState(false);
  const [modalCierre, setModalCierre] = useState(false);
  const [modalDevolucion, setModalDevolucion] = useState(false);

  // Estados de formularios
  const [montoApertura, setMontoApertura] = useState('100.00');
  const [montoRetirada, setMontoRetirada] = useState('');
  const [notasRetirada, setNotasRetirada] = useState('');
  const [montoConsumo, setMontoConsumo] = useState('');
  const [notasConsumo, setNotasConsumo] = useState('');
  const [montoDevolucion, setMontoDevolucion] = useState('');
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [pedidoIdDevolucion, setPedidoIdDevolucion] = useState('');
  const [metodoPagoDevolucion, setMetodoPagoDevolucion] = useState<'efectivo' | 'tarjeta'>('efectivo');
  const [efectivoContado, setEfectivoContado] = useState('');

  // Cantidades de billetes y monedas para arqueo/cierre
  const [cantidades, setCantidades] = useState({
    '0.01': 0, '0.02': 0, '0.05': 0, '0.10': 0, '0.20': 0, '0.50': 0,
    '1': 0, '2': 0, '5': 0, '10': 0, '20': 0, '50': 0, '100': 0, '200': 0, '500': 0
  });

  const denominaciones = [
    { valor: '500', label: '500€', tipo: 'billete' },
    { valor: '200', label: '200€', tipo: 'billete' },
    { valor: '100', label: '100€', tipo: 'billete' },
    { valor: '50', label: '50€', tipo: 'billete' },
    { valor: '20', label: '20€', tipo: 'billete' },
    { valor: '10', label: '10€', tipo: 'billete' },
    { valor: '5', label: '5€', tipo: 'billete' },
    { valor: '2', label: '2€', tipo: 'moneda' },
    { valor: '1', label: '1€', tipo: 'moneda' },
    { valor: '0.50', label: '0.50€', tipo: 'moneda' },
    { valor: '0.20', label: '0.20€', tipo: 'moneda' },
    { valor: '0.10', label: '0.10€', tipo: 'moneda' },
    { valor: '0.05', label: '0.05€', tipo: 'moneda' },
    { valor: '0.02', label: '0.02€', tipo: 'moneda' },
    { valor: '0.01', label: '0.01€', tipo: 'moneda' },
  ];

  const calcularTotal = () => {
    return Object.entries(cantidades).reduce((total, [valor, cantidad]) => {
      return total + (parseFloat(valor) * cantidad);
    }, 0);
  };

  const abrirCaja = () => {
    const monto = parseFloat(montoApertura);
    if (isNaN(monto) || monto < 0) {
      toast.error('Monto inválido');
      return;
    }

    const nuevoTurno: TurnoCaja = {
      id: `T${Date.now()}`,
      fechaApertura: new Date(),
      montoCajaInicial: monto,
      efectivoTeorico: monto,
      usuario: nombreUsuario,
      abierto: true
    };

    const nuevaOperacion: OperacionCaja = {
      id: `OP${Date.now()}`,
      tipo: 'apertura',
      monto,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: 'Apertura de caja'
    };

    setTurnoActual(nuevoTurno);
    setOperaciones([nuevaOperacion, ...operaciones]);
    setModalApertura(false);
    toast.success(`Caja abierta con ${monto.toFixed(2)}€`);
  };

  const hacerRetirada = () => {
    if (!permisos.hacer_retiradas) {
      toast.error('No tienes permisos para hacer retiradas');
      return;
    }

    const monto = parseFloat(montoRetirada);
    if (isNaN(monto) || monto <= 0) {
      toast.error('Monto inválido');
      return;
    }

    const nuevaOperacion: OperacionCaja = {
      id: `OP${Date.now()}`,
      tipo: 'retirada',
      monto,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: notasRetirada
    };

    setOperaciones([nuevaOperacion, ...operaciones]);
    
    if (turnoActual) {
      setTurnoActual({
        ...turnoActual,
        efectivoTeorico: turnoActual.efectivoTeorico - monto
      });
    }

    setMontoRetirada('');
    setNotasRetirada('');
    setModalRetirada(false);
    toast.success(`Retirada de ${monto.toFixed(2)}€ registrada`);
  };

  const registrarConsumo = () => {
    const monto = parseFloat(montoConsumo);
    if (isNaN(monto) || monto <= 0) {
      toast.error('Monto inválido');
      return;
    }

    const nuevaOperacion: OperacionCaja = {
      id: `OP${Date.now()}`,
      tipo: 'consumo_propio',
      monto,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: notasConsumo
    };

    setOperaciones([nuevaOperacion, ...operaciones]);
    
    if (turnoActual) {
      setTurnoActual({
        ...turnoActual,
        efectivoTeorico: turnoActual.efectivoTeorico - monto
      });
    }

    setMontoConsumo('');
    setNotasConsumo('');
    setModalConsumo(false);
    toast.success('Consumo propio registrado');
  };

  const realizarArqueo = () => {
    if (!permisos.arqueo_caja) {
      toast.error('No tienes permisos para realizar arqueos');
      return;
    }

    const totalContado = calcularTotal();
    const teorico = turnoActual?.efectivoTeorico || 0;
    const diferencia = totalContado - teorico;

    toast.success(`Arqueo realizado: ${totalContado.toFixed(2)}€ (Dif: ${diferencia.toFixed(2)}€)`);
    
    const nuevaOperacion: OperacionCaja = {
      id: `OP${Date.now()}`,
      tipo: 'arqueo',
      monto: totalContado,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: `Diferencia: ${diferencia.toFixed(2)}€`
    };

    setOperaciones([nuevaOperacion, ...operaciones]);
    setModalArqueo(false);
  };

  const cerrarCaja = () => {
    if (!permisos.cierre_caja) {
      toast.error('No tienes permisos para cerrar la caja');
      return;
    }

    if (!turnoActual) {
      toast.error('No hay turno abierto');
      return;
    }

    const totalContado = calcularTotal();
    const diferencia = totalContado - turnoActual.efectivoTeorico;

    const turnoFinalizado: TurnoCaja = {
      ...turnoActual,
      fechaCierre: new Date(),
      montoCajaFinal: totalContado,
      efectivoReal: totalContado,
      diferencia,
      abierto: false
    };

    const nuevaOperacion: OperacionCaja = {
      id: `OP${Date.now()}`,
      tipo: 'cierre',
      monto: totalContado,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: `Cierre de caja. Diferencia: ${diferencia.toFixed(2)}€`
    };

    setOperaciones([nuevaOperacion, ...operaciones]);
    setTurnoActual(null);
    setModalCierre(false);
    
    toast.success(`Caja cerrada. Total: ${totalContado.toFixed(2)}€`);
  };

  const registrarDevolucion = () => {
    const monto = parseFloat(montoDevolucion);
    if (isNaN(monto) || monto <= 0) {
      toast.error('Monto inválido');
      return;
    }

    const nuevaOperacion: OperacionCaja = {
      id: `OP${Date.now()}`,
      tipo: 'devolucion',
      monto,
      fecha: new Date(),
      usuario: nombreUsuario,
      notas: motivoDevolucion,
      pedidoId: pedidoIdDevolucion,
      metodoPago: metodoPagoDevolucion
    };

    setOperaciones([nuevaOperacion, ...operaciones]);
    
    if (turnoActual) {
      setTurnoActual({
        ...turnoActual,
        efectivoTeorico: turnoActual.efectivoTeorico + monto
      });
    }

    setMontoDevolucion('');
    setMotivoDevolucion('');
    setPedidoIdDevolucion('');
    setMetodoPagoDevolucion('efectivo');
    setModalDevolucion(false);
    toast.success('Devolución registrada');
  };

  const getTipoOperacionBadge = (tipo: string) => {
    switch (tipo) {
      case 'apertura':
        return <Badge className="bg-green-100 text-green-800">Apertura</Badge>;
      case 'retirada':
        return <Badge className="bg-orange-100 text-orange-800">Retirada</Badge>;
      case 'consumo_propio':
        return <Badge className="bg-purple-100 text-purple-800">Consumo</Badge>;
      case 'arqueo':
        return <Badge className="bg-blue-100 text-blue-800">Arqueo</Badge>;
      case 'cierre':
        return <Badge className="bg-red-100 text-red-800">Cierre</Badge>;
      case 'devolucion':
        return <Badge className="bg-yellow-100 text-yellow-800">Devolución</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de la caja */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${turnoActual ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
          <CardContent className="p-4 text-center">
            {turnoActual ? (
              <Unlock className="w-8 h-8 mx-auto mb-2 text-green-600" />
            ) : (
              <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            )}
            <p className="text-sm text-gray-700 mb-1">Estado</p>
            <p className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {turnoActual ? 'Abierta' : 'Cerrada'}
            </p>
          </CardContent>
        </Card>

        {turnoActual && (
          <>
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-700 mb-1">Caja Inicial</p>
                <p className="text-xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {turnoActual.montoCajaInicial.toFixed(2)}€
                </p>
              </CardContent>
            </Card>

            <Card className="bg-teal-50 border-2 border-teal-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                <p className="text-sm text-gray-700 mb-1">Efectivo Teórico</p>
                <p className="text-xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {turnoActual.efectivoTeorico.toFixed(2)}€
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-2 border-purple-200">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-700 mb-1">Turno Abierto</p>
                <p className="text-sm text-purple-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {turnoActual.fechaApertura.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Acciones de Caja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button
              onClick={() => setModalApertura(true)}
              disabled={!!turnoActual}
              className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
            >
              <Unlock className="w-5 h-5" />
              Apertura
            </Button>

            <Button
              onClick={() => setModalRetirada(true)}
              disabled={!turnoActual || !permisos.hacer_retiradas}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <TrendingDown className="w-5 h-5" />
              Retirada
            </Button>

            <Button
              onClick={() => setModalConsumo(true)}
              disabled={!turnoActual}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Euro className="w-5 h-5" />
              Consumo Propio
            </Button>

            <Button
              onClick={() => setModalArqueo(true)}
              disabled={!turnoActual || !permisos.arqueo_caja}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Calculator className="w-5 h-5" />
              Arqueo
            </Button>

            <Button
              onClick={() => setModalCierre(true)}
              disabled={!turnoActual || !permisos.cierre_caja}
              className="h-20 flex-col gap-2 bg-red-600 hover:bg-red-700"
            >
              <Lock className="w-5 h-5" />
              Cierre
            </Button>

            <Button
              onClick={() => setModalDevolucion(true)}
              disabled={!turnoActual}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Devolución
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial del turno */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Historial del Turno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No hay operaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                operaciones.map(op => (
                  <TableRow key={op.id}>
                    <TableCell className="text-sm">
                      {op.fecha.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{getTipoOperacionBadge(op.tipo)}</TableCell>
                    <TableCell className="text-sm">{op.usuario}</TableCell>
                    <TableCell className="text-right font-medium">
                      {op.tipo === 'retirada' || op.tipo === 'consumo_propio' || op.tipo === 'devolucion' ? '-' : ''}
                      {op.monto.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{op.notas || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Apertura */}
      <Dialog open={modalApertura} onOpenChange={setModalApertura}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apertura de Caja</DialogTitle>
            <DialogDescription>Indica el monto inicial con el que abres la caja</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto Inicial (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                placeholder="100.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalApertura(false)}>Cancelar</Button>
            <Button onClick={abrirCaja} className="bg-green-600 hover:bg-green-700">
              Abrir Caja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Retirada */}
      <Dialog open={modalRetirada} onOpenChange={setModalRetirada}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirada de Efectivo</DialogTitle>
            <DialogDescription>Registra una retirada de efectivo de la caja</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Retirar (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={montoRetirada}
                onChange={(e) => setMontoRetirada(e.target.value)}
                placeholder="200.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                value={notasRetirada}
                onChange={(e) => setNotasRetirada(e.target.value)}
                placeholder="Motivo de la retirada"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRetirada(false)}>Cancelar</Button>
            <Button onClick={hacerRetirada} className="bg-orange-600 hover:bg-orange-700">
              Registrar Retirada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Consumo Propio */}
      <Dialog open={modalConsumo} onOpenChange={setModalConsumo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consumo Propio</DialogTitle>
            <DialogDescription>Registra un consumo del personal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor del Consumo (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={montoConsumo}
                onChange={(e) => setMontoConsumo(e.target.value)}
                placeholder="5.50"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={notasConsumo}
                onChange={(e) => setNotasConsumo(e.target.value)}
                placeholder="Ej: Café y croissant"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalConsumo(false)}>Cancelar</Button>
            <Button onClick={registrarConsumo} className="bg-purple-600 hover:bg-purple-700">
              Registrar Consumo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Arqueo/Cierre (Contador de billetes) */}
      <Dialog open={modalArqueo || modalCierre} onOpenChange={(open) => {
        if (!open) {
          setModalArqueo(false);
          setModalCierre(false);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalArqueo ? 'Arqueo de Caja' : 'Cierre de Caja'}
            </DialogTitle>
            <DialogDescription>
              Cuenta los billetes y monedas para verificar el efectivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {denominaciones.map(denom => (
                <div key={denom.valor} className="space-y-1">
                  <Label className="text-xs">{denom.label}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={cantidades[denom.valor as keyof typeof cantidades]}
                    onChange={(e) => setCantidades({
                      ...cantidades,
                      [denom.valor]: parseInt(e.target.value) || 0
                    })}
                    className="text-center"
                  />
                </div>
              ))}
            </div>

            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Contado:</span>
                <span className="text-2xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {calcularTotal().toFixed(2)}€
                </span>
              </div>
              {turnoActual && (
                <>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Teórico:</span>
                    <span>{turnoActual.efectivoTeorico.toFixed(2)}€</span>
                  </div>
                  <div className={`flex justify-between text-sm font-medium mt-2 pt-2 border-t ${
                    calcularTotal() - turnoActual.efectivoTeorico === 0 
                      ? 'text-green-700' 
                      : calcularTotal() - turnoActual.efectivoTeorico > 0
                        ? 'text-blue-700'
                        : 'text-red-700'
                  }`}>
                    <span>Diferencia:</span>
                    <span>{(calcularTotal() - turnoActual.efectivoTeorico).toFixed(2)}€</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setModalArqueo(false);
              setModalCierre(false);
            }}>
              Cancelar
            </Button>
            {modalArqueo ? (
              <Button onClick={realizarArqueo} className="bg-blue-600 hover:bg-blue-700">
                Confirmar Arqueo
              </Button>
            ) : (
              <Button onClick={cerrarCaja} className="bg-red-600 hover:bg-red-700">
                Cerrar Caja
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Devolución */}
      <Dialog open={modalDevolucion} onOpenChange={setModalDevolucion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolución</DialogTitle>
            <DialogDescription>Registra una devolución a un cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Devolver (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={montoDevolucion}
                onChange={(e) => setMontoDevolucion(e.target.value)}
                placeholder="50.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo de la Devolución</Label>
              <Input
                value={motivoDevolucion}
                onChange={(e) => setMotivoDevolucion(e.target.value)}
                placeholder="Ej: Producto defectuoso"
              />
            </div>
            <div className="space-y-2">
              <Label>ID del Pedido (opcional)</Label>
              <Input
                value={pedidoIdDevolucion}
                onChange={(e) => setPedidoIdDevolucion(e.target.value)}
                placeholder="Ej: P001"
              />
            </div>
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <select
                value={metodoPagoDevolucion}
                onChange={(e) => setMetodoPagoDevolucion(e.target.value as 'efectivo' | 'tarjeta')}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDevolucion(false)}>Cancelar</Button>
            <Button onClick={registrarDevolucion} className="bg-red-600 hover:bg-red-700">
              Registrar Devolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}