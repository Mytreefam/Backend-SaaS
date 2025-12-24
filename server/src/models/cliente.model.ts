import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const ClienteModel = {
  async findAll() {
    return prisma.cliente.findMany({ include: { direcciones: true, pedidos: true } });
  },
  async findById(id: number) {
    return prisma.cliente.findUnique({ where: { id }, include: { direcciones: true, pedidos: true } });
  },
  async create(data: any) {
    // Permitir avatar, idioma, ciudad
    // Generar 'codigo' SIEMPRE, nunca confiar en el valor recibido
    const clienteData = {
      codigo: `CLI-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      telefono: data.telefono,
      role: data.role || 'cliente',
      avatar: data.avatar,
      ciudad: data.ciudad,
      idioma: data.idioma
    };
    return prisma.cliente.create({ data: clienteData });
  },
  async update(id: number, data: any) {
    // Permitir avatar, idioma, ciudad. Eliminar 'direccion' si viene en data
    const { direccion, ...rest } = data;
    return prisma.cliente.update({ where: { id }, data: rest });
  },
  async delete(id: number) {
    return prisma.cliente.delete({ where: { id } });
  }
};
