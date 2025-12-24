// ⭐ PRODUCTOS PERSONALIZABLES - SISTEMA MULTIEMPRESA
// Productos con opciones configurables (combos, menús, etc.)

export const productosPersonalizables = [
  {
    id: 'combo-1',
    nombre: 'Combo Satisfayer',
    descripcion: 'Personaliza tu pedido seleccionando las opciones disponibles',
    precio: 15.90,
    categoria: 'Combos',
    stock: 50,
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    // ⭐ Contexto multiempresa
    empresaId: 'EMP-001',
    marcaId: 'MRC-002', // Blackburguer
    puntosVentaDisponibles: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true,
    gruposOpciones: [
      {
        id: 'burger',
        titulo: 'Elige tu Burger',
        descripcion: '2 unidades',
        obligatorio: true,
        minSeleccion: 2,
        maxSeleccion: 2,
        opciones: [
          { id: 'bacon', nombre: 'Bacon Cheeseburger', precioAdicional: 0 },
          { id: 'trufada', nombre: 'Cheeseburger Trufada', precioAdicional: 1.50 },
          { id: 'clasica', nombre: 'Cheeseburger Clásica', precioAdicional: 0 },
          { id: 'doble', nombre: 'Doble Cheeseburger', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'side',
        titulo: 'Elige tu Side',
        descripcion: '1 unidad',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'patatas', nombre: 'Patatas Fritas', precioAdicional: 0 },
          { id: 'onion', nombre: 'Onion Rings', precioAdicional: 1.00 },
          { id: 'nachos', nombre: 'Nachos con Queso', precioAdicional: 1.50 },
          { id: 'ensalada', nombre: 'Ensalada César', precioAdicional: 0.50 },
        ]
      },
      {
        id: 'bebida',
        titulo: 'Elige tu Bebida',
        descripcion: '1 unidad',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'coca', nombre: 'Coca-Cola', precioAdicional: 0 },
          { id: 'fanta', nombre: 'Fanta Naranja', precioAdicional: 0 },
          { id: 'sprite', nombre: 'Sprite', precioAdicional: 0 },
          { id: 'agua', nombre: 'Agua Mineral', precioAdicional: 0 },
          { id: 'cerveza', nombre: 'Cerveza Artesanal', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'extras',
        titulo: 'Extras (Opcional)',
        descripcion: 'Añade lo que quieras',
        obligatorio: false,
        minSeleccion: 0,
        maxSeleccion: 5,
        opciones: [
          { id: 'extra-bacon', nombre: 'Extra Bacon', precioAdicional: 1.50 },
          { id: 'extra-queso', nombre: 'Extra Queso', precioAdicional: 1.00 },
          { id: 'aguacate', nombre: 'Aguacate', precioAdicional: 1.50 },
          { id: 'huevo', nombre: 'Huevo Frito', precioAdicional: 1.00 },
        ]
      }
    ]
  },
  {
    id: 'combo-2',
    nombre: 'Combo Desayuno Premium',
    descripcion: 'Desayuno completo con opciones personalizables',
    precio: 12.90,
    categoria: 'Desayunos',
    stock: 30,
    destacado: true,
    imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
    gruposOpciones: [
      {
        id: 'cafe-tipo',
        titulo: 'Tipo de Café',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'espresso', nombre: 'Espresso', precioAdicional: 0 },
          { id: 'cappuccino', nombre: 'Cappuccino', precioAdicional: 0.50 },
          { id: 'latte', nombre: 'Latte', precioAdicional: 0.50 },
          { id: 'flat-white', nombre: 'Flat White', precioAdicional: 0.80 },
        ]
      },
      {
        id: 'pan',
        titulo: 'Elige tu Pan',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'croissant', nombre: 'Croissant de Mantequilla', precioAdicional: 0 },
          { id: 'tostadas', nombre: 'Tostadas Integrales', precioAdicional: 0 },
          { id: 'bagel', nombre: 'Bagel', precioAdicional: 0.50 },
          { id: 'muffin', nombre: 'Muffin de Arándanos', precioAdicional: 0.80 },
        ]
      },
      {
        id: 'zumo',
        titulo: 'Zumo Natural',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'naranja', nombre: 'Zumo de Naranja', precioAdicional: 0 },
          { id: 'manzana', nombre: 'Zumo de Manzana', precioAdicional: 0 },
          { id: 'piña', nombre: 'Zumo de Piña', precioAdicional: 0.50 },
          { id: 'mixto', nombre: 'Zumo Mixto', precioAdicional: 1.00 },
        ]
      }
    ]
  },
  {
    id: 'pizza-1',
    nombre: 'Pizza Personalizada',
    descripcion: 'Crea tu pizza perfecta con los ingredientes que más te gusten',
    precio: 11.90,
    categoria: 'Pizzas',
    stock: 40,
    destacado: false,
    imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    gruposOpciones: [
      {
        id: 'tamaño',
        titulo: 'Tamaño de Pizza',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'pequeña', nombre: 'Pequeña (25cm)', precioAdicional: 0 },
          { id: 'mediana', nombre: 'Mediana (30cm)', precioAdicional: 2.00 },
          { id: 'grande', nombre: 'Grande (35cm)', precioAdicional: 4.00 },
          { id: 'familiar', nombre: 'Familiar (40cm)', precioAdicional: 6.00 },
        ]
      },
      {
        id: 'masa',
        titulo: 'Tipo de Masa',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'fina', nombre: 'Masa Fina', precioAdicional: 0 },
          { id: 'normal', nombre: 'Masa Normal', precioAdicional: 0 },
          { id: 'gruesa', nombre: 'Masa Gruesa', precioAdicional: 0.50 },
          { id: 'sin-gluten', nombre: 'Masa Sin Gluten', precioAdicional: 2.00 },
        ]
      },
      {
        id: 'ingredientes',
        titulo: 'Ingredientes',
        descripcion: 'Elige hasta 5 ingredientes',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 5,
        opciones: [
          { id: 'jamon', nombre: 'Jamón York', precioAdicional: 1.00 },
          { id: 'pepperoni', nombre: 'Pepperoni', precioAdicional: 1.50 },
          { id: 'champiñones', nombre: 'Champiñones', precioAdicional: 0.80 },
          { id: 'pimientos', nombre: 'Pimientos', precioAdicional: 0.80 },
          { id: 'cebolla', nombre: 'Cebolla', precioAdicional: 0.50 },
          { id: 'aceitunas', nombre: 'Aceitunas', precioAdicional: 0.80 },
          { id: 'piña', nombre: 'Piña', precioAdicional: 0.80 },
          { id: 'queso-extra', nombre: 'Queso Extra', precioAdicional: 1.50 },
        ]
      }
    ]
  },
  {
    id: 'ensalada-1',
    nombre: 'Ensalada Gourmet',
    descripcion: 'Ensalada fresca con tus ingredientes favoritos',
    precio: 9.90,
    categoria: 'Ensaladas',
    stock: 25,
    destacado: false,
    imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    gruposOpciones: [
      {
        id: 'base',
        titulo: 'Base de Ensalada',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'lechuga', nombre: 'Lechuga Iceberg', precioAdicional: 0 },
          { id: 'mix', nombre: 'Mix de Lechugas', precioAdicional: 0.50 },
          { id: 'espinacas', nombre: 'Espinacas Frescas', precioAdicional: 0.50 },
          { id: 'rúcula', nombre: 'Rúcula', precioAdicional: 0.80 },
        ]
      },
      {
        id: 'proteina',
        titulo: 'Proteína',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'pollo', nombre: 'Pollo a la Plancha', precioAdicional: 2.00 },
          { id: 'atun', nombre: 'Atún', precioAdicional: 2.50 },
          { id: 'salmon', nombre: 'Salmón Ahumado', precioAdicional: 3.50 },
          { id: 'tofu', nombre: 'Tofu Marinado', precioAdicional: 2.00 },
          { id: 'sin-proteina', nombre: 'Sin Proteína', precioAdicional: 0 },
        ]
      },
      {
        id: 'toppings',
        titulo: 'Toppings',
        descripcion: 'Elige hasta 4 toppings',
        obligatorio: false,
        minSeleccion: 0,
        maxSeleccion: 4,
        opciones: [
          { id: 'tomate', nombre: 'Tomate Cherry', precioAdicional: 0.50 },
          { id: 'pepino', nombre: 'Pepino', precioAdicional: 0.50 },
          { id: 'zanahoria', nombre: 'Zanahoria Rallada', precioAdicional: 0.50 },
          { id: 'maiz', nombre: 'Maíz', precioAdicional: 0.50 },
          { id: 'aguacate-e', nombre: 'Aguacate', precioAdicional: 1.50 },
          { id: 'queso-feta', nombre: 'Queso Feta', precioAdicional: 1.00 },
        ]
      },
      {
        id: 'aderezo',
        titulo: 'Aderezo',
        obligatorio: true,
        minSeleccion: 1,
        maxSeleccion: 1,
        opciones: [
          { id: 'vinagreta', nombre: 'Vinagreta', precioAdicional: 0 },
          { id: 'cesar', nombre: 'Salsa César', precioAdicional: 0 },
          { id: 'mostaza-miel', nombre: 'Mostaza y Miel', precioAdicional: 0 },
          { id: 'yogur', nombre: 'Salsa de Yogur', precioAdicional: 0 },
        ]
      }
    ]
  }
];
