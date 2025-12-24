// Stock de Ingredientes - Sistema Udar Edge
// Datos mock de ingredientes disponibles para crear productos

export interface Ingrediente {
  id: string;
  nombre: string;
  precioKg: number;
  unidad: 'kg' | 'litros' | 'unidades';
  stock: number;
  categoria: 'harinas' | 'lacteos' | 'azucares' | 'grasas' | 'huevos' | 'levaduras' | 'frutos-secos' | 'chocolate' | 'frutas' | 'especias';
  proveedor?: string;
}

export const stockIngredientes: Ingrediente[] = [
  // Harinas
  {
    id: 'ING-001',
    nombre: 'Harina de trigo',
    precioKg: 1.50,
    unidad: 'kg',
    stock: 250,
    categoria: 'harinas',
    proveedor: 'Molinos del Sur'
  },
  {
    id: 'ING-002',
    nombre: 'Harina integral',
    precioKg: 1.80,
    unidad: 'kg',
    stock: 150,
    categoria: 'harinas',
    proveedor: 'Molinos del Sur'
  },
  {
    id: 'ING-003',
    nombre: 'Harina de centeno',
    precioKg: 2.20,
    unidad: 'kg',
    stock: 80,
    categoria: 'harinas',
    proveedor: 'Molinos del Sur'
  },
  {
    id: 'ING-004',
    nombre: 'Harina de espelta',
    precioKg: 2.80,
    unidad: 'kg',
    stock: 60,
    categoria: 'harinas',
    proveedor: 'BioEco'
  },
  
  // Lácteos
  {
    id: 'ING-005',
    nombre: 'Mantequilla',
    precioKg: 8.50,
    unidad: 'kg',
    stock: 45,
    categoria: 'lacteos',
    proveedor: 'Lácteos Premium'
  },
  {
    id: 'ING-006',
    nombre: 'Leche entera',
    precioKg: 1.20,
    unidad: 'litros',
    stock: 120,
    categoria: 'lacteos',
    proveedor: 'Lácteos Premium'
  },
  {
    id: 'ING-007',
    nombre: 'Nata para cocinar',
    precioKg: 3.50,
    unidad: 'litros',
    stock: 40,
    categoria: 'lacteos',
    proveedor: 'Lácteos Premium'
  },
  {
    id: 'ING-008',
    nombre: 'Queso crema',
    precioKg: 6.20,
    unidad: 'kg',
    stock: 30,
    categoria: 'lacteos',
    proveedor: 'Lácteos Premium'
  },

  // Azúcares
  {
    id: 'ING-009',
    nombre: 'Azúcar blanco',
    precioKg: 1.20,
    unidad: 'kg',
    stock: 200,
    categoria: 'azucares',
    proveedor: 'Distribuidora Central'
  },
  {
    id: 'ING-010',
    nombre: 'Azúcar moreno',
    precioKg: 1.80,
    unidad: 'kg',
    stock: 100,
    categoria: 'azucares',
    proveedor: 'Distribuidora Central'
  },
  {
    id: 'ING-011',
    nombre: 'Miel',
    precioKg: 12.50,
    unidad: 'kg',
    stock: 25,
    categoria: 'azucares',
    proveedor: 'Apicultores del Norte'
  },

  // Grasas
  {
    id: 'ING-012',
    nombre: 'Aceite de oliva',
    precioKg: 5.80,
    unidad: 'litros',
    stock: 60,
    categoria: 'grasas',
    proveedor: 'Oleícola España'
  },
  {
    id: 'ING-013',
    nombre: 'Aceite de girasol',
    precioKg: 2.30,
    unidad: 'litros',
    stock: 80,
    categoria: 'grasas',
    proveedor: 'Distribuidora Central'
  },

  // Huevos
  {
    id: 'ING-014',
    nombre: 'Huevos L',
    precioKg: 3.20,
    unidad: 'unidades',
    stock: 500,
    categoria: 'huevos',
    proveedor: 'Granja San José'
  },

  // Levaduras
  {
    id: 'ING-015',
    nombre: 'Levadura fresca',
    precioKg: 4.50,
    unidad: 'kg',
    stock: 15,
    categoria: 'levaduras',
    proveedor: 'Levaduras Profesional'
  },
  {
    id: 'ING-016',
    nombre: 'Levadura seca',
    precioKg: 18.00,
    unidad: 'kg',
    stock: 8,
    categoria: 'levaduras',
    proveedor: 'Levaduras Profesional'
  },
  {
    id: 'ING-017',
    nombre: 'Impulsor químico',
    precioKg: 6.50,
    unidad: 'kg',
    stock: 12,
    categoria: 'levaduras',
    proveedor: 'Levaduras Profesional'
  },

  // Frutos secos
  {
    id: 'ING-018',
    nombre: 'Almendras',
    precioKg: 12.00,
    unidad: 'kg',
    stock: 35,
    categoria: 'frutos-secos',
    proveedor: 'Frutos Secos Premium'
  },
  {
    id: 'ING-019',
    nombre: 'Nueces',
    precioKg: 14.50,
    unidad: 'kg',
    stock: 25,
    categoria: 'frutos-secos',
    proveedor: 'Frutos Secos Premium'
  },
  {
    id: 'ING-020',
    nombre: 'Avellanas',
    precioKg: 13.20,
    unidad: 'kg',
    stock: 20,
    categoria: 'frutos-secos',
    proveedor: 'Frutos Secos Premium'
  },

  // Chocolate
  {
    id: 'ING-021',
    nombre: 'Chocolate negro 70%',
    precioKg: 15.80,
    unidad: 'kg',
    stock: 40,
    categoria: 'chocolate',
    proveedor: 'Chocolates Belga'
  },
  {
    id: 'ING-022',
    nombre: 'Chocolate con leche',
    precioKg: 12.50,
    unidad: 'kg',
    stock: 35,
    categoria: 'chocolate',
    proveedor: 'Chocolates Belga'
  },
  {
    id: 'ING-023',
    nombre: 'Cacao en polvo',
    precioKg: 8.90,
    unidad: 'kg',
    stock: 30,
    categoria: 'chocolate',
    proveedor: 'Chocolates Belga'
  },

  // Frutas
  {
    id: 'ING-024',
    nombre: 'Manzana',
    precioKg: 2.50,
    unidad: 'kg',
    stock: 80,
    categoria: 'frutas',
    proveedor: 'Frutas Frescas S.L.'
  },
  {
    id: 'ING-025',
    nombre: 'Limón',
    precioKg: 2.80,
    unidad: 'kg',
    stock: 50,
    categoria: 'frutas',
    proveedor: 'Frutas Frescas S.L.'
  },
  {
    id: 'ING-026',
    nombre: 'Naranja',
    precioKg: 2.20,
    unidad: 'kg',
    stock: 60,
    categoria: 'frutas',
    proveedor: 'Frutas Frescas S.L.'
  },
  {
    id: 'ING-027',
    nombre: 'Fresas',
    precioKg: 6.50,
    unidad: 'kg',
    stock: 20,
    categoria: 'frutas',
    proveedor: 'Frutas Frescas S.L.'
  },

  // Especias
  {
    id: 'ING-028',
    nombre: 'Vainilla en rama',
    precioKg: 85.00,
    unidad: 'unidades',
    stock: 50,
    categoria: 'especias',
    proveedor: 'Especias del Mundo'
  },
  {
    id: 'ING-029',
    nombre: 'Canela en polvo',
    precioKg: 18.50,
    unidad: 'kg',
    stock: 5,
    categoria: 'especias',
    proveedor: 'Especias del Mundo'
  },
  {
    id: 'ING-030',
    nombre: 'Sal',
    precioKg: 0.80,
    unidad: 'kg',
    stock: 100,
    categoria: 'especias',
    proveedor: 'Distribuidora Central'
  }
];

// Función helper para buscar ingredientes
export const buscarIngrediente = (id: string): Ingrediente | undefined => {
  return stockIngredientes.find(ing => ing.id === id);
};

// Función para calcular precio total de ingredientes
export const calcularPrecioCosteTotal = (ingredientes: { id: string; cantidad: number }[]): number => {
  return ingredientes.reduce((total, item) => {
    const ingrediente = buscarIngrediente(item.id);
    if (ingrediente) {
      return total + (ingrediente.precioKg * item.cantidad);
    }
    return total;
  }, 0);
};
