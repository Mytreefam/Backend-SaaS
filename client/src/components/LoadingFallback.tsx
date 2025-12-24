/**
 * 🔄 LOADING FALLBACK
 * Componente de carga optimizado para lazy loading
 */

export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner animado */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#4DB8BA] animate-spin"></div>
        </div>
        
        {/* Texto de carga */}
        <div className="text-gray-400 animate-pulse">
          Cargando...
        </div>
      </div>
    </div>
  );
}
