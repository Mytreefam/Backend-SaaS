import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Camera, 
  Plus, 
  Store,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Edit,
  CheckCircle2,
  Users,
  FileText,
  TruckIcon,
  Building2,
  Cog,
  Upload,
  Download,
  Eye,
  Calculator,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Save,
  MessageSquare,
  RefreshCw,
  UserCog,
  HelpCircle,
  GripVertical,
  Image,
  X,
  Monitor,
  Settings,
  Power,
  AlertCircle,
  DollarSign,
  Scan,
  CreditCard,
  AlertTriangle,
  Clock,
  Globe,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ModalCrearEmpresa } from './ModalCrearEmpresa';
import { ConfiguracionChats } from './ConfiguracionChats';
import { ModalAgenteExterno, AgenteExterno as AgenteExternoType } from './ModalAgenteExterno';
import { ConfiguracionEmpresas } from './ConfiguracionEmpresas';
import { GestionMarcas } from './GestionMarcas';
import { ModalConfiguracionZonaHoraria } from './ModalConfiguracionZonaHoraria';
import { CronJobsMonitor } from './CronJobsMonitor';
import { ConfiguracionCupones } from './ConfiguracionCupones';
import { 
  obtenerConfiguracionZonaHoraria,
  actualizarZonaHorariaReferencia,
  actualizarHoraEjecucionReferencia,
  obtenerProximaEjecucionLocal,
  ZONAS_HORARIAS_DISPONIBLES
} from '../../config/timezone.config';

interface Marca {
  id: string;
  nombreFiscal: string;
  cif: string;
  domicilioFiscal: string;
  nombreComercial: string;
  logoUrl?: string; // Logo del nombre comercial
  puntosVenta: {
    nombreComercial: string;
    direccion: string;
  }[];
  cuentasBancarias: {
    numero: string;
    alias: string;
  }[];
  activo: boolean;
}

interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  activo: boolean;
  horario: string;
  documentacion?: {
    alquiler?: {
      arrendador: string;
      precio: number;
      vencimiento: string;
      documento?: string;
    };
    licencias?: {
      tipo: string;
      numero: string;
      vencimiento: string;
      documento?: string;
    }[];
  };
  comunidadVecinos?: {
    existe: boolean;
    contactoNombre?: string;
    contactoTelefono?: string;
    contactoEmail?: string;
  };
}

// La interfaz AgenteExterno ahora se importa desde ModalAgenteExterno

interface ConfiguracionGerenteProps {
  activeSubsection?: string;
  user?: any;
  onCambiarRol?: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
}

export function ConfiguracionGerente({ activeSubsection = 'cuenta', user, onCambiarRol }: ConfiguracionGerenteProps) {
  const [filtroActivo, setFiltroActivo] = useState('cuenta');
  const [modalPuntoVentaOpen, setModalPuntoVentaOpen] = useState(false);
  const [modalMarcaOpen, setModalMarcaOpen] = useState(false);
  const [modalDocumentacionOpen, setModalDocumentacionOpen] = useState(false);
  const [modalCrearEmpresaOpen, setModalCrearEmpresaOpen] = useState(false);
  const [modalAgenteExternoOpen, setModalAgenteExternoOpen] = useState(false);
  const [agenteExternoSeleccionado, setAgenteExternoSeleccionado] = useState<AgenteExternoType | null>(null);
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState<PuntoVenta | null>(null);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [tabDocumentacion, setTabDocumentacion] = useState('licencias');
  const [puntoVentaEditando, setPuntoVentaEditando] = useState<PuntoVenta | null>(null);
  const [marcaEditando, setMarcaEditando] = useState<Marca | null>(null);
  const [puntosVentaTemp, setPuntosVentaTemp] = useState<{nombreComercial: string, direccion: string}[]>([
    { nombreComercial: '', direccion: '' }
  ]);
  const [cuentasBancariasTemp, setCuentasBancariasTemp] = useState<{numero: string, alias: string}[]>([
    { numero: '', alias: '' }
  ]);
  const [logoEmpresaTemporal, setLogoEmpresaTemporal] = useState<string>('');
  
  // Estados para Presupuesto
  const [subfiltroPresupuesto, setSubfiltroPresupuesto] = useState<'totales' | 'puntosVenta'>('totales');
  const [añoPresupuesto, setAñoPresupuesto] = useState<number>(new Date().getFullYear());
  const [empresaPresupuestoSeleccionada, setEmpresaPresupuestoSeleccionada] = useState<string>('todas'); // Nuevo filtro
  const [marcaPresupuestoSeleccionada, setMarcaPresupuestoSeleccionada] = useState<string>('todas'); // Nuevo filtro
  const [puntoVentaPresupuestoSeleccionado, setPuntoVentaPresupuestoSeleccionado] = useState<string>('todos'); // Nuevo filtro
  const [expandidoPresupuesto, setExpandidoPresupuesto] = useState<{[key: string]: boolean}>({
    ingresosNetos: false,
    costeVentas: false,
    gastosOperativos: false,
    costesEstructurales: false,
  });
  const [objetivosPresupuesto, setObjetivosPresupuesto] = useState<{[key: string]: number}>({});
  const [porcentajeImpuestoSociedades, setPorcentajeImpuestoSociedades] = useState<number>(25); // Nuevo: Configurable
  
  // Estado para subfiltro de Sistema
  const [subfiltroSistema, setSubfiltroSistema] = useState<'configuracion' | 'chats' | 'quienesSomos' | 'faqs' | 'tpv' | 'importacion' | 'cupones'>('configuracion');
  
  // Estados para Configuración de Zona Horaria
  const [configZonaHoraria, setConfigZonaHoraria] = useState(obtenerConfiguracionZonaHoraria());
  const [infoProximaEjecucion, setInfoProximaEjecucion] = useState(obtenerProximaEjecucionLocal());
  const [modalZonaHorariaOpen, setModalZonaHorariaOpen] = useState(false);
  const [zonaHorariaTemporal, setZonaHorariaTemporal] = useState(configZonaHoraria.zonaHorariaReferencia);
  const [horaTemporal, setHoraTemporal] = useState(configZonaHoraria.horaEjecucionReferencia);
  const [minutoTemporal, setMinutoTemporal] = useState(configZonaHoraria.minutoEjecucionReferencia);
  
  // Estados para TPV
  const [modalTPVOpen, setModalTPVOpen] = useState(false);
  const [tpvEditando, setTpvEditando] = useState<any | null>(null);
  const [modalTerminalOpen, setModalTerminalOpen] = useState(false);
  const [terminalEditando, setTerminalEditando] = useState<any | null>(null);
  const [tpvIdTerminal, setTpvIdTerminal] = useState<string>('');
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>([]);
  const [nombreTerminal, setNombreTerminal] = useState<string>('');
  const [tipoTerminal, setTipoTerminal] = useState<'principal' | 'secundario'>('secundario');
  const [dispositivosOpen, setDispositivosOpen] = useState(false);
  const [configAvanzadaOpen, setConfigAvanzadaOpen] = useState(false);
  
  // Todas las marcas disponibles de todas las empresas para selección múltiple en terminales
  // Los terminales pueden tener múltiples marcas asociadas de diferentes empresas
  const todasLasMarcas = [
    { id: 'MRC-001', nombre: 'Modomio', empresa: 'Disarmink S.L.' },
    { id: 'MRC-002', nombre: 'Blackburguer', empresa: 'Disarmink S.L.' },
    { id: 'MRC-003', nombre: 'Catering Premium', empresa: 'Eventos (PAU)' },
    { id: 'MRC-004', nombre: 'Obras y Reformas', empresa: 'Construcción (PAU)' }
  ];
  
  const [configTPV, setConfigTPV] = useState([
    {
      id: 'TPV-TIA',
      tienda: 'Tiana',
      direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
      marcasAsociadas: ['Modomio', 'Blackburguer'],
      terminales: [
        { id: 'TPV-TIA-001', nombre: 'Terminal 1 - Principal', marcas: ['Modomio', 'Blackburguer'], estado: 'activo', tipo: 'principal' },
        { id: 'TPV-TIA-002', nombre: 'Terminal 2 - Secundario', marcas: ['Modomio'], estado: 'activo', tipo: 'secundario' },
        { id: 'TPV-TIA-003', nombre: 'Terminal 3 - Bar', marcas: ['Modomio'], estado: 'activo', tipo: 'secundario' },
        { id: 'TPV-TIA-004', nombre: 'Terminal 1 - Principal', marcas: ['Blackburguer'], estado: 'activo', tipo: 'principal' },
        { id: 'TPV-TIA-005', nombre: 'Terminal 2 - Delivery', marcas: ['Blackburguer'], estado: 'activo', tipo: 'secundario' }
      ],
      activo: true
    },
    {
      id: 'TPV-BAD',
      tienda: 'Badalona',
      direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
      marcasAsociadas: ['Modomio', 'Blackburguer'],
      terminales: [
        { id: 'TPV-BAD-001', nombre: 'Terminal 1 - Principal', marcas: ['Modomio', 'Blackburguer'], estado: 'activo', tipo: 'principal' },
        { id: 'TPV-BAD-002', nombre: 'Terminal 2 - Secundario', marcas: ['Modomio'], estado: 'activo', tipo: 'secundario' },
        { id: 'TPV-BAD-003', nombre: 'Terminal 3 - Terraza', marcas: ['Modomio'], estado: 'activo', tipo: 'secundario' },
        { id: 'TPV-BAD-004', nombre: 'Terminal 4 - Bar', marcas: ['Modomio'], estado: 'activo', tipo: 'secundario' },
        { id: 'TPV-BAD-005', nombre: 'Terminal 1 - Principal', marcas: ['Blackburguer'], estado: 'activo', tipo: 'principal' },
        { id: 'TPV-BAD-006', nombre: 'Terminal 2 - Delivery', marcas: ['Blackburguer'], estado: 'activo', tipo: 'secundario' },
        { id: 'TPV-BAD-007', nombre: 'Terminal 3 - Take Away', marcas: ['Blackburguer'], estado: 'activo', tipo: 'secundario' }
      ],
      activo: true
    }
  ]);
  
  // Estados para Quienes Somos y FAQs
  const [quienesSomos, setQuienesSomos] = useState({
    titulo: 'Quiénes Somos',
    elementos: [
      {
        id: '1',
        tipo: 'texto' as const,
        titulo: 'Descripción',
        contenido: 'Somos una empresa comprometida con la excelencia y la calidad en nuestros productos y servicios. Desde nuestros inicios, hemos trabajado para ofrecer la mejor experiencia a nuestros clientes.',
        orden: 0
      },
      {
        id: '2',
        tipo: 'texto' as const,
        titulo: 'Misión',
        contenido: 'Proporcionar productos y servicios de alta calidad que superen las expectativas de nuestros clientes.',
        orden: 1
      },
      {
        id: '3',
        tipo: 'texto' as const,
        titulo: 'Visión',
        contenido: 'Ser líderes en nuestro sector, reconocidos por nuestra innovación y compromiso con la excelencia.',
        orden: 2
      },
      {
        id: '4',
        tipo: 'texto' as const,
        titulo: 'Valores',
        contenido: 'Calidad, Integridad, Innovación, Compromiso con el cliente, Responsabilidad social',
        orden: 3
      }
    ]
  });
  
  const [faqsList, setFaqsList] = useState([
    {
      id: '1',
      categoria: 'Pedidos',
      pregunta: '¿Cómo puedo realizar un pedido?',
      respuesta: 'Puedes realizar un pedido directamente desde nuestra app móvil o desde la web. Solo tienes que seleccionar los productos que desees y proceder al pago.'
    },
    {
      id: '2',
      categoria: 'Pedidos',
      pregunta: '¿Cuál es el tiempo de entrega?',
      respuesta: 'El tiempo de entrega estimado es de 30-45 minutos dependiendo de tu ubicación y la disponibilidad de los productos.'
    },
    {
      id: '3',
      categoria: 'Pagos',
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta: 'Aceptamos pagos con tarjeta de crédito/débito, PayPal, Bizum y pago en efectivo en el momento de la entrega.'
    },
    {
      id: '4',
      categoria: 'Cuenta',
      pregunta: '¿Cómo puedo cambiar mi contraseña?',
      respuesta: 'Puedes cambiar tu contraseña desde la sección de Perfil > Seguridad > Cambiar Contraseña.'
    }
  ]);
  
  const [puntosVenta, setPuntosVenta] = useState<PuntoVenta[]>([
    {
      id: 'PDV-TIANA',
      nombre: 'Tiana',
      direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
      telefono: '+34 933 456 789',
      email: 'tiana@hoypecamos.com',
      activo: true,
      horario: '12:00 - 00:00',
      documentacion: {
        alquiler: {
          arrendador: 'Inmobiliaria Costa Maresme SL',
          precio: 1800,
          vencimiento: '2026-12-31',
        },
        licencias: [
          {
            tipo: 'Licencia de Actividad',
            numero: 'LIC-TIA-2022-00089',
            vencimiento: '2027-06-30',
          },
          {
            tipo: 'Licencia Sanitaria',
            numero: 'SAN-TIA-2022-00234',
            vencimiento: '2026-06-15',
          }
        ]
      },
      comunidadVecinos: {
        existe: true,
        contactoNombre: 'Joan Ferrer',
        contactoTelefono: '+34 933 123 456',
        contactoEmail: 'comunidad@tiana-centro.com'
      }
    },
    {
      id: 'PDV-BADALONA',
      nombre: 'Badalona',
      direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
      telefono: '+34 933 456 790',
      email: 'badalona@hoypecamos.com',
      activo: true,
      horario: '12:00 - 00:30',
      documentacion: {
        alquiler: {
          arrendador: 'Gestión Badalona Locales SA',
          precio: 2200,
          vencimiento: '2027-03-31',
        },
        licencias: [
          {
            tipo: 'Licencia de Actividad',
            numero: 'LIC-BAD-2023-00156',
            vencimiento: '2028-03-31',
          },
          {
            tipo: 'Licencia Sanitaria',
            numero: 'SAN-BAD-2023-00401',
            vencimiento: '2027-02-28',
          }
        ]
      },
      comunidadVecinos: {
        existe: true,
        contactoNombre: 'Ana Martínez',
        contactoTelefono: '+34 933 234 567',
        contactoEmail: 'admin@badalonapujol.com'
      }
    }
  ]);

  const [marcas, setMarcas] = useState<Marca[]>([
    {
      id: 'EMP-001',
      nombreFiscal: 'Disarmink S.L.',
      cif: 'B67284315',
      domicilioFiscal: 'Avenida Onze Setembre, 1, 08391 Tiana, Barcelona',
      nombreComercial: 'Hoy Pecamos',
      puntosVenta: [
        {
          nombreComercial: 'Tiana',
          direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona'
        },
        {
          nombreComercial: 'Badalona',
          direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona'
        }
      ],
      cuentasBancarias: [
        {
          numero: 'ES91 2100 0418 4502 0005 1332',
          alias: 'Cuenta Principal Disarmink'
        },
        {
          numero: 'ES76 0128 0123 4501 0006 7890',
          alias: 'Cuenta Operativa Hoy Pecamos'
        }
      ],
      activo: true
    }
  ]);

  const [agentesExternos, setAgentesExternos] = useState<AgenteExternoType[]>([
    {
      id: 'AGE-001',
      nombre: 'Juan Rodríguez',
      tipo: 'proveedor',
      empresa: 'Harinas Molino del Sur',
      email: 'juan.rodriguez@molinodelsur.com',
      telefono: '+34 918 765 432',
      modo: 'CANAL',
      canal_email_activo: true,
      canal_whatsapp_activo: false,
      email_destino_sistema: 'agente_age-001@cliente.udaredge.app',
      recepcion: {
        recibir_pedidos: { activo: true, canal: 'email' },
        recibir_facturas_emitidas: { activo: false, canal: 'email' },
        recibir_albaranes: { activo: true, canal: 'email' },
        recibir_contratos: { activo: false, canal: 'email' },
        recibir_informes: { activo: false, canal: 'email' },
        recibir_avisos_generales: { activo: true, canal: 'email' }
      },
      envio: {
        subir_facturas_proveedor: true,
        subir_albaranes: true,
        subir_nominas: false,
        subir_contratos: false,
        subir_justificantes: true,
        subir_auditorias: false,
        subir_otros_documentos: true
      },
      reglas: {
        identificador_principal: 'cif',
        origen_identificador: 'nombre_archivo',
        tipo_documento_por_defecto: 'factura_proveedor',
        destino_por_defecto: 'modulo_facturacion'
      },
      activo: true,
      fechaAlta: '2024-01-15'
    },
    {
      id: 'AGE-002',
      nombre: 'María González',
      tipo: 'proveedor',
      empresa: 'Lácteos Menorca',
      email: 'maria.gonzalez@lacteosmenorca.com',
      telefono: '+34 917 654 321',
      modo: 'CANAL',
      canal_email_activo: true,
      canal_whatsapp_activo: true,
      email_destino_sistema: 'agente_age-002@cliente.udaredge.app',
      whatsapp_numero_sistema: '+34 600 XXX XXX',
      recepcion: {
        recibir_pedidos: { activo: true, canal: 'whatsapp' },
        recibir_facturas_emitidas: { activo: false, canal: 'email' },
        recibir_albaranes: { activo: true, canal: 'whatsapp' },
        recibir_contratos: { activo: false, canal: 'email' },
        recibir_informes: { activo: false, canal: 'email' },
        recibir_avisos_generales: { activo: true, canal: 'whatsapp' }
      },
      envio: {
        subir_facturas_proveedor: true,
        subir_albaranes: true,
        subir_nominas: false,
        subir_contratos: false,
        subir_justificantes: false,
        subir_auditorias: false,
        subir_otros_documentos: true
      },
      reglas: {
        identificador_principal: 'cif',
        origen_identificador: 'contenido_ocr',
        tipo_documento_por_defecto: 'factura_proveedor',
        destino_por_defecto: 'modulo_facturacion'
      },
      activo: true,
      fechaAlta: '2024-02-20'
    },
    {
      id: 'AGE-003',
      nombre: 'Carlos Fernández',
      tipo: 'gestor',
      empresa: 'Asesoría Fiscal Menéndez',
      email: 'carlos.fernandez@asesoriamenendez.com',
      telefono: '+34 916 543 210',
      modo: 'SAAS',
      username: 'carlos_fernandez',
      estadoUsuario: 'activo',
      enviarCredenciales: true,
      permisos: {
        puede_subir_nominas: true,
        puede_subir_contratos: true,
        puede_subir_irpf: true,
        puede_ver_documentos_subidos: true,
        puede_exportar_facturacion: true,
        puede_exportar_informes: true
      },
      canal_email_activo: true,
      canal_whatsapp_activo: false,
      recepcion: {
        recibir_pedidos: { activo: false, canal: 'saas' },
        recibir_facturas_emitidas: { activo: true, canal: 'saas' },
        recibir_albaranes: { activo: false, canal: 'email' },
        recibir_contratos: { activo: true, canal: 'saas' },
        recibir_informes: { activo: true, canal: 'saas' },
        recibir_avisos_generales: { activo: true, canal: 'email' }
      },
      envio: {
        subir_facturas_proveedor: false,
        subir_albaranes: false,
        subir_nominas: true,
        subir_contratos: true,
        subir_justificantes: false,
        subir_auditorias: false,
        subir_otros_documentos: true
      },
      reglas: {
        identificador_principal: 'dni',
        origen_identificador: 'contenido_ocr',
        tipo_documento_por_defecto: 'nomina',
        destino_por_defecto: 'modulo_rrhh'
      },
      activo: true,
      fechaAlta: '2023-11-10'
    },
    {
      id: 'AGE-004',
      nombre: 'Laura Martínez',
      tipo: 'gestor',
      empresa: 'Gestoría Empresarial García',
      email: 'laura.martinez@gestoriagarcia.com',
      telefono: '+34 915 432 109',
      modo: 'SAAS',
      username: 'laura_martinez',
      estadoUsuario: 'bloqueado',
      enviarCredenciales: false,
      permisos: {
        puede_subir_nominas: true,
        puede_subir_contratos: false,
        puede_subir_irpf: true,
        puede_ver_documentos_subidos: true,
        puede_exportar_facturacion: true,
        puede_exportar_informes: false
      },
      canal_email_activo: true,
      canal_whatsapp_activo: false,
      recepcion: {
        recibir_pedidos: { activo: false, canal: 'email' },
        recibir_facturas_emitidas: { activo: true, canal: 'saas' },
        recibir_albaranes: { activo: false, canal: 'email' },
        recibir_contratos: { activo: false, canal: 'email' },
        recibir_informes: { activo: true, canal: 'saas' },
        recibir_avisos_generales: { activo: false, canal: 'email' }
      },
      envio: {
        subir_facturas_proveedor: false,
        subir_albaranes: false,
        subir_nominas: true,
        subir_contratos: false,
        subir_justificantes: false,
        subir_auditorias: false,
        subir_otros_documentos: false
      },
      reglas: {
        identificador_principal: 'dni',
        origen_identificador: 'nombre_archivo',
        tipo_documento_por_defecto: 'nomina',
        destino_por_defecto: 'modulo_rrhh'
      },
      activo: false,
      fechaAlta: '2023-08-05'
    }
  ]);

  const handleGuardar = () => {
    toast.success('Configuración guardada correctamente');
  };

  const handleGuardarZonaHoraria = () => {
    // Guardar zona horaria
    const zonaSeleccionada = ZONAS_HORARIAS_DISPONIBLES.find(z => z.value === zonaHorariaTemporal);
    if (zonaSeleccionada) {
      actualizarZonaHorariaReferencia(zonaHorariaTemporal, zonaSeleccionada.label);
    }
    
    // Guardar hora de ejecución
    actualizarHoraEjecucionReferencia(horaTemporal, minutoTemporal);
    
    // Actualizar estados
    setConfigZonaHoraria(obtenerConfiguracionZonaHoraria());
    setInfoProximaEjecucion(obtenerProximaEjecucionLocal());
    
    setModalZonaHorariaOpen(false);
    toast.success('Configuración de volcado de datos actualizada correctamente');
  };

  const handleCambiarRol = () => {
    if (!onCambiarRol || !user) return;
    
    // Rotar entre roles: cliente → trabajador → gerente → cliente
    const siguienteRol = 
      user.role === 'cliente' ? 'trabajador' :
      user.role === 'trabajador' ? 'gerente' :
      'cliente';
    
    const nombreRol = 
      siguienteRol === 'cliente' ? 'Cliente' :
      siguienteRol === 'trabajador' ? 'Colaborador/Trabajador' :
      'Gerente General';
    
    onCambiarRol(siguienteRol);
    toast.success(`Cambiado a perfil de ${nombreRol} 🔄`);
  };

  const handleSaveAgenteExterno = (agente: AgenteExternoType) => {
    if (agenteExternoSeleccionado) {
      // Actualizar agente existente
      setAgentesExternos(agentesExternos.map(a => a.id === agente.id ? agente : a));
    } else {
      // Añadir nuevo agente
      setAgentesExternos([...agentesExternos, agente]);
    }
  };

  const handleAñadirPuntoVenta = () => {
    setPuntoVentaEditando(null);
    setModalPuntoVentaOpen(true);
  };

  const handleEditarPuntoVenta = (punto: PuntoVenta) => {
    setPuntoVentaEditando(punto);
    setModalPuntoVentaOpen(true);
  };

  const handleEliminarPuntoVenta = (id: string) => {
    setPuntosVenta(puntosVenta.filter(p => p.id !== id));
    toast.success('Punto de venta eliminado');
  };

  const handleTogglePuntoVenta = (id: string) => {
    setPuntosVenta(puntosVenta.map(p => 
      p.id === id ? { ...p, activo: !p.activo } : p
    ));
    toast.success('Estado actualizado');
  };

  const handleGuardarPuntoVenta = () => {
    // Aquí iría la lógica para guardar/actualizar el punto de venta
    setModalPuntoVentaOpen(false);
    toast.success(puntoVentaEditando ? 'Punto de venta actualizado' : 'Punto de venta añadido');
  };

  // Manejar carga de imagen del logo de empresa
  const handleLogoEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    // Convertir a base64 para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoEmpresaTemporal(reader.result as string);
      toast.success('Logo cargado correctamente');
    };
    reader.readAsDataURL(file);
  };

  // Eliminar logo de empresa
  const eliminarLogoEmpresa = () => {
    setLogoEmpresaTemporal('');
    toast.info('Logo eliminado');
  };

  const handleGuardarMarca = () => {
    // Aquí iría la lógica para guardar/actualizar la marca
    setModalMarcaOpen(false);
    setLogoEmpresaTemporal(''); // Resetear el logo temporal
    toast.success(marcaEditando ? 'Empresa actualizada' : 'Empresa añadida correctamente');
  };

  const handleAñadirPuntoVentaMarca = () => {
    setPuntosVentaTemp([...puntosVentaTemp, { nombreComercial: '', direccion: '' }]);
  };

  const handleEliminarPuntoVentaMarca = (index: number) => {
    const nuevosPuntos = puntosVentaTemp.filter((_, i) => i !== index);
    setPuntosVentaTemp(nuevosPuntos);
  };

  const handleAñadirCuentaBancaria = () => {
    setCuentasBancariasTemp([...cuentasBancariasTemp, { numero: '', alias: '' }]);
  };

  const handleEliminarCuentaBancaria = (index: number) => {
    const nuevasCuentas = cuentasBancariasTemp.filter((_, i) => i !== index);
    setCuentasBancariasTemp(nuevasCuentas);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Configuración
        </h1>
        <p className="text-gray-600 text-sm">
          Gestiona tu cuenta, empresas y preferencias
        </p>
      </div>

      {/* Banner de Modo Desarrollo - Cambiar Rol */}
      {onCambiarRol && user && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 shrink-0">
                  <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">
                    <span className="hidden sm:inline">Modo Desarrollo - Cambio de Perfil</span>
                    <span className="sm:hidden">Cambio de Perfil</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Rol: <span className="font-semibold text-amber-700">
                      {user.role === 'cliente' ? 'Cliente' : 
                       user.role === 'trabajador' ? 'Trabajador' : 'Gerente'}
                    </span>
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleCambiarRol}
                className="bg-amber-600 hover:bg-amber-700 gap-1.5 sm:gap-2 w-full sm:w-auto text-sm h-9 sm:h-10"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cambiar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <Button
          onClick={() => setFiltroActivo('cuenta')}
          variant={filtroActivo === 'cuenta' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'cuenta' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Cuenta
        </Button>
        <Button
          onClick={() => setFiltroActivo('puntosVenta')}
          variant={filtroActivo === 'puntosVenta' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'puntosVenta' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Empresas
        </Button>
        <Button
          onClick={() => setFiltroActivo('marcas')}
          variant={filtroActivo === 'marcas' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'marcas' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Marcas
        </Button>
        <Button
          onClick={() => setFiltroActivo('presupuesto')}
          variant={filtroActivo === 'presupuesto' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'presupuesto' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Presupuesto</span>
          <span className="sm:hidden">Presu.</span>
        </Button>
        <Button
          onClick={() => setFiltroActivo('agentes')}
          variant={filtroActivo === 'agentes' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'agentes' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Agentes Externos</span>
          <span className="sm:hidden">Agentes</span>
        </Button>
        <Button
          onClick={() => setFiltroActivo('privacidad')}
          variant={filtroActivo === 'privacidad' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'privacidad' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Privacidad</span>
          <span className="sm:hidden">Priv.</span>
        </Button>
        <Button
          onClick={() => setFiltroActivo('seguridad')}
          variant={filtroActivo === 'seguridad' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'seguridad' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Seguridad</span>
          <span className="sm:hidden">Segur.</span>
        </Button>
        <Button
          onClick={() => setFiltroActivo('notificaciones')}
          variant={filtroActivo === 'notificaciones' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'notificaciones' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Notificaciones</span>
          <span className="sm:hidden">Notif.</span>
        </Button>
        <Button
          onClick={() => setFiltroActivo('sistema')}
          variant={filtroActivo === 'sistema' ? 'default' : 'outline'}
          size="sm"
          className={`text-xs sm:text-sm h-8 sm:h-9 ${filtroActivo === 'sistema' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Cog className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Sistema
        </Button>
      </div>

      {/* Contenido según filtro activo */}
      {filtroActivo === 'cuenta' && (
        <div className="space-y-6">
          {/* Información de la Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de perfil */}
              <div className="flex items-start gap-6 pb-6 border-b">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="https://images.unsplash.com/photo-1755519024827-fd05075a7200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHByb2ZpbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMwNjI1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      CM
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => {
                      toast.info('Abriendo selector de imagen...');
                    }}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Carlos Martínez</p>
                  <p className="text-sm text-gray-600">Gerente</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" placeholder="Carlos Martínez" defaultValue="Carlos Martínez" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Gerente_general
                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => toast.info('Rol cambiado a Gerente General')}>
                        Gerente_general
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Rol cambiado a Gerente Empresa')}>
                        Gerente_empresa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Rol cambiado a Gerente Marca')}>
                        Gerente_marca
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Rol cambiado a Gerente Punto de Venta')}>
                        Gerente_punto_venta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Rol cambiado a Trabajador')}>
                        Trabajador
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Rol cambiado a Cliente')}>
                        Cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="text-xs text-gray-500">Define qué puede ver y hacer este usuario</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="carlos.martinez@hoypecamos.com" defaultValue="carlos.martinez@hoypecamos.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" type="tel" placeholder="+34 600 123 456" defaultValue="+34 600 123 456" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" placeholder="Gerente General" defaultValue="Gerente General" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" placeholder="Food 360" defaultValue="Food 360" disabled />
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Contexto por Defecto
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Define con qué empresa, marca y punto de venta entrará este usuario al sistema
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa-defecto">Empresa por Defecto</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Hostelería (PAU)
                          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => toast.info('Empresa por defecto: Hostelería')}>
                          Hostelería (PAU)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Empresa por defecto: Eventos')}>
                          Eventos (PAU)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Empresa por defecto: Construcción')}>
                          Construcción (PAU)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs text-gray-500">ID: EMP-001 (Hostelería)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marca-defecto">Marca por Defecto</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Pizzas
                          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => toast.info('Marca por defecto: Pizzas')}>
                          Pizzas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Marca por defecto: Burguers')}>
                          Burguers
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs text-gray-500">ID: MRC-001 (Pizzas)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="punto-venta-defecto">Punto de Venta por Defecto</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Tiana
                          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full">
                        <DropdownMenuItem onClick={() => toast.info('Punto de venta por defecto: Tiana')}>
                          Tiana
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Punto de venta por defecto: Badalona')}>
                          Badalona
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-xs text-gray-500">ID: PDV-001 (Tiana)</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {filtroActivo === 'agentes' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Agentes Externos
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Gestiona usuarios externos con permisos específicos
                </p>
              </div>
              <Button
                onClick={() => {
                  setAgenteExternoSeleccionado(null);
                  setModalAgenteExternoOpen(true);
                }}
                className="bg-teal-600 hover:bg-teal-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Agente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead>Canales</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentesExternos.map((agente) => (
                  <TableRow key={agente.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{agente.nombre}</p>
                        <p className="text-xs text-gray-500">{agente.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {agente.tipo === 'proveedor' ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <TruckIcon className="w-3 h-3 mr-1" />
                          Proveedor
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Building2 className="w-3 h-3 mr-1" />
                          Gestor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{agente.empresa}</p>
                    </TableCell>
                    <TableCell>
                      {agente.modo === 'SAAS' ? (
                        <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                          <Lock className="w-3 h-3 mr-1" />
                          SaaS
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Canal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {agente.modo === 'SAAS' && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-teal-50 border border-teal-200 rounded">
                            <Lock className="w-3 h-3 text-teal-600" />
                            <span className="text-xs text-teal-700">Login</span>
                          </div>
                        )}
                        {agente.canal_email_activo && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded">
                            <Mail className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-blue-700">Email</span>
                          </div>
                        )}
                        {agente.canal_whatsapp_activo && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded">
                            <MessageSquare className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-700">WhatsApp</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{agente.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{agente.telefono}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {agente.activo ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          onClick={() => {
                            setAgenteExternoSeleccionado(agente);
                            setModalAgenteExternoOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => {
                            const nuevoEstado = !agente.activo;
                            setAgentesExternos(agentesExternos.map(a => 
                              a.id === agente.id ? { ...a, activo: nuevoEstado } : a
                            ));
                            toast.success(`Agente ${nuevoEstado ? 'activado' : 'desactivado'}`);
                          }}
                          variant="ghost"
                          size="sm"
                          className={agente.activo ? 'text-gray-600' : 'text-green-600'}
                        >
                          {agente.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'puntosVenta' && (
        <ConfiguracionEmpresas />
      )}

      {filtroActivo === 'marcas' && (
        <GestionMarcas />
      )}

      {filtroActivo === 'presupuesto' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              {/* Título */}
              <div className="flex-shrink-0">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Gestión de Presupuestos
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Define objetivos financieros para tus puntos de venta
                </p>
              </div>

              {/* Controles de filtros */}
              <div className="flex items-center gap-3 overflow-x-auto flex-nowrap pb-2">
                {/* Filtro Empresa / Marcas */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 flex-shrink-0 touch-target">
                      <Building2 className="h-4 w-4" />
                      {empresaPresupuestoSeleccionada === 'todas' ? 'Todas las marcas' : 
                       empresaPresupuestoSeleccionada === 'modomio' ? 'Modomio' : 
                       empresaPresupuestoSeleccionada === 'blackburguer' ? 'Blackburguer' : 'Marca'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem
                      onClick={() => {
                        setEmpresaPresupuestoSeleccionada('todas');
                        setMarcaPresupuestoSeleccionada('todas');
                      }}
                      className={empresaPresupuestoSeleccionada === 'todas' ? 'bg-teal-50' : ''}
                    >
                      Todas las marcas
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEmpresaPresupuestoSeleccionada('modomio');
                        setMarcaPresupuestoSeleccionada('todas');
                      }}
                      className={empresaPresupuestoSeleccionada === 'modomio' ? 'bg-teal-50' : ''}
                    >
                      Modomio
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEmpresaPresupuestoSeleccionada('blackburguer');
                        setMarcaPresupuestoSeleccionada('todas');
                      }}
                      className={empresaPresupuestoSeleccionada === 'blackburguer' ? 'bg-teal-50' : ''}
                    >
                      Blackburguer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Filtro Puntos de Venta (según empresa seleccionada) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 flex-shrink-0 touch-target">
                      <MapPin className="h-4 w-4" />
                      {puntoVentaPresupuestoSeleccionado === 'todos' ? 'Todos los puntos' : 
                       puntoVentaPresupuestoSeleccionado === 'tiana' ? 'Tiana' : 
                       puntoVentaPresupuestoSeleccionado === 'badalona' ? 'Badalona' : 'Punto de Venta'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem
                      onClick={() => setPuntoVentaPresupuestoSeleccionado('todos')}
                      className={puntoVentaPresupuestoSeleccionado === 'todos' ? 'bg-teal-50' : ''}
                    >
                      Todos los puntos
                    </DropdownMenuItem>
                    {empresaPresupuestoSeleccionada !== 'todas' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => setPuntoVentaPresupuestoSeleccionado('tiana')}
                          className={puntoVentaPresupuestoSeleccionado === 'tiana' ? 'bg-teal-50' : ''}
                        >
                          Tiana
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setPuntoVentaPresupuestoSeleccionado('badalona')}
                          className={puntoVentaPresupuestoSeleccionado === 'badalona' ? 'bg-teal-50' : ''}
                        >
                          Badalona
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Subfiltro Totales / Puntos de Venta */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 flex-shrink-0 touch-target">
                      {subfiltroPresupuesto === 'totales' ? 'Totales' : 'Puntos de Venta'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[180px]">
                    <DropdownMenuItem
                      onClick={() => setSubfiltroPresupuesto('totales')}
                      className={subfiltroPresupuesto === 'totales' ? 'bg-teal-50' : ''}
                    >
                      Totales
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSubfiltroPresupuesto('puntosVenta')}
                      className={subfiltroPresupuesto === 'puntosVenta' ? 'bg-teal-50' : ''}
                    >
                      Puntos de Venta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Selector de año */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 flex-shrink-0 touch-target">
                      {añoPresupuesto}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[120px]">
                    {[2024, 2025, 2026, 2027].map((año) => (
                      <DropdownMenuItem
                        key={año}
                        onClick={() => setAñoPresupuesto(año)}
                        className={añoPresupuesto === año ? 'bg-teal-50' : ''}
                      >
                        {año}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Botón Guardar */}
                <Button 
                  size="sm" 
                  className="bg-teal-600 hover:bg-teal-700 flex-shrink-0"
                  onClick={() => {
                    toast.success('Presupuesto guardado correctamente');
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Configuración Fiscal */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Configuración Fiscal
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Define el porcentaje del Impuesto sobre Sociedades aplicable
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="impuestoSociedades" className="text-sm font-medium text-blue-900">
                    Impuesto sobre Sociedades:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="impuestoSociedades"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={porcentajeImpuestoSociedades}
                      onChange={(e) => setPorcentajeImpuestoSociedades(parseFloat(e.target.value) || 0)}
                      className="w-20 text-right"
                    />
                    <span className="text-blue-900 font-medium">%</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Este porcentaje se aplicará automáticamente sobre el BAI en el cálculo del EBITDA y Cuenta de Resultados
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                    <TableHead className="w-1/4">Concepto general</TableHead>
                    <TableHead className="w-1/3">Subconcepto / detalle</TableHead>
                    <TableHead className="text-right w-1/6">Resultado (€)</TableHead>
                    <TableHead className="text-right w-1/6">Objetivo (€)</TableHead>
                    <TableHead className="text-center w-16">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* INGRESOS NETOS */}
                  <TableRow 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => setExpandidoPresupuesto(prev => ({ ...prev, ingresosNetos: !prev.ingresosNetos }))}
                  >
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        {expandidoPresupuesto.ingresosNetos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        INGRESOS NETOS
                      </div>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold">305.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="303000"
                        className="text-right h-8 w-28 ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {expandidoPresupuesto.ingresosNetos && (
                    <>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Ingresos por ventas en mostrador</TableCell>
                        <TableCell className="text-right text-gray-600">180.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="175000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Ingresos App / Web</TableCell>
                        <TableCell className="text-right text-gray-600">90.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="85000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Ingresos por terceros (apps de delivery)</TableCell>
                        <TableCell className="text-right text-gray-600">30.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="35000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Otros ingresos (eventos, alquiler de sala, etc.)</TableCell>
                        <TableCell className="text-right text-gray-600">5.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="8000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* TOTAL INGRESOS NETOS */}
                  <TableRow className="bg-teal-50 border-y">
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      TOTAL INGRESOS NETOS
                    </TableCell>
                    <TableCell className="font-medium">Suma ingresos</TableCell>
                    <TableCell className="text-right font-bold">305.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="303000"
                        className="text-right h-8 w-28 ml-auto font-bold"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* COSTE DE VENTAS */}
                  <TableRow 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => setExpandidoPresupuesto(prev => ({ ...prev, costeVentas: !prev.costeVentas }))}
                  >
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        {expandidoPresupuesto.costeVentas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        COSTE DE VENTAS
                      </div>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold">122.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="125000"
                        className="text-right h-8 w-28 ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {expandidoPresupuesto.costeVentas && (
                    <>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Materias primas alimentación (pan, bollería, etc.)</TableCell>
                        <TableCell className="text-right text-gray-600">70.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="75000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Bebidas y complementos</TableCell>
                        <TableCell className="text-right text-gray-600">18.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="20000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Envases y embalajes</TableCell>
                        <TableCell className="text-right text-gray-600">9.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="10000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Mermas y roturas</TableCell>
                        <TableCell className="text-right text-gray-600">15.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="12000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Consumos internos (productos para personal, etc.)</TableCell>
                        <TableCell className="text-right text-gray-600">10.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="8000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* TOTAL COSTE DE VENTAS */}
                  <TableRow className="bg-teal-50 border-y">
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      TOTAL COSTE DE VENTAS
                    </TableCell>
                    <TableCell className="font-medium">Suma costes de ventas</TableCell>
                    <TableCell className="text-right font-bold">122.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="125000"
                        className="text-right h-8 w-28 ml-auto font-bold"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* MARGEN BRUTO */}
                  <TableRow className="bg-yellow-50 border-y-2 border-yellow-300">
                    <TableCell className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      MARGEN BRUTO
                    </TableCell>
                    <TableCell className="font-medium">Ingresos netos – Coste de ventas</TableCell>
                    <TableCell className="text-right font-bold text-lg">183.000</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      <Input 
                        type="number" 
                        defaultValue="178000"
                        className="text-right h-9 w-28 ml-auto font-bold text-lg"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* GASTOS OPERATIVOS */}
                  <TableRow 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => setExpandidoPresupuesto(prev => ({ ...prev, gastosOperativos: !prev.gastosOperativos }))}
                  >
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        {expandidoPresupuesto.gastosOperativos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        GASTOS OPERATIVOS
                      </div>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold">132.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="143000"
                        className="text-right h-8 w-28 ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {expandidoPresupuesto.gastosOperativos && (
                    <>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Personal (sueldos + Seguridad Social)</TableCell>
                        <TableCell className="text-right text-gray-600">90.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="95000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Alquiler del local</TableCell>
                        <TableCell className="text-right text-gray-600">18.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="18000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Suministros (luz, agua, gas)</TableCell>
                        <TableCell className="text-right text-gray-600">8.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="9000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Limpieza e higiene</TableCell>
                        <TableCell className="text-right text-gray-600">4.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="5000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Marketing y publicidad</TableCell>
                        <TableCell className="text-right text-gray-600">3.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="5000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Transporte y reparto</TableCell>
                        <TableCell className="text-right text-gray-600">5.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="6000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Comisiones TPV / pasarela de pago</TableCell>
                        <TableCell className="text-right text-gray-600">4.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="5000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* TOTAL GASTOS OPERATIVOS */}
                  <TableRow className="bg-teal-50 border-y">
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      TOTAL GASTOS OPERATIVOS
                    </TableCell>
                    <TableCell className="font-medium">Suma gastos operativos</TableCell>
                    <TableCell className="text-right font-bold">132.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="143000"
                        className="text-right h-8 w-28 ml-auto font-bold"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* EBITDA */}
                  <TableRow className="bg-green-50 border-y-2 border-green-300">
                    <TableCell className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      EBITDA
                    </TableCell>
                    <TableCell className="font-medium">Margen bruto – Gastos operativos</TableCell>
                    <TableCell className="text-right font-bold text-lg">51.000</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      <Input 
                        type="number" 
                        defaultValue="35000"
                        className="text-right h-9 w-28 ml-auto font-bold text-lg"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* COSTES ESTRUCTURALES */}
                  <TableRow 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => setExpandidoPresupuesto(prev => ({ ...prev, costesEstructurales: !prev.costesEstructurales }))}
                  >
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <div className="flex items-center gap-2">
                        {expandidoPresupuesto.costesEstructurales ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        COSTES ESTRUCTURALES
                      </div>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold">17.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="20000"
                        className="text-right h-8 w-28 ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {expandidoPresupuesto.costesEstructurales && (
                    <>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Asesoría contable y laboral</TableCell>
                        <TableCell className="text-right text-gray-600">6.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="6500"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Software y licencias (ERP, TPV, etc.)</TableCell>
                        <TableCell className="text-right text-gray-600">4.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="5000"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Seguros (RC, multirriesgo, etc.)</TableCell>
                        <TableCell className="text-right text-gray-600">3.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="3500"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Telefonía e internet</TableCell>
                        <TableCell className="text-right text-gray-600">2.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="2500"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-50">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">Gastos bancarios</TableCell>
                        <TableCell className="text-right text-gray-600">2.000</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            defaultValue="2500"
                            className="text-right h-8 w-28 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* TOTAL COSTES ESTRUCTURALES */}
                  <TableRow className="bg-teal-50 border-y">
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      TOTAL COSTES ESTRUCT.
                    </TableCell>
                    <TableCell className="font-medium">Suma costes estructurales</TableCell>
                    <TableCell className="text-right font-bold">17.000</TableCell>
                    <TableCell className="text-right font-bold">
                      <Input 
                        type="number" 
                        defaultValue="20000"
                        className="text-right h-8 w-28 ml-auto font-bold"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* BAI */}
                  <TableRow className="bg-blue-50 border-y-2 border-blue-300">
                    <TableCell className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      BAI
                    </TableCell>
                    <TableCell className="font-medium">EBITDA – Costes estructurales</TableCell>
                    <TableCell className="text-right font-bold text-lg">34.000</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      <Input 
                        type="number" 
                        defaultValue="15000"
                        className="text-right h-9 w-28 ml-auto font-bold text-lg"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* IMPUESTO SOCIEDADES */}
                  <TableRow>
                    <TableCell className="font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      IMPUESTO SOCIEDADES
                    </TableCell>
                    <TableCell>25% aprox. sobre BAI</TableCell>
                    <TableCell className="text-right font-medium">–8.500</TableCell>
                    <TableCell className="text-right text-gray-600">
                      <Input 
                        type="number" 
                        defaultValue="-3750"
                        className="text-right h-8 w-28 ml-auto"
                      />
                    </TableCell>
                    <TableCell className="text-center"></TableCell>
                  </TableRow>

                  {/* Espaciador */}
                  <TableRow className="h-4">
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>

                  {/* BENEFICIO NETO */}
                  <TableRow className="bg-purple-50 border-y-2 border-purple-300">
                    <TableCell className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      BENEFICIO NETO
                    </TableCell>
                    <TableCell className="font-medium">BAI – Impuesto de sociedades</TableCell>
                    <TableCell className="text-right font-bold text-lg">25.500</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      <Input 
                        type="number" 
                        defaultValue="11250"
                        className="text-right h-9 w-28 ml-auto font-bold text-lg"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'privacidad' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Configuración de Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Estado en Línea</Label>
                  <p className="text-sm text-gray-500">Otros pueden ver cuando estás conectado</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compartir Datos de Rendimiento</Label>
                  <p className="text-sm text-gray-500">Permite compartir estadísticas con el equipo</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visibilidad del Perfil</Label>
                  <p className="text-sm text-gray-500">Tu perfil es visible para todos los empleados</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Mensajes Directos</Label>
                  <p className="text-sm text-gray-500">Los empleados pueden enviarte mensajes directos</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Historial de Actividad</Label>
                  <p className="text-sm text-gray-500">Guardar registro de todas las acciones realizadas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'seguridad' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Seguridad de la Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-actual">Contraseña Actual</Label>
                <Input id="password-actual" type="password" placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-nueva">Nueva Contraseña</Label>
                <Input id="password-nueva" type="password" placeholder="••••••••" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-confirmar">Confirmar Nueva Contraseña</Label>
                <Input id="password-confirmar" type="password" placeholder="••••••••" />
              </div>

              <Button 
                onClick={() => toast.success('Contraseña actualizada correctamente')}
                variant="outline"
                className="w-full"
              >
                Actualizar Contraseña
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores (2FA)</Label>
                  <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de Inicio de Sesión</Label>
                  <p className="text-sm text-gray-500">Recibe alertas cuando alguien acceda a tu cuenta</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sesiones Activas</Label>
                  <p className="text-sm text-gray-500">Gestiona los dispositivos conectados a tu cuenta</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  Ver Sesiones
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registro de Auditoría</Label>
                  <p className="text-sm text-gray-500">Historial de cambios y acciones importantes</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  Ver Registro
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'notificaciones' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Preferencias de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operativa y Pedidos */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">Operativa y Pedidos</span>
                    <Badge variant="secondary" className="ml-2">2</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pedidos Nuevos</Label>
                    <p className="text-sm text-gray-500">Recibir alerta cuando haya un nuevo pedido</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stock Bajo</Label>
                    <p className="text-sm text-gray-500">Alertas cuando el inventario esté por debajo del mínimo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Recursos Humanos */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Recursos Humanos</span>
                    <Badge variant="secondary" className="ml-2">3</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Solicitudes de Vacaciones</Label>
                    <p className="text-sm text-gray-500">Cuando un empleado solicite vacaciones</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Horas Extra</Label>
                    <p className="text-sm text-gray-500">Solicitudes de horas extraordinarias</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fichajes Tardíos</Label>
                    <p className="text-sm text-gray-500">Alertas de retrasos en fichajes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Finanzas */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Finanzas</span>
                    <Badge variant="secondary" className="ml-2">3</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Facturas Pendientes</Label>
                    <p className="text-sm text-gray-500">Recordatorios de facturas por pagar</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pagos Recibidos</Label>
                    <p className="text-sm text-gray-500">Confirmación de pagos de clientes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reportes Diarios</Label>
                    <p className="text-sm text-gray-500">Resumen financiero al final del día</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Incidencias y Alertas */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Incidencias y Alertas</span>
                    <Badge variant="secondary" className="ml-2">1</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Incidencias Críticas</Label>
                    <p className="text-sm text-gray-500">Notificaciones de incidencias de alta prioridad</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Canales de Comunicación */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full justify-between p-4 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Canales de Comunicación</span>
                    <Badge variant="secondary" className="ml-2">3</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Email</Label>
                    <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-gray-500">Alertas en tiempo real en el navegador</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones SMS</Label>
                    <p className="text-sm text-gray-500">Mensajes de texto para alertas críticas</p>
                  </div>
                  <Switch />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtroActivo === 'sistema' && (
        <div className="space-y-6">
          {/* Subfiltros de Sistema */}
          <div className="flex gap-2">
            <Button
              onClick={() => setSubfiltroSistema('configuracion')}
              variant={subfiltroSistema === 'configuracion' ? 'default' : 'outline'}
              className={subfiltroSistema === 'configuracion' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Cog className="w-4 h-4 mr-2" />
              Configuración del Sistema
            </Button>
            <Button
              onClick={() => setSubfiltroSistema('chats')}
              variant={subfiltroSistema === 'chats' ? 'default' : 'outline'}
              className={subfiltroSistema === 'chats' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chats
            </Button>
            <Button
              onClick={() => setSubfiltroSistema('quienesSomos')}
              variant={subfiltroSistema === 'quienesSomos' ? 'default' : 'outline'}
              className={subfiltroSistema === 'quienesSomos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Quienes Somos
            </Button>
            <Button
              onClick={() => setSubfiltroSistema('faqs')}
              variant={subfiltroSistema === 'faqs' ? 'default' : 'outline'}
              className={subfiltroSistema === 'faqs' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              FAQs
            </Button>
            <Button
              onClick={() => setSubfiltroSistema('tpv')}
              variant={subfiltroSistema === 'tpv' ? 'default' : 'outline'}
              className={subfiltroSistema === 'tpv' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Monitor className="w-4 h-4 mr-2" />
              TPV
            </Button>
            <Button
              onClick={() => setSubfiltroSistema('importacion')}
              variant={subfiltroSistema === 'importacion' ? 'default' : 'outline'}
              className={subfiltroSistema === 'importacion' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importación
            </Button>
            <Button
              onClick={() => setSubfiltroSistema('cupones')}
              variant={subfiltroSistema === 'cupones' ? 'default' : 'outline'}
              className={subfiltroSistema === 'cupones' ? 'bg-teal-600 hover:bg-teal-700' : ''}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Cupones y Reglas
            </Button>
          </div>

          {/* Contenido Configuración del Sistema */}
          {subfiltroSistema === 'configuracion' && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Versión de la Aplicación</Label>
                  <p className="text-sm text-gray-500">Can Farines v2.4.1</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  Actualizada
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Oscuro</Label>
                  <p className="text-sm text-gray-500">Cambiar tema de la interfaz</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Idioma</Label>
                  <p className="text-sm text-gray-500">Español (España)</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  Cambiar
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Copia de Seguridad</Label>
                  <p className="text-sm text-gray-500">Última copia: 18 Nov 2025, 22:00</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  Crear Backup
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Caché del Sistema</Label>
                  <p className="text-sm text-gray-500">Limpiar datos temporales para mejorar rendimiento</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target" onClick={() => toast.success('Caché limpiada correctamente')}>
                  Limpiar Caché
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logs del Sistema</Label>
                  <p className="text-sm text-gray-500">Ver registros de actividad del sistema</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  Ver Logs
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exportar Datos</Label>
                  <p className="text-sm text-gray-500">Descargar todos los datos de la empresa</p>
                </div>
                <Button variant="outline" size="sm" className="touch-target">
                  Exportar
                </Button>
              </div>
            </div>

            {/* NUEVA SECCIÓN: Configuración de Volcado de Datos */}
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Volcado Automático de Datos</h3>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
                <div className="space-y-3">
                  {/* Hora de referencia configurada */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-teal-600" />
                        <Label className="text-sm font-semibold text-gray-900">Zona Horaria de Referencia</Label>
                      </div>
                      <p className="text-sm text-gray-700">
                        {configZonaHoraria.nombreZonaHoraria}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Hora de ejecución */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <Label className="text-sm font-semibold text-gray-900">Hora de Volcado (Zona de referencia)</Label>
                      </div>
                      <p className="text-sm text-gray-700">
                        {infoProximaEjecucion.horaReferenciaStr} - Todos los días
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Próxima ejecución en hora local */}
                  <div className="bg-white rounded-lg p-3 border border-teal-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-purple-600" />
                          <Label className="text-sm font-semibold text-purple-900">Tu Próxima Ejecución (Hora Local)</Label>
                        </div>
                        <p className="text-sm text-purple-800 font-medium">
                          {infoProximaEjecucion.fechaLocal.toLocaleString('es-ES', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          {infoProximaEjecucion.horaLocalStr} en tu zona horaria
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón para configurar */}
                  <div className="pt-2">
                    <Button 
                      onClick={() => {
                        setZonaHorariaTemporal(configZonaHoraria.zonaHorariaReferencia);
                        setHoraTemporal(configZonaHoraria.horaEjecucionReferencia);
                        setMinutoTemporal(configZonaHoraria.minutoEjecucionReferencia);
                        setModalZonaHorariaOpen(true);
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurar Hora y Zona Horaria
                    </Button>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-blue-900">
                    <p className="font-medium mb-1">¿Qué es el volcado automático de datos?</p>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Se ejecuta automáticamente cada día a la hora configurada</li>
                      <li>• Procesa fichajes, calcula métricas y genera reportes</li>
                      <li>• La hora se convierte automáticamente a la zona horaria local de cada usuario</li>
                      <li>• Ver el estado y logs de las tareas automatizadas a continuación</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Monitor de Tareas Automatizadas */}
              <div className="mt-6">
                <CronJobsMonitor />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
                Guardar Cambios
              </Button>
            </div>
              </CardContent>
            </Card>
          )}

          {/* Contenido Chats */}
          {subfiltroSistema === 'chats' && (
            <ConfiguracionChats />
          )}

          {/* Contenido Quienes Somos */}
          {subfiltroSistema === 'quienesSomos' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Editar Quiénes Somos
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta información se mostrará en el perfil del cliente. Arrastra para reordenar.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        const nuevoElemento = {
                          id: Date.now().toString() + '-texto',
                          tipo: 'texto' as const,
                          titulo: 'Nuevo Apartado',
                          contenido: 'Escribe aquí el contenido...',
                          orden: quienesSomos.elementos.length
                        };
                        setQuienesSomos({
                          ...quienesSomos,
                          elementos: [...quienesSomos.elementos, nuevoElemento]
                        });
                        toast.success('Nuevo apartado añadido');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Texto
                    </Button>
                    <Button 
                      onClick={() => {
                        const imageUrl = prompt('Pega la URL de la imagen o deja vacío para usar una imagen por defecto');
                        const defaultImage = 'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc2NDI4NTU2NHww&ixlib=rb-4.1.0&q=80&w=1080';
                        
                        const nuevoElemento = {
                          id: Date.now().toString() + '-imagen',
                          tipo: 'imagen' as const,
                          titulo: 'Nueva Imagen',
                          contenido: imageUrl && imageUrl.trim() ? imageUrl : defaultImage,
                          orden: quienesSomos.elementos.length
                        };
                        setQuienesSomos({
                          ...quienesSomos,
                          elementos: [...quienesSomos.elementos, nuevoElemento]
                        });
                        toast.success('Imagen añadida correctamente');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Imagen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Título Principal */}
                <div className="space-y-2">
                  <Label htmlFor="qs-titulo">Título de la Sección</Label>
                  <Input
                    id="qs-titulo"
                    value={quienesSomos.titulo}
                    onChange={(e) => setQuienesSomos({ ...quienesSomos, titulo: e.target.value })}
                    placeholder="Quiénes Somos"
                  />
                </div>

                <Separator />

                {/* Elementos reordenables */}
                <div className="space-y-4">
                  <Label>Contenido (arrastra para reordenar)</Label>
                  {quienesSomos.elementos
                    .sort((a, b) => a.orden - b.orden)
                    .map((elemento, index) => (
                    <Card 
                      key={elemento.id} 
                      className="border-2 hover:border-teal-300 transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/html', elemento.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/html');
                        const draggedIndex = quienesSomos.elementos.findIndex(el => el.id === draggedId);
                        const targetIndex = index;
                        
                        if (draggedIndex !== targetIndex) {
                          const newElementos = [...quienesSomos.elementos];
                          const [draggedElement] = newElementos.splice(draggedIndex, 1);
                          newElementos.splice(targetIndex, 0, draggedElement);
                          
                          // Actualizar el orden
                          const elementosConOrden = newElementos.map((el, idx) => ({
                            ...el,
                            orden: idx
                          }));
                          
                          setQuienesSomos({
                            ...quienesSomos,
                            elementos: elementosConOrden
                          });
                          toast.success('Orden actualizado');
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Handle para arrastrar */}
                          <div className="flex items-start pt-8 cursor-move">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>

                          {/* Contenido del elemento */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {elemento.tipo === 'texto' ? 'Texto' : 'Imagen'} #{index + 1}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const nuevosElementos = quienesSomos.elementos
                                    .filter(el => el.id !== elemento.id)
                                    .map((el, idx) => ({ ...el, orden: idx }));
                                  setQuienesSomos({
                                    ...quienesSomos,
                                    elementos: nuevosElementos
                                  });
                                  toast.success('Elemento eliminado');
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Campo título editable */}
                            <div className="space-y-2">
                              <Label>Título del apartado</Label>
                              <Input
                                value={elemento.titulo}
                                onChange={(e) => {
                                  const nuevosElementos = quienesSomos.elementos.map(el =>
                                    el.id === elemento.id ? { ...el, titulo: e.target.value } : el
                                  );
                                  setQuienesSomos({
                                    ...quienesSomos,
                                    elementos: nuevosElementos
                                  });
                                }}
                                placeholder="Título del apartado"
                              />
                            </div>

                            {/* Contenido según tipo */}
                            {elemento.tipo === 'texto' ? (
                              <div className="space-y-2">
                                <Label>Contenido</Label>
                                <Textarea
                                  value={elemento.contenido}
                                  onChange={(e) => {
                                    const nuevosElementos = quienesSomos.elementos.map(el =>
                                      el.id === elemento.id ? { ...el, contenido: e.target.value } : el
                                    );
                                    setQuienesSomos({
                                      ...quienesSomos,
                                      elementos: nuevosElementos
                                    });
                                  }}
                                  placeholder="Escribe el contenido..."
                                  rows={4}
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label>Imagen</Label>
                                <div className="relative group">
                                  <img 
                                    src={elemento.contenido} 
                                    alt={elemento.titulo}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => {
                                        const imageUrl = prompt('Pega la URL de la nueva imagen');
                                        if (imageUrl && imageUrl.trim()) {
                                          const nuevosElementos = quienesSomos.elementos.map(el =>
                                            el.id === elemento.id ? { ...el, contenido: imageUrl } : el
                                          );
                                          setQuienesSomos({
                                            ...quienesSomos,
                                            elementos: nuevosElementos
                                          });
                                          toast.success('Imagen actualizada correctamente');
                                        }
                                      }}
                                    >
                                      <Upload className="w-4 h-4 mr-2" />
                                      Cambiar
                                    </Button>
                                  </div>
                                </div>
                                <Input
                                  value={elemento.contenido}
                                  onChange={(e) => {
                                    const nuevosElementos = quienesSomos.elementos.map(el =>
                                      el.id === elemento.id ? { ...el, contenido: e.target.value } : el
                                    );
                                    setQuienesSomos({
                                      ...quienesSomos,
                                      elementos: nuevosElementos
                                    });
                                  }}
                                  placeholder="URL de la imagen"
                                  className="text-xs"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {quienesSomos.elementos.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-4">No hay elementos. Añade texto o imágenes.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Restaurar valores por defecto
                      setQuienesSomos({
                        titulo: 'Quiénes Somos',
                        elementos: [
                          {
                            id: '1',
                            tipo: 'texto' as const,
                            titulo: 'Descripción',
                            contenido: 'Somos una empresa comprometida con la excelencia y la calidad en nuestros productos y servicios. Desde nuestros inicios, hemos trabajado para ofrecer la mejor experiencia a nuestros clientes.',
                            orden: 0
                          },
                          {
                            id: '2',
                            tipo: 'texto' as const,
                            titulo: 'Misión',
                            contenido: 'Proporcionar productos y servicios de alta calidad que superen las expectativas de nuestros clientes.',
                            orden: 1
                          },
                          {
                            id: '3',
                            tipo: 'texto' as const,
                            titulo: 'Visión',
                            contenido: 'Ser líderes en nuestro sector, reconocidos por nuestra innovación y compromiso con la excelencia.',
                            orden: 2
                          },
                          {
                            id: '4',
                            tipo: 'texto' as const,
                            titulo: 'Valores',
                            contenido: 'Calidad, Integridad, Innovación, Compromiso con el cliente, Responsabilidad social',
                            orden: 3
                          }
                        ]
                      });
                      toast.info('Valores restaurados por defecto');
                    }}
                  >
                    Restaurar
                  </Button>
                  <Button 
                    onClick={() => {
                      localStorage.setItem('quienesSomos', JSON.stringify(quienesSomos));
                      toast.success('Información de Quiénes Somos guardada correctamente');
                    }} 
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenido FAQs */}
          {subfiltroSistema === 'faqs' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Gestionar FAQs
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2">
                      Preguntas frecuentes que se mostrarán en el perfil del cliente
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      const newFaq = {
                        id: Date.now().toString(),
                        categoria: 'General',
                        pregunta: 'Nueva pregunta',
                        respuesta: 'Nueva respuesta'
                      };
                      setFaqsList([...faqsList, newFaq]);
                      toast.success('Nueva FAQ añadida');
                    }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqsList.map((faq, index) => (
                  <Card key={faq.id} className="border-2">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Categoría</Label>
                              <Input
                                value={faq.categoria}
                                onChange={(e) => {
                                  const newList = [...faqsList];
                                  newList[index].categoria = e.target.value;
                                  setFaqsList(newList);
                                }}
                                placeholder="Ej: Pedidos, Pagos, Cuenta"
                              />
                            </div>
                            <div className="flex items-end">
                              <Badge variant="outline" className="text-xs">
                                FAQ #{index + 1}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Pregunta</Label>
                            <Input
                              value={faq.pregunta}
                              onChange={(e) => {
                                const newList = [...faqsList];
                                newList[index].pregunta = e.target.value;
                                setFaqsList(newList);
                              }}
                              placeholder="¿Cuál es tu pregunta?"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Respuesta</Label>
                            <Textarea
                              value={faq.respuesta}
                              onChange={(e) => {
                                const newList = [...faqsList];
                                newList[index].respuesta = e.target.value;
                                setFaqsList(newList);
                              }}
                              placeholder="Escribe la respuesta aquí..."
                              rows={3}
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newList = faqsList.filter((_, i) => i !== index);
                            setFaqsList(newList);
                            toast.success('FAQ eliminada');
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {faqsList.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <HelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-4">No hay FAQs configuradas</p>
                    <Button 
                      onClick={() => {
                        const newFaq = {
                          id: Date.now().toString(),
                          categoria: 'General',
                          pregunta: 'Nueva pregunta',
                          respuesta: 'Nueva respuesta'
                        };
                        setFaqsList([newFaq]);
                        toast.success('Primera FAQ añadida');
                      }}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Primera FAQ
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Restaurar FAQs por defecto
                      setFaqsList([
                        {
                          id: '1',
                          categoria: 'Pedidos',
                          pregunta: '¿Cómo puedo realizar un pedido?',
                          respuesta: 'Puedes realizar un pedido directamente desde nuestra app móvil o desde la web. Solo tienes que seleccionar los productos que desees y proceder al pago.'
                        },
                        {
                          id: '2',
                          categoria: 'Pedidos',
                          pregunta: '¿Cuál es el tiempo de entrega?',
                          respuesta: 'El tiempo de entrega estimado es de 30-45 minutos dependiendo de tu ubicación y la disponibilidad de los productos.'
                        },
                        {
                          id: '3',
                          categoria: 'Pagos',
                          pregunta: '¿Qué métodos de pago aceptan?',
                          respuesta: 'Aceptamos pagos con tarjeta de crédito/débito, PayPal, Bizum y pago en efectivo en el momento de la entrega.'
                        },
                        {
                          id: '4',
                          categoria: 'Cuenta',
                          pregunta: '¿Cómo puedo cambiar mi contraseña?',
                          respuesta: 'Puedes cambiar tu contraseña desde la sección de Perfil > Seguridad > Cambiar Contraseña.'
                        }
                      ]);
                      toast.info('FAQs restauradas por defecto');
                    }}
                  >
                    Restaurar
                  </Button>
                  <Button 
                    onClick={() => {
                      localStorage.setItem('faqsList', JSON.stringify(faqsList));
                      toast.success('FAQs guardadas correctamente');
                    }} 
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenido TPV */}
          {subfiltroSistema === 'tpv' && (
            <div className="space-y-6">
              {/* Header con título y botón para añadir TPV */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Gestión de TPVs
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-2">
                        Configura los puntos de venta, marcas asociadas y terminales TPV
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setTpvEditando(null);
                        setModalTPVOpen(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir TPV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {configTPV.map((tpv) => (
                    <Card key={tpv.id} className="border-2">
                      <CardContent className="p-6">
                        {/* Header del TPV */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-100 rounded-lg">
                              <Store className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {tpv.tienda}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {tpv.direccion}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={tpv.activo ? 'default' : 'secondary'} className={tpv.activo ? 'bg-green-100 text-green-700' : ''}>
                                  {tpv.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                                <Badge variant="outline">
                                  {tpv.terminales.length} Terminales
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setTpvEditando(tpv);
                                setModalTPVOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setConfigTPV(configTPV.map(t => 
                                  t.id === tpv.id ? { ...t, activo: !t.activo } : t
                                ));
                                toast.success(`TPV ${tpv.activo ? 'desactivado' : 'activado'}`);
                              }}
                            >
                              <Power className={`w-4 h-4 ${tpv.activo ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setConfigTPV(configTPV.filter(t => t.id !== tpv.id));
                                toast.success('TPV eliminado');
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Marcas Asociadas */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Marcas Asociadas
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {tpv.marcasAsociadas.map((marca, idx) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-700">
                                {marca}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Terminales */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium text-gray-700">
                              Terminales Configurados
                            </h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Abrir modal para configurar nuevo terminal
                                const nuevoTipo = tpv.terminales.length === 0 ? 'principal' : 'secundario';
                                const nuevoNombre = `Terminal ${tpv.terminales.length + 1}`;
                                setTpvIdTerminal(tpv.id);
                                setTerminalEditando({
                                  id: `${tpv.id}-nuevo-${Date.now()}`,
                                  nombre: nuevoNombre,
                                  marcas: [],
                                  estado: 'activo',
                                  tipo: nuevoTipo
                                });
                                setNombreTerminal(nuevoNombre);
                                setTipoTerminal(nuevoTipo);
                                setMarcasSeleccionadas([]);
                                setModalTerminalOpen(true);
                              }}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Añadir Terminal
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tpv.terminales.map((terminal) => (
                              <Card key={terminal.id} className={`border ${
                                terminal.estado === 'inactivo' 
                                  ? 'border-gray-200 bg-gray-50/50 opacity-75' 
                                  : terminal.tipo === 'principal' 
                                    ? 'border-teal-300 bg-teal-50/30' 
                                    : ''
                              }`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className={`p-2 rounded-lg ${terminal.tipo === 'principal' ? 'bg-teal-100' : 'bg-gray-100'}`}>
                                        <Monitor className={`w-4 h-4 ${terminal.tipo === 'principal' ? 'text-teal-600' : 'text-gray-600'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">
                                          {terminal.nombre}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                          {(terminal.marcas || [terminal.marca]).map((marca: string, idx: number) => (
                                            <Badge 
                                              key={idx} 
                                              variant="secondary" 
                                              className="text-[10px] px-1.5 py-0 h-4"
                                            >
                                              {marca}
                                            </Badge>
                                          ))}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${terminal.tipo === 'principal' ? 'border-teal-300 bg-teal-50 text-teal-700' : ''}`}
                                          >
                                            {terminal.tipo === 'principal' ? 'Principal' : 'Secundario'}
                                          </Badge>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              terminal.estado === 'activo' 
                                                ? 'bg-green-100 text-green-700 border-green-300' 
                                                : 'bg-red-100 text-red-700 border-red-300'
                                            }`}
                                          >
                                            {terminal.estado === 'activo' ? '✓ Activo' : '✕ Inactivo'}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 ${
                                          terminal.estado === 'activo' 
                                            ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                                            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                                        }`}
                                        title={terminal.estado === 'activo' ? 'Desactivar terminal' : 'Activar terminal'}
                                        onClick={() => {
                                          const nuevoEstado = terminal.estado === 'activo' ? 'inactivo' : 'activo';
                                          setConfigTPV(configTPV.map(t => 
                                            t.id === tpv.id 
                                              ? {
                                                  ...t,
                                                  terminales: t.terminales.map(term =>
                                                    term.id === terminal.id
                                                      ? { ...term, estado: nuevoEstado }
                                                      : term
                                                  )
                                                }
                                              : t
                                          ));
                                          toast.success(
                                            nuevoEstado === 'activo' 
                                              ? 'Terminal activado correctamente' 
                                              : 'Terminal desactivado correctamente'
                                          );
                                        }}
                                      >
                                        <Power className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        title="Configurar terminal"
                                        onClick={() => {
                                          setTpvIdTerminal(tpv.id);
                                          setTerminalEditando(terminal);
                                          // Inicializar marcas seleccionadas con las marcas del terminal
                                          setMarcasSeleccionadas(terminal.marcas || [terminal.marca] || []);
                                          setNombreTerminal(terminal.nombre || '');
                                          setTipoTerminal(terminal.tipo || 'secundario');
                                          setModalTerminalOpen(true);
                                        }}
                                      >
                                        <Settings className="w-3.5 h-3.5 text-gray-500" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title={terminal.tipo === 'principal' ? 'No se puede eliminar el terminal principal' : 'Eliminar terminal'}
                                        onClick={() => {
                                          if (terminal.tipo === 'principal') {
                                            toast.error('No se puede eliminar el terminal principal');
                                            return;
                                          }
                                          setConfigTPV(configTPV.map(t => 
                                            t.id === tpv.id 
                                              ? { ...t, terminales: t.terminales.filter(term => term.id !== terminal.id) }
                                              : t
                                          ));
                                          toast.success('Terminal eliminado');
                                        }}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {configTPV.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Monitor className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-4">No hay TPVs configurados</p>
                      <Button 
                        onClick={() => {
                          setTpvEditando(null);
                          setModalTPVOpen(true);
                        }}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Primer TPV
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contenido Importación */}
          {subfiltroSistema === 'importacion' && (
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Importación de Datos
                </CardTitle>
                <p className="text-sm text-gray-500 mt-2">
                  Importa datos masivos desde archivos CSV o Excel para poblar rápidamente tu sistema
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Advertencia */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Importante antes de importar</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Asegúrate de que tus archivos siguen el formato correcto. Descarga las plantillas de ejemplo antes de importar tus datos.
                    </p>
                  </div>
                </div>

                {/* Recursos Humanos */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Users className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Recursos Humanos</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trabajadores/Equipo */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Trabajadores</h4>
                              <p className="text-xs text-gray-500">Importar equipo completo</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast.info('Descargando plantilla de trabajadores...');
                              // Aquí iría la lógica de descarga
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) {
                                  toast.success(`Importando ${file.name}...`);
                                  // Aquí iría la lógica de importación
                                }
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Trabajadores
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Nombre, Email, Teléfono, Rol, PDV asignado, Fecha incorporación
                        </p>
                      </CardContent>
                    </Card>

                    {/* Nóminas */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Nóminas</h4>
                              <p className="text-xs text-gray-500">Importar datos salariales</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de nóminas...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Nóminas
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Trabajador ID, Mes/Año, Salario base, Complementos, Deducciones
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Productos y Servicios */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Store className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Productos y Servicios</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Productos */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Store className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Productos/Artículos</h4>
                              <p className="text-xs text-gray-500">Catálogo completo</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de productos...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Productos
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: SKU, Nombre, Descripción, Precio, IVA, Categoría, Stock, PDV
                        </p>
                      </CardContent>
                    </Card>

                    {/* Categorías */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <FileText className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Categorías</h4>
                              <p className="text-xs text-gray-500">Organización de productos</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de categorías...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Categorías
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Nombre, Descripción, Categoría padre, Orden, Icono/Color
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Proveedores y Clientes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <TruckIcon className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Proveedores y Clientes</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Proveedores */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <TruckIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Proveedores</h4>
                              <p className="text-xs text-gray-500">Base de suministradores</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de proveedores...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Proveedores
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Nombre, NIF/CIF, Email, Teléfono, Dirección, Contacto, Condiciones pago
                        </p>
                      </CardContent>
                    </Card>

                    {/* Clientes */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-pink-100 rounded-lg">
                              <User className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Clientes</h4>
                              <p className="text-xs text-gray-500">Base de datos de clientes</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de clientes...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Clientes
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Nombre, Email, Teléfono, NIF, Dirección, Fecha registro, Notas
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Inventario y Stock */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Scan className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Inventario y Stock</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stock Inicial */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                              <Scan className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Stock Inicial</h4>
                              <p className="text-xs text-gray-500">Inventario por PDV</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de stock...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Stock
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Producto SKU, PDV, Cantidad actual, Stock mínimo, Stock máximo
                        </p>
                      </CardContent>
                    </Card>

                    {/* Precios por PDV */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <DollarSign className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Precios</h4>
                              <p className="text-xs text-gray-500">Precios por PDV/Marca</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de precios...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Precios
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Producto SKU, PDV, Marca, Precio venta, Descuento, Vigencia
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Finanzas y EBITDA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Calculator className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-gray-900">Finanzas y EBITDA</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ingresos */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Ingresos</h4>
                              <p className="text-xs text-gray-500">Ingresos históricos y actuales</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de ingresos...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Ingresos
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Fecha, Concepto, Categoría (Ventas/Otros), Subcategoría, Importe, Empresa, Marca, PDV, Año fiscal
                        </p>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-700 mb-1">Categorías soportadas:</p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Ingresos Netos
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Ventas
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Otros Ingresos
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gastos */}
                    <Card className="border-2 hover:border-teal-200 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Gastos</h4>
                              <p className="text-xs text-gray-500">Gastos operativos e históricos</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => toast.info('Descargando plantilla de gastos...')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Plantilla
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.csv,.xlsx,.xls';
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) toast.success(`Importando ${file.name}...`);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Importar Gastos
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Campos: Fecha, Concepto, Categoría (Coste Ventas/Gastos Op./Estructurales), Subcategoría, Importe, Empresa, Marca, PDV, Año fiscal
                        </p>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-gray-700 mb-1">Categorías soportadas:</p>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Coste de Ventas
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              Gastos Operativos
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              Estructurales
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Nota informativa sobre EBITDA */}
                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg h-fit">
                        <Calculator className="w-5 h-5 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-teal-900 mb-1">
                          📊 Cálculo automático del EBITDA
                        </p>
                        <p className="text-sm text-teal-700 mb-3">
                          Una vez importados los ingresos y gastos, el sistema calculará automáticamente el EBITDA de cada período. Puedes importar datos de múltiples años para análisis históricos.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-white/60 rounded p-2">
                            <p className="font-medium text-gray-700">📈 Ingresos Netos</p>
                            <p className="text-gray-600">Ventas + Otros ingresos</p>
                          </div>
                          <div className="bg-white/60 rounded p-2">
                            <p className="font-medium text-gray-700">📉 Costes Totales</p>
                            <p className="text-gray-600">Coste ventas + Gastos Op. + Estructurales</p>
                          </div>
                          <div className="bg-white/60 rounded p-2">
                            <p className="font-medium text-gray-700">💰 EBITDA</p>
                            <p className="text-gray-600">Ingresos - Costes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">¿Necesitas ayuda con las importaciones?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Consulta nuestra <button className="underline font-medium hover:text-blue-900" onClick={() => toast.info('Abriendo documentación...')}>documentación de importación</button> o contacta con soporte técnico.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenido Cupones y Reglas */}
          {subfiltroSistema === 'cupones' && <ConfiguracionCupones />}
        </div>
      )}

      {/* Modal para Añadir/Editar Punto de Venta */}
      <Dialog open={modalPuntoVentaOpen} onOpenChange={setModalPuntoVentaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {puntoVentaEditando ? 'Editar Punto de Venta' : 'Añadir Punto de Venta'}
            </DialogTitle>
            <DialogDescription>
              {puntoVentaEditando 
                ? 'Modifica la información del punto de venta' 
                : 'Completa los datos del nuevo punto de venta'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-punto">Nombre del Punto de Venta</Label>
              <Input 
                id="nombre-punto" 
                placeholder="Food 360 - Centro" 
                defaultValue={puntoVentaEditando?.nombre}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion-punto">Dirección</Label>
              <Input 
                id="direccion-punto" 
                placeholder="Calle Mayor 45, Madrid" 
                defaultValue={puntoVentaEditando?.direccion}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono-punto">Teléfono</Label>
              <Input 
                id="telefono-punto" 
                type="tel"
                placeholder="+34 910 123 456" 
                defaultValue={puntoVentaEditando?.telefono}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-punto">Email</Label>
              <Input 
                id="email-punto" 
                type="email"
                placeholder="centro@hoypecamos.com" 
                defaultValue={puntoVentaEditando?.email}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="activo-punto" 
                defaultChecked={puntoVentaEditando?.activo ?? true}
              />
              <Label htmlFor="activo-punto">Punto de venta activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPuntoVentaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarPuntoVenta} className="bg-teal-600 hover:bg-teal-700">
              {puntoVentaEditando ? 'Actualizar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Añadir/Editar Empresa */}
      <Dialog open={modalMarcaOpen} onOpenChange={(open) => {
        setModalMarcaOpen(open);
        if (!open) {
          setPuntosVentaTemp([{ nombreComercial: '', direccion: '' }]);
          setCuentasBancariasTemp([{ numero: '', alias: '' }]);
          setLogoEmpresaTemporal(''); // Resetear logo temporal
          setMarcaEditando(null);
        } else if (marcaEditando?.logoUrl) {
          setLogoEmpresaTemporal(marcaEditando.logoUrl); // Cargar logo existente
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {marcaEditando ? 'Editar Empresa' : 'Añadir Empresa'}
            </DialogTitle>
            <DialogDescription>
              {marcaEditando 
                ? 'Modifica los datos fiscales y bancarios de la empresa' 
                : 'Completa los datos fiscales y bancarios de la nueva empresa'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-fiscal">1. Nombre Fiscal</Label>
              <Input 
                id="nombre-fiscal" 
                placeholder="Can Farines Sociedad Limitada" 
                defaultValue={marcaEditando?.nombreFiscal}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cif">2. CIF</Label>
              <Input 
                id="cif" 
                placeholder="B12345678" 
                defaultValue={marcaEditando?.cif}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domicilio-fiscal">3. Domicilio Fiscal</Label>
              <Input 
                id="domicilio-fiscal" 
                placeholder="Calle Mayor 45, 28013 Madrid" 
                defaultValue={marcaEditando?.domicilioFiscal}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre-comercial">4. Nombre Comercial</Label>
              <Input 
                id="nombre-comercial" 
                placeholder="Can Farines" 
                defaultValue={marcaEditando?.nombreComercial}
              />
            </div>

            {/* Logo del Nombre Comercial */}
            <div className="space-y-2">
              <Label htmlFor="logo-comercial-editar">Logo del Nombre Comercial (Opcional)</Label>
              <div className="flex items-start gap-3">
                {/* Preview del logo */}
                {(logoEmpresaTemporal || marcaEditando?.logoUrl) && (
                  <div className="relative w-20 h-20 rounded-lg border-2 border-gray-300 overflow-hidden bg-white flex-shrink-0">
                    <img 
                      src={logoEmpresaTemporal || marcaEditando?.logoUrl || ''} 
                      alt="Logo comercial" 
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={eliminarLogoEmpresa}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {/* Input file */}
                <div className="flex-1">
                  <label 
                    htmlFor="logo-comercial-editar"
                    className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {(logoEmpresaTemporal || marcaEditando?.logoUrl) ? 'Cambiar logo' : 'Subir logo'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG hasta 2MB
                      </p>
                    </div>
                  </label>
                  <input
                    id="logo-comercial-editar"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoEmpresaChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="convenio-colectivo">5. Convenio Colectivo Aplicable</Label>
              <Input 
                id="convenio-colectivo" 
                placeholder="Convenio Colectivo de Panaderías" 
                defaultValue={marcaEditando?.convenioColectivo}
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">6. Puntos de Venta</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAñadirPuntoVentaMarca}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Punto de Venta
                </Button>
              </div>
              
              {puntosVentaTemp.map((punto, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Punto de Venta {index + 1}</Label>
                    {puntosVentaTemp.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminarPuntoVentaMarca(index)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`punto-nombre-${index}`} className="text-xs">Nombre comercial</Label>
                    <Input 
                      id={`punto-nombre-${index}`}
                      placeholder="Can Farines Centro" 
                      defaultValue={punto.nombreComercial}
                      onChange={(e) => {
                        const nuevosPuntos = [...puntosVentaTemp];
                        nuevosPuntos[index].nombreComercial = e.target.value;
                        setPuntosVentaTemp(nuevosPuntos);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`punto-direccion-${index}`} className="text-xs">Dirección</Label>
                    <Input 
                      id={`punto-direccion-${index}`}
                      placeholder="Calle Mayor 45, 28013 Madrid" 
                      defaultValue={punto.direccion}
                      onChange={(e) => {
                        const nuevosPuntos = [...puntosVentaTemp];
                        nuevosPuntos[index].direccion = e.target.value;
                        setPuntosVentaTemp(nuevosPuntos);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">7. Cuentas Bancarias</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAñadirCuentaBancaria}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir Cuenta
                </Button>
              </div>
              
              {cuentasBancariasTemp.map((cuenta, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Cuenta {index + 1}</Label>
                    {cuentasBancariasTemp.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminarCuentaBancaria(index)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cuenta-numero-${index}`} className="text-xs">Número de cuenta (IBAN)</Label>
                    <Input 
                      id={`cuenta-numero-${index}`}
                      placeholder="ES91 2100 0418 4502 0005 1332" 
                      defaultValue={cuenta.numero}
                      onChange={(e) => {
                        const nuevasCuentas = [...cuentasBancariasTemp];
                        nuevasCuentas[index].numero = e.target.value;
                        setCuentasBancariasTemp(nuevasCuentas);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cuenta-alias-${index}`} className="text-xs">Alias de la cuenta</Label>
                    <Input 
                      id={`cuenta-alias-${index}`}
                      placeholder="Cuenta Principal" 
                      defaultValue={cuenta.alias}
                      onChange={(e) => {
                        const nuevasCuentas = [...cuentasBancariasTemp];
                        nuevasCuentas[index].alias = e.target.value;
                        setCuentasBancariasTemp(nuevasCuentas);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center gap-2">
              <Switch 
                id="activo-marca" 
                defaultChecked={marcaEditando?.activo ?? true}
              />
              <Label htmlFor="activo-marca">Empresa activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMarcaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarMarca} className="bg-teal-600 hover:bg-teal-700">
              {marcaEditando ? 'Actualizar' : 'Añadir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Documentación con Tabs */}
      <Dialog open={modalDocumentacionOpen} onOpenChange={setModalDocumentacionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Documentación - {puntoVentaSeleccionado?.nombre}
            </DialogTitle>
            <DialogDescription>
              Gestiona las licencias y documentos de sociedad del punto de venta
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={tabDocumentacion} onValueChange={setTabDocumentacion} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10">
              <TabsTrigger value="licencias" className="text-xs sm:text-sm">Licencias</TabsTrigger>
              <TabsTrigger value="sociedad" className="text-xs sm:text-sm">Sociedad</TabsTrigger>
            </TabsList>

            {/* Tab de Licencias */}
            <TabsContent value="licencias" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Licencias y permisos del local comercial
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toast.info('Subir archivo de licencia')}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Archivo
                  </Button>
                  <Button
                    onClick={() => toast.info('Activar cámara para foto')}
                    variant="outline"
                    size="sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Hacer Foto
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Tipo de Licencia</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {puntoVentaSeleccionado?.documentacion?.licencias && puntoVentaSeleccionado.documentacion.licencias.length > 0 ? (
                    puntoVentaSeleccionado.documentacion.licencias.map((licencia, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{licencia.tipo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {licencia.numero}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{licencia.vencimiento}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Vigente
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              onClick={() => toast.info(`Ver ${licencia.tipo}`)}
                              variant="ghost"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => toast.success(`Descargando ${licencia.tipo}`)}
                              variant="ghost"
                              size="sm"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => toast.error(`Eliminar ${licencia.tipo}`)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No hay licencias registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </TabsContent>

            {/* Tab de Sociedad */}
            <TabsContent value="sociedad" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    Documentos societarios y legales de la empresa
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toast.info('Subir documento de sociedad')}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Archivo
                    </Button>
                    <Button
                      onClick={() => toast.info('Activar cámara para foto')}
                      variant="outline"
                      size="sm"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Hacer Foto
                    </Button>
                  </div>
                </div>

                {/* Campo para nombre del archivo */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <Label htmlFor="nombre-documento" className="text-sm font-medium mb-2 block">
                    Nombre del Documento
                  </Label>
                  <Input
                    id="nombre-documento"
                    placeholder="Ej: Estatutos, IAE, CIF, Escritura de Constitución..."
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toast.success('Documento añadido correctamente')}
                      className="bg-teal-600 hover:bg-teal-700"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir Documento
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Subida</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Documentos ejemplo */}
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Estatutos de la Sociedad</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          PDF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">15/01/2024</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">2.4 MB</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => toast.info('Ver Estatutos')}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.success('Descargando Estatutos')}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.error('Documento eliminado')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">IAE (Impuesto Actividades Económicas)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          PDF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">20/02/2024</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">1.2 MB</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => toast.info('Ver IAE')}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.success('Descargando IAE')}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.error('Documento eliminado')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="font-medium">CIF (Certificado Identificación Fiscal)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          PDF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">10/03/2024</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">856 KB</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => toast.info('Ver CIF')}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.success('Descargando CIF')}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.error('Documento eliminado')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Escritura de Constitución</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          PDF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">05/01/2024</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">3.8 MB</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => toast.info('Ver Escritura')}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.success('Descargando Escritura')}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.error('Documento eliminado')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span className="font-medium">Poderes Notariales</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-teal-50 text-teal-700">
                          PDF
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">12/02/2024</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">1.5 MB</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => toast.info('Ver Poderes')}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.success('Descargando Poderes')}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => toast.error('Documento eliminado')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setModalDocumentacionOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Crear Empresa */}
      <ModalCrearEmpresa
        open={modalCrearEmpresaOpen}
        onOpenChange={setModalCrearEmpresaOpen}
      />

      {/* Modal Agente Externo */}
      <ModalAgenteExterno
        isOpen={modalAgenteExternoOpen}
        onOpenChange={setModalAgenteExternoOpen}
        agente={agenteExternoSeleccionado}
        onSave={handleSaveAgenteExterno}
      />

      {/* Modal Configuración de Zona Horaria */}
      <ModalConfiguracionZonaHoraria
        open={modalZonaHorariaOpen}
        onOpenChange={setModalZonaHorariaOpen}
        zonaHoraria={zonaHorariaTemporal}
        hora={horaTemporal}
        minuto={minutoTemporal}
        onGuardar={(zonaHoraria, hora, minuto) => {
          setZonaHorariaTemporal(zonaHoraria);
          setHoraTemporal(hora);
          setMinutoTemporal(minuto);
          handleGuardarZonaHoraria();
        }}
      />

      {/* Modal para Añadir/Editar TPV */}
      <Dialog open={modalTPVOpen} onOpenChange={setModalTPVOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {tpvEditando ? 'Editar Configuración TPV' : 'Añadir Nuevo TPV'}
            </DialogTitle>
            <DialogDescription>
              {tpvEditando 
                ? 'Modifica la configuración del TPV, marcas asociadas y terminales' 
                : 'Configura un nuevo punto de venta con sus marcas y terminales'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Información del Punto de Venta
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tpv-tienda">Nombre de la Tienda *</Label>
                  <Input
                    id="tpv-tienda"
                    placeholder="Ej: Tiana, Badalona, Barcelona Centro..."
                    defaultValue={tpvEditando?.tienda || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tpv-direccion">Dirección Completa *</Label>
                  <Input
                    id="tpv-direccion"
                    placeholder="Ej: Passeig de la Vilesa, 6, 08391 Tiana, Barcelona"
                    defaultValue={tpvEditando?.direccion || ''}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Marcas Asociadas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  Marcas Asociadas
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info('Añadir marca al TPV')}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Añadir Marca
                </Button>
              </div>
              
              <div className="space-y-3">
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label className="mb-2 block">Marca 1 *</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              Modomio
                              <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem>Modomio</DropdownMenuItem>
                            <DropdownMenuItem>Blackburguer</DropdownMenuItem>
                            <DropdownMenuItem>Otra marca...</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label className="mb-2 block">Marca 2</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              Blackburguer
                              <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full">
                            <DropdownMenuItem>Modomio</DropdownMenuItem>
                            <DropdownMenuItem>Blackburguer</DropdownMenuItem>
                            <DropdownMenuItem>Otra marca...</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                        onClick={() => toast.success('Marca eliminada')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Terminales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Terminales TPV
                  </h3>
                  <p className="text-sm text-gray-500">
                    Configura los terminales para cada marca
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Terminal Predefinido */}
                <Card className="border-2 border-teal-300 bg-teal-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg mt-6">
                        <Monitor className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-teal-100 text-teal-700">
                            Terminal Principal
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Predefinido
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Nombre del Terminal</Label>
                            <Input defaultValue="Terminal 1 - Principal" />
                          </div>
                          <div className="space-y-2">
                            <Label>Marca Asociada</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  Modomio
                                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>Modomio</DropdownMenuItem>
                                <DropdownMenuItem>Blackburguer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Terminales Adicionales */}
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg mt-6">
                        <Monitor className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Badge variant="outline" className="text-xs">
                          Terminal Secundario
                        </Badge>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Nombre del Terminal</Label>
                            <Input placeholder="Ej: Terminal 2 - Bar" />
                          </div>
                          <div className="space-y-2">
                            <Label>Marca Asociada</Label>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  Seleccionar...
                                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>Modomio</DropdownMenuItem>
                                <DropdownMenuItem>Blackburguer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                        onClick={() => toast.success('Terminal eliminado')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info('Añadiendo nuevo terminal...')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Otro Terminal
                </Button>
              </div>
            </div>

            <Separator />

            {/* Estado */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Estado del TPV</Label>
                <p className="text-sm text-gray-500">
                  Activa o desactiva este punto de venta
                </p>
              </div>
              <Switch defaultChecked={tpvEditando?.activo !== false} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTPVOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setModalTPVOpen(false);
                toast.success(tpvEditando ? 'TPV actualizado correctamente' : 'TPV creado correctamente');
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {tpvEditando ? 'Actualizar' : 'Crear TPV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Configurar Terminal Individual */}
      <Dialog open={modalTerminalOpen} onOpenChange={setModalTerminalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {(() => {
                const tpvActual = configTPV.find(t => t.id === tpvIdTerminal);
                const esNuevo = !tpvActual?.terminales.some(term => term.id === terminalEditando?.id);
                return esNuevo ? '✨ Añadir Nuevo Terminal' : '⚙️ Configuración del Terminal';
              })()}
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const tpvActual = configTPV.find(t => t.id === tpvIdTerminal);
                const esNuevo = !tpvActual?.terminales.some(term => term.id === terminalEditando?.id);
                return esNuevo 
                  ? 'Configura un nuevo terminal TPV seleccionando las marcas y parámetros necesarios. Puedes asociar múltiples marcas de diferentes empresas.'
                  : 'Modifica los parámetros y dispositivos asociados al terminal TPV. Puedes asociar múltiples marcas de diferentes empresas al mismo terminal.';
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Información Básica del Terminal */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Información del Terminal
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="terminal-nombre">Nombre del Terminal *</Label>
                  <Input
                    id="terminal-nombre"
                    placeholder="Ej: Terminal 1 - Principal"
                    value={nombreTerminal}
                    onChange={(e) => setNombreTerminal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="terminal-marca">Marcas Asociadas *</Label>
                    {marcasSeleccionadas.length > 0 && (
                      <span className="text-xs text-teal-600 font-medium">
                        {marcasSeleccionadas.length} seleccionada{marcasSeleccionadas.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 -mt-1">
                    Selecciona las marcas de cualquier empresa que operarán en este terminal
                  </p>
                  <div className="border border-gray-200 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
                    {todasLasMarcas.map((marca) => {
                      const isSelected = marcasSeleccionadas.includes(marca.nombre);
                      return (
                        <div key={marca.id} className="flex items-start gap-3 p-2 hover:bg-white rounded-md transition-colors bg-white border border-transparent hover:border-teal-200">
                          <Checkbox
                            id={`marca-${marca.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setMarcasSeleccionadas([...marcasSeleccionadas, marca.nombre]);
                              } else {
                                setMarcasSeleccionadas(marcasSeleccionadas.filter(m => m !== marca.nombre));
                              }
                            }}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={`marca-${marca.id}`}
                              className="text-sm font-medium text-gray-900 cursor-pointer block"
                            >
                              {marca.nombre}
                            </label>
                            <p className="text-xs text-gray-500">{marca.empresa}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {marcasSeleccionadas.length > 0 ? (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                      <p className="text-xs text-teal-700 font-medium mb-2">Marcas seleccionadas:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {marcasSeleccionadas.map((marca, idx) => (
                          <Badge 
                            key={idx}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-2 py-1 flex items-center gap-1.5"
                          >
                            {marca}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:opacity-70" 
                              onClick={() => setMarcasSeleccionadas(marcasSeleccionadas.filter(m => m !== marca))}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-700">
                        Debes seleccionar al menos una marca para este terminal
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="terminal-tipo">Tipo de Terminal</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {tipoTerminal === 'principal' ? 'Principal' : 'Secundario'}
                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => setTipoTerminal('principal')}>
                        Principal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTipoTerminal('secundario')}>
                        Secundario
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminal-estado">Estado</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch defaultChecked={terminalEditando?.estado === 'activo'} />
                    <span className="text-sm text-gray-600">
                      {terminalEditando?.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-blue-900">Impresora</p>
                <p className="text-[10px] text-blue-600">Conectada</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-green-900">Cajón</p>
                <p className="text-[10px] text-green-600">Conectado</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <Scan className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">Lector</p>
                <p className="text-[10px] text-gray-500">Desconectado</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <CreditCard className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-yellow-900">Datáfono</p>
                <p className="text-[10px] text-yellow-600">Conectado</p>
              </div>
            </div>

            <Separator />

            {/* Dispositivos Conectados */}
            <Collapsible open={dispositivosOpen} onOpenChange={setDispositivosOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg -mx-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Dispositivos Conectados
                  </h3>
                  {dispositivosOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
              <div className="space-y-3">
                {/* Info de Dispositivos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700">
                    <strong>💡 Sistema listo para integración:</strong> Esta configuración permite conectar dispositivos físicos como impresoras de tickets, cajones registradores, datáfonos y lectores de código de barras. Los dispositivos aparecerán automáticamente cuando estén conectados al sistema.
                  </p>
                </div>

                {/* Impresora */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Impresora de Tickets</p>
                          <p className="text-xs text-gray-500">Epson TM-T88VI</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">
                          Conectada
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cajón de Efectivo */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Cajón de Efectivo</p>
                          <p className="text-xs text-gray-500">Star Micronics CD3-1616</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">
                          Conectado
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lector de Código de Barras */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Scan className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Lector de Código de Barras</p>
                          <p className="text-xs text-gray-500">Honeywell Voyager 1250g</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gray-100 text-gray-700">
                          Desconectado
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Datáfono */}
                <Card className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <CreditCard className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Datáfono TPV</p>
                          <p className="text-xs text-gray-500">Ingenico iCT250</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">
                          Conectado
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botón añadir dispositivo */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info('Escanear dispositivos disponibles...')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Nuevo Dispositivo
                </Button>
              </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Configuración Avanzada */}
            <Collapsible open={configAvanzadaOpen} onOpenChange={setConfigAvanzadaOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg -mx-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configuración Avanzada
                  </h3>
                  {configAvanzadaOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
              <div className="space-y-3">
                {/* Info Configuración Avanzada */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs text-purple-700">
                    <strong>🔧 Configuración del comportamiento:</strong> Define cómo debe comportarse el terminal TPV en diferentes situaciones y qué acciones automatizar.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Apertura automática del cajón</p>
                    <p className="text-xs text-gray-500">Abrir cajón después de cada venta</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Impresión automática de tickets</p>
                    <p className="text-xs text-gray-500">Imprimir ticket después del pago</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Sonido de confirmación</p>
                    <p className="text-xs text-gray-500">Reproducir sonido al escanear productos</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Modo pantalla completa</p>
                    <p className="text-xs text-gray-500">Ejecutar terminal en modo kiosko</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label>Formato de tickets</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        80mm (Estándar)
                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem>58mm (Compacto)</DropdownMenuItem>
                      <DropdownMenuItem>80mm (Estándar)</DropdownMenuItem>
                      <DropdownMenuItem>A4 (Factura)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setModalTerminalOpen(false);
              setMarcasSeleccionadas([]);
              setNombreTerminal('');
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Validar nombre del terminal
                if (!nombreTerminal.trim()) {
                  toast.error('El nombre del terminal es obligatorio');
                  return;
                }
                
                // Validar que haya al menos una marca seleccionada
                if (marcasSeleccionadas.length === 0) {
                  toast.error('Debes seleccionar al menos una marca');
                  return;
                }
                
                // Verificar si es un terminal nuevo o existente
                const tpvActual = configTPV.find(t => t.id === tpvIdTerminal);
                const esNuevo = !tpvActual?.terminales.some(term => term.id === terminalEditando?.id);
                
                if (esNuevo) {
                  // Crear nuevo terminal
                  const nuevoTerminal = {
                    ...terminalEditando,
                    nombre: nombreTerminal,
                    marcas: marcasSeleccionadas,
                    tipo: tipoTerminal,
                    estado: 'activo'
                  };
                  setConfigTPV(configTPV.map(t => 
                    t.id === tpvIdTerminal 
                      ? { ...t, terminales: [...t.terminales, nuevoTerminal] }
                      : t
                  ));
                  toast.success('Terminal añadido correctamente', {
                    description: `${marcasSeleccionadas.length} marca(s): ${marcasSeleccionadas.join(', ')}`
                  });
                } else {
                  // Actualizar terminal existente
                  setConfigTPV(configTPV.map(t => 
                    t.id === tpvIdTerminal 
                      ? {
                          ...t,
                          terminales: t.terminales.map(term =>
                            term.id === terminalEditando?.id
                              ? { 
                                  ...term, 
                                  nombre: nombreTerminal,
                                  marcas: marcasSeleccionadas,
                                  tipo: tipoTerminal
                                }
                              : term
                          )
                        }
                      : t
                  ));
                  toast.success('Configuración del terminal actualizada', {
                    description: `${marcasSeleccionadas.length} marca(s): ${marcasSeleccionadas.join(', ')}`
                  });
                }
                
                setModalTerminalOpen(false);
                setMarcasSeleccionadas([]);
                setNombreTerminal('');
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}