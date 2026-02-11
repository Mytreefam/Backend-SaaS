import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Building2,
  Store,
  MapPin,
  Plus,
  Edit,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  Tag,
  Phone,
  Mail,
} from 'lucide-react';
import { ModalCrearEmpresa } from './ModalCrearEmpresa';
import { toast } from 'sonner@2.0.3';
import { gerenteConfigApi } from '../../services/api';

interface Marca {
  id: string;
  nombre: string;
  colorIdentidad: string;
}

interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  telefono: string;
  email: string;
  marcasDisponibles: Marca[];
  activo: boolean;
}

interface Empresa {
  id: string;
  nombreFiscal: string;
  cif: string;
  nombreComercial: string;
  domicilioFiscal: string;
  marcas: Marca[]; // Lista de marcas de la empresa
  puntosVenta: PuntoVenta[]; // Puntos de venta con marcas disponibles
  cuentasBancarias: {
    numero: string;
    alias: string;
  }[];
  activo: boolean;
}

export function ConfiguracionEmpresas() {
  const [modalCrearEmpresaOpen, setModalCrearEmpresaOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  
  const load = async () => {
    setLoading(true);
    try {
      const data = await gerenteConfigApi.empresas.list();
      setEmpresas((data as any) || []);
    } catch (e) {
      console.error('Error cargando empresas config:', e);
      toast.error('Error al cargar empresas');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Configuración de Empresas
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona la estructura jerárquica: Empresa → Marcas → Puntos de Venta
              </p>
            </div>
            <Button
              onClick={() => setModalCrearEmpresaOpen(true)}
              className="bg-teal-600 hover:bg-teal-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Nueva Empresa
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Empresas */}
      <Accordion type="single" collapsible className="space-y-4">
        {loading && (
          <Card>
            <CardContent className="py-8 text-sm text-gray-600">Cargando empresas...</CardContent>
          </Card>
        )}
        {!loading && empresas.length === 0 && (
          <Card>
            <CardContent className="py-10 text-sm text-gray-600">
              No hay empresas configuradas aún. Crea una para empezar.
            </CardContent>
          </Card>
        )}
        {empresas.map((empresa) => (
          <AccordionItem 
            key={empresa.id} 
            value={empresa.id}
            className="border-none"
          >
            <Card>
              <CardHeader className="pb-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <Building2 className="w-6 h-6 text-teal-600" />
                      <div className="text-left">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {empresa.nombreFiscal}
                          </h3>
                          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                            {empresa.id}
                          </Badge>
                          {empresa.activo ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700">
                              Inactiva
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="font-medium">Comercial: {empresa.nombreComercial}</span>
                          <span>•</span>
                          <span>CIF: {empresa.cif}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            {empresa.marcas.length} marca{empresa.marcas.length !== 1 ? 's' : ''}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {empresa.puntosVenta.length} punto{empresa.puntosVenta.length !== 1 ? 's' : ''} de venta
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
              </CardHeader>

              <AccordionContent>
                <CardContent className="pt-0">
                  <Separator className="mb-6" />

                  {/* Información Fiscal */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <Building2 className="w-4 h-4 text-gray-600" />
                      Información Fiscal
                    </h4>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Domicilio Fiscal</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <p className="text-sm text-gray-900">{empresa.domicilioFiscal}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cuentas Bancarias */}
                  {empresa.cuentasBancarias.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        Cuentas Bancarias
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {empresa.cuentasBancarias.map((cuenta, index) => (
                          <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-xs text-purple-700 font-medium mb-1">{cuenta.alias}</p>
                            <p className="text-sm text-gray-900 font-mono">{cuenta.numero}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marcas de la Empresa */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <Tag className="w-4 h-4 text-gray-600" />
                      Marcas de la Empresa
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {empresa.marcas.map((marca) => (
                        <div key={marca.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                            style={{ backgroundColor: marca.colorIdentidad }}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{marca.nombre}</p>
                            <p className="text-xs text-gray-600">{marca.id}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast.info('Navega a la sección "Marcas" para editar la configuración de marcas', {
                                description: 'Haz clic en el botón "Marcas" en el menú superior',
                                duration: 4000
                              });
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Puntos de Venta */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <MapPin className="w-4 h-4 text-gray-600" />
                      Puntos de Venta
                    </h4>

                    <div className="space-y-4">
                      {empresa.puntosVenta.map((pv) => (
                        <Card key={pv.id} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Store className="w-6 h-6 text-teal-600" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                      {pv.nombre}
                                    </h5>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {pv.id}
                                    </Badge>
                                    {pv.activo ? (
                                      <Badge className="bg-green-100 text-green-700">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Activo
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                        Inactivo
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{pv.direccion}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {/* Contacto */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-2 font-medium">Contacto</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Phone className="w-3 h-3" />
                                  <span>{pv.telefono}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Mail className="w-3 h-3" />
                                  <span>{pv.email}</span>
                                </div>
                              </div>
                            </div>

                            {/* Marcas disponibles */}
                            <div>
                              <p className="text-xs text-gray-600 mb-2 font-medium">Marcas Disponibles en este Punto de Venta</p>
                              <div className="flex flex-wrap gap-2">
                                {pv.marcasDisponibles.map((marca) => (
                                  <div 
                                    key={marca.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 rounded-full"
                                    style={{ borderColor: marca.colorIdentidad }}
                                  >
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: marca.colorIdentidad }}
                                    />
                                    <span className="text-sm font-medium text-gray-900">{marca.nombre}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Botón de editar empresa */}
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Datos de la Empresa
                    </Button>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Modal Crear Empresa */}
      <ModalCrearEmpresa
        open={modalCrearEmpresaOpen}
        onOpenChange={setModalCrearEmpresaOpen}
        onCreated={() => void load()}
      />
    </div>
  );
}