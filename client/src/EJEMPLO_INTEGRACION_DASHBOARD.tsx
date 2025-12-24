// ============================================================================
// EJEMPLO: Integración del Filtro Universal UDAR en Dashboard 360°
// ============================================================================

import { useState, useEffect } from 'react';
import { FiltroUniversalUDAR } from './components/filtros/FiltroUniversalUDAR';
import { useFiltroUniversal, generarPayloadMake } from './contexts/FiltroUniversalContext';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

// ============================================================================
// COMPONENTE DASHBOARD 360° CON FILTRO UNIVERSAL
// ============================================================================

export function Dashboard360Actualizado() {
  // Hook del filtro universal
  const { 
    filtroData, 
    setFiltroData, 
    isFiltered, 
    resetFiltros,
    getEmpresasSeleccionadas,
    getMarcasSeleccionadas,
    getPDVsSeleccionados
  } = useFiltroUniversal();

  // Estados locales
  const [datosKPIs, setDatosKPIs] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // CARGAR DATOS CUANDO CAMBIA EL FILTRO
  // ============================================================================

  useEffect(() => {
    cargarDatos();
  }, [filtroData]); // Se recarga automáticamente cuando cambia el filtro

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      // Generar payload para Make.com
      const payload = generarPayloadMake(filtroData, 'uuid-pau'); // Reemplazar con userId real

      // Llamar al endpoint
      const response = await fetch('/api/dashboard/kpis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Añadir autenticación si es necesario
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDatosKPIs(data);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getResumenFiltro = (): string => {
    const empresas = getEmpresasSeleccionadas();
    const marcas = getMarcasSeleccionadas();
    const pdvs = getPDVsSeleccionados();

    if (!isFiltered()) {
      return 'Mostrando datos de todas las empresas';
    }

    const parts: string[] = [];
    
    if (empresas.length > 0) {
      parts.push(`${empresas.length} empresa${empresas.length > 1 ? 's' : ''}`);
    }
    if (marcas.length > 0) {
      parts.push(`${marcas.length} marca${marcas.length > 1 ? 's' : ''}`);
    }
    if (pdvs.length > 0) {
      parts.push(`${pdvs.length} PDV${pdvs.length > 1 ? 's' : ''}`);
    }

    return `Filtrando por: ${parts.join(', ')}`;
  };

  const formatEuro = (valor: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Dashboard 360°
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Visión completa y unificada del negocio
        </p>
      </div>

      {/* Filtro Universal */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Filtros Activos</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
          >
            {cargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        <FiltroUniversalUDAR
          selectedContext={filtroData.selectedContext}
          filtrosAdicionales={filtroData.filtrosAdicionales}
          onChange={setFiltroData}
          moduloConfig={{
            mostrarPeriodo: true,
            mostrarCanales: true,
            mostrarEstados: false,
            mostrarTipo: false,
            opcionesCanales: [
              { value: 'mostrador', label: 'Mostrador' },
              { value: 'app', label: 'App móvil' },
              { value: 'web', label: 'Web' },
              { value: 'telefono', label: 'Teléfono' },
              { value: 'delivery', label: 'Delivery (3ros)' }
            ]
          }}
        />

        {/* Resumen del filtro */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {getResumenFiltro()}
          </p>
          {isFiltered() && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFiltros}
              className="text-xs"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {cargando && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      )}

      {/* KPIs */}
      {!cargando && datosKPIs && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ventas Totales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ventas Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatEuro(datosKPIs.ventas_totales || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {datosKPIs.num_pedidos || 0} pedidos
                </p>
              </CardContent>
            </Card>

            {/* EBITDA */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  EBITDA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatEuro(datosKPIs.ebitda || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Margen: {datosKPIs.margen_porcentaje || 0}%
                </p>
              </CardContent>
            </Card>

            {/* Ticket Medio */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ticket Medio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatEuro(datosKPIs.ticket_medio || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Por pedido
                </p>
              </CardContent>
            </Card>

            {/* NPS */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  NPS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {datosKPIs.nps || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Satisfacción del cliente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Desglose por Empresa/Marca/PDV */}
          {datosKPIs.desglose && datosKPIs.desglose.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Desglose por Contexto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Empresa</th>
                        <th className="text-left py-2">Marca</th>
                        <th className="text-left py-2">PDV</th>
                        <th className="text-right py-2">Ventas</th>
                        <th className="text-right py-2">EBITDA</th>
                        <th className="text-right py-2">Margen %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosKPIs.desglose.map((item: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2">{item.empresa_nombre}</td>
                          <td className="py-2">{item.marca_nombre || '-'}</td>
                          <td className="py-2">{item.pdv_nombre || '-'}</td>
                          <td className="text-right py-2">{formatEuro(item.ventas)}</td>
                          <td className="text-right py-2">{formatEuro(item.ebitda)}</td>
                          <td className="text-right py-2">{item.margen_porcentaje}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info sobre los filtros aplicados */}
          {filtroData.filtrosAdicionales.canales.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-800">
                  <strong>Canales filtrados:</strong>{' '}
                  {filtroData.filtrosAdicionales.canales.join(', ')}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// EJEMPLO DE RESPUESTA DEL BACKEND
// ============================================================================

/*
Response de /api/dashboard/kpis:

{
  "success": true,
  "ventas_totales": 145250.50,
  "num_pedidos": 1247,
  "ebitda": 52140.30,
  "margen_porcentaje": 35.9,
  "ticket_medio": 116.45,
  "nps": 8.4,
  "filtros_aplicados": {
    "empresas": ["EMP-001"],
    "marcas": ["MRC-001", "MRC-002"],
    "pdvs": ["PDV-TIA", "PDV-BAD"],
    "periodo": "01/11/2025 - 30/11/2025",
    "canales": ["mostrador", "app"]
  },
  "desglose": [
    {
      "empresa_id": "EMP-001",
      "empresa_nombre": "Disarmink S.L.",
      "marca_id": "MRC-001",
      "marca_nombre": "Modomio",
      "pdv_id": "PDV-TIANA",
      "pdv_nombre": "Tiana",
      "ventas": 85000.00,
      "ebitda": 28500.00,
      "margen_porcentaje": 33.5
    },
    {
      "empresa_id": "EMP-001",
      "empresa_nombre": "Disarmink S.L.",
      "marca_id": "MRC-001",
      "marca_nombre": "Modomio",
      "pdv_id": "PDV-BADALONA",
      "pdv_nombre": "Badalona",
      "ventas": 60250.50,
      "ebitda": 23640.30,
      "margen_porcentaje": 39.2
    },
    {
      "empresa_id": "EMP-001",
      "empresa_nombre": "Disarmink S.L.",
      "marca_id": "MRC-002",
      "marca_nombre": "Blackburguer",
      "pdv_id": "PDV-TIANA",
      "pdv_nombre": "Tiana",
      "ventas": 72500.00,
      "ebitda": 26100.00,
      "margen_porcentaje": 36.0
    },
    {
      "empresa_id": "EMP-001",
      "empresa_nombre": "Disarmink S.L.",
      "marca_id": "MRC-002",
      "marca_nombre": "Blackburguer",
      "pdv_id": "PDV-BADALONA",
      "pdv_nombre": "Badalona",
      "ventas": 68900.00,
      "ebitda": 24800.00,
      "margen_porcentaje": 36.0
    }
  ]
}
*/

// ============================================================================
// EJEMPLO DE ENDPOINT BACKEND (Node.js + PostgreSQL)
// ============================================================================

/*
// api/dashboard/kpis

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(request: NextRequest) {
  try {
    const { user_id, selected_context, filtros } = await request.json();

    // Validar usuario
    const userResult = await pool.query(
      'SELECT rol_global FROM usuario WHERE id_usuario = $1',
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 403 }
      );
    }

    // Construir WHERE clause
    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIndex = 1;

    // CONTEXTO
    if (selected_context.length > 0) {
      const empresaIds = selected_context.map((ctx: any) => ctx.empresa_id);
      whereConditions.push(`pv.empresa_id = ANY($${paramIndex})`);
      params.push(empresaIds);
      paramIndex++;

      const marcaIds = selected_context
        .filter((ctx: any) => ctx.marca_id !== null)
        .map((ctx: any) => ctx.marca_id);
      
      if (marcaIds.length > 0) {
        whereConditions.push(`pv.marca_id = ANY($${paramIndex})`);
        params.push(marcaIds);
        paramIndex++;
      }

      const pdvIds = selected_context
        .filter((ctx: any) => ctx.punto_venta_id !== null)
        .map((ctx: any) => ctx.punto_venta_id);
      
      if (pdvIds.length > 0) {
        whereConditions.push(`v.punto_venta_id = ANY($${paramIndex})`);
        params.push(pdvIds);
        paramIndex++;
      }
    }

    // PERIODO
    if (filtros.periodo.fecha_inicio) {
      whereConditions.push(`v.fecha >= $${paramIndex}`);
      params.push(filtros.periodo.fecha_inicio);
      paramIndex++;
    }

    if (filtros.periodo.fecha_fin) {
      whereConditions.push(`v.fecha <= $${paramIndex}`);
      params.push(filtros.periodo.fecha_fin);
      paramIndex++;
    }

    // CANALES
    if (filtros.canales.length > 0) {
      whereConditions.push(`v.canal = ANY($${paramIndex})`);
      params.push(filtros.canales);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // QUERY PRINCIPAL: KPIs Totales
    const kpisQuery = `
      SELECT 
        SUM(v.importe_total) AS ventas_totales,
        COUNT(DISTINCT v.pedido_id) AS num_pedidos,
        ROUND(AVG(v.importe_total), 2) AS ticket_medio
      FROM ventas v
      INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
      WHERE ${whereClause}
        AND v.estado = 'completado'
    `;

    const kpisResult = await pool.query(kpisQuery, params);
    const kpis = kpisResult.rows[0];

    // QUERY: EBITDA
    const ebitdaQuery = `
      SELECT 
        SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
        ROUND(
          (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
          1
        ) AS margen_porcentaje
      FROM datos_financieros df
      INNER JOIN punto_venta pv ON df.punto_venta_id = pv.punto_venta_id
      WHERE ${whereClause.replace('v.', 'df.')}
    `;

    const ebitdaResult = await pool.query(ebitdaQuery, params);
    const ebitdaData = ebitdaResult.rows[0];

    // QUERY: Desglose por contexto
    const desgloseQuery = `
      SELECT 
        e.empresa_id,
        e.nombre AS empresa_nombre,
        m.marca_id,
        m.nombre AS marca_nombre,
        pv.punto_venta_id AS pdv_id,
        pv.nombre_comercial AS pdv_nombre,
        SUM(v.importe_total) AS ventas,
        SUM(df.ventas - df.coste_ventas - df.gastos_operativos) AS ebitda,
        ROUND(
          (SUM(df.ventas - df.coste_ventas - df.gastos_operativos) / NULLIF(SUM(df.ventas), 0)) * 100,
          1
        ) AS margen_porcentaje
      FROM ventas v
      INNER JOIN punto_venta pv ON v.punto_venta_id = pv.punto_venta_id
      INNER JOIN marca m ON pv.marca_id = m.marca_id
      INNER JOIN empresa e ON pv.empresa_id = e.empresa_id
      LEFT JOIN datos_financieros df ON pv.punto_venta_id = df.punto_venta_id
        AND v.fecha::date = df.fecha
      WHERE ${whereClause}
        AND v.estado = 'completado'
      GROUP BY e.empresa_id, e.nombre, m.marca_id, m.nombre, pv.punto_venta_id, pv.nombre_comercial
      ORDER BY ventas DESC
    `;

    const desgloseResult = await pool.query(desgloseQuery, params);

    // Respuesta
    return NextResponse.json({
      success: true,
      ventas_totales: parseFloat(kpis.ventas_totales || 0),
      num_pedidos: parseInt(kpis.num_pedidos || 0),
      ticket_medio: parseFloat(kpis.ticket_medio || 0),
      ebitda: parseFloat(ebitdaData.ebitda || 0),
      margen_porcentaje: parseFloat(ebitdaData.margen_porcentaje || 0),
      nps: 8.4, // Calcular desde tabla de valoraciones
      desglose: desgloseResult.rows
    });

  } catch (error) {
    console.error('Error en /api/dashboard/kpis:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
*/

// ============================================================================
// FIN DEL EJEMPLO
// ============================================================================
