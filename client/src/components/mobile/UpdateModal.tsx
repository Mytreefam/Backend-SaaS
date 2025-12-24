import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { AlertTriangle, CheckCircle2, Download, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  latestVersion: string;
  changelog?: string[];
  isRequired?: boolean; // Si es actualización crítica
  onUpdate: () => void;
}

/**
 * Modal para mostrar actualizaciones disponibles
 */
export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  currentVersion,
  latestVersion,
  changelog = [],
  isRequired = false,
  onUpdate,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={isRequired ? undefined : onClose}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={isRequired ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isRequired ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isRequired ? (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            ) : (
              <Sparkles className="w-8 h-8 text-teal-500" />
            )}
            <div>
              <DialogTitle className="text-xl">
                {isRequired ? '¡Actualización Requerida!' : 'Nueva Versión Disponible'}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  v{currentVersion}
                </Badge>
                <span className="text-gray-400">→</span>
                <Badge className="bg-teal-600 text-xs">
                  v{latestVersion}
                </Badge>
              </div>
            </div>
          </div>

          <DialogDescription>
            {isRequired ? (
              'Esta actualización contiene correcciones críticas de seguridad. Es necesario actualizar para continuar usando la app.'
            ) : (
              'Hemos lanzado una nueva versión con mejoras y nuevas funcionalidades.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Alerta crítica */}
        {isRequired && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No podrás continuar usando la app sin actualizar
            </AlertDescription>
          </Alert>
        )}

        {/* Changelog */}
        {changelog.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Novedades en esta versión
              </h4>
              <ul className="space-y-2">
                {changelog.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isRequired && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Más tarde
            </Button>
          )}
          <Button
            onClick={onUpdate}
            className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Actualizar ahora
          </Button>
        </DialogFooter>

        {/* Info adicional */}
        {!isRequired && (
          <p className="text-xs text-center text-gray-500 mt-2">
            Puedes actualizar más tarde desde Configuración
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
