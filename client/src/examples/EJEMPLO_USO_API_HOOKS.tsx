/**
 * 📝 EJEMPLO DE USO - Hooks de API
 * 
 * Ejemplos de cómo usar los hooks useQuery y useMutation
 * para conectar componentes con el backend
 */

import { useQuery, useMutation } from '../hooks/useApi';
import { clientesApi, pedidosApi, productosApi } from '../services/api';

// ============================================================================
// EJEMPLO 1: OBTENER DATOS (useQuery)
// ============================================================================

function MisPedidosComponent({ clienteId }: { clienteId: string }) {
  // Query simple - se ejecuta automáticamente al montar
  const {
    data: pedidos,
    loading,
    error,
    refetch,
  } = useQuery(
    () => clientesApi.getPedidos(clienteId),
    {
      showErrorToast: true,
    }
  );

  if (loading) return <div>Cargando pedidos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Actualizar</button>
      {pedidos?.map((pedido) => (
        <div key={pedido.id}>{pedido.numero}</div>
      ))}
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: CREAR/ACTUALIZAR DATOS (useMutation)
// ============================================================================

function CrearPedidoComponent() {
  const { mutate, loading, error, isSuccess } = useMutation(
    (data: any) => pedidosApi.create(data),
    {
      showSuccessToast: true,
      successMessage: '¡Pedido creado correctamente!',
      onSuccess: (pedido) => {
        console.log('Pedido creado:', pedido);
        // Redirigir o hacer algo con el pedido
      },
    }
  );

  const handleCrearPedido = () => {
    mutate({
      clienteId: 1,
      items: [
        { productoId: 1, cantidad: 2, precio: 10.5 },
      ],
      total: 21.0,
    });
  };

  return (
    <div>
      <button onClick={handleCrearPedido} disabled={loading}>
        {loading ? 'Creando...' : 'Crear Pedido'}
      </button>
      {isSuccess && <p>✅ Pedido creado con éxito</p>}
      {error && <p>❌ Error: {error.message}</p>}
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: QUERY CONDICIONAL
// ============================================================================

function ProductoDetalleComponent({ productoId }: { productoId?: string }) {
  const {
    data: producto,
    loading,
  } = useQuery(
    () => productosApi.getById(productoId!),
    {
      enabled: !!productoId, // Solo ejecutar si hay productoId
    }
  );

  if (!productoId) return <div>Selecciona un producto</div>;
  if (loading) return <div>Cargando...</div>;

  return <div>{producto?.nombre}</div>;
}

// ============================================================================
// EJEMPLO 4: MÚLTIPLES MUTACIONES
// ============================================================================

function ActualizarPerfilComponent({ clienteId }: { clienteId: string }) {
  const actualizarPerfil = useMutation(
    (data: any) => clientesApi.update(clienteId, data),
    {
      showSuccessToast: true,
      successMessage: 'Perfil actualizado',
    }
  );

  const eliminarCuenta = useMutation(
    () => clientesApi.delete(clienteId),
    {
      showSuccessToast: true,
      successMessage: 'Cuenta eliminada',
      onSuccess: () => {
        // Redirigir al login
      },
    }
  );

  return (
    <div>
      <button onClick={() => actualizarPerfil.mutate({ nombre: 'Nuevo nombre' })}>
        Actualizar Perfil
      </button>
      <button onClick={() => eliminarCuenta.mutate(undefined)}>
        Eliminar Cuenta
      </button>
    </div>
  );
}

// Exportar para que TypeScript no se queje
export {
  MisPedidosComponent,
  CrearPedidoComponent,
  ProductoDetalleComponent,
  ActualizarPerfilComponent,
};
