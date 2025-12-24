import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { stockApi } from '../../../services/api/gerente.api';

interface ModalNuevoArticuloProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId: string;
  puntoVentaId: string;
  isEditing?: boolean;
  articuloData?: any;
}

export function ModalNuevoArticulo({
  isOpen,
  onClose,
  onSuccess,
  empresaId,
  puntoVentaId,
  isEditing = false,
  articuloData
}: ModalNuevoArticuloProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigoInterno: articuloData?.codigoInterno || '',
    nombre: articuloData?.nombre || '',
    categoria: articuloData?.categoria || '',
    unidadMedida: articuloData?.unidadMedida || 'unidad',
    stockActual: articuloData?.stockActual || 0,
    stockMinimo: articuloData?.stockMinimo || 0,
    stockMaximo: articuloData?.stockMaximo || 999999,
    precioUltimaCompra: articuloData?.precioUltimaCompra || 0,
    ubicacionAlmacen: articuloData?.ubicacionAlmacen || ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.codigoInterno.trim() || !formData.nombre.trim()) {
      toast.error('Código y nombre del artículo son requeridos');
      return;
    }

    if (formData.stockMinimo > formData.stockMaximo) {
      toast.error('El stock mínimo no puede ser mayor al máximo');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Preparando artículo:', formData);
      
      const datosArticulo = {
        codigo_interno: formData.codigoInterno,
        nombre: formData.nombre,
        categoria: formData.categoria,
        unidad_medida: formData.unidadMedida,
        stock_actual: formData.stockActual,
        stock_minimo: formData.stockMinimo,
        stock_maximo: formData.stockMaximo,
        precio_ultima_compra: formData.precioUltimaCompra,
        ubicacion_almacen: formData.ubicacionAlmacen,
        empresa_id: empresaId,
        punto_venta_id: puntoVentaId
      };
      
      console.log('📤 Enviando artículo:', datosArticulo);
      
      if (isEditing && articuloData?.id) {
        const resultado = await stockApi.actualizarArticuloStock(articuloData.id, datosArticulo);
        console.log('✅ Artículo actualizado:', resultado);
        toast.success('Artículo actualizado correctamente');
      } else {
        const resultado = await stockApi.crearArticuloStock(datosArticulo);
        console.log('✅ Artículo creado:', resultado);
        toast.success('Artículo creado correctamente');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      const mensajeError = error.response?.data?.error || error.message || 'Error al guardar el artículo';
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza los datos del artículo' : 'Crea un nuevo artículo en el stock'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigoInterno">Código Interno *</Label>
              <Input
                id="codigoInterno"
                placeholder="ARK-001"
                value={formData.codigoInterno}
                onChange={(e) => handleChange('codigoInterno', e.target.value)}
                disabled={isEditing}
              />
            </div>
            <div>
              <Label htmlFor="nombre">Nombre del Artículo *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Pan de Barra"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                placeholder="Ej: Panadería"
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="unidadMedida">Unidad de Medida</Label>
              <Input
                id="unidadMedida"
                placeholder="kg, unidad, litro..."
                value={formData.unidadMedida}
                onChange={(e) => handleChange('unidadMedida', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Niveles de Stock</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stockActual">Stock Actual</Label>
                <Input
                  id="stockActual"
                  type="number"
                  min="0"
                  value={formData.stockActual}
                  onChange={(e) => handleChange('stockActual', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  min="0"
                  value={formData.stockMinimo}
                  onChange={(e) => handleChange('stockMinimo', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="stockMaximo">Stock Máximo</Label>
                <Input
                  id="stockMaximo"
                  type="number"
                  min="0"
                  value={formData.stockMaximo}
                  onChange={(e) => handleChange('stockMaximo', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Información de Compra</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precioUltimaCompra">Precio Última Compra (€)</Label>
                <Input
                  id="precioUltimaCompra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioUltimaCompra}
                  onChange={(e) => handleChange('precioUltimaCompra', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="ubicacionAlmacen">Ubicación en Almacén</Label>
                <Input
                  id="ubicacionAlmacen"
                  placeholder="Ej: Estantería A-3"
                  value={formData.ubicacionAlmacen}
                  onChange={(e) => handleChange('ubicacionAlmacen', e.target.value)}
                />
              </div>
            </div>
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Artículo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
