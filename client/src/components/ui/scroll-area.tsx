import * as React from "react"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showScrollbar?: boolean;
}

export function ScrollArea({ children, className, showScrollbar = false, ...props }: ScrollAreaProps) {
  return (
    <div 
      className={`overflow-y-auto ${!showScrollbar ? 'scrollbar-hide' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
