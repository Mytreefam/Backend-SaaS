# Estructura de Código Limpio - Taller 360

## 🏗️ Arquitectura del Proyecto

### Principios Aplicados

1. **Separación de Responsabilidades (SoC)**
   - Componentes de UI separados de lógica de negocio
   - Cada componente tiene una responsabilidad única
   - Estilos separados en Tailwind CSS

2. **DRY (Don't Repeat Yourself)**
   - Componentes reutilizables en `/components/ui`
   - Tipos compartidos en interfaces
   - Configuración centralizada

3. **KISS (Keep It Simple, Stupid)**
   - Componentes pequeños y enfocados
   - Lógica clara y directa
   - Sin abstracciones innecesarias

4. **Mobile-First Design**
   - Diseño optimizado para pantallas pequeñas
   - Progressive Enhancement
   - Touch-friendly (mínimo 48px)

---

## 📁 Estructura de Carpetas

```
/
├── components/
│   ├── GerenteDashboard.tsx       # Dashboard principal gerente
│   ├── TrabajadorDashboard.tsx    # Dashboard trabajador
│   ├── ClienteDashboard.tsx       # Dashboard cliente
│   ├── LoginView.tsx              # Autenticación
│   │
│   ├── gerente/                   # Módulos específicos gerente
│   │   ├── Dashboard360.tsx       # 11 componentes modulares
│   │   ├── OperativaGerente.tsx
│   │   ├── ClientesGerente.tsx
│   │   └── ...
│   │
│   ├── ui/                        # Componentes reutilizables (ShadCN)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   └── figma/
│       └── ImageWithFallback.tsx  # Componente de imagen optimizado
│
├── styles/
│   └── globals.css                # Estilos globales + variables CSS
│
├── public/
│   └── manifest.json              # PWA manifest
│
├── App.tsx                        # Punto de entrada
├── capacitor.config.example.json  # Configuración Capacitor
├── MOBILE_BUILD_GUIDE.md          # Guía de conversión APK
└── CODE_STRUCTURE.md              # Este documento
```

---

## 🎯 Patrones de Diseño Implementados

### 1. Component Pattern
Cada componente sigue la estructura:
```typescript
// Imports organizados
import { ... } from '...'

// Types/Interfaces
interface ComponentProps {
  // Props tipadas
}

// Component Function
export function Component({ props }: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()
  
  // 2. Funciones auxiliares
  const handleAction = () => {}
  
  // 3. Render
  return (
    // JSX
  )
}
```

### 2. Container/Presenter Pattern
- **Container**: GerenteDashboard (maneja estado, navegación)
- **Presenter**: Dashboard360, OperativaGerente (presentan datos)

### 3. Composition Pattern
Uso extensivo de composición sobre herencia:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

---

## 🔧 Convenciones de Código

### Naming Conventions

**Componentes:**
```typescript
// PascalCase para componentes
GerenteDashboard.tsx
Dashboard360.tsx
```

**Funciones:**
```typescript
// camelCase para funciones
handleMenuItemClick()
renderContent()
```

**Variables:**
```typescript
// camelCase para variables
const activeSection = 'dashboard'
const menuItems = [...]
```

**Constantes:**
```typescript
// UPPER_SNAKE_CASE para constantes globales
const API_BASE_URL = 'https://api.taller360.com'
const MAX_RETRIES = 3
```

**Interfaces:**
```typescript
// PascalCase con sufijo Props/Config
interface GerenteDashboardProps { }
interface MenuItem { }
```

### File Organization

**Imports Order:**
```typescript
// 1. External libraries
import { useState } from 'react'
import { Button } from './ui/button'

// 2. Internal components
import { Dashboard360 } from './gerente/Dashboard360'

// 3. Types
import type { User } from '../App'

// 4. Assets/Styles
import './styles.css'
```

---

## 📱 Mobile-First Código Limpio

### Responsive Design
```typescript
// ✅ BIEN: Mobile-first con grid responsive
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {/* Cards */}
</div>

// ❌ MAL: Desktop-first
<div className="grid grid-cols-4 sm:grid-cols-2">
  {/* Cards */}
</div>
```

### Touch-Friendly
```typescript
// ✅ BIEN: Botones grandes, active states
<Button className="h-12 active:scale-95">
  Acción
</Button>

// ❌ MAL: Botones pequeños
<Button className="h-6">
  Acción
</Button>
```

### Performance
```typescript
// ✅ BIEN: Renderizado condicional eficiente
{activeSection === 'dashboard' && <Dashboard360 />}

// ✅ BIEN: Keys únicas en listas
{items.map(item => (
  <Card key={item.id}>{item.name}</Card>
))}

// ❌ MAL: Index como key
{items.map((item, index) => (
  <Card key={index}>{item.name}</Card>
))}
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Best Practices

**Responsive:**
```typescript
// Mobile → Tablet → Desktop
<div className="p-4 md:p-6 lg:p-8">
```

**Colores Consistentes:**
```typescript
// Primary: Teal-600 (#0d9488)
className="bg-teal-600 hover:bg-teal-700"

// Success: Green
className="bg-green-600"

// Warning: Orange/Yellow
className="bg-orange-600"

// Error: Red
className="bg-red-600"
```

**Spacing:**
```typescript
// Usar escala consistente: 1, 2, 3, 4, 6, 8, 12, 16
gap-3  // 12px
p-4    // 16px
mb-6   // 24px
```

---

## 🔐 Type Safety

### TypeScript Strict Mode
```typescript
// Todas las props tipadas
interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Tipos exportados para reutilización
export type UserRole = 'cliente' | 'trabajador' | 'gerente' | null;

// Interfaces para objetos complejos
interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}
```

### Null Safety
```typescript
// ✅ BIEN: Optional chaining
const name = user?.name ?? 'Invitado'

// ✅ BIEN: Type guards
if (accionRapidaDialog) {
  toast.success(acciones[accionRapidaDialog])
}
```

---

## 🧪 Testing Ready Structure

### Componentes Testables
```typescript
// Funciones puras separadas (fáciles de testear)
const getAlertaColor = (tipo: string) => {
  switch (tipo) {
    case 'critica': return 'bg-red-50'
    case 'advertencia': return 'bg-yellow-50'
    default: return 'bg-gray-50'
  }
}

// Componentes con props claras
export function Dashboard360() {
  // Sin dependencias externas complejas
}
```

### Test Examples (para implementar)
```typescript
// tests/Dashboard360.test.tsx
describe('Dashboard360', () => {
  it('renders KPIs correctly', () => {
    render(<Dashboard360 />)
    expect(screen.getByText('MRR')).toBeInTheDocument()
  })
  
  it('displays alerts', () => {
    render(<Dashboard360 />)
    expect(screen.getByText('Alertas y Notificaciones')).toBeInTheDocument()
  })
})
```

---

## 🚀 Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy loading de rutas
const Dashboard360 = lazy(() => import('./gerente/Dashboard360'))

// Suspense boundary
<Suspense fallback={<Loading />}>
  <Dashboard360 />
</Suspense>
```

### 2. Memoization
```typescript
// Memo para prevenir re-renders innecesarios
const MenuItem = memo(({ item, onClick }) => {
  // Component
})

// useMemo para cálculos costosos
const filteredItems = useMemo(
  () => items.filter(item => item.active),
  [items]
)

// useCallback para funciones
const handleClick = useCallback(() => {
  // Handler
}, [dependencies])
```

### 3. Image Optimization
```typescript
// Component ImageWithFallback ya implementado
<ImageWithFallback
  src="url"
  alt="description"
  className="w-12 h-12 rounded-full"
/>
```

---

## 🔄 State Management

### Local State (useState)
```typescript
// Para UI state simple
const [menuOpen, setMenuOpen] = useState(false)
const [activeSection, setActiveSection] = useState('dashboard')
```

### Para Escalar (Context API o Zustand)
```typescript
// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null)

// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

## 📝 Documentation

### JSDoc Comments
```typescript
/**
 * Dashboard principal del gerente con 11 módulos
 * @param {User} user - Usuario autenticado
 * @param {() => void} onLogout - Función de logout
 */
export function GerenteDashboard({ user, onLogout }: GerenteDashboardProps) {
  // ...
}
```

### README Components
Cada carpeta de módulos debería tener:
```markdown
# Gerente Modules

## Dashboard360
Vista general con KPIs, SLA y alertas críticas

## OperativaGerente
Gestión de órdenes de servicio y calendario
```

---

## ✅ Code Quality Checklist

- [x] TypeScript strict mode
- [x] Componentes pequeños y enfocados
- [x] Props tipadas
- [x] Naming conventions consistentes
- [x] Mobile-first responsive
- [x] Accesibilidad (ARIA labels, min 48px)
- [x] Error boundaries (implementar)
- [x] Loading states (implementar)
- [x] Optimistic UI (implementar)
- [x] SEO meta tags (implementar)

---

## 🔮 Next Steps (Mejoras Recomendadas)

1. **State Management Global**
   - Implementar Context API o Zustand
   - Centralizar estado de autenticación

2. **API Layer**
   - Crear servicios para llamadas API
   - Implementar interceptors para tokens
   - Manejo de errores centralizado

3. **Testing**
   - Unit tests con Jest
   - Integration tests con React Testing Library
   - E2E tests con Playwright

4. **CI/CD**
   - GitHub Actions para builds automáticos
   - Automated testing en PRs
   - Deploy automático a Firebase/Vercel

5. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (Firebase, Mixpanel)
   - Performance monitoring (Lighthouse CI)

---

**Código Limpio = Código Mantenible** 🧹✨
