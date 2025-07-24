"use client";

import { useState, useEffect } from "react";

interface ScrollBehavior {
  scrollY: number;
  scrollDirection: "up" | "down" | null;
  isScrolled: boolean;
  isVisible: boolean;
}

export function useScrollBehavior(threshold: number = 10): ScrollBehavior {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let previousScrollY = 0;
    let ticking = false;

    const updateScrollInfo = () => {
      const currentScrollY = window.scrollY;

      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);

      if (currentScrollY > previousScrollY) {
        setScrollDirection("down");
        setIsVisible(currentScrollY < 100);
      } else {
        setScrollDirection("up");
        setIsVisible(true);
      }

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
    isScrolled,
    isVisible,
  };
}
