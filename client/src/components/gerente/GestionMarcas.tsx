/**
 * 🏷️ Gestión de Marcas (Gerente)
 *
 * Fuente de verdad: backend (`/gerente/config/empresas`).
 * La edición/creación de marcas se persiste actualizando la Empresa (upsert).
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Switch } from '../ui/switch';
import { toast } from 'sonner@2.0.3';
import { gerenteConfigApi } from '../../services/api';

type MarcaCfg = {
  id: string;
  codigo?: string | null;
  nombre: string;
  colorIdentidad?: string | null;
  icono?: string | null;
  logoUrl?: string | null;
  activo?: boolean;
};

type EmpresaCfg = any;

function safeStr(v: any): string {
  return String(v ?? '').trim();
}

function buildMarcaIdFromNombre(nombre: string) {
  const base = safeStr(nombre)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12);
  return `MRC-${base || Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function GestionMarcas() {
  const [empresas, setEmpresas] = useState<EmpresaCfg[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [open, setOpen] = useState(false);
  const [empresaIdEditing, setEmpresaIdEditing] = useState<string>('');
  const [marcaEditing, setMarcaEditing] = useState<MarcaCfg | null>(null);
  const [isNew, setIsNew] = useState(false);

  const marcas = useMemo(() => {
    const out: Array<MarcaCfg & { empresaId: string; empresaNombre?: string }> = [];
    for (const e of empresas || []) {
      const empresaId = safeStr((e as any)?.id);
      const empresaNombre = safeStr((e as any)?.nombreComercial || (e as any)?.nombreFiscal || empresaId);
      const ms = Array.isArray((e as any)?.marcas) ? (e as any).marcas : [];
      for (const m of ms) {
        const id = safeStr(m?.id);
        if (!id) continue;
        out.push({
          id,
          codigo: m?.codigo ?? null,
          nombre: safeStr(m?.nombre || id),
          colorIdentidad: m?.colorIdentidad ?? null,
          icono: m?.icono ?? null,
          logoUrl: m?.logoUrl ?? null,
          activo: typeof m?.activo === 'boolean' ? m.activo : true,
          empresaId,
          empresaNombre,
        });
      }
    }
    return out;
  }, [empresas]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await gerenteConfigApi.empresas.list();
        if (cancelled) return;
        setEmpresas(Array.isArray(list) ? list : []);
      } catch (e) {
        if (cancelled) return;
        setEmpresas([]);
        console.error('GestionMarcas: load error', e);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const abrirEditar = (empresaId: string, marca: MarcaCfg) => {
    setEmpresaIdEditing(empresaId);
    setMarcaEditing({ ...marca });
    setIsNew(false);
    setOpen(true);
  };

  const abrirCrear = () => {
    const firstEmpresa = empresas?.[0];
    const empresaId = safeStr((firstEmpresa as any)?.id || 'HOYPCM000');
    setEmpresaIdEditing(empresaId);
    setMarcaEditing({
      id: '',
      codigo: '',
      nombre: '',
      colorIdentidad: '',
      icono: '',
      logoUrl: '',
      activo: true,
    });
    setIsNew(true);
    setOpen(true);
  };

  const guardar = async () => {
    if (!marcaEditing) return;
    const empresaId = safeStr(empresaIdEditing);
    if (!empresaId) {
      toast.error('Empresa inválida');
      return;
    }

    const empresa = (empresas || []).find((e: any) => safeStr(e?.id) === empresaId);
    if (!empresa) {
      toast.error(`Empresa no encontrada: ${empresaId}`);
      return;
    }

    const nombre = safeStr(marcaEditing.nombre);
    if (!nombre) {
      toast.error('Nombre de marca es obligatorio');
      return;
    }

    const marcaId = safeStr(marcaEditing.id) || buildMarcaIdFromNombre(nombre);
    const nextMarca: MarcaCfg = {
      id: marcaId,
      codigo: safeStr(marcaEditing.codigo) || null,
      nombre,
      colorIdentidad: safeStr(marcaEditing.colorIdentidad) || null,
      icono: safeStr(marcaEditing.icono) || null,
      logoUrl: safeStr(marcaEditing.logoUrl) || null,
      activo: typeof marcaEditing.activo === 'boolean' ? marcaEditing.activo : true,
    };

    const currentMarcas = Array.isArray((empresa as any).marcas) ? (empresa as any).marcas : [];
    const existsIdx = currentMarcas.findIndex((m: any) => safeStr(m?.id) === marcaId);
    const updatedMarcas =
      existsIdx >= 0
        ? currentMarcas.map((m: any) => (safeStr(m?.id) === marcaId ? { ...m, ...nextMarca } : m))
        : [...currentMarcas, nextMarca];

    const payload = { ...(empresa as any), id: empresaId, marcas: updatedMarcas };

    setSaving(true);
    try {
      await gerenteConfigApi.empresas.upsert(payload);
      toast.success(isNew ? 'Marca creada' : 'Marca actualizada');
      const list = await gerenteConfigApi.empresas.list();
      setEmpresas(Array.isArray(list) ? list : []);
      setOpen(false);
      setMarcaEditing(null);
    } catch (e) {
      console.error('GestionMarcas: save error', e);
      toast.error('No se pudo guardar la marca');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Marcas</h2>
          <p className="text-sm text-gray-600">Gestiona marcas reales desde la API.</p>
        </div>
        <Button onClick={abrirCrear} disabled={loading}>
          Nueva marca
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-600">Cargando…</div>
          ) : marcas.length === 0 ? (
            <div className="text-sm text-gray-600">No hay marcas registradas.</div>
          ) : (
            <div className="space-y-2">
              {marcas.map((m) => (
                <div key={`${m.empresaId}:${m.id}`} className="flex items-center justify-between gap-3 border rounded-md p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{m.icono || '🏷️'}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.nombre}</div>
                        <div className="text-xs text-gray-600 truncate">
                          {m.id} {m.codigo ? `· ${m.codigo}` : ''} · {m.empresaNombre || m.empresaId}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{m.activo ? 'Activa' : 'Inactiva'}</Badge>
                      {m.colorIdentidad ? <Badge variant="outline">{m.colorIdentidad}</Badge> : null}
                      {m.logoUrl ? <Badge variant="outline">logo</Badge> : null}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => abrirEditar(m.empresaId, m)}>
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Nueva marca' : 'Editar marca'}</DialogTitle>
            <DialogDescription>Se guarda actualizando la empresa propietaria.</DialogDescription>
          </DialogHeader>

          {marcaEditing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Empresa ID</Label>
                  <Input value={empresaIdEditing} onChange={(e) => setEmpresaIdEditing(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>ID Marca</Label>
                  <Input
                    value={marcaEditing.id}
                    onChange={(e) => setMarcaEditing({ ...marcaEditing, id: e.target.value })}
                    placeholder="(auto si vacío)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nombre *</Label>
                  <Input value={marcaEditing.nombre} onChange={(e) => setMarcaEditing({ ...marcaEditing, nombre: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Código</Label>
                  <Input value={marcaEditing.codigo || ''} onChange={(e) => setMarcaEditing({ ...marcaEditing, codigo: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Icono</Label>
                  <Input value={marcaEditing.icono || ''} onChange={(e) => setMarcaEditing({ ...marcaEditing, icono: e.target.value })} placeholder="🍕" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label>Color</Label>
                  <Input
                    value={marcaEditing.colorIdentidad || ''}
                    onChange={(e) => setMarcaEditing({ ...marcaEditing, colorIdentidad: e.target.value })}
                    placeholder="#FF6B35"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Logo URL</Label>
                <Input
                  value={marcaEditing.logoUrl || ''}
                  onChange={(e) => setMarcaEditing({ ...marcaEditing, logoUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>

              <div className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">Activa</div>
                  <div className="text-xs text-gray-600">Controla si la marca aparece en el sistema.</div>
                </div>
                <Switch
                  checked={marcaEditing.activo !== false}
                  onCheckedChange={(checked) => setMarcaEditing({ ...marcaEditing, activo: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

