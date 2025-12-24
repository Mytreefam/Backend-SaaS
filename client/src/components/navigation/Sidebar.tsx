import { useState } from 'react';
import { 
  User, 
  ShoppingCart, 
  Home, 
  FileText, 
  Settings, 
  Users, 
  Package, 
  BarChart3, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Star,
  Gift,
  Receipt,
  Clock,
  Store,
  DollarSign,
  Menu,
  Search,
  X as CloseIcon,
  LucideIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getConfig } from '../../config/white-label.config';
import udarLogo from 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  submenu?: MenuItem[];
  tooltip?: string;
  onClick?: () => void;
}

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'purple' | 'orange';
  tooltip?: string;
}

interface SidebarProps {
  user: User;
  menuItems: MenuItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  roleLabel: string;
  avatarUrl?: string;
  primaryAction?: React.ReactNode; // Nuevo prop para botón primario
  quickActions?: QuickAction[]; // Botones de acceso rápido
}

export function Sidebar({
  user,
  menuItems,
  activeSection,
  onSectionChange,
  collapsed,
  onCollapsedChange,
  roleLabel,
  avatarUrl,
  primaryAction,
  quickActions
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedGroups.includes(item.id);

    const handleClick = () => {
      if (item.onClick) {
        // Si tiene onClick personalizado, ejecutarlo en lugar de cambiar sección
        item.onClick();
      } else if (hasSubmenu) {
        toggleGroup(item.id);
      } else {
        onSectionChange(item.id);
      }
    };

    if (collapsed && !isSubmenu) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleClick}
                className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors relative min-h-[44px] ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.tooltip || item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div key={item.id}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleClick}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${isSubmenu ? 'pl-12' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
                {hasSubmenu && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>
            </TooltipTrigger>
            {item.tooltip && !collapsed && (
              <TooltipContent side="right">
                <p>{item.tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {hasSubmenu && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.submenu!.map(subItem => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Header - Logo */}
      <div className={`p-4 border-b shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`shrink-0 ${collapsed ? 'w-10 h-10' : 'w-12 h-12'} bg-white rounded-lg flex items-center justify-center p-1.5 border border-gray-200 shadow-sm`}>
            <img
              src={udarLogo}
              alt={getConfig().appName}
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {getConfig().appName}
              </h2>
              <p className="text-gray-500 text-xs">{getConfig().tagline}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSectionChange('perfil')}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative shrink-0">
                  <ImageWithFallback
                    src={avatarUrl || "https://images.unsplash.com/photo-1755519024827-fd05075a7200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHByb2ZpbGUlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjMwNjI1MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                {!collapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-gray-900 truncate text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {user.name}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{roleLabel}</p>
                  </div>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>{user.name} - {roleLabel}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      )}

      {/* Primary Action Button - Between Search and Menu */}
      {primaryAction && !collapsed && (
        <div className="px-4 pb-4 shrink-0">
          {primaryAction}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && !collapsed && (
        <div className="px-4 pb-4 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const colorClasses = action.variant === 'primary' 
                ? 'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-sm'
                : action.variant === 'secondary'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm'
                : action.variant === 'success'
                ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm'
                : action.variant === 'warning'
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-sm'
                : action.variant === 'purple'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-sm'
                : action.variant === 'orange'
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm'
                : 'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-sm';
              
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={action.onClick}
                        className={`${colorClasses} rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md aspect-square min-h-[80px]`}
                      >
                        <action.icon className="w-6 h-6" />
                        <span className="text-xs text-center leading-tight">{action.label}</span>
                      </button>
                    </TooltipTrigger>
                    {action.tooltip && (
                      <TooltipContent side="right">
                        <p>{action.tooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}

      {/* Menu Items - Scrollable */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems
            .filter(item => 
              !searchQuery || 
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(item => renderMenuItem(item))
          }
        </div>
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t shrink-0 hidden xl:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapsedChange(!collapsed)}
          className="w-full flex items-center justify-center gap-2"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}