"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Hide navbar on ALL auth routes
  const hideOnAuth = pathname.startsWith("/auth");

  if (hideOnAuth) return null;

  return <Navbar />;
}
