/**
 * TRABAJADORES - SISTEMA MULTIEMPRESA
 * 
 * Gestión centralizada de trabajadores con contexto de empresa/marca/PDV
 * 
 * NOMENCLATURA:
 * - Interface: Trabajador
 * - Archivo: trabajadores.ts
 * - Funciones: obtenerTrabajadoresPor...
 * 
 * NOTA: Los componentes visuales pueden mantener nombres legacy 
 * (FichajeColaborador, etc.) por compatibilidad, pero internamente 
 * todo se gestiona como "Trabajador"
 */

import { 
  EMPRESAS, 
  MARCAS, 
  PUNTOS_VENTA 
} from '../constants/empresaConfig';

// ============================================
// INTERFACES Y TIPOS
// ============================================

export type EstadoTrabajador = 'activo' | 'vacaciones' | 'baja' | 'suspendido';
export type TipoContrato = 'indefinido' | 'temporal' | 'practicas' | 'formacion';
export type RolTrabajador = 'trabajador' | 'responsable_pdv' | 'coordinador' | 'gerente_marca';

export interface DistribucionCoste {
  puntoVentaId: string;
  porcentaje: number;
}

export interface Trabajador {
  // Identificación
  id: string;
  userId: string;                   // Relación con User de autenticación
  
  // ⭐ CONTEXTO MULTIEMPRESA
  empresaId: string;                // Empresa principal
  marcaId?: string;                 // Marca principal (opcional)
  puntoVentaId: string;             // PDV principal de trabajo
  puntosVentaAsignados?: string[];  // Múltiples PDVs donde puede trabajar
  
  // Datos personales
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  avatar?: string;
  
  // Datos laborales
  puesto: string;
  departamento: string;
  fechaIngreso: string;
  fechaSalida?: string;
  estado: EstadoTrabajador;
  
  // Contrato y horarios
  tipoContrato: TipoContrato;
  horasContrato: number;              // Horas mensuales contratadas
  horasTrabajadas: number;            // Horas trabajadas este mes
  salarioMensual?: number;            // Salario bruto mensual
  
  // Permisos y acceso
  rol: RolTrabajador;
  permisos: string[];
  
  // ⭐ CENTRO DE COSTES - SISTEMA MIXTO
  centroCostePorcentaje?: number;     // Si trabaja solo en 1 PDV
  distribucionCostes?: DistribucionCoste[];          // LEGACY: mantener compatibilidad
  distribucionCostesManual?: DistribucionCoste[];    // ⭐ Asignada por el GERENTE
  distribucionCostesCalculada?: DistribucionCoste[]; // ⭐ Calculada por FICHAJES
  usarDistribucionManual?: boolean;   // true = usar manual, false = usar calculada
  
  // ⭐ MÉTRICAS DE ABSENTISMO (calculadas)
  estadisticasMesActual?: {
    horasTrabajadas: number;
    diasTrabajados: number;
    diasAbsentismo: number;
    porcentajeAbsentismo: number;
    horasExtra: number;
  };
  
  // Documentación (opcional)
  dni?: string;
  nss?: string;
  direccion?: string;
  fechaNacimiento?: string;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DATOS MOCK - TRABAJADORES
// ============================================

export const trabajadores: Trabajador[] = [
  // ==========================================
  // EMPRESA: Blackfriday XXI (EMP-001)
  // MARCA: Modomio
  // PDV: Tiana
  // ==========================================
  {
    id: 'TRB-001',
    userId: 'USER-TRB-001',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Carlos',
    apellidos: 'Méndez García',
    email: 'carlos.mendez@modomio.com',
    telefono: '+34 610 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    
    puesto: 'Panadero Maestro',
    departamento: 'Producción',
    fechaIngreso: '2023-01-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 168,
    salarioMensual: 1800,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_stock'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-002',
    userId: 'USER-TRB-002',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA', 'PDV-BADALONA'], // Multi-ubicación
    
    nombre: 'María',
    apellidos: 'González López',
    email: 'maria.gonzalez@modomio.com',
    telefono: '+34 620 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    
    puesto: 'Responsable de Bollería',
    departamento: 'Producción',
    fechaIngreso: '2023-03-20',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 155,
    salarioMensual: 2100,
    
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_equipo', 'gestionar_stock', 'ver_reportes'],
    
    distribucionCostes: [
      { puntoVentaId: 'PDV-TIANA', porcentaje: 60 },
      { puntoVentaId: 'PDV-BADALONA', porcentaje: 40 }
    ],
    
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-003',
    userId: 'USER-TRB-003',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Laura',
    apellidos: 'Martínez Ruiz',
    email: 'laura.martinez@modomio.com',
    telefono: '+34 630 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    
    puesto: 'Dependienta',
    departamento: 'Ventas',
    fechaIngreso: '2023-05-10',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 152,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-004',
    userId: 'USER-TRB-004',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Ana',
    apellidos: 'Rodríguez Sánchez',
    email: 'ana.rodriguez@modomio.com',
    telefono: '+34 645 123 456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    
    puesto: 'Ayudante de Panadería',
    departamento: 'Producción',
    fechaIngreso: '2024-02-01',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1300,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-005',
    userId: 'USER-TRB-005',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Pedro',
    apellidos: 'Fernández Torres',
    email: 'pedro.fernandez@modomio.com',
    telefono: '+34 655 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    
    puesto: 'Dependiente',
    departamento: 'Ventas',
    fechaIngreso: '2024-01-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-006',
    userId: 'USER-TRB-006',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Carmen',
    apellidos: 'López Navarro',
    email: 'carmen.lopez@modomio.com',
    telefono: '+34 665 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmen',
    
    puesto: 'Personal de Limpieza',
    departamento: 'Servicios',
    fechaIngreso: '2023-06-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 80,
    horasTrabajadas: 80,
    salarioMensual: 700,
    
    rol: 'trabajador',
    permisos: ['fichar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  // ==========================================
  // EMPRESA: Blackfriday XXI (EMP-001)
  // MARCA: Modomio
  // PDV: Badalona
  // ==========================================
  {
    id: 'TRB-007',
    userId: 'USER-TRB-007',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Javier',
    apellidos: 'Sánchez Ruiz',
    email: 'javier.sanchez@modomio.com',
    telefono: '+34 675 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
    
    puesto: 'Panadero',
    departamento: 'Producción',
    fechaIngreso: '2023-04-10',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 165,
    salarioMensual: 1700,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_stock'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-04-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-008',
    userId: 'USER-TRB-008',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Isabel',
    apellidos: 'García Moreno',
    email: 'isabel.garcia@modomio.com',
    telefono: '+34 685 567 890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel',
    
    puesto: 'Panadera',
    departamento: 'Producción',
    fechaIngreso: '2023-07-20',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 162,
    salarioMensual: 1650,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-07-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-009',
    userId: 'USER-TRB-009',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Roberto',
    apellidos: 'Díaz Martín',
    email: 'roberto.diaz@modomio.com',
    telefono: '+34 695 678 901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
    
    puesto: 'Responsable de Tienda',
    departamento: 'Gestión',
    fechaIngreso: '2023-02-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 170,
    salarioMensual: 2200,
    
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv', 'gestionar_equipo', 'gestionar_stock', 'ver_reportes', 'abrir_cerrar_caja'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-010',
    userId: 'USER-TRB-010',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Lucía',
    apellidos: 'Jiménez Romero',
    email: 'lucia.jimenez@modomio.com',
    telefono: '+34 605 789 012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia',
    
    puesto: 'Dependienta',
    departamento: 'Ventas',
    fechaIngreso: '2023-08-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-011',
    userId: 'USER-TRB-011',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Miguel',
    apellidos: 'Torres Blanco',
    email: 'miguel.torres@modomio.com',
    telefono: '+34 615 890 123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    
    puesto: 'Dependiente',
    departamento: 'Ventas',
    fechaIngreso: '2024-03-10',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 155,
    salarioMensual: 1350,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-012',
    userId: 'USER-TRB-012',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Teresa',
    apellidos: 'Ramos Silva',
    email: 'teresa.ramos@modomio.com',
    telefono: '+34 625 901 234',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teresa',
    
    puesto: 'Dependienta',
    departamento: 'Ventas',
    fechaIngreso: '2024-04-01',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1350,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-013',
    userId: 'USER-TRB-013',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Francisco',
    apellidos: 'Vargas Castro',
    email: 'francisco.vargas@modomio.com',
    telefono: '+34 635 012 345',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Francisco',
    
    puesto: 'Ayudante de Panadería',
    departamento: 'Producción',
    fechaIngreso: '2024-05-15',
    estado: 'activo',
    
    tipoContrato: 'practicas',
    horasContrato: 120,
    horasTrabajadas: 118,
    salarioMensual: 900,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-014',
    userId: 'USER-TRB-014',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-MODOMIO',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Raquel',
    apellidos: 'Ortiz Delgado',
    email: 'raquel.ortiz@modomio.com',
    telefono: '+34 645 123 456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raquel',
    
    puesto: 'Personal de Limpieza',
    departamento: 'Servicios',
    fechaIngreso: '2023-09-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 80,
    horasTrabajadas: 80,
    salarioMensual: 700,
    
    rol: 'trabajador',
    permisos: ['fichar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  // ==========================================
  // EMPRESA: Blackfriday XXI (EMP-001)
  // MARCA: Blackburguer
  // PDV: Montgat
  // ==========================================
  {
    id: 'TRB-015',
    userId: 'USER-TRB-015',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-BLACKBURGUER',
    puntoVentaId: 'PDV-MONTGAT',
    puntosVentaAsignados: ['PDV-MONTGAT'],
    
    nombre: 'David',
    apellidos: 'Morales Prieto',
    email: 'david.morales@blackburguer.com',
    telefono: '+34 655 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    
    puesto: 'Cocinero Jefe',
    departamento: 'Cocina',
    fechaIngreso: '2023-10-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 168,
    salarioMensual: 1900,
    
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cambiar_estado_cocina', 'gestionar_equipo', 'gestionar_stock', 'ver_reportes'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-10-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-016',
    userId: 'USER-TRB-016',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-BLACKBURGUER',
    puntoVentaId: 'PDV-MONTGAT',
    puntosVentaAsignados: ['PDV-MONTGAT'],
    
    nombre: 'Elena',
    apellidos: 'Vega Campos',
    email: 'elena.vega@blackburguer.com',
    telefono: '+34 665 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    
    puesto: 'Cocinera',
    departamento: 'Cocina',
    fechaIngreso: '2023-11-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 162,
    salarioMensual: 1600,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-11-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-017',
    userId: 'USER-TRB-017',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-BLACKBURGUER',
    puntoVentaId: 'PDV-MONTGAT',
    puntosVentaAsignados: ['PDV-MONTGAT'],
    
    nombre: 'Alberto',
    apellidos: 'Serrano Muñoz',
    email: 'alberto.serrano@blackburguer.com',
    telefono: '+34 675 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alberto',
    
    puesto: 'Camarero',
    departamento: 'Sala',
    fechaIngreso: '2024-01-10',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1300,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-018',
    userId: 'USER-TRB-018',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-BLACKBURGUER',
    puntoVentaId: 'PDV-MONTGAT',
    puntosVentaAsignados: ['PDV-MONTGAT'],
    
    nombre: 'Patricia',
    apellidos: 'Iglesias Reyes',
    email: 'patricia.iglesias@blackburguer.com',
    telefono: '+34 685 567 890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
    
    puesto: 'Camarera',
    departamento: 'Sala',
    fechaIngreso: '2024-02-20',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1300,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-019',
    userId: 'USER-TRB-019',
    empresaId: 'EMP-001',
    marcaId: 'MARCA-BLACKBURGUER',
    puntoVentaId: 'PDV-MONTGAT',
    puntosVentaAsignados: ['PDV-MONTGAT'],
    
    nombre: 'Daniel',
    apellidos: 'Cabrera León',
    email: 'daniel.cabrera@blackburguer.com',
    telefono: '+34 695 678 901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    
    puesto: 'Ayudante de Cocina',
    departamento: 'Cocina',
    fechaIngreso: '2024-06-01',
    estado: 'activo',
    
    tipoContrato: 'practicas',
    horasContrato: 120,
    horasTrabajadas: 120,
    salarioMensual: 900,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  // ==========================================
  // EMPRESA: Modomio (EMP-002)
  // MARCA: Modomio Restauración
  // PDV: Can Farines
  // ==========================================
  {
    id: 'TRB-020',
    userId: 'USER-TRB-020',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Jorge',
    apellidos: 'Peña Herrera',
    email: 'jorge.pena@modomio.com',
    telefono: '+34 605 789 012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge',
    
    puesto: 'Chef Ejecutivo',
    departamento: 'Cocina',
    fechaIngreso: '2022-06-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 175,
    salarioMensual: 2800,
    
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cambiar_estado_cocina', 'gestionar_equipo', 'gestionar_stock', 'ver_reportes', 'ver_costes_escandallo'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-06-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-021',
    userId: 'USER-TRB-021',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Beatriz',
    apellidos: 'Cano Rubio',
    email: 'beatriz.cano@modomio.com',
    telefono: '+34 615 890 123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz',
    
    puesto: 'Sous Chef',
    departamento: 'Cocina',
    fechaIngreso: '2022-08-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 168,
    salarioMensual: 2200,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_stock'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-08-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-022',
    userId: 'USER-TRB-022',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Sergio',
    apellidos: 'Molina Gil',
    email: 'sergio.molina@modomio.com',
    telefono: '+34 625 901 234',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergio',
    
    puesto: 'Cocinero',
    departamento: 'Cocina',
    fechaIngreso: '2023-01-10',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 162,
    salarioMensual: 1700,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-023',
    userId: 'USER-TRB-023',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Cristina',
    apellidos: 'Pascual Medina',
    email: 'cristina.pascual@modomio.com',
    telefono: '+34 635 012 345',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cristina',
    
    puesto: 'Jefa de Sala',
    departamento: 'Sala',
    fechaIngreso: '2022-09-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 165,
    salarioMensual: 2000,
    
    rol: 'coordinador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv', 'gestionar_equipo', 'ver_reportes'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-09-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-024',
    userId: 'USER-TRB-024',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Andrés',
    apellidos: 'Cortés Fuentes',
    email: 'andres.cortes@modomio.com',
    telefono: '+34 645 123 456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andres',
    
    puesto: 'Camarero',
    departamento: 'Sala',
    fechaIngreso: '2023-02-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-025',
    userId: 'USER-TRB-025',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Silvia',
    apellidos: 'Arias Lozano',
    email: 'silvia.arias@modomio.com',
    telefono: '+34 655 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Silvia',
    
    puesto: 'Camarera',
    departamento: 'Sala',
    fechaIngreso: '2023-03-20',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-026',
    userId: 'USER-TRB-026',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Raúl',
    apellidos: 'Santos Garrido',
    email: 'raul.santos@modomio.com',
    telefono: '+34 665 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raul',
    
    puesto: 'Camarero',
    departamento: 'Sala',
    fechaIngreso: '2023-05-10',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 155,
    salarioMensual: 1350,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-027',
    userId: 'USER-TRB-027',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Natalia',
    apellidos: 'Moya Carrasco',
    email: 'natalia.moya@modomio.com',
    telefono: '+34 675 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natalia',
    
    puesto: 'Barista',
    departamento: 'Barra',
    fechaIngreso: '2023-06-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 162,
    salarioMensual: 1500,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-028',
    userId: 'USER-TRB-028',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Óscar',
    apellidos: 'Soler Vidal',
    email: 'oscar.soler@modomio.com',
    telefono: '+34 685 567 890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
    
    puesto: 'Barista',
    departamento: 'Barra',
    fechaIngreso: '2023-07-20',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1500,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-07-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-029',
    userId: 'USER-TRB-029',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Verónica',
    apellidos: 'Aguilar Benítez',
    email: 'veronica.aguilar@modomio.com',
    telefono: '+34 695 678 901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Veronica',
    
    puesto: 'Personal de Limpieza',
    departamento: 'Servicios',
    fechaIngreso: '2022-10-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 80,
    horasTrabajadas: 80,
    salarioMensual: 700,
    
    rol: 'trabajador',
    permisos: ['fichar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-10-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-030',
    userId: 'USER-TRB-030',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Víctor',
    apellidos: 'Hidalgo Parra',
    email: 'victor.hidalgo@modomio.com',
    telefono: '+34 605 789 012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victor',
    
    puesto: 'Personal de Limpieza',
    departamento: 'Servicios',
    fechaIngreso: '2022-11-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 80,
    horasTrabajadas: 80,
    salarioMensual: 700,
    
    rol: 'trabajador',
    permisos: ['fichar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-11-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-031',
    userId: 'USER-TRB-031',
    empresaId: 'EMP-002',
    marcaId: 'MARCA-MODOMIO-RESTAURACION',
    puntoVentaId: 'PDV-CAN-FARINES',
    puntosVentaAsignados: ['PDV-CAN-FARINES'],
    
    nombre: 'Sandra',
    apellidos: 'Guerrero Marín',
    email: 'sandra.guerrero@modomio.com',
    telefono: '+34 615 890 123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sandra',
    
    puesto: 'Ayudante de Cocina',
    departamento: 'Cocina',
    fechaIngreso: '2024-03-01',
    estado: 'activo',
    
    tipoContrato: 'practicas',
    horasContrato: 120,
    horasTrabajadas: 118,
    salarioMensual: 900,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  // ==========================================
  // EMPRESA: Can Farines (EMP-003)
  // MARCA: Can Farines
  // PDV: Can Farines Principal
  // ==========================================
  {
    id: 'TRB-032',
    userId: 'USER-TRB-032',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Álvaro',
    apellidos: 'Rojas Suárez',
    email: 'alvaro.rojas@canfarines.com',
    telefono: '+34 625 901 234',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alvaro',
    
    puesto: 'Maestro Panadero',
    departamento: 'Producción',
    fechaIngreso: '2020-01-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 172,
    salarioMensual: 2400,
    
    rol: 'responsable_pdv',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_equipo', 'gestionar_stock', 'ver_reportes', 'ver_costes_escandallo'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-033',
    userId: 'USER-TRB-033',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Marta',
    apellidos: 'Delgado Castillo',
    email: 'marta.delgado@canfarines.com',
    telefono: '+34 635 012 345',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marta',
    
    puesto: 'Panadera',
    departamento: 'Producción',
    fechaIngreso: '2020-03-10',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 165,
    salarioMensual: 1900,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_stock'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2020-03-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-034',
    userId: 'USER-TRB-034',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Luis',
    apellidos: 'Ramírez Cruz',
    email: 'luis.ramirez@canfarines.com',
    telefono: '+34 645 123 456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luis',
    
    puesto: 'Dependiente',
    departamento: 'Ventas',
    fechaIngreso: '2021-05-20',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1500,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2021-05-20T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-035',
    userId: 'USER-TRB-035',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Irene',
    apellidos: 'Flores Núñez',
    email: 'irene.flores@canfarines.com',
    telefono: '+34 655 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Irene',
    
    puesto: 'Dependienta',
    departamento: 'Ventas',
    fechaIngreso: '2021-07-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1500,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2021-07-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-036',
    userId: 'USER-TRB-036',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Hugo',
    apellidos: 'Montero Peña',
    email: 'hugo.montero@canfarines.com',
    telefono: '+34 665 345 678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hugo',
    
    puesto: 'Dependiente',
    departamento: 'Ventas',
    fechaIngreso: '2022-02-15',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 155,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-02-15T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-037',
    userId: 'USER-TRB-037',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Clara',
    apellidos: 'Domínguez Ríos',
    email: 'clara.dominguez@canfarines.com',
    telefono: '+34 675 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara',
    
    puesto: 'Ayudante de Panadería',
    departamento: 'Producción',
    fechaIngreso: '2022-06-01',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1350,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2022-06-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-038',
    userId: 'USER-TRB-038',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Rubén',
    apellidos: 'Navarro Esteban',
    email: 'ruben.navarro@canfarines.com',
    telefono: '+34 685 567 890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ruben',
    
    puesto: 'Ayudante de Panadería',
    departamento: 'Producción',
    fechaIngreso: '2023-01-10',
    estado: 'activo',
    
    tipoContrato: 'practicas',
    horasContrato: 120,
    horasTrabajadas: 120,
    salarioMensual: 900,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  },
  
  {
    id: 'TRB-039',
    userId: 'USER-TRB-039',
    empresaId: 'EMP-003',
    marcaId: 'MARCA-CAN-FARINES',
    puntoVentaId: 'PDV-CAN-FARINES-PRINCIPAL',
    puntosVentaAsignados: ['PDV-CAN-FARINES-PRINCIPAL'],
    
    nombre: 'Nuria',
    apellidos: 'Campos Herrero',
    email: 'nuria.campos@canfarines.com',
    telefono: '+34 695 678 901',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nuria',
    
    puesto: 'Personal de Limpieza',
    departamento: 'Servicios',
    fechaIngreso: '2021-09-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 80,
    horasTrabajadas: 80,
    salarioMensual: 700,
    
    rol: 'trabajador',
    permisos: ['fichar'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2021-09-01T00:00:00Z',
    updatedAt: '2025-11-30T00:00:00Z'
  }
];

// ============================================
// FUNCIONES HELPER - CONSULTAS
// ============================================

/**
 * Obtener trabajadores por punto de venta
 * Incluye trabajadores cuyo PDV principal es el especificado
 * O que tienen el PDV en su lista de asignaciones
 */
export const obtenerTrabajadoresPorPDV = (
  puntoVentaId: string
): Trabajador[] => {
  return trabajadores.filter(trab => 
    trab.puntoVentaId === puntoVentaId || 
    trab.puntosVentaAsignados?.includes(puntoVentaId)
  );
};

/**
 * Obtener trabajadores por marca
 */
export const obtenerTrabajadoresPorMarca = (
  marcaId: string
): Trabajador[] => {
  return trabajadores.filter(trab => trab.marcaId === marcaId);
};

/**
 * Obtener trabajadores por empresa
 */
export const obtenerTrabajadoresPorEmpresa = (
  empresaId: string
): Trabajador[] => {
  return trabajadores.filter(trab => trab.empresaId === empresaId);
};

/**
 * Obtener trabajadores activos
 */
export const obtenerTrabajadoresActivos = (): Trabajador[] => {
  return trabajadores.filter(trab => trab.estado === 'activo');
};

/**
 * Obtener trabajador por ID
 */
export const obtenerTrabajadorPorId = (id: string): Trabajador | undefined => {
  return trabajadores.find(trab => trab.id === id);
};

/**
 * Obtener trabajador por userId
 */
export const obtenerTrabajadorPorUserId = (userId: string): Trabajador | undefined => {
  return trabajadores.find(trab => trab.userId === userId);
};

// ============================================
// FUNCIONES HELPER - CÁLCULOS FINANCIEROS
// ============================================

/**
 * Calcular nómina total de un punto de venta
 * Tiene en cuenta la distribución de costes para trabajadores multi-ubicación
 */
export const calcularNominaPDV = (puntoVentaId: string): number => {
  const trabsPDV = obtenerTrabajadoresPorPDV(puntoVentaId);
  
  return trabsPDV.reduce((total, trab) => {
    if (!trab.salarioMensual) return total;
    
    // Si tiene distribución de costes personalizada
    if (trab.distribucionCostes) {
      const distribucion = trab.distribucionCostes.find(
        d => d.puntoVentaId === puntoVentaId
      );
      const porcentaje = distribucion ? distribucion.porcentaje / 100 : 0;
      return total + (trab.salarioMensual * porcentaje);
    } else {
      // Si no tiene distribución, asignar 100% si es su PDV principal
      return trab.puntoVentaId === puntoVentaId 
        ? total + trab.salarioMensual
        : total;
    }
  }, 0);
};

/**
 * Calcular nómina total de una marca
 */
export const calcularNominaMarca = (marcaId: string): number => {
  const trabsMarca = obtenerTrabajadoresPorMarca(marcaId);
  
  return trabsMarca.reduce((total, trab) => {
    return total + (trab.salarioMensual || 0);
  }, 0);
};

/**
 * Calcular nómina total de una empresa
 */
export const calcularNominaEmpresa = (empresaId: string): number => {
  const trabsEmpresa = obtenerTrabajadoresPorEmpresa(empresaId);
  
  return trabsEmpresa.reduce((total, trab) => {
    return total + (trab.salarioMensual || 0);
  }, 0);
};

// ============================================
// FUNCIONES HELPER - ESTADÍSTICAS
// ============================================

/**
 * Obtener resumen de trabajadores por PDV
 */
export const obtenerResumenPDV = (puntoVentaId: string) => {
  const trabs = obtenerTrabajadoresPorPDV(puntoVentaId);
  
  return {
    totalTrabajadores: trabs.length,
    activos: trabs.filter(t => t.estado === 'activo').length,
    deVacaciones: trabs.filter(t => t.estado === 'vacaciones').length,
    deBaja: trabs.filter(t => t.estado === 'baja').length,
    nominaTotal: calcularNominaPDV(puntoVentaId),
    horasTotales: trabs.reduce((sum, t) => sum + t.horasTrabajadas, 0),
    horasContratadas: trabs.reduce((sum, t) => sum + t.horasContrato, 0),
    puestos: [...new Set(trabs.map(t => t.puesto))],
    departamentos: [...new Set(trabs.map(t => t.departamento))]
  };
};

/**
 * Obtener resumen de trabajadores por marca
 */
export const obtenerResumenMarca = (marcaId: string) => {
  const trabs = obtenerTrabajadoresPorMarca(marcaId);
  
  return {
    totalTrabajadores: trabs.length,
    activos: trabs.filter(t => t.estado === 'activo').length,
    nominaTotal: calcularNominaMarca(marcaId),
    horasTotales: trabs.reduce((sum, t) => sum + t.horasTrabajadas, 0),
    puestos: [...new Set(trabs.map(t => t.puesto))],
    departamentos: [...new Set(trabs.map(t => t.departamento))]
  };
};

/**
 * Obtener resumen de trabajadores por empresa
 */
export const obtenerResumenEmpresa = (empresaId: string) => {
  const trabs = obtenerTrabajadoresPorEmpresa(empresaId);
  
  return {
    totalTrabajadores: trabs.length,
    activos: trabs.filter(t => t.estado === 'activo').length,
    nominaTotal: calcularNominaEmpresa(empresaId),
    horasTotales: trabs.reduce((sum, t) => sum + t.horasTrabajadas, 0),
    puestos: [...new Set(trabs.map(t => t.puesto))],
    marcas: [...new Set(trabs.map(t => t.marcaId).filter(Boolean))],
    departamentos: [...new Set(trabs.map(t => t.departamento))]
  };
};

/**
 * Obtener estadísticas de horas extras
 */
export const obtenerHorasExtras = (puntoVentaId?: string) => {
  const trabs = puntoVentaId 
    ? obtenerTrabajadoresPorPDV(puntoVentaId)
    : trabajadores;
  
  return trabs
    .filter(t => t.horasTrabajadas > t.horasContrato)
    .map(t => ({
      trabajadorId: t.id,
      nombre: `${t.nombre} ${t.apellidos}`,
      horasExtra: t.horasTrabajadas - t.horasContrato,
      horasContrato: t.horasContrato,
      horasTrabajadas: t.horasTrabajadas
    }));
};

/**
 * Obtener trabajadores por rol
 */
export const obtenerTrabajadoresPorRol = (
  rol: RolTrabajador,
  puntoVentaId?: string
): Trabajador[] => {
  const trabs = puntoVentaId 
    ? obtenerTrabajadoresPorPDV(puntoVentaId)
    : trabajadores;
  
  return trabs.filter(t => t.rol === rol);
};

/**
 * Obtener distribución de trabajadores por departamento
 */
export const obtenerDistribucionDepartamentos = (puntoVentaId?: string) => {
  const trabs = puntoVentaId 
    ? obtenerTrabajadoresPorPDV(puntoVentaId)
    : trabajadores;
  
  const departamentos = new Map<string, number>();
  
  trabs.forEach(t => {
    const count = departamentos.get(t.departamento) || 0;
    departamentos.set(t.departamento, count + 1);
  });
  
  return Array.from(departamentos.entries()).map(([departamento, cantidad]) => ({
    departamento,
    cantidad,
    porcentaje: (cantidad / trabs.length) * 100
  }));
};

/**
 * Obtener coste medio por trabajador
 */
export const obtenerCosteMedioPDV = (puntoVentaId: string): number => {
  const trabs = obtenerTrabajadoresPorPDV(puntoVentaId);
  const nominaTotal = calcularNominaPDV(puntoVentaId);
  
  return trabs.length > 0 ? nominaTotal / trabs.length : 0;
};
