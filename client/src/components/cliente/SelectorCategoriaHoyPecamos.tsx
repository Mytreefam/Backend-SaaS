/**
 * SELECTOR DE CATEGORÍAS - HOY PECAMOS
 * 
 * Pantalla de selección de las 3 líneas de negocio:
 * - MODOMMIO (Pizzas artesanales)
 * - BLACKBURGER (Hamburguesas gourmet)
 * - EVENTOS MODOMMIO (Catering y eventos)
 */

import { motion } from 'motion/react';
import { Pizza, Beef, PartyPopper, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Categoria {
  id: string;
  nombre: string;
  nombreMobile: string;
  descripcion: string;
  imagen: string;
  icon: any;
  color: string;
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'modommio',
    nombre: 'MODOMMIO',
    nombreMobile: 'MODOMMIO',
    descripcion: 'Pizzas artesanales al horno de leña',
    imagen: 'https://images.unsplash.com/photo-1763478156969-4d7c0ab35590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwcGl6emElMjB3b29kJTIwZmlyZWR8ZW58MXx8fHwxNzY0NjM2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Pizza,
    color: '#FF6B35',
  },
  {
    id: 'blackburger',
    nombre: 'BLACKBURGER',
    nombreMobile: 'BLACK\nBURGER',
    descripcion: 'Hamburguesas gourmet premium',
    imagen: 'https://images.unsplash.com/photo-1634737119182-4d09e1305ba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyJTIwYXJ0aXNhbnxlbnwxfHx8fDE3NjQ1OTg5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Beef,
    color: '#1A1A1A',
  },
  {
    id: 'eventos',
    nombre: 'EVENTOS MODOMMIO',
    nombreMobile: 'EVENTOS\nMODOMMIO',
    descripcion: 'Catering y celebraciones especiales',
    imagen: 'https://images.unsplash.com/photo-1761110429384-0678d7015545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0eSUyMGV2ZW50JTIwY2F0ZXJpbmclMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NjQ2MzYxMDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: PartyPopper,
    color: '#ED1C24',
  },
];

interface SelectorCategoriaHoyPecamosProps {
  onCategoriaSelected: (categoriaId: string) => void;
}

export function SelectorCategoriaHoyPecamos({ onCategoriaSelected }: SelectorCategoriaHoyPecamosProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col px-3 pt-3 pb-3 sm:items-center sm:justify-center sm:p-6 relative overflow-y-auto">
      {/* Resplandor rojo de fondo */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #ED1C2460 0%, transparent 70%)'
        }}
      />

      {/* Grid de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #ED1C24 1px, transparent 1px),
            linear-gradient(to bottom, #ED1C24 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-2xl relative z-10 bg-[rgba(0,0,0,0)] flex-shrink-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-3.5 sm:mb-5"
        >
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2 tracking-wider"
            style={{
              color: '#ED1C24',
              fontFamily: 'Montserrat, sans-serif',
              textShadow: '0 0 30px #ED1C2480',
              letterSpacing: '0.1em'
            }}
          >
            HOY PECAMOS
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg">
            ¿Qué se te antoja hoy?
          </p>
        </motion.div>

        {/* Grid de categorías - Una encima de otra en móvil, 2 columnas en desktop */}
        <div className="flex flex-col gap-2.5 sm:gap-2.5">
          {/* MODOMMIO - Pizza */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CategoriaCard
              categoria={CATEGORIAS[0]}
              onClick={() => onCategoriaSelected(CATEGORIAS[0].id)}
              large={true}
            />
          </motion.div>

          {/* BLACKBURGER - Hamburguesa */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <CategoriaCard
              categoria={CATEGORIAS[1]}
              onClick={() => onCategoriaSelected(CATEGORIAS[1].id)}
              large={true}
            />
          </motion.div>

          {/* EVENTOS - Grande */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <CategoriaCard
              categoria={CATEGORIAS[2]}
              onClick={() => onCategoriaSelected(CATEGORIAS[2].id)}
              large={true}
            />
          </motion.div>
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/50 text-xs sm:text-sm mt-3 mb-0"
        >
          Selecciona una categoría para continuar
        </motion.p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Tarjeta de Categoría
// ============================================================================

interface CategoriaCardProps {
  categoria: Categoria;
  onClick: () => void;
  large?: boolean;
}

function CategoriaCard({ categoria, onClick, large = false }: CategoriaCardProps) {
  const Icon = categoria.icon;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full overflow-hidden rounded-xl sm:rounded-2xl group cursor-pointer
        h-56 sm:h-56 md:h-64
      `}
      style={{
        boxShadow: `0 10px 40px rgba(237, 28, 36, 0.3)`,
      }}
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={categoria.imagen}
          alt={categoria.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay oscuro */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 transition-opacity duration-300 group-hover:opacity-80"
        />
        
        {/* Borde rojo brillante */}
        <div 
          className="absolute inset-0 border-2 transition-all duration-300"
          style={{
            borderColor: 'rgba(237, 28, 36, 0.3)',
          }}
        />
        <div 
          className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            borderColor: '#ED1C24',
            boxShadow: 'inset 0 0 20px rgba(237, 28, 36, 0.5)',
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-between p-5 sm:p-6">
        {/* Ícono flotante - ahora en la parte superior */}
        <div className="flex justify-end">
          <div 
            className={`${large ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center backdrop-blur-sm border-2`}
            style={{
              backgroundColor: 'rgba(237, 28, 36, 0.2)',
              borderColor: '#ED1C24',
              boxShadow: '0 0 20px rgba(237, 28, 36, 0.6)',
            }}
          >
            <Icon className={`${large ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'} text-white`} />
          </div>
        </div>

        {/* Nombre y descripción - ahora en la parte inferior */}
        <div className="space-y-1.5 sm:space-y-2">
          {/* Nombre - con versión móvil en dos líneas */}
          <h2 
            className={`
              ${large ? 'text-xl sm:text-2xl md:text-3xl' : 'text-lg sm:text-xl md:text-2xl'}
              transition-all duration-300 text-left
            `}
            style={{
              color: '#ffffff',
              fontFamily: 'Montserrat, sans-serif',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 0 30px rgba(237, 28, 36, 0.6)',
              fontWeight: 900,
              letterSpacing: '0.05em',
              lineHeight: '1.1',
            }}
          >
            {/* Versión móvil con saltos de línea */}
            <span className="sm:hidden whitespace-pre-line">
              {categoria.nombreMobile}
            </span>
            {/* Versión desktop en una línea */}
            <span className="hidden sm:inline">
              {categoria.nombre}
            </span>
          </h2>

          {/* Descripción */}
          <p 
            className={`text-white/90 ${large ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'} text-left`}
            style={{
              fontFamily: 'Poppins, sans-serif',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              lineHeight: '1.4'
            }}
          >
            {categoria.descripcion}
          </p>

          {/* Botón de acción */}
          <div className="flex items-center gap-1 sm:gap-2 text-white group-hover:text-[#ED1C24] transition-colors duration-300 pt-0.5">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-medium">Ver menú</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-2" />
          </div>
        </div>

        {/* Glow effect en hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(237, 28, 36, 0.2) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Partículas decorativas - solo en desktop */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden hidden sm:block">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${i * 30}%`, opacity: 0 }}
            animate={{ 
              y: ['0%', '100%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
            className="absolute w-1 h-1 rounded-full bg-red-500"
            style={{
              left: `${20 + i * 30}%`,
              boxShadow: '0 0 10px #ED1C24',
            }}
          />
        ))}
      </div>
    </motion.button>
  );
}