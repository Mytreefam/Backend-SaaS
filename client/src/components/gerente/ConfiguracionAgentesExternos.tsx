import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
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
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  FileText,
  Info,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES
// ============================================================================

interface AgenteExterno {
  id: string;
  nombre: string;
  tipo_agente: 'gestoria_laboral' | 'proveedor_facturas' | 'otro';
  empresas_asignadas: string[]; // IDs de empresas
  estado: 'activo' | 'bloqueado';
  email_contacto?: string;
  telefono?: string;
  reglas: ReglaLectura[];
}

interface ReglaLectura {
  regla_id: string;
  agente_externo_id: string;
  tipo_doc: 'nomina' | 'contrato' | 'irpf' | 'factura' | 'otros';
  campo_identificador_preferido: 'dni' | 'nif' | 'codigo_interno_trabajador' | 'email' | 'nombre_completo';
  origen_identificador: 'nombre_archivo' | 'contenido_ocr' | 'ambos';
  patron_nombre_archivo?: string;
  observaciones?: string;
}

interface Empresa {
  id: string;
  nombre: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ConfiguracionAgentesExternos() {
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [agenteSeleccionado, setAgenteSeleccionado] = useState<AgenteExterno | null>(null);

  // DATOS MOCK
  const empresasDisponibles: Empresa[] = [
    { id: 'EMP-001', nombre: 'PAU Hostelería' },
    { id: 'EMP-002', nombre: 'Tech Solutions SL' },
    { id: 'EMP-003', nombre: 'Retail Express' }
  ];

  const [agentes, setAgentes] = useState<AgenteExterno[]>([
    {
      id: 'AGENTE-001',
      nombre: 'Gestoría Laboral López',
      tipo_agente: 'gestoria_laboral',
      empresas_asignadas: ['EMP-001', 'EMP-002'],
      estado: 'activo',
      email_contacto: 'gestoria@lopez.com',
      telefono: '+34 912 345 678',
      reglas: [
        {
          regla_id: 'REGLA-001',
          agente_externo_id: 'AGENTE-001',
          tipo_doc: 'nomina',
          campo_identificador_preferido: 'dni',
          origen_identificador: 'nombre_archivo',
          patron_nombre_archivo: 'NOMINA_{anio}-{mes}_{dni}.pdf',
          observaciones: 'Formato estándar de nóminas mensual'
        },
        {
          regla_id: 'REGLA-002',
          agente_externo_id: 'AGENTE-001',
          tipo_doc: 'contrato',
          campo_identificador_preferido: 'nombre_completo',
          origen_identificador: 'contenido_ocr',
          observaciones: 'Detectar nombre completo en primera página del contrato'
        },
        {
          regla_id: 'REGLA-003',
          agente_externo_id: 'AGENTE-001',
          tipo_doc: 'irpf',
          campo_identificador_preferido: 'dni',
          origen_identificador: 'ambos',
          patron_nombre_archivo: 'IRPF_{anio}_{dni}.pdf',
          observaciones: 'Priorizar nombre de archivo, validar con OCR'
        }
      ]
    },
    {
      id: 'AGENTE-002',
      nombre: 'Proveedores Global SL',
      tipo_agente: 'proveedor_facturas',
      empresas_asignadas: ['EMP-001'],
      estado: 'activo',
      email_contacto: 'facturas@proveedores.com',
      reglas: [
        {
          regla_id: 'REGLA-004',
          agente_externo_id: 'AGENTE-002',
          tipo_doc: 'factura',
          campo_identificador_preferido: 'nif',
          origen_identificador: 'contenido_ocr',
          observaciones: 'Extraer NIF de la empresa del contenido de la factura'
        }
      ]
    },
    {
      id: 'AGENTE-003',
      nombre: 'Asesoría Fiscal Martínez',
      tipo_agente: 'gestoria_laboral',
      empresas_asignadas: ['EMP-003'],
      estado: 'bloqueado',
      email_contacto: 'info@asesoria-martinez.com',
      reglas: []
    }
  ]);

  // ============================================================================
  // FUNCIONES
  // ============================================================================

  const handleEditarAgente = (agente: AgenteExterno) => {
    setAgenteSeleccionado(agente);
    setModalEditarOpen(true);
  };

  const handleEliminarAgente = (agenteId: string) => {
    if (confirm('¿Estás seguro de eliminar este agente externo?')) {
      setAgentes(agentes.filter(a => a.id !== agenteId));
      toast.success('Agente externo eliminado');
      
      console.log('🗑️ ELIMINAR AGENTE:', {
        agente_id: agenteId
      });
    }
  };

  const handleToggleEstado = (agenteId: string) => {
    setAgentes(agentes.map(agente => {
      if (agente.id === agenteId) {
        const nuevoEstado = agente.estado === 'activo' ? 'bloqueado' : 'activo';
        
        console.log('🔄 CAMBIAR ESTADO AGENTE:', {
          agente_id: agenteId,
          estado_anterior: agente.estado,
          estado_nuevo: nuevoEstado
        });
        
        toast.success(`Agente ${nuevoEstado === 'activo' ? 'activado' : 'bloqueado'}`);
        
        return { ...agente, estado: nuevoEstado };
      }
      return agente;
    }));
  };

  const getEmpresasNombres = (empresasIds: string[]) => {
    return empresasIds
      .map(id => empresasDisponibles.find(e => e.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');
  };

  const getTipoAgenteLabel = (tipo: string) => {
    switch (tipo) {
      case 'gestoria_laboral':
        return 'Gestoría Laboral';
      case 'proveedor_facturas':
        return 'Proveedor Facturas';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  };

  const getTipoDocLabel = (tipo: string) => {
    switch (tipo) {
      case 'nomina':
        return 'Nómina';
      case 'contrato':
        return 'Contrato';
      case 'irpf':
        return 'IRPF';
      case 'factura':
        return 'Factura';
      case 'otros':
        return 'Otros';
      default:
        return tipo;
    }
  };

  const getCampoIdentificadorLabel = (campo: string) => {
    switch (campo) {
      case 'dni':
        return 'DNI';
      case 'nif':
        return 'NIF';
      case 'codigo_interno_trabajador':
        return 'Código interno trabajador';
      case 'email':
        return 'Email';
      case 'nombre_completo':
        return 'Nombre completo';
      default:
        return campo;
    }
  };

  const getOrigenIdentificadorLabel = (origen: string) => {
    switch (origen) {
      case 'nombre_archivo':
        return 'Nombre de archivo';
      case 'contenido_ocr':
        return 'Contenido OCR';
      case 'ambos':
        return 'Ambos';
      default:
        return origen;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            🏢 Agentes Externos
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona gestorías laborales, proveedores y sus reglas de lectura
          </p>
        </div>
        <Button
          onClick={() => setModalCrearOpen(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir agente externo
        </Button>
      </div>

      {/* Info alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-700">
          Los agentes externos (gestorías, proveedores) pueden subir documentos que se asignarán automáticamente 
          a trabajadores según las reglas configuradas. Cada agente tiene acceso solo a las empresas que le hayas asignado.
        </AlertDescription>
      </Alert>

      {/* Lista de agentes */}
      <div className="space-y-4">
        {agentes.map((agente) => (
          <Card key={agente.id} className={agente.estado === 'bloqueado' ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {agente.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-gray-50">
                        {getTipoAgenteLabel(agente.tipo_agente)}
                      </Badge>
                      <Badge
                        className={
                          agente.estado === 'activo'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {agente.estado === 'activo' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Bloqueado
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEstado(agente.id)}
                  >
                    {agente.estado === 'activo' ? 'Bloquear' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarAgente(agente)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEliminarAgente(agente.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-600">Empresas asignadas</Label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {getEmpresasNombres(agente.empresas_asignadas) || 'Ninguna'}
                  </p>
                </div>
                {agente.email_contacto && (
                  <div>
                    <Label className="text-xs text-gray-600">Email de contacto</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {agente.email_contacto}
                    </p>
                  </div>
                )}
                {agente.telefono && (
                  <div>
                    <Label className="text-xs text-gray-600">Teléfono</Label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {agente.telefono}
                    </p>
                  </div>
                )}
              </div>

              {/* Reglas de lectura */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <Label className="text-sm font-medium">
                    Reglas de lectura de documentos ({agente.reglas.length})
                  </Label>
                </div>

                {agente.reglas.length === 0 ? (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Info className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-sm text-orange-700">
                      Este agente no tiene reglas configuradas. Añade reglas para habilitar la asignación automática de documentos.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {agente.reglas.map((regla, index) => (
                      <AccordionItem key={regla.regla_id} value={`regla-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">
                              {getTipoDocLabel(regla.tipo_doc)}
                            </span>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {getCampoIdentificadorLabel(regla.campo_identificador_preferido)}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 pb-2 px-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs text-gray-600">Campo identificador</Label>
                                <p className="text-gray-900 mt-1">
                                  {getCampoIdentificadorLabel(regla.campo_identificador_preferido)}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Origen del identificador</Label>
                                <p className="text-gray-900 mt-1">
                                  {getOrigenIdentificadorLabel(regla.origen_identificador)}
                                </p>
                              </div>
                            </div>

                            {regla.patron_nombre_archivo && (
                              <div>
                                <Label className="text-xs text-gray-600">Patrón nombre archivo</Label>
                                <code className="block mt-1 px-3 py-2 bg-gray-100 rounded text-xs text-gray-900 font-mono">
                                  {regla.patron_nombre_archivo}
                                </code>
                              </div>
                            )}

                            {regla.observaciones && (
                              <div>
                                <Label className="text-xs text-gray-600">Observaciones técnicas</Label>
                                <p className="text-sm text-gray-700 mt-1 italic">
                                  {regla.observaciones}
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL: Crear/Editar Agente */}
      <ModalAgente
        isOpen={modalCrearOpen || modalEditarOpen}
        onOpenChange={(open) => {
          setModalCrearOpen(false);
          setModalEditarOpen(false);
          if (!open) setAgenteSeleccionado(null);
        }}
        agente={agenteSeleccionado}
        empresasDisponibles={empresasDisponibles}
        onGuardar={(agente) => {
          if (agenteSeleccionado) {
            // Editar
            setAgentes(agentes.map(a => a.id === agente.id ? agente : a));
            toast.success('Agente externo actualizado');
          } else {
            // Crear
            setAgentes([...agentes, { ...agente, id: `AGENTE-${Date.now()}` }]);
            toast.success('Agente externo creado');
          }
          
          console.log('💾 GUARDAR AGENTE:', agente);
          
          setModalCrearOpen(false);
          setModalEditarOpen(false);
          setAgenteSeleccionado(null);
        }}
      />
    </div>
  );
}

// ============================================================================
// MODAL: CREAR/EDITAR AGENTE
// ============================================================================

interface ModalAgenteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  agente: AgenteExterno | null;
  empresasDisponibles: Empresa[];
  onGuardar: (agente: AgenteExterno) => void;
}

function ModalAgente({
  isOpen,
  onOpenChange,
  agente,
  empresasDisponibles,
  onGuardar
}: ModalAgenteProps) {
  const [nombre, setNombre] = useState(agente?.nombre || '');
  const [tipoAgente, setTipoAgente] = useState(agente?.tipo_agente || 'gestoria_laboral');
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState<string[]>(agente?.empresas_asignadas || []);
  const [emailContacto, setEmailContacto] = useState(agente?.email_contacto || '');
  const [telefono, setTelefono] = useState(agente?.telefono || '');

  const handleGuardar = () => {
    if (!nombre || empresasSeleccionadas.length === 0) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    const agenteData: AgenteExterno = {
      id: agente?.id || '',
      nombre,
      tipo_agente: tipoAgente as any,
      empresas_asignadas: empresasSeleccionadas,
      estado: agente?.estado || 'activo',
      email_contacto: emailContacto || undefined,
      telefono: telefono || undefined,
      reglas: agente?.reglas || []
    };

    onGuardar(agenteData);
  };

  const toggleEmpresa = (empresaId: string) => {
    if (empresasSeleccionadas.includes(empresaId)) {
      setEmpresasSeleccionadas(empresasSeleccionadas.filter(id => id !== empresaId));
    } else {
      setEmpresasSeleccionadas([...empresasSeleccionadas, empresaId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            {agente ? 'Editar agente externo' : 'Crear agente externo'}
          </DialogTitle>
          <DialogDescription>
            Configura los datos básicos del agente externo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del agente *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Gestoría Laboral López"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Tipo de agente */}
          <div className="space-y-2">
            <Label htmlFor="tipo-agente">Tipo de agente *</Label>
            <Select value={tipoAgente} onValueChange={setTipoAgente as any}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gestoria_laboral">Gestoría Laboral</SelectItem>
                <SelectItem value="proveedor_facturas">Proveedor Facturas</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empresas asignadas */}
          <div className="space-y-2">
            <Label>Empresas asignadas *</Label>
            <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {empresasDisponibles.map((empresa) => (
                <label
                  key={empresa.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={empresasSeleccionadas.includes(empresa.id)}
                    onChange={() => toggleEmpresa(empresa.id)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="text-sm text-gray-900">{empresa.nombre}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {empresasSeleccionadas.length} empresa(s) seleccionada(s)
            </p>
          </div>

          {/* Email contacto */}
          <div className="space-y-2">
            <Label htmlFor="email">Email de contacto</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@empresa.com"
              value={emailContacto}
              onChange={(e) => setEmailContacto(e.target.value)}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+34 912 345 678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-700">
              Después de crear el agente, podrás configurar las reglas de lectura de documentos 
              para cada tipo de documento (nóminas, contratos, IRPF, etc.)
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={!nombre || empresasSeleccionadas.length === 0}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {agente ? 'Guardar cambios' : 'Crear agente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
