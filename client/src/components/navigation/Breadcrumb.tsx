import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 overflow-x-auto">
      <Home className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className={`${index === items.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-600'} truncate max-w-[100px] sm:max-w-none`}>
            {item.label}
          </span>
        </div>
      ))}
    </nav>
  );
}
