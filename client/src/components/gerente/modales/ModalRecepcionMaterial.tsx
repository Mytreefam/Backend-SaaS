import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { stockApi } from '../../../services/api/gerente.api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';

interface RecepcionMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pedidoData?: any;
}

export function RecepcionMaterialModal({
  isOpen,
  onClose,
  onSuccess,
  pedidoData
}: RecepcionMaterialModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    observaciones: '',
    itemsRecibidos: (pedidoData?.items || []).map((item: any) => ({
      itemId: item.id,
      cantidadEsperada: item.cantidad,
      cantidadRecibida: item.cantidad,
      observacion: ''
    }))
  });

  const handleChangeItemRecibida = (index: number, cantidad: number) => {
    const nuevosItems = [...formData.itemsRecibidos];
    nuevosItems[index].cantidadRecibida = cantidad;
    setFormData(prev => ({ ...prev, itemsRecibidos: nuevosItems }));
  };

  const handleChangeObservacion = (index: number, obs: string) => {
    const nuevosItems = [...formData.itemsRecibidos];
    nuevosItems[index].observacion = obs;
    setFormData(prev => ({ ...prev, itemsRecibidos: nuevosItems }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await stockApi.recibirPedidoProveedor(pedidoData.id, {
        observaciones: formData.observaciones,
        items: formData.itemsRecibidos
      });
      toast.success('Pedido recibido correctamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al recibir el pedido');
    } finally {
      setLoading(false);
    }
  };

  const verificarDiferencias = () => {
    const diferencias = formData.itemsRecibidos.some(
      item => item.cantidadRecibida !== item.cantidadEsperada
    );
    return diferencias;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recibir Material - Pedido #{pedidoData?.numero}</DialogTitle>
          <DialogDescription>
            Verifica y confirma la recepción de los artículos del proveedor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Proveedor</p>
                <p className="font-semibold">{pedidoData?.proveedor?.nombre}</p>
              </div>
              <div>
                <p className="text-gray-600">Fecha Pedido</p>
                <p className="font-semibold">
                  {new Date(pedidoData?.fechaPedido).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Esperado</p>
                <p className="font-semibold text-teal-600">{pedidoData?.total?.toFixed(2)}€</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Artículos del Pedido</h3>
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Artículo</TableHead>
                    <TableHead className="text-center">Esperado</TableHead>
                    <TableHead className="text-center">Recibido *</TableHead>
                    <TableHead className="text-center">Diferencia</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidoData?.items?.map((item: any, idx: number) => {
                    const recibido = formData.itemsRecibidos[idx]?.cantidadRecibida || 0;
                    const diferencia = recibido - item.cantidad;
                    const tieneError = diferencia !== 0;

                    return (
                      <TableRow key={idx} className={tieneError ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">{item.nombreArticulo}</TableCell>
                        <TableCell className="text-center">{item.cantidad} {item.unidadMedida || 'u'}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            value={recibido}
                            onChange={(e) => handleChangeItemRecibida(idx, parseFloat(e.target.value))}
                            className={`w-20 text-center ${tieneError ? 'border-red-500' : ''}`}
                          />
                        </TableCell>
                        <TableCell className={`text-center font-semibold ${tieneError ? 'text-red-600' : 'text-green-600'}`}>
                          {diferencia > 0 ? '+' : ''}{diferencia}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Ej: Dañado, falta..."
                            value={formData.itemsRecibidos[idx]?.observacion || ''}
                            onChange={(e) => handleChangeObservacion(idx, e.target.value)}
                            className="text-sm"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {verificarDiferencias() && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                ⚠️ Se han detectado diferencias en las cantidades recibidas. Especifica las observaciones.
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Label htmlFor="observaciones">Observaciones Generales</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales sobre la recepción..."
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Procesando...' : 'Confirmar Recepción'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
