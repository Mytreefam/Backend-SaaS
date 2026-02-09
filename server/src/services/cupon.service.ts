import { CuponModel } from '../models/cupon.model';
import prisma from '../prisma/client';
import type { AuthRole } from '../types/express';

function parseDescuento(descuento: string, total?: number): { ok: true; value: number } | { ok: false; error: string } {
  const raw = descuento.trim();
  if (!raw) return { ok: false, error: 'Descuento inválido' };

  // "10%" => percentage
  if (raw.endsWith('%')) {
    const pct = Number(raw.slice(0, -1));
    if (!Number.isFinite(pct) || pct <= 0) return { ok: false, error: 'Descuento inválido' };
    if (typeof total !== 'number' || !Number.isFinite(total) || total <= 0) {
      return { ok: false, error: 'Total requerido para cupón porcentual' };
    }
    return { ok: true, value: Number((total * (pct / 100)).toFixed(2)) };
  }

  // "5" => fixed amount
  const fixed = Number(raw);
  if (!Number.isFinite(fixed) || fixed <= 0) return { ok: false, error: 'Descuento inválido' };
  return { ok: true, value: Number(fixed.toFixed(2)) };
}

export const CuponService = {
  getAll: () => CuponModel.findAll(),
  getById: (id: number) => CuponModel.findById(id),
  create: (data: any) => CuponModel.create(data),
  update: (id: number, data: any) => CuponModel.update(id, data),
  delete: (id: number) => CuponModel.delete(id),

  async validar(params: { codigo: string; total?: number; requester: { id: number; role: AuthRole } }) {
    const codigo = params.codigo.trim();
    if (!codigo) {
      return { valido: false, mensaje: 'Código requerido' };
    }

    const cupon = await prisma.cupon.findUnique({ where: { codigo } });
    if (!cupon) return { valido: false, mensaje: 'Cupón no encontrado' };
    if (cupon.usado) return { valido: false, mensaje: 'Cupón ya utilizado' };
    if (cupon.validoHasta.getTime() < Date.now()) {
      return { valido: false, mensaje: 'Cupón expirado' };
    }

    // Ownership: if coupon is bound to a client, only that client (or gerente) can use it
    if (cupon.clienteId && params.requester.role !== 'gerente' && cupon.clienteId !== params.requester.id) {
      return { valido: false, mensaje: 'Cupón no disponible para este usuario' };
    }

    const parsed = parseDescuento(cupon.descuento, params.total);
    if (!parsed.ok) return { valido: false, mensaje: parsed.error };

    return {
      valido: true,
      cupon,
      descuentoCalculado: parsed.value,
      mensaje: 'Cupón válido',
    };
  },
};
