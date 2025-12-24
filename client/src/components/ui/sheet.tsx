import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet")
  }
  return context
}

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open: controlledOpen, onOpenChange, children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const handleOpenChange = onOpenChange || setUncontrolledOpen

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

export function SheetTrigger({ asChild, children, ...props }: SheetTriggerProps) {
  const { onOpenChange } = useSheet()
  
  const handleClick = () => {
    onOpenChange(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        handleClick()
        if (children.props.onClick) {
          children.props.onClick(e)
        }
      }
    } as any)
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom"
  children: React.ReactNode
}

export function SheetContent({ 
  side = "right", 
  className, 
  children,
  ...props 
}: SheetContentProps) {
  const { open, onOpenChange } = useSheet()

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  const sideClasses = {
    right: "right-0 top-0 h-full w-full sm:max-w-md animate-slide-in-right",
    left: "left-0 top-0 h-full w-full sm:max-w-md animate-slide-in-left",
    top: "top-0 left-0 w-full h-auto max-h-[85vh] animate-slide-in-top",
    bottom: "bottom-0 left-0 w-full h-auto max-h-[85vh] animate-slide-in-bottom"
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sheet Content */}
      <div
        className={cn(
          "fixed z-50 bg-white shadow-xl",
          sideClasses[side],
          className
        )}
        {...props}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  )
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SheetHeader({ className, children, ...props }: SheetHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function SheetTitle({ className, children, ...props }: SheetTitleProps) {
  return (
    <h2
      className={cn("font-semibold text-lg", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function SheetDescription({ className, children, ...props }: SheetDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-gray-600", className)}
      {...props}
    >
      {children}
    </p>
  )
}
