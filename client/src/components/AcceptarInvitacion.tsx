/**
 * ================================================================
 * COMPONENTE: ACEPTAR INVITACIÓN DE EMPLEADO
 * ================================================================
 * Página pública donde los empleados aceptan invitaciones
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Mail,
  User,
  Lock,
  Phone,
  Loader2,
  Hash
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { invitacionesService } from '../services/invitaciones.service';
import { InvitacionEmpleado } from '../types/invitaciones.types';

interface AcceptarInvitacionProps {
  invitacionId?: string;
  codigoInvitacion?: string;
}

type EstadoPagina = 'cargando' | 'valida' | 'invalida' | 'formulario' | 'exitoso' | 'error';

export function AcceptarInvitacion({ invitacionId, codigoInvitacion }: AcceptarInvitacionProps) {
  const [estado, setEstado] = useState<EstadoPagina>('cargando');
  const [invitacion, setInvitacion] = useState<InvitacionEmpleado | null>(null);
  const [mensajeError, setMensajeError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Si viene por código, mostramos campo para ingresarlo
  const [codigoIngresado, setCodigoIngresado] = useState(codigoInvitacion || '');
  const [mostrarFormCodigo, setMostrarFormCodigo] = useState(!invitacionId && !codigoInvitacion);

  const [formulario, setFormulario] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
    aceptaTerminos: false
  });

  useEffect(() => {
    if (invitacionId || codigoInvitacion) {
      validarInvitacion();
    } else {
      setEstado('formulario');
    }
  }, [invitacionId, codigoInvitacion]);

  const validarInvitacion = async () => {
    setEstado('cargando');
    
    try {
      const resultado = await invitacionesService.validarInvitacion(
        invitacionId || '',
        codigoInvitacion
      );

      if (resultado.valida && resultado.invitacion) {
        setInvitacion(resultado.invitacion);
        
        // Pre-rellenar datos si existen
        setFormulario(prev => ({
          ...prev,
          nombre: resultado.invitacion?.nombre || '',
          apellidos: resultado.invitacion?.apellidos || ''
        }));
        
        setEstado('valida');
      } else {
        setMensajeError(resultado.motivo || 'Invitación no válida');
        setEstado('invalida');
      }
    } catch (error) {
      console.error('Error al validar invitación:', error);
      setMensajeError('Error al validar la invitación');
      setEstado('invalida');
    }
  };

  const buscarPorCodigo = async () => {
    if (!codigoIngresado.trim()) {
      toast.error('Por favor, ingresa un código');
      return;
    }

    setLoading(true);
    try {
      const resultado = await invitacionesService.validarInvitacion('', codigoIngresado.trim());
      
      if (resultado.valida && resultado.invitacion) {
        setInvitacion(resultado.invitacion);
        setFormulario(prev => ({
          ...prev,
          nombre: resultado.invitacion?.nombre || '',
          apellidos: resultado.invitacion?.apellidos || ''
        }));
        setMostrarFormCodigo(false);
        setEstado('valida');
      } else {
        toast.error(resultado.motivo || 'Código de invitación no válido');
      }
    } catch (error) {
      toast.error('Error al buscar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formulario.nombre || !formulario.apellidos) {
      toast.error('Por favor, completa nombre y apellidos');
      return;
    }

    if (formulario.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formulario.password !== formulario.confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formulario.aceptaTerminos) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      const resultado = await invitacionesService.aceptarInvitacion({
        invitacionId: invitacion?.id || '',
        codigo: codigoIngresado || undefined,
        nombre: formulario.nombre,
        apellidos: formulario.apellidos,
        telefono: formulario.telefono,
        password: formulario.password,
        aceptaTerminos: formulario.aceptaTerminos
      });

      if (resultado.exito) {
        setEstado('exitoso');
        toast.success('¡Bienvenido al equipo!', {
          description: 'Tu cuenta ha sido creada correctamente'
        });
        
        // En producción, aquí redirigirías al login o dashboard
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setMensajeError(resultado.mensaje);
        setEstado('error');
      }
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      setMensajeError('Error al procesar la invitación');
      setEstado('error');
    } finally {
      setLoading(false);
    }
  };

  // ESTADO: Cargando
  if (estado === 'cargando') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Validando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ESTADO: Invitación inválida
  if (estado === 'invalida') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Invitación no válida</CardTitle>
            <CardDescription className="text-red-700">
              {mensajeError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Si crees que esto es un error, contacta con el administrador de tu empresa.
                </AlertDescription>
              </Alert>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMostrarFormCodigo(true)}
              >
                <Hash className="h-4 w-4 mr-2" />
                Tengo un código de invitación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ESTADO: Exitoso
  if (estado === 'exitoso') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-green-900">¡Bienvenido al equipo!</CardTitle>
            <CardDescription className="text-green-700">
              Tu cuenta ha sido creada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription>
                  Redirigiendo al inicio de sesión en unos segundos...
                </AlertDescription>
              </Alert>
              
              <Button className="w-full" onClick={() => window.location.href = '/login'}>
                Ir a iniciar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ESTADO: Formulario de código
  if (mostrarFormCodigo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Hash className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle>Código de invitación</CardTitle>
            <CardDescription>
              Ingresa el código que recibiste de tu empleador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo">Código de invitación</Label>
                <Input
                  id="codigo"
                  placeholder="UDAR-XXXX-XXXX"
                  value={codigoIngresado}
                  onChange={(e) => setCodigoIngresado(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg"
                  maxLength={14}
                />
                <p className="text-xs text-gray-500 mt-1">
                  El formato del código es: UDAR-XXXX-XXXX
                </p>
              </div>

              <Button
                className="w-full"
                onClick={buscarPorCodigo}
                disabled={loading || !codigoIngresado.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ESTADO: Formulario principal (invitación válida)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle>Unirte a {invitacion?.empresaNombre}</CardTitle>
              <CardDescription>
                Has sido invitado/a como <Badge className="ml-1">{invitacion?.puesto}</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Información de la invitación */}
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Invitación enviada a: <strong>{invitacion?.email}</strong>
                <br />
                Departamento: <strong>{invitacion?.departamento}</strong>
              </AlertDescription>
            </Alert>

            {/* Datos personales */}
            <div className="space-y-4">
              <h3 className="font-medium">Completa tu perfil</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formulario.apellidos}
                    onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="telefono">Teléfono (opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+34 600 000 000"
                    value={formulario.telefono}
                    onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="space-y-4">
              <h3 className="font-medium">Crea tu contraseña</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formulario.password}
                    onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 8 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmarPassword">Confirmar contraseña *</Label>
                  <Input
                    id="confirmarPassword"
                    type="password"
                    value={formulario.confirmarPassword}
                    onChange={(e) => setFormulario({ ...formulario, confirmarPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Términos */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terminos"
                checked={formulario.aceptaTerminos}
                onCheckedChange={(checked) => 
                  setFormulario({ ...formulario, aceptaTerminos: checked as boolean })
                }
              />
              <label htmlFor="terminos" className="text-sm leading-tight cursor-pointer">
                Acepto los términos y condiciones de uso y la política de privacidad
              </label>
            </div>

            {/* Botón de envío */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aceptar invitación y crear cuenta
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
