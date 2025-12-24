/**
 * ================================================================
 * MODAL: INVITAR NUEVO EMPLEADO - VERSIÓN MIXTA
 * ================================================================
 * Permite al gerente invitar nuevos trabajadores usando múltiples canales:
 * - Email/Link
 * - WhatsApp
 * - SMS
 * Con opción de que el empleado complete su propia información
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { 
  Mail, 
  MessageCircle,
  Smartphone,
  Link as LinkIcon,
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Copy,
  Send,
  Info,
  Eye,
  EyeOff,
  Share2,
  QrCode,
  FileEdit
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { invitacionesService } from '../../services/invitaciones.service';
import { FormularioInvitacion, MetodoInvitacion } from '../../types/invitaciones.types';
import { notificarInvitacionAceptada } from '../../utils/notificaciones-rrhh.util';

interface ModalInvitarEmpleadoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string;
  empresaNombre: string;
  onInvitacionCreada?: () => void;
}

type CanalInvitacion = 'email' | 'whatsapp' | 'sms' | 'link';
type ModoFormulario = 'completo' | 'autocompletado';

export function ModalInvitarEmpleado({
  isOpen,
  onOpenChange,
  empresaId,
  empresaNombre,
  onInvitacionCreada
}: ModalInvitarEmpleadoProps) {
  const [canal, setCanal] = useState<CanalInvitacion>('email');
  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>('autocompletado');
  const [loading, setLoading] = useState(false);
  const [invitacionCreada, setInvitacionCreada] = useState<any>(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  
  const [formulario, setFormulario] = useState({
    // Datos de contacto
    email: '',
    telefono: '',
    
    // Datos básicos del empleado
    nombre: '',
    apellidos: '',
    puesto: '',
    departamento: '',
    
    // Datos del contrato
    horasSemanales: 40,
    tipoContrato: 'indefinido',
    salario: '',
    fechaInicio: '',
    
    // Configuración de invitación
    notas: '',
    enviarInmediatamente: true,
    permitirAutocompletado: true,
    mensajePersonalizado: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones según canal
    if (canal === 'email' && !formulario.email) {
      toast.error('El email es obligatorio');
      return;
    }
    
    if ((canal === 'whatsapp' || canal === 'sms') && !formulario.telefono) {
      toast.error('El teléfono es obligatorio');
      return;
    }

    if (!formulario.puesto || !formulario.departamento) {
      toast.error('Puesto y departamento son obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Generar link único
      const linkInvitacion = `https://udar-edge.app/invitacion/${Math.random().toString(36).substring(2, 15)}`;
      const codigoInvitacion = `UDAR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2024`;
      
      // Simular creación de invitación
      const invitacion = {
        id: `INV-${Date.now()}`,
        canal,
        modoFormulario,
        ...formulario,
        linkInvitacion,
        codigoInvitacion,
        fechaCreacion: new Date().toISOString(),
        estado: 'pendiente',
        empresaId,
        empresaNombre
      };

      // Guardar en localStorage (simulación)
      const invitaciones = JSON.parse(localStorage.getItem('invitaciones') || '[]');
      invitaciones.push(invitacion);
      localStorage.setItem('invitaciones', JSON.stringify(invitaciones));

      setInvitacionCreada(invitacion);
      
      // Mensaje según canal
      const mensajes = {
        email: `Email enviado a ${formulario.email}`,
        whatsapp: `Mensaje enviado por WhatsApp a ${formulario.telefono}`,
        sms: `SMS enviado a ${formulario.telefono}`,
        link: 'Link de invitación generado'
      };

      toast.success('Invitación creada correctamente', {
        description: mensajes[canal]
      });

      onInvitacionCreada?.();
    } catch (error) {
      console.error('Error al crear invitación:', error);
      toast.error('Error al crear la invitación');
    } finally {
      setLoading(false);
    }
  };

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success('Copiado al portapapeles');
  };

  const compartirWhatsApp = (link: string) => {
    const mensaje = `¡Hola! Te invito a unirte a ${empresaNombre} en Udar Edge. Completa tu registro aquí: ${link}`;
    const url = `https://wa.me/${formulario.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    toast.success('Abriendo WhatsApp...');
  };

  const enviarPorSMS = (link: string) => {
    const mensaje = `Invitación ${empresaNombre}: ${link}`;
    const url = `sms:${formulario.telefono}?body=${encodeURIComponent(mensaje)}`;
    window.location.href = url;
    toast.success('Abriendo aplicación de SMS...');
  };

  const resetearFormulario = () => {
    setFormulario({
      email: '',
      telefono: '',
      nombre: '',
      apellidos: '',
      puesto: '',
      departamento: '',
      horasSemanales: 40,
      tipoContrato: 'indefinido',
      salario: '',
      fechaInicio: '',
      notas: '',
      enviarInmediatamente: true,
      permitirAutocompletado: true,
      mensajePersonalizado: ''
    });
    setInvitacionCreada(null);
    setCanal('email');
    setModoFormulario('autocompletado');
  };

  const cerrarModal = () => {
    resetearFormulario();
    onOpenChange(false);
  };

  // Vista de éxito después de crear la invitación
  if (invitacionCreada) {
    return (
      <Dialog open={isOpen} onOpenChange={cerrarModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <DialogTitle>¡Invitación creada correctamente!</DialogTitle>
            </div>
            <DialogDescription>
              La invitación ha sido {formulario.enviarInmediatamente ? 'enviada' : 'creada'} y está lista para ser utilizada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Resumen del empleado */}
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-teal-700 mb-1">Canal de invitación</p>
                    <div className="flex items-center gap-2">
                      {canal === 'email' && <Mail className="h-4 w-4 text-teal-600" />}
                      {canal === 'whatsapp' && <MessageCircle className="h-4 w-4 text-green-600" />}
                      {canal === 'sms' && <Smartphone className="h-4 w-4 text-blue-600" />}
                      {canal === 'link' && <LinkIcon className="h-4 w-4 text-purple-600" />}
                      <span className="font-medium capitalize">{canal}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-teal-700 mb-1">Tipo de formulario</p>
                    <div className="flex items-center gap-2">
                      {modoFormulario === 'autocompletado' ? (
                        <>
                          <UserPlus className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Empleado completa datos</span>
                        </>
                      ) : (
                        <>
                          <FileEdit className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Datos pre-completados</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-teal-700 mb-1">Contacto</p>
                    <p className="font-medium text-sm">
                      {canal === 'email' || canal === 'link' ? formulario.email : formulario.telefono}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-teal-700 mb-1">Puesto</p>
                    <Badge>{formulario.puesto || 'Sin especificar'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Link de invitación */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Link de invitación</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Expira en 7 días
                    </Badge>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-200 break-all">
                    <code className="text-sm">{invitacionCreada.linkInvitacion}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiarAlPortapapeles(invitacionCreada.linkInvitacion)}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Función de compartir disponible próximamente')}
                      className="w-full"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones rápidas según canal */}
            {canal === 'whatsapp' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Enviar por WhatsApp</span>
                    </div>
                    <p className="text-sm text-green-700">
                      El mensaje incluirá el link de invitación y se enviará a {formulario.telefono}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => compartirWhatsApp(invitacionCreada.linkInvitacion)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Abrir WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {canal === 'sms' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Enviar por SMS</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      El SMS incluirá el link de invitación y se enviará a {formulario.telefono}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => enviarPorSMS(invitacionCreada.linkInvitacion)}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Abrir SMS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Código de invitación */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Código de invitación alternativo</span>
                  </div>
                  <p className="text-xs text-purple-700">
                    El empleado también puede usar este código para registrarse directamente en la app
                  </p>
                  <div className="bg-white p-4 rounded border border-purple-200 text-center">
                    <code className="text-2xl font-mono font-bold text-purple-900">
                      {invitacionCreada.codigoInvitacion}
                    </code>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copiarAlPortapapeles(invitacionCreada.codigoInvitacion)}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar código
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información de lo que debe hacer el empleado */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-2">El empleado deberá:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {modoFormulario === 'autocompletado' ? (
                        <>
                          <li>Hacer clic en el link de invitación</li>
                          <li>Crear su usuario y contraseña</li>
                          <li>Completar sus datos personales y laborales</li>
                          <li>Subir documentación requerida (DNI, contrato, etc.)</li>
                          <li>Aceptar los términos y condiciones</li>
                        </>
                      ) : (
                        <>
                          <li>Hacer clic en el link de invitación</li>
                          <li>Revisar y confirmar los datos pre-completados</li>
                          <li>Crear su contraseña de acceso</li>
                          <li>Subir documentación requerida</li>
                          <li>Aceptar la invitación</li>
                        </>
                      )}
                    </ul>
                    <p className="mt-3 text-xs">
                      <Info className="h-3 w-3 inline mr-1" />
                      Recibirás una notificación cuando el empleado complete su registro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetearFormulario}
            >
              Crear otra invitación
            </Button>
            <Button
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              onClick={cerrarModal}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Formulario principal
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitar nuevo empleado</DialogTitle>
          <DialogDescription>
            Elige el canal de invitación y el tipo de formulario que completará el empleado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* SECCIÓN 1: CANAL DE INVITACIÓN */}
            <div className="space-y-3">
              <Label className="text-base">Canal de invitación</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card 
                  className={`cursor-pointer transition-all ${canal === 'email' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:border-gray-400'}`}
                  onClick={() => setCanal('email')}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <Mail className={`h-6 w-6 mx-auto mb-2 ${canal === 'email' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${canal === 'email' ? 'text-blue-900' : 'text-gray-700'}`}>Email</p>
                    <p className="text-xs text-gray-500 mt-1">Recomendado</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${canal === 'whatsapp' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'hover:border-gray-400'}`}
                  onClick={() => setCanal('whatsapp')}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <MessageCircle className={`h-6 w-6 mx-auto mb-2 ${canal === 'whatsapp' ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${canal === 'whatsapp' ? 'text-green-900' : 'text-gray-700'}`}>WhatsApp</p>
                    <p className="text-xs text-gray-500 mt-1">Inmediato</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${canal === 'sms' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:border-gray-400'}`}
                  onClick={() => setCanal('sms')}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <Smartphone className={`h-6 w-6 mx-auto mb-2 ${canal === 'sms' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${canal === 'sms' ? 'text-blue-900' : 'text-gray-700'}`}>SMS</p>
                    <p className="text-xs text-gray-500 mt-1">Universal</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${canal === 'link' ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'hover:border-gray-400'}`}
                  onClick={() => setCanal('link')}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <LinkIcon className={`h-6 w-6 mx-auto mb-2 ${canal === 'link' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${canal === 'link' ? 'text-purple-900' : 'text-gray-700'}`}>Link</p>
                    <p className="text-xs text-gray-500 mt-1">Manual</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* SECCIÓN 2: TIPO DE FORMULARIO */}
            <div className="space-y-3">
              <Label className="text-base">¿Qué información proporcionará el empleado?</Label>
              <RadioGroup value={modoFormulario} onValueChange={(v) => setModoFormulario(v as ModoFormulario)}>
                <Card className={modoFormulario === 'autocompletado' ? 'border-teal-500 bg-teal-50' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="autocompletado" id="modo-auto" className="mt-1" />
                      <label htmlFor="modo-auto" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <UserPlus className="h-4 w-4 text-teal-600" />
                          <span className="font-medium">El empleado completa sus datos</span>
                          <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          Solo proporcionas: email/teléfono, puesto y departamento. El empleado completa el resto
                          de su información personal, datos laborales y sube documentación.
                        </p>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card className={modoFormulario === 'completo' ? 'border-purple-500 bg-purple-50' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="completo" id="modo-completo" className="mt-1" />
                      <label htmlFor="modo-completo" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <FileEdit className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Yo completo todos los datos ahora</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Ingresas toda la información del empleado (datos personales, contrato, salario, etc.).
                          El empleado solo revisa, confirma y crea su contraseña.
                        </p>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            <Separator />

            {/* SECCIÓN 3: DATOS DEL EMPLEADO */}
            <div className="space-y-4">
              <h4 className="font-medium text-base">Datos del empleado</h4>

              <Tabs defaultValue="basicos" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basicos">Básicos</TabsTrigger>
                  <TabsTrigger value="contacto">Contacto</TabsTrigger>
                  {modoFormulario === 'completo' && <TabsTrigger value="contrato">Contrato</TabsTrigger>}
                </TabsList>

                {/* TAB: DATOS BÁSICOS */}
                <TabsContent value="basicos" className="space-y-4">
                  {modoFormulario === 'completo' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          placeholder="Juan"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input
                          id="apellidos"
                          value={formulario.apellidos}
                          onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
                          placeholder="Pérez García"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {modoFormulario === 'autocompletado' && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-teal-600 flex-shrink-0" />
                        <div className="text-sm text-teal-800">
                          <p className="font-medium mb-1">El empleado completará:</p>
                          <p className="text-xs">Nombre, apellidos, DNI, fecha de nacimiento, dirección, etc.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="puesto">Puesto *</Label>
                      <Select 
                        value={formulario.puesto} 
                        onValueChange={(v) => setFormulario({ ...formulario, puesto: v })}
                      >
                        <SelectTrigger id="puesto">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="camarero">Camarero/a</SelectItem>
                          <SelectItem value="cocinero">Cocinero/a</SelectItem>
                          <SelectItem value="ayudante-cocina">Ayudante de Cocina</SelectItem>
                          <SelectItem value="jefe-cocina">Jefe/a de Cocina</SelectItem>
                          <SelectItem value="repartidor">Repartidor/a</SelectItem>
                          <SelectItem value="encargado">Encargado/a</SelectItem>
                          <SelectItem value="limpieza">Personal de Limpieza</SelectItem>
                          <SelectItem value="administrativo">Administrativo/a</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="departamento">Departamento *</Label>
                      <Select 
                        value={formulario.departamento} 
                        onValueChange={(v) => setFormulario({ ...formulario, departamento: v })}
                      >
                        <SelectTrigger id="departamento">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cocina">Cocina</SelectItem>
                          <SelectItem value="sala">Sala</SelectItem>
                          <SelectItem value="reparto">Reparto</SelectItem>
                          <SelectItem value="administracion">Administración</SelectItem>
                          <SelectItem value="limpieza">Limpieza</SelectItem>
                          <SelectItem value="gerencia">Gerencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* TAB: CONTACTO */}
                <TabsContent value="contacto" className="space-y-4">
                  {(canal === 'email' || canal === 'link') && (
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="empleado@ejemplo.com"
                        value={formulario.email}
                        onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {(canal === 'whatsapp' || canal === 'sms') && (
                    <div>
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={formulario.telefono}
                        onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Incluye el código de país (ej: +34 para España)
                      </p>
                    </div>
                  )}

                  {canal === 'link' && (
                    <div>
                      <Label htmlFor="telefono-opcional">Teléfono (opcional)</Label>
                      <Input
                        id="telefono-opcional"
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={formulario.telefono}
                        onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                      />
                    </div>
                  )}

                  {modoFormulario === 'autocompletado' && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Info className="h-5 w-5 text-teal-600 flex-shrink-0" />
                        <p className="text-sm text-teal-800">
                          El empleado podrá actualizar su información de contacto durante el registro
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* TAB: CONTRATO (solo en modo completo) */}
                {modoFormulario === 'completo' && (
                  <TabsContent value="contrato" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipoContrato">Tipo de contrato *</Label>
                        <Select 
                          value={formulario.tipoContrato} 
                          onValueChange={(v) => setFormulario({ ...formulario, tipoContrato: v })}
                        >
                          <SelectTrigger id="tipoContrato">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indefinido">Indefinido</SelectItem>
                            <SelectItem value="temporal">Temporal</SelectItem>
                            <SelectItem value="practicas">Prácticas</SelectItem>
                            <SelectItem value="formacion">Formación</SelectItem>
                            <SelectItem value="obra">Obra o Servicio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="horasSemanales">Horas semanales *</Label>
                        <Input
                          id="horasSemanales"
                          type="number"
                          min="1"
                          max="40"
                          value={formulario.horasSemanales}
                          onChange={(e) => setFormulario({ ...formulario, horasSemanales: parseInt(e.target.value) || 40 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="salario">Salario bruto anual</Label>
                        <Input
                          id="salario"
                          type="number"
                          placeholder="18000"
                          value={formulario.salario}
                          onChange={(e) => setFormulario({ ...formulario, salario: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                        <Input
                          id="fechaInicio"
                          type="date"
                          value={formulario.fechaInicio}
                          onChange={(e) => setFormulario({ ...formulario, fechaInicio: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            <Separator />

            {/* SECCIÓN 4: CONFIGURACIÓN DE ENVÍO */}
            <div className="space-y-4">
              <h4 className="font-medium text-base">Configuración del envío</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="enviar-inmediatamente" 
                    checked={formulario.enviarInmediatamente}
                    onCheckedChange={(checked) => setFormulario({ ...formulario, enviarInmediatamente: checked as boolean })}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="enviar-inmediatamente" 
                      className="cursor-pointer font-medium"
                    >
                      Enviar invitación inmediatamente
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {canal === 'email' && 'El email se enviará automáticamente al crear la invitación'}
                      {canal === 'whatsapp' && 'Se abrirá WhatsApp para enviar el mensaje'}
                      {canal === 'sms' && 'Se abrirá la app de SMS para enviar el mensaje'}
                      {canal === 'link' && 'El link estará disponible inmediatamente para compartir'}
                    </p>
                  </div>
                </div>

                {modoFormulario === 'autocompletado' && (
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="permitir-autocompletado" 
                      checked={formulario.permitirAutocompletado}
                      onCheckedChange={(checked) => setFormulario({ ...formulario, permitirAutocompletado: checked as boolean })}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="permitir-autocompletado" 
                        className="cursor-pointer font-medium"
                      >
                        Permitir que el empleado guarde su progreso
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        El empleado podrá completar el formulario en varias sesiones
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="mensaje-personalizado">Mensaje personalizado (opcional)</Label>
                <Textarea
                  id="mensaje-personalizado"
                  placeholder="Ej: ¡Bienvenido al equipo! Estamos emocionados de que te unas a nosotros..."
                  rows={3}
                  value={formulario.mensajePersonalizado}
                  onChange={(e) => setFormulario({ ...formulario, mensajePersonalizado: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este mensaje aparecerá en la invitación
                </p>
              </div>

              <div>
                <Label htmlFor="notas">Notas internas (opcional)</Label>
                <Textarea
                  id="notas"
                  placeholder="Notas que solo verás tú (no se envían al empleado)"
                  rows={2}
                  value={formulario.notas}
                  onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <>Creando invitación...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Crear invitación
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}