import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/profile") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/profile/:path*", "/profile"],
};
