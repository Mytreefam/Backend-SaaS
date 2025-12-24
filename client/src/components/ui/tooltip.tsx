import * as React from "react"

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function TooltipProvider({ children }: TooltipProps) {
  return <>{children}</>;
}

export function Tooltip({ children }: TooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
    </div>
  );
}

export function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  return <div className="inline-block">{children}</div>;
}

export function TooltipContent({ children, side = "top", align = "center" }: TooltipContentProps) {
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  const alignClasses = {
    start: side === "top" || side === "bottom" ? "left-0" : "top-0",
    center: side === "top" || side === "bottom" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0" : "bottom-0",
  };

  return (
    <div
      className={`
        absolute ${positionClasses[side]} ${alignClasses[align]}
        z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-opacity duration-200 whitespace-nowrap pointer-events-none
      `}
    >
      {children}
    </div>
  );
}
