/**
 * 🎓 FORMACIÓN TRABAJADOR - VISTA COMPLETA
 * 
 * Componente para que el trabajador:
 * - Vea su progreso de onboarding
 * - Acceda a módulos de formación
 * - Complete evaluaciones
 * - Vea certificados obtenidos
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Play,
  Award,
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  TrendingUp,
  Target,
  Calendar,
  Timer,
  AlertCircle,
  Star,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  obtenerFormacionTrabajador,
  obtenerProgresoOnboarding,
  completarModuloFormacion,
  iniciarTarea,
  CATEGORIAS_FORMACION,
  MODULOS_ONBOARDING,
  type TareaBase,
  type CategoriaFormacion,
} from '../../services/formacion.service';

interface FormacionTrabajadorProps {
  trabajadorId: string;
  trabajadorNombre: string;
}

export function FormacionTrabajador({
  trabajadorId,
  trabajadorNombre,
}: FormacionTrabajadorProps) {
  const [modulosFormacion, setModulosFormacion] = useState<TareaBase[]>([]);
  const [progresoOnboarding, setProgresoOnboarding] = useState({
    total: 0,
    completados: 0,
    enProgreso: 0,
    pendientes: 0,
    porcentaje: 0,
    finalizado: false,
  });
  
  const [modalModuloAbierto, setModalModuloAbierto] = useState(false);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<TareaBase | null>(null);
  const [puntuacion, setPuntuacion] = useState('');
  const [comentario, setComentario] = useState('');
  
  useEffect(() => {
    cargarFormacion();
  }, [trabajadorId]);
  
  const cargarFormacion = () => {
    const modulos = obtenerFormacionTrabajador(trabajadorId);
    setModulosFormacion(modulos);
    
    const progreso = obtenerProgresoOnboarding(trabajadorId);
    setProgresoOnboarding(progreso);
  };
  
  const handleIniciarModulo = (moduloId: string) => {
    const resultado = iniciarTarea(moduloId, trabajadorId);
    
    if (resultado) {
      toast.success('Módulo iniciado', {
        description: 'Puedes comenzar con el contenido',
        icon: <Play className="h-4 w-4" />,
      });
      cargarFormacion();
    }
  };
  
  const handleAbrirModalCompletar = (modulo: TareaBase) => {
    setModuloSeleccionado(modulo);
    setModalModuloAbierto(true);
    setPuntuacion('');
    setComentario('');
  };
  
  const handleCompletarModulo = async () => {
    if (!moduloSeleccionado) return;
    
    const puntuacionNum = puntuacion ? parseInt(puntuacion) : undefined;
    
    if (puntuacionNum !== undefined && (puntuacionNum < 0 || puntuacionNum > 100)) {
      toast.error('La puntuación debe estar entre 0 y 100');
      return;
    }
    
    try {
      await completarModuloFormacion({
        moduloId: moduloSeleccionado.id,
        trabajadorId,
        puntuacion: puntuacionNum,
        comentario: comentario || undefined,
      });
      
      toast.success('Módulo completado', {
        description: moduloSeleccionado.requiereAprobacion 
          ? 'El gerente revisará tu evaluación'
          : 'Has completado el módulo exitosamente',
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      
      setModalModuloAbierto(false);
      setModuloSeleccionado(null);
      cargarFormacion();
    } catch (error) {
      toast.error('Error al completar el módulo');
      console.error(error);
    }
  };
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pendiente</Badge>;
      case 'en_progreso':
        return <Badge variant="default" className="gap-1 bg-blue-500"><Play className="h-3 w-3" /> En Progreso</Badge>;
      case 'completada':
        return <Badge variant="default" className="gap-1 bg-yellow-500"><Clock className="h-3 w-3" /> En Revisión</Badge>;
      case 'aprobada':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" /> Completado</Badge>;
      case 'rechazada':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };
  
  const getCategoriaIcon = (categoria?: string) => {
    const icons = {
      onboarding: GraduationCap,
      seguridad: AlertCircle,
      sistemas: BookOpen,
      atencionCliente: Target,
      productos: FileText,
      procedimientos: CheckCircle2,
      normativa: FileText,
      desarrollo: TrendingUp,
    };
    const Icon = icons[categoria as keyof typeof icons] || BookOpen;
    return <Icon className="h-4 w-4" />;
  };
  
  const modulosOnboarding = modulosFormacion.filter(m => 
    m.categoria === 'onboarding' || 
    MODULOS_ONBOARDING.some(mo => mo.id === m.moduloFormacionId)
  );
  
  const modulosAdicionales = modulosFormacion.filter(m => 
    m.categoria !== 'onboarding' && 
    !MODULOS_ONBOARDING.some(mo => mo.id === m.moduloFormacionId)
  );
  
  const modulosPendientes = modulosFormacion.filter(m => 
    m.estado === 'pendiente' || m.estado === 'en_progreso'
  );
  
  const modulosCompletados = modulosFormacion.filter(m => 
    m.estado === 'aprobada'
  );
  
  const modulosEnRevision = modulosFormacion.filter(m => 
    m.estado === 'completada'
  );
  
  const modulosRechazados = modulosFormacion.filter(m => 
    m.estado === 'rechazada'
  );
  
  const calcularPuntuacionPromedio = () => {
    const completados = modulosFormacion.filter(m => m.estado === 'aprobada' && m.puntuacion);
    if (completados.length === 0) return 0;
    const suma = completados.reduce((acc, m) => acc + (m.puntuacion || 0), 0);
    return Math.round(suma / completados.length);
  };
  
  return (
    <div className="space-y-6">
      {/* Eliminamos el header ya que está en el componente padre */}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 mx-auto text-gray-500" />
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{modulosPendientes.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <FileText className="h-8 w-8 mx-auto text-orange-500" />
              <p className="text-sm text-muted-foreground">En Revisión</p>
              <p className="text-2xl font-bold text-orange-600">{modulosEnRevision.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-500" />
              <p className="text-sm text-muted-foreground">Completados</p>
              <p className="text-2xl font-bold text-green-600">{modulosCompletados.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Star className="h-8 w-8 mx-auto text-yellow-500 fill-yellow-500" />
              <p className="text-sm text-muted-foreground">Puntuación</p>
              <p className="text-2xl font-bold">{calcularPuntuacionPromedio()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs principales */}
      <Tabs defaultValue="onboarding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="onboarding" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Onboarding ({modulosOnboarding.length})
          </TabsTrigger>
          <TabsTrigger value="pendientes" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendientes ({modulosPendientes.length})
          </TabsTrigger>
          <TabsTrigger value="completados" className="gap-2">
            <Award className="h-4 w-4" />
            Completados ({modulosCompletados.length})
          </TabsTrigger>
          <TabsTrigger value="todos" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Todos ({modulosFormacion.length})
          </TabsTrigger>
        </TabsList>
        
        {/* TAB 1: ONBOARDING */}
        <TabsContent value="onboarding" className="space-y-4">
          {modulosOnboarding.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay módulos de onboarding asignados</p>
                <p className="text-muted-foreground">Contacta con tu gerente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {!progresoOnboarding.finalizado && (
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Completa tu onboarding para acceder a todas las funcionalidades
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Te faltan {progresoOnboarding.pendientes} módulos por completar
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {modulosOnboarding.map((modulo, index) => (
                <Card 
                  key={modulo.id} 
                  className={modulo.estado === 'aprobada' ? 'opacity-70' : 'border-l-4 border-l-primary'}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <CardTitle className="text-base">{modulo.titulo}</CardTitle>
                        </div>
                        <CardDescription>{modulo.descripcion}</CardDescription>
                        
                        <div className="flex items-center gap-4 pt-2">
                          {modulo.duracionEstimada && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="h-3 w-3" />
                              {modulo.duracionEstimada} min
                            </div>
                          )}
                          {modulo.fechaVencimiento && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Vence: {new Date(modulo.fechaVencimiento).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getEstadoBadge(modulo.estado)}
                        {modulo.puntuacion !== undefined && modulo.estado === 'aprobada' && (
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {modulo.puntuacion}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {modulo.estado === 'rechazada' && modulo.comentarioGerente && (
                      <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg mb-3 border border-red-200">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                          Feedback del gerente:
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {modulo.comentarioGerente}
                        </p>
                      </div>
                    )}
                    
                    {modulo.estado === 'aprobada' && modulo.comentarioGerente && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg mb-3 border border-green-200">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                          Comentarios:
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {modulo.comentarioGerente}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {modulo.urlRecurso && (
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => window.open(modulo.urlRecurso, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Contenido
                        </Button>
                      )}
                      
                      {modulo.estado === 'pendiente' && (
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => handleIniciarModulo(modulo.id)}
                        >
                          <Play className="h-4 w-4" />
                          Iniciar
                        </Button>
                      )}
                      
                      {(modulo.estado === 'en_progreso' || modulo.estado === 'rechazada') && (
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => handleAbrirModalCompletar(modulo)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Completar Módulo
                        </Button>
                      )}
                      
                      {modulo.estado === 'aprobada' && modulo.certificadoUrl && (
                        <Button
                          className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(modulo.certificadoUrl, '_blank')}
                        >
                          <Award className="h-4 w-4" />
                          Ver Certificado
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* TAB 2: PENDIENTES */}
        <TabsContent value="pendientes" className="space-y-4">
          {modulosRechazados.length > 0 && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Módulos Rechazados - Requieren Corrección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modulosRechazados.map(modulo => (
                  <Card key={modulo.id} className="border-red-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getCategoriaIcon(modulo.categoria)}
                            {modulo.titulo}
                          </CardTitle>
                          <CardDescription>{modulo.descripcion}</CardDescription>
                        </div>
                        {getEstadoBadge(modulo.estado)}
                      </div>
                    </CardHeader>
                    {modulo.comentarioGerente && (
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                          <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                            Correcciones necesarias:
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {modulo.comentarioGerente}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {modulo.urlRecurso && (
                            <Button
                              variant="outline"
                              onClick={() => window.open(modulo.urlRecurso, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Revisar Contenido
                            </Button>
                          )}
                          <Button
                            className="flex-1"
                            onClick={() => handleAbrirModalCompletar(modulo)}
                          >
                            Corregir y Reenviar
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
          
          {modulosEnRevision.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  En Revisión del Gerente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {modulosEnRevision.map(modulo => (
                  <Card key={modulo.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getCategoriaIcon(modulo.categoria)}
                            {modulo.titulo}
                          </CardTitle>
                          <CardDescription>
                            Enviado: {new Date(modulo.fechaCompletada!).toLocaleString()}
                          </CardDescription>
                        </div>
                        {getEstadoBadge(modulo.estado)}
                      </div>
                    </CardHeader>
                    {modulo.puntuacion && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Tu puntuación: {modulo.puntuacion}/100
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
          
          {modulosPendientes.filter(m => m.estado !== 'completada').length === 0 && modulosRechazados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">¡Todo al día!</p>
                <p className="text-muted-foreground">No tienes módulos pendientes</p>
              </CardContent>
            </Card>
          ) : (
            modulosPendientes.filter(m => m.estado !== 'completada').map((modulo) => (
              <Card key={modulo.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getCategoriaIcon(modulo.categoria)}
                          {modulo.titulo}
                        </CardTitle>
                        {getEstadoBadge(modulo.estado)}
                      </div>
                      <CardDescription>{modulo.descripcion}</CardDescription>
                      
                      <div className="flex items-center gap-4 pt-2">
                        {modulo.categoria && (
                          <Badge variant="outline">
                            {CATEGORIAS_FORMACION[modulo.categoria as CategoriaFormacion]}
                          </Badge>
                        )}
                        {modulo.duracionEstimada && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            {modulo.duracionEstimada} min
                          </div>
                        )}
                        {modulo.fechaVencimiento && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Vence: {new Date(modulo.fechaVencimiento).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    {modulo.urlRecurso && (
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => window.open(modulo.urlRecurso, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Contenido
                      </Button>
                    )}
                    
                    {modulo.estado === 'pendiente' && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleIniciarModulo(modulo.id)}
                      >
                        <Play className="h-4 w-4" />
                        Iniciar
                      </Button>
                    )}
                    
                    {modulo.estado === 'en_progreso' && (
                      <Button
                        className="gap-2"
                        onClick={() => handleAbrirModalCompletar(modulo)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Completar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        {/* TAB 3: COMPLETADOS */}
        <TabsContent value="completados" className="space-y-4">
          {modulosCompletados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay módulos completados aún</p>
                <p className="text-muted-foreground">Completa tus primeros módulos para verlos aquí</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {modulosCompletados.map((modulo) => (
                <Card key={modulo.id} className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <CardTitle className="text-base">{modulo.titulo}</CardTitle>
                          {modulo.puntuacion !== undefined && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {modulo.puntuacion}/100
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          Completado: {new Date(modulo.fechaAprobada!).toLocaleDateString()}
                          {modulo.categoria && (
                            <> • {CATEGORIAS_FORMACION[modulo.categoria as CategoriaFormacion]}</>
                          )}
                        </CardDescription>
                      </div>
                      
                      {modulo.certificadoUrl && (
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700"
                          onClick={() => window.open(modulo.certificadoUrl, '_blank')}
                        >
                          <Award className="h-4 w-4" />
                          Certificado
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  {modulo.comentarioGerente && (
                    <CardContent>
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                          Comentarios del gerente:
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {modulo.comentarioGerente}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* TAB 4: TODOS */}
        <TabsContent value="todos" className="space-y-4">
          {modulosFormacion.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay módulos de formación asignados</p>
                <p className="text-muted-foreground">Contacta con tu gerente</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {modulosOnboarding.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Onboarding Inicial
                  </h3>
                  <div className="space-y-2 mb-6">
                    {modulosOnboarding.map(modulo => (
                      <Card key={modulo.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {getCategoriaIcon(modulo.categoria)}
                              <div>
                                <p className="font-medium">{modulo.titulo}</p>
                                <p className="text-sm text-muted-foreground">{modulo.descripcion}</p>
                              </div>
                            </div>
                            {getEstadoBadge(modulo.estado)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {modulosAdicionales.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Formación Adicional
                  </h3>
                  <div className="space-y-2">
                    {modulosAdicionales.map(modulo => (
                      <Card key={modulo.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {getCategoriaIcon(modulo.categoria)}
                              <div>
                                <p className="font-medium">{modulo.titulo}</p>
                                <p className="text-sm text-muted-foreground">
                                  {modulo.categoria && CATEGORIAS_FORMACION[modulo.categoria as CategoriaFormacion]}
                                  {modulo.descripcion && ` • ${modulo.descripcion}`}
                                </p>
                              </div>
                            </div>
                            {getEstadoBadge(modulo.estado)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal Completar Módulo */}
      <Dialog open={modalModuloAbierto} onOpenChange={setModalModuloAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completar Módulo de Formación</DialogTitle>
            <DialogDescription>
              {moduloSeleccionado?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          {moduloSeleccionado && (
            <div className="space-y-4">
              {/* Info del módulo */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  {getCategoriaIcon(moduloSeleccionado.categoria)}
                  <span className="text-sm font-medium">
                    {moduloSeleccionado.categoria && 
                      CATEGORIAS_FORMACION[moduloSeleccionado.categoria as CategoriaFormacion]
                    }
                  </span>
                </div>
                <p className="text-sm">{moduloSeleccionado.descripcion}</p>
                {moduloSeleccionado.duracionEstimada && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    Duración estimada: {moduloSeleccionado.duracionEstimada} minutos
                  </p>
                )}
              </div>
              
              {moduloSeleccionado.estado === 'rechazada' && moduloSeleccionado.comentarioGerente && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Correcciones solicitadas:
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {moduloSeleccionado.comentarioGerente}
                  </p>
                </div>
              )}
              
              {/* Puntuación de la evaluación */}
              <div className="space-y-2">
                <Label htmlFor="puntuacion">
                  Puntuación de la Evaluación (0-100)
                </Label>
                <Input
                  id="puntuacion"
                  type="number"
                  value={puntuacion}
                  onChange={(e) => setPuntuacion(e.target.value)}
                  placeholder="Ej: 85"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">
                  Introduce tu puntuación obtenida en la evaluación final del módulo
                </p>
              </div>
              
              {/* Comentarios opcionales */}
              <div className="space-y-2">
                <Label htmlFor="comentario">
                  Comentarios (Opcional)
                </Label>
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Observaciones, dudas o comentarios sobre el módulo..."
                  rows={4}
                />
              </div>
              
              {/* Aviso de aprobación */}
              {moduloSeleccionado.requiereAprobacion && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Este módulo requiere aprobación del gerente para obtener el certificado
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalModuloAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompletarModulo} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {moduloSeleccionado?.requiereAprobacion ? 'Enviar a Revisión' : 'Completar Módulo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}