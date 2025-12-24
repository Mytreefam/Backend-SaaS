export function ForkKnifeLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fondo verde */}
      <rect width="100" height="100" fill="#0d9488" rx="16" />
      
      {/* Fork (izquierda, rotado) */}
      <g transform="rotate(-45 50 50)">
        <g transform="translate(-15, 0)">
          {/* Dientes del tenedor */}
          <rect x="43" y="20" width="2.5" height="22" rx="1" fill="white" />
          <rect x="48" y="20" width="2.5" height="22" rx="1" fill="white" />
          <rect x="53" y="20" width="2.5" height="22" rx="1" fill="white" />
          
          {/* Mango del tenedor */}
          <rect x="46.5" y="40" width="5" height="40" rx="2.5" fill="white" />
          
          {/* Unión */}
          <ellipse cx="49" cy="42" rx="6" ry="4" fill="white" />
        </g>
      </g>
      
      {/* Knife (derecha, rotado) */}
      <g transform="rotate(45 50 50)">
        <g transform="translate(15, 0)">
          {/* Hoja del cuchillo */}
          <path d="M 48 20 L 46 38 L 52 38 L 50 20 C 50 18 49 17 49 17 C 49 17 48 18 48 20 Z" fill="white" />
          <ellipse cx="49" cy="19" rx="2.5" ry="2" fill="white" />
          
          {/* Mango del cuchillo */}
          <rect x="46.5" y="38" width="5" height="42" rx="2.5" fill="white" />
        </g>
      </g>
    </svg>
  );
}