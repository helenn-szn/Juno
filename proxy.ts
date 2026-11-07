// Runs before a page loads. Signed out → /app and /sponsor send you to Log in.
// Signed in → Create account and Log in send you to your dashboard.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session";

export function proxy(request: NextRequest) {
  const signedIn = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value) !== null;
  const { pathname } = request.nextUrl;

  if (!signedIn && (pathname.startsWith("/app") || pathname === "/sponsor")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (signedIn && (pathname === "/signup" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/sponsor", "/signup", "/login"],
};
