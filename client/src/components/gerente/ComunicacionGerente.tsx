import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, Bell, BarChart, Plus, Megaphone } from 'lucide-react';
import { ChatGerente } from './ChatGerente';

export function ComunicacionGerente() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat con Clientes</TabsTrigger>
          <TabsTrigger value="promociones">Promociones</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <ChatGerente />
        </TabsContent>

        <TabsContent value="promociones" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-6 h-6 text-purple-600" />
                      Promociones y Ofertas
                    </div>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestiona promociones y ofertas especiales para tus clientes
                  </p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Promoción
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Promoción 1 */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">Pack Desayuno Can Farines</h3>
                        <Badge className="bg-green-600">Activa</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        3 cafés de origen (250g cada uno) por solo €34.90. Ahorro de €4.80
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Válido hasta: 30 Nov 2025</span>
                        <span>•</span>
                        <span>42 clientes interesados</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Promoción 2 */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">Black Friday Can Farines</h3>
                        <Badge className="bg-purple-600">Programada</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        25% de descuento en todos los cafés de 1kg. Promoción especial Black Friday
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Válido: 29 Nov - 2 Dic 2025</span>
                        <span>•</span>
                        <span>128 clientes suscritos</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Promoción 3 */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">Envío Gratis +€50</h3>
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">Finalizada</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Envío gratuito en pedidos superiores a €50
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Finalizada: 15 Nov 2025</span>
                        <span>•</span>
                        <span>87 conversiones</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled>
                      Ver Resultados
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}