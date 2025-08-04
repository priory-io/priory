import { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  href?: string;
  target?: string;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export interface TypographyProps {
  children: ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "lead" | "muted";
  className?: string;
}

export interface IconProps {
  className?: string;
  size?: number;
}

export interface LayoutProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

export interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}
