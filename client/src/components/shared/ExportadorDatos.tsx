import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Download, FileSpreadsheet, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExportadorDatosProps {
  datos: any;
  nombreArchivo?: string;
  metadatos?: {
    titulo: string;
    subtitulo?: string;
    fecha?: string;
    usuario?: string;
  };
}

export const ExportadorDatos = ({ 
  datos, 
  nombreArchivo = 'datos-udar-edge',
  metadatos 
}: ExportadorDatosProps) => {
  const [formato, setFormato] = useState<'csv' | 'json' | 'txt'>('csv');
  const [incluirMetadatos, setIncluirMetadatos] = useState(true);
  const [incluirTimestamp, setIncluirTimestamp] = useState(true);
  const [abierto, setAbierto] = useState(false);

  /**
   * Convierte datos a CSV
   */
  const convertirACSV = (data: any): string => {
    if (Array.isArray(data) && data.length > 0) {
      // Obtener las claves del primer objeto
      const headers = Object.keys(data[0]);
      
      // Crear la fila de encabezados
      const csvHeaders = headers.join(',');
      
      // Crear las filas de datos
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar valores que contienen comas o comillas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      return [csvHeaders, ...csvRows].join('\n');
    }
    
    // Si no es un array, convertir objeto a formato clave-valor
    return Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
  };

  /**
   * Convierte datos a JSON formateado
   */
  const convertirAJSON = (data: any): string => {
    return JSON.stringify(data, null, 2);
  };

  /**
   * Convierte datos a TXT legible
   */
  const convertirATXT = (data: any): string => {
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        const itemStr = Object.entries(item)
          .map(([key, value]) => `  ${key}: ${value}`)
          .join('\n');
        return `Registro ${index + 1}:\n${itemStr}`;
      }).join('\n\n');
    }
    
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  /**
   * Genera el contenido del archivo según el formato
   */
  const generarContenido = (): string => {
    let contenido = '';
    
    // Agregar metadatos si está habilitado
    if (incluirMetadatos && metadatos) {
      const metaStr = [
        metadatos.titulo,
        metadatos.subtitulo,
        metadatos.fecha && `Fecha: ${metadatos.fecha}`,
        metadatos.usuario && `Usuario: ${metadatos.usuario}`,
        incluirTimestamp && `Exportado: ${new Date().toLocaleString('es-ES')}`,
        '---'
      ].filter(Boolean).join('\n');
      
      contenido += metaStr + '\n\n';
    }
    
    // Agregar datos según el formato
    switch (formato) {
      case 'csv':
        contenido += convertirACSV(datos);
        break;
      case 'json':
        contenido += convertirAJSON(datos);
        break;
      case 'txt':
        contenido += convertirATXT(datos);
        break;
    }
    
    return contenido;
  };

  /**
   * Descarga el archivo
   */
  const descargarArchivo = () => {
    try {
      const contenido = generarContenido();
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Generar nombre de archivo con timestamp si está habilitado
      const timestamp = incluirTimestamp 
        ? `_${new Date().toISOString().split('T')[0]}`
        : '';
      
      link.href = url;
      link.download = `${nombreArchivo}${timestamp}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Archivo descargado correctamente', {
        description: `${nombreArchivo}${timestamp}.${formato}`,
        icon: <CheckCircle className="w-4 h-4" />
      });
      
      setAbierto(false);
    } catch (error) {
      toast.error('Error al exportar', {
        description: 'No se pudo generar el archivo de exportación'
      });
      console.error('Error al exportar:', error);
    }
  };

  /**
   * Copia al portapapeles
   */
  const copiarAlPortapapeles = async () => {
    try {
      const contenido = generarContenido();
      await navigator.clipboard.writeText(contenido);
      
      toast.success('Copiado al portapapeles', {
        icon: <CheckCircle className="w-4 h-4" />
      });
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'No se pudo copiar al portapapeles'
      });
    }
  };

  /**
   * Vista previa del contenido
   */
  const vistaPrevia = (): string => {
    const contenido = generarContenido();
    return contenido.length > 500 
      ? contenido.substring(0, 500) + '...\n\n[Contenido truncado para vista previa]'
      : contenido;
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 sm:h-9 text-xs sm:text-sm"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Exportar</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            Exportar Datos
          </DialogTitle>
          <DialogDescription>
            Selecciona el formato y opciones de exportación
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Selector de formato */}
          <div className="space-y-2">
            <Label>Formato de exportación</Label>
            <Select value={formato} onValueChange={(val: any) => setFormato(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV (Excel, Google Sheets)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    JSON (Datos estructurados)
                  </div>
                </SelectItem>
                <SelectItem value="txt">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    TXT (Texto plano)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opciones */}
          <div className="space-y-3">
            <Label>Opciones de exportación</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="metadatos"
                checked={incluirMetadatos}
                onCheckedChange={(checked) => setIncluirMetadatos(checked as boolean)}
              />
              <label
                htmlFor="metadatos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Incluir metadatos (título, fecha, usuario)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="timestamp"
                checked={incluirTimestamp}
                onCheckedChange={(checked) => setIncluirTimestamp(checked as boolean)}
              />
              <label
                htmlFor="timestamp"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Incluir marca de tiempo en el nombre del archivo
              </label>
            </div>
          </div>

          {/* Vista previa */}
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                {vistaPrevia()}
              </pre>
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <div className="text-blue-600 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Información del archivo:</p>
                <ul className="space-y-0.5 text-blue-700">
                  <li>• Formato: {formato.toUpperCase()}</li>
                  <li>• Registros: {Array.isArray(datos) ? datos.length : 'N/A'}</li>
                  <li>• Tamaño aproximado: {(generarContenido().length / 1024).toFixed(2)} KB</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button
              onClick={descargarArchivo}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Archivo
            </Button>
            
            <Button
              onClick={copiarAlPortapapeles}
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Copiar al Portapapeles
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportadorDatos;
