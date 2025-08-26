"use client";

import { useState, useEffect } from "react";

interface ScrollBehavior {
  scrollY: number;
  scrollDirection: "up" | "down" | null;
  isScrolled: boolean;
}

export function useScrollBehavior(threshold: number = 10): ScrollBehavior {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let previousScrollY = 0;
    let ticking = false;

    const updateScrollInfo = () => {
      const currentScrollY = window.scrollY;

      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);

      const direction = currentScrollY > previousScrollY ? "down" : "up";
      setScrollDirection(direction);

      previousScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollInfo);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    updateScrollInfo();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return {
    scrollY,
    scrollDirection,
    isScrolled: mounted ? isScrolled : false,
  };
}
