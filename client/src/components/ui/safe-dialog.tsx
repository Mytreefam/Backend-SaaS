/**
 * 🛡️ SAFE DIALOG WRAPPER
 * Wrapper para Dialog que garantiza accesibilidad completa
 * Automáticamente añade DialogDescription si falta
 */

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
} from "./dialog";

interface SafeDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  children: React.ReactNode;
  /**
   * Si se proporciona, se asegura que exista un DialogDescription
   * Útil cuando el children no incluye un DialogDescription explícito
   */
  defaultDescription?: string;
}

/**
 * DialogContent seguro que garantiza tener un DialogDescription
 * Para evitar el warning: "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}"
 */
const SafeDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  SafeDialogContentProps
>(({ children, defaultDescription, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  
  // Verificar si ya existe un DialogDescription en los hijos
  const hasDescription = childrenArray.some((child) => {
    if (React.isValidElement(child) && typeof child.type !== 'string') {
      // Verificar en el DialogHeader
      if (child.type === DialogHeader) {
        const headerChildren = React.Children.toArray(child.props.children);
        return headerChildren.some((headerChild) => 
          React.isValidElement(headerChild) && 
          headerChild.type === DialogDescription
        );
      }
    }
    return false;
  });

  // Si no tiene descripción, añadir una por defecto
  const enhancedChildren = !hasDescription && defaultDescription ? (
    <>
      {childrenArray.map((child, index) => {
        if (React.isValidElement(child) && child.type === DialogHeader) {
          // Clonar el DialogHeader y añadir DialogDescription
          return React.cloneElement(
            child,
            { key: index },
            <>
              {child.props.children}
              <DialogDescription className="sr-only">
                {defaultDescription}
              </DialogDescription>
            </>
          );
        }
        return child;
      })}
    </>
  ) : (
    children
  );

  return (
    <DialogContent ref={ref} {...props}>
      {enhancedChildren}
    </DialogContent>
  );
});

SafeDialogContent.displayName = "SafeDialogContent";

export {
  Dialog,
  SafeDialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent, // Exportar el original también
};
