import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Productos
  await prisma.producto.createMany({
    data: [
      {
        nombre: 'Croissant',
        descripcion: 'Croissant de mantequilla',
        precio: 2.5,
        stock: 100,
        imagen: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'
      },
      {
        nombre: 'Baguette',
        descripcion: 'Baguette artesanal',
        precio: 1.8,
        stock: 80,
        imagen: 'https://images.unsplash.com/photo-1612582905318-8db155e9d52e?w=400'
      }
    ]
  });

  // Cupones
  await prisma.cupon.createMany({
    data: [
      {
        codigo: 'DESCUENTO10',
        descripcion: '10% de descuento en tu próxima compra',
        descuento: '10%',
        validoHasta: new Date('2025-12-31'),
        usado: false
      },
      {
        codigo: 'ENVIOGRATIS',
        descripcion: 'Envío gratis en pedidos superiores a 20€',
        descuento: 'Envío Gratis',
        validoHasta: new Date('2025-12-31'),
        usado: false
      }
    ]
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
