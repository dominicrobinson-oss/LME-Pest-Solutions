import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminRoles = new Set(["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "development-secret-change-before-production" });

  if (!token) {
    const url = new URL("/customer-login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const role = String(token.role || "CUSTOMER");
  if (pathname.startsWith("/admin") && !adminRoles.has(role)) return NextResponse.rewrite(new URL("/not-found", request.url));
  if (pathname.startsWith("/technician") && role !== "TECHNICIAN" && !adminRoles.has(role)) return NextResponse.rewrite(new URL("/not-found", request.url));
  if (pathname.startsWith("/customer") && pathname !== "/customer-login" && role !== "CUSTOMER" && !adminRoles.has(role)) return NextResponse.rewrite(new URL("/not-found", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/customer/:path*", "/technician/:path*"],
};
