import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { 
  Search, 
  Filter, 
  FileDown,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  X
} from 'lucide-react';

interface TableFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  showExport?: boolean;
  resultCount?: number;
  totalCount?: number;
  onClearFilters?: () => void;
  showClearFilters?: boolean;
  children?: React.ReactNode;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function TableFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onExport,
  showExport = true,
  resultCount,
  totalCount,
  onClearFilters,
  showClearFilters = false,
  children
}: TableFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = filters.some(f => f.value !== 'todos' && f.value !== 'todas');

  return (
    <div className="space-y-3">
      {/* Fila principal de filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros adicionales */}
        {filters.length > 0 && (
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[120px]">
                <Filter className="w-4 h-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-teal-600 text-white rounded-full">
                    {filters.filter(f => f.value !== 'todos' && f.value !== 'todas').length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 space-y-3">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      {filter.label}
                    </label>
                    <Select value={filter.value} onValueChange={filter.onChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => {
                        filters.forEach(f => f.onChange('todos'));
                        setIsFilterOpen(false);
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Botón de exportar */}
        {showExport && onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('excel')}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                <FileText className="w-4 h-4 mr-2" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                <FileDown className="w-4 h-4 mr-2" />
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Contenido personalizado (botones adicionales) */}
        {children}
      </div>

      {/* Contador de resultados */}
      {(searchValue || hasActiveFilters || resultCount !== undefined) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {resultCount !== undefined && totalCount !== undefined && (
            <>
              <span className="font-medium">{resultCount}</span>
              <span>de</span>
              <span className="font-medium">{totalCount}</span>
              <span>resultados</span>
            </>
          )}
          {(searchValue || hasActiveFilters) && showClearFilters && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto text-xs h-7"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
