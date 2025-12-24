import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StatsCard } from './ui/stats-card';
import { EmptyState } from './ui/empty-state';
import { User, Mail, Phone, MapPin, CreditCard, FileText, Download, ShoppingBag, Heart, Award, TrendingUp } from 'lucide-react';
import type { User as UserType } from '../App';
import { useState } from 'react';

interface PerfilClienteProps {
  user: UserType;
}

interface Factura {
  id: string;
  folio: string;
  fecha: string;
  restaurante: string;
  monto: number;
  estatus: 'pagada' | 'pendiente';
}

export function PerfilCliente({ user }: PerfilClienteProps) {
  const facturasRecientes: Factura[] = [
    {
      id: '1',
      folio: 'FAC-2025-001',
      fecha: '2025-11-10',
      restaurante: 'La Taquería del Centro',
      monto: 45.50,
      estatus: 'pagada',
    },
    {
      id: '2',
      folio: 'FAC-2025-002',
      fecha: '2025-11-08',
      restaurante: 'Burger Master',
      monto: 32.00,
      estatus: 'pagada',
    },
    {
      id: '3',
      folio: 'FAC-2025-003',
      fecha: '2025-11-05',
      restaurante: 'Sushi Express',
      monto: 68.90,
      estatus: 'pagada',
    },
  ];

  const getEstatusBadge = (estatus: Factura['estatus']) => {
    return estatus === 'pagada' ? (
      <Badge className="bg-green-100 text-green-800">Pagada</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con Nombre, Badge y Estadísticas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarFallback className="bg-teal-600 text-white text-2xl">
                MG
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>María González</h2>
                  <p className="text-gray-600 mb-3">{user.email}</p>
                  <Badge className="bg-teal-100 text-teal-800">
                    Cliente Verificado
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pedidos Totales</p>
                  <p className="text-gray-900 text-2xl">24</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Favoritos</p>
                  <p className="text-gray-900 text-2xl">8</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Puntos</p>
                  <p className="text-teal-600 text-2xl">450</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="informacion" className="w-full">
        <TabsList>
          <TabsTrigger value="informacion">
            <User className="w-4 h-4 mr-2" />
            Información Personal
          </TabsTrigger>
          <TabsTrigger value="facturacion">
            <FileText className="w-4 h-4 mr-2" />
            Facturación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="informacion" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tus datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" defaultValue="María González" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" type="tel" defaultValue="+52 555 123 4567" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección de Entrega</Label>
                  <Input id="direccion" defaultValue="Av. Insurgentes Sur 1234, Col. Del Valle" />
                </div>
              </div>

              <Button className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Administra tus formas de pago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-gray-600 text-sm">Vence 12/26</p>
                    </div>
                  </div>
                  <Badge>Principal</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  + Agregar Nuevo Método
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion" className="space-y-6 mt-6">
          {/* Stats de Facturación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Pagado</p>
                    <p className="text-gray-900">$146.40</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Facturas Este Mes</p>
                    <p className="text-gray-900">{facturasRecientes.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Método Preferido</p>
                    <p className="text-gray-900 text-sm">•••• 4242</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facturas Recientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Facturas Recientes</CardTitle>
                  <CardDescription>Tus últimas transacciones</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facturasRecientes.map((factura) => (
                  <div key={factura.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900">{factura.folio}</p>
                          {getEstatusBadge(factura.estatus)}
                        </div>
                        <p className="text-gray-700">{factura.restaurante}</p>
                        <p className="text-gray-600 text-sm">
                          {new Date(factura.fecha).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900">${factura.monto.toFixed(2)}</p>
                        <Button size="sm" variant="ghost" className="touch-target mt-2">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Datos de Facturación */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de Facturación</CardTitle>
              <CardDescription>Configura tus datos fiscales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input id="rfc" placeholder="GOMA850101ABC" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razon-social">Razón Social</Label>
                  <Input id="razon-social" placeholder="María González Martínez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uso-cfdi">Uso de CFDI</Label>
                  <Input id="uso-cfdi" placeholder="G03 - Gastos en general" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regimen">Régimen Fiscal</Label>
                  <Input id="regimen" placeholder="605 - Sueldos y salarios" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion-fiscal">Dirección Fiscal</Label>
                <Input id="direccion-fiscal" placeholder="Calle, número, colonia, CP, ciudad" />
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">
                Guardar Datos Fiscales
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}