import React, { useState } from 'react';
import { Button } from '../ui/button';
import { FileText, Shield, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/dialog';
import { PoliticaPrivacidad } from './PoliticaPrivacidad';
import { TerminosCondiciones } from './TerminosCondiciones';
import { useAnalytics } from '../../services/analytics.service';

/**
 * Componente con enlaces rápidos a documentos legales
 * Para usar en footers, configuración, etc.
 */
export const LegalLinks: React.FC<{ variant?: 'links' | 'buttons' }> = ({ 
  variant = 'links' 
}) => {
  const [showPrivacidad, setShowPrivacidad] = useState(false);
  const [showTerminos, setShowTerminos] = useState(false);
  const analyticsHooks = useAnalytics();

  const handleOpenPrivacidad = () => {
    analyticsHooks.logButtonClick('ver_privacidad', 'legal_links');
    setShowPrivacidad(true);
  };

  const handleOpenTerminos = () => {
    analyticsHooks.logButtonClick('ver_terminos', 'legal_links');
    setShowTerminos(true);
  };

  if (variant === 'buttons') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={handleOpenPrivacidad}
          >
            <Shield className="w-5 h-5 mr-3 text-teal-600" />
            <div className="text-left">
              <p className="font-medium">Política de Privacidad</p>
              <p className="text-xs text-gray-500">Ver cómo protegemos tus datos</p>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4"
            onClick={handleOpenTerminos}
          >
            <FileText className="w-5 h-5 mr-3 text-teal-600" />
            <div className="text-left">
              <p className="font-medium">Términos y Condiciones</p>
              <p className="text-xs text-gray-500">Condiciones de uso del servicio</p>
            </div>
            <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
          </Button>
        </div>

        {/* Modales */}
        <Dialog open={showPrivacidad} onOpenChange={setShowPrivacidad}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <PoliticaPrivacidad />
          </DialogContent>
        </Dialog>

        <Dialog open={showTerminos} onOpenChange={setShowTerminos}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <TerminosCondiciones />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Variant: links (default)
  return (
    <>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <button
          onClick={handleOpenPrivacidad}
          className="hover:text-teal-600 transition-colors flex items-center gap-1"
        >
          <Shield className="w-4 h-4" />
          Política de Privacidad
        </button>
        
        <span className="text-gray-300">•</span>
        
        <button
          onClick={handleOpenTerminos}
          className="hover:text-teal-600 transition-colors flex items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          Términos y Condiciones
        </button>
      </div>

      {/* Modales */}
      <Dialog open={showPrivacidad} onOpenChange={setShowPrivacidad}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <PoliticaPrivacidad />
        </DialogContent>
      </Dialog>

      <Dialog open={showTerminos} onOpenChange={setShowTerminos}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <TerminosCondiciones />
        </DialogContent>
      </Dialog>
    </>
  );
};
