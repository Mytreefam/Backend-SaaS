/**
 * 📋 GESTIÓN DE FICHAJES
 * Control de entrada/salida de empleados y validación de horarios
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Clock,
  LogIn,
  LogOut,
  Download,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import gerenteApi from '../../services/api/gerente.api';

interface GestionFichjesProps {
  gerenteId?: string;
  gerenteNombre?: string;
}

export function GestionFichajes({ }: GestionFichjesProps) {
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [fichajes, setFichajes] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para registrar fichaje
  const [modalRegistroFichaje, setModalRegistroFichaje] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [tipoFichaje, setTipoFichaje] = useState('entrada');
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados para ver detalle
  const [modalDetalle, setModalDetalle] = useState(false);
  const [fichajeDetalle, setFichajeDetalle] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [fechaFiltro]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [fichajesData, empleadosData] = await Promise.all([
        gerenteApi.empleados.obtenerTodosFichajes({ fecha_inicio: fechaFiltro, fecha_fin: fechaFiltro }),
        gerenteApi.empleados.obtenerEmpleados()
      ]);

      console.log('Fichajes cargados:', fichajesData);
      console.log('Filtro fecha:', fechaFiltro);
      setFichajes(fichajesData || []);
      setEmpleados(empleadosData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los fichajes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarFichaje = async () => {
    if (!empleadoSeleccionado || !puntoVentaSeleccionado) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      await gerenteApi.empleados.registrarFichaje({
        empleadoId: parseInt(empleadoSeleccionado),
        tipo: tipoFichaje as any,
        puntoVentaId: puntoVentaSeleccionado,
        observaciones: observaciones || undefined,
      });

      toast.success(`Fichaje de ${tipoFichaje} registrado correctamente`);
      setModalRegistroFichaje(false);
      setEmpleadoSeleccionado('');
      setTipoFichaje('entrada');
      setPuntoVentaSeleccionado('');
      setObservaciones('');
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar fichaje:', error);
      toast.error('Error al registrar el fichaje');
    }
  };

  const handleVerDetalle = (fichaje: any) => {
    setFichajeDetalle(fichaje);
    setModalDetalle(true);
  };

  const calcularDiferencia = (horaTeorica: string, horaReal: string): string => {
    if (!horaTeorica || !horaReal) return '—';
    const [hT, mT] = horaTeorica.split(':').map(Number);
    const [hR, mR] = horaReal.split(':').map(Number);
    const minutosTeoricos = hT * 60 + mT;
    const minutosReales = hR * 60 + mR;
    const diferencia = minutosReales - minutosTeoricos;

    if (diferencia === 0) return '0 min';
    if (diferencia > 0) return `+${Math.floor(diferencia / 60)}h ${diferencia % 60}m`;
    return `-${Math.floor(Math.abs(diferencia) / 60)}h ${Math.abs(diferencia) % 60}m`;
  };

  const obtenerEstadoBadge = (diferencia: number) => {
    if (diferencia === 0) return 'default';
    if (diferencia > 0 && diferencia <= 15) return 'secondary';
    if (diferencia > 0) return 'destructive';
    return 'outline';
  };

  const fichajesHoy = fichajes; // Los fichajes ya vienen filtrados de la API por fecha

  return (
    <div className="space-y-4">
      {/* Filtros y Acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Fichajes</CardTitle>
              <CardDescription>
                Control de entradas, salidas y descansos del equipo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="space-y-2">
                <Label htmlFor="fecha-filtro" className="text-sm">Fecha</Label>
                <Input
                  id="fecha-filtro"
                  type="date"
                  value={fechaFiltro}
                  onChange={(e: any) => setFechaFiltro(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button className="self-end gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button 
                onClick={() => setModalRegistroFichaje(true)}
                className="self-end gap-2"
              >
                <LogIn className="w-4 h-4" />
                Registrar Fichaje
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando fichajes...</p>
            </div>
          ) : fichajesHoy.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No hay fichajes registrados para esta fecha</p>
              <Button onClick={() => setModalRegistroFichaje(true)}>
                Registrar Primer Fichaje
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Punto de Venta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Horario Teórico</TableHead>
                    <TableHead className="text-center">Horario Real</TableHead>
                    <TableHead className="text-center">Ajuste</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fichajesHoy.map((fichaje: any) => (
                    <TableRow key={fichaje.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{fichaje.empleadoNombre}</p>
                          <Badge variant="outline" className="text-xs">
                            {fichaje.empleadoPuesto}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          {fichaje.puntoVentaNombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            fichaje.tipo === 'entrada'
                              ? 'default'
                              : fichaje.tipo === 'salida'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="gap-1"
                        >
                          {fichaje.tipo === 'entrada' && <LogIn className="w-3 h-3" />}
                          {fichaje.tipo === 'salida' && <LogOut className="w-3 h-3" />}
                          {fichaje.tipo.charAt(0).toUpperCase() + fichaje.tipo.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {fichaje.horaTeorica || '—'}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {fichaje.horaReal}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={obtenerEstadoBadge(fichaje.diferenciaMinutos) as any}>
                          {calcularDiferencia(fichaje.horaTeorica, fichaje.horaReal)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={fichaje.validado ? 'default' : 'secondary'}>
                          {fichaje.validado ? '✓ Validado' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerDetalle(fichaje)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Registrar Fichaje */}
      <Dialog open={modalRegistroFichaje} onOpenChange={setModalRegistroFichaje}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Fichaje</DialogTitle>
            <DialogDescription>
              Registra una entrada, salida o descanso de un empleado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Empleado */}
            <div className="space-y-2">
              <Label htmlFor="empleado-select">Empleado *</Label>
              <Select value={empleadoSeleccionado} onValueChange={setEmpleadoSeleccionado}>
                <SelectTrigger id="empleado-select" className="w-full">
                  <SelectValue placeholder="Selecciona un empleado" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {(empleados as any[]).length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No hay empleados disponibles</div>
                  ) : (
                    (empleados as any[]).map((empleado) => (
                      <SelectItem key={empleado.id} value={empleado.id.toString()}>
                        {empleado.nombre} - {empleado.puesto}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Fichaje */}
            <div className="space-y-2">
              <Label htmlFor="tipo-select">Tipo de Fichaje *</Label>
              <Select value={tipoFichaje} onValueChange={(val: string) => setTipoFichaje(val)}>
                <SelectTrigger id="tipo-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Entrada
                    </span>
                  </SelectItem>
                  <SelectItem value="salida">
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Salida
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Punto de Venta */}
            <div className="space-y-2">
              <Label htmlFor="pdv-select">Punto de Venta *</Label>
              <Select value={puntoVentaSeleccionado} onValueChange={setPuntoVentaSeleccionado}>
                <SelectTrigger id="pdv-select" className="w-full">
                  <SelectValue placeholder="Selecciona un punto de venta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDV-001">Badalona Centro</SelectItem>
                  <SelectItem value="PDV-002">Tiana</SelectItem>
                  <SelectItem value="PDV-003">Montgat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Input
                id="observaciones"
                placeholder="Agrega notas relevantes..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRegistroFichaje(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrarFichaje}>
              Registrar Fichaje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Detalle */}
      <Dialog open={modalDetalle} onOpenChange={setModalDetalle}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Fichaje</DialogTitle>
            <DialogDescription>
              Información completa del registro
            </DialogDescription>
          </DialogHeader>

          {fichajeDetalle && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Empleado</p>
                  <p className="font-semibold">{(fichajeDetalle as any).empleadoNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Puesto</p>
                  <p className="font-semibold">{(fichajeDetalle as any).empleadoPuesto}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Punto de Venta</p>
                  <p className="font-semibold">{(fichajeDetalle as any).puntoVentaNombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-semibold">{(fichajeDetalle as any).fecha}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horario Teórico</p>
                  <p className="font-semibold">{(fichajeDetalle as any).horaTeorica || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horario Real</p>
                  <p className="font-semibold">{(fichajeDetalle as any).horaReal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diferencia</p>
                  <p className="font-semibold">
                    {calcularDiferencia((fichajeDetalle as any).horaTeorica, (fichajeDetalle as any).horaReal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge variant={(fichajeDetalle as any).validado ? 'default' : 'secondary'}>
                    {(fichajeDetalle as any).validado ? '✓ Validado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              {(fichajeDetalle as any).observaciones && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Observaciones</p>
                  <p className="p-3 bg-gray-50 rounded text-sm">{(fichajeDetalle as any).observaciones}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setModalDetalle(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
