import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground border border-transparent",
    destructive: "bg-destructive-soft text-destructive-foreground border border-destructive/20",
    outline: "text-foreground border border-border bg-card",
    success: "bg-success-soft text-success-foreground border border-success/30",
    warning: "bg-warning-soft text-warning-foreground border border-warning/30",
    info: "bg-info-soft text-info-foreground border border-info/30",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
