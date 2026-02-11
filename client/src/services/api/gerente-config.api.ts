import { envelopedFetch } from '../http/envelopedFetch';

export interface EmpresaConfigApi {
  id: string;
  activo?: boolean;
  [key: string]: any;
}

export interface AgenteExternoConfigApi {
  id: string;
  activo?: boolean;
  [key: string]: any;
}

export interface TerminalTPVApi {
  id: string;
  puntoVentaId: string;
  numero: number;
  nombre: string;
  tipo: string;
  estado: string;
  marcas: string[];
  activo: boolean;
}

export interface OkrApi {
  id: string;
  empresaId?: string | null;
  equipo: string;
  objetivo: string;
  progreso: number;
  prioridad: string;
  fechaLimite?: string | null;
  responsable?: string | null;
  activo: boolean;
}

export const gerenteConfigApi = {
  empresas: {
    async list(): Promise<EmpresaConfigApi[]> {
      const res = await envelopedFetch<EmpresaConfigApi[]>('/gerente/config/empresas', { method: 'GET' });
      return res.data.data ?? [];
    },
    async upsert(input: EmpresaConfigApi): Promise<EmpresaConfigApi | null> {
      const res = await envelopedFetch<EmpresaConfigApi>('/gerente/config/empresas', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data.data ?? null;
    },
    async delete(id: string): Promise<boolean> {
      await envelopedFetch<{ deleted: boolean }>(`/gerente/config/empresas/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return true;
    },
  },

  agentesExternos: {
    async list(): Promise<AgenteExternoConfigApi[]> {
      const res = await envelopedFetch<AgenteExternoConfigApi[]>('/gerente/config/agentes-externos', { method: 'GET' });
      return res.data.data ?? [];
    },
    async upsert(input: AgenteExternoConfigApi): Promise<AgenteExternoConfigApi | null> {
      const res = await envelopedFetch<AgenteExternoConfigApi>('/gerente/config/agentes-externos', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data.data ?? null;
    },
    async delete(id: string): Promise<boolean> {
      await envelopedFetch<{ deleted: boolean }>(`/gerente/config/agentes-externos/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return true;
    },
  },

  terminales: {
    async list(params?: { puntoVentaId?: string }): Promise<TerminalTPVApi[]> {
      const qs = params?.puntoVentaId ? `?puntoVentaId=${encodeURIComponent(params.puntoVentaId)}` : '';
      const res = await envelopedFetch<TerminalTPVApi[]>(`/gerente/tpv/terminales${qs}`, { method: 'GET' });
      return res.data.data ?? [];
    },
    async upsert(input: TerminalTPVApi): Promise<TerminalTPVApi | null> {
      const res = await envelopedFetch<TerminalTPVApi>('/gerente/tpv/terminales', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data.data ?? null;
    },
    async delete(id: string): Promise<boolean> {
      await envelopedFetch<{ deleted: boolean }>(`/gerente/tpv/terminales/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return true;
    },
  },

  okrs: {
    async list(params?: { empresaId?: string; activo?: boolean }): Promise<OkrApi[]> {
      const q = new URLSearchParams();
      if (params?.empresaId) q.set('empresaId', params.empresaId);
      if (typeof params?.activo === 'boolean') q.set('activo', String(params.activo));
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await envelopedFetch<OkrApi[]>(`/gerente/productividad/okrs${qs}`, { method: 'GET' });
      return res.data.data ?? [];
    },
    async upsert(input: OkrApi): Promise<OkrApi | null> {
      const res = await envelopedFetch<OkrApi>('/gerente/productividad/okrs', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data.data ?? null;
    },
    async delete(id: string): Promise<boolean> {
      await envelopedFetch<{ deleted: boolean }>(`/gerente/productividad/okrs/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return true;
    },
  },
};

