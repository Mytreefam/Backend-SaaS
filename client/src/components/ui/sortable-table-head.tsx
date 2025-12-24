import { TableHead } from './table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableTableHeadProps {
  column: string;
  label: string;
  currentSort?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  onSort: (column: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SortableTableHead({
  column,
  label,
  currentSort,
  onSort,
  align = 'left',
  className = ''
}: SortableTableHeadProps) {
  const isActive = currentSort?.column === column;
  const direction = currentSort?.direction;

  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <TableHead className={`text-xs ${className}`}>
      <button
        onClick={() => onSort(column)}
        className={`flex items-center gap-1 hover:text-teal-600 transition-colors w-full ${alignClass}`}
      >
        <span>{label}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ChevronUp className="w-3 h-3 text-teal-600" />
          ) : (
            <ChevronDown className="w-3 h-3 text-teal-600" />
          )
        ) : (
          <ChevronsUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
        )}
      </button>
    </TableHead>
  );
}
