import { LayoutProps } from "~/types/components";
import { cn } from "~/lib/utils";

export default function Container({
  children,
  maxWidth = "xl",
  className,
}: LayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={cn("mx-auto px-4", maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
