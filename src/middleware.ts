import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminRoles = new Set(["SUPER_ADMIN", "ADMIN", "OFFICE_MANAGER", "ACCOUNTANT", "SALES"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "development-secret-change-before-production" });

  if (!token) {
    if (pathname === "/admin") return NextResponse.next();
    const url = new URL("/admin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = String(token.role || "");
  if (!adminRoles.has(role)) {
    if (pathname === "/admin") return NextResponse.next();
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
