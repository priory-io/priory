"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
}

export function NavLink({ href, children, external = false }: NavLinkProps) {
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <motion.a
      {...linkProps}
      className="group relative text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2">{children}</div>
      <span className="absolute inset-x-3 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
    </motion.a>
  );
}
