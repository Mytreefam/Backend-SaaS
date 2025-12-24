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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  CheckCircle2,
  FileCheck,
  Plus,
  Info,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES
// ============================================================================

interface DocumentoLaboral {
  doc_id: string;
  trabajador_id: string;
  tipo_doc: 'nomina' | 'contrato' | 'irpf' | 'otros';
  subtipo_doc?: string;
  periodo_mes?: number;
  periodo_anio?: number;
  fecha_documento: string;
  url_fichero: string;
  origen: 'trabajador' | 'agente_externo';
  agente_externo_id?: string;
  identificador_detectado?: string;
  procesado_por_ocr: boolean;
  estado_asignacion: 'ok' | 'pendiente' | 'error';
  tamano_kb?: number;
  nombre_archivo?: string;
}

interface ContratoVigente {
  doc_id: string;
  tipo_contrato: string;
  fecha_inicio: string;
  fecha_fin?: string;
  url_fichero: string;
  tamano_kb: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function DocumentacionLaboral() {
  const [tabActual, setTabActual] = useState<'nominas' | 'irpf' | 'otros'>('nominas');
  const [modalSubirOpen, setModalSubirOpen] = useState(false);
  const [modalVerDocumentoOpen, setModalVerDocumentoOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoLaboral | null>(null);

  // Datos del trabajador actual (simulated)
  const trabajadorId = 'TRAB-123';
  const empresaId = 'EMP-001';

  // DATOS MOCK - Contrato vigente
  const contratoVigente: ContratoVigente = {
    doc_id: 'DOC-CONT-001',
    tipo_contrato: 'Indefinido a tiempo completo',
    fecha_inicio: '2024-01-15',
    url_fichero: '/docs/contrato-2024-001.pdf',
    tamano_kb: 452
  };

  // DATOS MOCK - Nóminas
  const nominas: DocumentoLaboral[] = [
    {
      doc_id: 'DOC-NOM-001',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'nomina',
      periodo_mes: 10,
      periodo_anio: 2025,
      fecha_documento: '2025-11-05',
      url_fichero: '/docs/nomina-2025-10.pdf',
      origen: 'agente_externo',
      agente_externo_id: 'AGENTE-001',
      identificador_detectado: '12345678A',
      procesado_por_ocr: true,
      estado_asignacion: 'ok',
      tamano_kb: 248,
      nombre_archivo: 'NOMINA_2025-10_12345678A.pdf'
    },
    {
      doc_id: 'DOC-NOM-002',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'nomina',
      periodo_mes: 9,
      periodo_anio: 2025,
      fecha_documento: '2025-10-05',
      url_fichero: '/docs/nomina-2025-09.pdf',
      origen: 'agente_externo',
      agente_externo_id: 'AGENTE-001',
      identificador_detectado: '12345678A',
      procesado_por_ocr: true,
      estado_asignacion: 'ok',
      tamano_kb: 251,
      nombre_archivo: 'NOMINA_2025-09_12345678A.pdf'
    },
    {
      doc_id: 'DOC-NOM-003',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'nomina',
      periodo_mes: 8,
      periodo_anio: 2025,
      fecha_documento: '2025-09-05',
      url_fichero: '/docs/nomina-2025-08.pdf',
      origen: 'agente_externo',
      agente_externo_id: 'AGENTE-001',
      identificador_detectado: '12345678A',
      procesado_por_ocr: true,
      estado_asignacion: 'ok',
      tamano_kb: 245,
      nombre_archivo: 'NOMINA_2025-08_12345678A.pdf'
    }
  ];

  // DATOS MOCK - IRPF
  const irpf: DocumentoLaboral[] = [
    {
      doc_id: 'DOC-IRPF-001',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'irpf',
      periodo_anio: 2024,
      fecha_documento: '2025-04-20',
      url_fichero: '/docs/irpf-2024.pdf',
      origen: 'agente_externo',
      agente_externo_id: 'AGENTE-001',
      identificador_detectado: '12345678A',
      procesado_por_ocr: true,
      estado_asignacion: 'ok',
      tamano_kb: 385,
      nombre_archivo: 'IRPF_2024_12345678A.pdf'
    },
    {
      doc_id: 'DOC-IRPF-002',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'irpf',
      periodo_anio: 2023,
      fecha_documento: '2024-04-15',
      url_fichero: '/docs/irpf-2023.pdf',
      origen: 'agente_externo',
      agente_externo_id: 'AGENTE-001',
      identificador_detectado: '12345678A',
      procesado_por_ocr: true,
      estado_asignacion: 'ok',
      tamano_kb: 372,
      nombre_archivo: 'IRPF_2023_12345678A.pdf'
    }
  ];

  // DATOS MOCK - Otros
  const otros: DocumentoLaboral[] = [
    {
      doc_id: 'DOC-OTR-001',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'otros',
      subtipo_doc: 'Baja médica',
      fecha_documento: '2025-11-20',
      url_fichero: '/docs/baja-medica-2025-11.pdf',
      origen: 'trabajador',
      procesado_por_ocr: false,
      estado_asignacion: 'ok',
      tamano_kb: 156,
      nombre_archivo: 'baja_medica_20nov2025.pdf'
    },
    {
      doc_id: 'DOC-OTR-002',
      trabajador_id: 'TRAB-123',
      tipo_doc: 'otros',
      subtipo_doc: 'Cambio cuenta bancaria',
      fecha_documento: '2025-09-15',
      url_fichero: '/docs/cambio-cuenta-2025-09.pdf',
      origen: 'trabajador',
      procesado_por_ocr: false,
      estado_asignacion: 'ok',
      tamano_kb: 89,
      nombre_archivo: 'cambio_cuenta_sept2025.pdf'
    }
  ];

  // ============================================================================
  // FUNCIONES
  // ============================================================================

  const handleDescargarDocumento = (documento: DocumentoLaboral) => {
    console.log('📥 DESCARGAR DOCUMENTO:', {
      doc_id: documento.doc_id,
      tipo: documento.tipo_doc,
      url: documento.url_fichero
    });
    
    // TODO: Implementar descarga real
    toast.success('Descargando documento...');
  };

  const handleVerDocumento = (documento: DocumentoLaboral) => {
    setDocumentoSeleccionado(documento);
    setModalVerDocumentoOpen(true);
  };

  const formatearPeriodoNomina = (mes?: number, anio?: number) => {
    if (!mes || !anio) return '-';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[mes - 1]} ${anio}`;
  };

  const formatearTamano = (kb?: number) => {
    if (!kb) return '-';
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
            📄 Documentación laboral
          </h1>
          <p className="text-gray-600 mt-1">
            Consulta y descarga tu documentación laboral
          </p>
        </div>
      </div>

      {/* Contrato Laboral (siempre visible arriba) */}
      <Card className="border-teal-200 bg-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Contrato Laboral Vigente
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {contratoVigente.tipo_contrato}
                </p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">
              Activo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-teal-200">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-teal-600" />
              <div>
                <p className="font-medium text-gray-900">
                  Contrato_{contratoVigente.fecha_inicio.replace(/-/g, '')}.pdf
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Desde {formatearFecha(contratoVigente.fecha_inicio)}
                  </span>
                  <span>·</span>
                  <span>{formatearTamano(contratoVigente.tamano_kb)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDescargarDocumento({
                  doc_id: contratoVigente.doc_id,
                  trabajador_id: trabajadorId,
                  tipo_doc: 'contrato',
                  fecha_documento: contratoVigente.fecha_inicio,
                  url_fichero: contratoVigente.url_fichero,
                  origen: 'agente_externo',
                  procesado_por_ocr: false,
                  estado_asignacion: 'ok'
                })}
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de documentos */}
      <Tabs value={tabActual} onValueChange={(value) => setTabActual(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nominas" className="gap-2">
            <FileText className="w-4 h-4" />
            Nóminas
            <Badge variant="outline" className="ml-1 bg-white">
              {nominas.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="irpf" className="gap-2">
            <FileCheck className="w-4 h-4" />
            IRPF
            <Badge variant="outline" className="ml-1 bg-white">
              {irpf.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="otros" className="gap-2">
            <FileText className="w-4 h-4" />
            Otros
            <Badge variant="outline" className="ml-1 bg-white">
              {otros.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB: NÓMINAS */}
        <TabsContent value="nominas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Historial de nóminas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nominas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay nóminas disponibles</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Fecha publicación</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nominas.map((nomina) => (
                      <TableRow key={nomina.doc_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {nomina.nombre_archivo}
                              </p>
                              {nomina.origen === 'agente_externo' && (
                                <p className="text-xs text-gray-500">
                                  Subido por gestoría
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {formatearPeriodoNomina(nomina.periodo_mes, nomina.periodo_anio)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatearFecha(nomina.fecha_documento)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatearTamano(nomina.tamano_kb)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDocumento(nomina)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDescargarDocumento(nomina)}
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: IRPF */}
        <TabsContent value="irpf" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Certificados IRPF
              </CardTitle>
            </CardHeader>
            <CardContent>
              {irpf.length === 0 ? (
                <div className="text-center py-12">
                  <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay certificados IRPF disponibles</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Año fiscal</TableHead>
                      <TableHead>Fecha publicación</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {irpf.map((doc) => (
                      <TableRow key={doc.doc_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileCheck className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {doc.nombre_archivo}
                              </p>
                              {doc.origen === 'agente_externo' && (
                                <p className="text-xs text-gray-500">
                                  Subido por gestoría
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {doc.periodo_anio}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatearFecha(doc.fecha_documento)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatearTamano(doc.tamano_kb)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDocumento(doc)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDescargarDocumento(doc)}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: OTROS */}
        <TabsContent value="otros" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Otros documentos
                </CardTitle>
                <Button
                  onClick={() => setModalSubirOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Subir documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-700">
                  Aquí puedes subir documentos como bajas médicas, cambios de cuenta bancaria, 
                  justificantes, etc. Se enviarán automáticamente a tu gestoría laboral.
                </AlertDescription>
              </Alert>

              {otros.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay otros documentos</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setModalSubirOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Subir primer documento
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha subida</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otros.map((doc) => (
                      <TableRow key={doc.doc_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {doc.nombre_archivo}
                              </p>
                              <p className="text-xs text-gray-500">
                                Subido por ti
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-50">
                            {doc.subtipo_doc}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatearFecha(doc.fecha_documento)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatearTamano(doc.tamano_kb)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDocumento(doc)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDescargarDocumento(doc)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: Subir documento "Otros" */}
      <ModalSubirDocumento
        isOpen={modalSubirOpen}
        onOpenChange={setModalSubirOpen}
        trabajadorId={trabajadorId}
        empresaId={empresaId}
      />

      {/* MODAL: Ver documento */}
      <ModalVerDocumento
        isOpen={modalVerDocumentoOpen}
        onOpenChange={setModalVerDocumentoOpen}
        documento={documentoSeleccionado}
      />
    </div>
  );
}

// ============================================================================
// MODAL: SUBIR DOCUMENTO "OTROS"
// ============================================================================

interface ModalSubirDocumentoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trabajadorId: string;
  empresaId: string;
}

function ModalSubirDocumento({
  isOpen,
  onOpenChange,
  trabajadorId,
  empresaId
}: ModalSubirDocumentoProps) {
  const [subtipoDoc, setSubtipoDoc] = useState('');
  const [comentario, setComentario] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);

  const subtiposDisponibles = [
    'Baja médica',
    'Cambio cuenta bancaria',
    'Justificante',
    'Certificado médico',
    'Alta voluntaria',
    'Otro'
  ];

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar PDF
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 5MB');
        return;
      }
      
      setArchivo(file);
    }
  };

  const handleSubir = () => {
    if (!subtipoDoc || !archivo) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const payload = {
      trabajador_id: trabajadorId,
      empresa_id: empresaId,
      tipo_doc: 'otros',
      subtipo_doc: subtipoDoc,
      comentario: comentario || null,
      archivo_nombre: archivo.name,
      archivo_tamano_kb: Math.round(archivo.size / 1024),
      origen: 'trabajador',
      fecha_documento: new Date().toISOString(),
      estado_asignacion: 'ok'
    };

    console.log('📤 SUBIR DOCUMENTO TRABAJADOR:', payload);
    console.log('📧 NOTIFICAR GESTORÍA:', {
      tipo: 'nuevo_documento_trabajador',
      trabajador_id: trabajadorId,
      subtipo: subtipoDoc,
      comentario
    });

    // TODO: Subir archivo real y crear registro en BBDD
    // TODO: Enviar notificación a gestoría vía Make

    toast.success('Documento subido correctamente');
    toast.info('Se ha notificado a tu gestoría laboral');
    
    // Reset y cerrar
    setSubtipoDoc('');
    setComentario('');
    setArchivo(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Subir documento
              </DialogTitle>
              <DialogDescription>
                Sube un documento y se enviará a tu gestoría
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="subtipo">Tipo de documento *</Label>
            <Select value={subtipoDoc} onValueChange={setSubtipoDoc}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {subtiposDisponibles.map((subtipo) => (
                  <SelectItem key={subtipo} value={subtipo}>
                    {subtipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              placeholder="Añade un comentario o contexto sobre el documento..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
            />
          </div>

          {/* Adjuntar archivo */}
          <div className="space-y-2">
            <Label htmlFor="archivo">Adjuntar archivo *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
              <input
                type="file"
                id="archivo"
                accept=".pdf"
                onChange={handleArchivoChange}
                className="hidden"
              />
              <label htmlFor="archivo" className="cursor-pointer">
                {archivo ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {archivo.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(archivo.size / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-teal-600">
                      Clic para cambiar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Haz clic para seleccionar</strong> o arrastra el archivo
                    </p>
                    <p className="text-xs text-gray-500">
                      Solo PDF, máximo 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-700">
              Este documento se enviará automáticamente a tu gestoría laboral para su revisión.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubir}
            disabled={!subtipoDoc || !archivo}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MODAL: VER DOCUMENTO
// ============================================================================

interface ModalVerDocumentoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documento: DocumentoLaboral | null;
}

function ModalVerDocumento({
  isOpen,
  onOpenChange,
  documento
}: ModalVerDocumentoProps) {
  if (!documento) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Vista previa del documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info del documento */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium text-gray-900">
                {documento.tipo_doc === 'nomina' && 'Nómina'}
                {documento.tipo_doc === 'irpf' && 'IRPF'}
                {documento.tipo_doc === 'contrato' && 'Contrato'}
                {documento.tipo_doc === 'otros' && documento.subtipo_doc}
              </span>
            </div>
            {documento.periodo_mes && documento.periodo_anio && (
              <div className="flex justify-between">
                <span className="text-gray-600">Periodo:</span>
                <span className="font-medium text-gray-900">
                  {documento.periodo_mes}/{documento.periodo_anio}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span className="font-medium text-gray-900">
                {new Date(documento.fecha_documento).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Origen:</span>
              <span className="font-medium text-gray-900">
                {documento.origen === 'trabajador' ? 'Subido por ti' : 'Gestoría laboral'}
              </span>
            </div>
          </div>

          {/* Simulación de visor PDF */}
          <div className="border rounded-lg bg-gray-100 h-96 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Vista previa del PDF</p>
              <p className="text-sm text-gray-500 mt-1">{documento.nombre_archivo}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            onClick={() => {
              console.log('Descargar:', documento);
              toast.success('Descargando documento...');
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
