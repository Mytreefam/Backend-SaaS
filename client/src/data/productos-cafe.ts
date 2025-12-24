// Productos de café - SISTEMA MULTIEMPRESA
// Este archivo contiene los productos compartidos entre Cliente, Colaborador y Gerente
// ⭐ ACTUALIZADO: Incluye segmentación por empresa/marca/PDV

export interface ProductoCafe {
  id: string;
  nombre: string;
  categoria: 'Café' | 'Mezclas';
  precio: number;
  stock: number;
  descripcion: string;
  destacado?: boolean;
  imagen?: string;
  
  // ⭐ CONTEXTO MULTIEMPRESA
  empresaId: string;                    // ID de la empresa (EMP-001)
  marcaId: string;                      // ID de la marca (MRC-001, MRC-002)
  puntosVentaDisponibles: string[];     // Array de PDV IDs donde está disponible
  activo?: boolean;                     // Si el producto está activo
}

export const productosCafe: ProductoCafe[] = [
  // Cafés de Origen - CORE
  {
    id: 'PROD-001',
    nombre: 'CORE Colombia',
    categoria: 'Café',
    precio: 12.90,
    stock: 25,
    descripcion: 'Región: Colombia. Notas: Caramelo, chocolate. Proceso: Lavado. Tueste: Medio',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop',
    // ⭐ Contexto multiempresa
    empresaId: 'EMP-001',
    marcaId: 'MRC-001', // Modomio
    puntosVentaDisponibles: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true
  },
  {
    id: 'PROD-002',
    nombre: 'CORE Brasil',
    categoria: 'Café',
    precio: 12.50,
    stock: 30,
    descripcion: 'Región: Brasil. Notas: Cacao, nueces. Proceso: Natural. Tueste: Medio',
    imagen: 'https://images.unsplash.com/photo-1610632380989-680fe40816f6?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-003',
    nombre: 'CORE Etiopía',
    categoria: 'Café',
    precio: 13.90,
    stock: 18,
    descripcion: 'Región: Etiopía. Notas: Floral, cítricos. Proceso: Lavado. Tueste: Medio claro',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-004',
    nombre: 'CORE México',
    categoria: 'Café',
    precio: 12.50,
    stock: 20,
    descripcion: 'Región: México. Notas: Chocolate, especias. Proceso: Lavado. Tueste: Medio',
    imagen: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-005',
    nombre: 'CORE Kenia',
    categoria: 'Café',
    precio: 14.50,
    stock: 15,
    descripcion: 'Región: Kenia. Notas: Frutas rojas, bayas. Proceso: Lavado. Tueste: Medio',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-006',
    nombre: 'CORE Honduras',
    categoria: 'Café',
    precio: 12.90,
    stock: 22,
    descripcion: 'Región: Honduras. Notas: Caramelo, frutas. Proceso: Lavado. Tueste: Medio',
    imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-007',
    nombre: 'CORE Guatemala',
    categoria: 'Café',
    precio: 13.50,
    stock: 20,
    descripcion: 'Región: Guatemala. Notas: Chocolate, especias. Proceso: Lavado. Tueste: Medio',
    imagen: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-008',
    nombre: 'CORE Colombia Decaf',
    categoria: 'Café',
    precio: 13.90,
    stock: 18,
    descripcion: 'Región: Colombia. Sin cafeína. Notas: Chocolate, nueces. Proceso: Descafeinado suizo',
    imagen: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
  },
  // Mezclas - CORE Blends
  {
    id: 'PROD-009',
    nombre: 'CORE House Blend',
    categoria: 'Mezclas',
    precio: 11.90,
    stock: 35,
    descripcion: 'Mezcla: Colombia 50%, Brasil 50%. Equilibrado y versátil. Tueste: Medio',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-010',
    nombre: 'CORE Latte Blend',
    categoria: 'Mezclas',
    precio: 11.50,
    stock: 30,
    descripcion: 'Mezcla: Brasil 60%, Colombia 40%. Perfecto para café con leche. Tueste: Medio',
    imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-011',
    nombre: 'CORE Latte',
    categoria: 'Mezclas',
    precio: 12.90,
    stock: 25,
    descripcion: 'Mezcla: Brasil 50%, Colombia 30%, Etiopía 20%. Ideal para lattes. Tueste: Medio',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-012',
    nombre: 'CORE Latte Forte',
    categoria: 'Mezclas',
    precio: 13.50,
    stock: 22,
    descripcion: 'Mezcla: Brasil 40%, Colombia 40%, Kenia 20%. Intenso y cremoso. Tueste: Medio oscuro',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1501492673258-6d2f8c0b9bec?w=400&h=300&fit=crop'
  }
];