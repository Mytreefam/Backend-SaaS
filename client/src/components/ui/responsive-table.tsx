import { ReactNode } from 'react';
import { Card, CardContent } from './card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

/**
 * ResponsiveTable - Componente reutilizable que muestra tablas en desktop y cards en móvil
 * 
 * Uso:
 * <ResponsiveTable
 *   headers={['Nombre', 'Email', 'Estado']}
 *   data={usuarios}
 *   renderDesktopRow={(usuario) => (
 *     <TableRow key={usuario.id}>
 *       <TableCell>{usuario.nombre}</TableCell>
 *       <TableCell>{usuario.email}</TableCell>
 *       <TableCell>{usuario.estado}</TableCell>
 *     </TableRow>
 *   )}
 *   renderMobileCard={(usuario) => (
 *     <Card key={usuario.id}>
 *       <CardContent>
 *         <p>{usuario.nombre}</p>
 *         <p>{usuario.email}</p>
 *       </CardContent>
 *     </Card>
 *   )}
 *   emptyMessage="No hay usuarios"
 * />
 */

interface ResponsiveTableProps<T> {
  // Headers para la vista desktop
  headers: string[];
  // Datos a renderizar
  data: T[];
  // Función para renderizar cada fila en desktop
  renderDesktopRow: (item: T, index: number) => ReactNode;
  // Función para renderizar cada card en móvil
  renderMobileCard: (item: T, index: number) => ReactNode;
  // Mensaje cuando no hay datos
  emptyMessage?: string;
  // Icono para el estado vacío (componente)
  emptyIcon?: ReactNode;
  // Breakpoint para cambiar de vista (default: lg)
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveTable<T>({
  headers,
  data,
  renderDesktopRow,
  renderMobileCard,
  emptyMessage = 'No hay datos disponibles',
  emptyIcon,
  breakpoint = 'lg'
}: ResponsiveTableProps<T>) {
  const breakpointClass = breakpoint === 'sm' ? 'sm:hidden' :
                          breakpoint === 'md' ? 'md:hidden' :
                          breakpoint === 'lg' ? 'lg:hidden' :
                          'xl:hidden';
  
  const breakpointShow = breakpoint === 'sm' ? 'hidden sm:block' :
                         breakpoint === 'md' ? 'hidden md:block' :
                         breakpoint === 'lg' ? 'hidden lg:block' :
                         'hidden xl:block';

  const isEmpty = !data || data.length === 0;

  // Vista vacía compartida
  const EmptyState = () => (
    <Card>
      <CardContent className="py-12 text-center text-gray-500">
        {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
        <p>{emptyMessage}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Vista Móvil - Cards */}
      <div className={`${breakpointClass} space-y-3`}>
        {isEmpty ? (
          <EmptyState />
        ) : (
          data.map((item, index) => renderMobileCard(item, index))
        )}
      </div>

      {/* Vista Desktop/Tablet - Tabla */}
      <Card className={breakpointShow}>
        <CardContent className="p-0">
          {isEmpty ? (
            <div className="py-12 text-center text-gray-500">
              {emptyIcon && <div className="mb-3 flex justify-center">{emptyIcon}</div>}
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => renderDesktopRow(item, index))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
