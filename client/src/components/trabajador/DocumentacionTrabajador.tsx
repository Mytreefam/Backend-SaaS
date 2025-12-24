import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Download,
  Upload,
  Calendar,
  Euro,
  File,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Documento {
  id: string;
  tipo: 'nomina' | 'irpf' | 'contrato' | 'otro';
  nombre: string;
  fecha: string;
  tamano: string;
  url?: string;
}

export function DocumentacionTrabajador() {
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: 'DOC001',
      tipo: 'nomina',
      nombre: 'Nómina Octubre 2025',
      fecha: '2025-10-31',
      tamano: '245 KB',
      url: '#'
    },
    {
      id: 'DOC002',
      tipo: 'nomina',
      nombre: 'Nómina Septiembre 2025',
      fecha: '2025-09-30',
      tamano: '238 KB',
      url: '#'
    },
    {
      id: 'DOC003',
      tipo: 'nomina',
      nombre: 'Nómina Agosto 2025',
      fecha: '2025-08-31',
      tamano: '242 KB',
      url: '#'
    },
    {
      id: 'DOC004',
      tipo: 'contrato',
      nombre: 'Contrato Laboral',
      fecha: '2025-01-15',
      tamano: '1.2 MB',
      url: '#'
    },
    {
      id: 'DOC005',
      tipo: 'irpf',
      nombre: 'Certificado IRPF 2024',
      fecha: '2025-01-20',
      tamano: '320 KB',
      url: '#'
    },
    {
      id: 'DOC006',
      tipo: 'irpf',
      nombre: 'Certificado IRPF 2023',
      fecha: '2024-01-18',
      tamano: '315 KB',
      url: '#'
    },
    {
      id: 'DOC007',
      tipo: 'otro',
      nombre: 'Certificado Seguridad Social',
      fecha: '2025-02-10',
      tamano: '452 KB',
      url: '#'
    },
    {
      id: 'DOC008',
      tipo: 'otro',
      nombre: 'Certificado Formación PRL',
      fecha: '2025-03-15',
      tamano: '580 KB',
      url: '#'
    },
    {
      id: 'DOC009',
      tipo: 'otro',
      nombre: 'Informe Médico Laboral',
      fecha: '2025-01-25',
      tamano: '220 KB',
      url: '#'
    },
  ]);

  const handleSubirArchivo = () => {
    toast.success('Abriendo selector de archivos...');
    console.log('[UPLOAD] Subiendo archivo');
  };

  const handleDescargar = (doc: Documento) => {
    toast.success(`Descargando ${doc.nombre}...`);
    console.log('[DOWNLOAD] Documento:', doc);
  };

  const nominas = documentos.filter(d => d.tipo === 'nomina');
  const irpf = documentos.filter(d => d.tipo === 'irpf');
  const contrato = documentos.find(d => d.tipo === 'contrato');
  const otros = documentos.filter(d => d.tipo === 'otro');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Mi Documentación
        </h1>
        <p className="text-gray-600 text-sm">
          Accede y gestiona tus documentos laborales
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nominas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nominas">Nóminas</TabsTrigger>
          <TabsTrigger value="irpf">IRPF</TabsTrigger>
          <TabsTrigger value="otros">Otros</TabsTrigger>
        </TabsList>

        {/* TAB: NÓMINAS */}
        <TabsContent value="nominas" className="space-y-4">
          {/* Contrato */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Contrato Laboral
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!contrato ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay contrato disponible</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Documento
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Fecha de Contrato
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{contrato.nombre}</p>
                              <p className="text-sm text-gray-500">{contrato.tamano}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(contrato.fecha).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            onClick={() => handleDescargar(contrato)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nóminas */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Historial de Nóminas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nominas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Euro className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay nóminas disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Documento
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Tamaño
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nominas.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Euro className="w-5 h-5 text-green-600" />
                              </div>
                              <p className="font-medium text-gray-900">{doc.nombre}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(doc.fecha).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {doc.tamano}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              onClick={() => handleDescargar(doc)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: IRPF */}
        <TabsContent value="irpf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Certificados IRPF
              </CardTitle>
            </CardHeader>
            <CardContent>
              {irpf.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay certificados IRPF disponibles</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Documento
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Tamaño
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {irpf.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-purple-600" />
                              </div>
                              <p className="font-medium text-gray-900">{doc.nombre}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(doc.fecha).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {doc.tamano}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              onClick={() => handleDescargar(doc)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: OTROS */}
        <TabsContent value="otros" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Otros Documentos
                </CardTitle>
                <Button
                  onClick={handleSubirArchivo}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir documento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {otros.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <File className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No hay otros documentos disponibles</p>
                  <Button
                    onClick={handleSubirArchivo}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir primer documento
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Documento
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Fecha
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                          Tamaño
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {otros.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <File className="w-5 h-5 text-gray-600" />
                              </div>
                              <p className="font-medium text-gray-900">{doc.nombre}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(doc.fecha).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {doc.tamano}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              onClick={() => handleDescargar(doc)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Descargar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
