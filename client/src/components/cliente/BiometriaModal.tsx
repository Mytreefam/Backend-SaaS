import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Lock, Fingerprint } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BiometriaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAutenticado: () => void;
}

export function BiometriaModal({ isOpen, onOpenChange, onAutenticado }: BiometriaModalProps) {
  const [pin, setPin] = useState('');
  const [usandoBiometria, setUsandoBiometria] = useState(false);

  const handlePinSubmit = () => {
    // Simulación - en producción verificaría contra el PIN real
    if (pin === '1234' || pin.length === 4) {
      toast.success('Autenticación correcta');
      onAutenticado();
      setPin('');
      onOpenChange(false);
    } else {
      toast.error('PIN incorrecto');
      setPin('');
    }
  };

  const handleBiometria = () => {
    setUsandoBiometria(true);
    // Simulación de biometría
    setTimeout(() => {
      toast.success('Huella reconocida');
      onAutenticado();
      setUsandoBiometria(false);
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Documentación protegida
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Verifica tu identidad para acceder a los documentos del vehículo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Botón Biometría */}
          <Button
            onClick={handleBiometria}
            disabled={usandoBiometria}
            className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Fingerprint className="w-8 h-8 mr-3" />
            <span className="text-lg">
              {usandoBiometria ? 'Verificando...' : 'Usar huella digital'}
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">O usa tu PIN</span>
            </div>
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <Label htmlFor="pin">PIN de seguridad (4 dígitos)</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pin.length === 4) {
                  handlePinSubmit();
                }
              }}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-gray-500 text-center">
              Introduce tu PIN de 4 dígitos (demo: 1234)
            </p>
          </div>

          <Button
            onClick={handlePinSubmit}
            disabled={pin.length !== 4}
            variant="outline"
            className="w-full"
          >
            Desbloquear con PIN
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
