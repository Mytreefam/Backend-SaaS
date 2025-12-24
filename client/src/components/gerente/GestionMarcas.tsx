/**
 * ⚠️ DEPRECADO - NO USAR
 * =======================
 * 
 * Este componente ha sido reemplazado por el Sistema de Marcas MADRE.
 * 
 * AHORA las marcas se gestionan desde:
 * Gerente → Empresas → Crear/Editar Empresa
 * 
 * Las marcas se guardan en localStorage: 'udar_marcas_sistema'
 * y se sincronizan automáticamente con todo el sistema.
 * 
 * Ver documentación: /SISTEMA_MARCAS_MADRE.md
 * 
 * @deprecated Usar ModalCrearEmpresa.tsx para gestionar marcas
 * @see /SISTEMA_MARCAS_MADRE.md
 */

/**
 * GESTIÓN DE MARCAS - PANEL GERENTE
 * 
 * Permite al gerente gestionar las marcas de la empresa
 * Incluye la posibilidad de subir logos
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { MARCAS_ARRAY, MARCAS, type Marca } from '../../constants/empresaConfig';
import { Upload, Edit, Plus, Save, X, Store, Image as ImageIcon, Trash2, RotateCcw, Eye, Smartphone, ShoppingCart, Receipt, MonitorSmartphone, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import logoModomio from 'figma:asset/7a4d64c95291a62dd24c849142ae4540d5e2f45f.png';
import logoBlackburger from 'figma:asset/60b944da0efe66e24a868c7d759146e988e8fa41.png';

const LOGOS_MAP: Record<string, string> = {
  'MRC-001': logoModomio,
  'MRC-002': logoBlackburger,
};

// Key para localStorage
const STORAGE_KEY = 'udar_marcas_personalizadas';

interface MarcaPersonalizada extends Marca {
  logoPersonalizado?: string;
}

export function GestionMarcas() {
  const [marcas, setMarcas] = useState<MarcaPersonalizada[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<MarcaPersonalizada | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMarca, setEditedMarca] = useState<MarcaPersonalizada | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  // Cargar marcas desde localStorage al iniciar
  useEffect(() => {
    const marcasGuardadas = localStorage.getItem(STORAGE_KEY);
    if (marcasGuardadas) {
      try {
        setMarcas(JSON.parse(marcasGuardadas));
      } catch (error) {
        console.error('Error al cargar marcas:', error);
        setMarcas(MARCAS_ARRAY);
      }
    } else {
      setMarcas(MARCAS_ARRAY);
    }
  }, []);

  const handleEdit = (marca: MarcaPersonalizada) => {
    setSelectedMarca(marca);
    setEditedMarca({ ...marca });
    setUploadedLogo(null);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedMarca) return;

    // Crear la marca actualizada
    const marcaActualizada: MarcaPersonalizada = {
      ...editedMarca,
      logoPersonalizado: uploadedLogo || editedMarca.logoPersonalizado
    };

    // Actualizar el array de marcas
    const marcasActualizadas = marcas.map(m => 
      m.id === marcaActualizada.id ? marcaActualizada : m
    );

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marcasActualizadas));
    setMarcas(marcasActualizadas);

    toast.success(`Marca "${editedMarca.nombre}" actualizada correctamente`, {
      description: 'Los cambios se han guardado exitosamente'
    });
    
    if (uploadedLogo || editedMarca.logoPersonalizado) {
      toast.info('Logo actualizado. Visible en el selector de marcas del cliente');
    }

    // Cerrar el modal
    setIsEditing(false);
    setSelectedMarca(null);
    setEditedMarca(null);
    setUploadedLogo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    // Leer el archivo y crear una URL temporal
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedLogo(result);
      toast.success('Logo cargado. Haz clic en "Guardar" para aplicar los cambios');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverLogoPersonalizado = () => {
    if (!editedMarca) return;

    // Eliminar el logo personalizado de la marca editada
    const marcaActualizada: MarcaPersonalizada = {
      ...editedMarca,
      logoPersonalizado: undefined
    };

    // Actualizar el array de marcas
    const marcasActualizadas = marcas.map(m => 
      m.id === marcaActualizada.id ? marcaActualizada : m
    );

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marcasActualizadas));
    setMarcas(marcasActualizadas);

    // Actualizar estado local
    setEditedMarca(marcaActualizada);
    setUploadedLogo(null);

    toast.success('Logo personalizado eliminado', {
      description: 'Se ha restaurado el logo original de la marca'
    });
  };

  const getLogoUrl = (marca: MarcaPersonalizada) => {
    // Prioridad: logo personalizado > logo por defecto del mapa
    return marca.logoPersonalizado || LOGOS_MAP[marca.id];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Gestión de Marcas</h2>
          <p className="text-gray-400">
            Administra las marcas de tu empresa y personaliza sus logos
          </p>
        </div>
      </div>

      {/* Grid de Marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marcas.map((marca) => {
          const logoUrl = getLogoUrl(marca);
          
          return (
            <motion.div
              key={marca.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 p-6 hover:border-[#4DB8BA]/50 transition-all">
                {/* Logo */}
                <div className="flex justify-center items-center h-48 mb-4 bg-black rounded-lg overflow-hidden relative group">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={marca.nombre}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-7xl">{marca.icono}</div>
                  )}
                  {/* Indicador de logo personalizado */}
                  {marca.logoPersonalizado && (
                    <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Personalizado
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl">{marca.nombre}</h3>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white" 
                      style={{ backgroundColor: marca.colorIdentidad }}
                    />
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Código: <span className="text-gray-300">{marca.codigo}</span></p>
                    <p>Color: <span className="text-gray-300">{marca.colorIdentidad}</span></p>
                  </div>

                  {/* Botón Editar */}
                  <Button
                    onClick={() => handleEdit(marca)}
                    className="w-full bg-[#4DB8BA] hover:bg-[#3da5a7]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Marca
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de Edición - ÚNICO DIALOG */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsEditing(false);
          setSelectedMarca(null);
          setEditedMarca(null);
          setUploadedLogo(null);
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-700 sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#4DB8BA]" />
              Editar Marca: {editedMarca?.nombre}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Actualiza la información, el logo y visualiza cómo se verá en la app
            </DialogDescription>
          </DialogHeader>

          {editedMarca && (
            <Tabs defaultValue="edicion" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="edicion" className="data-[state=active]:bg-[#4DB8BA]">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Marca
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-[#4DB8BA]">
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa en Contexto
                </TabsTrigger>
              </TabsList>

              {/* TAB: EDICIÓN */}
              <TabsContent value="edicion" className="space-y-6 mt-6">
                {/* Vista previa del logo */}
                <div className="space-y-2">
                  <Label>Logo de la marca</Label>
                  <div className="flex justify-center items-center h-48 bg-black rounded-lg overflow-hidden border-2 border-gray-700">
                    {uploadedLogo ? (
                      <img
                        src={uploadedLogo}
                        alt="Logo subido"
                        className="w-full h-full object-contain p-4"
                      />
                    ) : getLogoUrl(editedMarca) ? (
                      <img
                        src={getLogoUrl(editedMarca)}
                        alt={editedMarca.nombre}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="text-6xl">{editedMarca.icono}</div>
                    )}
                  </div>
                </div>

                {/* Input para subir logo */}
                <div className="space-y-2">
                  <Label htmlFor="logo-upload" className="text-gray-300">
                    Subir nuevo logo
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="flex-1 bg-gray-800 border-gray-700 text-gray-300"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos: PNG, JPG, SVG (máx. 2MB). Recomendado: fondo transparente, 500x500px
                  </p>
                </div>

                {/* Botón para remover logo personalizado - Solo si existe */}
                {(editedMarca.logoPersonalizado || uploadedLogo) && (
                  <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <RotateCcw className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm text-orange-200 font-medium">Logo personalizado activo</p>
                          <p className="text-xs text-orange-300">
                            Puedes restaurar el logo original de la marca si lo deseas
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-orange-700 hover:bg-orange-900/30 text-orange-200"
                          onClick={handleRemoverLogoPersonalizado}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Restaurar Logo Original
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la marca</Label>
                  <Input
                    id="nombre"
                    value={editedMarca.nombre}
                    onChange={(e) => setEditedMarca({ ...editedMarca, nombre: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Color de identidad</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="color"
                      type="color"
                      value={editedMarca.colorIdentidad}
                      onChange={(e) => setEditedMarca({ ...editedMarca, colorIdentidad: e.target.value })}
                      className="w-20 h-12 bg-gray-800 border-gray-700 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={editedMarca.colorIdentidad}
                      onChange={(e) => setEditedMarca({ ...editedMarca, colorIdentidad: e.target.value })}
                      className="flex-1 bg-gray-800 border-gray-700"
                      placeholder="#4DB8BA"
                    />
                  </div>
                </div>

                {/* Icono Emoji */}
                <div className="space-y-2">
                  <Label htmlFor="icono">Icono (emoji)</Label>
                  <Input
                    id="icono"
                    value={editedMarca.icono}
                    onChange={(e) => setEditedMarca({ ...editedMarca, icono: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                    placeholder="🍔"
                    maxLength={2}
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedMarca(null);
                      setEditedMarca(null);
                      setUploadedLogo(null);
                    }}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#4DB8BA] hover:bg-[#3da5a7]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </TabsContent>

              {/* TAB: VISTA PREVIA */}
              <TabsContent value="preview" className="space-y-6 mt-6">
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Eye className="w-4 h-4" />
                    <p>Vista previa de cómo se verá tu marca en diferentes partes de la aplicación</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Preview 1: Selector del Cliente */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MonitorSmartphone className="w-4 h-4 text-[#4DB8BA]" />
                      <h3 className="font-medium text-gray-300">Selector del Cliente</h3>
                    </div>
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <motion.div
                        className="border-2 border-[#4DB8BA] bg-gradient-to-br from-[#4DB8BA]/10 to-[#4DB8BA]/5 rounded-xl p-4 relative"
                        whileHover={{ scale: 1.02 }}
                      >
                        {/* Checkmark */}
                        <div className="absolute top-2 right-2 bg-[#4DB8BA] rounded-full p-1.5 shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>

                        {/* Badge Premium */}
                        {(uploadedLogo || editedMarca.logoPersonalizado) && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>Premium</span>
                          </div>
                        )}

                        {/* Logo */}
                        <div className="flex justify-center items-center h-32 bg-black rounded-lg overflow-hidden mb-3">
                          {(uploadedLogo || getLogoUrl(editedMarca)) ? (
                            <img
                              src={uploadedLogo || getLogoUrl(editedMarca)}
                              alt={editedMarca.nombre}
                              className="w-full h-full object-contain p-3"
                            />
                          ) : (
                            <div className="text-5xl">{editedMarca.icono}</div>
                          )}
                        </div>

                        {/* Nombre */}
                        <div className="text-center space-y-1">
                          <h3 className="font-medium text-gray-200">{editedMarca.nombre}</h3>
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <div 
                              className="w-2 h-2 rounded-full border border-gray-400" 
                              style={{ backgroundColor: editedMarca.colorIdentidad }}
                            />
                            <span>Disponible en todos los PDVs</span>
                          </div>
                        </div>
                      </motion.div>
                    </Card>
                  </div>

                  {/* Preview 2: Header Móvil */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#4DB8BA]" />
                      <h3 className="font-medium text-gray-300">Header App Móvil</h3>
                    </div>
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <div className="bg-gradient-to-r from-[#4DB8BA] to-[#3da5a7] p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                              {(uploadedLogo || getLogoUrl(editedMarca)) ? (
                                <img
                                  src={uploadedLogo || getLogoUrl(editedMarca)}
                                  alt={editedMarca.nombre}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <div className="text-2xl">{editedMarca.icono}</div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{editedMarca.nombre}</p>
                              <p className="text-xs text-white/70">Cliente - Vista Principal</p>
                            </div>
                          </div>
                          <Badge 
                            className="text-white border-white/30" 
                            style={{ backgroundColor: editedMarca.colorIdentidad }}
                          >
                            {editedMarca.icono}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Preview 3: Tarjeta de Producto */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#4DB8BA]" />
                      <h3 className="font-medium text-gray-300">Tarjeta de Producto</h3>
                    </div>
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-200">Pizza Margarita</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  borderColor: editedMarca.colorIdentidad,
                                  color: editedMarca.colorIdentidad
                                }}
                              >
                                {editedMarca.nombre}
                              </Badge>
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-black rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                            {(uploadedLogo || getLogoUrl(editedMarca)) ? (
                              <img
                                src={uploadedLogo || getLogoUrl(editedMarca)}
                                alt={editedMarca.nombre}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="text-lg">{editedMarca.icono}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[#4DB8BA]">€12.50</span>
                          <Button 
                            size="sm" 
                            className="text-white"
                            style={{ backgroundColor: editedMarca.colorIdentidad }}
                          >
                            Añadir
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Preview 4: Ticket/Recibo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#4DB8BA]" />
                      <h3 className="font-medium text-gray-300">Ticket de Compra</h3>
                    </div>
                    <Card className="bg-gray-800 border-gray-700 p-4">
                      <div className="bg-white text-black p-4 rounded-lg space-y-3">
                        {/* Header del ticket */}
                        <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 space-y-2">
                          <div className="flex justify-center">
                            <div className="w-16 h-16 bg-black rounded overflow-hidden flex items-center justify-center">
                              {(uploadedLogo || getLogoUrl(editedMarca)) ? (
                                <img
                                  src={uploadedLogo || getLogoUrl(editedMarca)}
                                  alt={editedMarca.nombre}
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="text-3xl">{editedMarca.icono}</div>
                              )}
                            </div>
                          </div>
                          <h4 className="font-bold text-lg">{editedMarca.nombre}</h4>
                          <p className="text-xs text-gray-600">Ticket #001234</p>
                        </div>
                        
                        {/* Items */}
                        <div className="space-y-1 text-sm border-b border-dashed border-gray-300 pb-2">
                          <div className="flex justify-between">
                            <span>1x Pizza Margarita</span>
                            <span>€12.50</span>
                          </div>
                          <div className="flex justify-between">
                            <span>1x Coca Cola</span>
                            <span>€2.50</span>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-bold">TOTAL</span>
                          <span 
                            className="text-xl font-bold"
                            style={{ color: editedMarca.colorIdentidad }}
                          >
                            €15.00
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-medium mb-2">💡 Recomendaciones de diseño:</p>
                      <ul className="space-y-1 text-blue-300">
                        <li>• Asegúrate de que el logo sea legible en diferentes tamaños</li>
                        <li>• Verifica el contraste sobre fondos claros y oscuros</li>
                        <li>• El color de identidad se usará en botones y badges</li>
                        <li>• Los cambios se reflejarán inmediatamente al guardar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botones en vista previa */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedMarca(null);
                      setEditedMarca(null);
                      setUploadedLogo(null);
                    }}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#4DB8BA] hover:bg-[#3da5a7]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Info adicional */}
      <Card className="bg-blue-900/20 border-blue-800/50 p-4">
        <div className="flex gap-3">
          <ImageIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Recomendaciones para logos:</p>
            <ul className="space-y-1 text-blue-300">
              <li>• Usa imágenes con fondo transparente (PNG)</li>
              <li>• Tamaño recomendado: 500x500 píxeles</li>
              <li>• El logo se mostrará en el selector de marcas del cliente</li>
              <li>• Los cambios se aplicarán inmediatamente para nuevos clientes</li>
              <li>• Los logos personalizados se guardan en tu navegador</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}