/**
 * 🎉 EVENTO MODAL - PAQUETES PARA EVENTOS MODOMIO
 * Modal especial para seleccionar paquetes de eventos por número de personas
 * con servicios complementarios (DJ, bebidas, decoración, etc.)
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner@2.0.3';
import {
  Users,
  Check,
  X,
  Music,
  Wine,
  Cake,
  Camera,
  Sparkles,
  ShoppingCart,
  Package,
  Plus,
  Info
} from 'lucide-react';

interface EventoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoNombre?: string;
  productoImagen?: string;
}

// ============================================================================
// PAQUETES DE EVENTOS PREDEFINIDOS
// ============================================================================

interface PaqueteEvento {
  id: string;
  personas: number;
  precio: number;
  incluye: {
    pizzas?: number;
    burgers?: number;
    entrantes?: number;
    postres?: number;
    bebidas?: string;
  };
  destacado?: boolean;
}

const PAQUETES: PaqueteEvento[] = [
  {
    id: 'PKG-20',
    personas: 20,
    precio: 299,
    incluye: {
      pizzas: 5,
      burgers: 10,
      entrantes: 3,
      postres: 20,
      bebidas: '2L de refrescos'
    }
  },
  {
    id: 'PKG-50',
    personas: 50,
    precio: 649,
    incluye: {
      pizzas: 12,
      burgers: 25,
      entrantes: 8,
      postres: 50,
      bebidas: '5L de refrescos'
    },
    destacado: true
  },
  {
    id: 'PKG-100',
    personas: 100,
    precio: 1199,
    incluye: {
      pizzas: 25,
      burgers: 50,
      entrantes: 15,
      postres: 100,
      bebidas: '10L de refrescos'
    }
  }
];

// ============================================================================
// SERVICIOS COMPLEMENTARIOS (VENTA CRUZADA)
// ============================================================================

interface ServicioComplementario {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  icono: React.ReactNode;
  categoria: string;
}

const SERVICIOS_COMPLEMENTARIOS: ServicioComplementario[] = [
  {
    id: 'SRV-DJ',
    nombre: 'DJ Profesional',
    descripcion: '4 horas de música + equipo de sonido',
    precio: 350,
    icono: <Music className="w-5 h-5" />,
    categoria: 'Animación'
  },
  {
    id: 'SRV-BEBIDAS',
    nombre: 'Barra Libre Bebidas',
    descripcion: 'Cerveza, vino, refrescos ilimitados',
    precio: 15, // por persona
    icono: <Wine className="w-5 h-5" />,
    categoria: 'Bebidas'
  },
  {
    id: 'SRV-TARTA',
    nombre: 'Tarta Personalizada',
    descripcion: 'Tarta de 3kg personalizada',
    precio: 89,
    icono: <Cake className="w-5 h-5" />,
    categoria: 'Repostería'
  },
  {
    id: 'SRV-FOTO',
    nombre: 'Fotógrafo',
    descripcion: 'Cobertura completa del evento',
    precio: 450,
    icono: <Camera className="w-5 h-5" />,
    categoria: 'Fotografía'
  },
  {
    id: 'SRV-DECORACION',
    nombre: 'Decoración Premium',
    descripcion: 'Globos, guirnaldas y centro de mesa',
    precio: 180,
    icono: <Sparkles className="w-5 h-5" />,
    categoria: 'Decoración'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function EventoModal({ open, onOpenChange, productoNombre, productoImagen }: EventoModalProps) {
  const { addItem } = useCart();
  
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<string | null>(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggleServicio = (servicioId: string) => {
    setServiciosSeleccionados(prev => 
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  const handleAñadirAlCarrito = () => {
    if (!paqueteSeleccionado) {
      toast.error('Por favor, selecciona un paquete');
      return;
    }

    const paquete = PAQUETES.find(p => p.id === paqueteSeleccionado);
    if (!paquete) return;

    // Añadir paquete principal
    addItem({
      productoId: paquete.id,
      nombre: `Evento MODOMMIO - ${paquete.personas} personas`,
      precio: paquete.precio,
      cantidad: 1,
      imagen: productoImagen || '',
      categoria: 'Eventos',
    });

    // Añadir servicios complementarios
    serviciosSeleccionados.forEach(servicioId => {
      const servicio = SERVICIOS_COMPLEMENTARIOS.find(s => s.id === servicioId);
      if (servicio) {
        let precioFinal = servicio.precio;
        let nombreFinal = servicio.nombre;

        // Si es barra libre, multiplicar por número de personas
        if (servicioId === 'SRV-BEBIDAS' && paquete) {
          precioFinal = servicio.precio * paquete.personas;
          nombreFinal = `${servicio.nombre} (${paquete.personas} personas)`;
        }

        addItem({
          productoId: servicio.id,
          nombre: nombreFinal,
          precio: precioFinal,
          cantidad: 1,
          imagen: '',
          categoria: 'Servicios',
        });
      }
    });

    toast.success('Evento añadido al carrito');
    
    // Reset y cerrar
    setPaqueteSeleccionado(null);
    setServiciosSeleccionados([]);
    onOpenChange(false);
  };

  const handleCerrar = () => {
    setPaqueteSeleccionado(null);
    setServiciosSeleccionados([]);
    onOpenChange(false);
  };

  // ============================================================================
  // CALCULAR TOTAL
  // ============================================================================

  const calcularTotal = () => {
    const paquete = PAQUETES.find(p => p.id === paqueteSeleccionado);
    if (!paquete) return 0;

    let total = paquete.precio;

    serviciosSeleccionados.forEach(servicioId => {
      const servicio = SERVICIOS_COMPLEMENTARIOS.find(s => s.id === servicioId);
      if (servicio) {
        if (servicioId === 'SRV-BEBIDAS') {
          total += servicio.precio * paquete.personas;
        } else {
          total += servicio.precio;
        }
      }
    });

    return total;
  };

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#ED1C24] flex items-center gap-2">
            <Sparkles className="w-7 h-7" />
            {productoNombre || 'Organiza tu Evento con MODOMMIO'}
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            Selecciona el paquete según el número de invitados y personaliza tu evento con servicios adicionales
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* ========================================= */}
          {/* PASO 1: SELECCIONAR PAQUETE */}
          {/* ========================================= */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#ED1C24]" />
              <h3 className="font-bold text-lg">Paso 1: Elige tu paquete</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAQUETES.map((paquete) => (
                <button
                  key={paquete.id}
                  onClick={() => setPaqueteSeleccionado(paquete.id)}
                  className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                    paqueteSeleccionado === paquete.id
                      ? 'border-[#ED1C24] bg-red-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  } ${paquete.destacado ? 'ring-2 ring-[#ED1C24] ring-offset-2' : ''}`}
                >
                  {paquete.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ED1C24] text-white px-3 py-1 rounded-full text-xs font-bold">
                      MÁS POPULAR
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      paqueteSeleccionado === paquete.id ? 'bg-[#ED1C24]' : 'bg-gray-100'
                    }`}>
                      <Users className={`w-6 h-6 ${
                        paqueteSeleccionado === paquete.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{paquete.personas} personas</p>
                      <p className="text-2xl font-bold text-[#ED1C24]">€{paquete.precio}</p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-700 mb-2">Incluye:</p>
                    {paquete.incluye.pizzas && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{paquete.incluye.pizzas} Pizzas</span>
                      </div>
                    )}
                    {paquete.incluye.burgers && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{paquete.incluye.burgers} Burgers</span>
                      </div>
                    )}
                    {paquete.incluye.entrantes && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{paquete.incluye.entrantes} Entrantes</span>
                      </div>
                    )}
                    {paquete.incluye.postres && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{paquete.incluye.postres} Postres</span>
                      </div>
                    )}
                    {paquete.incluye.bebidas && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{paquete.incluye.bebidas}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ========================================= */}
          {/* PASO 2: SERVICIOS COMPLEMENTARIOS */}
          {/* ========================================= */}
          {paqueteSeleccionado && (
            <div className="bg-gradient-to-br from-[#ED1C24] via-red-600 to-orange-600 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white rounded-full p-2">
                  <Sparkles className="w-5 h-5 text-[#ED1C24]" />
                </div>
                <h3 className="font-bold text-lg text-white">¿Quieres completar tu evento?</h3>
              </div>
              
              <p className="text-white/90 text-sm mb-4">
                ¡Hazlo inolvidable! Añade servicios extra para una experiencia completa
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SERVICIOS_COMPLEMENTARIOS.map((servicio) => {
                  const isSeleccionado = serviciosSeleccionados.includes(servicio.id);
                  const precioMostrar = servicio.id === 'SRV-BEBIDAS' 
                    ? `€${servicio.precio}/persona`
                    : `€${servicio.precio}`;

                  return (
                    <button
                      key={servicio.id}
                      onClick={() => handleToggleServicio(servicio.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSeleccionado
                          ? 'bg-white border-white shadow-lg'
                          : 'bg-white/10 border-white/30 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isSeleccionado ? 'bg-[#ED1C24]' : 'bg-white/20'
                        }`}>
                          <div className={isSeleccionado ? 'text-white' : 'text-white'}>
                            {servicio.icono}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSeleccionado 
                            ? 'bg-[#ED1C24] border-[#ED1C24]' 
                            : 'border-white/50'
                        }`}>
                          {isSeleccionado && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      
                      <p className={`font-bold text-sm mb-1 ${
                        isSeleccionado ? 'text-gray-900' : 'text-white'
                      }`}>
                        {servicio.nombre}
                      </p>
                      <p className={`text-xs mb-2 ${
                        isSeleccionado ? 'text-gray-600' : 'text-white/80'
                      }`}>
                        {servicio.descripcion}
                      </p>
                      <p className={`font-bold ${
                        isSeleccionado ? 'text-[#ED1C24]' : 'text-white'
                      }`}>
                        {precioMostrar}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* RESUMEN Y BOTONES */}
          {/* ========================================= */}
          {paqueteSeleccionado && (
            <>
              <Separator />
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Resumen de tu evento
                </h4>
                
                <div className="space-y-2 text-sm mb-4">
                  {PAQUETES.find(p => p.id === paqueteSeleccionado) && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        Paquete {PAQUETES.find(p => p.id === paqueteSeleccionado)?.personas} personas
                      </span>
                      <span className="font-medium">
                        €{PAQUETES.find(p => p.id === paqueteSeleccionado)?.precio}
                      </span>
                    </div>
                  )}
                  
                  {serviciosSeleccionados.map(servicioId => {
                    const servicio = SERVICIOS_COMPLEMENTARIOS.find(s => s.id === servicioId);
                    const paquete = PAQUETES.find(p => p.id === paqueteSeleccionado);
                    if (!servicio || !paquete) return null;

                    const precio = servicioId === 'SRV-BEBIDAS' 
                      ? servicio.precio * paquete.personas
                      : servicio.precio;

                    return (
                      <div key={servicioId} className="flex justify-between text-green-400">
                        <span>+ {servicio.nombre}</span>
                        <span>€{precio}</span>
                      </div>
                    );
                  })}
                </div>

                <Separator className="bg-white/20 my-3" />

                <div className="flex justify-between text-2xl font-bold">
                  <span>TOTAL</span>
                  <span className="text-[#ED1C24]">€{calcularTotal()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCerrar}
                  className="flex-1 h-12"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleAñadirAlCarrito}
                  className="flex-1 h-12 bg-[#ED1C24] hover:bg-[#C91820] text-white shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Añadir al Carrito
                </Button>
              </div>
            </>
          )}

          {!paqueteSeleccionado && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                Selecciona un paquete para continuar
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
