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
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Package, 
  AlertTriangle,
  Trash2,
  Send,
  Repeat,
  FileText,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES
// ============================================================================

interface Material {
  id: string;
  codigo: string;
  nombre: string;
  stock: number;
  categoria: string;
  proveedor?: string;
  stockOptimo?: number;
  ultimaCompra?: string;
  marca?: string;
  puntoVenta?: string;
}

interface MovimientoStockPayload {
  MovimientoId: string;
  Tipo: 'Consumo' | 'Solicitud' | 'Transferencia' | 'Merma' | 'Devolución' | 'Recepción';
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  UsuarioId: string;
  ProductoId: string;
  Cantidad: number;
  ProveedorId?: string;
  PuntoVentaDestinoId?: string;
  Motivo?: string;
  Nota?: string;
  FechaHora: string;
}

// ============================================================================
// MODAL: REGISTRAR CONSUMO (antiguo "Material utilizado")
// ============================================================================

interface ModalRegistrarConsumoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materialPreseleccionado?: Material;
}

export function ModalRegistrarConsumo({
  isOpen,
  onOpenChange,
  materialPreseleccionado
}: ModalRegistrarConsumoProps) {
  const [busqueda, setBusqueda] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(
    materialPreseleccionado || null
  );
  const [cantidad, setCantidad] = useState('');
  const [nota, setNota] = useState('');

  // Datos ocultos para API
  const datosOcultos = {
    EmpresaId: 'EMP-001',
    MarcaId: 'MRC-001',
    PuntoVentaId: 'PDV-TIANA',
    UsuarioId: 'USER-123'
  };

  const materialesDisponibles: Material[] = [
    { id: 'M001', codigo: 'ACE001', nombre: 'Aceite Motor 5W30 - 5L', stock: 15, categoria: 'Lubricantes' },
    { id: 'M002', codigo: 'FIL001', nombre: 'Filtro de Aceite Universal', stock: 8, categoria: 'Filtros' },
    { id: 'M003', codigo: 'FRE001', nombre: 'Pastillas de Freno Delanteras', stock: 8, categoria: 'Frenos' },
  ];

  const materialesFiltrados = materialesDisponibles.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmar = () => {
    if (!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const payload: MovimientoStockPayload = {
      MovimientoId: `MOV-${Date.now()}`,
      Tipo: 'Consumo',
      ...datosOcultos,
      ProductoId: materialSeleccionado.id,
      Cantidad: parseInt(cantidad),
      Nota: nota || undefined,
      FechaHora: new Date().toISOString()
    };

    console.log('[REGISTRAR CONSUMO] Payload:', payload);
    toast.success('Consumo registrado correctamente');
    
    // Reset y cerrar
    setMaterialSeleccionado(null);
    setCantidad('');
    setNota('');
    setBusqueda('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Registrar consumo
              </DialogTitle>
              <DialogDescription>
                Registra el consumo de material del almacén
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Buscar producto */}
          <div className="space-y-2">
            <Label>Buscar producto *</Label>
            <Input
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            {busqueda && materialesFiltrados.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {materialesFiltrados.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      setMaterialSeleccionado(material);
                      setBusqueda('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {material.codigo} - {material.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {material.stock} · {material.categoria}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {materialSeleccionado && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {materialSeleccionado.codigo} - {materialSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    Stock disponible: {materialSeleccionado.stock}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaterialSeleccionado(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max={materialSeleccionado?.stock || 999}
              placeholder="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          {/* Nota */}
          <div className="space-y-2">
            <Label htmlFor="nota">Nota (opcional)</Label>
            <Textarea
              id="nota"
              placeholder="Observaciones..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Registrar consumo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MODAL: SOLICITAR MATERIAL
// ============================================================================

interface ModalSolicitarMaterialProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materialPreseleccionado?: Material;
}

export function ModalSolicitarMaterial({
  isOpen,
  onOpenChange,
  materialPreseleccionado
}: ModalSolicitarMaterialProps) {
  const [busqueda, setBusqueda] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(
    materialPreseleccionado || null
  );
  const [cantidad, setCantidad] = useState('');
  const [proveedorSugerido, setProveedorSugerido] = useState('');
  const [nota, setNota] = useState('');

  const datosOcultos = {
    EmpresaId: 'EMP-001',
    MarcaId: 'MRC-001',
    PuntoVentaId: 'PDV-TIANA',
    UsuarioId: 'USER-123'
  };

  const materialesDisponibles: Material[] = [
    { id: 'M001', codigo: 'ACE001', nombre: 'Aceite Motor 5W30 - 5L', stock: 15, categoria: 'Lubricantes', proveedor: 'Repuestos AutoMax' },
    { id: 'M002', codigo: 'FIL001', nombre: 'Filtro de Aceite Universal', stock: 8, categoria: 'Filtros', proveedor: 'Filtros García' },
  ];

  const materialesFiltrados = materialesDisponibles.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmar = () => {
    if (!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const payload: MovimientoStockPayload = {
      MovimientoId: `MOV-${Date.now()}`,
      Tipo: 'Solicitud',
      ...datosOcultos,
      ProductoId: materialSeleccionado.id,
      Cantidad: parseInt(cantidad),
      ProveedorId: proveedorSugerido || materialSeleccionado.proveedor,
      Nota: nota || undefined,
      FechaHora: new Date().toISOString()
    };

    console.log('[SOLICITAR MATERIAL] Payload:', payload);
    toast.success('Solicitud de material registrada correctamente');
    
    setMaterialSeleccionado(null);
    setCantidad('');
    setProveedorSugerido('');
    setNota('');
    setBusqueda('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Solicitar material
              </DialogTitle>
              <DialogDescription>
                Solicita material al proveedor o almacén central
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Buscar producto */}
          <div className="space-y-2">
            <Label>Producto *</Label>
            <Input
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            {busqueda && materialesFiltrados.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {materialesFiltrados.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      setMaterialSeleccionado(material);
                      setProveedorSugerido(material.proveedor || '');
                      setBusqueda('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {material.codigo} - {material.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      Proveedor: {material.proveedor || 'Sin definir'}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {materialSeleccionado && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {materialSeleccionado.codigo} - {materialSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    Proveedor: {materialSeleccionado.proveedor}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaterialSeleccionado(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              placeholder="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          {/* Proveedor sugerido */}
          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor sugerido</Label>
            <Input
              id="proveedor"
              placeholder="Proveedor habitual..."
              value={proveedorSugerido}
              onChange={(e) => setProveedorSugerido(e.target.value)}
            />
          </div>

          {/* Nota */}
          <div className="space-y-2">
            <Label htmlFor="nota">Nota</Label>
            <Textarea
              id="nota"
              placeholder="Observaciones o urgencia..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MODAL: TRANSFERIR MATERIAL
// ============================================================================

interface ModalTransferirMaterialProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materialPreseleccionado?: Material;
}

export function ModalTransferirMaterial({
  isOpen,
  onOpenChange,
  materialPreseleccionado
}: ModalTransferirMaterialProps) {
  const [busqueda, setBusqueda] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(
    materialPreseleccionado || null
  );
  const [cantidad, setCantidad] = useState('');
  const [puntoVentaDestino, setPuntoVentaDestino] = useState('');
  const [motivo, setMotivo] = useState('');

  const datosOcultos = {
    EmpresaId: 'EMP-001',
    MarcaId: 'MRC-001',
    PuntoVentaId: 'PDV-TIANA',
    UsuarioId: 'USER-123'
  };

  const puntoVentaOrigen = 'Tiana'; // Bloqueado, del usuario actual

  const puntosVentaDisponibles = [
    { id: 'PDV-TIANA', nombre: 'Tiana' },
    { id: 'PDV-BADALONA', nombre: 'Badalona' },
  ];

  const materialesDisponibles: Material[] = [
    { id: 'M001', codigo: 'ACE001', nombre: 'Aceite Motor 5W30 - 5L', stock: 15, categoria: 'Lubricantes' },
    { id: 'M002', codigo: 'FIL001', nombre: 'Filtro de Aceite Universal', stock: 8, categoria: 'Filtros' },
  ];

  const materialesFiltrados = materialesDisponibles.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmar = () => {
    if (!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0 || !puntoVentaDestino) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const payload: MovimientoStockPayload = {
      MovimientoId: `MOV-${Date.now()}`,
      Tipo: 'Transferencia',
      ...datosOcultos,
      ProductoId: materialSeleccionado.id,
      Cantidad: parseInt(cantidad),
      PuntoVentaDestinoId: puntoVentaDestino,
      Motivo: motivo || undefined,
      FechaHora: new Date().toISOString()
    };

    console.log('[TRANSFERIR MATERIAL] Payload:', payload);
    toast.success('Transferencia de material registrada correctamente');
    
    setMaterialSeleccionado(null);
    setCantidad('');
    setPuntoVentaDestino('');
    setMotivo('');
    setBusqueda('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Transferir material
              </DialogTitle>
              <DialogDescription>
                Transfiere material a otro punto de venta
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Punto de venta origen (bloqueado) */}
          <div className="space-y-2">
            <Label>Punto de venta origen</Label>
            <Input
              value={puntoVentaOrigen}
              disabled
              className="bg-gray-100"
            />
          </div>

          {/* Punto de venta destino */}
          <div className="space-y-2">
            <Label htmlFor="pdv-destino">Punto de venta destino *</Label>
            <Select value={puntoVentaDestino} onValueChange={setPuntoVentaDestino}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar punto de venta" />
              </SelectTrigger>
              <SelectContent>
                {puntosVentaDisponibles.map((pdv) => (
                  <SelectItem key={pdv.id} value={pdv.id}>
                    {pdv.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Buscar producto */}
          <div className="space-y-2">
            <Label>Producto *</Label>
            <Input
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            {busqueda && materialesFiltrados.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {materialesFiltrados.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      setMaterialSeleccionado(material);
                      setBusqueda('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {material.codigo} - {material.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock disponible: {material.stock}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {materialSeleccionado && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {materialSeleccionado.codigo} - {materialSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    Stock disponible: {materialSeleccionado.stock}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaterialSeleccionado(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max={materialSeleccionado?.stock || 999}
              placeholder="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              placeholder="Motivo de la transferencia..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0 || !puntoVentaDestino}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Repeat className="w-4 h-4 mr-2" />
            Transferir material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MODAL: REGISTRAR MERMA
// ============================================================================

interface ModalRegistrarMermaProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materialPreseleccionado?: Material;
}

export function ModalRegistrarMerma({
  isOpen,
  onOpenChange,
  materialPreseleccionado
}: ModalRegistrarMermaProps) {
  const [busqueda, setBusqueda] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(
    materialPreseleccionado || null
  );
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');

  const datosOcultos = {
    EmpresaId: 'EMP-001',
    MarcaId: 'MRC-001',
    PuntoVentaId: 'PDV-TIANA',
    UsuarioId: 'USER-123'
  };

  const materialesDisponibles: Material[] = [
    { id: 'M001', codigo: 'ACE001', nombre: 'Aceite Motor 5W30 - 5L', stock: 15, categoria: 'Lubricantes' },
    { id: 'M002', codigo: 'FIL001', nombre: 'Filtro de Aceite Universal', stock: 8, categoria: 'Filtros' },
  ];

  const materialesFiltrados = materialesDisponibles.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmar = () => {
    if (!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0 || !motivo) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const payload: MovimientoStockPayload = {
      MovimientoId: `MOV-${Date.now()}`,
      Tipo: 'Merma',
      ...datosOcultos,
      ProductoId: materialSeleccionado.id,
      Cantidad: parseInt(cantidad),
      Motivo: motivo,
      FechaHora: new Date().toISOString()
    };

    console.log('[REGISTRAR MERMA] Payload:', payload);
    toast.success('Merma registrada correctamente');
    
    setMaterialSeleccionado(null);
    setCantidad('');
    setMotivo('');
    setBusqueda('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Registrar merma
              </DialogTitle>
              <DialogDescription>
                Registra una merma o pérdida de material
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Buscar producto */}
          <div className="space-y-2">
            <Label>Producto *</Label>
            <Input
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            {busqueda && materialesFiltrados.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {materialesFiltrados.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      setMaterialSeleccionado(material);
                      setBusqueda('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {material.codigo} - {material.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {material.stock}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {materialSeleccionado && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {materialSeleccionado.codigo} - {materialSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    Stock disponible: {materialSeleccionado.stock}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaterialSeleccionado(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max={materialSeleccionado?.stock || 999}
              placeholder="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Textarea
              id="motivo"
              placeholder="Describe el motivo de la merma (caducado, roto, defectuoso...)..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0 || !motivo.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Registrar merma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MODAL: DEVOLVER MATERIAL
// ============================================================================

interface ModalDevolverMaterialProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  materialPreseleccionado?: Material;
}

export function ModalDevolverMaterial({
  isOpen,
  onOpenChange,
  materialPreseleccionado
}: ModalDevolverMaterialProps) {
  const [busqueda, setBusqueda] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(
    materialPreseleccionado || null
  );
  const [cantidad, setCantidad] = useState('');
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [notaOpcional, setNotaOpcional] = useState('');

  const datosOcultos = {
    EmpresaId: 'EMP-001',
    MarcaId: 'MRC-001',
    PuntoVentaId: 'PDV-TIA',
    UsuarioId: 'USER-123'
  };

  const motivosDevolucion = [
    { value: 'mal_estado', label: 'Mal estado' },
    { value: 'error_proveedor', label: 'Error de proveedor' },
    { value: 'caducado', label: 'Caducado' },
    { value: 'roto', label: 'Roto o defectuoso' },
    { value: 'otro', label: 'Otro' }
  ];

  const materialesDisponibles: Material[] = [
    { id: 'M001', codigo: 'ACE001', nombre: 'Aceite Motor 5W30 - 5L', stock: 15, categoria: 'Lubricantes' },
    { id: 'M002', codigo: 'FIL001', nombre: 'Filtro de Aceite Universal', stock: 8, categoria: 'Filtros' },
  ];

  const materialesFiltrados = materialesDisponibles.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmar = () => {
    if (!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0 || !motivoDevolucion) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const payload: MovimientoStockPayload = {
      MovimientoId: `MOV-${Date.now()}`,
      Tipo: 'Devolución',
      ...datosOcultos,
      ProductoId: materialSeleccionado.id,
      Cantidad: parseInt(cantidad),
      Motivo: motivoDevolucion,
      Nota: notaOpcional || undefined,
      FechaHora: new Date().toISOString()
    };

    console.log('[DEVOLVER MATERIAL] Payload:', payload);
    toast.success('Devolución de material registrada correctamente');
    
    setMaterialSeleccionado(null);
    setCantidad('');
    setMotivoDevolucion('');
    setNotaOpcional('');
    setBusqueda('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Devolver material
              </DialogTitle>
              <DialogDescription>
                Registra una devolución de material al proveedor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Buscar producto */}
          <div className="space-y-2">
            <Label>Producto *</Label>
            <Input
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            {busqueda && materialesFiltrados.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {materialesFiltrados.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      setMaterialSeleccionado(material);
                      setBusqueda('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {material.codigo} - {material.nombre}
                    </p>
                    <p className="text-xs text-gray-600">
                      Stock: {material.stock}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {materialSeleccionado && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {materialSeleccionado.codigo} - {materialSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    Stock disponible: {materialSeleccionado.stock}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaterialSeleccionado(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max={materialSeleccionado?.stock || 999}
              placeholder="0"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          {/* Motivo de devolución */}
          <div className="space-y-2">
            <Label htmlFor="motivo-devolucion">Motivo *</Label>
            <Select value={motivoDevolucion} onValueChange={setMotivoDevolucion}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
              <SelectContent>
                {motivosDevolucion.map((motivo) => (
                  <SelectItem key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nota opcional */}
          <div className="space-y-2">
            <Label htmlFor="nota">Nota opcional</Label>
            <Textarea
              id="nota"
              placeholder="Información adicional sobre la devolución..."
              value={notaOpcional}
              onChange={(e) => setNotaOpcional(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!materialSeleccionado || !cantidad || parseInt(cantidad) <= 0 || !motivoDevolucion}
            className="bg-red-600 hover:bg-red-700"
          >
            Devolver material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MODAL: VER FICHA
// ============================================================================

interface ModalVerFichaProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
}

export function ModalVerFicha({
  isOpen,
  onOpenChange,
  material
}: ModalVerFichaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ficha de producto
              </DialogTitle>
              <DialogDescription>
                Información del producto
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información básica */}
          <div className="space-y-3">
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label className="text-xs text-gray-600">Código</Label>
                <p className="font-medium text-gray-900">{material.codigo}</p>
              </div>
              <Badge variant="outline" className="bg-white">
                {material.categoria}
              </Badge>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-600">Nombre</Label>
              <p className="font-medium text-gray-900">{material.nombre}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-600">Stock actual</Label>
                <p className="font-medium text-gray-900">
                  {material.stock} uds.
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-xs text-gray-600">Stock óptimo</Label>
                <p className="font-medium text-gray-900">
                  {material.stockOptimo || '-'} uds.
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-600">Proveedor habitual</Label>
              <p className="font-medium text-gray-900">
                {material.proveedor || 'Sin definir'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-600">Última compra</Label>
              <p className="font-medium text-gray-900">
                {material.ultimaCompra || 'Sin registro'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-600">Marca</Label>
              <p className="font-medium text-gray-900">
                {material.marca || 'Pizza'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-xs text-gray-600">Punto de venta</Label>
              <p className="font-medium text-gray-900">
                {material.puntoVenta || 'Tiana'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
