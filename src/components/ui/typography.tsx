import { TypographyProps } from "~/types/components";
import { cn } from "~/lib/utils";

export default function Typography({
  children,
  variant = "p",
  className,
}: TypographyProps) {
  const variantClasses = {
    h1: "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight",
    h2: "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight",
    h3: "text-2xl md:text-3xl font-semibold tracking-tight leading-tight",
    h4: "text-xl md:text-2xl font-semibold tracking-tight leading-tight",
    h5: "text-lg md:text-xl font-semibold leading-tight",
    h6: "text-base md:text-lg font-semibold leading-tight",
    p: "text-base md:text-lg leading-relaxed",
    lead: "text-lg md:text-xl leading-relaxed text-muted-foreground",
    muted: "text-sm md:text-base text-muted-foreground leading-relaxed",
  };

  const Component =
    variant === "p" || variant === "lead" || variant === "muted"
      ? "p"
      : variant;

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
