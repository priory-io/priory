"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useScrollBehavior } from "~/hooks/useScrollBehavior";

interface NavbarContainerProps {
  children: ReactNode;
}

export function NavbarContainer({ children }: NavbarContainerProps) {
  const { isScrolled, isVisible } = useScrollBehavior();

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          className={`transition-all duration-300 rounded-2xl ${
            isScrolled
              ? "bg-card/30 backdrop-blur-xl border border-border/50 shadow"
              : "bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            {children}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
