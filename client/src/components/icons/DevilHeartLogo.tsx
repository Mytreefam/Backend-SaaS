/**
 * 🖤 LOGO CORAZÓN DEMONIACO - HOY PECAMOS
 * Versión silueta/contorno - Solo borde rojo sin relleno
 */

import { motion } from 'motion/react';

interface DevilHeartLogoProps {
  className?: string;
  animate?: boolean;
  color?: string;
}

export function DevilHeartLogo({ 
  className = "w-40 h-40", 
  animate = true,
  color = "#ED1C24" 
}: DevilHeartLogoProps) {
  
  const MotionSvg = animate ? motion.svg : 'svg';
  
  const animationProps = animate ? {
    animate: {
      scale: [1, 1.05, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <MotionSvg
      viewBox="0 0 200 220"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...animationProps}
    >
      {/* Filtros para glow */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* CUERNO IZQUIERDO - Solo contorno */}
      <motion.path
        d="M 60 55 
           Q 52 40, 48 28 
           Q 46 20, 48 15 
           Q 50 10, 55 12 
           Q 58 14, 60 20
           Q 62 30, 64 42
           Q 65 50, 60 55 Z"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        initial={animate ? { rotate: -8 } : {}}
        animate={animate ? { 
          rotate: [-8, -3, -8],
        } : {}}
        transition={animate ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        style={{ transformOrigin: "60px 55px" }}
      />

      {/* CUERNO DERECHO - Solo contorno */}
      <motion.path
        d="M 140 55 
           Q 148 40, 152 28 
           Q 154 20, 152 15 
           Q 150 10, 145 12 
           Q 142 14, 140 20
           Q 138 30, 136 42
           Q 135 50, 140 55 Z"
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        initial={animate ? { rotate: 8 } : {}}
        animate={animate ? { 
          rotate: [8, 3, 8],
        } : {}}
        transition={animate ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        style={{ transformOrigin: "140px 55px" }}
      />

      {/* CORAZÓN PRINCIPAL - Solo contorno grueso */}
      <motion.path
        d="M 100 175
           C 100 175, 65 150, 55 125
           C 45 100, 45 85, 55 70
           C 60 62, 70 58, 82 62
           C 88 64, 94 70, 100 80
           C 106 70, 112 64, 118 62
           C 130 58, 140 62, 145 70
           C 155 85, 155 100, 145 125
           C 135 150, 100 175, 100 175 Z"
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
        initial={animate ? { scale: 0.95 } : {}}
        animate={animate ? { 
          scale: [0.95, 1, 0.95],
        } : {}}
        transition={animate ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        style={{ transformOrigin: "100px 115px" }}
      />

      {/* COLA DE DEMONIO - Solo contorno */}
      <motion.g
        animate={animate ? {
          rotate: [0, 8, 0],
        } : {}}
        transition={animate ? {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        style={{ transformOrigin: "100px 175px" }}
      >
        {/* Línea de la cola */}
        <path
          d="M 100 175 
             Q 110 180, 120 185
             Q 128 189, 135 193
             Q 140 196, 145 200"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Punta de flecha de la cola */}
        <path
          d="M 145 196 
             L 152 200 
             L 148 205 
             L 145 203 Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
      </motion.g>
    </MotionSvg>
  );
}