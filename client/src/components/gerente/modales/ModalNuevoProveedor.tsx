import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner@2.0.3';
import { stockApi } from '../../../services/api/gerente.api';

interface ModalNuevoProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresaId: string;
  isEditing?: boolean;
  proveedorData?: any;
}

export function ModalNuevoProveedor({
  isOpen,
  onClose,
  onSuccess,
  empresaId,
  isEditing = false,
  proveedorData
}: ModalNuevoProveedorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: proveedorData?.nombre || '',
    cif: proveedorData?.cif || '',
    categoria: proveedorData?.categoria || 'alimentos',
    contactoNombre: proveedorData?.contactoNombre || '',
    contactoTelefono: proveedorData?.contactoTelefono || '',
    contactoEmail: proveedorData?.contactoEmail || '',
    direccion: proveedorData?.direccion || '',
    ciudad: proveedorData?.ciudad || '',
    codigoPostal: proveedorData?.codigoPostal || '',
    pais: proveedorData?.pais || 'España',
    diasEntrega: proveedorData?.diasEntrega || 2,
    formaPago: proveedorData?.formaPago || 'transferencia'
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre del proveedor es requerido');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Preparando proveedor:', formData);
      
      const datosProveedor = {
        nombre: formData.nombre,
        cif: formData.cif,
        categoria: formData.categoria,
        contacto_nombre: formData.contactoNombre,
        contacto_telefono: formData.contactoTelefono,
        contacto_email: formData.contactoEmail,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        codigo_postal: formData.codigoPostal,
        pais: formData.pais,
        dias_entrega: formData.diasEntrega,
        forma_pago: formData.formaPago,
        empresa_id: empresaId,
        activo: true
      };
      
      console.log('📤 Enviando proveedor:', datosProveedor);
      
      if (isEditing && proveedorData?.id) {
        const resultado = await stockApi.actualizarProveedor(proveedorData.id, datosProveedor);
        console.log('✅ Proveedor actualizado:', resultado);
        toast.success('Proveedor actualizado correctamente');
      } else {
        const resultado = await stockApi.crearProveedor(datosProveedor);
        console.log('✅ Proveedor creado:', resultado);
        toast.success('Proveedor creado correctamente');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error response:', error.response);
      const mensajeError = error.response?.data?.error || error.message || 'Error al guardar el proveedor';
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza los datos del proveedor' : 'Crea un nuevo proveedor para tus compras'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Nombre del proveedor"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cif">CIF/NIF</Label>
              <Input
                id="cif"
                placeholder="CIF o NIF"
                value={formData.cif}
                onChange={(e) => handleChange('cif', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoría *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentos">Alimentos</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="embalaje">Embalaje</SelectItem>
                  <SelectItem value="equipos">Equipos</SelectItem>
                  <SelectItem value="servicios">Servicios</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="diasEntrega">Días de Entrega</Label>
              <Input
                id="diasEntrega"
                type="number"
                min="1"
                value={formData.diasEntrega}
                onChange={(e) => handleChange('diasEntrega', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Datos de Contacto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactoNombre">Nombre Contacto</Label>
                <Input
                  id="contactoNombre"
                  placeholder="Nombre del contacto"
                  value={formData.contactoNombre}
                  onChange={(e) => handleChange('contactoNombre', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contactoTelefono">Teléfono</Label>
                <Input
                  id="contactoTelefono"
                  placeholder="Teléfono"
                  value={formData.contactoTelefono}
                  onChange={(e) => handleChange('contactoTelefono', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="contactoEmail">Email</Label>
              <Input
                id="contactoEmail"
                type="email"
                placeholder="Email"
                value={formData.contactoEmail}
                onChange={(e) => handleChange('contactoEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Dirección</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  placeholder="Calle y número"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    placeholder="Ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleChange('ciudad', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    placeholder="CP"
                    value={formData.codigoPostal}
                    onChange={(e) => handleChange('codigoPostal', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) => handleChange('pais', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Condiciones Comerciales</h3>
            <div>
              <Label htmlFor="formaPago">Forma de Pago</Label>
              <Select value={formData.formaPago} onValueChange={(value) => handleChange('formaPago', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Proveedor'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
