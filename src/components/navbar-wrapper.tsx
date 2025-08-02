"use client";

import { usePathname } from "next/navigation";
import Navbar from "~/components/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isProtected = pathname.startsWith("/protected/");

  if (isDashboard || isProtected) {
    return null;
  }

  return <Navbar />;
}
