/**
 * SERVICIO: Gestión Empresarial Multiempresa
 * Lógica de negocio para filtrado por empresa, marca y punto de venta
 */

import prisma from '../prisma/client';

interface FiltrosEmpresariales {
  empresa_id?: string;
  marca_id?: string | string[];
  punto_venta_id?: string;
}

/**
 * Construir filtros de Prisma según jerarquía empresarial
 */
export function construirFiltrosEmpresariales(filtros: FiltrosEmpresariales) {
  const where: any = {};

  if (filtros.empresa_id && filtros.empresa_id !== 'todas') {
    where.empresaId = filtros.empresa_id;
  }

  if (filtros.marca_id) {
    if (Array.isArray(filtros.marca_id)) {
      where.marcaId = { in: filtros.marca_id };
    } else if (filtros.marca_id !== 'todas') {
      where.marcaId = filtros.marca_id;
    }
  }

  if (filtros.punto_venta_id && filtros.punto_venta_id !== 'todos') {
    where.puntoVentaId = filtros.punto_venta_id;
  }

  return where;
}

/**
 * Validar permisos de acceso según empresa/marca/PDV
 */
export function validarAccesoEmpresarial(
  usuario_empresa_id: string,
  recurso_empresa_id: string
): boolean {
  // DB-backed baseline: a resource belongs to one empresaId and must match.
  // (Gerente overrides should be handled at the route/auth layer.)
  return usuario_empresa_id === recurso_empresa_id;
}

/**
 * Obtener puntos de venta accesibles por un usuario
 */
export async function obtenerPuntosVentaAccesibles(
  usuario_id: string,
  empresa_id?: string
): Promise<string[]> {
  const empleadoId = Number(usuario_id);
  if (!Number.isFinite(empleadoId)) return [];

  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { empresaId: true, puntoVentaId: true },
  });

  if (!empleado) return [];
  if (empresa_id && empleado.empresaId !== empresa_id) return [];
  return empleado.puntoVentaId ? [empleado.puntoVentaId] : [];
}

/**
 * Obtener marcas accesibles por un usuario
 */
export async function obtenerMarcasAccesibles(
  usuario_id: string,
  empresa_id?: string
): Promise<string[]> {
  const empleadoId = Number(usuario_id);
  if (!Number.isFinite(empleadoId)) return [];

  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { empresaId: true, marcaId: true },
  });

  if (!empleado) return [];
  if (empresa_id && empleado.empresaId !== empresa_id) return [];
  return empleado.marcaId ? [empleado.marcaId] : [];
}

export default {
  construirFiltrosEmpresariales,
  validarAccesoEmpresarial,
  obtenerPuntosVentaAccesibles,
  obtenerMarcasAccesibles
};
