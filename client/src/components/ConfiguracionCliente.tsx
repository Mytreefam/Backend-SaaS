import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'; // Comentado: usando sistema custom
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  CreditCard, 
  Trash2,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Camera,
  Upload,
  Building2,
  FileText,
  RefreshCw,
  UserCog,
  Users,
  Briefcase,
  MapPin,
  ChevronDown
} from 'lucide-react';
import type { User as UserType } from '../App';
import { toast } from 'sonner';
import { LegalLinks } from './legal/LegalLinks';
import { NotificationPreferences } from './NotificationPreferences';
import { MisDirecciones } from './cliente/MisDirecciones';
import { authApi, clientesApi, uploadsApi, type AuthSession } from '../services/api';
import { dispatchAuthExpired } from '../observability/authExpiry';
import { API_CONFIG } from '../config/api.config';

interface ConfiguracionClienteProps {
  user: UserType;
  onCambiarRol?: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
  onNavigateToChat?: () => void;
}

export function ConfiguracionCliente({ user, onCambiarRol, onNavigateToChat }: ConfiguracionClienteProps) {
  const [eliminarCuentaModalOpen, setEliminarCuentaModalOpen] = useState(false);
  const [confirmacionEliminar, setConfirmacionEliminar] = useState('');
  const resolveAvatar = (value?: string | null) => {
    if (!value) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cliente';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/')) return `${API_CONFIG.BASE_URL}${value}`;
    return `${API_CONFIG.BASE_URL}/${value}`;
  };
  const [fotoPerfil, setFotoPerfil] = useState(resolveAvatar(user.avatar));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [cambiarPassOpen, setCambiarPassOpen] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passNueva2, setPassNueva2] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);

  const [sesionesOpen, setSesionesOpen] = useState(false);
  const [sesiones, setSesiones] = useState<AuthSession[]>([]);
  const [sesionesLoading, setSesionesLoading] = useState(false);
  const [isEmpresa, setIsEmpresa] = useState(false);
  const [infoAbierta, setInfoAbierta] = useState(false); // Cerrado por defecto
  const [direccionesAbierta, setDireccionesAbierta] = useState(false); // Cerrado por defecto
  const [tabActiva, setTabActiva] = useState('cuenta');

  const guardarCambios = () => {
    toast.success('Configuración guardada exitosamente');
  };

  const handleTabChange = (value: string) => {
    console.log('🔥 handleTabChange llamado con:', value);
    console.log('🔥 Estado actual tabActiva:', tabActiva);
    setTabActiva(value);
    console.log('🔥 setTabActiva ejecutado con:', value);
  };

  const handleEliminarCuenta = () => {
    if (confirmacionEliminar.toLowerCase() === 'eliminar') {
      toast.success('Cuenta eliminada exitosamente');
      setEliminarCuentaModalOpen(false);
      // Aquí se manejaría el cierre de sesión y eliminación real
    } else {
      toast.error('Por favor escribe "eliminar" para confirmar');
    }
  };

  const handleCambiarFoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file?: File | null) => {
    if (!file) return;
    if (!user?.id) {
      toast.error('No se pudo determinar el usuario');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande (máx 5MB)');
      return;
    }

    setSubiendoFoto(true);
    try {
      const url = await uploadsApi.uploadImage(file);
      const updated = await clientesApi.update(user.id, { avatar: url });
      if (updated) {
        // Store relative path in DB/localStorage; resolve absolute for UI
        setFotoPerfil(resolveAvatar(url));
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...parsed, avatar: url }));
          }
        } catch {}
        toast.success('Foto de perfil actualizada');
      } else {
        toast.error('No se pudo guardar la foto de perfil');
      }
    } catch (e) {
      console.error('Error subiendo foto:', e);
      toast.error('No se pudo subir la foto');
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEliminarFoto = async () => {
    if (!user?.id) return;
    const fallback = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cliente';
    try {
      await clientesApi.update(user.id, { avatar: null as any });
    } catch {
      // ignore
    }
    setFotoPerfil(fallback);
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, avatar: null }));
      }
    } catch {}
    toast.success('Foto de perfil eliminada');
  };

  const handleCambiarPassword = async () => {
    if (!passActual || !passNueva || !passNueva2) {
      toast.error('Completa todos los campos');
      return;
    }
    if (passNueva !== passNueva2) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passNueva.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setCambiandoPass(true);
    try {
      const ok = await authApi.changePassword({ currentPassword: passActual, newPassword: passNueva });
      if (ok) {
        setCambiarPassOpen(false);
        setPassActual('');
        setPassNueva('');
        setPassNueva2('');
        dispatchAuthExpired({ reason: 'password_changed' });
      }
    } finally {
      setCambiandoPass(false);
    }
  };

  const handleOpenSesiones = async () => {
    setSesionesOpen(true);
    setSesionesLoading(true);
    try {
      const list = await authApi.getSessions();
      setSesiones(list);
    } finally {
      setSesionesLoading(false);
    }
  };

  const handleCerrarSesiones = async () => {
    const ok = await authApi.revokeAllSessions();
    if (ok) {
      // Access token may still exist; force safe re-login
      dispatchAuthExpired({ reason: 'sessions_revoked' });
    }
  };

  const handleCambiarRol = () => {
    if (!onCambiarRol) return;
    
    // Rotar entre roles: cliente → trabajador → gerente → cliente
    const siguienteRol = 
      user.role === 'cliente' ? 'trabajador' :
      user.role === 'trabajador' ? 'gerente' :
      'cliente';
    
    const nombreRol = 
      siguienteRol === 'cliente' ? 'Cliente' :
      siguienteRol === 'trabajador' ? 'Colaborador/Trabajador' :
      'Gerente General';
    
    onCambiarRol(siguienteRol);
    toast.success(`Cambiado a perfil de ${nombreRol} 🔄`);
  };

  // Debug: ver estado de la tab activa
  console.log('🎯 RENDER ConfiguracionCliente - tabActiva:', tabActiva);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner de Modo Desarrollo - Cambiar Rol */}
      {onCambiarRol && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 shrink-0">
                  <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">
                    <span className="hidden sm:inline">Modo Desarrollo - Cambio de Perfil</span>
                    <span className="sm:hidden">Cambio de Perfil</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Rol: <span className="font-semibold text-amber-700">
                      {user.role === 'cliente' ? 'Cliente' : 
                       user.role === 'trabajador' ? 'Trabajador' : 'Gerente'}
                    </span>
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleCambiarRol}
                className="bg-amber-600 hover:bg-amber-700 gap-1.5 sm:gap-2 w-full sm:w-auto text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cambiar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema de Tabs Personalizado ULTRA SIMPLIFICADO */}
      <div className="w-full space-y-4">
        {/* Tabs Navigation */}
        <div className="bg-gray-100 rounded-xl p-1">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1" style={{ position: 'relative', zIndex: 10 }}>
            <button
              onClick={() => handleTabChange('cuenta')}
              className={`flex flex-row items-center gap-2 py-2.5 px-4 whitespace-nowrap rounded-xl text-sm font-medium transition-all ${
                tabActiva === 'cuenta'
                  ? 'bg-teal-600 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Cuenta</span>
            </button>
            <button
              onClick={() => handleTabChange('privacidad')}
              className={`flex flex-row items-center gap-2 py-2.5 px-4 whitespace-nowrap rounded-xl text-sm font-medium transition-all ${
                tabActiva === 'privacidad'
                  ? 'bg-teal-600 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Privacidad</span>
            </button>
            <button
              onClick={() => handleTabChange('seguridad')}
              className={`flex flex-row items-center gap-2 py-2.5 px-4 whitespace-nowrap rounded-xl text-sm font-medium transition-all ${
                tabActiva === 'seguridad'
                  ? 'bg-teal-600 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Seguridad</span>
            </button>
            <button
              onClick={() => handleTabChange('notificaciones')}
              className={`flex flex-row items-center gap-2 py-2.5 px-4 whitespace-nowrap rounded-xl text-sm font-medium transition-all ${
                tabActiva === 'notificaciones'
                  ? 'bg-teal-600 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notificaciones</span>
            </button>
            <button
              onClick={() => handleTabChange('sistema')}
              className={`flex flex-row items-center gap-2 py-2.5 px-4 whitespace-nowrap rounded-xl text-sm font-medium transition-all ${
                tabActiva === 'sistema'
                  ? 'bg-teal-600 text-white'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Sistema</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Información de Cuenta */}
        {tabActiva === 'cuenta' && (
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Foto de Perfil</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Personaliza tu imagen de perfil</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="relative shrink-0">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                    <AvatarImage src={fotoPerfil} alt={user?.name || 'Usuario'} />
                    <AvatarFallback className="text-xl sm:text-2xl">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={handleCambiarFoto}
                    className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center shadow-lg transition-colors touch-target"
                  >
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-1">{user?.name || 'Usuario'}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">{user?.email || ''}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={handleCambiarFoto}
                      variant="outline"
                      className="border-teal-600 text-teal-600 hover:bg-teal-50 h-9 sm:h-10 text-xs sm:text-sm"
                      disabled={subiendoFoto}
                    >
                      <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">{subiendoFoto ? 'Subiendo...' : 'Subir nueva foto'}</span>
                      <span className="sm:hidden">{subiendoFoto ? 'Subiendo...' : 'Subir foto'}</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleEliminarFoto}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                      disabled={subiendoFoto}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
              />
            </CardContent>
          </Card>

          {/* Información de Cuenta - Desplegable */}
          <Card>
            <Collapsible open={infoAbierta} onOpenChange={setInfoAbierta}>
              <CardHeader className="p-4 sm:p-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="text-left">
                    <CardTitle className="text-base sm:text-lg md:text-xl">Información de Cuenta</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Actualiza los datos de tu cuenta</CardDescription>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${infoAbierta ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="nombre" className="text-xs sm:text-sm">Nombre Completo</Label>
                  <Input id="nombre" defaultValue={user?.name || ''} className="h-9 sm:h-10 text-sm" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ''} className="h-9 sm:h-10 text-sm" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="telefono" className="text-xs sm:text-sm">Teléfono</Label>
                  <Input id="telefono" type="tel" placeholder="+34 123 456 789" className="h-9 sm:h-10 text-sm" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="idioma" className="text-xs sm:text-sm">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="idioma" className="h-9 sm:h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="direccion" className="text-xs sm:text-sm">Dirección</Label>
                  <Input id="direccion" placeholder="Calle Principal 123" className="h-9 sm:h-10 text-sm" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="ciudad" className="text-xs sm:text-sm">Ciudad</Label>
                  <Input id="ciudad" placeholder="Madrid" className="h-9 sm:h-10 text-sm" />
                </div>
              </div>

              {/* Separador visual */}
              <Separator className="my-6" />

              {/* Información de empresa */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="esEmpresa" 
                    checked={isEmpresa}
                    onCheckedChange={(checked) => setIsEmpresa(checked as boolean)}
                    className="touch-target"
                  />
                  <Label 
                    htmlFor="esEmpresa" 
                    className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm"
                  >
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                    Soy empresa
                  </Label>
                </div>

                {isEmpresa && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-in fade-in-50">
                    {/* Nombre Fiscal */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="nombreFiscal" className="text-xs sm:text-sm">Nombre Fiscal</Label>
                      <div className="relative">
                        <Building2 className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        <Input 
                          id="nombreFiscal" 
                          placeholder="Nombre de la empresa" 
                          className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm" 
                        />
                      </div>
                    </div>

                    {/* CIF */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="cif" className="text-xs sm:text-sm">CIF</Label>
                      <div className="relative">
                        <FileText className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                        <Input 
                          id="cif" 
                          placeholder="A12345678" 
                          className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Separador antes del botón */}
              <Separator className="my-4 sm:my-6" />

              <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base" onClick={guardarCambios}>
                Guardar Cambios
              </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Mis Direcciones */}
          <Card>
            <Collapsible open={direccionesAbierta} onOpenChange={setDireccionesAbierta}>
              <CardHeader className="p-4 sm:p-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full group">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-teal-600" />
                      <CardTitle className="text-base sm:text-lg md:text-xl">Mis Direcciones</CardTitle>
                    </div>
                    <CardDescription className="text-xs sm:text-sm">Gestiona tus direcciones de entrega guardadas</CardDescription>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${direccionesAbierta ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="p-0 sm:p-0">
                  <MisDirecciones clienteId={user.id} />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
          </div>
        )}

        {/* Tab Content: Seguridad */}
        {tabActiva === 'seguridad' && (
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Seguridad</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Gestiona la seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base text-gray-900">Cambiar Contraseña</p>
                      <p className="text-xs sm:text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-9 text-sm"
                    onClick={() => setCambiarPassOpen(true)}
                  >
                    Cambiar
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base text-gray-900">Autenticación de Dos Factores</p>
                      <p className="text-xs sm:text-sm text-gray-600">Agrega una capa extra de seguridad</p>
                    </div>
                  </div>
                  <Switch className="touch-target" />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base text-gray-900">Sesiones Activas</p>
                      <p className="text-xs sm:text-sm text-gray-600">Gestiona los dispositivos con acceso</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto h-9 text-sm" onClick={handleOpenSesiones}>
                    <span className="hidden sm:inline">Ver Sesiones</span>
                    <span className="sm:hidden">Ver</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zona de Peligro - Eliminar Cuenta */}
          <Card className="border-red-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg text-red-600 flex items-center gap-1.5 sm:gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Acciones irreversibles en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm sm:text-base text-gray-900">Eliminar Cuenta</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Elimina permanentemente tu cuenta y todos tus datos
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setEliminarCuentaModalOpen(true)}
                  className="w-full sm:w-auto h-9 text-sm whitespace-nowrap"
                >
                  Eliminar Cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Tab Content: Privacidad */}
        {tabActiva === 'privacidad' && (
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Privacidad</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Controla cómo usamos tus datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900">Compartir datos de uso</p>
                    <p className="text-xs sm:text-sm text-gray-600">Ayúdanos a mejorar el servicio</p>
                  </div>
                  <Switch defaultChecked className="touch-target shrink-0" />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900">Personalización de contenido</p>
                    <p className="text-xs sm:text-sm text-gray-600">Recibe recomendaciones personalizadas</p>
                  </div>
                  <Switch defaultChecked className="touch-target shrink-0" />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900">Seguimiento de ubicación</p>
                    <p className="text-xs sm:text-sm text-gray-600">Para mejorar las entregas de pedidos</p>
                  </div>
                  <Switch defaultChecked className="touch-target shrink-0" />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900">Cookies publicitarias</p>
                    <p className="text-xs sm:text-sm text-gray-600">Mostrar anuncios relevantes</p>
                  </div>
                  <Switch className="touch-target shrink-0" />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900">Historial de pedidos visible</p>
                    <p className="text-xs sm:text-sm text-gray-600">Otros pueden ver tus pedidos frecuentes</p>
                  </div>
                  <Switch className="touch-target shrink-0" />
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <Button variant="outline" className="w-full sm:w-auto h-9 sm:h-10 text-sm">
                  Descargar mis Datos
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Tab Content: Preferencias de Notificación */}
        {tabActiva === 'notificaciones' && (
          <div className="space-y-6">
            <NotificationPreferences usuarioId={user?.id || ''} />
          </div>
        )}

        {/* Tab Content: Sistema */}
        {tabActiva === 'sistema' && (
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Información del Sistema</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Detalles sobre la aplicación y el dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 border rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Versión de la App</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">Hoy Pecamos v2.4.1</p>
                </div>
                <div className="p-3 sm:p-4 border rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Última Actualización</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">24 Noviembre 2024</p>
                </div>
                <div className="p-3 sm:p-4 border rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Plataforma</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">Web / Móvil</p>
                </div>
                <div className="p-3 sm:p-4 border rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">ID de Cliente</p>
                  <p className="font-medium text-sm sm:text-base text-gray-900">#CF-CL-{user?.email ? user.email.substring(0,5).toUpperCase() : '00000'}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Caché y Datos
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm sm:text-base text-gray-900">Borrar caché de la aplicación</p>
                    <p className="text-xs sm:text-sm text-gray-600">Libera espacio y mejora el rendimiento</p>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto h-9 text-sm">Limpiar</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Soporte y Ayuda
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  ¿Tienes alguna pregunta o problema? Nuestro equipo está aquí para ayudarte.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-9 sm:h-10 text-sm"
                    onClick={() => {
                      if (onNavigateToChat) {
                        onNavigateToChat();
                        toast.success('Abriendo Chat y Soporte');
                      }
                    }}
                  >
                    <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    Centro de Ayuda
                  </Button>
                </div>
                
                {/* ✅ Enlaces a documentos legales */}
                <Separator />
                <LegalLinks variant="buttons" />
              </div>

              <Separator />

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-sm sm:text-base text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Acerca de Hoy Pecamos
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  © 2024 Disarmink S.L. - Hoy Pecamos. Todos los derechos reservados.
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tu Sistema 360 de confianza en Barcelona y alrededores.
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

      {/* Modal Eliminar Cuenta */}
      <Dialog open={eliminarCuentaModalOpen} onOpenChange={setEliminarCuentaModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-sm sm:text-base md:text-lg text-red-600 flex items-center gap-1.5 sm:gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              ¿Eliminar cuenta permanentemente?
            </DialogTitle>
            <DialogDescription className="space-y-2 text-xs sm:text-sm">
              <p>Esta acción no se puede deshacer. Se eliminarán permanentemente:</p>
              <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                <li>Tu información personal</li>
                <li>Historial de pedidos</li>
                <li>Preferencias guardadas</li>
                <li>Datos de pago</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmar-eliminar" className="text-xs sm:text-sm">
                Escribe <span className="font-bold text-red-600">"eliminar"</span> para confirmar
              </Label>
              <Input
                id="confirmar-eliminar"
                value={confirmacionEliminar}
                onChange={(e) => setConfirmacionEliminar(e.target.value)}
                placeholder="eliminar"
                className="h-9 sm:h-10 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEliminarCuentaModalOpen(false)}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminarCuenta}
              disabled={confirmacionEliminar.toLowerCase() !== 'eliminar'}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              Eliminar Cuenta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cambiar Contraseña */}
      <Dialog open={cambiarPassOpen} onOpenChange={setCambiarPassOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-sm sm:text-base md:text-lg">Cambiar contraseña</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Introduce tu contraseña actual y define una nueva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="pass-actual" className="text-xs sm:text-sm">Contraseña actual</Label>
              <Input
                id="pass-actual"
                type="password"
                value={passActual}
                onChange={(e) => setPassActual(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="pass-nueva" className="text-xs sm:text-sm">Nueva contraseña</Label>
              <Input
                id="pass-nueva"
                type="password"
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="pass-nueva2" className="text-xs sm:text-sm">Confirmar nueva contraseña</Label>
              <Input
                id="pass-nueva2"
                type="password"
                value={passNueva2}
                onChange={(e) => setPassNueva2(e.target.value)}
                className="h-9 sm:h-10 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCambiarPassOpen(false)}
              disabled={cambiandoPass}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCambiarPassword}
              disabled={cambiandoPass}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm bg-teal-600 hover:bg-teal-700"
            >
              {cambiandoPass ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Sesiones Activas */}
      <Dialog open={sesionesOpen} onOpenChange={setSesionesOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-sm sm:text-base md:text-lg">Sesiones activas</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Lista de sesiones (refresh tokens) activas. Puedes cerrar todas si detectas actividad sospechosa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {sesionesLoading ? (
              <div className="text-sm text-gray-600">Cargando sesiones...</div>
            ) : sesiones.length === 0 ? (
              <div className="text-sm text-gray-600">No hay sesiones activas.</div>
            ) : (
              <div className="space-y-2">
                {sesiones.map((s) => (
                  <div key={s.id} className="border rounded-lg p-3">
                    <div className="text-sm text-gray-900">Sesión #{s.id}</div>
                    <div className="text-xs text-gray-600 break-words">
                      {s.userAgent || 'User-Agent desconocido'}
                    </div>
                    <div className="text-xs text-gray-600">
                      IP: {s.ip || '—'} · Creada: {new Date(s.createdAt).toLocaleString()} · Expira: {new Date(s.expiresAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSesionesOpen(false)}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCerrarSesiones}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              disabled={sesionesLoading}
            >
              Cerrar todas las sesiones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}