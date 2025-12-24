import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { stockManager } from '../data/stock-manager';
import type { MovimientoStock, RecepcionMaterial } from '../data/stock-manager';
import type { Ingrediente } from '../data/stock-ingredientes';
import { stockSyncService } from '../services/stock-sync.service'; // ✨ NUEVO

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface Marca {
  id: string;
  nombre: string;
  colorIdentidad: string;
}

export interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  telefono: string;
  email: string;
  marcasDisponibles: Marca[];
  activo: boolean;
}

export interface Empresa {
  id: string;
  nombreFiscal: string;
  cif: string;
  nombreComercial: string;
  domicilioFiscal: string;
  marcas: Marca[];
  puntosVenta: PuntoVenta[];
  cuentasBancarias: {
    numero: string;
    alias: string;
  }[];
  activo: boolean;
}

// Proveedor de artículo con relación N:M
export interface ProveedorArticulo {
  proveedorId: string;
  proveedorNombre: string;
  codigoProveedor: string;
  nombreProveedor: string;
  precioCompra: number;
  iva: number;
  recargoEquivalencia: number;
  ultimaCompra: string;
  ultimaFactura: string;
  esPreferente: boolean;
  activo: boolean;
}

// SKU de Stock - Separado por empresa y punto de venta
export interface SKU {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  empresa: string; // "Disarmink SL - Hoy Pecamos"
  almacen: string; // "Tiana" | "Badalona"
  ubicacion: string; // Punto de venta
  pasillo: string;
  estanteria: string;
  hueco: string;
  disponible: number;
  comprometido: number;
  minimo: number;
  maximo: number;
  rop: number; // Punto de reorden
  costoMedio: number;
  pvp: number;
  proveedores: ProveedorArticulo[];
  proveedorPreferente: string;
  ultimaCompra: string;
  leadTime: number;
  estado: 'bajo' | 'ok' | 'sobrestock';
  rotacion: number;
}

// Pedido a proveedor
export interface ArticuloPedido {
  id: string;
  codigo: string;
  codigoProveedor: string;
  nombre: string;
  nombreProveedor: string;
  cantidad: number;
  cantidadRecibida?: number;
  precioUnitario: number;
  iva: number;
  recargoEquivalencia: number;
  subtotal: number;
  totalConImpuestos: number;
}

export interface PedidoProveedor {
  id: string;
  numeroPedido: string;
  proveedorId: string;
  proveedorNombre: string;
  estado: 'solicitado' | 'confirmado' | 'en-transito' | 'entregado' | 'parcial' | 'reclamado' | 'anulado';
  fechaSolicitud: string;
  fechaConfirmacion?: string;
  fechaEntrega?: string;
  fechaEstimadaEntrega?: string;
  fechaRecepcion?: Date;
  empresa: string; // "Disarmink SL - Hoy Pecamos"
  puntoVenta: string; // "Tiana" | "Badalona"
  articulos: ArticuloPedido[];
  lineas: ArticuloPedido[]; // Alias para compatibilidad
  subtotal: number;
  totalIva: number;
  totalRecargoEquivalencia: number;
  total: number;
  anotaciones?: string;
  metodoEnvio?: 'email' | 'whatsapp' | 'app' | 'telefono';
  responsable: string;
  facturaId?: string;
  facturaCaseada?: boolean;
}

export interface Proveedor {
  id: string;
  nombre: string;
  sla: number;
  rating: number;
  leadTime: number;
  precioMedio: number;
  pedidosActivos: number;
}

// ============================================
// CONTEXT
// ============================================

interface StockContextType {
  // Empresas y puntos de venta
  empresas: Empresa[];
  empresaActiva: string | null;
  puntoVentaActivo: string | null;
  setEmpresaActiva: (empresaId: string) => void;
  setPuntoVentaActivo: (puntoVentaId: string) => void;
  getPuntosVentaDeEmpresa: (empresaId: string) => PuntoVenta[];
  
  // Stock
  stock: SKU[];
  getStockPorEmpresa: (empresa: string) => SKU[];
  getStockPorPuntoVenta: (empresa: string, puntoVenta: string) => SKU[];
  actualizarStockArticulo: (articuloId: string, cantidad: number) => void;
  
  // Pedidos a proveedores
  pedidosProveedores: PedidoProveedor[];
  getPedidosPorEmpresa: (empresa: string) => PedidoProveedor[];
  getPedidosPorPuntoVenta: (empresa: string, puntoVenta: string) => PedidoProveedor[];
  crearPedidoProveedor: (pedido: Omit<PedidoProveedor, 'id' | 'numeroPedido'>) => PedidoProveedor;
  
  // Proveedores
  proveedores: Proveedor[];
  
  // Movimientos
  movimientos: MovimientoStock[];
  getMovimientosPorPuntoVenta: (puntoVenta: string) => MovimientoStock[];
  
  // Recepciones
  recepciones: RecepcionMaterial[];
  registrarRecepcion: (recepcion: Omit<RecepcionMaterial, 'id' | 'fecha' | 'estado'>) => RecepcionMaterial;
  
  // Actualización global
  refreshAll: () => void;
}

const StockContext = createContext<StockContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface StockProviderProps {
  children: ReactNode;
}

export function StockProvider({ children }: StockProviderProps) {
  // Estado de empresas (desde ConfiguracionEmpresas)
  const [empresas] = useState<Empresa[]>([
    {
      id: 'EMP-001',
      nombreFiscal: 'Disarmink S.L.',
      cif: 'B67284315',
      nombreComercial: 'Hoy Pecamos',
      domicilioFiscal: 'Avenida Onze Setembre, 1, 08391 Tiana, Barcelona',
      marcas: [
        {
          id: 'MRC-001',
          nombre: 'Modomio',
          colorIdentidad: '#FF6B35',
        },
        {
          id: 'MRC-002',
          nombre: 'Blackburguer',
          colorIdentidad: '#1A1A1A',
        },
      ],
      puntosVenta: [
        {
          id: 'PDV-TIANA',
          nombre: 'Tiana',
          direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
          coordenadas: {
            latitud: 41.4933,
            longitud: 2.2633,
          },
          telefono: '+34 933 456 789',
          email: 'tiana@hoypecamos.com',
          marcasDisponibles: [
            { id: 'MRC-001', nombre: 'Modomio', colorIdentidad: '#FF6B35' },
            { id: 'MRC-002', nombre: 'Blackburguer', colorIdentidad: '#1A1A1A' },
          ],
          activo: true,
        },
        {
          id: 'PDV-BADALONA',
          nombre: 'Badalona',
          direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
          coordenadas: {
            latitud: 41.4500,
            longitud: 2.2461,
          },
          telefono: '+34 933 456 790',
          email: 'badalona@hoypecamos.com',
          marcasDisponibles: [
            { id: 'MRC-001', nombre: 'Modomio', colorIdentidad: '#FF6B35' },
            { id: 'MRC-002', nombre: 'Blackburguer', colorIdentidad: '#1A1A1A' },
          ],
          activo: true,
        },
      ],
      cuentasBancarias: [
        {
          numero: 'ES91 2100 0418 4502 0005 1332',
          alias: 'Cuenta Principal Disarmink',
        },
        {
          numero: 'ES76 0128 0123 4501 0006 7890',
          alias: 'Cuenta Operativa Hoy Pecamos',
        },
      ],
      activo: true,
    },
  ]);

  // Empresa y punto de venta activos (del usuario logueado)
  const [empresaActiva, setEmpresaActiva] = useState<string | null>('EMP-001');
  const [puntoVentaActivo, setPuntoVentaActivo] = useState<string | null>('PDV-TIANA');

  // Estado del stock (separado por empresa y punto de venta)
  const [stock, setStock] = useState<SKU[]>([]);
  
  // Estado de pedidos a proveedores
  const [pedidosProveedores, setPedidosProveedores] = useState<PedidoProveedor[]>([]);
  
  // Estado de proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Estado de movimientos
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  
  // Estado de recepciones
  const [recepciones, setRecepciones] = useState<RecepcionMaterial[]>([]);

  // Inicializar datos al montar
  useEffect(() => {
    cargarDatosMock();
  }, []);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const cargarDatosMock = () => {
    // Cargar stock mock (datos de StockProveedoresCafe)
    const stockMock: SKU[] = [
      {
        id: 'SKU001',
        codigo: 'ART-001',
        nombre: 'Harina de Trigo T45',
        categoria: 'Harinas',
        empresa: 'Disarmink SL - Hoy Pecamos',
        almacen: 'Tiana',
        ubicacion: 'Tiana',
        pasillo: 'A',
        estanteria: '01',
        hueco: '01',
        disponible: 15,
        comprometido: 10,
        minimo: 25,
        maximo: 100,
        rop: 40,
        costoMedio: 18.50,
        pvp: 28.00,
        proveedores: [
          {
            proveedorId: 'PROV-001',
            proveedorNombre: 'Harinas del Norte',
            codigoProveedor: 'HAR-001',
            nombreProveedor: 'Harina de Trigo T45 25kg',
            precioCompra: 18.50,
            iva: 4,
            recargoEquivalencia: 0.5,
            ultimaCompra: '2025-11-20',
            ultimaFactura: 'FACT-2025-101',
            esPreferente: true,
            activo: true
          }
        ],
        proveedorPreferente: 'PROV-001',
        ultimaCompra: '2025-11-20',
        leadTime: 3,
        estado: 'bajo',
        rotacion: 35.5
      },
      {
        id: 'SKU002',
        codigo: 'ART-002',
        nombre: 'Queso Mozzarella',
        categoria: 'Lácteos',
        empresa: 'Disarmink SL - Hoy Pecamos',
        almacen: 'Tiana',
        ubicacion: 'Tiana',
        pasillo: 'A',
        estanteria: '01',
        hueco: '02',
        disponible: 3,
        comprometido: 2,
        minimo: 8,
        maximo: 25,
        rop: 12,
        costoMedio: 22.80,
        pvp: 35.00,
        proveedores: [
          {
            proveedorId: 'PROV-002',
            proveedorNombre: 'Lácteos Premium',
            codigoProveedor: 'QUE-002',
            nombreProveedor: 'Mozzarella Fior di Latte 5kg',
            precioCompra: 22.80,
            iva: 4,
            recargoEquivalencia: 0.5,
            ultimaCompra: '2025-11-18',
            ultimaFactura: 'FACT-2025-098',
            esPreferente: true,
            activo: true
          }
        ],
        proveedorPreferente: 'PROV-002',
        ultimaCompra: '2025-11-18',
        leadTime: 2,
        estado: 'bajo',
        rotacion: 42.3
      },
      {
        id: 'SKU003',
        codigo: 'ART-003',
        nombre: 'Tomate Triturado Natural',
        categoria: 'Conservas',
        empresa: 'Disarmink SL - Hoy Pecamos',
        almacen: 'Tiana',
        ubicacion: 'Tiana',
        pasillo: 'B',
        estanteria: '02',
        hueco: '01',
        disponible: 8,
        comprometido: 3,
        minimo: 15,
        maximo: 40,
        rop: 20,
        costoMedio: 12.30,
        pvp: 18.50,
        proveedores: [
          {
            proveedorId: 'PROV-003',
            proveedorNombre: 'Conservas Mediterráneas',
            codigoProveedor: 'TOM-003',
            nombreProveedor: 'Tomate Triturado Lata 3kg',
            precioCompra: 12.30,
            iva: 10,
            recargoEquivalencia: 1.4,
            ultimaCompra: '2025-11-15',
            ultimaFactura: 'FACT-2025-095',
            esPreferente: true,
            activo: true
          }
        ],
        proveedorPreferente: 'PROV-003',
        ultimaCompra: '2025-11-15',
        leadTime: 5,
        estado: 'bajo',
        rotacion: 28.8
      },
      {
        id: 'SKU004',
        codigo: 'ART-004',
        nombre: 'Carne de Ternera Premium',
        categoria: 'Cárnicos',
        empresa: 'Disarmink SL - Hoy Pecamos',
        almacen: 'Badalona',
        ubicacion: 'Badalona',
        pasillo: 'C',
        estanteria: '01',
        hueco: '01',
        disponible: 12,
        comprometido: 8,
        minimo: 20,
        maximo: 50,
        rop: 25,
        costoMedio: 35.40,
        pvp: 52.00,
        proveedores: [
          {
            proveedorId: 'PROV-004',
            proveedorNombre: 'Cárnicos Selectos',
            codigoProveedor: 'CAR-004',
            nombreProveedor: 'Ternera Añojo Selección 5kg',
            precioCompra: 35.40,
            iva: 10,
            recargoEquivalencia: 1.4,
            ultimaCompra: '2025-11-22',
            ultimaFactura: 'FACT-2025-103',
            esPreferente: true,
            activo: true
          }
        ],
        proveedorPreferente: 'PROV-004',
        ultimaCompra: '2025-11-22',
        leadTime: 2,
        estado: 'bajo',
        rotacion: 32.5
      },
      {
        id: 'SKU005',
        codigo: 'ART-005',
        nombre: 'Pan de Hamburguesa Brioche',
        categoria: 'Panadería',
        empresa: 'Disarmink SL - Hoy Pecamos',
        almacen: 'Badalona',
        ubicacion: 'Badalona',
        pasillo: 'A',
        estanteria: '03',
        hueco: '01',
        disponible: 18,
        comprometido: 12,
        minimo: 30,
        maximo: 80,
        rop: 40,
        costoMedio: 15.60,
        pvp: 24.00,
        proveedores: [
          {
            proveedorId: 'PROV-005',
            proveedorNombre: 'Panadería Industrial',
            codigoProveedor: 'PAN-005',
            nombreProveedor: 'Brioche Burger Buns 50 uds',
            precioCompra: 15.60,
            iva: 4,
            recargoEquivalencia: 0.5,
            ultimaCompra: '2025-11-21',
            ultimaFactura: 'FACT-2025-102',
            esPreferente: true,
            activo: true
          }
        ],
        proveedorPreferente: 'PROV-005',
        ultimaCompra: '2025-11-21',
        leadTime: 1,
        estado: 'bajo',
        rotacion: 45.2
      }
    ];

    setStock(stockMock);

    // Cargar proveedores mock
    const proveedoresMock: Proveedor[] = [
      { id: 'PROV-001', nombre: 'Harinas del Norte', sla: 96.5, rating: 4.8, leadTime: 3, precioMedio: 18.50, pedidosActivos: 2 },
      { id: 'PROV-002', nombre: 'Lácteos Premium', sla: 98.0, rating: 4.9, leadTime: 2, precioMedio: 22.80, pedidosActivos: 3 },
      { id: 'PROV-003', nombre: 'Conservas Mediterráneas', sla: 94.2, rating: 4.7, leadTime: 5, precioMedio: 12.30, pedidosActivos: 1 },
      { id: 'PROV-004', nombre: 'Cárnicos Selectos', sla: 97.5, rating: 4.9, leadTime: 2, precioMedio: 35.40, pedidosActivos: 4 },
      { id: 'PROV-005', nombre: 'Panadería Industrial', sla: 95.8, rating: 4.8, leadTime: 1, precioMedio: 15.60, pedidosActivos: 2 },
    ];

    setProveedores(proveedoresMock);

    // Cargar pedidos a proveedores mock
    const pedidosMock: PedidoProveedor[] = [
      {
        id: 'PED-001',
        numeroPedido: 'PED-2025-001',
        proveedorId: 'PROV-001',
        proveedorNombre: 'Harinas del Norte',
        estado: 'entregado',
        fechaSolicitud: '2025-11-15T10:30:00',
        fechaConfirmacion: '2025-11-15T14:20:00',
        fechaEntrega: '2025-11-18T09:15:00',
        fechaEstimadaEntrega: '2025-11-18T00:00:00',
        empresa: 'Disarmink SL - Hoy Pecamos',
        puntoVenta: 'Tiana',
        articulos: [
          {
            id: 'SKU001',
            codigo: 'ART-001',
            codigoProveedor: 'HAR-001',
            nombre: 'Harina de Trigo T45',
            nombreProveedor: 'Harina de Trigo T45 25kg',
            cantidad: 40,
            precioUnitario: 18.50,
            iva: 4,
            recargoEquivalencia: 0.5,
            subtotal: 740.00,
            totalConImpuestos: 773.30
          }
        ],
        lineas: [
          {
            id: 'SKU001',
            codigo: 'ART-001',
            codigoProveedor: 'HAR-001',
            nombre: 'Harina de Trigo T45',
            nombreProveedor: 'Harina de Trigo T45 25kg',
            cantidad: 40,
            cantidadRecibida: 40,
            precioUnitario: 18.50,
            iva: 4,
            recargoEquivalencia: 0.5,
            subtotal: 740.00,
            totalConImpuestos: 773.30
          }
        ],
        subtotal: 740.00,
        totalIva: 29.60,
        totalRecargoEquivalencia: 3.70,
        total: 773.30,
        anotaciones: 'Entrega en horario de mañana',
        metodoEnvio: 'email',
        responsable: 'Carlos Martínez',
        facturaId: 'FACT-2025-101',
        facturaCaseada: true
      },
      {
        id: 'PED-002',
        numeroPedido: 'PED-2025-002',
        proveedorId: 'PROV-002',
        proveedorNombre: 'Lácteos Premium',
        estado: 'en-transito',
        fechaSolicitud: '2025-11-22T08:45:00',
        fechaConfirmacion: '2025-11-22T11:30:00',
        fechaEstimadaEntrega: '2025-11-24T00:00:00',
        empresa: 'Disarmink SL - Hoy Pecamos',
        puntoVenta: 'Tiana',
        articulos: [
          {
            id: 'SKU002',
            codigo: 'ART-002',
            codigoProveedor: 'QUE-002',
            nombre: 'Queso Mozzarella',
            nombreProveedor: 'Mozzarella Fior di Latte 5kg',
            cantidad: 10,
            precioUnitario: 22.80,
            iva: 4,
            recargoEquivalencia: 0.5,
            subtotal: 228.00,
            totalConImpuestos: 238.26
          }
        ],
        lineas: [
          {
            id: 'SKU002',
            codigo: 'ART-002',
            codigoProveedor: 'QUE-002',
            nombre: 'Queso Mozzarella',
            nombreProveedor: 'Mozzarella Fior di Latte 5kg',
            cantidad: 10,
            precioUnitario: 22.80,
            iva: 4,
            recargoEquivalencia: 0.5,
            subtotal: 228.00,
            totalConImpuestos: 238.26
          }
        ],
        subtotal: 228.00,
        totalIva: 9.12,
        totalRecargoEquivalencia: 1.14,
        total: 238.26,
        responsable: 'Ana García'
      }
    ];

    setPedidosProveedores(pedidosMock);

    // Cargar movimientos desde stockManager
    setMovimientos(stockManager.getMovimientos());
    
    // Cargar recepciones desde stockManager
    setRecepciones(stockManager.getRecepciones());

    console.log('🔌 StockContext: Datos mock cargados', {
      stock: stockMock.length,
      pedidos: pedidosMock.length,
      proveedores: proveedoresMock.length,
      empresas: empresas.length
    });
  };

  // ============================================
  // FUNCIONES DE EMPRESAS Y PUNTOS DE VENTA
  // ============================================

  const getPuntosVentaDeEmpresa = (empresaId: string): PuntoVenta[] => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.puntosVenta : [];
  };

  // ============================================
  // FUNCIONES DE STOCK
  // ============================================

  const getStockPorEmpresa = (empresa: string): SKU[] => {
    return stock.filter(s => s.empresa === empresa);
  };

  const getStockPorPuntoVenta = (empresa: string, puntoVenta: string): SKU[] => {
    return stock.filter(s => s.empresa === empresa && s.ubicacion === puntoVenta);
  };

  const actualizarStockArticulo = (articuloId: string, cantidad: number) => {
    setStock(prevStock => 
      prevStock.map(item => 
        item.id === articuloId 
          ? { ...item, disponible: item.disponible + cantidad }
          : item
      )
    );

    // ✨ NUEVO: Notificar cambio de ingrediente para sincronización
    stockSyncService.notificarCambioIngredientes([articuloId], 'StockContext');

    console.log('📦 Stock actualizado:', { articuloId, cantidad });
  };

  // ============================================
  // FUNCIONES DE PEDIDOS
  // ============================================

  const getPedidosPorEmpresa = (empresa: string): PedidoProveedor[] => {
    return pedidosProveedores.filter(p => p.empresa === empresa);
  };

  const getPedidosPorPuntoVenta = (empresa: string, puntoVenta: string): PedidoProveedor[] => {
    return pedidosProveedores.filter(p => p.empresa === empresa && p.puntoVenta === puntoVenta);
  };

  const crearPedidoProveedor = (pedido: Omit<PedidoProveedor, 'id' | 'numeroPedido'>): PedidoProveedor => {
    const nuevoPedido: PedidoProveedor = {
      ...pedido,
      id: `PED-${Date.now()}`,
      numeroPedido: `PED-2025-${String(pedidosProveedores.length + 1).padStart(3, '0')}`,
    };

    setPedidosProveedores(prev => [...prev, nuevoPedido]);

    console.log('📋 Pedido creado:', nuevoPedido);

    return nuevoPedido;
  };

  // ============================================
  // FUNCIONES DE MOVIMIENTOS
  // ============================================

  const getMovimientosPorPuntoVenta = (puntoVenta: string): MovimientoStock[] => {
    return movimientos.filter(m => m.pdv === puntoVenta);
  };

  // ============================================
  // FUNCIONES DE RECEPCIÓN
  // ============================================

  const registrarRecepcion = (recepcion: Omit<RecepcionMaterial, 'id' | 'fecha' | 'estado'>): RecepcionMaterial => {
    // Registrar en StockManager
    const nuevaRecepcion = stockManager.registrarRecepcion(recepcion);

    // Actualizar recepciones en contexto
    setRecepciones(prev => [...prev, nuevaRecepcion]);

    // Actualizar movimientos
    setMovimientos(stockManager.getMovimientos());

    // Actualizar stock de artículos recibidos
    recepcion.materiales.forEach(material => {
      actualizarStockArticulo(material.articuloId, material.cantidadRecibida);
    });

    // Si hay pedido relacionado, actualizar su estado
    if (recepcion.pedidoRelacionado) {
      const materialesRecibidos = recepcion.materiales.map(mat => ({
        articuloId: mat.articuloId,
        cantidadRecibida: mat.cantidadRecibida
      }));
      
      stockManager.actualizarEstadoPedido(recepcion.pedidoRelacionado, materialesRecibidos);

      // Actualizar pedido en el contexto
      setPedidosProveedores(prev => 
        prev.map(pedido => {
          if (pedido.id === recepcion.pedidoRelacionado) {
            // Actualizar líneas del pedido
            const lineasActualizadas = pedido.lineas.map(linea => {
              const matRecibido = materialesRecibidos.find(m => m.articuloId === linea.id);
              if (matRecibido) {
                return {
                  ...linea,
                  cantidadRecibida: (linea.cantidadRecibida || 0) + matRecibido.cantidadRecibida
                };
              }
              return linea;
            });

            // Determinar nuevo estado
            const todasCompletas = lineasActualizadas.every(l => 
              l.cantidadRecibida && l.cantidadRecibida >= l.cantidad
            );
            
            const algunaParcial = lineasActualizadas.some(l => 
              l.cantidadRecibida && l.cantidadRecibida > 0 && l.cantidadRecibida < l.cantidad
            );

            let nuevoEstado: PedidoProveedor['estado'] = pedido.estado;
            if (todasCompletas) {
              nuevoEstado = 'entregado';
            } else if (algunaParcial) {
              nuevoEstado = 'parcial';
            }

            return {
              ...pedido,
              lineas: lineasActualizadas,
              articulos: lineasActualizadas,
              estado: nuevoEstado,
              fechaRecepcion: todasCompletas ? new Date() : pedido.fechaRecepcion
            };
          }
          return pedido;
        })
      );
    }

    console.log('✅ Recepción registrada en contexto:', {
      id: nuevaRecepcion.id,
      articulos: recepcion.materiales.length,
      pedidoRelacionado: recepcion.pedidoRelacionado
    });

    return nuevaRecepcion;
  };

  // ============================================
  // ACTUALIZACIÓN GLOBAL
  // ============================================

  const refreshAll = () => {
    setMovimientos(stockManager.getMovimientos());
    setRecepciones(stockManager.getRecepciones());
    
    console.log('🔄 StockContext: Datos actualizados');
  };

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================

  const value: StockContextType = {
    // Empresas y puntos de venta
    empresas,
    empresaActiva,
    puntoVentaActivo,
    setEmpresaActiva,
    setPuntoVentaActivo,
    getPuntosVentaDeEmpresa,
    
    // Stock
    stock,
    getStockPorEmpresa,
    getStockPorPuntoVenta,
    actualizarStockArticulo,
    
    // Pedidos
    pedidosProveedores,
    getPedidosPorEmpresa,
    getPedidosPorPuntoVenta,
    crearPedidoProveedor,
    
    // Proveedores
    proveedores,
    
    // Movimientos
    movimientos,
    getMovimientosPorPuntoVenta,
    
    // Recepciones
    recepciones,
    registrarRecepcion,
    
    // Actualización
    refreshAll,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

// ============================================
// HOOK PERSONALIZADO
// ============================================

export function useStock() {
  const context = useContext(StockContext);
  
  if (!context) {
    throw new Error('useStock debe ser usado dentro de un StockProvider');
  }
  
  return context;
}