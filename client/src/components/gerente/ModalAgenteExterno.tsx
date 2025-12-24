import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Alert, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Lock,
  MessageSquare,
  Send,
  Upload,
  Download,
  FileText,
  Settings,
  Info,
  CheckCircle2,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface AgenteExterno {
  id: string;
  nombre: string;
  tipo: 'proveedor' | 'gestor' | 'auditor' | 'otro';
  empresa: string;
  email: string;
  telefono: string;
  
  // Modo de acceso
  modo: 'SAAS' | 'CANAL';
  
  // Acceso SaaS
  username?: string;
  estadoUsuario?: 'activo' | 'bloqueado';
  enviarCredenciales?: boolean;
  
  // Permisos SaaS
  permisos?: {
    puede_subir_nominas: boolean;
    puede_subir_contratos: boolean;
    puede_subir_irpf: boolean;
    puede_ver_documentos_subidos: boolean;
    puede_exportar_facturacion: boolean;
    puede_exportar_informes: boolean;
  };
  
  // Canales
  canal_email_activo: boolean;
  canal_whatsapp_activo: boolean;
  email_destino_sistema?: string;
  whatsapp_numero_sistema?: string;
  
  // Capacidades de recepción
  recepcion: {
    recibir_pedidos: { activo: boolean; canal: 'email' | 'whatsapp' | 'saas' };
    recibir_facturas_emitidas: { activo: boolean; canal: 'email' | 'whatsapp' | 'saas' };
    recibir_albaranes: { activo: boolean; canal: 'email' | 'whatsapp' | 'saas' };
    recibir_contratos: { activo: boolean; canal: 'email' | 'whatsapp' | 'saas' };
    recibir_informes: { activo: boolean; canal: 'email' | 'whatsapp' | 'saas' };
    recibir_avisos_generales: { activo: boolean; canal: 'email' | 'whatsapp' | 'saas' };
  };
  
  // Capacidades de envío
  envio: {
    subir_facturas_proveedor: boolean;
    subir_albaranes: boolean;
    subir_nominas: boolean;
    subir_contratos: boolean;
    subir_justificantes: boolean;
    subir_auditorias: boolean;
    subir_otros_documentos: boolean;
  };
  
  // Reglas automáticas
  reglas: {
    identificador_principal: 'dni' | 'nif' | 'cif' | 'codigo_interno' | 'nombre_trabajador' | 'nombre_proveedor';
    origen_identificador: 'nombre_archivo' | 'contenido_ocr' | 'asunto_email' | 'cuerpo_mensaje';
    tipo_documento_por_defecto: 'factura_proveedor' | 'nomina' | 'albaran' | 'contrato' | 'informe' | 'otro';
    destino_por_defecto: 'modulo_facturacion' | 'modulo_rrhh' | 'modulo_pedidos' | 'modulo_auditoria' | 'modulo_documentacion_general';
  };
  
  activo: boolean;
  fechaAlta: string;
}

interface ModalAgenteExternoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  agente?: AgenteExterno | null;
  onSave: (agente: AgenteExterno) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ModalAgenteExterno({
  isOpen,
  onOpenChange,
  agente,
  onSave
}: ModalAgenteExternoProps) {
  const [formData, setFormData] = useState<AgenteExterno>({
    id: '',
    nombre: '',
    tipo: 'proveedor',
    empresa: '',
    email: '',
    telefono: '',
    modo: 'SAAS',
    username: '',
    estadoUsuario: 'activo',
    enviarCredenciales: true,
    permisos: {
      puede_subir_nominas: false,
      puede_subir_contratos: false,
      puede_subir_irpf: false,
      puede_ver_documentos_subidos: false,
      puede_exportar_facturacion: false,
      puede_exportar_informes: false
    },
    canal_email_activo: true,
    canal_whatsapp_activo: false,
    email_destino_sistema: '',
    whatsapp_numero_sistema: '',
    recepcion: {
      recibir_pedidos: { activo: false, canal: 'email' },
      recibir_facturas_emitidas: { activo: false, canal: 'email' },
      recibir_albaranes: { activo: false, canal: 'email' },
      recibir_contratos: { activo: false, canal: 'email' },
      recibir_informes: { activo: false, canal: 'email' },
      recibir_avisos_generales: { activo: false, canal: 'email' }
    },
    envio: {
      subir_facturas_proveedor: false,
      subir_albaranes: false,
      subir_nominas: false,
      subir_contratos: false,
      subir_justificantes: false,
      subir_auditorias: false,
      subir_otros_documentos: false
    },
    reglas: {
      identificador_principal: 'cif',
      origen_identificador: 'nombre_archivo',
      tipo_documento_por_defecto: 'factura_proveedor',
      destino_por_defecto: 'modulo_facturacion'
    },
    activo: true,
    fechaAlta: new Date().toISOString()
  });

  // Cargar datos del agente al abrir modal
  useEffect(() => {
    if (agente) {
      setFormData(agente);
    } else {
      // Generar nuevo ID
      const nuevoId = `AGE-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setFormData({
        ...formData,
        id: nuevoId
      });
    }
  }, [agente, isOpen]);

  // Generar username automáticamente desde email
  useEffect(() => {
    if (formData.email && formData.modo === 'SAAS') {
      const username = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      setFormData({ ...formData, username });
    }
  }, [formData.email, formData.modo]);

  // Generar email de sistema automáticamente
  useEffect(() => {
    if (formData.id) {
      const emailSistema = `agente_${formData.id.toLowerCase()}@cliente.udaredge.app`;
      setFormData({ ...formData, email_destino_sistema: emailSistema });
    }
  }, [formData.id]);

  const handleGuardar = () => {
    // Validaciones
    if (!formData.nombre || !formData.email || !formData.empresa) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    console.log('💾 GUARDAR AGENTE EXTERNO:', {
      agente: formData,
      modo: formData.modo,
      canales: {
        email: formData.canal_email_activo,
        whatsapp: formData.canal_whatsapp_activo
      },
      permisos: formData.permisos,
      recepcion: formData.recepcion,
      envio: formData.envio,
      reglas: formData.reglas
    });

    onSave(formData);
    toast.success(`Agente externo ${agente ? 'actualizado' : 'creado'} correctamente`);
    onOpenChange(false);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'proveedor': 'Proveedor',
      'gestor': 'Gestor / Gestoría',
      'auditor': 'Auditor',
      'otro': 'Otro'
    };
    return labels[tipo] || tipo;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                {agente ? 'Editar Agente Externo' : 'Añadir Agente Externo'}
              </DialogTitle>
              <DialogDescription>
                {formData.id && `Código: ${formData.id}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* BLOQUE 1: DATOS GENERALES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Datos Generales</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del agente *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Rodríguez"
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de agente *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proveedor">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">Proveedor</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="gestor">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">Gestor / Gestoría</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="auditor">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">Auditor</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="otro">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">Otro</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="empresa">Empresa asociada *</Label>
                <Select
                  value={formData.empresa}
                  onValueChange={(value) => setFormData({ ...formData, empresa: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Harinas Molino del Sur">Harinas Molino del Sur</SelectItem>
                    <SelectItem value="Lácteos Menorca">Lácteos Menorca</SelectItem>
                    <SelectItem value="Asesoría Fiscal Menéndez">Asesoría Fiscal Menéndez</SelectItem>
                    <SelectItem value="Gestoría Empresarial García">Gestoría Empresarial García</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email de contacto *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono de contacto</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* BLOQUE 2: MODO DE ACCESO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Modo de Acceso</h3>
            </div>

            <RadioGroup
              value={formData.modo}
              onValueChange={(value: 'SAAS' | 'CANAL') => setFormData({ ...formData, modo: value })}
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="SAAS" id="modo-saas" />
                <div className="flex-1">
                  <Label htmlFor="modo-saas" className="flex items-center gap-2 cursor-pointer">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <span className="font-medium">Acceso al sistema (usuario y contraseña)</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    El agente tendrá credenciales para iniciar sesión en el sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="CANAL" id="modo-canal" />
                <div className="flex-1">
                  <Label htmlFor="modo-canal" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Comunicación externa (email / WhatsApp)</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    El agente enviará/recibirá documentos solo por canales externos
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* BLOQUE 3: ACCESO INTERNO (solo si modo = SAAS) */}
          {formData.modo === 'SAAS' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Acceso Interno al Sistema</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Autogenerado desde email"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se genera automáticamente desde el email
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado del usuario</Label>
                    <Select
                      value={formData.estadoUsuario}
                      onValueChange={(value: 'activo' | 'bloqueado') => 
                        setFormData({ ...formData, estadoUsuario: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Activo
                          </div>
                        </SelectItem>
                        <SelectItem value="bloqueado">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-red-600" />
                            Bloqueado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Enviar credenciales por email</p>
                      <p className="text-xs text-gray-600">
                        Se enviará un email automático con usuario y contraseña
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.enviarCredenciales}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, enviarCredenciales: checked })
                    }
                  />
                </div>

                {/* Permisos internos SaaS */}
                <div className="space-y-3 pt-4">
                  <Label className="text-base font-medium">Permisos Internos</Label>
                  
                  <div className="space-y-2">
                    {[
                      { key: 'puede_subir_nominas', label: 'Puede subir nóminas', icon: FileText },
                      { key: 'puede_subir_contratos', label: 'Puede subir contratos', icon: FileText },
                      { key: 'puede_subir_irpf', label: 'Puede subir IRPF', icon: FileText },
                      { key: 'puede_ver_documentos_subidos', label: 'Puede ver documentos subidos', icon: Download },
                      { key: 'puede_exportar_facturacion', label: 'Puede exportar facturación', icon: Download },
                      { key: 'puede_exportar_informes', label: 'Puede exportar informes', icon: Download }
                    ].map((permiso) => {
                      const Icon = permiso.icon;
                      return (
                        <div
                          key={permiso.key}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-900">{permiso.label}</span>
                          </div>
                          <Switch
                            checked={formData.permisos?.[permiso.key as keyof typeof formData.permisos] || false}
                            onCheckedChange={(checked) => 
                              setFormData({
                                ...formData,
                                permisos: {
                                  ...formData.permisos!,
                                  [permiso.key]: checked
                                }
                              })
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* BLOQUE 4: CANALES DE COMUNICACIÓN (solo si modo = CANAL) */}
          {formData.modo === 'CANAL' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Canales de Comunicación</h3>
                </div>

                <div className="space-y-4">
                  {/* Email */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Canal Email</p>
                          <p className="text-sm text-gray-600">Envío/recepción por correo electrónico</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.canal_email_activo}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, canal_email_activo: checked })
                        }
                      />
                    </div>

                    {formData.canal_email_activo && (
                      <div className="pt-3 border-t">
                        <Label>Email destino del sistema</Label>
                        <Input
                          value={formData.email_destino_sistema}
                          readOnly
                          className="bg-gray-50 mt-1"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Esta dirección será la que usará el agente para enviar documentación al sistema
                        </p>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Canal WhatsApp</p>
                          <p className="text-sm text-gray-600">Envío/recepción por WhatsApp Bot</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.canal_whatsapp_activo}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, canal_whatsapp_activo: checked })
                        }
                      />
                    </div>

                    {formData.canal_whatsapp_activo && (
                      <div className="pt-3 border-t">
                        <Label>Número interno del sistema</Label>
                        <Input
                          value={formData.whatsapp_numero_sistema || '+34 600 XXX XXX'}
                          readOnly
                          className="bg-gray-50 mt-1"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Este es el número del bot al que el agente enviará los documentos
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* BLOQUE 5: INTERCAMBIO DE DOCUMENTOS (común para ambos modos) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Intercambio de Documentos</h3>
            </div>

            <Accordion type="multiple" className="w-full">
              {/* Subbloque A: Documentos que RECIBE */}
              <AccordionItem value="recepcion">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-green-600" />
                    <span>Documentos que el agente RECIBE desde el sistema</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {Object.entries(formData.recepcion).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        recibir_pedidos: 'Recibir pedidos',
                        recibir_facturas_emitidas: 'Recibir facturas emitidas',
                        recibir_albaranes: 'Recibir albaranes',
                        recibir_contratos: 'Recibir contratos',
                        recibir_informes: 'Recibir informes',
                        recibir_avisos_generales: 'Recibir avisos generales'
                      };

                      return (
                        <div
                          key={key}
                          className="flex items-center gap-4 p-3 border rounded-lg"
                        >
                          <Switch
                            checked={value.activo}
                            onCheckedChange={(checked) => 
                              setFormData({
                                ...formData,
                                recepcion: {
                                  ...formData.recepcion,
                                  [key]: { ...value, activo: checked }
                                }
                              })
                            }
                          />
                          <span className="flex-1 text-sm">{labels[key]}</span>
                          
                          {value.activo && (
                            <Select
                              value={value.canal}
                              onValueChange={(canal: 'email' | 'whatsapp' | 'saas') => 
                                setFormData({
                                  ...formData,
                                  recepcion: {
                                    ...formData.recepcion,
                                    [key]: { ...value, canal }
                                  }
                                })
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.modo === 'SAAS' && (
                                  <SelectItem value="saas">
                                    <div className="flex items-center gap-2">
                                      <Lock className="w-4 h-4" />
                                      SaaS
                                    </div>
                                  </SelectItem>
                                )}
                                <SelectItem value="email">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                  </div>
                                </SelectItem>
                                <SelectItem value="whatsapp">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    WhatsApp
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Subbloque B: Documentos que SUBE */}
              <AccordionItem value="envio">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Documentos que el agente PUEDE SUBIR al sistema</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {Object.entries(formData.envio).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        subir_facturas_proveedor: 'Subir facturas de proveedor',
                        subir_albaranes: 'Subir albaranes',
                        subir_nominas: 'Subir nóminas',
                        subir_contratos: 'Subir contratos',
                        subir_justificantes: 'Subir justificantes',
                        subir_auditorias: 'Subir auditorías',
                        subir_otros_documentos: 'Subir otros documentos'
                      };

                      // Solo mostrar nóminas si el tipo es gestor
                      if (key === 'subir_nominas' && formData.tipo !== 'gestor') {
                        return null;
                      }

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <span className="text-sm text-gray-900">{labels[key]}</span>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => 
                              setFormData({
                                ...formData,
                                envio: {
                                  ...formData.envio,
                                  [key]: checked
                                }
                              })
                            }
                          />
                        </div>
                      );
                    })}

                    <Alert className="border-blue-200 bg-blue-50 mt-4">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-700">
                        Los documentos recibidos se procesan según las reglas definidas para este agente.
                      </AlertDescription>
                    </Alert>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* BLOQUE 6: REGLAS DE PROCESAMIENTO AUTOMÁTICO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Reglas de Procesamiento Automático</h3>
            </div>

            <Alert className="border-purple-200 bg-purple-50">
              <Info className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-sm text-purple-700">
                Estas reglas ayudan al sistema a procesar automáticamente los documentos que recibe de este agente.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Identificador principal</Label>
                <Select
                  value={formData.reglas.identificador_principal}
                  onValueChange={(value: any) => 
                    setFormData({
                      ...formData,
                      reglas: { ...formData.reglas, identificador_principal: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="nif">NIF</SelectItem>
                    <SelectItem value="cif">CIF</SelectItem>
                    <SelectItem value="codigo_interno">Código interno</SelectItem>
                    <SelectItem value="nombre_trabajador">Nombre trabajador</SelectItem>
                    <SelectItem value="nombre_proveedor">Nombre proveedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Origen del identificador</Label>
                <Select
                  value={formData.reglas.origen_identificador}
                  onValueChange={(value: any) => 
                    setFormData({
                      ...formData,
                      reglas: { ...formData.reglas, origen_identificador: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nombre_archivo">Nombre del archivo</SelectItem>
                    <SelectItem value="contenido_ocr">Contenido OCR</SelectItem>
                    <SelectItem value="asunto_email">Asunto del email</SelectItem>
                    <SelectItem value="cuerpo_mensaje">Cuerpo del mensaje</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de documento por defecto</Label>
                <Select
                  value={formData.reglas.tipo_documento_por_defecto}
                  onValueChange={(value: any) => 
                    setFormData({
                      ...formData,
                      reglas: { ...formData.reglas, tipo_documento_por_defecto: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factura_proveedor">Factura de proveedor</SelectItem>
                    <SelectItem value="nomina">Nómina</SelectItem>
                    <SelectItem value="albaran">Albarán</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="informe">Informe</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Destino por defecto</Label>
                <Select
                  value={formData.reglas.destino_por_defecto}
                  onValueChange={(value: any) => 
                    setFormData({
                      ...formData,
                      reglas: { ...formData.reglas, destino_por_defecto: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modulo_facturacion">Módulo Facturación</SelectItem>
                    <SelectItem value="modulo_rrhh">Módulo RRHH</SelectItem>
                    <SelectItem value="modulo_pedidos">Módulo Pedidos</SelectItem>
                    <SelectItem value="modulo_auditoria">Módulo Auditoría</SelectItem>
                    <SelectItem value="modulo_documentacion_general">Módulo Documentación General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ejemplo visual */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Ejemplo de configuración:</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Identificador principal: <span className="font-medium text-gray-900">{formData.reglas.identificador_principal.toUpperCase()}</span></p>
                <p>• Origen: <span className="font-medium text-gray-900">{formData.reglas.origen_identificador.replace(/_/g, ' ')}</span></p>
                <p>• Tipo documento: <span className="font-medium text-gray-900">{formData.reglas.tipo_documento_por_defecto.replace(/_/g, ' ')}</span></p>
                <p>• Destino: <span className="font-medium text-gray-900">{formData.reglas.destino_por_defecto.replace(/_/g, ' ')}</span></p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {agente ? 'Actualizar' : 'Crear'} Agente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
