import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isClient, isStaff } from "@/lib/roles";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && !isStaff(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal") && !isClient(role)) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/profile") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/brief") && !isClient(role)) {
    return NextResponse.redirect(new URL(role ? "/portal" : "/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/profile/:path*", "/profile", "/brief"],
};
