import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Smartphone, Tablet, Monitor, Maximize2, X, Check } from 'lucide-react';

interface DevicePreviewProps {
  children: React.ReactNode;
  title?: string;
}

type Device = 'mobile' | 'tablet' | 'desktop' | 'all';

const deviceSizes = {
  mobile: { width: 375, height: 667, label: 'iPhone SE', icon: Smartphone },
  tablet: { width: 768, height: 1024, label: 'iPad', icon: Tablet },
  desktop: { width: 1440, height: 900, label: 'Desktop', icon: Monitor },
};

export function DevicePreview({ children, title = 'Vista de Dispositivos' }: DevicePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 overflow-auto">
        <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between max-w-[2000px] mx-auto">
            <div className="flex items-center gap-3">
              <h2 className="text-white font-medium">{title}</h2>
              <div className="flex gap-2">
                {(['mobile', 'tablet', 'desktop', 'all'] as Device[]).map((device) => {
                  const Icon = device === 'all' ? Maximize2 : deviceSizes[device as keyof typeof deviceSizes]?.icon;
                  return (
                    <Button
                      key={device}
                      onClick={() => setSelectedDevice(device)}
                      variant={selectedDevice === device ? 'default' : 'outline'}
                      size="sm"
                      className={`${
                        selectedDevice === device
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {device === 'all' ? 'Todos' : deviceSizes[device as keyof typeof deviceSizes]?.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {selectedDevice === 'all' ? (
            <div className="flex gap-6 justify-center flex-wrap">
              {/* Mobile */}
              <DeviceFrame device="mobile">
                {children}
              </DeviceFrame>

              {/* Tablet */}
              <DeviceFrame device="tablet">
                {children}
              </DeviceFrame>

              {/* Desktop */}
              <DeviceFrame device="desktop">
                {children}
              </DeviceFrame>
            </div>
          ) : (
            <div className="flex justify-center">
              <DeviceFrame device={selectedDevice} fullWidth>
                {children}
              </DeviceFrame>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600">DEV TOOL</Badge>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Button
            onClick={() => setIsFullscreen(true)}
            variant="outline"
            size="sm"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Vista Completa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mobile Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Móvil (375px)</span>
              <Badge variant="outline" className="text-xs">iPhone SE</Badge>
            </div>
            <DeviceFrame device="mobile">
              {children}
            </DeviceFrame>
          </div>

          {/* Tablet Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tablet className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Tablet (768px)</span>
              <Badge variant="outline" className="text-xs">iPad</Badge>
            </div>
            <DeviceFrame device="tablet">
              {children}
            </DeviceFrame>
          </div>

          {/* Desktop Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Desktop (1440px)</span>
              <Badge variant="outline" className="text-xs">Full HD</Badge>
            </div>
            <DeviceFrame device="desktop">
              {children}
            </DeviceFrame>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Cómo usar esta herramienta:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Haz clic en "Vista Completa" para ver en pantalla completa</li>
                <li>• Verifica que NO haya scroll horizontal en ningún dispositivo</li>
                <li>• Comprueba que todos los elementos sean tocables (mínimo 44x44px)</li>
                <li>• Asegúrate de que el contenido importante sea visible sin scroll</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DeviceFrameProps {
  device: Device;
  children: React.ReactNode;
  fullWidth?: boolean;
}

function DeviceFrame({ device, children, fullWidth }: DeviceFrameProps) {
  if (device === 'all') return null;

  const size = deviceSizes[device as keyof typeof deviceSizes];
  const scale = fullWidth ? 1 : 0.25;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-800"
        style={{
          width: fullWidth ? '100%' : size.width * scale,
          maxWidth: fullWidth ? size.width : undefined,
          height: fullWidth ? size.height : size.height * scale,
        }}
      >
        {/* Notch para móvil */}
        {device === 'mobile' && !fullWidth && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-800 rounded-b-lg z-10" />
        )}

        {/* Contenido scrollable */}
        <div
          className="w-full h-full overflow-auto"
          style={{
            transform: fullWidth ? 'none' : `scale(${scale})`,
            transformOrigin: 'top left',
            width: fullWidth ? '100%' : size.width,
            height: fullWidth ? '100%' : size.height,
          }}
        >
          {children}
        </div>

        {/* Botón home para móvil/tablet */}
        {(device === 'mobile' || device === 'tablet') && !fullWidth && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-600 rounded-full" />
        )}
      </div>

      {/* Info del dispositivo */}
      <div className="mt-2 text-center">
        <Badge variant="outline" className="text-xs">
          {size.width} × {size.height}
        </Badge>
      </div>
    </div>
  );
}
