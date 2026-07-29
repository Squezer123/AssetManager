import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
  const isProtectedApi = req.nextUrl.pathname.startsWith("/api/equipment");

  if (isAdminPage && (!isLoggedIn || !isAdmin)) {
    const loginUrl = new URL("/", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedApi && (!isLoggedIn || !isAdmin)) {
    return NextResponse.json(
      { error: "Brak autoryzacji" },
      { status: 401 }
    );
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/equipment/:path*"],
};