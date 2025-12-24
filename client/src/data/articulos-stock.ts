// Artículos de Stock (Compra) - Sistema Udar Edge
// Base de datos de artículos que compramos a proveedores
// Estos artículos pueden convertirse en productos del catálogo para venta

export type CategoriaStock = 
  | 'Bebidas alcohólicas'
  | 'Bebidas frías'
  | 'Bebidas calientes'
  | 'Snacks y aperitivos'
  | 'Lácteos y derivados'
  | 'Bollería industrial'
  | 'Helados'
  | 'Productos de conveniencia'
  | 'Tabacos y vapeadores'
  | 'Otros';

export interface ArticuloStock {
  id: string;
  nombre: string;
  categoria: CategoriaStock;
  precioCoste: number; // Precio de compra al proveedor
  precioVentaSugerido: number; // PVP sugerido
  margen: number; // Margen de beneficio %
  unidad: 'unidad' | 'pack' | 'caja' | 'litro' | 'kg';
  cantidadPorUnidad?: string; // Ej: "330ml", "1L", "500g"
  proveedor: string;
  codigoBarras?: string;
  stock: number;
  stockMinimo: number;
  imagen?: string;
}

export const articulosStock: ArticuloStock[] = [
  // ============================================
  // BEBIDAS ALCOHÓLICAS
  // ============================================
  {
    id: 'STOCK-001',
    nombre: 'Cerveza Estrella Galicia',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 0.65,
    precioVentaSugerido: 1.50,
    margen: 130.77,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Distribuidora Bebidas S.L.',
    codigoBarras: '8410429100001',
    stock: 240,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-002',
    nombre: 'Cerveza Mahou 5 Estrellas',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 0.60,
    precioVentaSugerido: 1.40,
    margen: 133.33,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Distribuidora Bebidas S.L.',
    codigoBarras: '8410329100002',
    stock: 180,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-003',
    nombre: 'Cerveza Alhambra Reserva',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 0.85,
    precioVentaSugerido: 2.00,
    margen: 135.29,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Distribuidora Bebidas S.L.',
    codigoBarras: '8410329100003',
    stock: 120,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-004',
    nombre: 'Cerveza Importación - Heineken',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 0.95,
    precioVentaSugerido: 2.30,
    margen: 142.11,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Importaciones Premium',
    codigoBarras: '8710410329004',
    stock: 96,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-005',
    nombre: 'Cerveza Importación - Corona Extra',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 1.10,
    precioVentaSugerido: 2.80,
    margen: 154.55,
    unidad: 'unidad',
    cantidadPorUnidad: '355ml',
    proveedor: 'Importaciones Premium',
    codigoBarras: '7501058610005',
    stock: 72,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-006',
    nombre: 'Vino Tinto Rioja - Botella',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 4.50,
    precioVentaSugerido: 12.00,
    margen: 166.67,
    unidad: 'unidad',
    cantidadPorUnidad: '750ml',
    proveedor: 'Vinoteca Premium',
    codigoBarras: '8410329200006',
    stock: 48,
    stockMinimo: 12,
    imagen: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-007',
    nombre: 'Vino Blanco Albariño - Botella',
    categoria: 'Bebidas alcohólicas',
    precioCoste: 5.20,
    precioVentaSugerido: 14.00,
    margen: 169.23,
    unidad: 'unidad',
    cantidadPorUnidad: '750ml',
    proveedor: 'Vinoteca Premium',
    codigoBarras: '8410329200007',
    stock: 36,
    stockMinimo: 12,
    imagen: 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=400&h=300&fit=crop'
  },

  // ============================================
  // BEBIDAS FRÍAS
  // ============================================
  {
    id: 'STOCK-008',
    nombre: 'Coca-Cola',
    categoria: 'Bebidas frías',
    precioCoste: 0.45,
    precioVentaSugerido: 1.50,
    margen: 233.33,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Coca-Cola Iberian Partners',
    codigoBarras: '5000112600008',
    stock: 360,
    stockMinimo: 72,
    imagen: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-009',
    nombre: 'Coca-Cola Zero',
    categoria: 'Bebidas frías',
    precioCoste: 0.45,
    precioVentaSugerido: 1.50,
    margen: 233.33,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Coca-Cola Iberian Partners',
    codigoBarras: '5000112600009',
    stock: 288,
    stockMinimo: 72,
    imagen: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-010',
    nombre: 'Fanta Naranja',
    categoria: 'Bebidas frías',
    precioCoste: 0.42,
    precioVentaSugerido: 1.40,
    margen: 233.33,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Coca-Cola Iberian Partners',
    codigoBarras: '5000112600010',
    stock: 240,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-011',
    nombre: 'Sprite',
    categoria: 'Bebidas frías',
    precioCoste: 0.42,
    precioVentaSugerido: 1.40,
    margen: 233.33,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Coca-Cola Iberian Partners',
    codigoBarras: '5000112600011',
    stock: 240,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-012',
    nombre: 'Aquarius Limón',
    categoria: 'Bebidas frías',
    precioCoste: 0.50,
    precioVentaSugerido: 1.60,
    margen: 220.00,
    unidad: 'unidad',
    cantidadPorUnidad: '500ml',
    proveedor: 'Coca-Cola Iberian Partners',
    codigoBarras: '5000112600012',
    stock: 180,
    stockMinimo: 36,
    imagen: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9f?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-013',
    nombre: 'Agua Mineral Natural - Bezoya',
    categoria: 'Bebidas frías',
    precioCoste: 0.25,
    precioVentaSugerido: 1.00,
    margen: 300.00,
    unidad: 'unidad',
    cantidadPorUnidad: '500ml',
    proveedor: 'Distribuidora Bebidas S.L.',
    codigoBarras: '8410329300013',
    stock: 480,
    stockMinimo: 96,
    imagen: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-014',
    nombre: 'Agua con Gas - Vichy Catalán',
    categoria: 'Bebidas frías',
    precioCoste: 0.55,
    precioVentaSugerido: 1.80,
    margen: 227.27,
    unidad: 'unidad',
    cantidadPorUnidad: '500ml',
    proveedor: 'Distribuidora Bebidas S.L.',
    codigoBarras: '8410329300014',
    stock: 240,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9f?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-015',
    nombre: 'Zumo Natural - Minute Maid',
    categoria: 'Bebidas frías',
    precioCoste: 0.85,
    precioVentaSugerido: 2.20,
    margen: 158.82,
    unidad: 'unidad',
    cantidadPorUnidad: '330ml',
    proveedor: 'Coca-Cola Iberian Partners',
    codigoBarras: '5000112600015',
    stock: 144,
    stockMinimo: 36,
    imagen: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-016',
    nombre: 'Red Bull Energy Drink',
    categoria: 'Bebidas frías',
    precioCoste: 1.20,
    precioVentaSugerido: 3.00,
    margen: 150.00,
    unidad: 'unidad',
    cantidadPorUnidad: '250ml',
    proveedor: 'Red Bull España',
    codigoBarras: '9002490100016',
    stock: 120,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1622543925917-763c34f3e569?w=400&h=300&fit=crop'
  },

  // ============================================
  // BEBIDAS CALIENTES
  // ============================================
  {
    id: 'STOCK-017',
    nombre: 'Café en Grano - Lavazza',
    categoria: 'Bebidas calientes',
    precioCoste: 12.50,
    precioVentaSugerido: 25.00,
    margen: 100.00,
    unidad: 'kg',
    cantidadPorUnidad: '1kg',
    proveedor: 'Lavazza Professional',
    codigoBarras: '8000070017017',
    stock: 45,
    stockMinimo: 10,
    imagen: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-018',
    nombre: 'Té Premium - Infusiones Variadas',
    categoria: 'Bebidas calientes',
    precioCoste: 0.15,
    precioVentaSugerido: 1.50,
    margen: 900.00,
    unidad: 'unidad',
    cantidadPorUnidad: '1 bolsita',
    proveedor: 'Twinings España',
    codigoBarras: '4001458018018',
    stock: 500,
    stockMinimo: 100,
    imagen: 'https://images.unsplash.com/photo-1597318130986-f7d7b2d8bc00?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-019',
    nombre: 'Chocolate a la Taza - Valor',
    categoria: 'Bebidas calientes',
    precioCoste: 3.80,
    precioVentaSugerido: 8.50,
    margen: 123.68,
    unidad: 'unidad',
    cantidadPorUnidad: '250g',
    proveedor: 'Chocolates Valor',
    codigoBarras: '8410329400019',
    stock: 60,
    stockMinimo: 12,
    imagen: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=300&fit=crop'
  },

  // ============================================
  // SNACKS Y APERITIVOS
  // ============================================
  {
    id: 'STOCK-020',
    nombre: 'Patatas Fritas Lay\'s Original',
    categoria: 'Snacks y aperitivos',
    precioCoste: 0.65,
    precioVentaSugerido: 1.80,
    margen: 176.92,
    unidad: 'unidad',
    cantidadPorUnidad: '150g',
    proveedor: 'PepsiCo España',
    codigoBarras: '8410329500020',
    stock: 240,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-021',
    nombre: 'Patatas Fritas Lay\'s Campesinas',
    categoria: 'Snacks y aperitivos',
    precioCoste: 0.70,
    precioVentaSugerido: 1.90,
    margen: 171.43,
    unidad: 'unidad',
    cantidadPorUnidad: '150g',
    proveedor: 'PepsiCo España',
    codigoBarras: '8410329500021',
    stock: 180,
    stockMinimo: 36,
    imagen: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-022',
    nombre: 'Doritos Nacho Cheese',
    categoria: 'Snacks y aperitivos',
    precioCoste: 0.75,
    precioVentaSugerido: 2.00,
    margen: 166.67,
    unidad: 'unidad',
    cantidadPorUnidad: '160g',
    proveedor: 'PepsiCo España',
    codigoBarras: '8410329500022',
    stock: 156,
    stockMinimo: 36,
    imagen: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-023',
    nombre: 'Cacahuetes Tostados con Sal',
    categoria: 'Snacks y aperitivos',
    precioCoste: 0.55,
    precioVentaSugerido: 1.50,
    margen: 172.73,
    unidad: 'unidad',
    cantidadPorUnidad: '200g',
    proveedor: 'Frutos Secos Premium',
    codigoBarras: '8410329500023',
    stock: 144,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-024',
    nombre: 'Almendras Marcona Tostadas',
    categoria: 'Snacks y aperitivos',
    precioCoste: 1.80,
    precioVentaSugerido: 4.50,
    margen: 150.00,
    unidad: 'unidad',
    cantidadPorUnidad: '150g',
    proveedor: 'Frutos Secos Premium',
    codigoBarras: '8410329500024',
    stock: 96,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-025',
    nombre: 'Aceitunas Rellenas de Anchoa',
    categoria: 'Snacks y aperitivos',
    precioCoste: 1.20,
    precioVentaSugerido: 3.20,
    margen: 166.67,
    unidad: 'unidad',
    cantidadPorUnidad: '150g',
    proveedor: 'Conservas Gourmet',
    codigoBarras: '8410329500025',
    stock: 72,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&h=300&fit=crop'
  },

  // ============================================
  // LÁCTEOS Y DERIVADOS
  // ============================================
  {
    id: 'STOCK-026',
    nombre: 'Leche Entera - Pascual 1L',
    categoria: 'Lácteos y derivados',
    precioCoste: 0.85,
    precioVentaSugerido: 1.50,
    margen: 76.47,
    unidad: 'litro',
    cantidadPorUnidad: '1L',
    proveedor: 'Lácteos Pascual',
    codigoBarras: '8410329600026',
    stock: 120,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-027',
    nombre: 'Yogur Natural Danone - Pack 4',
    categoria: 'Lácteos y derivados',
    precioCoste: 1.20,
    precioVentaSugerido: 2.40,
    margen: 100.00,
    unidad: 'pack',
    cantidadPorUnidad: '4 unidades',
    proveedor: 'Danone España',
    codigoBarras: '8410329600027',
    stock: 96,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-028',
    nombre: 'Queso Fresco Burgos',
    categoria: 'Lácteos y derivados',
    precioCoste: 2.50,
    precioVentaSugerido: 4.80,
    margen: 92.00,
    unidad: 'unidad',
    cantidadPorUnidad: '400g',
    proveedor: 'Lácteos Premium',
    codigoBarras: '8410329600028',
    stock: 48,
    stockMinimo: 12,
    imagen: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop'
  },

  // ============================================
  // BOLLERÍA INDUSTRIAL
  // ============================================
  {
    id: 'STOCK-029',
    nombre: 'Croissant Mantequilla - Bollycao',
    categoria: 'Bollería industrial',
    precioCoste: 0.35,
    precioVentaSugerido: 1.20,
    margen: 242.86,
    unidad: 'unidad',
    cantidadPorUnidad: '1 unidad',
    proveedor: 'Panrico S.A.',
    codigoBarras: '8410329700029',
    stock: 180,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-030',
    nombre: 'Napolitana Chocolate - Donuts',
    categoria: 'Bollería industrial',
    precioCoste: 0.40,
    precioVentaSugerido: 1.30,
    margen: 225.00,
    unidad: 'unidad',
    cantidadPorUnidad: '1 unidad',
    proveedor: 'Panrico S.A.',
    codigoBarras: '8410329700030',
    stock: 144,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-031',
    nombre: 'Magdalenas - La Bella Easo',
    categoria: 'Bollería industrial',
    precioCoste: 1.10,
    precioVentaSugerido: 2.80,
    margen: 154.55,
    unidad: 'pack',
    cantidadPorUnidad: 'Pack 10',
    proveedor: 'La Bella Easo',
    codigoBarras: '8410329700031',
    stock: 72,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1601000938365-f182c6d06235?w=400&h=300&fit=crop'
  },

  // ============================================
  // HELADOS
  // ============================================
  {
    id: 'STOCK-032',
    nombre: 'Helado Magnum Clásico',
    categoria: 'Helados',
    precioCoste: 1.30,
    precioVentaSugerido: 3.50,
    margen: 169.23,
    unidad: 'unidad',
    cantidadPorUnidad: '120ml',
    proveedor: 'Unilever España',
    codigoBarras: '8410329800032',
    stock: 96,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1497534547324-0ebb3f052e88?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-033',
    nombre: 'Helado Cornetto',
    categoria: 'Helados',
    precioCoste: 0.90,
    precioVentaSugerido: 2.50,
    margen: 177.78,
    unidad: 'unidad',
    cantidadPorUnidad: '90ml',
    proveedor: 'Unilever España',
    codigoBarras: '8410329800033',
    stock: 120,
    stockMinimo: 36,
    imagen: 'https://images.unsplash.com/photo-1497534547324-0ebb3f052e88?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-034',
    nombre: 'Polo Flash - Limón',
    categoria: 'Helados',
    precioCoste: 0.35,
    precioVentaSugerido: 1.20,
    margen: 242.86,
    unidad: 'unidad',
    cantidadPorUnidad: '75ml',
    proveedor: 'Unilever España',
    codigoBarras: '8410329800034',
    stock: 144,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop'
  },

  // ============================================
  // PRODUCTOS DE CONVENIENCIA
  // ============================================
  {
    id: 'STOCK-035',
    nombre: 'KitKat 4 Dedos',
    categoria: 'Productos de conveniencia',
    precioCoste: 0.50,
    precioVentaSugerido: 1.50,
    margen: 200.00,
    unidad: 'unidad',
    cantidadPorUnidad: '41.5g',
    proveedor: 'Nestlé España',
    codigoBarras: '8410329900035',
    stock: 240,
    stockMinimo: 60,
    imagen: 'https://images.unsplash.com/photo-1606312619070-d48b4a0a4bf5?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-036',
    nombre: 'Mars Bar',
    categoria: 'Productos de conveniencia',
    precioCoste: 0.55,
    precioVentaSugerido: 1.60,
    margen: 190.91,
    unidad: 'unidad',
    cantidadPorUnidad: '51g',
    proveedor: 'Mars España',
    codigoBarras: '8410329900036',
    stock: 180,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1585238341710-4a00071548e2?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-037',
    nombre: 'Snickers',
    categoria: 'Productos de conveniencia',
    precioCoste: 0.55,
    precioVentaSugerido: 1.60,
    margen: 190.91,
    unidad: 'unidad',
    cantidadPorUnidad: '50g',
    proveedor: 'Mars España',
    codigoBarras: '8410329900037',
    stock: 180,
    stockMinimo: 48,
    imagen: 'https://images.unsplash.com/photo-1590508280208-2f49c0088c8e?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-038',
    nombre: 'Chicles Orbit - Menta',
    categoria: 'Productos de conveniencia',
    precioCoste: 0.40,
    precioVentaSugerido: 1.20,
    margen: 200.00,
    unidad: 'pack',
    cantidadPorUnidad: '10 grageas',
    proveedor: 'Mars España',
    codigoBarras: '8410329900038',
    stock: 144,
    stockMinimo: 36,
    imagen: 'https://images.unsplash.com/photo-1582192730841-bc48892a0aef?w=400&h=300&fit=crop'
  },

  // ============================================
  // OTROS
  // ============================================
  {
    id: 'STOCK-039',
    nombre: 'Pan de Molde Bimbo',
    categoria: 'Otros',
    precioCoste: 0.95,
    precioVentaSugerido: 2.20,
    margen: 131.58,
    unidad: 'unidad',
    cantidadPorUnidad: '450g',
    proveedor: 'Bimbo España',
    codigoBarras: '8410330000039',
    stock: 72,
    stockMinimo: 24,
    imagen: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop'
  },
  {
    id: 'STOCK-040',
    nombre: 'Pañuelos de Papel Kleenex',
    categoria: 'Otros',
    precioCoste: 0.85,
    precioVentaSugerido: 1.80,
    margen: 111.76,
    unidad: 'pack',
    cantidadPorUnidad: 'Pack 10',
    proveedor: 'Kimberly-Clark',
    codigoBarras: '8410330000040',
    stock: 60,
    stockMinimo: 12,
    imagen: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop'
  },
];

// Función helper para buscar artículos de stock
export const buscarArticuloStock = (id: string): ArticuloStock | undefined => {
  return articulosStock.find(art => art.id === id);
};

// Función para filtrar artículos que ya están en el catálogo
export const obtenerArticulosNoEnCatalogo = (idsProductosCatalogo: string[]): ArticuloStock[] => {
  return articulosStock.filter(art => !idsProductosCatalogo.includes(art.id));
};

// Función para calcular precio de venta según margen
export const calcularPrecioVenta = (precioCoste: number, margenPorcentaje: number): number => {
  return precioCoste * (1 + margenPorcentaje / 100);
};
