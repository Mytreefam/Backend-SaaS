import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Store, 
  Monitor, 
  CheckCircle2, 
  ArrowRight, 
  Settings,
  User,
  Play,
  RefreshCw
} from 'lucide-react';

/**
 * Componente de demostración del flujo multimarca
 * Muestra visualmente cómo funciona el sistema de selección de marcas en terminales
 */
export function DemoFlujosMultimarca() {
  const [paso, setPaso] = useState(1);
  const [terminalSeleccionado, setTerminalSeleccionado] = useState<'mono' | 'multi' | null>(null);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>('');
  const [recordar, setRecordar] = useState(false);

  const resetDemo = () => {
    setPaso(1);
    setTerminalSeleccionado(null);
    setMarcaSeleccionada('');
    setRecordar(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-teal-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            🎯 Demo: Sistema Multimarca para Terminales TPV
          </h1>
          <p className="text-gray-600">
            Visualización interactiva del flujo de selección de marcas
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetDemo}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reiniciar Demo
          </Button>
        </div>

        {/* Indicador de Pasos */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${paso >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paso >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Configuración</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${paso >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paso >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Selección TPV</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${paso >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paso >= 3 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Selección Marca</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${paso >= 4 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              paso >= 4 ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              4
            </div>
            <span className="text-sm font-medium">TPV Activo</span>
          </div>
        </div>

        {/* Contenido por Paso */}
        {paso === 1 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                Paso 1: Configuración de Terminales (Gerente)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                El Gerente configura qué marcas puede vender cada terminal. Selecciona un tipo de terminal para continuar:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    terminalSeleccionado === 'mono' ? 'ring-2 ring-teal-500 bg-teal-50' : ''
                  }`}
                  onClick={() => setTerminalSeleccionado('mono')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Monitor className="w-8 h-8 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">Terminal Monomarca</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Terminal configurado para una sola marca
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span className="text-sm">Ejemplo: Terminal 2 - Bar</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              ✓ Modomio
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    terminalSeleccionado === 'multi' ? 'ring-2 ring-teal-500 bg-teal-50' : ''
                  }`}
                  onClick={() => setTerminalSeleccionado('multi')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Monitor className="w-8 h-8 text-teal-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-2">Terminal Multimarca</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Terminal configurado para múltiples marcas
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span className="text-sm">Ejemplo: Terminal 1 - Principal</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              ✓ Modomio
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              ✓ Blackburguer
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {terminalSeleccionado && (
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setPaso(2)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {paso === 2 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Paso 2: Trabajador Selecciona el Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                El trabajador abre el TPV y selecciona su terminal:
              </p>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Store className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium">Modal: Selección de Punto de Venta y TPV</p>
                      <p className="text-sm text-gray-600">Tiana - {terminalSeleccionado === 'mono' ? 'Terminal 2' : 'Terminal 1'}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Monitor className={`w-8 h-8 ${terminalSeleccionado === 'multi' ? 'text-teal-600' : 'text-gray-600'}`} />
                      <div className="flex-1">
                        <p className="font-medium">
                          {terminalSeleccionado === 'mono' ? 'Terminal 2 - Bar' : 'Terminal 1 - Principal'}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {terminalSeleccionado === 'mono' ? (
                            <Badge variant="secondary" className="text-xs">Modomio</Badge>
                          ) : (
                            <>
                              <Badge variant="secondary" className="text-xs">Modomio</Badge>
                              <Badge variant="secondary" className="text-xs">Blackburguer</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Disponible
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setPaso(1)}>
                  Atrás
                </Button>
                <Button 
                  onClick={() => setPaso(terminalSeleccionado === 'mono' ? 4 : 3)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {terminalSeleccionado === 'mono' ? 'Abrir Caja' : 'Continuar'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paso === 3 && terminalSeleccionado === 'multi' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-teal-600" />
                Paso 3: Selección de Marca (Solo Multimarca)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Este terminal puede operar con múltiples puntos de venta. Selecciona con cuál quieres trabajar:
              </p>

              <div className="space-y-3">
                <Card 
                  className={`cursor-pointer transition-all ${
                    marcaSeleccionada === 'Modomio' ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:border-gray-400'
                  }`}
                  onClick={() => setMarcaSeleccionada('Modomio')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                        {marcaSeleccionada === 'Modomio' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Modomio Tiana</p>
                        <p className="text-sm text-gray-600">Passeig de la Vilesa, 6, Tiana</p>
                      </div>
                      <Badge variant="outline">Modomio</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    marcaSeleccionada === 'Blackburguer' ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:border-gray-400'
                  }`}
                  onClick={() => setMarcaSeleccionada('Blackburguer')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                        {marcaSeleccionada === 'Blackburguer' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Blackburguer Tiana</p>
                        <p className="text-sm text-gray-600">Passeig de la Vilesa, 6, Tiana</p>
                      </div>
                      <Badge variant="outline">Blackburguer</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {marcaSeleccionada && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={recordar}
                        onChange={(e) => setRecordar(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-sm">Recordar mi selección para este terminal</p>
                        <p className="text-xs text-gray-600 mt-1">
                          No volveré a preguntar cuando uses este terminal. Podrás cambiar el punto de venta en cualquier momento desde el TPV.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setPaso(2)}>
                  Atrás
                </Button>
                <Button 
                  onClick={() => setPaso(4)}
                  disabled={!marcaSeleccionada}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {paso === 4 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Paso 4: TPV Activo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-lg">¡TPV Abierto Correctamente!</p>
                    <p className="text-sm text-gray-600">
                      {terminalSeleccionado === 'mono' ? 'Terminal monomarca' : 'Terminal multimarca'} activo
                    </p>
                  </div>
                </div>

                <Card className="bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          TPV 360 - Base
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-sm text-gray-600">
                            Usuario: <strong>Juan Pérez</strong> · Rol: <strong>Trabajador</strong>
                          </p>
                          {terminalSeleccionado === 'multi' && marcaSeleccionada && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-teal-50 border-teal-300 text-teal-700">
                                <Store className="w-3 h-3 mr-1" />
                                {marcaSeleccionada}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                              >
                                Cambiar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        Operativo
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {recordar && terminalSeleccionado === 'multi' && (
                  <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Preferencia guardada:</strong> La próxima vez que abras este terminal, se abrirá directamente con {marcaSeleccionada}.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Card className="border-teal-200 bg-teal-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      Características
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>✓ Caja abierta y operativa</li>
                      <li>✓ {terminalSeleccionado === 'multi' ? `Vendiendo productos de ${marcaSeleccionada}` : 'Vendiendo productos de Modomio'}</li>
                      <li>✓ Todas las ventas se registran correctamente</li>
                      {terminalSeleccionado === 'multi' && (
                        <li>✓ Puedes cambiar de marca sin cerrar caja</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-blue-600" />
                      Configuración Actual
                    </h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li><strong>Terminal:</strong> {terminalSeleccionado === 'mono' ? 'Terminal 2 - Bar' : 'Terminal 1 - Principal'}</li>
                      <li><strong>Tipo:</strong> {terminalSeleccionado === 'mono' ? 'Monomarca' : 'Multimarca'}</li>
                      <li><strong>Marca Activa:</strong> {terminalSeleccionado === 'multi' ? marcaSeleccionada : 'Modomio'}</li>
                      {recordar && terminalSeleccionado === 'multi' && (
                        <li><strong>Preferencia:</strong> Recordada ✓</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={resetDemo}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reiniciar Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
