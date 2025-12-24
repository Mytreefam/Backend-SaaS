/**
 * SOLICITUD DE PERMISOS
 * 
 * Modal para solicitar permisos nativos después del login
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { 
  Camera, 
  MapPin, 
  Bell, 
  Smartphone,
  CheckCircle2,
  XCircle,
  Settings,
} from 'lucide-react';
import {
  requestCameraPermission,
  requestLocationPermission,
  requestNotificationsPermission,
  openAppSettings,
  type PermissionResult,
} from '../../services/permissions.service';
import { t } from '../../config/i18n.config';
import { toast } from 'sonner@2.0.3';

interface Permission {
  id: string;
  icon: any;
  title: string;
  description: string;
  required: boolean;
  granted: boolean | null; // null = no solicitado, true = otorgado, false = denegado
}

interface PermissionsRequestProps {
  onFinish: () => void;
  onSkip?: () => void;
}

export function PermissionsRequest({ onFinish, onSkip }: PermissionsRequestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'camera',
      icon: Camera,
      title: t('permissions.camera.title'),
      description: t('permissions.camera.description'),
      required: false,
      granted: null,
    },
    {
      id: 'location',
      icon: MapPin,
      title: t('permissions.location.title'),
      description: t('permissions.location.description'),
      required: false, // CAMBIADO A OPCIONAL - No bloqueante
      granted: null,
    },
    {
      id: 'notifications',
      icon: Bell,
      title: t('permissions.notifications.title'),
      description: t('permissions.notifications.description'),
      required: false,
      granted: null,
    },
  ]);

  const currentPermission = permissions[currentStep];
  const allDone = currentStep >= permissions.length;

  const handleRequestPermission = async () => {
    let result: PermissionResult;

    switch (currentPermission.id) {
      case 'camera':
        result = await requestCameraPermission();
        break;
      case 'location':
        result = await requestLocationPermission();
        break;
      case 'notifications':
        result = await requestNotificationsPermission();
        break;
      default:
        result = { granted: false };
    }

    // Actualizar estado
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === currentPermission.id ? { ...p, granted: result.granted } : p
      )
    );

    // Si es obligatorio y se rechazó, mostrar mensaje
    if (currentPermission.required && !result.granted) {
      toast.error(
        result.message || 'Este permiso es necesario para el funcionamiento de la app'
      );
      return;
    }

    // Ir al siguiente
    if (currentStep < permissions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    if (currentPermission.required) {
      toast.error('Este permiso es obligatorio');
      return;
    }

    // Marcar como rechazado
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === currentPermission.id ? { ...p, granted: false } : p
      )
    );

    // Ir al siguiente
    if (currentStep < permissions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  if (allDone) {
    return (
      <div className="fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-[#ED1C24] to-red-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            ¡Todo listo!
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Ya puedes empezar a usar la aplicación
          </p>

          <Button
            size="lg"
            onClick={onFinish}
            className="w-full bg-gradient-to-r from-[#ED1C24] to-red-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Continuar
          </Button>
        </motion.div>
      </div>
    );
  }

  const Icon = currentPermission.icon;

  return (
    <div className="fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-500 font-medium">
              Paso {currentStep + 1} de {permissions.length}
            </div>
            <div className="flex items-center gap-2">
              {!currentPermission.required && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Omitir
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onFinish}
                className="text-gray-600 hover:text-gray-900"
              >
                Omitir todo
              </Button>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#ED1C24] to-red-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / permissions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icono */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="w-24 h-24 mb-6 bg-gradient-to-br from-[#ED1C24] to-red-600 rounded-2xl shadow-lg flex items-center justify-center"
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {currentPermission.title}
              </h2>

              {/* Descripción */}
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                {currentPermission.description}
              </p>

              {/* Badge de requerido */}
              {currentPermission.required && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm text-red-700 font-medium">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Obligatorio
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Botón de acción */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <Button
            size="lg"
            onClick={handleRequestPermission}
            className="w-full bg-gradient-to-r from-[#ED1C24] to-red-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            Permitir acceso
          </Button>

          {/* Link a configuración si fue rechazado */}
          {currentPermission.granted === false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openAppSettings}
              className="w-full mt-3 text-gray-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Abrir configuración
            </Button>
          )}

          {/* Resumen de permisos otorgados */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-3">
              {permissions.map((p, index) => (
                <div key={p.id} className="flex flex-col items-center gap-1">
                  {p.granted === true && (
                    <CheckCircle2 className="w-6 h-6 text-[#ED1C24]" />
                  )}
                  {p.granted === false && (
                    <XCircle className="w-6 h-6 text-gray-300" />
                  )}
                  {p.granted === null && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index === currentStep 
                        ? 'border-2 border-[#ED1C24] bg-red-50' 
                        : 'border-2 border-gray-300'
                    }`}>
                      {index === currentStep && (
                        <div className="w-2 h-2 bg-[#ED1C24] rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}