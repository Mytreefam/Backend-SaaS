/**
 * 🎭 BOTÓN GENERADOR DE PEDIDOS DEMO
 * 
 * Componente de desarrollo para generar pedidos de prueba
 * Solo visible en desarrollo
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Zap, 
  Trash2, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { generarPedidosDemo, resetPedidosDemo } from '../../utils/pedidos-demo';

export function BotonGenerarPedidosDemo() {
  const [generados, setGenerados] = useState(false);

  const handleGenerar = () => {
    try {
      generarPedidosDemo();
      setGenerados(true);
      toast.success('¡Pedidos demo generados!', {
        description: '6 pedidos de prueba creados exitosamente',
        duration: 4000,
      });
    } catch (error) {
      toast.error('Error al generar pedidos', {
        description: 'Revisa la consola para más detalles',
      });
      console.error('Error generando pedidos demo:', error);
    }
  };

  const handleReset = () => {
    if (!window.confirm('¿Eliminar TODOS los pedidos y regenerar? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      resetPedidosDemo();
      toast.success('Pedidos regenerados', {
        description: 'Se han eliminado todos los pedidos y creado nuevos de prueba',
        duration: 4000,
      });
    } catch (error) {
      toast.error('Error al resetear pedidos', {
        description: 'Revisa la consola para más detalles',
      });
      console.error('Error reseteando pedidos demo:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {/* Badge de desarrollo */}
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        🛠️ Modo Desarrollo
      </Badge>

      {/* Botones */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerar}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <Zap className="w-4 h-4 mr-2" />
          Generar Pedidos Demo
        </Button>

        <Button
          onClick={handleReset}
          size="sm"
          variant="destructive"
          className="shadow-lg"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Indicador */}
      {generados && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1">
          <CheckCircle className="w-4 h-4" />
          Pedidos demo activos
        </div>
      )}

      {/* Info */}
      <div className="bg-white border rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-xs">
        <div className="font-semibold mb-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Pedidos de prueba:
        </div>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>3 pagados (app/tpv)</li>
          <li>1 en preparación (Glovo)</li>
          <li>1 listo (Just Eat)</li>
          <li>1 pendiente cobro (efectivo)</li>
        </ul>
      </div>
    </div>
  );
}
