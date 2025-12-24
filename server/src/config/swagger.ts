import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UDAR Edge Delivery 360 API',
      version: '1.0.0',
      description: 'API completa para el sistema de gestión empresarial UDAR Edge Delivery 360',
      contact: {
        name: 'UDAR Team',
        email: 'soporte@udar.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.udardelivery360.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de autenticación'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            detalles: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        },
        Cliente: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            apellidos: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
            ciudad: { type: 'string' },
            codigo_postal: { type: 'string' },
            fecha_registro: { type: 'string', format: 'date-time' },
            activo: { type: 'boolean' }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clienteId: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
            estado: { type: 'string', enum: ['pendiente', 'en_proceso', 'completado', 'cancelado'] },
            total: { type: 'number' },
            direccion_entrega: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productoId: { type: 'integer' },
                  cantidad: { type: 'integer' },
                  precio_unitario: { type: 'number' },
                  subtotal: { type: 'number' }
                }
              }
            }
          }
        },
        Factura: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            numero: { type: 'string' },
            pedidoId: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
            subtotal: { type: 'number' },
            iva: { type: 'number' },
            total: { type: 'number' },
            estado: { type: 'string', enum: ['emitida', 'pagada', 'vencida'] }
          }
        },
        Producto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            precio: { type: 'number' },
            categoria: { type: 'string' },
            stock: { type: 'integer' },
            imagen: { type: 'string' },
            activo: { type: 'boolean' }
          }
        },
        Cita: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clienteId: { type: 'integer' },
            fecha: { type: 'string', format: 'date-time' },
            tipo: { type: 'string' },
            estado: { type: 'string', enum: ['programada', 'completada', 'cancelada'] },
            notas: { type: 'string' }
          }
        },
        Promocion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            descuento: { type: 'number' },
            fecha_inicio: { type: 'string', format: 'date-time' },
            fecha_fin: { type: 'string', format: 'date-time' },
            activo: { type: 'boolean' }
          }
        },
        DatosVentas: {
          type: 'object',
          properties: {
            fecha: { type: 'string', format: 'date' },
            ventas_totales: { type: 'number' },
            num_pedidos: { type: 'integer' },
            ticket_medio: { type: 'number' },
            margen_bruto: { type: 'number' },
            productos_mas_vendidos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  producto_id: { type: 'string' },
                  nombre: { type: 'string' },
                  cantidad: { type: 'integer' },
                  total: { type: 'number' }
                }
              }
            }
          }
        },
        KPIs: {
          type: 'object',
          properties: {
            total_ventas: { type: 'number' },
            total_pedidos: { type: 'integer' },
            ticket_medio: { type: 'number' },
            margen_promedio: { type: 'number' },
            tasa_conversion: { type: 'number' },
            clientes_nuevos: { type: 'integer' },
            clientes_recurrentes: { type: 'integer' }
          }
        },
        Empleado: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' },
            apellidos: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            cargo: { type: 'string' },
            departamento: { type: 'string' },
            fecha_alta: { type: 'string', format: 'date-time' },
            salario_base: { type: 'number' },
            empresa_id: { type: 'string' },
            punto_venta_id: { type: 'string' },
            activo: { type: 'boolean' },
            desempeno: { type: 'number', minimum: 0, maximum: 100 },
            horas_mes: { type: 'number' }
          }
        },
        ArticuloStock: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            codigo: { type: 'string' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            categoria: { type: 'string' },
            unidad_medida: { type: 'string', enum: ['kg', 'litro', 'unidad'] },
            stock_actual: { type: 'number' },
            stock_minimo: { type: 'number' },
            stock_maximo: { type: 'number' },
            precio_compra: { type: 'number' },
            empresa_id: { type: 'string' },
            punto_venta_id: { type: 'string' },
            proveedor_id: { type: 'string' }
          }
        },
        Proveedor: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' },
            cif: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
            activo: { type: 'boolean' },
            empresa_id: { type: 'string' }
          }
        },
        ProductoCatalogo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            sku: { type: 'string' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            categoria: { type: 'string' },
            precio: { type: 'number' },
            precio_compra: { type: 'number' },
            stock_actual: { type: 'number' },
            stock_minimo: { type: 'number' },
            imagen_url: { type: 'string' },
            activo: { type: 'boolean' },
            visible_app: { type: 'boolean' },
            visible_tpv: { type: 'boolean' },
            empresa_id: { type: 'string' }
          }
        },
        CierreCaja: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fecha: { type: 'string', format: 'date-time' },
            efectivo_inicial: { type: 'number' },
            efectivo_final: { type: 'number' },
            total_ventas: { type: 'number' },
            total_gastos: { type: 'number' },
            diferencia: { type: 'number' },
            punto_venta_id: { type: 'string' },
            responsable_id: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Autenticación y autorización'
      },
      {
        name: 'Clientes',
        description: 'Gestión de clientes'
      },
      {
        name: 'Pedidos',
        description: 'Gestión de pedidos y entregas'
      },
      {
        name: 'Productos',
        description: 'Gestión de productos y catálogo'
      },
      {
        name: 'Facturas',
        description: 'Gestión de facturación'
      },
      {
        name: 'Citas',
        description: 'Gestión de citas y reservas'
      },
      {
        name: 'Promociones',
        description: 'Gestión de promociones y cupones'
      },
      {
        name: 'Notificaciones',
        description: 'Sistema de notificaciones'
      },
      {
        name: 'Chats',
        description: 'Sistema de mensajería'
      },
      {
        name: 'Dashboard',
        description: 'Endpoints para el dashboard del gerente (ventas, KPIs, alertas)'
      },
      {
        name: 'Empleados',
        description: 'Gestión de empleados, fichajes y tareas'
      },
      {
        name: 'Stock',
        description: 'Gestión de inventario, artículos y proveedores'
      },
      {
        name: 'Finanzas',
        description: 'Gestión financiera: facturas, cierres de caja, pagos'
      }
    ]
  },
  apis: ['./src/controllers/**/*.ts', './src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
