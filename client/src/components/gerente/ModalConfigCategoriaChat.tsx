import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import {
  Wrench,
  Users,
  Package,
  AlertTriangle,
  Building,
  FileText,
  Mail,
  MessageCircle,
  Settings,
  Zap,
  Bell,
  HelpCircle,
  Shield,
  Cpu,
  Database
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { CategoriaTrabajador } from '../../contexts/ConfiguracionChatsContext';

interface ModalConfigCategoriaChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: CategoriaTrabajador | null;
  onGuardar: (categoria: CategoriaTrabajador) => void;
}

// ============= DATOS MOCK =============

const MIEMBROS_EQUIPO = [
  { id: 'GERENTE-001', nombre: 'Jorge Martín', rol: 'Gerente General' },
  { id: 'GERENTE-002', nombre: 'Ana López', rol: 'Gerente RRHH' },
  { id: 'GERENTE-003', nombre: 'Carlos Ruiz', rol: 'Responsable Almacén' },
  { id: 'TRAB-101', nombre: 'Juan Pérez', rol: 'Trabajador' },
  { id: 'TRAB-102', nombre: 'María García', rol: 'Trabajador' },
  { id: 'TRAB-103', nombre: 'Pedro Sánchez', rol: 'Trabajador' }
];

const TIENDAS = [
  { id: 'PV-TIA', nombre: 'Can Farines - Tiana' },
  { id: 'PV-BDN', nombre: 'Can Farines - Badalona' },
  { id: 'PV-POB', nombre: 'Can Farines - Poblenou' },
  { id: 'PV-GRA', nombre: 'Can Farines - Gràcia' },
  { id: 'PV-SMA', nombre: 'Can Farines - Sant Martí' }
];

const ICONOS_DISPONIBLES = [
  { value: 'Wrench', label: 'Llave inglesa', icon: Wrench },
  { value: 'Users', label: 'Usuarios', icon: Users },
  { value: 'Package', label: 'Paquete', icon: Package },
  { value: 'AlertTriangle', label: 'Alerta', icon: AlertTriangle },
  { value: 'Building', label: 'Edificio', icon: Building },
  { value: 'FileText', label: 'Documento', icon: FileText },
  { value: 'Mail', label: 'Correo', icon: Mail },
  { value: 'MessageCircle', label: 'Mensaje', icon: MessageCircle },
  { value: 'Settings', label: 'Configuración', icon: Settings },
  { value: 'Zap', label: 'Rayo', icon: Zap },
  { value: 'Bell', label: 'Campana', icon: Bell },
  { value: 'HelpCircle', label: 'Ayuda', icon: HelpCircle },
  { value: 'Shield', label: 'Escudo', icon: Shield },
  { value: 'Cpu', label: 'CPU', icon: Cpu },
  { value: 'Database', label: 'Base de datos', icon: Database }
];

// ============= COMPONENTE =============

export function ModalConfigCategoriaChat({
  open,
  onOpenChange,
  categoria,
  onGuardar
}: ModalConfigCategoriaChatProps) {
  // Estados
  const [nombre, setNombre] = useState('');
  const [icono, setIcono] = useState('FileText');
  const [destinoTipo, setDestinoTipo] = useState<'EQUIPO' | 'OTRA_TIENDA' | 'EMAIL' | 'WHATSAPP'>('EQUIPO');
  const [destinoValor, setDestinoValor] = useState('');
  const [activo, setActivo] = useState(true);
  const [permiteAdjuntos, setPermiteAdjuntos] = useState(true);

  // Estados para múltiples destinatarios (EQUIPO)
  const [miembrosSeleccionados, setMiembrosSeleccionados] = useState<string[]>([]);

  // Estados para múltiples tiendas (OTRA_TIENDA)
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState<string[]>([]);

  // Cargar datos si se está editando
  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre);
      setIcono(categoria.icono);
      setDestinoTipo(categoria.destinoTipo);
      setDestinoValor(categoria.destinoValor);
      setActivo(categoria.activo);
      setPermiteAdjuntos(categoria.permiteAdjuntos);

      // Si es EQUIPO, cargar miembros seleccionados
      if (categoria.destinoTipo === 'EQUIPO' && categoria.destinoValor) {
        setMiembrosSeleccionados(categoria.destinoValor.split(','));
      }

      // Si es OTRA_TIENDA, cargar tiendas seleccionadas
      if (categoria.destinoTipo === 'OTRA_TIENDA' && categoria.destinoValor) {
        setTiendasSeleccionadas(categoria.destinoValor.split(','));
      }
    } else {
      // Resetear para crear nueva
      resetForm();
    }
  }, [categoria, open]);

  const resetForm = () => {
    setNombre('');
    setIcono('FileText');
    setDestinoTipo('EQUIPO');
    setDestinoValor('');
    setActivo(true);
    setPermiteAdjuntos(true);
    setMiembrosSeleccionados([]);
    setTiendasSeleccionadas([]);
  };

  // ============= FUNCIONES =============

  const handleGuardar = () => {
    // Validaciones
    if (!nombre.trim()) {
      toast.error('El nombre de la consulta es obligatorio');
      return;
    }

    if (destinoTipo === 'EQUIPO' && miembrosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un miembro del equipo');
      return;
    }

    if (destinoTipo === 'OTRA_TIENDA' && tiendasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una tienda');
      return;
    }

    if (destinoTipo === 'EMAIL' && !destinoValor.trim()) {
      toast.error('El correo electrónico es obligatorio');
      return;
    }

    if (destinoTipo === 'EMAIL' && !isValidEmail(destinoValor)) {
      toast.error('El correo electrónico no es válido');
      return;
    }

    if (destinoTipo === 'WHATSAPP' && !destinoValor.trim()) {
      toast.error('El número de teléfono es obligatorio');
      return;
    }

    if (destinoTipo === 'WHATSAPP' && !isValidPhone(destinoValor)) {
      toast.error('El número de teléfono no es válido');
      return;
    }

    // Preparar valor de destino
    let valorFinal = '';
    if (destinoTipo === 'EQUIPO') {
      valorFinal = miembrosSeleccionados.join(',');
    } else if (destinoTipo === 'OTRA_TIENDA') {
      valorFinal = tiendasSeleccionadas.join(',');
    } else {
      valorFinal = destinoValor;
    }

    const categoriaData: CategoriaChat = {
      accionId: categoria?.accionId || '',
      empresaId: categoria?.empresaId || 'EMP-HOSTELERIA',
      nombre: nombre.trim(),
      icono,
      destinoTipo,
      destinoValor: valorFinal,
      activo,
      permiteAdjuntos,
      orden: categoria?.orden || 0,
      esProtegida: categoria?.esProtegida || false
    };

    onGuardar(categoriaData);
    resetForm();
  };

  const handleToggleMiembro = (miembroId: string) => {
    setMiembrosSeleccionados(prev => {
      if (prev.includes(miembroId)) {
        return prev.filter(id => id !== miembroId);
      } else {
        return [...prev, miembroId];
      }
    });
  };

  const handleToggleTienda = (tiendaId: string) => {
    setTiendasSeleccionadas(prev => {
      if (prev.includes(tiendaId)) {
        return prev.filter(id => id !== tiendaId);
      } else {
        return [...prev, tiendaId];
      }
    });
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\+?[0-9\s-()]+$/.test(phone);
  };

  const getIconComponent = (iconName: string) => {
    const iconData = ICONOS_DISPONIBLES.find(i => i.value === iconName);
    const Icon = iconData?.icon || FileText;
    return Icon;
  };

  // ============= RENDER =============

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            {categoria ? 'Editar categoría de consulta' : 'Nueva categoría de consulta'}
          </DialogTitle>
          <DialogDescription>
            {categoria?.esProtegida 
              ? 'Esta es una categoría protegida. Puedes modificar su configuración pero no eliminarla.'
              : 'Configura los detalles de la categoría de consulta.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nombre de la consulta */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la consulta *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Avería maquinaria"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Icono */}
          <div className="space-y-2">
            <Label htmlFor="icono">Icono *</Label>
            <Select value={icono} onValueChange={setIcono}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getIconComponent(icono);
                      return <Icon className="w-4 h-4" />;
                    })()}
                    <span>{ICONOS_DISPONIBLES.find(i => i.value === icono)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ICONOS_DISPONIBLES.map((iconItem) => {
                  const Icon = iconItem.icon;
                  return (
                    <SelectItem key={iconItem.value} value={iconItem.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{iconItem.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tipo de Destino */}
          <div className="space-y-2">
            <Label htmlFor="destino">Destino *</Label>
            <Select 
              value={destinoTipo} 
              onValueChange={(value) => {
                setDestinoTipo(value as any);
                setDestinoValor('');
                setMiembrosSeleccionados([]);
                setTiendasSeleccionadas([]);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUIPO">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Equipo interno</span>
                  </div>
                </SelectItem>
                <SelectItem value="OTRA_TIENDA">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Otra tienda</span>
                  </div>
                </SelectItem>
                <SelectItem value="EMAIL">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Correo electrónico</span>
                  </div>
                </SelectItem>
                <SelectItem value="WHATSAPP">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Miembros del Equipo (EQUIPO) */}
          {destinoTipo === 'EQUIPO' && (
            <div className="space-y-2">
              <Label>Miembros del equipo *</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {MIEMBROS_EQUIPO.map((miembro) => (
                  <div
                    key={miembro.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      miembrosSeleccionados.includes(miembro.id)
                        ? 'bg-teal-50 border-2 border-teal-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => handleToggleMiembro(miembro.id)}
                  >
                    <input
                      type="checkbox"
                      checked={miembrosSeleccionados.includes(miembro.id)}
                      onChange={() => handleToggleMiembro(miembro.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{miembro.nombre}</p>
                      <p className="text-xs text-gray-600">{miembro.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">
                {miembrosSeleccionados.length} miembro(s) seleccionado(s)
              </p>
            </div>
          )}

          {/* Selector de Tiendas (OTRA_TIENDA) */}
          {destinoTipo === 'OTRA_TIENDA' && (
            <div className="space-y-2">
              <Label>Tiendas destino *</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                {TIENDAS.map((tienda) => (
                  <div
                    key={tienda.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      tiendasSeleccionadas.includes(tienda.id)
                        ? 'bg-teal-50 border-2 border-teal-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    onClick={() => handleToggleTienda(tienda.id)}
                  >
                    <input
                      type="checkbox"
                      checked={tiendasSeleccionadas.includes(tienda.id)}
                      onChange={() => handleToggleTienda(tienda.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{tienda.nombre}</p>
                      <p className="text-xs text-gray-600">{tienda.id}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">
                {tiendasSeleccionadas.length} tienda(s) seleccionada(s)
              </p>
            </div>
          )}

          {/* Input Email (EMAIL) */}
          {destinoTipo === 'EMAIL' && (
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@empresa.com"
                value={destinoValor}
                onChange={(e) => setDestinoValor(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Los chats enviados a este destino generarán un correo automático
              </p>
            </div>
          )}

          {/* Input WhatsApp (WHATSAPP) */}
          {destinoTipo === 'WHATSAPP' && (
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número de teléfono *</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+34 612 345 678"
                value={destinoValor}
                onChange={(e) => setDestinoValor(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Incluye el código de país (ej: +34 para España)
              </p>
            </div>
          )}

          <Separator />

          {/* Toggle Activo */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base">Activar categoría</Label>
              <p className="text-sm text-gray-600">
                Si está desactivada, no aparecerá en el selector de chats
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivo(!activo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                activo ? 'bg-teal-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  activo ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle Adjuntos */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base">Permitir adjuntar archivos</Label>
              <p className="text-sm text-gray-600">
                Los usuarios podrán adjuntar archivos en esta categoría
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPermiteAdjuntos(!permiteAdjuntos)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                permiteAdjuntos ? 'bg-teal-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  permiteAdjuntos ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <Separator />

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {categoria ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
