import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Camera,
  IdCard,
  FileText,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  CreditCard,
  Building2,
  Upload,
  File,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  UserCog,
  ChevronDown,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Badge } from '../ui/badge';
import type { User as UserType } from '../../App';

interface ConfiguracionTrabajadorProps {
  user?: UserType;
  onCambiarRol?: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
}

export function ConfiguracionTrabajador({ user, onCambiarRol }: ConfiguracionTrabajadorProps = {}) {
  const [filtroActivo, setFiltroActivo] = useState('cuenta');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [documentos, setDocumentos] = useState([
    { id: 1, nombre: 'DNI', tipo: 'image/jpeg', fecha: '2024-03-15', size: '2.3 MB' },
    { id: 2, nombre: 'Cuenta Bancaria', tipo: 'application/pdf', fecha: '2024-03-10', size: '485 KB' },
    { id: 3, nombre: 'Vida Laboral', tipo: 'application/pdf', fecha: '2024-02-28', size: '1.1 MB' },
  ]);

  const handleGuardar = () => {
    toast.success('Configuración guardada correctamente');
  };

  const handleCambiarRol = () => {
    if (!onCambiarRol || !user) return;
    
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

  const handleSubirDocumento = (tipo: 'camara' | 'archivo') => {
    if (tipo === 'camara') {
      toast.success('Abriendo cámara...');
      // Simular subida desde cámara
      setTimeout(() => {
        const nuevoDoc = {
          id: Date.now(),
          nombre: 'Documento desde cámara',
          tipo: 'image/jpeg',
          fecha: new Date().toISOString().split('T')[0],
          size: '1.5 MB'
        };
        setDocumentos([...documentos, nuevoDoc]);
        toast.success('Documento subido correctamente');
      }, 1000);
    } else {
      toast.success('Seleccionando archivo...');
      // Simular subida desde archivo
      setTimeout(() => {
        const nuevoDoc = {
          id: Date.now(),
          nombre: 'Documento desde archivo',
          tipo: 'application/pdf',
          fecha: new Date().toISOString().split('T')[0],
          size: '890 KB'
        };
        setDocumentos([...documentos, nuevoDoc]);
        toast.success('Documento subido correctamente');
      }, 1000);
    }
    setUploadModalOpen(false);
  };

  const handleEliminarDocumento = (id: number) => {
    setDocumentos(documentos.filter(doc => doc.id !== id));
    toast.success('Documento eliminado correctamente');
  };

  const handleDescargarDocumento = (nombre: string) => {
    toast.success(`Descargando ${nombre}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Configuración
        </h1>
        <p className="text-gray-600 text-sm">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Banner de Modo Desarrollo - Cambiar Rol */}
      {onCambiarRol && user && (
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
                className="bg-amber-600 hover:bg-amber-700 gap-1.5 sm:gap-2 w-full sm:w-auto text-sm h-9 sm:h-10"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cambiar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros superiores */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Button
          variant={filtroActivo === 'cuenta' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('cuenta')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'cuenta' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Cuenta
        </Button>
        <Button
          variant={filtroActivo === 'info' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('info')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'info' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <IdCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Info
        </Button>
        <Button
          variant={filtroActivo === 'documentacion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('documentacion')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'documentacion' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Documentación
        </Button>
        <Button
          variant={filtroActivo === 'permisos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('permisos')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'permisos' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Permisos
        </Button>
        <Button
          variant={filtroActivo === 'privacidad' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('privacidad')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'privacidad' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Privacidad
        </Button>
        <Button
          variant={filtroActivo === 'seguridad' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('seguridad')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'seguridad' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Seguridad
        </Button>
        <Button
          variant={filtroActivo === 'notificaciones' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('notificaciones')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'notificaciones' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Notificaciones</span>
          <span className="sm:hidden">Notif.</span>
        </Button>
        <Button
          variant={filtroActivo === 'sistema' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('sistema')}
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'sistema' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Sistema
        </Button>
      </div>

      {/* Contenido según filtro activo */}
      {filtroActivo === 'cuenta' && (
        <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3MzE2MTMyMDh8MA&ixlib=rb-4.0.3&q=80&w=200" />
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl">
                    JP
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => {
                    toast.info('Abriendo selector de imagen...');
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Juan Pérez</p>
                <p className="text-sm text-gray-600">Panadero</p>
              </div>
              <Button
                onClick={() => {
                  toast.info('Selecciona una nueva foto de perfil');
                }}
                variant="outline"
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Cambiar foto de perfil
              </Button>
            </div>

            <div className="space-y-4">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="nombre" 
                    placeholder="Juan Pérez" 
                    defaultValue="Juan Pérez" 
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* DNI/NIE */}
              <div className="space-y-2">
                <Label htmlFor="dni">DNI/NIE</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="dni" 
                    placeholder="12345678A" 
                    defaultValue="12345678A"
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Número de la Seguridad Social */}
              <div className="space-y-2">
                <Label htmlFor="seguridad-social">Número de la Seguridad Social</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="seguridad-social" 
                    placeholder="281234567890" 
                    defaultValue="281234567890"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Grid de 2 columnas para Teléfono y Email */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="telefono" 
                      type="tel" 
                      placeholder="+34 600 123 456" 
                      defaultValue="+34 612 345 678"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="juan.perez@canfarines.com" 
                      defaultValue="juan.perez@canfarines.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección Postal */}
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección Postal</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="direccion" 
                    placeholder="Calle Principal 123, 2º A" 
                    defaultValue="Calle Mallorca 45, 3º B"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Grid de 2 columnas para Código Postal y Población */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Código Postal */}
                <div className="space-y-2">
                  <Label htmlFor="codigo-postal">Código Postal</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="codigo-postal" 
                      placeholder="07001" 
                      defaultValue="07001"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Población */}
                <div className="space-y-2">
                  <Label htmlFor="poblacion">Población</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="poblacion" 
                      placeholder="Palma de Mallorca" 
                      defaultValue="Palma de Mallorca"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Grid de 2 columnas para Fecha de Nacimiento y Lugar */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fecha-nacimiento">Fecha de Nacimiento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="fecha-nacimiento" 
                      type="date" 
                      defaultValue="1990-05-15"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Lugar de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="lugar-nacimiento">Lugar de Nacimiento</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="lugar-nacimiento" 
                      placeholder="Palma de Mallorca" 
                      defaultValue="Palma de Mallorca"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Cuenta Bancaria (IBAN) */}
              <div className="space-y-2">
                <Label htmlFor="cuenta-bancaria">Cuenta Bancaria (IBAN)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="cuenta-bancaria" 
                    placeholder="ES00 0000 0000 0000 0000 0000" 
                    defaultValue="ES91 2100 0418 4502 0005 1332"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Separador antes de botones */}
            <Separator className="my-6" />

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nueva sección: Info */}
      {filtroActivo === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxtYW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3MzE2MTMyMDh8MA&ixlib=rb-4.0.3&q=80&w=200" />
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl">
                    JP
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => {
                    toast.info('Abriendo selector de imagen...');
                  }}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Juan Pérez</p>
                <p className="text-sm text-gray-600">Panadero</p>
              </div>
              <Button
                onClick={() => {
                  toast.info('Selecciona una nueva foto de perfil');
                }}
                variant="outline"
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Cambiar foto de perfil
              </Button>
            </div>

            <div className="space-y-4">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <Label htmlFor="nombre-info">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="nombre-info" 
                    placeholder="Juan Pérez" 
                    defaultValue="Juan Pérez" 
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* DNI/NIE */}
              <div className="space-y-2">
                <Label htmlFor="dni-info">DNI/NIE</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="dni-info" 
                    placeholder="12345678A" 
                    defaultValue="12345678A"
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Número de la Seguridad Social */}
              <div className="space-y-2">
                <Label htmlFor="seguridad-social-info">Número de la Seguridad Social</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="seguridad-social-info" 
                    placeholder="281234567890" 
                    defaultValue="281234567890"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Grid de 2 columnas para Teléfono y Email */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="telefono-info">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="telefono-info" 
                      type="tel" 
                      placeholder="+34 600 123 456" 
                      defaultValue="+34 612 345 678"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="space-y-2">
                  <Label htmlFor="email-info">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="email-info" 
                      type="email" 
                      placeholder="juan.perez@canfarines.com" 
                      defaultValue="juan.perez@canfarines.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección Postal */}
              <div className="space-y-2">
                <Label htmlFor="direccion-info">Dirección Postal</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="direccion-info" 
                    placeholder="Calle Principal 123, 2º A" 
                    defaultValue="Calle Mallorca 45, 3º B"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Grid de 2 columnas para Código Postal y Población */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Código Postal */}
                <div className="space-y-2">
                  <Label htmlFor="codigo-postal-info">Código Postal</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="codigo-postal-info" 
                      placeholder="07001" 
                      defaultValue="07001"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Población */}
                <div className="space-y-2">
                  <Label htmlFor="poblacion-info">Población</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="poblacion-info" 
                      placeholder="Palma de Mallorca" 
                      defaultValue="Palma de Mallorca"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Grid de 2 columnas para Fecha de Nacimiento y Lugar */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Fecha de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fecha-nacimiento-info">Fecha de Nacimiento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="fecha-nacimiento-info" 
                      type="date" 
                      defaultValue="1990-05-15"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Lugar de Nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="lugar-nacimiento-info">Lugar de Nacimiento</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="lugar-nacimiento-info" 
                      placeholder="Palma de Mallorca" 
                      defaultValue="Palma de Mallorca"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Separador antes de botones */}
            <Separator className="my-6" />

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nueva sección: Documentación */}
      {filtroActivo === 'documentacion' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Documentación Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sección de Documentos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Documentos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sube y gestiona tus documentos personales
                  </p>
                </div>
                <Button 
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Subir documento
                </Button>
              </div>

              {/* Lista de documentos */}
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {doc.tipo === 'application/pdf' ? (
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {doc.size} • {doc.fecha}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDescargarDocumento(doc.nombre)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminarDocumento(doc.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'privacidad' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Configuración de Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Estado en Línea</Label>
                  <p className="text-sm text-gray-500">Otros pueden ver cuando estás conectado</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Perfil Visible</Label>
                  <p className="text-sm text-gray-500">Tu perfil es visible para otros colaboradores</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Estadísticas</Label>
                  <p className="text-sm text-gray-500">Permite que el gerente vea tus métricas de rendimiento</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar en Directorio</Label>
                  <p className="text-sm text-gray-500">Aparecer en el directorio de empleados</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'seguridad' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Seguridad de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-actual">Contraseña Actual</Label>
                <Input id="password-actual" type="password" placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-nueva">Nueva Contraseña</Label>
                <Input id="password-nueva" type="password" placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-confirmar">Confirmar Nueva Contraseña</Label>
                <Input id="password-confirmar" type="password" placeholder="••••••••" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores (2FA)</Label>
                  <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cerrar Sesión Automáticamente</Label>
                  <p className="text-sm text-gray-500">Cierra sesión después de 30 minutos de inactividad</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Última sesión:</strong> Hoy a las 08:30 desde dispositivo móvil
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Actualizar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'notificaciones' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Preferencias de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Notificaciones de Trabajo */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">Notificaciones de Trabajo</span>
                    <Badge variant="secondary" className="ml-2">3</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones de Tareas</Label>
                    <p className="text-sm text-gray-500">Recibe alertas cuando se te asignen nuevas tareas</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Fichaje</Label>
                    <p className="text-sm text-gray-500">Te recordamos fichar entrada y salida</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cambios en Turnos</Label>
                    <p className="text-sm text-gray-500">Notificaciones sobre modificaciones en tu horario</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Comunicación */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Comunicación</span>
                    <Badge variant="secondary" className="ml-2">2</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mensajes del Equipo</Label>
                    <p className="text-sm text-gray-500">Recibe notificaciones de mensajes del chat</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anuncios de la Empresa</Label>
                    <p className="text-sm text-gray-500">Mantente informado de noticias importantes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Notificaciones por Email */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Notificaciones por Email</span>
                    <Badge variant="secondary" className="ml-2">2</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumen Semanal</Label>
                    <p className="text-sm text-gray-500">Recibe un resumen de tu actividad cada semana</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones del Sistema</Label>
                    <p className="text-sm text-gray-500">Información sobre nuevas funcionalidades</p>
                  </div>
                  <Switch />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'permisos' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Permisos de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Estos permisos son gestionados por tu gerente. Si necesitas acceso adicional, contacta con recursos humanos.
                </p>
              </div>

              <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Accesos Actuales
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ver Inventario</p>
                      <p className="text-sm text-gray-500">Acceso a consultar stock y materiales</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Gestionar Tareas</p>
                      <p className="text-sm text-gray-500">Crear y completar tareas asignadas</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ver Agenda</p>
                      <p className="text-sm text-gray-500">Consultar horarios y turnos</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Activo</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Gestionar Proveedores</p>
                      <p className="text-sm text-gray-400">Requiere permisos de gerente</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500">Inactivo</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'sistema' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Versión de la App</p>
                  <p className="font-medium text-gray-900">Can Farines v2.4.1</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Última Actualización</p>
                  <p className="font-medium text-gray-900">24 Noviembre 2024</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Dispositivo</p>
                  <p className="font-medium text-gray-900">Web / Móvil</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">ID de Usuario</p>
                  <p className="font-medium text-gray-900">#CF-TR-00423</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Almacenamiento
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Documentos subidos</span>
                    <span className="text-gray-900 font-medium">4,7 MB de 50 MB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: '9.4%' }}></div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Soporte
                </h3>
                <p className="text-sm text-gray-600">
                  Si tienes algún problema técnico o necesitas ayuda, contacta con nuestro equipo de soporte.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    soporte@canfarines.com
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    +34 933 123 456
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Acerca de Can Farines
                </h3>
                <p className="text-sm text-gray-600">
                  © 2024 Can Farines. Todos los derechos reservados.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Términos de Uso</Button>
                  <Button variant="outline" size="sm">Política de Privacidad</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de subida de documentos */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Subir Documento
            </DialogTitle>
            <DialogDescription>
              Elige cómo deseas subir tu documento
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              onClick={() => handleSubirDocumento('camara')}
              className="h-32 flex flex-col items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700"
            >
              <Camera className="w-8 h-8" />
              <span>Hacer Foto</span>
            </Button>
            <Button
              onClick={() => handleSubirDocumento('archivo')}
              className="h-32 flex flex-col items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700"
            >
              <Upload className="w-8 h-8" />
              <span>Desde Dispositivo</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}