"use client";

import { usePathname } from "next/navigation";
import Navbar from "~/components/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isProtected = pathname.startsWith("/protected/");
  const isAuth = pathname.startsWith("/auth/");
  const isQRUpload = pathname === "/qr-upload";

  if (isDashboard || isProtected || isAuth || isQRUpload) {
    return null;
  }

  return <Navbar />;
}
