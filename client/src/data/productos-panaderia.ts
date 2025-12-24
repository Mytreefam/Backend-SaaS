// Productos de Sistema 360 Udar Edge
// Este archivo contiene los productos compartidos entre Cliente, Colaborador y Gerente

export type FamiliaProducto = 
  | 'Pan tradicional'
  | 'Sistema 360 gourmet'
  | 'Bollería'
  | 'Pastelería'
  | 'Galletas y secas'
  | 'Salado / Snacks'
  | 'Productos especiales'
  | 'Complementos'
  | 'Campañas / Temporada';

export type CategoriaProducto =
  // Pan tradicional
  | 'Pan básico'
  | 'Pan tradicional'
  | 'Pan especial'
  | 'Pan candeal'
  | 'Hogazas'
  // Sistema 360 gourmet
  | 'Pan de masa madre'
  | 'Pan aromatizado'
  | 'Pan dulce'
  // Bollería
  | 'Bollería simple'
  | 'Bollería rellena'
  | 'Bollería salada'
  // Pastelería
  | 'Pasteles individuales'
  | 'Tartas'
  | 'Porciones'
  // Galletas y secas
  | 'Galletas artesanas'
  | 'Pasta seca'
  | 'Repostería tradicional'
  // Salado / Snacks
  | 'Bocadillos'
  | 'Empanadas'
  | 'Quiches'
  // Productos especiales
  | 'Sin gluten'
  | 'Sin azúcar'
  | 'Vegano'
  // Complementos
  | 'Bebidas frías'
  | 'Bebidas calientes'
  | 'Productos varios'
  // Campañas / Temporada
  | 'Festivos'
  | 'Verano';

// Interfaz para recetas de productos manufacturados
export interface RecetaIngrediente {
  ingredienteId: string;
  ingredienteNombre: string;
  cantidad: number; // En la unidad del ingrediente (kg, litros, unidades)
  coste: number;    // Coste unitario del ingrediente
}

export interface ProductoPanaderia {
  id: string;
  nombre: string;
  familia: FamiliaProducto;
  categoria: CategoriaProducto;
  precio: number;
  stock: number;
  descripcion: string;
  destacado?: boolean;
  imagen?: string;
  sinGluten?: boolean;
  sinAzucar?: boolean;
  vegano?: boolean;
  temporada?: 'primavera' | 'verano' | 'otoño' | 'invierno' | 'todo el año';
  
  // ⭐ Campos para cálculo de EBITDA
  precioCoste: number;              // Coste real del producto
  tipoProducto?: 'simple' | 'manufacturado' | 'combo'; // Tipo de producto
  receta?: RecetaIngrediente[];     // Receta si es manufacturado
  margenBruto?: number;             // precio - precioCoste (calculado)
  margenPorcentaje?: number;        // (margenBruto / precio) * 100
  
  // ⭐ CONTEXTO MULTIEMPRESA
  empresaId: string;                    // ID de la empresa (EMP-001)
  marcaId: string;                      // ID de la marca (MRC-001, MRC-002)
  puntosVentaDisponibles: string[];     // Array de PDV IDs donde está disponible
  activo?: boolean;                     // Si el producto está activo
}

export const productosPanaderia: ProductoPanaderia[] = [
  // ============================================
  // PAN BÁSICO
  // ============================================
  {
    id: 'PROD-001',
    nombre: 'Barra clásica',
    familia: 'Pan tradicional',
    categoria: 'Pan básico',
    precio: 1.20,
    stock: 50,
    descripcion: 'Barra de pan tradicional de 250g, crujiente por fuera y esponjosa por dentro',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    temporada: 'todo el año',
    // ⭐ Datos de coste
    precioCoste: 0.35,
    tipoProducto: 'manufacturado',
    receta: [
      { ingredienteId: 'ING-001', ingredienteNombre: 'Harina de trigo', cantidad: 0.25, coste: 0.38 }, // 250g × 1.50€/kg
      { ingredienteId: 'ING-015', ingredienteNombre: 'Levadura fresca', cantidad: 0.01, coste: 0.045 }, // 10g × 4.50€/kg
      { ingredienteId: 'ING-030', ingredienteNombre: 'Sal', cantidad: 0.005, coste: 0.004 }, // 5g × 0.80€/kg
      { ingredienteId: 'ING-012', ingredienteNombre: 'Aceite de oliva', cantidad: 0.01, coste: 0.058 } // 10ml × 5.80€/L
    ],
    margenBruto: 0.85,
    margenPorcentaje: 70.8,
    // ⭐ Contexto multiempresa
    empresaId: 'EMP-001',
    marcaId: 'MRC-001', // Modomio
    puntosVentaDisponibles: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true
  },
  {
    id: 'PROD-002',
    nombre: 'Barra rústica',
    familia: 'Pan tradicional',
    categoria: 'Pan básico',
    precio: 1.50,
    stock: 40,
    descripcion: 'Barra rústica con corteza gruesa y miga irregular',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año',
    // ⭐ Datos de coste
    precioCoste: 0.42,
    tipoProducto: 'manufacturado',
    receta: [
      { ingredienteId: 'ING-002', ingredienteNombre: 'Harina integral', cantidad: 0.30, coste: 0.54 }, // 300g × 1.80€/kg
      { ingredienteId: 'ING-015', ingredienteNombre: 'Levadura fresca', cantidad: 0.015, coste: 0.068 },
      { ingredienteId: 'ING-030', ingredienteNombre: 'Sal', cantidad: 0.006, coste: 0.005 }
    ],
    margenBruto: 1.08,
    margenPorcentaje: 72.0
  },
  {
    id: 'PROD-003',
    nombre: 'Baguette',
    familia: 'Pan tradicional',
    categoria: 'Pan básico',
    precio: 1.80,
    stock: 45,
    descripcion: 'Baguette francesa crujiente de 300g',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    temporada: 'todo el año',
    // ⭐ Datos de coste
    precioCoste: 0.48,
    tipoProducto: 'manufacturado',
    receta: [
      { ingredienteId: 'ING-001', ingredienteNombre: 'Harina de trigo', cantidad: 0.30, coste: 0.45 },
      { ingredienteId: 'ING-015', ingredienteNombre: 'Levadura fresca', cantidad: 0.012, coste: 0.054 },
      { ingredienteId: 'ING-030', ingredienteNombre: 'Sal', cantidad: 0.006, coste: 0.005 }
    ],
    margenBruto: 1.32,
    margenPorcentaje: 73.3
  },

  // ============================================
  // PAN TRADICIONAL
  // ============================================
  {
    id: 'PROD-004',
    nombre: 'Pan payés',
    familia: 'Pan tradicional',
    categoria: 'Pan tradicional',
    precio: 2.80,
    stock: 30,
    descripcion: 'Pan payés tradicional catalán de 500g',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año',
    // ⭐ Datos de coste
    precioCoste: 0.78,
    tipoProducto: 'manufacturado',
    receta: [
      { ingredienteId: 'ING-001', ingredienteNombre: 'Harina de trigo', cantidad: 0.50, coste: 0.75 },
      { ingredienteId: 'ING-015', ingredienteNombre: 'Levadura fresca', cantidad: 0.020, coste: 0.09 },
      { ingredienteId: 'ING-030', ingredienteNombre: 'Sal', cantidad: 0.010, coste: 0.008 }
    ],
    margenBruto: 2.02,
    margenPorcentaje: 72.1
  },
  {
    id: 'PROD-005',
    nombre: 'Pan de pueblo',
    familia: 'Pan tradicional',
    categoria: 'Pan tradicional',
    precio: 2.50,
    stock: 35,
    descripcion: 'Pan de pueblo artesanal de 450g',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // HOGAZAS
  // ============================================
  {
    id: 'PROD-006',
    nombre: 'Hogaza gallega',
    familia: 'Pan tradicional',
    categoria: 'Hogazas',
    precio: 4.80,
    stock: 15,
    descripcion: 'Hogaza gallega tradicional de 800g con harina de trigo',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-007',
    nombre: 'Hogaza de trigo',
    familia: 'Pan tradicional',
    categoria: 'Hogazas',
    precio: 4.50,
    stock: 18,
    descripcion: 'Hogaza de trigo integral de 750g',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PAN ESPECIAL
  // ============================================
  {
    id: 'PROD-008',
    nombre: 'Pan integral',
    familia: 'Pan tradicional',
    categoria: 'Pan especial',
    precio: 2.90,
    stock: 25,
    descripcion: 'Pan integral 100% con semillas de sésamo y girasol',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-009',
    nombre: 'Pan multicereales',
    familia: 'Pan tradicional',
    categoria: 'Pan especial',
    precio: 3.20,
    stock: 20,
    descripcion: 'Pan con avena, centeno, mijo y semillas variadas',
    imagen: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-010',
    nombre: 'Pan de centeno',
    familia: 'Pan tradicional',
    categoria: 'Pan especial',
    precio: 3.00,
    stock: 18,
    descripcion: 'Pan de centeno 80% con sabor intenso y textura densa',
    imagen: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-011',
    nombre: 'Pan de espelta',
    familia: 'Pan tradicional',
    categoria: 'Pan especial',
    precio: 3.50,
    stock: 15,
    descripcion: 'Pan de espelta integral ecológica',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PAN CANDEAL
  // ============================================
  {
    id: 'PROD-012',
    nombre: 'Pan candeal',
    familia: 'Pan tradicional',
    categoria: 'Pan candeal',
    precio: 2.40,
    stock: 28,
    descripcion: 'Pan candeal tradicional de Castilla',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-013',
    nombre: 'Viena',
    familia: 'Pan tradicional',
    categoria: 'Pan candeal',
    precio: 2.20,
    stock: 35,
    descripcion: 'Pan de Viena tierno y esponjoso, ideal para bocadillos',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-014',
    nombre: 'Telera',
    familia: 'Pan tradicional',
    categoria: 'Pan candeal',
    precio: 1.50,
    stock: 40,
    descripcion: 'Pan telera suave y alargado de 150g',
    imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PAN DE MASA MADRE
  // ============================================
  {
    id: 'PROD-015',
    nombre: 'Pan de masa madre (trigo)',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan de masa madre',
    precio: 5.50,
    stock: 20,
    descripcion: 'Pan de masa madre con fermentación de 48h, harina de trigo orgánica',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-016',
    nombre: 'Pan de masa madre (centeno)',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan de masa madre',
    precio: 5.80,
    stock: 15,
    descripcion: 'Pan de masa madre de centeno 100%, sabor profundo y corteza crujiente',
    imagen: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-017',
    nombre: 'Pan de masa madre (espelta)',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan de masa madre',
    precio: 6.20,
    stock: 12,
    descripcion: 'Pan de masa madre con harina de espelta integral ecológica',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PAN AROMATIZADO
  // ============================================
  {
    id: 'PROD-018',
    nombre: 'Pan de ajo',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan aromatizado',
    precio: 4.20,
    stock: 22,
    descripcion: 'Pan aromatizado con ajo asado y hierbas frescas',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-019',
    nombre: 'Pan de aceitunas',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan aromatizado',
    precio: 4.50,
    stock: 18,
    descripcion: 'Pan mediterráneo con aceitunas negras kalamata',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-020',
    nombre: 'Pan de tomate seco',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan aromatizado',
    precio: 4.30,
    stock: 20,
    descripcion: 'Pan con tomates secos, orégano y aceite de oliva',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PAN DULCE
  // ============================================
  {
    id: 'PROD-021',
    nombre: 'Brioche',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan dulce',
    precio: 3.80,
    stock: 25,
    descripcion: 'Brioche francés con mantequilla, esponjoso y ligeramente dulce',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-022',
    nombre: 'Suizo',
    familia: 'Sistema 360 gourmet',
    categoria: 'Pan dulce',
    precio: 2.50,
    stock: 30,
    descripcion: 'Pan dulce suizo con crema pastelera',
    imagen: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // BOLLERÍA SIMPLE
  // ============================================
  {
    id: 'PROD-023',
    nombre: 'Croissant',
    familia: 'Bollería',
    categoria: 'Bollería simple',
    precio: 1.60,
    stock: 50,
    descripcion: 'Croissant francés con mantequilla AOP, hojaldrado a mano',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-024',
    nombre: 'Napolitana de chocolate',
    familia: 'Bollería',
    categoria: 'Bollería simple',
    precio: 1.90,
    stock: 45,
    descripcion: 'Napolitana de hojaldre con chocolate belga 70%',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-025',
    nombre: 'Napolitana de crema',
    familia: 'Bollería',
    categoria: 'Bollería simple',
    precio: 1.90,
    stock: 40,
    descripcion: 'Napolitana de hojaldre rellena de crema pastelera',
    imagen: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-026',
    nombre: 'Ensaimada',
    familia: 'Bollería',
    categoria: 'Bollería simple',
    precio: 2.80,
    stock: 30,
    descripcion: 'Ensaimada mallorquina tradicional con manteca',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // BOLLERÍA RELLENA
  // ============================================
  {
    id: 'PROD-027',
    nombre: 'Croissant relleno de chocolate',
    familia: 'Bollería',
    categoria: 'Bollería rellena',
    precio: 2.20,
    stock: 35,
    descripcion: 'Croissant relleno de chocolate belga cremoso',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-028',
    nombre: 'Croissant relleno de crema',
    familia: 'Bollería',
    categoria: 'Bollería rellena',
    precio: 2.20,
    stock: 35,
    descripcion: 'Croissant relleno de crema pastelera casera',
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-029',
    nombre: 'Hojaldre de manzana',
    familia: 'Bollería',
    categoria: 'Bollería rellena',
    precio: 2.60,
    stock: 28,
    descripcion: 'Hojaldre relleno de compota de manzana y canela',
    imagen: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // BOLLERÍA SALADA
  // ============================================
  {
    id: 'PROD-030',
    nombre: 'Hojaldre jamón y queso',
    familia: 'Bollería',
    categoria: 'Bollería salada',
    precio: 2.80,
    stock: 30,
    descripcion: 'Hojaldre relleno de jamón york y queso emmental',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-031',
    nombre: 'Mini pizza',
    familia: 'Bollería',
    categoria: 'Bollería salada',
    precio: 2.50,
    stock: 35,
    descripcion: 'Mini pizza de tomate, mozzarella y orégano',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PASTELES INDIVIDUALES
  // ============================================
  {
    id: 'PROD-032',
    nombre: 'Pastel individual de nata',
    familia: 'Pastelería',
    categoria: 'Pasteles individuales',
    precio: 3.50,
    stock: 20,
    descripcion: 'Pastel individual de nata montada con bizcocho esponjoso',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-033',
    nombre: 'Pastel individual de chocolate',
    familia: 'Pastelería',
    categoria: 'Pasteles individuales',
    precio: 3.80,
    stock: 18,
    descripcion: 'Pastel de chocolate intenso con ganache',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-034',
    nombre: 'Pastel de limón',
    familia: 'Pastelería',
    categoria: 'Pasteles individuales',
    precio: 3.20,
    stock: 22,
    descripcion: 'Pastel de limón con merengue italiano',
    imagen: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // TARTAS
  // ============================================
  {
    id: 'PROD-035',
    nombre: 'Tarta de queso',
    familia: 'Pastelería',
    categoria: 'Tartas',
    precio: 22.00,
    stock: 8,
    descripcion: 'Tarta de queso estilo New York (8 porciones)',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1533134242116-8c84f4b4c2ab?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-036',
    nombre: 'Tarta de manzana',
    familia: 'Pastelería',
    categoria: 'Tartas',
    precio: 18.00,
    stock: 10,
    descripcion: 'Tarta de manzana con canela y crumble (8 porciones)',
    imagen: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-037',
    nombre: 'Tarta sacher',
    familia: 'Pastelería',
    categoria: 'Tartas',
    precio: 24.00,
    stock: 6,
    descripcion: 'Tarta Sacher vienesa con chocolate y mermelada (8 porciones)',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PORCIONES
  // ============================================
  {
    id: 'PROD-038',
    nombre: 'Porción de brownie',
    familia: 'Pastelería',
    categoria: 'Porciones',
    precio: 2.80,
    stock: 30,
    descripcion: 'Brownie de chocolate intenso con nueces',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-039',
    nombre: 'Porción de carrot cake',
    familia: 'Pastelería',
    categoria: 'Porciones',
    precio: 3.20,
    stock: 25,
    descripcion: 'Bizcocho de zanahoria con frosting de queso crema',
    imagen: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // GALLETAS ARTESANAS
  // ============================================
  {
    id: 'PROD-040',
    nombre: 'Galletas de mantequilla',
    familia: 'Galletas y secas',
    categoria: 'Galletas artesanas',
    precio: 8.50,
    stock: 40,
    descripcion: 'Caja de 500g de galletas caseras de mantequilla',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-041',
    nombre: 'Galletas de avena',
    familia: 'Galletas y secas',
    categoria: 'Galletas artesanas',
    precio: 9.00,
    stock: 35,
    descripcion: 'Caja de 500g de galletas integrales de avena con pasas',
    imagen: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-042',
    nombre: 'Cookies con chips',
    familia: 'Galletas y secas',
    categoria: 'Galletas artesanas',
    precio: 9.50,
    stock: 38,
    descripcion: 'Caja de 500g de cookies con chips de chocolate',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PASTA SECA
  // ============================================
  {
    id: 'PROD-043',
    nombre: 'Carquiñolis',
    familia: 'Galletas y secas',
    categoria: 'Pasta seca',
    precio: 7.50,
    stock: 30,
    descripcion: 'Bolsa de 400g de carquiñolis tradicionales',
    imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-044',
    nombre: 'Rosquillas',
    familia: 'Galletas y secas',
    categoria: 'Pasta seca',
    precio: 6.80,
    stock: 35,
    descripcion: 'Bolsa de 400g de rosquillas caseras',
    imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // REPOSTERÍA TRADICIONAL
  // ============================================
  {
    id: 'PROD-045',
    nombre: 'Magdalenas',
    familia: 'Galletas y secas',
    categoria: 'Repostería tradicional',
    precio: 1.50,
    stock: 45,
    descripcion: 'Magdalena casera con aceite de oliva',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-046',
    nombre: 'Coca de llardons',
    familia: 'Galletas y secas',
    categoria: 'Repostería tradicional',
    precio: 2.80,
    stock: 25,
    descripcion: 'Coca tradicional catalana con chicharrones',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-047',
    nombre: 'Coca de frutas',
    familia: 'Galletas y secas',
    categoria: 'Repostería tradicional',
    precio: 2.50,
    stock: 30,
    descripcion: 'Coca dulce con frutas confitadas',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // BOCADILLOS
  // ============================================
  {
    id: 'PROD-048',
    nombre: 'Bocadillo frío',
    familia: 'Salado / Snacks',
    categoria: 'Bocadillos',
    precio: 4.50,
    stock: 25,
    descripcion: 'Bocadillo frío con ingredientes frescos a elegir',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-049',
    nombre: 'Bocadillo caliente',
    familia: 'Salado / Snacks',
    categoria: 'Bocadillos',
    precio: 5.50,
    stock: 20,
    descripcion: 'Bocadillo caliente recién hecho',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // EMPANADAS
  // ============================================
  {
    id: 'PROD-050',
    nombre: 'Empanada de atún',
    familia: 'Salado / Snacks',
    categoria: 'Empanadas',
    precio: 3.50,
    stock: 30,
    descripcion: 'Empanada gallega de atún con pimientos y cebolla',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-051',
    nombre: 'Empanada de carne',
    familia: 'Salado / Snacks',
    categoria: 'Empanadas',
    precio: 3.80,
    stock: 28,
    descripcion: 'Empanada de carne picada con especias',
    imagen: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-052',
    nombre: 'Empanada de espinacas',
    familia: 'Salado / Snacks',
    categoria: 'Empanadas',
    precio: 3.20,
    stock: 25,
    descripcion: 'Empanada de espinacas con pasas y piñones',
    vegano: true,
    imagen: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // QUICHES
  // ============================================
  {
    id: 'PROD-053',
    nombre: 'Quiche lorraine',
    familia: 'Salado / Snacks',
    categoria: 'Quiches',
    precio: 4.50,
    stock: 20,
    descripcion: 'Quiche lorraine con bacon y queso gruyère',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1611270629569-8b357cb88c24?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-054',
    nombre: 'Quiche de verduras',
    familia: 'Salado / Snacks',
    categoria: 'Quiches',
    precio: 4.20,
    stock: 22,
    descripcion: 'Quiche de calabacín, puerro y zanahoria',
    imagen: 'https://images.unsplash.com/photo-1611270629569-8b357cb88c24?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // SIN GLUTEN
  // ============================================
  {
    id: 'PROD-055',
    nombre: 'Pan sin gluten',
    familia: 'Productos especiales',
    categoria: 'Sin gluten',
    precio: 4.50,
    stock: 15,
    descripcion: 'Pan artesanal sin gluten de harina de arroz',
    sinGluten: true,
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-056',
    nombre: 'Galletas sin gluten',
    familia: 'Productos especiales',
    categoria: 'Sin gluten',
    precio: 10.50,
    stock: 20,
    descripcion: 'Caja de 400g de galletas sin gluten',
    sinGluten: true,
    imagen: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-057',
    nombre: 'Bizcocho sin gluten',
    familia: 'Productos especiales',
    categoria: 'Sin gluten',
    precio: 12.00,
    stock: 12,
    descripcion: 'Bizcocho casero sin gluten de limón',
    sinGluten: true,
    imagen: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // SIN AZÚCAR
  // ============================================
  {
    id: 'PROD-058',
    nombre: 'Magdalenas sin azúcar',
    familia: 'Productos especiales',
    categoria: 'Sin azúcar',
    precio: 1.80,
    stock: 25,
    descripcion: 'Magdalenas con edulcorante natural',
    sinAzucar: true,
    imagen: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-059',
    nombre: 'Bizcocho sin azúcar',
    familia: 'Productos especiales',
    categoria: 'Sin azúcar',
    precio: 11.00,
    stock: 10,
    descripcion: 'Bizcocho integral sin azúcar añadido',
    sinAzucar: true,
    imagen: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // VEGANO
  // ============================================
  {
    id: 'PROD-060',
    nombre: 'Brownie vegano',
    familia: 'Productos especiales',
    categoria: 'Vegano',
    precio: 3.20,
    stock: 22,
    descripcion: 'Brownie de chocolate sin ingredientes de origen animal',
    vegano: true,
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-061',
    nombre: 'Pan integral vegano',
    familia: 'Productos especiales',
    categoria: 'Vegano',
    precio: 3.50,
    stock: 18,
    descripcion: 'Pan integral 100% vegano con semillas',
    vegano: true,
    imagen: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // BEBIDAS FRÍAS
  // ============================================
  {
    id: 'PROD-062',
    nombre: 'Agua',
    familia: 'Complementos',
    categoria: 'Bebidas frías',
    precio: 1.20,
    stock: 100,
    descripcion: 'Agua mineral natural 50cl',
    imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-063',
    nombre: 'Refresco',
    familia: 'Complementos',
    categoria: 'Bebidas frías',
    precio: 2.00,
    stock: 80,
    descripcion: 'Refresco variado 33cl',
    imagen: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-064',
    nombre: 'Zumo',
    familia: 'Complementos',
    categoria: 'Bebidas frías',
    precio: 3.50,
    stock: 50,
    descripcion: 'Zumo natural recién exprimido',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // BEBIDAS CALIENTES
  // ============================================
  {
    id: 'PROD-065',
    nombre: 'Café',
    familia: 'Complementos',
    categoria: 'Bebidas calientes',
    precio: 1.50,
    stock: 200,
    descripcion: 'Café espresso 100% arábica',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-066',
    nombre: 'Té',
    familia: 'Complementos',
    categoria: 'Bebidas calientes',
    precio: 1.60,
    stock: 150,
    descripcion: 'Té negro, verde o rojo',
    imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-067',
    nombre: 'Infusión',
    familia: 'Complementos',
    categoria: 'Bebidas calientes',
    precio: 1.60,
    stock: 150,
    descripcion: 'Selección de infusiones variadas',
    imagen: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // PRODUCTOS VARIOS
  // ============================================
  {
    id: 'PROD-068',
    nombre: 'Mermelada',
    familia: 'Complementos',
    categoria: 'Productos varios',
    precio: 5.50,
    stock: 40,
    descripcion: 'Mermelada casera de frutas de temporada (250g)',
    imagen: 'https://images.unsplash.com/photo-1599904149937-a7750297cfc5?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },
  {
    id: 'PROD-069',
    nombre: 'Mantequilla',
    familia: 'Complementos',
    categoria: 'Productos varios',
    precio: 4.20,
    stock: 35,
    descripcion: 'Mantequilla artesana con sal de Ibiza (200g)',
    imagen: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop',
    temporada: 'todo el año'
  },

  // ============================================
  // FESTIVOS
  // ============================================
  {
    id: 'PROD-070',
    nombre: 'Roscón de Reyes',
    familia: 'Campañas / Temporada',
    categoria: 'Festivos',
    precio: 18.00,
    stock: 30,
    descripcion: 'Roscón de Reyes tradicional con nata (8-10 personas)',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&h=300&fit=crop',
    temporada: 'invierno'
  },
  {
    id: 'PROD-071',
    nombre: 'Panellets',
    familia: 'Campañas / Temporada',
    categoria: 'Festivos',
    precio: 12.00,
    stock: 25,
    descripcion: 'Caja de 500g de panellets variados (piñones, almendra, coco)',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
    temporada: 'otoño'
  },
  {
    id: 'PROD-072',
    nombre: 'Coca de Sant Joan',
    familia: 'Campañas / Temporada',
    categoria: 'Festivos',
    precio: 14.00,
    stock: 20,
    descripcion: 'Coca tradicional con fruta confitada y crema',
    imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    temporada: 'verano'
  },

  // ============================================
  // VERANO
  // ============================================
  {
    id: 'PROD-073',
    nombre: 'Helado',
    familia: 'Campañas / Temporada',
    categoria: 'Verano',
    precio: 3.50,
    stock: 60,
    descripcion: 'Helado artesano de sabores variados',
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    temporada: 'verano'
  },
  {
    id: 'PROD-074',
    nombre: 'Granizado',
    familia: 'Campañas / Temporada',
    categoria: 'Verano',
    precio: 2.80,
    stock: 50,
    descripcion: 'Granizado de limón o café',
    imagen: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
    temporada: 'verano'
  },
];

// Función para obtener productos por familia
export function getProductosPorFamilia(familia: FamiliaProducto): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.familia === familia);
}

// Función para obtener productos por categoría
export function getProductosPorCategoria(categoria: CategoriaProducto): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.categoria === categoria);
}

// Función para obtener productos destacados
export function getProductosDestacados(): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.destacado);
}

// Función para obtener productos sin gluten
export function getProductosSinGluten(): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.sinGluten);
}

// Función para obtener productos sin azúcar
export function getProductosSinAzucar(): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.sinAzucar);
}

// Función para obtener productos veganos
export function getProductosVeganos(): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.vegano);
}

// Función para obtener productos por temporada
export function getProductosPorTemporada(temporada: 'primavera' | 'verano' | 'otoño' | 'invierno'): ProductoPanaderia[] {
  return productosPanaderia.filter(p => p.temporada === temporada || p.temporada === 'todo el año');
}