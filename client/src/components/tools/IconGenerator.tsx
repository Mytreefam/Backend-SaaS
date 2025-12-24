/**
 * 🎨 GENERADOR DE ÍCONOS - HOY PECAMOS
 * Genera automáticamente todos los tamaños de íconos necesarios para la app
 */

import { useState } from 'react';
import { Download } from 'lucide-react';

export function IconGenerator() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Logo SVG como string (sin animaciones)
  const logoSVG = `
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- CUERNO IZQUIERDO -->
      <path
        d="M 60 55 Q 52 40, 48 28 Q 46 20, 48 15 Q 50 10, 55 12 Q 58 14, 60 20 Q 62 30, 64 42 Q 65 50, 60 55 Z"
        fill="none"
        stroke="#ED1C24"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#glow)"
      />
      
      <!-- CUERNO DERECHO -->
      <path
        d="M 140 55 Q 148 40, 152 28 Q 154 20, 152 15 Q 150 10, 145 12 Q 142 14, 140 20 Q 138 30, 136 42 Q 135 50, 140 55 Z"
        fill="none"
        stroke="#ED1C24"
        stroke-width="6"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#glow)"
      />
      
      <!-- CORAZÓN PRINCIPAL -->
      <path
        d="M 100 175 C 100 175, 65 150, 55 125 C 45 100, 45 85, 55 70 C 60 62, 70 58, 82 62 C 88 64, 94 70, 100 80 C 106 70, 112 64, 118 62 C 130 58, 140 62, 145 70 C 155 85, 155 100, 145 125 C 135 150, 100 175, 100 175 Z"
        fill="none"
        stroke="#ED1C24"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#glow)"
      />
      
      <!-- COLA -->
      <g>
        <path
          d="M 100 175 Q 110 180, 120 185 Q 128 189, 135 193 Q 140 196, 145 200"
          fill="none"
          stroke="#ED1C24"
          stroke-width="6"
          stroke-linecap="round"
          filter="url(#glow)"
        />
        <path
          d="M 145 196 L 152 200 L 148 205 L 145 203 Z"
          fill="#ED1C24"
          stroke="#ED1C24"
          stroke-width="2"
          stroke-linejoin="round"
          filter="url(#glow)"
        />
      </g>
    </svg>
  `;

  const generateIcon = async (size: number, filename: string) => {
    return new Promise<void>((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // Fondo negro
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);

      // Crear imagen del SVG
      const img = new Image();
      const svgBlob = new Blob([logoSVG], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Calcular dimensiones centradas con padding
        const padding = size * 0.1; // 10% de padding
        const logoSize = size - (padding * 2);
        
        // Centrar el logo
        const x = padding;
        const y = padding;

        ctx.drawImage(img, x, y, logoSize, logoSize);
        URL.revokeObjectURL(url);

        // Descargar
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
          }
          resolve();
        }, 'image/png');
      };

      img.src = url;
    });
  };

  const generateAllIcons = async () => {
    setGenerating(true);
    
    // Esperar un poco para que el usuario vea el estado
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generar todos los tamaños
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 48, name: 'icon-48x48.png' },
      { size: 72, name: 'icon-72x72.png' },
      { size: 96, name: 'icon-96x96.png' },
      { size: 144, name: 'icon-144x144.png' },
      { size: 192, name: 'icon-192x192.png' },
      { size: 512, name: 'icon-512x512.png' },
      { size: 1024, name: 'icon-1024x1024.png' },
    ];

    for (const { size, name } of sizes) {
      await generateIcon(size, name);
      // Pequeña pausa entre descargas
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setGenerating(false);
    setGenerated(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center">
            <div 
              dangerouslySetInnerHTML={{ __html: logoSVG }}
              className="w-12 h-12"
            />
          </div>
          <div>
            <h1 className="text-2xl text-white">Generador de Íconos</h1>
            <p className="text-zinc-400">HOY PECAMOS - App Icons</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-black border border-zinc-800 rounded-lg p-4">
            <h2 className="text-white mb-2">📱 Íconos que se generarán:</h2>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• Favicon: 16x16, 32x32</li>
              <li>• Android: 48, 72, 96, 144, 192, 512</li>
              <li>• iOS: 1024x1024</li>
            </ul>
          </div>

          <div className="bg-black border border-zinc-800 rounded-lg p-4">
            <h2 className="text-white mb-2">🎨 Configuración:</h2>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>• Fondo: Negro sólido (#000000)</li>
              <li>• Logo: Rojo con glow (#ED1C24)</li>
              <li>• Formato: PNG con padding 10%</li>
            </ul>
          </div>
        </div>

        <button
          onClick={generateAllIcons}
          disabled={generating}
          className="w-full bg-[#ED1C24] hover:bg-red-700 disabled:bg-zinc-700 text-white py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generando íconos...</span>
            </>
          ) : generated ? (
            <>
              <Download className="w-5 h-5" />
              <span>✅ Generado - Volver a generar</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Generar todos los íconos</span>
            </>
          )}
        </button>

        {generated && (
          <div className="mt-6 bg-green-950 border border-green-800 rounded-lg p-4">
            <p className="text-green-400 text-sm">
              ✅ ¡Íconos generados! Revisa tu carpeta de descargas.
              <br />
              <br />
              <strong className="text-green-300">Siguiente paso:</strong>
              <br />
              1. Copia los archivos descargados
              <br />
              2. Pégalos en <code className="bg-black px-1 rounded">/public/</code>
              <br />
              3. Reemplaza los íconos existentes
            </p>
          </div>
        )}

        <div className="mt-6 text-zinc-500 text-xs text-center">
          Los archivos se descargarán automáticamente en secuencia
        </div>
      </div>
    </div>
  );
}
