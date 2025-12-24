import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  FileText,
  Plus,
  LifeBuoy,
  Shield,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { SubirDocumentoModal } from './SubirDocumentoModal';
import { BiometriaModal } from './BiometriaModal';
import { AsistenciaModal } from './AsistenciaModal';
import { toast } from 'sonner@2.0.3';

interface Documento {
  id: string;
  tipo: string;
  nombre: string;
  fechaSubida: string;
  fechaCaducidad: string | null;
  notas?: string;
  numeroPoliza?: string;
  aseguradora?: string;
  telefonoAsistencia?: string;
  fechaDesde?: string;
  vehiculoId: string;
  archivo?: string;
}

interface DocumentacionVehiculoProps {
  vehiculoId: string;
  onNavigateToPerfil?: () => void;
}

export function DocumentacionVehiculo({ vehiculoId, onNavigateToPerfil }: DocumentacionVehiculoProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [modalSubirOpen, setModalSubirOpen] = useState(false);
  const [biometriaOpen, setBiometriaOpen] = useState(false);
  const [asistenciaModalOpen, setAsistenciaModalOpen] = useState(false);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [telefonoAsistencia, setTelefonoAsistencia] = useState<string | null>(null);

  const handleAbrirDocumentacion = () => {
    if (!desbloqueado) {
      setBiometriaOpen(true);
    }
  };

  const handleAutenticado = () => {
    setDesbloqueado(true);
    toast.success('Documentación desbloqueada');
    
    // Registrar log de acceso
    console.log(`[LOG] Usuario accedió a documentación del vehículo ${vehiculoId} - ${new Date().toISOString()}`);
  };

  const handleDocumentoSubido = (documento: Documento) => {
    setDocumentos([...documentos, documento]);
    
    // Si es un seguro con teléfono, guardarlo
    if (documento.tipo === 'seguro' && documento.telefonoAsistencia) {
      setTelefonoAsistencia(documento.telefonoAsistencia);
    }

    // Crear recordatorios automáticos
    if (documento.fechaCaducidad) {
      crearRecordatorios(documento);
    }
  };

  const crearRecordatorios = (documento: Documento) => {
    const fechaCad = new Date(documento.fechaCaducidad!);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaCad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes <= 30 && diasRestantes > 0) {
      toast.info(`Recordatorio: ${getTipoLabel(documento.tipo)} caduca en ${diasRestantes} días`);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      permiso: 'Permiso de circulación',
      itv: 'ITV',
      seguro: 'Seguro',
      carnet: 'Carnet de conducir'
    };
    return labels[tipo] || tipo;
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'seguro':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getEstadoVigencia = (fechaCaducidad: string | null) => {
    if (!fechaCaducidad) return null;

    const fechaCad = new Date(fechaCaducidad);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaCad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { label: 'Caducado', className: 'bg-red-100 text-red-700 border-red-200' };
    } else if (diasRestantes <= 7) {
      return { label: `Caduca en ${diasRestantes} días`, className: 'bg-orange-100 text-orange-700 border-orange-200' };
    } else if (diasRestantes <= 30) {
      return { label: `Caduca en ${diasRestantes} días`, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    } else {
      return { label: 'Vigente', className: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  const handleCompartir = (docId: string) => {
    // Generar link temporal (15 min)
    const pin = Math.floor(1000 + Math.random() * 9000);
    toast.success(`Link temporal generado. PIN: ${pin}. Válido 15 minutos.`);
    console.log(`[LOG] Documento ${docId} compartido - PIN: ${pin} - ${new Date().toISOString()}`);
  };

  const handleDescargar = (docId: string) => {
    toast.success('Documento descargado');
    console.log(`[LOG] Documento ${docId} descargado - ${new Date().toISOString()}`);
  };

  const handleEliminar = (docId: string) => {
    setDocumentos(documentos.filter(d => d.id !== docId));
    toast.success('Documento eliminado');
    console.log(`[LOG] Documento ${docId} eliminado - ${new Date().toISOString()}`);
  };

  const handleAsistencia247 = () => {
    if (telefonoAsistencia) {
      window.location.href = `tel:${telefonoAsistencia}`;
      toast.info(`Llamando a ${telefonoAsistencia}`);
    } else {
      setAsistenciaModalOpen(true);
    }
  };

  const enmascarar = (texto: string, visibles: number = 4) => {
    if (texto.length <= visibles) return texto;
    return '•••• ' + texto.slice(-visibles);
  };

  // Si no está desbloqueado, mostrar bloque bloqueado
  if (!desbloqueado) {
    return (
      <>
        <div className="p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-purple-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Documentación del vehículo
            </h4>
          </div>
          <p className="text-sm text-purple-700 mb-4">
            🔒 Contenido protegido. Desbloquea con tu huella o PIN para acceder.
          </p>
          <Button
            onClick={handleAbrirDocumentacion}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Lock className="w-4 h-4 mr-2" />
            Desbloquear documentación
          </Button>
        </div>

        <BiometriaModal
          isOpen={biometriaOpen}
          onOpenChange={setBiometriaOpen}
          onAutenticado={handleAutenticado}
        />
      </>
    );
  }

  // Si está desbloqueado, mostrar contenido
  return (
    <>
      <div className="p-4 rounded-lg bg-teal-50 border-2 border-teal-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <h4 className="font-medium text-teal-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Documentación del vehículo
            </h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600">
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    🔒 Contenido cifrado. Para el carnet de conducir: una foto no sustituye al soporte físico ni a la app miDGT.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDesbloqueado(false)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <Lock className="w-3 h-3 mr-1" />
            Bloquear
          </Button>
        </div>

        {/* Estado vacío */}
        {documentos.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">
              Guarda aquí la documentación de tu vehículo para tenerla siempre a mano.
            </p>
            <Button
              onClick={() => setModalSubirOpen(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir documento
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de documentos */}
            <div className="space-y-2 mb-4">
              {documentos.map((doc) => {
                const estadoVigencia = getEstadoVigencia(doc.fechaCaducidad);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100">
                      {getTipoIcon(doc.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getTipoLabel(doc.tipo)}
                        </p>
                        {estadoVigencia && (
                          <Badge variant="outline" className={`text-xs ${estadoVigencia.className}`}>
                            {estadoVigencia.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {doc.tipo === 'seguro' && doc.aseguradora && (
                          <span>{doc.aseguradora} · </span>
                        )}
                        {doc.tipo === 'seguro' && doc.numeroPoliza && (
                          <span>Póliza: {enmascarar(doc.numeroPoliza)} · </span>
                        )}
                        {doc.fechaCaducidad && (
                          <span>Válido hasta {new Date(doc.fechaCaducidad).toLocaleDateString('es-ES')}</span>
                        )}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="touch-target p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDescargar(doc.id)}>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCompartir(doc.id)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartir (15 min)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEliminar(doc.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={() => setModalSubirOpen(true)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir documento
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAsistencia247}
                      variant="outline"
                      className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                      size="sm"
                    >
                      <LifeBuoy className="w-4 h-4 mr-2" />
                      Asistencia 24/7
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Llamar ahora a tu aseguradora</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      <SubirDocumentoModal
        isOpen={modalSubirOpen}
        onOpenChange={setModalSubirOpen}
        onDocumentoSubido={handleDocumentoSubido}
        vehiculoId={vehiculoId}
      />

      <AsistenciaModal
        isOpen={asistenciaModalOpen}
        onOpenChange={setAsistenciaModalOpen}
        onIrAPerfil={() => {
          setAsistenciaModalOpen(false);
          if (onNavigateToPerfil) {
            onNavigateToPerfil();
          }
        }}
      />
    </>
  );
}
