import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  FileText,
  Plus,
  Download,
  Upload,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Users,
  Scale,
  Receipt,
  CalendarDays,
  Euro,
  Car,
  Filter,
  Camera,
  Scan,
  Link,
  ShieldCheck,
  FileBadge,
  FolderOpen,
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { EMPRESAS, PUNTOS_VENTA, getNombreEmpresa, getNombrePDV } from '../../constants/empresaConfig';
import { documentacionApi } from '../../services/api/gerente.api';

interface Documento {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string; // Nuevo campo
  fechaSubida: string;
  fechaVencimiento?: string;
  estado: 'vigente' | 'proximo-vencer' | 'vencido' | 'archivado'; // Añadido 'archivado'
  tamaño: string;
  responsable: string;
}

// ========== NUEVAS INTERFACES PARA BBDD ==========

interface DocumentoBBDD {
  doc_id: string; // ID interno único, ej: DOC-001
  empresa_id: string;
  punto_venta_id: string | null;
  categoria_documental: 'sociedad' | 'vehiculos' | 'contratos' | 'licencias' | 'fiscalidad' | 'otros';
  tipo_documento: string; // Legal, Vehículo/Técnico, Permisos, Fiscal, Contrato, General
  nombre_documento: string;
  codigo_referencia: string; // DOC-020
  fecha_subida: Date;
  fecha_vencimiento: Date | null;
  estado: 'vigente' | 'proximo_vencer' | 'caducado' | 'archivado';
  tamano_archivo: number; // en KB
  url_archivo: string;
  responsable: string;
}

interface GastoBBDD {
  gasto_id: string; // GAS-001
  empresa_id: string;
  punto_venta_id: string | null;
  concepto: string;
  proveedor_nombre: string;
  importe: number; // 2 decimales
  fecha_gasto: Date;
  categoria: string; // Suministros, Mantenimiento, Servicios, etc.
  subtipo: string; // Papel, Material oficina, Limpieza, Tecnología
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros';
  centro_coste: string;
  estado: 'registrado' | 'vinculado_evento' | 'contabilizado';
  // Campos nuevos contabilidad
  num_factura: string; // obligatorio
  nif_proveedor: string; // opcional
  // Adjuntos y relaciones
  ticket_url: string;
  evento_id: string | null;
}

interface PagoCalendarioBBDD {
  evento_id: string; // PAG-001
  empresa_id: string;
  punto_venta_id: string | null;
  concepto: string;
  categoria: string; // Alquiler, Nóminas, Seguridad Social
  monto: number;
  fecha: Date;
  estado_pago: 'pendiente' | 'pagado';
  recurrente: boolean;
  frecuencia: string | null; // mensual, anual, etc.
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros';
  gasto_id: string | null; // vinculación a gasto real
}

interface DatosOCR {
  ocr_proveedor_nombre: string;
  ocr_nif_proveedor: string;
  ocr_fecha: string;
  ocr_importe: string;
  ocr_categoria_sugerida: string;
  ocr_num_factura: string;
  ticket_url: string;
}

interface Pago {
  id: string;
  concepto: string;
  categoria: string;
  monto: string;
  fecha: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  recurrente: boolean;
}

interface Gasto {
  id: string;
  concepto: string;
  proveedor: string;
  importe: string;
  fecha: string;
  categoria: string;
  accionAsociada?: string;
  adjunto: string;
}

export function DocumentacionGerente() {
  const [filtroActivo, setFiltroActivo] = useState<'contratos' | 'vehiculos' | 'alquileres' | 'licencias' | 'fiscalidad' | 'otros' | 'gastos' | 'sociedad' | 'agenda'>('sociedad');
  const [modalDocumentoOpen, setModalDocumentoOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalSeleccionGastoOpen, setModalSeleccionGastoOpen] = useState(false);
  
  // ⭐ ESTADOS PARA DATOS REALES DE LA API
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para el formulario de documento
  const [pasoDocumento, setPasoDocumento] = useState<1 | 2>(1); // Nuevo: control de fases
  const [docNombre, setDocNombre] = useState('');
  const [docEmpresa, setDocEmpresa] = useState('');
  const [docPuntoVenta, setDocPuntoVenta] = useState('');
  const [docCategoria, setDocCategoria] = useState<'sociedad' | 'vehiculos' | 'contratos' | 'licencias' | 'fiscalidad' | 'otros'>('sociedad');
  const [docVencimiento, setDocVencimiento] = useState('');
  const [docCoste, setDocCoste] = useState('');
  const [docObservaciones, setDocObservaciones] = useState('');
  const [docCategoriaEBITDA, setDocCategoriaEBITDA] = useState<string>(''); // Nuevo: categoría para EBITDA
  const [leyendoDocumento, setLeyendoDocumento] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  
  const [pasoGasto, setPasoGasto] = useState<'captura' | 'lectura' | 'confirmacion'>(('captura'));
  const [imagenGasto, setImagenGasto] = useState<string | null>(null);
  const [datosGastoLeidos, setDatosGastoLeidos] = useState<DatosOCR | null>(null); // Actualizado con interfaz DatosOCR
  const [accionAsociada, setAccionAsociada] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [todoDia, setTodoDia] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta'>('tarjeta');

  // ⭐ FUNCIONES PARA CARGAR DATOS DE LA API
  const cargarDocumentos = useCallback(async () => {
    try {
      console.log('📥 Cargando documentos...');
      const data = await documentacionApi.obtenerDocumentos({ empresa_id: '1' });
      console.log('📥 Documentos recibidos:', data);
      
      // Mapear datos del backend al formato del frontend
      const documentosMapeados = (data || []).map((doc: any) => ({
        id: doc.codigo || `DOC-${doc.id}`,
        nombre: doc.nombre,
        categoria: mapearCategoriaBackend(doc.categoria),
        tipo: doc.tipo || 'General',
        fechaSubida: doc.creadoEn ? new Date(doc.creadoEn).toLocaleDateString('es-ES') : '',
        fechaVencimiento: doc.fechaVencimiento ? new Date(doc.fechaVencimiento).toLocaleDateString('es-ES') : undefined,
        estado: mapearEstadoBackend(doc.estado),
        tamaño: doc.tamanoArchivo ? `${(doc.tamanoArchivo / 1024).toFixed(1)} KB` : 'N/A',
        responsable: doc.responsable || doc.subidoPor?.nombre || 'Admin',
        _id: doc.id // Guardar ID real para operaciones
      }));
      
      setDocumentos(documentosMapeados);
    } catch (error) {
      console.error('❌ Error cargando documentos:', error);
      toast.error('Error al cargar documentos');
    }
  }, []);

  const cargarGastos = useCallback(async () => {
    try {
      console.log('📥 Cargando gastos...');
      const data = await documentacionApi.obtenerGastos({ empresa_id: '1' });
      console.log('📥 Gastos recibidos:', data);
      
      const gastosMapeados = (data || []).map((gasto: any) => ({
        id: gasto.codigo || `GAS-${gasto.id}`,
        concepto: gasto.concepto,
        proveedor: gasto.proveedorNombre || '',
        importe: `${gasto.total?.toFixed(2) || '0.00'} €`,
        fecha: gasto.fechaGasto ? new Date(gasto.fechaGasto).toISOString().split('T')[0] : '',
        categoria: gasto.categoria || 'Otros',
        adjunto: gasto.ticketUrl || gasto.facturaUrl || '',
        _id: gasto.id
      }));
      
      setGastos(gastosMapeados);
    } catch (error) {
      console.error('❌ Error cargando gastos:', error);
      toast.error('Error al cargar gastos');
    }
  }, []);

  const cargarPagosCalendario = useCallback(async () => {
    try {
      console.log('📥 Cargando pagos calendario...');
      const data = await documentacionApi.obtenerPagosCalendario({ empresa_id: '1' });
      console.log('📥 Pagos recibidos:', data);
      
      const pagosMapeados = (data || []).map((pago: any) => ({
        id: pago.codigo || `PAG-${pago.id}`,
        concepto: pago.concepto,
        categoria: pago.categoria || 'Otros',
        monto: `${pago.monto?.toFixed(2) || '0.00'} €`,
        fecha: pago.fecha ? new Date(pago.fecha).toISOString().split('T')[0] : '',
        estado: pago.estadoPago || 'pendiente',
        recurrente: pago.recurrente || false,
        _id: pago.id
      }));
      
      setPagos(pagosMapeados);
    } catch (error) {
      console.error('❌ Error cargando pagos:', error);
      toast.error('Error al cargar calendario de pagos');
    }
  }, []);

  // Función auxiliar para mapear categorías del backend
  const mapearCategoriaBackend = (categoria: string): string => {
    const mapa: Record<string, string> = {
      'sociedad': 'Sociedad',
      'vehiculos': 'Vehículos',
      'contratos': 'Contratos Empleados',
      'licencias': 'Licencias',
      'fiscalidad': 'Fiscalidad',
      'alquileres': 'Contratos Alquiler',
      'otros': 'Otros'
    };
    return mapa[categoria] || categoria;
  };

  // Función auxiliar para mapear estados del backend
  const mapearEstadoBackend = (estado: string): 'vigente' | 'proximo-vencer' | 'vencido' | 'archivado' => {
    const mapa: Record<string, 'vigente' | 'proximo-vencer' | 'vencido' | 'archivado'> = {
      'vigente': 'vigente',
      'proximo_vencer': 'proximo-vencer',
      'caducado': 'vencido',
      'archivado': 'archivado'
    };
    return mapa[estado] || 'vigente';
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      await Promise.all([
        cargarDocumentos(),
        cargarGastos(),
        cargarPagosCalendario()
      ]);
      setCargando(false);
    };
    cargarTodo();
  }, [cargarDocumentos, cargarGastos, cargarPagosCalendario]);

  // ===== FUNCIONES DE IA PARA LECTURA DE DOCUMENTOS =====
  
  const leerDocumentoConIA = async (archivo: File, categoria: string) => {
    // 🔌 EVENTO: LECTURA_DOCUMENTO_IA
    console.log('🔌 EVENTO: LECTURA_DOCUMENTO_IA', {
      endpoint: 'POST /api/documentos/ocr',
      payload: {
        archivo: archivo.name,
        categoria,
        tipo_ocr: 'GPT-4-Vision / Azure Document Intelligence'
      },
      timestamp: new Date().toISOString()
    });

    setLeyendoDocumento(true);

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Datos extraídos según categoría
    let datosExtraidos: any = {};

    switch (categoria) {
      case 'vehiculos':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año
          coste: (Math.random() * 500 + 200).toFixed(2),
          observaciones: 'Seguro a todo riesgo con franquicia de 300€',
          categoriaEBITDA: 'seguros'
        };
        break;
      
      case 'contratos':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 años
          coste: (Math.random() * 2000 + 500).toFixed(2),
          observaciones: 'Renovación automática salvo notificación con 60 días de antelación',
          categoriaEBITDA: 'alquiler'
        };
        break;
      
      case 'licencias':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coste: (Math.random() * 300 + 50).toFixed(2),
          observaciones: 'Licencia anual, incluye 5 usuarios',
          categoriaEBITDA: 'tecnologia'
        };
        break;

      case 'fiscalidad':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coste: '',
          observaciones: 'Presentación trimestral - Modelo 303 IVA',
          categoriaEBITDA: 'asesoria'
        };
        break;

      case 'sociedad':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: '',
          coste: '',
          observaciones: 'Escritura de constitución de la sociedad',
          categoriaEBITDA: 'no_aplica'
        };
        break;

      default:
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: '',
          coste: '',
          observaciones: '',
          categoriaEBITDA: ''
        };
    }

    // Auto-rellenar campos (NO rellenar docNombre ya que el usuario ya lo escribió en Fase 1)
    setDocVencimiento(datosExtraidos.vencimiento);
    setDocCoste(datosExtraidos.coste);
    setDocObservaciones(datosExtraidos.observaciones);
    setDocCategoriaEBITDA(datosExtraidos.categoriaEBITDA);

    setLeyendoDocumento(false);

    toast.success('Documento analizado con IA', {
      description: 'Los campos se han rellenado automáticamente'
    });
  };

  // ===== FUNCIONES DE EVENTOS PARA MAKE =====
  
  const handleEscanearTicket = () => {
    // 🔌 EVENTO: INICIAR_OCR_TICKET
    console.log('🔌 EVENTO: INICIAR_OCR_TICKET', {
      endpoint: 'POST /api/ocr/escanear-ticket',
      accion: 'Abrir cámara o subir imagen para OCR',
      timestamp: new Date().toISOString()
    });

    // Simular respuesta OCR (el programador debe reemplazar con API real)
    setTimeout(() => {
      const datosOCRSimulados: DatosOCR = {
        ocr_proveedor_nombre: 'Papelería Central S.L.',
        ocr_nif_proveedor: 'B12345678',
        ocr_fecha: '2024-11-26',
        ocr_importe: '156.50',
        ocr_categoria_sugerida: 'Suministros',
        ocr_num_factura: 'FAC-2024-1234',
        ticket_url: 'https://storage.udar.com/tickets/ticket_123456.jpg'
      };

      setDatosGastoLeidos(datosOCRSimulados);
      
      console.log('✅ OCR COMPLETADO', {
        datos_extraidos: datosOCRSimulados,
        timestamp: new Date().toISOString()
      });

      // Cerrar modal de selección y abrir formulario
      setModalSeleccionGastoOpen(false);
      setModalGastoOpen(true);
      
      toast.success('Ticket escaneado correctamente');
    }, 1500);
  };

  // ⭐ FUNCIONES REALES PARA CRUD CON LA API
  const handleCrearDocumentoReal = async () => {
    try {
      setGuardando(true);
      
      let archivoUrl = null;
      let archivoNombre = null;
      let tamanoArchivo = null;
      let mimeType = null;
      
      // Si hay archivo seleccionado, subirlo primero
      if (archivoSeleccionado) {
        console.log('📤 Subiendo archivo:', archivoSeleccionado.name);
        const resultadoUpload = await documentacionApi.subirArchivo(archivoSeleccionado);
        
        if (resultadoUpload) {
          archivoUrl = resultadoUpload.url;
          archivoNombre = resultadoUpload.nombre;
          tamanoArchivo = resultadoUpload.tamano;
          mimeType = resultadoUpload.mimeType;
          console.log('✅ Archivo subido:', archivoUrl);
        } else {
          toast.error('Error al subir el archivo');
          setGuardando(false);
          return;
        }
      }
      
      const nuevoDocumento = {
        empresa_id: docEmpresa || '1',
        punto_venta_id: docPuntoVenta || null,
        categoria: docCategoria,
        tipo: docCategoria === 'vehiculos' ? 'Vehículo / Técnico' : 
              docCategoria === 'contratos' ? 'Contrato' : 
              docCategoria === 'licencias' ? 'Permisos' : 
              docCategoria === 'fiscalidad' ? 'Fiscal' : 
              docCategoria === 'sociedad' ? 'Legal' : 'General',
        nombre: docNombre,
        descripcion: docObservaciones,
        archivo_url: archivoUrl,
        archivo_nombre: archivoNombre,
        tamano_archivo: tamanoArchivo,
        mime_type: mimeType,
        fecha_vencimiento: docVencimiento || null,
        coste_asociado: docCoste ? parseFloat(docCoste) : null,
        categoria_ebitda: docCategoriaEBITDA || null,
        responsable: 'Admin' // Se puede cambiar según el usuario logueado
      };
      
      console.log('📤 Creando documento:', nuevoDocumento);
      const resultado = await documentacionApi.crearDocumento(nuevoDocumento);
      console.log('✅ Documento creado:', resultado);
      
      toast.success('Documento subido correctamente', {
        description: `${docNombre} - ${docCategoria.charAt(0).toUpperCase() + docCategoria.slice(1)}`
      });
      
      // Recargar lista de documentos
      await cargarDocumentos();
      
      // Cerrar modal y limpiar
      setModalDocumentoOpen(false);
      limpiarFormularioDocumento();
      
    } catch (error) {
      console.error('❌ Error creando documento:', error);
      toast.error('Error al subir el documento');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarDocumento = async (docId: number) => {
    try {
      await documentacionApi.eliminarDocumento(docId);
      toast.success('Documento eliminado correctamente');
      await cargarDocumentos();
    } catch (error) {
      console.error('❌ Error eliminando documento:', error);
      toast.error('Error al eliminar el documento');
    }
  };

  const handleCrearGastoReal = async (datosFormulario: any) => {
    try {
      setGuardando(true);
      
      const nuevoGasto = {
        empresa_id: '1',
        concepto: datosFormulario.concepto,
        proveedor_nombre: datosFormulario.proveedor,
        nif_proveedor: datosFormulario.nif_proveedor,
        numero_factura: datosFormulario.num_factura,
        importe: parseFloat(datosFormulario.importe) || 0,
        total: parseFloat(datosFormulario.importe) || 0,
        categoria: datosFormulario.categoria || 'Otros',
        subtipo: datosFormulario.subtipo,
        centro_coste: datosFormulario.centro_coste,
        fecha_gasto: datosFormulario.fecha || new Date().toISOString().split('T')[0],
        metodo_pago: metodoPago,
        ticket_url: datosGastoLeidos?.ticket_url || null
      };
      
      console.log('📤 Creando gasto:', nuevoGasto);
      const resultado = await documentacionApi.crearGasto(nuevoGasto);
      console.log('✅ Gasto creado:', resultado);
      
      toast.success('Gasto registrado correctamente');
      
      // Recargar lista de gastos
      await cargarGastos();
      
      // Cerrar modal y limpiar
      setModalGastoOpen(false);
      setDatosGastoLeidos(null);
      
    } catch (error) {
      console.error('❌ Error creando gasto:', error);
      toast.error('Error al registrar el gasto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarGasto = async (gastoId: number) => {
    try {
      await documentacionApi.eliminarGasto(gastoId);
      toast.success('Gasto eliminado correctamente');
      await cargarGastos();
    } catch (error) {
      console.error('❌ Error eliminando gasto:', error);
      toast.error('Error al eliminar el gasto');
    }
  };

  const handleCrearPagoCalendarioReal = async (datosFormulario: any) => {
    try {
      setGuardando(true);
      
      const nuevoPago = {
        empresa_id: '1',
        concepto: datosFormulario.concepto,
        monto: parseFloat(datosFormulario.monto) || 0,
        categoria: datosFormulario.categoria || 'Otros',
        fecha: datosFormulario.fecha || new Date().toISOString().split('T')[0],
        recurrente: datosFormulario.recurrente || false,
        frecuencia: datosFormulario.frecuencia || null
      };
      
      console.log('📤 Creando pago calendario:', nuevoPago);
      const resultado = await documentacionApi.crearPagoCalendario(nuevoPago);
      console.log('✅ Pago creado:', resultado);
      
      toast.success('Pago añadido al calendario');
      
      // Recargar lista de pagos
      await cargarPagosCalendario();
      
      // Cerrar modal
      setModalPagoOpen(false);
      
    } catch (error) {
      console.error('❌ Error creando pago:', error);
      toast.error('Error al añadir el pago');
    } finally {
      setGuardando(false);
    }
  };

  const handleMarcarPagoPagado = async (pagoId: number) => {
    try {
      await documentacionApi.marcarPagoPagado(pagoId);
      toast.success('Pago marcado como pagado');
      await cargarPagosCalendario();
    } catch (error) {
      console.error('❌ Error marcando pago:', error);
      toast.error('Error al marcar el pago');
    }
  };

  const limpiarFormularioDocumento = () => {
    setPasoDocumento(1);
    setDocNombre('');
    setDocEmpresa('');
    setDocPuntoVenta('');
    setDocCategoria('sociedad');
    setDocVencimiento('');
    setDocCoste('');
    setDocObservaciones('');
    setDocCategoriaEBITDA('');
    setArchivoSeleccionado(null);
  };

  // Funciones legacy (mantener por compatibilidad)
  const handleCrearDocumento = (datos: Partial<DocumentoBBDD>) => {
    console.log('🔌 EVENTO: onDocumentoCreado (legacy)', datos);
  };

  const handleActualizarDocumento = (docId: string, cambios: Partial<DocumentoBBDD>) => {
    console.log('🔌 EVENTO: onDocumentoActualizado (legacy)', { docId, cambios });
  };

  const handleCrearGasto = (datos: Partial<GastoBBDD>) => {
    console.log('🔌 EVENTO: onGastoCreado (legacy)', datos);
  };

  const handleVincularGastoAEvento = (eventoId: string, gastoId: string) => {
    // 🔌 EVENTO: VINCULAR_GASTO_A_EVENTO
    console.log('🔌 EVENTO: VINCULAR_GASTO_A_EVENTO', {
      endpoint: `PUT /api/calendario/${eventoId}/vincular-gasto`,
      payload: { gasto_id: gastoId },
      timestamp: new Date().toISOString()
    });
  };

  const handleActualizarPagoCalendario = (eventoId: string, cambios: Partial<PagoCalendarioBBDD>) => {
    // 🔌 EVENTO: onPagoCalendarioActualizado
    console.log('🔌 EVENTO: onPagoCalendarioActualizado', {
      endpoint: `PUT /api/calendario/${eventoId}`,
      payload: cambios,
      acciones_make: {
        verificar_gasto_vinculado: cambios.estado_pago === 'pagado',
        sugerir_crear_gasto: cambios.estado_pago === 'pagado' && !cambios.gasto_id
      },
      timestamp: new Date().toISOString()
    });
  };

  // Los datos ahora se cargan de la API (ver useEffect arriba)

  const documentosFiltrados = (documentos || []).filter(d => {
    // Normalizar la categoría para comparar (minúsculas, sin acentos)
    const cat = (d.categoria || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    switch (filtroActivo) {
      case 'contratos':
        return cat === 'contratos' || cat === 'contratos empleados' || cat === 'contrato';
      case 'vehiculos':
        return cat === 'vehiculos' || cat === 'vehiculo';
      case 'alquileres':
        return cat === 'alquileres' || cat === 'contratos alquiler' || cat === 'alquiler';
      case 'licencias':
        return cat === 'licencias' || cat === 'permisos';
      case 'fiscalidad':
        return cat === 'fiscalidad' || cat === 'fiscal';
      case 'sociedad':
        return cat === 'sociedad' || cat === 'legal';
      case 'otros':
        return cat === 'otros' || cat === 'general' || !['contratos', 'vehiculos', 'alquileres', 'licencias', 'fiscalidad', 'fiscal', 'sociedad', 'legal'].includes(cat);
      default:
        return false;
    }
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Vigente
          </Badge>
        );
      case 'proximo-vencer':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Próximo a Vencer
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      case 'archivado':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            <FileBadge className="w-3 h-3 mr-1" />
            Archivado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getEstadoPagoBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Pagado
          </Badge>
        );
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Pendiente
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Vencido
          </Badge>
        );
      default:
        return null;
    }
  };

  // Mostrar indicador de carga
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando documentación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Gestión Documental
          </h1>
          <p className="text-gray-600 text-sm">
            Documentación legal y administrativa de Can Farines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              cargarDocumentos();
              cargarGastos();
              cargarPagosCalendario();
            }}
            variant="outline"
            size="icon"
            title="Recargar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setModalSeleccionGastoOpen(true)}
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            <Euro className="w-4 h-4 mr-2" />
            Subir Gasto
          </Button>
          <Button
            onClick={() => setModalDocumentoOpen(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFiltroActivo('sociedad')}
          variant={filtroActivo === 'sociedad' ? 'default' : 'outline'}
          className={filtroActivo === 'sociedad' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Sociedad
        </Button>
        <Button
          onClick={() => setFiltroActivo('vehiculos')}
          variant={filtroActivo === 'vehiculos' ? 'default' : 'outline'}
          className={filtroActivo === 'vehiculos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Car className="w-4 h-4 mr-2" />
          Vehículos
        </Button>
        <Button
          onClick={() => setFiltroActivo('alquileres')}
          variant={filtroActivo === 'alquileres' ? 'default' : 'outline'}
          className={filtroActivo === 'alquileres' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Contratos
        </Button>
        <Button
          onClick={() => setFiltroActivo('licencias')}
          variant={filtroActivo === 'licencias' ? 'default' : 'outline'}
          className={filtroActivo === 'licencias' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Scale className="w-4 h-4 mr-2" />
          Licencias
        </Button>
        <Button
          onClick={() => setFiltroActivo('fiscalidad')}
          variant={filtroActivo === 'fiscalidad' ? 'default' : 'outline'}
          className={filtroActivo === 'fiscalidad' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Fiscalidad
        </Button>
        <Button
          onClick={() => setFiltroActivo('otros')}
          variant={filtroActivo === 'otros' ? 'default' : 'outline'}
          className={filtroActivo === 'otros' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Otros
        </Button>
        <Button
          onClick={() => setFiltroActivo('gastos')}
          variant={filtroActivo === 'gastos' ? 'default' : 'outline'}
          className={filtroActivo === 'gastos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Euro className="w-4 h-4 mr-2" />
          Gastos
        </Button>
        <Button
          onClick={() => setFiltroActivo('agenda')}
          variant={filtroActivo === 'agenda' ? 'default' : 'outline'}
          className={filtroActivo === 'agenda' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Calendario
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2 border-gray-300">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
        <div className="relative flex-1">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar documentos, contratos o pagos..."
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Tabla de Documentos */}
      {filtroActivo !== 'agenda' && filtroActivo !== 'gastos' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {filtroActivo === 'puntoVenta' && 'Documentación de Punto de Venta'}
              {filtroActivo === 'contratos' && 'Contratos de Empleados'}
              {filtroActivo === 'vehiculos' && 'Documentación de Vehículos'}
              {filtroActivo === 'alquileres' && 'Contratos y Alquileres'}
              {filtroActivo === 'licencias' && 'Licencias y Permisos'}
              {filtroActivo === 'fiscalidad' && 'Documentación Fiscal'}
              {filtroActivo === 'sociedad' && 'Documentación Societaria'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Subida</TableHead>
                  {filtroActivo !== 'puntoVenta' && <TableHead>Vencimiento</TableHead>}
                  <TableHead>Estado</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No hay documentos en esta categoría</p>
                        <Button
                          onClick={() => setModalDocumentoOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Subir primer documento
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                documentosFiltrados.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.nombre}</p>
                          <p className="text-xs text-gray-500">{doc.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {doc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{doc.fechaSubida}</p>
                    </TableCell>
                    {filtroActivo !== 'puntoVenta' && (
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {doc.fechaVencimiento || 'N/A'}
                        </p>
                      </TableCell>
                    )}
                    <TableCell>{getEstadoBadge(doc.estado)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{doc.tamaño}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{doc.responsable}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {filtroActivo === 'vehiculos' ? (
                          <>
                            <Button
                              onClick={() => toast.info(`Ver ficha de ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <FileBadge className="w-3 h-3 mr-1" />
                              Ficha
                            </Button>
                            <Button
                              onClick={() => toast.info(`Ver documentación de ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <FolderOpen className="w-3 h-3 mr-1" />
                              Documentación
                            </Button>
                            <Button
                              onClick={() => toast.info(`Ver seguro de ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Seguro
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => toast.success(`Descargando ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Descargar
                            </Button>
                            <Button
                              onClick={() => toast.info(`Ver ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => toast.error(`Documento ${doc.nombre} eliminado`)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Gastos */}
      {filtroActivo === 'gastos' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Gestión de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Fecha Subida</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>PVP</TableHead>
                  <TableHead>Acción asociada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(gastos || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Euro className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No hay gastos registrados</p>
                        <Button
                          onClick={() => setModalSeleccionGastoOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Registrar primer gasto
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                (gastos || []).map((gasto: any) => (
                  <TableRow key={gasto.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                          <Euro className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{gasto.concepto}</p>
                          <p className="text-xs text-gray-500">{gasto.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {new Date(gasto.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="w-3 h-3 text-gray-500" />
                        <span className="font-medium">{gasto.importe}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{gasto.accionAsociada || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          onClick={() => toast.success(`Descargando ${gasto.adjunto}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Descargar
                        </Button>
                        <Button
                          onClick={() => toast.info(`Ver ${gasto.adjunto}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (gasto._id) {
                              handleEliminarGasto(gasto._id);
                            } else {
                              toast.error(`Gasto ${gasto.concepto} eliminado`);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agenda de Pagos */}
      {filtroActivo === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={() => setModalPagoOpen(true)}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Pago
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Pagos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Calendario de Acciones
                </CardTitle>
                <Button
                  onClick={() => setModalPagoOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  + Añadir Evento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Recurrente</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(pagos || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <CalendarDays className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500">No hay pagos programados</p>
                          <Button
                            onClick={() => setModalPagoOpen(true)}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir primer pago
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                  (pagos || []).map((pago: any) => (
                    <TableRow key={pago.id}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{pago.concepto}</p>
                        <p className="text-xs text-gray-500">{pago.id}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pago.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="w-3 h-3 text-gray-500" />
                          <span className="font-medium">{pago.monto}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{pago.fecha}</p>
                      </TableCell>
                      <TableCell>{getEstadoPagoBadge(pago.estado)}</TableCell>
                      <TableCell>
                        {pago.recurrente ? (
                          <Badge className="bg-blue-100 text-blue-700">
                            Recurrente
                          </Badge>
                        ) : (
                          <Badge variant="outline">Único</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => {
                              if (pago._id) {
                                handleMarcarPagoPagado(pago._id);
                              } else {
                                toast.success(`Marcando ${pago.concepto} como pagado`);
                              }
                            }}
                            variant="outline"
                            size="sm"
                            disabled={pago.estado === 'pagado'}
                          >
                            {pago.estado === 'pagado' ? 'Pagado' : 'Marcar Pagado'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Subir Documento */}
      <Dialog open={modalDocumentoOpen} onOpenChange={(open) => {
        setModalDocumentoOpen(open);
        if (!open) {
          // Reset al cerrar
          setPasoDocumento(1);
          setDocNombre('');
          setDocEmpresa('');
          setDocPuntoVenta('');
          setDocCategoria('sociedad');
          setDocVencimiento('');
          setDocCoste('');
          setDocObservaciones('');
          setDocCategoriaEBITDA('');
          setArchivoSeleccionado(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }} className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Documento - Paso {pasoDocumento} de 2
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              {pasoDocumento === 1 
                ? 'Completa la información básica del documento'
                : 'La IA ha extraído información automáticamente. Revisa y confirma'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* FASE 1: Información Básica */}
            {pasoDocumento === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Documento *</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Ej: Alquiler local Tiana" 
                    value={docNombre}
                    onChange={(e) => setDocNombre(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select 
                    value={docCategoria} 
                    onValueChange={(value: any) => setDocCategoria(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sociedad">Sociedad</SelectItem>
                      <SelectItem value="vehiculos">Vehículos</SelectItem>
                      <SelectItem value="contratos">Contratos y Alquileres</SelectItem>
                      <SelectItem value="licencias">Licencias</SelectItem>
                      <SelectItem value="fiscalidad">Fiscalidad</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select value={docEmpresa} onValueChange={setDocEmpresa}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EMPRESAS).map(empresa => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {getNombreEmpresa(empresa.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdv">Punto de Venta</Label>
                  <Select 
                    value={docPuntoVenta} 
                    onValueChange={setDocPuntoVenta}
                    disabled={!docEmpresa}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={docEmpresa ? "Selecciona un punto de venta" : "Primero selecciona una empresa"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los puntos de venta</SelectItem>
                      {docEmpresa && Object.values(PUNTOS_VENTA)
                        .filter(pdv => pdv.empresaId === docEmpresa)
                        .map(pdv => (
                          <SelectItem key={pdv.id} value={pdv.id}>
                            {getNombrePDV(pdv.id)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archivo">Archivo *</Label>
                  <Input 
                    id="archivo" 
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];
                      if (archivo) {
                        setArchivoSeleccionado(archivo);
                      }
                    }}
                  />
                  {archivoSeleccionado && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{archivoSeleccionado.name}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* FASE 2: Información Extraída por IA */}
            {pasoDocumento === 2 && (
              <>
                <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-md mb-4">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-teal-900">Documento analizado con IA</p>
                    <p className="text-xs text-teal-700">Revisa y modifica los campos detectados</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vencimiento">Fecha de Vencimiento</Label>
                  <Input 
                    id="vencimiento" 
                    type="date"
                    value={docVencimiento}
                    onChange={(e) => setDocVencimiento(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coste">Coste (€)</Label>
                  <Input 
                    id="coste" 
                    type="number"
                    step="0.01"
                    value={docCoste}
                    onChange={(e) => setDocCoste(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoriaEBITDA">Categoría para EBITDA</Label>
                  <Select value={docCategoriaEBITDA} onValueChange={setDocCategoriaEBITDA}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría de gasto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alquiler">Alquiler / Arrendamiento</SelectItem>
                      <SelectItem value="seguros">Seguros</SelectItem>
                      <SelectItem value="suministros">Suministros (Luz, Agua, Gas)</SelectItem>
                      <SelectItem value="personal">Gastos de Personal</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="marketing">Marketing y Publicidad</SelectItem>
                      <SelectItem value="tecnologia">Tecnología y Software</SelectItem>
                      <SelectItem value="asesoria">Asesoría Legal/Fiscal</SelectItem>
                      <SelectItem value="financieros">Gastos Financieros</SelectItem>
                      <SelectItem value="otros">Otros Gastos Operativos</SelectItem>
                      <SelectItem value="no_aplica">No Aplica al EBITDA</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Esta categorización ayudará a automatizar el cálculo del EBITDA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input 
                    id="observaciones"
                    value={docObservaciones}
                    onChange={(e) => setDocObservaciones(e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            {pasoDocumento === 1 ? (
              <>
                <Button variant="outline" onClick={() => setModalDocumentoOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    // Validar campos obligatorios
                    if (!docNombre || !docCategoria || !docEmpresa || !archivoSeleccionado) {
                      toast.error('Por favor completa todos los campos obligatorios');
                      return;
                    }
                    
                    // Leer documento con IA
                    await leerDocumentoConIA(archivoSeleccionado, docCategoria);
                    
                    // Pasar a la fase 2
                    setPasoDocumento(2);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={!docNombre || !docCategoria || !docEmpresa || !archivoSeleccionado || leyendoDocumento}
                >
                  {leyendoDocumento ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setPasoDocumento(1)}>
                  Atrás
                </Button>
                <Button 
                  onClick={handleCrearDocumentoReal}
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Documento
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Añadir Pago */}
      <Dialog open={modalPagoOpen} onOpenChange={setModalPagoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              + Añadir Evento
            </DialogTitle>
            <DialogDescription>
              Recordatorios, reuniones...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto</Label>
              <Input id="concepto" placeholder="Ej: Alquiler Diciembre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input id="categoria" placeholder="Ej: Alquiler" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox 
                  id="todo-dia" 
                  checked={todoDia}
                  onCheckedChange={(checked) => setTodoDia(checked as boolean)}
                />
                <label
                  htmlFor="todo-dia"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Todo el día
                </label>
              </div>
              {!todoDia && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-date">Fecha</Label>
                    <Input 
                      id="fecha-date" 
                      type="date" 
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha-time">Hora</Label>
                    <Input 
                      id="fecha-time" 
                      type="time"
                    />
                  </div>
                </div>
              )}
              {todoDia && (
                <div className="space-y-2">
                  <Label htmlFor="fecha-solo">Fecha</Label>
                  <Input 
                    id="fecha-solo" 
                    type="date" 
                    placeholder="dd/mm/aaaa"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input id="observaciones" placeholder="Añadir observaciones..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPagoOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setModalPagoOpen(false);
                toast.success('Acción registrada correctamente');
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              + Añadir Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección para Subir Gasto */}
      <Dialog open={modalSeleccionGastoOpen} onOpenChange={setModalSeleccionGastoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Subir Gasto
            </DialogTitle>
            <DialogDescription>
              Selecciona cómo quieres registrar el gasto
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <Button
              onClick={() => {
                setModalSeleccionGastoOpen(false);
                handleEscanearTicket();
              }}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-teal-200 hover:bg-teal-50"
            >
              <Scan className="w-10 h-10 text-teal-600" />
              <span className="font-medium">Escanear con móvil</span>
            </Button>
            <Button
              onClick={() => {
                setModalSeleccionGastoOpen(false);
                setModalGastoOpen(true);
              }}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-teal-200 hover:bg-teal-50"
            >
              <FileText className="w-10 h-10 text-teal-600" />
              <span className="font-medium">Añadir manual</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Subir Gasto */}
      <Dialog open={modalGastoOpen} onOpenChange={setModalGastoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Subir Gasto
                </DialogTitle>
                <DialogDescription>
                  Registra un nuevo gasto adjuntando la factura o ticket
                </DialogDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="outline"
                  className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                  size="sm"
                  onClick={() => toast.info('Selecciona el archivo de la factura o ticket')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adjuntar Ticket/Factura
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMetodoPago('efectivo')}
                    className={metodoPago === 'efectivo' 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600' 
                      : 'border-gray-300 text-gray-600'
                    }
                  >
                    Efectivo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMetodoPago('tarjeta')}
                    className={metodoPago === 'tarjeta' 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600' 
                      : 'border-gray-300 text-gray-600'
                    }
                  >
                    Con Tarjeta
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gasto-concepto">Concepto del Gasto</Label>
              <Input 
                id="gasto-concepto" 
                placeholder="Ej: Material de oficina"
                defaultValue={datosGastoLeidos?.ocr_proveedor_nombre ? '' : ''}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-proveedor">Proveedor</Label>
                <Input 
                  id="gasto-proveedor" 
                  placeholder="Ej: Papelería S.A."
                  defaultValue={datosGastoLeidos?.ocr_proveedor_nombre || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-nif">NIF Proveedor (opcional)</Label>
                <Input 
                  id="gasto-nif" 
                  placeholder="Ej: B12345678"
                  defaultValue={datosGastoLeidos?.ocr_nif_proveedor || ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-importe">Importe (€)</Label>
                <Input 
                  id="gasto-importe" 
                  type="number" 
                  step="0.01" 
                  placeholder="150,00"
                  defaultValue={datosGastoLeidos?.ocr_importe || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-fecha">Fecha</Label>
                <Input 
                  id="gasto-fecha" 
                  type="date"
                  defaultValue={datosGastoLeidos?.ocr_fecha || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-num-factura">Nº de Factura *</Label>
                <Input 
                  id="gasto-num-factura" 
                  placeholder="FAC-2024-1234"
                  defaultValue={datosGastoLeidos?.ocr_num_factura || ''}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-categoria">Categoría</Label>
                <Input 
                  id="gasto-categoria" 
                  placeholder="Ej: Suministros"
                  defaultValue={datosGastoLeidos?.ocr_categoria_sugerida || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-subtipo">Subtipo</Label>
                <Input 
                  id="gasto-subtipo" 
                  placeholder="Ej: Papel, Limpieza..."
                />
                <p className="text-xs text-gray-500">
                  Depende de la categoría seleccionada
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-centro-coste">Centro de Coste</Label>
                <Input id="gasto-centro-coste" placeholder="Ej: Can Farines Centro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-accion">Asociar evento del Calendario</Label>
                <Input id="gasto-accion" placeholder="Seleccionar evento..." />
              </div>
            </div>
            {datosGastoLeidos && (
              <div className="bg-teal-50 border border-teal-200 rounded-md p-3">
                <p className="text-sm text-teal-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Datos extraídos del ticket escaneado. Puedes modificarlos antes de guardar.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setModalGastoOpen(false);
              setDatosGastoLeidos(null); // Limpiar datos OCR
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                // Recoger todos los datos del formulario
                const concepto = (document.getElementById('gasto-concepto') as HTMLInputElement)?.value;
                const proveedor = (document.getElementById('gasto-proveedor') as HTMLInputElement)?.value;
                const nif_proveedor = (document.getElementById('gasto-nif') as HTMLInputElement)?.value;
                const importe = (document.getElementById('gasto-importe') as HTMLInputElement)?.value || '0';
                const fecha = (document.getElementById('gasto-fecha') as HTMLInputElement)?.value;
                const num_factura = (document.getElementById('gasto-num-factura') as HTMLInputElement)?.value;
                const categoria = (document.getElementById('gasto-categoria') as HTMLInputElement)?.value;
                const subtipo = (document.getElementById('gasto-subtipo') as HTMLInputElement)?.value;
                const centro_coste = (document.getElementById('gasto-centro-coste') as HTMLInputElement)?.value;
                
                // Usar la función real que llama a la API
                await handleCrearGastoReal({
                  concepto,
                  proveedor,
                  nif_proveedor,
                  importe,
                  fecha,
                  num_factura,
                  categoria,
                  subtipo,
                  centro_coste
                });
              }}
              className="bg-teal-600 hover:bg-teal-700"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Euro className="w-4 h-4 mr-2" />
                  Registrar Gasto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}