import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { usePuntoVentaActivo } from '../../hooks/usePuntoVentaActivo';
import { stockTrabajadorApi, type ArticuloStockApi } from '../../services/api';

interface AñadirMaterialModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMaterialRegistrado: (material: any) => void;
  tareaId?: string;
  vehiculo?: string;
  ordenTrabajo?: string;
  modoVentaDirecta?: boolean;
}

type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'merma' | 'consumo_propio';

export function AñadirMaterialModal({
  isOpen,
  onOpenChange,
  onMaterialRegistrado,
  modoVentaDirecta = false,
}: AñadirMaterialModalProps) {
  const { puntoVentaId } = usePuntoVentaActivo();
  const [articulos, setArticulos] = useState<ArticuloStockApi[]>([]);
  const [loadingArticulos, setLoadingArticulos] = useState(false);

  const [articuloId, setArticuloId] = useState<string>('');
  const [tipo, setTipo] = useState<TipoMovimiento>(modoVentaDirecta ? 'salida' : 'consumo_propio');
  const [cantidad, setCantidad] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  const articuloSeleccionado = useMemo(
    () => articulos.find((a) => String(a.id) === String(articuloId)) || null,
    [articulos, articuloId],
  );

  useEffect(() => {
    if (!isOpen) return;

    // Reset UI fields each open (no changes to parent behavior)
    setArticuloId('');
    setTipo(modoVentaDirecta ? 'salida' : 'consumo_propio');
    setCantidad('');
    setMotivo('');
    setObservaciones('');

    if (!puntoVentaId) {
      setArticulos([]);
      return;
    }

    let cancelled = false;
    setLoadingArticulos(true);
    stockTrabajadorApi
      .listArticulos({ puntoVentaId })
      .then((list) => {
        if (!cancelled) setArticulos(list || []);
      })
      .catch((e) => {
        console.error('Error cargando artículos:', e);
        if (!cancelled) setArticulos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingArticulos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, puntoVentaId, modoVentaDirecta]);

  const handleGuardar = async () => {
    if (!puntoVentaId) {
      toast.error('Debes fichar para registrar movimientos');
      return;
    }
    const idNum = Number(articuloId);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      toast.error('Selecciona un artículo');
      return;
    }
    const cantNum = Number(cantidad);
    if (!Number.isFinite(cantNum) || cantNum <= 0) {
      toast.error('Introduce una cantidad válida');
      return;
    }

    const res = await stockTrabajadorApi.ajustarArticulo({
      articuloId: idNum,
      tipo,
      cantidad: cantNum,
      motivo: motivo || undefined,
      observaciones: observaciones || undefined,
    });

    if (!res) {
      toast.error('No se pudo registrar el movimiento');
      return;
    }

    toast.success('Movimiento registrado');
    onMaterialRegistrado(res);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{modoVentaDirecta ? 'Venta directa' : 'Movimiento de stock'}</DialogTitle>
          <DialogDescription>
            {modoVentaDirecta
              ? 'Registra una salida de stock (venta directa) en el punto de venta activo.'
              : 'Registra una entrada/salida/merma/consumo o ajuste de inventario.'}
          </DialogDescription>
        </DialogHeader>

        {!puntoVentaId ? (
          <Alert>
            <AlertDescription>Debes fichar en un punto de venta para gestionar stock.</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Artículo</Label>
              <Select value={articuloId} onValueChange={setArticuloId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingArticulos ? 'Cargando...' : 'Selecciona un artículo'} />
                </SelectTrigger>
                <SelectContent>
                  {articulos.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nombre} ({a.codigoInterno}) · Stock: {a.stockActual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoMovimiento)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de movimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="merma">Merma</SelectItem>
                    <SelectItem value="consumo_propio">Consumo propio</SelectItem>
                    <SelectItem value="ajuste">Ajuste (set stock)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{tipo === 'ajuste' ? 'Nuevo stock' : 'Cantidad'}</Label>
                <Input
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="0"
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" />
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional" />
            </div>

            {articuloSeleccionado && (
              <div className="text-sm text-gray-600">
                Stock actual: <span className="font-medium">{articuloSeleccionado.stockActual}</span> · Mínimo:{' '}
                <span className="font-medium">{articuloSeleccionado.stockMinimo}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={!puntoVentaId}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

