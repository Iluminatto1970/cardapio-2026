import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const PROTECTED_ROUTES = ["/app/dashboard", "/app/cardapio", "/app/config", "/app/tenants"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isLoginPage = pathname === "/app/login";

  if (isProtectedRoute) {
    const authCookie = request.cookies.get("admin_auth");

    if (authCookie?.value !== ADMIN_PASSWORD) {
      const loginUrl = new URL("/app/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginPage) {
    const authCookie = request.cookies.get("admin_auth");
    if (authCookie?.value === ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
