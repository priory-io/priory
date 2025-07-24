"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ButtonProps } from "~/types/components";
import { cn } from "~/lib/utils";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  href,
  target,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    outline:
      "border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-card/70 focus:ring-primary hover:shadow-lg hover:-translate-y-0.5",
    ghost: "text-foreground hover:bg-primary/5 focus:ring-primary",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-lg h-8 gap-1.5",
    md: "px-4 py-2 text-base rounded-xl h-10 gap-2",
    lg: "px-6 py-3 text-lg rounded-xl h-12 gap-2",
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
    >
      {content}
    </button>
  );
}
