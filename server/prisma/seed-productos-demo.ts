import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Productos demo
  const productos = [
    {
      nombre: 'Combo 1',
      descripcion: 'Hamburguesa clásica con papas y bebida',
      precio: 12.90,
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      stock: 100,
      marcaId: 'MRC-001',
    },
    {
      nombre: 'Combo 2',
      descripcion: 'Doble hamburguesa con papas y bebida',
      precio: 13.90,
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      stock: 100,
      marcaId: 'MRC-002',
    },
    {
      nombre: 'Patatas Deluxe',
      descripcion: 'Patatas con queso y especias',
      precio: 4.20,
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      stock: 100,
      marcaId: 'MRC-001',
    },
    {
      nombre: 'Patatas Delicia',
      descripcion: 'Aros de cebolla y patatas',
      precio: 4.20,
      imagen: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0',
      stock: 100,
      marcaId: 'MRC-002',
    },
    {
      nombre: 'Patatas Supreme',
      descripcion: 'Patatas con salsa especial',
      precio: 4.95,
      imagen: '',
      stock: 100,
      marcaId: 'MRC-001',
    },
    {
      nombre: 'Salchipappa Supreme',
      descripcion: 'Salchichas y papas con salsa',
      precio: 5.95,
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      stock: 100,
      marcaId: 'MRC-002',
    },
    {
      nombre: 'Salchipappa',
      descripcion: 'Salchichas y papas',
      precio: 5.50,
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      stock: 100,
      marcaId: 'MRC-001',
    },
    {
      nombre: 'Black Truffle Burger',
      descripcion: 'Hamburguesa con trufa negra',
      precio: 10.90,
      imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      stock: 100,
      marcaId: 'MRC-002',
    },
  ];

  for (const prod of productos) {
    await prisma.producto.create({ data: prod });
  }

  console.log('Productos demo insertados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
