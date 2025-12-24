/**
 * ================================================================
 * VISTA PREVIA: LO QUE VE EL EMPLEADO AL RECIBIR LA INVITACIÓN
 * ================================================================
 * Componente de demostración que muestra cómo se ve la experiencia
 * del empleado al aceptar una invitación
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  CheckCircle2, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Shield,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface VistaPreviewInvitacionProps {
  invitacion: {
    empresaNombre: string;
    puesto: string;
    departamento: string;
    modoFormulario: 'completo' | 'autocompletado';
    nombreGerente?: string;
    mensajePersonalizado?: string;
  };
}

export function VistaPreviewInvitacion({ invitacion }: VistaPreviewInvitacionProps) {
  const [paso, setPaso] = useState(1);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [datosEmpleado, setDatosEmpleado] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    password: '',
    confirmPassword: ''
  });

  const esAutocompletado = invitacion.modoFormulario === 'autocompletado';

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header con branding */}
      <div className="text-center mb-8">
        <div className="bg-teal-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenido a {invitacion.empresaNombre}
        </h1>
        <p className="text-gray-600">
          Has sido invitado a unirte al equipo como <Badge className="ml-2">{invitacion.puesto}</Badge>
        </p>
      </div>

      {/* Mensaje personalizado si existe */}
      {invitacion.mensajePersonalizado && (
        <Card className="mb-6 border-teal-200 bg-teal-50">
          <CardContent className="pt-6">
            <p className="text-sm text-teal-900 italic">
              "{invitacion.mensajePersonalizado}"
            </p>
            {invitacion.nombreGerente && (
              <p className="text-xs text-teal-700 mt-2 text-right">
                - {invitacion.nombreGerente}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                paso >= num ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {paso > num ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
              {num < 3 && (
                <div className={`flex-1 h-1 mx-2 ${paso > num ? 'bg-teal-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Datos básicos</span>
          <span>Seguridad</span>
          <span>Confirmación</span>
        </div>
      </div>

      {/* PASO 1: DATOS PERSONALES */}
      {paso === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {esAutocompletado ? 'Completa tus datos personales' : 'Revisa y confirma tus datos'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {esAutocompletado ? (
              <>
                {/* Modo autocompletado - empleado completa todo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Tus datos están protegidos y solo serán visibles para recursos humanos
                  </p>
                </div>

                <Tabs defaultValue="personales" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="personales">Personales</TabsTrigger>
                    <TabsTrigger value="contacto">Contacto</TabsTrigger>
                    <TabsTrigger value="documentos">Documentos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personales" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={datosEmpleado.nombre}
                          onChange={(e) => setDatosEmpleado({ ...datosEmpleado, nombre: e.target.value })}
                          placeholder="Juan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input
                          id="apellidos"
                          value={datosEmpleado.apellidos}
                          onChange={(e) => setDatosEmpleado({ ...datosEmpleado, apellidos: e.target.value })}
                          placeholder="Pérez García"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dni">DNI/NIE *</Label>
                        <Input
                          id="dni"
                          value={datosEmpleado.dni}
                          onChange={(e) => setDatosEmpleado({ ...datosEmpleado, dni: e.target.value })}
                          placeholder="12345678A"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fecha-nacimiento">Fecha de nacimiento *</Label>
                        <Input
                          id="fecha-nacimiento"
                          type="date"
                          value={datosEmpleado.fechaNacimiento}
                          onChange={(e) => setDatosEmpleado({ ...datosEmpleado, fechaNacimiento: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contacto" className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={datosEmpleado.email}
                        onChange={(e) => setDatosEmpleado({ ...datosEmpleado, email: e.target.value })}
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={datosEmpleado.telefono}
                        onChange={(e) => setDatosEmpleado({ ...datosEmpleado, telefono: e.target.value })}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección completa *</Label>
                      <Input
                        id="direccion"
                        value={datosEmpleado.direccion}
                        onChange={(e) => setDatosEmpleado({ ...datosEmpleado, direccion: e.target.value })}
                        placeholder="Calle, número, piso, ciudad, CP"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="documentos" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Sube tu DNI/NIE (ambas caras)</p>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Seleccionar archivos
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <>
                {/* Modo completo - empleado solo revisa */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    Tus datos han sido pre-completados. Revisa que todo sea correcto.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Nombre completo</Label>
                      <p className="font-medium">Juan Pérez García</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">DNI/NIE</Label>
                      <p className="font-medium">12345678A</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <p className="font-medium">juan.perez@email.com</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Teléfono</Label>
                      <p className="font-medium">+34 600 123 456</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs text-gray-500 mb-2 block">Datos del contrato</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-400">Tipo de contrato</Label>
                        <p className="text-sm font-medium">Indefinido</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Horas semanales</Label>
                        <p className="text-sm font-medium">40 horas</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Fecha de inicio</Label>
                        <p className="text-sm font-medium">01/12/2024</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Salario bruto anual</Label>
                        <p className="text-sm font-medium">18.000 €</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <p className="text-xs text-amber-800">
                      Si algún dato es incorrecto, contacta con recursos humanos antes de continuar.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setPaso(2)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 2: SEGURIDAD */}
      {paso === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crea tu contraseña de acceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Tu contraseña debe cumplir los siguientes requisitos:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 ml-6 list-disc">
                <li>Mínimo 8 caracteres</li>
                <li>Al menos una letra mayúscula</li>
                <li>Al menos un número</li>
                <li>Al menos un carácter especial (@, #, $, etc.)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    value={datosEmpleado.password}
                    onChange={(e) => setDatosEmpleado({ ...datosEmpleado, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirmar contraseña *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={datosEmpleado.confirmPassword}
                  onChange={(e) => setDatosEmpleado({ ...datosEmpleado, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPaso(1)}
              >
                Atrás
              </Button>
              <Button
                onClick={() => setPaso(3)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASO 3: CONFIRMACIÓN */}
      {paso === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confirmación final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ¡Todo listo para unirte al equipo!
              </h3>
              <p className="text-sm text-green-700">
                Al confirmar, aceptarás la invitación y tu perfil será activado
              </p>
            </div>

            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Resumen de tu registro:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Empresa:</span>
                    <span className="font-medium">{invitacion.empresaNombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Puesto:</span>
                    <Badge>{invitacion.puesto}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Departamento:</span>
                    <span className="font-medium">{invitacion.departamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email de acceso:</span>
                    <span className="font-medium">{datosEmpleado.email || 'tu@email.com'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-800">
                Al hacer clic en "Aceptar invitación", aceptas los términos y condiciones de uso de Udar Edge
                y la política de privacidad de {invitacion.empresaNombre}.
              </p>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPaso(2)}
              >
                Atrás
              </Button>
              <Button
                onClick={() => {
                  toast.success('¡Invitación aceptada! Bienvenido al equipo');
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aceptar invitación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}