import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Info } from 'lucide-react';

export function TPVLosPecados() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 sm:p-6">
      <Card className="max-w-2xl w-full border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white shadow-lg">
        <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            </div>
          </div>
          <CardTitle 
            className="text-2xl sm:text-3xl md:text-4xl text-teal-900"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            TPV 360
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-4 sm:p-6 pt-0">
          <p className="text-sm sm:text-base md:text-lg text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            Punto de Venta Unificado - Sistema Completo de Gestión
          </p>
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs sm:text-sm text-teal-800">
              Módulo en desarrollo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
