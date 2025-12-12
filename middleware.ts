import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("firebase-token")?.value;
  const url = req.nextUrl.clone();

  // DO NOT redirect these paths
  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/phone",
    "/auth/setup",
    "/permissions",
  ];

  // Ignore Next.js static files & assets
  if (
    url.pathname.startsWith("/_next") ||       // Next.js build files
    url.pathname.startsWith("/static") ||      // static folder
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.startsWith("/assets") ||
    url.pathname.startsWith("/api") ||
    url.pathname.match(/\.(jpg|jpeg|png|svg|webp|gif|ico)$/) // ← IMPORTANT FIX
  ) {
    return NextResponse.next();
  }

  // Allow access to auth pages without login
  if (publicPaths.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no token -> redirect to login
  if (!token) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|assets|favicon.ico).*)"],
};
