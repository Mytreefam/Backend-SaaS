/**
 * 🔧 DEBUG MARCAS - COMPONENTE DE UTILIDAD
 * =========================================
 * 
 * Componente para verificar el estado del Sistema de Marcas MADRE
 * Solo para desarrollo/debugging
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RefreshCw, Database, Check, X, Info } from 'lucide-react';
import { obtenerMarcas, inicializarMarcasDefault } from '../../utils/marcasHelper';
import { MARCAS, recargarMarcas } from '../../constants/empresaConfig';
import { toast } from 'sonner@2.0.3';

export function DebugMarcas() {
  const [marcasLocalStorage, setMarcasLocalStorage] = useState<any[]>([]);
  const [marcasConfig, setMarcasConfig] = useState<any>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const cargarDatos = () => {
    // Leer de localStorage
    const marcasLS = obtenerMarcas();
    setMarcasLocalStorage(marcasLS);

    // Leer de empresaConfig
    setMarcasConfig(MARCAS);
    
    setLastUpdate(new Date());
  };

  useEffect(() => {
    cargarDatos();

    // Escuchar actualizaciones
    const handleUpdate = () => {
      console.log('🔄 Evento marcas-sistema-updated recibido');
      setTimeout(cargarDatos, 100); // Pequeño delay para asegurar sincronización
    };

    window.addEventListener('marcas-sistema-updated', handleUpdate);
    return () => window.removeEventListener('marcas-sistema-updated', handleUpdate);
  }, []);

  const handleRecargar = () => {
    recargarMarcas();
    cargarDatos();
    toast.success('Marcas recargadas desde localStorage');
  };

  const handleReinicializar = () => {
    if (confirm('⚠️ Esto eliminará todas las marcas y cargará las por defecto. ¿Continuar?')) {
      localStorage.removeItem('udar_marcas_sistema');
      inicializarMarcasDefault();
      recargarMarcas();
      cargarDatos();
      toast.success('Marcas reinicializadas con valores por defecto');
    }
  };

  const handleLimpiar = () => {
    if (confirm('⚠️ Esto eliminará TODAS las marcas del sistema. ¿Estás seguro?')) {
      localStorage.removeItem('udar_marcas_sistema');
      toast.warning('LocalStorage limpiado. Recarga la página para reiniciar.');
    }
  };

  const sincronizado = marcasLocalStorage.length === Object.keys(marcasConfig).length;

  return (
    <div className="space-y-4 p-4 bg-gray-900 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">🔧 Debug: Sistema de Marcas MADRE</h2>
          <p className="text-sm text-gray-400">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRecargar}
            size="sm"
            variant="outline"
            className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <Button
            onClick={handleReinicializar}
            size="sm"
            variant="outline"
            className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
          >
            Reinicializar
          </Button>
          <Button
            onClick={handleLimpiar}
            size="sm"
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            Limpiar Todo
          </Button>
        </div>
      </div>

      {/* Estado de Sincronización */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {sincronizado ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <X className="w-5 h-5 text-red-500" />
            )}
            Estado de Sincronización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">
                {marcasLocalStorage.length}
              </div>
              <div className="text-sm text-gray-400">localStorage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {Object.keys(marcasConfig).length}
              </div>
              <div className="text-sm text-gray-400">empresaConfig</div>
            </div>
            <div className="text-center">
              <Badge
                variant={sincronizado ? 'default' : 'destructive'}
                className={sincronizado ? 'bg-green-600' : 'bg-red-600'}
              >
                {sincronizado ? 'Sincronizado ✓' : 'Desincronizado ✗'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marcas en localStorage */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400" />
            Marcas en localStorage: 'udar_marcas_sistema'
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marcasLocalStorage.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay marcas en localStorage</p>
              <Button
                onClick={handleReinicializar}
                size="sm"
                className="mt-4 bg-teal-600 hover:bg-teal-700"
              >
                Inicializar Marcas
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {marcasLocalStorage.map((marca, index) => (
                <div
                  key={marca.id || index}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    {(marca.logo || marca.logoUrl) && (
                      <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={marca.logo || marca.logoUrl}
                          alt={marca.nombre}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{marca.nombre}</h4>
                        <Badge
                          variant={marca.activo !== false ? 'default' : 'secondary'}
                          className={marca.activo !== false ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {marca.activo !== false ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">ID:</span>{' '}
                          <span className="text-gray-200">{marca.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Código:</span>{' '}
                          <span className="text-gray-200">{marca.codigo}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Color:</span>{' '}
                          <span className="text-gray-200 flex items-center gap-2">
                            {marca.color || marca.colorIdentidad}
                            <div
                              className="w-4 h-4 rounded border border-white"
                              style={{ backgroundColor: marca.color || marca.colorIdentidad }}
                            />
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Empresa:</span>{' '}
                          <span className="text-gray-200">{marca.empresaId || 'N/A'}</span>
                        </div>
                      </div>

                      {marca.fechaCreacion && (
                        <div className="text-xs text-gray-500">
                          Creado: {new Date(marca.fechaCreacion).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marcas en empresaConfig */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Marcas en empresaConfig.ts (MARCAS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(marcasConfig).map(([key, marca]: [string, any]) => (
              <div
                key={key}
                className="bg-gray-900 border border-gray-700 rounded p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {(marca.logo || marca.logoUrl) && (
                    <div className="w-10 h-10 bg-black rounded overflow-hidden">
                      <img
                        src={marca.logo || marca.logoUrl}
                        alt={marca.nombre}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white">{marca.nombre}</div>
                    <div className="text-xs text-gray-400">
                      {key} • {marca.codigo}
                    </div>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded border-2 border-white"
                  style={{ backgroundColor: marca.color || marca.colorIdentidad }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información */}
      <Card className="bg-blue-900/20 border-blue-800/50">
        <CardContent className="pt-6">
          <div className="flex gap-3 text-sm text-blue-200">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">ℹ️ Información del Sistema:</p>
              <ul className="space-y-1 text-blue-300">
                <li>• Las marcas se crean desde: <strong>Gerente → Empresas → Crear/Editar Empresa</strong></li>
                <li>• Se guardan en: <code>localStorage['udar_marcas_sistema']</code></li>
                <li>• Se sincronizan automáticamente con <code>empresaConfig.ts</code></li>
                <li>• Evento de actualización: <code>'marcas-sistema-updated'</code></li>
                <li>• Ver documentación completa en: <code>/SISTEMA_MARCAS_MADRE.md</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
