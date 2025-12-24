import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Wrench,
  Users,
  Package,
  AlertTriangle,
  Building,
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  MessageCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Bug,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ModalConfigCategoriaChat } from './ModalConfigCategoriaChat';
import { ModalEditarCategoriaCliente } from './ModalEditarCategoriaCliente';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { useConfiguracionChats, CategoriaCliente, CategoriaTrabajador } from '../../contexts/ConfiguracionChatsContext';

// ============= COMPONENTE PRINCIPAL =============

export function ConfiguracionChats() {
  // Context
  const {
    categoriasClientes,
    toggleCategoriaCliente,
    updateCategoriaCliente,
    addCategoriaCliente,
    deleteCategoriaCliente,
    categoriasTrabajadores,
    updateCategoriaTrabajador,
    addCategoriaTrabajador,
    deleteCategoriaTrabajador,
    chatsPedidosActivo,
    setChatsPedidosActivo,
  } = useConfiguracionChats();
  
  const [busqueda, setBusqueda] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaTrabajador | null>(null);
  const [categoriaClienteSeleccionada, setCategoriaClienteSeleccionada] = useState<CategoriaCliente | null>(null);
  
  // Estados para los collapsibles
  const [categoriasTrabajadoresOpen, setCategoriasTrabajadoresOpen] = useState(true);
  const [categoriasClientesOpen, setCategoriasClientesOpen] = useState(true);

  // ============= FILTROS =============

  const categoriasFiltradas = categoriasTrabajadores.filter(cat =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ============= FUNCIONES TRABAJADORES =============

  const handleNuevaCategoria = () => {
    setCategoriaSeleccionada(null);
    setModalOpen(true);
  };

  const handleEditarCategoria = (categoria: CategoriaTrabajador) => {
    setCategoriaSeleccionada(categoria);
    setModalOpen(true);
  };

  const handleEliminarCategoria = (accionId: string) => {
    const categoria = categoriasTrabajadores.find(c => c.accionId === accionId);
    
    if (categoria?.esProtegida) {
      toast.error('No se puede eliminar una categoría protegida del sistema');
      return;
    }

    // TODO: Conectar con API DELETE /api/chat-acciones/{accionId}
    console.log('🗑️ ELIMINAR CATEGORÍA:', {
      accionId,
      empresaId: 'EMP-HOSTELERIA'
    });

    deleteCategoriaTrabajador(accionId);
    toast.success('Categoría eliminada correctamente');
  };

  const handleToggleActivo = (accionId: string) => {
    // TODO: Conectar con API PATCH /api/chat-acciones/{accionId}/toggle
    console.log('🔄 TOGGLE ACTIVO:', accionId);

    const categoria = categoriasTrabajadores.find(c => c.accionId === accionId);
    if (categoria) {
      updateCategoriaTrabajador(accionId, { activo: !categoria.activo });
    }

    toast.success('Estado actualizado');
  };

  const handleGuardarCategoria = (categoria: CategoriaTrabajador) => {
    if (categoriaSeleccionada) {
      // EDITAR
      console.log('✏️ EDITAR CATEGORÍA:', categoria);
      updateCategoriaTrabajador(categoria.accionId, categoria);
      toast.success('Categoría actualizada correctamente');
    } else {
      // CREAR NUEVA
      const nuevaCategoria: CategoriaTrabajador = {
        ...categoria,
        accionId: `CUSTOM-${Date.now()}`,
        empresaId: 'EMP-HOSTELERIA',
        orden: categoriasTrabajadores.length + 1,
        esProtegida: false,
        creadoPor: 'GERENTE-001',
        fechaCreacion: new Date().toISOString()
      };
      
      console.log('➕ CREAR CATEGORÍA:', nuevaCategoria);
      addCategoriaTrabajador(nuevaCategoria);
      toast.success('Nueva categoría creada correctamente');
    }
    
    setModalOpen(false);
    setCategoriaSeleccionada(null);
  };

  // ============= FUNCIONES CLIENTES =============

  const handleToggleCategoriaClienteLocal = (id: string, checked: boolean) => {
    toggleCategoriaCliente(id, checked);
    const categoria = categoriasClientes.find(c => c.id === id);
    
    // Si es la categoría de Pedidos, actualizar también el estado global
    if (id === 'pedido') {
      setChatsPedidosActivo(checked);
    }
    
    toast.success(
      checked 
        ? `Categoría \"${categoria?.nombre}\" activada` 
        : `Categoría \"${categoria?.nombre}\" desactivada`
    );
  };

  const handleNuevaCategoriaCliente = () => {
    setCategoriaClienteSeleccionada(null);
    setModalClienteOpen(true);
  };

  const handleEditarCategoriaCliente = (categoria: CategoriaCliente) => {
    setCategoriaClienteSeleccionada(categoria);
    setModalClienteOpen(true);
  };

  const handleEliminarCategoriaCliente = (id: string) => {
    // No permitir eliminar la categoría de Pedidos
    if (id === 'pedido') {
      toast.error('No se puede eliminar la categoría de Pedidos');
      return;
    }
    
    deleteCategoriaCliente(id);
    toast.success('Categoría eliminada correctamente');
  };

  const handleGuardarCategoriaCliente = (categoria: CategoriaCliente) => {
    if (categoriaClienteSeleccionada) {
      // EDITAR
      updateCategoriaCliente(categoria.id, categoria);
      toast.success('Categoría actualizada correctamente');
    } else {
      // CREAR NUEVA
      const nuevaCategoria: CategoriaCliente = {
        ...categoria,
        id: `custom-${Date.now()}`,
        orden: categoriasClientes.length + 1,
      };
      
      addCategoriaCliente(nuevaCategoria);
      toast.success('Nueva categoría creada correctamente');
    }
    
    setModalClienteOpen(false);
    setCategoriaClienteSeleccionada(null);
  };

  // ============= ICONOS =============

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Wrench,
      Users,
      Package,
      AlertTriangle,
      Building,
      FileText,
      Mail,
      MessageCircle,
      Settings,
      Info,
      AlertCircle,
      Bug,
      HelpCircle
    };
    
    const Icon = icons[iconName] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  const getDestinoLabel = (tipo: string, valor: string) => {
    switch (tipo) {
      case 'EQUIPO':
        return (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">Equipo interno</span>
          </div>
        );
      case 'OTRA_TIENDA':
        return (
          <div className="flex items-center gap-1">
            <Building className="w-3 h-3" />
            <span className="text-xs">Otra tienda</span>
          </div>
        );
      case 'EMAIL':
        return (
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span className="text-xs">{valor}</span>
          </div>
        );
      case 'WHATSAPP':
        return (
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span className="text-xs">{valor}</span>
          </div>
        );
      default:
        return <span className="text-xs">-</span>;
    }
  };

  // ============= RENDER =============

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          📦 Configuración de Chats y Comunicación
        </h2>
        <p className="text-gray-600">
          Gestiona las categorías de consulta y sus destinos para el sistema de chat interno
        </p>
      </div>

      {/* Sección Categorías de Chats de Clientes */}
      <Card>
        <Collapsible
          open={categoriasClientesOpen}
          onOpenChange={setCategoriasClientesOpen}
        >
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Categorías de Chats de Clientes
                  </CardTitle>
                  {categoriasClientesOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </CollapsibleTrigger>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNuevaCategoriaCliente();
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir nueva categoría
              </Button>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gestiona qué tipos de consultas pueden enviar los clientes desde su apartado de Chat y Soporte. 
                {categoriasClientes.find(c => c.id === 'pedido')?.activo 
                  ? ' La categoría "Pedidos" está activa, los clientes pueden abrir chats por pedidos.'
                  : ' La categoría "Pedidos" está inactiva, los clientes NO pueden abrir chats por pedidos.'}
              </p>

              {/* Tabla de categorías */}
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="font-medium">Nombre de la consulta</TableHead>
                      <TableHead className="font-medium">Estado</TableHead>
                      <TableHead className="font-medium">Destino actual</TableHead>
                      <TableHead className="font-medium">Adjuntos</TableHead>
                      <TableHead className="font-medium">Tipo</TableHead>
                      <TableHead className="font-medium text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriasClientes.length > 0 ? (
                      categoriasClientes.map((categoria) => {
                        const esCategoriaProtegida = categoria.id === 'pedido';
                        return (
                          <TableRow key={categoria.id} className="hover:bg-gray-50">
                            {/* Icono */}
                            <TableCell>
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                                {getIconComponent(categoria.icono)}
                              </div>
                            </TableCell>

                            {/* Nombre */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{categoria.nombre}</span>
                                {esCategoriaProtegida && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                    Sistema
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            {/* Estado */}
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleCategoriaClienteLocal(categoria.id, !categoria.activo)}
                                className="h-8"
                              >
                                {categoria.activo ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Activo
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                    Inactivo
                                  </Badge>
                                )}
                              </Button>
                            </TableCell>

                            {/* Destino */}
                            <TableCell>
                              <div className="text-sm text-gray-700">
                                {getDestinoLabel(categoria.destinoTipo || 'EQUIPO', categoria.destinoValor || '-')}
                              </div>
                            </TableCell>

                            {/* Permite Adjuntos */}
                            <TableCell>
                              {categoria.permiteAdjuntos ? (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                  Sí
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                                  No
                                </Badge>
                              )}
                            </TableCell>

                            {/* Tipo */}
                            <TableCell>
                              <span className="text-xs text-gray-500">
                                {esCategoriaProtegida ? 'Sistema' : 'Personalizada'}
                              </span>
                            </TableCell>

                            {/* Acciones */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditarCategoriaCliente(categoria)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>
                                {!esCategoriaProtegida && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEliminarCategoriaCliente(categoria.id)}
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                          No hay categorías configuradas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Info */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Categoría Sistema:</strong> La categoría "Pedidos" no se puede eliminar. 
                  Las categorías personalizadas pueden eliminarse en cualquier momento.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Card Principal - Categorías para Trabajadores */}
      <Card>
        <Collapsible
          open={categoriasTrabajadoresOpen}
          onOpenChange={setCategoriasTrabajadoresOpen}
        >
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Categorías para Trabajadores
                  </CardTitle>
                  {categoriasTrabajadoresOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </CollapsibleTrigger>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNuevaCategoria();
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir nueva categoría
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabla de categorías */}
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-medium">Nombre de la consulta</TableHead>
                  <TableHead className="font-medium">Estado</TableHead>
                  <TableHead className="font-medium">Destino actual</TableHead>
                  <TableHead className="font-medium">Adjuntos</TableHead>
                  <TableHead className="font-medium">Tipo</TableHead>
                  <TableHead className="font-medium text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriasFiltradas.length > 0 ? (
                  categoriasFiltradas.map((categoria) => (
                    <TableRow key={categoria.accionId} className="hover:bg-gray-50">
                      {/* Icono */}
                      <TableCell>
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                          {getIconComponent(categoria.icono)}
                        </div>
                      </TableCell>

                      {/* Nombre */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{categoria.nombre}</span>
                          {categoria.esProtegida && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                              Protegida
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActivo(categoria.accionId)}
                          className="h-8"
                        >
                          {categoria.activo ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Activo
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                              Inactivo
                            </Badge>
                          )}
                        </Button>
                      </TableCell>

                      {/* Destino */}
                      <TableCell>
                        <div className="text-sm text-gray-700">
                          {getDestinoLabel(categoria.destinoTipo, categoria.destinoValor)}
                        </div>
                      </TableCell>

                      {/* Permite Adjuntos */}
                      <TableCell>
                        {categoria.permiteAdjuntos ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            Sí
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                            No
                          </Badge>
                        )}
                      </TableCell>

                      {/* Tipo */}
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {categoria.esProtegida ? 'Sistema' : 'Personalizada'}
                        </span>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarCategoria(categoria)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          {!categoria.esProtegida && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarCategoria(categoria.accionId)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      No se encontraron categorías
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Categorías protegidas:</strong> No se pueden eliminar, pero sí renombrar y configurar.
              Las categorías personalizadas pueden eliminarse en cualquier momento.
            </p>
          </div>
        </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Modal Editar/Crear Categoría Trabajador */}
      <ModalConfigCategoriaChat
        open={modalOpen}
        onOpenChange={setModalOpen}
        categoria={categoriaSeleccionada}
        onGuardar={handleGuardarCategoria}
      />

      {/* Modal Editar/Crear Categoría Cliente */}
      <ModalEditarCategoriaCliente
        open={modalClienteOpen}
        onOpenChange={setModalClienteOpen}
        categoria={categoriaClienteSeleccionada}
        onGuardar={handleGuardarCategoriaCliente}
      />
    </div>
  );
}
