"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useScrollBehavior } from "~/hooks/useScrollBehavior";

interface NavbarContainerProps {
  children: ReactNode;
}

export function NavbarContainer({ children }: NavbarContainerProps) {
  const { isScrolled, scrollY } = useScrollBehavior();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ opacity: 0, y: -100 }}
      animate={{ 
        opacity: 1,
        y: 0
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          className="rounded-xl mx-auto"
          animate={{
            backgroundColor: isScrolled 
              ? "hsl(var(--card) / 0.8)"
              : "transparent",
            backdropFilter: isScrolled ? "blur(5px)" : "blur(0px)",
            scale: isScrolled ? 0.98 : 1,
            maxWidth: isScrolled ? "1024px" : "1280px"
          }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            backgroundColor: { duration: 0.4 },
            backdropFilter: { duration: 0.4 },
            scale: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
            maxWidth: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
          }}
          style={{
            boxShadow: isScrolled
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              : "none"
          }}
        >
          <motion.div 
            className="flex items-center justify-between px-6"
            animate={{
              paddingTop: isScrolled ? "12px" : "16px",
              paddingBottom: isScrolled ? "12px" : "16px"
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
