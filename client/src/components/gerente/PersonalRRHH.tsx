import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { empleadosApi } from '../../services/api/gerente.api';
import { gerenteConfigApi } from '../../services/api';

type EmpleadoUi = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  foto?: string;
  puesto: string;
  estado: string;
  empresaId: string;
  puntoVentaId: string;
  desempeno: number;
  horasMes: number;
};

export function PersonalRRHH() {
  const [empleados, setEmpleados] = useState<EmpleadoUi[]>([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarNuevoEmpleado, setMostrarNuevoEmpleado] = useState(false);
  const [creandoEmpleado, setCreandoEmpleado] = useState(false);
  const [empleadoCreado, setEmpleadoCreado] = useState<{ nombre: string; email: string; password: string } | null>(null);

  const [empresasConfig, setEmpresasConfig] = useState<any[]>([]);
  const [empresaId, setEmpresaId] = useState<string>('');
  const [puntoVentaId, setPuntoVentaId] = useState<string>('');
  const [form, setForm] = useState({ nombre: '', email: '', puesto: '', telefono: '', password: '' });

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    Promise.all([empleadosApi.obtenerEmpleados(), gerenteConfigApi.empresas.list()])
      .then(([emps, empresas]) => {
        if (cancelled) return;
        setEmpleados(
          (Array.isArray(emps) ? emps : []).map((e: any) => ({
            id: String(e.id),
            nombre: String(e.nombre || ''),
            email: String(e.email || ''),
            telefono: e.telefono ? String(e.telefono) : undefined,
            foto: e.foto ? String(e.foto) : undefined,
            puesto: String(e.puesto || ''),
            estado: String(e.estado || 'activo'),
            empresaId: String(e.empresaId || ''),
            puntoVentaId: String(e.puntoVentaId || ''),
            desempeno: Number(e.desempeno || 0),
            horasMes: Number(e.horasMes || 0),
          })),
        );
        setEmpresasConfig(Array.isArray(empresas) ? empresas : []);
        const firstEmpresa = (Array.isArray(empresas) ? empresas : [])[0] as any;
        const firstEmpresaId = String(firstEmpresa?.id || '').trim();
        if (firstEmpresaId) setEmpresaId(firstEmpresaId);
        const firstPdv = Array.isArray(firstEmpresa?.puntosVenta) ? firstEmpresa.puntosVenta[0] : null;
        const firstPdvId = String(firstPdv?.id || '').trim();
        if (firstPdvId) setPuntoVentaId(firstPdvId);
      })
      .catch((e) => {
        console.error(e);
        toast.error('No se pudieron cargar empleados');
        setEmpleados([]);
        setEmpresasConfig([]);
      })
      .finally(() => setCargando(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const pdvsDisponibles = useMemo(() => {
    const empresa = (empresasConfig || []).find((e: any) => String(e?.id) === String(empresaId));
    const pdvs = Array.isArray(empresa?.puntosVenta) ? empresa.puntosVenta : [];
    return pdvs.map((p: any) => ({ id: String(p.id), nombre: String(p.nombre || p.id) })).filter((x: any) => x.id);
  }, [empresasConfig, empresaId]);

  useEffect(() => {
    if (!puntoVentaId && pdvsDisponibles.length) {
      setPuntoVentaId(pdvsDisponibles[0].id);
    }
  }, [pdvsDisponibles, puntoVentaId]);

  const activos = empleados.filter((e) => e.estado === 'activo').length;
  const avg = empleados.length ? Math.round(empleados.reduce((s, e) => s + (e.desempeno || 0), 0) / empleados.length) : 0;

  const handleCrear = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.puesto.trim()) {
      toast.error('Nombre, email y puesto son obligatorios');
      return;
    }
    if (!empresaId) {
      toast.error('Selecciona una empresa');
      return;
    }

    setCreandoEmpleado(true);
    try {
      const res: any = await empleadosApi.crearEmpleado({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        puesto: form.puesto.trim(),
        telefono: form.telefono.trim(),
        empresaId,
        puntoVentaId: puntoVentaId || undefined,
        password: form.password.trim() || undefined,
      });

      setEmpleadoCreado({
        nombre: res?.nombre || form.nombre.trim(),
        email: res?.email || form.email.trim(),
        password: String(res?.password || form.password.trim() || ''),
      });

      // Refresh list
      const emps = await empleadosApi.obtenerEmpleados();
      setEmpleados(
        (Array.isArray(emps) ? emps : []).map((e: any) => ({
          id: String(e.id),
          nombre: String(e.nombre || ''),
          email: String(e.email || ''),
          telefono: e.telefono ? String(e.telefono) : undefined,
          foto: e.foto ? String(e.foto) : undefined,
          puesto: String(e.puesto || ''),
          estado: String(e.estado || 'activo'),
          empresaId: String(e.empresaId || ''),
          puntoVentaId: String(e.puntoVentaId || ''),
          desempeno: Number(e.desempeno || 0),
          horasMes: Number(e.horasMes || 0),
        })),
      );
      setForm({ nombre: '', email: '', puesto: '', telefono: '', password: '' });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Error al crear empleado');
    } finally {
      setCreandoEmpleado(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Personal
          </h2>
          <p className="text-sm text-gray-600">Empleados reales desde la API</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setMostrarNuevoEmpleado(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo empleado
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Empleados activos</div>
              <div className="text-2xl font-semibold text-gray-900">{activos}</div>
            </div>
            <Users className="w-7 h-7 text-teal-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Desempeño promedio</div>
            <div className="text-2xl font-semibold text-gray-900">{avg}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">Total empleados</div>
            <div className="text-2xl font-semibold text-gray-900">{empleados.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cargando ? (
            <div className="py-10 text-center text-gray-600">Cargando...</div>
          ) : empleados.length === 0 ? (
            <div className="py-10 text-center text-gray-600">Sin empleados</div>
          ) : (
            empleados.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={e.foto} alt={e.nombre} />
                    <AvatarFallback>{e.nombre ? e.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('') : 'E'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{e.nombre}</div>
                    <div className="text-xs text-gray-600 truncate">{e.email}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{e.puesto || '-'}</Badge>
                      <Badge variant="outline" className="text-xs">{e.estado}</Badge>
                      <Badge variant="outline" className="text-xs">{e.puntoVentaId}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Desempeño</div>
                  <div className="font-semibold text-gray-900">{Math.round(e.desempeno || 0)}%</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={mostrarNuevoEmpleado} onOpenChange={(o) => { setMostrarNuevoEmpleado(o); if (!o) setEmpleadoCreado(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear empleado</DialogTitle>
            <DialogDescription>Alta real (crea `Empleado` y usuario de login con role `trabajador`).</DialogDescription>
          </DialogHeader>

          {empleadoCreado ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">Empleado creado:</div>
              <div className="rounded bg-gray-50 p-3 text-sm">
                <div><strong>Nombre:</strong> {empleadoCreado.nombre}</div>
                <div><strong>Email:</strong> {empleadoCreado.email}</div>
                {empleadoCreado.password ? (
                  <div><strong>Contraseña inicial:</strong> <span className="font-mono">{empleadoCreado.password}</span></div>
                ) : (
                  <div className="text-gray-600">No se devolvió contraseña (si definiste una, úsala).</div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { setMostrarNuevoEmpleado(false); setEmpleadoCreado(null); }}>Cerrar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input value={form.nombre} onChange={(ev) => setForm((p) => ({ ...p, nombre: ev.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(ev) => setForm((p) => ({ ...p, email: ev.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Puesto</Label>
                  <Input value={form.puesto} onChange={(ev) => setForm((p) => ({ ...p, puesto: ev.target.value }))} placeholder="Panadero / Cajero / Repartidor" />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input value={form.telefono} onChange={(ev) => setForm((p) => ({ ...p, telefono: ev.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Empresa</Label>
                  <Select value={empresaId} onValueChange={(v) => setEmpresaId(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                    <SelectContent>
                      {(empresasConfig || []).map((e: any) => (
                        <SelectItem key={String(e.id)} value={String(e.id)}>
                          {String(e.nombreComercial || e.nombreFiscal || e.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Punto de venta</Label>
                  <Select value={puntoVentaId} onValueChange={(v) => setPuntoVentaId(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona PDV" /></SelectTrigger>
                    <SelectContent>
                      {pdvsDisponibles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Contraseña inicial (opcional)</Label>
                  <Input value={form.password} onChange={(ev) => setForm((p) => ({ ...p, password: ev.target.value }))} placeholder="Si la dejas vacía, se usa la default del backend" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setMostrarNuevoEmpleado(false)}>Cancelar</Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCrear} disabled={creandoEmpleado}>
                  {creandoEmpleado ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Crear
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}