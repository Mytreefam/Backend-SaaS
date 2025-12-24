/**
 * SELECTOR DE MARCA CLIENTE
 * 
 * Modal que permite al cliente elegir su marca favorita al iniciar sesión
 * La preferencia se guarda en localStorage
 * 
 * ✨ Integrado con el sistema de gestión de marcas del gerente
 * - Muestra logos personalizados subidos por el gerente
 * - Lee configuración desde localStorage
 * - Actualización en tiempo real de cambios del gerente
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Check, Sparkles, Store, Image as ImageIcon } from 'lucide-react';
import { MARCAS_ARRAY, type Marca } from '../../constants/empresaConfig';
import { toast } from 'sonner@2.0.3';
import logoModomio from 'figma:asset/7a4d64c95291a62dd24c849142ae4540d5e2f45f.png';
import logoBlackburger from 'figma:asset/60b944da0efe66e24a868c7d759146e988e8fa41.png';

interface SelectorMarcaClienteProps {
  onMarcaSelected: (marcaId: string) => void;
}

const LOGOS_MAP: Record<string, string> = {
  'MRC-001': logoModomio,
  'MRC-002': logoBlackburger,
};

// Key de localStorage para marcas personalizadas (mismo que GestionMarcas)
const STORAGE_KEY = 'udar_marcas_personalizadas';

interface MarcaPersonalizada extends Marca {
  logoPersonalizado?: string;
}

export function SelectorMarcaCliente({ onMarcaSelected }: SelectorMarcaClienteProps) {
  const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
  const [hoveredMarca, setHoveredMarca] = useState<string | null>(null);
  const [marcas, setMarcas] = useState<MarcaPersonalizada[]>(MARCAS_ARRAY);

  // Cargar marcas personalizadas y preferencia guardada
  useEffect(() => {
    // Cargar marcas personalizadas desde localStorage
    const marcasGuardadas = localStorage.getItem(STORAGE_KEY);
    if (marcasGuardadas) {
      try {
        const marcasPersonalizadas = JSON.parse(marcasGuardadas);
        setMarcas(marcasPersonalizadas);
      } catch (error) {
        console.error('Error al cargar marcas personalizadas:', error);
        setMarcas(MARCAS_ARRAY);
      }
    }

    // Cargar preferencia de marca del cliente
    const savedMarca = localStorage.getItem('cliente_marca_preferida');
    if (savedMarca) {
      setSelectedMarca(savedMarca);
    }
  }, []);

  const handleSelectMarca = (marcaId: string) => {
    setSelectedMarca(marcaId);
  };

  const handleConfirm = () => {
    if (!selectedMarca) {
      toast.error('Por favor, selecciona una marca');
      return;
    }

    // Guardar en localStorage
    localStorage.setItem('cliente_marca_preferida', selectedMarca);
    
    const marca = marcas.find(m => m.id === selectedMarca);
    toast.success(`¡Genial! Te mostraremos productos de ${marca?.nombre}`, {
      description: 'Tu experiencia estará personalizada con esta marca',
      duration: 3000
    });
    
    onMarcaSelected(selectedMarca);
  };

  // Función para obtener el logo correcto (personalizado o por defecto)
  const getLogoUrl = (marca: MarcaPersonalizada) => {
    // Prioridad: logo personalizado > logo por defecto
    return marca.logoPersonalizado || LOGOS_MAP[marca.id];
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Store className="w-5 h-5 text-[#4DB8BA]" />
          <h2 className="text-xl font-semibold text-gray-900">Elige tu marca favorita</h2>
        </div>
        <p className="text-sm text-gray-600">
          Selecciona la marca que prefieres para personalizar tu experiencia
        </p>
      </div>

      {/* Grid de marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marcas.map((marca, index) => {
          const logoUrl = getLogoUrl(marca);
          const tieneLogoPersonalizado = !!marca.logoPersonalizado;
          
          return (
            <motion.div
              key={marca.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredMarca(marca.id)}
              onHoverEnd={() => setHoveredMarca(null)}
              onClick={() => handleSelectMarca(marca.id)}
              className={`
                relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-300
                ${selectedMarca === marca.id 
                  ? 'border-[#4DB8BA] bg-gradient-to-br from-[#4DB8BA]/10 to-[#4DB8BA]/5 shadow-lg shadow-[#4DB8BA]/20' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:shadow-md'
                }
              `}
            >
              {/* Checkmark animado */}
              <AnimatePresence>
                {selectedMarca === marca.id && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="absolute top-3 right-3 bg-[#4DB8BA] rounded-full p-1.5 shadow-lg"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Indicador de logo personalizado */}
              {tieneLogoPersonalizado && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Premium</span>
                </motion.div>
              )}

              {/* Logo de la marca */}
              <div className="flex justify-center items-center h-40 mb-4 bg-black rounded-lg overflow-hidden relative group">
                {logoUrl ? (
                  <motion.img
                    src={logoUrl}
                    alt={marca.nombre}
                    className="w-full h-full object-contain p-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="text-6xl">{marca.icono}</div>
                )}
                
                {/* Overlay con efecto hover */}
                {hoveredMarca === marca.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[#4DB8BA]/10 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white/90 rounded-full p-3 shadow-lg"
                    >
                      <Check className="w-6 h-6 text-[#4DB8BA]" />
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Nombre de la marca */}
              <div className="text-center space-y-2">
                <h3 className="text-xl mb-2 text-gray-900 font-medium">{marca.nombre}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-gray-400" 
                    style={{ backgroundColor: marca.colorIdentidad }}
                  />
                  <span>Disponible en todos los puntos de venta</span>
                </div>
              </div>

              {/* Efecto hover border */}
              {hoveredMarca === marca.id && selectedMarca !== marca.id && (
                <motion.div
                  layoutId="hover-border"
                  className="absolute inset-0 rounded-xl border-2 border-[#4DB8BA]/50 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Botón de confirmación */}
      <motion.div 
        className="flex justify-end gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleConfirm}
          disabled={!selectedMarca}
          className="bg-gradient-to-r from-[#4DB8BA] to-[#3da5a7] hover:from-[#3da5a7] hover:to-[#2d8c8e] text-white px-8 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Continuar con {marcas.find(m => m.id === selectedMarca)?.nombre || 'esta marca'}
        </Button>
      </motion.div>

      {/* Info adicional */}
      <motion.p 
        className="text-xs text-center text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        💡 Podrás cambiar tu preferencia en cualquier momento desde tu perfil
      </motion.p>
    </div>
  );
}