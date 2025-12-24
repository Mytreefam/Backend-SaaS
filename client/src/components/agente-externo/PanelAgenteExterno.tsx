import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Eye,
  Search,
  Download,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES
// ============================================================================

interface Empresa {
  id: string;
  nombre: string;
}

interface Trabajador {
  id: string;
  nombre: string;
  dni: string;
  codigo_interno?: string;
  empresa_id: string;
}

interface DocumentoProcesado {
  id: string;
  archivo_nombre: string;
  tipo_doc: 'nomina' | 'contrato' | 'irpf';
  identificador_detectado?: string;
  trabajador_asignado?: Trabajador;
  estado: 'procesando' | 'asignado' | 'pendiente' | 'error';
  fecha_subida: string;
  tamano_kb: number;
  metodo_deteccion?: 'nombre_archivo' | 'ocr' | 'manual';
  url_temporal?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PanelAgenteExterno() {
  const [tabActual, setTabActual] = useState<'subir' | 'pendientes'>('subir');
  
  // Datos del agente externo logueado
  const agenteExternoId = 'AGENTE-001';
  const nombreAgente = 'Gestoría Laboral López';
  
  // SUBIR DOCUMENTOS
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [archivos, setArchivos] = useState<File[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [documentosProcesados, setDocumentosProcesados] = useState<DocumentoProcesado[]>([]);

  // DATOS MOCK
  const empresasPermitidas: Empresa[] = [
    { id: 'EMP-001', nombre: 'Disarmink S.L.' },
    { id: 'EMP-002', nombre: 'Tech Solutions SL' },
    { id: 'EMP-003', nombre: 'Retail Express' }
  ];

  const trabajadoresEmpresa: Trabajador[] = [
    { id: 'TRAB-123', nombre: 'Carlos Méndez García', dni: '12345678A', codigo_interno: 'COD-001', empresa_id: 'EMP-001' },
    { id: 'TRAB-124', nombre: 'Ana López Martín', dni: '87654321B', codigo_interno: 'COD-002', empresa_id: 'EMP-001' },
    { id: 'TRAB-125', nombre: 'Pedro Sánchez Ruiz', dni: '11223344C', codigo_interno: 'COD-003', empresa_id: 'EMP-001' },
  ];

  const documentosPendientes: DocumentoProcesado[] = [
    {
      id: 'PEND-001',
      archivo_nombre: 'NOMINA_2025-11_DESCONOCIDO.pdf',
      tipo_doc: 'nomina',
      identificador_detectado: '99887766X',
      estado: 'pendiente',
      fecha_subida: '2025-11-26T10:30:00Z',
      tamano_kb: 245,
      metodo_deteccion: 'nombre_archivo'
    },
    {
      id: 'PEND-002',
      archivo_nombre: 'contrato_nuevo_empleado.pdf',
      tipo_doc: 'contrato',
      identificador_detectado: 'Juan Martínez',
      estado: 'pendiente',
      fecha_subida: '2025-11-25T14:20:00Z',
      tamano_kb: 412,
      metodo_deteccion: 'ocr'
    }
  ];

  // ============================================================================
  // FUNCIONES - SUBIR DOCUMENTOS
  // ============================================================================

  const handleArchivosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      
      // Validar PDFs
      const archivosValidos = nuevosArchivos.filter(file => {
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} no es un PDF válido`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} supera el límite de 10MB`);
          return false;
        }
        return true;
      });
      
      setArchivos([...archivos, ...archivosValidos]);
      toast.success(`${archivosValidos.length} archivo(s) añadido(s)`);
    }
  };

  const handleEliminarArchivo = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const handleProcesarDocumentos = async () => {
    if (!empresaSeleccionada || !tipoDocumento || archivos.length === 0) {
      toast.error('Completa todos los campos y selecciona al menos un archivo');
      return;
    }

    setProcesando(true);
    toast.info('Procesando documentos con OCR...');

    // Simular procesamiento
    setTimeout(() => {
      const nuevosDocumentos: DocumentoProcesado[] = archivos.map((archivo, index) => {
        // Simular detección de identificador
        const identificadorDetectado = index % 3 === 0 ? '12345678A' : (index % 3 === 1 ? '87654321B' : '99887766X');
        const trabajador = trabajadoresEmpresa.find(t => t.dni === identificadorDetectado);
        
        return {
          id: `DOC-${Date.now()}-${index}`,
          archivo_nombre: archivo.name,
          tipo_doc: tipoDocumento as any,
          identificador_detectado: identificadorDetectado,
          trabajador_asignado: trabajador,
          estado: trabajador ? 'asignado' : 'pendiente',
          fecha_subida: new Date().toISOString(),
          tamano_kb: Math.round(archivo.size / 1024),
          metodo_deteccion: 'ocr'
        };
      });

      setDocumentosProcesados(nuevosDocumentos);
      
      const asignados = nuevosDocumentos.filter(d => d.estado === 'asignado').length;
      const pendientes = nuevosDocumentos.filter(d => d.estado === 'pendiente').length;
      
      setProcesando(false);
      toast.success(`Procesamiento completado: ${asignados} asignados, ${pendientes} pendientes`);
      
      console.log('📤 DOCUMENTOS PROCESADOS:', {
        agente_externo_id: agenteExternoId,
        empresa_id: empresaSeleccionada,
        tipo_documento: tipoDocumento,
        total_archivos: archivos.length,
        asignados,
        pendientes,
        documentos: nuevosDocumentos
      });
    }, 3000);
  };

  const handleLimpiar = () => {
    setArchivos([]);
    setDocumentosProcesados([]);
    setEmpresaSeleccionada('');
    setTipoDocumento('');
  };

  // ============================================================================
  // FUNCIONES - PENDIENTES
  // ============================================================================

  const handleAsignarTrabajador = (documentoId: string, trabajadorId: string) => {
    const trabajador = trabajadoresEmpresa.find(t => t.id === trabajadorId);
    
    if (!trabajador) {
      toast.error('Trabajador no encontrado');
      return;
    }

    console.log('✅ ASIGNAR DOCUMENTO:', {
      documento_id: documentoId,
      trabajador_id: trabajadorId,
      trabajador_nombre: trabajador.nombre,
      agente_externo_id: agenteExternoId
    });

    console.log('📧 NOTIFICAR TRABAJADOR:', {
      trabajador_id: trabajadorId,
      tipo_notificacion: 'nuevo_documento',
      mensaje: 'Tienes un nuevo documento disponible'
    });

    toast.success(`Documento asignado a ${trabajador.nombre}`);
    toast.info('Se ha notificado al trabajador');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            🏢 Panel Gestoría Laboral
          </h1>
          <p className="text-gray-600 mt-1">
            {nombreAgente} · Gestión de documentos laborales
          </p>
        </div>
        <Badge className="bg-purple-600 text-white">
          Agente Externo
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={tabActual} onValueChange={(value) => setTabActual(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subir" className="gap-2">
            <Upload className="w-4 h-4" />
            Subir documentos
          </TabsTrigger>
          <TabsTrigger value="pendientes" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendientes de asignar
            {documentosPendientes.length > 0 && (
              <Badge variant="outline" className="ml-1 bg-orange-50 text-orange-700 border-orange-200">
                {documentosPendientes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB: SUBIR DOCUMENTOS */}
        <TabsContent value="subir" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Cargar documentos laborales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selectores obligatorios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select value={empresaSeleccionada} onValueChange={setEmpresaSeleccionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresasPermitidas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-doc">Tipo de documento *</Label>
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nomina">Nóminas</SelectItem>
                      <SelectItem value="contrato">Contratos</SelectItem>
                      <SelectItem value="irpf">IRPF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Área de subida */}
              <div className="space-y-3">
                <Label>Documentos PDF</Label>
                
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-700">
                    Puedes subir un PDF único con todas las nóminas o varios PDF individuales. 
                    El sistema intentará asignar cada documento al trabajador según las reglas configuradas para tu gestoría.
                  </AlertDescription>
                </Alert>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    id="archivos-pdf"
                    accept=".pdf"
                    multiple
                    onChange={handleArchivosChange}
                    className="hidden"
                  />
                  <label htmlFor="archivos-pdf" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-lg bg-purple-100 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Haz clic para seleccionar archivos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          O arrastra los PDFs aquí · Máximo 10MB por archivo
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Lista de archivos seleccionados */}
                {archivos.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Archivos seleccionados ({archivos.length})
                    </Label>
                    <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                      {archivos.map((archivo, index) => (
                        <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {archivo.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(archivo.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarArchivo(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleLimpiar}
                  disabled={procesando || archivos.length === 0}
                >
                  Limpiar
                </Button>
                <Button
                  onClick={handleProcesarDocumentos}
                  disabled={!empresaSeleccionada || !tipoDocumento || archivos.length === 0 || procesando}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {procesando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Procesar documentos
                    </>
                  )}
                </Button>
              </div>

              {/* Tabla de procesamiento */}
              {documentosProcesados.length > 0 && (
                <div className="mt-6 space-y-3">
                  <Label className="text-base font-medium">
                    Resultado del procesamiento
                  </Label>
                  
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Archivo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Identificador detectado</TableHead>
                        <TableHead>Trabajador asignado</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentosProcesados.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium">{doc.archivo_nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {doc.tipo_doc}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {doc.identificador_detectado || '-'}
                          </TableCell>
                          <TableCell>
                            {doc.trabajador_asignado ? (
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">
                                  {doc.trabajador_asignado.nombre}
                                </p>
                                <p className="text-xs text-gray-500">
                                  DNI: {doc.trabajador_asignado.dni}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Sin asignar</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {doc.estado === 'procesando' && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Procesando
                              </Badge>
                            )}
                            {doc.estado === 'asignado' && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Asignado
                              </Badge>
                            )}
                            {doc.estado === 'pendiente' && (
                              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendiente
                              </Badge>
                            )}
                            {doc.estado === 'error' && (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {doc.estado === 'pendiente' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setTabActual('pendientes');
                                }}
                              >
                                Asignar manual
                              </Button>
                            )}
                            {doc.estado === 'asignado' && (
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PENDIENTES DE ASIGNAR */}
        <TabsContent value="pendientes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Documentos pendientes de asignar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentosPendientes.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600">No hay documentos pendientes</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Todos los documentos han sido asignados correctamente
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Identificador detectado</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Seleccionar trabajador</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentosPendientes.map((doc) => (
                      <FilaPendiente
                        key={doc.id}
                        documento={doc}
                        trabajadoresDisponibles={trabajadoresEmpresa}
                        onAsignar={handleAsignarTrabajador}
                      />
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// COMPONENTE: FILA PENDIENTE
// ============================================================================

interface FilaPendienteProps {
  documento: DocumentoProcesado;
  trabajadoresDisponibles: Trabajador[];
  onAsignar: (documentoId: string, trabajadorId: string) => void;
}

function FilaPendiente({
  documento,
  trabajadoresDisponibles,
  onAsignar
}: FilaPendienteProps) {
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const trabajadoresFiltrados = trabajadoresDisponibles.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.dni.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.codigo_interno?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {documento.archivo_nombre}
            </p>
            <p className="text-xs text-gray-500">
              {(documento.tamano_kb / 1024).toFixed(1)} MB · {new Date(documento.fecha_subida).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          {documento.identificador_detectado || 'No detectado'}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        Disarmink S.L.
      </TableCell>
      <TableCell>
        <Select value={trabajadorSeleccionado} onValueChange={setTrabajadorSeleccionado}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Buscar trabajador..." />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            {trabajadoresFiltrados.map((trabajador) => (
              <SelectItem key={trabajador.id} value={trabajador.id}>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{trabajador.nombre}</p>
                    <p className="text-xs text-gray-500">DNI: {trabajador.dni}</p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <Button
          onClick={() => onAsignar(documento.id, trabajadorSeleccionado)}
          disabled={!trabajadorSeleccionado}
          size="sm"
          className="bg-orange-600 hover:bg-orange-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Asignar documento
        </Button>
      </TableCell>
    </TableRow>
  );
}
