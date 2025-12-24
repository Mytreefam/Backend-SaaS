import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Progress } from '../ui/progress';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  Calendar,
  Download,
  XCircle,
  AlertCircle,
  Package,
  Award,
  Truck,
  TrendingDown,
  Coffee
} from 'lucide-react';

interface MetricaRendimiento {
  id: string;
  titulo: string;
  valor: number;
  objetivo: number;
  unidad: string;
  tendencia: 'subida' | 'bajada' | 'estable';
  porcentajeCambio: number;
}

interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  fechaLimite: string;
  fechaCompletada?: string;
  aTiempo: boolean;
}

interface Objetivo {
  id: string;
  titulo: string;
  categoria: 'produccion' | 'calidad' | 'reparto' | 'ventas';
  progreso: number;
  meta: number;
  unidad: string;
  icono: any;
  color: string;
}

export function ReportesTrabajador() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [filtroActivo, setFiltroActivo] = useState('rendimiento');

  const metricas: MetricaRendimiento[] = [
    {
      id: '1',
      titulo: 'Pedidos Completados',
      valor: 127,
      objetivo: 150,
      unidad: 'pedidos',
      tendencia: 'subida',
      porcentajeCambio: 15
    },
    {
      id: '2',
      titulo: 'Tiempo Promedio',
      valor: 12,
      objetivo: 15,
      unidad: 'min',
      tendencia: 'bajada',
      porcentajeCambio: -8
    },
    {
      id: '3',
      titulo: 'Calidad Promedio',
      valor: 96,
      objetivo: 95,
      unidad: '%',
      tendencia: 'subida',
      porcentajeCambio: 3
    },
    {
      id: '4',
      titulo: 'Puntualidad',
      valor: 98,
      objetivo: 95,
      unidad: '%',
      tendencia: 'estable',
      porcentajeCambio: 0
    }
  ];

  const tareasPendientes: Tarea[] = [
    {
      id: 'T-001',
      nombre: 'Preparar pedido #2456',
      descripcion: 'Pizza Margarita + Hamburguesa BBQ',
      estado: 'pendiente',
      fechaLimite: '2025-11-14T14:30:00',
      aTiempo: true
    },
    {
      id: 'T-002',
      nombre: 'Reponer ingredientes barra',
      descripcion: 'Tomate, lechuga y queso cheddar',
      estado: 'pendiente',
      fechaLimite: '2025-11-14T15:00:00',
      aTiempo: true
    },
    {
      id: 'T-003',
      nombre: 'Limpiar zona de preparación',
      descripcion: 'Limpieza profunda estación pizzas',
      estado: 'pendiente',
      fechaLimite: '2025-11-14T18:00:00',
      aTiempo: true
    },
    {
      id: 'T-004',
      nombre: 'Entregar pedido #2441',
      descripcion: 'Dirección: Calle Mayor, 45',
      estado: 'pendiente',
      fechaLimite: '2025-11-14T13:45:00',
      aTiempo: false // Fuera de tiempo
    }
  ];

  const tareasRealizadas: Tarea[] = [
    {
      id: 'T-101',
      nombre: 'Preparar pedido #2455',
      descripcion: '2x Pizza Pepperoni + Bebidas',
      estado: 'completada',
      fechaLimite: '2025-11-14T13:00:00',
      fechaCompletada: '2025-11-14T12:45:00',
      aTiempo: true
    },
    {
      id: 'T-102',
      nombre: 'Revisar inventario bebidas',
      descripcion: 'Actualizar stock en sistema',
      estado: 'completada',
      fechaLimite: '2025-11-14T11:00:00',
      fechaCompletada: '2025-11-14T10:55:00',
      aTiempo: true
    },
    {
      id: 'T-103',
      nombre: 'Preparar pedido #2450',
      descripcion: 'Menú Familiar Pizza',
      estado: 'completada',
      fechaLimite: '2025-11-14T12:00:00',
      fechaCompletada: '2025-11-14T11:50:00',
      aTiempo: true
    },
    {
      id: 'T-104',
      nombre: 'Hornear base de pizzas',
      descripcion: '20 bases para turno tarde',
      estado: 'completada',
      fechaLimite: '2025-11-14T10:00:00',
      fechaCompletada: '2025-11-14T10:15:00',
      aTiempo: false // Completada con retraso
    },
    {
      id: 'T-105',
      nombre: 'Preparar pedido #2448',
      descripcion: '3x Hamburguesas + Complementos',
      estado: 'completada',
      fechaLimite: '2025-11-14T11:30:00',
      fechaCompletada: '2025-11-14T11:25:00',
      aTiempo: true
    }
  ];

  const objetivos: Objetivo[] = [
    {
      id: 'OBJ-001',
      titulo: 'Producción Mensual',
      categoria: 'produccion',
      progreso: 480,
      meta: 600,
      unidad: 'pedidos',
      icono: Package,
      color: 'text-blue-600'
    },
    {
      id: 'OBJ-002',
      titulo: 'Calidad de Servicio',
      categoria: 'calidad',
      progreso: 96,
      meta: 95,
      unidad: '%',
      icono: Award,
      color: 'text-green-600'
    },
    {
      id: 'OBJ-003',
      titulo: 'Entregas a Tiempo',
      categoria: 'reparto',
      progreso: 142,
      meta: 150,
      unidad: 'entregas',
      icono: Truck,
      color: 'text-orange-600'
    },
    {
      id: 'OBJ-004',
      titulo: 'Ventas Adicionales',
      categoria: 'ventas',
      progreso: 1850,
      meta: 2000,
      unidad: '€',
      icono: TrendingUp,
      color: 'text-teal-600'
    }
  ];

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subida':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bajada':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const renderTareas = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Tareas Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Clock className="w-5 h-5 text-orange-600" />
              Tareas Pendientes ({tareasPendientes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tareasPendientes.map((tarea) => {
              const fechaLimite = new Date(tarea.fechaLimite);
              const ahora = new Date();
              const tiempoRestante = fechaLimite.getTime() - ahora.getTime();
              const horasRestantes = Math.floor(tiempoRestante / (1000 * 60 * 60));
              const minutosRestantes = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));

              return (
                <div
                  key={tarea.id}
                  className={`p-4 border rounded-lg ${
                    !tarea.aTiempo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{tarea.nombre}</h4>
                        {!tarea.aTiempo && (
                          <Badge className="bg-red-600 text-white">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {tarea.id}
                    </span>
                    <span className={!tarea.aTiempo ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {!tarea.aTiempo ? (
                        'Vencida'
                      ) : tiempoRestante > 0 ? (
                        `${horasRestantes}h ${minutosRestantes}m restantes`
                      ) : (
                        'Vencida'
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Tareas Realizadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Tareas Completadas ({tareasRealizadas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tareasRealizadas.map((tarea) => (
              <div
                key={tarea.id}
                className={`p-4 border rounded-lg ${
                  tarea.aTiempo ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{tarea.nombre}</h4>
                      {tarea.aTiempo ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          A tiempo
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-600 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          Con retraso
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{tarea.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {tarea.id}
                  </span>
                  <span className="text-gray-500">
                    Completada: {new Date(tarea.fechaCompletada!).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderObjetivos = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {objetivos.map((objetivo) => {
          const Icon = objetivo.icono;
          const porcentaje = (objetivo.progreso / objetivo.meta) * 100;
          const cumplido = porcentaje >= 100;

          return (
            <Card key={objetivo.id} className={cumplido ? 'border-green-300 bg-green-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${cumplido ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${objetivo.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{objetivo.titulo}</h3>
                      <Badge variant="outline" className="text-xs">
                        {objetivo.categoria.charAt(0).toUpperCase() + objetivo.categoria.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {cumplido && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {objetivo.progreso}
                    </span>
                    <span className="text-sm text-gray-600">
                      / {objetivo.meta} {objetivo.unidad}
                    </span>
                  </div>

                  <Progress 
                    value={Math.min(porcentaje, 100)} 
                    className={`h-2 ${cumplido ? '[&>div]:bg-green-600' : ''}`}
                  />

                  <div className="flex items-center justify-between text-sm">
                    <span className={porcentaje >= 100 ? 'text-green-600' : 'text-gray-600'}>
                      {porcentaje.toFixed(0)}% completado
                    </span>
                    {!cumplido && (
                      <span className="text-gray-500">
                        Faltan {objetivo.meta - objetivo.progreso} {objetivo.unidad}
                      </span>
                    )}
                    {cumplido && (
                      <span className="text-green-600 font-medium">
                        ¡Objetivo cumplido!
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mi Rendimiento
          </h1>
          <p className="text-gray-600 text-sm">
            Seguimiento de tu desempeño y productividad
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="anio">Año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros superiores (sin "Horas") */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filtroActivo === 'rendimiento' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('rendimiento')}
          className={filtroActivo === 'rendimiento' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Rendimiento
        </Button>
        <Button
          variant={filtroActivo === 'tareas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('tareas')}
          className={filtroActivo === 'tareas' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Tareas
        </Button>
        <Button
          variant={filtroActivo === 'objetivos' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltroActivo('objetivos')}
          className={filtroActivo === 'objetivos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Target className="w-4 h-4 mr-2" />
          Objetivos
        </Button>
      </div>

      {/* Contenido según filtro */}
      {filtroActivo === 'rendimiento' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {metricas.map((metrica) => {
            const porcentajeObjetivo = (metrica.valor / metrica.objetivo) * 100;
            
            return (
              <Card key={metrica.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{metrica.titulo}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {metrica.valor}
                        </span>
                        <span className="text-sm text-gray-500">{metrica.unidad}</span>
                      </div>
                    </div>
                    {getTendenciaIcon(metrica.tendencia)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Objetivo: {metrica.objetivo} {metrica.unidad}</span>
                      <span className={
                        porcentajeObjetivo >= 100 ? 'text-green-600' : 
                        porcentajeObjetivo >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {porcentajeObjetivo.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={Math.min(porcentajeObjetivo, 100)} className="h-2" />
                  </div>

                  {metrica.porcentajeCambio !== 0 && (
                    <p className={`text-xs mt-2 ${
                      metrica.porcentajeCambio > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metrica.porcentajeCambio > 0 ? '+' : ''}{metrica.porcentajeCambio}% vs periodo anterior
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filtroActivo === 'tareas' && renderTareas()}
      {filtroActivo === 'objetivos' && renderObjetivos()}
    </div>
  );
}
