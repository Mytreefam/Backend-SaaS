import { createContext, useContext, useState, ReactNode } from 'react';

// ============= INTERFACES =============

export interface CategoriaCliente {
  id: string;
  nombre: string;
  icono: string;
  activo: boolean;
  orden: number;
  color: string; // Para el badge
  destinoTipo?: 'EQUIPO' | 'OTRA_TIENDA' | 'EMAIL' | 'WHATSAPP';
  destinoValor?: string;
  permiteAdjuntos?: boolean;
}

export interface CategoriaTrabajador {
  accionId: string;
  empresaId: string;
  nombre: string;
  icono: string;
  destinoTipo: 'EQUIPO' | 'OTRA_TIENDA' | 'EMAIL' | 'WHATSAPP';
  destinoValor: string;
  activo: boolean;
  permiteAdjuntos: boolean;
  orden: number;
  esProtegida: boolean;
  creadoPor?: string;
  fechaCreacion?: string;
}

interface ConfiguracionChatsContextType {
  // Categorías de clientes
  categoriasClientes: CategoriaCliente[];
  setCategoriasClientes: (cats: CategoriaCliente[]) => void;
  updateCategoriaCliente: (id: string, data: Partial<CategoriaCliente>) => void;
  toggleCategoriaCliente: (id: string, activo: boolean) => void;
  addCategoriaCliente: (cat: CategoriaCliente) => void;
  deleteCategoriaCliente: (id: string) => void;
  
  // Categorías de trabajadores
  categoriasTrabajadores: CategoriaTrabajador[];
  setCategoriasTrabajadores: (cats: CategoriaTrabajador[]) => void;
  updateCategoriaTrabajador: (accionId: string, data: Partial<CategoriaTrabajador>) => void;
  addCategoriaTrabajador: (cat: CategoriaTrabajador) => void;
  deleteCategoriaTrabajador: (accionId: string) => void;
  
  // Configuración global
  chatsPedidosActivo: boolean;
  setChatsPedidosActivo: (activo: boolean) => void;
}

// ============= CONTEXT =============

const ConfiguracionChatsContext = createContext<ConfiguracionChatsContextType | undefined>(undefined);

// ============= PROVIDER =============

export function ConfiguracionChatsProvider({ children }: { children: ReactNode }) {
  const [chatsPedidosActivo, setChatsPedidosActivo] = useState(true);
  
  // Categorías de clientes iniciales
  const [categoriasClientes, setCategoriasClientes] = useState<CategoriaCliente[]>([
    { 
      id: 'pedido', 
      nombre: 'Pedidos', 
      icono: 'Package', 
      activo: true, 
      orden: 1,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      destinoTipo: 'EQUIPO',
      destinoValor: 'Equipo de Pedidos',
      permiteAdjuntos: true
    },
    { 
      id: 'informacion', 
      nombre: 'Información', 
      icono: 'Info', 
      activo: true, 
      orden: 2,
      color: 'bg-green-100 text-green-700 border-green-200',
      destinoTipo: 'EQUIPO',
      destinoValor: 'Atención al Cliente',
      permiteAdjuntos: false
    },
    { 
      id: 'reclamacion', 
      nombre: 'Reclamaciones', 
      icono: 'AlertCircle', 
      activo: true, 
      orden: 3,
      color: 'bg-red-100 text-red-700 border-red-200',
      destinoTipo: 'EMAIL',
      destinoValor: 'reclamaciones@modomio.com',
      permiteAdjuntos: true
    },
    { 
      id: 'fallo-app', 
      nombre: 'Fallos de la app', 
      icono: 'Bug', 
      activo: true, 
      orden: 4,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      destinoTipo: 'EMAIL',
      destinoValor: 'soporte@modomio.com',
      permiteAdjuntos: true
    },
    { 
      id: 'otro', 
      nombre: 'Otros', 
      icono: 'HelpCircle', 
      activo: true, 
      orden: 5,
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      destinoTipo: 'WHATSAPP',
      destinoValor: '+34 612 345 678',
      permiteAdjuntos: false
    }
  ]);
  
  // Categorías de trabajadores iniciales
  const [categoriasTrabajadores, setCategoriasTrabajadores] = useState<CategoriaTrabajador[]>([
    {
      accionId: 'AVERIA-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Avería maquinaria',
      icono: 'Wrench',
      destinoTipo: 'EQUIPO',
      destinoValor: 'GERENTE-001',
      activo: true,
      permiteAdjuntos: true,
      orden: 1,
      esProtegida: true,
      creadoPor: 'SISTEMA',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      accionId: 'RRHH-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Consulta RRHH',
      icono: 'Users',
      destinoTipo: 'EQUIPO',
      destinoValor: 'RRHH-001',
      activo: true,
      permiteAdjuntos: true,
      orden: 2,
      esProtegida: true,
      creadoPor: 'SISTEMA',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      accionId: 'STOCK-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Pedido material',
      icono: 'Package',
      destinoTipo: 'EQUIPO',
      destinoValor: 'ALMACEN-001',
      activo: true,
      permiteAdjuntos: true,
      orden: 3,
      esProtegida: true,
      creadoPor: 'SISTEMA',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      accionId: 'INCIDENCIA-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Incidencia cliente',
      icono: 'AlertTriangle',
      destinoTipo: 'EQUIPO',
      destinoValor: 'GERENTE-001',
      activo: true,
      permiteAdjuntos: true,
      orden: 4,
      esProtegida: true,
      creadoPor: 'SISTEMA',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      accionId: 'TIENDA-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Consulta otra tienda',
      icono: 'Building',
      destinoTipo: 'OTRA_TIENDA',
      destinoValor: 'TIENDA-002',
      activo: true,
      permiteAdjuntos: false,
      orden: 5,
      esProtegida: true,
      creadoPor: 'SISTEMA',
      fechaCreacion: '2024-01-01T00:00:00'
    },
    {
      accionId: 'ADMIN-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Temas administrativos',
      icono: 'FileText',
      destinoTipo: 'EMAIL',
      destinoValor: 'admin@empresa.com',
      activo: false,
      permiteAdjuntos: true,
      orden: 6,
      esProtegida: false,
      creadoPor: 'GERENTE-001',
      fechaCreacion: '2024-11-10T09:00:00'
    },
    {
      accionId: 'CUSTOM-001',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Consulta Gerente General',
      icono: 'Mail',
      destinoTipo: 'EMAIL',
      destinoValor: 'gerente@empresa.com',
      activo: true,
      permiteAdjuntos: true,
      orden: 7,
      esProtegida: false,
      creadoPor: 'GERENTE-001',
      fechaCreacion: '2024-11-15T10:00:00'
    },
    {
      accionId: 'CUSTOM-002',
      empresaId: 'EMP-HOSTELERIA',
      nombre: 'Urgencias WhatsApp',
      icono: 'MessageCircle',
      destinoTipo: 'WHATSAPP',
      destinoValor: '+34612345678',
      activo: false,
      permiteAdjuntos: false,
      orden: 8,
      esProtegida: false,
      creadoPor: 'GERENTE-001',
      fechaCreacion: '2024-11-20T14:30:00'
    }
  ]);
  
  // Funciones para categorías de clientes
  const updateCategoriaCliente = (id: string, data: Partial<CategoriaCliente>) => {
    setCategoriasClientes(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...data } : cat
    ));
  };
  
  const toggleCategoriaCliente = (id: string, activo: boolean) => {
    updateCategoriaCliente(id, { activo });
  };
  
  const addCategoriaCliente = (cat: CategoriaCliente) => {
    setCategoriasClientes(prev => [...prev, cat]);
  };
  
  const deleteCategoriaCliente = (id: string) => {
    setCategoriasClientes(prev => prev.filter(cat => cat.id !== id));
  };
  
  // Funciones para categorías de trabajadores
  const updateCategoriaTrabajador = (accionId: string, data: Partial<CategoriaTrabajador>) => {
    setCategoriasTrabajadores(prev => prev.map(cat => 
      cat.accionId === accionId ? { ...cat, ...data } : cat
    ));
  };
  
  const addCategoriaTrabajador = (cat: CategoriaTrabajador) => {
    setCategoriasTrabajadores(prev => [...prev, cat]);
  };
  
  const deleteCategoriaTrabajador = (accionId: string) => {
    setCategoriasTrabajadores(prev => prev.filter(cat => cat.accionId !== accionId));
  };
  
  return (
    <ConfiguracionChatsContext.Provider
      value={{
        categoriasClientes,
        setCategoriasClientes,
        updateCategoriaCliente,
        toggleCategoriaCliente,
        addCategoriaCliente,
        deleteCategoriaCliente,
        categoriasTrabajadores,
        setCategoriasTrabajadores,
        updateCategoriaTrabajador,
        addCategoriaTrabajador,
        deleteCategoriaTrabajador,
        chatsPedidosActivo,
        setChatsPedidosActivo,
      }}
    >
      {children}
    </ConfiguracionChatsContext.Provider>
  );
}

// ============= HOOK =============

export function useConfiguracionChats() {
  const context = useContext(ConfiguracionChatsContext);
  if (context === undefined) {
    throw new Error('useConfiguracionChats must be used within a ConfiguracionChatsProvider');
  }
  return context;
}
