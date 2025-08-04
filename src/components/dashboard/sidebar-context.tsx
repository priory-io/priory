"use client";

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authClient } from "~/lib/auth-client";

interface SidebarContextType {
  shouldAnimate: boolean;
  isAdmin: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const hasAnimatedRef = useRef(false);
  const adminCheckCacheRef = useRef<{
    userId: string;
    isAdmin: boolean;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: session } = authClient.useSession();

  const shouldAnimate = !hasAnimatedRef.current;

  if (shouldAnimate) {
    hasAnimatedRef.current = true;
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        if (adminCheckCacheRef.current?.userId === session.user.id) {
          setIsAdmin(adminCheckCacheRef.current.isAdmin);
          return;
        }

        try {
          const response = await fetch("/api/auth/admin-check");
          if (response.ok) {
            const data = await response.json();
            adminCheckCacheRef.current = {
              userId: session.user.id,
              isAdmin: data.isAdmin,
            };
            setIsAdmin(data.isAdmin);
          }
        } catch (error) {
          console.error("Failed to check admin status:", error);
        }
      }
    };

    checkAdminStatus();
  }, [session?.user?.id]);

  return (
    <SidebarContext.Provider value={{ shouldAnimate, isAdmin }}>
      {children}
    </SidebarContext.Provider>
  );
}
