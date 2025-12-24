import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { stockApi } from '../../../services/api/gerente.api';
import { Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';

interface ItemPedido {
  articuloId: number;
  nombreArticulo: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface ModalNuevoPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId: string;
  puntoVentaId: string;
  proveedores?: any[];
  articulos?: any[];
  isEditing?: boolean;
  pedidoData?: any;
}

export function ModalNuevoPedidoProveedor({
  isOpen,
  onClose,
  onSuccess,
  empresaId,
  puntoVentaId,
  proveedores = [],
  articulos = [],
  isEditing = false,
  pedidoData
}: ModalNuevoPedidoProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ItemPedido[]>(pedidoData?.items || []);
  const [formData, setFormData] = useState({
    proveedorId: pedidoData?.proveedorId || '',
    fechaEntregaEstimada: pedidoData?.fechaEntregaEstimada || '',
    observaciones: pedidoData?.observaciones || ''
  });
  const [newItem, setNewItem] = useState({
    articuloId: '',
    nombreArticulo: '',
    cantidad: 1,
    precioUnitario: 0
  });

  const handleAddItem = () => {
    if (!newItem.articuloId || newItem.cantidad <= 0 || newItem.precioUnitario <= 0) {
      toast.error('Completa todos los campos del artículo');
      return;
    }

    const item: ItemPedido = {
      articuloId: parseInt(newItem.articuloId),
      nombreArticulo: newItem.nombreArticulo,
      cantidad: newItem.cantidad,
      precioUnitario: newItem.precioUnitario,
      total: newItem.cantidad * newItem.precioUnitario
    };

    setItems([...items, item]);
    setNewItem({
      articuloId: '',
      nombreArticulo: '',
      cantidad: 1,
      precioUnitario: 0
    });
    toast.success('Artículo añadido al pedido');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalPedido = items.reduce((sum, item) => sum + item.total, 0);
  const ivaPedido = totalPedido * 0.21;
  const totalConIva = totalPedido + ivaPedido;

  const handleSubmit = async () => {
    if (!formData.proveedorId) {
      toast.error('Selecciona un proveedor');
      return;
    }

    if (items.length === 0) {
      toast.error('Añade al menos un artículo al pedido');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Preparando pedido con datos:');
      console.log('  - formData.proveedorId:', formData.proveedorId, 'type:', typeof formData.proveedorId);
      console.log('  - puntoVentaId:', puntoVentaId, 'type:', typeof puntoVentaId);
      console.log('  - empresaId:', empresaId, 'type:', typeof empresaId);
      console.log('  - items:', items, 'length:', items.length);
      
      // Convertir IDs apropiadamente
      const proveedorIdValue = isNaN(Number(formData.proveedorId)) 
        ? formData.proveedorId 
        : parseInt(formData.proveedorId);
      
      const pedido = {
        proveedor_id: proveedorIdValue,
        punto_venta_id: puntoVentaId,
        empresa_id: empresaId,
        fecha_entrega_estimada: formData.fechaEntregaEstimada || undefined,
        observaciones: formData.observaciones,
        items: items.map(item => ({
          articulo_id: item.articuloId,
          nombre_articulo: item.nombreArticulo,
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario,
          total: item.total
        })),
        subtotal: totalPedido,
        iva: ivaPedido,
        total: totalConIva
      };
      
      console.log('📤 Enviando pedido:', JSON.stringify(pedido, null, 2));

      if (isEditing && pedidoData?.id) {
        await stockApi.actualizarPedidoProveedor(pedidoData.id, pedido);
        toast.success('Pedido actualizado correctamente');
      } else {
        console.log('🔌 Llamando a crearPedidoProveedor con:', pedido);
        const resultado = await stockApi.crearPedidoProveedor(pedido);
        console.log('✅ Resultado de crearPedidoProveedor:', resultado);
        toast.success('Pedido creado correctamente');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error config:', error.config);
      const mensajeError = error.response?.data?.error || error.message || 'Error al guardar el pedido';
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pedido' : 'Nuevo Pedido a Proveedor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los detalles del pedido' : 'Crea un nuevo pedido de compra'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="proveedor">Proveedor *</Label>
              <Select 
                value={formData.proveedorId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, proveedorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fechaEntrega">Fecha Entrega Estimada</Label>
              <Input
                id="fechaEntrega"
                type="date"
                value={formData.fechaEntregaEstimada}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaEntregaEstimada: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales del pedido..."
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Artículos del Pedido</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Label htmlFor="articulo">Artículo</Label>
                  <Select 
                    value={newItem.articuloId}
                    onValueChange={(value) => {
                      const articulo = articulos.find(a => {
                        const idStr = a.id ? a.id.toString() : '';
                        return idStr === value;
                      });
                      console.log('📦 Artículo seleccionado:', articulo, 'con value:', value);
                      setNewItem(prev => ({
                        ...prev,
                        articuloId: value,
                        nombreArticulo: articulo?.nombre || '',
                        precioUnitario: articulo?.precioUnitario || prev.precioUnitario
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona artículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {articulos && articulos.length > 0 ? (
                        articulos.map((a) => (
                          <SelectItem key={a.id || Math.random()} value={a.id ? a.id.toString() : ''}>
                            {a.nombre}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>No hay artículos disponibles</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={newItem.cantidad}
                    onChange={(e) => setNewItem(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="precio">Precio Unitario (€)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.precioUnitario}
                    onChange={(e) => setNewItem(prev => ({ ...prev, precioUnitario: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button 
                    onClick={handleAddItem}
                    size="sm"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Añadir
                  </Button>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Artículo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.nombreArticulo}</TableCell>
                        <TableCell className="text-right">{item.cantidad}</TableCell>
                        <TableCell className="text-right">{item.precioUnitario.toFixed(2)}€</TableCell>
                        <TableCell className="text-right font-semibold">{item.total.toFixed(2)}€</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="bg-gray-50 p-4 border-t">
                  <div className="flex justify-end space-y-2 max-w-xs">
                    <div className="flex justify-between w-full">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{totalPedido.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between w-full text-sm text-gray-600">
                      <span>IVA (21%):</span>
                      <span>{ivaPedido.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between w-full border-t pt-2 text-lg font-bold">
                      <span>TOTAL:</span>
                      <span className="text-teal-600">{totalConIva.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Pedido' : 'Crear Pedido'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
