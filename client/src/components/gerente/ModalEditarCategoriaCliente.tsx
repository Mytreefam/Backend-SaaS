import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import {
  Package,
  Info,
  AlertCircle,
  Bug,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { CategoriaCliente } from '../../contexts/ConfiguracionChatsContext';

interface ModalEditarCategoriaClienteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: CategoriaCliente | null;
  onGuardar: (categoria: CategoriaCliente) => void;
}

export function ModalEditarCategoriaCliente({
  open,
  onOpenChange,
  categoria,
  onGuardar,
}: ModalEditarCategoriaClienteProps) {
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [icono, setIcono] = useState(categoria?.icono || 'MessageSquare');
  const [color, setColor] = useState(categoria?.color || 'bg-blue-100 text-blue-700 border-blue-200');
  const [destinoTipo, setDestinoTipo] = useState<'EQUIPO' | 'OTRA_TIENDA' | 'EMAIL' | 'WHATSAPP'>(categoria?.destinoTipo || 'EQUIPO');
  const [destinoValor, setDestinoValor] = useState(categoria?.destinoValor || '');
  const [permiteAdjuntos, setPermiteAdjuntos] = useState(categoria?.permiteAdjuntos || false);

  useEffect(() => {
    if (open) {
      setNombre(categoria?.nombre || '');
      setIcono(categoria?.icono || 'MessageSquare');
      setColor(categoria?.color || 'bg-blue-100 text-blue-700 border-blue-200');
      setDestinoTipo(categoria?.destinoTipo || 'EQUIPO');
      setDestinoValor(categoria?.destinoValor || '');
      setPermiteAdjuntos(categoria?.permiteAdjuntos || false);
    }
  }, [open, categoria]);

  const iconosDisponibles = [
    { value: 'Package', label: 'Paquete', icon: Package },
    { value: 'Info', label: 'Información', icon: Info },
    { value: 'AlertCircle', label: 'Alerta', icon: AlertCircle },
    { value: 'Bug', label: 'Error/Bug', icon: Bug },
    { value: 'HelpCircle', label: 'Ayuda', icon: HelpCircle },
    { value: 'MessageSquare', label: 'Mensaje', icon: MessageSquare },
    { value: 'AlertTriangle', label: 'Advertencia', icon: AlertTriangle },
    { value: 'FileText', label: 'Documento', icon: FileText },
    { value: 'Settings', label: 'Configuración', icon: Settings },
  ];

  const coloresDisponibles = [
    { value: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Azul' },
    { value: 'bg-green-100 text-green-700 border-green-200', label: 'Verde' },
    { value: 'bg-red-100 text-red-700 border-red-200', label: 'Rojo' },
    { value: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Naranja' },
    { value: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Morado' },
    { value: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Amarillo' },
    { value: 'bg-pink-100 text-pink-700 border-pink-200', label: 'Rosa' },
    { value: 'bg-teal-100 text-teal-700 border-teal-200', label: 'Turquesa' },
    { value: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Gris' },
  ];

  const getIconComponent = (iconName: string) => {
    const iconData = iconosDisponibles.find(i => i.value === iconName);
    if (!iconData) return <MessageSquare className="w-5 h-5" />;
    const Icon = iconData.icon;
    return <Icon className="w-5 h-5" />;
  };

  const handleGuardar = () => {
    if (!nombre.trim()) return;

    const categoriaGuardada: CategoriaCliente = categoria 
      ? {
          ...categoria,
          nombre: nombre.trim(),
          icono,
          color,
          destinoTipo,
          destinoValor: destinoValor.trim(),
          permiteAdjuntos,
        }
      : {
          id: '',
          nombre: nombre.trim(),
          icono,
          color,
          activo: true,
          orden: 0,
          destinoTipo,
          destinoValor: destinoValor.trim(),
          permiteAdjuntos,
        };

    onGuardar(categoriaGuardada);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            {categoria ? 'Editar' : 'Nueva'} Categoría de Cliente
          </DialogTitle>
          <DialogDescription>
            {categoria 
              ? 'Personaliza el nombre, icono y color de la categoría'
              : 'Crea una nueva categoría para que los clientes puedan contactarte'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la categoría</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pedidos, Información..."
              maxLength={50}
            />
          </div>

          {/* Icono */}
          <div className="space-y-2">
            <Label htmlFor="icono">Icono</Label>
            <Select value={icono} onValueChange={setIcono}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {getIconComponent(icono)}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {iconosDisponibles.map((ic) => {
                  const Icon = ic.icon;
                  return (
                    <SelectItem key={ic.value} value={ic.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {ic.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color del badge</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color}`} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {coloresDisponibles.map((col) => (
                  <SelectItem key={col.value} value={col.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${col.value}`} />
                      {col.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Destino */}
          <div className="space-y-2">
            <Label htmlFor="destino-tipo">Destino de las consultas</Label>
            <Select value={destinoTipo} onValueChange={(value: any) => setDestinoTipo(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  {destinoTipo === 'EQUIPO' && <Users className="w-4 h-4" />}
                  {destinoTipo === 'OTRA_TIENDA' && <Building className="w-4 h-4" />}
                  {destinoTipo === 'EMAIL' && <Mail className="w-4 h-4" />}
                  {destinoTipo === 'WHATSAPP' && <Phone className="w-4 h-4" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUIPO">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Equipo interno
                  </div>
                </SelectItem>
                <SelectItem value="OTRA_TIENDA">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Otra tienda
                  </div>
                </SelectItem>
                <SelectItem value="EMAIL">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="WHATSAPP">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valor del Destino */}
          <div className="space-y-2">
            <Label htmlFor="destino-valor">
              {destinoTipo === 'EQUIPO' && 'Nombre del equipo'}
              {destinoTipo === 'OTRA_TIENDA' && 'Nombre de la tienda'}
              {destinoTipo === 'EMAIL' && 'Dirección de email'}
              {destinoTipo === 'WHATSAPP' && 'Número de WhatsApp'}
            </Label>
            <Input
              id="destino-valor"
              value={destinoValor}
              onChange={(e) => setDestinoValor(e.target.value)}
              placeholder={
                destinoTipo === 'EQUIPO' ? 'Ej: Equipo de Pedidos' :
                destinoTipo === 'OTRA_TIENDA' ? 'Ej: Tienda Central' :
                destinoTipo === 'EMAIL' ? 'Ej: soporte@tuempresa.com' :
                'Ej: +34 612 345 678'
              }
            />
          </div>

          <Separator />

          {/* Permite Adjuntos */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Permitir adjuntos</Label>
              <p className="text-xs text-gray-500">
                Los clientes podrán adjuntar imágenes o archivos en sus mensajes
              </p>
            </div>
            <Switch
              checked={permiteAdjuntos}
              onCheckedChange={setPermiteAdjuntos}
            />
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <Label className="text-xs text-gray-600 mb-2 block">Vista previa:</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">
                {getIconComponent(icono)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{nombre || 'Nombre de categoría'}</p>
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs border mt-1 ${color}`}>
                  {nombre || 'Categoría'}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                  {destinoTipo === 'EQUIPO' && <Users className="w-3 h-3" />}
                  {destinoTipo === 'OTRA_TIENDA' && <Building className="w-3 h-3" />}
                  {destinoTipo === 'EMAIL' && <Mail className="w-3 h-3" />}
                  {destinoTipo === 'WHATSAPP' && <Phone className="w-3 h-3" />}
                  <span>{destinoValor || 'Sin destino configurado'}</span>
                  {permiteAdjuntos && (
                    <span className="ml-2 text-purple-600">• Admite adjuntos</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={!nombre.trim()} className="bg-teal-600 hover:bg-teal-700">
            {categoria ? 'Guardar Cambios' : 'Crear Categoría'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
