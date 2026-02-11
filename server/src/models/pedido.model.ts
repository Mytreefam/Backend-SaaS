import prisma from '../prisma/client';
import { coercePedidoEstado } from '../domain/pedido-estado';

const clienteSafeSelect = {
  id: true,
  codigo: true,
  nombre: true,
  email: true,
  telefono: true,
  creadoEn: true,
  role: true,
  avatar: true,
  ciudad: true,
  idioma: true,
} as const;

export const PedidoModel = {
  async findAll() {
    return prisma.pedido.findMany({
      include: {
        cliente: { select: clienteSafeSelect },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                precio: true,
                imagen: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  },
  async findById(id: number) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: { select: clienteSafeSelect },
        items: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                precio: true,
                imagen: true,
              },
            },
          },
        },
      },
    });
  },
  async create(data: any) {
      console.log('DEBUG PedidoModel.create payload:', JSON.stringify(data, null, 2));
      // Separar items y el resto de datos
      const { items, ...pedidoData } = data;
      // Elimina cualquier campo 'cliente' que pueda venir en el payload
      const { cliente, ...cleanPedidoData } = pedidoData;

      let clienteId = cleanPedidoData.clienteId;
      
      // Si clienteId es string, buscar por código
      if (typeof clienteId === 'string') {
        const codigo = clienteId.trim();
        // Intentar primero buscar por código
        let clienteEncontrado = await prisma.cliente.findFirst({ where: { codigo } });
        
        // Si no se encuentra por código, intentar buscar por email
        if (!clienteEncontrado) {
          clienteEncontrado = await prisma.cliente.findFirst({ where: { email: codigo } });
        }
        
        // Si aún no se encuentra, intentar como id numérico
        if (!clienteEncontrado && !isNaN(Number(codigo))) {
          clienteEncontrado = await prisma.cliente.findUnique({ where: { id: Number(codigo) } });
        }
        
        if (!clienteEncontrado) {
          throw new Error('Cliente no encontrado: ' + codigo);
        }
        clienteId = clienteEncontrado.id;
      } else if (typeof clienteId === 'number') {
        // Verificar que el cliente existe
        const clienteExiste = await prisma.cliente.findUnique({ where: { id: clienteId } });
        if (!clienteExiste) {
          throw new Error('Cliente no encontrado con id: ' + clienteId);
        }
      }
      
      // Eliminar clienteId del objeto para evitar sobrescribir el valor correcto
      const { clienteId: _, ...rest } = cleanPedidoData;

      return prisma.pedido.create({
        data: {
          ...rest,
          estado: coercePedidoEstado(rest.estado),
          clienteId, // SIEMPRE el valor correcto aquí
          items: { create: items }
        },
        include: { items: true, cliente: { select: clienteSafeSelect } }
      });
  },
  async update(id: number, data: any) {
    const payload = { ...data };
    if (payload.estado !== undefined) {
      payload.estado = coercePedidoEstado(payload.estado);
    }
    return prisma.pedido.update({ where: { id }, data: payload });
  },
  async delete(id: number) {
    return prisma.pedido.delete({ where: { id } });
  }
};
