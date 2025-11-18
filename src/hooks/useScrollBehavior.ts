"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollBehavior {
  scrollDirection: "up" | "down" | null;
  isScrolled: boolean;
}

export function useScrollBehavior(threshold: number = 10): ScrollBehavior {
  const [_scrollY, setScrollY] = useState(0);
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
    scrollDirection,
    isScrolled: mounted ? isScrolled : false,
  };
}

export function useSectionSnap() {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      const sections = document.querySelectorAll("[data-section]");
      if (sections.length === 0) return;

      const direction = e.deltaY > 0 ? "down" : "up";

      let targetSection: Element | null = null;

      if (direction === "down") {
        for (let i = 0; i < sections.length; i++) {
          const section = sections.item(i);
          if (!section) continue;
          const rect = section.getBoundingClientRect();
          if (rect.top > window.innerHeight * 0.1) {
            targetSection = section;
            break;
          }
        }
      } else {
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections.item(i);
          if (!section) continue;
          const rect = section.getBoundingClientRect();
          if (rect.top < -window.innerHeight * 0.1) {
            targetSection = section;
            break;
          }
        }
      }

      if (targetSection) {
        e.preventDefault();
        isScrollingRef.current = true;

        const targetTop = (targetSection as HTMLElement).offsetTop;
        const startY = window.scrollY;
        const distance = targetTop - startY;
        const duration = 800;
        let startTime: number | null = null;

        const easeInOutCubic = (t: number): number => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animate = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = easeInOutCubic(progress);

          window.scrollTo(0, startY + distance * ease);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            isScrollingRef.current = false;
          }
        };

        requestAnimationFrame(animate);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, duration + 100);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
}
