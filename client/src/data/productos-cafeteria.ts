// Productos de Cafetería - SISTEMA MULTIEMPRESA
// Este archivo contiene los productos compartidos entre Cliente, Colaborador y Gerente
// ⭐ ACTUALIZADO: Incluye segmentación por empresa/marca/PDV

export interface ProductoCafeteria {
  id: string;
  nombre: string;
  categoria: 'Pan' | 'Bollería' | 'Bocadillos' | 'Cafés' | 'Zumos' | 'Aguas' | 'Refrescos';
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

export const productosCafeteria: ProductoCafeteria[] = [
  // Pan
  {
    id: 'PROD-001',
    nombre: 'Pan de Masa Madre',
    categoria: 'Pan',
    precio: 3.50,
    stock: 25,
    descripcion: 'Pan artesanal de masa madre con fermentación lenta de 24h',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    // ⭐ Contexto multiempresa
    empresaId: 'EMP-001',
    marcaId: 'MRC-001', // Modomio
    puntosVentaDisponibles: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true
  },
  {
    id: 'PROD-002',
    nombre: 'Baguette Francesa',
    categoria: 'Pan',
    precio: 1.80,
    stock: 35,
    descripcion: 'Baguette crujiente recién horneada',
    imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    // ⭐ Contexto multiempresa
    empresaId: 'EMP-001',
    marcaId: 'MRC-001', // Modomio
    puntosVentaDisponibles: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true
  },
  {
    id: 'PROD-003',
    nombre: 'Pan Integral',
    categoria: 'Pan',
    precio: 2.90,
    stock: 20,
    descripcion: 'Pan integral con semillas y cereales',
    imagen: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-004',
    nombre: 'Pan de Centeno',
    categoria: 'Pan',
    precio: 3.20,
    stock: 18,
    descripcion: 'Pan de centeno 100% con sabor intenso',
    imagen: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=300&fit=crop'
  },

  // Bollería
  {
    id: 'PROD-005',
    nombre: 'Croissant de Mantequilla',
    categoria: 'Bollería',
    precio: 1.50,
    stock: 40,
    descripcion: 'Croissant francés con mantequilla de calidad',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-006',
    nombre: 'Napolitana de Chocolate',
    categoria: 'Bollería',
    precio: 1.80,
    stock: 30,
    descripcion: 'Napolitana rellena de chocolate belga',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-007',
    nombre: 'Palmera de Chocolate',
    categoria: 'Bollería',
    precio: 2.20,
    stock: 25,
    descripcion: 'Palmera de hojaldre con cobertura de chocolate',
    imagen: 'https://images.unsplash.com/photo-1587241321921-91a834d82e38?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-008',
    nombre: 'Ensaimada Artesanal',
    categoria: 'Bollería',
    precio: 2.50,
    stock: 20,
    descripcion: 'Ensaimada tradicional mallorquina',
    imagen: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-009',
    nombre: 'Donut Glaseado',
    categoria: 'Bollería',
    precio: 1.60,
    stock: 35,
    descripcion: 'Donut esponjoso con glaseado de azúcar',
    imagen: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-010',
    nombre: 'Muffin de Arándanos',
    categoria: 'Bollería',
    precio: 2.80,
    stock: 28,
    descripcion: 'Muffin casero con arándanos frescos',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop'
  },

  // Bocadillos
  {
    id: 'PROD-011',
    nombre: 'Bocadillo de Jamón Ibérico',
    categoria: 'Bocadillos',
    precio: 5.50,
    stock: 15,
    descripcion: 'Pan de baguette con jamón ibérico de bellota',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-012',
    nombre: 'Bocadillo de Tortilla',
    categoria: 'Bocadillos',
    precio: 4.20,
    stock: 20,
    descripcion: 'Tortilla española recién hecha en baguette',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-013',
    nombre: 'Bocadillo Vegetal',
    categoria: 'Bocadillos',
    precio: 3.90,
    stock: 18,
    descripcion: 'Pan integral con vegetales frescos y hummus',
    imagen: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-014',
    nombre: 'Bocadillo de Atún',
    categoria: 'Bocadillos',
    precio: 4.50,
    stock: 16,
    descripcion: 'Atún con tomate, lechuga y huevo',
    imagen: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-015',
    nombre: 'Bocadillo de Queso Manchego',
    categoria: 'Bocadillos',
    precio: 4.80,
    stock: 14,
    descripcion: 'Pan de masa madre con queso manchego curado',
    imagen: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop'
  },

  // Cafés
  {
    id: 'PROD-016',
    nombre: 'Café Espresso',
    categoria: 'Cafés',
    precio: 1.50,
    stock: 100,
    descripcion: 'Espresso intenso de café de origen',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-017',
    nombre: 'Café con Leche',
    categoria: 'Cafés',
    precio: 1.80,
    stock: 100,
    descripcion: 'Espresso con leche vaporizada',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-018',
    nombre: 'Cappuccino',
    categoria: 'Cafés',
    precio: 2.20,
    stock: 100,
    descripcion: 'Espresso con espuma de leche cremosa',
    imagen: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-019',
    nombre: 'Latte Macchiato',
    categoria: 'Cafés',
    precio: 2.50,
    stock: 100,
    descripcion: 'Café con leche vaporizada y un toque de espresso',
    imagen: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-020',
    nombre: 'Café Americano',
    categoria: 'Cafés',
    precio: 1.70,
    stock: 100,
    descripcion: 'Espresso doble con agua caliente',
    imagen: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-021',
    nombre: 'Café Cortado',
    categoria: 'Cafés',
    precio: 1.40,
    stock: 100,
    descripcion: 'Espresso con un toque de leche',
    imagen: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop'
  },

  // Zumos
  {
    id: 'PROD-022',
    nombre: 'Zumo de Naranja Natural',
    categoria: 'Zumos',
    precio: 3.20,
    stock: 50,
    descripcion: 'Zumo recién exprimido de naranjas valencianas',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-023',
    nombre: 'Zumo Verde Detox',
    categoria: 'Zumos',
    precio: 4.50,
    stock: 30,
    descripcion: 'Mezcla de espinacas, manzana verde, pepino y jengibre',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-024',
    nombre: 'Zumo de Frutos Rojos',
    categoria: 'Zumos',
    precio: 4.20,
    stock: 35,
    descripcion: 'Fresas, frambuesas y arándanos naturales',
    imagen: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-025',
    nombre: 'Zumo de Piña y Coco',
    categoria: 'Zumos',
    precio: 3.80,
    stock: 40,
    descripcion: 'Piña natural con leche de coco',
    imagen: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop'
  },

  // Aguas
  {
    id: 'PROD-026',
    nombre: 'Agua Mineral 50cl',
    categoria: 'Aguas',
    precio: 1.20,
    stock: 80,
    descripcion: 'Agua mineral natural sin gas',
    imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-027',
    nombre: 'Agua con Gas 50cl',
    categoria: 'Aguas',
    precio: 1.40,
    stock: 70,
    descripcion: 'Agua mineral con gas',
    imagen: 'https://images.unsplash.com/photo-1627937093124-61f252d55837?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-028',
    nombre: 'Agua Saborizada Limón',
    categoria: 'Aguas',
    precio: 1.80,
    stock: 60,
    descripcion: 'Agua con sabor a limón sin azúcar',
    imagen: 'https://images.unsplash.com/photo-1559839914-17aae19c8d9d?w=400&h=300&fit=crop'
  },

  // Refrescos
  {
    id: 'PROD-029',
    nombre: 'Coca-Cola 33cl',
    categoria: 'Refrescos',
    precio: 2.00,
    stock: 100,
    descripcion: 'Refresco de cola clásico',
    imagen: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-030',
    nombre: 'Fanta Naranja 33cl',
    categoria: 'Refrescos',
    precio: 2.00,
    stock: 80,
    descripcion: 'Refresco con sabor a naranja',
    imagen: 'https://images.unsplash.com/photo-1625740515933-7e6c7e4e5f8e?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-031',
    nombre: 'Sprite 33cl',
    categoria: 'Refrescos',
    precio: 2.00,
    stock: 75,
    descripcion: 'Refresco de lima-limón',
    imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-032',
    nombre: 'Nestea Limón 33cl',
    categoria: 'Refrescos',
    precio: 2.20,
    stock: 70,
    descripcion: 'Té frío con sabor a limón',
    imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
  },
  {
    id: 'PROD-033',
    nombre: 'Aquarius Naranja 33cl',
    categoria: 'Refrescos',
    precio: 2.20,
    stock: 65,
    descripcion: 'Bebida isotónica sabor naranja',
    imagen: 'https://images.unsplash.com/photo-1593643096321-dee9436ce133?w=400&h=300&fit=crop'
  },
];