/**
 * 🧾 Escandallo (Gerente) - API first
 *
 * - Lista escandallos reales desde backend
 * - Permite editar ingredientes y guardar
 * - Sin datos mock
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { escandalloApi } from '../../services/api';
import { productosGerenteApi, stockApi } from '../../services/api/gerente.api';
import { useGerenteEmpresasConfig } from '../../hooks/useGerenteEmpresasConfig';

type ProductoLite = { id: number; nombre: string };
type ArticuloLite = { id: number; nombre: string; unidadMedida?: string; precioUltimaCompra?: number | null };

type IngredienteForm = {
  articuloId: number | null;
  cantidad: number;
  unidad: string;
};

export function Escandallo() {
  const { empresasArray } = useGerenteEmpresasConfig();
  const [empresaId, setEmpresaId] = useState<string>('HOYPCM000');

  const [productos, setProductos] = useState<ProductoLite[]>([]);
  const [articulos, setArticulos] = useState<ArticuloLite[]>([]);
  const [busquedaArticulo, setBusquedaArticulo] = useState<string>('');

  const [escandallos, setEscandallos] = useState<any[]>([]);
  const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (empresaId) return;
    if (empresasArray.length) setEmpresaId(empresasArray[0].id);
  }, [empresasArray, empresaId]);

  const cargar = async () => {
    setLoading(true);
    try {
      const [escs, prods, arts] = await Promise.all([
        escandalloApi.getAll({ empresaId } as any),
        productosGerenteApi.obtenerProductos({ empresa_id: empresaId }),
        stockApi.obtenerArticulos?.({ empresa_id: empresaId } as any),
      ]);

      setEscandallos(Array.isArray(escs) ? escs : []);

      setProductos(
        (Array.isArray(prods) ? prods : []).map((p: any) => ({
          id: Number(p?.id),
          nombre: String(p?.nombre || '').trim(),
        })).filter((p: any) => Number.isFinite(p.id) && p.nombre)
      );

      setArticulos(
        (Array.isArray(arts) ? arts : []).map((a: any) => ({
          id: Number(a?.id),
          nombre: String(a?.nombre || '').trim(),
          unidadMedida: a?.unidadMedida ? String(a.unidadMedida) : (a?.unidad_medida ? String(a.unidad_medida) : undefined),
          precioUltimaCompra: (a?.precioUltimaCompra ?? a?.precio_ultima_compra) != null ? Number(a?.precioUltimaCompra ?? a?.precio_ultima_compra) : null,
        })).filter((a: any) => Number.isFinite(a.id) && a.nombre)
      );
    } catch (e) {
      console.error('Escandallo: cargar error', e);
      toast.error('No se pudo cargar escandallo/productos/stock');
      setEscandallos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  const escandalloSelected = useMemo(() => {
    if (!selectedProductoId) return null;
    return escandallos.find((e: any) => Number(e?.productoId) === Number(selectedProductoId)) || null;
  }, [escandallos, selectedProductoId]);

  useEffect(() => {
    if (!selectedProductoId) {
      setIngredientes([]);
      return;
    }
    (async () => {
      const data = await escandalloApi.getByProductoId(selectedProductoId);
      const ing = (data as any)?.ingredientes ?? [];
      setIngredientes(
        (Array.isArray(ing) ? ing : []).map((i: any) => ({
          articuloId: Number.isFinite(Number(i?.articuloId ?? i?.articulo_id)) ? Number(i?.articuloId ?? i?.articulo_id) : null,
          cantidad: Number(i?.cantidad ?? 0),
          unidad: String(i?.unidad || ''),
        }))
      );
    })();
  }, [selectedProductoId]);

  const articulosFiltrados = useMemo(() => {
    const q = busquedaArticulo.trim().toLowerCase();
    if (!q) return articulos;
    return articulos.filter((a) => a.nombre.toLowerCase().includes(q));
  }, [articulos, busquedaArticulo]);

  const addIngrediente = () => {
    setIngredientes((prev) => [...prev, { articuloId: null, cantidad: 0, unidad: '' }]);
  };

  const removeIngrediente = (idx: number) => {
    setIngredientes((prev) => prev.filter((_, i) => i !== idx));
  };

  const guardar = async () => {
    if (!selectedProductoId) return;
    const ingredientesValidos = ingredientes
      .filter((i) => i.articuloId && i.cantidad > 0)
      .map((i) => ({
        nombre: '', // backend lo puede resolver desde ArticuloStock
        cantidad: Number(i.cantidad),
        unidad: String(i.unidad || ''),
        costeUnitario: 0, // backend recalcula
        articuloId: Number(i.articuloId),
      }));

    setSaving(true);
    try {
      const res = await escandalloApi.guardar(selectedProductoId, ingredientesValidos as any);
      if (!res) throw new Error('SAVE_FAILED');
      toast.success('Escandallo guardado');
      await cargar();
    } catch (e) {
      console.error('Escandallo: guardar error', e);
      toast.error('No se pudo guardar el escandallo');
    } finally {
      setSaving(false);
    }
  };

  const recalcular = async () => {
    try {
      const res = await escandalloApi.recalcular(empresaId as any);
      toast.success('Recalculo completado', { description: `${res.actualizados} actualizados · ${res.errores} errores` });
      await cargar();
    } catch {
      toast.error('No se pudo recalcular');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Escandallo</h2>
          <p className="text-sm text-gray-600">Costes reales por producto (sin mocks).</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={empresaId} onValueChange={setEmpresaId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              {(empresasArray.length ? empresasArray : [{ id: 'HOYPCM000', nombreFiscal: '', nombreComercial: '' }] as any).map((e: any) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={recalcular} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalcular
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selección de producto</CardTitle>
          <CardDescription>Selecciona un producto y edita sus ingredientes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select
            value={selectedProductoId ? String(selectedProductoId) : ''}
            onValueChange={(v) => setSelectedProductoId(v ? Number(v) : null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona producto" />
            </SelectTrigger>
            <SelectContent>
              {productos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {escandalloSelected ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Coste: {Number(escandalloSelected?.costeUnitario ?? 0).toFixed(2)}</Badge>
              <Badge variant="outline">Margen %: {Number(escandalloSelected?.margenPorcentaje ?? 0).toFixed(1)}</Badge>
              <Badge variant="outline">{escandalloSelected?.rentable ? 'Rentable' : 'No rentable'}</Badge>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Ingredientes</CardTitle>
            <CardDescription>Usa artículos reales del stock como ingredientes.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addIngrediente} disabled={!selectedProductoId}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
            <Button onClick={guardar} disabled={!selectedProductoId || saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Buscar artículo</Label>
              <Input value={busquedaArticulo} onChange={(e) => setBusquedaArticulo(e.target.value)} placeholder="Harina, queso…" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artículo</TableHead>
                <TableHead className="w-[140px]">Cantidad</TableHead>
                <TableHead className="w-[140px]">Unidad</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredientes.map((ing, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select
                      value={ing.articuloId ? String(ing.articuloId) : ''}
                      onValueChange={(v) => {
                        const id = v ? Number(v) : null;
                        const art = articulos.find((a) => a.id === id);
                        setIngredientes((prev) =>
                          prev.map((row, i) =>
                            i === idx
                              ? { ...row, articuloId: id, unidad: row.unidad || String(art?.unidadMedida || '') }
                              : row
                          )
                        );
                      }}
                      disabled={!selectedProductoId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona artículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {articulosFiltrados.slice(0, 200).map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={String(ing.cantidad)}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setIngredientes((prev) => prev.map((row, i) => (i === idx ? { ...row, cantidad: Number.isFinite(v) ? v : 0 } : row)));
                      }}
                      disabled={!selectedProductoId}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={ing.unidad}
                      onChange={(e) => setIngredientes((prev) => prev.map((row, i) => (i === idx ? { ...row, unidad: e.target.value } : row)))}
                      disabled={!selectedProductoId}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeIngrediente(idx)} disabled={!selectedProductoId}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {ingredientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-gray-600">
                    {selectedProductoId ? 'Sin ingredientes. Añade uno para empezar.' : 'Selecciona un producto.'}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

